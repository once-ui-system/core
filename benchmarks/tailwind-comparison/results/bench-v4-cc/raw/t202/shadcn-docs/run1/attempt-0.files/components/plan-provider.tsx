"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { GUESTS, GUEST_BY_ID, TABLES, TABLE_BY_ID, TOTAL_SEATS, type Guest } from "@/lib/data";
import { evaluateRules, type RuleResult } from "@/lib/rules";

export type Seats = Record<string, (string | null)[]>;

function initialSeats(): Seats {
  const s: Seats = {};
  for (const t of TABLES) s[t.id] = Array.from({ length: t.seats }, () => null as string | null);
  for (const g of GUESTS) {
    if (!g.table) continue;
    const row = s[g.table];
    const i = row.indexOf(null);
    if (i >= 0) row[i] = g.id;
  }
  return s;
}

function tableOfFromSeats(seats: Seats): Record<string, string | null> {
  const out: Record<string, string | null> = {};
  for (const g of GUESTS) out[g.id] = null;
  for (const t of TABLES) for (const id of seats[t.id]) if (id) out[id] = t.id;
  return out;
}

type PlanApi = {
  seats: Seats;
  tableOf: Record<string, string | null>;
  picked: string | null;
  selectedTable: string | null;
  pick: (id: string | null) => void;
  selectTable: (id: string | null) => void;
  place: (guestId: string, tableId: string, seatIdx?: number) => void;
  unseat: (guestId: string) => void;
  activateSeat: (tableId: string, idx: number) => void;
  activateTable: (tableId: string) => void;
  filled: (tableId: string) => number;
  rules: RuleResult[];
  brokenRules: RuleResult[];
  flaggedTables: Set<string>;
  flaggedGuests: Set<string>;
  seatedCount: number;
  attendingCount: number;
  openSeats: number;
  unseatedAttending: Guest[];
  unconfirmedUnseated: Guest[];
};

const PlanContext = createContext<PlanApi | null>(null);

export function usePlan(): PlanApi {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [seats, setSeats] = useState<Seats>(initialSeats);
  const [picked, setPicked] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const tableOf = useMemo(() => tableOfFromSeats(seats), [seats]);
  const rules = useMemo(() => evaluateRules(tableOf), [tableOf]);
  const brokenRules = useMemo(() => rules.filter((r) => r.status === "broken"), [rules]);
  const flaggedTables = useMemo(() => new Set(brokenRules.flatMap((r) => r.tables)), [brokenRules]);
  const flaggedGuests = useMemo(() => new Set(brokenRules.flatMap((r) => r.guestIds)), [brokenRules]);

  const seatedCount = useMemo(() => GUESTS.filter((g) => tableOf[g.id]).length, [tableOf]);
  const attendingCount = useMemo(() => GUESTS.filter((g) => g.rsvp === "yes").length, []);
  const unseatedAttending = useMemo(() => GUESTS.filter((g) => g.rsvp === "yes" && !tableOf[g.id]), [tableOf]);
  const unconfirmedUnseated = useMemo(
    () => GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !tableOf[g.id]),
    [tableOf],
  );

  const filled = useCallback((tableId: string) => seats[tableId].filter(Boolean).length, [seats]);

  const place = useCallback(
    (guestId: string, tableId: string, seatIdx?: number) => {
      const guest = GUEST_BY_ID[guestId];
      const table = TABLE_BY_ID[tableId];
      if (!guest || !table || guest.rsvp === "no") return;
      const row = seats[tableId];
      let from: { table: string; idx: number } | null = null;
      for (const t of TABLES) {
        const i = seats[t.id].indexOf(guestId);
        if (i >= 0) {
          from = { table: t.id, idx: i };
          break;
        }
      }
      if (seatIdx === undefined && from && from.table === tableId) return;
      const target = seatIdx ?? row.indexOf(null);
      if (target < 0) {
        toast.error(`${table.name} is full`, {
          description: `All ${table.seats} seats are taken. Choose another table, or tap an occupied seat to swap.`,
        });
        return;
      }
      const occupant = row[target];
      if (occupant === guestId) return;

      const next: Seats = {};
      for (const t of TABLES) next[t.id] = [...seats[t.id]];
      if (from) next[from.table][from.idx] = occupant;
      next[tableId][target] = guestId;

      const before = new Set(rules.filter((r) => r.status === "broken").map((r) => r.index));
      const newlyBroken = evaluateRules(tableOfFromSeats(next)).filter(
        (r) => r.status === "broken" && !before.has(r.index),
      );

      let msg: string;
      if (occupant && from) msg = `${guest.name} and ${GUEST_BY_ID[occupant].name} swapped seats`;
      else if (occupant) msg = `${guest.name} seated at ${table.name}; ${GUEST_BY_ID[occupant].name} is now unseated`;
      else if (from) msg = `${guest.name} moved to ${table.name}, seat ${target + 1}`;
      else msg = `${guest.name} seated at ${table.name}, seat ${target + 1}`;

      setSeats(next);
      if (newlyBroken.length > 0) toast.warning(msg, { description: `Rule broken. ${newlyBroken[0].detail}` });
      else toast.success(msg);
    },
    [seats, rules],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const guest = GUEST_BY_ID[guestId];
      if (!guest) return;
      let found = false;
      const next: Seats = {};
      for (const t of TABLES) {
        next[t.id] = seats[t.id].map((id) => {
          if (id === guestId) {
            found = true;
            return null;
          }
          return id;
        });
      }
      if (!found) return;
      setSeats(next);
      setPicked((p) => (p === guestId ? null : p));
      toast(`${guest.name} unseated`);
    },
    [seats],
  );

  const activateSeat = useCallback(
    (tableId: string, idx: number) => {
      const occupant = seats[tableId][idx];
      if (picked) {
        if (picked === occupant) {
          setPicked(null);
          return;
        }
        place(picked, tableId, idx);
        setPicked(null);
        setSelectedTable(tableId);
        return;
      }
      setSelectedTable(tableId);
      if (occupant) setPicked(occupant);
    },
    [seats, picked, place],
  );

  const activateTable = useCallback(
    (tableId: string) => {
      if (picked) {
        place(picked, tableId);
        setPicked(null);
      }
      setSelectedTable(tableId);
    },
    [picked, place],
  );

  const value: PlanApi = {
    seats,
    tableOf,
    picked,
    selectedTable,
    pick: setPicked,
    selectTable: setSelectedTable,
    place,
    unseat,
    activateSeat,
    activateTable,
    filled,
    rules,
    brokenRules,
    flaggedTables,
    flaggedGuests,
    seatedCount,
    attendingCount,
    openSeats: TOTAL_SEATS - seatedCount,
    unseatedAttending,
    unconfirmedUnseated,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
