import { c as createLucideIcon, as as React, l as useStore, r as reactExports, y as ue, j as jsxRuntimeExports, v as Badge, B as Button, m as Plus, H as Search, I as Input, ak as Building2, aG as History, x as Trash2, aa as Phone, a8 as MapPin, a3 as MessageCircle, X, L as Label } from "./index-CyJThNPE.js";
import { T as Textarea } from "./textarea-BZ-5cS8n.js";
import { u as useAsyncAction } from "./useAsyncAction-DMbmfuC7.js";
import { M as Mail } from "./mail-XjHWTxTJ.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "m7 7 10 10", key: "1fmybs" }],
  ["path", { d: "M17 7v10H7", key: "6fjiku" }]
];
const ArrowDownRight = createLucideIcon("arrow-down-right", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M7 7h10v10", key: "1tivn9" }],
  ["path", { d: "M7 17 17 7", key: "1vkiza" }]
];
const ArrowUpRight = createLucideIcon("arrow-up-right", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", key: "1m0v6g" }],
  [
    "path",
    {
      d: "M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",
      key: "ohrbg2"
    }
  ]
];
const SquarePen = createLucideIcon("square-pen", __iconNode);
const VENDOR_FORM_DRAFT_KEY = "saveshop_vendor_form_draft";
function getDraftKey(shopId) {
  return `${VENDOR_FORM_DRAFT_KEY}_${shopId}`;
}
const EMPTY_FORM = {
  name: "",
  mobile: "",
  email: "",
  address: ""
};
function VendorForm({
  initial,
  onSave,
  onCancel,
  isEditing,
  shopId
}) {
  const savedDraft = reactExports.useMemo(() => {
    if (isEditing || !shopId) return null;
    try {
      const raw = localStorage.getItem(getDraftKey(shopId));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed.name && !parsed.mobile && !parsed.email && !parsed.address)
        return null;
      return parsed;
    } catch {
      return null;
    }
  }, [isEditing, shopId]);
  const [form, setForm] = reactExports.useState(initial ?? EMPTY_FORM);
  const [errors, setErrors] = reactExports.useState({});
  const [hasDraft, setHasDraft] = reactExports.useState(!!savedDraft);
  reactExports.useEffect(() => {
    if (isEditing || !shopId) return;
    localStorage.setItem(getDraftKey(shopId), JSON.stringify(form));
  }, [form, isEditing, shopId]);
  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: void 0 }));
  };
  const clearDraft = reactExports.useCallback(() => {
    if (shopId) localStorage.removeItem(getDraftKey(shopId));
  }, [shopId]);
  const handleResumeDraft = reactExports.useCallback(() => {
    if (savedDraft) setForm(savedDraft);
    setHasDraft(false);
  }, [savedDraft]);
  const handleDiscardDraft = reactExports.useCallback(() => {
    clearDraft();
    setForm(EMPTY_FORM);
    setHasDraft(false);
  }, [clearDraft]);
  const { execute: handleSave, isLoading: saving } = useAsyncAction(
    reactExports.useCallback(async () => {
      const newErrors = {};
      if (!form.name.trim()) newErrors.name = "Name is required";
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      await onSave(form);
      clearDraft();
    }, [form, onSave, clearDraft])
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md bg-card rounded-2xl shadow-xl border border-border overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-5 py-4 border-b border-border bg-muted/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-foreground text-lg", children: isEditing ? "✏️ Edit Vendor" : "➕ New Vendor" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: onCancel,
          "aria-label": "Close",
          className: "w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" })
        }
      )
    ] }),
    !isEditing && hasDraft && savedDraft && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-4 mt-3 px-3 py-2 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-yellow-800 font-medium", children: "📋 Unsaved vendor data from last time." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: handleResumeDraft,
            "data-ocid": "vendor_form.resume_draft_button",
            className: "text-xs font-semibold text-yellow-700 underline underline-offset-2 hover:text-yellow-900",
            children: "Resume"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-yellow-400", children: "·" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: handleDiscardDraft,
            "data-ocid": "vendor_form.discard_draft_button",
            className: "text-xs font-semibold text-yellow-600 underline underline-offset-2 hover:text-yellow-800",
            children: "Discard"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 space-y-4 max-h-[70vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Label,
          {
            htmlFor: "vname",
            className: "text-sm font-medium text-foreground mb-1.5 block",
            children: [
              "Name ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "vname",
            value: form.name,
            onChange: set("name"),
            placeholder: "Vendor name",
            "data-ocid": "vendor_form.name_input",
            className: errors.name ? "border-destructive" : ""
          }
        ),
        errors.name && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive mt-1", children: errors.name })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Label,
          {
            htmlFor: "vmobile",
            className: "text-sm font-medium text-foreground mb-1.5 block",
            children: "Mobile"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "vmobile",
            type: "tel",
            value: form.mobile,
            onChange: set("mobile"),
            placeholder: "9876543210",
            "data-ocid": "vendor_form.mobile_input"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Label,
          {
            htmlFor: "vemail",
            className: "text-sm font-medium text-foreground mb-1.5 block",
            children: "Email"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "vemail",
            type: "email",
            value: form.email,
            onChange: set("email"),
            placeholder: "vendor@example.com",
            "data-ocid": "vendor_form.email_input"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Label,
          {
            htmlFor: "vaddress",
            className: "text-sm font-medium text-foreground mb-1.5 block",
            children: "Address"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            id: "vaddress",
            value: form.address,
            onChange: set("address"),
            placeholder: "Shop / office address",
            rows: 3,
            "data-ocid": "vendor_form.address_input",
            className: "resize-none"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 px-5 py-4 border-t border-border bg-muted/20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outline",
          onClick: onCancel,
          disabled: saving,
          className: "flex-1",
          "data-ocid": "vendor_form.cancel_button",
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: handleSave,
          disabled: saving,
          className: "flex-1",
          "data-ocid": "vendor_form.save_button",
          children: saving ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-3.5 h-3.5 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" }),
            "Saving…"
          ] }) : isEditing ? "Update" : "Save"
        }
      )
    ] })
  ] }) });
}
function DeleteConfirm({ vendor, onConfirm, onCancel }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm bg-card rounded-2xl shadow-xl border border-border p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-6 h-6 text-destructive" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-center font-bold text-foreground text-lg mb-1", children: "Delete Vendor?" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-muted-foreground text-sm mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: vendor.name }),
      " ",
      "will be permanently deleted."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outline",
          onClick: onCancel,
          className: "flex-1",
          "data-ocid": "vendor_delete.cancel_button",
          children: "No"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "destructive",
          onClick: onConfirm,
          className: "flex-1",
          "data-ocid": "vendor_delete.confirm_button",
          children: "Yes, Delete"
        }
      )
    ] })
  ] }) });
}
function RateHistoryModal({
  vendor,
  history,
  products,
  onClose
}) {
  const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  const getProductName = (pid) => {
    var _a;
    return ((_a = products.find((p) => p.id === pid)) == null ? void 0 : _a.name) ?? "Unknown";
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[85vh] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-4 h-4 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-foreground text-sm", children: "Rate History" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: vendor.name })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: onClose,
          className: "p-1 rounded-lg hover:bg-muted",
          "aria-label": "Close",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5 text-muted-foreground" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto", children: history.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-12 gap-3 text-center px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-10 h-10 text-muted-foreground/40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "No rate history found." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Every time the rate changes, it will be recorded here." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: history.map((entry) => {
      const isIncrease = entry.newRate > entry.oldRate;
      const diff = Math.abs(entry.newRate - entry.oldRate);
      const pct = entry.oldRate > 0 ? (diff / entry.oldRate * 100).toFixed(1) : "0";
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "px-4 py-3 flex items-center gap-3",
          "data-ocid": `vendor-rate-history-row-${entry.id}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isIncrease ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`,
                children: isIncrease ? /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownRight, { className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground truncate", children: getProductName(entry.productId) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-0.5 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground line-through", children: [
                  "₹",
                  entry.oldRate.toLocaleString("en-IN")
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "→" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "span",
                  {
                    className: `text-xs font-semibold ${isIncrease ? "text-red-600" : "text-green-600"}`,
                    children: [
                      "₹",
                      entry.newRate.toLocaleString("en-IN")
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Badge,
                  {
                    variant: "outline",
                    className: `text-xs px-1.5 py-0 ${isIncrease ? "border-red-200 text-red-600 bg-red-50" : "border-green-200 text-green-600 bg-green-50"}`,
                    children: [
                      isIncrease ? "+" : "-",
                      pct,
                      "%"
                    ]
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: fmtDate(entry.changedAt) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground truncate max-w-[80px]", children: entry.changedBy })
            ] })
          ]
        },
        entry.id
      );
    }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-t shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "w-full", onClick: onClose, children: "Close" }) })
  ] }) });
}
function VendorLedgerBadge({
  vendorId,
  purchaseOrders
}) {
  const orders = purchaseOrders.filter((po) => po.vendorId === vendorId);
  const total = orders.reduce(
    (s, po) => s + po.qty * po.rate + po.transportCharge + po.labourCharge,
    0
  );
  const paid = orders.filter((po) => po.status === "received").reduce(
    (s, po) => s + po.qty * po.rate + po.transportCharge + po.labourCharge,
    0
  );
  const due = Math.max(0, total - paid);
  if (total === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 pt-2 mt-2 border-t border-border/60", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
      "Total:",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-foreground", children: [
        "₹",
        total.toLocaleString("en-IN")
      ] })
    ] }),
    due > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Badge,
      {
        variant: "outline",
        className: "text-xs border-warning/50 text-warning bg-warning-light",
        children: [
          "Due: ₹",
          due.toLocaleString("en-IN")
        ]
      }
    ),
    due === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Badge,
      {
        variant: "outline",
        className: "text-xs border-success/50 text-success bg-success-light",
        children: "Paid ✓"
      }
    )
  ] });
}
function VendorCard({
  vendor,
  purchaseOrders,
  rateHistoryCount,
  onEdit,
  onDelete,
  onViewHistory
}) {
  const handleWhatsApp = () => {
    if (!vendor.mobile) {
      ue.error("Mobile number is not available");
      return;
    }
    const msg = encodeURIComponent(
      `Hello ${vendor.name},
We have a new order request. Please reply at your earliest convenience.

— Save Shop System`
    );
    window.open(
      `https://wa.me/91${vendor.mobile.replace(/\D/g, "")}?text=${msg}`,
      "_blank"
    );
  };
  const handleEmail = () => {
    if (!vendor.email) {
      ue.error("Email address is not available");
      return;
    }
    window.location.href = `mailto:${vendor.email}?subject=Order Enquiry&body=Hello ${vendor.name},%0A%0AWe have a new order request. Please reply at your earliest convenience.%0A%0A— Save Shop System`;
  };
  const createdDate = new Date(vendor.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover transition-shadow p-4",
      "data-ocid": `vendor_card.${vendor.id}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-5 h-5 text-primary" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-foreground truncate", children: vendor.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "Added ",
                createdDate
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => onViewHistory(vendor),
                "aria-label": "Rate history",
                "data-ocid": `vendor_card.history_button.${vendor.id}`,
                className: "w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors relative",
                title: "View Rate History",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-4 h-4" }),
                  rateHistoryCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center", children: rateHistoryCount > 9 ? "9+" : rateHistoryCount })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => onEdit(vendor),
                "aria-label": "Edit vendor",
                "data-ocid": `vendor_card.edit_button.${vendor.id}`,
                className: "w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => onDelete(vendor),
                "aria-label": "Delete vendor",
                "data-ocid": `vendor_card.delete_button.${vendor.id}`,
                className: "w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 mb-3", children: [
          vendor.mobile && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "w-3.5 h-3.5 text-muted-foreground shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-foreground", children: vendor.mobile })
          ] }),
          vendor.email && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "w-3.5 h-3.5 text-muted-foreground shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-foreground truncate", children: vendor.email })
          ] }),
          vendor.address && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground line-clamp-2", children: vendor.address })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VendorLedgerBadge, { vendorId: vendor.id, purchaseOrders }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-3", children: [
          vendor.mobile && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: handleWhatsApp,
              "data-ocid": `vendor_card.whatsapp_button.${vendor.id}`,
              className: "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-success-light text-success text-xs font-medium hover:opacity-80 transition-opacity border border-success/20",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "w-3.5 h-3.5" }),
                "WhatsApp"
              ]
            }
          ),
          vendor.email && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: handleEmail,
              "data-ocid": `vendor_card.email_button.${vendor.id}`,
              className: "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:opacity-80 transition-opacity border border-primary/20",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "w-3.5 h-3.5" }),
                "Email"
              ]
            }
          )
        ] })
      ]
    }
  );
}
function VendorsPageInner() {
  const {
    vendors,
    addVendor,
    updateVendor,
    deleteVendor,
    purchaseOrders,
    products,
    vendorRateHistory,
    getVendorRateHistoryForVendor,
    shopId
  } = useStore();
  const [search, setSearch] = reactExports.useState("");
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editTarget, setEditTarget] = reactExports.useState(null);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const [historyTarget, setHistoryTarget] = reactExports.useState(null);
  const filtered = reactExports.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter(
      (v) => v.name.toLowerCase().includes(q) || v.mobile.includes(q)
    );
  }, [vendors, search]);
  const handleAdd = reactExports.useCallback(
    async (data) => {
      await addVendor(data);
      ue.success("Vendor added successfully! ✅");
      setShowForm(false);
    },
    [addVendor]
  );
  const handleUpdate = reactExports.useCallback(
    async (data) => {
      if (!editTarget) return;
      await updateVendor(editTarget.id, data);
      ue.success("Vendor updated successfully! ✅");
      setEditTarget(null);
    },
    [editTarget, updateVendor]
  );
  const handleDelete = reactExports.useCallback(async () => {
    if (!deleteTarget) return;
    await deleteVendor(deleteTarget.id);
    ue.success("Vendor deleted");
    setDeleteTarget(null);
  }, [deleteTarget, deleteVendor]);
  const historyForTarget = reactExports.useMemo(
    () => historyTarget ? getVendorRateHistoryForVendor(historyTarget.id) : [],
    [historyTarget, getVendorRateHistoryForVendor]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col min-h-0 page-fade-in", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-4 pb-3 border-b border-border bg-card sticky top-0 z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold text-foreground", children: "Vendors" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "(Vendors)" }),
          vendors.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              variant: "secondary",
              className: "text-xs",
              "data-ocid": "vendors.count_badge",
              children: vendors.length
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            onClick: () => setShowForm(true),
            "data-ocid": "vendors.add_button",
            className: "flex items-center gap-1.5 shrink-0",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Add Vendor" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sm:hidden", children: "Add" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: search,
            onChange: (e) => setSearch(e.target.value),
            placeholder: "Search by name or mobile...",
            className: "pl-9 bg-muted/40",
            "data-ocid": "vendors.search_input"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-auto p-4", children: vendors.length === 0 ? (
      /* Empty state */
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex flex-col items-center justify-center py-16 text-center gap-4",
          "data-ocid": "vendors.empty_state",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-8 h-8 text-primary" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-foreground text-lg mb-1", children: "No vendors yet" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm max-w-xs", children: "Click 'Add Vendor' to add your first vendor." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                onClick: () => setShowForm(true),
                "data-ocid": "vendors.empty_add_button",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
                  "Add First Vendor"
                ]
              }
            )
          ]
        }
      )
    ) : filtered.length === 0 ? (
      /* No search results */
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex flex-col items-center justify-center py-16 text-center gap-3",
          "data-ocid": "vendors.no_results_state",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "w-10 h-10 text-muted-foreground/50" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-foreground", children: "No vendors found" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-sm mt-1", children: [
                'No vendor found for "',
                search,
                '". Try clearing the search.'
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setSearch(""), children: "Clear Search" })
          ]
        }
      )
    ) : (
      /* Vendor grid */
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3",
          "data-ocid": "vendors.list",
          children: filtered.map((vendor) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            VendorCard,
            {
              vendor,
              purchaseOrders,
              rateHistoryCount: vendorRateHistory.filter((r) => r.vendorId === vendor.id).length,
              onEdit: setEditTarget,
              onDelete: setDeleteTarget,
              onViewHistory: setHistoryTarget
            },
            vendor.id
          ))
        }
      )
    ) }),
    showForm && /* @__PURE__ */ jsxRuntimeExports.jsx(
      VendorForm,
      {
        onSave: handleAdd,
        onCancel: () => setShowForm(false),
        isEditing: false,
        shopId
      }
    ),
    editTarget && /* @__PURE__ */ jsxRuntimeExports.jsx(
      VendorForm,
      {
        initial: {
          name: editTarget.name,
          mobile: editTarget.mobile,
          email: editTarget.email,
          address: editTarget.address
        },
        onSave: handleUpdate,
        onCancel: () => setEditTarget(null),
        isEditing: true
      }
    ),
    deleteTarget && /* @__PURE__ */ jsxRuntimeExports.jsx(
      DeleteConfirm,
      {
        vendor: deleteTarget,
        onConfirm: handleDelete,
        onCancel: () => setDeleteTarget(null)
      }
    ),
    historyTarget && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RateHistoryModal,
      {
        vendor: historyTarget,
        history: historyForTarget,
        products,
        onClose: () => setHistoryTarget(null)
      }
    )
  ] });
}
const VendorsPage = React.memo(VendorsPageInner);
export {
  VendorsPage,
  VendorsPage as default
};
