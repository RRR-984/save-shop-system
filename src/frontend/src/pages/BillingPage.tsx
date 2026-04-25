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
  FileText,
  Layers,
  Lock,
  Minus,
  PenLine,
  Plus,
  Receipt,
  ShieldAlert,
  Trash2,
  Truck,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { InvoiceShareModal } from "../components/InvoiceShareModal";
import { QRScannerToggle } from "../components/QRScannerToggle";
import { VoiceInputButton } from "../components/VoiceInputButton";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useStore } from "../context/StoreContext";
import type {
  CartDraftItem,
  Customer,
  DraftSale,
  Invoice,
  InvoiceItem,
} from "../types/store";
import { ROLE_PERMISSIONS } from "../types/store";
import {
  ACTIVITY_COLORS,
  ACTIVITY_LABELS,
  TIER_COLORS,
  TIER_EMOJI,
  TIER_LABELS,
  getActivityStatus,
  getCustomerTier,
} from "../utils/customerTracking";
import {
  checkAndRegisterKey,
  generateIdempotencyKey,
} from "../utils/idempotency";
import { clearLeadingZeros } from "../utils/numberInput";
import type { ParsedVoiceCommand } from "../utils/voiceParser";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

type PaymentMode = "cash" | "upi" | "online" | "credit";
type CustomerType = "regular" | "retailer" | "wholesaler";
type PriceMode = "standard" | "retailer" | "wholesaler";

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  sellingRate: number;
  unit: string;
  selectedBatchId?: string;
  basePrice: number;
  /** Actual purchase/batch cost per unit — used for correct profit display in cart */
  costPrice?: number;
  priceMode?: PriceMode;
}

const AUTO_DRAFT_KEY = "billing_auto_draft";
const RESUME_DRAFT_KEY = "billing_resume_draft";

interface AutoDraft {
  customerName: string;
  customerMobile: string;
  customerAddress?: string;
  cartItems: CartItem[];
  savedAt: string;
  chargesEnabled?: boolean;
  transportEnabled?: boolean;
  transportAmt?: number;
  labourEnabled?: boolean;
  labourAmt?: number;
  otherEnabled?: boolean;
  otherAmt?: number;
  gstEnabled?: boolean;
  gstRate?: number;
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

/** Returns the price for a given mode; falls back to standard if mode price not set */
function getPriceForMode(
  product: {
    sellingPrice: number;
    retailerPrice?: number;
    wholesalerPrice?: number;
  },
  mode: PriceMode,
): number {
  if (mode === "retailer" && product.retailerPrice && product.retailerPrice > 0)
    return product.retailerPrice;
  if (
    mode === "wholesaler" &&
    product.wholesalerPrice &&
    product.wholesalerPrice > 0
  )
    return product.wholesalerPrice;
  return product.sellingPrice;
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
        setPinError(`${MAX_ATTEMPTS} incorrect PIN attempts — sale blocked`);
        setTimeout(() => onCancel(), 1500);
      } else {
        setPinError(
          `Incorrect PIN — ${MAX_ATTEMPTS - next} attempts remaining`,
        );
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
            The following items are being sold below the minimum profit price:
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
                    <span className="text-muted-foreground">Cost</span>
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
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-300">
                <AlertTriangle
                  size={16}
                  className="text-amber-600 mt-0.5 flex-shrink-0"
                />
                <p className="text-xs text-amber-700">
                  <strong>Warning Mode:</strong> Sale is allowed but you are
                  selling below the minimum profit price. Do you want to
                  continue?
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
                  Continue Sale
                </Button>
              </div>
            </div>
          ) : isOwner ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-300">
                <Lock size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-700">
                  <strong>Lock Mode:</strong> Sale is blocked. Enter Owner PIN
                  to override.
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
                    placeholder="Enter PIN (4-6 digits)"
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
                    💡 Please set an Owner PIN in Settings first
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
                    Only the Owner can approve low price sales. Please ask your
                    Owner to enter their PIN or log in.
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

// ─── New Sale Confirmation Dialog ─────────────────────────────────────────────

function NewSaleConfirmDialog({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt size={18} /> Start New Sale?
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Start a new sale? Your current items will be saved as a draft.
        </p>
        <div className="flex gap-2 mt-2">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Go Back
          </Button>
          <Button
            data-ocid="billing.new_sale_confirm.button"
            className="flex-1"
            onClick={onConfirm}
          >
            Save & Start New
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const PENDING_CASH_KEY = "pending_cash_invoice";

export function BillingPage({
  onNavigate,
}: {
  onNavigate?: (page: import("../types/store").NavPage) => void;
}) {
  const {
    products,
    getProductStock,
    calculateFIFOCost,
    createInvoice,
    getProductBatches,
    getProductCostPrice,
    appConfig,
    autoMode,
    addLowPriceAlertLog,
    addAuditLog,
    saveDraft,
    deleteDraft,
    markDraftCompleted,
    customers,
    updateCustomer,
    addCustomer,
    shopId,
  } = useStore();
  const { currentUser } = useAuth();
  const { t, language } = useLanguage();
  const userRole = currentUser?.role ?? "staff";
  const canViewCost = ROLE_PERMISSIONS.canViewCostPrice(userRole);

  // ── Pro Mode + Customer Tracking feature gate ─────────────────────────────
  const isProMode = autoMode === "pro";
  const customerTrackingEnabled =
    isProMode && (appConfig.featureFlags?.customerTracking ?? false);

  // ── Draft / Edit state ────────────────────────────────────────────────────
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [autoDraftActive, setAutoDraftActive] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const lastSavedAtRef = useRef<Date | null>(null);

  // ── QR/Barcode scanner qty input ref (for focus after scan) ─────────────
  const qtyInputRef = useRef<HTMLInputElement | null>(null);

  // ── Async payment loading state ──────────────────────────────────────────
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerType, setCustomerType] = useState<CustomerType>("regular");
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
  const [showNewSaleConfirm, setShowNewSaleConfirm] = useState(false);

  // ── Extra Charges state ───────────────────────────────────────────────────
  const [chargesEnabled, setChargesEnabled] = useState(false);
  const [transportEnabled, setTransportEnabled] = useState(false);
  const [transportAmt, setTransportAmt] = useState("");
  const [labourEnabled, setLabourEnabled] = useState(false);
  const [labourAmt, setLabourAmt] = useState("");
  const [otherEnabled, setOtherEnabled] = useState(false);
  const [otherAmt, setOtherAmt] = useState("");
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstRate, setGstRate] = useState(18);

  // ── Customer Tracking state (Pro mode only) ───────────────────────────────
  const [linkedCustomerId, setLinkedCustomerId] = useState<string | null>(null);
  const [mobileSuggestions, setMobileSuggestions] = useState<Customer[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);

  // Low Price Alert Modal state
  const [showLowPriceModal, setShowLowPriceModal] = useState(false);
  const [pendingLowPriceItems, setPendingLowPriceItems] = useState<
    LowPriceItem[]
  >([]);
  const [pendingInvoiceData, setPendingInvoiceData] = useState<Omit<
    Invoice,
    "id" | "invoiceNumber"
  > | null>(null);
  const [pendingInvoiceItems, setPendingInvoiceItems] = useState<InvoiceItem[]>(
    [],
  );

  // ── On mount: restore from resume_draft or auto_draft ────────────────────
  useEffect(() => {
    try {
      // Priority 1: explicit resume (from DraftSalesPage)
      const resumeRaw = sessionStorage.getItem(RESUME_DRAFT_KEY);
      if (resumeRaw) {
        const draft = JSON.parse(resumeRaw) as DraftSale;
        sessionStorage.removeItem(RESUME_DRAFT_KEY);
        restoreFromDraft(draft);
        setEditingDraftId(draft.draftId);
        toast.info(`Editing draft for "${draft.customerName || "Walk-in"}"`, {
          description: `${draft.cartItems.length} item(s) loaded`,
        });
        return;
      }

      // Priority 2: auto-draft (navigated away mid-billing)
      const autoRaw = sessionStorage.getItem(AUTO_DRAFT_KEY);
      if (autoRaw) {
        const auto = JSON.parse(autoRaw) as AutoDraft;
        // Only restore if cart has items — avoid restoring empty drafts
        if (auto.cartItems && auto.cartItems.length > 0) {
          setCustomerName(auto.customerName);
          setCustomerMobile(auto.customerMobile);
          if (auto.customerAddress) setCustomerAddress(auto.customerAddress);
          setCart(auto.cartItems);
          const inputs: Record<string, string> = {};
          for (const item of auto.cartItems) {
            inputs[item.selectedBatchId ?? item.productId] = String(
              item.quantity,
            );
          }
          setQtyInputs(inputs);
          // Restore charges
          if (auto.chargesEnabled) {
            setChargesEnabled(true);
            setTransportEnabled(!!auto.transportEnabled);
            setTransportAmt(auto.transportAmt ? String(auto.transportAmt) : "");
            setLabourEnabled(!!auto.labourEnabled);
            setLabourAmt(auto.labourAmt ? String(auto.labourAmt) : "");
            setOtherEnabled(!!auto.otherEnabled);
            setOtherAmt(auto.otherAmt ? String(auto.otherAmt) : "");
            setGstEnabled(!!auto.gstEnabled);
            if (auto.gstRate) setGstRate(auto.gstRate);
          }
          setAutoDraftActive(true);
          toast.info("Previous sale restored — continue or discard", {
            description: `${auto.cartItems.length} item(s) from ${new Date(auto.savedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`,
          });
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  // ── Auto-save draft every 30s while billing has data ─────────────────────
  useEffect(() => {
    if (cart.length === 0 && !customerName && !customerMobile) return;
    const interval = setInterval(() => {
      if (cart.length === 0) return;
      try {
        const autoDraft: AutoDraft = {
          customerName,
          customerMobile,
          customerAddress: customerAddress || undefined,
          cartItems: cart,
          savedAt: new Date().toISOString(),
          chargesEnabled,
          transportEnabled,
          transportAmt: Number(transportAmt) || 0,
          labourEnabled,
          labourAmt: Number(labourAmt) || 0,
          otherEnabled,
          otherAmt: Number(otherAmt) || 0,
          gstEnabled,
          gstRate,
        };
        sessionStorage.setItem(AUTO_DRAFT_KEY, JSON.stringify(autoDraft));
        const now = new Date();
        lastSavedAtRef.current = now;
        setLastSavedAt(now);
        toast.info("Draft auto-saved", { duration: 1500 });
      } catch {
        /* ignore */
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [
    cart,
    customerName,
    customerMobile,
    customerAddress,
    chargesEnabled,
    transportEnabled,
    transportAmt,
    labourEnabled,
    labourAmt,
    otherEnabled,
    otherAmt,
    gstEnabled,
    gstRate,
  ]);

  function restoreFromDraft(draft: DraftSale) {
    setCustomerName(draft.customerName);
    setCustomerMobile(draft.customerMobile);
    const cartItems: CartItem[] = draft.cartItems.map((ci) => ({
      productId: ci.productId,
      productName: ci.productName,
      quantity: ci.quantity,
      sellingRate: ci.sellingRate,
      unit: ci.unit,
      selectedBatchId: ci.batchId,
      basePrice: ci.sellingRate,
    }));
    setCart(cartItems);
    const inputs: Record<string, string> = {};
    for (const item of cartItems) {
      inputs[item.selectedBatchId ?? item.productId] = String(item.quantity);
    }
    setQtyInputs(inputs);
  }

  // ── Save auto-draft when navigating away ─────────────────────────────────
  function saveAutoDraft() {
    if (cart.length === 0) return;
    try {
      const autoDraft: AutoDraft = {
        customerName,
        customerMobile,
        customerAddress: customerAddress || undefined,
        cartItems: cart,
        savedAt: new Date().toISOString(),
        chargesEnabled,
        transportEnabled,
        transportAmt: Number(transportAmt) || 0,
        labourEnabled,
        labourAmt: Number(labourAmt) || 0,
        otherEnabled,
        otherAmt: Number(otherAmt) || 0,
      };
      sessionStorage.setItem(AUTO_DRAFT_KEY, JSON.stringify(autoDraft));
    } catch {
      /* ignore */
    }
  }

  // ── Build DraftSale from current form state ───────────────────────────────
  function buildDraftSale(draftId: string): DraftSale {
    const now = new Date().toISOString();
    const cartDraftItems: CartDraftItem[] = cart.map((item) => {
      const costP = getProductCostPrice(item.productId);
      const profit = (item.sellingRate - costP) * item.quantity;
      const profitPercent =
        costP > 0 ? ((item.sellingRate - costP) / costP) * 100 : 0;
      return {
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        sellingRate: item.sellingRate,
        purchaseCost: costP,
        unit: item.unit,
        batchId: item.selectedBatchId,
        batchNumber: item.selectedBatchId
          ? `B${String(
              getProductBatches(item.productId).findIndex(
                (b) => b.id === item.selectedBatchId,
              ) + 1,
            ).padStart(3, "0")}`
          : undefined,
        profit,
        profitPercent,
      };
    });

    return {
      draftId,
      customerName,
      customerMobile,
      cartItems: cartDraftItems,
      createdAt: now,
      updatedAt: now,
      totalAmount: total,
      status: "draft",
    };
  }

  // ── Handle Save Draft button ──────────────────────────────────────────────
  function handleSaveDraft() {
    if (cart.length === 0 && !customerName.trim()) {
      toast.error("Add items or a customer name before saving a draft");
      return;
    }
    const draftId =
      editingDraftId ??
      `draft_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const draft = buildDraftSale(draftId);
    saveDraft(draft);
    if (!editingDraftId) setEditingDraftId(draftId);
    // Clear auto-draft since we've explicitly saved
    sessionStorage.removeItem(AUTO_DRAFT_KEY);
    setAutoDraftActive(false);
    toast.success("Draft saved ✓", {
      description: `${cart.length} item(s) — ${customerName.trim() || "Walk-in"}`,
    });
  }

  // ── Handle Discard ────────────────────────────────────────────────────────
  function handleDiscard() {
    if (editingDraftId) {
      deleteDraft(editingDraftId);
      sessionStorage.removeItem(RESUME_DRAFT_KEY);
      toast.info("Draft discarded");
    } else {
      sessionStorage.removeItem(AUTO_DRAFT_KEY);
      toast.info("Sale discarded");
    }
    clearForm();
  }

  function clearForm() {
    setCustomerName("");
    setCustomerMobile("");
    setCustomerAddress("");
    setCustomerType("regular");
    setCart([]);
    setQtyInputs({});
    setItemErrors({});
    setPaidAmountStr("");
    setIsPartial(false);
    setPaymentMode("cash");
    setManualBatchMode(false);
    setSelectedBatchId("");
    setSelectedProductId("");
    setAddQty("1");
    setEditingDraftId(null);
    setAutoDraftActive(false);
    // Reset charges
    setChargesEnabled(false);
    setTransportEnabled(false);
    setTransportAmt("");
    setLabourEnabled(false);
    setLabourAmt("");
    setOtherEnabled(false);
    setOtherAmt("");
    // Reset customer tracking
    setLinkedCustomerId(null);
    setMobileSuggestions([]);
    setShowSuggestions(false);
  }

  // ── Customer Tracking: mobile input change with suggestions ─────────────
  function handleMobileInputChange(value: string) {
    setCustomerMobile(value);
    setLinkedCustomerId(null); // clear link when user edits the number
    if (!customerTrackingEnabled) return;
    const trimmed = value.trim().replace(/\D/g, "");
    if (trimmed.length >= 3) {
      const matches = customers
        .filter((c) => c.mobile.replace(/\D/g, "").includes(trimmed))
        .slice(0, 5);
      setMobileSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setMobileSuggestions([]);
      setShowSuggestions(false);
    }
  }

  function handleSelectCustomerSuggestion(customer: Customer) {
    setCustomerMobile(customer.mobile);
    setCustomerName(customer.name || customerName);
    if (customer.address) setCustomerAddress(customer.address);
    setLinkedCustomerId(customer.id);
    setMobileSuggestions([]);
    setShowSuggestions(false);
  }

  /** Update or create customer record after a sale completes */
  function updateCustomerAfterSale(
    mobile: string,
    name: string,
    address: string | undefined,
    saleAmount: number,
    dueAmount: number,
  ) {
    if (!customerTrackingEnabled || !mobile.trim()) return;
    const normMob = mobile.trim().replace(/\D/g, "");
    const existing = customers.find(
      (c) => c.mobile.replace(/\D/g, "") === normMob,
    );
    if (existing) {
      updateCustomer(existing.id, {
        lastVisit: new Date().toISOString(),
        totalPurchase: (existing.totalPurchase ?? 0) + saleAmount,
        visitCount: (existing.visitCount ?? 0) + 1,
        pendingBalance: (existing.pendingBalance ?? 0) + dueAmount,
        creditBalance: (existing.creditBalance ?? 0) + dueAmount,
        ...(name.trim() && !existing.name ? { name: name.trim() } : {}),
        ...(address?.trim() && !existing.address
          ? { address: address.trim() }
          : {}),
      });
    } else {
      addCustomer({
        name: name.trim() || "",
        mobile: mobile.trim(),
        address: address?.trim() || undefined,
        creditBalance: dueAmount,
        lastVisit: new Date().toISOString(),
        totalPurchase: saleAmount,
        visitCount: 1,
        pendingBalance: dueAmount,
      });
    }
  }

  // ── Handle New Sale button ────────────────────────────────────────────────
  function handleNewSale() {
    if (cart.length > 0) {
      setShowNewSaleConfirm(true);
    } else {
      clearForm();
    }
  }

  function handleNewSaleConfirm() {
    setShowNewSaleConfirm(false);
    // Save current as draft before clearing
    const draftId =
      editingDraftId ??
      `draft_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const draft = buildDraftSale(draftId);
    saveDraft(draft);
    sessionStorage.removeItem(AUTO_DRAFT_KEY);
    toast.success("Current items saved as draft");
    clearForm();
  }

  // Voice input handler
  const handleBillingVoiceParsed = (parsed: ParsedVoiceCommand) => {
    let applied = false;
    if (parsed.customerName !== null) {
      setCustomerName(parsed.customerName);
      applied = true;
    }
    if (parsed.itemName !== null) {
      const match = products.find(
        (p) =>
          p.name.trim().toLowerCase() === parsed.itemName!.trim().toLowerCase(),
      );
      if (match) {
        setSelectedProductId(match.id);
        setSelectedBatchId("");
        applied = true;
      }
    }
    if (parsed.quantity !== null) {
      setAddQty(String(parsed.quantity));
      applied = true;
    }
    if (applied) {
      toast.success(t("Voice input applied — please review and save"));
    }
  };

  // QR/Barcode scanner handler
  const handleProductScanned = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setSelectedProductId(productId);
    setSelectedBatchId("");
    setAddQty("1");
    toast.success(
      language === "hi"
        ? `${product.name} स्कैन हुआ — मात्रा डालें`
        : `${product.name} scanned — enter quantity`,
    );
  };

  const itemsSubtotal = cart.reduce(
    (s, item) => s + item.quantity * item.sellingRate,
    0,
  );
  const activeTransport =
    chargesEnabled && transportEnabled ? Number(transportAmt) || 0 : 0;
  const activeLabour =
    chargesEnabled && labourEnabled ? Number(labourAmt) || 0 : 0;
  const activeOther =
    chargesEnabled && otherEnabled ? Number(otherAmt) || 0 : 0;
  const totalCharges = activeTransport + activeLabour + activeOther;
  const gstAmount =
    chargesEnabled && gstEnabled
      ? Math.round((((itemsSubtotal + totalCharges) * gstRate) / 100) * 100) /
        100
      : 0;
  const activeGST = chargesEnabled && gstEnabled ? gstAmount : 0;
  // CGST / SGST split (each half of the total GST)
  const cgstRate = gstRate / 2;
  const sgstRate = gstRate / 2;
  const cgstAmount = Math.round((activeGST / 2) * 100) / 100;
  const sgstAmount = Math.round((activeGST / 2) * 100) / 100;
  const total = itemsSubtotal + totalCharges + activeGST;

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
          `⚠️ Over Sell: Only ${available} ${product.unit} available in stock`,
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
      const initialMode: PriceMode =
        customerType === "retailer" &&
        product.retailerPrice &&
        product.retailerPrice > 0
          ? "retailer"
          : customerType === "wholesaler" &&
              product.wholesalerPrice &&
              product.wholesalerPrice > 0
            ? "wholesaler"
            : "standard";
      const initialRate = getPriceForMode(product, initialMode);
      // Determine cost price: prefer the selected batch's purchaseRate in manual mode,
      // otherwise fall back to the latest batch cost via getProductCostPrice.
      let itemCostPrice: number;
      if (manualBatchMode && selectedBatchId) {
        const batch = getProductBatches(selectedProductId).find(
          (b) => b.id === selectedBatchId,
        );
        itemCostPrice = batch
          ? batch.finalPurchaseCost != null && batch.quantity > 0
            ? batch.finalPurchaseCost / batch.quantity
            : batch.purchaseRate
          : getProductCostPrice(selectedProductId);
      } else {
        itemCostPrice = getProductCostPrice(selectedProductId);
      }
      setCart((prev) => [
        ...prev,
        {
          productId: selectedProductId,
          productName: product.name,
          quantity: qty,
          sellingRate: initialRate,
          unit: product.unit,
          basePrice: product.sellingPrice,
          costPrice: itemCostPrice,
          priceMode: initialMode,
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
        toast.warning(`⚠️ Batch stock is only ${batch.quantity} ${item.unit}`);
      }
    } else {
      const available = getProductStock(productId);
      if (newQty > available) {
        toast.warning(`⚠️ Over Sell: Only ${available} ${item.unit} available`);
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

  /** Change price mode for a single cart item */
  const handleItemPriceModeChange = (
    productId: string,
    batchId: string | undefined,
    mode: PriceMode,
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const newRate = getPriceForMode(product, mode);
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId &&
        (i.selectedBatchId ?? "") === (batchId ?? "")
          ? { ...i, priceMode: mode, sellingRate: newRate }
          : i,
      ),
    );
    // Clear any pricing error for this item since mode auto-sets a valid price
    setItemErrors((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  /** Apply a customer type to ALL cart items, changing price mode where applicable */
  const applyCustomerTypeToCart = (type: CustomerType) => {
    setCart((prev) =>
      prev.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return item;
        const mode: PriceMode =
          type === "retailer" &&
          product.retailerPrice &&
          product.retailerPrice > 0
            ? "retailer"
            : type === "wholesaler" &&
                product.wholesalerPrice &&
                product.wholesalerPrice > 0
              ? "wholesaler"
              : "standard";
        return {
          ...item,
          priceMode: mode,
          sellingRate: getPriceForMode(product, mode),
        };
      }),
    );
  };

  const handleRateChange = (productId: string, rate: number) => {
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, sellingRate: rate } : i,
      ),
    );
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const costPrice = getProductCostPrice(productId);
    const basePrice = product.sellingPrice;
    const minProfitPct = product.minProfitPct ?? 0;
    const minPrice = getMinPrice(costPrice, minProfitPct);
    const discountPct = getDiscountPct(basePrice, rate);
    let error = "";
    if (!rate || rate <= 0 || Number.isNaN(rate)) {
      error = "Invalid price — 0 or negative price is not allowed";
    } else if (costPrice > 0 && rate < minPrice) {
      error = `Minimum price ₹${minPrice.toFixed(0)} cannot be lower (Cost + Min Profit)`;
    } else if (
      userRole !== "owner" &&
      userRole !== "manager" &&
      rate < basePrice &&
      discountPct > 18
    ) {
      error = `Staff can apply a maximum 18% discount (Min rate: ₹${(basePrice * 0.82).toFixed(0)})`;
    } else if (
      (userRole === "owner" || userRole === "manager") &&
      rate < basePrice &&
      discountPct > 20
    ) {
      error = `Owner/Manager can apply a maximum 20% discount (Min rate: ₹${(basePrice * 0.8).toFixed(0)})`;
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
      toast.error("Please fix pricing errors first");
      return;
    }
    if (cart.some((i) => i.quantity === 0)) {
      toast.error("Some items have 0 quantity — please fix or remove them");
      return;
    }
    if (paymentMode === "credit" && !customerName.trim()) {
      toast.error("Customer Name is required for credit sales");
      return;
    }
    if (paymentMode === "credit" && !customerMobile.trim()) {
      toast.error("⚠️ Mobile Number is required for credit sales");
      return;
    }
    if (
      computedDue > 0 &&
      !customerMobile.trim() &&
      !isWalkIn(customerName.trim())
    ) {
      toast.error("⚠️ Mobile Number is required for sales with pending dues");
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
        priceModeUsed: item.priceMode ?? "standard",
        ...(item.selectedBatchId
          ? { selectedBatchId: item.selectedBatchId }
          : {}),
      };
    });

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
      customerAddress: customerAddress.trim() || undefined,
      items: invoiceItems,
      totalAmount: total,
      paidAmount: computedPaid,
      dueAmount: computedDue,
      paymentMode,
      date: new Date().toISOString(),
      invoiceTotalProfit,
      totalExtraProfit: totalExtraProfit > 0 ? totalExtraProfit : undefined,
      totalStaffBonus: totalStaffBonus > 0 ? totalStaffBonus : undefined,
      soldByUserId:
        currentUser?.id ??
        (typeof localStorage !== "undefined"
          ? ((
              JSON.parse(
                localStorage.getItem("mobile_auth_session") ?? "null",
              ) as { shopId?: string } | null
            )?.shopId ?? "owner")
          : "owner"),
      soldByName: currentUser?.name ?? "Owner",
      ...(activeTransport > 0 ? { transportCharge: activeTransport } : {}),
      ...(activeLabour > 0 ? { labourCharge: activeLabour } : {}),
      ...(activeOther > 0 ? { otherCharges: activeOther } : {}),
      ...(activeGST > 0
        ? {
            gstRate,
            gstAmount,
            cgstRate,
            sgstRate,
            cgstAmount,
            sgstAmount,
          }
        : {}),
    };

    if (lowPriceItems.length > 0) {
      setPendingLowPriceItems(lowPriceItems);
      setPendingInvoiceData(invoiceData);
      setPendingInvoiceItems(invoiceItems);
      setShowLowPriceModal(true);
      return;
    }

    if (paymentMode === "cash" && onNavigate) {
      // Save auto-draft before leaving so state is preserved if they come back
      saveAutoDraft();
      try {
        sessionStorage.setItem(
          PENDING_CASH_KEY,
          JSON.stringify({ invoiceData, invoiceItems, billTotal: total }),
        );
      } catch (_) {
        /* ignore storage errors */
      }
      onNavigate("cash-counter");
      return;
    }
    doCreateInvoice(invoiceData, invoiceItems, false, false, []);
  };

  function doCreateInvoice(
    invoiceData: Omit<Invoice, "id" | "invoiceNumber">,
    _invoiceItems: InvoiceItem[],
    wasBlocked: boolean,
    pinUsed: boolean,
    lowItems: LowPriceItem[],
  ) {
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
      addAuditLog(
        "low_price_attempt",
        `${item.productName} — entered ₹${item.enteredPrice}, min ₹${item.minSellPrice.toFixed(0)}, status: ${attemptType}`,
        item.productId,
      );
    }
    if (pinUsed && lowItems.length > 0) {
      addAuditLog(
        "low_price_override",
        `Owner PIN override — ${lowItems.map((i) => i.productName).join(", ")}`,
      );
    }

    if (wasBlocked) return;

    // ── Idempotency guard: prevent duplicate bills on double-tap ──────────
    const idemKey = generateIdempotencyKey(shopId, "invoice", {
      customerMobile: invoiceData.customerMobile ?? "",
      totalAmount: invoiceData.totalAmount,
      timestamp: Date.now(),
    });
    const { isNew } = checkAndRegisterKey(shopId, "invoice", idemKey);
    if (!isNew) {
      toast.info("This bill was already saved.", { duration: 3500 });
      clearForm();
      return;
    }

    const { invoice, mergedExisting } = createInvoice(invoiceData);

    addAuditLog(
      "sale_created",
      `Invoice ${invoice.invoiceNumber} — ₹${invoice.totalAmount} — ${invoice.paymentMode} — Customer: ${invoice.customerName}`,
      invoice.id,
    );

    if (mergedExisting) {
      toast.warning("⚠️ Same mobile detected — merging customer data");
    }

    // Mark draft completed and clean up
    if (editingDraftId) {
      markDraftCompleted(editingDraftId);
    }
    sessionStorage.removeItem(AUTO_DRAFT_KEY);
    sessionStorage.removeItem(RESUME_DRAFT_KEY);

    // ── Customer Tracking: update or create customer record ───────────────
    updateCustomerAfterSale(
      invoiceData.customerMobile ?? "",
      invoiceData.customerName ?? "",
      invoiceData.customerAddress,
      invoice.totalAmount,
      invoice.dueAmount,
    );

    setGeneratedInvoice(invoice);
    setShowInvoice(true);
    clearForm();
    toast.success(`Invoice ${invoice.invoiceNumber} generated!`);
  }

  function handleLowPriceModalContinue(overridden: boolean, pinUsed: boolean) {
    setShowLowPriceModal(false);
    if (!pendingInvoiceData) return;
    const isLockMode = !(appConfig.allowLowPriceSelling ?? true);
    const isBlocked = isLockMode && !overridden;
    if (isBlocked) {
      doCreateInvoice(
        pendingInvoiceData,
        pendingInvoiceItems,
        true,
        false,
        pendingLowPriceItems,
      );
    } else {
      for (const item of pendingLowPriceItems) {
        const attemptType = pinUsed ? "overridden" : "warned";
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
        addAuditLog(
          "low_price_attempt",
          `${item.productName} — entered ₹${item.enteredPrice}, min ₹${item.minSellPrice.toFixed(0)}, status: ${attemptType}`,
          item.productId,
        );
      }
      if (pinUsed && pendingLowPriceItems.length > 0) {
        addAuditLog(
          "low_price_override",
          `Owner PIN override — ${pendingLowPriceItems.map((i) => i.productName).join(", ")}`,
        );
      }
      if (pendingInvoiceData.paymentMode === "cash" && onNavigate) {
        // Save auto-draft before leaving
        saveAutoDraft();
        try {
          sessionStorage.setItem(
            PENDING_CASH_KEY,
            JSON.stringify({
              invoiceData: pendingInvoiceData,
              invoiceItems: pendingInvoiceItems,
              billTotal: pendingInvoiceData.totalAmount,
            }),
          );
        } catch (_) {
          /* ignore storage errors */
        }
        setPendingLowPriceItems([]);
        setPendingInvoiceData(null);
        setPendingInvoiceItems([]);
        onNavigate("cash-counter");
        return;
      }
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

  function isWalkIn(name: string): boolean {
    return (
      name.trim().toLowerCase() === "walk-in customer" || name.trim() === ""
    );
  }

  const paymentModeColors: Record<PaymentMode, string> = {
    cash: "bg-card border-green-500 text-green-700 shadow-sm",
    upi: "bg-card border-blue-500 text-blue-700 shadow-sm",
    online: "bg-card border-primary text-primary shadow-sm",
    credit: "bg-card border-amber-500 text-amber-700 shadow-sm",
  };

  const isEditing = !!editingDraftId;
  const showDiscardButton = isEditing || autoDraftActive;

  return (
    <div className="flex flex-col gap-6">
      <div className="px-4 md:px-6 pb-6 flex flex-col gap-4">
        {/* ── Header row with edit mode indicator ──────────────────────── */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold">{t("Point of Sale")}</h1>
              {isEditing && (
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 text-xs"
                  data-ocid="billing.editing_draft.badge"
                >
                  <PenLine size={11} />
                  Editing Draft
                  {customerName.trim() ? ` — ${customerName.trim()}` : ""}
                </Badge>
              )}
              {autoDraftActive && !isEditing && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1 text-xs"
                  data-ocid="billing.restored_draft.badge"
                >
                  <FileText size={11} />
                  Restored
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm">
              Create invoices with automatic FIFO stock deduction
            </p>
          </div>

          {/* Action buttons row */}
          <div className="flex items-center gap-2 flex-wrap">
            {showDiscardButton && (
              <Button
                data-ocid="billing.discard.button"
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/40 hover:bg-destructive/5 gap-1"
                onClick={handleDiscard}
              >
                <X size={14} />
                {isEditing ? "Discard Draft" : "Discard"}
              </Button>
            )}
            <Button
              data-ocid="billing.new_sale.button"
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={handleNewSale}
            >
              <Plus size={14} />
              New Sale
            </Button>
            {onNavigate && (
              <Button
                data-ocid="billing.view_drafts.button"
                variant="outline"
                size="sm"
                className="gap-1 text-amber-700 border-amber-300 hover:bg-amber-50"
                onClick={() => {
                  saveAutoDraft();
                  onNavigate("drafts");
                }}
              >
                <FileText size={14} />
                Drafts
              </Button>
            )}
          </div>
        </div>

        {/* Over Sell Alert */}
        {hasOverSell && (
          <div
            data-ocid="billing.oversell_alert_box"
            className="rounded-lg border-2 border-red-500 bg-red-50 p-4 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2 text-red-700 font-semibold text-sm">
              <AlertTriangle size={18} className="shrink-0" />
              Over Sell Alert — {overSellItems.length} item(s) have insufficient
              stock
            </div>
            <div className="flex flex-col gap-2">
              {overSellItems.map((osi) => (
                <div
                  key={osi.productId}
                  className="bg-card border border-red-200 rounded-md p-3 text-sm"
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
              ⚠️ Invoice can be created but stock will go negative. Please
              replenish soon.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart / Item Entry */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* ── Customer Info ─────────────────────────────────────────── */}
            <Card className="shadow-card border-2 border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/20">
              <CardHeader className="pb-2 border-b border-blue-200 dark:border-blue-900">
                <CardTitle className="text-base flex items-center gap-2 text-blue-800 dark:text-blue-300">
                  👤 {t("Customer Details")}
                  {customerTrackingEnabled && (
                    <Badge className="text-[10px] px-1.5 py-0 bg-purple-100 text-purple-700 border border-purple-300 dark:bg-purple-900/30 dark:text-purple-300">
                      PRO Tracking ON
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* ── Mobile Number with smart suggest (Pro Tracking only) ─── */}
                {customerTrackingEnabled ? (
                  <div className="space-y-1 sm:col-span-2 relative">
                    <Label className="text-sm flex items-center gap-1.5">
                      Mobile Number
                      {(paymentMode === "credit" || computedDue > 0) && (
                        <span className="text-red-500">*</span>
                      )}
                      <span className="text-[10px] text-purple-600 font-medium">
                        — type to auto-find customer
                      </span>
                    </Label>
                    <div className="relative">
                      <Input
                        data-ocid="billing.customer_mobile.input"
                        placeholder="Enter mobile to find/create customer…"
                        value={customerMobile}
                        onChange={(e) =>
                          handleMobileInputChange(e.target.value)
                        }
                        onBlur={() =>
                          setTimeout(() => setShowSuggestions(false), 180)
                        }
                        onFocus={() => {
                          if (mobileSuggestions.length > 0)
                            setShowSuggestions(true);
                        }}
                        maxLength={10}
                        className={
                          (paymentMode === "credit" || computedDue > 0) &&
                          !customerMobile.trim()
                            ? "border-amber-400 focus-visible:ring-amber-400"
                            : linkedCustomerId
                              ? "border-green-400 focus-visible:ring-green-400"
                              : ""
                        }
                      />
                      {linkedCustomerId && (
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-600 text-xs font-medium flex items-center gap-1">
                          <User size={11} /> Linked
                        </span>
                      )}
                    </div>

                    {/* Suggestions dropdown */}
                    {showSuggestions && mobileSuggestions.length > 0 && (
                      <div
                        ref={suggestionsRef}
                        data-ocid="billing.customer_suggestions.popover"
                        className="absolute z-50 w-full mt-0.5 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
                      >
                        {mobileSuggestions.map((c) => {
                          const tier = getCustomerTier(c.totalPurchase);
                          const activity = getActivityStatus(c.lastVisit);
                          const hasPending =
                            (c.pendingBalance ?? 0) > 0 ||
                            (c.creditBalance ?? 0) > 0;
                          const pendingAmt =
                            c.pendingBalance ?? c.creditBalance ?? 0;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              data-ocid="billing.customer_suggestion.item"
                              className="w-full text-left px-3 py-2.5 hover:bg-accent transition-colors border-b border-border/50 last:border-b-0 flex items-center justify-between gap-2"
                              onClick={() => handleSelectCustomerSuggestion(c)}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-sm font-semibold truncate">
                                    {c.name || "No name"}
                                  </span>
                                  <span className="text-xs text-muted-foreground font-mono">
                                    {c.mobile}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {hasPending && (
                                  <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded px-1 py-0.5">
                                    ₹
                                    {Math.round(pendingAmt).toLocaleString(
                                      "en-IN",
                                    )}{" "}
                                    pending
                                  </span>
                                )}
                                <span
                                  className={`text-[10px] border rounded px-1 py-0.5 font-medium ${TIER_COLORS[tier]}`}
                                >
                                  {TIER_EMOJI[tier]} {TIER_LABELS[tier]}
                                </span>
                                <span
                                  className={`text-[10px] border rounded px-1 py-0.5 ${ACTIVITY_COLORS[activity]}`}
                                >
                                  {ACTIVITY_LABELS[activity]}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {(paymentMode === "credit" || computedDue > 0) &&
                      !customerMobile.trim() && (
                        <p className="text-[11px] text-amber-600 flex items-center gap-1 mt-0.5">
                          ⚠️ Mobile number is required for credit sales
                        </p>
                      )}

                    {/* Linked customer info card */}
                    {linkedCustomerId &&
                      (() => {
                        const lc = customers.find(
                          (c) => c.id === linkedCustomerId,
                        );
                        if (!lc) return null;
                        const tier = getCustomerTier(lc.totalPurchase);
                        const activity = getActivityStatus(lc.lastVisit);
                        const pending =
                          lc.pendingBalance ?? lc.creditBalance ?? 0;
                        return (
                          <div
                            data-ocid="billing.linked_customer.card"
                            className="mt-2 rounded-lg border border-green-300 bg-green-50/60 dark:border-green-700 dark:bg-green-950/20 p-3 text-xs space-y-1.5"
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-foreground">
                                {lc.name || "—"}
                              </span>
                              <span
                                className={`border rounded px-1.5 py-0.5 font-medium text-[11px] ${TIER_COLORS[tier]}`}
                              >
                                {TIER_EMOJI[tier]} {TIER_LABELS[tier]}
                              </span>
                              <span
                                className={`border rounded px-1.5 py-0.5 text-[11px] ${ACTIVITY_COLORS[activity]}`}
                              >
                                {ACTIVITY_LABELS[activity]}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                              <div>
                                <div className="text-[10px] uppercase tracking-wide">
                                  Last Visit
                                </div>
                                <div className="font-medium text-foreground">
                                  {lc.lastVisit
                                    ? new Date(lc.lastVisit).toLocaleDateString(
                                        "en-IN",
                                      )
                                    : "—"}
                                </div>
                              </div>
                              <div>
                                <div className="text-[10px] uppercase tracking-wide">
                                  Total Purchase
                                </div>
                                <div className="font-medium text-foreground">
                                  ₹
                                  {(lc.totalPurchase ?? 0).toLocaleString(
                                    "en-IN",
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className="text-[10px] uppercase tracking-wide">
                                  Pending
                                </div>
                                <div
                                  className={`font-semibold ${pending > 0 ? "text-red-600" : "text-green-600"}`}
                                >
                                  {pending > 0
                                    ? `₹${Math.round(pending).toLocaleString("en-IN")}`
                                    : "Nil"}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Label className="text-sm">
                      Mobile Number
                      {(paymentMode === "credit" || computedDue > 0) && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                      {(paymentMode === "credit" || computedDue > 0) && (
                        <span className="text-[10px] text-amber-600 ml-2 font-normal">
                          Required for dues
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
                          ⚠️ Mobile number is required for credit sales
                        </p>
                      )}
                  </div>
                )}

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

                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-sm">
                    Address{" "}
                    <span className="text-muted-foreground font-normal text-xs">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    data-ocid="billing.customer_address.input"
                    placeholder="e.g. 12 Main Market, Indore"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                  />
                </div>

                {/* Customer Type / Price Mode selector */}
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-sm flex items-center gap-1.5">
                    Customer Type{" "}
                    <span className="text-muted-foreground font-normal text-xs">
                      (sets price mode)
                    </span>
                  </Label>
                  <div
                    data-ocid="billing.customer_type.toggle"
                    className="flex gap-1.5 flex-wrap"
                  >
                    {(
                      [
                        {
                          key: "regular" as CustomerType,
                          label: "Regular",
                          hint: "Standard price",
                          cls: "border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
                          activeCls:
                            "ring-2 ring-blue-500 ring-offset-1 font-semibold",
                        },
                        {
                          key: "retailer" as CustomerType,
                          label: "Retailer",
                          hint: "Retailer",
                          cls: "border-green-400 bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300",
                          activeCls:
                            "ring-2 ring-green-500 ring-offset-1 font-semibold",
                        },
                        {
                          key: "wholesaler" as CustomerType,
                          label: "Wholesaler",
                          hint: "Wholesale",
                          cls: "border-purple-400 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
                          activeCls:
                            "ring-2 ring-purple-500 ring-offset-1 font-semibold",
                        },
                      ] as const
                    ).map(({ key, label, hint, cls, activeCls }) => (
                      <button
                        key={key}
                        type="button"
                        data-ocid={`billing.customer_type.${key}`}
                        onClick={() => {
                          setCustomerType(key);
                          applyCustomerTypeToCart(key);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-all ${cls} ${
                          customerType === key
                            ? activeCls
                            : "opacity-60 hover:opacity-90"
                        }`}
                      >
                        {label}{" "}
                        <span className="opacity-70 font-normal">({hint})</span>
                      </button>
                    ))}
                  </div>
                  {customerType !== "regular" && (
                    <p className="text-[11px] text-muted-foreground">
                      {customerType === "retailer"
                        ? "Retailer price auto-applied to items that have it set"
                        : "Wholesaler price auto-applied to items that have it set"}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-3 -my-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 rounded-full bg-muted border border-border whitespace-nowrap">
                🛒 Items
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* ── Add Items ──────────────────────────────────────────────── */}
            <Card className="shadow-card border-2 border-green-200 dark:border-green-900 bg-green-50/20 dark:bg-green-950/10">
              <CardHeader className="pb-3 border-b border-green-200 dark:border-green-900">
                <CardTitle className="text-base flex items-center gap-2 text-green-800 dark:text-green-300">
                  🧺 {t("Add Items")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-3">
                <div className="flex gap-2 items-center">
                  <div className="flex-1 min-w-0 flex gap-2 items-center">
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
                                {p.name}
                                {p.partNo ? ` (Part No: ${p.partNo})` : ""} —
                                Stock: {stock} {p.unit}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    ref={qtyInputRef}
                    data-ocid="billing.qty.input"
                    type="number"
                    placeholder="Qty"
                    value={addQty}
                    onChange={(e) =>
                      setAddQty(clearLeadingZeros(e.target.value))
                    }
                    onFocus={(e) => {
                      if (e.target.value === "0") e.target.select();
                    }}
                    className="w-28"
                  />
                  {(appConfig.featureMode ?? 3) === 3 && (
                    <>
                      <VoiceInputButton
                        compact
                        onParsed={handleBillingVoiceParsed}
                        lang={language === "hi" ? "hi-IN" : "en-IN"}
                        data-ocid="billing.voice_input.button"
                      />
                      <QRScannerToggle
                        products={products}
                        onProductScanned={handleProductScanned}
                        qtyInputRef={qtyInputRef}
                      />
                    </>
                  )}
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

                {/* Batch Selector */}
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
                                <div className="flex flex-col gap-1">
                                  {item.productName}
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
                                  {/* Spare part details in cart */}
                                  {(() => {
                                    const prod = products.find(
                                      (p) => p.id === item.productId,
                                    );
                                    if (!prod) return null;
                                    const parts = [
                                      prod.partNo
                                        ? `Part No: ${prod.partNo}`
                                        : null,
                                      prod.srNo ? `SR No: ${prod.srNo}` : null,
                                      prod.tnNo ? `TN No: ${prod.tnNo}` : null,
                                      prod.dd ? `DD: ${prod.dd}` : null,
                                      prod.ed ? `ED: ${prod.ed}` : null,
                                      prod.mrp != null
                                        ? `MRP: ₹${prod.mrp.toLocaleString("en-IN")}`
                                        : null,
                                    ].filter(Boolean);
                                    if (parts.length === 0) return null;
                                    return (
                                      <span className="text-[10px] text-muted-foreground leading-tight">
                                        {parts.join(" | ")}
                                      </span>
                                    );
                                  })()}
                                  {/* Price mode pills */}
                                  {(() => {
                                    const prod = products.find(
                                      (p) => p.id === item.productId,
                                    );
                                    if (!prod) return null;
                                    const hasRetailer =
                                      prod.retailerPrice &&
                                      prod.retailerPrice > 0;
                                    const hasWholesaler =
                                      prod.wholesalerPrice &&
                                      prod.wholesalerPrice > 0;
                                    if (!hasRetailer && !hasWholesaler)
                                      return null;
                                    const currentMode =
                                      item.priceMode ?? "standard";
                                    return (
                                      <div
                                        data-ocid={`billing.cart.price_mode.${idx + 1}`}
                                        className="flex gap-1 flex-wrap mt-0.5"
                                      >
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleItemPriceModeChange(
                                              item.productId,
                                              item.selectedBatchId,
                                              "standard",
                                            )
                                          }
                                          className={`px-1.5 py-0.5 rounded text-[10px] border transition-all ${
                                            currentMode === "standard"
                                              ? "bg-blue-100 border-blue-400 text-blue-700 font-semibold ring-1 ring-blue-400"
                                              : "bg-muted border-border text-muted-foreground hover:border-blue-300"
                                          }`}
                                        >
                                          Std ₹
                                          {prod.sellingPrice.toLocaleString(
                                            "en-IN",
                                          )}
                                        </button>
                                        {hasRetailer && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleItemPriceModeChange(
                                                item.productId,
                                                item.selectedBatchId,
                                                "retailer",
                                              )
                                            }
                                            className={`px-1.5 py-0.5 rounded text-[10px] border transition-all ${
                                              currentMode === "retailer"
                                                ? "bg-green-100 border-green-400 text-green-700 font-semibold ring-1 ring-green-400"
                                                : "bg-muted border-border text-muted-foreground hover:border-green-300"
                                            }`}
                                          >
                                            Ret ₹
                                            {prod.retailerPrice!.toLocaleString(
                                              "en-IN",
                                            )}
                                          </button>
                                        )}
                                        {hasWholesaler && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleItemPriceModeChange(
                                                item.productId,
                                                item.selectedBatchId,
                                                "wholesaler",
                                              )
                                            }
                                            className={`px-1.5 py-0.5 rounded text-[10px] border transition-all ${
                                              currentMode === "wholesaler"
                                                ? "bg-purple-100 border-purple-400 text-purple-700 font-semibold ring-1 ring-purple-400"
                                                : "bg-muted border-border text-muted-foreground hover:border-purple-300"
                                            }`}
                                          >
                                            Whl ₹
                                            {prod.wholesalerPrice!.toLocaleString(
                                              "en-IN",
                                            )}
                                          </button>
                                        )}
                                      </div>
                                    );
                                  })()}
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
                                        clearLeadingZeros(e.target.value),
                                        item.selectedBatchId,
                                      )
                                    }
                                    onFocus={(e) => {
                                      if (e.target.value === "0")
                                        e.target.select();
                                    }}
                                    className={`w-20 h-9 text-sm text-center ${isOverSell ? "border-red-500" : ""}`}
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
                                  const errMsg = itemErrors[item.productId];
                                  // Use costPrice stored on CartItem (set at add-to-cart time from batch/FIFO),
                                  // fall back to live getProductCostPrice for items added before the fix.
                                  const costP = canViewCost
                                    ? item.costPrice && item.costPrice > 0
                                      ? item.costPrice
                                      : getProductCostPrice(item.productId)
                                    : 0;
                                  const minProfitPct = prod?.minProfitPct ?? 0;
                                  const minSellP =
                                    canViewCost && costP > 0 && minProfitPct > 0
                                      ? getMinPrice(costP, minProfitPct)
                                      : null;
                                  const isBelowMin =
                                    minSellP !== null &&
                                    item.sellingRate < minSellP;
                                  // Correct profit: (sellPrice - costPrice) * qty
                                  const profit =
                                    costP > 0
                                      ? (item.sellingRate - costP) *
                                        item.quantity
                                      : 0;
                                  return (
                                    <div className="flex flex-col gap-0.5">
                                      <Input
                                        type="number"
                                        value={item.sellingRate}
                                        onChange={(e) =>
                                          handleRateChange(
                                            item.productId,
                                            Number(
                                              clearLeadingZeros(e.target.value),
                                            ),
                                          )
                                        }
                                        onFocus={(e) => {
                                          if (e.target.value === "0")
                                            e.target.select();
                                        }}
                                        className={`w-24 h-7 text-sm ${errMsg || isBelowMin ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                                      />
                                      {canViewCost && costP > 0 && (
                                        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 text-[10px] leading-tight">
                                          <span className="text-muted-foreground">
                                            Cost: ₹
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
                                      {canViewCost && costP > 0 && (
                                        <span
                                          className={`text-[10px] font-medium ${profit >= 0 ? "text-green-600" : "text-red-600"}`}
                                        >
                                          Profit: ₹
                                          {Math.round(profit).toLocaleString(
                                            "en-IN",
                                          )}
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

            {/* ── Extra Charges ─────────────────────────────────────────── */}
            <Card className="shadow-card border-2 border-purple-200 dark:border-purple-900 bg-purple-50/20 dark:bg-purple-950/10">
              <CardHeader className="pb-2 border-b border-purple-200 dark:border-purple-900">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2 text-purple-800 dark:text-purple-300">
                    <Truck size={16} />
                    Extra Charges
                  </CardTitle>
                  {/* Master toggle */}
                  <button
                    type="button"
                    data-ocid="billing.extra_charges.toggle"
                    aria-label="Toggle extra charges"
                    onClick={() => setChargesEnabled((v) => !v)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      chargesEnabled
                        ? "bg-purple-600"
                        : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        chargesEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                {!chargesEnabled && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Toggle ON to add transportation, labour, other charges, or
                    GST
                  </p>
                )}
              </CardHeader>

              {chargesEnabled && (
                <CardContent className="pt-3 space-y-3">
                  {/* Transportation */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      data-ocid="billing.transport_charge.toggle"
                      aria-label="Toggle transportation charge"
                      onClick={() => setTransportEnabled((v) => !v)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        transportEnabled
                          ? "bg-purple-500"
                          : "bg-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          transportEnabled ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="text-sm text-foreground flex-1 font-medium">
                      🚛 Transportation Charge
                    </span>
                    {transportEnabled && (
                      <Input
                        data-ocid="billing.transport_charge.input"
                        type="number"
                        placeholder="₹ Amount"
                        value={transportAmt}
                        onChange={(e) =>
                          setTransportAmt(clearLeadingZeros(e.target.value))
                        }
                        onFocus={(e) => {
                          if (e.target.value === "0") e.target.select();
                        }}
                        className="w-28 h-8 text-sm"
                        min="0"
                      />
                    )}
                    {!transportEnabled && (
                      <span className="text-xs text-muted-foreground">OFF</span>
                    )}
                  </div>

                  {/* Labour */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      data-ocid="billing.labour_charge.toggle"
                      aria-label="Toggle labour charge"
                      onClick={() => setLabourEnabled((v) => !v)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        labourEnabled
                          ? "bg-purple-500"
                          : "bg-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          labourEnabled ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="text-sm text-foreground flex-1 font-medium">
                      👷 Labour Charge
                    </span>
                    {labourEnabled && (
                      <Input
                        data-ocid="billing.labour_charge.input"
                        type="number"
                        placeholder="₹ Amount"
                        value={labourAmt}
                        onChange={(e) =>
                          setLabourAmt(clearLeadingZeros(e.target.value))
                        }
                        onFocus={(e) => {
                          if (e.target.value === "0") e.target.select();
                        }}
                        className="w-28 h-8 text-sm"
                        min="0"
                      />
                    )}
                    {!labourEnabled && (
                      <span className="text-xs text-muted-foreground">OFF</span>
                    )}
                  </div>

                  {/* Other */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      data-ocid="billing.other_charges.toggle"
                      aria-label="Toggle other charges"
                      onClick={() => setOtherEnabled((v) => !v)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        otherEnabled
                          ? "bg-purple-500"
                          : "bg-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          otherEnabled ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="text-sm text-foreground flex-1 font-medium">
                      📦 Other Charges
                    </span>
                    {otherEnabled && (
                      <Input
                        data-ocid="billing.other_charges.input"
                        type="number"
                        placeholder="₹ Amount"
                        value={otherAmt}
                        onChange={(e) =>
                          setOtherAmt(clearLeadingZeros(e.target.value))
                        }
                        onFocus={(e) => {
                          if (e.target.value === "0") e.target.select();
                        }}
                        className="w-28 h-8 text-sm"
                        min="0"
                      />
                    )}
                    {!otherEnabled && (
                      <span className="text-xs text-muted-foreground">OFF</span>
                    )}
                  </div>

                  {/* GST */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      data-ocid="billing.gst.toggle"
                      aria-label="Toggle GST"
                      onClick={() => setGstEnabled((v) => !v)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        gstEnabled ? "bg-purple-500" : "bg-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          gstEnabled ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="text-sm text-foreground flex-1 font-medium">
                      GST
                    </span>
                    {!gstEnabled && (
                      <span className="text-xs text-muted-foreground">Off</span>
                    )}
                  </div>
                  {gstEnabled && (
                    <div className="ml-12 space-y-2">
                      <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                        GST is ON — GST will be automatically added to the bill
                      </p>
                      {/* Preset rate buttons */}
                      <div className="flex gap-1.5 flex-wrap">
                        {[5, 12, 18, 28].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            data-ocid={`billing.gst_preset_${preset}.button`}
                            onClick={() => setGstRate(preset)}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                              gstRate === preset
                                ? "bg-purple-600 text-white border-purple-600"
                                : "bg-background border-border text-muted-foreground hover:border-purple-400"
                            }`}
                          >
                            {preset}%
                          </button>
                        ))}
                      </div>
                      {/* Custom rate input */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          GST Rate (%)
                        </span>
                        <Input
                          data-ocid="billing.gst_rate.input"
                          type="number"
                          placeholder="Rate %"
                          value={gstRate}
                          onChange={(e) => {
                            const v =
                              Number(clearLeadingZeros(e.target.value)) || 0;
                            setGstRate(Math.min(100, Math.max(0, v)));
                          }}
                          onFocus={(e) => e.target.select()}
                          className="w-20 h-7 text-sm"
                          min="0"
                          max="100"
                        />
                      </div>
                      {gstAmount > 0 && (
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <div className="flex gap-3">
                            <span>
                              CGST ({cgstRate}%): {fmt(cgstAmount)}
                            </span>
                            <span>
                              SGST ({sgstRate}%): {fmt(sgstAmount)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {(totalCharges > 0 || activeGST > 0) && (
                    <div className="flex justify-between items-center pt-2 border-t border-purple-200 dark:border-purple-800 text-sm font-medium text-purple-700 dark:text-purple-300">
                      <span>Total Extra Charges</span>
                      <span>{fmt(totalCharges + activeGST)}</span>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>

          {/* Payment Summary */}
          <div className="flex flex-col gap-4">
            <Card className="shadow-card border-2 border-amber-200 dark:border-amber-900">
              <CardHeader className="pb-3 border-b border-amber-200 dark:border-amber-900">
                <CardTitle className="text-base flex items-center gap-2 text-amber-800 dark:text-amber-300">
                  💰 {t("Payment")}
                </CardTitle>
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
                      {overSellItems.length} item(s) exceed available stock
                    </div>
                  )}
                  <Separator />
                  {/* Subtotal */}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{fmt(itemsSubtotal)}</span>
                  </div>
                  {/* Charge lines (only when active) */}
                  {activeTransport > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        🚛 Transport
                      </span>
                      <span className="text-purple-700">
                        +{fmt(activeTransport)}
                      </span>
                    </div>
                  )}
                  {activeLabour > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        👷 Labour
                      </span>
                      <span className="text-purple-700">
                        +{fmt(activeLabour)}
                      </span>
                    </div>
                  )}
                  {activeOther > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        📦 Other
                      </span>
                      <span className="text-purple-700">
                        +{fmt(activeOther)}
                      </span>
                    </div>
                  )}
                  {activeGST > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          CGST ({cgstRate}%)
                        </span>
                        <span className="text-purple-700">
                          +{fmt(cgstAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          SGST ({sgstRate}%)
                        </span>
                        <span className="text-purple-700">
                          +{fmt(sgstAmount)}
                        </span>
                      </div>
                    </>
                  )}
                  {(totalCharges > 0 || activeGST > 0) && <Separator />}
                  <div className="flex justify-between font-bold text-lg">
                    <span>
                      {activeGST > 0
                        ? "Grand Total (incl. GST)"
                        : "Grand Total"}
                    </span>
                    <span className="text-brand-blue">{fmt(total)}</span>
                  </div>
                </div>

                {/* Payment Mode */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-foreground">
                    {t("Payment Mode")}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["cash", "upi", "online", "credit"] as PaymentMode[]).map(
                      (mode) => (
                        <button
                          key={mode}
                          type="button"
                          data-ocid={`billing.payment_mode_${mode}.toggle`}
                          onClick={() => handlePaymentModeChange(mode)}
                          className={`h-11 flex items-center justify-center gap-2 px-3 rounded-lg border-2 text-xs font-semibold capitalize transition-all ${
                            paymentMode === mode
                              ? paymentModeColors[mode]
                              : "bg-background border-border text-muted-foreground hover:border-primary/40"
                          }`}
                        >
                          {mode === "cash" && (
                            <>
                              <span>💵</span> Cash
                            </>
                          )}
                          {mode === "upi" && (
                            <>
                              <span>📱</span> UPI
                            </>
                          )}
                          {mode === "online" && (
                            <>
                              <span>💻</span> Online
                            </>
                          )}
                          {mode === "credit" && (
                            <>
                              <span>📝</span> Credit
                            </>
                          )}
                        </button>
                      ),
                    )}
                  </div>
                  {paymentMode === "credit" && (
                    <p className="text-xs text-amber-600 mt-1">
                      Credit sale: Paid = ₹0, Due = Total. Customer name
                      required.
                    </p>
                  )}
                </div>

                {/* Partial Payment */}
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

                {isPartial && paymentMode !== "credit" && (
                  <div className="space-y-1.5">
                    <Label className="text-sm">Amount Paid (&#8377;)</Label>
                    <Input
                      data-ocid="billing.paid_amount.input"
                      type="number"
                      placeholder="Enter amount received"
                      value={paidAmountStr}
                      onChange={(e) =>
                        setPaidAmountStr(clearLeadingZeros(e.target.value))
                      }
                      onFocus={(e) => {
                        if (e.target.value === "0") e.target.select();
                      }}
                    />
                  </div>
                )}

                {/* Breakdown */}
                <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden text-sm">
                  {paymentMode === "cash" && (
                    <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/60">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span>💵</span> Cash
                      </span>
                      <span className="font-semibold text-green-600">
                        {fmt(computedPaid)}
                      </span>
                    </div>
                  )}
                  {(paymentMode === "upi" || paymentMode === "online") && (
                    <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/60">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span>📱</span>{" "}
                        {paymentMode === "upi" ? "UPI" : "Online"}
                      </span>
                      <span className="font-semibold text-blue-600">
                        {fmt(computedPaid)}
                      </span>
                    </div>
                  )}
                  {paymentMode === "credit" && (
                    <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/60">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span>📝</span> Credit
                      </span>
                      <span className="font-semibold text-amber-600">
                        {fmt(total)}
                      </span>
                    </div>
                  )}
                  {activeTransport > 0 && (
                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/60 text-xs">
                      <span className="text-muted-foreground">
                        🚛 Transport
                      </span>
                      <span className="text-purple-700">
                        +{fmt(activeTransport)}
                      </span>
                    </div>
                  )}
                  {activeLabour > 0 && (
                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/60 text-xs">
                      <span className="text-muted-foreground">👷 Labour</span>
                      <span className="text-purple-700">
                        +{fmt(activeLabour)}
                      </span>
                    </div>
                  )}
                  {activeOther > 0 && (
                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/60 text-xs">
                      <span className="text-muted-foreground">📦 Other</span>
                      <span className="text-purple-700">
                        +{fmt(activeOther)}
                      </span>
                    </div>
                  )}
                  {activeGST > 0 && (
                    <>
                      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/60 text-xs">
                        <span className="text-muted-foreground">
                          CGST ({cgstRate}%)
                        </span>
                        <span className="text-purple-700">
                          +{fmt(cgstAmount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/60 text-xs">
                        <span className="text-muted-foreground">
                          SGST ({sgstRate}%)
                        </span>
                        <span className="text-purple-700">
                          +{fmt(sgstAmount)}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/60">
                    <span className="font-semibold text-foreground">
                      {activeGST > 0
                        ? "Grand Total (incl. GST)"
                        : "Grand Total"}
                    </span>
                    <span className="font-bold text-foreground">
                      {fmt(total)}
                    </span>
                  </div>
                  {computedDue > 0 && (
                    <div className="flex items-center justify-between px-3 py-2.5 bg-red-50">
                      <span className="text-red-600 font-medium">Due</span>
                      <span className="font-bold text-red-600">
                        {fmt(computedDue)}
                      </span>
                    </div>
                  )}
                  {computedDue === 0 && paymentMode !== "credit" && (
                    <div className="flex items-center justify-between px-3 py-2.5 bg-green-50">
                      <span className="text-green-600 font-medium">
                        Fully Paid
                      </span>
                      <span className="text-green-600">✓</span>
                    </div>
                  )}
                </div>

                {/* Smart Pricing */}
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
                                  (Earned by staff)
                                </span>
                              </span>
                            </div>
                          </>
                        )}
                        {hasErrors && (
                          <div className="flex items-center gap-1 text-red-600 text-[11px] pt-0.5">
                            <AlertTriangle size={11} />
                            There are pricing errors — please fix them
                          </div>
                        )}
                      </div>
                    );
                  })()}

                {/* Auto-save indicator */}
                {lastSavedAt && cart.length > 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    💾 Draft auto-saved{" "}
                    {Math.floor((Date.now() - lastSavedAt.getTime()) / 1000) <
                    60
                      ? "just now"
                      : `${Math.floor((Date.now() - lastSavedAt.getTime()) / 60000)}m ago`}
                  </p>
                )}

                {/* Save Draft button */}
                <Button
                  data-ocid="billing.save_draft.button"
                  variant="outline"
                  className="w-full gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                  onClick={handleSaveDraft}
                  disabled={cart.length === 0 && !customerName.trim()}
                >
                  <FileText size={15} />
                  {isEditing ? "Update Draft" : "Save Draft"}
                </Button>

                <Button
                  data-ocid="billing.generate_invoice.button"
                  className="w-full h-11 text-base font-semibold"
                  onClick={() => {
                    setIsPaymentProcessing(true);
                    handleGenerateInvoice();
                    setTimeout(() => setIsPaymentProcessing(false), 1500);
                  }}
                  disabled={
                    cart.length === 0 ||
                    Object.keys(itemErrors).length > 0 ||
                    isPaymentProcessing
                  }
                >
                  {isPaymentProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Receipt size={16} className="mr-2" />
                      {paymentMode === "cash" && onNavigate
                        ? "💰 Pay via Cash Counter"
                        : t("Generate Invoice")}
                    </>
                  )}
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

      {/* New Sale Confirmation */}
      <NewSaleConfirmDialog
        open={showNewSaleConfirm}
        onConfirm={handleNewSaleConfirm}
        onCancel={() => setShowNewSaleConfirm(false)}
      />
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
  if (!open) return null;
  return <InvoiceShareModal invoice={invoice} onClose={onClose} />;
}
