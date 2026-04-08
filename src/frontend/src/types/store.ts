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
}

export interface AppConfig {
  featureFlags: FeatureFlags;
  shopName?: string;
  allowMixedUnits: boolean;
  deadStockThresholdDays: number;
  deadStockCustomDays?: number;
  version: number;
  ownerPin?: string;
  /** true = Warning mode (allow with warning), false = Lock mode (block unless PIN/admin) */
  allowLowPriceSelling?: boolean;
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

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  creditBalance: number;
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
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string | null;
  customerName: string;
  customerMobile: string;
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

export interface MobileSession {
  mobile: string;
  shopId: string;
  shopName: string;
  loginAt: string;
  userId?: string;
  userRole?: UserRole;
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

export type NavPage =
  | "dashboard"
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
  | "audit-log";
