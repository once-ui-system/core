"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { GUESTS, TABLES, type Guest } from "@/lib/data";
import {
  brokenByTable,
  brokenGuestSet,
  cloneSeats,
  evaluateRules,
  guestById,
  initialSeats,
  placementsOf,
  tableById,
  type Placement,
  type RuleResult,
  type Seats,
} from "@/lib/plan";

interface State {
  seats: Seats;
  history: Seats[];
  selectedGuest: string | null;
  selectedTable: string | null;
  note: string;
  noteId: number;
}

type Action =
  | { type: "place"; guestId: string; tableId: string; seat?: number }
  | { type: "unseat"; guestId: string }
  | { type: "undo" }
  | { type: "selectGuest"; guestId: string | null }
  | { type: "selectTable"; tableId: string | null }
  | { type: "clearNote" };

const initialState: State = {
  seats: initialSeats(),
  history: [],
  selectedGuest: null,
  selectedTable: "t-1",
  note: "",
  noteId: 0,
};

function say(state: State, note: string): State {
  return { ...state, note, noteId: state.noteId + 1 };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "selectGuest":
      return { ...state, selectedGuest: action.guestId };
    case "selectTable":
      return { ...state, selectedTable: action.tableId };
    case "clearNote":
      return { ...state, note: "" };
    case "undo": {
      const prev = state.history[state.history.length - 1];
      if (!prev) return state;
      return say(
        { ...state, seats: prev, history: state.history.slice(0, -1), selectedGuest: null },
        "Last change undone",
      );
    }
    case "unseat": {
      const guest = guestById[action.guestId];
      const at = placementsOf(state.seats)[action.guestId];
      if (!guest || !at) return state;
      const seats = cloneSeats(state.seats);
      seats[at.tableId][at.seat] = null;
      return say(
        {
          ...state,
          seats,
          history: [...state.history.slice(-49), state.seats],
          selectedGuest: null,
        },
        `${guest.name} unseated from ${tableById[at.tableId].name}`,
      );
    }
    case "place": {
      const guest = guestById[action.guestId];
      const table = tableById[action.tableId];
      const row = state.seats[action.tableId];
      if (!guest || !table || !row || guest.rsvp === "no") return state;
      const cur = placementsOf(state.seats)[action.guestId];

      let idx = action.seat;
      if (idx === undefined || idx < 0 || idx >= row.length) idx = undefined;
      // An unseated guest dropped on someone else's seat takes a free seat instead, if there is one.
      if (idx !== undefined && !cur && row[idx] && row.includes(null)) idx = undefined;
      if (idx === undefined) {
        if (cur && cur.tableId === action.tableId) {
          return say({ ...state, selectedGuest: null }, `${guest.name} is already at ${table.name}`);
        }
        idx = row.indexOf(null);
        if (idx < 0) return say(state, `${table.name} is full`);
      }
      const occupantId = row[idx];
      if (occupantId === action.guestId) return { ...state, selectedGuest: null };

      const seats = cloneSeats(state.seats);
      if (cur) seats[cur.tableId][cur.seat] = occupantId;
      seats[action.tableId][idx] = action.guestId;

      let note: string;
      const occupant = occupantId ? guestById[occupantId] : null;
      if (occupant && cur) note = `${guest.name} and ${occupant.name} swapped seats`;
      else if (occupant) note = `${guest.name} seated at ${table.name}; ${occupant.name} is now unseated`;
      else if (cur) note = `${guest.name} moved to ${table.name}`;
      else note = `${guest.name} seated at ${table.name}`;

      return say(
        {
          ...state,
          seats,
          history: [...state.history.slice(-49), state.seats],
          selectedGuest: null,
          selectedTable: action.tableId,
        },
        note,
      );
    }
  }
}

interface PlanContextValue {
  seats: Seats;
  where: Record<string, Placement>;
  results: RuleResult[];
  flagsByTable: Record<string, RuleResult[]>;
  brokenGuests: Set<string>;
  /** Attending (RSVP yes) guests without a seat. */
  unseatedAttending: Guest[];
  /** Maybe / awaiting reply guests without a seat. */
  unseatedUnconfirmed: Guest[];
  seatedCount: number;
  attendingCount: number;
  totalSeats: number;
  perTable: Record<string, number>;
  selectedGuest: string | null;
  selectedTable: string | null;
  note: string;
  noteId: number;
  canUndo: boolean;
  place: (guestId: string, tableId: string, seat?: number) => void;
  unseat: (guestId: string) => void;
  undo: () => void;
  selectGuest: (guestId: string | null) => void;
  selectTable: (tableId: string | null) => void;
  dismissNote: () => void;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!state.note) return;
    const timer = setTimeout(() => dispatch({ type: "clearNote" }), 6000);
    return () => clearTimeout(timer);
  }, [state.note, state.noteId]);

  const place = useCallback(
    (guestId: string, tableId: string, seat?: number) => dispatch({ type: "place", guestId, tableId, seat }),
    [],
  );
  const unseat = useCallback((guestId: string) => dispatch({ type: "unseat", guestId }), []);
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const selectGuest = useCallback((guestId: string | null) => dispatch({ type: "selectGuest", guestId }), []);
  const selectTable = useCallback((tableId: string | null) => dispatch({ type: "selectTable", tableId }), []);
  const dismissNote = useCallback(() => dispatch({ type: "clearNote" }), []);

  const value = useMemo<PlanContextValue>(() => {
    const where = placementsOf(state.seats);
    const results = evaluateRules(state.seats);
    const sort = (a: Guest, b: Guest) => a.party.localeCompare(b.party) || a.name.localeCompare(b.name);
    const unseatedAttending = GUESTS.filter((g) => g.rsvp === "yes" && !where[g.id]).sort(sort);
    const unseatedUnconfirmed = GUESTS.filter(
      (g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !where[g.id],
    ).sort(sort);
    const perTable: Record<string, number> = {};
    for (const t of TABLES) perTable[t.id] = state.seats[t.id].filter(Boolean).length;
    return {
      seats: state.seats,
      where,
      results,
      flagsByTable: brokenByTable(results),
      brokenGuests: brokenGuestSet(results),
      unseatedAttending,
      unseatedUnconfirmed,
      seatedCount: Object.keys(where).length,
      attendingCount: GUESTS.filter((g) => g.rsvp === "yes").length,
      totalSeats: TABLES.reduce((n, t) => n + t.seats, 0),
      perTable,
      selectedGuest: state.selectedGuest,
      selectedTable: state.selectedTable,
      note: state.note,
      noteId: state.noteId,
      canUndo: state.history.length > 0,
      place,
      unseat,
      undo,
      selectGuest,
      selectTable,
      dismissNote,
    };
  }, [state, place, unseat, undo, selectGuest, selectTable, dismissNote]);

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}
