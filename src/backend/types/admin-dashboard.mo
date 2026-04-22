module {

  /// A single user activity record.
  /// activityType: "session" | "billing" | "stock"
  /// metadata: JSON blob for extra context (e.g. sale amount, product id)
  public type ActivityRecord = {
    id         : Text;
    userId     : Text;
    shopId     : Text;
    activityType : Text;
    timestamp  : Int;
    metadata   : Text;
  };

  /// Global admin settings stored once in the backend (not per-shop).
  /// superAdminMobile is configurable at runtime — never hardcoded.
  public type AdminSettings = {
    superAdminMobile : Text;
    createdAt        : Int;
    updatedAt        : Int;
  };

  /// Audit record for every super-admin mobile change.
  /// Permanently stored; never deleted.
  public type SuperAdminChangeLog = {
    id          : Text;
    fromMobile  : Text;
    toMobile    : Text;
    timestamp   : Int;
  };

  /// Per-user stats aggregated for the super-admin dashboard.
  public type UserStatsResult = {
    userId           : Text;
    shopId           : Text;
    shopName         : Text;
    loginCount       : Nat;
    salesCount       : Nat;
    totalSalesAmount : Float;
    lastActivity     : Int;
    isPaid           : Bool;
  };

  /// Per-shop performance stats aggregated for the super-admin dashboard.
  public type ShopStatsResult = {
    shopId           : Text;
    shopName         : Text;
    ownerMobile      : Text;
    sessionCount     : Nat;
    totalSalesAmount : Float;
    lastActivity     : Int;
  };

};
