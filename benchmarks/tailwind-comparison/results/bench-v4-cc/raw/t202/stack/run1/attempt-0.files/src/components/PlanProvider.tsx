"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { TABLES } from "@/lib/data";
import { guestById, initialAssignments, tableById, type Assignments } from "@/lib/plan";

export interface PlaceResult {
  ok: boolean;
  message: string;
}

interface PlanContextValue {
  assignments: Assignments;
  place: (guestId: string, tableId: string | null) => PlaceResult;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [assignments, setAssignments] = useState<Assignments>(initialAssignments);
  const latest = useRef<Assignments>(assignments);
  latest.current = assignments;

  const place = useCallback((guestId: string, tableId: string | null): PlaceResult => {
    const guest = guestById.get(guestId);
    if (!guest) return { ok: false, message: "That guest could not be found." };
    const current = latest.current;
    if (tableId === null) {
      if (current[guestId] === null) return { ok: true, message: `${guest.name} is already unseated.` };
      const next = { ...current, [guestId]: null };
      latest.current = next;
      setAssignments(next);
      return { ok: true, message: `${guest.name} unseated.` };
    }
    const table = tableById.get(tableId);
    if (!table) return { ok: false, message: "That table could not be found." };
    if (current[guestId] === tableId) {
      return { ok: true, message: `${guest.name} is already at ${table.name}.` };
    }
    const taken = Object.values(current).filter((t) => t === tableId).length;
    const cap = TABLES.find((t) => t.id === tableId)?.seats ?? 0;
    if (taken >= cap) {
      return { ok: false, message: `${table.name} is full (${taken} of ${cap} seats).` };
    }
    const next = { ...current, [guestId]: tableId };
    latest.current = next;
    setAssignments(next);
    return { ok: true, message: `${guest.name} seated at ${table.name}.` };
  }, []);

  const value = useMemo(() => ({ assignments, place }), [assignments, place]);
  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}
