import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import type { SyncEngineState } from "../hooks/useSyncEngine";

interface SyncStatusBannerProps {
  engine: SyncEngineState;
}

/**
 * Subtle floating pill — never blocks UI, never shows alarming "Slow internet" text.
 * Renders as a small fixed badge in the bottom-right corner while syncing or on error.
 * Returns null when idle so it disappears completely.
 */
export function SyncStatusBanner({ engine }: SyncStatusBannerProps) {
  const { syncStatus, pendingCount, syncingCount, errorCount, triggerSync } =
    engine;

  // Invisible when idle — no DOM node at all
  if (syncStatus === "idle" || syncStatus === "pending") return null;

  if (syncStatus === "syncing") {
    const total = syncingCount + pendingCount;
    return (
      <div
        className="fixed bottom-20 right-4 z-50 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-800/80 dark:bg-gray-700/90 text-white text-[11px] font-medium shadow-lg backdrop-blur-sm pointer-events-none select-none"
        data-ocid="sync_banner.syncing"
        aria-live="polite"
        aria-label="Updating data"
      >
        <Loader2 size={10} className="animate-spin flex-shrink-0" />
        <span>
          Updating data{total > 1 ? ` (${syncingCount}/${total})` : ""}…
        </span>
      </div>
    );
  }

  if (syncStatus === "error") {
    return (
      <div
        className="fixed bottom-20 right-4 z-50 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-800/80 dark:bg-gray-700/90 text-white text-[11px] font-medium shadow-lg backdrop-blur-sm"
        data-ocid="sync_banner.error"
        role="alert"
        aria-label="Sync failed"
      >
        <AlertCircle size={10} className="flex-shrink-0 text-red-400" />
        <span>Sync failed ({errorCount})</span>
        <button
          type="button"
          onClick={triggerSync}
          data-ocid="sync_banner.retry_button"
          className="ml-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border border-white/30 hover:bg-white/20 transition-colors text-[10px] whitespace-nowrap"
          aria-label="Retry sync"
        >
          <RefreshCw size={9} />
          Retry
        </button>
      </div>
    );
  }

  return null;
}
