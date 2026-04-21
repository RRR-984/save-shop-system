import { Skeleton } from "@/components/ui/skeleton";

/**
 * Full-page skeleton that mimics the dashboard layout.
 * Shown during Phase 1 loading (products, categories, batches, shopUnits).
 * Auto-hides when Phase 1 data is ready OR after a 1.5s timeout.
 */
export function SkeletonLoader() {
  return (
    <div
      className="flex-1 flex flex-col gap-4 p-4 md:p-6 bg-background animate-pulse-subtle"
      data-ocid="app.skeleton_loading_state"
      aria-label="Loading your shop..."
      aria-busy="true"
    >
      {/* Summary cards row — 3 cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2"
          >
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="h-7 w-16 rounded" />
            <Skeleton className="h-2 w-20 rounded" />
          </div>
        ))}
      </div>

      {/* Quick action buttons row — 4 buttons */}
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-3 flex flex-col items-center gap-2"
          >
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-2 w-12 rounded" />
          </div>
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
        <div className="flex items-end gap-1.5 h-28 pt-2">
          {[65, 45, 80, 55, 90, 70, 60].map((h) => (
            <Skeleton
              key={h}
              className="flex-1 rounded-sm"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* Alert rows — 2 rows */}
      {[0, 1].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card p-3 flex items-center gap-3"
        >
          <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-1.5">
            <Skeleton className="h-3 w-40 rounded" />
            <Skeleton className="h-2 w-28 rounded" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full flex-shrink-0" />
        </div>
      ))}

      {/* Loading label */}
      <div className="flex flex-col items-center gap-2 py-4 mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">
            Loading your shop...
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline page-level skeleton — used as Suspense fallback for lazy-loaded routes.
 * Lighter than the full dashboard skeleton.
 */
export function PageSkeleton() {
  return (
    <div
      className="flex-1 flex flex-col gap-4 p-4 md:p-6 bg-background"
      aria-busy="true"
    >
      {/* Page header */}
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-6 w-40 rounded" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      {/* Content rows */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card p-4 flex items-center gap-3"
        >
          <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-1.5">
            <Skeleton className="h-3 w-48 rounded" />
            <Skeleton className="h-2 w-32 rounded" />
          </div>
          <Skeleton className="h-6 w-14 rounded-full flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}
