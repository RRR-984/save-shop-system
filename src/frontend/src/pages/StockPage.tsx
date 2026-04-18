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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
  ArrowDownToLine,
  ArrowUpFromLine,
  Layers,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { VoiceInputButton } from "../components/VoiceInputButton";
import { useLanguage } from "../context/LanguageContext";
import { useStore } from "../context/StoreContext";
import { useAsyncAction } from "../hooks/useAsyncAction";
import type { NavPage, Product, StockBatch } from "../types/store";
import { clearLeadingZeros } from "../utils/numberInput";
import type { ParsedVoiceCommand } from "../utils/voiceParser";

/** Format qty display for mixed-unit products */
function formatBatchQty(product: Product, batch: StockBatch): string {
  if (
    product.unitMode === "mixed" &&
    batch.lengthQty != null &&
    batch.weightQty != null
  ) {
    return `${batch.lengthQty} ${product.lengthUnit || ""} (${batch.weightQty} ${product.weightUnit || ""})`;
  }
  if (product.unitMode === "mixed" && batch.lengthQty != null) {
    return `${batch.lengthQty} ${product.lengthUnit || ""}`;
  }
  return `${batch.quantity} ${product.unit}`;
}

const STOCK_FORM_DRAFT_KEY = "saveshop_stock_form_draft";

export function StockPage({
  onNavigate,
}: {
  onNavigate?: (page: NavPage) => void;
}) {
  const {
    products,
    transactions,
    addStockIn,
    addStockOut,
    getProductStock,
    getProductBatches,
    addProduct,
    updateProduct,
    addCategory,
    categories,
    shopId,
    appConfig,
  } = useStore();
  const { t, language } = useLanguage();

  // ── Form draft protection ────────────────────────────────────────────────
  const [showResumeBanner, setShowResumeBanner] = useState(false);

  // Debug: log products when Stock page loads
  useEffect(() => {
    console.log("[StockPage] shopId:", shopId);
    console.log("[StockPage] products count:", products.length, products);
  }, [shopId, products]);

  // Stock In form
  const [inProduct, setInProduct] = useState("");
  const [inQty, setInQty] = useState("");
  const [inRate, setInRate] = useState("");
  const [inDate, setInDate] = useState(new Date().toISOString().slice(0, 10));
  const [inNote, setInNote] = useState("");
  // New purchase detail fields
  const [inInvoiceNo, setInInvoiceNo] = useState("");
  const [inBillNo, setInBillNo] = useState("");
  const [inTransport, setInTransport] = useState("");
  const [inLabour, setInLabour] = useState("");
  const [inOtherCharges, setInOtherCharges] = useState("");
  const [inExpiryDate, setInExpiryDate] = useState("");
  // Stock In: sell price / profit %
  const [inSellPrice, setInSellPrice] = useState("");
  const [inProfitPercent, setInProfitPercent] = useState("");
  // Stock In: retailer / wholesaler price
  const [inRetailerPrice, setInRetailerPrice] = useState("");
  const [inWholesalerPrice, setInWholesalerPrice] = useState("");
  // Mixed Unit: dual qty
  const [inLengthQty, setInLengthQty] = useState("");
  const [inWeightQty, setInWeightQty] = useState("");

  // Extra details toggle — OFF by default
  const [showExtraDetails, setShowExtraDetails] = useState(false);

  // ── Load form draft on mount ─────────────────────────────────────────────
  useEffect(() => {
    try {
      const draftKey = `${STOCK_FORM_DRAFT_KEY}_${shopId}`;
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft?.productId || draft?.rate || draft?.qty) {
          setShowResumeBanner(true);
        }
      }
    } catch {
      /* ignore */
    }
  }, [shopId]);

  // ── Auto-save draft on field change ──────────────────────────────────────
  useEffect(() => {
    if (!inProduct && !inQty && !inRate) return;
    try {
      const draftKey = `${STOCK_FORM_DRAFT_KEY}_${shopId}`;
      const draft = {
        productId: inProduct,
        qty: inQty,
        rate: inRate,
        transport: inTransport,
        labour: inLabour,
        otherCharges: inOtherCharges,
        sellPrice: inSellPrice,
        profitPercent: inProfitPercent,
      };
      localStorage.setItem(draftKey, JSON.stringify(draft));
    } catch {
      /* ignore */
    }
  }, [
    inProduct,
    inQty,
    inRate,
    inTransport,
    inLabour,
    inOtherCharges,
    inSellPrice,
    inProfitPercent,
    shopId,
  ]);

  // ── Quick Add Product dialog ──────────────────────────────────────────────
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [qaName, setQaName] = useState("");
  const [qaCategory, setQaCategory] = useState("");
  const [qaUnit, setQaUnit] = useState("");
  const [qaMinStock, setQaMinStock] = useState("");
  const [qaSellPrice, setQaSellPrice] = useState("");

  const resetQuickAdd = () => {
    setQaName("");
    setQaCategory("");
    setQaUnit("");
    setQaMinStock("");
    setQaSellPrice("");
  };

  const handleQuickAddProduct = () => {
    if (!qaName.trim()) {
      toast.error("Product name required");
      return;
    }
    if (!qaUnit.trim()) {
      toast.error("Unit required (e.g. kg, piece, liter)");
      return;
    }
    const duplicate = products.find(
      (p) => p.name.trim().toLowerCase() === qaName.trim().toLowerCase(),
    );
    if (duplicate) {
      toast.warning(`"${qaName}" already exists`);
      return;
    }

    let catId = categories.find(
      (c) => c.name.toLowerCase() === qaCategory.trim().toLowerCase(),
    )?.id;
    if (!catId && qaCategory.trim()) {
      catId = addCategory(qaCategory.trim());
    }
    if (!catId) {
      catId = addCategory("General");
    }

    const newId = addProduct({
      name: qaName.trim(),
      categoryId: catId,
      unit: qaUnit.trim(),
      minStockAlert: qaMinStock ? Number(qaMinStock) : 0,
      sellingPrice: qaSellPrice ? Number(qaSellPrice) : 0,
      unitMode: "single",
    });

    // Auto-select the new product in Stock In dropdown
    handleInProductChange(newId);
    toast.success(`"${qaName.trim()}" added successfully!`);
    resetQuickAdd();
    setShowQuickAdd(false);
  };

  // Stock Out form
  const [outProduct, setOutProduct] = useState("");
  const [outQty, setOutQty] = useState("");
  const [outNote, setOutNote] = useState("");

  // Derived: selected product for Stock In
  const selectedInProduct = products.find((p) => p.id === inProduct) ?? null;
  const isMixedIn = selectedInProduct?.unitMode === "mixed";

  // Handler to change inProduct and reset qty fields
  const handleInProductChange = (productId: string) => {
    setInProduct(productId);
    setInLengthQty("");
    setInWeightQty("");
    setInQty("");
  };

  // Voice input handler for Stock In form
  const handleVoiceParsed = (parsed: ParsedVoiceCommand) => {
    let applied = false;
    if (parsed.quantity !== null) {
      setInQty(String(parsed.quantity));
      applied = true;
    }
    if (parsed.price !== null) {
      setInRate(String(parsed.price));
      applied = true;
    }
    if (parsed.itemName !== null) {
      const match = products.find(
        (p) =>
          p.name.trim().toLowerCase() === parsed.itemName!.trim().toLowerCase(),
      );
      if (match) {
        handleInProductChange(match.id);
        applied = true;
      }
    }
    if (applied) {
      toast.success(t("Voice input applied — please review and save"));
    }
  };

  const { execute: submitStockIn, isLoading: isStockInSaving } = useAsyncAction(
    async () => {
      if (!inProduct || !inRate) {
        toast.error("Please fill all required fields");
        return;
      }

      let qty: number;
      let lengthQtyVal: number | undefined;
      let weightQtyVal: number | undefined;

      if (isMixedIn) {
        if (!inLengthQty) {
          toast.error("Please enter Length Quantity");
          return;
        }
        lengthQtyVal = Number(inLengthQty);
        weightQtyVal = inWeightQty ? Number(inWeightQty) : undefined;
        qty = lengthQtyVal;
      } else {
        if (!inQty) {
          toast.error("Please fill all required fields");
          return;
        }
        qty = Number(inQty);
      }

      const rate = Number(inRate);
      if (qty <= 0 || rate <= 0) {
        toast.error("Quantity and rate must be positive");
        return;
      }
      addStockIn(
        inProduct,
        qty,
        rate,
        new Date(inDate).toISOString(),
        inNote || "Stock purchase",
        inInvoiceNo.trim() || undefined,
        inBillNo.trim() || undefined,
        inTransport ? Number(inTransport) : undefined,
        inLabour ? Number(inLabour) : undefined,
        inExpiryDate.trim() || undefined,
        lengthQtyVal,
        weightQtyVal,
        inOtherCharges ? Number(inOtherCharges) : undefined,
      );
      // Sync sell/retailer/wholesaler price back to product record
      if (inProduct) {
        const priceUpdates: Record<string, number> = {};
        if (inSellPrice && Number(inSellPrice) > 0) {
          priceUpdates.sellingPrice = Number(inSellPrice);
        }
        if (inRetailerPrice && Number(inRetailerPrice) > 0) {
          priceUpdates.retailerPrice = Number(inRetailerPrice);
        }
        if (inWholesalerPrice && Number(inWholesalerPrice) > 0) {
          priceUpdates.wholesalerPrice = Number(inWholesalerPrice);
        }
        if (Object.keys(priceUpdates).length > 0) {
          updateProduct(inProduct, priceUpdates);
        }
      }
      // Clear draft on success
      try {
        localStorage.removeItem(`${STOCK_FORM_DRAFT_KEY}_${shopId}`);
        setShowResumeBanner(false);
      } catch {
        /* ignore */
      }
      toast.success("Stock added successfully!");
      setInQty("");
      setInRate("");
      setInNote("");
      setInInvoiceNo("");
      setInBillNo("");
      setInTransport("");
      setInLabour("");
      setInOtherCharges("");
      setInExpiryDate("");
      setInSellPrice("");
      setInProfitPercent("");
      setInRetailerPrice("");
      setInWholesalerPrice("");
      setInLengthQty("");
      setInWeightQty("");
      // Navigate to inventory so user sees updated stock
      if (onNavigate) onNavigate("inventory");
    },
  );

  const handleStockIn = () => {
    void submitStockIn();
  };

  const handleStockOut = () => {
    if (!outProduct || !outQty) {
      toast.error("Please fill all required fields");
      return;
    }
    const qty = Number(outQty);
    if (qty <= 0) {
      toast.error("Quantity must be positive");
      return;
    }
    const available = getProductStock(outProduct);
    if (qty > available) {
      toast.error(`Only ${available} units available in stock`);
      return;
    }
    addStockOut(outProduct, qty, outNote || "Manual stock out");
    toast.success("Stock removed (FIFO deduction applied)");
    setOutQty("");
    setOutNote("");
  };

  // Live cost summary
  const effectiveQty = isMixedIn
    ? Number(inLengthQty || 0)
    : Number(inQty || 0);
  const purchaseSubtotal = Number(inRate || 0) * effectiveQty;
  const totalFinalCost =
    purchaseSubtotal +
    Number(inTransport || 0) +
    Number(inLabour || 0) +
    Number(inOtherCharges || 0);
  // Per-unit cost
  const inPerUnitCost = effectiveQty > 0 ? totalFinalCost / effectiveQty : 0;
  // Total selling price = finalCost + finalCost * profit% / 100
  const inTotalSellingPrice =
    inProfitPercent !== "" && totalFinalCost > 0
      ? totalFinalCost + (totalFinalCost * Number(inProfitPercent)) / 100
      : inSellPrice !== "" && effectiveQty > 0
        ? Number(inSellPrice) * effectiveQty
        : 0;
  const inPerUnitSellingPrice =
    effectiveQty > 0 && inTotalSellingPrice > 0
      ? inTotalSellingPrice / effectiveQty
      : 0;

  // Selected product details for Stock Out
  const selectedOutProduct = products.find((p) => p.id === outProduct);
  const outBatches = outProduct ? getProductBatches(outProduct) : [];
  const outTotalStock = outProduct ? getProductStock(outProduct) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="px-4 md:px-6 pb-6 flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold">Stock Management</h1>
          <p className="text-muted-foreground text-sm">
            Add or remove stock with automatic FIFO deduction
          </p>
        </div>

        <Tabs defaultValue="in">
          <TabsList
            data-ocid="stock.tab"
            className="mb-4 flex-wrap h-auto gap-1"
          >
            <TabsTrigger value="in">
              <ArrowDownToLine size={14} className="mr-2" /> Stock In
            </TabsTrigger>
            <TabsTrigger value="bulk">
              <Layers size={14} className="mr-2" /> Bulk Stock In
            </TabsTrigger>
            <TabsTrigger value="out">
              <ArrowUpFromLine size={14} className="mr-2" /> Stock Out
            </TabsTrigger>
          </TabsList>

          {/* Stock In */}
          <TabsContent value="in">
            <Card className="shadow-card border-border max-w-lg">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowDownToLine size={16} className="text-success" /> Add
                  Stock (Incoming)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Product *</Label>
                    {(appConfig.featureMode ?? 3) === 3 && (
                      <VoiceInputButton
                        compact
                        onParsed={handleVoiceParsed}
                        lang={language === "hi" ? "hi-IN" : "en-IN"}
                        data-ocid="stock.in.voice_input.button"
                      />
                    )}
                  </div>
                  <Select
                    value={inProduct}
                    onValueChange={handleInProductChange}
                  >
                    <SelectTrigger data-ocid="stock.in.product.select">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* ── Quick Add New Product ── */}
                      <button
                        type="button"
                        data-ocid="stock.in.add_new_product.button"
                        className="flex w-full items-center gap-2 px-2 py-1.5 text-sm font-medium text-primary cursor-pointer rounded-sm hover:bg-primary/10 focus-visible:bg-primary/10 outline-none transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowQuickAdd(true);
                        }}
                      >
                        <Plus size={14} className="shrink-0" />
                        <span>Add New Product</span>
                      </button>
                      <Separator className="my-1" />
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}{" "}
                          {p.unitMode === "mixed"
                            ? `(Mixed: ${p.lengthUnit}+${p.weightUnit})`
                            : `(Stock: ${getProductStock(p.id)} ${p.unit})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Mixed Unit badge when product has mixed mode */}
                {isMixedIn && selectedInProduct && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md border border-blue-200">
                    <Badge className="text-xs bg-blue-100 text-blue-700 border-0">
                      Mixed Unit
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {selectedInProduct.lengthUnit} +{" "}
                      {selectedInProduct.weightUnit}
                      {selectedInProduct.meterToKgRatio &&
                        ` • 1 ${selectedInProduct.lengthUnit} = ${selectedInProduct.meterToKgRatio} ${selectedInProduct.weightUnit}`}
                    </span>
                  </div>
                )}

                {/* Qty section — single or mixed */}
                {isMixedIn && selectedInProduct ? (
                  <div className="space-y-2 p-3 rounded-lg border border-primary/20 bg-primary/5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Quantity (Mixed Unit)
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm">
                          {selectedInProduct.lengthUnit || "Length"} Qty *
                        </Label>
                        <Input
                          data-ocid="stock.in.length_qty.input"
                          type="number"
                          placeholder={`e.g. 10 ${selectedInProduct.lengthUnit || "meter"}`}
                          value={inLengthQty}
                          onFocus={(e) => {
                            if (e.target.value === "0") e.target.select();
                          }}
                          onChange={(e) => {
                            const val = clearLeadingZeros(e.target.value);
                            setInLengthQty(val);
                            // Smart Mode auto-calculate weight
                            if (
                              selectedInProduct.meterToKgRatio &&
                              val !== ""
                            ) {
                              const wt =
                                Number(val) * selectedInProduct.meterToKgRatio;
                              setInWeightQty(wt.toFixed(2));
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm">
                          {selectedInProduct.weightUnit || "Weight"} Qty
                        </Label>
                        <Input
                          data-ocid="stock.in.weight_qty.input"
                          type="number"
                          placeholder={`e.g. 25 ${selectedInProduct.weightUnit || "kg"}`}
                          value={inWeightQty}
                          onFocus={(e) => {
                            if (e.target.value === "0") e.target.select();
                          }}
                          onChange={(e) => {
                            const val = clearLeadingZeros(e.target.value);
                            setInWeightQty(val);
                            // Smart Mode auto-calculate length
                            if (
                              selectedInProduct.meterToKgRatio &&
                              val !== ""
                            ) {
                              const len =
                                Number(val) / selectedInProduct.meterToKgRatio;
                              setInLengthQty(len.toFixed(2));
                            }
                          }}
                        />
                      </div>
                    </div>
                    {inLengthQty && inWeightQty && (
                      <p className="text-xs text-primary">
                        📦 Will save:{" "}
                        <strong>
                          {inLengthQty} {selectedInProduct.lengthUnit}
                        </strong>{" "}
                        +{" "}
                        <strong>
                          {inWeightQty} {selectedInProduct.weightUnit}
                        </strong>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm">Quantity *</Label>
                      <Input
                        data-ocid="stock.in.qty.input"
                        type="number"
                        placeholder="e.g. 50"
                        value={inQty}
                        onFocus={(e) => {
                          if (e.target.value === "0") e.target.select();
                        }}
                        onChange={(e) => {
                          const qty = clearLeadingZeros(e.target.value);
                          setInQty(qty);
                          const qtyNum = Number(qty || 0);
                          const cost =
                            qtyNum > 0
                              ? Number(inRate || 0) +
                                (Number(inTransport || 0) +
                                  Number(inLabour || 0)) /
                                  qtyNum
                              : Number(inRate || 0);
                          if (inProfitPercent !== "" && cost > 0) {
                            const sp =
                              cost + (cost * Number(inProfitPercent)) / 100;
                            setInSellPrice(sp.toFixed(2));
                          } else if (inSellPrice !== "" && cost > 0) {
                            const pct =
                              ((Number(inSellPrice) - cost) / cost) * 100;
                            setInProfitPercent(pct.toFixed(2));
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">Purchase Rate (₹) *</Label>
                      <Input
                        data-ocid="stock.in.rate.input"
                        type="number"
                        placeholder="e.g. 80"
                        value={inRate}
                        onFocus={(e) => {
                          if (e.target.value === "0") e.target.select();
                        }}
                        onChange={(e) => {
                          const rate = clearLeadingZeros(e.target.value);
                          setInRate(rate);
                          const qty = Number(inQty || 0);
                          const cost =
                            qty > 0
                              ? Number(rate) +
                                (Number(inTransport || 0) +
                                  Number(inLabour || 0)) /
                                  qty
                              : Number(rate);
                          if (inProfitPercent !== "" && cost > 0) {
                            const sp =
                              cost + (cost * Number(inProfitPercent)) / 100;
                            setInSellPrice(sp.toFixed(2));
                          } else if (inSellPrice !== "" && cost > 0) {
                            const pct =
                              ((Number(inSellPrice) - cost) / cost) * 100;
                            setInProfitPercent(pct.toFixed(2));
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Rate row for mixed mode */}
                {isMixedIn && (
                  <div className="space-y-1.5">
                    <Label className="text-sm">Purchase Rate (₹) *</Label>
                    <Input
                      data-ocid="stock.in.rate.input"
                      type="number"
                      placeholder="e.g. 80"
                      value={inRate}
                      onFocus={(e) => {
                        if (e.target.value === "0") e.target.select();
                      }}
                      onChange={(e) =>
                        setInRate(clearLeadingZeros(e.target.value))
                      }
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-sm">Purchase Date</Label>
                  <Input
                    data-ocid="stock.in.date.input"
                    type="date"
                    value={inDate}
                    onChange={(e) => setInDate(e.target.value)}
                  />
                </div>

                {/* ── Expiry Date — always visible ─────────────────────── */}
                <div className="space-y-1.5">
                  <Label className="text-sm">Expiry Date</Label>
                  <Input
                    data-ocid="stock.in.expiry_date.input"
                    type="date"
                    value={inExpiryDate}
                    onChange={(e) => setInExpiryDate(e.target.value)}
                  />
                </div>

                {/* ── Sell Price, Profit % — always visible ─────────────── */}
                {!isMixedIn && (
                  <>
                    <div className="border-t border-border pt-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
                        Selling Prices
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm">
                          Regular Sell Price (₹)
                        </Label>
                        <Input
                          data-ocid="stock.in.sell_price.input"
                          type="number"
                          placeholder="e.g. 120"
                          value={inSellPrice}
                          onFocus={(e) => {
                            if (e.target.value === "0") e.target.select();
                          }}
                          onChange={(e) => {
                            const sp = clearLeadingZeros(e.target.value);
                            setInSellPrice(sp);
                            if (
                              totalFinalCost > 0 &&
                              sp !== "" &&
                              effectiveQty > 0
                            ) {
                              const totalSell = Number(sp) * effectiveQty;
                              const pct =
                                ((totalSell - totalFinalCost) /
                                  totalFinalCost) *
                                100;
                              setInProfitPercent(pct.toFixed(2));
                            } else {
                              setInProfitPercent("");
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm">Profit %</Label>
                        <Input
                          data-ocid="stock.in.profit_percent.input"
                          type="number"
                          min="0"
                          placeholder="e.g. 20"
                          value={inProfitPercent}
                          onFocus={(e) => {
                            if (e.target.value === "0") e.target.select();
                          }}
                          onChange={(e) => {
                            const pct = clearLeadingZeros(e.target.value);
                            if (Number(pct) < 0) return;
                            setInProfitPercent(pct);
                            if (
                              totalFinalCost > 0 &&
                              pct !== "" &&
                              effectiveQty > 0
                            ) {
                              const totalSell =
                                totalFinalCost +
                                (totalFinalCost * Number(pct)) / 100;
                              setInSellPrice(
                                (totalSell / effectiveQty).toFixed(2),
                              );
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm">Retailer Price (₹)</Label>
                        <Input
                          data-ocid="stock.in.retailer_price.input"
                          type="number"
                          placeholder="e.g. 110"
                          value={inRetailerPrice}
                          onFocus={(e) => {
                            if (e.target.value === "0") e.target.select();
                          }}
                          onChange={(e) =>
                            setInRetailerPrice(
                              clearLeadingZeros(e.target.value),
                            )
                          }
                        />
                        <p className="text-[10px] text-muted-foreground">
                          दुकानदार price
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm">Wholesaler Price (₹)</Label>
                        <Input
                          data-ocid="stock.in.wholesaler_price.input"
                          type="number"
                          placeholder="e.g. 100"
                          value={inWholesalerPrice}
                          onFocus={(e) => {
                            if (e.target.value === "0") e.target.select();
                          }}
                          onChange={(e) =>
                            setInWholesalerPrice(
                              clearLeadingZeros(e.target.value),
                            )
                          }
                        />
                        <p className="text-[10px] text-muted-foreground">
                          थोक price
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* ── Cost & Profit Summary — always visible ────────────── */}
                {(effectiveQty > 0 || Number(inRate) > 0) && (
                  <div className="bg-secondary/50 rounded-lg p-3 text-sm space-y-1.5">
                    <p className="font-semibold text-foreground flex items-center gap-1">
                      📦 Cost & Profit Summary
                    </p>
                    <div className="space-y-1 text-muted-foreground">
                      <div className="flex justify-between">
                        <span>
                          Purchase: ₹{inRate || 0} × {effectiveQty || 0}
                        </span>
                        <span className="text-foreground font-medium">
                          ₹{purchaseSubtotal.toFixed(2)}
                        </span>
                      </div>
                      {Number(inTransport) > 0 && (
                        <div className="flex justify-between">
                          <span>+ Transport</span>
                          <span className="text-foreground">
                            ₹{Number(inTransport).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {Number(inLabour) > 0 && (
                        <div className="flex justify-between">
                          <span>+ Labour</span>
                          <span className="text-foreground">
                            ₹{Number(inLabour).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {Number(inOtherCharges) > 0 && (
                        <div className="flex justify-between">
                          <span>+ Other Charges</span>
                          <span className="text-foreground">
                            ₹{Number(inOtherCharges).toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-border pt-1 mt-1 font-semibold text-foreground">
                        <span>Final Cost (Total)</span>
                        <span>₹{totalFinalCost.toFixed(2)}</span>
                      </div>
                      {effectiveQty > 0 && inPerUnitCost > 0 && (
                        <div className="flex justify-between text-blue-600 dark:text-blue-400">
                          <span>Per Unit Cost</span>
                          <span>₹{inPerUnitCost.toFixed(2)}</span>
                        </div>
                      )}
                      {inTotalSellingPrice > 0 && (
                        <>
                          <div className="flex justify-between text-green-600 dark:text-green-400 font-semibold border-t border-border pt-1 mt-1">
                            <span>Selling Price (Total)</span>
                            <span>₹{inTotalSellingPrice.toFixed(2)}</span>
                          </div>
                          {effectiveQty > 0 && (
                            <div className="flex justify-between text-green-600 dark:text-green-400">
                              <span>Per Unit Selling Price</span>
                              <span>₹{inPerUnitSellingPrice.toFixed(2)}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Extra Details Toggle ─────────────────────────────── */}
                <div className="flex items-center gap-2.5 py-1">
                  <Switch
                    id="extra-details-toggle"
                    data-ocid="stock.in.extra_details.toggle"
                    checked={showExtraDetails}
                    onCheckedChange={setShowExtraDetails}
                  />
                  <label
                    htmlFor="extra-details-toggle"
                    className="text-sm font-medium text-indigo-600 cursor-pointer select-none"
                  >
                    + Extra Details (Invoice, Charges, Notes)
                  </label>
                </div>

                {/* ── Extra Fields (hidden when toggle is OFF) ─────────── */}
                <div style={{ display: showExtraDetails ? "block" : "none" }}>
                  <div className="space-y-4">
                    {/* Divider */}
                    <div className="border-t border-border pt-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
                        Purchase Details (Optional)
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm">Invoice No</Label>
                        <Input
                          data-ocid="stock.in.invoice_no.input"
                          placeholder="e.g. INV-001"
                          value={inInvoiceNo}
                          onChange={(e) => setInInvoiceNo(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm">Bill No</Label>
                        <Input
                          data-ocid="stock.in.bill_no.input"
                          placeholder="e.g. BILL-2024-01"
                          value={inBillNo}
                          onChange={(e) => setInBillNo(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm">Transport Charge (₹)</Label>
                        <Input
                          data-ocid="stock.in.transport.input"
                          type="number"
                          placeholder="0"
                          value={inTransport}
                          onFocus={(e) => {
                            if (e.target.value === "0") e.target.select();
                          }}
                          onChange={(e) => {
                            const tc = clearLeadingZeros(e.target.value);
                            setInTransport(tc);
                            if (!isMixedIn) {
                              const qty = effectiveQty;
                              const totalCost =
                                Number(inRate || 0) * qty +
                                Number(tc) +
                                Number(inLabour || 0) +
                                Number(inOtherCharges || 0);
                              if (
                                inProfitPercent !== "" &&
                                totalCost > 0 &&
                                qty > 0
                              ) {
                                const totalSell =
                                  totalCost +
                                  (totalCost * Number(inProfitPercent)) / 100;
                                setInSellPrice((totalSell / qty).toFixed(2));
                              } else if (
                                inSellPrice !== "" &&
                                totalCost > 0 &&
                                qty > 0
                              ) {
                                const totalSell = Number(inSellPrice) * qty;
                                const pct =
                                  ((totalSell - totalCost) / totalCost) * 100;
                                setInProfitPercent(pct.toFixed(2));
                              }
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm">Labour Charge (₹)</Label>
                        <Input
                          data-ocid="stock.in.labour.input"
                          type="number"
                          placeholder="0"
                          value={inLabour}
                          onFocus={(e) => {
                            if (e.target.value === "0") e.target.select();
                          }}
                          onChange={(e) => {
                            const lc = clearLeadingZeros(e.target.value);
                            setInLabour(lc);
                            if (!isMixedIn) {
                              const qty = effectiveQty;
                              const totalCost =
                                Number(inRate || 0) * qty +
                                Number(inTransport || 0) +
                                Number(lc) +
                                Number(inOtherCharges || 0);
                              if (
                                inProfitPercent !== "" &&
                                totalCost > 0 &&
                                qty > 0
                              ) {
                                const totalSell =
                                  totalCost +
                                  (totalCost * Number(inProfitPercent)) / 100;
                                setInSellPrice((totalSell / qty).toFixed(2));
                              } else if (
                                inSellPrice !== "" &&
                                totalCost > 0 &&
                                qty > 0
                              ) {
                                const totalSell = Number(inSellPrice) * qty;
                                const pct =
                                  ((totalSell - totalCost) / totalCost) * 100;
                                setInProfitPercent(pct.toFixed(2));
                              }
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm">Other Charges (₹)</Label>
                      <Input
                        data-ocid="stock.in.other_charges.input"
                        type="number"
                        placeholder="0"
                        value={inOtherCharges}
                        onFocus={(e) => {
                          if (e.target.value === "0") e.target.select();
                        }}
                        onChange={(e) => {
                          const oc = clearLeadingZeros(e.target.value);
                          setInOtherCharges(oc);
                          if (!isMixedIn) {
                            const qty = effectiveQty;
                            const totalCost =
                              Number(inRate || 0) * qty +
                              Number(inTransport || 0) +
                              Number(inLabour || 0) +
                              Number(oc);
                            if (
                              inProfitPercent !== "" &&
                              totalCost > 0 &&
                              qty > 0
                            ) {
                              const totalSell =
                                totalCost +
                                (totalCost * Number(inProfitPercent)) / 100;
                              setInSellPrice((totalSell / qty).toFixed(2));
                            } else if (
                              inSellPrice !== "" &&
                              totalCost > 0 &&
                              qty > 0
                            ) {
                              const totalSell = Number(inSellPrice) * qty;
                              const pct =
                                ((totalSell - totalCost) / totalCost) * 100;
                              setInProfitPercent(pct.toFixed(2));
                            }
                          }
                        }}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm">Note</Label>
                      <Input
                        data-ocid="stock.in.note.input"
                        placeholder="e.g. Purchased from supplier"
                        value={inNote}
                        onChange={(e) => setInNote(e.target.value)}
                      />
                    </div>
                  </div>
                  {/* end space-y-4 */}
                </div>
                {/* end extra fields wrapper */}

                {/* Resume draft banner */}
                {showResumeBanner && (
                  <div className="flex items-center justify-between gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm">
                    <span className="text-amber-800">
                      📋 You have unsaved data from last time.
                    </span>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-amber-300 text-amber-800 hover:bg-amber-100"
                        onClick={() => {
                          try {
                            const raw = localStorage.getItem(
                              `${STOCK_FORM_DRAFT_KEY}_${shopId}`,
                            );
                            if (raw) {
                              const draft = JSON.parse(raw);
                              if (draft.productId)
                                setInProduct(draft.productId);
                              if (draft.qty) setInQty(draft.qty);
                              if (draft.rate) setInRate(draft.rate);
                              if (draft.transport)
                                setInTransport(draft.transport);
                              if (draft.labour) setInLabour(draft.labour);
                              if (draft.otherCharges)
                                setInOtherCharges(draft.otherCharges);
                              if (draft.sellPrice)
                                setInSellPrice(draft.sellPrice);
                              if (draft.profitPercent)
                                setInProfitPercent(draft.profitPercent);
                            }
                          } catch {
                            /* ignore */
                          }
                          setShowResumeBanner(false);
                        }}
                      >
                        Resume
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-amber-700"
                        onClick={() => {
                          try {
                            localStorage.removeItem(
                              `${STOCK_FORM_DRAFT_KEY}_${shopId}`,
                            );
                          } catch {
                            /* ignore */
                          }
                          setShowResumeBanner(false);
                        }}
                      >
                        Discard
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  data-ocid="stock.in.submit_button"
                  className="w-full"
                  disabled={isStockInSaving}
                  onClick={handleStockIn}
                >
                  {isStockInSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <ArrowDownToLine size={16} className="mr-2" /> Add Stock
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Bulk Stock In ────────────────────────────────────────── */}
          <TabsContent value="bulk">
            <BulkStockIn />
          </TabsContent>

          {/* Stock Out */}
          <TabsContent value="out">
            <Card className="shadow-card border-border max-w-lg">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowUpFromLine size={16} className="text-danger" /> Remove
                  Stock (Outgoing)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Product *</Label>
                  <Select value={outProduct} onValueChange={setOutProduct}>
                    <SelectTrigger data-ocid="stock.out.product.select">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} (Stock: {getProductStock(p.id)} {p.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Enhanced batch breakdown when product is selected */}
                {outProduct && selectedOutProduct && (
                  <div className="bg-secondary rounded-lg p-3 space-y-2">
                    {/* Total stock summary */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Available:
                      </span>
                      <span className="text-sm font-bold">
                        {selectedOutProduct.unitMode === "mixed" ? (
                          <>
                            {(() => {
                              const batches = getProductBatches(outProduct);
                              const totalLength = batches.reduce(
                                (s, b) => s + (b.lengthQty ?? b.quantity),
                                0,
                              );
                              const totalWeight = batches.reduce(
                                (s, b) => s + (b.weightQty ?? 0),
                                0,
                              );
                              return totalWeight > 0
                                ? `${totalLength} ${selectedOutProduct.lengthUnit} (${totalWeight} ${selectedOutProduct.weightUnit})`
                                : `${totalLength} ${selectedOutProduct.lengthUnit}`;
                            })()}
                          </>
                        ) : (
                          <>
                            {outTotalStock} {selectedOutProduct.unit}
                          </>
                        )}
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          ({outBatches.length} batch
                          {outBatches.length !== 1 ? "es" : ""})
                        </span>
                      </span>
                    </div>

                    {/* Batch breakdown table */}
                    {outBatches.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-1 pr-2 text-muted-foreground font-medium">
                                Batch #
                              </th>
                              <th className="text-left py-1 pr-2 text-muted-foreground font-medium">
                                Date
                              </th>
                              <th className="text-right py-1 pr-2 text-muted-foreground font-medium">
                                Qty
                              </th>
                              <th className="text-right py-1 text-muted-foreground font-medium">
                                Rate (₹)
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {outBatches.map((b, bi) => (
                              <tr
                                key={b.id}
                                className="border-b border-border/50 last:border-0"
                              >
                                <td className="py-1.5 pr-2">
                                  <div className="flex items-center gap-1">
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] px-1 py-0 h-4"
                                    >
                                      Batch {bi + 1}
                                    </Badge>
                                    {bi === 0 && (
                                      <Badge className="text-[10px] px-1 py-0 h-4 bg-primary/10 text-primary border-0">
                                        Next FIFO
                                      </Badge>
                                    )}
                                  </div>
                                </td>
                                <td className="py-1.5 pr-2 text-muted-foreground">
                                  {new Date(b.dateAdded).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "2-digit",
                                    },
                                  )}
                                </td>
                                <td className="py-1.5 pr-2 text-right font-semibold">
                                  {formatBatchQty(selectedOutProduct, b)}
                                </td>
                                <td className="py-1.5 text-right">
                                  ₹{b.purchaseRate.toLocaleString("en-IN")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-sm">Quantity *</Label>
                  <Input
                    data-ocid="stock.out.qty.input"
                    type="number"
                    placeholder="e.g. 10"
                    value={outQty}
                    onFocus={(e) => {
                      if (e.target.value === "0") e.target.select();
                    }}
                    onChange={(e) =>
                      setOutQty(clearLeadingZeros(e.target.value))
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm">Reason</Label>
                  <Input
                    data-ocid="stock.out.note.input"
                    placeholder="e.g. Damaged, Expired"
                    value={outNote}
                    onChange={(e) => setOutNote(e.target.value)}
                  />
                </div>

                <Button
                  data-ocid="stock.out.submit_button"
                  className="w-full"
                  variant="destructive"
                  onClick={handleStockOut}
                >
                  <ArrowUpFromLine size={16} className="mr-2" /> Remove Stock
                  (FIFO)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Transactions */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-base">
              Recent Stock Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="text-xs">Product</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Qty</TableHead>
                    <TableHead className="text-xs">Rate/Unit</TableHead>
                    <TableHead className="text-xs">Note</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 20).map((tx, idx) => (
                    <TxRow key={tx.id} tx={tx} idx={idx} />
                  ))}
                  {transactions.length === 0 && (
                    <TableRow data-ocid="stock.transactions.empty_state">
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground text-sm"
                      >
                        No transactions yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Add Product Dialog ─────────────────────────────── */}
      <Dialog
        open={showQuickAdd}
        onOpenChange={(open) => {
          if (!open) resetQuickAdd();
          setShowQuickAdd(open);
        }}
      >
        <DialogContent
          data-ocid="stock.quick_add_product.dialog"
          className="max-w-sm w-full"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Plus size={16} className="text-primary" /> Add New Product
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-sm">
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input
                data-ocid="stock.quick_add.name.input"
                placeholder="e.g. Basmati Rice"
                value={qaName}
                onChange={(e) => setQaName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Category</Label>
                <Input
                  data-ocid="stock.quick_add.category.input"
                  placeholder="e.g. Grains"
                  value={qaCategory}
                  onChange={(e) => setQaCategory(e.target.value)}
                  list="qa-category-suggestions"
                />
                {categories.length > 0 && (
                  <datalist id="qa-category-suggestions">
                    {categories.map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">
                  Unit <span className="text-destructive">*</span>
                </Label>
                <Input
                  data-ocid="stock.quick_add.unit.input"
                  placeholder="kg / piece / liter"
                  value={qaUnit}
                  onChange={(e) => setQaUnit(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Min Stock Alert</Label>
                <Input
                  data-ocid="stock.quick_add.min_stock.input"
                  type="number"
                  placeholder="e.g. 5"
                  value={qaMinStock}
                  onChange={(e) => setQaMinStock(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Selling Price (₹)</Label>
                <Input
                  data-ocid="stock.quick_add.sell_price.input"
                  type="number"
                  placeholder="e.g. 120"
                  value={qaSellPrice}
                  onChange={(e) => setQaSellPrice(e.target.value)}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              * Required fields. Other details can be edited from Admin Panel
              later.
            </p>

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  resetQuickAdd();
                  setShowQuickAdd(false);
                }}
              >
                Cancel
              </Button>
              <Button
                data-ocid="stock.quick_add.save.button"
                className="flex-1"
                onClick={handleQuickAddProduct}
              >
                <Plus size={14} className="mr-1" /> Save & Select
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Bulk Stock In Component ──────────────────────────────────────────────────

interface BulkRow {
  id: string;
  productId: string;
  qty: string;
  rate: string;
  transport: string;
  labour: string;
  sellPrice: string;
  profitPct: string;
}

function makeBulkRow(): BulkRow {
  return {
    id: `row_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    productId: "",
    qty: "",
    rate: "",
    transport: "",
    labour: "",
    sellPrice: "",
    profitPct: "",
  };
}

function BulkStockIn() {
  const {
    products,
    vendors,
    categories,
    addStockIn,
    addProduct,
    addCategory,
    getProductStock,
    getLastVendorRate,
  } = useStore();

  const [vendorId, setVendorId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [billNo, setBillNo] = useState("");
  const [rows, setRows] = useState<BulkRow[]>([
    makeBulkRow(),
    makeBulkRow(),
    makeBulkRow(),
  ]);

  // Quick Add Product dialog (shared across all rows)
  const [showQA, setShowQA] = useState(false);
  const [qaTargetRowId, setQaTargetRowId] = useState<string | null>(null);
  const [qaName, setQaName] = useState("");
  const [qaCategory, setQaCategory] = useState("");
  const [qaUnit, setQaUnit] = useState("");
  const [qaMinStock, setQaMinStock] = useState("");
  const [qaSellPrice, setQaSellPrice] = useState("");

  const resetQA = () => {
    setQaName("");
    setQaCategory("");
    setQaUnit("");
    setQaMinStock("");
    setQaSellPrice("");
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const calcFinalCost = (row: BulkRow): number => {
    const qty = Number(row.qty || 0);
    const rate = Number(row.rate || 0);
    return rate * qty + Number(row.transport || 0) + Number(row.labour || 0);
  };

  const calcPerUnitCost = (row: BulkRow): number => {
    const qty = Number(row.qty || 0);
    if (qty <= 0) return 0;
    return calcFinalCost(row) / qty;
  };

  const validRowCount = rows.filter(
    (r) => r.productId && Number(r.qty) > 0 && Number(r.rate) > 0,
  ).length;

  // ── Row update helpers ─────────────────────────────────────────────────────
  const updateRow = (id: string, changes: Partial<BulkRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...changes } : r)),
    );
  };

  const recalcSell = (
    row: BulkRow,
    overrides: Partial<BulkRow> = {},
  ): Partial<BulkRow> => {
    const merged = { ...row, ...overrides };
    const qty = Number(merged.qty || 0);
    const finalCost = calcFinalCost(merged);
    if (overrides.profitPct !== undefined) {
      const pct = Number(merged.profitPct || 0);
      if (finalCost > 0 && qty > 0) {
        const totalSell = finalCost + (finalCost * pct) / 100;
        return {
          profitPct: merged.profitPct,
          sellPrice: (totalSell / qty).toFixed(2),
        };
      }
      return { profitPct: merged.profitPct };
    }
    if (overrides.sellPrice !== undefined) {
      if (finalCost > 0 && qty > 0 && Number(merged.sellPrice) > 0) {
        const totalSell = Number(merged.sellPrice) * qty;
        const pct = ((totalSell - finalCost) / finalCost) * 100;
        return { sellPrice: merged.sellPrice, profitPct: pct.toFixed(2) };
      }
      return { sellPrice: merged.sellPrice };
    }
    return {};
  };

  const handleProductChange = (rowId: string, productId: string) => {
    if (productId === "__new__") {
      setQaTargetRowId(rowId);
      setShowQA(true);
      return;
    }
    const changes: Partial<BulkRow> = { productId, rate: "" };
    // Auto-fill rate from last vendor+product rate history
    if (vendorId && productId) {
      const lastRate = getLastVendorRate(vendorId, productId);
      if (lastRate != null) {
        changes.rate = String(lastRate);
      }
    }
    updateRow(rowId, changes);
  };

  const handleVendorChange = (newVendorId: string) => {
    setVendorId(newVendorId);
    // Re-fill rates for rows that already have a product selected
    setRows((prev) =>
      prev.map((r) => {
        if (!r.productId) return r;
        const lastRate = getLastVendorRate(newVendorId, r.productId);
        if (lastRate != null) return { ...r, rate: String(lastRate) };
        return r;
      }),
    );
  };

  // ── Quick Add Product ──────────────────────────────────────────────────────
  const handleQuickAdd = () => {
    if (!qaName.trim()) {
      toast.error("Product name required");
      return;
    }
    if (!qaUnit.trim()) {
      toast.error("Unit required");
      return;
    }
    const dup = products.find(
      (p) => p.name.trim().toLowerCase() === qaName.trim().toLowerCase(),
    );
    if (dup) {
      toast.warning(`"${qaName}" already exists`);
      return;
    }

    let catId = categories.find(
      (c) => c.name.toLowerCase() === qaCategory.trim().toLowerCase(),
    )?.id;
    if (!catId && qaCategory.trim()) catId = addCategory(qaCategory.trim());
    if (!catId) catId = addCategory("General");

    const newId = addProduct({
      name: qaName.trim(),
      categoryId: catId,
      unit: qaUnit.trim(),
      minStockAlert: qaMinStock ? Number(qaMinStock) : 0,
      sellingPrice: qaSellPrice ? Number(qaSellPrice) : 0,
      unitMode: "single",
    });

    if (qaTargetRowId) {
      updateRow(qaTargetRowId, { productId: newId });
    }
    toast.success(`"${qaName.trim()}" added successfully!`);
    resetQA();
    setShowQA(false);
  };

  // ── Save all ───────────────────────────────────────────────────────────────
  const handleSaveAll = () => {
    const validRows = rows.filter(
      (r) => r.productId && Number(r.qty) > 0 && Number(r.rate) > 0,
    );
    if (validRows.length === 0) {
      toast.error(
        "Please fill product, quantity, and rate in at least one row",
      );
      return;
    }
    const dateIso = new Date(date).toISOString();
    for (const row of validRows) {
      addStockIn(
        row.productId,
        Number(row.qty),
        Number(row.rate),
        dateIso,
        "Bulk stock purchase",
        undefined,
        billNo.trim() || undefined,
        row.transport ? Number(row.transport) : undefined,
        row.labour ? Number(row.labour) : undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
    }
    toast.success(`${validRows.length} products stock added successfully! ✅`);
    setRows([makeBulkRow(), makeBulkRow(), makeBulkRow()]);
    setBillNo("");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── Header card: Vendor + Date + Bill No ─────────────────────── */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers size={16} className="text-primary" />
            Bulk Stock In — Ek Saath Kai Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Vendor (optional)</Label>
              <Select value={vendorId} onValueChange={handleVendorChange}>
                <SelectTrigger data-ocid="bulk.vendor.select">
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— No Vendor —</SelectItem>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Purchase Date</Label>
              <Input
                data-ocid="bulk.date.input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Bill No (optional)</Label>
              <Input
                data-ocid="bulk.bill_no.input"
                placeholder="e.g. BILL-001"
                value={billNo}
                onChange={(e) => setBillNo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Product rows ────────────────────────────────────────────── */}
      {/* Desktop table */}
      <div className="hidden md:block">
        <Card className="shadow-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground min-w-[180px]">
                    Product *
                  </th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground w-[90px]">
                    Qty *
                  </th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground w-[100px]">
                    Rate (₹) *
                  </th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground w-[90px]">
                    Transport
                  </th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground w-[90px]">
                    Labour
                  </th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground w-[100px]">
                    Sell Price
                  </th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground w-[80px]">
                    Profit %
                  </th>
                  <th className="text-center px-3 py-2 font-medium text-muted-foreground w-[80px]">
                    Lagat/Unit
                  </th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <BulkRowDesktop
                    key={row.id}
                    row={row}
                    idx={idx}
                    products={products}
                    canDelete={rows.length > 1}
                    calcPerUnitCost={calcPerUnitCost}
                    getProductStock={getProductStock}
                    onProductChange={(pid) => handleProductChange(row.id, pid)}
                    onQtyChange={(v) => {
                      const qty = clearLeadingZeros(v);
                      const extra = recalcSell(row, { qty });
                      updateRow(row.id, { qty, ...extra });
                    }}
                    onRateChange={(v) => {
                      const rate = clearLeadingZeros(v);
                      const extra = recalcSell(row, { rate });
                      updateRow(row.id, { rate, ...extra });
                    }}
                    onTransportChange={(v) => {
                      const transport = clearLeadingZeros(v);
                      const extra = recalcSell(row, { transport });
                      updateRow(row.id, { transport, ...extra });
                    }}
                    onLabourChange={(v) => {
                      const labour = clearLeadingZeros(v);
                      const extra = recalcSell(row, { labour });
                      updateRow(row.id, { labour, ...extra });
                    }}
                    onSellPriceChange={(v) => {
                      const sellPrice = clearLeadingZeros(v);
                      const extra = recalcSell(row, { sellPrice });
                      updateRow(row.id, { ...extra });
                    }}
                    onProfitPctChange={(v) => {
                      if (Number(v) < 0) return;
                      const profitPct = clearLeadingZeros(v);
                      const extra = recalcSell(row, { profitPct });
                      updateRow(row.id, { ...extra });
                    }}
                    onDelete={() =>
                      setRows((prev) => prev.filter((r) => r.id !== row.id))
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((row, idx) => (
          <BulkRowMobile
            key={row.id}
            row={row}
            idx={idx}
            products={products}
            canDelete={rows.length > 1}
            calcFinalCost={calcFinalCost}
            calcPerUnitCost={calcPerUnitCost}
            getProductStock={getProductStock}
            onProductChange={(pid) => handleProductChange(row.id, pid)}
            onQtyChange={(v) => {
              const qty = clearLeadingZeros(v);
              const extra = recalcSell(row, { qty });
              updateRow(row.id, { qty, ...extra });
            }}
            onRateChange={(v) => {
              const rate = clearLeadingZeros(v);
              const extra = recalcSell(row, { rate });
              updateRow(row.id, { rate, ...extra });
            }}
            onTransportChange={(v) => {
              const transport = clearLeadingZeros(v);
              const extra = recalcSell(row, { transport });
              updateRow(row.id, { transport, ...extra });
            }}
            onLabourChange={(v) => {
              const labour = clearLeadingZeros(v);
              const extra = recalcSell(row, { labour });
              updateRow(row.id, { labour, ...extra });
            }}
            onSellPriceChange={(v) => {
              const sellPrice = clearLeadingZeros(v);
              const extra = recalcSell(row, { sellPrice });
              updateRow(row.id, { ...extra });
            }}
            onProfitPctChange={(v) => {
              if (Number(v) < 0) return;
              const profitPct = clearLeadingZeros(v);
              const extra = recalcSell(row, { profitPct });
              updateRow(row.id, { ...extra });
            }}
            onDelete={() =>
              setRows((prev) => prev.filter((r) => r.id !== row.id))
            }
          />
        ))}
      </div>

      {/* ── Add Row + Save ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Button
          data-ocid="bulk.add_row.button"
          variant="outline"
          onClick={() => setRows((prev) => [...prev, makeBulkRow()])}
          className="flex items-center gap-2"
        >
          <Plus size={15} /> Add Another Product
        </Button>

        <div className="flex-1 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
          {validRowCount > 0 && (
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {validRowCount}
              </span>{" "}
              item{validRowCount !== 1 ? "s" : ""} ready to save
            </span>
          )}
          <Button
            data-ocid="bulk.save_all.button"
            className="w-full sm:w-auto bg-success hover:bg-success/90 text-success-foreground font-semibold"
            disabled={validRowCount === 0}
            onClick={handleSaveAll}
          >
            <ArrowDownToLine size={16} className="mr-2" />
            Save All ({validRowCount} item
            {validRowCount !== 1 ? "s" : ""})
          </Button>
        </div>
      </div>

      {/* ── Quick Add Product Dialog ──────────────────────────────────── */}
      <Dialog
        open={showQA}
        onOpenChange={(open) => {
          if (!open) {
            resetQA();
            setQaTargetRowId(null);
          }
          setShowQA(open);
        }}
      >
        <DialogContent
          data-ocid="bulk.quick_add.dialog"
          className="max-w-sm w-full"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Plus size={16} className="text-primary" /> Add New Product
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-sm">
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input
                data-ocid="bulk.qa.name.input"
                placeholder="e.g. Basmati Rice"
                value={qaName}
                onChange={(e) => setQaName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Category</Label>
                <Input
                  data-ocid="bulk.qa.category.input"
                  placeholder="e.g. Grains"
                  value={qaCategory}
                  onChange={(e) => setQaCategory(e.target.value)}
                  list="bulk-qa-cat"
                />
                {categories.length > 0 && (
                  <datalist id="bulk-qa-cat">
                    {categories.map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">
                  Unit <span className="text-destructive">*</span>
                </Label>
                <Input
                  data-ocid="bulk.qa.unit.input"
                  placeholder="kg / piece"
                  value={qaUnit}
                  onChange={(e) => setQaUnit(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Min Stock</Label>
                <Input
                  type="number"
                  placeholder="e.g. 5"
                  value={qaMinStock}
                  onChange={(e) => setQaMinStock(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Sell Price (₹)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 120"
                  value={qaSellPrice}
                  onChange={(e) => setQaSellPrice(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  resetQA();
                  setShowQA(false);
                }}
              >
                Cancel
              </Button>
              <Button
                data-ocid="bulk.qa.save.button"
                className="flex-1"
                onClick={handleQuickAdd}
              >
                <Plus size={14} className="mr-1" /> Save & Select
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Desktop table row ─────────────────────────────────────────────────────────
interface BulkRowDesktopProps {
  row: BulkRow;
  idx: number;
  products: Product[];
  canDelete: boolean;
  calcPerUnitCost: (r: BulkRow) => number;
  getProductStock: (id: string) => number;
  onProductChange: (pid: string) => void;
  onQtyChange: (v: string) => void;
  onRateChange: (v: string) => void;
  onTransportChange: (v: string) => void;
  onLabourChange: (v: string) => void;
  onSellPriceChange: (v: string) => void;
  onProfitPctChange: (v: string) => void;
  onDelete: () => void;
}

function BulkRowDesktop({
  row,
  idx,
  products,
  canDelete,
  calcPerUnitCost,
  getProductStock,
  onProductChange,
  onQtyChange,
  onRateChange,
  onTransportChange,
  onLabourChange,
  onSellPriceChange,
  onProfitPctChange,
  onDelete,
}: BulkRowDesktopProps) {
  const isValid = row.productId && Number(row.qty) > 0 && Number(row.rate) > 0;
  const perUnitCost = calcPerUnitCost(row);

  return (
    <tr
      data-ocid={`bulk.row.${idx + 1}`}
      className={`border-b border-border/60 last:border-0 transition-colors ${isValid ? "bg-success/5" : "bg-background"}`}
    >
      {/* Product */}
      <td className="px-3 py-2">
        <Select value={row.productId || ""} onValueChange={onProductChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select product…" />
          </SelectTrigger>
          <SelectContent>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-2 py-1.5 text-xs font-medium text-primary cursor-pointer rounded-sm hover:bg-primary/10 focus-visible:bg-primary/10 outline-none"
              onClick={(e) => {
                e.stopPropagation();
                onProductChange("__new__");
              }}
            >
              <Plus size={12} /> New Product
            </button>
            <Separator className="my-1" />
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id} className="text-xs">
                {p.name} ({getProductStock(p.id)} {p.unit})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      {/* Qty */}
      <td className="px-3 py-2">
        <Input
          type="number"
          placeholder="0"
          className="h-8 text-xs"
          value={row.qty}
          onFocus={(e) => {
            if (e.target.value === "0") e.target.select();
          }}
          onChange={(e) => onQtyChange(e.target.value)}
        />
      </td>
      {/* Rate */}
      <td className="px-3 py-2">
        <Input
          type="number"
          placeholder="0"
          className="h-8 text-xs"
          value={row.rate}
          onFocus={(e) => {
            if (e.target.value === "0") e.target.select();
          }}
          onChange={(e) => onRateChange(e.target.value)}
        />
      </td>
      {/* Transport */}
      <td className="px-3 py-2">
        <Input
          type="number"
          placeholder="0"
          className="h-8 text-xs"
          value={row.transport}
          onFocus={(e) => {
            if (e.target.value === "0") e.target.select();
          }}
          onChange={(e) => onTransportChange(e.target.value)}
        />
      </td>
      {/* Labour */}
      <td className="px-3 py-2">
        <Input
          type="number"
          placeholder="0"
          className="h-8 text-xs"
          value={row.labour}
          onFocus={(e) => {
            if (e.target.value === "0") e.target.select();
          }}
          onChange={(e) => onLabourChange(e.target.value)}
        />
      </td>
      {/* Sell Price */}
      <td className="px-3 py-2">
        <Input
          type="number"
          placeholder="0"
          className="h-8 text-xs"
          value={row.sellPrice}
          onFocus={(e) => {
            if (e.target.value === "0") e.target.select();
          }}
          onChange={(e) => onSellPriceChange(e.target.value)}
        />
      </td>
      {/* Profit % */}
      <td className="px-3 py-2">
        <Input
          type="number"
          placeholder="0"
          className="h-8 text-xs"
          value={row.profitPct}
          onFocus={(e) => {
            if (e.target.value === "0") e.target.select();
          }}
          onChange={(e) => onProfitPctChange(e.target.value)}
        />
      </td>
      {/* Per unit cost (read-only) */}
      <td className="px-3 py-2 text-center">
        <span
          className={`text-xs font-semibold ${perUnitCost > 0 ? "text-primary" : "text-muted-foreground"}`}
        >
          {perUnitCost > 0 ? `₹${perUnitCost.toFixed(2)}` : "—"}
        </span>
      </td>
      {/* Delete */}
      <td className="px-2 py-2 text-center">
        {canDelete && (
          <button
            type="button"
            data-ocid={`bulk.row.${idx + 1}.delete`}
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
            aria-label="Row hatayein"
          >
            <Trash2 size={14} />
          </button>
        )}
      </td>
    </tr>
  );
}

// ─── Mobile card row ───────────────────────────────────────────────────────────
interface BulkRowMobileProps
  extends Omit<BulkRowDesktopProps, "calcPerUnitCost"> {
  calcFinalCost: (r: BulkRow) => number;
  calcPerUnitCost: (r: BulkRow) => number;
}

function BulkRowMobile({
  row,
  idx,
  products,
  canDelete,
  calcFinalCost,
  calcPerUnitCost,
  getProductStock,
  onProductChange,
  onQtyChange,
  onRateChange,
  onTransportChange,
  onLabourChange,
  onSellPriceChange,
  onProfitPctChange,
  onDelete,
}: BulkRowMobileProps) {
  const isValid = row.productId && Number(row.qty) > 0 && Number(row.rate) > 0;
  const finalCost = calcFinalCost(row);
  const perUnitCost = calcPerUnitCost(row);

  return (
    <Card
      data-ocid={`bulk.row_mobile.${idx + 1}`}
      className={`shadow-sm border ${isValid ? "border-success/30 bg-success/5" : "border-border bg-card"}`}
    >
      <CardContent className="p-3 space-y-3">
        {/* Row header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Product {idx + 1}
          </span>
          {canDelete && (
            <button
              type="button"
              data-ocid={`bulk.row_mobile.${idx + 1}.delete`}
              onClick={onDelete}
              className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
              aria-label="Row hatayein"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>

        {/* Product select */}
        <div className="space-y-1">
          <Label className="text-xs">Product *</Label>
          <Select value={row.productId || ""} onValueChange={onProductChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select product…" />
            </SelectTrigger>
            <SelectContent>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-2 py-1.5 text-sm font-medium text-primary cursor-pointer rounded-sm hover:bg-primary/10 outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  onProductChange("__new__");
                }}
              >
                <Plus size={13} /> New Product
              </button>
              <Separator className="my-1" />
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} ({getProductStock(p.id)} {p.unit})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Qty + Rate */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Qty *</Label>
            <Input
              type="number"
              placeholder="0"
              value={row.qty}
              onFocus={(e) => {
                if (e.target.value === "0") e.target.select();
              }}
              onChange={(e) => onQtyChange(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Rate (₹) *</Label>
            <Input
              type="number"
              placeholder="0"
              value={row.rate}
              onFocus={(e) => {
                if (e.target.value === "0") e.target.select();
              }}
              onChange={(e) => onRateChange(e.target.value)}
            />
          </div>
        </div>

        {/* Transport + Labour */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Transport (₹)</Label>
            <Input
              type="number"
              placeholder="0"
              value={row.transport}
              onFocus={(e) => {
                if (e.target.value === "0") e.target.select();
              }}
              onChange={(e) => onTransportChange(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Labour (₹)</Label>
            <Input
              type="number"
              placeholder="0"
              value={row.labour}
              onFocus={(e) => {
                if (e.target.value === "0") e.target.select();
              }}
              onChange={(e) => onLabourChange(e.target.value)}
            />
          </div>
        </div>

        {/* Sell Price + Profit % */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Sell Price (₹)</Label>
            <Input
              type="number"
              placeholder="auto"
              value={row.sellPrice}
              onFocus={(e) => {
                if (e.target.value === "0") e.target.select();
              }}
              onChange={(e) => onSellPriceChange(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Profit %</Label>
            <Input
              type="number"
              placeholder="auto"
              value={row.profitPct}
              onFocus={(e) => {
                if (e.target.value === "0") e.target.select();
              }}
              onChange={(e) => onProfitPctChange(e.target.value)}
            />
          </div>
        </div>

        {/* Cost summary mini-box */}
        {(finalCost > 0 || perUnitCost > 0) && (
          <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-xs">
            <span className="text-muted-foreground">Final Lagat:</span>
            <span className="font-semibold text-foreground">
              ₹{finalCost.toFixed(2)}
            </span>
            {perUnitCost > 0 && (
              <>
                <span className="text-muted-foreground ml-2">Per Unit:</span>
                <span className="font-semibold text-primary">
                  ₹{perUnitCost.toFixed(2)}
                </span>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TxRow({ tx, idx }: { tx: any; idx: number }) {
  const { products } = useStore();
  const product = products.find((p) => p.id === tx.productId);
  return (
    <TableRow data-ocid={`stock.transactions.item.${idx + 1}`}>
      <TableCell className="text-sm font-medium">
        {product?.name ?? "Unknown"}
      </TableCell>
      <TableCell>
        <Badge
          className={
            tx.type === "in"
              ? "bg-success-light text-success border-0"
              : "bg-danger-light text-danger border-0"
          }
        >
          {tx.type === "in" ? "IN" : "OUT"}
        </Badge>
      </TableCell>
      <TableCell className="text-sm">
        {tx.quantity} {product?.unit}
      </TableCell>
      <TableCell className="text-sm">₹{tx.rate}</TableCell>
      <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">
        {tx.note}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {new Date(tx.date).toLocaleDateString("en-IN")}
      </TableCell>
    </TableRow>
  );
}
