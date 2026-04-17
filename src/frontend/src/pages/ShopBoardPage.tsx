import { Eye, EyeOff, Printer, RefreshCw, Share2, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import type { NavPage } from "../types/store";
import { getDiamondTier } from "../types/store";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

function fmtDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr.slice(0, 10) === today;
}

function isThisWeek(dateStr: string): boolean {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  return now - d <= 7 * 24 * 60 * 60 * 1000;
}

function isThisMonth(dateStr: string): boolean {
  const now = new Date();
  const d = new Date(dateStr);
  return (
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  );
}

// ─── Section Card wrapper ─────────────────────────────────────────────────────

function SectionCard({
  title,
  headerColor,
  children,
}: {
  title: string;
  headerColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Section header row — like a spreadsheet header */}
      <div className={`px-4 py-2.5 ${headerColor}`}>
        <span className="text-white font-bold text-sm tracking-wide uppercase">
          {title}
        </span>
      </div>
      <div className="divide-y divide-border/50">{children}</div>
    </div>
  );
}

// ─── Data row ─────────────────────────────────────────────────────────────────

function DataRow({
  label,
  value,
  valueClass,
  trophy,
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
  trophy?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors">
      <span className="text-sm text-muted-foreground flex-shrink-0 min-w-0">
        {label}
      </span>
      <span
        className={`text-sm font-semibold text-right min-w-0 flex items-center gap-1 ${valueClass ?? "text-foreground"}`}
      >
        {trophy && (
          <Trophy size={12} className="text-amber-500 flex-shrink-0" />
        )}
        {value}
      </span>
    </div>
  );
}

// ─── Mini list row (for top-5 products) ──────────────────────────────────────

function MiniListRow({
  rank,
  name,
  sub,
}: {
  rank: number;
  name: string;
  sub: string;
}) {
  const medalColor =
    rank === 1
      ? "text-amber-500"
      : rank === 2
        ? "text-slate-400"
        : rank === 3
          ? "text-orange-400"
          : "text-muted-foreground";

  return (
    <div className="flex items-center gap-2 px-4 py-2 hover:bg-muted/20 transition-colors">
      <span className={`text-xs font-bold w-5 flex-shrink-0 ${medalColor}`}>
        #{rank}
      </span>
      <span className="text-sm text-foreground flex-1 truncate">{name}</span>
      <span className="text-xs text-muted-foreground flex-shrink-0">{sub}</span>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ShopBoardPageProps {
  onNavigate: (page: NavPage) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
export function ShopBoardPage({ onNavigate: _onNavigate }: ShopBoardPageProps) {
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
    users,
  } = useStore();

  const { currentShop, currentUser } = useAuth();

  const [amountsVisible, setAmountsVisible] = useState<boolean>(
    () => localStorage.getItem("amountsVisible") === "true",
  );
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Auto-refresh "last updated" every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => setLastUpdated(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const showAmt = (val: string) => (amountsVisible ? val : "₹•••••");
  const showNum = (val: string | number) =>
    amountsVisible ? String(val) : "•••";

  // ── Date helpers ──────────────────────────────────────────────────────────
  const todayMs = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  const deadStockThreshold = shopSettings.deadStockThresholdDays ?? 90;

  // ── SECTION 1: SHOP INFO ──────────────────────────────────────────────────
  const shopName = currentShop?.name ?? "My Shop";
  const ownerName = currentUser?.name || currentUser?.mobile || "Owner";
  const totalProducts = products.length;
  const totalVendors = vendors.length;
  const totalCustomers = customers.length;
  const activeStaff = useMemo(
    () =>
      users.filter(
        (u) => u.active !== false && !u.deleted && u.role !== "owner",
      ).length,
    [users],
  );

  // ── SECTION 2: INVENTORY ─────────────────────────────────────────────────
  const totalStockValue = useMemo(
    () => batches.reduce((s, b) => s + b.quantity * b.purchaseRate, 0),
    [batches],
  );

  const lowStockCount = useMemo(
    () =>
      products.filter((p) => {
        const stock = getProductStock(p.id);
        return stock > 0 && stock <= p.minStockAlert;
      }).length,
    [products, getProductStock],
  );

  const outOfStockCount = useMemo(
    () => products.filter((p) => getProductStock(p.id) === 0).length,
    [products, getProductStock],
  );

  const deadStockCount = useMemo(
    () =>
      products.filter((p) => {
        const totalQty = batches
          .filter((b) => b.productId === p.id)
          .reduce((s, b) => s + b.quantity, 0);
        if (totalQty <= 0) return false;
        const last = getLastSoldDate(p.id);
        const daysSince = last
          ? Math.floor((todayMs - new Date(last).getTime()) / 86400000)
          : 9999;
        return daysSince >= deadStockThreshold;
      }).length,
    [products, batches, getLastSoldDate, todayMs, deadStockThreshold],
  );

  const totalBatches = batches.length;

  const top5ProductsByStock = useMemo(
    () =>
      products
        .map((p) => ({
          id: p.id,
          name: p.name,
          unit: p.unit,
          stock: getProductStock(p.id),
        }))
        .filter((p) => p.stock > 0)
        .sort((a, b) => b.stock - a.stock)
        .slice(0, 5),
    [products, getProductStock],
  );

  // ── SECTION 3: BUYING / PURCHASES ────────────────────────────────────────
  const purchaseStats = useMemo(() => {
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

  const topVendor = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    for (const po of purchaseOrders) {
      const vendor = vendors.find((v) => v.id === po.vendorId);
      const name = vendor?.name ?? po.vendorId ?? "Unknown";
      const entry = map.get(name);
      if (entry) entry.count += 1;
      else map.set(name, { name, count: 1 });
    }
    return [...map.values()].sort((a, b) => b.count - a.count)[0]?.name ?? "—";
  }, [purchaseOrders, vendors]);

  // ── SECTION 4: SELLING / SALES ───────────────────────────────────────────
  const salesStats = useMemo(() => {
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
      allTimeProfit,
    };
  }, [invoices]);

  const totalCreditDue = useMemo(
    () =>
      customers
        .filter((c) => c.creditBalance > 0)
        .reduce((s, c) => s + c.creditBalance, 0),
    [customers],
  );

  const netIncomeToday = salesStats.todaySales - purchaseStats.today;

  const topSellingProduct = useMemo(() => {
    const qtyMap = new Map<string, { name: string; qty: number }>();
    for (const inv of invoices) {
      for (const item of inv.items) {
        const entry = qtyMap.get(item.productId);
        if (entry) entry.qty += item.quantity;
        else
          qtyMap.set(item.productId, {
            name: item.productName ?? item.productId,
            qty: item.quantity,
          });
      }
    }
    return [...qtyMap.values()].sort((a, b) => b.qty - a.qty)[0]?.name ?? "—";
  }, [invoices]);

  const avgSaleValue = useMemo(
    () => (invoices.length > 0 ? salesStats.allTimeSales / invoices.length : 0),
    [invoices, salesStats.allTimeSales],
  );

  // ── SECTION 5: PERFORMANCE ───────────────────────────────────────────────
  const bestSalesDay = useMemo(() => {
    const dayMap = new Map<string, number>();
    for (const inv of invoices) {
      const day = inv.date.slice(0, 10);
      dayMap.set(day, (dayMap.get(day) ?? 0) + inv.totalAmount);
    }
    if (dayMap.size === 0) return { date: "—", amount: 0 };
    const [bestDate, bestAmt] = [...dayMap.entries()].sort(
      (a, b) => b[1] - a[1],
    )[0];
    return { date: fmtDate(bestDate), amount: bestAmt };
  }, [invoices]);

  const totalReturnValue = useMemo(
    () => returnEntries.reduce((s, r) => s + r.returnValue, 0),
    [returnEntries],
  );

  const totalDiamonds = useMemo(
    () => diamondRewards.reduce((s, d) => s + (d.diamondCount ?? 0), 0),
    [diamondRewards],
  );

  const diamondTier = getDiamondTier(totalDiamonds);
  const tierLabel =
    diamondTier === "diamond"
      ? "💎 Diamond"
      : diamondTier === "gold"
        ? "🥇 Gold"
        : diamondTier === "silver"
          ? "🥈 Silver"
          : "🥉 Bronze";

  const nextTierThreshold =
    totalDiamonds < 50
      ? 50
      : totalDiamonds < 200
        ? 200
        : totalDiamonds < 500
          ? 500
          : null;
  const nextLevelLabel = nextTierThreshold
    ? `${nextTierThreshold - totalDiamonds} more to next level`
    : "Max level reached! 🎉";

  // ── Print handler ─────────────────────────────────────────────────────────
  function handlePrint() {
    window.print();
  }

  // ── Share via WhatsApp ────────────────────────────────────────────────────
  function handleShare() {
    const nl = "\n";
    const summary = [
      `\u{1F4CA} *${shopName} \u2014 Shop Information Board*`,
      `\u{1F5D3}\uFE0F ${new Date().toLocaleDateString("en-IN")}`,
      nl,
      "\u{1F3EA} *Shop Info*",
      `Products: ${totalProducts} | Customers: ${totalCustomers} | Vendors: ${totalVendors}`,
      nl,
      "\u{1F4E6} *Inventory*",
      `Stock Value: ${fmtCurrency(totalStockValue)}`,
      `Low Stock: ${lowStockCount} | Out of Stock: ${outOfStockCount}`,
      nl,
      "\u{1F6D2} *Today's Sales*",
      `Sales: ${fmtCurrency(salesStats.todaySales)} | Profit: ${fmtCurrency(salesStats.todayProfit)}`,
      nl,
      "\u{1F4B0} *All Time*",
      `Total Sales: ${fmtCurrency(salesStats.allTimeSales)} | Total Profit: ${fmtCurrency(salesStats.allTimeProfit)}`,
      nl,
      `\u{1F48E} Diamonds: ${totalDiamonds} (${tierLabel})`,
    ];
    const text = encodeURIComponent(summary.join("\n"));
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 print:pb-0">
      {/* Sticky board header */}
      <div
        className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3 flex items-center gap-3 shadow-sm print:relative print:shadow-none"
        data-ocid="shop_board.header"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-foreground truncate">
              Shop Information Board
            </h1>
            {/* Live pulse indicator */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                Live
              </span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Updated{" "}
            {lastUpdated.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            <button
              type="button"
              onClick={() => setLastUpdated(new Date())}
              className="ml-1.5 inline-flex items-center text-primary hover:underline"
              aria-label="Refresh"
            >
              <RefreshCw size={11} className="inline" />
            </button>
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          {/* Eye toggle */}
          <button
            type="button"
            data-ocid="shop_board.eye_toggle"
            onClick={() => {
              setAmountsVisible((v) => !v);
              localStorage.setItem(
                "amountsVisible",
                (!amountsVisible).toString(),
              );
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
            title={amountsVisible ? "Hide amounts" : "Show amounts"}
          >
            {amountsVisible ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
          {/* Share */}
          <button
            type="button"
            data-ocid="shop_board.share_button"
            onClick={handleShare}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 transition-colors"
            title="Share via WhatsApp"
          >
            <Share2 size={15} />
          </button>
          {/* Print */}
          <button
            type="button"
            data-ocid="shop_board.print_button"
            onClick={handlePrint}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 transition-colors"
            title="Print board"
          >
            <Printer size={15} />
          </button>
        </div>
      </div>

      {/* Board grid */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* ── SECTION 1: SHOP INFO ── */}
        <SectionCard title="Shop Info" headerColor="bg-blue-600">
          <DataRow label="Shop Name" value={shopName} />
          <DataRow label="Owner" value={ownerName} />
          <DataRow label="Total Products" value={totalProducts} />
          <DataRow
            label="Active Staff"
            value={activeStaff > 0 ? activeStaff : "N/A"}
          />
          <DataRow label="Total Vendors" value={totalVendors} />
          <DataRow label="Total Customers" value={totalCustomers} />
        </SectionCard>

        {/* ── SECTION 2: INVENTORY ── */}
        <SectionCard title="Inventory" headerColor="bg-violet-600">
          <DataRow
            label="Total Stock Value"
            value={showAmt(fmtCurrency(totalStockValue))}
            valueClass="text-foreground font-bold"
          />
          <DataRow
            label="Low Stock Items"
            value={showNum(lowStockCount)}
            valueClass={
              lowStockCount > 0
                ? "text-amber-600 dark:text-amber-400"
                : "text-green-600 dark:text-green-400"
            }
          />
          <DataRow
            label="Out of Stock"
            value={showNum(outOfStockCount)}
            valueClass={
              outOfStockCount > 0
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400"
            }
          />
          <DataRow
            label="Dead Stock Items"
            value={showNum(deadStockCount)}
            valueClass={
              deadStockCount > 0
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400"
            }
          />
          <DataRow label="Total Batches" value={totalBatches} />
          {/* Top 5 products mini-list */}
          {top5ProductsByStock.length > 0 && (
            <div>
              <div className="px-4 py-1.5 bg-muted/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Top 5 Products by Stock
                </span>
              </div>
              {top5ProductsByStock.map((p, i) => (
                <MiniListRow
                  key={p.id}
                  rank={i + 1}
                  name={p.name}
                  sub={`${p.stock} ${p.unit}`}
                />
              ))}
            </div>
          )}
        </SectionCard>

        {/* ── SECTION 3: BUYING / PURCHASES ── */}
        <SectionCard title="Buying / Purchases" headerColor="bg-orange-500">
          <DataRow
            label="Today's Purchase"
            value={showAmt(fmtCurrency(purchaseStats.today))}
          />
          <DataRow
            label="This Week"
            value={showAmt(fmtCurrency(purchaseStats.week))}
          />
          <DataRow
            label="This Month"
            value={showAmt(fmtCurrency(purchaseStats.month))}
          />
          <DataRow
            label="Total Purchase (All Time)"
            value={showAmt(fmtCurrency(purchaseStats.allTime))}
            valueClass="text-foreground font-bold"
          />
          <DataRow
            label="Top Vendor"
            value={topVendor}
            trophy={topVendor !== "—"}
            valueClass="text-amber-600 dark:text-amber-400"
          />
          <DataRow
            label="Last Purchase Date"
            value={
              purchaseStats.lastDate ? fmtDate(purchaseStats.lastDate) : "—"
            }
          />
          <DataRow label="Total Purchase Entries" value={totalBatches} />
        </SectionCard>

        {/* ── SECTION 4: SELLING / SALES ── */}
        <SectionCard title="Selling / Sales" headerColor="bg-green-600">
          <DataRow
            label="Today's Sales"
            value={showAmt(fmtCurrency(salesStats.todaySales))}
            valueClass={
              salesStats.todaySales > 0
                ? "text-green-600 dark:text-green-400 font-bold"
                : "text-foreground"
            }
          />
          <DataRow
            label="This Week"
            value={showAmt(fmtCurrency(salesStats.weekSales))}
          />
          <DataRow
            label="This Month"
            value={showAmt(fmtCurrency(salesStats.monthSales))}
          />
          <DataRow
            label="Total Sales (All Time)"
            value={showAmt(fmtCurrency(salesStats.allTimeSales))}
            valueClass="text-foreground font-bold"
          />
          <DataRow
            label="Today's Profit"
            value={showAmt(fmtCurrency(salesStats.todayProfit))}
            valueClass={
              salesStats.todayProfit > 0
                ? "text-green-600 dark:text-green-400"
                : salesStats.todayProfit < 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-foreground"
            }
          />
          <DataRow
            label="Total Profit (All Time)"
            value={showAmt(fmtCurrency(salesStats.allTimeProfit))}
            valueClass={
              salesStats.allTimeProfit > 0
                ? "text-green-600 dark:text-green-400 font-bold"
                : "text-red-600 dark:text-red-400"
            }
          />
          <DataRow
            label="Net Income Today"
            value={showAmt(fmtCurrency(netIncomeToday))}
            valueClass={
              netIncomeToday >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }
          />
          <DataRow
            label="Credit / Due Amount"
            value={showAmt(fmtCurrency(totalCreditDue))}
            valueClass={
              totalCreditDue > 0
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400"
            }
          />
          <DataRow
            label="Top Selling Product"
            value={topSellingProduct}
            trophy={topSellingProduct !== "—"}
            valueClass="text-amber-600 dark:text-amber-400"
          />
          <DataRow label="Total Transactions" value={invoices.length} />
        </SectionCard>

        {/* ── SECTION 5: PERFORMANCE ── */}
        <SectionCard title="Performance" headerColor="bg-amber-500">
          <DataRow
            label="Best Sales Day"
            value={
              bestSalesDay.date !== "—"
                ? `${bestSalesDay.date} (${showAmt(fmtCurrency(bestSalesDay.amount))})`
                : "—"
            }
            trophy={bestSalesDay.date !== "—"}
            valueClass="text-amber-600 dark:text-amber-400"
          />
          <DataRow
            label="Avg Sale Value"
            value={showAmt(fmtCurrency(avgSaleValue))}
          />
          <DataRow
            label="Total Returns"
            value={`${returnEntries.length} (${showAmt(fmtCurrency(totalReturnValue))})`}
            valueClass={
              returnEntries.length > 0
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400"
            }
          />
          <DataRow
            label="Diamond Rewards Earned"
            value={`💎 ${showNum(totalDiamonds)}`}
            valueClass="text-violet-600 dark:text-violet-400 font-bold"
          />
          <DataRow
            label="Diamond Level"
            value={tierLabel}
            valueClass="text-amber-600 dark:text-amber-400 font-bold"
          />
          <DataRow
            label="Next Level"
            value={nextLevelLabel}
            valueClass="text-muted-foreground text-xs"
          />
        </SectionCard>
      </div>

      {/* Print styles — scoped via className overrides */}
    </div>
  );
}
