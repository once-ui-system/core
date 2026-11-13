"use client";

import { useCallback, useSyncExternalStore } from "react";

/** True when the viewport is at least `minPx` wide. Server and first paint assume wide. */
export function useWide(minPx = 1100): boolean {
  const query = `(min-width: ${minPx}px)`;
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => true,
  );
}
