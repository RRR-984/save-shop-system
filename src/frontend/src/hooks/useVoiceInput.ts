import { useCallback, useEffect, useRef, useState } from "react";

export interface VoiceInputOptions {
  lang?: string;
  onEnd?: (transcript: string) => void;
}

interface UseVoiceInputReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// Minimal type declarations for Web Speech API (not in all TS DOM libs)
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((event: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useVoiceInput(
  options: VoiceInputOptions = {},
): UseVoiceInputReturn {
  const { lang = "en-IN", onEnd } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const SpeechRecognitionAPI = getSpeechRecognition();
  const isSupported = !!SpeechRecognitionAPI;

  const recognizerRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef("");
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  const stopListening = useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
  }, []);

  const startListening = useCallback(() => {
    const API = getSpeechRecognition();
    if (!API) {
      setError("Voice input is not supported in this browser");
      return;
    }
    // Stop any existing session
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

    recognizer.onresult = (event: SpeechRecognitionEvent) => {
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

    recognizer.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMessages: Record<string, string> = {
        "not-allowed": "Microphone permission denied. Please allow mic access.",
        "no-speech": "No speech detected. Please try again.",
        network: "Network error. Check your connection.",
        aborted: "Voice input was cancelled.",
        "audio-capture": "No microphone found.",
        "service-not-allowed": "Voice service not allowed.",
      };
      setError(
        errorMessages[event.error] ?? "Voice input error. Please try again.",
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

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = "";
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
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
    resetTranscript,
  };
}
