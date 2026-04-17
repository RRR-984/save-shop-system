// ===========================================================
// LIVE UI ELEMENT — DO NOT REMOVE
// AdBannerCarousel: auto-sliding promotional banner with touch swipe.
// This component is a core live UI element. Keep persistent.
// ===========================================================

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
const SWIPE_THRESHOLD = 50;

export function AdBannerCarousel() {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Touch / pointer swipe tracking
  const dragStartX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const resetInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % BANNERS.length);
    }, AUTO_SCROLL_INTERVAL);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setCurrent(index);
      resetInterval();
    },
    [resetInterval],
  );

  const goPrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);
    resetInterval();
  }, [resetInterval]);

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % BANNERS.length);
    resetInterval();
  }, [resetInterval]);

  useEffect(() => {
    resetInterval();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [resetInterval]);

  // ── Pointer events (mouse + touch unified) ──────────────────────────────
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    dragStartX.current = e.clientX;
    isDragging.current = true;
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging.current || dragStartX.current === null) return;
    isDragging.current = false;
    const delta = dragStartX.current - e.clientX;
    if (Math.abs(delta) >= SWIPE_THRESHOLD) {
      if (delta > 0) {
        goNext();
      } else {
        goPrev();
      }
    }
    dragStartX.current = null;
  }

  function handlePointerCancel() {
    isDragging.current = false;
    dragStartX.current = null;
  }

  // ── Touch events fallback for browsers that don't fire pointer events ────
  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    dragStartX.current = e.touches[0]?.clientX ?? null;
    isDragging.current = true;
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    if (!isDragging.current || dragStartX.current === null) return;
    isDragging.current = false;
    const endX = e.changedTouches[0]?.clientX ?? dragStartX.current;
    const delta = dragStartX.current - endX;
    if (Math.abs(delta) >= SWIPE_THRESHOLD) {
      if (delta > 0) {
        goNext();
      } else {
        goPrev();
      }
    }
    dragStartX.current = null;
  }

  return (
    /* Outer wrapper: full width, overflow VISIBLE so nothing clips the component.
       The inner slides track handles its own overflow-hidden for the slide animation. */
    <div
      className="ad-banner-carousel w-full"
      style={{
        display: "block",
        position: "relative",
        overflow: "visible",
        // Ensure GPU layer and prevent mobile clipping from parent stacking contexts
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        willChange: "transform",
        zIndex: 1,
      }}
      data-ocid="ad-banner-carousel"
    >
      {/* Slides track: overflow-hidden clips the sliding panels, touch-action allows vertical scroll */}
      <div
        className="banner-slides-track w-full relative"
        style={{
          overflow: "hidden",
          borderRadius: "14px",
          touchAction: "pan-y",
        }}
        // Pointer events (desktop drag + stylus)
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        // Touch events (mobile/tablet fallback)
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex w-full"
          style={{
            transform: `translateX(-${current * 100}%)`,
            transition: "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
          aria-live="polite"
        >
          {BANNERS.map((banner) => (
            <div
              key={banner.id}
              className="flex-shrink-0 w-full flex items-center gap-3 select-none"
              style={{
                background: banner.gradient,
                minHeight: "82px",
                height: "auto",
                padding: "0 16px",
              }}
              aria-label={banner.title}
            >
              {/* Emoji */}
              <span
                className="text-3xl flex-shrink-0 select-none"
                aria-hidden="true"
              >
                {banner.emoji}
              </span>

              {/* Text */}
              <div className="min-w-0 flex-1 py-3">
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
      </div>

      {/* Indicator dots — outside the slides track so they're never clipped */}
      <div
        className="flex justify-center items-center gap-1.5 mt-2"
        role="tablist"
        aria-label="Banner slides"
      >
        {BANNERS.map((banner, i) => (
          <button
            type="button"
            key={banner.id}
            role="tab"
            aria-selected={i === current}
            aria-label={`Go to banner ${i + 1}`}
            onClick={() => goTo(i)}
            className="transition-all duration-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{
              width: i === current ? "18px" : "6px",
              height: "6px",
              background: i === current ? "#2563EB" : "#CBD5E1",
              opacity: i === current ? 1 : 0.6,
              border: "none",
              cursor: "pointer",
            }}
          />
        ))}
      </div>
    </div>
  );
}
