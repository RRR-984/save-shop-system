import { l as useStore, h as useAuth, r as reactExports, j as jsxRuntimeExports, G as ClipboardList, v as Badge, B as Button, m as Plus, C as Card, D as CircleCheckBig, a3 as MessageCircle, y as ue, a5 as ShoppingBag, X, x as Trash2 } from "./index-Bt77HP0S.js";
import { T as Textarea } from "./textarea-BQEBDJqN.js";
import { C as CircleX } from "./circle-x-BDHwm0HL.js";
import { C as ChevronUp } from "./chevron-up-hZ92f35t.js";
import { C as ChevronDown } from "./chevron-down-CFG9Ipkf.js";
function fmt(n) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}
function fmtDate(ts) {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
function StatusBadge({ status }) {
  if (status === "pending")
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-warning-light text-warning", children: "⏳ Pending" });
  if (status === "accepted")
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-success-light text-success", children: "✅ Accepted" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-danger-light text-danger", children: "❌ Rejected" });
}
function OrderCard({
  order,
  customerName,
  customerMobile,
  products,
  onAccept,
  onReject,
  onWhatsApp
}) {
  const [expanded, setExpanded] = reactExports.useState(false);
  const itemSummary = order.items.length === 1 ? (() => {
    const p = products.find((x) => x.id === order.items[0].productId);
    return `${(p == null ? void 0 : p.name) ?? "Item"} (${order.items[0].qty})`;
  })() : `${order.items.length} items: ${order.items.slice(0, 2).map((i) => {
    const p = products.find((x) => x.id === i.productId);
    return `${(p == null ? void 0 : p.name) ?? "?"}(${i.qty})`;
  }).join(", ")}${order.items.length > 2 ? "..." : ""}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 shadow-card border border-border bg-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2 mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground truncate", children: customerName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: order.status })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5 truncate", children: itemSummary })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-foreground", children: fmt(order.totalAmount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: fmtDate(order.createdAt) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mb-2", children: [
      "Created by: ",
      order.createdBy
    ] }),
    order.status === "rejected" && order.rejectionReason && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-1.5 mb-2", children: [
      "Reason: ",
      order.rejectionReason
    ] }),
    order.status === "accepted" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-success bg-success-light rounded-md px-3 py-1.5 mb-2", children: "✅ This order has been converted to a sale" }),
    expanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border pt-2 mt-2 mb-2 space-y-1", children: [
      order.items.map((item) => {
        const p = products.find((x) => x.id === item.productId);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex justify-between text-xs text-foreground",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate max-w-[60%]", children: [
                (p == null ? void 0 : p.name) ?? item.productId,
                " × ",
                item.qty
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium shrink-0", children: fmt(item.price * item.qty) })
            ]
          },
          item.productId
        );
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs font-bold text-foreground border-t border-border pt-1 mt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fmt(order.totalAmount) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mt-2", children: [
      order.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            className: "bg-success-light text-success hover:bg-success-light/80 border border-success/20 h-8 text-xs",
            onClick: () => onAccept(order.id),
            "data-ocid": "order-accept-btn",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-3.5 h-3.5 mr-1" }),
              "Accept"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            variant: "outline",
            className: "text-danger border-danger/30 hover:bg-danger-light h-8 text-xs",
            onClick: () => onReject(order.id),
            "data-ocid": "order-reject-btn",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-3.5 h-3.5 mr-1" }),
              "Reject"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          size: "sm",
          variant: "outline",
          className: "h-8 text-xs",
          onClick: () => onWhatsApp(order),
          "data-ocid": "order-whatsapp-btn",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "w-3.5 h-3.5 mr-1" }),
            "WhatsApp",
            customerMobile ? ` (${customerMobile.slice(-4)})` : ""
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          size: "sm",
          variant: "ghost",
          className: "h-8 text-xs ml-auto",
          onClick: () => setExpanded((v) => !v),
          "aria-expanded": expanded,
          "aria-label": expanded ? "Collapse items" : "Expand items",
          "data-ocid": "order-expand-btn",
          children: expanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-3.5 h-3.5" })
        }
      )
    ] })
  ] });
}
function CreateOrderModal({
  products,
  customers,
  createdBy,
  onSave,
  onClose
}) {
  const keyCounter = reactExports.useRef(0);
  const nextKey = () => {
    keyCounter.current += 1;
    return `item-${keyCounter.current}`;
  };
  const [customerId, setCustomerId] = reactExports.useState("");
  const [items, setItems] = reactExports.useState([
    { key: "item-0", productId: "", qty: 1, price: 0 }
  ]);
  const [notes, setNotes] = reactExports.useState("");
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);
  function addItem() {
    setItems((prev) => [
      ...prev,
      { key: nextKey(), productId: "", qty: 1, price: 0 }
    ]);
  }
  function removeItem(key) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }
  function updateItem(key, field, value) {
    setItems(
      (prev) => prev.map((item) => {
        if (item.key !== key) return item;
        if (field === "productId") {
          const p = products.find((x) => x.id === value);
          return {
            ...item,
            productId: value,
            price: (p == null ? void 0 : p.sellingPrice) ?? 0
          };
        }
        return { ...item, [field]: Number(value) };
      })
    );
  }
  function handleSave() {
    if (!customerId) {
      ue.error("Please select a customer");
      return;
    }
    const validItems = items.filter(
      (i) => i.productId && i.qty > 0 && i.price >= 0
    );
    if (validItems.length === 0) {
      ue.error("Please add at least one product");
      return;
    }
    onSave({
      customerId,
      items: validItems.map(({ productId, qty, price }) => ({
        productId,
        qty,
        price
      })),
      totalAmount: validItems.reduce((s, i) => s + i.qty * i.price, 0),
      status: "pending",
      createdBy: notes ? `${createdBy} — ${notes}` : createdBy
    });
  }
  function handleBackdropKeyDown(e) {
    if (e.key === "Escape") onClose();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/30 backdrop-blur-sm",
      onClick: (e) => e.target === e.currentTarget && onClose(),
      onKeyDown: handleBackdropKeyDown,
      role: "presentation",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "dialog",
        {
          open: true,
          "aria-label": "New customer order",
          className: "bg-card rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90dvh] overflow-y-auto shadow-xl border border-border m-0 p-0 sm:m-auto",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "w-5 h-5 text-primary" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-foreground", children: "New Customer Order" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "icon",
                  variant: "ghost",
                  className: "h-8 w-8",
                  onClick: onClose,
                  "aria-label": "Close dialog",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "label",
                  {
                    htmlFor: "order-customer-select",
                    className: "text-xs font-semibold text-muted-foreground mb-1 block",
                    children: "Customer *"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "select",
                  {
                    id: "order-customer-select",
                    className: "w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                    value: customerId,
                    onChange: (e) => setCustomerId(e.target.value),
                    "data-ocid": "order-customer-select",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Select Customer —" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "walk-in", children: "Walk-in Customer" }),
                      customers.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: c.id, children: [
                        c.name,
                        " ",
                        c.mobile ? `(${c.mobile})` : ""
                      ] }, c.id))
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground mb-2", children: "Products" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-start", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "label",
                    {
                      htmlFor: `product-select-${item.key}`,
                      className: "sr-only",
                      children: "Product"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "select",
                    {
                      id: `product-select-${item.key}`,
                      className: "flex-1 min-w-0 border border-input rounded-lg px-2 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring",
                      value: item.productId,
                      onChange: (e) => updateItem(item.key, "productId", e.target.value),
                      "data-ocid": `order-product-select-${item.key}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Product —" }),
                        products.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: p.id, children: p.name }, p.id))
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: `qty-${item.key}`, className: "sr-only", children: "Qty" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      id: `qty-${item.key}`,
                      type: "number",
                      min: 1,
                      className: "w-16 border border-input rounded-lg px-2 py-2 text-sm bg-background text-foreground text-center focus:outline-none focus:ring-1 focus:ring-ring",
                      value: item.qty,
                      onChange: (e) => updateItem(item.key, "qty", e.target.value),
                      placeholder: "Qty",
                      "data-ocid": `order-qty-${item.key}`
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: `price-${item.key}`, className: "sr-only", children: "Price" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      id: `price-${item.key}`,
                      type: "number",
                      min: 0,
                      className: "w-24 border border-input rounded-lg px-2 py-2 text-sm bg-background text-foreground text-right focus:outline-none focus:ring-1 focus:ring-ring",
                      value: item.price,
                      onChange: (e) => updateItem(item.key, "price", e.target.value),
                      placeholder: "₹ Price",
                      "data-ocid": `order-price-${item.key}`
                    }
                  ),
                  items.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      size: "icon",
                      variant: "ghost",
                      className: "h-9 w-9 text-danger shrink-0",
                      onClick: () => removeItem(item.key),
                      "aria-label": "Remove item",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                    }
                  )
                ] }, item.key)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    variant: "outline",
                    size: "sm",
                    className: "mt-2 w-full h-8 text-xs border-dashed",
                    onClick: addItem,
                    "data-ocid": "order-add-item-btn",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
                      "Add Item"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "label",
                  {
                    htmlFor: "order-notes",
                    className: "text-xs font-semibold text-muted-foreground mb-1 block",
                    children: "Notes (optional)"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Textarea,
                  {
                    id: "order-notes",
                    className: "text-sm resize-none",
                    rows: 2,
                    placeholder: "Any special instructions...",
                    value: notes,
                    onChange: (e) => setNotes(e.target.value),
                    "data-ocid": "order-notes"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded-xl px-4 py-3 flex justify-between items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-foreground", children: "Total Amount" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-bold text-primary", children: fmt(total) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 p-4 border-t border-border sticky bottom-0 bg-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  className: "flex-1 h-10",
                  onClick: onClose,
                  "data-ocid": "order-cancel-btn",
                  children: "Cancel"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  className: "flex-1 h-10 bg-primary text-primary-foreground",
                  onClick: handleSave,
                  "data-ocid": "order-save-btn",
                  children: "Save Order"
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
function AcceptDialog({
  onConfirm,
  onClose
}) {
  function handleKeyDown(e) {
    if (e.key === "Escape") onClose();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm px-4",
      onClick: (e) => e.target === e.currentTarget && onClose(),
      onKeyDown: handleKeyDown,
      role: "presentation",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "dialog",
        {
          open: true,
          "aria-label": "Accept order",
          className: "bg-card rounded-2xl w-full max-w-sm p-6 shadow-xl border border-border m-auto",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-success-light flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-5 h-5 text-success" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-foreground", children: "Accept Order?" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-6", children: "This order will be converted to a sale and stock will be automatically deducted." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "flex-1 h-10", onClick: onClose, children: "Cancel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  className: "flex-1 h-10 bg-success-light text-success hover:bg-success-light/80 border border-success/30",
                  onClick: onConfirm,
                  "data-ocid": "order-accept-confirm-btn",
                  children: "Yes, Accept"
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
const QUICK_REASONS = [
  "Out of Stock",
  "Price Issue",
  "Customer Cancelled",
  "Other"
];
function RejectModal({
  onConfirm,
  onClose
}) {
  const [reason, setReason] = reactExports.useState("");
  function handleConfirm() {
    if (!reason.trim()) {
      ue.error("Rejection reason is required");
      return;
    }
    onConfirm(reason.trim());
  }
  function handleKeyDown(e) {
    if (e.key === "Escape") onClose();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm px-4",
      onClick: (e) => e.target === e.currentTarget && onClose(),
      onKeyDown: handleKeyDown,
      role: "presentation",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "dialog",
        {
          open: true,
          "aria-label": "Reject order",
          className: "bg-card rounded-2xl w-full max-w-sm p-6 shadow-xl border border-border m-auto",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-danger-light flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-5 h-5 text-danger" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-foreground", children: "Reject Order?" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mb-3", children: QUICK_REASONS.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                className: `px-3 py-1 rounded-full text-xs font-medium border transition-colors ${reason === r ? "bg-danger-light text-danger border-danger/30" : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"}`,
                onClick: () => setReason(r),
                "data-ocid": `reject-reason-chip-${r.toLowerCase().replace(/\s+/g, "-")}`,
                children: r
              },
              r
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "reject-reason-textarea", className: "sr-only", children: "Rejection reason" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                id: "reject-reason-textarea",
                className: "text-sm resize-none mb-4",
                rows: 2,
                placeholder: "Write rejection reason (required)...",
                value: reason,
                onChange: (e) => setReason(e.target.value),
                "data-ocid": "reject-reason-input"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "flex-1 h-10", onClick: onClose, children: "Cancel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  className: "flex-1 h-10 border border-danger/30 bg-danger-light text-danger hover:bg-danger-light/80",
                  onClick: handleConfirm,
                  "data-ocid": "order-reject-confirm-btn",
                  children: "Reject Order"
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
function CustomerOrdersPage() {
  const {
    customers,
    products,
    customerOrders,
    addCustomerOrder,
    acceptCustomerOrder,
    rejectCustomerOrder
  } = useStore();
  const { currentUser, currentShop } = useAuth();
  const [filter, setFilter] = reactExports.useState("all");
  const [sort, setSort] = reactExports.useState("newest");
  const [showCreate, setShowCreate] = reactExports.useState(false);
  const [acceptingId, setAcceptingId] = reactExports.useState(null);
  const [rejectingId, setRejectingId] = reactExports.useState(null);
  const shopName = (currentShop == null ? void 0 : currentShop.name) ?? "Save Shop System";
  const filtered = customerOrders.filter((o) => filter === "all" || o.status === filter).sort((a, b) => {
    var _a, _b;
    if (sort === "newest") return b.createdAt - a.createdAt;
    if (sort === "oldest") return a.createdAt - b.createdAt;
    const na = ((_a = customers.find((c) => c.id === a.customerId)) == null ? void 0 : _a.name) ?? "";
    const nb = ((_b = customers.find((c) => c.id === b.customerId)) == null ? void 0 : _b.name) ?? "";
    return na.localeCompare(nb);
  });
  const pendingCount = customerOrders.filter(
    (o) => o.status === "pending"
  ).length;
  function getCustomer(id) {
    if (id === "walk-in") return { name: "Walk-in Customer", mobile: "" };
    const c = customers.find((x) => x.id === id);
    return { name: (c == null ? void 0 : c.name) ?? "Customer", mobile: (c == null ? void 0 : c.mobile) ?? "" };
  }
  function buildWhatsAppMessage(order) {
    const { name } = getCustomer(order.customerId);
    const lines = order.items.map((item) => {
      const p = products.find((x) => x.id === item.productId);
      return `  ${(p == null ? void 0 : p.name) ?? item.productId}: ${item.qty} × ${fmt(item.price)} = ${fmt(item.qty * item.price)}`;
    });
    const statusLabel = order.status === "pending" ? "Pending (Under Review)" : order.status === "accepted" ? "Accepted ✅" : `Rejected ❌ — ${order.rejectionReason ?? ""}`;
    return `Hello ${name},
Your order details:
${lines.join("\n")}
Total: ${fmt(order.totalAmount)}
Status: ${statusLabel}

- ${shopName}`;
  }
  function handleWhatsApp(order) {
    const { mobile } = getCustomer(order.customerId);
    const message = buildWhatsAppMessage(order);
    if (!mobile) {
      ue.error("Customer's mobile number is not available");
      return;
    }
    window.open(
      `https://wa.me/91${mobile}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener"
    );
  }
  async function handleAcceptConfirm() {
    if (!acceptingId) return;
    await acceptCustomerOrder(acceptingId);
    setAcceptingId(null);
    ue.success("Order accepted and converted to sale! ✅");
  }
  async function handleRejectConfirm(reason) {
    if (!rejectingId) return;
    await rejectCustomerOrder(rejectingId, reason);
    setRejectingId(null);
    ue.success("Order rejected successfully");
  }
  async function handleCreateOrder(co) {
    await addCustomerOrder(co);
    setShowCreate(false);
    ue.success("Customer order saved! 📦");
  }
  const FILTER_TABS = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "accepted", label: "Accepted" },
    { key: "rejected", label: "Rejected" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col min-h-full bg-background page-fade-in", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border-b border-border px-4 py-4 sticky top-0 z-20 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-5 h-5 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-bold text-foreground leading-tight truncate", children: "Customer Orders" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Customer Orders" })
          ] }),
          pendingCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-warning-light text-warning border border-warning/20 shrink-0", children: [
            pendingCount,
            " Pending"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            className: "h-9 shrink-0 bg-primary text-primary-foreground",
            onClick: () => setShowCreate(true),
            "data-ocid": "new-order-btn",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
              "New Order"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "flex gap-1 overflow-x-auto pb-0.5",
            role: "tablist",
            "aria-label": "Order filter",
            "data-ocid": "order-filter-tabs",
            children: FILTER_TABS.map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                role: "tab",
                "aria-selected": filter === tab.key,
                className: `shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === tab.key ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground hover:bg-muted"}`,
                onClick: () => setFilter(tab.key),
                "data-ocid": `filter-${tab.key}`,
                children: [
                  tab.label,
                  tab.key !== "all" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 opacity-70", children: [
                    "(",
                    customerOrders.filter((o) => o.status === tab.key).length,
                    ")"
                  ] })
                ]
              },
              tab.key
            ))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "order-sort", className: "sr-only", children: "Sort orders" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            id: "order-sort",
            className: "text-xs border border-input bg-background text-foreground rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring shrink-0",
            value: sort,
            onChange: (e) => setSort(e.target.value),
            "data-ocid": "order-sort-select",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "newest", children: "Newest" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "oldest", children: "Oldest" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "customer", children: "By Customer" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 p-4 space-y-3", children: filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-col items-center justify-center py-16 gap-4",
        "data-ocid": "orders-empty-state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-7 h-7 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: filter === "all" ? "No customer orders found." : `No ${filter} orders found.` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: 'Click "New Order" to create your first order' })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              className: "bg-primary text-primary-foreground h-9",
              onClick: () => setShowCreate(true),
              "data-ocid": "empty-new-order-btn",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
                "New Order"
              ]
            }
          )
        ]
      }
    ) : filtered.map((order) => {
      const { name, mobile } = getCustomer(order.customerId);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        OrderCard,
        {
          order,
          customerName: name,
          customerMobile: mobile,
          products,
          onAccept: (id) => setAcceptingId(id),
          onReject: (id) => setRejectingId(id),
          onWhatsApp: handleWhatsApp
        },
        order.id
      );
    }) }),
    showCreate && /* @__PURE__ */ jsxRuntimeExports.jsx(
      CreateOrderModal,
      {
        products,
        customers,
        createdBy: (currentUser == null ? void 0 : currentUser.name) ?? "Owner",
        onSave: handleCreateOrder,
        onClose: () => setShowCreate(false)
      }
    ),
    acceptingId && /* @__PURE__ */ jsxRuntimeExports.jsx(
      AcceptDialog,
      {
        onConfirm: handleAcceptConfirm,
        onClose: () => setAcceptingId(null)
      }
    ),
    rejectingId && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RejectModal,
      {
        onConfirm: handleRejectConfirm,
        onClose: () => setRejectingId(null)
      }
    )
  ] });
}
export {
  CustomerOrdersPage
};
