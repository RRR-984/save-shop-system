import { r as reactExports, u as useControllableState, j as jsxRuntimeExports, P as Primitive, ah as useId, b as composeEventHandlers, d as Presence, a as useComposedRefs, ai as useLayoutEffect2, e as createContextScope, l as useStore, h as useAuth, N as TriangleAlert, B as Button, m as Plus, v as Badge, H as Search, I as Input, ab as Package, R as ROLE_PERMISSIONS, C as Card, aj as Eye, z as ShoppingCart, T as Table, o as TableHeader, p as TableRow, q as TableHead, s as TableBody, t as TableCell } from "./index-Bt77HP0S.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-NQ0wylTN.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CGD2qyaK.js";
import { C as ChevronUp } from "./chevron-up-hZ92f35t.js";
import { C as ChevronDown } from "./chevron-down-CFG9Ipkf.js";
import "./index-Dc2wOXFM.js";
import "./index-BoNbO3VT.js";
import "./index-Bc1JMXzj.js";
import "./check-DtmnsLpz.js";
var COLLAPSIBLE_NAME = "Collapsible";
var [createCollapsibleContext] = createContextScope(COLLAPSIBLE_NAME);
var [CollapsibleProvider, useCollapsibleContext] = createCollapsibleContext(COLLAPSIBLE_NAME);
var Collapsible$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeCollapsible,
      open: openProp,
      defaultOpen,
      disabled,
      onOpenChange,
      ...collapsibleProps
    } = props;
    const [open, setOpen] = useControllableState({
      prop: openProp,
      defaultProp: defaultOpen ?? false,
      onChange: onOpenChange,
      caller: COLLAPSIBLE_NAME
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      CollapsibleProvider,
      {
        scope: __scopeCollapsible,
        disabled,
        contentId: useId(),
        open,
        onOpenToggle: reactExports.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            "data-state": getState(open),
            "data-disabled": disabled ? "" : void 0,
            ...collapsibleProps,
            ref: forwardedRef
          }
        )
      }
    );
  }
);
Collapsible$1.displayName = COLLAPSIBLE_NAME;
var TRIGGER_NAME = "CollapsibleTrigger";
var CollapsibleTrigger$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeCollapsible, ...triggerProps } = props;
    const context = useCollapsibleContext(TRIGGER_NAME, __scopeCollapsible);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        type: "button",
        "aria-controls": context.contentId,
        "aria-expanded": context.open || false,
        "data-state": getState(context.open),
        "data-disabled": context.disabled ? "" : void 0,
        disabled: context.disabled,
        ...triggerProps,
        ref: forwardedRef,
        onClick: composeEventHandlers(props.onClick, context.onOpenToggle)
      }
    );
  }
);
CollapsibleTrigger$1.displayName = TRIGGER_NAME;
var CONTENT_NAME = "CollapsibleContent";
var CollapsibleContent$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { forceMount, ...contentProps } = props;
    const context = useCollapsibleContext(CONTENT_NAME, props.__scopeCollapsible);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: ({ present }) => /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsibleContentImpl, { ...contentProps, ref: forwardedRef, present }) });
  }
);
CollapsibleContent$1.displayName = CONTENT_NAME;
var CollapsibleContentImpl = reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeCollapsible, present, children, ...contentProps } = props;
  const context = useCollapsibleContext(CONTENT_NAME, __scopeCollapsible);
  const [isPresent, setIsPresent] = reactExports.useState(present);
  const ref = reactExports.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  const heightRef = reactExports.useRef(0);
  const height = heightRef.current;
  const widthRef = reactExports.useRef(0);
  const width = widthRef.current;
  const isOpen = context.open || isPresent;
  const isMountAnimationPreventedRef = reactExports.useRef(isOpen);
  const originalStylesRef = reactExports.useRef(void 0);
  reactExports.useEffect(() => {
    const rAF = requestAnimationFrame(() => isMountAnimationPreventedRef.current = false);
    return () => cancelAnimationFrame(rAF);
  }, []);
  useLayoutEffect2(() => {
    const node = ref.current;
    if (node) {
      originalStylesRef.current = originalStylesRef.current || {
        transitionDuration: node.style.transitionDuration,
        animationName: node.style.animationName
      };
      node.style.transitionDuration = "0s";
      node.style.animationName = "none";
      const rect = node.getBoundingClientRect();
      heightRef.current = rect.height;
      widthRef.current = rect.width;
      if (!isMountAnimationPreventedRef.current) {
        node.style.transitionDuration = originalStylesRef.current.transitionDuration;
        node.style.animationName = originalStylesRef.current.animationName;
      }
      setIsPresent(present);
    }
  }, [context.open, present]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Primitive.div,
    {
      "data-state": getState(context.open),
      "data-disabled": context.disabled ? "" : void 0,
      id: context.contentId,
      hidden: !isOpen,
      ...contentProps,
      ref: composedRefs,
      style: {
        [`--radix-collapsible-content-height`]: height ? `${height}px` : void 0,
        [`--radix-collapsible-content-width`]: width ? `${width}px` : void 0,
        ...props.style
      },
      children: isOpen && children
    }
  );
});
function getState(open) {
  return open ? "open" : "closed";
}
var Root = Collapsible$1;
function Collapsible({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Root, { "data-slot": "collapsible", ...props });
}
function CollapsibleTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    CollapsibleTrigger$1,
    {
      "data-slot": "collapsible-trigger",
      ...props
    }
  );
}
function CollapsibleContent({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    CollapsibleContent$1,
    {
      "data-slot": "collapsible-content",
      ...props
    }
  );
}
function fmtCurrency(n) {
  return `₹${n.toLocaleString("en-IN")}`;
}
function getExpiryStatus(expiryDate) {
  if (!(expiryDate == null ? void 0 : expiryDate.trim())) return "normal";
  const [year, month, day] = expiryDate.split("-").map(Number);
  const expiry = new Date(year, month - 1, day);
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24)
  );
  if (daysLeft <= 0) return "expired";
  if (daysLeft <= 3) return "warning";
  return "normal";
}
function getDaysLeft(expiryDate) {
  if (!(expiryDate == null ? void 0 : expiryDate.trim())) return null;
  const [year, month, day] = expiryDate.split("-").map(Number);
  const expiry = new Date(year, month - 1, day);
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil(
    (expiry.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24)
  );
}
function formatBatchQty(product, batch) {
  if (product.unitMode === "mixed" && batch.lengthQty != null && batch.weightQty != null) {
    return `${batch.lengthQty} ${product.lengthUnit || ""} (${batch.weightQty} ${product.weightUnit || ""})`;
  }
  if (product.unitMode === "mixed" && batch.lengthQty != null) {
    return `${batch.lengthQty} ${product.lengthUnit || ""}`;
  }
  return `${batch.quantity} ${product.unit}`;
}
function formatTotalStock(product, batches, totalQty) {
  if (product.unitMode === "mixed") {
    const totalLength = batches.reduce(
      (s, b) => s + (b.lengthQty ?? b.quantity),
      0
    );
    const totalWeight = batches.reduce((s, b) => s + (b.weightQty ?? 0), 0);
    if (totalWeight > 0) {
      return `${totalLength} ${product.lengthUnit || ""} (${totalWeight} ${product.weightUnit || ""})`;
    }
    return `${totalLength} ${product.lengthUnit || ""}`;
  }
  return `${totalQty} ${product.unit}`;
}
function BatchViewDialog({
  product,
  open,
  onClose,
  getProductBatches,
  canViewCost
}) {
  if (!product) return null;
  const batches = getProductBatches(product.id).sort(
    (a, b) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
  );
  const totalQty = batches.reduce((s, b) => s + b.quantity, 0);
  const totalValue = batches.reduce(
    (s, b) => s + b.quantity * b.purchaseRate,
    0
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      "data-ocid": "inventory.batch_view.dialog",
      className: "max-w-lg max-h-[85vh] overflow-y-auto",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2 text-base", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 18, className: "text-primary" }),
          product.name,
          " — Batches"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary/60 rounded-lg p-3 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Total Batches" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", children: batches.length })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary/60 rounded-lg p-3 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Total Qty" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-bold", children: [
              totalQty,
              " ",
              product.unit
            ] })
          ] }),
          canViewCost && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary/60 rounded-lg p-3 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Total Value" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold text-primary", children: fmtCurrency(totalValue) })
          ] })
        ] }),
        batches.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8 text-muted-foreground text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "mx-auto mb-2", size: 24 }),
          "No batches available"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-secondary/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs font-semibold", children: "Batch No" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs font-semibold", children: "Qty" }),
            canViewCost && /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs font-semibold", children: "Rate (₹)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs font-semibold", children: "Date" }),
            canViewCost && /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs font-semibold text-right", children: "Value" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: batches.map((b, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TableRow,
            {
              "data-ocid": `inventory.batch_view.item.${idx + 1}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 flex-wrap", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Badge,
                    {
                      variant: "outline",
                      className: "text-[10px] font-mono",
                      children: [
                        "B",
                        String(b.batchNumber ?? idx + 1).padStart(3, "0")
                      ]
                    }
                  ),
                  idx === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-[9px] bg-primary/10 text-primary border-0 px-1", children: "Next FIFO" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs font-semibold", children: formatBatchQty(product, b) }),
                canViewCost && /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: fmtCurrency(b.purchaseRate) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: new Date(b.dateAdded).toLocaleDateString("en-IN") }),
                canViewCost && /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs text-right font-medium", children: fmtCurrency(b.quantity * b.purchaseRate) })
              ]
            },
            b.id
          )) })
        ] }) }),
        batches.length > 0 && canViewCost && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center border-t border-border pt-3 mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-muted-foreground", children: [
            "Total Value (",
            batches.length,
            " batch",
            batches.length !== 1 ? "es" : "",
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-primary", children: fmtCurrency(totalValue) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            "data-ocid": "inventory.batch_view.close_button",
            variant: "outline",
            className: "w-full mt-2",
            onClick: onClose,
            children: "Close"
          }
        )
      ]
    }
  ) });
}
function InventoryPage({
  onNavigate,
  selectedProductId: initialSelectedProductId
}) {
  const {
    products,
    categories,
    getProductStock,
    getProductBatches,
    purchaseOrders,
    refreshCounter,
    isPhase1Loading,
    phase1HasPartialError,
    phase2HasPartialError
  } = useStore();
  const { currentUser } = useAuth();
  const userRole = (currentUser == null ? void 0 : currentUser.role) ?? "staff";
  const canViewCost = ROLE_PERMISSIONS.canViewCostPrice(userRole);
  const [search, setSearch] = reactExports.useState("");
  const [categoryFilter, setCategoryFilter] = reactExports.useState("all");
  const [expandedProduct, setExpandedProduct] = reactExports.useState(
    initialSelectedProductId ?? null
  );
  const [batchDialogProduct, setBatchDialogProduct] = reactExports.useState(
    null
  );
  const highlightedCardRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!initialSelectedProductId) return;
    const timer = setTimeout(() => {
      var _a;
      (_a = highlightedCardRef.current) == null ? void 0 : _a.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }, 150);
    return () => clearTimeout(timer);
  }, [initialSelectedProductId]);
  const filtered = reactExports.useMemo(
    () => products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "all" || p.categoryId === categoryFilter;
      return matchSearch && matchCat;
    }),
    [products, search, categoryFilter]
  );
  const totalStockItems = products.length;
  const lowStockCount = reactExports.useMemo(
    () => products.filter((p) => getProductStock(p.id) < p.minStockAlert).length,
    [products, getProductStock]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-6", children: [
    isPhase1Loading && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "inventory.loading_state",
        className: "px-4 md:px-6 pt-6 flex flex-col gap-4",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-7 w-48 rounded-lg bg-muted/60 animate-pulse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 rounded-xl bg-muted/40 animate-pulse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "h-20 rounded-2xl bg-muted/40 animate-pulse"
            },
            i
          )) })
        ]
      }
    ),
    phase1HasPartialError && !isPhase1Loading && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "inventory.error_state",
        className: "mx-4 mt-4 flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-xl text-red-800 dark:text-red-300",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 14, className: "flex-shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium flex-1", children: "Some inventory data failed to load. Product or batch data may be incomplete." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              "data-ocid": "inventory.phase1_error.retry_button",
              onClick: () => window.location.reload(),
              className: "text-[11px] font-semibold underline underline-offset-2 flex-shrink-0 text-red-700 dark:text-red-400",
              children: "Retry"
            }
          )
        ]
      }
    ),
    phase2HasPartialError && !isPhase1Loading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-4 flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl text-amber-800 dark:text-amber-300", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 13, className: "flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs flex-1", children: "Some background data (sales, payments) could not be loaded." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => window.location.reload(),
          className: "text-[11px] font-semibold underline underline-offset-2 flex-shrink-0 text-amber-700 dark:text-amber-400",
          children: "Refresh"
        }
      )
    ] }),
    !isPhase1Loading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 md:px-6 pb-6 flex flex-col gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: "Inventory Management" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "FIFO batch-wise stock tracking" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          onNavigate && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              "data-ocid": "inventory.add_new_stock.button",
              onClick: () => onNavigate("stock"),
              size: "sm",
              className: "gap-1.5 text-sm font-semibold",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Add New Stock" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sm:hidden", children: "Add Stock" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-xs", children: [
            totalStockItems,
            " Products"
          ] }),
          lowStockCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "destructive", className: "text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 10, className: "mr-1" }),
            " ",
            lowStockCount,
            " ",
            "Low"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-[180px] max-w-xs", children: [
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
              "data-ocid": "inventory.search.input",
              placeholder: "Search products...",
              value: search,
              onChange: (e) => setSearch(e.target.value),
              className: "pl-9 h-8 text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: categoryFilter, onValueChange: setCategoryFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SelectTrigger,
            {
              "data-ocid": "inventory.category.select",
              className: "w-44 h-8 text-sm",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Categories" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Categories" }),
            categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: c.name }, c.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            "data-ocid": "inventory.list.empty_state",
            className: "text-center py-12 text-muted-foreground",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "mx-auto mb-3", size: 32 }),
              "No products found"
            ]
          }
        ),
        filtered.map((p, idx) => {
          const lastPO = purchaseOrders.filter((po) => po.productId === p.id).sort((a, b) => b.createdAt - a.createdAt)[0];
          const isHighlighted = p.id === initialSelectedProductId;
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              ref: isHighlighted ? highlightedCardRef : null,
              className: isHighlighted ? "ring-2 ring-primary ring-offset-2 rounded-xl transition-all duration-300" : "",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                ProductCard,
                {
                  product: p,
                  idx,
                  isExpanded: expandedProduct === p.id,
                  onToggle: (id) => setExpandedProduct(expandedProduct === id ? null : id),
                  getProductStock,
                  getProductBatches,
                  onViewBatches: (prod) => setBatchDialogProduct(prod),
                  canViewCost,
                  canEdit: ROLE_PERMISSIONS.canEditProduct(userRole),
                  canDelete: ROLE_PERMISSIONS.canDeleteProducts(userRole),
                  onReorder: onNavigate ? () => onNavigate("purchase-orders", {
                    reorderProductId: p.id,
                    reorderVendorId: lastPO == null ? void 0 : lastPO.vendorId,
                    reorderRate: lastPO == null ? void 0 : lastPO.rate
                  }) : void 0
                }
              )
            },
            p.id
          );
        })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      BatchViewDialog,
      {
        product: batchDialogProduct,
        open: batchDialogProduct !== null,
        onClose: () => setBatchDialogProduct(null),
        getProductBatches,
        canViewCost
      }
    )
  ] });
}
function ProductCard({
  product: p,
  idx,
  isExpanded,
  onToggle,
  getProductStock,
  getProductBatches,
  onViewBatches,
  canViewCost,
  canEdit,
  canDelete,
  onReorder
}) {
  var _a;
  const { categories } = useStore();
  const stock = getProductStock(p.id);
  const batches = getProductBatches(p.id);
  const isLow = stock < p.minStockAlert;
  const cat = ((_a = categories.find((c) => c.id === p.categoryId)) == null ? void 0 : _a.name) ?? "Unknown";
  const worstStatus = batches.reduce(
    (acc, b) => {
      const s = getExpiryStatus(b.expiryDate);
      if (s === "expired") return "expired";
      if (s === "warning" && acc !== "expired") return "warning";
      return acc;
    },
    "normal"
  );
  const unitLabel = p.unitMode === "mixed" && p.lengthUnit && p.weightUnit ? `${p.lengthUnit}+${p.weightUnit}` : p.unit;
  const totalStockDisplay = formatTotalStock(p, batches, stock);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Card,
    {
      "data-ocid": `inventory.item.${idx + 1}`,
      className: `shadow-card border ${isLow ? "border-destructive/30" : worstStatus === "expired" ? "border-red-300" : worstStatus === "warning" ? "border-yellow-300" : "border-border"}`,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Collapsible,
        {
          open: isExpanded,
          onOpenChange: (open) => onToggle(open ? p.id : ""),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsibleTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/40 rounded-lg transition-colors", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `w-10 h-10 rounded-lg flex items-center justify-center ${isLow ? "bg-danger-light" : worstStatus === "expired" ? "bg-red-100" : worstStatus === "warning" ? "bg-yellow-100" : "bg-accent"}`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Package,
                      {
                        size: 18,
                        className: isLow ? "text-danger" : worstStatus === "expired" ? "text-red-600" : worstStatus === "warning" ? "text-yellow-600" : "text-brand-blue"
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold text-sm flex items-center gap-1", children: [
                    p.name,
                    p.unitMode === "mixed" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-[10px] px-1 py-0 h-4 bg-blue-100 text-blue-700 border-0", children: "Mixed" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                    cat,
                    " · ",
                    unitLabel,
                    p.vendorName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-muted-foreground/70", children: [
                      "· ",
                      p.vendorName
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", children: totalStockDisplay }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground flex items-center justify-end gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5 bg-secondary px-1.5 py-0.5 rounded-full", children: [
                      batches.length,
                      " batch",
                      batches.length !== 1 ? "es" : ""
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        "data-ocid": `inventory.item.view_batches.${idx + 1}`,
                        variant: "outline",
                        size: "sm",
                        className: "h-5 px-1.5 text-[10px] gap-0.5 border-primary/30 text-primary hover:bg-primary/5",
                        onClick: (e) => {
                          e.stopPropagation();
                          onViewBatches(p);
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 10 }),
                          "View"
                        ]
                      }
                    )
                  ] })
                ] }),
                isLow && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", className: "text-xs hidden sm:flex", children: "Low Stock" }),
                isLow && onReorder && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    "data-ocid": `inventory.item.reorder.${idx + 1}`,
                    variant: "outline",
                    size: "sm",
                    className: "h-7 px-2 text-[11px] gap-1 border-orange-400 text-orange-600 hover:bg-orange-50 flex-shrink-0",
                    onClick: (e) => {
                      e.stopPropagation();
                      onReorder();
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { size: 11 }),
                      "Reorder"
                    ]
                  }
                ),
                worstStatus === "expired" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "ml-1 text-xs bg-red-100 text-red-700 border-red-200 border hidden sm:flex", children: "Expired ❌" }),
                worstStatus === "warning" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "ml-1 text-xs bg-yellow-100 text-yellow-700 border-yellow-200 border hidden sm:flex", children: "Expiring Soon ⚠️" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 16 }) })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsibleContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pb-4 border-t border-border mt-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-3", children: [
              (p.vendorName || canViewCost && p.purchasePrice != null || p.details) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 grid grid-cols-1 sm:grid-cols-3 gap-2", children: [
                p.vendorName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary/60 rounded-lg p-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Vendor" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium truncate", children: p.vendorName })
                ] }),
                canViewCost && p.purchasePrice != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary/60 rounded-lg p-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Purchase Price" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: fmtCurrency(p.purchasePrice) })
                ] }),
                p.details && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary/60 rounded-lg p-2 sm:col-span-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Notes" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "text-sm font-medium truncate",
                      title: p.details,
                      children: p.details.length > 30 ? `${p.details.slice(0, 30)}...` : p.details
                    }
                  )
                ] })
              ] }),
              p.unitMode === "mixed" && p.meterToKgRatio && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 p-2 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-700", children: [
                "💡 Smart Ratio: 1 ",
                p.lengthUnit,
                " = ",
                p.meterToKgRatio,
                " ",
                p.weightUnit
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide", children: "FIFO Batch Queue (oldest first)" }),
              batches.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground py-2", children: "No stock batches" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-secondary/50", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Batch #" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Date" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Expiry Date" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Qty" }),
                  canViewCost && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Rate (₹)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Value" })
                  ] })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: batches.map((b, bi) => {
                  const expiryStatus = getExpiryStatus(b.expiryDate);
                  const daysLeft = getDaysLeft(b.expiryDate);
                  const rowBg = expiryStatus === "expired" ? "bg-red-50" : expiryStatus === "warning" ? "bg-yellow-50" : "";
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: rowBg, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-xs", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Badge,
                        {
                          variant: "outline",
                          className: "text-[10px] font-mono",
                          children: [
                            "B",
                            String(b.batchNumber ?? bi + 1).padStart(
                              3,
                              "0"
                            )
                          ]
                        }
                      ),
                      bi === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "ml-1 text-[10px] bg-primary/10 text-primary border-0", children: "Next FIFO" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: new Date(b.dateAdded).toLocaleDateString(
                      "en-IN"
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: b.expiryDate ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-0.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: (/* @__PURE__ */ new Date(
                        `${b.expiryDate}T00:00:00`
                      )).toLocaleDateString("en-IN") }),
                      expiryStatus === "expired" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-red-600 font-semibold", children: [
                        "Expired ❌",
                        daysLeft !== null && ` (${Math.abs(daysLeft)}d ago)`
                      ] }),
                      expiryStatus === "warning" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-yellow-600 font-semibold", children: [
                        "Expiring Soon ⚠️",
                        daysLeft !== null && ` (${daysLeft}d left)`
                      ] })
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs font-semibold", children: formatBatchQty(p, b) }),
                    canViewCost && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: fmtCurrency(b.purchaseRate) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: fmtCurrency(b.quantity * b.purchaseRate) })
                    ] })
                  ] }, b.id);
                }) })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid grid-cols-3 gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary rounded-lg p-2 text-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Min Alert" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-bold", children: [
                    p.minStockAlert,
                    " ",
                    p.unit
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary rounded-lg p-2 text-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Sell Price" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", children: fmtCurrency(p.sellingPrice) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary rounded-lg p-2 text-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Batches" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", children: batches.length })
                ] })
              ] }),
              (canEdit || canDelete) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex gap-2 justify-end", children: canEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Badge,
                {
                  variant: "outline",
                  className: "text-xs text-muted-foreground",
                  children: "Edit in Admin Panel"
                }
              ) })
            ] }) }) })
          ]
        }
      )
    }
  );
}
export {
  InventoryPage
};
