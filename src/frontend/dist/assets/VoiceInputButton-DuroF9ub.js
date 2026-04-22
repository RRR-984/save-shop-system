import { c as createLucideIcon, r as reactExports, J as useLanguage, j as jsxRuntimeExports, X, B as Button } from "./index-Bt77HP0S.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["line", { x1: "2", x2: "22", y1: "2", y2: "22", key: "a6p6uj" }],
  ["path", { d: "M18.89 13.23A7.12 7.12 0 0 0 19 12v-2", key: "80xlxr" }],
  ["path", { d: "M5 10v2a7 7 0 0 0 12 5", key: "p2k8kg" }],
  ["path", { d: "M15 9.34V5a3 3 0 0 0-5.68-1.33", key: "1gzdoj" }],
  ["path", { d: "M9 9v3a3 3 0 0 0 5.12 2.12", key: "r2i35w" }],
  ["line", { x1: "12", x2: "12", y1: "19", y2: "22", key: "x3vr5v" }]
];
const MicOff = createLucideIcon("mic-off", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z", key: "131961" }],
  ["path", { d: "M19 10v2a7 7 0 0 1-14 0v-2", key: "1vc78b" }],
  ["line", { x1: "12", x2: "12", y1: "19", y2: "22", key: "x3vr5v" }]
];
const Mic = createLucideIcon("mic", __iconNode);
function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  const w = window;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}
function useVoiceInput(options = {}) {
  const { lang = "en-IN", onEnd } = options;
  const [isListening, setIsListening] = reactExports.useState(false);
  const [transcript, setTranscript] = reactExports.useState("");
  const [interimTranscript, setInterimTranscript] = reactExports.useState("");
  const [error, setError] = reactExports.useState(null);
  const SpeechRecognitionAPI = getSpeechRecognition();
  const isSupported = !!SpeechRecognitionAPI;
  const recognizerRef = reactExports.useRef(null);
  const finalTranscriptRef = reactExports.useRef("");
  const onEndRef = reactExports.useRef(onEnd);
  onEndRef.current = onEnd;
  const stopListening = reactExports.useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
  }, []);
  const startListening = reactExports.useCallback(() => {
    const API = getSpeechRecognition();
    if (!API) {
      setError("Voice input is not supported in this browser");
      return;
    }
    if (recognizerRef.current) {
      recognizerRef.current.abort();
    }
    setError(null);
    finalTranscriptRef.current = "";
    setTranscript("");
    setInterimTranscript("");
    const recognizer = new API();
    recognizer.lang = lang;
    recognizer.continuous = false;
    recognizer.interimResults = true;
    recognizer.maxAlternatives = 1;
    recognizer.onstart = () => {
      setIsListening(true);
    };
    recognizer.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscriptRef.current += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(finalTranscriptRef.current);
      setInterimTranscript(interim);
    };
    recognizer.onerror = (event) => {
      const errorMessages = {
        "not-allowed": "Microphone permission denied. Please allow mic access.",
        "no-speech": "No speech detected. Please try again.",
        network: "Network error. Check your connection.",
        aborted: "Voice input was cancelled.",
        "audio-capture": "No microphone found.",
        "service-not-allowed": "Voice service not allowed."
      };
      setError(
        errorMessages[event.error] ?? "Voice input error. Please try again."
      );
      setIsListening(false);
    };
    recognizer.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
      const final = finalTranscriptRef.current.trim();
      setTranscript(final);
      if (onEndRef.current) {
        onEndRef.current(final);
      }
    };
    recognizerRef.current = recognizer;
    recognizer.start();
  }, [lang]);
  const resetTranscript = reactExports.useCallback(() => {
    finalTranscriptRef.current = "";
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  }, []);
  reactExports.useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.abort();
      }
    };
  }, []);
  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  };
}
const HINDI_NUMBERS = {
  ek: 1,
  do: 2,
  teen: 3,
  chaar: 4,
  paanch: 5,
  chhe: 6,
  saat: 7,
  aath: 8,
  nau: 9,
  das: 10,
  gyarah: 11,
  barah: 12,
  terah: 13,
  chaudah: 14,
  pandrah: 15,
  solah: 16,
  satrah: 17,
  atharah: 18,
  unnis: 19,
  bees: 20,
  tees: 30,
  chaalees: 40,
  pachaas: 50,
  saath: 60,
  sattar: 70,
  assi: 80,
  nabbe: 90,
  sau: 100,
  paanch_sau: 500
};
const UNIT_WORDS = /* @__PURE__ */ new Set([
  "kg",
  "kilo",
  "kilogram",
  "किलो",
  "gram",
  "g",
  "gm",
  "piece",
  "pieces",
  "pcs",
  "items",
  "item",
  "unit",
  "units",
  "litre",
  "liter",
  "l",
  "ml",
  "dozen",
  "box",
  "bag",
  "packet",
  "bottle",
  "crate"
]);
const ADD_WORDS = /* @__PURE__ */ new Set([
  "add",
  "jodo",
  "daalo",
  "lagao",
  "karo",
  "karna",
  "stock",
  "mein"
]);
const SELL_WORDS = /* @__PURE__ */ new Set([
  "sell",
  "becho",
  "becha",
  "sold",
  "nikalo",
  "sale",
  "diya",
  "de"
]);
const PAYMENT_WORDS = /* @__PURE__ */ new Set([
  "paid",
  "payment",
  "received",
  "mila",
  "diya",
  "liya",
  "ne"
]);
const PRICE_TRIGGER_WORDS = /* @__PURE__ */ new Set([
  "rupees",
  "rupaye",
  "rs",
  "₹",
  "paisa",
  "rate",
  "daam",
  "keemat"
]);
const STOPWORDS = /* @__PURE__ */ new Set([
  "add",
  "karo",
  "karna",
  "mein",
  "se",
  "ko",
  "ka",
  "ki",
  "ke",
  "hai",
  "tha",
  "is",
  "at",
  "for",
  "the",
  "a",
  "an",
  "stock",
  "daalo",
  "lagao",
  "jodo",
  "sell",
  "becho",
  "sold",
  "nikalo",
  "paid",
  "payment",
  "received",
  "mila",
  "liya",
  "diya",
  "ne",
  "or",
  "and",
  "aur",
  "bhi",
  "to",
  "toh",
  "per",
  "wala",
  "do",
  "kuch",
  "yeh",
  "woh"
]);
function normalizeText(text) {
  return text.toLowerCase().trim();
}
function resolveHindiNumber(word) {
  const lower = word.toLowerCase();
  if (HINDI_NUMBERS[lower] !== void 0) return HINDI_NUMBERS[lower];
  return null;
}
function resolveNumber(word) {
  const asFloat = Number.parseFloat(word);
  if (!Number.isNaN(asFloat)) return asFloat;
  return resolveHindiNumber(word);
}
function detectAction(words) {
  const wordSet = new Set(words.map((w) => w.toLowerCase()));
  const paymentKeywords = ["paid", "payment", "received", "mila", "liya"];
  if (paymentKeywords.some((k) => wordSet.has(k))) return "payment";
  if (wordSet.has("ne")) return "payment";
  const addKeywords = ["add", "jodo", "lagao"];
  if (addKeywords.some((k) => wordSet.has(k))) return "add";
  if (wordSet.has("daalo") && wordSet.has("stock")) return "add";
  if (wordSet.has("daalo")) return "add";
  const sellKeywords = ["sell", "becho", "becha", "sold", "nikalo", "sale"];
  if (sellKeywords.some((k) => wordSet.has(k))) return "sell";
  return "unknown";
}
function extractQuantityAndUnit(words) {
  const usedIndices = /* @__PURE__ */ new Set();
  for (let i = 0; i < words.length; i++) {
    const num = resolveNumber(words[i]);
    if (num !== null) {
      if (i + 1 < words.length && UNIT_WORDS.has(words[i + 1].toLowerCase())) {
        usedIndices.add(i);
        usedIndices.add(i + 1);
        return { quantity: num, unit: words[i + 1].toLowerCase(), usedIndices };
      }
      if (i > 0 && UNIT_WORDS.has(words[i - 1].toLowerCase())) {
        usedIndices.add(i - 1);
        usedIndices.add(i);
        return { quantity: num, unit: words[i - 1].toLowerCase(), usedIndices };
      }
    }
  }
  for (let i = 0; i < words.length; i++) {
    const num = resolveNumber(words[i]);
    if (num !== null) {
      const prevWord = i > 0 ? words[i - 1].toLowerCase() : "";
      const nextWord = i + 1 < words.length ? words[i + 1].toLowerCase() : "";
      const isPriceContext = PRICE_TRIGGER_WORDS.has(prevWord) || PRICE_TRIGGER_WORDS.has(nextWord) || prevWord === "at" || prevWord === "for";
      if (!isPriceContext) {
        usedIndices.add(i);
        return { quantity: num, unit: null, usedIndices };
      }
    }
  }
  return { quantity: null, unit: null, usedIndices };
}
function extractPrice(words) {
  const usedIndices = /* @__PURE__ */ new Set();
  for (let i = 0; i < words.length; i++) {
    const w = words[i].toLowerCase();
    if ((w === "at" || w === "for") && i + 1 < words.length) {
      const num = resolveNumber(words[i + 1].replace(/[₹,]/g, ""));
      if (num !== null) {
        usedIndices.add(i);
        usedIndices.add(i + 1);
        if (i + 2 < words.length && PRICE_TRIGGER_WORDS.has(words[i + 2].toLowerCase())) {
          usedIndices.add(i + 2);
        }
        return { price: num, usedIndices };
      }
    }
    if ((w === "rate" || w === "daam" || w === "keemat") && i + 1 < words.length) {
      const num = resolveNumber(words[i + 1].replace(/[₹,]/g, ""));
      if (num !== null) {
        usedIndices.add(i);
        usedIndices.add(i + 1);
        return { price: num, usedIndices };
      }
    }
    if (PRICE_TRIGGER_WORDS.has(w)) {
      if (i > 0) {
        const num = resolveNumber(words[i - 1].replace(/[₹,]/g, ""));
        if (num !== null) {
          usedIndices.add(i - 1);
          usedIndices.add(i);
          return { price: num, usedIndices };
        }
      }
    }
    if (w.startsWith("₹")) {
      const num = resolveNumber(w.slice(1).replace(/,/g, ""));
      if (num !== null) {
        usedIndices.add(i);
        return { price: num, usedIndices };
      }
    }
  }
  return { price: null, usedIndices };
}
function extractCustomerName(words, action, usedIndices) {
  if (action !== "payment") return null;
  for (let i = 0; i < words.length; i++) {
    if (usedIndices.has(i)) continue;
    const w = words[i];
    const lower = w.toLowerCase();
    if (STOPWORDS.has(lower)) continue;
    if (PAYMENT_WORDS.has(lower)) continue;
    if (resolveNumber(lower) !== null) continue;
    if (UNIT_WORDS.has(lower)) continue;
    if (PRICE_TRIGGER_WORDS.has(lower)) continue;
    return w.charAt(0).toUpperCase() + w.slice(1);
  }
  return null;
}
function extractItemName(words, action, usedIndices) {
  if (action === "payment") return null;
  const nameWords = [];
  for (let i = 0; i < words.length; i++) {
    if (usedIndices.has(i)) continue;
    const lower = words[i].toLowerCase();
    if (STOPWORDS.has(lower)) continue;
    if (UNIT_WORDS.has(lower)) continue;
    if (ADD_WORDS.has(lower)) continue;
    if (SELL_WORDS.has(lower)) continue;
    if (PRICE_TRIGGER_WORDS.has(lower)) continue;
    if (resolveNumber(lower) !== null) continue;
    nameWords.push(
      words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase()
    );
  }
  if (nameWords.length === 0) return null;
  return nameWords.join(" ");
}
function parseVoiceCommand(text) {
  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/).filter(Boolean);
  const action = detectAction(words);
  const {
    quantity,
    unit,
    usedIndices: qtyIndices
  } = extractQuantityAndUnit(words);
  const { price, usedIndices: priceIndices } = extractPrice(words);
  const allUsed = /* @__PURE__ */ new Set([...qtyIndices, ...priceIndices]);
  const customerName = extractCustomerName(words, action, allUsed);
  const itemName = extractItemName(words, action, allUsed);
  return {
    action,
    itemName,
    quantity,
    unit,
    price,
    customerName
  };
}
function VoiceInputButton({
  onParsed,
  lang,
  disabled = false,
  className = "",
  compact = false
}) {
  const { t, language } = useLanguage();
  const [showConfirm, setShowConfirm] = reactExports.useState(false);
  const [pendingTranscript, setPendingTranscript] = reactExports.useState("");
  const [pendingParsed, setPendingParsed] = reactExports.useState(
    null
  );
  const [editText, setEditText] = reactExports.useState("");
  const parsedRef = reactExports.useRef(null);
  const voiceLang = lang ?? (language === "hi" ? "hi-IN" : "en-IN");
  const handleVoiceEnd = (transcript2) => {
    if (!transcript2.trim()) return;
    const parsed = parseVoiceCommand(transcript2);
    parsedRef.current = parsed;
    setPendingTranscript(transcript2);
    setPendingParsed(parsed);
    setEditText(transcript2);
    setShowConfirm(true);
  };
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceInput({ lang: voiceLang, onEnd: handleVoiceEnd });
  const liveText = interimTranscript || transcript;
  const handleToggle = () => {
    if (!isSupported || disabled) return;
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };
  const handleConfirm = () => {
    const finalParsed = editText !== pendingTranscript ? parseVoiceCommand(editText) : pendingParsed;
    if (finalParsed) {
      onParsed(finalParsed);
    }
    setShowConfirm(false);
    setPendingTranscript("");
    setPendingParsed(null);
    resetTranscript();
  };
  const handleCancel = () => {
    setShowConfirm(false);
    setPendingTranscript("");
    setPendingParsed(null);
    resetTranscript();
  };
  reactExports.useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => {
    }, 4e3);
    return () => clearTimeout(timer);
  }, [error]);
  if (!isSupported) {
    if (compact) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `relative inline-flex ${className}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          disabled: true,
          title: t("Voice input not supported in this browser"),
          "aria-label": t("Not supported"),
          className: "inline-flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-muted-foreground cursor-not-allowed opacity-50 border border-border",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { size: 16 })
        }
      ) });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `relative inline-flex flex-col items-center gap-1.5 ${className}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              disabled: true,
              title: t("Voice input not supported in this browser"),
              "aria-label": t("Not supported"),
              className: "inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted text-muted-foreground cursor-not-allowed opacity-60 border border-border",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { size: 22 })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-muted-foreground", children: "Voice" })
        ]
      }
    );
  }
  if (compact) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative inline-flex ${className}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: handleToggle,
          disabled,
          "aria-label": isListening ? t("Stop") : t("Voice Input"),
          "data-ocid": "voice.mic_button",
          className: [
            "inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            isListening ? "border-red-400 bg-red-50 text-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.2)] animate-pulse dark:bg-red-950/40" : "border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-primary/60 hover:bg-primary/5 active:scale-95",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          ].join(" "),
          children: isListening ? /* @__PURE__ */ jsxRuntimeExports.jsx(MicOff, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { size: 16 })
        }
      ),
      isListening && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "absolute bottom-full mb-2 right-0 z-50 w-64 rounded-xl border border-border bg-card shadow-lg p-3 flex flex-col gap-2",
          "data-ocid": "voice.listening_panel",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-red-500 animate-pulse" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-foreground", children: t("Listening...") })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: stopListening,
                  className: "text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 rounded border border-border",
                  "data-ocid": "voice.stop_button",
                  children: t("Stop")
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground min-h-[1.5rem] leading-relaxed break-words", children: liveText || t("Speak now...") })
          ]
        }
      ),
      error && !isListening && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-full mb-2 right-0 z-50 w-60 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-xs p-2 shadow", children: error }),
      showConfirm && pendingParsed && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4",
          "data-ocid": "voice.confirm_dialog",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-2xl border border-border bg-card shadow-xl p-5 flex flex-col gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-foreground text-sm", children: t("Confirm Voice Input") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: handleCancel,
                  "aria-label": "Close",
                  className: "text-muted-foreground hover:text-foreground",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 16 })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-muted/50 p-3 flex flex-col gap-1.5 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground font-medium mb-1", children: [
                t("Detected"),
                ":"
              ] }),
              pendingParsed.action !== "unknown" && /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Action", value: pendingParsed.action }),
              pendingParsed.itemName && /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Item", value: pendingParsed.itemName }),
              pendingParsed.quantity !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Row,
                {
                  label: "Quantity",
                  value: `${pendingParsed.quantity}${pendingParsed.unit ? ` ${pendingParsed.unit}` : ""}`
                }
              ),
              pendingParsed.price !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Price", value: `₹${pendingParsed.price}` }),
              pendingParsed.customerName && /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Customer", value: pendingParsed.customerName })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "label",
                {
                  htmlFor: "voice-edit-transcript-compact",
                  className: "text-xs text-muted-foreground",
                  children: [
                    t("Edit and confirm"),
                    ":"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "textarea",
                {
                  id: "voice-edit-transcript-compact",
                  className: "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary",
                  rows: 2,
                  value: editText,
                  onChange: (e) => setEditText(e.target.value),
                  "data-ocid": "voice.edit_transcript"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  onClick: handleCancel,
                  className: "flex-1",
                  "data-ocid": "voice.cancel_button",
                  children: t("Cancel")
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  onClick: handleConfirm,
                  className: "flex-1",
                  "data-ocid": "voice.confirm_button",
                  children: t("Confirm")
                }
              )
            ] })
          ] })
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `relative inline-flex flex-col items-center gap-1.5 ${className}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: handleToggle,
            disabled,
            "aria-label": isListening ? t("Stop") : t("Voice Input"),
            "data-ocid": "voice.mic_button",
            className: [
              "inline-flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isListening ? "bg-red-500 text-white shadow-[0_0_0_4px_rgba(239,68,68,0.25)] animate-pulse" : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-md",
              disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            ].join(" "),
            children: isListening ? /* @__PURE__ */ jsxRuntimeExports.jsx(MicOff, { size: 22 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { size: 22 })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-primary select-none", children: isListening ? t("Stop") : "Voice" }),
        isListening && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "absolute bottom-full mb-2 right-0 z-50 w-64 rounded-xl border border-border bg-card shadow-lg p-3 flex flex-col gap-2",
            "data-ocid": "voice.listening_panel",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-red-500 animate-pulse" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-foreground", children: t("Listening...") })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: stopListening,
                    className: "text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 rounded border border-border",
                    "data-ocid": "voice.stop_button",
                    children: t("Stop")
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground min-h-[1.5rem] leading-relaxed break-words", children: liveText || t("Speak now...") })
            ]
          }
        ),
        error && !isListening && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-full mb-2 right-0 z-50 w-60 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-xs p-2 shadow", children: error }),
        showConfirm && pendingParsed && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4",
            "data-ocid": "voice.confirm_dialog",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-2xl border border-border bg-card shadow-xl p-5 flex flex-col gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-foreground text-sm", children: t("Confirm Voice Input") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: handleCancel,
                    "aria-label": "Close",
                    className: "text-muted-foreground hover:text-foreground",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 16 })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-muted/50 p-3 flex flex-col gap-1.5 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground font-medium mb-1", children: [
                  t("Detected"),
                  ":"
                ] }),
                pendingParsed.action !== "unknown" && /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Action", value: pendingParsed.action }),
                pendingParsed.itemName && /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Item", value: pendingParsed.itemName }),
                pendingParsed.quantity !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Row,
                  {
                    label: "Quantity",
                    value: `${pendingParsed.quantity}${pendingParsed.unit ? ` ${pendingParsed.unit}` : ""}`
                  }
                ),
                pendingParsed.price !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Price", value: `₹${pendingParsed.price}` }),
                pendingParsed.customerName && /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Customer", value: pendingParsed.customerName })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "label",
                  {
                    htmlFor: "voice-edit-transcript",
                    className: "text-xs text-muted-foreground",
                    children: [
                      t("Edit and confirm"),
                      ":"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "textarea",
                  {
                    id: "voice-edit-transcript",
                    className: "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary",
                    rows: 2,
                    value: editText,
                    onChange: (e) => setEditText(e.target.value),
                    "data-ocid": "voice.edit_transcript"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "outline",
                    size: "sm",
                    onClick: handleCancel,
                    className: "flex-1",
                    "data-ocid": "voice.cancel_button",
                    children: t("Cancel")
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    onClick: handleConfirm,
                    className: "flex-1",
                    "data-ocid": "voice.confirm_button",
                    children: t("Confirm")
                  }
                )
              ] })
            ] })
          }
        )
      ]
    }
  );
}
function Row({ label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground w-16 shrink-0", children: [
      label,
      ":"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium", children: value })
  ] });
}
export {
  VoiceInputButton as V
};
