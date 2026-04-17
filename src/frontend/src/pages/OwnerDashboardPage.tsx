import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { NavPage } from "../types/store";

interface OwnerDashboardPageProps {
  onNavigate: (page: NavPage) => void;
}

interface ShopStats {
  shopId: string;
  shopName: string;
  sales: number;
  profit: number;
  products: number;
  customers: number;
  transactions: number;
}

interface OwnerSummary {
  totalSales: number;
  totalProfit: number;
  totalProducts: number;
  totalCustomers: number;
  totalTransactions: number;
  shopStats: ShopStats[];
}

function fmt(n: number, hide: boolean): string {
  if (hide) return "₹ ••••";
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function fmtNum(n: number, hide: boolean): string {
  if (hide) return "••••";
  return n.toLocaleString("en-IN");
}

export function OwnerDashboardPage({ onNavigate }: OwnerDashboardPageProps) {
  const { allShops, session, getOwnerStats, switchShop } = useAuth();
  const [summary, setSummary] = useState<OwnerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [hideAmounts, setHideAmounts] = useState(false);

  const mobile = session?.mobile ?? "";
  const activeShopId = session?.selectedShopId ?? session?.shopId ?? "";

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const stats = await getOwnerStats(mobile);
        if (cancelled) return;

        if (stats) {
          // Build per-shop breakdown from backend stats (bigint → number)
          const shopStats: ShopStats[] = allShops.map((shop) => {
            const found = stats.shopStats?.find((s) => s.shopId === shop.id);
            return {
              shopId: shop.id,
              shopName: shop.name,
              sales: found ? Number(found.sales) : 0,
              profit: found ? Number(found.profit) : 0,
              products: found ? Number(found.products) : 0,
              customers: found ? Number(found.customers) : 0,
              transactions: found ? Number(found.transactions) : 0,
            };
          });

          setSummary({
            totalSales: Number(stats.totalSales ?? 0),
            totalProfit: Number(stats.totalProfit ?? 0),
            totalProducts: Number(stats.totalProducts ?? 0),
            totalCustomers: Number(stats.totalCustomers ?? 0),
            totalTransactions: Number(stats.totalTransactions ?? 0),
            shopStats,
          });
        } else {
          // Fallback with zeros
          setSummary({
            totalSales: 0,
            totalProfit: 0,
            totalProducts: 0,
            totalCustomers: 0,
            totalTransactions: 0,
            shopStats: allShops.map((shop) => ({
              shopId: shop.id,
              shopName: shop.name,
              sales: 0,
              profit: 0,
              products: 0,
              customers: 0,
              transactions: 0,
            })),
          });
        }
      } catch {
        if (!cancelled) {
          setSummary({
            totalSales: 0,
            totalProfit: 0,
            totalProducts: 0,
            totalCustomers: 0,
            totalTransactions: 0,
            shopStats: allShops.map((shop) => ({
              shopId: shop.id,
              shopName: shop.name,
              sales: 0,
              profit: 0,
              products: 0,
              customers: 0,
              transactions: 0,
            })),
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (mobile) load();
    return () => {
      cancelled = true;
    };
  }, [mobile, allShops, getOwnerStats]);

  const handleSwitchShop = (shopId: string) => {
    switchShop(shopId);
    onNavigate("dashboard");
  };

  const statCards = summary
    ? [
        {
          label: "Total Sales",
          value: fmt(summary.totalSales, hideAmounts),
          icon: ShoppingBag,
          color: "text-green-600",
          bg: "bg-green-50 dark:bg-green-950/30",
        },
        {
          label: "Total Profit",
          value: fmt(summary.totalProfit, hideAmounts),
          icon: TrendingUp,
          color: "text-blue-600",
          bg: "bg-blue-50 dark:bg-blue-950/30",
        },
        {
          label: "Total Products",
          value: fmtNum(summary.totalProducts, hideAmounts),
          icon: Package,
          color: "text-violet-600",
          bg: "bg-violet-50 dark:bg-violet-950/30",
        },
        {
          label: "Total Customers",
          value: fmtNum(summary.totalCustomers, hideAmounts),
          icon: Users,
          color: "text-amber-600",
          bg: "bg-amber-50 dark:bg-amber-950/30",
        },
        {
          label: "Total Transactions",
          value: fmtNum(summary.totalTransactions, hideAmounts),
          icon: Building2,
          color: "text-rose-600",
          bg: "bg-rose-50 dark:bg-rose-950/30",
        },
      ]
    : [];

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
      {/* Header Card */}
      <div
        data-ocid="owner_dashboard.header_card"
        className="bg-card border border-border rounded-2xl p-5 shadow-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground leading-tight">
              Owner Overview
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Mobile:{" "}
              <span className="font-medium text-foreground">+91 {mobile}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-3 py-1.5 text-xs font-semibold">
              <Building2 size={13} />
              {allShops.length} Shops
            </div>
            <button
              type="button"
              data-ocid="owner_dashboard.hide_amounts_toggle"
              onClick={() => setHideAmounts((p) => !p)}
              className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title={hideAmounts ? "Show amounts" : "Hide amounts"}
            >
              {hideAmounts ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
      </div>

      {/* Combined Stats Row */}
      <div data-ocid="owner_dashboard.stats_section">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Combined Statistics
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {["sales", "profit", "products", "customers", "transactions"].map(
              (k) => (
                <Skeleton key={k} className="h-20 rounded-xl" />
              ),
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="bg-card border border-border rounded-xl p-3 flex flex-col gap-2 shadow-sm"
                >
                  <div
                    className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}
                  >
                    <Icon size={15} className={card.color} />
                  </div>
                  <div>
                    <p className={`text-base font-bold ${card.color}`}>
                      {card.value}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                      {card.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Shop-wise Breakdown Table */}
      <div data-ocid="owner_dashboard.shop_breakdown_section">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Shop-wise Breakdown
        </h2>
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    #
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Shop Name
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-green-600 uppercase tracking-wide">
                    Sales (₹)
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-blue-600 uppercase tracking-wide">
                    Profit (₹)
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Products
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Customers
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Txns
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading
                  ? ["r1", "r2", "r3"].map((rk) => (
                      <tr key={rk}>
                        {["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"].map(
                          (ck) => (
                            <td key={ck} className="px-4 py-3">
                              <Skeleton className="h-4 w-16" />
                            </td>
                          ),
                        )}
                      </tr>
                    ))
                  : summary?.shopStats.map((shop, idx) => {
                      const isActive = shop.shopId === activeShopId;
                      return (
                        <tr
                          key={shop.shopId}
                          data-ocid={`owner_dashboard.shop_row.${idx + 1}`}
                          className={`transition-colors ${isActive ? "bg-primary/5" : "hover:bg-muted/30"}`}
                        >
                          <td className="px-4 py-3 text-xs text-muted-foreground font-medium">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-semibold text-sm ${isActive ? "text-primary" : "text-foreground"}`}
                              >
                                {shop.shopName}
                              </span>
                              {isActive && (
                                <span className="text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-semibold leading-none">
                                  Active
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-green-600">
                            {fmt(shop.sales, hideAmounts)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-blue-600">
                            {fmt(shop.profit, hideAmounts)}
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground">
                            {fmtNum(shop.products, hideAmounts)}
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground">
                            {fmtNum(shop.customers, hideAmounts)}
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground">
                            {fmtNum(shop.transactions, hideAmounts)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {!isActive && (
                              <button
                                type="button"
                                data-ocid={`owner_dashboard.switch_shop_button.${idx + 1}`}
                                onClick={() => handleSwitchShop(shop.shopId)}
                                className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                                title={`Switch to ${shop.shopName}`}
                              >
                                Switch <ArrowRight size={12} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-border">
            {loading
              ? ["m1", "m2"].map((mk) => (
                  <div key={mk} className="p-4">
                    <Skeleton className="h-4 w-32 mb-3" />
                    <div className="grid grid-cols-2 gap-2">
                      {["a", "b", "c", "d"].map((sk) => (
                        <Skeleton key={sk} className="h-10 rounded-lg" />
                      ))}
                    </div>
                  </div>
                ))
              : summary?.shopStats.map((shop, idx) => {
                  const isActive = shop.shopId === activeShopId;
                  return (
                    <div
                      key={shop.shopId}
                      data-ocid={`owner_dashboard.shop_card.${idx + 1}`}
                      className={`p-4 ${isActive ? "bg-primary/5" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold text-sm ${isActive ? "text-primary" : "text-foreground"}`}
                          >
                            {shop.shopName}
                          </span>
                          {isActive && (
                            <span className="text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-semibold leading-none">
                              Active
                            </span>
                          )}
                        </div>
                        {!isActive && (
                          <button
                            type="button"
                            data-ocid={`owner_dashboard.switch_shop_mobile_button.${idx + 1}`}
                            onClick={() => handleSwitchShop(shop.shopId)}
                            className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-1"
                          >
                            Switch <ArrowRight size={11} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-2">
                          <p className="text-[10px] text-muted-foreground">
                            Sales
                          </p>
                          <p className="text-sm font-bold text-green-600">
                            {fmt(shop.sales, hideAmounts)}
                          </p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2">
                          <p className="text-[10px] text-muted-foreground">
                            Profit
                          </p>
                          <p className="text-sm font-bold text-blue-600">
                            {fmt(shop.profit, hideAmounts)}
                          </p>
                        </div>
                        <div className="bg-muted/40 rounded-lg p-2">
                          <p className="text-[10px] text-muted-foreground">
                            Products
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            {fmtNum(shop.products, hideAmounts)}
                          </p>
                        </div>
                        <div className="bg-muted/40 rounded-lg p-2">
                          <p className="text-[10px] text-muted-foreground">
                            Customers
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            {fmtNum(shop.customers, hideAmounts)}
                          </p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-2 col-span-2">
                          <p className="text-[10px] text-muted-foreground">
                            Transactions
                          </p>
                          <p className="text-sm font-bold text-purple-600">
                            {fmtNum(shop.transactions, hideAmounts)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </div>

      {/* Bottom spacer for FAB */}
      <div className="h-16 md:h-4" />
    </div>
  );
}
