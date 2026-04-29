module {

  // ── ID aliases ────────────────────────────────────────────────────────────
  public type MenuItemId = Text;
  public type TableId    = Text;
  public type OrderId    = Text;
  public type KotId      = Text;
  public type BillId     = Text;

  // ── Variants ─────────────────────────────────────────────────────────────

  public type MenuCategory = {
    #Veg;
    #NonVeg;
    #Drinks;
    #Snacks;
  };

  public type TableStatus = {
    #Free;
    #Occupied;
    #Reserved;
  };

  public type OrderType = {
    #DineIn;
    #Takeaway;
    #Online;
  };

  public type OrderStatus = {
    #Open;
    #KotSent;
    #Billed;
    #Cancelled;
  };

  public type PortionSize = {
    #Half;
    #Full;
    #Regular;
  };

  public type KotStatus = {
    #Pending;
    #Cooking;
    #Ready;
  };

  public type DiscountType = {
    #Percent;
    #Flat;
  };

  public type PaymentMode = {
    #Cash;
    #Card;
    #Online;
    #Partial;
  };

  // ── MenuItem ─────────────────────────────────────────────────────────────

  public type MenuItem = {
    id                : MenuItemId;
    restaurantId      : Text;          // shopId namespace
    name              : Text;
    category          : MenuCategory;
    basePrice         : Float;
    halfPrice         : ?Float;
    fullPrice         : ?Float;
    isHalfFullEnabled : Bool;
    isActive          : Bool;
    isQuickOrder      : Bool;
    createdAt         : Int;
  };

  // ── RestaurantTable ───────────────────────────────────────────────────────

  public type RestaurantTable = {
    id             : TableId;
    restaurantId   : Text;
    tableNumber    : Nat;
    capacity       : Nat;
    status         : TableStatus;
    currentOrderId : ?OrderId;
  };

  // ── OrderItem (used in orders and bills) ──────────────────────────────────

  public type OrderItem = {
    menuItemId  : MenuItemId;
    itemName    : Text;
    portionSize : PortionSize;
    quantity    : Nat;
    unitPrice   : Float;
    subtotal    : Float;
  };

  // ── RestaurantOrder ───────────────────────────────────────────────────────

  public type RestaurantOrder = {
    id           : OrderId;
    restaurantId : Text;
    orderType    : OrderType;
    tableId      : ?TableId;
    tableNumber  : ?Nat;
    items        : [OrderItem];
    status       : OrderStatus;
    kotId        : ?KotId;
    billId       : ?BillId;
    createdAt    : Int;
    updatedAt    : Int;
    notes        : Text;
  };

  // ── KotItem ───────────────────────────────────────────────────────────────

  public type KotItem = {
    menuItemId  : MenuItemId;
    itemName    : Text;
    portionSize : PortionSize;
    quantity    : Nat;
    notes       : Text;
  };

  // ── KOT (Kitchen Order Ticket) ────────────────────────────────────────────

  public type KOT = {
    id               : KotId;
    restaurantId     : Text;
    orderId          : OrderId;
    tableNumber      : ?Nat;
    orderType        : OrderType;
    items            : [KotItem];
    status           : KotStatus;
    createdAt        : Int;
    cookingStartedAt : ?Int;
    readyAt          : ?Int;
  };

  // ── RestaurantBill ────────────────────────────────────────────────────────

  public type RestaurantBill = {
    id                   : BillId;
    restaurantId         : Text;
    orderId              : OrderId;
    items                : [OrderItem];
    subtotal             : Float;
    serviceChargeEnabled : Bool;
    serviceChargeRate    : Float;
    serviceCharge        : Float;
    gstEnabled           : Bool;
    gstRate              : Float;
    cgst                 : Float;
    sgst                 : Float;
    discountType         : DiscountType;
    discountValue        : Float;
    discount             : Float;
    total                : Float;
    paymentMode          : PaymentMode;
    paidAt               : Int;
  };

  // ── RestaurantConfig ──────────────────────────────────────────────────────

  public type RestaurantConfig = {
    restaurantId          : Text;
    quickOrderItems       : [MenuItemId];
    tableCount            : Nat;
    gstRate               : Float;
    serviceChargeRate     : Float;
    gstEnabled            : Bool;
    serviceChargeEnabled  : Bool;
  };

};
