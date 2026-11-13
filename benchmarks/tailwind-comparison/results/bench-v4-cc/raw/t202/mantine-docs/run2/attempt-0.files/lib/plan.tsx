"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { notifications } from "@mantine/notifications";
import { GUESTS, GUESTS_BY_ID, TABLES, TABLES_BY_ID, type Guest } from "@/lib/data";
import {
  buildSeatMap,
  evaluateRules,
  initialPlacements,
  placeGuest,
  type Placements,
  type RuleResult,
  type SeatMap,
} from "@/lib/rules";

export type PanelTab = "seat" | "rules" | "table";

interface PlanApi {
  placements: Placements;
  seatMap: SeatMap;
  rules: RuleResult[];
  brokenRules: RuleResult[];
  flaggedTables: Record<string, number>;
  flaggedGuests: Set<string>;
  seatedCount: number;
  totalSeats: number;
  unseatedAttending: Guest[];
  unseatedUnconfirmed: Guest[];
  attendingCount: number;
  selectedTable: string | null;
  activeGuest: string | null;
  draggingId: string | null;
  tab: PanelTab;
  announcement: string;
  setTab: (t: PanelTab) => void;
  selectTable: (id: string | null) => void;
  setActiveGuest: (id: string | null) => void;
  setDragging: (id: string | null) => void;
  place: (guestId: string, tableId: string, seat?: number) => void;
  unseat: (guestId: string) => void;
  tapSeat: (tableId: string, seat: number) => void;
  tapTable: (tableId: string) => void;
}

const PlanContext = createContext<PlanApi | null>(null);

export function usePlan(): PlanApi {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [placements, setPlacements] = useState<Placements>(initialPlacements);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [activeGuest, setActiveGuestState] = useState<string | null>(null);
  const [draggingId, setDragging] = useState<string | null>(null);
  const [tab, setTab] = useState<PanelTab>("seat");
  const [announcement, setAnnouncement] = useState("");

  const seatMap = useMemo(() => buildSeatMap(placements), [placements]);
  const rules = useMemo(() => evaluateRules(placements), [placements]);
  const brokenRules = useMemo(() => rules.filter((r) => r.status === "broken"), [rules]);

  const { flaggedTables, flaggedGuests } = useMemo(() => {
    const tables: Record<string, number> = {};
    const guests = new Set<string>();
    for (const r of brokenRules) {
      for (const t of r.tableIds) tables[t] = (tables[t] ?? 0) + 1;
      for (const g of r.guestIds) guests.add(g);
    }
    return { flaggedTables: tables, flaggedGuests: guests };
  }, [brokenRules]);

  const seatedCount = useMemo(() => GUESTS.filter((g) => placements[g.id]).length, [placements]);
  const totalSeats = useMemo(() => TABLES.reduce((n, t) => n + t.seats, 0), []);
  const unseatedAttending = useMemo(
    () => GUESTS.filter((g) => g.rsvp === "yes" && !placements[g.id]),
    [placements],
  );
  const unseatedUnconfirmed = useMemo(
    () => GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !placements[g.id]),
    [placements],
  );
  const attendingCount = useMemo(() => GUESTS.filter((g) => g.rsvp === "yes").length, []);

  const setActiveGuest = useCallback((id: string | null) => setActiveGuestState(id), []);

  const selectTable = useCallback((id: string | null) => {
    setSelectedTable(id);
    if (id) setTab("table");
  }, []);

  const place = useCallback(
    (guestId: string, tableId: string, seat?: number) => {
      const guest = GUESTS_BY_ID[guestId];
      const table = TABLES_BY_ID[tableId];
      if (!guest || !table) return;
      const res = placeGuest(placements, guestId, tableId, seat);
      setActiveGuestState(null);
      if (!res.ok) {
        if (res.reason === "full") {
          notifications.show({
            color: "red",
            title: `${table.name} is full`,
            message: `${guest.name} was not moved. Free a seat first, or drop onto a taken seat to swap.`,
          });
          setAnnouncement(`${table.name} is full.`);
        }
        return;
      }
      setPlacements(res.next);
      setSelectedTable(tableId);
      const swapped = res.swappedWith ? GUESTS_BY_ID[res.swappedWith] : undefined;
      setAnnouncement(
        swapped
          ? `${guest.name} seated at ${table.name}, swapped with ${swapped.name}.`
          : `${guest.name} seated at ${table.name}.`,
      );
    },
    [placements],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const guest = GUESTS_BY_ID[guestId];
      if (!guest || !placements[guestId]) return;
      setPlacements((p) => ({ ...p, [guestId]: null }));
      setActiveGuestState(null);
      setAnnouncement(`${guest.name} unseated.`);
    },
    [placements],
  );

  const tapSeat = useCallback(
    (tableId: string, seat: number) => {
      const occupant = seatMap[tableId]?.[seat] ?? null;
      if (activeGuest) {
        if (occupant === activeGuest) {
          setActiveGuestState(null);
          return;
        }
        place(activeGuest, tableId, seat);
        return;
      }
      selectTable(tableId);
      if (occupant) setActiveGuestState(occupant);
    },
    [activeGuest, place, seatMap, selectTable],
  );

  const tapTable = useCallback(
    (tableId: string) => {
      if (activeGuest) {
        place(activeGuest, tableId);
        return;
      }
      selectTable(tableId);
    },
    [activeGuest, place, selectTable],
  );

  const value: PlanApi = {
    placements,
    seatMap,
    rules,
    brokenRules,
    flaggedTables,
    flaggedGuests,
    seatedCount,
    totalSeats,
    unseatedAttending,
    unseatedUnconfirmed,
    attendingCount,
    selectedTable,
    activeGuest,
    draggingId,
    tab,
    announcement,
    setTab,
    selectTable,
    setActiveGuest,
    setDragging,
    place,
    unseat,
    tapSeat,
    tapTable,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
