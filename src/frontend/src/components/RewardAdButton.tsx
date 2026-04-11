import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes
const COUNTDOWN_SECS = 30;
const SKIP_UNLOCK_AT = 25; // seconds elapsed before skip is allowed
const STORAGE_KEY = "lastAdWatch";

// Reliable short public domain sample video
const AD_VIDEO_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4";

interface Props {
  onEarnDiamond: () => void;
}

type ModalState = "idle" | "watching" | "done";

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

export function RewardAdButton({ onEarnDiamond }: Props) {
  const { language } = useLanguage();
  const isHi = language === "hi";

  const [modal, setModal] = useState<ModalState>("idle");
  const [elapsed, setElapsed] = useState(0); // seconds watched
  const [cooldownMs, setCooldownMs] = useState<number>(getCooldownRemaining);
  const [isMuted, setIsMuted] = useState(true);
  const [videoReady, setVideoReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const elapsedRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cooldown ticker
  const hasCooldown = cooldownMs > 0;
  useEffect(() => {
    if (!hasCooldown) return;
    cooldownRef.current = setInterval(() => {
      const remaining = getCooldownRemaining();
      setCooldownMs(remaining);
      if (remaining <= 0 && cooldownRef.current) {
        clearInterval(cooldownRef.current);
      }
    }, 1000);
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [hasCooldown]);

  // Elapsed ticker — drives the countdown overlay while video is playing
  useEffect(() => {
    if (modal !== "watching") {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }
    tickRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
      if (elapsedRef.current >= COUNTDOWN_SECS) {
        clearInterval(tickRef.current!);
        handleEarn();
      }
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal]);

  const handleOpen = () => {
    if (cooldownMs > 0) return;
    elapsedRef.current = 0;
    setElapsed(0);
    setVideoReady(false);
    setIsMuted(true);
    setModal("watching");
  };

  const handleEarn = () => {
    if (tickRef.current) clearInterval(tickRef.current);
    setModal("done");
  };

  const handleSkip = () => {
    if (elapsed < SKIP_UNLOCK_AT) return;
    if (tickRef.current) clearInterval(tickRef.current);
    setModal("done");
  };

  const handleClaim = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setCooldownMs(COOLDOWN_MS);
    setModal("idle");
    onEarnDiamond();
  };

  const handleClose = () => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (videoRef.current) {
      videoRef.current.pause();
    }
    elapsedRef.current = 0;
    setElapsed(0);
    setModal("idle");
  };

  const handleVideoError = () => {
    // Fallback: if video fails to load, continue in countdown-only mode
    setVideoReady(false);
    elapsedRef.current = 0;
    setElapsed(0);
  };

  const handleVideoLoaded = () => {
    setVideoReady(true);
    videoRef.current?.play().catch(() => {
      // autoplay blocked — muted play should work
    });
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted((m) => !m);
  };

  const inCooldown = cooldownMs > 0;
  const remaining = Math.max(0, COUNTDOWN_SECS - elapsed);
  const progress = Math.min(100, (elapsed / COUNTDOWN_SECS) * 100);
  const canSkip = elapsed >= SKIP_UNLOCK_AT;

  const t = {
    watchAd: isHi ? "विज्ञापन देखें और 1 💎 कमाएं" : "Watch Ad & Earn 1 💎",
    watchDesc: isHi
      ? "केवल 30 सेकंड • मुफ्त डायमंड"
      : "Only 30 seconds • Free diamonds",
    comeBack: isHi
      ? `${fmtCooldown(cooldownMs)} में वापस आएं`
      : `Come back in ${fmtCooldown(cooldownMs)}`,
    moreDiamonds: isHi ? "और 💎 डायमंड कमाने के लिए" : "to earn more 💎 diamonds",
    watchingAd: isHi ? "विज्ञापन देख रहे हैं..." : "Watching Advertisement...",
    pleaseWait: isHi
      ? "डायमंड पाने के लिए प्रतीक्षा करें"
      : "Please wait to earn your diamond",
    secondsLeft: isHi
      ? `${remaining} सेकंड शेष`
      : `${remaining} seconds remaining`,
    skipIn: isHi
      ? `${SKIP_UNLOCK_AT - elapsed}s में स्किप`
      : `Skip in ${SKIP_UNLOCK_AT - elapsed}s`,
    skip: isHi ? "स्किप करें ›" : "Skip ›",
    cancel: isHi ? "रद्द करें" : "Cancel",
    earned: isHi ? "🎉 1 डायमंड मिला!" : "🎉 You earned 1 Diamond!",
    earnedDesc: isHi
      ? "और डायमंड के लिए विज्ञापन देखते रहें"
      : "Keep watching ads to level up faster",
    claim: isHi ? "डायमंड प्राप्त करें 💎" : "Claim Diamond 💎",
    loadingVideo: isHi ? "वीडियो लोड हो रहा है..." : "Loading video...",
    unmute: isHi ? "आवाज़ चालू करें 🔊" : "Unmute 🔊",
    mute: isHi ? "आवाज़ बंद करें 🔇" : "Mute 🔇",
  };

  return (
    <>
      {/* Trigger card */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={inCooldown}
        data-ocid="reward-ad-button"
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[14px] border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          background: inCooldown
            ? "oklch(var(--muted))"
            : "linear-gradient(135deg, #D97706 0%, #92400E 100%)",
          borderColor: inCooldown ? "oklch(var(--border))" : "transparent",
          boxShadow: inCooldown ? "none" : "0 4px 14px rgba(217,119,6,0.35)",
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
                {t.comeBack}
              </p>
              <p
                className="text-muted-foreground/70 leading-snug"
                style={{ fontSize: "11px" }}
              >
                {t.moreDiamonds}
              </p>
            </>
          ) : (
            <>
              <p
                className="font-bold text-white leading-tight"
                style={{ fontSize: "13px" }}
              >
                {t.watchAd}
              </p>
              <p
                className="text-white/80 leading-snug"
                style={{ fontSize: "11px" }}
              >
                {t.watchDesc}
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

      {/* Modal overlay */}
      {modal !== "idle" && (
        <dialog
          open
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 m-0 w-full h-full max-w-none max-h-none border-0 bg-transparent"
          style={{
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
          }}
          aria-label={modal === "done" ? "Diamond earned!" : "Watching ad"}
        >
          <div
            className="w-full sm:max-w-sm flex flex-col bg-card overflow-hidden"
            style={{
              borderRadius: "20px 20px 0 0",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.35)",
            }}
          >
            {modal === "watching" ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg" aria-hidden="true">
                      🎬
                    </span>
                    <p className="font-bold text-foreground text-sm">
                      {t.watchingAd}
                    </p>
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded-full"
                    style={{
                      background: "rgba(217,119,6,0.15)",
                      color: "#D97706",
                    }}
                  >
                    {t.secondsLeft}
                  </span>
                </div>

                {/* Video area */}
                <div
                  className="relative w-full overflow-hidden"
                  style={{ aspectRatio: "16/9", background: "#000" }}
                >
                  {/* Loading shimmer */}
                  {!videoReady && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
                      <div className="w-8 h-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
                      <span className="text-white/70 text-xs">
                        {t.loadingVideo}
                      </span>
                    </div>
                  )}

                  {/* Actual video */}
                  <video
                    ref={videoRef}
                    src={AD_VIDEO_URL}
                    muted={isMuted}
                    playsInline
                    autoPlay
                    onLoadedData={handleVideoLoaded}
                    onError={handleVideoError}
                    onEnded={handleEarn}
                    className="w-full h-full object-cover"
                    style={{
                      opacity: videoReady ? 1 : 0,
                      transition: "opacity 0.3s",
                    }}
                    aria-label="Advertisement video"
                  />

                  {/* Countdown overlay — top right */}
                  <div
                    className="absolute top-2 right-2 z-20 flex items-center justify-center rounded-full"
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "rgba(0,0,0,0.6)",
                      border: "2px solid rgba(245,158,11,0.8)",
                    }}
                  >
                    <span
                      className="font-extrabold text-white"
                      style={{ fontSize: "15px", lineHeight: 1 }}
                    >
                      {remaining}
                    </span>
                  </div>

                  {/* Mute toggle — bottom left */}
                  {videoReady && (
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="absolute bottom-2 left-2 z-20 text-white/80 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded-full px-2 py-1"
                      style={{
                        background: "rgba(0,0,0,0.5)",
                        fontSize: "11px",
                      }}
                      aria-label={isMuted ? "Unmute video" : "Mute video"}
                    >
                      {isMuted ? t.unmute : t.mute}
                    </button>
                  )}
                </div>

                {/* Progress bar */}
                <div className="px-4 pt-3 pb-1">
                  <div
                    className="w-full rounded-full overflow-hidden"
                    style={{ height: "5px", background: "oklch(var(--muted))" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-linear"
                      style={{
                        width: `${progress}%`,
                        background: "linear-gradient(90deg, #F59E0B, #D97706)",
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">
                      0s
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {COUNTDOWN_SECS}s
                    </span>
                  </div>
                </div>

                {/* Subtext */}
                <p
                  className="text-center text-muted-foreground px-4 pb-2"
                  style={{ fontSize: "11px" }}
                >
                  {t.pleaseWait}
                </p>

                {/* Skip / Cancel row */}
                <div className="flex items-center justify-between gap-2 px-4 pb-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-2 py-1"
                    style={{ fontSize: "12px" }}
                  >
                    {t.cancel}
                  </button>

                  <button
                    type="button"
                    onClick={handleSkip}
                    disabled={!canSkip}
                    data-ocid="reward-ad-skip"
                    className="rounded-full px-4 py-1.5 font-semibold text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                    style={{
                      background: canSkip
                        ? "linear-gradient(135deg, #D97706 0%, #92400E 100%)"
                        : "oklch(var(--muted))",
                      color: canSkip
                        ? "#fff"
                        : "oklch(var(--muted-foreground))",
                      fontSize: "12px",
                      minWidth: "90px",
                    }}
                  >
                    {canSkip ? t.skip : t.skipIn}
                  </button>
                </div>
              </>
            ) : (
              /* Done state */
              <div className="flex flex-col items-center gap-4 px-6 py-8">
                {/* Close X — visible after earning */}
                <button
                  type="button"
                  onClick={handleClaim}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Close"
                  style={{ fontSize: "14px" }}
                >
                  ✕
                </button>

                <div
                  className="w-20 h-20 flex items-center justify-center rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #D97706, #92400E)",
                  }}
                >
                  <span className="text-4xl" aria-hidden="true">
                    💎
                  </span>
                </div>

                <div className="text-center">
                  <p className="font-bold text-foreground text-lg">
                    {t.earned}
                  </p>
                  <p
                    className="text-muted-foreground mt-1"
                    style={{ fontSize: "12px" }}
                  >
                    {t.earnedDesc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClaim}
                  data-ocid="reward-ad-claim"
                  className="w-full py-3 px-4 rounded-[12px] font-bold text-white transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  style={{
                    background:
                      "linear-gradient(135deg, #D97706 0%, #92400E 100%)",
                    boxShadow: "0 4px 14px rgba(217,119,6,0.4)",
                  }}
                >
                  {t.claim}
                </button>
              </div>
            )}
          </div>
        </dialog>
      )}
    </>
  );
}
