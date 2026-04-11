import { useCallback, useEffect, useRef, useState } from "react";

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  gradient: string;
  emoji: string;
}

const BANNERS: Banner[] = [
  {
    id: 1,
    emoji: "🚀",
    title: "New Feature: Rankings Dashboard",
    subtitle: "See your top products, customers & vendors at a glance",
    gradient: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
  },
  {
    id: 2,
    emoji: "💎",
    title: "Earn Diamonds on Every 10 Transactions",
    subtitle: "Earn 1 💎 for every 10 transactions",
    gradient: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
  },
  {
    id: 3,
    emoji: "📦",
    title: "Manage Your Inventory Like a Pro",
    subtitle: "FIFO batch tracking, bulk add & smart reorder — all in one",
    gradient: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)",
  },
  {
    id: 4,
    emoji: "🏆",
    title: "Check Your Business Rankings!",
    subtitle: "Top 10 products, staff & vendors ranked by profit",
    gradient: "linear-gradient(135deg, #D97706 0%, #B45309 100%)",
  },
  {
    id: 5,
    emoji: "⭐",
    title: "Vendor Spotlight: Promote Your Products",
    subtitle: "Vendors can now advertise directly to shop owners",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
  },
];

const AUTO_SCROLL_INTERVAL = 3000;

export function AdBannerCarousel() {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % BANNERS.length);
    }, AUTO_SCROLL_INTERVAL);
  }, []);

  const goTo = (index: number) => {
    setCurrent(index);
    resetInterval();
  };

  useEffect(() => {
    resetInterval();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [resetInterval]);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ borderRadius: "14px" }}
      data-ocid="ad-banner-carousel"
    >
      {/* Slides wrapper */}
      <div
        className="flex"
        style={{
          transform: `translateX(-${current * 100}%)`,
          transition: "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
          willChange: "transform",
        }}
      >
        {BANNERS.map((banner) => (
          <div
            key={banner.id}
            className="flex-shrink-0 w-full flex items-center gap-3 px-4"
            style={{
              background: banner.gradient,
              height: "82px",
              borderRadius: "14px",
            }}
          >
            {/* Emoji */}
            <span
              className="text-3xl flex-shrink-0 select-none"
              aria-hidden="true"
            >
              {banner.emoji}
            </span>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p
                className="font-bold text-white leading-tight truncate"
                style={{ fontSize: "13px" }}
              >
                {banner.title}
              </p>
              <p
                className="text-white/80 leading-snug mt-0.5 line-clamp-2"
                style={{ fontSize: "11px" }}
              >
                {banner.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Indicator dots */}
      <div className="flex justify-center items-center gap-1.5 mt-2">
        {BANNERS.map((banner, i) => (
          <button
            type="button"
            key={banner.id}
            aria-label={`Go to banner ${i + 1}`}
            onClick={() => goTo(i)}
            className="transition-all duration-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{
              width: i === current ? "18px" : "6px",
              height: "6px",
              background: i === current ? "var(--primary, #2563EB)" : "#CBD5E1",
              opacity: i === current ? 1 : 0.6,
            }}
          />
        ))}
      </div>
    </div>
  );
}
