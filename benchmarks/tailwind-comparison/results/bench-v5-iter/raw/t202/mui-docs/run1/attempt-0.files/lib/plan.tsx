"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { guestById, guests, tableById, tables } from "./data";
import { evaluateRules, tableOf, type RuleResult, type SeatMap } from "./rules";

export interface PlaceResult {
  ok: boolean;
  message: string;
}

interface PlanContextValue {
  seats: SeatMap;
  /** guest id -> table id (null when unseated) */
  tableOfGuest: (guestId: string) => string | null;
  seatedCount: (tableId: string) => number;
  place: (guestId: string, tableId: string, seatIndex?: number) => PlaceResult;
  unseat: (guestId: string) => PlaceResult;
  ruleResults: RuleResult[];
  /** table id -> broken rule results touching it */
  brokenByTable: Record<string, RuleResult[]>;
  totals: {
    capacity: number;
    seated: number;
    attending: number;
    attendingUnseated: number;
    unconfirmedSeated: number;
  };
}

const PlanContext = createContext<PlanContextValue | null>(null);

function initialSeats(): SeatMap {
  const map: SeatMap = {};
  for (const t of tables) map[t.id] = Array.from({ length: t.seats }, () => null);
  for (const g of guests) {
    if (!g.table) continue;
    const row = map[g.table];
    if (!row) continue;
    const free = row.indexOf(null);
    if (free >= 0) row[free] = g.id;
  }
  return map;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [seats, setSeats] = useState<SeatMap>(initialSeats);
  // Latest seats for callbacks used from window-level pointer listeners.
  const seatsRef = useRef(seats);
  seatsRef.current = seats;

  const place = useCallback((guestId: string, tableId: string, seatIndex?: number): PlaceResult => {
    const current = seatsRef.current;
    const guest = guestById[guestId];
    const table = tableById[tableId];
    const row = current[tableId];
    if (!guest || !table || !row) return { ok: false, message: "That seat is not available." };
    if (guest.rsvp === "no") {
      return { ok: false, message: `${guest.name} has declined, so they cannot be seated.` };
    }
    const currentTable = tableOf(current, guestId);
    const currentSeat = currentTable ? (current[currentTable] ?? []).indexOf(guestId) : -1;

    let target = -1;
    if (seatIndex !== undefined && row[seatIndex] === null) target = seatIndex;
    if (target < 0 && currentTable === tableId) {
      return { ok: true, message: `${guest.name} is already at ${table.name}.` };
    }
    if (target < 0) target = row.indexOf(null);
    if (target < 0) return { ok: false, message: `${table.name} is full (${table.seats} of ${table.seats} seats taken).` };

    const next: SeatMap = { ...current };
    if (currentTable) {
      const oldRow = [...(next[currentTable] ?? [])];
      oldRow[currentSeat] = null;
      next[currentTable] = oldRow;
    }
    const newRow = currentTable === tableId ? [...(next[tableId] ?? [])] : [...row];
    newRow[target] = guestId;
    next[tableId] = newRow;
    seatsRef.current = next;
    setSeats(next);
    const verb = currentTable && currentTable !== tableId ? "moved to" : "seated at";
    return { ok: true, message: `${guest.name} ${verb} ${table.name}, seat ${target + 1}.` };
  }, []);

  const unseat = useCallback((guestId: string): PlaceResult => {
    const current = seatsRef.current;
    const guest = guestById[guestId];
    const t = tableOf(current, guestId);
    if (!guest || !t) return { ok: false, message: "That guest has no seat." };
    const row = (current[t] ?? []).map((id) => (id === guestId ? null : id));
    const next = { ...current, [t]: row };
    seatsRef.current = next;
    setSeats(next);
    return { ok: true, message: `${guest.name} unseated from ${tableById[t]?.name ?? t}.` };
  }, []);

  const value = useMemo<PlanContextValue>(() => {
    const ruleResults = evaluateRules(seats);
    const brokenByTable: Record<string, RuleResult[]> = {};
    for (const r of ruleResults) {
      if (r.status !== "broken") continue;
      for (const id of r.tableIds) (brokenByTable[id] ??= []).push(r);
    }
    let seated = 0;
    let unconfirmedSeated = 0;
    for (const row of Object.values(seats)) {
      for (const id of row) {
        if (!id) continue;
        seated += 1;
        if (guestById[id]?.rsvp !== "yes") unconfirmedSeated += 1;
      }
    }
    const attending = guests.filter((g) => g.rsvp === "yes").length;
    const attendingSeated = seated - unconfirmedSeated;
    return {
      seats,
      tableOfGuest: (id) => tableOf(seats, id),
      seatedCount: (tableId) => (seats[tableId] ?? []).filter(Boolean).length,
      place,
      unseat,
      ruleResults,
      brokenByTable,
      totals: {
        capacity: tables.reduce((n, t) => n + t.seats, 0),
        seated,
        attending,
        attendingUnseated: attending - attendingSeated,
        unconfirmedSeated,
      },
    };
  }, [seats, place, unseat]);

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}
