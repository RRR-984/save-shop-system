import { Download, Smartphone, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import usePWA from "../hooks/usePWA";

const PWA_DECLINED_KEY = "pwa_prompt_declined_at";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function wasDeclinedToday(): boolean {
  const raw = localStorage.getItem(PWA_DECLINED_KEY);
  if (!raw) return false;
  const ts = Number(raw);
  return Date.now() - ts < ONE_DAY_MS;
}

export function PWAInstallModal() {
  const {
    isInstallable,
    isInstalled,
    showInstallPrompt,
    handleInstallDecline,
  } = usePWA();
  const [visible, setVisible] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (isInstalled || wasDeclinedToday()) return;
    const timer = setTimeout(() => {
      if (isInstallable) {
        setVisible(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled]);

  const handleInstall = async () => {
    await showInstallPrompt();
    setVisible(false);
  };

  const handleLater = () => {
    handleInstallDecline();
    setVisible(false);
  };

  const handleManualInfo = () => {
    if (isInstalled || wasDeclinedToday()) return;
    // Show fallback instructions for non-Chrome or unsupported browsers
    setShowFallback(true);
    setVisible(true);
  };

  // Expose handleManualInfo for external trigger if needed
  void handleManualInfo;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="pwa-install-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9000] flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          data-ocid="pwa.install_modal_overlay"
        >
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            className="bg-card text-foreground rounded-2xl shadow-2xl max-w-sm w-full p-6 relative"
            data-ocid="pwa.install_modal_card"
          >
            {/* Close */}
            <button
              type="button"
              onClick={handleLater}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
              data-ocid="pwa.install_modal_close"
            >
              <X size={15} />
            </button>

            {/* Logo */}
            <div className="flex justify-center mb-4">
              <img
                src="/assets/diamond-logo.jpg"
                alt="FIFO Bridge"
                className="w-12 h-12 rounded-xl object-contain shadow-md"
              />
            </div>

            {!showFallback ? (
              <>
                <h2 className="text-center text-base font-bold text-foreground mb-1">
                  Install FIFO Bridge App
                </h2>
                <p className="text-center text-sm text-muted-foreground mb-5 leading-relaxed">
                  Install this app on your phone for faster and smoother
                  experience.
                </p>

                <button
                  type="button"
                  onClick={handleInstall}
                  data-ocid="pwa.install_now_button"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm mb-3 transition-opacity hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background:
                      "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                    boxShadow: "0 4px 16px rgba(124,58,237,0.4)",
                  }}
                >
                  <Download size={16} />
                  Install Now
                </button>

                <button
                  type="button"
                  onClick={handleLater}
                  data-ocid="pwa.install_later_button"
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground py-2 transition-colors"
                >
                  Later
                </button>
              </>
            ) : (
              <>
                <h2 className="text-center text-base font-bold text-foreground mb-1">
                  Add to Home Screen
                </h2>
                <div
                  className="rounded-xl p-4 mb-4 text-sm text-foreground leading-relaxed"
                  style={{
                    background: "rgba(124,58,237,0.08)",
                    border: "1px solid rgba(124,58,237,0.2)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Smartphone
                      size={18}
                      className="text-purple-500 mt-0.5 flex-shrink-0"
                    />
                    <span>
                      Use <strong>Chrome</strong> → Tap menu <strong>⋮</strong>{" "}
                      → <strong>Add to Home Screen</strong>
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLater}
                  data-ocid="pwa.install_fallback_close"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90"
                  style={{
                    background:
                      "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                  }}
                >
                  Got it
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
