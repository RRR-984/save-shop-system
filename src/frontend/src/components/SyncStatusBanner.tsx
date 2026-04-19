import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import type { SyncEngineState } from "../hooks/useSyncEngine";

interface SyncStatusBannerProps {
  engine: SyncEngineState;
}

export function SyncStatusBanner({ engine }: SyncStatusBannerProps) {
  const { syncStatus, pendingCount, syncingCount, errorCount, triggerSync } =
    engine;

  // Only visible during syncing or error states
  if (syncStatus === "idle" || syncStatus === "pending") return null;

  if (syncStatus === "syncing") {
    const total = syncingCount + pendingCount;
    return (
      <div
        className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white text-xs font-medium"
        data-ocid="sync_banner.syncing"
        aria-live="polite"
      >
        <Loader2 size={12} className="animate-spin flex-shrink-0" />
        <span>
          Syncing data
          {total > 1 ? ` (${syncingCount}/${total})` : ""}…
        </span>
      </div>
    );
  }

  if (syncStatus === "error") {
    return (
      <div
        className="flex items-center justify-between gap-2 px-4 py-1.5 bg-destructive/90 text-white text-xs font-medium"
        data-ocid="sync_banner.error"
        role="alert"
      >
        <div className="flex items-center gap-2 min-w-0">
          <AlertCircle size={12} className="flex-shrink-0" />
          <span className="truncate">
            Sync failed for {errorCount} record{errorCount !== 1 ? "s" : ""}
          </span>
        </div>
        <button
          type="button"
          onClick={triggerSync}
          data-ocid="sync_banner.retry_button"
          className="flex items-center gap-1 px-2 py-0.5 rounded border border-white/40 hover:bg-white/20 transition-colors whitespace-nowrap flex-shrink-0"
        >
          <RefreshCw size={10} />
          Retry
        </button>
      </div>
    );
  }

  return null;
}
