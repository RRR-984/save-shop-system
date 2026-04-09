import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  ChevronDown,
  ChevronUp,
  TrendingUp,
  User,
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const filterLabels: Record<DateFilter, string> = {
  today: "Aaj",
  week: "Iss Hafte",
  month: "Iss Mahine",
  all: "Sab",
};

const filterColors: Record<DateFilter, string> = {
  today: "bg-blue-100 text-blue-700 border-blue-300",
  week: "bg-violet-100 text-violet-700 border-violet-300",
  month: "bg-green-100 text-green-700 border-green-300",
  all: "bg-muted text-muted-foreground border-border",
};

const paymentBadge: Record<string, string> = {
  cash: "bg-green-100 text-green-700",
  upi: "bg-blue-100 text-blue-700",
  online: "bg-purple-100 text-purple-700",
  credit: "bg-amber-100 text-amber-700",
};

export function StaffPerformancePage() {
  const { invoices } = useStore();
  const [dateFilter, setDateFilter] = useState<DateFilter>("month");
  const [expandedStaff, setExpandedStaff] = useState<string | null>(null);

  const filtered = useMemo(
    () => filterByDate(invoices, dateFilter),
    [invoices, dateFilter],
  );

  // Group invoices by soldByName (or mobile number as fallback)
  const staffStats = useMemo(() => {
    const map = new Map<
      string,
      {
        staffName: string;
        staffId: string;
        totalSales: number;
        invoiceCount: number;
        totalProfit: number;
        totalStaffBonus: number;
        invoices: Invoice[];
      }
    >();

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
          invoices: [],
        });
      }
      const entry = map.get(key)!;
      entry.totalSales += inv.totalAmount;
      entry.invoiceCount += 1;
      entry.totalProfit += inv.invoiceTotalProfit ?? 0;
      entry.totalStaffBonus += inv.totalStaffBonus ?? 0;
      entry.invoices.push(inv);
    }

    // Sort by total sales descending
    return Array.from(map.values()).sort((a, b) => b.totalSales - a.totalSales);
  }, [filtered]);

  const totalSalesAll = staffStats.reduce((s, x) => s + x.totalSales, 0);
  const totalProfitAll = staffStats.reduce((s, x) => s + x.totalProfit, 0);
  const totalBonusAll = staffStats.reduce((s, x) => s + x.totalStaffBonus, 0);
  const totalInvoicesAll = staffStats.reduce((s, x) => s + x.invoiceCount, 0);

  const toggleStaff = (staffId: string) => {
    setExpandedStaff((prev) => (prev === staffId ? null : staffId));
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="px-4 md:px-6 space-y-5">
        {/* Date filter */}
        <div className="flex flex-wrap gap-2">
          {(["today", "week", "month", "all"] as DateFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setDateFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                dateFilter === f
                  ? `${filterColors[f]} ring-1 ring-offset-1 ring-current`
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
              <div className="text-xs text-blue-600 font-medium">
                💰 Total Sales
              </div>
              <div className="text-lg font-bold text-blue-800">
                ₹{totalSalesAll.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-blue-500 mt-0.5">
                {totalInvoicesAll} invoices
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-3">
              <div className="text-xs text-green-600 font-medium">
                📈 Total Profit
              </div>
              <div className="text-lg font-bold text-green-800">
                ₹{totalProfitAll.toLocaleString("en-IN")}
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-3">
              <div className="text-xs text-purple-600 font-medium">
                🎁 Staff Bonus
              </div>
              <div className="text-lg font-bold text-purple-800">
                ₹{totalBonusAll.toLocaleString("en-IN")}
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-3">
              <div className="text-xs text-orange-600 font-medium">
                👥 Active Staff
              </div>
              <div className="text-lg font-bold text-orange-800">
                {staffStats.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staff cards */}
        {staffStats.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <BarChart2 className="mx-auto mb-3 opacity-30" size={40} />
            <p className="font-medium">Is period mein koi invoice nahi</p>
            <p className="text-sm mt-1">
              Koi bhi sale karein — yahan dikhai degi
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {staffStats.map((staff, idx) => {
              const share =
                totalSalesAll > 0
                  ? Math.round((staff.totalSales / totalSalesAll) * 100)
                  : 0;
              const isExpanded = expandedStaff === staff.staffId;

              return (
                <Card key={staff.staffId} className="overflow-hidden">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                          style={{
                            background: [
                              "#6366f1",
                              "#10b981",
                              "#f59e0b",
                              "#ef4444",
                              "#3b82f6",
                            ][idx % 5],
                          }}
                        >
                          {staff.staffName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <CardTitle className="text-sm font-semibold leading-tight">
                            {staff.staffName}
                          </CardTitle>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {staff.invoiceCount} invoice
                            {staff.invoiceCount !== 1 ? "s" : ""} • {share}%
                            share
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">
                          ₹{staff.totalSales.toLocaleString("en-IN")}
                        </div>
                        {staff.totalProfit > 0 && (
                          <div className="text-xs text-green-600 font-medium">
                            <TrendingUp size={10} className="inline mr-0.5" />₹
                            {staff.totalProfit.toLocaleString("en-IN")} profit
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${share}%`,
                            background: [
                              "#6366f1",
                              "#10b981",
                              "#f59e0b",
                              "#ef4444",
                              "#3b82f6",
                            ][idx % 5],
                          }}
                        />
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="text-center p-1.5 bg-green-50 rounded-lg">
                        <div className="text-xs font-semibold text-green-700">
                          ₹{staff.totalProfit.toLocaleString("en-IN")}
                        </div>
                        <div className="text-[10px] text-green-600">Profit</div>
                      </div>
                      <div className="text-center p-1.5 bg-purple-50 rounded-lg">
                        <div className="text-xs font-semibold text-purple-700">
                          ₹{staff.totalStaffBonus.toLocaleString("en-IN")}
                        </div>
                        <div className="text-[10px] text-purple-600">Bonus</div>
                      </div>
                      <div className="text-center p-1.5 bg-blue-50 rounded-lg">
                        <div className="text-xs font-semibold text-blue-700">
                          {staff.invoiceCount}
                        </div>
                        <div className="text-[10px] text-blue-600">
                          Invoices
                        </div>
                      </div>
                    </div>

                    {/* Toggle invoice list */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2 text-xs h-7"
                      onClick={() => toggleStaff(staff.staffId)}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp size={12} className="mr-1" /> Chhupao
                        </>
                      ) : (
                        <>
                          <ChevronDown size={12} className="mr-1" /> Sab
                          Invoices Dekho ({staff.invoiceCount})
                        </>
                      )}
                    </Button>
                  </CardHeader>

                  {/* Expanded invoice list */}
                  {isExpanded && (
                    <CardContent className="pt-0 px-0 pb-2">
                      <div className="border-t">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/40">
                              <TableHead className="text-xs py-2 pl-4">
                                Invoice
                              </TableHead>
                              <TableHead className="text-xs py-2">
                                Customer
                              </TableHead>
                              <TableHead className="text-xs py-2">
                                Date
                              </TableHead>
                              <TableHead className="text-xs py-2">
                                Mode
                              </TableHead>
                              <TableHead className="text-xs py-2 text-right pr-4">
                                Amount
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {[...staff.invoices]
                              .sort(
                                (a, b) =>
                                  new Date(b.date).getTime() -
                                  new Date(a.date).getTime(),
                              )
                              .map((inv) => (
                                <TableRow key={inv.id} className="text-xs">
                                  <TableCell className="py-2 pl-4 font-mono text-xs">
                                    {inv.invoiceNumber}
                                  </TableCell>
                                  <TableCell className="py-2">
                                    <div className="font-medium">
                                      {inv.customerName || "Walk-in"}
                                    </div>
                                    {inv.customerMobile && (
                                      <div className="text-muted-foreground text-[10px]">
                                        {inv.customerMobile}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="py-2 text-muted-foreground text-[10px]">
                                    {formatDate(inv.date)}
                                  </TableCell>
                                  <TableCell className="py-2">
                                    <span
                                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                                        paymentBadge[inv.paymentMode] ??
                                        "bg-muted text-muted-foreground"
                                      }`}
                                    >
                                      {inv.paymentMode.toUpperCase()}
                                    </span>
                                  </TableCell>
                                  <TableCell className="py-2 text-right pr-4 font-semibold">
                                    ₹{inv.totalAmount.toLocaleString("en-IN")}
                                    {(inv.invoiceTotalProfit ?? 0) > 0 && (
                                      <div className="text-[10px] text-green-600">
                                        +₹
                                        {inv.invoiceTotalProfit!.toLocaleString(
                                          "en-IN",
                                        )}
                                      </div>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
