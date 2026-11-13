"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  countsFor,
  evaluateRules,
  initialAssignment,
  placeGuest,
  seatMap,
  unseatGuest,
  type Assignment,
  type Counts,
  type RuleResult,
} from "@/lib/seating";

interface SeatContextValue {
  assignment: Assignment;
  seats: Record<string, (string | null)[]>;
  counts: Counts;
  ruleResults: RuleResult[];
  place: (guestId: string, tableId: string, seat?: number) => { ok: boolean; message: string };
  unseat: (guestId: string) => { ok: boolean; message: string };
  reset: () => void;
}

const SeatContext = createContext<SeatContextValue | null>(null);

export function SeatProvider({ children }: { children: React.ReactNode }) {
  const [assignment, setAssignment] = useState<Assignment>(initialAssignment);

  const place = useCallback(
    (guestId: string, tableId: string, seat?: number) => {
      const res = placeGuest(assignment, guestId, tableId, seat);
      if (res.ok) setAssignment(res.next);
      return { ok: res.ok, message: res.message };
    },
    [assignment],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const res = unseatGuest(assignment, guestId);
      if (res.ok) setAssignment(res.next);
      return { ok: res.ok, message: res.message };
    },
    [assignment],
  );

  const reset = useCallback(() => setAssignment(initialAssignment()), []);

  const value = useMemo<SeatContextValue>(
    () => ({
      assignment,
      seats: seatMap(assignment),
      counts: countsFor(assignment),
      ruleResults: evaluateRules(assignment),
      place,
      unseat,
      reset,
    }),
    [assignment, place, unseat, reset],
  );

  return <SeatContext.Provider value={value}>{children}</SeatContext.Provider>;
}

export function useSeating(): SeatContextValue {
  const ctx = useContext(SeatContext);
  if (!ctx) throw new Error("useSeating must be used inside SeatProvider");
  return ctx;
}
