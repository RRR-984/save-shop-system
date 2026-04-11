import { useState } from "react";

interface SponsoredAd {
  icon: string;
  text: string;
  cta: string;
}

const SPONSORED_ADS: SponsoredAd[] = [
  {
    icon: "📱",
    text: "Save Shop Pro: Unlock Advanced Analytics for your business",
    cta: "Learn More",
  },
  {
    icon: "💼",
    text: "Business Tip: Track Your Top Vendors for Better Deals",
    cta: "Explore",
  },
  {
    icon: "🎯",
    text: "Pro Tip: Use Diamond Rewards to Motivate Your Team",
    cta: "Try Now",
  },
];

function pickAd(): SponsoredAd {
  return SPONSORED_ADS[Math.floor(Math.random() * SPONSORED_ADS.length)];
}

export function AdCardSponsor() {
  const [dismissed, setDismissed] = useState(false);
  const [ad] = useState<SponsoredAd>(pickAd);

  if (dismissed) return null;

  return (
    <div
      className="relative flex items-center gap-3 px-3.5 py-3 bg-card border border-border/70 rounded-2xl shadow-sm"
      data-ocid="ad-card-sponsor"
    >
      {/* Sponsored label */}
      <span className="absolute top-2 right-7 text-[9px] font-medium text-muted-foreground/70 uppercase tracking-wide">
        Sponsored
      </span>

      {/* Dismiss */}
      <button
        type="button"
        aria-label="Dismiss ad"
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-[11px]"
      >
        ✕
      </button>

      {/* Icon bubble */}
      <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 text-lg select-none">
        {ad.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-6">
        <p className="text-xs font-medium text-foreground/80 leading-snug line-clamp-2">
          {ad.text}
        </p>
        <span className="inline-block mt-1 text-[10px] font-semibold text-primary">
          {ad.cta} →
        </span>
      </div>
    </div>
  );
}
