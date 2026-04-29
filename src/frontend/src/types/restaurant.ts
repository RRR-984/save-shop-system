// ─── Restaurant Module Types ──────────────────────────────────────────────────

export type MenuCategory = "veg" | "nonveg" | "drinks" | "snacks";
export type PortionSize = "half" | "full" | "single";
export type OrderType = "dine-in" | "takeaway" | "online";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "served"
  | "cancelled";
export type KotStatus = "pending" | "cooking" | "ready";
export type TableStatus = "free" | "occupied" | "reserved";

export interface MenuItem {
  id: string;
  shopId: string;
  name: string;
  category: MenuCategory;
  price: number;
  halfPrice?: number;
  isAvailable: boolean;
  isQuickOrder: boolean;
  description?: string;
  sortOrder?: number;
  /**
   * Optional link to a shop inventory product (by product ID).
   * When set, ordering this item will auto-deduct stock (FIFO).
   * Full portion = 1 unit deducted; Half portion = 0.5 units.
   */
  inventoryProductId?: string;
  /** Cached product name for display — kept in sync with inventoryProductId */
  inventoryProductName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantTable {
  id: string;
  shopId: string;
  tableNumber: number;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
  /** ISO timestamp when the table was last updated */
  updatedAt: string;
}

export interface OrderItem {
  menuItemId: string;
  menuItemName: string;
  portion: PortionSize;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface RestaurantOrder {
  id: string;
  shopId: string;
  orderNumber: string;
  orderType: OrderType;
  tableId?: string;
  tableNumber?: number;
  customerName?: string;
  customerMobile?: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  gstRate?: number;
  gstAmount?: number;
  cgstRate?: number;
  sgstRate?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  serviceChargeRate?: number;
  serviceChargeAmount?: number;
  totalAmount: number;
  paidAmount?: number;
  paymentMode?: "cash" | "upi" | "online" | "credit";
  kotIds: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KotItem {
  menuItemId: string;
  menuItemName: string;
  portion: PortionSize;
  quantity: number;
  notes?: string;
}

export interface KOT {
  id: string;
  shopId: string;
  kotNumber: string;
  orderId: string;
  orderNumber: string;
  tableNumber?: number;
  orderType: OrderType;
  items: KotItem[];
  status: KotStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantBill {
  id: string;
  shopId: string;
  orderId: string;
  orderNumber: string;
  tableNumber?: number;
  customerName?: string;
  customerMobile?: string;
  items: OrderItem[];
  subtotal: number;
  gstEnabled: boolean;
  gstRate: number;
  cgstRate: number;
  sgstRate: number;
  gstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  serviceChargeEnabled: boolean;
  serviceChargeRate: number;
  serviceChargeAmount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMode: "cash" | "upi" | "online" | "credit";
  createdAt: string;
}

export interface RestaurantConfig {
  shopId: string;
  restaurantName?: string;
  gstEnabled: boolean;
  gstRate: number;
  serviceChargeEnabled: boolean;
  serviceChargeRate: number;
  /** IDs of menu items pinned as quick-order buttons */
  quickOrderItemIds: string[];
  tableCount: number;
  currency: string;
}

// ─── Report types ─────────────────────────────────────────────────────────────

export interface RestaurantDailySummary {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  dineInCount: number;
  takeawayCount: number;
  onlineCount: number;
  topItems: Array<{ name: string; count: number; revenue: number }>;
}
