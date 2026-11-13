"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { guestById, guests, tableById, tables } from "./data";
import { evaluateRules, tableOfGuest, type RuleResult, type Seats } from "./rules";

export interface Notice {
  id: number;
  severity: "success" | "info" | "warning";
  message: string;
}

interface PlanContextValue {
  seats: Seats;
  tableOf: Record<string, string>;
  seatedCount: number;
  attendingCount: number;
  unseated: string[];
  capacity: number;
  rules: RuleResult[];
  brokenRules: RuleResult[];
  flaggedTables: Record<string, RuleResult[]>;
  flaggedGuests: Set<string>;
  selectedTable: string | null;
  heldGuest: string | null;
  notice: Notice | null;
  selectTable: (id: string | null) => void;
  hold: (guestId: string | null) => void;
  place: (guestId: string, tableId: string, seatIndex?: number) => void;
  unseat: (guestId: string) => void;
  dismissNotice: () => void;
}

const PlanContext = createContext<PlanContextValue | null>(null);

function initialSeats(): Seats {
  const seats: Seats = {};
  for (const t of tables) seats[t.id] = Array<string | null>(t.seats).fill(null);
  for (const g of guests) {
    if (!g.table) continue;
    const row = seats[g.table];
    const free = row.indexOf(null);
    if (free >= 0) row[free] = g.id;
  }
  return seats;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [seats, setSeats] = useState<Seats>(initialSeats);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [heldGuest, setHeldGuest] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const say = useCallback((severity: Notice["severity"], message: string) => {
    setNotice({ id: Date.now() + Math.random(), severity, message });
  }, []);

  const place = useCallback(
    (guestId: string, tableId: string, seatIndex?: number) => {
      const guest = guestById[guestId];
      const table = tableById[tableId];
      if (!guest || !table) return;
      const next: Seats = {};
      for (const [k, v] of Object.entries(seats)) next[k] = v.slice();
      let from: { t: string; i: number } | null = null;
      for (const [k, row] of Object.entries(next)) {
        const i = row.indexOf(guestId);
        if (i >= 0) from = { t: k, i };
      }
      const target = next[tableId];
      let idx = seatIndex;

      if (idx !== undefined && target[idx] === guestId) {
        setHeldGuest(null);
        return;
      }
      if (idx !== undefined && target[idx]) {
        const other = guestById[target[idx] as string];
        if (from) {
          next[from.t][from.i] = other.id;
          target[idx] = guestId;
          setSeats(next);
          setSelectedTable(tableId);
          setHeldGuest(null);
          say("success", `Swapped ${guest.name} and ${other.name}`);
          return;
        }
        idx = undefined;
      }
      if (idx === undefined) {
        if (from && from.t === tableId) {
          setSelectedTable(tableId);
          setHeldGuest(null);
          return;
        }
        idx = target.indexOf(null);
      }
      if (idx < 0) {
        say("warning", `${table.name} is full. Unseat someone or choose another table.`);
        return;
      }
      if (from) next[from.t][from.i] = null;
      target[idx] = guestId;
      setSeats(next);
      setSelectedTable(tableId);
      setHeldGuest(null);
      say("success", `${guest.name} is at ${table.name}, seat ${idx + 1}`);
    },
    [seats, say],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const next: Seats = {};
      let found = false;
      for (const [k, v] of Object.entries(seats)) {
        next[k] = v.map((g) => {
          if (g === guestId) {
            found = true;
            return null;
          }
          return g;
        });
      }
      if (!found) return;
      setSeats(next);
      setHeldGuest(null);
      say("info", `${guestById[guestId].name} is unseated`);
    },
    [seats, say],
  );

  const value = useMemo<PlanContextValue>(() => {
    const tableOf = tableOfGuest(seats);
    const attending = guests.filter((g) => g.rsvp === "yes");
    const results = evaluateRules(seats);
    const broken = results.filter((r) => r.status === "broken");
    const flaggedTables: Record<string, RuleResult[]> = {};
    const flaggedGuests = new Set<string>();
    for (const r of broken) {
      for (const t of r.tableIds) (flaggedTables[t] ??= []).push(r);
      for (const g of r.guestIds) flaggedGuests.add(g);
    }
    return {
      seats,
      tableOf,
      seatedCount: Object.keys(tableOf).length,
      attendingCount: attending.length,
      unseated: attending.filter((g) => !tableOf[g.id]).map((g) => g.id),
      capacity: tables.reduce((n, t) => n + t.seats, 0),
      rules: results,
      brokenRules: broken,
      flaggedTables,
      flaggedGuests,
      selectedTable,
      heldGuest,
      notice,
      selectTable: setSelectedTable,
      hold: setHeldGuest,
      place,
      unseat,
      dismissNotice: () => setNotice(null),
    };
  }, [seats, selectedTable, heldGuest, notice, place, unseat]);

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}
