"use client";

import { useToast } from "@once-ui-system/core";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { guests, tables, type Guest } from "@/lib/data";
import { evaluateRules, guestById, tableById, type RuleResult } from "@/lib/plan";

export type Seats = Record<string, (string | null)[]>;

function initialSeats(): Seats {
  const seats: Seats = {};
  for (const t of tables) seats[t.id] = Array.from({ length: t.seats }, () => null);
  for (const g of guests) {
    if (!g.table) continue;
    const row = seats[g.table];
    const i = row.indexOf(null);
    if (i >= 0) row[i] = g.id;
  }
  return seats;
}

type Location = { table: string; seat: number };

type PlanContextValue = {
  seats: Seats;
  locate: (guestId: string) => Location | null;
  tableOf: (guestId: string) => string | null;
  selectedGuestId: string | null;
  selectedTableId: string | null;
  draggingId: string | null;
  setDragging: (id: string | null) => void;
  pickGuest: (guestId: string | null) => void;
  selectTable: (tableId: string | null) => void;
  seatGuest: (guestId: string, tableId: string, seat?: number) => boolean;
  unseat: (guestId: string) => void;
  activateSeat: (tableId: string, seat: number) => void;
  activateTable: (tableId: string) => void;
  notice: string;
  canUndo: boolean;
  undo: () => void;
  rules: RuleResult[];
  brokenTables: Set<string>;
  brokenGuests: Set<string>;
  stats: {
    seated: number;
    totalGuests: number;
    attending: number;
    attendingSeated: number;
    toSeat: Guest[];
    undecided: Guest[];
    capacity: number;
    freeSeats: number;
    declined: number;
  };
  occupancy: (tableId: string) => { filled: number; capacity: number };
};

const PlanContext = createContext<PlanContextValue | null>(null);

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const { addToast } = useToast();
  const [seats, setSeats] = useState<Seats>(initialSeats);
  const [previous, setPrevious] = useState<Seats | null>(null);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [draggingId, setDragging] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const where = useMemo(() => {
    const map = new Map<string, Location>();
    for (const [table, row] of Object.entries(seats)) {
      row.forEach((id, seat) => {
        if (id) map.set(id, { table, seat });
      });
    }
    return map;
  }, [seats]);

  const locate = useCallback((guestId: string) => where.get(guestId) ?? null, [where]);
  const tableOf = useCallback((guestId: string) => where.get(guestId)?.table ?? null, [where]);

  const commit = useCallback(
    (next: Seats, message: string) => {
      setPrevious(seats);
      setSeats(next);
      setNotice(message);
    },
    [seats],
  );

  const seatGuest = useCallback(
    (guestId: string, tableId: string, seat?: number): boolean => {
      const guest = guestById.get(guestId);
      const table = tableById.get(tableId);
      if (!guest || !table) return false;
      const from = where.get(guestId) ?? null;
      const row = seats[tableId];
      if (seat === undefined && from?.table === tableId) {
        setSelectedGuestId(null);
        setSelectedTableId(tableId);
        return true;
      }
      const target = seat ?? row.indexOf(null);
      if (target < 0) {
        const message = `${table.name} is full. Move someone out first or pick another table.`;
        setNotice(message);
        addToast({ tone: "danger", message });
        return false;
      }
      const occupant = row[target];
      if (occupant === guestId) return true;
      const next: Seats = { ...seats };
      const dest = [...row];
      next[tableId] = dest;
      let displaced: string | null = null;
      if (from) {
        const src = from.table === tableId ? dest : [...seats[from.table]];
        next[from.table] = src;
        src[from.seat] = occupant;
      } else {
        displaced = occupant;
      }
      dest[target] = guestId;
      let message = `${guest.name} is now at ${table.name}, seat ${target + 1}.`;
      if (from && occupant) {
        message = `${guest.name} and ${guestById.get(occupant)?.name ?? "a guest"} swapped seats.`;
      }
      if (displaced) {
        message += ` ${guestById.get(displaced)?.name ?? "A guest"} is now unseated.`;
      }
      commit(next, message);
      setSelectedGuestId(null);
      setSelectedTableId(tableId);
      return true;
    },
    [seats, where, commit, addToast],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const from = where.get(guestId);
      const guest = guestById.get(guestId);
      if (!from || !guest) return;
      const next: Seats = { ...seats };
      const row = [...seats[from.table]];
      row[from.seat] = null;
      next[from.table] = row;
      commit(next, `${guest.name} is unseated.`);
      setSelectedGuestId(null);
    },
    [seats, where, commit],
  );

  const pickGuest = useCallback((guestId: string | null) => {
    setSelectedGuestId((current) => (guestId === null || current === guestId ? null : guestId));
  }, []);

  const selectTable = useCallback((tableId: string | null) => {
    setSelectedTableId(tableId);
  }, []);

  const activateSeat = useCallback(
    (tableId: string, seat: number) => {
      const occupant = seats[tableId][seat];
      if (selectedGuestId) {
        if (occupant === selectedGuestId) {
          setSelectedGuestId(null);
          return;
        }
        seatGuest(selectedGuestId, tableId, seat);
        return;
      }
      setSelectedTableId(tableId);
      if (occupant) setSelectedGuestId(occupant);
    },
    [seats, selectedGuestId, seatGuest],
  );

  const activateTable = useCallback(
    (tableId: string) => {
      if (selectedGuestId) {
        seatGuest(selectedGuestId, tableId);
        return;
      }
      setSelectedTableId((current) => (current === tableId ? null : tableId));
    },
    [selectedGuestId, seatGuest],
  );

  const undo = useCallback(() => {
    if (!previous) return;
    setSeats(previous);
    setPrevious(null);
    setNotice("Last change undone.");
    setSelectedGuestId(null);
  }, [previous]);

  const rules = useMemo(() => evaluateRules(tableOf), [tableOf]);

  const { brokenTables, brokenGuests } = useMemo(() => {
    const bt = new Set<string>();
    const bg = new Set<string>();
    for (const r of rules) {
      if (r.status !== "broken") continue;
      r.tables.forEach((t) => bt.add(t));
      r.guests.forEach((g) => bg.add(g));
    }
    return { brokenTables: bt, brokenGuests: bg };
  }, [rules]);

  const stats = useMemo(() => {
    const attendingGuests = guests.filter((g) => g.rsvp === "yes");
    const toSeat = attendingGuests.filter((g) => !where.has(g.id));
    const undecided = guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !where.has(g.id));
    const capacity = tables.reduce((sum, t) => sum + t.seats, 0);
    return {
      seated: where.size,
      totalGuests: guests.length,
      attending: attendingGuests.length,
      attendingSeated: attendingGuests.length - toSeat.length,
      toSeat,
      undecided,
      capacity,
      freeSeats: capacity - where.size,
      declined: guests.filter((g) => g.rsvp === "no").length,
    };
  }, [where]);

  const occupancy = useCallback(
    (tableId: string) => {
      const row = seats[tableId] ?? [];
      return { filled: row.filter(Boolean).length, capacity: row.length };
    },
    [seats],
  );

  const value: PlanContextValue = {
    seats,
    locate,
    tableOf,
    selectedGuestId,
    selectedTableId,
    draggingId,
    setDragging,
    pickGuest,
    selectTable,
    seatGuest,
    unseat,
    activateSeat,
    activateTable,
    notice,
    canUndo: previous !== null,
    undo,
    rules,
    brokenTables,
    brokenGuests,
    stats,
    occupancy,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
