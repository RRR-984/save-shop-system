import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Layers,
  Lock,
  MessageCircle,
  Minus,
  Plus,
  Printer,
  Receipt,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TopBar } from "../components/TopBar";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import type { Invoice, InvoiceItem } from "../types/store";
import { ROLE_PERMISSIONS } from "../types/store";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

type PaymentMode = "cash" | "upi" | "online" | "credit";

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  sellingRate: number;
  unit: string;
  selectedBatchId?: string;
  basePrice: number; // original selling price from product
}

// ─── Smart Pricing Helpers ────────────────────────────────────────────────────

function getMinPrice(costPrice: number, minProfitPct: number): number {
  return costPrice + (costPrice * minProfitPct) / 100;
}

function getDiscountPct(basePrice: number, sellingRate: number): number {
  if (sellingRate >= basePrice) return 0;
  return ((basePrice - sellingRate) / basePrice) * 100;
}

function calcExtraProfit(
  basePrice: number,
  sellingRate: number,
  qty: number,
): number {
  if (sellingRate <= basePrice) return 0;
  return (sellingRate - basePrice) * qty;
}

function calcStaffBonus(extraProfit: number): number {
  return extraProfit * 0.5;
}

// ─── Low Price Alert Modal ────────────────────────────────────────────────────

interface LowPriceItem {
  productId: string;
  productName: string;
  enteredPrice: number;
  minSellPrice: number;
  costPrice: number;
}

interface LowPriceModalProps {
  items: LowPriceItem[];
  isLockMode: boolean;
  ownerPin: string;
  staffName: string;
  userRole: string;
  onContinue: (overridden: boolean, pinUsed: boolean) => void;
  onCancel: () => void;
}

function LowPriceAlertModal({
  items,
  isLockMode,
  ownerPin,
  userRole,
  onContinue,
  onCancel,
}: Omit<LowPriceModalProps, "staffName">) {
  const [pinInput, setPinInput] = useState("");
  const [pinAttempts, setPinAttempts] = useState(0);
  const [pinError, setPinError] = useState("");
  const MAX_ATTEMPTS = 3;

  const isOwner = userRole === "owner";

  function handlePinSubmit() {
    if (pinInput === ownerPin) {
      onContinue(true, true);
    } else {
      const next = pinAttempts + 1;
      setPinAttempts(next);
      if (next >= MAX_ATTEMPTS) {
        setPinError(`${MAX_ATTEMPTS} baar galat PIN — sale blocked`);
        setTimeout(() => onCancel(), 1500);
      } else {
        setPinError(`Galat PIN — ${MAX_ATTEMPTS - next} attempt bache hain`);
        setPinInput("");
      }
    }
  }

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent
        data-ocid="billing.low_price_alert.dialog"
        className="max-w-md max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-700">
            <ShieldAlert size={18} className="text-red-600" />
            ⚠️ Low Price Alert
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Neeche diye items minimum profit price se{" "}
            <span className="text-red-600 font-semibold">kam rate</span> par
            bech rahe hain:
          </p>

          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.productId}
                className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm"
              >
                <div className="font-semibold text-red-800 mb-2">
                  {item.productName}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Lagat</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(Math.round(item.costPrice))}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Min Price</span>
                    <span className="font-semibold text-amber-700">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(Math.round(item.minSellPrice))}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Entered</span>
                    <span className="font-bold text-red-600">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(Math.round(item.enteredPrice))}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-red-700 font-medium">
                  Loss per unit:{" "}
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(
                    Math.round(
                      Math.max(0, item.minSellPrice - item.enteredPrice),
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>

          {!isLockMode ? (
            // WARNING MODE — allow with warning (all roles)
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-300">
                <AlertTriangle
                  size={16}
                  className="text-amber-600 mt-0.5 flex-shrink-0"
                />
                <p className="text-xs text-amber-700">
                  <strong>Warning Mode:</strong> Sale allowed hai — lekin
                  minimum profit se neeche bech rahe hain. Kya aap jaari rakhna
                  chahte hain?
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  data-ocid="billing.low_price_alert.cancel.button"
                  variant="outline"
                  className="flex-1"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="billing.low_price_alert.continue.button"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={() => onContinue(false, false)}
                >
                  Sale Jaari Rakhein
                </Button>
              </div>
            </div>
          ) : isOwner ? (
            // LOCK MODE + OWNER — show PIN input
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-300">
                <Lock size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-700">
                  <strong>Lock Mode:</strong> Sale blocked hai. Apna Owner PIN
                  daalein override ke liye.
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Lock size={14} /> Owner Override PIN
                </Label>
                <div className="flex gap-2">
                  <Input
                    data-ocid="billing.low_price_alert.pin.input"
                    type="password"
                    placeholder="PIN enter karein (4-6 digits)"
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      setPinError("");
                    }}
                    maxLength={6}
                    className={`flex-1 ${pinError ? "border-red-500" : ""}`}
                    disabled={pinAttempts >= MAX_ATTEMPTS}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handlePinSubmit();
                    }}
                  />
                  <Button
                    data-ocid="billing.low_price_alert.pin_submit.button"
                    variant="outline"
                    onClick={handlePinSubmit}
                    disabled={!pinInput || pinAttempts >= MAX_ATTEMPTS}
                  >
                    Override
                  </Button>
                </div>
                {pinError && (
                  <p className="text-xs text-red-600 font-medium">{pinError}</p>
                )}
                {!ownerPin && (
                  <p className="text-xs text-muted-foreground">
                    💡 Settings mein Owner PIN set karein pehle
                  </p>
                )}
              </div>
              <Button
                data-ocid="billing.low_price_alert.lock_cancel.button"
                variant="outline"
                className="w-full"
                onClick={onCancel}
              >
                Cancel Sale
              </Button>
            </div>
          ) : (
            // LOCK MODE + NON-OWNER (Manager / Staff) — blocked with message
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-300">
                <ShieldAlert
                  size={16}
                  className="text-red-600 mt-0.5 flex-shrink-0"
                />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-red-800">
                    Access Denied — Owner Approval Required
                  </p>
                  <p className="text-xs text-red-700">
                    Sirf Owner override kar sakta hai / Only Owner can approve
                    low price sales. Apne Owner se PIN lein aur unhe login karne
                    dein.
                  </p>
                </div>
              </div>
              <Button
                data-ocid="billing.low_price_alert.non_owner_cancel.button"
                variant="outline"
                className="w-full"
                onClick={onCancel}
              >
                Cancel Sale
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BillingPage() {
  const {
    products,
    getProductStock,
    calculateFIFOCost,
    createInvoice,
    getProductBatches,
    getProductCostPrice,
    appConfig,
    addLowPriceAlertLog,
    addAuditLog,
  } = useStore();
  const { currentUser } = useAuth();
  const userRole = currentUser?.role ?? "staff";
  const canViewCost = ROLE_PERMISSIONS.canViewCostPrice(userRole);

  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [qtyInputs, setQtyInputs] = useState<Record<string, string>>({});
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [paidAmountStr, setPaidAmountStr] = useState("");
  const [isPartial, setIsPartial] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [addQty, setAddQty] = useState("1");
  const [manualBatchMode, setManualBatchMode] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [generatedInvoice, setGeneratedInvoice] = useState<Invoice | null>(
    null,
  );
  const [showInvoice, setShowInvoice] = useState(false);

  // Low Price Alert Modal state
  const [showLowPriceModal, setShowLowPriceModal] = useState(false);
  const [pendingLowPriceItems, setPendingLowPriceItems] = useState<
    LowPriceItem[]
  >([]);
  // Holds the resolved invoice data waiting for user decision
  const [pendingInvoiceData, setPendingInvoiceData] = useState<Omit<
    Invoice,
    "id" | "invoiceNumber"
  > | null>(null);
  const [pendingInvoiceItems, setPendingInvoiceItems] = useState<InvoiceItem[]>(
    [],
  );

  const total = cart.reduce(
    (s, item) => s + item.quantity * item.sellingRate,
    0,
  );

  // Compute effective paid and due amounts
  const computedPaid = (() => {
    if (paymentMode === "credit") return 0;
    if (
      paymentMode === "cash" ||
      paymentMode === "upi" ||
      paymentMode === "online"
    ) {
      if (isPartial && paidAmountStr !== "") {
        return Math.min(Number(paidAmountStr) || 0, total);
      }
      return total;
    }
    return total;
  })();

  const computedDue = total - computedPaid;

  // Build per-item over-sell details (batch-aware)
  const overSellItems = cart
    .map((item) => {
      const available = item.selectedBatchId
        ? (getProductBatches(item.productId).find(
            (b) => b.id === item.selectedBatchId,
          )?.quantity ?? 0)
        : getProductStock(item.productId);
      if (item.quantity > available) {
        return {
          productId: item.productId,
          productName: item.productName,
          availableStock: available,
          enteredQty: item.quantity,
          overSellQty: item.quantity - available,
          unit: item.unit,
        };
      }
      return null;
    })
    .filter(Boolean) as {
    productId: string;
    productName: string;
    availableStock: number;
    enteredQty: number;
    overSellQty: number;
    unit: string;
  }[];

  const hasOverSell = overSellItems.length > 0;

  const handlePaymentModeChange = (mode: PaymentMode) => {
    setPaymentMode(mode);
    setIsPartial(false);
    setPaidAmountStr("");
  };

  const handleAddToCart = () => {
    if (!selectedProductId || !addQty) return;
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;
    let qty = Number(addQty);
    if (qty <= 0) {
      toast.error("Quantity must be positive");
      return;
    }

    let resolvedBatchId: string | undefined;

    if (manualBatchMode && selectedBatchId) {
      // OPTION B: Manual batch selection — cap qty to batch quantity
      const batch = getProductBatches(selectedProductId).find(
        (b) => b.id === selectedBatchId,
      );
      if (!batch) {
        toast.error("Selected batch not found");
        return;
      }
      if (qty > batch.quantity) {
        toast.warning(
          `⚠️ Qty ${qty} exceeds batch stock (${batch.quantity} ${product.unit}). Capping to batch qty.`,
        );
        qty = batch.quantity;
      }
      resolvedBatchId = selectedBatchId;
    } else {
      const available = getProductStock(selectedProductId);
      if (qty > available) {
        toast.warning(
          `⚠️ Over Sell: Sirf ${available} ${product.unit} available hai`,
        );
      }
    }

    const existing = cart.find(
      (i) =>
        i.productId === selectedProductId &&
        i.selectedBatchId === resolvedBatchId,
    );
    if (existing && !manualBatchMode) {
      const newQty = existing.quantity + qty;
      setCart((prev) =>
        prev.map((i) =>
          i.productId === selectedProductId && !i.selectedBatchId
            ? { ...i, quantity: newQty }
            : i,
        ),
      );
      setQtyInputs((prev) => ({
        ...prev,
        [selectedProductId]: String(newQty),
      }));
    } else {
      const cartKey = resolvedBatchId ?? selectedProductId;
      setCart((prev) => [
        ...prev,
        {
          productId: selectedProductId,
          productName: product.name,
          quantity: qty,
          sellingRate: product.sellingPrice,
          unit: product.unit,
          basePrice: product.sellingPrice,
          ...(resolvedBatchId ? { selectedBatchId: resolvedBatchId } : {}),
        },
      ]);
      setQtyInputs((prev) => ({ ...prev, [cartKey]: String(qty) }));
    }
    setSelectedProductId("");
    setAddQty("1");
    setSelectedBatchId("");
  };

  const handleRemoveItem = (productId: string, batchId?: string) => {
    setCart((prev) =>
      prev.filter(
        (i) =>
          !(
            i.productId === productId &&
            (i.selectedBatchId ?? "") === (batchId ?? "")
          ),
      ),
    );
    const cartKey = batchId ?? productId;
    setQtyInputs((prev) => {
      const next = { ...prev };
      delete next[cartKey];
      return next;
    });
  };

  const handleQtyInputChange = (
    productId: string,
    raw: string,
    batchId?: string,
  ) => {
    const cartKey = batchId ?? productId;
    setQtyInputs((prev) => ({ ...prev, [cartKey]: raw }));
    if (raw === "") return;
    const num = Number(raw);
    if (Number.isNaN(num)) return;
    if (num >= 0) {
      setCart((prev) =>
        prev.map((i) =>
          i.productId === productId &&
          (i.selectedBatchId ?? "") === (batchId ?? "")
            ? { ...i, quantity: num }
            : i,
        ),
      );
    }
  };

  const handleQtyDecrement = (productId: string, batchId?: string) => {
    const item = cart.find(
      (i) =>
        i.productId === productId &&
        (i.selectedBatchId ?? "") === (batchId ?? ""),
    );
    if (!item) return;
    const newQty = Math.max(0, item.quantity - 1);
    const cartKey = batchId ?? productId;
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId &&
        (i.selectedBatchId ?? "") === (batchId ?? "")
          ? { ...i, quantity: newQty }
          : i,
      ),
    );
    setQtyInputs((prev) => ({ ...prev, [cartKey]: String(newQty) }));
  };

  const handleQtyIncrement = (productId: string, batchId?: string) => {
    const item = cart.find(
      (i) =>
        i.productId === productId &&
        (i.selectedBatchId ?? "") === (batchId ?? ""),
    );
    if (!item) return;
    const newQty = item.quantity + 1;
    const cartKey = batchId ?? productId;
    if (batchId) {
      const batch = getProductBatches(productId).find((b) => b.id === batchId);
      if (batch && newQty > batch.quantity) {
        toast.warning(`⚠️ Batch stock sirf ${batch.quantity} ${item.unit} hai`);
      }
    } else {
      const available = getProductStock(productId);
      if (newQty > available) {
        toast.warning(`⚠️ Over Sell: Sirf ${available} ${item.unit} available`);
      }
    }
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId &&
        (i.selectedBatchId ?? "") === (batchId ?? "")
          ? { ...i, quantity: newQty }
          : i,
      ),
    );
    setQtyInputs((prev) => ({ ...prev, [cartKey]: String(newQty) }));
  };

  const handleRateChange = (productId: string, rate: number) => {
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, sellingRate: rate } : i,
      ),
    );
    // Validate smart pricing rules
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const costPrice = getProductCostPrice(productId);
    const basePrice = product.sellingPrice;
    const minProfitPct = product.minProfitPct ?? 0;
    const minPrice = getMinPrice(costPrice, minProfitPct);
    const discountPct = getDiscountPct(basePrice, rate);
    let error = "";
    if (!rate || rate <= 0 || Number.isNaN(rate)) {
      error = "Invalid price — 0 ya negative price allowed nahi hai";
    } else if (costPrice > 0 && rate < minPrice) {
      error = `Minimum price ₹${minPrice.toFixed(0)} se kam nahi ho sakta (Cost + Min Profit)`;
    } else if (
      userRole !== "owner" &&
      userRole !== "manager" &&
      rate < basePrice &&
      discountPct > 18
    ) {
      error = `Staff maximum 18% discount de sakta hai (Min rate: ₹${(basePrice * 0.82).toFixed(0)})`;
    } else if (
      (userRole === "owner" || userRole === "manager") &&
      rate < basePrice &&
      discountPct > 20
    ) {
      error = `Owner/Manager maximum 20% discount de sakta hai (Min rate: ₹${(basePrice * 0.8).toFixed(0)})`;
    }
    setItemErrors((prev) => {
      const next = { ...prev };
      if (error) {
        next[productId] = error;
      } else {
        delete next[productId];
      }
      return next;
    });
  };

  const handleGenerateInvoice = () => {
    if (cart.length === 0) {
      toast.error("Add items to cart first");
      return;
    }
    if (Object.keys(itemErrors).length > 0) {
      toast.error("Pricing errors fix karein pehle");
      return;
    }
    if (cart.some((i) => i.quantity === 0)) {
      toast.error("Kuch items ka qty 0 hai — pehle theek karein ya hatayein");
      return;
    }
    if (paymentMode === "credit" && !customerName.trim()) {
      toast.error("Credit sale ke liye Customer Name required hai");
      return;
    }
    // Validation: mobile required for credit sale
    if (paymentMode === "credit" && !customerMobile.trim()) {
      toast.error("⚠️ Credit sale ke liye Mobile Number zaroori hai");
      return;
    }
    // Also block due > 0 without mobile (partial payment case)
    if (
      computedDue > 0 &&
      !customerMobile.trim() &&
      !isWalkIn(customerName.trim())
    ) {
      toast.error("⚠️ Udhaar sale ke liye Mobile Number daalna zaroori hai");
      return;
    }

    const invoiceItems: InvoiceItem[] = cart.map((item) => {
      const available = getProductStock(item.productId);
      const fifo = calculateFIFOCost(item.productId, item.quantity);
      const isOverSell = item.quantity > available;
      const product = products.find((p) => p.id === item.productId);
      const purchaseCostPerUnit = fifo.success
        ? fifo.totalCost / item.quantity
        : 0;
      const costPrice =
        product?.costPrice ?? product?.purchasePrice ?? purchaseCostPerUnit;
      const profitPerUnit = item.sellingRate - costPrice;
      const totalProfit = profitPerUnit * item.quantity;
      return {
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        sellingRate: item.sellingRate,
        purchaseCost: purchaseCostPerUnit,
        profitPerUnit,
        totalProfit,
        isOverSell,
        availableStockAtSale: available,
        ...(item.selectedBatchId
          ? { selectedBatchId: item.selectedBatchId }
          : {}),
      };
    });

    // ── Low Price Check ──────────────────────────────────────────────────────
    const lowPriceItems: LowPriceItem[] = cart
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        const costPrice = getProductCostPrice(item.productId);
        const minProfitPct = product?.minProfitPct ?? 0;
        if (costPrice <= 0 || minProfitPct <= 0) return null;
        const minSellPrice = getMinPrice(costPrice, minProfitPct);
        if (item.sellingRate < minSellPrice) {
          return {
            productId: item.productId,
            productName: item.productName,
            enteredPrice: item.sellingRate,
            minSellPrice,
            costPrice,
          };
        }
        return null;
      })
      .filter(Boolean) as LowPriceItem[];

    // Build invoice data now (used after modal decision)
    const invoiceTotalProfit = invoiceItems.reduce(
      (s, item) => s + (item.totalProfit ?? 0),
      0,
    );
    const totalExtraProfit = invoiceItems.reduce(
      (s, item) => s + (item.extraProfit ?? 0),
      0,
    );
    const totalStaffBonus = invoiceItems.reduce(
      (s, item) => s + (item.staffBonus ?? 0),
      0,
    );
    const invoiceData: Omit<Invoice, "id" | "invoiceNumber"> = {
      customerId: null,
      customerName: customerName.trim() || "Walk-in Customer",
      customerMobile: customerMobile.trim(),
      items: invoiceItems,
      totalAmount: total,
      paidAmount: computedPaid,
      dueAmount: computedDue,
      paymentMode,
      date: new Date().toISOString(),
      invoiceTotalProfit,
      totalExtraProfit: totalExtraProfit > 0 ? totalExtraProfit : undefined,
      totalStaffBonus: totalStaffBonus > 0 ? totalStaffBonus : undefined,
      soldByUserId: currentUser?.id ?? undefined,
      soldByName: currentUser?.name ?? undefined,
    };

    if (lowPriceItems.length > 0) {
      // Show modal — save pending data
      setPendingLowPriceItems(lowPriceItems);
      setPendingInvoiceData(invoiceData);
      setPendingInvoiceItems(invoiceItems);
      setShowLowPriceModal(true);
      return;
    }

    // No low price issues — proceed directly
    doCreateInvoice(invoiceData, invoiceItems, false, false, []);
  };

  function doCreateInvoice(
    invoiceData: Omit<Invoice, "id" | "invoiceNumber">,
    _invoiceItems: InvoiceItem[],
    wasBlocked: boolean,
    pinUsed: boolean,
    lowItems: LowPriceItem[],
  ) {
    // Log each low price item
    for (const item of lowItems) {
      const attemptType = wasBlocked
        ? "blocked"
        : pinUsed
          ? "overridden"
          : "warned";
      addLowPriceAlertLog({
        shopId: "",
        productId: item.productId,
        productName: item.productName,
        staffName: currentUser?.name ?? "Unknown",
        enteredPrice: item.enteredPrice,
        minSellPrice: item.minSellPrice,
        costPrice: item.costPrice,
        attemptType,
        pinUsed,
        timestamp: new Date().toISOString(),
      });
      // Audit log for low price attempt
      addAuditLog(
        "low_price_attempt",
        `${item.productName} — entered ₹${item.enteredPrice}, min ₹${item.minSellPrice.toFixed(0)}, status: ${attemptType}`,
        item.productId,
      );
    }
    // Audit log for low price override approved
    if (pinUsed && lowItems.length > 0) {
      addAuditLog(
        "low_price_override",
        `Owner PIN override — ${lowItems.map((i) => i.productName).join(", ")}`,
      );
    }

    if (wasBlocked) return;

    const { invoice, mergedExisting } = createInvoice(invoiceData);

    // Audit log for sale created
    addAuditLog(
      "sale_created",
      `Invoice ${invoice.invoiceNumber} — ₹${invoice.totalAmount} — ${invoice.paymentMode} — Customer: ${invoice.customerName}`,
      invoice.id,
    );

    // Show merge warning if same mobile was already in ledger
    if (mergedExisting) {
      toast.warning("⚠️ Same mobile detected — merging customer data");
    }

    setGeneratedInvoice(invoice);
    setShowInvoice(true);
    setCart([]);
    setQtyInputs({});
    setItemErrors({});
    setCustomerName("");
    setCustomerMobile("");
    setPaidAmountStr("");
    setIsPartial(false);
    setPaymentMode("cash");
    setManualBatchMode(false);
    setSelectedBatchId("");
    toast.success(`Invoice ${invoice.invoiceNumber} generated!`);
  }

  function handleLowPriceModalContinue(overridden: boolean, pinUsed: boolean) {
    setShowLowPriceModal(false);
    if (!pendingInvoiceData) return;
    const isLockMode = !(appConfig.allowLowPriceSelling ?? true);
    const isBlocked = isLockMode && !overridden;
    if (isBlocked) {
      // Log as blocked
      doCreateInvoice(
        pendingInvoiceData,
        pendingInvoiceItems,
        true,
        false,
        pendingLowPriceItems,
      );
    } else {
      doCreateInvoice(
        pendingInvoiceData,
        pendingInvoiceItems,
        false,
        pinUsed,
        pendingLowPriceItems,
      );
    }
    setPendingLowPriceItems([]);
    setPendingInvoiceData(null);
    setPendingInvoiceItems([]);
  }

  function handleLowPriceModalCancel() {
    // Log as blocked
    if (pendingLowPriceItems.length > 0) {
      for (const item of pendingLowPriceItems) {
        addLowPriceAlertLog({
          shopId: "",
          productId: item.productId,
          productName: item.productName,
          staffName: currentUser?.name ?? "Unknown",
          enteredPrice: item.enteredPrice,
          minSellPrice: item.minSellPrice,
          costPrice: item.costPrice,
          attemptType: "blocked",
          pinUsed: false,
          timestamp: new Date().toISOString(),
        });
        addAuditLog(
          "low_price_attempt",
          `${item.productName} — entered ₹${item.enteredPrice}, min ₹${item.minSellPrice.toFixed(0)}, status: blocked (cancelled)`,
          item.productId,
        );
      }
    }
    setShowLowPriceModal(false);
    setPendingLowPriceItems([]);
    setPendingInvoiceData(null);
    setPendingInvoiceItems([]);
  }

  // Helper to check walk-in name (mirrors StoreContext logic)
  function isWalkIn(name: string): boolean {
    return (
      name.trim().toLowerCase() === "walk-in customer" || name.trim() === ""
    );
  }

  const paymentModeColors: Record<PaymentMode, string> = {
    cash: "bg-green-50 border-green-400 text-green-700",
    upi: "bg-blue-50 border-blue-400 text-blue-700",
    online: "bg-purple-50 border-purple-400 text-purple-700",
    credit: "bg-amber-50 border-amber-400 text-amber-700",
  };

  return (
    <div className="flex flex-col gap-6">
      <TopBar title="Billing / POS" />

      <div className="px-4 md:px-6 pb-6 flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold">Point of Sale</h1>
          <p className="text-muted-foreground text-sm">
            Create invoices with automatic FIFO stock deduction
          </p>
        </div>

        {/* Over Sell Detailed Alert Box */}
        {hasOverSell && (
          <div
            data-ocid="billing.oversell_alert_box"
            className="rounded-lg border-2 border-red-500 bg-red-50 p-4 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2 text-red-700 font-semibold text-sm">
              <AlertTriangle size={18} className="shrink-0" />
              Over Sell Alert — {overSellItems.length} item(s) ka stock kum hai
            </div>
            <div className="flex flex-col gap-2">
              {overSellItems.map((osi) => (
                <div
                  key={osi.productId}
                  className="bg-white border border-red-200 rounded-md p-3 text-sm"
                >
                  <div className="font-semibold text-red-800 mb-1">
                    {osi.productName}
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-xs">
                    <div>
                      <span className="text-muted-foreground">
                        Available Stock:
                      </span>
                      <span className="ml-1 font-medium text-foreground">
                        {osi.availableStock} {osi.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Entered Qty:
                      </span>
                      <span className="ml-1 font-medium text-foreground">
                        {osi.enteredQty} {osi.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Over Sell Qty:
                      </span>
                      <span className="ml-1 font-bold text-red-600">
                        {osi.overSellQty} {osi.unit}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-red-600">
              ⚠️ Invoice ban sakta hai, lekin stock negative ho jaayega. Jaldi
              stock mangvao.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Cart / Item Entry */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Customer Info */}
            <Card className="shadow-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-sm">
                    Customer Name
                    {paymentMode === "credit" && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  <Input
                    data-ocid="billing.customer_name.input"
                    placeholder="e.g. Ramesh Kumar"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">
                    Mobile Number
                    {(paymentMode === "credit" || computedDue > 0) && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                    {(paymentMode === "credit" || computedDue > 0) && (
                      <span className="text-[10px] text-amber-600 ml-2 font-normal">
                        Udhaar ke liye zaroori
                      </span>
                    )}
                  </Label>
                  <Input
                    data-ocid="billing.customer_mobile.input"
                    placeholder="10-digit mobile"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    maxLength={10}
                    className={
                      (paymentMode === "credit" || computedDue > 0) &&
                      !customerMobile.trim()
                        ? "border-amber-400 focus-visible:ring-amber-400"
                        : ""
                    }
                  />
                  {(paymentMode === "credit" || computedDue > 0) &&
                    !customerMobile.trim() && (
                      <p className="text-[11px] text-amber-600 flex items-center gap-1 mt-0.5">
                        ⚠️ Credit sale mein mobile number required hai
                      </p>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Add Items */}
            <Card className="shadow-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Add Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Select
                    value={selectedProductId}
                    onValueChange={(v) => {
                      setSelectedProductId(v);
                      setSelectedBatchId("");
                    }}
                  >
                    <SelectTrigger
                      data-ocid="billing.product.select"
                      className="flex-1"
                    >
                      <SelectValue placeholder="Search & select product..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => {
                        const stock = getProductStock(p.id);
                        const isZero = stock <= 0;
                        return (
                          <SelectItem key={p.id} value={p.id}>
                            <span className={isZero ? "text-orange-500" : ""}>
                              {isZero ? "⚠️ " : ""}
                              {p.name} — Stock: {stock} {p.unit} @{" "}
                              {fmt(p.sellingPrice)}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <Input
                    data-ocid="billing.qty.input"
                    type="number"
                    placeholder="Qty"
                    value={addQty}
                    onChange={(e) => setAddQty(e.target.value)}
                    className="w-20"
                  />
                  <Button
                    data-ocid="billing.add_item.button"
                    onClick={handleAddToCart}
                    size="sm"
                  >
                    <Plus size={16} />
                  </Button>
                </div>

                {/* Manual Batch Mode Toggle */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="manual-batch"
                    data-ocid="billing.manual_batch_mode.checkbox"
                    checked={manualBatchMode}
                    onCheckedChange={(v) => {
                      setManualBatchMode(!!v);
                      setSelectedBatchId("");
                    }}
                  />
                  <label
                    htmlFor="manual-batch"
                    className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"
                  >
                    <Layers size={14} /> Select Batch Manually (Option B)
                  </label>
                </div>

                {/* Batch Selector — shown when manual mode is ON and product is selected */}
                {manualBatchMode &&
                  selectedProductId &&
                  (() => {
                    const availableBatches = getProductBatches(
                      selectedProductId,
                    ).sort(
                      (a, b) =>
                        new Date(a.dateAdded).getTime() -
                        new Date(b.dateAdded).getTime(),
                    );
                    const selectedProduct = products.find(
                      (p) => p.id === selectedProductId,
                    );
                    if (availableBatches.length === 0) return null;
                    return (
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Layers size={12} /> Select Batch
                        </Label>
                        <Select
                          value={selectedBatchId}
                          onValueChange={setSelectedBatchId}
                        >
                          <SelectTrigger
                            data-ocid="billing.batch.select"
                            className="w-full text-xs"
                          >
                            <SelectValue placeholder="Choose a batch..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableBatches.map((b, bi) => (
                              <SelectItem key={b.id} value={b.id}>
                                <span className="font-mono text-xs">
                                  B
                                  {String(b.batchNumber ?? bi + 1).padStart(
                                    3,
                                    "0",
                                  )}
                                </span>
                                {" — "}
                                {b.quantity} {selectedProduct?.unit ?? ""} @ ₹
                                {b.purchaseRate.toLocaleString("en-IN")}
                                {" | "}
                                {new Date(b.dateAdded).toLocaleDateString(
                                  "en-IN",
                                )}
                                {bi === 0 ? " ★ FIFO" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })()}

                {/* Cart Table */}
                {cart.length > 0 && (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-secondary/50">
                          <TableHead className="text-xs">Item</TableHead>
                          <TableHead className="text-xs">Qty</TableHead>
                          <TableHead className="text-xs">
                            Rate (&#8377;)
                          </TableHead>
                          <TableHead className="text-xs">Amount</TableHead>
                          <TableHead className="text-xs" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cart.map((item, idx) => {
                          const available = item.selectedBatchId
                            ? (getProductBatches(item.productId).find(
                                (b) => b.id === item.selectedBatchId,
                              )?.quantity ?? 0)
                            : getProductStock(item.productId);
                          const isOverSell = item.quantity > available;
                          const cartKey =
                            item.selectedBatchId ?? item.productId;
                          // Find batch number for display
                          const batchInfo = item.selectedBatchId
                            ? getProductBatches(item.productId).find(
                                (b) => b.id === item.selectedBatchId,
                              )
                            : undefined;
                          return (
                            <TableRow
                              key={cartKey}
                              data-ocid={`billing.cart.item.${idx + 1}`}
                              style={
                                isOverSell ? { backgroundColor: "#ffe5e5" } : {}
                              }
                            >
                              <TableCell className="text-sm font-medium">
                                <div className="flex flex-col gap-0.5">
                                  {item.productName}
                                  {/* Batch badge for manually selected batch */}
                                  {batchInfo && (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 border border-blue-200 rounded px-1 py-0.5 w-fit">
                                      <Layers size={9} />
                                      Batch B
                                      {String(
                                        batchInfo.batchNumber ?? idx + 1,
                                      ).padStart(3, "0")}
                                    </span>
                                  )}
                                  {isOverSell && (
                                    <span className="text-[10px] text-red-600 flex items-center gap-1 font-semibold">
                                      <AlertTriangle size={10} />
                                      Over Sell — {available} available
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button
                                    data-ocid={`billing.cart.qty_decrement.${idx + 1}`}
                                    variant="outline"
                                    size="sm"
                                    className="h-7 w-7 p-0 shrink-0"
                                    onClick={() =>
                                      handleQtyDecrement(
                                        item.productId,
                                        item.selectedBatchId,
                                      )
                                    }
                                  >
                                    <Minus size={12} />
                                  </Button>
                                  <Input
                                    type="number"
                                    value={
                                      qtyInputs[cartKey] ??
                                      String(item.quantity)
                                    }
                                    onChange={(e) =>
                                      handleQtyInputChange(
                                        item.productId,
                                        e.target.value,
                                        item.selectedBatchId,
                                      )
                                    }
                                    className={`w-14 h-7 text-sm text-center ${isOverSell ? "border-red-500" : ""}`}
                                  />
                                  <Button
                                    data-ocid={`billing.cart.qty_increment.${idx + 1}`}
                                    variant="outline"
                                    size="sm"
                                    className="h-7 w-7 p-0 shrink-0"
                                    onClick={() =>
                                      handleQtyIncrement(
                                        item.productId,
                                        item.selectedBatchId,
                                      )
                                    }
                                  >
                                    <Plus size={12} />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                {(() => {
                                  const prod = products.find(
                                    (p) => p.id === item.productId,
                                  );
                                  const bp =
                                    item.basePrice ??
                                    prod?.sellingPrice ??
                                    item.sellingRate;
                                  const discPct = getDiscountPct(
                                    bp,
                                    item.sellingRate,
                                  );
                                  const exProfit = calcExtraProfit(
                                    bp,
                                    item.sellingRate,
                                    item.quantity,
                                  );
                                  const sBonus = calcStaffBonus(exProfit);
                                  const errMsg = itemErrors[item.productId];
                                  // Cost / Min / Sell price info — only for owner/manager
                                  const costP = canViewCost
                                    ? getProductCostPrice(item.productId)
                                    : 0;
                                  const minProfitPct = prod?.minProfitPct ?? 0;
                                  const minSellP =
                                    canViewCost && costP > 0 && minProfitPct > 0
                                      ? getMinPrice(costP, minProfitPct)
                                      : null;
                                  const isBelowMin =
                                    minSellP !== null &&
                                    item.sellingRate < minSellP;
                                  return (
                                    <div className="flex flex-col gap-0.5">
                                      <Input
                                        type="number"
                                        value={item.sellingRate}
                                        onChange={(e) =>
                                          handleRateChange(
                                            item.productId,
                                            Number(e.target.value),
                                          )
                                        }
                                        className={`w-24 h-7 text-sm ${errMsg || isBelowMin ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                                      />
                                      {/* Cost / Min / Sell labels — hidden for staff */}
                                      {canViewCost && costP > 0 && (
                                        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 text-[10px] leading-tight">
                                          <span className="text-muted-foreground">
                                            Lagat: ₹
                                            {Math.round(costP).toLocaleString(
                                              "en-IN",
                                            )}
                                          </span>
                                          {minSellP !== null && (
                                            <span className="text-amber-600">
                                              Min: ₹
                                              {Math.round(
                                                minSellP,
                                              ).toLocaleString("en-IN")}
                                            </span>
                                          )}
                                          <span
                                            className={
                                              isBelowMin
                                                ? "text-red-600 font-semibold"
                                                : "text-muted-foreground"
                                            }
                                          >
                                            Sell: ₹
                                            {Math.round(
                                              item.sellingRate,
                                            ).toLocaleString("en-IN")}
                                            {isBelowMin && " ⬇"}
                                          </span>
                                        </div>
                                      )}
                                      <span className="text-[10px] text-muted-foreground">
                                        Base: ₹{bp.toLocaleString("en-IN")}
                                      </span>
                                      {discPct > 0 && !errMsg && (
                                        <span className="text-[10px] text-amber-600 font-medium">
                                          Discount: {discPct.toFixed(1)}%
                                        </span>
                                      )}
                                      {/* Extra profit / staff bonus — hidden for staff role */}
                                      {canViewCost && exProfit > 0 && (
                                        <span className="text-[10px] text-green-600 font-medium">
                                          +₹{exProfit.toFixed(0)} | 🎁 ₹
                                          {sBonus.toFixed(0)}
                                        </span>
                                      )}
                                      {errMsg && (
                                        <span className="text-[10px] text-red-600 font-semibold leading-tight max-w-[140px]">
                                          {errMsg}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })()}
                              </TableCell>
                              <TableCell className="text-sm font-semibold">
                                {fmt(item.quantity * item.sellingRate)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  data-ocid={`billing.cart.delete_button.${idx + 1}`}
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive h-7 w-7 p-0"
                                  onClick={() =>
                                    handleRemoveItem(
                                      item.productId,
                                      item.selectedBatchId,
                                    )
                                  }
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {cart.length === 0 && (
                  <div
                    data-ocid="billing.cart.empty_state"
                    className="text-center py-8 text-muted-foreground text-sm"
                  >
                    <Receipt className="mx-auto mb-2" size={24} />
                    Add items to start billing
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div className="flex flex-col gap-4">
            <Card className="shadow-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items</span>
                    <span>{cart.length}</span>
                  </div>
                  {hasOverSell && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-300 text-xs text-red-700">
                      <AlertTriangle size={14} className="shrink-0" />
                      {overSellItems.length} item(s) mein Over Sell hai
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-brand-blue">{fmt(total)}</span>
                  </div>
                </div>

                {/* Payment Mode Selector */}
                <div className="space-y-1.5">
                  <Label className="text-sm">Payment Mode</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["cash", "upi", "online", "credit"] as PaymentMode[]).map(
                      (mode) => (
                        <button
                          key={mode}
                          type="button"
                          data-ocid={`billing.payment_mode_${mode}.toggle`}
                          onClick={() => handlePaymentModeChange(mode)}
                          className={`px-3 py-2 rounded-lg border-2 text-xs font-semibold capitalize transition-all ${
                            paymentMode === mode
                              ? paymentModeColors[mode]
                              : "bg-background border-border text-muted-foreground hover:border-primary/40"
                          }`}
                        >
                          {mode === "cash" && "💵 Cash"}
                          {mode === "upi" && "📱 UPI"}
                          {mode === "online" && "💻 Online"}
                          {mode === "credit" && "📝 Credit"}
                        </button>
                      ),
                    )}
                  </div>
                  {paymentMode === "credit" && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ Credit sale: Paid = ₹0, Due = Total. Customer name
                      required.
                    </p>
                  )}
                </div>

                {/* Partial Payment toggle (for non-credit) */}
                {paymentMode !== "credit" && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="partial-payment"
                      data-ocid="billing.partial_payment.checkbox"
                      checked={isPartial}
                      onCheckedChange={(v) => {
                        setIsPartial(!!v);
                        if (!v) setPaidAmountStr("");
                      }}
                    />
                    <label
                      htmlFor="partial-payment"
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      Partial Payment
                    </label>
                  </div>
                )}

                {/* Amount Paid input — shown only for partial */}
                {isPartial && paymentMode !== "credit" && (
                  <div className="space-y-1.5">
                    <Label className="text-sm">Amount Paid (&#8377;)</Label>
                    <Input
                      data-ocid="billing.paid_amount.input"
                      type="number"
                      placeholder="Enter amount received"
                      value={paidAmountStr}
                      onChange={(e) => setPaidAmountStr(e.target.value)}
                    />
                  </div>
                )}

                {/* Paid / Due summary */}
                <div className="rounded-lg bg-secondary/50 p-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="font-semibold text-green-600">
                      {fmt(computedPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Due</span>
                    <span
                      className={`font-semibold ${
                        computedDue > 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {fmt(computedDue)}
                    </span>
                  </div>
                </div>

                {/* Smart Pricing Summary — hidden for staff role */}
                {canViewCost &&
                  cart.length > 0 &&
                  (() => {
                    const basePriceTotal = cart.reduce((s, item) => {
                      const prod = products.find(
                        (p) => p.id === item.productId,
                      );
                      const bp =
                        item.basePrice ??
                        prod?.sellingPrice ??
                        item.sellingRate;
                      return s + bp * item.quantity;
                    }, 0);
                    const extraProfitTotal = cart.reduce((s, item) => {
                      const prod = products.find(
                        (p) => p.id === item.productId,
                      );
                      const bp =
                        item.basePrice ??
                        prod?.sellingPrice ??
                        item.sellingRate;
                      return (
                        s + calcExtraProfit(bp, item.sellingRate, item.quantity)
                      );
                    }, 0);
                    const staffBonusTotal = calcStaffBonus(extraProfitTotal);
                    const hasErrors = Object.keys(itemErrors).length > 0;
                    return (
                      <div
                        className={`rounded-lg p-3 space-y-1.5 text-sm border ${hasErrors ? "bg-red-50 border-red-200" : "bg-emerald-50/50 border-emerald-200"}`}
                      >
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                          Smart Pricing
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            Base Price Total
                          </span>
                          <span className="font-medium">
                            ₹{basePriceTotal.toLocaleString("en-IN")}
                          </span>
                        </div>
                        {extraProfitTotal > 0 && (
                          <>
                            <div className="flex justify-between text-xs">
                              <span className="text-green-700 font-medium">
                                Extra Profit
                              </span>
                              <span className="font-semibold text-green-700">
                                +₹{extraProfitTotal.toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-green-600">
                                Staff Bonus
                              </span>
                              <span className="font-semibold text-green-600">
                                ₹{staffBonusTotal.toLocaleString("en-IN")}{" "}
                                <span className="text-[10px] font-normal">
                                  (Staff ko milega)
                                </span>
                              </span>
                            </div>
                          </>
                        )}
                        {hasErrors && (
                          <div className="flex items-center gap-1 text-red-600 text-[11px] pt-0.5">
                            <AlertTriangle size={11} />
                            Pricing errors hain — fix karein
                          </div>
                        )}
                      </div>
                    );
                  })()}

                <Button
                  data-ocid="billing.generate_invoice.button"
                  className="w-full"
                  onClick={handleGenerateInvoice}
                  disabled={
                    cart.length === 0 || Object.keys(itemErrors).length > 0
                  }
                >
                  <Receipt size={16} className="mr-2" /> Generate Invoice
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Invoice Dialog */}
      {generatedInvoice && (
        <InvoiceDialog
          invoice={generatedInvoice}
          open={showInvoice}
          onClose={() => setShowInvoice(false)}
        />
      )}

      {/* Low Price Alert Modal */}
      {showLowPriceModal && pendingInvoiceData && (
        <LowPriceAlertModal
          items={pendingLowPriceItems}
          isLockMode={!(appConfig.allowLowPriceSelling ?? true)}
          ownerPin={appConfig.ownerPin ?? ""}
          userRole={userRole}
          onContinue={handleLowPriceModalContinue}
          onCancel={handleLowPriceModalCancel}
        />
      )}
    </div>
  );
}

function InvoiceDialog({
  invoice,
  open,
  onClose,
}: {
  invoice: Invoice;
  open: boolean;
  onClose: () => void;
}) {
  const hasOverSellItems = invoice.items.some((item) => item.isOverSell);
  const due = invoice.dueAmount ?? invoice.totalAmount - invoice.paidAmount;

  const handleWhatsApp = () => {
    const itemLines = invoice.items.map(
      (item) =>
        `• ${item.productName}: ${item.quantity} x ₹${item.sellingRate} = ₹${item.quantity * item.sellingRate}${
          item.isOverSell ? " [OVER SELL]" : ""
        }`,
    );
    const balance = due > 0 ? `Balance Due: ₹${due}` : "✅ Fully Paid";
    const lines = [
      "*Save Shop System*",
      `Invoice: ${invoice.invoiceNumber}`,
      `Date: ${new Date(invoice.date).toLocaleDateString("en-IN")}`,
      `Customer: ${invoice.customerName}${
        invoice.customerMobile ? ` (${invoice.customerMobile})` : ""
      }`,
      "",
      "*Items:*",
      ...itemLines,
      "",
      `*Total: ₹${invoice.totalAmount}*`,
      `Paid: ₹${invoice.paidAmount} (${invoice.paymentMode.toUpperCase()})`,
      balance,
      "",
      "Thank you for shopping with us!",
    ];
    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handlePrint = () => window.print();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        data-ocid="billing.invoice.dialog"
        className="max-w-md max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt size={18} className="text-primary" />
            Invoice Generated
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header */}
          <div className="bg-primary/5 rounded-lg p-4 text-center">
            <div className="font-bold text-lg">Save Shop System</div>
            <div className="text-muted-foreground text-sm">
              Invoice #{invoice.invoiceNumber}
            </div>
            <div className="text-muted-foreground text-xs">
              {new Date(invoice.date).toLocaleString("en-IN")}
            </div>
          </div>

          {/* Over Sell Warning in Invoice */}
          {hasOverSellItems && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border-2 border-red-400">
              <AlertTriangle
                size={16}
                className="text-red-600 shrink-0 mt-0.5"
              />
              <div>
                <div className="text-sm font-semibold text-red-700">
                  Over Sell Warning
                </div>
                <div className="text-xs text-red-600 mt-0.5">
                  Kuch items ka stock available se zyada bika hai. Stock
                  replenish karein.
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Customer: </span>
              <span className="font-medium">{invoice.customerName}</span>
            </div>
            {invoice.customerMobile && (
              <div>
                <span className="text-muted-foreground">Mobile: </span>
                <span>{invoice.customerMobile}</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Payment: </span>
              <Badge variant="outline" className="text-xs capitalize">
                {invoice.paymentMode}
              </Badge>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead className="text-xs">Item</TableHead>
                <TableHead className="text-xs text-right">Qty</TableHead>
                <TableHead className="text-xs text-right">Rate</TableHead>
                <TableHead className="text-xs text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow
                  key={item.productId}
                  style={item.isOverSell ? { backgroundColor: "#ffe5e5" } : {}}
                >
                  <TableCell className="text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span>{item.productName}</span>
                      {item.isOverSell && (
                        <Badge className="w-fit bg-red-600 text-white border-0 text-[9px] uppercase px-1 py-0">
                          Over Sell Item
                        </Badge>
                      )}
                      {item.isOverSell &&
                        item.availableStockAtSale !== undefined && (
                          <span className="text-[10px] text-red-600">
                            Available: {item.availableStockAtSale} | Sold:{" "}
                            {item.quantity} | Extra:{" "}
                            {item.quantity - item.availableStockAtSale}
                          </span>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    &#8377;{item.sellingRate}
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold">
                    &#8377;{item.quantity * item.sellingRate}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="border-t border-border pt-3 space-y-1.5">
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>&#8377;{invoice.totalAmount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Paid</span>
              <span className="text-green-600 font-medium">
                &#8377;{invoice.paidAmount}
              </span>
            </div>
            {due > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Balance Due</span>
                <span className="text-red-600 font-bold">&#8377;{due}</span>
              </div>
            )}
            {due === 0 && (
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <span>✅ Fully Paid</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              data-ocid="billing.invoice.whatsapp.button"
              variant="outline"
              className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
              onClick={handleWhatsApp}
            >
              <MessageCircle size={16} className="mr-2" /> Share on WhatsApp
            </Button>
            <Button
              data-ocid="billing.invoice.print.button"
              variant="outline"
              className="flex-1"
              onClick={handlePrint}
            >
              <Printer size={16} className="mr-2" /> Print
            </Button>
          </div>

          <Button
            data-ocid="billing.invoice.close.button"
            className="w-full"
            onClick={onClose}
          >
            Close &amp; New Sale
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
