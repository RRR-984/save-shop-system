import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Clock,
  Pencil,
  Plus,
  Ruler,
  Settings,
  ShieldOff,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TopBar } from "../components/TopBar";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import type { AppUser, Product } from "../types/store";
import { ROLE_PERMISSIONS } from "../types/store";

export function AdminPage() {
  const { currentUser } = useAuth();
  const role = currentUser?.role ?? "staff";

  // Staff cannot access admin panel — show access denied
  if (role === "staff") {
    return (
      <div className="flex flex-col gap-6">
        <TopBar title="Admin Panel" />
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
                Aapke paas Admin Panel access nahi hai.
                <br />
                Sirf Owner aur Manager yahan aa sakte hain.
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
      <TopBar title="Admin Panel" />
      <div className="px-4 md:px-6 pb-6 flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground text-sm">
            Manage products, categories, units
            {isOwner ? ", users, and settings" : ""}
          </p>
          {!isOwner && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
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
            {/* Users tab — Owner only */}
            {canManageStaff && <TabsTrigger value="users">Users</TabsTrigger>}
            {/* Settings tab — Owner only */}
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
  const { shopSettings, updateShopSettings } = useStore();

  return (
    <div className="flex flex-col gap-4 max-w-lg">
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Ruler size={16} className="text-primary" />
            Unit Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mixed Units Toggle */}
          <div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-secondary/50">
            <div className="flex-1">
              <Label
                htmlFor="mixed-units-toggle"
                className="text-sm font-semibold cursor-pointer"
              >
                Allow Mixed Units (Length + Weight)
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Ek product mein Length (meter) aur Weight (kg) dono store karne
                ke liye enable karein.
              </p>
              {shopSettings.allowMixedUnits && (
                <div className="mt-2 text-xs text-primary font-medium">
                  ✅ Mixed Unit Mode is ON — Products ab dual unit mein add ho
                  sakte hain
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

          {/* Info box when mixed units ON */}
          {shopSettings.allowMixedUnits && (
            <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">
                💡 Mixed Unit Mode kya karta hai?
              </p>
              <p>
                • Product add karte waqt Length + Weight dono set kar sakte hain
              </p>
              <p>• Example: 1 Pipe = 6 meter = 15 kg</p>
              <p>• Smart Ratio set karo — auto calculate hoga</p>
              <p>• Display format: "10 meter (25 kg)"</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card border-border mt-4">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock size={16} className="text-primary" />
            Dead Stock Settings
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Kitne din tak sale na ho toh product ko "Dead Stock" maana jaaye
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
                  className="cursor-pointer text-sm font-medium"
                >
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {/* Custom days input */}
          {![90, 180, 365].includes(
            shopSettings.deadStockThresholdDays ?? 90,
          ) && (
            <div className="flex items-center gap-3 mt-2">
              <Label className="text-sm whitespace-nowrap">Custom Days:</Label>
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
                  const days = Number(e.target.value);
                  updateShopSettings({
                    deadStockThresholdDays: days,
                    deadStockCustomDays: days,
                  });
                }}
                placeholder="e.g. 45"
              />
              <span className="text-xs text-muted-foreground">din</span>
            </div>
          )}

          {/* Info */}
          <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 text-xs space-y-1">
            <p className="font-semibold text-amber-800 dark:text-amber-200">
              📊 Dead Stock Kya Hai?
            </p>
            <p className="text-amber-700 dark:text-amber-300">
              • Yellow (Slow):{" "}
              {Math.round((shopSettings.deadStockThresholdDays ?? 90) / 2)} din
              se zyada sale nahi hua
            </p>
            <p className="text-amber-700 dark:text-amber-300">
              • Red (Dead): {shopSettings.deadStockThresholdDays ?? 90} din se
              zyada sale nahi hua
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Products Manager ─────────────────────────────────────────────────────────────────
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

  // Required fields
  const [name, setName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [unit, setUnit] = useState("");
  const [minStock, setMinStock] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [profitPercent, setProfitPercent] = useState("");
  const [minProfitPct, setMinProfitPct] = useState("");
  // Optional vendor/purchase fields
  const [vendorName, setVendorName] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [initialQty, setInitialQty] = useState("");
  const [details, setDetails] = useState("");
  // New purchase detail fields
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [invoiceNo, setInvoiceNo] = useState("");
  const [billNo, setBillNo] = useState("");
  const [transportCharge, setTransportCharge] = useState("");
  const [labourCharge, setLabourCharge] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  // ── Mix Unit Mode state ──
  const [unitMode, setUnitMode] = useState<"single" | "mixed">("single");
  const [lengthUnit, setLengthUnit] = useState("");
  const [weightUnit, setWeightUnit] = useState("");
  const [meterToKgRatio, setMeterToKgRatio] = useState("");

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
    setExpiryDate("");
    setUnitMode("single");
    setLengthUnit("");
    setWeightUnit("");
    setMeterToKgRatio("");
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
    // Auto-compute profit % from existing prices
    if (p.purchasePrice != null && p.purchasePrice > 0) {
      const pp = ((p.sellingPrice - p.purchasePrice) / p.purchasePrice) * 100;
      setProfitPercent(pp > 0 ? pp.toFixed(2) : "");
    } else {
      setProfitPercent("");
    }
    setVendorName(p.vendorName ?? "");
    setPurchasePrice(p.purchasePrice != null ? String(p.purchasePrice) : "");
    setInitialQty(""); // initial qty only for new products
    setDetails(p.details ?? "");
    setPurchaseDate(new Date().toISOString().slice(0, 10));
    setInvoiceNo("");
    setBillNo("");
    setTransportCharge("");
    setLabourCharge("");
    setExpiryDate(p.expiryDate ?? "");
    // Mix Unit Mode
    setUnitMode(p.unitMode ?? "single");
    setLengthUnit(p.lengthUnit ?? "");
    setWeightUnit(p.weightUnit ?? "");
    setMeterToKgRatio(p.meterToKgRatio != null ? String(p.meterToKgRatio) : "");
    setShowForm(true);
  };

  const handleSave = () => {
    const missingFields: string[] = [];
    if (!name.trim()) missingFields.push("Product Name");
    if (!categoryName.trim()) missingFields.push("Category");
    if (!minStock) missingFields.push("Min Alert");
    if (!sellPrice) missingFields.push("Sell Price");

    // Validate unit based on mode
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

    // Build product data based on unit mode
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
      // Check for duplicate product name before creating
      const existingProduct = products.find(
        (p) => p.name.trim().toLowerCase() === data.name.trim().toLowerCase(),
      );
      if (existingProduct) {
        toast.warning(
          `"${data.name}" already exists — stock add kar dein ya naam badlein`,
        );
        setShowForm(false);
        return;
      }
      const newId = addProduct(data);
      // If initial qty provided, add a stock batch with all purchase details
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
        );
      }
      toast.success("Product added! ✓");
    }
    setShowForm(false);
  };

  const qty4cost = Number(initialQty || 0);
  // Final Cost (total) = purchasePrice × qty + transport + labour
  const finalCostTotal =
    Number(purchasePrice || 0) * qty4cost +
    Number(transportCharge || 0) +
    Number(labourCharge || 0);
  // Per-unit final cost
  const finalCostPerUnit =
    qty4cost > 0 ? finalCostTotal / qty4cost : Number(purchasePrice || 0);
  // Total selling price = finalCostTotal + finalCostTotal * profit% / 100
  const adminTotalSellingPrice =
    profitPercent !== "" && finalCostTotal > 0
      ? finalCostTotal + (finalCostTotal * Number(profitPercent)) / 100
      : sellPrice !== "" && qty4cost > 0
        ? Number(sellPrice) * qty4cost
        : 0;
  const adminPerUnitSellingPrice =
    qty4cost > 0 && adminTotalSellingPrice > 0
      ? adminTotalSellingPrice / qty4cost
      : 0;

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
                <p>Koi product nahi hai.</p>
                <p className="text-xs mt-1">
                  "Add Product" button se pehla product add karein.
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
                            <Badge className="ml-1 text-[10px] px-1 py-0 h-4 bg-blue-100 text-blue-700 border-0">
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
                          const costPrice = getProductCostPrice(p.id);
                          const profit = getProductProfit(p.id);
                          const profitPct = getProductProfitPct(p.id);
                          return (
                            <>
                              <TableCell className="text-xs">
                                {costPrice > 0 ? `₹${costPrice}` : "-"}
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
                                {costPrice > 0 ? `₹${profit.toFixed(2)}` : "-"}
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
                                {costPrice > 0
                                  ? `${profitPct.toFixed(1)}%`
                                  : "-"}
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
          className="max-w-md w-full"
        >
          <DialogHeader>
            <DialogTitle>
              {editProduct ? "Edit Product" : "Add Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {/* Required fields */}
            <div className="space-y-1.5">
              <Label className="text-sm">Product Name *</Label>
              <Input
                data-ocid="admin.products.name.input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Basmati Rice"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Category *</Label>
              <Input
                data-ocid="admin.products.category.input"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g. Grains, Dairy, Snacks"
                list="category-suggestions"
              />
              {categories.length > 0 && (
                <datalist id="category-suggestions">
                  {categories.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              )}
            </div>

            {/* Unit section — single vs mixed */}
            <div className="space-y-2">
              <Label className="text-sm">Unit *</Label>

              {/* If allowMixedUnits is ON, show mode toggle */}
              {shopSettings.allowMixedUnits && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    data-ocid="admin.products.unit_mode_single.toggle"
                    onClick={() => setUnitMode("single")}
                    className={`flex-1 text-sm py-1.5 px-3 rounded-md border transition-colors ${
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
                    className={`flex-1 text-sm py-1.5 px-3 rounded-md border transition-colors ${
                      unitMode === "mixed"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    Mixed Unit
                  </button>
                </div>
              )}

              {/* Single Unit input */}
              {unitMode === "single" && (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      data-ocid="admin.products.unit.input"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="kg"
                      list="unit-suggestions"
                    />
                    {shopUnits.length > 0 && (
                      <datalist id="unit-suggestions">
                        {shopUnits.map((u) => (
                          <option key={u.id} value={u.name} />
                        ))}
                      </datalist>
                    )}
                  </div>
                </div>
              )}

              {/* Mixed Unit inputs */}
              {unitMode === "mixed" && (
                <div className="space-y-2 p-3 rounded-lg border border-primary/20 bg-primary/5">
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
                        <option value="km" />
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
                        <option value="quintal" />
                        <option value="gram" />
                      </datalist>
                    </div>
                  </div>
                  {/* Smart Mode Ratio */}
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
                        onChange={(e) => setMeterToKgRatio(e.target.value)}
                        placeholder="2.5"
                        className="h-8 text-sm"
                        min="0"
                        step="0.01"
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {weightUnit || "kg"}
                      </span>
                    </div>
                    {meterToKgRatio && (
                      <p className="text-xs text-primary">
                        ✨ Auto calculate: 10 {lengthUnit || "meter"} →{" "}
                        {(10 * Number(meterToKgRatio)).toFixed(2)}{" "}
                        {weightUnit || "kg"}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-sm">Min Alert *</Label>
                <Input
                  data-ocid="admin.products.min_stock.input"
                  type="number"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                  placeholder="10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Cost Price (Lagat ₹)</Label>
                <Input
                  data-ocid="admin.products.cost_price.input"
                  type="number"
                  value={costPrice}
                  onChange={(e) => {
                    const cp = e.target.value;
                    setCostPrice(cp);
                    const cost = cp ? Number(cp) : finalCostPerUnit;
                    if (cost > 0 && sellPrice !== "") {
                      const pct = ((Number(sellPrice) - cost) / cost) * 100;
                      setProfitPercent(pct.toFixed(2));
                    }
                  }}
                  placeholder="e.g. 80"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-sm">Sell Price (₹) *</Label>
                <Input
                  data-ocid="admin.products.sell_price.input"
                  type="number"
                  value={sellPrice}
                  onChange={(e) => {
                    const sp = e.target.value;
                    setSellPrice(sp);
                    if (finalCostTotal > 0 && sp !== "" && qty4cost > 0) {
                      const totalSell = Number(sp) * qty4cost;
                      const pct =
                        ((totalSell - finalCostTotal) / finalCostTotal) * 100;
                      setProfitPercent(pct.toFixed(2));
                    } else {
                      setProfitPercent("");
                    }
                  }}
                  placeholder="100"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Profit %</Label>
                <Input
                  data-ocid="admin.products.profit_percent.input"
                  type="number"
                  value={profitPercent}
                  min="0"
                  onChange={(e) => {
                    const pct = e.target.value;
                    if (Number(pct) < 0) return;
                    setProfitPercent(pct);
                    if (finalCostTotal > 0 && pct !== "" && qty4cost > 0) {
                      const totalSell =
                        finalCostTotal + (finalCostTotal * Number(pct)) / 100;
                      setSellPrice((totalSell / qty4cost).toFixed(2));
                    }
                  }}
                  placeholder="20"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Minimum Profit % (Min Profit)</Label>
              <Input
                data-ocid="admin.products.min_profit_pct.input"
                type="number"
                value={minProfitPct}
                min="0"
                max="100"
                onChange={(e) => {
                  const val = e.target.value;
                  if (Number(val) < 0) return;
                  setMinProfitPct(val);
                }}
                placeholder="e.g. 10"
              />
              <p className="text-[11px] text-muted-foreground">
                Har sale mein itna profit zaroor hoga — staff is se kam rate par
                sell nahi kar sakta
              </p>
            </div>

            {/* Divider for optional fields */}
            <div className="border-t border-border pt-2">
              <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                Optional Details
              </p>
            </div>

            {/* Vendor + Purchase Price */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-sm">Vendor Name</Label>
                <Input
                  data-ocid="admin.products.vendor.input"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g. Sharma Traders"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Purchase Price (₹)</Label>
                <Input
                  data-ocid="admin.products.purchase_price.input"
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => {
                    const cp = e.target.value;
                    setPurchasePrice(cp);
                    const qty = Number(initialQty || 0);
                    const totalCost =
                      Number(cp) * qty +
                      Number(transportCharge || 0) +
                      Number(labourCharge || 0);
                    if (profitPercent !== "" && totalCost > 0 && qty > 0) {
                      const totalSell =
                        totalCost + (totalCost * Number(profitPercent)) / 100;
                      setSellPrice((totalSell / qty).toFixed(2));
                    } else if (sellPrice !== "" && totalCost > 0 && qty > 0) {
                      const totalSell = Number(sellPrice) * qty;
                      const pct = ((totalSell - totalCost) / totalCost) * 100;
                      setProfitPercent(pct.toFixed(2));
                    }
                  }}
                  placeholder="80"
                />
              </div>
            </div>

            {/* Initial Qty — only for new products */}
            {!editProduct && (
              <div className="space-y-1.5">
                <Label className="text-sm">Initial Qty (Opening Stock)</Label>
                <Input
                  data-ocid="admin.products.initial_qty.input"
                  type="number"
                  value={initialQty}
                  onChange={(e) => setInitialQty(e.target.value)}
                  placeholder="e.g. 50"
                />
                <p className="text-xs text-muted-foreground">
                  Shuru mein kitna stock hai? Ek stock batch ban jayega.
                </p>
              </div>
            )}

            {/* Purchase Date + Invoice + Bill — only for new products with initial qty */}
            {!editProduct && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-sm">Purchase Date</Label>
                  <Input
                    data-ocid="admin.products.purchase_date.input"
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Invoice No</Label>
                    <Input
                      data-ocid="admin.products.invoice_no.input"
                      value={invoiceNo}
                      onChange={(e) => setInvoiceNo(e.target.value)}
                      placeholder="e.g. INV-001"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Bill No</Label>
                    <Input
                      data-ocid="admin.products.bill_no.input"
                      value={billNo}
                      onChange={(e) => setBillNo(e.target.value)}
                      placeholder="e.g. BILL-2024-01"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Transport Charge (₹)</Label>
                    <Input
                      data-ocid="admin.products.transport.input"
                      type="number"
                      value={transportCharge}
                      onChange={(e) => {
                        const tc = e.target.value;
                        setTransportCharge(tc);
                        const qty = Number(initialQty || 0);
                        const totalCost =
                          Number(purchasePrice || 0) * qty +
                          Number(tc) +
                          Number(labourCharge || 0);
                        if (profitPercent !== "" && totalCost > 0 && qty > 0) {
                          const totalSell =
                            totalCost +
                            (totalCost * Number(profitPercent)) / 100;
                          setSellPrice((totalSell / qty).toFixed(2));
                        } else if (
                          sellPrice !== "" &&
                          totalCost > 0 &&
                          qty > 0
                        ) {
                          const totalSell = Number(sellPrice) * qty;
                          const pct =
                            ((totalSell - totalCost) / totalCost) * 100;
                          setProfitPercent(pct.toFixed(2));
                        }
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Labour Charge (₹)</Label>
                    <Input
                      data-ocid="admin.products.labour.input"
                      type="number"
                      value={labourCharge}
                      onChange={(e) => {
                        const lc = e.target.value;
                        setLabourCharge(lc);
                        const qty = Number(initialQty || 0);
                        const totalCost =
                          Number(purchasePrice || 0) * qty +
                          Number(transportCharge || 0) +
                          Number(lc);
                        if (profitPercent !== "" && totalCost > 0 && qty > 0) {
                          const totalSell =
                            totalCost +
                            (totalCost * Number(profitPercent)) / 100;
                          setSellPrice((totalSell / qty).toFixed(2));
                        } else if (
                          sellPrice !== "" &&
                          totalCost > 0 &&
                          qty > 0
                        ) {
                          const totalSell = Number(sellPrice) * qty;
                          const pct =
                            ((totalSell - totalCost) / totalCost) * 100;
                          setProfitPercent(pct.toFixed(2));
                        }
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>
                {Number(initialQty) > 0 && (
                  <div className="bg-secondary/60 rounded-lg p-3 text-sm space-y-1">
                    <p className="font-medium text-foreground">
                      📦 Cost & Profit Summary
                    </p>
                    <div className="space-y-1 text-muted-foreground">
                      <div className="flex justify-between">
                        <span>
                          Purchase: ₹{Number(purchasePrice || 0)} × {qty4cost}
                        </span>
                        <span className="text-foreground">
                          ₹{(Number(purchasePrice || 0) * qty4cost).toFixed(2)}
                        </span>
                      </div>
                      {Number(transportCharge) > 0 && (
                        <div className="flex justify-between">
                          <span>+ Transport</span>
                          <span className="text-foreground">
                            ₹{Number(transportCharge).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {Number(labourCharge) > 0 && (
                        <div className="flex justify-between">
                          <span>+ Labour</span>
                          <span className="text-foreground">
                            ₹{Number(labourCharge).toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-border pt-1 mt-1 font-semibold text-foreground">
                        <span>Final Cost (Total)</span>
                        <span>₹{finalCostTotal.toFixed(2)}</span>
                      </div>
                      {qty4cost > 0 && finalCostPerUnit > 0 && (
                        <div className="flex justify-between text-blue-600 dark:text-blue-400">
                          <span>Per Unit Cost</span>
                          <span>₹{finalCostPerUnit.toFixed(2)}</span>
                        </div>
                      )}
                      {adminTotalSellingPrice > 0 && (
                        <>
                          <div className="flex justify-between text-green-600 dark:text-green-400 font-semibold border-t border-border pt-1 mt-1">
                            <span>Selling Price (Total)</span>
                            <span>₹{adminTotalSellingPrice.toFixed(2)}</span>
                          </div>
                          {qty4cost > 0 && (
                            <div className="flex justify-between text-green-600 dark:text-green-400">
                              <span>Per Unit Selling Price</span>
                              <span>
                                ₹{adminPerUnitSellingPrice.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Details / Notes */}
            <div className="space-y-1.5">
              <Label className="text-sm">Expiry Date</Label>
              <Input
                data-ocid="admin.products.expiry_date.input"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Optional: agar product ki expiry hai
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Details / Notes</Label>
              <Textarea
                data-ocid="admin.products.details.textarea"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Koi bhi extra details ya notes..."
                rows={2}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="admin.products.form.cancel_button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.products.form.save_button"
              onClick={handleSave}
            >
              {editProduct ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Categories Manager ─────────────────────────────────────────────────────────────────
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
            Koi category nahi hai. Upar se add karein.
          </p>
        )}
        {categories.map((c, idx) => (
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
                  <span className="text-sm font-medium">{c.name}</span>
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

// ── Units Manager ──────────────────────────────────────────────────────────────────────
function UnitsManager() {
  const { shopUnits, addShopUnit, deleteShopUnit } = useStore();
  const [newUnit, setNewUnit] = useState("");

  const COMMON_UNITS = [
    "kg",
    "gram",
    "litre",
    "ml",
    "pcs",
    "box",
    "dozen",
    "bundle",
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
            <p className="text-sm">Koi unit nahi hai.</p>
            <p className="text-xs mt-1">
              Upar se unit add karein ya common units use karein.
            </p>
          </div>
        ) : (
          shopUnits.map((u, idx) => (
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
                  <span className="text-sm font-medium">{u.name}</span>
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

// ── Users Manager ────────────────────────────────────────────────────────────────────
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
      toast.error("Aap khud ko delete nahi kar sakte");
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
                Koi user nahi hai.
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
                      <TableCell className="text-sm font-medium">
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
                                ? "bg-purple-100 text-purple-700 border-0 text-xs"
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
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
