import { Toaster } from "@/components/ui/sonner";
import { useEffect, useRef, useState } from "react";
import { ChatBot } from "./components/ChatBot";
import { FirstTimeUserWelcomePopup } from "./components/FirstTimeUserWelcomePopup";
import { PWAInstallModal } from "./components/PWAInstallModal";
import { MemoSidebar as Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { StoreProvider, useStore } from "./context/StoreContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AdminPage } from "./pages/AdminPage";
import { AuditLogPage } from "./pages/AuditLogPage";
import { BillingPage } from "./pages/BillingPage";
import { CashCounterPage } from "./pages/CashCounterPage";
import { CustomerOrdersPage } from "./pages/CustomerOrdersPage";
import { CustomersPage } from "./pages/CustomersPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DiamondRewardsPage } from "./pages/DiamondRewardsPage";
import { DraftsPage } from "./pages/DraftsPage";
import { FeedbackPage } from "./pages/FeedbackPage";
import { HistoryPage } from "./pages/HistoryPage";
import { InventoryPage } from "./pages/InventoryPage";
import { LoginPage } from "./pages/LoginPage";
import { LowPriceAlertLogPage } from "./pages/LowPriceAlertLogPage";
import { OwnerDashboardPage } from "./pages/OwnerDashboardPage";
import { PurchaseOrdersPage } from "./pages/PurchaseOrdersPage";
import { RankingsPage } from "./pages/RankingsPage";
import { ReferralPage } from "./pages/ReferralPage";
import { ReminderLogPage } from "./pages/ReminderLogPage";
import { ReportsPage } from "./pages/ReportsPage";
import { ReturnsPage } from "./pages/ReturnsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ShopBoardPage } from "./pages/ShopBoardPage";
import { StaffAttendancePage } from "./pages/StaffAttendancePage";
import { StaffCreditReportPage } from "./pages/StaffCreditReportPage";
import { StaffManagementPage } from "./pages/StaffManagementPage";
import { StaffPerformancePage } from "./pages/StaffPerformancePage";
import { StockPage } from "./pages/StockPage";
import { VendorsPage } from "./pages/VendorsPage";
import type { NavPage } from "./types/store";

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
};

function AppContent() {
  const initial = readNavState();
  const [currentPage, setCurrentPage] = useState<NavPage>(initial.page);
  const [navHistory, setNavHistory] = useState<NavPage[]>(initial.history);
  const [transitioning, setTransitioning] = useState(false);
  const [pageParams, setPageParams] = useState<Record<string, unknown>>({});
  const { isLoading, actorError, referralCodes, recordReferralSignup } =
    useStore();
  const [loadingTooLong, setLoadingTooLong] = useState(false);

  // Dispatch 'app-ready' once the store finishes loading so main.tsx can hide the splash
  useEffect(() => {
    if (!isLoading) {
      window.dispatchEvent(new Event("app-ready"));
    }
  }, [isLoading]);
  const pendingPageRef = useRef<NavPage | null>(null);
  // Ref mirrors keep the popstate handler free of stale closure issues
  const navHistoryRef = useRef<NavPage[]>(initial.history);
  const currentPageRef = useRef<NavPage>(initial.page);
  const { t } = useLanguage();

  useEffect(() => {
    if (!isLoading) {
      setLoadingTooLong(false);
      return;
    }
    const timer = setTimeout(() => setLoadingTooLong(true), 5000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Process any referral code that was saved to localStorage during login
  // (LoginPage cannot call useStore() since it renders outside StoreProvider)
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

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background"
        data-ocid="app.loading_state"
      >
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Loading data...</p>
        {loadingTooLong && (
          <div className="flex flex-col items-center gap-2 mt-2">
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
      {/* Top progress bar — shows during initial data load */}
      {isLoading && (
        <div
          className="fixed top-0 left-0 h-[3px] bg-primary z-[9999] transition-all duration-300"
          style={{ width: "70%", animation: "none" }}
          data-ocid="app.top_progress_bar"
        />
      )}
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />

      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        <TopBar
          title={PAGE_TITLES[currentPage] ?? "Save Shop"}
          goHome={handleGoHome}
          isHome={currentPage === "dashboard"}
        />

        <div
          className={transitioning ? "page-fade-out" : "page-fade-in"}
          style={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          {renderPage()}
        </div>

        <footer className="mt-auto px-6 py-3 border-t border-border pb-20 md:pb-3">
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()}. Built with ♥ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
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
