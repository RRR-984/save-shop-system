import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { useStore } from "../context/StoreContext";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

type Filter = "today" | "week" | "month" | "all";

function getFilterRange(filter: Filter): { from: Date; to: Date } {
  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);
  if (filter === "week") {
    from.setDate(from.getDate() - 6);
  } else if (filter === "month") {
    from.setDate(from.getDate() - 29);
  } else if (filter === "all") {
    from.setFullYear(2000);
  }
  return { from, to };
}

export function LowPriceAlertLogPage() {
  const { lowPriceAlertLogs } = useStore();
  const [filter, setFilter] = useState<Filter>("today");

  const filtered = useMemo(() => {
    const { from, to } = getFilterRange(filter);
    return lowPriceAlertLogs.filter((log) => {
      const d = new Date(log.timestamp);
      return d >= from && d <= to;
    });
  }, [lowPriceAlertLogs, filter]);

  const blocked = filtered.filter((l) => l.attemptType === "blocked").length;
  const warned = filtered.filter((l) => l.attemptType === "warned").length;
  const overridden = filtered.filter(
    (l) => l.attemptType === "overridden",
  ).length;

  const FILTERS: { id: Filter; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "all", label: "All" },
  ];

  function statusBadge(t: "blocked" | "warned" | "overridden") {
    if (t === "blocked")
      return (
        <Badge className="bg-red-600 text-white border-0 text-[10px] uppercase">
          🔴 Blocked
        </Badge>
      );
    if (t === "warned")
      return (
        <Badge className="bg-amber-500 text-white border-0 text-[10px] uppercase">
          🟡 Warned
        </Badge>
      );
    return (
      <Badge className="bg-green-600 text-white border-0 text-[10px] uppercase">
        🟢 Overridden
      </Badge>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="px-4 md:px-6 pb-6 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              Low Price Alert Log
            </h1>
            <p className="text-xs text-muted-foreground">
              Minimum price se neeche bechne ki koshish ka record
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              data-ocid={`low-price-log.filter.${f.id}`}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                filter === f.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">
                Total Attempts
              </div>
              <div className="text-2xl font-bold text-foreground">
                {filtered.length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50 shadow-sm">
            <CardContent className="p-4">
              <div className="text-xs text-red-600 font-medium mb-1">
                🔴 Blocked
              </div>
              <div className="text-2xl font-bold text-red-700">{blocked}</div>
            </CardContent>
          </Card>
          <Card className="border-amber-200 bg-amber-50 shadow-sm">
            <CardContent className="p-4">
              <div className="text-xs text-amber-600 font-medium mb-1">
                🟡 Warned
              </div>
              <div className="text-2xl font-bold text-amber-700">{warned}</div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50 shadow-sm">
            <CardContent className="p-4">
              <div className="text-xs text-green-600 font-medium mb-1">
                🟢 Overridden
              </div>
              <div className="text-2xl font-bold text-green-700">
                {overridden}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Log List */}
        <Card className="shadow-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Attempt Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div
                data-ocid="low-price-log.empty_state"
                className="flex flex-col items-center gap-2 py-12 text-muted-foreground text-sm"
              >
                <CheckCircle size={28} className="text-success" />
                No low price attempts found
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="table-header text-left">Product</th>
                        <th className="table-header text-left">Staff</th>
                        <th className="table-header text-right">
                          Entered Price
                        </th>
                        <th className="table-header text-right">Min Price</th>
                        <th className="table-header text-right">Loss</th>
                        <th className="table-header text-center">Status</th>
                        <th className="table-header text-right">Date/Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filtered.map((log, idx) => (
                        <tr
                          key={log.id}
                          data-ocid={`low-price-log.item.${idx + 1}`}
                          className={`hover:bg-muted/20 transition-colors ${log.attemptType === "blocked" ? "bg-alert-danger" : ""}`}
                        >
                          <td className="px-4 py-3 font-medium text-foreground">
                            {log.productName}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {log.staffName}
                          </td>
                          <td className="px-4 py-3 text-right text-danger font-semibold">
                            {fmt(log.enteredPrice)}
                          </td>
                          <td className="px-4 py-3 text-right text-foreground font-medium">
                            {fmt(log.minSellPrice)}
                          </td>
                          <td className="px-4 py-3 text-right text-danger font-medium">
                            {fmt(
                              Math.max(0, log.minSellPrice - log.enteredPrice),
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {statusBadge(log.attemptType)}
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-border">
                  {filtered.map((log, idx) => (
                    <div
                      key={log.id}
                      data-ocid={`low-price-log.mobile.item.${idx + 1}`}
                      className={`p-4 flex flex-col gap-2 ${log.attemptType === "blocked" ? "bg-alert-danger" : ""}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-sm text-foreground">
                            {log.productName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {log.staffName}
                          </div>
                        </div>
                        {statusBadge(log.attemptType)}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-muted-foreground">Entered</div>
                          <div className="font-semibold text-danger">
                            {fmt(log.enteredPrice)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Min Price</div>
                          <div className="font-semibold">
                            {fmt(log.minSellPrice)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Loss</div>
                          <div className="font-semibold text-danger">
                            {fmt(
                              Math.max(0, log.minSellPrice - log.enteredPrice),
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        <AlertTriangle
                          size={10}
                          className="inline mr-1 text-warning"
                        />
                        {new Date(log.timestamp).toLocaleString("en-IN")}
                        {log.pinUsed && (
                          <span className="ml-2 text-success">(PIN used)</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
