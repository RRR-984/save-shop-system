/**
 * SyncStatusBar — compact non-intrusive sync + active user indicator.
 * Renders above the main content when user is authenticated.
 * Shows "Syncing..." for 2s after each sync. Shows "X users active" when > 1.
 * Never shows full-width banners — stays minimal.
 */

import { RefreshCw, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface SyncStatusBarProps {
  isSyncing: boolean;
  lastSyncAt: Date | null;
  pendingCount?: number;
  activeUsers?: number;
}

export function SyncStatusBar({
  isSyncing,
  lastSyncAt,
  pendingCount = 0,
  activeUsers = 0,
}: SyncStatusBarProps) {
  // Show "Syncing..." for 2s after each sync completes
  const [showSyncing, setShowSyncing] = useState(false);

  useEffect(() => {
    if (isSyncing) {
      setShowSyncing(true);
      return;
    }
    if (!isSyncing && lastSyncAt) {
      // Keep visible 2s after sync finishes
      const timer = setTimeout(() => setShowSyncing(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSyncing, lastSyncAt]);

  const hasContent = showSyncing || pendingCount > 0 || activeUsers > 1;

  if (!hasContent) return null;

  return (
    <div
      data-ocid="sync_status_bar"
      className="flex items-center gap-3 px-4 py-1.5 bg-muted/40 border-b border-border/50 text-xs text-muted-foreground"
      aria-live="polite"
      aria-atomic="true"
    >
      {showSyncing && (
        <span
          data-ocid="sync_status_bar.loading_state"
          className="flex items-center gap-1 text-primary/70"
        >
          <RefreshCw size={10} className={isSyncing ? "animate-spin" : ""} />
          {isSyncing ? "Syncing..." : "Updated"}
        </span>
      )}

      {pendingCount > 0 && (
        <span
          data-ocid="sync_status_bar.pending_count"
          className="flex items-center gap-1 text-amber-600 dark:text-amber-400"
        >
          {pendingCount} pending
        </span>
      )}

      {activeUsers > 1 && (
        <span
          data-ocid="sync_status_bar.active_users"
          className="flex items-center gap-1 ml-auto"
        >
          <Users size={10} />
          {activeUsers} users active
        </span>
      )}
    </div>
  );
}
