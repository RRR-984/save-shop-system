import { l as useStore, h as useAuth, r as reactExports, j as jsxRuntimeExports, z as ShoppingCart, v as Badge, B as Button, m as Plus, ak as Building2, ab as Package, D as CircleCheckBig, a3 as MessageCircle, X, L as Label, I as Input, y as ue, E as Clock, A as TrendingUp, al as TrendingDown, N as TriangleAlert } from "./index-Bt77HP0S.js";
import { C as ChevronDown } from "./chevron-down-CFG9Ipkf.js";
import { M as Mail } from "./mail-Chx5weLP.js";
import { C as Copy } from "./copy-D0QhESaW.js";
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
const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    className: "bg-orange-100 text-orange-700 border-orange-200",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3" })
  },
  received: {
    label: "Received",
    className: "bg-green-100 text-green-700 border-green-200",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-3 h-3" })
  },
  partial: {
    label: "Partial",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-3 h-3" })
  }
};
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`,
      children: [
        cfg.icon,
        cfg.label
      ]
    }
  );
}
function RateChangeBanner({ currentRate, lastRate }) {
  if (!lastRate || currentRate === lastRate) return null;
  const diff = currentRate - lastRate;
  const diffAbs = Math.abs(diff);
  const pct = (diffAbs / lastRate * 100).toFixed(1);
  const isIncrease = diff > 0;
  if (isIncrease) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-sm text-amber-800",
        "data-ocid": "po-rate-change-alert",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-4 h-4 shrink-0 mt-0.5 text-amber-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "⚠️ Rate changed!" }),
            " Previous rate",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmt(lastRate) }),
            " was, now",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmt(currentRate) }),
            " —",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-red-700 font-semibold", children: [
              fmt(diffAbs),
              " more (",
              pct,
              "% change)"
            ] })
          ] })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex items-start gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2.5 text-sm text-green-800",
      "data-ocid": "po-rate-decrease-alert",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "w-4 h-4 shrink-0 mt-0.5 text-green-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "✅ Rate decreased!" }),
          " Previous rate",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmt(lastRate) }),
          " was, now",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmt(currentRate) }),
          " —",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-green-700 font-semibold", children: [
            fmt(diffAbs),
            " less (",
            pct,
            "% change)"
          ] })
        ] })
      ]
    }
  );
}
function CostUpdateDialog({
  productName,
  oldCost,
  newCost,
  onConfirm,
  onCancel
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card w-full max-w-sm rounded-2xl shadow-xl p-5 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-5 h-5 text-amber-600" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-foreground", children: "Cost Price Update?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Vendor rate has changed" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded-xl p-3 space-y-1.5 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground truncate", children: productName }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Old Cost Price" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium line-through text-muted-foreground", children: fmt(oldCost) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "New Cost Price" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-primary", children: fmt(newCost) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "Would you like to update this product's cost price",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "text-foreground", children: [
        fmt(oldCost),
        " → ",
        fmt(newCost)
      ] }),
      "?"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outline",
          className: "flex-1",
          onClick: onCancel,
          "data-ocid": "cost-update-cancel",
          children: "No, Skip"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          className: "flex-1",
          onClick: onConfirm,
          "data-ocid": "cost-update-confirm",
          children: "Yes, Update"
        }
      )
    ] })
  ] }) });
}
function AddPOModal({
  onClose,
  reorderProductId,
  reorderVendorId,
  reorderRate
}) {
  const {
    products,
    purchaseOrders,
    vendors: storeVendors,
    addPurchaseOrder,
    addVendorRateHistory,
    getLastVendorRate,
    updateProduct,
    appConfig
  } = useStore();
  const { currentUser } = useAuth();
  const isReorder = !!reorderProductId;
  const [vendorId, setVendorId] = reactExports.useState(reorderVendorId ?? "");
  const [productId, setProductId] = reactExports.useState(reorderProductId ?? "");
  const [qty, setQty] = reactExports.useState("");
  const [rate, setRate] = reactExports.useState(reorderRate ? String(reorderRate) : "");
  const [transport, setTransport] = reactExports.useState("0");
  const [labour, setLabour] = reactExports.useState("0");
  const [saving, setSaving] = reactExports.useState(false);
  const [showCostUpdateDialog, setShowCostUpdateDialog] = reactExports.useState(false);
  const [pendingPOData, setPendingPOData] = reactExports.useState(null);
  const lastKnownRate = reactExports.useMemo(() => {
    if (!vendorId || !productId) return null;
    const fromHistory = getLastVendorRate(vendorId, productId);
    if (fromHistory != null) return fromHistory;
    const lastPO = [...purchaseOrders].filter((po) => po.vendorId === vendorId && po.productId === productId).sort((a, b) => b.createdAt - a.createdAt)[0];
    return lastPO ? lastPO.rate : null;
  }, [vendorId, productId, getLastVendorRate, purchaseOrders]);
  const handleProductChange = (pid) => {
    setProductId(pid);
    if (!vendorId) {
      const lastPO2 = [...purchaseOrders].filter((po) => po.productId === pid).sort((a, b) => b.createdAt - a.createdAt)[0];
      if (lastPO2) setRate(String(lastPO2.rate));
      return;
    }
    const fromHistory = getLastVendorRate(vendorId, pid);
    if (fromHistory != null) {
      setRate(String(fromHistory));
      return;
    }
    const lastPO = [...purchaseOrders].filter((po) => po.vendorId === vendorId && po.productId === pid).sort((a, b) => b.createdAt - a.createdAt)[0];
    if (lastPO) setRate(String(lastPO.rate));
  };
  const handleVendorChange = (vid) => {
    setVendorId(vid);
    if (!productId) return;
    const fromHistory = getLastVendorRate(vid, productId);
    if (fromHistory != null) {
      setRate(String(fromHistory));
      return;
    }
    const lastPO = [...purchaseOrders].filter((po) => po.vendorId === vid && po.productId === productId).sort((a, b) => b.createdAt - a.createdAt)[0];
    if (lastPO) setRate(String(lastPO.rate));
  };
  const selectedVendor = storeVendors.find((v) => v.id === vendorId);
  const selectedProduct = products.find((p) => p.id === productId);
  const qtyNum = Number.parseFloat(qty) || 0;
  const rateNum = Number.parseFloat(rate) || 0;
  const transportNum = Number.parseFloat(transport) || 0;
  const labourNum = Number.parseFloat(labour) || 0;
  const finalCost = rateNum * qtyNum + transportNum + labourNum;
  const perUnit = qtyNum > 0 ? finalCost / qtyNum : 0;
  const canSave = vendorId && productId && qtyNum > 0 && rateNum > 0;
  const rateChanged = rateNum > 0 && lastKnownRate != null && rateNum !== lastKnownRate;
  async function doSavePO(poData) {
    var _a;
    if (!poData) return;
    await addPurchaseOrder({
      vendorId: poData.vendorId,
      productId: poData.productId,
      qty: poData.qty,
      rate: poData.rate,
      transportCharge: poData.transport,
      labourCharge: poData.labour,
      status: "pending",
      receivedQty: 0,
      createdBy: poData.createdBy
    });
    const lastRate = getLastVendorRate(poData.vendorId, poData.productId);
    const prevPORate = ((_a = [...purchaseOrders].filter(
      (po) => po.vendorId === poData.vendorId && po.productId === poData.productId
    ).sort((a, b) => b.createdAt - a.createdAt)[0]) == null ? void 0 : _a.rate) ?? null;
    const effectiveOldRate = lastRate ?? prevPORate ?? 0;
    if (poData.rate !== lastRate) {
      await addVendorRateHistory({
        vendorId: poData.vendorId,
        productId: poData.productId,
        oldRate: effectiveOldRate,
        newRate: poData.rate,
        changedBy: poData.createdBy
      });
    }
  }
  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      const poData = {
        vendorId,
        productId,
        qty: qtyNum,
        rate: rateNum,
        transport: transportNum,
        labour: labourNum,
        createdBy: (currentUser == null ? void 0 : currentUser.name) ?? "Owner"
      };
      if (appConfig.autoUpdateCostOnVendorRateChange && rateChanged && selectedProduct) {
        await doSavePO(poData);
        updateProduct(productId, { costPrice: rateNum });
        ue.success(`Cost price updated to ${fmt(rateNum)} ✅`);
        onClose();
        return;
      }
      if (rateChanged && selectedProduct) {
        setPendingPOData(poData);
        setShowCostUpdateDialog(true);
        setSaving(false);
        return;
      }
      await doSavePO(poData);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }
  async function handleCostUpdateConfirm() {
    if (!pendingPOData) return;
    setSaving(true);
    try {
      await doSavePO(pendingPOData);
      updateProduct(pendingPOData.productId, { costPrice: pendingPOData.rate });
      ue.success(`Cost price updated to ${fmt(pendingPOData.rate)} ✅`);
    } finally {
      setSaving(false);
      setShowCostUpdateDialog(false);
      onClose();
    }
  }
  async function handleCostUpdateCancel() {
    if (!pendingPOData) return;
    setSaving(true);
    try {
      await doSavePO(pendingPOData);
      ue.success("Purchase order saved");
    } finally {
      setSaving(false);
      setShowCostUpdateDialog(false);
      onClose();
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-foreground text-base", children: isReorder ? "⚡ Quick Reorder" : "New Purchase Order" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: onClose,
            className: "p-1 rounded-lg hover:bg-muted",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5 text-muted-foreground" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-4", children: [
        isReorder && selectedProduct && selectedVendor && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-accent rounded-xl p-3 text-sm text-accent-foreground font-medium", children: [
          "🔄 Quick Reorder: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: selectedProduct.name }),
          " from",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: selectedVendor.name }),
          " @ ",
          fmt(rateNum),
          "/unit"
        ] }),
        !isReorder && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-semibold text-muted-foreground uppercase", children: "Vendor *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: vendorId,
                onChange: (e) => handleVendorChange(e.target.value),
                className: "w-full h-10 px-3 pr-8 rounded-lg border border-input bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring",
                "data-ocid": "po-vendor-select",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "-- Select Vendor --" }),
                  storeVendors.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: v.id, children: [
                    v.name,
                    " (",
                    v.mobile,
                    ")"
                  ] }, v.id))
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" })
          ] }),
          selectedVendor && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground px-1", children: [
            "📞 ",
            selectedVendor.mobile,
            selectedVendor.address ? ` • ${selectedVendor.address}` : ""
          ] })
        ] }),
        !isReorder && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-semibold text-muted-foreground uppercase", children: "Product *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: productId,
                onChange: (e) => handleProductChange(e.target.value),
                className: "w-full h-10 px-3 pr-8 rounded-lg border border-input bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring",
                "data-ocid": "po-product-select",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "-- Select Product --" }),
                  products.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: p.id, children: p.name }, p.id))
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-semibold text-muted-foreground uppercase", children: "Qty *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: "1",
                placeholder: "0",
                value: qty,
                onChange: (e) => setQty(e.target.value),
                "data-ocid": "po-qty-input"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs font-semibold text-muted-foreground uppercase", children: [
              "Rate (₹) *",
              lastKnownRate != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-muted-foreground font-normal normal-case", children: [
                "(Last: ",
                fmt(lastKnownRate),
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: "0",
                placeholder: "0",
                value: rate,
                onChange: (e) => setRate(e.target.value),
                "data-ocid": "po-rate-input",
                className: rateChanged ? "border-amber-400 focus:ring-amber-300" : ""
              }
            )
          ] })
        ] }),
        rateNum > 0 && lastKnownRate != null && rateNum !== lastKnownRate && /* @__PURE__ */ jsxRuntimeExports.jsx(
          RateChangeBanner,
          {
            currentRate: rateNum,
            lastRate: lastKnownRate
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-semibold text-muted-foreground uppercase", children: "Transport (₹)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: "0",
                placeholder: "0",
                value: transport,
                onChange: (e) => setTransport(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-semibold text-muted-foreground uppercase", children: "Labour (₹)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: "0",
                placeholder: "0",
                value: labour,
                onChange: (e) => setLabour(e.target.value)
              }
            )
          ] })
        ] }),
        qtyNum > 0 && rateNum > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-muted/50 border p-3 space-y-1.5 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              "Purchase (",
              qtyNum,
              " × ",
              fmt(rateNum),
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: fmt(rateNum * qtyNum) })
          ] }),
          transportNum > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Transport" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fmt(transportNum) })
          ] }),
          labourNum > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Labour" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fmt(labourNum) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-1.5 flex justify-between font-bold text-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Final Cost (Total)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fmt(finalCost) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-primary font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Per Unit Cost" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fmt(perUnit) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              className: "flex-1",
              onClick: onClose,
              disabled: saving,
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              className: "flex-1",
              onClick: handleSave,
              disabled: !canSave || saving,
              "data-ocid": "po-save-btn",
              children: saving ? "Saving..." : "Save Order"
            }
          )
        ] })
      ] })
    ] }) }),
    showCostUpdateDialog && pendingPOData && selectedProduct && /* @__PURE__ */ jsxRuntimeExports.jsx(
      CostUpdateDialog,
      {
        productName: selectedProduct.name,
        oldCost: selectedProduct.costPrice ?? rateNum,
        newCost: pendingPOData.rate,
        onConfirm: handleCostUpdateConfirm,
        onCancel: handleCostUpdateCancel
      }
    )
  ] });
}
function MarkReceivedModal({
  po,
  productName,
  onClose
}) {
  const {
    markPurchaseReceived,
    addVendorRateHistory,
    getLastVendorRate,
    products,
    updateProduct,
    appConfig
  } = useStore();
  const [receivedQty, setReceivedQty] = reactExports.useState(String(po.qty));
  const [saving, setSaving] = reactExports.useState(false);
  const [showCostUpdateDialog, setShowCostUpdateDialog] = reactExports.useState(false);
  const selectedProduct = products.find((p) => p.id === po.productId);
  async function handleSave() {
    const qty = Number.parseFloat(receivedQty);
    if (!qty || qty <= 0) return;
    setSaving(true);
    try {
      await markPurchaseReceived(po.id, qty);
      const lastRate = getLastVendorRate(po.vendorId, po.productId);
      if (po.rate !== lastRate) {
        await addVendorRateHistory({
          vendorId: po.vendorId,
          productId: po.productId,
          oldRate: lastRate ?? 0,
          newRate: po.rate,
          changedBy: po.createdBy
        });
        if (appConfig.autoUpdateCostOnVendorRateChange && selectedProduct) {
          updateProduct(po.productId, { costPrice: po.rate });
          ue.success(`Cost price auto-updated to ${`₹${po.rate}`}`);
          onClose();
          return;
        }
        if (selectedProduct && lastRate != null && lastRate !== po.rate) {
          setSaving(false);
          setShowCostUpdateDialog(true);
          return;
        }
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card w-full max-w-sm rounded-t-2xl sm:rounded-2xl shadow-xl p-4 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-foreground", children: "Receive Stock ✅" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: onClose,
            className: "p-1 rounded-lg hover:bg-muted",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5 text-muted-foreground" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Product: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: productName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "Ordered: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: po.qty }),
        " units @",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmt(po.rate) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-semibold text-muted-foreground uppercase", children: "Received Qty *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: "1",
            max: po.qty,
            value: receivedQty,
            onChange: (e) => setReceivedQty(e.target.value),
            "data-ocid": "po-received-qty-input"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: 'Partial receive will change status to "Partial"' })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "flex-1", onClick: onClose, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            className: "flex-1",
            onClick: handleSave,
            disabled: saving,
            "data-ocid": "po-mark-received-btn",
            children: saving ? "..." : "Confirm"
          }
        )
      ] })
    ] }) }),
    showCostUpdateDialog && selectedProduct && /* @__PURE__ */ jsxRuntimeExports.jsx(
      CostUpdateDialog,
      {
        productName: selectedProduct.name,
        oldCost: selectedProduct.costPrice ?? po.rate,
        newCost: po.rate,
        onConfirm: () => {
          updateProduct(po.productId, { costPrice: po.rate });
          ue.success("Cost price updated ✅");
          setShowCostUpdateDialog(false);
          onClose();
        },
        onCancel: () => {
          setShowCostUpdateDialog(false);
          onClose();
        }
      }
    )
  ] });
}
function SendOrderModal({
  po,
  vendor,
  productName,
  onClose
}) {
  const total = po.qty * po.rate;
  const message = `Hello ${vendor.name},
We require the following items:
Product: ${productName}
Qty: ${po.qty}
Rate: ₹${po.rate}

Total: ₹${total}

Please confirm the order.`;
  const [copied, setCopied] = reactExports.useState(false);
  function handleWhatsApp() {
    const digits = vendor.mobile.replace(/\D/g, "");
    const mobile10 = digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;
    const cleanMobile = mobile10.length === 10 ? mobile10 : digits;
    window.open(
      `https://wa.me/91${cleanMobile}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  }
  function handleEmail() {
    window.open(
      `mailto:${vendor.email}?subject=${encodeURIComponent(`Purchase Order - ${productName}`)}&body=${encodeURIComponent(message)}`
    );
  }
  function handleCopy() {
    navigator.clipboard.writeText(message).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card w-full max-w-sm rounded-t-2xl sm:rounded-2xl shadow-xl p-4 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-foreground", children: "Send Order Message 📤" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: onClose,
          className: "p-1 rounded-lg hover:bg-muted",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5 text-muted-foreground" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-muted/50 rounded-xl p-3 text-sm text-foreground whitespace-pre-line border", children: message }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          className: "w-full bg-green-600 hover:bg-green-700 text-white gap-2",
          onClick: handleWhatsApp,
          "data-ocid": "po-whatsapp-btn",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "w-4 h-4" }),
            "Send via WhatsApp"
          ]
        }
      ),
      vendor.email && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          className: "w-full gap-2",
          onClick: handleEmail,
          "data-ocid": "po-email-btn",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "w-4 h-4" }),
            "Send via Email"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          className: "w-full gap-2",
          onClick: handleCopy,
          "data-ocid": "po-copy-btn",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-4 h-4" }),
            copied ? "Copied! ✓" : "Copy Message"
          ]
        }
      )
    ] })
  ] }) });
}
function PurchaseOrdersPage({
  reorderProductId,
  reorderVendorId,
  reorderRate
}) {
  const { vendors, products, purchaseOrders } = useStore();
  const { currentUser } = useAuth();
  const role = (currentUser == null ? void 0 : currentUser.role) ?? "staff";
  const canManage = role === "owner" || role === "manager";
  const [filter, setFilter] = reactExports.useState("all");
  const [showAddModal, setShowAddModal] = reactExports.useState(!!reorderProductId);
  const [receivingPO, setReceivingPO] = reactExports.useState(null);
  const [sendingPO, setSendingPO] = reactExports.useState(null);
  const [expandedLedger, setExpandedLedger] = reactExports.useState(false);
  const filteredOrders = reactExports.useMemo(() => {
    const sorted = [...purchaseOrders].sort(
      (a, b) => b.createdAt - a.createdAt
    );
    if (filter === "all") return sorted;
    return sorted.filter((po) => po.status === filter);
  }, [purchaseOrders, filter]);
  const vendorLedger = reactExports.useMemo(() => {
    return vendors.map((v) => {
      const vOrders = purchaseOrders.filter((po) => po.vendorId === v.id);
      if (vOrders.length === 0) return null;
      const totalPurchase = vOrders.reduce(
        (sum, po) => sum + po.qty * po.rate + po.transportCharge + po.labourCharge,
        0
      );
      const received = vOrders.filter(
        (po) => po.status === "received"
      ).length;
      const pending = vOrders.filter((po) => po.status === "pending").length;
      const partial = vOrders.filter((po) => po.status === "partial").length;
      let colorClass = "text-success";
      if (pending === vOrders.length) colorClass = "text-danger";
      else if (pending > 0 || partial > 0) colorClass = "text-warning";
      return {
        vendor: v,
        totalPurchase,
        received,
        pending,
        partial,
        colorClass
      };
    }).filter(Boolean);
  }, [vendors, purchaseOrders]);
  const filterTabs = [
    { id: "all", label: "All", count: purchaseOrders.length },
    {
      id: "pending",
      label: "Pending",
      count: purchaseOrders.filter((p) => p.status === "pending").length
    },
    {
      id: "received",
      label: "Received",
      count: purchaseOrders.filter((p) => p.status === "received").length
    },
    {
      id: "partial",
      label: "Partial",
      count: purchaseOrders.filter((p) => p.status === "partial").length
    }
  ];
  const getProductName = (id) => {
    var _a;
    return ((_a = products.find((p) => p.id === id)) == null ? void 0 : _a.name) ?? "Unknown Product";
  };
  const getVendorName = (id) => {
    var _a;
    return ((_a = vendors.find((v) => v.id === id)) == null ? void 0 : _a.name) ?? "Unknown Vendor";
  };
  const getVendor = (id) => vendors.find((v) => v.id === id);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col min-h-full bg-background page-fade-in", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border-b shadow-card px-4 pt-4 pb-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "w-5 h-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-bold text-foreground", children: "Purchase Orders" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: purchaseOrders.length })
        ] }),
        canManage && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            onClick: () => setShowAddModal(true),
            className: "gap-1 text-xs",
            "data-ocid": "po-add-btn",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5" }),
              "New Order"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 overflow-x-auto", children: filterTabs.map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setFilter(tab.id),
          "data-ocid": `po-filter-${tab.id}`,
          className: `flex-none flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${filter === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
          children: [
            tab.label,
            tab.count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `rounded-full px-1.5 py-0.5 text-xs ${filter === tab.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`,
                children: tab.count
              }
            )
          ]
        },
        tab.id
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 p-3 space-y-2", children: filteredOrders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-col items-center justify-center py-16 gap-3 text-center",
        "data-ocid": "po-empty-state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-2xl bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "w-7 h-7 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "No purchase orders found." }),
          canManage && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "outline",
              onClick: () => setShowAddModal(true),
              className: "gap-1",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5" }),
                "Create First Order"
              ]
            }
          )
        ]
      }
    ) : filteredOrders.map((po) => {
      const productName = getProductName(po.productId);
      const vendorName = getVendorName(po.vendorId);
      const vendor = getVendor(po.vendorId);
      const total = po.qty * po.rate + po.transportCharge + po.labourCharge;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "bg-card rounded-xl border shadow-card p-3 space-y-2",
          "data-ocid": `po-row-${po.id}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-3.5 h-3.5 text-muted-foreground flex-none" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-foreground truncate", children: vendorName })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mt-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-3.5 h-3.5 text-muted-foreground flex-none" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground truncate", children: productName })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: po.status })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 bg-muted/30 rounded-lg px-3 py-2 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Qty" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-foreground", children: po.qty })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Rate" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-foreground", children: fmt(po.rate) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Total" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-primary", children: fmt(total) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "📅 ",
                fmtDate(po.createdAt)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "👤 ",
                po.createdBy
              ] })
            ] }),
            canManage && po.status !== "received" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  className: "flex-1 text-xs gap-1",
                  onClick: () => setReceivingPO(po),
                  "data-ocid": `po-receive-btn-${po.id}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-3.5 h-3.5 text-green-600" }),
                    "Mark Received"
                  ]
                }
              ),
              vendor && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  className: "flex-1 text-xs gap-1",
                  onClick: () => setSendingPO(po),
                  "data-ocid": `po-send-btn-${po.id}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "w-3.5 h-3.5 text-blue-600" }),
                    "Send Order"
                  ]
                }
              )
            ] })
          ]
        },
        po.id
      );
    }) }),
    vendorLedger.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-3 mb-3 bg-card rounded-xl border shadow-card overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          className: "w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-foreground hover:bg-muted/30 transition-colors",
          onClick: () => setExpandedLedger((v) => !v),
          "data-ocid": "po-ledger-toggle",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-4 h-4 text-primary" }),
              "Vendor Ledger"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ChevronDown,
              {
                className: `w-4 h-4 text-muted-foreground transition-transform ${expandedLedger ? "rotate-180" : ""}`
              }
            )
          ]
        }
      ),
      expandedLedger && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t", children: vendorLedger.map(
        ({ vendor, totalPurchase, received, pending, colorClass }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center justify-between px-4 py-3 border-b last:border-b-0 gap-2",
            "data-ocid": `po-ledger-row-${vendor.id}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground truncate", children: vendor.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                    "✅ ",
                    received,
                    " received"
                  ] }),
                  pending > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-orange-600", children: [
                    "⏳ ",
                    pending,
                    " pending"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right flex-none", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm font-bold ${colorClass}`, children: fmt(totalPurchase) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Total" })
              ] })
            ]
          },
          vendor.id
        )
      ) })
    ] }),
    showAddModal && /* @__PURE__ */ jsxRuntimeExports.jsx(
      AddPOModal,
      {
        reorderProductId,
        reorderVendorId,
        reorderRate,
        onClose: () => setShowAddModal(false)
      }
    ),
    receivingPO && /* @__PURE__ */ jsxRuntimeExports.jsx(
      MarkReceivedModal,
      {
        po: receivingPO,
        productName: getProductName(receivingPO.productId),
        onClose: () => setReceivingPO(null)
      }
    ),
    sendingPO && getVendor(sendingPO.vendorId) && /* @__PURE__ */ jsxRuntimeExports.jsx(
      SendOrderModal,
      {
        po: sendingPO,
        vendor: getVendor(sendingPO.vendorId),
        productName: getProductName(sendingPO.productId),
        onClose: () => setSendingPO(null)
      }
    )
  ] });
}
export {
  PurchaseOrdersPage
};
