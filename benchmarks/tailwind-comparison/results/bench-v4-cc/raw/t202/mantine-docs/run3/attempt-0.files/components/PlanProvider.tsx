"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { notifications } from "@mantine/notifications";
import { GUESTS, TABLES, type Guest } from "@/lib/data";
import {
  evaluateRules,
  guestById,
  initialSeats,
  tableById,
  type RuleResult,
  type SeatMap,
} from "@/lib/plan";

interface PlanContextValue {
  seats: SeatMap;
  tableSeats: Record<string, (Guest | null)[]>;
  unseated: Guest[];
  tentative: Guest[];
  stats: {
    seated: number;
    attending: number;
    unseatedAttending: number;
    capacity: number;
    free: number;
  };
  results: RuleResult[];
  flagged: Record<string, RuleResult[]>;
  selectedTableId: string | null;
  heldId: string | null;
  announcement: string;
  selectTable: (id: string | null) => void;
  hold: (id: string | null) => void;
  place: (guestId: string, tableId: string, seat?: number) => void;
  unseat: (guestId: string) => void;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function usePlan(): PlanContextValue {
  const value = useContext(PlanContext);
  if (!value) throw new Error("usePlan must be used inside PlanProvider");
  return value;
}

function byPartyThenName(a: Guest, b: Guest) {
  return a.party.localeCompare(b.party) || a.name.localeCompare(b.name);
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [seats, setSeats] = useState<SeatMap>(initialSeats);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [heldId, setHeldId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const derived = useMemo(() => {
    const tableSeats: Record<string, (Guest | null)[]> = {};
    for (const t of TABLES) tableSeats[t.id] = Array.from({ length: t.seats }, () => null);
    for (const [gid, ref] of Object.entries(seats)) {
      const row = tableSeats[ref.tableId];
      if (row) row[ref.seat] = guestById[gid] ?? null;
    }
    const attending = GUESTS.filter((x) => x.rsvp === "yes");
    const unseated = attending.filter((x) => !seats[x.id]).sort(byPartyThenName);
    const tentative = GUESTS.filter(
      (x) => (x.rsvp === "maybe" || x.rsvp === "pending") && !seats[x.id],
    ).sort(byPartyThenName);
    const capacity = TABLES.reduce((sum, t) => sum + t.seats, 0);
    const seated = Object.keys(seats).length;
    const results = evaluateRules(seats);
    const flagged: Record<string, RuleResult[]> = {};
    for (const r of results) {
      if (r.status !== "broken") continue;
      for (const id of r.tableIds) (flagged[id] ??= []).push(r);
    }
    return {
      tableSeats,
      unseated,
      tentative,
      results,
      flagged,
      stats: {
        seated,
        attending: attending.length,
        unseatedAttending: unseated.length,
        capacity,
        free: capacity - seated,
      },
    };
  }, [seats]);

  const selectTable = useCallback((id: string | null) => setSelectedTableId(id), []);
  const hold = useCallback((id: string | null) => {
    setHeldId(id);
    if (id) {
      const guest = guestById[id];
      if (guest) setAnnouncement(`${guest.name} picked up. Choose a table or seat.`);
    }
  }, []);

  const unseat = useCallback(
    (guestId: string) => {
      const guest = guestById[guestId];
      const ref = seats[guestId];
      if (!guest || !ref) return;
      setSeats((prev) => {
        const next = { ...prev };
        delete next[guestId];
        return next;
      });
      setHeldId(null);
      setAnnouncement(`${guest.name} unseated from ${tableById[ref.tableId]?.name ?? "table"}.`);
    },
    [seats],
  );

  const place = useCallback(
    (guestId: string, tableId: string, seatIdx?: number) => {
      const guest = guestById[guestId];
      const table = tableById[tableId];
      if (!guest || !table) return;
      const cur = seats[guestId];

      const occupants = new Map<number, string>();
      for (const [gid, ref] of Object.entries(seats)) {
        if (ref.tableId === tableId) occupants.set(ref.seat, gid);
      }
      if (seatIdx !== undefined && occupants.get(seatIdx) === guestId) {
        setHeldId(null);
        return;
      }
      if (seatIdx === undefined && cur?.tableId === tableId) {
        setHeldId(null);
        setSelectedTableId(tableId);
        return;
      }

      const firstFree = (): number => {
        for (let i = 0; i < table.seats; i += 1) if (!occupants.has(i)) return i;
        return -1;
      };

      const next: SeatMap = { ...seats };
      const other = seatIdx !== undefined ? occupants.get(seatIdx) : undefined;
      let message: string;

      if (other && cur && seatIdx !== undefined) {
        next[other] = { tableId: cur.tableId, seat: cur.seat };
        next[guestId] = { tableId, seat: seatIdx };
        message = `${guest.name} and ${guestById[other]?.name ?? "guest"} swapped seats.`;
      } else {
        const target = seatIdx !== undefined && !other ? seatIdx : firstFree();
        if (target < 0) {
          notifications.show({
            color: "red",
            title: `${table.name} is full`,
            message: `All ${table.seats} seats are taken. Pick another table or unseat someone first.`,
          });
          setAnnouncement(`${table.name} is full.`);
          return;
        }
        next[guestId] = { tableId, seat: target };
        message = cur
          ? `${guest.name} moved from ${tableById[cur.tableId]?.name ?? "table"} to ${table.name}.`
          : `${guest.name} seated at ${table.name}.`;
      }

      setSeats(next);
      setHeldId(null);
      setSelectedTableId(tableId);
      setAnnouncement(message);
    },
    [seats],
  );

  const value = useMemo<PlanContextValue>(
    () => ({
      seats,
      ...derived,
      selectedTableId,
      heldId,
      announcement,
      selectTable,
      hold,
      place,
      unseat,
    }),
    [seats, derived, selectedTableId, heldId, announcement, selectTable, hold, place, unseat],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
