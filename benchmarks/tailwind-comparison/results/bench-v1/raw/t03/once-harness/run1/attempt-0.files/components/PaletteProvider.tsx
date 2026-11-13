"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type PaletteContextValue = {
  paletteOpen: boolean;
  openPalette: () => void;
  closePalette: () => void;
  togglePalette: () => void;
  inviteOpen: boolean;
  openInvite: () => void;
  closeInvite: () => void;
};

const PaletteContext = createContext<PaletteContextValue | null>(null);

export function PaletteProvider({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const togglePalette = useCallback(() => setPaletteOpen((open) => !open), []);
  const openInvite = useCallback(() => setInviteOpen(true), []);
  const closeInvite = useCallback(() => setInviteOpen(false), []);

  const value = useMemo(
    () => ({ paletteOpen, openPalette, closePalette, togglePalette, inviteOpen, openInvite, closeInvite }),
    [paletteOpen, openPalette, closePalette, togglePalette, inviteOpen, openInvite, closeInvite],
  );

  return <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>;
}

export function usePalette(): PaletteContextValue {
  const ctx = useContext(PaletteContext);
  if (!ctx) throw new Error("usePalette must be used inside <PaletteProvider>");
  return ctx;
}
