// ===========================================================
// LIVE UI ELEMENTS - DO NOT REMOVE
// The following dynamic components MUST remain in all future updates:
// 1. MarqueeAlertBar - scrolling notification ticker
// 2. AdBannerCarousel - auto-sliding banner
// 3. Card tap animations (active:scale-[0.96])
// 4. Page transition animations (.page-transition)
// 5. Float animation on key icons
// These are core to the app's premium live feel.
// ===========================================================

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
  Building2,
  CalendarCheck,
  CheckCircle,
  Clock,
  CreditCard,
  Eye,
  EyeOff,
  Filter,
  LayoutGrid,
  MessageCircle,
  Navigation,
  Package,
  PackageX,
  Plus,
  Receipt,
  Search,
  ShieldAlert,
  ShoppingCart,
  Skull,
  Star,
  Store,
  ThumbsDown,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
  UserCog,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AdBannerCarousel } from "../components/AdBannerCarousel";
import { AdCardSponsor } from "../components/AdCardSponsor";
import { AdminSummaryCard } from "../components/AdminSummaryCard";
import { DiamondRewardCard } from "../components/DiamondRewardCard";
import { MarqueeAlertBar } from "../components/MarqueeAlertBar";
import { RewardAdButton } from "../components/RewardAdButton";
import { TutorialGuideSection } from "../components/TutorialGuideSection";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useStore } from "../context/StoreContext";
import type { AppConfig, AppUser, NavPage, UserRole } from "../types/store";
import {
  ACTIVITY_COLORS,
  ACTIVITY_LABELS,
  TIER_COLORS,
  TIER_EMOJI,
  TIER_LABELS,
  getActivityStatus,
  getCustomerTier,
} from "../utils/customerTracking";

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
  if (diff < 60) return "Just now";
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
  onNavigate: (page: NavPage, params?: Record<string, unknown>) => void;
}

type PayMode = "cash" | "upi" | "online";

interface MarkPaidState {
  amount: string;
  mode: PayMode;
  saving: boolean;
  success: boolean;
}

// ─── Premium Summary Card ─────────────────────────────────────────────────────
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
    return <div className="flex-1 min-w-0 rounded-2xl bg-transparent" />;
  }

  const schemes = {
    blue: {
      iconBg: "bg-blue-50 dark:bg-blue-950/40",
      iconColor: "text-blue-500",
      accent: "border-t-2 border-t-blue-400",
      value: "text-foreground",
      badge: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    },
    green: {
      iconBg: "bg-green-50 dark:bg-green-950/40",
      iconColor: "text-green-500",
      accent: "border-t-2 border-t-green-400",
      value: "text-foreground",
      badge:
        "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400",
    },
    red: {
      iconBg: "bg-red-50 dark:bg-red-950/40",
      iconColor: "text-red-500",
      accent: "border-t-2 border-t-red-400",
      value: "text-red-600 dark:text-red-400",
      badge: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
    },
    amber: {
      iconBg: "bg-amber-50 dark:bg-amber-950/40",
      iconColor: "text-amber-500",
      accent: "border-t-2 border-t-amber-400",
      value: "text-foreground",
      badge:
        "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    },
    purple: {
      iconBg: "bg-primary/8 dark:bg-primary/10",
      iconColor: "text-primary",
      accent: "border-t-2 border-t-primary",
      value: "text-foreground",
      badge: "bg-primary/8 text-primary",
    },
    emerald: {
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
      iconColor: "text-emerald-600",
      accent: "border-t-2 border-t-emerald-500",
      value: "text-emerald-600 dark:text-emerald-400",
      badge:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
  }[colorScheme];

  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={onClick}
      className={`flex-1 min-w-0 flex flex-col gap-2.5 rounded-2xl p-3.5 bg-card border border-border shadow-card card-interactive active:scale-[0.96] transition-all duration-150 ease-out text-left ${schemes.accent} overflow-hidden`}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center ${schemes.iconBg} flex-shrink-0`}
      >
        <span className={schemes.iconColor}>{icon}</span>
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-none mb-1.5">
          {label}
        </div>
        <div
          className={`text-[18px] font-extrabold ${schemes.value} leading-none truncate`}
        >
          {value}
        </div>
        {sub && (
          <div className="text-[10px] text-muted-foreground mt-1 truncate">
            {sub}
          </div>
        )}
      </div>
    </button>
  );
}

// ─── Pastel Quick Action Card ─────────────────────────────────────────────────
type PastelColor = "purple" | "orange" | "yellow" | "blue" | "green";

function QuickActionBtn({
  icon,
  label,
  onClick,
  pastelColor,
  ocid,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  pastelColor: PastelColor;
  ocid?: string;
  badge?: number;
}) {
  const pastelConfig: Record<
    PastelColor,
    { bg: string; iconColor: string; border: string }
  > = {
    purple: {
      bg: "bg-pastel-purple",
      iconColor: "text-violet-600 dark:text-violet-400",
      border: "border-violet-200 dark:border-violet-800/50",
    },
    orange: {
      bg: "bg-pastel-orange",
      iconColor: "text-orange-600 dark:text-orange-400",
      border: "border-orange-200 dark:border-orange-800/50",
    },
    yellow: {
      bg: "bg-pastel-yellow",
      iconColor: "text-amber-600 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800/50",
    },
    blue: {
      bg: "bg-pastel-blue",
      iconColor: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800/50",
    },
    green: {
      bg: "bg-pastel-green",
      iconColor: "text-green-700 dark:text-green-400",
      border: "border-green-200 dark:border-green-800/50",
    },
  };

  const cfg = pastelConfig[pastelColor];

  return (
    <div className="flex flex-col items-center gap-2 flex-shrink-0">
      <button
        type="button"
        data-ocid={ocid}
        onClick={onClick}
        aria-label={label}
        className={`relative w-[72px] h-[72px] rounded-[18px] flex items-center justify-center shadow-card border ${cfg.bg} ${cfg.border} quick-action-chip`}
      >
        <span className={cfg.iconColor}>{icon}</span>
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1 border-2 border-card">
            {badge}
          </span>
        )}
      </button>
      <span className="text-[11px] font-semibold text-foreground text-center leading-tight max-w-[72px]">
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
      className={`flex flex-col gap-2 rounded-2xl p-3 border ${cardBg} card-interactive active:scale-[0.96] transition-all duration-150 ease-out text-left w-full`}
    >
      <div className="flex items-start justify-between gap-1">
        <p className="text-sm font-bold text-foreground leading-tight line-clamp-2 flex-1 min-w-0">
          {name}
        </p>
        {showProfit && profitPct !== null && (
          <span
            className={`flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-lg ${
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

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-0.5 mb-2.5">
      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
        {children}
      </span>
      {right}
    </div>
  );
}

// ─── Smart Filter Bar ─────────────────────────────────────────────────────────
type FilterKey =
  | "all"
  | "lowStock"
  | "deadStock"
  | "paymentPending"
  | "outOfStock"
  | "expiryAlert"
  | "slowMoving";

interface FilterChip {
  key: FilterKey;
  emoji: string;
  labelEn: string;
  labelHi: string;
  count: number;
  color: {
    active: string;
    activeBg: string;
    inactiveBg: string;
    inactiveBorder: string;
    badge: string;
  };
  show: boolean;
}

function SmartFilterBar({
  chips,
  active,
  onSelect,
  language,
}: {
  chips: FilterChip[];
  active: FilterKey;
  onSelect: (key: FilterKey) => void;
  language: "en" | "hi";
}) {
  const visibleChips = chips.filter((c) => c.show);
  return (
    <div data-ocid="dashboard.smart_filter.section">
      <div className="flex items-center justify-between px-0.5 mb-2">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          {language === "hi" ? "त्वरित फ़िल्टर" : "Quick Filter"}
        </span>
      </div>
      <div
        className="smart-filter-bar-scroll flex gap-2 overflow-x-auto pb-1 -mx-0.5 px-0.5"
        style={
          {
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-x",
          } as React.CSSProperties
        }
      >
        {visibleChips.map((chip) => {
          const isActive = active === chip.key;
          const label = language === "hi" ? chip.labelHi : chip.labelEn;
          return (
            <button
              key={chip.key}
              type="button"
              data-ocid={`dashboard.filter.${chip.key}`}
              aria-pressed={isActive}
              onClick={() => onSelect(chip.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold border transition-all duration-200 active:scale-95 min-h-[36px] ${
                isActive
                  ? `${chip.color.activeBg} ${chip.color.active} border-transparent shadow-sm`
                  : `${chip.color.inactiveBg} text-foreground ${chip.color.inactiveBorder}`
              }`}
            >
              <span className="text-base leading-none">{chip.emoji}</span>
              <span className="whitespace-nowrap text-[13px]">{label}</span>
              {chip.count > 0 && (
                <span
                  className={`ml-0.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1 ${
                    isActive ? "bg-white/30 text-inherit" : chip.color.badge
                  }`}
                >
                  {chip.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Global Search Bar Component ─────────────────────────────────────────────
interface GlobalSearchBarProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  searchContainerRef: React.RefObject<HTMLDivElement | null>;
  globalSearchResults: {
    products: {
      id: string;
      name: string;
      categoryId?: string;
      unit: string;
      sellingPrice: number;
      currentStock: number;
    }[];
    customers: { id: string; name: string; mobile?: string }[];
    vendors: { id: string; name: string; mobile?: string; email?: string }[];
    staff: { id: string; name: string; mobile?: string; role: string }[];
    nav: { page: NavPage; labelEn: string; labelHi: string; icon: string }[];
    filters: {
      key: FilterKey;
      labelEn: string;
      labelHi: string;
      emoji: string;
    }[];
    actions: {
      labelEn: string;
      labelHi: string;
      emoji: string;
      page: NavPage;
    }[];
    hasResults: boolean;
  } | null;
  language: "en" | "hi";
  onNavigate: (page: NavPage, params?: Record<string, unknown>) => void;
  handleFilterSelect: (key: FilterKey) => void;
  isStaff: boolean;
  getProductStock: (id: string) => number;
  t: (key: string) => string;
}

function GlobalSearchBar({
  searchQuery,
  setSearchQuery,
  searchOpen,
  setSearchOpen,
  searchContainerRef,
  globalSearchResults,
  language,
  onNavigate,
  handleFilterSelect,
  isStaff,
  t,
}: GlobalSearchBarProps) {
  const showDropdown = searchQuery.trim().length > 0 && searchOpen;

  return (
    <div ref={searchContainerRef} className="relative z-[150]">
      {/* Search input */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          type="search"
          placeholder={
            language === "hi"
              ? "उत्पाद, ग्राहक, वेंडर, पेज खोजें..."
              : t("Search products, customers, vendors, pages...")
          }
          data-ocid="dashboard.search.input"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
          className="w-full rounded-full bg-muted/60 dark:bg-card border border-border pl-9 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSearchOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Global results dropdown — z-[150] keeps it below mode dropdown (z-[200]) */}
      {showDropdown && (
        <div
          className="absolute top-full mt-2 left-0 right-0 bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
          style={{ maxHeight: "75vh", overflowY: "auto", zIndex: 150 }}
          data-ocid="dashboard.global_search.dropdown"
        >
          {!globalSearchResults || !globalSearchResults.hasResults ? (
            <div
              data-ocid="dashboard.search_results.empty_state"
              className="flex flex-col items-center gap-2 py-8 text-muted-foreground text-sm"
            >
              <Search size={22} className="text-muted-foreground/30" />
              <p>
                {language === "hi" ? "कोई परिणाम नहीं मिला" : "No results found"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {/* Products section */}
              {globalSearchResults.products.length > 0 && (
                <div className="p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                    📦 {language === "hi" ? "उत्पाद" : "Products"}
                  </p>
                  <div className="flex flex-col gap-1">
                    {globalSearchResults.products.map((p, idx) => (
                      <button
                        key={p.id}
                        type="button"
                        data-ocid={`dashboard.global_search.product.${idx + 1}`}
                        onClick={() => {
                          onNavigate("inventory", { selectedProductId: p.id });
                          setSearchQuery("");
                          setSearchOpen(false);
                        }}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/40 active:scale-[0.98] transition-all text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center flex-shrink-0">
                          <Package size={13} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {p.categoryId ?? ""}
                            {p.categoryId ? " · " : ""}
                            {p.currentStock} {p.unit}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-foreground flex-shrink-0">
                          {fmt(p.sellingPrice)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers section */}
              {!isStaff && globalSearchResults.customers.length > 0 && (
                <div className="p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                    👥 {language === "hi" ? "ग्राहक" : "Customers"}
                  </p>
                  <div className="flex flex-col gap-1">
                    {globalSearchResults.customers.map((c, idx) => (
                      <button
                        key={c.id}
                        type="button"
                        data-ocid={`dashboard.global_search.customer.${idx + 1}`}
                        onClick={() => {
                          onNavigate("customers");
                          setSearchQuery("");
                          setSearchOpen(false);
                        }}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/40 active:scale-[0.98] transition-all text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {c.name.slice(0, 1).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {c.name}
                          </p>
                          {c.mobile && (
                            <p className="text-[11px] text-muted-foreground">
                              {c.mobile}
                            </p>
                          )}
                        </div>
                        <Users
                          size={13}
                          className="text-muted-foreground flex-shrink-0"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Vendors section */}
              {!isStaff && globalSearchResults.vendors.length > 0 && (
                <div className="p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                    🏢 {language === "hi" ? "वेंडर" : "Vendors"}
                  </p>
                  <div className="flex flex-col gap-1">
                    {globalSearchResults.vendors.map((v, idx) => (
                      <button
                        key={v.id}
                        type="button"
                        data-ocid={`dashboard.global_search.vendor.${idx + 1}`}
                        onClick={() => {
                          onNavigate("vendors");
                          setSearchQuery("");
                          setSearchOpen(false);
                        }}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/40 active:scale-[0.98] transition-all text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center flex-shrink-0">
                          <Building2
                            size={13}
                            className="text-amber-600 dark:text-amber-400"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {v.name}
                          </p>
                          {v.mobile && (
                            <p className="text-[11px] text-muted-foreground">
                              {v.mobile}
                            </p>
                          )}
                        </div>
                        <Building2
                          size={13}
                          className="text-muted-foreground flex-shrink-0"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Staff section */}
              {!isStaff && globalSearchResults.staff.length > 0 && (
                <div className="p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                    👤 {language === "hi" ? "स्टाफ" : "Staff"}
                  </p>
                  <div className="flex flex-col gap-1">
                    {globalSearchResults.staff.map((u, idx) => (
                      <button
                        key={u.id}
                        type="button"
                        data-ocid={`dashboard.global_search.staff.${idx + 1}`}
                        onClick={() => {
                          onNavigate("staff-management");
                          setSearchQuery("");
                          setSearchOpen(false);
                        }}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/40 active:scale-[0.98] transition-all text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center flex-shrink-0">
                          <UserCog
                            size={13}
                            className="text-purple-600 dark:text-purple-400"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {u.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground capitalize">
                            {u.role}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation / Pages section */}
              {globalSearchResults.nav.length > 0 && (
                <div className="p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                    🧭 {language === "hi" ? "पेज पर जाएं" : "Go to Page"}
                  </p>
                  <div className="flex flex-col gap-1">
                    {globalSearchResults.nav.map((item, idx) => (
                      <button
                        key={item.page}
                        type="button"
                        data-ocid={`dashboard.global_search.nav.${idx + 1}`}
                        onClick={() => {
                          onNavigate(item.page);
                          setSearchQuery("");
                          setSearchOpen(false);
                        }}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-primary/5 active:scale-[0.98] transition-all text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center flex-shrink-0 text-base">
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {language === "hi" ? item.labelHi : item.labelEn}
                          </p>
                        </div>
                        <Navigation
                          size={12}
                          className="text-primary flex-shrink-0"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions section */}
              {globalSearchResults.actions.length > 0 && (
                <div className="p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                    ⚡ {language === "hi" ? "त्वरित क्रिया" : "Quick Actions"}
                  </p>
                  <div className="flex flex-col gap-1">
                    {globalSearchResults.actions.map((a, idx) => (
                      <button
                        key={a.labelEn}
                        type="button"
                        data-ocid={`dashboard.global_search.action.${idx + 1}`}
                        onClick={() => {
                          onNavigate(a.page);
                          setSearchQuery("");
                          setSearchOpen(false);
                        }}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-green-50 dark:hover:bg-green-950/20 active:scale-[0.98] transition-all text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center flex-shrink-0 text-base">
                          {a.emoji}
                        </div>
                        <p className="text-sm font-semibold text-foreground flex-1 min-w-0 truncate">
                          {language === "hi" ? a.labelHi : a.labelEn}
                        </p>
                        <span className="text-[10px] text-green-700 dark:text-green-400 font-semibold flex-shrink-0 bg-green-100 dark:bg-green-950/30 px-1.5 py-0.5 rounded-full">
                          Action
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Filter chips section */}
              {globalSearchResults.filters.length > 0 && (
                <div className="p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                    🔽 {language === "hi" ? "फ़िल्टर लगाएं" : "Apply Filter"}
                  </p>
                  <div className="flex flex-col gap-1">
                    {globalSearchResults.filters.map((chip, idx) => (
                      <button
                        key={chip.key}
                        type="button"
                        data-ocid={`dashboard.global_search.filter.${idx + 1}`}
                        onClick={() => {
                          handleFilterSelect(chip.key);
                          setSearchQuery("");
                          setSearchOpen(false);
                        }}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/20 active:scale-[0.98] transition-all text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center flex-shrink-0 text-base">
                          {chip.emoji}
                        </div>
                        <p className="text-sm font-semibold text-foreground flex-1 min-w-0 truncate">
                          {language === "hi" ? chip.labelHi : chip.labelEn}
                        </p>
                        <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold flex-shrink-0 bg-amber-100 dark:bg-amber-950/30 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <Filter size={9} /> Filter
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
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
    autoMode,
    getPendingReminderRequests,
    approveReminderRequest,
    rejectReminderRequest,
    purchaseOrders,
    customerOrders,
    vendors,
    customers,
    users,
    diamondRewards,
    awardDiamond,
    refreshCounter,
    isPhase1Loading,
    phase2HasPartialError,
  } = useStore();

  const { currentShop, session, currentUser, createNewShop } = useAuth();
  const { t } = useLanguage();
  const { language } = useLanguage();

  const role = currentUser?.role ?? "staff";
  const isOwner = role === "owner";
  const isStaff = role === "staff";

  // ── Dashboard section visibility (Owner-controlled, default visible) ─────
  const isDashSectionVisible = (
    key: keyof NonNullable<AppConfig["dashboardSections"]>,
  ) => {
    return appConfig?.dashboardSections?.[key] !== false;
  };

  // ── Feature mode — controls which sections are rendered ───────────────────
  const featureMode = (appConfig.featureMode ?? 1) as 1 | 2 | 3 | 4;

  /**
   * Returns true if a dashboard section should be shown in the current mode.
   * Mode 1 = Basic:   only todaySummary + FAB.
   * Mode 2 = Normal:  summary, alerts, quickActions, filterBar.
   * Mode 3 = Advance: Normal + banner, marquee, liveBoard, topPerformance.
   * Mode 4 = Super:   everything (fall back to isDashSectionVisible).
   */
  const isModeVisible = (
    section:
      | "marquee"
      | "banner"
      | "quickActions"
      | "filterBar"
      | "todaySummary"
      | "smartAlerts"
      | "topPerformance"
      | "diamonds"
      | "tutorial"
      | "ads"
      | "liveBoard"
      | "referralFeedbackActions"
      | "rankings"
      | "otherSections",
  ): boolean => {
    if (featureMode === 4) return true;
    if (featureMode === 1) {
      return section === "todaySummary";
    }
    if (featureMode === 2) {
      const mode2Visible = new Set([
        "todaySummary",
        "smartAlerts",
        "quickActions",
        "filterBar",
        "otherSections",
        "diamonds",
        "ads",
      ]);
      return mode2Visible.has(section);
    }
    // mode 3 = Advance: mode 2 sections + banner, marquee, liveBoard, topPerformance
    const mode3Visible = new Set([
      "todaySummary",
      "smartAlerts",
      "quickActions",
      "filterBar",
      "otherSections",
      "diamonds",
      "ads",
      "banner",
      "marquee",
      "liveBoard",
      "topPerformance",
    ]);
    return mode3Visible.has(section);
  };

  const [productTab, setProductTab] = useState<
    "all" | "highProfit" | "lowStock" | "fastSelling"
  >("all");

  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // ── Add Shop modal state (for Dashboard quick action) ─────────────────────
  const [showAddShopModal, setShowAddShopModal] = useState(false);
  const [addShopForm, setAddShopForm] = useState({
    name: "",
    address: "",
    city: "",
  });
  const [addShopSaving, setAddShopSaving] = useState(false);

  const handleDashboardCreateShop = async () => {
    if (!addShopForm.name.trim()) return;
    setAddShopSaving(true);
    const result = await createNewShop(
      addShopForm.name.trim(),
      addShopForm.address.trim(),
      addShopForm.city.trim(),
    );
    setAddShopSaving(false);
    if (result.success) {
      setShowAddShopModal(false);
      setAddShopForm({ name: "", address: "", city: "" });
      toast.success(`"${addShopForm.name}" created and switched!`);
    } else {
      toast.error(result.error ?? "Failed to create shop");
    }
  };

  // Close search dropdown on click outside or Escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setSearchOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Section refs for scroll-to navigation
  const refLowStock = useRef<HTMLDivElement>(null);
  const refDeadStock = useRef<HTMLDivElement>(null);
  const refPaymentPending = useRef<HTMLDivElement>(null);
  const refOutOfStock = useRef<HTMLDivElement>(null);
  const refExpiryAlert = useRef<HTMLDivElement>(null);
  const refSlowMoving = useRef<HTMLDivElement>(null);

  const [markPaidOpen, setMarkPaidOpen] = useState<
    Record<string, MarkPaidState>
  >({});

  // Amounts visibility (synced with AdminSummaryCard via localStorage)
  // Default: hidden — user must explicitly tap eye to reveal amounts
  const [amountsVisible, setAmountsVisible] = useState<boolean>(
    () => localStorage.getItem("amountsVisible") === "true",
  );
  useEffect(() => {
    localStorage.setItem("amountsVisible", amountsVisible ? "true" : "false");
  }, [amountsVisible]);
  const showAmt = (value: string) => (amountsVisible ? value : "₹••••");

  // ── Date constants ────────────────────────────────────────────────────────
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayMs = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  // ── Core stats ─────────────────────────────────────────────────────────────
  // These automatically recompute when the underlying data changes.
  // refreshCounter is read to signal intent but deps are managed by the hook itself.
  void refreshCounter; // consumed to satisfy lint — triggers re-render on mutation
  const totalValue = getTotalStockValue();
  const todaySales = useMemo(() => getTodaySales(), [getTodaySales]);
  const todayProfit = getTodayProfit();
  const lowStockItems = useMemo(
    () => getLowStockProducts(),
    [getLowStockProducts],
  );
  const allLedgers = useMemo(
    () => getAllCustomerLedgers(),
    [getAllCustomerLedgers],
  );
  getTotalCreditDue();

  const todayInvoices = useMemo(
    () => getDailySales(todayStr),
    [getDailySales, todayStr],
  );

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

  // ── Top Performance data ────────────────────────────────────────────────────
  const topPerformanceData = useMemo(() => {
    // Top product by total revenue
    const revenueMap = new Map<string, { name: string; revenue: number }>();
    for (const inv of invoices) {
      for (const item of inv.items) {
        const existing = revenueMap.get(item.productId);
        const revenue = item.quantity * item.sellingRate;
        if (existing) {
          existing.revenue += revenue;
        } else {
          revenueMap.set(item.productId, {
            name: item.productName ?? item.productId,
            revenue,
          });
        }
      }
    }
    const topProduct =
      [...revenueMap.values()].sort((a, b) => b.revenue - a.revenue)[0] ?? null;

    // Top customer by total purchases
    const customerMap = new Map<string, { name: string; total: number }>();
    for (const inv of invoices) {
      if (!inv.customerName) continue;
      const key = inv.customerName;
      const existing = customerMap.get(key);
      if (existing) {
        existing.total += inv.totalAmount;
      } else {
        customerMap.set(key, {
          name: inv.customerName,
          total: inv.totalAmount,
        });
      }
    }
    const topCustomer =
      [...customerMap.values()].sort((a, b) => b.total - a.total)[0] ?? null;

    // Top vendor by purchase order count
    const vendorOrderMap = new Map<string, { name: string; count: number }>();
    for (const po of purchaseOrders) {
      const vendorId = po.vendorId ?? "";
      const vendor = vendors.find((v) => v.id === vendorId);
      const vName = vendor?.name ?? vendorId;
      if (!vName) continue;
      const existing = vendorOrderMap.get(vendorId || vName);
      if (existing) {
        existing.count += 1;
      } else {
        vendorOrderMap.set(vendorId || vName, { name: vName, count: 1 });
      }
    }
    const topVendor =
      [...vendorOrderMap.values()].sort((a, b) => b.count - a.count)[0] ?? null;

    // Top diamond earner by user
    const diamondMap = new Map<string, { name: string; count: number }>();
    for (const reward of diamondRewards) {
      const uName = reward.userName ?? "Owner";
      const existing = diamondMap.get(uName);
      if (existing) {
        existing.count += reward.diamondCount ?? 1;
      } else {
        diamondMap.set(uName, { name: uName, count: reward.diamondCount ?? 1 });
      }
    }
    const topDiamondEarner =
      [...diamondMap.values()].sort((a, b) => b.count - a.count)[0] ?? null;

    return { topProduct, topCustomer, topVendor, topDiamondEarner };
  }, [invoices, purchaseOrders, vendors, diamondRewards]);
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

  // ── Search filtering ────────────────────────────────────────────────────────
  const searchLower = searchQuery.trim().toLowerCase();

  // ── Navigation items for global search ──────────────────────────────────────
  const NAV_SEARCH_ITEMS: {
    page: NavPage;
    labelEn: string;
    labelHi: string;
    icon: string;
  }[] = [
    { page: "dashboard", labelEn: "Dashboard", labelHi: "डैशबोर्ड", icon: "🏠" },
    { page: "inventory", labelEn: "Inventory", labelHi: "इन्वेंटरी", icon: "📦" },
    { page: "stock", labelEn: "Stock In/Out", labelHi: "स्टॉक", icon: "↔️" },
    { page: "billing", labelEn: "Billing", labelHi: "बिलिंग", icon: "🧾" },
    { page: "customers", labelEn: "Customers", labelHi: "ग्राहक", icon: "👥" },
    { page: "vendors", labelEn: "Vendors", labelHi: "वेंडर", icon: "🏢" },
    {
      page: "purchase-orders",
      labelEn: "Purchase Orders",
      labelHi: "खरीद ऑर्डर",
      icon: "🛒",
    },
    {
      page: "customer-orders",
      labelEn: "Customer Orders",
      labelHi: "ग्राहक ऑर्डर",
      icon: "📋",
    },
    { page: "reports", labelEn: "Reports", labelHi: "रिपोर्ट", icon: "📊" },
    {
      page: "staff-performance",
      labelEn: "Staff Performance",
      labelHi: "स्टाफ परफॉर्मेंस",
      icon: "📈",
    },
    {
      page: "staff-credit",
      labelEn: "Staff Credit Report",
      labelHi: "स्टाफ क्रेडिट",
      icon: "💳",
    },
    { page: "returns", labelEn: "Returns", labelHi: "वापसी", icon: "↩️" },
    {
      page: "staff-management",
      labelEn: "Staff Management",
      labelHi: "स्टाफ प्रबंधन",
      icon: "👤",
    },
    { page: "admin", labelEn: "Admin Panel", labelHi: "एडमिन पैनल", icon: "⚙️" },
    { page: "settings", labelEn: "App Settings", labelHi: "सेटिंग", icon: "🔧" },
    {
      page: "low-price-log",
      labelEn: "Low Price Log",
      labelHi: "कम दाम लॉग",
      icon: "🔻",
    },
    {
      page: "audit-log",
      labelEn: "Audit Log",
      labelHi: "ऑडिट लॉग",
      icon: "📝",
    },
    {
      page: "reminder-log",
      labelEn: "Reminder Log",
      labelHi: "रिमाइंडर लॉग",
      icon: "🔔",
    },
    {
      page: "diamond-rewards",
      labelEn: "Diamond Rewards",
      labelHi: "डायमंड रिवॉर्ड",
      icon: "💎",
    },
    { page: "rankings", labelEn: "Rankings", labelHi: "रैंकिंग", icon: "🏆" },
    {
      page: "history",
      labelEn: "Draft History",
      labelHi: "ड्राफ्ट हिस्ट्री",
      icon: "🕐",
    },
  ];

  // Filter chip definitions for global search
  const FILTER_CHIP_SEARCH_ITEMS: {
    key: FilterKey;
    labelEn: string;
    labelHi: string;
    emoji: string;
  }[] = [
    { key: "all", labelEn: "All Products", labelHi: "सभी उत्पाद", emoji: "🏠" },
    { key: "lowStock", labelEn: "Low Stock", labelHi: "कम स्टॉक", emoji: "⚠️" },
    {
      key: "deadStock",
      labelEn: "Dead Stock",
      labelHi: "डेड स्टॉक",
      emoji: "💀",
    },
    {
      key: "paymentPending",
      labelEn: "Payment Pending",
      labelHi: "भुगतान बाकी",
      emoji: "💳",
    },
    {
      key: "outOfStock",
      labelEn: "Out of Stock",
      labelHi: "स्टॉक खत्म",
      emoji: "📦",
    },
    {
      key: "expiryAlert",
      labelEn: "Expiry Alert",
      labelHi: "एक्सपायरी अलर्ट",
      emoji: "⏰",
    },
    {
      key: "slowMoving",
      labelEn: "Slow Moving",
      labelHi: "धीमी बिक्री",
      emoji: "🐢",
    },
  ];

  // Quick actions for global search
  interface QuickActionSearchItem {
    labelEn: string;
    labelHi: string;
    emoji: string;
    page: NavPage;
  }
  const QUICK_ACTION_SEARCH_ITEMS: QuickActionSearchItem[] = [
    { labelEn: "Add Stock", labelHi: "स्टॉक जोड़ें", emoji: "📦", page: "stock" },
    {
      labelEn: "Sell / Billing",
      labelHi: "बिक्री करें",
      emoji: "🛒",
      page: "billing",
    },
    {
      labelEn: "Collect Payment",
      labelHi: "भुगतान प्राप्त करें",
      emoji: "💰",
      page: "cash-counter",
    },
    {
      labelEn: "Add Staff",
      labelHi: "स्टाफ जोड़ें",
      emoji: "👤",
      page: "staff-management",
    },
    {
      labelEn: "View Reports",
      labelHi: "रिपोर्ट देखें",
      emoji: "📊",
      page: "reports",
    },
  ];

  // ── Global search results ────────────────────────────────────────────────────
  const globalSearchResults = useMemo(() => {
    if (!searchLower || searchLower.length < 1) return null;

    // Products (up to 5)
    const matchedProducts = products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          (p.categoryId ?? "").toLowerCase().includes(searchLower),
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 5)
      .map((p) => ({ ...p, currentStock: getProductStock(p.id) }));

    // Customers (up to 5) — from raw customers array
    const matchedCustomers = customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          (c.mobile ?? "").includes(searchLower),
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 5);

    // Vendors (up to 5)
    const matchedVendors = vendors
      .filter(
        (v) =>
          v.name.toLowerCase().includes(searchLower) ||
          (v.mobile ?? "").toLowerCase().includes(searchLower) ||
          (v.email ?? "").toLowerCase().includes(searchLower),
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 5);

    // Staff/Users (up to 5)
    const matchedStaff = users
      .filter(
        (u) =>
          u.name.toLowerCase().includes(searchLower) ||
          (u.mobile ?? "").includes(searchLower) ||
          u.role.toLowerCase().includes(searchLower),
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 5);

    // Navigation pages (up to 5)
    const matchedNav = NAV_SEARCH_ITEMS.filter(
      (item) =>
        item.labelEn.toLowerCase().includes(searchLower) ||
        item.labelHi.toLowerCase().includes(searchLower),
    ).slice(0, 5);

    // Filter chips (up to 4)
    const matchedFilters = FILTER_CHIP_SEARCH_ITEMS.filter(
      (chip) =>
        chip.labelEn.toLowerCase().includes(searchLower) ||
        chip.labelHi.toLowerCase().includes(searchLower),
    ).slice(0, 4);

    // Quick actions (up to 4)
    const matchedActions = QUICK_ACTION_SEARCH_ITEMS.filter(
      (a) =>
        a.labelEn.toLowerCase().includes(searchLower) ||
        a.labelHi.toLowerCase().includes(searchLower),
    ).slice(0, 4);

    const hasResults =
      matchedProducts.length > 0 ||
      matchedCustomers.length > 0 ||
      matchedVendors.length > 0 ||
      matchedStaff.length > 0 ||
      matchedNav.length > 0 ||
      matchedFilters.length > 0 ||
      matchedActions.length > 0;

    return {
      products: matchedProducts,
      customers: matchedCustomers,
      vendors: matchedVendors,
      staff: matchedStaff,
      nav: matchedNav,
      filters: matchedFilters,
      actions: matchedActions,
      hasResults,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchLower, products, customers, vendors, users, getProductStock]);

  // ── Active filter product list (for filter chips) ────────────────────────────
  const filterChipProducts = useMemo(() => {
    if (activeFilter === "all" || activeFilter === "paymentPending")
      return null;
    const withStock = products.map((p) => ({
      ...p,
      currentStock: getProductStock(p.id),
      profitPct:
        p.purchasePrice && p.purchasePrice > 0
          ? ((p.sellingPrice - p.purchasePrice) / p.purchasePrice) * 100
          : null,
    }));
    switch (activeFilter) {
      case "lowStock":
        return withStock.filter(
          (p) => p.currentStock > 0 && p.currentStock <= p.minStockAlert,
        );
      case "deadStock":
        return withStock.filter((p) =>
          deadStockItems.some((d) => d.id === p.id),
        );
      case "outOfStock":
        return withStock.filter((p) => p.currentStock === 0);
      case "expiryAlert":
        return withStock.filter((p) =>
          expiryAlerts.some((e) => {
            const prod = products.find((pr) => pr.name === e.productName);
            return prod?.id === p.id;
          }),
        );
      case "slowMoving":
        return withStock.filter((p) =>
          slowMovingItems.some((s) => s.id === p.id),
        );
      default:
        return null;
    }
  }, [
    activeFilter,
    products,
    getProductStock,
    deadStockItems,
    expiryAlerts,
    slowMovingItems,
  ]);
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
      toast.error("Please enter a valid amount");
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
      toast.success(`${fmt(amount)} payment recorded successfully!`);
      setTimeout(() => closeMarkPaid(key), 1500);
    } catch (_) {
      updateMarkPaid(key, { saving: false });
      toast.error("Payment could not be saved, please try again");
    }
  }

  // ── Greeting ──────────────────────────────────────────────────────────────
  const h = new Date().getHours();
  const greeting =
    h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";

  // ── Filter select handler (scroll to section) ─────────────────────────────
  function handleFilterSelect(key: FilterKey) {
    if (key === activeFilter || key === "all") {
      setActiveFilter("all");
      return;
    }
    setActiveFilter(key);
    const refMap: Partial<
      Record<FilterKey, React.RefObject<HTMLDivElement | null>>
    > = {
      lowStock: refLowStock,
      deadStock: refDeadStock,
      paymentPending: refPaymentPending,
      outOfStock: refOutOfStock,
      expiryAlert: refExpiryAlert,
      slowMoving: refSlowMoving,
    };
    const ref = refMap[key];
    if (ref?.current) {
      setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }

  // ── Pending Orders ────────────────────────────────────────────────────────
  const pendingVendorOrders = purchaseOrders.filter(
    (po) => po.status === "pending",
  ).length;
  const pendingCustomerOrders = customerOrders.filter(
    (co) => co.status === "pending",
  ).length;

  // ── Customer Insights (PRO mode + customerTracking only) ──────────────────
  const isProWithTracking =
    autoMode === "pro" && appConfig.featureFlags?.customerTracking === true;

  const customerInsightsData = useMemo(() => {
    if (!isProWithTracking) return null;
    const nowMs = Date.now();

    // Top 5 by totalPurchase
    const top5 = [...customers]
      .sort((a, b) => (b.totalPurchase ?? 0) - (a.totalPurchase ?? 0))
      .slice(0, 5);

    // Inactive: lastVisit 180+ days ago OR undefined
    const inactive = customers.filter((c) => {
      if (!c.lastVisit) return true;
      const days = (nowMs - new Date(c.lastVisit).getTime()) / 86400000;
      return days >= 180;
    });

    // Lost: lastVisit 365+ days ago OR undefined
    const lost = customers.filter((c) => {
      if (!c.lastVisit) return true;
      const days = (nowMs - new Date(c.lastVisit).getTime()) / 86400000;
      return days >= 365;
    });

    // High pending: pendingBalance > 0, top 10
    const highPending = [...customers]
      .filter((c) => (c.pendingBalance ?? c.creditBalance ?? 0) > 0)
      .sort(
        (a, b) =>
          (b.pendingBalance ?? b.creditBalance ?? 0) -
          (a.pendingBalance ?? a.creditBalance ?? 0),
      )
      .slice(0, 10);

    return { top5, inactive, lost, highPending };
  }, [isProWithTracking, customers]);

  // ═══════════════════════════════════════════════════════════════════════════
  // STAFF-ONLY DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════════
  if (isStaff) {
    return (
      <div
        className="flex flex-col min-h-screen bg-background pb-28 w-full"
        style={{ overflowX: "clip" }}
      >
        {/* LIVE UI ELEMENT — DO NOT REMOVE: MarqueeAlertBar */}
        <MarqueeAlertBar />

        {/* Staff greeting strip */}
        <div className="bg-primary/5 border-b border-border px-4 py-2.5">
          <p className="text-xs text-muted-foreground">
            {greeting} 👋{" "}
            <span className="font-semibold text-foreground">{displayName}</span>
            <RoleBadgeInline userRole="staff" />
          </p>
        </div>

        <div className="flex flex-col gap-5 px-3 pt-4">
          {/* ── Global Search Bar ── */}
          <GlobalSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchOpen={searchOpen}
            setSearchOpen={setSearchOpen}
            searchContainerRef={searchContainerRef}
            globalSearchResults={globalSearchResults}
            language={language}
            onNavigate={onNavigate}
            handleFilterSelect={handleFilterSelect}
            isStaff={isStaff}
            getProductStock={getProductStock}
            t={t}
          />

          {/* Staff Summary Cards */}
          <div>
            <SectionHeader>{t("Today's Summary")}</SectionHeader>
            <div className="grid grid-cols-2 gap-2.5">
              <SmartSummaryCard
                icon={<ShoppingCart size={18} />}
                label="My Sales"
                value={fmt(myTodaySales)}
                sub="Today"
                colorScheme="blue"
                onClick={() => onNavigate("billing")}
                ocid="dashboard.staff.my_today_sales"
              />
              <SmartSummaryCard
                icon={<Receipt size={18} />}
                label="Invoices"
                value={String(myTodayInvoices.length)}
                sub="Today"
                colorScheme="purple"
                ocid="dashboard.staff.my_today_invoices"
              />
              <SmartSummaryCard
                icon={<AlertTriangle size={18} />}
                label={t("Low Stock")}
                value={String(lowStockItems.length)}
                sub="Items"
                colorScheme={lowStockItems.length > 0 ? "amber" : "green"}
                onClick={() => onNavigate("inventory")}
                ocid="dashboard.staff.low_stock"
              />
              <SmartSummaryCard
                icon={<PackageX size={18} />}
                label={t("Out of Stock")}
                value={String(outOfStockItems.length)}
                sub="Items"
                colorScheme={outOfStockItems.length > 0 ? "red" : "green"}
                onClick={() => onNavigate("inventory")}
                ocid="dashboard.staff.out_of_stock"
              />
            </div>
          </div>

          {/* Staff Recent Activity */}
          <div
            className="bg-card rounded-2xl shadow-card border border-border overflow-hidden"
            data-ocid="dashboard.recent_activity.section"
          >
            <div className="px-4 pt-3 pb-2.5 border-b border-border/60 flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">
                🕐 Recent Sales
              </span>
              <span className="text-[11px] text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-full">
                Last 10
              </span>
            </div>
            <div className="px-4 py-3">
              {activityFeed.length === 0 ? (
                <div
                  data-ocid="dashboard.recent_activity.empty_state"
                  className="flex flex-col items-center gap-3 py-8 text-muted-foreground text-sm"
                >
                  <Zap size={26} className="text-muted-foreground/30" />
                  <p>No sales yet</p>
                  <Button
                    size="sm"
                    onClick={() => onNavigate("billing")}
                    className="bg-primary text-primary-foreground"
                  >
                    <Receipt size={13} className="mr-1" /> Make First Sale
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
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center flex-shrink-0">
                        <ShoppingCart
                          size={14}
                          className="text-green-600 dark:text-green-400"
                        />
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
    <div
      className="flex flex-col min-h-screen bg-background pb-28 w-full"
      style={{ overflowX: "clip" }}
    >
      {/* ── Shop-switch loading overlay — shown when Phase 1 is in-flight ── */}
      {isPhase1Loading && (
        <div
          data-ocid="dashboard.loading_state"
          className="fixed inset-0 z-[500] flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm gap-4"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Store size={24} className="text-primary animate-pulse" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm font-semibold text-foreground">
                Loading shop data...
              </p>
              <p className="text-xs text-muted-foreground">
                Please wait a moment
              </p>
            </div>
            <div className="flex gap-1.5 mt-1">
              <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0ms]" />
              <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:150ms]" />
              <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
          {/* Skeleton preview */}
          <div className="w-full max-w-sm px-4 flex flex-col gap-3 mt-2">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="h-20 rounded-2xl bg-muted/60 animate-pulse" />
              <div className="h-20 rounded-2xl bg-muted/60 animate-pulse" />
              <div className="h-20 rounded-2xl bg-muted/60 animate-pulse" />
              <div className="h-20 rounded-2xl bg-muted/60 animate-pulse" />
            </div>
            <div className="h-12 rounded-xl bg-muted/40 animate-pulse" />
            <div className="h-32 rounded-2xl bg-muted/40 animate-pulse" />
          </div>
        </div>
      )}

      {/* ── Phase 2 partial error banner ── */}
      {phase2HasPartialError && !isPhase1Loading && (
        <div
          data-ocid="dashboard.error_state"
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300"
        >
          <AlertTriangle size={14} className="flex-shrink-0" />
          <span className="text-xs font-medium flex-1">
            Some data could not be loaded. Sales, customers or payment data may
            be incomplete.
          </span>
          <button
            type="button"
            data-ocid="dashboard.phase2_error.retry_button"
            onClick={() => window.location.reload()}
            className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 underline underline-offset-2 flex-shrink-0"
          >
            Refresh
          </button>
        </div>
      )}
      {/* ===========================================================
          LIVE UI ELEMENT — DO NOT REMOVE: MarqueeAlertBar
          Scrolling alert ticker — persistent in all future updates
          =========================================================== */}
      {isDashSectionVisible("marqueeAlertBar") && isModeVisible("marquee") && (
        <MarqueeAlertBar />
      )}

      {/* Greeting strip */}
      <div className="bg-primary/5 border-b border-border px-4 py-2">
        <p className="text-xs text-muted-foreground">
          {greeting} 👋{" "}
          <span className="font-semibold text-foreground">{displayName}</span>{" "}
          <RoleBadgeInline userRole={role} />
        </p>
      </div>

      <div className="flex flex-col gap-5 px-3 pt-4">
        {/* ── Global Search Bar ── */}
        <GlobalSearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchOpen={searchOpen}
          setSearchOpen={setSearchOpen}
          searchContainerRef={searchContainerRef}
          globalSearchResults={globalSearchResults}
          language={language}
          onNavigate={onNavigate}
          handleFilterSelect={handleFilterSelect}
          isStaff={isStaff}
          getProductStock={getProductStock}
          t={t}
        />
        <div data-ocid="dashboard.quick_actions.section">
          {/* ===========================================================
              LIVE UI ELEMENT — DO NOT REMOVE: AdBannerCarousel
              Auto-sliding banner — persistent in all future updates.
              Placed prominently before Quick Actions for visibility.
              =========================================================== */}
          {/* ===========================================================
            LIVE UI ELEMENT — DO NOT REMOVE: AdBannerCarousel
            Auto-sliding banner — persistent in all future updates.
            Placed prominently before Quick Actions for visibility.
            =========================================================== */}
          {isDashSectionVisible("adBannerCarousel") &&
            isModeVisible("banner") && (
              <div
                className="banner-container mb-4 w-full"
                data-ocid="ad-banner-carousel-wrapper"
                style={{ display: "block", overflow: "visible" }}
              >
                <AdBannerCarousel />
              </div>
            )}
          {isDashSectionVisible("quickActions") &&
            isModeVisible("quickActions") && (
              <>
                <SectionHeader>Quick Actions</SectionHeader>
                <div
                  className="flex gap-3.5 overflow-x-auto scrollbar-hide pb-1 -mx-3 px-3"
                  style={
                    {
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    } as React.CSSProperties
                  }
                >
                  <QuickActionBtn
                    icon={<Package size={24} />}
                    label={t("Add Stock")}
                    onClick={() => onNavigate("stock")}
                    pastelColor="purple"
                    ocid="dashboard.add_stock.button"
                  />
                  <QuickActionBtn
                    icon={<ShoppingCart size={24} />}
                    label={t("Sell")}
                    onClick={() => onNavigate("billing")}
                    pastelColor="orange"
                    ocid="dashboard.new_sale.button"
                  />
                  <QuickActionBtn
                    icon={<Banknote size={24} />}
                    label={t("Collect Payment")}
                    onClick={() => onNavigate("cash-counter")}
                    pastelColor="yellow"
                    ocid="dashboard.collect_payment.button"
                  />
                  {isOwner && (
                    <QuickActionBtn
                      icon={<BarChart2 size={24} />}
                      label={t("Reports")}
                      onClick={() => onNavigate("reports")}
                      pastelColor="blue"
                      ocid="dashboard.view_reports.button"
                    />
                  )}
                  <QuickActionBtn
                    icon={<Users size={24} />}
                    label={t("Customers")}
                    onClick={() => onNavigate("customers")}
                    pastelColor="green"
                    ocid="dashboard.customers.button"
                  />
                  <QuickActionBtn
                    icon={<Receipt size={24} />}
                    label={t("Add Staff")}
                    onClick={() => onNavigate("staff-management")}
                    pastelColor="blue"
                    ocid="dashboard.add_staff.button"
                  />
                  {!isStaff && isModeVisible("liveBoard") && (
                    <QuickActionBtn
                      icon={<LayoutGrid size={24} />}
                      label="Live Board"
                      onClick={() => onNavigate("shop-board")}
                      pastelColor="green"
                      ocid="dashboard.live_board.button"
                    />
                  )}
                  {isModeVisible("referralFeedbackActions") && (
                    <QuickActionBtn
                      icon={<MessageCircle size={24} />}
                      label="Feedback 💬"
                      onClick={() => onNavigate("feedback-page")}
                      pastelColor="purple"
                      ocid="dashboard.feedback.button"
                    />
                  )}
                  {isModeVisible("referralFeedbackActions") && (
                    <QuickActionBtn
                      icon={<Star size={24} />}
                      label="Refer & Earn 🔗"
                      onClick={() => onNavigate("referral-page")}
                      pastelColor="orange"
                      ocid="dashboard.referral.button"
                    />
                  )}
                  {!isStaff && (
                    <QuickActionBtn
                      icon={<CalendarCheck size={24} />}
                      label="Attendance"
                      onClick={() => onNavigate("attendance")}
                      pastelColor="green"
                      ocid="dashboard.attendance.button"
                    />
                  )}
                  {/* + Add Shop — always visible in all modes for owners */}
                  {isOwner && (
                    <QuickActionBtn
                      icon={<Store size={24} />}
                      label={language === "hi" ? "+ शॉप जोड़ें" : "+ Add Shop"}
                      onClick={() => {
                        setAddShopForm({ name: "", address: "", city: "" });
                        setShowAddShopModal(true);
                      }}
                      pastelColor="blue"
                      ocid="dashboard.add_shop.button"
                    />
                  )}
                </div>
              </>
            )}
          {/* + Add Shop shortcut — visible in ALL modes for owners (even Basic) */}
          {isOwner && !isModeVisible("quickActions") && (
            <div className="mt-2">
              <SectionHeader>Manage Shops</SectionHeader>
              <div className="flex gap-3.5 overflow-x-auto scrollbar-hide pb-1 -mx-3 px-3">
                <QuickActionBtn
                  icon={<Store size={24} />}
                  label={language === "hi" ? "+ शॉप जोड़ें" : "+ Add Shop"}
                  onClick={() => {
                    setAddShopForm({ name: "", address: "", city: "" });
                    setShowAddShopModal(true);
                  }}
                  pastelColor="blue"
                  ocid="dashboard.add_shop_basic.button"
                />
              </div>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SMART FILTER BAR — between Quick Actions and Today's Summary
        ══════════════════════════════════════════════════════════════════ */}
        {(() => {
          const filterChips: FilterChip[] = [
            {
              key: "all",
              emoji: "🏠",
              labelEn: "All",
              labelHi: "सभी",
              count: 0,
              color: {
                active: "text-white",
                activeBg: "bg-blue-600",
                inactiveBg: "bg-blue-50 dark:bg-blue-950/30",
                inactiveBorder: "border-blue-200 dark:border-blue-800/40",
                badge: "bg-blue-100 text-blue-700",
              },
              show: true,
            },
            {
              key: "lowStock",
              emoji: "⚠️",
              labelEn: "Low Stock",
              labelHi: "कम स्टॉक",
              count: lowStockItems.length,
              color: {
                active: "text-white",
                activeBg: "bg-amber-500",
                inactiveBg: "bg-amber-50 dark:bg-amber-950/30",
                inactiveBorder: "border-amber-200 dark:border-amber-800/40",
                badge:
                  "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
              },
              show: true,
            },
            {
              key: "deadStock",
              emoji: "💀",
              labelEn: "Dead Stock",
              labelHi: "डेड स्टॉक",
              count: deadStockItems.length,
              color: {
                active: "text-white",
                activeBg: "bg-red-600",
                inactiveBg: "bg-red-50 dark:bg-red-950/30",
                inactiveBorder: "border-red-200 dark:border-red-800/40",
                badge:
                  "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
              },
              show: true,
            },
            {
              key: "paymentPending",
              emoji: "💳",
              labelEn: "Payment Pending",
              labelHi: "भुगतान बाकी",
              count: dueCustomers.length,
              color: {
                active: "text-white",
                activeBg: "bg-violet-600",
                inactiveBg: "bg-violet-50 dark:bg-violet-950/30",
                inactiveBorder: "border-violet-200 dark:border-violet-800/40",
                badge:
                  "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400",
              },
              show: !isStaff,
            },
            {
              key: "outOfStock",
              emoji: "📦",
              labelEn: "Out of Stock",
              labelHi: "स्टॉक खत्म",
              count: outOfStockItems.length,
              color: {
                active: "text-white",
                activeBg: "bg-red-500",
                inactiveBg: "bg-red-50 dark:bg-red-950/30",
                inactiveBorder: "border-red-200 dark:border-red-800/40",
                badge:
                  "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
              },
              show: true,
            },
            {
              key: "expiryAlert",
              emoji: "⏰",
              labelEn: "Expiry Alert",
              labelHi: "एक्सपायरी",
              count: expiryWithin30,
              color: {
                active: "text-white",
                activeBg: "bg-orange-600",
                inactiveBg: "bg-orange-50 dark:bg-orange-950/30",
                inactiveBorder: "border-orange-200 dark:border-orange-800/40",
                badge:
                  "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
              },
              show: appConfig.featureFlags.expiry,
            },
            {
              key: "slowMoving",
              emoji: "🐢",
              labelEn: "Slow Moving",
              labelHi: "धीमी बिक्री",
              count: slowMovingItems.length,
              color: {
                active: "text-white",
                activeBg: "bg-yellow-600",
                inactiveBg: "bg-yellow-50 dark:bg-yellow-950/30",
                inactiveBorder: "border-yellow-200 dark:border-yellow-800/40",
                badge:
                  "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400",
              },
              show: true,
            },
          ];
          return isDashSectionVisible("smartFilterBar") &&
            isModeVisible("filterBar") ? (
            <SmartFilterBar
              chips={filterChips}
              active={activeFilter}
              onSelect={handleFilterSelect}
              language={language}
            />
          ) : null;
        })()}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 2 — TODAY'S SUMMARY (4 premium cards)
        ══════════════════════════════════════════════════════════════════ */}
        {isDashSectionVisible("todaySummary") &&
          isModeVisible("todaySummary") && (
            <div
              data-ocid="dashboard.summary.section"
              className="animate-bounce-in"
            >
              <SectionHeader
                right={
                  <button
                    type="button"
                    data-ocid="dashboard.summary.toggle_visibility"
                    aria-label={
                      amountsVisible ? "Hide amounts" : "Show amounts"
                    }
                    onClick={() => setAmountsVisible((v) => !v)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    {amountsVisible ? (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                }
              >
                {t("Today's Summary")}
              </SectionHeader>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {/* Card 1: Total Sale */}
                <SmartSummaryCard
                  icon={<ShoppingCart size={18} />}
                  label={t("Total Sales")}
                  value={showAmt(fmt(todaySales))}
                  sub="Today"
                  colorScheme="blue"
                  onClick={() => onNavigate("billing")}
                  ocid="dashboard.owner.today_sales"
                />
                <SmartSummaryCard
                  icon={<TrendingUp size={18} />}
                  label={t("Profit")}
                  value={showAmt(fmt(todayProfit))}
                  sub="Today"
                  colorScheme={todayProfit >= 0 ? "emerald" : "red"}
                  onClick={() => onNavigate("reports")}
                  ocid="dashboard.summary.today_profit"
                />

                {/* Card 3: Cash / UPI split — premium inline breakdown */}
                <button
                  type="button"
                  data-ocid="dashboard.summary.cash_upi"
                  onClick={() => onNavigate("reports")}
                  className="flex flex-col gap-2.5 rounded-2xl p-3.5 border-t-2 border-t-amber-400 border border-border bg-card shadow-card card-interactive active:scale-[0.96] transition-all duration-150 ease-out text-left overflow-hidden"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center flex-shrink-0">
                    <Banknote size={18} className="text-amber-500" />
                  </div>
                  <div className="min-w-0 w-full">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-none mb-2">
                      {t("Cash & Online")}
                    </div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        💵 Cash
                      </span>
                      <span className="text-[13px] font-bold text-foreground">
                        {showAmt(fmt(cashToday))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        📱 UPI
                      </span>
                      <span className="text-[13px] font-bold text-foreground">
                        {showAmt(fmt(upiToday))}
                      </span>
                    </div>
                    <div className="border-t border-border/60 pt-1.5 flex items-center justify-between gap-1">
                      <span className="text-[11px] font-semibold text-foreground">
                        Total
                      </span>
                      <span className="text-[13px] font-extrabold text-amber-600">
                        {showAmt(fmt(cashToday + upiToday))}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Card 4: Alerts count */}
                <SmartSummaryCard
                  icon={<AlertCircle size={18} />}
                  label={t("Alerts")}
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
            </div>
          )}

        {/* ══════════════════════════════════════════════════════════════════
            TOP PERFORMANCE MASTER CARD — Premium
        ══════════════════════════════════════════════════════════════════ */}
        {!isStaff &&
          isDashSectionVisible("topPerformance") &&
          isModeVisible("topPerformance") && (
            <div
              className="rounded-2xl overflow-hidden relative animate-bounce-in bg-card"
              data-ocid="dashboard.top_performance.section"
              style={{
                boxShadow:
                  "0 0 0 2px #F59E0B, 0 0 20px rgba(245,158,11,0.22), 0 4px 16px rgba(0,0,0,0.08)",
              }}
            >
              {/* Inner card with gradient background */}
              <div className="bg-gradient-to-br from-card to-amber-50/40 dark:from-card dark:to-amber-950/10 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="px-4 pt-3 pb-2.5 border-b border-amber-200/60 dark:border-amber-800/30 flex items-center gap-2">
                  <span className="text-base">⭐</span>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400 tracking-wide">
                    {language === "hi" ? "टॉप परफॉर्मेंस" : "Top Performance"}
                  </span>
                  {/* PREMIUM badge — top-right */}
                  <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-sm tracking-wide">
                    ✦ PREMIUM
                  </span>
                </div>

                {/* 2×2 Grid */}
                <div className="grid grid-cols-2 divide-x divide-y divide-amber-200/40 dark:divide-amber-800/20">
                  {/* #1 Product */}
                  <div className="flex items-start gap-2 px-3 py-2.5">
                    <div className="flex-shrink-0 mt-0.5">
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-400/25 text-yellow-700 dark:text-yellow-300 border border-yellow-400/40">
                        🥇 Product
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      {topPerformanceData.topProduct ? (
                        <>
                          <p className="text-xs font-bold text-foreground dark:text-white truncate leading-tight">
                            {topPerformanceData.topProduct.name}
                          </p>
                          <p className="text-[10px] text-green-600 dark:text-green-400 font-semibold mt-0.5">
                            {fmt(topPerformanceData.topProduct.revenue)}
                          </p>
                        </>
                      ) : (
                        <p className="text-[11px] text-muted-foreground">—</p>
                      )}
                    </div>
                  </div>

                  {/* #1 Customer */}
                  <div className="flex items-start gap-2 px-3 py-2.5">
                    <div className="flex-shrink-0 mt-0.5">
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-400/20 text-blue-700 dark:text-blue-300 border border-blue-400/30">
                        🥇 Customer
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      {topPerformanceData.topCustomer ? (
                        <>
                          <p className="text-xs font-bold text-foreground dark:text-white truncate leading-tight">
                            {topPerformanceData.topCustomer.name}
                          </p>
                          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                            {fmt(topPerformanceData.topCustomer.total)}
                          </p>
                        </>
                      ) : (
                        <p className="text-[11px] text-muted-foreground">—</p>
                      )}
                    </div>
                  </div>

                  {/* #1 Vendor */}
                  <div className="flex items-start gap-2 px-3 py-2.5">
                    <div className="flex-shrink-0 mt-0.5">
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-400/20 text-orange-700 dark:text-orange-300 border border-orange-400/30">
                        🥇 Vendor
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      {topPerformanceData.topVendor ? (
                        <>
                          <p className="text-xs font-bold text-foreground dark:text-white truncate leading-tight">
                            {topPerformanceData.topVendor.name}
                          </p>
                          <p className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold mt-0.5">
                            {topPerformanceData.topVendor.count} order
                            {topPerformanceData.topVendor.count !== 1
                              ? "s"
                              : ""}
                          </p>
                        </>
                      ) : (
                        <p className="text-[11px] text-muted-foreground">—</p>
                      )}
                    </div>
                  </div>

                  {/* #1 Diamond Earner */}
                  <div className="flex items-start gap-2 px-3 py-2.5">
                    <div className="flex-shrink-0 mt-0.5">
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-400/20 text-purple-700 dark:text-purple-300 border border-purple-400/30">
                        💎 Performer
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      {topPerformanceData.topDiamondEarner ? (
                        <>
                          <p className="text-xs font-bold text-foreground dark:text-white truncate leading-tight">
                            {topPerformanceData.topDiamondEarner.name}
                          </p>
                          <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
                            {topPerformanceData.topDiamondEarner.count} 💎
                          </p>
                        </>
                      ) : (
                        <p className="text-[11px] text-muted-foreground">—</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* ══════════════════════════════════════════════════════════════════
            DIAMOND REWARD CARD — after Today's Summary
        ══════════════════════════════════════════════════════════════════ */}
        {isDashSectionVisible("diamondRewards") &&
          isModeVisible("diamonds") && (
            <DiamondRewardCard
              amountsVisible={amountsVisible}
              onViewAll={() => onNavigate("diamond-rewards")}
            />
          )}

        {/* ── Watch Ad → Earn Diamonds ── */}
        {isModeVisible("ads") && (
          <RewardAdButton
            onEarnDiamond={() => awardDiamond("ad-reward", "Watch Ad Reward")}
          />
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 3 — SMART ALERTS
         ══════════════════════════════════════════════════════════════════ */}
        {/* Service Due Widget — shown when service feature is enabled and there are due vehicles */}
        {appConfig.featureFlags?.service &&
          (() => {
            try {
              const storageKey = `service_reminders_${session?.shopId ?? ""}`;
              const raw = localStorage.getItem(storageKey);
              if (!raw) return null;
              const reminders = JSON.parse(raw) as Array<{
                dueDate: string;
                status: string;
                snoozedUntil?: string;
              }>;
              const todayIso = new Date().toISOString().slice(0, 10);
              const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
              const cutoff = new Date(Date.now() + twoDaysMs)
                .toISOString()
                .slice(0, 10);
              const dueCount = reminders.filter((r) => {
                if (r.status === "dismissed") return false;
                if (
                  r.status === "snoozed" &&
                  r.snoozedUntil &&
                  r.snoozedUntil > todayIso
                )
                  return false;
                return r.dueDate <= cutoff;
              }).length;
              if (dueCount === 0) return null;
              return (
                <button
                  type="button"
                  data-ocid="dashboard.service_due.card"
                  onClick={() => onNavigate("service-repair" as NavPage)}
                  className="flex items-center gap-3 p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl w-full text-left hover:bg-amber-100 dark:hover:bg-amber-950/30 transition-colors active:scale-[0.99]"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🔧</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                      {dueCount} Vehicle{dueCount !== 1 ? "s" : ""} Due for
                      Service
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Tap to view service reminders
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full bg-amber-200 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300">
                    {dueCount}
                  </span>
                </button>
              );
            } catch {
              return null;
            }
          })()}

        {isDashSectionVisible("smartAlerts") &&
          isModeVisible("smartAlerts") && (
            <div
              ref={refLowStock}
              className="bg-card rounded-2xl border border-border overflow-hidden shadow-card"
              data-ocid="dashboard.smart_alerts.section"
            >
              <div className="px-4 pt-3.5 pb-3 border-b border-border/60 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                  <AlertCircle size={14} className="text-amber-500" />
                </div>
                <span className="text-sm font-bold text-foreground">
                  {t("Smart Alerts")}
                </span>
                {totalAlertsCount === 0 ? (
                  <span className="ml-auto text-[10px] font-semibold px-2 py-1 rounded-full bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/40">
                    ✅ All Clear
                  </span>
                ) : (
                  <span className="ml-auto text-[10px] font-bold px-2 py-1 rounded-full bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/40">
                    {totalAlertsCount} Active
                  </span>
                )}
              </div>

              {totalAlertsCount === 0 && !profitMarginLow ? (
                <div className="px-4 py-4 flex items-center gap-3">
                  <CheckCircle
                    size={18}
                    className="text-green-500 flex-shrink-0"
                  />
                  <span className="text-sm text-green-700 dark:text-green-400 font-medium">
                    All clear — no alerts ✅
                  </span>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {/* Low Stock */}
                  {lowStockItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onNavigate("inventory")}
                      data-ocid="dashboard.alerts.low_stock"
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50/40 dark:hover:bg-amber-950/10 active:bg-amber-50/60 transition-colors text-left border-l-4 border-l-amber-400"
                    >
                      <AlertTriangle
                        size={15}
                        className="text-amber-500 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                          Low Stock Alert
                        </div>
                        <div className="text-[11px] text-amber-600 dark:text-amber-500">
                          {lowStockItems.length} item
                          {lowStockItems.length !== 1 ? "s" : ""} below minimum
                          level
                        </div>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex-shrink-0">
                        {lowStockItems.length}
                      </span>
                    </button>
                  )}

                  {/* Low Profit */}
                  {!isStaff && profitMarginLow && todaySales > 0 && (
                    <button
                      type="button"
                      onClick={() => onNavigate("reports")}
                      data-ocid="dashboard.alerts.low_profit"
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50/40 dark:hover:bg-red-950/10 active:bg-red-50/60 transition-colors text-left border-l-4 border-l-red-500"
                    >
                      <TrendingDown
                        size={15}
                        className="text-red-500 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-red-700 dark:text-red-400">
                          Low Profit Alert
                        </div>
                        <div className="text-[11px] text-red-600 dark:text-red-500">
                          Today's profit margin is below 10%
                        </div>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 flex-shrink-0">
                        ⚠️
                      </span>
                    </button>
                  )}

                  {/* Payment Due */}
                  {!isStaff && dueCustomers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onNavigate("customers")}
                      data-ocid="dashboard.alerts.payment_due"
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50/40 dark:hover:bg-red-950/10 active:bg-red-50/60 transition-colors text-left border-l-4 border-l-red-500"
                    >
                      <CreditCard
                        size={15}
                        className="text-red-500 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-red-700 dark:text-red-400">
                          Payment Due Alert
                        </div>
                        <div className="text-[11px] text-red-600 dark:text-red-500">
                          {fmt(totalDue)} pending — {dueCustomers.length}{" "}
                          customer
                          {dueCustomers.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 flex-shrink-0">
                        {dueCustomers.length}
                      </span>
                    </button>
                  )}

                  {/* Out of Stock */}
                  {outOfStockItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onNavigate("inventory")}
                      data-ocid="dashboard.alerts.out_of_stock"
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50/40 dark:hover:bg-red-950/10 active:bg-red-50/60 transition-colors text-left border-l-4 border-l-red-600"
                    >
                      <PackageX
                        size={15}
                        className="text-red-600 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-red-700 dark:text-red-400">
                          Out of Stock
                        </div>
                        <div className="text-[11px] text-red-600 dark:text-red-500">
                          {outOfStockItems.length} product
                          {outOfStockItems.length !== 1 ? "s" : ""} out of stock
                        </div>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 flex-shrink-0">
                        {outOfStockItems.length}
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

        {/* ══════════════════════════════════════════════════════════════════
            CUSTOMER INSIGHTS — PRO mode + customerTracking only
        ══════════════════════════════════════════════════════════════════ */}
        {!isStaff &&
          isProWithTracking &&
          isDashSectionVisible("customerInsights") &&
          customerInsightsData && (
            <div
              className="flex flex-col gap-3"
              data-ocid="dashboard.customer_insights.section"
            >
              {/* Section header */}
              <div className="flex items-center justify-between px-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    🔮 Customer Insights
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-violet-600 text-white">
                    PRO
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate("customers")}
                  className="text-[11px] text-primary font-semibold hover:underline"
                >
                  View All →
                </button>
              </div>

              {/* Card 1 — Top Customers ⭐ */}
              <div
                className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
                data-ocid="dashboard.customer_insights.top_customers.card"
                style={{
                  borderTop: "2px solid #F59E0B",
                }}
              >
                <div className="px-4 pt-3 pb-2.5 border-b border-border/60 flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground dark:text-white">
                    ⭐ Top Customers
                  </span>
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/40">
                    Top 5
                  </span>
                </div>
                <div className="divide-y divide-border/40">
                  {customerInsightsData.top5.length === 0 ? (
                    <div
                      data-ocid="dashboard.customer_insights.top_customers.empty_state"
                      className="flex flex-col items-center gap-2 py-6 text-muted-foreground text-sm"
                    >
                      <Users size={22} className="text-muted-foreground/30" />
                      <p className="text-xs">No customers yet</p>
                    </div>
                  ) : (
                    customerInsightsData.top5.map((c, idx) => {
                      const tier = getCustomerTier(c.totalPurchase);
                      return (
                        <div
                          key={c.id}
                          data-ocid={`dashboard.customer_insights.top_customers.item.${idx + 1}`}
                          className="flex items-center gap-3 px-4 py-2.5"
                        >
                          <span className="w-5 text-[11px] font-bold text-muted-foreground flex-shrink-0">
                            #{idx + 1}
                          </span>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                              {c.name.slice(0, 1).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground dark:text-white truncate">
                              {c.name}
                            </p>
                            <span
                              className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${TIER_COLORS[tier]}`}
                            >
                              {TIER_EMOJI[tier]} {TIER_LABELS[tier]}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-amber-600 dark:text-amber-400 flex-shrink-0">
                            {fmt(c.totalPurchase ?? 0)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Card 2 — Inactive Customers (180+ days) 🔕 */}
              <div
                className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
                data-ocid="dashboard.customer_insights.inactive.card"
                style={{ borderTop: "2px solid #6366F1" }}
              >
                <div className="px-4 pt-3 pb-2.5 border-b border-border/60 flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground dark:text-white">
                    🔕 Inactive Customers
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
                    {customerInsightsData.inactive.length} Inactive
                  </span>
                </div>
                <div className="divide-y divide-border/40">
                  {customerInsightsData.inactive.length === 0 ? (
                    <div
                      data-ocid="dashboard.customer_insights.inactive.empty_state"
                      className="flex items-center gap-2 justify-center py-5 text-green-600 dark:text-green-400 text-sm font-medium"
                    >
                      <CheckCircle size={16} /> All customers active ✅
                    </div>
                  ) : (
                    customerInsightsData.inactive.slice(0, 5).map((c, idx) => {
                      const status = getActivityStatus(c.lastVisit);
                      const daysSince = c.lastVisit
                        ? Math.floor(
                            (Date.now() - new Date(c.lastVisit).getTime()) /
                              86400000,
                          )
                        : null;
                      return (
                        <div
                          key={c.id}
                          data-ocid={`dashboard.customer_insights.inactive.item.${idx + 1}`}
                          className="flex items-center gap-3 px-4 py-2.5"
                        >
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-muted-foreground">
                              {c.name.slice(0, 1).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground dark:text-white truncate">
                              {c.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {c.mobile}
                              {daysSince !== null && (
                                <span className="ml-1">· {daysSince}d ago</span>
                              )}
                              {daysSince === null && " · Never visited"}
                            </p>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${ACTIVITY_COLORS[status]}`}
                          >
                            {ACTIVITY_LABELS[status]}
                          </span>
                        </div>
                      );
                    })
                  )}
                  {customerInsightsData.inactive.length > 5 && (
                    <div className="px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => onNavigate("customers")}
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        +{customerInsightsData.inactive.length - 5} more →
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 3 — Lost Customers (365+ days) ❌ */}
              <div
                className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
                data-ocid="dashboard.customer_insights.lost.card"
                style={{ borderTop: "2px solid #EF4444" }}
              >
                <div className="px-4 pt-3 pb-2.5 border-b border-border/60 flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground dark:text-white">
                    ❌ Lost Customers
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40">
                    {customerInsightsData.lost.length} Lost
                  </span>
                </div>
                <div className="divide-y divide-border/40">
                  {customerInsightsData.lost.length === 0 ? (
                    <div
                      data-ocid="dashboard.customer_insights.lost.empty_state"
                      className="flex items-center gap-2 justify-center py-5 text-green-600 dark:text-green-400 text-sm font-medium"
                    >
                      <CheckCircle size={16} /> No lost customers ✅
                    </div>
                  ) : (
                    customerInsightsData.lost.slice(0, 5).map((c, idx) => {
                      const daysSince = c.lastVisit
                        ? Math.floor(
                            (Date.now() - new Date(c.lastVisit).getTime()) /
                              86400000,
                          )
                        : null;
                      return (
                        <div
                          key={c.id}
                          data-ocid={`dashboard.customer_insights.lost.item.${idx + 1}`}
                          className="flex items-center gap-3 px-4 py-2.5"
                        >
                          <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-red-500 dark:text-red-400">
                              {c.name.slice(0, 1).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground dark:text-white truncate">
                              {c.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {c.mobile}
                            </p>
                          </div>
                          <span className="text-[10px] font-semibold text-red-600 dark:text-red-400 flex-shrink-0">
                            {daysSince !== null
                              ? `⚠ ${daysSince}d no visit`
                              : "⚠ No visit"}
                          </span>
                        </div>
                      );
                    })
                  )}
                  {customerInsightsData.lost.length > 5 && (
                    <div className="px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => onNavigate("customers")}
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        +{customerInsightsData.lost.length - 5} more →
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 4 — High Pending Payments 💰 */}
              <div
                className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
                data-ocid="dashboard.customer_insights.pending.card"
                style={{ borderTop: "2px solid #10B981" }}
              >
                <div className="px-4 pt-3 pb-2.5 border-b border-border/60 flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground dark:text-white">
                    💰 Pending Payments
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                    {customerInsightsData.highPending.length} customers
                  </span>
                </div>
                <div className="divide-y divide-border/40">
                  {customerInsightsData.highPending.length === 0 ? (
                    <div
                      data-ocid="dashboard.customer_insights.pending.empty_state"
                      className="flex items-center gap-2 justify-center py-5 text-green-600 dark:text-green-400 text-sm font-medium"
                    >
                      <CheckCircle size={16} /> No pending payments ✅
                    </div>
                  ) : (
                    customerInsightsData.highPending.map((c, idx) => {
                      const balance = c.pendingBalance ?? c.creditBalance ?? 0;
                      return (
                        <div
                          key={c.id}
                          data-ocid={`dashboard.customer_insights.pending.item.${idx + 1}`}
                          className="flex items-center gap-3 px-4 py-2.5"
                        >
                          <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                              {c.name.slice(0, 1).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground dark:text-white truncate">
                              {c.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {c.mobile}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-red-600 dark:text-red-400 flex-shrink-0">
                            ₹{Math.round(balance).toLocaleString("en-IN")}{" "}
                            <span className="text-[9px] font-normal">
                              pending
                            </span>
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

        {/* ══════════════════════════════════════════════════════════════════
            SMART INSIGHTS CARDS (compact horizontal scrolls)
        ══════════════════════════════════════════════════════════════════ */}
        {!isStaff &&
          isDashSectionVisible("smartInsightsCards") &&
          isModeVisible("otherSections") && (
            <div
              className="bg-card rounded-2xl border border-border p-3.5 shadow-card"
              data-ocid="dashboard.smart_insights_cards.section"
            >
              <div className="flex items-center justify-between px-0.5 mb-2.5">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  💡 {language === "hi" ? "स्मार्ट इनसाइट्स" : "Smart Insights"}
                </span>
              </div>

              {/* Row 1: Most Selling + High Profit */}
              <div
                className="flex gap-2 overflow-x-auto pb-1"
                style={{ scrollbarWidth: "none" } as React.CSSProperties}
              >
                {/* Most Selling */}
                <div className="flex-shrink-0 w-44 rounded-xl border border-border bg-secondary/30 p-2.5 border-l-4 border-l-green-400">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-sm">🔥</span>
                    <span className="text-[11px] font-bold text-foreground">
                      {language === "hi" ? "सबसे ज्यादा बिका" : "Most Selling"}
                    </span>
                  </div>
                  {mostSellingProducts.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground">
                      {language === "hi" ? "डेटा नहीं" : "No data yet"}
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {mostSellingProducts.map((item, i) => (
                        <div
                          key={item.name}
                          className="flex items-center gap-1"
                        >
                          <span className="text-[9px] font-bold text-muted-foreground w-3">
                            #{i + 1}
                          </span>
                          <span className="text-[10px] font-medium text-foreground flex-1 truncate">
                            {item.name}
                          </span>
                          <span className="text-[9px] font-semibold text-green-700 dark:text-green-400">
                            {item.qty}u
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* High Profit */}
                <div className="flex-shrink-0 w-44 rounded-xl border border-border bg-secondary/30 p-2.5 border-l-4 border-l-primary">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-sm">💰</span>
                    <span className="text-[11px] font-bold text-foreground">
                      {language === "hi" ? "ज्यादा मुनाफा" : "High Profit"}
                    </span>
                  </div>
                  {highProfitItems.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground">
                      {language === "hi" ? "डेटा नहीं" : "No data yet"}
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {highProfitItems.map((item, i) => (
                        <div
                          key={item.name}
                          className="flex items-center gap-1"
                        >
                          <span className="text-[9px] font-bold text-muted-foreground w-3">
                            #{i + 1}
                          </span>
                          <span className="text-[10px] font-medium text-foreground flex-1 truncate">
                            {item.name}
                          </span>
                          <span className="text-[9px] font-semibold text-primary">
                            {fmt(item.profit)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Low Stock + Out of Stock + Low Price */}
              <div
                className="flex gap-2 overflow-x-auto pb-1 mt-2"
                style={{ scrollbarWidth: "none" } as React.CSSProperties}
              >
                {/* Low Stock */}
                <div
                  className={`flex-shrink-0 w-36 rounded-xl border border-border bg-secondary/30 p-2.5 ${lowStockItems.length > 0 ? "border-l-4 border-l-amber-400" : ""}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-foreground">
                      ⚠️ {language === "hi" ? "कम स्टॉक" : "Low Stock"}
                    </span>
                    <span
                      className={`text-sm font-extrabold ${lowStockItems.length > 0 ? "text-amber-600 dark:text-amber-400" : "text-green-600"}`}
                    >
                      {lowStockItems.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {lowStockItems.slice(0, 2).map((p) => (
                      <p
                        key={p.id}
                        className="text-[10px] text-muted-foreground truncate"
                      >
                        {p.name}
                      </p>
                    ))}
                    {lowStockItems.length === 0 && (
                      <p className="text-[10px] text-green-600">
                        ✅ {language === "hi" ? "सब सही है" : "All good"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Out of Stock */}
                <div
                  className={`flex-shrink-0 w-36 rounded-xl border border-border bg-secondary/30 p-2.5 ${outOfStockItems.length > 0 ? "border-l-4 border-l-red-500" : ""}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-foreground">
                      🚫 {language === "hi" ? "स्टॉक खत्म" : "Out of Stock"}
                    </span>
                    <span
                      className={`text-sm font-extrabold ${outOfStockItems.length > 0 ? "text-red-600 dark:text-red-400" : "text-green-600"}`}
                    >
                      {outOfStockItems.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {outOfStockItems.slice(0, 2).map((p) => (
                      <p
                        key={p.id}
                        className="text-[10px] text-muted-foreground truncate"
                      >
                        {p.name}
                      </p>
                    ))}
                    {outOfStockItems.length === 0 && (
                      <p className="text-[10px] text-green-600">
                        ✅ {language === "hi" ? "सब उपलब्ध" : "All in stock"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Low Price Alerts (Owner only) */}
                {isOwner && (
                  <div
                    className={`flex-shrink-0 w-36 rounded-xl border border-border bg-secondary/30 p-2.5 ${lowPriceAttemptsToday > 0 ? "border-l-4 border-l-red-400" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-foreground">
                        🔻 {language === "hi" ? "कम दाम अलर्ट" : "Low Price"}
                      </span>
                      <span
                        className={`text-sm font-extrabold ${lowPriceAttemptsToday > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}
                      >
                        {lowPriceAttemptsToday}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {language === "hi" ? "आज के प्रयास" : "Attempts today"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* ── Sponsored Ad Card ── */}
        {isDashSectionVisible("sponsoredAd") && isModeVisible("ads") && (
          <AdCardSponsor />
        )}

        {/* ── Tutorial Guide Section (Free Ad Slot) ── */}
        {isDashSectionVisible("tutorialGuide") && isModeVisible("tutorial") && (
          <TutorialGuideSection />
        )}

        {/* ══════════════════════════════════════════════════════════════════
            FILTER CHIP RESULTS — shown when a filter chip is active
        ══════════════════════════════════════════════════════════════════ */}
        {filterChipProducts !== null && (
          <div
            ref={refSlowMoving}
            className="bg-card rounded-2xl border border-border overflow-hidden shadow-card"
            data-ocid="dashboard.filter_results.section"
          >
            <div className="px-4 pt-3 pb-2.5 border-b border-border/60 flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">
                {activeFilter === "deadStock" && (
                  <span className="flex items-center gap-1.5">
                    💀 {language === "hi" ? "डेड स्टॉक आइटम" : "Dead Stock Items"}
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      ({filterChipProducts.length})
                    </span>
                  </span>
                )}
                {activeFilter === "lowStock" && (
                  <span className="flex items-center gap-1.5">
                    ⚠️ {language === "hi" ? "कम स्टॉक आइटम" : "Low Stock Items"}
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      ({filterChipProducts.length})
                    </span>
                  </span>
                )}
                {activeFilter === "outOfStock" && (
                  <span className="flex items-center gap-1.5">
                    📦 {language === "hi" ? "स्टॉक खत्म" : "Out of Stock"}
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      ({filterChipProducts.length})
                    </span>
                  </span>
                )}
                {activeFilter === "expiryAlert" && (
                  <span className="flex items-center gap-1.5">
                    ⏰{" "}
                    {language === "hi" ? "एक्सपायरी अलर्ट" : "Expiry Alert Items"}
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      ({filterChipProducts.length})
                    </span>
                  </span>
                )}
                {activeFilter === "slowMoving" && (
                  <span className="flex items-center gap-1.5">
                    🐢{" "}
                    {language === "hi"
                      ? "धीमी बिक्री आइटम"
                      : "Slow Moving Items"}
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      ({filterChipProducts.length})
                    </span>
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className="text-[11px] text-primary font-semibold hover:underline"
              >
                {language === "hi" ? "साफ करें ✕" : "Clear ✕"}
              </button>
            </div>
            <div className="p-3">
              {filterChipProducts.length === 0 ? (
                <div
                  data-ocid="dashboard.filter_results.empty_state"
                  className="flex flex-col items-center gap-2 py-6 text-muted-foreground text-sm"
                >
                  <CheckCircle size={22} className="text-green-500/60" />
                  <p>
                    {language === "hi"
                      ? "इस श्रेणी में कोई आइटम नहीं ✅"
                      : "No items in this category ✅"}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {filterChipProducts.map((p, idx) => {
                    const daysSince = (() => {
                      if (activeFilter !== "deadStock") return null;
                      const last = getLastSoldDate(p.id);
                      if (!last) return null;
                      return Math.floor(
                        (todayMs - new Date(last).getTime()) / 86400000,
                      );
                    })();
                    return (
                      <button
                        key={p.id}
                        type="button"
                        data-ocid={`dashboard.filter_results.item.${idx + 1}`}
                        onClick={() => onNavigate("inventory")}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border bg-card hover:bg-secondary/20 active:scale-[0.98] transition-all text-left ${
                          activeFilter === "deadStock"
                            ? "border-red-200 dark:border-red-900/50 border-l-4 border-l-red-500"
                            : activeFilter === "lowStock"
                              ? "border-amber-200 dark:border-amber-900/50 border-l-4 border-l-amber-400"
                              : activeFilter === "outOfStock"
                                ? "border-red-200 dark:border-red-900/50 border-l-4 border-l-red-600"
                                : "border-orange-200 dark:border-orange-900/50 border-l-4 border-l-orange-400"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            activeFilter === "deadStock"
                              ? "bg-red-50 dark:bg-red-950/30"
                              : activeFilter === "lowStock"
                                ? "bg-amber-50 dark:bg-amber-950/30"
                                : activeFilter === "outOfStock"
                                  ? "bg-red-50 dark:bg-red-950/30"
                                  : "bg-orange-50 dark:bg-orange-950/30"
                          }`}
                        >
                          {activeFilter === "deadStock" ? (
                            <Skull
                              size={14}
                              className="text-red-600 dark:text-red-400"
                            />
                          ) : activeFilter === "lowStock" ? (
                            <AlertTriangle
                              size={14}
                              className="text-amber-600 dark:text-amber-400"
                            />
                          ) : activeFilter === "outOfStock" ? (
                            <PackageX
                              size={14}
                              className="text-red-600 dark:text-red-400"
                            />
                          ) : (
                            <Clock
                              size={14}
                              className="text-orange-600 dark:text-orange-400"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {language === "hi" ? "स्टॉक" : "Stock"}:{" "}
                            <span
                              className={
                                p.currentStock <= 0
                                  ? "text-red-600 font-semibold"
                                  : p.currentStock <= 5
                                    ? "text-amber-600 font-semibold"
                                    : "text-foreground"
                              }
                            >
                              {p.currentStock} {p.unit}
                            </span>
                            {daysSince !== null && (
                              <span className="ml-1.5 text-red-500 font-semibold">
                                · {daysSince}{" "}
                                {language === "hi"
                                  ? "दिन से नहीं बिका"
                                  : "days not sold"}
                              </span>
                            )}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-foreground flex-shrink-0">
                          {fmt(p.sellingPrice)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 4 — CUSTOMER DUE (CRED-style)
        ══════════════════════════════════════════════════════════════════ */}
        {!isStaff &&
          isDashSectionVisible("customerDue") &&
          isModeVisible("otherSections") && (
            <div
              ref={refPaymentPending}
              className="bg-card rounded-2xl border border-border overflow-hidden shadow-card"
              data-ocid="dashboard.customer_due.section"
            >
              <div className="px-4 pt-3.5 pb-3 border-b border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
                    <CreditCard size={14} className="text-primary" />
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {t("Customer Due")}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate("customers")}
                  className="text-[11px] text-primary font-semibold hover:underline"
                >
                  View All →
                </button>
              </div>

              {totalDue > 0 && (
                <div className="px-4 py-2.5 border-b border-border bg-red-50/30 dark:bg-red-950/10 flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    Total Pending
                  </span>
                  <span className="text-lg font-extrabold text-red-600 dark:text-red-400">
                    {fmt(totalDue)}
                  </span>
                </div>
              )}

              {top3DueCustomers.length === 0 ? (
                <div
                  data-ocid="dashboard.customer_due.empty_state"
                  className="flex items-center gap-2 justify-center py-5 text-green-600 dark:text-green-400 text-sm font-medium"
                >
                  <CheckCircle size={17} />
                  No Payment Due ✅
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

                          {/* Due amount */}
                          <div className="flex flex-col items-end flex-shrink-0">
                            <span
                              className={`text-base font-extrabold ${
                                l.totalDue > 5000
                                  ? "text-red-600 dark:text-red-400"
                                  : l.totalDue > 500
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-foreground"
                              }`}
                            >
                              {fmt(l.totalDue)}
                            </span>
                            <span
                              className={`text-[9px] font-medium px-1.5 py-0 rounded-full border ${
                                l.totalDue > 5000
                                  ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/40"
                                  : l.totalDue > 500
                                    ? "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40"
                                    : "bg-green-100 text-green-700 border-green-300 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800/40"
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
                                `Hello ${l.customerName},\nYou have an outstanding balance of ₹${Math.round(l.totalDue).toLocaleString("en-IN")}.\n\nKindly make the payment at your earliest convenience.\n\nThank you 🙏\n${currentShop?.name ?? "Save Shop"}`,
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              data-ocid={`dashboard.customer_due.remind.${idx + 1}`}
                              className="flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400 font-semibold bg-green-100 dark:bg-green-950/30 border border-green-200 dark:border-green-800/40 rounded-lg px-3 py-1.5 hover:bg-green-200 transition-colors"
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
                              panelState
                                ? closeMarkPaid(key)
                                : openMarkPaid(key);
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
                                    {(
                                      ["cash", "upi", "online"] as PayMode[]
                                    ).map((m) => (
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
                                    ))}
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
                <div className="px-4 pt-3.5 pb-3 border-b border-border/60 flex items-center gap-2">
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
                        <div className="text-xs text-red-600 dark:text-red-400 font-semibold mt-0.5">
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
        {isOwner && isModeVisible("otherSections") && <AdminSummaryCard />}

        {/* ══════════════════════════════════════════════════════════════════
            PENDING ORDERS WIDGET
        ══════════════════════════════════════════════════════════════════ */}
        {(pendingVendorOrders > 0 || pendingCustomerOrders > 0) &&
          isDashSectionVisible("pendingOrders") && (
            <div
              className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
              data-ocid="dashboard.pending_orders.section"
            >
              <div className="px-4 pt-3.5 pb-3 border-b border-border/60 flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  🛒 Pending Orders
                </span>
                <Badge className="ml-auto bg-secondary text-foreground border-border border text-[10px]">
                  {pendingVendorOrders + pendingCustomerOrders} Pending
                </Badge>
              </div>
              <div className="flex gap-2.5 p-3">
                <button
                  type="button"
                  data-ocid="dashboard.pending_orders.vendor_orders"
                  onClick={() => onNavigate("purchase-orders")}
                  className="flex-1 flex flex-col gap-1.5 rounded-2xl p-3 bg-card border border-border border-l-4 border-l-amber-400 shadow-card card-interactive active:scale-[0.96] transition-all duration-150 text-left"
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
                  className="flex-1 flex flex-col gap-1.5 rounded-2xl p-3 bg-card border border-border border-l-4 border-l-primary shadow-card card-interactive active:scale-[0.96] transition-all duration-150 text-left"
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
        {isDashSectionVisible("productsList") &&
          isModeVisible("otherSections") && (
            <div
              className="bg-card rounded-2xl border border-border overflow-hidden shadow-card"
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
                    <p>No products in this tab</p>
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
          )}

        {/* ══════════════════════════════════════════════════════════════════
            STOCK CONTROL SECTION
        ══════════════════════════════════════════════════════════════════ */}
        {isDashSectionVisible("stockControl") &&
          isModeVisible("otherSections") && (
            <div
              ref={refOutOfStock}
              className="bg-card rounded-2xl border border-border p-4 shadow-card"
              data-ocid="dashboard.stock_control.section"
            >
              <SectionHeader>Stock Control</SectionHeader>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  data-ocid="dashboard.stock.low_stock"
                  onClick={() => onNavigate("inventory")}
                  className={`flex flex-col gap-1.5 rounded-2xl p-3 border shadow-card card-interactive active:scale-[0.96] transition-all duration-150 text-left bg-card border-border ${
                    lowStockItems.length > 0
                      ? "border-l-4 border-l-amber-400"
                      : ""
                  }`}
                >
                  <AlertTriangle
                    size={15}
                    className={
                      lowStockItems.length > 0
                        ? "text-amber-500"
                        : "text-green-500"
                    }
                  />
                  <span
                    className={`text-xl font-extrabold leading-none ${
                      lowStockItems.length > 0
                        ? "text-amber-700 dark:text-amber-400"
                        : "text-green-700 dark:text-green-400"
                    }`}
                  >
                    {lowStockItems.length}
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${
                      lowStockItems.length > 0
                        ? "text-amber-600 dark:text-amber-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {t("Low Stock")}
                  </span>
                </button>
                <button
                  type="button"
                  data-ocid="dashboard.stock.out_of_stock"
                  onClick={() => onNavigate("inventory")}
                  className={`flex flex-col gap-1.5 rounded-2xl p-3 border shadow-card card-interactive active:scale-[0.96] transition-all duration-150 text-left bg-card border-border ${
                    outOfStockItems.length > 0
                      ? "border-l-4 border-l-red-500"
                      : ""
                  }`}
                >
                  <PackageX
                    size={15}
                    className={
                      outOfStockItems.length > 0
                        ? "text-red-500"
                        : "text-green-500"
                    }
                  />
                  <span
                    className={`text-xl font-extrabold leading-none ${
                      outOfStockItems.length > 0
                        ? "text-red-700 dark:text-red-400"
                        : "text-green-700 dark:text-green-400"
                    }`}
                  >
                    {outOfStockItems.length}
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${
                      outOfStockItems.length > 0
                        ? "text-red-600 dark:text-red-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {t("Out of Stock")}
                  </span>
                </button>
                <button
                  type="button"
                  data-ocid="dashboard.stock.value"
                  onClick={() => onNavigate("inventory")}
                  className="flex flex-col gap-1.5 rounded-2xl p-3 border border-border bg-card shadow-card card-interactive active:scale-[0.96] transition-all duration-150 text-left"
                >
                  <Wallet size={15} className="text-primary" />
                  <span className="text-base font-extrabold leading-none text-foreground truncate">
                    {fmt(totalValue)}
                  </span>
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {t("Stock Value")}
                  </span>
                </button>
              </div>
            </div>
          )}

        {/* ══════════════════════════════════════════════════════════════════
            SMART INSIGHTS SECTION
        ══════════════════════════════════════════════════════════════════ */}
        {isDashSectionVisible("smartInsights") &&
          isModeVisible("otherSections") && (
            <div
              className="bg-card rounded-2xl border border-border p-4 shadow-card"
              data-ocid="dashboard.smart_insights.section"
            >
              <SectionHeader>Smart Insights</SectionHeader>
              <div className="flex flex-col gap-2">
                {/* Most Selling */}
                <button
                  type="button"
                  className="rounded-2xl border border-border bg-card shadow-card card-interactive p-3.5 active:scale-[0.99] transition-all duration-150 text-left w-full border-l-4 border-l-green-400"
                  data-ocid="dashboard.insights.most_selling"
                  onClick={() => onNavigate("reports")}
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-6 h-6 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                      <Star
                        size={12}
                        className="text-green-600 dark:text-green-400"
                      />
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      Most Selling Products
                    </span>
                  </div>
                  {mostSellingProducts.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No sales data yet
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {mostSellingProducts.map((item, i) => (
                        <div
                          key={item.name}
                          className="flex items-center gap-2"
                        >
                          <span className="text-[10px] font-bold text-muted-foreground w-4">
                            #{i + 1}
                          </span>
                          <span className="text-xs font-medium text-foreground flex-1 truncate">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-secondary text-foreground border border-border">
                            {item.qty} units
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </button>

                {/* High Profit Items */}
                <button
                  type="button"
                  className="rounded-2xl border border-border bg-card shadow-card card-interactive p-3.5 active:scale-[0.99] transition-all duration-150 text-left w-full border-l-4 border-l-primary"
                  data-ocid="dashboard.insights.high_profit"
                  onClick={() => onNavigate("reports")}
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-6 h-6 rounded-lg bg-primary/8 flex items-center justify-center">
                      <TrendingUp size={12} className="text-primary" />
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      High Profit Items
                    </span>
                  </div>
                  {highProfitItems.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No profit data yet
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {highProfitItems.map((item, i) => (
                        <div
                          key={item.name}
                          className="flex items-center gap-2"
                        >
                          <span className="text-[10px] font-bold text-muted-foreground w-4">
                            #{i + 1}
                          </span>
                          <span className="text-xs font-medium text-foreground flex-1 truncate">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/40">
                            {fmt(item.profit)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </button>

                {/* Low Price Attempts (Owner only) */}
                {isOwner && (
                  <button
                    type="button"
                    className="rounded-2xl border border-border bg-card shadow-card card-interactive p-3.5 active:scale-[0.99] transition-all duration-150 text-left w-full border-l-4 border-l-amber-400"
                    data-ocid="dashboard.insights.low_price"
                    onClick={() => onNavigate("low-price-log")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                          <ShieldAlert
                            size={12}
                            className="text-amber-600 dark:text-amber-400"
                          />
                        </div>
                        <span className="text-xs font-bold text-foreground">
                          Low Price Attempts Today
                        </span>
                      </div>
                      <span
                        className={`text-xl font-extrabold ${
                          lowPriceAttemptsToday > 0
                            ? "text-amber-700 dark:text-amber-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {lowPriceAttemptsToday}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1.5 pl-8">
                      Tap to view full log →
                    </p>
                  </button>
                )}
              </div>
            </div>
          )}

        {/* ══════════════════════════════════════════════════════════════════
            INVENTORY HEALTH SECTION
        ══════════════════════════════════════════════════════════════════ */}
        {isDashSectionVisible("inventoryHealth") &&
          isModeVisible("otherSections") && (
            <div
              ref={(el) => {
                (
                  refDeadStock as React.MutableRefObject<HTMLDivElement | null>
                ).current = el;
                (
                  refExpiryAlert as React.MutableRefObject<HTMLDivElement | null>
                ).current = el;
              }}
              className="bg-card rounded-2xl border border-border p-4 shadow-card"
              data-ocid="dashboard.inventory_health.section"
            >
              <SectionHeader>Inventory Health</SectionHeader>
              <div className="flex gap-2">
                {appConfig.featureFlags.expiry && (
                  <button
                    type="button"
                    data-ocid="dashboard.health.expiry"
                    onClick={() => onNavigate("inventory")}
                    className={`flex-1 min-w-0 flex flex-col gap-2 rounded-2xl p-3 border bg-card shadow-card active:scale-[0.96] transition-all duration-150 text-left border-border ${
                      expiryWithin30 > 0 ? "border-l-4 border-l-orange-400" : ""
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        expiryWithin30 > 0
                          ? "bg-orange-50 dark:bg-orange-950/30"
                          : "bg-green-50 dark:bg-green-950/30"
                      }`}
                    >
                      <Clock
                        size={15}
                        className={
                          expiryWithin30 > 0
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-green-600 dark:text-green-400"
                        }
                      />
                    </div>
                    <span
                      className={`text-xl font-extrabold leading-none ${
                        expiryWithin30 > 0
                          ? "text-orange-700 dark:text-orange-400"
                          : "text-green-700 dark:text-green-400"
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
                    className={`flex-1 min-w-0 flex flex-col gap-2 rounded-2xl p-3 border bg-card shadow-card active:scale-[0.96] transition-all duration-150 text-left border-border ${
                      deadStockItems.length > 0
                        ? "border-l-4 border-l-red-500"
                        : ""
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        deadStockItems.length > 0
                          ? "bg-red-50 dark:bg-red-950/30"
                          : "bg-green-50 dark:bg-green-950/30"
                      }`}
                    >
                      <Skull
                        size={15}
                        className={
                          deadStockItems.length > 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-green-400"
                        }
                      />
                    </div>
                    <span
                      className={`text-xl font-extrabold leading-none ${
                        deadStockItems.length > 0
                          ? "text-red-700 dark:text-red-400"
                          : "text-green-700 dark:text-green-400"
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
                  className={`flex-1 min-w-0 flex flex-col gap-2 rounded-2xl p-3 border bg-card shadow-card active:scale-[0.96] transition-all duration-150 text-left border-border ${
                    slowMovingItems.length > 0
                      ? "border-l-4 border-l-amber-400"
                      : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      slowMovingItems.length > 0
                        ? "bg-amber-50 dark:bg-amber-950/30"
                        : "bg-green-50 dark:bg-green-950/30"
                    }`}
                  >
                    <TrendingDown
                      size={15}
                      className={
                        slowMovingItems.length > 0
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-green-600 dark:text-green-400"
                      }
                    />
                  </div>
                  <span
                    className={`text-xl font-extrabold leading-none ${
                      slowMovingItems.length > 0
                        ? "text-amber-700 dark:text-amber-400"
                        : "text-green-700 dark:text-green-400"
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
          )}

        {/* ══════════════════════════════════════════════════════════════════
            RECENT ACTIVITY SECTION
        ══════════════════════════════════════════════════════════════════ */}
        {isDashSectionVisible("recentActivity") &&
          isModeVisible("otherSections") && (
            <div
              className="bg-card rounded-2xl border border-border overflow-hidden shadow-card"
              data-ocid="dashboard.recent_activity.section"
            >
              <div className="px-4 pt-3.5 pb-3 border-b border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
                    <Zap size={13} className="text-muted-foreground" />
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {t("Recent Activity")}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-full">
                  Last 10
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
                              ? "bg-green-100 dark:bg-green-950/40"
                              : item.kind === "txn" && item.type === "in"
                                ? "bg-blue-100 dark:bg-blue-950/40"
                                : "bg-orange-100 dark:bg-orange-950/40"
                          }`}
                        >
                          {item.kind === "invoice" ? (
                            <ShoppingCart
                              size={14}
                              className="text-green-600 dark:text-green-400"
                            />
                          ) : item.kind === "txn" && item.type === "in" ? (
                            <ArrowDownToLine
                              size={14}
                              className="text-blue-600 dark:text-blue-400"
                            />
                          ) : (
                            <ArrowUpFromLine
                              size={14}
                              className="text-orange-500 dark:text-orange-400"
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
          )}

        {/* Low Price Alert Banner (Owner only) */}
        {isOwner && lowPriceAttemptsToday > 0 && (
          <button
            type="button"
            data-ocid="dashboard.low_price_banner"
            onClick={() => onNavigate("low-price-log")}
            className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-2xl p-4 text-left active:scale-[0.99] transition-all duration-150"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center flex-shrink-0">
                <ShieldAlert
                  size={15}
                  className="text-red-600 dark:text-red-400"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-red-700 dark:text-red-400">
                  ⚠️ Low Price Attempts Today
                </p>
                <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">
                  {lowPriceAttemptsToday} attempt
                  {lowPriceAttemptsToday !== 1 ? "s" : ""} recorded — Tap to
                  view full log
                </p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-600 text-white flex-shrink-0">
                {lowPriceAttemptsToday}
              </span>
            </div>
          </button>
        )}

        {/* Empty State for fresh shop */}
        {products.length === 0 && invoices.length === 0 && (
          <div
            className="rounded-2xl border border-dashed border-muted-foreground/30 bg-card p-6 text-center shadow-card"
            data-ocid="dashboard.empty_state"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-3">
              <Package size={28} className="text-primary/60" />
            </div>
            <p className="font-bold text-base text-foreground mb-1">
              Your shop is empty
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Add products in Admin Panel to see data on the dashboard.
            </p>
            {isOwner && (
              <Button
                size="sm"
                onClick={() => onNavigate("admin")}
                className="bg-primary text-primary-foreground"
              >
                <Plus size={14} className="mr-1" /> Add First Product
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ── Add Shop Modal (from Dashboard quick action) ── */}
      {showAddShopModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          data-ocid="dashboard.add_shop_modal"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAddShopModal(false)}
            onKeyDown={(e) => e.key === "Escape" && setShowAddShopModal(false)}
            role="presentation"
          />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-base text-foreground">
                {language === "hi" ? "नई शॉप बनाएं" : "Create New Shop"}
              </h3>
              <button
                type="button"
                data-ocid="dashboard.add_shop_modal.close_button"
                onClick={() => setShowAddShopModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-lg leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="space-y-3 mb-5">
              <div>
                <label
                  htmlFor="dash-shop-name"
                  className="block text-xs font-medium text-foreground mb-1"
                >
                  {language === "hi" ? "शॉप का नाम" : "Shop Name"}{" "}
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  id="dash-shop-name"
                  data-ocid="dashboard.add_shop_modal.name_input"
                  value={addShopForm.name}
                  onChange={(e) =>
                    setAddShopForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder={
                    language === "hi"
                      ? "जैसे: शर्मा इलेक्ट्रॉनिक्स"
                      : "e.g. Sharma Electronics"
                  }
                  className="h-9 text-sm"
                  autoFocus
                />
              </div>
              <div>
                <label
                  htmlFor="dash-shop-address"
                  className="block text-xs font-medium text-foreground mb-1"
                >
                  {language === "hi" ? "पता" : "Address"}
                </label>
                <Input
                  id="dash-shop-address"
                  data-ocid="dashboard.add_shop_modal.address_input"
                  value={addShopForm.address}
                  onChange={(e) =>
                    setAddShopForm((p) => ({ ...p, address: e.target.value }))
                  }
                  placeholder={
                    language === "hi"
                      ? "सड़क / क्षेत्र (वैकल्पिक)"
                      : "Street / Area (optional)"
                  }
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="dash-shop-city"
                  className="block text-xs font-medium text-foreground mb-1"
                >
                  {language === "hi" ? "शहर" : "City"}
                </label>
                <Input
                  id="dash-shop-city"
                  data-ocid="dashboard.add_shop_modal.city_input"
                  value={addShopForm.city}
                  onChange={(e) =>
                    setAddShopForm((p) => ({ ...p, city: e.target.value }))
                  }
                  placeholder={
                    language === "hi" ? "शहर (वैकल्पिक)" : "City (optional)"
                  }
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                data-ocid="dashboard.add_shop_modal.cancel_button"
                onClick={() => setShowAddShopModal(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-secondary text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                {language === "hi" ? "रद्द करें" : "Cancel"}
              </button>
              <button
                type="button"
                data-ocid="dashboard.add_shop_modal.submit_button"
                onClick={handleDashboardCreateShop}
                disabled={addShopSaving || !addShopForm.name.trim()}
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {addShopSaving && (
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}
                {language === "hi" ? "शॉप बनाएं" : "Create Shop"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
