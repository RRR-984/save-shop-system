import { h as useAuth, j as jsxRuntimeExports, G as ClipboardList, l as useStore, r as reactExports, H as Search, I as Input } from "./index-Bt77HP0S.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CGD2qyaK.js";
import { U as User } from "./user-C7Fvzg_P.js";
import "./index-BoNbO3VT.js";
import "./index-Bc1JMXzj.js";
import "./chevron-down-CFG9Ipkf.js";
import "./check-DtmnsLpz.js";
import "./chevron-up-hZ92f35t.js";
function roleBadge(role) {
  if (role === "owner") return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "badge-owner", children: "Owner" });
  if (role === "manager") return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "badge-manager", children: "Manager" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "badge-staff", children: "Staff" });
}
const ACTION_LABELS = {
  sale_created: {
    label: "Sale",
    className: "bg-green-100 text-green-700 border-green-200"
  },
  low_price_attempt: {
    label: "Low Price",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200"
  },
  low_price_override: {
    label: "Override",
    className: "bg-orange-100 text-orange-700 border-orange-200"
  },
  product_edit: {
    label: "Product Edit",
    className: "bg-sky-100 text-sky-700 border-sky-200"
  },
  staff_add: {
    label: "Staff Add",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200"
  },
  staff_edit: {
    label: "Staff Edit",
    className: "bg-blue-100 text-blue-700 border-blue-200"
  },
  staff_delete: {
    label: "Staff Delete",
    className: "bg-red-100 text-red-700 border-red-200"
  },
  payment_received: {
    label: "Payment",
    className: "bg-teal-100 text-teal-700 border-teal-200"
  }
};
function actionBadge(action) {
  const c = ACTION_LABELS[action] ?? {
    label: action,
    className: "bg-muted text-muted-foreground border-border"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: `inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${c.className}`,
      children: c.label
    }
  );
}
function relativeTime(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 6e4);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
function fmtAbsolute(ts) {
  return new Date(ts).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function filterByDate(logs, range) {
  const now = Date.now();
  if (range === "today") {
    const start = /* @__PURE__ */ new Date();
    start.setHours(0, 0, 0, 0);
    return logs.filter((l) => new Date(l.timestamp) >= start);
  }
  if (range === "week")
    return logs.filter(
      (l) => now - new Date(l.timestamp).getTime() < 7 * 864e5
    );
  if (range === "month")
    return logs.filter(
      (l) => now - new Date(l.timestamp).getTime() < 30 * 864e5
    );
  return logs;
}
function AuditLogRow({ log }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "bg-card border border-border rounded-lg px-4 py-3 flex flex-col gap-1.5 hover:border-primary/30 transition-colors",
      "data-ocid": `audit.log_row.${log.id}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-3.5 h-3.5 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-foreground", children: log.userName || "Unknown" }),
          log.deletedUser && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border bg-muted text-muted-foreground border-border", children: "Deleted" }),
          roleBadge(log.userRole),
          actionBadge(log.action),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "ml-auto text-[11px] text-muted-foreground whitespace-nowrap",
              title: fmtAbsolute(log.timestamp),
              children: relativeTime(log.timestamp)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground leading-relaxed pl-7 break-words", children: log.details }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground/60 pl-7", children: [
          fmtAbsolute(log.timestamp),
          log.resourceId && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 font-mono opacity-60", children: [
            "#",
            log.resourceId
          ] })
        ] })
      ]
    }
  );
}
function AuditLogContent() {
  const { auditLogs } = useStore();
  const [dateRange, setDateRange] = reactExports.useState("all");
  const [userFilter, setUserFilter] = reactExports.useState("all");
  const [actionFilter, setActionFilter] = reactExports.useState("all");
  const [search, setSearch] = reactExports.useState("");
  const userNames = reactExports.useMemo(() => {
    const names = Array.from(
      new Set(auditLogs.map((l) => l.userName).filter(Boolean))
    );
    return names.sort();
  }, [auditLogs]);
  const filtered = reactExports.useMemo(() => {
    let list = [...auditLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    list = filterByDate(list, dateRange);
    if (userFilter !== "all")
      list = list.filter((l) => l.userName === userFilter);
    if (actionFilter !== "all")
      list = list.filter((l) => l.action === actionFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (l) => {
          var _a, _b, _c;
          return (((_a = l.userName) == null ? void 0 : _a.toLowerCase()) ?? "").includes(q) || (((_b = l.details) == null ? void 0 : _b.toLowerCase()) ?? "").includes(q) || (((_c = l.action) == null ? void 0 : _c.toLowerCase()) ?? "").includes(q);
        }
      );
    }
    return list;
  }, [auditLogs, dateRange, userFilter, actionFilter, search]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border-b border-border px-4 md:px-6 py-4 sticky top-0 z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-5 h-5 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-base font-bold text-foreground leading-tight", children: "Audit Log" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            filtered.length,
            " / ",
            auditLogs.length,
            " entries"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-[160px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              "data-ocid": "audit.search.input",
              value: search,
              onChange: (e) => setSearch(e.target.value),
              placeholder: "Search name, action, details...",
              className: "pl-8 h-8 text-xs"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: dateRange, onValueChange: setDateRange, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SelectTrigger,
            {
              className: "w-32 h-8 text-xs",
              "data-ocid": "audit.date_filter.select",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Time" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "today", children: "Today" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "week", children: "This Week" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "month", children: "This Month" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: userFilter, onValueChange: setUserFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SelectTrigger,
            {
              className: "w-36 h-8 text-xs",
              "data-ocid": "audit.user_filter.select",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Users" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Users" }),
            userNames.map((name) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: name, children: name }, name))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: actionFilter, onValueChange: setActionFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SelectTrigger,
            {
              className: "w-40 h-8 text-xs",
              "data-ocid": "audit.action_filter.select",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Actions" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Actions" }),
            Object.entries(ACTION_LABELS).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: v.label }, k))
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 px-4 md:px-6 py-4", children: filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-col items-center justify-center py-20 gap-3 text-center",
        "data-ocid": "audit.empty_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-12 h-12 text-muted-foreground/40" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "No log entries found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Try changing the filter or search" })
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: filtered.map((log) => /* @__PURE__ */ jsxRuntimeExports.jsx(AuditLogRow, { log }, log.id)) }) })
  ] });
}
function AuditLogPage() {
  const { currentUser } = useAuth();
  if ((currentUser == null ? void 0 : currentUser.role) !== "owner") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center",
        "data-ocid": "audit.access_denied",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-12 h-12 text-destructive/60" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold text-foreground", children: "Access Restricted" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Audit Log is accessible to Owner only." })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-0 min-h-screen bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AuditLogContent, {}) });
}
export {
  AuditLogPage
};
