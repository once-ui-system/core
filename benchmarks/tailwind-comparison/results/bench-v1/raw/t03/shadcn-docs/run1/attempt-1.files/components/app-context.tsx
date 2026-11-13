"use client";

import * as React from "react";

interface AppActions {
  openPalette: () => void;
  openInvite: () => void;
  openCreateProject: () => void;
}

const AppContext = React.createContext<AppActions | null>(null);

export const AppProvider = AppContext.Provider;

export function useAppActions(): AppActions {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error("useAppActions must be used inside <AppShell>");
  return ctx;
}
