import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export interface backendInterface {
    getAuditLogs(shopId: string): Promise<string>;
    getBatches(shopId: string): Promise<string>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCategories(shopId: string): Promise<string>;
    getCustomerOrders(shopId: string): Promise<string>;
    getCustomers(shopId: string): Promise<string>;
    getDrafts(shopId: string): Promise<string>;
    getInvoices(shopId: string): Promise<string>;
    getLowPriceAlertLogs(shopId: string): Promise<string>;
    getPayments(shopId: string): Promise<string>;
    getProducts(shopId: string): Promise<string>;
    getPurchaseOrders(shopId: string): Promise<string>;
    getReminderLogs(shopId: string): Promise<string>;
    getReminderRequests(shopId: string): Promise<string>;
    getReturns(shopId: string): Promise<string>;
    getSettings(shopId: string): Promise<string>;
    getShopUnits(shopId: string): Promise<string>;
    getTransactions(shopId: string): Promise<string>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUsers(shopId: string): Promise<string>;
    getVendorRateHistory(shopId: string): Promise<string>;
    getVendors(shopId: string): Promise<string>;
    saveAuditLogs(shopId: string, data: string): Promise<void>;
    saveBatches(shopId: string, data: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveCategories(shopId: string, data: string): Promise<void>;
    saveCustomerOrders(shopId: string, data: string): Promise<void>;
    saveCustomers(shopId: string, data: string): Promise<void>;
    saveDrafts(shopId: string, data: string): Promise<void>;
    saveInvoices(shopId: string, data: string): Promise<void>;
    saveLowPriceAlertLogs(shopId: string, data: string): Promise<void>;
    savePayments(shopId: string, data: string): Promise<void>;
    saveProducts(shopId: string, data: string): Promise<void>;
    savePurchaseOrders(shopId: string, data: string): Promise<void>;
    saveReminderLogs(shopId: string, data: string): Promise<void>;
    saveReminderRequests(shopId: string, data: string): Promise<void>;
    saveReturns(shopId: string, data: string): Promise<void>;
    saveSettings(shopId: string, data: string): Promise<void>;
    saveShopUnits(shopId: string, data: string): Promise<void>;
    saveTransactions(shopId: string, data: string): Promise<void>;
    saveUsers(shopId: string, data: string): Promise<void>;
    saveVendorRateHistory(shopId: string, data: string): Promise<void>;
    saveVendors(shopId: string, data: string): Promise<void>;
}
