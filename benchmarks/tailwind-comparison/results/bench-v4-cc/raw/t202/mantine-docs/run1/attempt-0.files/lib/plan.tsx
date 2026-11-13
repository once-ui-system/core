"use client";

import { notifications } from "@mantine/notifications";
import { VisuallyHidden } from "@mantine/core";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { GUESTS, GUEST_BY_ID, TABLES, TABLE_BY_ID, type Guest } from "./data";
import {
  buildIndex,
  evaluateRules,
  initialSeats,
  placeGuest,
  removeGuest,
  type RuleResult,
  type SeatIndex,
  type Seats,
} from "./seating";

export interface PlanStats {
  seated: number;
  capacity: number;
  empty: number;
  attending: number;
  unseatedAttending: number;
  broken: number;
  rules: number;
  open: number;
}

interface PlanContextValue {
  seats: Seats;
  index: SeatIndex;
  results: RuleResult[];
  tableFlags: Record<string, RuleResult[]>;
  flaggedGuests: Set<string>;
  stats: PlanStats;
  unseatedAttending: Guest[];
  unseatedTentative: Guest[];
  selectedTable: string | null;
  selectTable: (id: string | null) => void;
  held: string | null;
  hold: (guestId: string | null) => void;
  dragging: string | null;
  setDragging: (guestId: string | null) => void;
  seatGuest: (guestId: string, tableId: string, seat?: number) => boolean;
  unseat: (guestId: string) => void;
  undo: () => void;
  canUndo: boolean;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [seats, setSeats] = useState<Seats>(initialSeats);
  const [history, setHistory] = useState<Seats[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [held, setHeld] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const index = useMemo(() => buildIndex(seats), [seats]);
  const results = useMemo(() => evaluateRules(seats, index), [seats, index]);

  const { tableFlags, flaggedGuests } = useMemo(() => {
    const flags: Record<string, RuleResult[]> = {};
    const guests = new Set<string>();
    for (const r of results) {
      if (r.level !== "broken") continue;
      for (const t of r.tables) (flags[t] ??= []).push(r);
      for (const g of r.guestIds) if (index[g]) guests.add(g);
    }
    return { tableFlags: flags, flaggedGuests: guests };
  }, [results, index]);

  const unseatedAttending = useMemo(() => GUESTS.filter((g) => g.rsvp === "yes" && !index[g.id]), [index]);
  const unseatedTentative = useMemo(
    () => GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !index[g.id]),
    [index],
  );

  const stats = useMemo<PlanStats>(() => {
    const seated = Object.keys(index).length;
    const capacity = TABLES.reduce((n, t) => n + t.seats, 0);
    return {
      seated,
      capacity,
      empty: capacity - seated,
      attending: GUESTS.filter((g) => g.rsvp === "yes").length,
      unseatedAttending: unseatedAttending.length,
      broken: results.filter((r) => r.level === "broken").length,
      rules: results.length,
      open: results.filter((r) => r.level === "open").length,
    };
  }, [index, results, unseatedAttending]);

  const say = useCallback((message: string, color: string = "moss") => {
    setAnnouncement(message);
    notifications.show({ message, color, autoClose: 2600, withCloseButton: false });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHeld(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const seatGuest = useCallback(
    (guestId: string, tableId: string, seat?: number): boolean => {
      const guest = GUEST_BY_ID[guestId];
      const table = TABLE_BY_ID[tableId];
      if (!guest || !table) return false;
      if (guest.rsvp === "no") {
        say(`${guest.name} has declined, so they cannot be seated.`, "red");
        return false;
      }
      const res = placeGuest(seats, guestId, tableId, seat);
      if (!res.ok) {
        say(res.reason, "red");
        return false;
      }
      setHeld(null);
      if (!res.changed) return true;
      setHistory((h) => [...h.slice(-29), seats]);
      setSeats(res.seats);
      const text = res.swapped
        ? `${guest.name} and ${GUEST_BY_ID[res.swapped].name} swapped seats at ${table.name}.`
        : `${guest.name} ${res.moved ? "moved to" : "seated at"} ${table.name}, seat ${res.seat + 1}.`;
      const before = results.filter((r) => r.level === "broken").length;
      const after = evaluateRules(res.seats, buildIndex(res.seats)).filter((r) => r.level === "broken");
      if (after.length > before) say(`${text} This breaks a rule: ${after[after.length - 1].headline}.`, "orange");
      else say(text);
      return true;
    },
    [seats, results, say],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const guest = GUEST_BY_ID[guestId];
      if (!index[guestId]) return;
      setHistory((h) => [...h.slice(-29), seats]);
      setSeats(removeGuest(seats, guestId));
      setHeld((h) => (h === guestId ? null : h));
      say(`${guest.name} is unseated.`, "gray");
    },
    [seats, index, say],
  );

  const undo = useCallback(() => {
    const prev = history[history.length - 1];
    if (!prev) return;
    setSeats(prev);
    setHistory((h) => h.slice(0, -1));
    setHeld(null);
    say("Last change undone.", "gray");
  }, [history, say]);

  const value = useMemo<PlanContextValue>(
    () => ({
      seats,
      index,
      results,
      tableFlags,
      flaggedGuests,
      stats,
      unseatedAttending,
      unseatedTentative,
      selectedTable,
      selectTable: setSelectedTable,
      held,
      hold: setHeld,
      dragging,
      setDragging,
      seatGuest,
      unseat,
      undo,
      canUndo: history.length > 0,
    }),
    [seats, index, results, tableFlags, flaggedGuests, stats, unseatedAttending, unseatedTentative, selectedTable, held, dragging, seatGuest, unseat, undo, history.length],
  );

  return (
    <PlanContext.Provider value={value}>
      {children}
      <VisuallyHidden aria-live="polite" role="status">
        {announcement}
      </VisuallyHidden>
    </PlanContext.Provider>
  );
}
