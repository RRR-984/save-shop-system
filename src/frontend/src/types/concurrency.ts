/**
 * Shared TypeScript types for the concurrency / multi-user system.
 * All hooks and utilities in hooks/useLockManager.ts, hooks/usePeriodicSync.ts,
 * hooks/useSessionHeartbeat.ts, utils/requestQueue.ts, and utils/idempotency.ts
 * import from this file.
 */

// ─── Pessimistic Locking ──────────────────────────────────────────────────────

/** A record that describes a currently held lock on a backend entity. */
export interface LockRecord {
  /** Unique lock identifier (usually `${recordType}:${recordId}`) */
  lockId: string;
  /** The ID of the entity being locked (product id, invoice id, etc.) */
  recordId: string;
  /** Type of entity (product | invoice | customer | vendor | staff | batch) */
  recordType: string;
  /** User ID of the lock holder */
  userId: string;
  /** Display name of the lock holder — shown in conflict messages */
  userName: string;
  /** ISO timestamp when the lock was acquired */
  acquiredAt: string;
  /** ISO timestamp when the lock expires if not heartbeated */
  expiresAt: string;
  /** Shop that owns this lock */
  shopId: string;
}

/** Result returned by acquireLock() */
export type LockResult =
  | {
      /** Lock successfully acquired — callers may proceed with the edit */
      status: "acquired";
      lock: LockRecord;
    }
  | {
      /** Another user holds the lock — callers should show a warning */
      status: "conflict";
      /** The existing lock held by another user */
      existingLock: LockRecord;
    };

// ─── Idempotency ─────────────────────────────────────────────────────────────

/** A record that tracks a processed idempotency key to prevent duplicate saves. */
export interface IdempotencyRecord {
  /** Deterministic key derived from shopId + operation type + payload hash */
  key: string;
  /** When this key was first registered (ms since epoch) */
  registeredAt: number;
  /** Expiry time in ms since epoch — keys auto-expire after 24 h */
  expiresAt: number;
  /** The operation type this key belongs to (invoice | payment | stock_in | etc.) */
  operationType: string;
}

// ─── Active User Tracking ─────────────────────────────────────────────────────

/** Represents a user with an active session (for concurrent-user awareness). */
export interface ActiveUserRecord {
  /** User ID */
  userId: string;
  /** Display name */
  userName: string;
  /** Shop the user is working in */
  shopId: string;
  /** ISO timestamp of last heartbeat */
  lastHeartbeat: string;
  /** Page / section the user last interacted with (optional) */
  activePage?: string;
}

// ─── Concurrency Settings ─────────────────────────────────────────────────────

/**
 * Feature flag + tuning knobs for the concurrency system.
 * Read from AppConfig; defaults applied when not set.
 */
export interface ConcurrencySettings {
  /** Master switch — when false all concurrency hooks are no-ops */
  enabled: boolean;
  /** Seconds after which an unheartbeated lock is considered stale (default 90) */
  lockTtlSeconds: number;
  /** Interval in seconds between lock heartbeats (default 30) */
  lockHeartbeatIntervalSeconds: number;
  /** Interval in seconds between periodic remote data pulls (default 15) */
  periodicSyncIntervalSeconds: number;
  /** Jitter range in milliseconds added to periodic sync interval (default ±2000) */
  periodicSyncJitterMs: number;
  /** Seconds of inactivity before session expiry warning (default 900 = 15 min) */
  sessionIdleTimeoutSeconds: number;
  /** Max concurrent requests per shop per second (default 2) */
  maxRequestsPerSecond: number;
}

export const DEFAULT_CONCURRENCY_SETTINGS: ConcurrencySettings = {
  enabled: true,
  lockTtlSeconds: 90,
  lockHeartbeatIntervalSeconds: 30,
  periodicSyncIntervalSeconds: 15,
  periodicSyncJitterMs: 2000,
  sessionIdleTimeoutSeconds: 900,
  maxRequestsPerSecond: 2,
};

// ─── Periodic Sync State ──────────────────────────────────────────────────────

/** State exposed by usePeriodicSync */
export interface PeriodicSyncState {
  /** Timestamp of the last successful remote data pull, or null if never synced */
  lastSyncAt: Date | null;
  /** true while a sync cycle is in flight */
  isSyncing: boolean;
}

// ─── Request Queue ────────────────────────────────────────────────────────────

/** Priority levels for the request queue */
export type RequestPriority = "high" | "normal" | "low";

/** A queued request entry waiting to be dispatched */
export interface QueuedRequest<T = unknown> {
  /** Unique entry ID */
  id: string;
  /** The async function to execute */
  fn: () => Promise<T>;
  /** Execution priority — high items run before normal/low */
  priority: RequestPriority;
  /** When the entry was enqueued (ms since epoch) */
  enqueuedAt: number;
  /** Resolve callback — called with the result when fn completes */
  resolve: (value: T) => void;
  /** Reject callback — called if fn throws */
  reject: (reason: unknown) => void;
}
