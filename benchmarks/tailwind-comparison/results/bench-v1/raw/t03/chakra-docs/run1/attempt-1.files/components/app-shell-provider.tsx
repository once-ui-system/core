"use client";

import * as React from "react";

interface AppShellContextValue {
  paletteOpen: boolean;
  openPalette: () => void;
  closePalette: () => void;
  setPaletteOpen: (open: boolean) => void;
  inviteOpen: boolean;
  openInvite: () => void;
  setInviteOpen: (open: boolean) => void;
}

const AppShellContext = React.createContext<AppShellContextValue | null>(null);

export function AppShellProvider({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [inviteOpen, setInviteOpen] = React.useState(false);

  const openPalette = React.useCallback(() => setPaletteOpen(true), []);
  const closePalette = React.useCallback(() => setPaletteOpen(false), []);
  const openInvite = React.useCallback(() => setInviteOpen(true), []);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey) && !event.altKey) {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = React.useMemo<AppShellContextValue>(
    () => ({
      paletteOpen,
      openPalette,
      closePalette,
      setPaletteOpen,
      inviteOpen,
      openInvite,
      setInviteOpen,
    }),
    [paletteOpen, openPalette, closePalette, inviteOpen, openInvite],
  );

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>;
}

export function useAppShell(): AppShellContextValue {
  const ctx = React.useContext(AppShellContext);
  if (!ctx) throw new Error("useAppShell must be used within AppShellProvider");
  return ctx;
}
