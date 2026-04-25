/**
 * Client-side idempotency key generator and tracker.
 *
 * Prevents duplicate saves when:
 *  - User double-taps a submit button
 *  - Network is slow and a retry fires before the first ack arrives
 *  - App re-renders or page restores a form in flight
 *
 * Keys are:
 *  - Deterministic: same input always produces the same key
 *  - Stored in localStorage for offline dedup
 *  - Auto-expired after 24 hours
 */

import type { IdempotencyRecord } from "../types/concurrency";

// ─── Constants ────────────────────────────────────────────────────────────────

const LS_KEY = "saveshop_idempotency_keys";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Tiny non-cryptographic hash — sufficient for duplicate detection.
 * DJB2 variant operating on a UTF-8 string.
 */
function hashString(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
}

/** Load all stored keys from localStorage, purging expired entries. */
function loadKeys(): Map<string, IdempotencyRecord> {
  const map = new Map<string, IdempotencyRecord>();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return map;
    const parsed = JSON.parse(raw) as IdempotencyRecord[];
    const now = Date.now();
    for (const rec of parsed) {
      if (rec.expiresAt > now) {
        map.set(rec.key, rec);
      }
      // Expired entries are silently dropped
    }
  } catch {
    // Ignore parse errors — treat as empty
  }
  return map;
}

/** Persist the current key map to localStorage. */
function saveKeys(map: Map<string, IdempotencyRecord>): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...map.values()]));
  } catch {
    // Storage quota — degrade gracefully
  }
}

// ─── Key fields per operation type ───────────────────────────────────────────

/**
 * Extracts the subset of payload fields that define uniqueness for each
 * operation type. Only these fields contribute to the hash so that irrelevant
 * UI state changes (e.g. a form description field) do not produce new keys.
 */
function extractKeyFields(
  operationType: string,
  payload: Record<string, unknown>,
): string {
  switch (operationType) {
    case "invoice":
      // An invoice is identified by its shop, customer mobile, amount, and approximate time
      return JSON.stringify({
        mobile: payload.customerMobile ?? payload.mobile ?? "",
        amount: payload.totalAmount ?? payload.amount ?? 0,
        ts: Math.floor(((payload.timestamp as number) ?? Date.now()) / 60000), // minute bucket
      });

    case "payment":
      return JSON.stringify({
        mobile: payload.customerMobile ?? payload.mobile ?? "",
        amount: payload.amount ?? 0,
        ts: Math.floor(((payload.timestamp as number) ?? Date.now()) / 60000),
      });

    case "stock_in":
      return JSON.stringify({
        productId: payload.productId ?? payload.id ?? "",
        quantity: payload.quantity ?? 0,
        rate: payload.purchaseRate ?? payload.rate ?? 0,
        ts: Math.floor(((payload.timestamp as number) ?? Date.now()) / 60000),
      });

    case "return":
      return JSON.stringify({
        invoiceId: payload.invoiceId ?? "",
        productId: payload.productId ?? "",
        quantity: payload.quantity ?? 0,
        ts: Math.floor(((payload.timestamp as number) ?? Date.now()) / 60000),
      });

    default:
      // Fallback: hash the entire payload
      return JSON.stringify(payload);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate a deterministic idempotency key for an operation.
 *
 * @param shopId        The shop this operation belongs to.
 * @param operationType Category of operation (invoice | payment | stock_in | return | …).
 * @param payload       The operation payload — only key fields are hashed.
 * @returns             A string key that is stable for identical inputs.
 */
export function generateIdempotencyKey(
  shopId: string,
  operationType: string,
  payload: Record<string, unknown>,
): string {
  const fields = extractKeyFields(operationType, payload);
  const raw = `${shopId}|${operationType}|${fields}`;
  return `idem_${hashString(raw)}`;
}

/**
 * Check whether a key has already been processed.
 * If it is new, register it so future calls return `{ isNew: false }`.
 *
 * @param shopId        Shop context — used for scoped storage reads.
 * @param operationType The operation category.
 * @param key           The idempotency key from generateIdempotencyKey().
 * @returns             `{ isNew: true }` if this is the first time the key is
 *                      seen — safe to proceed with the operation.
 *                      `{ isNew: false }` if the key was already processed —
 *                      callers should skip the duplicate operation.
 */
export function checkAndRegisterKey(
  _shopId: string,
  operationType: string,
  key: string,
): { isNew: boolean } {
  const map = loadKeys();

  if (map.has(key)) {
    return { isNew: false };
  }

  // Register the key
  const now = Date.now();
  const record: IdempotencyRecord = {
    key,
    registeredAt: now,
    expiresAt: now + TTL_MS,
    operationType,
  };
  map.set(key, record);
  saveKeys(map);

  return { isNew: true };
}

/**
 * Explicitly remove a key from the registry.
 * Use this when an operation fails and the key should be re-usable
 * (e.g. a transient network error that the user will retry manually).
 */
export function revokeIdempotencyKey(key: string): void {
  const map = loadKeys();
  if (map.delete(key)) {
    saveKeys(map);
  }
}

/**
 * Purge all expired keys from localStorage.
 * Called automatically on first load by loadKeys(), but can be called
 * explicitly during app startup to keep storage lean.
 */
export function pruneExpiredKeys(): void {
  const map = loadKeys(); // loadKeys already prunes expired entries
  saveKeys(map);
}
