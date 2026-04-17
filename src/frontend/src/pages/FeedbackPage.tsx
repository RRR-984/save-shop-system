import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Bug,
  CheckCircle,
  Gem,
  Lightbulb,
  Loader2,
  Plus,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import type { FeedbackType } from "../types/store";

const FEEDBACK_TYPES: {
  key: FeedbackType;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    key: "bug",
    label: "Bug Report",
    icon: <Bug size={15} />,
    color:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/40",
  },
  {
    key: "feature",
    label: "Feature Request",
    icon: <Sparkles size={15} />,
    color:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/40",
  },
  {
    key: "improvement",
    label: "Improvement",
    icon: <Lightbulb size={15} />,
    color:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40",
  },
];

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: <AlertCircle size={12} />,
    cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",
  },
  approved: {
    label: "Approved",
    icon: <CheckCircle size={12} />,
    cls: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400",
  },
  rejected: {
    label: "Rejected",
    icon: <XCircle size={12} />,
    cls: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400",
  },
};

const MAX_TITLE = 100;
const MAX_DESC = 500;
const MIN_DESC = 10;
const MAX_WEEKLY = 10;

export function FeedbackPage() {
  const { feedbackList, submitFeedback } = useStore();
  const { currentUser } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<FeedbackType>("improvement");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Inline validation errors
  const [titleError, setTitleError] = useState("");
  const [descError, setDescError] = useState("");

  const userId = currentUser?.id ?? "";
  const myFeedback = feedbackList.filter((f) => f.userId === userId);

  // Spam check helpers
  function countThisWeek(): number {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return myFeedback.filter((f) => new Date(f.submittedAt).getTime() > weekAgo)
      .length;
  }

  function hasDuplicateTitle(t: string): boolean {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return myFeedback.some(
      (f) =>
        f.title.trim().toLowerCase() === t.trim().toLowerCase() &&
        f.status !== "rejected" &&
        new Date(f.submittedAt).getTime() > sevenDaysAgo,
    );
  }

  function validateTitle(val: string): string {
    if (!val.trim()) return "Title is required";
    if (val.trim().length > MAX_TITLE)
      return `Title must be ${MAX_TITLE} characters or less`;
    return "";
  }

  function validateDesc(val: string): string {
    if (!val.trim()) return "Description is required";
    if (val.trim().length < MIN_DESC)
      return `Description must be at least ${MIN_DESC} characters`;
    if (val.trim().length > MAX_DESC)
      return `Description must be ${MAX_DESC} characters or less`;
    return "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const te = validateTitle(title);
    const de = validateDesc(description);
    setTitleError(te);
    setDescError(de);
    if (te || de) return;

    // Spam prevention — weekly cap
    if (countThisWeek() >= MAX_WEEKLY) {
      toast.error(
        `You have reached the weekly limit of ${MAX_WEEKLY} feedback submissions.`,
      );
      return;
    }

    // Duplicate title guard
    if (hasDuplicateTitle(title)) {
      toast.warning(
        "You already submitted feedback with this title recently. Duplicates are not rewarded.",
      );
      return;
    }

    setSaving(true);
    try {
      submitFeedback(type, title, description);
      toast.success("Feedback submitted! Earn 10 💎 once approved by admin");
      setTitle("");
      setDescription("");
      setTitleError("");
      setDescError("");
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  function handleCancelForm() {
    setShowForm(false);
    setTitle("");
    setDescription("");
    setTitleError("");
    setDescError("");
  }

  return (
    <div className="flex flex-col gap-4 px-3 pt-4 pb-24 max-w-2xl mx-auto w-full">
      {/* Header card */}
      <div className="rounded-2xl bg-gradient-to-br from-card to-primary/5 border border-border shadow-card p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground">
              Report Issue / Suggest Improvement
            </h1>
            <p className="text-xs text-muted-foreground">
              Earn 10 💎 diamonds on admin approval
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <Gem size={14} className="text-primary flex-shrink-0" />
          <p className="text-xs text-foreground/80">
            Submit a valid bug report, feature request, or improvement
            suggestion. After admin approval, you'll receive{" "}
            <strong>10 diamonds</strong> as reward. Duplicate feedback is not
            rewarded. Max {MAX_WEEKLY} submissions per week.
          </p>
        </div>
      </div>

      {/* Submit button / form */}
      {!showForm ? (
        <Button
          data-ocid="feedback.submit_new.button"
          onClick={() => setShowForm(true)}
          className="w-full flex items-center gap-2"
        >
          <Plus size={16} /> Submit Feedback
        </Button>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl bg-card border border-border shadow-card p-4 flex flex-col gap-4"
          data-ocid="feedback.form.section"
        >
          <div className="text-sm font-bold text-foreground">New Feedback</div>

          {/* Type selector */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Type
            </p>
            <div className="flex gap-2 flex-wrap">
              {FEEDBACK_TYPES.map((ft) => (
                <button
                  key={ft.key}
                  type="button"
                  data-ocid={`feedback.type.${ft.key}`}
                  onClick={() => setType(ft.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    type === ft.key
                      ? `${ft.color} ring-2 ring-primary/30`
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {ft.icon} {ft.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="feedback-title"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
            >
              Title *
            </label>
            <Input
              id="feedback-title"
              data-ocid="feedback.title.input"
              placeholder="Brief title (max 100 characters)"
              value={title}
              maxLength={MAX_TITLE + 10}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError(validateTitle(e.target.value));
              }}
              onBlur={() => setTitleError(validateTitle(title))}
              className={titleError ? "border-destructive" : ""}
            />
            {titleError ? (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle size={11} /> {titleError}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground text-right">
                {title.length}/{MAX_TITLE}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="feedback-description"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
            >
              Description *
            </label>
            <Textarea
              id="feedback-description"
              data-ocid="feedback.description.input"
              placeholder={`Describe the issue or suggestion in detail (min ${MIN_DESC} characters)...`}
              value={description}
              maxLength={MAX_DESC + 50}
              onChange={(e) => {
                setDescription(e.target.value);
                if (descError) setDescError(validateDesc(e.target.value));
              }}
              onBlur={() => setDescError(validateDesc(description))}
              rows={4}
              className={descError ? "border-destructive" : ""}
            />
            {descError ? (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle size={11} /> {descError}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground text-right">
                {description.length}/{MAX_DESC}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              data-ocid="feedback.submit.button"
              disabled={saving}
              className="flex-1"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin mr-1" />
              ) : null}
              Submit Feedback
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelForm}
              data-ocid="feedback.cancel.button"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* My Feedback History */}
      <div>
        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-0.5 mb-2">
          My Feedback History ({myFeedback.length})
        </div>

        {myFeedback.length === 0 ? (
          <div
            data-ocid="feedback.empty_state"
            className="flex flex-col items-center gap-3 py-10 text-center"
          >
            <Sparkles size={28} className="text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              No feedback submitted yet
            </p>
            <p className="text-xs text-muted-foreground">
              Submit your first feedback and earn 💎 diamonds on approval!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {myFeedback.map((entry) => {
              const typeInfo = FEEDBACK_TYPES.find(
                (ft) => ft.key === entry.type,
              );
              const statusInfo = STATUS_CONFIG[entry.status];
              return (
                <div
                  key={entry.id}
                  data-ocid={`feedback.item.${entry.id}`}
                  className="rounded-2xl bg-card border border-border shadow-card p-3.5 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        {typeInfo && (
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeInfo.color}`}
                          >
                            {typeInfo.icon} {typeInfo.label}
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.cls}`}
                        >
                          {statusInfo.icon} {statusInfo.label}
                        </span>
                        {entry.rewardGiven && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/30 dark:text-purple-400">
                            <Gem size={10} /> +10 💎 Rewarded
                          </span>
                        )}
                        {entry.status === "pending" && !entry.rewardGiven && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                            Reward Pending
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {entry.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {entry.description}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        Submitted{" "}
                        {new Date(entry.submittedAt).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </p>
                      {entry.rejectionReason && (
                        <p className="text-xs text-destructive mt-1">
                          Reason: {entry.rejectionReason}
                        </p>
                      )}
                    </div>
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
