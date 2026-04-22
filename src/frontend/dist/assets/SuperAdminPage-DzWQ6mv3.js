import { c as createLucideIcon, h as useAuth, r as reactExports, b0 as createActorWithConfig, j as jsxRuntimeExports, a2 as ArrowLeft, an as ShieldCheck, aE as RefreshCw, B as Button, E as Clock, X, a7 as Bell, A as TrendingUp, a6 as Users, aB as Store, a5 as ShoppingBag, C as Card, H as Search, v as Badge, i as CardHeader, k as CardTitle, N as TriangleAlert, n as CardContent, b1 as Skeleton, I as Input, y as ue } from "./index-Bt77HP0S.js";
import { S as Switch } from "./switch-USsqFl0-.js";
import { L as Lock } from "./lock-CVY4hd8d.js";
import { C as ChevronDown } from "./chevron-down-CFG9Ipkf.js";
import "./index-Bc1JMXzj.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$6 = [
  [
    "path",
    {
      d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",
      key: "169zse"
    }
  ]
];
const Activity = createLucideIcon("activity", __iconNode$6);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$5 = [
  ["path", { d: "m21 16-4 4-4-4", key: "f6ql7i" }],
  ["path", { d: "M17 20V4", key: "1ejh1v" }],
  ["path", { d: "m3 8 4-4 4 4", key: "11wl7u" }],
  ["path", { d: "M7 4v16", key: "1glfcx" }]
];
const ArrowUpDown = createLucideIcon("arrow-up-down", __iconNode$5);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]];
const ChevronLeft = createLucideIcon("chevron-left", __iconNode$4);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]];
const ChevronRight = createLucideIcon("chevron-right", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["rect", { width: "8", height: "4", x: "8", y: "2", rx: "1", ry: "1", key: "tgr4d6" }],
  ["path", { d: "M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2", key: "4jdomd" }],
  ["path", { d: "M16 4h2a2 2 0 0 1 2 2v4", key: "3hqy98" }],
  ["path", { d: "M21 14H11", key: "1bme5i" }],
  ["path", { d: "m15 10-4 4 4 4", key: "5dvupr" }]
];
const ClipboardCopy = createLucideIcon("clipboard-copy", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["circle", { cx: "18", cy: "18", r: "3", key: "1xkwt0" }],
  ["circle", { cx: "6", cy: "6", r: "3", key: "1lh9wr" }],
  ["path", { d: "M6 21V9a9 9 0 0 0 9 9", key: "7kw0sc" }]
];
const GitMerge = createLucideIcon("git-merge", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["circle", { cx: "10", cy: "7", r: "4", key: "e45bow" }],
  ["path", { d: "M10.3 15H7a4 4 0 0 0-4 4v2", key: "3bnktk" }],
  ["circle", { cx: "17", cy: "17", r: "3", key: "18b49y" }],
  ["path", { d: "m21 21-1.9-1.9", key: "1g2n9r" }]
];
const UserSearch = createLucideIcon("user-search", __iconNode);
const PERMANENT_SUPER_ADMIN = "9929306080";
const AUTO_REFRESH_MS = 3e4;
const ROWS_PER_PAGE = 20;
function nowMs() {
  return Date.now();
}
function startOfDay() {
  const d = /* @__PURE__ */ new Date();
  d.setHours(0, 0, 0, 0);
  return BigInt(d.getTime()) * 1000000n;
}
function msAgo(days) {
  return BigInt(nowMs() - days * 24 * 60 * 60 * 1e3) * 1000000n;
}
function bigintToMs(ns) {
  return Number(ns / 1000000n);
}
function relativeTime(ms) {
  if (!ms) return "Never";
  const diff = nowMs() - ms;
  const secs = Math.floor(diff / 1e3);
  if (secs < 60) return "Just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}
function secsSinceMs(ms) {
  return Math.floor((nowMs() - ms) / 1e3);
}
function getDateRangeTs(range) {
  if (range === "today") return { startTs: startOfDay(), endTs: null };
  if (range === "7days") return { startTs: msAgo(7), endTs: null };
  if (range === "30days") return { startTs: msAgo(30), endTs: null };
  return { startTs: null, endTs: null };
}
function isActiveWithin3Days(lastActivityMs) {
  return nowMs() - lastActivityMs < 3 * 24 * 60 * 60 * 1e3;
}
function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}
function isPermanentAdmin(mobile) {
  return mobile.replace(/\D/g, "") === PERMANENT_SUPER_ADMIN;
}
function KpiSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-card border-border", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2 pt-4 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-28" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "px-4 pb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-7 w-14 mb-1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-24" })
    ] })
  ] });
}
const SKEL_COL_KEYS_8 = [
  "c0",
  "c1",
  "c2",
  "c3",
  "c4",
  "c5",
  "c6",
  "c7"
];
const SKEL_ROW_KEYS = ["r0", "r1", "r2", "r3", "r4"];
function TableSkeleton({ cols }) {
  const colKeys = SKEL_COL_KEYS_8.slice(0, cols);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: SKEL_ROW_KEYS.map((rowKey) => /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: colKeys.map((ck) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }) }, `${rowKey}-${ck}`)) }, rowKey)) });
}
function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent,
  ocid
}) {
  const cls = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    green: "bg-green-500/10 text-green-600 dark:text-green-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
  }[accent];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-card border-border", "data-ocid": ocid, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2 pt-4 px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-xs font-medium text-muted-foreground leading-snug", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: `w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cls}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 14 })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "px-4 pb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-foreground tabular-nums", children: value }),
      subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5 truncate", children: subtitle })
    ] })
  ] });
}
function PermanentAdminBadge() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex items-start gap-3 rounded-xl border-2 border-green-500/40 bg-green-500/5 px-4 py-3",
      "data-ocid": "super_admin.permanent_admin_badge",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-lg bg-green-500/15 flex items-center justify-center flex-shrink-0 mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 18, className: "text-green-600 dark:text-green-400" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide", children: "Primary Super Admin" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "text-[10px] bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30 gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 9 }),
              "Permanent"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 mt-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-mono font-bold text-foreground tracking-widest", children: PERMANENT_SUPER_ADMIN }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Lock,
              {
                size: 11,
                className: "text-green-600 dark:text-green-400 flex-shrink-0"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "This account has permanent full access and cannot be removed." })
        ] })
      ]
    }
  );
}
function ChangeSuperAdminSection() {
  const [open, setOpen] = reactExports.useState(false);
  const [verifyMobile, setVerifyMobile] = reactExports.useState("");
  const [newMobile, setNewMobile] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [success, setSuccess] = reactExports.useState("");
  const handleSubmit = async () => {
    const cleanVerify = verifyMobile.replace(/\D/g, "");
    const cleanNew = newMobile.replace(/\D/g, "");
    setError("");
    setSuccess("");
    if (cleanVerify.length !== 10) {
      setError(
        "Enter the valid 10-digit primary admin number for verification."
      );
      return;
    }
    if (cleanNew.length !== 10) {
      setError("Enter a valid 10-digit new super admin mobile number.");
      return;
    }
    if (cleanVerify !== PERMANENT_SUPER_ADMIN) {
      setError(
        `Verification failed. You must confirm with the primary admin number (${PERMANENT_SUPER_ADMIN}).`
      );
      return;
    }
    setLoading(true);
    try {
      const actor = await createActorWithConfig();
      const extActor = actor;
      const result = await extActor.verifyAndChangeSuperAdmin(
        cleanVerify,
        cleanNew
      );
      if (result === true || result === "ok" || result === "") {
        setSuccess("Super admin updated successfully.");
        setVerifyMobile("");
        setNewMobile("");
        ue.success("Super admin updated successfully.");
      } else {
        setError(typeof result === "string" ? result : "Verification failed.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      className: "bg-card border-border",
      "data-ocid": "super_admin.change_admin_section",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => setOpen((v) => !v),
            "data-ocid": "super_admin.change_admin.toggle_button",
            className: "w-full flex items-center justify-between px-4 py-3 text-left",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 12, className: "text-amber-600 dark:text-amber-400" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-foreground", children: "Change Super Admin" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ChevronDown,
                {
                  size: 15,
                  className: `text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`
                }
              )
            ]
          }
        ),
        open && /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "px-4 pb-4 pt-0 space-y-3 border-t border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2.5 mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TriangleAlert,
              {
                size: 13,
                className: "text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700 dark:text-amber-300", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Warning:" }),
              " Changing the primary super admin requires verification. You must confirm with the current primary admin number."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "label",
              {
                htmlFor: "verify-admin-mobile",
                className: "text-xs font-medium text-muted-foreground",
                children: "Confirm with current primary admin number"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Lock,
                {
                  size: 12,
                  className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "verify-admin-mobile",
                  type: "tel",
                  placeholder: `Enter ${PERMANENT_SUPER_ADMIN} to verify`,
                  value: verifyMobile,
                  onChange: (e) => setVerifyMobile(e.target.value),
                  maxLength: 10,
                  "data-ocid": "super_admin.change_admin.verify_input",
                  className: "pl-8 font-mono tracking-widest"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "label",
              {
                htmlFor: "new-admin-mobile",
                className: "text-xs font-medium text-muted-foreground",
                children: "New super admin mobile number"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "new-admin-mobile",
                type: "tel",
                placeholder: "10-digit new admin number",
                value: newMobile,
                onChange: (e) => setNewMobile(e.target.value),
                maxLength: 10,
                "data-ocid": "super_admin.change_admin.new_mobile_input",
                className: "font-mono tracking-widest"
              }
            )
          ] }),
          error && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              className: "text-xs text-destructive",
              "data-ocid": "super_admin.change_admin.error_state",
              children: error
            }
          ),
          success && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              className: "text-xs text-green-600 dark:text-green-400",
              "data-ocid": "super_admin.change_admin.success_state",
              children: success
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: handleSubmit,
              disabled: loading,
              "data-ocid": "super_admin.change_admin.submit_button",
              className: "w-full gap-2",
              children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" }),
                "Verifying..."
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 13 }),
                "Verify & Change"
              ] })
            }
          )
        ] })
      ]
    }
  );
}
function ChangeLogTab() {
  const [loading, setLoading] = reactExports.useState(true);
  const [entries, setEntries] = reactExports.useState([]);
  const [error, setError] = reactExports.useState(null);
  const fetchLog = reactExports.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const actor = await createActorWithConfig();
      const extActor = actor;
      const raw = await extActor.getSuperAdminChangeLog();
      const parsed = safeParse(raw, []);
      setEntries(parsed);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load change log."
      );
    } finally {
      setLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    fetchLog();
  }, [fetchLog]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4", "data-ocid": "super_admin.change_log_section", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-foreground mb-1", children: "Super Admin Change Log" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "History of all super admin changes. Each change requires verification." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: fetchLog,
          disabled: loading,
          "data-ocid": "super_admin.change_log.refresh_button",
          className: "gap-1.5 min-h-[44px] flex-shrink-0",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 13, className: loading ? "animate-spin" : "" }),
            "Refresh"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/5 px-4 py-3",
        "data-ocid": "super_admin.change_log.permanent_info",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Lock,
            {
              size: 14,
              className: "text-green-600 dark:text-green-400 flex-shrink-0"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-700 dark:text-green-400", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold font-mono", children: PERMANENT_SUPER_ADMIN }),
            " ",
            "is the permanent primary super admin. It cannot be removed without verification."
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Card,
      {
        className: "bg-card border-border overflow-hidden",
        "data-ocid": "super_admin.change_log.table_card",
        children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 space-y-2", children: [0, 1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }, i)) }) : error ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex flex-col items-center gap-3 py-10 text-center",
            "data-ocid": "super_admin.change_log.error_state",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 24, className: "text-destructive opacity-70" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: error }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  onClick: fetchLog,
                  "data-ocid": "super_admin.change_log.retry_button",
                  children: "Retry"
                }
              )
            ]
          }
        ) : entries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex flex-col items-center gap-3 py-12 text-center",
            "data-ocid": "super_admin.change_log.empty_state",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 18, className: "text-muted-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "No changes recorded." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "The super admin has not been changed since setup." })
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden sm:block overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm min-w-[540px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/30 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: [
              "Changed At",
              "Previous Mobile",
              "New Mobile",
              "Changed By"
            ].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "th",
              {
                className: "px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap",
                children: h
              },
              h
            )) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: entries.map((entry, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "tr",
              {
                className: "hover:bg-muted/20 transition-colors",
                "data-ocid": `super_admin.change_log.item.${idx + 1}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-xs text-muted-foreground whitespace-nowrap", children: entry.changedAt ? new Date(entry.changedAt).toLocaleString() : "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-mono text-foreground flex items-center gap-1", children: [
                    entry.previousMobile || "—",
                    entry.previousMobile === PERMANENT_SUPER_ADMIN && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Lock,
                      {
                        size: 10,
                        className: "text-green-600 dark:text-green-400"
                      }
                    )
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-mono text-foreground flex items-center gap-1", children: [
                    entry.newMobile || "—",
                    entry.newMobile === PERMANENT_SUPER_ADMIN && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Lock,
                      {
                        size: 10,
                        className: "text-green-600 dark:text-green-400"
                      }
                    )
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-xs font-mono text-foreground", children: entry.changedBy || "—" })
                ]
              },
              `${entry.changedAt}-${idx}`
            )) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:hidden space-y-2 p-3", children: entries.map((entry, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "rounded-lg bg-muted/20 border border-border px-3 py-2.5 text-xs space-y-1",
              "data-ocid": `super_admin.change_log.item.${idx + 1}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 10 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: entry.changedAt ? new Date(entry.changedAt).toLocaleString() : "—" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-1 mt-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Previous:" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-foreground flex items-center gap-1", children: [
                      entry.previousMobile || "—",
                      entry.previousMobile === PERMANENT_SUPER_ADMIN && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Lock,
                        {
                          size: 9,
                          className: "text-green-600 dark:text-green-400"
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "New:" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-foreground flex items-center gap-1", children: [
                      entry.newMobile || "—",
                      entry.newMobile === PERMANENT_SUPER_ADMIN && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Lock,
                        {
                          size: 9,
                          className: "text-green-600 dark:text-green-400"
                        }
                      )
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
                  "Changed by:",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-foreground", children: entry.changedBy || "—" })
                ] })
              ]
            },
            `${entry.changedAt}-${idx}`
          )) })
        ] })
      }
    )
  ] });
}
function AccessDenied({ onBack }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex flex-col items-center justify-center min-h-screen bg-background p-6 gap-5",
      "data-ocid": "super_admin.access_denied_state",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-8 h-8 text-destructive" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-foreground", children: "Access Denied" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1 max-w-xs", children: "You do not have permission to access the Super Admin Dashboard." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            onClick: onBack,
            "data-ocid": "super_admin.access_denied.back_button",
            className: "gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 15 }),
              "Go Back"
            ]
          }
        )
      ]
    }
  );
}
function SetupScreen({
  onSaved,
  permanentAdminActive
}) {
  const [mobile, setMobile] = reactExports.useState("");
  const [saving, setSaving] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  if (permanentAdminActive) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-col items-center justify-center min-h-screen bg-background p-6 gap-5",
        "data-ocid": "super_admin.setup_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-8 h-8 text-green-600 dark:text-green-400" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center max-w-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-foreground", children: "Super Admin Ready" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mt-2", children: [
              "Primary Super Admin",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono font-bold text-foreground inline-flex items-center gap-1", children: [
                PERMANENT_SUPER_ADMIN,
                /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 12, className: "text-green-600 dark:text-green-400" })
              ] }),
              " ",
              "is permanently set. Log in directly with this number to access the Super Admin Dashboard."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full max-w-sm rounded-xl border-2 border-green-500/30 bg-green-500/5 px-4 py-3 text-xs text-green-700 dark:text-green-400 text-center", children: "This account has permanent full access and cannot be removed." })
        ]
      }
    );
  }
  const handleSave = async () => {
    const clean = mobile.replace(/\D/g, "");
    if (clean.length !== 10) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const actor = await createActorWithConfig();
      const settings = {
        superAdminMobile: clean,
        createdAt: BigInt(Date.now()) * 1000000n,
        updatedAt: BigInt(Date.now()) * 1000000n
      };
      const ok = await actor.saveAdminSettings(settings);
      if (ok) {
        onSaved();
      } else {
        setError("Failed to save settings. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex flex-col items-center justify-center min-h-screen bg-background p-6 gap-5",
      "data-ocid": "super_admin.setup_state",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-8 h-8 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-foreground", children: "Setup Super Admin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1 max-w-sm", children: "No super admin has been configured yet. Enter the mobile number that will have access to the Super Admin Dashboard." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "tel",
              placeholder: "10-digit mobile number",
              value: mobile,
              onChange: (e) => setMobile(e.target.value),
              maxLength: 10,
              "data-ocid": "super_admin.setup.mobile_input",
              className: "text-center text-lg tracking-widest"
            }
          ),
          error && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              className: "text-xs text-destructive text-center",
              "data-ocid": "super_admin.setup.error_state",
              children: error
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: handleSave,
              disabled: saving || mobile.replace(/\D/g, "").length !== 10,
              className: "w-full",
              "data-ocid": "super_admin.setup.submit_button",
              children: saving ? "Saving..." : "Set as Super Admin"
            }
          )
        ] })
      ]
    }
  );
}
function StaffLookupTab() {
  const [mobileInput, setMobileInput] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [results, setResults] = reactExports.useState(null);
  const [error, setError] = reactExports.useState(null);
  const [copied, setCopied] = reactExports.useState(false);
  const handleSearch = reactExports.useCallback(async () => {
    const clean = mobileInput.replace(/\D/g, "");
    if (!clean) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const actor = await createActorWithConfig();
      const raw = await actor.getStaffAcrossShops(clean);
      const parsed = safeParse(raw, []);
      setResults(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [mobileInput]);
  const handleCopy = () => {
    if (!mobileInput) return;
    navigator.clipboard.writeText(mobileInput.replace(/\D/g, "")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
    });
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "data-ocid": "super_admin.staff_lookup_section", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-foreground mb-1", children: "Staff Lookup" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Find all shops where a staff member is registered by mobile number." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Search,
          {
            size: 13,
            className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "tel",
            placeholder: "Enter mobile number",
            value: mobileInput,
            onChange: (e) => setMobileInput(e.target.value),
            onKeyDown: handleKeyDown,
            maxLength: 12,
            "data-ocid": "super_admin.staff_lookup.search_input",
            className: "pl-8 pr-3"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outline",
          size: "icon",
          onClick: handleCopy,
          disabled: !mobileInput,
          "data-ocid": "super_admin.staff_lookup.copy_button",
          "aria-label": "Copy mobile number",
          title: copied ? "Copied!" : "Copy mobile number",
          className: "flex-shrink-0 min-w-[44px]",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCopy, { size: 15, className: copied ? "text-primary" : "" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: handleSearch,
          disabled: loading || !mobileInput.replace(/\D/g, ""),
          "data-ocid": "super_admin.staff_lookup.submit_button",
          className: "flex-shrink-0 min-w-[80px]",
          children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" }),
            "Searching"
          ] }) : "Search"
        }
      )
    ] }),
    loading && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Card,
      {
        className: "bg-card border-border",
        "data-ocid": "super_admin.staff_lookup.loading_state",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm min-w-[480px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/30 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: [
            "Shop Name",
            "Staff Name",
            "Role",
            "Status",
            "Last Seen"
          ].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "th",
            {
              className: "px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground",
              children: h
            },
            h
          )) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableSkeleton, { cols: 5 }) })
        ] }) })
      }
    ),
    error && !loading && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-col items-center gap-3 py-8 text-center",
        "data-ocid": "super_admin.staff_lookup.error_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18, className: "text-destructive" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "Failed to load results" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: error })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: handleSearch,
              "data-ocid": "super_admin.staff_lookup.retry_button",
              children: "Retry"
            }
          )
        ]
      }
    ),
    !loading && !error && results !== null && results.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-col items-center gap-3 py-10 text-center",
        "data-ocid": "super_admin.staff_lookup.empty_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserSearch, { size: 18, className: "text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "No staff found for this mobile number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "This mobile number is not registered as staff in any shop." })
        ]
      }
    ),
    !loading && !error && results !== null && results.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-card border-border hidden sm:block overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm min-w-[480px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/30 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: [
          "Shop Name",
          "Staff Name",
          "Role",
          "Status",
          "Last Seen"
        ].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "th",
          {
            className: "px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap",
            children: h
          },
          h
        )) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: results.map((r, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "tr",
          {
            className: "hover:bg-muted/20 transition-colors",
            "data-ocid": `super_admin.staff_lookup.item.${idx + 1}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-xs font-medium text-foreground", children: r.shopName || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-xs text-foreground", children: r.staffName || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-xs text-muted-foreground capitalize", children: r.role || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Badge,
                {
                  variant: r.status === "active" ? "default" : "secondary",
                  className: `text-xs ${r.status === "active" ? "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30" : "opacity-60"}`,
                  children: r.status === "active" ? "Active" : "Inactive"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-xs text-muted-foreground whitespace-nowrap", children: r.lastSeen || "—" })
            ]
          },
          `${r.shopName}-${idx}`
        )) })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:hidden space-y-3", children: results.map((r, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          className: "bg-card border-border",
          "data-ocid": `super_admin.staff_lookup.item.${idx + 1}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground truncate", children: r.shopName || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Badge,
                {
                  variant: r.status === "active" ? "default" : "secondary",
                  className: `text-xs flex-shrink-0 ${r.status === "active" ? "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30" : "opacity-60"}`,
                  children: r.status === "active" ? "Active" : "Inactive"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-1 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Staff:",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: r.staffName || "—" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Role:",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground capitalize", children: r.role || "—" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "col-span-2", children: [
                "Last Seen:",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: r.lastSeen || "—" })
              ] })
            ] })
          ] })
        },
        `${r.shopName}-${idx}`
      )) })
    ] })
  ] });
}
function DuplicatesTab({ adminMobile }) {
  const [scanning, setScanning] = reactExports.useState(false);
  const [groups, setGroups] = reactExports.useState(null);
  const [scanError, setScanError] = reactExports.useState(null);
  const [selectedGroup, setSelectedGroup] = reactExports.useState(
    null
  );
  const [primaryId, setPrimaryId] = reactExports.useState("");
  const [merging, setMerging] = reactExports.useState(false);
  const [showConfirm, setShowConfirm] = reactExports.useState(false);
  const [auditLog, setAuditLog] = reactExports.useState(null);
  const [auditLoading, setAuditLoading] = reactExports.useState(false);
  const handleScan = reactExports.useCallback(async () => {
    setScanning(true);
    setScanError(null);
    setGroups(null);
    setSelectedGroup(null);
    try {
      const actor = await createActorWithConfig();
      const raw = await actor.findDuplicateUsers();
      const parsed = safeParse(raw, []);
      setGroups(parsed);
    } catch (err) {
      setScanError(
        err instanceof Error ? err.message : "Failed to scan for duplicates"
      );
    } finally {
      setScanning(false);
    }
  }, []);
  const fetchAuditLog = reactExports.useCallback(async () => {
    setAuditLoading(true);
    try {
      const actor = await createActorWithConfig();
      const raw = await actor.getMergeAuditLog();
      const parsed = safeParse(raw, []);
      const entries = parsed.map((entry) => {
        if (typeof entry === "string") {
          return safeParse(entry, {
            timestamp: "",
            adminMobile: "",
            primaryAccount: "",
            mergedCount: 0
          });
        }
        return entry;
      });
      setAuditLog(entries.slice(0, 10));
    } catch {
      setAuditLog([]);
    } finally {
      setAuditLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    fetchAuditLog();
  }, [fetchAuditLog]);
  const openDetail = (group) => {
    var _a;
    setSelectedGroup(group);
    const oldest = [...group.accounts].sort(
      (a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()
    )[0];
    setPrimaryId((oldest == null ? void 0 : oldest.id) ?? ((_a = group.accounts[0]) == null ? void 0 : _a.id) ?? "");
    setShowConfirm(false);
  };
  const handleMerge = async () => {
    if (!selectedGroup || !primaryId || primaryId.trim() === "") {
      ue.error("Please select a valid primary account before merging.");
      return;
    }
    const secondaryIds = selectedGroup.accounts.filter((a) => a.id !== primaryId).map((a) => a.id).filter((id) => id && id.trim() !== "");
    if (secondaryIds.length === 0) {
      ue.error("No valid secondary accounts to merge.");
      return;
    }
    setMerging(true);
    try {
      const actor = await createActorWithConfig();
      const result = await actor.mergeUserAccounts(
        primaryId,
        JSON.stringify(secondaryIds)
      );
      const parsed = safeParse(result, {
        success: false
      });
      if (parsed.success) {
        ue.success(
          `Successfully merged ${secondaryIds.length} account(s) into primary.`
        );
        setSelectedGroup(null);
        setShowConfirm(false);
        await Promise.all([handleScan(), fetchAuditLog()]);
      } else {
        ue.error(parsed.message ?? "Merge failed. Please try again.");
      }
    } catch (err) {
      ue.error(err instanceof Error ? err.message : "Merge failed");
    } finally {
      setMerging(false);
    }
  };
  const secondaryCount = selectedGroup ? selectedGroup.accounts.filter((a) => a.id !== primaryId).length : 0;
  const primaryAccount = selectedGroup == null ? void 0 : selectedGroup.accounts.find(
    (a) => a.id === primaryId
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-5", "data-ocid": "super_admin.duplicates_section", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-foreground mb-1", children: "Duplicate Account Finder" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Identify users registered under multiple accounts and merge them." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: handleScan,
          disabled: scanning,
          "data-ocid": "super_admin.duplicates.scan_button",
          className: "gap-2 min-h-[44px]",
          children: scanning ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" }),
            "Scanning…"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 14 }),
            "Scan for Duplicates"
          ] })
        }
      )
    ] }),
    scanError && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-center gap-3 bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm",
        "data-ocid": "super_admin.duplicates.error_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 14, className: "text-destructive flex-shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive flex-1", children: scanError }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: handleScan,
              "data-ocid": "super_admin.duplicates.retry_button",
              children: "Retry"
            }
          )
        ]
      }
    ),
    !scanning && groups !== null && groups.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-col items-center gap-3 py-10 text-center",
        "data-ocid": "super_admin.duplicates.empty_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 18, className: "text-green-600 dark:text-green-400" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "No duplicate accounts found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "All mobile numbers are uniquely registered." })
        ]
      }
    ),
    !scanning && groups !== null && groups.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-card border-border hidden sm:block overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/30 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Mobile", "Duplicate Count", "Action"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "th",
        {
          className: "px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap",
          children: h
        },
        h
      )) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: groups.map((g, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "tr",
        {
          className: "hover:bg-muted/20 transition-colors",
          "data-ocid": `super_admin.duplicates.item.${idx + 1}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-3 text-xs font-mono text-foreground", children: [
              g.mobile,
              isPermanentAdmin(g.mobile) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Lock,
                {
                  size: 10,
                  className: "inline ml-1 text-green-600 dark:text-green-400"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Badge,
              {
                variant: "secondary",
                className: "text-xs bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
                children: [
                  g.count,
                  " accounts"
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: () => openDetail(g),
                "data-ocid": `super_admin.duplicates.view_button.${idx + 1}`,
                className: "h-8 text-xs",
                children: "View & Merge"
              }
            ) })
          ]
        },
        g.mobile
      )) })
    ] }) }) }),
    !scanning && groups !== null && groups.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:hidden space-y-2", children: groups.map((g, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Card,
      {
        className: "bg-card border-border",
        "data-ocid": `super_admin.duplicates.item.${idx + 1}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-mono font-semibold text-foreground truncate flex items-center gap-1", children: [
              g.mobile,
              isPermanentAdmin(g.mobile) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Lock,
                {
                  size: 10,
                  className: "text-green-600 dark:text-green-400 flex-shrink-0"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Badge,
              {
                variant: "secondary",
                className: "mt-1 text-xs bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
                children: [
                  g.count,
                  " accounts"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => openDetail(g),
              "data-ocid": `super_admin.duplicates.view_button.${idx + 1}`,
              className: "min-h-[44px] text-xs flex-shrink-0",
              children: "View & Merge"
            }
          )
        ] }) })
      },
      g.mobile
    )) }),
    selectedGroup && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4",
        "data-ocid": "super_admin.duplicates.dialog",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-5 py-4 border-b border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-bold text-foreground", children: [
              "Accounts for ",
              selectedGroup.mobile,
              isPermanentAdmin(selectedGroup.mobile) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Lock,
                {
                  size: 12,
                  className: "inline ml-1 text-green-600 dark:text-green-400"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  setSelectedGroup(null);
                  setShowConfirm(false);
                },
                "data-ocid": "super_admin.duplicates.close_button",
                className: "w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 transition-colors",
                "aria-label": "Close",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 16 })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-4 space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Select the",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: "primary account" }),
              " ",
              "to keep. All other accounts will be merged into it. No data is deleted — this logs an audit entry only."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: selectedGroup.accounts.map((acc, idx) => {
              const isPrimary = acc.id === primaryId;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "label",
                {
                  "data-ocid": `super_admin.duplicates.account_radio.${idx + 1}`,
                  className: `flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${isPrimary ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-muted/20"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "radio",
                        name: "primary-account",
                        value: acc.id,
                        checked: isPrimary,
                        onChange: () => setPrimaryId(acc.id),
                        className: "mt-0.5 accent-primary"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 text-xs space-y-0.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: acc.shopName || "—" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Badge,
                          {
                            variant: "secondary",
                            className: "text-[10px] capitalize",
                            children: acc.role
                          }
                        ),
                        isPrimary && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-[10px] bg-primary/15 text-primary border-primary/30", children: "Primary" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
                        "Created: ",
                        acc.createdDate || "—",
                        " • Last active:",
                        " ",
                        acc.lastActivity || "—"
                      ] })
                    ] })
                  ]
                },
                acc.id
              );
            }) }),
            !showConfirm ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                onClick: () => setShowConfirm(true),
                disabled: !primaryId || secondaryCount === 0,
                "data-ocid": "super_admin.duplicates.merge_button",
                className: "w-full gap-2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(GitMerge, { size: 14 }),
                  "Merge ",
                  secondaryCount,
                  " account(s) into primary"
                ]
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-amber-500/30 bg-amber-500/10 rounded-xl p-4 space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TriangleAlert,
                  {
                    size: 14,
                    className: "text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700 dark:text-amber-300", children: [
                  "Merge",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                    selectedGroup.accounts.length - 1,
                    " account(s)"
                  ] }),
                  " ",
                  "into primary:",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: (primaryAccount == null ? void 0 : primaryAccount.shopName) ?? selectedGroup.mobile }),
                  "? This logs an audit entry but does ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "NOT" }),
                  " ",
                  "delete old data."
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    onClick: handleMerge,
                    disabled: merging,
                    "data-ocid": "super_admin.duplicates.confirm_button",
                    className: "flex-1 gap-2 min-h-[44px]",
                    children: merging ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" }),
                      "Merging…"
                    ] }) : "Confirm Merge"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "outline",
                    onClick: () => setShowConfirm(false),
                    disabled: merging,
                    "data-ocid": "super_admin.duplicates.cancel_button",
                    className: "flex-1 min-h-[44px]",
                    children: "Cancel"
                  }
                )
              ] }),
              merging && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  className: "text-xs text-center text-muted-foreground",
                  "data-ocid": "super_admin.duplicates.loading_state",
                  children: "Merging accounts, please wait…"
                }
              )
            ] })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Card,
      {
        className: "bg-card border-border",
        "data-ocid": "super_admin.duplicates.audit_log_card",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2 pt-4 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-semibold text-foreground flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GitMerge, { size: 12, className: "text-primary" }) }),
            "Recent Merges"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "px-4 pb-4", children: auditLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-full" }, i)) }) : !auditLog || auditLog.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "flex flex-col items-center py-6 gap-2 text-center",
              "data-ocid": "super_admin.duplicates.audit_log_card.empty_state",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "No merges have been performed yet." })
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden sm:block overflow-x-auto -mx-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs min-w-[480px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b border-border", children: [
                "Timestamp",
                "Admin Mobile",
                "Primary Account",
                "Merged Count"
              ].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "th",
                {
                  className: "px-2 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap",
                  children: h
                },
                h
              )) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: auditLog.map((entry, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "tr",
                {
                  className: "hover:bg-muted/10 transition-colors",
                  "data-ocid": `super_admin.duplicates.audit_log_card.item.${idx + 1}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2 text-muted-foreground whitespace-nowrap", children: entry.timestamp ? new Date(entry.timestamp).toLocaleString() : "—" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-2 py-2 font-mono text-foreground", children: [
                      entry.adminMobile || adminMobile,
                      isPermanentAdmin(
                        entry.adminMobile || adminMobile
                      ) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Lock,
                        {
                          size: 9,
                          className: "inline ml-1 text-green-600 dark:text-green-400"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2 text-foreground truncate max-w-[150px]", children: entry.primaryAccount || "—" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[10px]", children: entry.mergedCount }) })
                  ]
                },
                `${entry.timestamp}-${idx}`
              )) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:hidden space-y-2", children: auditLog.map((entry, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "p-2 rounded-lg bg-muted/20 text-xs space-y-0.5",
                "data-ocid": `super_admin.duplicates.audit_log_card.item.${idx + 1}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-foreground flex items-center gap-1", children: [
                      entry.adminMobile || adminMobile,
                      isPermanentAdmin(entry.adminMobile || adminMobile) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Lock,
                        {
                          size: 9,
                          className: "text-green-600 dark:text-green-400"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-[10px]", children: [
                      entry.mergedCount,
                      " merged"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
                    "Primary: ",
                    entry.primaryAccount || "—"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: entry.timestamp ? new Date(entry.timestamp).toLocaleString() : "—" })
                ]
              },
              `${entry.timestamp}-${idx}`
            )) })
          ] }) })
        ]
      }
    )
  ] });
}
function SuperAdminPage({ onBack }) {
  const { currentUser, logout } = useAuth();
  const [authStatus, setAuthStatus] = reactExports.useState("loading");
  const [permanentAdminAlreadySet, setPermanentAdminAlreadySet] = reactExports.useState(false);
  const [activeTab, setActiveTab] = reactExports.useState("overview");
  const [users, setUsers] = reactExports.useState([]);
  const [shops, setShops] = reactExports.useState([]);
  const [dataLoading, setDataLoading] = reactExports.useState(false);
  const [isRefreshing, setIsRefreshing] = reactExports.useState(false);
  const [lastSyncedAt, setLastSyncedAt] = reactExports.useState(0);
  const [syncSecsAgo, setSyncSecsAgo] = reactExports.useState(0);
  const refreshIntervalRef = reactExports.useRef(
    null
  );
  const tickIntervalRef = reactExports.useRef(null);
  const [dateRange, setDateRange] = reactExports.useState("7days");
  const [shopFilter, setShopFilter] = reactExports.useState("all");
  const [search, setSearch] = reactExports.useState("");
  const [sortField, setSortField] = reactExports.useState("lastActivity");
  const [sortDir, setSortDir] = reactExports.useState("desc");
  const [page, setPage] = reactExports.useState(1);
  const [selected, setSelected] = reactExports.useState(/* @__PURE__ */ new Set());
  const [bulkUpdating, setBulkUpdating] = reactExports.useState(false);
  const userTableRef = reactExports.useRef(null);
  const handleBack = () => onBack ? onBack() : window.history.back();
  const checkAccess = reactExports.useCallback(async () => {
    const mobile = currentUser == null ? void 0 : currentUser.mobile;
    if (!mobile) {
      setAuthStatus("denied");
      return;
    }
    const cleanMobile = mobile.replace(/\D/g, "");
    if (cleanMobile === PERMANENT_SUPER_ADMIN) {
      setAuthStatus("allowed");
      return;
    }
    try {
      const actor = await createActorWithConfig();
      const settings = await actor.getAdminSettings();
      if (!settings.superAdminMobile) {
        try {
          const isPerm = await actor.isPermanentSuperAdminQuery(PERMANENT_SUPER_ADMIN);
          if (isPerm) {
            setPermanentAdminAlreadySet(true);
            setAuthStatus("setup");
            return;
          }
        } catch {
        }
        setAuthStatus("setup");
        return;
      }
      const cleanAdmin = settings.superAdminMobile.replace(/\D/g, "");
      if (cleanMobile === cleanAdmin || cleanMobile === PERMANENT_SUPER_ADMIN) {
        setAuthStatus("allowed");
      } else {
        setAuthStatus("denied");
      }
    } catch {
      setAuthStatus("denied");
    }
  }, [currentUser == null ? void 0 : currentUser.mobile]);
  const fetchData = reactExports.useCallback(
    async (silent = false) => {
      if (!silent) setDataLoading(true);
      else setIsRefreshing(true);
      try {
        const actor = await createActorWithConfig();
        const { startTs, endTs } = getDateRangeTs(dateRange);
        const [usersRes, shopsRes] = await Promise.all([
          actor.getAllUsersWithStats(startTs, endTs),
          actor.getShopPerformanceStats(startTs, endTs)
        ]);
        setUsers(usersRes.map((u) => ({ ...u, _updatingPaid: false })));
        setShops(shopsRes);
        setLastSyncedAt(nowMs());
        setSyncSecsAgo(0);
      } catch {
      } finally {
        setDataLoading(false);
        setIsRefreshing(false);
      }
    },
    [dateRange]
  );
  reactExports.useEffect(() => {
    checkAccess();
  }, [checkAccess]);
  const recordSessionOnce = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (authStatus !== "allowed" || recordSessionOnce.current) return;
    recordSessionOnce.current = true;
    const mobile = (currentUser == null ? void 0 : currentUser.mobile) ?? "";
    const shopId = `shop_${mobile}`;
    createActorWithConfig().then(
      (actor) => actor.recordActivity(
        shopId,
        mobile,
        "session",
        JSON.stringify({ source: "admin-dashboard" })
      )
    ).catch(() => {
    });
  }, [authStatus, currentUser == null ? void 0 : currentUser.mobile]);
  reactExports.useEffect(() => {
    if (authStatus === "allowed") {
      fetchData(false);
    }
  }, [authStatus, fetchData]);
  reactExports.useEffect(() => {
    if (authStatus !== "allowed") return;
    refreshIntervalRef.current = setInterval(
      () => fetchData(true),
      AUTO_REFRESH_MS
    );
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [authStatus, fetchData]);
  reactExports.useEffect(() => {
    tickIntervalRef.current = setInterval(() => {
      if (lastSyncedAt) setSyncSecsAgo(secsSinceMs(lastSyncedAt));
    }, 1e3);
    return () => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    };
  }, [lastSyncedAt]);
  reactExports.useEffect(() => {
    setPage(1);
  }, [search, shopFilter, dateRange]);
  const todayStartMs = Number(startOfDay() / 1000000n);
  const sevenDaysMs = Number(msAgo(7) / 1000000n);
  const uniqueUsers = users.length;
  const uniqueUserIds = new Set(users.map((u) => u.userId));
  const totalUsers = uniqueUserIds.size;
  const totalShops = new Set(users.map((u) => u.shopId)).size;
  const activeToday = users.filter(
    (u) => bigintToMs(u.lastActivity) >= todayStartMs
  ).length;
  const active7d = users.filter(
    (u) => bigintToMs(u.lastActivity) >= sevenDaysMs
  ).length;
  const newToday = users.filter(
    (u) => bigintToMs(u.lastActivity) >= todayStartMs
  ).length;
  const paidUsers = users.filter((u) => u.isPaid).length;
  const freeUsers = uniqueUsers - paidUsers;
  const shopNames = Array.from(
    new Set(users.map((u) => u.shopName).filter(Boolean))
  );
  const inactiveCount = users.filter(
    (u) => !isActiveWithin3Days(bigintToMs(u.lastActivity))
  ).length;
  const highUsageCount = users.filter((u) => Number(u.loginCount) >= 50).length;
  const filteredUsers = users.filter((u) => {
    if (shopFilter !== "all" && u.shopName !== shopFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!u.userId.includes(search) && !u.shopName.toLowerCase().includes(s))
        return false;
    }
    return true;
  });
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let av;
    let bv;
    if (sortField === "lastActivity") {
      av = Number(a.lastActivity);
      bv = Number(b.lastActivity);
    } else if (sortField === "loginCount") {
      av = Number(a.loginCount);
      bv = Number(b.loginCount);
    } else if (sortField === "salesCount") {
      av = Number(a.salesCount);
      bv = Number(b.salesCount);
    } else if (sortField === "shopName") {
      av = a.shopName;
      bv = b.shopName;
    } else {
      av = a.userId;
      bv = b.userId;
    }
    if (typeof av === "string" && typeof bv === "string") {
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return sortDir === "asc" ? av - bv : bv - av;
  });
  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / ROWS_PER_PAGE));
  const pageStart = (page - 1) * ROWS_PER_PAGE;
  const pageRows = sortedUsers.slice(pageStart, pageStart + ROWS_PER_PAGE);
  const allPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(`${r.userId}:${r.shopId}`));
  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDir("desc");
    }
  };
  const toggleSelect = (key) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (allPageSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const r of pageRows) next.delete(`${r.userId}:${r.shopId}`);
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const r of pageRows) next.add(`${r.userId}:${r.shopId}`);
        return next;
      });
    }
  };
  const handleTogglePaid = reactExports.useCallback(
    async (userId, shopId, isPaid) => {
      setUsers(
        (prev) => prev.map(
          (u) => u.userId === userId && u.shopId === shopId ? { ...u, _updatingPaid: true } : u
        )
      );
      try {
        const actor = await createActorWithConfig();
        await actor.toggleUserPaidStatus(userId, shopId, isPaid);
        setUsers(
          (prev) => prev.map(
            (u) => u.userId === userId && u.shopId === shopId ? { ...u, isPaid, _updatingPaid: false } : u
          )
        );
      } catch {
        setUsers(
          (prev) => prev.map(
            (u) => u.userId === userId && u.shopId === shopId ? { ...u, _updatingPaid: false } : u
          )
        );
      }
    },
    []
  );
  const handleBulkPaid = reactExports.useCallback(
    async (isPaid) => {
      if (selected.size === 0) return;
      setBulkUpdating(true);
      try {
        const actor = await createActorWithConfig();
        await Promise.all(
          Array.from(selected).map((key) => {
            const [userId, shopId] = key.split(":");
            return actor.toggleUserPaidStatus(userId, shopId, isPaid);
          })
        );
        setUsers(
          (prev) => prev.map(
            (u) => selected.has(`${u.userId}:${u.shopId}`) ? { ...u, isPaid } : u
          )
        );
        setSelected(/* @__PURE__ */ new Set());
      } catch {
      } finally {
        setBulkUpdating(false);
      }
    },
    [selected]
  );
  const topActiveShops = [...shops].sort((a, b) => Number(b.sessionCount) - Number(a.sessionCount)).slice(0, 5);
  const topSalesShops = [...shops].sort((a, b) => Number(b.sessionCount) - Number(a.sessionCount)).slice(0, 5);
  const sevenDaysNs = msAgo(7);
  const inactiveShops = shops.filter((s) => s.lastActivity < sevenDaysNs);
  if (authStatus === "loading") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "min-h-screen bg-background flex items-center justify-center",
        "data-ocid": "super_admin.loading_state",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Verifying access..." })
        ] })
      }
    );
  }
  if (authStatus === "setup") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      SetupScreen,
      {
        onSaved: () => checkAccess(),
        permanentAdminActive: permanentAdminAlreadySet
      }
    );
  }
  if (authStatus === "denied") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AccessDenied, { onBack: handleBack });
  }
  const adminMobile = (currentUser == null ? void 0 : currentUser.mobile) ?? "";
  const isCurrentUserPermanent = isPermanentAdmin(adminMobile);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", "data-ocid": "super_admin.page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "header",
      {
        className: "sticky top-0 z-30 bg-card border-b border-border px-4 py-3",
        "data-ocid": "super_admin.header",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 max-w-6xl mx-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: handleBack,
                "data-ocid": "super_admin.back_button",
                className: "w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex-shrink-0",
                "aria-label": "Go back",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 16 })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 14, className: "text-primary" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-sm font-bold text-foreground leading-tight", children: "Super Admin Dashboard" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground truncate", children: isRefreshing ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary animate-pulse", children: "Refreshing..." }) : lastSyncedAt ? `Last synced: ${syncSecsAgo}s ago` : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                  adminMobile,
                  isCurrentUserPermanent && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Lock,
                    {
                      size: 10,
                      className: "text-green-600 dark:text-green-400"
                    }
                  )
                ] }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground hidden sm:flex items-center gap-1 mr-1 truncate max-w-[110px]", children: [
                adminMobile,
                isCurrentUserPermanent && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Lock,
                  {
                    size: 10,
                    className: "text-green-600 dark:text-green-400 flex-shrink-0"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => fetchData(true),
                  disabled: isRefreshing,
                  "data-ocid": "super_admin.refresh_button",
                  className: "w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors disabled:opacity-50",
                  "aria-label": "Refresh",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    RefreshCw,
                    {
                      size: 14,
                      className: isRefreshing ? "animate-spin" : ""
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  onClick: logout,
                  "data-ocid": "super_admin.logout_button",
                  className: "text-xs text-muted-foreground hover:text-destructive h-8 px-2",
                  children: "Logout"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 mt-3 max-w-6xl mx-auto overflow-x-auto", children: [
            { id: "overview", label: "Overview", icon: Activity },
            {
              id: "staff-lookup",
              label: "Staff Lookup",
              icon: UserSearch
            },
            {
              id: "duplicates",
              label: "Duplicates",
              icon: GitMerge
            },
            {
              id: "change-log",
              label: "Change Log",
              icon: Clock
            }
          ].map(({ id, label, icon: Icon }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setActiveTab(id),
              "data-ocid": `super_admin.tab.${id}`,
              className: `flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 13 }),
                label
              ]
            },
            id
          )) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "p-4 space-y-5 max-w-6xl mx-auto pb-10", children: [
      activeTab === "overview" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PermanentAdminBadge, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex flex-wrap items-center gap-2 bg-card border border-border rounded-xl px-3 py-2.5",
            "data-ocid": "super_admin.filter_bar",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1", children: ["today", "7days", "30days"].map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setDateRange(r),
                  "data-ocid": `super_admin.filter.date_${r}`,
                  className: `text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${dateRange === r ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`,
                  children: r === "today" ? "Today" : r === "7days" ? "Last 7 Days" : "Last 30 Days"
                },
                r
              )) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: shopFilter,
                  onChange: (e) => setShopFilter(e.target.value),
                  "data-ocid": "super_admin.filter.shop_select",
                  className: "text-xs h-7 rounded-lg border border-border bg-background text-foreground px-2 max-w-[140px]",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All Shops" }),
                    shopNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: n, children: n }, n))
                  ]
                }
              ),
              (dateRange !== "7days" || shopFilter !== "all") && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    setDateRange("7days");
                    setShopFilter("all");
                  },
                  "data-ocid": "super_admin.filter.reset_button",
                  className: "flex items-center gap-1 text-xs px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 11 }),
                    "Reset"
                  ]
                }
              )
            ]
          }
        ),
        !dataLoading && inactiveCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5 text-sm",
            "data-ocid": "super_admin.alert.inactive_users",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Bell,
                {
                  size: 14,
                  className: "text-amber-600 dark:text-amber-400 flex-shrink-0"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-amber-700 dark:text-amber-300 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: inactiveCount }),
                " users inactive for 3+ days"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    var _a;
                    return (_a = userTableRef.current) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
                  },
                  className: "text-xs font-medium text-amber-600 dark:text-amber-400 underline hover:no-underline",
                  children: "View"
                }
              )
            ]
          }
        ),
        !dataLoading && highUsageCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-3 bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-2.5 text-sm",
            "data-ocid": "super_admin.alert.high_usage_users",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                TrendingUp,
                {
                  size: 14,
                  className: "text-blue-600 dark:text-blue-400 flex-shrink-0"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-blue-700 dark:text-blue-300 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: highUsageCount }),
                " high-usage users (potential paid tier)"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    var _a;
                    return (_a = userTableRef.current) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
                  },
                  className: "text-xs font-medium text-blue-600 dark:text-blue-400 underline hover:no-underline",
                  children: "View"
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "data-ocid": "super_admin.kpi_section", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5", children: "Overview" }),
          dataLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3", children: ["kpi0", "kpi1", "kpi2", "kpi3", "kpi4", "kpi5", "kpi6"].map(
            (k) => /* @__PURE__ */ jsxRuntimeExports.jsx(KpiSkeleton, {}, k)
          ) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              KpiCard,
              {
                title: "Total Users",
                value: totalUsers,
                subtitle: "Distinct mobiles",
                icon: Users,
                accent: "blue",
                ocid: "super_admin.kpi.total_users"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              KpiCard,
              {
                title: "Total Shops",
                value: totalShops,
                subtitle: "Across all owners",
                icon: Store,
                accent: "indigo",
                ocid: "super_admin.kpi.total_shops"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              KpiCard,
              {
                title: "Active Today",
                value: activeToday,
                subtitle: "Sessions today",
                icon: Activity,
                accent: "green",
                ocid: "super_admin.kpi.active_today"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              KpiCard,
              {
                title: "Active (7 Days)",
                value: active7d,
                subtitle: "Last 7 day sessions",
                icon: Activity,
                accent: "teal",
                ocid: "super_admin.kpi.active_7d"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              KpiCard,
              {
                title: "New Users Today",
                value: newToday,
                subtitle: "First activity today",
                icon: TrendingUp,
                accent: "amber",
                ocid: "super_admin.kpi.new_today"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              KpiCard,
              {
                title: "Paid Users",
                value: paidUsers,
                subtitle: "Manually flagged",
                icon: ShoppingBag,
                accent: "purple",
                ocid: "super_admin.kpi.paid_users"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              KpiCard,
              {
                title: "Free Users",
                value: freeUsers,
                subtitle: "Not yet upgraded",
                icon: Users,
                accent: "rose",
                ocid: "super_admin.kpi.free_users"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChangeSuperAdminSection, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "section",
          {
            ref: userTableRef,
            "data-ocid": "super_admin.user_activity_section",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5", children: "User Activity" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-card border-border overflow-hidden", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 px-3 py-2.5 border-b border-border bg-muted/20", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-[160px]", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Search,
                      {
                        size: 13,
                        className: "absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "text",
                        placeholder: "Search by mobile or shop...",
                        value: search,
                        onChange: (e) => setSearch(e.target.value),
                        "data-ocid": "super_admin.user_table.search_input",
                        className: "w-full h-7 pl-7 pr-3 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      }
                    )
                  ] }),
                  selected.size > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                      selected.size,
                      " selected"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        size: "sm",
                        variant: "outline",
                        onClick: () => handleBulkPaid(true),
                        disabled: bulkUpdating,
                        "data-ocid": "super_admin.user_table.bulk_mark_paid_button",
                        className: "h-7 text-xs px-2",
                        children: "Mark Paid"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        size: "sm",
                        variant: "outline",
                        onClick: () => handleBulkPaid(false),
                        disabled: bulkUpdating,
                        "data-ocid": "super_admin.user_table.bulk_mark_free_button",
                        className: "h-7 text-xs px-2",
                        children: "Mark Free"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm min-w-[640px]", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/30 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 w-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "checkbox",
                        checked: allPageSelected,
                        onChange: toggleSelectAll,
                        "data-ocid": "super_admin.user_table.select_all_checkbox",
                        className: "rounded border-border"
                      }
                    ) }),
                    [
                      {
                        label: "Mobile / User",
                        field: "userId"
                      },
                      {
                        label: "Shop Name",
                        field: "shopName"
                      },
                      {
                        label: "Last Active",
                        field: "lastActivity"
                      },
                      {
                        label: "Logins",
                        field: "loginCount"
                      },
                      {
                        label: "Sales",
                        field: "salesCount"
                      },
                      { label: "Status", field: null },
                      { label: "Paid", field: null }
                    ].map(({ label, field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "th",
                      {
                        className: `px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap ${field ? "cursor-pointer hover:text-foreground select-none" : ""}`,
                        onClick: () => field && toggleSort(field),
                        onKeyDown: (e) => {
                          if (field && (e.key === "Enter" || e.key === " "))
                            toggleSort(field);
                        },
                        tabIndex: field ? 0 : void 0,
                        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
                          label,
                          field && /* @__PURE__ */ jsxRuntimeExports.jsx(
                            ArrowUpDown,
                            {
                              size: 11,
                              className: sortField === field ? "text-primary" : "opacity-40"
                            }
                          )
                        ] })
                      },
                      label
                    ))
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: dataLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableSkeleton, { cols: 8 }) : pageRows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "td",
                    {
                      colSpan: 8,
                      className: "px-4 py-8 text-center",
                      "data-ocid": "super_admin.user_table.empty_state",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2 text-muted-foreground", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 28, className: "opacity-30" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "No users found" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", children: "Try adjusting your search or date range filters." })
                      ] })
                    }
                  ) }) : pageRows.map((user, idx) => {
                    const key = `${user.userId}:${user.shopId}`;
                    const lastMs = bigintToMs(user.lastActivity);
                    const isActive = isActiveWithin3Days(lastMs);
                    const rowNum = pageStart + idx + 1;
                    const isPermUser = isPermanentAdmin(user.userId);
                    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "tr",
                      {
                        "data-ocid": `super_admin.user_table.item.${rowNum}`,
                        className: `hover:bg-muted/20 transition-colors ${selected.has(key) ? "bg-primary/5" : ""}`,
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "input",
                            {
                              type: "checkbox",
                              checked: selected.has(key),
                              onChange: () => toggleSelect(key),
                              "data-ocid": `super_admin.user_table.checkbox.${rowNum}`,
                              className: "rounded border-border"
                            }
                          ) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-mono text-foreground flex items-center gap-1", children: [
                            user.userId,
                            isPermUser && /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Lock,
                              {
                                size: 9,
                                className: "text-green-600 dark:text-green-400 flex-shrink-0",
                                "aria-label": "Permanent Super Admin"
                              }
                            )
                          ] }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground truncate max-w-[120px] block", children: user.shopName || "—" }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-xs text-muted-foreground whitespace-nowrap", children: relativeTime(lastMs) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-xs text-right tabular-nums text-foreground", children: Number(user.loginCount).toLocaleString() }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-xs text-right tabular-nums text-foreground", children: Number(user.salesCount).toLocaleString() }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Badge,
                            {
                              variant: isActive ? "default" : "secondary",
                              className: `text-xs ${isActive ? "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30" : "opacity-60"}`,
                              children: isActive ? "Active" : "Inactive"
                            }
                          ) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: user._updatingPaid ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "div",
                            {
                              className: "w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin",
                              "data-ocid": `super_admin.user_table.loading_state.${rowNum}`
                            }
                          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Switch,
                            {
                              checked: user.isPaid,
                              onCheckedChange: (v) => handleTogglePaid(
                                user.userId,
                                user.shopId,
                                v
                              ),
                              "data-ocid": `super_admin.user_table.paid_toggle.${rowNum}`,
                              "aria-label": "Toggle paid status"
                            }
                          ) })
                        ]
                      },
                      key
                    );
                  }) })
                ] }) }),
                sortedUsers.length > ROWS_PER_PAGE && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/10 text-xs text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Showing ",
                    pageStart + 1,
                    "–",
                    Math.min(pageStart + ROWS_PER_PAGE, sortedUsers.length),
                    " ",
                    "of ",
                    sortedUsers.length
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => setPage((p) => Math.max(1, p - 1)),
                        disabled: page === 1,
                        "data-ocid": "super_admin.user_table.pagination_prev",
                        className: "w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-40 hover:bg-muted/60 transition-colors",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 14 })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 font-medium text-foreground", children: [
                      page,
                      " / ",
                      totalPages
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => setPage((p) => Math.min(totalPages, p + 1)),
                        disabled: page === totalPages,
                        "data-ocid": "super_admin.user_table.pagination_next",
                        className: "w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-40 hover:bg-muted/60 transition-colors",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14 })
                      }
                    )
                  ] })
                ] })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "data-ocid": "super_admin.shop_performance_section", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5", children: "Shop Performance" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ShopRankCard,
              {
                title: "Top Active Shops",
                icon: Activity,
                rows: topActiveShops,
                valueLabel: "Sessions",
                getValue: (s) => Number(s.sessionCount),
                loading: dataLoading,
                ocid: "super_admin.shop_performance.active_card"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ShopRankCard,
              {
                title: "Top Sales Shops",
                icon: TrendingUp,
                rows: topSalesShops,
                valueLabel: "Sales",
                getValue: (s) => Number(s.sessionCount),
                loading: dataLoading,
                ocid: "super_admin.shop_performance.sales_card"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Card,
              {
                className: "bg-card border-border",
                "data-ocid": "super_admin.shop_performance.inactive_card",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2 pt-4 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-semibold text-foreground flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      TriangleAlert,
                      {
                        size: 12,
                        className: "text-amber-600 dark:text-amber-400"
                      }
                    ) }),
                    "Inactive Shops (7+ Days)"
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "px-4 pb-4", children: dataLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-full" }, i)) }) : inactiveShops.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "flex flex-col items-center py-4 gap-2 text-center",
                      "data-ocid": "super_admin.shop_performance.inactive_card.empty_state",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Activity,
                          {
                            size: 14,
                            className: "text-green-600 dark:text-green-400"
                          }
                        ) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "All shops are active" })
                      ]
                    }
                  ) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: inactiveShops.slice(0, 5).map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "li",
                    {
                      className: "flex items-center justify-between gap-2 text-xs",
                      "data-ocid": `super_admin.shop_performance.inactive_card.item.${i + 1}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground truncate", children: s.shopName || s.shopId }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground truncate", children: s.ownerMobile })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground whitespace-nowrap flex-shrink-0", children: relativeTime(bigintToMs(s.lastActivity)) })
                      ]
                    },
                    s.shopId
                  )) }) })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-center text-muted-foreground/40 pb-2", children: "Auto-refreshes every 30 seconds • Data retention: 90 days" })
      ] }),
      activeTab === "staff-lookup" && /* @__PURE__ */ jsxRuntimeExports.jsx(StaffLookupTab, {}),
      activeTab === "duplicates" && /* @__PURE__ */ jsxRuntimeExports.jsx(DuplicatesTab, { adminMobile }),
      activeTab === "change-log" && /* @__PURE__ */ jsxRuntimeExports.jsx(ChangeLogTab, {})
    ] })
  ] });
}
function ShopRankCard({
  title,
  icon: Icon,
  rows,
  valueLabel,
  getValue,
  loading,
  ocid
}) {
  const [showAll, setShowAll] = reactExports.useState(false);
  const displayed = showAll ? rows : rows.slice(0, 5);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-card border-border", "data-ocid": ocid, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2 pt-4 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-semibold text-foreground flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 12, className: "text-primary" }) }),
      title
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "px-4 pb-4", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [0, 1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-full" }, i)) }) : rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "flex flex-col items-center py-4 gap-2 text-center",
        "data-ocid": `${ocid}.empty_state`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "No data available" })
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "space-y-2", children: displayed.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "li",
        {
          className: "flex items-center gap-2.5 text-xs",
          "data-ocid": `${ocid}.item.${i + 1}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-5 h-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold flex-shrink-0 text-[10px]", children: i + 1 }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground truncate", children: s.shopName || s.shopId }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground truncate", children: s.ownerMobile })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground font-semibold tabular-nums flex-shrink-0", children: [
              getValue(s).toLocaleString(),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal", children: valueLabel })
            ] })
          ]
        },
        s.shopId
      )) }),
      rows.length > 5 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => setShowAll((v) => !v),
          className: "mt-3 text-xs text-primary hover:underline",
          children: showAll ? "Show Less" : `Show All (${rows.length})`
        }
      )
    ] }) })
  ] });
}
export {
  SuperAdminPage
};
