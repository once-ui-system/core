```ts src/lib/data.ts
export type Rsvp = "yes" | "no" | "maybe" | "pending";

export type Guest = {
  id: string;
  name: string;
  party: string;
  rsvp: Rsvp;
  diet: string | null;
  table: string | null;
};

export type TableShape = "round" | "long";

export type PlanTable = {
  id: string;
  name: string;
  shape: TableShape;
  seats: number;
  x: number;
  y: number;
  rotation?: number;
};

export type Fixture = {
  id: string;
  kind: "stage" | "dancefloor" | "bar" | "door";
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Rule = {
  kind: "together" | "apart" | "near";
  guests: string[];
  note: string;
};

export const APP = "Seatwise";

export const EVENT = {
  name: "Ines & Mateo's wedding dinner",
  date: "2027-06-19",
  venue: "The Orangery, Hollin Hall",
  room: { width: 24, depth: 14 },
};

export const PLANNER = { name: "Hannah Brook" };

export const FIXTURES: Fixture[] = [
  { id: "f-1", kind: "stage", label: "Band", x: 10, y: 0.5, w: 4, h: 2 },
  { id: "f-2", kind: "dancefloor", label: "Dance floor", x: 8.5, y: 3, w: 7, h: 4 },
  { id: "f-3", kind: "bar", label: "Bar", x: 21, y: 10, w: 2.5, h: 3.5 },
  { id: "f-4", kind: "door", label: "Garden doors", x: 0, y: 6, w: 0.5, h: 2.5 },
];

export const TABLES: PlanTable[] = [
  { id: "t-head", name: "Top table", shape: "long", seats: 8, x: 8, y: 8.2, rotation: 0 },
  { id: "t-1", name: "Table 1", shape: "round", seats: 8, x: 3, y: 2.5 },
  { id: "t-2", name: "Table 2", shape: "round", seats: 8, x: 3, y: 7 },
  { id: "t-3", name: "Table 3", shape: "round", seats: 8, x: 3, y: 11.5 },
  { id: "t-4", name: "Table 4", shape: "round", seats: 8, x: 19, y: 2.5 },
  { id: "t-5", name: "Table 5", shape: "round", seats: 8, x: 19, y: 7 },
  { id: "t-6", name: "Table 6", shape: "round", seats: 6, x: 12, y: 12 },
];

export const GUESTS: Guest[] = [
  { id: "g-01", name: "Ines Carvalho", party: "Couple", rsvp: "yes", diet: null, table: "t-head" },
  { id: "g-02", name: "Mateo Alvarez", party: "Couple", rsvp: "yes", diet: "Vegetarian", table: "t-head" },
  { id: "g-03", name: "Rui Carvalho", party: "Bride's family", rsvp: "yes", diet: null, table: "t-head" },
  { id: "g-04", name: "Marta Carvalho", party: "Bride's family", rsvp: "yes", diet: "Gluten free", table: "t-head" },
  { id: "g-05", name: "Javier Alvarez", party: "Groom's family", rsvp: "yes", diet: null, table: "t-head" },
  { id: "g-06", name: "Lucia Alvarez", party: "Groom's family", rsvp: "yes", diet: null, table: "t-head" },
  { id: "g-07", name: "Sofia Carvalho", party: "Bride's family", rsvp: "yes", diet: null, table: "t-1" },
  { id: "g-08", name: "Tiago Carvalho", party: "Bride's family", rsvp: "yes", diet: null, table: "t-1" },
  { id: "g-09", name: "Avó Rosa Carvalho", party: "Bride's family", rsvp: "yes", diet: "Soft food", table: "t-1" },
  { id: "g-10", name: "Pedro Nunes", party: "Bride's family", rsvp: "yes", diet: null, table: "t-1" },
  { id: "g-11", name: "Ana Nunes", party: "Bride's family", rsvp: "yes", diet: "Vegan", table: "t-1" },
  { id: "g-12", name: "Carmen Alvarez", party: "Groom's family", rsvp: "yes", diet: null, table: "t-4" },
  { id: "g-13", name: "Diego Alvarez", party: "Groom's family", rsvp: "yes", diet: null, table: "t-4" },
  { id: "g-14", name: "Elena Ruiz", party: "Groom's family", rsvp: "yes", diet: "Nut allergy", table: "t-4" },
  { id: "g-15", name: "Pablo Ruiz", party: "Groom's family", rsvp: "yes", diet: null, table: "t-4" },
  { id: "g-16", name: "Isabel Ruiz", party: "Groom's family", rsvp: "maybe", diet: null, table: null },
  { id: "g-17", name: "Chloe Martin", party: "University friends", rsvp: "yes", diet: null, table: "t-2" },
  { id: "g-18", name: "Ben Okafor", party: "University friends", rsvp: "yes", diet: null, table: "t-2" },
  { id: "g-19", name: "Leila Haddad", party: "University friends", rsvp: "yes", diet: "Halal", table: "t-2" },
  { id: "g-20", name: "Omar Haddad", party: "University friends", rsvp: "yes", diet: "Halal", table: "t-2" },
  { id: "g-21", name: "Freya Lund", party: "University friends", rsvp: "yes", diet: "Vegetarian", table: null },
  { id: "g-22", name: "Jonas Lund", party: "University friends", rsvp: "yes", diet: null, table: null },
  { id: "g-23", name: "Grace Lee", party: "Work friends", rsvp: "yes", diet: null, table: "t-5" },
  { id: "g-24", name: "Marcus Webb", party: "Work friends", rsvp: "yes", diet: null, table: "t-5" },
  { id: "g-25", name: "Nadia Petrova", party: "Work friends", rsvp: "yes", diet: "Pescatarian", table: "t-5" },
  { id: "g-26", name: "Tom Fisher", party: "Work friends", rsvp: "no", diet: null, table: null },
  { id: "g-27", name: "Hana Sato", party: "Work friends", rsvp: "yes", diet: null, table: null },
  { id: "g-28", name: "Luis Ortega", party: "Groom's football club", rsvp: "yes", diet: null, table: "t-3" },
  { id: "g-29", name: "Kai Brennan", party: "Groom's football club", rsvp: "yes", diet: null, table: "t-3" },
  { id: "g-30", name: "Sean Doyle", party: "Groom's football club", rsvp: "yes", diet: null, table: "t-3" },
  { id: "g-31", name: "Ryan Doyle", party: "Groom's football club", rsvp: "yes", diet: null, table: null },
  { id: "g-32", name: "Hugo Carvalho", party: "Bride's family", rsvp: "yes", diet: "Children's menu", table: "t-1" },
  { id: "g-33", name: "Mia Carvalho", party: "Bride's family", rsvp: "yes", diet: "Children's menu", table: null },
  { id: "g-34", name: "Paula Mendes", party: "Bride's family", rsvp: "pending", diet: null, table: null },
  { id: "g-35", name: "Victor Mendes", party: "Bride's family", rsvp: "pending", diet: null, table: null },
  { id: "g-36", name: "Zoe Bennett", party: "Plus-ones", rsvp: "yes", diet: null, table: "t-2" },
  { id: "g-37", name: "Arjun Mehta", party: "Plus-ones", rsvp: "yes", diet: "Vegetarian", table: "t-5" },
  { id: "g-38", name: "Laura Svensson", party: "Plus-ones", rsvp: "yes", diet: null, table: null },
];

// The note on the Doyle rule names the brothers Sean and Ryan Doyle (g-30 and
// g-31), so the rule follows the names rather than the ids g-29 / g-30.
export const RULES: Rule[] = [
  { kind: "together", guests: ["g-21", "g-22"], note: "Couple" },
  { kind: "together", guests: ["g-32", "g-33"], note: "Siblings, under 10" },
  { kind: "apart", guests: ["g-30", "g-31"], note: "Brothers Sean and Ryan Doyle are not speaking" },
  { kind: "apart", guests: ["g-12", "g-34"], note: "Ask the couple: old family dispute" },
  {
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
  },
];

export const guestById = new Map(GUESTS.map((g) => [g.id, g]));
export const tableById = new Map(TABLES.map((t) => [t.id, t]));

export const PARTIES: string[] = Array.from(new Set(GUESTS.map((g) => g.party)));
export const DIETS: string[] = Array.from(
  new Set(GUESTS.map((g) => g.diet).filter((d): d is string => d !== null)),
);

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  no: "Declined",
  maybe: "Maybe",
  pending: "Awaiting reply",
};

export const PARTY_COLOR: Record<string, string> = {
  Couple: "#b0396b",
  "Bride's family": "#2f6f9f",
  "Groom's family": "#2e7d5b",
  "University friends": "#7a4fb5",
  "Work friends": "#a65a10",
  "Groom's football club": "#4d5b6a",
  "Plus-ones": "#7a6a10",
};

export const DIET_COLOR: Record<string, string> = {
  Vegetarian: "#3f9b4f",
  Vegan: "#1e9a8a",
  "Gluten free": "#d19a1c",
  "Soft food": "#6d8fb3",
  Halal: "#8e5fc0",
  "Nut allergy": "#d6453d",
  Pescatarian: "#2f86d6",
  "Children's menu": "#d6619c",
};
```

```ts src/lib/plan.tsx
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
```

```css src/components/seatwise/seatwise.css
.sw-app {
  --bg: #f4f1ea;
  --surface: #ffffff;
  --surface2: #faf8f3;
  --ink: #1d2330;
  --muted: #566073;
  --line: #e1dccf;
  --line-strong: #bdb6a4;
  --accent: #2b5c4e;
  --accent-ink: #ffffff;
  --accent-soft: #dcebe4;
  --bad: #b3261e;
  --bad-soft: #fbe3e0;
  --warn: #7d5200;
  --warn-soft: #fff0cc;
  --ok: #1b6e45;
  --ok-soft: #dcf1e5;
  --room: #fcfbf7;
  --grid: #ece8dc;
  --fixture: #e8e2d3;
  background: var(--bg);
  color: var(--ink);
  min-height: 100vh;
  width: 100%;
  font-size: 15px;
  line-height: 1.45;
}
:root[data-theme="dark"] .sw-app {
  --bg: #13161b;
  --surface: #1b1f26;
  --surface2: #20252d;
  --ink: #eceef2;
  --muted: #a3abb9;
  --line: #2d333d;
  --line-strong: #4a5260;
  --accent: #79c7a7;
  --accent-ink: #0d1f18;
  --accent-soft: #1f3a31;
  --bad: #ff8f86;
  --bad-soft: #3b1f1d;
  --warn: #f0c566;
  --warn-soft: #3a3014;
  --ok: #7fd6a4;
  --ok-soft: #1a3427;
  --room: #171b21;
  --grid: #222831;
  --fixture: #2a303a;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .sw-app {
    --bg: #13161b;
    --surface: #1b1f26;
    --surface2: #20252d;
    --ink: #eceef2;
    --muted: #a3abb9;
    --line: #2d333d;
    --line-strong: #4a5260;
    --accent: #79c7a7;
    --accent-ink: #0d1f18;
    --accent-soft: #1f3a31;
    --bad: #ff8f86;
    --bad-soft: #3b1f1d;
    --warn: #f0c566;
    --warn-soft: #3a3014;
    --ok: #7fd6a4;
    --ok-soft: #1a3427;
    --room: #171b21;
    --grid: #222831;
    --fixture: #2a303a;
  }
}

.sw-app *,
.sw-app *::before,
.sw-app *::after {
  box-sizing: border-box;
}
.sw-app :focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
.sw-app h1,
.sw-app h2,
.sw-app h3,
.sw-app p {
  margin: 0;
}
.sw-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* ---- header ---- */
.sw-top {
  background: var(--surface);
  border-bottom: 1px solid var(--line);
}
.sw-top-in {
  max-width: 1480px;
  margin: 0 auto;
  padding: 12px 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 24px;
}
.sw-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 18px;
  letter-spacing: -0.01em;
  color: var(--ink);
  text-decoration: none;
}
.sw-logo {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: var(--accent);
  color: var(--accent-ink);
  display: grid;
  place-items: center;
}
.sw-event {
  flex: 1 1 260px;
  min-width: 0;
}
.sw-event strong {
  display: block;
  font-size: 16px;
}
.sw-event span {
  color: var(--muted);
  font-size: 13px;
}
.sw-nav {
  display: flex;
  gap: 4px;
}
.sw-nav a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 16px;
  border-radius: 10px;
  color: var(--muted);
  text-decoration: none;
  font-weight: 600;
}
.sw-nav a:hover {
  background: var(--surface2);
  color: var(--ink);
}
.sw-nav a[aria-current="page"] {
  background: var(--accent-soft);
  color: var(--accent);
}
.sw-planner {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--muted);
}
.sw-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 700;
  display: grid;
  place-items: center;
  font-size: 13px;
}

.sw-wrap {
  max-width: 1480px;
  margin: 0 auto;
  padding: 16px;
}

/* ---- stats ---- */
.sw-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  margin: 0 0 16px;
}
.sw-stat {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 10px 14px;
}
.sw-stat dt {
  font-size: 12px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.sw-stat dd {
  margin: 2px 0 0;
  font-size: 24px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.sw-stat dd small {
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
}
.sw-stat.is-bad {
  border-color: var(--bad);
  background: var(--bad-soft);
}
.sw-stat.is-bad dd {
  color: var(--bad);
}
.sw-stat.is-good dd {
  color: var(--ok);
}

/* ---- layout ---- */
.sw-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 372px;
  gap: 16px;
  align-items: start;
}
@media (max-width: 1100px) {
  .sw-main {
    grid-template-columns: minmax(0, 1fr);
  }
}
.sw-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 14px;
}
.sw-card + .sw-card {
  margin-top: 12px;
}
.sw-card h2 {
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.sw-sub {
  color: var(--muted);
  font-size: 13px;
}
.sw-count {
  font-size: 12px;
  font-weight: 600;
  background: var(--surface2);
  border: 1px solid var(--line);
  border-radius: 99px;
  padding: 1px 9px;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

/* ---- plan ---- */
.sw-planhead {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 16px;
  margin-bottom: 10px;
}
.sw-notice {
  min-height: 22px;
  font-size: 13.5px;
  color: var(--accent);
  font-weight: 600;
  margin-bottom: 8px;
}
.sw-scroll {
  overflow-x: auto;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--room);
  -webkit-overflow-scrolling: touch;
}
.sw-room {
  position: relative;
  aspect-ratio: 24 / 14;
  min-width: 900px;
  container-type: inline-size;
}
.sw-roomin {
  --m: calc(100cqw / 24);
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid) 1px, transparent 1px);
  background-size: var(--m) var(--m);
}
.sw-fx {
  position: absolute;
  background: var(--fixture);
  border: 1.5px solid var(--line-strong);
  border-radius: 6px;
  display: grid;
  place-items: center;
  text-align: center;
  font-size: max(10px, calc(var(--m) * 0.34));
  font-weight: 600;
  color: var(--muted);
  overflow: hidden;
}
.sw-fx.dancefloor {
  background-image: repeating-conic-gradient(var(--fixture) 0 25%, transparent 0 50%);
  background-size: calc(var(--m) * 0.9) calc(var(--m) * 0.9);
  border-style: dashed;
}
.sw-fx.dancefloor span {
  background: var(--room);
  padding: 2px 8px;
  border-radius: 6px;
}
.sw-fx.stage {
  background: var(--accent-soft);
  color: var(--accent);
}
.sw-fx.bar {
  background: var(--warn-soft);
  color: var(--warn);
}
.sw-fx.door {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-ink);
  border-radius: 2px;
  font-size: max(9px, calc(var(--m) * 0.27));
}
.sw-fx.door span {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  white-space: nowrap;
}

.sw-table {
  position: absolute;
  transform: translate(-50%, -50%);
}
.sw-disc {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: var(--surface);
  border: 2px solid var(--line-strong);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  line-height: 1.15;
  font-size: max(11px, calc(var(--m) * 0.33));
  font-weight: 700;
  color: var(--ink);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}
.sw-table.long .sw-disc {
  border-radius: 12px;
  flex-direction: row;
  gap: 8px;
}
.sw-disc small {
  font-weight: 600;
  color: var(--muted);
  font-size: 0.85em;
  font-variant-numeric: tabular-nums;
}
.sw-table.is-selected .sw-disc {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
  border-color: var(--accent);
}
.sw-table.is-broken .sw-disc {
  border-color: var(--bad);
  box-shadow: 0 0 0 3px var(--bad-soft), 0 0 0 5px var(--bad);
}
.sw-table.is-over .sw-disc {
  background: var(--accent-soft);
}
.sw-table.is-full .sw-disc small {
  color: var(--ok);
}
.sw-flag {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(30%, -30%);
  z-index: 4;
  width: max(18px, calc(var(--m) * 0.55));
  height: max(18px, calc(var(--m) * 0.55));
  border-radius: 50%;
  background: var(--bad);
  color: #fff;
  font-weight: 800;
  font-size: max(11px, calc(var(--m) * 0.36));
  display: grid;
  place-items: center;
  pointer-events: none;
}
.sw-seat {
  position: absolute;
  z-index: 2;
  transform: translate(-50%, -50%);
  width: calc(var(--m) * 0.85);
  height: calc(var(--m) * 0.85);
  min-width: 26px;
  min-height: 26px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: max(10px, calc(var(--m) * 0.3));
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  border: 2px solid transparent;
  background: var(--seat, var(--surface));
}
.sw-seat.empty {
  background: var(--surface);
  border: 1.5px dashed var(--line-strong);
  color: var(--muted);
  font-weight: 600;
}
.sw-room.is-placing .sw-seat.empty {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}
.sw-seat.is-over {
  box-shadow: 0 0 0 4px var(--accent);
}
.sw-seat.is-flag {
  box-shadow: 0 0 0 3px var(--bad);
  border-color: #fff;
}
.sw-seat.is-held {
  box-shadow: 0 0 0 3px var(--accent), 0 0 0 6px var(--accent-soft);
  border-color: #fff;
  z-index: 3;
}
.sw-seat[draggable="true"] {
  cursor: grab;
}
.sw-dot {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 38%;
  height: 38%;
  border-radius: 50%;
  background: var(--c);
  border: 2px solid var(--surface);
}

.sw-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin-top: 10px;
  font-size: 12.5px;
  color: var(--muted);
}
.sw-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.sw-sw {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--c);
  display: inline-block;
}

/* ---- side panel ---- */
.sw-held {
  background: var(--accent-soft);
  border: 1px solid var(--accent);
  border-radius: 14px;
  padding: 12px 14px;
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}
.sw-held strong {
  flex: 1 1 100%;
}
.sw-btn {
  font: inherit;
  font-weight: 600;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid var(--line-strong);
  background: var(--surface);
  color: var(--ink);
  cursor: pointer;
}
.sw-btn:hover {
  background: var(--surface2);
}
.sw-btn.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-ink);
}
.sw-btn.small {
  min-height: 34px;
  padding: 0 10px;
  font-size: 13px;
}
.sw-select,
.sw-input {
  font: inherit;
  min-height: 40px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid var(--line-strong);
  background: var(--surface);
  color: var(--ink);
  max-width: 100%;
}
.sw-select.small {
  min-height: 34px;
  font-size: 13px;
}
.sw-rules {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}
.sw-rule {
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 8px 10px;
  background: var(--surface2);
  font-size: 13.5px;
}
.sw-rule.broken {
  border-color: var(--bad);
  background: var(--bad-soft);
}
.sw-rule.ok {
  border-color: var(--line);
}
.sw-rule b {
  display: block;
}
.sw-rule .sw-pill {
  margin-bottom: 4px;
}
.sw-pill {
  display: inline-block;
  font-size: 11.5px;
  font-weight: 700;
  padding: 1px 8px;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.sw-pill.broken {
  background: var(--bad);
  color: #fff;
}
.sw-pill.ok {
  background: var(--ok-soft);
  color: var(--ok);
}
.sw-pill.pending {
  background: var(--warn-soft);
  color: var(--warn);
}
.sw-rule button.link {
  font: inherit;
  background: none;
  border: 0;
  padding: 4px 0 0;
  color: var(--accent);
  text-decoration: underline;
  cursor: pointer;
  min-height: 32px;
}
.sw-glist {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 6px;
}
.sw-grow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
  padding: 8px 10px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface);
}
.sw-grow.is-held {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-soft);
}
.sw-gmain {
  flex: 1 1 150px;
  min-width: 0;
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  color: inherit;
  text-align: left;
}
.sw-gmain[draggable="true"] {
  cursor: grab;
}
.sw-gname {
  display: block;
  font-weight: 600;
}
.sw-gmeta {
  display: block;
  font-size: 12.5px;
  color: var(--muted);
}
.sw-chipdot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--c);
  flex: none;
}
.sw-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  padding: 1px 8px;
  border-radius: 99px;
  border: 1px solid color-mix(in srgb, var(--c) 60%, transparent);
  background: color-mix(in srgb, var(--c) 16%, transparent);
  color: var(--ink);
  white-space: nowrap;
}
.sw-tag::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--c);
}
.sw-tag.plain::before {
  display: none;
}
.sw-tag.neutral {
  --c: var(--muted);
}
.sw-tag.yes {
  --c: #2e9c61;
}
.sw-tag.no {
  --c: #d6453d;
}
.sw-tag.maybe,
.sw-tag.pending {
  --c: #d19a1c;
}
.sw-dropzone {
  border: 2px dashed transparent;
  border-radius: 12px;
}
.sw-dropzone.is-over {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.sw-empty {
  color: var(--muted);
  font-size: 13.5px;
  padding: 6px 2px;
}
.sw-needs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 8px 0;
}

/* ---- guests page ---- */
.sw-h1 {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.sw-filters {
  display: grid;
  grid-template-columns: minmax(200px, 2fr) repeat(4, minmax(130px, 1fr));
  gap: 10px;
  margin: 12px 0;
}
@media (max-width: 900px) {
  .sw-filters {
    grid-template-columns: 1fr 1fr;
  }
  .sw-filters .wide {
    grid-column: 1 / -1;
  }
}
.sw-field {
  display: grid;
  gap: 4px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--muted);
}
.sw-field .sw-select,
.sw-field .sw-input {
  width: 100%;
  font-weight: 400;
  color: var(--ink);
}
.sw-gl {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 16px;
  align-items: start;
}
@media (max-width: 1100px) {
  .sw-gl {
    grid-template-columns: minmax(0, 1fr);
  }
}
.sw-tablewrap {
  overflow-x: auto;
}
.sw-t {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.sw-t th,
.sw-t td {
  text-align: left;
  padding: 9px 10px;
  border-bottom: 1px solid var(--line);
  vertical-align: middle;
}
.sw-t th {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
  white-space: nowrap;
}
.sw-t td.num,
.sw-t th.num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.sw-t tfoot td {
  font-weight: 700;
  border-bottom: 0;
}
.sw-t a {
  color: var(--accent);
  font-weight: 600;
}
.sw-gt tbody tr:hover {
  background: var(--surface2);
}
@media (max-width: 700px) {
  .sw-gt thead {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }
  .sw-gt,
  .sw-gt tbody,
  .sw-gt tr,
  .sw-gt td {
    display: block;
    width: 100%;
  }
  .sw-gt tr {
    border: 1px solid var(--line);
    border-radius: 10px;
    margin-bottom: 8px;
    padding: 6px 4px;
  }
  .sw-gt td {
    border: 0;
    padding: 3px 8px;
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }
  .sw-gt td::before {
    content: attr(data-label);
    color: var(--muted);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .sw-gt td:first-child {
    font-weight: 700;
  }
}
```

```tsx src/components/seatwise/AppFrame.tsx
"use client";

import "./seatwise.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { EVENT, PLANNER, APP } from "@/lib/data";
import { usePlan } from "@/lib/plan";

const dateLabel = new Date(`${EVENT.date}T12:00:00Z`).toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const plan = usePlan();
  const { stats, brokenCount, heldId, hold } = plan;

  useEffect(() => {
    if (!heldId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hold(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [heldId, hold]);

  const initials = PLANNER.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  return (
    <div className="sw-app">
      <header className="sw-top">
        <div className="sw-top-in">
          <Link href="/" className="sw-brand">
            <span className="sw-logo" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="4.5" />
                <circle cx="12" cy="3.5" r="1.4" fill="currentColor" />
                <circle cx="12" cy="20.5" r="1.4" fill="currentColor" />
                <circle cx="3.5" cy="12" r="1.4" fill="currentColor" />
                <circle cx="20.5" cy="12" r="1.4" fill="currentColor" />
              </svg>
            </span>
            {APP}
          </Link>
          <div className="sw-event">
            <strong>{EVENT.name}</strong>
            <span>
              {dateLabel} · {EVENT.venue}
            </span>
          </div>
          <nav className="sw-nav" aria-label="Main">
            <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>
              Seating plan
            </Link>
            <Link href="/guests" aria-current={pathname === "/guests" ? "page" : undefined}>
              Guest list
            </Link>
          </nav>
          <div className="sw-planner">
            <span className="sw-avatar" aria-hidden="true">
              {initials}
            </span>
            <span>
              Planner
              <br />
              <b style={{ color: "var(--ink)" }}>{PLANNER.name}</b>
            </span>
          </div>
        </div>
      </header>
      <div className="sw-wrap">
        <dl className="sw-stats" aria-label="Seating totals">
          <div className="sw-stat">
            <dt>Seated</dt>
            <dd>
              {stats.seated} <small>of {stats.attending} attending</small>
            </dd>
          </div>
          <div className={`sw-stat ${stats.unseatedAttending === 0 ? "is-good" : ""}`}>
            <dt>Still to seat</dt>
            <dd>{stats.unseatedAttending}</dd>
          </div>
          <div className="sw-stat">
            <dt>Free seats</dt>
            <dd>
              {stats.freeSeats} <small>of {stats.totalSeats}</small>
            </dd>
          </div>
          <div className={`sw-stat ${brokenCount > 0 ? "is-bad" : "is-good"}`}>
            <dt>Couple's rules</dt>
            <dd>{brokenCount === 0 ? "All kept" : `${brokenCount} broken`}</dd>
          </div>
        </dl>
        {children}
      </div>
    </div>
  );
}
```

```tsx src/components/seatwise/bits.tsx
"use client";

import type { CSSProperties } from "react";
import { DIET_COLOR, PARTY_COLOR, RSVP_LABEL, type Rsvp } from "@/lib/data";

export function cssVars(o: Record<string, string>): CSSProperties {
  return o as CSSProperties;
}

export function initialsOf(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function partyColor(party: string): string {
  return PARTY_COLOR[party] ?? "#4d5b6a";
}

export function DietTag({ diet }: { diet: string | null }) {
  if (!diet) return null;
  return (
    <span className="sw-tag" style={cssVars({ "--c": DIET_COLOR[diet] ?? "#6d8fb3" })}>
      {diet}
    </span>
  );
}

export function RsvpTag({ rsvp }: { rsvp: Rsvp }) {
  return <span className={`sw-tag plain ${rsvp}`}>{RSVP_LABEL[rsvp]}</span>;
}
```

```tsx src/components/seatwise/RoomPlan.tsx
"use client";

import { useState, type DragEvent, type KeyboardEvent } from "react";
import { DIET_COLOR, EVENT, FIXTURES, PARTIES, TABLES, guestById, type PlanTable } from "@/lib/data";
import { seatPoints, tableSize, usePlan } from "@/lib/plan";
import { cssVars, initialsOf, partyColor } from "./bits";

const W = EVENT.room.width;
const D = EVENT.room.depth;

function activate(e: KeyboardEvent, fn: () => void) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fn();
  }
}

export function RoomPlan() {
  const plan = usePlan();
  const [over, setOver] = useState<string | null>(null);

  const dragStart = (e: DragEvent, guestId: string) => {
    e.dataTransfer.setData("text/plain", guestId);
    e.dataTransfer.effectAllowed = "move";
    plan.setDragId(guestId);
  };
  const dragEnd = () => {
    plan.setDragId(null);
    setOver(null);
  };
  const dragged = (e: DragEvent): string | null =>
    plan.dragId ?? (e.dataTransfer.getData("text/plain") || null);

  const onSeat = (t: PlanTable, i: number) => {
    const gid = plan.seats[t.id][i];
    plan.selectTable(t.id);
    if (plan.heldId) {
      if (plan.heldId === gid) plan.hold(null);
      else plan.place(plan.heldId, t.id, i);
    } else if (gid) {
      plan.hold(gid);
    }
  };

  const onDisc = (t: PlanTable) => {
    plan.selectTable(t.id);
    if (plan.heldId) plan.place(plan.heldId, t.id);
  };

  return (
    <section className="sw-card" aria-labelledby="plan-h">
      <div className="sw-planhead">
        <h2 id="plan-h" style={{ margin: 0 }}>
          Room plan
        </h2>
        <span className="sw-sub">
          {EVENT.venue} · {W} m × {D} m · one grid square is 1 m
        </span>
      </div>
      <div className="sw-notice" role="status" aria-live="polite">
        {plan.notice || "Drag a guest to a seat, or tap a guest and then a seat. Tap a table to see its guests."}
      </div>
      <div className="sw-scroll" tabIndex={0} role="group" aria-label="Room plan, scrolls sideways on small screens">
        <div className={`sw-room ${plan.heldId ? "is-placing" : ""}`}>
          <div className="sw-roomin">
            {FIXTURES.map((f) => (
              <div
                key={f.id}
                className={`sw-fx ${f.kind}`}
                style={{
                  left: `${(f.x / W) * 100}%`,
                  top: `${(f.y / D) * 100}%`,
                  width: `${(f.w / W) * 100}%`,
                  height: `${(f.h / D) * 100}%`,
                }}
              >
                <span>{f.label}</span>
              </div>
            ))}

            {TABLES.map((t) => {
              const size = tableSize(t);
              const pts = seatPoints(t);
              const count = plan.tableCount(t.id);
              const broken = plan.brokenTables.has(t.id);
              const cls = [
                "sw-table",
                t.shape,
                plan.selectedTableId === t.id ? "is-selected" : "",
                broken ? "is-broken" : "",
                over === t.id ? "is-over" : "",
                count === t.seats ? "is-full" : "",
              ].join(" ");
              return (
                <div
                  key={t.id}
                  className={cls}
                  style={{
                    left: `${(t.x / W) * 100}%`,
                    top: `${(t.y / D) * 100}%`,
                    width: `calc(var(--m) * ${size.w})`,
                    height: `calc(var(--m) * ${size.h})`,
                  }}
                >
                  <div
                    className="sw-disc"
                    role="button"
                    tabIndex={0}
                    aria-pressed={plan.selectedTableId === t.id}
                    aria-label={`${t.name}, ${count} of ${t.seats} seats filled${broken ? ", a rule is broken here" : ""}. Show guests.`}
                    onClick={() => onDisc(t)}
                    onKeyDown={(e) => activate(e, () => onDisc(t))}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setOver(t.id);
                    }}
                    onDragLeave={() => setOver((o) => (o === t.id ? null : o))}
                    onDrop={(e) => {
                      e.preventDefault();
                      const gid = dragged(e);
                      setOver(null);
                      plan.setDragId(null);
                      if (gid) plan.place(gid, t.id);
                    }}
                  >
                    <span>{t.name}</span>
                    <small>
                      {count}/{t.seats}
                    </small>
                  </div>
                  {broken && (
                    <span className="sw-flag" aria-hidden="true">
                      !
                    </span>
                  )}
                  {pts.map((p, i) => {
                    const gid = plan.seats[t.id][i];
                    const g = gid ? guestById.get(gid) : undefined;
                    const key = `${t.id}:${i}`;
                    const held = !!gid && plan.heldId === gid;
                    const flagged = !!gid && plan.flaggedGuests.has(gid) && broken;
                    const label = g
                      ? `${t.name}, seat ${i + 1}: ${g.name}${g.diet ? `, ${g.diet}` : ""}${flagged ? ", involved in a broken rule" : ""}. ${plan.heldId ? "Swap here" : "Select to move"}.`
                      : `${t.name}, seat ${i + 1}: empty.${plan.heldId ? " Place selected guest here." : ""}`;
                    return (
                      <div
                        key={key}
                        role="button"
                        tabIndex={0}
                        aria-label={label}
                        draggable={!!g}
                        className={[
                          "sw-seat",
                          g ? "" : "empty",
                          held ? "is-held" : "",
                          flagged ? "is-flag" : "",
                          over === key ? "is-over" : "",
                        ].join(" ")}
                        style={{
                          left: `calc(50% + var(--m) * ${p.dx.toFixed(3)})`,
                          top: `calc(50% + var(--m) * ${p.dy.toFixed(3)})`,
                          ...(g ? cssVars({ "--seat": partyColor(g.party) }) : {}),
                        }}
                        title={g ? `${g.name}${g.diet ? ` (${g.diet})` : ""}` : `Empty seat ${i + 1}`}
                        onClick={() => onSeat(t, i)}
                        onKeyDown={(e) => activate(e, () => onSeat(t, i))}
                        onDragStart={(e) => g && dragStart(e, g.id)}
                        onDragEnd={dragEnd}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOver(key);
                        }}
                        onDragLeave={() => setOver((o) => (o === key ? null : o))}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const id = dragged(e);
                          setOver(null);
                          plan.setDragId(null);
                          if (id) plan.place(id, t.id, i);
                        }}
                      >
                        {g ? initialsOf(g.name) : i + 1}
                        {g?.diet && (
                          <i className="sw-dot" style={cssVars({ "--c": DIET_COLOR[g.diet] ?? "#6d8fb3" })} aria-hidden="true" />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="sw-legend" aria-label="Legend">
        {PARTIES.map((p) => (
          <span key={p}>
            <i className="sw-sw" style={cssVars({ "--c": partyColor(p) })} />
            {p}
          </span>
        ))}
        <span>
          <i className="sw-sw" style={{ background: "transparent", border: "1.5px dashed var(--line-strong)" }} />
          Empty seat
        </span>
        <span>Small coloured dot: dietary need</span>
        <span>Red ring and !: broken rule</span>
      </div>
    </section>
  );
}
```

```tsx src/components/seatwise/SidePanel.tsx
"use client";

import { useState, type DragEvent } from "react";
import { DIET_COLOR, GUESTS, TABLES, guestById, tableById, type Guest } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { DietTag, cssVars, partyColor } from "./bits";

function GuestRow({ g }: { g: Guest }) {
  const plan = usePlan();
  const held = plan.heldId === g.id;
  const seated = plan.tableOf[g.id];
  const options = TABLES.filter((t) => t.id !== seated && plan.tableCount(t.id) < t.seats);

  const onDragStart = (e: DragEvent) => {
    e.dataTransfer.setData("text/plain", g.id);
    e.dataTransfer.effectAllowed = "move";
    plan.setDragId(g.id);
  };

  return (
    <li className={`sw-grow ${held ? "is-held" : ""}`}>
      <button
        type="button"
        className="sw-gmain"
        aria-pressed={held}
        draggable
        onDragStart={onDragStart}
        onDragEnd={() => plan.setDragId(null)}
        onClick={() => plan.hold(held ? null : g.id)}
      >
        <span className="sw-chipdot" style={cssVars({ "--c": partyColor(g.party) })} aria-hidden="true" />
        <span>
          <span className="sw-gname">{g.name}</span>
          <span className="sw-gmeta">{g.party}</span>
        </span>
      </button>
      <DietTag diet={g.diet} />
      <select
        className="sw-select small"
        aria-label={`${seated ? "Move" : "Seat"} ${g.name} at a table`}
        value=""
        onChange={(e) => {
          if (e.target.value) plan.place(g.id, e.target.value);
        }}
      >
        <option value="">{seated ? "Move to…" : "Seat at…"}</option>
        {options.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name} ({t.seats - plan.tableCount(t.id)} free)
          </option>
        ))}
      </select>
      {seated && (
        <button type="button" className="sw-btn small" onClick={() => plan.unseat(g.id)} aria-label={`Unseat ${g.name}`}>
          Unseat
        </button>
      )}
    </li>
  );
}

export function SidePanel() {
  const plan = usePlan();
  const [over, setOver] = useState(false);

  const held = plan.heldId ? guestById.get(plan.heldId) : undefined;
  const heldTable = held ? plan.tableOf[held.id] : null;

  const toSeat = GUESTS.filter((g) => g.rsvp === "yes" && !plan.tableOf[g.id]);
  const unconfirmed = GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !plan.tableOf[g.id]);

  const selected = plan.selectedTableId ? tableById.get(plan.selectedTableId) : undefined;
  const tableGuests = selected
    ? (plan.seats[selected.id] ?? []).filter((x): x is string => x !== null).map((id) => guestById.get(id)).filter((g): g is Guest => !!g)
    : [];
  const needs = new Map<string, number>();
  tableGuests.forEach((g) => g.diet && needs.set(g.diet, (needs.get(g.diet) ?? 0) + 1));
  const tableResults = selected ? plan.results.filter((r) => r.tables.includes(selected.id) && r.status === "broken") : [];

  return (
    <aside aria-label="Guests, rules and table details">
      {held && (
        <div className="sw-held" role="group" aria-label="Selected guest">
          <strong>
            {held.name} is selected{heldTable ? ` (at ${tableById.get(heldTable)?.name})` : ""}
          </strong>
          <span className="sw-sub" style={{ flex: "1 1 100%" }}>
            Tap an empty seat to place, a seated guest to swap, or a table to take the next free seat.
          </span>
          {heldTable && (
            <button type="button" className="sw-btn small" onClick={() => plan.unseat(held.id)}>
              Unseat
            </button>
          )}
          <button type="button" className="sw-btn small" onClick={() => plan.hold(null)}>
            Cancel (Esc)
          </button>
        </div>
      )}

      <section className="sw-card" aria-labelledby="rules-h">
        <h2 id="rules-h">
          The couple's rules
          <span className="sw-count">{plan.brokenCount === 0 ? "all kept" : `${plan.brokenCount} broken`}</span>
        </h2>
        <ul className="sw-rules">
          {plan.results.map((r) => (
            <li key={r.index} className={`sw-rule ${r.status}`}>
              <span className={`sw-pill ${r.status}`}>
                {r.status === "ok" ? "Kept" : r.status === "broken" ? "Broken" : "Waiting"}
              </span>
              <b>{r.title}</b>
              <span>{r.detail}</span>
              {r.rule.kind !== "near" && r.status === "broken" ? null : null}
              {r.status === "broken" && r.tables[0] && (
                <button type="button" className="link" onClick={() => plan.selectTable(r.tables[0])}>
                  Show {r.tables.map((t) => tableById.get(t)?.name).join(" and ")}
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="sw-card" aria-labelledby="table-h">
        {selected ? (
          <>
            <h2 id="table-h">
              {selected.name}
              <span className="sw-count">
                {tableGuests.length}/{selected.seats} seats
              </span>
            </h2>
            {tableResults.map((r) => (
              <p key={r.index} className="sw-rule broken" style={{ marginBottom: 8 }}>
                <span className="sw-pill broken">Broken</span> {r.detail}
              </p>
            ))}
            {needs.size > 0 ? (
              <div className="sw-needs" aria-label="Dietary needs at this table">
                {Array.from(needs.entries()).map(([d, n]) => (
                  <span key={d} className="sw-tag" style={cssVars({ "--c": DIET_COLOR[d] ?? "#6d8fb3" })}>
                    {n} × {d}
                  </span>
                ))}
              </div>
            ) : (
              <p className="sw-sub" style={{ margin: "6px 0" }}>
                No dietary needs at this table.
              </p>
            )}
            {tableGuests.length === 0 ? (
              <p className="sw-empty">Nobody is seated here yet.</p>
            ) : (
              <ul className="sw-glist">
                {tableGuests.map((g) => (
                  <GuestRow key={g.id} g={g} />
                ))}
              </ul>
            )}
            <button type="button" className="sw-btn small" style={{ marginTop: 10 }} onClick={() => plan.selectTable(null)}>
              Close table
            </button>
          </>
        ) : (
          <>
            <h2 id="table-h">Table details</h2>
            <p className="sw-empty">Select a table on the plan to see who sits there and what they can eat.</p>
          </>
        )}
      </section>

      <section
        className={`sw-card sw-dropzone ${over ? "is-over" : ""}`}
        aria-labelledby="toseat-h"
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const id = plan.dragId ?? e.dataTransfer.getData("text/plain");
          plan.setDragId(null);
          if (id) plan.unseat(id);
        }}
      >
        <h2 id="toseat-h">
          Attending, no seat yet
          <span className="sw-count">{toSeat.length}</span>
        </h2>
        {toSeat.length === 0 ? (
          <p className="sw-empty">Everyone attending has a seat.</p>
        ) : (
          <ul className="sw-glist">
            {toSeat.map((g) => (
              <GuestRow key={g.id} g={g} />
            ))}
          </ul>
        )}
        <p className="sw-sub" style={{ marginTop: 8 }}>
          Drop a seated guest here to unseat them.
        </p>
      </section>

      {unconfirmed.length > 0 && (
        <section className="sw-card" aria-labelledby="unconf-h">
          <h2 id="unconf-h">
            Not confirmed yet
            <span className="sw-count">{unconfirmed.length}</span>
          </h2>
          <ul className="sw-glist">
            {unconfirmed.map((g) => (
              <GuestRow key={g.id} g={g} />
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}
```

```tsx src/components/seatwise/PlanView.tsx
"use client";

import { AppFrame } from "./AppFrame";
import { RoomPlan } from "./RoomPlan";
import { SidePanel } from "./SidePanel";

export function PlanView() {
  return (
    <AppFrame>
      <h1 className="sw-vh">Seating plan</h1>
      <div className="sw-main">
        <RoomPlan />
        <SidePanel />
      </div>
    </AppFrame>
  );
}
```

```tsx src/components/seatwise/GuestsView.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DIETS, GUESTS, PARTIES, RSVP_LABEL, tableById, type Rsvp } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { AppFrame } from "./AppFrame";
import { DietTag, RsvpTag } from "./bits";

const STANDARD = "Standard (no dietary need)";

export function GuestsView() {
  const plan = usePlan();
  const [q, setQ] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState("all");
  const [diet, setDiet] = useState("all");
  const [seating, setSeating] = useState("all");
  const [copied, setCopied] = useState("");

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return GUESTS.filter((g) => {
      if (needle && !g.name.toLowerCase().includes(needle) && !g.party.toLowerCase().includes(needle)) return false;
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === "none" && g.diet) return false;
      if (diet === "any" && !g.diet) return false;
      if (diet !== "all" && diet !== "none" && diet !== "any" && g.diet !== diet) return false;
      const seated = !!plan.tableOf[g.id];
      if (seating === "seated" && !seated) return false;
      if (seating === "unseated" && seated) return false;
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name, "en"));
  }, [q, party, rsvp, diet, seating, plan.tableOf]);

  const meals = useMemo(() => {
    const names = [STANDARD, ...DIETS];
    const list = names.map((name) => {
      const match = GUESTS.filter((g) => (name === STANDARD ? !g.diet : g.diet === name));
      return {
        name,
        yes: match.filter((g) => g.rsvp === "yes").length,
        open: match.filter((g) => g.rsvp === "maybe" || g.rsvp === "pending").length,
      };
    });
    return {
      list,
      yes: list.reduce((n, r) => n + r.yes, 0),
      open: list.reduce((n, r) => n + r.open, 0),
      declined: GUESTS.filter((g) => g.rsvp === "no").length,
    };
  }, []);

  const copy = async () => {
    const text = [
      "Meal counts, Ines & Mateo's wedding dinner",
      ...meals.list.map((r) => `${r.name}: ${r.yes} confirmed${r.open ? `, ${r.open} awaiting` : ""}`),
      `Total: ${meals.yes} confirmed, ${meals.open} awaiting`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied("Meal counts copied.");
    } catch {
      setCopied("Copy is not available in this browser.");
    }
  };

  const reset = () => {
    setQ("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
    setSeating("all");
  };

  return (
    <AppFrame>
      <div className="sw-gl">
        <section className="sw-card" aria-labelledby="gl-h">
          <h1 id="gl-h" className="sw-h1">
            Guest list
          </h1>
          <div className="sw-filters">
            <label className="sw-field wide">
              Search
              <input
                className="sw-input"
                type="search"
                value={q}
                placeholder="Name or party"
                onChange={(e) => setQ(e.target.value)}
              />
            </label>
            <label className="sw-field">
              Party
              <select className="sw-select" value={party} onChange={(e) => setParty(e.target.value)}>
                <option value="all">All parties</option>
                {PARTIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="sw-field">
              RSVP
              <select className="sw-select" value={rsvp} onChange={(e) => setRsvp(e.target.value)}>
                <option value="all">Any reply</option>
                {(Object.keys(RSVP_LABEL) as Rsvp[]).map((r) => (
                  <option key={r} value={r}>
                    {RSVP_LABEL[r]}
                  </option>
                ))}
              </select>
            </label>
            <label className="sw-field">
              Diet
              <select className="sw-select" value={diet} onChange={(e) => setDiet(e.target.value)}>
                <option value="all">Any diet</option>
                <option value="any">Any dietary need</option>
                <option value="none">No dietary need</option>
                {DIETS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            <label className="sw-field">
              Seating
              <select className="sw-select" value={seating} onChange={(e) => setSeating(e.target.value)}>
                <option value="all">Seated or not</option>
                <option value="seated">Seated</option>
                <option value="unseated">Not seated</option>
              </select>
            </label>
          </div>
          <p className="sw-sub" role="status" aria-live="polite" style={{ marginBottom: 8 }}>
            Showing {rows.length} of {GUESTS.length} guests.{" "}
            <button type="button" className="sw-btn small" onClick={reset}>
              Clear filters
            </button>
          </p>
          {rows.length === 0 ? (
            <p className="sw-empty">No guests match these filters.</p>
          ) : (
            <div className="sw-tablewrap">
              <table className="sw-t sw-gt">
                <thead>
                  <tr>
                    <th scope="col">Guest</th>
                    <th scope="col">Party</th>
                    <th scope="col">RSVP</th>
                    <th scope="col">Diet</th>
                    <th scope="col">Table</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((g) => {
                    const tid = plan.tableOf[g.id];
                    return (
                      <tr key={g.id}>
                        <td data-label="Guest">{g.name}</td>
                        <td data-label="Party">{g.party}</td>
                        <td data-label="RSVP">
                          <RsvpTag rsvp={g.rsvp} />
                        </td>
                        <td data-label="Diet">{g.diet ? <DietTag diet={g.diet} /> : <span className="sw-sub">None</span>}</td>
                        <td data-label="Table">
                          {tid ? (
                            <Link href="/" onClick={() => plan.selectTable(tid)}>
                              {tableById.get(tid)?.name}
                            </Link>
                          ) : g.rsvp === "no" ? (
                            <span className="sw-sub">Not attending</span>
                          ) : (
                            <span className="sw-tag plain maybe">Not seated</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="sw-card" aria-labelledby="meals-h" style={{ marginTop: 0 }}>
          <h2 id="meals-h">Meals for the caterer</h2>
          <p className="sw-sub" style={{ marginBottom: 8 }}>
            Confirmed guests per meal; guests who have not answered yet are counted separately.
          </p>
          <div className="sw-tablewrap">
            <table className="sw-t">
              <thead>
                <tr>
                  <th scope="col">Meal</th>
                  <th scope="col" className="num">
                    Confirmed
                  </th>
                  <th scope="col" className="num">
                    Awaiting
                  </th>
                </tr>
              </thead>
              <tbody>
                {meals.list.map((r) => (
                  <tr key={r.name}>
                    <th scope="row" style={{ textTransform: "none", letterSpacing: 0, fontSize: 14, color: "var(--ink)", fontWeight: 500 }}>
                      {r.name}
                    </th>
                    <td className="num">{r.yes}</td>
                    <td className="num">{r.open}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td>
                  <td className="num">{meals.yes}</td>
                  <td className="num">{meals.open}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="sw-sub" style={{ marginTop: 8 }}>
            {meals.declined} declined and not counted.
          </p>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
            <button type="button" className="sw-btn primary" onClick={copy}>
              Copy meal counts
            </button>
            <span className="sw-sub" role="status" aria-live="polite">
              {copied}
            </span>
          </div>
        </section>
      </div>
    </AppFrame>
  );
}
```

```tsx src/app/page.tsx
import type { Metadata } from "next";
import { PlanView } from "@/components/seatwise/PlanView";

export const metadata: Metadata = {
  title: "Seating plan | Seatwise",
  description: "Seating plan for Ines & Mateo's wedding dinner at The Orangery, Hollin Hall.",
};

export default function Page() {
  return <PlanView />;
}
```

```tsx src/app/guests/page.tsx
import type { Metadata } from "next";
import { GuestsView } from "@/components/seatwise/GuestsView";

export const metadata: Metadata = {
  title: "Guest list | Seatwise",
  description: "Guest list, tables and meal counts for Ines & Mateo's wedding dinner.",
};

export default function Page() {
  return <GuestsView />;
}
```

```tsx src/app/layout.tsx
import '@once-ui-system/core/css/styles.css';
import '@once-ui-system/core/css/tokens.css';
import '@/resources/custom.css'

import classNames from "classnames";

import { baseURL, landing, fonts, style, dataStyle } from "@/resources";
import { Meta, Schema,  Column, Flex, ThemeInit } from "@once-ui-system/core";
import { LocaleProvider, Providers } from '@/components';
import { PlanProvider } from '@/lib/plan';
import { getLocale } from '@/lib/i18n/server';

export async function generateMetadata() {
  return Meta.generate({
    title: landing.home.title,
    description: landing.home.description,
    baseURL: baseURL,
    // The site-wide defaults. No canonical here: each page names its own, and
    // a default would point every page that doesn't at the landing page.
    image: landing.home.image,
  });
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <Flex
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      as="html"
      lang={locale}
      fillWidth
      className={classNames(
        fonts.heading.variable,
        fonts.body.variable,
        fonts.label.variable,
        fonts.code.variable,
      )}
    >
      <head>
        {/* A sync <script> is only allowed inside the document head; React 19.2
            refuses one rendered as a bare child of <html>. */}
        <Schema
          as="webPage"
          baseURL={baseURL}
          title={landing.home.title}
          description={landing.home.description}
          path={landing.home.path}
        />
        <ThemeInit
          config={{
            theme: 'system',
            brand: style.brand,
            accent: style.accent,
            neutral: style.neutral,
            solid: style.solid,
            'solid-style': style.solidStyle,
            border: style.border,
            surface: style.surface,
            transition: style.transition,
            scaling: style.scaling,
            'viz-style': dataStyle.variant,
          }}
        />
      </head>
      <LocaleProvider locale={locale}>
        <Providers>
          <PlanProvider>
            <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
              <Column fillWidth horizontal="center" flex={1}>
                {children}
              </Column>
            </Column>
          </PlanProvider>
        </Providers>
      </LocaleProvider>
    </Flex>
  );
}
```
