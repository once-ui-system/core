"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Returns false during server render and the hydration pass, then true.
 * Used to defer client-only widgets (tooltips, drawer) so the first client
 * render matches the server HTML exactly.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
