"use client";

import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import { GUEST_BY_ID, GUESTS, TABLE_BY_ID, TABLES } from "./data";
import { evaluateRules, type RuleResult } from "./rules";

type Seating = Record<string, Array<string | null>>;

interface State {
  seating: Seating;
  selectedTable: string | null;
  armed: string | null;
  notice: string;
}

type Action =
  | { type: "place"; guest: string; table: string; seat?: number }
  | { type: "unseat"; guest: string }
  | { type: "select"; table: string | null }
  | { type: "arm"; guest: string | null };

function initialSeating(): Seating {
  const seating: Seating = {};
  for (const t of TABLES) seating[t.id] = new Array<string | null>(t.seats).fill(null);
  for (const guest of GUESTS) {
    if (!guest.table) continue;
    const row = seating[guest.table];
    const free = row.indexOf(null);
    if (free >= 0) row[free] = guest.id;
  }
  return seating;
}

function locate(seating: Seating, guestId: string): { table: string; seat: number } | null {
  for (const t of TABLES) {
    const seat = seating[t.id].indexOf(guestId);
    if (seat >= 0) return { table: t.id, seat };
  }
  return null;
}

function cloneSeating(seating: Seating): Seating {
  const next: Seating = {};
  for (const key of Object.keys(seating)) next[key] = [...seating[key]];
  return next;
}

const INITIAL_NOTICE = "Tap a guest, then a table. Or drag guests onto tables.";

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "select":
      return { ...state, selectedTable: action.table };
    case "arm":
      return { ...state, armed: action.guest };
    case "unseat": {
      const from = locate(state.seating, action.guest);
      if (!from) return { ...state, armed: null };
      const next = cloneSeating(state.seating);
      next[from.table][from.seat] = null;
      return {
        ...state,
        seating: next,
        armed: null,
        notice: `${GUEST_BY_ID[action.guest].name} is now unseated.`,
      };
    }
    case "place": {
      const guest = GUEST_BY_ID[action.guest];
      const table = TABLE_BY_ID[action.table];
      if (!guest || !table) return state;
      if (guest.rsvp === "no") {
        return {
          ...state,
          armed: null,
          notice: `${guest.name} has declined and cannot be seated.`,
        };
      }
      const from = locate(state.seating, guest.id);
      const row = state.seating[table.id];
      const target = action.seat !== undefined ? action.seat : row.indexOf(null);
      if (from && from.table === table.id && (action.seat === undefined || action.seat === from.seat)) {
        return { ...state, armed: null, selectedTable: table.id };
      }
      if (target < 0) {
        return { ...state, notice: `${table.name} is full. Pick another table or free a seat.` };
      }
      const next = cloneSeating(state.seating);
      const occupant = next[table.id][target];
      if (from) next[from.table][from.seat] = null;
      next[table.id][target] = guest.id;
      let notice = `${guest.name} seated at ${table.name}, seat ${target + 1}.`;
      if (occupant && occupant !== guest.id) {
        if (from) {
          next[from.table][from.seat] = occupant;
          notice = `${guest.name} and ${GUEST_BY_ID[occupant].name} swapped seats.`;
        } else {
          notice = `${guest.name} seated at ${table.name}. ${GUEST_BY_ID[occupant].name} is now unseated.`;
        }
      }
      return { ...state, seating: next, armed: null, selectedTable: table.id, notice };
    }
    default:
      return state;
  }
}

export interface PlanStats {
  attending: number;
  seated: number;
  unseatedAttending: number;
  awaiting: number;
  freeSeats: number;
  totalSeats: number;
  perTable: Record<string, { filled: number; cap: number }>;
  broken: number;
  pending: number;
}

interface PlanContextValue {
  seating: Seating;
  selectedTable: string | null;
  armed: string | null;
  notice: string;
  tableOf: Record<string, string | null>;
  results: RuleResult[];
  stats: PlanStats;
  place: (guest: string, table: string, seat?: number) => void;
  unseat: (guest: string) => void;
  selectTable: (table: string | null) => void;
  arm: (guest: string | null) => void;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, (): State => ({
    seating: initialSeating(),
    selectedTable: null,
    armed: null,
    notice: INITIAL_NOTICE,
  }));

  const actions = useMemo(
    () => ({
      place: (guest: string, table: string, seat?: number) =>
        dispatch({ type: "place", guest, table, seat }),
      unseat: (guest: string) => dispatch({ type: "unseat", guest }),
      selectTable: (table: string | null) => dispatch({ type: "select", table }),
      arm: (guest: string | null) => dispatch({ type: "arm", guest }),
    }),
    [],
  );

  const derived = useMemo(() => {
    const tableOf: Record<string, string | null> = {};
    for (const guest of GUESTS) tableOf[guest.id] = null;
    const perTable: PlanStats["perTable"] = {};
    let seated = 0;
    let totalSeats = 0;
    for (const t of TABLES) {
      let filled = 0;
      for (const id of state.seating[t.id]) {
        if (id) {
          tableOf[id] = t.id;
          filled += 1;
        }
      }
      perTable[t.id] = { filled, cap: t.seats };
      seated += filled;
      totalSeats += t.seats;
    }
    const results = evaluateRules(tableOf);
    const attending = GUESTS.filter((x) => x.rsvp === "yes").length;
    const unseatedAttending = GUESTS.filter((x) => x.rsvp === "yes" && !tableOf[x.id]).length;
    const awaiting = GUESTS.filter(
      (x) => (x.rsvp === "maybe" || x.rsvp === "pending") && !tableOf[x.id],
    ).length;
    const stats: PlanStats = {
      attending,
      seated,
      unseatedAttending,
      awaiting,
      freeSeats: totalSeats - seated,
      totalSeats,
      perTable,
      broken: results.filter((r) => r.status === "broken").length,
      pending: results.filter((r) => r.status === "pending").length,
    };
    return { tableOf, results, stats };
  }, [state.seating]);

  const value: PlanContextValue = {
    seating: state.seating,
    selectedTable: state.selectedTable,
    armed: state.armed,
    notice: state.notice,
    ...derived,
    ...actions,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}
