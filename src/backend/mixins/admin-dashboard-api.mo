import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import AdminDashboardTypes "../types/admin-dashboard";
import MultiShopTypes "../types/multishop";

/// Admin Dashboard Mixin
/// Exposes super-admin API endpoints.
/// State injected:
///   activityStore     — flat Map: activityId -> ActivityRecord
///   adminSettings     — var ?AdminSettings (single global record)
///   paidUsersStore    — Map: "userId_shopId" -> Bool
///   shopRegistry      — Map: ownerMobile -> List<ShopMeta>
///   shopData          — Map: shopId -> Map<collectionName, jsonData>
mixin (
  activityStore     : Map.Map<Text, AdminDashboardTypes.ActivityRecord>,
  adminSettings     : { var value : ?AdminDashboardTypes.AdminSettings },
  paidUsersStore    : Map.Map<Text, Bool>,
  shopRegistry      : Map.Map<Text, List.List<MultiShopTypes.ShopMeta>>,
  shopData          : Map.Map<Text, Map.Map<Text, Text>>
) {

  // ── recordActivity ──────────────────────────────────────────────────────────

  /// Record a user activity event (session start, billing action, stock action).
  /// shopId: the shop context; userId: mobile number; activityType: "session"|"billing"|"stock"
  public shared func recordActivity(
    shopId       : Text,
    userId       : Text,
    activityType : Text,
    metadata     : Text
  ) : async () {
    let ts = Time.now();
    let id = shopId # "_" # userId # "_" # ts.toText();
    let record : AdminDashboardTypes.ActivityRecord = {
      id;
      userId;
      shopId;
      activityType;
      timestamp = ts;
      metadata;
    };
    activityStore.add(id, record);
  };

  // ── getActivities ───────────────────────────────────────────────────────────

  /// Retrieve activity records, optionally filtered by shopId and/or time range.
  /// Pass null to omit a filter. Returns records sorted by timestamp descending.
  public query func getActivities(
    shopIdFilter : ?Text,
    startTs      : ?Int,
    endTs        : ?Int
  ) : async [AdminDashboardTypes.ActivityRecord] {
    let filtered = activityStore.values().filter(func(r : AdminDashboardTypes.ActivityRecord) : Bool {
      let matchShop = switch (shopIdFilter) {
        case (null) { true };
        case (?sid) { r.shopId == sid };
      };
      let matchStart = switch (startTs) {
        case (null) { true };
        case (?s)   { r.timestamp >= s };
      };
      let matchEnd = switch (endTs) {
        case (null) { true };
        case (?e)   { r.timestamp <= e };
      };
      matchShop and matchStart and matchEnd
    });
    // Collect into array and sort descending by timestamp
    let arr = filtered.toArray();
    arr.sort(func(a : AdminDashboardTypes.ActivityRecord, b : AdminDashboardTypes.ActivityRecord) : { #less; #equal; #greater } {
      Int.compare(b.timestamp, a.timestamp)
    })
  };

  // ── getAdminSettings ────────────────────────────────────────────────────────

  /// Retrieve global admin settings (super-admin mobile, etc.).
  public query func getAdminSettings() : async AdminDashboardTypes.AdminSettings {
    switch (adminSettings.value) {
      case (?s) { s };
      case (null) {
        { superAdminMobile = ""; createdAt = 0; updatedAt = 0 }
      };
    }
  };

  // ── saveAdminSettings ───────────────────────────────────────────────────────

  /// Persist global admin settings. Returns true on success.
  public shared func saveAdminSettings(
    settings : AdminDashboardTypes.AdminSettings
  ) : async Bool {
    adminSettings.value := ?settings;
    true
  };

  // ── getAllUsersWithStats ─────────────────────────────────────────────────────

  /// Aggregate user stats across all shops for the super-admin dashboard.
  /// Optionally filter by time window (startTs/endTs in nanoseconds).
  public query func getAllUsersWithStats(
    startTs : ?Int,
    endTs   : ?Int
  ) : async [AdminDashboardTypes.UserStatsResult] {
    let results = List.empty<AdminDashboardTypes.UserStatsResult>();

    // Iterate over every owner in the registry
    for ((ownerMobile, shops) in shopRegistry.entries()) {
      for (shop in shops.values()) {
        if (not shop.isDeleted) {
          let shopId = shop.id;
          let paidKey = ownerMobile # "_" # shopId;
          let isPaid = switch (paidUsersStore.get(paidKey)) {
            case (?v) { v };
            case (null) { false };
          };

          // Count logins (session activities) and billing activities
          var loginCount : Nat = 0;
          var salesCount : Nat = 0;
          var lastActivity : Int = 0;

          for (r in activityStore.values()) {
            if (r.shopId == shopId and r.userId == ownerMobile) {
              let inRange = (switch (startTs) { case (null) { true }; case (?s) { r.timestamp >= s } })
                and (switch (endTs) { case (null) { true }; case (?e) { r.timestamp <= e } });
              if (inRange) {
                if (r.activityType == "session") {
                  loginCount += 1;
                } else if (r.activityType == "billing") {
                  salesCount += 1;
                };
                if (r.timestamp > lastActivity) {
                  lastActivity := r.timestamp;
                };
              };
            };
          };

          // Sum invoice totals from shopData
          let totalSalesAmount : Float = switch (shopData.get(shopId)) {
            case (null) { 0.0 };
            case (?sMap) {
              switch (sMap.get("invoices")) {
                case (null) { 0.0 };
                case (?_json) {
                  // We cannot parse arbitrary JSON in Motoko; return 0.0
                  // The frontend will compute totals from the invoice JSON directly
                  0.0
                };
              }
            };
          };

          results.add({
            userId           = ownerMobile;
            shopId;
            shopName         = shop.name;
            loginCount;
            salesCount;
            totalSalesAmount;
            lastActivity;
            isPaid;
          });
        };
      };
    };

    results.toArray()
  };

  // ── getShopPerformanceStats ──────────────────────────────────────────────────

  /// Aggregate shop performance stats for the super-admin dashboard.
  /// Optionally filter by time window (startTs/endTs in nanoseconds).
  public query func getShopPerformanceStats(
    startTs : ?Int,
    endTs   : ?Int
  ) : async [AdminDashboardTypes.ShopStatsResult] {
    let results = List.empty<AdminDashboardTypes.ShopStatsResult>();

    for ((ownerMobile, shops) in shopRegistry.entries()) {
      for (shop in shops.values()) {
        if (not shop.isDeleted) {
          let shopId = shop.id;
          var sessionCount : Nat = 0;
          var lastActivity : Int = 0;

          for (r in activityStore.values()) {
            if (r.shopId == shopId) {
              let inRange = (switch (startTs) { case (null) { true }; case (?s) { r.timestamp >= s } })
                and (switch (endTs) { case (null) { true }; case (?e) { r.timestamp <= e } });
              if (inRange) {
                if (r.activityType == "session") {
                  sessionCount += 1;
                };
                if (r.timestamp > lastActivity) {
                  lastActivity := r.timestamp;
                };
              };
            };
          };

          results.add({
            shopId;
            shopName         = shop.name;
            ownerMobile;
            sessionCount;
            totalSalesAmount = 0.0;
            lastActivity;
          });
        };
      };
    };

    results.toArray()
  };

  // ── toggleUserPaidStatus ────────────────────────────────────────────────────

  /// Manually flag or unflag a user as a paid subscriber.
  /// userId: mobile number; shopId: the shop they own.
  /// Returns true on success.
  public shared func toggleUserPaidStatus(
    userId : Text,
    shopId : Text,
    isPaid : Bool
  ) : async Bool {
    let key = userId # "_" # shopId;
    paidUsersStore.add(key, isPaid);
    true
  };

  // ── purgeOldActivities ──────────────────────────────────────────────────────

  /// Purge activity records older than beforeTs (nanoseconds since epoch).
  /// Used for 90-day rolling retention. Returns count of deleted records.
  public shared func purgeOldActivities(beforeTs : Int) : async Nat {
    var removed : Nat = 0;
    // Collect keys to remove first (cannot mutate while iterating)
    let toRemove = List.empty<Text>();
    for ((id, r) in activityStore.entries()) {
      if (r.timestamp < beforeTs) {
        toRemove.add(id);
      };
    };
    for (id in toRemove.values()) {
      activityStore.remove(id);
      removed += 1;
    };
    removed
  };

};
