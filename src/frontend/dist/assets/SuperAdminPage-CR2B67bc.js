import { c as createLucideIcon, h as useAuth, r as reactExports, b0 as createActorWithConfig, j as jsxRuntimeExports, a2 as ArrowLeft, an as ShieldCheck, aE as RefreshCw, B as Button, X, a7 as Bell, A as TrendingUp, a6 as Users, aB as Store, a5 as ShoppingBag, C as Card, H as Search, v as Badge, i as CardHeader, k as CardTitle, N as TriangleAlert, n as CardContent, b1 as Skeleton, I as Input } from "./index-CyJThNPE.js";
import { S as Switch } from "./switch-2IFIGtoy.js";
import "./index-DkH1qIwF.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  [
    "path",
    {
      d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",
      key: "169zse"
    }
  ]
];
const Activity = createLucideIcon("activity", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "m21 16-4 4-4-4", key: "f6ql7i" }],
  ["path", { d: "M17 20V4", key: "1ejh1v" }],
  ["path", { d: "m3 8 4-4 4 4", key: "11wl7u" }],
  ["path", { d: "M7 4v16", key: "1glfcx" }]
];
const ArrowUpDown = createLucideIcon("arrow-up-down", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]];
const ChevronLeft = createLucideIcon("chevron-left", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]];
const ChevronRight = createLucideIcon("chevron-right", __iconNode);
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
function SetupScreen({ onSaved }) {
  const [mobile, setMobile] = reactExports.useState("");
  const [saving, setSaving] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
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
function SuperAdminPage({ onBack }) {
  const { currentUser, logout } = useAuth();
  const [authStatus, setAuthStatus] = reactExports.useState("loading");
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
    try {
      const actor = await createActorWithConfig();
      const settings = await actor.getAdminSettings();
      if (!settings.superAdminMobile) {
        setAuthStatus("setup");
        return;
      }
      const cleanAdmin = settings.superAdminMobile.replace(/\D/g, "");
      const cleanMobile = mobile.replace(/\D/g, "");
      setAuthStatus(cleanMobile === cleanAdmin ? "allowed" : "denied");
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
    return /* @__PURE__ */ jsxRuntimeExports.jsx(SetupScreen, { onSaved: () => checkAccess() });
  }
  if (authStatus === "denied") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AccessDenied, { onBack: handleBack });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", "data-ocid": "super_admin.page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "header",
      {
        className: "sticky top-0 z-30 bg-card border-b border-border px-4 py-3",
        "data-ocid": "super_admin.header",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 max-w-6xl mx-auto", children: [
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
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground truncate", children: isRefreshing ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary animate-pulse", children: "Refreshing..." }) : lastSyncedAt ? `Last synced: ${syncSecsAgo}s ago` : currentUser == null ? void 0 : currentUser.mobile })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground hidden sm:block mr-1 truncate max-w-[100px]", children: currentUser == null ? void 0 : currentUser.mobile }),
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
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "p-4 space-y-5 max-w-6xl mx-auto pb-10", children: [
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
                    { label: "Shop Name", field: "shopName" },
                    {
                      label: "Last Active",
                      field: "lastActivity"
                    },
                    { label: "Logins", field: "loginCount" },
                    { label: "Sales", field: "salesCount" },
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
                        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono text-foreground", children: user.userId }) }),
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
                            onCheckedChange: (v) => handleTogglePaid(user.userId, user.shopId, v),
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
                  " of",
                  " ",
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
