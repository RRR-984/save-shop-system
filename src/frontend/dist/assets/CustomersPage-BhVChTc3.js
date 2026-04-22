import { c as createLucideIcon, l as useStore, h as useAuth, r as reactExports, Q as getActivityStatus, O as getCustomerTier, j as jsxRuntimeExports, v as Badge, B as Button, m as Plus, y as ue, C as Card, n as CardContent, a6 as Users, a1 as CreditCard, a7 as Bell, D as CircleCheckBig, i as CardHeader, k as CardTitle, H as Search, I as Input, a3 as MessageCircle, Z as ACTIVITY_COLORS, W as TIER_COLORS, U as TIER_EMOJI, a8 as MapPin, w as Pencil, _ as Receipt, $ as Separator, a5 as ShoppingBag, A as TrendingUp, L as Label, Y as ACTIVITY_LABELS, V as TIER_LABELS, T as Table, o as TableHeader, p as TableRow, q as TableHead, s as TableBody, t as TableCell } from "./index-Bt77HP0S.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-NQ0wylTN.js";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-FRlTL3i_.js";
import { U as User } from "./user-C7Fvzg_P.js";
import { C as Calendar } from "./calendar-BpcN0eI0.js";
import { I as IndianRupee } from "./indian-rupee-DZuHNpmw.js";
import "./index-Dc2wOXFM.js";
import "./index-BoNbO3VT.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8", key: "1w3rig" }],
  ["path", { d: "M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1", key: "n2jgmb" }],
  ["path", { d: "M2 21h20", key: "1nyx9w" }],
  ["path", { d: "M7 8v3", key: "1qtyvj" }],
  ["path", { d: "M12 8v3", key: "hwp4zt" }],
  ["path", { d: "M17 8v3", key: "1i6e5u" }],
  ["path", { d: "M7 4h.01", key: "1bh4kh" }],
  ["path", { d: "M12 4h.01", key: "1ujb9j" }],
  ["path", { d: "M17 4h.01", key: "1upcoc" }]
];
const Cake = createLucideIcon("cake", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
      key: "1ffxy3"
    }
  ],
  ["path", { d: "m21.854 2.147-10.94 10.939", key: "12cjpa" }]
];
const Send = createLucideIcon("send", __iconNode);
function fmt(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Math.round(n));
}
function getDueBadge(due) {
  if (due <= 0) return null;
  const base = "text-[10px] px-1.5 whitespace-nowrap flex-shrink-0 inline-flex items-center";
  if (due > 5e3) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `bg-red-100 text-red-700 border-red-300 ${base}`, children: "🔴 High Due" });
  }
  if (due > 500) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Badge,
      {
        className: `bg-yellow-100 text-yellow-800 border-yellow-300 ${base}`,
        children: "🟡 Medium Due"
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `bg-green-100 text-green-700 border-green-300 ${base}`, children: "🟢 Low Due" });
}
function ActivityBadge({ status }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `text-[10px] px-1.5 border ${ACTIVITY_COLORS[status]}`, children: ACTIVITY_LABELS[status] });
}
function TierBadge({ tier }) {
  if (tier === "normal") return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: `text-[10px] px-1.5 border ${TIER_COLORS[tier]}`, children: [
    TIER_EMOJI[tier],
    " ",
    TIER_LABELS[tier]
  ] });
}
function ReminderConfirmDialog({
  ledger,
  mode,
  open,
  onClose,
  onConfirm,
  shopName
}) {
  const preview = `Hello ${ledger.customerName},
You have an outstanding balance of ₹${Math.round(ledger.totalDue).toLocaleString("en-IN")}.

Kindly make the payment at your earliest convenience.

Thank you 🙏
${shopName}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      className: "max-w-sm",
      "data-ocid": "customers.reminder_confirm.dialog",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { size: 18, className: "text-green-600" }),
          mode === "send" ? "Send Reminder" : "Send Reminder Request"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-secondary/60 p-3 text-sm space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-foreground", children: ledger.customerName }),
            ledger.customerMobile && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              "📱 ",
              ledger.customerMobile
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between mt-2 pt-2 border-t border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Due Amount:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-red-600", children: fmt(ledger.totalDue) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-green-50 border border-green-200 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-green-700 mb-1", children: "Message Preview:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-800 whitespace-pre-line leading-relaxed", children: preview })
          ] }),
          mode === "request" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-amber-50 border border-amber-200 p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700", children: "⏳ This will send an approval request to Owner/Manager. Once approved, the WhatsApp message will be sent." }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: onClose,
              "data-ocid": "customers.reminder_confirm.cancel",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              className: mode === "send" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-amber-600 hover:bg-amber-700 text-white",
              onClick: () => {
                onConfirm();
                onClose();
              },
              "data-ocid": "customers.reminder_confirm.submit",
              children: mode === "send" ? "Yes, Send" : "Send Request"
            }
          )
        ] })
      ]
    }
  ) });
}
function ReminderButton({
  ledger,
  currentUser,
  shopName,
  index,
  compact = false
}) {
  var _a;
  const { appConfig, sendReminder, requestReminder, getReminderCountToday } = useStore();
  const [confirmMode, setConfirmMode] = reactExports.useState(
    null
  );
  const hasMobile = !!((_a = ledger.customerMobile) == null ? void 0 : _a.trim());
  const role = currentUser.role;
  if (!hasMobile) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        variant: "outline",
        size: "sm",
        className: `${compact ? "h-6 text-[10px] px-2" : "h-7 text-xs px-2"} opacity-40 cursor-not-allowed`,
        disabled: true,
        title: "Mobile number is not available",
        "data-ocid": `customers.reminder.disabled.${index + 1}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { size: compact ? 10 : 12, className: "mr-1" }),
          "Reminder"
        ]
      }
    );
  }
  if (role === "owner" || role === "manager") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          className: `${compact ? "h-6 text-[10px] px-2" : "h-7 text-xs px-2"} text-green-700 border-green-300 hover:bg-green-50`,
          onClick: () => setConfirmMode("send"),
          title: "Send WhatsApp reminder",
          "data-ocid": `customers.send_reminder.button.${index + 1}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { size: compact ? 10 : 12, className: "mr-1" }),
            "Send Reminder"
          ]
        }
      ),
      confirmMode && /* @__PURE__ */ jsxRuntimeExports.jsx(
        ReminderConfirmDialog,
        {
          ledger,
          mode: confirmMode,
          open: !!confirmMode,
          onClose: () => setConfirmMode(null),
          shopName,
          onConfirm: async () => {
            await sendReminder(ledger, currentUser);
            ue.success(`🔔 Reminder sent to ${ledger.customerName}`);
          }
        }
      )
    ] });
  }
  if (!appConfig.allowStaffReminders) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        variant: "outline",
        size: "sm",
        className: `${compact ? "h-6 text-[10px] px-2" : "h-7 text-xs px-2"} opacity-40 cursor-not-allowed`,
        disabled: true,
        title: "Reminders are disabled by Admin",
        "data-ocid": `customers.reminder.staff_disabled.${index + 1}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { size: compact ? 10 : 12, className: "mr-1" }),
          "Reminder"
        ]
      }
    );
  }
  if (appConfig.staffReminderMode === "simple") {
    const countToday = getReminderCountToday(
      currentUser.id,
      ledger.customerMobile
    );
    const limitReached = countToday >= 2;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          className: `${compact ? "h-6 text-[10px] px-2" : "h-7 text-xs px-2"} ${limitReached ? "opacity-40 cursor-not-allowed" : "text-green-700 border-green-300 hover:bg-green-50"}`,
          disabled: limitReached,
          onClick: () => !limitReached && setConfirmMode("send"),
          title: limitReached ? "Daily limit reached (2/day)" : "Send WhatsApp reminder",
          "data-ocid": `customers.send_reminder.staff.button.${index + 1}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { size: compact ? 10 : 12, className: "mr-1" }),
            limitReached ? "Reminder (Limit Reached)" : "Send Reminder"
          ]
        }
      ),
      confirmMode && /* @__PURE__ */ jsxRuntimeExports.jsx(
        ReminderConfirmDialog,
        {
          ledger,
          mode: "send",
          open: !!confirmMode,
          onClose: () => setConfirmMode(null),
          shopName,
          onConfirm: async () => {
            await sendReminder(ledger, currentUser);
            ue.success(`🔔 Reminder sent to ${ledger.customerName}`);
          }
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        variant: "outline",
        size: "sm",
        className: `${compact ? "h-6 text-[10px] px-2" : "h-7 text-xs px-2"} text-amber-700 border-amber-300 hover:bg-amber-50`,
        onClick: () => setConfirmMode("request"),
        title: "Request approval from Owner/Manager",
        "data-ocid": `customers.request_reminder.button.${index + 1}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { size: compact ? 10 : 12, className: "mr-1" }),
          "Request Reminder"
        ]
      }
    ),
    confirmMode && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ReminderConfirmDialog,
      {
        ledger,
        mode: "request",
        open: !!confirmMode,
        onClose: () => setConfirmMode(null),
        shopName,
        onConfirm: async () => {
          await requestReminder(ledger, currentUser);
          ue.success(
            "✅ Request sent — waiting for Owner/Manager approval"
          );
        }
      }
    )
  ] });
}
function BulkReminderDialog({
  dueCount,
  dueCustomers: dueLedgers,
  open,
  onClose,
  onConfirm
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      className: "max-w-sm",
      "data-ocid": "customers.bulk_reminder.dialog",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 18, className: "text-amber-600" }),
          "Send Payment Reminders"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            "This will open WhatsApp for",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: dueCount }),
            " ",
            "customer",
            dueCount !== 1 ? "s" : "",
            " with pending dues. Do you want to continue?"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-border bg-secondary/40 max-h-52 overflow-y-auto divide-y divide-border", children: dueLedgers.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex items-center justify-between px-3 py-2 text-sm",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground truncate block", children: l.customerName }),
                  l.customerMobile && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                    "📱 ",
                    l.customerMobile
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-red-600 ml-3 flex-shrink-0", children: fmt(l.totalDue) })
              ]
            },
            `${l.customerName}__${l.customerMobile}`
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-amber-50 border border-amber-200 p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700", children: "ℹ️ Each customer's WhatsApp will open in a new tab — allow pop-ups if prompted by your browser." }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: onClose,
              "data-ocid": "customers.bulk_reminder.cancel",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              className: "bg-amber-600 hover:bg-amber-700 text-white",
              onClick: () => {
                onConfirm();
                onClose();
              },
              "data-ocid": "customers.bulk_reminder.send_all",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 13, className: "mr-1.5" }),
                "Send to All"
              ]
            }
          )
        ] })
      ]
    }
  ) });
}
function ReceivePaymentDialog({
  ledger,
  open,
  onClose,
  customerRecord,
  onPaymentReceived
}) {
  const { receivePayment, updateCustomer } = useStore();
  const [amount, setAmount] = reactExports.useState("");
  const [note, setNote] = reactExports.useState("");
  const [payMode, setPayMode] = reactExports.useState("cash");
  const effectiveDue = (customerRecord == null ? void 0 : customerRecord.pendingBalance) != null ? customerRecord.pendingBalance : ledger.totalDue;
  const handleSubmit = () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      ue.error("Please enter a valid amount");
      return;
    }
    if (amt > ledger.totalDue) {
      ue.error(`Outstanding due is only ${fmt(ledger.totalDue)}`);
      return;
    }
    receivePayment(
      "",
      ledger.customerName,
      ledger.customerMobile,
      amt,
      note,
      payMode
    );
    if (customerRecord) {
      const newPending = Math.max(
        0,
        (customerRecord.pendingBalance ?? customerRecord.creditBalance) - amt
      );
      updateCustomer(customerRecord.id, {
        pendingBalance: newPending,
        lastVisit: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    onPaymentReceived == null ? void 0 : onPaymentReceived(amt);
    const newDue = ledger.totalDue - amt;
    if (newDue <= 0) {
      ue.success(
        `✅ ${fmt(amt)} received — ${ledger.customerName}'s account is fully cleared!`
      );
    } else {
      ue.success(
        `✅ ${fmt(amt)} payment received — Remaining due: ${fmt(newDue)}`
      );
    }
    setAmount("");
    setNote("");
    setPayMode("cash");
    onClose();
  };
  const payModes = [
    {
      key: "cash",
      label: "💵 Cash",
      color: "border-border text-foreground hover:bg-muted",
      activeColor: "bg-green-600 text-white border-green-600"
    },
    {
      key: "upi",
      label: "📱 UPI",
      color: "border-border text-foreground hover:bg-muted",
      activeColor: "bg-purple-600 text-white border-purple-600"
    },
    {
      key: "online",
      label: "🌐 Online",
      color: "border-border text-foreground hover:bg-muted",
      activeColor: "bg-cyan-600 text-white border-cyan-600"
    }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      "data-ocid": "customers.receive_payment.dialog",
      className: "max-w-sm",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(IndianRupee, { size: 18, className: "text-green-600" }),
          "Mark as Paid"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-secondary/60 p-3 text-sm space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-foreground", children: ledger.customerName }),
            ledger.customerMobile && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-xs", children: ledger.customerMobile }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between mt-2 pt-2 border-t border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Total Due:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-red-600", children: fmt(effectiveDue) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Payment Mode *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: payModes.map((pm) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                className: `flex-1 py-2 px-2 text-xs font-semibold rounded-lg border transition-colors ${payMode === pm.key ? pm.activeColor : pm.color}`,
                onClick: () => setPayMode(pm.key),
                children: pm.label
              },
              pm.key
            )) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Amount Received (₹) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                "data-ocid": "customers.receive_payment.input",
                type: "number",
                placeholder: `Max: ${fmt(ledger.totalDue)}`,
                value: amount,
                onChange: (e) => setAmount(e.target.value),
                autoFocus: true
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Partial payment allowed — due will reduce accordingly" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Note (optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                "data-ocid": "customers.receive_payment_note.input",
                placeholder: "e.g. Cash received, UPI ref no...",
                value: note,
                onChange: (e) => setNote(e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              "data-ocid": "customers.receive_payment.cancel_button",
              variant: "outline",
              onClick: onClose,
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              "data-ocid": "customers.receive_payment.confirm_button",
              className: "bg-green-600 hover:bg-green-700 text-white",
              onClick: handleSubmit,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(IndianRupee, { size: 14, className: "mr-1.5" }),
                "Mark as Paid"
              ]
            }
          )
        ] })
      ]
    }
  ) });
}
function InvoicesDialog({
  ledger,
  open,
  onClose
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { "data-ocid": "customers.invoices.dialog", className: "max-w-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      ledger.customerName,
      "'s Invoice History"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 text-center text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-secondary/60 p-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Total Purchase" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: fmt(ledger.totalPurchase) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-green-50 p-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Total Paid" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-green-700", children: fmt(ledger.totalPaid) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `rounded-lg p-2 ${ledger.totalDue > 0 ? "bg-red-50" : "bg-green-50"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Total Due" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: `font-bold ${ledger.totalDue > 0 ? "text-red-600" : "text-green-600"}`,
                  children: fmt(ledger.totalDue)
                }
              )
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-72 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-secondary/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Invoice" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Paid" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Mode" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
          ledger.invoices.map((inv) => {
            const due = inv.dueAmount ?? 0;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TableRow,
              {
                className: due > 0 ? "bg-red-50/50" : "bg-green-50/50",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs font-medium", children: inv.invoiceNumber }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: new Date(inv.date).toLocaleDateString("en-IN") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: fmt(inv.totalAmount) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs text-green-700", children: fmt(inv.paidAmount) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: due > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-red-600", children: fmt(due) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600", children: "✓" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Badge,
                    {
                      variant: "outline",
                      className: "text-[10px] capitalize",
                      children: inv.paymentMode
                    }
                  ) })
                ]
              },
              inv.id
            );
          }),
          ledger.invoices.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TableCell,
            {
              colSpan: 6,
              className: "text-center py-6 text-muted-foreground text-sm",
              children: "No invoices yet"
            }
          ) })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        "data-ocid": "customers.invoices.close_button",
        variant: "outline",
        onClick: onClose,
        children: "Close"
      }
    ) })
  ] }) });
}
function AddEditCustomerDialog({
  open,
  onClose,
  existing,
  isProMode
}) {
  const { addCustomer, updateCustomer } = useStore();
  const [name, setName] = reactExports.useState((existing == null ? void 0 : existing.name) ?? "");
  const [mobile, setMobile] = reactExports.useState((existing == null ? void 0 : existing.mobile) ?? "");
  const [address, setAddress] = reactExports.useState((existing == null ? void 0 : existing.address) ?? "");
  const [birthday, setBirthday] = reactExports.useState((existing == null ? void 0 : existing.birthday) ?? "");
  const [lastVisit, setLastVisit] = reactExports.useState(
    (existing == null ? void 0 : existing.lastVisit) ? existing.lastVisit.slice(0, 10) : ""
  );
  const [totalPurchase, setTotalPurchase] = reactExports.useState(
    (existing == null ? void 0 : existing.totalPurchase) != null ? String(existing.totalPurchase) : ""
  );
  const [visitCount, setVisitCount] = reactExports.useState(
    (existing == null ? void 0 : existing.visitCount) != null ? String(existing.visitCount) : ""
  );
  const isEdit = !!existing;
  function handleSubmit() {
    if (!name.trim()) {
      ue.error("Customer name is required");
      return;
    }
    const extra = {
      name: name.trim(),
      mobile: mobile.trim(),
      address: address.trim() || void 0,
      birthday: birthday.trim() || void 0
    };
    if (isProMode) {
      if (lastVisit) extra.lastVisit = new Date(lastVisit).toISOString();
      if (totalPurchase !== "") extra.totalPurchase = Number(totalPurchase);
      if (visitCount !== "") extra.visitCount = Number(visitCount);
    }
    if (isEdit && existing) {
      updateCustomer(existing.id, extra);
      ue.success("Customer updated ✓");
    } else {
      addCustomer({
        name: extra.name,
        mobile: extra.mobile,
        creditBalance: 0,
        address: extra.address,
        birthday: extra.birthday,
        ...isProMode && lastVisit ? { lastVisit: extra.lastVisit } : {},
        ...isProMode && totalPurchase !== "" ? { totalPurchase: Number(totalPurchase) } : {},
        ...isProMode && visitCount !== "" ? { visitCount: Number(visitCount) } : {}
      });
      ue.success("Customer added ✓");
    }
    onClose();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", "data-ocid": "customers.add_edit.dialog", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 16, className: "text-primary" }),
      isEdit ? "Edit Customer" : "Add Customer"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Name *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            "data-ocid": "customers.add_edit.name.input",
            placeholder: "e.g. Ramesh Kumar",
            value: name,
            onChange: (e) => setName(e.target.value),
            autoFocus: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Mobile Number" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            "data-ocid": "customers.add_edit.mobile.input",
            placeholder: "10-digit mobile",
            value: mobile,
            onChange: (e) => setMobile(e.target.value),
            maxLength: 10
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm", children: [
          "Address",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal", children: "(optional)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            "data-ocid": "customers.add_edit.address.input",
            placeholder: "e.g. 12 Main Market, Indore",
            value: address,
            onChange: (e) => setAddress(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Cake, { size: 13, className: "text-pink-500" }),
          "Birthday / Janmdin",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal", children: "(optional)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            "data-ocid": "customers.add_edit.birthday.input",
            type: "date",
            value: birthday,
            onChange: (e) => setBirthday(e.target.value)
          }
        )
      ] }),
      isProMode && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-primary font-semibold uppercase tracking-wider", children: "PRO Tracking Fields" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm", children: [
            "Last Visit Date",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal", children: "(optional)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              "data-ocid": "customers.add_edit.last_visit.input",
              type: "date",
              value: lastVisit,
              onChange: (e) => setLastVisit(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm", children: [
            "Total Purchase (₹)",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal", children: "(optional)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              "data-ocid": "customers.add_edit.total_purchase.input",
              type: "number",
              placeholder: "e.g. 25000",
              value: totalPurchase,
              onChange: (e) => setTotalPurchase(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm", children: [
            "Visit Count",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal", children: "(optional)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              "data-ocid": "customers.add_edit.visit_count.input",
              type: "number",
              placeholder: "e.g. 8",
              value: visitCount,
              onChange: (e) => setVisitCount(e.target.value)
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: onClose,
          "data-ocid": "customers.add_edit.cancel_button",
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          size: "sm",
          onClick: handleSubmit,
          "data-ocid": "customers.add_edit.save_button",
          children: isEdit ? "Save Changes" : "Add Customer"
        }
      )
    ] })
  ] }) });
}
function CustomerCard({
  ledger,
  index,
  shopName,
  currentUser,
  isProMode
}) {
  var _a;
  const { customers } = useStore();
  const [showPayment, setShowPayment] = reactExports.useState(false);
  const [showInvoices, setShowInvoices] = reactExports.useState(false);
  const [showEdit, setShowEdit] = reactExports.useState(false);
  const isPaid = ledger.totalDue === 0;
  const dueBadge = getDueBadge(ledger.totalDue);
  const mobile = (_a = ledger.customerMobile) == null ? void 0 : _a.replace(/\D/g, "");
  const custRecord = customers.find(
    (c) => mobile ? c.mobile.replace(/\D/g, "") === mobile : c.name.trim().toLowerCase() === ledger.customerName.trim().toLowerCase()
  );
  const latestInvoice = ledger.invoices.length > 0 ? ledger.invoices.slice().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0] : null;
  const latestBillNumber = (latestInvoice == null ? void 0 : latestInvoice.invoiceNumber) ?? null;
  const latestBillDate = latestInvoice ? new Date(latestInvoice.date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short"
  }) : null;
  const lastTransactionAmount = (latestInvoice == null ? void 0 : latestInvoice.totalAmount) ?? null;
  const displayAddress = (custRecord == null ? void 0 : custRecord.address) || ledger.customerAddress;
  const activityStatus = getActivityStatus(custRecord == null ? void 0 : custRecord.lastVisit);
  const tier = getCustomerTier(
    (custRecord == null ? void 0 : custRecord.totalPurchase) ?? ledger.totalPurchase
  );
  const pendingAmt = (custRecord == null ? void 0 : custRecord.pendingBalance) != null ? custRecord.pendingBalance : ledger.totalDue;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Card,
      {
        "data-ocid": `customers.item.${index + 1}`,
        className: `shadow-sm transition-colors ${isPaid ? "border-green-200 bg-green-50/30 dark:bg-green-950/10" : ledger.totalDue > 5e3 ? "border-red-300 bg-red-50/30" : "border-orange-200 bg-orange-50/20"}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: `w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative ${isPaid ? "bg-green-100" : "bg-red-100"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      User,
                      {
                        size: 18,
                        className: isPaid ? "text-green-700" : "text-red-700"
                      }
                    ),
                    tier && tier !== "normal" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: `absolute -bottom-0.5 -right-0.5 text-[10px] leading-none ${tier === "vip" ? "text-purple-600" : tier === "gold" ? "text-yellow-600" : "text-slate-500"}`,
                        children: TIER_EMOJI[tier]
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm truncate", children: ledger.customerName }),
                ledger.customerMobile && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: ledger.customerMobile }),
                displayAddress && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground flex items-center gap-1 mt-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    MapPin,
                    {
                      size: 10,
                      className: "flex-shrink-0 text-muted-foreground/70"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: displayAddress })
                ] }),
                (custRecord == null ? void 0 : custRecord.lastVisit) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 9, className: "flex-shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Last visit:",
                    " ",
                    new Date(custRecord.lastVisit).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      }
                    )
                  ] })
                ] }),
                (custRecord == null ? void 0 : custRecord.birthday) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-pink-500 flex items-center gap-1 mt-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Cake, { size: 9, className: "flex-shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Birthday:",
                    " ",
                    (/* @__PURE__ */ new Date(
                      `${custRecord.birthday}T00:00:00`
                    )).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short"
                    })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center gap-1.5 flex-wrap", children: [
                  isPaid ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-100 text-green-700 border-green-300 text-[10px]", children: "✓ Fully Paid" }) : dueBadge,
                  activityStatus && /* @__PURE__ */ jsxRuntimeExports.jsx(ActivityBadge, { status: activityStatus }),
                  tier && /* @__PURE__ */ jsxRuntimeExports.jsx(TierBadge, { tier })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-1.5 flex-shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  className: "h-7 text-xs px-2 text-muted-foreground hover:bg-muted",
                  onClick: () => setShowEdit(true),
                  "data-ocid": `customers.edit_button.${index + 1}`,
                  title: "Edit customer details",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 12, className: "mr-1" }),
                    "Edit"
                  ]
                }
              ),
              !isPaid && /* @__PURE__ */ jsxRuntimeExports.jsx(
                ReminderButton,
                {
                  ledger,
                  currentUser,
                  shopName,
                  index
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  className: "h-7 text-xs px-2 text-blue-600 hover:bg-blue-50",
                  onClick: () => setShowInvoices(true),
                  "data-ocid": `customers.view_invoices.button.${index + 1}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { size: 12, className: "mr-1" }),
                    ledger.invoices.length,
                    " invoices"
                  ]
                }
              ),
              !isPaid && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  className: "h-7 text-xs px-2 bg-green-600 hover:bg-green-700 text-white",
                  onClick: () => setShowPayment(true),
                  "data-ocid": `customers.receive_payment_button.${index + 1}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(IndianRupee, { size: 12, className: "mr-1" }),
                    "Mark as Paid"
                  ]
                }
              )
            ] })
          ] }),
          latestBillNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 px-1 text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: "Bill No:" }),
              " #",
              latestBillNumber
            ] }),
            latestBillDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: "Date:" }),
              " ",
              latestBillDate
            ] }),
            lastTransactionAmount != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: "Last Amt:" }),
              " ",
              fmt(lastTransactionAmount)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "my-3" }),
          isProMode ? (
            /* PRO stats: 4-col with Visit Count + Pending Balance */
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground flex items-center justify-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { size: 10 }),
                  "Total Purchase"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: fmt((custRecord == null ? void 0 : custRecord.totalPurchase) ?? ledger.totalPurchase) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground flex items-center justify-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 10 }),
                  "Visits"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: (custRecord == null ? void 0 : custRecord.visitCount) ?? ledger.invoices.length })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Paid" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold text-green-600", children: fmt(ledger.totalPaid) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Pending" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `text-sm font-bold ${pendingAmt > 0 ? "text-red-600" : "text-green-600"}`,
                    children: fmt(pendingAmt)
                  }
                )
              ] })
            ] })
          ) : (
            /* Simple / Smart stats: 3-col */
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Total Purchase" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: fmt(ledger.totalPurchase) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Paid" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold text-green-600", children: fmt(ledger.totalPaid) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Outstanding Due" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `text-sm font-bold ${ledger.totalDue > 0 ? "text-red-600" : "text-green-600"}`,
                    children: fmt(ledger.totalDue)
                  }
                )
              ] })
            ] })
          )
        ] })
      }
    ),
    showEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(
      AddEditCustomerDialog,
      {
        open: showEdit,
        onClose: () => setShowEdit(false),
        existing: custRecord,
        isProMode
      }
    ),
    showPayment && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ReceivePaymentDialog,
      {
        ledger,
        open: showPayment,
        onClose: () => setShowPayment(false),
        customerRecord: custRecord
      }
    ),
    showInvoices && /* @__PURE__ */ jsxRuntimeExports.jsx(
      InvoicesDialog,
      {
        ledger,
        open: showInvoices,
        onClose: () => setShowInvoices(false)
      }
    )
  ] });
}
function ProFilterBar({
  activityFilter,
  setActivityFilter,
  tierFilter,
  setTierFilter
}) {
  const activityOptions = [
    {
      value: "all",
      label: "All Status",
      color: "border-border text-foreground"
    },
    { value: "active", label: "🟢 Active", color: ACTIVITY_COLORS.active },
    { value: "warm", label: "🟡 Warm", color: ACTIVITY_COLORS.warm },
    { value: "cold", label: "🔵 Cold", color: ACTIVITY_COLORS.cold },
    { value: "lost", label: "🔴 Lost", color: ACTIVITY_COLORS.lost }
  ];
  const tierOptions = [
    { value: "all", label: "All Tiers" },
    { value: "vip", label: "👑 VIP" },
    { value: "gold", label: "🥇 Gold" },
    { value: "silver", label: "🥈 Silver" },
    { value: "normal", label: "👤 Normal" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "rounded-xl border border-border bg-card p-3 space-y-2.5",
      "data-ocid": "customers.pro_filter.panel",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold text-primary uppercase tracking-wider", children: "PRO Filters" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Activity Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: activityOptions.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: `text-[10px] px-2 py-0.5 rounded-full border font-medium transition-colors ${activityFilter === opt.value ? `${opt.color} ring-1 ring-offset-1 ring-primary/30` : "border-border text-muted-foreground hover:bg-muted"}`,
              onClick: () => setActivityFilter(opt.value),
              "data-ocid": `customers.activity_filter.${opt.value}`,
              children: opt.label
            },
            opt.value
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Customer Tier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: tierOptions.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: `text-[10px] px-2 py-0.5 rounded-full border font-medium transition-colors ${tierFilter === opt.value ? opt.value === "all" ? "bg-primary text-primary-foreground border-primary" : `${TIER_COLORS[opt.value]} ring-1 ring-offset-1 ring-primary/30` : "border-border text-muted-foreground hover:bg-muted"}`,
              onClick: () => setTierFilter(opt.value),
              "data-ocid": `customers.tier_filter.${opt.value}`,
              children: opt.label
            },
            opt.value
          )) })
        ] })
      ]
    }
  );
}
function CustomersPage() {
  var _a;
  const {
    invoices,
    getAllCustomerLedgers,
    mergeDuplicateCustomers,
    sendBulkReminder,
    bulkReminderSentAt,
    customers,
    appConfig,
    autoMode
  } = useStore();
  const { currentShop, currentUser } = useAuth();
  const shopName = (currentShop == null ? void 0 : currentShop.name) ?? "Save Shop System";
  const [search, setSearch] = reactExports.useState("");
  const [filter, setFilter] = reactExports.useState("all");
  const [activityFilter, setActivityFilter] = reactExports.useState("all");
  const [tierFilter, setTierFilter] = reactExports.useState("all");
  const [bulkReminderOpen, setBulkReminderOpen] = reactExports.useState(false);
  const [showAddCustomer, setShowAddCustomer] = reactExports.useState(false);
  const isProMode = autoMode === "pro" && (((_a = appConfig.featureFlags) == null ? void 0 : _a.customerTracking) ?? false);
  const allLedgers = getAllCustomerLedgers();
  const filtered = allLedgers.filter((l) => {
    if (filter === "due") return l.totalDue > 0;
    if (filter === "paid") return l.totalDue === 0;
    return true;
  }).filter((l) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return l.customerName.toLowerCase().includes(s) || l.customerMobile.includes(s);
  }).filter((l) => {
    var _a2, _b;
    if (!isProMode) return true;
    if (activityFilter !== "all") {
      const mobile = (_a2 = l.customerMobile) == null ? void 0 : _a2.replace(/\D/g, "");
      const rec = customers.find(
        (c) => mobile ? c.mobile.replace(/\D/g, "") === mobile : c.name.trim().toLowerCase() === l.customerName.trim().toLowerCase()
      );
      const status = getActivityStatus(rec == null ? void 0 : rec.lastVisit);
      if (status !== activityFilter) return false;
    }
    if (tierFilter !== "all") {
      const mobile = (_b = l.customerMobile) == null ? void 0 : _b.replace(/\D/g, "");
      const rec = customers.find(
        (c) => mobile ? c.mobile.replace(/\D/g, "") === mobile : c.name.trim().toLowerCase() === l.customerName.trim().toLowerCase()
      );
      const tier = getCustomerTier((rec == null ? void 0 : rec.totalPurchase) ?? l.totalPurchase);
      if (tier !== tierFilter) return false;
    }
    return true;
  });
  const totalCreditDue = allLedgers.reduce((s, l) => s + l.totalDue, 0);
  const dueCustomers = allLedgers.filter((l) => l.totalDue > 0);
  const paidCustomers = allLedgers.filter((l) => l.totalDue === 0);
  const highDueCustomers = dueCustomers.filter((l) => l.totalDue > 5e3);
  const lastSentDate = bulkReminderSentAt ? new Date(bulkReminderSentAt) : null;
  const minutesSinceLastSent = lastSentDate ? Math.floor((Date.now() - lastSentDate.getTime()) / 6e4) : null;
  const isRecentlySent = minutesSinceLastSent !== null && minutesSinceLastSent < 5;
  const bulkDisabled = dueCustomers.length === 0 || isRecentlySent;
  const bulkButtonTitle = isRecentlySent ? `Sent ${minutesSinceLastSent} min ago — wait before sending again` : dueCustomers.length === 0 ? "No customers with outstanding dues" : `Send WhatsApp reminder to all ${dueCustomers.length} due customers`;
  const user = currentUser ?? {
    id: "unknown",
    name: "Unknown",
    username: "",
    password: "",
    role: "staff",
    shopId: ""
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 md:px-6 pb-6 flex flex-col gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-xl font-bold", children: [
            "Customer Due List",
            isProMode && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "ml-2 text-[10px] bg-purple-100 text-purple-700 border-purple-300", children: "👑 PRO" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: isProMode ? "Customer ledger with tracking, tiers & activity status" : "Customer ledger — total purchase, paid, and outstanding dues" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              className: "text-xs bg-primary hover:bg-primary/90 text-primary-foreground shrink-0",
              onClick: () => setShowAddCustomer(true),
              "data-ocid": "customers.add_customer.button",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 13, className: "mr-1" }),
                "Add Customer"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                className: `text-xs shrink-0 transition-colors ${bulkDisabled ? "opacity-50 cursor-not-allowed bg-amber-200 text-amber-700 border border-amber-300 hover:bg-amber-200" : "bg-amber-500 hover:bg-amber-600 text-white border-0"}`,
                disabled: bulkDisabled,
                title: bulkButtonTitle,
                onClick: () => !bulkDisabled && setBulkReminderOpen(true),
                "data-ocid": "customers.bulk_reminder.button",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 13, className: "mr-1.5" }),
                  "📱 Send Bulk Reminder (",
                  dueCustomers.length,
                  " due)"
                ]
              }
            ),
            isRecentlySent && minutesSinceLastSent !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-amber-600 text-right", children: [
              "Sent ",
              minutesSinceLastSent,
              " min ago — wait before sending again"
            ] }),
            !isRecentlySent && lastSentDate && minutesSinceLastSent !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground text-right", children: [
              "Last sent: ",
              minutesSinceLastSent,
              " min ago"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              className: "text-xs border-amber-400 text-amber-700 hover:bg-amber-50 shrink-0",
              onClick: () => {
                const count = mergeDuplicateCustomers();
                if (count > 0) {
                  ue.success(`✅ ${count} duplicate entries merged`);
                } else {
                  ue.info("No duplicate customers found");
                }
              },
              children: "🔄 Merge Duplicates"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 16, className: "text-blue-600" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Total Customers" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold", children: allLedgers.length })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Card,
          {
            className: `border-border shadow-sm ${totalCreditDue > 0 ? "border-red-300" : "border-green-300"}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3 flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: `w-9 h-9 rounded-lg flex items-center justify-center ${totalCreditDue > 0 ? "bg-red-50" : "bg-green-50"}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    CreditCard,
                    {
                      size: 16,
                      className: totalCreditDue > 0 ? "text-red-600" : "text-green-600"
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Total Outstanding" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `text-base font-bold ${totalCreditDue > 0 ? "text-red-700" : "text-green-600"}`,
                    children: fmt(totalCreditDue)
                  }
                )
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { size: 16, className: "text-red-600" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Due Pending" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold text-red-600", children: dueCustomers.length }),
            highDueCustomers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-red-500", children: [
              highDueCustomers.length,
              " high due (>₹5000)"
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { size: 16, className: "text-green-600" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Fully Paid" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold text-green-600", children: paidCustomers.length })
          ] })
        ] }) })
      ] }),
      dueCustomers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-red-300 bg-red-50/40 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { size: 16, className: "text-red-600" }),
          " 💳 Reminder List — Customers with Outstanding Dues"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
          dueCustomers.slice(0, 8).map((l, lIdx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg bg-card border border-red-100 max-w-full",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 min-w-0 flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground truncate text-sm", children: l.customerName }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-shrink-0 whitespace-nowrap", children: getDueBadge(l.totalDue) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base font-semibold text-red-600 whitespace-nowrap", children: fmt(l.totalDue) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    ReminderButton,
                    {
                      ledger: l,
                      currentUser: user,
                      shopName,
                      index: lIdx,
                      compact: true
                    }
                  )
                ] })
              ]
            },
            `${l.customerName}__${l.customerMobile}`
          )),
          dueCustomers.length > 8 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1 pl-1", children: [
            "+ ",
            dueCustomers.length - 8,
            " more customers have outstanding dues"
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Search,
            {
              className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
              size: 14
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              "data-ocid": "customers.search.input",
              placeholder: "Search customers...",
              value: search,
              onChange: (e) => setSearch(e.target.value),
              className: "pl-9 h-8 text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Tabs,
          {
            value: filter,
            onValueChange: (v) => setFilter(v),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "h-8", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                TabsTrigger,
                {
                  "data-ocid": "customers.all.tab",
                  value: "all",
                  className: "text-xs h-7 px-3",
                  children: [
                    "All (",
                    allLedgers.length,
                    ")"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                TabsTrigger,
                {
                  "data-ocid": "customers.due.tab",
                  value: "due",
                  className: "text-xs h-7 px-3",
                  children: [
                    "Has Due (",
                    dueCustomers.length,
                    ")"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                TabsTrigger,
                {
                  "data-ocid": "customers.paid.tab",
                  value: "paid",
                  className: "text-xs h-7 px-3",
                  children: [
                    "Fully Paid (",
                    paidCustomers.length,
                    ")"
                  ]
                }
              )
            ] })
          }
        ) }),
        isProMode && /* @__PURE__ */ jsxRuntimeExports.jsx(
          ProFilterBar,
          {
            activityFilter,
            setActivityFilter,
            tierFilter,
            setTierFilter
          }
        )
      ] }),
      filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          "data-ocid": "customers.list.empty_state",
          className: "flex flex-col items-center justify-center py-16 text-center",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 28, className: "text-muted-foreground" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-medium", children: activityFilter !== "all" || tierFilter !== "all" ? "No customers match this filter" : filter === "due" ? "No outstanding dues ✅" : filter === "paid" ? "No fully paid customers" : invoices.length === 0 ? "No invoices created yet" : "No customers found" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: invoices.length === 0 ? "Go to the Billing page to make a sale first" : "Try changing the search filter" })
          ]
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-3", children: filtered.map((ledger, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        CustomerCard,
        {
          ledger,
          index: idx,
          shopName,
          currentUser: user,
          isProMode
        },
        `${ledger.customerName}__${ledger.customerMobile}`
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      BulkReminderDialog,
      {
        dueCount: dueCustomers.length,
        dueCustomers,
        open: bulkReminderOpen,
        onClose: () => setBulkReminderOpen(false),
        onConfirm: () => {
          const result = sendBulkReminder();
          ue.success(
            `📱 Reminders sent to ${result.sent} customer${result.sent !== 1 ? "s" : ""}`
          );
        }
      }
    ),
    showAddCustomer && /* @__PURE__ */ jsxRuntimeExports.jsx(
      AddEditCustomerDialog,
      {
        open: showAddCustomer,
        onClose: () => setShowAddCustomer(false),
        isProMode
      }
    )
  ] });
}
export {
  CustomersPage
};
