import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart2,
  Download,
  IndianRupee,
  ShoppingBag,
  Table2,
  TrendingUp,
  Truck,
  Utensils,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStore } from "../context/StoreContext";
import { useRestaurantData } from "../hooks/useRestaurantData";
import type { RestaurantBill } from "../types/restaurant";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

function fmtShort(n: number) {
  if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (Math.abs(n) >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${Math.round(n)}`;
}

function getDateKey(iso: string) {
  return iso.slice(0, 10);
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatDayLabel(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// ─── Date range presets ───────────────────────────────────────────────────────

type RangePreset = "today" | "week" | "month" | "custom";

function getRangeFromPreset(preset: Exclude<RangePreset, "custom">): {
  from: string;
  to: string;
} {
  const today = getToday();
  if (preset === "today") return { from: today, to: today };
  if (preset === "week") {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return { from: d.toISOString().slice(0, 10), to: today };
  }
  // month
  const d = new Date();
  d.setDate(1);
  return { from: d.toISOString().slice(0, 10), to: today };
}

// ─── KPI Stat Card ─────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  ocid,
  accent = "primary",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  ocid: string;
  accent?: "primary" | "green" | "amber" | "blue";
}) {
  const accentMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    green: "bg-success-light text-success",
    amber: "bg-warning-light text-warning",
    blue: "bg-accent text-accent-foreground",
  };
  return (
    <Card data-ocid={ocid} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accentMap[accent]}`}
          >
            <Icon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold text-foreground truncate">
              {value}
            </p>
            {sub && (
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────────

function CustomBarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-muted-foreground">
          {entry.name}:{" "}
          <span className="font-semibold text-foreground">
            {entry.name === "Revenue" ? fmtCurrency(entry.value) : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

const DONUT_COLORS = [
  "oklch(var(--category-drinks))",
  "oklch(var(--category-snacks))",
  "oklch(var(--category-veg))",
];

export function RestaurantReportsPage() {
  const { shopId } = useStore();
  const { bills, activeOrders } = useRestaurantData(shopId);

  const today = getToday();
  const [rangePreset, setRangePreset] = useState<RangePreset>("week");
  const [customFrom, setCustomFrom] = useState(today);
  const [customTo, setCustomTo] = useState(today);

  // Compute from/to based on preset
  const { from, to } = useMemo(() => {
    if (rangePreset === "custom") return { from: customFrom, to: customTo };
    return getRangeFromPreset(rangePreset);
  }, [rangePreset, customFrom, customTo]);

  // Filter bills to selected range
  const rangedBills = useMemo(
    () =>
      bills.filter((b) => {
        const d = getDateKey(b.createdAt);
        return d >= from && d <= to;
      }),
    [bills, from, to],
  );

  // ── Summary KPIs ─────────────────────────────────────────────────────────
  const totalOrders = rangedBills.length;
  const totalRevenue = useMemo(
    () => rangedBills.reduce((s, b) => s + b.totalAmount, 0),
    [rangedBills],
  );
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // ── All-time stats ────────────────────────────────────────────────────────
  const allTimeRevenue = useMemo(
    () => bills.reduce((s, b) => s + b.totalAmount, 0),
    [bills],
  );

  // ── Order type breakdown for RANGED bills ─────────────────────────────────
  const orderTypeBreakdown = useMemo(() => {
    const counts = { "dine-in": 0, takeaway: 0, online: 0 };
    for (const bill of rangedBills) {
      const order = activeOrders.find((o) => o.id === bill.orderId);
      const type = order?.orderType ?? "dine-in";
      if (type in counts) counts[type as keyof typeof counts]++;
    }
    return [
      { name: "Dine-In", value: counts["dine-in"] },
      { name: "Takeaway", value: counts.takeaway },
      { name: "Online", value: counts.online },
    ].filter((d) => d.value > 0);
  }, [rangedBills, activeOrders]);

  // ── Top 5 selling items ───────────────────────────────────────────────────
  const topItems = useMemo(() => {
    const map = new Map<
      string,
      { name: string; category: string; count: number; revenue: number }
    >();
    for (const bill of rangedBills) {
      for (const item of bill.items) {
        const existing = map.get(item.menuItemId);
        if (existing) {
          existing.count += item.quantity;
          existing.revenue += item.totalPrice;
        } else {
          map.set(item.menuItemId, {
            name: item.menuItemName,
            category: "—",
            count: item.quantity,
            revenue: item.totalPrice,
          });
        }
      }
    }
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [rangedBills]);

  // ── Daily revenue chart data ──────────────────────────────────────────────
  const dailyChartData = useMemo(() => {
    if (!from || !to) return [];
    const result: {
      date: string;
      label: string;
      Revenue: number;
      Orders: number;
    }[] = [];
    const start = new Date(from);
    const end = new Date(to);
    const diffDays = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    // Cap at 31 days for readability
    const days = Math.min(diffDays + 1, 31);
    for (let i = 0; i < days; i++) {
      const d = addDays(start, i);
      const key = d.toISOString().slice(0, 10);
      const dayBills = rangedBills.filter(
        (b) => getDateKey(b.createdAt) === key,
      );
      result.push({
        date: key,
        label: d.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        }),
        Revenue: Math.round(dayBills.reduce((s, b) => s + b.totalAmount, 0)),
        Orders: dayBills.length,
      });
    }
    return result;
  }, [from, to, rangedBills]);

  // ── Print / PDF export ────────────────────────────────────────────────────
  const handleExport = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-6 space-y-6" data-ocid="restaurant.reports.page">
      {/* Page header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <BarChart2 className="text-primary" size={22} />
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Restaurant Reports
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sales analytics and performance overview
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          data-ocid="restaurant.reports.export_button"
          className="gap-2 print:hidden"
        >
          <Download size={15} />
          Export PDF
        </Button>
      </div>

      {/* ── Date range selector ─────────────────────────────────────────────── */}
      <Card className="print:hidden">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">
              Period:
            </Label>
            {(["today", "week", "month", "custom"] as RangePreset[]).map(
              (preset) => (
                <button
                  key={preset}
                  type="button"
                  data-ocid={`restaurant.reports.range.${preset}`}
                  onClick={() => setRangePreset(preset)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-150 capitalize ${
                    rangePreset === preset
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {preset === "week"
                    ? "This Week"
                    : preset === "month"
                      ? "This Month"
                      : preset === "custom"
                        ? "Custom"
                        : "Today"}
                </button>
              ),
            )}
            {rangePreset === "custom" && (
              <div className="flex items-center gap-2 ml-2">
                <Input
                  type="date"
                  data-ocid="restaurant.reports.date_from.input"
                  value={customFrom}
                  max={customTo}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="h-8 w-36 text-sm"
                />
                <span className="text-xs text-muted-foreground">to</span>
                <Input
                  type="date"
                  data-ocid="restaurant.reports.date_to.input"
                  value={customTo}
                  min={customFrom}
                  max={today}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="h-8 w-36 text-sm"
                />
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {from === to
              ? `Showing data for ${formatDayLabel(from)}`
              : `${formatDayLabel(from)} — ${formatDayLabel(to)}`}
          </p>
        </CardContent>
      </Card>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <section data-ocid="restaurant.reports.kpi.section">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Total Orders"
            value={totalOrders}
            sub="Selected period"
            icon={ShoppingBag}
            ocid="restaurant.reports.total_orders.card"
            accent="primary"
          />
          <StatCard
            label="Total Revenue"
            value={fmtCurrency(totalRevenue)}
            sub="Selected period"
            icon={IndianRupee}
            ocid="restaurant.reports.total_revenue.card"
            accent="green"
          />
          <StatCard
            label="Avg. Order Value"
            value={fmtCurrency(avgOrderValue)}
            sub="Per order"
            icon={TrendingUp}
            ocid="restaurant.reports.avg_order.card"
            accent="amber"
          />
          <StatCard
            label="All-Time Revenue"
            value={fmtShort(allTimeRevenue)}
            sub={`${bills.length} total orders`}
            icon={IndianRupee}
            ocid="restaurant.reports.all_time_revenue.card"
            accent="blue"
          />
        </div>
      </section>

      {/* ── Daily Revenue Bar Chart ─────────────────────────────────────────── */}
      <section data-ocid="restaurant.reports.chart.section">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart2 size={16} className="text-primary" />
              Daily Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyChartData.length === 0 || totalRevenue === 0 ? (
              <div
                className="flex flex-col items-center justify-center h-48 text-muted-foreground"
                data-ocid="restaurant.reports.chart.empty_state"
              >
                <BarChart2 size={32} className="mb-2 opacity-20" />
                <p className="text-sm">No revenue data for this period</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={dailyChartData}
                  margin={{ top: 4, right: 4, bottom: 4, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={fmtShort}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    width={52}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar
                    dataKey="Revenue"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── Order Type Donut Chart ──────────────────────────────────────────── */}
      <section data-ocid="restaurant.reports.order_types.section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Utensils size={16} className="text-primary" />
                Orders by Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orderTypeBreakdown.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center h-44 text-muted-foreground"
                  data-ocid="restaurant.reports.order_types.empty_state"
                >
                  <Utensils size={28} className="mb-2 opacity-20" />
                  <p className="text-sm">No orders in this period</p>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="60%" height={160}>
                    <PieChart>
                      <Pie
                        data={orderTypeBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {orderTypeBreakdown.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [value, "Orders"]}
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-2 flex-1">
                    {orderTypeBreakdown.map((entry, i) => (
                      <div
                        key={entry.name}
                        data-ocid={`restaurant.reports.order_type.${i + 1}`}
                        className="flex items-center gap-2"
                      >
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{
                            background: DONUT_COLORS[i % DONUT_COLORS.length],
                          }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {entry.name}
                        </span>
                        <span className="text-xs font-bold text-foreground ml-auto">
                          {entry.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Order type summary pills ── */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp size={16} className="text-primary" />
                Type Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Dine-In", icon: Table2, color: "blue" },
                { label: "Takeaway", icon: ShoppingBag, color: "amber" },
                { label: "Online", icon: Truck, color: "green" },
              ].map(({ label, icon: Icon, color }) => {
                const entry = orderTypeBreakdown.find((e) => e.name === label);
                const count = entry?.value ?? 0;
                const pct =
                  totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
                const barColor =
                  color === "blue"
                    ? "oklch(var(--category-drinks))"
                    : color === "amber"
                      ? "oklch(var(--category-snacks))"
                      : "oklch(var(--category-veg))";
                return (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Icon size={14} style={{ color: barColor }} />
                        <span className="text-muted-foreground">{label}</span>
                      </div>
                      <span className="font-semibold text-foreground">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: barColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Top 5 Selling Items ─────────────────────────────────────────────── */}
      <section data-ocid="restaurant.reports.top_items.section">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Top 5 Selling Items
        </h2>
        {topItems.length === 0 ? (
          <Card>
            <CardContent>
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="restaurant.reports.top_items.empty_state"
              >
                <Utensils size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">
                  No sales data for this period
                </p>
                <p className="text-xs mt-1 opacity-70">
                  Generate bills to see top selling items
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs pl-4 py-3">#</TableHead>
                    <TableHead className="text-xs py-3">Item Name</TableHead>
                    <TableHead className="text-xs py-3">Category</TableHead>
                    <TableHead className="text-xs py-3 text-right">
                      Qty Sold
                    </TableHead>
                    <TableHead className="text-xs py-3 text-right pr-4">
                      Revenue
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topItems.map((item, idx) => (
                    <TableRow
                      key={item.name}
                      data-ocid={`restaurant.reports.top_item.${idx + 1}`}
                    >
                      <TableCell className="pl-4 py-3">
                        <span
                          className={`inline-flex w-6 h-6 rounded-full text-xs font-bold items-center justify-center ${
                            idx === 0
                              ? "bg-amber-500/20 text-amber-700"
                              : idx === 1
                                ? "bg-slate-300/40 text-foreground"
                                : idx === 2
                                  ? "bg-orange-400/20 text-orange-700"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 font-medium text-foreground">
                        {item.name}
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-right font-semibold">
                        {item.count}
                      </TableCell>
                      <TableCell className="py-3 text-right font-bold text-primary pr-4">
                        {fmtCurrency(item.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Print stylesheet */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white; }
        }
      `}</style>
    </div>
  );
}
