import Map "mo:core/Map";

actor {
  // Shop data: shopId -> (collectionName -> jsonData)
  // Uses enhanced orthogonal persistence - survives canister upgrades automatically
  let shopData = Map.empty<Text, Map.Map<Text, Text>>();

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
};
