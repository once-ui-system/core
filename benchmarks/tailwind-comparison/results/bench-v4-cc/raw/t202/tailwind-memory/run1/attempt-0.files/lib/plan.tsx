"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { guestById, guests, partyColor, tableById, tables } from "./data";
import { evaluateRules, type RuleResult, type SeatMap } from "./rules";

export type DropTarget =
  | { kind: "seat"; table: string; seat: number }
  | { kind: "table"; table: string }
  | { kind: "unseat" };

type DragState = { guestId: string; x: number; y: number; over: DropTarget | null };

type State = {
  seats: SeatMap;
  selectedTable: string | null;
  holding: string | null;
  notice: string;
};

type Action =
  | { type: "place"; guestId: string; table: string; seat?: number }
  | { type: "unseat"; guestId: string }
  | { type: "hold"; guestId: string | null }
  | { type: "select"; table: string | null };

export const seatKey = (table: string, seat: number) => `${table}:${seat}`;

function occupantsOf(seats: SeatMap): Map<string, string> {
  const m = new Map<string, string>();
  for (const [id, s] of Object.entries(seats)) if (s) m.set(seatKey(s.table, s.seat), id);
  return m;
}

function initState(_: null): State {
  const seats: SeatMap = {};
  const next: Record<string, number> = {};
  for (const gst of guests) {
    if (gst.table && tableById.has(gst.table)) {
      const n = next[gst.table] ?? 0;
      seats[gst.id] = { table: gst.table, seat: n };
      next[gst.table] = n + 1;
    } else {
      seats[gst.id] = null;
    }
  }
  return { seats, selectedTable: null, holding: null, notice: "" };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hold": {
      const gst = action.guestId ? guestById.get(action.guestId) : undefined;
      if (gst && gst.rsvp === "no") {
        return { ...state, holding: null, notice: `${gst.name} has declined, so can't be seated.` };
      }
      return { ...state, holding: action.guestId, notice: "" };
    }
    case "select":
      return { ...state, selectedTable: action.table };
    case "unseat": {
      const gst = guestById.get(action.guestId);
      if (!gst || !state.seats[action.guestId]) return { ...state, holding: null };
      return {
        ...state,
        seats: { ...state.seats, [action.guestId]: null },
        holding: state.holding === action.guestId ? null : state.holding,
        notice: `${gst.name} is no longer seated.`,
      };
    }
    case "place": {
      const gst = guestById.get(action.guestId);
      const tbl = tableById.get(action.table);
      if (!gst || !tbl) return state;
      if (gst.rsvp === "no") {
        return { ...state, holding: null, notice: `${gst.name} has declined, so can't be seated.` };
      }
      const occ = occupantsOf(state.seats);
      const firstFree = () => {
        for (let i = 0; i < tbl.seats; i++) if (!occ.has(seatKey(tbl.id, i))) return i;
        return -1;
      };
      const current = state.seats[gst.id];
      let target = action.seat;
      if (target === undefined) {
        if (current && current.table === tbl.id) {
          return { ...state, holding: null, selectedTable: tbl.id, notice: `${gst.name} is already at ${tbl.name}.` };
        }
        target = firstFree();
        if (target < 0) {
          return { ...state, notice: `${tbl.name} is full. Pick another table or unseat someone first.` };
        }
      }
      const occupantId = occ.get(seatKey(tbl.id, target));
      if (occupantId === gst.id) return { ...state, holding: null, selectedTable: tbl.id, notice: "" };
      const seats = { ...state.seats };
      let notice = `${gst.name} seated at ${tbl.name}, seat ${target + 1}.`;
      if (occupantId) {
        const other = guestById.get(occupantId)?.name ?? "Guest";
        if (current) {
          seats[occupantId] = current;
          notice = `${gst.name} and ${other} swapped seats.`;
        } else {
          const alt = firstFree();
          if (alt >= 0) {
            target = alt;
            notice = `${gst.name} seated at ${tbl.name}, seat ${alt + 1} (that seat was taken).`;
          } else {
            seats[occupantId] = null;
            notice = `${gst.name} took ${other}'s seat at ${tbl.name}; ${other} is now unseated.`;
          }
        }
      }
      seats[gst.id] = { table: tbl.id, seat: target };
      return { ...state, seats, holding: null, selectedTable: tbl.id, notice };
    }
    default:
      return state;
  }
}

function targetAt(x: number, y: number): DropTarget | null {
  const el = document.elementFromPoint(x, y)?.closest("[data-drop]");
  if (!el) return null;
  const kind = el.getAttribute("data-drop");
  const table = el.getAttribute("data-table");
  const seat = el.getAttribute("data-seat");
  if (kind === "unseat") return { kind: "unseat" };
  if (kind === "seat" && table && seat !== null) return { kind: "seat", table, seat: Number(seat) };
  if (kind === "table" && table) return { kind: "table", table };
  return null;
}

export type Counts = {
  confirmed: number;
  seated: number;
  toSeat: number;
  awaiting: number;
  declined: number;
  capacity: number;
};

type PlanContextValue = {
  seats: SeatMap;
  occupants: Map<string, string>;
  filled: Record<string, number>;
  selectedTable: string | null;
  holding: string | null;
  notice: string;
  results: RuleResult[];
  brokenTables: Set<string>;
  brokenGuests: Set<string>;
  counts: Counts;
  place: (guestId: string, table: string, seat?: number) => void;
  unseat: (guestId: string) => void;
  hold: (guestId: string | null) => void;
  select: (table: string | null) => void;
  drag: DragState | null;
  startDrag: (e: ReactPointerEvent, guestId: string) => void;
  consumeClick: () => boolean;
};

const PlanContext = createContext<PlanContextValue | null>(null);

export function usePlan(): PlanContextValue {
  const v = useContext(PlanContext);
  if (!v) throw new Error("usePlan must be used inside PlanProvider");
  return v;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, initState);
  const [drag, setDrag] = useState<DragState | null>(null);
  const suppress = useRef(false);

  const place = useCallback(
    (guestId: string, table: string, seat?: number) => dispatch({ type: "place", guestId, table, seat }),
    [],
  );
  const unseat = useCallback((guestId: string) => dispatch({ type: "unseat", guestId }), []);
  const hold = useCallback((guestId: string | null) => dispatch({ type: "hold", guestId }), []);
  const select = useCallback((table: string | null) => dispatch({ type: "select", table }), []);
  const consumeClick = useCallback(() => suppress.current, []);

  const startDrag = useCallback((e: ReactPointerEvent, guestId: string) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const sx = e.clientX;
    const sy = e.clientY;
    const id = e.pointerId;
    let active = false;

    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
    };
    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== id) return;
      if (!active) {
        if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return;
        active = true;
      }
      setDrag({ guestId, x: ev.clientX, y: ev.clientY, over: targetAt(ev.clientX, ev.clientY) });
    };
    const finish = (ev: PointerEvent, dropIt: boolean) => {
      if (ev.pointerId !== id) return;
      cleanup();
      if (!active) return;
      suppress.current = true;
      window.setTimeout(() => {
        suppress.current = false;
      }, 80);
      setDrag(null);
      if (!dropIt) return;
      const t = targetAt(ev.clientX, ev.clientY);
      if (!t) return;
      if (t.kind === "unseat") dispatch({ type: "unseat", guestId });
      else if (t.kind === "seat") dispatch({ type: "place", guestId, table: t.table, seat: t.seat });
      else dispatch({ type: "place", guestId, table: t.table });
    };
    const up = (ev: PointerEvent) => finish(ev, true);
    const cancel = (ev: PointerEvent) => finish(ev, false);

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch({ type: "hold", guestId: null });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!drag) return;
    document.body.classList.add("select-none", "cursor-grabbing");
    return () => document.body.classList.remove("select-none", "cursor-grabbing");
  }, [drag === null]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo<PlanContextValue>(() => {
    const occupants = occupantsOf(state.seats);
    const filled: Record<string, number> = {};
    for (const t of tables) filled[t.id] = 0;
    for (const s of Object.values(state.seats)) if (s) filled[s.table] = (filled[s.table] ?? 0) + 1;
    const results = evaluateRules(state.seats);
    const brokenTables = new Set<string>();
    const brokenGuests = new Set<string>();
    for (const r of results) {
      if (r.status !== "broken") continue;
      r.tables.forEach((t) => brokenTables.add(t));
      r.guests.forEach((gid) => brokenGuests.add(gid));
    }
    const counts: Counts = {
      confirmed: guests.filter((x) => x.rsvp === "yes").length,
      seated: Object.values(state.seats).filter(Boolean).length,
      toSeat: guests.filter((x) => x.rsvp === "yes" && !state.seats[x.id]).length,
      awaiting: guests.filter((x) => x.rsvp === "maybe" || x.rsvp === "pending").length,
      declined: guests.filter((x) => x.rsvp === "no").length,
      capacity: tables.reduce((n, t) => n + t.seats, 0),
    };
    return {
      seats: state.seats,
      occupants,
      filled,
      selectedTable: state.selectedTable,
      holding: state.holding,
      notice: state.notice,
      results,
      brokenTables,
      brokenGuests,
      counts,
      place,
      unseat,
      hold,
      select,
      drag,
      startDrag,
      consumeClick,
    };
  }, [state, drag, place, unseat, hold, select, startDrag, consumeClick]);

  const dragged = drag ? guestById.get(drag.guestId) : undefined;

  return (
    <PlanContext.Provider value={value}>
      {children}
      {drag && dragged ? (
        <div
          aria-hidden
          className="pointer-events-none fixed z-50 flex items-center gap-2 rounded-full bg-white py-1.5 pr-3 pl-1.5 text-sm font-medium text-stone-900 shadow-lg ring-1 ring-stone-300"
          style={{ left: drag.x + 12, top: drag.y + 12 }}
        >
          <span
            className="size-5 rounded-full"
            style={{ backgroundColor: partyColor[dragged.party] ?? "#57534e" }}
          />
          {dragged.name}
        </div>
      ) : null}
    </PlanContext.Provider>
  );
}
