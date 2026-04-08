import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Banknote,
  BarChart2,
  Bell,
  CheckCircle,
  Clock,
  CreditCard,
  MessageCircle,
  Package,
  PackageX,
  Plus,
  Receipt,
  ShieldAlert,
  ShoppingCart,
  Skull,
  Smartphone,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminSummaryCard } from "../components/AdminSummaryCard";
import { TopBar } from "../components/TopBar";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import type { NavPage, UserRole } from "../types/store";

// ─── Formatters ──────────────────────────────────────────────────────────────
function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "Abhi";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const days = Math.floor(diff / 86400);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

// ─── Role badge ───────────────────────────────────────────────────────────────
function RoleBadgeInline({ userRole }: { userRole: UserRole }) {
  if (userRole === "owner") return <span className="badge-owner">Owner</span>;
  if (userRole === "manager")
    return <span className="badge-manager">Manager</span>;
  return <span className="badge-staff">Staff</span>;
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({
  icon,
  title,
  subtitle,
  accent = "blue",
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  accent?: "blue" | "red" | "yellow" | "green" | "orange" | "purple";
  badge?: React.ReactNode;
}) {
  const borderColors = {
    blue: "border-l-blue-500",
    red: "border-l-red-500",
    yellow: "border-l-amber-400",
    green: "border-l-green-500",
    orange: "border-l-orange-500",
    purple: "border-l-purple-500",
  };
  return (
    <div
      className={`flex items-center justify-between border-l-4 pl-3 py-1 ${borderColors[accent]}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <div>
          <h2 className="text-sm font-bold text-foreground tracking-tight leading-none">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {badge}
      </div>
    </div>
  );
}

// ─── Summary Mini Card ────────────────────────────────────────────────────────
function SummaryCard({
  label,
  value,
  icon: Icon,
  colorClass,
  bgClass,
  onClick,
  ocid,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  colorClass: string;
  bgClass: string;
  onClick?: () => void;
  ocid?: string;
}) {
  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={onClick}
      className={`flex-1 min-w-0 flex flex-col gap-1 rounded-xl p-3 ${bgClass} active:scale-95 transition-transform duration-150 cursor-pointer text-left`}
    >
      <div className="flex items-center justify-between gap-1">
        <span
          className={`text-[11px] font-semibold ${colorClass} opacity-80 truncate`}
        >
          {label}
        </span>
        <Icon size={14} className={`${colorClass} flex-shrink-0 opacity-70`} />
      </div>
      <span
        className={`text-base font-extrabold ${colorClass} leading-tight truncate`}
      >
        {value}
      </span>
    </button>
  );
}

// ─── Alert Count Card ─────────────────────────────────────────────────────────
function AlertCard({
  icon: Icon,
  count,
  label,
  sub,
  onClick,
  ocid,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  count: number;
  label: string;
  sub?: string;
  onClick?: () => void;
  ocid?: string;
}) {
  const isOk = count === 0;
  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={onClick}
      className={`flex-1 min-w-0 flex flex-col items-center gap-1.5 rounded-xl p-3 border transition-all active:scale-95 text-center ${
        isOk
          ? "bg-green-50 border-green-200"
          : "bg-red-50 border-red-300 shadow-sm"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center ${
          isOk ? "bg-green-100" : "bg-red-100"
        }`}
      >
        <Icon size={16} className={isOk ? "text-green-600" : "text-red-600"} />
      </div>
      <span
        className={`text-xl font-extrabold leading-none ${
          isOk ? "text-green-700" : "text-red-700"
        }`}
      >
        {count}
      </span>
      <span
        className={`text-[11px] font-semibold leading-tight ${
          isOk ? "text-green-600" : "text-red-600"
        }`}
      >
        {label}
      </span>
      {sub && (
        <span className="text-[10px] text-muted-foreground leading-tight">
          {sub}
        </span>
      )}
    </button>
  );
}

// ─── Stock Card ───────────────────────────────────────────────────────────────
function StockCard({
  icon: Icon,
  value,
  label,
  sub,
  color,
  onClick,
  ocid,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  value: string | number;
  label: string;
  sub?: string;
  color: "blue" | "yellow" | "red" | "green";
  onClick?: () => void;
  ocid?: string;
}) {
  const cfg = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "text-blue-600",
      val: "text-blue-700",
    },
    yellow: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: "text-amber-600",
      val: "text-amber-700",
    },
    red: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: "text-red-600",
      val: "text-red-700",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "text-green-600",
      val: "text-green-700",
    },
  }[color];

  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={onClick}
      className={`flex-1 min-w-0 flex flex-col gap-2 rounded-xl p-3 border ${cfg.bg} ${cfg.border} active:scale-95 transition-transform duration-150`}
    >
      <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center">
        <Icon size={15} className={cfg.icon} />
      </div>
      <span className={`text-lg font-extrabold ${cfg.val} leading-none`}>
        {value}
      </span>
      <div>
        <div className={`text-[11px] font-semibold ${cfg.val}`}>{label}</div>
        {sub && (
          <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>
        )}
      </div>
    </button>
  );
}

// ─── Props & State ─────────────────────────────────────────────────────────────
interface DashboardPageProps {
  onNavigate: (page: NavPage) => void;
}

type PayMode = "cash" | "upi" | "online";

interface MarkPaidState {
  amount: string;
  mode: PayMode;
  saving: boolean;
  success: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const {
    products,
    batches,
    invoices,
    getTotalStockValue,
    getTodaySales,
    getTodayProfit,
    getLowStockProducts,
    transactions,
    getProductStock,
    getTotalCreditDue,
    getAllCustomerLedgers,
    getDailySales,
    receivePayment,
    shopSettings,
    getLastSoldDate,
    lowPriceAlertLogs,
    appConfig,
  } = useStore();

  const { currentShop, session, currentUser } = useAuth();

  const role = currentUser?.role ?? "staff";
  const isOwner = role === "owner";
  const isStaff = role === "staff";

  const [markPaidOpen, setMarkPaidOpen] = useState<
    Record<string, MarkPaidState>
  >({});

  // ── Date constants ────────────────────────────────────────────────────────
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayMs = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  // ── Core stats ─────────────────────────────────────────────────────────────
  const totalValue = getTotalStockValue();
  const todaySales = getTodaySales();
  const todayProfit = getTodayProfit();
  const lowStockItems = getLowStockProducts();
  const allLedgers = getAllCustomerLedgers();
  getTotalCreditDue();

  const todayInvoices = getDailySales(todayStr);

  // ── Staff-filtered invoices (for staff role: own sales only) ───────────────
  const myInvoices = useMemo(() => {
    if (isStaff && currentUser) {
      return invoices.filter(
        (inv) =>
          inv.soldByUserId === currentUser.id ||
          inv.soldByName === currentUser.name ||
          inv.soldByName === currentUser.mobile,
      );
    }
    return invoices;
  }, [invoices, isStaff, currentUser]);

  const myTodayInvoices = useMemo(
    () => myInvoices.filter((inv) => inv.date.slice(0, 10) === todayStr),
    [myInvoices, todayStr],
  );

  const myTodaySales = useMemo(
    () => myTodayInvoices.reduce((s, inv) => s + inv.totalAmount, 0),
    [myTodayInvoices],
  );

  // ── Daily payment breakdown ─────────────────────────────────────────────────
  // Staff: filter to own invoices only so they can't see aggregate shop totals.
  const paymentSourceInvoices = isStaff ? myTodayInvoices : todayInvoices;
  const cashToday = paymentSourceInvoices
    .filter((inv) => inv.paymentMode === "cash")
    .reduce((s, inv) => s + inv.paidAmount, 0);
  const upiToday = paymentSourceInvoices
    .filter((inv) => inv.paymentMode === "upi")
    .reduce((s, inv) => s + inv.paidAmount, 0);

  // ── Alert counts ────────────────────────────────────────────────────────────
  const outOfStockItems = products.filter((p) => getProductStock(p.id) === 0);
  const dueCustomers = allLedgers
    .filter((l) => l.totalDue > 0)
    .sort((a, b) => b.totalDue - a.totalDue)
    .slice(0, 5);
  const totalDue = allLedgers
    .filter((l) => l.totalDue > 0)
    .reduce((s, l) => s + l.totalDue, 0);

  // ── Notification bell ───────────────────────────────────────────────────────
  const todayDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const expiryAlerts = useMemo(
    () =>
      batches
        .filter((b) => b.expiryDate?.trim())
        .map((b) => {
          const [y, mo, day] = b.expiryDate!.split("-").map(Number);
          const expiry = new Date(y, mo - 1, day);
          const daysLeft = Math.ceil(
            (expiry.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24),
          );
          const product = products.find((p) => p.id === b.productId);
          return {
            batchId: b.id,
            productName: product?.name ?? "Unknown",
            daysLeft,
          };
        })
        .filter((a) => a.daysLeft <= 30)
        .sort((a, b) => a.daysLeft - b.daysLeft),
    [batches, products, todayDate],
  );

  // Notification count — for staff: only low stock
  const notifCount = isStaff
    ? lowStockItems.length
    : lowStockItems.length + dueCustomers.length + expiryAlerts.length;

  // ── Smart Insights ──────────────────────────────────────────────────────────
  const productSalesMap = useMemo(() => {
    const qtySold = new Map<string, number>();
    const profitEarned = new Map<string, number>();
    for (const inv of invoices) {
      for (const item of inv.items) {
        qtySold.set(
          item.productId,
          (qtySold.get(item.productId) ?? 0) + item.quantity,
        );
        profitEarned.set(
          item.productId,
          (profitEarned.get(item.productId) ?? 0) + (item.totalProfit ?? 0),
        );
      }
    }
    return { qtySold, profitEarned };
  }, [invoices]);

  const mostSellingProducts = useMemo(
    () =>
      products
        .map((p) => ({
          name: p.name,
          qty: productSalesMap.qtySold.get(p.id) ?? 0,
        }))
        .filter((x) => x.qty > 0)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 3),
    [products, productSalesMap.qtySold],
  );

  const highProfitItems = useMemo(
    () =>
      products
        .map((p) => ({
          name: p.name,
          profit: productSalesMap.profitEarned.get(p.id) ?? 0,
        }))
        .filter((x) => x.profit > 0)
        .sort((a, b) => b.profit - a.profit)
        .slice(0, 3),
    [products, productSalesMap.profitEarned],
  );

  const lowPriceAttemptsToday = useMemo(
    () =>
      lowPriceAlertLogs.filter((log) => log.timestamp.slice(0, 10) === todayStr)
        .length,
    [lowPriceAlertLogs, todayStr],
  );

  // ── Inventory Health ────────────────────────────────────────────────────────
  const threshold = shopSettings.deadStockThresholdDays ?? 90;
  const halfThreshold = Math.floor(threshold / 2);

  const deadStockItems = useMemo(() => {
    return products.filter((p) => {
      const totalQty = batches
        .filter((b) => b.productId === p.id)
        .reduce((s, b) => s + b.quantity, 0);
      if (totalQty <= 0) return false;
      const last = getLastSoldDate(p.id);
      const daysSince = last
        ? Math.floor((todayMs - new Date(last).getTime()) / 86400000)
        : 9999;
      return daysSince >= threshold;
    });
  }, [products, batches, threshold, getLastSoldDate, todayMs]);

  const slowMovingItems = useMemo(() => {
    return products.filter((p) => {
      const totalQty = batches
        .filter((b) => b.productId === p.id)
        .reduce((s, b) => s + b.quantity, 0);
      if (totalQty <= 0) return false;
      const last = getLastSoldDate(p.id);
      const daysSince = last
        ? Math.floor((todayMs - new Date(last).getTime()) / 86400000)
        : 9999;
      return daysSince >= halfThreshold && daysSince < threshold;
    });
  }, [products, batches, halfThreshold, threshold, getLastSoldDate, todayMs]);

  const expiryWithin30 = expiryAlerts.length;

  // ── Recent Activity feed ────────────────────────────────────────────────────
  type ActivityItem =
    | {
        kind: "invoice";
        id: string;
        date: string;
        customerName: string;
        totalAmount: number;
      }
    | {
        kind: "txn";
        id: string;
        date: string;
        type: "in" | "out";
        quantity: number;
        unit: string;
        productName: string;
      };

  // Staff sees only their own invoices in activity feed
  const activityFeed: ActivityItem[] = useMemo(
    () =>
      [
        ...myInvoices.map((inv) => ({
          kind: "invoice" as const,
          id: inv.id,
          date: inv.date,
          customerName: inv.customerName || "Walk-in",
          totalAmount: inv.totalAmount,
        })),
        // Staff can't see stock transactions
        ...(isStaff
          ? []
          : transactions.map((tx) => {
              const p = products.find((pr) => pr.id === tx.productId);
              return {
                kind: "txn" as const,
                id: tx.id,
                date: tx.date,
                type: tx.type,
                quantity: tx.quantity,
                unit: p?.unit ?? "",
                productName: p?.name ?? "Unknown",
              };
            })),
      ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10),
    [myInvoices, transactions, products, isStaff],
  );

  // ── Over-sell map ───────────────────────────────────────────────────────────
  const overSellCount = useMemo(() => {
    const seen = new Set<string>();
    for (const inv of invoices) {
      for (const item of inv.items) {
        if (item.isOverSell) seen.add(item.productId);
      }
    }
    for (const p of products) {
      if (getProductStock(p.id) < 0) seen.add(p.id);
    }
    return seen.size;
  }, [invoices, products, getProductStock]);

  // ── Mark as Paid handlers ────────────────────────────────────────────────────
  const displayName =
    currentUser?.name || currentShop?.name || session?.mobile || "Admin";

  function openMarkPaid(key: string) {
    setMarkPaidOpen((prev) => ({
      ...prev,
      [key]: { amount: "", mode: "cash", saving: false, success: false },
    }));
  }
  function closeMarkPaid(key: string) {
    setMarkPaidOpen((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }
  function updateMarkPaid(key: string, patch: Partial<MarkPaidState>) {
    setMarkPaidOpen((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }
  async function handleSavePayment(
    key: string,
    customerName: string,
    customerMobile: string,
  ) {
    const state = markPaidOpen[key];
    if (!state) return;
    const amount = Number.parseFloat(state.amount);
    if (!state.amount || Number.isNaN(amount) || amount <= 0) {
      toast.error("Valid amount daalen");
      return;
    }
    updateMarkPaid(key, { saving: true });
    try {
      receivePayment(
        customerMobile,
        customerName,
        customerMobile,
        amount,
        "",
        state.mode,
      );
      updateMarkPaid(key, { saving: false, success: true });
      toast.success(`${fmt(amount)} payment save ho gaya!`);
      setTimeout(() => closeMarkPaid(key), 1500);
    } catch (_) {
      updateMarkPaid(key, { saving: false });
      toast.error("Payment save nahi hua, dobara try karein");
    }
  }

  // ── Greeting ─────────────────────────────────────────────────────────────────
  const h = new Date().getHours();
  const greeting =
    h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";

  // ═══════════════════════════════════════════════════════════════════════════
  // STAFF-ONLY DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════════
  if (isStaff) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f5f6fa]">
        <TopBar title="Dashboard" />
        <div className="flex flex-col gap-0 pb-28">
          {/* Header bar */}
          <div className="bg-white border-b border-border px-4 py-3 flex items-center justify-between gap-3 sticky top-0 z-30 shadow-sm">
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground font-medium">
                {greeting} 👋
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm font-bold text-foreground truncate">
                  {displayName}
                </h1>
                <RoleBadgeInline userRole="staff" />
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  data-ocid="dashboard.notification_bell.button"
                  type="button"
                  className="relative w-9 h-9 rounded-full bg-secondary/60 border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={16} className="text-foreground" />
                  {notifCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5">
                      {notifCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 p-0 shadow-lg">
                <div className="p-3 border-b border-border flex items-center gap-2">
                  <Bell size={13} className="text-primary" />
                  <span className="text-sm font-semibold">Notifications</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {lowStockItems.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground text-sm">
                      <CheckCircle size={22} className="text-green-500" />
                      Koi alert nahi ✅
                    </div>
                  ) : (
                    <div className="p-3">
                      <p className="text-[11px] font-semibold text-amber-600 uppercase mb-2">
                        Low Stock ({lowStockItems.length})
                      </p>
                      {lowStockItems.slice(0, 4).map((p) => (
                        <div
                          key={p.id}
                          className="flex justify-between text-xs py-0.5"
                        >
                          <span className="text-foreground truncate max-w-[140px]">
                            {p.name}
                          </span>
                          <span className="text-amber-600 font-medium ml-2">
                            {getProductStock(p.id)} {p.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Staff today summary — sales count + total only */}
          <div className="bg-white border-b border-border px-3 py-3">
            <div className="flex gap-2">
              <SummaryCard
                label="Meri Aaj Ki Sales"
                value={fmt(myTodaySales)}
                icon={ShoppingCart}
                colorClass="text-blue-700"
                bgClass="bg-blue-50"
                onClick={() => onNavigate("billing")}
                ocid="dashboard.staff.my_today_sales"
              />
              <SummaryCard
                label="Aaj Ke Invoices"
                value={String(myTodayInvoices.length)}
                icon={Receipt}
                colorClass="text-purple-700"
                bgClass="bg-purple-50"
                ocid="dashboard.staff.my_today_invoices"
              />
            </div>
          </div>

          {/* New Sale quick action */}
          <div className="bg-white border-b border-border px-3 py-2">
            <Button
              data-ocid="dashboard.new_sale.button"
              onClick={() => onNavigate("billing")}
              className="w-full bg-primary text-primary-foreground h-10 text-sm font-semibold"
            >
              <Receipt size={15} className="mr-2" /> New Sale Banayein
            </Button>
          </div>

          {/* My recent activity */}
          <div className="flex flex-col gap-4 px-3 pt-4">
            <div
              className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden"
              data-ocid="dashboard.recent_activity.section"
            >
              <div className="px-4 pt-4 pb-3 border-b border-border/60">
                <SectionHeader
                  icon="🕐"
                  title="Meri Recent Sales"
                  subtitle="Meri last 10 sales"
                  accent="blue"
                />
              </div>
              <div className="px-4 py-3">
                {activityFeed.length === 0 ? (
                  <div
                    data-ocid="dashboard.recent_activity.empty_state"
                    className="flex flex-col items-center gap-3 py-10 text-muted-foreground text-sm"
                  >
                    <Zap size={28} className="text-muted-foreground/30" />
                    <p>Abhi koi sales nahi</p>
                    <Button
                      size="sm"
                      onClick={() => onNavigate("billing")}
                      className="bg-primary text-primary-foreground"
                    >
                      <Receipt size={13} className="mr-1" /> Pehli Sale Karein
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-0.5">
                    {activityFeed.map((item, idx) => (
                      <div
                        key={item.id}
                        data-ocid={`dashboard.recent_activity.item.${idx + 1}`}
                        className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <ShoppingCart size={14} className="text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            {item.kind === "invoice" ? item.customerName : ""}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {item.kind === "invoice"
                              ? `Sale · ${fmt(item.totalAmount)}`
                              : ""}
                          </div>
                        </div>
                        <div className="text-[11px] text-muted-foreground flex-shrink-0 bg-secondary/50 px-2 py-0.5 rounded-full">
                          {relativeTime(item.date)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // OWNER / MANAGER DASHBOARD (full dashboard)
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col min-h-screen bg-[#f5f6fa]">
      <TopBar title="Dashboard" />

      {/* ── Page Wrapper ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-0 pb-28">
        {/* ── Header Bar: greeting + bell + user ───────────────────────────── */}
        <div className="bg-white border-b border-border px-4 py-3 flex items-center justify-between gap-3 sticky top-0 z-30 shadow-sm">
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground font-medium">
              {greeting} 👋
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm font-bold text-foreground truncate">
                {displayName}
              </h1>
              <RoleBadgeInline userRole={role} />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Notification Bell */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  data-ocid="dashboard.notification_bell.button"
                  type="button"
                  className="relative w-9 h-9 rounded-full bg-secondary/60 border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Bell size={16} className="text-foreground" />
                  {notifCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5">
                      {notifCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-72 p-0 shadow-lg"
                data-ocid="dashboard.notification_bell.popover"
              >
                <div className="p-3 border-b border-border flex items-center gap-2">
                  <Bell size={13} className="text-primary" />
                  <span className="text-sm font-semibold">Notifications</span>
                  {notifCount > 0 && (
                    <Badge className="bg-red-500 text-white border-0 text-[10px] ml-auto">
                      {notifCount}
                    </Badge>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-border">
                  {notifCount === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground text-sm">
                      <CheckCircle size={22} className="text-green-500" />
                      Koi alert nahi ✅
                    </div>
                  ) : (
                    <>
                      {lowStockItems.length > 0 && (
                        <div className="p-3">
                          <p className="text-[11px] font-semibold text-amber-600 uppercase mb-2">
                            Low Stock ({lowStockItems.length})
                          </p>
                          {lowStockItems.slice(0, 4).map((p) => (
                            <div
                              key={p.id}
                              className="flex justify-between text-xs py-0.5"
                            >
                              <span className="text-foreground truncate max-w-[140px]">
                                {p.name}
                              </span>
                              <span className="text-amber-600 font-medium ml-2">
                                {getProductStock(p.id)} {p.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {dueCustomers.length > 0 && (
                        <div className="p-3">
                          <p className="text-[11px] font-semibold text-red-600 uppercase mb-2">
                            Due Payments ({dueCustomers.length})
                          </p>
                          {dueCustomers.map((l) => (
                            <div
                              key={l.customerMobile || l.customerName}
                              className="flex justify-between text-xs py-0.5"
                            >
                              <span className="text-foreground truncate max-w-[140px]">
                                {l.customerName}
                              </span>
                              <span className="text-red-600 font-bold ml-2">
                                {fmt(l.totalDue)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {expiryAlerts.length > 0 && (
                        <div className="p-3">
                          <p className="text-[11px] font-semibold text-orange-500 uppercase mb-2">
                            Expiry ({expiryAlerts.length})
                          </p>
                          {expiryAlerts.slice(0, 3).map((a) => (
                            <div
                              key={a.batchId}
                              className="flex justify-between text-xs py-0.5"
                            >
                              <span className="text-foreground truncate max-w-[140px]">
                                {a.productName}
                              </span>
                              <span
                                className={`ml-2 font-medium ${a.daysLeft <= 0 ? "text-red-600" : "text-orange-500"}`}
                              >
                                {a.daysLeft <= 0
                                  ? "Expired"
                                  : `${a.daysLeft}d left`}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 1 — TOP SUMMARY (always visible)
        ════════════════════════════════════════════════════════════════════ */}
        <div className="bg-white border-b border-border px-3 py-3">
          <div className="flex gap-2">
            <SummaryCard
              label="Today Sales"
              value={fmt(todaySales)}
              icon={ShoppingCart}
              colorClass="text-blue-700"
              bgClass="bg-blue-50"
              onClick={() => onNavigate("reports")}
              ocid="dashboard.summary.today_sales"
            />
            <SummaryCard
              label="Cash Today"
              value={fmt(cashToday)}
              icon={Banknote}
              colorClass="text-green-700"
              bgClass="bg-green-50"
              onClick={() => onNavigate("reports")}
              ocid="dashboard.summary.cash_today"
            />
            <SummaryCard
              label="UPI Today"
              value={fmt(upiToday)}
              icon={Smartphone}
              colorClass="text-purple-700"
              bgClass="bg-purple-50"
              onClick={() => onNavigate("reports")}
              ocid="dashboard.summary.upi_today"
            />
            <SummaryCard
              label="Today Profit"
              value={fmt(todayProfit)}
              icon={TrendingUp}
              colorClass={
                todayProfit >= 0 ? "text-emerald-700" : "text-red-700"
              }
              bgClass={todayProfit >= 0 ? "bg-emerald-50" : "bg-red-50"}
              onClick={() => onNavigate("reports")}
              ocid="dashboard.summary.today_profit"
            />
          </div>
        </div>

        {/* ── Quick Action Bar ─────────────────────────────────────────────── */}
        <div className="bg-white border-b border-border px-3 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
          <Button
            data-ocid="dashboard.new_sale.button"
            size="sm"
            onClick={() => onNavigate("billing")}
            className="bg-primary text-primary-foreground h-8 text-xs px-3 flex-shrink-0"
          >
            <Receipt size={13} className="mr-1" /> New Sale
          </Button>
          <Button
            data-ocid="dashboard.add_stock.button"
            size="sm"
            variant="outline"
            onClick={() => onNavigate("stock")}
            className="h-8 text-xs px-3 flex-shrink-0"
          >
            <ArrowDownToLine size={13} className="mr-1" /> Add Stock
          </Button>
          {isOwner && (
            <Button
              data-ocid="dashboard.add_product.button"
              size="sm"
              variant="outline"
              onClick={() => onNavigate("admin")}
              className="h-8 text-xs px-3 flex-shrink-0"
            >
              <Plus size={13} className="mr-1" /> Add Product
            </Button>
          )}
          <Button
            data-ocid="dashboard.view_reports.button"
            size="sm"
            variant="outline"
            onClick={() => onNavigate("reports")}
            className="h-8 text-xs px-3 flex-shrink-0"
          >
            <BarChart2 size={13} className="mr-1" /> Reports
          </Button>
          <Button
            data-ocid="dashboard.customers.button"
            size="sm"
            variant="outline"
            onClick={() => onNavigate("customers")}
            className="h-8 text-xs px-3 flex-shrink-0"
          >
            <Users size={13} className="mr-1" /> Customers
          </Button>
          {isOwner && (
            <Button
              data-ocid="dashboard.staff_management.button"
              size="sm"
              variant="outline"
              onClick={() => onNavigate("staff-management")}
              className="h-8 text-xs px-3 flex-shrink-0"
            >
              <Users size={13} className="mr-1" /> Staff
            </Button>
          )}
        </div>

        {/* ─── Sections container ───────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 px-3 pt-4">
          {/* ── Admin Summary Card (Owner only) ────────────────────────────── */}
          <AdminSummaryCard />

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 2 — CRITICAL ALERTS
          ══════════════════════════════════════════════════════════════════ */}
          <div data-ocid="dashboard.critical_alerts.section">
            <SectionHeader
              icon="⚠️"
              title="Critical Alerts"
              subtitle="Urgent items needing attention"
              accent="red"
              badge={
                dueCustomers.length + outOfStockItems.length + overSellCount ===
                0 ? (
                  <Badge className="ml-2 bg-green-100 text-green-700 border-green-200 border text-[10px]">
                    All Clear ✅
                  </Badge>
                ) : (
                  <Badge className="ml-2 bg-red-100 text-red-700 border-red-200 border text-[10px]">
                    {dueCustomers.length +
                      outOfStockItems.length +
                      overSellCount}{" "}
                    Issues
                  </Badge>
                )
              }
            />
            <div className="flex gap-2 mt-3">
              <AlertCard
                icon={CreditCard}
                count={dueCustomers.length}
                label="High Due"
                sub="Customers"
                onClick={() => onNavigate("customers")}
                ocid="dashboard.critical.high_due"
              />
              <AlertCard
                icon={PackageX}
                count={outOfStockItems.length}
                label="Out of Stock"
                sub="Products"
                onClick={() => onNavigate("inventory")}
                ocid="dashboard.critical.out_of_stock"
              />
              <AlertCard
                icon={AlertCircle}
                count={overSellCount}
                label="Over Sell"
                sub="Products"
                onClick={() => onNavigate("inventory")}
                ocid="dashboard.critical.over_sell"
              />
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 3 — STOCK CONTROL
          ══════════════════════════════════════════════════════════════════ */}
          <div
            className="bg-white rounded-2xl shadow-sm border border-border p-4"
            data-ocid="dashboard.stock_control.section"
          >
            <SectionHeader
              icon="📦"
              title="Stock Control"
              subtitle="Current inventory status"
              accent="blue"
            />
            <div className="flex gap-2 mt-3">
              <StockCard
                icon={AlertTriangle}
                value={lowStockItems.length}
                label="Low Stock"
                sub="Below min level"
                color={lowStockItems.length > 0 ? "yellow" : "green"}
                onClick={() => onNavigate("inventory")}
                ocid="dashboard.stock.low_stock"
              />
              <StockCard
                icon={PackageX}
                value={outOfStockItems.length}
                label="Out of Stock"
                sub="Qty = 0 items"
                color={outOfStockItems.length > 0 ? "red" : "green"}
                onClick={() => onNavigate("inventory")}
                ocid="dashboard.stock.out_of_stock"
              />
              <StockCard
                icon={Wallet}
                value={fmt(totalValue)}
                label="Stock Value"
                sub="Current inventory"
                color="blue"
                onClick={() => onNavigate("inventory")}
                ocid="dashboard.stock.value"
              />
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 4 — PAYMENT CONTROL (Udhaar)
          ══════════════════════════════════════════════════════════════════ */}
          <div
            className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden"
            data-ocid="dashboard.payment_control.section"
          >
            <div className="px-4 pt-4 pb-3 border-b border-border/60">
              <div className="flex items-center justify-between gap-2">
                <SectionHeader
                  icon="💳"
                  title="Payment Control"
                  subtitle="Udhaar & pending dues"
                  accent="purple"
                />
                <button
                  type="button"
                  onClick={() => onNavigate("customers")}
                  className="text-[11px] text-primary font-medium hover:underline flex-shrink-0"
                >
                  View All →
                </button>
              </div>
              {totalDue > 0 && (
                <div className="mt-2 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <CreditCard
                    size={13}
                    className="text-red-600 flex-shrink-0"
                  />
                  <span className="text-xs text-red-700 font-medium">
                    Total Pending Due:
                  </span>
                  <span className="text-sm font-extrabold text-red-700 ml-auto">
                    {fmt(totalDue)}
                  </span>
                </div>
              )}
            </div>

            <div className="px-4 py-3">
              {dueCustomers.length === 0 ? (
                <div
                  data-ocid="dashboard.payment_control.empty_state"
                  className="flex items-center gap-2 justify-center py-5 text-green-600 text-sm font-medium"
                >
                  <CheckCircle size={17} />
                  Koi udhaar nahi ✅ — Sab clear hain!
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {dueCustomers.map((l, idx) => {
                    const key = l.customerMobile || l.customerName;
                    const panelState = markPaidOpen[key];
                    return (
                      <div
                        key={`${l.customerName}__${l.customerMobile}`}
                        data-ocid={`dashboard.payment_control.item.${idx + 1}`}
                        className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden"
                      >
                        <button
                          type="button"
                          className="flex items-center gap-2 px-3 py-2.5 w-full text-left"
                          onClick={() => onNavigate("customers")}
                        >
                          <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-[11px] font-bold text-amber-800">
                              {l.customerName.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-foreground truncate">
                              {l.customerName}
                            </div>
                            {l.customerMobile && (
                              <div className="text-[11px] text-muted-foreground">
                                {l.customerMobile.replace(
                                  /(\d{5})(\d{5})/,
                                  "$1*****",
                                )}
                              </div>
                            )}
                          </div>
                          <span className="text-base font-extrabold text-red-600 flex-shrink-0">
                            {fmt(l.totalDue)}
                          </span>
                        </button>
                        <div className="flex items-center gap-2 px-3 pb-2.5">
                          {l.customerMobile && (
                            <a
                              href={`https://wa.me/91${l.customerMobile}?text=${encodeURIComponent(
                                `Namaste ${l.customerName},\nAapka ₹${Math.round(l.totalDue).toLocaleString("en-IN")} baki hai.\n\nKripya jaldi payment kare.\n\nDhanyavaad 🙏\n${currentShop?.name ?? "Save Shop"}`,
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              data-ocid={`dashboard.payment_control.remind.${idx + 1}`}
                              className="flex items-center gap-1 text-[11px] text-green-700 font-medium bg-green-100 border border-green-200 rounded-lg px-2.5 py-1.5 hover:bg-green-200 transition-colors"
                            >
                              <MessageCircle size={12} />
                              Remind
                            </a>
                          )}
                          <Button
                            data-ocid={`dashboard.payment_control.mark_paid.${idx + 1}`}
                            size="sm"
                            variant={panelState ? "secondary" : "outline"}
                            className="text-[11px] h-7 border-amber-400 ml-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              panelState
                                ? closeMarkPaid(key)
                                : openMarkPaid(key);
                            }}
                          >
                            {panelState ? "Cancel" : "Mark as Paid"}
                          </Button>
                        </div>

                        {panelState && (
                          <div
                            data-ocid={`dashboard.payment_control.mark_paid_panel.${idx + 1}`}
                            className="border-t border-amber-200 bg-white px-3 py-3 flex flex-col gap-2.5"
                          >
                            {panelState.success ? (
                              <div className="flex items-center gap-2 text-green-600 text-sm font-medium justify-center py-2">
                                <CheckCircle size={16} /> Payment save ho gaya!
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground w-16 flex-shrink-0">
                                    Amount (₹)
                                  </span>
                                  <Input
                                    data-ocid={`dashboard.payment_control.amount.input.${idx + 1}`}
                                    type="number"
                                    min="1"
                                    placeholder="Amount..."
                                    value={panelState.amount}
                                    onChange={(e) =>
                                      updateMarkPaid(key, {
                                        amount: e.target.value,
                                      })
                                    }
                                    className="h-8 text-sm"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground w-16 flex-shrink-0">
                                    Mode
                                  </span>
                                  <div className="flex gap-1">
                                    {(
                                      ["cash", "upi", "online"] as PayMode[]
                                    ).map((m) => (
                                      <button
                                        key={m}
                                        type="button"
                                        data-ocid={`dashboard.payment_control.mode_${m}.${idx + 1}`}
                                        onClick={() =>
                                          updateMarkPaid(key, { mode: m })
                                        }
                                        className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                                          panelState.mode === m
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-white text-foreground border-border hover:bg-secondary"
                                        }`}
                                      >
                                        {m === "cash"
                                          ? "Cash"
                                          : m === "upi"
                                            ? "UPI"
                                            : "Online"}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex justify-end">
                                  <Button
                                    data-ocid={`dashboard.payment_control.save_payment.${idx + 1}`}
                                    size="sm"
                                    className="h-8 text-xs bg-primary"
                                    disabled={
                                      panelState.saving || !panelState.amount
                                    }
                                    onClick={() =>
                                      handleSavePayment(
                                        key,
                                        l.customerName,
                                        l.customerMobile,
                                      )
                                    }
                                  >
                                    {panelState.saving
                                      ? "Saving..."
                                      : "Save Payment"}
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 5 — SMART INSIGHTS
          ══════════════════════════════════════════════════════════════════ */}
          <div
            className="bg-white rounded-2xl shadow-sm border border-border p-4"
            data-ocid="dashboard.smart_insights.section"
          >
            <SectionHeader
              icon="📊"
              title="Smart Insights"
              subtitle="Sales analytics & patterns"
              accent="green"
            />
            <div className="flex flex-col gap-3 mt-3">
              {/* Most Selling */}
              <button
                type="button"
                className="rounded-xl border border-green-200 bg-green-50 p-3 active:scale-[0.99] transition-transform text-left w-full"
                data-ocid="dashboard.insights.most_selling"
                onClick={() => onNavigate("reports")}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Star size={13} className="text-green-600" />
                  <span className="text-xs font-bold text-green-700 uppercase tracking-wide">
                    Most Selling Products
                  </span>
                </div>
                {mostSellingProducts.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Abhi koi sales data nahi
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {mostSellingProducts.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-green-700 w-4">
                          #{i + 1}
                        </span>
                        <span className="text-xs font-medium text-foreground flex-1 truncate">
                          {item.name}
                        </span>
                        <Badge className="bg-green-100 text-green-700 border-green-200 border text-[10px]">
                          {item.qty} units
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </button>

              {/* High Profit Items */}
              <button
                type="button"
                className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 active:scale-[0.99] transition-transform text-left w-full"
                data-ocid="dashboard.insights.high_profit"
                onClick={() => onNavigate("reports")}
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={13} className="text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                    High Profit Items
                  </span>
                </div>
                {highProfitItems.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Abhi koi profit data nahi
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {highProfitItems.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-700 w-4">
                          #{i + 1}
                        </span>
                        <span className="text-xs font-medium text-foreground flex-1 truncate">
                          {item.name}
                        </span>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 border text-[10px]">
                          {fmt(item.profit)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </button>

              {/* Low Price Attempts — Owner only */}
              {isOwner && (
                <button
                  type="button"
                  className="rounded-xl border border-amber-200 bg-amber-50 p-3 active:scale-[0.99] transition-transform text-left w-full"
                  data-ocid="dashboard.insights.low_price"
                  onClick={() => onNavigate("low-price-log")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert size={13} className="text-amber-600" />
                      <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                        Low Price Attempts Today
                      </span>
                    </div>
                    <span
                      className={`text-xl font-extrabold ${lowPriceAttemptsToday > 0 ? "text-amber-700" : "text-green-600"}`}
                    >
                      {lowPriceAttemptsToday}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Tap to view full log →
                  </p>
                </button>
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 6 — INVENTORY HEALTH
          ══════════════════════════════════════════════════════════════════ */}
          <div
            className="bg-white rounded-2xl shadow-sm border border-border p-4"
            data-ocid="dashboard.inventory_health.section"
          >
            <SectionHeader
              icon="🏥"
              title="Inventory Health"
              subtitle="Expiry, dead & slow stock"
              accent="orange"
            />
            <div className="flex gap-2 mt-3">
              {appConfig.featureFlags.expiry && (
                <button
                  type="button"
                  data-ocid="dashboard.health.expiry"
                  onClick={() => onNavigate("inventory")}
                  className={`flex-1 min-w-0 flex flex-col gap-2 rounded-xl p-3 border active:scale-95 transition-transform text-left ${
                    expiryWithin30 > 0
                      ? "bg-orange-50 border-orange-300"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${expiryWithin30 > 0 ? "bg-orange-100" : "bg-green-100"}`}
                  >
                    <Clock
                      size={15}
                      className={
                        expiryWithin30 > 0
                          ? "text-orange-600"
                          : "text-green-600"
                      }
                    />
                  </div>
                  <span
                    className={`text-xl font-extrabold leading-none ${expiryWithin30 > 0 ? "text-orange-700" : "text-green-700"}`}
                  >
                    {expiryWithin30}
                  </span>
                  <div>
                    <div
                      className={`text-[11px] font-semibold ${expiryWithin30 > 0 ? "text-orange-700" : "text-green-700"}`}
                    >
                      Expiry Alert
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Within 30 days
                    </div>
                  </div>
                </button>
              )}
              {appConfig.featureFlags.deadStock && (
                <button
                  type="button"
                  data-ocid="dashboard.health.dead_stock"
                  onClick={() => onNavigate("inventory")}
                  className={`flex-1 min-w-0 flex flex-col gap-2 rounded-xl p-3 border active:scale-95 transition-transform text-left ${
                    deadStockItems.length > 0
                      ? "bg-red-50 border-red-300"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${deadStockItems.length > 0 ? "bg-red-100" : "bg-green-100"}`}
                  >
                    <Skull
                      size={15}
                      className={
                        deadStockItems.length > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }
                    />
                  </div>
                  <span
                    className={`text-xl font-extrabold leading-none ${deadStockItems.length > 0 ? "text-red-700" : "text-green-700"}`}
                  >
                    {deadStockItems.length}
                  </span>
                  <div>
                    <div
                      className={`text-[11px] font-semibold ${deadStockItems.length > 0 ? "text-red-700" : "text-green-700"}`}
                    >
                      Dead Stock
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {threshold}+ days unsold
                    </div>
                  </div>
                </button>
              )}
              <button
                type="button"
                data-ocid="dashboard.health.slow_moving"
                onClick={() => onNavigate("inventory")}
                className={`flex-1 min-w-0 flex flex-col gap-2 rounded-xl p-3 border active:scale-95 transition-transform text-left ${
                  slowMovingItems.length > 0
                    ? "bg-amber-50 border-amber-300"
                    : "bg-green-50 border-green-200"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${slowMovingItems.length > 0 ? "bg-amber-100" : "bg-green-100"}`}
                >
                  <TrendingDown
                    size={15}
                    className={
                      slowMovingItems.length > 0
                        ? "text-amber-600"
                        : "text-green-600"
                    }
                  />
                </div>
                <span
                  className={`text-xl font-extrabold leading-none ${slowMovingItems.length > 0 ? "text-amber-700" : "text-green-700"}`}
                >
                  {slowMovingItems.length}
                </span>
                <div>
                  <div
                    className={`text-[11px] font-semibold ${slowMovingItems.length > 0 ? "text-amber-700" : "text-green-700"}`}
                  >
                    Slow Moving
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {halfThreshold}+ days
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 7 — RECENT ACTIVITY
          ══════════════════════════════════════════════════════════════════ */}
          <div
            className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden"
            data-ocid="dashboard.recent_activity.section"
          >
            <div className="px-4 pt-4 pb-3 border-b border-border/60">
              <SectionHeader
                icon="🕐"
                title="Recent Activity"
                subtitle="Last 10 sales & stock updates"
                accent="blue"
              />
            </div>
            <div className="px-4 py-3">
              {activityFeed.length === 0 ? (
                <div
                  data-ocid="dashboard.recent_activity.empty_state"
                  className="flex flex-col items-center gap-2 py-8 text-muted-foreground text-sm"
                >
                  <Zap size={24} className="text-muted-foreground/40" />
                  No recent activity yet
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {activityFeed.map((item, idx) => (
                    <div
                      key={item.id}
                      data-ocid={`dashboard.recent_activity.item.${idx + 1}`}
                      className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          item.kind === "invoice"
                            ? "bg-green-100"
                            : item.kind === "txn" && item.type === "in"
                              ? "bg-blue-100"
                              : "bg-orange-100"
                        }`}
                      >
                        {item.kind === "invoice" ? (
                          <ShoppingCart size={14} className="text-green-600" />
                        ) : item.kind === "txn" && item.type === "in" ? (
                          <ArrowDownToLine
                            size={14}
                            className="text-blue-600"
                          />
                        ) : (
                          <ArrowUpFromLine
                            size={14}
                            className="text-orange-500"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {item.kind === "invoice"
                            ? item.customerName
                            : item.productName}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {item.kind === "invoice"
                            ? `Sale · ${fmt(item.totalAmount)}`
                            : `Stock ${item.type === "in" ? "In" : "Out"} · ${item.quantity} ${item.unit}`}
                        </div>
                      </div>
                      <div className="text-[11px] text-muted-foreground flex-shrink-0 bg-secondary/50 px-2 py-0.5 rounded-full">
                        {relativeTime(item.date)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Low Price Alert Summary (Owner only) ─────────────────────────── */}
          {isOwner && lowPriceAttemptsToday > 0 && (
            <button
              type="button"
              data-ocid="dashboard.low_price_banner"
              onClick={() => onNavigate("low-price-log")}
              className="bg-red-50 border border-red-200 rounded-2xl p-4 text-left active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-red-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-red-700">
                    ⚠️ Low Price Attempts Today
                  </p>
                  <p className="text-xs text-red-600 mt-0.5">
                    {lowPriceAttemptsToday} attempt
                    {lowPriceAttemptsToday !== 1 ? "s" : ""} recorded — Tap to
                    view full log
                  </p>
                </div>
                <Badge className="bg-red-600 text-white border-0 text-xs flex-shrink-0">
                  {lowPriceAttemptsToday}
                </Badge>
              </div>
            </button>
          )}

          {/* ── Empty State for fresh shop ────────────────────────────────────── */}
          {products.length === 0 && invoices.length === 0 && (
            <div
              className="rounded-2xl border border-dashed border-muted-foreground/30 bg-white p-6 text-center"
              data-ocid="dashboard.empty_state"
            >
              <Package
                size={32}
                className="mx-auto text-muted-foreground/40 mb-3"
              />
              <p className="font-semibold text-base text-foreground mb-1">
                Shop abhi khali hai
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Admin Panel mein product add karein, phir dashboard mein data
                dikhega.
              </p>
              {isOwner && (
                <Button
                  size="sm"
                  onClick={() => onNavigate("admin")}
                  className="bg-primary text-primary-foreground"
                >
                  <Plus size={14} className="mr-1" /> Pehla Product Add Karein
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
