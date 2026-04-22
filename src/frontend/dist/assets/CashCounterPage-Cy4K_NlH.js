import { l as useStore, J as useLanguage, r as reactExports, j as jsxRuntimeExports, a1 as CreditCard, D as CircleCheckBig, B as Button, a2 as ArrowLeft, I as Input, y as ue, X } from "./index-Bt77HP0S.js";
import { I as InvoiceShareModal } from "./InvoiceShareModal-DB_zEeS2.js";
import { V as VoiceInputButton } from "./VoiceInputButton-DuroF9ub.js";
import { c as clearLeadingZeros } from "./numberInput-BP2ScP3W.js";
import { I as IndianRupee } from "./indian-rupee-DZuHNpmw.js";
import "./printer-CuzNdr5X.js";
const DENOMINATIONS = [
  { value: 500, label: "₹500", color: "bg-yellow-50 border-yellow-200" },
  { value: 200, label: "₹200", color: "bg-green-50 border-green-200" },
  { value: 100, label: "₹100", color: "bg-blue-50 border-blue-200" },
  { value: 50, label: "₹50", color: "bg-purple-50 border-purple-200" },
  { value: 20, label: "₹20", color: "bg-orange-50 border-orange-200" },
  { value: 10, label: "₹10", color: "bg-red-50 border-red-200" }
];
const PENDING_CASH_KEY = "pending_cash_invoice";
function fmtINR(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Math.round(n));
}
function CreditPanel({
  billTotal,
  customerName,
  onConfirm,
  onClose
}) {
  const [received, setReceived] = reactExports.useState("0");
  const inputRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    setTimeout(() => {
      var _a;
      return (_a = inputRef.current) == null ? void 0 : _a.focus();
    }, 80);
  }, []);
  const receivedNum = reactExports.useMemo(() => {
    const v = Number.parseFloat(received);
    return Number.isNaN(v) ? 0 : Math.min(v, billTotal);
  }, [received, billTotal]);
  const dueNum = Math.max(0, billTotal - receivedNum);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-end justify-center",
      style: { backgroundColor: "rgba(0,0,0,0.45)" },
      "data-ocid": "credit_panel.overlay",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            role: "button",
            tabIndex: -1,
            className: "absolute inset-0",
            onClick: onClose,
            onKeyDown: (e) => {
              if (e.key === "Escape") onClose();
            },
            "aria-label": "Close credit panel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "relative bg-card rounded-t-2xl shadow-2xl w-full max-w-lg border-t border-border animate-slide-up",
            onClick: (e) => e.stopPropagation(),
            "data-ocid": "credit_panel.container",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 pt-4 pb-3 border-b border-border", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { size: 16, className: "text-amber-600" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-foreground leading-none", children: "Save as Credit" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-0.5", children: "Collect partial or no payment now" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: onClose,
                    "aria-label": "Close",
                    className: "w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors",
                    "data-ocid": "credit_panel.close.button",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 16, className: "text-muted-foreground" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-4 space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "label",
                    {
                      htmlFor: "credit-received",
                      className: "block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide",
                      children: "Amount Received Now (₹) — optional"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground", children: "₹" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        id: "credit-received",
                        ref: inputRef,
                        type: "number",
                        inputMode: "decimal",
                        min: 0,
                        max: billTotal,
                        placeholder: "0",
                        value: received,
                        onChange: (e) => setReceived(clearLeadingZeros(e.target.value)),
                        onFocus: (e) => {
                          if (e.target.value === "0") e.target.select();
                        },
                        className: "pl-7 h-10 text-sm font-bold border-input focus:border-primary",
                        "data-ocid": "credit_panel.received_amount.input"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "rounded-xl border border-border bg-muted/30 overflow-hidden",
                    "data-ocid": "credit_panel.summary.section",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 divide-x divide-border", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center px-3 py-3", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground font-medium leading-none mb-1", children: "Total Bill" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-extrabold text-foreground leading-none", children: fmtINR(billTotal) })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center px-3 py-3", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground font-medium leading-none mb-1", children: "Received" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-extrabold text-green-600 leading-none", children: fmtINR(receivedNum) })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "div",
                        {
                          className: `flex flex-col items-center px-3 py-3 ${dueNum > 0 ? "bg-red-50/60" : "bg-green-50/60"}`,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground font-medium leading-none mb-1", children: "Due" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "span",
                              {
                                className: `text-sm font-extrabold leading-none ${dueNum > 0 ? "text-red-600" : "text-green-600"}`,
                                children: fmtINR(dueNum)
                              }
                            )
                          ]
                        }
                      )
                    ] })
                  }
                ),
                dueNum > 0 && customerName && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground text-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-red-600", children: fmtINR(dueNum) }),
                  " ",
                  "will be marked as due for",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: customerName })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "lg",
                    onClick: () => onConfirm(receivedNum),
                    className: "w-full h-11 text-sm font-bold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white",
                    "data-ocid": "credit_panel.confirm.button",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { size: 16, className: "mr-1.5 flex-shrink-0" }),
                      "Confirm Credit Sale",
                      dueNum > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs", children: [
                        "Due: ",
                        fmtINR(dueNum)
                      ] })
                    ]
                  }
                )
              ] })
            ]
          }
        )
      ]
    }
  );
}
function CashCounterPage({ onNavigate }) {
  const { addAuditLog, createInvoice, markDraftCompleted } = useStore();
  const { t, language } = useLanguage();
  const [pendingPayment, setPendingPayment] = reactExports.useState(null);
  reactExports.useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PENDING_CASH_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setPendingPayment(parsed);
        setBillAmount(String(Math.round(parsed.billTotal)));
      }
    } catch (_) {
    }
  }, []);
  const [quantities, setQuantities] = reactExports.useState(
    Object.fromEntries(DENOMINATIONS.map((d) => [d.value, ""]))
  );
  const [billAmount, setBillAmount] = reactExports.useState("");
  const [confirmed, setConfirmed] = reactExports.useState(false);
  const [returnAmt, setReturnAmt] = reactExports.useState(0);
  const [createdInvoice, setCreatedInvoice] = reactExports.useState(null);
  const [showShareModal, setShowShareModal] = reactExports.useState(false);
  const [showCreditPanel, setShowCreditPanel] = reactExports.useState(false);
  const [isCreditSale, setIsCreditSale] = reactExports.useState(false);
  const [creditDueAmount, setCreditDueAmount] = reactExports.useState(0);
  const handleCashVoiceParsed = (parsed) => {
    if (parsed.price !== null) {
      ue.info(`${t("Detected payment amount")}: ₹${parsed.price}`);
    } else {
      ue.success(t("Voice input applied — please review and save"));
    }
  };
  const totalCash = reactExports.useMemo(() => {
    return DENOMINATIONS.reduce((sum, d) => {
      const qty = Number.parseInt(quantities[d.value] || "0", 10);
      return sum + (Number.isNaN(qty) ? 0 : qty * d.value);
    }, 0);
  }, [quantities]);
  const billAmountNum = reactExports.useMemo(() => {
    const v = Number.parseFloat(billAmount);
    return Number.isNaN(v) ? 0 : v;
  }, [billAmount]);
  const returnAmount = totalCash - billAmountNum;
  const isInsufficient = billAmountNum > 0 && returnAmount < 0;
  const isReady = totalCash > 0 && billAmountNum > 0 && !isInsufficient;
  function handleQtyChange(denom, value) {
    const cleaned = clearLeadingZeros(value);
    if (cleaned === "" || /^\d+$/.test(cleaned)) {
      setQuantities((prev) => ({ ...prev, [denom]: cleaned }));
    }
  }
  function clearPendingSession(draftId) {
    try {
      sessionStorage.removeItem(PENDING_CASH_KEY);
    } catch (_) {
    }
    if (draftId) {
      try {
        markDraftCompleted(draftId);
      } catch (_) {
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
          pendingPayment.invoiceData
        );
        if (mergedExisting) {
          ue.warning("⚠️ Same mobile detected — merging customer data");
        }
        addAuditLog(
          "cash_counter_payment",
          `Cash payment via counter. Invoice ${invoice.invoiceNumber} — Bill: ${fmtINR(billAmountNum)}, Cash: ${fmtINR(totalCash)}, Return: ${fmtINR(finalReturn)}`,
          invoice.id
        );
        ue.success(`Invoice ${invoice.invoiceNumber} — Payment done!`);
        setCreatedInvoice(invoice);
      } catch (err) {
        console.error("[CashCounter] createInvoice error:", err);
        ue.error("Error saving invoice. Please try again.");
        return;
      }
      clearPendingSession(
        pendingPayment.invoiceData.draftId
      );
    } else {
      addAuditLog(
        "cash_counter_payment",
        `Cash payment collected. Bill: ${fmtINR(billAmountNum)}, Cash received: ${fmtINR(totalCash)}, Return: ${fmtINR(finalReturn)}`
      );
      ue.success(`Payment confirmed! Return: ${fmtINR(finalReturn)}`);
    }
    setConfirmed(true);
    if (pendingPayment) {
      setTimeout(() => {
        setShowShareModal(true);
      }, 1e3);
    } else {
      setTimeout(() => {
        onNavigate("dashboard");
      }, 2200);
    }
  }
  function handleCreditConfirm(amountReceived) {
    if (!pendingPayment) return;
    setShowCreditPanel(false);
    const billTotal = pendingPayment.billTotal;
    const dueAmt = Math.max(0, billTotal - amountReceived);
    const customerName = pendingPayment.invoiceData.customerName || "Customer";
    const creditInvoiceData = {
      ...pendingPayment.invoiceData,
      paymentMode: "credit",
      paidAmount: amountReceived,
      dueAmount: dueAmt
    };
    try {
      const { invoice, mergedExisting } = createInvoice(creditInvoiceData);
      if (mergedExisting) {
        ue.warning("⚠️ Same mobile detected — merging customer data");
      }
      addAuditLog(
        "credit_sale_created",
        `Credit sale via counter. Invoice ${invoice.invoiceNumber} — Bill: ${fmtINR(billTotal)}, Received: ${fmtINR(amountReceived)}, Due: ${fmtINR(dueAmt)} — Customer: ${customerName}`,
        invoice.id
      );
      const msg = dueAmt > 0 ? `Credit sale saved. ${fmtINR(dueAmt)} marked as due for ${customerName}` : `Credit sale saved. Fully paid — ${fmtINR(amountReceived)} received.`;
      ue.success(msg, { duration: 5e3 });
      setCreatedInvoice(invoice);
      setIsCreditSale(true);
      setCreditDueAmount(dueAmt);
    } catch (err) {
      console.error("[CashCounter] createInvoice (credit) error:", err);
      ue.error("Error saving credit invoice. Please try again.");
      return;
    }
    clearPendingSession(
      pendingPayment.invoiceData.draftId
    );
    setConfirmed(true);
    setTimeout(() => {
      setShowShareModal(true);
    }, 1e3);
  }
  function handleBack() {
    onNavigate("billing");
  }
  if (confirmed) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `w-20 h-20 rounded-full flex items-center justify-center ${isCreditSale ? "bg-amber-100" : "bg-green-100"}`,
            children: isCreditSale ? /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { size: 40, className: "text-amber-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { size: 40, className: "text-green-600" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-foreground text-center", children: isCreditSale ? "Credit Sale Saved!" : "Invoice & Payment Complete!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card rounded-2xl border border-border p-6 w-full max-w-xs text-center shadow-sm space-y-3", children: isCreditSale ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Total Bill" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-extrabold text-foreground", children: fmtINR(billAmountNum) })
          ] }),
          createdInvoice && createdInvoice.paidAmount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border pt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Received Now" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-extrabold text-green-600", children: fmtINR(createdInvoice.paidAmount) })
          ] }),
          creditDueAmount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border pt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Marked as Due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-4xl font-extrabold text-red-600", children: fmtINR(creditDueAmount) })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Bill Amount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-extrabold text-foreground", children: fmtINR(billAmountNum) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border pt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Return to Customer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-4xl font-extrabold text-green-600", children: fmtINR(returnAmt) })
          ] })
        ] }) }),
        createdInvoice && !showShareModal && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-xs flex flex-col gap-2 mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowShareModal(true),
              "data-ocid": "cash_success.share.button",
              className: "btn-hover w-full h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white",
              style: {
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
              },
              children: "📤 Share / Print Invoice"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              "data-ocid": "cash_success.done.button",
              className: "w-full",
              onClick: () => onNavigate("dashboard"),
              children: "Done"
            }
          )
        ] }),
        !createdInvoice && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Returning to dashboard..." })
      ] }),
      createdInvoice && showShareModal && /* @__PURE__ */ jsxRuntimeExports.jsx(
        InvoiceShareModal,
        {
          invoice: createdInvoice,
          onClose: () => {
            setShowShareModal(false);
            onNavigate("dashboard");
          }
        }
      )
    ] });
  }
  const statusLabel = billAmountNum === 0 ? null : isInsufficient ? {
    text: `Short ₹${Math.abs(Math.round(returnAmount)).toLocaleString("en-IN")}`,
    cls: "text-red-600"
  } : returnAmount === 0 ? { text: "Exact ✅", cls: "text-green-600" } : { text: `Return ${fmtINR(returnAmount)}`, cls: "text-blue-600" };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-col bg-background min-h-screen",
        style: { paddingBottom: "220px" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border-b border-border px-3 py-2 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: handleBack,
                className: "w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors flex-shrink-0",
                "aria-label": "Back to Billing",
                "data-ocid": "cash_counter.back.button",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 16, className: "text-muted-foreground" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-sm font-bold text-foreground leading-none", children: "💰 Cash Counter" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5 truncate", children: pendingPayment ? `Bill: ${fmtINR(pendingPayment.billTotal)} — Count notes or save as credit` : "Count notes and confirm payment" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-shrink-0", children: [
              pendingPayment && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap", children: fmtINR(pendingPayment.billTotal) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                VoiceInputButton,
                {
                  compact: true,
                  onParsed: handleCashVoiceParsed,
                  lang: language === "hi" ? "hi-IN" : "en-IN",
                  "data-ocid": "cash_counter.voice_input.button"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 px-3 pt-2 max-w-lg mx-auto w-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "bg-card rounded-xl border border-border px-3 py-2 flex items-center gap-3 shadow-sm",
                "data-ocid": "cash_counter.bill_amount.section",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-muted-foreground whitespace-nowrap", children: [
                    "🧾 Bill Amount",
                    pendingPayment && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-[10px] font-normal", children: "(auto)" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-2 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground", children: "₹" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        id: "bill-amount",
                        type: "number",
                        inputMode: "decimal",
                        min: 0,
                        placeholder: "0",
                        value: billAmount,
                        onChange: (e) => setBillAmount(clearLeadingZeros(e.target.value)),
                        onFocus: (e) => {
                          if (e.target.value === "0") e.target.select();
                        },
                        readOnly: !!pendingPayment,
                        className: `pl-6 h-8 text-sm font-extrabold border-input focus:border-primary ${pendingPayment ? "bg-muted cursor-not-allowed" : ""}`,
                        "data-ocid": "cash_counter.bill_amount.input"
                      }
                    )
                  ] }),
                  billAmountNum > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: `text-xs font-bold whitespace-nowrap ${(statusLabel == null ? void 0 : statusLabel.cls) ?? "text-muted-foreground"}`,
                      children: statusLabel == null ? void 0 : statusLabel.text
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "bg-card rounded-xl border border-border overflow-hidden shadow-sm",
                "data-ocid": "cash_counter.denominations.section",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-1.5 border-b border-border/60 flex items-center gap-1.5 bg-muted/30", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(IndianRupee, { size: 12, className: "text-primary" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold text-foreground uppercase tracking-wide", children: "Note Count" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 px-2 py-1 bg-muted/20 border-b border-border/30", children: ["col-a", "col-b"].map((colKey) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "grid grid-cols-3 items-center gap-1 px-1",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold text-muted-foreground uppercase", children: "Note" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold text-muted-foreground uppercase text-center", children: "Qty" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold text-muted-foreground uppercase text-right", children: "Amt" })
                      ]
                    },
                    colKey
                  )) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 divide-x divide-border/30", children: DENOMINATIONS.map((d, idx) => {
                    const qty = Number.parseInt(quantities[d.value] || "0", 10);
                    const subtotal = Number.isNaN(qty) ? 0 : qty * d.value;
                    const isLastOdd = idx === DENOMINATIONS.length - 1 && DENOMINATIONS.length % 2 !== 0;
                    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        className: `grid grid-cols-3 items-center px-2 py-1.5 gap-1 border-b border-border/20 ${isLastOdd ? "col-span-2" : ""}`,
                        "data-ocid": `cash_counter.denom_${d.value}.row`,
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "div",
                            {
                              className: `inline-flex items-center justify-center px-1.5 py-0.5 rounded-md border text-xs font-extrabold text-foreground w-fit ${d.color}`,
                              children: d.label
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Input,
                            {
                              type: "number",
                              inputMode: "numeric",
                              min: 0,
                              placeholder: "0",
                              value: quantities[d.value],
                              onChange: (e) => handleQtyChange(d.value, e.target.value),
                              onFocus: (e) => {
                                if (e.target.value === "0") e.target.select();
                              },
                              className: "w-14 h-7 text-center text-sm font-bold border-input focus:border-primary p-0",
                              "data-ocid": `cash_counter.denom_${d.value}.input`
                            }
                          ) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "span",
                            {
                              className: `text-xs font-bold ${subtotal > 0 ? "text-foreground" : "text-muted-foreground/40"}`,
                              children: subtotal > 0 ? `₹${subtotal.toLocaleString("en-IN")}` : "—"
                            }
                          ) })
                        ]
                      },
                      d.value
                    );
                  }) })
                ]
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)]",
        "data-ocid": "cash_counter.summary.section",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-lg mx-auto px-3 pt-2 pb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center bg-muted/40 rounded-lg px-2 py-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground font-medium leading-none mb-0.5", children: "Cash In" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "text-sm font-extrabold text-green-600 leading-none",
                  "data-ocid": "cash_counter.total_cash.display",
                  children: totalCash > 0 ? `₹${totalCash.toLocaleString("en-IN")}` : "₹0"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center bg-muted/40 rounded-lg px-2 py-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground font-medium leading-none mb-0.5", children: "Bill" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "text-sm font-extrabold text-foreground leading-none",
                  "data-ocid": "cash_counter.bill_display",
                  children: billAmountNum > 0 ? `₹${Math.round(billAmountNum).toLocaleString("en-IN")}` : "—"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: `flex flex-col items-center rounded-lg px-2 py-1.5 ${isInsufficient ? "bg-red-50 border border-red-200" : returnAmount > 0 && billAmountNum > 0 ? "bg-blue-50 border border-blue-200" : returnAmount === 0 && billAmountNum > 0 ? "bg-green-50 border border-green-200" : "bg-muted/40"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-medium leading-none mb-0.5 text-muted-foreground", children: isInsufficient ? "Short" : "Return" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: `text-sm font-extrabold leading-none ${isInsufficient ? "text-red-600" : returnAmount > 0 && billAmountNum > 0 ? "text-blue-600" : returnAmount === 0 && billAmountNum > 0 ? "text-green-600" : "text-muted-foreground/50"}`,
                      "data-ocid": "cash_counter.return_amount.display",
                      children: billAmountNum > 0 ? `₹${Math.abs(Math.round(returnAmount)).toLocaleString("en-IN")}` : "—"
                    }
                  )
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "lg",
              onClick: handleConfirm,
              disabled: !isReady,
              className: "w-full h-11 text-sm font-bold rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white disabled:opacity-50 disabled:cursor-not-allowed",
              "data-ocid": "cash_counter.confirm.button",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { size: 16, className: "mr-1.5 flex-shrink-0" }),
                pendingPayment ? "Confirm Payment & Save Invoice" : "Collect Payment",
                isReady && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs", children: fmtINR(billAmountNum) })
              ]
            }
          ),
          !isReady && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-[10px] text-muted-foreground mt-1", children: totalCash === 0 ? "Enter note quantities above" : billAmountNum === 0 ? "Enter Bill Amount above" : isInsufficient ? `Need ₹${Math.abs(Math.round(returnAmount)).toLocaleString("en-IN")} more` : "" }),
          pendingPayment && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center my-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 border-t border-border/50" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wide", children: "or" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 border-t border-border/50" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => setShowCreditPanel(true),
                className: "w-full h-10 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors",
                "data-ocid": "cash_counter.save_as_credit.button",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { size: 14, className: "flex-shrink-0" }),
                  "Save as Credit",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-600 font-normal", children: "· Collect partial or no payment" })
                ]
              }
            )
          ] })
        ] })
      }
    ),
    showCreditPanel && pendingPayment && /* @__PURE__ */ jsxRuntimeExports.jsx(
      CreditPanel,
      {
        billTotal: pendingPayment.billTotal,
        customerName: pendingPayment.invoiceData.customerName || "",
        onConfirm: handleCreditConfirm,
        onClose: () => setShowCreditPanel(false)
      }
    )
  ] });
}
export {
  CashCounterPage
};
