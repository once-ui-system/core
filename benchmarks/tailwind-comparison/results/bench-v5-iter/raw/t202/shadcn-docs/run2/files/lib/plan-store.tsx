"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  guests as seedGuests,
  initialSeatOverrides,
  rules,
  tables,
  type Guest,
} from "@/lib/data";
import { evaluateRules, type RuleResult } from "@/lib/rules";

export interface PlacedGuest extends Guest {
  seat: number | null;
}

interface Placement {
  table: string;
  seat: number;
}

export interface Counts {
  total: number;
  attending: number;
  seated: number;
  unseated: number;
  awaiting: number;
  declined: number;
  capacity: number;
}

interface PlanContextValue {
  guests: PlacedGuest[];
  byId: Map<string, PlacedGuest>;
  /** Seat-by-seat occupants of each table. */
  occupancy: Record<string, (PlacedGuest | null)[]>;
  counts: Counts;
  ruleResults: RuleResult[];
  brokenTables: Set<string>;
  selectedTable: string | null;
  selectTable: (id: string | null) => void;
  armed: string | null;
  arm: (id: string | null) => void;
  dragging: string | null;
  setDragging: (id: string | null) => void;
  place: (guestId: string, tableId: string, seat?: number) => boolean;
  unseat: (guestId: string) => void;
}

const PlanContext = React.createContext<PlanContextValue | null>(null);

function initialPlacements(): Record<string, Placement> {
  const out: Record<string, Placement> = {};
  const next: Record<string, number> = {};
  for (const g of seedGuests) {
    if (!g.table) continue;
    const override = initialSeatOverrides[g.id];
    if (override !== undefined) {
      out[g.id] = { table: g.table, seat: override };
    }
  }
  for (const g of seedGuests) {
    if (!g.table || out[g.id]) continue;
    const taken = new Set(
      Object.values(out)
        .filter((p) => p.table === g.table)
        .map((p) => p.seat),
    );
    let s = next[g.table] ?? 0;
    while (taken.has(s)) s++;
    next[g.table] = s + 1;
    out[g.id] = { table: g.table, seat: s };
  }
  return out;
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [placements, setPlacements] = React.useState<Record<string, Placement>>(initialPlacements);
  const [selectedTable, setSelectedTable] = React.useState<string | null>(null);
  const [armed, setArmed] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState<string | null>(null);

  const guests = React.useMemo<PlacedGuest[]>(
    () =>
      seedGuests.map((g) => {
        const p = placements[g.id];
        return { ...g, table: p ? p.table : null, seat: p ? p.seat : null };
      }),
    [placements],
  );

  const byId = React.useMemo(() => new Map(guests.map((g) => [g.id, g])), [guests]);

  const occupancy = React.useMemo(() => {
    const occ: Record<string, (PlacedGuest | null)[]> = {};
    for (const t of tables) occ[t.id] = Array.from({ length: t.seats }, () => null);
    for (const g of guests) {
      if (g.table && g.seat !== null && occ[g.table]) occ[g.table][g.seat] = g;
    }
    return occ;
  }, [guests]);

  const counts = React.useMemo<Counts>(() => {
    const attendingGuests = guests.filter((g) => g.rsvp === "yes");
    return {
      total: guests.length,
      attending: attendingGuests.length,
      seated: guests.filter((g) => g.table).length,
      unseated: attendingGuests.filter((g) => !g.table).length,
      awaiting: guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !g.table).length,
      declined: guests.filter((g) => g.rsvp === "no").length,
      capacity: tables.reduce((n, t) => n + t.seats, 0),
    };
  }, [guests]);

  const ruleResults = React.useMemo(() => evaluateRules(rules, guests), [guests]);

  const brokenTables = React.useMemo(() => {
    const s = new Set<string>();
    for (const r of ruleResults) if (r.status === "broken") r.tables.forEach((t) => s.add(t));
    return s;
  }, [ruleResults]);

  const place = React.useCallback(
    (guestId: string, tableId: string, seat?: number): boolean => {
      const guest = byId.get(guestId);
      const table = tables.find((t) => t.id === tableId);
      if (!guest || !table) return false;
      if (guest.rsvp === "no") {
        toast.error(`${guest.name} has declined`, { description: "Declined guests are not given a seat." });
        return false;
      }
      const occ = occupancy[tableId] ?? [];
      let target = seat;
      if (target === undefined) {
        if (guest.table === tableId) {
          toast.info(`${guest.name} is already at ${table.name}`);
          return false;
        }
        target = occ.findIndex((o) => o === null);
        if (target < 0) {
          toast.error(`${table.name} is full`, { description: `All ${table.seats} seats are taken.` });
          return false;
        }
      }
      const occupant = occ[target] ?? null;
      if (occupant && occupant.id === guestId) return false;

      if (occupant) {
        if (!guest.table || guest.seat === null) {
          toast.error(`Seat ${target + 1} at ${table.name} is taken`, {
            description: `${occupant.name} is sitting there. Pick an empty seat.`,
          });
          return false;
        }
        const fromTable = guest.table;
        const fromSeat = guest.seat;
        setPlacements((prev) => ({
          ...prev,
          [guestId]: { table: tableId, seat: target },
          [occupant.id]: { table: fromTable, seat: fromSeat },
        }));
        toast.success(`Swapped ${guest.name} and ${occupant.name}`);
      } else {
        setPlacements((prev) => ({ ...prev, [guestId]: { table: tableId, seat: target } }));
        const note =
          guest.rsvp === "maybe" || guest.rsvp === "pending" ? "They have not confirmed yet." : undefined;
        toast.success(`${guest.name} seated at ${table.name}`, {
          description: note ?? `Seat ${target + 1} of ${table.seats}`,
        });
      }
      setSelectedTable(tableId);
      setArmed(null);
      setDragging(null);
      return true;
    },
    [byId, occupancy],
  );

  const unseat = React.useCallback(
    (guestId: string) => {
      const guest = byId.get(guestId);
      if (!guest || !guest.table) return;
      setPlacements((prev) => {
        const next = { ...prev };
        delete next[guestId];
        return next;
      });
      toast(`${guest.name} unseated`, { description: "Back in the unseated list." });
      setArmed(null);
      setDragging(null);
    },
    [byId],
  );

  const value = React.useMemo<PlanContextValue>(
    () => ({
      guests,
      byId,
      occupancy,
      counts,
      ruleResults,
      brokenTables,
      selectedTable,
      selectTable: setSelectedTable,
      armed,
      arm: setArmed,
      dragging,
      setDragging,
      place,
      unseat,
    }),
    [guests, byId, occupancy, counts, ruleResults, brokenTables, selectedTable, armed, dragging, place, unseat],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const ctx = React.useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}
