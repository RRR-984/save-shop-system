import { l as useStore, h as useAuth, r as reactExports, j as jsxRuntimeExports, C as Card, n as CardContent, a7 as Bell, E as Clock, D as CircleCheckBig, a3 as MessageCircle } from "./index-Bt77HP0S.js";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-FRlTL3i_.js";
import { C as CircleX } from "./circle-x-BDHwm0HL.js";
import "./index-BoNbO3VT.js";
function getDateRange(filter) {
  const now = /* @__PURE__ */ new Date();
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
function StatusBadge({ status }) {
  switch (status) {
    case "sent":
      return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "badge-info", children: "Sent" });
    case "requested":
      return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "badge-warning", children: "Requested" });
    case "approved":
      return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "badge-success", children: "Approved" });
    case "rejected":
      return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "badge-danger", children: "Rejected" });
  }
}
function RoleBadge({ role }) {
  if (role === "owner") return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "badge-owner", children: role });
  if (role === "manager") return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "badge-manager", children: role });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "badge-staff", children: role });
}
function ReminderLogPage() {
  const { reminderLogs } = useStore();
  const { currentUser } = useAuth();
  const [dateFilter, setDateFilter] = reactExports.useState("today");
  const role = (currentUser == null ? void 0 : currentUser.role) ?? "staff";
  const canView = role === "owner" || role === "manager";
  const filtered = reactExports.useMemo(() => {
    const range = getDateRange(dateFilter);
    return reminderLogs.filter((log) => {
      if (!range) return true;
      return new Date(log.sentAt) >= range.from;
    });
  }, [reminderLogs, dateFilter]);
  const stats = reactExports.useMemo(
    () => ({
      total: filtered.length,
      sent: filtered.filter((l) => l.status === "sent").length,
      pending: filtered.filter((l) => l.status === "requested").length,
      approved: filtered.filter((l) => l.status === "approved").length,
      rejected: filtered.filter((l) => l.status === "rejected").length
    }),
    [filtered]
  );
  if (!canView) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-center px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { size: 40, className: "text-red-400 mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: "Access Denied" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "This page is accessible to Owner and Manager only" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 md:px-6 pb-8 flex flex-col gap-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: "Reminder Log" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Complete reminder history — sent, requested, approved, rejected" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Tabs,
      {
        value: dateFilter,
        onValueChange: (v) => setDateFilter(v),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "h-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TabsTrigger,
            {
              "data-ocid": "reminder_log.today.tab",
              value: "today",
              className: "text-xs h-7 px-3",
              children: "Today"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TabsTrigger,
            {
              "data-ocid": "reminder_log.week.tab",
              value: "week",
              className: "text-xs h-7 px-3",
              children: "This Week"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TabsTrigger,
            {
              "data-ocid": "reminder_log.month.tab",
              value: "month",
              className: "text-xs h-7 px-3",
              children: "This Month"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TabsTrigger,
            {
              "data-ocid": "reminder_log.all.tab",
              value: "all",
              className: "text-xs h-7 px-3",
              children: "All"
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-lg bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { size: 16, className: "text-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold", children: stats.total })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-warning/20 shadow-card bg-warning-light/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-lg bg-warning-light flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 16, className: "text-warning" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Pending" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold text-warning", children: stats.pending })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-success/20 shadow-card bg-success-light/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-lg bg-success-light flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { size: 16, className: "text-success" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Approved/Sent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold text-success", children: stats.sent + stats.approved })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-destructive/20 shadow-card bg-danger-light/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-lg bg-danger-light flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { size: 16, className: "text-danger" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Rejected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold text-danger", children: stats.rejected })
        ] })
      ] }) })
    ] }),
    filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "reminder_log.list.empty_state",
        className: "flex flex-col items-center justify-center py-16 text-center",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { size: 28, className: "text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-medium", children: "No reminder logs found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Try changing the date filter or send a reminder from the Customers page" })
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-2", children: filtered.map((log, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Card,
      {
        "data-ocid": `reminder_log.item.${idx + 1}`,
        className: "border-border shadow-sm",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { size: 14, className: "text-primary" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-foreground truncate", children: log.senderName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(RoleBadge, { role: log.senderRole })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
                "Customer:",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: log.customerName }),
                log.customerMobile && ` · ${log.customerMobile}`
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground mt-0.5", children: new Date(log.sentAt).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit"
              }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: log.status }) })
        ] }) })
      },
      log.id
    )) })
  ] }) });
}
export {
  ReminderLogPage
};
