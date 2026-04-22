import { l as useStore, h as useAuth, r as reactExports, j as jsxRuntimeExports, ac as Gem, B as Button, m as Plus, I as Input, F as CircleAlert, ad as LoaderCircle, y as ue, D as CircleCheckBig } from "./index-Bt77HP0S.js";
import { T as Textarea } from "./textarea-BQEBDJqN.js";
import { S as Sparkles, B as Bug, L as Lightbulb } from "./sparkles-Cii-no10.js";
import { C as CircleX } from "./circle-x-BDHwm0HL.js";
const FEEDBACK_TYPES = [
  {
    key: "bug",
    label: "Bug Report",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Bug, { size: 15 }),
    color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/40"
  },
  {
    key: "feature",
    label: "Feature Request",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 15 }),
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/40"
  },
  {
    key: "improvement",
    label: "Improvement",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { size: 15 }),
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40"
  }
];
const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 12 }),
    cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400"
  },
  approved: {
    label: "Approved",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { size: 12 }),
    cls: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400"
  },
  rejected: {
    label: "Rejected",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { size: 12 }),
    cls: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400"
  }
};
const MAX_TITLE = 100;
const MAX_DESC = 500;
const MIN_DESC = 10;
const MAX_WEEKLY = 10;
function FeedbackPage() {
  const { feedbackList, submitFeedback } = useStore();
  const { currentUser } = useAuth();
  const [showForm, setShowForm] = reactExports.useState(false);
  const [type, setType] = reactExports.useState("improvement");
  const [title, setTitle] = reactExports.useState("");
  const [description, setDescription] = reactExports.useState("");
  const [saving, setSaving] = reactExports.useState(false);
  const [titleError, setTitleError] = reactExports.useState("");
  const [descError, setDescError] = reactExports.useState("");
  const userId = (currentUser == null ? void 0 : currentUser.id) ?? "";
  const myFeedback = feedbackList.filter((f) => f.userId === userId);
  function countThisWeek() {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1e3;
    return myFeedback.filter((f) => new Date(f.submittedAt).getTime() > weekAgo).length;
  }
  function hasDuplicateTitle(t) {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1e3;
    return myFeedback.some(
      (f) => f.title.trim().toLowerCase() === t.trim().toLowerCase() && f.status !== "rejected" && new Date(f.submittedAt).getTime() > sevenDaysAgo
    );
  }
  function validateTitle(val) {
    if (!val.trim()) return "Title is required";
    if (val.trim().length > MAX_TITLE)
      return `Title must be ${MAX_TITLE} characters or less`;
    return "";
  }
  function validateDesc(val) {
    if (!val.trim()) return "Description is required";
    if (val.trim().length < MIN_DESC)
      return `Description must be at least ${MIN_DESC} characters`;
    if (val.trim().length > MAX_DESC)
      return `Description must be ${MAX_DESC} characters or less`;
    return "";
  }
  async function handleSubmit(e) {
    e.preventDefault();
    const te = validateTitle(title);
    const de = validateDesc(description);
    setTitleError(te);
    setDescError(de);
    if (te || de) return;
    if (countThisWeek() >= MAX_WEEKLY) {
      ue.error(
        `You have reached the weekly limit of ${MAX_WEEKLY} feedback submissions.`
      );
      return;
    }
    if (hasDuplicateTitle(title)) {
      ue.warning(
        "You already submitted feedback with this title recently. Duplicates are not rewarded."
      );
      return;
    }
    setSaving(true);
    try {
      submitFeedback(type, title, description);
      ue.success("Feedback submitted! Earn 10 💎 once approved by admin");
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 px-3 pt-4 pb-24 max-w-2xl mx-auto w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-gradient-to-br from-card to-primary/5 border border-border shadow-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 20, className: "text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-base font-bold text-foreground", children: "Report Issue / Suggest Improvement" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Earn 10 💎 diamonds on admin approval" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Gem, { size: 14, className: "text-primary flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/80", children: [
          "Submit a valid bug report, feature request, or improvement suggestion. After admin approval, you'll receive",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "10 diamonds" }),
          " as reward. Duplicate feedback is not rewarded. Max ",
          MAX_WEEKLY,
          " submissions per week."
        ] })
      ] })
    ] }),
    !showForm ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        "data-ocid": "feedback.submit_new.button",
        onClick: () => setShowForm(true),
        className: "w-full flex items-center gap-2",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
          " Submit Feedback"
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "form",
      {
        onSubmit: handleSubmit,
        noValidate: true,
        className: "rounded-2xl bg-card border border-border shadow-card p-4 flex flex-col gap-4",
        "data-ocid": "feedback.form.section",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold text-foreground", children: "New Feedback" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2", children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap", children: FEEDBACK_TYPES.map((ft) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                "data-ocid": `feedback.type.${ft.key}`,
                onClick: () => setType(ft.key),
                className: `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${type === ft.key ? `${ft.color} ring-2 ring-primary/30` : "bg-muted text-muted-foreground border-border"}`,
                children: [
                  ft.icon,
                  " ",
                  ft.label
                ]
              },
              ft.key
            )) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "label",
              {
                htmlFor: "feedback-title",
                className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider block",
                children: "Title *"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "feedback-title",
                "data-ocid": "feedback.title.input",
                placeholder: "Brief title (max 100 characters)",
                value: title,
                maxLength: MAX_TITLE + 10,
                onChange: (e) => {
                  setTitle(e.target.value);
                  if (titleError) setTitleError(validateTitle(e.target.value));
                },
                onBlur: () => setTitleError(validateTitle(title)),
                className: titleError ? "border-destructive" : ""
              }
            ),
            titleError ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-destructive flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 11 }),
              " ",
              titleError
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground text-right", children: [
              title.length,
              "/",
              MAX_TITLE
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "label",
              {
                htmlFor: "feedback-description",
                className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider block",
                children: "Description *"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                id: "feedback-description",
                "data-ocid": "feedback.description.input",
                placeholder: `Describe the issue or suggestion in detail (min ${MIN_DESC} characters)...`,
                value: description,
                maxLength: MAX_DESC + 50,
                onChange: (e) => {
                  setDescription(e.target.value);
                  if (descError) setDescError(validateDesc(e.target.value));
                },
                onBlur: () => setDescError(validateDesc(description)),
                rows: 4,
                className: descError ? "border-destructive" : ""
              }
            ),
            descError ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-destructive flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 11 }),
              " ",
              descError
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground text-right", children: [
              description.length,
              "/",
              MAX_DESC
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "submit",
                "data-ocid": "feedback.submit.button",
                disabled: saving,
                className: "flex-1",
                children: [
                  saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin mr-1" }) : null,
                  "Submit Feedback"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "outline",
                onClick: handleCancelForm,
                "data-ocid": "feedback.cancel.button",
                children: "Cancel"
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-0.5 mb-2", children: [
        "My Feedback History (",
        myFeedback.length,
        ")"
      ] }),
      myFeedback.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          "data-ocid": "feedback.empty_state",
          className: "flex flex-col items-center gap-3 py-10 text-center",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 28, className: "text-muted-foreground/30" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No feedback submitted yet" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Submit your first feedback and earn 💎 diamonds on approval!" })
          ]
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-2", children: myFeedback.map((entry) => {
        const typeInfo = FEEDBACK_TYPES.find(
          (ft) => ft.key === entry.type
        );
        const statusInfo = STATUS_CONFIG[entry.status];
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            "data-ocid": `feedback.item.${entry.id}`,
            className: "rounded-2xl bg-card border border-border shadow-card p-3.5 flex flex-col gap-2",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap mb-1", children: [
                typeInfo && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "span",
                  {
                    className: `inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeInfo.color}`,
                    children: [
                      typeInfo.icon,
                      " ",
                      typeInfo.label
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "span",
                  {
                    className: `inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.cls}`,
                    children: [
                      statusInfo.icon,
                      " ",
                      statusInfo.label
                    ]
                  }
                ),
                entry.rewardGiven && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/30 dark:text-purple-400", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Gem, { size: 10 }),
                  " +10 💎 Rewarded"
                ] }),
                entry.status === "pending" && !entry.rewardGiven && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border", children: "Reward Pending" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground truncate", children: entry.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground line-clamp-2 mt-0.5", children: entry.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground/60 mt-1", children: [
                "Submitted",
                " ",
                new Date(entry.submittedAt).toLocaleDateString(
                  "en-IN",
                  { day: "numeric", month: "short", year: "numeric" }
                )
              ] }),
              entry.rejectionReason && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-destructive mt-1", children: [
                "Reason: ",
                entry.rejectionReason
              ] })
            ] }) })
          },
          entry.id
        );
      }) })
    ] })
  ] });
}
export {
  FeedbackPage
};
