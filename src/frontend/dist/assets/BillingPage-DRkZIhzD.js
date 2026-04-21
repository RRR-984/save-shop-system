import { c as createLucideIcon, J as useLanguage, r as reactExports, j as jsxRuntimeExports, X, B as Button, l as useStore, h as useAuth, y as ue, v as Badge, K as FileText, m as Plus, N as TriangleAlert, C as Card, i as CardHeader, k as CardTitle, n as CardContent, L as Label, I as Input, O as getCustomerTier, Q as getActivityStatus, U as TIER_EMOJI, V as TIER_LABELS, W as TIER_COLORS, Y as ACTIVITY_LABELS, Z as ACTIVITY_COLORS, T as Table, o as TableHeader, p as TableRow, q as TableHead, s as TableBody, t as TableCell, x as Trash2, _ as Receipt, $ as Separator, R as ROLE_PERMISSIONS, a0 as ShieldAlert } from "./index-CyJThNPE.js";
import { C as Checkbox } from "./checkbox-DOLfvoF1.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-B5_zZfdK.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Bxpy6Yo8.js";
import { I as InvoiceShareModal } from "./InvoiceShareModal-DvaVzzYA.js";
import { V as VoiceInputButton } from "./VoiceInputButton-BQA2VpOB.js";
import { c as clearLeadingZeros } from "./numberInput-BP2ScP3W.js";
import { U as User } from "./user-HkQdw6T6.js";
import { L as Layers } from "./layers-BQcW8ecy.js";
import { L as Lock } from "./lock-CqoUDBIZ.js";
import "./index-DkH1qIwF.js";
import "./check-TLKRrqsL.js";
import "./index-CsaT76ve.js";
import "./index-BPYaWAKl.js";
import "./chevron-down-CsZruglM.js";
import "./chevron-up-CF0EzDAe.js";
import "./printer-CQSC8xiw.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [["path", { d: "M5 12h14", key: "1ays0h" }]];
const Minus = createLucideIcon("minus", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "M12 20h9", key: "t2du7b" }],
  [
    "path",
    {
      d: "M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z",
      key: "1ykcvy"
    }
  ]
];
const PenLine = createLucideIcon("pen-line", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M3 7V5a2 2 0 0 1 2-2h2", key: "aa7l1z" }],
  ["path", { d: "M17 3h2a2 2 0 0 1 2 2v2", key: "4qcy5o" }],
  ["path", { d: "M21 17v2a2 2 0 0 1-2 2h-2", key: "6vwrx8" }],
  ["path", { d: "M7 21H5a2 2 0 0 1-2-2v-2", key: "ioqczr" }],
  ["path", { d: "M8 7v10", key: "23sfjj" }],
  ["path", { d: "M12 7v10", key: "jspqdw" }],
  ["path", { d: "M17 7v10", key: "578dap" }]
];
const ScanBarcode = createLucideIcon("scan-barcode", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2", key: "wrbu53" }],
  ["path", { d: "M15 18H9", key: "1lyqi6" }],
  [
    "path",
    {
      d: "M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14",
      key: "lysw3i"
    }
  ],
  ["circle", { cx: "17", cy: "18", r: "2", key: "332jqn" }],
  ["circle", { cx: "7", cy: "18", r: "2", key: "19iecd" }]
];
const Truck = createLucideIcon("truck", __iconNode);
function getBarcodeDetector() {
  if (typeof window === "undefined") return null;
  const w = window;
  return w.BarcodeDetector ?? null;
}
function matchProduct(scanResult, products) {
  const raw = scanResult.trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  const byId = products.find((p) => p.id === raw);
  if (byId) return byId;
  const byName = products.find((p) => p.name.toLowerCase() === lower);
  if (byName) return byName;
  const byPartial = products.find(
    (p) => p.name.toLowerCase().startsWith(lower) || lower.startsWith(p.name.toLowerCase())
  );
  if (byPartial) return byPartial;
  return products.find((p) => lower.includes(p.name.toLowerCase())) ?? null;
}
const SCAN_INTERVAL_MS = 350;
function QRScannerToggle({
  products,
  onProductScanned,
  qtyInputRef,
  disabled = false,
  className = ""
}) {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = reactExports.useState(false);
  const [scanning, setScanning] = reactExports.useState(false);
  const [cameraError, setCameraError] = reactExports.useState(null);
  const [notFound, setNotFound] = reactExports.useState(false);
  const [lastScanned, setLastScanned] = reactExports.useState(null);
  const [isSupported] = reactExports.useState(() => !!getBarcodeDetector());
  const videoRef = reactExports.useRef(null);
  const streamRef = reactExports.useRef(null);
  const detectorRef = reactExports.useRef(null);
  const scanTimerRef = reactExports.useRef(null);
  const lastResultRef = reactExports.useRef("");
  const productsRef = reactExports.useRef(products);
  productsRef.current = products;
  const onProductScannedRef = reactExports.useRef(onProductScanned);
  onProductScannedRef.current = onProductScanned;
  const qtyInputRefRef = reactExports.useRef(qtyInputRef);
  qtyInputRefRef.current = qtyInputRef;
  const stopCamera = reactExports.useCallback(() => {
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
  const startCamera = reactExports.useCallback(
    async (lang) => {
      setCameraError(null);
      setNotFound(false);
      setLastScanned(null);
      lastResultRef.current = "";
      const BarcodeDetectorAPI = getBarcodeDetector();
      if (!BarcodeDetectorAPI) {
        const msg = lang === "hi" ? "यह ब्राउज़र बारकोड स्कैनिंग का समर्थन नहीं करता। Android Chrome में खोलें।" : "Barcode scanning not supported. Please use Chrome on Android or desktop Chrome.";
        setCameraError(msg);
        return;
      }
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      } catch (err) {
        const errName = err instanceof Error ? err.name : "";
        const isDenied = errName === "NotAllowedError" || errName === "PermissionDeniedError";
        const msg = isDenied ? lang === "hi" ? "कैमरा अनुमति नहीं मिली। ब्राउज़र सेटिंग्स में अनुमति दें।" : "Camera permission denied. Please allow camera access in browser settings." : lang === "hi" ? "कैमरा शुरू नहीं हो सका।" : "Could not start camera. Please try again.";
        setCameraError(msg);
        return;
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {
        }
      }
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
            "data_matrix"
          ]
        });
      } catch {
        detectorRef.current = new BarcodeDetectorAPI();
      }
      setScanning(true);
      scanTimerRef.current = setInterval(() => {
        void (async () => {
          if (!videoRef.current || videoRef.current.readyState < 2 || !detectorRef.current)
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
                var _a, _b, _c, _d;
                (_b = (_a = qtyInputRefRef.current) == null ? void 0 : _a.current) == null ? void 0 : _b.focus();
                (_d = (_c = qtyInputRefRef.current) == null ? void 0 : _c.current) == null ? void 0 : _d.select();
              }, 150);
            } else {
              setNotFound(true);
              lastResultRef.current = "";
              setTimeout(() => setNotFound(false), 2500);
            }
          } catch {
          }
        })();
      }, SCAN_INTERVAL_MS);
    },
    [stopCamera]
  );
  const handleToggle = reactExports.useCallback(() => {
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
  const languageRef = reactExports.useRef(language);
  languageRef.current = language;
  reactExports.useEffect(() => {
    if (isOpen) {
      void startCamera(languageRef.current);
    }
  }, [isOpen, startCamera]);
  reactExports.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);
  const labelToggle = language === "hi" ? "बारकोड/QR स्कैन करें" : "Scan Barcode/QR";
  const labelScanning = language === "hi" ? "स्कैन हो रहा है..." : "Scanning...";
  const labelPoint = language === "hi" ? "कैमरे पर बारकोड रखें..." : "Point barcode or QR code at camera...";
  const labelNotFound = language === "hi" ? "उत्पाद नहीं मिला — फिर कोशिश करें" : "Product not found — try again";
  const labelRetry = language === "hi" ? "फिर कोशिश करें" : "Try Again";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex flex-col gap-2 ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: handleToggle,
        disabled,
        "aria-label": isOpen ? t("Stop") : labelToggle,
        "aria-pressed": isOpen,
        "data-ocid": "billing.scanner_toggle.button",
        title: labelToggle,
        className: [
          "inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          isOpen ? "border-primary bg-primary/10 text-primary shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_15%,transparent)]" : "border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-primary/60 hover:bg-primary/5 active:scale-95",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        ].join(" "),
        children: isOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ScanBarcode, { size: 16 })
      }
    ),
    isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "billing.scanner_panel",
        className: "rounded-xl border border-border bg-card shadow-md overflow-hidden",
        style: { width: "min(320px, 88vw)" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-3 py-2 border-b border-border bg-muted/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ScanBarcode, { size: 14, className: "text-primary shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-foreground truncate", children: labelToggle }),
              scanning && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-[10px] text-primary font-medium shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-primary animate-pulse" }),
                labelScanning
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: handleToggle,
                "aria-label": "Close scanner",
                className: "text-muted-foreground hover:text-foreground transition-colors p-1 rounded ml-1 shrink-0",
                "data-ocid": "billing.scanner_close.button",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 })
              }
            )
          ] }),
          !cameraError ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "relative bg-black",
              style: { aspectRatio: "4/3", maxHeight: "240px" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "video",
                  {
                    ref: videoRef,
                    muted: true,
                    playsInline: true,
                    className: "w-full h-full object-cover",
                    "data-ocid": "billing.scanner_video"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-36 h-36", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br" }),
                  scanning && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "absolute left-2 right-2 h-px bg-primary/80",
                      style: {
                        animation: "qrScanLine 1.8s ease-in-out infinite"
                      }
                    }
                  )
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "absolute inset-0 pointer-events-none",
                    style: {
                      background: "radial-gradient(ellipse 72% 62% at 50% 50%, transparent 52%, rgba(0,0,0,0.5) 100%)"
                    }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 left-0 right-0 pb-2 px-2 text-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] leading-tight", children: notFound ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-300 font-semibold drop-shadow", children: labelNotFound }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/75 drop-shadow-sm", children: labelPoint }) }),
                  lastScanned && !notFound && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-white/40 mt-0.5 truncate", children: lastScanned })
                ] })
              ]
            }
          ) : (
            /* Error / unsupported state */
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 flex flex-col items-center gap-3 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-muted flex items-center justify-center", children: isSupported ? /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20, className: "text-destructive" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ScanBarcode, { size: 20, className: "text-muted-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: cameraError }),
              isSupported && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  className: "h-7 text-xs",
                  "data-ocid": "billing.scanner_retry.button",
                  onClick: () => {
                    setCameraError(null);
                    void startCamera(language);
                  },
                  children: labelRetry
                }
              )
            ] })
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @keyframes qrScanLine {
          0%   { top: 8px;  opacity: 0.2; }
          30%  { opacity: 1; }
          70%  { opacity: 1; }
          100% { top: calc(100% - 8px); opacity: 0.2; }
        }
      ` })
  ] });
}
function fmt(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Math.round(n));
}
const AUTO_DRAFT_KEY = "billing_auto_draft";
const RESUME_DRAFT_KEY = "billing_resume_draft";
function getMinPrice(costPrice, minProfitPct) {
  return costPrice + costPrice * minProfitPct / 100;
}
function getDiscountPct(basePrice, sellingRate) {
  if (sellingRate >= basePrice) return 0;
  return (basePrice - sellingRate) / basePrice * 100;
}
function calcExtraProfit(basePrice, sellingRate, qty) {
  if (sellingRate <= basePrice) return 0;
  return (sellingRate - basePrice) * qty;
}
function calcStaffBonus(extraProfit) {
  return extraProfit * 0.5;
}
function getPriceForMode(product, mode) {
  if (mode === "retailer" && product.retailerPrice && product.retailerPrice > 0)
    return product.retailerPrice;
  if (mode === "wholesaler" && product.wholesalerPrice && product.wholesalerPrice > 0)
    return product.wholesalerPrice;
  return product.sellingPrice;
}
function LowPriceAlertModal({
  items,
  isLockMode,
  ownerPin,
  userRole,
  onContinue,
  onCancel
}) {
  const [pinInput, setPinInput] = reactExports.useState("");
  const [pinAttempts, setPinAttempts] = reactExports.useState(0);
  const [pinError, setPinError] = reactExports.useState("");
  const MAX_ATTEMPTS = 3;
  const isOwner = userRole === "owner";
  function handlePinSubmit() {
    if (pinInput === ownerPin) {
      onContinue(true, true);
    } else {
      const next = pinAttempts + 1;
      setPinAttempts(next);
      if (next >= MAX_ATTEMPTS) {
        setPinError(`${MAX_ATTEMPTS} incorrect PIN attempts — sale blocked`);
        setTimeout(() => onCancel(), 1500);
      } else {
        setPinError(
          `Incorrect PIN — ${MAX_ATTEMPTS - next} attempts remaining`
        );
        setPinInput("");
      }
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: onCancel, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      "data-ocid": "billing.low_price_alert.dialog",
      className: "max-w-md max-h-[90vh] overflow-y-auto",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2 text-red-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { size: 18, className: "text-red-600" }),
          "⚠️ Low Price Alert"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "The following items are being sold below the minimum profit price:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "rounded-lg border border-red-300 bg-red-50 p-3 text-sm",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-red-800 mb-2", children: item.productName }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 text-xs", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Cost" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0
                    }).format(Math.round(item.costPrice)) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Min Price" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-amber-700", children: new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0
                    }).format(Math.round(item.minSellPrice)) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Entered" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-red-600", children: new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0
                    }).format(Math.round(item.enteredPrice)) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-xs text-red-700 font-medium", children: [
                  "Loss per unit:",
                  " ",
                  new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0
                  }).format(
                    Math.round(
                      Math.max(0, item.minSellPrice - item.enteredPrice)
                    )
                  )
                ] })
              ]
            },
            item.productId
          )) }),
          !isLockMode ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-300", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                TriangleAlert,
                {
                  size: 16,
                  className: "text-amber-600 mt-0.5 flex-shrink-0"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Warning Mode:" }),
                " Sale is allowed but you are selling below the minimum profit price. Do you want to continue?"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  "data-ocid": "billing.low_price_alert.cancel.button",
                  variant: "outline",
                  className: "flex-1",
                  onClick: onCancel,
                  children: "Cancel"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  "data-ocid": "billing.low_price_alert.continue.button",
                  className: "flex-1 bg-amber-500 hover:bg-amber-600 text-white",
                  onClick: () => onContinue(false, false),
                  children: "Continue Sale"
                }
              )
            ] })
          ] }) : isOwner ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-300", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 16, className: "text-red-600 mt-0.5 flex-shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-red-700", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Lock Mode:" }),
                " Sale is blocked. Enter Owner PIN to override."
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm font-medium flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 14 }),
                " Owner Override PIN"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    "data-ocid": "billing.low_price_alert.pin.input",
                    type: "password",
                    placeholder: "Enter PIN (4-6 digits)",
                    value: pinInput,
                    onChange: (e) => {
                      setPinInput(e.target.value);
                      setPinError("");
                    },
                    maxLength: 6,
                    className: `flex-1 ${pinError ? "border-red-500" : ""}`,
                    disabled: pinAttempts >= MAX_ATTEMPTS,
                    onKeyDown: (e) => {
                      if (e.key === "Enter") handlePinSubmit();
                    }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    "data-ocid": "billing.low_price_alert.pin_submit.button",
                    variant: "outline",
                    onClick: handlePinSubmit,
                    disabled: !pinInput || pinAttempts >= MAX_ATTEMPTS,
                    children: "Override"
                  }
                )
              ] }),
              pinError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 font-medium", children: pinError }),
              !ownerPin && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "💡 Please set an Owner PIN in Settings first" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                "data-ocid": "billing.low_price_alert.lock_cancel.button",
                variant: "outline",
                className: "w-full",
                onClick: onCancel,
                children: "Cancel Sale"
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-300", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ShieldAlert,
                {
                  size: 16,
                  className: "text-red-600 mt-0.5 flex-shrink-0"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-red-800", children: "Access Denied — Owner Approval Required" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-700", children: "Only the Owner can approve low price sales. Please ask your Owner to enter their PIN or log in." })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                "data-ocid": "billing.low_price_alert.non_owner_cancel.button",
                variant: "outline",
                className: "w-full",
                onClick: onCancel,
                children: "Cancel Sale"
              }
            )
          ] })
        ] })
      ]
    }
  ) });
}
function NewSaleConfirmDialog({
  open,
  onConfirm,
  onCancel
}) {
  if (!open) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: onCancel, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { size: 18 }),
      " Start New Sale?"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Start a new sale? Your current items will be saved as a draft." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "flex-1", onClick: onCancel, children: "Go Back" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          "data-ocid": "billing.new_sale_confirm.button",
          className: "flex-1",
          onClick: onConfirm,
          children: "Save & Start New"
        }
      )
    ] })
  ] }) });
}
const PENDING_CASH_KEY = "pending_cash_invoice";
function BillingPage({
  onNavigate
}) {
  var _a;
  const {
    products,
    getProductStock,
    calculateFIFOCost,
    createInvoice,
    getProductBatches,
    getProductCostPrice,
    appConfig,
    autoMode,
    addLowPriceAlertLog,
    addAuditLog,
    saveDraft,
    deleteDraft,
    markDraftCompleted,
    customers,
    updateCustomer,
    addCustomer
  } = useStore();
  const { currentUser } = useAuth();
  const { t, language } = useLanguage();
  const userRole = (currentUser == null ? void 0 : currentUser.role) ?? "staff";
  const canViewCost = ROLE_PERMISSIONS.canViewCostPrice(userRole);
  const isProMode = autoMode === "pro";
  const customerTrackingEnabled = isProMode && (((_a = appConfig.featureFlags) == null ? void 0 : _a.customerTracking) ?? false);
  const [editingDraftId, setEditingDraftId] = reactExports.useState(null);
  const [autoDraftActive, setAutoDraftActive] = reactExports.useState(false);
  const [lastSavedAt, setLastSavedAt] = reactExports.useState(null);
  const lastSavedAtRef = reactExports.useRef(null);
  const qtyInputRef = reactExports.useRef(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = reactExports.useState(false);
  const [customerName, setCustomerName] = reactExports.useState("");
  const [customerMobile, setCustomerMobile] = reactExports.useState("");
  const [customerAddress, setCustomerAddress] = reactExports.useState("");
  const [customerType, setCustomerType] = reactExports.useState("regular");
  const [cart, setCart] = reactExports.useState([]);
  const [qtyInputs, setQtyInputs] = reactExports.useState({});
  const [itemErrors, setItemErrors] = reactExports.useState({});
  const [paymentMode, setPaymentMode] = reactExports.useState("cash");
  const [paidAmountStr, setPaidAmountStr] = reactExports.useState("");
  const [isPartial, setIsPartial] = reactExports.useState(false);
  const [selectedProductId, setSelectedProductId] = reactExports.useState("");
  const [addQty, setAddQty] = reactExports.useState("1");
  const [manualBatchMode, setManualBatchMode] = reactExports.useState(false);
  const [selectedBatchId, setSelectedBatchId] = reactExports.useState("");
  const [generatedInvoice, setGeneratedInvoice] = reactExports.useState(
    null
  );
  const [showInvoice, setShowInvoice] = reactExports.useState(false);
  const [showNewSaleConfirm, setShowNewSaleConfirm] = reactExports.useState(false);
  const [chargesEnabled, setChargesEnabled] = reactExports.useState(false);
  const [transportEnabled, setTransportEnabled] = reactExports.useState(false);
  const [transportAmt, setTransportAmt] = reactExports.useState("");
  const [labourEnabled, setLabourEnabled] = reactExports.useState(false);
  const [labourAmt, setLabourAmt] = reactExports.useState("");
  const [otherEnabled, setOtherEnabled] = reactExports.useState(false);
  const [otherAmt, setOtherAmt] = reactExports.useState("");
  const [linkedCustomerId, setLinkedCustomerId] = reactExports.useState(null);
  const [mobileSuggestions, setMobileSuggestions] = reactExports.useState([]);
  const [showSuggestions, setShowSuggestions] = reactExports.useState(false);
  const suggestionsRef = reactExports.useRef(null);
  const [showLowPriceModal, setShowLowPriceModal] = reactExports.useState(false);
  const [pendingLowPriceItems, setPendingLowPriceItems] = reactExports.useState([]);
  const [pendingInvoiceData, setPendingInvoiceData] = reactExports.useState(null);
  const [pendingInvoiceItems, setPendingInvoiceItems] = reactExports.useState(
    []
  );
  reactExports.useEffect(() => {
    try {
      const resumeRaw = sessionStorage.getItem(RESUME_DRAFT_KEY);
      if (resumeRaw) {
        const draft = JSON.parse(resumeRaw);
        sessionStorage.removeItem(RESUME_DRAFT_KEY);
        restoreFromDraft(draft);
        setEditingDraftId(draft.draftId);
        ue.info(`Editing draft for "${draft.customerName || "Walk-in"}"`, {
          description: `${draft.cartItems.length} item(s) loaded`
        });
        return;
      }
      const autoRaw = sessionStorage.getItem(AUTO_DRAFT_KEY);
      if (autoRaw) {
        const auto = JSON.parse(autoRaw);
        if (auto.cartItems && auto.cartItems.length > 0) {
          setCustomerName(auto.customerName);
          setCustomerMobile(auto.customerMobile);
          if (auto.customerAddress) setCustomerAddress(auto.customerAddress);
          setCart(auto.cartItems);
          const inputs = {};
          for (const item of auto.cartItems) {
            inputs[item.selectedBatchId ?? item.productId] = String(
              item.quantity
            );
          }
          setQtyInputs(inputs);
          if (auto.chargesEnabled) {
            setChargesEnabled(true);
            setTransportEnabled(!!auto.transportEnabled);
            setTransportAmt(auto.transportAmt ? String(auto.transportAmt) : "");
            setLabourEnabled(!!auto.labourEnabled);
            setLabourAmt(auto.labourAmt ? String(auto.labourAmt) : "");
            setOtherEnabled(!!auto.otherEnabled);
            setOtherAmt(auto.otherAmt ? String(auto.otherAmt) : "");
          }
          setAutoDraftActive(true);
          ue.info("Previous sale restored — continue or discard", {
            description: `${auto.cartItems.length} item(s) from ${new Date(auto.savedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
          });
        }
      }
    } catch {
    }
  }, []);
  reactExports.useEffect(() => {
    if (cart.length === 0 && !customerName && !customerMobile) return;
    const interval = setInterval(() => {
      if (cart.length === 0) return;
      try {
        const autoDraft = {
          customerName,
          customerMobile,
          customerAddress: customerAddress || void 0,
          cartItems: cart,
          savedAt: (/* @__PURE__ */ new Date()).toISOString(),
          chargesEnabled,
          transportEnabled,
          transportAmt: Number(transportAmt) || 0,
          labourEnabled,
          labourAmt: Number(labourAmt) || 0,
          otherEnabled,
          otherAmt: Number(otherAmt) || 0
        };
        sessionStorage.setItem(AUTO_DRAFT_KEY, JSON.stringify(autoDraft));
        const now = /* @__PURE__ */ new Date();
        lastSavedAtRef.current = now;
        setLastSavedAt(now);
        ue.info("Draft auto-saved", { duration: 1500 });
      } catch {
      }
    }, 3e4);
    return () => clearInterval(interval);
  }, [
    cart,
    customerName,
    customerMobile,
    customerAddress,
    chargesEnabled,
    transportEnabled,
    transportAmt,
    labourEnabled,
    labourAmt,
    otherEnabled,
    otherAmt
  ]);
  function restoreFromDraft(draft) {
    setCustomerName(draft.customerName);
    setCustomerMobile(draft.customerMobile);
    const cartItems = draft.cartItems.map((ci) => ({
      productId: ci.productId,
      productName: ci.productName,
      quantity: ci.quantity,
      sellingRate: ci.sellingRate,
      unit: ci.unit,
      selectedBatchId: ci.batchId,
      basePrice: ci.sellingRate
    }));
    setCart(cartItems);
    const inputs = {};
    for (const item of cartItems) {
      inputs[item.selectedBatchId ?? item.productId] = String(item.quantity);
    }
    setQtyInputs(inputs);
  }
  function saveAutoDraft() {
    if (cart.length === 0) return;
    try {
      const autoDraft = {
        customerName,
        customerMobile,
        customerAddress: customerAddress || void 0,
        cartItems: cart,
        savedAt: (/* @__PURE__ */ new Date()).toISOString(),
        chargesEnabled,
        transportEnabled,
        transportAmt: Number(transportAmt) || 0,
        labourEnabled,
        labourAmt: Number(labourAmt) || 0,
        otherEnabled,
        otherAmt: Number(otherAmt) || 0
      };
      sessionStorage.setItem(AUTO_DRAFT_KEY, JSON.stringify(autoDraft));
    } catch {
    }
  }
  function buildDraftSale(draftId) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const cartDraftItems = cart.map((item) => {
      const costP = getProductCostPrice(item.productId);
      const profit = (item.sellingRate - costP) * item.quantity;
      const profitPercent = costP > 0 ? (item.sellingRate - costP) / costP * 100 : 0;
      return {
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        sellingRate: item.sellingRate,
        purchaseCost: costP,
        unit: item.unit,
        batchId: item.selectedBatchId,
        batchNumber: item.selectedBatchId ? `B${String(
          getProductBatches(item.productId).findIndex(
            (b) => b.id === item.selectedBatchId
          ) + 1
        ).padStart(3, "0")}` : void 0,
        profit,
        profitPercent
      };
    });
    return {
      draftId,
      customerName,
      customerMobile,
      cartItems: cartDraftItems,
      createdAt: now,
      updatedAt: now,
      totalAmount: total,
      status: "draft"
    };
  }
  function handleSaveDraft() {
    if (cart.length === 0 && !customerName.trim()) {
      ue.error("Add items or a customer name before saving a draft");
      return;
    }
    const draftId = editingDraftId ?? `draft_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const draft = buildDraftSale(draftId);
    saveDraft(draft);
    if (!editingDraftId) setEditingDraftId(draftId);
    sessionStorage.removeItem(AUTO_DRAFT_KEY);
    setAutoDraftActive(false);
    ue.success("Draft saved ✓", {
      description: `${cart.length} item(s) — ${customerName.trim() || "Walk-in"}`
    });
  }
  function handleDiscard() {
    if (editingDraftId) {
      deleteDraft(editingDraftId);
      sessionStorage.removeItem(RESUME_DRAFT_KEY);
      ue.info("Draft discarded");
    } else {
      sessionStorage.removeItem(AUTO_DRAFT_KEY);
      ue.info("Sale discarded");
    }
    clearForm();
  }
  function clearForm() {
    setCustomerName("");
    setCustomerMobile("");
    setCustomerAddress("");
    setCustomerType("regular");
    setCart([]);
    setQtyInputs({});
    setItemErrors({});
    setPaidAmountStr("");
    setIsPartial(false);
    setPaymentMode("cash");
    setManualBatchMode(false);
    setSelectedBatchId("");
    setSelectedProductId("");
    setAddQty("1");
    setEditingDraftId(null);
    setAutoDraftActive(false);
    setChargesEnabled(false);
    setTransportEnabled(false);
    setTransportAmt("");
    setLabourEnabled(false);
    setLabourAmt("");
    setOtherEnabled(false);
    setOtherAmt("");
    setLinkedCustomerId(null);
    setMobileSuggestions([]);
    setShowSuggestions(false);
  }
  function handleMobileInputChange(value) {
    setCustomerMobile(value);
    setLinkedCustomerId(null);
    if (!customerTrackingEnabled) return;
    const trimmed = value.trim().replace(/\D/g, "");
    if (trimmed.length >= 3) {
      const matches = customers.filter((c) => c.mobile.replace(/\D/g, "").includes(trimmed)).slice(0, 5);
      setMobileSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setMobileSuggestions([]);
      setShowSuggestions(false);
    }
  }
  function handleSelectCustomerSuggestion(customer) {
    setCustomerMobile(customer.mobile);
    setCustomerName(customer.name || customerName);
    if (customer.address) setCustomerAddress(customer.address);
    setLinkedCustomerId(customer.id);
    setMobileSuggestions([]);
    setShowSuggestions(false);
  }
  function updateCustomerAfterSale(mobile, name, address, saleAmount, dueAmount) {
    if (!customerTrackingEnabled || !mobile.trim()) return;
    const normMob = mobile.trim().replace(/\D/g, "");
    const existing = customers.find(
      (c) => c.mobile.replace(/\D/g, "") === normMob
    );
    if (existing) {
      updateCustomer(existing.id, {
        lastVisit: (/* @__PURE__ */ new Date()).toISOString(),
        totalPurchase: (existing.totalPurchase ?? 0) + saleAmount,
        visitCount: (existing.visitCount ?? 0) + 1,
        pendingBalance: (existing.pendingBalance ?? 0) + dueAmount,
        creditBalance: (existing.creditBalance ?? 0) + dueAmount,
        ...name.trim() && !existing.name ? { name: name.trim() } : {},
        ...(address == null ? void 0 : address.trim()) && !existing.address ? { address: address.trim() } : {}
      });
    } else {
      addCustomer({
        name: name.trim() || "",
        mobile: mobile.trim(),
        address: (address == null ? void 0 : address.trim()) || void 0,
        creditBalance: dueAmount,
        lastVisit: (/* @__PURE__ */ new Date()).toISOString(),
        totalPurchase: saleAmount,
        visitCount: 1,
        pendingBalance: dueAmount
      });
    }
  }
  function handleNewSale() {
    if (cart.length > 0) {
      setShowNewSaleConfirm(true);
    } else {
      clearForm();
    }
  }
  function handleNewSaleConfirm() {
    setShowNewSaleConfirm(false);
    const draftId = editingDraftId ?? `draft_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const draft = buildDraftSale(draftId);
    saveDraft(draft);
    sessionStorage.removeItem(AUTO_DRAFT_KEY);
    ue.success("Current items saved as draft");
    clearForm();
  }
  const handleBillingVoiceParsed = (parsed) => {
    let applied = false;
    if (parsed.customerName !== null) {
      setCustomerName(parsed.customerName);
      applied = true;
    }
    if (parsed.itemName !== null) {
      const match = products.find(
        (p) => p.name.trim().toLowerCase() === parsed.itemName.trim().toLowerCase()
      );
      if (match) {
        setSelectedProductId(match.id);
        setSelectedBatchId("");
        applied = true;
      }
    }
    if (parsed.quantity !== null) {
      setAddQty(String(parsed.quantity));
      applied = true;
    }
    if (applied) {
      ue.success(t("Voice input applied — please review and save"));
    }
  };
  const handleProductScanned = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setSelectedProductId(productId);
    setSelectedBatchId("");
    setAddQty("1");
    ue.success(
      language === "hi" ? `${product.name} स्कैन हुआ — मात्रा डालें` : `${product.name} scanned — enter quantity`
    );
  };
  const itemsSubtotal = cart.reduce(
    (s, item) => s + item.quantity * item.sellingRate,
    0
  );
  const activeTransport = chargesEnabled && transportEnabled ? Number(transportAmt) || 0 : 0;
  const activeLabour = chargesEnabled && labourEnabled ? Number(labourAmt) || 0 : 0;
  const activeOther = chargesEnabled && otherEnabled ? Number(otherAmt) || 0 : 0;
  const totalCharges = activeTransport + activeLabour + activeOther;
  const total = itemsSubtotal + totalCharges;
  const computedPaid = (() => {
    if (paymentMode === "credit") return 0;
    if (paymentMode === "cash" || paymentMode === "upi" || paymentMode === "online") {
      if (isPartial && paidAmountStr !== "") {
        return Math.min(Number(paidAmountStr) || 0, total);
      }
      return total;
    }
    return total;
  })();
  const computedDue = total - computedPaid;
  const overSellItems = cart.map((item) => {
    var _a2;
    const available = item.selectedBatchId ? ((_a2 = getProductBatches(item.productId).find(
      (b) => b.id === item.selectedBatchId
    )) == null ? void 0 : _a2.quantity) ?? 0 : getProductStock(item.productId);
    if (item.quantity > available) {
      return {
        productId: item.productId,
        productName: item.productName,
        availableStock: available,
        enteredQty: item.quantity,
        overSellQty: item.quantity - available,
        unit: item.unit
      };
    }
    return null;
  }).filter(Boolean);
  const hasOverSell = overSellItems.length > 0;
  const handlePaymentModeChange = (mode) => {
    setPaymentMode(mode);
    setIsPartial(false);
    setPaidAmountStr("");
  };
  const handleAddToCart = () => {
    if (!selectedProductId || !addQty) return;
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;
    let qty = Number(addQty);
    if (qty <= 0) {
      ue.error("Quantity must be positive");
      return;
    }
    let resolvedBatchId;
    if (manualBatchMode && selectedBatchId) {
      const batch = getProductBatches(selectedProductId).find(
        (b) => b.id === selectedBatchId
      );
      if (!batch) {
        ue.error("Selected batch not found");
        return;
      }
      if (qty > batch.quantity) {
        ue.warning(
          `⚠️ Qty ${qty} exceeds batch stock (${batch.quantity} ${product.unit}). Capping to batch qty.`
        );
        qty = batch.quantity;
      }
      resolvedBatchId = selectedBatchId;
    } else {
      const available = getProductStock(selectedProductId);
      if (qty > available) {
        ue.warning(
          `⚠️ Over Sell: Only ${available} ${product.unit} available in stock`
        );
      }
    }
    const existing = cart.find(
      (i) => i.productId === selectedProductId && i.selectedBatchId === resolvedBatchId
    );
    if (existing && !manualBatchMode) {
      const newQty = existing.quantity + qty;
      setCart(
        (prev) => prev.map(
          (i) => i.productId === selectedProductId && !i.selectedBatchId ? { ...i, quantity: newQty } : i
        )
      );
      setQtyInputs((prev) => ({
        ...prev,
        [selectedProductId]: String(newQty)
      }));
    } else {
      const cartKey = resolvedBatchId ?? selectedProductId;
      const initialMode = customerType === "retailer" && product.retailerPrice && product.retailerPrice > 0 ? "retailer" : customerType === "wholesaler" && product.wholesalerPrice && product.wholesalerPrice > 0 ? "wholesaler" : "standard";
      const initialRate = getPriceForMode(product, initialMode);
      let itemCostPrice;
      if (manualBatchMode && selectedBatchId) {
        const batch = getProductBatches(selectedProductId).find(
          (b) => b.id === selectedBatchId
        );
        itemCostPrice = batch ? batch.finalPurchaseCost != null && batch.quantity > 0 ? batch.finalPurchaseCost / batch.quantity : batch.purchaseRate : getProductCostPrice(selectedProductId);
      } else {
        itemCostPrice = getProductCostPrice(selectedProductId);
      }
      setCart((prev) => [
        ...prev,
        {
          productId: selectedProductId,
          productName: product.name,
          quantity: qty,
          sellingRate: initialRate,
          unit: product.unit,
          basePrice: product.sellingPrice,
          costPrice: itemCostPrice,
          priceMode: initialMode,
          ...resolvedBatchId ? { selectedBatchId: resolvedBatchId } : {}
        }
      ]);
      setQtyInputs((prev) => ({ ...prev, [cartKey]: String(qty) }));
    }
    setSelectedProductId("");
    setAddQty("1");
    setSelectedBatchId("");
  };
  const handleRemoveItem = (productId, batchId) => {
    setCart(
      (prev) => prev.filter(
        (i) => !(i.productId === productId && (i.selectedBatchId ?? "") === (batchId ?? ""))
      )
    );
    const cartKey = batchId ?? productId;
    setQtyInputs((prev) => {
      const next = { ...prev };
      delete next[cartKey];
      return next;
    });
  };
  const handleQtyInputChange = (productId, raw, batchId) => {
    const cartKey = batchId ?? productId;
    setQtyInputs((prev) => ({ ...prev, [cartKey]: raw }));
    if (raw === "") return;
    const num = Number(raw);
    if (Number.isNaN(num)) return;
    if (num >= 0) {
      setCart(
        (prev) => prev.map(
          (i) => i.productId === productId && (i.selectedBatchId ?? "") === (batchId ?? "") ? { ...i, quantity: num } : i
        )
      );
    }
  };
  const handleQtyDecrement = (productId, batchId) => {
    const item = cart.find(
      (i) => i.productId === productId && (i.selectedBatchId ?? "") === (batchId ?? "")
    );
    if (!item) return;
    const newQty = Math.max(0, item.quantity - 1);
    const cartKey = batchId ?? productId;
    setCart(
      (prev) => prev.map(
        (i) => i.productId === productId && (i.selectedBatchId ?? "") === (batchId ?? "") ? { ...i, quantity: newQty } : i
      )
    );
    setQtyInputs((prev) => ({ ...prev, [cartKey]: String(newQty) }));
  };
  const handleQtyIncrement = (productId, batchId) => {
    const item = cart.find(
      (i) => i.productId === productId && (i.selectedBatchId ?? "") === (batchId ?? "")
    );
    if (!item) return;
    const newQty = item.quantity + 1;
    const cartKey = batchId ?? productId;
    if (batchId) {
      const batch = getProductBatches(productId).find((b) => b.id === batchId);
      if (batch && newQty > batch.quantity) {
        ue.warning(`⚠️ Batch stock is only ${batch.quantity} ${item.unit}`);
      }
    } else {
      const available = getProductStock(productId);
      if (newQty > available) {
        ue.warning(`⚠️ Over Sell: Only ${available} ${item.unit} available`);
      }
    }
    setCart(
      (prev) => prev.map(
        (i) => i.productId === productId && (i.selectedBatchId ?? "") === (batchId ?? "") ? { ...i, quantity: newQty } : i
      )
    );
    setQtyInputs((prev) => ({ ...prev, [cartKey]: String(newQty) }));
  };
  const handleItemPriceModeChange = (productId, batchId, mode) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const newRate = getPriceForMode(product, mode);
    setCart(
      (prev) => prev.map(
        (i) => i.productId === productId && (i.selectedBatchId ?? "") === (batchId ?? "") ? { ...i, priceMode: mode, sellingRate: newRate } : i
      )
    );
    setItemErrors((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };
  const applyCustomerTypeToCart = (type) => {
    setCart(
      (prev) => prev.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return item;
        const mode = type === "retailer" && product.retailerPrice && product.retailerPrice > 0 ? "retailer" : type === "wholesaler" && product.wholesalerPrice && product.wholesalerPrice > 0 ? "wholesaler" : "standard";
        return {
          ...item,
          priceMode: mode,
          sellingRate: getPriceForMode(product, mode)
        };
      })
    );
  };
  const handleRateChange = (productId, rate) => {
    setCart(
      (prev) => prev.map(
        (i) => i.productId === productId ? { ...i, sellingRate: rate } : i
      )
    );
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const costPrice = getProductCostPrice(productId);
    const basePrice = product.sellingPrice;
    const minProfitPct = product.minProfitPct ?? 0;
    const minPrice = getMinPrice(costPrice, minProfitPct);
    const discountPct = getDiscountPct(basePrice, rate);
    let error = "";
    if (!rate || rate <= 0 || Number.isNaN(rate)) {
      error = "Invalid price — 0 or negative price is not allowed";
    } else if (costPrice > 0 && rate < minPrice) {
      error = `Minimum price ₹${minPrice.toFixed(0)} cannot be lower (Cost + Min Profit)`;
    } else if (userRole !== "owner" && userRole !== "manager" && rate < basePrice && discountPct > 18) {
      error = `Staff can apply a maximum 18% discount (Min rate: ₹${(basePrice * 0.82).toFixed(0)})`;
    } else if ((userRole === "owner" || userRole === "manager") && rate < basePrice && discountPct > 20) {
      error = `Owner/Manager can apply a maximum 20% discount (Min rate: ₹${(basePrice * 0.8).toFixed(0)})`;
    }
    setItemErrors((prev) => {
      const next = { ...prev };
      if (error) {
        next[productId] = error;
      } else {
        delete next[productId];
      }
      return next;
    });
  };
  const handleGenerateInvoice = () => {
    var _a2;
    if (cart.length === 0) {
      ue.error("Add items to cart first");
      return;
    }
    if (Object.keys(itemErrors).length > 0) {
      ue.error("Please fix pricing errors first");
      return;
    }
    if (cart.some((i) => i.quantity === 0)) {
      ue.error("Some items have 0 quantity — please fix or remove them");
      return;
    }
    if (paymentMode === "credit" && !customerName.trim()) {
      ue.error("Customer Name is required for credit sales");
      return;
    }
    if (paymentMode === "credit" && !customerMobile.trim()) {
      ue.error("⚠️ Mobile Number is required for credit sales");
      return;
    }
    if (computedDue > 0 && !customerMobile.trim() && !isWalkIn(customerName.trim())) {
      ue.error("⚠️ Mobile Number is required for sales with pending dues");
      return;
    }
    const invoiceItems = cart.map((item) => {
      const available = getProductStock(item.productId);
      const fifo = calculateFIFOCost(item.productId, item.quantity);
      const isOverSell = item.quantity > available;
      const product = products.find((p) => p.id === item.productId);
      const purchaseCostPerUnit = fifo.success ? fifo.totalCost / item.quantity : 0;
      const costPrice = (product == null ? void 0 : product.costPrice) ?? (product == null ? void 0 : product.purchasePrice) ?? purchaseCostPerUnit;
      const profitPerUnit = item.sellingRate - costPrice;
      const totalProfit = profitPerUnit * item.quantity;
      return {
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        sellingRate: item.sellingRate,
        purchaseCost: purchaseCostPerUnit,
        profitPerUnit,
        totalProfit,
        isOverSell,
        availableStockAtSale: available,
        priceModeUsed: item.priceMode ?? "standard",
        ...item.selectedBatchId ? { selectedBatchId: item.selectedBatchId } : {}
      };
    });
    const lowPriceItems = cart.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      const costPrice = getProductCostPrice(item.productId);
      const minProfitPct = (product == null ? void 0 : product.minProfitPct) ?? 0;
      if (costPrice <= 0 || minProfitPct <= 0) return null;
      const minSellPrice = getMinPrice(costPrice, minProfitPct);
      if (item.sellingRate < minSellPrice) {
        return {
          productId: item.productId,
          productName: item.productName,
          enteredPrice: item.sellingRate,
          minSellPrice,
          costPrice
        };
      }
      return null;
    }).filter(Boolean);
    const invoiceTotalProfit = invoiceItems.reduce(
      (s, item) => s + (item.totalProfit ?? 0),
      0
    );
    const totalExtraProfit = invoiceItems.reduce(
      (s, item) => s + (item.extraProfit ?? 0),
      0
    );
    const totalStaffBonus = invoiceItems.reduce(
      (s, item) => s + (item.staffBonus ?? 0),
      0
    );
    const invoiceData = {
      customerId: null,
      customerName: customerName.trim() || "Walk-in Customer",
      customerMobile: customerMobile.trim(),
      customerAddress: customerAddress.trim() || void 0,
      items: invoiceItems,
      totalAmount: total,
      paidAmount: computedPaid,
      dueAmount: computedDue,
      paymentMode,
      date: (/* @__PURE__ */ new Date()).toISOString(),
      invoiceTotalProfit,
      totalExtraProfit: totalExtraProfit > 0 ? totalExtraProfit : void 0,
      totalStaffBonus: totalStaffBonus > 0 ? totalStaffBonus : void 0,
      soldByUserId: (currentUser == null ? void 0 : currentUser.id) ?? (typeof localStorage !== "undefined" ? ((_a2 = JSON.parse(
        localStorage.getItem("mobile_auth_session") ?? "null"
      )) == null ? void 0 : _a2.shopId) ?? "owner" : "owner"),
      soldByName: (currentUser == null ? void 0 : currentUser.name) ?? "Owner",
      ...activeTransport > 0 ? { transportCharge: activeTransport } : {},
      ...activeLabour > 0 ? { labourCharge: activeLabour } : {},
      ...activeOther > 0 ? { otherCharges: activeOther } : {}
    };
    if (lowPriceItems.length > 0) {
      setPendingLowPriceItems(lowPriceItems);
      setPendingInvoiceData(invoiceData);
      setPendingInvoiceItems(invoiceItems);
      setShowLowPriceModal(true);
      return;
    }
    if (paymentMode === "cash" && onNavigate) {
      saveAutoDraft();
      try {
        sessionStorage.setItem(
          PENDING_CASH_KEY,
          JSON.stringify({ invoiceData, invoiceItems, billTotal: total })
        );
      } catch (_) {
      }
      onNavigate("cash-counter");
      return;
    }
    doCreateInvoice(invoiceData, invoiceItems, false, false, []);
  };
  function doCreateInvoice(invoiceData, _invoiceItems, wasBlocked, pinUsed, lowItems) {
    for (const item of lowItems) {
      const attemptType = wasBlocked ? "blocked" : pinUsed ? "overridden" : "warned";
      addLowPriceAlertLog({
        shopId: "",
        productId: item.productId,
        productName: item.productName,
        staffName: (currentUser == null ? void 0 : currentUser.name) ?? "Unknown",
        enteredPrice: item.enteredPrice,
        minSellPrice: item.minSellPrice,
        costPrice: item.costPrice,
        attemptType,
        pinUsed,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      addAuditLog(
        "low_price_attempt",
        `${item.productName} — entered ₹${item.enteredPrice}, min ₹${item.minSellPrice.toFixed(0)}, status: ${attemptType}`,
        item.productId
      );
    }
    if (pinUsed && lowItems.length > 0) {
      addAuditLog(
        "low_price_override",
        `Owner PIN override — ${lowItems.map((i) => i.productName).join(", ")}`
      );
    }
    if (wasBlocked) return;
    const { invoice, mergedExisting } = createInvoice(invoiceData);
    addAuditLog(
      "sale_created",
      `Invoice ${invoice.invoiceNumber} — ₹${invoice.totalAmount} — ${invoice.paymentMode} — Customer: ${invoice.customerName}`,
      invoice.id
    );
    if (mergedExisting) {
      ue.warning("⚠️ Same mobile detected — merging customer data");
    }
    if (editingDraftId) {
      markDraftCompleted(editingDraftId);
    }
    sessionStorage.removeItem(AUTO_DRAFT_KEY);
    sessionStorage.removeItem(RESUME_DRAFT_KEY);
    updateCustomerAfterSale(
      invoiceData.customerMobile ?? "",
      invoiceData.customerName ?? "",
      invoiceData.customerAddress,
      invoice.totalAmount,
      invoice.dueAmount
    );
    setGeneratedInvoice(invoice);
    setShowInvoice(true);
    clearForm();
    ue.success(`Invoice ${invoice.invoiceNumber} generated!`);
  }
  function handleLowPriceModalContinue(overridden, pinUsed) {
    setShowLowPriceModal(false);
    if (!pendingInvoiceData) return;
    const isLockMode = !(appConfig.allowLowPriceSelling ?? true);
    const isBlocked = isLockMode && !overridden;
    if (isBlocked) {
      doCreateInvoice(
        pendingInvoiceData,
        pendingInvoiceItems,
        true,
        false,
        pendingLowPriceItems
      );
    } else {
      for (const item of pendingLowPriceItems) {
        const attemptType = pinUsed ? "overridden" : "warned";
        addLowPriceAlertLog({
          shopId: "",
          productId: item.productId,
          productName: item.productName,
          staffName: (currentUser == null ? void 0 : currentUser.name) ?? "Unknown",
          enteredPrice: item.enteredPrice,
          minSellPrice: item.minSellPrice,
          costPrice: item.costPrice,
          attemptType,
          pinUsed,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        addAuditLog(
          "low_price_attempt",
          `${item.productName} — entered ₹${item.enteredPrice}, min ₹${item.minSellPrice.toFixed(0)}, status: ${attemptType}`,
          item.productId
        );
      }
      if (pinUsed && pendingLowPriceItems.length > 0) {
        addAuditLog(
          "low_price_override",
          `Owner PIN override — ${pendingLowPriceItems.map((i) => i.productName).join(", ")}`
        );
      }
      if (pendingInvoiceData.paymentMode === "cash" && onNavigate) {
        saveAutoDraft();
        try {
          sessionStorage.setItem(
            PENDING_CASH_KEY,
            JSON.stringify({
              invoiceData: pendingInvoiceData,
              invoiceItems: pendingInvoiceItems,
              billTotal: pendingInvoiceData.totalAmount
            })
          );
        } catch (_) {
        }
        setPendingLowPriceItems([]);
        setPendingInvoiceData(null);
        setPendingInvoiceItems([]);
        onNavigate("cash-counter");
        return;
      }
      doCreateInvoice(
        pendingInvoiceData,
        pendingInvoiceItems,
        false,
        pinUsed,
        pendingLowPriceItems
      );
    }
    setPendingLowPriceItems([]);
    setPendingInvoiceData(null);
    setPendingInvoiceItems([]);
  }
  function handleLowPriceModalCancel() {
    if (pendingLowPriceItems.length > 0) {
      for (const item of pendingLowPriceItems) {
        addLowPriceAlertLog({
          shopId: "",
          productId: item.productId,
          productName: item.productName,
          staffName: (currentUser == null ? void 0 : currentUser.name) ?? "Unknown",
          enteredPrice: item.enteredPrice,
          minSellPrice: item.minSellPrice,
          costPrice: item.costPrice,
          attemptType: "blocked",
          pinUsed: false,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        addAuditLog(
          "low_price_attempt",
          `${item.productName} — entered ₹${item.enteredPrice}, min ₹${item.minSellPrice.toFixed(0)}, status: blocked (cancelled)`,
          item.productId
        );
      }
    }
    setShowLowPriceModal(false);
    setPendingLowPriceItems([]);
    setPendingInvoiceData(null);
    setPendingInvoiceItems([]);
  }
  function isWalkIn(name) {
    return name.trim().toLowerCase() === "walk-in customer" || name.trim() === "";
  }
  const paymentModeColors = {
    cash: "bg-card border-green-500 text-green-700 shadow-sm",
    upi: "bg-card border-blue-500 text-blue-700 shadow-sm",
    online: "bg-card border-primary text-primary shadow-sm",
    credit: "bg-card border-amber-500 text-amber-700 shadow-sm"
  };
  const isEditing = !!editingDraftId;
  const showDiscardButton = isEditing || autoDraftActive;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 md:px-6 pb-6 flex flex-col gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: t("Point of Sale") }),
            isEditing && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Badge,
              {
                variant: "secondary",
                className: "bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 text-xs",
                "data-ocid": "billing.editing_draft.badge",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(PenLine, { size: 11 }),
                  "Editing Draft",
                  customerName.trim() ? ` — ${customerName.trim()}` : ""
                ]
              }
            ),
            autoDraftActive && !isEditing && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Badge,
              {
                variant: "secondary",
                className: "bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1 text-xs",
                "data-ocid": "billing.restored_draft.badge",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 11 }),
                  "Restored"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Create invoices with automatic FIFO stock deduction" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          showDiscardButton && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              "data-ocid": "billing.discard.button",
              variant: "outline",
              size: "sm",
              className: "text-destructive border-destructive/40 hover:bg-destructive/5 gap-1",
              onClick: handleDiscard,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }),
                isEditing ? "Discard Draft" : "Discard"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              "data-ocid": "billing.new_sale.button",
              variant: "outline",
              size: "sm",
              className: "gap-1",
              onClick: handleNewSale,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14 }),
                "New Sale"
              ]
            }
          ),
          onNavigate && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              "data-ocid": "billing.view_drafts.button",
              variant: "outline",
              size: "sm",
              className: "gap-1 text-amber-700 border-amber-300 hover:bg-amber-50",
              onClick: () => {
                saveAutoDraft();
                onNavigate("drafts");
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 14 }),
                "Drafts"
              ]
            }
          )
        ] })
      ] }),
      hasOverSell && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          "data-ocid": "billing.oversell_alert_box",
          className: "rounded-lg border-2 border-red-500 bg-red-50 p-4 flex flex-col gap-3",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-red-700 font-semibold text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18, className: "shrink-0" }),
              "Over Sell Alert — ",
              overSellItems.length,
              " item(s) have insufficient stock"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-2", children: overSellItems.map((osi) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "bg-card border border-red-200 rounded-md p-3 text-sm",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-red-800 mb-1", children: osi.productName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-1 text-xs", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Available Stock:" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 font-medium text-foreground", children: [
                        osi.availableStock,
                        " ",
                        osi.unit
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Entered Qty:" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 font-medium text-foreground", children: [
                        osi.enteredQty,
                        " ",
                        osi.unit
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Over Sell Qty:" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 font-bold text-red-600", children: [
                        osi.overSellQty,
                        " ",
                        osi.unit
                      ] })
                    ] })
                  ] })
                ]
              },
              osi.productId
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600", children: "⚠️ Invoice can be created but stock will go negative. Please replenish soon." })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 flex flex-col gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card border-2 border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2 border-b border-blue-200 dark:border-blue-900", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2 text-blue-800 dark:text-blue-300", children: [
              "👤 ",
              t("Customer Details"),
              customerTrackingEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-[10px] px-1.5 py-0 bg-purple-100 text-purple-700 border border-purple-300 dark:bg-purple-900/30 dark:text-purple-300", children: "PRO Tracking ON" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
              customerTrackingEnabled ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 sm:col-span-2 relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm flex items-center gap-1.5", children: [
                  "Mobile Number",
                  (paymentMode === "credit" || computedDue > 0) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-purple-600 font-medium", children: "— type to auto-find customer" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      "data-ocid": "billing.customer_mobile.input",
                      placeholder: "Enter mobile to find/create customer…",
                      value: customerMobile,
                      onChange: (e) => handleMobileInputChange(e.target.value),
                      onBlur: () => setTimeout(() => setShowSuggestions(false), 180),
                      onFocus: () => {
                        if (mobileSuggestions.length > 0)
                          setShowSuggestions(true);
                      },
                      maxLength: 10,
                      className: (paymentMode === "credit" || computedDue > 0) && !customerMobile.trim() ? "border-amber-400 focus-visible:ring-amber-400" : linkedCustomerId ? "border-green-400 focus-visible:ring-green-400" : ""
                    }
                  ),
                  linkedCustomerId && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-green-600 text-xs font-medium flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 11 }),
                    " Linked"
                  ] })
                ] }),
                showSuggestions && mobileSuggestions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    ref: suggestionsRef,
                    "data-ocid": "billing.customer_suggestions.popover",
                    className: "absolute z-50 w-full mt-0.5 bg-card border border-border rounded-lg shadow-lg overflow-hidden",
                    children: mobileSuggestions.map((c) => {
                      const tier = getCustomerTier(c.totalPurchase);
                      const activity = getActivityStatus(c.lastVisit);
                      const hasPending = (c.pendingBalance ?? 0) > 0 || (c.creditBalance ?? 0) > 0;
                      const pendingAmt = c.pendingBalance ?? c.creditBalance ?? 0;
                      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          type: "button",
                          "data-ocid": "billing.customer_suggestion.item",
                          className: "w-full text-left px-3 py-2.5 hover:bg-accent transition-colors border-b border-border/50 last:border-b-0 flex items-center justify-between gap-2",
                          onClick: () => handleSelectCustomerSuggestion(c),
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold truncate", children: c.name || "No name" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-mono", children: c.mobile })
                            ] }) }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [
                              hasPending && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded px-1 py-0.5", children: [
                                "₹",
                                Math.round(pendingAmt).toLocaleString(
                                  "en-IN"
                                ),
                                " ",
                                "pending"
                              ] }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                "span",
                                {
                                  className: `text-[10px] border rounded px-1 py-0.5 font-medium ${TIER_COLORS[tier]}`,
                                  children: [
                                    TIER_EMOJI[tier],
                                    " ",
                                    TIER_LABELS[tier]
                                  ]
                                }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "span",
                                {
                                  className: `text-[10px] border rounded px-1 py-0.5 ${ACTIVITY_COLORS[activity]}`,
                                  children: ACTIVITY_LABELS[activity]
                                }
                              )
                            ] })
                          ]
                        },
                        c.id
                      );
                    })
                  }
                ),
                (paymentMode === "credit" || computedDue > 0) && !customerMobile.trim() && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-amber-600 flex items-center gap-1 mt-0.5", children: "⚠️ Mobile number is required for credit sales" }),
                linkedCustomerId && (() => {
                  const lc = customers.find(
                    (c) => c.id === linkedCustomerId
                  );
                  if (!lc) return null;
                  const tier = getCustomerTier(lc.totalPurchase);
                  const activity = getActivityStatus(lc.lastVisit);
                  const pending = lc.pendingBalance ?? lc.creditBalance ?? 0;
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      "data-ocid": "billing.linked_customer.card",
                      className: "mt-2 rounded-lg border border-green-300 bg-green-50/60 dark:border-green-700 dark:bg-green-950/20 p-3 text-xs space-y-1.5",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm text-foreground", children: lc.name || "—" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "span",
                            {
                              className: `border rounded px-1.5 py-0.5 font-medium text-[11px] ${TIER_COLORS[tier]}`,
                              children: [
                                TIER_EMOJI[tier],
                                " ",
                                TIER_LABELS[tier]
                              ]
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "span",
                            {
                              className: `border rounded px-1.5 py-0.5 text-[11px] ${ACTIVITY_COLORS[activity]}`,
                              children: ACTIVITY_LABELS[activity]
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 text-muted-foreground", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wide", children: "Last Visit" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-foreground", children: lc.lastVisit ? new Date(lc.lastVisit).toLocaleDateString(
                              "en-IN"
                            ) : "—" })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wide", children: "Total Purchase" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium text-foreground", children: [
                              "₹",
                              (lc.totalPurchase ?? 0).toLocaleString(
                                "en-IN"
                              )
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wide", children: "Pending" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "div",
                              {
                                className: `font-semibold ${pending > 0 ? "text-red-600" : "text-green-600"}`,
                                children: pending > 0 ? `₹${Math.round(pending).toLocaleString("en-IN")}` : "Nil"
                              }
                            )
                          ] })
                        ] })
                      ]
                    }
                  );
                })()
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm", children: [
                  "Mobile Number",
                  (paymentMode === "credit" || computedDue > 0) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500 ml-1", children: "*" }),
                  (paymentMode === "credit" || computedDue > 0) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-amber-600 ml-2 font-normal", children: "Required for dues" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    "data-ocid": "billing.customer_mobile.input",
                    placeholder: "10-digit mobile",
                    value: customerMobile,
                    onChange: (e) => setCustomerMobile(e.target.value),
                    maxLength: 10,
                    className: (paymentMode === "credit" || computedDue > 0) && !customerMobile.trim() ? "border-amber-400 focus-visible:ring-amber-400" : ""
                  }
                ),
                (paymentMode === "credit" || computedDue > 0) && !customerMobile.trim() && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-amber-600 flex items-center gap-1 mt-0.5", children: "⚠️ Mobile number is required for credit sales" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm", children: [
                  "Customer Name",
                  paymentMode === "credit" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500 ml-1", children: "*" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    "data-ocid": "billing.customer_name.input",
                    placeholder: "e.g. Ramesh Kumar",
                    value: customerName,
                    onChange: (e) => setCustomerName(e.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 sm:col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm", children: [
                  "Address",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal text-xs", children: "(optional)" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    "data-ocid": "billing.customer_address.input",
                    placeholder: "e.g. 12 Main Market, Indore",
                    value: customerAddress,
                    onChange: (e) => setCustomerAddress(e.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 sm:col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm flex items-center gap-1.5", children: [
                  "Customer Type",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal text-xs", children: "(sets price mode)" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    "data-ocid": "billing.customer_type.toggle",
                    className: "flex gap-1.5 flex-wrap",
                    children: [
                      {
                        key: "regular",
                        label: "Regular",
                        hint: "Standard price",
                        cls: "border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
                        activeCls: "ring-2 ring-blue-500 ring-offset-1 font-semibold"
                      },
                      {
                        key: "retailer",
                        label: "Retailer",
                        hint: "दुकानदार",
                        cls: "border-green-400 bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300",
                        activeCls: "ring-2 ring-green-500 ring-offset-1 font-semibold"
                      },
                      {
                        key: "wholesaler",
                        label: "Wholesaler",
                        hint: "थोक",
                        cls: "border-purple-400 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
                        activeCls: "ring-2 ring-purple-500 ring-offset-1 font-semibold"
                      }
                    ].map(({ key, label, hint, cls, activeCls }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        type: "button",
                        "data-ocid": `billing.customer_type.${key}`,
                        onClick: () => {
                          setCustomerType(key);
                          applyCustomerTypeToCart(key);
                        },
                        className: `px-3 py-1.5 rounded-full text-xs border transition-all ${cls} ${customerType === key ? activeCls : "opacity-60 hover:opacity-90"}`,
                        children: [
                          label,
                          " ",
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "opacity-70 font-normal", children: [
                            "(",
                            hint,
                            ")"
                          ] })
                        ]
                      },
                      key
                    ))
                  }
                ),
                customerType !== "regular" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: customerType === "retailer" ? "Retailer price auto-applied to items that have it set" : "Wholesaler price auto-applied to items that have it set" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 -my-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-border" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-medium px-2 py-0.5 rounded-full bg-muted border border-border whitespace-nowrap", children: "🛒 Items" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-border" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card border-2 border-green-200 dark:border-green-900 bg-green-50/20 dark:bg-green-950/10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3 border-b border-green-200 dark:border-green-900", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2 text-green-800 dark:text-green-300", children: [
              "🧺 ",
              t("Add Items")
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 pt-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-0 flex gap-2 items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: selectedProductId,
                    onValueChange: (v) => {
                      setSelectedProductId(v);
                      setSelectedBatchId("");
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        SelectTrigger,
                        {
                          "data-ocid": "billing.product.select",
                          className: "flex-1",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Search & select product..." })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: products.map((p) => {
                        const stock = getProductStock(p.id);
                        const isZero = stock <= 0;
                        return /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.id, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: isZero ? "text-orange-500" : "", children: [
                          isZero ? "⚠️ " : "",
                          p.name,
                          " — Stock: ",
                          stock,
                          " ",
                          p.unit
                        ] }) }, p.id);
                      }) })
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    ref: qtyInputRef,
                    "data-ocid": "billing.qty.input",
                    type: "number",
                    placeholder: "Qty",
                    value: addQty,
                    onChange: (e) => setAddQty(clearLeadingZeros(e.target.value)),
                    onFocus: (e) => {
                      if (e.target.value === "0") e.target.select();
                    },
                    className: "w-28"
                  }
                ),
                (appConfig.featureMode ?? 3) === 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    VoiceInputButton,
                    {
                      compact: true,
                      onParsed: handleBillingVoiceParsed,
                      lang: language === "hi" ? "hi-IN" : "en-IN",
                      "data-ocid": "billing.voice_input.button"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    QRScannerToggle,
                    {
                      products,
                      onProductScanned: handleProductScanned,
                      qtyInputRef
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    "data-ocid": "billing.add_item.button",
                    onClick: handleAddToCart,
                    size: "sm",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Checkbox,
                  {
                    id: "manual-batch",
                    "data-ocid": "billing.manual_batch_mode.checkbox",
                    checked: manualBatchMode,
                    onCheckedChange: (v) => {
                      setManualBatchMode(!!v);
                      setSelectedBatchId("");
                    }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "label",
                  {
                    htmlFor: "manual-batch",
                    className: "text-sm text-muted-foreground cursor-pointer flex items-center gap-1",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { size: 14 }),
                      " Select Batch Manually (Option B)"
                    ]
                  }
                )
              ] }),
              manualBatchMode && selectedProductId && (() => {
                const availableBatches = getProductBatches(
                  selectedProductId
                ).sort(
                  (a, b) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
                );
                const selectedProduct = products.find(
                  (p) => p.id === selectedProductId
                );
                if (availableBatches.length === 0) return null;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { size: 12 }),
                    " Select Batch"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Select,
                    {
                      value: selectedBatchId,
                      onValueChange: setSelectedBatchId,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          SelectTrigger,
                          {
                            "data-ocid": "billing.batch.select",
                            className: "w-full text-xs",
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Choose a batch..." })
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: availableBatches.map((b, bi) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: b.id, children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-xs", children: [
                            "B",
                            String(b.batchNumber ?? bi + 1).padStart(
                              3,
                              "0"
                            )
                          ] }),
                          " — ",
                          b.quantity,
                          " ",
                          (selectedProduct == null ? void 0 : selectedProduct.unit) ?? "",
                          " @ ₹",
                          b.purchaseRate.toLocaleString("en-IN"),
                          " | ",
                          new Date(b.dateAdded).toLocaleDateString(
                            "en-IN"
                          ),
                          bi === 0 ? " ★ FIFO" : ""
                        ] }, b.id)) })
                      ]
                    }
                  )
                ] });
              })(),
              cart.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-secondary/50", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Item" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Qty" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Rate (₹)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Amount" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: cart.map((item, idx) => {
                  var _a2;
                  const available = item.selectedBatchId ? ((_a2 = getProductBatches(item.productId).find(
                    (b) => b.id === item.selectedBatchId
                  )) == null ? void 0 : _a2.quantity) ?? 0 : getProductStock(item.productId);
                  const isOverSell = item.quantity > available;
                  const cartKey = item.selectedBatchId ?? item.productId;
                  const batchInfo = item.selectedBatchId ? getProductBatches(item.productId).find(
                    (b) => b.id === item.selectedBatchId
                  ) : void 0;
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    TableRow,
                    {
                      "data-ocid": `billing.cart.item.${idx + 1}`,
                      style: isOverSell ? { backgroundColor: "#ffe5e5" } : {},
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
                          item.productName,
                          batchInfo && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 border border-blue-200 rounded px-1 py-0.5 w-fit", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { size: 9 }),
                            "Batch B",
                            String(
                              batchInfo.batchNumber ?? idx + 1
                            ).padStart(3, "0")
                          ] }),
                          isOverSell && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-red-600 flex items-center gap-1 font-semibold", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 10 }),
                            "Over Sell — ",
                            available,
                            " available"
                          ] }),
                          (() => {
                            const prod = products.find(
                              (p) => p.id === item.productId
                            );
                            if (!prod) return null;
                            const hasRetailer = prod.retailerPrice && prod.retailerPrice > 0;
                            const hasWholesaler = prod.wholesalerPrice && prod.wholesalerPrice > 0;
                            if (!hasRetailer && !hasWholesaler)
                              return null;
                            const currentMode = item.priceMode ?? "standard";
                            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "div",
                              {
                                "data-ocid": `billing.cart.price_mode.${idx + 1}`,
                                className: "flex gap-1 flex-wrap mt-0.5",
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                    "button",
                                    {
                                      type: "button",
                                      onClick: () => handleItemPriceModeChange(
                                        item.productId,
                                        item.selectedBatchId,
                                        "standard"
                                      ),
                                      className: `px-1.5 py-0.5 rounded text-[10px] border transition-all ${currentMode === "standard" ? "bg-blue-100 border-blue-400 text-blue-700 font-semibold ring-1 ring-blue-400" : "bg-muted border-border text-muted-foreground hover:border-blue-300"}`,
                                      children: [
                                        "Std ₹",
                                        prod.sellingPrice.toLocaleString(
                                          "en-IN"
                                        )
                                      ]
                                    }
                                  ),
                                  hasRetailer && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                    "button",
                                    {
                                      type: "button",
                                      onClick: () => handleItemPriceModeChange(
                                        item.productId,
                                        item.selectedBatchId,
                                        "retailer"
                                      ),
                                      className: `px-1.5 py-0.5 rounded text-[10px] border transition-all ${currentMode === "retailer" ? "bg-green-100 border-green-400 text-green-700 font-semibold ring-1 ring-green-400" : "bg-muted border-border text-muted-foreground hover:border-green-300"}`,
                                      children: [
                                        "Ret ₹",
                                        prod.retailerPrice.toLocaleString(
                                          "en-IN"
                                        )
                                      ]
                                    }
                                  ),
                                  hasWholesaler && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                    "button",
                                    {
                                      type: "button",
                                      onClick: () => handleItemPriceModeChange(
                                        item.productId,
                                        item.selectedBatchId,
                                        "wholesaler"
                                      ),
                                      className: `px-1.5 py-0.5 rounded text-[10px] border transition-all ${currentMode === "wholesaler" ? "bg-purple-100 border-purple-400 text-purple-700 font-semibold ring-1 ring-purple-400" : "bg-muted border-border text-muted-foreground hover:border-purple-300"}`,
                                      children: [
                                        "Whl ₹",
                                        prod.wholesalerPrice.toLocaleString(
                                          "en-IN"
                                        )
                                      ]
                                    }
                                  )
                                ]
                              }
                            );
                          })()
                        ] }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Button,
                            {
                              "data-ocid": `billing.cart.qty_decrement.${idx + 1}`,
                              variant: "outline",
                              size: "sm",
                              className: "h-7 w-7 p-0 shrink-0",
                              onClick: () => handleQtyDecrement(
                                item.productId,
                                item.selectedBatchId
                              ),
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { size: 12 })
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Input,
                            {
                              type: "number",
                              value: qtyInputs[cartKey] ?? String(item.quantity),
                              onChange: (e) => handleQtyInputChange(
                                item.productId,
                                clearLeadingZeros(e.target.value),
                                item.selectedBatchId
                              ),
                              onFocus: (e) => {
                                if (e.target.value === "0")
                                  e.target.select();
                              },
                              className: `w-20 h-9 text-sm text-center ${isOverSell ? "border-red-500" : ""}`
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Button,
                            {
                              "data-ocid": `billing.cart.qty_increment.${idx + 1}`,
                              variant: "outline",
                              size: "sm",
                              className: "h-7 w-7 p-0 shrink-0",
                              onClick: () => handleQtyIncrement(
                                item.productId,
                                item.selectedBatchId
                              ),
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 12 })
                            }
                          )
                        ] }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: (() => {
                          const prod = products.find(
                            (p) => p.id === item.productId
                          );
                          const bp = item.basePrice ?? (prod == null ? void 0 : prod.sellingPrice) ?? item.sellingRate;
                          const discPct = getDiscountPct(
                            bp,
                            item.sellingRate
                          );
                          const errMsg = itemErrors[item.productId];
                          const costP = canViewCost ? item.costPrice && item.costPrice > 0 ? item.costPrice : getProductCostPrice(item.productId) : 0;
                          const minProfitPct = (prod == null ? void 0 : prod.minProfitPct) ?? 0;
                          const minSellP = canViewCost && costP > 0 && minProfitPct > 0 ? getMinPrice(costP, minProfitPct) : null;
                          const isBelowMin = minSellP !== null && item.sellingRate < minSellP;
                          const profit = costP > 0 ? (item.sellingRate - costP) * item.quantity : 0;
                          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-0.5", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Input,
                              {
                                type: "number",
                                value: item.sellingRate,
                                onChange: (e) => handleRateChange(
                                  item.productId,
                                  Number(
                                    clearLeadingZeros(e.target.value)
                                  )
                                ),
                                onFocus: (e) => {
                                  if (e.target.value === "0")
                                    e.target.select();
                                },
                                className: `w-24 h-7 text-sm ${errMsg || isBelowMin ? "border-red-500 focus-visible:ring-red-400" : ""}`
                              }
                            ),
                            canViewCost && costP > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-x-1.5 gap-y-0.5 text-[10px] leading-tight", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                                "Cost: ₹",
                                Math.round(costP).toLocaleString(
                                  "en-IN"
                                )
                              ] }),
                              minSellP !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-amber-600", children: [
                                "Min: ₹",
                                Math.round(
                                  minSellP
                                ).toLocaleString("en-IN")
                              ] }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                "span",
                                {
                                  className: isBelowMin ? "text-red-600 font-semibold" : "text-muted-foreground",
                                  children: [
                                    "Sell: ₹",
                                    Math.round(
                                      item.sellingRate
                                    ).toLocaleString("en-IN"),
                                    isBelowMin && " ⬇"
                                  ]
                                }
                              )
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
                              "Base: ₹",
                              bp.toLocaleString("en-IN")
                            ] }),
                            discPct > 0 && !errMsg && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-amber-600 font-medium", children: [
                              "Discount: ",
                              discPct.toFixed(1),
                              "%"
                            ] }),
                            canViewCost && costP > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "span",
                              {
                                className: `text-[10px] font-medium ${profit >= 0 ? "text-green-600" : "text-red-600"}`,
                                children: [
                                  "Profit: ₹",
                                  Math.round(profit).toLocaleString(
                                    "en-IN"
                                  )
                                ]
                              }
                            ),
                            errMsg && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-red-600 font-semibold leading-tight max-w-[140px]", children: errMsg })
                          ] });
                        })() }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm font-semibold", children: fmt(item.quantity * item.sellingRate) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Button,
                          {
                            "data-ocid": `billing.cart.delete_button.${idx + 1}`,
                            variant: "ghost",
                            size: "sm",
                            className: "text-destructive h-7 w-7 p-0",
                            onClick: () => handleRemoveItem(
                              item.productId,
                              item.selectedBatchId
                            ),
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 })
                          }
                        ) })
                      ]
                    },
                    cartKey
                  );
                }) })
              ] }) }),
              cart.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  "data-ocid": "billing.cart.empty_state",
                  className: "text-center py-8 text-muted-foreground text-sm",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "mx-auto mb-2", size: 24 }),
                    "Add items to start billing"
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card border-2 border-purple-200 dark:border-purple-900 bg-purple-50/20 dark:bg-purple-950/10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2 border-b border-purple-200 dark:border-purple-900", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2 text-purple-800 dark:text-purple-300", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { size: 16 }),
                  "Extra Charges"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    "data-ocid": "billing.extra_charges.toggle",
                    "aria-label": "Toggle extra charges",
                    onClick: () => setChargesEnabled((v) => !v),
                    className: `relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${chargesEnabled ? "bg-purple-600" : "bg-muted-foreground/30"}`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: `pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${chargesEnabled ? "translate-x-5" : "translate-x-0"}`
                      }
                    )
                  }
                )
              ] }),
              !chargesEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Toggle ON to add transportation, labour, or other charges" })
            ] }),
            chargesEnabled && /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-3 space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    "data-ocid": "billing.transport_charge.toggle",
                    "aria-label": "Toggle transportation charge",
                    onClick: () => setTransportEnabled((v) => !v),
                    className: `relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${transportEnabled ? "bg-purple-500" : "bg-muted-foreground/30"}`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: `pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${transportEnabled ? "translate-x-4" : "translate-x-0"}`
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-foreground flex-1 font-medium", children: "🚛 Transportation Charge" }),
                transportEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    "data-ocid": "billing.transport_charge.input",
                    type: "number",
                    placeholder: "₹ Amount",
                    value: transportAmt,
                    onChange: (e) => setTransportAmt(clearLeadingZeros(e.target.value)),
                    onFocus: (e) => {
                      if (e.target.value === "0") e.target.select();
                    },
                    className: "w-28 h-8 text-sm",
                    min: "0"
                  }
                ),
                !transportEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "OFF" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    "data-ocid": "billing.labour_charge.toggle",
                    "aria-label": "Toggle labour charge",
                    onClick: () => setLabourEnabled((v) => !v),
                    className: `relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${labourEnabled ? "bg-purple-500" : "bg-muted-foreground/30"}`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: `pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${labourEnabled ? "translate-x-4" : "translate-x-0"}`
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-foreground flex-1 font-medium", children: "👷 Labour Charge" }),
                labourEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    "data-ocid": "billing.labour_charge.input",
                    type: "number",
                    placeholder: "₹ Amount",
                    value: labourAmt,
                    onChange: (e) => setLabourAmt(clearLeadingZeros(e.target.value)),
                    onFocus: (e) => {
                      if (e.target.value === "0") e.target.select();
                    },
                    className: "w-28 h-8 text-sm",
                    min: "0"
                  }
                ),
                !labourEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "OFF" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    "data-ocid": "billing.other_charges.toggle",
                    "aria-label": "Toggle other charges",
                    onClick: () => setOtherEnabled((v) => !v),
                    className: `relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${otherEnabled ? "bg-purple-500" : "bg-muted-foreground/30"}`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: `pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${otherEnabled ? "translate-x-4" : "translate-x-0"}`
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-foreground flex-1 font-medium", children: "📦 Other Charges" }),
                otherEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    "data-ocid": "billing.other_charges.input",
                    type: "number",
                    placeholder: "₹ Amount",
                    value: otherAmt,
                    onChange: (e) => setOtherAmt(clearLeadingZeros(e.target.value)),
                    onFocus: (e) => {
                      if (e.target.value === "0") e.target.select();
                    },
                    className: "w-28 h-8 text-sm",
                    min: "0"
                  }
                ),
                !otherEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "OFF" })
              ] }),
              totalCharges > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center pt-2 border-t border-purple-200 dark:border-purple-800 text-sm font-medium text-purple-700 dark:text-purple-300", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total Extra Charges" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fmt(totalCharges) })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card border-2 border-amber-200 dark:border-amber-900", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3 border-b border-amber-200 dark:border-amber-900", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2 text-amber-800 dark:text-amber-300", children: [
            "💰 ",
            t("Payment")
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Items" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: cart.length })
              ] }),
              hasOverSell && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-300 text-xs text-red-700", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 14, className: "shrink-0" }),
                overSellItems.length,
                " item(s) exceed available stock"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Subtotal" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fmt(itemsSubtotal) })
              ] }),
              activeTransport > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground flex items-center gap-1", children: "🚛 Transport" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-purple-700", children: [
                  "+",
                  fmt(activeTransport)
                ] })
              ] }),
              activeLabour > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground flex items-center gap-1", children: "👷 Labour" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-purple-700", children: [
                  "+",
                  fmt(activeLabour)
                ] })
              ] }),
              activeOther > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground flex items-center gap-1", children: "📦 Other" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-purple-700", children: [
                  "+",
                  fmt(activeOther)
                ] })
              ] }),
              totalCharges > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-bold text-lg", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Grand Total" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand-blue", children: fmt(total) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium text-foreground", children: t("Payment Mode") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: ["cash", "upi", "online", "credit"].map(
                (mode) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    "data-ocid": `billing.payment_mode_${mode}.toggle`,
                    onClick: () => handlePaymentModeChange(mode),
                    className: `h-11 flex items-center justify-center gap-2 px-3 rounded-lg border-2 text-xs font-semibold capitalize transition-all ${paymentMode === mode ? paymentModeColors[mode] : "bg-background border-border text-muted-foreground hover:border-primary/40"}`,
                    children: [
                      mode === "cash" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "💵" }),
                        " Cash"
                      ] }),
                      mode === "upi" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "📱" }),
                        " UPI"
                      ] }),
                      mode === "online" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "💻" }),
                        " Online"
                      ] }),
                      mode === "credit" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "📝" }),
                        " Credit"
                      ] })
                    ]
                  },
                  mode
                )
              ) }),
              paymentMode === "credit" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600 mt-1", children: "Credit sale: Paid = ₹0, Due = Total. Customer name required." })
            ] }),
            paymentMode !== "credit" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Checkbox,
                {
                  id: "partial-payment",
                  "data-ocid": "billing.partial_payment.checkbox",
                  checked: isPartial,
                  onCheckedChange: (v) => {
                    setIsPartial(!!v);
                    if (!v) setPaidAmountStr("");
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "label",
                {
                  htmlFor: "partial-payment",
                  className: "text-sm text-muted-foreground cursor-pointer",
                  children: "Partial Payment"
                }
              )
            ] }),
            isPartial && paymentMode !== "credit" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Amount Paid (₹)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  "data-ocid": "billing.paid_amount.input",
                  type: "number",
                  placeholder: "Enter amount received",
                  value: paidAmountStr,
                  onChange: (e) => setPaidAmountStr(clearLeadingZeros(e.target.value)),
                  onFocus: (e) => {
                    if (e.target.value === "0") e.target.select();
                  }
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-card shadow-card overflow-hidden text-sm", children: [
              paymentMode === "cash" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-3 py-2.5 border-b border-border/60", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "💵" }),
                  " Cash"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-green-600", children: fmt(computedPaid) })
              ] }),
              (paymentMode === "upi" || paymentMode === "online") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-3 py-2.5 border-b border-border/60", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "📱" }),
                  " ",
                  paymentMode === "upi" ? "UPI" : "Online"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-blue-600", children: fmt(computedPaid) })
              ] }),
              paymentMode === "credit" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-3 py-2.5 border-b border-border/60", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "📝" }),
                  " Credit"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-amber-600", children: fmt(total) })
              ] }),
              activeTransport > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-3 py-1.5 border-b border-border/60 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "🚛 Transport" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-purple-700", children: [
                  "+",
                  fmt(activeTransport)
                ] })
              ] }),
              activeLabour > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-3 py-1.5 border-b border-border/60 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "👷 Labour" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-purple-700", children: [
                  "+",
                  fmt(activeLabour)
                ] })
              ] }),
              activeOther > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-3 py-1.5 border-b border-border/60 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "📦 Other" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-purple-700", children: [
                  "+",
                  fmt(activeOther)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-3 py-2.5 border-b border-border/60", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: "Grand Total" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-foreground", children: fmt(total) })
              ] }),
              computedDue > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-3 py-2.5 bg-red-50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600 font-medium", children: "Due" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-red-600", children: fmt(computedDue) })
              ] }),
              computedDue === 0 && paymentMode !== "credit" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-3 py-2.5 bg-green-50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600 font-medium", children: "Fully Paid" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600", children: "✓" })
              ] })
            ] }),
            canViewCost && cart.length > 0 && (() => {
              const basePriceTotal = cart.reduce((s, item) => {
                const prod = products.find(
                  (p) => p.id === item.productId
                );
                const bp = item.basePrice ?? (prod == null ? void 0 : prod.sellingPrice) ?? item.sellingRate;
                return s + bp * item.quantity;
              }, 0);
              const extraProfitTotal = cart.reduce((s, item) => {
                const prod = products.find(
                  (p) => p.id === item.productId
                );
                const bp = item.basePrice ?? (prod == null ? void 0 : prod.sellingPrice) ?? item.sellingRate;
                return s + calcExtraProfit(bp, item.sellingRate, item.quantity);
              }, 0);
              const staffBonusTotal = calcStaffBonus(extraProfitTotal);
              const hasErrors = Object.keys(itemErrors).length > 0;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: `rounded-lg p-3 space-y-1.5 text-sm border ${hasErrors ? "bg-red-50 border-red-200" : "bg-emerald-50/50 border-emerald-200"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1", children: "Smart Pricing" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Base Price Total" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
                        "₹",
                        basePriceTotal.toLocaleString("en-IN")
                      ] })
                    ] }),
                    extraProfitTotal > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-700 font-medium", children: "Extra Profit" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-green-700", children: [
                          "+₹",
                          extraProfitTotal.toLocaleString("en-IN")
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600", children: "Staff Bonus" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-green-600", children: [
                          "₹",
                          staffBonusTotal.toLocaleString("en-IN"),
                          " ",
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-normal", children: "(Earned by staff)" })
                        ] })
                      ] })
                    ] }),
                    hasErrors && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-red-600 text-[11px] pt-0.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 11 }),
                      "There are pricing errors — please fix them"
                    ] })
                  ]
                }
              );
            })(),
            lastSavedAt && cart.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground text-center", children: [
              "💾 Draft auto-saved",
              " ",
              Math.floor((Date.now() - lastSavedAt.getTime()) / 1e3) < 60 ? "just now" : `${Math.floor((Date.now() - lastSavedAt.getTime()) / 6e4)}m ago`
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                "data-ocid": "billing.save_draft.button",
                variant: "outline",
                className: "w-full gap-2 border-amber-300 text-amber-700 hover:bg-amber-50",
                onClick: handleSaveDraft,
                disabled: cart.length === 0 && !customerName.trim(),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 15 }),
                  isEditing ? "Update Draft" : "Save Draft"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                "data-ocid": "billing.generate_invoice.button",
                className: "w-full h-11 text-base font-semibold",
                onClick: () => {
                  setIsPaymentProcessing(true);
                  handleGenerateInvoice();
                  setTimeout(() => setIsPaymentProcessing(false), 1500);
                },
                disabled: cart.length === 0 || Object.keys(itemErrors).length > 0 || isPaymentProcessing,
                children: isPaymentProcessing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" }),
                  "Processing..."
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { size: 16, className: "mr-2" }),
                  paymentMode === "cash" && onNavigate ? "💰 Pay via Cash Counter" : t("Generate Invoice")
                ] })
              }
            )
          ] })
        ] }) })
      ] })
    ] }),
    generatedInvoice && /* @__PURE__ */ jsxRuntimeExports.jsx(
      InvoiceDialog,
      {
        invoice: generatedInvoice,
        open: showInvoice,
        onClose: () => setShowInvoice(false)
      }
    ),
    showLowPriceModal && pendingInvoiceData && /* @__PURE__ */ jsxRuntimeExports.jsx(
      LowPriceAlertModal,
      {
        items: pendingLowPriceItems,
        isLockMode: !(appConfig.allowLowPriceSelling ?? true),
        ownerPin: appConfig.ownerPin ?? "",
        userRole,
        onContinue: handleLowPriceModalContinue,
        onCancel: handleLowPriceModalCancel
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      NewSaleConfirmDialog,
      {
        open: showNewSaleConfirm,
        onConfirm: handleNewSaleConfirm,
        onCancel: () => setShowNewSaleConfirm(false)
      }
    )
  ] });
}
function InvoiceDialog({
  invoice,
  open,
  onClose
}) {
  if (!open) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(InvoiceShareModal, { invoice, onClose });
}
export {
  BillingPage
};
