import { loadData, saveData } from "./localStorage";

export interface BackupSnapshot {
  id: string;
  shopId: string;
  createdAt: number;
  collections: {
    products: number;
    customers: number;
    invoices: number;
    payments: number;
    vendors: number;
    batches: number;
    returns: number;
  };
  /** Full JSON of the snapshot */
  payload?: string;
}

const BACKUP_LIST_KEY = (shopId: string) => `saveshop_backups_list_${shopId}`;
const BACKUP_DATA_KEY = (shopId: string, id: string) =>
  `saveshop_backup_data_${shopId}_${id}`;

export function listBackupSnapshots(shopId: string): BackupSnapshot[] {
  return loadData<BackupSnapshot[]>(BACKUP_LIST_KEY(shopId), []).sort(
    (a, b) => b.createdAt - a.createdAt,
  );
}

export interface StoreSnapshot {
  products: unknown[];
  customers: unknown[];
  invoices: unknown[];
  payments: unknown[];
  vendors: unknown[];
  batches: unknown[];
  returns: unknown[];
}

export function createBackupSnapshot(
  shopId: string,
  storeData: StoreSnapshot,
): BackupSnapshot {
  const id = `bk_${shopId}_${Date.now()}`;
  const snapshot: BackupSnapshot = {
    id,
    shopId,
    createdAt: Date.now(),
    collections: {
      products: storeData.products.length,
      customers: storeData.customers.length,
      invoices: storeData.invoices.length,
      payments: storeData.payments.length,
      vendors: storeData.vendors.length,
      batches: storeData.batches.length,
      returns: storeData.returns.length,
    },
  };

  // Save full payload separately to avoid bloating the list
  const payload = JSON.stringify(storeData);
  try {
    localStorage.setItem(BACKUP_DATA_KEY(shopId, id), payload);
  } catch {
    // Storage quota — skip payload save
    console.warn("Backup payload storage failed (quota?)");
  }

  // Update snapshot list
  const list = listBackupSnapshots(shopId);
  list.unshift(snapshot);
  // Keep at most 30 entries in list
  const trimmed = list.slice(0, 30);
  saveData(BACKUP_LIST_KEY(shopId), trimmed);

  return snapshot;
}

export function getBackupSnapshotData(
  shopId: string,
  id: string,
): StoreSnapshot | null {
  try {
    const raw = localStorage.getItem(BACKUP_DATA_KEY(shopId, id));
    if (!raw) return null;
    return JSON.parse(raw) as StoreSnapshot;
  } catch {
    return null;
  }
}

export interface RestoreOptions {
  products: boolean;
  customers: boolean;
  invoices: boolean;
  payments: boolean;
  vendors: boolean;
  batches: boolean;
  returns: boolean;
}

export function restoreFromSnapshot(
  shopId: string,
  snapshotId: string,
  options: RestoreOptions,
): StoreSnapshot | null {
  const data = getBackupSnapshotData(shopId, snapshotId);
  if (!data) return null;

  // Build a partial restore result — only include collections user selected
  const result: Partial<StoreSnapshot> = {};
  if (options.products) result.products = data.products ?? [];
  if (options.customers) result.customers = data.customers ?? [];
  if (options.invoices) result.invoices = data.invoices ?? [];
  if (options.payments) result.payments = data.payments ?? [];
  if (options.vendors) result.vendors = data.vendors ?? [];
  if (options.batches) result.batches = data.batches ?? [];
  if (options.returns) result.returns = data.returns ?? [];

  return result as StoreSnapshot;
}

export function pruneBackups(shopId: string, retainDays: number): void {
  if (retainDays <= 0) return; // unlimited
  const cutoff = Date.now() - retainDays * 24 * 60 * 60 * 1000;
  const list = listBackupSnapshots(shopId);
  const toDelete = list.filter((b) => b.createdAt < cutoff);
  for (const b of toDelete) {
    try {
      localStorage.removeItem(BACKUP_DATA_KEY(shopId, b.id));
    } catch {
      // ignore
    }
  }
  const kept = list.filter((b) => b.createdAt >= cutoff);
  saveData(BACKUP_LIST_KEY(shopId), kept);
}

export function deleteBackupSnapshot(shopId: string, id: string): void {
  try {
    localStorage.removeItem(BACKUP_DATA_KEY(shopId, id));
  } catch {
    // ignore
  }
  const list = listBackupSnapshots(shopId).filter((b) => b.id !== id);
  saveData(BACKUP_LIST_KEY(shopId), list);
}
