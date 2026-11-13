"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  FIXTURES,
  GUESTS,
  RULES,
  TABLES,
  guestById,
  tableById,
  type PlanTable,
  type Rule,
} from "./data";

export type Seats = Record<string, (string | null)[]>;

function initialSeats(): Seats {
  const seats: Seats = {};
  for (const t of TABLES) seats[t.id] = Array.from({ length: t.seats }, () => null);
  for (const g of GUESTS) {
    if (!g.table) continue;
    const row = seats[g.table];
    const i = row.indexOf(null);
    if (i >= 0) row[i] = g.id;
  }
  return seats;
}

/* ---------- geometry (metres) ---------- */

export function tableSize(t: PlanTable): { w: number; h: number } {
  return t.shape === "round" ? { w: 1.8, h: 1.8 } : { w: 4.6, h: 1 };
}

export function seatPoints(t: PlanTable): { dx: number; dy: number }[] {
  const n = t.seats;
  const pts: { dx: number; dy: number }[] = [];
  if (t.shape === "round") {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
      pts.push({ dx: Math.cos(a) * 1.45, dy: Math.sin(a) * 1.45 });
    }
    return pts;
  }
  const top = Math.ceil(n / 2);
  const bottom = n - top;
  const len = tableSize(t).w;
  for (let i = 0; i < top; i++) pts.push({ dx: ((i + 0.5) * len) / top - len / 2, dy: -1 });
  for (let i = 0; i < bottom; i++) pts.push({ dx: ((i + 0.5) * len) / bottom - len / 2, dy: 1 });
  return pts;
}

const doorFixture = FIXTURES.find((f) => f.kind === "door");
const bandFixture = FIXTURES.find((f) => f.kind === "stage");
const DOOR = doorFixture
  ? { x: doorFixture.x + doorFixture.w / 2, y: doorFixture.y + doorFixture.h / 2 }
  : { x: 0, y: 7 };
const BAND = bandFixture
  ? { x: bandFixture.x + bandFixture.w / 2, y: bandFixture.y + bandFixture.h / 2 }
  : { x: 12, y: 1.5 };

export const NEAR_DOOR_MAX_M = 4;
export const AWAY_BAND_MIN_M = 7;

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/* ---------- rules ---------- */

export type RuleStatus = "ok" | "broken" | "pending";

export type RuleResult = {
  index: number;
  rule: Rule;
  status: RuleStatus;
  title: string;
  detail: string;
  tables: string[];
  guestIds: string[];
};

function nameOf(id: string): string {
  return guestById.get(id)?.name ?? id;
}

export function evaluateRules(tableOf: Record<string, string | null>): RuleResult[] {
  return RULES.map((rule, index) => {
    const ids = rule.guests;
    const names = ids.map(nameOf);
    const places = ids.map((id) => tableOf[id] ?? null);
    const placed = places.filter((p): p is string => p !== null);
    const base = { index, rule, tables: Array.from(new Set(placed)), guestIds: ids };
    const unplaced = ids.filter((id) => !tableOf[id]).map(nameOf);

    if (rule.kind === "together") {
      const title = `${names[0]} and ${names[1]}: keep together`;
      if (unplaced.length) {
        return { ...base, title, status: "pending" as const, detail: `Not yet seated: ${unplaced.join(", ")}.` };
      }
      if (places[0] === places[1]) {
        return { ...base, title, status: "ok" as const, detail: `Together at ${tableById.get(places[0] as string)?.name}.` };
      }
      return {
        ...base,
        title,
        status: "broken" as const,
        detail: `Split: ${names[0]} at ${tableById.get(places[0] as string)?.name}, ${names[1]} at ${tableById.get(places[1] as string)?.name}.`,
      };
    }

    if (rule.kind === "apart") {
      const title = `${names[0]} and ${names[1]}: keep apart`;
      if (unplaced.length) {
        return { ...base, title, status: "pending" as const, detail: `Not yet seated: ${unplaced.join(", ")}. Nothing to clash yet.` };
      }
      if (places[0] === places[1]) {
        return {
          ...base,
          title,
          status: "broken" as const,
          detail: `Both at ${tableById.get(places[0] as string)?.name}. ${rule.note}.`,
        };
      }
      return { ...base, title, status: "ok" as const, detail: "At different tables." };
    }

    const title = `${names[0]}: seat near the garden doors`;
    const tid = places[0];
    if (!tid) {
      return { ...base, title, status: "pending" as const, detail: "Not yet seated." };
    }
    const t = tableById.get(tid);
    if (!t) return { ...base, title, status: "pending" as const, detail: "Not yet seated." };
    const dDoor = dist(t, DOOR);
    const dBand = dist(t, BAND);
    const problems: string[] = [];
    if (dDoor > NEAR_DOOR_MAX_M) {
      problems.push(`${t.name} is ${dDoor.toFixed(1)} m from the garden doors (aim for ${NEAR_DOOR_MAX_M} m or less)`);
    }
    if (dBand < AWAY_BAND_MIN_M) {
      problems.push(`${t.name} is only ${dBand.toFixed(1)} m from the band (aim for ${AWAY_BAND_MIN_M} m or more)`);
    }
    if (problems.length) {
      return { ...base, title, status: "broken" as const, detail: `${problems.join("; ")}.` };
    }
    return {
      ...base,
      title,
      status: "ok" as const,
      detail: `${t.name}: ${dDoor.toFixed(1)} m from the doors, ${dBand.toFixed(1)} m from the band.`,
    };
  });
}

/* ---------- context ---------- */

type PlanContextValue = {
  seats: Seats;
  tableOf: Record<string, string | null>;
  results: RuleResult[];
  brokenTables: Set<string>;
  flaggedGuests: Set<string>;
  brokenCount: number;
  stats: {
    attending: number;
    seated: number;
    unseatedAttending: number;
    totalSeats: number;
    freeSeats: number;
  };
  heldId: string | null;
  dragId: string | null;
  selectedTableId: string | null;
  notice: string;
  tableCount: (tableId: string) => number;
  setDragId: (id: string | null) => void;
  hold: (id: string | null) => void;
  selectTable: (id: string | null) => void;
  place: (guestId: string, tableId: string, seatIdx?: number) => void;
  unseat: (guestId: string) => void;
};

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [seats, setSeats] = useState<Seats>(initialSeats);
  const [heldId, setHeldId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const tableOf = useMemo(() => {
    const m: Record<string, string | null> = {};
    for (const g of GUESTS) m[g.id] = null;
    for (const tid of Object.keys(seats)) {
      for (const gid of seats[tid]) if (gid) m[gid] = tid;
    }
    return m;
  }, [seats]);

  const results = useMemo(() => evaluateRules(tableOf), [tableOf]);

  const { brokenTables, flaggedGuests, brokenCount } = useMemo(() => {
    const bt = new Set<string>();
    const fg = new Set<string>();
    let count = 0;
    for (const r of results) {
      if (r.status !== "broken") continue;
      count += 1;
      r.tables.forEach((t) => bt.add(t));
      r.guestIds.forEach((g) => fg.add(g));
    }
    return { brokenTables: bt, flaggedGuests: fg, brokenCount: count };
  }, [results]);

  const stats = useMemo(() => {
    const attending = GUESTS.filter((g) => g.rsvp === "yes").length;
    const seated = GUESTS.filter((g) => tableOf[g.id]).length;
    const unseatedAttending = GUESTS.filter((g) => g.rsvp === "yes" && !tableOf[g.id]).length;
    const totalSeats = TABLES.reduce((n, t) => n + t.seats, 0);
    return { attending, seated, unseatedAttending, totalSeats, freeSeats: totalSeats - seated };
  }, [tableOf]);

  const tableCount = useCallback(
    (tableId: string) => (seats[tableId] ?? []).filter((x) => x !== null).length,
    [seats],
  );

  const hold = useCallback((id: string | null) => {
    setHeldId(id);
    if (id) {
      const g = guestById.get(id);
      if (g) setNotice(`${g.name} selected. Tap an empty seat or a table to place them.`);
    } else {
      setNotice("Selection cleared.");
    }
  }, []);

  const selectTable = useCallback((id: string | null) => setSelectedTableId(id), []);

  const place = useCallback(
    (guestId: string, tableId: string, seatIdx?: number) => {
      const g = guestById.get(guestId);
      const t = tableById.get(tableId);
      if (!g || !t) return;
      if (g.rsvp === "no") {
        setNotice(`${g.name} has declined and cannot be seated.`);
        setHeldId(null);
        return;
      }
      const row = seats[tableId];
      let target: number;
      if (seatIdx === undefined) {
        if (row.includes(guestId)) {
          setNotice(`${g.name} is already at ${t.name}.`);
          setHeldId(null);
          return;
        }
        target = row.indexOf(null);
        if (target < 0) {
          setNotice(`${t.name} is full. Pick another table or swap with a seated guest.`);
          return;
        }
      } else {
        target = seatIdx;
      }
      const occupantId = row[target];
      if (occupantId === guestId) {
        setHeldId(null);
        return;
      }
      const alreadySeated = tableOf[guestId] !== null;
      if (occupantId && !alreadySeated) {
        setNotice("That seat is taken. Pick an empty seat, or unseat its guest first.");
        return;
      }
      setSeats((prev) => {
        const next: Seats = {};
        for (const k of Object.keys(prev)) next[k] = prev[k].slice();
        for (const k of Object.keys(next)) {
          const i = next[k].indexOf(guestId);
          if (i >= 0) next[k][i] = next[tableId][target] ?? null;
        }
        next[tableId][target] = guestId;
        return next;
      });
      const occupant = occupantId ? guestById.get(occupantId) : null;
      setNotice(
        occupant
          ? `Swapped ${g.name} and ${occupant.name}.`
          : `${g.name} seated at ${t.name}, seat ${target + 1}.`,
      );
      setHeldId(null);
      setSelectedTableId(tableId);
    },
    [seats, tableOf],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const g = guestById.get(guestId);
      if (!g || !tableOf[guestId]) {
        setHeldId(null);
        return;
      }
      setSeats((prev) => {
        const next: Seats = {};
        for (const k of Object.keys(prev)) next[k] = prev[k].map((x) => (x === guestId ? null : x));
        return next;
      });
      setNotice(`${g.name} is now unseated.`);
      setHeldId(null);
    },
    [tableOf],
  );

  const value: PlanContextValue = {
    seats,
    tableOf,
    results,
    brokenTables,
    flaggedGuests,
    brokenCount,
    stats,
    heldId,
    dragId,
    selectedTableId,
    notice,
    tableCount,
    setDragId,
    hold,
    selectTable,
    place,
    unseat,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}
