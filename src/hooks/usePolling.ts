"use client";

import { useEffect, useRef } from "react";

/**
 * Re-runs `fn` on an interval while the tab is visible, pausing when it's
 * backgrounded so idle tabs don't hammer the server. `fn` also runs once
 * immediately on mount/dependency change.
 */
export function usePolling(fn: () => void, intervalMs: number, deps: React.DependencyList = []) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    fnRef.current();

    const tick = () => {
      if (document.visibilityState === "visible") fnRef.current();
    };

    const id = setInterval(tick, intervalMs);
    document.addEventListener("visibilitychange", tick);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, ...deps]);
}
