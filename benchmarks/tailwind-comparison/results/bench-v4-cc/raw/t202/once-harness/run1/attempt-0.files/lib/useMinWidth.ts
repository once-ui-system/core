"use client";

import { useCallback, useSyncExternalStore } from "react";

export function useMinWidth(px: number): boolean {
  const subscribe = useCallback(
    (cb: () => void) => {
      const mq = window.matchMedia(`(min-width: ${px}px)`);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    [px],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(`(min-width: ${px}px)`).matches,
    () => false,
  );
}
