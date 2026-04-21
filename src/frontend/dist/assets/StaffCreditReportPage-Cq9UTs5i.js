import { l as useStore, r as reactExports, j as jsxRuntimeExports, C as Card, n as CardContent, a6 as Users, a1 as CreditCard, N as TriangleAlert, an as ShieldCheck, i as CardHeader, k as CardTitle, v as Badge, aw as Trophy } from "./index-CyJThNPE.js";
function filterByDate(invoices, filter) {
  if (filter === "all") return invoices;
  const now = /* @__PURE__ */ new Date();
  return invoices.filter((inv) => {
    const d = new Date(inv.date);
    if (filter === "today") {
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    }
    if (filter === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    }
    if (filter === "month") {
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }
    return true;
  });
}
const filterLabels = {
  today: "Today",
  week: "This Week",
  month: "This Month",
  all: "All"
};
const AVATAR_COLORS = [
  "#ef4444",
  "#f97316",
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#ec4899"
];
function StaffCreditReportPage() {
  const { invoices } = useStore();
  const [dateFilter, setDateFilter] = reactExports.useState("month");
  const filtered = reactExports.useMemo(
    () => filterByDate(invoices, dateFilter),
    [invoices, dateFilter]
  );
  const staffStats = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
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
          creditInvoiceCount: 0
        });
      }
      const entry = map.get(key);
      entry.totalSales += inv.totalAmount;
      entry.invoiceCount += 1;
      if (inv.paymentMode === "credit" || inv.dueAmount > 0) {
        entry.totalCredit += inv.totalAmount;
        entry.creditInvoiceCount += 1;
      }
    }
    return Array.from(map.values()).map((s) => ({
      ...s,
      creditPct: s.totalSales > 0 ? s.totalCredit / s.totalSales * 100 : 0,
      isHighRisk: s.totalSales > 0 ? s.totalCredit / s.totalSales * 100 > 50 : false
    })).sort((a, b) => b.totalCredit - a.totalCredit);
  }, [filtered]);
  const totalStaff = staffStats.length;
  const totalSalesAll = staffStats.reduce((s, x) => s + x.totalSales, 0);
  const totalCreditAll = staffStats.reduce((s, x) => s + x.totalCredit, 0);
  const overallCreditPct = totalSalesAll > 0 ? totalCreditAll / totalSalesAll * 100 : 0;
  const topCreditStaffId = staffStats.length > 0 && staffStats[0].totalCredit > 0 ? staffStats[0].staffId : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-6 pb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 md:px-6 space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", "data-ocid": "staff_credit.tab", children: ["today", "week", "month", "all"].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        "data-ocid": `staff_credit.${f}.tab`,
        onClick: () => setDateFilter(f),
        className: `px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${dateFilter === f ? "bg-red-100 text-red-700 border-red-300 ring-1 ring-offset-1 ring-red-400" : "border-border text-muted-foreground hover:bg-muted"}`,
        children: filterLabels[f]
      },
      f
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 14, className: "text-blue-600 dark:text-blue-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-blue-600 dark:text-blue-400 font-medium", children: "Total Staff" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-blue-800 dark:text-blue-200", children: totalStaff })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            CreditCard,
            {
              size: 14,
              className: "text-green-600 dark:text-green-400"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-green-600 dark:text-green-400 font-medium", children: "Total Sales" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-lg font-bold text-green-800 dark:text-green-200", children: [
          "₹",
          totalSalesAll.toLocaleString("en-IN")
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TriangleAlert,
            {
              size: 14,
              className: "text-red-600 dark:text-red-400"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-red-600 dark:text-red-400 font-medium", children: "Total Credit" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-lg font-bold text-red-800 dark:text-red-200", children: [
          "₹",
          totalCreditAll.toLocaleString("en-IN")
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          className: `border ${overallCreditPct > 50 ? "border-red-300 bg-red-50" : "border-emerald-200 bg-emerald-50"}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
              overallCreditPct > 50 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 14, className: "text-red-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 14, className: "text-emerald-600" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `text-xs font-medium ${overallCreditPct > 50 ? "text-red-600" : "text-emerald-600"}`,
                  children: "Credit %"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: `text-2xl font-bold ${overallCreditPct > 50 ? "text-red-800 dark:text-red-200" : "text-emerald-800 dark:text-emerald-200"}`,
                children: [
                  overallCreditPct.toFixed(1),
                  "%"
                ]
              }
            )
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { size: 18, className: "text-primary" }),
        "Staff Credit Report"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: staffStats.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "text-center py-16 text-muted-foreground px-4",
          "data-ocid": "staff_credit.empty_state",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "mx-auto mb-3 opacity-20", size: 40 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No data found" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: "No sales in this period" })
          ]
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: staffStats.map((staff, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          "data-ocid": `staff_credit.item.${idx + 1}`,
          className: `p-4 transition-colors ${staff.isHighRisk ? "bg-red-50/60 hover:bg-red-50" : "hover:bg-muted/40"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm",
                    style: {
                      background: AVATAR_COLORS[idx % AVATAR_COLORS.length]
                    },
                    children: staff.staffName.charAt(0).toUpperCase()
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold text-sm leading-tight flex items-center gap-1.5 flex-wrap", children: [
                    staff.staffName,
                    topCreditStaffId === staff.staffId && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Badge,
                      {
                        className: "text-[10px] px-1.5 py-0 h-4 bg-amber-100 text-amber-700 border-amber-300",
                        variant: "outline",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 9, className: "mr-0.5" }),
                          "Top Credit"
                        ]
                      }
                    ),
                    staff.isHighRisk && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Badge,
                      {
                        className: "text-[10px] px-1.5 py-0 h-4 bg-red-100 text-red-700 border-red-300",
                        variant: "outline",
                        "data-ocid": `staff_credit.item.${idx + 1}.error_state`,
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 9, className: "mr-0.5" }),
                          "High Credit Risk"
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
                    staff.invoiceCount,
                    " invoice",
                    staff.invoiceCount !== 1 ? "s" : "",
                    " •",
                    " ",
                    staff.creditInvoiceCount,
                    " credit"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: `flex-shrink-0 px-2.5 py-1 rounded-lg text-center ${staff.isHighRisk ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-lg font-bold leading-tight", children: [
                      staff.creditPct.toFixed(1),
                      "%"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-medium", children: "Credit" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background rounded-lg px-3 py-2 border border-border", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground mb-0.5", children: "Total Sales" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-bold text-foreground", children: [
                  "₹",
                  staff.totalSales.toLocaleString("en-IN")
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: `rounded-lg px-3 py-2 border ${staff.isHighRisk ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: `text-[10px] mb-0.5 ${staff.isHighRisk ? "text-red-600" : "text-green-600"}`,
                        children: "Total Credit"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        className: `text-sm font-bold ${staff.isHighRisk ? "text-red-700" : "text-green-700"}`,
                        children: [
                          "₹",
                          staff.totalCredit.toLocaleString("en-IN")
                        ]
                      }
                    )
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[10px] text-muted-foreground mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Credit Percentage" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "span",
                  {
                    className: `font-semibold ${staff.isHighRisk ? "text-red-600" : "text-green-600"}`,
                    children: [
                      staff.creditPct.toFixed(1),
                      "% of sales"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: `h-full rounded-full transition-all duration-500 ${staff.isHighRisk ? "bg-red-500" : "bg-green-500"}`,
                  style: {
                    width: `${Math.min(staff.creditPct, 100)}%`
                  }
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "absolute top-[-8px] w-px h-2 bg-orange-400",
                  style: { left: "50%" },
                  title: "50% threshold"
                }
              ) })
            ] })
          ]
        },
        staff.staffId
      )) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-xs text-muted-foreground px-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3 h-3 rounded-full bg-red-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "High Credit Risk (>50%)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3 h-3 rounded-full bg-green-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Safe (≤50%)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-3 bg-orange-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "50% mark" })
      ] })
    ] })
  ] }) });
}
export {
  StaffCreditReportPage
};
