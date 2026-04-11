import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  AlertCircle,
  Bell,
  Check,
  Download,
  Eye,
  EyeOff,
  Info,
  Lock,
  Package,
  Pencil,
  Plus,
  Settings,
  Shield,
  ShieldAlert,
  SlidersHorizontal,
  Store,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import type { AppConfig, FeatureFlags } from "../types/store";
import { STORAGE_KEYS, saveData } from "../utils/localStorage";

interface FeatureItem {
  key: keyof FeatureFlags;
  label: string;
  description: string;
  icon: string;
}

const FEATURE_LIST: FeatureItem[] = [
  {
    key: "expiry",
    label: "Expiry Date Tracking",
    description: "Products ke expiry dates track karo aur alerts pao",
    icon: "📅",
  },
  {
    key: "deadStock",
    label: "Dead Stock Detection",
    description: "Jo products nahin bik rahe unhe identify karo",
    icon: "📦",
  },
  {
    key: "rental",
    label: "Rental / Lending Module",
    description: "Kiraye ya udhaari wali items ka hisaab rakhna",
    icon: "🔑",
  },
  {
    key: "service",
    label: "Service / Repair Orders",
    description: "Service aur repair orders manage karo",
    icon: "🔧",
  },
  {
    key: "staff",
    label: "Staff Management",
    description: "Staff performance, credit aur bonus track karo",
    icon: "👥",
  },
  {
    key: "credit",
    label: "Credit / Udhaar Tracking",
    description: "Customer credit aur due payments ka hisaab rakhna",
    icon: "💳",
  },
  {
    key: "discount",
    label: "Discount & Pricing Controls",
    description: "Discount rules, min price lock aur staff pricing controls",
    icon: "🏷️",
  },
];

const DEAD_STOCK_OPTIONS = [
  { label: "3 Months", value: 90 },
  { label: "6 Months", value: 180 },
  { label: "12 Months", value: 365 },
  { label: "Custom Days", value: -1 },
];

export function SettingsPage() {
  const { currentShop, currentUser } = useAuth();
  const isOwner =
    currentUser?.role === "owner" || currentUser?.isOwner === true;
  const {
    appConfig,
    featureFlags,
    saveAppConfig,
    setFeatureFlag,
    updateShopSettings,
    shopUnits,
    addShopUnit,
    deleteShopUnit,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    // data for export
    products,
    customers,
    vendors,
    invoices,
    batches,
    payments,
    returns,
    purchaseOrders,
    customerOrders,
    vendorRateHistory,
    shopId,
  } = useStore();

  const importFileRef = useRef<HTMLInputElement>(null);
  const [importConfirming, setImportConfirming] = useState(false);
  const [pendingImport, setPendingImport] = useState<Record<
    string,
    unknown
  > | null>(null);

  // ── Export all data as JSON ──────────────────────────────────────────────────
  function handleExport() {
    const backup = {
      exportedAt: new Date().toISOString(),
      shopId,
      appVersion: "1.0",
      products,
      customers,
      vendors,
      sales: invoices,
      batches,
      payments,
      returns,
      purchaseOrders,
      customerOrders,
      vendorRateHistory,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const date = new Date().toISOString().slice(0, 10);
    a.download = `saveshop_backup_${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded");
  }

  // ── Import data from JSON file ───────────────────────────────────────────────
  function handleImportFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as Record<
          string,
          unknown
        >;
        const hasData =
          parsed.products || parsed.customers || parsed.vendors || parsed.sales;
        if (!hasData) {
          toast.error("Invalid backup file");
          return;
        }
        setPendingImport(parsed);
        setImportConfirming(true);
      } catch {
        toast.error("Invalid backup file");
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be re-imported
    e.target.value = "";
  }

  function handleImportConfirm() {
    if (!pendingImport) return;
    // Cache all imported arrays into localStorage so the app picks them up on next load
    const p = pendingImport;
    if (Array.isArray(p.products)) saveData(STORAGE_KEYS.products, p.products);
    if (Array.isArray(p.customers))
      saveData(STORAGE_KEYS.customers, p.customers);
    if (Array.isArray(p.vendors)) saveData(STORAGE_KEYS.vendors, p.vendors);
    if (Array.isArray(p.sales)) saveData(STORAGE_KEYS.sales, p.sales);
    if (Array.isArray(p.batches)) saveData(STORAGE_KEYS.batches, p.batches);
    if (Array.isArray(p.payments)) saveData(STORAGE_KEYS.payments, p.payments);
    if (Array.isArray(p.returns)) saveData(STORAGE_KEYS.returns, p.returns);
    if (Array.isArray(p.purchaseOrders))
      saveData(STORAGE_KEYS.purchaseOrders, p.purchaseOrders);
    if (Array.isArray(p.customerOrders))
      saveData(STORAGE_KEYS.customerOrders, p.customerOrders);
    if (Array.isArray(p.vendorRateHistory))
      saveData(STORAGE_KEYS.vendorRateHistory, p.vendorRateHistory);

    setImportConfirming(false);
    setPendingImport(null);
    toast.success("Data restore ho gaya — page reload karein");
    setTimeout(() => window.location.reload(), 1500);
  }

  function handleImportCancel() {
    setImportConfirming(false);
    setPendingImport(null);
  }

  // Units state
  const [newUnit, setNewUnit] = useState("");

  // Categories state
  const [newCategory, setNewCategory] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");

  // Custom dead stock days
  const [customDays, setCustomDays] = useState(
    String(appConfig.deadStockCustomDays ?? 30),
  );

  // Low Price Selling Control state
  const [pinValue, setPinValue] = useState(appConfig.ownerPin ?? "");
  const [showPin, setShowPin] = useState(false);
  const [pinSaving, setPinSaving] = useState(false);

  const isCustomDeadStock = !DEAD_STOCK_OPTIONS.slice(0, 3).find(
    (o) => o.value === appConfig.deadStockThresholdDays,
  );

  async function handleFeatureToggle(key: keyof FeatureFlags, value: boolean) {
    await setFeatureFlag(key, value);
    toast.success(
      `${FEATURE_LIST.find((f) => f.key === key)?.label} ${
        value ? "enabled" : "disabled"
      }`,
    );
  }

  async function handleMixedUnitsToggle(value: boolean) {
    await saveAppConfig({ allowMixedUnits: value } as Partial<AppConfig>);
    updateShopSettings({ allowMixedUnits: value });
    toast.success(`Mixed Units Mode ${value ? "enabled" : "disabled"}`);
  }

  async function handleDeadStockPeriod(value: number) {
    if (value === -1) {
      // custom — don't save yet, wait for custom input
      return;
    }
    await saveAppConfig({
      deadStockThresholdDays: value,
    } as Partial<AppConfig>);
    updateShopSettings({ deadStockThresholdDays: value });
    toast.success("Dead Stock period updated");
  }

  async function handleCustomDays() {
    const days = Number.parseInt(customDays, 10);
    if (Number.isNaN(days) || days < 1) {
      toast.error("Valid number of days enter karein");
      return;
    }
    await saveAppConfig({
      deadStockThresholdDays: days,
      deadStockCustomDays: days,
    } as Partial<AppConfig>);
    updateShopSettings({
      deadStockThresholdDays: days,
      deadStockCustomDays: days,
    });
    toast.success(`Dead Stock period set to ${days} days`);
  }

  async function handleLowPriceModeToggle(value: boolean) {
    await saveAppConfig({ allowLowPriceSelling: value } as Partial<AppConfig>);
    toast.success(
      value
        ? "Warning Mode enabled — sale allowed with warning"
        : "Lock Mode enabled — sale blocked below min price",
    );
  }

  async function handleSavePin() {
    const trimmed = pinValue.trim();
    if (trimmed.length < 4 || trimmed.length > 6 || !/^\d+$/.test(trimmed)) {
      toast.error("PIN 4-6 digits ka hona chahiye");
      return;
    }
    setPinSaving(true);
    await saveAppConfig({ ownerPin: trimmed } as Partial<AppConfig>);
    setPinSaving(false);
    toast.success("Owner PIN saved");
  }

  function handleAddUnit() {
    const trimmed = newUnit.trim();
    if (!trimmed) return;
    if (shopUnits.some((u) => u.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Yeh unit pehle se exist karti hai");
      return;
    }
    addShopUnit(trimmed);
    setNewUnit("");
    toast.success(`Unit "${trimmed}" add ho gayi`);
  }

  function handleDeleteUnit(id: string, name: string) {
    deleteShopUnit(id);
    toast.success(`Unit "${name}" delete ho gayi`);
  }

  function handleAddCategory() {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (
      categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())
    ) {
      toast.error("Yeh category pehle se exist karti hai");
      return;
    }
    addCategory(trimmed);
    setNewCategory("");
    toast.success(`Category "${trimmed}" add ho gayi`);
  }

  function handleStartEditCat(id: string, name: string) {
    setEditingCatId(id);
    setEditingCatName(name);
  }

  function handleSaveEditCat(id: string) {
    const trimmed = editingCatName.trim();
    if (!trimmed) return;
    updateCategory(id, trimmed);
    setEditingCatId(null);
    setEditingCatName("");
    toast.success("Category updated");
  }

  function handleDeleteCategory(id: string, name: string) {
    deleteCategory(id);
    toast.success(`Category "${name}" delete ho gayi`);
  }

  const currentDeadStockValue = isCustomDeadStock
    ? -1
    : appConfig.deadStockThresholdDays;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 md:px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">App Settings</h1>
            <p className="text-xs text-muted-foreground">
              Apni shop ke liye features aur settings manage karein
            </p>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
        {/* ── Section 1: App Settings ── */}
        <Card data-ocid="settings.panel">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              <CardTitle className="text-base">App Settings</CardTitle>
            </div>
            <CardDescription>
              Shop ki basic settings configure karein
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Shop Name */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
              <Store className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Shop Name</p>
                <p className="text-sm text-muted-foreground">
                  {currentShop?.name ?? "—"}
                </p>
              </div>
            </div>

            <Separator />

            {/* Mixed Units Toggle */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium">Allow Mixed Units</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Length (meter) + Weight (kg) dono ek saath use karein
                </p>
              </div>
              <Switch
                data-ocid="settings.mixed_units.switch"
                checked={appConfig.allowMixedUnits}
                onCheckedChange={handleMixedUnitsToggle}
              />
            </div>

            <Separator />

            {/* Dead Stock Period */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Dead Stock Period</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Itne time mein na bika toh product "Dead Stock" maana jayega
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DEAD_STOCK_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    data-ocid="settings.dead_stock_period.button"
                    onClick={() => handleDeadStockPeriod(opt.value)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      opt.value === currentDeadStockValue
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {(isCustomDeadStock || currentDeadStockValue === -1) && (
                <div className="flex gap-2">
                  <Input
                    data-ocid="settings.custom_days.input"
                    type="number"
                    min="1"
                    placeholder="Days enter karein"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    className="max-w-[180px] h-8 text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCustomDays}
                    data-ocid="settings.custom_days.save_button"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" /> Save
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Section 2: Feature Control ── */}
        <Card data-ocid="settings.feature_control.panel">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <CardTitle className="text-base">Feature Control</CardTitle>
            </div>
            <CardDescription>
              Features enable/disable karein — data kabhi delete nahi hoga
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {/* Info banner */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 mb-4">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Feature disable karne se sirf UI hide hoti hai — koi bhi data
                delete nahi hota. Baad mein feature wapas ON karne par sab data
                waisa hi rahega.
              </p>
            </div>

            <div className="space-y-2">
              {FEATURE_LIST.map((feature, idx) => {
                const enabled = featureFlags[feature.key];
                return (
                  <div
                    key={feature.key}
                    data-ocid={`settings.feature.item.${idx + 1}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="text-lg flex-shrink-0 mt-0.5">
                        {feature.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-foreground">
                            {feature.label}
                          </span>
                          <Badge
                            variant={enabled ? "default" : "secondary"}
                            className={`text-xs px-1.5 py-0 ${
                              enabled
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      data-ocid={`settings.feature.switch.${idx + 1}`}
                      checked={enabled}
                      onCheckedChange={(val) =>
                        handleFeatureToggle(feature.key, val)
                      }
                      className="ml-3 flex-shrink-0"
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ── Section 3: Edit Units ── */}
        <Card data-ocid="settings.units.panel">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <CardTitle className="text-base">Units Manage Karein</CardTitle>
            </div>
            <CardDescription>
              Shop ke liye measurement units add ya delete karein
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add new unit */}
            <div className="flex gap-2">
              <Input
                data-ocid="settings.unit.input"
                placeholder="Naya unit likhein (jaise: kg, meter, piece)"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddUnit();
                }}
                className="h-9 text-sm"
              />
              <Button
                size="sm"
                onClick={handleAddUnit}
                disabled={!newUnit.trim()}
                data-ocid="settings.unit.add_button"
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>

            {/* Units list */}
            {shopUnits.length === 0 ? (
              <div
                className="text-center py-6 text-muted-foreground text-sm"
                data-ocid="settings.units.empty_state"
              >
                <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Koi unit add nahi ki gayi
              </div>
            ) : (
              <div className="space-y-1.5">
                {shopUnits.map((unit, idx) => (
                  <div
                    key={unit.id}
                    data-ocid={`settings.unit.item.${idx + 1}`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-muted/20"
                  >
                    <span className="text-sm font-medium">{unit.name}</span>
                    <button
                      type="button"
                      data-ocid={`settings.unit.delete_button.${idx + 1}`}
                      onClick={() => handleDeleteUnit(unit.id, unit.name)}
                      className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title={`Delete ${unit.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Section 4: Edit Categories ── */}
        <Card data-ocid="settings.categories.panel">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              <CardTitle className="text-base">
                Categories Manage Karein
              </CardTitle>
            </div>
            <CardDescription>
              Product categories add, edit ya delete karein
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add new category */}
            <div className="flex gap-2">
              <Input
                data-ocid="settings.category.input"
                placeholder="Naya category likhein (jaise: Electronics, Food)"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddCategory();
                }}
                className="h-9 text-sm"
              />
              <Button
                size="sm"
                onClick={handleAddCategory}
                disabled={!newCategory.trim()}
                data-ocid="settings.category.add_button"
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>

            {/* Categories list */}
            {categories.length === 0 ? (
              <div
                className="text-center py-6 text-muted-foreground text-sm"
                data-ocid="settings.categories.empty_state"
              >
                <Tag className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Koi category add nahi ki gayi
              </div>
            ) : (
              <div className="space-y-1.5">
                {categories.map((cat, idx) => (
                  <div
                    key={cat.id}
                    data-ocid={`settings.category.item.${idx + 1}`}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border bg-muted/20"
                  >
                    {editingCatId === cat.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          data-ocid="settings.category.edit.input"
                          value={editingCatName}
                          onChange={(e) => setEditingCatName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEditCat(cat.id);
                            if (e.key === "Escape") setEditingCatId(null);
                          }}
                          className="h-7 text-sm flex-1"
                          autoFocus
                        />
                        <button
                          type="button"
                          data-ocid={`settings.category.save_button.${idx + 1}`}
                          onClick={() => handleSaveEditCat(cat.id)}
                          className="p-1 rounded-md text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCatId(null)}
                          className="p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium flex-1">
                          {cat.name}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            data-ocid={`settings.category.edit_button.${idx + 1}`}
                            onClick={() => handleStartEditCat(cat.id, cat.name)}
                            className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Edit category"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            data-ocid={`settings.category.delete_button.${idx + 1}`}
                            onClick={() =>
                              handleDeleteCategory(cat.id, cat.name)
                            }
                            className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Delete category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Section 5: Low Price Selling Control (Admin only) ── */}
        <Card data-ocid="settings.low_price_control.panel">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <CardTitle className="text-base">
                Low Price Selling Control
              </CardTitle>
            </div>
            <CardDescription>
              Staff ko minimum profit se neeche bechne se rokne ka system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Mode Toggle */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium">
                  Allow Low Price Selling
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ON = Warning Mode (sale allow with warning) &nbsp;|&nbsp; OFF
                  = Lock Mode (sale block)
                </p>
                <div className="mt-2">
                  {appConfig.allowLowPriceSelling ? (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-300 border text-xs">
                      ⚠️ Warning Mode
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700 border-red-300 border text-xs">
                      🔒 Lock Mode
                    </Badge>
                  )}
                </div>
              </div>
              <Switch
                data-ocid="settings.allow_low_price_selling.switch"
                checked={!!appConfig.allowLowPriceSelling}
                onCheckedChange={handleLowPriceModeToggle}
              />
            </div>

            <Separator />

            {/* Owner PIN */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Owner Override PIN (4-6 digits)
              </Label>
              <p className="text-xs text-muted-foreground">
                Lock Mode mein staff ko is PIN se override ki permission milegi
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1 max-w-[200px]">
                  <Input
                    data-ocid="settings.owner_pin.input"
                    type={showPin ? "text" : "password"}
                    placeholder="PIN enter karein"
                    value={pinValue}
                    onChange={(e) => setPinValue(e.target.value)}
                    maxLength={6}
                    className="pr-9 h-9 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    title={showPin ? "Hide PIN" : "Show PIN"}
                  >
                    {showPin ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSavePin}
                  disabled={pinSaving || !pinValue.trim()}
                  data-ocid="settings.owner_pin.save_button"
                >
                  {pinSaving ? (
                    "Saving..."
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1" /> Save PIN
                    </>
                  )}
                </Button>
              </div>
              {appConfig.ownerPin && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="w-3 h-3" /> PIN set hai
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Section 6: Staff Reminder Control (Owner only) ── */}
        {isOwner && (
          <Card data-ocid="settings.staff_reminder_control.panel">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-500" />
                <CardTitle className="text-base">
                  Staff Reminder Control
                </CardTitle>
              </div>
              <CardDescription>
                Staff ke liye WhatsApp reminder system control karein
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Allow Staff Reminders Toggle */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <Label className="text-sm font-medium">
                    Allow Staff Reminders
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ON karein toh staff customers ko reminders send ya request
                    kar sakenge
                  </p>
                  <div className="mt-2">
                    {appConfig.allowStaffReminders ? (
                      <Badge className="bg-green-100 text-green-700 border-green-300 border text-xs">
                        ✅ Staff Reminders Enabled
                      </Badge>
                    ) : (
                      <Badge className="bg-muted text-muted-foreground text-xs">
                        🚫 Staff Reminders Disabled
                      </Badge>
                    )}
                  </div>
                </div>
                <Switch
                  data-ocid="settings.allow_staff_reminders.switch"
                  checked={!!appConfig.allowStaffReminders}
                  onCheckedChange={async (val) => {
                    await saveAppConfig({
                      allowStaffReminders: val,
                    } as Partial<AppConfig>);
                    toast.success(
                      `Staff reminders ${val ? "enabled" : "disabled"}`,
                    );
                  }}
                />
              </div>

              {/* Mode selector — shown only when allowStaffReminders is ON */}
              {appConfig.allowStaffReminders && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Reminder Mode</Label>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        data-ocid="settings.staff_reminder_mode.approval"
                        onClick={async () => {
                          await saveAppConfig({
                            staffReminderMode: "approval",
                          } as Partial<AppConfig>);
                          toast.success("Approval Mode set kiya gaya");
                        }}
                        className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                          (appConfig.staffReminderMode ?? "approval") ===
                          "approval"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/40"
                        }`}
                      >
                        <div
                          className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            (appConfig.staffReminderMode ?? "approval") ===
                            "approval"
                              ? "border-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {(appConfig.staffReminderMode ?? "approval") ===
                            "approval" && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            Approval Mode (Default)
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Staff sends request → Owner/Manager approves →
                            WhatsApp sent
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        data-ocid="settings.staff_reminder_mode.simple"
                        onClick={async () => {
                          await saveAppConfig({
                            staffReminderMode: "simple",
                          } as Partial<AppConfig>);
                          toast.success("Simple Mode set kiya gaya");
                        }}
                        className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                          appConfig.staffReminderMode === "simple"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/40"
                        }`}
                      >
                        <div
                          className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            appConfig.staffReminderMode === "simple"
                              ? "border-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {appConfig.staffReminderMode === "simple" && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            Simple Mode
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Staff can send directly — max 2 reminders per
                            customer per day
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Safety Note */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Data Safety
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Koi bhi setting change karne se purana data delete nahi hoga.
              Features disable karne par sirf UI hide hoti hai — data safe rehta
              hai. Future mein naye features bhi bina purana data hataye add
              kiye ja sakte hain.
            </p>
          </div>
        </div>

        {/* ── Section 7: Backup & Restore ── */}
        <Card data-ocid="settings.backup_restore.panel">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-primary" />
              <CardTitle className="text-base">Backup &amp; Restore</CardTitle>
            </div>
            <CardDescription>
              Apna data export aur import karein
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Confirm dialog */}
            {importConfirming && (
              <div className="p-4 rounded-lg border border-destructive/40 bg-destructive/5 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium text-destructive">
                    Yeh action existing data overwrite kar dega. Kya aap sure
                    hain?
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleImportConfirm}
                    data-ocid="settings.import.confirm_button"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" /> Haan, Restore Karein
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleImportCancel}
                    data-ocid="settings.import.cancel_button"
                  >
                    <X className="w-3.5 h-3.5 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Export/Import buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="default"
                size="sm"
                onClick={handleExport}
                data-ocid="settings.export.button"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Data (JSON)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => importFileRef.current?.click()}
                data-ocid="settings.import.button"
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Import Data (JSON)
              </Button>
              <input
                ref={importFileRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportFileChange}
                data-ocid="settings.import.file_input"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Export: JSON file download hoga &nbsp;|&nbsp; Import: file se data
              restore hoga
            </p>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Import karne se existing data overwrite ho jaata hai. Pehle
                export zarur karein.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Safety Info */}
        <div className="flex items-center justify-center gap-2 py-4 px-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
          <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p className="text-xs text-green-700 dark:text-green-400 text-center">
            🔒 Aapka data ICP cloud aur browser storage dono mein safe rehta hai
            — kabhi delete nahi hoga
          </p>
        </div>
      </div>
    </div>
  );
}
