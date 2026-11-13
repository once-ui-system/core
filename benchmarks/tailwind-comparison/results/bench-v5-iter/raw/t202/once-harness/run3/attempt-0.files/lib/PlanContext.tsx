"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { GUESTS, TABLES, type Guest, type TableDef } from "./data";
import {
  buildSeatMap,
  evaluateRules,
  initialAssignment,
  type Assignment,
  type RuleResult,
} from "./plan";

const GUEST_BY_ID: Record<string, Guest> = Object.fromEntries(GUESTS.map((x) => [x.id, x]));
const TABLE_BY_ID: Record<string, TableDef> = Object.fromEntries(TABLES.map((x) => [x.id, x]));

type PlanContextValue = {
  assign: Assignment;
  seatMap: Record<string, (string | null)[]>;
  rules: RuleResult[];
  brokenTables: Set<string>;
  brokenGuests: Set<string>;
  armed: string | null;
  setArmed: (id: string | null) => void;
  selectedTable: string | null;
  selectTable: (id: string | null) => void;
  place: (guestId: string, tableId: string, seatIndex?: number) => boolean;
  unseat: (guestId: string) => void;
  reset: () => void;
  status: string;
  counts: {
    attending: number;
    seated: number;
    unseated: number;
    freeSeats: number;
    totalSeats: number;
    possibleUnseated: number;
    broken: number;
    pending: number;
  };
};

const PlanContext = createContext<PlanContextValue | null>(null);

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [assign, setAssign] = useState<Assignment>(() => initialAssignment());
  const [armed, setArmedState] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>("t-1");
  const [status, setStatus] = useState("");

  const seatMap = useMemo(() => buildSeatMap(assign), [assign]);
  const rules = useMemo(() => evaluateRules(assign), [assign]);

  const brokenTables = useMemo(() => {
    const set = new Set<string>();
    for (const r of rules) if (r.state === "broken") for (const t of r.tables) set.add(t);
    return set;
  }, [rules]);

  const brokenGuests = useMemo(() => {
    const set = new Set<string>();
    for (const r of rules) if (r.state === "broken") for (const gid of r.guests) set.add(gid);
    return set;
  }, [rules]);

  const counts = useMemo(() => {
    const attendingGuests = GUESTS.filter((x) => x.rsvp === "yes");
    const seated = Object.values(assign).filter((s) => s !== null).length;
    const unseated = attendingGuests.filter((x) => !assign[x.id]).length;
    const possibleUnseated = GUESTS.filter(
      (x) => (x.rsvp === "maybe" || x.rsvp === "pending") && !assign[x.id],
    ).length;
    const totalSeats = TABLES.reduce((sum, t) => sum + t.seats, 0);
    return {
      attending: attendingGuests.length,
      seated,
      unseated,
      freeSeats: totalSeats - seated,
      totalSeats,
      possibleUnseated,
      broken: rules.filter((r) => r.state === "broken").length,
      pending: rules.filter((r) => r.state === "pending").length,
    };
  }, [assign, rules]);

  const setArmed = useCallback((id: string | null) => {
    setArmedState(id);
    if (id) setStatus(`${GUEST_BY_ID[id]?.name ?? "Guest"} selected. Choose a seat or a table.`);
  }, []);

  const selectTable = useCallback((id: string | null) => setSelectedTable(id), []);

  const place = useCallback(
    (guestId: string, tableId: string, seatIndex?: number): boolean => {
      const guest = GUEST_BY_ID[guestId];
      const table = TABLE_BY_ID[tableId];
      if (!guest || !table) return false;
      if (guest.rsvp === "no") {
        setStatus(`${guest.name} has declined and cannot be seated.`);
        return false;
      }
      const occupants = seatMap[tableId];
      const current = assign[guestId] ?? null;
      let target = seatIndex;
      if (target === undefined) {
        if (current && current.table === tableId) {
          setStatus(`${guest.name} is already at ${table.name}.`);
          setArmedState(null);
          return true;
        }
        target = occupants.findIndex((o) => o === null);
        if (target < 0) {
          setStatus(`${table.name} is full. Pick another table or free a seat.`);
          return false;
        }
      }
      const other = occupants[target];
      if (other === guestId) {
        setArmedState(null);
        return true;
      }
      if (other && !current) {
        setStatus(
          `That seat is taken by ${GUEST_BY_ID[other]?.name ?? "another guest"}. Choose an empty seat.`,
        );
        return false;
      }
      setAssign((prev) => {
        const next = { ...prev };
        if (other && current) next[other] = { table: current.table, seat: current.seat };
        next[guestId] = { table: tableId, seat: target };
        return next;
      });
      setArmedState(null);
      setSelectedTable(tableId);
      setStatus(
        other
          ? `${guest.name} and ${GUEST_BY_ID[other]?.name ?? "guest"} swapped seats.`
          : `${guest.name} seated at ${table.name}, seat ${target + 1}.`,
      );
      return true;
    },
    [assign, seatMap],
  );

  const unseat = useCallback((guestId: string) => {
    setAssign((prev) => ({ ...prev, [guestId]: null }));
    setArmedState(null);
    setStatus(`${GUEST_BY_ID[guestId]?.name ?? "Guest"} is unseated.`);
  }, []);

  const reset = useCallback(() => {
    setAssign(initialAssignment());
    setArmedState(null);
    setStatus("Plan reset to the starting arrangement.");
  }, []);

  const value = useMemo<PlanContextValue>(
    () => ({
      assign,
      seatMap,
      rules,
      brokenTables,
      brokenGuests,
      armed,
      setArmed,
      selectedTable,
      selectTable,
      place,
      unseat,
      reset,
      status,
      counts,
    }),
    [
      assign,
      seatMap,
      rules,
      brokenTables,
      brokenGuests,
      armed,
      setArmed,
      selectedTable,
      selectTable,
      place,
      unseat,
      reset,
      status,
      counts,
    ],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
