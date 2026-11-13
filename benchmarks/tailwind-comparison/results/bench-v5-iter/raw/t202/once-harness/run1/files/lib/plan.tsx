"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { guests, tables } from "./data";
import { type Assignment, type RuleResult, evaluateRules } from "./rules";

type PlanContextValue = {
  assign: Assignment;
  /** guest picked up by tapping, waiting for a seat */
  held: string | null;
  selectedTable: string | null;
  message: string;
  rules: RuleResult[];
  brokenTables: Set<string>;
  occupants: (tableId: string) => (string | null)[];
  countAt: (tableId: string) => number;
  seatedCount: number;
  unseatedAttending: string[];
  unseatedMaybe: string[];
  hold: (guestId: string | null) => void;
  selectTable: (tableId: string | null) => void;
  place: (guestId: string, tableId: string, seat?: number) => void;
  unseat: (guestId: string) => void;
};

const PlanContext = createContext<PlanContextValue | null>(null);

function initialAssignment(): Assignment {
  const next: Assignment = {};
  const used: Record<string, number> = {};
  for (const g of guests) {
    if (g.table) {
      const seat = used[g.table] ?? 0;
      used[g.table] = seat + 1;
      next[g.id] = { table: g.table, seat };
    } else {
      next[g.id] = null;
    }
  }
  return next;
}

const guestById = new Map(guests.map((g) => [g.id, g]));
const tableById = new Map(tables.map((t) => [t.id, t]));

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [assign, setAssign] = useState<Assignment>(initialAssignment);
  const [held, setHeld] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>("t-1");
  const [message, setMessage] = useState("");

  const occupants = useCallback(
    (tableId: string) => {
      const def = tableById.get(tableId);
      const slots: (string | null)[] = Array.from({ length: def?.seats ?? 0 }, () => null);
      for (const [gid, p] of Object.entries(assign)) {
        if (p && p.table === tableId) slots[p.seat] = gid;
      }
      return slots;
    },
    [assign],
  );

  const countAt = useCallback(
    (tableId: string) => Object.values(assign).filter((p) => p?.table === tableId).length,
    [assign],
  );

  const place = useCallback(
    (guestId: string, tableId: string, seat?: number) => {
      const guest = guestById.get(guestId);
      const def = tableById.get(tableId);
      if (!guest || !def) return;
      if (guest.rsvp === "no") {
        setMessage(`${guest.name} has declined, so cannot be seated.`);
        return;
      }
      const slots: (string | null)[] = Array.from({ length: def.seats }, () => null);
      for (const [gid, p] of Object.entries(assign)) {
        if (p && p.table === tableId && gid !== guestId) slots[p.seat] = gid;
      }
      const from = assign[guestId] ?? null;
      let target = seat;
      if (target === undefined || (slots[target] !== null && !from)) {
        const free = slots.findIndex((s) => s === null);
        if (free === -1) {
          setMessage(`${def.name} is full. Unseat someone or pick another table.`);
          return;
        }
        target = free;
      }
      const occupant = slots[target];
      setAssign((prev) => {
        const next: Assignment = { ...prev, [guestId]: { table: tableId, seat: target as number } };
        if (occupant) next[occupant] = from;
        return next;
      });
      setHeld(null);
      setSelectedTable(tableId);
      setMessage(
        occupant && from
          ? `Swapped ${guest.name} with ${guestById.get(occupant)?.name ?? "a guest"}.`
          : `${guest.name} seated at ${def.name}, seat ${target + 1}.`,
      );
    },
    [assign],
  );

  const unseat = useCallback(
    (guestId: string) => {
      setAssign((prev) => ({ ...prev, [guestId]: null }));
      setHeld(null);
      setMessage(`${guestById.get(guestId)?.name ?? "Guest"} unseated.`);
    },
    [],
  );

  const hold = useCallback((guestId: string | null) => {
    setHeld(guestId);
    if (guestId) {
      setMessage(`${guestById.get(guestId)?.name ?? "Guest"} picked up. Tap a seat or table to place them.`);
    } else {
      setMessage("");
    }
  }, []);

  const selectTable = useCallback((tableId: string | null) => setSelectedTable(tableId), []);

  const value = useMemo<PlanContextValue>(() => {
    const ruleResults = evaluateRules(assign);
    const broken = new Set<string>();
    for (const r of ruleResults) {
      if (r.status === "broken") for (const t of r.tableIds) broken.add(t);
    }
    const unseatedAttending = guests.filter((g) => g.rsvp === "yes" && !assign[g.id]).map((g) => g.id);
    const unseatedMaybe = guests
      .filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !assign[g.id])
      .map((g) => g.id);
    return {
      assign,
      held,
      selectedTable,
      message,
      rules: ruleResults,
      brokenTables: broken,
      occupants,
      countAt,
      seatedCount: Object.values(assign).filter(Boolean).length,
      unseatedAttending,
      unseatedMaybe,
      hold,
      selectTable,
      place,
      unseat,
    };
  }, [assign, held, selectedTable, message, occupants, countAt, hold, selectTable, place, unseat]);

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}
