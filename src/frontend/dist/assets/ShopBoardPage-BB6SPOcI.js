import { l as useStore, h as useAuth, r as reactExports, j as jsxRuntimeExports, aE as RefreshCw, aj as Eye, aD as EyeOff, aw as Trophy, a9 as getDiamondTier } from "./index-CyJThNPE.js";
import { S as Share2 } from "./share-2-PG8y4S_O.js";
import { P as Printer } from "./printer-CQSC8xiw.js";
function fmtCurrency(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Math.round(n));
}
function fmtDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  } catch {
    return "—";
  }
}
function isToday(dateStr) {
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  return dateStr.slice(0, 10) === today;
}
function isThisWeek(dateStr) {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  return now - d <= 7 * 24 * 60 * 60 * 1e3;
}
function isThisMonth(dateStr) {
  const now = /* @__PURE__ */ new Date();
  const d = new Date(dateStr);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}
function SectionCard({
  title,
  headerColor,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card shadow-sm overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `px-4 py-2.5 ${headerColor}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white font-bold text-sm tracking-wide uppercase", children: title }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border/50", children })
  ] });
}
function DataRow({
  label,
  value,
  valueClass,
  trophy
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground flex-shrink-0 min-w-0", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "span",
      {
        className: `text-sm font-semibold text-right min-w-0 flex items-center gap-1 ${valueClass ?? "text-foreground"}`,
        children: [
          trophy && /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 12, className: "text-amber-500 flex-shrink-0" }),
          value
        ]
      }
    )
  ] });
}
function MiniListRow({
  rank,
  name,
  sub
}) {
  const medalColor = rank === 1 ? "text-amber-500" : rank === 2 ? "text-slate-400" : rank === 3 ? "text-orange-400" : "text-muted-foreground";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-4 py-2 hover:bg-muted/20 transition-colors", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs font-bold w-5 flex-shrink-0 ${medalColor}`, children: [
      "#",
      rank
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-foreground flex-1 truncate", children: name }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground flex-shrink-0", children: sub })
  ] });
}
function ShopBoardPage({ onNavigate: _onNavigate }) {
  const {
    products,
    batches,
    invoices,
    customers,
    vendors,
    returns: returnEntries,
    diamondRewards,
    getProductStock,
    getLastSoldDate,
    shopSettings,
    purchaseOrders,
    users
  } = useStore();
  const { currentShop, currentUser } = useAuth();
  const [amountsVisible, setAmountsVisible] = reactExports.useState(
    () => localStorage.getItem("amountsVisible") === "true"
  );
  const [lastUpdated, setLastUpdated] = reactExports.useState(/* @__PURE__ */ new Date());
  reactExports.useEffect(() => {
    const interval = setInterval(() => setLastUpdated(/* @__PURE__ */ new Date()), 3e4);
    return () => clearInterval(interval);
  }, []);
  const showAmt = (val) => amountsVisible ? val : "₹•••••";
  const showNum = (val) => amountsVisible ? String(val) : "•••";
  const todayMs = reactExports.useMemo(() => {
    const d = /* @__PURE__ */ new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);
  const deadStockThreshold = shopSettings.deadStockThresholdDays ?? 90;
  const shopName = (currentShop == null ? void 0 : currentShop.name) ?? "My Shop";
  const ownerName = (currentUser == null ? void 0 : currentUser.name) || (currentUser == null ? void 0 : currentUser.mobile) || "Owner";
  const totalProducts = products.length;
  const totalVendors = vendors.length;
  const totalCustomers = customers.length;
  const activeStaff = reactExports.useMemo(
    () => users.filter(
      (u) => u.active !== false && !u.deleted && u.role !== "owner"
    ).length,
    [users]
  );
  const totalStockValue = reactExports.useMemo(
    () => batches.reduce((s, b) => s + b.quantity * b.purchaseRate, 0),
    [batches]
  );
  const lowStockCount = reactExports.useMemo(
    () => products.filter((p) => {
      const stock = getProductStock(p.id);
      return stock > 0 && stock <= p.minStockAlert;
    }).length,
    [products, getProductStock]
  );
  const outOfStockCount = reactExports.useMemo(
    () => products.filter((p) => getProductStock(p.id) === 0).length,
    [products, getProductStock]
  );
  const deadStockCount = reactExports.useMemo(
    () => products.filter((p) => {
      const totalQty = batches.filter((b) => b.productId === p.id).reduce((s, b) => s + b.quantity, 0);
      if (totalQty <= 0) return false;
      const last = getLastSoldDate(p.id);
      const daysSince = last ? Math.floor((todayMs - new Date(last).getTime()) / 864e5) : 9999;
      return daysSince >= deadStockThreshold;
    }).length,
    [products, batches, getLastSoldDate, todayMs, deadStockThreshold]
  );
  const totalBatches = batches.length;
  const top5ProductsByStock = reactExports.useMemo(
    () => products.map((p) => ({
      id: p.id,
      name: p.name,
      unit: p.unit,
      stock: getProductStock(p.id)
    })).filter((p) => p.stock > 0).sort((a, b) => b.stock - a.stock).slice(0, 5),
    [products, getProductStock]
  );
  const purchaseStats = reactExports.useMemo(() => {
    let today = 0;
    let week = 0;
    let month = 0;
    let allTime = 0;
    let lastDate = "";
    for (const b of batches) {
      const cost = b.finalPurchaseCost ?? b.purchaseRate * b.quantity;
      allTime += cost;
      if (isToday(b.dateAdded)) today += cost;
      if (isThisWeek(b.dateAdded)) week += cost;
      if (isThisMonth(b.dateAdded)) month += cost;
      if (!lastDate || b.dateAdded > lastDate) lastDate = b.dateAdded;
    }
    return { today, week, month, allTime, lastDate };
  }, [batches]);
  const topVendor = reactExports.useMemo(() => {
    var _a;
    const map = /* @__PURE__ */ new Map();
    for (const po of purchaseOrders) {
      const vendor = vendors.find((v) => v.id === po.vendorId);
      const name = (vendor == null ? void 0 : vendor.name) ?? po.vendorId ?? "Unknown";
      const entry = map.get(name);
      if (entry) entry.count += 1;
      else map.set(name, { name, count: 1 });
    }
    return ((_a = [...map.values()].sort((a, b) => b.count - a.count)[0]) == null ? void 0 : _a.name) ?? "—";
  }, [purchaseOrders, vendors]);
  const salesStats = reactExports.useMemo(() => {
    let todaySales = 0;
    let weekSales = 0;
    let monthSales = 0;
    let allTimeSales = 0;
    let todayProfit = 0;
    let allTimeProfit = 0;
    for (const inv of invoices) {
      allTimeSales += inv.totalAmount;
      allTimeProfit += inv.invoiceTotalProfit ?? 0;
      if (isToday(inv.date)) {
        todaySales += inv.totalAmount;
        todayProfit += inv.invoiceTotalProfit ?? 0;
      }
      if (isThisWeek(inv.date)) weekSales += inv.totalAmount;
      if (isThisMonth(inv.date)) monthSales += inv.totalAmount;
    }
    return {
      todaySales,
      weekSales,
      monthSales,
      allTimeSales,
      todayProfit,
      allTimeProfit
    };
  }, [invoices]);
  const totalCreditDue = reactExports.useMemo(
    () => customers.filter((c) => c.creditBalance > 0).reduce((s, c) => s + c.creditBalance, 0),
    [customers]
  );
  const netIncomeToday = salesStats.todaySales - purchaseStats.today;
  const topSellingProduct = reactExports.useMemo(() => {
    var _a;
    const qtyMap = /* @__PURE__ */ new Map();
    for (const inv of invoices) {
      for (const item of inv.items) {
        const entry = qtyMap.get(item.productId);
        if (entry) entry.qty += item.quantity;
        else
          qtyMap.set(item.productId, {
            name: item.productName ?? item.productId,
            qty: item.quantity
          });
      }
    }
    return ((_a = [...qtyMap.values()].sort((a, b) => b.qty - a.qty)[0]) == null ? void 0 : _a.name) ?? "—";
  }, [invoices]);
  const avgSaleValue = reactExports.useMemo(
    () => invoices.length > 0 ? salesStats.allTimeSales / invoices.length : 0,
    [invoices, salesStats.allTimeSales]
  );
  const bestSalesDay = reactExports.useMemo(() => {
    const dayMap = /* @__PURE__ */ new Map();
    for (const inv of invoices) {
      const day = inv.date.slice(0, 10);
      dayMap.set(day, (dayMap.get(day) ?? 0) + inv.totalAmount);
    }
    if (dayMap.size === 0) return { date: "—", amount: 0 };
    const [bestDate, bestAmt] = [...dayMap.entries()].sort(
      (a, b) => b[1] - a[1]
    )[0];
    return { date: fmtDate(bestDate), amount: bestAmt };
  }, [invoices]);
  const totalReturnValue = reactExports.useMemo(
    () => returnEntries.reduce((s, r) => s + r.returnValue, 0),
    [returnEntries]
  );
  const totalDiamonds = reactExports.useMemo(
    () => diamondRewards.reduce((s, d) => s + (d.diamondCount ?? 0), 0),
    [diamondRewards]
  );
  const diamondTier = getDiamondTier(totalDiamonds);
  const tierLabel = diamondTier === "diamond" ? "💎 Diamond" : diamondTier === "gold" ? "🥇 Gold" : diamondTier === "silver" ? "🥈 Silver" : "🥉 Bronze";
  const nextTierThreshold = totalDiamonds < 50 ? 50 : totalDiamonds < 200 ? 200 : totalDiamonds < 500 ? 500 : null;
  const nextLevelLabel = nextTierThreshold ? `${nextTierThreshold - totalDiamonds} more to next level` : "Max level reached! 🎉";
  function handlePrint() {
    window.print();
  }
  function handleShare() {
    const nl = "\n";
    const summary = [
      `📊 *${shopName} — Shop Information Board*`,
      `🗓️ ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-IN")}`,
      nl,
      "🏪 *Shop Info*",
      `Products: ${totalProducts} | Customers: ${totalCustomers} | Vendors: ${totalVendors}`,
      nl,
      "📦 *Inventory*",
      `Stock Value: ${fmtCurrency(totalStockValue)}`,
      `Low Stock: ${lowStockCount} | Out of Stock: ${outOfStockCount}`,
      nl,
      "🛒 *Today's Sales*",
      `Sales: ${fmtCurrency(salesStats.todaySales)} | Profit: ${fmtCurrency(salesStats.todayProfit)}`,
      nl,
      "💰 *All Time*",
      `Total Sales: ${fmtCurrency(salesStats.allTimeSales)} | Total Profit: ${fmtCurrency(salesStats.allTimeProfit)}`,
      nl,
      `💎 Diamonds: ${totalDiamonds} (${tierLabel})`
    ];
    const text = encodeURIComponent(summary.join("\n"));
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col min-h-screen bg-background pb-20 print:pb-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "sticky top-0 z-20 bg-card border-b border-border px-4 py-3 flex items-center gap-3 shadow-sm print:relative print:shadow-none",
        "data-ocid": "shop_board.header",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-base font-bold text-foreground truncate", children: "Shop Information Board" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-2 w-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-green-500" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide", children: "Live" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground mt-0.5", children: [
              "Updated",
              " ",
              lastUpdated.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit"
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setLastUpdated(/* @__PURE__ */ new Date()),
                  className: "ml-1.5 inline-flex items-center text-primary hover:underline",
                  "aria-label": "Refresh",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 11, className: "inline" })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 print:hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                "data-ocid": "shop_board.eye_toggle",
                onClick: () => {
                  setAmountsVisible((v) => !v);
                  localStorage.setItem(
                    "amountsVisible",
                    (!amountsVisible).toString()
                  );
                },
                className: "w-8 h-8 rounded-lg flex items-center justify-center bg-muted hover:bg-muted/80 text-muted-foreground transition-colors",
                title: amountsVisible ? "Hide amounts" : "Show amounts",
                children: amountsVisible ? /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 15 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { size: 15 })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                "data-ocid": "shop_board.share_button",
                onClick: handleShare,
                className: "w-8 h-8 rounded-lg flex items-center justify-center bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 transition-colors",
                title: "Share via WhatsApp",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { size: 15 })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                "data-ocid": "shop_board.print_button",
                onClick: handlePrint,
                className: "w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 transition-colors",
                title: "Print board",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 15 })
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { title: "Shop Info", headerColor: "bg-blue-600", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DataRow, { label: "Shop Name", value: shopName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DataRow, { label: "Owner", value: ownerName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DataRow, { label: "Total Products", value: totalProducts }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataRow,
          {
            label: "Active Staff",
            value: activeStaff > 0 ? activeStaff : "N/A"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DataRow, { label: "Total Vendors", value: totalVendors }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DataRow, { label: "Total Customers", value: totalCustomers })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { title: "Inventory", headerColor: "bg-violet-600", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataRow,
          {
            label: "Total Stock Value",
            value: showAmt(fmtCurrency(totalStockValue)),
            valueClass: "text-foreground font-bold"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataRow,
          {
            label: "Low Stock Items",
            value: showNum(lowStockCount),
            valueClass: lowStockCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataRow,
          {
            label: "Out of Stock",
            value: showNum(outOfStockCount),
            valueClass: outOfStockCount > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataRow,
          {
            label: "Dead Stock Items",
            value: showNum(deadStockCount),
            valueClass: deadStockCount > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DataRow, { label: "Total Batches", value: totalBatches }),
        top5ProductsByStock.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-1.5 bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: "Top 5 Products by Stock" }) }),
          top5ProductsByStock.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            MiniListRow,
            {
              rank: i + 1,
              name: p.name,
              sub: `${p.stock} ${p.unit}`
            },
            p.id
          ))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { title: "Buying / Purchases", headerColor: "bg-orange-500", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataRow,
          {
            label: "Today's Purchase",
            value: showAmt(fmtCurrency(purchaseStats.today))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataRow,
          {
            label: "This Week",
            value: showAmt(fmtCurrency(purchaseStats.week))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataRow,
          {
            label: "This Month",
            value: showAmt(fmtCurrency(purchaseStats.month))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataRow,
          {
            label: "Total Purchase (All Time)",
            value: showAmt(fmtCurrency(purchaseStats.allTime)),
            valueClass: "text-foreground font-bold"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataRow,
          {
            label: "Top Vendor",
            value: topVendor,
            trophy: topVendor !== "—",
            valueClass: "text-amber-600 dark:text-amber-400"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataRow,
          {
            label: "Last Purchase Date",
            value: purchaseStats.lastDate ? fmtDate(purchaseStats.lastDate) : "—"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DataRow, { label: "Total Purchase Entries", value: totalBatches })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { title: "Selling / Sales", headerColor: "bg-green-600", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataRow,
          {
            label: "Today's Sales",
            value: showAmt(fmtCurrency(salesStats.todaySales)),
            valueClass: salesStats.todaySales > 0 ? "text-green-600 dark:text-green-400 font-bold" : "text-foreground"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataRow,
          {
            label: "This Week",
            value: showAmt(fmtCurrency(salesStats.weekSales))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataRow,
          {
            label: "This Month",
            value: showAmt(fmtCurrency(salesStats.monthSales))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataRow,
          {
            label: "Total Sales (All Time)",
            value: showAmt(fmtCurrency(salesStats.allTimeSales)),
            valueClass: "text-foreground font-bold"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataRow,
          {
            label: "Today's Profit",
            value: showAmt(fmtCurrency(salesStats.todayProfit)),
            valueClass: salesStats.todayProfit > 0 ? "text-green-600 dark:text-green-400" : salesStats.todayProfit < 0 ? "text-red-600 dark:text-red-400" : "text-foreground"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataRow,
          {
            label: "Total Profit (All Time)",
            value: showAmt(fmtCurrency(salesStats.allTimeProfit)),
            valueClass: salesStats.allTimeProfit > 0 ? "text-green-600 dark:text-green-400 font-bold" : "text-red-600 dark:text-red-400"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataRow,
          {
            label: "Net Income Today",
            value: showAmt(fmtCurrency(netIncomeToday)),
            valueClass: netIncomeToday >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataRow,
          {
            label: "Credit / Due Amount",
            value: showAmt(fmtCurrency(totalCreditDue)),
            valueClass: totalCreditDue > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataRow,
          {
            label: "Top Selling Product",
            value: topSellingProduct,
            trophy: topSellingProduct !== "—",
            valueClass: "text-amber-600 dark:text-amber-400"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DataRow, { label: "Total Transactions", value: invoices.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { title: "Performance", headerColor: "bg-amber-500", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataRow,
          {
            label: "Best Sales Day",
            value: bestSalesDay.date !== "—" ? `${bestSalesDay.date} (${showAmt(fmtCurrency(bestSalesDay.amount))})` : "—",
            trophy: bestSalesDay.date !== "—",
            valueClass: "text-amber-600 dark:text-amber-400"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataRow,
          {
            label: "Avg Sale Value",
            value: showAmt(fmtCurrency(avgSaleValue))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataRow,
          {
            label: "Total Returns",
            value: `${returnEntries.length} (${showAmt(fmtCurrency(totalReturnValue))})`,
            valueClass: returnEntries.length > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataRow,
          {
            label: "Diamond Rewards Earned",
            value: `💎 ${showNum(totalDiamonds)}`,
            valueClass: "text-violet-600 dark:text-violet-400 font-bold"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataRow,
          {
            label: "Diamond Level",
            value: tierLabel,
            valueClass: "text-amber-600 dark:text-amber-400 font-bold"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataRow,
          {
            label: "Next Level",
            value: nextLevelLabel,
            valueClass: "text-muted-foreground text-xs"
          }
        )
      ] })
    ] })
  ] });
}
export {
  ShopBoardPage
};
