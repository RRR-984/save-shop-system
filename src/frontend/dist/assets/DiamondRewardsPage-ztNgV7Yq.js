import { l as useStore, J as useLanguage, r as reactExports, j as jsxRuntimeExports, a9 as getDiamondTier } from "./index-CyJThNPE.js";
function fmtDate(iso) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(iso));
}
function fmtShort(iso) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(iso));
}
const TIER_CONFIG = {
  bronze: {
    emoji: "🥉",
    label: "Bronze",
    labelHi: "ब्रॉन्ज",
    range: "0–49 diamonds",
    rangeHi: "0–49 डायमंड",
    color: "text-amber-700",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-700/40",
    min: 0,
    nextAt: 50,
    barGradient: "from-amber-600 to-slate-400",
    benefit: "Access to basic reports",
    benefitHi: "बेसिक रिपोर्ट तक पहुंच"
  },
  silver: {
    emoji: "🥈",
    label: "Silver",
    labelHi: "सिल्वर",
    range: "50–199 diamonds",
    rangeHi: "50–199 डायमंड",
    color: "text-slate-500",
    bg: "bg-slate-50 dark:bg-slate-800/30",
    border: "border-slate-200 dark:border-slate-700/40",
    min: 50,
    nextAt: 200,
    barGradient: "from-slate-400 to-yellow-400",
    benefit: "Priority customer support",
    benefitHi: "प्राथमिकता ग्राहक सहायता"
  },
  gold: {
    emoji: "🥇",
    label: "Gold",
    labelHi: "गोल्ड",
    range: "200–499 diamonds",
    rangeHi: "200–499 डायमंड",
    color: "text-yellow-600",
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    border: "border-yellow-200 dark:border-yellow-700/40",
    min: 200,
    nextAt: 500,
    barGradient: "from-yellow-400 to-cyan-400",
    benefit: "Advanced analytics",
    benefitHi: "उन्नत विश्लेषण"
  },
  diamond: {
    emoji: "💎",
    label: "Diamond",
    labelHi: "डायमंड",
    range: "500+ diamonds",
    rangeHi: "500+ डायमंड",
    color: "text-cyan-500",
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    border: "border-cyan-200 dark:border-cyan-700/40",
    min: 500,
    nextAt: null,
    barGradient: "from-cyan-400 via-purple-400 to-pink-400",
    benefit: "All premium features + exclusive badge",
    benefitHi: "सभी प्रीमियम फीचर + एक्सक्लूसिव बैज"
  }
};
const TIER_ORDER = ["bronze", "silver", "gold", "diamond"];
function getProgressPct(total, tier) {
  const cfg = TIER_CONFIG[tier];
  if (cfg.nextAt === null) return 100;
  const range = cfg.nextAt - cfg.min;
  return Math.min(100, Math.round((total - cfg.min) / range * 100));
}
function DiamondRewardsPage() {
  const { diamondRewards } = useStore();
  const { language } = useLanguage();
  const isHi = language === "hi";
  const [search, setSearch] = reactExports.useState("");
  const total = reactExports.useMemo(
    () => diamondRewards.reduce((s, r) => s + r.diamondCount, 0),
    [diamondRewards]
  );
  const tier = getDiamondTier(total);
  const tierCfg = TIER_CONFIG[tier];
  const progressPct = getProgressPct(total, tier);
  const isDiamond = tier === "diamond";
  const toNext = tierCfg.nextAt !== null ? tierCfg.nextAt - total : 0;
  const saleSummary = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const r of diamondRewards) {
      const key = r.productId === "sale" ? r.productName : r.productId;
      if (map.has(key)) {
        const entry = map.get(key);
        entry.count += r.diamondCount;
        entry.entries += 1;
        if (r.cycleCompletedAt > entry.lastDate)
          entry.lastDate = r.cycleCompletedAt;
      } else {
        map.set(key, {
          name: r.productName,
          count: r.diamondCount,
          lastDate: r.cycleCompletedAt,
          entries: 1
        });
      }
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [diamondRewards]);
  const sorted = reactExports.useMemo(
    () => [...diamondRewards].sort(
      (a, b) => new Date(b.cycleCompletedAt).getTime() - new Date(a.cycleCompletedAt).getTime()
    ).filter(
      (r) => !search || r.productName.toLowerCase().includes(search.toLowerCase()) || r.userName.toLowerCase().includes(search.toLowerCase())
    ),
    [diamondRewards, search]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col min-h-screen bg-background pb-24", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-violet-600 to-purple-700 px-4 pt-6 pb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl", children: tierCfg.emoji }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-extrabold text-white leading-tight", children: isHi ? "डायमंड रिवॉर्ड" : "Diamond Rewards" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-violet-200 text-sm", children: isHi ? "10 transactions पर 1 💎 मिलता है" : "Earn 1 💎 for every 10 transactions" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/15 rounded-2xl px-5 py-4 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-violet-100 text-xs font-semibold uppercase tracking-wider", children: isHi ? "कुल डायमंड" : "Total Diamonds" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-4xl font-extrabold text-white mt-0.5", children: [
            total,
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl ml-1", children: "💎" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-lg font-bold text-white", children: [
            tierCfg.emoji,
            " ",
            isHi ? tierCfg.labelHi : tierCfg.label
          ] }),
          isDiamond ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-yellow-200", children: isHi ? "अधिकतम टियर! 💎" : "Max tier reached! 💎" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-violet-200", children: isHi ? `केवल ${toNext} और डायमंड` : `Only ${toNext} more diamonds` })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-2.5 rounded-full bg-white/20 overflow-hidden", children: isDiamond ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "h-full rounded-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 transition-all duration-700",
            style: { width: "100%" }
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `h-full rounded-full bg-gradient-to-r ${tierCfg.barGradient} transition-all duration-700`,
            style: { width: `${progressPct}%` }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-violet-200", children: tierCfg.min }),
          !isDiamond && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-violet-200", children: [
            tierCfg.nextAt,
            " → ",
            isHi ? "अगला टियर" : "Next tier"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 px-3 pt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl border border-border overflow-hidden shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pt-3 pb-2.5 border-b border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-foreground", children: isHi ? "🏆 टियर मील के पत्थर" : "🏆 Tier Milestones" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border/40", children: TIER_ORDER.map((t) => {
          const cfg = TIER_CONFIG[t];
          const active = tier === t;
          const earned = total >= cfg.min;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: `flex items-center gap-3 px-4 py-3 ${active ? "bg-violet-50 dark:bg-violet-950/20" : ""}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `text-xl flex-shrink-0 ${!earned ? "opacity-40" : ""}`,
                    children: cfg.emoji
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    {
                      className: `text-sm font-semibold ${active ? "text-violet-700 dark:text-violet-300" : "text-foreground"}`,
                      children: isHi ? cfg.labelHi : cfg.label
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: isHi ? cfg.rangeHi : cfg.range })
                ] }),
                active && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold px-2 py-1 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 flex-shrink-0", children: isHi ? "अभी ✓" : "Current ✓" }),
                !active && earned && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 flex-shrink-0", children: "✓" })
              ]
            },
            t
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl border border-border overflow-hidden shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pt-3 pb-2.5 border-b border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-foreground", children: isHi ? "🎁 टियर के फायदे" : "🎁 Tier Benefits" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border/40", children: TIER_ORDER.map((t) => {
          const cfg = TIER_CONFIG[t];
          const active = tier === t;
          const unlocked = total >= cfg.min;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: `flex items-center gap-3 px-4 py-3 ${active ? cfg.bg : ""}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `text-lg flex-shrink-0 ${!unlocked ? "opacity-30 grayscale" : ""}`,
                    children: cfg.emoji
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    {
                      className: `text-sm font-semibold ${active ? cfg.color : "text-foreground"} ${!unlocked ? "opacity-50" : ""}`,
                      children: isHi ? cfg.labelHi : cfg.label
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    {
                      className: `text-[11px] text-muted-foreground ${!unlocked ? "opacity-50" : ""}`,
                      children: isHi ? cfg.benefitHi : cfg.benefit
                    }
                  )
                ] }),
                unlocked ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `text-[10px] font-semibold ${cfg.color} flex-shrink-0`,
                    children: isHi ? "अनलॉक 🔓" : "Unlocked 🔓"
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground flex-shrink-0", children: "🔒" })
              ]
            },
            t
          );
        }) })
      ] }),
      saleSummary.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl border border-border overflow-hidden shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pt-3 pb-2.5 border-b border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-foreground", children: isHi ? "🏆 टॉप बिक्री" : "🏆 Top Sales" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border/40", children: saleSummary.slice(0, 5).map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold text-violet-600", children: [
            "#",
            i + 1
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground truncate", children: p.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: fmtShort(p.lastDate) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold text-violet-600 dark:text-violet-300 flex-shrink-0", children: [
            p.count,
            " 💎"
          ] })
        ] }, p.name)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl border border-border overflow-hidden shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-3 pb-2.5 border-b border-border/60 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-foreground", children: isHi ? "📋 रिवॉर्ड इतिहास" : "📋 Reward History" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-full", children: [
            sorted.length,
            " ",
            isHi ? "रिकॉर्ड" : "records"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pt-3 pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "search",
            placeholder: isHi ? "Invoice या स्टाफ खोजें..." : "Search invoice or staff...",
            "data-ocid": "diamond_rewards.search.input",
            value: search,
            onChange: (e) => setSearch(e.target.value),
            className: "w-full rounded-xl bg-muted/50 border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
          }
        ) }),
        sorted.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3 py-10 text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-4xl", children: "💎" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: isHi ? "अभी कोई रिकॉर्ड नहीं" : "No records yet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-center px-6 text-muted-foreground/70", children: isHi ? "Complete 10 transactions to earn 1 💎" : "Complete 10 transactions to start earning — 1 💎 per 10 transactions" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border/40", children: sorted.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            "data-ocid": `diamond_rewards.history.item.${r.id}`,
            className: "flex items-center gap-3 px-4 py-3",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: "💎" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground truncate", children: r.productId === "sale" ? isHi ? "Transaction Cycle" : "Transaction Cycle" : r.productName }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
                  r.userName,
                  " · ",
                  fmtDate(r.cycleCompletedAt)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end flex-shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-extrabold text-violet-600 dark:text-violet-300", children: [
                  "+",
                  r.diamondCount,
                  " 💎"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: isHi ? "10 transactions complete" : "10 transactions completed" })
              ] })
            ]
          },
          r.id
        )) })
      ] })
    ] })
  ] });
}
export {
  DiamondRewardsPage
};
