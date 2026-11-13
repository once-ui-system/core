"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { VisuallyHidden } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  computeStats,
  evaluateRules,
  guestById,
  initialSeating,
  placeGuest,
  tableById,
  unseatGuest,
  type RuleResult,
  type Seating,
  type Stats,
} from "@/lib/plan";

type PlanContextValue = {
  seating: Seating;
  stats: Stats;
  rules: RuleResult[];
  brokenTables: Set<string>;
  /** guest being placed with taps */
  picked: string | null;
  /** guest being dragged */
  dragId: string | null;
  selectedTable: string | null;
  place: (guestId: string, tableId: string, seat?: number) => boolean;
  unseat: (guestId: string) => void;
  pick: (guestId: string | null) => void;
  setDragId: (guestId: string | null) => void;
  /** reveal: ask the side panel to show the table's details */
  selectTable: (tableId: string | null, reveal?: boolean) => void;
  revealTick: number;
};

const PlanContext = createContext<PlanContextValue | null>(null);

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [seating, setSeating] = useState<Seating>(initialSeating);
  const [picked, setPicked] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [revealTick, setRevealTick] = useState(0);

  const rules = useMemo(() => evaluateRules(seating), [seating]);
  const stats = useMemo(() => computeStats(seating), [seating]);
  const brokenTables = useMemo(
    () => new Set(rules.filter((r) => r.status === "broken").flatMap((r) => r.tables)),
    [rules],
  );

  const place = useCallback(
    (guestId: string, tableId: string, seat?: number): boolean => {
      const res = placeGuest(seating, guestId, tableId, seat);
      if (res.error) {
        notifications.show({
          color: "red",
          title: "Cannot seat guest",
          message: res.error,
        });
        setAnnouncement(res.error);
        return false;
      }
      if (res.noop) {
        if (res.note) setAnnouncement(res.note);
        return true;
      }
      setSeating(res.seating);
      if (res.note) setAnnouncement(res.note);
      return true;
    },
    [seating],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const guest = guestById[guestId];
      if (!guest || !seating[guestId]) return;
      const from = seating[guestId];
      setSeating(unseatGuest(seating, guestId));
      setAnnouncement(
        `${guest.name} is unseated${from ? ` from ${tableById[from.table]?.name ?? "a table"}` : ""}.`,
      );
    },
    [seating],
  );

  const pick = useCallback((guestId: string | null) => {
    setPicked(guestId);
    if (guestId) {
      const g = guestById[guestId];
      if (g) setAnnouncement(`${g.name} picked. Choose a table or an empty seat.`);
    }
  }, []);

  const selectTable = useCallback((tableId: string | null, reveal = false) => {
    setSelectedTable(tableId);
    if (reveal) setRevealTick((n) => n + 1);
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
      stats,
      rules,
      brokenTables,
      picked,
      dragId,
      selectedTable,
      place,
      unseat,
      pick,
      setDragId,
      selectTable,
      revealTick,
    }),
    [seating, stats, rules, brokenTables, picked, dragId, selectedTable, place, unseat, pick, selectTable, revealTick],
  );

  return (
    <PlanContext.Provider value={value}>
      {children}
      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>
    </PlanContext.Provider>
  );
}
