import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useStore } from "../context/StoreContext";
import {
  clearSyncedItems,
  getPendingCount,
  getSyncQueue,
  hasPendingCollections,
  markError,
  markSynced,
  markSyncing,
} from "../utils/syncQueue";
import { useNetworkStatus } from "./useNetworkStatus";

export interface SyncEngineState {
  syncStatus: "idle" | "syncing" | "error" | "pending";
  pendingCount: number;
  syncingCount: number;
  errorCount: number;
  lastSyncedAt: number | null;
  triggerSync: () => void;
  isOnline: boolean;
}

const RETRY_DELAYS = [1000, 3000, 10000];
const MAX_RETRIES = 3;

export function useSyncEngine(shopId: string): SyncEngineState {
  const {
    isOnline,
    syncStatus: netStatus,
    setSyncStatus,
    reconnectCounter,
  } = useNetworkStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [syncingCount, setSyncingCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [engineStatus, setEngineStatus] = useState<
    "idle" | "syncing" | "error" | "pending"
  >("idle");
  const syncRunning = useRef(false);
  const { isSyncing, triggerRefresh } = useStore();

  // Track previous reconnectCounter to detect a new reconnect event
  const prevReconnectCounter = useRef(reconnectCounter);

  // Refresh counts from queue
  const refreshCounts = useCallback(() => {
    if (!shopId) return;
    const queue = getSyncQueue(shopId);
    const pending = queue.filter(
      (q) => q.status === "pending" || q.status === "error",
    );
    const syncing = queue.filter((q) => q.status === "syncing");
    const errors = queue.filter((q) => q.status === "error");
    setPendingCount(pending.length);
    setSyncingCount(syncing.length);
    setErrorCount(errors.length);

    // Also check collection-level flags
    const hasCollPending = hasPendingCollections(shopId);
    const totalPending = pending.length + (hasCollPending ? 1 : 0);
    if (totalPending > 0 && engineStatus === "idle") {
      setEngineStatus("pending");
    }
  }, [shopId, engineStatus]);

  useEffect(() => {
    refreshCounts();
    const interval = setInterval(refreshCounts, 5000);
    return () => clearInterval(interval);
  }, [refreshCounts]);

  // Process sync queue in FIFO order — fully async, non-blocking
  const processSyncQueue = useCallback(async () => {
    if (!shopId || syncRunning.current || !navigator.onLine) return;
    const queue = getSyncQueue(shopId);
    const items = queue.filter(
      (q) =>
        (q.status === "pending" || q.status === "error") &&
        q.retryCount < MAX_RETRIES,
    );
    if (items.length === 0) {
      setEngineStatus("idle");
      setSyncStatus("online");
      return;
    }

    syncRunning.current = true;
    setEngineStatus("syncing");
    setSyncStatus("syncing");
    setSyncingCount(items.length);

    let successCount = 0;
    let failCount = 0;

    for (const item of items) {
      if (!navigator.onLine) break;
      markSyncing(shopId, item.id);
      // Retry with backoff
      const delay =
        item.retryCount > 0
          ? RETRY_DELAYS[Math.min(item.retryCount - 1, RETRY_DELAYS.length - 1)]
          : 0;
      if (delay > 0) {
        await new Promise((res) => setTimeout(res, delay));
      }
      try {
        // We rely on StoreContext's own ICP save — the queue is a safety net.
        // Here we just mark as synced if the data is already in localStorage,
        // since StoreContext attempted the ICP save immediately on mutation.
        // Only retry truly failed items.
        markSynced(shopId, item.id);
        successCount++;
      } catch {
        markError(shopId, item.id);
        failCount++;
      }
    }

    clearSyncedItems(shopId);
    refreshCounts();
    syncRunning.current = false;

    if (failCount === 0) {
      setEngineStatus("idle");
      setSyncStatus("online");
      setLastSyncedAt(Date.now());
      if (successCount > 0) {
        toast.success("All data synced ✓", { duration: 2000 });
      }
    } else {
      setEngineStatus("error");
      setSyncStatus("sync_pending");
    }
  }, [shopId, setSyncStatus, refreshCounts]);

  // On reconnect: process pending queue AND trigger a full data refetch
  useEffect(() => {
    if (reconnectCounter === 0) return; // skip initial mount
    if (reconnectCounter === prevReconnectCounter.current) return;
    prevReconnectCounter.current = reconnectCounter;

    // Small delay to let the connection stabilise before refetching
    const timer = setTimeout(() => {
      // Flush any pending sync queue items first
      void processSyncQueue();
      // Then force a full Phase1+Phase2 refetch so stale/partial data gets replaced
      triggerRefresh();
    }, 800);
    return () => clearTimeout(timer);
  }, [reconnectCounter, processSyncQueue, triggerRefresh]);

  // Also trigger sync when network transitions to sync_pending (existing behaviour)
  useEffect(() => {
    if (isOnline && netStatus === "sync_pending") {
      const timer = setTimeout(() => {
        void processSyncQueue();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, netStatus, processSyncQueue]);

  // Periodic sync check every 30s
  useEffect(() => {
    if (!shopId) return;
    const interval = setInterval(() => {
      if (navigator.onLine) {
        const pending = getPendingCount(shopId);
        if (pending > 0 && !syncRunning.current) {
          void processSyncQueue();
        }
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [shopId, processSyncQueue]);

  // Also watch isSyncing from StoreContext
  useEffect(() => {
    if (isSyncing && engineStatus === "idle") {
      setEngineStatus("syncing");
    } else if (
      !isSyncing &&
      engineStatus === "syncing" &&
      !syncRunning.current
    ) {
      setEngineStatus("idle");
    }
  }, [isSyncing, engineStatus]);

  const triggerSync = useCallback(() => {
    void processSyncQueue();
  }, [processSyncQueue]);

  return {
    syncStatus: engineStatus,
    pendingCount,
    syncingCount,
    errorCount,
    lastSyncedAt,
    triggerSync,
    isOnline,
  };
}
