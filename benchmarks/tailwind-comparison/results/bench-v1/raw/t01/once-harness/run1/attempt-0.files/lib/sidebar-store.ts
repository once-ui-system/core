"use client";

import { useSyncExternalStore } from "react";

// A tiny store so the collapsed state survives navigation between routes whose
// layouts each mount the shell.
let collapsed = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setSidebarCollapsed(next: boolean) {
  collapsed = next;
  listeners.forEach((l) => l());
}

export function useSidebarCollapsed(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => collapsed,
    () => false,
  );
}
