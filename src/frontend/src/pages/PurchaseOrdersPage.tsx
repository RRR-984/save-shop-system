import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  ChevronDown,
  Clock,
  Copy,
  Mail,
  MessageCircle,
  Package,
  Plus,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import type { PurchaseOrder, Vendor } from "../types/store";

// ─── helpers ────────────────────────────────────────────────────────────────

type FilterTab = "all" | "pending" | "received" | "partial";

function fmt(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    className: "bg-orange-100 text-orange-700 border-orange-200",
    icon: <Clock className="w-3 h-3" />,
  },
  received: {
    label: "Received",
    className: "bg-green-100 text-green-700 border-green-200",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  partial: {
    label: "Partial",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: <Package className="w-3 h-3" />,
  },
} as const;

function StatusBadge({ status }: { status: PurchaseOrder["status"] }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ─── Rate Change Alert Banner ────────────────────────────────────────────────

interface RateChangeBannerProps {
  currentRate: number;
  lastRate: number;
}

function RateChangeBanner({ currentRate, lastRate }: RateChangeBannerProps) {
  if (!lastRate || currentRate === lastRate) return null;

  const diff = currentRate - lastRate;
  const diffAbs = Math.abs(diff);
  const pct = ((diffAbs / lastRate) * 100).toFixed(1);
  const isIncrease = diff > 0;

  if (isIncrease) {
    return (
      <div
        className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-sm text-amber-800"
        data-ocid="po-rate-change-alert"
      >
        <TrendingUp className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
        <span>
          <strong>⚠️ Rate badal gaya!</strong> Pichla rate{" "}
          <strong>{fmt(lastRate)}</strong> tha, ab{" "}
          <strong>{fmt(currentRate)}</strong> hai —{" "}
          <span className="text-red-700 font-semibold">
            {fmt(diffAbs)} zyada ({pct}% change)
          </span>
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex items-start gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2.5 text-sm text-green-800"
      data-ocid="po-rate-decrease-alert"
    >
      <TrendingDown className="w-4 h-4 shrink-0 mt-0.5 text-green-600" />
      <span>
        <strong>✅ Rate kam hua!</strong> Pichla rate{" "}
        <strong>{fmt(lastRate)}</strong> tha, ab{" "}
        <strong>{fmt(currentRate)}</strong> hai —{" "}
        <span className="text-green-700 font-semibold">
          {fmt(diffAbs)} kam ({pct}% change)
        </span>
      </span>
    </div>
  );
}

// ─── Cost Update Confirm Dialog ──────────────────────────────────────────────

interface CostUpdateDialogProps {
  productName: string;
  oldCost: number;
  newCost: number;
  onConfirm: () => void;
  onCancel: () => void;
}

function CostUpdateDialog({
  productName,
  oldCost,
  newCost,
  onConfirm,
  onCancel,
}: CostUpdateDialogProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-card w-full max-w-sm rounded-2xl shadow-xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">
              Cost Price Update Karein?
            </h3>
            <p className="text-xs text-muted-foreground">
              Vendor ka rate badal gaya hai
            </p>
          </div>
        </div>

        <div className="bg-muted/40 rounded-xl p-3 space-y-1.5 text-sm">
          <p className="font-semibold text-foreground truncate">
            {productName}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Purana Cost Price</span>
            <span className="font-medium line-through text-muted-foreground">
              {fmt(oldCost)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Naya Cost Price</span>
            <span className="font-bold text-primary">{fmt(newCost)}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Kya is product ki cost price{" "}
          <strong className="text-foreground">
            {fmt(oldCost)} → {fmt(newCost)}
          </strong>{" "}
          update karein?
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            data-ocid="cost-update-cancel"
          >
            Nahi, Skip Karein
          </Button>
          <Button
            className="flex-1"
            onClick={onConfirm}
            data-ocid="cost-update-confirm"
          >
            Haan, Update Karein
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Add PO Modal ────────────────────────────────────────────────────────────

interface AddPOModalProps {
  onClose: () => void;
  reorderProductId?: string;
  reorderVendorId?: string;
  reorderRate?: number;
}

function AddPOModal({
  onClose,
  reorderProductId,
  reorderVendorId,
  reorderRate,
}: AddPOModalProps) {
  const {
    products,
    purchaseOrders,
    vendors: storeVendors,
    addPurchaseOrder,
    addVendorRateHistory,
    getLastVendorRate,
    updateProduct,
    appConfig,
  } = useStore();
  const { currentUser } = useAuth();

  const isReorder = !!reorderProductId;

  const [vendorId, setVendorId] = useState(reorderVendorId ?? "");
  const [productId, setProductId] = useState(reorderProductId ?? "");
  const [qty, setQty] = useState("");
  const [rate, setRate] = useState(reorderRate ? String(reorderRate) : "");
  const [transport, setTransport] = useState("0");
  const [labour, setLabour] = useState("0");
  const [saving, setSaving] = useState(false);

  // Cost update dialog state
  const [showCostUpdateDialog, setShowCostUpdateDialog] = useState(false);
  const [pendingPOData, setPendingPOData] = useState<{
    vendorId: string;
    productId: string;
    qty: number;
    rate: number;
    transport: number;
    labour: number;
    createdBy: string;
  } | null>(null);

  // Get last known rate for this vendor+product combo
  const lastKnownRate = useMemo(() => {
    if (!vendorId || !productId) return null;
    // First try rate history
    const fromHistory = getLastVendorRate(vendorId, productId);
    if (fromHistory != null) return fromHistory;
    // Fallback to last PO
    const lastPO = [...purchaseOrders]
      .filter((po) => po.vendorId === vendorId && po.productId === productId)
      .sort((a, b) => b.createdAt - a.createdAt)[0];
    return lastPO ? lastPO.rate : null;
  }, [vendorId, productId, getLastVendorRate, purchaseOrders]);

  const handleProductChange = (pid: string) => {
    setProductId(pid);
    if (!vendorId) {
      // If no vendor yet, just try last PO for this product
      const lastPO = [...purchaseOrders]
        .filter((po) => po.productId === pid)
        .sort((a, b) => b.createdAt - a.createdAt)[0];
      if (lastPO) setRate(String(lastPO.rate));
      return;
    }
    // With vendor: use rate history first, then last PO
    const fromHistory = getLastVendorRate(vendorId, pid);
    if (fromHistory != null) {
      setRate(String(fromHistory));
      return;
    }
    const lastPO = [...purchaseOrders]
      .filter((po) => po.vendorId === vendorId && po.productId === pid)
      .sort((a, b) => b.createdAt - a.createdAt)[0];
    if (lastPO) setRate(String(lastPO.rate));
  };

  const handleVendorChange = (vid: string) => {
    setVendorId(vid);
    if (!productId) return;
    // Auto-fill rate from history for this vendor+product
    const fromHistory = getLastVendorRate(vid, productId);
    if (fromHistory != null) {
      setRate(String(fromHistory));
      return;
    }
    const lastPO = [...purchaseOrders]
      .filter((po) => po.vendorId === vid && po.productId === productId)
      .sort((a, b) => b.createdAt - a.createdAt)[0];
    if (lastPO) setRate(String(lastPO.rate));
  };

  const selectedVendor = storeVendors.find((v) => v.id === vendorId);
  const selectedProduct = products.find((p) => p.id === productId);

  const qtyNum = Number.parseFloat(qty) || 0;
  const rateNum = Number.parseFloat(rate) || 0;
  const transportNum = Number.parseFloat(transport) || 0;
  const labourNum = Number.parseFloat(labour) || 0;
  const finalCost = rateNum * qtyNum + transportNum + labourNum;
  const perUnit = qtyNum > 0 ? finalCost / qtyNum : 0;

  const canSave = vendorId && productId && qtyNum > 0 && rateNum > 0;

  // Check if rate changed vs last known
  const rateChanged =
    rateNum > 0 && lastKnownRate != null && rateNum !== lastKnownRate;

  async function doSavePO(poData: typeof pendingPOData) {
    if (!poData) return;
    await addPurchaseOrder({
      vendorId: poData.vendorId,
      productId: poData.productId,
      qty: poData.qty,
      rate: poData.rate,
      transportCharge: poData.transport,
      labourCharge: poData.labour,
      status: "pending",
      receivedQty: 0,
      createdBy: poData.createdBy,
    });

    // Save rate history if rate changed or first time
    const lastRate = getLastVendorRate(poData.vendorId, poData.productId);
    const prevPORate =
      [...purchaseOrders]
        .filter(
          (po) =>
            po.vendorId === poData.vendorId &&
            po.productId === poData.productId,
        )
        .sort((a, b) => b.createdAt - a.createdAt)[0]?.rate ?? null;
    const effectiveOldRate = lastRate ?? prevPORate ?? 0;

    if (poData.rate !== lastRate) {
      await addVendorRateHistory({
        vendorId: poData.vendorId,
        productId: poData.productId,
        oldRate: effectiveOldRate,
        newRate: poData.rate,
        changedBy: poData.createdBy,
      });
    }
  }

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      const poData = {
        vendorId,
        productId,
        qty: qtyNum,
        rate: rateNum,
        transport: transportNum,
        labour: labourNum,
        createdBy: currentUser?.name ?? "Owner",
      };

      // Check if auto-update is on
      if (
        appConfig.autoUpdateCostOnVendorRateChange &&
        rateChanged &&
        selectedProduct
      ) {
        await doSavePO(poData);
        updateProduct(productId, { costPrice: rateNum });
        toast.success(`Cost price ${fmt(rateNum)} mein update ho gaya ✅`);
        onClose();
        return;
      }

      // If rate changed and auto-update is off, show confirmation dialog
      if (rateChanged && selectedProduct) {
        setPendingPOData(poData);
        setShowCostUpdateDialog(true);
        setSaving(false);
        return;
      }

      // No rate change — just save
      await doSavePO(poData);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleCostUpdateConfirm() {
    if (!pendingPOData) return;
    setSaving(true);
    try {
      await doSavePO(pendingPOData);
      updateProduct(pendingPOData.productId, { costPrice: pendingPOData.rate });
      toast.success(
        `Cost price ${fmt(pendingPOData.rate)} mein update ho gaya ✅`,
      );
    } finally {
      setSaving(false);
      setShowCostUpdateDialog(false);
      onClose();
    }
  }

  async function handleCostUpdateCancel() {
    if (!pendingPOData) return;
    setSaving(true);
    try {
      await doSavePO(pendingPOData);
      toast.success("Purchase order save ho gaya");
    } finally {
      setSaving(false);
      setShowCostUpdateDialog(false);
      onClose();
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
        <div className="bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="font-bold text-foreground text-base">
              {isReorder ? "⚡ Quick Reorder" : "Naya Purchase Order"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-muted"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {isReorder && selectedProduct && selectedVendor && (
              <div className="bg-accent rounded-xl p-3 text-sm text-accent-foreground font-medium">
                🔄 Quick Reorder: <strong>{selectedProduct.name}</strong> from{" "}
                <strong>{selectedVendor.name}</strong> @ {fmt(rateNum)}/unit
              </div>
            )}

            {!isReorder && (
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">
                  Vendor चुनें *
                </Label>
                <div className="relative">
                  <select
                    value={vendorId}
                    onChange={(e) => handleVendorChange(e.target.value)}
                    className="w-full h-10 px-3 pr-8 rounded-lg border border-input bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
                    data-ocid="po-vendor-select"
                  >
                    <option value="">-- Vendor select karein --</option>
                    {storeVendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.mobile})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                {selectedVendor && (
                  <p className="text-xs text-muted-foreground px-1">
                    📞 {selectedVendor.mobile}
                    {selectedVendor.address
                      ? ` • ${selectedVendor.address}`
                      : ""}
                  </p>
                )}
              </div>
            )}

            {!isReorder && (
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">
                  Product चुनें *
                </Label>
                <div className="relative">
                  <select
                    value={productId}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="w-full h-10 px-3 pr-8 rounded-lg border border-input bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
                    data-ocid="po-product-select"
                  >
                    <option value="">-- Product select karein --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">
                  Qty *
                </Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="0"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  data-ocid="po-qty-input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">
                  Rate (₹) *
                  {lastKnownRate != null && (
                    <span className="ml-1 text-muted-foreground font-normal normal-case">
                      (Pichla: {fmt(lastKnownRate)})
                    </span>
                  )}
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  data-ocid="po-rate-input"
                  className={
                    rateChanged ? "border-amber-400 focus:ring-amber-300" : ""
                  }
                />
              </div>
            </div>

            {/* Rate change alert banner */}
            {rateNum > 0 &&
              lastKnownRate != null &&
              rateNum !== lastKnownRate && (
                <RateChangeBanner
                  currentRate={rateNum}
                  lastRate={lastKnownRate}
                />
              )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">
                  Transport (₹)
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={transport}
                  onChange={(e) => setTransport(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">
                  Labour (₹)
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={labour}
                  onChange={(e) => setLabour(e.target.value)}
                />
              </div>
            </div>

            {qtyNum > 0 && rateNum > 0 && (
              <div className="rounded-xl bg-muted/50 border p-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Purchase ({qtyNum} × {fmt(rateNum)})
                  </span>
                  <span className="font-medium">{fmt(rateNum * qtyNum)}</span>
                </div>
                {transportNum > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transport</span>
                    <span>{fmt(transportNum)}</span>
                  </div>
                )}
                {labourNum > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Labour</span>
                    <span>{fmt(labourNum)}</span>
                  </div>
                )}
                <div className="border-t pt-1.5 flex justify-between font-bold text-foreground">
                  <span>Final Cost (Total)</span>
                  <span>{fmt(finalCost)}</span>
                </div>
                <div className="flex justify-between text-primary font-semibold">
                  <span>Per Unit Cost</span>
                  <span>{fmt(perUnit)}</span>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={!canSave || saving}
                data-ocid="po-save-btn"
              >
                {saving ? "Saving..." : "Order Save Karein"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Update Confirmation Dialog */}
      {showCostUpdateDialog && pendingPOData && selectedProduct && (
        <CostUpdateDialog
          productName={selectedProduct.name}
          oldCost={selectedProduct.costPrice ?? rateNum}
          newCost={pendingPOData.rate}
          onConfirm={handleCostUpdateConfirm}
          onCancel={handleCostUpdateCancel}
        />
      )}
    </>
  );
}

// ─── Mark Received Modal ──────────────────────────────────────────────────────

interface MarkReceivedModalProps {
  po: PurchaseOrder;
  productName: string;
  onClose: () => void;
}

function MarkReceivedModal({
  po,
  productName,
  onClose,
}: MarkReceivedModalProps) {
  const {
    markPurchaseReceived,
    addVendorRateHistory,
    getLastVendorRate,
    products,
    updateProduct,
    appConfig,
  } = useStore();
  const [receivedQty, setReceivedQty] = useState(String(po.qty));
  const [saving, setSaving] = useState(false);
  const [showCostUpdateDialog, setShowCostUpdateDialog] = useState(false);

  const selectedProduct = products.find((p) => p.id === po.productId);

  async function handleSave() {
    const qty = Number.parseFloat(receivedQty);
    if (!qty || qty <= 0) return;
    setSaving(true);
    try {
      await markPurchaseReceived(po.id, qty);

      // Save rate history
      const lastRate = getLastVendorRate(po.vendorId, po.productId);
      if (po.rate !== lastRate) {
        await addVendorRateHistory({
          vendorId: po.vendorId,
          productId: po.productId,
          oldRate: lastRate ?? 0,
          newRate: po.rate,
          changedBy: po.createdBy,
        });

        // Check if auto-update enabled
        if (appConfig.autoUpdateCostOnVendorRateChange && selectedProduct) {
          updateProduct(po.productId, { costPrice: po.rate });
          toast.success(`Cost price ${`₹${po.rate}`} mein auto-update ho gaya`);
          onClose();
          return;
        }

        // Show manual confirmation
        if (selectedProduct && lastRate != null && lastRate !== po.rate) {
          setSaving(false);
          setShowCostUpdateDialog(true);
          return;
        }
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
        <div className="bg-card w-full max-w-sm rounded-t-2xl sm:rounded-2xl shadow-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">Mal Prapt Karein ✅</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-muted"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            Product: <strong>{productName}</strong>
            <br />
            Ordered: <strong>{po.qty}</strong> units @{" "}
            <strong>{fmt(po.rate)}</strong>
          </p>
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">
              Received Qty *
            </Label>
            <Input
              type="number"
              min="1"
              max={po.qty}
              value={receivedQty}
              onChange={(e) => setReceivedQty(e.target.value)}
              data-ocid="po-received-qty-input"
            />
            <p className="text-xs text-muted-foreground">
              Partial receive karne par status "Partial" ho jaayega
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={saving}
              data-ocid="po-mark-received-btn"
            >
              {saving ? "..." : "Confirm"}
            </Button>
          </div>
        </div>
      </div>

      {showCostUpdateDialog && selectedProduct && (
        <CostUpdateDialog
          productName={selectedProduct.name}
          oldCost={selectedProduct.costPrice ?? po.rate}
          newCost={po.rate}
          onConfirm={() => {
            updateProduct(po.productId, { costPrice: po.rate });
            toast.success("Cost price update ho gaya ✅");
            setShowCostUpdateDialog(false);
            onClose();
          }}
          onCancel={() => {
            setShowCostUpdateDialog(false);
            onClose();
          }}
        />
      )}
    </>
  );
}

// ─── Send Order Modal ─────────────────────────────────────────────────────────

interface SendOrderModalProps {
  po: PurchaseOrder;
  vendor: Vendor;
  productName: string;
  onClose: () => void;
}

function SendOrderModal({
  po,
  vendor,
  productName,
  onClose,
}: SendOrderModalProps) {
  const total = po.qty * po.rate;
  const message = `Namaste ${vendor.name},\nhume ye items chahiye:\nProduct: ${productName}\nQty: ${po.qty}\nRate: ₹${po.rate}\n\nTotal: ₹${total}\n\nPlease confirm order.`;
  const [copied, setCopied] = useState(false);

  function handleWhatsApp() {
    // Sanitize: strip non-digits, remove leading country code 91 if present, validate 10 digits
    const digits = vendor.mobile.replace(/\D/g, "");
    const mobile10 =
      digits.startsWith("91") && digits.length === 12
        ? digits.slice(2)
        : digits;
    const cleanMobile = mobile10.length === 10 ? mobile10 : digits;
    window.open(
      `https://wa.me/91${cleanMobile}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  }

  function handleEmail() {
    window.open(
      `mailto:${vendor.email}?subject=${encodeURIComponent(`Purchase Order - ${productName}`)}&body=${encodeURIComponent(message)}`,
    );
  }

  function handleCopy() {
    navigator.clipboard.writeText(message).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="bg-card w-full max-w-sm rounded-t-2xl sm:rounded-2xl shadow-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-foreground">
            Order Message Bhejein 📤
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <div className="bg-muted/50 rounded-xl p-3 text-sm text-foreground whitespace-pre-line border">
          {message}
        </div>
        <div className="space-y-2">
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
            onClick={handleWhatsApp}
            data-ocid="po-whatsapp-btn"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp pe Bhejein
          </Button>
          {vendor.email && (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleEmail}
              data-ocid="po-email-btn"
            >
              <Mail className="w-4 h-4" />
              Email Bhejein
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleCopy}
            data-ocid="po-copy-btn"
          >
            <Copy className="w-4 h-4" />
            {copied ? "Copied! ✓" : "Message Copy Karein"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

interface PurchaseOrdersPageProps {
  reorderProductId?: string;
  reorderVendorId?: string;
  reorderRate?: number;
}

export function PurchaseOrdersPage({
  reorderProductId,
  reorderVendorId,
  reorderRate,
}: PurchaseOrdersPageProps) {
  const { vendors, products, purchaseOrders } = useStore();
  const { currentUser } = useAuth();
  const role = currentUser?.role ?? "staff";
  const canManage = role === "owner" || role === "manager";

  const [filter, setFilter] = useState<FilterTab>("all");
  const [showAddModal, setShowAddModal] = useState(!!reorderProductId);
  const [receivingPO, setReceivingPO] = useState<PurchaseOrder | null>(null);
  const [sendingPO, setSendingPO] = useState<PurchaseOrder | null>(null);
  const [expandedLedger, setExpandedLedger] = useState(false);

  const filteredOrders = useMemo(() => {
    const sorted = [...purchaseOrders].sort(
      (a, b) => b.createdAt - a.createdAt,
    );
    if (filter === "all") return sorted;
    return sorted.filter((po) => po.status === filter);
  }, [purchaseOrders, filter]);

  const vendorLedger = useMemo(() => {
    return vendors
      .map((v) => {
        const vOrders = purchaseOrders.filter((po) => po.vendorId === v.id);
        if (vOrders.length === 0) return null;
        const totalPurchase = vOrders.reduce(
          (sum, po) =>
            sum + po.qty * po.rate + po.transportCharge + po.labourCharge,
          0,
        );
        const received = vOrders.filter(
          (po) => po.status === "received",
        ).length;
        const pending = vOrders.filter((po) => po.status === "pending").length;
        const partial = vOrders.filter((po) => po.status === "partial").length;
        let colorClass = "text-success";
        if (pending === vOrders.length) colorClass = "text-danger";
        else if (pending > 0 || partial > 0) colorClass = "text-warning";
        return {
          vendor: v,
          totalPurchase,
          received,
          pending,
          partial,
          colorClass,
        };
      })
      .filter(Boolean) as Array<{
      vendor: Vendor;
      totalPurchase: number;
      received: number;
      pending: number;
      partial: number;
      colorClass: string;
    }>;
  }, [vendors, purchaseOrders]);

  const filterTabs: { id: FilterTab; label: string; count: number }[] = [
    { id: "all", label: "Sab", count: purchaseOrders.length },
    {
      id: "pending",
      label: "Pending",
      count: purchaseOrders.filter((p) => p.status === "pending").length,
    },
    {
      id: "received",
      label: "Received",
      count: purchaseOrders.filter((p) => p.status === "received").length,
    },
    {
      id: "partial",
      label: "Partial",
      count: purchaseOrders.filter((p) => p.status === "partial").length,
    },
  ];

  const getProductName = (id: string) =>
    products.find((p) => p.id === id)?.name ?? "Unknown Product";
  const getVendorName = (id: string) =>
    vendors.find((v) => v.id === id)?.name ?? "Unknown Vendor";
  const getVendor = (id: string) => vendors.find((v) => v.id === id);

  return (
    <div className="flex flex-col min-h-full bg-background page-fade-in">
      {/* Header */}
      <div className="bg-card border-b shadow-card px-4 pt-4 pb-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">
              Purchase Orders
              <span className="text-sm font-normal text-muted-foreground ml-1">
                (खरीद ऑर्डर)
              </span>
            </h1>
            <Badge variant="secondary" className="text-xs">
              {purchaseOrders.length}
            </Badge>
          </div>
          {canManage && (
            <Button
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="gap-1 text-xs"
              data-ocid="po-add-btn"
            >
              <Plus className="w-3.5 h-3.5" />
              New Order
            </Button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              data-ocid={`po-filter-${tab.id}`}
              className={`flex-none flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                filter === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs ${filter === tab.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Order list */}
      <div className="flex-1 p-3 space-y-2">
        {filteredOrders.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 gap-3 text-center"
            data-ocid="po-empty-state"
          >
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <ShoppingCart className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              Koi purchase order nahi hai.
            </p>
            {canManage && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddModal(true)}
                className="gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Pehla Order Banayein
              </Button>
            )}
          </div>
        ) : (
          filteredOrders.map((po) => {
            const productName = getProductName(po.productId);
            const vendorName = getVendorName(po.vendorId);
            const vendor = getVendor(po.vendorId);
            const total =
              po.qty * po.rate + po.transportCharge + po.labourCharge;

            return (
              <div
                key={po.id}
                className="bg-card rounded-xl border shadow-card p-3 space-y-2"
                data-ocid={`po-row-${po.id}`}
              >
                {/* Vendor + Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-muted-foreground flex-none" />
                      <span className="text-sm font-semibold text-foreground truncate">
                        {vendorName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Package className="w-3.5 h-3.5 text-muted-foreground flex-none" />
                      <span className="text-xs text-muted-foreground truncate">
                        {productName}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={po.status} />
                </div>

                {/* Qty / Rate / Total */}
                <div className="grid grid-cols-3 gap-2 bg-muted/30 rounded-lg px-3 py-2 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Qty</p>
                    <p className="text-sm font-bold text-foreground">
                      {po.qty}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rate</p>
                    <p className="text-sm font-bold text-foreground">
                      {fmt(po.rate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-sm font-bold text-primary">
                      {fmt(total)}
                    </p>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>📅 {fmtDate(po.createdAt)}</span>
                  <span>👤 {po.createdBy}</span>
                </div>

                {/* Actions */}
                {canManage && po.status !== "received" && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs gap-1"
                      onClick={() => setReceivingPO(po)}
                      data-ocid={`po-receive-btn-${po.id}`}
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                      Mark Received
                    </Button>
                    {vendor && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs gap-1"
                        onClick={() => setSendingPO(po)}
                        data-ocid={`po-send-btn-${po.id}`}
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                        Send Order
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Vendor Ledger Section */}
      {vendorLedger.length > 0 && (
        <div className="mx-3 mb-3 bg-card rounded-xl border shadow-card overflow-hidden">
          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-foreground hover:bg-muted/30 transition-colors"
            onClick={() => setExpandedLedger((v) => !v)}
            data-ocid="po-ledger-toggle"
          >
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Vendor Ledger (विक्रेता खाता)
            </span>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform ${expandedLedger ? "rotate-180" : ""}`}
            />
          </button>

          {expandedLedger && (
            <div className="border-t">
              {vendorLedger.map(
                ({ vendor, totalPurchase, received, pending, colorClass }) => (
                  <div
                    key={vendor.id}
                    className="flex items-center justify-between px-4 py-3 border-b last:border-b-0 gap-2"
                    data-ocid={`po-ledger-row-${vendor.id}`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {vendor.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          ✅ {received} received
                        </span>
                        {pending > 0 && (
                          <span className="text-xs text-orange-600">
                            ⏳ {pending} pending
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-none">
                      <p className={`text-sm font-bold ${colorClass}`}>
                        {fmt(totalPurchase)}
                      </p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddPOModal
          reorderProductId={reorderProductId}
          reorderVendorId={reorderVendorId}
          reorderRate={reorderRate}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {receivingPO && (
        <MarkReceivedModal
          po={receivingPO}
          productName={getProductName(receivingPO.productId)}
          onClose={() => setReceivingPO(null)}
        />
      )}
      {sendingPO && getVendor(sendingPO.vendorId) && (
        <SendOrderModal
          po={sendingPO}
          vendor={getVendor(sendingPO.vendorId)!}
          productName={getProductName(sendingPO.productId)}
          onClose={() => setSendingPO(null)}
        />
      )}
    </div>
  );
}
