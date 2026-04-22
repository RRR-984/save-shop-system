import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  IndianRupee,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { InvoiceShareModal } from "../components/InvoiceShareModal";
import { VoiceInputButton } from "../components/VoiceInputButton";
import { useLanguage } from "../context/LanguageContext";
import { useStore } from "../context/StoreContext";
import type { Invoice, InvoiceItem, NavPage } from "../types/store";
import { clearLeadingZeros } from "../utils/numberInput";
import type { ParsedVoiceCommand } from "../utils/voiceParser";

interface CashCounterPageProps {
  onNavigate: (page: NavPage) => void;
}

interface Denomination {
  value: number;
  label: string;
  color: string;
}

const DENOMINATIONS: Denomination[] = [
  { value: 500, label: "₹500", color: "bg-yellow-50 border-yellow-200" },
  { value: 200, label: "₹200", color: "bg-green-50 border-green-200" },
  { value: 100, label: "₹100", color: "bg-blue-50 border-blue-200" },
  { value: 50, label: "₹50", color: "bg-purple-50 border-purple-200" },
  { value: 20, label: "₹20", color: "bg-orange-50 border-orange-200" },
  { value: 10, label: "₹10", color: "bg-red-50 border-red-200" },
];

const PENDING_CASH_KEY = "pending_cash_invoice";

interface PendingCashPayment {
  invoiceData: Omit<Invoice, "id" | "invoiceNumber">;
  invoiceItems: InvoiceItem[];
  billTotal: number;
}

function fmtINR(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

// ─── Credit Panel ─────────────────────────────────────────────────────────────

interface CreditPanelProps {
  billTotal: number;
  customerName: string;
  onConfirm: (amountReceived: number) => void;
  onClose: () => void;
}

function CreditPanel({
  billTotal,
  customerName,
  onConfirm,
  onClose,
}: CreditPanelProps) {
  const [received, setReceived] = useState("0");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input when panel opens
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  const receivedNum = useMemo(() => {
    const v = Number.parseFloat(received);
    return Number.isNaN(v) ? 0 : Math.min(v, billTotal);
  }, [received, billTotal]);

  const dueNum = Math.max(0, billTotal - receivedNum);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      data-ocid="credit_panel.overlay"
    >
      <div
        role="button"
        tabIndex={-1}
        className="absolute inset-0"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        aria-label="Close credit panel"
      />
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation wrapper only */}
      <div
        className="relative bg-card rounded-t-2xl shadow-2xl w-full max-w-lg border-t border-border animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        data-ocid="credit_panel.container"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <CreditCard size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground leading-none">
                Save as Credit
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Collect partial or no payment now
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
            data-ocid="credit_panel.close.button"
          >
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        <div className="px-4 py-4 space-y-3">
          {/* Amount received input */}
          <div>
            <label
              htmlFor="credit-received"
              className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide"
            >
              Amount Received Now (₹) — optional
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                ₹
              </span>
              <Input
                id="credit-received"
                ref={inputRef}
                type="number"
                inputMode="decimal"
                min={0}
                max={billTotal}
                placeholder="0"
                value={received}
                onChange={(e) => setReceived(clearLeadingZeros(e.target.value))}
                onFocus={(e) => {
                  if (e.target.value === "0") e.target.select();
                }}
                className="pl-7 h-10 text-sm font-bold border-input focus:border-primary"
                data-ocid="credit_panel.received_amount.input"
              />
            </div>
          </div>

          {/* Summary breakdown */}
          <div
            className="rounded-xl border border-border bg-muted/30 overflow-hidden"
            data-ocid="credit_panel.summary.section"
          >
            <div className="grid grid-cols-3 divide-x divide-border">
              <div className="flex flex-col items-center px-3 py-3">
                <span className="text-[10px] text-muted-foreground font-medium leading-none mb-1">
                  Total Bill
                </span>
                <span className="text-sm font-extrabold text-foreground leading-none">
                  {fmtINR(billTotal)}
                </span>
              </div>
              <div className="flex flex-col items-center px-3 py-3">
                <span className="text-[10px] text-muted-foreground font-medium leading-none mb-1">
                  Received
                </span>
                <span className="text-sm font-extrabold text-green-600 leading-none">
                  {fmtINR(receivedNum)}
                </span>
              </div>
              <div
                className={`flex flex-col items-center px-3 py-3 ${
                  dueNum > 0 ? "bg-red-50/60" : "bg-green-50/60"
                }`}
              >
                <span className="text-[10px] text-muted-foreground font-medium leading-none mb-1">
                  Due
                </span>
                <span
                  className={`text-sm font-extrabold leading-none ${
                    dueNum > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {fmtINR(dueNum)}
                </span>
              </div>
            </div>
          </div>

          {/* Info line */}
          {dueNum > 0 && customerName && (
            <p className="text-[11px] text-muted-foreground text-center">
              <span className="font-semibold text-red-600">
                {fmtINR(dueNum)}
              </span>{" "}
              will be marked as due for{" "}
              <span className="font-semibold text-foreground">
                {customerName}
              </span>
            </p>
          )}

          {/* Confirm credit button */}
          <Button
            size="lg"
            onClick={() => onConfirm(receivedNum)}
            className="w-full h-11 text-sm font-bold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            data-ocid="credit_panel.confirm.button"
          >
            <CheckCircle size={16} className="mr-1.5 flex-shrink-0" />
            Confirm Credit Sale
            {dueNum > 0 && (
              <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                Due: {fmtINR(dueNum)}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function CashCounterPage({ onNavigate }: CashCounterPageProps) {
  const { addAuditLog, createInvoice, markDraftCompleted } = useStore();
  const { t, language } = useLanguage();

  const [pendingPayment, setPendingPayment] =
    useState<PendingCashPayment | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PENDING_CASH_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PendingCashPayment;
        setPendingPayment(parsed);
        setBillAmount(String(Math.round(parsed.billTotal)));
      }
    } catch (_) {
      /* ignore parse errors */
    }
  }, []);

  const [quantities, setQuantities] = useState<Record<number, string>>(
    Object.fromEntries(DENOMINATIONS.map((d) => [d.value, ""])),
  );
  const [billAmount, setBillAmount] = useState<string>("");
  const [confirmed, setConfirmed] = useState(false);
  const [returnAmt, setReturnAmt] = useState(0);
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCreditPanel, setShowCreditPanel] = useState(false);
  const [isCreditSale, setIsCreditSale] = useState(false);
  const [creditDueAmount, setCreditDueAmount] = useState(0);

  const handleCashVoiceParsed = (parsed: ParsedVoiceCommand) => {
    if (parsed.price !== null) {
      toast.info(`${t("Detected payment amount")}: ₹${parsed.price}`);
    } else {
      toast.success(t("Voice input applied — please review and save"));
    }
  };

  const totalCash = useMemo(() => {
    return DENOMINATIONS.reduce((sum, d) => {
      const qty = Number.parseInt(quantities[d.value] || "0", 10);
      return sum + (Number.isNaN(qty) ? 0 : qty * d.value);
    }, 0);
  }, [quantities]);

  const billAmountNum = useMemo(() => {
    const v = Number.parseFloat(billAmount);
    return Number.isNaN(v) ? 0 : v;
  }, [billAmount]);

  const returnAmount = totalCash - billAmountNum;
  const isInsufficient = billAmountNum > 0 && returnAmount < 0;
  const isReady = totalCash > 0 && billAmountNum > 0 && !isInsufficient;

  function handleQtyChange(denom: number, value: string) {
    const cleaned = clearLeadingZeros(value);
    if (cleaned === "" || /^\d+$/.test(cleaned)) {
      setQuantities((prev) => ({ ...prev, [denom]: cleaned }));
    }
  }

  /** Clears the pending cash session and marks any draft completed. */
  function clearPendingSession(draftId?: string) {
    try {
      sessionStorage.removeItem(PENDING_CASH_KEY);
    } catch (_) {
      /* ignore */
    }
    if (draftId) {
      try {
        markDraftCompleted(draftId);
      } catch (_) {
        /* ignore */
      }
    }
  }

  function handleConfirm() {
    if (!isReady) return;

    const finalReturn = returnAmount;
    setReturnAmt(finalReturn);

    if (pendingPayment) {
      try {
        const { invoice, mergedExisting } = createInvoice(
          pendingPayment.invoiceData,
        );
        if (mergedExisting) {
          toast.warning("⚠️ Same mobile detected — merging customer data");
        }
        addAuditLog(
          "cash_counter_payment",
          `Cash payment via counter. Invoice ${invoice.invoiceNumber} — Bill: ${fmtINR(billAmountNum)}, Cash: ${fmtINR(totalCash)}, Return: ${fmtINR(finalReturn)}`,
          invoice.id,
        );
        toast.success(`Invoice ${invoice.invoiceNumber} — Payment done!`);
        setCreatedInvoice(invoice);
      } catch (err) {
        console.error("[CashCounter] createInvoice error:", err);
        toast.error("Error saving invoice. Please try again.");
        return;
      }
      clearPendingSession(
        (
          pendingPayment.invoiceData as PendingCashPayment["invoiceData"] & {
            draftId?: string;
          }
        ).draftId,
      );
    } else {
      addAuditLog(
        "cash_counter_payment",
        `Cash payment collected. Bill: ${fmtINR(billAmountNum)}, Cash received: ${fmtINR(totalCash)}, Return: ${fmtINR(finalReturn)}`,
      );
      toast.success(`Payment confirmed! Return: ${fmtINR(finalReturn)}`);
    }

    setConfirmed(true);
    if (pendingPayment) {
      setTimeout(() => {
        setShowShareModal(true);
      }, 1000);
    } else {
      setTimeout(() => {
        onNavigate("dashboard");
      }, 2200);
    }
  }

  function handleCreditConfirm(amountReceived: number) {
    if (!pendingPayment) return;
    setShowCreditPanel(false);

    const billTotal = pendingPayment.billTotal;
    const dueAmt = Math.max(0, billTotal - amountReceived);
    const customerName = pendingPayment.invoiceData.customerName || "Customer";

    // Build the credit invoice data: override paymentMode + amounts
    const creditInvoiceData: Omit<Invoice, "id" | "invoiceNumber"> = {
      ...pendingPayment.invoiceData,
      paymentMode: "credit",
      paidAmount: amountReceived,
      dueAmount: dueAmt,
    };

    try {
      const { invoice, mergedExisting } = createInvoice(creditInvoiceData);
      if (mergedExisting) {
        toast.warning("⚠️ Same mobile detected — merging customer data");
      }
      addAuditLog(
        "credit_sale_created",
        `Credit sale via counter. Invoice ${invoice.invoiceNumber} — Bill: ${fmtINR(billTotal)}, Received: ${fmtINR(amountReceived)}, Due: ${fmtINR(dueAmt)} — Customer: ${customerName}`,
        invoice.id,
      );

      const msg =
        dueAmt > 0
          ? `Credit sale saved. ${fmtINR(dueAmt)} marked as due for ${customerName}`
          : `Credit sale saved. Fully paid — ${fmtINR(amountReceived)} received.`;
      toast.success(msg, { duration: 5000 });

      setCreatedInvoice(invoice);
      setIsCreditSale(true);
      setCreditDueAmount(dueAmt);
    } catch (err) {
      console.error("[CashCounter] createInvoice (credit) error:", err);
      toast.error("Error saving credit invoice. Please try again.");
      return;
    }

    clearPendingSession(
      (
        pendingPayment.invoiceData as PendingCashPayment["invoiceData"] & {
          draftId?: string;
        }
      ).draftId,
    );

    setConfirmed(true);
    setTimeout(() => {
      setShowShareModal(true);
    }, 1000);
  }

  function handleBack() {
    // Do NOT clear pending data — user may want to resume
    onNavigate("billing");
  }

  /* ── Success screen ── */
  if (confirmed) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center ${
              isCreditSale ? "bg-amber-100" : "bg-green-100"
            }`}
          >
            {isCreditSale ? (
              <CreditCard size={40} className="text-amber-600" />
            ) : (
              <CheckCircle size={40} className="text-green-600" />
            )}
          </div>
          <h2 className="text-xl font-bold text-foreground text-center">
            {isCreditSale
              ? "Credit Sale Saved!"
              : "Invoice & Payment Complete!"}
          </h2>

          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-xs text-center shadow-sm space-y-3">
            {isCreditSale ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Bill
                  </p>
                  <p className="text-2xl font-extrabold text-foreground">
                    {fmtINR(billAmountNum)}
                  </p>
                </div>
                {createdInvoice && createdInvoice.paidAmount > 0 && (
                  <div className="border-t border-border pt-3">
                    <p className="text-sm text-muted-foreground mb-1">
                      Received Now
                    </p>
                    <p className="text-xl font-extrabold text-green-600">
                      {fmtINR(createdInvoice.paidAmount)}
                    </p>
                  </div>
                )}
                {creditDueAmount > 0 && (
                  <div className="border-t border-border pt-3">
                    <p className="text-sm text-muted-foreground mb-1">
                      Marked as Due
                    </p>
                    <p className="text-4xl font-extrabold text-red-600">
                      {fmtINR(creditDueAmount)}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Bill Amount
                  </p>
                  <p className="text-2xl font-extrabold text-foreground">
                    {fmtINR(billAmountNum)}
                  </p>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-sm text-muted-foreground mb-1">
                    Return to Customer
                  </p>
                  <p className="text-4xl font-extrabold text-green-600">
                    {fmtINR(returnAmt)}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Share/Print action buttons */}
          {createdInvoice && !showShareModal && (
            <div className="w-full max-w-xs flex flex-col gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                data-ocid="cash_success.share.button"
                className="btn-hover w-full h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                }}
              >
                📤 Share / Print Invoice
              </button>
              <Button
                variant="outline"
                data-ocid="cash_success.done.button"
                className="w-full"
                onClick={() => onNavigate("dashboard")}
              >
                Done
              </Button>
            </div>
          )}
          {!createdInvoice && (
            <p className="text-sm text-muted-foreground">
              Returning to dashboard...
            </p>
          )}
        </div>

        {/* Invoice share modal */}
        {createdInvoice && showShareModal && (
          <InvoiceShareModal
            invoice={createdInvoice}
            onClose={() => {
              setShowShareModal(false);
              onNavigate("dashboard");
            }}
          />
        )}
      </>
    );
  }

  /* ── Determine status label & colors ── */
  const statusLabel =
    billAmountNum === 0
      ? null
      : isInsufficient
        ? {
            text: `Short ₹${Math.abs(Math.round(returnAmount)).toLocaleString("en-IN")}`,
            cls: "text-red-600",
          }
        : returnAmount === 0
          ? { text: "Exact ✅", cls: "text-green-600" }
          : { text: `Return ${fmtINR(returnAmount)}`, cls: "text-blue-600" };

  /* ── STICKY BOTTOM PANEL HEIGHT — grows with credit button ── */
  return (
    <>
      <div
        className="flex flex-col bg-background min-h-screen"
        style={{ paddingBottom: "220px" }}
      >
        {/* ── Sub-header ── */}
        <div className="bg-card border-b border-border px-3 py-2 flex items-center gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors flex-shrink-0"
            aria-label="Back to Billing"
            data-ocid="cash_counter.back.button"
          >
            <ArrowLeft size={16} className="text-muted-foreground" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold text-foreground leading-none">
              💰 Cash Counter
            </h1>
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
              {pendingPayment
                ? `Bill: ${fmtINR(pendingPayment.billTotal)} — Count notes or save as credit`
                : "Count notes and confirm payment"}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {pendingPayment && (
              <div className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
                {fmtINR(pendingPayment.billTotal)}
              </div>
            )}
            <VoiceInputButton
              compact
              onParsed={handleCashVoiceParsed}
              lang={language === "hi" ? "hi-IN" : "en-IN"}
              data-ocid="cash_counter.voice_input.button"
            />
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex flex-col gap-2 px-3 pt-2 max-w-lg mx-auto w-full">
          {/* Bill Amount — compact inline row */}
          <div
            className="bg-card rounded-xl border border-border px-3 py-2 flex items-center gap-3 shadow-sm"
            data-ocid="cash_counter.bill_amount.section"
          >
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              🧾 Bill Amount
              {pendingPayment && (
                <span className="ml-1 text-[10px] font-normal">(auto)</span>
              )}
            </span>
            <div className="relative flex-1">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                ₹
              </span>
              <Input
                id="bill-amount"
                type="number"
                inputMode="decimal"
                min={0}
                placeholder="0"
                value={billAmount}
                onChange={(e) =>
                  setBillAmount(clearLeadingZeros(e.target.value))
                }
                onFocus={(e) => {
                  if (e.target.value === "0") e.target.select();
                }}
                readOnly={!!pendingPayment}
                className={`pl-6 h-8 text-sm font-extrabold border-input focus:border-primary ${
                  pendingPayment ? "bg-muted cursor-not-allowed" : ""
                }`}
                data-ocid="cash_counter.bill_amount.input"
              />
            </div>
            {billAmountNum > 0 && (
              <span
                className={`text-xs font-bold whitespace-nowrap ${statusLabel?.cls ?? "text-muted-foreground"}`}
              >
                {statusLabel?.text}
              </span>
            )}
          </div>

          {/* Denomination Grid — 2 columns */}
          <div
            className="bg-card rounded-xl border border-border overflow-hidden shadow-sm"
            data-ocid="cash_counter.denominations.section"
          >
            {/* Section label */}
            <div className="px-3 py-1.5 border-b border-border/60 flex items-center gap-1.5 bg-muted/30">
              <IndianRupee size={12} className="text-primary" />
              <span className="text-[11px] font-bold text-foreground uppercase tracking-wide">
                Note Count
              </span>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-2 px-2 py-1 bg-muted/20 border-b border-border/30">
              {(["col-a", "col-b"] as const).map((colKey) => (
                <div
                  key={colKey}
                  className="grid grid-cols-3 items-center gap-1 px-1"
                >
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Note
                  </span>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase text-center">
                    Qty
                  </span>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase text-right">
                    Amt
                  </span>
                </div>
              ))}
            </div>

            {/* 2-column grid of denomination rows */}
            <div className="grid grid-cols-2 divide-x divide-border/30">
              {DENOMINATIONS.map((d, idx) => {
                const qty = Number.parseInt(quantities[d.value] || "0", 10);
                const subtotal = Number.isNaN(qty) ? 0 : qty * d.value;
                const isLastOdd =
                  idx === DENOMINATIONS.length - 1 &&
                  DENOMINATIONS.length % 2 !== 0;
                return (
                  <div
                    key={d.value}
                    className={`grid grid-cols-3 items-center px-2 py-1.5 gap-1 border-b border-border/20 ${isLastOdd ? "col-span-2" : ""}`}
                    data-ocid={`cash_counter.denom_${d.value}.row`}
                  >
                    {/* Denomination badge */}
                    <div
                      className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-md border text-xs font-extrabold text-foreground w-fit ${d.color}`}
                    >
                      {d.label}
                    </div>

                    {/* Quantity input */}
                    <div className="flex justify-center">
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        placeholder="0"
                        value={quantities[d.value]}
                        onChange={(e) =>
                          handleQtyChange(d.value, e.target.value)
                        }
                        onFocus={(e) => {
                          if (e.target.value === "0") e.target.select();
                        }}
                        className="w-14 h-7 text-center text-sm font-bold border-input focus:border-primary p-0"
                        data-ocid={`cash_counter.denom_${d.value}.input`}
                      />
                    </div>

                    {/* Subtotal */}
                    <div className="text-right">
                      <span
                        className={`text-xs font-bold ${
                          subtotal > 0
                            ? "text-foreground"
                            : "text-muted-foreground/40"
                        }`}
                      >
                        {subtotal > 0
                          ? `₹${subtotal.toLocaleString("en-IN")}`
                          : "—"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── STICKY BOTTOM PANEL ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
        data-ocid="cash_counter.summary.section"
      >
        <div className="max-w-lg mx-auto px-3 pt-2 pb-3">
          {/* Summary row — compact 3-column */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            {/* Total Cash */}
            <div className="flex flex-col items-center bg-muted/40 rounded-lg px-2 py-1.5">
              <span className="text-[10px] text-muted-foreground font-medium leading-none mb-0.5">
                Cash In
              </span>
              <span
                className="text-sm font-extrabold text-green-600 leading-none"
                data-ocid="cash_counter.total_cash.display"
              >
                {totalCash > 0 ? `₹${totalCash.toLocaleString("en-IN")}` : "₹0"}
              </span>
            </div>

            {/* Bill Amount */}
            <div className="flex flex-col items-center bg-muted/40 rounded-lg px-2 py-1.5">
              <span className="text-[10px] text-muted-foreground font-medium leading-none mb-0.5">
                Bill
              </span>
              <span
                className="text-sm font-extrabold text-foreground leading-none"
                data-ocid="cash_counter.bill_display"
              >
                {billAmountNum > 0
                  ? `₹${Math.round(billAmountNum).toLocaleString("en-IN")}`
                  : "—"}
              </span>
            </div>

            {/* Return / Short */}
            <div
              className={`flex flex-col items-center rounded-lg px-2 py-1.5 ${
                isInsufficient
                  ? "bg-red-50 border border-red-200"
                  : returnAmount > 0 && billAmountNum > 0
                    ? "bg-blue-50 border border-blue-200"
                    : returnAmount === 0 && billAmountNum > 0
                      ? "bg-green-50 border border-green-200"
                      : "bg-muted/40"
              }`}
            >
              <span className="text-[10px] font-medium leading-none mb-0.5 text-muted-foreground">
                {isInsufficient ? "Short" : "Return"}
              </span>
              <span
                className={`text-sm font-extrabold leading-none ${
                  isInsufficient
                    ? "text-red-600"
                    : returnAmount > 0 && billAmountNum > 0
                      ? "text-blue-600"
                      : returnAmount === 0 && billAmountNum > 0
                        ? "text-green-600"
                        : "text-muted-foreground/50"
                }`}
                data-ocid="cash_counter.return_amount.display"
              >
                {billAmountNum > 0
                  ? `₹${Math.abs(Math.round(returnAmount)).toLocaleString("en-IN")}`
                  : "—"}
              </span>
            </div>
          </div>

          {/* Confirm button */}
          <Button
            size="lg"
            onClick={handleConfirm}
            disabled={!isReady}
            className="w-full h-11 text-sm font-bold rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            data-ocid="cash_counter.confirm.button"
          >
            <CheckCircle size={16} className="mr-1.5 flex-shrink-0" />
            {pendingPayment
              ? "Confirm Payment & Save Invoice"
              : "Collect Payment"}
            {isReady && (
              <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {fmtINR(billAmountNum)}
              </span>
            )}
          </Button>

          {/* Helper text */}
          {!isReady && (
            <p className="text-center text-[10px] text-muted-foreground mt-1">
              {totalCash === 0
                ? "Enter note quantities above"
                : billAmountNum === 0
                  ? "Enter Bill Amount above"
                  : isInsufficient
                    ? `Need ₹${Math.abs(Math.round(returnAmount)).toLocaleString("en-IN")} more`
                    : ""}
            </p>
          )}

          {/* ── Save as Credit — only when there's a pending invoice ── */}
          {pendingPayment && (
            <>
              <div className="relative flex items-center my-2">
                <div className="flex-1 border-t border-border/50" />
                <span className="mx-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                  or
                </span>
                <div className="flex-1 border-t border-border/50" />
              </div>

              <button
                type="button"
                onClick={() => setShowCreditPanel(true)}
                className="w-full h-10 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                data-ocid="cash_counter.save_as_credit.button"
              >
                <CreditCard size={14} className="flex-shrink-0" />
                Save as Credit
                <span className="text-amber-600 font-normal">
                  · Collect partial or no payment
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Credit Panel Overlay ── */}
      {showCreditPanel && pendingPayment && (
        <CreditPanel
          billTotal={pendingPayment.billTotal}
          customerName={pendingPayment.invoiceData.customerName || ""}
          onConfirm={handleCreditConfirm}
          onClose={() => setShowCreditPanel(false)}
        />
      )}
    </>
  );
}
