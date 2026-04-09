import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, CheckCircle, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";

interface TopBarProps {
  title: string;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  canGoBack?: boolean;
  goBack?: () => void;
}

export function TopBar({
  title,
  searchValue,
  onSearchChange,
  canGoBack = false,
  goBack,
}: TopBarProps) {
  const { getLowStockProducts, getAllCustomerLedgers } = useStore();
  const { currentUser, session, currentShop } = useAuth();

  const lowStockCount = getLowStockProducts().length;
  const dueCount = getAllCustomerLedgers().filter((l) => l.totalDue > 0).length;
  const role = currentUser?.role ?? "staff";
  const isStaff = role === "staff";

  const totalNotifCount = isStaff ? lowStockCount : lowStockCount + dueCount;

  // Compute dynamic initials from current user name or mobile
  const initials = (() => {
    const name = currentUser?.name?.trim();
    if (name) {
      const parts = name.split(" ").filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    const mobile = session?.mobile;
    if (mobile) return mobile.slice(-2);
    return "AD";
  })();

  const displayName =
    currentUser?.name || currentShop?.name || session?.mobile || "Admin";

  const roleBadgeClass =
    role === "owner"
      ? "bg-blue-100 text-blue-700 border-blue-200"
      : role === "manager"
        ? "bg-purple-100 text-purple-700 border-purple-200"
        : "bg-muted text-muted-foreground border-border";

  const roleLabel =
    role === "owner" ? "Owner" : role === "manager" ? "Manager" : "Staff";

  const shopName = currentShop?.name ?? "Save Shop";

  const lowStockItems = getLowStockProducts();

  return (
    <header
      className="bg-card border-b border-border px-3 md:px-5 py-2.5 flex items-center gap-2 sticky top-0 z-30 shadow-sm"
      data-ocid="topbar.header"
    >
      {/* Back button OR mobile spacer */}
      {canGoBack && goBack ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={goBack}
          data-ocid="topbar.back_button"
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground px-2 h-8 -ml-1 flex-shrink-0"
          aria-label="Go back"
        >
          <span className="text-lg font-bold leading-none">←</span>
          <span className="text-sm font-medium hidden sm:inline">Back</span>
        </Button>
      ) : (
        <div className="w-10 md:hidden flex-shrink-0" />
      )}

      {/* LEFT: Shop Name (bold, prominent) */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col leading-tight">
          <span className="text-base font-bold text-foreground truncate">
            {shopName}
          </span>
          {/* Page title shown on non-dashboard pages or desktop */}
          {title !== shopName && (
            <span className="text-[11px] text-muted-foreground truncate hidden sm:block">
              {title}
            </span>
          )}
        </div>
      </div>

      {/* Search (if provided) */}
      {onSearchChange && (
        <div className="flex-1 max-w-xs">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={15}
            />
            <Input
              data-ocid="topbar.search_input"
              placeholder="Search..."
              className="pl-9 h-8 text-sm bg-secondary border-0"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* RIGHT: Bell + Profile */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Notification Bell with popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              data-ocid="topbar.notification_bell"
              className="relative w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Notifications"
            >
              <Bell size={15} />
              {totalNotifCount > 0 && (
                <Badge className="absolute -top-1 -right-1 min-w-[16px] h-4 p-0 px-0.5 text-[9px] flex items-center justify-center bg-destructive text-destructive-foreground border-0">
                  {totalNotifCount}
                </Badge>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 p-0 shadow-lg">
            <div className="p-3 border-b border-border flex items-center gap-2">
              <Bell size={13} className="text-primary" />
              <span className="text-sm font-semibold">Notifications</span>
              {totalNotifCount > 0 && (
                <Badge className="bg-red-500 text-white border-0 text-[10px] ml-auto">
                  {totalNotifCount}
                </Badge>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-border">
              {totalNotifCount === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground text-sm">
                  <CheckCircle size={20} className="text-green-500" />
                  Koi alert nahi ✅
                </div>
              ) : (
                <>
                  {lowStockItems.length > 0 && (
                    <div className="p-3">
                      <p className="text-[11px] font-semibold text-amber-600 uppercase mb-2">
                        Low Stock ({lowStockItems.length})
                      </p>
                      {lowStockItems.slice(0, 5).map((p) => (
                        <div
                          key={p.id}
                          className="flex justify-between text-xs py-0.5"
                        >
                          <span className="text-foreground truncate max-w-[140px]">
                            {p.name}
                          </span>
                          <span className="text-amber-600 font-medium ml-2">
                            {p.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {!isStaff && dueCount > 0 && (
                    <div className="p-3">
                      <p className="text-[11px] font-semibold text-red-600 uppercase mb-2">
                        Due Payments ({dueCount})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {dueCount} customer(s) have pending dues
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Profile: Avatar + name + role badge */}
        <div
          className="flex items-center gap-1.5 cursor-default"
          data-ocid="topbar.profile"
        >
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-xs font-semibold text-foreground truncate max-w-[100px]">
              {displayName}
            </span>
            <span
              className={`text-[10px] font-medium border rounded-full px-1.5 py-0 leading-4 w-fit ${roleBadgeClass}`}
            >
              {roleLabel}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
