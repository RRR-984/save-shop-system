// Version check — must run before any React code
const APP_VERSION = "v221";
if (localStorage.getItem("app_version") !== APP_VERSION) {
  localStorage.setItem("app_version", APP_VERSION);
  window.location.reload();
}

import { InternetIdentityProvider } from "@caffeineai/core-infrastructure";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <InternetIdentityProvider>
        <App />
      </InternetIdentityProvider>
    </QueryClientProvider>
  </ErrorBoundary>,
);

// Hide splash screen: listen for 'app-ready' event from App.tsx, with a
// 1500ms safety-net timeout — whichever fires first hides the splash.
function hideSplash() {
  const splash = document.getElementById("splash-screen");
  if (splash) splash.style.display = "none";
}

let splashHidden = false;
const hideSplashOnce = () => {
  if (splashHidden) return;
  splashHidden = true;
  hideSplash();
};

window.addEventListener("app-ready", hideSplashOnce, { once: true });
setTimeout(hideSplashOnce, 1500);

// Register service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // If a new SW is already waiting, activate it immediately
        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }
        // When a new SW installs and starts waiting, tell it to skip waiting
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              newWorker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      })
      .catch(() => {
        /* SW registration failed silently */
      });

    // When the SW controller changes (new SW took over), reload to get fresh assets
    let reloadPending = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloadPending) return;
      reloadPending = true;
      window.location.reload();
    });
  });

  // Periodic version check every 60 seconds
  const startVersionPolling = () => {
    setInterval(async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { version?: string };
        if (data.version && data.version !== APP_VERSION) {
          showUpdateBanner();
        }
      } catch {
        // Silently ignore — version file may not exist or network is offline
      }
    }, 60_000);
  };

  const showUpdateBanner = (() => {
    let shown = false;
    return () => {
      if (shown) return;
      shown = true;
      const banner = document.createElement("div");
      banner.id = "update-banner";
      banner.setAttribute("role", "status");
      banner.setAttribute("aria-live", "polite");
      banner.style.cssText = [
        "position:fixed",
        "bottom:16px",
        "left:50%",
        "transform:translateX(-50%)",
        "z-index:99999",
        "background:#4f46e5",
        "color:#fff",
        "padding:10px 20px",
        "border-radius:8px",
        "font-family:system-ui,-apple-system,sans-serif",
        "font-size:14px",
        "font-weight:600",
        "box-shadow:0 4px 16px rgba(0,0,0,0.2)",
        "display:flex",
        "align-items:center",
        "gap:8px",
        "white-space:nowrap",
        "pointer-events:none",
      ].join(";");
      banner.textContent = "\u21BB New version available — updating...";
      document.body.appendChild(banner);
      setTimeout(() => {
        window.location.reload();
      }, 2_000);
    };
  })();

  startVersionPolling();
}
