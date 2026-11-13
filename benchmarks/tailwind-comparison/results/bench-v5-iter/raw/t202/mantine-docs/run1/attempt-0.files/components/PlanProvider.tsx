"use client";

import { VisuallyHidden } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { GUESTS, GUESTS_BY_ID, TABLES, TABLES_BY_ID } from "@/lib/data";
import { checkRules, type Locations, type RuleResult } from "@/lib/rules";

/** Table id to the guest id in each seat (null = empty seat). */
export type Seating = Record<string, (string | null)[]>;

function initialSeating(): Seating {
  const seating: Seating = {};
  for (const t of TABLES) seating[t.id] = Array.from({ length: t.seats }, () => null);
  for (const guest of GUESTS) {
    if (!guest.table) continue;
    const seats = seating[guest.table];
    const free = seats?.indexOf(null) ?? -1;
    if (seats && free >= 0) seats[free] = guest.id;
  }
  return seating;
}

function derive(seating: Seating) {
  const locations: Locations = {};
  const seatOf: Record<string, number> = {};
  const free: Record<string, number> = {};
  for (const guest of GUESTS) locations[guest.id] = null;
  for (const t of TABLES) {
    const seats = seating[t.id] ?? [];
    free[t.id] = seats.filter((s) => s === null).length;
    seats.forEach((guestId, index) => {
      if (guestId) {
        locations[guestId] = t.id;
        seatOf[guestId] = index;
      }
    });
  }
  return { locations, seatOf, free, rules: checkRules(locations, free) };
}

interface Placement {
  seating: Seating;
  ok: boolean;
  message: string;
}

function place(
  seating: Seating,
  locations: Locations,
  guestId: string,
  tableId: string,
  seatIndex?: number,
): Placement {
  const guest = GUESTS_BY_ID[guestId];
  const table = TABLES_BY_ID[tableId];
  const target = seating[tableId];
  if (!guest || !table || !target) return { seating, ok: false, message: "That seat does not exist." };

  const fromTable = locations[guestId] ?? null;
  const fromSeats = fromTable ? seating[fromTable] : undefined;
  const fromIndex = fromSeats ? fromSeats.indexOf(guestId) : -1;

  let index = seatIndex;
  if (index === undefined) {
    // Already at this table: nothing to do.
    if (fromTable === tableId) {
      return { seating, ok: true, message: `${guest.name} is already at ${table.name}.` };
    }
    index = target.indexOf(null);
    if (index < 0) {
      return { seating, ok: false, message: `${table.name} is full (${table.seats} of ${table.seats} seats).` };
    }
  }
  if (target[index] === guestId) {
    return { seating, ok: true, message: `${guest.name} is already in that seat.` };
  }

  const next: Seating = Object.fromEntries(Object.entries(seating).map(([k, v]) => [k, [...v]]));
  const occupant = next[tableId]?.[index] ?? null;
  if (fromTable && fromIndex >= 0) {
    // Swap with whoever sits in the target seat, or leave the old seat empty.
    const old = next[fromTable];
    if (old) old[fromIndex] = occupant;
  }
  const dest = next[tableId];
  if (dest) dest[index] = guestId;

  const seatNo = index + 1;
  let message: string;
  if (occupant && fromTable) {
    const other = GUESTS_BY_ID[occupant]?.name ?? "A guest";
    message = `${guest.name} swapped seats with ${other}: now ${table.name}, seat ${seatNo}.`;
  } else if (occupant) {
    const other = GUESTS_BY_ID[occupant]?.name ?? "A guest";
    message = `${guest.name} seated at ${table.name}, seat ${seatNo}. ${other} is unseated.`;
  } else if (fromTable && fromTable !== tableId) {
    message = `${guest.name} moved from ${TABLES_BY_ID[fromTable]?.name ?? "a table"} to ${table.name}, seat ${seatNo}.`;
  } else if (fromTable) {
    message = `${guest.name} moved to seat ${seatNo} at ${table.name}.`;
  } else {
    message = `${guest.name} seated at ${table.name}, seat ${seatNo}.`;
  }
  return { seating: next, ok: true, message };
}

interface Counts {
  seated: number;
  seatsTotal: number;
  freeSeats: number;
  toSeat: number;
  awaiting: number;
  declined: number;
  attending: number;
}

interface PlanContextValue {
  seating: Seating;
  locations: Locations;
  seatOf: Record<string, number>;
  free: Record<string, number>;
  counts: Counts;
  rules: RuleResult[];
  brokenRules: RuleResult[];
  brokenTableIds: Set<string>;
  flaggedGuestIds: Set<string>;
  selectedTableId: string | null;
  selectTable: (id: string | null) => void;
  armedGuestId: string | null;
  arm: (id: string | null) => void;
  dragId: string | null;
  setDragId: (id: string | null) => void;
  seatGuest: (guestId: string, tableId: string, seatIndex?: number) => boolean;
  unseat: (guestId: string) => void;
  reset: () => void;
  isDirty: boolean;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [seating, setSeating] = useState<Seating>(initialSeating);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [armedGuestId, setArmedGuestId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [isDirty, setDirty] = useState(false);

  const derived = useMemo(() => derive(seating), [seating]);
  const { locations, seatOf, free, rules } = derived;

  const counts = useMemo<Counts>(() => {
    const seatsTotal = TABLES.reduce((n, t) => n + t.seats, 0);
    const seated = GUESTS.filter((x) => locations[x.id]).length;
    return {
      seated,
      seatsTotal,
      freeSeats: seatsTotal - seated,
      toSeat: GUESTS.filter((x) => x.rsvp === "yes" && !locations[x.id]).length,
      awaiting: GUESTS.filter((x) => (x.rsvp === "maybe" || x.rsvp === "pending") && !locations[x.id])
        .length,
      declined: GUESTS.filter((x) => x.rsvp === "no").length,
      attending: GUESTS.filter((x) => x.rsvp === "yes").length,
    };
  }, [locations]);

  const brokenRules = useMemo(() => rules.filter((r) => r.status === "broken"), [rules]);
  const brokenTableIds = useMemo(
    () => new Set(brokenRules.flatMap((r) => r.tableIds)),
    [brokenRules],
  );
  const flaggedGuestIds = useMemo(
    () => new Set(brokenRules.flatMap((r) => r.guestIds)),
    [brokenRules],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setArmedGuestId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const commit = useCallback(
    (next: Seating, message: string) => {
      const after = derive(next);
      const before = new Set(rules.filter((r) => r.status === "broken").map((r) => r.rule.id));
      const fresh = after.rules.filter((r) => r.status === "broken" && !before.has(r.rule.id));
      const fixed = rules.filter(
        (r) => r.status === "broken" && after.rules.find((a) => a.rule.id === r.rule.id)?.status !== "broken",
      );
      setSeating(next);
      setDirty(true);
      let spoken = message;
      for (const r of fresh) {
        spoken += ` Rule broken: ${r.label.toLowerCase()}. ${r.detail}`;
        notifications.show({
          id: `rule-${r.rule.id}`,
          color: "red",
          title: `Rule broken: ${r.label.toLowerCase()}`,
          message: r.detail,
          autoClose: 6000,
        });
      }
      for (const r of fixed) {
        spoken += ` Rule fixed: ${r.label.toLowerCase()}.`;
        notifications.hide(`rule-${r.rule.id}`);
      }
      setAnnouncement(spoken);
    },
    [rules],
  );

  const seatGuest = useCallback(
    (guestId: string, tableId: string, seatIndex?: number) => {
      const result = place(seating, locations, guestId, tableId, seatIndex);
      if (!result.ok) {
        setAnnouncement(result.message);
        notifications.show({ color: "orange", title: "Can't seat there", message: result.message });
        return false;
      }
      if (result.seating === seating) {
        setAnnouncement(result.message);
      } else {
        commit(result.seating, result.message);
      }
      setArmedGuestId(null);
      setDragId(null);
      return true;
    },
    [seating, locations, commit],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const tableId = locations[guestId];
      const guest = GUESTS_BY_ID[guestId];
      if (!tableId || !guest) return;
      const next: Seating = Object.fromEntries(
        Object.entries(seating).map(([k, v]) => [k, v.map((s) => (s === guestId ? null : s))]),
      );
      commit(next, `${guest.name} unseated from ${TABLES_BY_ID[tableId]?.name ?? "a table"}.`);
      setArmedGuestId(null);
      setDragId(null);
    },
    [seating, locations, commit],
  );

  const reset = useCallback(() => {
    setSeating(initialSeating());
    setDirty(false);
    setArmedGuestId(null);
    setAnnouncement("Plan reset to the starting arrangement.");
  }, []);

  const value: PlanContextValue = {
    seating,
    locations,
    seatOf,
    free,
    counts,
    rules,
    brokenRules,
    brokenTableIds,
    flaggedGuestIds,
    selectedTableId,
    selectTable: setSelectedTableId,
    armedGuestId,
    arm: setArmedGuestId,
    dragId,
    setDragId,
    seatGuest,
    unseat,
    reset,
    isDirty,
  };

  return (
    <PlanContext.Provider value={value}>
      {children}
      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>
    </PlanContext.Provider>
  );
}
