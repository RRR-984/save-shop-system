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
    navigator.serviceWorker.register("/sw.js").catch(console.error);
  });
}
