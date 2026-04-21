import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowUpDown,
  Bell,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Store,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  AdminSettings as BackendAdminSettings,
  ShopStatsResult,
  UserStatsResult,
} from "../backend";
import { createActorWithConfig } from "../config";
import { useAuth } from "../context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type DateRange = "today" | "7days" | "30days";
type SortField =
  | "lastActivity"
  | "loginCount"
  | "salesCount"
  | "shopName"
  | "userId";
type SortDir = "asc" | "desc";

interface TableRow extends UserStatsResult {
  _updatingPaid?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTO_REFRESH_MS = 30_000;
const ROWS_PER_PAGE = 20;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function nowMs(): number {
  return Date.now();
}

function startOfDay(): bigint {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return BigInt(d.getTime()) * 1_000_000n; // nanoseconds
}

function msAgo(days: number): bigint {
  return BigInt(nowMs() - days * 24 * 60 * 60 * 1000) * 1_000_000n;
}

function bigintToMs(ns: bigint): number {
  return Number(ns / 1_000_000n);
}

function relativeTime(ms: number): string {
  if (!ms) return "Never";
  const diff = nowMs() - ms;
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "Just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function secsSinceMs(ms: number): number {
  return Math.floor((nowMs() - ms) / 1000);
}

function getDateRangeTs(range: DateRange): {
  startTs: bigint | null;
  endTs: bigint | null;
} {
  if (range === "today") return { startTs: startOfDay(), endTs: null };
  if (range === "7days") return { startTs: msAgo(7), endTs: null };
  if (range === "30days") return { startTs: msAgo(30), endTs: null };
  return { startTs: null, endTs: null };
}

function isActiveWithin3Days(lastActivityMs: number): boolean {
  return nowMs() - lastActivityMs < 3 * 24 * 60 * 60 * 1000;
}

// ─── Skeleton helpers ─────────────────────────────────────────────────────────

function KpiSkeleton() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2 pt-4 px-4">
        <Skeleton className="h-4 w-28" />
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <Skeleton className="h-7 w-14 mb-1" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  );
}

const SKEL_COL_KEYS_8 = [
  "c0",
  "c1",
  "c2",
  "c3",
  "c4",
  "c5",
  "c6",
  "c7",
] as const;
const SKEL_ROW_KEYS = ["r0", "r1", "r2", "r3", "r4"] as const;

function TableSkeleton({ cols }: { cols: number }) {
  const colKeys = SKEL_COL_KEYS_8.slice(0, cols);
  return (
    <>
      {SKEL_ROW_KEYS.map((rowKey) => (
        <tr key={rowKey}>
          {colKeys.map((ck) => (
            <td key={`${rowKey}-${ck}`} className="px-3 py-3">
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ElementType;
  accent: "blue" | "green" | "amber" | "purple" | "teal" | "rose" | "indigo";
  ocid: string;
}

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent,
  ocid,
}: KpiCardProps) {
  const cls = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    green: "bg-green-500/10 text-green-600 dark:text-green-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  }[accent];

  return (
    <Card className="bg-card border-border" data-ocid={ocid}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground leading-snug">
          {title}
        </CardTitle>
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cls}`}
        >
          <Icon size={14} />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="text-2xl font-bold text-foreground tabular-nums">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Access Denied ────────────────────────────────────────────────────────────

function AccessDenied({ onBack }: { onBack: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-background p-6 gap-5"
      data-ocid="super_admin.access_denied_state"
    >
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-destructive" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          You do not have permission to access the Super Admin Dashboard.
        </p>
      </div>
      <Button
        variant="outline"
        onClick={onBack}
        data-ocid="super_admin.access_denied.back_button"
        className="gap-2"
      >
        <ArrowLeft size={15} />
        Go Back
      </Button>
    </div>
  );
}

// ─── Setup Screen ─────────────────────────────────────────────────────────────

function SetupScreen({ onSaved }: { onSaved: () => void }) {
  const [mobile, setMobile] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
      const settings: BackendAdminSettings = {
        superAdminMobile: clean,
        createdAt: BigInt(Date.now()) * 1_000_000n,
        updatedAt: BigInt(Date.now()) * 1_000_000n,
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

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-background p-6 gap-5"
      data-ocid="super_admin.setup_state"
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <ShieldCheck className="w-8 h-8 text-primary" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">Setup Super Admin</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          No super admin has been configured yet. Enter the mobile number that
          will have access to the Super Admin Dashboard.
        </p>
      </div>
      <div className="w-full max-w-sm space-y-3">
        <Input
          type="tel"
          placeholder="10-digit mobile number"
          value={mobile}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setMobile(e.target.value)
          }
          maxLength={10}
          data-ocid="super_admin.setup.mobile_input"
          className="text-center text-lg tracking-widest"
        />
        {error && (
          <p
            className="text-xs text-destructive text-center"
            data-ocid="super_admin.setup.error_state"
          >
            {error}
          </p>
        )}
        <Button
          onClick={handleSave}
          disabled={saving || mobile.replace(/\D/g, "").length !== 10}
          className="w-full"
          data-ocid="super_admin.setup.submit_button"
        >
          {saving ? "Saving..." : "Set as Super Admin"}
        </Button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function SuperAdminPage({ onBack }: { onBack?: () => void }) {
  const { currentUser, logout } = useAuth();

  // ── Access state ──────────────────────────────────────────────────────────
  const [authStatus, setAuthStatus] = useState<
    "loading" | "setup" | "allowed" | "denied"
  >("loading");

  // ── Data state ────────────────────────────────────────────────────────────
  const [users, setUsers] = useState<TableRow[]>([]);
  const [shops, setShops] = useState<ShopStatsResult[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Sync / refresh ────────────────────────────────────────────────────────
  const [lastSyncedAt, setLastSyncedAt] = useState<number>(0);
  const [syncSecsAgo, setSyncSecsAgo] = useState(0);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Filters ───────────────────────────────────────────────────────────────
  const [dateRange, setDateRange] = useState<DateRange>("7days");
  const [shopFilter, setShopFilter] = useState<string>("all");

  // ── Table state ───────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("lastActivity");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const userTableRef = useRef<HTMLDivElement>(null);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const handleBack = () => (onBack ? onBack() : window.history.back());

  // ── Access check ──────────────────────────────────────────────────────────
  const checkAccess = useCallback(async () => {
    const mobile = currentUser?.mobile;
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
  }, [currentUser?.mobile]);

  // ── Fetch data ────────────────────────────────────────────────────────────
  const fetchData = useCallback(
    async (silent = false) => {
      if (!silent) setDataLoading(true);
      else setIsRefreshing(true);
      try {
        const actor = await createActorWithConfig();
        const { startTs, endTs } = getDateRangeTs(dateRange);
        const [usersRes, shopsRes] = await Promise.all([
          actor.getAllUsersWithStats(startTs, endTs),
          actor.getShopPerformanceStats(startTs, endTs),
        ]);
        setUsers(usersRes.map((u) => ({ ...u, _updatingPaid: false })));
        setShops(shopsRes);
        setLastSyncedAt(nowMs());
        setSyncSecsAgo(0);
      } catch {
        // keep stale data
      } finally {
        setDataLoading(false);
        setIsRefreshing(false);
      }
    },
    [dateRange],
  );

  // ── Trigger access check on mount ────────────────────────────────────────
  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  // ── Record session activity ────────────────────────────────────────────────
  const recordSessionOnce = useRef(false);
  useEffect(() => {
    if (authStatus !== "allowed" || recordSessionOnce.current) return;
    recordSessionOnce.current = true;
    const mobile = currentUser?.mobile ?? "";
    const shopId = `shop_${mobile}`;
    createActorWithConfig()
      .then((actor) =>
        actor.recordActivity(
          shopId,
          mobile,
          "session",
          JSON.stringify({ source: "admin-dashboard" }),
        ),
      )
      .catch(() => {});
  }, [authStatus, currentUser?.mobile]);

  // ── Initial fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (authStatus === "allowed") {
      fetchData(false);
    }
  }, [authStatus, fetchData]);

  // ── Auto-refresh every 30s ─────────────────────────────────────────────────
  useEffect(() => {
    if (authStatus !== "allowed") return;
    refreshIntervalRef.current = setInterval(
      () => fetchData(true),
      AUTO_REFRESH_MS,
    );
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [authStatus, fetchData]);

  // ── Tick counter ───────────────────────────────────────────────────────────
  useEffect(() => {
    tickIntervalRef.current = setInterval(() => {
      if (lastSyncedAt) setSyncSecsAgo(secsSinceMs(lastSyncedAt));
    }, 1000);
    return () => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    };
  }, [lastSyncedAt]);

  // ── Reset page on filter/search change ────────────────────────────────────
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, shopFilter, dateRange]);

  // ── Derived KPI stats ──────────────────────────────────────────────────────
  const todayStartMs = Number(startOfDay() / 1_000_000n);
  const sevenDaysMs = Number(msAgo(7) / 1_000_000n);

  const uniqueUsers = users.length; // backend returns one row per user×shop pair, deduplicate by userId
  const uniqueUserIds = new Set(users.map((u) => u.userId));
  const totalUsers = uniqueUserIds.size;
  const totalShops = new Set(users.map((u) => u.shopId)).size;
  const activeToday = users.filter(
    (u) => bigintToMs(u.lastActivity) >= todayStartMs,
  ).length;
  const active7d = users.filter(
    (u) => bigintToMs(u.lastActivity) >= sevenDaysMs,
  ).length;
  const newToday = users.filter(
    (u) => bigintToMs(u.lastActivity) >= todayStartMs,
  ).length; // best approximation
  const paidUsers = users.filter((u) => u.isPaid).length;
  const freeUsers = uniqueUsers - paidUsers;

  // Unique shop names for dropdown
  const shopNames = Array.from(
    new Set(users.map((u) => u.shopName).filter(Boolean)),
  );

  // ── Alerts ────────────────────────────────────────────────────────────────
  const inactiveCount = users.filter(
    (u) => !isActiveWithin3Days(bigintToMs(u.lastActivity)),
  ).length;
  const highUsageCount = users.filter((u) => Number(u.loginCount) >= 50).length;

  // ── Filtered & sorted table rows ──────────────────────────────────────────
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
    let av: number | string;
    let bv: number | string;
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
    return sortDir === "asc"
      ? (av as number) - (bv as number)
      : (bv as number) - (av as number);
  });

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / ROWS_PER_PAGE));
  const pageStart = (page - 1) * ROWS_PER_PAGE;
  const pageRows = sortedUsers.slice(pageStart, pageStart + ROWS_PER_PAGE);

  const allPageSelected =
    pageRows.length > 0 &&
    pageRows.every((r) => selected.has(`${r.userId}:${r.shopId}`));

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const toggleSelect = (key: string) => {
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

  // ── Toggle paid per row ───────────────────────────────────────────────────
  const handleTogglePaid = useCallback(
    async (userId: string, shopId: string, isPaid: boolean) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.userId === userId && u.shopId === shopId
            ? { ...u, _updatingPaid: true }
            : u,
        ),
      );
      try {
        const actor = await createActorWithConfig();
        await actor.toggleUserPaidStatus(userId, shopId, isPaid);
        setUsers((prev) =>
          prev.map((u) =>
            u.userId === userId && u.shopId === shopId
              ? { ...u, isPaid, _updatingPaid: false }
              : u,
          ),
        );
      } catch {
        setUsers((prev) =>
          prev.map((u) =>
            u.userId === userId && u.shopId === shopId
              ? { ...u, _updatingPaid: false }
              : u,
          ),
        );
      }
    },
    [],
  );

  // ── Bulk paid/free ────────────────────────────────────────────────────────
  const handleBulkPaid = useCallback(
    async (isPaid: boolean) => {
      if (selected.size === 0) return;
      setBulkUpdating(true);
      try {
        const actor = await createActorWithConfig();
        await Promise.all(
          Array.from(selected).map((key) => {
            const [userId, shopId] = key.split(":");
            return actor.toggleUserPaidStatus(userId, shopId, isPaid);
          }),
        );
        setUsers((prev) =>
          prev.map((u) =>
            selected.has(`${u.userId}:${u.shopId}`) ? { ...u, isPaid } : u,
          ),
        );
        setSelected(new Set());
      } catch {
        // keep state
      } finally {
        setBulkUpdating(false);
      }
    },
    [selected],
  );

  // ── Shop performance derived ──────────────────────────────────────────────
  const topActiveShops = [...shops]
    .sort((a, b) => Number(b.sessionCount) - Number(a.sessionCount))
    .slice(0, 5);
  const topSalesShops = [...shops]
    .sort((a, b) => Number(b.sessionCount) - Number(a.sessionCount))
    .slice(0, 5);
  const sevenDaysNs = msAgo(7);
  const inactiveShops = shops.filter((s) => s.lastActivity < sevenDaysNs);

  // ── Guards ────────────────────────────────────────────────────────────────
  if (authStatus === "loading") {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        data-ocid="super_admin.loading_state"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (authStatus === "setup") {
    return <SetupScreen onSaved={() => checkAccess()} />;
  }

  if (authStatus === "denied") {
    return <AccessDenied onBack={handleBack} />;
  }

  // ── Dashboard render ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background" data-ocid="super_admin.page">
      {/* ── Sticky Header ────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3"
        data-ocid="super_admin.header"
      >
        <div className="flex items-center gap-2 max-w-6xl mx-auto">
          <button
            type="button"
            onClick={handleBack}
            data-ocid="super_admin.back_button"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex-shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={14} className="text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-foreground leading-tight">
                Super Admin Dashboard
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                {isRefreshing ? (
                  <span className="text-primary animate-pulse">
                    Refreshing...
                  </span>
                ) : lastSyncedAt ? (
                  `Last synced: ${syncSecsAgo}s ago`
                ) : (
                  currentUser?.mobile
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-xs text-muted-foreground hidden sm:block mr-1 truncate max-w-[100px]">
              {currentUser?.mobile}
            </span>
            <button
              type="button"
              onClick={() => fetchData(true)}
              disabled={isRefreshing}
              data-ocid="super_admin.refresh_button"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors disabled:opacity-50"
              aria-label="Refresh"
            >
              <RefreshCw
                size={14}
                className={isRefreshing ? "animate-spin" : ""}
              />
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              data-ocid="super_admin.logout_button"
              className="text-xs text-muted-foreground hover:text-destructive h-8 px-2"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-5 max-w-6xl mx-auto pb-10">
        {/* ── Filter Bar ─────────────────────────────────────────────────── */}
        <div
          className="flex flex-wrap items-center gap-2 bg-card border border-border rounded-xl px-3 py-2.5"
          data-ocid="super_admin.filter_bar"
        >
          {/* Date range */}
          <div className="flex gap-1">
            {(["today", "7days", "30days"] as DateRange[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setDateRange(r)}
                data-ocid={`super_admin.filter.date_${r}`}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  dateRange === r
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {r === "today"
                  ? "Today"
                  : r === "7days"
                    ? "Last 7 Days"
                    : "Last 30 Days"}
              </button>
            ))}
          </div>

          {/* Shop filter */}
          <select
            value={shopFilter}
            onChange={(e) => setShopFilter(e.target.value)}
            data-ocid="super_admin.filter.shop_select"
            className="text-xs h-7 rounded-lg border border-border bg-background text-foreground px-2 max-w-[140px]"
          >
            <option value="all">All Shops</option>
            {shopNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          {/* Reset */}
          {(dateRange !== "7days" || shopFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setDateRange("7days");
                setShopFilter("all");
              }}
              data-ocid="super_admin.filter.reset_button"
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <X size={11} />
              Reset
            </button>
          )}
        </div>

        {/* ── Alert Banners ───────────────────────────────────────────────── */}
        {!dataLoading && inactiveCount > 0 && (
          <div
            className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5 text-sm"
            data-ocid="super_admin.alert.inactive_users"
          >
            <Bell
              size={14}
              className="text-amber-600 dark:text-amber-400 flex-shrink-0"
            />
            <span className="text-amber-700 dark:text-amber-300 flex-1">
              <strong>{inactiveCount}</strong> users inactive for 3+ days
            </span>
            <button
              type="button"
              onClick={() =>
                userTableRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="text-xs font-medium text-amber-600 dark:text-amber-400 underline hover:no-underline"
            >
              View
            </button>
          </div>
        )}
        {!dataLoading && highUsageCount > 0 && (
          <div
            className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-2.5 text-sm"
            data-ocid="super_admin.alert.high_usage_users"
          >
            <TrendingUp
              size={14}
              className="text-blue-600 dark:text-blue-400 flex-shrink-0"
            />
            <span className="text-blue-700 dark:text-blue-300 flex-1">
              <strong>{highUsageCount}</strong> high-usage users (potential paid
              tier)
            </span>
            <button
              type="button"
              onClick={() =>
                userTableRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="text-xs font-medium text-blue-600 dark:text-blue-400 underline hover:no-underline"
            >
              View
            </button>
          </div>
        )}

        {/* ── KPI Cards ───────────────────────────────────────────────────── */}
        <section data-ocid="super_admin.kpi_section">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
            Overview
          </h2>
          {dataLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {["kpi0", "kpi1", "kpi2", "kpi3", "kpi4", "kpi5", "kpi6"].map(
                (k) => (
                  <KpiSkeleton key={k} />
                ),
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <KpiCard
                title="Total Users"
                value={totalUsers}
                subtitle="Distinct mobiles"
                icon={Users}
                accent="blue"
                ocid="super_admin.kpi.total_users"
              />
              <KpiCard
                title="Total Shops"
                value={totalShops}
                subtitle="Across all owners"
                icon={Store}
                accent="indigo"
                ocid="super_admin.kpi.total_shops"
              />
              <KpiCard
                title="Active Today"
                value={activeToday}
                subtitle="Sessions today"
                icon={Activity}
                accent="green"
                ocid="super_admin.kpi.active_today"
              />
              <KpiCard
                title="Active (7 Days)"
                value={active7d}
                subtitle="Last 7 day sessions"
                icon={Activity}
                accent="teal"
                ocid="super_admin.kpi.active_7d"
              />
              <KpiCard
                title="New Users Today"
                value={newToday}
                subtitle="First activity today"
                icon={TrendingUp}
                accent="amber"
                ocid="super_admin.kpi.new_today"
              />
              <KpiCard
                title="Paid Users"
                value={paidUsers}
                subtitle="Manually flagged"
                icon={ShoppingBag}
                accent="purple"
                ocid="super_admin.kpi.paid_users"
              />
              <KpiCard
                title="Free Users"
                value={freeUsers}
                subtitle="Not yet upgraded"
                icon={Users}
                accent="rose"
                ocid="super_admin.kpi.free_users"
              />
            </div>
          )}
        </section>

        {/* ── User Activity Table ─────────────────────────────────────────── */}
        <section
          ref={userTableRef}
          data-ocid="super_admin.user_activity_section"
        >
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
            User Activity
          </h2>
          <Card className="bg-card border-border overflow-hidden">
            {/* Search + Bulk Actions */}
            <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 border-b border-border bg-muted/20">
              <div className="relative flex-1 min-w-[160px]">
                <Search
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="Search by mobile or shop..."
                  value={search}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setSearch(e.target.value)
                  }
                  data-ocid="super_admin.user_table.search_input"
                  className="w-full h-7 pl-7 pr-3 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              {selected.size > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    {selected.size} selected
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkPaid(true)}
                    disabled={bulkUpdating}
                    data-ocid="super_admin.user_table.bulk_mark_paid_button"
                    className="h-7 text-xs px-2"
                  >
                    Mark Paid
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkPaid(false)}
                    disabled={bulkUpdating}
                    data-ocid="super_admin.user_table.bulk_mark_free_button"
                    className="h-7 text-xs px-2"
                  >
                    Mark Free
                  </Button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    <th className="px-3 py-2.5 w-8">
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        onChange={toggleSelectAll}
                        data-ocid="super_admin.user_table.select_all_checkbox"
                        className="rounded border-border"
                      />
                    </th>
                    {(
                      [
                        {
                          label: "Mobile / User",
                          field: "userId" as SortField,
                        },
                        { label: "Shop Name", field: "shopName" as SortField },
                        {
                          label: "Last Active",
                          field: "lastActivity" as SortField,
                        },
                        { label: "Logins", field: "loginCount" as SortField },
                        { label: "Sales", field: "salesCount" as SortField },
                        { label: "Status", field: null },
                        { label: "Paid", field: null },
                      ] as { label: string; field: SortField | null }[]
                    ).map(({ label, field }) => (
                      <th
                        key={label}
                        className={`px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap ${field ? "cursor-pointer hover:text-foreground select-none" : ""}`}
                        onClick={() => field && toggleSort(field)}
                        onKeyDown={(e) => {
                          if (field && (e.key === "Enter" || e.key === " "))
                            toggleSort(field);
                        }}
                        tabIndex={field ? 0 : undefined}
                      >
                        <span className="inline-flex items-center gap-1">
                          {label}
                          {field && (
                            <ArrowUpDown
                              size={11}
                              className={
                                sortField === field
                                  ? "text-primary"
                                  : "opacity-40"
                              }
                            />
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {dataLoading ? (
                    <TableSkeleton cols={8} />
                  ) : pageRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center"
                        data-ocid="super_admin.user_table.empty_state"
                      >
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Users size={28} className="opacity-30" />
                          <p className="text-sm font-medium">No users found</p>
                          <p className="text-xs">
                            Try adjusting your search or date range filters.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((user, idx) => {
                      const key = `${user.userId}:${user.shopId}`;
                      const lastMs = bigintToMs(user.lastActivity);
                      const isActive = isActiveWithin3Days(lastMs);
                      const rowNum = pageStart + idx + 1;

                      return (
                        <tr
                          key={key}
                          data-ocid={`super_admin.user_table.item.${rowNum}`}
                          className={`hover:bg-muted/20 transition-colors ${selected.has(key) ? "bg-primary/5" : ""}`}
                        >
                          <td className="px-3 py-3">
                            <input
                              type="checkbox"
                              checked={selected.has(key)}
                              onChange={() => toggleSelect(key)}
                              data-ocid={`super_admin.user_table.checkbox.${rowNum}`}
                              className="rounded border-border"
                            />
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-xs font-mono text-foreground">
                              {user.userId}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-xs text-foreground truncate max-w-[120px] block">
                              {user.shopName || "—"}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">
                            {relativeTime(lastMs)}
                          </td>
                          <td className="px-3 py-3 text-xs text-right tabular-nums text-foreground">
                            {Number(user.loginCount).toLocaleString()}
                          </td>
                          <td className="px-3 py-3 text-xs text-right tabular-nums text-foreground">
                            {Number(user.salesCount).toLocaleString()}
                          </td>
                          <td className="px-3 py-3">
                            <Badge
                              variant={isActive ? "default" : "secondary"}
                              className={`text-xs ${isActive ? "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30" : "opacity-60"}`}
                            >
                              {isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-3 py-3">
                            {user._updatingPaid ? (
                              <div
                                className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"
                                data-ocid={`super_admin.user_table.loading_state.${rowNum}`}
                              />
                            ) : (
                              <Switch
                                checked={user.isPaid}
                                onCheckedChange={(v) =>
                                  handleTogglePaid(user.userId, user.shopId, v)
                                }
                                data-ocid={`super_admin.user_table.paid_toggle.${rowNum}`}
                                aria-label="Toggle paid status"
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {sortedUsers.length > ROWS_PER_PAGE && (
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/10 text-xs text-muted-foreground">
                <span>
                  Showing {pageStart + 1}–
                  {Math.min(pageStart + ROWS_PER_PAGE, sortedUsers.length)} of{" "}
                  {sortedUsers.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    data-ocid="super_admin.user_table.pagination_prev"
                    className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-40 hover:bg-muted/60 transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="px-2 font-medium text-foreground">
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    data-ocid="super_admin.user_table.pagination_next"
                    className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-40 hover:bg-muted/60 transition-colors"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </Card>
        </section>

        {/* ── Shop Performance ────────────────────────────────────────────── */}
        <section data-ocid="super_admin.shop_performance_section">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
            Shop Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top Active Shops */}
            <ShopRankCard
              title="Top Active Shops"
              icon={Activity}
              rows={topActiveShops}
              valueLabel="Sessions"
              getValue={(s) => Number(s.sessionCount)}
              loading={dataLoading}
              ocid="super_admin.shop_performance.active_card"
            />
            {/* Top Sales Shops */}
            <ShopRankCard
              title="Top Sales Shops"
              icon={TrendingUp}
              rows={topSalesShops}
              valueLabel="Sales"
              getValue={(s) => Number(s.sessionCount)}
              loading={dataLoading}
              ocid="super_admin.shop_performance.sales_card"
            />
            {/* Inactive Shops */}
            <Card
              className="bg-card border-border"
              data-ocid="super_admin.shop_performance.inactive_card"
            >
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center">
                    <AlertTriangle
                      size={12}
                      className="text-amber-600 dark:text-amber-400"
                    />
                  </div>
                  Inactive Shops (7+ Days)
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {dataLoading ? (
                  <div className="space-y-2">
                    {[0, 1, 2].map((i) => (
                      <Skeleton key={i} className="h-9 w-full" />
                    ))}
                  </div>
                ) : inactiveShops.length === 0 ? (
                  <div
                    className="flex flex-col items-center py-4 gap-2 text-center"
                    data-ocid="super_admin.shop_performance.inactive_card.empty_state"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Activity
                        size={14}
                        className="text-green-600 dark:text-green-400"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      All shops are active
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {inactiveShops.slice(0, 5).map((s, i) => (
                      <li
                        key={s.shopId}
                        className="flex items-center justify-between gap-2 text-xs"
                        data-ocid={`super_admin.shop_performance.inactive_card.item.${i + 1}`}
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {s.shopName || s.shopId}
                          </p>
                          <p className="text-muted-foreground truncate">
                            {s.ownerMobile}
                          </p>
                        </div>
                        <span className="text-muted-foreground whitespace-nowrap flex-shrink-0">
                          {relativeTime(bigintToMs(s.lastActivity))}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <p className="text-xs text-center text-muted-foreground/40 pb-2">
          Auto-refreshes every 30 seconds &bull; Data retention: 90 days
        </p>
      </main>
    </div>
  );
}

// ─── ShopRankCard ─────────────────────────────────────────────────────────────

interface ShopRankCardProps {
  title: string;
  icon: React.ElementType;
  rows: ShopStatsResult[];
  valueLabel: string;
  getValue: (s: ShopStatsResult) => number;
  loading: boolean;
  ocid: string;
}

function ShopRankCard({
  title,
  icon: Icon,
  rows,
  valueLabel,
  getValue,
  loading,
  ocid,
}: ShopRankCardProps) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? rows : rows.slice(0, 5);

  return (
    <Card className="bg-card border-border" data-ocid={ocid}>
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
            <Icon size={12} className="text-primary" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div
            className="flex flex-col items-center py-4 gap-2 text-center"
            data-ocid={`${ocid}.empty_state`}
          >
            <p className="text-xs text-muted-foreground">No data available</p>
          </div>
        ) : (
          <>
            <ol className="space-y-2">
              {displayed.map((s, i) => (
                <li
                  key={s.shopId}
                  className="flex items-center gap-2.5 text-xs"
                  data-ocid={`${ocid}.item.${i + 1}`}
                >
                  <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold flex-shrink-0 text-[10px]">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {s.shopName || s.shopId}
                    </p>
                    <p className="text-muted-foreground truncate">
                      {s.ownerMobile}
                    </p>
                  </div>
                  <span className="text-foreground font-semibold tabular-nums flex-shrink-0">
                    {getValue(s).toLocaleString()}{" "}
                    <span className="text-muted-foreground font-normal">
                      {valueLabel}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
            {rows.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="mt-3 text-xs text-primary hover:underline"
              >
                {showAll ? "Show Less" : `Show All (${rows.length})`}
              </button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
