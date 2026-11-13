"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

export type DropTarget =
  | { type: "seat"; tableId: string; seat: number }
  | { type: "table"; tableId: string }
  | { type: "unseat" }
  | null;

export interface DragState {
  guestId: string;
  x: number;
  y: number;
  target: DropTarget;
}

export type StartDrag = (e: ReactPointerEvent, guestId: string) => void;

function hitTest(x: number, y: number): DropTarget {
  const stack = document.elementsFromPoint(x, y);
  for (const el of stack) {
    const seat = el.closest<HTMLElement>("[data-seat-table]");
    if (seat?.dataset.seatTable) {
      return { type: "seat", tableId: seat.dataset.seatTable, seat: Number(seat.dataset.seatIndex ?? 0) };
    }
    const table = el.closest<HTMLElement>("[data-drop-table]");
    if (table?.dataset.dropTable) return { type: "table", tableId: table.dataset.dropTable };
    if (el.closest("[data-drop-unseat]")) return { type: "unseat" };
  }
  return null;
}

/**
 * Pointer-based drag and drop for guests (mouse, pen and touch). A drag starts after the pointer
 * has moved a few pixels, so plain taps and clicks keep working.
 */
export function useGuestDrag(onDrop: (guestId: string, target: DropTarget) => void) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const onDropRef = useRef(onDrop);
  useEffect(() => {
    onDropRef.current = onDrop;
  });
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => () => cleanupRef.current?.(), []);

  const startDrag = useCallback<StartDrag>((e, guestId) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    cleanupRef.current?.();
    const startX = e.clientX;
    const startY = e.clientY;
    const pointerId = e.pointerId;
    let active = false;

    const swallowClick = (ev: MouseEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
    };

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      if (!active) {
        if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < 8) return;
        active = true;
        document.body.style.userSelect = "none";
        document.body.style.cursor = "grabbing";
      }
      setDrag({ guestId, x: ev.clientX, y: ev.clientY, target: hitTest(ev.clientX, ev.clientY) });
    };

    const finish = (ev: PointerEvent | null) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      cleanupRef.current = null;
      if (active) {
        setDrag(null);
        window.addEventListener("click", swallowClick, true);
        setTimeout(() => window.removeEventListener("click", swallowClick, true), 60);
        if (ev) onDropRef.current(guestId, hitTest(ev.clientX, ev.clientY));
      }
    };
    const onUp = (ev: PointerEvent) => {
      if (ev.pointerId === pointerId) finish(ev);
    };
    const onCancel = (ev: PointerEvent) => {
      if (ev.pointerId === pointerId) finish(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    cleanupRef.current = () => finish(null);
  }, []);

  return { drag, startDrag };
}
