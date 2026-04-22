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
export interface SuperAdminChangeLog {
    id: string;
    fromMobile: string;
    timestamp: bigint;
    toMobile: string;
}
export interface BackupSnapshotMeta {
    id: string;
    tag: string;
    timestamp: bigint;
}
export interface ShopMeta {
    id: string;
    isDeleted: boolean;
    city: string;
    name: string;
    createdAt: string;
    address: string;
    ownerMobile: string;
}
export interface DeleteShopResult {
    success: boolean;
}
export interface ShopStats {
    shopId: string;
    sales: bigint;
    shopName: string;
    profit: bigint;
    transactions: bigint;
    products: bigint;
    customers: bigint;
}
export interface UpdateShopResult {
    error?: string;
    success: boolean;
}
export interface AdminSettings {
    createdAt: bigint;
    superAdminMobile: string;
    updatedAt: bigint;
}
export interface AddShopResult {
    shopId: string;
    error?: string;
    success: boolean;
}
export interface ActivityRecord {
    id: string;
    activityType: string;
    shopId: string;
    metadata: string;
    userId: string;
    timestamp: bigint;
}
export interface ShopStatsResult {
    shopId: string;
    totalSalesAmount: number;
    lastActivity: bigint;
    shopName: string;
    sessionCount: bigint;
    ownerMobile: string;
}
export interface UserProfile {
    name: string;
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
export interface backendInterface {
    addShop(ownerMobile: string, shopName: string, address: string, city: string): Promise<AddShopResult>;
    checkMobileExists(mobile: string): Promise<boolean>;
    clearShopData(shopId: string): Promise<void>;
    deleteBackupSnapshot(shopId: string, snapshotId: string): Promise<void>;
    deleteShop(shopId: string): Promise<DeleteShopResult>;
    findDuplicateUsers(): Promise<string>;
    getActivities(shopIdFilter: string | null, startTs: bigint | null, endTs: bigint | null): Promise<Array<ActivityRecord>>;
    getAdminSettings(): Promise<AdminSettings>;
    getAllUsersWithStats(startTs: bigint | null, endTs: bigint | null): Promise<Array<UserStatsResult>>;
    getAuditLogs(shopId: string): Promise<string>;
    getBackupSnapshotData(shopId: string, snapshotId: string): Promise<string | null>;
    getBackupSnapshots(shopId: string): Promise<Array<BackupSnapshotMeta>>;
    getBatches(shopId: string): Promise<string>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCategories(shopId: string): Promise<string>;
    getCustomerOrders(shopId: string): Promise<string>;
    getCustomers(shopId: string): Promise<string>;
    getDrafts(shopId: string): Promise<string>;
    getFeedback(shopId: string): Promise<string>;
    getInvoices(shopId: string): Promise<string>;
    getLowPriceAlertLogs(shopId: string): Promise<string>;
    getMergeAuditLog(): Promise<string>;
    getOwnerStats(mobile: string): Promise<OwnerStats>;
    getPayments(shopId: string): Promise<string>;
    getProducts(shopId: string): Promise<string>;
    getPurchaseOrders(shopId: string): Promise<string>;
    getReferralCodes(shopId: string): Promise<string>;
    getReferralSignups(shopId: string): Promise<string>;
    getReminderLogs(shopId: string): Promise<string>;
    getReminderRequests(shopId: string): Promise<string>;
    getReturns(shopId: string): Promise<string>;
    getSettings(shopId: string): Promise<string>;
    getShop(shopId: string): Promise<ShopMeta | null>;
    getShopPerformanceStats(startTs: bigint | null, endTs: bigint | null): Promise<Array<ShopStatsResult>>;
    getShopUnits(shopId: string): Promise<string>;
    getStaffAcrossShops(mobile: string): Promise<string>;
    getSuperAdminChangeLog(): Promise<Array<SuperAdminChangeLog>>;
    getSyncLogs(shopId: string): Promise<string>;
    getTransactions(shopId: string): Promise<string>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUsers(shopId: string): Promise<string>;
    getVendorRateHistory(shopId: string): Promise<string>;
    getVendors(shopId: string): Promise<string>;
    initPermanentSuperAdmin(): Promise<void>;
    isPermanentSuperAdminQuery(mobile: string): Promise<boolean>;
    listShopsForOwner(mobile: string): Promise<Array<ShopMeta>>;
    mergeUserAccounts(primaryId: string, secondaryIds: string): Promise<string>;
    pruneOldBackups(shopId: string, retainDays: bigint): Promise<bigint>;
    purgeOldActivities(beforeTs: bigint): Promise<bigint>;
    recordActivity(shopId: string, userId: string, activityType: string, metadata: string): Promise<void>;
    saveAdminSettings(settings: AdminSettings): Promise<boolean>;
    saveAuditLogs(shopId: string, data: string): Promise<void>;
    saveBackupSnapshot(shopId: string, snapshotId: string, tag: string, data: string): Promise<void>;
    saveBatches(shopId: string, data: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveCategories(shopId: string, data: string): Promise<void>;
    saveCustomerOrders(shopId: string, data: string): Promise<void>;
    saveCustomers(shopId: string, data: string): Promise<void>;
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
    toggleUserPaidStatus(userId: string, shopId: string, isPaid: boolean): Promise<boolean>;
    updateShop(shopId: string, name: string, address: string, city: string): Promise<UpdateShopResult>;
    verifyAndChangeSuperAdmin(currentMobile: string, newMobile: string): Promise<{
        ok: boolean;
        message: string;
    }>;
}
