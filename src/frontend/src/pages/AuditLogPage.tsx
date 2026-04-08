import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardList, Search, User } from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import type { AuditLog, UserRole } from "../types/store";

function roleBadge(role: UserRole) {
  if (role === "owner") return <span className="badge-owner">Owner</span>;
  if (role === "manager") return <span className="badge-manager">Manager</span>;
  return <span className="badge-staff">Staff</span>;
}

const ACTION_LABELS: Record<string, { label: string; className: string }> = {
  sale_created: {
    label: "Sale",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  low_price_attempt: {
    label: "Low Price",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  low_price_override: {
    label: "Override",
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },
  product_edit: {
    label: "Product Edit",
    className: "bg-sky-100 text-sky-700 border-sky-200",
  },
  staff_add: {
    label: "Staff Add",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  staff_edit: {
    label: "Staff Edit",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  staff_delete: {
    label: "Staff Delete",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  payment_received: {
    label: "Payment",
    className: "bg-teal-100 text-teal-700 border-teal-200",
  },
};

function actionBadge(action: string) {
  const c = ACTION_LABELS[action] ?? {
    label: action,
    className: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${c.className}`}
    >
      {c.label}
    </span>
  );
}

function relativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmtAbsolute(ts: string): string {
  return new Date(ts).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function filterByDate(logs: AuditLog[], range: string): AuditLog[] {
  const now = Date.now();
  if (range === "today") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return logs.filter((l) => new Date(l.timestamp) >= start);
  }
  if (range === "week")
    return logs.filter(
      (l) => now - new Date(l.timestamp).getTime() < 7 * 86400000,
    );
  if (range === "month")
    return logs.filter(
      (l) => now - new Date(l.timestamp).getTime() < 30 * 86400000,
    );
  return logs;
}

function AuditLogRow({ log }: { log: AuditLog }) {
  return (
    <div
      className="bg-card border border-border rounded-lg px-4 py-3 flex flex-col gap-1.5 hover:border-primary/30 transition-colors"
      data-ocid={`audit.log_row.${log.id}`}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <User className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="text-sm font-semibold text-foreground">
          {log.userName || "Unknown"}
        </span>
        {log.deletedUser && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border bg-muted text-muted-foreground border-border">
            Deleted
          </span>
        )}
        {roleBadge(log.userRole)}
        {actionBadge(log.action)}
        <span
          className="ml-auto text-[11px] text-muted-foreground whitespace-nowrap"
          title={fmtAbsolute(log.timestamp)}
        >
          {relativeTime(log.timestamp)}
        </span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed pl-7 break-words">
        {log.details}
      </p>
      <p className="text-[10px] text-muted-foreground/60 pl-7">
        {fmtAbsolute(log.timestamp)}
        {log.resourceId && (
          <span className="ml-2 font-mono opacity-60">#{log.resourceId}</span>
        )}
      </p>
    </div>
  );
}

function AuditLogContent() {
  const { auditLogs } = useStore();
  const [dateRange, setDateRange] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [search, setSearch] = useState("");

  const userNames = useMemo(() => {
    const names = Array.from(
      new Set(auditLogs.map((l) => l.userName).filter(Boolean)),
    );
    return names.sort();
  }, [auditLogs]);

  const filtered = useMemo(() => {
    let list = [...auditLogs].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    list = filterByDate(list, dateRange);
    if (userFilter !== "all")
      list = list.filter((l) => l.userName === userFilter);
    if (actionFilter !== "all")
      list = list.filter((l) => l.action === actionFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (l) =>
          (l.userName?.toLowerCase() ?? "").includes(q) ||
          (l.details?.toLowerCase() ?? "").includes(q) ||
          (l.action?.toLowerCase() ?? "").includes(q),
      );
    }
    return list;
  }, [auditLogs, dateRange, userFilter, actionFilter, search]);

  return (
    <>
      <div className="bg-card border-b border-border px-4 md:px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground leading-tight">
              Audit Log
            </h1>
            <p className="text-xs text-muted-foreground">
              {filtered.length} / {auditLogs.length} entries
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              data-ocid="audit.search.input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, action, details..."
              className="pl-8 h-8 text-xs"
            />
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger
              className="w-32 h-8 text-xs"
              data-ocid="audit.date_filter.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger
              className="w-36 h-8 text-xs"
              data-ocid="audit.user_filter.select"
            >
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {userNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger
              className="w-40 h-8 text-xs"
              data-ocid="audit.action_filter.select"
            >
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {Object.entries(ACTION_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex-1 px-4 md:px-6 py-4">
        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 gap-3 text-center"
            data-ocid="audit.empty_state"
          >
            <ClipboardList className="w-12 h-12 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              Koi log entry nahi mili
            </p>
            <p className="text-xs text-muted-foreground">
              Filter ya search change karein
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((log) => (
              <AuditLogRow key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function AuditLogPage() {
  const { currentUser } = useAuth();

  if (currentUser?.role !== "owner") {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center"
        data-ocid="audit.access_denied"
      >
        <ClipboardList className="w-12 h-12 text-destructive/60" />
        <p className="text-lg font-semibold text-foreground">
          Access Restricted
        </p>
        <p className="text-sm text-muted-foreground">
          Audit Log sirf Owner dekh sakta hai.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 min-h-screen bg-background">
      <AuditLogContent />
    </div>
  );
}
