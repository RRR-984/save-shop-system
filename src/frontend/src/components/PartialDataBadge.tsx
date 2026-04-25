import { AlertTriangle } from "lucide-react";
import { useStore } from "../context/StoreContext";

/**
 * Compact warning pill shown on every page when Phase1 data partially failed.
 * Stays subtle — never blocks UI, never fills the viewport.
 * Returns null when everything is fine or Phase1 is still loading.
 */
export function PartialDataBadge() {
  const { phase1HasPartialError, isPhase1Loading } = useStore();

  if (!phase1HasPartialError || isPhase1Loading) return null;

  return (
    <div
      data-ocid="partial_data.error_state"
      className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl text-amber-800 dark:text-amber-300"
      role="alert"
    >
      <AlertTriangle size={13} className="flex-shrink-0" />
      <span className="text-xs flex-1">
        Some data could not be loaded. Displaying last available data.
      </span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="text-[11px] font-semibold underline underline-offset-2 flex-shrink-0 text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
        aria-label="Retry loading"
      >
        Retry
      </button>
    </div>
  );
}
