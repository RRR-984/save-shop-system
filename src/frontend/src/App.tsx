import { Toaster } from "@/components/ui/sonner";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { FirstTimeUserWelcomePopup } from "./components/FirstTimeUserWelcomePopup";
import { PWAInstallModal } from "./components/PWAInstallModal";
import { SessionExpiredToast } from "./components/SessionExpiredToast";
import { MemoSidebar as Sidebar } from "./components/Sidebar";
import { PageSkeleton, SkeletonLoader } from "./components/SkeletonLoader";
import { SyncStatusBanner } from "./components/SyncStatusBanner";
import { SyncStatusBar } from "./components/SyncStatusBar";
import { TopBar } from "./components/TopBar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { StoreProvider, useStore } from "./context/StoreContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useDraggable } from "./hooks/useDraggable";
import { usePeriodicSync } from "./hooks/usePeriodicSync";
import { useSessionHeartbeat } from "./hooks/useSessionHeartbeat";
import { useSyncEngine } from "./hooks/useSyncEngine";
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
import { RentalPage } from "./pages/RentalPage";
import { ReportsPage } from "./pages/ReportsPage";
import { RestaurantBillingPage } from "./pages/RestaurantBillingPage";
import { RestaurantKitchenPage } from "./pages/RestaurantKitchenPage";
import { RestaurantMenuPage } from "./pages/RestaurantMenuPage";
import { RestaurantOrderPage } from "./pages/RestaurantOrderPage";
import { RestaurantReportsPage } from "./pages/RestaurantReportsPage";
import { RestaurantTablesPage } from "./pages/RestaurantTablesPage";
import { ReturnsPage } from "./pages/ReturnsPage";
import { ServiceRepairPage } from "./pages/ServiceRepairPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ShopBoardPage } from "./pages/ShopBoardPage";
import { StaffAttendancePage } from "./pages/StaffAttendancePage";
import { StaffCreditReportPage } from "./pages/StaffCreditReportPage";
import { StaffManagementPage } from "./pages/StaffManagementPage";
import { StaffPerformancePage } from "./pages/StaffPerformancePage";
import { StockPage } from "./pages/StockPage";
import { SuperAdminPage } from "./pages/SuperAdminPage";
import { VendorsPage } from "./pages/VendorsPage";
import type { NavPage } from "./types/store";
import { STORAGE_KEYS } from "./utils/localStorage";

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
  rental: "🔑 Rental / Lending",
  "service-repair": "🔧 Service & Repair",
  "restaurant-menu": "🍽️ Menu Management",
  "restaurant-tables": "🪑 Table Management",
  "restaurant-order": "📋 New Order",
  "restaurant-kitchen": "👨‍🍳 Kitchen Display",
  "restaurant-billing": "🧾 Restaurant Billing",
  "restaurant-reports": "📊 Restaurant Reports",
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
  // Mobile sidebar open trigger — set by Sidebar, forwarded to TopBar
  const sidebarMenuTriggerRef = useRef<(() => void) | null>(null);
  const {
    isLoading,
    isPhase1Loading,
    phase1HasPartialError,
    actorError,
    referralCodes,
    recordReferralSignup,
    shopId,
    appConfig,
  } = useStore();
  const { logout } = useAuth();
  const [loadingTooLong, setLoadingTooLong] = useState(false);
  // Auto-hide skeleton after 1.5s max even if Phase 1 hasn't resolved
  const [skeletonTimeout, setSkeletonTimeout] = useState(false);
  // Session expired modal state
  const [sessionExpired, setSessionExpired] = useState(false);

  // Concurrency feature flag — derived from appConfig
  const concurrencyEnabled = !!(appConfig as { concurrencyEnabled?: boolean })
    .concurrencyEnabled;

  // Session heartbeat — auto-logout on 15 min idle (only when concurrencyEnabled)
  const handleSessionExpired = useCallback(() => {
    setSessionExpired(true);
  }, []);
  useSessionHeartbeat({
    enabled: concurrencyEnabled,
    onExpired: handleSessionExpired,
  });

  // Periodic sync — pulls remote changes every 15s ± jitter
  const periodicSync = usePeriodicSync(concurrencyEnabled && !isLoading);

  // Global background sync engine — runs silently, never blocks UI
  const syncEngine = useSyncEngine(shopId);

  // ── Draggable FAB (New Sale button) ────────────────────────────────────
  const FAB_W = 140; // approximate pill width
  const FAB_H = 48;
  const fabDefaultPos = () => {
    const vw = typeof window !== "undefined" ? window.innerWidth : 400;
    const vh = typeof window !== "undefined" ? window.innerHeight : 700;
    const isMobile = vw <= 768;
    // On mobile: keep away from bottom browser chrome (80px safe zone) and
    // away from top sticky header. On desktop: original 20px margin.
    const safeBottom = isMobile ? 80 : 20;
    return { x: vw - FAB_W - 16, y: vh - FAB_H - safeBottom };
  };
  const {
    pos: fabPos,
    isDragging: isFabDragging,
    hasDragged: fabHasDragged,
    onMouseDown: onFabMouseDown,
    onTouchStart: onFabTouchStart,
    style: fabDragStyle,
  } = useDraggable({
    storageKey: STORAGE_KEYS.fabPos,
    defaultPos: fabDefaultPos(),
    elementSize: { w: FAB_W, h: FAB_H },
  });

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

  // Process any referral code that was saved to localStorage during login.
  // Strategy: wait until isLoading===false AND referralCodes has been populated.
  // Do NOT consume (remove) pending_referral until we've had a real chance to
  // match it. If referralCodes is still empty after loading completes, keep the
  // pending entry so the next render cycle can retry.
  const pendingReferralProcessedRef = useRef(false);
  useEffect(() => {
    // Gate: loading must be done and we must not have already processed this
    if (isLoading) return;
    if (pendingReferralProcessedRef.current) return;

    try {
      const raw = localStorage.getItem("pending_referral");
      if (!raw) {
        // Nothing pending — mark as done so we stop checking
        pendingReferralProcessedRef.current = true;
        return;
      }

      const pending = JSON.parse(raw) as {
        code: string;
        newUserId: string;
        shopName: string;
        mobile: string;
      };

      // If referralCodes is still empty, it may not have loaded yet from backend.
      // Keep pending_referral in localStorage and let the next re-render (when
      // referralCodes updates) retry. But only retry up to 5 times.
      const retryKey = "pending_referral_retries";
      const retries = Number.parseInt(
        localStorage.getItem(retryKey) ?? "0",
        10,
      );

      if (referralCodes.length === 0 && retries < 5) {
        localStorage.setItem(retryKey, String(retries + 1));
        return; // retry on next referralCodes update
      }

      // We have codes (or exhausted retries) — consume the pending entry
      localStorage.removeItem("pending_referral");
      localStorage.removeItem(retryKey);
      pendingReferralProcessedRef.current = true;

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
      pendingReferralProcessedRef.current = true;
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

  const doTransition = useCallback((nextPage: NavPage) => {
    setTransitioning(true);
    pendingPageRef.current = nextPage;
    setTimeout(() => {
      setCurrentPage(pendingPageRef.current!);
      setTransitioning(false);
      window.scrollTo({ top: 0, behavior: "instant" });
    }, 120);
  }, []);

  const handleNavigate = useCallback(
    (page: NavPage, params?: Record<string, unknown>) => {
      if (page === currentPageRef.current) return;
      setNavHistory((prev) => [...prev, currentPageRef.current]);
      setPageParams(params ?? {});
      doTransition(page);
    },
    [doTransition],
  );

  const handleAction = useCallback(
    (action: string) => {
      switch (action) {
        case "NEW_SALE":
          handleNavigate("billing");
          break;
        case "ADD_STOCK":
          handleNavigate("stock");
          break;
        case "ADD_PRODUCT":
          handleNavigate("inventory");
          break;
        case "NEW_ORDER":
          handleNavigate("restaurant-order");
          break;
        case "NEW_JOB_CARD":
        case "SEARCH_VEHICLE":
          handleNavigate("service-repair");
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent("chatbot-action", { detail: { action } }),
            );
          }, 350);
          break;
        case "NEW_CUSTOMER":
          handleNavigate("customers");
          break;
        case "NEW_VENDOR":
          handleNavigate("vendors");
          break;
        default:
          break;
      }
    },
    [handleNavigate],
  );

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
      case "service-repair":
        return <ServiceRepairPage />;
      case "rental":
        return <RentalPage />;
      case "restaurant-menu":
        return <RestaurantMenuPage />;
      case "restaurant-tables":
        return <RestaurantTablesPage />;
      case "restaurant-order":
        return <RestaurantOrderPage />;
      case "restaurant-kitchen":
        return <RestaurantKitchenPage />;
      case "restaurant-billing":
        return <RestaurantBillingPage />;
      case "restaurant-reports":
        return <RestaurantReportsPage />;
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
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onAction={handleAction}
        onMenuTriggerReady={(fn) => {
          sidebarMenuTriggerRef.current = fn;
        }}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        <TopBar
          title={PAGE_TITLES[currentPage] ?? "Save Shop"}
          goHome={handleGoHome}
          isHome={currentPage === "dashboard"}
          onMenuToggle={() => sidebarMenuTriggerRef.current?.()}
        />
        <SyncStatusBanner engine={syncEngine} />
        {/* Compact multi-device sync status bar */}
        <SyncStatusBar
          isSyncing={periodicSync.isSyncing}
          lastSyncAt={periodicSync.lastSyncAt}
        />

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
          onMouseDown={onFabMouseDown}
          onTouchStart={onFabTouchStart}
          onClick={() => {
            if (!fabHasDragged.current) handleNavigate("billing");
          }}
          className={`new-sale-fab flex items-center gap-2 px-5 py-3.5 rounded-full font-bold text-sm text-white shadow-xl hover:opacity-90 active:scale-95 transition-all duration-150${isFabDragging ? " is-dragging" : ""}`}
          style={{
            left: fabPos.x,
            top: fabPos.y,
            background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
            boxShadow:
              "0 8px 32px 0 rgba(37,99,235,0.45), 0 2px 8px 0 rgba(0,0,0,0.18)",
            ...fabDragStyle,
          }}
          aria-label="New Sale"
        >
          🛒 <span>{t("New Sale")}</span>
        </button>
      )}

      <Toaster position="bottom-right" richColors />
      <PWAInstallModal />
      <FirstTimeUserWelcomePopup />
      {/* Session expired modal — shown after 15 min idle when concurrencyEnabled */}
      <SessionExpiredToast
        open={sessionExpired}
        onLogin={() => {
          setSessionExpired(false);
          logout();
        }}
      />
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
