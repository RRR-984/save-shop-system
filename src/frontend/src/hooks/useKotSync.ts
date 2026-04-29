/**
 * useKotSync — 15s polling hook for KOT real-time updates.
 * Same pattern as usePeriodicSync. Polls active KOTs from localStorage
 * under restaurant-{shopId} namespace and calls onUpdate when data changes.
 *
 * Usage:
 *   useKotSync({ shopId, onUpdate, enabled })
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { KOT } from "../types/restaurant";
import { loadRestaurantData } from "./useRestaurantData";

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_INTERVAL_MS = 15_000; // 15 s
const JITTER_MS = 2_000; // ±2 s jitter (same as usePeriodicSync)

function nextInterval(): number {
  const jitter = (Math.random() * 2 - 1) * JITTER_MS;
  return Math.max(BASE_INTERVAL_MS + jitter, 5_000);
}

// ─── Hook interface ───────────────────────────────────────────────────────────

export interface KotSyncState {
  lastSyncAt: Date | null;
  isSyncing: boolean;
}

export interface UseKotSyncOptions {
  shopId: string;
  /** Called with latest KOT list whenever the poll detects a change */
  onUpdate: (kots: KOT[]) => void;
  enabled?: boolean;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useKotSync({
  shopId,
  onUpdate,
  enabled = true,
}: UseKotSyncOptions): KotSyncState {
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const isSyncingRef = useRef(false);
  const enabledRef = useRef(enabled);
  const shopIdRef = useRef(shopId);
  const onUpdateRef = useRef(onUpdate);
  /** Track previous KOT count to detect changes */
  const prevKotSnapshotRef = useRef<string>("");

  // Keep refs current
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);
  useEffect(() => {
    shopIdRef.current = shopId;
  }, [shopId]);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const runSyncCycle = useCallback(() => {
    if (!enabledRef.current) return;
    if (!navigator.onLine) return;
    if (isSyncingRef.current) return;
    const sid = shopIdRef.current;
    if (!sid) return;

    isSyncingRef.current = true;
    setIsSyncing(true);

    try {
      const { kots } = loadRestaurantData(sid);
      // Only fire onUpdate when data actually changed
      const snapshot = JSON.stringify(kots);
      if (snapshot !== prevKotSnapshotRef.current) {
        prevKotSnapshotRef.current = snapshot;
        onUpdateRef.current(kots);
      }
      setLastSyncAt(new Date());
    } catch (err) {
      // Silently ignore — KOT polling failures must never disrupt the user
      console.debug("[useKotSync] cycle error:", err);
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, []);

  // ── Schedule polling interval ─────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !shopId) return;

    let timer: ReturnType<typeof setTimeout>;

    function schedule() {
      timer = setTimeout(() => {
        runSyncCycle();
        schedule(); // re-schedule with fresh jitter
      }, nextInterval());
    }

    // Fire immediately on mount to populate data right away
    runSyncCycle();
    schedule();
    return () => clearTimeout(timer);
  }, [enabled, shopId, runSyncCycle]);

  return { lastSyncAt, isSyncing };
}
