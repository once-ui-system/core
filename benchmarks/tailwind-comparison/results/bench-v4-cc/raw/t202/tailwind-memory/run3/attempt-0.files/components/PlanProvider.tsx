"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import {
  applyPlace,
  applyUnseat,
  buildLocations,
  computeCounts,
  evaluateRules,
  initialSeats,
  type Counts,
  type Location,
  type RuleResult,
  type Seats,
} from "@/lib/plan";

type Notice = { id: number; text: string; tone: "info" | "warn" };
type State = { seats: Seats; history: Seats[]; notice: Notice | null };

export type PlanApi = {
  seats: Seats;
  locations: Map<string, Location>;
  rules: RuleResult[];
  brokenByTable: Record<string, RuleResult[]>;
  flaggedGuests: Set<string>;
  counts: Counts;
  place: (guestId: string, tableId: string, index?: number) => boolean;
  unseat: (guestId: string) => void;
  undo: () => void;
  canUndo: boolean;
  notice: Notice | null;
  dismissNotice: () => void;
};

const PlanContext = createContext<PlanApi | null>(null);

export function usePlan(): PlanApi {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

let noticeCounter = 0;
const makeNotice = (text: string, tone: Notice["tone"]): Notice => ({ id: ++noticeCounter, text, tone });

export function PlanProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => ({ seats: initialSeats(), history: [], notice: null }));
  const ref = useRef(state);

  const commit = useCallback((fn: (s: State) => State) => {
    const next = fn(ref.current);
    ref.current = next;
    setState(next);
  }, []);

  const place = useCallback(
    (guestId: string, tableId: string, index?: number) => {
      const r = applyPlace(ref.current.seats, guestId, tableId, index);
      if (!r.ok) {
        commit((s) => ({ ...s, notice: makeNotice(r.message, "warn") }));
        return false;
      }
      commit((s) => ({
        seats: r.seats,
        history: [...s.history.slice(-29), s.seats],
        notice: makeNotice(r.message, "info"),
      }));
      return true;
    },
    [commit],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const r = applyUnseat(ref.current.seats, guestId);
      if (!r.ok) {
        commit((s) => ({ ...s, notice: makeNotice(r.message, "warn") }));
        return;
      }
      commit((s) => ({
        seats: r.seats,
        history: [...s.history.slice(-29), s.seats],
        notice: makeNotice(r.message, "info"),
      }));
    },
    [commit],
  );

  const undo = useCallback(() => {
    commit((s) => {
      if (s.history.length === 0) return s;
      const previous = s.history[s.history.length - 1];
      return { seats: previous, history: s.history.slice(0, -1), notice: makeNotice("Undid the last change", "info") };
    });
  }, [commit]);

  const dismissNotice = useCallback(() => commit((s) => ({ ...s, notice: null })), [commit]);

  const noticeId = state.notice?.id;
  useEffect(() => {
    if (noticeId === undefined) return;
    const timer = window.setTimeout(() => {
      commit((s) => (s.notice && s.notice.id === noticeId ? { ...s, notice: null } : s));
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [noticeId, commit]);

  const derived = useMemo(() => {
    const locations = buildLocations(state.seats);
    const rules = evaluateRules(state.seats);
    const brokenByTable: Record<string, RuleResult[]> = {};
    const flaggedGuests = new Set<string>();
    for (const r of rules) {
      if (r.status !== "broken") continue;
      for (const t of r.tableIds) {
        (brokenByTable[t] ??= []).push(r);
      }
      for (const g of r.guestIds) flaggedGuests.add(g);
    }
    return { locations, rules, brokenByTable, flaggedGuests, counts: computeCounts(state.seats) };
  }, [state.seats]);

  const value = useMemo<PlanApi>(
    () => ({
      seats: state.seats,
      ...derived,
      place,
      unseat,
      undo,
      canUndo: state.history.length > 0,
      notice: state.notice,
      dismissNotice,
    }),
    [state.seats, state.history.length, state.notice, derived, place, unseat, undo, dismissNotice],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
