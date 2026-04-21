// ─── Super Admin Dashboard Types ─────────────────────────────────────────────
// These types mirror the data shapes used by the Super Admin Dashboard.
// Backend bindings are not yet regenerated — full integration comes in the next wave.

/** A single user activity record tracked per session/login */
export interface ActivityRecord {
  id: string;
  mobile: string;
  shopId: string;
  shopName: string;
  action:
    | "app_open"
    | "session_start"
    | "billing"
    | "stock_add"
    | "stock_update";
  timestamp: string; // ISO date
  metadata?: Record<string, string>;
}

/** Super Admin settings stored in backend */
export interface AdminSettings {
  /** Mobile number of the super admin — controls access to /super-admin page */
  superAdminMobile: string;
  /** Whether activity tracking is enabled globally */
  activityTrackingEnabled: boolean;
  /** How many days of activity data to retain (default 90) */
  activityRetentionDays: number;
  updatedAt: string;
}

/** Aggregated stats for a single user — used in admin table */
export interface UserStatsResult {
  mobile: string;
  totalShops: number;
  totalLogins: number;
  totalSalesCount: number;
  lastActiveAt: string | null;
  isPaidUser: boolean;
  status: "active" | "inactive";
  /** First seen / registered date */
  createdAt: string;
}

/** Aggregated stats for a single shop — used in shop performance table */
export interface ShopStatsResult {
  shopId: string;
  shopName: string;
  ownerMobile: string;
  totalSales: number;
  totalTransactions: number;
  totalProducts: number;
  totalCustomers: number;
  lastActivityAt: string | null;
  isInactive7Days: boolean;
}

/** Filters applied to the admin dashboard data views */
export interface AdminDashboardFilters {
  dateRange: "today" | "7days" | "30days";
  shopId?: string;
}

/** KPI overview card data */
export interface AdminOverviewStats {
  totalUsers: number;
  totalShops: number;
  activeUsersToday: number;
  activeUsersLast7Days: number;
  newUsersToday: number;
  paidUsers: number;
  freeUsers: number;
}
