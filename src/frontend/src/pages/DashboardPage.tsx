import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Banknote,
  BarChart2,
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
  Star,
  ThumbsDown,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminSummaryCard } from "../components/AdminSummaryCard";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import type { AppUser, NavPage, UserRole } from "../types/store";

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

// ─── Smart Summary Card ───────────────────────────────────────────────────────
function SmartSummaryCard({
  icon,
  label,
  value,
  sub,
  colorScheme,
  onClick,
  ocid,
  hidden,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  colorScheme: "blue" | "green" | "red" | "amber" | "purple" | "emerald";
  onClick?: () => void;
  ocid?: string;
  hidden?: boolean;
}) {
  if (hidden) {
    // Placeholder to maintain grid layout
    return <div className="flex-1 min-w-0 rounded-xl bg-transparent" />;
  }

  const schemes = {
    blue: {
      bg: "bg-card",
      border: "border-border",
      icon: "text-blue-500",
      label: "text-muted-foreground",
      value: "text-foreground",
      iconBg: "bg-blue-100",
    },
    green: {
      bg: "bg-card",
      border: "border-border",
      icon: "text-green-500",
      label: "text-muted-foreground",
      value: "text-foreground",
      iconBg: "bg-green-100",
    },
    red: {
      bg: "bg-card",
      border: "border-border",
      icon: "text-red-500",
      label: "text-muted-foreground",
      value: "text-red-600",
      iconBg: "bg-red-100",
    },
    amber: {
      bg: "bg-card",
      border: "border-border",
      icon: "text-amber-500",
      label: "text-muted-foreground",
      value: "text-foreground",
      iconBg: "bg-amber-100",
    },
    purple: {
      bg: "bg-card",
      border: "border-border",
      icon: "text-primary",
      label: "text-muted-foreground",
      value: "text-foreground",
      iconBg: "bg-primary/10",
    },
    emerald: {
      bg: "bg-card",
      border: "border-border",
      icon: "text-green-600",
      label: "text-muted-foreground",
      value: "text-green-600",
      iconBg: "bg-green-100",
    },
  }[colorScheme];

  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={onClick}
      className={`flex-1 min-w-0 flex flex-col gap-2 rounded-xl p-3 border shadow-card ${schemes.bg} ${schemes.border} active:scale-95 transition-transform duration-150 text-left`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${schemes.iconBg} flex-shrink-0`}
      >
        <span className={schemes.icon}>{icon}</span>
      </div>
      <div className="min-w-0">
        <div
          className={`text-[10px] font-semibold uppercase tracking-wide ${schemes.label} leading-none mb-1`}
        >
          {label}
        </div>
        <div
          className={`text-lg font-extrabold ${schemes.value} leading-none truncate`}
        >
          {value}
        </div>
        {sub && (
          <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
            {sub}
          </div>
        )}
      </div>
    </button>
  );
}

// ─── Quick Action Button ──────────────────────────────────────────────────────
function QuickActionBtn({
  emoji,
  label,
  onClick,
  colorScheme,
  ocid,
  badge,
}: {
  emoji: string;
  label: string;
  onClick: () => void;
  colorScheme: "blue" | "green" | "orange" | "teal";
  ocid?: string;
  badge?: number;
}) {
  const schemes = {
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
    green: "bg-green-600 hover:bg-green-700 text-white",
    orange: "bg-orange-500 hover:bg-orange-600 text-white",
    teal: "bg-teal-600 hover:bg-teal-700 text-white",
  }[colorScheme];

  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
      <button
        type="button"
        data-ocid={ocid}
        onClick={onClick}
        className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm active:scale-95 transition-transform duration-150 ${schemes}`}
        aria-label={label}
      >
        <span className="text-2xl leading-none">{emoji}</span>
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1 border-2 border-card">
            {badge}
          </span>
        )}
      </button>
      <span className="text-[11px] font-semibold text-foreground text-center leading-tight max-w-[60px]">
        {label}
      </span>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({
  name,
  stock,
  unit,
  sellingPrice,
  profitPct,
  showProfit,
  onClick,
  ocid,
}: {
  name: string;
  stock: number;
  unit: string;
  sellingPrice: number;
  profitPct: number | null;
  showProfit: boolean;
  onClick: () => void;
  ocid?: string;
}) {
  const isProfit = profitPct !== null && profitPct > 0;

  const cardBg =
    showProfit && profitPct !== null
      ? isProfit
        ? "bg-card border-l-4 border-l-green-400 border-border shadow-card"
        : "bg-card border-l-4 border-l-red-400 border-border shadow-card"
      : "bg-card border-border shadow-card";

  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={onClick}
      className={`flex flex-col gap-2 rounded-xl p-3 border ${cardBg} active:scale-[0.97] transition-transform duration-150 text-left w-full`}
    >
      <div className="flex items-start justify-between gap-1">
        <p className="text-sm font-bold text-foreground leading-tight line-clamp-2 flex-1 min-w-0">
          {name}
        </p>
        {showProfit && profitPct !== null && (
          <span
            className={`flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              isProfit ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {isProfit ? "+" : ""}
            {profitPct.toFixed(0)}%
          </span>
        )}
        {showProfit && profitPct === null && (
          <span className="flex-shrink-0 text-[10px] text-muted-foreground px-1.5">
            —
          </span>
        )}
        {!showProfit && (
          <span className="flex-shrink-0 text-[10px] text-muted-foreground px-1.5">
            —
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-1">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground">Stock</span>
          <span
            className={`text-sm font-extrabold ${
              stock <= 0
                ? "text-red-600"
                : stock <= 5
                  ? "text-amber-600"
                  : "text-foreground"
            }`}
          >
            {stock} {unit}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-muted-foreground">Price</span>
          <span className="text-sm font-bold text-foreground">
            {fmt(sellingPrice)}
          </span>
        </div>
      </div>
    </button>
  );
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
    getPendingReminderRequests,
    approveReminderRequest,
    rejectReminderRequest,
    purchaseOrders,
    customerOrders,
  } = useStore();

  const { currentShop, session, currentUser } = useAuth();

  const role = currentUser?.role ?? "staff";
  const isOwner = role === "owner";
  const isStaff = role === "staff";

  const [productTab, setProductTab] = useState<
    "all" | "highProfit" | "lowStock" | "fastSelling"
  >("all");

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

  // ── Staff-filtered invoices ────────────────────────────────────────────────
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
  const top3DueCustomers = dueCustomers.slice(0, 3);
  const totalDue = allLedgers
    .filter((l) => l.totalDue > 0)
    .reduce((s, l) => s + l.totalDue, 0);

  // ── Expiry alerts ──────────────────────────────────────────────────────────
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

  // ── Total alerts count (for Summary Card #4) ───────────────────────────────
  const totalAlertsCount =
    lowStockItems.length +
    outOfStockItems.length +
    (isStaff ? 0 : dueCustomers.length + expiryAlerts.length);

  // ── Low profit alert: margin < 10% ─────────────────────────────────────────
  const profitMarginLow = todaySales > 0 && todayProfit / todaySales < 0.1;

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

  // ── Fast selling (last 30 days) ─────────────────────────────────────────────
  const thirtyDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.getTime();
  }, []);

  const fastSellingMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const inv of invoices) {
      if (new Date(inv.date).getTime() < thirtyDaysAgo) continue;
      for (const item of inv.items) {
        map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity);
      }
    }
    return map;
  }, [invoices, thirtyDaysAgo]);

  // ── Product tabs ────────────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    const withStock = products.map((p) => ({
      ...p,
      currentStock: getProductStock(p.id),
      profitPct:
        p.purchasePrice && p.purchasePrice > 0
          ? ((p.sellingPrice - p.purchasePrice) / p.purchasePrice) * 100
          : null,
    }));

    switch (productTab) {
      case "highProfit":
        return withStock
          .filter((p) => p.profitPct !== null && p.profitPct > 20)
          .sort((a, b) => (b.profitPct ?? 0) - (a.profitPct ?? 0));
      case "lowStock":
        return withStock
          .filter(
            (p) => p.currentStock > 0 && p.currentStock <= p.minStockAlert,
          )
          .sort((a, b) => a.currentStock - b.currentStock);
      case "fastSelling":
        return withStock
          .map((p) => ({
            ...p,
            sold30: fastSellingMap.get(p.id) ?? 0,
          }))
          .filter((p) => p.sold30 > 0)
          .sort((a, b) => b.sold30 - a.sold30);
      default:
        return withStock;
    }
  }, [products, productTab, getProductStock, fastSellingMap]);

  // ── Recent Activity feed ─────────────────────────────────────────────────────
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

  // ── Over-sell count ──────────────────────────────────────────────────────────
  // (Included in outOfStockItems; kept here for future use)
  const _overSellCount = useMemo(() => {
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
  void _overSellCount;

  // ── Mark as Paid handlers ─────────────────────────────────────────────────
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

  // ── Greeting ──────────────────────────────────────────────────────────────
  const h = new Date().getHours();
  const greeting =
    h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";

  // ── Pending Orders ────────────────────────────────────────────────────────
  const pendingVendorOrders = purchaseOrders.filter(
    (po) => po.status === "pending",
  ).length;
  const pendingCustomerOrders = customerOrders.filter(
    (co) => co.status === "pending",
  ).length;

  // ═══════════════════════════════════════════════════════════════════════════
  // STAFF-ONLY DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════════
  if (isStaff) {
    return (
      <div className="flex flex-col min-h-screen bg-background pb-28">
        {/* Staff greeting strip */}
        <div className="bg-primary/5 border-b border-border px-4 py-2.5">
          <p className="text-xs text-muted-foreground">
            {greeting} 👋{" "}
            <span className="font-semibold text-foreground">{displayName}</span>
            <RoleBadgeInline userRole="staff" />
          </p>
        </div>

        <div className="flex flex-col gap-4 px-3 pt-4">
          {/* Staff Summary Cards */}
          <div className="grid grid-cols-2 gap-2">
            <SmartSummaryCard
              icon={<ShoppingCart size={16} />}
              label="Meri Sales"
              value={fmt(myTodaySales)}
              sub="Aaj ki"
              colorScheme="blue"
              onClick={() => onNavigate("billing")}
              ocid="dashboard.staff.my_today_sales"
            />
            <SmartSummaryCard
              icon={<Receipt size={16} />}
              label="Invoices"
              value={String(myTodayInvoices.length)}
              sub="Aaj ke"
              colorScheme="purple"
              ocid="dashboard.staff.my_today_invoices"
            />
            <SmartSummaryCard
              icon={<AlertTriangle size={16} />}
              label="Low Stock"
              value={String(lowStockItems.length)}
              sub="Items"
              colorScheme={lowStockItems.length > 0 ? "amber" : "green"}
              onClick={() => onNavigate("inventory")}
              ocid="dashboard.staff.low_stock"
            />
            <SmartSummaryCard
              icon={<PackageX size={16} />}
              label="Out of Stock"
              value={String(outOfStockItems.length)}
              sub="Items"
              colorScheme={outOfStockItems.length > 0 ? "red" : "green"}
              onClick={() => onNavigate("inventory")}
              ocid="dashboard.staff.out_of_stock"
            />
          </div>

          {/* Staff Quick Actions */}
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
              Quick Actions
            </p>
            <div className="flex gap-4 justify-around">
              <QuickActionBtn
                emoji="📦"
                label="Add Stock"
                onClick={() => onNavigate("stock")}
                colorScheme="green"
                ocid="dashboard.add_stock.button"
              />
              <QuickActionBtn
                emoji="💸"
                label="Sell"
                onClick={() => onNavigate("billing")}
                colorScheme="blue"
                ocid="dashboard.new_sale.button"
              />
              <QuickActionBtn
                emoji="💰"
                label="Collect Payment"
                onClick={() => onNavigate("cash-counter")}
                colorScheme="orange"
                ocid="dashboard.staff.collect_payment.button"
              />
            </div>
          </div>

          {/* Staff Recent Activity */}
          <div
            className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden"
            data-ocid="dashboard.recent_activity.section"
          >
            <div className="px-4 pt-3 pb-2.5 border-b border-border/60 flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">
                🕐 Recent Sales
              </span>
              <span className="text-[11px] text-muted-foreground">Last 10</span>
            </div>
            <div className="px-4 py-3">
              {activityFeed.length === 0 ? (
                <div
                  data-ocid="dashboard.recent_activity.empty_state"
                  className="flex flex-col items-center gap-3 py-8 text-muted-foreground text-sm"
                >
                  <Zap size={26} className="text-muted-foreground/30" />
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
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // OWNER / MANAGER DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════════

  const tabLabels: { key: typeof productTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "highProfit", label: "High Profit" },
    { key: "lowStock", label: "Low Stock" },
    { key: "fastSelling", label: "Fast Selling" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background pb-28">
      {/* Greeting strip */}
      <div className="bg-primary/5 border-b border-border px-4 py-2">
        <p className="text-xs text-muted-foreground">
          {greeting} 👋{" "}
          <span className="font-semibold text-foreground">{displayName}</span>{" "}
          <RoleBadgeInline userRole={role} />
        </p>
      </div>

      <div className="flex flex-col gap-4 px-3 pt-3">
        {/* ══════════════════════════════════════════════════════════════════
            SECTION 1 — SMART SUMMARY CARDS (2×2 on mobile, 4-in-a-row on md+)
        ══════════════════════════════════════════════════════════════════ */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-2"
          data-ocid="dashboard.summary.section"
        >
          {/* Card 1: Total Sale */}
          <SmartSummaryCard
            icon={<ShoppingCart size={16} />}
            label="Total Sale"
            value={fmt(todaySales)}
            sub="Aaj ka"
            colorScheme="blue"
            onClick={() => onNavigate("reports")}
            ocid="dashboard.summary.today_sales"
          />

          {/* Card 2: Profit (hidden from staff, already handled above) */}
          <SmartSummaryCard
            icon={<TrendingUp size={16} />}
            label="Profit"
            value={fmt(todayProfit)}
            sub="Aaj ka"
            colorScheme={todayProfit >= 0 ? "emerald" : "red"}
            onClick={() => onNavigate("reports")}
            ocid="dashboard.summary.today_profit"
          />

          {/* Card 3: Cash / UPI split */}
          <button
            type="button"
            data-ocid="dashboard.summary.cash_upi"
            onClick={() => onNavigate("reports")}
            className="flex flex-col gap-1.5 rounded-xl p-3 border border-border bg-card shadow-card active:scale-95 transition-transform duration-150 text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Banknote size={16} className="text-primary" />
            </div>
            <div className="min-w-0 w-full">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground leading-none mb-1.5">
                Cash / Online
              </div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[11px] text-muted-foreground">
                  💵 Cash
                </span>
                <span className="text-sm font-bold text-foreground">
                  {fmt(cashToday)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[11px] text-muted-foreground">
                  📱 UPI
                </span>
                <span className="text-sm font-bold text-foreground">
                  {fmt(upiToday)}
                </span>
              </div>
              <div className="border-t border-border/60 pt-1 flex items-center justify-between gap-1">
                <span className="text-[11px] font-semibold text-foreground">
                  Total
                </span>
                <span className="text-sm font-bold text-primary">
                  {fmt(cashToday + upiToday)}
                </span>
              </div>
            </div>
          </button>

          {/* Card 4: Alerts count */}
          <SmartSummaryCard
            icon={<AlertCircle size={16} />}
            label="Alerts"
            value={String(totalAlertsCount)}
            sub={totalAlertsCount === 0 ? "All clear ✅" : "Active"}
            colorScheme={
              totalAlertsCount === 0
                ? "green"
                : totalAlertsCount > 5
                  ? "red"
                  : "amber"
            }
            onClick={() => onNavigate("inventory")}
            ocid="dashboard.summary.alerts"
          />
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 2 — QUICK ACTION BUTTONS
        ══════════════════════════════════════════════════════════════════ */}
        <div
          className="bg-card rounded-2xl border border-border p-4"
          data-ocid="dashboard.quick_actions.section"
        >
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
            Quick Actions
          </p>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            <QuickActionBtn
              emoji="📦"
              label="Add Stock"
              onClick={() => onNavigate("stock")}
              colorScheme="green"
              ocid="dashboard.add_stock.button"
            />
            <QuickActionBtn
              emoji="👨‍💼"
              label="Add Staff"
              onClick={() => onNavigate("staff-management")}
              colorScheme="blue"
              ocid="dashboard.add_staff.button"
            />
            <QuickActionBtn
              emoji="💸"
              label="Sell"
              onClick={() => onNavigate("billing")}
              colorScheme="teal"
              ocid="dashboard.new_sale.button"
            />
            <QuickActionBtn
              emoji="💰"
              label="Collect Payment"
              onClick={() => onNavigate("cash-counter")}
              colorScheme="orange"
              ocid="dashboard.collect_payment.button"
            />
            {isOwner && (
              <QuickActionBtn
                emoji="📊"
                label="View Reports"
                onClick={() => onNavigate("reports")}
                colorScheme="blue"
                ocid="dashboard.view_reports.button"
              />
            )}
            <QuickActionBtn
              emoji="👥"
              label="Customers"
              onClick={() => onNavigate("customers")}
              colorScheme="orange"
              ocid="dashboard.customers.button"
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 3 — SMART ALERT CARD
        ══════════════════════════════════════════════════════════════════ */}
        <div
          className="bg-card rounded-2xl border border-border overflow-hidden"
          data-ocid="dashboard.smart_alerts.section"
        >
          <div className="px-4 pt-3 pb-2.5 border-b border-border/60 flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">
              ⚠️ Smart Alerts
            </span>
            {totalAlertsCount === 0 ? (
              <Badge className="bg-green-100 text-green-700 border-green-200 border text-[10px] ml-auto">
                ✅ All Clear
              </Badge>
            ) : (
              <Badge className="bg-red-100 text-red-700 border-red-200 border text-[10px] ml-auto">
                {totalAlertsCount} Active
              </Badge>
            )}
          </div>

          {totalAlertsCount === 0 && !profitMarginLow ? (
            <div className="px-4 py-5 flex items-center gap-3">
              <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
              <span className="text-sm text-green-700 font-medium">
                Sab kuch sahi hai — koi alert nahi ✅
              </span>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {/* Low Stock */}
              {lowStockItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => onNavigate("inventory")}
                  data-ocid="dashboard.alerts.low_stock"
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50/50 active:bg-amber-50 transition-colors text-left border-l-4 border-l-amber-400"
                >
                  <AlertTriangle
                    size={16}
                    className="text-amber-500 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-amber-800">
                      Low Stock Alert
                    </div>
                    <div className="text-[11px] text-amber-600">
                      {lowStockItems.length} item
                      {lowStockItems.length !== 1 ? "s" : ""} neeche minimum
                      level
                    </div>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 border-amber-300 border text-[10px] flex-shrink-0">
                    {lowStockItems.length}
                  </Badge>
                </button>
              )}

              {/* Low Profit (owner/manager only) */}
              {!isStaff && profitMarginLow && todaySales > 0 && (
                <button
                  type="button"
                  onClick={() => onNavigate("reports")}
                  data-ocid="dashboard.alerts.low_profit"
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50/50 active:bg-red-50 transition-colors text-left border-l-4 border-l-red-500"
                >
                  <TrendingDown
                    size={16}
                    className="text-red-500 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-red-700">
                      Low Profit Alert
                    </div>
                    <div className="text-[11px] text-red-600">
                      Aaj ka profit margin 10% se kum hai
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-700 border-red-200 border text-[10px] flex-shrink-0">
                    ⚠️
                  </Badge>
                </button>
              )}

              {/* Payment Due (owner/manager only) */}
              {!isStaff && dueCustomers.length > 0 && (
                <button
                  type="button"
                  onClick={() => onNavigate("customers")}
                  data-ocid="dashboard.alerts.payment_due"
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50/50 active:bg-red-50 transition-colors text-left border-l-4 border-l-red-500"
                >
                  <CreditCard
                    size={16}
                    className="text-red-500 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-red-700">
                      Payment Due Alert
                    </div>
                    <div className="text-[11px] text-red-600">
                      {fmt(totalDue)} pending — {dueCustomers.length} customer
                      {dueCustomers.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-700 border-red-200 border text-[10px] flex-shrink-0">
                    {dueCustomers.length}
                  </Badge>
                </button>
              )}

              {/* Out of Stock */}
              {outOfStockItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => onNavigate("inventory")}
                  data-ocid="dashboard.alerts.out_of_stock"
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50/50 active:bg-red-50 transition-colors text-left border-l-4 border-l-red-600"
                >
                  <PackageX size={16} className="text-red-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-red-700">
                      Out of Stock
                    </div>
                    <div className="text-[11px] text-red-600">
                      {outOfStockItems.length} product
                      {outOfStockItems.length !== 1 ? "s" : ""} ka stock khatam
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-700 border-red-200 border text-[10px] flex-shrink-0">
                    {outOfStockItems.length}
                  </Badge>
                </button>
              )}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 4 — CUSTOMER DUE (CRED-style)
        ══════════════════════════════════════════════════════════════════ */}
        {!isStaff && (
          <div
            className="bg-card rounded-2xl border border-border overflow-hidden"
            data-ocid="dashboard.customer_due.section"
          >
            <div className="px-4 pt-3 pb-2.5 border-b border-border/60 flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">
                💳 Customer Due
              </span>
              <button
                type="button"
                onClick={() => onNavigate("customers")}
                className="text-[11px] text-primary font-semibold hover:underline"
              >
                View All →
              </button>
            </div>

            {totalDue > 0 && (
              <div className="px-4 py-2 border-b border-border flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground font-medium">
                  Total Pending
                </span>
                <span className="text-lg font-extrabold text-red-600">
                  {fmt(totalDue)}
                </span>
              </div>
            )}

            {top3DueCustomers.length === 0 ? (
              <div
                data-ocid="dashboard.customer_due.empty_state"
                className="flex items-center gap-2 justify-center py-5 text-green-600 text-sm font-medium"
              >
                <CheckCircle size={17} />
                Koi udhaar nahi ✅
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {top3DueCustomers.map((l, idx) => {
                  const key = l.customerMobile || l.customerName;
                  const panelState = markPaidOpen[key];
                  return (
                    <div
                      key={`${l.customerName}__${l.customerMobile}`}
                      data-ocid={`dashboard.customer_due.item.${idx + 1}`}
                    >
                      {/* Customer row */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">
                            {l.customerName.slice(0, 1).toUpperCase()}
                          </span>
                        </div>

                        {/* Name + mobile */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-foreground truncate">
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

                        {/* Due amount (large, bold red) */}
                        <div className="flex flex-col items-end flex-shrink-0">
                          <span
                            className={`text-base font-extrabold ${
                              l.totalDue > 5000
                                ? "text-red-600"
                                : l.totalDue > 500
                                  ? "text-amber-600"
                                  : "text-foreground"
                            }`}
                          >
                            {fmt(l.totalDue)}
                          </span>
                          <span
                            className={`text-[9px] font-medium px-1.5 py-0 rounded-full border ${
                              l.totalDue > 5000
                                ? "bg-red-100 text-red-700 border-red-300"
                                : l.totalDue > 500
                                  ? "bg-amber-100 text-amber-700 border-amber-300"
                                  : "bg-green-100 text-green-700 border-green-300"
                            }`}
                          >
                            {l.totalDue > 5000
                              ? "🔴 High"
                              : l.totalDue > 500
                                ? "🟡 Medium"
                                : "🟢 Low"}
                          </span>
                        </div>
                      </div>

                      {/* Action row: Remind + Mark Paid */}
                      <div className="flex items-center gap-2 px-4 pb-3">
                        {l.customerMobile && (
                          <a
                            href={`https://wa.me/91${l.customerMobile}?text=${encodeURIComponent(
                              `Namaste ${l.customerName},\nAapka ₹${Math.round(l.totalDue).toLocaleString("en-IN")} baki hai.\n\nKripya jaldi payment kare.\n\nDhanyavaad 🙏\n${currentShop?.name ?? "Save Shop"}`,
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-ocid={`dashboard.customer_due.remind.${idx + 1}`}
                            className="flex items-center gap-1.5 text-xs text-green-700 font-semibold bg-green-100 border border-green-200 rounded-lg px-3 py-1.5 hover:bg-green-200 transition-colors"
                          >
                            <MessageCircle size={12} />
                            Send Reminder 🔔
                          </a>
                        )}
                        <Button
                          data-ocid={`dashboard.customer_due.mark_paid.${idx + 1}`}
                          size="sm"
                          variant={panelState ? "secondary" : "outline"}
                          className="text-xs h-7 ml-auto border-amber-300 text-amber-700 hover:bg-amber-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            panelState ? closeMarkPaid(key) : openMarkPaid(key);
                          }}
                        >
                          {panelState ? "Cancel" : "Mark as Paid"}
                        </Button>
                      </div>

                      {/* Mark Paid Panel */}
                      {panelState && (
                        <div
                          data-ocid={`dashboard.customer_due.mark_paid_panel.${idx + 1}`}
                          className="border-t border-border bg-secondary/20 px-4 py-3 flex flex-col gap-2.5"
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
                                  data-ocid={`dashboard.customer_due.amount.input.${idx + 1}`}
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
                                  {(["cash", "upi", "online"] as PayMode[]).map(
                                    (m) => (
                                      <button
                                        key={m}
                                        type="button"
                                        data-ocid={`dashboard.customer_due.mode_${m}.${idx + 1}`}
                                        onClick={() =>
                                          updateMarkPaid(key, { mode: m })
                                        }
                                        className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                                          panelState.mode === m
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-background text-foreground border-border hover:bg-secondary"
                                        }`}
                                      >
                                        {m === "cash"
                                          ? "Cash"
                                          : m === "upi"
                                            ? "UPI"
                                            : "Online"}
                                      </button>
                                    ),
                                  )}
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <Button
                                  data-ocid={`dashboard.customer_due.save_payment.${idx + 1}`}
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
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 5 — PENDING REMINDER REQUESTS (Owner/Manager only)
        ══════════════════════════════════════════════════════════════════ */}
        {!isStaff &&
          (() => {
            const pendingReqs = getPendingReminderRequests();
            if (pendingReqs.length === 0) return null;
            return (
              <div
                className="bg-card rounded-2xl shadow-card border border-border overflow-hidden"
                data-ocid="dashboard.pending_reminders.section"
              >
                <div className="px-4 pt-3 pb-2.5 border-b border-border/60 flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">
                    ⏳ Pending Reminder Requests
                  </span>
                  <Badge className="bg-secondary text-foreground border-border border text-[10px] ml-auto">
                    {pendingReqs.length}
                  </Badge>
                </div>
                <div className="px-4 py-3 flex flex-col gap-2">
                  {pendingReqs.map((req, idx) => (
                    <div
                      key={req.id}
                      data-ocid={`dashboard.pending_reminder.item.${idx + 1}`}
                      className="flex flex-col gap-2 p-3 rounded-xl border border-border bg-secondary/30"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground">
                          {req.staffName}
                          <span className="text-xs font-normal text-muted-foreground ml-1">
                            (Staff)
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Reminder for:{" "}
                          <span className="font-medium text-foreground">
                            {req.customerName}
                          </span>
                          {req.customerMobile && ` · ${req.customerMobile}`}
                        </div>
                        <div className="text-xs text-red-600 font-semibold mt-0.5">
                          Due: ₹
                          {Math.round(req.dueAmount).toLocaleString("en-IN")}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Requested: {relativeTime(req.requestedAt)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                          data-ocid={`dashboard.pending_reminder.approve.${idx + 1}`}
                          onClick={async () => {
                            if (!currentUser) return;
                            await approveReminderRequest(
                              req.id,
                              currentUser as unknown as AppUser,
                            );
                            toast.success(
                              "✅ Reminder approve kiya — WhatsApp khul gaya",
                            );
                          }}
                        >
                          <ThumbsUp size={11} className="mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-7 text-xs text-red-600 border-red-300 hover:bg-red-50"
                          data-ocid={`dashboard.pending_reminder.reject.${idx + 1}`}
                          onClick={async () => {
                            if (!currentUser) return;
                            await rejectReminderRequest(
                              req.id,
                              currentUser as unknown as AppUser,
                            );
                            toast.info("Request reject kar di gayi");
                          }}
                        >
                          <ThumbsDown size={11} className="mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

        {/* ══════════════════════════════════════════════════════════════════
            ADMIN SUMMARY CARD (Owner only — existing component)
        ══════════════════════════════════════════════════════════════════ */}
        {isOwner && <AdminSummaryCard />}

        {/* ══════════════════════════════════════════════════════════════════
            PENDING ORDERS WIDGET
        ══════════════════════════════════════════════════════════════════ */}
        {(pendingVendorOrders > 0 || pendingCustomerOrders > 0) && (
          <div
            className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
            data-ocid="dashboard.pending_orders.section"
          >
            <div className="px-4 pt-3 pb-2.5 border-b border-border/60 flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">
                🛒 Pending Orders
              </span>
              <Badge className="ml-auto bg-secondary text-foreground border-border border text-[10px]">
                {pendingVendorOrders + pendingCustomerOrders} Pending
              </Badge>
            </div>
            <div className="flex gap-2 p-3">
              <button
                type="button"
                data-ocid="dashboard.pending_orders.vendor_orders"
                onClick={() => onNavigate("purchase-orders")}
                className="flex-1 flex flex-col gap-1.5 rounded-xl p-3 bg-card border border-border border-l-4 border-l-amber-400 shadow-card active:scale-95 transition-transform text-left"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-semibold text-foreground">
                    Vendor Orders
                  </span>
                  <ShoppingCart size={13} className="text-muted-foreground" />
                </div>
                <span className="text-2xl font-extrabold text-foreground leading-none">
                  {pendingVendorOrders}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Tap to view →
                </span>
              </button>
              <button
                type="button"
                data-ocid="dashboard.pending_orders.customer_orders"
                onClick={() => onNavigate("customer-orders")}
                className="flex-1 flex flex-col gap-1.5 rounded-xl p-3 bg-card border border-border border-l-4 border-l-primary shadow-card active:scale-95 transition-transform text-left"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-semibold text-foreground">
                    Customer Orders
                  </span>
                  <Receipt size={13} className="text-muted-foreground" />
                </div>
                <span className="text-2xl font-extrabold text-foreground leading-none">
                  {pendingCustomerOrders}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Tap to view →
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 6 — PRODUCT TABS + PRODUCT CARDS
        ══════════════════════════════════════════════════════════════════ */}
        <div
          className="bg-card rounded-2xl border border-border overflow-hidden"
          data-ocid="dashboard.products.section"
        >
          {/* Tab bar */}
          <div className="flex gap-0 border-b border-border overflow-x-auto scrollbar-hide">
            {tabLabels.map((tab) => (
              <button
                key={tab.key}
                type="button"
                data-ocid={`dashboard.product_tab.${tab.key}`}
                onClick={() => setProductTab(tab.key)}
                className={`flex-shrink-0 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                  productTab === tab.key
                    ? "border-b-primary text-primary bg-primary/5"
                    : "border-b-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Products grid */}
          <div className="p-3">
            {filteredProducts.length === 0 ? (
              <div
                data-ocid="dashboard.products.empty_state"
                className="flex flex-col items-center gap-2 py-8 text-muted-foreground text-sm"
              >
                <Package size={28} className="text-muted-foreground/30" />
                <p>Is tab mein koi product nahi</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {filteredProducts.slice(0, 12).map((p, idx) => (
                  <ProductCard
                    key={p.id}
                    name={p.name}
                    stock={p.currentStock}
                    unit={p.unit}
                    sellingPrice={p.sellingPrice}
                    profitPct={p.profitPct ?? null}
                    showProfit={!isStaff}
                    onClick={() => onNavigate("inventory")}
                    ocid={`dashboard.product_card.${idx + 1}`}
                  />
                ))}
              </div>
            )}
            {filteredProducts.length > 12 && (
              <div className="mt-2 text-center">
                <button
                  type="button"
                  onClick={() => onNavigate("inventory")}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  +{filteredProducts.length - 12} more products — View All →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            STOCK CONTROL SECTION
        ══════════════════════════════════════════════════════════════════ */}
        <div
          className="bg-card rounded-2xl border border-border p-4"
          data-ocid="dashboard.stock_control.section"
        >
          <p className="text-sm font-bold text-foreground mb-3">
            📦 Stock Control
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              data-ocid="dashboard.stock.low_stock"
              onClick={() => onNavigate("inventory")}
              className={`flex flex-col gap-1.5 rounded-xl p-3 border shadow-card active:scale-95 transition-transform text-left bg-card border-border ${
                lowStockItems.length > 0 ? "border-l-4 border-l-amber-400" : ""
              }`}
            >
              <AlertTriangle
                size={15}
                className={
                  lowStockItems.length > 0 ? "text-amber-500" : "text-green-500"
                }
              />
              <span
                className={`text-xl font-extrabold leading-none ${
                  lowStockItems.length > 0 ? "text-amber-700" : "text-green-700"
                }`}
              >
                {lowStockItems.length}
              </span>
              <span
                className={`text-[10px] font-semibold ${
                  lowStockItems.length > 0
                    ? "text-amber-600"
                    : "text-muted-foreground"
                }`}
              >
                Low Stock
              </span>
            </button>
            <button
              type="button"
              data-ocid="dashboard.stock.out_of_stock"
              onClick={() => onNavigate("inventory")}
              className={`flex flex-col gap-1.5 rounded-xl p-3 border shadow-card active:scale-95 transition-transform text-left bg-card border-border ${
                outOfStockItems.length > 0 ? "border-l-4 border-l-red-500" : ""
              }`}
            >
              <PackageX
                size={15}
                className={
                  outOfStockItems.length > 0 ? "text-red-500" : "text-green-500"
                }
              />
              <span
                className={`text-xl font-extrabold leading-none ${
                  outOfStockItems.length > 0 ? "text-red-700" : "text-green-700"
                }`}
              >
                {outOfStockItems.length}
              </span>
              <span
                className={`text-[10px] font-semibold ${
                  outOfStockItems.length > 0
                    ? "text-red-600"
                    : "text-muted-foreground"
                }`}
              >
                Out of Stock
              </span>
            </button>
            <button
              type="button"
              data-ocid="dashboard.stock.value"
              onClick={() => onNavigate("inventory")}
              className="flex flex-col gap-1.5 rounded-xl p-3 border border-border bg-card shadow-card active:scale-95 transition-transform text-left"
            >
              <Wallet size={15} className="text-primary" />
              <span className="text-base font-extrabold leading-none text-foreground truncate">
                {fmt(totalValue)}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground">
                Stock Value
              </span>
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SMART INSIGHTS SECTION
        ══════════════════════════════════════════════════════════════════ */}
        <div
          className="bg-card rounded-2xl border border-border p-4"
          data-ocid="dashboard.smart_insights.section"
        >
          <p className="text-sm font-bold text-foreground mb-3">
            📊 Smart Insights
          </p>
          <div className="flex flex-col gap-2">
            {/* Most Selling */}
            <button
              type="button"
              className="rounded-xl border border-border bg-card shadow-card p-3 active:scale-[0.99] transition-transform text-left w-full border-l-4 border-l-green-400"
              data-ocid="dashboard.insights.most_selling"
              onClick={() => onNavigate("reports")}
            >
              <div className="flex items-center gap-2 mb-2">
                <Star size={13} className="text-green-600" />
                <span className="text-xs font-semibold text-foreground">
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
                      <span className="text-[10px] font-bold text-muted-foreground w-4">
                        #{i + 1}
                      </span>
                      <span className="text-xs font-medium text-foreground flex-1 truncate">
                        {item.name}
                      </span>
                      <Badge className="bg-secondary text-foreground border-border border text-[10px]">
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
              className="rounded-xl border border-border bg-card shadow-card p-3 active:scale-[0.99] transition-transform text-left w-full border-l-4 border-l-primary"
              data-ocid="dashboard.insights.high_profit"
              onClick={() => onNavigate("reports")}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={13} className="text-primary" />
                <span className="text-xs font-semibold text-foreground">
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
                      <span className="text-[10px] font-bold text-muted-foreground w-4">
                        #{i + 1}
                      </span>
                      <span className="text-xs font-medium text-foreground flex-1 truncate">
                        {item.name}
                      </span>
                      <Badge className="bg-green-100 text-green-700 border-green-200 border text-[10px]">
                        {fmt(item.profit)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </button>

            {/* Low Price Attempts (Owner only) */}
            {isOwner && (
              <button
                type="button"
                className="rounded-xl border border-border bg-card shadow-card p-3 active:scale-[0.99] transition-transform text-left w-full border-l-4 border-l-amber-400"
                data-ocid="dashboard.insights.low_price"
                onClick={() => onNavigate("low-price-log")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={13} className="text-amber-600" />
                    <span className="text-xs font-semibold text-foreground">
                      Low Price Attempts Today
                    </span>
                  </div>
                  <span
                    className={`text-xl font-extrabold ${
                      lowPriceAttemptsToday > 0
                        ? "text-amber-700"
                        : "text-muted-foreground"
                    }`}
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
            INVENTORY HEALTH SECTION
        ══════════════════════════════════════════════════════════════════ */}
        <div
          className="bg-card rounded-2xl border border-border p-4"
          data-ocid="dashboard.inventory_health.section"
        >
          <p className="text-sm font-bold text-foreground mb-3">
            🏥 Inventory Health
          </p>
          <div className="flex gap-2">
            {appConfig.featureFlags.expiry && (
              <button
                type="button"
                data-ocid="dashboard.health.expiry"
                onClick={() => onNavigate("inventory")}
                className={`flex-1 min-w-0 flex flex-col gap-2 rounded-xl p-3 border bg-card shadow-card active:scale-95 transition-transform text-left border-border ${
                  expiryWithin30 > 0 ? "border-l-4 border-l-orange-400" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    expiryWithin30 > 0 ? "bg-orange-100" : "bg-green-100"
                  }`}
                >
                  <Clock
                    size={15}
                    className={
                      expiryWithin30 > 0 ? "text-orange-600" : "text-green-600"
                    }
                  />
                </div>
                <span
                  className={`text-xl font-extrabold leading-none ${
                    expiryWithin30 > 0 ? "text-orange-700" : "text-green-700"
                  }`}
                >
                  {expiryWithin30}
                </span>
                <div>
                  <div className="text-[11px] font-semibold text-foreground">
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
                className={`flex-1 min-w-0 flex flex-col gap-2 rounded-xl p-3 border bg-card shadow-card active:scale-95 transition-transform text-left border-border ${
                  deadStockItems.length > 0 ? "border-l-4 border-l-red-500" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    deadStockItems.length > 0 ? "bg-red-100" : "bg-green-100"
                  }`}
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
                  className={`text-xl font-extrabold leading-none ${
                    deadStockItems.length > 0
                      ? "text-red-700"
                      : "text-green-700"
                  }`}
                >
                  {deadStockItems.length}
                </span>
                <div>
                  <div className="text-[11px] font-semibold text-foreground">
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
              className={`flex-1 min-w-0 flex flex-col gap-2 rounded-xl p-3 border bg-card shadow-card active:scale-95 transition-transform text-left border-border ${
                slowMovingItems.length > 0
                  ? "border-l-4 border-l-amber-400"
                  : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  slowMovingItems.length > 0 ? "bg-amber-100" : "bg-green-100"
                }`}
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
                className={`text-xl font-extrabold leading-none ${
                  slowMovingItems.length > 0
                    ? "text-amber-700"
                    : "text-green-700"
                }`}
              >
                {slowMovingItems.length}
              </span>
              <div>
                <div className="text-[11px] font-semibold text-foreground">
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
            RECENT ACTIVITY SECTION
        ══════════════════════════════════════════════════════════════════ */}
        <div
          className="bg-card rounded-2xl border border-border overflow-hidden"
          data-ocid="dashboard.recent_activity.section"
        >
          <div className="px-4 pt-3 pb-2.5 border-b border-border/60 flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">
              🕐 Recent Activity
            </span>
            <span className="text-[11px] text-muted-foreground">
              Last 10 actions
            </span>
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
                        <ArrowDownToLine size={14} className="text-blue-600" />
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

        {/* Low Price Alert Banner (Owner only) */}
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

        {/* Empty State for fresh shop */}
        {products.length === 0 && invoices.length === 0 && (
          <div
            className="rounded-2xl border border-dashed border-muted-foreground/30 bg-card p-6 text-center"
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
  );
}
