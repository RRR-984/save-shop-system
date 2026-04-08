import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Bell, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "../context/StoreContext";

interface TopBarProps {
  title: string;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
}

export function TopBar({
  title: _title,
  searchValue,
  onSearchChange,
}: TopBarProps) {
  const { getLowStockProducts } = useStore();
  const [now, setNow] = useState(new Date());
  const lowStockCount = getLowStockProducts().length;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header className="bg-card border-b border-border px-4 md:px-6 py-3 flex items-center gap-4">
      {/* Mobile spacer */}
      <div className="w-12 md:hidden" />

      {/* Search */}
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

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto">
        <div className="hidden sm:flex text-xs text-muted-foreground">
          {dateStr} &middot; {timeStr}
        </div>

        {/* Bell */}
        <div className="relative">
          <button
            type="button"
            className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bell size={15} />
          </button>
          {lowStockCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 text-[9px] flex items-center justify-center bg-destructive text-destructive-foreground">
              {lowStockCount}
            </Badge>
          )}
        </div>

        {/* Avatar */}
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
            AD
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
