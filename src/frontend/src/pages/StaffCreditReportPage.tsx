import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  CreditCard,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useStore } from "../context/StoreContext";
import type { Invoice } from "../types/store";

type DateFilter = "today" | "week" | "month" | "all";

function filterByDate(invoices: Invoice[], filter: DateFilter): Invoice[] {
  if (filter === "all") return invoices;
  const now = new Date();
  return invoices.filter((inv) => {
    const d = new Date(inv.date);
    if (filter === "today") {
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    }
    if (filter === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    }
    if (filter === "month") {
      return (
        d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      );
    }
    return true;
  });
}

const filterLabels: Record<DateFilter, string> = {
  today: "Today",
  week: "This Week",
  month: "This Month",
  all: "All",
};

const AVATAR_COLORS = [
  "#ef4444",
  "#f97316",
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#ec4899",
];

export function StaffCreditReportPage() {
  const { invoices } = useStore();
  const [dateFilter, setDateFilter] = useState<DateFilter>("month");

  const filtered = useMemo(
    () => filterByDate(invoices, dateFilter),
    [invoices, dateFilter],
  );

  // Group invoices by staff and compute credit stats
  const staffStats = useMemo(() => {
    const map = new Map<
      string,
      {
        staffName: string;
        staffId: string;
        totalSales: number;
        totalCredit: number;
        invoiceCount: number;
        creditInvoiceCount: number;
      }
    >();

    for (const inv of filtered) {
      const key = inv.soldByUserId ?? "unknown";
      const name = inv.soldByName ?? "Admin";
      if (!map.has(key)) {
        map.set(key, {
          staffName: name,
          staffId: key,
          totalSales: 0,
          totalCredit: 0,
          invoiceCount: 0,
          creditInvoiceCount: 0,
        });
      }
      const entry = map.get(key)!;
      entry.totalSales += inv.totalAmount;
      entry.invoiceCount += 1;
      // Credit = payment mode is credit OR due amount > 0
      if (inv.paymentMode === "credit" || inv.dueAmount > 0) {
        entry.totalCredit += inv.totalAmount;
        entry.creditInvoiceCount += 1;
      }
    }

    return (
      Array.from(map.values())
        .map((s) => ({
          ...s,
          creditPct:
            s.totalSales > 0 ? (s.totalCredit / s.totalSales) * 100 : 0,
          isHighRisk:
            s.totalSales > 0
              ? (s.totalCredit / s.totalSales) * 100 > 50
              : false,
        }))
        // Sort by totalCredit descending
        .sort((a, b) => b.totalCredit - a.totalCredit)
    );
  }, [filtered]);

  // Summary totals
  const totalStaff = staffStats.length;
  const totalSalesAll = staffStats.reduce((s, x) => s + x.totalSales, 0);
  const totalCreditAll = staffStats.reduce((s, x) => s + x.totalCredit, 0);
  const overallCreditPct =
    totalSalesAll > 0 ? (totalCreditAll / totalSalesAll) * 100 : 0;

  // Top credit staff = first in sorted list (highest credit)
  const topCreditStaffId =
    staffStats.length > 0 && staffStats[0].totalCredit > 0
      ? staffStats[0].staffId
      : null;

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="px-4 md:px-6 space-y-5">
        {/* Date filter tabs */}
        <div className="flex flex-wrap gap-2" data-ocid="staff_credit.tab">
          {(["today", "week", "month", "all"] as DateFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              data-ocid={`staff_credit.${f}.tab`}
              onClick={() => setDateFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                dateFilter === f
                  ? "bg-red-100 text-red-700 border-red-300 ring-1 ring-offset-1 ring-red-400"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Users size={14} className="text-blue-600" />
                <span className="text-xs text-blue-600 font-medium">
                  Total Staff
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-800">
                {totalStaff}
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <CreditCard size={14} className="text-green-600" />
                <span className="text-xs text-green-600 font-medium">
                  Total Sales
                </span>
              </div>
              <div className="text-lg font-bold text-green-800">
                ₹{totalSalesAll.toLocaleString("en-IN")}
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle size={14} className="text-red-600" />
                <span className="text-xs text-red-600 font-medium">
                  Total Credit
                </span>
              </div>
              <div className="text-lg font-bold text-red-800">
                ₹{totalCreditAll.toLocaleString("en-IN")}
              </div>
            </CardContent>
          </Card>

          <Card
            className={`border ${
              overallCreditPct > 50
                ? "border-red-300 bg-red-50"
                : "border-emerald-200 bg-emerald-50"
            }`}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-1">
                {overallCreditPct > 50 ? (
                  <AlertTriangle size={14} className="text-red-600" />
                ) : (
                  <ShieldCheck size={14} className="text-emerald-600" />
                )}
                <span
                  className={`text-xs font-medium ${
                    overallCreditPct > 50 ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  Credit %
                </span>
              </div>
              <div
                className={`text-2xl font-bold ${
                  overallCreditPct > 50 ? "text-red-800" : "text-emerald-800"
                }`}
              >
                {overallCreditPct.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staff Credit Report Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard size={18} className="text-primary" />
              Staff Credit Report
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {staffStats.length === 0 ? (
              <div
                className="text-center py-16 text-muted-foreground px-4"
                data-ocid="staff_credit.empty_state"
              >
                <CreditCard className="mx-auto mb-3 opacity-20" size={40} />
                <p className="font-medium">No data found</p>
                <p className="text-sm mt-1">No sales in this period</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {staffStats.map((staff, idx) => (
                  <div
                    key={staff.staffId}
                    data-ocid={`staff_credit.item.${idx + 1}`}
                    className={`p-4 transition-colors ${
                      staff.isHighRisk
                        ? "bg-red-50/60 hover:bg-red-50"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    {/* Top row: avatar + name + badges */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm"
                          style={{
                            background:
                              AVATAR_COLORS[idx % AVATAR_COLORS.length],
                          }}
                        >
                          {staff.staffName.charAt(0).toUpperCase()}
                        </div>

                        {/* Name + meta */}
                        <div>
                          <div className="font-semibold text-sm leading-tight flex items-center gap-1.5 flex-wrap">
                            {staff.staffName}
                            {topCreditStaffId === staff.staffId && (
                              <Badge
                                className="text-[10px] px-1.5 py-0 h-4 bg-amber-100 text-amber-700 border-amber-300"
                                variant="outline"
                              >
                                <Trophy size={9} className="mr-0.5" />
                                Top Credit
                              </Badge>
                            )}
                            {staff.isHighRisk && (
                              <Badge
                                className="text-[10px] px-1.5 py-0 h-4 bg-red-100 text-red-700 border-red-300"
                                variant="outline"
                                data-ocid={`staff_credit.item.${idx + 1}.error_state`}
                              >
                                <AlertTriangle size={9} className="mr-0.5" />
                                High Credit Risk
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {staff.invoiceCount} invoice
                            {staff.invoiceCount !== 1 ? "s" : ""} •{" "}
                            {staff.creditInvoiceCount} credit
                          </div>
                        </div>
                      </div>

                      {/* Credit % badge */}
                      <div
                        className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-center ${
                          staff.isHighRisk
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        <div className="text-lg font-bold leading-tight">
                          {staff.creditPct.toFixed(1)}%
                        </div>
                        <div className="text-[10px] font-medium">Credit</div>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-background rounded-lg px-3 py-2 border border-border">
                        <div className="text-[10px] text-muted-foreground mb-0.5">
                          Total Sales
                        </div>
                        <div className="text-sm font-bold text-foreground">
                          ₹{staff.totalSales.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div
                        className={`rounded-lg px-3 py-2 border ${
                          staff.isHighRisk
                            ? "bg-red-50 border-red-200"
                            : "bg-green-50 border-green-200"
                        }`}
                      >
                        <div
                          className={`text-[10px] mb-0.5 ${
                            staff.isHighRisk ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          Total Credit
                        </div>
                        <div
                          className={`text-sm font-bold ${
                            staff.isHighRisk ? "text-red-700" : "text-green-700"
                          }`}
                        >
                          ₹{staff.totalCredit.toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                        <span>Credit Percentage</span>
                        <span
                          className={`font-semibold ${
                            staff.isHighRisk ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {staff.creditPct.toFixed(1)}% of sales
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            staff.isHighRisk ? "bg-red-500" : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(staff.creditPct, 100)}%`,
                          }}
                        />
                      </div>
                      {/* 50% threshold marker */}
                      <div className="relative">
                        <div
                          className="absolute top-[-8px] w-px h-2 bg-orange-400"
                          style={{ left: "50%" }}
                          title="50% threshold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground px-1">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>High Credit Risk (&gt;50%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Safe (≤50%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-px h-3 bg-orange-400" />
            <span>50% mark</span>
          </div>
        </div>
      </div>
    </div>
  );
}
