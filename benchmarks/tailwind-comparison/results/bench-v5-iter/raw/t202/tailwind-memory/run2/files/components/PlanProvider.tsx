"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { guestById, tableById } from "@/lib/data";
import {
  evaluateRules,
  initialSeatMap,
  locate,
  seatGuest as seatGuestInMap,
  unseatGuest as unseatGuestInMap,
  type Location,
  type RuleResult,
  type SeatMap,
} from "@/lib/plan";

interface PlanCtx {
  seatMap: SeatMap;
  loc: Record<string, Location>;
  rules: RuleResult[];
  brokenTables: Set<string>;
  brokenGuests: Set<string>;
  selectedGuestId: string | null;
  selectedTableId: string | null;
  dragId: string | null;
  setDragId: (id: string | null) => void;
  selectGuest: (id: string | null) => void;
  selectTable: (id: string | null) => void;
  seatGuest: (guestId: string, tableId: string, seat?: number) => void;
  unseatGuest: (guestId: string) => void;
  clickSeat: (tableId: string, seat: number) => void;
  clickTable: (tableId: string) => void;
}

const Ctx = createContext<PlanCtx | null>(null);

export function usePlan(): PlanCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePlan must be used inside PlanProvider");
  return c;
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [seatMap, setSeatMap] = useState<SeatMap>(initialSeatMap);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const loc = useMemo(() => locate(seatMap), [seatMap]);
  const rules = useMemo(() => evaluateRules(seatMap), [seatMap]);
  const { brokenTables, brokenGuests } = useMemo(() => {
    const bt = new Set<string>();
    const bg = new Set<string>();
    for (const r of rules) {
      if (r.status !== "broken") continue;
      r.tableIds.forEach((t) => bt.add(t));
      r.guestIds.forEach((g) => bg.add(g));
    }
    return { brokenTables: bt, brokenGuests: bg };
  }, [rules]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 3800);
    return () => clearTimeout(t);
  }, [notice]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedGuestId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const seatGuest = useCallback(
    (guestId: string, tableId: string, seat?: number) => {
      const g = guestById[guestId];
      const t = tableById[tableId];
      if (!g || !t) return;
      const res = seatGuestInMap(seatMap, guestId, tableId, seat);
      if (!res.ok) {
        setNotice(`${t.name} is full. Pick another table or seat.`);
        return;
      }
      setSeatMap(res.map);
      setSelectedTableId(tableId);
      setSelectedGuestId(null);
      const extra = res.displaced ? `, ${guestById[res.displaced].name} is now unseated` : "";
      setNotice(`${g.name} seated at ${t.name}${extra}.`);
    },
    [seatMap],
  );

  const unseatGuest = useCallback(
    (guestId: string) => {
      const g = guestById[guestId];
      if (!g || !loc[guestId]) return;
      setSeatMap(unseatGuestInMap(seatMap, guestId));
      setSelectedGuestId((cur) => (cur === guestId ? null : cur));
      setNotice(`${g.name} is now unseated.`);
    },
    [seatMap, loc],
  );

  const selectGuest = useCallback(
    (id: string | null) => {
      setSelectedGuestId(id);
      if (id && loc[id]) setSelectedTableId(loc[id].tableId);
    },
    [loc],
  );

  const clickSeat = useCallback(
    (tableId: string, seat: number) => {
      const occupant = seatMap[tableId]?.[seat] ?? null;
      if (selectedGuestId) {
        if (occupant === selectedGuestId) setSelectedGuestId(null);
        else seatGuest(selectedGuestId, tableId, seat);
        return;
      }
      setSelectedTableId(tableId);
      if (occupant) setSelectedGuestId(occupant);
    },
    [seatMap, selectedGuestId, seatGuest],
  );

  const clickTable = useCallback(
    (tableId: string) => {
      if (selectedGuestId) seatGuest(selectedGuestId, tableId);
      else setSelectedTableId((cur) => (cur === tableId ? null : tableId));
    },
    [selectedGuestId, seatGuest],
  );

  const value: PlanCtx = {
    seatMap,
    loc,
    rules,
    brokenTables,
    brokenGuests,
    selectedGuestId,
    selectedTableId,
    dragId,
    setDragId,
    selectGuest,
    selectTable: setSelectedTableId,
    seatGuest,
    unseatGuest,
    clickSeat,
    clickTable,
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 transition-opacity duration-200 print:hidden ${
          notice ? "opacity-100" : "opacity-0"
        }`}
      >
        {notice && (
          <p className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white shadow-lg">{notice}</p>
        )}
      </div>
    </Ctx.Provider>
  );
}
