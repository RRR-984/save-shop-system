import Map    "mo:core/Map";
import List   "mo:core/List";
import Time   "mo:core/Time";
import Nat    "mo:core/Nat";
import Types  "../types/restaurant";

module {

  // ── State aliases ─────────────────────────────────────────────────────────

  public type MenuStore    = Map.Map<Text, List.List<Types.MenuItem>>;
  public type TableStore   = Map.Map<Text, List.List<Types.RestaurantTable>>;
  public type OrderStore   = Map.Map<Text, List.List<Types.RestaurantOrder>>;
  public type KotStore     = Map.Map<Text, List.List<Types.KOT>>;
  public type BillStore    = Map.Map<Text, List.List<Types.RestaurantBill>>;
  public type ConfigStore  = Map.Map<Text, Types.RestaurantConfig>;

  // ── ID generation ─────────────────────────────────────────────────────────

  // Counter is owned by the actor and passed by reference so the module
  // stays purely functional (no module-level mutable state).
  public type Counter = { var value : Nat };

  func nextId(counter : Counter, prefix : Text) : Text {
    counter.value += 1;
    prefix # "_" # Time.now().toNat().toText() # "_" # counter.value.toText()
  };

  // ── Menu helpers ──────────────────────────────────────────────────────────

  func getMenuList(store : MenuStore, restaurantId : Text) : List.List<Types.MenuItem> {
    switch (store.get(restaurantId)) {
      case (?l) l;
      case null {
        let l = List.empty<Types.MenuItem>();
        store.add(restaurantId, l);
        l
      };
    }
  };

  public func addMenuItem(
    store         : MenuStore,
    counter       : Counter,
    restaurantId  : Text,
    name          : Text,
    category      : Types.MenuCategory,
    basePrice     : Float,
    halfPrice     : ?Float,
    fullPrice     : ?Float,
    isHalfFullEnabled : Bool,
    isQuickOrder  : Bool,
  ) : { #ok : Types.MenuItemId; #err : Text } {
    let id   = nextId(counter, "mi");
    let item : Types.MenuItem = {
      id;
      restaurantId;
      name;
      category;
      basePrice;
      halfPrice;
      fullPrice;
      isHalfFullEnabled;
      isActive     = true;
      isQuickOrder;
      createdAt    = Time.now();
    };
    getMenuList(store, restaurantId).add(item);
    #ok id
  };

  public func updateMenuItem(
    store        : MenuStore,
    restaurantId : Text,
    menuItemId   : Types.MenuItemId,
    name         : ?Text,
    category     : ?Types.MenuCategory,
    basePrice    : ?Float,
    halfPrice    : ??Float,
    fullPrice    : ??Float,
    isHalfFullEnabled : ?Bool,
    isQuickOrder : ?Bool,
    isActive     : ?Bool,
  ) : { #ok; #err : Text } {
    let list = getMenuList(store, restaurantId);
    var found = false;
    list.mapInPlace(func(item : Types.MenuItem) : Types.MenuItem {
      if (item.id == menuItemId) {
        found := true;
        {
          item with
          name              = switch (name) { case (?v) v; case null item.name };
          category          = switch (category) { case (?v) v; case null item.category };
          basePrice         = switch (basePrice) { case (?v) v; case null item.basePrice };
          halfPrice         = switch (halfPrice) { case (?v) v; case null item.halfPrice };
          fullPrice         = switch (fullPrice) { case (?v) v; case null item.fullPrice };
          isHalfFullEnabled = switch (isHalfFullEnabled) { case (?v) v; case null item.isHalfFullEnabled };
          isQuickOrder      = switch (isQuickOrder) { case (?v) v; case null item.isQuickOrder };
          isActive          = switch (isActive) { case (?v) v; case null item.isActive };
        }
      } else { item }
    });
    if (found) #ok else #err ("Menu item not found: " # menuItemId)
  };

  public func deleteMenuItem(
    store        : MenuStore,
    restaurantId : Text,
    menuItemId   : Types.MenuItemId,
  ) : { #ok; #err : Text } {
    // Soft-delete: mark inactive
    updateMenuItem(store, restaurantId, menuItemId, null, null, null, null, null, null, null, ?false)
  };

  public func getMenuItems(
    store        : MenuStore,
    restaurantId : Text,
  ) : [Types.MenuItem] {
    getMenuList(store, restaurantId)
      .filter(func(i : Types.MenuItem) : Bool { i.isActive })
      .toArray()
  };

  // ── Table helpers ─────────────────────────────────────────────────────────

  func getTableList(store : TableStore, restaurantId : Text) : List.List<Types.RestaurantTable> {
    switch (store.get(restaurantId)) {
      case (?l) l;
      case null {
        let l = List.empty<Types.RestaurantTable>();
        store.add(restaurantId, l);
        l
      };
    }
  };

  public func addTable(
    store        : TableStore,
    counter      : Counter,
    restaurantId : Text,
    tableNumber  : Nat,
    capacity     : Nat,
  ) : { #ok : Types.TableId; #err : Text } {
    let id = nextId(counter, "tbl");
    let tbl : Types.RestaurantTable = {
      id;
      restaurantId;
      tableNumber;
      capacity;
      status         = #Free;
      currentOrderId = null;
    };
    getTableList(store, restaurantId).add(tbl);
    #ok id
  };

  public func updateTableStatus(
    store          : TableStore,
    restaurantId   : Text,
    tableId        : Types.TableId,
    status         : Types.TableStatus,
    currentOrderId : ?Types.OrderId,
  ) : { #ok; #err : Text } {
    let list = getTableList(store, restaurantId);
    var found = false;
    list.mapInPlace(func(t : Types.RestaurantTable) : Types.RestaurantTable {
      if (t.id == tableId) {
        found := true;
        { t with status; currentOrderId }
      } else { t }
    });
    if (found) #ok else #err ("Table not found: " # tableId)
  };

  public func getTables(
    store        : TableStore,
    restaurantId : Text,
  ) : [Types.RestaurantTable] {
    getTableList(store, restaurantId).toArray()
  };

  // ── Order helpers ─────────────────────────────────────────────────────────

  func getOrderList(store : OrderStore, restaurantId : Text) : List.List<Types.RestaurantOrder> {
    switch (store.get(restaurantId)) {
      case (?l) l;
      case null {
        let l = List.empty<Types.RestaurantOrder>();
        store.add(restaurantId, l);
        l
      };
    }
  };

  public func createOrder(
    orderStore   : OrderStore,
    tableStore   : TableStore,
    counter      : Counter,
    restaurantId : Text,
    orderType    : Types.OrderType,
    tableId      : ?Types.TableId,
    items        : [Types.OrderItem],
    notes        : Text,
  ) : { #ok : Types.OrderId; #err : Text } {
    // Resolve table number
    let tableNumber : ?Nat = switch (tableId) {
      case null null;
      case (?tid) {
        let tables = getTableList(tableStore, restaurantId);
        switch (tables.find(func(t : Types.RestaurantTable) : Bool { t.id == tid })) {
          case (?t) ?t.tableNumber;
          case null null;
        }
      };
    };
    let id  = nextId(counter, "ord");
    let now = Time.now();
    let order : Types.RestaurantOrder = {
      id;
      restaurantId;
      orderType;
      tableId;
      tableNumber;
      items;
      status    = #Open;
      kotId     = null;
      billId    = null;
      createdAt = now;
      updatedAt = now;
      notes;
    };
    getOrderList(orderStore, restaurantId).add(order);
    #ok id
  };

  public func addItemsToOrder(
    store        : OrderStore,
    restaurantId : Text,
    orderId      : Types.OrderId,
    newItems     : [Types.OrderItem],
  ) : { #ok; #err : Text } {
    let list = getOrderList(store, restaurantId);
    var found = false;
    list.mapInPlace(func(o : Types.RestaurantOrder) : Types.RestaurantOrder {
      if (o.id == orderId) {
        found := true;
        { o with items = o.items.concat(newItems); updatedAt = Time.now() }
      } else { o }
    });
    if (found) #ok else #err ("Order not found: " # orderId)
  };

  // ── KOT helpers ───────────────────────────────────────────────────────────

  func getKotList(store : KotStore, restaurantId : Text) : List.List<Types.KOT> {
    switch (store.get(restaurantId)) {
      case (?l) l;
      case null {
        let l = List.empty<Types.KOT>();
        store.add(restaurantId, l);
        l
      };
    }
  };

  public func sendKOT(
    orderStore   : OrderStore,
    kotStore     : KotStore,
    tableStore   : TableStore,
    counter      : Counter,
    restaurantId : Text,
    orderId      : Types.OrderId,
  ) : { #ok : Types.KotId; #err : Text } {
    let orders = getOrderList(orderStore, restaurantId);
    switch (orders.find(func(o : Types.RestaurantOrder) : Bool { o.id == orderId })) {
      case null { #err ("Order not found: " # orderId) };
      case (?order) {
        let kotId = nextId(counter, "kot");
        let now   = Time.now();

        // Build KOT items from order items
        let kotItems : [Types.KotItem] = order.items.map<Types.OrderItem, Types.KotItem>(func(oi) {
          {
            menuItemId  = oi.menuItemId;
            itemName    = oi.itemName;
            portionSize = oi.portionSize;
            quantity    = oi.quantity;
            notes       = "";
          }
        });

        let kot : Types.KOT = {
          id               = kotId;
          restaurantId;
          orderId;
          tableNumber      = order.tableNumber;
          orderType        = order.orderType;
          items            = kotItems;
          status           = #Pending;
          createdAt        = now;
          cookingStartedAt = null;
          readyAt          = null;
        };
        getKotList(kotStore, restaurantId).add(kot);

        // Update order: status -> KotSent, link kotId
        orders.mapInPlace(func(o : Types.RestaurantOrder) : Types.RestaurantOrder {
          if (o.id == orderId) {
            { o with status = #KotSent; kotId = ?kotId; updatedAt = now }
          } else { o }
        });

        // If DineIn, mark table Occupied
        switch (order.orderType) {
          case (#DineIn) {
            switch (order.tableId) {
              case (?tid) {
                ignore updateTableStatus(tableStore, restaurantId, tid, #Occupied, ?orderId)
              };
              case null {};
            }
          };
          case (_) {};
        };

        #ok kotId
      };
    }
  };

  public func updateKotStatus(
    store        : KotStore,
    restaurantId : Text,
    kotId        : Types.KotId,
    status       : Types.KotStatus,
  ) : { #ok; #err : Text } {
    let list = getKotList(store, restaurantId);
    var found = false;
    let now = Time.now();
    list.mapInPlace(func(k : Types.KOT) : Types.KOT {
      if (k.id == kotId) {
        found := true;
        switch (status) {
          case (#Cooking) { { k with status; cookingStartedAt = ?now } };
          case (#Ready)   { { k with status; readyAt = ?now } };
          case (#Pending) { { k with status } };
        }
      } else { k }
    });
    if (found) #ok else #err ("KOT not found: " # kotId)
  };

  public func getActiveKOTs(
    store        : KotStore,
    restaurantId : Text,
  ) : [Types.KOT] {
    getKotList(store, restaurantId)
      .filter(func(k : Types.KOT) : Bool { k.status != #Ready })
      .toArray()
  };

  public func getAllKOTs(
    store        : KotStore,
    restaurantId : Text,
  ) : [Types.KOT] {
    getKotList(store, restaurantId).toArray()
  };

  // ── Bill helpers ──────────────────────────────────────────────────────────

  func getBillList(store : BillStore, restaurantId : Text) : List.List<Types.RestaurantBill> {
    switch (store.get(restaurantId)) {
      case (?l) l;
      case null {
        let l = List.empty<Types.RestaurantBill>();
        store.add(restaurantId, l);
        l
      };
    }
  };

  public func createBill(
    orderStore           : OrderStore,
    billStore            : BillStore,
    counter              : Counter,
    restaurantId         : Text,
    orderId              : Types.OrderId,
    gstEnabled           : Bool,
    gstRate              : Float,
    serviceChargeEnabled : Bool,
    serviceChargeRate    : Float,
    discountType         : Types.DiscountType,
    discountValue        : Float,
    paymentMode          : Types.PaymentMode,
  ) : { #ok : Types.RestaurantBill; #err : Text } {
    let orders = getOrderList(orderStore, restaurantId);
    switch (orders.find(func(o : Types.RestaurantOrder) : Bool { o.id == orderId })) {
      case null { #err ("Order not found: " # orderId) };
      case (?order) {
        // Subtotal
        var subtotal : Float = 0.0;
        for (item in order.items.values()) {
          subtotal += item.subtotal;
        };

        // Service charge
        let serviceCharge : Float = if (serviceChargeEnabled) {
          subtotal * serviceChargeRate / 100.0
        } else { 0.0 };

        // GST base (subtotal + service charge)
        let gstBase : Float = subtotal + serviceCharge;
        let gstAmount : Float = if (gstEnabled) { gstBase * gstRate / 100.0 } else { 0.0 };
        let cgst : Float = gstAmount / 2.0;
        let sgst : Float = gstAmount / 2.0;

        // Discount
        let discount : Float = switch (discountType) {
          case (#Percent) { (subtotal + serviceCharge + gstAmount) * discountValue / 100.0 };
          case (#Flat)    { discountValue };
        };

        let total : Float = subtotal + serviceCharge + gstAmount - discount;

        let billId = nextId(counter, "bill");
        let bill : Types.RestaurantBill = {
          id                   = billId;
          restaurantId;
          orderId;
          items                = order.items;
          subtotal;
          serviceChargeEnabled;
          serviceChargeRate;
          serviceCharge;
          gstEnabled;
          gstRate;
          cgst;
          sgst;
          discountType;
          discountValue;
          discount;
          total;
          paymentMode;
          paidAt               = Time.now();
        };
        getBillList(billStore, restaurantId).add(bill);

        // Link billId back to order
        orders.mapInPlace(func(o : Types.RestaurantOrder) : Types.RestaurantOrder {
          if (o.id == orderId) {
            { o with billId = ?billId; updatedAt = Time.now() }
          } else { o }
        });

        #ok bill
      };
    }
  };

  public func getBill(
    store        : BillStore,
    restaurantId : Text,
    billId       : Types.BillId,
  ) : ?Types.RestaurantBill {
    getBillList(store, restaurantId)
      .find(func(b : Types.RestaurantBill) : Bool { b.id == billId })
  };

  // ── Order lifecycle ───────────────────────────────────────────────────────

  func closeOrder(
    orderStore   : OrderStore,
    tableStore   : TableStore,
    restaurantId : Text,
    orderId      : Types.OrderId,
    status       : Types.OrderStatus,
  ) : { #ok; #err : Text } {
    let list = getOrderList(orderStore, restaurantId);
    var found    = false;
    var tableIdV : ?Types.TableId = null;
    list.mapInPlace(func(o : Types.RestaurantOrder) : Types.RestaurantOrder {
      if (o.id == orderId) {
        found    := true;
        tableIdV := o.tableId;
        { o with status; updatedAt = Time.now() }
      } else { o }
    });
    if (not found) { return #err ("Order not found: " # orderId) };
    // Free the table
    switch (tableIdV) {
      case (?tid) { ignore updateTableStatus(tableStore, restaurantId, tid, #Free, null) };
      case null   {};
    };
    #ok
  };

  public func settleOrder(
    orderStore   : OrderStore,
    tableStore   : TableStore,
    restaurantId : Text,
    orderId      : Types.OrderId,
  ) : { #ok; #err : Text } {
    closeOrder(orderStore, tableStore, restaurantId, orderId, #Billed)
  };

  public func cancelOrder(
    orderStore   : OrderStore,
    tableStore   : TableStore,
    restaurantId : Text,
    orderId      : Types.OrderId,
  ) : { #ok; #err : Text } {
    closeOrder(orderStore, tableStore, restaurantId, orderId, #Cancelled)
  };

  public func getOrders(
    store        : OrderStore,
    restaurantId : Text,
    statusFilter : ?Types.OrderStatus,
  ) : [Types.RestaurantOrder] {
    let list = getOrderList(store, restaurantId);
    switch (statusFilter) {
      case null { list.toArray() };
      case (?s) {
        list.filter(func(o : Types.RestaurantOrder) : Bool { o.status == s }).toArray()
      };
    }
  };

  // ── Config helpers ────────────────────────────────────────────────────────

  func defaultConfig(restaurantId : Text) : Types.RestaurantConfig {
    {
      restaurantId;
      quickOrderItems      = [];
      tableCount           = 0;
      gstRate              = 5.0;
      serviceChargeRate    = 0.0;
      gstEnabled           = false;
      serviceChargeEnabled = false;
    }
  };

  public func getRestaurantConfig(
    store        : ConfigStore,
    restaurantId : Text,
  ) : Types.RestaurantConfig {
    switch (store.get(restaurantId)) {
      case (?cfg) cfg;
      case null   { defaultConfig(restaurantId) };
    }
  };

  public func updateRestaurantConfig(
    store        : ConfigStore,
    restaurantId : Text,
    cfg          : Types.RestaurantConfig,
  ) : { #ok; #err : Text } {
    store.add(restaurantId, cfg);
    #ok
  };

  // ── Reports ───────────────────────────────────────────────────────────────

  public type ReportResult = {
    totalOrders  : Nat;
    totalRevenue : Float;
    topItems     : [{ itemName : Text; quantity : Nat; revenue : Float }];
  };

  public func getReports(
    orderStore   : OrderStore,
    billStore    : BillStore,
    restaurantId : Text,
    fromTs       : Int,
    toTs         : Int,
  ) : ReportResult {
    let orders = getOrderList(orderStore, restaurantId)
      .filter(func(o : Types.RestaurantOrder) : Bool {
        o.createdAt >= fromTs and o.createdAt <= toTs and o.status == #Billed
      });

    var totalOrders  : Nat   = 0;
    var totalRevenue : Float = 0.0;
    // item aggregation: name -> (quantity, revenue)
    let itemMap = Map.empty<Text, (Nat, Float)>();

    for (order in orders.values()) {
      totalOrders += 1;
      // Look up the bill for total revenue
      switch (getBill(billStore, restaurantId, switch (order.billId) { case (?b) b; case null "" })) {
        case (?bill) { totalRevenue += bill.total };
        case null    {};
      };
      for (item in order.items.values()) {
        let key = item.itemName;
        let (prevQty, prevRev) = switch (itemMap.get(key)) {
          case (?v) v;
          case null (0, 0.0);
        };
        itemMap.add(key, (prevQty + item.quantity, prevRev + item.subtotal));
      };
    };

    // Convert to array and sort by quantity descending (top sellers first)
    let arr = itemMap.entries()
      .map(
        func((name, (qty, rev))) {
          { itemName = name; quantity = qty; revenue = rev }
        }
      ).toArray();

    // Simple insertion sort descending by quantity (small N expected)
    let sorted = arr.sort(func(a, b) {
      if (a.quantity > b.quantity) #less
      else if (a.quantity < b.quantity) #greater
      else #equal
    });

    {
      totalOrders;
      totalRevenue;
      topItems = sorted;
    }
  };
};
