import { Button } from "@/components/ui/button";
import { Mic, MicOff, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useVoiceInput } from "../hooks/useVoiceInput";
import type { ParsedVoiceCommand } from "../utils/voiceParser";
import { parseVoiceCommand } from "../utils/voiceParser";

interface VoiceInputButtonProps {
  onParsed: (parsed: ParsedVoiceCommand) => void;
  lang?: string;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
}

export function VoiceInputButton({
  onParsed,
  lang,
  disabled = false,
  className = "",
  compact = false,
}: VoiceInputButtonProps) {
  const { t, language } = useLanguage();
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingTranscript, setPendingTranscript] = useState("");
  const [pendingParsed, setPendingParsed] = useState<ParsedVoiceCommand | null>(
    null,
  );
  const [editText, setEditText] = useState("");
  const parsedRef = useRef<ParsedVoiceCommand | null>(null);

  const voiceLang = lang ?? (language === "hi" ? "hi-IN" : "en-IN");

  const handleVoiceEnd = (transcript: string) => {
    if (!transcript.trim()) return;
    const parsed = parseVoiceCommand(transcript);
    parsedRef.current = parsed;
    setPendingTranscript(transcript);
    setPendingParsed(parsed);
    setEditText(transcript);
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
    resetTranscript,
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
    // Re-parse from edited text if changed
    const finalParsed =
      editText !== pendingTranscript
        ? parseVoiceCommand(editText)
        : pendingParsed;
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

  // Auto-dismiss error after 4s
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => {}, 4000);
    return () => clearTimeout(timer);
  }, [error]);

  if (!isSupported) {
    if (compact) {
      return (
        <div className={`relative inline-flex ${className}`}>
          <button
            type="button"
            disabled
            title={t("Voice input not supported in this browser")}
            aria-label={t("Not supported")}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-muted-foreground cursor-not-allowed opacity-50 border border-border"
          >
            <Mic size={16} />
          </button>
        </div>
      );
    }
    return (
      <div
        className={`relative inline-flex flex-col items-center gap-1.5 ${className}`}
      >
        <button
          type="button"
          disabled
          title={t("Voice input not supported in this browser")}
          aria-label={t("Not supported")}
          className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted text-muted-foreground cursor-not-allowed opacity-60 border border-border"
        >
          <Mic size={22} />
        </button>
        <span className="text-xs font-semibold text-muted-foreground">
          Voice
        </span>
      </div>
    );
  }

  /* ── Compact mode: small inline icon-only button ── */
  if (compact) {
    return (
      <div className={`relative inline-flex ${className}`}>
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          aria-label={isListening ? t("Stop") : t("Voice Input")}
          data-ocid="voice.mic_button"
          className={[
            "inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            isListening
              ? "border-red-400 bg-red-50 text-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.2)] animate-pulse dark:bg-red-950/40"
              : "border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-primary/60 hover:bg-primary/5 active:scale-95",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          ].join(" ")}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        {/* Listening panel — positioned above the button */}
        {isListening && (
          <div
            className="absolute bottom-full mb-2 right-0 z-50 w-64 rounded-xl border border-border bg-card shadow-lg p-3 flex flex-col gap-2"
            data-ocid="voice.listening_panel"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-medium text-foreground">
                  {t("Listening...")}
                </span>
              </div>
              <button
                type="button"
                onClick={stopListening}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 rounded border border-border"
                data-ocid="voice.stop_button"
              >
                {t("Stop")}
              </button>
            </div>
            <p className="text-xs text-muted-foreground min-h-[1.5rem] leading-relaxed break-words">
              {liveText || t("Speak now...")}
            </p>
          </div>
        )}

        {/* Error tooltip */}
        {error && !isListening && (
          <div className="absolute bottom-full mb-2 right-0 z-50 w-60 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-xs p-2 shadow">
            {error}
          </div>
        )}

        {/* Confirm dialog */}
        {showConfirm && pendingParsed && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            data-ocid="voice.confirm_dialog"
          >
            <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground text-sm">
                  {t("Confirm Voice Input")}
                </h3>
                <button
                  type="button"
                  onClick={handleCancel}
                  aria-label="Close"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="rounded-xl bg-muted/50 p-3 flex flex-col gap-1.5 text-xs">
                <p className="text-muted-foreground font-medium mb-1">
                  {t("Detected")}:
                </p>
                {pendingParsed.action !== "unknown" && (
                  <Row label="Action" value={pendingParsed.action} />
                )}
                {pendingParsed.itemName && (
                  <Row label="Item" value={pendingParsed.itemName} />
                )}
                {pendingParsed.quantity !== null && (
                  <Row
                    label="Quantity"
                    value={`${pendingParsed.quantity}${pendingParsed.unit ? ` ${pendingParsed.unit}` : ""}`}
                  />
                )}
                {pendingParsed.price !== null && (
                  <Row label="Price" value={`₹${pendingParsed.price}`} />
                )}
                {pendingParsed.customerName && (
                  <Row label="Customer" value={pendingParsed.customerName} />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="voice-edit-transcript-compact"
                  className="text-xs text-muted-foreground"
                >
                  {t("Edit and confirm")}:
                </label>
                <textarea
                  id="voice-edit-transcript-compact"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={2}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  data-ocid="voice.edit_transcript"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="flex-1"
                  data-ocid="voice.cancel_button"
                >
                  {t("Cancel")}
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirm}
                  className="flex-1"
                  data-ocid="voice.confirm_button"
                >
                  {t("Confirm")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Default (non-compact) mode ── */
  return (
    <div
      className={`relative inline-flex flex-col items-center gap-1.5 ${className}`}
    >
      {/* Mic button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-label={isListening ? t("Stop") : t("Voice Input")}
        data-ocid="voice.mic_button"
        className={[
          "inline-flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          isListening
            ? "bg-red-500 text-white shadow-[0_0_0_4px_rgba(239,68,68,0.25)] animate-pulse"
            : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-md",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
      >
        {isListening ? <MicOff size={22} /> : <Mic size={22} />}
      </button>
      <span className="text-xs font-semibold text-primary select-none">
        {isListening ? t("Stop") : "Voice"}
      </span>

      {/* Listening panel */}
      {isListening && (
        <div
          className="absolute bottom-full mb-2 right-0 z-50 w-64 rounded-xl border border-border bg-card shadow-lg p-3 flex flex-col gap-2"
          data-ocid="voice.listening_panel"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-medium text-foreground">
                {t("Listening...")}
              </span>
            </div>
            <button
              type="button"
              onClick={stopListening}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 rounded border border-border"
              data-ocid="voice.stop_button"
            >
              {t("Stop")}
            </button>
          </div>
          <p className="text-xs text-muted-foreground min-h-[1.5rem] leading-relaxed break-words">
            {liveText || t("Speak now...")}
          </p>
        </div>
      )}

      {/* Error tooltip */}
      {error && !isListening && (
        <div className="absolute bottom-full mb-2 right-0 z-50 w-60 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-xs p-2 shadow">
          {error}
        </div>
      )}

      {/* Confirm dialog */}
      {showConfirm && pendingParsed && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          data-ocid="voice.confirm_dialog"
        >
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm">
                {t("Confirm Voice Input")}
              </h3>
              <button
                type="button"
                onClick={handleCancel}
                aria-label="Close"
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            {/* Detected fields summary */}
            <div className="rounded-xl bg-muted/50 p-3 flex flex-col gap-1.5 text-xs">
              <p className="text-muted-foreground font-medium mb-1">
                {t("Detected")}:
              </p>
              {pendingParsed.action !== "unknown" && (
                <Row label="Action" value={pendingParsed.action} />
              )}
              {pendingParsed.itemName && (
                <Row label="Item" value={pendingParsed.itemName} />
              )}
              {pendingParsed.quantity !== null && (
                <Row
                  label="Quantity"
                  value={`${pendingParsed.quantity}${pendingParsed.unit ? ` ${pendingParsed.unit}` : ""}`}
                />
              )}
              {pendingParsed.price !== null && (
                <Row label="Price" value={`₹${pendingParsed.price}`} />
              )}
              {pendingParsed.customerName && (
                <Row label="Customer" value={pendingParsed.customerName} />
              )}
            </div>

            {/* Editable transcript */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="voice-edit-transcript"
                className="text-xs text-muted-foreground"
              >
                {t("Edit and confirm")}:
              </label>
              <textarea
                id="voice-edit-transcript"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={2}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                data-ocid="voice.edit_transcript"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="flex-1"
                data-ocid="voice.cancel_button"
              >
                {t("Cancel")}
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                className="flex-1"
                data-ocid="voice.confirm_button"
              >
                {t("Confirm")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground w-16 shrink-0">{label}:</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}
