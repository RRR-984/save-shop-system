import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import MultiShopTypes "types/multishop";
import MultiShopLib "lib/multishop";
import MultiShopMixin "mixins/multishop-api";
import AdminDashboardTypes "types/admin-dashboard";
import AdminDashboardMixin "mixins/admin-dashboard-api";

actor {
  // Shop data: shopId -> (collectionName -> jsonData)
  // Uses enhanced orthogonal persistence - survives canister upgrades automatically
  let shopData = Map.empty<Text, Map.Map<Text, Text>>();

  // Multi-shop registry: ownerMobile -> List<ShopMeta>
  let shopRegistry : MultiShopLib.Registry = Map.empty<Text, List.List<MultiShopTypes.ShopMeta>>();

  // ── Admin Dashboard Global State ────────────────────────────────────────────
  // Flat activity log: activityId -> ActivityRecord (global, not per-shop)
  let activityStore = Map.empty<Text, AdminDashboardTypes.ActivityRecord>();

  // Single global AdminSettings record (super-admin mobile, etc.)
  let adminSettingsBox = { var value : ?AdminDashboardTypes.AdminSettings = null };

  // Paid user flags: "userId_shopId" -> Bool
  let paidUsersStore = Map.empty<Text, Bool>();

  // Merge audit log: global list of JSON audit entry strings (last 10 used, unlimited stored)
  let mergeAuditLog = List.empty<Text>();

  // Permanent audit trail of every super-admin mobile change (never deleted)
  let superAdminChangeLog = List.empty<AdminDashboardTypes.SuperAdminChangeLog>();

  include MultiShopMixin(shopRegistry, shopData);
  include AdminDashboardMixin(activityStore, adminSettingsBox, paidUsersStore, shopRegistry, shopData, mergeAuditLog, superAdminChangeLog);

  // ── Permanent super-admin bootstrap ────────────────────────────────────────
  // On every canister start, ensure the permanent super-admin (9929306080) is set.
  // This runs once at actor initialization and guarantees recoverability after
  // upgrades or a null adminSettingsBox.
  switch (adminSettingsBox.value) {
    case (null) {
      adminSettingsBox.value := ?{
        superAdminMobile = "9929306080";
        createdAt        = Time.now();
        updatedAt        = Time.now();
      };
    };
    case (?s) {
      if (s.superAdminMobile == "") {
        adminSettingsBox.value := ?{
          superAdminMobile = "9929306080";
          createdAt        = s.createdAt;
          updatedAt        = Time.now();
        };
      };
      // Already has a valid super-admin — do not overwrite.
    };
  };

  // Backup snapshots: shopId -> List<BackupEntry>
  // Stored separately from shopData to allow structured pruning by timestamp
  type BackupEntry = {
    id : Text;
    timestamp : Int;
    tag : Text;
    data : Text;
  };

  // Lightweight metadata returned without the full data blob
  type BackupSnapshotMeta = {
    id : Text;
    timestamp : Int;
    tag : Text;
  };

  let backupSnapshots = Map.empty<Text, List.List<BackupEntry>>();

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Helper: Get collection data for a shop
  func getShopCollection(shopId : Text, collectionName : Text) : Text {
    switch (shopData.get(shopId)) {
      case (null) { "" };
      case (?shopMap) {
        switch (shopMap.get(collectionName)) {
          case (null) { "" };
          case (?data) { data };
        };
      };
    };
  };

  // Helper: Save collection data for a shop
  func saveShopCollection(shopId : Text, collectionName : Text, data : Text) : () {
    let shopMap : Map.Map<Text, Text> = switch (shopData.get(shopId)) {
      case (null) { Map.empty<Text, Text>() };
      case (?existing) { existing };
    };
    shopMap.add(collectionName, data);
    shopData.add(shopId, shopMap);
  };

  // -- Products
  public query func getProducts(shopId : Text) : async Text {
    getShopCollection(shopId, "products");
  };

  public shared func saveProducts(shopId : Text, data : Text) : async () {
    saveShopCollection(shopId, "products", data);
  };

  // -- Batches (Stock)
  public query func getBatches(shopId : Text) : async Text {
    getShopCollection(shopId, "batches");
  };

  public shared func saveBatches(shopId : Text, data : Text) : async () {
    saveShopCollection(shopId, "batches", data);
  };

  // -- Transactions
  public query func getTransactions(shopId : Text) : async Text {
    getShopCollection(shopId, "transactions");
  };

  public shared func saveTransactions(shopId : Text, data : Text) : async () {
    saveShopCollection(shopId, "transactions", data);
  };

  // -- Customers
  public query func getCustomers(shopId : Text) : async Text {
    getShopCollection(shopId, "customers");
  };

  public shared func saveCustomers(shopId : Text, data : Text) : async () {
    saveShopCollection(shopId, "customers", data);
  };

  // -- Invoices
  public query func getInvoices(shopId : Text) : async Text {
    getShopCollection(shopId, "invoices");
  };

  public shared func saveInvoices(shopId : Text, data : Text) : async () {
    saveShopCollection(shopId, "invoices", data);
  };

  // -- Users
  public query func getUsers(shopId : Text) : async Text {
    getShopCollection(shopId, "users");
  };

  public shared func saveUsers(shopId : Text, data : Text) : async () {
    saveShopCollection(shopId, "users", data);
  };

  // -- Shop Units
  public query func getShopUnits(shopId : Text) : async Text {
    getShopCollection(shopId, "shopUnits");
  };

  public shared func saveShopUnits(shopId : Text, data : Text) : async () {
    saveShopCollection(shopId, "shopUnits", data);
  };

  // -- Payments
  public query func getPayments(shopId : Text) : async Text {
    getShopCollection(shopId, "payments");
  };

  public shared func savePayments(shopId : Text, data : Text) : async () {
    saveShopCollection(shopId, "payments", data);
  };

  // -- Categories
  public query func getCategories(shopId : Text) : async Text {
    getShopCollection(shopId, "categories");
  };

  public shared func saveCategories(shopId : Text, data : Text) : async () {
    saveShopCollection(shopId, "categories", data);
  };

  // -- Drafts
  public query func getDrafts(shopId : Text) : async Text {
    getShopCollection(shopId, "drafts");
  };

  public shared func saveDrafts(shopId : Text, data : Text) : async () {
    saveShopCollection(shopId, "drafts", data);
  };

  // -- Returns
  public query func getReturns(shopId : Text) : async Text {
    getShopCollection(shopId, "returns");
  };

  public shared func saveReturns(shopId : Text, data : Text) : async () {
    saveShopCollection(shopId, "returns", data);
  };

  // -- Settings (feature toggles, dead stock config, etc.)
  public query func getSettings(shopId : Text) : async Text {
    getShopCollection(shopId, "settings");
  };

  public shared func saveSettings(shopId : Text, data : Text) : async () {
    saveShopCollection(shopId, "settings", data);
  };

  // -- Low Price Alert Logs
  public query func getLowPriceAlertLogs(shopId : Text) : async Text {
    getShopCollection(shopId, "lowPriceAlertLogs");
  };

  public shared func saveLowPriceAlertLogs(shopId : Text, data : Text) : async () {
    saveShopCollection(shopId, "lowPriceAlertLogs", data);
  };

  // -- Audit Logs (who did what, when — soft-delete only, never purge)
  public query func getAuditLogs(shopId : Text) : async Text {
    getShopCollection(shopId, "auditLogs");
  };

  public shared func saveAuditLogs(shopId : Text, data : Text) : async () {
    saveShopCollection(shopId, "auditLogs", data);
  };

  // -- Reminder Logs (who sent reminder, customer, date/time)
  public query func getReminderLogs(shopId : Text) : async Text {
    getShopCollection(shopId, "reminderLogs");
  };

  public shared func saveReminderLogs(shopId : Text, data : Text) : async () {
    saveShopCollection(shopId, "reminderLogs", data);
  };

  // -- Reminder Requests (staff requests pending owner/manager approval)
  public query func getReminderRequests(shopId : Text) : async Text {
    getShopCollection(shopId, "reminderRequests");
  };

  public shared func saveReminderRequests(shopId : Text, data : Text) : async () {
    saveShopCollection(shopId, "reminderRequests", data);
  };

  // -- Vendors
  public query func getVendors(shopId : Text) : async Text {
    getShopCollection(shopId, "vendors");
  };

  public shared func saveVendors(shopId : Text, data : Text) : async () {
    saveShopCollection(shopId, "vendors", data);
  };

  // -- Purchase Orders
  public query func getPurchaseOrders(shopId : Text) : async Text {
    getShopCollection(shopId, "purchaseOrders");
  };

  public shared func savePurchaseOrders(shopId : Text, data : Text) : async () {
    saveShopCollection(shopId, "purchaseOrders", data);
  };

  // -- Vendor Rate History
  public query func getVendorRateHistory(shopId : Text) : async Text {
    getShopCollection(shopId, "vendorRateHistory");
  };

  public shared func saveVendorRateHistory(shopId : Text, data : Text) : async () {
    saveShopCollection(shopId, "vendorRateHistory", data);
  };

  // -- Customer Orders
  public query func getCustomerOrders(shopId : Text) : async Text {
    getShopCollection(shopId, "customerOrders");
  };

  public shared func saveCustomerOrders(shopId : Text, data : Text) : async () {
    saveShopCollection(shopId, "customerOrders", data);
  };

  // -- Feedback (bug reports, feature requests, improvement suggestions)
  public query func getFeedback(shopId : Text) : async Text {
    getShopCollection(shopId, "feedback");
  };

  public shared func saveFeedback(shopId : Text, data : Text) : async () {
    saveShopCollection(shopId, "feedback", data);
  };

  // -- Referral Codes (each user's unique referral code)
  public query func getReferralCodes(shopId : Text) : async Text {
    getShopCollection(shopId, "referralCodes");
  };

  public shared func saveReferralCodes(shopId : Text, data : Text) : async () {
    saveShopCollection(shopId, "referralCodes", data);
  };

  // -- Referral Signups (who joined via referral, date, reward status)
  public query func getReferralSignups(shopId : Text) : async Text {
    getShopCollection(shopId, "referralSignups");
  };

  public shared func saveReferralSignups(shopId : Text, data : Text) : async () {
    saveShopCollection(shopId, "referralSignups", data);
  };

  // -- User Profiles (ICP identity-based)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  // ── Clear Shop Data (Reset) ─────────────────────────────────────────────────

  // Resets all data collections for the given shopId to empty arrays.
  // Shop metadata in the registry (name, address, etc.) is preserved.
  // Strictly scoped to the passed shopId — no other shops are affected.
  public shared func clearShopData(shopId : Text) : async () {
    let collections = [
      "products", "batches", "customers", "invoices", "payments",
      "vendors", "returns", "purchaseOrders", "customerOrders",
      "vendorRateHistory", "transactions", "drafts", "lowPriceAlertLogs",
      "auditLogs", "reminderLogs", "reminderRequests", "feedback",
      "referralCodes", "referralSignups", "diamondRewards", "appConfig", "settings"
    ];
    for (collection in collections.vals()) {
      saveShopCollection(shopId, collection, "[]");
    };
  };

  // ── Cloud Backup & Restore ──────────────────────────────────────────────────

  // Save a full JSON backup snapshot for a shop
  public shared func saveBackupSnapshot(shopId : Text, snapshotId : Text, tag : Text, data : Text) : async () {
    let entry : BackupEntry = {
      id = snapshotId;
      timestamp = Time.now();
      tag;
      data;
    };
    let snapshots : List.List<BackupEntry> = switch (backupSnapshots.get(shopId)) {
      case (null) { List.empty<BackupEntry>() };
      case (?existing) { existing };
    };
    snapshots.add(entry);
    backupSnapshots.add(shopId, snapshots);
  };

  // Returns snapshot metadata list (no data blobs) for a shop
  public query func getBackupSnapshots(shopId : Text) : async [BackupSnapshotMeta] {
    switch (backupSnapshots.get(shopId)) {
      case (null) { [] };
      case (?snapshots) {
        snapshots.map<BackupEntry, BackupSnapshotMeta>(func(e : BackupEntry) : BackupSnapshotMeta {
          { id = e.id; timestamp = e.timestamp; tag = e.tag }
        }).toArray()
      };
    };
  };

  // Returns the full data blob for a specific snapshot
  public query func getBackupSnapshotData(shopId : Text, snapshotId : Text) : async ?Text {
    switch (backupSnapshots.get(shopId)) {
      case (null) { null };
      case (?snapshots) {
        switch (snapshots.find(func(e : BackupEntry) : Bool { e.id == snapshotId })) {
          case (null) { null };
          case (?entry) { ?entry.data };
        };
      };
    };
  };

  // Removes a specific snapshot by id
  public shared func deleteBackupSnapshot(shopId : Text, snapshotId : Text) : async () {
    switch (backupSnapshots.get(shopId)) {
      case (null) {};
      case (?snapshots) {
        let filtered = snapshots.filter(func(e : BackupEntry) : Bool { e.id != snapshotId });
        backupSnapshots.add(shopId, filtered);
      };
    };
  };

  // Deletes snapshots older than retainDays (0 = keep all). Returns count deleted.
  public shared func pruneOldBackups(shopId : Text, retainDays : Nat) : async Nat {
    if (retainDays == 0) { return 0 };
    switch (backupSnapshots.get(shopId)) {
      case (null) { 0 };
      case (?snapshots) {
        let cutoffNs : Int = Time.now() - (Int.fromNat(retainDays) * 24 * 60 * 60 * 1_000_000_000);
        let before = snapshots.size();
        let retained = snapshots.filter(func(e : BackupEntry) : Bool { e.timestamp >= cutoffNs });
        backupSnapshots.add(shopId, retained);
        before - retained.size()
      };
    };
  };

  // ── Sync Audit Trail ────────────────────────────────────────────────────────

  // Appends a sync log entry (JSON string) to the shop's syncLogs collection
  public shared func saveSyncLog(shopId : Text, logEntry : Text) : async () {
    let existing = getShopCollection(shopId, "syncLogs");
    // Build a simple JSON array by appending: existing is "" or "[...]"
    let updated : Text = if (existing == "" or existing == "[]") {
      "[" # logEntry # "]"
    } else {
      // Strip trailing "]", append new entry
      let trimmed = existing.trimEnd(#char ']');
      trimmed # "," # logEntry # "]"
    };
    saveShopCollection(shopId, "syncLogs", updated);
  };

  // Returns all sync log entries as a JSON array string
  public query func getSyncLogs(shopId : Text) : async Text {
    let data = getShopCollection(shopId, "syncLogs");
    if (data == "") { "[]" } else { data }
  };
};
