/**
 * LockBadge — reusable lock status indicator for concurrent editing.
 * Shows nothing when no lock is active.
 * Shows amber badge when locked by another user.
 * Shows green badge when locked by current user.
 */

import { Lock, Unlock } from "lucide-react";
import { useEffect, useState } from "react";
import { useLockManager } from "../hooks/useLockManager";

interface LockBadgeProps {
  recordId: string;
  recordType: string;
  /** Called after lock is successfully acquired */
  onLockAcquired?: () => void;
  /** Called when lock is held by another user — passes their display name */
  onLockConflict?: (lockedBy: string) => void;
}

export function LockBadge({
  recordId,
  recordType,
  onLockAcquired,
  onLockConflict,
}: LockBadgeProps) {
  const { getLockStatus, isLockedByMe } = useLockManager();
  const [lockState, setLockState] = useState<{
    type: "none" | "mine" | "other";
    userName?: string;
  }>({ type: "none" });

  useEffect(() => {
    function checkLock() {
      const lock = getLockStatus(recordId, recordType);
      if (!lock) {
        setLockState({ type: "none" });
        return;
      }
      if (isLockedByMe(recordId, recordType)) {
        setLockState({ type: "mine" });
        onLockAcquired?.();
      } else {
        setLockState({ type: "other", userName: lock.userName });
        onLockConflict?.(lock.userName);
      }
    }

    checkLock();

    // Listen for BroadcastChannel lock changes
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        bc = new BroadcastChannel("saveshop_locks_bc");
        bc.onmessage = () => checkLock();
      } catch {
        bc = null;
      }
    }

    // Also poll localStorage on storage events (cross-tab)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "saveshop_locks") checkLock();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      bc?.close();
      window.removeEventListener("storage", onStorage);
    };
  }, [
    recordId,
    recordType,
    getLockStatus,
    isLockedByMe,
    onLockAcquired,
    onLockConflict,
  ]);

  if (lockState.type === "none") return null;

  if (lockState.type === "mine") {
    return (
      <span
        data-ocid="lock_badge.mine"
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
      >
        <Unlock size={9} />
        You are editing
      </span>
    );
  }

  return (
    <span
      data-ocid="lock_badge.conflict"
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
    >
      <Lock size={9} />
      Being edited by {lockState.userName}
    </span>
  );
}
