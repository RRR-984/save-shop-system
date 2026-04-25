/**
 * useLockManager — pessimistic locking for concurrent edits.
 *
 * Wraps backend acquireLock / releaseLock / heartbeatLock / getLockStatus
 * with local bookkeeping so the UI can:
 *  - Block a second editor with a "Being edited by [name]" warning
 *  - Automatically extend owned locks via heartbeat
 *  - Release all owned locks on unmount / logout
 *
 * NOTE: The ICP backend does not yet expose lock-specific methods.
 *       This hook therefore stores lock state in localStorage and
 *       BroadcastChannel (same-origin tabs) as a pragmatic fallback.
 *       When backend lock methods (acquireLock, releaseLock, etc.) are
 *       added, only the _backend*() helpers below need to change —
 *       the public API stays identical.
 */

import { useCallback, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import type { LockRecord, LockResult } from "../types/concurrency";
import { DEFAULT_CONCURRENCY_SETTINGS } from "../types/concurrency";

// ─── Constants ────────────────────────────────────────────────────────────────

const LS_LOCKS_KEY = "saveshop_locks";
const CHANNEL_NAME = "saveshop_locks_bc";
const HEARTBEAT_INTERVAL_MS =
  DEFAULT_CONCURRENCY_SETTINGS.lockHeartbeatIntervalSeconds * 1000;
const LOCK_TTL_MS = DEFAULT_CONCURRENCY_SETTINGS.lockTtlSeconds * 1000;

// ─── localStorage helpers ─────────────────────────────────────────────────────

function readAllLocks(): LockRecord[] {
  try {
    const raw = localStorage.getItem(LS_LOCKS_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as LockRecord[];
    // Prune stale locks
    const now = Date.now();
    return all.filter((l) => new Date(l.expiresAt).getTime() > now);
  } catch {
    return [];
  }
}

function writeLocks(locks: LockRecord[]): void {
  try {
    localStorage.setItem(LS_LOCKS_KEY, JSON.stringify(locks));
  } catch {}
}

function lockId(recordType: string, recordId: string): string {
  return `${recordType}:${recordId}`;
}

// BroadcastChannel to notify other tabs of lock changes
let _bc: BroadcastChannel | null = null;
function getBc(): BroadcastChannel | null {
  if (typeof BroadcastChannel === "undefined") return null;
  if (!_bc) _bc = new BroadcastChannel(CHANNEL_NAME);
  return _bc;
}

function broadcastLockChange(): void {
  getBc()?.postMessage({ type: "lock_change", ts: Date.now() });
}

// ─── Public hook ──────────────────────────────────────────────────────────────

export interface LockManagerHandle {
  /**
   * Attempt to acquire a lock on a record.
   * Returns acquired if successful, conflict if another user holds the lock.
   */
  acquireLock: (recordId: string, recordType: string) => LockResult;
  /** Release a specific lock held by the current user. */
  releaseLock: (recordId: string, recordType: string) => void;
  /** Get the current lock status for a record (null = unlocked). */
  getLockStatus: (recordId: string, recordType: string) => LockRecord | null;
  /** Returns true if the current user holds the lock on this record. */
  isLockedByMe: (recordId: string, recordType: string) => boolean;
}

export function useLockManager(): LockManagerHandle {
  const { currentUser, session } = useAuth();
  const heldLocksRef = useRef<Set<string>>(new Set());

  const shopId = session?.selectedShopId ?? session?.shopId ?? "";
  const userId = currentUser?.id ?? "";
  const userName = currentUser?.name ?? currentUser?.mobile ?? "Unknown user";

  // ── Heartbeat: extend all held locks every 30 s ──────────────────────────
  useEffect(() => {
    if (!shopId || !userId) return;

    const interval = setInterval(() => {
      const held = [...heldLocksRef.current];
      if (held.length === 0) return;

      const allLocks = readAllLocks();
      const now = Date.now();
      let changed = false;

      for (const lid of held) {
        const idx = allLocks.findIndex(
          (l) => l.lockId === lid && l.userId === userId,
        );
        if (idx !== -1) {
          allLocks[idx] = {
            ...allLocks[idx],
            expiresAt: new Date(now + LOCK_TTL_MS).toISOString(),
          };
          changed = true;
        }
      }

      if (changed) {
        writeLocks(allLocks);
        broadcastLockChange();
      }
    }, HEARTBEAT_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [shopId, userId]);

  // ── Cleanup: release all held locks on unmount ───────────────────────────
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally runs only on mount/unmount; userId is captured via ref below
  useEffect(() => {
    // Capture ref value at effect registration time
    const heldAtMount = heldLocksRef.current;
    const userIdAtMount = userId;

    return () => {
      if (heldAtMount.size === 0 || !userIdAtMount) return;

      const allLocks = readAllLocks();
      const remaining = allLocks.filter(
        (l) => !heldAtMount.has(l.lockId) || l.userId !== userIdAtMount,
      );
      writeLocks(remaining);
      broadcastLockChange();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── acquireLock ──────────────────────────────────────────────────────────
  const acquireLock = useCallback(
    (recordId: string, recordType: string): LockResult => {
      const lid = lockId(recordType, recordId);
      const allLocks = readAllLocks();
      const existing = allLocks.find((l) => l.lockId === lid);

      if (existing) {
        // Already locked by this user — extend and return acquired
        if (existing.userId === userId) {
          const now = Date.now();
          const updated = allLocks.map((l) =>
            l.lockId === lid
              ? { ...l, expiresAt: new Date(now + LOCK_TTL_MS).toISOString() }
              : l,
          );
          writeLocks(updated);
          broadcastLockChange();
          heldLocksRef.current.add(lid);
          return { status: "acquired", lock: existing };
        }
        // Locked by someone else
        return { status: "conflict", existingLock: existing };
      }

      // Free — create new lock
      const now = Date.now();
      const newLock: LockRecord = {
        lockId: lid,
        recordId,
        recordType,
        userId,
        userName,
        acquiredAt: new Date(now).toISOString(),
        expiresAt: new Date(now + LOCK_TTL_MS).toISOString(),
        shopId,
      };

      writeLocks([...allLocks, newLock]);
      broadcastLockChange();
      heldLocksRef.current.add(lid);
      return { status: "acquired", lock: newLock };
    },
    [userId, userName, shopId],
  );

  // ── releaseLock ──────────────────────────────────────────────────────────
  const releaseLock = useCallback(
    (recordId: string, recordType: string): void => {
      const lid = lockId(recordType, recordId);
      const allLocks = readAllLocks();
      const remaining = allLocks.filter(
        (l) => !(l.lockId === lid && l.userId === userId),
      );
      writeLocks(remaining);
      broadcastLockChange();
      heldLocksRef.current.delete(lid);
    },
    [userId],
  );

  // ── getLockStatus ────────────────────────────────────────────────────────
  const getLockStatus = useCallback(
    (recordId: string, recordType: string): LockRecord | null => {
      const lid = lockId(recordType, recordId);
      const allLocks = readAllLocks();
      return allLocks.find((l) => l.lockId === lid) ?? null;
    },
    [],
  );

  // ── isLockedByMe ─────────────────────────────────────────────────────────
  const isLockedByMe = useCallback(
    (recordId: string, recordType: string): boolean => {
      const lid = lockId(recordType, recordId);
      return heldLocksRef.current.has(lid);
    },
    [],
  );

  return { acquireLock, releaseLock, getLockStatus, isLockedByMe };
}
