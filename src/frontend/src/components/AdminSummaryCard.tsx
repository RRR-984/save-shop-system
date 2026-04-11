import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, EyeOff, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

type DateFilter = "today" | "week" | "month" | "all";

const FILTER_LABELS: Record<DateFilter, string> = {
  today: "Today",
  week: "Week",
  month: "Month",
  all: "All",
};

function isWithinFilter(dateStr: string, filter: DateFilter): boolean {
  const now = new Date();
  const d = new Date(dateStr);
  if (filter === "all") return true;
  if (filter === "today") {
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }
  if (filter === "week") {
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0);
    return d >= weekAgo;
  }
  if (filter === "month") {
    return (
      d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    );
  }
  return true;
}

export function AdminSummaryCard() {
  const { currentUser } = useAuth();
  const { invoices } = useStore();
  const [filter, setFilter] = useState<DateFilter>("today");
  const [amountsVisible, setAmountsVisible] = useState<boolean>(
    () => localStorage.getItem("amountsVisible") !== "false",
  );

  useEffect(() => {
    localStorage.setItem("amountsVisible", amountsVisible ? "true" : "false");
  }, [amountsVisible]);

  const showAmt = (value: number) => (amountsVisible ? fmt(value) : "₹••••");

  const filtered = useMemo(
    () => invoices.filter((inv) => isWithinFilter(inv.date, filter)),
    [invoices, filter],
  );

  // Section A: Staff Performance
  const staffStats = useMemo(() => {
    const map = new Map<
      string,
      { name: string; totalSale: number; extraProfit: number; bonus: number }
    >();
    for (const inv of filtered) {
      const key = inv.soldByUserId ?? inv.soldByName ?? "owner-default";
      const name = inv.soldByName ?? "Owner";
      const existing = map.get(key);
      if (existing) {
        existing.totalSale += inv.totalAmount;
        existing.extraProfit += inv.totalExtraProfit ?? 0;
        existing.bonus += inv.totalStaffBonus ?? 0;
      } else {
        map.set(key, {
          name,
          totalSale: inv.totalAmount,
          extraProfit: inv.totalExtraProfit ?? 0,
          bonus: inv.totalStaffBonus ?? 0,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.totalSale - a.totalSale);
  }, [filtered]);

  // Section B: Totals
  const totals = useMemo(() => {
    let totalSale = 0;
    let totalDiscount = 0;
    let totalExtraProfit = 0;
    for (const inv of filtered) {
      totalSale += inv.totalAmount;
      totalExtraProfit += inv.totalExtraProfit ?? 0;
      for (const item of inv.items) {
        if (
          item.discountPct &&
          item.discountPct > 0 &&
          item.basePrice !== undefined &&
          item.basePrice > item.sellingRate
        ) {
          totalDiscount += (item.basePrice - item.sellingRate) * item.quantity;
        }
      }
    }
    return { totalSale, totalDiscount, totalExtraProfit };
  }, [filtered]);

  // Section C: Final Summary
  const summary = useMemo(() => {
    let netIncome = 0;
    let totalProfit = 0;
    for (const inv of filtered) {
      netIncome += inv.paidAmount;
      totalProfit += inv.invoiceTotalProfit ?? 0;
    }
    return { netIncome, totalProfit };
  }, [filtered]);

  // Only show for owner — manager sees full dashboard but NOT the Admin Summary Card
  if (!currentUser || currentUser.role !== "owner") return null;

  const topPerformer = staffStats[0] ?? null;
  const highestBonusStaff = staffStats.reduce(
    (best, s) => (s.bonus > (best?.bonus ?? 0) ? s : best),
    null as (typeof staffStats)[0] | null,
  );

  return (
    <div
      data-ocid="admin.summary.card"
      className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <span>📊</span> Admin Summary
          </h2>
          {/* Eye toggle */}
          <button
            type="button"
            data-ocid="admin.summary.toggle_visibility"
            aria-label={amountsVisible ? "Hide amounts" : "Show amounts"}
            onClick={() => setAmountsVisible((v) => !v)}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            {amountsVisible ? (
              <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            ) : (
              <EyeOff className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            )}
          </button>
        </div>
        {/* Date Filter */}
        <div
          data-ocid="admin.summary.tab"
          className="flex gap-1 bg-secondary rounded-lg p-1"
        >
          {(Object.keys(FILTER_LABELS) as DateFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                filter === f
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Section A: Staff Performance */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              A. Staff Performance
            </h3>
            {highestBonusStaff && highestBonusStaff.bonus > 0 && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 border text-xs font-medium">
                🎯 Highest Bonus:{" "}
                {amountsVisible ? fmt(highestBonusStaff.bonus) : "••••"} by{" "}
                {highestBonusStaff.name}
              </Badge>
            )}
          </div>

          {staffStats.length === 0 ? (
            <div
              data-ocid="admin.staff.empty_state"
              className="text-center py-6 text-sm text-muted-foreground bg-secondary/50 rounded-xl border border-border"
            >
              Is period mein koi sale nahi
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="text-xs font-semibold text-muted-foreground w-[140px]">
                      Staff Name
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-blue-600 text-right">
                      Total Sale
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-success text-right">
                      Extra Profit
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-success text-right">
                      Bonus Earned
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffStats.map((staff, idx) => {
                    const isTop =
                      topPerformer?.name === staff.name && idx === 0;
                    return (
                      <TableRow
                        key={`${staff.name}-${idx}`}
                        data-ocid={`admin.staff.item.${idx + 1}`}
                        className={
                          isTop
                            ? "bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-800/30"
                            : "hover:bg-secondary/40"
                        }
                      >
                        <TableCell className="py-2.5">
                          <div className="flex items-center gap-1.5">
                            {isTop && (
                              <Trophy
                                size={13}
                                className="text-amber-500 shrink-0"
                              />
                            )}
                            <span
                              className={`text-sm font-medium ${isTop ? "text-amber-800" : "text-foreground"}`}
                            >
                              {staff.name}
                            </span>
                            {isTop && (
                              <Badge className="ml-1 text-[10px] px-1.5 py-0 h-4 bg-amber-100 text-amber-700 border border-amber-200">
                                🏆 Top
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-2.5">
                          <span className="text-sm font-semibold text-blue-700">
                            {amountsVisible ? fmt(staff.totalSale) : "••••"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right py-2.5">
                          <span
                            className={`text-sm font-semibold ${staff.extraProfit > 0 ? "text-success" : "text-muted-foreground"}`}
                          >
                            {amountsVisible ? fmt(staff.extraProfit) : "••••"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right py-2.5">
                          <span
                            className={`text-sm font-semibold ${staff.bonus > 0 ? "text-success" : "text-muted-foreground"}`}
                          >
                            {amountsVisible ? fmt(staff.bonus) : "••••"}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <Separator />

        {/* Section B: Totals */}
        <div>
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
            B. Totals
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 rounded-xl p-3 flex flex-col gap-1">
              <span className="text-lg">🔵</span>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                Total Sale
              </span>
              <span className="text-sm md:text-base font-bold text-blue-700 dark:text-blue-300 break-all">
                {showAmt(totals.totalSale)}
              </span>
            </div>
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-xl p-3 flex flex-col gap-1">
              <span className="text-lg">🔴</span>
              <span className="text-[11px] text-red-600 dark:text-red-400 font-medium">
                Total Discount
              </span>
              <span className="text-sm md:text-base font-bold text-red-700 dark:text-red-300 break-all">
                {showAmt(totals.totalDiscount)}
              </span>
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 rounded-xl p-3 flex flex-col gap-1">
              <span className="text-lg">🟢</span>
              <span className="text-[11px] text-green-600 dark:text-green-400 font-medium">
                Extra Profit
              </span>
              <span className="text-sm md:text-base font-bold text-green-700 dark:text-green-300 break-all">
                {showAmt(totals.totalExtraProfit)}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Section C: Final Summary */}
        <div>
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
            C. Final Summary
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 rounded-xl p-4 flex flex-col gap-1">
              <span className="text-2xl">💚</span>
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                Net Income
              </span>
              <span className="text-lg md:text-xl font-extrabold text-green-700 dark:text-green-300">
                {showAmt(summary.netIncome)}
              </span>
              <span className="text-[10px] text-green-500 dark:text-green-500">
                Actual collected
              </span>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-4 flex flex-col gap-1">
              <span className="text-2xl">📈</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Total Profit
              </span>
              <span
                className={`text-lg md:text-xl font-extrabold ${summary.totalProfit >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-red-600 dark:text-red-400"}`}
              >
                {showAmt(summary.totalProfit)}
              </span>
              <span className="text-[10px] text-emerald-500 dark:text-emerald-500">
                Sell - Cost
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
