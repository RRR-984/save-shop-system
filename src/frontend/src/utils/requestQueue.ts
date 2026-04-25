/**
 * Rate-limited request queue for backend API calls.
 *
 * Rules:
 *  - Max 2 requests / second per shop (sliding window)
 *  - Excess requests are queued with jitter backoff (100 ms → 5 s)
 *  - Batch mode: save operations arriving within a 200 ms window are merged
 *    into a single backend call before dispatch
 *  - Low-bandwidth / slow-network friendly: conservative defaults, small jitter
 */

import type { QueuedRequest, RequestPriority } from "../types/concurrency";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_RPS = 2; // max requests per second
const WINDOW_MS = 1000; // sliding window size
const BATCH_COLLECT_MS = 200; // collect saves for this many ms before flushing
const JITTER_BASE_MS = 100; // initial backoff
const JITTER_CAP_MS = 5000; // max backoff
const JITTER_FACTOR = 2; // exponential growth factor

// ─── State ────────────────────────────────────────────────────────────────────

/** Timestamps of recent dispatches (used for sliding-window rate limiting). */
const dispatchLog: number[] = [];

/** The main pending queue — sorted by priority then enqueue time. */
const queue: QueuedRequest[] = [];

/** Whether the drain loop is already scheduled. */
let draining = false;

/** Current backoff delay for the next retry cycle (ms). */
let currentBackoffMs = JITTER_BASE_MS;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateQueueId(): string {
  return `rq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Returns true when we are under the rate limit.
 * Prunes timestamps older than the sliding window first.
 */
function canDispatch(): boolean {
  const now = Date.now();
  // Remove entries outside the sliding window
  while (dispatchLog.length > 0 && dispatchLog[0] < now - WINDOW_MS) {
    dispatchLog.shift();
  }
  return dispatchLog.length < MAX_RPS;
}

/** Record a dispatch event in the sliding window log. */
function recordDispatch(): void {
  dispatchLog.push(Date.now());
}

/**
 * Add a small random jitter to a delay so that concurrent clients
 * do not hammer the backend at exactly the same moment.
 */
function withJitter(delayMs: number): number {
  const jitter = Math.random() * 0.2 * delayMs; // ±10% of delay
  return Math.min(delayMs + jitter, JITTER_CAP_MS);
}

/** Sort in-place: high > normal > low, then FIFO within same priority. */
function sortQueue(): void {
  const order: Record<RequestPriority, number> = { high: 0, normal: 1, low: 2 };
  queue.sort((a, b) => {
    const pd = order[a.priority] - order[b.priority];
    return pd !== 0 ? pd : a.enqueuedAt - b.enqueuedAt;
  });
}

// ─── Drain loop ───────────────────────────────────────────────────────────────

async function drainQueue(): Promise<void> {
  if (queue.length === 0) {
    draining = false;
    currentBackoffMs = JITTER_BASE_MS; // reset backoff when queue empties
    return;
  }

  if (!canDispatch()) {
    // Back off and retry
    const delay = withJitter(currentBackoffMs);
    currentBackoffMs = Math.min(
      currentBackoffMs * JITTER_FACTOR,
      JITTER_CAP_MS,
    );
    draining = true;
    setTimeout(() => void drainQueue(), delay);
    return;
  }

  // Reset backoff on successful slot
  currentBackoffMs = JITTER_BASE_MS;

  sortQueue();
  const entry = queue.shift();
  if (!entry) {
    draining = false;
    return;
  }

  recordDispatch();

  try {
    const result = await entry.fn();
    entry.resolve(result);
  } catch (err) {
    entry.reject(err);
  }

  // Continue draining — schedule next tick to avoid deep recursion
  if (queue.length > 0) {
    draining = true;
    setTimeout(() => void drainQueue(), 0);
  } else {
    draining = false;
  }
}

function ensureDraining(): void {
  if (!draining) {
    draining = true;
    // Defer to next microtask so batch collection has time to accumulate
    Promise.resolve().then(() => void drainQueue());
  }
}

// ─── Batch collection for save operations ────────────────────────────────────

interface BatchEntry {
  fn: () => Promise<unknown>;
  resolve: (v: unknown) => void;
  reject: (e: unknown) => void;
}

const batchBuffer: Map<string, BatchEntry[]> = new Map();
const batchTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

/**
 * Enqueue a save operation in a named batch bucket.
 * All calls with the same `batchKey` arriving within BATCH_COLLECT_MS
 * are merged: only the LAST fn in the window is actually executed,
 * and all callers share its resolve/reject outcome.
 *
 * This is appropriate for "save entire collection" patterns where
 * only the most recent snapshot matters.
 */
export function enqueueBatchedSave<T>(
  batchKey: string,
  fn: () => Promise<T>,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const entry: BatchEntry = {
      fn: fn as () => Promise<unknown>,
      resolve: resolve as (v: unknown) => void,
      reject,
    };

    const existing = batchBuffer.get(batchKey) ?? [];
    existing.push(entry);
    batchBuffer.set(batchKey, existing);

    // Reset the flush timer
    const existing_timer = batchTimers.get(batchKey);
    if (existing_timer) clearTimeout(existing_timer);

    const timer = setTimeout(() => {
      const entries = batchBuffer.get(batchKey) ?? [];
      batchBuffer.delete(batchKey);
      batchTimers.delete(batchKey);

      if (entries.length === 0) return;

      // Only execute the last fn — it represents the latest state
      const last = entries[entries.length - 1];

      void enqueueRequest(last.fn as () => Promise<unknown>, "normal")
        .then((result) => {
          // Resolve all waiters with the same result
          for (const e of entries) e.resolve(result);
        })
        .catch((err) => {
          for (const e of entries) e.reject(err);
        });
    }, BATCH_COLLECT_MS);

    batchTimers.set(batchKey, timer);
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Enqueue an arbitrary async function for rate-limited execution.
 *
 * @param fn       The async operation to execute.
 * @param priority Execution priority (default "normal").
 * @returns        A Promise that resolves/rejects with fn's outcome.
 */
export function enqueueRequest<T>(
  fn: () => Promise<T>,
  priority: RequestPriority = "normal",
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const entry: QueuedRequest<T> = {
      id: generateQueueId(),
      fn,
      priority,
      enqueuedAt: Date.now(),
      resolve,
      reject,
    };
    queue.push(entry as QueuedRequest);
    ensureDraining();
  });
}

/**
 * Immediately flush the queue without rate limiting.
 * Intended for use on app visibility change (tab becomes active) or
 * before critical operations that must not be delayed.
 */
export async function flushQueue(): Promise<void> {
  // Clear batch timers and flush their pending entries immediately
  for (const [key, timer] of batchTimers.entries()) {
    clearTimeout(timer);
    batchTimers.delete(key);
    const entries = batchBuffer.get(key) ?? [];
    batchBuffer.delete(key);
    if (entries.length === 0) continue;
    const last = entries[entries.length - 1];
    try {
      const result = await last.fn();
      for (const e of entries) e.resolve(result);
    } catch (err) {
      for (const e of entries) e.reject(err);
    }
  }

  // Drain remaining queue ignoring rate limits
  sortQueue();
  while (queue.length > 0) {
    const entry = queue.shift();
    if (!entry) break;
    try {
      const result = await entry.fn();
      entry.resolve(result);
    } catch (err) {
      entry.reject(err);
    }
  }
  draining = false;
}

/** Returns the number of requests currently waiting in the queue. */
export function getQueueDepth(): number {
  return queue.length;
}
