import Map "mo:core/Map";
import Types "../types/multishop";
import MultiShopLib "../lib/multishop";

mixin (
  shopRegistry : MultiShopLib.Registry,
  shopData : Map.Map<Text, Map.Map<Text, Text>>,
) {
  /// Create a new isolated shop for an owner mobile number.
  public shared func addShop(
    ownerMobile : Text,
    shopName : Text,
    address : Text,
    city : Text,
    category : Text,
  ) : async Types.AddShopResult {
    MultiShopLib.addShop(shopRegistry, ownerMobile, shopName, address, city, category)
  };

  /// List all non-deleted shops for an owner mobile number.
  public query func listShopsForOwner(
    mobile : Text,
  ) : async [Types.ShopMeta] {
    MultiShopLib.listShopsForOwner(shopRegistry, mobile)
  };

  /// Update name, address, city, category of a shop.
  public shared func updateShop(
    shopId : Text,
    name : Text,
    address : Text,
    city : Text,
    category : Text,
  ) : async Types.UpdateShopResult {
    MultiShopLib.updateShop(shopRegistry, shopId, name, address, city, category)
  };

  /// Soft-delete a shop. Data in all collections is preserved.
  public shared func deleteShop(
    shopId : Text,
  ) : async Types.DeleteShopResult {
    MultiShopLib.deleteShop(shopRegistry, shopId)
  };

  /// Return metadata for a single shop by shopId.
  public query func getShop(
    shopId : Text,
  ) : async ?Types.ShopMeta {
    MultiShopLib.getShop(shopRegistry, shopId)
  };

  /// Aggregate stats across all shops for one owner.
  public query func getOwnerStats(
    mobile : Text,
  ) : async Types.OwnerStats {
    MultiShopLib.getOwnerStats(shopRegistry, shopData, mobile)
  };

  /// Returns true if the mobile number already has at least one non-deleted shop.
  public query func checkMobileExists(mobile : Text) : async Bool {
    MultiShopLib.checkMobileExists(shopRegistry, mobile)
  };

  /// Return the top `limit` shops ranked by combined score (revenue + sales + recency).
  public query func getTopActiveShops(limit : Nat) : async [Types.ShopRankResult] {
    MultiShopLib.getTopActiveShops(shopRegistry, shopData, limit)
  };

  /// Update the status of a specific shop based on a new activity timestamp.
  /// Called by recordActivity to keep status always fresh.
  public shared func updateShopStatus(shopId : Text, lastActivityTs : Int) : async () {
    MultiShopLib.updateShopStatus(shopRegistry, shopId, lastActivityTs)
  };
};
