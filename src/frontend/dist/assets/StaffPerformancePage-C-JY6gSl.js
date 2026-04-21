import { l as useStore, r as reactExports, j as jsxRuntimeExports, C as Card, n as CardContent, at as ChartNoAxesColumn, i as CardHeader, k as CardTitle, A as TrendingUp, B as Button, T as Table, o as TableHeader, p as TableRow, q as TableHead, s as TableBody, t as TableCell } from "./index-CyJThNPE.js";
import { C as ChevronUp } from "./chevron-up-CF0EzDAe.js";
import { C as ChevronDown } from "./chevron-down-CsZruglM.js";
function filterByDate(invoices, filter) {
  if (filter === "all") return invoices;
  const now = /* @__PURE__ */ new Date();
  return invoices.filter((inv) => {
    const d = new Date(inv.date);
    if (filter === "today") {
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    }
    if (filter === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    }
    if (filter === "month") {
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }
    return true;
  });
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
const filterLabels = {
  today: "Today",
  week: "This Week",
  month: "This Month",
  all: "All"
};
const filterColors = {
  today: "bg-blue-100 text-blue-700 border-blue-300",
  week: "bg-violet-100 text-violet-700 border-violet-300",
  month: "bg-green-100 text-green-700 border-green-300",
  all: "bg-muted text-muted-foreground border-border"
};
const paymentBadge = {
  cash: "bg-green-100 text-green-700",
  upi: "bg-blue-100 text-blue-700",
  online: "bg-purple-100 text-purple-700",
  credit: "bg-amber-100 text-amber-700"
};
function StaffPerformancePage() {
  const { invoices } = useStore();
  const [dateFilter, setDateFilter] = reactExports.useState("month");
  const [expandedStaff, setExpandedStaff] = reactExports.useState(null);
  const filtered = reactExports.useMemo(
    () => filterByDate(invoices, dateFilter),
    [invoices, dateFilter]
  );
  const staffStats = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const inv of filtered) {
      const key = inv.soldByUserId ?? "owner-default";
      const name = inv.soldByName ?? "Owner";
      if (!map.has(key)) {
        map.set(key, {
          staffName: name,
          staffId: key,
          totalSales: 0,
          invoiceCount: 0,
          totalProfit: 0,
          totalStaffBonus: 0,
          invoices: []
        });
      }
      const entry = map.get(key);
      entry.totalSales += inv.totalAmount;
      entry.invoiceCount += 1;
      entry.totalProfit += inv.invoiceTotalProfit ?? 0;
      entry.totalStaffBonus += inv.totalStaffBonus ?? 0;
      entry.invoices.push(inv);
    }
    return Array.from(map.values()).sort((a, b) => b.totalSales - a.totalSales);
  }, [filtered]);
  const totalSalesAll = staffStats.reduce((s, x) => s + x.totalSales, 0);
  const totalProfitAll = staffStats.reduce((s, x) => s + x.totalProfit, 0);
  const totalBonusAll = staffStats.reduce((s, x) => s + x.totalStaffBonus, 0);
  const totalInvoicesAll = staffStats.reduce((s, x) => s + x.invoiceCount, 0);
  const toggleStaff = (staffId) => {
    setExpandedStaff((prev) => prev === staffId ? null : staffId);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-6 pb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 md:px-6 space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: ["today", "week", "month", "all"].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => setDateFilter(f),
        className: `px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${dateFilter === f ? `${filterColors[f]} ring-1 ring-offset-1 ring-current` : "border-border text-muted-foreground hover:bg-muted"}`,
        children: filterLabels[f]
      },
      f
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-blue-600 dark:text-blue-400 font-medium", children: "💰 Total Sales" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-lg font-bold text-blue-800 dark:text-blue-200", children: [
          "₹",
          totalSalesAll.toLocaleString("en-IN")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-blue-500 dark:text-blue-400 mt-0.5", children: [
          totalInvoicesAll,
          " invoices"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-green-600 dark:text-green-400 font-medium", children: "📈 Total Profit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-lg font-bold text-green-800 dark:text-green-200", children: [
          "₹",
          totalProfitAll.toLocaleString("en-IN")
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-purple-600 dark:text-purple-400 font-medium", children: "🎁 Staff Bonus" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-lg font-bold text-purple-800 dark:text-purple-200", children: [
          "₹",
          totalBonusAll.toLocaleString("en-IN")
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-orange-600 dark:text-orange-400 font-medium", children: "👥 Active Staff" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold text-orange-800 dark:text-orange-200", children: staffStats.length })
      ] }) })
    ] }),
    staffStats.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "mx-auto mb-3 opacity-30", size: 40 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No invoices in this period" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: "Make a sale — it will appear here" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: staffStats.map((staff, idx) => {
      const share = totalSalesAll > 0 ? Math.round(staff.totalSales / totalSalesAll * 100) : 0;
      const isExpanded = expandedStaff === staff.staffId;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2 pt-4 px-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0",
                  style: {
                    background: [
                      "#6366f1",
                      "#10b981",
                      "#f59e0b",
                      "#ef4444",
                      "#3b82f6"
                    ][idx % 5]
                  },
                  children: staff.staffName.charAt(0).toUpperCase()
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-semibold leading-tight", children: staff.staffName }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
                  staff.invoiceCount,
                  " invoice",
                  staff.invoiceCount !== 1 ? "s" : "",
                  " • ",
                  share,
                  "% share"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-lg font-bold text-foreground", children: [
                "₹",
                staff.totalSales.toLocaleString("en-IN")
              ] }),
              staff.totalProfit > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-green-600 font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 10, className: "inline mr-0.5" }),
                "₹",
                staff.totalProfit.toLocaleString("en-IN"),
                " profit"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "h-full rounded-full transition-all duration-500",
              style: {
                width: `${share}%`,
                background: [
                  "#6366f1",
                  "#10b981",
                  "#f59e0b",
                  "#ef4444",
                  "#3b82f6"
                ][idx % 5]
              }
            }
          ) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid grid-cols-3 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-1.5 bg-green-50 rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-semibold text-green-700", children: [
                "₹",
                staff.totalProfit.toLocaleString("en-IN")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-green-600", children: "Profit" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-1.5 bg-purple-50 rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-semibold text-purple-700", children: [
                "₹",
                staff.totalStaffBonus.toLocaleString("en-IN")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-purple-600", children: "Bonus" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-1.5 bg-blue-50 rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold text-blue-700", children: staff.invoiceCount }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-blue-600", children: "Invoices" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              className: "w-full mt-2 text-xs h-7",
              onClick: () => toggleStaff(staff.staffId),
              children: isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 12, className: "mr-1" }),
                " Hide"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 12, className: "mr-1" }),
                " Show All Invoices (",
                staff.invoiceCount,
                ")"
              ] })
            }
          )
        ] }),
        isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-0 px-0 pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs py-2 pl-4", children: "Invoice" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs py-2", children: "Customer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs py-2", children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs py-2", children: "Mode" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs py-2 text-right pr-4", children: "Amount" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: [...staff.invoices].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          ).map((inv) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2 pl-4 font-mono text-xs", children: inv.invoiceNumber }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: inv.customerName || "Walk-in" }),
              inv.customerMobile && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-[10px]", children: inv.customerMobile })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2 text-muted-foreground text-[10px]", children: formatDate(inv.date) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `px-1.5 py-0.5 rounded-full text-[10px] font-medium ${paymentBadge[inv.paymentMode] ?? "bg-muted text-muted-foreground"}`,
                children: inv.paymentMode.toUpperCase()
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "py-2 text-right pr-4 font-semibold", children: [
              "₹",
              inv.totalAmount.toLocaleString("en-IN"),
              (inv.invoiceTotalProfit ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-green-600", children: [
                "+₹",
                inv.invoiceTotalProfit.toLocaleString(
                  "en-IN"
                )
              ] })
            ] })
          ] }, inv.id)) })
        ] }) }) })
      ] }, staff.staffId);
    }) })
  ] }) });
}
export {
  StaffPerformancePage
};
