import { l as useStore, J as useLanguage, r as reactExports, j as jsxRuntimeExports, aL as ArrowDownToLine, aM as ArrowUpFromLine, C as Card, i as CardHeader, k as CardTitle, n as CardContent, L as Label, m as Plus, $ as Separator, v as Badge, I as Input, B as Button, T as Table, o as TableHeader, p as TableRow, q as TableHead, s as TableBody, t as TableCell, y as ue, x as Trash2 } from "./index-CyJThNPE.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-B5_zZfdK.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Bxpy6Yo8.js";
import { S as Switch } from "./switch-2IFIGtoy.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, d as TabsContent } from "./tabs-DlEasSwj.js";
import { V as VoiceInputButton } from "./VoiceInputButton-BQA2VpOB.js";
import { u as useAsyncAction } from "./useAsyncAction-DMbmfuC7.js";
import { c as clearLeadingZeros } from "./numberInput-BP2ScP3W.js";
import { L as Layers } from "./layers-BQcW8ecy.js";
import "./index-CsaT76ve.js";
import "./index-BPYaWAKl.js";
import "./index-DkH1qIwF.js";
import "./chevron-down-CsZruglM.js";
import "./check-TLKRrqsL.js";
import "./chevron-up-CF0EzDAe.js";
function formatBatchQty(product, batch) {
  if (product.unitMode === "mixed" && batch.lengthQty != null && batch.weightQty != null) {
    return `${batch.lengthQty} ${product.lengthUnit || ""} (${batch.weightQty} ${product.weightUnit || ""})`;
  }
  if (product.unitMode === "mixed" && batch.lengthQty != null) {
    return `${batch.lengthQty} ${product.lengthUnit || ""}`;
  }
  return `${batch.quantity} ${product.unit}`;
}
const STOCK_FORM_DRAFT_KEY = "saveshop_stock_form_draft";
function StockPage({
  onNavigate
}) {
  const {
    products,
    transactions,
    addStockIn,
    addStockOut,
    getProductStock,
    getProductBatches,
    addProduct,
    updateProduct,
    addCategory,
    categories,
    shopId,
    appConfig
  } = useStore();
  const { t, language } = useLanguage();
  const [showResumeBanner, setShowResumeBanner] = reactExports.useState(false);
  reactExports.useEffect(() => {
    console.log("[StockPage] shopId:", shopId);
    console.log("[StockPage] products count:", products.length, products);
  }, [shopId, products]);
  const [inProduct, setInProduct] = reactExports.useState("");
  const [inQty, setInQty] = reactExports.useState("");
  const [inRate, setInRate] = reactExports.useState("");
  const [inDate, setInDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [inNote, setInNote] = reactExports.useState("");
  const [inInvoiceNo, setInInvoiceNo] = reactExports.useState("");
  const [inBillNo, setInBillNo] = reactExports.useState("");
  const [inTransport, setInTransport] = reactExports.useState("");
  const [inLabour, setInLabour] = reactExports.useState("");
  const [inOtherCharges, setInOtherCharges] = reactExports.useState("");
  const [inExpiryDate, setInExpiryDate] = reactExports.useState("");
  const [inSellPrice, setInSellPrice] = reactExports.useState("");
  const [inProfitPercent, setInProfitPercent] = reactExports.useState("");
  const [inRetailerPrice, setInRetailerPrice] = reactExports.useState("");
  const [inWholesalerPrice, setInWholesalerPrice] = reactExports.useState("");
  const [inLengthQty, setInLengthQty] = reactExports.useState("");
  const [inWeightQty, setInWeightQty] = reactExports.useState("");
  const [showExtraDetails, setShowExtraDetails] = reactExports.useState(false);
  reactExports.useEffect(() => {
    try {
      const draftKey = `${STOCK_FORM_DRAFT_KEY}_${shopId}`;
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const draft = JSON.parse(raw);
        if ((draft == null ? void 0 : draft.productId) || (draft == null ? void 0 : draft.rate) || (draft == null ? void 0 : draft.qty)) {
          setShowResumeBanner(true);
        }
      }
    } catch {
    }
  }, [shopId]);
  reactExports.useEffect(() => {
    if (!inProduct && !inQty && !inRate) return;
    try {
      const draftKey = `${STOCK_FORM_DRAFT_KEY}_${shopId}`;
      const draft = {
        productId: inProduct,
        qty: inQty,
        rate: inRate,
        transport: inTransport,
        labour: inLabour,
        otherCharges: inOtherCharges,
        sellPrice: inSellPrice,
        profitPercent: inProfitPercent
      };
      localStorage.setItem(draftKey, JSON.stringify(draft));
    } catch {
    }
  }, [
    inProduct,
    inQty,
    inRate,
    inTransport,
    inLabour,
    inOtherCharges,
    inSellPrice,
    inProfitPercent,
    shopId
  ]);
  const [showQuickAdd, setShowQuickAdd] = reactExports.useState(false);
  const [qaName, setQaName] = reactExports.useState("");
  const [qaCategory, setQaCategory] = reactExports.useState("");
  const [qaUnit, setQaUnit] = reactExports.useState("");
  const [qaMinStock, setQaMinStock] = reactExports.useState("");
  const [qaSellPrice, setQaSellPrice] = reactExports.useState("");
  const resetQuickAdd = () => {
    setQaName("");
    setQaCategory("");
    setQaUnit("");
    setQaMinStock("");
    setQaSellPrice("");
  };
  const handleQuickAddProduct = () => {
    var _a;
    if (!qaName.trim()) {
      ue.error("Product name required");
      return;
    }
    if (!qaUnit.trim()) {
      ue.error("Unit required (e.g. kg, piece, liter)");
      return;
    }
    const duplicate = products.find(
      (p) => p.name.trim().toLowerCase() === qaName.trim().toLowerCase()
    );
    if (duplicate) {
      ue.warning(`"${qaName}" already exists`);
      return;
    }
    let catId = (_a = categories.find(
      (c) => c.name.toLowerCase() === qaCategory.trim().toLowerCase()
    )) == null ? void 0 : _a.id;
    if (!catId && qaCategory.trim()) {
      catId = addCategory(qaCategory.trim());
    }
    if (!catId) {
      catId = addCategory("General");
    }
    const newId = addProduct({
      name: qaName.trim(),
      categoryId: catId,
      unit: qaUnit.trim(),
      minStockAlert: qaMinStock ? Number(qaMinStock) : 0,
      sellingPrice: qaSellPrice ? Number(qaSellPrice) : 0,
      unitMode: "single"
    });
    handleInProductChange(newId);
    ue.success(`"${qaName.trim()}" added successfully!`);
    resetQuickAdd();
    setShowQuickAdd(false);
  };
  const [outProduct, setOutProduct] = reactExports.useState("");
  const [outQty, setOutQty] = reactExports.useState("");
  const [outNote, setOutNote] = reactExports.useState("");
  const selectedInProduct = products.find((p) => p.id === inProduct) ?? null;
  const isMixedIn = (selectedInProduct == null ? void 0 : selectedInProduct.unitMode) === "mixed";
  const handleInProductChange = (productId) => {
    setInProduct(productId);
    setInLengthQty("");
    setInWeightQty("");
    setInQty("");
  };
  const handleVoiceParsed = (parsed) => {
    let applied = false;
    if (parsed.quantity !== null) {
      setInQty(String(parsed.quantity));
      applied = true;
    }
    if (parsed.price !== null) {
      setInRate(String(parsed.price));
      applied = true;
    }
    if (parsed.itemName !== null) {
      const match = products.find(
        (p) => p.name.trim().toLowerCase() === parsed.itemName.trim().toLowerCase()
      );
      if (match) {
        handleInProductChange(match.id);
        applied = true;
      }
    }
    if (applied) {
      ue.success(t("Voice input applied — please review and save"));
    }
  };
  const { execute: submitStockIn, isLoading: isStockInSaving } = useAsyncAction(
    async () => {
      if (!inProduct || !inRate) {
        ue.error("Please fill all required fields");
        return;
      }
      let qty;
      let lengthQtyVal;
      let weightQtyVal;
      if (isMixedIn) {
        if (!inLengthQty) {
          ue.error("Please enter Length Quantity");
          return;
        }
        lengthQtyVal = Number(inLengthQty);
        weightQtyVal = inWeightQty ? Number(inWeightQty) : void 0;
        qty = lengthQtyVal;
      } else {
        if (!inQty) {
          ue.error("Please fill all required fields");
          return;
        }
        qty = Number(inQty);
      }
      const rate = Number(inRate);
      if (qty <= 0 || rate <= 0) {
        ue.error("Quantity and rate must be positive");
        return;
      }
      addStockIn(
        inProduct,
        qty,
        rate,
        new Date(inDate).toISOString(),
        inNote || "Stock purchase",
        inInvoiceNo.trim() || void 0,
        inBillNo.trim() || void 0,
        inTransport ? Number(inTransport) : void 0,
        inLabour ? Number(inLabour) : void 0,
        inExpiryDate.trim() || void 0,
        lengthQtyVal,
        weightQtyVal,
        inOtherCharges ? Number(inOtherCharges) : void 0
      );
      if (inProduct) {
        const priceUpdates = {};
        if (inSellPrice && Number(inSellPrice) > 0) {
          priceUpdates.sellingPrice = Number(inSellPrice);
        }
        if (inRetailerPrice && Number(inRetailerPrice) > 0) {
          priceUpdates.retailerPrice = Number(inRetailerPrice);
        }
        if (inWholesalerPrice && Number(inWholesalerPrice) > 0) {
          priceUpdates.wholesalerPrice = Number(inWholesalerPrice);
        }
        if (Object.keys(priceUpdates).length > 0) {
          updateProduct(inProduct, priceUpdates);
        }
      }
      try {
        localStorage.removeItem(`${STOCK_FORM_DRAFT_KEY}_${shopId}`);
        setShowResumeBanner(false);
      } catch {
      }
      ue.success("Stock added successfully!");
      setInQty("");
      setInRate("");
      setInNote("");
      setInInvoiceNo("");
      setInBillNo("");
      setInTransport("");
      setInLabour("");
      setInOtherCharges("");
      setInExpiryDate("");
      setInSellPrice("");
      setInProfitPercent("");
      setInRetailerPrice("");
      setInWholesalerPrice("");
      setInLengthQty("");
      setInWeightQty("");
      if (onNavigate) onNavigate("inventory");
    }
  );
  const handleStockIn = () => {
    void submitStockIn();
  };
  const handleStockOut = () => {
    if (!outProduct || !outQty) {
      ue.error("Please fill all required fields");
      return;
    }
    const qty = Number(outQty);
    if (qty <= 0) {
      ue.error("Quantity must be positive");
      return;
    }
    const available = getProductStock(outProduct);
    if (qty > available) {
      ue.error(`Only ${available} units available in stock`);
      return;
    }
    addStockOut(outProduct, qty, outNote || "Manual stock out");
    ue.success("Stock removed (FIFO deduction applied)");
    setOutQty("");
    setOutNote("");
  };
  const effectiveQty = isMixedIn ? Number(inLengthQty || 0) : Number(inQty || 0);
  const purchaseSubtotal = Number(inRate || 0) * effectiveQty;
  const totalFinalCost = purchaseSubtotal + Number(inTransport || 0) + Number(inLabour || 0) + Number(inOtherCharges || 0);
  const inPerUnitCost = effectiveQty > 0 ? totalFinalCost / effectiveQty : 0;
  const inTotalSellingPrice = inProfitPercent !== "" && totalFinalCost > 0 ? totalFinalCost + totalFinalCost * Number(inProfitPercent) / 100 : inSellPrice !== "" && effectiveQty > 0 ? Number(inSellPrice) * effectiveQty : 0;
  const inPerUnitSellingPrice = effectiveQty > 0 && inTotalSellingPrice > 0 ? inTotalSellingPrice / effectiveQty : 0;
  const selectedOutProduct = products.find((p) => p.id === outProduct);
  const outBatches = outProduct ? getProductBatches(outProduct) : [];
  const outTotalStock = outProduct ? getProductStock(outProduct) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 md:px-6 pb-6 flex flex-col gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: "Stock Management" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Add or remove stock with automatic FIFO deduction" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "in", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsList,
          {
            "data-ocid": "stock.tab",
            className: "mb-4 flex-wrap h-auto gap-1",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "in", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownToLine, { size: 14, className: "mr-2" }),
                " Stock In"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "bulk", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { size: 14, className: "mr-2" }),
                " Bulk Stock In"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "out", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpFromLine, { size: 14, className: "mr-2" }),
                " Stock Out"
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "in", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card border-border max-w-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownToLine, { size: 16, className: "text-success" }),
            " Add Stock (Incoming)"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Product *" }),
                (appConfig.featureMode ?? 3) === 3 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  VoiceInputButton,
                  {
                    compact: true,
                    onParsed: handleVoiceParsed,
                    lang: language === "hi" ? "hi-IN" : "en-IN",
                    "data-ocid": "stock.in.voice_input.button"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: inProduct,
                  onValueChange: handleInProductChange,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "data-ocid": "stock.in.product.select", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select product" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          type: "button",
                          "data-ocid": "stock.in.add_new_product.button",
                          className: "flex w-full items-center gap-2 px-2 py-1.5 text-sm font-medium text-primary cursor-pointer rounded-sm hover:bg-primary/10 focus-visible:bg-primary/10 outline-none transition-colors",
                          onClick: (e) => {
                            e.stopPropagation();
                            setShowQuickAdd(true);
                          },
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "shrink-0" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Add New Product" })
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "my-1" }),
                      products.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: p.id, children: [
                        p.name,
                        " ",
                        p.unitMode === "mixed" ? `(Mixed: ${p.lengthUnit}+${p.weightUnit})` : `(Stock: ${getProductStock(p.id)} ${p.unit})`
                      ] }, p.id))
                    ] })
                  ]
                }
              )
            ] }),
            isMixedIn && selectedInProduct && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-2 bg-blue-50 rounded-md border border-blue-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs bg-blue-100 text-blue-700 border-0", children: "Mixed Unit" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                selectedInProduct.lengthUnit,
                " +",
                " ",
                selectedInProduct.weightUnit,
                selectedInProduct.meterToKgRatio && ` • 1 ${selectedInProduct.lengthUnit} = ${selectedInProduct.meterToKgRatio} ${selectedInProduct.weightUnit}`
              ] })
            ] }),
            isMixedIn && selectedInProduct ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 p-3 rounded-lg border border-primary/20 bg-primary/5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: "Quantity (Mixed Unit)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm", children: [
                    selectedInProduct.lengthUnit || "Length",
                    " Qty *"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      "data-ocid": "stock.in.length_qty.input",
                      type: "number",
                      placeholder: `e.g. 10 ${selectedInProduct.lengthUnit || "meter"}`,
                      value: inLengthQty,
                      onFocus: (e) => {
                        if (e.target.value === "0") e.target.select();
                      },
                      onChange: (e) => {
                        const val = clearLeadingZeros(e.target.value);
                        setInLengthQty(val);
                        if (selectedInProduct.meterToKgRatio && val !== "") {
                          const wt = Number(val) * selectedInProduct.meterToKgRatio;
                          setInWeightQty(wt.toFixed(2));
                        }
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm", children: [
                    selectedInProduct.weightUnit || "Weight",
                    " Qty"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      "data-ocid": "stock.in.weight_qty.input",
                      type: "number",
                      placeholder: `e.g. 25 ${selectedInProduct.weightUnit || "kg"}`,
                      value: inWeightQty,
                      onFocus: (e) => {
                        if (e.target.value === "0") e.target.select();
                      },
                      onChange: (e) => {
                        const val = clearLeadingZeros(e.target.value);
                        setInWeightQty(val);
                        if (selectedInProduct.meterToKgRatio && val !== "") {
                          const len = Number(val) / selectedInProduct.meterToKgRatio;
                          setInLengthQty(len.toFixed(2));
                        }
                      }
                    }
                  )
                ] })
              ] }),
              inLengthQty && inWeightQty && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-primary", children: [
                "📦 Will save:",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                  inLengthQty,
                  " ",
                  selectedInProduct.lengthUnit
                ] }),
                " ",
                "+",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                  inWeightQty,
                  " ",
                  selectedInProduct.weightUnit
                ] })
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Quantity *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    "data-ocid": "stock.in.qty.input",
                    type: "number",
                    placeholder: "e.g. 50",
                    value: inQty,
                    onFocus: (e) => {
                      if (e.target.value === "0") e.target.select();
                    },
                    onChange: (e) => {
                      const qty = clearLeadingZeros(e.target.value);
                      setInQty(qty);
                      const qtyNum = Number(qty || 0);
                      const cost = qtyNum > 0 ? Number(inRate || 0) + (Number(inTransport || 0) + Number(inLabour || 0)) / qtyNum : Number(inRate || 0);
                      if (inProfitPercent !== "" && cost > 0) {
                        const sp = cost + cost * Number(inProfitPercent) / 100;
                        setInSellPrice(sp.toFixed(2));
                      } else if (inSellPrice !== "" && cost > 0) {
                        const pct = (Number(inSellPrice) - cost) / cost * 100;
                        setInProfitPercent(pct.toFixed(2));
                      }
                    }
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Purchase Rate (₹) *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    "data-ocid": "stock.in.rate.input",
                    type: "number",
                    placeholder: "e.g. 80",
                    value: inRate,
                    onFocus: (e) => {
                      if (e.target.value === "0") e.target.select();
                    },
                    onChange: (e) => {
                      const rate = clearLeadingZeros(e.target.value);
                      setInRate(rate);
                      const qty = Number(inQty || 0);
                      const cost = qty > 0 ? Number(rate) + (Number(inTransport || 0) + Number(inLabour || 0)) / qty : Number(rate);
                      if (inProfitPercent !== "" && cost > 0) {
                        const sp = cost + cost * Number(inProfitPercent) / 100;
                        setInSellPrice(sp.toFixed(2));
                      } else if (inSellPrice !== "" && cost > 0) {
                        const pct = (Number(inSellPrice) - cost) / cost * 100;
                        setInProfitPercent(pct.toFixed(2));
                      }
                    }
                  }
                )
              ] })
            ] }),
            isMixedIn && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Purchase Rate (₹) *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  "data-ocid": "stock.in.rate.input",
                  type: "number",
                  placeholder: "e.g. 80",
                  value: inRate,
                  onFocus: (e) => {
                    if (e.target.value === "0") e.target.select();
                  },
                  onChange: (e) => setInRate(clearLeadingZeros(e.target.value))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Purchase Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  "data-ocid": "stock.in.date.input",
                  type: "date",
                  value: inDate,
                  onChange: (e) => setInDate(e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Expiry Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  "data-ocid": "stock.in.expiry_date.input",
                  type: "date",
                  value: inExpiryDate,
                  onChange: (e) => setInExpiryDate(e.target.value)
                }
              )
            ] }),
            !isMixedIn && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border pt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3", children: "Selling Prices" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Regular Sell Price (₹)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      "data-ocid": "stock.in.sell_price.input",
                      type: "number",
                      placeholder: "e.g. 120",
                      value: inSellPrice,
                      onFocus: (e) => {
                        if (e.target.value === "0") e.target.select();
                      },
                      onChange: (e) => {
                        const sp = clearLeadingZeros(e.target.value);
                        setInSellPrice(sp);
                        if (totalFinalCost > 0 && sp !== "" && effectiveQty > 0) {
                          const totalSell = Number(sp) * effectiveQty;
                          const pct = (totalSell - totalFinalCost) / totalFinalCost * 100;
                          setInProfitPercent(pct.toFixed(2));
                        } else {
                          setInProfitPercent("");
                        }
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Profit %" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      "data-ocid": "stock.in.profit_percent.input",
                      type: "number",
                      min: "0",
                      placeholder: "e.g. 20",
                      value: inProfitPercent,
                      onFocus: (e) => {
                        if (e.target.value === "0") e.target.select();
                      },
                      onChange: (e) => {
                        const pct = clearLeadingZeros(e.target.value);
                        if (Number(pct) < 0) return;
                        setInProfitPercent(pct);
                        if (totalFinalCost > 0 && pct !== "" && effectiveQty > 0) {
                          const totalSell = totalFinalCost + totalFinalCost * Number(pct) / 100;
                          setInSellPrice(
                            (totalSell / effectiveQty).toFixed(2)
                          );
                        }
                      }
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Retailer Price (₹)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      "data-ocid": "stock.in.retailer_price.input",
                      type: "number",
                      placeholder: "e.g. 110",
                      value: inRetailerPrice,
                      onFocus: (e) => {
                        if (e.target.value === "0") e.target.select();
                      },
                      onChange: (e) => setInRetailerPrice(
                        clearLeadingZeros(e.target.value)
                      )
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "दुकानदार price" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Wholesaler Price (₹)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      "data-ocid": "stock.in.wholesaler_price.input",
                      type: "number",
                      placeholder: "e.g. 100",
                      value: inWholesalerPrice,
                      onFocus: (e) => {
                        if (e.target.value === "0") e.target.select();
                      },
                      onChange: (e) => setInWholesalerPrice(
                        clearLeadingZeros(e.target.value)
                      )
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "थोक price" })
                ] })
              ] })
            ] }),
            (effectiveQty > 0 || Number(inRate) > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary/50 rounded-lg p-3 text-sm space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground flex items-center gap-1", children: "📦 Cost & Profit Summary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Purchase: ₹",
                    inRate || 0,
                    " × ",
                    effectiveQty || 0
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground font-medium", children: [
                    "₹",
                    purchaseSubtotal.toFixed(2)
                  ] })
                ] }),
                Number(inTransport) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "+ Transport" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground", children: [
                    "₹",
                    Number(inTransport).toFixed(2)
                  ] })
                ] }),
                Number(inLabour) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "+ Labour" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground", children: [
                    "₹",
                    Number(inLabour).toFixed(2)
                  ] })
                ] }),
                Number(inOtherCharges) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "+ Other Charges" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground", children: [
                    "₹",
                    Number(inOtherCharges).toFixed(2)
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-t border-border pt-1 mt-1 font-semibold text-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Final Cost (Total)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "₹",
                    totalFinalCost.toFixed(2)
                  ] })
                ] }),
                effectiveQty > 0 && inPerUnitCost > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-blue-600 dark:text-blue-400", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Per Unit Cost" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "₹",
                    inPerUnitCost.toFixed(2)
                  ] })
                ] }),
                inTotalSellingPrice > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-green-600 dark:text-green-400 font-semibold border-t border-border pt-1 mt-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Selling Price (Total)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      "₹",
                      inTotalSellingPrice.toFixed(2)
                    ] })
                  ] }),
                  effectiveQty > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-green-600 dark:text-green-400", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Per Unit Selling Price" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      "₹",
                      inPerUnitSellingPrice.toFixed(2)
                    ] })
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 py-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Switch,
                {
                  id: "extra-details-toggle",
                  "data-ocid": "stock.in.extra_details.toggle",
                  checked: showExtraDetails,
                  onCheckedChange: setShowExtraDetails
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "label",
                {
                  htmlFor: "extra-details-toggle",
                  className: "text-sm font-medium text-indigo-600 cursor-pointer select-none",
                  children: "+ Extra Details (Invoice, Charges, Notes)"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: showExtraDetails ? "block" : "none" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border pt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3", children: "Purchase Details (Optional)" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Invoice No" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      "data-ocid": "stock.in.invoice_no.input",
                      placeholder: "e.g. INV-001",
                      value: inInvoiceNo,
                      onChange: (e) => setInInvoiceNo(e.target.value)
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Bill No" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      "data-ocid": "stock.in.bill_no.input",
                      placeholder: "e.g. BILL-2024-01",
                      value: inBillNo,
                      onChange: (e) => setInBillNo(e.target.value)
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Transport Charge (₹)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      "data-ocid": "stock.in.transport.input",
                      type: "number",
                      placeholder: "0",
                      value: inTransport,
                      onFocus: (e) => {
                        if (e.target.value === "0") e.target.select();
                      },
                      onChange: (e) => {
                        const tc = clearLeadingZeros(e.target.value);
                        setInTransport(tc);
                        if (!isMixedIn) {
                          const qty = effectiveQty;
                          const totalCost = Number(inRate || 0) * qty + Number(tc) + Number(inLabour || 0) + Number(inOtherCharges || 0);
                          if (inProfitPercent !== "" && totalCost > 0 && qty > 0) {
                            const totalSell = totalCost + totalCost * Number(inProfitPercent) / 100;
                            setInSellPrice((totalSell / qty).toFixed(2));
                          } else if (inSellPrice !== "" && totalCost > 0 && qty > 0) {
                            const totalSell = Number(inSellPrice) * qty;
                            const pct = (totalSell - totalCost) / totalCost * 100;
                            setInProfitPercent(pct.toFixed(2));
                          }
                        }
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Labour Charge (₹)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      "data-ocid": "stock.in.labour.input",
                      type: "number",
                      placeholder: "0",
                      value: inLabour,
                      onFocus: (e) => {
                        if (e.target.value === "0") e.target.select();
                      },
                      onChange: (e) => {
                        const lc = clearLeadingZeros(e.target.value);
                        setInLabour(lc);
                        if (!isMixedIn) {
                          const qty = effectiveQty;
                          const totalCost = Number(inRate || 0) * qty + Number(inTransport || 0) + Number(lc) + Number(inOtherCharges || 0);
                          if (inProfitPercent !== "" && totalCost > 0 && qty > 0) {
                            const totalSell = totalCost + totalCost * Number(inProfitPercent) / 100;
                            setInSellPrice((totalSell / qty).toFixed(2));
                          } else if (inSellPrice !== "" && totalCost > 0 && qty > 0) {
                            const totalSell = Number(inSellPrice) * qty;
                            const pct = (totalSell - totalCost) / totalCost * 100;
                            setInProfitPercent(pct.toFixed(2));
                          }
                        }
                      }
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Other Charges (₹)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    "data-ocid": "stock.in.other_charges.input",
                    type: "number",
                    placeholder: "0",
                    value: inOtherCharges,
                    onFocus: (e) => {
                      if (e.target.value === "0") e.target.select();
                    },
                    onChange: (e) => {
                      const oc = clearLeadingZeros(e.target.value);
                      setInOtherCharges(oc);
                      if (!isMixedIn) {
                        const qty = effectiveQty;
                        const totalCost = Number(inRate || 0) * qty + Number(inTransport || 0) + Number(inLabour || 0) + Number(oc);
                        if (inProfitPercent !== "" && totalCost > 0 && qty > 0) {
                          const totalSell = totalCost + totalCost * Number(inProfitPercent) / 100;
                          setInSellPrice((totalSell / qty).toFixed(2));
                        } else if (inSellPrice !== "" && totalCost > 0 && qty > 0) {
                          const totalSell = Number(inSellPrice) * qty;
                          const pct = (totalSell - totalCost) / totalCost * 100;
                          setInProfitPercent(pct.toFixed(2));
                        }
                      }
                    }
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Note" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    "data-ocid": "stock.in.note.input",
                    placeholder: "e.g. Purchased from supplier",
                    value: inNote,
                    onChange: (e) => setInNote(e.target.value)
                  }
                )
              ] })
            ] }) }),
            showResumeBanner && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-800", children: "📋 You have unsaved data from last time." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    className: "h-7 text-xs border-amber-300 text-amber-800 hover:bg-amber-100",
                    onClick: () => {
                      try {
                        const raw = localStorage.getItem(
                          `${STOCK_FORM_DRAFT_KEY}_${shopId}`
                        );
                        if (raw) {
                          const draft = JSON.parse(raw);
                          if (draft.productId)
                            setInProduct(draft.productId);
                          if (draft.qty) setInQty(draft.qty);
                          if (draft.rate) setInRate(draft.rate);
                          if (draft.transport)
                            setInTransport(draft.transport);
                          if (draft.labour) setInLabour(draft.labour);
                          if (draft.otherCharges)
                            setInOtherCharges(draft.otherCharges);
                          if (draft.sellPrice)
                            setInSellPrice(draft.sellPrice);
                          if (draft.profitPercent)
                            setInProfitPercent(draft.profitPercent);
                        }
                      } catch {
                      }
                      setShowResumeBanner(false);
                    },
                    children: "Resume"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    variant: "ghost",
                    className: "h-7 text-xs text-amber-700",
                    onClick: () => {
                      try {
                        localStorage.removeItem(
                          `${STOCK_FORM_DRAFT_KEY}_${shopId}`
                        );
                      } catch {
                      }
                      setShowResumeBanner(false);
                    },
                    children: "Discard"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                "data-ocid": "stock.in.submit_button",
                className: "w-full",
                disabled: isStockInSaving,
                onClick: handleStockIn,
                children: isStockInSaving ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" }),
                  "Saving..."
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownToLine, { size: 16, className: "mr-2" }),
                  " Add Stock"
                ] })
              }
            )
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "bulk", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BulkStockIn, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "out", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card border-border max-w-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpFromLine, { size: 16, className: "text-danger" }),
            " Remove Stock (Outgoing)"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Product *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: outProduct, onValueChange: setOutProduct, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "data-ocid": "stock.out.product.select", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select product" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: products.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: p.id, children: [
                  p.name,
                  " (Stock: ",
                  getProductStock(p.id),
                  " ",
                  p.unit,
                  ")"
                ] }, p.id)) })
              ] })
            ] }),
            outProduct && selectedOutProduct && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary rounded-lg p-3 space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Available:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold", children: [
                  selectedOutProduct.unitMode === "mixed" ? /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: (() => {
                    const batches = getProductBatches(outProduct);
                    const totalLength = batches.reduce(
                      (s, b) => s + (b.lengthQty ?? b.quantity),
                      0
                    );
                    const totalWeight = batches.reduce(
                      (s, b) => s + (b.weightQty ?? 0),
                      0
                    );
                    return totalWeight > 0 ? `${totalLength} ${selectedOutProduct.lengthUnit} (${totalWeight} ${selectedOutProduct.weightUnit})` : `${totalLength} ${selectedOutProduct.lengthUnit}`;
                  })() }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    outTotalStock,
                    " ",
                    selectedOutProduct.unit
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-xs font-normal text-muted-foreground", children: [
                    "(",
                    outBatches.length,
                    " batch",
                    outBatches.length !== 1 ? "es" : "",
                    ")"
                  ] })
                ] })
              ] }),
              outBatches.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1 pr-2 text-muted-foreground font-medium", children: "Batch #" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1 pr-2 text-muted-foreground font-medium", children: "Date" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-1 pr-2 text-muted-foreground font-medium", children: "Qty" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-1 text-muted-foreground font-medium", children: "Rate (₹)" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: outBatches.map((b, bi) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "tr",
                  {
                    className: "border-b border-border/50 last:border-0",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 pr-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          Badge,
                          {
                            variant: "outline",
                            className: "text-[10px] px-1 py-0 h-4",
                            children: [
                              "Batch ",
                              bi + 1
                            ]
                          }
                        ),
                        bi === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-[10px] px-1 py-0 h-4 bg-primary/10 text-primary border-0", children: "Next FIFO" })
                      ] }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 pr-2 text-muted-foreground", children: new Date(b.dateAdded).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit"
                        }
                      ) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 pr-2 text-right font-semibold", children: formatBatchQty(selectedOutProduct, b) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-1.5 text-right", children: [
                        "₹",
                        b.purchaseRate.toLocaleString("en-IN")
                      ] })
                    ]
                  },
                  b.id
                )) })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Quantity *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  "data-ocid": "stock.out.qty.input",
                  type: "number",
                  placeholder: "e.g. 10",
                  value: outQty,
                  onFocus: (e) => {
                    if (e.target.value === "0") e.target.select();
                  },
                  onChange: (e) => setOutQty(clearLeadingZeros(e.target.value))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Reason" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  "data-ocid": "stock.out.note.input",
                  placeholder: "e.g. Damaged, Expired",
                  value: outNote,
                  onChange: (e) => setOutNote(e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                "data-ocid": "stock.out.submit_button",
                className: "w-full",
                variant: "destructive",
                onClick: handleStockOut,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpFromLine, { size: 16, className: "mr-2" }),
                  " Remove Stock (FIFO)"
                ]
              }
            )
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Recent Stock Transactions" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-secondary/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Product" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Qty" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Rate/Unit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Note" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Date" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            transactions.slice(0, 20).map((tx, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(TxRow, { tx, idx }, tx.id)),
            transactions.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { "data-ocid": "stock.transactions.empty_state", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TableCell,
              {
                colSpan: 6,
                className: "text-center py-8 text-muted-foreground text-sm",
                children: "No transactions yet"
              }
            ) })
          ] })
        ] }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: showQuickAdd,
        onOpenChange: (open) => {
          if (!open) resetQuickAdd();
          setShowQuickAdd(open);
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DialogContent,
          {
            "data-ocid": "stock.quick_add_product.dialog",
            className: "max-w-sm w-full",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2 text-base", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16, className: "text-primary" }),
                " Add New Product"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm", children: [
                    "Product Name ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      "data-ocid": "stock.quick_add.name.input",
                      placeholder: "e.g. Basmati Rice",
                      value: qaName,
                      onChange: (e) => setQaName(e.target.value),
                      autoFocus: true
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Category" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        "data-ocid": "stock.quick_add.category.input",
                        placeholder: "e.g. Grains",
                        value: qaCategory,
                        onChange: (e) => setQaCategory(e.target.value),
                        list: "qa-category-suggestions"
                      }
                    ),
                    categories.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "qa-category-suggestions", children: categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c.name }, c.id)) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm", children: [
                      "Unit ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        "data-ocid": "stock.quick_add.unit.input",
                        placeholder: "kg / piece / liter",
                        value: qaUnit,
                        onChange: (e) => setQaUnit(e.target.value)
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Min Stock Alert" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        "data-ocid": "stock.quick_add.min_stock.input",
                        type: "number",
                        placeholder: "e.g. 5",
                        value: qaMinStock,
                        onChange: (e) => setQaMinStock(e.target.value)
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Selling Price (₹)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        "data-ocid": "stock.quick_add.sell_price.input",
                        type: "number",
                        placeholder: "e.g. 120",
                        value: qaSellPrice,
                        onChange: (e) => setQaSellPrice(e.target.value)
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "* Required fields. Other details can be edited from Admin Panel later." }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "outline",
                      className: "flex-1",
                      onClick: () => {
                        resetQuickAdd();
                        setShowQuickAdd(false);
                      },
                      children: "Cancel"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      "data-ocid": "stock.quick_add.save.button",
                      className: "flex-1",
                      onClick: handleQuickAddProduct,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
                        " Save & Select"
                      ]
                    }
                  )
                ] })
              ] })
            ]
          }
        )
      }
    )
  ] });
}
function makeBulkRow() {
  return {
    id: `row_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    productId: "",
    qty: "",
    rate: "",
    transport: "",
    labour: "",
    sellPrice: "",
    profitPct: ""
  };
}
function BulkStockIn() {
  const {
    products,
    vendors,
    categories,
    addStockIn,
    addProduct,
    addCategory,
    getProductStock,
    getLastVendorRate
  } = useStore();
  const [vendorId, setVendorId] = reactExports.useState("");
  const [date, setDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [billNo, setBillNo] = reactExports.useState("");
  const [rows, setRows] = reactExports.useState([
    makeBulkRow(),
    makeBulkRow(),
    makeBulkRow()
  ]);
  const [showQA, setShowQA] = reactExports.useState(false);
  const [qaTargetRowId, setQaTargetRowId] = reactExports.useState(null);
  const [qaName, setQaName] = reactExports.useState("");
  const [qaCategory, setQaCategory] = reactExports.useState("");
  const [qaUnit, setQaUnit] = reactExports.useState("");
  const [qaMinStock, setQaMinStock] = reactExports.useState("");
  const [qaSellPrice, setQaSellPrice] = reactExports.useState("");
  const resetQA = () => {
    setQaName("");
    setQaCategory("");
    setQaUnit("");
    setQaMinStock("");
    setQaSellPrice("");
  };
  const calcFinalCost = (row) => {
    const qty = Number(row.qty || 0);
    const rate = Number(row.rate || 0);
    return rate * qty + Number(row.transport || 0) + Number(row.labour || 0);
  };
  const calcPerUnitCost = (row) => {
    const qty = Number(row.qty || 0);
    if (qty <= 0) return 0;
    return calcFinalCost(row) / qty;
  };
  const validRowCount = rows.filter(
    (r) => r.productId && Number(r.qty) > 0 && Number(r.rate) > 0
  ).length;
  const updateRow = (id, changes) => {
    setRows(
      (prev) => prev.map((r) => r.id === id ? { ...r, ...changes } : r)
    );
  };
  const recalcSell = (row, overrides = {}) => {
    const merged = { ...row, ...overrides };
    const qty = Number(merged.qty || 0);
    const finalCost = calcFinalCost(merged);
    if (overrides.profitPct !== void 0) {
      const pct = Number(merged.profitPct || 0);
      if (finalCost > 0 && qty > 0) {
        const totalSell = finalCost + finalCost * pct / 100;
        return {
          profitPct: merged.profitPct,
          sellPrice: (totalSell / qty).toFixed(2)
        };
      }
      return { profitPct: merged.profitPct };
    }
    if (overrides.sellPrice !== void 0) {
      if (finalCost > 0 && qty > 0 && Number(merged.sellPrice) > 0) {
        const totalSell = Number(merged.sellPrice) * qty;
        const pct = (totalSell - finalCost) / finalCost * 100;
        return { sellPrice: merged.sellPrice, profitPct: pct.toFixed(2) };
      }
      return { sellPrice: merged.sellPrice };
    }
    return {};
  };
  const handleProductChange = (rowId, productId) => {
    if (productId === "__new__") {
      setQaTargetRowId(rowId);
      setShowQA(true);
      return;
    }
    const changes = { productId, rate: "" };
    if (vendorId && productId) {
      const lastRate = getLastVendorRate(vendorId, productId);
      if (lastRate != null) {
        changes.rate = String(lastRate);
      }
    }
    updateRow(rowId, changes);
  };
  const handleVendorChange = (newVendorId) => {
    setVendorId(newVendorId);
    setRows(
      (prev) => prev.map((r) => {
        if (!r.productId) return r;
        const lastRate = getLastVendorRate(newVendorId, r.productId);
        if (lastRate != null) return { ...r, rate: String(lastRate) };
        return r;
      })
    );
  };
  const handleQuickAdd = () => {
    var _a;
    if (!qaName.trim()) {
      ue.error("Product name required");
      return;
    }
    if (!qaUnit.trim()) {
      ue.error("Unit required");
      return;
    }
    const dup = products.find(
      (p) => p.name.trim().toLowerCase() === qaName.trim().toLowerCase()
    );
    if (dup) {
      ue.warning(`"${qaName}" already exists`);
      return;
    }
    let catId = (_a = categories.find(
      (c) => c.name.toLowerCase() === qaCategory.trim().toLowerCase()
    )) == null ? void 0 : _a.id;
    if (!catId && qaCategory.trim()) catId = addCategory(qaCategory.trim());
    if (!catId) catId = addCategory("General");
    const newId = addProduct({
      name: qaName.trim(),
      categoryId: catId,
      unit: qaUnit.trim(),
      minStockAlert: qaMinStock ? Number(qaMinStock) : 0,
      sellingPrice: qaSellPrice ? Number(qaSellPrice) : 0,
      unitMode: "single"
    });
    if (qaTargetRowId) {
      updateRow(qaTargetRowId, { productId: newId });
    }
    ue.success(`"${qaName.trim()}" added successfully!`);
    resetQA();
    setShowQA(false);
  };
  const handleSaveAll = () => {
    const validRows = rows.filter(
      (r) => r.productId && Number(r.qty) > 0 && Number(r.rate) > 0
    );
    if (validRows.length === 0) {
      ue.error(
        "Please fill product, quantity, and rate in at least one row"
      );
      return;
    }
    const dateIso = new Date(date).toISOString();
    for (const row of validRows) {
      addStockIn(
        row.productId,
        Number(row.qty),
        Number(row.rate),
        dateIso,
        "Bulk stock purchase",
        void 0,
        billNo.trim() || void 0,
        row.transport ? Number(row.transport) : void 0,
        row.labour ? Number(row.labour) : void 0,
        void 0,
        void 0,
        void 0,
        void 0
      );
    }
    ue.success(`${validRows.length} products stock added successfully! ✅`);
    setRows([makeBulkRow(), makeBulkRow(), makeBulkRow()]);
    setBillNo("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { size: 16, className: "text-primary" }),
        "Bulk Stock In — Ek Saath Kai Products"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Vendor (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: vendorId, onValueChange: handleVendorChange, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "data-ocid": "bulk.vendor.select", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select vendor" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— No Vendor —" }),
              vendors.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v.id, children: v.name }, v.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Purchase Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              "data-ocid": "bulk.date.input",
              type: "date",
              value: date,
              onChange: (e) => setDate(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Bill No (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              "data-ocid": "bulk.bill_no.input",
              placeholder: "e.g. BILL-001",
              value: billNo,
              onChange: (e) => setBillNo(e.target.value)
            }
          )
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "shadow-card border-border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium text-muted-foreground min-w-[180px]", children: "Product *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium text-muted-foreground w-[90px]", children: "Qty *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium text-muted-foreground w-[100px]", children: "Rate (₹) *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium text-muted-foreground w-[90px]", children: "Transport" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium text-muted-foreground w-[90px]", children: "Labour" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium text-muted-foreground w-[100px]", children: "Sell Price" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium text-muted-foreground w-[80px]", children: "Profit %" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center px-3 py-2 font-medium text-muted-foreground w-[80px]", children: "Lagat/Unit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-10" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.map((row, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        BulkRowDesktop,
        {
          row,
          idx,
          products,
          canDelete: rows.length > 1,
          calcPerUnitCost,
          getProductStock,
          onProductChange: (pid) => handleProductChange(row.id, pid),
          onQtyChange: (v) => {
            const qty = clearLeadingZeros(v);
            const extra = recalcSell(row, { qty });
            updateRow(row.id, { qty, ...extra });
          },
          onRateChange: (v) => {
            const rate = clearLeadingZeros(v);
            const extra = recalcSell(row, { rate });
            updateRow(row.id, { rate, ...extra });
          },
          onTransportChange: (v) => {
            const transport = clearLeadingZeros(v);
            const extra = recalcSell(row, { transport });
            updateRow(row.id, { transport, ...extra });
          },
          onLabourChange: (v) => {
            const labour = clearLeadingZeros(v);
            const extra = recalcSell(row, { labour });
            updateRow(row.id, { labour, ...extra });
          },
          onSellPriceChange: (v) => {
            const sellPrice = clearLeadingZeros(v);
            const extra = recalcSell(row, { sellPrice });
            updateRow(row.id, { ...extra });
          },
          onProfitPctChange: (v) => {
            if (Number(v) < 0) return;
            const profitPct = clearLeadingZeros(v);
            const extra = recalcSell(row, { profitPct });
            updateRow(row.id, { ...extra });
          },
          onDelete: () => setRows((prev) => prev.filter((r) => r.id !== row.id))
        },
        row.id
      )) })
    ] }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-3 md:hidden", children: rows.map((row, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      BulkRowMobile,
      {
        row,
        idx,
        products,
        canDelete: rows.length > 1,
        calcFinalCost,
        calcPerUnitCost,
        getProductStock,
        onProductChange: (pid) => handleProductChange(row.id, pid),
        onQtyChange: (v) => {
          const qty = clearLeadingZeros(v);
          const extra = recalcSell(row, { qty });
          updateRow(row.id, { qty, ...extra });
        },
        onRateChange: (v) => {
          const rate = clearLeadingZeros(v);
          const extra = recalcSell(row, { rate });
          updateRow(row.id, { rate, ...extra });
        },
        onTransportChange: (v) => {
          const transport = clearLeadingZeros(v);
          const extra = recalcSell(row, { transport });
          updateRow(row.id, { transport, ...extra });
        },
        onLabourChange: (v) => {
          const labour = clearLeadingZeros(v);
          const extra = recalcSell(row, { labour });
          updateRow(row.id, { labour, ...extra });
        },
        onSellPriceChange: (v) => {
          const sellPrice = clearLeadingZeros(v);
          const extra = recalcSell(row, { sellPrice });
          updateRow(row.id, { ...extra });
        },
        onProfitPctChange: (v) => {
          if (Number(v) < 0) return;
          const profitPct = clearLeadingZeros(v);
          const extra = recalcSell(row, { profitPct });
          updateRow(row.id, { ...extra });
        },
        onDelete: () => setRows((prev) => prev.filter((r) => r.id !== row.id))
      },
      row.id
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3 items-start sm:items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          "data-ocid": "bulk.add_row.button",
          variant: "outline",
          onClick: () => setRows((prev) => [...prev, makeBulkRow()]),
          className: "flex items-center gap-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15 }),
            " Add Another Product"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end", children: [
        validRowCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: validRowCount }),
          " ",
          "item",
          validRowCount !== 1 ? "s" : "",
          " ready to save"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            "data-ocid": "bulk.save_all.button",
            className: "w-full sm:w-auto bg-success hover:bg-success/90 text-success-foreground font-semibold",
            disabled: validRowCount === 0,
            onClick: handleSaveAll,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownToLine, { size: 16, className: "mr-2" }),
              "Save All (",
              validRowCount,
              " item",
              validRowCount !== 1 ? "s" : "",
              ")"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: showQA,
        onOpenChange: (open) => {
          if (!open) {
            resetQA();
            setQaTargetRowId(null);
          }
          setShowQA(open);
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DialogContent,
          {
            "data-ocid": "bulk.quick_add.dialog",
            className: "max-w-sm w-full",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2 text-base", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16, className: "text-primary" }),
                " Add New Product"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm", children: [
                    "Product Name ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      "data-ocid": "bulk.qa.name.input",
                      placeholder: "e.g. Basmati Rice",
                      value: qaName,
                      onChange: (e) => setQaName(e.target.value),
                      autoFocus: true
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Category" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        "data-ocid": "bulk.qa.category.input",
                        placeholder: "e.g. Grains",
                        value: qaCategory,
                        onChange: (e) => setQaCategory(e.target.value),
                        list: "bulk-qa-cat"
                      }
                    ),
                    categories.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "bulk-qa-cat", children: categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c.name }, c.id)) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm", children: [
                      "Unit ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        "data-ocid": "bulk.qa.unit.input",
                        placeholder: "kg / piece",
                        value: qaUnit,
                        onChange: (e) => setQaUnit(e.target.value)
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Min Stock" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        type: "number",
                        placeholder: "e.g. 5",
                        value: qaMinStock,
                        onChange: (e) => setQaMinStock(e.target.value)
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Sell Price (₹)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        type: "number",
                        placeholder: "e.g. 120",
                        value: qaSellPrice,
                        onChange: (e) => setQaSellPrice(e.target.value)
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "outline",
                      className: "flex-1",
                      onClick: () => {
                        resetQA();
                        setShowQA(false);
                      },
                      children: "Cancel"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      "data-ocid": "bulk.qa.save.button",
                      className: "flex-1",
                      onClick: handleQuickAdd,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
                        " Save & Select"
                      ]
                    }
                  )
                ] })
              ] })
            ]
          }
        )
      }
    )
  ] });
}
function BulkRowDesktop({
  row,
  idx,
  products,
  canDelete,
  calcPerUnitCost,
  getProductStock,
  onProductChange,
  onQtyChange,
  onRateChange,
  onTransportChange,
  onLabourChange,
  onSellPriceChange,
  onProfitPctChange,
  onDelete
}) {
  const isValid = row.productId && Number(row.qty) > 0 && Number(row.rate) > 0;
  const perUnitCost = calcPerUnitCost(row);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "tr",
    {
      "data-ocid": `bulk.row.${idx + 1}`,
      className: `border-b border-border/60 last:border-0 transition-colors ${isValid ? "bg-success/5" : "bg-background"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: row.productId || "", onValueChange: onProductChange, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select product…" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                className: "flex w-full items-center gap-2 px-2 py-1.5 text-xs font-medium text-primary cursor-pointer rounded-sm hover:bg-primary/10 focus-visible:bg-primary/10 outline-none",
                onClick: (e) => {
                  e.stopPropagation();
                  onProductChange("__new__");
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 12 }),
                  " New Product"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "my-1" }),
            products.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: p.id, className: "text-xs", children: [
              p.name,
              " (",
              getProductStock(p.id),
              " ",
              p.unit,
              ")"
            ] }, p.id))
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            placeholder: "0",
            className: "h-8 text-xs",
            value: row.qty,
            onFocus: (e) => {
              if (e.target.value === "0") e.target.select();
            },
            onChange: (e) => onQtyChange(e.target.value)
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            placeholder: "0",
            className: "h-8 text-xs",
            value: row.rate,
            onFocus: (e) => {
              if (e.target.value === "0") e.target.select();
            },
            onChange: (e) => onRateChange(e.target.value)
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            placeholder: "0",
            className: "h-8 text-xs",
            value: row.transport,
            onFocus: (e) => {
              if (e.target.value === "0") e.target.select();
            },
            onChange: (e) => onTransportChange(e.target.value)
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            placeholder: "0",
            className: "h-8 text-xs",
            value: row.labour,
            onFocus: (e) => {
              if (e.target.value === "0") e.target.select();
            },
            onChange: (e) => onLabourChange(e.target.value)
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            placeholder: "0",
            className: "h-8 text-xs",
            value: row.sellPrice,
            onFocus: (e) => {
              if (e.target.value === "0") e.target.select();
            },
            onChange: (e) => onSellPriceChange(e.target.value)
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            placeholder: "0",
            className: "h-8 text-xs",
            value: row.profitPct,
            onFocus: (e) => {
              if (e.target.value === "0") e.target.select();
            },
            onChange: (e) => onProfitPctChange(e.target.value)
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: `text-xs font-semibold ${perUnitCost > 0 ? "text-primary" : "text-muted-foreground"}`,
            children: perUnitCost > 0 ? `₹${perUnitCost.toFixed(2)}` : "—"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2 text-center", children: canDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            "data-ocid": `bulk.row.${idx + 1}.delete`,
            onClick: onDelete,
            className: "text-muted-foreground hover:text-destructive transition-colors p-1 rounded",
            "aria-label": "Row hatayein",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 })
          }
        ) })
      ]
    }
  );
}
function BulkRowMobile({
  row,
  idx,
  products,
  canDelete,
  calcFinalCost,
  calcPerUnitCost,
  getProductStock,
  onProductChange,
  onQtyChange,
  onRateChange,
  onTransportChange,
  onLabourChange,
  onSellPriceChange,
  onProfitPctChange,
  onDelete
}) {
  const isValid = row.productId && Number(row.qty) > 0 && Number(row.rate) > 0;
  const finalCost = calcFinalCost(row);
  const perUnitCost = calcPerUnitCost(row);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Card,
    {
      "data-ocid": `bulk.row_mobile.${idx + 1}`,
      className: `shadow-sm border ${isValid ? "border-success/30 bg-success/5" : "border-border bg-card"}`,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: [
            "Product ",
            idx + 1
          ] }),
          canDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              "data-ocid": `bulk.row_mobile.${idx + 1}.delete`,
              onClick: onDelete,
              className: "text-muted-foreground hover:text-destructive transition-colors p-1 rounded",
              "aria-label": "Row hatayein",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 15 })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Product *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: row.productId || "", onValueChange: onProductChange, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select product…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  className: "flex w-full items-center gap-2 px-2 py-1.5 text-sm font-medium text-primary cursor-pointer rounded-sm hover:bg-primary/10 outline-none",
                  onClick: (e) => {
                    e.stopPropagation();
                    onProductChange("__new__");
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 13 }),
                    " New Product"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "my-1" }),
              products.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: p.id, children: [
                p.name,
                " (",
                getProductStock(p.id),
                " ",
                p.unit,
                ")"
              ] }, p.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Qty *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                placeholder: "0",
                value: row.qty,
                onFocus: (e) => {
                  if (e.target.value === "0") e.target.select();
                },
                onChange: (e) => onQtyChange(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Rate (₹) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                placeholder: "0",
                value: row.rate,
                onFocus: (e) => {
                  if (e.target.value === "0") e.target.select();
                },
                onChange: (e) => onRateChange(e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Transport (₹)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                placeholder: "0",
                value: row.transport,
                onFocus: (e) => {
                  if (e.target.value === "0") e.target.select();
                },
                onChange: (e) => onTransportChange(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Labour (₹)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                placeholder: "0",
                value: row.labour,
                onFocus: (e) => {
                  if (e.target.value === "0") e.target.select();
                },
                onChange: (e) => onLabourChange(e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Sell Price (₹)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                placeholder: "auto",
                value: row.sellPrice,
                onFocus: (e) => {
                  if (e.target.value === "0") e.target.select();
                },
                onChange: (e) => onSellPriceChange(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Profit %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                placeholder: "auto",
                value: row.profitPct,
                onFocus: (e) => {
                  if (e.target.value === "0") e.target.select();
                },
                onChange: (e) => onProfitPctChange(e.target.value)
              }
            )
          ] })
        ] }),
        (finalCost > 0 || perUnitCost > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Final Lagat:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-foreground", children: [
            "₹",
            finalCost.toFixed(2)
          ] }),
          perUnitCost > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground ml-2", children: "Per Unit:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-primary", children: [
              "₹",
              perUnitCost.toFixed(2)
            ] })
          ] })
        ] })
      ] })
    }
  );
}
function TxRow({ tx, idx }) {
  const { products } = useStore();
  const product = products.find((p) => p.id === tx.productId);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { "data-ocid": `stock.transactions.item.${idx + 1}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm font-medium", children: (product == null ? void 0 : product.name) ?? "Unknown" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Badge,
      {
        className: tx.type === "in" ? "bg-success-light text-success border-0" : "bg-danger-light text-danger border-0",
        children: tx.type === "in" ? "IN" : "OUT"
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-sm", children: [
      tx.quantity,
      " ",
      product == null ? void 0 : product.unit
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-sm", children: [
      "₹",
      tx.rate
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs text-muted-foreground max-w-[120px] truncate", children: tx.note }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs text-muted-foreground", children: new Date(tx.date).toLocaleDateString("en-IN") })
  ] });
}
export {
  StockPage
};
