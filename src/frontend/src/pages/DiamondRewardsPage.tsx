import { useMemo, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useStore } from "../context/StoreContext";
import type { DiamondReward, DiamondTier } from "../types/store";
import { getDiamondTier } from "../types/store";

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function fmtShort(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

// 4-tier config: bronze 0-49, silver 50-199, gold 200-499, diamond 500+
const TIER_CONFIG: Record<
  DiamondTier,
  {
    emoji: string;
    label: string;
    labelHi: string;
    range: string;
    rangeHi: string;
    color: string;
    bg: string;
    border: string;
    min: number;
    nextAt: number | null;
    barGradient: string;
    benefit: string;
    benefitHi: string;
  }
> = {
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
    benefitHi: "बेसिक रिपोर्ट तक पहुंच",
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
    benefitHi: "प्राथमिकता ग्राहक सहायता",
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
    benefitHi: "उन्नत विश्लेषण",
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
    benefitHi: "सभी प्रीमियम फीचर + एक्सक्लूसिव बैज",
  },
};

const TIER_ORDER: DiamondTier[] = ["bronze", "silver", "gold", "diamond"];

function getProgressPct(total: number, tier: DiamondTier): number {
  const cfg = TIER_CONFIG[tier];
  if (cfg.nextAt === null) return 100;
  const range = cfg.nextAt - cfg.min;
  return Math.min(100, Math.round(((total - cfg.min) / range) * 100));
}

export function DiamondRewardsPage() {
  const { diamondRewards } = useStore();
  const { language } = useLanguage();
  const isHi = language === "hi";
  const [search, setSearch] = useState("");

  const total = useMemo(
    () => diamondRewards.reduce((s, r) => s + r.diamondCount, 0),
    [diamondRewards],
  );
  const tier = getDiamondTier(total);
  const tierCfg = TIER_CONFIG[tier];
  const progressPct = getProgressPct(total, tier);
  const isDiamond = tier === "diamond";
  const toNext = tierCfg.nextAt !== null ? tierCfg.nextAt - total : 0;

  // Per-sale summary grouped by productId (which is "sale" for invoice-based rewards)
  const saleSummary = useMemo(() => {
    const map = new Map<
      string,
      { name: string; count: number; lastDate: string; entries: number }
    >();
    for (const r of diamondRewards) {
      const key = r.productId === "sale" ? r.productName : r.productId;
      if (map.has(key)) {
        const entry = map.get(key)!;
        entry.count += r.diamondCount;
        entry.entries += 1;
        if (r.cycleCompletedAt > entry.lastDate)
          entry.lastDate = r.cycleCompletedAt;
      } else {
        map.set(key, {
          name: r.productName,
          count: r.diamondCount,
          lastDate: r.cycleCompletedAt,
          entries: 1,
        });
      }
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [diamondRewards]);

  const sorted: DiamondReward[] = useMemo(
    () =>
      [...diamondRewards]
        .sort(
          (a, b) =>
            new Date(b.cycleCompletedAt).getTime() -
            new Date(a.cycleCompletedAt).getTime(),
        )
        .filter(
          (r) =>
            !search ||
            r.productName.toLowerCase().includes(search.toLowerCase()) ||
            r.userName.toLowerCase().includes(search.toLowerCase()),
        ),
    [diamondRewards, search],
  );

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-violet-600 to-purple-700 px-4 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-3xl">{tierCfg.emoji}</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white leading-tight">
              {isHi ? "डायमंड रिवॉर्ड" : "Diamond Rewards"}
            </h1>
            <p className="text-violet-200 text-sm">
              {isHi
                ? "10 transactions पर 1 💎 मिलता है"
                : "Earn 1 💎 for every 10 transactions"}
            </p>
          </div>
        </div>

        {/* Total diamonds */}
        <div className="bg-white/15 rounded-2xl px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-violet-100 text-xs font-semibold uppercase tracking-wider">
              {isHi ? "कुल डायमंड" : "Total Diamonds"}
            </div>
            <div className="text-4xl font-extrabold text-white mt-0.5">
              {total}
              <span className="text-2xl ml-1">💎</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-lg font-bold text-white">
              {tierCfg.emoji} {isHi ? tierCfg.labelHi : tierCfg.label}
            </span>
            {isDiamond ? (
              <span className="text-[11px] text-yellow-200">
                {isHi ? "अधिकतम टियर! 💎" : "Max tier reached! 💎"}
              </span>
            ) : (
              <span className="text-[11px] text-violet-200">
                {isHi
                  ? `केवल ${toNext} और डायमंड`
                  : `Only ${toNext} more diamonds`}
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="w-full h-2.5 rounded-full bg-white/20 overflow-hidden">
            {isDiamond ? (
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 transition-all duration-700"
                style={{ width: "100%" }}
              />
            ) : (
              <div
                className={`h-full rounded-full bg-gradient-to-r ${tierCfg.barGradient} transition-all duration-700`}
                style={{ width: `${progressPct}%` }}
              />
            )}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-violet-200">{tierCfg.min}</span>
            {!isDiamond && (
              <span className="text-[10px] text-violet-200">
                {tierCfg.nextAt} → {isHi ? "अगला टियर" : "Next tier"}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-3 pt-4">
        {/* Tier milestones */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-card">
          <div className="px-4 pt-3 pb-2.5 border-b border-border/60">
            <p className="text-sm font-bold text-foreground">
              {isHi ? "🏆 टियर मील के पत्थर" : "🏆 Tier Milestones"}
            </p>
          </div>
          <div className="divide-y divide-border/40">
            {TIER_ORDER.map((t) => {
              const cfg = TIER_CONFIG[t];
              const active = tier === t;
              const earned = total >= cfg.min;
              return (
                <div
                  key={t}
                  className={`flex items-center gap-3 px-4 py-3 ${active ? "bg-violet-50 dark:bg-violet-950/20" : ""}`}
                >
                  <span
                    className={`text-xl flex-shrink-0 ${!earned ? "opacity-40" : ""}`}
                  >
                    {cfg.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold ${active ? "text-violet-700 dark:text-violet-300" : "text-foreground"}`}
                    >
                      {isHi ? cfg.labelHi : cfg.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {isHi ? cfg.rangeHi : cfg.range}
                    </p>
                  </div>
                  {active && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 flex-shrink-0">
                      {isHi ? "अभी ✓" : "Current ✓"}
                    </span>
                  )}
                  {!active && earned && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 flex-shrink-0">
                      ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tier Benefits */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-card">
          <div className="px-4 pt-3 pb-2.5 border-b border-border/60">
            <p className="text-sm font-bold text-foreground">
              {isHi ? "🎁 टियर के फायदे" : "🎁 Tier Benefits"}
            </p>
          </div>
          <div className="divide-y divide-border/40">
            {TIER_ORDER.map((t) => {
              const cfg = TIER_CONFIG[t];
              const active = tier === t;
              const unlocked = total >= cfg.min;
              return (
                <div
                  key={t}
                  className={`flex items-center gap-3 px-4 py-3 ${active ? cfg.bg : ""}`}
                >
                  <span
                    className={`text-lg flex-shrink-0 ${!unlocked ? "opacity-30 grayscale" : ""}`}
                  >
                    {cfg.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold ${active ? cfg.color : "text-foreground"} ${!unlocked ? "opacity-50" : ""}`}
                    >
                      {isHi ? cfg.labelHi : cfg.label}
                    </p>
                    <p
                      className={`text-[11px] text-muted-foreground ${!unlocked ? "opacity-50" : ""}`}
                    >
                      {isHi ? cfg.benefitHi : cfg.benefit}
                    </p>
                  </div>
                  {unlocked ? (
                    <span
                      className={`text-[10px] font-semibold ${cfg.color} flex-shrink-0`}
                    >
                      {isHi ? "अनलॉक 🔓" : "Unlocked 🔓"}
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      🔒
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Sales Summary */}
        {saleSummary.length > 0 && (
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-card">
            <div className="px-4 pt-3 pb-2.5 border-b border-border/60">
              <p className="text-sm font-bold text-foreground">
                {isHi ? "🏆 टॉप बिक्री" : "🏆 Top Sales"}
              </p>
            </div>
            <div className="divide-y divide-border/40">
              {saleSummary.slice(0, 5).map((p, i) => (
                <div key={p.name} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-violet-600">
                      #{i + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {p.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {fmtShort(p.lastDate)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-violet-600 dark:text-violet-300 flex-shrink-0">
                    {p.count} 💎
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-card">
          <div className="px-4 pt-3 pb-2.5 border-b border-border/60 flex items-center justify-between">
            <p className="text-sm font-bold text-foreground">
              {isHi ? "📋 रिवॉर्ड इतिहास" : "📋 Reward History"}
            </p>
            <span className="text-[11px] text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-full">
              {sorted.length} {isHi ? "रिकॉर्ड" : "records"}
            </span>
          </div>

          {/* Search */}
          <div className="px-4 pt-3 pb-2">
            <input
              type="search"
              placeholder={
                isHi ? "Invoice या स्टाफ खोजें..." : "Search invoice or staff..."
              }
              data-ocid="diamond_rewards.search.input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl bg-muted/50 border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {sorted.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
              <span className="text-4xl">💎</span>
              <p className="text-sm">
                {isHi ? "अभी कोई रिकॉर्ड नहीं" : "No records yet"}
              </p>
              <p className="text-xs text-center px-6 text-muted-foreground/70">
                {isHi
                  ? "Complete 10 transactions to earn 1 💎"
                  : "Complete 10 transactions to start earning — 1 💎 per 10 transactions"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {sorted.map((r) => (
                <div
                  key={r.id}
                  data-ocid={`diamond_rewards.history.item.${r.id}`}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">💎</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {r.productId === "sale"
                        ? isHi
                          ? "Transaction Cycle"
                          : "Transaction Cycle"
                        : r.productName}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {r.userName} · {fmtDate(r.cycleCompletedAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-sm font-extrabold text-violet-600 dark:text-violet-300">
                      +{r.diamondCount} 💎
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {isHi
                        ? "10 transactions complete"
                        : "10 transactions completed"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
