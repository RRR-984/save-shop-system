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
export interface DeleteShopResult {
    success: boolean;
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
export interface UpdateShopResult {
    error?: string;
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
export interface AddShopResult {
    shopId: string;
    error?: string;
    success: boolean;
}
export interface UserProfile {
    name: string;
}
export interface backendInterface {
    addShop(ownerMobile: string, shopName: string, address: string, city: string): Promise<AddShopResult>;
    deleteShop(shopId: string): Promise<DeleteShopResult>;
    getAuditLogs(shopId: string): Promise<string>;
    getBatches(shopId: string): Promise<string>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCategories(shopId: string): Promise<string>;
    getCustomerOrders(shopId: string): Promise<string>;
    getCustomers(shopId: string): Promise<string>;
    getDrafts(shopId: string): Promise<string>;
    getFeedback(shopId: string): Promise<string>;
    getInvoices(shopId: string): Promise<string>;
    getLowPriceAlertLogs(shopId: string): Promise<string>;
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
    getShopUnits(shopId: string): Promise<string>;
    getTransactions(shopId: string): Promise<string>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUsers(shopId: string): Promise<string>;
    getVendorRateHistory(shopId: string): Promise<string>;
    getVendors(shopId: string): Promise<string>;
    listShopsForOwner(mobile: string): Promise<Array<ShopMeta>>;
    saveAuditLogs(shopId: string, data: string): Promise<void>;
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
    saveTransactions(shopId: string, data: string): Promise<void>;
    saveUsers(shopId: string, data: string): Promise<void>;
    saveVendorRateHistory(shopId: string, data: string): Promise<void>;
    saveVendors(shopId: string, data: string): Promise<void>;
    updateShop(shopId: string, name: string, address: string, city: string): Promise<UpdateShopResult>;
}
