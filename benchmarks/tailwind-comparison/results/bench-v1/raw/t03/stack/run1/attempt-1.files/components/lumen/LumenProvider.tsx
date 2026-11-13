"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type LumenContextValue = {
  paletteOpen: boolean;
  openPalette: () => void;
  closePalette: () => void;
  setPaletteOpen: (open: boolean) => void;
  inviteOpen: boolean;
  openInvite: () => void;
  closeInvite: () => void;
  createOpen: boolean;
  openCreate: () => void;
  closeCreate: () => void;
};

const LumenContext = createContext<LumenContextValue | undefined>(undefined);

export function LumenProvider({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const openInvite = useCallback(() => setInviteOpen(true), []);
  const closeInvite = useCallback(() => setInviteOpen(false), []);
  const openCreate = useCallback(() => setCreateOpen(true), []);
  const closeCreate = useCallback(() => setCreateOpen(false), []);

  const value = useMemo<LumenContextValue>(
    () => ({
      paletteOpen,
      openPalette,
      closePalette,
      setPaletteOpen,
      inviteOpen,
      openInvite,
      closeInvite,
      createOpen,
      openCreate,
      closeCreate,
    }),
    [
      paletteOpen,
      openPalette,
      closePalette,
      inviteOpen,
      openInvite,
      closeInvite,
      createOpen,
      openCreate,
      closeCreate,
    ],
  );

  return <LumenContext.Provider value={value}>{children}</LumenContext.Provider>;
}

export function useLumen(): LumenContextValue {
  const ctx = useContext(LumenContext);
  if (!ctx) throw new Error("useLumen must be used within a LumenProvider");
  return ctx;
}
