import { cn } from "@/lib/utils";
import {
  ArrowLeftRight,
  BarChart2,
  Bell,
  Building2,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  FileText,
  Gem,
  Gift,
  History,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  Receipt,
  RotateCcw,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Smartphone,
  Store,
  TrendingUp,
  Trophy,
  UserCog,
  Users,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useStore } from "../context/StoreContext";
import type { NavPage, UserRole } from "../types/store";

// Role badge component
function RoleBadge({ role }: { role: UserRole }) {
  if (role === "owner") return <span className="badge-owner">Owner</span>;
  if (role === "manager") return <span className="badge-manager">Manager</span>;
  return <span className="badge-staff">Staff</span>;
}

// Nav item definition with role visibility
interface NavItem {
  id: NavPage;
  label: string;
  icon: React.ElementType;
  /** Which roles can see this item. Undefined = all roles. */
  roles?: UserRole[];
  /** If true, only show when allShops.length >= 2 */
  multiShopOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  // Owner Dashboard — multi-shop only
  {
    id: "owner-dashboard",
    label: "Owner Overview",
    icon: Store,
    roles: ["owner"],
    multiShopOnly: true,
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Package,
    roles: ["owner", "manager"],
  },
  {
    id: "stock",
    label: "Stock In/Out",
    icon: ArrowLeftRight,
    roles: ["owner", "manager"],
  },
  { id: "billing", label: "Billing", icon: Receipt },
  { id: "drafts", label: "Draft Sales", icon: FileText },
  {
    id: "customers",
    label: "Customers",
    icon: Users,
    roles: ["owner", "manager"],
  },
  {
    id: "vendors",
    label: "Vendors",
    icon: Building2,
    roles: ["owner", "manager"],
  },
  {
    id: "purchase-orders",
    label: "Purchase Orders",
    icon: ShoppingCart,
    roles: ["owner", "manager"],
  },
  {
    id: "customer-orders",
    label: "Customer Orders",
    icon: ClipboardList,
    roles: ["owner", "manager"],
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart2,
    roles: ["owner", "manager"],
  },
  {
    id: "staff-performance",
    label: "Staff Performance",
    icon: TrendingUp,
    roles: ["owner", "manager"],
  },
  {
    id: "staff-credit",
    label: "Staff Credit Report",
    icon: CreditCard,
    roles: ["owner", "manager"],
  },
  {
    id: "returns",
    label: "Returns",
    icon: RotateCcw,
    roles: ["owner", "manager"],
  },
  {
    id: "staff-management",
    label: "Staff Management",
    icon: UserCog,
    roles: ["owner"],
  },
  {
    id: "attendance",
    label: "Staff Attendance",
    icon: CalendarCheck,
    roles: ["owner", "manager"],
  },
  { id: "admin", label: "Admin Panel", icon: Settings, roles: ["owner"] },
  { id: "history", label: "Draft History", icon: History, roles: ["owner"] },
  {
    id: "settings",
    label: "App Settings",
    icon: SlidersHorizontal,
    roles: ["owner"],
  },
  {
    id: "low-price-log",
    label: "Low Price Log",
    icon: ShieldAlert,
    roles: ["owner"],
  },
  {
    id: "audit-log",
    label: "Audit Log",
    icon: ClipboardList,
    roles: ["owner"],
  },
  {
    id: "reminder-log",
    label: "Reminder Log",
    icon: Bell,
    roles: ["owner", "manager"],
  },
  { id: "diamond-rewards", label: "Diamond Rewards", icon: Gem },
  {
    id: "rankings",
    label: "Rankings",
    icon: Trophy,
    roles: ["owner", "manager"],
  },
  {
    id: "shop-board",
    label: "Live Board",
    icon: LayoutGrid,
    roles: ["owner", "manager"],
  },
  { id: "feedback-page", label: "Feedback", icon: MessageCircle },
  { id: "referral-page", label: "Refer & Earn", icon: Gift },
  {
    id: "super-admin",
    label: "Super Admin",
    icon: ShieldCheck,
    roles: ["owner"],
  },
];

// ─── Auto Mode page sets ──────────────────────────────────────────────────────
// Simple: clean minimal UI — just the basics a beginner needs
const SIMPLE_PAGES = new Set<NavPage>([
  "dashboard",
  "owner-dashboard",
  "stock",
  "billing",
  "customers",
  "settings",
]);

// Smart: balanced — adds inventory, basic reports, credit tracking
const SMART_PAGES = new Set<NavPage>([
  "dashboard",
  "owner-dashboard",
  "inventory",
  "stock",
  "billing",
  "drafts",
  "customers",
  "vendors",
  "reports",
  "returns",
  "settings",
]);

// Pro: all features (same as featureMode 4 / Super)
// — uses full NAV_ITEMS list, no filtering needed

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser, currentShop, logout, allShops } = useAuth();
  const { t } = useLanguage();
  const { appConfig } = useStore();

  const featureMode = (appConfig.featureMode ?? 1) as 1 | 2 | 3 | 4;
  const role = currentUser?.role ?? "staff";
  const multiShopOwner = role === "owner" && allShops.length >= 2;

  // Filter nav items:
  // 1. By role/multi-shop condition
  // 2. By auto mode (autoMode drives featureMode, but we also apply the
  //    auto-mode page sets directly for accurate Simple/Smart filtering)
  const autoModeFromCtx = appConfig.autoMode ?? "simple";

  const roleFiltered = NAV_ITEMS.filter((item) => {
    if (item.roles && !item.roles.includes(role)) return false;
    if (item.multiShopOnly && !multiShopOwner) return false;
    return true;
  });

  let visibleItems: NavItem[];
  if (autoModeFromCtx === "pro" || featureMode === 4) {
    // Pro / Super — all nav items
    visibleItems = roleFiltered;
  } else if (autoModeFromCtx === "smart") {
    visibleItems = roleFiltered.filter((item) => SMART_PAGES.has(item.id));
  } else {
    // simple
    visibleItems = roleFiltered.filter((item) => SIMPLE_PAGES.has(item.id));
  }

  const handleNav = (page: NavPage) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
  };

  function SidebarContent() {
    return (
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sidebar-foreground font-bold text-base leading-tight">
              Save Shop
            </div>
            <div className="text-sidebar-foreground/60 text-xs">
              System v2.0
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            const isOwnerDash = item.id === "owner-dashboard";
            return (
              <button
                type="button"
                key={item.id}
                data-ocid={`nav.${item.id}.link`}
                onClick={() => handleNav(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                  isOwnerDash &&
                    !active &&
                    "border border-primary/20 bg-primary/5 hover:bg-primary/10",
                )}
              >
                <Icon
                  className={cn(
                    "flex-shrink-0",
                    active
                      ? "text-primary"
                      : isOwnerDash
                        ? "text-primary/70"
                        : "",
                  )}
                  size={17}
                />
                <span className="truncate">{t(item.label)}</span>
                {isOwnerDash && (
                  <span className="ml-auto text-[9px] font-bold text-primary bg-primary/10 rounded-full px-1.5 py-0.5 leading-none flex-shrink-0">
                    ALL
                  </span>
                )}
                {active && !isOwnerDash && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info + Logout */}
        {currentUser && (
          <div className="px-3 pb-3">
            <div
              data-ocid="nav.user_info.panel"
              className="px-3 py-2.5 rounded-lg bg-sidebar-accent/40 border border-sidebar-border"
            >
              {currentShop && (
                <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-sidebar-border/60">
                  <Store
                    size={12}
                    className="text-sidebar-foreground/40 flex-shrink-0"
                  />
                  <span className="text-sidebar-foreground/50 text-xs truncate">
                    {currentShop.name}
                  </span>
                  {allShops.length > 1 && (
                    <span className="ml-auto text-[9px] text-primary/60 flex-shrink-0">
                      {allShops.length} shops
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Smartphone size={14} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sidebar-foreground text-xs font-semibold truncate">
                    {currentUser.name || `+91 ${currentUser.mobile}`}
                  </div>
                  <div className="mt-0.5">
                    <RoleBadge role={currentUser.role} />
                  </div>
                </div>
                <button
                  type="button"
                  data-ocid="nav.logout.button"
                  onClick={handleLogout}
                  title="Logout"
                  className="w-7 h-7 flex items-center justify-center rounded-md text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                >
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-sidebar-border">
          <div className="text-sidebar-foreground/40 text-xs">
            &copy; {new Date().getFullYear()} Save Shop System
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 bg-sidebar h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        type="button"
        data-ocid="nav.menu.button"
        className="md:hidden fixed top-4 left-4 z-50 w-9 h-9 bg-sidebar rounded-lg flex items-center justify-center text-sidebar-foreground shadow-lg"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setMobileOpen(false)}
            role="button"
            tabIndex={-1}
            aria-label="Close sidebar"
          />
          <aside className="relative w-56 h-full bg-sidebar animate-slide-in-left flex flex-col">
            <button
              type="button"
              className="absolute top-4 right-4 text-sidebar-foreground/60 hover:text-sidebar-foreground z-10"
              onClick={() => setMobileOpen(false)}
            >
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}

export const MemoSidebar = React.memo(Sidebar);
