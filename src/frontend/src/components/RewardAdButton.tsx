import { useEffect, useRef, useState } from "react";

const COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes
const STORAGE_KEY = "lastAdWatch";

// ─────────────────────────────────────────────────────────────────
// AD_VIDEO_SOURCES — only the user's uploaded video is used.
// No external fallback URLs.
// ─────────────────────────────────────────────────────────────────
const AD_VIDEO_SOURCES = ["/assets/ad-video.mp4"];

interface Props {
  onEarnDiamond: () => void;
}

type ModalState = "idle" | "playing" | "earned";

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
  const [modal, setModal] = useState<ModalState>("idle");
  const [cooldownMs, setCooldownMs] = useState<number>(getCooldownRemaining);
  const [isMuted, setIsMuted] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [progress, setProgress] = useState(0); // 0–100
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [autoCloseIn, setAutoCloseIn] = useState<number | null>(null);

  // ── Fallback state ────────────────────────────────────────────────
  const [videoSrcIndex, setVideoSrcIndex] = useState(0);
  const allFallbacksExhausted = videoSrcIndex >= AD_VIDEO_SOURCES.length;

  const videoRef = useRef<HTMLVideoElement>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoCloseRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Cooldown ticker ──────────────────────────────────────────────
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

  // ── Open modal — reset all state fresh ───────────────────────────
  const handleOpen = () => {
    if (cooldownMs > 0) return;
    setVideoReady(false);
    setProgress(0);
    setSecondsLeft(null);
    setIsMuted(true);
    setVideoSrcIndex(0); // reset fallback index on fresh open
    setModal("playing");
  };

  // ── Load + play video whenever src index changes & modal is open ─
  useEffect(() => {
    if (modal !== "playing") return;
    const vid = videoRef.current;
    if (!vid) return;
    if (allFallbacksExhausted) return;

    setVideoReady(false);
    vid.load(); // explicitly reload with the new src
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal, allFallbacksExhausted]);

  // ── Video loaded — start playback now ───────────────────────────
  const handleVideoLoaded = () => {
    setVideoReady(true);
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = true;
    vid.play().catch(() => {
      // autoplay blocked edge case — muted, should not happen
    });
  };

  // ── Time update — drive progress bar and countdown ───────────────
  const handleTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid || !vid.duration) return;
    const pct = (vid.currentTime / vid.duration) * 100;
    setProgress(Math.min(100, pct));
    const sLeft = Math.ceil(vid.duration - vid.currentTime);
    setSecondsLeft(sLeft > 0 ? sLeft : 0);
  };

  // ── Video ended — award diamonds, then auto-close ────────────────
  const handleEnded = () => {
    setProgress(100);
    setSecondsLeft(0);
    setModal("earned");

    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setCooldownMs(COOLDOWN_MS);
    onEarnDiamond();

    // Auto-close after 2 seconds
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
  };

  // ── Video error — try next fallback, or show final error ─────────
  const handleVideoError = () => {
    setVideoReady(false);
    setVideoSrcIndex((prev) => prev + 1);
  };

  const handleCloseOnError = () => {
    if (videoRef.current) videoRef.current.pause();
    setModal("idle");
    setVideoSrcIndex(0);
  };

  // ── Mute toggle ─────────────────────────────────────────────────
  const toggleMute = () => {
    if (videoRef.current) {
      const next = !isMuted;
      videoRef.current.muted = next;
      setIsMuted(next);
    }
  };

  // ── Cleanup on unmount ───────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (autoCloseRef.current) clearInterval(autoCloseRef.current);
    };
  }, []);

  const inCooldown = cooldownMs > 0;
  const currentSrc = AD_VIDEO_SOURCES[videoSrcIndex] ?? "";
  const isTryingFallback = videoSrcIndex > 0 && !allFallbacksExhausted;

  return (
    <>
      {/* ── Trigger button ────────────────────────────────────────── */}
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

      {/* ── Modal overlay ─────────────────────────────────────────── */}
      {modal !== "idle" && (
        <dialog
          open
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 m-0 w-full h-full max-w-none max-h-none border-0 bg-transparent"
          style={{
            background: "rgba(0,0,0,0.82)",
            backdropFilter: "blur(8px)",
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
              boxShadow: "0 -8px 40px rgba(0,0,0,0.45)",
            }}
          >
            {/* ── PLAYING STATE ───────────────────────────────────── */}
            {modal === "playing" && (
              <>
                {/* Header — no close button */}
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg" aria-hidden="true">
                      🎬
                    </span>
                    <p className="font-bold text-foreground text-sm">
                      Watching advertisement...
                    </p>
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded-full"
                    style={{
                      background: "rgba(217,119,6,0.15)",
                      color: "#D97706",
                    }}
                  >
                    {secondsLeft !== null
                      ? `${secondsLeft}s remaining`
                      : "Loading..."}
                  </span>
                </div>

                {/* Video area */}
                <div
                  className="relative w-full overflow-hidden"
                  style={{ aspectRatio: "16/9", background: "#000" }}
                >
                  {/* Loading shimmer — shown while trying to load any source */}
                  {!videoReady && !allFallbacksExhausted && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
                      <div className="w-8 h-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
                      <span className="text-white/70 text-xs text-center px-4">
                        {isTryingFallback
                          ? "Ad video is loading, please wait..."
                          : "Loading video..."}
                      </span>
                    </div>
                  )}

                  {/* Final error state — all fallbacks exhausted */}
                  {allFallbacksExhausted && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 px-6 text-center">
                      <span className="text-3xl" aria-hidden="true">
                        ⚠️
                      </span>
                      <p className="text-white text-sm font-semibold">
                        Video failed to load. Please try again later.
                      </p>
                      <p className="text-white/60 text-xs">
                        Please check your connection and try again.
                      </p>
                      <button
                        type="button"
                        onClick={handleCloseOnError}
                        data-ocid="reward-ad-close-error"
                        className="mt-1 px-4 py-2 rounded-lg text-white text-xs font-semibold"
                        style={{ background: "rgba(217,119,6,0.8)" }}
                      >
                        Close
                      </button>
                    </div>
                  )}

                  {/* Video element — uses currentSrc from fallback list */}
                  {!allFallbacksExhausted && (
                    <video
                      ref={videoRef}
                      src={currentSrc}
                      muted={isMuted}
                      playsInline
                      preload="auto"
                      crossOrigin="anonymous"
                      onLoadedData={handleVideoLoaded}
                      onTimeUpdate={handleTimeUpdate}
                      onEnded={handleEnded}
                      onError={handleVideoError}
                      className="w-full h-full object-cover"
                      style={{
                        opacity: videoReady ? 1 : 0,
                        transition: "opacity 0.4s",
                      }}
                      aria-label="Advertisement video"
                    />
                  )}

                  {/* Countdown badge — top right */}
                  {videoReady && secondsLeft !== null && (
                    <div
                      className="absolute top-2 right-2 z-20 flex items-center justify-center rounded-full"
                      style={{
                        width: "42px",
                        height: "42px",
                        background: "rgba(0,0,0,0.65)",
                        border: "2px solid rgba(245,158,11,0.85)",
                      }}
                      aria-live="polite"
                      aria-label={`${secondsLeft} seconds remaining`}
                    >
                      <span
                        className="font-extrabold text-white"
                        style={{ fontSize: "15px", lineHeight: 1 }}
                      >
                        {secondsLeft}
                      </span>
                    </div>
                  )}

                  {/* Mute toggle — bottom left */}
                  {videoReady && (
                    <button
                      type="button"
                      onClick={toggleMute}
                      data-ocid="reward-ad-mute-toggle"
                      className="absolute bottom-2 left-2 z-20 text-white/80 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded-full px-2 py-1"
                      style={{
                        background: "rgba(0,0,0,0.55)",
                        fontSize: "11px",
                      }}
                      aria-label={isMuted ? "Unmute video" : "Mute video"}
                    >
                      {isMuted ? "Unmute 🔊" : "Mute 🔇"}
                    </button>
                  )}

                  {/* "No skip" badge — bottom right */}
                  {videoReady && (
                    <div
                      className="absolute bottom-2 right-2 z-20 px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(0,0,0,0.55)",
                        fontSize: "10px",
                        color: "rgba(255,255,255,0.6)",
                      }}
                      aria-hidden="true"
                    >
                      No skip
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="px-4 pt-3 pb-1">
                  <div
                    className="w-full rounded-full overflow-hidden"
                    style={{ height: "5px", background: "oklch(var(--muted))" }}
                    aria-label={`Ad progress: ${Math.round(progress)}%`}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${progress}%`,
                        background: "linear-gradient(90deg, #F59E0B, #D97706)",
                        transition: "width 0.5s linear",
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">
                      0s
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Watch to earn 1 💎
                    </span>
                  </div>
                </div>

                {/* Bottom label — NO cancel or skip buttons */}
                <p
                  className="text-center text-muted-foreground px-4 pb-4 pt-1"
                  style={{ fontSize: "11px" }}
                >
                  Watching ad... please wait — diamonds unlock at the end
                </p>
              </>
            )}

            {/* ── EARNED STATE ────────────────────────────────────── */}
            {modal === "earned" && (
              <div className="flex flex-col items-center gap-4 px-6 py-8">
                {/* Animated checkmark ring */}
                <div
                  className="w-20 h-20 flex items-center justify-center rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #16A34A, #15803D)",
                    boxShadow: "0 0 0 6px rgba(22,163,74,0.18)",
                    animation: "successPulse 0.6s ease-out",
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

                {/* Auto-close countdown */}
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

      {/* Inline keyframe for success pulse */}
      <style>{`
        @keyframes successPulse {
          0%   { transform: scale(0.7); opacity: 0; }
          60%  { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>
    </>
  );
}
