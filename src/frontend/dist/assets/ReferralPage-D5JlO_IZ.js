import { c as createLucideIcon, l as useStore, h as useAuth, r as reactExports, j as jsxRuntimeExports, am as Gift, B as Button, ac as Gem, an as ShieldCheck, ao as ArrowRight, y as ue } from "./index-CyJThNPE.js";
import { C as Check } from "./check-TLKRrqsL.js";
import { C as Copy } from "./copy-C_grlmJY.js";
import { S as Share2 } from "./share-2-PG8y4S_O.js";
import { C as Calendar } from "./calendar-lRSaRm7y.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71", key: "1cjeqo" }],
  ["path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71", key: "19qd67" }]
];
const Link = createLucideIcon("link", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ["line", { x1: "19", x2: "19", y1: "8", y2: "14", key: "1bvyxn" }],
  ["line", { x1: "22", x2: "16", y1: "11", y2: "11", key: "1shjgl" }]
];
const UserPlus = createLucideIcon("user-plus", __iconNode);
const HOW_IT_WORKS = [
  {
    step: 1,
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { size: 16, className: "text-primary" }),
    title: "Share Your Code",
    desc: "Send your unique referral code to a friend via WhatsApp, link, or any channel."
  },
  {
    step: 2,
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { size: 16, className: "text-purple-600 dark:text-purple-400" }),
    title: "Friend Signs Up",
    desc: "Your friend creates an account and enters your referral code during sign-up."
  },
  {
    step: 3,
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Gem, { size: 16, className: "text-amber-500" }),
    title: "Both Earn 10 💎",
    desc: "After their first successful transaction, you both automatically receive 10 diamonds."
  }
];
function ReferralPage() {
  const {
    getOrCreateReferralCode,
    referralCodes,
    referralSignups,
    diamondRewards
  } = useStore();
  const { currentUser } = useAuth();
  const [copied, setCopied] = reactExports.useState(false);
  const [linkCopied, setLinkCopied] = reactExports.useState(false);
  const userId = (currentUser == null ? void 0 : currentUser.id) ?? "";
  reactExports.useEffect(() => {
    getOrCreateReferralCode();
  }, [getOrCreateReferralCode]);
  const referralCode = referralCodes.find((rc) => rc.userId === userId) ?? getOrCreateReferralCode();
  const referralLink = `${window.location.origin}?ref=${referralCode.code}`;
  function handleCopyCode() {
    navigator.clipboard.writeText(referralCode.code).then(() => {
      setCopied(true);
      ue.success("Referral code copied!");
      setTimeout(() => setCopied(false), 2500);
    });
  }
  function handleCopyLink() {
    navigator.clipboard.writeText(referralLink).then(() => {
      setLinkCopied(true);
      ue.success("Referral link copied!");
      setTimeout(() => setLinkCopied(false), 2500);
    });
  }
  function handleWhatsApp() {
    const msg = `Join FIFO Bridge with my referral code ${referralCode.code} and earn 10 💎 diamonds as a welcome bonus! Download at: https://shopopretingsystem.com`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener"
    );
  }
  const mySignups = referralSignups.filter((s) => s.referrerUserId === userId);
  const referralDiamonds = diamondRewards.filter((r) => r.userId === userId && r.rewardType === "referral").reduce((sum, r) => sum + r.diamondCount, 0);
  function maskMobile(mobile) {
    const digits = mobile.replace(/\D/g, "");
    if (digits.length < 4) return "••••";
    return `••••${digits.slice(-4)}`;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex flex-col gap-4 px-3 pt-4 pb-28 max-w-2xl mx-auto w-full page-fade-in",
      "data-ocid": "referral.page",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "rounded-2xl overflow-hidden relative",
            style: {
              background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 50%, #2563EB 100%)"
            },
            "data-ocid": "referral.hero.section",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10",
                  style: { background: "white" },
                  "aria-hidden": "true"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "absolute bottom-0 left-1/2 w-32 h-32 rounded-full opacity-5",
                  style: {
                    background: "white",
                    transform: "translateX(-50%) translateY(50%)"
                  },
                  "aria-hidden": "true"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative px-4 pt-5 pb-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { size: 18, className: "text-white/90" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-white/90 uppercase tracking-wide", children: "Refer & Earn" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white text-lg font-extrabold leading-snug mb-1", children: "Invite friends, earn diamonds!" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-white/75 text-xs mb-4 leading-relaxed", children: [
                  "Share your code. When a friend signs up and completes their first transaction, you both receive",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-white", children: "10 💎 diamonds" }),
                  "."
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 bg-white/15 border border-white/20 rounded-xl px-3 py-2.5 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white font-mono font-bold text-xl tracking-[0.2em]", children: referralCode.code }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      size: "sm",
                      variant: "secondary",
                      onClick: handleCopyCode,
                      "data-ocid": "referral.copy_code.button",
                      className: "gap-1.5 h-9 rounded-xl font-semibold tap-scale",
                      children: [
                        copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 13 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 13 }),
                        copied ? "Copied!" : "Copy Code"
                      ]
                    }
                  )
                ] })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "grid grid-cols-2 gap-3",
            "data-ocid": "referral.stats.section",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border shadow-card p-4 flex flex-col gap-1 card-interactive", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center mb-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  UserPlus,
                  {
                    size: 16,
                    className: "text-purple-600 dark:text-purple-400"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: "Successful Signups" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-extrabold text-foreground", children: referralCode.successfulSignups }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: "friends joined" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border shadow-card p-4 flex flex-col gap-1 card-interactive", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mb-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Gem, { size: 16, className: "text-amber-500" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: "Diamonds Earned" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-2xl font-extrabold text-foreground", children: [
                  referralDiamonds,
                  " 💎"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: "from referrals" })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "rounded-2xl bg-card border border-border shadow-card p-4 flex flex-col gap-3",
            "data-ocid": "referral.share.section",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { size: 14, className: "text-primary" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-foreground uppercase tracking-wider", children: "Share Your Code" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    onClick: handleWhatsApp,
                    "data-ocid": "referral.share_whatsapp.button",
                    className: "w-full justify-start gap-2.5 h-10 rounded-xl font-semibold tap-scale",
                    style: { background: "#25D366" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { size: 15 }),
                      "Share via WhatsApp"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    variant: "outline",
                    onClick: handleCopyLink,
                    "data-ocid": "referral.copy_link.button",
                    className: "w-full justify-start gap-2.5 h-10 rounded-xl font-semibold tap-scale",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { size: 15 }),
                      linkCopied ? "Link Copied!" : "Copy Referral Link"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 bg-accent/50 rounded-xl px-3 py-2.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ShieldCheck,
                  {
                    size: 13,
                    className: "text-primary flex-shrink-0 mt-0.5"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground leading-relaxed", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: "New users" }),
                  " can enter your referral code during sign-up to claim their 10 💎 welcome bonus."
                ] })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "rounded-2xl bg-muted/40 border border-border p-4",
            "data-ocid": "referral.how_it_works.section",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { size: 14, className: "text-primary" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-foreground uppercase tracking-wider", children: "How It Works" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-2 sm:flex-row sm:gap-3", children: HOW_IT_WORKS.map((step, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex-1 flex flex-row sm:flex-col gap-3 items-start",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-extrabold text-primary", children: step.step }) }),
                      i < HOW_IT_WORKS.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        ArrowRight,
                        {
                          size: 12,
                          className: "text-muted-foreground hidden sm:block"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-0.5", children: [
                        step.icon,
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-foreground", children: step.title })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground leading-relaxed", children: step.desc })
                    ] })
                  ]
                },
                step.step
              )) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-start gap-2 border-t border-border pt-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ShieldCheck,
                  {
                    size: 12,
                    className: "text-muted-foreground flex-shrink-0 mt-0.5"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground leading-relaxed", children: "Same device cannot use multiple referral codes. Reward is given only after the first successful transaction. Duplicate signups are not rewarded." })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-ocid": "referral.history.section", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-0.5 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 13, className: "text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-foreground uppercase tracking-wider", children: "Referral History" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full", children: mySignups.length })
          ] }),
          mySignups.length === 0 ? (
            /* ── Empty state ──────────────────────────────────────────────── */
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                "data-ocid": "referral.history.empty_state",
                className: "flex flex-col items-center gap-4 py-10 px-6 text-center rounded-2xl bg-card border border-border shadow-card",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { size: 26, className: "text-purple-400" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-foreground mb-1", children: "No referrals yet" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Share your code and start earning diamonds!" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 w-full max-w-xs", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        onClick: handleWhatsApp,
                        className: "w-full gap-2 rounded-xl font-semibold tap-scale",
                        style: { background: "#25D366" },
                        "data-ocid": "referral.empty_whatsapp.button",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { size: 14 }),
                          "Share via WhatsApp"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        variant: "outline",
                        onClick: handleCopyCode,
                        className: "w-full gap-2 rounded-xl font-semibold tap-scale",
                        "data-ocid": "referral.empty_copy.button",
                        children: [
                          copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 14 }),
                          copied ? "Copied!" : "Copy Code"
                        ]
                      }
                    )
                  ] })
                ]
              }
            )
          ) : (
            /* ── History list ──────────────────────────────────────────────── */
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-2", children: mySignups.map((signup) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                "data-ocid": `referral.history.item.${signup.id}`,
                className: "rounded-2xl bg-card border border-border shadow-card p-3.5 flex items-center gap-3 card-interactive",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-extrabold text-primary", children: signup.newUserName.slice(0, 1).toUpperCase() }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground truncate", children: signup.newUserName }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mt-0.5 flex-wrap", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground font-mono", children: maskMobile(signup.newUserMobile) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-[10px]", children: "·" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: new Date(signup.signupAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      }) })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-1 flex-shrink-0", children: [
                    signup.rewardAwardedToReferrer ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Gem, { size: 9 }),
                      " +10 💎"
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800", children: "Pending" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: `text-[10px] font-medium ${signup.firstTransactionCompleted ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`,
                        children: signup.firstTransactionCompleted ? "✓ Tx complete" : "Awaiting tx"
                      }
                    )
                  ] })
                ]
              },
              signup.id
            )) })
          )
        ] })
      ]
    }
  );
}
export {
  ReferralPage
};
