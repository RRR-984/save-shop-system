import Lib   "../lib/restaurant";
import Types "../types/restaurant";

mixin (
  menuStore   : Lib.MenuStore,
  tableStore  : Lib.TableStore,
  orderStore  : Lib.OrderStore,
  kotStore    : Lib.KotStore,
  billStore   : Lib.BillStore,
  configStore : Lib.ConfigStore,
  counter     : Lib.Counter,
) {

  // ── Menu ────────────────────────────────────────────────────────────────────

  public shared func addMenuItem(
    restaurantId      : Text,
    name              : Text,
    category          : Types.MenuCategory,
    basePrice         : Float,
    halfPrice         : ?Float,
    fullPrice         : ?Float,
    isHalfFullEnabled : Bool,
    isQuickOrder      : Bool,
  ) : async { #ok : Types.MenuItemId; #err : Text } {
    Lib.addMenuItem(menuStore, counter, restaurantId, name, category, basePrice, halfPrice, fullPrice, isHalfFullEnabled, isQuickOrder)
  };

  public shared func updateMenuItem(
    restaurantId      : Text,
    menuItemId        : Types.MenuItemId,
    name              : ?Text,
    category          : ?Types.MenuCategory,
    basePrice         : ?Float,
    halfPrice         : ??Float,
    fullPrice         : ??Float,
    isHalfFullEnabled : ?Bool,
    isQuickOrder      : ?Bool,
    isActive          : ?Bool,
  ) : async { #ok; #err : Text } {
    Lib.updateMenuItem(menuStore, restaurantId, menuItemId, name, category, basePrice, halfPrice, fullPrice, isHalfFullEnabled, isQuickOrder, isActive)
  };

  public shared func deleteMenuItem(
    restaurantId : Text,
    menuItemId   : Types.MenuItemId,
  ) : async { #ok; #err : Text } {
    Lib.deleteMenuItem(menuStore, restaurantId, menuItemId)
  };

  public shared func getMenuItems(restaurantId : Text) : async [Types.MenuItem] {
    Lib.getMenuItems(menuStore, restaurantId)
  };

  // ── Tables ───────────────────────────────────────────────────────────────────

  public shared func addTable(
    restaurantId : Text,
    tableNumber  : Nat,
    capacity     : Nat,
  ) : async { #ok : Types.TableId; #err : Text } {
    Lib.addTable(tableStore, counter, restaurantId, tableNumber, capacity)
  };

  public shared func updateTableStatus(
    restaurantId   : Text,
    tableId        : Types.TableId,
    status         : Types.TableStatus,
    currentOrderId : ?Types.OrderId,
  ) : async { #ok; #err : Text } {
    Lib.updateTableStatus(tableStore, restaurantId, tableId, status, currentOrderId)
  };

  public shared func getTables(restaurantId : Text) : async [Types.RestaurantTable] {
    Lib.getTables(tableStore, restaurantId)
  };

  // ── Orders ───────────────────────────────────────────────────────────────────

  public shared func createOrder(
    restaurantId : Text,
    orderType    : Types.OrderType,
    tableId      : ?Types.TableId,
    items        : [Types.OrderItem],
    notes        : Text,
  ) : async { #ok : Types.OrderId; #err : Text } {
    Lib.createOrder(orderStore, tableStore, counter, restaurantId, orderType, tableId, items, notes)
  };

  public shared func addItemsToOrder(
    restaurantId : Text,
    orderId      : Types.OrderId,
    items        : [Types.OrderItem],
  ) : async { #ok; #err : Text } {
    Lib.addItemsToOrder(orderStore, restaurantId, orderId, items)
  };

  public shared func getOrders(
    restaurantId : Text,
    statusFilter : ?Types.OrderStatus,
  ) : async [Types.RestaurantOrder] {
    Lib.getOrders(orderStore, restaurantId, statusFilter)
  };

  // ── KOT ─────────────────────────────────────────────────────────────────────

  public shared func sendKOT(
    restaurantId : Text,
    orderId      : Types.OrderId,
  ) : async { #ok : Types.KotId; #err : Text } {
    Lib.sendKOT(orderStore, kotStore, tableStore, counter, restaurantId, orderId)
  };

  public shared func updateKotStatus(
    restaurantId : Text,
    kotId        : Types.KotId,
    status       : Types.KotStatus,
  ) : async { #ok; #err : Text } {
    Lib.updateKotStatus(kotStore, restaurantId, kotId, status)
  };

  public shared func getActiveKOTs(restaurantId : Text) : async [Types.KOT] {
    Lib.getActiveKOTs(kotStore, restaurantId)
  };

  public shared func getAllKOTs(restaurantId : Text) : async [Types.KOT] {
    Lib.getAllKOTs(kotStore, restaurantId)
  };

  // ── Billing ──────────────────────────────────────────────────────────────────

  public shared func createBill(
    restaurantId         : Text,
    orderId              : Types.OrderId,
    gstEnabled           : Bool,
    gstRate              : Float,
    serviceChargeEnabled : Bool,
    serviceChargeRate    : Float,
    discountType         : Types.DiscountType,
    discountValue        : Float,
    paymentMode          : Types.PaymentMode,
  ) : async { #ok : Types.RestaurantBill; #err : Text } {
    Lib.createBill(orderStore, billStore, counter, restaurantId, orderId, gstEnabled, gstRate, serviceChargeEnabled, serviceChargeRate, discountType, discountValue, paymentMode)
  };

  public shared func getBill(
    restaurantId : Text,
    billId       : Types.BillId,
  ) : async ?Types.RestaurantBill {
    Lib.getBill(billStore, restaurantId, billId)
  };

  public shared func settleOrder(
    restaurantId : Text,
    orderId      : Types.OrderId,
  ) : async { #ok; #err : Text } {
    Lib.settleOrder(orderStore, tableStore, restaurantId, orderId)
  };

  public shared func cancelOrder(
    restaurantId : Text,
    orderId      : Types.OrderId,
  ) : async { #ok; #err : Text } {
    Lib.cancelOrder(orderStore, tableStore, restaurantId, orderId)
  };

  // ── Config ───────────────────────────────────────────────────────────────────

  public shared func getRestaurantConfig(restaurantId : Text) : async Types.RestaurantConfig {
    Lib.getRestaurantConfig(configStore, restaurantId)
  };

  public shared func updateRestaurantConfig(
    restaurantId : Text,
    cfg          : Types.RestaurantConfig,
  ) : async { #ok; #err : Text } {
    Lib.updateRestaurantConfig(configStore, restaurantId, cfg)
  };

  // ── Reports ──────────────────────────────────────────────────────────────────

  public shared func getRestaurantReports(
    restaurantId : Text,
    fromTs       : Int,
    toTs         : Int,
  ) : async Lib.ReportResult {
    Lib.getReports(orderStore, billStore, restaurantId, fromTs, toTs)
  };
};
