import Map "mo:core/Map";
import Types "../types/multishop";
import MultiShopLib "../lib/multishop";

mixin (
  shopRegistry : MultiShopLib.Registry,
  shopData : Map.Map<Text, Map.Map<Text, Text>>,
) {
  /// Create a new isolated shop for an owner mobile number.
  /// First shop for a mobile reuses the legacy shop_{mobile} id for
  /// backward compatibility with existing single-shop data.
  public shared func addShop(
    ownerMobile : Text,
    shopName : Text,
    address : Text,
    city : Text,
  ) : async Types.AddShopResult {
    MultiShopLib.addShop(shopRegistry, ownerMobile, shopName, address, city)
  };

  /// List all non-deleted shops for an owner mobile number.
  public query func listShopsForOwner(
    mobile : Text,
  ) : async [Types.ShopMeta] {
    MultiShopLib.listShopsForOwner(shopRegistry, mobile)
  };

  /// Update name, address, city of a shop. Data isolation is preserved.
  public shared func updateShop(
    shopId : Text,
    name : Text,
    address : Text,
    city : Text,
  ) : async Types.UpdateShopResult {
    MultiShopLib.updateShop(shopRegistry, shopId, name, address, city)
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

  /// Returns true if the mobile number already has at least one non-deleted shop
  /// in the registry (i.e. is a known owner). The frontend calls this before
  /// creating OTP flows to avoid spawning duplicate registry entries.
  public query func checkMobileExists(mobile : Text) : async Bool {
    MultiShopLib.checkMobileExists(shopRegistry, mobile)
  };
};
