import { useEffect, useRef, useState } from "react";

export type SyncStatus = "online" | "offline" | "sync_pending" | "syncing";

export interface NetworkStatus {
  isOnline: boolean;
  syncStatus: SyncStatus;
  setSyncStatus: (s: SyncStatus) => void;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [syncStatus, setSyncStatusState] = useState<SyncStatus>(() =>
    navigator.onLine ? "online" : "offline",
  );
  const prevOnline = useRef(isOnline);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // only flip to 'online' if we weren't already syncing/pending
      setSyncStatusState((prev) =>
        prev === "offline" ? "sync_pending" : prev,
      );
      prevOnline.current = true;
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatusState("offline");
      prevOnline.current = false;
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const setSyncStatus = (s: SyncStatus) => setSyncStatusState(s);

  return { isOnline, syncStatus, setSyncStatus };
}
