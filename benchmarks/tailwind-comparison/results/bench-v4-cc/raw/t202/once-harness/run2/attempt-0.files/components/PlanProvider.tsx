"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useToast } from "@once-ui-system/core";
import { GUESTS, GUEST_BY_ID, TABLES, TABLE_BY_ID, type Guest } from "@/lib/data";
import {
  cloneSeating,
  evaluateRules,
  initialSeating,
  tableOfMap,
  type RuleResult,
  type Seating,
} from "@/lib/plan";

type Stats = {
  attending: number;
  seated: number;
  seatedAttending: number;
  unseated: Guest[];
  unconfirmed: Guest[];
  capacity: number;
  free: number;
  perTable: Record<string, number>;
};

type PlanContextValue = {
  seating: Seating;
  tableOf: Record<string, string | null>;
  stats: Stats;
  rules: RuleResult[];
  brokenTableIds: Set<string>;
  selectedTable: string | null;
  selectTable: (id: string | null) => void;
  picked: string | null;
  pick: (id: string | null) => void;
  dragId: string | null;
  setDragId: (id: string | null) => void;
  seat: (guestId: string, tableId: string, seatIndex?: number) => void;
  placePicked: (tableId: string, seatIndex?: number) => void;
  unseat: (guestId: string) => void;
  undo: () => void;
  canUndo: boolean;
  announcement: string;
};

const PlanContext = createContext<PlanContextValue | null>(null);

export function usePlan(): PlanContextValue {
  const value = useContext(PlanContext);
  if (!value) throw new Error("usePlan must be used inside PlanProvider");
  return value;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const { addToast } = useToast();
  const [seating, setSeating] = useState<Seating>(initialSeating);
  const [history, setHistory] = useState<Seating[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const tableOf = useMemo(() => tableOfMap(seating), [seating]);
  const rules = useMemo(() => evaluateRules(tableOf), [tableOf]);

  const brokenTableIds = useMemo(() => {
    const ids = new Set<string>();
    for (const r of rules) {
      if (r.status === "broken") r.tableIds.forEach((t) => ids.add(t));
    }
    return ids;
  }, [rules]);

  const stats = useMemo<Stats>(() => {
    const attendingGuests = GUESTS.filter((g) => g.rsvp === "yes");
    const perTable: Record<string, number> = {};
    for (const t of TABLES) perTable[t.id] = seating[t.id].filter(Boolean).length;
    const seated = Object.values(perTable).reduce((a, b) => a + b, 0);
    const capacity = TABLES.reduce((a, t) => a + t.seats, 0);
    return {
      attending: attendingGuests.length,
      seated,
      seatedAttending: attendingGuests.filter((g) => tableOf[g.id]).length,
      unseated: attendingGuests.filter((g) => !tableOf[g.id]),
      unconfirmed: GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !tableOf[g.id]),
      capacity,
      free: capacity - seated,
      perTable,
    };
  }, [seating, tableOf]);

  const commit = useCallback(
    (next: Seating, message: string) => {
      setHistory((h) => [...h.slice(-49), seating]);
      setSeating(next);
      setAnnouncement(message);
    },
    [seating],
  );

  const warn = useCallback(
    (message: string) => {
      setAnnouncement(message);
      addToast({ tone: "danger", message });
    },
    [addToast],
  );

  const seat = useCallback(
    (guestId: string, tableId: string, seatIndex?: number) => {
      const guest = GUEST_BY_ID[guestId];
      const table = TABLE_BY_ID[tableId];
      if (!guest || !table) return;
      if (guest.rsvp === "no") {
        warn(`${guest.name} has declined and cannot be seated.`);
        return;
      }
      const current = tableOf[guestId];
      if (seatIndex === undefined && current === tableId) return;
      const target = seatIndex ?? seating[tableId].indexOf(null);
      if (target < 0) {
        warn(`${table.name} is full. Pick another table or an exact seat to swap.`);
        return;
      }
      if (seating[tableId][target] === guestId) return;
      const next = cloneSeating(seating);
      const occupantId = next[tableId][target];
      let oldIndex = -1;
      if (current) {
        oldIndex = next[current].indexOf(guestId);
        next[current][oldIndex] = null;
      }
      next[tableId][target] = guestId;
      if (occupantId && current) next[current][oldIndex] = occupantId;
      let message = `${guest.name} seated at ${table.name}, seat ${target + 1}.`;
      if (occupantId) {
        const occupant = GUEST_BY_ID[occupantId];
        message += current
          ? ` ${occupant.name} moved to ${TABLE_BY_ID[current].name}.`
          : ` ${occupant.name} is now unseated.`;
      }
      commit(next, message);
    },
    [commit, seating, tableOf, warn],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const current = tableOf[guestId];
      if (!current) return;
      const next = cloneSeating(seating);
      next[current] = next[current].map((s) => (s === guestId ? null : s));
      commit(next, `${GUEST_BY_ID[guestId].name} unseated from ${TABLE_BY_ID[current].name}.`);
    },
    [commit, seating, tableOf],
  );

  const placePicked = useCallback(
    (tableId: string, seatIndex?: number) => {
      if (!picked) return;
      seat(picked, tableId, seatIndex);
      setPicked(null);
      setSelectedTable(tableId);
    },
    [picked, seat],
  );

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      setSeating(h[h.length - 1]);
      setAnnouncement("Last change undone.");
      return h.slice(0, -1);
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPicked(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo<PlanContextValue>(
    () => ({
      seating,
      tableOf,
      stats,
      rules,
      brokenTableIds,
      selectedTable,
      selectTable: setSelectedTable,
      picked,
      pick: setPicked,
      dragId,
      setDragId,
      seat,
      placePicked,
      unseat,
      undo,
      canUndo: history.length > 0,
      announcement,
    }),
    [seating, tableOf, stats, rules, brokenTableIds, selectedTable, picked, dragId, seat, placePicked, unseat, undo, history.length, announcement],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
