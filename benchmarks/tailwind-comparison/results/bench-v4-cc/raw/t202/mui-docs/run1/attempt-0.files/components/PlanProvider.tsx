"use client";

import * as React from "react";
import { GUESTS, TABLES, type Guest } from "@/lib/data";
import {
  evaluateRules,
  initialSeats,
  locate,
  placeGuest,
  unseatGuest,
  type RuleResult,
  type SeatMap,
  type Severity,
} from "@/lib/seating";

export interface Notice {
  id: number;
  message: string;
  severity: Severity;
  undoable: boolean;
  open: boolean;
}

interface State {
  seats: SeatMap;
  prev: SeatMap | null;
  selectedTable: string | null;
  armed: string | null;
  notice: Notice | null;
  counter: number;
}

type Action =
  | { type: "place"; guestId: string; tableId: string; seatIndex?: number }
  | { type: "unseat"; guestId: string }
  | { type: "select-table"; tableId: string | null }
  | { type: "arm"; guestId: string | null }
  | { type: "undo" }
  | { type: "dismiss" }
  | { type: "notify"; message: string; severity: Severity };

function initialState(): State {
  return { seats: initialSeats(), prev: null, selectedTable: null, armed: null, notice: null, counter: 0 };
}

function withNotice(state: State, message: string, severity: Severity, undoable: boolean) {
  const id = state.counter + 1;
  return { counter: id, notice: { id, message, severity, undoable, open: true } as Notice };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "place": {
      const r = placeGuest(state.seats, action.guestId, action.tableId, action.seatIndex);
      if (!r.changed) {
        return {
          ...state,
          armed: r.severity === "info" ? null : state.armed,
          ...withNotice(state, r.message, r.severity, false),
        };
      }
      return {
        ...state,
        seats: r.seats,
        prev: state.seats,
        armed: null,
        selectedTable: action.tableId,
        ...withNotice(state, r.message, r.severity, true),
      };
    }
    case "unseat": {
      const r = unseatGuest(state.seats, action.guestId);
      if (!r.changed) return { ...state, armed: null, ...withNotice(state, r.message, r.severity, false) };
      return {
        ...state,
        seats: r.seats,
        prev: state.seats,
        armed: null,
        ...withNotice(state, r.message, r.severity, true),
      };
    }
    case "select-table":
      return { ...state, selectedTable: action.tableId };
    case "arm": {
      if (!action.guestId) return { ...state, armed: null };
      const at = locate(state.seats)[action.guestId];
      return { ...state, armed: action.guestId, selectedTable: at ? at.table : state.selectedTable };
    }
    case "undo": {
      if (!state.prev) return state;
      return { ...state, seats: state.prev, prev: null, armed: null, ...withNotice(state, "Last change undone.", "info", false) };
    }
    case "dismiss":
      return state.notice ? { ...state, notice: { ...state.notice, open: false } } : state;
    case "notify":
      return { ...state, ...withNotice(state, action.message, action.severity, false) };
    default:
      return state;
  }
}

export interface PlanCounts {
  attending: number;
  seatedAttending: number;
  seatedTotal: number;
  capacity: number;
  declined: number;
}

export interface PlanApi {
  state: State;
  guestTable: Record<string, string | null>;
  tableFill: Record<string, number>;
  /** attending (yes) guests without a seat */
  unseated: Guest[];
  /** maybe / awaiting-reply guests without a seat */
  awaiting: Guest[];
  counts: PlanCounts;
  results: RuleResult[];
  brokenByTable: Record<string, RuleResult[]>;
  brokenGuests: Set<string>;
  dragging: string | null;
  setDragging: (id: string | null) => void;
  place: (guestId: string, tableId: string, seatIndex?: number) => void;
  unseat: (guestId: string) => void;
  selectTable: (tableId: string | null) => void;
  arm: (guestId: string | null) => void;
  undo: () => void;
  dismissNotice: () => void;
  notify: (message: string, severity?: Severity) => void;
}

const PlanContext = React.createContext<PlanApi | null>(null);

export function usePlan(): PlanApi {
  const ctx = React.useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

export default function PlanProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, undefined, initialState);
  const [dragging, setDragging] = React.useState<string | null>(null);

  const derived = React.useMemo(() => {
    const at = locate(state.seats);
    const guestTable: Record<string, string | null> = {};
    for (const g of GUESTS) guestTable[g.id] = at[g.id] ? at[g.id].table : null;

    const tableFill: Record<string, number> = {};
    for (const t of TABLES) tableFill[t.id] = state.seats[t.id].filter(Boolean).length;

    const attending = GUESTS.filter((g) => g.rsvp === "yes");
    const unseated = attending.filter((g) => !guestTable[g.id]);
    const awaiting = GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !guestTable[g.id]);
    const seatedTotal = GUESTS.filter((g) => guestTable[g.id]).length;
    const counts: PlanCounts = {
      attending: attending.length,
      seatedAttending: attending.length - unseated.length,
      seatedTotal,
      capacity: TABLES.reduce((n, t) => n + t.seats, 0),
      declined: GUESTS.filter((g) => g.rsvp === "no").length,
    };

    const results = evaluateRules(state.seats);
    const brokenByTable: Record<string, RuleResult[]> = {};
    const brokenGuests = new Set<string>();
    for (const r of results) {
      if (r.status !== "broken") continue;
      for (const t of r.tables) brokenByTable[t] = [...(brokenByTable[t] ?? []), r];
      for (const g of r.guestIds) brokenGuests.add(g);
    }
    return { guestTable, tableFill, unseated, awaiting, counts, results, brokenByTable, brokenGuests };
  }, [state.seats]);

  const place = React.useCallback(
    (guestId: string, tableId: string, seatIndex?: number) => dispatch({ type: "place", guestId, tableId, seatIndex }),
    [],
  );
  const unseat = React.useCallback((guestId: string) => dispatch({ type: "unseat", guestId }), []);
  const selectTable = React.useCallback((tableId: string | null) => dispatch({ type: "select-table", tableId }), []);
  const arm = React.useCallback((guestId: string | null) => dispatch({ type: "arm", guestId }), []);
  const undo = React.useCallback(() => dispatch({ type: "undo" }), []);
  const dismissNotice = React.useCallback(() => dispatch({ type: "dismiss" }), []);
  const notify = React.useCallback(
    (message: string, severity: Severity = "info") => dispatch({ type: "notify", message, severity }),
    [],
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch({ type: "arm", guestId: null });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = React.useMemo<PlanApi>(
    () => ({
      state,
      ...derived,
      dragging,
      setDragging,
      place,
      unseat,
      selectTable,
      arm,
      undo,
      dismissNotice,
      notify,
    }),
    [state, derived, dragging, place, unseat, selectTable, arm, undo, dismissNotice, notify],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
