import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Check,
  Clock,
  Download,
  Eye,
  EyeOff,
  Info,
  LayoutGrid,
  Lock,
  Package,
  Pencil,
  Plus,
  RefreshCw,
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
import type {
  AppConfig,
  AutoModeType,
  DashboardSectionConfig,
  FeatureFlags,
} from "../types/store";
import {
  type BackupSnapshot,
  createBackupSnapshot,
  deleteBackupSnapshot,
  listBackupSnapshots,
  pruneBackups,
  restoreFromSnapshot,
} from "../utils/backupManager";
import { STORAGE_KEYS, saveData } from "../utils/localStorage";

interface FeatureItem {
  key: keyof FeatureFlags;
  label: string;
  description: string;
  icon: string;
  /** If set, this feature is only shown when autoMode matches */
  requireMode?: AutoModeType;
}

const FEATURE_LIST: FeatureItem[] = [
  {
    key: "expiry",
    label: "Expiry Date Tracking",
    description: "Track product expiry dates and receive alerts",
    icon: "📅",
  },
  {
    key: "deadStock",
    label: "Dead Stock Detection",
    description: "Identify products that are not selling",
    icon: "📦",
  },
  {
    key: "rental",
    label: "Rental / Lending Module",
    description: "Manage rental and lending items",
    icon: "🔑",
  },
  {
    key: "service",
    label: "Service / Repair Orders",
    description: "Manage service and repair orders",
    icon: "🔧",
  },
  {
    key: "staff",
    label: "Staff Management",
    description: "Track staff performance, credit, and bonuses",
    icon: "👥",
  },
  {
    key: "credit",
    label: "Credit / Due Amount Tracking",
    description: "Track customer credit and due payments",
    icon: "💳",
  },
  {
    key: "discount",
    label: "Discount & Pricing Controls",
    description: "Discount rules, min price lock, and staff pricing controls",
    icon: "🏷️",
  },
  {
    key: "customerTracking",
    label: "Customer Tracking",
    description: "Auto-track customers, rankings, and insights (Pro mode)",
    icon: "📊",
    requireMode: "pro",
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
    setDashboardSection,
    updateShopSettings,
    shopUnits,
    addShopUnit,
    deleteShopUnit,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    autoMode,
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
    resetShopData,
  } = useStore();

  // Filtered feature list — mode-gated entries only shown in the required mode
  const visibleFeatures = FEATURE_LIST.filter(
    (f) => !f.requireMode || f.requireMode === autoMode,
  );

  const importFileRef = useRef<HTMLInputElement>(null);
  const [importConfirming, setImportConfirming] = useState(false);
  const [pendingImport, setPendingImport] = useState<Record<
    string,
    unknown
  > | null>(null);

  // ── Reset Shop Data state ────────────────────────────────────────────────────
  const [resetStep, setResetStep] = useState<"idle" | "confirm1" | "confirm2">(
    "idle",
  );
  const [resetInput, setResetInput] = useState("");
  const [resetInProgress, setResetInProgress] = useState(false);

  async function handleResetConfirm() {
    if (resetInput !== "RESET") return;
    setResetInProgress(true);
    try {
      await resetShopData();
      setResetStep("idle");
      setResetInput("");
      toast.success("All data cleared successfully. Start fresh.", {
        duration: 5000,
        icon: "✅",
      });
      // Reload page after a brief pause so app renders the fresh empty state
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      toast.error("Reset failed. Please try again.");
    } finally {
      setResetInProgress(false);
    }
  }

  function handleResetCancel() {
    setResetStep("idle");
    setResetInput("");
  }

  // ── Cloud Backup state ───────────────────────────────────────────────────────
  const [backupList, setBackupList] = useState<BackupSnapshot[]>(() =>
    listBackupSnapshots(shopId),
  );
  const [backupRetention, setBackupRetention] = useState<"30" | "unlimited">(
    () =>
      (localStorage.getItem(`saveshop_backup_retention_${shopId}`) as
        | "30"
        | "unlimited") ?? "30",
  );
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<BackupSnapshot | null>(
    null,
  );
  const [restoreOptions, setRestoreOptions] = useState({
    products: true,
    customers: true,
    invoices: true,
    payments: true,
    vendors: true,
    batches: true,
    returns: true,
  });
  const [restoreConfirming, setRestoreConfirming] = useState(false);

  const refreshBackupList = () => setBackupList(listBackupSnapshots(shopId));

  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    try {
      createBackupSnapshot(shopId, {
        products,
        customers,
        invoices,
        vendors,
        batches,
        payments,
        returns,
      });
      refreshBackupList();
      toast.success("Backup created successfully");
    } catch {
      toast.error("Failed to create backup");
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleDeleteBackup = (id: string) => {
    deleteBackupSnapshot(shopId, id);
    refreshBackupList();
    toast.success("Backup deleted");
  };

  const handleRetentionChange = (val: "30" | "unlimited") => {
    setBackupRetention(val);
    localStorage.setItem(`saveshop_backup_retention_${shopId}`, val);
    if (val === "30") {
      pruneBackups(shopId, 30);
      refreshBackupList();
    }
    toast.success(
      val === "30" ? "Keeping backups for 30 days" : "Keeping all backups",
    );
  };

  const openRestoreDialog = (snapshot: BackupSnapshot) => {
    setRestoreTarget(snapshot);
    setRestoreOptions({
      products: true,
      customers: true,
      invoices: true,
      payments: true,
      vendors: true,
      batches: true,
      returns: true,
    });
    setRestoreConfirming(false);
  };

  const handleRestoreConfirm = () => {
    if (!restoreTarget) return;
    const result = restoreFromSnapshot(
      shopId,
      restoreTarget.id,
      restoreOptions,
    );
    if (!result) {
      toast.error("Backup data not found — snapshot may be expired");
      setRestoreTarget(null);
      return;
    }
    // Write restored data to localStorage so StoreContext picks it up on reload
    if (restoreOptions.products)
      saveData(`${STORAGE_KEYS.products}_${shopId}`, result.products);
    if (restoreOptions.customers)
      saveData(`${STORAGE_KEYS.customers}_${shopId}`, result.customers);
    if (restoreOptions.invoices)
      saveData(`${STORAGE_KEYS.sales}_${shopId}`, result.invoices);
    if (restoreOptions.payments)
      saveData(`${STORAGE_KEYS.payments}_${shopId}`, result.payments);
    if (restoreOptions.vendors)
      saveData(`${STORAGE_KEYS.vendors}_${shopId}`, result.vendors);
    if (restoreOptions.batches)
      saveData(`${STORAGE_KEYS.batches}_${shopId}`, result.batches);
    if (restoreOptions.returns)
      saveData(`${STORAGE_KEYS.returns}_${shopId}`, result.returns);
    setRestoreTarget(null);
    toast.success("Restore complete — reloading data...");
    setTimeout(() => window.location.reload(), 1200);
  };

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
    toast.success("Data restored successfully — please reload the page");
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

  async function handleDashboardSectionToggle(
    key: keyof DashboardSectionConfig,
    value: boolean,
  ) {
    await setDashboardSection(key, value);
    toast.success(`Dashboard section ${value ? "shown" : "hidden"}`);
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
      toast.error("Please enter a valid number of days");
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
      toast.error("PIN must be 4-6 digits");
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
      toast.error("This unit already exists");
      return;
    }
    addShopUnit(trimmed);
    setNewUnit("");
    toast.success(`Unit "${trimmed}" added`);
  }

  function handleDeleteUnit(id: string, name: string) {
    deleteShopUnit(id);
    toast.success(`Unit "${name}" deleted`);
  }

  function handleAddCategory() {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (
      categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())
    ) {
      toast.error("This category already exists");
      return;
    }
    addCategory(trimmed);
    setNewCategory("");
    toast.success(`Category "${trimmed}" added`);
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
    toast.success(`Category "${name}" deleted`);
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
              Manage features and settings for your shop
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
              Configure your shop's basic settings
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
                  Use both Length (meter) and Weight (kg) together
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
                  Unsold for this period will be flagged as "Dead Stock"
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
                    placeholder="Enter number of days"
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
              Enable or disable features — your data is never deleted
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {/* Info banner */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 mb-4">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Disabling a feature only hides the UI — your data is never
                deleted. You can re-enable any feature later without data loss.
              </p>
            </div>

            <div className="space-y-2">
              {visibleFeatures.map((feature, idx) => {
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

        {/* ── Dashboard Settings (Owner only) ── */}
        {isOwner && (
          <Card data-ocid="settings.dashboard_sections.panel">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">Dashboard Settings</CardTitle>
              </div>
              <CardDescription>
                Choose which sections to show on your dashboard. Hidden sections
                still update in the background.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 mb-4">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Hiding a section only removes it from view — data continues to
                  update in the background. Turn it back on anytime.
                </p>
              </div>

              {(
                [
                  {
                    group: "Overview",
                    items: [
                      {
                        key: "marqueeAlertBar" as const,
                        icon: "📢",
                        label: "Marquee Alert Bar",
                        description: "Scrolling ticker with live messages",
                      },
                      {
                        key: "adBannerCarousel" as const,
                        icon: "🎠",
                        label: "Ad Banner Carousel",
                        description: "Promotional banner slideshow",
                      },
                      {
                        key: "quickActions" as const,
                        icon: "⚡",
                        label: "Quick Actions",
                        description: "Shortcut buttons for common actions",
                      },
                      {
                        key: "smartFilterBar" as const,
                        icon: "🔽",
                        label: "Smart Filter Bar",
                        description:
                          "Quick filters for Dead Stock, Low Stock etc.",
                      },
                    ],
                  },
                  {
                    group: "Analytics",
                    items: [
                      {
                        key: "todaySummary" as const,
                        icon: "📊",
                        label: "Today's Summary",
                        description: "Total sales, profit, cash/UPI breakdown",
                      },
                      {
                        key: "topPerformance" as const,
                        icon: "⭐",
                        label: "Top Performance Card",
                        description: "Top selling product, customer, vendor",
                      },
                      {
                        key: "smartAlerts" as const,
                        icon: "🚨",
                        label: "Smart Alerts",
                        description:
                          "Low stock, out of stock, customer due alerts",
                      },
                      {
                        key: "smartInsights" as const,
                        icon: "💡",
                        label: "Smart Insights",
                        description:
                          "Most selling, high profit, low price attempt insights",
                      },
                      {
                        key: "smartInsightsCards" as const,
                        icon: "🃏",
                        label: "Smart Insights Cards",
                        description: "Compact horizontal insights cards",
                      },
                    ],
                  },
                  {
                    group: "Inventory & Finance",
                    items: [
                      {
                        key: "productsList" as const,
                        icon: "📦",
                        label: "Products List",
                        description: "Products ranked by sales",
                      },
                      {
                        key: "stockControl" as const,
                        icon: "🏷️",
                        label: "Stock Control",
                        description:
                          "Low stock, out of stock, slow moving counts",
                      },
                      {
                        key: "inventoryHealth" as const,
                        icon: "🩺",
                        label: "Inventory Health",
                        description: "Expiry alerts and dead stock trends",
                      },
                      {
                        key: "customerDue" as const,
                        icon: "💳",
                        label: "Customer Due",
                        description: "Customers with pending payments",
                      },
                      {
                        key: "pendingOrders" as const,
                        icon: "🛒",
                        label: "Pending Orders",
                        description:
                          "Vendor and customer orders awaiting action",
                      },
                    ],
                  },
                  {
                    group: "Rewards & Activity",
                    items: [
                      {
                        key: "diamondRewards" as const,
                        icon: "💎",
                        label: "Diamond Rewards",
                        description: "Your diamond count and progress",
                      },
                      {
                        key: "recentActivity" as const,
                        icon: "🕐",
                        label: "Recent Activity Feed",
                        description: "Last 10 transactions",
                      },
                      {
                        key: "tutorialGuide" as const,
                        icon: "🎓",
                        label: "Tutorial Guide",
                        description: "App tutorial cards",
                      },
                      {
                        key: "sponsoredAd" as const,
                        icon: "📣",
                        label: "Sponsored Ad",
                        description: "Sponsored partner card",
                      },
                    ],
                  },
                  {
                    group: "PRO Features",
                    items: [
                      {
                        key: "customerInsights" as const,
                        icon: "🔮",
                        label: "Customer Insights",
                        description:
                          "Top customers, inactive, lost & high pending (PRO + Customer Tracking required)",
                      },
                    ],
                  },
                ] as {
                  group: string;
                  items: {
                    key: keyof DashboardSectionConfig;
                    icon: string;
                    label: string;
                    description: string;
                  }[];
                }[]
              ).map((section, gIdx) => (
                <div key={section.group} className={gIdx > 0 ? "mt-4" : ""}>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                    {section.group}
                  </p>
                  <div className="space-y-2">
                    {section.items.map((item, idx) => {
                      const enabled =
                        appConfig.dashboardSections?.[item.key] !== false;
                      return (
                        <div
                          key={item.key}
                          data-ocid={`settings.dashboard.item.${gIdx * 10 + idx + 1}`}
                          className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <span className="text-lg flex-shrink-0 mt-0.5">
                              {item.icon}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-foreground">
                                  {item.label}
                                </span>
                                <Badge
                                  variant={enabled ? "default" : "secondary"}
                                  className={`text-xs px-1.5 py-0 ${
                                    enabled
                                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {enabled ? "Visible" : "Hidden"}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <Switch
                            data-ocid={`settings.dashboard.switch.${gIdx * 10 + idx + 1}`}
                            checked={enabled}
                            onCheckedChange={(val) =>
                              handleDashboardSectionToggle(item.key, val)
                            }
                            className="ml-3 flex-shrink-0"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* ── Section 3: Edit Units ── */}
        <Card data-ocid="settings.units.panel">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <CardTitle className="text-base">Manage Units</CardTitle>
            </div>
            <CardDescription>
              Add or delete measurement units for your shop
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add new unit */}
            <div className="flex gap-2">
              <Input
                data-ocid="settings.unit.input"
                placeholder="Add new unit (e.g. kg, meter, piece)"
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
                No units added yet
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
              <CardTitle className="text-base">Manage Categories</CardTitle>
            </div>
            <CardDescription>
              Add, edit, or delete product categories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add new category */}
            <div className="flex gap-2">
              <Input
                data-ocid="settings.category.input"
                placeholder="Add new category (e.g. Electronics, Food)"
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
                No categories added yet
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
              Prevent staff from selling below the minimum profit price
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
                In Lock Mode, staff can request override approval using this PIN
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1 max-w-[200px]">
                  <Input
                    data-ocid="settings.owner_pin.input"
                    type={showPin ? "text" : "password"}
                    placeholder="Enter PIN"
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
                  <Check className="w-3 h-3" /> PIN is set
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
                Control the WhatsApp reminder system for staff
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
                    When ON, staff can send or request customer reminders
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
                          toast.success("Approval Mode activated");
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
                          toast.success("Simple Mode activated");
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
              Changing any setting will not delete existing data. Disabling
              features only hides the UI — data is always safe. New features can
              be added later without removing existing data.
            </p>
          </div>
        </div>

        {/* ── Danger Zone: Reset Shop Data ── */}
        {isOwner && (
          <Card
            data-ocid="settings.danger_zone.panel"
            className="border-destructive/40"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <CardTitle className="text-base text-destructive">
                  Danger Zone
                </CardTitle>
              </div>
              <CardDescription>
                Irreversible actions — proceed with caution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 space-y-4">
                <div className="flex items-start gap-3">
                  <Trash2 className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      Reset All Shop Data
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Permanently delete all products, sales, customers,
                      vendors, batches, and history for{" "}
                      <strong>{currentShop?.name ?? "this shop"}</strong>. Other
                      shops are not affected.
                    </p>
                  </div>
                </div>

                {/* Step 1: Idle — show the button */}
                {resetStep === "idle" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setResetStep("confirm1")}
                    data-ocid="settings.reset_shop.open_modal_button"
                    className="w-full sm:w-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Reset All Data
                  </Button>
                )}

                {/* Step 1 Confirmation: "Are you sure?" */}
                {resetStep === "confirm1" && (
                  <div
                    className="space-y-3"
                    data-ocid="settings.reset_shop.dialog"
                  >
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/40">
                      <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-medium text-destructive">
                        Are you sure? This will permanently delete ALL data for
                        this shop — products, sales, customers, vendors, staff
                        records, and all history. This cannot be undone.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleResetCancel}
                        data-ocid="settings.reset_shop.cancel_button"
                        className="flex-1"
                      >
                        <X className="w-3.5 h-3.5 mr-1" /> Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setResetStep("confirm2")}
                        data-ocid="settings.reset_shop.confirm_button"
                        className="flex-1"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Type RESET to confirm */}
                {resetStep === "confirm2" && (
                  <div
                    className="space-y-3"
                    data-ocid="settings.reset_shop.dialog"
                  >
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/40">
                      <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-medium text-destructive">
                        Final confirmation — this action is irreversible.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="reset-confirm-input"
                        className="text-sm font-medium text-foreground"
                      >
                        Type{" "}
                        <code className="px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-mono text-xs font-bold">
                          RESET
                        </code>{" "}
                        to confirm
                      </Label>
                      <Input
                        id="reset-confirm-input"
                        data-ocid="settings.reset_shop.input"
                        value={resetInput}
                        onChange={(e) => setResetInput(e.target.value)}
                        placeholder="Type RESET here"
                        className="h-9 text-sm font-mono"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                      />
                      <p className="text-xs text-muted-foreground">
                        Case-sensitive — must be all uppercase: RESET
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleResetCancel}
                        disabled={resetInProgress}
                        data-ocid="settings.reset_shop.cancel_button"
                        className="flex-1"
                      >
                        <X className="w-3.5 h-3.5 mr-1" /> Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleResetConfirm}
                        disabled={resetInput !== "RESET" || resetInProgress}
                        data-ocid="settings.reset_shop.submit_button"
                        className="flex-1"
                      >
                        {resetInProgress ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            Resetting…
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                            Reset
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Section 7: Backup & Restore ── */}
        <Card data-ocid="settings.backup_restore.panel">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-primary" />
              <CardTitle className="text-base">Backup &amp; Restore</CardTitle>
            </div>
            <CardDescription>Export and import your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Confirm dialog */}
            {importConfirming && (
              <div className="p-4 rounded-lg border border-destructive/40 bg-destructive/5 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium text-destructive">
                    This action will overwrite existing data. Are you sure?
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleImportConfirm}
                    data-ocid="settings.import.confirm_button"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" /> Yes, Restore
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
              Export: Downloads a JSON backup file &nbsp;|&nbsp; Import:
              Restores data from a backup file
            </p>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Importing will overwrite existing data. Please export first as a
                backup.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Safety Info */}
        <div className="flex items-center justify-center gap-2 py-4 px-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
          <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p className="text-xs text-green-700 dark:text-green-400 text-center">
            🔒 Your data is safely stored in ICP cloud and browser storage — it
            is never deleted
          </p>
        </div>

        {/* ── Section 8: Data Backup & Restore ── */}
        <Card data-ocid="settings.data_backup.panel">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">
                  Data Backup &amp; Restore
                </CardTitle>
              </div>
              <Button
                size="sm"
                variant="default"
                onClick={handleCreateBackup}
                disabled={creatingBackup}
                data-ocid="settings.backup.create_button"
                className="flex items-center gap-1.5 h-8 text-xs"
              >
                {creatingBackup ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : (
                  <Download size={12} />
                )}
                {creatingBackup ? "Saving…" : "Backup Now"}
              </Button>
            </div>
            <CardDescription>
              Create snapshots and restore data to any point in time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Retention toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Backup Retention
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  How long to keep backups
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary p-0.5">
                <button
                  type="button"
                  data-ocid="settings.backup.retention_30"
                  onClick={() => handleRetentionChange("30")}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    backupRetention === "30"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  30 Days
                </button>
                <button
                  type="button"
                  data-ocid="settings.backup.retention_unlimited"
                  onClick={() => handleRetentionChange("unlimited")}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    backupRetention === "unlimited"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Unlimited
                </button>
              </div>
            </div>

            {/* Backup history */}
            {backupList.length === 0 ? (
              <div
                className="flex flex-col items-center gap-2 py-6 text-center"
                data-ocid="settings.backup.empty_state"
              >
                <Clock size={24} className="text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No backups yet</p>
                <p className="text-xs text-muted-foreground/70">
                  Click "Backup Now" to create your first snapshot
                </p>
              </div>
            ) : (
              <div className="space-y-2" data-ocid="settings.backup.list">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Backup History ({backupList.length})
                </p>
                {backupList.map((snap, idx) => (
                  <div
                    key={snap.id}
                    data-ocid={`settings.backup.item.${idx + 1}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground">
                        {new Date(snap.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {snap.collections.products} products ·{" "}
                        {snap.collections.customers} customers ·{" "}
                        {snap.collections.invoices} sales ·{" "}
                        {snap.collections.vendors} vendors
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openRestoreDialog(snap)}
                        data-ocid={`settings.backup.restore_button.${idx + 1}`}
                        className="h-7 px-2 text-xs"
                      >
                        Restore
                      </Button>
                      <button
                        type="button"
                        data-ocid={`settings.backup.delete_button.${idx + 1}`}
                        onClick={() => handleDeleteBackup(snap.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete backup"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Restore Dialog */}
        {restoreTarget && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            data-ocid="settings.restore.dialog"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setRestoreTarget(null)}
              onKeyDown={(e) => e.key === "Escape" && setRestoreTarget(null)}
              role="presentation"
            />
            <div className="relative bg-card border border-border rounded-2xl shadow-xl p-6 w-full max-w-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-base text-foreground">
                  Restore Backup
                </h3>
                <button
                  type="button"
                  data-ocid="settings.restore.close_button"
                  onClick={() => setRestoreTarget(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted text-lg leading-none"
                >
                  ×
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                From:{" "}
                {new Date(restoreTarget.createdAt).toLocaleString("en-IN")}
              </p>

              {/* Master toggle */}
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
                <Checkbox
                  id="restore-all"
                  data-ocid="settings.restore.all_checkbox"
                  checked={Object.values(restoreOptions).every(Boolean)}
                  onCheckedChange={(checked) =>
                    setRestoreOptions({
                      products: !!checked,
                      customers: !!checked,
                      invoices: !!checked,
                      payments: !!checked,
                      vendors: !!checked,
                      batches: !!checked,
                      returns: !!checked,
                    })
                  }
                />
                <label
                  htmlFor="restore-all"
                  className="text-sm font-semibold text-foreground cursor-pointer"
                >
                  Restore All
                </label>
              </div>

              {/* Per-collection toggles */}
              <div className="space-y-2 mb-5">
                {(
                  [
                    {
                      key: "products",
                      label: "Products",
                      count: restoreTarget.collections.products,
                    },
                    {
                      key: "customers",
                      label: "Customers",
                      count: restoreTarget.collections.customers,
                    },
                    {
                      key: "invoices",
                      label: "Sales",
                      count: restoreTarget.collections.invoices,
                    },
                    {
                      key: "payments",
                      label: "Payments",
                      count: restoreTarget.collections.payments,
                    },
                    {
                      key: "vendors",
                      label: "Vendors",
                      count: restoreTarget.collections.vendors,
                    },
                    {
                      key: "batches",
                      label: "Batches",
                      count: restoreTarget.collections.batches,
                    },
                    {
                      key: "returns",
                      label: "Returns",
                      count: restoreTarget.collections.returns,
                    },
                  ] as {
                    key: keyof typeof restoreOptions;
                    label: string;
                    count: number;
                  }[]
                ).map((opt) => (
                  <div key={opt.key} className="flex items-center gap-2">
                    <Checkbox
                      id={`restore-${opt.key}`}
                      data-ocid={`settings.restore.${opt.key}_checkbox`}
                      checked={restoreOptions[opt.key]}
                      onCheckedChange={(checked) =>
                        setRestoreOptions((prev) => ({
                          ...prev,
                          [opt.key]: !!checked,
                        }))
                      }
                    />
                    <label
                      htmlFor={`restore-${opt.key}`}
                      className="text-sm text-foreground flex-1 cursor-pointer"
                    >
                      {opt.label}
                    </label>
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-4 px-1.5"
                    >
                      {opt.count}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Warning */}
              {!restoreConfirming ? (
                <>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 mb-4">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      This will overwrite current data for selected collections.
                      App will reload after restore.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRestoreTarget(null)}
                      data-ocid="settings.restore.cancel_button"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setRestoreConfirming(true)}
                      data-ocid="settings.restore.proceed_button"
                      className="flex-1"
                      disabled={!Object.values(restoreOptions).some(Boolean)}
                    >
                      Restore Selected
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-destructive mb-3">
                    Are you sure? This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRestoreConfirming(false)}
                      data-ocid="settings.restore.back_button"
                      className="flex-1"
                    >
                      Go Back
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleRestoreConfirm}
                      data-ocid="settings.restore.confirm_button"
                      className="flex-1"
                    >
                      <Check size={12} className="mr-1" /> Confirm Restore
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
