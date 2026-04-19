import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Types "../types/multishop";

module {
  /// Registry: ownerMobile -> List of ShopMeta
  public type Registry = Map.Map<Text, List.List<Types.ShopMeta>>;

  /// Generate a shopId from owner mobile and existing count.
  /// First shop keeps legacy shop_{mobile} id for backward compatibility.
  /// Additional shops get shop_{mobile}_{timestamp_as_nat}.
  public func generateShopId(ownerMobile : Text, existingCount : Nat) : Text {
    if (existingCount == 0) {
      "shop_" # ownerMobile
    } else {
      let now = Time.now();
      let ts : Nat = Int.abs(now);
      "shop_" # ownerMobile # "_" # ts.toText()
    };
  };

  /// Create a new shop and insert it into the registry.
  public func addShop(
    registry : Registry,
    ownerMobile : Text,
    shopName : Text,
    address : Text,
    city : Text,
  ) : Types.AddShopResult {
    let shops : List.List<Types.ShopMeta> = switch (registry.get(ownerMobile)) {
      case (null) { List.empty<Types.ShopMeta>() };
      case (?existing) { existing };
    };
    let existingCount = shops.size();
    let shopId = generateShopId(ownerMobile, existingCount);

    // Check for duplicate id (extremely unlikely but guard it)
    let duplicate = shops.find(func(s : Types.ShopMeta) : Bool { s.id == shopId });
    switch (duplicate) {
      case (?_) {
        return { shopId = ""; success = false; error = ?"Shop ID conflict, please retry" };
      };
      case (null) {};
    };

    let now = Time.now();
    let newShop : Types.ShopMeta = {
      id = shopId;
      ownerMobile = ownerMobile;
      name = shopName;
      address = address;
      city = city;
      createdAt = now.toText();
      isDeleted = false;
    };
    shops.add(newShop);
    registry.add(ownerMobile, shops);
    { shopId = shopId; success = true; error = null };
  };

  /// Return all non-deleted shops for a given owner mobile.
  public func listShopsForOwner(
    registry : Registry,
    mobile : Text,
  ) : [Types.ShopMeta] {
    switch (registry.get(mobile)) {
      case (null) { [] };
      case (?shops) {
        let active = shops.filter(func(s : Types.ShopMeta) : Bool { not s.isDeleted });
        active.toArray()
      };
    };
  };

  /// Update name/address/city for a shop identified by shopId.
  /// Scans all owners to find the matching shop.
  public func updateShop(
    registry : Registry,
    shopId : Text,
    name : Text,
    address : Text,
    city : Text,
  ) : Types.UpdateShopResult {
    var found = false;
    registry.forEach(func(_mobile : Text, shops : List.List<Types.ShopMeta>) {
      switch (shops.findIndex(func(s : Types.ShopMeta) : Bool { s.id == shopId })) {
        case (null) {};
        case (?_idx) {
          found := true;
          shops.mapInPlace(func(s : Types.ShopMeta) : Types.ShopMeta {
            if (s.id == shopId) {
              { s with name = name; address = address; city = city }
            } else {
              s
            }
          });
        };
      };
    });
    if (found) {
      { success = true; error = null }
    } else {
      { success = false; error = ?"Shop not found" }
    };
  };

  /// Soft-delete a shop (sets isDeleted = true, data preserved).
  public func deleteShop(
    registry : Registry,
    shopId : Text,
  ) : Types.DeleteShopResult {
    var found = false;
    registry.forEach(func(_mobile : Text, shops : List.List<Types.ShopMeta>) {
      switch (shops.findIndex(func(s : Types.ShopMeta) : Bool { s.id == shopId })) {
        case (null) {};
        case (?_idx) {
          found := true;
          shops.mapInPlace(func(s : Types.ShopMeta) : Types.ShopMeta {
            if (s.id == shopId) {
              { s with isDeleted = true }
            } else {
              s
            }
          });
        };
      };
    });
    { success = found };
  };

  /// Return a single shop by shopId (scans all owners).
  public func getShop(
    registry : Registry,
    shopId : Text,
  ) : ?Types.ShopMeta {
    var result : ?Types.ShopMeta = null;
    registry.forEach(func(_ : Text, shops : List.List<Types.ShopMeta>) {
      switch (shops.find(func(s : Types.ShopMeta) : Bool { s.id == shopId })) {
        case (null) {};
        case (?shop) { result := ?shop };
      };
    });
    result;
  };

  /// Aggregate stats across all shops for an owner.
  /// Since actual sales/customer data lives in shopData as JSON,
  /// we return zero counts here — the frontend computes totals from its own data.
  public func getOwnerStats(
    registry : Registry,
    _shopData : Map.Map<Text, Map.Map<Text, Text>>,
    mobile : Text,
  ) : Types.OwnerStats {
    let shops : [Types.ShopMeta] = switch (registry.get(mobile)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };

    let shopStats = shops.map(func(s : Types.ShopMeta) : Types.ShopStats {
      {
        shopId = s.id;
        shopName = s.name;
        sales = 0;
        profit = 0;
        customers = 0;
        products = 0;
        transactions = 0;
      }
    });

    {
      totalSales = 0;
      totalProfit = 0;
      totalCustomers = 0;
      totalProducts = 0;
      totalTransactions = 0;
      shopStats = shopStats;
    };
  };
};
