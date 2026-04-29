module {
  /// Shop lifecycle status — auto-calculated from last activity timestamp.
  /// Active = any activity within 7 days
  /// Inactive = 7–30 days no activity
  /// Dead = >30 days no activity
  public type ShopStatus = {
    #active;
    #inactive;
    #dead;
  };

  /// Metadata for a single shop owned by a mobile number.
  public type ShopMeta = {
    id : Text;
    ownerMobile : Text;
    name : Text;
    address : Text;
    city : Text;
    category : Text;
    createdAt : Text;
    isDeleted : Bool;
    status : ShopStatus;
    lastActivityTs : Int;
  };

  /// Per-shop aggregate stats (for owner dashboard).
  public type ShopStats = {
    shopId : Text;
    shopName : Text;
    sales : Nat;
    profit : Int;
    customers : Nat;
    products : Nat;
    transactions : Nat;
  };

  /// Aggregated stats across all shops for one owner.
  public type OwnerStats = {
    totalSales : Nat;
    totalProfit : Int;
    totalCustomers : Nat;
    totalProducts : Nat;
    totalTransactions : Nat;
    shopStats : [ShopStats];
  };

  /// Result type for addShop.
  public type AddShopResult = {
    shopId : Text;
    success : Bool;
    error : ?Text;
  };

  /// Result type for updateShop.
  public type UpdateShopResult = {
    success : Bool;
    error : ?Text;
  };

  /// Result type for deleteShop.
  public type DeleteShopResult = {
    success : Bool;
  };

  /// Combined ranking result for top active shops.
  public type ShopRankResult = {
    shopId : Text;
    shopName : Text;
    ownerMobile : Text;
    rankScore : Int;
    totalRevenue : Int;
    totalSalesCount : Nat;
    lastActivityTs : Int;
    status : ShopStatus;
  };
};
