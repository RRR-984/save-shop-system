import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ChefHat,
  Coffee,
  Edit2,
  Leaf,
  Link2,
  Package,
  Plus,
  Search,
  Star,
  Trash2,
  Utensils,
  Zap,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { useRestaurantData } from "../hooks/useRestaurantData";
import type { MenuCategory, MenuItem } from "../types/restaurant";

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  MenuCategory,
  {
    label: string;
    badgeCls: string;
    icon: React.ElementType;
    sectionBg: string;
  }
> = {
  veg: {
    label: "Veg",
    badgeCls: "badge-veg",
    icon: Leaf,
    sectionBg:
      "bg-[oklch(var(--category-veg)/0.06)] border-[oklch(var(--category-veg)/0.25)]",
  },
  nonveg: {
    label: "Non-Veg",
    badgeCls: "badge-nonveg",
    icon: ChefHat,
    sectionBg:
      "bg-[oklch(var(--category-nonveg)/0.06)] border-[oklch(var(--category-nonveg)/0.25)]",
  },
  drinks: {
    label: "Drinks",
    badgeCls: "badge-drinks",
    icon: Coffee,
    sectionBg:
      "bg-[oklch(var(--category-drinks)/0.06)] border-[oklch(var(--category-drinks)/0.25)]",
  },
  snacks: {
    label: "Snacks",
    badgeCls: "badge-snacks",
    icon: Zap,
    sectionBg:
      "bg-[oklch(var(--category-snacks)/0.06)] border-[oklch(var(--category-snacks)/0.25)]",
  },
};

const CATEGORY_ORDER: MenuCategory[] = ["veg", "nonveg", "drinks", "snacks"];

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: MenuCategory }) {
  const cfg = CATEGORY_CONFIG[category];
  return (
    <span
      className={cfg.badgeCls}
      data-ocid={`restaurant.menu.badge.${category}`}
    >
      <cfg.icon size={10} aria-hidden />
      {cfg.label}
    </span>
  );
}

interface MenuItemCardProps {
  item: MenuItem;
  index: number;
  stockQty: number | null;
  isOwnerOrManager: boolean;
  onEdit: (item: MenuItem) => void;
  onDeleteRequest: (id: string) => void;
  onToggleAvailable: (id: string) => void;
  onToggleQuickOrder: (id: string) => void;
}

function MenuItemCard({
  item,
  index,
  stockQty,
  isOwnerOrManager,
  onEdit,
  onDeleteRequest,
  onToggleAvailable,
  onToggleQuickOrder,
}: MenuItemCardProps) {
  const isLowStock = stockQty !== null && stockQty > 0 && stockQty <= 5;
  const isOutOfStock = stockQty !== null && stockQty <= 0;

  return (
    <Card
      data-ocid={`restaurant.menu.item.${index}`}
      className={cn(
        "shadow-card hover:shadow-card-lift transition-all duration-200 border",
        !item.isAvailable && "opacity-55",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Left: Category colour strip */}
          <div
            className={cn(
              "w-1 self-stretch rounded-full flex-shrink-0",
              item.category === "veg" && "bg-[oklch(var(--category-veg))]",
              item.category === "nonveg" &&
                "bg-[oklch(var(--category-nonveg))]",
              item.category === "drinks" &&
                "bg-[oklch(var(--category-drinks))]",
              item.category === "snacks" &&
                "bg-[oklch(var(--category-snacks))]",
            )}
            aria-hidden
          />

          {/* Middle: Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-foreground text-sm leading-tight truncate">
                    {item.name}
                  </span>
                  {item.isQuickOrder && (
                    <Star
                      size={12}
                      className="text-[oklch(var(--category-snacks))] fill-[oklch(var(--category-snacks))] flex-shrink-0"
                      aria-label="Quick order"
                    />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <CategoryBadge category={item.category} />
                  {!item.isAvailable && (
                    <Badge variant="secondary" className="text-xs py-0">
                      Unavailable
                    </Badge>
                  )}
                  {isOutOfStock && (
                    <Badge
                      variant="destructive"
                      className="text-xs py-0 gap-1"
                      data-ocid={`restaurant.menu.out_of_stock.${index}`}
                    >
                      <Package size={9} />
                      Out of Stock
                    </Badge>
                  )}
                  {isLowStock && (
                    <Badge
                      className="text-xs py-0 gap-1 bg-amber-100 text-amber-800 border-amber-300"
                      data-ocid={`restaurant.menu.low_stock.${index}`}
                    >
                      <AlertTriangle size={9} />
                      Low Stock
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              {isOwnerOrManager && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    data-ocid={`restaurant.menu.edit_button.${index}`}
                    onClick={() => onEdit(item)}
                    aria-label={`Edit ${item.name}`}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    data-ocid={`restaurant.menu.delete_button.${index}`}
                    onClick={() => onDeleteRequest(item.id)}
                    aria-label={`Delete ${item.name}`}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="mt-2 flex items-center gap-3 text-sm flex-wrap">
              <span className="font-bold text-foreground">₹{item.price}</span>
              {item.halfPrice && item.halfPrice > 0 && (
                <span className="text-muted-foreground text-xs">
                  Half&nbsp;₹{item.halfPrice} / Full&nbsp;₹{item.price}
                </span>
              )}
            </div>

            {/* Inventory link indicator */}
            {item.inventoryProductId && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Link2 size={10} className="text-primary/60 flex-shrink-0" />
                <span className="truncate">
                  {item.inventoryProductName ?? "Linked to inventory"}
                </span>
                {stockQty !== null && (
                  <span
                    className={cn(
                      "ml-auto font-medium flex-shrink-0",
                      isOutOfStock
                        ? "text-destructive"
                        : isLowStock
                          ? "text-amber-600"
                          : "text-foreground",
                    )}
                    data-ocid={`restaurant.menu.stock_count.${index}`}
                  >
                    Stock: {stockQty}
                  </span>
                )}
              </div>
            )}

            {item.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {item.description}
              </p>
            )}

            {/* Toggle row */}
            {isOwnerOrManager && (
              <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-border">
                <div className="flex items-center gap-1.5">
                  <Switch
                    id={`available-${item.id}`}
                    data-ocid={`restaurant.menu.available.switch.${index}`}
                    checked={item.isAvailable}
                    onCheckedChange={() => onToggleAvailable(item.id)}
                    className="scale-75 origin-left"
                  />
                  <label
                    htmlFor={`available-${item.id}`}
                    className="text-xs text-muted-foreground cursor-pointer"
                  >
                    Available
                  </label>
                </div>
                <div className="flex items-center gap-1.5">
                  <Switch
                    id={`quickorder-${item.id}`}
                    data-ocid={`restaurant.menu.quick_order.switch.${index}`}
                    checked={item.isQuickOrder}
                    onCheckedChange={() => onToggleQuickOrder(item.id)}
                    className="scale-75 origin-left"
                  />
                  <label
                    htmlFor={`quickorder-${item.id}`}
                    className="text-xs text-muted-foreground cursor-pointer"
                  >
                    Quick Order
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Form types ───────────────────────────────────────────────────────────────

type FormState = {
  name: string;
  category: MenuCategory;
  price: number;
  halfPrice: number;
  halfFullEnabled: boolean;
  isAvailable: boolean;
  isQuickOrder: boolean;
  description: string;
  inventoryProductId: string;
  inventoryProductName: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  category: "veg",
  price: 0,
  halfPrice: 0,
  halfFullEnabled: false,
  isAvailable: true,
  isQuickOrder: false,
  description: "",
  inventoryProductId: "",
  inventoryProductName: "",
};

function genId() {
  return `menu_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Inventory product search combobox ────────────────────────────────────────

function InventoryProductSearch({
  value,
  valueName,
  onChange,
}: {
  value: string;
  valueName: string;
  onChange: (id: string, name: string) => void;
}) {
  const { products, getProductStock } = useStore();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return products.slice(0, 12);
    const q = query.toLowerCase();
    return products
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 12);
  }, [products, query]);

  const handleClear = () => {
    onChange("", "");
    setQuery("");
  };

  return (
    <div className="space-y-1.5 relative">
      <Label className="flex items-center gap-1.5 text-sm">
        <Link2 size={13} className="text-primary/70" />
        Link to Inventory Product{" "}
        <span className="text-muted-foreground font-normal">(optional)</span>
      </Label>
      <p className="text-xs text-muted-foreground -mt-0.5">
        When an order is billed, stock will auto-deduct (Full = 1 unit, Half =
        0.5 units)
      </p>

      {value ? (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
          <Package size={14} className="text-primary flex-shrink-0" />
          <span className="text-sm font-medium flex-1 truncate">
            {valueName}
          </span>
          <span className="text-xs text-muted-foreground">
            Stock: {getProductStock(value)}
          </span>
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
            aria-label="Remove inventory link"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            data-ocid="restaurant.menu.form_inventory_search.input"
            placeholder="Search products by name..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            className="pl-9 text-sm"
          />
          {open && filtered.length > 0 && (
            <div className="absolute z-20 top-full mt-1 w-full bg-popover border border-border rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
              {filtered.map((p) => {
                const stock = getProductStock(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onMouseDown={() => {
                      onChange(p.id, p.name);
                      setQuery("");
                      setOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 hover:bg-muted transition-colors flex items-center justify-between gap-2"
                  >
                    <span className="text-sm text-foreground truncate">
                      {p.name}
                    </span>
                    <span
                      className={cn(
                        "text-xs flex-shrink-0",
                        stock <= 0
                          ? "text-destructive"
                          : stock <= 5
                            ? "text-amber-600"
                            : "text-muted-foreground",
                      )}
                    >
                      {stock} in stock
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {open && filtered.length === 0 && query.trim() && (
            <div className="absolute z-20 top-full mt-1 w-full bg-popover border border-border rounded-lg shadow-sm p-3 text-center">
              <p className="text-xs text-muted-foreground">
                No products found for "{query}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function RestaurantMenuPage() {
  const { shopId } = useStore();
  const { getProductStock } = useStore();
  const { currentUser } = useAuth();
  const { menuItems, setMenuItems } = useRestaurantData(shopId);

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<MenuCategory | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isOwnerOrManager =
    currentUser?.role === "owner" || currentUser?.role === "manager";

  // ── Filtered + grouped ─────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return menuItems.filter((item) => {
      const matchSearch = !q || item.name.toLowerCase().includes(q);
      const matchCat = filterCat === "all" || item.category === filterCat;
      return matchSearch && matchCat;
    });
  }, [menuItems, search, filterCat]);

  const grouped = useMemo(() => {
    const map = new Map<MenuCategory, MenuItem[]>();
    for (const cat of CATEGORY_ORDER) map.set(cat, []);
    for (const item of filtered) {
      map.get(item.category)?.push(item);
    }
    return map;
  }, [filtered]);

  const totalItems = menuItems.length;
  const availableItems = menuItems.filter((i) => i.isAvailable).length;
  const quickOrderItems = menuItems.filter((i) => i.isQuickOrder).length;

  // ── Dialog helpers ──────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      category: item.category,
      price: item.price,
      halfPrice: item.halfPrice ?? 0,
      halfFullEnabled: !!(item.halfPrice && item.halfPrice > 0),
      isAvailable: item.isAvailable,
      isQuickOrder: item.isQuickOrder,
      description: item.description ?? "",
      inventoryProductId: item.inventoryProductId ?? "",
      inventoryProductName: item.inventoryProductName ?? "",
    });
    setDialogOpen(true);
  };

  // ── Mutations ──────────────────────────────────────────────────────────────

  const handleSave = useCallback(() => {
    if (!form.name.trim()) {
      toast.error("Item name is required");
      return;
    }
    if (form.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }
    if (form.halfFullEnabled && form.halfPrice <= 0) {
      toast.error(
        "Half price must be greater than 0 when half/full is enabled",
      );
      return;
    }
    const now = new Date().toISOString();
    const patch: Partial<MenuItem> = {
      name: form.name.trim(),
      category: form.category,
      price: form.price,
      halfPrice:
        form.halfFullEnabled && form.halfPrice > 0 ? form.halfPrice : undefined,
      isAvailable: form.isAvailable,
      isQuickOrder: form.isQuickOrder,
      description: form.description.trim() || undefined,
      inventoryProductId: form.inventoryProductId || undefined,
      inventoryProductName: form.inventoryProductName || undefined,
    };

    if (editingId) {
      setMenuItems(
        menuItems.map((item) =>
          item.id === editingId ? { ...item, ...patch, updatedAt: now } : item,
        ),
      );
      toast.success("Menu item updated");
    } else {
      const newItem: MenuItem = {
        ...patch,
        id: genId(),
        shopId,
        name: patch.name!,
        category: patch.category!,
        price: patch.price!,
        isAvailable: patch.isAvailable!,
        isQuickOrder: patch.isQuickOrder!,
        createdAt: now,
        updatedAt: now,
      };
      setMenuItems([...menuItems, newItem]);
      toast.success("Menu item added");
    }
    setDialogOpen(false);
  }, [form, editingId, menuItems, setMenuItems, shopId]);

  const handleDelete = (id: string) => {
    setMenuItems(menuItems.filter((i) => i.id !== id));
    setDeleteId(null);
    toast.success("Item removed from menu");
  };

  const toggleAvailable = (id: string) => {
    const now = new Date().toISOString();
    setMenuItems(
      menuItems.map((item) =>
        item.id === id
          ? { ...item, isAvailable: !item.isAvailable, updatedAt: now }
          : item,
      ),
    );
  };

  const toggleQuickOrder = (id: string) => {
    const now = new Date().toISOString();
    setMenuItems(
      menuItems.map((item) =>
        item.id === id
          ? { ...item, isQuickOrder: !item.isQuickOrder, updatedAt: now }
          : item,
      ),
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-6 space-y-5" data-ocid="restaurant.menu.page">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Utensils className="text-primary" size={22} aria-hidden />
            Menu Management
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {totalItems} items &middot; {availableItems} available &middot;{" "}
            {quickOrderItems} quick order
          </p>
        </div>
        {isOwnerOrManager && (
          <Button
            data-ocid="restaurant.menu.add_button"
            onClick={openAdd}
            className="gap-2"
          >
            <Plus size={16} aria-hidden /> Add Item
          </Button>
        )}
      </div>

      {/* Summary chips */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORY_ORDER.map((cat) => {
          const count = menuItems.filter((i) => i.category === cat).length;
          const cfg = CATEGORY_CONFIG[cat];
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCat(filterCat === cat ? "all" : cat)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                filterCat === cat
                  ? `${cfg.badgeCls} ring-2 ring-offset-1 ring-current`
                  : "bg-muted text-muted-foreground border-border hover:bg-muted/70",
              )}
              data-ocid={`restaurant.menu.filter.${cat}.tab`}
            >
              <cfg.icon size={11} aria-hidden />
              {cfg.label}
              <span className="ml-0.5 opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          data-ocid="restaurant.menu.search_input"
          placeholder="Search menu items by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          aria-label="Search menu items"
        />
      </div>

      {/* Menu Items — grouped by category */}
      {filtered.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="restaurant.menu.empty_state"
        >
          <ChefHat size={40} className="mx-auto mb-3 opacity-25" aria-hidden />
          <p className="font-semibold text-base">No menu items found</p>
          <p className="text-sm mt-1">
            {search || filterCat !== "all"
              ? "Try clearing your search or filter"
              : "Add your first menu item to get started"}
          </p>
          {isOwnerOrManager && !search && filterCat === "all" && (
            <Button className="mt-4 gap-2" onClick={openAdd}>
              <Plus size={16} aria-hidden /> Add First Item
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {CATEGORY_ORDER.map((cat) => {
            const items = grouped.get(cat) ?? [];
            if (items.length === 0) return null;
            const cfg = CATEGORY_CONFIG[cat];
            return (
              <section key={cat} data-ocid={`restaurant.menu.section.${cat}`}>
                {/* Section header */}
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border mb-3",
                    cfg.sectionBg,
                  )}
                >
                  <cfg.icon
                    size={16}
                    aria-hidden
                    className={cn(
                      cat === "veg" && "text-[oklch(var(--category-veg))]",
                      cat === "nonveg" &&
                        "text-[oklch(var(--category-nonveg))]",
                      cat === "drinks" &&
                        "text-[oklch(var(--category-drinks))]",
                      cat === "snacks" &&
                        "text-[oklch(var(--category-snacks))]",
                    )}
                  />
                  <span className="font-bold text-foreground text-sm">
                    {cfg.label}
                  </span>
                  <Badge variant="secondary" className="ml-auto text-xs py-0">
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </Badge>
                </div>

                {/* Items grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((item) => {
                    const absIdx = filtered.indexOf(item) + 1;
                    const stockQty = item.inventoryProductId
                      ? getProductStock(item.inventoryProductId)
                      : null;
                    return (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        index={absIdx}
                        stockQty={stockQty}
                        isOwnerOrManager={isOwnerOrManager}
                        onEdit={openEdit}
                        onDeleteRequest={setDeleteId}
                        onToggleAvailable={toggleAvailable}
                        onToggleQuickOrder={toggleQuickOrder}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Dialog ───────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          data-ocid="restaurant.menu.dialog"
          className="max-w-md max-h-[92vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ChefHat size={18} aria-hidden className="text-primary" />
              {editingId ? "Edit Menu Item" : "Add Menu Item"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="menu-name">Item Name *</Label>
              <Input
                id="menu-name"
                data-ocid="restaurant.menu.name.input"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Paneer Butter Masala"
                autoFocus
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORY_ORDER.map((cat) => {
                  const cfg = CATEGORY_CONFIG[cat];
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, category: cat }))}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                        form.category === cat
                          ? `${cfg.badgeCls} ring-2 ring-offset-1 ring-current`
                          : "bg-muted text-muted-foreground border-border hover:bg-muted/70",
                      )}
                      data-ocid={`restaurant.menu.form_category.${cat}`}
                    >
                      <cfg.icon size={11} aria-hidden />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Half/Full toggle */}
            <div className="flex items-center justify-between py-2 px-3 bg-muted/40 rounded-lg border border-border">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">
                  Enable Half / Full Pricing
                </p>
                <p className="text-xs text-muted-foreground">
                  Set separate prices for half and full portions
                </p>
              </div>
              <Switch
                data-ocid="restaurant.menu.form_half_full.switch"
                checked={form.halfFullEnabled}
                onCheckedChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    halfFullEnabled: v,
                    halfPrice: v ? p.halfPrice : 0,
                  }))
                }
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="menu-price">
                  {form.halfFullEnabled ? "Full Price (₹) *" : "Price (₹) *"}
                </Label>
                <Input
                  id="menu-price"
                  data-ocid="restaurant.menu.price.input"
                  type="number"
                  min={0}
                  value={form.price || ""}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      price: Number(e.target.value) || 0,
                    }))
                  }
                  placeholder="0"
                />
              </div>
              {form.halfFullEnabled && (
                <div className="space-y-1.5">
                  <Label htmlFor="menu-half-price">Half Price (₹) *</Label>
                  <Input
                    id="menu-half-price"
                    data-ocid="restaurant.menu.half_price.input"
                    type="number"
                    min={0}
                    value={form.halfPrice || ""}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        halfPrice: Number(e.target.value) || 0,
                      }))
                    }
                    placeholder="0"
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="menu-desc">Description (optional)</Label>
              <Input
                id="menu-desc"
                data-ocid="restaurant.menu.description.input"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Short description..."
              />
            </div>

            {/* Inventory link */}
            <div className="border border-border/60 rounded-lg p-3 bg-muted/20">
              <InventoryProductSearch
                value={form.inventoryProductId}
                valueName={form.inventoryProductName}
                onChange={(id, name) =>
                  setForm((p) => ({
                    ...p,
                    inventoryProductId: id,
                    inventoryProductName: name,
                  }))
                }
              />
            </div>

            {/* Available toggle */}
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Available</p>
                <p className="text-xs text-muted-foreground">
                  Item visible for ordering
                </p>
              </div>
              <Switch
                data-ocid="restaurant.menu.form_available.switch"
                checked={form.isAvailable}
                onCheckedChange={(v) =>
                  setForm((p) => ({ ...p, isAvailable: v }))
                }
              />
            </div>

            {/* Quick Order toggle */}
            <div className="flex items-center justify-between py-2 border-t border-border">
              <div className="space-y-0.5">
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <Star
                    size={14}
                    className="text-[oklch(var(--category-snacks))]"
                    aria-hidden
                  />
                  Quick Order
                </p>
                <p className="text-xs text-muted-foreground">
                  Pin to fast-pick row on order screen
                </p>
              </div>
              <Switch
                data-ocid="restaurant.menu.form_quick_order.switch"
                checked={form.isQuickOrder}
                onCheckedChange={(v) =>
                  setForm((p) => ({ ...p, isQuickOrder: v }))
                }
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button
                data-ocid="restaurant.menu.cancel_button"
                variant="outline"
                className="flex-1"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="restaurant.menu.submit_button"
                className="flex-1"
                onClick={handleSave}
              >
                {editingId ? "Save Changes" : "Add Item"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ──────────────────────────────────────────────── */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent
          data-ocid="restaurant.menu.delete.dialog"
          className="max-w-sm"
        >
          <DialogHeader>
            <DialogTitle>Remove Menu Item?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This item will be permanently removed from the menu. This action
            cannot be undone.
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              data-ocid="restaurant.menu.delete.cancel_button"
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="restaurant.menu.delete.confirm_button"
              variant="destructive"
              className="flex-1"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Remove Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
