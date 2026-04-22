import { Toaster } from "@/components/ui/sonner";
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { ChatBot } from "./components/ChatBot";
import { FirstTimeUserWelcomePopup } from "./components/FirstTimeUserWelcomePopup";
import { PWAInstallModal } from "./components/PWAInstallModal";
import { MemoSidebar as Sidebar } from "./components/Sidebar";
import { PageSkeleton, SkeletonLoader } from "./components/SkeletonLoader";
import { SyncStatusBanner } from "./components/SyncStatusBanner";
import { TopBar } from "./components/TopBar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { StoreProvider, useStore } from "./context/StoreContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useSyncEngine } from "./hooks/useSyncEngine";
// DashboardPage — eager-loaded (first render target)
import { DashboardPage } from "./pages/DashboardPage";
// LoginPage — eager-loaded (shown before auth, must be available immediately)
import { LoginPage } from "./pages/LoginPage";
// OwnerDashboardPage — eager-loaded (critical path for multi-shop owners)
import { OwnerDashboardPage } from "./pages/OwnerDashboardPage";
import type { NavPage } from "./types/store";

// ── Lazy-loaded pages (code-split — only loaded when user navigates there) ──
const AdminPage = lazy(() =>
  import("./pages/AdminPage").then((m) => ({ default: m.AdminPage })),
);
const AuditLogPage = lazy(() =>
  import("./pages/AuditLogPage").then((m) => ({ default: m.AuditLogPage })),
);
const BillingPage = lazy(() =>
  import("./pages/BillingPage").then((m) => ({ default: m.BillingPage })),
);
const CashCounterPage = lazy(() =>
  import("./pages/CashCounterPage").then((m) => ({
    default: m.CashCounterPage,
  })),
);
const CustomerOrdersPage = lazy(() =>
  import("./pages/CustomerOrdersPage").then((m) => ({
    default: m.CustomerOrdersPage,
  })),
);
const CustomersPage = lazy(() =>
  import("./pages/CustomersPage").then((m) => ({ default: m.CustomersPage })),
);
const DiamondRewardsPage = lazy(() =>
  import("./pages/DiamondRewardsPage").then((m) => ({
    default: m.DiamondRewardsPage,
  })),
);
const DraftsPage = lazy(() =>
  import("./pages/DraftsPage").then((m) => ({ default: m.DraftsPage })),
);
const FeedbackPage = lazy(() =>
  import("./pages/FeedbackPage").then((m) => ({ default: m.FeedbackPage })),
);
const HistoryPage = lazy(() =>
  import("./pages/HistoryPage").then((m) => ({ default: m.HistoryPage })),
);
const InventoryPage = lazy(() =>
  import("./pages/InventoryPage").then((m) => ({ default: m.InventoryPage })),
);
const LowPriceAlertLogPage = lazy(() =>
  import("./pages/LowPriceAlertLogPage").then((m) => ({
    default: m.LowPriceAlertLogPage,
  })),
);
const PurchaseOrdersPage = lazy(() =>
  import("./pages/PurchaseOrdersPage").then((m) => ({
    default: m.PurchaseOrdersPage,
  })),
);
const RankingsPage = lazy(() =>
  import("./pages/RankingsPage").then((m) => ({ default: m.RankingsPage })),
);
const ReferralPage = lazy(() =>
  import("./pages/ReferralPage").then((m) => ({ default: m.ReferralPage })),
);
const ReminderLogPage = lazy(() =>
  import("./pages/ReminderLogPage").then((m) => ({
    default: m.ReminderLogPage,
  })),
);
const ReportsPage = lazy(() =>
  import("./pages/ReportsPage").then((m) => ({ default: m.ReportsPage })),
);
const ReturnsPage = lazy(() =>
  import("./pages/ReturnsPage").then((m) => ({ default: m.ReturnsPage })),
);
const SettingsPage = lazy(() =>
  import("./pages/SettingsPage").then((m) => ({ default: m.SettingsPage })),
);
const ShopBoardPage = lazy(() =>
  import("./pages/ShopBoardPage").then((m) => ({ default: m.ShopBoardPage })),
);
const StaffAttendancePage = lazy(() =>
  import("./pages/StaffAttendancePage").then((m) => ({
    default: m.StaffAttendancePage,
  })),
);
const StaffCreditReportPage = lazy(() =>
  import("./pages/StaffCreditReportPage").then((m) => ({
    default: m.StaffCreditReportPage,
  })),
);
const StaffManagementPage = lazy(() =>
  import("./pages/StaffManagementPage").then((m) => ({
    default: m.StaffManagementPage,
  })),
);
const StaffPerformancePage = lazy(() =>
  import("./pages/StaffPerformancePage").then((m) => ({
    default: m.StaffPerformancePage,
  })),
);
const StockPage = lazy(() =>
  import("./pages/StockPage").then((m) => ({ default: m.StockPage })),
);
const VendorsPage = lazy(() =>
  import("./pages/VendorsPage").then((m) => ({ default: m.VendorsPage })),
);
const SuperAdminPage = lazy(() =>
  import("./pages/SuperAdminPage").then((m) => ({ default: m.SuperAdminPage })),
);

const NAV_STATE_KEY = "save_shop_nav_state";

function readNavState(): { page: NavPage; history: NavPage[] } {
  try {
    const raw = sessionStorage.getItem(NAV_STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { page: NavPage; history: NavPage[] };
      if (parsed.page && Array.isArray(parsed.history)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return { page: "dashboard", history: [] };
}

function writeNavState(page: NavPage, history: NavPage[]) {
  try {
    sessionStorage.setItem(NAV_STATE_KEY, JSON.stringify({ page, history }));
  } catch {
    /* ignore */
  }
}

const PAGE_TITLES: Record<NavPage, string> = {
  dashboard: "Dashboard",
  inventory: "Inventory",
  stock: "Stock In / Out",
  billing: "Billing",
  drafts: "Draft Sales",
  customers: "Customers",
  reports: "Reports",
  admin: "Admin Panel",
  "staff-performance": "Staff Performance",
  "staff-credit": "Staff Credit Report",
  history: "Draft History",
  returns: "Returns",
  settings: "App Settings",
  "low-price-log": "Low Price Log",
  "staff-management": "Staff Management",
  "audit-log": "Audit Log",
  "reminder-log": "Reminder History",
  vendors: "Vendors",
  "purchase-orders": "Purchase Orders",
  "customer-orders": "Customer Orders",
  "cash-counter": "Cash Counter",
  "diamond-rewards": "💎 Diamond Rewards",
  rankings: "🏆 Rankings",
  "shop-board": "📊 Live Board",
  "feedback-page": "💬 Feedback",
  "referral-page": "🔗 Refer & Earn",
  attendance: "📅 Attendance",
  "owner-dashboard": "🏪 Owner Overview",
  "super-admin": "🛡️ Super Admin",
};

/** Badge shown on dashboard when Phase 1 had partial errors */
function PartialDataBadge({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <output
      className="mx-4 mt-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2"
      data-ocid="app.partial_data_badge"
      aria-live="polite"
    >
      <span>⚠️</span>
      <span>Some data unavailable, retrying in background...</span>
    </output>
  );
}

function AppContent() {
  const initial = readNavState();
  const [currentPage, setCurrentPage] = useState<NavPage>(initial.page);
  const [navHistory, setNavHistory] = useState<NavPage[]>(initial.history);
  const [transitioning, setTransitioning] = useState(false);
  const [pageParams, setPageParams] = useState<Record<string, unknown>>({});
  const {
    isLoading,
    isPhase1Loading,
    phase1HasPartialError,
    actorError,
    referralCodes,
    recordReferralSignup,
    shopId,
  } = useStore();
  const [loadingTooLong, setLoadingTooLong] = useState(false);
  // Auto-hide skeleton after 1.5s max even if Phase 1 hasn't resolved
  const [skeletonTimeout, setSkeletonTimeout] = useState(false);

  // Global background sync engine — runs silently, never blocks UI
  const syncEngine = useSyncEngine(shopId);

  // Dispatch 'app-ready' once the store finishes loading so main.tsx can hide the splash
  useEffect(() => {
    if (!isLoading) {
      window.dispatchEvent(new Event("app-ready"));
    }
  }, [isLoading]);

  const pendingPageRef = useRef<NavPage | null>(null);
  const navHistoryRef = useRef<NavPage[]>(initial.history);
  const currentPageRef = useRef<NavPage>(initial.page);
  const { t } = useLanguage();

  // Existing 5s "Taking longer than usual..." timer
  useEffect(() => {
    if (!isLoading) {
      setLoadingTooLong(false);
      return;
    }
    const timer = setTimeout(() => setLoadingTooLong(true), 5000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Skeleton timeout: hide skeleton after 1.5s regardless of Phase 1
  useEffect(() => {
    const timer = setTimeout(() => setSkeletonTimeout(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Show skeleton only while Phase 1 is loading AND timeout hasn't expired
  const showSkeleton = isPhase1Loading && !skeletonTimeout;

  // Process any referral code that was saved to localStorage during login
  useEffect(() => {
    if (isLoading) return;
    try {
      const raw = localStorage.getItem("pending_referral");
      if (!raw) return;
      localStorage.removeItem("pending_referral");
      const pending = JSON.parse(raw) as {
        code: string;
        newUserId: string;
        shopName: string;
        mobile: string;
      };
      const matchedCode = referralCodes.find((rc) => rc.code === pending.code);
      if (matchedCode) {
        recordReferralSignup(
          matchedCode,
          pending.newUserId,
          pending.shopName,
          pending.mobile,
        );
      }
    } catch {
      /* ignore parse / storage errors */
    }
  }, [isLoading, referralCodes, recordReferralSignup]);

  useEffect(() => {
    writeNavState(currentPage, navHistory);
    navHistoryRef.current = navHistory;
    currentPageRef.current = currentPage;
  }, [currentPage, navHistory]);

  useEffect(() => {
    window.history.pushState({ page: currentPage }, "", window.location.href);
  }, [currentPage]);

  useEffect(() => {
    const onPopState = () => {
      const history = [...navHistoryRef.current];
      if (history.length > 0) {
        const prev = history.pop()!;
        setNavHistory(history);
        doTransition(prev);
      } else {
        window.history.pushState(
          { page: currentPageRef.current },
          "",
          window.location.href,
        );
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const doTransition = (nextPage: NavPage) => {
    setTransitioning(true);
    pendingPageRef.current = nextPage;
    setTimeout(() => {
      setCurrentPage(pendingPageRef.current!);
      setTransitioning(false);
      window.scrollTo({ top: 0, behavior: "instant" });
    }, 120);
  };

  const handleNavigate = (page: NavPage, params?: Record<string, unknown>) => {
    if (page === currentPage) return;
    setNavHistory((prev) => [...prev, currentPage]);
    setPageParams(params ?? {});
    doTransition(page);
  };

  const handleGoHome = () => {
    if (currentPage === "dashboard") return;
    setNavHistory([]);
    doTransition("dashboard");
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage onNavigate={handleNavigate} />;
      case "inventory":
        return (
          <InventoryPage
            onNavigate={handleNavigate}
            selectedProductId={
              pageParams.selectedProductId as string | undefined
            }
          />
        );
      case "stock":
        return <StockPage onNavigate={handleNavigate} />;
      case "billing":
        return <BillingPage onNavigate={handleNavigate} />;
      case "drafts":
        return <DraftsPage onNavigate={handleNavigate} />;
      case "customers":
        return <CustomersPage />;
      case "reports":
        return <ReportsPage onNavigate={handleNavigate} />;
      case "admin":
        return <AdminPage />;
      case "staff-performance":
        return <StaffPerformancePage />;
      case "staff-credit":
        return <StaffCreditReportPage />;
      case "history":
        return <HistoryPage />;
      case "returns":
        return <ReturnsPage />;
      case "settings":
        return <SettingsPage />;
      case "low-price-log":
        return <LowPriceAlertLogPage />;
      case "staff-management":
        return <StaffManagementPage />;
      case "audit-log":
        return <AuditLogPage />;
      case "reminder-log":
        return <ReminderLogPage />;
      case "vendors":
        return <VendorsPage />;
      case "purchase-orders":
        return (
          <PurchaseOrdersPage
            reorderProductId={pageParams.reorderProductId as string | undefined}
            reorderVendorId={pageParams.reorderVendorId as string | undefined}
            reorderRate={pageParams.reorderRate as number | undefined}
          />
        );
      case "customer-orders":
        return <CustomerOrdersPage />;
      case "cash-counter":
        return <CashCounterPage onNavigate={handleNavigate} />;
      case "diamond-rewards":
        return <DiamondRewardsPage />;
      case "rankings":
        return <RankingsPage />;
      case "shop-board":
        return <ShopBoardPage onNavigate={handleNavigate} />;
      case "feedback-page":
        return <FeedbackPage />;
      case "referral-page":
        return <ReferralPage />;
      case "attendance":
        return <StaffAttendancePage />;
      case "owner-dashboard":
        return <OwnerDashboardPage onNavigate={handleNavigate} />;
      case "super-admin":
        return <SuperAdminPage onBack={handleGoHome} />;
      default:
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  if (actorError) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background p-6"
        data-ocid="app.actor_error_state"
      >
        <div className="text-4xl">🔌</div>
        <p className="text-foreground font-semibold text-base text-center">
          Connection failed
        </p>
        <p className="text-muted-foreground text-sm text-center max-w-xs">
          Could not connect to the backend. Please check your internet
          connection and try again.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          data-ocid="app.actor_error_retry_button"
        >
          Tap to Retry
        </button>
      </div>
    );
  }

  // Phase 1 skeleton — shown instead of blank screen while initial data loads
  if (showSkeleton) {
    return (
      <div
        className="min-h-screen flex flex-col bg-background"
        data-ocid="app.loading_state"
      >
        {/* Minimal header skeleton */}
        <div className="h-14 border-b border-border bg-card flex items-center px-4 gap-3">
          <div className="w-8 h-8 rounded bg-muted animate-pulse" />
          <div className="flex-1 h-4 max-w-[140px] rounded bg-muted animate-pulse" />
          <div className="w-20 h-6 rounded-full bg-muted animate-pulse" />
        </div>
        <SkeletonLoader />
        {/* Existing "taking longer" fallback preserved */}
        {loadingTooLong && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 bg-card border border-border rounded-xl px-5 py-3 shadow-lg z-50">
            <p className="text-xs text-muted-foreground">
              Taking longer than usual...
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              data-ocid="app.reload_button"
            >
              Reload
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />

      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        <TopBar
          title={PAGE_TITLES[currentPage] ?? "Save Shop"}
          goHome={handleGoHome}
          isHome={currentPage === "dashboard"}
        />
        <SyncStatusBanner engine={syncEngine} />

        {/* Partial data warning badge — shown when Phase 1 had errors but app rendered anyway */}
        {phase1HasPartialError && currentPage === "dashboard" && (
          <PartialDataBadge visible />
        )}

        <div
          className={transitioning ? "page-fade-out" : "page-fade-in"}
          style={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          {/* Wrap all lazy pages in Suspense with PageSkeleton fallback */}
          <Suspense fallback={<PageSkeleton />}>{renderPage()}</Suspense>
        </div>

        <footer className="mt-auto px-6 py-3 border-t border-border pb-20 md:pb-3">
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Save Shop System | Powered by FIFO
            Bridge
          </p>
        </footer>
      </main>

      {currentPage !== "billing" && (
        <button
          type="button"
          data-ocid="fab.new_sale.button"
          onClick={() => handleNavigate("billing")}
          className="new-sale-fab flex items-center gap-2 px-5 py-3.5 rounded-full font-bold text-sm text-white shadow-xl hover:opacity-90 active:scale-95 transition-all duration-150"
          style={{
            background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
            boxShadow:
              "0 8px 32px 0 rgba(37,99,235,0.45), 0 2px 8px 0 rgba(0,0,0,0.18)",
          }}
          aria-label="New Sale"
        >
          🛒 <span>{t("New Sale")}</span>
        </button>
      )}

      <Toaster position="bottom-right" richColors />
      <PWAInstallModal />
      <FirstTimeUserWelcomePopup />
      <ChatBot />
    </div>
  );
}

function AuthGate() {
  const { session, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <AuthGate />
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
