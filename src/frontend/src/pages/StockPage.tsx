import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TopBar } from "../components/TopBar";
import { useStore } from "../context/StoreContext";
import type { Product, StockBatch } from "../types/store";

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

export function StockPage() {
  const {
    products,
    transactions,
    addStockIn,
    addStockOut,
    getProductStock,
    getProductBatches,
    shopId,
  } = useStore();

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
  const [inExpiryDate, setInExpiryDate] = useState("");
  // Stock In: sell price / profit %
  const [inSellPrice, setInSellPrice] = useState("");
  const [inProfitPercent, setInProfitPercent] = useState("");
  // Mixed Unit: dual qty
  const [inLengthQty, setInLengthQty] = useState("");
  const [inWeightQty, setInWeightQty] = useState("");

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

  const handleStockIn = () => {
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
      qty = lengthQtyVal; // primary quantity is length
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
    );
    toast.success("Stock added successfully!");
    setInQty("");
    setInRate("");
    setInNote("");
    setInInvoiceNo("");
    setInBillNo("");
    setInTransport("");
    setInLabour("");
    setInExpiryDate("");
    setInSellPrice("");
    setInProfitPercent("");
    setInLengthQty("");
    setInWeightQty("");
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
    purchaseSubtotal + Number(inTransport || 0) + Number(inLabour || 0);
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
      <TopBar title="Stock In/Out" />

      <div className="px-4 md:px-6 pb-6 flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold">Stock Management</h1>
          <p className="text-muted-foreground text-sm">
            Add or remove stock with automatic FIFO deduction
          </p>
        </div>

        <Tabs defaultValue="in">
          <TabsList data-ocid="stock.tab" className="mb-4">
            <TabsTrigger value="in">
              <ArrowDownToLine size={14} className="mr-2" /> Stock In
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
                  <Label className="text-sm">Product *</Label>
                  <Select
                    value={inProduct}
                    onValueChange={handleInProductChange}
                  >
                    <SelectTrigger data-ocid="stock.in.product.select">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
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
                          onChange={(e) => {
                            const val = e.target.value;
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
                          onChange={(e) => {
                            const val = e.target.value;
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
                        onChange={(e) => {
                          const qty = e.target.value;
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
                        onChange={(e) => {
                          const rate = e.target.value;
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
                      onChange={(e) => setInRate(e.target.value)}
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

                <div className="space-y-1.5">
                  <Label className="text-sm">Expiry Date</Label>
                  <Input
                    data-ocid="stock.in.expiry_date.input"
                    type="date"
                    value={inExpiryDate}
                    onChange={(e) => setInExpiryDate(e.target.value)}
                  />
                </div>

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
                      onChange={(e) => {
                        const tc = e.target.value;
                        setInTransport(tc);
                        if (!isMixedIn) {
                          const qty = effectiveQty;
                          const totalCost =
                            Number(inRate || 0) * qty +
                            Number(tc) +
                            Number(inLabour || 0);
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
                      onChange={(e) => {
                        const lc = e.target.value;
                        setInLabour(lc);
                        if (!isMixedIn) {
                          const qty = effectiveQty;
                          const totalCost =
                            Number(inRate || 0) * qty +
                            Number(inTransport || 0) +
                            Number(lc);
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

                {/* Sell Price + Profit % (only for single unit products) */}
                {!isMixedIn && (
                  <>
                    <div className="border-t border-border pt-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
                        Selling Info (Optional)
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm">Sell Price (₹)</Label>
                        <Input
                          data-ocid="stock.in.sell_price.input"
                          type="number"
                          placeholder="e.g. 120"
                          value={inSellPrice}
                          onChange={(e) => {
                            const sp = e.target.value;
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
                          onChange={(e) => {
                            const pct = e.target.value;
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
                  </>
                )}

                <div className="space-y-1.5">
                  <Label className="text-sm">Note</Label>
                  <Input
                    data-ocid="stock.in.note.input"
                    placeholder="e.g. Purchased from supplier"
                    value={inNote}
                    onChange={(e) => setInNote(e.target.value)}
                  />
                </div>

                {/* Cost & Profit Summary Box */}
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

                <Button
                  data-ocid="stock.in.submit_button"
                  className="w-full"
                  onClick={handleStockIn}
                >
                  <ArrowDownToLine size={16} className="mr-2" /> Add Stock
                </Button>
              </CardContent>
            </Card>
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
                    onChange={(e) => setOutQty(e.target.value)}
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
    </div>
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
