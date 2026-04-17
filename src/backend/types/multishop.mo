module {
  /// Metadata for a single shop owned by a mobile number.
  public type ShopMeta = {
    id : Text;
    ownerMobile : Text;
    name : Text;
    address : Text;
    city : Text;
    createdAt : Text;
    isDeleted : Bool;
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
};
