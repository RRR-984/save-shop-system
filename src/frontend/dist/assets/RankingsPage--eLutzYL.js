import { l as useStore, J as useLanguage, r as reactExports, j as jsxRuntimeExports } from "./index-Bt77HP0S.js";
const MEDAL = { 1: "🥇", 2: "🥈", 3: "🥉" };
function getRankBg(rank) {
  if (rank === 1)
    return "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40";
  if (rank === 2)
    return "bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40";
  if (rank === 3)
    return "bg-orange-50 dark:bg-orange-900/15 border border-orange-200 dark:border-orange-700/40";
  return "bg-card border border-border";
}
function formatValue(v) {
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(1)}L`;
  if (v >= 1e3) return `₹${(v / 1e3).toFixed(1)}K`;
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
}
function RankRow({ row, rank }) {
  const medal = MEDAL[rank];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `flex items-center gap-2.5 px-3 py-2 rounded-xl rank-row-interactive ${getRankBg(rank)}`,
      "data-ocid": `rankings.row.${rank}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-7 h-7 flex items-center justify-center flex-shrink-0", children: medal ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg leading-none", children: medal }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-muted-foreground w-5 h-5 rounded-full bg-muted flex items-center justify-center", children: rank }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground truncate", children: row.name }),
          row.secondaryLabel && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: row.secondaryLabel })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: `text-sm font-bold flex-shrink-0 ${rank === 1 ? "text-amber-600 dark:text-amber-400" : rank <= 3 ? "text-foreground" : "text-muted-foreground"}`,
            children: formatValue(row.value)
          }
        )
      ]
    }
  );
}
function EmptyState({ label }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex flex-col items-center justify-center py-12 gap-3",
      "data-ocid": "rankings.empty_state",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-4xl", children: "📊" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center", children: label })
      ]
    }
  );
}
const TABS = [
  { key: "products", label: "Top Products", emoji: "🏆" },
  { key: "profit", label: "High Profit", emoji: "💰" },
  { key: "customers", label: "Customers", emoji: "👤" },
  { key: "vendors", label: "Vendors", emoji: "🏪" },
  { key: "staff", label: "Staff", emoji: "👨‍💼" }
];
function RankingsPage() {
  var _a;
  const { invoices, products, vendors, purchaseOrders } = useStore();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = reactExports.useState("products");
  const topSellingProducts = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const inv of invoices) {
      for (const item of inv.items) {
        const prev = map.get(item.productId) ?? {
          name: item.productName,
          revenue: 0
        };
        map.set(item.productId, {
          name: item.productName,
          revenue: prev.revenue + item.quantity * item.sellingRate
        });
      }
    }
    return Array.from(map.entries()).map(([id, v]) => ({ id, name: v.name, value: v.revenue })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [invoices]);
  const highProfitProducts = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const inv of invoices) {
      for (const item of inv.items) {
        const itemProfit = item.totalProfit != null ? item.totalProfit : (item.sellingRate - item.purchaseCost) * item.quantity;
        const prev = map.get(item.productId) ?? {
          name: item.productName,
          profit: 0
        };
        map.set(item.productId, {
          name: item.productName,
          profit: prev.profit + itemProfit
        });
      }
    }
    return Array.from(map.entries()).map(([id, v]) => ({ id, name: v.name, value: v.profit })).filter((r) => r.value > 0).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [invoices]);
  const topCustomers = reactExports.useMemo(() => {
    var _a2;
    const map = /* @__PURE__ */ new Map();
    for (const inv of invoices) {
      if (!inv.customerName || inv.customerName === "Walk-in Customer")
        continue;
      const key = ((_a2 = inv.customerMobile) == null ? void 0 : _a2.trim()) || inv.customerName.trim().toLowerCase();
      const prev = map.get(key) ?? { name: inv.customerName, total: 0 };
      map.set(key, {
        name: inv.customerName,
        total: prev.total + inv.totalAmount
      });
    }
    return Array.from(map.entries()).map(([id, v]) => ({ id, name: v.name, value: v.total })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [invoices]);
  const topVendors = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const po of purchaseOrders) {
      const vendor = vendors.find((v) => v.id === po.vendorId);
      const vendorName = (vendor == null ? void 0 : vendor.name) ?? po.vendorId;
      const orderTotal = po.qty * po.rate + (po.transportCharge ?? 0) + (po.labourCharge ?? 0);
      const prev = map.get(po.vendorId) ?? { total: 0 };
      map.set(po.vendorId, {
        name: vendorName,
        total: prev.total + orderTotal
      });
    }
    if (map.size === 0) {
      for (const product of products) {
        if (!product.vendorName) continue;
        const key = product.vendorName.trim().toLowerCase();
        const prev = map.get(key) ?? { name: product.vendorName, total: 0 };
        const cost = product.costPrice ?? product.purchasePrice ?? 0;
        map.set(key, { name: product.vendorName, total: prev.total + cost });
      }
    }
    return Array.from(map.entries()).map(([id, v]) => ({ id, name: v.name, value: v.total })).filter((r) => r.value > 0).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [purchaseOrders, vendors, products]);
  const topStaff = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const inv of invoices) {
      const staffName = inv.soldByName || "Owner";
      const key = inv.soldByUserId || staffName.toLowerCase();
      const prev = map.get(key) ?? { total: 0 };
      map.set(key, { name: staffName, total: prev.total + inv.totalAmount });
    }
    return Array.from(map.entries()).map(([id, v]) => ({ id, name: v.name, value: v.total })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [invoices]);
  const dataMap = {
    products: topSellingProducts,
    profit: highProfitProducts,
    customers: topCustomers,
    vendors: topVendors,
    staff: topStaff
  };
  const emptyMessages = {
    products: "No sales records found",
    profit: "Profit data is not available",
    customers: "No customer purchase history found",
    vendors: "No vendor order history found",
    staff: "No staff sales data found"
  };
  const rows = dataMap[activeTab];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 p-3 md:p-5 space-y-4 pb-24", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-lg font-bold text-foreground flex items-center gap-2", children: [
          "🏆 ",
          t("Rankings")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: t("Top Performers") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full", children: "Top 10" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1",
        "data-ocid": "rankings.tabs",
        children: TABS.map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            "data-ocid": `rankings.tab.${tab.key}`,
            onClick: () => setActiveTab(tab.key),
            className: `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 flex-shrink-0 ${activeTab === tab.key ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: tab.emoji }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t(tab.label) })
            ]
          },
          tab.key
        ))
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "bg-card rounded-2xl overflow-hidden",
        style: { boxShadow: "0 6px 16px rgba(0,0,0,0.06)" },
        children: rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { label: emptyMessages[activeTab] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 space-y-1.5", children: [
          rows.slice(0, 3).map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(RankRow, { row, rank: i + 1 }, row.id)),
          rows.length > 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative my-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-card px-2 text-xs text-muted-foreground", children: "···" }) })
          ] }),
          rows.slice(3).map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(RankRow, { row, rank: i + 4 }, row.id))
        ] })
      }
    ),
    rows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "bg-card rounded-xl px-4 py-3 flex items-center justify-between",
        style: { boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
            t("Total"),
            " ",
            rows.length,
            " ",
            t("entries")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-primary", children: [
            t("Top"),
            ": ",
            ((_a = rows[0]) == null ? void 0 : _a.name) ?? "—"
          ] })
        ]
      }
    )
  ] });
}
export {
  RankingsPage
};
