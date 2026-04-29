import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChefHat, Clock, RefreshCw, Utensils } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useStore } from "../context/StoreContext";
import { useKotSync } from "../hooks/useKotSync";
import { useRestaurantData } from "../hooks/useRestaurantData";
import type { KOT, KotStatus } from "../types/restaurant";

// ─── Column config ────────────────────────────────────────────────────────────

interface ColumnConfig {
  label: string;
  dotClass: string;
  headerBgClass: string;
  headerTextClass: string;
  cardBorderClass: string;
  cardBgClass: string;
  badgeClass: string;
  nextStatus: KotStatus | null;
  nextLabel: string;
  nextBtnClass: string;
}

const COLUMN_CONFIG: Record<KotStatus, ColumnConfig> = {
  pending: {
    label: "Pending",
    dotClass: "bg-kot-pending",
    headerBgClass: "bg-amber-500/15 border-amber-500/30",
    headerTextClass: "text-amber-600 dark:text-amber-400",
    cardBorderClass: "border-amber-400/40",
    cardBgClass: "bg-amber-500/5",
    badgeClass:
      "bg-amber-500/20 text-amber-700 border-amber-500/30 dark:text-amber-300",
    nextStatus: "cooking",
    nextLabel: "Start Cooking",
    nextBtnClass: "bg-kot-cooking hover:opacity-90 text-white border-0",
  },
  cooking: {
    label: "Cooking",
    dotClass: "bg-kot-cooking",
    headerBgClass: "bg-orange-500/15 border-orange-500/30",
    headerTextClass: "text-orange-600 dark:text-orange-400",
    cardBorderClass: "border-orange-400/50",
    cardBgClass: "bg-orange-500/5",
    badgeClass:
      "bg-orange-500/20 text-orange-700 border-orange-500/30 dark:text-orange-300",
    nextStatus: "ready",
    nextLabel: "Mark Ready",
    nextBtnClass: "bg-kot-ready hover:opacity-90 text-white border-0",
  },
  ready: {
    label: "Ready",
    dotClass: "bg-kot-ready",
    headerBgClass: "bg-green-500/15 border-green-500/30",
    headerTextClass: "text-green-600 dark:text-green-400",
    cardBorderClass: "border-green-400/50",
    cardBgClass: "bg-green-500/5",
    badgeClass:
      "bg-green-500/20 text-green-700 border-green-500/30 dark:text-green-300",
    nextStatus: null,
    nextLabel: "",
    nextBtnClass: "",
  },
};

const KOT_COLUMNS: KotStatus[] = ["pending", "cooking", "ready"];

// ─── Time elapsed badge ───────────────────────────────────────────────────────

function ElapsedBadge({
  createdAt,
  status,
}: { createdAt: string; status: KotStatus }) {
  const elapsed = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / 60000,
  );
  const isUrgent = elapsed >= 10 && status !== "ready";
  const isWarning = elapsed >= 5 && status !== "ready";

  return (
    <span
      className={cn(
        "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
        isUrgent &&
          "bg-red-500/20 text-red-600 dark:text-red-400 animate-pulse",
        isWarning &&
          !isUrgent &&
          "bg-amber-500/20 text-amber-700 dark:text-amber-400",
        !isWarning && "bg-muted text-muted-foreground",
      )}
    >
      <Clock size={10} />
      {elapsed}m
    </span>
  );
}

// ─── KOT Card ────────────────────────────────────────────────────────────────

function KotCard({
  kot,
  index,
  onAdvance,
  onDismiss,
}: {
  kot: KOT;
  index: number;
  onAdvance: (id: string, nextStatus: KotStatus) => void;
  onDismiss: (id: string) => void;
}) {
  const cfg = COLUMN_CONFIG[kot.status];

  const orderTypeLabelMap: Record<string, string> = {
    "dine-in": "Dine-In",
    takeaway: "Takeaway",
    online: "Online",
  };

  return (
    <Card
      data-ocid={`restaurant.kitchen.kot.${index + 1}`}
      className={cn(
        "border-2 transition-all duration-200 shadow-card",
        cfg.cardBorderClass,
        cfg.cardBgClass,
      )}
    >
      <CardHeader className="pb-2 pt-3 px-4">
        {/* KOT number + time */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-bold text-sm text-foreground">
              {kot.kotNumber}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Order {kot.orderNumber}
            </div>
          </div>
          <ElapsedBadge createdAt={kot.createdAt} status={kot.status} />
        </div>

        {/* Table / order type */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {kot.tableNumber ? (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/20">
              Table {kot.tableNumber}
            </span>
          ) : (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
              {orderTypeLabelMap[kot.orderType] ?? kot.orderType}
            </span>
          )}
          {kot.tableNumber && (
            <span className="text-xs text-muted-foreground">
              {orderTypeLabelMap[kot.orderType] ?? kot.orderType}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-3 space-y-3">
        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Items list */}
        <div className="space-y-2">
          {kot.items.map((item, i) => (
            <div
              key={`${item.menuItemId}-${i}`}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-foreground">
                  {item.menuItemName}
                </span>
                {item.portion !== "single" && (
                  <span className="text-xs text-muted-foreground ml-1.5 capitalize">
                    ({item.portion})
                  </span>
                )}
                {item.notes && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5 italic">
                    ↳ {item.notes}
                  </p>
                )}
              </div>
              <span className="text-sm font-bold text-foreground tabular-nums flex-shrink-0">
                ×{item.quantity}
              </span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          {cfg.nextStatus ? (
            <Button
              data-ocid={`restaurant.kitchen.kot.advance.${index + 1}`}
              size="sm"
              className={cn("flex-1 h-9 text-xs font-bold", cfg.nextBtnClass)}
              onClick={() => onAdvance(kot.id, cfg.nextStatus!)}
            >
              {cfg.nextLabel}
            </Button>
          ) : (
            <Button
              data-ocid={`restaurant.kitchen.kot.dismiss.${index + 1}`}
              size="sm"
              variant="outline"
              className="flex-1 h-9 text-xs font-bold border-green-500/40 text-green-700 dark:text-green-400 hover:bg-green-500/10"
              onClick={() => onDismiss(kot.id)}
            >
              ✓ Dismiss (Served)
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Column Header ────────────────────────────────────────────────────────────

function ColumnHeader({
  status,
  count,
}: {
  status: KotStatus;
  count: number;
}) {
  const cfg = COLUMN_CONFIG[status];
  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 rounded-xl border",
        cfg.headerBgClass,
      )}
    >
      <div className="flex items-center gap-2">
        <div className={cn("w-3 h-3 rounded-full", cfg.dotClass)} />
        <span className={cn("font-bold text-base", cfg.headerTextClass)}>
          {cfg.label}
        </span>
      </div>
      <Badge
        variant="secondary"
        className={cn("text-xs font-bold px-2.5", cfg.badgeClass)}
      >
        {count}
      </Badge>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function RestaurantKitchenPage() {
  const { shopId } = useStore();
  const { activeKots, setActiveKots } = useRestaurantData(shopId);
  const [lastRefreshLabel, setLastRefreshLabel] = useState<string>("—");

  const handleKotUpdate = useCallback(
    (kots: KOT[]) => {
      setActiveKots(kots);
      setLastRefreshLabel(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    },
    [setActiveKots],
  );

  const { isSyncing } = useKotSync({
    shopId,
    onUpdate: handleKotUpdate,
    enabled: true,
  });

  const handleAdvance = (id: string, nextStatus: KotStatus) => {
    const now = new Date().toISOString();
    const updated = activeKots.map((kot) =>
      kot.id === id ? { ...kot, status: nextStatus, updatedAt: now } : kot,
    );
    setActiveKots(updated);
    const cfg = COLUMN_CONFIG[nextStatus];
    toast.success(`KOT moved to ${cfg.label}`, { duration: 2500 });
  };

  const handleDismiss = (id: string) => {
    setActiveKots(activeKots.filter((k) => k.id !== id));
    toast.success("KOT dismissed — served!", { duration: 2500 });
  };

  const kotsByStatus = KOT_COLUMNS.reduce<Record<KotStatus, KOT[]>>(
    (acc, s) => {
      acc[s] = activeKots.filter((k) => k.status === s);
      return acc;
    },
    { pending: [], cooking: [], ready: [] },
  );

  const totalActive = activeKots.length;

  return (
    <div
      className="flex flex-col h-full bg-background"
      data-ocid="restaurant.kitchen.page"
    >
      {/* Header bar */}
      <div className="px-4 md:px-6 py-3 border-b border-border bg-card flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <ChefHat size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground leading-tight">
              Kitchen Display (KDS)
            </h1>
            <p className="text-xs text-muted-foreground">
              {totalActive} active KOT{totalActive !== 1 ? "s" : ""} ·
              auto-refresh every 15s
            </p>
          </div>
        </div>

        {/* Sync indicator */}
        <div
          className="flex items-center gap-2 text-xs text-muted-foreground"
          data-ocid="restaurant.kitchen.sync_status"
        >
          {isSyncing ? (
            <>
              <RefreshCw size={12} className="animate-spin text-primary" />
              <span className="text-primary font-medium">Syncing...</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-kot-ready" />
              <span>Live</span>
            </>
          )}
          <span className="hidden sm:inline text-muted-foreground/70">
            · Last: {lastRefreshLabel}
          </span>
        </div>
      </div>

      {/* KOT board */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        {totalActive === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4"
            data-ocid="restaurant.kitchen.empty_state"
          >
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center">
              <Utensils size={36} className="text-muted-foreground/40" />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">
                Kitchen is clear!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                No pending orders right now. Take a breath. 🧑‍🍳
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 h-full">
            {KOT_COLUMNS.map((status) => {
              const kots = kotsByStatus[status];
              return (
                <div key={status} className="flex flex-col gap-3 min-h-0">
                  {/* Column header */}
                  <ColumnHeader status={status} count={kots.length} />

                  {/* KOT cards */}
                  <div className="flex flex-col gap-3 flex-1">
                    {kots.length === 0 ? (
                      <div
                        className="flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed border-border text-muted-foreground gap-2"
                        data-ocid={`restaurant.kitchen.${status}.empty_state`}
                      >
                        <div className="text-2xl opacity-30">
                          {status === "pending" && "⏳"}
                          {status === "cooking" && "🔥"}
                          {status === "ready" && "✅"}
                        </div>
                        <p className="text-sm">
                          No {COLUMN_CONFIG[status].label.toLowerCase()} orders
                        </p>
                      </div>
                    ) : (
                      kots.map((kot, idx) => (
                        <KotCard
                          key={kot.id}
                          kot={kot}
                          index={idx}
                          onAdvance={handleAdvance}
                          onDismiss={handleDismiss}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
