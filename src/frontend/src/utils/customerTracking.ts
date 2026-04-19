import type { ActivityStatus, CustomerTier } from "../types/store";

/**
 * Compute activity status based on days since last visit.
 * - Active:  0–30 days
 * - Warm:    31–180 days
 * - Cold:    181–365 days
 * - Lost:    365+ days (or no last visit)
 */
export function getActivityStatus(
  lastVisit: string | undefined,
): ActivityStatus {
  if (!lastVisit) return "cold";
  const diffMs = Date.now() - new Date(lastVisit).getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays <= 30) return "active";
  if (diffDays <= 180) return "warm";
  if (diffDays <= 365) return "cold";
  return "lost";
}

/**
 * Compute customer tier based on total purchase amount (₹).
 * - VIP:    ₹50,000+
 * - Gold:   ₹20,000+
 * - Silver: ₹5,000+
 * - Normal: below ₹5,000
 */
export function getCustomerTier(
  totalPurchase: number | undefined,
): CustomerTier {
  const amount = totalPurchase ?? 0;
  if (amount >= 50000) return "vip";
  if (amount >= 20000) return "gold";
  if (amount >= 5000) return "silver";
  return "normal";
}

/** Badge label for activity status */
export const ACTIVITY_LABELS: Record<ActivityStatus, string> = {
  active: "Active",
  warm: "Warm",
  cold: "Cold",
  lost: "Lost",
};

/** Badge color classes for activity status */
export const ACTIVITY_COLORS: Record<ActivityStatus, string> = {
  active:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  warm: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  cold: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  lost: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
};

/** Badge emoji for tier */
export const TIER_EMOJI: Record<CustomerTier, string> = {
  vip: "👑",
  gold: "🥇",
  silver: "🥈",
  normal: "👤",
};

/** Badge label for tier */
export const TIER_LABELS: Record<CustomerTier, string> = {
  vip: "VIP",
  gold: "Gold",
  silver: "Silver",
  normal: "Normal",
};

/** Badge color classes for tier */
export const TIER_COLORS: Record<CustomerTier, string> = {
  vip: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  gold: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  silver:
    "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  normal: "bg-muted text-muted-foreground border-border",
};
