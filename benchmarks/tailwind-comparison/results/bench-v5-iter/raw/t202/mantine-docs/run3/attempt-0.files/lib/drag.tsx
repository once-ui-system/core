"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Avatar, Paper, Text } from "@mantine/core";
import { PARTY_COLORS, initials } from "./data";
import { usePlan } from "./plan";
import { guestById } from "./rules";

export type DropTarget = { kind: "seat"; table: string; seat: number } | { kind: "table"; table: string } | { kind: "tray" };

type Drag = {
  dragging: string | null;
  over: DropTarget | null;
  begin: (e: ReactPointerEvent, guestId: string) => void;
  /** True right after a drag ended, so the click that follows a drop can be ignored. */
  justDragged: () => boolean;
};

const DragContext = createContext<Drag | null>(null);

export function useDrag(): Drag {
  const ctx = useContext(DragContext);
  if (!ctx) throw new Error("useDrag must be used inside DragProvider");
  return ctx;
}

function findTarget(x: number, y: number): DropTarget | null {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;
  const seat = el.closest<HTMLElement>("[data-drop-seat]");
  if (seat?.dataset.dropTable !== undefined && seat.dataset.dropSeat !== undefined) {
    return { kind: "seat", table: seat.dataset.dropTable, seat: Number(seat.dataset.dropSeat) };
  }
  const table = el.closest<HTMLElement>("[data-drop-table]");
  if (table?.dataset.dropTable) return { kind: "table", table: table.dataset.dropTable };
  if (el.closest("[data-drop-tray]")) return { kind: "tray" };
  return null;
}

export function DragProvider({ children }: { children: ReactNode }) {
  const { place, unseat } = usePlan();
  const [ghost, setGhost] = useState<{ guestId: string; x: number; y: number } | null>(null);
  const [over, setOver] = useState<DropTarget | null>(null);
  const dragged = useRef(false);
  const placeRef = useRef(place);
  placeRef.current = place;
  const unseatRef = useRef(unseat);
  unseatRef.current = unseat;

  const begin = useCallback((e: ReactPointerEvent, guestId: string) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const pointerId = e.pointerId;
    const touch = e.pointerType === "touch";
    const startX = e.clientX;
    const startY = e.clientY;
    let active = false;
    let timer: number | undefined;

    const activate = (x: number, y: number) => {
      active = true;
      setGhost({ guestId, x, y });
      setOver(findTarget(x, y));
    };

    const blockScroll = (ev: TouchEvent) => {
      if (active) ev.preventDefault();
    };

    const cleanup = () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("touchmove", blockScroll);
      setGhost(null);
      setOver(null);
    };

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      const moved = Math.hypot(ev.clientX - startX, ev.clientY - startY);
      if (!active) {
        if (touch) {
          if (moved > 10) cleanup();
          return;
        }
        if (moved < 5) return;
        activate(ev.clientX, ev.clientY);
        return;
      }
      setGhost({ guestId, x: ev.clientX, y: ev.clientY });
      setOver(findTarget(ev.clientX, ev.clientY));
    };

    const onUp = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      if (active) {
        const target = findTarget(ev.clientX, ev.clientY);
        dragged.current = true;
        window.setTimeout(() => {
          dragged.current = false;
        }, 60);
        if (target?.kind === "seat") placeRef.current(guestId, target.table, target.seat);
        else if (target?.kind === "table") placeRef.current(guestId, target.table);
        else if (target?.kind === "tray") unseatRef.current(guestId);
      }
      cleanup();
    };

    const onCancel = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      cleanup();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("touchmove", blockScroll, { passive: false });
    if (touch) timer = window.setTimeout(() => activate(startX, startY), 220);
  }, []);

  const justDragged = useCallback(() => dragged.current, []);

  const value = useMemo<Drag>(
    () => ({ dragging: ghost?.guestId ?? null, over, begin, justDragged }),
    [ghost?.guestId, over, begin, justDragged],
  );

  const guest = ghost ? guestById.get(ghost.guestId) : undefined;

  return (
    <DragContext.Provider value={value}>
      {children}
      {ghost && guest ? (
        <Paper
          shadow="lg"
          radius="xl"
          withBorder
          px="sm"
          py={4}
          aria-hidden
          style={{
            position: "fixed",
            left: ghost.x + 12,
            top: ghost.y + 12,
            zIndex: 1000,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Avatar size="sm" radius="xl" color={PARTY_COLORS[guest.party] ?? "gray"}>
            {initials(guest.name)}
          </Avatar>
          <Text size="sm" fw={600}>
            {guest.name}
          </Text>
        </Paper>
      ) : null}
    </DragContext.Provider>
  );
}
