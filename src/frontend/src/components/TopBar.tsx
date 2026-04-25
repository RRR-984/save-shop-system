import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bell,
  CheckCircle,
  Home,
  Loader2,
  Moon,
  Pencil,
  Plus,
  Search,
  Sun,
  Trash2,
  WifiOff,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useStore } from "../context/StoreContext";
import { useTheme } from "../context/ThemeContext";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import type { AutoModeType, ShopMeta } from "../types/store";

interface TopBarProps {
  title: string;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  goHome?: () => void;
  isHome?: boolean;
}

// ─── Auto Mode Switcher ────────────────────────────────────────────────────────
const AUTO_MODE_OPTIONS: {
  value: AutoModeType;
  label: string;
  shortLabel: string;
  emoji: string;
  desc: string;
  activeClass: string;
}[] = [
  {
    value: "simple",
    label: "Simple",
    shortLabel: "S",
    emoji: "🟢",
    desc: "Stock, Billing, Payment",
    activeClass:
      "bg-green-500 text-white border-green-500 shadow-sm shadow-green-200 dark:shadow-green-900/30",
  },
  {
    value: "smart",
    label: "Smart",
    shortLabel: "Sm",
    emoji: "🟡",
    desc: "Inventory, Reports, Credit",
    activeClass:
      "bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-200 dark:shadow-amber-900/30",
  },
  {
    value: "pro",
    label: "Pro",
    shortLabel: "P",
    emoji: "🔴",
    desc: "All features",
    activeClass:
      "bg-red-500 text-white border-red-500 shadow-sm shadow-red-200 dark:shadow-red-900/30",
  },
];

/** Full-size mode switcher — for tablet+desktop */
function AutoModeSwitcher({
  mode,
  onChange,
}: {
  mode: AutoModeType;
  onChange: (m: AutoModeType) => void;
}) {
  return (
    <div
      className="flex items-center rounded-lg border border-border bg-secondary p-0.5 gap-0.5 flex-shrink-0"
      data-ocid="topbar.auto_mode_switcher"
      role="toolbar"
      aria-label="UI Mode switcher"
    >
      {AUTO_MODE_OPTIONS.map((opt) => {
        const isActive = mode === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            data-ocid={`topbar.auto_mode.${opt.value}`}
            onClick={() => onChange(opt.value)}
            title={`${opt.emoji} ${opt.label} Mode — ${opt.desc}`}
            aria-pressed={isActive}
            className={`
              flex items-center gap-1 h-7 px-2 rounded-md text-xs font-semibold
              transition-all duration-200 focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-primary whitespace-nowrap select-none
              ${
                isActive
                  ? opt.activeClass
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }
            `}
          >
            <span className="text-[10px] leading-none">{opt.emoji}</span>
            <span className="leading-none">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Compact mode switcher for mobile — colored dots + single-letter label */
function AutoModeSwitcherCompact({
  mode,
  onChange,
}: {
  mode: AutoModeType;
  onChange: (m: AutoModeType) => void;
}) {
  return (
    <div
      className="flex items-center rounded-md border border-border bg-secondary p-0.5 gap-0.5 flex-shrink-0"
      data-ocid="topbar.auto_mode_switcher_compact"
      role="toolbar"
      aria-label="UI Mode switcher"
    >
      {AUTO_MODE_OPTIONS.map((opt) => {
        const isActive = mode === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            data-ocid={`topbar.auto_mode_compact.${opt.value}`}
            onClick={() => onChange(opt.value)}
            title={`${opt.emoji} ${opt.label} Mode`}
            aria-pressed={isActive}
            className={`
              flex items-center gap-0.5 h-6 px-1.5 rounded text-[11px] font-bold
              transition-all duration-200 focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-primary select-none whitespace-nowrap
              ${
                isActive
                  ? opt.activeClass
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }
            `}
          >
            <span className="text-[9px] leading-none">{opt.emoji}</span>
            <span className="leading-none">{opt.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Shared Shop Form Modal ───────────────────────────────────────────────────
interface ShopFormState {
  name: string;
  address: string;
  city: string;
}

interface ShopModalProps {
  title: string;
  submitLabel: string;
  form: ShopFormState;
  setForm: React.Dispatch<React.SetStateAction<ShopFormState>>;
  saving: boolean;
  onSubmit: () => void;
  onClose: () => void;
  dataOcid: string;
}

function ShopModal({
  title,
  submitLabel,
  form,
  setForm,
  saving,
  onSubmit,
  onClose,
  dataOcid,
}: ShopModalProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      data-ocid={dataOcid}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="presentation"
      />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-base text-foreground">{title}</h3>
          <button
            type="button"
            data-ocid={`${dataOcid}.close_button`}
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="space-y-3 mb-5">
          <div>
            <label
              htmlFor={`${dataOcid}-name`}
              className="block text-xs font-medium text-foreground mb-1"
            >
              Shop Name <span className="text-destructive">*</span>
            </label>
            <Input
              id={`${dataOcid}-name`}
              data-ocid={`${dataOcid}.name_input`}
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Sharma Electronics"
              className="h-9 text-sm"
              autoFocus
            />
          </div>
          <div>
            <label
              htmlFor={`${dataOcid}-address`}
              className="block text-xs font-medium text-foreground mb-1"
            >
              Address
            </label>
            <Input
              id={`${dataOcid}-address`}
              data-ocid={`${dataOcid}.address_input`}
              value={form.address}
              onChange={(e) =>
                setForm((p) => ({ ...p, address: e.target.value }))
              }
              placeholder="Street / Area (optional)"
              className="h-9 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor={`${dataOcid}-city`}
              className="block text-xs font-medium text-foreground mb-1"
            >
              City
            </label>
            <Input
              id={`${dataOcid}-city`}
              data-ocid={`${dataOcid}.city_input`}
              value={form.city}
              onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
              placeholder="City (optional)"
              className="h-9 text-sm"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            data-ocid={`${dataOcid}.cancel_button`}
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-secondary text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            data-ocid={`${dataOcid}.submit_button`}
            onClick={onSubmit}
            disabled={saving || !form.name.trim()}
            className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Shop Chips (inline pills) ────────────────────────────────────────────────
interface ShopChipsProps {
  className?: string;
  language?: "en" | "hi";
}

function ShopChips({ className = "" }: ShopChipsProps) {
  const {
    allShops,
    switchShop,
    createNewShop,
    updateShopDetails,
    deleteShopFromList,
    session,
  } = useAuth();

  const activeId = session?.selectedShopId ?? session?.shopId;
  const [switching, setSwitching] = useState<string | null>(null);

  const [showNewModal, setShowNewModal] = useState(false);
  const [editModal, setEditModal] = useState<ShopMeta | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ShopMeta | null>(null);
  const [form, setForm] = useState<ShopFormState>({
    name: "",
    address: "",
    city: "",
  });
  const [saving, setSaving] = useState(false);

  const pressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [longPressShop, setLongPressShop] = useState<ShopMeta | null>(null);

  const handleSwitch = (shopId: string) => {
    if (shopId === activeId) return;
    setSwitching(shopId);
    switchShop(shopId);
    setTimeout(() => {
      setSwitching(null);
      toast.success("Shop switched");
    }, 50);
  };

  const openNew = () => {
    setForm({ name: "", address: "", city: "" });
    setShowNewModal(true);
  };

  const openEdit = (shop: ShopMeta, e: React.MouseEvent) => {
    e.stopPropagation();
    setLongPressShop(null);
    setForm({ name: shop.name, address: shop.address, city: shop.city });
    setEditModal(shop);
  };

  const openDelete = (shop: ShopMeta, e: React.MouseEvent) => {
    e.stopPropagation();
    setLongPressShop(null);
    setDeleteConfirm(shop);
  };

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const result = await createNewShop(
      form.name.trim(),
      form.address.trim(),
      form.city.trim(),
    );
    setSaving(false);
    if (result.success) {
      setShowNewModal(false);
      toast.success(`"${form.name}" created and switched!`);
    } else {
      toast.error(result.error ?? "Failed to create shop");
    }
  };

  const handleUpdate = async () => {
    if (!editModal || !form.name.trim()) return;
    setSaving(true);
    const result = await updateShopDetails(
      editModal.id,
      form.name.trim(),
      form.address.trim(),
      form.city.trim(),
    );
    setSaving(false);
    if (result.success) {
      setEditModal(null);
      toast.success("Shop updated");
    } else {
      toast.error(result.error ?? "Failed to update");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.id === activeId) {
      toast.error("Switch to another shop before deleting this one");
      setDeleteConfirm(null);
      return;
    }
    setSaving(true);
    const result = await deleteShopFromList(deleteConfirm.id);
    setSaving(false);
    if (result.success) {
      setDeleteConfirm(null);
      toast.success("Shop archived");
    } else {
      toast.error(result.error ?? "Failed to archive");
    }
  };

  const truncName = (name: string, max = 11) =>
    name.length > max ? `${name.slice(0, max - 1)}…` : name;

  return (
    <>
      <div
        className={`flex items-center gap-1.5 min-w-0 ${className}`}
        data-ocid="topbar.shop_chips_row"
      >
        <div
          className="flex items-center gap-1.5 overflow-x-auto flex-nowrap min-w-0 flex-1"
          style={
            {
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            } as React.CSSProperties
          }
        >
          {allShops.map((shop, idx) => {
            const isActive = shop.id === activeId;
            const isLoading = switching === shop.id;
            const isLongPressed = longPressShop?.id === shop.id;

            return (
              <div key={shop.id} className="relative flex-shrink-0 group">
                <button
                  type="button"
                  data-ocid={`topbar.shop_chip.${idx + 1}`}
                  disabled={isLoading}
                  onClick={() => handleSwitch(shop.id)}
                  onMouseDown={() => {
                    pressTimer.current = setTimeout(
                      () => setLongPressShop(shop),
                      600,
                    );
                  }}
                  onMouseUp={() => {
                    if (pressTimer.current) clearTimeout(pressTimer.current);
                  }}
                  onMouseLeave={() => {
                    if (pressTimer.current) clearTimeout(pressTimer.current);
                  }}
                  onTouchStart={() => {
                    pressTimer.current = setTimeout(
                      () => setLongPressShop(shop),
                      600,
                    );
                  }}
                  onTouchEnd={() => {
                    if (pressTimer.current) clearTimeout(pressTimer.current);
                  }}
                  title={shop.name + (shop.city ? ` · ${shop.city}` : "")}
                  aria-pressed={isActive}
                  className={`
                    flex items-center gap-1 h-7 px-2.5 rounded-full text-xs font-semibold
                    transition-all duration-150 whitespace-nowrap select-none
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                    ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm border border-blue-600"
                        : "bg-transparent border border-border text-foreground hover:border-blue-400 hover:text-blue-600 dark:border-border dark:text-foreground dark:hover:border-blue-400 dark:hover:text-blue-400"
                    }
                    ${isLoading ? "opacity-60" : ""}
                  `}
                >
                  {isLoading && (
                    <Loader2 size={10} className="animate-spin flex-shrink-0" />
                  )}
                  {truncName(shop.name)}
                </button>

                {isLongPressed && (
                  <div
                    className="absolute top-8 left-0 z-50 flex items-center gap-1 bg-card border border-border rounded-lg shadow-lg p-1"
                    onMouseLeave={() => setLongPressShop(null)}
                  >
                    <button
                      type="button"
                      data-ocid={`topbar.shop_chip_edit.${idx + 1}`}
                      onClick={(e) => openEdit(shop, e)}
                      className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Edit shop"
                    >
                      <Pencil size={12} />
                    </button>
                    {!isActive && (
                      <button
                        type="button"
                        data-ocid={`topbar.shop_chip_delete.${idx + 1}`}
                        onClick={(e) => openDelete(shop, e)}
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="Archive shop"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                )}

                <div className="absolute top-8 left-0 z-50 flex items-center gap-1 bg-card border border-border rounded-lg shadow-lg p-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-150">
                  <button
                    type="button"
                    data-ocid={`topbar.shop_chip_edit_hover.${idx + 1}`}
                    onClick={(e) => openEdit(shop, e)}
                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Edit shop"
                  >
                    <Pencil size={12} />
                  </button>
                  {!isActive && (
                    <button
                      type="button"
                      data-ocid={`topbar.shop_chip_delete_hover.${idx + 1}`}
                      onClick={(e) => openDelete(shop, e)}
                      className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title="Archive shop"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          data-ocid="topbar.new_shop_chip"
          onClick={openNew}
          title="Add new shop"
          aria-label="Add new shop"
          className="flex items-center gap-1 h-7 pl-2 pr-2.5 rounded-full border border-dashed border-primary/50 text-primary hover:bg-primary/8 hover:border-primary transition-colors flex-shrink-0 text-xs font-semibold whitespace-nowrap"
        >
          <Plus size={12} />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      {showNewModal && (
        <ShopModal
          title="Create New Shop"
          submitLabel="Create Shop"
          form={form}
          setForm={setForm}
          saving={saving}
          onSubmit={handleCreate}
          onClose={() => setShowNewModal(false)}
          dataOcid="topbar.new_shop_modal"
        />
      )}

      {editModal && (
        <ShopModal
          title="Edit Shop"
          submitLabel="Save Changes"
          form={form}
          setForm={setForm}
          saving={saving}
          onSubmit={handleUpdate}
          onClose={() => setEditModal(null)}
          dataOcid="topbar.edit_shop_modal"
        />
      )}

      {deleteConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          data-ocid="topbar.delete_shop_dialog"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
            onKeyDown={(e) => e.key === "Escape" && setDeleteConfirm(null)}
            role="presentation"
          />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <Trash2 size={18} className="text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">
                  Archive Shop?
                </h3>
                <p className="text-xs text-muted-foreground">
                  "{deleteConfirm.name}"
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
              Are you sure? Data will be <strong>archived, not deleted</strong>.
              You can restore it later.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                data-ocid="topbar.delete_shop_cancel_button"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-secondary text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                data-ocid="topbar.delete_shop_confirm_button"
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Sync Indicator ───────────────────────────────────────────────────────────
function SyncDot({
  isOnline,
  syncStatus,
  isSyncing,
}: {
  isOnline: boolean;
  syncStatus: string;
  isSyncing: boolean;
}) {
  if (!isOnline)
    return (
      <span
        data-ocid="topbar.sync_indicator"
        title="Offline — data saved locally"
        className="flex items-center gap-0.5 text-[10px] font-medium text-red-500 flex-shrink-0"
      >
        <WifiOff size={11} />
        <span className="hidden sm:inline text-[10px]">Offline</span>
      </span>
    );
  if (syncStatus === "syncing" || isSyncing)
    return (
      <span
        data-ocid="topbar.sync_indicator"
        title="Syncing..."
        className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0"
      />
    );
  if (syncStatus === "sync_pending")
    return (
      <span
        data-ocid="topbar.sync_indicator"
        title="Sync pending"
        className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse flex-shrink-0"
      />
    );
  return (
    <span
      data-ocid="topbar.sync_indicator"
      title="All data synced"
      className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0 transition-colors duration-500"
    />
  );
}

// ─── TopBar Inner ─────────────────────────────────────────────────────────────
function TopBarInner({
  title,
  searchValue,
  onSearchChange,
  goHome,
  isHome = false,
}: TopBarProps) {
  const {
    getLowStockProducts,
    getAllCustomerLedgers,
    isSyncing,
    autoMode,
    setAutoMode,
  } = useStore();
  const { currentUser, session, currentShop, allShops } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const { isOnline, syncStatus } = useNetworkStatus();

  const lowStockCount = getLowStockProducts().length;
  const dueCount = getAllCustomerLedgers().filter((l) => l.totalDue > 0).length;
  const role = currentUser?.role ?? "staff";
  const isStaff = role === "staff";

  const totalNotifCount = isStaff ? lowStockCount : lowStockCount + dueCount;

  const initials = (() => {
    const name = currentUser?.name?.trim();
    if (name) {
      const parts = name.split(" ").filter(Boolean);
      if (parts.length >= 2)
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    const mobile = session?.mobile;
    if (mobile) return mobile.slice(-2);
    return "AD";
  })();

  const displayName =
    currentUser?.name || currentShop?.name || session?.mobile || "Admin";

  const roleBadgeClass =
    role === "owner"
      ? "bg-blue-100 text-blue-700 border-blue-200"
      : role === "manager"
        ? "bg-purple-100 text-purple-700 border-purple-200"
        : "bg-muted text-muted-foreground border-border";

  const roleLabel =
    role === "owner" ? "Owner" : role === "manager" ? "Manager" : "Staff";
  const shopName = currentShop?.name ?? "Save Shop";
  const lowStockItems = getLowStockProducts();

  const showShopChips = role === "owner" && allShops.length > 0;
  const manyShops = allShops.length > 2;

  // ── Notification popover (shared between mobile and desktop) ──────────────
  const NotifBell = (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-ocid="topbar.notification_bell"
          className="relative w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          aria-label="Notifications"
        >
          <Bell size={15} />
          {totalNotifCount > 0 && (
            <Badge className="absolute -top-1 -right-1 min-w-[16px] h-4 p-0 px-0.5 text-[9px] flex items-center justify-center bg-destructive text-destructive-foreground border-0">
              {totalNotifCount}
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0 shadow-lg">
        <div className="p-3 border-b border-border flex items-center gap-2">
          <Bell size={13} className="text-primary" />
          <span className="text-sm font-semibold">Notifications</span>
          {totalNotifCount > 0 && (
            <Badge className="bg-red-500 text-white border-0 text-[10px] ml-auto">
              {totalNotifCount}
            </Badge>
          )}
        </div>
        <div className="max-h-64 overflow-y-auto divide-y divide-border">
          {totalNotifCount === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground text-sm">
              <CheckCircle size={20} className="text-green-500" />
              No alerts ✅
            </div>
          ) : (
            <>
              {lowStockItems.length > 0 && (
                <div className="p-3">
                  <p className="text-[11px] font-semibold text-amber-600 uppercase mb-2">
                    Low Stock ({lowStockItems.length})
                  </p>
                  {lowStockItems.slice(0, 5).map((p) => (
                    <div
                      key={p.id}
                      className="flex justify-between text-xs py-0.5"
                    >
                      <span className="text-foreground truncate max-w-[140px]">
                        {p.name}
                      </span>
                      <span className="text-amber-600 font-medium ml-2">
                        {p.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {!isStaff && dueCount > 0 && (
                <div className="p-3">
                  <p className="text-[11px] font-semibold text-red-600 uppercase mb-2">
                    Due Payments ({dueCount})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dueCount} customer(s) have pending dues
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );

  // ── Profile avatar ─────────────────────────────────────────────────────────
  const ProfileAvatar = (
    <div
      className="flex items-center gap-1.5 cursor-default relative flex-shrink-0"
      data-ocid="topbar.profile"
    >
      <div className="relative">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="hidden md:flex flex-col leading-tight">
        <span className="text-xs font-semibold text-foreground truncate max-w-[100px]">
          {displayName}
        </span>
        <span
          className={`text-[10px] font-medium border rounded-full px-1.5 py-0 leading-4 w-fit ${roleBadgeClass}`}
        >
          {roleLabel}
        </span>
      </div>
    </div>
  );

  return (
    <div className="sticky top-0 z-30" data-ocid="topbar.header">
      {/* ════════════════════════════════════════════════════════════════
          MOBILE HEADER (< 768px) — two-row compact layout
          Row 1: [Home/spacer] [Logo+ShopName] [spacer] [Bell] [Avatar]
          Row 2: [SyncDot] [ModeSwitcher] [Lang] [Theme]
          ════════════════════════════════════════════════════════════════ */}
      <header className="md:hidden bg-card border-b border-border shadow-sm">
        {/* Row 1 */}
        <div className="flex items-center gap-2 px-3 py-2 min-w-0">
          {/* Home / back button */}
          {!isHome && goHome ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={goHome}
              data-ocid="topbar.home_button"
              className="flex items-center justify-center text-muted-foreground hover:text-foreground px-2 h-8 -ml-1 flex-shrink-0 w-8"
              aria-label="Go to Home"
            >
              <Home size={17} />
            </Button>
          ) : (
            <div className="w-8 flex-shrink-0" />
          )}

          {/* Logo + shop name */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <img
              src="/assets/fb-logo.jpg"
              alt="FIFO Bridge Logo"
              style={{
                height: "30px",
                width: "auto",
                borderRadius: "5px",
                objectFit: "contain",
                flexShrink: 0,
              }}
            />
            <span className="text-sm font-bold text-foreground truncate min-w-0">
              {shopName}
            </span>
          </div>

          {/* Right cluster: Bell + Profile avatar */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {NotifBell}
            {ProfileAvatar}
          </div>
        </div>

        {/* Row 2 — compact controls strip */}
        <div className="flex items-center gap-2 px-3 py-1.5 border-t border-border/40 bg-card/80">
          {/* Sync dot */}
          <SyncDot
            isOnline={isOnline}
            syncStatus={syncStatus}
            isSyncing={isSyncing}
          />

          {/* Mode switcher (compact) */}
          <AutoModeSwitcherCompact mode={autoMode} onChange={setAutoMode} />

          {/* Language toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            data-ocid="topbar.language_toggle"
            aria-label={
              language === "hi" ? "Switch to English" : "Switch to Hindi"
            }
            title={language === "hi" ? "Switch to English" : "Switch to Hindi"}
            className="h-7 px-2 rounded-md bg-secondary flex items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors text-xs font-bold border border-transparent hover:border-border flex-shrink-0"
          >
            <span className="text-xs leading-none">
              {language === "hi" ? "🇮🇳" : "🇬🇧"}
            </span>
            <span className="text-[11px] leading-none">
              {language === "hi" ? "H" : "E"}
            </span>
          </button>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            data-ocid="topbar.theme_toggle"
            aria-label={
              isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
            title={isDarkMode ? "Light Mode" : "Dark Mode"}
            className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          >
            {isDarkMode ? <Sun size={13} /> : <Moon size={13} />}
          </button>

          {/* Search — if provided, fill remaining space */}
          {onSearchChange && (
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={13}
                />
                <Input
                  data-ocid="topbar.search_input"
                  placeholder="Search..."
                  className="pl-8 h-7 text-xs bg-secondary border-0"
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Row 3 (optional) — shop chips on mobile when owner has shops */}
        {showShopChips && (
          <div
            className="px-3 py-1.5 border-t border-border/40 bg-card/60"
            data-ocid="topbar.shop_chips_subbar"
          >
            <ShopChips className="gap-1" language={language} />
          </div>
        )}
      </header>

      {/* ════════════════════════════════════════════════════════════════
          TABLET HEADER (768px – 1023px) — single compact row
          ════════════════════════════════════════════════════════════════ */}
      <header className="hidden md:flex lg:hidden bg-card border-b border-border px-3 py-2 items-center gap-2 shadow-sm">
        {/* Home / back */}
        {!isHome && goHome ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={goHome}
            data-ocid="topbar.home_button"
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground px-2 h-8 -ml-1 flex-shrink-0"
            aria-label="Go to Home"
          >
            <Home size={17} />
            <span className="text-sm font-medium">Home</span>
          </Button>
        ) : (
          <div className="w-8 flex-shrink-0" />
        )}

        {/* Logo + shop name */}
        <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
          <img
            src="/assets/fb-logo.jpg"
            alt="FIFO Bridge Logo"
            style={{
              height: "32px",
              width: "auto",
              borderRadius: "6px",
              objectFit: "contain",
              flexShrink: 0,
            }}
          />
          <span className="text-sm font-bold text-foreground truncate max-w-[110px]">
            {shopName}
          </span>
        </div>

        {/* Shop chips — if owner */}
        {showShopChips && (
          <div className="flex-shrink-0 min-w-0 max-w-[200px]">
            <ShopChips language={language} />
          </div>
        )}

        {/* Search */}
        {onSearchChange && (
          <div className="flex-1 max-w-xs min-w-0">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={13}
              />
              <Input
                data-ocid="topbar.search_input"
                placeholder="Search..."
                className="pl-8 h-8 text-sm bg-secondary border-0"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex-1" />

        {/* Right group — compact for tablet */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <SyncDot
            isOnline={isOnline}
            syncStatus={syncStatus}
            isSyncing={isSyncing}
          />

          {/* Compact mode switcher on tablet */}
          <AutoModeSwitcherCompact mode={autoMode} onChange={setAutoMode} />

          <button
            type="button"
            onClick={toggleLanguage}
            data-ocid="topbar.language_toggle"
            aria-label={
              language === "hi" ? "Switch to English" : "Switch to Hindi"
            }
            className="h-8 px-2 rounded-lg bg-secondary flex items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-xs font-bold border border-transparent hover:border-border"
          >
            <span className="text-sm leading-none">
              {language === "hi" ? "🇮🇳" : "🇬🇧"}
            </span>
            <span className="leading-none">
              {language === "hi" ? "H" : "E"}
            </span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            data-ocid="topbar.theme_toggle"
            aria-label={
              isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
            className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {NotifBell}
          {ProfileAvatar}
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP HEADER (≥ 1024px) — full layout unchanged
          ════════════════════════════════════════════════════════════════ */}
      <header
        className="hidden lg:flex bg-card border-b border-border px-5 py-2.5 items-center gap-2 shadow-sm"
        data-ocid="topbar.header_desktop"
      >
        {/* Home button */}
        {!isHome && goHome ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={goHome}
            data-ocid="topbar.home_button"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground px-2 h-8 -ml-1 flex-shrink-0"
            aria-label="Go to Home"
          >
            <Home size={17} />
            <span className="text-sm font-medium">Home</span>
          </Button>
        ) : (
          <div className="w-2 flex-shrink-0" />
        )}

        {/* LEFT: Logo + Shop Name */}
        <div className="flex items-center gap-2 min-w-0">
          <img
            src="/assets/fb-logo.jpg"
            alt="FIFO Bridge Logo"
            style={{
              height: "36px",
              width: "auto",
              borderRadius: "6px",
              objectFit: "contain",
              flexShrink: 0,
            }}
          />
          <div className="flex flex-col leading-tight min-w-0">
            <span className="text-base font-bold text-foreground truncate max-w-[120px] xl:max-w-[160px]">
              {shopName}
            </span>
            {title !== shopName && (
              <span className="text-[11px] text-muted-foreground truncate">
                {title}
              </span>
            )}
          </div>
        </div>

        {/* Shop chips */}
        {showShopChips && (
          <div
            className={`flex-shrink-0 min-w-0 ${manyShops ? "max-w-[280px] xl:max-w-[400px]" : "max-w-[320px]"}`}
          >
            <ShopChips language={language} />
          </div>
        )}

        {/* Search */}
        {onSearchChange && (
          <div className="flex-1 max-w-xs">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={15}
              />
              <Input
                data-ocid="topbar.search_input"
                placeholder="Search..."
                className="pl-9 h-8 text-sm bg-secondary border-0"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex-1" />

        {/* RIGHT: full desktop controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <SyncDot
            isOnline={isOnline}
            syncStatus={syncStatus}
            isSyncing={isSyncing}
          />

          <AutoModeSwitcher mode={autoMode} onChange={setAutoMode} />

          <button
            type="button"
            onClick={toggleLanguage}
            data-ocid="topbar.language_toggle"
            aria-label={
              language === "hi" ? "Switch to English" : "Switch to Hindi"
            }
            title={language === "hi" ? "Switch to English" : "Switch to Hindi"}
            className="relative h-8 px-2 rounded-lg bg-secondary flex items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-xs font-bold border border-transparent hover:border-border"
          >
            <span className="text-sm leading-none">
              {language === "hi" ? "🇮🇳" : "🇬🇧"}
            </span>
            <span className="leading-none">
              {language === "hi" ? "H" : "E"}
            </span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            data-ocid="topbar.theme_toggle"
            aria-label={
              isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
            title={isDarkMode ? "Light Mode" : "Dark Mode"}
            className="relative w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {NotifBell}

          {/* Profile */}
          <div
            className="flex items-center gap-1.5 cursor-default relative"
            data-ocid="topbar.profile"
          >
            <div className="relative">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold text-foreground truncate max-w-[100px]">
                {displayName}
              </span>
              <span
                className={`text-[10px] font-medium border rounded-full px-1.5 py-0 leading-4 w-fit ${roleBadgeClass}`}
              >
                {roleLabel}
              </span>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export const TopBar = React.memo(TopBarInner);
