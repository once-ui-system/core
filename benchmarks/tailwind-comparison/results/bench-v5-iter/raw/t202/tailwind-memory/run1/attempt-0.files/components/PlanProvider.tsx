"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  evaluateRules,
  initialSeats,
  moveGuest,
  tableOfGuest,
  unseatGuest,
  type MoveResult,
  type RuleResult,
  type Seats,
} from "@/lib/plan";

interface Notice {
  id: number;
  text: string;
  ok: boolean;
}

interface PlanContextValue {
  seats: Seats;
  tableOf: Record<string, string>;
  rules: RuleResult[];
  notice: Notice | null;
  seat: (guestId: string, tableId: string, seatIndex?: number) => MoveResult;
  unseat: (guestId: string) => void;
  reset: () => void;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [seats, setSeats] = useState<Seats>(() => initialSeats());
  const [notice, setNotice] = useState<Notice | null>(null);
  const counter = useRef(0);
  const seatsRef = useRef(seats);
  seatsRef.current = seats;

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 4500);
    return () => window.clearTimeout(t);
  }, [notice]);

  const announce = useCallback((r: MoveResult) => {
    counter.current += 1;
    setNotice({ id: counter.current, text: r.message, ok: r.ok });
  }, []);

  const seat = useCallback(
    (guestId: string, tableId: string, seatIndex?: number) => {
      const r = moveGuest(seatsRef.current, guestId, tableId, seatIndex);
      if (r.ok) {
        seatsRef.current = r.seats;
        setSeats(r.seats);
      }
      announce(r);
      return r;
    },
    [announce],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const r = unseatGuest(seatsRef.current, guestId);
      seatsRef.current = r.seats;
      setSeats(r.seats);
      announce(r);
    },
    [announce],
  );

  const reset = useCallback(() => {
    const s = initialSeats();
    seatsRef.current = s;
    setSeats(s);
    announce({ seats: s, ok: true, message: "Plan reset to the starting arrangement." });
  }, [announce]);

  const value = useMemo<PlanContextValue>(
    () => ({
      seats,
      tableOf: tableOfGuest(seats),
      rules: evaluateRules(seats),
      notice,
      seat,
      unseat,
      reset,
    }),
    [seats, notice, seat, unseat, reset],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}
