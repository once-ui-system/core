"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  type Guest,
  type Rule,
  type SeatTable,
  fixtures,
  guests as seedGuests,
  rules,
  tables,
} from "@/lib/data";

export type PlacedGuest = Guest & { seat: number | null };

export type RuleStatus = {
  index: number;
  rule: Rule;
  status: "ok" | "broken" | "open";
  message: string;
  tableIds: string[];
  guestIds: string[];
};

export type Occupancy = Record<string, (PlacedGuest | null)[]>;

function seedPlacement(): PlacedGuest[] {
  const next: Record<string, number> = {};
  return seedGuests.map((guest) => {
    if (!guest.table) return { ...guest, seat: null };
    const seat = next[guest.table] ?? 0;
    next[guest.table] = seat + 1;
    return { ...guest, seat };
  });
}

const tableById = (id: string): SeatTable | undefined => tables.find((table) => table.id === id);

const centre = (id: string) => {
  const fixture = fixtures.find((item) => item.id === id);
  if (!fixture) return { x: 0, y: 0 };
  return { x: fixture.x + fixture.w / 2, y: fixture.y + fixture.h / 2 };
};

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** A table counts as near the garden doors within this many metres. */
export const NEAR_DOORS_M = 4;
/** ...and far enough from the band to talk. */
export const AWAY_FROM_BAND_M = 6;

function firstName(name: string) {
  return name.replace(/^Avó /, "Avó ").split(" ")[0] === "Avó"
    ? name.split(" ").slice(0, 2).join(" ")
    : name.split(" ")[0];
}

export function evaluateRules(list: PlacedGuest[]): RuleStatus[] {
  const byId = new Map(list.map((guest) => [guest.id, guest]));
  const doors = centre("f-4");
  const band = centre("f-1");

  return rules.map((rule, index): RuleStatus => {
    const people = rule.guests.map((id) => byId.get(id)).filter((g): g is PlacedGuest => !!g);
    const seated = people.filter((person) => person.table);
    const tableIds = Array.from(new Set(seated.map((person) => person.table as string)));
    const guestIds = people.map((person) => person.id);
    const nameOf = (id: string | null) => (id ? (tableById(id)?.name ?? id) : "");
    const base = { index, rule, guestIds };

    if (rule.kind === "together") {
      const [a, b] = people;
      if (!a || !b) return { ...base, status: "open", message: "Guest missing", tableIds };
      if (a.table && b.table) {
        return a.table === b.table
          ? { ...base, status: "ok", message: `Together at ${nameOf(a.table)}`, tableIds }
          : {
              ...base,
              status: "broken",
              message: `${firstName(a.name)} is at ${nameOf(a.table)}, ${firstName(b.name)} at ${nameOf(b.table)}`,
              tableIds,
            };
      }
      const missing = [a, b].filter((person) => !person.table).map((p) => firstName(p.name));
      return {
        ...base,
        status: "open",
        message: `Waiting to seat ${missing.join(" and ")}`,
        tableIds,
      };
    }

    if (rule.kind === "apart") {
      const [a, b] = people;
      if (a?.table && b?.table && a.table === b.table) {
        return {
          ...base,
          status: "broken",
          message: `${firstName(a.name)} and ${firstName(b.name)} both sit at ${nameOf(a.table)}`,
          tableIds,
        };
      }
      return { ...base, status: "ok", message: "Kept apart", tableIds };
    }

    const person = people[0];
    if (!person?.table) {
      return { ...base, status: "open", message: `${person ? firstName(person.name) : "Guest"} needs a seat`, tableIds };
    }
    const table = tableById(person.table);
    if (!table) return { ...base, status: "open", message: "Table not found", tableIds };
    const toDoors = distance(table, doors);
    const toBand = distance(table, band);
    if (toDoors <= NEAR_DOORS_M && toBand >= AWAY_FROM_BAND_M) {
      return {
        ...base,
        status: "ok",
        message: `${table.name} is ${toDoors.toFixed(1)} m from the garden doors`,
        tableIds,
      };
    }
    return {
      ...base,
      status: "broken",
      message:
        toDoors > NEAR_DOORS_M
          ? `${table.name} is ${toDoors.toFixed(1)} m from the garden doors`
          : `${table.name} is too close to the band`,
      tableIds,
    };
  });
}

type Result = { ok: boolean; message: string };

type SeatingContextValue = {
  guests: PlacedGuest[];
  occupancy: Occupancy;
  ruleStatuses: RuleStatus[];
  brokenTableIds: Set<string>;
  brokenGuestIds: Set<string>;
  heldGuestId: string | null;
  selectedTableId: string | null;
  notice: string;
  seatGuest: (guestId: string, tableId: string, seat?: number) => Result;
  unseatGuest: (guestId: string) => void;
  holdGuest: (guestId: string | null) => void;
  selectTable: (tableId: string | null) => void;
  counts: {
    attending: number;
    seated: number;
    unseated: number;
    capacity: number;
    broken: number;
  };
};

const SeatingContext = createContext<SeatingContextValue | null>(null);

export function SeatingProvider({ children }: { children: React.ReactNode }) {
  const [guests, setGuests] = useState<PlacedGuest[]>(seedPlacement);
  const [heldGuestId, setHeld] = useState<string | null>(null);
  const [selectedTableId, setSelectedTable] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const occupancy = useMemo<Occupancy>(() => {
    const map: Occupancy = {};
    for (const table of tables) map[table.id] = Array.from({ length: table.seats }, () => null);
    for (const guest of guests) {
      if (guest.table && guest.seat !== null && map[guest.table]) map[guest.table][guest.seat] = guest;
    }
    return map;
  }, [guests]);

  const ruleStatuses = useMemo(() => evaluateRules(guests), [guests]);

  const { brokenTableIds, brokenGuestIds } = useMemo(() => {
    const t = new Set<string>();
    const g = new Set<string>();
    for (const status of ruleStatuses) {
      if (status.status !== "broken") continue;
      status.tableIds.forEach((id) => t.add(id));
      status.guestIds.forEach((id) => g.add(id));
    }
    return { brokenTableIds: t, brokenGuestIds: g };
  }, [ruleStatuses]);

  const seatGuest = useCallback(
    (guestId: string, tableId: string, seat?: number): Result => {
      const guest = guests.find((item) => item.id === guestId);
      const table = tableById(tableId);
      if (!guest || !table) return { ok: false, message: "Could not find that seat." };
      const slots = occupancy[tableId];
      let target = seat;
      if (target === undefined) {
        if (guest.table === tableId) {
          setNotice(`${guest.name} is already at ${table.name}.`);
          return { ok: true, message: "Already there" };
        }
        target = slots.findIndex((slot) => slot === null);
        if (target === -1) {
          const message = `${table.name} is full. Free a seat or pick another table.`;
          setNotice(message);
          return { ok: false, message };
        }
      }
      const occupant = slots[target];
      if (occupant?.id === guestId) return { ok: true, message: "Already there" };
      const from = { table: guest.table, seat: guest.seat };
      setGuests((current) =>
        current.map((item) => {
          if (item.id === guestId) return { ...item, table: tableId, seat: target as number };
          if (occupant && item.id === occupant.id) return { ...item, table: from.table, seat: from.seat };
          return item;
        }),
      );
      const message = occupant
        ? `Swapped ${guest.name} and ${occupant.name}.`
        : `${guest.name} seated at ${table.name}, seat ${target + 1}.`;
      setNotice(message);
      setHeld(null);
      setSelectedTable(tableId);
      return { ok: true, message };
    },
    [guests, occupancy],
  );

  const unseatGuest = useCallback(
    (guestId: string) => {
      const guest = guests.find((item) => item.id === guestId);
      if (!guest) return;
      setGuests((current) =>
        current.map((item) => (item.id === guestId ? { ...item, table: null, seat: null } : item)),
      );
      setNotice(`${guest.name} is now unseated.`);
      setHeld(null);
    },
    [guests],
  );

  const holdGuest = useCallback((guestId: string | null) => {
    setHeld(guestId);
    if (guestId) setNotice("Guest picked up. Tap an empty seat or a table to seat them.");
  }, []);

  const selectTable = useCallback((tableId: string | null) => setSelectedTable(tableId), []);

  const counts = useMemo(() => {
    const attending = guests.filter((guest) => guest.rsvp === "yes");
    return {
      attending: attending.length,
      seated: guests.filter((guest) => guest.table).length,
      unseated: attending.filter((guest) => !guest.table).length,
      capacity: tables.reduce((sum, table) => sum + table.seats, 0),
      broken: ruleStatuses.filter((status) => status.status === "broken").length,
    };
  }, [guests, ruleStatuses]);

  const value: SeatingContextValue = {
    guests,
    occupancy,
    ruleStatuses,
    brokenTableIds,
    brokenGuestIds,
    heldGuestId,
    selectedTableId,
    notice,
    seatGuest,
    unseatGuest,
    holdGuest,
    selectTable,
    counts,
  };

  return <SeatingContext.Provider value={value}>{children}</SeatingContext.Provider>;
}

export function useSeating(): SeatingContextValue {
  const context = useContext(SeatingContext);
  if (!context) throw new Error("useSeating must be used inside SeatingProvider");
  return context;
}

export function tableName(id: string | null): string {
  return id ? (tableById(id)?.name ?? id) : "Unseated";
}
