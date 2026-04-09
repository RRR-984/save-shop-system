import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle, IndianRupee } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useStore } from "../context/StoreContext";
import type { Invoice, InvoiceItem, NavPage } from "../types/store";
import { clearLeadingZeros } from "../utils/numberInput";

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

export function CashCounterPage({ onNavigate }: CashCounterPageProps) {
  const { addAuditLog, createInvoice } = useStore();

  // Read pending cash payment from sessionStorage (set by BillingPage)
  const [pendingPayment, setPendingPayment] =
    useState<PendingCashPayment | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PENDING_CASH_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PendingCashPayment;
        setPendingPayment(parsed);
        // Pre-fill bill amount from pending payment
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

  function handleConfirm() {
    if (!isReady) return;

    const finalReturn = returnAmount;
    setReturnAmt(finalReturn);

    if (pendingPayment) {
      // Complete the invoice from BillingPage pending data
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
      } catch (err) {
        console.error("[CashCounter] createInvoice error:", err);
        toast.error("Invoice save karne mein error aaya. Try again.");
        return;
      }
      // Clear pending payment
      try {
        sessionStorage.removeItem(PENDING_CASH_KEY);
      } catch (_) {
        /* ignore */
      }
    } else {
      // Standalone cash counter (no pending invoice)
      addAuditLog(
        "cash_counter_payment",
        `Cash payment collected. Bill: ${fmtINR(billAmountNum)}, Cash received: ${fmtINR(totalCash)}, Return: ${fmtINR(finalReturn)}`,
      );
      toast.success(`Payment confirmed! Return: ${fmtINR(finalReturn)}`);
    }

    setConfirmed(true);
    setTimeout(() => {
      onNavigate("dashboard");
    }, 2200);
  }

  function handleBack() {
    // Clear pending payment if user goes back — so billing can re-enter
    try {
      sessionStorage.removeItem(PENDING_CASH_KEY);
    } catch (_) {
      /* ignore */
    }
    onNavigate("billing");
  }

  if (confirmed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {pendingPayment ? "Invoice & Payment Complete!" : "Payment Complete!"}
        </h2>
        <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-xs text-center shadow-sm space-y-3">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Bill Amount</p>
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
        </div>
        <p className="text-sm text-muted-foreground">
          Dashboard pe wapas ja raha hai...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-background pb-28 min-h-screen">
      {/* Sub-header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
          aria-label="Back to Billing"
          data-ocid="cash_counter.back.button"
        >
          <ArrowLeft size={18} className="text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-base font-bold text-foreground leading-none">
            💰 Cash Counter
          </h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {pendingPayment
              ? `Bill: ${fmtINR(pendingPayment.billTotal)} — Notes gin ke confirm karein`
              : "Notes gin ke payment confirm karein"}
          </p>
        </div>
        {pendingPayment && (
          <div className="ml-auto bg-primary/10 text-primary text-sm font-bold px-3 py-1.5 rounded-full">
            {fmtINR(pendingPayment.billTotal)}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 px-3 pt-4 max-w-lg mx-auto w-full">
        {/* Denomination Input Table */}
        <div
          className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm"
          data-ocid="cash_counter.denominations.section"
        >
          <div className="px-4 py-3 border-b border-border/60 flex items-center gap-2">
            <IndianRupee size={15} className="text-primary" />
            <span className="text-sm font-bold text-foreground">
              Note Count
            </span>
          </div>

          {/* Header row */}
          <div className="grid grid-cols-3 items-center px-4 py-2 bg-muted/40 border-b border-border/40">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Note
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide text-center">
              Quantity
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide text-right">
              Amount
            </span>
          </div>

          <div className="divide-y divide-border/40">
            {DENOMINATIONS.map((d) => {
              const qty = Number.parseInt(quantities[d.value] || "0", 10);
              const subtotal = Number.isNaN(qty) ? 0 : qty * d.value;
              return (
                <div
                  key={d.value}
                  className="grid grid-cols-3 items-center px-4 py-3 gap-2"
                  data-ocid={`cash_counter.denom_${d.value}.row`}
                >
                  {/* Denomination label */}
                  <div
                    className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg border text-sm font-extrabold text-foreground w-fit ${d.color}`}
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
                      onChange={(e) => handleQtyChange(d.value, e.target.value)}
                      onFocus={(e) => {
                        if (e.target.value === "0") e.target.select();
                      }}
                      className="w-20 h-9 text-center text-base font-bold border-input focus:border-primary"
                      data-ocid={`cash_counter.denom_${d.value}.input`}
                    />
                  </div>

                  {/* Subtotal */}
                  <div className="text-right">
                    <span
                      className={`text-sm font-bold ${
                        subtotal > 0
                          ? "text-foreground"
                          : "text-muted-foreground/50"
                      }`}
                    >
                      {subtotal > 0 ? fmtINR(subtotal) : "—"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bill Amount input — locked if coming from BillingPage */}
        <div
          className="bg-card rounded-2xl border border-border p-4 shadow-sm"
          data-ocid="cash_counter.bill_amount.section"
        >
          <label
            className="block text-sm font-bold text-foreground mb-2"
            htmlFor="bill-amount"
          >
            🧾 Bill Amount
            {pendingPayment && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                (Billing se auto-filled)
              </span>
            )}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-bold text-muted-foreground">
              ₹
            </span>
            <Input
              id="bill-amount"
              type="number"
              inputMode="decimal"
              min={0}
              placeholder="0"
              value={billAmount}
              onChange={(e) => setBillAmount(clearLeadingZeros(e.target.value))}
              onFocus={(e) => {
                if (e.target.value === "0") e.target.select();
              }}
              readOnly={!!pendingPayment}
              className={`pl-8 h-12 text-xl font-extrabold border-input focus:border-primary ${
                pendingPayment ? "bg-muted cursor-not-allowed" : ""
              }`}
              data-ocid="cash_counter.bill_amount.input"
            />
          </div>
        </div>

        {/* Summary Section */}
        <div
          className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm"
          data-ocid="cash_counter.summary.section"
        >
          <div className="px-4 py-3 border-b border-border/60">
            <span className="text-sm font-bold text-foreground">Summary</span>
          </div>

          <div className="px-4 py-4 flex flex-col gap-3">
            {/* Total Cash Received */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-medium">
                💵 Total Cash Received
              </span>
              <span
                className="text-xl font-extrabold text-green-600"
                data-ocid="cash_counter.total_cash.display"
              >
                {fmtINR(totalCash)}
              </span>
            </div>

            {/* Bill Amount */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-medium">
                🧾 Bill Amount
              </span>
              <span
                className="text-xl font-extrabold text-foreground"
                data-ocid="cash_counter.bill_display"
              >
                {billAmountNum > 0 ? fmtINR(billAmountNum) : "—"}
              </span>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Return Amount */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">
                🔄 Return to Customer
              </span>
              <span
                className={`text-2xl font-extrabold ${
                  isInsufficient
                    ? "text-red-600"
                    : returnAmount > 0
                      ? "text-blue-600"
                      : returnAmount === 0 && billAmountNum > 0
                        ? "text-green-600"
                        : "text-muted-foreground/50"
                }`}
                data-ocid="cash_counter.return_amount.display"
              >
                {billAmountNum > 0
                  ? isInsufficient
                    ? `−${fmtINR(Math.abs(returnAmount))}`
                    : fmtINR(returnAmount)
                  : "—"}
              </span>
            </div>

            {/* Insufficient cash warning */}
            {isInsufficient && (
              <div
                className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                data-ocid="cash_counter.insufficient_warning"
              >
                <span className="text-red-600 text-lg">⚠️</span>
                <div>
                  <p className="text-sm font-bold text-red-700">
                    Cash Insufficient!
                  </p>
                  <p className="text-xs text-red-600">
                    ₹
                    {Math.abs(Math.round(returnAmount)).toLocaleString("en-IN")}{" "}
                    aur cash chahiye
                  </p>
                </div>
              </div>
            )}

            {/* Exact change message */}
            {!isInsufficient && returnAmount === 0 && billAmountNum > 0 && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <CheckCircle
                  size={16}
                  className="text-green-600 flex-shrink-0"
                />
                <p className="text-sm font-semibold text-green-700">
                  Exact change! Wapas dene ki zarurat nahi. ✅
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Confirm Button */}
        <Button
          size="lg"
          onClick={handleConfirm}
          disabled={!isReady}
          className="w-full h-14 text-base font-bold rounded-2xl bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
          data-ocid="cash_counter.confirm.button"
        >
          <CheckCircle size={18} className="mr-2" />
          {pendingPayment
            ? "Payment Confirm & Invoice Save Karein"
            : "Collect Payment"}
          {isReady && (
            <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-sm">
              {fmtINR(billAmountNum)}
            </span>
          )}
        </Button>

        {!isReady && (
          <p className="text-center text-xs text-muted-foreground">
            {totalCash === 0
              ? "Notes ki quantity daalen"
              : billAmountNum === 0
                ? "Bill Amount daalen"
                : isInsufficient
                  ? "Cash insufficient hai, aur notes daalen"
                  : ""}
          </p>
        )}
      </div>
    </div>
  );
}
