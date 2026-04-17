import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  FileText,
  Package,
  Phone,
  ShoppingCart,
  Trash2,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useStore } from "../context/StoreContext";
import type { DraftSale } from "../types/store";
import type { NavPage } from "../types/store";

interface DraftsPageProps {
  onNavigate: (page: NavPage) => void;
}

// ── Date formatter ────────────────────────────────────────────────────────────
function formatDraftTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const timeStr = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) return `Today, ${timeStr}`;

  const dateStr = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
  return `${dateStr}, ${timeStr}`;
}

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

// ── Single Draft Card ─────────────────────────────────────────────────────────
function DraftCard({
  draft,
  onResume,
  onDelete,
}: {
  draft: DraftSale;
  onResume: (draft: DraftSale) => void;
  onDelete: (draftId: string) => void;
}) {
  const customerName = draft.customerName?.trim() || "Walk-in Customer";
  const hasMobile = !!draft.customerMobile?.trim();
  const itemCount = draft.cartItems?.length ?? 0;
  const total = draft.totalAmount ?? 0;
  const timeLabel = formatDraftTime(draft.updatedAt || draft.createdAt);

  return (
    <div
      data-ocid="drafts.draft_card"
      className="bg-card dark:bg-card border border-border rounded-2xl shadow-sm p-4 flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate leading-tight">
              {customerName}
            </p>
            {hasMobile && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Phone size={10} />
                {draft.customerMobile}
              </p>
            )}
          </div>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-700/40 flex-shrink-0"
        >
          Draft
        </Badge>
      </div>

      {/* Info row */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Package size={11} />
          <span className="font-medium text-foreground">{itemCount}</span>
          {itemCount === 1 ? " item" : " items"}
        </span>
        <span className="flex items-center gap-1">
          <ShoppingCart size={11} />
          <span className="font-semibold text-foreground">
            {fmtCurrency(total)}
          </span>
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <Clock size={10} />
          {timeLabel}
        </span>
      </div>

      {/* Item preview */}
      {itemCount > 0 && (
        <div className="text-xs text-muted-foreground bg-muted/50 dark:bg-muted/20 rounded-lg px-3 py-1.5 line-clamp-1">
          {draft.cartItems
            .slice(0, 3)
            .map((i) => i.productName)
            .join(", ")}
          {itemCount > 3 && ` +${itemCount - 3} more`}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          data-ocid="drafts.resume_button"
          onClick={() => onResume(draft)}
          className="flex-1 h-8 text-xs font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-150"
        >
          Resume
        </Button>
        <Button
          size="sm"
          variant="outline"
          data-ocid="drafts.delete_button"
          onClick={() => onDelete(draft.draftId)}
          className="h-8 w-8 p-0 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800/40 dark:text-red-400 dark:hover:bg-red-950/30 rounded-lg transition-colors duration-150"
          aria-label="Delete draft"
        >
          <Trash2 size={13} />
        </Button>
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyDrafts({ onNewSale }: { onNewSale: () => void }) {
  return (
    <div
      data-ocid="drafts.empty_state"
      className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center">
        <FileText size={28} className="text-muted-foreground" />
      </div>
      <div>
        <p className="text-base font-semibold text-foreground">
          No saved drafts yet
        </p>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Start a sale and tap{" "}
          <span className="font-medium text-foreground">Save Draft</span> to
          continue it later without losing any data.
        </p>
      </div>
      <Button
        data-ocid="drafts.start_new_sale_button"
        onClick={onNewSale}
        className="mt-1 h-10 px-6 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors duration-150"
      >
        Start New Sale
      </Button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function DraftsPage({ onNavigate }: DraftsPageProps) {
  const { draftSales, deleteDraft } = useStore();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Only show active drafts, newest first
  const activeDrafts = useMemo<DraftSale[]>(
    () =>
      (draftSales ?? [])
        .filter((d) => d.status === "draft")
        .sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime(),
        ),
    [draftSales],
  );

  const handleResume = (draft: DraftSale) => {
    try {
      sessionStorage.setItem("billing_resume_draft", JSON.stringify(draft));
    } catch {
      /* ignore */
    }
    onNavigate("billing");
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteDraft(deleteTarget);
    setDeleteTarget(null);
    toast.success("Draft deleted");
  };

  return (
    <div className="flex flex-col gap-0 min-h-0 pb-24 md:pb-6">
      {/* Page Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-primary flex-shrink-0" />
          <h1 className="text-base font-bold text-foreground leading-tight">
            Draft / Pending Sales
            {activeDrafts.length > 0 && (
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {activeDrafts.length}
              </span>
            )}
          </h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1 ml-6">
          Saved sales that can be resumed and edited anytime
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-4">
        {activeDrafts.length === 0 ? (
          <EmptyDrafts onNewSale={() => onNavigate("billing")} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeDrafts.map((draft) => (
              <DraftCard
                key={draft.draftId}
                draft={draft}
                onResume={handleResume}
                onDelete={(id) => setDeleteTarget(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this draft?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. The saved customer info and items will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="drafts.delete_cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="drafts.delete_confirm_button"
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
