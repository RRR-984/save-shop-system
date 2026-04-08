import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { StoreProvider, useStore } from "./context/StoreContext";
import { AdminPage } from "./pages/AdminPage";
import { AuditLogPage } from "./pages/AuditLogPage";
import { BillingPage } from "./pages/BillingPage";
import { CustomersPage } from "./pages/CustomersPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HistoryPage } from "./pages/HistoryPage";
import { InventoryPage } from "./pages/InventoryPage";
import { LoginPage } from "./pages/LoginPage";
import { LowPriceAlertLogPage } from "./pages/LowPriceAlertLogPage";
import { ReportsPage } from "./pages/ReportsPage";
import { ReturnsPage } from "./pages/ReturnsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { StaffCreditReportPage } from "./pages/StaffCreditReportPage";
import { StaffManagementPage } from "./pages/StaffManagementPage";
import { StaffPerformancePage } from "./pages/StaffPerformancePage";
import { StockPage } from "./pages/StockPage";
import type { NavPage } from "./types/store";

function AppContent() {
  const [currentPage, setCurrentPage] = useState<NavPage>("dashboard");
  const { isLoading } = useStore();
  const [loadingTooLong, setLoadingTooLong] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setLoadingTooLong(false);
      return;
    }
    const t = setTimeout(() => setLoadingTooLong(true), 5000);
    return () => clearTimeout(t);
  }, [isLoading]);

  const handleNavigate = (page: NavPage) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage onNavigate={handleNavigate} />;
      case "inventory":
        return <InventoryPage />;
      case "stock":
        return <StockPage />;
      case "billing":
        return <BillingPage />;
      case "customers":
        return <CustomersPage />;
      case "reports":
        return <ReportsPage />;
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
      default:
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background"
        data-ocid="app.loading_state"
      >
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">
          Data load ho raha hai...
        </p>
        {loadingTooLong && (
          <div className="flex flex-col items-center gap-2 mt-2">
            <p className="text-xs text-muted-foreground">
              Kuch zyada time lag raha hai...
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              data-ocid="app.reload_button"
            >
              Reload karein
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
        {renderPage()}

        <footer className="mt-auto px-6 py-3 border-t border-border">
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

      <Toaster position="bottom-right" richColors />
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
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
