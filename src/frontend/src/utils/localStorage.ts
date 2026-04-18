import type { AutoModeType, DraftSale } from "../types/store";

// ─── Storage Keys ─────────────────────────────────────────────────────────────
// All keys use "saveshop_" prefix to avoid collision with
// existing keys: shopSettings_*, appConfig_*, last_shop_id
export const STORAGE_KEYS = {
  products: "saveshop_products",
  customers: "saveshop_customers",
  vendors: "saveshop_vendors",
  sales: "saveshop_sales", // invoices
  batches: "saveshop_batches",
  transactions: "saveshop_transactions",
  payments: "saveshop_payments",
  returns: "saveshop_returns",
  purchaseOrders: "saveshop_purchaseOrders",
  customerOrders: "saveshop_customerOrders",
  vendorRateHistory: "saveshop_vendorRateHistory",
  settings: "saveshop_settings", // combined settings backup
  diamondRewards: "saveshop_diamond_rewards",
  feedback: "saveshop_feedback",
  referralCodes: "saveshop_referral_codes",
  referralSignups: "saveshop_referral_signups",
  // Draft sales — in-progress billing sessions saved for editing later
  drafts: "shop_drafts",
  // Device fingerprint keys for referral fraud prevention
  referralDeviceId: "referral_device_id",
  referralDeviceUsedCode: "referral_device_used_code",
} as const;

export function saveData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn("localStorage saveData failed", key, e);
  }
}

export function loadData<T>(key: string, defaultValue: T): T {
  try {
    const d = localStorage.getItem(key);
    return d ? (JSON.parse(d) as T) : defaultValue;
  } catch (e) {
    console.warn("localStorage loadData failed", key, e);
    return defaultValue;
  }
}

export function clearShopData(): void {
  for (const key of Object.values(STORAGE_KEYS)) {
    localStorage.removeItem(key);
  }
}

// ─── Auto Mode helpers ────────────────────────────────────────────────────────
// Scoped per-shop. Key: `auto_mode_{shopId}`. Default: 'simple'.

/** Persist the selected auto mode for a given shop. */
export function saveAutoMode(shopId: string, mode: AutoModeType): void {
  try {
    localStorage.setItem(`auto_mode_${shopId}`, mode);
  } catch (e) {
    console.warn("saveAutoMode failed", e);
  }
}

/** Load the saved auto mode for a given shop. Defaults to 'simple'. */
export function loadAutoMode(shopId: string): AutoModeType {
  try {
    const val = localStorage.getItem(`auto_mode_${shopId}`);
    if (val === "simple" || val === "smart" || val === "pro") return val;
  } catch (_) {
    // ignore
  }
  return "simple";
}

// ─── Draft Sale Helpers ───────────────────────────────────────────────────────
// These helpers scope drafts by shopId so different shops never share drafts.

/** Persist the full drafts array for a given shop to localStorage. */
export function saveDrafts(drafts: DraftSale[], shopId: string): void {
  saveData(`${STORAGE_KEYS.drafts}_${shopId}`, drafts);
}

/** Load the drafts array for a given shop from localStorage. Returns [] if none saved. */
export function loadDrafts(shopId: string): DraftSale[] {
  return loadData<DraftSale[]>(`${STORAGE_KEYS.drafts}_${shopId}`, []);
}
