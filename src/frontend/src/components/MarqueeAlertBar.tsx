// ===========================================================
// LIVE UI ELEMENT — DO NOT REMOVE
// MarqueeAlertBar: horizontal scrolling notification ticker
// This component is a core live UI element. Keep persistent.
// ===========================================================

import { useEffect, useState } from "react";

const MESSAGES = [
  "🔥 Today's Sales Update: Check your dashboard for real-time data!",
  "⚠️ Low Stock Alert: Some products may need restocking soon",
  "💎 Diamond Rewards: Complete 10 transactions to earn a diamond!",
  "📦 New Feature: Bulk Stock In now available — add 50 items at once!",
  "🏆 Top Performance: Check your product & customer rankings today!",
  "💳 Payment Reminders: Send WhatsApp reminders to due customers",
  "📊 Smart Insights: Track your best-selling & high-profit products",
  "🚀 FIFO Bridge: Your complete shop management system — always live!",
];

const STORAGE_KEY = "marqueeAlertBar_dismissed_at";

export function MarqueeAlertBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if not dismissed within the current day
    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt).toDateString();
      const today = new Date().toDateString();
      if (dismissedDate === today) return;
    }
    setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    setVisible(false);
  }

  if (!visible) return null;

  // Duplicate the messages array so the scroll feels seamless
  const allMessages = [...MESSAGES, ...MESSAGES];

  return (
    <div
      data-ocid="marquee-alert-bar"
      className="marquee-alert-bar relative overflow-hidden flex items-center flex-shrink-0"
      style={{
        width: "100%",
        height: "38px",
        minHeight: "38px",
        background:
          "linear-gradient(90deg, #D97706 0%, #F59E0B 40%, #2563EB 100%)",
        display: "block",
        // GPU layer promotion to prevent any parent clipping context affecting this
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        zIndex: 10,
      }}
      role="marquee"
      aria-label="Live alerts and announcements"
    >
      {/* Scrolling text track — uses marqueeScroll @keyframe animation, NOT overflow-x-auto */}
      <div
        className="flex items-center gap-10 whitespace-nowrap"
        style={{
          animation: "marqueeScroll 32s linear infinite",
          willChange: "transform",
          // Promote to GPU layer for smooth mobile animation
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
        }}
        aria-hidden="true"
      >
        {allMessages.map((msg, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: static list
            key={i}
            className="text-white font-semibold flex-shrink-0"
            style={{ fontSize: "12px", letterSpacing: "0.01em" }}
          >
            {msg}
            <span className="mx-6 opacity-50">•</span>
          </span>
        ))}
      </div>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss alerts bar"
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center px-3 text-white/90 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.8) 40%, rgba(37,99,235,0.95) 100%)",
          minWidth: "32px",
          // Ensure dismiss button stays above the scrolling text
          zIndex: 1,
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: 700, lineHeight: 1 }}>
          ×
        </span>
      </button>

      {/* Left fade gradient for clean edge */}
      <div
        className="absolute left-0 top-0 bottom-0 pointer-events-none"
        style={{
          width: "24px",
          background:
            "linear-gradient(90deg, rgba(217,119,6,0.7) 0%, transparent 100%)",
          zIndex: 1,
        }}
        aria-hidden="true"
      />
    </div>
  );
}
