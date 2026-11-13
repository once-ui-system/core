"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { GUEST_BY_ID, TABLE_BY_ID } from "@/lib/data";
import {
  evaluateRules,
  initialSeating,
  locate,
  type Location,
  type RuleResult,
  type Seating,
} from "@/lib/seating";

type PlanContextValue = {
  seating: Seating;
  locations: Record<string, Location>;
  results: RuleResult[];
  heldId: string | null;
  selectedTable: string | null;
  dragId: string | null;
  notice: string;
  hold: (id: string | null) => void;
  selectTable: (id: string | null) => void;
  setDragId: (id: string | null) => void;
  place: (guestId: string, tableId: string, seat?: number) => void;
  unseat: (guestId: string) => void;
  reset: () => void;
};

const PlanContext = createContext<PlanContextValue | null>(null);

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [seating, setSeating] = useState<Seating>(initialSeating);
  const [heldId, setHeldId] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>("t-1");
  const [dragId, setDragId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const locations = useMemo(() => locate(seating), [seating]);
  const results = useMemo(() => evaluateRules(seating, locations), [seating, locations]);

  const place = useCallback(
    (guestId: string, tableId: string, seat?: number) => {
      const guest = GUEST_BY_ID[guestId];
      const table = TABLE_BY_ID[tableId];
      if (!guest || !table) return;
      if (guest.rsvp === "no") {
        setNotice(`${guest.name} has declined, so they cannot be seated.`);
        setHeldId(null);
        return;
      }
      const from = locations[guestId];
      const slots = seating[tableId];
      let idx: number;
      if (seat === undefined) {
        if (from && from.tableId === tableId) {
          setNotice(`${guest.name} is already at ${table.name}.`);
          setHeldId(null);
          setSelectedTable(tableId);
          return;
        }
        idx = slots.indexOf(null);
        if (idx < 0) {
          setNotice(
            `${table.name} is full (${table.seats} of ${table.seats}). Choose another table, or tap a seat to swap.`,
          );
          return;
        }
      } else {
        idx = seat;
      }
      const occupant = slots[idx];
      if (occupant === guestId) {
        setHeldId(null);
        return;
      }
      const next: Seating = {};
      for (const key of Object.keys(seating)) next[key] = [...seating[key]];
      if (from) next[from.tableId][from.seat] = null;
      next[tableId][idx] = guestId;
      let msg = from
        ? `${guest.name} moved from ${TABLE_BY_ID[from.tableId].name} to ${table.name}, seat ${idx + 1}.`
        : `${guest.name} seated at ${table.name}, seat ${idx + 1}.`;
      if (occupant) {
        const other = GUEST_BY_ID[occupant].name;
        if (from) {
          next[from.tableId][from.seat] = occupant;
          msg = `${guest.name} and ${other} swapped seats.`;
        } else {
          msg = `${guest.name} takes ${other}'s seat at ${table.name}; ${other} is unseated.`;
        }
      }
      setSeating(next);
      setNotice(msg);
      setHeldId(null);
      setSelectedTable(tableId);
    },
    [seating, locations],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const from = locations[guestId];
      if (!from) return;
      const next: Seating = {};
      for (const key of Object.keys(seating)) next[key] = [...seating[key]];
      next[from.tableId][from.seat] = null;
      setSeating(next);
      setHeldId(null);
      setNotice(`${GUEST_BY_ID[guestId].name} unseated from ${TABLE_BY_ID[from.tableId].name}.`);
    },
    [seating, locations],
  );

  const reset = useCallback(() => {
    setSeating(initialSeating());
    setHeldId(null);
    setNotice("Plan reset to the starting arrangement.");
  }, []);

  const hold = useCallback((id: string | null) => {
    setHeldId(id);
    if (id) setNotice(`${GUEST_BY_ID[id].name} picked up: tap a seat or table to place them.`);
    else setNotice("");
  }, []);

  const value = useMemo<PlanContextValue>(
    () => ({
      seating,
      locations,
      results,
      heldId,
      selectedTable,
      dragId,
      notice,
      hold,
      selectTable: setSelectedTable,
      setDragId,
      place,
      unseat,
      reset,
    }),
    [seating, locations, results, heldId, selectedTable, dragId, notice, hold, place, unseat, reset],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
