import { c as createLucideIcon, ax as loadData, ay as saveData, h as useAuth, l as useStore, r as reactExports, j as jsxRuntimeExports, az as SlidersHorizontal, C as Card, i as CardHeader, S as Settings, k as CardTitle, aA as CardDescription, n as CardContent, aB as Store, $ as Separator, L as Label, I as Input, B as Button, v as Badge, aC as LayoutGrid, ab as Package, m as Plus, x as Trash2, X, w as Pencil, a0 as ShieldAlert, aD as EyeOff, aj as Eye, a7 as Bell, y as ue, F as CircleAlert, N as TriangleAlert, aE as RefreshCw, a4 as Download, E as Clock, aF as STORAGE_KEYS } from "./index-Bt77HP0S.js";
import { C as Checkbox } from "./checkbox-Brxqowbl.js";
import { S as Switch } from "./switch-USsqFl0-.js";
import { C as Check } from "./check-DtmnsLpz.js";
import { S as Shield } from "./shield-DFIEddNp.js";
import { T as Tag } from "./tag-BROHmU0i.js";
import { L as Lock } from "./lock-CVY4hd8d.js";
import "./index-Bc1JMXzj.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 16v-4", key: "1dtifu" }],
  ["path", { d: "M12 8h.01", key: "e9boi3" }]
];
const Info = createLucideIcon("info", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M12 3v12", key: "1x0j5s" }],
  ["path", { d: "m17 8-5-5-5 5", key: "7q97r8" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }]
];
const Upload = createLucideIcon("upload", __iconNode);
const BACKUP_LIST_KEY = (shopId) => `saveshop_backups_list_${shopId}`;
const BACKUP_DATA_KEY = (shopId, id) => `saveshop_backup_data_${shopId}_${id}`;
function listBackupSnapshots(shopId) {
  return loadData(BACKUP_LIST_KEY(shopId), []).sort(
    (a, b) => b.createdAt - a.createdAt
  );
}
function createBackupSnapshot(shopId, storeData) {
  const id = `bk_${shopId}_${Date.now()}`;
  const snapshot = {
    id,
    shopId,
    createdAt: Date.now(),
    collections: {
      products: storeData.products.length,
      customers: storeData.customers.length,
      invoices: storeData.invoices.length,
      payments: storeData.payments.length,
      vendors: storeData.vendors.length,
      batches: storeData.batches.length,
      returns: storeData.returns.length
    }
  };
  const payload = JSON.stringify(storeData);
  try {
    localStorage.setItem(BACKUP_DATA_KEY(shopId, id), payload);
  } catch {
    console.warn("Backup payload storage failed (quota?)");
  }
  const list = listBackupSnapshots(shopId);
  list.unshift(snapshot);
  const trimmed = list.slice(0, 30);
  saveData(BACKUP_LIST_KEY(shopId), trimmed);
  return snapshot;
}
function getBackupSnapshotData(shopId, id) {
  try {
    const raw = localStorage.getItem(BACKUP_DATA_KEY(shopId, id));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function restoreFromSnapshot(shopId, snapshotId, options) {
  const data = getBackupSnapshotData(shopId, snapshotId);
  if (!data) return null;
  const result = {};
  if (options.products) result.products = data.products ?? [];
  if (options.customers) result.customers = data.customers ?? [];
  if (options.invoices) result.invoices = data.invoices ?? [];
  if (options.payments) result.payments = data.payments ?? [];
  if (options.vendors) result.vendors = data.vendors ?? [];
  if (options.batches) result.batches = data.batches ?? [];
  if (options.returns) result.returns = data.returns ?? [];
  return result;
}
function pruneBackups(shopId, retainDays) {
  const cutoff = Date.now() - retainDays * 24 * 60 * 60 * 1e3;
  const list = listBackupSnapshots(shopId);
  const toDelete = list.filter((b) => b.createdAt < cutoff);
  for (const b of toDelete) {
    try {
      localStorage.removeItem(BACKUP_DATA_KEY(shopId, b.id));
    } catch {
    }
  }
  const kept = list.filter((b) => b.createdAt >= cutoff);
  saveData(BACKUP_LIST_KEY(shopId), kept);
}
function deleteBackupSnapshot(shopId, id) {
  try {
    localStorage.removeItem(BACKUP_DATA_KEY(shopId, id));
  } catch {
  }
  const list = listBackupSnapshots(shopId).filter((b) => b.id !== id);
  saveData(BACKUP_LIST_KEY(shopId), list);
}
const FEATURE_LIST = [
  {
    key: "expiry",
    label: "Expiry Date Tracking",
    description: "Track product expiry dates and receive alerts",
    icon: "📅"
  },
  {
    key: "deadStock",
    label: "Dead Stock Detection",
    description: "Identify products that are not selling",
    icon: "📦"
  },
  {
    key: "rental",
    label: "Rental / Lending Module",
    description: "Manage rental and lending items",
    icon: "🔑"
  },
  {
    key: "service",
    label: "Service / Repair Orders",
    description: "Manage service and repair orders",
    icon: "🔧"
  },
  {
    key: "staff",
    label: "Staff Management",
    description: "Track staff performance, credit, and bonuses",
    icon: "👥"
  },
  {
    key: "credit",
    label: "Credit / Due Amount Tracking",
    description: "Track customer credit and due payments",
    icon: "💳"
  },
  {
    key: "discount",
    label: "Discount & Pricing Controls",
    description: "Discount rules, min price lock, and staff pricing controls",
    icon: "🏷️"
  },
  {
    key: "customerTracking",
    label: "Customer Tracking",
    description: "Auto-track customers, rankings, and insights (Pro mode)",
    icon: "📊",
    requireMode: "pro"
  }
];
const DEAD_STOCK_OPTIONS = [
  { label: "3 Months", value: 90 },
  { label: "6 Months", value: 180 },
  { label: "12 Months", value: 365 },
  { label: "Custom Days", value: -1 }
];
function SettingsPage() {
  const { currentShop, currentUser } = useAuth();
  const isOwner = (currentUser == null ? void 0 : currentUser.role) === "owner" || (currentUser == null ? void 0 : currentUser.isOwner) === true;
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
    resetShopData
  } = useStore();
  const visibleFeatures = FEATURE_LIST.filter(
    (f) => !f.requireMode || f.requireMode === autoMode
  );
  const importFileRef = reactExports.useRef(null);
  const [importConfirming, setImportConfirming] = reactExports.useState(false);
  const [pendingImport, setPendingImport] = reactExports.useState(null);
  const [resetStep, setResetStep] = reactExports.useState(
    "idle"
  );
  const [resetInput, setResetInput] = reactExports.useState("");
  const [resetInProgress, setResetInProgress] = reactExports.useState(false);
  async function handleResetConfirm() {
    if (resetInput !== "RESET") return;
    setResetInProgress(true);
    try {
      await resetShopData();
      setResetStep("idle");
      setResetInput("");
      ue.success("All data cleared successfully. Start fresh.", {
        duration: 5e3,
        icon: "✅"
      });
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      ue.error("Reset failed. Please try again.");
    } finally {
      setResetInProgress(false);
    }
  }
  function handleResetCancel() {
    setResetStep("idle");
    setResetInput("");
  }
  const [backupList, setBackupList] = reactExports.useState(
    () => listBackupSnapshots(shopId)
  );
  const [backupRetention, setBackupRetention] = reactExports.useState(
    () => localStorage.getItem(`saveshop_backup_retention_${shopId}`) ?? "30"
  );
  const [creatingBackup, setCreatingBackup] = reactExports.useState(false);
  const [restoreTarget, setRestoreTarget] = reactExports.useState(
    null
  );
  const [restoreOptions, setRestoreOptions] = reactExports.useState({
    products: true,
    customers: true,
    invoices: true,
    payments: true,
    vendors: true,
    batches: true,
    returns: true
  });
  const [restoreConfirming, setRestoreConfirming] = reactExports.useState(false);
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
        returns
      });
      refreshBackupList();
      ue.success("Backup created successfully");
    } catch {
      ue.error("Failed to create backup");
    } finally {
      setCreatingBackup(false);
    }
  };
  const handleDeleteBackup = (id) => {
    deleteBackupSnapshot(shopId, id);
    refreshBackupList();
    ue.success("Backup deleted");
  };
  const handleRetentionChange = (val) => {
    setBackupRetention(val);
    localStorage.setItem(`saveshop_backup_retention_${shopId}`, val);
    if (val === "30") {
      pruneBackups(shopId, 30);
      refreshBackupList();
    }
    ue.success(
      val === "30" ? "Keeping backups for 30 days" : "Keeping all backups"
    );
  };
  const openRestoreDialog = (snapshot) => {
    setRestoreTarget(snapshot);
    setRestoreOptions({
      products: true,
      customers: true,
      invoices: true,
      payments: true,
      vendors: true,
      batches: true,
      returns: true
    });
    setRestoreConfirming(false);
  };
  const handleRestoreConfirm = () => {
    if (!restoreTarget) return;
    const result = restoreFromSnapshot(
      shopId,
      restoreTarget.id,
      restoreOptions
    );
    if (!result) {
      ue.error("Backup data not found — snapshot may be expired");
      setRestoreTarget(null);
      return;
    }
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
    ue.success("Restore complete — reloading data...");
    setTimeout(() => window.location.reload(), 1200);
  };
  function handleExport() {
    const backup = {
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
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
      vendorRateHistory
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    a.download = `saveshop_backup_${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    ue.success("Backup downloaded");
  }
  function handleImportFileChange(e) {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      var _a2;
      try {
        const parsed = JSON.parse((_a2 = ev.target) == null ? void 0 : _a2.result);
        const hasData = parsed.products || parsed.customers || parsed.vendors || parsed.sales;
        if (!hasData) {
          ue.error("Invalid backup file");
          return;
        }
        setPendingImport(parsed);
        setImportConfirming(true);
      } catch {
        ue.error("Invalid backup file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }
  function handleImportConfirm() {
    if (!pendingImport) return;
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
    ue.success("Data restored successfully — please reload the page");
    setTimeout(() => window.location.reload(), 1500);
  }
  function handleImportCancel() {
    setImportConfirming(false);
    setPendingImport(null);
  }
  const [newUnit, setNewUnit] = reactExports.useState("");
  const [newCategory, setNewCategory] = reactExports.useState("");
  const [editingCatId, setEditingCatId] = reactExports.useState(null);
  const [editingCatName, setEditingCatName] = reactExports.useState("");
  const [customDays, setCustomDays] = reactExports.useState(
    String(appConfig.deadStockCustomDays ?? 30)
  );
  const [pinValue, setPinValue] = reactExports.useState(appConfig.ownerPin ?? "");
  const [showPin, setShowPin] = reactExports.useState(false);
  const [pinSaving, setPinSaving] = reactExports.useState(false);
  const isCustomDeadStock = !DEAD_STOCK_OPTIONS.slice(0, 3).find(
    (o) => o.value === appConfig.deadStockThresholdDays
  );
  async function handleFeatureToggle(key, value) {
    var _a;
    await setFeatureFlag(key, value);
    ue.success(
      `${(_a = FEATURE_LIST.find((f) => f.key === key)) == null ? void 0 : _a.label} ${value ? "enabled" : "disabled"}`
    );
  }
  async function handleDashboardSectionToggle(key, value) {
    await setDashboardSection(key, value);
    ue.success(`Dashboard section ${value ? "shown" : "hidden"}`);
  }
  async function handleMixedUnitsToggle(value) {
    await saveAppConfig({ allowMixedUnits: value });
    updateShopSettings({ allowMixedUnits: value });
    ue.success(`Mixed Units Mode ${value ? "enabled" : "disabled"}`);
  }
  async function handleDeadStockPeriod(value) {
    if (value === -1) {
      return;
    }
    await saveAppConfig({
      deadStockThresholdDays: value
    });
    updateShopSettings({ deadStockThresholdDays: value });
    ue.success("Dead Stock period updated");
  }
  async function handleCustomDays() {
    const days = Number.parseInt(customDays, 10);
    if (Number.isNaN(days) || days < 1) {
      ue.error("Please enter a valid number of days");
      return;
    }
    await saveAppConfig({
      deadStockThresholdDays: days,
      deadStockCustomDays: days
    });
    updateShopSettings({
      deadStockThresholdDays: days,
      deadStockCustomDays: days
    });
    ue.success(`Dead Stock period set to ${days} days`);
  }
  async function handleLowPriceModeToggle(value) {
    await saveAppConfig({ allowLowPriceSelling: value });
    ue.success(
      value ? "Warning Mode enabled — sale allowed with warning" : "Lock Mode enabled — sale blocked below min price"
    );
  }
  async function handleSavePin() {
    const trimmed = pinValue.trim();
    if (trimmed.length < 4 || trimmed.length > 6 || !/^\d+$/.test(trimmed)) {
      ue.error("PIN must be 4-6 digits");
      return;
    }
    setPinSaving(true);
    await saveAppConfig({ ownerPin: trimmed });
    setPinSaving(false);
    ue.success("Owner PIN saved");
  }
  function handleAddUnit() {
    const trimmed = newUnit.trim();
    if (!trimmed) return;
    if (shopUnits.some((u) => u.name.toLowerCase() === trimmed.toLowerCase())) {
      ue.error("This unit already exists");
      return;
    }
    addShopUnit(trimmed);
    setNewUnit("");
    ue.success(`Unit "${trimmed}" added`);
  }
  function handleDeleteUnit(id, name) {
    deleteShopUnit(id);
    ue.success(`Unit "${name}" deleted`);
  }
  function handleAddCategory() {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      ue.error("This category already exists");
      return;
    }
    addCategory(trimmed);
    setNewCategory("");
    ue.success(`Category "${trimmed}" added`);
  }
  function handleStartEditCat(id, name) {
    setEditingCatId(id);
    setEditingCatName(name);
  }
  function handleSaveEditCat(id) {
    const trimmed = editingCatName.trim();
    if (!trimmed) return;
    updateCategory(id, trimmed);
    setEditingCatId(null);
    setEditingCatName("");
    ue.success("Category updated");
  }
  function handleDeleteCategory(id, name) {
    deleteCategory(id);
    ue.success(`Category "${name}" deleted`);
  }
  const currentDeadStockValue = isCustomDeadStock ? -1 : appConfig.deadStockThresholdDays;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 md:px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersHorizontal, { className: "w-5 h-5 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-bold text-foreground", children: "App Settings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Manage features and settings for your shop" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-6 max-w-3xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { "data-ocid": "settings.panel", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "w-4 h-4 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "App Settings" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Configure your shop's basic settings" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-3 rounded-lg bg-muted/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Store, { className: "w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "Shop Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: (currentShop == null ? void 0 : currentShop.name) ?? "—" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Allow Mixed Units" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Use both Length (meter) and Weight (kg) together" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Switch,
              {
                "data-ocid": "settings.mixed_units.switch",
                checked: appConfig.allowMixedUnits,
                onCheckedChange: handleMixedUnitsToggle
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Dead Stock Period" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: 'Unsold for this period will be flagged as "Dead Stock"' })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2", children: DEAD_STOCK_OPTIONS.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                "data-ocid": "settings.dead_stock_period.button",
                onClick: () => handleDeadStockPeriod(opt.value),
                className: `px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${opt.value === currentDeadStockValue ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:bg-muted"}`,
                children: opt.label
              },
              opt.value
            )) }),
            (isCustomDeadStock || currentDeadStockValue === -1) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  "data-ocid": "settings.custom_days.input",
                  type: "number",
                  min: "1",
                  placeholder: "Enter number of days",
                  value: customDays,
                  onChange: (e) => setCustomDays(e.target.value),
                  className: "max-w-[180px] h-8 text-sm"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  onClick: handleCustomDays,
                  "data-ocid": "settings.custom_days.save_button",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3.5 h-3.5 mr-1" }),
                    " Save"
                  ]
                }
              )
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { "data-ocid": "settings.feature_control.panel", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-4 h-4 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Feature Control" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Enable or disable features — your data is never deleted" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-700 dark:text-blue-300", children: "Disabling a feature only hides the UI — your data is never deleted. You can re-enable any feature later without data loss." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: visibleFeatures.map((feature, idx) => {
            const enabled = featureFlags[feature.key];
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                "data-ocid": `settings.feature.item.${idx + 1}`,
                className: "flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg flex-shrink-0 mt-0.5", children: feature.icon }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: feature.label }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Badge,
                          {
                            variant: enabled ? "default" : "secondary",
                            className: `text-xs px-1.5 py-0 ${enabled ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800" : "bg-muted text-muted-foreground"}`,
                            children: enabled ? "Enabled" : "Disabled"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: feature.description })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Switch,
                    {
                      "data-ocid": `settings.feature.switch.${idx + 1}`,
                      checked: enabled,
                      onCheckedChange: (val) => handleFeatureToggle(feature.key, val),
                      className: "ml-3 flex-shrink-0"
                    }
                  )
                ]
              },
              feature.key
            );
          }) })
        ] })
      ] }),
      isOwner && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { "data-ocid": "settings.dashboard_sections.panel", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { className: "w-4 h-4 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Dashboard Settings" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Choose which sections to show on your dashboard. Hidden sections still update in the background." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-700 dark:text-blue-300", children: "Hiding a section only removes it from view — data continues to update in the background. Turn it back on anytime." })
          ] }),
          [
            {
              group: "Overview",
              items: [
                {
                  key: "marqueeAlertBar",
                  icon: "📢",
                  label: "Marquee Alert Bar",
                  description: "Scrolling ticker with live messages"
                },
                {
                  key: "adBannerCarousel",
                  icon: "🎠",
                  label: "Ad Banner Carousel",
                  description: "Promotional banner slideshow"
                },
                {
                  key: "quickActions",
                  icon: "⚡",
                  label: "Quick Actions",
                  description: "Shortcut buttons for common actions"
                },
                {
                  key: "smartFilterBar",
                  icon: "🔽",
                  label: "Smart Filter Bar",
                  description: "Quick filters for Dead Stock, Low Stock etc."
                }
              ]
            },
            {
              group: "Analytics",
              items: [
                {
                  key: "todaySummary",
                  icon: "📊",
                  label: "Today's Summary",
                  description: "Total sales, profit, cash/UPI breakdown"
                },
                {
                  key: "topPerformance",
                  icon: "⭐",
                  label: "Top Performance Card",
                  description: "Top selling product, customer, vendor"
                },
                {
                  key: "smartAlerts",
                  icon: "🚨",
                  label: "Smart Alerts",
                  description: "Low stock, out of stock, customer due alerts"
                },
                {
                  key: "smartInsights",
                  icon: "💡",
                  label: "Smart Insights",
                  description: "Most selling, high profit, low price attempt insights"
                },
                {
                  key: "smartInsightsCards",
                  icon: "🃏",
                  label: "Smart Insights Cards",
                  description: "Compact horizontal insights cards"
                }
              ]
            },
            {
              group: "Inventory & Finance",
              items: [
                {
                  key: "productsList",
                  icon: "📦",
                  label: "Products List",
                  description: "Products ranked by sales"
                },
                {
                  key: "stockControl",
                  icon: "🏷️",
                  label: "Stock Control",
                  description: "Low stock, out of stock, slow moving counts"
                },
                {
                  key: "inventoryHealth",
                  icon: "🩺",
                  label: "Inventory Health",
                  description: "Expiry alerts and dead stock trends"
                },
                {
                  key: "customerDue",
                  icon: "💳",
                  label: "Customer Due",
                  description: "Customers with pending payments"
                },
                {
                  key: "pendingOrders",
                  icon: "🛒",
                  label: "Pending Orders",
                  description: "Vendor and customer orders awaiting action"
                }
              ]
            },
            {
              group: "Rewards & Activity",
              items: [
                {
                  key: "diamondRewards",
                  icon: "💎",
                  label: "Diamond Rewards",
                  description: "Your diamond count and progress"
                },
                {
                  key: "recentActivity",
                  icon: "🕐",
                  label: "Recent Activity Feed",
                  description: "Last 10 transactions"
                },
                {
                  key: "tutorialGuide",
                  icon: "🎓",
                  label: "Tutorial Guide",
                  description: "App tutorial cards"
                },
                {
                  key: "sponsoredAd",
                  icon: "📣",
                  label: "Sponsored Ad",
                  description: "Sponsored partner card"
                }
              ]
            },
            {
              group: "PRO Features",
              items: [
                {
                  key: "customerInsights",
                  icon: "🔮",
                  label: "Customer Insights",
                  description: "Top customers, inactive, lost & high pending (PRO + Customer Tracking required)"
                }
              ]
            }
          ].map((section, gIdx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: gIdx > 0 ? "mt-4" : "", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1", children: section.group }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: section.items.map((item, idx) => {
              var _a;
              const enabled = ((_a = appConfig.dashboardSections) == null ? void 0 : _a[item.key]) !== false;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  "data-ocid": `settings.dashboard.item.${gIdx * 10 + idx + 1}`,
                  className: "flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 flex-1 min-w-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg flex-shrink-0 mt-0.5", children: item.icon }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: item.label }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Badge,
                            {
                              variant: enabled ? "default" : "secondary",
                              className: `text-xs px-1.5 py-0 ${enabled ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800" : "bg-muted text-muted-foreground"}`,
                              children: enabled ? "Visible" : "Hidden"
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: item.description })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Switch,
                      {
                        "data-ocid": `settings.dashboard.switch.${gIdx * 10 + idx + 1}`,
                        checked: enabled,
                        onCheckedChange: (val) => handleDashboardSectionToggle(item.key, val),
                        className: "ml-3 flex-shrink-0"
                      }
                    )
                  ]
                },
                item.key
              );
            }) })
          ] }, section.group))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { "data-ocid": "settings.units.panel", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-4 h-4 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Manage Units" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Add or delete measurement units for your shop" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                "data-ocid": "settings.unit.input",
                placeholder: "Add new unit (e.g. kg, meter, piece)",
                value: newUnit,
                onChange: (e) => setNewUnit(e.target.value),
                onKeyDown: (e) => {
                  if (e.key === "Enter") handleAddUnit();
                },
                className: "h-9 text-sm"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                onClick: handleAddUnit,
                disabled: !newUnit.trim(),
                "data-ocid": "settings.unit.add_button",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
                  " Add"
                ]
              }
            )
          ] }),
          shopUnits.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "text-center py-6 text-muted-foreground text-sm",
              "data-ocid": "settings.units.empty_state",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-8 h-8 mx-auto mb-2 opacity-30" }),
                "No units added yet"
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: shopUnits.map((unit, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              "data-ocid": `settings.unit.item.${idx + 1}`,
              className: "flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-muted/20",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: unit.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    "data-ocid": `settings.unit.delete_button.${idx + 1}`,
                    onClick: () => handleDeleteUnit(unit.id, unit.name),
                    className: "p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
                    title: `Delete ${unit.name}`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
                  }
                )
              ]
            },
            unit.id
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { "data-ocid": "settings.categories.panel", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "w-4 h-4 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Manage Categories" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Add, edit, or delete product categories" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                "data-ocid": "settings.category.input",
                placeholder: "Add new category (e.g. Electronics, Food)",
                value: newCategory,
                onChange: (e) => setNewCategory(e.target.value),
                onKeyDown: (e) => {
                  if (e.key === "Enter") handleAddCategory();
                },
                className: "h-9 text-sm"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                onClick: handleAddCategory,
                disabled: !newCategory.trim(),
                "data-ocid": "settings.category.add_button",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
                  " Add"
                ]
              }
            )
          ] }),
          categories.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "text-center py-6 text-muted-foreground text-sm",
              "data-ocid": "settings.categories.empty_state",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "w-8 h-8 mx-auto mb-2 opacity-30" }),
                "No categories added yet"
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: categories.map((cat, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              "data-ocid": `settings.category.item.${idx + 1}`,
              className: "flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border bg-muted/20",
              children: editingCatId === cat.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    "data-ocid": "settings.category.edit.input",
                    value: editingCatName,
                    onChange: (e) => setEditingCatName(e.target.value),
                    onKeyDown: (e) => {
                      if (e.key === "Enter") handleSaveEditCat(cat.id);
                      if (e.key === "Escape") setEditingCatId(null);
                    },
                    className: "h-7 text-sm flex-1",
                    autoFocus: true
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    "data-ocid": `settings.category.save_button.${idx + 1}`,
                    onClick: () => handleSaveEditCat(cat.id),
                    className: "p-1 rounded-md text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3.5 h-3.5" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setEditingCatId(null),
                    className: "p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" })
                  }
                )
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium flex-1", children: cat.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      "data-ocid": `settings.category.edit_button.${idx + 1}`,
                      onClick: () => handleStartEditCat(cat.id, cat.name),
                      className: "p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors",
                      title: "Edit category",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      "data-ocid": `settings.category.delete_button.${idx + 1}`,
                      onClick: () => handleDeleteCategory(cat.id, cat.name),
                      className: "p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
                      title: "Delete category",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
                    }
                  )
                ] })
              ] })
            },
            cat.id
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { "data-ocid": "settings.low_price_control.panel", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "w-4 h-4 text-red-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Low Price Selling Control" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Prevent staff from selling below the minimum profit price" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Allow Low Price Selling" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "ON = Warning Mode (sale allow with warning)  |  OFF = Lock Mode (sale block)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: appConfig.allowLowPriceSelling ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-amber-100 text-amber-700 border-amber-300 border text-xs", children: "⚠️ Warning Mode" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-red-100 text-red-700 border-red-300 border text-xs", children: "🔒 Lock Mode" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Switch,
              {
                "data-ocid": "settings.allow_low_price_selling.switch",
                checked: !!appConfig.allowLowPriceSelling,
                onCheckedChange: handleLowPriceModeToggle
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm font-medium flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-3.5 h-3.5" }),
              "Owner Override PIN (4-6 digits)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "In Lock Mode, staff can request override approval using this PIN" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 max-w-[200px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    "data-ocid": "settings.owner_pin.input",
                    type: showPin ? "text" : "password",
                    placeholder: "Enter PIN",
                    value: pinValue,
                    onChange: (e) => setPinValue(e.target.value),
                    maxLength: 6,
                    className: "pr-9 h-9 text-sm"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setShowPin((v) => !v),
                    className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
                    title: showPin ? "Hide PIN" : "Show PIN",
                    children: showPin ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  onClick: handleSavePin,
                  disabled: pinSaving || !pinValue.trim(),
                  "data-ocid": "settings.owner_pin.save_button",
                  children: pinSaving ? "Saving..." : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3.5 h-3.5 mr-1" }),
                    " Save PIN"
                  ] })
                }
              )
            ] }),
            appConfig.ownerPin && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-600 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3 h-3" }),
              " PIN is set"
            ] })
          ] })
        ] })
      ] }),
      isOwner && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { "data-ocid": "settings.staff_reminder_control.panel", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-4 h-4 text-blue-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Staff Reminder Control" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Control the WhatsApp reminder system for staff" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Allow Staff Reminders" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "When ON, staff can send or request customer reminders" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: appConfig.allowStaffReminders ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-100 text-green-700 border-green-300 border text-xs", children: "✅ Staff Reminders Enabled" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-muted text-muted-foreground text-xs", children: "🚫 Staff Reminders Disabled" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Switch,
              {
                "data-ocid": "settings.allow_staff_reminders.switch",
                checked: !!appConfig.allowStaffReminders,
                onCheckedChange: async (val) => {
                  await saveAppConfig({
                    allowStaffReminders: val
                  });
                  ue.success(
                    `Staff reminders ${val ? "enabled" : "disabled"}`
                  );
                }
              }
            )
          ] }),
          appConfig.allowStaffReminders && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Reminder Mode" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    "data-ocid": "settings.staff_reminder_mode.approval",
                    onClick: async () => {
                      await saveAppConfig({
                        staffReminderMode: "approval"
                      });
                      ue.success("Approval Mode activated");
                    },
                    className: `flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${(appConfig.staffReminderMode ?? "approval") === "approval" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: `mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${(appConfig.staffReminderMode ?? "approval") === "approval" ? "border-primary" : "border-muted-foreground"}`,
                          children: (appConfig.staffReminderMode ?? "approval") === "approval" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2 h-2 rounded-full bg-primary" })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: "Approval Mode (Default)" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Staff sends request → Owner/Manager approves → WhatsApp sent" })
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    "data-ocid": "settings.staff_reminder_mode.simple",
                    onClick: async () => {
                      await saveAppConfig({
                        staffReminderMode: "simple"
                      });
                      ue.success("Simple Mode activated");
                    },
                    className: `flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${appConfig.staffReminderMode === "simple" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: `mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${appConfig.staffReminderMode === "simple" ? "border-primary" : "border-muted-foreground"}`,
                          children: appConfig.staffReminderMode === "simple" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2 h-2 rounded-full bg-primary" })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: "Simple Mode" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Staff can send directly — max 2 reminders per customer per day" })
                      ] })
                    ]
                  }
                )
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-amber-800 dark:text-amber-300", children: "Data Safety" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700 dark:text-amber-400 mt-0.5", children: "Changing any setting will not delete existing data. Disabling features only hides the UI — data is always safe. New features can be added later without removing existing data." })
        ] })
      ] }),
      isOwner && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Card,
        {
          "data-ocid": "settings.danger_zone.panel",
          className: "border-destructive/40",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-destructive" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base text-destructive", children: "Danger Zone" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Irreversible actions — proceed with caution" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-xl border border-destructive/30 bg-destructive/5 space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4 text-destructive mt-0.5 flex-shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: "Reset All Shop Data" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
                    "Permanently delete all products, sales, customers, vendors, batches, and history for",
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: (currentShop == null ? void 0 : currentShop.name) ?? "this shop" }),
                    ". Other shops are not affected."
                  ] })
                ] })
              ] }),
              resetStep === "idle" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "destructive",
                  size: "sm",
                  onClick: () => setResetStep("confirm1"),
                  "data-ocid": "settings.reset_shop.open_modal_button",
                  className: "w-full sm:w-auto",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 mr-1.5" }),
                    "Reset All Data"
                  ]
                }
              ),
              resetStep === "confirm1" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "space-y-3",
                  "data-ocid": "settings.reset_shop.dialog",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/40", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-destructive mt-0.5 flex-shrink-0" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-destructive", children: "Are you sure? This will permanently delete ALL data for this shop — products, sales, customers, vendors, staff records, and all history. This cannot be undone." })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Button,
                        {
                          size: "sm",
                          variant: "outline",
                          onClick: handleResetCancel,
                          "data-ocid": "settings.reset_shop.cancel_button",
                          className: "flex-1",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5 mr-1" }),
                            " Cancel"
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          size: "sm",
                          variant: "destructive",
                          onClick: () => setResetStep("confirm2"),
                          "data-ocid": "settings.reset_shop.confirm_button",
                          className: "flex-1",
                          children: "Continue"
                        }
                      )
                    ] })
                  ]
                }
              ),
              resetStep === "confirm2" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "space-y-3",
                  "data-ocid": "settings.reset_shop.dialog",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/40", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-destructive mt-0.5 flex-shrink-0" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-destructive", children: "Final confirmation — this action is irreversible." })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Label,
                        {
                          htmlFor: "reset-confirm-input",
                          className: "text-sm font-medium text-foreground",
                          children: [
                            "Type",
                            " ",
                            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-mono text-xs font-bold", children: "RESET" }),
                            " ",
                            "to confirm"
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          id: "reset-confirm-input",
                          "data-ocid": "settings.reset_shop.input",
                          value: resetInput,
                          onChange: (e) => setResetInput(e.target.value),
                          placeholder: "Type RESET here",
                          className: "h-9 text-sm font-mono",
                          autoComplete: "off",
                          autoCorrect: "off",
                          autoCapitalize: "off",
                          spellCheck: false
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Case-sensitive — must be all uppercase: RESET" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Button,
                        {
                          size: "sm",
                          variant: "outline",
                          onClick: handleResetCancel,
                          disabled: resetInProgress,
                          "data-ocid": "settings.reset_shop.cancel_button",
                          className: "flex-1",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5 mr-1" }),
                            " Cancel"
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          size: "sm",
                          variant: "destructive",
                          onClick: handleResetConfirm,
                          disabled: resetInput !== "RESET" || resetInProgress,
                          "data-ocid": "settings.reset_shop.submit_button",
                          className: "flex-1",
                          children: resetInProgress ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-3.5 h-3.5 mr-1.5 animate-spin" }),
                            "Resetting…"
                          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 mr-1.5" }),
                            "Reset"
                          ] })
                        }
                      )
                    ] })
                  ]
                }
              )
            ] }) })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { "data-ocid": "settings.backup_restore.panel", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Backup & Restore" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Export and import your data" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
          importConfirming && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg border border-destructive/40 bg-destructive/5 space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 text-destructive mt-0.5 flex-shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-destructive", children: "This action will overwrite existing data. Are you sure?" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  variant: "destructive",
                  onClick: handleImportConfirm,
                  "data-ocid": "settings.import.confirm_button",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3.5 h-3.5 mr-1" }),
                    " Yes, Restore"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  onClick: handleImportCancel,
                  "data-ocid": "settings.import.cancel_button",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5 mr-1" }),
                    " Cancel"
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "default",
                size: "sm",
                onClick: handleExport,
                "data-ocid": "settings.export.button",
                className: "flex items-center gap-2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4" }),
                  "Export Data (JSON)"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: () => {
                  var _a;
                  return (_a = importFileRef.current) == null ? void 0 : _a.click();
                },
                "data-ocid": "settings.import.button",
                className: "flex items-center gap-2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-4 h-4" }),
                  "Import Data (JSON)"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                ref: importFileRef,
                type: "file",
                accept: ".json",
                className: "hidden",
                onChange: handleImportFileChange,
                "data-ocid": "settings.import.file_input"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Export: Downloads a JSON backup file  |  Import: Restores data from a backup file" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700 dark:text-amber-400", children: "Importing will overwrite existing data. Please export first as a backup." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 py-4 px-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-4 h-4 text-green-600 flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-700 dark:text-green-400 text-center", children: "🔒 Your data is safely stored in ICP cloud and browser storage — it is never deleted" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { "data-ocid": "settings.data_backup.panel", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4 text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Data Backup & Restore" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "default",
                onClick: handleCreateBackup,
                disabled: creatingBackup,
                "data-ocid": "settings.backup.create_button",
                className: "flex items-center gap-1.5 h-8 text-xs",
                children: [
                  creatingBackup ? /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 12, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 12 }),
                  creatingBackup ? "Saving…" : "Backup Now"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Create snapshots and restore data to any point in time" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "Backup Retention" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "How long to keep backups" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 rounded-lg border border-border bg-secondary p-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  "data-ocid": "settings.backup.retention_30",
                  onClick: () => handleRetentionChange("30"),
                  className: `px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${backupRetention === "30" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`,
                  children: "30 Days"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  "data-ocid": "settings.backup.retention_unlimited",
                  onClick: () => handleRetentionChange("unlimited"),
                  className: `px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${backupRetention === "unlimited" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`,
                  children: "Unlimited"
                }
              )
            ] })
          ] }),
          backupList.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex flex-col items-center gap-2 py-6 text-center",
              "data-ocid": "settings.backup.empty_state",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 24, className: "text-muted-foreground/40" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No backups yet" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/70", children: 'Click "Backup Now" to create your first snapshot' })
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", "data-ocid": "settings.backup.list", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: [
              "Backup History (",
              backupList.length,
              ")"
            ] }),
            backupList.map((snap, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                "data-ocid": `settings.backup.item.${idx + 1}`,
                className: "flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-foreground", children: new Date(snap.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground mt-0.5", children: [
                      snap.collections.products,
                      " products ·",
                      " ",
                      snap.collections.customers,
                      " customers ·",
                      " ",
                      snap.collections.invoices,
                      " sales ·",
                      " ",
                      snap.collections.vendors,
                      " vendors"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        size: "sm",
                        variant: "outline",
                        onClick: () => openRestoreDialog(snap),
                        "data-ocid": `settings.backup.restore_button.${idx + 1}`,
                        className: "h-7 px-2 text-xs",
                        children: "Restore"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        "data-ocid": `settings.backup.delete_button.${idx + 1}`,
                        onClick: () => handleDeleteBackup(snap.id),
                        className: "w-7 h-7 flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors",
                        title: "Delete backup",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12 })
                      }
                    )
                  ] })
                ]
              },
              snap.id
            ))
          ] })
        ] })
      ] }),
      restoreTarget && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "fixed inset-0 z-[100] flex items-center justify-center p-4",
          "data-ocid": "settings.restore.dialog",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "absolute inset-0 bg-black/50 backdrop-blur-sm",
                onClick: () => setRestoreTarget(null),
                onKeyDown: (e) => e.key === "Escape" && setRestoreTarget(null),
                role: "presentation"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative bg-card border border-border rounded-2xl shadow-xl p-6 w-full max-w-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-base text-foreground", children: "Restore Backup" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    "data-ocid": "settings.restore.close_button",
                    onClick: () => setRestoreTarget(null),
                    className: "w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted text-lg leading-none",
                    children: "×"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mb-4", children: [
                "From:",
                " ",
                new Date(restoreTarget.createdAt).toLocaleString("en-IN")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3 pb-3 border-b border-border", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Checkbox,
                  {
                    id: "restore-all",
                    "data-ocid": "settings.restore.all_checkbox",
                    checked: Object.values(restoreOptions).every(Boolean),
                    onCheckedChange: (checked) => setRestoreOptions({
                      products: !!checked,
                      customers: !!checked,
                      invoices: !!checked,
                      payments: !!checked,
                      vendors: !!checked,
                      batches: !!checked,
                      returns: !!checked
                    })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "label",
                  {
                    htmlFor: "restore-all",
                    className: "text-sm font-semibold text-foreground cursor-pointer",
                    children: "Restore All"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 mb-5", children: [
                {
                  key: "products",
                  label: "Products",
                  count: restoreTarget.collections.products
                },
                {
                  key: "customers",
                  label: "Customers",
                  count: restoreTarget.collections.customers
                },
                {
                  key: "invoices",
                  label: "Sales",
                  count: restoreTarget.collections.invoices
                },
                {
                  key: "payments",
                  label: "Payments",
                  count: restoreTarget.collections.payments
                },
                {
                  key: "vendors",
                  label: "Vendors",
                  count: restoreTarget.collections.vendors
                },
                {
                  key: "batches",
                  label: "Batches",
                  count: restoreTarget.collections.batches
                },
                {
                  key: "returns",
                  label: "Returns",
                  count: restoreTarget.collections.returns
                }
              ].map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Checkbox,
                  {
                    id: `restore-${opt.key}`,
                    "data-ocid": `settings.restore.${opt.key}_checkbox`,
                    checked: restoreOptions[opt.key],
                    onCheckedChange: (checked) => setRestoreOptions((prev) => ({
                      ...prev,
                      [opt.key]: !!checked
                    }))
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "label",
                  {
                    htmlFor: `restore-${opt.key}`,
                    className: "text-sm text-foreground flex-1 cursor-pointer",
                    children: opt.label
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Badge,
                  {
                    variant: "secondary",
                    className: "text-[10px] h-4 px-1.5",
                    children: opt.count
                  }
                )
              ] }, opt.key)) }),
              !restoreConfirming ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 mb-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700 dark:text-amber-400", children: "This will overwrite current data for selected collections. App will reload after restore." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "outline",
                      size: "sm",
                      onClick: () => setRestoreTarget(null),
                      "data-ocid": "settings.restore.cancel_button",
                      className: "flex-1",
                      children: "Cancel"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      size: "sm",
                      variant: "destructive",
                      onClick: () => setRestoreConfirming(true),
                      "data-ocid": "settings.restore.proceed_button",
                      className: "flex-1",
                      disabled: !Object.values(restoreOptions).some(Boolean),
                      children: "Restore Selected"
                    }
                  )
                ] })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-destructive mb-3", children: "Are you sure? This cannot be undone." }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "outline",
                      size: "sm",
                      onClick: () => setRestoreConfirming(false),
                      "data-ocid": "settings.restore.back_button",
                      className: "flex-1",
                      children: "Go Back"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      size: "sm",
                      variant: "destructive",
                      onClick: handleRestoreConfirm,
                      "data-ocid": "settings.restore.confirm_button",
                      className: "flex-1",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 12, className: "mr-1" }),
                        " Confirm Restore"
                      ]
                    }
                  )
                ] })
              ] })
            ] })
          ]
        }
      )
    ] })
  ] });
}
export {
  SettingsPage
};
