import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";
import type {
  AppConfig,
  AppUser,
  AttendanceRecord,
  AuditLog,
  AutoModeType,
  CartDraftItem,
  Category,
  Customer,
  CustomerOrder,
  DashboardSectionConfig,
  DiamondReward,
  DraftSale,
  DraftSnapshot,
  FeatureFlags,
  FeedbackEntry,
  FeedbackType,
  Invoice,
  InvoiceItem,
  LowPriceAlertLog,
  PaymentRecord,
  Product,
  PurchaseOrder,
  QAChange,
  ReferralCode,
  ReferralSignup,
  ReminderLog,
  ReminderRequest,
  ReturnEntry,
  ShopSettings,
  ShopUnit,
  StockBatch,
  StockTransaction,
  UserRole,
  Vendor,
  VendorRateHistory,
} from "../types/store";
import {
  STORAGE_KEYS,
  loadAutoMode,
  loadData,
  loadDrafts,
  saveAutoMode,
  saveData,
  saveDrafts,
} from "../utils/localStorage";
import { useAuth, useAuthUserSync } from "./AuthContext";

// Re-export AppUser for compatibility
export type { AppUser };

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Device fingerprint for referral fraud prevention ─────────────────────────
// Returns a stable per-device ID stored in localStorage.
// Fingerprint = hash of userAgent + screen dimensions + random salt (first time).
function getDeviceId(): string {
  const existing = localStorage.getItem("referral_device_id");
  if (existing) return existing;
  const raw = `${navigator.userAgent}|${screen.width}x${screen.height}|${Math.random().toString(36)}`;
  // Simple hash: sum of charCodes converted to base-36
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  const id = `dev_${hash.toString(36)}_${Date.now().toString(36)}`;
  localStorage.setItem("referral_device_id", id);
  return id;
}

// Returns the referral code this device has already claimed (if any).
function getDeviceUsedReferralCode(): string | null {
  return localStorage.getItem("referral_device_used_code");
}

// Marks a referral code as used on this device (prevents re-use).
function setDeviceUsedReferralCode(code: string): void {
  localStorage.setItem("referral_device_used_code", code);
}

// Walk-in customer identifier — never added to ledger
const WALK_IN_NAME = "Walk-in Customer";

function isWalkIn(name: string): boolean {
  return (
    name.trim().toLowerCase() === WALK_IN_NAME.toLowerCase() ||
    name.trim() === ""
  );
}

// ─── Normalise mobile for dedup key ──────────────────────────────────────────
function normMobile(mobile: string): string {
  return (mobile ?? "").trim().replace(/\D/g, "");
}

// ─── Context Types ─────────────────────────────────────────────────────────────────────
interface FIFOResult {
  deductedBatches: {
    batchId: string;
    quantity: number;
    purchaseRate: number;
  }[];
  totalCost: number;
  success: boolean;
  availableQty: number;
}

export interface CustomerLedger {
  customerName: string;
  customerMobile: string;
  /** Address from most recent invoice or customer record */
  customerAddress?: string;
  totalPurchase: number;
  totalPaid: number;
  totalDue: number;
  invoices: Invoice[];
}

/** Result returned when a new invoice is created */
export interface CreateInvoiceResult {
  invoice: Invoice;
  /** true if an existing customer with same mobile was found and due was merged */
  mergedExisting: boolean;
}

interface StoreContextValue {
  // Data
  categories: Category[];
  products: Product[];
  batches: StockBatch[];
  transactions: StockTransaction[];
  customers: Customer[];
  invoices: Invoice[];
  users: AppUser[];
  shopUnits: ShopUnit[];
  shopId: string;
  payments: PaymentRecord[];

  // Loading state
  isLoading: boolean;

  // Actor connection error (null = no error)
  actorError: string | null;

  // Refresh system
  refreshCounter: number;
  triggerRefresh: () => void;

  // ICP sync indicator
  isSyncing: boolean;

  // Shop Settings
  shopSettings: ShopSettings;
  updateShopSettings: (s: Partial<ShopSettings>) => void;

  // Category CRUD
  addCategory: (name: string) => string;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;

  // Product CRUD
  addProduct: (p: Omit<Product, "id">) => string;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Stock
  addStockIn: (
    productId: string,
    quantity: number,
    purchaseRate: number,
    date: string,
    note: string,
    invoiceNo?: string,
    billNo?: string,
    transportCharge?: number,
    labourCharge?: number,
    expiryDate?: string,
    lengthQty?: number,
    weightQty?: number,
    otherCharges?: number,
  ) => void;
  addStockOut: (productId: string, quantity: number, note: string) => void;
  getProductStock: (productId: string) => number;
  getProductBatches: (productId: string) => StockBatch[];
  getStockValue: (productId: string) => number;
  getTotalStockValue: () => number;
  calculateFIFOCost: (productId: string, quantity: number) => FIFOResult;

  // Customer CRUD
  addCustomer: (c: Omit<Customer, "id">) => void;
  updateCustomer: (id: string, c: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Invoice
  createInvoice: (
    data: Omit<Invoice, "id" | "invoiceNumber">,
  ) => CreateInvoiceResult;
  getNextInvoiceNumber: () => string;

  // Payment
  receivePayment: (
    customerId: string,
    customerName: string,
    customerMobile: string,
    amount: number,
    note: string,
    paymentMode?: "cash" | "upi" | "online",
  ) => void;

  // Ledger helpers
  getTotalCreditDue: () => number;
  getCustomerLedger: (
    customerName: string,
    customerMobile: string,
  ) => CustomerLedger;
  getAllCustomerLedgers: () => CustomerLedger[];

  /** Scan all invoices, merge any duplicate mobile entries, return how many were merged */
  mergeDuplicateCustomers: () => number;

  // Users CRUD (per-shop)
  addUser: (u: Omit<AppUser, "id">) => void;
  updateUser: (id: string, u: Partial<AppUser>) => void;
  deleteUser: (id: string) => void;

  // Shop Units CRUD
  addShopUnit: (name: string) => void;
  deleteShopUnit: (id: string) => void;

  // Stats
  getDailySales: (date: string) => Invoice[];
  getLastSoldDate: (productId: string) => string | null;
  getTodaySales: () => number;
  getTodayProfit: () => number;
  getTotalProfit: () => number;
  getTotalInvestment: () => number;
  getLowStockProducts: () => Product[];

  // Profit helpers
  getProductCostPrice: (productId: string) => number;
  getProductProfit: (productId: string) => number;
  getProductProfitPct: (productId: string) => number;

  // Returns
  returns: ReturnEntry[];
  addReturn: (
    entry: Omit<
      ReturnEntry,
      "id" | "shopId" | "date" | "lossAmount" | "isLoss"
    >,
  ) => Promise<boolean>;
  getReturnReport: (dateFilter?: string) => {
    totalReturnValue: number;
    totalLoss: number;
    topReason: string;
    topReasonCount: number;
    returnsToday: ReturnEntry[];
  };

  // Draft / History (DraftSnapshot — ICP-backed snapshots)
  getDrafts: () => Promise<DraftSnapshot[]>;
  saveDraftNow: (label: string) => Promise<void>;
  restoreDraft: (snapshotId: string) => Promise<void>;

  // Draft Sale System (localStorage-only — saves in-progress billing sessions)
  // ICP backend is intentionally out of scope for draft sales (localStorage only).
  draftSales: DraftSale[];
  saveDraft: (draft: DraftSale) => void;
  deleteDraft: (draftId: string) => void;
  getDraftById: (draftId: string) => DraftSale | undefined;
  markDraftCompleted: (draftId: string) => void;

  // App Config & Feature Flags
  appConfig: AppConfig;
  featureFlags: FeatureFlags;
  saveAppConfig: (config: Partial<AppConfig>) => Promise<void>;
  setFeatureFlag: (flag: keyof FeatureFlags, value: boolean) => Promise<void>;
  setDashboardSection: (
    key: keyof DashboardSectionConfig,
    value: boolean,
  ) => Promise<void>;
  /** Set feature mode (1=Basic, 2=Normal, 3=Advance, 4=Super) — saved per-shop in localStorage */
  setFeatureMode: (mode: 1 | 2 | 3 | 4) => void;
  /** Auto Mode: 'simple' | 'smart' | 'pro' — high-level 3-mode abstraction */
  autoMode: AutoModeType;
  /** Switch auto mode. Automatically syncs featureMode. Persisted per-shop. */
  setAutoMode: (mode: AutoModeType) => void;

  // Low Price Alert Log
  lowPriceAlertLogs: LowPriceAlertLog[];
  addLowPriceAlertLog: (log: Omit<LowPriceAlertLog, "id">) => void;

  // Audit Logs
  auditLogs: AuditLog[];
  addAuditLog: (action: string, details: string, resourceId?: string) => void;
  getAuditLogs: () => AuditLog[];

  // Reminder System
  reminderLogs: ReminderLog[];
  reminderRequests: ReminderRequest[];
  sendReminder: (customer: CustomerLedger, sentBy: AppUser) => Promise<void>;
  requestReminder: (
    customer: CustomerLedger,
    requestedBy: AppUser,
  ) => Promise<void>;
  approveReminderRequest: (
    requestId: string,
    approvedBy: AppUser,
  ) => Promise<void>;
  rejectReminderRequest: (
    requestId: string,
    rejectedBy: AppUser,
  ) => Promise<void>;
  getReminderCountToday: (staffId: string, customerId: string) => number;
  getPendingReminderRequests: () => ReminderRequest[];

  // Vendor System
  vendors: Vendor[];
  addVendor: (
    v: Omit<Vendor, "id" | "shopId" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateVendor: (id: string, changes: Partial<Vendor>) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;

  // Purchase Orders
  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (
    po: Omit<PurchaseOrder, "id" | "shopId" | "createdAt">,
  ) => Promise<void>;
  updatePurchaseOrder: (
    id: string,
    changes: Partial<PurchaseOrder>,
  ) => Promise<void>;
  markPurchaseReceived: (id: string, receivedQty: number) => Promise<void>;

  // Customer Orders
  customerOrders: CustomerOrder[];
  addCustomerOrder: (
    co: Omit<CustomerOrder, "id" | "shopId" | "createdAt">,
  ) => Promise<void>;
  acceptCustomerOrder: (id: string) => Promise<void>;
  rejectCustomerOrder: (id: string, reason: string) => Promise<void>;

  // Vendor Rate History
  vendorRateHistory: VendorRateHistory[];
  addVendorRateHistory: (
    entry: Omit<VendorRateHistory, "id" | "shopId" | "changedAt">,
  ) => Promise<void>;
  getLastVendorRate: (vendorId: string, productId: string) => number | null;
  getVendorRateHistoryForVendor: (vendorId: string) => VendorRateHistory[];

  // Diamond Reward System
  diamondRewards: DiamondReward[];
  awardDiamond: (productId: string, productName: string) => void;
  getTotalDiamonds: () => number;

  // Feedback System
  feedbackList: FeedbackEntry[];
  submitFeedback: (
    type: FeedbackType,
    title: string,
    description: string,
  ) => void;
  approveFeedback: (feedbackId: string, approvedBy: string) => void;
  rejectFeedback: (feedbackId: string, reason: string) => void;

  // Referral System
  referralCodes: ReferralCode[];
  referralSignups: ReferralSignup[];
  getOrCreateReferralCode: () => ReferralCode;
  awardReferralDiamonds: (referralSignupId: string) => void;
  /** Check if this device has already claimed a referral code different from `code`.
   *  Returns an error string if blocked, or null if allowed. */
  checkReferralDeviceFraud: (code: string) => string | null;
  /** Record a new referral signup from this device with the given referral code.
   *  Persists deviceId and marks the device as having used this code. */
  recordReferralSignup: (
    referralCode: ReferralCode,
    newUserId: string,
    newUserName: string,
    newUserMobile: string,
  ) => void;

  // Attendance System
  attendanceRecords: AttendanceRecord[];
  clockIn: (
    staffId: string,
    staffName: string,
    staffRole: UserRole,
  ) => AttendanceRecord;
  clockOut: (staffId: string) => AttendanceRecord | null;
  getAttendanceForDate: (date: string) => AttendanceRecord[];
  getAttendanceForStaff: (staffId: string, month: string) => AttendanceRecord[];
  updateAttendance: (id: string, updates: Partial<AttendanceRecord>) => void;

  // Bulk Reminder
  bulkReminderSentAt: string | null;
  sendBulkReminder: () => { sent: number; customers: Customer[] };
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { currentShop, currentUser } = useAuth();
  const syncUsersToAuth = useAuthUserSync();
  const shopId =
    currentShop?.id ?? localStorage.getItem("last_shop_id") ?? "shop-default";

  useEffect(() => {
    if (shopId && shopId !== "shop-default") {
      localStorage.setItem("last_shop_id", shopId);
    }
  }, [shopId]);

  // ── Actor state & ref ─────────────────────────────────────────────────────────────────────
  const [actor, setActor] = useState<backendInterface | null>(null);
  const actorRef = useRef<backendInterface | null>(null);
  const [actorError, setActorError] = useState<string | null>(null);

  useEffect(() => {
    createActorWithConfig()
      .then((a) => {
        setActorError(null);
        setActor(a);
      })
      .catch((err) => {
        console.error("[StoreContext] Actor creation failed:", err);
        setActorError(err instanceof Error ? err.message : "Connection failed");
        // Still mark loading as done so app doesn't stay blank
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    actorRef.current = actor;
  }, [actor]);

  // ── Loading state ─────────────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);

  // ── Refresh counter — incremented after every mutation so consumers can react ─
  const [refreshCounter, setRefreshCounter] = useState(0);
  const triggerRefresh = useCallback(() => {
    setRefreshCounter((c) => c + 1);
  }, []);

  // ── ICP sync status (yellow = in-flight, green = settled) ─────────────────
  const [isSyncing, setIsSyncing] = useState(false);

  // ── Helper: fire ICP call with syncing indicator ───────────────────────────
  const withSync = useCallback((icpPromise: Promise<unknown> | undefined) => {
    if (!icpPromise) return;
    setIsSyncing(true);
    icpPromise.then(() => setIsSyncing(false)).catch(() => setIsSyncing(false));
  }, []);

  // Expose withSync as a ref so it can be used in callbacks without stale closure
  const withSyncRef = useRef(withSync);
  useEffect(() => {
    withSyncRef.current = withSync;
  }, [withSync]);

  // Fallback: if actor never initializes, stop loading after 8s so app doesn't stay stuck
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [batches, setBatches] = useState<StockBatch[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [shopUnits, setShopUnits] = useState<ShopUnit[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [returns, setReturns] = useState<ReturnEntry[]>([]);
  const returnsRef = useRef<ReturnEntry[]>([]);
  const [lowPriceAlertLogs, setLowPriceAlertLogs] = useState<
    LowPriceAlertLog[]
  >([]);
  const lowPriceAlertLogsRef = useRef<LowPriceAlertLog[]>([]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const auditLogsRef = useRef<AuditLog[]>([]);

  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>([]);
  const reminderLogsRef = useRef<ReminderLog[]>([]);
  const [reminderRequests, setReminderRequests] = useState<ReminderRequest[]>(
    [],
  );
  const reminderRequestsRef = useRef<ReminderRequest[]>([]);

  // ── Vendor / Purchase Order / Customer Order state ────────────────────────
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const vendorsRef = useRef<Vendor[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const purchaseOrdersRef = useRef<PurchaseOrder[]>([]);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const customerOrdersRef = useRef<CustomerOrder[]>([]);
  const [vendorRateHistory, setVendorRateHistory] = useState<
    VendorRateHistory[]
  >([]);
  const vendorRateHistoryRef = useRef<VendorRateHistory[]>([]);

  // ── Diamond Reward state ──────────────────────────────────────────────────
  const [diamondRewards, setDiamondRewards] = useState<DiamondReward[]>(() =>
    loadData<DiamondReward[]>(STORAGE_KEYS.diamondRewards, []),
  );
  const diamondRewardsRef = useRef<DiamondReward[]>(
    loadData<DiamondReward[]>(STORAGE_KEYS.diamondRewards, []),
  );

  // ── Feedback state ────────────────────────────────────────────────────────
  const [feedbackList, setFeedbackList] = useState<FeedbackEntry[]>(() =>
    loadData<FeedbackEntry[]>(STORAGE_KEYS.feedback, []),
  );
  const feedbackListRef = useRef<FeedbackEntry[]>(
    loadData<FeedbackEntry[]>(STORAGE_KEYS.feedback, []),
  );

  // ── Referral state ────────────────────────────────────────────────────────
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>(() =>
    loadData<ReferralCode[]>(STORAGE_KEYS.referralCodes, []),
  );
  const referralCodesRef = useRef<ReferralCode[]>(
    loadData<ReferralCode[]>(STORAGE_KEYS.referralCodes, []),
  );

  const [referralSignups, setReferralSignups] = useState<ReferralSignup[]>(() =>
    loadData<ReferralSignup[]>(STORAGE_KEYS.referralSignups, []),
  );
  const referralSignupsRef = useRef<ReferralSignup[]>(
    loadData<ReferralSignup[]>(STORAGE_KEYS.referralSignups, []),
  );

  // ── Attendance state ──────────────────────────────────────────────────────
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >(() =>
    loadData<AttendanceRecord[]>(
      `attendanceRecords_${localStorage.getItem("last_shop_id") ?? "shop-default"}`,
      [],
    ),
  );
  const attendanceRecordsRef = useRef<AttendanceRecord[]>(
    loadData<AttendanceRecord[]>(
      `attendanceRecords_${localStorage.getItem("last_shop_id") ?? "shop-default"}`,
      [],
    ),
  );

  // ── Bulk reminder sentAt (per shop) ───────────────────────────────────────
  const [bulkReminderSentAt, setBulkReminderSentAt] = useState<string | null>(
    () =>
      localStorage.getItem(
        `bulkReminderSentAt_${localStorage.getItem("last_shop_id") ?? "shop-default"}`,
      ) ?? null,
  );

  // ── Draft Sale state (localStorage only — ICP backend out of scope) ───────
  // draftSales is scoped per-shop via loadDrafts/saveDrafts.
  // shopId is not stable at this point in initialization (may still be default),
  // so we initialise lazily on first access or on shopId effect below.
  const [draftSales, setDraftSales] = useState<DraftSale[]>([]);
  const draftSalesRef = useRef<DraftSale[]>([]);

  // ── Transaction counter for diamond rewards (1 diamond per 10 transactions) ──
  // Key is per-shop so different shops don't share a counter
  const txCounterRef = useRef<number>(
    loadData<number>(
      `transactionCounter_${localStorage.getItem("last_shop_id") ?? "shop-default"}`,
      0,
    ),
  );

  // ── Shop Settings (localStorage per shop) ──────────────────────────────────────────────
  const [shopSettings, setShopSettings] = useState<ShopSettings>(() => {
    try {
      const sid = localStorage.getItem("last_shop_id") ?? "shop-default";
      const raw = localStorage.getItem(`shopSettings_${sid}`);
      if (raw) return JSON.parse(raw) as ShopSettings;
    } catch (_) {
      // ignore parse errors
    }
    return { allowMixedUnits: false, deadStockThresholdDays: 90 };
  });

  // Re-load settings when shopId changes
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`shopSettings_${shopId}`);
      if (raw) {
        setShopSettings(JSON.parse(raw) as ShopSettings);
      } else {
        setShopSettings({ allowMixedUnits: false, deadStockThresholdDays: 90 });
      }
    } catch (_) {
      setShopSettings({ allowMixedUnits: false, deadStockThresholdDays: 90 });
    }
  }, [shopId]);

  const updateShopSettings = useCallback(
    (s: Partial<ShopSettings>) => {
      setShopSettings((prev) => {
        const updated = { ...prev, ...s };
        localStorage.setItem(`shopSettings_${shopId}`, JSON.stringify(updated));
        return updated;
      });
    },
    [shopId],
  );

  // ── App Config (localStorage per shop) ──────────────────────────────────────────────
  const DEFAULT_APP_CONFIG: AppConfig = {
    featureFlags: {
      expiry: true,
      deadStock: true,
      rental: false,
      service: false,
      staff: true,
      credit: true,
      discount: true,
      customerTracking: false,
    },
    allowMixedUnits: false,
    deadStockThresholdDays: 90,
    version: 1,
  };

  const [appConfig, setAppConfig] = useState<AppConfig>(() => {
    try {
      const sid = localStorage.getItem("last_shop_id") ?? "shop-default";
      const raw = localStorage.getItem(`appConfig_${sid}`);
      const modeRaw = localStorage.getItem(`feature_mode_${sid}`);
      // Migrate: old mode 3 (Super) maps to new mode 4; default for new users is 1 (Basic)
      const rawMode = modeRaw ? Number(modeRaw) : null;
      const featureMode = (rawMode === 3 ? 4 : (rawMode ?? 1)) as 1 | 2 | 3 | 4;
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppConfig>;
        return { ...DEFAULT_APP_CONFIG, ...parsed, featureMode } as AppConfig;
      }
    } catch (_) {
      // ignore parse errors
    }
    return { ...DEFAULT_APP_CONFIG, featureMode: 1 };
  });

  // Re-load appConfig when shopId changes
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`appConfig_${shopId}`);
      const modeRaw = localStorage.getItem(`feature_mode_${shopId}`);
      // Migrate: old mode 3 (Super) maps to new mode 4; default for new users is 1 (Basic)
      const rawMode = modeRaw ? Number(modeRaw) : null;
      const featureMode = (rawMode === 3 ? 4 : (rawMode ?? 1)) as 1 | 2 | 3 | 4;
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppConfig>;
        setAppConfig({
          ...DEFAULT_APP_CONFIG,
          ...parsed,
          featureMode,
        } as AppConfig);
      } else {
        setAppConfig({ ...DEFAULT_APP_CONFIG, featureMode });
      }
    } catch (_) {
      setAppConfig({ ...DEFAULT_APP_CONFIG, featureMode: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId]);

  const saveAppConfig = useCallback(
    async (config: Partial<AppConfig>): Promise<void> => {
      setAppConfig((prev) => {
        const updated = { ...prev, ...config };
        localStorage.setItem(`appConfig_${shopId}`, JSON.stringify(updated));
        return updated;
      });
    },
    [shopId],
  );

  const setFeatureFlag = useCallback(
    async (flag: keyof FeatureFlags, value: boolean): Promise<void> => {
      setAppConfig((prev) => {
        const updated: AppConfig = {
          ...prev,
          featureFlags: { ...prev.featureFlags, [flag]: value },
        };
        localStorage.setItem(`appConfig_${shopId}`, JSON.stringify(updated));
        return updated;
      });
    },
    [shopId],
  );

  const setDashboardSection = useCallback(
    async (
      key: keyof DashboardSectionConfig,
      value: boolean,
    ): Promise<void> => {
      setAppConfig((prev) => {
        const updated: AppConfig = {
          ...prev,
          dashboardSections: { ...prev.dashboardSections, [key]: value },
        };
        localStorage.setItem(`appConfig_${shopId}`, JSON.stringify(updated));
        return updated;
      });
    },
    [shopId],
  );

  const setFeatureMode = useCallback(
    (mode: 1 | 2 | 3 | 4): void => {
      localStorage.setItem(`feature_mode_${shopId}`, String(mode));
      setAppConfig((prev) => {
        const updated: AppConfig = { ...prev, featureMode: mode };
        localStorage.setItem(`appConfig_${shopId}`, JSON.stringify(updated));
        return updated;
      });
    },
    [shopId],
  );

  // ── Auto Mode (3-mode abstraction: simple | smart | pro) ─────────────────
  // Maps: simple→featureMode 1, smart→featureMode 3, pro→featureMode 4
  const [autoMode, setAutoModeState] = useState<AutoModeType>(() =>
    loadAutoMode(localStorage.getItem("last_shop_id") ?? "shop-default"),
  );

  // Re-load autoMode when shopId changes
  useEffect(() => {
    const saved = loadAutoMode(shopId);
    setAutoModeState(saved);
    // Sync featureMode to match the loaded autoMode
    const mapped: 1 | 2 | 3 | 4 =
      saved === "pro" ? 4 : saved === "smart" ? 3 : 1;
    localStorage.setItem(`feature_mode_${shopId}`, String(mapped));
    setAppConfig((prev) => {
      const updated: AppConfig = {
        ...prev,
        featureMode: mapped,
        autoMode: saved,
      };
      localStorage.setItem(`appConfig_${shopId}`, JSON.stringify(updated));
      return updated;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId]);

  const setAutoMode = useCallback(
    (mode: AutoModeType): void => {
      const mapped: 1 | 2 | 3 | 4 =
        mode === "pro" ? 4 : mode === "smart" ? 3 : 1;
      saveAutoMode(shopId, mode);
      setAutoModeState(mode);
      localStorage.setItem(`feature_mode_${shopId}`, String(mapped));
      setAppConfig((prev) => {
        const updated: AppConfig = {
          ...prev,
          featureMode: mapped,
          autoMode: mode,
        };
        localStorage.setItem(`appConfig_${shopId}`, JSON.stringify(updated));
        return updated;
      });
    },
    [shopId],
  );

  // ── Refs for stale-closure-free access in callbacks ──────────────────────────────────────────
  const productsRef = useRef(products);
  const batchesRef = useRef(batches);
  const transactionsRef = useRef(transactions);
  const invoicesRef = useRef(invoices);
  const shopIdRef = useRef(shopId);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);
  useEffect(() => {
    batchesRef.current = batches;
  }, [batches]);
  useEffect(() => {
    transactionsRef.current = transactions;
  }, [transactions]);
  useEffect(() => {
    invoicesRef.current = invoices;
  }, [invoices]);
  useEffect(() => {
    shopIdRef.current = shopId;
    // Reload transaction counter for the new shopId
    txCounterRef.current = loadData<number>(`transactionCounter_${shopId}`, 0);
    // Reload draft sales for the new shopId
    const loaded = loadDrafts(shopId);
    draftSalesRef.current = loaded;
    setDraftSales(loaded);
    // Reload attendance records for the new shopId
    const loadedAttendance = loadData<AttendanceRecord[]>(
      `attendanceRecords_${shopId}`,
      [],
    );
    attendanceRecordsRef.current = loadedAttendance;
    setAttendanceRecords(loadedAttendance);
    // Reload bulk reminder sentAt for the new shopId
    const sentAt = localStorage.getItem(`bulkReminderSentAt_${shopId}`) ?? null;
    setBulkReminderSentAt(sentAt);
  }, [shopId]);

  // ── Auto-trigger refresh when key data arrays change (post-mutation sync) ──
  // This is intentionally using individual change tracking via a combined ref
  const _prevDataSig = useRef("");
  useEffect(() => {
    const sig = [
      products.length,
      batches.length,
      invoices.length,
      customers.length,
      payments.length,
      returns.length,
    ].join(",");
    if (sig !== _prevDataSig.current) {
      _prevDataSig.current = sig;
      triggerRefresh();
    }
  });

  // ── Load all data from ICP backend when shopId & actor are ready ─────────
  useEffect(() => {
    if (!shopId || !actor) return;

    // ── 2b: Pre-populate from localStorage for instant render (ICP will overwrite) ──
    const cachedProducts = loadData<Product[]>(STORAGE_KEYS.products, []);
    if (cachedProducts.length > 0) setProducts(cachedProducts);
    const cachedCustomers = loadData<Customer[]>(STORAGE_KEYS.customers, []);
    if (cachedCustomers.length > 0) setCustomers(cachedCustomers);
    const cachedBatches = loadData<StockBatch[]>(STORAGE_KEYS.batches, []);
    if (cachedBatches.length > 0) {
      setBatches(cachedBatches);
      batchesRef.current = cachedBatches;
    }
    const cachedInvoices = loadData<Invoice[]>(STORAGE_KEYS.sales, []);
    if (cachedInvoices.length > 0) {
      setInvoices(cachedInvoices);
      invoicesRef.current = cachedInvoices;
    }
    const cachedPayments = loadData<PaymentRecord[]>(STORAGE_KEYS.payments, []);
    if (cachedPayments.length > 0) setPayments(cachedPayments);
    const cachedReturns = loadData<ReturnEntry[]>(STORAGE_KEYS.returns, []);
    if (cachedReturns.length > 0) {
      setReturns(cachedReturns);
      returnsRef.current = cachedReturns;
    }
    const cachedVendors = loadData<Vendor[]>(STORAGE_KEYS.vendors, []);
    if (cachedVendors.length > 0) {
      setVendors(cachedVendors);
      vendorsRef.current = cachedVendors;
    }
    const cachedPOs = loadData<PurchaseOrder[]>(
      STORAGE_KEYS.purchaseOrders,
      [],
    );
    if (cachedPOs.length > 0) {
      setPurchaseOrders(cachedPOs);
      purchaseOrdersRef.current = cachedPOs;
    }
    const cachedCOs = loadData<CustomerOrder[]>(
      STORAGE_KEYS.customerOrders,
      [],
    );
    if (cachedCOs.length > 0) {
      setCustomerOrders(cachedCOs);
      customerOrdersRef.current = cachedCOs;
    }
    const cachedVRH = loadData<VendorRateHistory[]>(
      STORAGE_KEYS.vendorRateHistory,
      [],
    );
    if (cachedVRH.length > 0) {
      setVendorRateHistory(cachedVRH);
      vendorRateHistoryRef.current = cachedVRH;
    }

    setIsLoading(true);
    console.log(
      `[StoreContext] === Loading shop from ICP backend: ${shopId} ===`,
    );
    Promise.all([
      actor.getProducts(shopId),
      actor.getCategories(shopId),
      actor.getBatches(shopId),
      actor.getTransactions(shopId),
      actor.getCustomers(shopId),
      actor.getInvoices(shopId),
      actor.getUsers(shopId),
      actor.getShopUnits(shopId),
      actor.getPayments(shopId),
      actor.getReturns(shopId),
    ])
      .then(
        ([
          productsRaw,
          categoriesRaw,
          batchesRaw,
          transactionsRaw,
          customersRaw,
          invoicesRaw,
          usersRaw,
          shopUnitsRaw,
          paymentsRaw,
          returnsRaw,
        ]) => {
          const loadedProducts = productsRaw
            ? (JSON.parse(productsRaw) as Product[])
            : [];
          console.log(
            "[StoreContext] products loaded:",
            loadedProducts.length,
            loadedProducts,
          );
          setProducts(loadedProducts);
          if (loadedProducts.length > 0)
            saveData(STORAGE_KEYS.products, loadedProducts);

          const loadedCategories = categoriesRaw
            ? (JSON.parse(categoriesRaw) as Category[])
            : [];
          setCategories(loadedCategories);

          const loadedBatches = batchesRaw
            ? (JSON.parse(batchesRaw) as StockBatch[])
            : [];
          setBatches(loadedBatches);
          if (loadedBatches.length > 0)
            saveData(STORAGE_KEYS.batches, loadedBatches);

          const loadedTransactions = transactionsRaw
            ? (JSON.parse(transactionsRaw) as StockTransaction[])
            : [];
          setTransactions(loadedTransactions);

          const loadedCustomers = customersRaw
            ? (JSON.parse(customersRaw) as Customer[])
            : [];
          setCustomers(loadedCustomers);
          if (loadedCustomers.length > 0)
            saveData(STORAGE_KEYS.customers, loadedCustomers);

          const loadedInvoices = invoicesRaw
            ? (JSON.parse(invoicesRaw) as Invoice[])
            : [];
          setInvoices(loadedInvoices);
          invoicesRef.current = loadedInvoices;
          if (loadedInvoices.length > 0)
            saveData(STORAGE_KEYS.sales, loadedInvoices);

          const loadedUsers = usersRaw
            ? (JSON.parse(usersRaw) as AppUser[])
            : [];
          setUsers(loadedUsers);
          // Sync loaded users to AuthContext so role resolution works
          if (syncUsersToAuth) syncUsersToAuth(loadedUsers);

          setShopUnits(
            shopUnitsRaw ? (JSON.parse(shopUnitsRaw) as ShopUnit[]) : [],
          );

          const loadedPayments = paymentsRaw
            ? (JSON.parse(paymentsRaw) as PaymentRecord[])
            : [];
          setPayments(loadedPayments);
          if (loadedPayments.length > 0)
            saveData(STORAGE_KEYS.payments, loadedPayments);

          const loadedReturns = returnsRaw
            ? (JSON.parse(returnsRaw) as ReturnEntry[])
            : [];
          setReturns(loadedReturns);
          returnsRef.current = loadedReturns;
          if (loadedReturns.length > 0)
            saveData(STORAGE_KEYS.returns, loadedReturns);

          // Load low price alert logs
          (actorRef.current as any)
            ?.getLowPriceAlertLogs?.(shopId)
            .then((raw: string | null) => {
              const logs = raw ? (JSON.parse(raw) as LowPriceAlertLog[]) : [];
              setLowPriceAlertLogs(logs);
              lowPriceAlertLogsRef.current = logs;
            })
            .catch(() => {});

          // Load audit logs
          (actorRef.current as any)
            ?.getAuditLogs?.(shopId)
            .then((raw: string | null) => {
              const logs = raw ? (JSON.parse(raw) as AuditLog[]) : [];
              setAuditLogs(logs);
              auditLogsRef.current = logs;
            })
            .catch(() => {});

          // Load reminder logs
          (actorRef.current as any)
            ?.getReminderLogs?.(shopId)
            .then((raw: string | null) => {
              const logs = raw ? (JSON.parse(raw) as ReminderLog[]) : [];
              setReminderLogs(logs);
              reminderLogsRef.current = logs;
            })
            .catch(() => {});

          // Load reminder requests
          (actorRef.current as any)
            ?.getReminderRequests?.(shopId)
            .then((raw: string | null) => {
              const reqs = raw ? (JSON.parse(raw) as ReminderRequest[]) : [];
              setReminderRequests(reqs);
              reminderRequestsRef.current = reqs;
            })
            .catch(() => {});

          // Load vendors
          (actorRef.current as any)
            ?.getVendors?.(shopId)
            .then((raw: string | null) => {
              const data = raw ? (JSON.parse(raw) as Vendor[]) : [];
              setVendors(data);
              vendorsRef.current = data;
              if (data.length > 0) saveData(STORAGE_KEYS.vendors, data);
            })
            .catch(() => {});

          // Load purchase orders
          (actorRef.current as any)
            ?.getPurchaseOrders?.(shopId)
            .then((raw: string | null) => {
              const data = raw ? (JSON.parse(raw) as PurchaseOrder[]) : [];
              setPurchaseOrders(data);
              purchaseOrdersRef.current = data;
              if (data.length > 0) saveData(STORAGE_KEYS.purchaseOrders, data);
            })
            .catch(() => {});

          // Load customer orders
          (actorRef.current as any)
            ?.getCustomerOrders?.(shopId)
            .then((raw: string | null) => {
              const data = raw ? (JSON.parse(raw) as CustomerOrder[]) : [];
              setCustomerOrders(data);
              customerOrdersRef.current = data;
              if (data.length > 0) saveData(STORAGE_KEYS.customerOrders, data);
            })
            .catch(() => {});

          // Load vendor rate history
          (actorRef.current as any)
            ?.getVendorRateHistory?.(shopId)
            .then((raw: string | null) => {
              const data = raw ? (JSON.parse(raw) as VendorRateHistory[]) : [];
              setVendorRateHistory(data);
              vendorRateHistoryRef.current = data;
              if (data.length > 0)
                saveData(STORAGE_KEYS.vendorRateHistory, data);
            })
            .catch(() => {});
        },
      )
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [shopId, actor, syncUsersToAuth]);

  // ── Draft / Snapshot helper (stable via ref pattern) ──────────────────────────────────────────
  const saveDraftBeforeChangeRef = useRef(
    (
      label: string,
      qaChanges: QAChange[],
      currentProducts: Product[],
      currentBatches: StockBatch[],
      currentTransactions: StockTransaction[],
      currentInvoices: Invoice[],
    ) => {
      const sid = shopIdRef.current;
      const ac = actorRef.current;
      if (!ac) return;
      // Fire-and-forget: fetch existing drafts, prepend new snapshot, save
      ac.getDrafts(sid)
        .then((raw) => {
          const existing: DraftSnapshot[] = raw ? JSON.parse(raw) : [];
          const snap: DraftSnapshot = {
            id: generateId(),
            timestamp: new Date().toISOString(),
            label,
            products: currentProducts,
            batches: currentBatches,
            transactions: currentTransactions,
            invoices: currentInvoices,
            qaChanges,
          };
          return ac.saveDrafts(
            sid,
            JSON.stringify([snap, ...existing].slice(0, 10)),
          );
        })
        .catch(console.error);
    },
  );

  // ── Category CRUD ─────────────────────────────────────────────────────────────────────────
  const addCategory = useCallback((name: string): string => {
    const id = generateId();
    setCategories((prev) => {
      const updated = [...prev, { id, name }];
      actorRef.current?.saveCategories(
        shopIdRef.current,
        JSON.stringify(updated),
      );
      return updated;
    });
    return id;
  }, []);

  const updateCategory = useCallback((id: string, name: string) => {
    setCategories((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, name } : c));
      actorRef.current?.saveCategories(
        shopIdRef.current,
        JSON.stringify(updated),
      );
      return updated;
    });
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      actorRef.current?.saveCategories(
        shopIdRef.current,
        JSON.stringify(updated),
      );
      return updated;
    });
  }, []);

  // ── Product CRUD ─────────────────────────────────────────────────────────────────────────
  const addProduct = useCallback((p: Omit<Product, "id">): string => {
    saveDraftBeforeChangeRef.current(
      `Product Add: ${p.name}`,
      [
        {
          type: "product_added",
          description: `New product added: ${p.name}`,
        },
      ],
      productsRef.current,
      batchesRef.current,
      transactionsRef.current,
      invoicesRef.current,
    );
    const existing = productsRef.current.find(
      (pr) => pr.name.trim().toLowerCase() === p.name.trim().toLowerCase(),
    );
    if (existing) {
      console.log(
        `[StoreContext] Duplicate product name "${p.name}" — returning existing id: ${existing.id}`,
      );
      return existing.id;
    }
    const id = generateId();
    const newProduct = { id, ...p };
    console.log(
      `[StoreContext] addProduct -> shopId: ${shopIdRef.current}`,
      newProduct,
    );
    setProducts((prev) => {
      const updated = [...prev, newProduct];
      actorRef.current?.saveProducts(
        shopIdRef.current,
        JSON.stringify(updated),
      );
      saveData(STORAGE_KEYS.products, updated);
      console.log(
        `[StoreContext] products after add: ${updated.length} items`,
        updated,
      );
      return updated;
    });
    toast.success("Data saved ✓", { duration: 2500 });
    return id;
  }, []);

  const updateProduct = useCallback((id: string, p: Partial<Product>) => {
    const current = productsRef.current;
    const existing = current.find((pr) => pr.id === id);
    saveDraftBeforeChangeRef.current(
      `Product Edit: ${existing?.name ?? id}`,
      [
        {
          type: "product_edited",
          description: `Product edited: ${existing?.name ?? id}`,
        },
      ],
      current,
      batchesRef.current,
      transactionsRef.current,
      invoicesRef.current,
    );
    setProducts((prev) => {
      const updated = prev.map((pr) => (pr.id === id ? { ...pr, ...p } : pr));
      actorRef.current?.saveProducts(
        shopIdRef.current,
        JSON.stringify(updated),
      );
      saveData(STORAGE_KEYS.products, updated);
      return updated;
    });
    toast.success("Data saved ✓", { duration: 2500 });
  }, []);

  const deleteProduct = useCallback((id: string) => {
    const current = productsRef.current;
    const existing = current.find((pr) => pr.id === id);
    saveDraftBeforeChangeRef.current(
      `Product Delete: ${existing?.name ?? id}`,
      [
        {
          type: "product_deleted",
          description: `Product deleted: ${existing?.name ?? id}`,
        },
      ],
      current,
      batchesRef.current,
      transactionsRef.current,
      invoicesRef.current,
    );
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      actorRef.current?.saveProducts(
        shopIdRef.current,
        JSON.stringify(updated),
      );
      saveData(STORAGE_KEYS.products, updated);
      return updated;
    });
    toast.success("Data saved ✓", { duration: 2500 });
  }, []);

  // ── Stock Helpers ────────────────────────────────────────────────────────────────────────────
  const getProductBatches = useCallback(
    (productId: string): StockBatch[] => {
      return batches
        .filter((b) => b.productId === productId && b.quantity > 0)
        .sort(
          (a, b) =>
            new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime(),
        );
    },
    [batches],
  );

  const getProductStock = useCallback(
    (productId: string): number => {
      return batches
        .filter((b) => b.productId === productId)
        .reduce((sum, b) => sum + b.quantity, 0);
    },
    [batches],
  );

  const getStockValue = useCallback(
    (productId: string): number => {
      return batches
        .filter((b) => b.productId === productId)
        .reduce((sum, b) => sum + b.quantity * b.purchaseRate, 0);
    },
    [batches],
  );

  const getTotalStockValue = useCallback((): number => {
    return batches.reduce((sum, b) => sum + b.quantity * b.purchaseRate, 0);
  }, [batches]);

  // ── FIFO Logic ───────────────────────────────────────────────────────────────────────────────
  const calculateFIFOCost = useCallback(
    (productId: string, quantity: number): FIFOResult => {
      const productBatches = batchesRef.current
        .filter((b) => b.productId === productId && b.quantity > 0)
        .sort(
          (a, b) =>
            new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime(),
        );

      const available = productBatches.reduce((s, b) => s + b.quantity, 0);
      if (available < quantity) {
        return {
          deductedBatches: [],
          totalCost: 0,
          success: false,
          availableQty: available,
        };
      }

      const deducted: FIFOResult["deductedBatches"] = [];
      let remaining = quantity;
      let totalCost = 0;

      for (const batch of productBatches) {
        if (remaining <= 0) break;
        const take = Math.min(remaining, batch.quantity);
        deducted.push({
          batchId: batch.id,
          quantity: take,
          purchaseRate: batch.purchaseRate,
        });
        totalCost += take * batch.purchaseRate;
        remaining -= take;
      }

      return {
        deductedBatches: deducted,
        totalCost,
        success: true,
        availableQty: available,
      };
    },
    [],
  );

  // ── Stock In/Out ───────────────────────────────────────────────────────────────────────────
  const addStockIn = useCallback(
    (
      productId: string,
      quantity: number,
      purchaseRate: number,
      date: string,
      note: string,
      invoiceNo?: string,
      billNo?: string,
      transportCharge?: number,
      labourCharge?: number,
      expiryDate?: string,
      lengthQty?: number,
      weightQty?: number,
      otherCharges?: number,
    ) => {
      const productName =
        productsRef.current.find((p) => p.id === productId)?.name ?? productId;
      saveDraftBeforeChangeRef.current(
        `Stock In: ${productName} (${quantity})`,
        [
          {
            type: "stock_in",
            description: `Stock added: ${productName} - ${quantity} units @ ₹${purchaseRate}`,
          },
        ],
        productsRef.current,
        batchesRef.current,
        transactionsRef.current,
        invoicesRef.current,
      );

      const finalPurchaseCost =
        purchaseRate * quantity +
        (transportCharge ?? 0) +
        (labourCharge ?? 0) +
        (otherCharges ?? 0);
      const existingBatchCount = batchesRef.current.filter(
        (b) => b.productId === productId,
      ).length;
      const newBatch: StockBatch = {
        id: generateId(),
        productId,
        quantity,
        purchaseRate,
        dateAdded: date,
        batchNumber: existingBatchCount + 1,
        ...(invoiceNo ? { invoiceNo } : {}),
        ...(billNo ? { billNo } : {}),
        ...(transportCharge != null ? { transportCharge } : {}),
        ...(labourCharge != null ? { labourCharge } : {}),
        ...(otherCharges != null ? { otherCharges } : {}),
        ...(expiryDate?.trim() ? { expiryDate: expiryDate.trim() } : {}),
        finalPurchaseCost,
        ...(lengthQty != null ? { lengthQty } : {}),
        ...(weightQty != null ? { weightQty } : {}),
      };
      setBatches((prev) => {
        const updated = [...prev, newBatch];
        const icpPromise = actorRef.current?.saveBatches(
          shopIdRef.current,
          JSON.stringify(updated),
        );
        withSyncRef.current(icpPromise);
        saveData(STORAGE_KEYS.batches, updated);
        return updated;
      });
      setTransactions((prev) => {
        const updated = [
          {
            id: generateId(),
            productId,
            type: "in" as const,
            quantity,
            rate: purchaseRate,
            date,
            note,
          },
          ...prev,
        ];
        actorRef.current?.saveTransactions(
          shopIdRef.current,
          JSON.stringify(updated),
        );
        return updated;
      });
      toast.success("Data saved ✓", { duration: 2500 });
    },
    [],
  );

  const addStockOut = useCallback(
    (productId: string, quantity: number, note: string) => {
      const result = calculateFIFOCost(productId, quantity);
      if (!result.success) return;

      const productName =
        productsRef.current.find((p) => p.id === productId)?.name ?? productId;
      saveDraftBeforeChangeRef.current(
        `Stock Out: ${productName} (${quantity})`,
        [
          {
            type: "stock_out",
            description: `Stock removed: ${productName} - ${quantity} units`,
          },
        ],
        productsRef.current,
        batchesRef.current,
        transactionsRef.current,
        invoicesRef.current,
      );

      setBatches((prev) => {
        let updated = [...prev];
        for (const d of result.deductedBatches) {
          updated = updated.map((b) =>
            b.id === d.batchId
              ? { ...b, quantity: b.quantity - d.quantity }
              : b,
          );
        }
        updated = updated.filter((b) => b.quantity > 0);
        actorRef.current?.saveBatches(
          shopIdRef.current,
          JSON.stringify(updated),
        );
        return updated;
      });

      const avgRate = result.totalCost / quantity;
      setTransactions((prev) => {
        const updated = [
          {
            id: generateId(),
            productId,
            type: "out" as const,
            quantity,
            rate: Math.round(avgRate * 100) / 100,
            date: new Date().toISOString(),
            note,
          },
          ...prev,
        ];
        actorRef.current?.saveTransactions(
          shopIdRef.current,
          JSON.stringify(updated),
        );
        return updated;
      });
    },
    [calculateFIFOCost],
  );

  // ── Customer CRUD ────────────────────────────────────────────────────────────────────────────
  const addCustomer = useCallback((c: Omit<Customer, "id">) => {
    setCustomers((prev) => {
      const updated = [...prev, { id: generateId(), ...c }];
      actorRef.current?.saveCustomers(
        shopIdRef.current,
        JSON.stringify(updated),
      );
      saveData(STORAGE_KEYS.customers, updated);
      return updated;
    });
    toast.success("Data saved ✓", { duration: 2500 });
  }, []);

  const updateCustomer = useCallback((id: string, c: Partial<Customer>) => {
    setCustomers((prev) => {
      const updated = prev.map((cu) => (cu.id === id ? { ...cu, ...c } : cu));
      actorRef.current?.saveCustomers(
        shopIdRef.current,
        JSON.stringify(updated),
      );
      saveData(STORAGE_KEYS.customers, updated);
      return updated;
    });
    toast.success("Data saved ✓", { duration: 2500 });
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setCustomers((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      actorRef.current?.saveCustomers(
        shopIdRef.current,
        JSON.stringify(updated),
      );
      saveData(STORAGE_KEYS.customers, updated);
      return updated;
    });
    toast.success("Data saved ✓", { duration: 2500 });
  }, []);

  // ── Invoice ────────────────────────────────────────────────────────────────────────────────
  const getNextInvoiceNumber = useCallback((): string => {
    const num = invoices.length + 1;
    return `INV-${String(num).padStart(3, "000")}`;
  }, [invoices]);

  const createInvoice = useCallback(
    (data: Omit<Invoice, "id" | "invoiceNumber">): CreateInvoiceResult => {
      // Enforce payment logic
      let paidAmount = data.paidAmount;
      let dueAmount = data.dueAmount;

      if (data.paymentMode === "credit") {
        paidAmount = 0;
        dueAmount = data.totalAmount;
      } else if (
        data.paymentMode === "cash" ||
        data.paymentMode === "upi" ||
        data.paymentMode === "online"
      ) {
        if (paidAmount >= data.totalAmount) {
          paidAmount = data.totalAmount;
          dueAmount = 0;
        } else {
          dueAmount = data.totalAmount - paidAmount;
        }
      }

      // ── Check if same mobile already exists (dedup logic) ───────────────────────────────
      const incomingMobile = normMobile(data.customerMobile ?? "");
      let mergedExisting = false;

      if (incomingMobile && !isWalkIn(data.customerName ?? "")) {
        const existingInvoicesWithMobile = invoicesRef.current.filter(
          (inv) =>
            normMobile(inv.customerMobile ?? "") === incomingMobile &&
            !isWalkIn(inv.customerName ?? ""),
        );
        if (existingInvoicesWithMobile.length > 0) {
          mergedExisting = true;
          console.log(
            `[StoreContext] Same mobile ${incomingMobile} detected — merging into existing customer`,
          );
        }
      }

      const invoice: Invoice = {
        id: generateId(),
        invoiceNumber: `INV-${String(invoicesRef.current.length + 1).padStart(3, "0")}`,
        ...data,
        paidAmount,
        dueAmount,
        customerMobile: data.customerMobile ?? "",
        // Safety net: always ensure soldByUserId and soldByName are set
        soldByUserId: data.soldByUserId || shopIdRef.current || "owner",
        soldByName: data.soldByName || "Owner",
      };

      // ── FIFO Deduction ──
      console.log(
        "[FIFO] Stock BEFORE sale:",
        batchesRef.current.map((b) => ({
          id: b.id,
          productId: b.productId,
          qty: b.quantity,
        })),
      );

      const currentBatches = batchesRef.current;
      const allDeductions: { batchId: string; quantity: number }[] = [];

      for (const item of data.items) {
        // OPTION B: manual batch selected
        if (item.selectedBatchId) {
          const selectedBatch = currentBatches.find(
            (b) => b.id === item.selectedBatchId && b.quantity > 0,
          );
          if (selectedBatch) {
            const take = Math.min(item.quantity, selectedBatch.quantity);
            allDeductions.push({ batchId: selectedBatch.id, quantity: take });
          }
          continue;
        }
        // OPTION A: auto FIFO (default)
        const productBatches = currentBatches
          .filter((b) => b.productId === item.productId && b.quantity > 0)
          .sort(
            (a, b) =>
              new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime(),
          );

        let remaining = item.quantity;
        for (const batch of productBatches) {
          if (remaining <= 0) break;
          const take = Math.min(remaining, batch.quantity);
          allDeductions.push({ batchId: batch.id, quantity: take });
          remaining -= take;
        }
      }

      if (allDeductions.length > 0) {
        let updatedBatches = [...batchesRef.current];
        for (const d of allDeductions) {
          updatedBatches = updatedBatches.map((b) =>
            b.id === d.batchId
              ? { ...b, quantity: b.quantity - d.quantity }
              : b,
          );
        }
        updatedBatches = updatedBatches.filter((b) => b.quantity > 0);

        console.log(
          "[FIFO] Stock AFTER sale:",
          updatedBatches.map((b) => ({
            id: b.id,
            productId: b.productId,
            qty: b.quantity,
          })),
        );

        batchesRef.current = updatedBatches;
        actorRef.current?.saveBatches(
          shopIdRef.current,
          JSON.stringify(updatedBatches),
        );
        saveData(STORAGE_KEYS.batches, updatedBatches);
        setBatches(updatedBatches);
      }

      if (data.paymentMode === "credit" && data.customerId) {
        const creditAmount = dueAmount;
        setCustomers((prev) => {
          const updated = prev.map((c) =>
            c.id === data.customerId
              ? { ...c, creditBalance: c.creditBalance + creditAmount }
              : c,
          );
          actorRef.current?.saveCustomers(
            shopIdRef.current,
            JSON.stringify(updated),
          );
          return updated;
        });
      }

      // ── Save invoice and update invoicesRef immediately for real-time sync ──
      const updatedInvoices = [invoice, ...invoicesRef.current];
      invoicesRef.current = updatedInvoices;
      actorRef.current?.saveInvoices(
        shopIdRef.current,
        JSON.stringify(updatedInvoices),
      );
      saveData(STORAGE_KEYS.sales, updatedInvoices);
      setInvoices(updatedInvoices);
      toast.success("Data saved ✓", { duration: 2500 });

      // ── Diamond Reward: 1 diamond per 10 completed transactions ──────────────
      // Increment per-shop transaction counter and award 1 diamond every 10th tx
      const txCounterKey = `transactionCounter_${shopIdRef.current}`;
      const newTxCount = txCounterRef.current + 1;
      txCounterRef.current = newTxCount;
      saveData(txCounterKey, newTxCount);

      const diamondsEarned =
        Math.floor(newTxCount / 10) - Math.floor((newTxCount - 1) / 10);

      if (diamondsEarned > 0) {
        const userName = data.soldByName || currentUser?.name || "Owner";
        const userId =
          data.soldByUserId || currentUser?.id || shopIdRef.current;

        const reward: DiamondReward = {
          id: generateId(),
          shopId: shopIdRef.current,
          userId,
          userName,
          productId: "sale",
          productName: `${newTxCount} transactions completed`,
          cycleCompletedAt: new Date().toISOString(),
          diamondCount: diamondsEarned,
          rewardType: "transaction",
        };
        const updatedRewards = [...diamondRewardsRef.current, reward];
        diamondRewardsRef.current = updatedRewards;
        setDiamondRewards(updatedRewards);
        saveData(STORAGE_KEYS.diamondRewards, updatedRewards);

        const lang = localStorage.getItem("saveshop_language") ?? "en";
        toast.success(
          lang === "hi"
            ? `🎉 Diamond earned! ${newTxCount} transactions complete!`
            : `🎉 Diamond earned! ${newTxCount} transactions complete!`,
          { duration: 4000 },
        );

        // Try to sync to backend if method exists
        try {
          (actorRef.current as any)?.saveDiamondRewards?.(
            shopIdRef.current,
            JSON.stringify(updatedRewards),
          );
        } catch (_) {
          /* method may not exist yet */
        }
      }

      // ── Check referral reward on first transaction ────────────────────────
      // If this is the user's first invoice, check if they were referred
      const shopInvoicesAfter = [...invoicesRef.current];
      const userMobile = data.customerMobile ?? "";
      const isFirstInvoice = shopInvoicesAfter.length === 1;
      if (isFirstInvoice && userMobile) {
        const normalizedMobile = userMobile.replace(/\D/g, "");
        const pendingSignup = referralSignupsRef.current.find(
          (s) =>
            s.newUserMobile.replace(/\D/g, "") === normalizedMobile &&
            !s.firstTransactionCompleted,
        );
        if (pendingSignup) {
          // Mark first transaction completed
          const updatedSignups = referralSignupsRef.current.map((s) =>
            s.id === pendingSignup.id
              ? { ...s, firstTransactionCompleted: true }
              : s,
          );
          referralSignupsRef.current = updatedSignups;
          setReferralSignups(updatedSignups);
          saveData(STORAGE_KEYS.referralSignups, updatedSignups);
          // Award diamonds to both parties
          // (we call awardReferralDiamonds inline to avoid stale closure)
          const signup = pendingSignup;
          if (!signup.rewardAwardedToReferrer) {
            const updatedSignups2 = updatedSignups.map((s) =>
              s.id === signup.id
                ? {
                    ...s,
                    rewardAwardedToReferrer: true,
                    rewardAwardedToNewUser: true,
                  }
                : s,
            );
            referralSignupsRef.current = updatedSignups2;
            setReferralSignups(updatedSignups2);
            saveData(STORAGE_KEYS.referralSignups, updatedSignups2);

            const referrerReward: DiamondReward = {
              id: generateId(),
              shopId: shopIdRef.current,
              userId: signup.referrerUserId,
              userName: signup.referrerName,
              productId: "referral",
              productName: `Referral: ${signup.newUserName} joined`,
              cycleCompletedAt: new Date().toISOString(),
              diamondCount: 10,
              rewardType: "referral",
              referralId: signup.id,
            };
            const newUserRewardEntry: DiamondReward = {
              id: generateId(),
              shopId: shopIdRef.current,
              userId: signup.newUserId,
              userName: signup.newUserName,
              productId: "referral-welcome",
              productName: "Welcome Bonus — Referral",
              cycleCompletedAt: new Date().toISOString(),
              diamondCount: 10,
              rewardType: "referral",
              referralId: signup.id,
            };
            const rewardsWithReferral = [
              ...diamondRewardsRef.current,
              referrerReward,
              newUserRewardEntry,
            ];
            diamondRewardsRef.current = rewardsWithReferral;
            setDiamondRewards(rewardsWithReferral);
            saveData(STORAGE_KEYS.diamondRewards, rewardsWithReferral);
            toast.success(
              `🎉 Referral reward! 10 💎 each for ${signup.referrerName} & ${signup.newUserName}`,
            );
          }
        }
      }

      return { invoice, mergedExisting };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser],
  );

  // ── Payment Tracking ────────────────────────────────────────────────────────────────────────
  const receivePayment = useCallback(
    (
      customerId: string,
      customerName: string,
      customerMobile: string,
      amount: number,
      note: string,
      paymentMode: "cash" | "upi" | "online" = "cash",
    ) => {
      const record: PaymentRecord = {
        id: generateId(),
        customerId,
        customerName,
        customerMobile,
        amount,
        date: new Date().toISOString(),
        note,
        paymentMode,
      };
      setPayments((prev) => {
        const updated = [record, ...prev];
        actorRef.current?.savePayments(
          shopIdRef.current,
          JSON.stringify(updated),
        );
        saveData(STORAGE_KEYS.payments, updated);
        return updated;
      });

      const mobile = normMobile(customerMobile);
      const normName = customerName.trim().toLowerCase();

      setInvoices((prev) => {
        const customerInvoices = prev
          .filter((inv) => {
            if (mobile) {
              return (
                normMobile(inv.customerMobile ?? "") === mobile &&
                (inv.dueAmount ?? 0) > 0
              );
            }
            return (
              inv.customerName.trim().toLowerCase() === normName &&
              (inv.dueAmount ?? 0) > 0
            );
          })
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          );

        let remaining = amount;
        const updatedIds = new Set<string>();
        const updatedMap = new Map<
          string,
          { paidAmount: number; dueAmount: number }
        >();

        for (const inv of customerInvoices) {
          if (remaining <= 0) break;
          const due = inv.dueAmount ?? 0;
          const apply = Math.min(remaining, due);
          updatedMap.set(inv.id, {
            paidAmount: inv.paidAmount + apply,
            dueAmount: due - apply,
          });
          updatedIds.add(inv.id);
          remaining -= apply;
        }

        const updated = prev.map((inv) => {
          if (!updatedIds.has(inv.id)) return inv;
          const changes = updatedMap.get(inv.id)!;
          return { ...inv, ...changes };
        });

        actorRef.current?.saveInvoices(
          shopIdRef.current,
          JSON.stringify(updated),
        );
        invoicesRef.current = updated;
        saveData(STORAGE_KEYS.sales, updated);
        return updated;
      });

      if (customerId) {
        setCustomers((prev) => {
          const updated = prev.map((c) =>
            c.id === customerId
              ? { ...c, creditBalance: Math.max(0, c.creditBalance - amount) }
              : c,
          );
          actorRef.current?.saveCustomers(
            shopIdRef.current,
            JSON.stringify(updated),
          );
          saveData(STORAGE_KEYS.customers, updated);
          return updated;
        });
      }
      toast.success("Data saved ✓", { duration: 2500 });
    },
    [],
  );

  // ── Ledger helpers — derived from invoices state (reactive) ───────────────────────────────────
  const getTotalCreditDue = useCallback((): number => {
    return invoices
      .filter((inv) => !isWalkIn(inv.customerName ?? ""))
      .reduce((sum, inv) => sum + (inv.dueAmount ?? 0), 0);
  }, [invoices]);

  const getCustomerLedger = useCallback(
    (customerName: string, customerMobile: string): CustomerLedger => {
      const mobile = normMobile(customerMobile);
      const normName = customerName.trim().toLowerCase();
      const custInvoices = invoices.filter((inv) => {
        if (mobile) {
          return normMobile(inv.customerMobile ?? "") === mobile;
        }
        return inv.customerName.trim().toLowerCase() === normName;
      });
      // Pick address from customer record or latest invoice
      const custRecord = customers.find((c) =>
        mobile
          ? normMobile(c.mobile) === mobile
          : c.name.trim().toLowerCase() === normName,
      );
      const address =
        custRecord?.address ||
        custInvoices.find((i) => i.customerAddress)?.customerAddress;
      return {
        customerName,
        customerMobile,
        customerAddress: address,
        totalPurchase: custInvoices.reduce((s, i) => s + i.totalAmount, 0),
        totalPaid: custInvoices.reduce((s, i) => s + i.paidAmount, 0),
        totalDue: custInvoices.reduce((s, i) => s + (i.dueAmount ?? 0), 0),
        invoices: custInvoices,
      };
    },
    [invoices, customers],
  );

  const getAllCustomerLedgers = useCallback((): CustomerLedger[] => {
    const byMobile = new Map<string, CustomerLedger>();
    const byName = new Map<string, CustomerLedger>();

    for (const inv of invoices) {
      const name = inv.customerName?.trim() || "";
      if (isWalkIn(name)) continue;
      const due = inv.dueAmount ?? 0;
      const mode = inv.paymentMode;
      if (mode !== "credit" && due <= 0) continue;

      const mobile = normMobile(inv.customerMobile ?? "");
      // Resolve address: invoice address or customer record
      const custRecord = customers.find((c) =>
        mobile
          ? normMobile(c.mobile) === mobile
          : c.name.trim().toLowerCase() === name.toLowerCase(),
      );
      const resolvedAddress = custRecord?.address || inv.customerAddress;

      if (mobile) {
        if (!byMobile.has(mobile)) {
          byMobile.set(mobile, {
            customerName: name,
            customerMobile: mobile,
            customerAddress: resolvedAddress,
            totalPurchase: 0,
            totalPaid: 0,
            totalDue: 0,
            invoices: [],
          });
        }
        const entry = byMobile.get(mobile)!;
        entry.customerName = name;
        if (resolvedAddress && !entry.customerAddress)
          entry.customerAddress = resolvedAddress;
        entry.totalPurchase += inv.totalAmount;
        entry.totalPaid += inv.paidAmount;
        entry.totalDue += due;
        entry.invoices.push(inv);
      } else {
        const key = name.toLowerCase();
        if (!byName.has(key)) {
          byName.set(key, {
            customerName: name,
            customerMobile: "",
            customerAddress: resolvedAddress,
            totalPurchase: 0,
            totalPaid: 0,
            totalDue: 0,
            invoices: [],
          });
        }
        const entry = byName.get(key)!;
        if (resolvedAddress && !entry.customerAddress)
          entry.customerAddress = resolvedAddress;
        entry.totalPurchase += inv.totalAmount;
        entry.totalPaid += inv.paidAmount;
        entry.totalDue += due;
        entry.invoices.push(inv);
      }
    }

    const all = [...byMobile.values(), ...byName.values()];
    return all.sort((a, b) => b.totalDue - a.totalDue);
  }, [invoices, customers]);

  const mergeDuplicateCustomers = useCallback((): number => {
    const mobileToName = new Map<string, string>();
    const sorted = [...invoicesRef.current].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    for (const inv of sorted) {
      const mobile = normMobile(inv.customerMobile ?? "");
      if (!mobile || isWalkIn(inv.customerName ?? "")) continue;
      if (!mobileToName.has(mobile)) {
        mobileToName.set(mobile, inv.customerName?.trim() ?? "");
      }
    }

    if (mobileToName.size === 0) return 0;

    let changed = 0;
    const updated = invoicesRef.current.map((inv) => {
      const mobile = normMobile(inv.customerMobile ?? "");
      if (!mobile || isWalkIn(inv.customerName ?? "")) return inv;
      const canonical = mobileToName.get(mobile);
      if (canonical && canonical !== inv.customerName?.trim()) {
        changed++;
        return { ...inv, customerName: canonical };
      }
      return inv;
    });

    if (changed > 0) {
      invoicesRef.current = updated;
      actorRef.current?.saveInvoices(
        shopIdRef.current,
        JSON.stringify(updated),
      );
      setInvoices(updated);
      console.log(
        `[StoreContext] mergeDuplicateCustomers: ${changed} invoices re-labelled`,
      );
    }

    return changed;
  }, []);

  // ── User CRUD (per-shop) ──────────────────────────────────────────────────────────────────────────────
  const addUser = useCallback((u: Omit<AppUser, "id">) => {
    setUsers((prev) => {
      const updated = [...prev, { id: generateId(), ...u }];
      actorRef.current?.saveUsers(shopIdRef.current, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateUser = useCallback((id: string, u: Partial<AppUser>) => {
    setUsers((prev) => {
      const updated = prev.map((us) => (us.id === id ? { ...us, ...u } : us));
      actorRef.current?.saveUsers(shopIdRef.current, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteUser = useCallback((id: string) => {
    setUsers((prev) => {
      const updated = prev.filter((u) => u.id !== id);
      actorRef.current?.saveUsers(shopIdRef.current, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ── Shop Units CRUD ─────────────────────────────────────────────────────────────────────────────
  const addShopUnit = useCallback((name: string) => {
    if (!name.trim()) return;
    setShopUnits((prev) => {
      const exists = prev.some(
        (u) => u.name.toLowerCase() === name.trim().toLowerCase(),
      );
      if (exists) return prev;
      const updated = [...prev, { id: generateId(), name: name.trim() }];
      actorRef.current?.saveShopUnits(
        shopIdRef.current,
        JSON.stringify(updated),
      );
      return updated;
    });
  }, []);

  const deleteShopUnit = useCallback((id: string) => {
    setShopUnits((prev) => {
      const updated = prev.filter((u) => u.id !== id);
      actorRef.current?.saveShopUnits(
        shopIdRef.current,
        JSON.stringify(updated),
      );
      return updated;
    });
  }, []);

  // ── Stats ─────────────────────────────────────────────────────────────────────────────────────
  const getDailySales = useCallback(
    (date: string): Invoice[] => {
      const day = date.slice(0, 10);
      return invoices.filter((inv) => inv.date.slice(0, 10) === day);
    },
    [invoices],
  );

  const getLastSoldDate = useCallback(
    (productId: string): string | null => {
      let latest: string | null = null;
      for (const inv of invoices) {
        const hasItem = inv.items.some((item) => item.productId === productId);
        if (hasItem) {
          if (!latest || inv.date > latest) latest = inv.date;
        }
      }
      return latest;
    },
    [invoices],
  );

  const getTodaySales = useCallback((): number => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return getDailySales(todayStr).reduce((s, inv) => s + inv.paidAmount, 0);
  }, [getDailySales]);

  const getTodayProfit = useCallback((): number => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return getDailySales(todayStr).reduce((s, inv) => {
      if (inv.invoiceTotalProfit != null) return s + inv.invoiceTotalProfit;
      const cost = inv.items.reduce(
        (c: number, item: InvoiceItem) => c + item.purchaseCost * item.quantity,
        0,
      );
      return s + (inv.totalAmount - cost);
    }, 0);
  }, [getDailySales]);

  const getTotalProfit = useCallback((): number => {
    return invoices.reduce((s, inv) => s + (inv.invoiceTotalProfit ?? 0), 0);
  }, [invoices]);

  const getTotalInvestment = useCallback((): number => {
    return transactions
      .filter((t) => t.type === "in")
      .reduce((sum, t) => sum + t.quantity * t.rate, 0);
  }, [transactions]);

  const getLowStockProducts = useCallback((): Product[] => {
    return products.filter((p) => getProductStock(p.id) < p.minStockAlert);
  }, [products, getProductStock]);

  // ── Profit Helpers ───────────────────────────────────────────────────────────────────────────
  const getProductCostPrice = useCallback(
    (productId: string): number => {
      const productBatches = batches
        .filter((b) => b.productId === productId)
        .sort(
          (a, b) =>
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
        );
      if (productBatches.length === 0) {
        const product = products.find((p) => p.id === productId);
        return product?.purchasePrice ?? 0;
      }
      const latestBatch = productBatches[0];
      // Use per-unit final cost (includes transport/labour) if available
      if (latestBatch.finalPurchaseCost != null && latestBatch.quantity > 0) {
        return latestBatch.finalPurchaseCost / latestBatch.quantity;
      }
      return latestBatch.purchaseRate;
    },
    [batches, products],
  );

  const getProductProfit = useCallback(
    (productId: string): number => {
      const product = products.find((p) => p.id === productId);
      if (!product) return 0;
      const costPrice = getProductCostPrice(productId);
      return product.sellingPrice - costPrice;
    },
    [products, getProductCostPrice],
  );

  const getProductProfitPct = useCallback(
    (productId: string): number => {
      const costPrice = getProductCostPrice(productId);
      if (costPrice <= 0) return 0;
      const profit = getProductProfit(productId);
      return (profit / costPrice) * 100;
    },
    [getProductCostPrice, getProductProfit],
  );

  // ── Returns ──────────────────────────────────────────────────────────────────────────────
  const addReturn = useCallback(
    async (
      entry: Omit<
        ReturnEntry,
        "id" | "shopId" | "date" | "lossAmount" | "isLoss"
      >,
    ): Promise<boolean> => {
      // Validate: cannot return more than qty sold minus already returned
      const totalSold = invoicesRef.current
        .flatMap((inv) => inv.items)
        .filter((item) => item.productId === entry.productId)
        .reduce((sum, item) => sum + item.quantity, 0);

      const totalAlreadyReturned = returnsRef.current
        .filter((r) => r.productId === entry.productId)
        .reduce((sum, r) => sum + r.qtyReturned, 0);

      const availableToReturn = totalSold - totalAlreadyReturned;
      if (entry.qtyReturned > availableToReturn) {
        toast.error(`You can only return up to ${availableToReturn} qty`);
        return false;
      }

      if (entry.qtyReturned <= 0) {
        toast.error("Return quantity must be greater than 0");
        return false;
      }

      const lossAmount = Math.max(
        0,
        entry.sellingPrice * entry.qtyReturned - entry.returnValue,
      );
      const isLoss = lossAmount > 0;

      const newEntry: ReturnEntry = {
        ...entry,
        id: `ret_${Date.now()}`,
        shopId: shopIdRef.current,
        date: new Date().toISOString(),
        lossAmount,
        isLoss,
      };

      // Re-add stock: add a new batch for the product with the returned qty
      const purchaseRate =
        entry.returnValue > 0 && entry.qtyReturned > 0
          ? entry.returnValue / entry.qtyReturned
          : 0;
      const existingBatchCount = batchesRef.current.filter(
        (b) => b.productId === entry.productId,
      ).length;
      const returnBatch: StockBatch = {
        id: `ret_batch_${Date.now()}`,
        productId: entry.productId,
        quantity: entry.qtyReturned,
        purchaseRate,
        dateAdded: newEntry.date,
        batchNumber: existingBatchCount + 1,
      };

      setBatches((prev) => {
        const updated = [...prev, returnBatch];
        actorRef.current?.saveBatches(
          shopIdRef.current,
          JSON.stringify(updated),
        );
        saveData(STORAGE_KEYS.batches, updated);
        batchesRef.current = updated;
        return updated;
      });

      // Save return entry
      const updatedReturns = [newEntry, ...returnsRef.current];
      returnsRef.current = updatedReturns;
      setReturns(updatedReturns);
      (actorRef.current as any)?.saveReturns?.(
        shopIdRef.current,
        JSON.stringify(updatedReturns),
      );
      saveData(STORAGE_KEYS.returns, updatedReturns);
      toast.success("Data saved ✓", { duration: 2500 });

      return true;
    },
    [],
  );

  const getReturnReport = useCallback(
    (dateFilter?: string) => {
      const todayStr = dateFilter ?? new Date().toISOString().slice(0, 10);
      const returnsToday = returns.filter(
        (r) => r.date.slice(0, 10) === todayStr,
      );
      const totalReturnValue = returnsToday.reduce(
        (s, r) => s + r.returnValue,
        0,
      );
      const totalLoss = returnsToday.reduce((s, r) => s + r.lossAmount, 0);

      // Top reason from all returns (not just today) for context
      const reasonCount = new Map<string, number>();
      for (const r of returns) {
        reasonCount.set(r.reason, (reasonCount.get(r.reason) ?? 0) + 1);
      }
      let topReason = "";
      let topReasonCount = 0;
      for (const [reason, count] of reasonCount.entries()) {
        if (count > topReasonCount) {
          topReason = reason;
          topReasonCount = count;
        }
      }

      return {
        totalReturnValue,
        totalLoss,
        topReason,
        topReasonCount,
        returnsToday,
      };
    },
    [returns],
  );

  // ── Reminder System ──────────────────────────────────────────────────────────
  const buildReminderMessage = useCallback(
    (customerName: string, dueAmount: number): string => {
      const shopName = currentShop?.name ?? "Save Shop System";
      return `Hello ${customerName},\nYou have an outstanding balance of ₹${Math.round(dueAmount).toLocaleString("en-IN")}.\n\nKindly make the payment at your earliest convenience.\n\nThank you 🙏\n${shopName}`;
    },
    [currentShop],
  );

  const sendReminder = useCallback(
    async (customer: CustomerLedger, sentBy: AppUser): Promise<void> => {
      const message = buildReminderMessage(
        customer.customerName,
        customer.totalDue,
      );
      window.open(
        `https://wa.me/91${customer.customerMobile}?text=${encodeURIComponent(message)}`,
        "_blank",
        "noopener",
      );
      const log: ReminderLog = {
        id: `rl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        shopId: shopIdRef.current,
        senderId: sentBy.id,
        senderName: sentBy.name,
        senderRole: sentBy.role as "owner" | "manager" | "staff",
        customerId: customer.customerMobile,
        customerName: customer.customerName,
        customerMobile: customer.customerMobile,
        message,
        sentAt: new Date().toISOString(),
        status: "sent",
      };
      const updated = [log, ...reminderLogsRef.current];
      reminderLogsRef.current = updated;
      setReminderLogs(updated);
      (actorRef.current as any)?.saveReminderLogs?.(
        shopIdRef.current,
        JSON.stringify(updated),
      );
    },
    [buildReminderMessage],
  );

  const requestReminder = useCallback(
    async (customer: CustomerLedger, requestedBy: AppUser): Promise<void> => {
      const req: ReminderRequest = {
        id: `rreq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        shopId: shopIdRef.current,
        staffId: requestedBy.id,
        staffName: requestedBy.name,
        customerId: customer.customerMobile,
        customerName: customer.customerName,
        customerMobile: customer.customerMobile,
        dueAmount: customer.totalDue,
        requestedAt: new Date().toISOString(),
        approvalStatus: "pending",
      };
      const updatedReqs = [req, ...reminderRequestsRef.current];
      reminderRequestsRef.current = updatedReqs;
      setReminderRequests(updatedReqs);
      (actorRef.current as any)?.saveReminderRequests?.(
        shopIdRef.current,
        JSON.stringify(updatedReqs),
      );

      const message = buildReminderMessage(
        customer.customerName,
        customer.totalDue,
      );
      const log: ReminderLog = {
        id: `rl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        shopId: shopIdRef.current,
        senderId: requestedBy.id,
        senderName: requestedBy.name,
        senderRole: "staff",
        customerId: customer.customerMobile,
        customerName: customer.customerName,
        customerMobile: customer.customerMobile,
        message,
        sentAt: new Date().toISOString(),
        status: "requested",
        requestId: req.id,
      };
      const updatedLogs = [log, ...reminderLogsRef.current];
      reminderLogsRef.current = updatedLogs;
      setReminderLogs(updatedLogs);
      (actorRef.current as any)?.saveReminderLogs?.(
        shopIdRef.current,
        JSON.stringify(updatedLogs),
      );
    },
    [buildReminderMessage],
  );

  const approveReminderRequest = useCallback(
    async (requestId: string, approvedBy: AppUser): Promise<void> => {
      const req = reminderRequestsRef.current.find((r) => r.id === requestId);
      if (!req || req.approvalStatus !== "pending") return;

      const message = buildReminderMessage(req.customerName, req.dueAmount);
      window.open(
        `https://wa.me/91${req.customerMobile}?text=${encodeURIComponent(message)}`,
        "_blank",
        "noopener",
      );

      const updatedReqs = reminderRequestsRef.current.map((r) =>
        r.id === requestId
          ? {
              ...r,
              approvalStatus: "approved" as const,
              approvedBy: approvedBy.name,
              approvedAt: new Date().toISOString(),
            }
          : r,
      );
      reminderRequestsRef.current = updatedReqs;
      setReminderRequests(updatedReqs);
      (actorRef.current as any)?.saveReminderRequests?.(
        shopIdRef.current,
        JSON.stringify(updatedReqs),
      );

      const log: ReminderLog = {
        id: `rl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        shopId: shopIdRef.current,
        senderId: approvedBy.id,
        senderName: approvedBy.name,
        senderRole: approvedBy.role as "owner" | "manager" | "staff",
        customerId: req.customerMobile,
        customerName: req.customerName,
        customerMobile: req.customerMobile,
        message,
        sentAt: new Date().toISOString(),
        status: "approved",
        requestId,
      };
      const updatedLogs = [log, ...reminderLogsRef.current];
      reminderLogsRef.current = updatedLogs;
      setReminderLogs(updatedLogs);
      (actorRef.current as any)?.saveReminderLogs?.(
        shopIdRef.current,
        JSON.stringify(updatedLogs),
      );
    },
    [buildReminderMessage],
  );

  const rejectReminderRequest = useCallback(
    async (requestId: string, rejectedBy: AppUser): Promise<void> => {
      const req = reminderRequestsRef.current.find((r) => r.id === requestId);
      if (!req) return;

      const updatedReqs = reminderRequestsRef.current.map((r) =>
        r.id === requestId
          ? {
              ...r,
              approvalStatus: "rejected" as const,
              approvedBy: rejectedBy.name,
              approvedAt: new Date().toISOString(),
            }
          : r,
      );
      reminderRequestsRef.current = updatedReqs;
      setReminderRequests(updatedReqs);
      (actorRef.current as any)?.saveReminderRequests?.(
        shopIdRef.current,
        JSON.stringify(updatedReqs),
      );

      const log: ReminderLog = {
        id: `rl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        shopId: shopIdRef.current,
        senderId: rejectedBy.id,
        senderName: rejectedBy.name,
        senderRole: rejectedBy.role as "owner" | "manager" | "staff",
        customerId: req.customerMobile,
        customerName: req.customerName,
        customerMobile: req.customerMobile,
        message: "",
        sentAt: new Date().toISOString(),
        status: "rejected",
        requestId,
      };
      const updatedLogs = [log, ...reminderLogsRef.current];
      reminderLogsRef.current = updatedLogs;
      setReminderLogs(updatedLogs);
      (actorRef.current as any)?.saveReminderLogs?.(
        shopIdRef.current,
        JSON.stringify(updatedLogs),
      );
    },
    [],
  );

  const getReminderCountToday = useCallback(
    (staffId: string, customerId: string): number => {
      const todayStr = new Date().toISOString().slice(0, 10);
      return reminderLogsRef.current.filter(
        (l) =>
          l.senderId === staffId &&
          l.customerId === customerId &&
          l.sentAt.slice(0, 10) === todayStr &&
          l.status === "sent",
      ).length;
    },
    [],
  );

  const getPendingReminderRequests = useCallback((): ReminderRequest[] => {
    return reminderRequestsRef.current.filter(
      (r) => r.approvalStatus === "pending",
    );
  }, []);

  // ── Vendor CRUD ──────────────────────────────────────────────────────────────
  const addVendor = useCallback(
    async (
      v: Omit<Vendor, "id" | "shopId" | "createdAt" | "updatedAt">,
    ): Promise<void> => {
      const newVendor: Vendor = {
        id: `vendor_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        shopId: shopIdRef.current,
        ...v,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const updated = [...vendorsRef.current, newVendor];
      vendorsRef.current = updated;
      setVendors(updated);
      (actorRef.current as any)?.saveVendors?.(
        shopIdRef.current,
        JSON.stringify(updated),
      );
      saveData(STORAGE_KEYS.vendors, updated);
      toast.success("Data saved ✓", { duration: 2500 });
    },
    [],
  );

  const updateVendor = useCallback(
    async (id: string, changes: Partial<Vendor>): Promise<void> => {
      const updated = vendorsRef.current.map((v) =>
        v.id === id ? { ...v, ...changes, updatedAt: Date.now() } : v,
      );
      vendorsRef.current = updated;
      setVendors(updated);
      (actorRef.current as any)?.saveVendors?.(
        shopIdRef.current,
        JSON.stringify(updated),
      );
      saveData(STORAGE_KEYS.vendors, updated);
      toast.success("Data saved ✓", { duration: 2500 });
    },
    [],
  );

  const deleteVendor = useCallback(async (id: string): Promise<void> => {
    const updated = vendorsRef.current.filter((v) => v.id !== id);
    vendorsRef.current = updated;
    setVendors(updated);
    (actorRef.current as any)?.saveVendors?.(
      shopIdRef.current,
      JSON.stringify(updated),
    );
    saveData(STORAGE_KEYS.vendors, updated);
    toast.success("Data saved ✓", { duration: 2500 });
  }, []);

  // ── Purchase Order CRUD ───────────────────────────────────────────────────────
  const addPurchaseOrder = useCallback(
    async (
      po: Omit<PurchaseOrder, "id" | "shopId" | "createdAt">,
    ): Promise<void> => {
      const newPO: PurchaseOrder = {
        id: `po_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        shopId: shopIdRef.current,
        ...po,
        createdAt: Date.now(),
      };
      const updated = [newPO, ...purchaseOrdersRef.current];
      purchaseOrdersRef.current = updated;
      setPurchaseOrders(updated);
      (actorRef.current as any)?.savePurchaseOrders?.(
        shopIdRef.current,
        JSON.stringify(updated),
      );
      saveData(STORAGE_KEYS.purchaseOrders, updated);
      toast.success("Data saved ✓", { duration: 2500 });
    },
    [],
  );

  const updatePurchaseOrder = useCallback(
    async (id: string, changes: Partial<PurchaseOrder>): Promise<void> => {
      const updated = purchaseOrdersRef.current.map((po) =>
        po.id === id ? { ...po, ...changes } : po,
      );
      purchaseOrdersRef.current = updated;
      setPurchaseOrders(updated);
      (actorRef.current as any)?.savePurchaseOrders?.(
        shopIdRef.current,
        JSON.stringify(updated),
      );
      saveData(STORAGE_KEYS.purchaseOrders, updated);
      toast.success("Data saved ✓", { duration: 2500 });
    },
    [],
  );

  const markPurchaseReceived = useCallback(
    async (id: string, receivedQty: number): Promise<void> => {
      const po = purchaseOrdersRef.current.find((p) => p.id === id);
      if (!po) return;
      const newStatus: PurchaseOrder["status"] =
        receivedQty >= po.qty ? "received" : "partial";
      const updated = purchaseOrdersRef.current.map((p) =>
        p.id === id
          ? { ...p, status: newStatus, receivedQty, receivedDate: Date.now() }
          : p,
      );
      purchaseOrdersRef.current = updated;
      setPurchaseOrders(updated);
      (actorRef.current as any)?.savePurchaseOrders?.(
        shopIdRef.current,
        JSON.stringify(updated),
      );
      saveData(STORAGE_KEYS.purchaseOrders, updated);
      // Add stock via addStockIn
      if (receivedQty > 0) {
        addStockIn(
          po.productId,
          receivedQty,
          po.rate,
          new Date().toISOString(),
          `Purchase Order ${id} received`,
          undefined,
          undefined,
          po.transportCharge,
          po.labourCharge,
          undefined,
          undefined,
          undefined,
          po.otherCharges,
        );
      }
    },
    [addStockIn],
  );

  // ── Ref to track currentUser in callbacks without stale closure ──────────────
  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // ── Customer Order CRUD ───────────────────────────────────────────────────────
  const addCustomerOrder = useCallback(
    async (
      co: Omit<CustomerOrder, "id" | "shopId" | "createdAt">,
    ): Promise<void> => {
      const newCO: CustomerOrder = {
        id: `co_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        shopId: shopIdRef.current,
        ...co,
        createdAt: Date.now(),
      };
      const updated = [newCO, ...customerOrdersRef.current];
      customerOrdersRef.current = updated;
      setCustomerOrders(updated);
      (actorRef.current as any)?.saveCustomerOrders?.(
        shopIdRef.current,
        JSON.stringify(updated),
      );
      saveData(STORAGE_KEYS.customerOrders, updated);
      toast.success("Data saved ✓", { duration: 2500 });
    },
    [],
  );

  const acceptCustomerOrder = useCallback(
    async (id: string): Promise<void> => {
      const co = customerOrdersRef.current.find((o) => o.id === id);
      if (!co || co.status !== "pending") return;
      const updated = customerOrdersRef.current.map((o) =>
        o.id === id ? { ...o, status: "accepted" as const } : o,
      );
      customerOrdersRef.current = updated;
      setCustomerOrders(updated);
      (actorRef.current as any)?.saveCustomerOrders?.(
        shopIdRef.current,
        JSON.stringify(updated),
      );
      saveData(STORAGE_KEYS.customerOrders, updated);
      toast.success("Data saved ✓", { duration: 2500 });
      // Convert to invoice
      const customer = customers.find((c) => c.id === co.customerId);
      const seller = currentUserRef.current;
      const invoiceItems: Omit<Invoice, "id" | "invoiceNumber"> = {
        customerId: co.customerId,
        customerName: customer?.name ?? "Customer",
        customerMobile: customer?.mobile ?? "",
        items: co.items.map((item) => {
          const product = productsRef.current.find(
            (p) => p.id === item.productId,
          );
          return {
            productId: item.productId,
            productName: product?.name ?? item.productId,
            quantity: item.qty,
            sellingRate: item.price,
            purchaseCost: 0,
          };
        }),
        totalAmount: co.totalAmount,
        paidAmount: co.totalAmount,
        dueAmount: 0,
        paymentMode: "cash",
        date: new Date().toISOString(),
        soldByName: seller?.name ?? "Owner",
        soldByUserId: seller?.id ?? shopIdRef.current,
      };
      createInvoice(invoiceItems);
    },
    [customers, createInvoice],
  );

  const rejectCustomerOrder = useCallback(
    async (id: string, reason: string): Promise<void> => {
      const updated = customerOrdersRef.current.map((o) =>
        o.id === id
          ? { ...o, status: "rejected" as const, rejectionReason: reason }
          : o,
      );
      customerOrdersRef.current = updated;
      setCustomerOrders(updated);
      (actorRef.current as any)?.saveCustomerOrders?.(
        shopIdRef.current,
        JSON.stringify(updated),
      );
      saveData(STORAGE_KEYS.customerOrders, updated);
      toast.success("Data saved ✓", { duration: 2500 });
    },
    [],
  );

  // ── Vendor Rate History ──────────────────────────────────────────────────────
  const addVendorRateHistory = useCallback(
    async (
      entry: Omit<VendorRateHistory, "id" | "shopId" | "changedAt">,
    ): Promise<void> => {
      // Only save if rate actually changed from last entry
      const last = vendorRateHistoryRef.current
        .filter(
          (r) =>
            r.vendorId === entry.vendorId && r.productId === entry.productId,
        )
        .sort(
          (a, b) =>
            new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
        )[0];
      if (last && Math.abs(last.newRate - entry.newRate) < 0.01) return;

      const newEntry: VendorRateHistory = {
        id: `vrh_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        shopId: shopIdRef.current,
        ...entry,
        changedAt: new Date().toISOString(),
      };
      const updated = [newEntry, ...vendorRateHistoryRef.current];
      vendorRateHistoryRef.current = updated;
      setVendorRateHistory(updated);
      (actorRef.current as any)?.saveVendorRateHistory?.(
        shopIdRef.current,
        JSON.stringify(updated),
      );
      saveData(STORAGE_KEYS.vendorRateHistory, updated);
    },
    [],
  );

  const getLastVendorRate = useCallback(
    (vendorId: string, productId: string): number | null => {
      const history = vendorRateHistoryRef.current
        .filter((r) => r.vendorId === vendorId && r.productId === productId)
        .sort(
          (a, b) =>
            new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
        );
      return history.length > 0 ? history[0].newRate : null;
    },
    [],
  );

  const getVendorRateHistoryForVendor = useCallback(
    (vendorId: string): VendorRateHistory[] => {
      return vendorRateHistoryRef.current
        .filter((r) => r.vendorId === vendorId)
        .sort(
          (a, b) =>
            new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
        );
    },
    [],
  );

  // ── Low Price Alert Log ──────────────────────────────────────────────────────
  const addLowPriceAlertLog = useCallback(
    (log: Omit<LowPriceAlertLog, "id">) => {
      const newLog: LowPriceAlertLog = {
        ...log,
        id: `lpa_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      };
      const updated = [newLog, ...lowPriceAlertLogsRef.current];
      lowPriceAlertLogsRef.current = updated;
      setLowPriceAlertLogs(updated);
      (actorRef.current as any)?.saveLowPriceAlertLogs?.(
        shopIdRef.current,
        JSON.stringify(updated),
      );
    },
    [],
  );

  // ── Audit Log ──────────────────────────────────────────────────────────────
  const addAuditLog = useCallback(
    (action: string, details: string, resourceId?: string) => {
      const user = currentUser;
      const newLog: AuditLog = {
        id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        shopId: shopIdRef.current,
        userId: user?.id ?? "unknown",
        userName: user?.name ?? "Unknown",
        userRole: user?.role ?? "staff",
        action,
        details,
        ...(resourceId ? { resourceId } : {}),
        timestamp: new Date().toISOString(),
        deletedUser: false,
      };
      const updated = [newLog, ...auditLogsRef.current].slice(0, 500);
      auditLogsRef.current = updated;
      setAuditLogs(updated);
      (actorRef.current as any)?.saveAuditLogs?.(
        shopIdRef.current,
        JSON.stringify(updated),
      );
    },
    [currentUser],
  );

  const getAuditLogs = useCallback((): AuditLog[] => {
    return auditLogsRef.current;
  }, []);

  // ── Draft / History ─────────────────────────────────────────────────────────────────────────────
  const getDrafts = useCallback(async (): Promise<DraftSnapshot[]> => {
    if (!actorRef.current) return [];
    const raw = await actorRef.current.getDrafts(shopIdRef.current);
    return raw ? (JSON.parse(raw) as DraftSnapshot[]) : [];
  }, []);

  const saveDraftNow = useCallback(async (label: string): Promise<void> => {
    const ac = actorRef.current;
    if (!ac) return;
    const sid = shopIdRef.current;
    const raw = await ac.getDrafts(sid);
    const existing: DraftSnapshot[] = raw ? JSON.parse(raw) : [];
    const snap: DraftSnapshot = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      label: label?.trim() || "Manual Snapshot",
      products: productsRef.current,
      batches: batchesRef.current,
      transactions: transactionsRef.current,
      invoices: invoicesRef.current,
      qaChanges: [
        { type: "product_added", description: "Manual snapshot saved" },
      ],
    };
    await ac.saveDrafts(sid, JSON.stringify([snap, ...existing].slice(0, 10)));
  }, []);

  const restoreDraft = useCallback(
    async (snapshotId: string): Promise<void> => {
      const ac = actorRef.current;
      if (!ac) return;
      const sid = shopIdRef.current;
      const raw = await ac.getDrafts(sid);
      const drafts: DraftSnapshot[] = raw ? JSON.parse(raw) : [];
      const snap = drafts.find((d) => d.id === snapshotId);
      if (!snap) return;
      setProducts(snap.products);
      setBatches(snap.batches);
      setTransactions(snap.transactions);
      setInvoices(snap.invoices);
      await Promise.all([
        ac.saveProducts(sid, JSON.stringify(snap.products)),
        ac.saveBatches(sid, JSON.stringify(snap.batches)),
        ac.saveTransactions(sid, JSON.stringify(snap.transactions)),
        ac.saveInvoices(sid, JSON.stringify(snap.invoices)),
      ]);
    },
    [],
  );

  // ── Draft Sale CRUD (localStorage only) ──────────────────────────────────────
  // ICP backend is intentionally out of scope for draft sales.
  // Drafts are scoped per-shop via saveDrafts/loadDrafts helpers.

  const saveDraft = useCallback((draft: DraftSale): void => {
    const existing = draftSalesRef.current;
    // Upsert by draftId
    const idx = existing.findIndex((d) => d.draftId === draft.draftId);
    const updated: DraftSale[] =
      idx >= 0
        ? existing.map((d) => (d.draftId === draft.draftId ? draft : d))
        : [draft, ...existing];
    draftSalesRef.current = updated;
    setDraftSales(updated);
    saveDrafts(updated, shopIdRef.current);
  }, []);

  const deleteDraft = useCallback((draftId: string): void => {
    const updated = draftSalesRef.current.filter((d) => d.draftId !== draftId);
    draftSalesRef.current = updated;
    setDraftSales(updated);
    saveDrafts(updated, shopIdRef.current);
  }, []);

  const getDraftById = useCallback(
    (draftId: string): DraftSale | undefined =>
      draftSalesRef.current.find((d) => d.draftId === draftId),
    [],
  );

  const markDraftCompleted = useCallback((draftId: string): void => {
    const updated = draftSalesRef.current.map((d) =>
      d.draftId === draftId
        ? {
            ...d,
            status: "completed" as const,
            updatedAt: new Date().toISOString(),
          }
        : d,
    );
    draftSalesRef.current = updated;
    setDraftSales(updated);
    saveDrafts(updated, shopIdRef.current);
  }, []);

  // ── Feedback Functions ───────────────────────────────────────────────────
  const submitFeedback = useCallback(
    (type: FeedbackType, title: string, description: string) => {
      const user = currentUser;
      const newEntry: FeedbackEntry = {
        id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        shopId: shopIdRef.current,
        userId: user?.id ?? shopIdRef.current,
        userName: user?.name ?? "Owner",
        type,
        title: title.trim(),
        description: description.trim(),
        status: "pending",
        rewardGiven: false,
        submittedAt: new Date().toISOString(),
      };
      const updated = [newEntry, ...feedbackListRef.current];
      feedbackListRef.current = updated;
      setFeedbackList(updated);
      saveData(STORAGE_KEYS.feedback, updated);
      try {
        (actorRef.current as any)?.saveFeedback?.(
          shopIdRef.current,
          JSON.stringify(updated),
        );
      } catch (_) {
        /* optional backend method */
      }
      toast.success(
        "Feedback submitted! Awaiting approval for diamond reward 💎",
      );
    },
    [currentUser],
  );

  const approveFeedback = useCallback(
    (feedbackId: string, approvedBy: string) => {
      const entry = feedbackListRef.current.find((f) => f.id === feedbackId);
      if (!entry || entry.status !== "pending") return;

      const updated = feedbackListRef.current.map((f) =>
        f.id === feedbackId
          ? {
              ...f,
              status: "approved" as const,
              rewardGiven: true,
              approvedBy,
              approvedAt: new Date().toISOString(),
            }
          : f,
      );
      feedbackListRef.current = updated;
      setFeedbackList(updated);
      saveData(STORAGE_KEYS.feedback, updated);
      try {
        (actorRef.current as any)?.saveFeedback?.(
          shopIdRef.current,
          JSON.stringify(updated),
        );
      } catch (_) {
        /* optional */
      }

      // Award 10 diamonds to the feedback submitter
      const reward: DiamondReward = {
        id: generateId(),
        shopId: shopIdRef.current,
        userId: entry.userId,
        userName: entry.userName,
        productId: "feedback",
        productName: `Feedback: ${entry.title}`,
        cycleCompletedAt: new Date().toISOString(),
        diamondCount: 10,
        rewardType: "feedback",
        feedbackId,
      };
      const updatedRewards = [...diamondRewardsRef.current, reward];
      diamondRewardsRef.current = updatedRewards;
      setDiamondRewards(updatedRewards);
      saveData(STORAGE_KEYS.diamondRewards, updatedRewards);
      try {
        (actorRef.current as any)?.saveDiamondRewards?.(
          shopIdRef.current,
          JSON.stringify(updatedRewards),
        );
      } catch (_) {
        /* optional */
      }
      toast.success(
        `Feedback approved! 10 💎 diamonds awarded to ${entry.userName}`,
      );
    },
    [],
  );

  const rejectFeedback = useCallback((feedbackId: string, reason: string) => {
    const updated = feedbackListRef.current.map((f) =>
      f.id === feedbackId
        ? { ...f, status: "rejected" as const, rejectionReason: reason }
        : f,
    );
    feedbackListRef.current = updated;
    setFeedbackList(updated);
    saveData(STORAGE_KEYS.feedback, updated);
    try {
      (actorRef.current as any)?.saveFeedback?.(
        shopIdRef.current,
        JSON.stringify(updated),
      );
    } catch (_) {
      /* optional */
    }
    toast.success("Feedback rejected");
  }, []);

  // ── Referral Functions ────────────────────────────────────────────────────
  const getOrCreateReferralCode = useCallback((): ReferralCode => {
    const user = currentUser;
    const userId = user?.id ?? shopIdRef.current;
    const existing = referralCodesRef.current.find(
      (rc) => rc.userId === userId && rc.shopId === shopIdRef.current,
    );
    if (existing) return existing;

    // Generate code: first 4 chars of userId + last 4 digits of mobile + 4 random
    const mobile = user?.mobile ?? "0000";
    const mobileSuffix = mobile.replace(/\D/g, "").slice(-4).padStart(4, "0");
    const userPrefix = userId
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 4)
      .toUpperCase()
      .padEnd(4, "X");
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    const code = `${userPrefix}${mobileSuffix}${random}`.slice(0, 12);

    const newCode: ReferralCode = {
      id: `ref_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      shopId: shopIdRef.current,
      userId,
      userName: user?.name ?? "Owner",
      code,
      createdAt: new Date().toISOString(),
      successfulSignups: 0,
      totalDiamondsEarned: 0,
    };
    const updated = [...referralCodesRef.current, newCode];
    referralCodesRef.current = updated;
    setReferralCodes(updated);
    saveData(STORAGE_KEYS.referralCodes, updated);
    try {
      (actorRef.current as any)?.saveReferralCodes?.(
        shopIdRef.current,
        JSON.stringify(updated),
      );
    } catch (_) {
      /* optional */
    }
    return newCode;
  }, [currentUser]);

  const awardReferralDiamonds = useCallback((referralSignupId: string) => {
    const signup = referralSignupsRef.current.find(
      (s) => s.id === referralSignupId,
    );
    if (!signup || signup.rewardAwardedToReferrer) return;

    // Mark signup as rewarded
    const updatedSignups = referralSignupsRef.current.map((s) =>
      s.id === referralSignupId
        ? { ...s, rewardAwardedToReferrer: true, rewardAwardedToNewUser: true }
        : s,
    );
    referralSignupsRef.current = updatedSignups;
    setReferralSignups(updatedSignups);
    saveData(STORAGE_KEYS.referralSignups, updatedSignups);
    try {
      (actorRef.current as any)?.saveReferralSignups?.(
        shopIdRef.current,
        JSON.stringify(updatedSignups),
      );
    } catch (_) {
      /* optional */
    }

    // Award 10 diamonds to referrer
    const referrerReward: DiamondReward = {
      id: generateId(),
      shopId: shopIdRef.current,
      userId: signup.referrerUserId,
      userName: signup.referrerName,
      productId: "referral",
      productName: `Referral: ${signup.newUserName} joined`,
      cycleCompletedAt: new Date().toISOString(),
      diamondCount: 10,
      rewardType: "referral",
      referralId: referralSignupId,
    };
    // Award 10 diamonds to new user
    const newUserReward: DiamondReward = {
      id: generateId(),
      shopId: shopIdRef.current,
      userId: signup.newUserId,
      userName: signup.newUserName,
      productId: "referral-welcome",
      productName: "Welcome Bonus — Referral",
      cycleCompletedAt: new Date().toISOString(),
      diamondCount: 10,
      rewardType: "referral",
      referralId: referralSignupId,
    };
    const updatedRewards = [
      ...diamondRewardsRef.current,
      referrerReward,
      newUserReward,
    ];
    diamondRewardsRef.current = updatedRewards;
    setDiamondRewards(updatedRewards);
    saveData(STORAGE_KEYS.diamondRewards, updatedRewards);
    try {
      (actorRef.current as any)?.saveDiamondRewards?.(
        shopIdRef.current,
        JSON.stringify(updatedRewards),
      );
    } catch (_) {
      /* optional */
    }

    // Update referral code stats
    const updatedCodes = referralCodesRef.current.map((rc) =>
      rc.id === signup.referralCodeId
        ? {
            ...rc,
            successfulSignups: rc.successfulSignups + 1,
            totalDiamondsEarned: rc.totalDiamondsEarned + 10,
          }
        : rc,
    );
    referralCodesRef.current = updatedCodes;
    setReferralCodes(updatedCodes);
    saveData(STORAGE_KEYS.referralCodes, updatedCodes);

    toast.success(
      `🎉 Referral reward! 10 💎 each for ${signup.referrerName} & ${signup.newUserName}`,
    );
  }, []);

  // ── Device-based referral fraud prevention ──────────────────────────────────
  const checkReferralDeviceFraud = useCallback(
    (code: string): string | null => {
      const alreadyUsed = getDeviceUsedReferralCode();
      if (alreadyUsed && alreadyUsed !== code) {
        return "This device has already used a referral code";
      }
      return null;
    },
    [],
  );

  // ── Record a new referral signup (with deviceId populated) ──────────────────
  const recordReferralSignup = useCallback(
    (
      referralCode: ReferralCode,
      newUserId: string,
      newUserName: string,
      newUserMobile: string,
    ) => {
      // Fraud check
      const fraudError = checkReferralDeviceFraud(referralCode.code);
      if (fraudError) {
        toast.error(fraudError);
        return;
      }

      // Prevent duplicate signups for the same new user
      const alreadySignedUp = referralSignupsRef.current.some(
        (s) =>
          s.newUserId === newUserId ||
          s.newUserMobile.replace(/\D/g, "") ===
            newUserMobile.replace(/\D/g, ""),
      );
      if (alreadySignedUp) {
        toast.error("This user has already used a referral code");
        return;
      }

      const deviceId = getDeviceId();
      const newSignup: ReferralSignup = {
        id: `rsig_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        shopId: shopIdRef.current,
        referralCodeId: referralCode.id,
        referrerUserId: referralCode.userId,
        referrerName: referralCode.userName,
        newUserId,
        newUserName,
        newUserMobile,
        signupAt: new Date().toISOString(),
        firstTransactionCompleted: false,
        rewardAwardedToReferrer: false,
        rewardAwardedToNewUser: false,
        deviceId,
      };

      const updated = [newSignup, ...referralSignupsRef.current];
      referralSignupsRef.current = updated;
      setReferralSignups(updated);
      saveData(STORAGE_KEYS.referralSignups, updated);
      try {
        (actorRef.current as any)?.saveReferralSignups?.(
          shopIdRef.current,
          JSON.stringify(updated),
        );
      } catch (_) {
        /* optional */
      }

      // Mark this device as having used the code
      setDeviceUsedReferralCode(referralCode.code);

      toast.success(
        "Referral code applied! 10 💎 diamonds will be awarded after your first transaction.",
      );
    },
    [checkReferralDeviceFraud],
  );

  // ── Attendance CRUD ──────────────────────────────────────────────────────
  const clockIn = useCallback(
    (
      staffId: string,
      staffName: string,
      staffRole: UserRole,
    ): AttendanceRecord => {
      const today = new Date().toISOString().slice(0, 10);
      const now = new Date().toISOString();
      const existing = attendanceRecordsRef.current.find(
        (r) => r.staffId === staffId && r.date === today,
      );
      if (existing) return existing;
      const record: AttendanceRecord = {
        id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        shopId: shopIdRef.current,
        staffId,
        staffName,
        staffRole,
        date: today,
        clockIn: now,
        clockOut: null,
        status: "present",
        hoursWorked: 0,
        createdAt: now,
      };
      const updated = [record, ...attendanceRecordsRef.current];
      attendanceRecordsRef.current = updated;
      setAttendanceRecords(updated);
      saveData(`attendanceRecords_${shopIdRef.current}`, updated);
      try {
        (actorRef.current as any)?.saveAttendanceRecords?.(
          shopIdRef.current,
          JSON.stringify(updated),
        );
      } catch (_) {
        /* optional */
      }
      return record;
    },
    [],
  );

  const clockOut = useCallback((staffId: string): AttendanceRecord | null => {
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date().toISOString();
    const existing = attendanceRecordsRef.current.find(
      (r) => r.staffId === staffId && r.date === today,
    );
    if (!existing || !existing.clockIn) return null;
    const hoursWorked =
      Math.round(
        ((new Date(now).getTime() - new Date(existing.clockIn).getTime()) /
          3_600_000) *
          100,
      ) / 100;
    const status: AttendanceRecord["status"] =
      hoursWorked >= 4 ? "present" : "half-day";
    const updated = attendanceRecordsRef.current.map((r) =>
      r.id === existing.id ? { ...r, clockOut: now, hoursWorked, status } : r,
    );
    attendanceRecordsRef.current = updated;
    setAttendanceRecords(updated);
    saveData(`attendanceRecords_${shopIdRef.current}`, updated);
    try {
      (actorRef.current as any)?.saveAttendanceRecords?.(
        shopIdRef.current,
        JSON.stringify(updated),
      );
    } catch (_) {
      /* optional */
    }
    return updated.find((r) => r.id === existing.id)!;
  }, []);

  const getAttendanceForDate = useCallback(
    (date: string): AttendanceRecord[] =>
      attendanceRecordsRef.current.filter((r) => r.date === date),
    [],
  );

  const getAttendanceForStaff = useCallback(
    (staffId: string, month: string): AttendanceRecord[] =>
      attendanceRecordsRef.current.filter(
        (r) => r.staffId === staffId && r.date.startsWith(month),
      ),
    [],
  );

  const updateAttendance = useCallback(
    (id: string, updates: Partial<AttendanceRecord>) => {
      const updated = attendanceRecordsRef.current.map((r) =>
        r.id === id ? { ...r, ...updates } : r,
      );
      attendanceRecordsRef.current = updated;
      setAttendanceRecords(updated);
      saveData(`attendanceRecords_${shopIdRef.current}`, updated);
      try {
        (actorRef.current as any)?.saveAttendanceRecords?.(
          shopIdRef.current,
          JSON.stringify(updated),
        );
      } catch (_) {
        /* optional */
      }
    },
    [],
  );

  // ── Bulk WhatsApp Reminder ───────────────────────────────────────────────
  const sendBulkReminder = useCallback((): {
    sent: number;
    customers: Customer[];
  } => {
    const shopName = currentShop?.name ?? "Save Shop System";
    const ledgers = invoicesRef.current.reduce<
      Map<string, { name: string; mobile: string; due: number }>
    >((acc, inv) => {
      if (isWalkIn(inv.customerName ?? "")) return acc;
      const due = inv.dueAmount ?? 0;
      if (due <= 0) return acc;
      const mobile = normMobile(inv.customerMobile ?? "");
      const key = mobile || inv.customerName.trim().toLowerCase();
      const existing = acc.get(key);
      if (existing) {
        existing.due += due;
      } else {
        acc.set(key, {
          name: inv.customerName.trim(),
          mobile: (mobile || inv.customerMobile) ?? "",
          due,
        });
      }
      return acc;
    }, new Map());

    const targets = [...ledgers.values()].filter((c) => c.due > 0 && c.mobile);
    const sentAt = new Date().toISOString();

    for (const c of targets) {
      const message = `Hi ${c.name}, you have ₹${Math.round(c.due)} pending at ${shopName}. Please settle at your earliest convenience. Thank you!`;
      window.open(
        `https://wa.me/91${c.mobile}?text=${encodeURIComponent(message)}`,
        "_blank",
        "noopener",
      );
    }

    setBulkReminderSentAt(sentAt);
    localStorage.setItem(`bulkReminderSentAt_${shopIdRef.current}`, sentAt);

    const user = currentUser;
    const auditEntry: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      shopId: shopIdRef.current,
      userId: user?.id ?? "unknown",
      userName: user?.name ?? "Unknown",
      userRole: user?.role ?? "staff",
      action: "bulk_reminder",
      details: `Bulk WhatsApp reminder sent to ${targets.length} customers with outstanding dues.`,
      timestamp: sentAt,
      deletedUser: false,
    };
    const updatedAudit = [auditEntry, ...auditLogsRef.current].slice(0, 500);
    auditLogsRef.current = updatedAudit;
    setAuditLogs(updatedAudit);
    try {
      (actorRef.current as any)?.saveAuditLogs?.(
        shopIdRef.current,
        JSON.stringify(updatedAudit),
      );
    } catch (_) {
      /* optional */
    }

    const customersNotified: Customer[] = targets.map((c, i) => ({
      id: `bulk_${i}`,
      name: c.name,
      mobile: c.mobile,
      creditBalance: c.due,
    }));

    toast.success(
      `Bulk reminder sent to ${targets.length} customer${targets.length !== 1 ? "s" : ""} 📲`,
    );
    return { sent: targets.length, customers: customersNotified };
  }, [currentShop, currentUser]);

  const value: StoreContextValue = {
    categories,
    products,
    batches,
    transactions,
    customers,
    invoices,
    users,
    shopUnits,
    shopId,
    payments,
    isLoading,
    refreshCounter,
    triggerRefresh,
    isSyncing,
    shopSettings,
    updateShopSettings,
    addCategory,
    updateCategory,
    deleteCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    addStockIn,
    addStockOut,
    getProductStock,
    getProductBatches,
    getStockValue,
    getTotalStockValue,
    calculateFIFOCost,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    createInvoice,
    getNextInvoiceNumber,
    receivePayment,
    getTotalCreditDue,
    getCustomerLedger,
    getAllCustomerLedgers,
    mergeDuplicateCustomers,
    addUser,
    updateUser,
    deleteUser,
    addShopUnit,
    deleteShopUnit,
    getDailySales,
    getLastSoldDate,
    getTodaySales,
    getTodayProfit,
    getTotalProfit,
    getTotalInvestment,
    getLowStockProducts,
    getProductCostPrice,
    getProductProfit,
    getProductProfitPct,
    getDrafts,
    saveDraftNow,
    restoreDraft,
    draftSales,
    saveDraft,
    deleteDraft,
    getDraftById,
    markDraftCompleted,
    returns,
    addReturn,
    getReturnReport,
    appConfig,
    featureFlags: appConfig.featureFlags,
    saveAppConfig,
    setFeatureFlag,
    setDashboardSection,
    setFeatureMode,
    autoMode,
    setAutoMode,
    lowPriceAlertLogs,
    addLowPriceAlertLog,
    auditLogs,
    addAuditLog,
    getAuditLogs,
    reminderLogs,
    reminderRequests,
    sendReminder,
    requestReminder,
    approveReminderRequest,
    rejectReminderRequest,
    getReminderCountToday,
    getPendingReminderRequests,
    vendors,
    addVendor,
    updateVendor,
    deleteVendor,
    purchaseOrders,
    addPurchaseOrder,
    updatePurchaseOrder,
    markPurchaseReceived,
    customerOrders,
    addCustomerOrder,
    acceptCustomerOrder,
    rejectCustomerOrder,
    vendorRateHistory,
    addVendorRateHistory,
    getLastVendorRate,
    getVendorRateHistoryForVendor,
    diamondRewards,
    awardDiamond: (productId: string, productName: string) => {
      const reward: DiamondReward = {
        id: generateId(),
        shopId: shopIdRef.current,
        userId: currentUser?.id ?? shopIdRef.current,
        userName: currentUser?.name ?? "Owner",
        productId,
        productName,
        cycleCompletedAt: new Date().toISOString(),
        diamondCount: 1,
        rewardType: "transaction",
      };
      const updated = [...diamondRewardsRef.current, reward];
      diamondRewardsRef.current = updated;
      setDiamondRewards(updated);
      saveData(STORAGE_KEYS.diamondRewards, updated);
    },
    getTotalDiamonds: () =>
      diamondRewardsRef.current.reduce((s, r) => s + r.diamondCount, 0),
    feedbackList,
    submitFeedback,
    approveFeedback,
    rejectFeedback,
    referralCodes,
    referralSignups,
    getOrCreateReferralCode,
    awardReferralDiamonds,
    checkReferralDeviceFraud,
    recordReferralSignup,
    // Attendance
    attendanceRecords,
    clockIn,
    clockOut,
    getAttendanceForDate,
    getAttendanceForStaff,
    updateAttendance,
    // Bulk Reminder
    bulkReminderSentAt,
    sendBulkReminder,
    actorError,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
