/**
 * usePeriodicSync — polls the backend for remote data changes on a regular
 * interval and merges them into the StoreContext state.
 *
 * Behaviour:
 *  - Interval: 15 s ± 2 s jitter (avoids thundering-herd on multi-tab)
 *  - On each tick: fetches Phase1 (products, batches) then Phase2 (customers,
 *    invoices, payments) from backend and compares record counts with local state
 *  - If server has new records, calls triggerRefresh() so StoreContext reloads
 *  - Skips cycle when navigator.onLine === false
 *  - Shows a subtle 2 s "Syncing..." toast on each cycle (non-blocking)
 *  - Respects concurrency feature flag (no-op when disabled)
 *  - Exposes { lastSyncAt, isSyncing }
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import type { PeriodicSyncState } from "../types/concurrency";
import { DEFAULT_CONCURRENCY_SETTINGS } from "../types/concurrency";
import { enqueueRequest } from "../utils/requestQueue";

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_INTERVAL_MS =
  DEFAULT_CONCURRENCY_SETTINGS.periodicSyncIntervalSeconds * 1000; // 15 s
const JITTER_MS = DEFAULT_CONCURRENCY_SETTINGS.periodicSyncJitterMs; // ±2 s

// ─── Helpers ──────────────────────────────────────────────────────────────────

function nextInterval(): number {
  const jitter = (Math.random() * 2 - 1) * JITTER_MS; // [-2000, +2000]
  return Math.max(BASE_INTERVAL_MS + jitter, 5000); // floor at 5 s
}

/** Parse a backend JSON response safely — returns an empty array on failure. */
function safeParse<T>(raw: unknown): T[] {
  try {
    if (typeof raw !== "string") return [];
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Count how many records in `remote` have a timestamp newer than their local counterpart. */
function countNewRecords<
  T extends { id: string; updatedAt?: string; createdAt?: string },
>(local: T[], remote: T[]): number {
  const localMap = new Map<string, T>(local.map((r) => [r.id, r]));
  let count = 0;
  for (const incoming of remote) {
    const existing = localMap.get(incoming.id);
    if (!existing) {
      count++;
      continue;
    }
    const existingTs = existing.updatedAt ?? existing.createdAt ?? "";
    const incomingTs = incoming.updatedAt ?? incoming.createdAt ?? "";
    if (incomingTs > existingTs) count++;
  }
  return count;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Mount this hook inside AppContent (inside StoreProvider + AuthProvider).
 *
 * @param enabled Pass false to fully disable periodic syncing (e.g. when
 *                featureFlags.concurrency is off or user is on billing page).
 */
export function usePeriodicSync(enabled = true): PeriodicSyncState {
  const { session } = useAuth();
  const { products, batches, customers, invoices, payments, triggerRefresh } =
    useStore();
  const shopId = session?.selectedShopId ?? session?.shopId ?? "";

  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Use refs to avoid stale closure issues in the interval callback
  const shopIdRef = useRef(shopId);
  const enabledRef = useRef(enabled);
  const isSyncingRef = useRef(false);
  const actorRef = useRef<backendInterface | null>(null);

  // Store data refs — updated each render so the sync cycle sees latest counts
  const productsRef = useRef(products);
  const batchesRef = useRef(batches);
  const customersRef = useRef(customers);
  const invoicesRef = useRef(invoices);
  const paymentsRef = useRef(payments);
  const triggerRefreshRef = useRef(triggerRefresh);

  useEffect(() => {
    shopIdRef.current = shopId;
  }, [shopId]);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);
  useEffect(() => {
    productsRef.current = products;
  }, [products]);
  useEffect(() => {
    batchesRef.current = batches;
  }, [batches]);
  useEffect(() => {
    customersRef.current = customers;
  }, [customers]);
  useEffect(() => {
    invoicesRef.current = invoices;
  }, [invoices]);
  useEffect(() => {
    paymentsRef.current = payments;
  }, [payments]);
  useEffect(() => {
    triggerRefreshRef.current = triggerRefresh;
  }, [triggerRefresh]);

  // Lazy-init the actor once
  useEffect(() => {
    if (actorRef.current) return;
    createActorWithConfig()
      .then((a) => {
        actorRef.current = a;
      })
      .catch((err) => {
        console.debug("[usePeriodicSync] actor init error:", err);
      });
  }, []);

  const runSyncCycle = useCallback(async () => {
    if (!enabledRef.current) return;
    if (!navigator.onLine) return;
    if (isSyncingRef.current) return;
    const sid = shopIdRef.current;
    if (!sid) return;
    const actor = actorRef.current;
    if (!actor) return;

    isSyncingRef.current = true;
    setIsSyncing(true);

    // Subtle non-blocking toast — auto-dismisses after 2 s
    toast("Syncing...", {
      duration: 2000,
      id: "periodic-sync-toast",
    });

    try {
      // ── Phase 1: products + batches ──────────────────────────────────────
      const [rawProducts, rawBatches] = await Promise.all([
        enqueueRequest(() => actor.getProducts(sid), "low"),
        enqueueRequest(() => actor.getBatches(sid), "low"),
      ]);

      interface RemoteRecord {
        id: string;
        updatedAt?: string;
        createdAt?: string;
      }
      const remoteProducts = safeParse<RemoteRecord>(rawProducts);
      const remoteBatches = safeParse<RemoteRecord>(rawBatches);

      // ── Phase 2: customers + invoices + payments ─────────────────────────
      const [rawCustomers, rawInvoices, rawPayments] = await Promise.all([
        enqueueRequest(() => actor.getCustomers(sid), "low"),
        enqueueRequest(() => actor.getInvoices(sid), "low"),
        enqueueRequest(() => actor.getPayments(sid), "low"),
      ]);

      const remoteCustomers = safeParse<RemoteRecord>(rawCustomers);
      const remoteInvoices = safeParse<RemoteRecord>(rawInvoices);
      const remotePayments = safeParse<RemoteRecord>(rawPayments);

      // ── Detect changes ───────────────────────────────────────────────────
      const newRecords =
        countNewRecords(productsRef.current as RemoteRecord[], remoteProducts) +
        countNewRecords(batchesRef.current as RemoteRecord[], remoteBatches) +
        countNewRecords(
          customersRef.current as RemoteRecord[],
          remoteCustomers,
        ) +
        countNewRecords(invoicesRef.current as RemoteRecord[], remoteInvoices) +
        countNewRecords(paymentsRef.current as RemoteRecord[], remotePayments);

      if (newRecords > 0) {
        // Trigger a full StoreContext refresh — it already handles Phase1+Phase2 loading
        triggerRefreshRef.current();
      }

      setLastSyncAt(new Date());
    } catch (err) {
      // Silently ignore — periodic sync failures must never disrupt the user
      console.debug("[usePeriodicSync] cycle error:", err);
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, []);

  // ── Schedule the interval ─────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !shopId) return;

    let timer: ReturnType<typeof setTimeout>;

    function schedule() {
      timer = setTimeout(async () => {
        await runSyncCycle();
        schedule(); // re-schedule with fresh jitter after each cycle
      }, nextInterval());
    }

    schedule();
    return () => clearTimeout(timer);
  }, [enabled, shopId, runSyncCycle]);

  return { lastSyncAt, isSyncing };
}
