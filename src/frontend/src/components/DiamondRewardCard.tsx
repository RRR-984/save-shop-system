import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useStore } from "../context/StoreContext";
import type { DiamondTier } from "../types/store";
import { getDiamondTier } from "../types/store";

function fmt(n: number) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(n));
}

interface DiamondRewardCardProps {
  amountsVisible?: boolean;
  onViewAll?: () => void;
}

// 4 tiers: bronze 0-49, silver 50-199, gold 200-499, diamond 500+
const TIER_INFO: Record<
  DiamondTier,
  {
    emoji: string;
    label: string;
    labelHi: string;
    min: number;
    nextAt: number | null;
    color: string;
    barGradient: string;
  }
> = {
  bronze: {
    emoji: "🥉",
    label: "Bronze",
    labelHi: "ब्रॉन्ज",
    min: 0,
    nextAt: 50,
    color: "text-amber-700",
    barGradient: "from-amber-600 to-slate-400",
  },
  silver: {
    emoji: "🥈",
    label: "Silver",
    labelHi: "सिल्वर",
    min: 50,
    nextAt: 200,
    color: "text-slate-500",
    barGradient: "from-slate-400 to-yellow-400",
  },
  gold: {
    emoji: "🥇",
    label: "Gold",
    labelHi: "गोल्ड",
    min: 200,
    nextAt: 500,
    color: "text-yellow-600",
    barGradient: "from-yellow-400 to-cyan-400",
  },
  diamond: {
    emoji: "💎",
    label: "Diamond",
    labelHi: "डायमंड",
    min: 500,
    nextAt: null,
    color: "text-cyan-500",
    barGradient: "from-cyan-400 via-purple-400 to-pink-400",
  },
};

function getProgressPct(total: number, tier: DiamondTier): number {
  const info = TIER_INFO[tier];
  if (info.nextAt === null) return 100;
  const range = info.nextAt - info.min;
  const progress = total - info.min;
  return Math.min(100, Math.round((progress / range) * 100));
}

export function DiamondRewardCard({
  amountsVisible = true,
  onViewAll,
}: DiamondRewardCardProps) {
  const { diamondRewards } = useStore();
  const { language } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);

  const total = diamondRewards.reduce((s, r) => s + r.diamondCount, 0);
  const tier = getDiamondTier(total);
  const tierInfo = TIER_INFO[tier];
  const isHi = language === "hi";
  const progressPct = getProgressPct(total, tier);
  const isDiamond = tier === "diamond";
  const toNext = tierInfo.nextAt !== null ? tierInfo.nextAt - total : 0;

  // Transaction counter progress toward next diamond
  const txCount = (() => {
    try {
      const shopId = localStorage.getItem("last_shop_id") ?? "shop-default";
      const stored = localStorage.getItem(`transactionCounter_${shopId}`);
      return stored ? Number.parseInt(stored, 10) % 10 : 0;
    } catch {
      return 0;
    }
  })();
  const txProgress = txCount === 0 ? 10 : txCount; // show 10/10 when just awarded

  const recent = [...diamondRewards]
    .sort(
      (a, b) =>
        new Date(b.cycleCompletedAt).getTime() -
        new Date(a.cycleCompletedAt).getTime(),
    )
    .slice(0, 5);

  return (
    <>
      {/* Card */}
      <button
        type="button"
        data-ocid="dashboard.diamond_reward.card"
        onClick={() => setModalOpen(true)}
        className="w-full flex flex-col gap-3 rounded-2xl p-4 border border-violet-200 dark:border-violet-800/50 bg-[#EDE9FE] dark:bg-violet-950/40 shadow-card card-interactive active:scale-[0.97] transition-all duration-150 ease-out text-left"
      >
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl leading-none">{tierInfo.emoji}</span>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
                {isHi ? "डायमंड रिवॉर्ड" : "Diamond Rewards"}
              </div>
              <div className="text-[10px] text-violet-500 dark:text-violet-400">
                {isHi
                  ? "10 transaction पर 1 💎 मिलता है"
                  : "1 💎 per 10 transactions"}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-extrabold text-violet-700 dark:text-violet-200 leading-none">
              {amountsVisible ? total : "•••"}
            </span>
            <span className="text-[10px] text-violet-500 dark:text-violet-400">
              {isHi ? "डायमंड" : "Diamonds"}
            </span>
          </div>
        </div>

        {/* Tier badge + progress */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold ${tierInfo.color} flex items-center gap-1`}
            >
              {tierInfo.emoji} {isHi ? tierInfo.labelHi : tierInfo.label}{" "}
              {isHi ? "टियर" : "Tier"}
            </span>
            {isDiamond ? (
              <span className="text-[10px] font-semibold text-cyan-500">
                {isHi ? "अधिकतम टियर! 💎" : "Max tier reached! 💎"}
              </span>
            ) : (
              <span className="text-[10px] text-violet-500 dark:text-violet-400">
                {isHi
                  ? `${toNext} और 💎 अगले टियर के लिए`
                  : `Only ${toNext} 💎 to next level`}
              </span>
            )}
          </div>
          {/* Tier-specific gradient progress bar */}
          <div className="w-full h-2 rounded-full bg-violet-200 dark:bg-violet-800/50 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${tierInfo.barGradient} transition-all duration-500`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {!isDiamond && (
            <div className="flex justify-between text-[10px] text-violet-400 dark:text-violet-500">
              <span>{total}</span>
              <span>{tierInfo.nextAt}</span>
            </div>
          )}
        </div>

        {/* Tap hint + tx progress toward next diamond */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">
            {isHi
              ? `${txProgress}/10 transaction अगले 💎 के लिए`
              : `${txProgress}/10 transactions to next 💎`}
          </span>
          <span className="text-[10px] text-violet-400 dark:text-violet-500">
            {isHi ? "इतिहास देखें →" : "Tap to view →"}
          </span>
        </div>
      </button>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setModalOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setModalOpen(false)}
            role="button"
            tabIndex={-1}
            aria-label="Close"
          />
          <div className="relative bg-card rounded-t-2xl sm:rounded-2xl border border-border shadow-xl w-full max-w-md max-h-[80vh] flex flex-col animate-slide-in-up overflow-hidden">
            {/* Modal header */}
            <div className="px-5 pt-4 pb-3 border-b border-border flex items-center gap-3">
              <span className="text-2xl">{tierInfo.emoji}</span>
              <div className="flex-1">
                <h2 className="text-base font-bold text-foreground">
                  {isHi ? "डायमंड रिवॉर्ड इतिहास" : "Diamond Reward History"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isHi
                    ? `कुल ${total} डायमंड — ${tierInfo.emoji} ${tierInfo.labelHi} टियर`
                    : `Total ${total} diamonds — ${tierInfo.emoji} ${tierInfo.label} Tier`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xl leading-none p-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {recent.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
                  <span className="text-4xl">💎</span>
                  <p className="text-sm">
                    {isHi ? "अभी कोई डायमंड नहीं" : "No diamonds earned yet"}
                  </p>
                  <p className="text-xs text-center text-muted-foreground/70">
                    {isHi
                      ? "Complete 10 transactions to earn 1 💎"
                      : "Complete 10 transactions to earn your first 💎"}
                  </p>{" "}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {recent.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-800/30"
                    >
                      <span className="text-xl flex-shrink-0">💎</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {r.productName}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {r.userName} ·{" "}
                          {fmt(new Date(r.cycleCompletedAt).getTime())}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-violet-600 dark:text-violet-300 flex-shrink-0">
                        +{r.diamondCount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* View all button */}
            {onViewAll && (
              <div className="px-5 pb-5 pt-2 border-t border-border">
                <button
                  type="button"
                  data-ocid="dashboard.diamond_reward.view_all"
                  onClick={() => {
                    setModalOpen(false);
                    onViewAll();
                  }}
                  className="w-full py-3 rounded-xl bg-violet-600 text-white text-sm font-bold btn-hover active:scale-[0.98] transition-all"
                >
                  {isHi ? "सभी देखें →" : "View All Rewards →"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
