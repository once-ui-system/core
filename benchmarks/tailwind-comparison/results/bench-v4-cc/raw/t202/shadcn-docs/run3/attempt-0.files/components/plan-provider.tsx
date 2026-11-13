"use client";

import * as React from "react";
import { toast } from "sonner";
import { GUEST_BY_ID, GUESTS, TABLE_BY_ID, TABLES } from "@/lib/data";
import { firstName } from "@/lib/format";
import { evaluateRules, type Placements, type RuleResult } from "@/lib/rules";

export type Panel = "unseated" | "table" | "rules";

type PlanState = { placements: Placements; past: Placements[] };

type Counts = {
  total: number;
  attending: number;
  seated: number;
  toSeat: number;
  awaiting: number;
  awaitingSeated: number;
  declined: number;
};

type PlanContextValue = {
  placements: Placements;
  seatsByTable: Record<string, (string | null)[]>;
  results: RuleResult[];
  brokenResults: RuleResult[];
  brokenByTable: Record<string, RuleResult[]>;
  flaggedGuestIds: Set<string>;
  counts: Counts;
  selectedTableId: string | null;
  selectTable: (id: string | null) => void;
  inspectTable: (id: string | null) => void;
  panel: Panel;
  setPanel: (panel: Panel) => void;
  heldGuestId: string | null;
  holdGuest: (id: string | null) => void;
  dragId: string | null;
  setDragId: (id: string | null) => void;
  place: (guestId: string, tableId: string, seat?: number) => boolean;
  unseat: (guestId: string) => void;
  undo: () => void;
  canUndo: boolean;
};

const PlanContext = React.createContext<PlanContextValue | null>(null);

export function usePlan(): PlanContextValue {
  const value = React.useContext(PlanContext);
  if (!value) throw new Error("usePlan must be used inside PlanProvider");
  return value;
}

function initialPlacements(): Placements {
  const next: Placements = {};
  const used: Record<string, number> = {};
  for (const guest of GUESTS) {
    if (guest.table) {
      const seat = used[guest.table] ?? 0;
      used[guest.table] = seat + 1;
      next[guest.id] = { table: guest.table, seat };
    } else {
      next[guest.id] = null;
    }
  }
  return next;
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<PlanState>(() => ({
    placements: initialPlacements(),
    past: [],
  }));
  const [selectedTableId, setSelectedTableId] = React.useState<string | null>(null);
  const [panel, setPanel] = React.useState<Panel>("unseated");
  const [heldGuestId, setHeldGuestId] = React.useState<string | null>(null);
  const [dragId, setDragId] = React.useState<string | null>(null);

  const { placements, past } = state;

  const seatsByTable = React.useMemo(() => {
    const map: Record<string, (string | null)[]> = {};
    for (const t of TABLES) map[t.id] = Array.from({ length: t.seats }, () => null);
    for (const guest of GUESTS) {
      const p = placements[guest.id];
      const row = p ? map[p.table] : undefined;
      if (p && row) row[p.seat] = guest.id;
    }
    return map;
  }, [placements]);

  const results = React.useMemo(() => evaluateRules(placements), [placements]);
  const brokenResults = React.useMemo(() => results.filter((r) => r.status === "broken"), [results]);

  const brokenByTable = React.useMemo(() => {
    const map: Record<string, RuleResult[]> = {};
    for (const r of brokenResults) {
      for (const tid of r.tableIds) {
        (map[tid] ??= []).push(r);
      }
    }
    return map;
  }, [brokenResults]);

  const flaggedGuestIds = React.useMemo(() => {
    const set = new Set<string>();
    for (const r of brokenResults) for (const gid of r.guestIds) set.add(gid);
    return set;
  }, [brokenResults]);

  const counts = React.useMemo<Counts>(() => {
    let attending = 0;
    let seated = 0;
    let awaiting = 0;
    let awaitingSeated = 0;
    let declined = 0;
    for (const guest of GUESTS) {
      const isSeated = Boolean(placements[guest.id]);
      if (guest.rsvp === "yes") {
        attending++;
        if (isSeated) seated++;
      } else if (guest.rsvp === "no") {
        declined++;
      } else {
        awaiting++;
        if (isSeated) awaitingSeated++;
      }
    }
    return {
      total: GUESTS.length,
      attending,
      seated,
      toSeat: attending - seated,
      awaiting,
      awaitingSeated,
      declined,
    };
  }, [placements]);

  const undo = React.useCallback(() => {
    setState((cur) => {
      const previous = cur.past[cur.past.length - 1];
      if (!previous) return cur;
      return { placements: previous, past: cur.past.slice(0, -1) };
    });
  }, []);

  const commit = React.useCallback((next: Placements) => {
    setState((cur) => ({
      placements: next,
      past: [...cur.past.slice(-29), cur.placements],
    }));
  }, []);

  const place = React.useCallback(
    (guestId: string, tableId: string, seat?: number): boolean => {
      const guest = GUEST_BY_ID[guestId];
      const table = TABLE_BY_ID[tableId];
      const seats = seatsByTable[tableId];
      if (!guest || !table || !seats) return false;
      if (guest.rsvp === "no") {
        toast.error(`${firstName(guest.name)} has declined`, {
          description: "Declined guests can't be given a seat.",
        });
        return false;
      }
      const current = placements[guestId] ?? null;
      let target = seat;
      if (target !== undefined) {
        const occupant = seats[target] ?? null;
        if (occupant === guestId) return true;
        if (occupant && !current) target = undefined;
      }
      if (target === undefined) {
        if (current?.table === tableId) return true;
        const free = seats.indexOf(null);
        if (free < 0) {
          toast.error(`${table.name} is full`, {
            description: "Every seat is taken. Pick another table or move someone out first.",
          });
          return false;
        }
        target = free;
      }
      const occupantId = seats[target] ?? null;
      const next: Placements = { ...placements };
      if (occupantId) next[occupantId] = current ? { ...current } : null;
      next[guestId] = { table: tableId, seat: target };

      let message: string;
      const other = occupantId ? GUEST_BY_ID[occupantId] : undefined;
      if (other) message = `Swapped ${firstName(guest.name)} and ${firstName(other.name)}`;
      else if (current && current.table === tableId) message = `Moved ${firstName(guest.name)} to another seat at ${table.name}`;
      else if (current) message = `Moved ${firstName(guest.name)} to ${table.name}`;
      else message = `Seated ${firstName(guest.name)} at ${table.name}`;

      const before = new Set(brokenResults.map((r) => r.id));
      const created = evaluateRules(next).filter((r) => r.status === "broken" && !before.has(r.id));
      commit(next);
      const action = { label: "Undo", onClick: () => undo() };
      const firstCreated = created[0];
      if (firstCreated) {
        toast.warning(message, { description: `Breaks a rule: ${firstCreated.title}. ${firstCreated.detail}`, action });
      } else {
        toast.success(message, { action });
      }
      return true;
    },
    [placements, seatsByTable, brokenResults, commit, undo],
  );

  const unseat = React.useCallback(
    (guestId: string) => {
      const guest = GUEST_BY_ID[guestId];
      if (!guest || !placements[guestId]) return;
      commit({ ...placements, [guestId]: null });
      toast(`Unseated ${firstName(guest.name)}`, { action: { label: "Undo", onClick: () => undo() } });
    },
    [placements, commit, undo],
  );

  const selectTable = React.useCallback((id: string | null) => setSelectedTableId(id), []);

  const inspectTable = React.useCallback((id: string | null) => {
    setSelectedTableId(id);
    if (id) setPanel("table");
  }, []);

  const holdGuest = React.useCallback((id: string | null) => setHeldGuestId(id), []);

  React.useEffect(() => {
    if (!heldGuestId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setHeldGuestId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [heldGuestId]);

  const value: PlanContextValue = {
    placements,
    seatsByTable,
    results,
    brokenResults,
    brokenByTable,
    flaggedGuestIds,
    counts,
    selectedTableId,
    selectTable,
    inspectTable,
    panel,
    setPanel,
    heldGuestId,
    holdGuest,
    dragId,
    setDragId,
    place,
    unseat,
    undo,
    canUndo: past.length > 0,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
