/**
 * useSessionHeartbeat — keeps the session alive and auto-logs out on idle.
 *
 * Behaviour:
 *  - Tracks user activity via mouse, keyboard, and touch events
 *  - If no activity for 15 minutes: calls logout(), clears auth state,
 *    shows a "Session expired" toast, and calls the onExpired callback
 *  - Guards against race conditions with an isLoggingOut flag
 *  - Respects the concurrency feature flag (no-op when disabled)
 *  - Uses a passive idle check every 60 s (no backend call required)
 */

import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { DEFAULT_CONCURRENCY_SETTINGS } from "../types/concurrency";

// ─── Constants ────────────────────────────────────────────────────────────────

const IDLE_TIMEOUT_MS =
  DEFAULT_CONCURRENCY_SETTINGS.sessionIdleTimeoutSeconds * 1000; // 15 min
const CHECK_INTERVAL_MS = 60_000; // check every 60 s

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseSessionHeartbeatOptions {
  /** Called after the session has been expired and logout() invoked. */
  onExpired?: () => void;
  /**
   * Set to false to disable the heartbeat entirely
   * (e.g. when concurrency feature flag is off).
   * Defaults to true.
   */
  enabled?: boolean;
}

export function useSessionHeartbeat({
  onExpired,
  enabled = true,
}: UseSessionHeartbeatOptions = {}): void {
  const { session, logout } = useAuth();

  const lastActivityRef = useRef<number>(Date.now());
  const isLoggingOutRef = useRef<boolean>(false);
  const enabledRef = useRef<boolean>(enabled);
  const onExpiredRef = useRef<typeof onExpired>(onExpired);

  // Keep refs in sync with prop values without re-creating effects
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);
  useEffect(() => {
    onExpiredRef.current = onExpired;
  }, [onExpired]);

  // ── Activity tracker ──────────────────────────────────────────────────────
  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!enabled || !session) return;

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ] as const;
    const opts: AddEventListenerOptions = { passive: true, capture: false };

    for (const evt of events) {
      document.addEventListener(evt, handleActivity, opts);
    }
    return () => {
      for (const evt of events) {
        document.removeEventListener(evt, handleActivity, opts);
      }
    };
  }, [enabled, session, handleActivity]);

  // ── Idle check interval ───────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !session) return;

    const interval = setInterval(() => {
      if (isLoggingOutRef.current) return;
      if (!enabledRef.current) return;

      const idleMs = Date.now() - lastActivityRef.current;
      if (idleMs >= IDLE_TIMEOUT_MS) {
        isLoggingOutRef.current = true;

        // Clear auth state
        logout();

        // Notify the user — non-dismissible for 6 s so they see it
        toast.warning("Session expired. Please log in again.", {
          duration: 6000,
          id: "session-expired-toast",
        });

        // Invoke callback (used by App to redirect to login)
        onExpiredRef.current?.();

        // Reset the flag so a re-mount can track a new session
        isLoggingOutRef.current = false;
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [enabled, session, logout]);

  // ── Reset activity timestamp on new session ───────────────────────────────
  useEffect(() => {
    if (session) {
      lastActivityRef.current = Date.now();
      isLoggingOutRef.current = false;
    }
  }, [session]);
}
