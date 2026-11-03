"use client";

import { createContext, useContext } from "react";

export interface FrameActions {
  openInvite: () => void;
  openCreateProject: () => void;
  toggleTheme: () => void;
}

export const FrameActionsContext = createContext<FrameActions | null>(null);

export function useFrameActions(): FrameActions {
  const ctx = useContext(FrameActionsContext);
  if (!ctx) throw new Error("useFrameActions must be used inside AppFrame");
  return ctx;
}
