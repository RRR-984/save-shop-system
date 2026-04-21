import { l as useStore, r as reactExports, j as jsxRuntimeExports, a0 as ShieldAlert, C as Card, n as CardContent, i as CardHeader, k as CardTitle, D as CircleCheckBig, N as TriangleAlert, v as Badge } from "./index-CyJThNPE.js";
function fmt(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Math.round(n));
}
function getFilterRange(filter) {
  const now = /* @__PURE__ */ new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);
  if (filter === "week") {
    from.setDate(from.getDate() - 6);
  } else if (filter === "month") {
    from.setDate(from.getDate() - 29);
  } else if (filter === "all") {
    from.setFullYear(2e3);
  }
  return { from, to };
}
function LowPriceAlertLogPage() {
  const { lowPriceAlertLogs } = useStore();
  const [filter, setFilter] = reactExports.useState("today");
  const filtered = reactExports.useMemo(() => {
    const { from, to } = getFilterRange(filter);
    return lowPriceAlertLogs.filter((log) => {
      const d = new Date(log.timestamp);
      return d >= from && d <= to;
    });
  }, [lowPriceAlertLogs, filter]);
  const blocked = filtered.filter((l) => l.attemptType === "blocked").length;
  const warned = filtered.filter((l) => l.attemptType === "warned").length;
  const overridden = filtered.filter(
    (l) => l.attemptType === "overridden"
  ).length;
  const FILTERS = [
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "all", label: "All" }
  ];
  function statusBadge(t) {
    if (t === "blocked")
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-red-600 text-white border-0 text-[10px] uppercase", children: "🔴 Blocked" });
    if (t === "warned")
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-amber-500 text-white border-0 text-[10px] uppercase", children: "🟡 Warned" });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-600 text-white border-0 text-[10px] uppercase", children: "🟢 Overridden" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 md:px-6 pb-6 flex flex-col gap-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "w-5 h-5 text-red-600" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-bold text-foreground", children: "Low Price Alert Log" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Minimum price se neeche bechne ki koshish ka record" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap", children: FILTERS.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        "data-ocid": `low-price-log.filter.${f.id}`,
        onClick: () => setFilter(f.id),
        className: `px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filter === f.id ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:bg-muted"}`,
        children: f.label
      },
      f.id
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mb-1", children: "Total Attempts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-foreground", children: filtered.length })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-red-200 bg-red-50 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-red-600 font-medium mb-1", children: "🔴 Blocked" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-red-700", children: blocked })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-amber-200 bg-amber-50 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-amber-600 font-medium mb-1", children: "🟡 Warned" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-amber-700", children: warned })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-green-200 bg-green-50 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-green-600 font-medium mb-1", children: "🟢 Overridden" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-green-700", children: overridden })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Attempt Details" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          "data-ocid": "low-price-log.empty_state",
          className: "flex flex-col items-center gap-2 py-12 text-muted-foreground text-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { size: 28, className: "text-success" }),
            "No low price attempts found"
          ]
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "table-header text-left", children: "Product" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "table-header text-left", children: "Staff" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "table-header text-right", children: "Entered Price" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "table-header text-right", children: "Min Price" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "table-header text-right", children: "Loss" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "table-header text-center", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "table-header text-right", children: "Date/Time" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: filtered.map((log, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "tr",
            {
              "data-ocid": `low-price-log.item.${idx + 1}`,
              className: `hover:bg-muted/20 transition-colors ${log.attemptType === "blocked" ? "bg-alert-danger" : ""}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium text-foreground", children: log.productName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: log.staffName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right text-danger font-semibold", children: fmt(log.enteredPrice) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right text-foreground font-medium", children: fmt(log.minSellPrice) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right text-danger font-medium", children: fmt(
                  Math.max(0, log.minSellPrice - log.enteredPrice)
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-center", children: statusBadge(log.attemptType) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right text-xs text-muted-foreground", children: new Date(log.timestamp).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit"
                }) })
              ]
            },
            log.id
          )) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden divide-y divide-border", children: filtered.map((log, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            "data-ocid": `low-price-log.mobile.item.${idx + 1}`,
            className: `p-4 flex flex-col gap-2 ${log.attemptType === "blocked" ? "bg-alert-danger" : ""}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm text-foreground", children: log.productName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: log.staffName })
                ] }),
                statusBadge(log.attemptType)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Entered" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-danger", children: fmt(log.enteredPrice) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Min Price" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: fmt(log.minSellPrice) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Loss" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-danger", children: fmt(
                    Math.max(0, log.minSellPrice - log.enteredPrice)
                  ) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TriangleAlert,
                  {
                    size: 10,
                    className: "inline mr-1 text-warning"
                  }
                ),
                new Date(log.timestamp).toLocaleString("en-IN"),
                log.pinUsed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-success", children: "(PIN used)" })
              ] })
            ]
          },
          log.id
        )) })
      ] }) })
    ] })
  ] }) });
}
export {
  LowPriceAlertLogPage
};
