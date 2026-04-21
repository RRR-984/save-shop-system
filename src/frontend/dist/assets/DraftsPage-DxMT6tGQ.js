import { l as useStore, r as reactExports, j as jsxRuntimeExports, K as FileText, B as Button, aa as Phone, v as Badge, ab as Package, z as ShoppingCart, E as Clock, x as Trash2, y as ue } from "./index-CyJThNPE.js";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-vZcsxxPB.js";
import { U as User } from "./user-HkQdw6T6.js";
import "./index-CsaT76ve.js";
function formatDraftTime(isoString) {
  const date = new Date(isoString);
  const now = /* @__PURE__ */ new Date();
  const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  const timeStr = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
  if (isToday) return `Today, ${timeStr}`;
  const dateStr = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short"
  });
  return `${dateStr}, ${timeStr}`;
}
function fmtCurrency(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Math.round(n));
}
function DraftCard({
  draft,
  onResume,
  onDelete
}) {
  var _a, _b, _c;
  const customerName = ((_a = draft.customerName) == null ? void 0 : _a.trim()) || "Walk-in Customer";
  const hasMobile = !!((_b = draft.customerMobile) == null ? void 0 : _b.trim());
  const itemCount = ((_c = draft.cartItems) == null ? void 0 : _c.length) ?? 0;
  const total = draft.totalAmount ?? 0;
  const timeLabel = formatDraftTime(draft.updatedAt || draft.createdAt);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "drafts.draft_card",
      className: "bg-card dark:bg-card border border-border rounded-2xl shadow-sm p-4 flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 16, className: "text-primary" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm text-foreground truncate leading-tight", children: customerName }),
              hasMobile && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1 mt-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 10 }),
                draft.customerMobile
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              variant: "outline",
              className: "text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-700/40 flex-shrink-0",
              children: "Draft"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 11 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: itemCount }),
            itemCount === 1 ? " item" : " items"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { size: 11 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: fmtCurrency(total) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 ml-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 10 }),
            timeLabel
          ] })
        ] }),
        itemCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground bg-muted/50 dark:bg-muted/20 rounded-lg px-3 py-1.5 line-clamp-1", children: [
          draft.cartItems.slice(0, 3).map((i) => i.productName).join(", "),
          itemCount > 3 && ` +${itemCount - 3} more`
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              "data-ocid": "drafts.resume_button",
              onClick: () => onResume(draft),
              className: "flex-1 h-8 text-xs font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-150",
              children: "Resume"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              variant: "outline",
              "data-ocid": "drafts.delete_button",
              onClick: () => onDelete(draft.draftId),
              className: "h-8 w-8 p-0 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800/40 dark:text-red-400 dark:hover:bg-red-950/30 rounded-lg transition-colors duration-150",
              "aria-label": "Delete draft",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 })
            }
          )
        ] })
      ]
    }
  );
}
function EmptyDrafts({ onNewSale }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "drafts.empty_state",
      className: "flex flex-col items-center justify-center gap-4 py-16 px-6 text-center",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 28, className: "text-muted-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-semibold text-foreground", children: "No saved drafts yet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mt-1 max-w-xs", children: [
            "Start a sale and tap",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: "Save Draft" }),
            " to continue it later without losing any data."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            "data-ocid": "drafts.start_new_sale_button",
            onClick: onNewSale,
            className: "mt-1 h-10 px-6 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors duration-150",
            children: "Start New Sale"
          }
        )
      ]
    }
  );
}
function DraftsPage({ onNavigate }) {
  const { draftSales, deleteDraft } = useStore();
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const activeDrafts = reactExports.useMemo(
    () => (draftSales ?? []).filter((d) => d.status === "draft").sort(
      (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
    ),
    [draftSales]
  );
  const handleResume = (draft) => {
    try {
      sessionStorage.setItem("billing_resume_draft", JSON.stringify(draft));
    } catch {
    }
    onNavigate("billing");
  };
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteDraft(deleteTarget);
    setDeleteTarget(null);
    ue.success("Draft deleted");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-0 min-h-0 pb-24 md:pb-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-4 pb-3 border-b border-border bg-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 18, className: "text-primary flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-base font-bold text-foreground leading-tight", children: [
          "Draft / Pending Sales",
          activeDrafts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary", children: activeDrafts.length })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 ml-6", children: "Saved sales that can be resumed and edited anytime" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 px-4 pt-4", children: activeDrafts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyDrafts, { onNewSale: () => onNavigate("billing") }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", children: activeDrafts.map((draft) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      DraftCard,
      {
        draft,
        onResume: handleResume,
        onDelete: (id) => setDeleteTarget(id)
      },
      draft.draftId
    )) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AlertDialog,
      {
        open: !!deleteTarget,
        onOpenChange: (open) => !open && setDeleteTarget(null),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete this draft?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "This cannot be undone. The saved customer info and items will be permanently removed." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { "data-ocid": "drafts.delete_cancel_button", children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AlertDialogAction,
              {
                "data-ocid": "drafts.delete_confirm_button",
                onClick: handleDeleteConfirm,
                className: "bg-red-600 hover:bg-red-700 text-white",
                children: "Delete"
              }
            )
          ] })
        ] })
      }
    )
  ] });
}
export {
  DraftsPage
};
