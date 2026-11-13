"use client";

import { useSyncExternalStore } from "react";

// Module-level store so the collapsed state survives the shell being
// remounted when navigating between "/" and the (app) route group.
let collapsed = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return collapsed;
}

function getServerSnapshot() {
  return false;
}

export function setSidebarCollapsed(value: boolean) {
  collapsed = value;
  listeners.forEach((l) => l());
}

export function useSidebarCollapsed(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
