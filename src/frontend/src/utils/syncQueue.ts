import { loadData, saveData } from "./localStorage";

export type SyncCollection =
  | "products"
  | "customers"
  | "invoices"
  | "payments"
  | "vendors"
  | "batches"
  | "returns"
  | "settings";

export type SyncItemStatus = "pending" | "syncing" | "synced" | "error";

export interface SyncQueueItem {
  id: string;
  shopId: string;
  collection: SyncCollection;
  /** JSON-stringified payload */
  data: string;
  timestamp: number;
  status: SyncItemStatus;
  retryCount: number;
}

function queueKey(shopId: string) {
  return `saveshop_sync_queue_${shopId}`;
}

export function getSyncQueue(shopId: string): SyncQueueItem[] {
  return loadData<SyncQueueItem[]>(queueKey(shopId), []);
}

export function enqueueSyncItem(
  shopId: string,
  collection: SyncCollection,
  data: unknown,
): void {
  const queue = getSyncQueue(shopId);
  // Replace existing pending/error item for same collection to avoid duplicates
  const idx = queue.findIndex(
    (q) =>
      q.collection === collection &&
      (q.status === "pending" || q.status === "error"),
  );
  const item: SyncQueueItem = {
    id: `${shopId}_${collection}_${Date.now()}`,
    shopId,
    collection,
    data: JSON.stringify(data),
    timestamp: Date.now(),
    status: "pending",
    retryCount: 0,
  };
  if (idx >= 0) {
    queue[idx] = item; // replace stale pending
  } else {
    queue.push(item);
  }
  saveData(queueKey(shopId), queue);
}

export function markSynced(shopId: string, itemId: string): void {
  const queue = getSyncQueue(shopId);
  const item = queue.find((q) => q.id === itemId);
  if (item) {
    item.status = "synced";
    saveData(queueKey(shopId), queue);
  }
}

export function markError(shopId: string, itemId: string): void {
  const queue = getSyncQueue(shopId);
  const item = queue.find((q) => q.id === itemId);
  if (item) {
    item.status = "error";
    item.retryCount += 1;
    saveData(queueKey(shopId), queue);
  }
}

export function markSyncing(shopId: string, itemId: string): void {
  const queue = getSyncQueue(shopId);
  const item = queue.find((q) => q.id === itemId);
  if (item) {
    item.status = "syncing";
    saveData(queueKey(shopId), queue);
  }
}

export function getPendingCount(shopId: string): number {
  return getSyncQueue(shopId).filter(
    (q) => q.status === "pending" || q.status === "error",
  ).length;
}

export function clearSyncedItems(shopId: string): void {
  const queue = getSyncQueue(shopId).filter((q) => q.status !== "synced");
  saveData(queueKey(shopId), queue);
}

/** Collection-level sync status flag */
export function setSyncCollectionStatus(
  shopId: string,
  collection: SyncCollection,
  status: "synced" | "pending",
): void {
  try {
    localStorage.setItem(
      `saveshop_sync_status_${shopId}_${collection}`,
      status,
    );
  } catch {
    // ignore
  }
}

export function hasPendingCollections(shopId: string): boolean {
  const collections: SyncCollection[] = [
    "products",
    "customers",
    "invoices",
    "payments",
    "vendors",
    "batches",
    "returns",
    "settings",
  ];
  return collections.some(
    (c) =>
      localStorage.getItem(`saveshop_sync_status_${shopId}_${c}`) === "pending",
  );
}
