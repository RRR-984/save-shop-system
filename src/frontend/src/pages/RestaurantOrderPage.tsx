import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ChefHat,
  Minus,
  Plus,
  Send,
  ShoppingBag,
  ShoppingCart,
  Star,
  Table2,
  Trash2,
  Truck,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useStore } from "../context/StoreContext";
import { useRestaurantData } from "../hooks/useRestaurantData";
import type {
  KOT,
  KotItem,
  MenuCategory,
  MenuItem,
  OrderItem,
  OrderType,
  PortionSize,
  RestaurantOrder,
} from "../types/restaurant";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_BADGE_CLASS: Record<MenuCategory, string> = {
  veg: "badge-veg",
  nonveg: "badge-nonveg",
  drinks: "badge-drinks",
  snacks: "badge-snacks",
};

const CATEGORY_DOT_COLOR: Record<MenuCategory, string> = {
  veg: "oklch(var(--category-veg))",
  nonveg: "oklch(var(--category-nonveg))",
  drinks: "oklch(var(--category-drinks))",
  snacks: "oklch(var(--category-snacks))",
};

const CATEGORY_LABEL: Record<MenuCategory, string> = {
  veg: "Veg",
  nonveg: "Non-Veg",
  drinks: "Drinks",
  snacks: "Snacks",
};

const ORDER_TYPES: {
  value: OrderType;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "dine-in", label: "Dine-In", icon: Table2 },
  { value: "takeaway", label: "Takeaway", icon: ShoppingBag },
  { value: "online", label: "Online", icon: Truck },
];

const CATEGORIES: Array<{ value: MenuCategory | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "veg", label: "🥦 Veg" },
  { value: "nonveg", label: "🍗 Non-Veg" },
  { value: "drinks", label: "🥤 Drinks" },
  { value: "snacks", label: "🍟 Snacks" },
];

interface CartEntry {
  menuItem: MenuItem;
  portion: PortionSize;
  quantity: number;
  notes: string;
}

function getItemPrice(item: MenuItem, portion: PortionSize): number {
  if (portion === "half" && item.halfPrice && item.halfPrice > 0)
    return item.halfPrice;
  return item.price;
}

function generateOrderId() {
  return `ord_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function generateKotId() {
  return `kot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function generateOrderNumber(count: number) {
  return `ORD-${String(count + 1).padStart(4, "0")}`;
}

function generateKotNumber(count: number) {
  return `KOT-${String(count + 1).padStart(4, "0")}`;
}

// ─── Menu Item Card ───────────────────────────────────────────────────────────

function MenuItemCard({
  item,
  onAdd,
  stockQty,
}: {
  item: MenuItem;
  onAdd: (item: MenuItem, portion: PortionSize) => void;
  stockQty: number | null;
}) {
  const hasHalf = !!item.halfPrice && item.halfPrice > 0;
  const isLowStock = stockQty !== null && stockQty > 0 && stockQty <= 5;
  const isOutOfStock = stockQty !== null && stockQty <= 0;

  return (
    <div
      data-ocid={`restaurant.order.menu_item.${item.id}`}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-card transition-all duration-200 card-interactive",
        isOutOfStock && "opacity-60",
      )}
    >
      {/* Category dot */}
      <div
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: CATEGORY_DOT_COLOR[item.category] }}
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground truncate">
          {item.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className={CATEGORY_BADGE_CLASS[item.category]}>
            {CATEGORY_LABEL[item.category]}
          </span>
          <span className="text-xs text-muted-foreground">
            ₹{item.price}
            {hasHalf && ` / H:₹${item.halfPrice}`}
          </span>
          {isLowStock && (
            <span
              className="inline-flex items-center gap-0.5 text-xs text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded-full font-medium"
              data-ocid={`restaurant.order.low_stock_badge.${item.id}`}
            >
              <AlertTriangle size={9} />
              Low ({stockQty})
            </span>
          )}
          {isOutOfStock && (
            <Badge
              variant="destructive"
              className="text-xs py-0"
              data-ocid={`restaurant.order.out_of_stock_badge.${item.id}`}
            >
              Out of Stock
            </Badge>
          )}
        </div>
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        {hasHalf && (
          <button
            type="button"
            data-ocid={`restaurant.order.add_half.${item.id}`}
            onClick={() => onAdd(item, "half")}
            disabled={isOutOfStock}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Half
          </button>
        )}
        <button
          type="button"
          data-ocid={`restaurant.order.add_full.${item.id}`}
          onClick={() => onAdd(item, hasHalf ? "full" : "single")}
          disabled={isOutOfStock}
          className="px-2.5 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Add
        </button>
      </div>
    </div>
  );
}

// ─── Cart Panel ───────────────────────────────────────────────────────────────

function CartPanel({
  cart,
  notes,
  onNotes,
  onUpdateQty,
  onRemove,
  onSend,
  sending,
}: {
  cart: CartEntry[];
  notes: string;
  onNotes: (v: string) => void;
  onUpdateQty: (id: string, portion: PortionSize, delta: number) => void;
  onRemove: (id: string, portion: PortionSize) => void;
  onSend: () => void;
  sending: boolean;
}) {
  const cartTotal = cart.reduce(
    (s, e) => s + getItemPrice(e.menuItem, e.portion) * e.quantity,
    0,
  );

  const itemCount = cart.reduce((s, e) => s + e.quantity, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <ShoppingCart size={16} className="text-primary" />
          <span className="font-bold text-sm text-foreground">
            Order Summary
          </span>
        </div>
        {itemCount > 0 && <Badge className="text-xs">{itemCount} items</Badge>}
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {cart.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full py-10 gap-3"
            data-ocid="restaurant.order.cart.empty_state"
          >
            <ShoppingCart size={36} className="text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground text-center">
              No items added yet
            </p>
            <p className="text-xs text-muted-foreground/70 text-center">
              Select items from the menu
            </p>
          </div>
        ) : (
          cart.map((entry, idx) => (
            <div
              key={`${entry.menuItem.id}-${entry.portion}`}
              data-ocid={`restaurant.order.cart.item.${idx + 1}`}
              className="flex items-center gap-2 py-2"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  {entry.menuItem.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {entry.portion} · ₹
                  {getItemPrice(entry.menuItem, entry.portion)} each
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() =>
                    onUpdateQty(entry.menuItem.id, entry.portion, -1)
                  }
                  className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
                  <Minus size={12} />
                </button>
                <span className="w-6 text-center text-sm font-bold tabular-nums">
                  {entry.quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() =>
                    onUpdateQty(entry.menuItem.id, entry.portion, 1)
                  }
                  className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
                  <Plus size={12} />
                </button>
                <button
                  type="button"
                  aria-label="Remove item"
                  onClick={() => onRemove(entry.menuItem.id, entry.portion)}
                  className="w-7 h-7 rounded-lg text-destructive flex items-center justify-center hover:bg-destructive/10 transition-colors ml-1"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {cart.length > 0 && (
        <div className="px-4 pb-4 pt-2 border-t border-border space-y-3">
          {/* Line-by-line subtotals */}
          <div className="space-y-1">
            {cart.map((entry) => (
              <div
                key={`sub-${entry.menuItem.id}-${entry.portion}`}
                className="flex justify-between text-xs text-muted-foreground"
              >
                <span className="truncate flex-1 mr-2">
                  {entry.menuItem.name} ({entry.portion}) ×{entry.quantity}
                </span>
                <span className="font-medium tabular-nums flex-shrink-0">
                  ₹
                  {getItemPrice(entry.menuItem, entry.portion) * entry.quantity}
                </span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-foreground">Total</span>
            <span className="text-lg font-bold text-primary tabular-nums">
              ₹{cartTotal}
            </span>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Special Instructions (optional)
            </Label>
            <Input
              data-ocid="restaurant.order.notes.input"
              value={notes}
              onChange={(e) => onNotes(e.target.value)}
              placeholder="e.g. no chilli, extra sauce..."
              className="text-sm h-8"
            />
          </div>

          <Button
            data-ocid="restaurant.order.send_button"
            className="w-full gap-2 h-11 font-bold text-sm"
            onClick={onSend}
            disabled={sending}
          >
            <Send size={15} />
            {sending ? "Sending to Kitchen..." : "Send to Kitchen (KOT)"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function RestaurantOrderPage() {
  const { shopId, getProductStock } = useStore();
  const {
    menuItems,
    tables,
    activeOrders,
    activeKots,
    setActiveOrders,
    setActiveKots,
    setTables,
  } = useRestaurantData(shopId);

  const [orderType, setOrderType] = useState<OrderType>("dine-in");
  const [selectedTableId, setSelectedTableId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [notes, setNotes] = useState("");
  const [searchItem, setSearchItem] = useState("");
  const [activeCat, setActiveCat] = useState<MenuCategory | "all">("all");
  const [sending, setSending] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);

  const freeTables = tables.filter((t) => t.status === "free");

  const filteredMenu = useMemo(() => {
    return menuItems.filter((item) => {
      if (!item.isAvailable) return false;
      // Auto-hide items linked to inventory when stock reaches 0
      if (item.inventoryProductId) {
        const stock = getProductStock(item.inventoryProductId);
        if (stock <= 0) return false;
      }
      const matchSearch = item.name
        .toLowerCase()
        .includes(searchItem.toLowerCase());
      const matchCat = activeCat === "all" || item.category === activeCat;
      return matchSearch && matchCat;
    });
  }, [menuItems, searchItem, activeCat, getProductStock]);

  const quickItems = menuItems.filter((i) => i.isAvailable && i.isQuickOrder);

  const cartItemCount = cart.reduce((s, e) => s + e.quantity, 0);

  const addToCart = (item: MenuItem, portion: PortionSize = "full") => {
    setCart((prev) => {
      const existing = prev.find(
        (e) => e.menuItem.id === item.id && e.portion === portion,
      );
      if (existing) {
        return prev.map((e) =>
          e.menuItem.id === item.id && e.portion === portion
            ? { ...e, quantity: e.quantity + 1 }
            : e,
        );
      }
      return [...prev, { menuItem: item, portion, quantity: 1, notes: "" }];
    });
  };

  const removeFromCart = (itemId: string, portion: PortionSize) => {
    setCart((prev) =>
      prev.filter((e) => !(e.menuItem.id === itemId && e.portion === portion)),
    );
  };

  const updateQty = (itemId: string, portion: PortionSize, delta: number) => {
    setCart((prev) =>
      prev
        .map((e) =>
          e.menuItem.id === itemId && e.portion === portion
            ? { ...e, quantity: Math.max(0, e.quantity + delta) }
            : e,
        )
        .filter((e) => e.quantity > 0),
    );
  };

  const handleSendOrder = () => {
    if (cart.length === 0) {
      toast.error("Add items to the order first");
      return;
    }
    if (orderType === "dine-in" && !selectedTableId) {
      toast.error("Please select a table for dine-in orders");
      return;
    }

    setSending(true);
    const now = new Date().toISOString();
    const table = tables.find((t) => t.id === selectedTableId);

    const orderItems: OrderItem[] = cart.map((e) => ({
      menuItemId: e.menuItem.id,
      menuItemName: e.menuItem.name,
      portion: e.portion,
      quantity: e.quantity,
      unitPrice: getItemPrice(e.menuItem, e.portion),
      totalPrice: getItemPrice(e.menuItem, e.portion) * e.quantity,
      notes: e.notes || undefined,
    }));

    const cartTotal = cart.reduce(
      (s, e) => s + getItemPrice(e.menuItem, e.portion) * e.quantity,
      0,
    );

    const order: RestaurantOrder = {
      id: generateOrderId(),
      shopId,
      orderNumber: generateOrderNumber(activeOrders.length),
      orderType,
      tableId: selectedTableId || undefined,
      tableNumber: table?.tableNumber,
      customerName: customerName.trim() || undefined,
      customerMobile: customerMobile.trim() || undefined,
      items: orderItems,
      status: "confirmed",
      subtotal: cartTotal,
      totalAmount: cartTotal,
      kotIds: [],
      notes: notes.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    const kotItems: KotItem[] = cart.map((e) => ({
      menuItemId: e.menuItem.id,
      menuItemName: e.menuItem.name,
      portion: e.portion,
      quantity: e.quantity,
      notes: e.notes || undefined,
    }));

    const kot: KOT = {
      id: generateKotId(),
      shopId,
      kotNumber: generateKotNumber(activeKots.length),
      orderId: order.id,
      orderNumber: order.orderNumber,
      tableNumber: table?.tableNumber,
      orderType,
      items: kotItems,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    order.kotIds = [kot.id];

    // Mark table as occupied
    if (selectedTableId) {
      setTables(
        tables.map((t) =>
          t.id === selectedTableId
            ? {
                ...t,
                status: "occupied",
                currentOrderId: order.id,
                updatedAt: now,
              }
            : t,
        ),
      );
    }

    setActiveOrders([...activeOrders, order]);
    setActiveKots([...activeKots, kot]);

    toast.success(`${order.orderNumber} sent to kitchen!`, {
      description: `${kot.kotNumber} created · ${cart.reduce((s, e) => s + e.quantity, 0)} items`,
    });

    // Reset form
    setCart([]);
    setCustomerName("");
    setCustomerMobile("");
    setNotes("");
    setSelectedTableId("");
    setShowMobileCart(false);
    setSending(false);
  };

  return (
    <div className="h-full flex flex-col" data-ocid="restaurant.order.page">
      {/* Page header */}
      <div className="px-4 md:px-6 py-3 border-b border-border bg-card flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ChefHat size={20} className="text-primary" />
          <h1 className="text-lg font-bold text-foreground">New Order</h1>
        </div>
        {/* Mobile: cart toggle button */}
        <button
          type="button"
          data-ocid="restaurant.order.cart_toggle.button"
          onClick={() => setShowMobileCart((v) => !v)}
          className="lg:hidden relative flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
        >
          <ShoppingCart size={15} />
          Cart
          {cartItemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* LEFT: Menu selection panel */}
        <div className="flex-1 flex flex-col min-w-0 overflow-auto p-4 md:p-5 space-y-4">
          {/* Step 1: Order type */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              Order Type
            </p>
            <div
              className="flex gap-2"
              data-ocid="restaurant.order.order_type.toggle"
            >
              {ORDER_TYPES.map((ot) => (
                <button
                  key={ot.value}
                  type="button"
                  data-ocid={`restaurant.order.type.${ot.value}`}
                  onClick={() => {
                    setOrderType(ot.value);
                    setSelectedTableId("");
                  }}
                  className={cn(
                    "flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all border-2 tap-scale",
                    orderType === ot.value
                      ? "bg-primary text-primary-foreground border-primary shadow-card"
                      : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  <ot.icon size={15} />
                  <span className="text-xs sm:text-sm">{ot.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Table selector — dine-in only */}
          {orderType === "dine-in" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Table <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedTableId}
                onValueChange={setSelectedTableId}
              >
                <SelectTrigger
                  data-ocid="restaurant.order.table.select"
                  className="bg-card"
                >
                  <SelectValue placeholder="Select a table" />
                </SelectTrigger>
                <SelectContent>
                  {freeTables.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      No free tables available
                    </SelectItem>
                  ) : (
                    freeTables.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        Table {t.tableNumber}
                        {t.capacity ? ` — Seats ${t.capacity}` : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Customer info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Customer Name</Label>
              <Input
                data-ocid="restaurant.order.customer_name.input"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Optional"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Mobile</Label>
              <Input
                data-ocid="restaurant.order.customer_mobile.input"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
                placeholder="Optional"
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Quick Order row */}
          {quickItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1 uppercase tracking-wide">
                <Zap size={12} className="text-amber-500" />
                Quick Order
              </p>
              <div className="flex gap-2 flex-wrap">
                {quickItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    data-ocid={`restaurant.order.quick.${item.id}`}
                    onClick={() => addToCart(item)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-card border border-amber-500/30 text-foreground hover:bg-amber-500/10 hover:border-amber-500/60 transition-all quick-action-chip"
                  >
                    <Star size={11} className="text-amber-500 flex-shrink-0" />
                    <span className="truncate max-w-[100px]">{item.name}</span>
                    <span className="text-muted-foreground text-xs tabular-nums flex-shrink-0">
                      ₹{item.price}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search bar */}
          <Input
            data-ocid="restaurant.order.search.input"
            placeholder="Search menu items..."
            value={searchItem}
            onChange={(e) => setSearchItem(e.target.value)}
            className="h-10 bg-card"
          />

          {/* Category filter tabs */}
          <div
            className="flex gap-1.5 overflow-x-auto pb-1 smart-filter-bar-scroll"
            data-ocid="restaurant.order.category.tabs"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                data-ocid={`restaurant.order.category.${cat.value}`}
                onClick={() => setActiveCat(cat.value)}
                className={cn(
                  "flex-shrink-0 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all border tap-scale",
                  activeCat === cat.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Menu grid */}
          {filteredMenu.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="restaurant.order.menu.empty_state"
            >
              <ChefHat size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-medium">No items found</p>
              <p className="text-sm mt-1">
                {searchItem
                  ? "Try a different search term"
                  : "No items in this category"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredMenu.map((item) => {
                const stockQty = item.inventoryProductId
                  ? getProductStock(item.inventoryProductId)
                  : null;
                return (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onAdd={addToCart}
                    stockQty={stockQty}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Cart panel (desktop sidebar) */}
        <div className="hidden lg:flex flex-col w-80 xl:w-96 border-l border-border bg-card min-h-0">
          <CartPanel
            cart={cart}
            notes={notes}
            onNotes={setNotes}
            onUpdateQty={updateQty}
            onRemove={removeFromCart}
            onSend={handleSendOrder}
            sending={sending}
          />
        </div>
      </div>

      {/* Mobile: Cart bottom sheet */}
      {showMobileCart && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex flex-col"
          data-ocid="restaurant.order.cart.sheet"
        >
          {/* Backdrop */}
          <div
            role="button"
            tabIndex={0}
            className="flex-1 bg-black/50"
            onClick={() => setShowMobileCart(false)}
            onKeyDown={(e) => e.key === "Escape" && setShowMobileCart(false)}
            aria-label="Close cart"
          />
          {/* Sheet */}
          <Card className="rounded-t-2xl rounded-b-none border-0 shadow-2xl max-h-[80vh] flex flex-col">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <CartPanel
                cart={cart}
                notes={notes}
                onNotes={setNotes}
                onUpdateQty={updateQty}
                onRemove={removeFromCart}
                onSend={handleSendOrder}
                sending={sending}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
