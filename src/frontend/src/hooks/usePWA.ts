import { useCallback, useEffect, useRef, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface UsePWAReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  showInstallPrompt: () => Promise<void>;
  handleInstallDecline: () => void;
}

const PWA_DECLINED_KEY = "pwa_prompt_declined_at";

export default function usePWA(): UsePWAReturn {
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  const isInstalled =
    typeof window !== "undefined" &&
    window.matchMedia("(display-mode: standalone)").matches;

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const standaloneHandler = (e: MediaQueryListEvent) => {
      if (e.matches) setIsInstallable(false);
    };
    mediaQuery.addEventListener("change", standaloneHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      mediaQuery.removeEventListener("change", standaloneHandler);
    };
  }, []);

  const showInstallPrompt = useCallback(async () => {
    const prompt = deferredPromptRef.current;
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      deferredPromptRef.current = null;
      setIsInstallable(false);
    }
  }, []);

  const handleInstallDecline = useCallback(() => {
    localStorage.setItem(PWA_DECLINED_KEY, String(Date.now()));
  }, []);

  return {
    isInstallable,
    isInstalled,
    showInstallPrompt,
    handleInstallDecline,
  };
}
