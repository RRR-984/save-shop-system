import { useCallback, useEffect, useRef, useState } from "react";

export type SyncStatus = "online" | "offline" | "sync_pending" | "syncing";

export interface NetworkStatus {
  isOnline: boolean;
  syncStatus: SyncStatus;
  setSyncStatus: (s: SyncStatus) => void;
  /**
   * Incremented each time connectivity is restored after an offline period.
   * Consumers can watch this value in a useEffect to trigger a full data refetch.
   */
  reconnectCounter: number;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [syncStatus, setSyncStatusState] = useState<SyncStatus>(() =>
    navigator.onLine ? "online" : "offline",
  );
  const [reconnectCounter, setReconnectCounter] = useState(0);
  const prevOnline = useRef(isOnline);

  useEffect(() => {
    const handleOnline = () => {
      const wasOffline = !prevOnline.current;
      setIsOnline(true);
      // only flip to 'online' if we weren't already syncing/pending
      setSyncStatusState((prev) =>
        prev === "offline" ? "sync_pending" : prev,
      );
      prevOnline.current = true;
      // Signal reconnect so consumers can force a full refetch
      if (wasOffline) {
        setReconnectCounter((c) => c + 1);
      }
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

  const setSyncStatus = useCallback(
    (s: SyncStatus) => setSyncStatusState(s),
    [],
  );

  return { isOnline, syncStatus, setSyncStatus, reconnectCounter };
}
