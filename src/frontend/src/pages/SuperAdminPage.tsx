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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCopy,
  Clock,
  GitMerge,
  Lock,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Store,
  TrendingUp,
  UserSearch,
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
import { toast } from "sonner";
import type {
  AdminSettings as BackendAdminSettings,
  ShopStatsResult,
  UserStatsResult,
} from "../backend";
import { createActorWithConfig } from "../config";
import { useAuth } from "../context/AuthContext";

// ─── Constants ────────────────────────────────────────────────────────────────

const PERMANENT_SUPER_ADMIN = "9929306080";
const AUTO_REFRESH_MS = 30_000;
const ROWS_PER_PAGE = 20;

// ─── Types ────────────────────────────────────────────────────────────────────

type DateRange = "today" | "7days" | "30days";
type SortField =
  | "lastActivity"
  | "loginCount"
  | "salesCount"
  | "shopName"
  | "userId";
type SortDir = "asc" | "desc";
type AdminTab = "overview" | "staff-lookup" | "duplicates" | "change-log";

interface TableRow extends UserStatsResult {
  _updatingPaid?: boolean;
}

interface StaffResult {
  shopName: string;
  staffName: string;
  role: string;
  status: "active" | "inactive";
  lastSeen: string;
}

interface DuplicateGroup {
  mobile: string;
  count: number;
  accounts: DuplicateAccount[];
}

interface DuplicateAccount {
  id: string;
  shopName: string;
  role: string;
  createdDate: string;
  lastActivity: string;
}

interface MergeAuditEntry {
  timestamp: string;
  adminMobile: string;
  primaryAccount: string;
  mergedCount: number;
}

interface ChangeLogEntry {
  changedAt: string;
  previousMobile: string;
  newMobile: string;
  changedBy: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function nowMs(): number {
  return Date.now();
}

function startOfDay(): bigint {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return BigInt(d.getTime()) * 1_000_000n;
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

function safeParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

function isPermanentAdmin(mobile: string): boolean {
  return mobile.replace(/\D/g, "") === PERMANENT_SUPER_ADMIN;
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

// ─── Permanent Admin Badge ────────────────────────────────────────────────────

function PermanentAdminBadge() {
  return (
    <div
      className="flex items-start gap-3 rounded-xl border-2 border-green-500/40 bg-green-500/5 px-4 py-3"
      data-ocid="super_admin.permanent_admin_badge"
    >
      <div className="w-9 h-9 rounded-lg bg-green-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
        <ShieldCheck size={18} className="text-green-600 dark:text-green-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide">
            Primary Super Admin
          </span>
          <Badge className="text-[10px] bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30 gap-1">
            <Lock size={9} />
            Permanent
          </Badge>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-sm font-mono font-bold text-foreground tracking-widest">
            {PERMANENT_SUPER_ADMIN}
          </span>
          <Lock
            size={11}
            className="text-green-600 dark:text-green-400 flex-shrink-0"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          This account has permanent full access and cannot be removed.
        </p>
      </div>
    </div>
  );
}

// ─── Change Super Admin Section ───────────────────────────────────────────────

function ChangeSuperAdminSection() {
  const [open, setOpen] = useState(false);
  const [verifyMobile, setVerifyMobile] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    const cleanVerify = verifyMobile.replace(/\D/g, "");
    const cleanNew = newMobile.replace(/\D/g, "");
    setError("");
    setSuccess("");
    if (cleanVerify.length !== 10) {
      setError(
        "Enter the valid 10-digit primary admin number for verification.",
      );
      return;
    }
    if (cleanNew.length !== 10) {
      setError("Enter a valid 10-digit new super admin mobile number.");
      return;
    }
    if (cleanVerify !== PERMANENT_SUPER_ADMIN) {
      setError(
        `Verification failed. You must confirm with the primary admin number (${PERMANENT_SUPER_ADMIN}).`,
      );
      return;
    }
    setLoading(true);
    try {
      const actor = await createActorWithConfig();
      const extActor = actor as unknown as Record<
        string,
        (a: string, b: string) => Promise<unknown>
      >;
      const result = await extActor.verifyAndChangeSuperAdmin(
        cleanVerify,
        cleanNew,
      );
      if (result === true || result === "ok" || result === "") {
        setSuccess("Super admin updated successfully.");
        setVerifyMobile("");
        setNewMobile("");
        toast.success("Super admin updated successfully.");
      } else {
        setError(typeof result === "string" ? result : "Verification failed.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className="bg-card border-border"
      data-ocid="super_admin.change_admin_section"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        data-ocid="super_admin.change_admin.toggle_button"
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center">
            <Lock size={12} className="text-amber-600 dark:text-amber-400" />
          </div>
          <span className="text-sm font-semibold text-foreground">
            Change Super Admin
          </span>
        </div>
        <ChevronDown
          size={15}
          className={`text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <CardContent className="px-4 pb-4 pt-0 space-y-3 border-t border-border">
          <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2.5 mt-3">
            <AlertTriangle
              size={13}
              className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
            />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              <strong>Warning:</strong> Changing the primary super admin
              requires verification. You must confirm with the current primary
              admin number.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="verify-admin-mobile"
              className="text-xs font-medium text-muted-foreground"
            >
              Confirm with current primary admin number
            </label>
            <div className="relative">
              <Lock
                size={12}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="verify-admin-mobile"
                type="tel"
                placeholder={`Enter ${PERMANENT_SUPER_ADMIN} to verify`}
                value={verifyMobile}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setVerifyMobile(e.target.value)
                }
                maxLength={10}
                data-ocid="super_admin.change_admin.verify_input"
                className="pl-8 font-mono tracking-widest"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="new-admin-mobile"
              className="text-xs font-medium text-muted-foreground"
            >
              New super admin mobile number
            </label>
            <Input
              id="new-admin-mobile"
              type="tel"
              placeholder="10-digit new admin number"
              value={newMobile}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNewMobile(e.target.value)
              }
              maxLength={10}
              data-ocid="super_admin.change_admin.new_mobile_input"
              className="font-mono tracking-widest"
            />
          </div>

          {error && (
            <p
              className="text-xs text-destructive"
              data-ocid="super_admin.change_admin.error_state"
            >
              {error}
            </p>
          )}
          {success && (
            <p
              className="text-xs text-green-600 dark:text-green-400"
              data-ocid="super_admin.change_admin.success_state"
            >
              {success}
            </p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading}
            data-ocid="super_admin.change_admin.submit_button"
            className="w-full gap-2"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheck size={13} />
                Verify &amp; Change
              </>
            )}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

// ─── Change Log Tab ───────────────────────────────────────────────────────────

function ChangeLogTab() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<ChangeLogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchLog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const actor = await createActorWithConfig();
      const extActor = actor as unknown as Record<
        string,
        () => Promise<string>
      >;
      const raw = await extActor.getSuperAdminChangeLog();
      const parsed = safeParse<ChangeLogEntry[]>(raw, []);
      setEntries(parsed);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load change log.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLog();
  }, [fetchLog]);

  return (
    <section className="space-y-4" data-ocid="super_admin.change_log_section">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-1">
            Super Admin Change Log
          </h2>
          <p className="text-xs text-muted-foreground">
            History of all super admin changes. Each change requires
            verification.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchLog}
          disabled={loading}
          data-ocid="super_admin.change_log.refresh_button"
          className="gap-1.5 min-h-[44px] flex-shrink-0"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* Permanent admin info card */}
      <div
        className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/5 px-4 py-3"
        data-ocid="super_admin.change_log.permanent_info"
      >
        <Lock
          size={14}
          className="text-green-600 dark:text-green-400 flex-shrink-0"
        />
        <p className="text-xs text-green-700 dark:text-green-400">
          <span className="font-bold font-mono">{PERMANENT_SUPER_ADMIN}</span>{" "}
          is the permanent primary super admin. It cannot be removed without
          verification.
        </p>
      </div>

      <Card
        className="bg-card border-border overflow-hidden"
        data-ocid="super_admin.change_log.table_card"
      >
        {loading ? (
          <div className="p-4 space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : error ? (
          <div
            className="flex flex-col items-center gap-3 py-10 text-center"
            data-ocid="super_admin.change_log.error_state"
          >
            <AlertTriangle size={24} className="text-destructive opacity-70" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLog}
              data-ocid="super_admin.change_log.retry_button"
            >
              Retry
            </Button>
          </div>
        ) : entries.length === 0 ? (
          <div
            className="flex flex-col items-center gap-3 py-12 text-center"
            data-ocid="super_admin.change_log.empty_state"
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Clock size={18} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No changes recorded.
            </p>
            <p className="text-xs text-muted-foreground">
              The super admin has not been changed since setup.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm min-w-[540px]">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    {[
                      "Changed At",
                      "Previous Mobile",
                      "New Mobile",
                      "Changed By",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {entries.map((entry, idx) => (
                    <tr
                      key={`${entry.changedAt}-${idx}`}
                      className="hover:bg-muted/20 transition-colors"
                      data-ocid={`super_admin.change_log.item.${idx + 1}`}
                    >
                      <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {entry.changedAt
                          ? new Date(entry.changedAt).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs font-mono text-foreground flex items-center gap-1">
                          {entry.previousMobile || "—"}
                          {entry.previousMobile === PERMANENT_SUPER_ADMIN && (
                            <Lock
                              size={10}
                              className="text-green-600 dark:text-green-400"
                            />
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs font-mono text-foreground flex items-center gap-1">
                          {entry.newMobile || "—"}
                          {entry.newMobile === PERMANENT_SUPER_ADMIN && (
                            <Lock
                              size={10}
                              className="text-green-600 dark:text-green-400"
                            />
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs font-mono text-foreground">
                        {entry.changedBy || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-2 p-3">
              {entries.map((entry, idx) => (
                <div
                  key={`${entry.changedAt}-${idx}`}
                  className="rounded-lg bg-muted/20 border border-border px-3 py-2.5 text-xs space-y-1"
                  data-ocid={`super_admin.change_log.item.${idx + 1}`}
                >
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock size={10} />
                    <span>
                      {entry.changedAt
                        ? new Date(entry.changedAt).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    <div>
                      <p className="text-muted-foreground">Previous:</p>
                      <span className="font-mono text-foreground flex items-center gap-1">
                        {entry.previousMobile || "—"}
                        {entry.previousMobile === PERMANENT_SUPER_ADMIN && (
                          <Lock
                            size={9}
                            className="text-green-600 dark:text-green-400"
                          />
                        )}
                      </span>
                    </div>
                    <div>
                      <p className="text-muted-foreground">New:</p>
                      <span className="font-mono text-foreground flex items-center gap-1">
                        {entry.newMobile || "—"}
                        {entry.newMobile === PERMANENT_SUPER_ADMIN && (
                          <Lock
                            size={9}
                            className="text-green-600 dark:text-green-400"
                          />
                        )}
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    Changed by:{" "}
                    <span className="font-mono text-foreground">
                      {entry.changedBy || "—"}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </section>
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

function SetupScreen({
  onSaved,
  permanentAdminActive,
}: {
  onSaved: () => void;
  permanentAdminActive: boolean;
}) {
  const [mobile, setMobile] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // If the permanent admin is already set, show info and allow direct login
  if (permanentAdminActive) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen bg-background p-6 gap-5"
        data-ocid="super_admin.setup_state"
      >
        <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-bold text-foreground">
            Super Admin Ready
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Primary Super Admin{" "}
            <span className="font-mono font-bold text-foreground inline-flex items-center gap-1">
              {PERMANENT_SUPER_ADMIN}
              <Lock size={12} className="text-green-600 dark:text-green-400" />
            </span>{" "}
            is permanently set. Log in directly with this number to access the
            Super Admin Dashboard.
          </p>
        </div>
        <div className="w-full max-w-sm rounded-xl border-2 border-green-500/30 bg-green-500/5 px-4 py-3 text-xs text-green-700 dark:text-green-400 text-center">
          This account has permanent full access and cannot be removed.
        </div>
      </div>
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

// ─── Staff Lookup Tab ─────────────────────────────────────────────────────────

function StaffLookupTab() {
  const [mobileInput, setMobileInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<StaffResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSearch = useCallback(async () => {
    const clean = mobileInput.replace(/\D/g, "");
    if (!clean) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const actor = await createActorWithConfig();
      const raw = await actor.getStaffAcrossShops(clean);
      const parsed = safeParse<StaffResult[]>(raw, []);
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
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <section data-ocid="super_admin.staff_lookup_section">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground mb-1">
          Staff Lookup
        </h2>
        <p className="text-xs text-muted-foreground">
          Find all shops where a staff member is registered by mobile number.
        </p>
      </div>

      {/* Search row */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="tel"
            placeholder="Enter mobile number"
            value={mobileInput}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setMobileInput(e.target.value)
            }
            onKeyDown={handleKeyDown}
            maxLength={12}
            data-ocid="super_admin.staff_lookup.search_input"
            className="pl-8 pr-3"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopy}
          disabled={!mobileInput}
          data-ocid="super_admin.staff_lookup.copy_button"
          aria-label="Copy mobile number"
          title={copied ? "Copied!" : "Copy mobile number"}
          className="flex-shrink-0 min-w-[44px]"
        >
          <ClipboardCopy size={15} className={copied ? "text-primary" : ""} />
        </Button>
        <Button
          onClick={handleSearch}
          disabled={loading || !mobileInput.replace(/\D/g, "")}
          data-ocid="super_admin.staff_lookup.submit_button"
          className="flex-shrink-0 min-w-[80px]"
        >
          {loading ? (
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Searching
            </span>
          ) : (
            "Search"
          )}
        </Button>
      </div>

      {loading && (
        <Card
          className="bg-card border-border"
          data-ocid="super_admin.staff_lookup.loading_state"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  {[
                    "Shop Name",
                    "Staff Name",
                    "Role",
                    "Status",
                    "Last Seen",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <TableSkeleton cols={5} />
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {error && !loading && (
        <div
          className="flex flex-col items-center gap-3 py-8 text-center"
          data-ocid="super_admin.staff_lookup.error_state"
        >
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle size={18} className="text-destructive" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Failed to load results
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSearch}
            data-ocid="super_admin.staff_lookup.retry_button"
          >
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && results !== null && results.length === 0 && (
        <div
          className="flex flex-col items-center gap-3 py-10 text-center"
          data-ocid="super_admin.staff_lookup.empty_state"
        >
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <UserSearch size={18} className="text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">
            No staff found for this mobile number
          </p>
          <p className="text-xs text-muted-foreground">
            This mobile number is not registered as staff in any shop.
          </p>
        </div>
      )}

      {!loading && !error && results !== null && results.length > 0 && (
        <>
          <Card className="bg-card border-border hidden sm:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    {[
                      "Shop Name",
                      "Staff Name",
                      "Role",
                      "Status",
                      "Last Seen",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {results.map((r, idx) => (
                    <tr
                      key={`${r.shopName}-${idx}`}
                      className="hover:bg-muted/20 transition-colors"
                      data-ocid={`super_admin.staff_lookup.item.${idx + 1}`}
                    >
                      <td className="px-3 py-3 text-xs font-medium text-foreground">
                        {r.shopName || "—"}
                      </td>
                      <td className="px-3 py-3 text-xs text-foreground">
                        {r.staffName || "—"}
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground capitalize">
                        {r.role || "—"}
                      </td>
                      <td className="px-3 py-3">
                        <Badge
                          variant={
                            r.status === "active" ? "default" : "secondary"
                          }
                          className={`text-xs ${r.status === "active" ? "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30" : "opacity-60"}`}
                        >
                          {r.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {r.lastSeen || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="sm:hidden space-y-3">
            {results.map((r, idx) => (
              <Card
                key={`${r.shopName}-${idx}`}
                className="bg-card border-border"
                data-ocid={`super_admin.staff_lookup.item.${idx + 1}`}
              >
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {r.shopName || "—"}
                    </p>
                    <Badge
                      variant={r.status === "active" ? "default" : "secondary"}
                      className={`text-xs flex-shrink-0 ${r.status === "active" ? "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30" : "opacity-60"}`}
                    >
                      {r.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                    <span>
                      Staff:{" "}
                      <span className="text-foreground">
                        {r.staffName || "—"}
                      </span>
                    </span>
                    <span>
                      Role:{" "}
                      <span className="text-foreground capitalize">
                        {r.role || "—"}
                      </span>
                    </span>
                    <span className="col-span-2">
                      Last Seen:{" "}
                      <span className="text-foreground">
                        {r.lastSeen || "—"}
                      </span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

// ─── Duplicate Accounts Tab ───────────────────────────────────────────────────

function DuplicatesTab({ adminMobile }: { adminMobile: string }) {
  const [scanning, setScanning] = useState(false);
  const [groups, setGroups] = useState<DuplicateGroup[] | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const [selectedGroup, setSelectedGroup] = useState<DuplicateGroup | null>(
    null,
  );
  const [primaryId, setPrimaryId] = useState<string>("");
  const [merging, setMerging] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [auditLog, setAuditLog] = useState<MergeAuditEntry[] | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);

  const handleScan = useCallback(async () => {
    setScanning(true);
    setScanError(null);
    setGroups(null);
    setSelectedGroup(null);
    try {
      const actor = await createActorWithConfig();
      const raw = await actor.findDuplicateUsers();
      const parsed = safeParse<DuplicateGroup[]>(raw, []);
      setGroups(parsed);
    } catch (err) {
      setScanError(
        err instanceof Error ? err.message : "Failed to scan for duplicates",
      );
    } finally {
      setScanning(false);
    }
  }, []);

  const fetchAuditLog = useCallback(async () => {
    setAuditLoading(true);
    try {
      const actor = await createActorWithConfig();
      const raw = await actor.getMergeAuditLog();
      const parsed = safeParse<(MergeAuditEntry | string)[]>(raw, []);
      const entries: MergeAuditEntry[] = parsed.map((entry) => {
        if (typeof entry === "string") {
          return safeParse<MergeAuditEntry>(entry, {
            timestamp: "",
            adminMobile: "",
            primaryAccount: "",
            mergedCount: 0,
          });
        }
        return entry as MergeAuditEntry;
      });
      setAuditLog(entries.slice(0, 10));
    } catch {
      setAuditLog([]);
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditLog();
  }, [fetchAuditLog]);

  const openDetail = (group: DuplicateGroup) => {
    setSelectedGroup(group);
    const oldest = [...group.accounts].sort(
      (a, b) =>
        new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime(),
    )[0];
    setPrimaryId(oldest?.id ?? group.accounts[0]?.id ?? "");
    setShowConfirm(false);
  };

  const handleMerge = async () => {
    if (!selectedGroup || !primaryId || primaryId.trim() === "") {
      toast.error("Please select a valid primary account before merging.");
      return;
    }
    const secondaryIds = selectedGroup.accounts
      .filter((a) => a.id !== primaryId)
      .map((a) => a.id)
      .filter((id) => id && id.trim() !== "");
    if (secondaryIds.length === 0) {
      toast.error("No valid secondary accounts to merge.");
      return;
    }
    setMerging(true);
    try {
      const actor = await createActorWithConfig();
      const result = await actor.mergeUserAccounts(
        primaryId,
        JSON.stringify(secondaryIds),
      );
      const parsed = safeParse<{ success: boolean; message?: string }>(result, {
        success: false,
      });
      if (parsed.success) {
        toast.success(
          `Successfully merged ${secondaryIds.length} account(s) into primary.`,
        );
        setSelectedGroup(null);
        setShowConfirm(false);
        await Promise.all([handleScan(), fetchAuditLog()]);
      } else {
        toast.error(parsed.message ?? "Merge failed. Please try again.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Merge failed");
    } finally {
      setMerging(false);
    }
  };

  const secondaryCount = selectedGroup
    ? selectedGroup.accounts.filter((a) => a.id !== primaryId).length
    : 0;
  const primaryAccount = selectedGroup?.accounts.find(
    (a) => a.id === primaryId,
  );

  return (
    <section className="space-y-5" data-ocid="super_admin.duplicates_section">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-1">
            Duplicate Account Finder
          </h2>
          <p className="text-xs text-muted-foreground">
            Identify users registered under multiple accounts and merge them.
          </p>
        </div>
        <Button
          onClick={handleScan}
          disabled={scanning}
          data-ocid="super_admin.duplicates.scan_button"
          className="gap-2 min-h-[44px]"
        >
          {scanning ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Scanning…
            </>
          ) : (
            <>
              <Search size={14} />
              Scan for Duplicates
            </>
          )}
        </Button>
      </div>

      {scanError && (
        <div
          className="flex items-center gap-3 bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm"
          data-ocid="super_admin.duplicates.error_state"
        >
          <AlertTriangle size={14} className="text-destructive flex-shrink-0" />
          <span className="text-destructive flex-1">{scanError}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleScan}
            data-ocid="super_admin.duplicates.retry_button"
          >
            Retry
          </Button>
        </div>
      )}

      {!scanning && groups !== null && groups.length === 0 && (
        <div
          className="flex flex-col items-center gap-3 py-10 text-center"
          data-ocid="super_admin.duplicates.empty_state"
        >
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
            <Users size={18} className="text-green-600 dark:text-green-400" />
          </div>
          <p className="text-sm font-medium text-foreground">
            No duplicate accounts found
          </p>
          <p className="text-xs text-muted-foreground">
            All mobile numbers are uniquely registered.
          </p>
        </div>
      )}

      {!scanning && groups !== null && groups.length > 0 && (
        <Card className="bg-card border-border hidden sm:block overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  {["Mobile", "Duplicate Count", "Action"].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {groups.map((g, idx) => (
                  <tr
                    key={g.mobile}
                    className="hover:bg-muted/20 transition-colors"
                    data-ocid={`super_admin.duplicates.item.${idx + 1}`}
                  >
                    <td className="px-3 py-3 text-xs font-mono text-foreground">
                      {g.mobile}
                      {isPermanentAdmin(g.mobile) && (
                        <Lock
                          size={10}
                          className="inline ml-1 text-green-600 dark:text-green-400"
                        />
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <Badge
                        variant="secondary"
                        className="text-xs bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                      >
                        {g.count} accounts
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDetail(g)}
                        data-ocid={`super_admin.duplicates.view_button.${idx + 1}`}
                        className="h-8 text-xs"
                      >
                        View &amp; Merge
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!scanning && groups !== null && groups.length > 0 && (
        <div className="sm:hidden space-y-2">
          {groups.map((g, idx) => (
            <Card
              key={g.mobile}
              className="bg-card border-border"
              data-ocid={`super_admin.duplicates.item.${idx + 1}`}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-mono font-semibold text-foreground truncate flex items-center gap-1">
                      {g.mobile}
                      {isPermanentAdmin(g.mobile) && (
                        <Lock
                          size={10}
                          className="text-green-600 dark:text-green-400 flex-shrink-0"
                        />
                      )}
                    </p>
                    <Badge
                      variant="secondary"
                      className="mt-1 text-xs bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                    >
                      {g.count} accounts
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDetail(g)}
                    data-ocid={`super_admin.duplicates.view_button.${idx + 1}`}
                    className="min-h-[44px] text-xs flex-shrink-0"
                  >
                    View &amp; Merge
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedGroup && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4"
          data-ocid="super_admin.duplicates.dialog"
        >
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">
                Accounts for {selectedGroup.mobile}
                {isPermanentAdmin(selectedGroup.mobile) && (
                  <Lock
                    size={12}
                    className="inline ml-1 text-green-600 dark:text-green-400"
                  />
                )}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setSelectedGroup(null);
                  setShowConfirm(false);
                }}
                data-ocid="super_admin.duplicates.close_button"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <p className="text-xs text-muted-foreground">
                Select the{" "}
                <span className="font-semibold text-foreground">
                  primary account
                </span>{" "}
                to keep. All other accounts will be merged into it. No data is
                deleted — this logs an audit entry only.
              </p>

              <div className="space-y-2">
                {selectedGroup.accounts.map((acc, idx) => {
                  const isPrimary = acc.id === primaryId;
                  return (
                    <label
                      key={acc.id}
                      data-ocid={`super_admin.duplicates.account_radio.${idx + 1}`}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${isPrimary ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-muted/20"}`}
                    >
                      <input
                        type="radio"
                        name="primary-account"
                        value={acc.id}
                        checked={isPrimary}
                        onChange={() => setPrimaryId(acc.id)}
                        className="mt-0.5 accent-primary"
                      />
                      <div className="flex-1 min-w-0 text-xs space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground">
                            {acc.shopName || "—"}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] capitalize"
                          >
                            {acc.role}
                          </Badge>
                          {isPrimary && (
                            <Badge className="text-[10px] bg-primary/15 text-primary border-primary/30">
                              Primary
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">
                          Created: {acc.createdDate || "—"} &bull; Last active:{" "}
                          {acc.lastActivity || "—"}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>

              {!showConfirm ? (
                <Button
                  onClick={() => setShowConfirm(true)}
                  disabled={!primaryId || secondaryCount === 0}
                  data-ocid="super_admin.duplicates.merge_button"
                  className="w-full gap-2"
                >
                  <GitMerge size={14} />
                  Merge {secondaryCount} account(s) into primary
                </Button>
              ) : (
                <div className="border border-amber-500/30 bg-amber-500/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      size={14}
                      className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                    />
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Merge{" "}
                      <strong>
                        {selectedGroup.accounts.length - 1} account(s)
                      </strong>{" "}
                      into primary:{" "}
                      <strong>
                        {primaryAccount?.shopName ?? selectedGroup.mobile}
                      </strong>
                      ? This logs an audit entry but does <strong>NOT</strong>{" "}
                      delete old data.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleMerge}
                      disabled={merging}
                      data-ocid="super_admin.duplicates.confirm_button"
                      className="flex-1 gap-2 min-h-[44px]"
                    >
                      {merging ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Merging…
                        </>
                      ) : (
                        "Confirm Merge"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirm(false)}
                      disabled={merging}
                      data-ocid="super_admin.duplicates.cancel_button"
                      className="flex-1 min-h-[44px]"
                    >
                      Cancel
                    </Button>
                  </div>
                  {merging && (
                    <p
                      className="text-xs text-center text-muted-foreground"
                      data-ocid="super_admin.duplicates.loading_state"
                    >
                      Merging accounts, please wait…
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Card
        className="bg-card border-border"
        data-ocid="super_admin.duplicates.audit_log_card"
      >
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
              <GitMerge size={12} className="text-primary" />
            </div>
            Recent Merges
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {auditLoading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : !auditLog || auditLog.length === 0 ? (
            <div
              className="flex flex-col items-center py-6 gap-2 text-center"
              data-ocid="super_admin.duplicates.audit_log_card.empty_state"
            >
              <p className="text-xs text-muted-foreground">
                No merges have been performed yet.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden sm:block overflow-x-auto -mx-1">
                <table className="w-full text-xs min-w-[480px]">
                  <thead>
                    <tr className="border-b border-border">
                      {[
                        "Timestamp",
                        "Admin Mobile",
                        "Primary Account",
                        "Merged Count",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-2 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {auditLog.map((entry, idx) => (
                      <tr
                        key={`${entry.timestamp}-${idx}`}
                        className="hover:bg-muted/10 transition-colors"
                        data-ocid={`super_admin.duplicates.audit_log_card.item.${idx + 1}`}
                      >
                        <td className="px-2 py-2 text-muted-foreground whitespace-nowrap">
                          {entry.timestamp
                            ? new Date(entry.timestamp).toLocaleString()
                            : "—"}
                        </td>
                        <td className="px-2 py-2 font-mono text-foreground">
                          {entry.adminMobile || adminMobile}
                          {isPermanentAdmin(
                            entry.adminMobile || adminMobile,
                          ) && (
                            <Lock
                              size={9}
                              className="inline ml-1 text-green-600 dark:text-green-400"
                            />
                          )}
                        </td>
                        <td className="px-2 py-2 text-foreground truncate max-w-[150px]">
                          {entry.primaryAccount || "—"}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <Badge variant="secondary" className="text-[10px]">
                            {entry.mergedCount}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="sm:hidden space-y-2">
                {auditLog.map((entry, idx) => (
                  <div
                    key={`${entry.timestamp}-${idx}`}
                    className="p-2 rounded-lg bg-muted/20 text-xs space-y-0.5"
                    data-ocid={`super_admin.duplicates.audit_log_card.item.${idx + 1}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-foreground flex items-center gap-1">
                        {entry.adminMobile || adminMobile}
                        {isPermanentAdmin(entry.adminMobile || adminMobile) && (
                          <Lock
                            size={9}
                            className="text-green-600 dark:text-green-400"
                          />
                        )}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        {entry.mergedCount} merged
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      Primary: {entry.primaryAccount || "—"}
                    </p>
                    <p className="text-muted-foreground">
                      {entry.timestamp
                        ? new Date(entry.timestamp).toLocaleString()
                        : "—"}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function SuperAdminPage({ onBack }: { onBack?: () => void }) {
  const { currentUser, logout } = useAuth();

  // ── Access state ──────────────────────────────────────────────────────────
  const [authStatus, setAuthStatus] = useState<
    "loading" | "setup" | "allowed" | "denied"
  >("loading");
  const [permanentAdminAlreadySet, setPermanentAdminAlreadySet] =
    useState(false);

  // ── Tab state ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

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
    const cleanMobile = mobile.replace(/\D/g, "");

    // Permanent admin always gets access directly
    if (cleanMobile === PERMANENT_SUPER_ADMIN) {
      setAuthStatus("allowed");
      return;
    }

    try {
      const actor = await createActorWithConfig();
      const settings = await actor.getAdminSettings();

      if (!settings.superAdminMobile) {
        // Check if permanent admin is set via isPermanentSuperAdminQuery
        try {
          const isPerm = await (
            actor as unknown as Record<string, (m: string) => Promise<boolean>>
          ).isPermanentSuperAdminQuery(PERMANENT_SUPER_ADMIN);
          if (isPerm) {
            setPermanentAdminAlreadySet(true);
            setAuthStatus("setup");
            return;
          }
        } catch {
          // fallback: show setup
        }
        setAuthStatus("setup");
        return;
      }

      const cleanAdmin = settings.superAdminMobile.replace(/\D/g, "");

      // Allow both: the permanent admin AND the configured admin
      if (cleanMobile === cleanAdmin || cleanMobile === PERMANENT_SUPER_ADMIN) {
        setAuthStatus("allowed");
      } else {
        setAuthStatus("denied");
      }
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

  const uniqueUsers = users.length;
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
  ).length;
  const paidUsers = users.filter((u) => u.isPaid).length;
  const freeUsers = uniqueUsers - paidUsers;

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
    return (
      <SetupScreen
        onSaved={() => checkAccess()}
        permanentAdminActive={permanentAdminAlreadySet}
      />
    );
  }

  if (authStatus === "denied") {
    return <AccessDenied onBack={handleBack} />;
  }

  const adminMobile = currentUser?.mobile ?? "";
  const isCurrentUserPermanent = isPermanentAdmin(adminMobile);

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
                  <span className="flex items-center gap-1">
                    {adminMobile}
                    {isCurrentUserPermanent && (
                      <Lock
                        size={10}
                        className="text-green-600 dark:text-green-400"
                      />
                    )}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1 mr-1 truncate max-w-[110px]">
              {adminMobile}
              {isCurrentUserPermanent && (
                <Lock
                  size={10}
                  className="text-green-600 dark:text-green-400 flex-shrink-0"
                />
              )}
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

        {/* ── Tab Navigation ─────────────────────────────────────────────── */}
        <div className="flex gap-1 mt-3 max-w-6xl mx-auto overflow-x-auto">
          {(
            [
              { id: "overview" as AdminTab, label: "Overview", icon: Activity },
              {
                id: "staff-lookup" as AdminTab,
                label: "Staff Lookup",
                icon: UserSearch,
              },
              {
                id: "duplicates" as AdminTab,
                label: "Duplicates",
                icon: GitMerge,
              },
              {
                id: "change-log" as AdminTab,
                label: "Change Log",
                icon: Clock,
              },
            ] as { id: AdminTab; label: string; icon: React.ElementType }[]
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              data-ocid={`super_admin.tab.${id}`}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="p-4 space-y-5 max-w-6xl mx-auto pb-10">
        {/* ── Overview Tab ────────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <>
            {/* Permanent Admin Badge — always shown at top of overview */}
            <PermanentAdminBadge />

            {/* Filter Bar */}
            <div
              className="flex flex-wrap items-center gap-2 bg-card border border-border rounded-xl px-3 py-2.5"
              data-ocid="super_admin.filter_bar"
            >
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

            {/* Alert Banners */}
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
                  <strong>{highUsageCount}</strong> high-usage users (potential
                  paid tier)
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

            {/* KPI Cards */}
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

            {/* Change Super Admin — collapsible, only visible to permanent admin */}
            <ChangeSuperAdminSection />

            {/* User Activity Table */}
            <section
              ref={userTableRef}
              data-ocid="super_admin.user_activity_section"
            >
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                User Activity
              </h2>
              <Card className="bg-card border-border overflow-hidden">
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
                            {
                              label: "Shop Name",
                              field: "shopName" as SortField,
                            },
                            {
                              label: "Last Active",
                              field: "lastActivity" as SortField,
                            },
                            {
                              label: "Logins",
                              field: "loginCount" as SortField,
                            },
                            {
                              label: "Sales",
                              field: "salesCount" as SortField,
                            },
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
                              <p className="text-sm font-medium">
                                No users found
                              </p>
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
                          const isPermUser = isPermanentAdmin(user.userId);

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
                                <span className="text-xs font-mono text-foreground flex items-center gap-1">
                                  {user.userId}
                                  {isPermUser && (
                                    <Lock
                                      size={9}
                                      className="text-green-600 dark:text-green-400 flex-shrink-0"
                                      aria-label="Permanent Super Admin"
                                    />
                                  )}
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
                                      handleTogglePaid(
                                        user.userId,
                                        user.shopId,
                                        v,
                                      )
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

                {sortedUsers.length > ROWS_PER_PAGE && (
                  <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/10 text-xs text-muted-foreground">
                    <span>
                      Showing {pageStart + 1}–
                      {Math.min(pageStart + ROWS_PER_PAGE, sortedUsers.length)}{" "}
                      of {sortedUsers.length}
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
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
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

            {/* Shop Performance */}
            <section data-ocid="super_admin.shop_performance_section">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                Shop Performance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ShopRankCard
                  title="Top Active Shops"
                  icon={Activity}
                  rows={topActiveShops}
                  valueLabel="Sessions"
                  getValue={(s) => Number(s.sessionCount)}
                  loading={dataLoading}
                  ocid="super_admin.shop_performance.active_card"
                />
                <ShopRankCard
                  title="Top Sales Shops"
                  icon={TrendingUp}
                  rows={topSalesShops}
                  valueLabel="Sales"
                  getValue={(s) => Number(s.sessionCount)}
                  loading={dataLoading}
                  ocid="super_admin.shop_performance.sales_card"
                />
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
          </>
        )}

        {/* ── Staff Lookup Tab ─────────────────────────────────────────────── */}
        {activeTab === "staff-lookup" && <StaffLookupTab />}

        {/* ── Duplicates Tab ───────────────────────────────────────────────── */}
        {activeTab === "duplicates" && (
          <DuplicatesTab adminMobile={adminMobile} />
        )}

        {/* ── Change Log Tab ───────────────────────────────────────────────── */}
        {activeTab === "change-log" && <ChangeLogTab />}
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
