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
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  IndianRupee,
  Loader2,
  PackageCheck,
  RotateCcw,
  TrendingDown,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import type { ReturnReason } from "../types/store";
import { clearLeadingZeros } from "../utils/numberInput";

const RETURN_REASONS: ReturnReason[] = [
  "Damaged",
  "Wrong Product",
  "Customer Changed Mind",
  "Expiry Issue",
  "Quality Problem",
  "Other",
];

const REASON_LABELS: Record<ReturnReason, string> = {
  Damaged: "Damaged",
  "Wrong Product": "Wrong Product",
  "Customer Changed Mind": "Customer Changed Mind",
  "Expiry Issue": "Expiry Issue",
  "Quality Problem": "Quality Problem",
  Other: "Other",
};

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ReturnsPage() {
  const { products, returns, addReturn, getReturnReport } = useStore();
  const { session } = useAuth();

  const todayStr = new Date().toISOString().slice(0, 10);
  const report = getReturnReport(todayStr);

  // Form state
  const [selectedProductId, setSelectedProductId] = useState("");
  const [qty, setQty] = useState("1");
  const [returnValue, setReturnValue] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [reason, setReason] = useState<ReturnReason | "">("");
  const [remark, setRemark] = useState("");
  const [reasonError, setReasonError] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Auto-fill selling price from product
  function handleProductChange(productId: string) {
    setSelectedProductId(productId);
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSellingPrice(String(product.sellingPrice ?? ""));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setReasonError(false);

    if (!selectedProductId) {
      toast.error("Please select a product");
      return;
    }
    if (!reason) {
      setReasonError(true);
      toast.error("Reason is required");
      return;
    }

    const qtyNum = Number.parseFloat(qty);
    const returnValueNum = Number.parseFloat(returnValue) || 0;
    const sellingPriceNum = Number.parseFloat(sellingPrice) || 0;

    if (!qty || Number.isNaN(qtyNum) || qtyNum <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    const staffName = session?.mobile ?? "Admin";

    setSaving(true);
    const success = await addReturn({
      itemName: selectedProduct?.name ?? "",
      productId: selectedProductId,
      qtyReturned: qtyNum,
      returnValue: returnValueNum,
      sellingPrice: sellingPriceNum,
      reason: reason as ReturnReason,
      remark: remark.trim(),
      staffName,
    });
    setSaving(false);

    if (success) {
      toast.success("Return recorded successfully!");
      setSelectedProductId("");
      setQty("1");
      setReturnValue("");
      setSellingPrice("");
      setReason("");
      setRemark("");
    }
  }

  // Compute loss preview for form
  const qtyNum = Number.parseFloat(qty) || 0;
  const returnValueNum = Number.parseFloat(returnValue) || 0;
  const sellingPriceNum = Number.parseFloat(sellingPrice) || 0;
  const previewLoss = Math.max(0, sellingPriceNum * qtyNum - returnValueNum);
  const previewIsLoss = previewLoss > 0;

  return (
    <div className="flex flex-col gap-6 pb-8" data-ocid="returns.page">
      <div className="px-4 md:px-6 space-y-5">
        {/* ─── Return Report Card ──────────────────── */}
        <Card
          data-ocid="returns.report.card"
          className="bg-gradient-to-br from-rose-50 to-orange-50 border-rose-200 shadow-sm"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <RotateCcw size={18} className="text-rose-600" />
              Return Report — Today
              <Badge className="bg-rose-100 text-rose-700 border-rose-300 ml-1">
                {new Date().toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Return Value */}
              <div className="rounded-xl bg-card border border-rose-100 p-4 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-rose-600 mb-1">
                  <PackageCheck size={16} />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Total Return Today
                  </span>
                </div>
                <div
                  className="text-2xl font-bold text-rose-700"
                  data-ocid="returns.report.total.card"
                >
                  {fmt(report.totalReturnValue)}
                </div>
                <div className="text-xs text-rose-400">
                  {report.returnsToday.length} return
                  {report.returnsToday.length !== 1 ? "s" : ""} today
                </div>
              </div>

              {/* Loss Amount */}
              <div
                className={`rounded-xl border p-4 flex flex-col gap-1 ${
                  report.totalLoss > 0
                    ? "bg-red-50 border-red-200"
                    : "bg-green-50 border-green-200"
                }`}
              >
                <div
                  className={`flex items-center gap-2 mb-1 ${
                    report.totalLoss > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  <TrendingDown size={16} />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Loss Amount
                  </span>
                </div>
                <div
                  className={`text-2xl font-bold ${
                    report.totalLoss > 0 ? "text-red-700" : "text-green-700"
                  }`}
                  data-ocid="returns.report.loss.card"
                >
                  {fmt(report.totalLoss)}
                </div>
                <div
                  className={`text-xs ${
                    report.totalLoss > 0 ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {report.totalLoss > 0 ? "Loss today" : "No losses"}
                </div>
              </div>

              {/* Top Reason */}
              <div className="rounded-xl bg-card border border-amber-100 p-4 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-amber-600 mb-1">
                  <Trophy size={16} />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Top Return Reason
                  </span>
                </div>
                <div
                  className="text-lg font-bold text-amber-700 leading-tight"
                  data-ocid="returns.report.top_reason.card"
                >
                  {report.topReason || "—"}
                </div>
                {report.topReasonCount > 0 && (
                  <div className="text-xs text-amber-500">
                    {report.topReasonCount} times (all time)
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Return Entry Form ─────────────────── */}
        <Card data-ocid="returns.form.card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <IndianRupee size={18} className="text-primary" />
              Record New Return
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product */}
                <div className="space-y-1.5">
                  <Label htmlFor="return-product">Product *</Label>
                  <Select
                    value={selectedProductId}
                    onValueChange={handleProductChange}
                  >
                    <SelectTrigger
                      id="return-product"
                      data-ocid="returns.product.select"
                      className="w-full"
                    >
                      <SelectValue placeholder="Select product..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Qty Returned */}
                <div className="space-y-1.5">
                  <Label htmlFor="return-qty">Qty Returned *</Label>
                  <Input
                    id="return-qty"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="e.g. 5"
                    value={qty}
                    onChange={(e) => setQty(clearLeadingZeros(e.target.value))}
                    onFocus={(e) => {
                      if (e.target.value === "0") e.target.select();
                    }}
                    data-ocid="returns.qty.input"
                  />
                </div>

                {/* Selling Price */}
                <div className="space-y-1.5">
                  <Label htmlFor="return-selling-price">
                    Original Selling Price (₹)
                  </Label>
                  <Input
                    id="return-selling-price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Auto-filled from product"
                    value={sellingPrice}
                    onChange={(e) =>
                      setSellingPrice(clearLeadingZeros(e.target.value))
                    }
                    onFocus={(e) => {
                      if (e.target.value === "0") e.target.select();
                    }}
                    data-ocid="returns.selling_price.input"
                  />
                </div>

                {/* Return Value */}
                <div className="space-y-1.5">
                  <Label htmlFor="return-value">Return Value (₹) *</Label>
                  <Input
                    id="return-value"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="How much was refunded to the customer"
                    value={returnValue}
                    onChange={(e) =>
                      setReturnValue(clearLeadingZeros(e.target.value))
                    }
                    onFocus={(e) => {
                      if (e.target.value === "0") e.target.select();
                    }}
                    data-ocid="returns.return_value.input"
                  />
                </div>

                {/* Reason */}
                <div className="space-y-1.5">
                  <Label htmlFor="return-reason">
                    Reason *<span className="text-destructive ml-0.5">*</span>
                  </Label>
                  <Select
                    value={reason}
                    onValueChange={(v) => {
                      setReason(v as ReturnReason);
                      setReasonError(false);
                    }}
                  >
                    <SelectTrigger
                      id="return-reason"
                      data-ocid="returns.reason.select"
                      className={reasonError ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="Select reason (required)" />
                    </SelectTrigger>
                    <SelectContent>
                      {RETURN_REASONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {REASON_LABELS[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {reasonError && (
                    <p
                      className="text-xs text-destructive"
                      data-ocid="returns.reason.error_state"
                    >
                      Reason is required
                    </p>
                  )}
                </div>

                {/* Staff Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="return-staff">Staff Name</Label>
                  <Input
                    id="return-staff"
                    type="text"
                    value={session?.mobile ?? "Admin"}
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Remark */}
              <div className="space-y-1.5">
                <Label htmlFor="return-remark">
                  Remark{" "}
                  <span className="text-muted-foreground text-xs">
                    (Optional)
                  </span>
                </Label>
                <Textarea
                  id="return-remark"
                  placeholder="Optional details e.g. item condition, customer complaint..."
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  rows={2}
                  data-ocid="returns.remark.textarea"
                />
              </div>

              {/* Loss Preview */}
              {qtyNum > 0 && sellingPriceNum > 0 && (
                <div
                  className={`rounded-lg border p-3 flex items-center gap-3 ${
                    previewIsLoss
                      ? "bg-red-50 border-red-200"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <AlertTriangle
                    size={16}
                    className={
                      previewIsLoss ? "text-red-500" : "text-green-500"
                    }
                  />
                  <div className="text-sm">
                    <span className="font-medium">
                      {previewIsLoss ? "Loss:" : "No Loss:"}
                    </span>{" "}
                    <span
                      className={`font-bold ${
                        previewIsLoss ? "text-red-700" : "text-green-700"
                      }`}
                    >
                      {fmt(previewLoss)}
                    </span>
                    {previewIsLoss && (
                      <span className="text-muted-foreground ml-2 text-xs">
                        (Selling ₹{sellingPriceNum} × {qtyNum} − Return ₹
                        {returnValueNum})
                      </span>
                    )}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full md:w-auto"
                disabled={saving}
                data-ocid="returns.submit.button"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="mr-2 h-4 w-4" />
                )}
                {saving ? "Saving..." : "Record Return"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ─── Returns List ─────────────────────── */}
        <Card data-ocid="returns.list.card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <RotateCcw size={18} className="text-primary" />
              All Returns
              {returns.length > 0 && (
                <Badge className="bg-primary/10 text-primary border-0">
                  {returns.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {returns.length === 0 ? (
              <div
                className="flex flex-col items-center gap-3 py-16 text-muted-foreground"
                data-ocid="returns.list.empty_state"
              >
                <RotateCcw size={40} className="opacity-20" />
                <p className="font-medium">No returns recorded</p>
                <p className="text-sm">
                  Record your first return using the form above
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Desktop table */}
                <table className="w-full hidden md:table">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Item
                      </th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Qty
                      </th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Amount
                      </th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Reason
                      </th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Remark
                      </th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Date
                      </th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Staff
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {returns.map((r, idx) => {
                      const isCustomerReturn =
                        r.reason === "Customer Changed Mind";
                      const rowClass = r.isLoss
                        ? "bg-red-50 hover:bg-red-100"
                        : isCustomerReturn
                          ? "bg-yellow-50 hover:bg-yellow-100"
                          : "hover:bg-muted/30";
                      return (
                        <tr
                          key={r.id}
                          data-ocid={`returns.list.item.${idx + 1}`}
                          className={`border-b border-border transition-colors ${rowClass}`}
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium text-sm text-foreground">
                              {r.itemName}
                            </div>
                            {r.isLoss && (
                              <div className="text-xs text-red-600 font-medium mt-0.5">
                                Loss: {fmt(r.lossAmount)}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                            {r.qtyReturned}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold">
                            {fmt(r.returnValue)}
                          </td>
                          <td className="px-4 py-3">
                            <ReturnReasonBadge reason={r.reason} />
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground max-w-[180px] truncate">
                            {r.remark || (
                              <span className="italic opacity-50">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                            {fmtDate(r.date)}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {r.staffName}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-border">
                  {returns.map((r, idx) => {
                    const isCustomerReturn =
                      r.reason === "Customer Changed Mind";
                    const cardClass = r.isLoss
                      ? "bg-red-50"
                      : isCustomerReturn
                        ? "bg-yellow-50"
                        : "";
                    return (
                      <div
                        key={r.id}
                        data-ocid={`returns.list.item.${idx + 1}`}
                        className={`p-4 ${cardClass}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="font-semibold text-sm">
                              {r.itemName}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {fmtDate(r.date)} &middot; {r.staffName}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-bold text-sm">
                              {fmt(r.returnValue)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Qty: {r.qtyReturned}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <ReturnReasonBadge reason={r.reason} />
                          {r.isLoss && (
                            <Badge
                              variant="destructive"
                              className="text-[10px] px-1.5"
                            >
                              Loss: {fmt(r.lossAmount)}
                            </Badge>
                          )}
                        </div>
                        {r.remark && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            {r.remark}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground px-1">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <span>Red = Loss</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <span>Yellow = Customer Changed Mind</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReturnReasonBadge({ reason }: { reason: string }) {
  let className = "text-[10px] px-2 py-0.5 rounded-full border font-medium ";
  switch (reason) {
    case "Damaged":
      className += "bg-red-100 text-red-700 border-red-200";
      break;
    case "Wrong Product":
      className += "bg-orange-100 text-orange-700 border-orange-200";
      break;
    case "Customer Changed Mind":
      className += "bg-yellow-100 text-yellow-700 border-yellow-200";
      break;
    case "Expiry Issue":
      className += "bg-purple-100 text-purple-700 border-purple-200";
      break;
    case "Quality Problem":
      className += "bg-pink-100 text-pink-700 border-pink-200";
      break;
    default:
      className += "bg-muted text-muted-foreground border-border";
  }
  return <span className={className}>{reason}</span>;
}
