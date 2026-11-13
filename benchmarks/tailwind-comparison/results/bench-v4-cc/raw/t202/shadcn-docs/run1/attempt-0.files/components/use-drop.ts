"use client";

import { useState, type DragEvent } from "react";

export const GUEST_MIME = "application/x-seatwise-guest";

export function startGuestDrag(e: DragEvent<HTMLElement>, guestId: string) {
  e.dataTransfer.setData(GUEST_MIME, guestId);
  e.dataTransfer.setData("text/plain", guestId);
  e.dataTransfer.effectAllowed = "move";
}

export function useGuestDrop(onDropGuest: (guestId: string) => void) {
  const [over, setOver] = useState(false);
  const has = (e: DragEvent<HTMLElement>) => Array.from(e.dataTransfer.types).includes(GUEST_MIME);
  const props = {
    onDragEnter: (e: DragEvent<HTMLElement>) => {
      if (!has(e)) return;
      e.preventDefault();
      e.stopPropagation();
      setOver(true);
    },
    onDragOver: (e: DragEvent<HTMLElement>) => {
      if (!has(e)) return;
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";
      setOver(true);
    },
    onDragLeave: (e: DragEvent<HTMLElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
    },
    onDrop: (e: DragEvent<HTMLElement>) => {
      const id = e.dataTransfer.getData(GUEST_MIME);
      setOver(false);
      if (!id) return;
      e.preventDefault();
      e.stopPropagation();
      onDropGuest(id);
    },
  };
  return { over, props };
}
