import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, l as useStore, I as Input, C as Card, n as CardContent, T as Table, o as TableHeader, p as TableRow, q as TableHead, s as TableBody, t as TableCell, _ as Receipt, E as Clock, B as Button, v as Badge, ae as RotateCcw, y as ue } from "./index-Bt77HP0S.js";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-9NF_w4cT.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-NQ0wylTN.js";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-FRlTL3i_.js";
import { C as ChevronUp } from "./chevron-up-hZ92f35t.js";
import { C as ChevronDown } from "./chevron-down-CFG9Ipkf.js";
import "./index-Dc2wOXFM.js";
import "./index-BoNbO3VT.js";
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
      d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
      key: "1c8476"
    }
  ],
  ["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7", key: "1ydtos" }],
  ["path", { d: "M7 3v4a1 1 0 0 0 1 1h7", key: "t51u73" }]
];
const Save = createLucideIcon("save", __iconNode);
function fmt(n) {
  return `₹${n.toLocaleString("en-IN")}`;
}
function PaymentModeBadge({ mode }) {
  const cls = {
    cash: "badge-success",
    upi: "badge-info",
    online: "badge-info",
    credit: "badge-warning"
  };
  const labels = {
    cash: "Cash",
    upi: "UPI",
    online: "Online",
    credit: "Credit"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: `${cls[mode] ?? "badge-info"} capitalize text-[10px] font-medium`,
      children: labels[mode] ?? mode
    }
  );
}
function SalesHistorySection() {
  const { invoices } = useStore();
  const [filter, setFilter] = reactExports.useState("all");
  const [search, setSearch] = reactExports.useState("");
  const filtered = invoices.filter((inv) => {
    const due = inv.dueAmount ?? 0;
    if (filter === "due") return due > 0;
    if (filter === "paid") return due === 0;
    return true;
  }).filter((inv) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return inv.customerName.toLowerCase().includes(s) || (inv.customerMobile ?? "").includes(s) || inv.invoiceNumber.toLowerCase().includes(s);
  });
  const dueCount = invoices.filter((i) => (i.dueAmount ?? 0) > 0).length;
  const paidCount = invoices.filter((i) => (i.dueAmount ?? 0) === 0).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: filter, onValueChange: (v) => setFilter(v), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "h-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            "data-ocid": "history.sales.all.tab",
            value: "all",
            className: "text-xs h-7 px-3",
            children: [
              "All (",
              invoices.length,
              ")"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            "data-ocid": "history.sales.due.tab",
            value: "due",
            className: "text-xs h-7 px-3",
            children: [
              "Credit/Due (",
              dueCount,
              ")"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            "data-ocid": "history.sales.paid.tab",
            value: "paid",
            className: "text-xs h-7 px-3",
            children: [
              "Paid (",
              paidCount,
              ")"
            ]
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          "data-ocid": "history.sales.search_input",
          placeholder: "Search customer, invoice...",
          value: search,
          onChange: (e) => setSearch(e.target.value),
          className: "h-8 text-sm w-full sm:w-56"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "shadow-card border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-secondary/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Invoice" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Customer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Mobile" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Total" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Paid" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Due" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Mode" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Date" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TableCell,
          {
            colSpan: 8,
            "data-ocid": "history.sales.empty_state",
            className: "text-center py-12 text-muted-foreground",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "mx-auto mb-2", size: 24 }),
              filter === "due" ? "No due invoices" : filter === "paid" ? "No fully paid invoices" : "No invoices found"
            ]
          }
        ) }),
        filtered.map((inv, idx) => {
          const due = inv.dueAmount ?? 0;
          const isPaid = due === 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TableRow,
            {
              "data-ocid": `history.sales.item.${idx + 1}`,
              className: isPaid ? "bg-success-light/30" : "bg-alert-danger",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs font-medium", children: inv.invoiceNumber }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm font-medium", children: inv.customerName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs text-muted-foreground", children: inv.customerMobile || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm font-semibold", children: fmt(inv.totalAmount) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm text-success font-medium", children: fmt(inv.paidAmount) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: due > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-danger", children: fmt(due) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-success font-medium", children: "✓ Paid" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentModeBadge, { mode: inv.paymentMode }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs text-muted-foreground", children: new Date(inv.date).toLocaleDateString("en-IN") })
              ]
            },
            inv.id
          );
        })
      ] })
    ] }) }) }) })
  ] });
}
function qaIcon(type) {
  switch (type) {
    case "product_added":
      return { emoji: "➕", color: "text-success" };
    case "product_edited":
      return { emoji: "✏️", color: "text-brand-blue" };
    case "product_deleted":
      return { emoji: "🗑️", color: "text-danger" };
    case "stock_in":
      return { emoji: "📦", color: "text-success" };
    case "stock_out":
      return { emoji: "📤", color: "text-warning" };
    case "invoice_created":
      return { emoji: "🧾", color: "text-brand-blue" };
    default:
      return { emoji: "🔵", color: "text-muted-foreground" };
  }
}
function formatTs(iso) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}
function DraftRow({
  snap,
  index,
  onRestore
}) {
  const [expanded, setExpanded] = reactExports.useState(false);
  const [confirmOpen, setConfirmOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      "data-ocid": `history.item.${index + 1}`,
      className: "border-border shadow-sm",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 16, className: "text-primary" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm truncate", children: snap.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-0.5", children: formatTs(snap.timestamp) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex flex-wrap gap-1", children: [
                snap.qaChanges.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-xs px-1.5 py-0 h-5", children: [
                  snap.qaChanges.length,
                  " change",
                  snap.qaChanges.length !== 1 ? "s" : ""
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-xs px-1.5 py-0 h-5", children: [
                  snap.products.length,
                  " products"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  "data-ocid": `history.item.toggle.${index + 1}`,
                  variant: "ghost",
                  size: "sm",
                  className: "h-7 px-2 text-xs text-muted-foreground",
                  onClick: () => setExpanded((v) => !v),
                  children: [
                    "What Changed?",
                    " ",
                    expanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 12, className: "ml-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 12, className: "ml-1" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  "data-ocid": `history.item.open_modal_button.${index + 1}`,
                  variant: "outline",
                  size: "sm",
                  className: "h-7 px-2 text-xs text-primary border-primary/40 hover:bg-primary/10",
                  onClick: () => setConfirmOpen(true),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { size: 12, className: "mr-1" }),
                    "Restore"
                  ]
                }
              )
            ] })
          ] }),
          expanded && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 pl-11 space-y-1.5", children: snap.qaChanges.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground italic", children: "No change details available." }) : snap.qaChanges.map((change) => {
            const { emoji, color } = qaIcon(change.type);
            const changeKey = `${change.type}-${change.description}`;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex items-center gap-2 text-xs py-1 px-2 rounded-md bg-secondary/50",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      role: "img",
                      "aria-label": change.type,
                      className: "text-sm",
                      children: emoji
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `${color} font-medium`, children: change.description })
                ]
              },
              changeKey
            );
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: confirmOpen, onOpenChange: setConfirmOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { "data-ocid": `history.item.dialog.${index + 1}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Restore Data?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
              "Do you want to restore from this snapshot?",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: "All current product, stock and invoice data will be overwritten." }),
              " ",
              "This action cannot be undone."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AlertDialogCancel,
              {
                "data-ocid": `history.item.cancel_button.${index + 1}`,
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AlertDialogAction,
              {
                "data-ocid": `history.item.confirm_button.${index + 1}`,
                className: "bg-primary hover:bg-primary/90",
                onClick: () => {
                  onRestore(snap.id);
                  setConfirmOpen(false);
                },
                children: "Yes, Restore"
              }
            )
          ] })
        ] }) })
      ]
    }
  );
}
function DraftHistorySection() {
  const { getDrafts, saveDraftNow, restoreDraft } = useStore();
  const [drafts, setDrafts] = reactExports.useState([]);
  const [snapshotDialogOpen, setSnapshotDialogOpen] = reactExports.useState(false);
  const [snapshotLabel, setSnapshotLabel] = reactExports.useState("");
  const refreshDrafts = () => {
    getDrafts().then(setDrafts).catch(console.error);
  };
  reactExports.useEffect(() => {
    getDrafts().then(setDrafts).catch(console.error);
  }, [getDrafts]);
  const handleTakeSnapshot = () => {
    saveDraftNow(snapshotLabel).then(() => {
      setSnapshotLabel("");
      setSnapshotDialogOpen(false);
      refreshDrafts();
      ue.success("Snapshot saved! ✓");
    }).catch(console.error);
  };
  const handleRestore = (id) => {
    restoreDraft(id).then(() => {
      refreshDrafts();
      ue.success("Data restored successfully! ✓");
    }).catch(console.error);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 14, className: "mt-0.5 flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "An ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "automatic snapshot" }),
          " is saved before every product add/edit/delete and stock change. Last 10 snapshots are stored."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          "data-ocid": "history.open_modal_button",
          size: "sm",
          onClick: () => setSnapshotDialogOpen(true),
          className: "flex-shrink-0",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { size: 14, className: "mr-1.5" }),
            "Take Snapshot Now"
          ]
        }
      )
    ] }),
    drafts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "history.empty_state",
        className: "flex flex-col items-center justify-center py-16 text-center",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 28, className: "text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-medium", children: "No snapshots found." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1 max-w-xs", children: "Make any change — add product, stock in/out — a snapshot will be saved automatically." })
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-2", children: drafts.map((snap, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      DraftRow,
      {
        snap,
        index: idx,
        onRestore: handleRestore
      },
      snap.id
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: snapshotDialogOpen, onOpenChange: setSnapshotDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { "data-ocid": "history.snapshot.dialog", className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Take Snapshot Now" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Give this snapshot a name (optional)." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            "data-ocid": "history.snapshot.input",
            value: snapshotLabel,
            onChange: (e) => setSnapshotLabel(e.target.value),
            placeholder: "e.g. Before sale day, Before bulk import...",
            onKeyDown: (e) => e.key === "Enter" && handleTakeSnapshot(),
            autoFocus: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            "data-ocid": "history.snapshot.cancel_button",
            variant: "outline",
            onClick: () => setSnapshotDialogOpen(false),
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            "data-ocid": "history.snapshot.submit_button",
            onClick: handleTakeSnapshot,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { size: 14, className: "mr-1.5" }),
              "Save Snapshot"
            ]
          }
        )
      ] })
    ] }) })
  ] });
}
function HistoryPage() {
  const [activeTab, setActiveTab] = reactExports.useState("sales");
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 md:px-6 pb-6 flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: "History" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-0.5", children: "Sales history and draft snapshots" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Tabs,
      {
        value: activeTab,
        onValueChange: (v) => setActiveTab(v),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { "data-ocid": "history.sales_tab.tab", value: "sales", children: "🧾 Sales History" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { "data-ocid": "history.drafts_tab.tab", value: "drafts", children: "💾 Draft History" })
        ] })
      }
    ),
    activeTab === "sales" && /* @__PURE__ */ jsxRuntimeExports.jsx(SalesHistorySection, {}),
    activeTab === "drafts" && /* @__PURE__ */ jsxRuntimeExports.jsx(DraftHistorySection, {})
  ] }) });
}
export {
  HistoryPage
};
