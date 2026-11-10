import type { PointerEvent as ReactPointerEvent } from "react";

export type DropTarget =
  | { kind: "seat"; tableId: string; index: number }
  | { kind: "table"; tableId: string }
  | { kind: "tray" };

export interface DragState {
  guestId: string;
  x: number;
  y: number;
}

export type BeginDrag = (e: ReactPointerEvent, guestId: string) => void;
