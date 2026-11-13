"use client";

import * as React from "react";
import { GripVertical } from "lucide-react";
import { partyStyle } from "@/lib/data";
import { GUESTS_BY_ID } from "@/lib/plan";
import { usePlan } from "@/components/plan-provider";

export type DropTarget =
  | { kind: "seat"; tableId: string; index: number }
  | { kind: "table"; tableId: string }
  | { kind: "unseat" };

interface DragContextValue {
  dragId: string | null;
  over: DropTarget | null;
  onPointerDown: (e: React.PointerEvent, guestId: string) => void;
}

const DragContext = React.createContext<DragContextValue>({
  dragId: null,
  over: null,
  onPointerDown: () => {},
});

export function useDrag(): DragContextValue {
  return React.useContext(DragContext);
}

function readTarget(x: number, y: number): DropTarget | null {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;
  const hit = el.closest<HTMLElement>("[data-drop]");
  if (!hit) return null;
  const kind = hit.dataset.drop;
  if (kind === "seat") {
    return {
      kind: "seat",
      tableId: hit.dataset.table ?? "",
      index: Number(hit.dataset.seat ?? 0),
    };
  }
  if (kind === "table") return { kind: "table", tableId: hit.dataset.table ?? "" };
  if (kind === "unseat") return { kind: "unseat" };
  return null;
}

/** Pointer-based drag and drop: works with mouse, pen and touch. */
export function DragProvider({ children }: { children: React.ReactNode }) {
  const { seat, unseat } = usePlan();
  const [ghost, setGhost] = React.useState<{ id: string; x: number; y: number } | null>(null);
  const [over, setOver] = React.useState<DropTarget | null>(null);

  const actions = React.useRef({ seat, unseat });
  React.useEffect(() => {
    actions.current = { seat, unseat };
  }, [seat, unseat]);

  const onPointerDown = React.useCallback((e: React.PointerEvent, guestId: string) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const startX = e.clientX;
    const startY = e.clientY;
    let active = false;

    const move = (ev: PointerEvent) => {
      if (!active) {
        if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < 6) return;
        active = true;
        document.body.classList.add("is-dragging");
      }
      setGhost({ id: guestId, x: ev.clientX, y: ev.clientY });
      setOver(readTarget(ev.clientX, ev.clientY));
    };

    const finish = (ev: PointerEvent, drop: boolean) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      if (!active) return;
      document.body.classList.remove("is-dragging");
      const target = drop ? readTarget(ev.clientX, ev.clientY) : null;
      setGhost(null);
      setOver(null);
      // The browser fires a click after the pointer is released; swallow it.
      const swallow = (c: Event) => {
        c.stopPropagation();
        c.preventDefault();
      };
      window.addEventListener("click", swallow, { capture: true, once: true });
      window.setTimeout(() => window.removeEventListener("click", swallow, true), 80);
      if (!target) return;
      if (target.kind === "seat") actions.current.seat(guestId, target.tableId, target.index);
      else if (target.kind === "table") actions.current.seat(guestId, target.tableId);
      else actions.current.unseat(guestId);
    };
    const up = (ev: PointerEvent) => finish(ev, true);
    const cancel = (ev: PointerEvent) => finish(ev, false);

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
  }, []);

  const value = React.useMemo<DragContextValue>(
    () => ({ dragId: ghost?.id ?? null, over, onPointerDown }),
    [ghost?.id, over, onPointerDown],
  );

  const ghostGuest = ghost ? GUESTS_BY_ID[ghost.id] : undefined;

  return (
    <DragContext.Provider value={value}>
      {children}
      {ghost && ghostGuest ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-[100] flex items-center gap-1.5 rounded-full border-2 bg-card px-3 py-1.5 text-sm font-medium shadow-lg"
          style={{
            left: ghost.x,
            top: ghost.y,
            transform: "translate(14px, -50%)",
            ...partyStyle(ghostGuest.party),
          }}
        >
          <GripVertical className="size-3.5 opacity-60" />
          {ghostGuest.name}
        </div>
      ) : null}
    </DragContext.Provider>
  );
}
