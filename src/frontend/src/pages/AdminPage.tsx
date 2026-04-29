import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Bug,
  Calculator,
  CheckCircle,
  Clock,
  Lightbulb,
  Lock,
  MessageSquare,
  Pencil,
  Plus,
  Ruler,
  Settings,
  ShieldOff,
  ShoppingCart,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import type { AppUser, FeedbackType, Product } from "../types/store";
import { ROLE_PERMISSIONS } from "../types/store";
import { clearLeadingZeros } from "../utils/numberInput";

export function AdminPage() {
  const { currentUser } = useAuth();
  const role = currentUser?.role ?? "staff";

  if (role === "staff") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <Card
            data-ocid="admin.denied.card"
            className="w-full max-w-sm shadow-card border-border text-center"
          >
            <CardHeader>
              <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
                <ShieldOff size={24} className="text-destructive" />
              </div>
              <CardTitle className="text-destructive">Access Denied</CardTitle>
              <p className="text-muted-foreground text-sm mt-1">
                You do not have Admin Panel access.
                <br />
                Only Owner and Manager can access this page.
              </p>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return <AdminPanelContent role={role} />;
}

function AdminPanelContent({ role }: { role: string }) {
  const isOwner = role === "owner";
  const canManageStaff = ROLE_PERMISSIONS.canManageStaff(
    role as "owner" | "manager" | "staff",
  );
  const canChangeSettings = ROLE_PERMISSIONS.canChangeSettings(
    role as "owner" | "manager" | "staff",
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="px-4 md:px-6 pb-6 flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground text-sm">
            Manage products, categories, units
            {isOwner ? ", users, and settings" : ""}
          </p>
          {!isOwner && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium border border-border">
              <ShieldOff size={12} />
              Manager View — Limited Access
            </div>
          )}
        </div>

        <Tabs defaultValue="products">
          <TabsList
            data-ocid="admin.tab"
            className="mb-4 flex-wrap h-auto gap-1"
          >
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="units">Units</TabsTrigger>
            {canManageStaff && <TabsTrigger value="users">Users</TabsTrigger>}
            {isOwner && (
              <TabsTrigger value="feedback" data-ocid="admin.tab.feedback">
                <MessageSquare size={12} className="mr-1" /> Feedback
              </TabsTrigger>
            )}
            {canChangeSettings && (
              <TabsTrigger value="settings">
                <Settings size={12} className="mr-1" /> Settings
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="products">
            <ProductsManager canDelete={isOwner} />
          </TabsContent>
          <TabsContent value="categories">
            <CategoriesManager />
          </TabsContent>
          <TabsContent value="units">
            <UnitsManager />
          </TabsContent>
          {canManageStaff && (
            <TabsContent value="users">
              <UsersManager />
            </TabsContent>
          )}
          {isOwner && (
            <TabsContent value="feedback">
              <FeedbackManager />
            </TabsContent>
          )}
          {canChangeSettings && (
            <TabsContent value="settings">
              <SettingsManager />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

// ── Settings Manager ──────────────────────────────────────────────────
function SettingsManager() {
  const { shopSettings, updateShopSettings, appConfig, saveAppConfig } =
    useStore();

  return (
    <div className="flex flex-col gap-4 max-w-lg">
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-foreground">
            <Ruler size={16} className="text-primary" />
            Unit Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-secondary/50 border border-border">
            <div className="flex-1">
              <Label
                htmlFor="mixed-units-toggle"
                className="text-sm font-semibold cursor-pointer text-foreground"
              >
                Allow Mixed Units (Length + Weight)
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Enable to store both Length and Weight for a single product.
              </p>
              {shopSettings.allowMixedUnits && (
                <div className="mt-2 text-xs text-primary font-medium">
                  Mixed Unit Mode is ON
                </div>
              )}
            </div>
            <Switch
              id="mixed-units-toggle"
              data-ocid="admin.settings.mixed_units.toggle"
              checked={shopSettings.allowMixedUnits}
              onCheckedChange={(checked) =>
                updateShopSettings({ allowMixedUnits: checked })
              }
            />
          </div>

          {shopSettings.allowMixedUnits && (
            <div className="p-3 rounded-lg border border-border bg-secondary/30 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">
                What does Mixed Unit Mode do?
              </p>
              <p>• When adding a product you can set both Length + Weight</p>
              <p>• Example: 1 Pipe = 6 meter = 15 kg</p>
              <p>• Set Smart Ratio — it will auto-calculate</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-foreground">
            <Settings size={16} className="text-primary" />
            Vendor Rate Settings
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Vendor rate change behavior control
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-secondary/50 border border-border">
            <div className="flex-1">
              <Label
                htmlFor="auto-cost-update-toggle"
                className="text-sm font-semibold cursor-pointer text-foreground"
              >
                Auto Update Product Cost on Rate Change
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                ON: Product cost price will be automatically updated when vendor
                rate changes.
              </p>
              <p className="text-xs text-muted-foreground">
                OFF: A confirmation dialog will appear — you can decide.
              </p>
            </div>
            <Switch
              id="auto-cost-update-toggle"
              data-ocid="admin.settings.auto_cost_update.toggle"
              checked={appConfig.autoUpdateCostOnVendorRateChange ?? false}
              onCheckedChange={(checked) =>
                saveAppConfig({ autoUpdateCostOnVendorRateChange: checked })
              }
            />
          </div>

          <div className="p-3 rounded-lg border border-border bg-secondary/30 text-xs space-y-1">
            <p className="font-semibold text-foreground">Vendor Rate History</p>
            <p className="text-muted-foreground">
              • Every rate change will be automatically recorded
            </p>
            <p className="text-muted-foreground">
              • View full rate history from the Vendors page via the "Rate
              History" button
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-border mt-4">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-foreground">
            <Clock size={16} className="text-primary" />
            Dead Stock Settings
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            How many days without a sale before a product is considered "Dead
            Stock"
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={
              [90, 180, 365].includes(shopSettings.deadStockThresholdDays ?? 90)
                ? String(shopSettings.deadStockThresholdDays ?? 90)
                : "custom"
            }
            onValueChange={(val) => {
              if (val === "custom") {
                updateShopSettings({
                  deadStockThresholdDays:
                    shopSettings.deadStockCustomDays ?? 90,
                });
              } else {
                updateShopSettings({ deadStockThresholdDays: Number(val) });
              }
            }}
            className="space-y-2"
          >
            {[
              { label: "3 Months (90 days)", value: "90" },
              { label: "6 Months (180 days)", value: "180" },
              { label: "12 Months (365 days)", value: "365" },
              { label: "Custom Days", value: "custom" },
            ].map((opt) => (
              <div
                key={opt.value}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer"
              >
                <RadioGroupItem
                  value={opt.value}
                  id={`ds-${opt.value}`}
                  data-ocid={`admin.dead_stock.radio.${opt.value}`}
                />
                <Label
                  htmlFor={`ds-${opt.value}`}
                  className="cursor-pointer text-sm font-medium text-foreground"
                >
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {![90, 180, 365].includes(
            shopSettings.deadStockThresholdDays ?? 90,
          ) && (
            <div className="flex items-center gap-3 mt-2">
              <Label className="text-sm whitespace-nowrap text-foreground">
                Custom Days:
              </Label>
              <Input
                type="number"
                min={1}
                max={3650}
                className="w-32"
                data-ocid="admin.dead_stock.custom_days.input"
                value={
                  shopSettings.deadStockCustomDays ??
                  shopSettings.deadStockThresholdDays ??
                  90
                }
                onChange={(e) => {
                  const days = Number(clearLeadingZeros(e.target.value));
                  updateShopSettings({
                    deadStockThresholdDays: days,
                    deadStockCustomDays: days,
                  });
                }}
                onFocus={(e) => {
                  if (e.target.value === "0") e.target.select();
                }}
                placeholder="e.g. 45"
              />
              <span className="text-xs text-muted-foreground">days</span>
            </div>
          )}

          <div className="p-3 rounded-lg border border-border bg-secondary/30 text-xs space-y-1">
            <p className="font-semibold text-foreground">
              Dead Stock Thresholds
            </p>
            <p className="text-muted-foreground">
              • Slow:{" "}
              {Math.round((shopSettings.deadStockThresholdDays ?? 90) / 2)} days
              since last sale
            </p>
            <p className="text-muted-foreground">
              • Dead: {shopSettings.deadStockThresholdDays ?? 90} days since
              last sale
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Form Section Helper ───────────────────────────────────────────────────────
type SectionColor =
  | "blue"
  | "indigo"
  | "orange"
  | "slate"
  | "green"
  | "emerald"
  | "amber";

function FormSection({
  icon,
  label,
  bgHint,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  color?: SectionColor;
  bgHint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border last:border-b-0">
      <div className="flex items-center gap-2 px-5 py-2.5 bg-secondary/40">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {bgHint && (
          <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
            <Lock size={9} /> {bgHint}
          </span>
        )}
      </div>
      <div className="px-5 py-4 space-y-3">{children}</div>
    </div>
  );
}

// ── Auto-calculated read-only field ──────────────────────────────────────────
function AutoCalcField({
  ocid,
  label,
  value,
  sub,
  accent,
}: {
  ocid: string;
  label: string;
  value: string;
  sub?: string;
  accent?: "blue" | "green";
}) {
  return (
    <div
      data-ocid={ocid}
      className={`flex flex-col gap-1 rounded-lg border px-3 py-2.5 ${
        accent === "green"
          ? "bg-green-50 border-green-200"
          : accent === "blue"
            ? "bg-blue-50 border-blue-200"
            : "bg-muted/40 border-dashed border-border"
      }`}
    >
      <div className="flex items-center gap-1.5">
        <Lock size={10} className="text-muted-foreground" />
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
          {label}
        </span>
      </div>
      <span
        className={`text-base font-bold ${
          accent === "green"
            ? "text-green-700"
            : accent === "blue"
              ? "text-blue-700"
              : "text-foreground"
        }`}
      >
        {value}
      </span>
      {sub && (
        <span className="text-[10px] text-muted-foreground leading-tight">
          {sub}
        </span>
      )}
    </div>
  );
}

// ── Products Manager ──────────────────────────────────────────────────────────
function ProductsManager({ canDelete }: { canDelete: boolean }) {
  const {
    products,
    categories,
    shopUnits,
    shopSettings,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    addStockIn,
    getProductCostPrice,
    getProductProfit,
    getProductProfitPct,
  } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const [name, setName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [unit, setUnit] = useState("");
  const [minStock, setMinStock] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [profitPercent, setProfitPercent] = useState("");
  const [minProfitPct, setMinProfitPct] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [initialQty, setInitialQty] = useState("");
  const [details, setDetails] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [invoiceNo, setInvoiceNo] = useState("");
  const [billNo, setBillNo] = useState("");
  const [transportCharge, setTransportCharge] = useState("");
  const [labourCharge, setLabourCharge] = useState("");
  const [otherCharge, setOtherCharge] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [retailerPrice, setRetailerPrice] = useState("");
  const [wholesalerPrice, setWholesalerPrice] = useState("");

  // ── Mix Unit Mode ──
  const [unitMode, setUnitMode] = useState<"single" | "mixed">("single");
  const [lengthUnit, setLengthUnit] = useState("");
  const [weightUnit, setWeightUnit] = useState("");
  const [meterToKgRatio, setMeterToKgRatio] = useState("");

  // ── Selling mode toggle: "profit" = edit profit%, "price" = edit sell price ──
  const [sellingMode, setSellingMode] = useState<"profit" | "price">("profit");

  const resetForm = () => {
    setName("");
    setCategoryName("");
    setUnit("");
    setMinStock("");
    setSellPrice("");
    setCostPrice("");
    setProfitPercent("");
    setMinProfitPct("");
    setVendorName("");
    setPurchasePrice("");
    setInitialQty("");
    setDetails("");
    setPurchaseDate(new Date().toISOString().slice(0, 10));
    setInvoiceNo("");
    setBillNo("");
    setTransportCharge("");
    setLabourCharge("");
    setOtherCharge("");
    setExpiryDate("");
    setRetailerPrice("");
    setWholesalerPrice("");
    setUnitMode("single");
    setLengthUnit("");
    setWeightUnit("");
    setMeterToKgRatio("");
    setSellingMode("profit");
  };

  const openAdd = () => {
    setEditProduct(null);
    resetForm();
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setName(p.name);
    const cat = categories.find((c) => c.id === p.categoryId);
    setCategoryName(cat?.name ?? "");
    setUnit(p.unit);
    setMinStock(String(p.minStockAlert));
    setSellPrice(String(p.sellingPrice));
    setCostPrice(p.costPrice != null ? String(p.costPrice) : "");
    setMinProfitPct(p.minProfitPct != null ? String(p.minProfitPct) : "");
    if (p.purchasePrice != null && p.purchasePrice > 0) {
      const pp = ((p.sellingPrice - p.purchasePrice) / p.purchasePrice) * 100;
      setProfitPercent(pp > 0 ? pp.toFixed(2) : "");
    } else {
      setProfitPercent("");
    }
    setVendorName(p.vendorName ?? "");
    setPurchasePrice(p.purchasePrice != null ? String(p.purchasePrice) : "");
    setInitialQty("");
    setDetails(p.details ?? "");
    setPurchaseDate(new Date().toISOString().slice(0, 10));
    setInvoiceNo("");
    setBillNo("");
    setTransportCharge("");
    setLabourCharge("");
    setExpiryDate(p.expiryDate ?? "");
    setRetailerPrice(p.retailerPrice != null ? String(p.retailerPrice) : "");
    setWholesalerPrice(
      p.wholesalerPrice != null ? String(p.wholesalerPrice) : "",
    );
    setUnitMode(p.unitMode ?? "single");
    setLengthUnit(p.lengthUnit ?? "");
    setWeightUnit(p.weightUnit ?? "");
    setMeterToKgRatio(p.meterToKgRatio != null ? String(p.meterToKgRatio) : "");
    setSellingMode("profit");
    setShowForm(true);
  };

  const handleSave = () => {
    const missingFields: string[] = [];
    if (!name.trim()) missingFields.push("Product Name");
    if (!categoryName.trim()) missingFields.push("Category");
    if (!minStock) missingFields.push("Min Alert");
    if (!sellPrice) missingFields.push("Sell Price");

    if (unitMode === "single" && !unit.trim()) missingFields.push("Unit");
    if (unitMode === "mixed") {
      if (!lengthUnit.trim()) missingFields.push("Length Unit");
      if (!weightUnit.trim()) missingFields.push("Weight Unit");
    }

    if (missingFields.length > 0) {
      toast.error(`Required: ${missingFields.join(", ")}`);
      return;
    }

    let catId = categories.find(
      (c) => c.name.toLowerCase() === categoryName.trim().toLowerCase(),
    )?.id;

    if (!catId) {
      catId = addCategory(categoryName.trim());
    }

    const primaryUnit = unitMode === "mixed" ? lengthUnit.trim() : unit.trim();

    const data: Omit<Product, "id"> = {
      name: name.trim(),
      categoryId: catId,
      unit: primaryUnit,
      minStockAlert: Number(minStock),
      sellingPrice: Number(sellPrice),
      costPrice: costPrice ? Number(costPrice) : undefined,
      minProfitPct: minProfitPct ? Number(minProfitPct) : undefined,
      vendorName: vendorName.trim() || undefined,
      purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
      details: details.trim() || undefined,
      expiryDate: expiryDate.trim() || undefined,
      unitMode,
      retailerPrice: retailerPrice ? Number(retailerPrice) : undefined,
      wholesalerPrice: wholesalerPrice ? Number(wholesalerPrice) : undefined,
      ...(unitMode === "mixed"
        ? {
            lengthUnit: lengthUnit.trim(),
            weightUnit: weightUnit.trim(),
            meterToKgRatio: meterToKgRatio ? Number(meterToKgRatio) : undefined,
          }
        : {}),
    };

    if (editProduct) {
      updateProduct(editProduct.id, data);
      toast.success("Product updated");
    } else {
      const existingProduct = products.find(
        (p) => p.name.trim().toLowerCase() === data.name.trim().toLowerCase(),
      );
      if (existingProduct) {
        toast.warning(
          `"${data.name}" already exists — add stock to it or rename`,
        );
        setShowForm(false);
        return;
      }
      const newId = addProduct(data);
      const qty = Number(initialQty);
      if (qty > 0) {
        addStockIn(
          newId,
          qty,
          purchasePrice ? Number(purchasePrice) : 0,
          purchaseDate || new Date().toISOString().split("T")[0],
          "Initial stock",
          invoiceNo.trim() || undefined,
          billNo.trim() || undefined,
          transportCharge ? Number(transportCharge) : undefined,
          labourCharge ? Number(labourCharge) : undefined,
          expiryDate.trim() || undefined,
          unitMode === "mixed" ? qty : undefined,
          unitMode === "mixed" && meterToKgRatio
            ? qty * Number(meterToKgRatio)
            : undefined,
          otherCharge ? Number(otherCharge) : undefined,
        );
      }
      toast.success("Product added! ✓");
    }
    setShowForm(false);
  };

  const qty4cost = Number(initialQty || 0);
  // Final Cost (total) = purchasePrice × qty + transport + labour + other
  const finalCostTotal =
    Number(purchasePrice || 0) * qty4cost +
    Number(transportCharge || 0) +
    Number(labourCharge || 0) +
    Number(otherCharge || 0);
  const finalCostPerUnit =
    qty4cost > 0 ? finalCostTotal / qty4cost : Number(purchasePrice || 0);

  // Selling section: compute derived values based on mode
  const handleProfitPctChange = (pct: string) => {
    setProfitPercent(pct);
    if (Number(pct) < 0) return;
    const baseCost =
      finalCostPerUnit > 0 ? finalCostPerUnit : Number(purchasePrice || 0);
    if (baseCost > 0 && pct !== "") {
      const sp = baseCost + (baseCost * Number(pct)) / 100;
      setSellPrice(sp.toFixed(2));
    }
  };

  const handleSellPriceChange = (sp: string) => {
    setSellPrice(sp);
    const baseCost =
      finalCostPerUnit > 0 ? finalCostPerUnit : Number(purchasePrice || 0);
    if (baseCost > 0 && sp !== "") {
      const pct = ((Number(sp) - baseCost) / baseCost) * 100;
      setProfitPercent(pct.toFixed(2));
    }
  };

  // Update cost-derived fields when cost inputs change
  const recalcFromCost = (
    pp: string,
    qty: string,
    tc: string,
    lc: string,
    oc: string,
  ) => {
    const qtyN = Number(qty || 0);
    const totalCost =
      Number(pp || 0) * qtyN +
      Number(tc || 0) +
      Number(lc || 0) +
      Number(oc || 0);
    const perUnit = qtyN > 0 ? totalCost / qtyN : Number(pp || 0);
    if (sellingMode === "profit" && profitPercent !== "" && perUnit > 0) {
      const sp = perUnit + (perUnit * Number(profitPercent)) / 100;
      setSellPrice(sp.toFixed(2));
    } else if (sellingMode === "price" && sellPrice !== "" && perUnit > 0) {
      const pct = ((Number(sellPrice) - perUnit) / perUnit) * 100;
      setProfitPercent(pct.toFixed(2));
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm text-muted-foreground">
          {products.length} products
        </div>
        <Button
          data-ocid="admin.products.add.button"
          size="sm"
          onClick={openAdd}
        >
          <Plus size={14} className="mr-1" /> Add Product
        </Button>
      </div>

      <Card className="shadow-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {products.length === 0 ? (
              <div
                data-ocid="admin.products.empty_state"
                className="text-center py-10 text-muted-foreground text-sm"
              >
                <p>No products yet.</p>
                <p className="text-xs mt-1">
                  Click "Add Product" to add your first product.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs">Unit</TableHead>
                    <TableHead className="text-xs">Vendor</TableHead>
                    <TableHead className="text-xs">Purchase Price</TableHead>
                    <TableHead className="text-xs">Sell Price</TableHead>
                    <TableHead className="text-xs">Cost Price</TableHead>
                    <TableHead className="text-xs">Profit (₹)</TableHead>
                    <TableHead className="text-xs">Profit %</TableHead>
                    <TableHead className="text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p, idx) => {
                    const cat = categories.find((c) => c.id === p.categoryId);
                    const unitDisplay =
                      p.unitMode === "mixed" && p.lengthUnit && p.weightUnit
                        ? `${p.lengthUnit} + ${p.weightUnit}`
                        : p.unit;
                    return (
                      <TableRow
                        key={p.id}
                        data-ocid={`admin.products.item.${idx + 1}`}
                      >
                        <TableCell className="text-sm font-medium">
                          {p.name}
                          {p.unitMode === "mixed" && (
                            <Badge className="ml-1 text-[10px] px-1 py-0 h-4 bg-secondary text-muted-foreground border-0">
                              Mixed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">{cat?.name}</TableCell>
                        <TableCell className="text-xs">{unitDisplay}</TableCell>
                        <TableCell className="text-xs">
                          {p.vendorName ?? "-"}
                        </TableCell>
                        <TableCell className="text-xs">
                          {p.purchasePrice != null
                            ? `\u20b9${p.purchasePrice}`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-xs">
                          {`\u20b9${p.sellingPrice}`}
                        </TableCell>
                        {(() => {
                          const cp = getProductCostPrice(p.id);
                          const profit = getProductProfit(p.id);
                          const profitPct = getProductProfitPct(p.id);
                          return (
                            <>
                              <TableCell className="text-xs">
                                {cp > 0 ? `₹${cp}` : "-"}
                              </TableCell>
                              <TableCell
                                className={`text-xs font-semibold ${
                                  profit > 0
                                    ? "text-green-600"
                                    : profit < 0
                                      ? "text-red-500"
                                      : "text-muted-foreground"
                                }`}
                              >
                                {cp > 0 ? `₹${profit.toFixed(2)}` : "-"}
                              </TableCell>
                              <TableCell
                                className={`text-xs font-semibold ${
                                  profitPct > 0
                                    ? "text-green-600"
                                    : profitPct < 0
                                      ? "text-red-500"
                                      : "text-muted-foreground"
                                }`}
                              >
                                {cp > 0 ? `${profitPct.toFixed(1)}%` : "-"}
                              </TableCell>
                            </>
                          );
                        })()}
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              data-ocid={`admin.products.edit_button.${idx + 1}`}
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => openEdit(p)}
                            >
                              <Pencil size={12} />
                            </Button>
                            {canDelete && (
                              <Button
                                data-ocid={`admin.products.delete_button.${idx + 1}`}
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  deleteProduct(p.id);
                                  toast.success("Product deleted");
                                }}
                              >
                                <Trash2 size={12} />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent
          data-ocid="admin.products.form.dialog"
          className="max-w-lg w-full p-0 gap-0 overflow-hidden"
        >
          <DialogHeader className="px-5 pt-5 pb-3 border-b border-border bg-card">
            <DialogTitle className="flex items-center gap-2 text-base">
              {editProduct ? (
                <>
                  <Pencil size={16} className="text-primary" /> Edit Product
                </>
              ) : (
                <>
                  <Plus size={16} className="text-primary" /> Add New Product
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[76vh]">
            {/* ── SECTION 1: Purchase Details (new only) ── */}
            {!editProduct && (
              <FormSection
                icon={<ShoppingCart size={14} />}
                label="Purchase Details"
                color="blue"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Vendor
                    </Label>
                    <Input
                      data-ocid="admin.products.vendor.input"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      placeholder="e.g. Sharma Traders"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Bill No
                    </Label>
                    <Input
                      data-ocid="admin.products.bill_no.input"
                      value={billNo}
                      onChange={(e) => setBillNo(e.target.value)}
                      placeholder="e.g. BILL-001"
                      className="h-9"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Date
                  </Label>
                  <Input
                    data-ocid="admin.products.purchase_date.input"
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="h-9"
                  />
                </div>
              </FormSection>
            )}

            {/* ── SECTION 2: Product Details ── */}
            <FormSection
              icon={<Tag size={14} />}
              label="Product Details"
              color="indigo"
            >
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Product Name *
                </Label>
                <Input
                  data-ocid="admin.products.name.input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Basmati Rice"
                  className="h-9"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Category *
                  </Label>
                  <Input
                    data-ocid="admin.products.category.input"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="e.g. Grains"
                    list="category-suggestions"
                    className="h-9"
                  />
                  {categories.length > 0 && (
                    <datalist id="category-suggestions">
                      {categories.map((c) => (
                        <option key={c.id} value={c.name} />
                      ))}
                    </datalist>
                  )}
                </div>

                {unitMode === "single" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Unit *
                    </Label>
                    <Input
                      data-ocid="admin.products.unit.input"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="kg"
                      list="unit-suggestions"
                      className="h-9"
                    />
                    {shopUnits.length > 0 && (
                      <datalist id="unit-suggestions">
                        {shopUnits.map((u) => (
                          <option key={u.id} value={u.name} />
                        ))}
                      </datalist>
                    )}
                  </div>
                )}
              </div>

              {shopSettings.allowMixedUnits && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    data-ocid="admin.products.unit_mode_single.toggle"
                    onClick={() => setUnitMode("single")}
                    className={`flex-1 text-xs py-1.5 px-3 rounded-md border transition-colors ${
                      unitMode === "single"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    Single Unit
                  </button>
                  <button
                    type="button"
                    data-ocid="admin.products.unit_mode_mixed.toggle"
                    onClick={() => setUnitMode("mixed")}
                    className={`flex-1 text-xs py-1.5 px-3 rounded-md border transition-colors ${
                      unitMode === "mixed"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    Mixed Unit
                  </button>
                </div>
              )}

              {unitMode === "mixed" && (
                <div className="space-y-2 p-3 rounded-lg border border-border bg-secondary/30">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Length Unit *
                      </Label>
                      <Input
                        data-ocid="admin.products.length_unit.input"
                        value={lengthUnit}
                        onChange={(e) => setLengthUnit(e.target.value)}
                        placeholder="meter"
                        list="length-unit-suggestions"
                        className="h-8 text-sm"
                      />
                      <datalist id="length-unit-suggestions">
                        <option value="meter" />
                        <option value="cm" />
                        <option value="feet" />
                        <option value="inch" />
                      </datalist>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Weight Unit *
                      </Label>
                      <Input
                        data-ocid="admin.products.weight_unit.input"
                        value={weightUnit}
                        onChange={(e) => setWeightUnit(e.target.value)}
                        placeholder="kg"
                        list="weight-unit-suggestions"
                        className="h-8 text-sm"
                      />
                      <datalist id="weight-unit-suggestions">
                        <option value="kg" />
                        <option value="ton" />
                        <option value="gram" />
                      </datalist>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Smart Mode Ratio (Optional)
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        1 {lengthUnit || "meter"} =
                      </span>
                      <Input
                        data-ocid="admin.products.ratio.input"
                        type="number"
                        value={meterToKgRatio}
                        onChange={(e) =>
                          setMeterToKgRatio(clearLeadingZeros(e.target.value))
                        }
                        onFocus={(e) => {
                          if (e.target.value === "0") e.target.select();
                        }}
                        placeholder="2.5"
                        className="h-8 text-sm"
                        min="0"
                        step="0.01"
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {weightUnit || "kg"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {!editProduct && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Quantity{" "}
                    <span className="text-muted-foreground normal-case">
                      (Opening Stock)
                    </span>
                  </Label>
                  <Input
                    data-ocid="admin.products.initial_qty.input"
                    type="number"
                    value={initialQty}
                    onChange={(e) =>
                      setInitialQty(clearLeadingZeros(e.target.value))
                    }
                    onFocus={(e) => {
                      if (e.target.value === "0") e.target.select();
                    }}
                    placeholder="e.g. 50"
                    className="h-9"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Opening stock quantity? A stock batch will be created.
                  </p>
                </div>
              )}
            </FormSection>

            {/* ── SECTION 3: Cost Input (new only) ── */}
            {!editProduct && (
              <FormSection
                icon={<ShoppingCart size={14} />}
                label="Cost Input"
                color="orange"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Purchase Price (₹)
                    </Label>
                    <Input
                      data-ocid="admin.products.purchase_price.input"
                      type="number"
                      value={purchasePrice}
                      onFocus={(e) => {
                        if (e.target.value === "0") e.target.select();
                      }}
                      onChange={(e) => {
                        setPurchasePrice(clearLeadingZeros(e.target.value));
                        recalcFromCost(
                          clearLeadingZeros(e.target.value),
                          initialQty,
                          transportCharge,
                          labourCharge,
                          otherCharge,
                        );
                      }}
                      placeholder="e.g. 80"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Transport (₹)
                    </Label>
                    <Input
                      data-ocid="admin.products.transport.input"
                      type="number"
                      value={transportCharge}
                      onFocus={(e) => {
                        if (e.target.value === "0") e.target.select();
                      }}
                      onChange={(e) => {
                        setTransportCharge(clearLeadingZeros(e.target.value));
                        recalcFromCost(
                          purchasePrice,
                          initialQty,
                          clearLeadingZeros(e.target.value),
                          labourCharge,
                          otherCharge,
                        );
                      }}
                      placeholder="0"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Labour (₹)
                    </Label>
                    <Input
                      data-ocid="admin.products.labour.input"
                      type="number"
                      value={labourCharge}
                      onFocus={(e) => {
                        if (e.target.value === "0") e.target.select();
                      }}
                      onChange={(e) => {
                        setLabourCharge(clearLeadingZeros(e.target.value));
                        recalcFromCost(
                          purchasePrice,
                          initialQty,
                          transportCharge,
                          clearLeadingZeros(e.target.value),
                          otherCharge,
                        );
                      }}
                      placeholder="0"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Other (₹)
                    </Label>
                    <Input
                      data-ocid="admin.products.other_charges.input"
                      type="number"
                      value={otherCharge}
                      onFocus={(e) => {
                        if (e.target.value === "0") e.target.select();
                      }}
                      onChange={(e) => {
                        setOtherCharge(clearLeadingZeros(e.target.value));
                        recalcFromCost(
                          purchasePrice,
                          initialQty,
                          transportCharge,
                          labourCharge,
                          clearLeadingZeros(e.target.value),
                        );
                      }}
                      placeholder="0"
                      className="h-9"
                    />
                  </div>
                </div>
              </FormSection>
            )}

            {/* ── SECTION 4: Auto Calculation (new only, read-only) ── */}
            {!editProduct && (
              <FormSection
                icon={<Calculator size={14} />}
                label="Auto Calculation"
                color="slate"
                bgHint="Auto-calculated — read only"
              >
                <div className="grid grid-cols-2 gap-3">
                  <AutoCalcField
                    ocid="admin.products.final_cost.display"
                    label="Final Cost (Total)"
                    value={
                      qty4cost > 0 || finalCostTotal > 0
                        ? `₹${finalCostTotal.toFixed(2)}`
                        : "—"
                    }
                    sub={
                      qty4cost > 0 && purchasePrice
                        ? `₹${Number(purchasePrice || 0)} × ${qty4cost}${Number(transportCharge) > 0 ? ` + ₹${transportCharge} transport` : ""}${Number(labourCharge) > 0 ? ` + ₹${labourCharge} labour` : ""}${Number(otherCharge) > 0 ? ` + ₹${otherCharge} other` : ""}`
                        : undefined
                    }
                    accent="green"
                  />
                  <AutoCalcField
                    ocid="admin.products.per_unit_cost.display"
                    label="Per Unit Cost"
                    value={
                      finalCostPerUnit > 0
                        ? `₹${finalCostPerUnit.toFixed(2)}`
                        : "—"
                    }
                    sub={
                      qty4cost > 0 && finalCostTotal > 0
                        ? `₹${finalCostTotal.toFixed(2)} ÷ ${qty4cost}`
                        : undefined
                    }
                    accent="blue"
                  />
                </div>
              </FormSection>
            )}

            {/* Edit mode: compact purchase details */}
            {editProduct && (
              <FormSection
                icon={<ShoppingCart size={14} />}
                label="Purchase Details"
                color="orange"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Vendor
                    </Label>
                    <Input
                      data-ocid="admin.products.vendor.input"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      placeholder="e.g. Sharma Traders"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Purchase Price (₹)
                    </Label>
                    <Input
                      data-ocid="admin.products.purchase_price.input"
                      type="number"
                      value={purchasePrice}
                      onChange={(e) =>
                        setPurchasePrice(clearLeadingZeros(e.target.value))
                      }
                      onFocus={(e) => {
                        if (e.target.value === "0") e.target.select();
                      }}
                      placeholder="80"
                      className="h-9"
                    />
                  </div>
                </div>
              </FormSection>
            )}

            {/* ── SECTION 5: Selling ── */}
            <FormSection
              icon={<TrendingUp size={14} />}
              label="Selling"
              color="green"
            >
              {/* One-input-at-a-time toggle */}
              <div className="flex gap-1 p-0.5 bg-secondary rounded-lg w-full">
                <button
                  type="button"
                  onClick={() => setSellingMode("profit")}
                  className={`flex-1 text-xs py-1.5 px-2 rounded-md font-medium transition-colors ${
                    sellingMode === "profit"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Edit Profit %
                </button>
                <button
                  type="button"
                  onClick={() => setSellingMode("price")}
                  className={`flex-1 text-xs py-1.5 px-2 rounded-md font-medium transition-colors ${
                    sellingMode === "price"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Edit Sell Price
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Profit % — editable only in "profit" mode */}
                <div className="space-y-1.5">
                  {sellingMode === "profit" ? (
                    <>
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Profit % *
                      </Label>
                      <Input
                        data-ocid="admin.products.profit_percent.input"
                        type="number"
                        value={profitPercent}
                        min="0"
                        onFocus={(e) => {
                          if (e.target.value === "0") e.target.select();
                        }}
                        onChange={(e) =>
                          handleProfitPctChange(
                            clearLeadingZeros(e.target.value),
                          )
                        }
                        placeholder="e.g. 20"
                        className="h-9"
                      />
                    </>
                  ) : (
                    <AutoCalcField
                      ocid="admin.products.profit_percent_display.display"
                      label="Profit %"
                      value={
                        profitPercent
                          ? `${Number(profitPercent).toFixed(1)}%`
                          : "—"
                      }
                      accent="green"
                    />
                  )}
                </div>

                {/* Sell Price — editable only in "price" mode */}
                <div className="space-y-1.5">
                  {sellingMode === "price" ? (
                    <>
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Selling Price (₹) *
                      </Label>
                      <Input
                        data-ocid="admin.products.sell_price.input"
                        type="number"
                        value={sellPrice}
                        onFocus={(e) => {
                          if (e.target.value === "0") e.target.select();
                        }}
                        onChange={(e) =>
                          handleSellPriceChange(
                            clearLeadingZeros(e.target.value),
                          )
                        }
                        placeholder="100"
                        className="h-9"
                      />
                    </>
                  ) : (
                    <AutoCalcField
                      ocid="admin.products.sell_price_display.display"
                      label="Sell Price"
                      value={
                        sellPrice ? `₹${Number(sellPrice).toFixed(2)}` : "—"
                      }
                      accent="green"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    MRP (₹){" "}
                    <span className="normal-case text-muted-foreground">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    data-ocid="admin.products.mrp.input"
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="e.g. 120"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Min Profit %{" "}
                    <span className="normal-case text-muted-foreground">
                      (lock)
                    </span>
                  </Label>
                  <Input
                    data-ocid="admin.products.min_profit_pct.input"
                    type="number"
                    value={minProfitPct}
                    min="0"
                    max="100"
                    onFocus={(e) => {
                      if (e.target.value === "0") e.target.select();
                    }}
                    onChange={(e) => {
                      const val = clearLeadingZeros(e.target.value);
                      if (Number(val) < 0) return;
                      setMinProfitPct(val);
                    }}
                    placeholder="e.g. 10"
                    className="h-9"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Staff cannot sell below this minimum profit threshold
                  </p>
                </div>
              </div>

              {/* Retailer & Wholesaler prices */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Retailer Price (₹){" "}
                    <span className="normal-case text-muted-foreground">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    data-ocid="admin.products.retailer_price.input"
                    type="number"
                    value={retailerPrice}
                    onChange={(e) =>
                      setRetailerPrice(clearLeadingZeros(e.target.value))
                    }
                    onFocus={(e) => {
                      if (e.target.value === "0") e.target.select();
                    }}
                    placeholder="e.g. 95"
                    className="h-9"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Retailer Price
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Wholesaler Price (₹){" "}
                    <span className="normal-case text-muted-foreground">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    data-ocid="admin.products.wholesaler_price.input"
                    type="number"
                    value={wholesalerPrice}
                    onChange={(e) =>
                      setWholesalerPrice(clearLeadingZeros(e.target.value))
                    }
                    onFocus={(e) => {
                      if (e.target.value === "0") e.target.select();
                    }}
                    placeholder="e.g. 88"
                    className="h-9"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Wholesaler Price
                  </p>
                </div>
              </div>
            </FormSection>

            {/* ── SECTION 6: Auto Profit (read-only summary) ── */}
            {(() => {
              const baseCost =
                finalCostPerUnit > 0
                  ? finalCostPerUnit
                  : purchasePrice
                    ? Number(purchasePrice)
                    : 0;
              const sp = sellPrice ? Number(sellPrice) : 0;
              const profitRs = baseCost > 0 && sp > 0 ? sp - baseCost : 0;
              const profitPct =
                baseCost > 0 && profitRs !== 0
                  ? (profitRs / baseCost) * 100
                  : 0;
              const hasData = baseCost > 0 && sp > 0;
              return (
                <FormSection
                  icon={<TrendingUp size={14} />}
                  label="Auto Profit"
                  color="emerald"
                  bgHint="From Per Unit Cost + Selling Price"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      data-ocid="admin.products.profit_rs.display"
                      className={`rounded-lg border p-3 text-center ${
                        !hasData
                          ? "bg-muted/40 border-border"
                          : profitRs >= 0
                            ? "bg-green-50 border-green-200"
                            : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <Lock size={10} className="text-muted-foreground" />
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                          Profit ₹
                        </span>
                      </div>
                      <p
                        className={`text-lg font-bold ${
                          !hasData
                            ? "text-muted-foreground"
                            : profitRs >= 0
                              ? "text-green-600"
                              : "text-red-600"
                        }`}
                      >
                        {hasData ? `₹${profitRs.toFixed(2)}` : "—"}
                      </p>
                    </div>
                    <div
                      data-ocid="admin.products.profit_pct_display.display"
                      className={`rounded-lg border p-3 text-center ${
                        !hasData
                          ? "bg-muted/40 border-border"
                          : profitPct >= 0
                            ? "bg-green-50 border-green-200"
                            : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <Lock size={10} className="text-muted-foreground" />
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                          Profit %
                        </span>
                      </div>
                      <p
                        className={`text-lg font-bold ${
                          !hasData
                            ? "text-muted-foreground"
                            : profitPct >= 0
                              ? "text-green-600"
                              : "text-red-600"
                        }`}
                      >
                        {hasData ? `${profitPct.toFixed(1)}%` : "—"}
                      </p>
                    </div>
                  </div>
                </FormSection>
              );
            })()}

            {/* ── SECTION 7: Alerts ── */}
            <FormSection
              icon={<Settings size={14} />}
              label="Alerts"
              color="amber"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Min Stock Alert *
                  </Label>
                  <Input
                    data-ocid="admin.products.min_stock.input"
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    placeholder="e.g. 10"
                    className="h-9"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    An alert will trigger when stock falls below this level
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Expiry Date{" "}
                    <span className="normal-case text-muted-foreground">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    data-ocid="admin.products.expiry_date.input"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>
            </FormSection>

            {/* ── SECTION 8: Action ── */}
            <div className="px-5 py-4 border-t border-border bg-card flex flex-col gap-2">
              <Button
                data-ocid="admin.products.form.save_button"
                onClick={handleSave}
                className="w-full h-11 text-sm font-semibold"
              >
                {editProduct ? "Update Product" : "Save Product"}
              </Button>
              <Button
                variant="outline"
                data-ocid="admin.products.form.cancel_button"
                onClick={() => setShowForm(false)}
                className="w-full h-10 text-sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Categories Manager ────────────────────────────────────────────────────────
function CategoriesManager() {
  const { categories, addCategory, updateCategory, deleteCategory, products } =
    useStore();
  const [newCatName, setNewCatName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleAdd = () => {
    if (!newCatName.trim()) {
      toast.error("Category name required");
      return;
    }
    addCategory(newCatName.trim());
    setNewCatName("");
    toast.success("Category added");
  };

  const handleUpdate = (id: string) => {
    if (!editingName.trim()) {
      toast.error("Category name required");
      return;
    }
    updateCategory(id, editingName.trim());
    setEditingId(null);
    toast.success("Category updated");
  };

  const handleDelete = (id: string) => {
    const hasProducts = products.some((p) => p.categoryId === id);
    if (hasProducts) {
      toast.error("Remove products in this category first");
      return;
    }
    deleteCategory(id);
    toast.success("Category deleted");
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="shadow-card border-border max-w-sm">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              data-ocid="admin.categories.name.input"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="New category name"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button data-ocid="admin.categories.add.button" onClick={handleAdd}>
              <Plus size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {categories.length === 0 && (
          <p
            data-ocid="admin.categories.empty_state"
            className="text-sm text-muted-foreground py-4 text-center"
          >
            No categories yet. Add one above.
          </p>
        )}
        {[...categories]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((c, idx) => (
            <Card
              key={c.id}
              data-ocid={`admin.categories.item.${idx + 1}`}
              className="shadow-card border-border"
            >
              <CardContent className="p-3 flex items-center justify-between">
                {editingId === c.id ? (
                  <div className="flex gap-2 flex-1">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="h-8"
                      onKeyDown={(e) => e.key === "Enter" && handleUpdate(c.id)}
                    />
                    <Button
                      data-ocid={`admin.categories.save_button.${idx + 1}`}
                      size="sm"
                      onClick={() => handleUpdate(c.id)}
                    >
                      Save
                    </Button>
                    <Button
                      data-ocid={`admin.categories.cancel_button.${idx + 1}`}
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-medium text-foreground">
                      {c.name}
                    </span>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs mr-2">
                        {products.filter((p) => p.categoryId === c.id).length}{" "}
                        products
                      </Badge>
                      <Button
                        data-ocid={`admin.categories.edit_button.${idx + 1}`}
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => {
                          setEditingId(c.id);
                          setEditingName(c.name);
                        }}
                      >
                        <Pencil size={12} />
                      </Button>
                      <Button
                        data-ocid={`admin.categories.delete_button.${idx + 1}`}
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(c.id)}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}

// ── Units Manager ──────────────────────────────────────────────────────────────
function UnitsManager() {
  const { shopUnits, addShopUnit, deleteShopUnit } = useStore();
  const [newUnit, setNewUnit] = useState("");

  const COMMON_UNITS = [
    "box",
    "bundle",
    "dozen",
    "gram",
    "kg",
    "litre",
    "ml",
    "pcs",
  ];

  const handleAdd = () => {
    if (!newUnit.trim()) {
      toast.error("Unit name required");
      return;
    }
    addShopUnit(newUnit.trim());
    setNewUnit("");
    toast.success("Unit added");
  };

  const handleAddCommon = (name: string) => {
    addShopUnit(name);
    toast.success(`"${name}" added`);
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="shadow-card border-border max-w-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            <Input
              data-ocid="admin.units.name.input"
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              placeholder="Unit name (e.g. kg, litre)"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button data-ocid="admin.units.add.button" onClick={handleAdd}>
              <Plus size={16} />
            </Button>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Common units:</p>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_UNITS.map((u) => {
                const exists = shopUnits.some(
                  (su) => su.name.toLowerCase() === u.toLowerCase(),
                );
                return (
                  <button
                    key={u}
                    type="button"
                    onClick={() => !exists && handleAddCommon(u)}
                    disabled={exists}
                    className="text-xs px-2.5 py-1 rounded-full border transition-all duration-150
                      disabled:opacity-40 disabled:cursor-not-allowed
                      enabled:hover:bg-primary enabled:hover:text-white enabled:hover:border-primary
                      border-border text-muted-foreground"
                  >
                    {u}
                    {exists && " ✓"}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {shopUnits.length === 0 ? (
          <div
            data-ocid="admin.units.empty_state"
            className="text-center py-8 text-muted-foreground"
          >
            <Ruler size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No units added yet.</p>
            <p className="text-xs mt-1">
              Add a unit above or use common units.
            </p>
          </div>
        ) : (
          [...shopUnits]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((u, idx) => (
              <Card
                key={u.id}
                data-ocid={`admin.units.item.${idx + 1}`}
                className="shadow-card border-border"
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
                      <Ruler size={13} className="text-accent-foreground" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {u.name}
                    </span>
                  </div>
                  <Button
                    data-ocid={`admin.units.delete_button.${idx + 1}`}
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      deleteShopUnit(u.id);
                      toast.success("Unit deleted");
                    }}
                  >
                    <Trash2 size={12} />
                  </Button>
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  );
}

// ── Feedback Manager (Owner only) ────────────────────────────────────────────
const FEEDBACK_TYPE_META: Record<
  FeedbackType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  bug: {
    label: "Bug",
    icon: <Bug size={11} />,
    color:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400",
  },
  feature: {
    label: "Feature",
    icon: <Sparkles size={11} />,
    color:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
  },
  improvement: {
    label: "Improvement",
    icon: <Lightbulb size={11} />,
    color:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",
  },
};

const FEEDBACK_STATUS_META = {
  pending: {
    label: "Pending",
    icon: <AlertCircle size={11} />,
    cls: "bg-amber-50 text-amber-700 border-amber-200",
  },
  approved: {
    label: "Approved",
    icon: <CheckCircle size={11} />,
    cls: "bg-green-50 text-green-700 border-green-200",
  },
  rejected: {
    label: "Rejected",
    icon: <XCircle size={11} />,
    cls: "bg-red-50 text-red-700 border-red-200",
  },
};

type FbFilter = "all" | "pending" | "approved" | "rejected";

function FeedbackManager() {
  const { feedbackList, approveFeedback, rejectFeedback } = useStore();
  const { currentUser } = useAuth();

  const [filter, setFilter] = useState<FbFilter>("all");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filtered =
    filter === "all"
      ? feedbackList
      : feedbackList.filter((f) => f.status === filter);

  const counts = {
    all: feedbackList.length,
    pending: feedbackList.filter((f) => f.status === "pending").length,
    approved: feedbackList.filter((f) => f.status === "approved").length,
    rejected: feedbackList.filter((f) => f.status === "rejected").length,
  };

  const filterChips: { key: FbFilter; label: string; cls: string }[] = [
    {
      key: "all",
      label: `All (${counts.all})`,
      cls: "bg-secondary text-foreground border-border",
    },
    {
      key: "pending",
      label: `Pending (${counts.pending})`,
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      key: "approved",
      label: `Approved (${counts.approved})`,
      cls: "bg-green-50 text-green-700 border-green-200",
    },
    {
      key: "rejected",
      label: `Rejected (${counts.rejected})`,
      cls: "bg-red-50 text-red-700 border-red-200",
    },
  ];

  function handleApprove(feedbackId: string) {
    approveFeedback(feedbackId, currentUser?.name ?? "Admin");
    toast.success("✅ Approved — 10 💎 awarded");
  }

  function handleConfirmReject(feedbackId: string) {
    rejectFeedback(feedbackId, rejectReason.trim() || "No reason provided");
    toast.error("❌ Feedback rejected");
    setRejectingId(null);
    setRejectReason("");
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter chips */}
      <div
        className="flex gap-2 flex-wrap"
        data-ocid="admin.feedback.filter.bar"
      >
        {filterChips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            data-ocid={`admin.feedback.filter.${chip.key}`}
            onClick={() => setFilter(chip.key)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
              filter === chip.key
                ? `${chip.cls} ring-2 ring-primary/30`
                : "bg-card text-muted-foreground border-border hover:border-primary/40"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Feedback list */}
      {filtered.length === 0 ? (
        <div
          data-ocid="admin.feedback.empty_state"
          className="flex flex-col items-center gap-3 py-10 text-center"
        >
          <MessageSquare size={28} className="text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No feedback found</p>
          <p className="text-xs text-muted-foreground">
            {filter === "all"
              ? "No users have submitted feedback yet."
              : `No ${filter} feedback at this time.`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((entry) => {
            const typeInfo = FEEDBACK_TYPE_META[entry.type];
            const statusInfo = FEEDBACK_STATUS_META[entry.status];
            const isRejecting = rejectingId === entry.id;

            return (
              <Card
                key={entry.id}
                data-ocid={`admin.feedback.item.${entry.id}`}
                className="shadow-card border-border"
              >
                <CardContent className="p-3.5">
                  {/* Header row */}
                  <div className="flex items-start gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeInfo.color}`}
                        >
                          {typeInfo.icon} {typeInfo.label}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.cls}`}
                        >
                          {statusInfo.icon} {statusInfo.label}
                        </span>
                        {entry.rewardGiven && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                            💎 +10 Rewarded
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-semibold text-foreground truncate">
                        {entry.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {entry.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] text-muted-foreground">
                          By{" "}
                          <span className="font-semibold text-foreground/80">
                            {entry.userName}
                          </span>
                        </span>
                        <span className="text-[10px] text-muted-foreground/50">
                          •
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(entry.submittedAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                      {entry.rejectionReason && (
                        <p className="text-xs text-destructive mt-1">
                          Reason: {entry.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Approve / Reject actions for pending items */}
                  {entry.status === "pending" && (
                    <div className="pt-2 border-t border-border/60">
                      {isRejecting ? (
                        <div className="flex flex-col gap-2">
                          <label
                            htmlFor={`reject-reason-${entry.id}`}
                            className="text-xs font-semibold text-muted-foreground"
                          >
                            Rejection reason (optional)
                          </label>
                          <Input
                            id={`reject-reason-${entry.id}`}
                            placeholder="Enter reason for rejection..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            data-ocid={`admin.feedback.reject_reason.${entry.id}`}
                            className="h-8 text-sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleConfirmReject(entry.id)}
                              data-ocid={`admin.feedback.confirm_reject.${entry.id}`}
                            >
                              <XCircle size={12} className="mr-1" /> Confirm
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setRejectingId(null);
                                setRejectReason("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(entry.id)}
                            data-ocid={`admin.feedback.approve.${entry.id}`}
                            className="flex-1"
                          >
                            <CheckCircle size={12} className="mr-1" /> Approve
                            (+10 💎)
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setRejectingId(entry.id);
                              setRejectReason("");
                            }}
                            data-ocid={`admin.feedback.reject.${entry.id}`}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive border-border"
                          >
                            <XCircle size={12} className="mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Users Manager ─────────────────────────────────────────────────────────────
function UsersManager() {
  const { users, addUser, updateUser, deleteUser } = useStore();
  const { currentUser, currentShop } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<AppUser | null>(null);

  const [uName, setUName] = useState("");
  const [uUsername, setUUsername] = useState("");
  const [uPassword, setUPassword] = useState("");
  const [uRole, setURole] = useState<"owner" | "manager" | "staff">("staff");

  const openAdd = () => {
    setEditUser(null);
    setUName("");
    setUUsername("");
    setUPassword("");
    setURole("staff");
    setShowForm(true);
  };

  const openEdit = (u: AppUser) => {
    setEditUser(u);
    setUName(u.name);
    setUUsername(u.username);
    setUPassword(u.password);
    setURole(u.role);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!uName.trim() || !uUsername.trim() || !uPassword.trim()) {
      toast.error("All fields required");
      return;
    }
    const shopId = currentShop?.id ?? "";
    const data: Omit<AppUser, "id"> = {
      name: uName.trim(),
      username: uUsername.trim(),
      password: uPassword,
      role: uRole,
      shopId,
    };
    if (editUser) {
      updateUser(editUser.id, data);
      toast.success("User updated");
    } else {
      addUser(data);
      toast.success("User added");
    }
    setShowForm(false);
  };

  const handleDelete = (u: AppUser) => {
    if (u.id === currentUser?.id) {
      toast.error("You cannot delete your own account");
      return;
    }
    deleteUser(u.id);
    toast.success("User deleted");
  };

  return (
    <>
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm text-muted-foreground">
          {users.length} users — {currentShop?.name}
        </div>
        <Button data-ocid="admin.users.add.button" size="sm" onClick={openAdd}>
          <Plus size={14} className="mr-1" /> Add User
        </Button>
      </div>

      <Card className="shadow-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {users.length === 0 ? (
              <div
                data-ocid="admin.users.empty_state"
                className="text-center py-10 text-muted-foreground text-sm"
              >
                No users found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Username</TableHead>
                    <TableHead className="text-xs">Role</TableHead>
                    <TableHead className="text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u, idx) => (
                    <TableRow
                      key={u.id}
                      data-ocid={`admin.users.item.${idx + 1}`}
                      className={u.id === currentUser?.id ? "bg-primary/5" : ""}
                    >
                      <TableCell className="text-sm font-medium text-foreground">
                        {u.name}
                        {u.id === currentUser?.id && (
                          <span className="ml-1.5 text-xs text-primary">
                            (you)
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{u.username}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            u.role === "owner"
                              ? "bg-blue-100 text-blue-700 border-0 text-xs"
                              : u.role === "manager"
                                ? "bg-secondary text-muted-foreground border-0 text-xs"
                                : "bg-secondary text-muted-foreground border-0 text-xs"
                          }
                        >
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            data-ocid={`admin.users.edit_button.${idx + 1}`}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => openEdit(u)}
                          >
                            <Pencil size={12} />
                          </Button>
                          <Button
                            data-ocid={`admin.users.delete_button.${idx + 1}`}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                            disabled={u.id === currentUser?.id}
                            onClick={() => handleDelete(u)}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent data-ocid="admin.users.form.dialog" className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editUser ? "Edit User" : "Add User"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Full Name *</Label>
              <Input
                data-ocid="admin.users.name.input"
                value={uName}
                onChange={(e) => setUName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-sm">Username *</Label>
                <Input
                  data-ocid="admin.users.username.input"
                  value={uUsername}
                  onChange={(e) => setUUsername(e.target.value)}
                  placeholder="username"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Password *</Label>
                <Input
                  data-ocid="admin.users.password.input"
                  type="password"
                  value={uPassword}
                  onChange={(e) => setUPassword(e.target.value)}
                  placeholder="password"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Role *</Label>
              <Select
                value={uRole}
                onValueChange={(v) =>
                  setURole(v as "owner" | "manager" | "staff")
                }
              >
                <SelectTrigger data-ocid="admin.users.role.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 px-4 py-3 border-t border-border">
            <Button
              variant="outline"
              data-ocid="admin.users.form.cancel_button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.users.form.save_button"
              onClick={handleSave}
            >
              {editUser ? "Update" : "Add"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
