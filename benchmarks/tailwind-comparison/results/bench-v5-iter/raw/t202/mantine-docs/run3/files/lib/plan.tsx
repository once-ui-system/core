"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { notifications } from "@mantine/notifications";
import { GUESTS, TABLES, type Guest } from "./data";
import { evaluateRules, guestById, initialSeats, tableById, type RuleResult, type SeatMap } from "./rules";

type Plan = {
  seats: SeatMap;
  rules: RuleResult[];
  selectedGuest: string | null;
  selectedTable: string | null;
  status: string;
  canUndo: boolean;
  selectGuest: (id: string | null) => void;
  selectTable: (id: string | null) => void;
  place: (guestId: string, tableId: string, seat?: number) => boolean;
  unseat: (guestId: string) => void;
  undo: () => void;
  reset: () => void;
  occupants: (tableId: string) => (Guest | null)[];
  tableOf: (guestId: string) => string | null;
};

const PlanContext = createContext<Plan | null>(null);

export function usePlan(): Plan {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [seats, setSeats] = useState<SeatMap>(initialSeats);
  const seatsRef = useRef(seats);
  const history = useRef<{ seats: SeatMap; status: string }[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const commit = useCallback((next: SeatMap, message: string) => {
    history.current = [...history.current.slice(-30), { seats: seatsRef.current, status }];
    seatsRef.current = next;
    setSeats(next);
    setStatus(message);
    setCanUndo(true);
  }, [status]);

  const place = useCallback(
    (guestId: string, tableId: string, seat?: number): boolean => {
      const guest = guestById.get(guestId);
      const table = tableById.get(tableId);
      if (!guest || !table) return false;
      if (guest.rsvp === "no") {
        notifications.show({ color: "red", title: "Declined", message: `${guest.name} has declined, so they are not seated.` });
        return false;
      }
      const current = seatsRef.current;
      const at = new Map<number, string>();
      for (const [gid, s] of Object.entries(current)) if (s.table === tableId) at.set(s.seat, gid);

      let target = seat;
      if (target === undefined) {
        const here = current[guestId];
        if (here && here.table === tableId) {
          setSelectedGuest(null);
          setSelectedTable(tableId);
          return true;
        }
        for (let i = 0; i < table.seats; i += 1) {
          if (!at.has(i)) {
            target = i;
            break;
          }
        }
        if (target === undefined) {
          notifications.show({
            color: "red",
            title: `${table.name} is full`,
            message: `All ${table.seats} seats are taken. Pick another table or tap a seat to swap.`,
          });
          return false;
        }
      }

      const next: SeatMap = { ...current };
      const occupant = at.get(target);
      const from = current[guestId];
      if (occupant === guestId) {
        setSelectedGuest(null);
        return true;
      }
      let message = `${guest.name} seated at ${table.name}, seat ${target + 1}.`;
      if (occupant) {
        const other = guestById.get(occupant)?.name ?? "Another guest";
        if (from) {
          next[occupant] = { table: from.table, seat: from.seat };
          message = `${guest.name} and ${other} swapped seats.`;
        } else {
          delete next[occupant];
          message = `${guest.name} seated at ${table.name}, seat ${target + 1}; ${other} is unseated.`;
        }
      } else if (from) {
        message = from.table === tableId ? `${guest.name} moved to seat ${target + 1} at ${table.name}.` : `${guest.name} moved from ${tableById.get(from.table)?.name ?? "a table"} to ${table.name}.`;
      }
      next[guestId] = { table: tableId, seat: target };
      commit(next, message);
      setSelectedGuest(null);
      setSelectedTable(tableId);
      return true;
    },
    [commit],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const current = seatsRef.current;
      const guest = guestById.get(guestId);
      if (!guest || !current[guestId]) {
        setSelectedGuest(null);
        return;
      }
      const next = { ...current };
      const was = tableById.get(current[guestId].table)?.name ?? "their table";
      delete next[guestId];
      commit(next, `${guest.name} unseated from ${was}.`);
      setSelectedGuest(null);
    },
    [commit],
  );

  const undo = useCallback(() => {
    const prev = history.current.pop();
    if (!prev) return;
    seatsRef.current = prev.seats;
    setSeats(prev.seats);
    setStatus(prev.status ? `Undone. ${prev.status}` : "Last change undone.");
    setCanUndo(history.current.length > 0);
    setSelectedGuest(null);
  }, []);

  const reset = useCallback(() => {
    const first = initialSeats();
    history.current = [];
    seatsRef.current = first;
    setSeats(first);
    setStatus("Plan reset to the starting arrangement.");
    setCanUndo(false);
    setSelectedGuest(null);
  }, []);

  const rules = useMemo(() => evaluateRules(seats), [seats]);

  const occupants = useCallback(
    (tableId: string): (Guest | null)[] => {
      const t = tableById.get(tableId);
      const out: (Guest | null)[] = Array.from({ length: t?.seats ?? 0 }, () => null);
      for (const [gid, s] of Object.entries(seats)) {
        if (s.table === tableId) {
          const g = guestById.get(gid);
          if (g && s.seat < out.length) out[s.seat] = g;
        }
      }
      return out;
    },
    [seats],
  );

  const tableOf = useCallback((guestId: string) => seats[guestId]?.table ?? null, [seats]);

  const value = useMemo<Plan>(
    () => ({
      seats,
      rules,
      selectedGuest,
      selectedTable,
      status,
      canUndo,
      selectGuest: setSelectedGuest,
      selectTable: setSelectedTable,
      place,
      unseat,
      undo,
      reset,
      occupants,
      tableOf,
    }),
    [seats, rules, selectedGuest, selectedTable, status, canUndo, place, unseat, undo, reset, occupants, tableOf],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlanStats() {
  const { seats } = usePlan();
  return useMemo(() => {
    const attending = GUESTS.filter((g) => g.rsvp === "yes");
    const unseated = attending.filter((g) => !seats[g.id]);
    const seatedCount = Object.keys(seats).length;
    const capacity = TABLES.reduce((n, t) => n + t.seats, 0);
    const perTable: Record<string, number> = {};
    for (const s of Object.values(seats)) perTable[s.table] = (perTable[s.table] ?? 0) + 1;
    const unconfirmed = GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !seats[g.id]);
    return { attending, unseated, unconfirmed, seatedCount, capacity, perTable };
  }, [seats]);
}
