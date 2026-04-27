import { useEffect, useRef, useState } from "react";

const COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes
const STORAGE_KEY = "lastAdWatch";
const LANG_STORAGE_KEY = "adLang";

const SLIDE_DURATION_MS = 4000; // 4s per slide
const TOTAL_SLIDES = 7;
const TOTAL_AD_MS = SLIDE_DURATION_MS * TOTAL_SLIDES; // 28s

// ─── Slide data ──────────────────────────────────────────────────────────────
const SLIDES_EN = [
  {
    key: "intro",
    emoji: "🛒",
    title: "Save Shop System",
    body: "Your Smart Shop Partner",
    bg: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    large: true,
  },
  {
    key: "stock",
    emoji: "📦",
    title: "Never Run Out of Stock",
    body: "Smart Inventory & FIFO Batch Tracking",
    bg: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
    large: false,
  },
  {
    key: "billing",
    emoji: "🧾",
    title: "Instant Billing",
    body: "GST, Wholesale & Retail prices — one tap",
    bg: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
    large: false,
  },
  {
    key: "customers",
    emoji: "👥",
    title: "Know Your Customers",
    body: "Track who buys, who owes, who's VIP",
    bg: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
    large: false,
  },
  {
    key: "reports",
    emoji: "📊",
    title: "Daily Reports",
    body: "See profit, sales & performance at a glance",
    bg: "linear-gradient(135deg, #7c3aed 0%, #a21caf 100%)",
    large: false,
  },
  {
    key: "offline",
    emoji: "☁️",
    title: "Works Offline",
    body: "Your data is always safe — sync when online",
    bg: "linear-gradient(135deg, #0891b2 0%, #0369a1 100%)",
    large: false,
  },
  {
    key: "final",
    emoji: "🧘",
    title: "Shop Owner, Free Your Mind",
    body: "Let Save Shop System handle it all!",
    bg: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    large: false,
  },
];

const SLIDES_HI = [
  {
    key: "intro",
    emoji: "🛒",
    title: "Save Shop System",
    body: "आपका स्मार्ट दुकान साथी",
    bg: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    large: true,
  },
  {
    key: "stock",
    emoji: "📦",
    title: "स्टॉक कभी खत्म नहीं होगा",
    body: "स्मार्ट इन्वेंटरी और FIFO ट्रैकिंग",
    bg: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
    large: false,
  },
  {
    key: "billing",
    emoji: "🧾",
    title: "झटपट बिलिंग",
    body: "GST, थोक और खुदरा भाव — एक टैप में",
    bg: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
    large: false,
  },
  {
    key: "customers",
    emoji: "👥",
    title: "अपने ग्राहकों को जानें",
    body: "कौन खरीदता है, कितना बाकी है, कौन VIP है",
    bg: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
    large: false,
  },
  {
    key: "reports",
    emoji: "📊",
    title: "रोज़ की रिपोर्ट",
    body: "मुनाफा, बिक्री और परफॉर्मेंस एक नज़र में",
    bg: "linear-gradient(135deg, #7c3aed 0%, #a21caf 100%)",
    large: false,
  },
  {
    key: "offline",
    emoji: "☁️",
    title: "ऑफलाइन भी काम करे",
    body: "डेटा हमेशा सुरक्षित — ऑनलाइन होने पर सिंक",
    bg: "linear-gradient(135deg, #0891b2 0%, #0369a1 100%)",
    large: false,
  },
  {
    key: "final",
    emoji: "🧘",
    title: "दुकानदार, टेंशन छोड़ो",
    body: "Save Shop System सब संभाल लेगा!",
    bg: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    large: false,
  },
];

type Lang = "en" | "hi";
type ModalState = "idle" | "playing" | "earned";

interface Props {
  onEarnDiamond: () => void;
}

function getCooldownRemaining(): number {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return 0;
  const last = Number.parseInt(raw, 10);
  if (Number.isNaN(last)) return 0;
  return Math.max(0, COOLDOWN_MS - (Date.now() - last));
}

function fmtCooldown(ms: number): string {
  const totalSecs = Math.ceil(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

function getSavedLang(): Lang {
  return localStorage.getItem(LANG_STORAGE_KEY) === "hi" ? "hi" : "en";
}

export function RewardAdButton({ onEarnDiamond }: Props) {
  const [modal, setModal] = useState<ModalState>("idle");
  const [cooldownMs, setCooldownMs] = useState<number>(getCooldownRemaining);
  const [lang, setLang] = useState<Lang>(getSavedLang);
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideVisible, setSlideVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(TOTAL_AD_MS / 1000);
  const [autoCloseIn, setAutoCloseIn] = useState<number | null>(null);

  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoCloseRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slideTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef<number>(0);
  const onEarnDiamondRef = useRef(onEarnDiamond);

  useEffect(() => {
    onEarnDiamondRef.current = onEarnDiamond;
  }, [onEarnDiamond]);

  // ── Cooldown ticker ──────────────────────────────────────────────────────
  const hasCooldown = cooldownMs > 0;
  useEffect(() => {
    if (!hasCooldown) return;
    cooldownRef.current = setInterval(() => {
      const remaining = getCooldownRemaining();
      setCooldownMs(remaining);
      if (remaining <= 0 && cooldownRef.current)
        clearInterval(cooldownRef.current);
    }, 1000);
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [hasCooldown]);

  // ── Slideshow engine ─────────────────────────────────────────────────────
  useEffect(() => {
    if (modal !== "playing") return;

    elapsedRef.current = 0;
    setSlideIndex(0);
    setSlideVisible(true);
    setProgress(0);
    setSecondsLeft(TOTAL_AD_MS / 1000);

    const TICK = 200;
    slideTimerRef.current = setInterval(() => {
      elapsedRef.current += TICK;
      const elapsed = elapsedRef.current;

      setProgress(Math.min(100, (elapsed / TOTAL_AD_MS) * 100));
      setSecondsLeft(Math.max(0, Math.ceil((TOTAL_AD_MS - elapsed) / 1000)));

      const targetSlide = Math.min(
        TOTAL_SLIDES - 1,
        Math.floor(elapsed / SLIDE_DURATION_MS),
      );
      setSlideIndex((prev) => {
        if (targetSlide !== prev) {
          setSlideVisible(false);
          setTimeout(() => {
            setSlideIndex(targetSlide);
            setSlideVisible(true);
          }, 300);
          return prev;
        }
        return prev;
      });

      if (elapsed >= TOTAL_AD_MS) {
        clearInterval(slideTimerRef.current!);
        setProgress(100);
        setSecondsLeft(0);
        setModal("earned");
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
        setCooldownMs(COOLDOWN_MS);
        onEarnDiamondRef.current();
        let countdown = 2;
        setAutoCloseIn(countdown);
        autoCloseRef.current = setInterval(() => {
          countdown -= 1;
          setAutoCloseIn(countdown);
          if (countdown <= 0) {
            clearInterval(autoCloseRef.current!);
            setModal("idle");
            setAutoCloseIn(null);
          }
        }, 1000);
      }
    }, TICK);

    return () => {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal]);

  // ── Cleanup ──────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (autoCloseRef.current) clearInterval(autoCloseRef.current);
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    };
  }, []);

  const handleOpen = () => {
    if (cooldownMs > 0) return;
    setModal("playing");
  };

  const toggleLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem(LANG_STORAGE_KEY, l);
  };

  const inCooldown = cooldownMs > 0;
  const slides = lang === "hi" ? SLIDES_HI : SLIDES_EN;
  const currentSlide = slides[slideIndex] ?? slides[0];

  return (
    <>
      {/* ── Trigger button ─────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={inCooldown}
        data-ocid="reward-ad-button"
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[14px] border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          background: inCooldown
            ? "oklch(var(--muted))"
            : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          borderColor: inCooldown ? "oklch(var(--border))" : "transparent",
          boxShadow: inCooldown ? "none" : "0 4px 14px rgba(79,70,229,0.38)",
        }}
        aria-label={
          inCooldown
            ? `Come back in ${fmtCooldown(cooldownMs)} to earn more diamonds`
            : "Watch ad and earn 1 diamond"
        }
      >
        <span className="text-xl select-none" aria-hidden="true">
          {inCooldown ? "⏳" : "🎬"}
        </span>
        <div className="flex-1 min-w-0 text-left">
          {inCooldown ? (
            <>
              <p
                className="font-semibold text-muted-foreground leading-tight"
                style={{ fontSize: "12px" }}
              >
                Come back in {fmtCooldown(cooldownMs)}
              </p>
              <p
                className="text-muted-foreground/70 leading-snug"
                style={{ fontSize: "11px" }}
              >
                to earn more 💎 diamonds
              </p>
            </>
          ) : (
            <>
              <p
                className="font-bold text-white leading-tight"
                style={{ fontSize: "13px" }}
              >
                Watch Ad &amp; Earn 1 💎
              </p>
              <p
                className="text-white/80 leading-snug"
                style={{ fontSize: "11px" }}
              >
                Watch full ad • Free diamonds
              </p>
            </>
          )}
        </div>
        {!inCooldown && (
          <span
            className="flex-shrink-0 text-white/90 font-bold"
            style={{ fontSize: "18px" }}
            aria-hidden="true"
          >
            ›
          </span>
        )}
      </button>

      {/* ── Modal overlay ──────────────────────────────────────────────────── */}
      {modal !== "idle" && (
        <dialog
          open
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 m-0 w-full h-full max-w-none max-h-none border-0 bg-transparent"
          style={{
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(10px)",
          }}
          aria-label={modal === "earned" ? "Diamonds earned!" : "Watching ad"}
          onKeyDown={(e) => {
            if (e.key === "Escape") e.preventDefault();
          }}
        >
          <div
            className="w-full sm:max-w-sm flex flex-col bg-card overflow-hidden"
            style={{
              borderRadius: "20px 20px 0 0",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.55)",
            }}
          >
            {/* ── PLAYING ──────────────────────────────────────────────────── */}
            {modal === "playing" && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                  {/* Language selector */}
                  <div
                    className="flex items-center rounded-full overflow-hidden"
                    style={{
                      border: "1px solid oklch(var(--border))",
                      fontSize: "11px",
                    }}
                    aria-label="Select ad language"
                  >
                    <button
                      type="button"
                      onClick={() => toggleLang("en")}
                      data-ocid="reward-ad-lang-en"
                      className="px-2.5 py-1 font-semibold transition-colors focus-visible:outline-none"
                      style={{
                        background:
                          lang === "en"
                            ? "linear-gradient(135deg,#4f46e5,#7c3aed)"
                            : "transparent",
                        color:
                          lang === "en"
                            ? "#fff"
                            : "oklch(var(--muted-foreground))",
                      }}
                      aria-pressed={lang === "en"}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleLang("hi")}
                      data-ocid="reward-ad-lang-hi"
                      className="px-2.5 py-1 font-semibold transition-colors focus-visible:outline-none"
                      style={{
                        background:
                          lang === "hi"
                            ? "linear-gradient(135deg,#4f46e5,#7c3aed)"
                            : "transparent",
                        color:
                          lang === "hi"
                            ? "#fff"
                            : "oklch(var(--muted-foreground))",
                      }}
                      aria-pressed={lang === "hi"}
                    >
                      HI
                    </button>
                  </div>

                  <p className="font-bold text-foreground text-sm">
                    Save Shop System — Ad
                  </p>

                  <span
                    className="text-xs font-semibold px-2 py-1 rounded-full"
                    style={{
                      background: "rgba(79,70,229,0.12)",
                      color: "#4f46e5",
                    }}
                    aria-live="polite"
                    aria-label={`${secondsLeft} seconds remaining`}
                  >
                    {secondsLeft}s left
                  </span>
                </div>

                {/* Promo slide */}
                <div
                  className="relative w-full overflow-hidden flex items-center justify-center"
                  style={{
                    aspectRatio: "16/9",
                    background: currentSlide.bg,
                    transition: "background 0.6s ease",
                  }}
                  aria-label={`Slide ${slideIndex + 1} of ${TOTAL_SLIDES}: ${currentSlide.title}`}
                >
                  {/* Decorative circles */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: "-30%",
                      right: "-15%",
                      width: "200px",
                      height: "200px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.06)",
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      bottom: "-20%",
                      left: "-10%",
                      width: "150px",
                      height: "150px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.05)",
                      pointerEvents: "none",
                    }}
                  />

                  {/* Slide content */}
                  <div
                    className="flex flex-col items-center justify-center text-center px-6 gap-2"
                    style={{
                      opacity: slideVisible ? 1 : 0,
                      transform: slideVisible
                        ? "translateY(0)"
                        : "translateY(12px)",
                      transition: "opacity 0.35s ease, transform 0.35s ease",
                      position: "relative",
                      zIndex: 2,
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        fontSize: currentSlide.large ? "48px" : "40px",
                        lineHeight: 1,
                        filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.25))",
                      }}
                    >
                      {currentSlide.emoji}
                    </span>
                    <p
                      className="font-extrabold text-white leading-tight"
                      style={{
                        fontSize: currentSlide.large ? "22px" : "18px",
                        textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                        maxWidth: "280px",
                      }}
                    >
                      {currentSlide.title}
                    </p>
                    <p
                      className="text-white/90 leading-snug"
                      style={{
                        fontSize:
                          currentSlide.key === "final" ? "14px" : "13px",
                        fontWeight: currentSlide.key === "final" ? 600 : 400,
                        textShadow: "0 1px 4px rgba(0,0,0,0.25)",
                        maxWidth: "260px",
                      }}
                    >
                      {currentSlide.body}
                    </p>
                  </div>

                  {/* Dot indicators */}
                  <div
                    className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5"
                    aria-hidden="true"
                  >
                    {slides.map((slide, i) => (
                      <div
                        key={slide.key}
                        style={{
                          width: i === slideIndex ? "16px" : "6px",
                          height: "6px",
                          borderRadius: "3px",
                          background:
                            i === slideIndex
                              ? "rgba(255,255,255,0.9)"
                              : "rgba(255,255,255,0.35)",
                          transition: "width 0.3s ease, background 0.3s ease",
                        }}
                      />
                    ))}
                  </div>

                  {/* No skip badge */}
                  <div
                    className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(0,0,0,0.45)",
                      fontSize: "10px",
                      color: "rgba(255,255,255,0.65)",
                    }}
                    aria-hidden="true"
                  >
                    No skip
                  </div>
                </div>

                {/* Progress bar */}
                <div className="px-4 pt-3 pb-1">
                  <div
                    className="w-full rounded-full overflow-hidden"
                    style={{ height: "5px", background: "oklch(var(--muted))" }}
                    role="progressbar"
                    tabIndex={-1}
                    aria-valuenow={Math.round(progress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Ad progress: ${Math.round(progress)}%`}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${progress}%`,
                        background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
                        transition: "width 0.3s linear",
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">
                      Slide {slideIndex + 1}/{TOTAL_SLIDES}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Watch to earn 1 💎
                    </span>
                  </div>
                </div>

                <p
                  className="text-center text-muted-foreground px-4 pb-4 pt-1"
                  style={{ fontSize: "11px" }}
                >
                  Watch the full ad to earn your diamond reward
                </p>
              </>
            )}

            {/* ── EARNED ───────────────────────────────────────────────────── */}
            {modal === "earned" && (
              <div className="flex flex-col items-center gap-4 px-6 py-8">
                <div
                  className="w-20 h-20 flex items-center justify-center rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #16A34A, #15803D)",
                    boxShadow: "0 0 0 6px rgba(22,163,74,0.18)",
                    animation: "adSuccessPulse 0.6s ease-out",
                  }}
                >
                  <span className="text-4xl" aria-hidden="true">
                    ✅
                  </span>
                </div>
                <div className="text-center">
                  <p
                    className="font-bold text-foreground text-xl"
                    data-ocid="reward-ad-earned-message"
                  >
                    🎁 +1 Diamond Earned!
                  </p>
                  <p
                    className="text-muted-foreground mt-1"
                    style={{ fontSize: "12px" }}
                  >
                    Keep watching ads for more diamonds
                  </p>
                </div>
                {autoCloseIn !== null && autoCloseIn > 0 && (
                  <p
                    className="text-muted-foreground"
                    style={{ fontSize: "11px" }}
                    aria-live="polite"
                  >
                    Closing in {autoCloseIn}s...
                  </p>
                )}
              </div>
            )}
          </div>
        </dialog>
      )}

      <style>{`
        @keyframes adSuccessPulse {
          0%   { transform: scale(0.7); opacity: 0; }
          60%  { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>
    </>
  );
}
