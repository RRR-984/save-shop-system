export interface Shop {
  id: string;
  name: string;
  createdAt: string;
  mobile?: string;
}

export interface ShopUnit {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface ShopSettings {
  allowMixedUnits: boolean;
  deadStockThresholdDays?: number;
  deadStockCustomDays?: number;
}

export interface FeatureFlags {
  expiry: boolean;
  deadStock: boolean;
  rental: boolean;
  service: boolean;
  staff: boolean;
  credit: boolean;
  discount: boolean;
  /** Customer Tracking: auto-track customers, rankings, and insights (Pro mode only) */
  customerTracking: boolean;
}

export interface DashboardSectionConfig {
  smartFilterBar?: boolean;
  todaySummary?: boolean;
  topPerformance?: boolean;
  diamondRewards?: boolean;
  smartAlerts?: boolean;
  smartInsightsCards?: boolean;
  customerDue?: boolean;
  pendingOrders?: boolean;
  productsList?: boolean;
  stockControl?: boolean;
  smartInsights?: boolean;
  inventoryHealth?: boolean;
  recentActivity?: boolean;
  adBannerCarousel?: boolean;
  quickActions?: boolean;
  marqueeAlertBar?: boolean;
  tutorialGuide?: boolean;
  sponsoredAd?: boolean;
  /** PRO: Customer Insights — Top customers, inactive, lost, high pending */
  customerInsights?: boolean;
}

// ─── Auto Mode System ─────────────────────────────────────────────────────────
/**
 * Auto Mode: a simplified 3-mode abstraction over the existing featureMode (1-4).
 * 'simple' → featureMode 1 (minimal: Stock, Billing, basic Dashboard)
 * 'smart'  → featureMode 3 (balanced: + Inventory, Reports, Customers, Credit)
 * 'pro'    → featureMode 4 (everything unlocked)
 * Saved per-shop in localStorage as `auto_mode_{shopId}`.
 * Default for new users: 'simple'.
 */
export type AutoModeType = "simple" | "smart" | "pro";

export interface AppConfig {
  featureFlags: FeatureFlags;
  shopName?: string;
  allowMixedUnits: boolean;
  deadStockThresholdDays: number;
  deadStockCustomDays?: number;
  version: number;
  ownerPin?: string;
  /** Auto mode for the new 3-mode system. Drives featureMode automatically. */
  autoMode?: AutoModeType;
  /** true = Warning mode (allow with warning), false = Lock mode (block unless PIN/admin) */
  allowLowPriceSelling?: boolean;
  /** Whether staff are allowed to send/request reminders */
  allowStaffReminders?: boolean;
  /** "approval" = staff requests, owner/manager approves; "simple" = staff can send directly (max 2/day) */
  staffReminderMode?: "approval" | "simple";
  /** Auto update product cost price when vendor rate changes (default OFF) */
  autoUpdateCostOnVendorRateChange?: boolean;
  /** Per-section dashboard visibility toggles (Owner only). All default to true. */
  dashboardSections?: DashboardSectionConfig;
  /**
   * Feature mode: controls sidebar nav and dashboard section complexity.
   * 1 = Basic    (minimal nav: Dashboard, Stock, Billing, Settings)
   * 2 = Normal   (Basic + Inventory, Customers, Vendors, Drafts)
   * 3 = Advance  (Normal + Reports, Purchase Orders, Staff, Live Board)
   * 4 = Super    (everything — full nav + full dashboard)
   * Saved per-shop in localStorage as `feature_mode_{shopId}`.
   * Default for new users: 1 (Basic).
   */
  featureMode?: 1 | 2 | 3 | 4;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  unit: string;
  minStockAlert: number;
  sellingPrice: number;
  vendorName?: string;
  purchasePrice?: number;
  costPrice?: number;
  details?: string;
  expiryDate?: string;
  unitMode?: "single" | "mixed";
  weightUnit?: string;
  lengthUnit?: string;
  meterToKgRatio?: number;
  minProfitPct?: number;
  /** Optional retailer price — used when Customer Type = Retailer */
  retailerPrice?: number;
  /** Optional wholesaler price — used when Customer Type = Wholesaler */
  wholesalerPrice?: number;
}

export interface StockBatch {
  id: string;
  productId: string;
  quantity: number;
  purchaseRate: number;
  dateAdded: string;
  batchNumber?: number;
  expiryDate?: string;
  invoiceNo?: string;
  billNo?: string;
  transportCharge?: number;
  labourCharge?: number;
  otherCharges?: number;
  finalPurchaseCost?: number;
  weightQty?: number;
  lengthQty?: number;
}

export interface StockTransaction {
  id: string;
  productId: string;
  type: "in" | "out";
  quantity: number;
  rate: number;
  date: string;
  note: string;
}

export type ActivityStatus = "active" | "warm" | "cold" | "lost";
export type CustomerTier = "vip" | "gold" | "silver" | "normal";

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  creditBalance: number;
  /** Optional address — backward compatible, may be absent on older records */
  address?: string;
  /** ISO date string of last visit/purchase — used for activity status */
  lastVisit?: string;
  /** Cumulative total purchase amount across all invoices */
  totalPurchase?: number;
  /** Total number of visits (invoices linked to this customer) */
  visitCount?: number;
  /** Running pending balance — mirrors creditBalance but tracked separately for PRO mode */
  pendingBalance?: number;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  sellingRate: number;
  purchaseCost: number;
  selectedBatchId?: string;
  profitPerUnit?: number;
  totalProfit?: number;
  isOverSell?: boolean;
  availableStockAtSale?: number;
  basePrice?: number;
  discountPct?: number;
  extraProfit?: number;
  staffBonus?: number;
  /** Price mode used for this item — for audit trail */
  priceModeUsed?: "standard" | "retailer" | "wholesaler";
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string | null;
  customerName: string;
  customerMobile: string;
  /** Optional address captured at sale time */
  customerAddress?: string;
  items: InvoiceItem[];
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMode: "cash" | "upi" | "online" | "credit";
  date: string;
  invoiceTotalProfit?: number;
  totalExtraProfit?: number;
  totalStaffBonus?: number;
  soldByUserId?: string;
  soldByName?: string;
  /** Extra charges added at sale time */
  transportCharge?: number;
  labourCharge?: number;
  otherCharges?: number;
}

export interface PaymentRecord {
  id: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  amount: number;
  date: string;
  note: string;
  paymentMode: "cash" | "upi" | "online";
}

// ─── Multi-User Role System ───────────────────────────────────────────────────

export type UserRole = "owner" | "manager" | "staff";

export interface AppUser {
  id: string;
  name: string;
  username: string;
  password: string;
  role: UserRole;
  shopId: string;
  mobile?: string;
  pin?: string;
  active?: boolean;
  deleted?: boolean;
  isOwner?: boolean;
  createdAt?: string;
}

/**
 * Role permissions helper.
 * Returns true if the given role has the specified permission.
 */
export const ROLE_PERMISSIONS = {
  canDeleteProducts: (role: UserRole) => role === "owner",
  canViewCostPrice: (role: UserRole) => role === "owner" || role === "manager",
  canEditProduct: (role: UserRole) => role === "owner" || role === "manager",
  canManageStaff: (role: UserRole) => role === "owner",
  canViewReports: (role: UserRole) => role === "owner" || role === "manager",
  canChangeSettings: (role: UserRole) => role === "owner",
  canOverrideLowPrice: (role: UserRole) => role === "owner",
} as const;

export interface AuditLog {
  id: string;
  shopId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  resourceId?: string;
  timestamp: string;
  deletedUser?: boolean;
}

export interface ShopMeta {
  id: string;
  name: string;
  address: string;
  city: string;
  createdAt: string;
  ownerMobile: string;
  isDeleted: boolean;
}

export interface MobileSession {
  mobile: string;
  shopId: string;
  shopName: string;
  loginAt: string;
  userId?: string;
  userRole?: UserRole;
  allShopIds?: string[];
  selectedShopId?: string;
}

export interface QAChange {
  type:
    | "product_added"
    | "product_edited"
    | "product_deleted"
    | "stock_in"
    | "stock_out"
    | "invoice_created";
  description: string;
}

export interface DraftSnapshot {
  id: string;
  timestamp: string;
  label: string;
  products: Product[];
  batches: StockBatch[];
  transactions: StockTransaction[];
  invoices: Invoice[];
  qaChanges: QAChange[];
}

export type ReturnReason =
  | "Damaged"
  | "Wrong Product"
  | "Customer Changed Mind"
  | "Expiry Issue"
  | "Quality Problem"
  | "Other";

export interface ReturnEntry {
  id: string;
  shopId: string;
  itemName: string;
  productId: string;
  qtyReturned: number;
  returnValue: number;
  sellingPrice: number;
  lossAmount: number;
  reason: ReturnReason;
  remark: string;
  date: string;
  staffName: string;
  invoiceId?: string;
  isLoss: boolean;
}

export interface LowPriceAlertLog {
  id: string;
  shopId: string;
  productId: string;
  productName: string;
  staffName: string;
  enteredPrice: number;
  minSellPrice: number;
  costPrice: number;
  attemptType: "blocked" | "warned" | "overridden";
  pinUsed: boolean;
  timestamp: string;
}

// ─── Diamond Reward System ───────────────────────────────────────────────────

export type DiamondTier = "bronze" | "silver" | "gold" | "diamond";

export interface DiamondReward {
  id: string;
  shopId: string;
  userId: string;
  userName: string;
  productId: string;
  productName: string;
  cycleCompletedAt: string;
  diamondCount: number;
  /** How the diamond was earned */
  rewardType?: "transaction" | "feedback" | "referral";
  /** Linked feedback entry if rewardType === 'feedback' */
  feedbackId?: string;
  /** Linked referral signup if rewardType === 'referral' */
  referralId?: string;
}

// ─── Feedback & Reward System ────────────────────────────────────────────────

export type FeedbackType = "bug" | "feature" | "improvement";
export type FeedbackStatus = "pending" | "approved" | "rejected";

export interface FeedbackEntry {
  id: string;
  shopId: string;
  userId: string;
  userName: string;
  type: FeedbackType;
  title: string;
  description: string;
  status: FeedbackStatus;
  rewardGiven: boolean;
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

// ─── Referral System ─────────────────────────────────────────────────────────

export interface ReferralCode {
  id: string;
  shopId: string;
  userId: string;
  userName: string;
  code: string;
  createdAt: string;
  successfulSignups: number;
  totalDiamondsEarned: number;
}

export interface ReferralSignup {
  id: string;
  shopId: string;
  referralCodeId: string;
  referrerUserId: string;
  referrerName: string;
  newUserId: string;
  newUserName: string;
  newUserMobile: string;
  signupAt: string;
  rewardAwardedToReferrer: boolean;
  rewardAwardedToNewUser: boolean;
  deviceId: string;
  firstTransactionCompleted: boolean;
}

// ─── Draft Sale System ────────────────────────────────────────────────────────
// Used to save in-progress billing sessions so data is never lost.
// A DraftSale captures a partial or unsaved sale with customer info and cart items.

export interface CartDraftItem {
  productId: string;
  productName: string;
  quantity: number;
  sellingRate: number;
  purchaseCost: number;
  unit: string;
  batchId?: string;
  batchNumber?: string;
  profit: number;
  profitPercent: number;
}

export interface DraftSale {
  draftId: string;
  customerName: string;
  customerMobile: string;
  cartItems: CartDraftItem[];
  createdAt: string;
  updatedAt: string;
  totalAmount: number;
  status: "draft" | "completed";
}

export function getDiamondTier(total: number): DiamondTier {
  if (total >= 500) return "diamond";
  if (total >= 200) return "gold";
  if (total >= 50) return "silver";
  return "bronze";
}

export type NavPage =
  | "dashboard"
  | "owner-dashboard"
  | "inventory"
  | "stock"
  | "billing"
  | "customers"
  | "reports"
  | "admin"
  | "history"
  | "staff-performance"
  | "staff-credit"
  | "returns"
  | "settings"
  | "low-price-log"
  | "staff-management"
  | "audit-log"
  | "reminder-log"
  | "vendors"
  | "purchase-orders"
  | "customer-orders"
  | "cash-counter"
  | "diamond-rewards"
  | "rankings"
  | "shop-board"
  | "feedback-page"
  | "referral-page"
  | "drafts"
  | "attendance";

// ─── Vendor & Order System ────────────────────────────────────────────────────

export interface Vendor {
  id: string;
  shopId: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  createdAt: number;
  updatedAt: number;
}

export interface PurchaseOrder {
  id: string;
  shopId: string;
  vendorId: string;
  productId: string;
  qty: number;
  rate: number;
  transportCharge: number;
  labourCharge: number;
  otherCharges?: number;
  status: "pending" | "received" | "partial";
  receivedQty: number;
  receivedDate?: number;
  createdAt: number;
  createdBy: string;
}

export interface CustomerOrder {
  id: string;
  shopId: string;
  customerId: string;
  items: Array<{ productId: string; qty: number; price: number }>;
  totalAmount: number;
  status: "pending" | "accepted" | "rejected";
  rejectionReason?: string;
  createdAt: number;
  createdBy: string;
}

// ─── Vendor Rate History ──────────────────────────────────────────────────────

export interface VendorRateHistory {
  id: string;
  shopId: string;
  vendorId: string;
  productId: string;
  oldRate: number;
  newRate: number;
  changedAt: string;
  changedBy: string;
  notes?: string;
}

// ─── Attendance System ────────────────────────────────────────────────────────

export interface AttendanceRecord {
  id: string;
  shopId: string;
  staffId: string;
  staffName: string;
  staffRole: UserRole;
  /** ISO date YYYY-MM-DD */
  date: string;
  /** ISO timestamp or null if not clocked in yet */
  clockIn: string | null;
  /** ISO timestamp or null if not clocked out yet */
  clockOut: string | null;
  status: "present" | "absent" | "half-day";
  /** Calculated from clockIn/clockOut in hours */
  hoursWorked: number;
  notes?: string;
  createdAt: string;
}

/** Converts fractional hours to a readable string — e.g. 7.5 → '7h 30m', 0 → '—' */
export function formatHoursWorked(hours: number): string {
  if (!hours || hours <= 0) return "—";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Returns the effective attendance status for a record */
export function getAttendanceStatus(
  record: AttendanceRecord,
): "present" | "absent" | "half-day" | "not-clocked-in" {
  if (!record.clockIn) return "not-clocked-in";
  return record.status;
}

// ─── Role-Based Reminder System ──────────────────────────────────────────────

export interface ReminderLog {
  id: string;
  shopId: string;
  senderId: string;
  senderName: string;
  senderRole: "owner" | "manager" | "staff";
  customerId: string;
  customerName: string;
  customerMobile: string;
  message: string;
  sentAt: string;
  status: "sent" | "requested" | "approved" | "rejected";
  requestId?: string;
}

export interface ReminderRequest {
  id: string;
  shopId: string;
  staffId: string;
  staffName: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  dueAmount: number;
  requestedAt: string;
  approvalStatus: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: string;
}

// ─── Advertisement System ─────────────────────────────────────────────────────

export type AdType = "banner" | "card" | "reward" | "vendor";

export type AdStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "active"
  | "paused";

export interface Advertisement {
  id: string;
  shopId: string;
  type: AdType;
  title: string;
  description: string;
  imageUrl?: string;
  targetUrl?: string;
  vendorId?: string;
  vendorName?: string;
  status: AdStatus;
  rewardDiamonds?: number;
  createdAt: string;
  updatedAt: string;
  impressions: number;
  clicks: number;
  displayOrder: number;
  backgroundColor?: string;
  accentColor?: string;
  emoji?: string;
}

export interface WatchAdReward {
  id: string;
  shopId: string;
  userId: string;
  userName: string;
  adId: string;
  adTitle: string;
  diamondsEarned: number;
  watchedAt: string;
}

// ─── Rankings System ──────────────────────────────────────────────────────────

export interface RankingEntry {
  rank: number;
  id: string;
  name: string;
  value: number;
  secondaryValue?: number;
  badge?: string;
}

export interface RankingsData {
  topSellingProducts: RankingEntry[];
  highProfitProducts: RankingEntry[];
  topCustomers: RankingEntry[];
  topVendors: RankingEntry[];
  topStaff: RankingEntry[];
  lastUpdated: string;
}
