import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CheckCircle, Clock, MessageCircle, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import type { ReminderLog } from "../types/store";

type DateFilter = "today" | "week" | "month" | "all";

function getDateRange(filter: DateFilter): { from: Date } | null {
  const now = new Date();
  if (filter === "today") {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return { from: d };
  }
  if (filter === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return { from: d };
  }
  if (filter === "month") {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    return { from: d };
  }
  return null;
}

function StatusBadge({ status }: { status: ReminderLog["status"] }) {
  switch (status) {
    case "sent":
      return <span className="badge-info">Sent</span>;
    case "requested":
      return <span className="badge-warning">Requested</span>;
    case "approved":
      return <span className="badge-success">Approved</span>;
    case "rejected":
      return <span className="badge-danger">Rejected</span>;
  }
}

function RoleBadge({ role }: { role: string }) {
  if (role === "owner") return <span className="badge-owner">{role}</span>;
  if (role === "manager") return <span className="badge-manager">{role}</span>;
  return <span className="badge-staff">{role}</span>;
}

export function ReminderLogPage() {
  const { reminderLogs } = useStore();
  const { currentUser } = useAuth();
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");

  const role = currentUser?.role ?? "staff";

  // Redirect guard handled at navigation level; page renders minimal view for staff
  const canView = role === "owner" || role === "manager";

  const filtered = useMemo(() => {
    const range = getDateRange(dateFilter);
    return reminderLogs.filter((log) => {
      if (!range) return true;
      return new Date(log.sentAt) >= range.from;
    });
  }, [reminderLogs, dateFilter]);

  const stats = useMemo(
    () => ({
      total: filtered.length,
      sent: filtered.filter((l) => l.status === "sent").length,
      pending: filtered.filter((l) => l.status === "requested").length,
      approved: filtered.filter((l) => l.status === "approved").length,
      rejected: filtered.filter((l) => l.status === "rejected").length,
    }),
    [filtered],
  );

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <XCircle size={40} className="text-red-400 mb-3" />
        <p className="font-semibold text-foreground">Access Denied</p>
        <p className="text-sm text-muted-foreground mt-1">
          This page is accessible to Owner and Manager only
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="px-4 md:px-6 pb-8 flex flex-col gap-5">
        <div>
          <h1 className="text-xl font-bold">Reminder Log</h1>
          <p className="text-muted-foreground text-sm">
            Complete reminder history — sent, requested, approved, rejected
          </p>
        </div>

        {/* Date Filter */}
        <Tabs
          value={dateFilter}
          onValueChange={(v) => setDateFilter(v as DateFilter)}
        >
          <TabsList className="h-8">
            <TabsTrigger
              data-ocid="reminder_log.today.tab"
              value="today"
              className="text-xs h-7 px-3"
            >
              Today
            </TabsTrigger>
            <TabsTrigger
              data-ocid="reminder_log.week.tab"
              value="week"
              className="text-xs h-7 px-3"
            >
              This Week
            </TabsTrigger>
            <TabsTrigger
              data-ocid="reminder_log.month.tab"
              value="month"
              className="text-xs h-7 px-3"
            >
              This Month
            </TabsTrigger>
            <TabsTrigger
              data-ocid="reminder_log.all.tab"
              value="all"
              className="text-xs h-7 px-3"
            >
              All
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border-border shadow-card">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <Bell size={16} className="text-foreground" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Total</div>
                <div className="text-lg font-bold">{stats.total}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-warning/20 shadow-card bg-warning-light/40">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-warning-light flex items-center justify-center">
                <Clock size={16} className="text-warning" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Pending</div>
                <div className="text-lg font-bold text-warning">
                  {stats.pending}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-success/20 shadow-card bg-success-light/40">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-success-light flex items-center justify-center">
                <CheckCircle size={16} className="text-success" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  Approved/Sent
                </div>
                <div className="text-lg font-bold text-success">
                  {stats.sent + stats.approved}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-destructive/20 shadow-card bg-danger-light/40">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-danger-light flex items-center justify-center">
                <XCircle size={16} className="text-danger" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Rejected</div>
                <div className="text-lg font-bold text-danger">
                  {stats.rejected}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Log List */}
        {filtered.length === 0 ? (
          <div
            data-ocid="reminder_log.list.empty_state"
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell size={28} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">
              No reminder logs found
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Try changing the date filter or send a reminder from the Customers
              page
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((log, idx) => (
              <Card
                key={log.id}
                data-ocid={`reminder_log.item.${idx + 1}`}
                className="border-border shadow-sm"
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MessageCircle size={14} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-semibold text-foreground truncate">
                            {log.senderName}
                          </span>
                          <RoleBadge role={log.senderRole} />
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Customer:{" "}
                          <span className="font-medium text-foreground">
                            {log.customerName}
                          </span>
                          {log.customerMobile && ` · ${log.customerMobile}`}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(log.sentAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <StatusBadge status={log.status} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
