/**
 * QRScannerToggle — compact inline barcode/QR scanner toggle for Billing screen.
 *
 * Uses the browser's native BarcodeDetector API (W3C, Chrome/Android) with
 * getUserMedia video stream. Falls back to a helpful message on unsupported
 * browsers.
 */

import { Button } from "@/components/ui/button";
import { ScanBarcode, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import type { Product } from "../types/store";

// ── BarcodeDetector type declarations (not in all TS DOM libs) ────────────────

interface BarcodeDetectorOptions {
  formats?: string[];
}

interface DetectedBarcode {
  rawValue: string;
  format: string;
}

interface BarcodeDetectorInstance {
  detect(image: HTMLVideoElement): Promise<DetectedBarcode[]>;
}

interface BarcodeDetectorConstructor {
  new (options?: BarcodeDetectorOptions): BarcodeDetectorInstance;
  getSupportedFormats(): Promise<string[]>;
}

function getBarcodeDetector(): BarcodeDetectorConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.BarcodeDetector as BarcodeDetectorConstructor) ?? null;
}

// ── Product matching helpers ──────────────────────────────────────────────────

function matchProduct(scanResult: string, products: Product[]): Product | null {
  const raw = scanResult.trim();
  if (!raw) return null;

  const lower = raw.toLowerCase();

  // Exact ID match
  const byId = products.find((p) => p.id === raw);
  if (byId) return byId;

  // Exact name match (case-insensitive)
  const byName = products.find((p) => p.name.toLowerCase() === lower);
  if (byName) return byName;

  // Name starts with scanned (or vice-versa)
  const byPartial = products.find(
    (p) =>
      p.name.toLowerCase().startsWith(lower) ||
      lower.startsWith(p.name.toLowerCase()),
  );
  if (byPartial) return byPartial;

  // Scanned string contains product name
  return products.find((p) => lower.includes(p.name.toLowerCase())) ?? null;
}

const SCAN_INTERVAL_MS = 350;

// ── Component ─────────────────────────────────────────────────────────────────

interface QRScannerToggleProps {
  products: Product[];
  onProductScanned: (productId: string) => void;
  qtyInputRef?: React.RefObject<HTMLInputElement | null>;
  disabled?: boolean;
  className?: string;
}

export function QRScannerToggle({
  products,
  onProductScanned,
  qtyInputRef,
  disabled = false,
  className = "",
}: QRScannerToggleProps) {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [isSupported] = useState(() => !!getBarcodeDetector());

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<BarcodeDetectorInstance | null>(null);
  const scanTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastResultRef = useRef<string>("");
  const productsRef = useRef(products);
  productsRef.current = products;
  const onProductScannedRef = useRef(onProductScanned);
  onProductScannedRef.current = onProductScanned;
  const qtyInputRefRef = useRef(qtyInputRef);
  qtyInputRefRef.current = qtyInputRef;

  // ── Stop camera + clean up ───────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (scanTimerRef.current) {
      clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  }, []);

  // ── Start camera + detection loop ────────────────────────────────────────
  const startCamera = useCallback(
    async (lang: string) => {
      setCameraError(null);
      setNotFound(false);
      setLastScanned(null);
      lastResultRef.current = "";

      const BarcodeDetectorAPI = getBarcodeDetector();
      if (!BarcodeDetectorAPI) {
        const msg =
          lang === "hi"
            ? "यह ब्राउज़र बारकोड स्कैनिंग का समर्थन नहीं करता। Android Chrome में खोलें।"
            : "Barcode scanning not supported. Please use Chrome on Android or desktop Chrome.";
        setCameraError(msg);
        return;
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch (err: unknown) {
        const errName = err instanceof Error ? err.name : "";
        const isDenied =
          errName === "NotAllowedError" || errName === "PermissionDeniedError";
        const msg = isDenied
          ? lang === "hi"
            ? "कैमरा अनुमति नहीं मिली। ब्राउज़र सेटिंग्स में अनुमति दें।"
            : "Camera permission denied. Please allow camera access in browser settings."
          : lang === "hi"
            ? "कैमरा शुरू नहीं हो सका।"
            : "Could not start camera. Please try again.";
        setCameraError(msg);
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {
          /* ignore */
        }
      }

      // Init detector with common formats
      try {
        detectorRef.current = new BarcodeDetectorAPI({
          formats: [
            "qr_code",
            "code_128",
            "ean_13",
            "ean_8",
            "upc_a",
            "upc_e",
            "code_39",
            "code_93",
            "itf",
            "data_matrix",
          ],
        });
      } catch {
        detectorRef.current = new BarcodeDetectorAPI();
      }

      setScanning(true);

      // Detection loop
      scanTimerRef.current = setInterval(() => {
        void (async () => {
          if (
            !videoRef.current ||
            videoRef.current.readyState < 2 ||
            !detectorRef.current
          )
            return;
          try {
            const barcodes = await detectorRef.current.detect(videoRef.current);
            if (barcodes.length === 0) return;

            const raw = barcodes[0].rawValue;
            if (!raw || raw === lastResultRef.current) return;
            lastResultRef.current = raw;

            setLastScanned(raw);
            const matched = matchProduct(raw, productsRef.current);
            if (matched) {
              stopCamera();
              setIsOpen(false);
              setNotFound(false);
              onProductScannedRef.current(matched.id);
              setTimeout(() => {
                qtyInputRefRef.current?.current?.focus();
                qtyInputRefRef.current?.current?.select();
              }, 150);
            } else {
              setNotFound(true);
              lastResultRef.current = "";
              setTimeout(() => setNotFound(false), 2500);
            }
          } catch {
            /* ignore */
          }
        })();
      }, SCAN_INTERVAL_MS);
    },
    [stopCamera],
  );

  // ── Toggle open/close ────────────────────────────────────────────────────
  const handleToggle = useCallback(() => {
    if (disabled) return;
    if (isOpen) {
      stopCamera();
      setIsOpen(false);
      setCameraError(null);
      setNotFound(false);
    } else {
      setIsOpen(true);
    }
  }, [disabled, isOpen, stopCamera]);

  // When panel opens, start camera (language captured via closure ref)
  const languageRef = useRef(language);
  languageRef.current = language;

  useEffect(() => {
    if (isOpen) {
      void startCamera(languageRef.current);
    }
  }, [isOpen, startCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // ── Labels ───────────────────────────────────────────────────────────────
  const labelToggle =
    language === "hi" ? "बारकोड/QR स्कैन करें" : "Scan Barcode/QR";
  const labelScanning = language === "hi" ? "स्कैन हो रहा है..." : "Scanning...";
  const labelPoint =
    language === "hi"
      ? "कैमरे पर बारकोड रखें..."
      : "Point barcode or QR code at camera...";
  const labelNotFound =
    language === "hi"
      ? "उत्पाद नहीं मिला — फिर कोशिश करें"
      : "Product not found — try again";
  const labelRetry = language === "hi" ? "फिर कोशिश करें" : "Try Again";

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Compact toggle button — matches VoiceInputButton compact style */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-label={isOpen ? t("Stop") : labelToggle}
        aria-pressed={isOpen}
        data-ocid="billing.scanner_toggle.button"
        title={labelToggle}
        className={[
          "inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          isOpen
            ? "border-primary bg-primary/10 text-primary shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_15%,transparent)]"
            : "border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-primary/60 hover:bg-primary/5 active:scale-95",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
      >
        {isOpen ? <X size={16} /> : <ScanBarcode size={16} />}
      </button>

      {/* Inline scanner panel — appears below toggle */}
      {isOpen && (
        <div
          data-ocid="billing.scanner_panel"
          className="rounded-xl border border-border bg-card shadow-md overflow-hidden"
          style={{ width: "min(320px, 88vw)" }}
        >
          {/* Header bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/40">
            <div className="flex items-center gap-1.5 min-w-0">
              <ScanBarcode size={14} className="text-primary shrink-0" />
              <span className="text-xs font-semibold text-foreground truncate">
                {labelToggle}
              </span>
              {scanning && (
                <span className="flex items-center gap-1 text-[10px] text-primary font-medium shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  {labelScanning}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleToggle}
              aria-label="Close scanner"
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded ml-1 shrink-0"
              data-ocid="billing.scanner_close.button"
            >
              <X size={14} />
            </button>
          </div>

          {/* Camera viewport OR error */}
          {!cameraError ? (
            <div
              className="relative bg-black"
              style={{ aspectRatio: "4/3", maxHeight: "240px" }}
            >
              <video
                ref={videoRef}
                muted
                playsInline
                className="w-full h-full object-cover"
                data-ocid="billing.scanner_video"
              />

              {/* Scan frame overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-36 h-36">
                  {/* Corner brackets */}
                  <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl" />
                  <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr" />
                  <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl" />
                  <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br" />

                  {/* Animated scan line */}
                  {scanning && (
                    <span
                      className="absolute left-2 right-2 h-px bg-primary/80"
                      style={{
                        animation: "qrScanLine 1.8s ease-in-out infinite",
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Vignette */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 72% 62% at 50% 50%, transparent 52%, rgba(0,0,0,0.5) 100%)",
                }}
              />

              {/* Status text */}
              <div className="absolute bottom-0 left-0 right-0 pb-2 px-2 text-center">
                <p className="text-[11px] leading-tight">
                  {notFound ? (
                    <span className="text-red-300 font-semibold drop-shadow">
                      {labelNotFound}
                    </span>
                  ) : (
                    <span className="text-white/75 drop-shadow-sm">
                      {labelPoint}
                    </span>
                  )}
                </p>
                {lastScanned && !notFound && (
                  <p className="text-[10px] text-white/40 mt-0.5 truncate">
                    {lastScanned}
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Error / unsupported state */
            <div className="p-5 flex flex-col items-center gap-3 text-center">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                {isSupported ? (
                  <X size={20} className="text-destructive" />
                ) : (
                  <ScanBarcode size={20} className="text-muted-foreground" />
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {cameraError}
              </p>
              {isSupported && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  data-ocid="billing.scanner_retry.button"
                  onClick={() => {
                    setCameraError(null);
                    void startCamera(language);
                  }}
                >
                  {labelRetry}
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Scan-line animation keyframes */}
      <style>{`
        @keyframes qrScanLine {
          0%   { top: 8px;  opacity: 0.2; }
          30%  { opacity: 1; }
          70%  { opacity: 1; }
          100% { top: calc(100% - 8px); opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}
