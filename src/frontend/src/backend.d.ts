import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface OwnerStats {
    totalProducts: bigint;
    totalProfit: bigint;
    totalSales: bigint;
    totalCustomers: bigint;
    shopStats: Array<ShopStats>;
    totalTransactions: bigint;
}
export type CategoryResult = {
    __kind__: "ok";
    ok: GlobalCategory;
} | {
    __kind__: "err";
    err: string;
};
export interface ShopMeta {
    id: string;
    status: ShopStatus;
    isDeleted: boolean;
    city: string;
    name: string;
    createdAt: string;
    address: string;
    category: string;
    lastActivityTs: bigint;
    ownerMobile: string;
}
export interface RestaurantTable {
    id: TableId;
    status: TableStatus;
    tableNumber: bigint;
    restaurantId: string;
    currentOrderId?: OrderId;
    capacity: bigint;
}
export interface UpdateShopResult {
    error?: string;
    success: boolean;
}
export interface RestaurantBill {
    id: BillId;
    total: number;
    discountValue: number;
    serviceChargeRate: number;
    cgst: number;
    serviceCharge: number;
    discountType: DiscountType;
    sgst: number;
    gstEnabled: boolean;
    orderId: OrderId;
    restaurantId: string;
    discount: number;
    paymentMode: PaymentMode;
    gstRate: number;
    items: Array<OrderItem>;
    serviceChargeEnabled: boolean;
    paidAt: bigint;
    subtotal: number;
}
export interface OrderItem {
    portionSize: PortionSize;
    itemName: string;
    quantity: bigint;
    unitPrice: number;
    menuItemId: MenuItemId;
    subtotal: number;
}
export interface KotItem {
    portionSize: PortionSize;
    notes: string;
    itemName: string;
    quantity: bigint;
    menuItemId: MenuItemId;
}
export type BillId = string;
export interface ShopStatsResult {
    shopId: string;
    totalSalesAmount: number;
    lastActivity: bigint;
    totalSalesCount: bigint;
    shopName: string;
    totalRevenue: bigint;
    sessionCount: bigint;
    ownerMobile: string;
}
export interface GlobalCategory {
    id: string;
    isDeleted: boolean;
    name: string;
    isDefault: boolean;
}
export interface ShopRankResult {
    status: ShopStatus;
    shopId: string;
    rankScore: bigint;
    totalSalesCount: bigint;
    shopName: string;
    totalRevenue: bigint;
    lastActivityTs: bigint;
    ownerMobile: string;
}
export type MenuItemId = string;
export type LockResult = {
    __kind__: "conflict";
    conflict: {
        userName: string;
        expiresInSeconds: bigint;
        lockedBy: string;
    };
} | {
    __kind__: "acquired";
    acquired: null;
};
export interface ShopStats {
    shopId: string;
    sales: bigint;
    shopName: string;
    profit: bigint;
    transactions: bigint;
    products: bigint;
    customers: bigint;
}
export interface ActivityRecord {
    id: string;
    activityType: string;
    shopId: string;
    metadata: string;
    userId: string;
    timestamp: bigint;
}
export interface KOT {
    id: KotId;
    readyAt?: bigint;
    status: KotStatus;
    createdAt: bigint;
    tableNumber?: bigint;
    orderType: OrderType;
    orderId: OrderId;
    restaurantId: string;
    cookingStartedAt?: bigint;
    items: Array<KotItem>;
}
export interface UserStatsResult {
    shopId: string;
    totalSalesAmount: number;
    userId: string;
    lastActivity: bigint;
    isPaid: boolean;
    loginCount: bigint;
    shopName: string;
    salesCount: bigint;
}
export interface ActiveUserRecord {
    userName: string;
    userId: string;
    lastSeen: bigint;
}
export interface BackupSnapshotMeta {
    id: string;
    tag: string;
    timestamp: bigint;
}
export interface AdminSettings {
    createdAt: bigint;
    superAdminMobile: string;
    updatedAt: bigint;
}
export interface RestaurantOrder {
    id: OrderId;
    status: OrderStatus;
    createdAt: bigint;
    tableId?: TableId;
    tableNumber?: bigint;
    orderType: OrderType;
    restaurantId: string;
    updatedAt: bigint;
    notes: string;
    items: Array<OrderItem>;
    kotId?: KotId;
    billId?: BillId;
}
export interface ReportResult {
    totalOrders: bigint;
    topItems: Array<{
        revenue: number;
        itemName: string;
        quantity: bigint;
    }>;
    totalRevenue: number;
}
export interface DiamondPricingConfig {
    proModeDiamonds: bigint;
    smartModeDiamonds: bigint;
    updatedAt: bigint;
    proModePrice: bigint;
    smartModePrice: bigint;
}
export type KotId = string;
export interface MenuItem {
    id: MenuItemId;
    isHalfFullEnabled: boolean;
    halfPrice?: number;
    isQuickOrder: boolean;
    fullPrice?: number;
    name: string;
    createdAt: bigint;
    isActive: boolean;
    restaurantId: string;
    category: MenuCategory;
    basePrice: number;
}
export interface SuperAdminChangeLog {
    id: string;
    fromMobile: string;
    timestamp: bigint;
    toMobile: string;
}
export interface RestaurantConfig {
    serviceChargeRate: number;
    gstEnabled: boolean;
    restaurantId: string;
    quickOrderItems: Array<MenuItemId>;
    gstRate: number;
    tableCount: bigint;
    serviceChargeEnabled: boolean;
}
export interface DeleteShopResult {
    success: boolean;
}
export interface IdempotencyRecord {
    shopId: string;
    invoiceId: string;
    processedAt: bigint;
}
export interface AddShopResult {
    shopId: string;
    error?: string;
    success: boolean;
}
export type TableId = string;
export interface LockRecord {
    userName: string;
    expiresAt: bigint;
    shopId: string;
    userId: string;
    recordType: string;
    acquiredAt: bigint;
    recordId: string;
}
export type OrderId = string;
export interface UserProfile {
    name: string;
}
export enum DiscountType {
    Flat = "Flat",
    Percent = "Percent"
}
export enum KotStatus {
    Cooking = "Cooking",
    Ready = "Ready",
    Pending = "Pending"
}
export enum MenuCategory {
    Veg = "Veg",
    Drinks = "Drinks",
    NonVeg = "NonVeg",
    Snacks = "Snacks"
}
export enum OrderStatus {
    Billed = "Billed",
    Open = "Open",
    KotSent = "KotSent",
    Cancelled = "Cancelled"
}
export enum OrderType {
    Online = "Online",
    Takeaway = "Takeaway",
    DineIn = "DineIn"
}
export enum PaymentMode {
    Card = "Card",
    Cash = "Cash",
    Online = "Online",
    Partial_ = "Partial"
}
export enum PortionSize {
    Full = "Full",
    Half = "Half",
    Regular = "Regular"
}
export enum ShopStatus {
    active = "active",
    dead = "dead",
    inactive = "inactive"
}
export enum TableStatus {
    Reserved = "Reserved",
    Free = "Free",
    Occupied = "Occupied"
}
export interface backendInterface {
    acquireLock(recordId: string, recordType: string, shopId: string, userId: string, userName: string): Promise<LockResult>;
    addGlobalCategory(name: string): Promise<CategoryResult>;
    addItemsToOrder(restaurantId: string, orderId: OrderId, items: Array<OrderItem>): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    addMenuItem(restaurantId: string, name: string, category: MenuCategory, basePrice: number, halfPrice: number | null, fullPrice: number | null, isHalfFullEnabled: boolean, isQuickOrder: boolean): Promise<{
        __kind__: "ok";
        ok: MenuItemId;
    } | {
        __kind__: "err";
        err: string;
    }>;
    addShop(ownerMobile: string, shopName: string, address: string, city: string, category: string): Promise<AddShopResult>;
    addTable(restaurantId: string, tableNumber: bigint, capacity: bigint): Promise<{
        __kind__: "ok";
        ok: TableId;
    } | {
        __kind__: "err";
        err: string;
    }>;
    cancelOrder(restaurantId: string, orderId: OrderId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    checkIdempotency(idempotencyKey: string, shopId: string): Promise<IdempotencyRecord | null>;
    checkMobileExists(mobile: string): Promise<boolean>;
    clearShopData(shopId: string): Promise<void>;
    createBill(restaurantId: string, orderId: OrderId, gstEnabled: boolean, gstRate: number, serviceChargeEnabled: boolean, serviceChargeRate: number, discountType: DiscountType, discountValue: number, paymentMode: PaymentMode): Promise<{
        __kind__: "ok";
        ok: RestaurantBill;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createOrder(restaurantId: string, orderType: OrderType, tableId: TableId | null, items: Array<OrderItem>, notes: string): Promise<{
        __kind__: "ok";
        ok: OrderId;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteBackupSnapshot(shopId: string, snapshotId: string): Promise<void>;
    deleteGlobalCategory(id: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteMenuItem(restaurantId: string, menuItemId: MenuItemId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteShop(shopId: string): Promise<DeleteShopResult>;
    findDuplicateUsers(): Promise<string>;
    fullSystemReset(callerMobile: string): Promise<{
        deletedShops: bigint;
        message: string;
        success: boolean;
    }>;
    getActiveKOTs(restaurantId: string): Promise<Array<KOT>>;
    getActiveUsersForShop(shopId: string): Promise<Array<ActiveUserRecord>>;
    getActivities(shopIdFilter: string | null, startTs: bigint | null, endTs: bigint | null): Promise<Array<ActivityRecord>>;
    getAdminSettings(): Promise<AdminSettings>;
    getAllKOTs(restaurantId: string): Promise<Array<KOT>>;
    getAllUsersWithStats(startTs: bigint | null, endTs: bigint | null): Promise<Array<UserStatsResult>>;
    getAuditLogs(shopId: string): Promise<string>;
    getBackupSnapshotData(shopId: string, snapshotId: string): Promise<string | null>;
    getBackupSnapshots(shopId: string): Promise<Array<BackupSnapshotMeta>>;
    getBatches(shopId: string): Promise<string>;
    getBill(restaurantId: string, billId: BillId): Promise<RestaurantBill | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCategories(shopId: string): Promise<string>;
    getCustomerOrders(shopId: string): Promise<string>;
    getCustomers(shopId: string): Promise<string>;
    getDiamondPricing(): Promise<DiamondPricingConfig>;
    getDrafts(shopId: string): Promise<string>;
    getFeedback(shopId: string): Promise<string>;
    getGlobalCategories(): Promise<Array<GlobalCategory>>;
    getInvoices(shopId: string): Promise<string>;
    getLockStatus(recordId: string, recordType: string, shopId: string): Promise<LockRecord | null>;
    getLowPriceAlertLogs(shopId: string): Promise<string>;
    getMenuItems(restaurantId: string): Promise<Array<MenuItem>>;
    getMergeAuditLog(): Promise<string>;
    getOrders(restaurantId: string, statusFilter: OrderStatus | null): Promise<Array<RestaurantOrder>>;
    getOwnerStats(mobile: string): Promise<OwnerStats>;
    getPayments(shopId: string): Promise<string>;
    getProducts(shopId: string): Promise<string>;
    getPurchaseOrders(shopId: string): Promise<string>;
    getReferralCodes(shopId: string): Promise<string>;
    getReferralSignups(shopId: string): Promise<string>;
    getReminderLogs(shopId: string): Promise<string>;
    getReminderRequests(shopId: string): Promise<string>;
    getRestaurantConfig(restaurantId: string): Promise<RestaurantConfig>;
    getRestaurantReports(restaurantId: string, fromTs: bigint, toTs: bigint): Promise<ReportResult>;
    getReturns(shopId: string): Promise<string>;
    getSettings(shopId: string): Promise<string>;
    getShop(shopId: string): Promise<ShopMeta | null>;
    getShopPerformanceStats(startTs: bigint | null, endTs: bigint | null): Promise<Array<ShopStatsResult>>;
    getShopUnits(shopId: string): Promise<string>;
    getStaffAcrossShops(mobile: string): Promise<string>;
    getSuperAdminChangeLog(): Promise<Array<SuperAdminChangeLog>>;
    getSyncLogs(shopId: string): Promise<string>;
    getTables(restaurantId: string): Promise<Array<RestaurantTable>>;
    getTopActiveShops(limit: bigint): Promise<Array<ShopRankResult>>;
    getTransactions(shopId: string): Promise<string>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUsers(shopId: string): Promise<string>;
    getVendorRateHistory(shopId: string): Promise<string>;
    getVendors(shopId: string): Promise<string>;
    heartbeatLock(recordId: string, recordType: string, shopId: string, userId: string): Promise<boolean>;
    initPermanentSuperAdmin(): Promise<void>;
    isPermanentSuperAdminQuery(mobile: string): Promise<boolean>;
    listShopsForOwner(mobile: string): Promise<Array<ShopMeta>>;
    mergeUserAccounts(primaryId: string, secondaryIds: string): Promise<string>;
    pruneOldBackups(shopId: string, retainDays: bigint): Promise<bigint>;
    purgeOldActivities(beforeTs: bigint): Promise<bigint>;
    recordActivity(shopId: string, userId: string, activityType: string, metadata: string): Promise<void>;
    registerIdempotency(idempotencyKey: string, invoiceId: string, shopId: string): Promise<boolean>;
    releaseAllLocksForUser(shopId: string, userId: string): Promise<bigint>;
    releaseLock(recordId: string, recordType: string, shopId: string, userId: string): Promise<boolean>;
    saveAdminSettings(settings: AdminSettings): Promise<boolean>;
    saveAuditLogs(shopId: string, data: string): Promise<void>;
    saveBackupSnapshot(shopId: string, snapshotId: string, tag: string, data: string): Promise<void>;
    saveBatches(shopId: string, data: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveCategories(shopId: string, data: string): Promise<void>;
    saveCustomerOrders(shopId: string, data: string): Promise<void>;
    saveCustomers(shopId: string, data: string): Promise<void>;
    saveDiamondPricing(smartModePrice: bigint, proModePrice: bigint, smartModeDiamonds: bigint, proModeDiamonds: bigint): Promise<boolean>;
    saveDrafts(shopId: string, data: string): Promise<void>;
    saveFeedback(shopId: string, data: string): Promise<void>;
    saveInvoices(shopId: string, data: string): Promise<void>;
    saveLowPriceAlertLogs(shopId: string, data: string): Promise<void>;
    savePayments(shopId: string, data: string): Promise<void>;
    saveProducts(shopId: string, data: string): Promise<void>;
    savePurchaseOrders(shopId: string, data: string): Promise<void>;
    saveReferralCodes(shopId: string, data: string): Promise<void>;
    saveReferralSignups(shopId: string, data: string): Promise<void>;
    saveReminderLogs(shopId: string, data: string): Promise<void>;
    saveReminderRequests(shopId: string, data: string): Promise<void>;
    saveReturns(shopId: string, data: string): Promise<void>;
    saveSettings(shopId: string, data: string): Promise<void>;
    saveShopUnits(shopId: string, data: string): Promise<void>;
    saveSyncLog(shopId: string, logEntry: string): Promise<void>;
    saveTransactions(shopId: string, data: string): Promise<void>;
    saveUsers(shopId: string, data: string): Promise<void>;
    saveVendorRateHistory(shopId: string, data: string): Promise<void>;
    saveVendors(shopId: string, data: string): Promise<void>;
    sendKOT(restaurantId: string, orderId: OrderId): Promise<{
        __kind__: "ok";
        ok: KotId;
    } | {
        __kind__: "err";
        err: string;
    }>;
    settleOrder(restaurantId: string, orderId: OrderId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    toggleUserPaidStatus(userId: string, shopId: string, isPaid: boolean): Promise<boolean>;
    updateGlobalCategory(id: string, name: string): Promise<CategoryResult>;
    updateKotStatus(restaurantId: string, kotId: KotId, status: KotStatus): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateMenuItem(restaurantId: string, menuItemId: MenuItemId, name: string | null, category: MenuCategory | null, basePrice: number | null, halfPrice: Some<number | null> | None, fullPrice: Some<number | null> | None, isHalfFullEnabled: boolean | null, isQuickOrder: boolean | null, isActive: boolean | null): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateRestaurantConfig(restaurantId: string, cfg: RestaurantConfig): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateShop(shopId: string, name: string, address: string, city: string, category: string): Promise<UpdateShopResult>;
    updateShopStatus(shopId: string, lastActivityTs: bigint): Promise<void>;
    updateTableStatus(restaurantId: string, tableId: TableId, status: TableStatus, currentOrderId: OrderId | null): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    verifyAndChangeSuperAdmin(currentMobile: string, newMobile: string): Promise<{
        ok: boolean;
        message: string;
    }>;
}
