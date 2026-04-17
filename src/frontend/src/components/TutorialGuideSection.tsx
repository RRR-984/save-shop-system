import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatedGuidePlayer, GUIDES } from "./AnimatedGuidePlayer";
import type { Guide } from "./AnimatedGuidePlayer";

interface TutorialTopic {
  icon: string;
  title: string;
  titleHi: string;
  desc: string;
  guideId: string | null; // null = Coming Soon
}

const TUTORIALS: TutorialTopic[] = [
  {
    icon: "🏠",
    title: "Full App Overview",
    titleHi: "पूरी ऐप की जानकारी",
    desc: "Complete walkthrough of Save Shop System — all screens and features.",
    guideId: "full-overview",
  },
  {
    icon: "📦",
    title: "How to Add Stock",
    titleHi: "स्टॉक कैसे जोड़ें",
    desc: "Add materials, set batch price, and manage your inventory.",
    guideId: "add-stock",
  },
  {
    icon: "🏭",
    title: "Add & Edit Vendor",
    titleHi: "वेंडर कैसे जोड़ें और बदलें",
    desc: "Create vendor profiles and update vendor details easily.",
    guideId: "vendor-add",
  },
  {
    icon: "✏️",
    title: "Edit a Product",
    titleHi: "प्रोडक्ट कैसे बदलें",
    desc: "Update product name, price, unit, and other details.",
    guideId: "add-stock",
  },
  {
    icon: "🛒",
    title: "How to Sell (Billing)",
    titleHi: "बिक्री कैसे करें (बिलिंग)",
    desc: "Create bills, add items, apply discounts, and complete sales.",
    guideId: "sell-billing",
  },
  {
    icon: "💰",
    title: "Collect Payment",
    titleHi: "भुगतान कैसे लें",
    desc: "Collect cash or online payment and send invoice via WhatsApp.",
    guideId: "collect-payment",
  },
  {
    icon: "📊",
    title: "View Reports",
    titleHi: "रिपोर्ट कैसे देखें",
    desc: "Check daily sales, profit, staff reports, and business summary.",
    guideId: "reports",
  },
  {
    icon: "👥",
    title: "Manage Customers",
    titleHi: "ग्राहक कैसे मैनेज करें",
    desc: "Add customers, track dues, and send payment reminders.",
    guideId: "collect-payment",
  },
  {
    icon: "💎",
    title: "Diamond Rewards",
    titleHi: "डायमंड रिवार्ड्स",
    desc: "Earn diamonds, level up, and watch reward ads for bonuses.",
    guideId: "full-overview",
  },
  {
    icon: "👨‍💼",
    title: "Staff Management",
    titleHi: "स्टाफ मैनेजमेंट",
    desc: "Add staff, assign roles, track attendance and performance.",
    guideId: "full-overview",
  },
];

function TutorialCard({
  topic,
  onPlay,
}: {
  topic: TutorialTopic;
  onPlay: () => void;
}) {
  const { language } = useLanguage();
  const title = language === "hi" ? topic.titleHi : topic.title;
  const hasGuide = topic.guideId !== null;

  return (
    <div
      className="group relative bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer"
      style={{ borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
      data-ocid={`tutorial-card.${topic.title.toLowerCase().replace(/\s+/g, "-")}`}
      onClick={hasGuide ? onPlay : undefined}
      role={hasGuide ? "button" : undefined}
      tabIndex={hasGuide ? 0 : undefined}
      onKeyDown={
        hasGuide
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPlay();
              }
            }
          : undefined
      }
      aria-label={hasGuide ? `Start ${title} tutorial` : undefined}
    >
      {/* Visual area */}
      <div
        className="relative w-full flex items-center justify-center"
        style={{
          aspectRatio: "16/9",
          background: hasGuide
            ? "linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)"
            : "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
        }}
      >
        {/* Badge */}
        {!hasGuide && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 uppercase tracking-wide border border-amber-200 dark:border-amber-700/40">
            Coming Soon
          </span>
        )}

        {hasGuide && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 uppercase tracking-wide border border-emerald-200 dark:border-emerald-700/40">
            {language === "hi" ? "देखें" : "Watch"}
          </span>
        )}

        {/* Large icon as illustration */}
        <div className="flex flex-col items-center gap-1">
          <span
            className="text-4xl"
            style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.10))" }}
            aria-hidden="true"
          >
            {topic.icon}
          </span>

          {/* Play button */}
          <div className="relative flex items-center justify-center mt-1">
            {hasGuide && (
              <span className="absolute inline-flex w-10 h-10 rounded-full bg-indigo-400/30 animate-ping" />
            )}
            <div
              className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-110 ${
                hasGuide
                  ? "bg-indigo-600 dark:bg-indigo-500"
                  : "bg-slate-300 dark:bg-slate-600"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="white"
                className="w-4 h-4 ml-0.5"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="p-3">
        <div className="flex items-start gap-2">
          <span className="text-xl flex-shrink-0 mt-0.5" aria-hidden="true">
            {topic.icon}
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-foreground leading-tight line-clamp-1">
              {title}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
              {topic.desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TutorialGuideSection() {
  const { language } = useLanguage();
  const [dismissed, setDismissed] = useState(false);
  const [activeGuide, setActiveGuide] = useState<Guide | null>(null);

  if (dismissed) return null;

  const titleText =
    language === "hi" ? "📱 ऐप ट्यूटोरियल गाइड" : "📱 App Tutorial Guide";
  const subtitleText =
    language === "hi"
      ? "हर फीचर सीखें — एनिमेटेड गाइड से"
      : "Learn every feature — step-by-step animated guides";

  const handlePlay = (topic: TutorialTopic) => {
    if (!topic.guideId) return;
    const guide = GUIDES.find((g) => g.id === topic.guideId);
    if (guide) setActiveGuide(guide);
  };

  return (
    <>
      {activeGuide &&
        createPortal(
          <AnimatedGuidePlayer
            guide={activeGuide}
            onClose={() => setActiveGuide(null)}
          />,
          document.body,
        )}

      <section
        className="relative rounded-2xl border border-indigo-100 dark:border-indigo-900/40 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(238,242,255,0.5) 0%, rgba(245,243,255,0.5) 100%)",
        }}
        data-ocid="tutorial-guide-section"
      >
        {/* Dark mode overlay */}
        <div className="absolute inset-0 bg-card/80 dark:bg-card/95 pointer-events-none" />

        <div className="relative z-10 px-4 pt-3.5 pb-4">
          {/* Section header */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[14px] font-bold text-foreground leading-tight">
                  {titleText}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/40 uppercase tracking-wide">
                  Free
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700/40 uppercase tracking-wide">
                  {language === "hi" ? "एनिमेटेड" : "Animated"}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {subtitleText}
              </p>
            </div>

            {/* Dismiss button */}
            <button
              type="button"
              aria-label="Dismiss tutorial section"
              onClick={() => setDismissed(true)}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-[11px] mt-0.5"
            >
              ✕
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-indigo-100 dark:bg-indigo-900/30 mb-3" />

          {/* Tutorial cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TUTORIALS.map((topic) => (
              <TutorialCard
                key={topic.title}
                topic={topic}
                onPlay={() => handlePlay(topic)}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
