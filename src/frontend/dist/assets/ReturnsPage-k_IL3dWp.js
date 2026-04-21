import { c as createLucideIcon, l as useStore, h as useAuth, r as reactExports, j as jsxRuntimeExports, C as Card, i as CardHeader, k as CardTitle, ae as RotateCcw, v as Badge, n as CardContent, al as TrendingDown, aw as Trophy, L as Label, I as Input, N as TriangleAlert, B as Button, ad as LoaderCircle, y as ue } from "./index-CyJThNPE.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Bxpy6Yo8.js";
import { T as Textarea } from "./textarea-BZ-5cS8n.js";
import { c as clearLeadingZeros } from "./numberInput-BP2ScP3W.js";
import { I as IndianRupee } from "./indian-rupee-D00rGjS7.js";
import "./index-BPYaWAKl.js";
import "./index-DkH1qIwF.js";
import "./chevron-down-CsZruglM.js";
import "./check-TLKRrqsL.js";
import "./chevron-up-CF0EzDAe.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "m16 16 2 2 4-4", key: "gfu2re" }],
  [
    "path",
    {
      d: "M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14",
      key: "e7tb2h"
    }
  ],
  ["path", { d: "m7.5 4.27 9 5.15", key: "1c824w" }],
  ["polyline", { points: "3.29 7 12 12 20.71 7", key: "ousv84" }],
  ["line", { x1: "12", x2: "12", y1: "22", y2: "12", key: "a4e8g8" }]
];
const PackageCheck = createLucideIcon("package-check", __iconNode);
const RETURN_REASONS = [
  "Damaged",
  "Wrong Product",
  "Customer Changed Mind",
  "Expiry Issue",
  "Quality Problem",
  "Other"
];
const REASON_LABELS = {
  Damaged: "Damaged",
  "Wrong Product": "Wrong Product",
  "Customer Changed Mind": "Customer Changed Mind",
  "Expiry Issue": "Expiry Issue",
  "Quality Problem": "Quality Problem",
  Other: "Other"
};
function fmt(n) {
  return `₹${n.toLocaleString("en-IN")}`;
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function ReturnsPage() {
  const { products, returns, addReturn, getReturnReport } = useStore();
  const { session } = useAuth();
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const report = getReturnReport(todayStr);
  const [selectedProductId, setSelectedProductId] = reactExports.useState("");
  const [qty, setQty] = reactExports.useState("1");
  const [returnValue, setReturnValue] = reactExports.useState("");
  const [sellingPrice, setSellingPrice] = reactExports.useState("");
  const [reason, setReason] = reactExports.useState("");
  const [remark, setRemark] = reactExports.useState("");
  const [reasonError, setReasonError] = reactExports.useState(false);
  const [saving, setSaving] = reactExports.useState(false);
  const selectedProduct = products.find((p) => p.id === selectedProductId);
  function handleProductChange(productId) {
    setSelectedProductId(productId);
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSellingPrice(String(product.sellingPrice ?? ""));
    }
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setReasonError(false);
    if (!selectedProductId) {
      ue.error("Please select a product");
      return;
    }
    if (!reason) {
      setReasonError(true);
      ue.error("Reason is required");
      return;
    }
    const qtyNum2 = Number.parseFloat(qty);
    const returnValueNum2 = Number.parseFloat(returnValue) || 0;
    const sellingPriceNum2 = Number.parseFloat(sellingPrice) || 0;
    if (!qty || Number.isNaN(qtyNum2) || qtyNum2 <= 0) {
      ue.error("Please enter a valid quantity");
      return;
    }
    const staffName = (session == null ? void 0 : session.mobile) ?? "Admin";
    setSaving(true);
    const success = await addReturn({
      itemName: (selectedProduct == null ? void 0 : selectedProduct.name) ?? "",
      productId: selectedProductId,
      qtyReturned: qtyNum2,
      returnValue: returnValueNum2,
      sellingPrice: sellingPriceNum2,
      reason,
      remark: remark.trim(),
      staffName
    });
    setSaving(false);
    if (success) {
      ue.success("Return recorded successfully!");
      setSelectedProductId("");
      setQty("1");
      setReturnValue("");
      setSellingPrice("");
      setReason("");
      setRemark("");
    }
  }
  const qtyNum = Number.parseFloat(qty) || 0;
  const returnValueNum = Number.parseFloat(returnValue) || 0;
  const sellingPriceNum = Number.parseFloat(sellingPrice) || 0;
  const previewLoss = Math.max(0, sellingPriceNum * qtyNum - returnValueNum);
  const previewIsLoss = previewLoss > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-6 pb-8", "data-ocid": "returns.page", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 md:px-6 space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Card,
      {
        "data-ocid": "returns.report.card",
        className: "bg-gradient-to-br from-rose-50 to-orange-50 border-rose-200 shadow-sm",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { size: 18, className: "text-rose-600" }),
            "Return Report — Today",
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-rose-100 text-rose-700 border-rose-300 ml-1", children: (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short"
            }) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-card border border-rose-100 p-4 flex flex-col gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-rose-600 mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(PackageCheck, { size: 16 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold uppercase tracking-wide", children: "Total Return Today" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "text-2xl font-bold text-rose-700",
                  "data-ocid": "returns.report.total.card",
                  children: fmt(report.totalReturnValue)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-rose-400", children: [
                report.returnsToday.length,
                " return",
                report.returnsToday.length !== 1 ? "s" : "",
                " today"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: `rounded-xl border p-4 flex flex-col gap-1 ${report.totalLoss > 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: `flex items-center gap-2 mb-1 ${report.totalLoss > 0 ? "text-red-600" : "text-green-600"}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { size: 16 }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold uppercase tracking-wide", children: "Loss Amount" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: `text-2xl font-bold ${report.totalLoss > 0 ? "text-red-700" : "text-green-700"}`,
                      "data-ocid": "returns.report.loss.card",
                      children: fmt(report.totalLoss)
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: `text-xs ${report.totalLoss > 0 ? "text-red-400" : "text-green-400"}`,
                      children: report.totalLoss > 0 ? "Loss today" : "No losses"
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-card border border-amber-100 p-4 flex flex-col gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-amber-600 mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 16 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold uppercase tracking-wide", children: "Top Return Reason" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "text-lg font-bold text-amber-700 leading-tight",
                  "data-ocid": "returns.report.top_reason.card",
                  children: report.topReason || "—"
                }
              ),
              report.topReasonCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-amber-500", children: [
                report.topReasonCount,
                " times (all time)"
              ] })
            ] })
          ] }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { "data-ocid": "returns.form.card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(IndianRupee, { size: 18, className: "text-primary" }),
        "Record New Return"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "return-product", children: "Product *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: selectedProductId,
                onValueChange: handleProductChange,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SelectTrigger,
                    {
                      id: "return-product",
                      "data-ocid": "returns.product.select",
                      className: "w-full",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select product..." })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: products.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.id, children: p.name }, p.id)) })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "return-qty", children: "Qty Returned *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "return-qty",
                type: "number",
                min: "0.01",
                step: "0.01",
                placeholder: "e.g. 5",
                value: qty,
                onChange: (e) => setQty(clearLeadingZeros(e.target.value)),
                onFocus: (e) => {
                  if (e.target.value === "0") e.target.select();
                },
                "data-ocid": "returns.qty.input"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "return-selling-price", children: "Original Selling Price (₹)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "return-selling-price",
                type: "number",
                min: "0",
                step: "0.01",
                placeholder: "Auto-filled from product",
                value: sellingPrice,
                onChange: (e) => setSellingPrice(clearLeadingZeros(e.target.value)),
                onFocus: (e) => {
                  if (e.target.value === "0") e.target.select();
                },
                "data-ocid": "returns.selling_price.input"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "return-value", children: "Return Value (₹) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "return-value",
                type: "number",
                min: "0",
                step: "0.01",
                placeholder: "How much was refunded to the customer",
                value: returnValue,
                onChange: (e) => setReturnValue(clearLeadingZeros(e.target.value)),
                onFocus: (e) => {
                  if (e.target.value === "0") e.target.select();
                },
                "data-ocid": "returns.return_value.input"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "return-reason", children: [
              "Reason *",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive ml-0.5", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: reason,
                onValueChange: (v) => {
                  setReason(v);
                  setReasonError(false);
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SelectTrigger,
                    {
                      id: "return-reason",
                      "data-ocid": "returns.reason.select",
                      className: reasonError ? "border-destructive" : "",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select reason (required)" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: RETURN_REASONS.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, children: REASON_LABELS[r] }, r)) })
                ]
              }
            ),
            reasonError && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: "text-xs text-destructive",
                "data-ocid": "returns.reason.error_state",
                children: "Reason is required"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "return-staff", children: "Staff Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "return-staff",
                type: "text",
                value: (session == null ? void 0 : session.mobile) ?? "Admin",
                readOnly: true,
                className: "bg-muted cursor-not-allowed"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "return-remark", children: [
            "Remark",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "(Optional)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              id: "return-remark",
              placeholder: "Optional details e.g. item condition, customer complaint...",
              value: remark,
              onChange: (e) => setRemark(e.target.value),
              rows: 2,
              "data-ocid": "returns.remark.textarea"
            }
          )
        ] }),
        qtyNum > 0 && sellingPriceNum > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `rounded-lg border p-3 flex items-center gap-3 ${previewIsLoss ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                TriangleAlert,
                {
                  size: 16,
                  className: previewIsLoss ? "text-red-500" : "text-green-500"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: previewIsLoss ? "Loss:" : "No Loss:" }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `font-bold ${previewIsLoss ? "text-red-700" : "text-green-700"}`,
                    children: fmt(previewLoss)
                  }
                ),
                previewIsLoss && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground ml-2 text-xs", children: [
                  "(Selling ₹",
                  sellingPriceNum,
                  " × ",
                  qtyNum,
                  " − Return ₹",
                  returnValueNum,
                  ")"
                ] })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "submit",
            className: "w-full md:w-auto",
            disabled: saving,
            "data-ocid": "returns.submit.button",
            children: [
              saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "mr-2 h-4 w-4" }),
              saving ? "Saving..." : "Record Return"
            ]
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { "data-ocid": "returns.list.card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { size: 18, className: "text-primary" }),
        "All Returns",
        returns.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-primary/10 text-primary border-0", children: returns.length })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: returns.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex flex-col items-center gap-3 py-16 text-muted-foreground",
          "data-ocid": "returns.list.empty_state",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { size: 40, className: "opacity-20" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No returns recorded" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Record your first return using the form above" })
          ]
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-x-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full hidden md:table", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border bg-muted/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Item" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Qty" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Amount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Reason" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Remark" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Staff" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: returns.map((r, idx) => {
            const isCustomerReturn = r.reason === "Customer Changed Mind";
            const rowClass = r.isLoss ? "bg-red-50 hover:bg-red-100" : isCustomerReturn ? "bg-yellow-50 hover:bg-yellow-100" : "hover:bg-muted/30";
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "tr",
              {
                "data-ocid": `returns.list.item.${idx + 1}`,
                className: `border-b border-border transition-colors ${rowClass}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm text-foreground", children: r.itemName }),
                    r.isLoss && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-red-600 font-medium mt-0.5", children: [
                      "Loss: ",
                      fmt(r.lossAmount)
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right text-sm font-medium text-foreground", children: r.qtyReturned }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right text-sm font-semibold", children: fmt(r.returnValue) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReturnReasonBadge, { reason: r.reason }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-sm text-muted-foreground max-w-[180px] truncate", children: r.remark || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "italic opacity-50", children: "—" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs text-muted-foreground whitespace-nowrap", children: fmtDate(r.date) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs text-muted-foreground", children: r.staffName })
                ]
              },
              r.id
            );
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden divide-y divide-border", children: returns.map((r, idx) => {
          const isCustomerReturn = r.reason === "Customer Changed Mind";
          const cardClass = r.isLoss ? "bg-red-50" : isCustomerReturn ? "bg-yellow-50" : "";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              "data-ocid": `returns.list.item.${idx + 1}`,
              className: `p-4 ${cardClass}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2 mb-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: r.itemName }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
                      fmtDate(r.date),
                      " · ",
                      r.staffName
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right flex-shrink-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-sm", children: fmt(r.returnValue) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                      "Qty: ",
                      r.qtyReturned
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ReturnReasonBadge, { reason: r.reason }),
                  r.isLoss && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Badge,
                    {
                      variant: "destructive",
                      className: "text-[10px] px-1.5",
                      children: [
                        "Loss: ",
                        fmt(r.lossAmount)
                      ]
                    }
                  )
                ] }),
                r.remark && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-2 italic", children: r.remark })
              ]
            },
            r.id
          );
        }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-4 text-xs text-muted-foreground px-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3 h-3 rounded-full bg-red-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Red = Loss" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3 h-3 rounded-full bg-yellow-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Yellow = Customer Changed Mind" })
      ] })
    ] })
  ] }) });
}
function ReturnReasonBadge({ reason }) {
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className, children: reason });
}
export {
  ReturnsPage
};
