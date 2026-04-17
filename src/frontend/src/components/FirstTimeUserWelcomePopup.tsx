import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Guide } from "./AnimatedGuidePlayer";
import { AnimatedGuidePlayer, GUIDES } from "./AnimatedGuidePlayer";

const SHOWN_KEY = "fifo_tutorial_shown";

export function FirstTimeUserWelcomePopup() {
  const { language } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [activeGuide, setActiveGuide] = useState<Guide | null>(null);

  useEffect(() => {
    try {
      const alreadyShown = localStorage.getItem(SHOWN_KEY);
      if (!alreadyShown) {
        // Small delay so the main app renders first
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      /* ignore storage errors */
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(SHOWN_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const startTutorial = () => {
    dismiss();
    // Find the "Full App Overview" guide
    const overview = GUIDES.find((g) => g.id === "full-overview") ?? GUIDES[0];
    setActiveGuide(overview);
  };

  if (activeGuide) {
    return createPortal(
      <AnimatedGuidePlayer
        guide={activeGuide}
        onClose={() => setActiveGuide(null)}
      />,
      document.body,
    );
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[99998] flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)" }}
      data-ocid="welcome-popup.overlay"
    >
      <dialog
        open
        className="w-full max-w-sm bg-card rounded-3xl shadow-2xl overflow-hidden animate-bounce-in p-0 border-0"
        aria-label="Welcome to FIFO Bridge"
      >
        {/* Top gradient banner */}
        <div
          className="relative px-6 pt-8 pb-6 text-center"
          style={{
            background:
              "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)",
          }}
        >
          {/* Animated diamond logo */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur mb-4 animate-float shadow-lg">
            <span className="text-3xl" aria-hidden="true">
              💎
            </span>
          </div>
          <h1 className="text-xl font-bold text-white leading-tight">
            {language === "hi"
              ? "FIFO Bridge में आपका स्वागत है!"
              : "Welcome to FIFO Bridge!"}
          </h1>
          <p className="text-sm text-white/85 mt-1">
            {language === "hi"
              ? "आपकी दुकान का पूरा मैनेजमेंट सिस्टम"
              : "Your complete shop management system"}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <p className="text-sm text-foreground font-semibold text-center mb-1.5">
            {language === "hi"
              ? "क्या आप एक छोटा टूर लेना चाहेंगे?"
              : "Would you like a quick tour?"}
          </p>
          <p className="text-xs text-muted-foreground text-center mb-5">
            {language === "hi"
              ? "ऐप के मुख्य फीचर्स के बारे में एनिमेटेड गाइड देखें — 2 मिनट में सब समझें।"
              : "Watch an animated guide covering the key features — understand everything in 2 minutes."}
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center mb-5">
            {[
              { icon: "📦", label: language === "hi" ? "स्टॉक" : "Stock" },
              { icon: "🛒", label: language === "hi" ? "बिक्री" : "Billing" },
              { icon: "📊", label: language === "hi" ? "रिपोर्ट" : "Reports" },
              { icon: "💎", label: language === "hi" ? "रिवार्ड्स" : "Rewards" },
            ].map((f) => (
              <span
                key={f.label}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent text-accent-foreground text-[11px] font-semibold"
              >
                {f.icon} {f.label}
              </span>
            ))}
          </div>

          {/* Actions */}
          <button
            type="button"
            onClick={startTutorial}
            className="w-full py-3 rounded-2xl font-bold text-sm text-white hover:opacity-90 active:scale-95 transition-all mb-3 shadow-md"
            style={{
              background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
            }}
            data-ocid="welcome-popup.start-tutorial"
          >
            🚀 {language === "hi" ? "टूर शुरू करें" : "Start Tour"}
          </button>

          <button
            type="button"
            onClick={dismiss}
            className="w-full py-2.5 rounded-2xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
            data-ocid="welcome-popup.skip"
          >
            {language === "hi" ? "अभी नहीं, बाद में देखूंगा" : "Skip for now"}
          </button>
        </div>
      </dialog>
    </div>
  );
}
