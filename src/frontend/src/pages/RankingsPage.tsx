import { useMemo, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useStore } from "../context/StoreContext";

type TabKey = "products" | "profit" | "customers" | "vendors" | "staff";

interface RankRow {
  id: string;
  name: string;
  value: number;
  secondaryLabel?: string;
}

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function getRankBg(rank: number) {
  if (rank === 1)
    return "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40";
  if (rank === 2)
    return "bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40";
  if (rank === 3)
    return "bg-orange-50 dark:bg-orange-900/15 border border-orange-200 dark:border-orange-700/40";
  return "bg-card border border-border";
}

function formatValue(v: number) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
}

function RankRow({ row, rank }: { row: RankRow; rank: number }) {
  const medal = MEDAL[rank];
  return (
    <div
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-150 ${getRankBg(rank)}`}
      data-ocid={`rankings.row.${rank}`}
    >
      <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
        {medal ? (
          <span className="text-lg leading-none">{medal}</span>
        ) : (
          <span className="text-xs font-bold text-muted-foreground w-5 h-5 rounded-full bg-muted flex items-center justify-center">
            {rank}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {row.name}
        </p>
        {row.secondaryLabel && (
          <p className="text-xs text-muted-foreground">{row.secondaryLabel}</p>
        )}
      </div>

      <span
        className={`text-sm font-bold flex-shrink-0 ${
          rank === 1
            ? "text-amber-600 dark:text-amber-400"
            : rank <= 3
              ? "text-foreground"
              : "text-muted-foreground"
        }`}
      >
        {formatValue(row.value)}
      </span>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 gap-3"
      data-ocid="rankings.empty_state"
    >
      <span className="text-4xl">📊</span>
      <p className="text-sm text-muted-foreground text-center">{label}</p>
    </div>
  );
}

const TABS: { key: TabKey; label: string; emoji: string }[] = [
  { key: "products", label: "Top Products", emoji: "🏆" },
  { key: "profit", label: "High Profit", emoji: "💰" },
  { key: "customers", label: "Customers", emoji: "👤" },
  { key: "vendors", label: "Vendors", emoji: "🏪" },
  { key: "staff", label: "Staff", emoji: "👨‍💼" },
];

export function RankingsPage() {
  const { invoices, products, vendors, purchaseOrders } = useStore();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabKey>("products");

  // ── Top Selling Products (by revenue) ───────────────────────────
  const topSellingProducts = useMemo((): RankRow[] => {
    const map = new Map<string, { name: string; revenue: number }>();
    for (const inv of invoices) {
      for (const item of inv.items) {
        const prev = map.get(item.productId) ?? {
          name: item.productName,
          revenue: 0,
        };
        map.set(item.productId, {
          name: item.productName,
          revenue: prev.revenue + item.quantity * item.sellingRate,
        });
      }
    }
    return Array.from(map.entries())
      .map(([id, v]) => ({ id, name: v.name, value: v.revenue }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [invoices]);

  // ── High Profit Products (by total profit) ───────────────────────
  const highProfitProducts = useMemo((): RankRow[] => {
    const map = new Map<string, { name: string; profit: number }>();
    for (const inv of invoices) {
      for (const item of inv.items) {
        const itemProfit =
          item.totalProfit != null
            ? item.totalProfit
            : (item.sellingRate - item.purchaseCost) * item.quantity;
        const prev = map.get(item.productId) ?? {
          name: item.productName,
          profit: 0,
        };
        map.set(item.productId, {
          name: item.productName,
          profit: prev.profit + itemProfit,
        });
      }
    }
    return Array.from(map.entries())
      .map(([id, v]) => ({ id, name: v.name, value: v.profit }))
      .filter((r) => r.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [invoices]);

  // ── Top Customers (by total purchase) ───────────────────────────
  const topCustomers = useMemo((): RankRow[] => {
    const map = new Map<string, { name: string; total: number }>();
    for (const inv of invoices) {
      if (!inv.customerName || inv.customerName === "Walk-in Customer")
        continue;
      const key =
        inv.customerMobile?.trim() || inv.customerName.trim().toLowerCase();
      const prev = map.get(key) ?? { name: inv.customerName, total: 0 };
      map.set(key, {
        name: inv.customerName,
        total: prev.total + inv.totalAmount,
      });
    }
    return Array.from(map.entries())
      .map(([id, v]) => ({ id, name: v.name, value: v.total }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [invoices]);

  // ── Top Vendors (by purchase order value) ───────────────────────
  const topVendors = useMemo((): RankRow[] => {
    const map = new Map<string, { name: string; total: number }>();
    for (const po of purchaseOrders) {
      const vendor = vendors.find((v) => v.id === po.vendorId);
      const vendorName = vendor?.name ?? po.vendorId;
      const orderTotal =
        po.qty * po.rate + (po.transportCharge ?? 0) + (po.labourCharge ?? 0);
      const prev = map.get(po.vendorId) ?? { name: vendorName, total: 0 };
      map.set(po.vendorId, {
        name: vendorName,
        total: prev.total + orderTotal,
      });
    }
    // Fallback: use products vendorName if no purchase orders
    if (map.size === 0) {
      for (const product of products) {
        if (!product.vendorName) continue;
        const key = product.vendorName.trim().toLowerCase();
        const prev = map.get(key) ?? { name: product.vendorName, total: 0 };
        const cost = product.costPrice ?? product.purchasePrice ?? 0;
        map.set(key, { name: product.vendorName, total: prev.total + cost });
      }
    }
    return Array.from(map.entries())
      .map(([id, v]) => ({ id, name: v.name, value: v.total }))
      .filter((r) => r.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [purchaseOrders, vendors, products]);

  // ── Top Staff (by total sales) ───────────────────────────────────
  const topStaff = useMemo((): RankRow[] => {
    const map = new Map<string, { name: string; total: number }>();
    for (const inv of invoices) {
      const staffName = inv.soldByName || "Owner";
      const key = inv.soldByUserId || staffName.toLowerCase();
      const prev = map.get(key) ?? { name: staffName, total: 0 };
      map.set(key, { name: staffName, total: prev.total + inv.totalAmount });
    }
    return Array.from(map.entries())
      .map(([id, v]) => ({ id, name: v.name, value: v.total }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [invoices]);

  const dataMap: Record<TabKey, RankRow[]> = {
    products: topSellingProducts,
    profit: highProfitProducts,
    customers: topCustomers,
    vendors: topVendors,
    staff: topStaff,
  };

  const emptyMessages: Record<TabKey, string> = {
    products: "Koi bhi sales record nahi mila",
    profit: "Profit data available nahi hai",
    customers: "Customer purchase history nahi mili",
    vendors: "Vendor order history nahi mila",
    staff: "Staff sales data nahi mila",
  };

  const rows = dataMap[activeTab];

  return (
    <div className="flex-1 p-3 md:p-5 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            🏆 {t("Rankings")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("Top Performers")}
          </p>
        </div>
        <div className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
          Top 10
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1"
        data-ocid="rankings.tabs"
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            data-ocid={`rankings.tab.${tab.key}`}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 flex-shrink-0 ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <span>{tab.emoji}</span>
            <span>{t(tab.label)}</span>
          </button>
        ))}
      </div>

      {/* Ranking list */}
      <div
        className="bg-card rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 6px 16px rgba(0,0,0,0.06)" }}
      >
        {rows.length === 0 ? (
          <EmptyState label={emptyMessages[activeTab]} />
        ) : (
          <div className="p-3 space-y-1.5">
            {/* Top 3 section */}
            {rows.slice(0, 3).map((row, i) => (
              <RankRow key={row.id} row={row} rank={i + 1} />
            ))}

            {/* Separator between top-3 and rest */}
            {rows.length > 3 && (
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-2 text-xs text-muted-foreground">
                    ···
                  </span>
                </div>
              </div>
            )}

            {/* Ranks 4–10 */}
            {rows.slice(3).map((row, i) => (
              <RankRow key={row.id} row={row} rank={i + 4} />
            ))}
          </div>
        )}
      </div>

      {/* Summary footer */}
      {rows.length > 0 && (
        <div
          className="bg-card rounded-xl px-4 py-3 flex items-center justify-between"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <span className="text-xs text-muted-foreground">
            {t("Total")} {rows.length} {t("entries")}
          </span>
          <span className="text-xs font-semibold text-primary">
            {t("Top")}: {rows[0]?.name ?? "—"}
          </span>
        </div>
      )}
    </div>
  );
}
