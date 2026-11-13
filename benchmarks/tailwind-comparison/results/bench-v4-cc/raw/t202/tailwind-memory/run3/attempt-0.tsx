```tsx app/layout.tsx
import "./globals.css";

import type { Metadata, Viewport } from "next";

import { AppShell } from "@/components/AppShell";
import { PlanProvider } from "@/components/PlanProvider";

export const metadata: Metadata = {
  title: { default: "Seatwise", template: "%s · Seatwise" },
  description: "Seatwise, a seating planner for wedding and event planners.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-paper font-sans text-ink antialiased">
        <PlanProvider>
          <AppShell>{children}</AppShell>
        </PlanProvider>
      </body>
    </html>
  );
}
```

```css app/globals.css
@import "tailwindcss";

@theme {
  --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --color-paper: #f7f5f0;
  --color-ink: #1c1917;
}

html {
  color-scheme: light;
  -webkit-text-size-adjust: 100%;
}

button,
select,
[role="button"] {
  touch-action: manipulation;
}

:focus-visible {
  outline: 2px solid #0369a1;
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}

@media print {
  body {
    background: #fff;
  }
}
```

```ts lib/data.ts
export type Rsvp = "yes" | "maybe" | "pending" | "no";

export type Guest = {
  id: string;
  name: string;
  party: string;
  rsvp: Rsvp;
  diet: string | null;
  table: string | null;
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

export type Table = {
  id: string;
  name: string;
  shape: "round" | "long";
  seats: number;
  x: number;
  y: number;
  rotation?: number;
};

export type Rule = {
  kind: "together" | "apart" | "near";
  guests: string[];
  note: string;
};

export const APP = {
  name: "Seatwise",
  tagline: "A seating planner for wedding and event planners",
};

export const EVENT = {
  name: "Ines & Mateo's wedding dinner",
  date: "2027-06-19",
  venue: "The Orangery, Hollin Hall",
};

export const ROOM = { width: 24, depth: 14 };

export const PLANNER = { name: "Hannah Brook" };

export const FIXTURES: Fixture[] = [
  { id: "f-1", kind: "stage", label: "Band", x: 10, y: 0.5, w: 4, h: 2 },
  { id: "f-2", kind: "dancefloor", label: "Dance floor", x: 8.5, y: 3, w: 7, h: 4 },
  { id: "f-3", kind: "bar", label: "Bar", x: 21, y: 10, w: 2.5, h: 3.5 },
  { id: "f-4", kind: "door", label: "Garden doors", x: 0, y: 6, w: 0.5, h: 2.5 },
];

// For the long top table, x and y are its top-left corner (the only reading that
// keeps it clear of Table 2 and centred under the band); round tables are centred.
export const TABLES: Table[] = [
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

// The rules are used exactly as given. Note that the second "apart" rule names
// g-29 and g-30 while its note talks about Sean and Ryan Doyle; the rule list on
// the plan shows the actual guest names next to the note so the mismatch is visible.
export const RULES: Rule[] = [
  { kind: "together", guests: ["g-21", "g-22"], note: "Couple" },
  { kind: "together", guests: ["g-32", "g-33"], note: "Siblings, under 10" },
  { kind: "apart", guests: ["g-29", "g-30"], note: "Brothers Sean and Ryan Doyle are not speaking" },
  { kind: "apart", guests: ["g-12", "g-34"], note: "Ask the couple: old family dispute" },
  {
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
  },
];

export const PARTY_COLORS: Record<string, string> = {
  Couple: "#be185d",
  "Bride's family": "#0f766e",
  "Groom's family": "#1d4ed8",
  "University friends": "#7e22ce",
  "Work friends": "#b45309",
  "Groom's football club": "#15803d",
  "Plus-ones": "#475569",
};

export const PARTIES: string[] = Array.from(new Set(GUESTS.map((g) => g.party)));

export const DIETS: string[] = [
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Gluten free",
  "Halal",
  "Nut allergy",
  "Soft food",
  "Children's menu",
];

export const DIET_NOTES: Record<string, string> = {
  "Nut allergy": "Allergy: tell the kitchen",
  "Soft food": "Texture-modified dish",
  "Children's menu": "Under 10s",
};

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Awaiting reply",
  no: "Declined",
};
```

```ts lib/plan.ts
import { FIXTURES, GUESTS, RULES, TABLES, type Fixture, type Rule, type Table } from "./data";

export type Seats = Record<string, (string | null)[]>;
export type Location = { tableId: string; index: number };

export const GUEST_BY_ID = new Map(GUESTS.map((g) => [g.id, g]));
export const TABLE_BY_ID = new Map(TABLES.map((t) => [t.id, t]));

export const SEAT_R = 0.4;
export const LONG_PITCH = 1;
export const LONG_H = 1.2;
export const NEAR_DOOR_MAX_M = 4;
export const BAND_MIN_M = 6;

const roundRadius = (seats: number) => (seats >= 8 ? 1 : 0.85);

export type Rect = { x: number; y: number; w: number; h: number };
export type Geometry = {
  box: Rect;
  body: Rect;
  seats: { x: number; y: number }[];
  center: { x: number; y: number };
};

/** All values in metres. */
export function tableGeometry(t: Table): Geometry {
  if (t.shape === "round") {
    const r = roundRadius(t.seats);
    const orbit = r + 0.5;
    const ext = orbit + SEAT_R;
    const seats = Array.from({ length: t.seats }, (_, i) => {
      const a = (i / t.seats) * Math.PI * 2 - Math.PI / 2;
      return { x: t.x + Math.cos(a) * orbit, y: t.y + Math.sin(a) * orbit };
    });
    return {
      box: { x: t.x - ext, y: t.y - ext, w: ext * 2, h: ext * 2 },
      body: { x: t.x - r, y: t.y - r, w: r * 2, h: r * 2 },
      seats,
      center: { x: t.x, y: t.y },
    };
  }
  const w = t.seats * LONG_PITCH;
  const top = t.y - 0.5 - SEAT_R;
  const seats = Array.from({ length: t.seats }, (_, i) => ({
    x: t.x + (i + 0.5) * LONG_PITCH,
    y: t.y - 0.5,
  }));
  return {
    box: { x: t.x, y: top, w, h: t.y + LONG_H - top },
    body: { x: t.x, y: t.y, w, h: LONG_H },
    seats,
    center: { x: t.x + w / 2, y: t.y + LONG_H / 2 },
  };
}

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0].charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}

export function initialSeats(): Seats {
  const seats: Seats = {};
  for (const t of TABLES) seats[t.id] = Array.from({ length: t.seats }, () => null);
  for (const g of GUESTS) {
    if (!g.table || !seats[g.table]) continue;
    const row = seats[g.table];
    const i = row.indexOf(null);
    if (i >= 0) row[i] = g.id;
  }
  return seats;
}

function cloneSeats(seats: Seats): Seats {
  const next: Seats = {};
  for (const k of Object.keys(seats)) next[k] = seats[k].slice();
  return next;
}

export function buildLocations(seats: Seats): Map<string, Location> {
  const m = new Map<string, Location>();
  for (const tableId of Object.keys(seats)) {
    seats[tableId].forEach((gid, index) => {
      if (gid) m.set(gid, { tableId, index });
    });
  }
  return m;
}

export type PlaceResult = { seats: Seats; ok: boolean; message: string };

export function applyPlace(seats: Seats, guestId: string, tableId: string, index?: number): PlaceResult {
  const g = GUEST_BY_ID.get(guestId);
  const t = TABLE_BY_ID.get(tableId);
  if (!g || !t) return { seats, ok: false, message: "That guest or table does not exist" };
  const next = cloneSeats(seats);
  const row = next[tableId];
  const from = buildLocations(next).get(guestId) ?? null;
  let target = index;
  if (target === undefined) {
    if (from && from.tableId === tableId) {
      return { seats, ok: false, message: `${g.name} is already at ${t.name}` };
    }
    target = row.indexOf(null);
    if (target < 0) return { seats, ok: false, message: `${t.name} is full` };
  }
  if (target < 0 || target >= row.length) return { seats, ok: false, message: "No such seat" };
  const occupantId = row[target];
  if (occupantId === guestId) return { seats, ok: false, message: `${g.name} already sits there` };
  if (from) next[from.tableId][from.index] = null;
  row[target] = guestId;
  let message: string;
  if (occupantId) {
    const o = GUEST_BY_ID.get(occupantId)?.name ?? "The other guest";
    if (from) {
      next[from.tableId][from.index] = occupantId;
      message = `Swapped ${g.name} and ${o}`;
    } else {
      message = `${g.name} took seat ${target + 1} at ${t.name}; ${o} is now unseated`;
    }
  } else if (from) {
    message = `Moved ${g.name} to ${t.name}, seat ${target + 1}`;
  } else {
    message = `Seated ${g.name} at ${t.name}, seat ${target + 1}`;
  }
  return { seats: next, ok: true, message };
}

export function applyUnseat(seats: Seats, guestId: string): PlaceResult {
  const g = GUEST_BY_ID.get(guestId);
  const from = buildLocations(seats).get(guestId);
  if (!g || !from) return { seats, ok: false, message: "That guest is not seated" };
  const next = cloneSeats(seats);
  next[from.tableId][from.index] = null;
  const t = TABLE_BY_ID.get(from.tableId);
  return { seats: next, ok: true, message: `Unseated ${g.name}${t ? ` from ${t.name}` : ""}` };
}

/* ---------- rules ---------- */

export type RuleStatus = "ok" | "broken" | "open";
export type RuleResult = {
  index: number;
  rule: Rule;
  status: RuleStatus;
  title: string;
  guestIds: string[];
  tableIds: string[];
  message: string;
};

const fmtM = (n: number) => `${n.toFixed(1)} m`;
const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);
const fixtureCenter = (f: Fixture) => ({ x: f.x + f.w / 2, y: f.y + f.h / 2 });
const guestName = (id: string) => GUEST_BY_ID.get(id)?.name ?? id;
const tableName = (id: string) => TABLE_BY_ID.get(id)?.name ?? id;

function nearInfo(tableId: string) {
  const t = TABLE_BY_ID.get(tableId);
  const door = FIXTURES.find((f) => f.kind === "door");
  const stage = FIXTURES.find((f) => f.kind === "stage");
  if (!t) return { door: 0, band: Infinity, ok: false };
  const c = tableGeometry(t).center;
  const dd = door ? dist(c, fixtureCenter(door)) : 0;
  const db = stage ? dist(c, fixtureCenter(stage)) : Infinity;
  return { door: dd, band: db, ok: dd <= NEAR_DOOR_MAX_M && db >= BAND_MIN_M };
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export function evaluateRules(seats: Seats): RuleResult[] {
  const loc = buildLocations(seats);
  const freeAt = (tableId: string) => (seats[tableId] ?? []).filter((x) => x === null).length;
  return RULES.map((rule, index): RuleResult => {
    const ids = rule.guests;
    const names = ids.map(guestName);
    const base = { index, rule, guestIds: ids };
    if (rule.kind === "together") {
      const unseated = ids.filter((id) => !loc.has(id));
      if (unseated.length === 0) {
        const tables = Array.from(new Set(ids.map((id) => loc.get(id)!.tableId)));
        if (tables.length === 1) {
          return { ...base, title: "Keep together", status: "ok", tableIds: tables, message: `${joinNames(names)} are both at ${tableName(tables[0])}.` };
        }
        const where = ids.map((id) => `${guestName(id)} at ${tableName(loc.get(id)!.tableId)}`);
        return { ...base, title: "Keep together", status: "broken", tableIds: tables, message: `Split up: ${joinNames(where)}.` };
      }
      if (unseated.length === ids.length) {
        return { ...base, title: "Keep together", status: "open", tableIds: [], message: "Neither is seated yet." };
      }
      const seatedId = ids.find((id) => loc.has(id))!;
      const tid = loc.get(seatedId)!.tableId;
      const free = freeAt(tid);
      return {
        ...base,
        title: "Keep together",
        status: "open",
        tableIds: [],
        message: `${guestName(seatedId)} is at ${tableName(tid)}; seat ${joinNames(unseated.map(guestName))} there too (${free === 0 ? "the table is full" : `${free} free`}).`,
      };
    }
    if (rule.kind === "apart") {
      const locs = ids.map((id) => loc.get(id));
      if (locs.some((l) => !l)) {
        return { ...base, title: "Keep apart", status: "open", tableIds: [], message: "Not both seated yet, so nothing to check." };
      }
      const tables = locs.map((l) => l!.tableId);
      if (new Set(tables).size < tables.length) {
        return { ...base, title: "Keep apart", status: "broken", tableIds: [tables[0]], message: `${joinNames(names)} are both at ${tableName(tables[0])}.` };
      }
      return { ...base, title: "Keep apart", status: "ok", tableIds: [], message: `At different tables (${joinNames(tables.map(tableName))}).` };
    }
    // near: the garden doors and away from the band
    const workable = TABLES.filter((t) => nearInfo(t.id).ok).map((t) => t.name);
    const hint = workable.length ? ` Tables that work: ${workable.join(", ")}.` : "";
    const l = loc.get(ids[0]);
    if (!l) {
      return { ...base, title: "Seat near", status: "open", tableIds: [], message: `Not seated yet.${hint}` };
    }
    const info = nearInfo(l.tableId);
    const tn = tableName(l.tableId);
    if (info.ok) {
      return {
        ...base,
        title: "Seat near",
        status: "ok",
        tableIds: [],
        message: `${tn} is ${fmtM(info.door)} from the garden doors and ${fmtM(info.band)} from the band.`,
      };
    }
    const problems: string[] = [];
    if (info.door > NEAR_DOOR_MAX_M) problems.push(`${fmtM(info.door)} from the garden doors (aim for ${NEAR_DOOR_MAX_M} m or less)`);
    if (info.band < BAND_MIN_M) problems.push(`${fmtM(info.band)} from the band (aim for ${BAND_MIN_M} m or more)`);
    return {
      ...base,
      title: "Seat near",
      status: "broken",
      tableIds: [l.tableId],
      message: `${tn} is ${problems.join(" and ")}.${hint}`,
    };
  });
}

/* ---------- counts ---------- */

export type Counts = {
  attending: number;
  seatedAttending: number;
  unseatedAttending: number;
  seatedTotal: number;
  capacity: number;
  free: number;
  awaiting: number;
  awaitingUnseated: number;
  perTable: Record<string, { filled: number; total: number }>;
};

export function computeCounts(seats: Seats): Counts {
  const loc = buildLocations(seats);
  const perTable: Counts["perTable"] = {};
  let capacity = 0;
  let seatedTotal = 0;
  for (const t of TABLES) {
    const filled = (seats[t.id] ?? []).filter(Boolean).length;
    perTable[t.id] = { filled, total: t.seats };
    capacity += t.seats;
    seatedTotal += filled;
  }
  const yes = GUESTS.filter((g) => g.rsvp === "yes");
  const awaiting = GUESTS.filter((g) => g.rsvp === "maybe" || g.rsvp === "pending");
  return {
    attending: yes.length,
    seatedAttending: yes.filter((g) => loc.has(g.id)).length,
    unseatedAttending: yes.filter((g) => !loc.has(g.id)).length,
    seatedTotal,
    capacity,
    free: capacity - seatedTotal,
    awaiting: awaiting.length,
    awaitingUnseated: awaiting.filter((g) => !loc.has(g.id)).length,
    perTable,
  };
}
```

```tsx components/PlanProvider.tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import {
  applyPlace,
  applyUnseat,
  buildLocations,
  computeCounts,
  evaluateRules,
  initialSeats,
  type Counts,
  type Location,
  type RuleResult,
  type Seats,
} from "@/lib/plan";

type Notice = { id: number; text: string; tone: "info" | "warn" };
type State = { seats: Seats; history: Seats[]; notice: Notice | null };

export type PlanApi = {
  seats: Seats;
  locations: Map<string, Location>;
  rules: RuleResult[];
  brokenByTable: Record<string, RuleResult[]>;
  flaggedGuests: Set<string>;
  counts: Counts;
  place: (guestId: string, tableId: string, index?: number) => boolean;
  unseat: (guestId: string) => void;
  undo: () => void;
  canUndo: boolean;
  notice: Notice | null;
  dismissNotice: () => void;
};

const PlanContext = createContext<PlanApi | null>(null);

export function usePlan(): PlanApi {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

let noticeCounter = 0;
const makeNotice = (text: string, tone: Notice["tone"]): Notice => ({ id: ++noticeCounter, text, tone });

export function PlanProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => ({ seats: initialSeats(), history: [], notice: null }));
  const ref = useRef(state);

  const commit = useCallback((fn: (s: State) => State) => {
    const next = fn(ref.current);
    ref.current = next;
    setState(next);
  }, []);

  const place = useCallback(
    (guestId: string, tableId: string, index?: number) => {
      const r = applyPlace(ref.current.seats, guestId, tableId, index);
      if (!r.ok) {
        commit((s) => ({ ...s, notice: makeNotice(r.message, "warn") }));
        return false;
      }
      commit((s) => ({
        seats: r.seats,
        history: [...s.history.slice(-29), s.seats],
        notice: makeNotice(r.message, "info"),
      }));
      return true;
    },
    [commit],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const r = applyUnseat(ref.current.seats, guestId);
      if (!r.ok) {
        commit((s) => ({ ...s, notice: makeNotice(r.message, "warn") }));
        return;
      }
      commit((s) => ({
        seats: r.seats,
        history: [...s.history.slice(-29), s.seats],
        notice: makeNotice(r.message, "info"),
      }));
    },
    [commit],
  );

  const undo = useCallback(() => {
    commit((s) => {
      if (s.history.length === 0) return s;
      const previous = s.history[s.history.length - 1];
      return { seats: previous, history: s.history.slice(0, -1), notice: makeNotice("Undid the last change", "info") };
    });
  }, [commit]);

  const dismissNotice = useCallback(() => commit((s) => ({ ...s, notice: null })), [commit]);

  const noticeId = state.notice?.id;
  useEffect(() => {
    if (noticeId === undefined) return;
    const timer = window.setTimeout(() => {
      commit((s) => (s.notice && s.notice.id === noticeId ? { ...s, notice: null } : s));
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [noticeId, commit]);

  const derived = useMemo(() => {
    const locations = buildLocations(state.seats);
    const rules = evaluateRules(state.seats);
    const brokenByTable: Record<string, RuleResult[]> = {};
    const flaggedGuests = new Set<string>();
    for (const r of rules) {
      if (r.status !== "broken") continue;
      for (const t of r.tableIds) {
        (brokenByTable[t] ??= []).push(r);
      }
      for (const g of r.guestIds) flaggedGuests.add(g);
    }
    return { locations, rules, brokenByTable, flaggedGuests, counts: computeCounts(state.seats) };
  }, [state.seats]);

  const value = useMemo<PlanApi>(
    () => ({
      seats: state.seats,
      ...derived,
      place,
      unseat,
      undo,
      canUndo: state.history.length > 0,
      notice: state.notice,
      dismissNotice,
    }),
    [state.seats, state.history.length, state.notice, derived, place, unseat, undo, dismissNotice],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
```

```tsx components/AppShell.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutGrid, MapPin, TriangleAlert, Undo2, Users, X, Armchair } from "lucide-react";
import type { ReactNode } from "react";

import { APP, EVENT, PLANNER } from "@/lib/data";
import { usePlan } from "./PlanProvider";

const LINKS = [
  { href: "/", label: "Plan", icon: LayoutGrid },
  { href: "/guests", label: "Guests", icon: Users },
];

const dateLabel = new Date(`${EVENT.date}T12:00:00Z`).toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const plan = usePlan();
  const { notice } = plan;

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Skip to content
      </a>
      <header className="bg-stone-900 text-stone-100 print:hidden">
        <div className="mx-auto flex w-full max-w-[1500px] items-center gap-3 px-4 py-2.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2 rounded-lg pr-2 text-base font-semibold tracking-tight">
            <span className="grid size-8 place-items-center rounded-lg bg-amber-400 text-stone-900">
              <Armchair className="size-5" aria-hidden="true" />
            </span>
            {APP.name}
          </Link>
          <nav aria-label="Primary" className="ml-1 flex gap-1">
            {LINKS.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors ${
                    active ? "bg-stone-100 text-stone-900" : "text-stone-300 hover:bg-stone-800 hover:text-white"
                  }`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2.5">
            <span className="hidden text-sm text-stone-300 sm:inline">{PLANNER.name}</span>
            <span
              className="grid size-9 place-items-center rounded-full bg-stone-700 text-xs font-semibold text-stone-100"
              aria-hidden="true"
            >
              HB
            </span>
          </div>
        </div>
      </header>

      <div className="border-b border-stone-200 bg-white print:border-0">
        <div className="mx-auto flex w-full max-w-[1500px] flex-wrap items-center gap-x-5 gap-y-1 px-4 py-2.5 text-sm sm:px-6">
          <p className="font-semibold text-stone-900">{EVENT.name}</p>
          <p className="flex items-center gap-1.5 text-stone-600">
            <CalendarDays className="size-4 text-stone-400" aria-hidden="true" />
            <time dateTime={EVENT.date}>{dateLabel}</time>
          </p>
          <p className="flex items-center gap-1.5 text-stone-600">
            <MapPin className="size-4 text-stone-400" aria-hidden="true" />
            {EVENT.venue}
          </p>
        </div>
      </div>

      <main id="main" className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-5 sm:px-6">
        {children}
      </main>

      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 print:hidden"
      >
        {notice && (
          <div
            className={`pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl px-4 py-3 text-sm shadow-xl ${
              notice.tone === "warn" ? "bg-red-700 text-white" : "bg-stone-900 text-white"
            }`}
          >
            {notice.tone === "warn" && <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />}
            <span className="min-w-0 flex-1">{notice.text}</span>
            {notice.tone === "info" && plan.canUndo && (
              <button
                type="button"
                onClick={plan.undo}
                className="flex min-h-9 items-center gap-1 rounded-lg px-2 font-medium text-amber-300 hover:bg-white/10"
              >
                <Undo2 className="size-4" aria-hidden="true" />
                Undo
              </button>
            )}
            <button
              type="button"
              onClick={plan.dismissNotice}
              aria-label="Dismiss message"
              className="grid size-9 place-items-center rounded-lg hover:bg-white/10"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

```tsx components/GuestBits.tsx
"use client";

import { Utensils } from "lucide-react";

import { PARTY_COLORS, RSVP_LABEL, TABLES, type Guest, type Rsvp } from "@/lib/data";
import { GUEST_BY_ID } from "@/lib/plan";
import { usePlan } from "./PlanProvider";

export function PartyDot({ party }: { party: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: PARTY_COLORS[party] ?? "#57534e" }}
    />
  );
}

export function DietBadge({ diet }: { diet: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900 ring-1 ring-amber-200">
      <Utensils className="size-3" aria-hidden="true" />
      {diet}
    </span>
  );
}

const RSVP_CLASS: Record<Rsvp, string> = {
  yes: "bg-emerald-100 text-emerald-900 ring-emerald-200",
  maybe: "bg-amber-100 text-amber-900 ring-amber-200",
  pending: "bg-stone-200 text-stone-800 ring-stone-300",
  no: "bg-rose-100 text-rose-900 ring-rose-200",
};

export function RsvpBadge({ rsvp }: { rsvp: Rsvp }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${RSVP_CLASS[rsvp]}`}>
      {RSVP_LABEL[rsvp]}
    </span>
  );
}

export function SeatSelect({ guestId, className = "" }: { guestId: string; className?: string }) {
  const plan = usePlan();
  const guest = GUEST_BY_ID.get(guestId);
  if (!guest) return null;
  if (guest.rsvp === "no") return <span className="text-sm text-stone-500">Declined</span>;
  const loc = plan.locations.get(guestId);
  return (
    <select
      aria-label={`Table for ${guest.name}`}
      value={loc?.tableId ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        if (!v) plan.unseat(guestId);
        else plan.place(guestId, v);
      }}
      className={`min-h-10 rounded-lg border border-stone-300 bg-white px-2 text-sm text-stone-800 ${className}`}
    >
      <option value="">{loc ? "Unseat" : "Seat at…"}</option>
      {TABLES.map((t) => {
        const free = plan.seats[t.id].filter((x) => x === null).length;
        const label = loc && loc.tableId === t.id ? `${t.name} · seat ${loc.index + 1}` : `${t.name} · ${free} free`;
        return (
          <option key={t.id} value={t.id} disabled={free === 0 && loc?.tableId !== t.id}>
            {label}
          </option>
        );
      })}
    </select>
  );
}

/** A guest as a row: tap the name to pick them up, or use the table menu. */
export function GuestLine({
  guest,
  held,
  onHold,
  onDragStart,
  onDragEnd,
}: {
  guest: Guest;
  held: boolean;
  onHold: (id: string) => void;
  onDragStart?: (id: string) => void;
  onDragEnd?: () => void;
}) {
  const plan = usePlan();
  const flagged = plan.flaggedGuests.has(guest.id);
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        draggable
        aria-pressed={held}
        onClick={() => onHold(guest.id)}
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", guest.id);
          e.dataTransfer.effectAllowed = "move";
          onDragStart?.(guest.id);
        }}
        onDragEnd={() => onDragEnd?.()}
        className={`min-h-11 min-w-0 flex-1 cursor-grab rounded-lg px-2 py-1 text-left transition-colors active:cursor-grabbing ${
          held ? "bg-sky-100 ring-2 ring-sky-500" : "hover:bg-stone-100"
        }`}
      >
        <span className="flex items-center gap-1.5">
          <PartyDot party={guest.party} />
          <span className="truncate text-sm font-medium text-stone-900">{guest.name}</span>
          {flagged && <span className="rounded bg-red-100 px-1 text-[10px] font-semibold uppercase text-red-800">Rule</span>}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-stone-500">
          {guest.party}
          {guest.rsvp !== "yes" && <RsvpBadge rsvp={guest.rsvp} />}
          {guest.diet && <DietBadge diet={guest.diet} />}
        </span>
      </button>
      <SeatSelect guestId={guest.id} className="w-[7.5rem] shrink-0" />
    </div>
  );
}
```

```tsx components/RoomPlan.tsx
"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Music, TriangleAlert, Wine } from "lucide-react";

import { FIXTURES, PARTY_COLORS, ROOM, TABLES, type Fixture } from "@/lib/data";
import { GUEST_BY_ID, initials, tableGeometry } from "@/lib/plan";
import { usePlan } from "./PlanProvider";

const MIN_SCALE = 30;

type Props = {
  selectedId: string | null;
  heldId: string | null;
  dragId: string | null;
  onTable: (tableId: string) => void;
  onSeat: (tableId: string, index: number) => void;
  onDragStart: (guestId: string) => void;
  onDragEnd: () => void;
  onDropOn: (tableId: string, index: number | undefined, guestId: string) => void;
};

function FixtureBlock({ f, s }: { f: Fixture; s: number }) {
  const style: CSSProperties = { left: f.x * s, top: f.y * s, width: f.w * s, height: f.h * s, fontSize: Math.max(10, s * 0.3) };
  const base = "absolute flex select-none items-center justify-center gap-1.5 text-center font-medium";
  if (f.kind === "stage") {
    return (
      <div role="img" aria-label={f.label} className={`${base} rounded-md border border-stone-900 bg-stone-800 text-stone-100`} style={style}>
        <Music className="size-4" aria-hidden="true" />
        {f.label}
      </div>
    );
  }
  if (f.kind === "dancefloor") {
    return (
      <div
        role="img"
        aria-label={f.label}
        className={`${base} rounded-md border border-amber-300 text-amber-900`}
        style={{
          ...style,
          backgroundColor: "#fef3c7",
          backgroundImage: "repeating-conic-gradient(#fde68a 0% 25%, transparent 0% 50%)",
          backgroundSize: `${s * 0.7}px ${s * 0.7}px`,
        }}
      >
        <span className="rounded bg-amber-50/90 px-2 py-0.5">{f.label}</span>
      </div>
    );
  }
  if (f.kind === "bar") {
    return (
      <div role="img" aria-label={f.label} className={`${base} flex-col rounded-md border border-stone-500 bg-stone-300 text-stone-800`} style={style}>
        <Wine className="size-4" aria-hidden="true" />
        {f.label}
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={f.label}
      className={`${base} rounded-sm border border-sky-400 bg-sky-200 text-sky-900 [writing-mode:vertical-rl]`}
      style={{ ...style, fontSize: Math.max(9, s * 0.27) }}
    >
      {f.label}
    </div>
  );
}

export function RoomPlan({ selectedId, heldId, dragId, onTable, onSeat, onDragStart, onDragEnd, onDropOn }: Props) {
  const plan = usePlan();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(960);
  const [over, setOver] = useState<string | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const s = Math.max(width / ROOM.width, MIN_SCALE);
  const font = Math.max(10, s * 0.3);

  return (
    <div ref={wrapRef} className="overflow-x-auto rounded-xl border border-stone-300 bg-stone-100">
      <div
        className="relative"
        style={{
          width: ROOM.width * s,
          height: ROOM.depth * s,
          backgroundColor: "#f3eee3",
          backgroundImage:
            "linear-gradient(to right, rgba(120,113,108,0.13) 1px, transparent 1px), linear-gradient(to bottom, rgba(120,113,108,0.13) 1px, transparent 1px)",
          backgroundSize: `${s}px ${s}px`,
        }}
      >
        {FIXTURES.map((f) => (
          <FixtureBlock key={f.id} f={f} s={s} />
        ))}

        {TABLES.map((t) => {
          const geo = tableGeometry(t);
          const row = plan.seats[t.id];
          const filled = row.filter(Boolean).length;
          const broken = plan.brokenByTable[t.id] ?? [];
          const selected = selectedId === t.id;
          const round = t.shape === "round";
          const label = `${t.name}, ${filled} of ${t.seats} seats filled${broken.length ? `, ${broken.length} rule${broken.length > 1 ? "s" : ""} broken` : ""}`;
          return (
            <div
              key={t.id}
              role="group"
              aria-label={label}
              className={`absolute transition-colors ${round ? "rounded-full" : "rounded-2xl"} ${
                over === t.id ? "bg-sky-300/50 ring-2 ring-sky-500" : ""
              }`}
              style={{
                left: geo.box.x * s,
                top: geo.box.y * s,
                width: geo.box.w * s,
                height: geo.box.h * s,
                transform: t.rotation ? `rotate(${t.rotation}deg)` : undefined,
              }}
              onDragOver={(e) => {
                if (!dragId) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setOver(t.id);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setOver(null);
                const id = dragId ?? e.dataTransfer.getData("text/plain");
                if (id) onDropOn(t.id, undefined, id);
              }}
            >
              <button
                type="button"
                onClick={() => onTable(t.id)}
                aria-pressed={selected}
                aria-label={`${label}. ${heldId ? "Place the picked-up guest here" : "Show guests"}`}
                className={`absolute flex items-center justify-center border-2 bg-white text-center shadow-sm transition-shadow hover:shadow-md ${
                  round ? "flex-col rounded-full" : "flex-row gap-3 rounded-lg"
                } ${
                  broken.length
                    ? "border-red-500"
                    : selected
                      ? "border-sky-600"
                      : "border-stone-300"
                } ${selected ? "ring-4 ring-sky-500/40" : ""}`}
                style={{
                  left: (geo.body.x - geo.box.x) * s,
                  top: (geo.body.y - geo.box.y) * s,
                  width: geo.body.w * s,
                  height: geo.body.h * s,
                }}
              >
                <span className="font-semibold leading-tight text-stone-900" style={{ fontSize: font }}>
                  {t.name}
                </span>
                <span
                  className={`tabular-nums leading-tight ${filled === t.seats ? "font-semibold text-emerald-700" : "text-stone-500"}`}
                  style={{ fontSize: font * 0.9 }}
                >
                  {filled}/{t.seats}
                </span>
                {broken.length > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-red-600 text-white shadow"
                    style={{ transform: round ? "translate(-0.35rem, 0.35rem)" : undefined }}
                  >
                    <TriangleAlert className="size-3" />
                  </span>
                )}
              </button>

              {geo.seats.map((p, i) => {
                const gid = row[i];
                const g = gid ? GUEST_BY_ID.get(gid) : undefined;
                const key = `${t.id}:${i}`;
                const size = 0.8 * s;
                const held = !!g && g.id === heldId;
                const flagged = !!g && plan.flaggedGuests.has(g.id);
                const seatLabel = g
                  ? `${t.name}, seat ${i + 1}: ${g.name}${g.diet ? `, ${g.diet}` : ""}${flagged ? ", breaks a rule" : ""}`
                  : `${t.name}, seat ${i + 1}: empty`;
                return (
                  <button
                    key={key}
                    type="button"
                    draggable={!!g}
                    title={g ? `${g.name}${g.diet ? ` · ${g.diet}` : ""}` : `Empty seat ${i + 1}`}
                    aria-label={seatLabel}
                    aria-pressed={held}
                    onClick={() => onSeat(t.id, i)}
                    onDragStart={(e) => {
                      if (!g) return;
                      e.dataTransfer.setData("text/plain", g.id);
                      e.dataTransfer.effectAllowed = "move";
                      onDragStart(g.id);
                    }}
                    onDragEnd={onDragEnd}
                    onDragOver={(e) => {
                      if (!dragId) return;
                      e.preventDefault();
                      e.stopPropagation();
                      e.dataTransfer.dropEffect = "move";
                      setOver(key);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOver(null);
                      const id = dragId ?? e.dataTransfer.getData("text/plain");
                      if (id) onDropOn(t.id, i, id);
                    }}
                    className={`absolute grid place-items-center rounded-full border-2 font-semibold leading-none transition-transform ${
                      g
                        ? "cursor-grab border-white text-white shadow active:cursor-grabbing"
                        : heldId
                          ? "border-sky-500 bg-sky-50 text-sky-700"
                          : "border-dashed border-stone-400 bg-white/80 text-stone-400"
                    } ${held ? "z-10 scale-110 ring-4 ring-sky-500" : ""} ${
                      flagged && !held ? "ring-2 ring-red-500 ring-offset-1" : ""
                    } ${over === key ? "scale-125 ring-4 ring-sky-500" : ""} ${dragId && dragId === g?.id ? "opacity-40" : ""}`}
                    style={{
                      left: (p.x - geo.box.x) * s - size / 2,
                      top: (p.y - geo.box.y) * s - size / 2,
                      width: size,
                      height: size,
                      fontSize: Math.max(9, s * 0.27),
                      backgroundColor: g ? (PARTY_COLORS[g.party] ?? "#57534e") : undefined,
                    }}
                  >
                    {g ? initials(g.name) : ""}
                    {g?.diet && (
                      <span
                        aria-hidden="true"
                        className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-white bg-amber-400"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

```tsx components/PlanPanels.tsx
"use client";

import { useState } from "react";
import { CircleCheck, Clock, TriangleAlert, X } from "lucide-react";

import { GUESTS, PARTIES, TABLES } from "@/lib/data";
import { GUEST_BY_ID, TABLE_BY_ID } from "@/lib/plan";
import { DietBadge, GuestLine, PartyDot } from "./GuestBits";
import { usePlan } from "./PlanProvider";

const card = "rounded-xl border border-stone-200 bg-white shadow-sm";

export function TablePanel({
  tableId,
  heldId,
  onHold,
  onClose,
  onDragStart,
  onDragEnd,
}: {
  tableId: string;
  heldId: string | null;
  onHold: (id: string) => void;
  onClose: () => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}) {
  const plan = usePlan();
  const table = TABLE_BY_ID.get(tableId);
  if (!table) return null;
  const row = plan.seats[tableId];
  const filled = row.filter(Boolean).length;
  const broken = plan.brokenByTable[tableId] ?? [];
  const diets = new Map<string, number>();
  for (const gid of row) {
    const d = gid ? GUEST_BY_ID.get(gid)?.diet : null;
    if (d) diets.set(d, (diets.get(d) ?? 0) + 1);
  }
  const standard = filled - Array.from(diets.values()).reduce((a, b) => a + b, 0);
  const heldName = heldId ? GUEST_BY_ID.get(heldId)?.name : null;

  return (
    <section aria-labelledby="table-panel-title" className={card}>
      <div className="flex items-start justify-between gap-2 border-b border-stone-200 px-4 py-3">
        <div>
          <h2 id="table-panel-title" className="text-base font-semibold text-stone-900">
            {table.name}
          </h2>
          <p className="text-sm text-stone-600">
            <span className="tabular-nums">
              {filled} of {table.seats}
            </span>{" "}
            seats filled
            {table.seats - filled > 0 && <span> · {table.seats - filled} free</span>}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close table details"
          className="grid size-10 place-items-center rounded-lg text-stone-500 hover:bg-stone-100"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      {broken.length > 0 && (
        <ul className="space-y-1.5 border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {broken.map((r) => (
            <li key={r.index} className="flex gap-2">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                <span className="font-semibold">{r.title}.</span> {r.message}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="border-b border-stone-200 px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Dietary needs at this table</h3>
        {filled === 0 ? (
          <p className="mt-1 text-sm text-stone-500">Nobody seated yet.</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Array.from(diets.entries()).map(([d, n]) => (
              <span key={d} className="inline-flex items-center gap-1">
                <DietBadge diet={d} />
                <span className="text-xs tabular-nums text-stone-600">×{n}</span>
              </span>
            ))}
            <span className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700 ring-1 ring-stone-200">
              Standard menu ×{standard}
            </span>
          </div>
        )}
      </div>

      <ol className="divide-y divide-stone-100 px-2 py-1">
        {row.map((gid, i) => {
          const g = gid ? GUEST_BY_ID.get(gid) : undefined;
          return (
            <li key={i} className="flex items-center gap-1 py-1">
              <span className="w-6 shrink-0 text-center text-xs tabular-nums text-stone-400" aria-hidden="true">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                {g ? (
                  <GuestLine guest={g} held={heldId === g.id} onHold={onHold} onDragStart={onDragStart} onDragEnd={onDragEnd} />
                ) : (
                  <div className="flex min-h-11 items-center justify-between gap-2 rounded-lg border border-dashed border-stone-300 px-3 text-sm text-stone-500">
                    <span>Seat {i + 1} is empty</span>
                    {heldId && heldName && (
                      <button
                        type="button"
                        onClick={() => plan.place(heldId, tableId, i)}
                        className="min-h-9 rounded-lg bg-sky-600 px-3 text-sm font-medium text-white hover:bg-sky-700"
                      >
                        Seat {heldName.split(" ")[0]} here
                      </button>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function UnseatedPanel({
  heldId,
  dragId,
  onHold,
  onDragStart,
  onDragEnd,
  onDropUnseat,
}: {
  heldId: string | null;
  dragId: string | null;
  onHold: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDropUnseat: (guestId: string) => void;
}) {
  const plan = usePlan();
  const [over, setOver] = useState(false);
  const rank = (p: string) => PARTIES.indexOf(p);
  const sorted = (list: typeof GUESTS) =>
    list.slice().sort((a, b) => rank(a.party) - rank(b.party) || a.name.localeCompare(b.name));
  const unseated = sorted(GUESTS.filter((g) => g.rsvp === "yes" && !plan.locations.has(g.id)));
  const awaiting = sorted(GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !plan.locations.has(g.id)));

  return (
    <section
      aria-labelledby="unseated-title"
      className={`${card} ${over ? "ring-2 ring-sky-500" : ""}`}
      onDragOver={(e) => {
        if (!dragId || !plan.locations.has(dragId)) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = dragId ?? e.dataTransfer.getData("text/plain");
        if (id) onDropUnseat(id);
      }}
    >
      <div className="flex items-center justify-between gap-2 border-b border-stone-200 px-4 py-3">
        <h2 id="unseated-title" className="text-base font-semibold text-stone-900">
          Still to seat
        </h2>
        <span className="rounded-full bg-stone-900 px-2.5 py-0.5 text-sm font-semibold tabular-nums text-white">{unseated.length}</span>
      </div>
      <div className="px-2 py-2">
        {unseated.length === 0 ? (
          <p className="flex items-center gap-2 px-2 py-3 text-sm text-emerald-800">
            <CircleCheck className="size-4" aria-hidden="true" />
            Everyone attending has a seat.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {unseated.map((g) => (
              <li key={g.id}>
                <GuestLine guest={g} held={heldId === g.id} onHold={onHold} onDragStart={onDragStart} onDragEnd={onDragEnd} />
              </li>
            ))}
          </ul>
        )}
        <p className="px-2 pt-2 text-xs text-stone-500">Drop a seated guest here to unseat them.</p>
      </div>
      {awaiting.length > 0 && (
        <div className="border-t border-stone-200 px-2 py-2">
          <h3 className="px-2 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-stone-500">
            Not confirmed yet ({awaiting.length})
          </h3>
          <ul className="space-y-0.5">
            {awaiting.map((g) => (
              <li key={g.id}>
                <GuestLine guest={g} held={heldId === g.id} onHold={onHold} onDragStart={onDragStart} onDragEnd={onDragEnd} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export function RulesPanel({ onShowTable }: { onShowTable: (tableId: string) => void }) {
  const plan = usePlan();
  const order = { broken: 0, open: 1, ok: 2 } as const;
  const sorted = plan.rules.slice().sort((a, b) => order[a.status] - order[b.status] || a.index - b.index);
  const broken = plan.rules.filter((r) => r.status === "broken").length;
  const ok = plan.rules.filter((r) => r.status === "ok").length;
  const open = plan.rules.length - broken - ok;
  return (
    <section aria-labelledby="rules-title" className={card}>
      <div className="border-b border-stone-200 px-4 py-3">
        <h2 id="rules-title" className="text-base font-semibold text-stone-900">
          The couple's rules
        </h2>
        <p className="text-sm text-stone-600">
          <span className={broken ? "font-semibold text-red-700" : ""}>{broken} broken</span> · {ok} kept · {open} waiting on seating
        </p>
      </div>
      <ul className="divide-y divide-stone-100">
        {sorted.map((r) => {
          const Icon = r.status === "broken" ? TriangleAlert : r.status === "ok" ? CircleCheck : Clock;
          const tone =
            r.status === "broken" ? "text-red-700" : r.status === "ok" ? "text-emerald-700" : "text-stone-500";
          const statusText = r.status === "broken" ? "Broken" : r.status === "ok" ? "Kept" : "Waiting";
          return (
            <li key={r.index} className={`px-4 py-3 text-sm ${r.status === "broken" ? "bg-red-50" : ""}`}>
              <div className="flex items-start gap-2.5">
                <Icon className={`mt-0.5 size-4 shrink-0 ${tone}`} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-stone-900">
                    <span className={`mr-1.5 text-xs font-semibold uppercase ${tone}`}>{statusText}</span>
                    {r.title}: {r.guestIds.map((id) => GUEST_BY_ID.get(id)?.name ?? id).join(" and ")}
                  </p>
                  <p className="mt-0.5 text-stone-700">{r.message}</p>
                  <p className="mt-0.5 text-xs italic text-stone-500">“{r.rule.note}”</p>
                  {r.status === "broken" && r.tableIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {r.tableIds.map((tid) => (
                        <button
                          key={tid}
                          type="button"
                          onClick={() => onShowTable(tid)}
                          className="min-h-9 rounded-lg border border-red-300 bg-white px-3 text-xs font-medium text-red-800 hover:bg-red-100"
                        >
                          Show {TABLES.find((t) => t.id === tid)?.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export { PartyDot };
```

```tsx components/PlanView.tsx
"use client";

import { useEffect, useState } from "react";
import { Hand, TriangleAlert, Undo2, UserMinus, X } from "lucide-react";

import { PARTIES, PARTY_COLORS, TABLES } from "@/lib/data";
import { GUEST_BY_ID } from "@/lib/plan";
import { usePlan } from "./PlanProvider";
import { RoomPlan } from "./RoomPlan";
import { RulesPanel, TablePanel, UnseatedPanel } from "./PlanPanels";

function Stat({ label, value, sub, tone = "text-stone-900" }: { label: string; value: string | number; sub: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</p>
      <p className={`mt-0.5 text-3xl font-semibold tabular-nums ${tone}`}>{value}</p>
      <p className="text-xs text-stone-500">{sub}</p>
    </div>
  );
}

export default function PlanView() {
  const plan = usePlan();
  const [selectedId, setSelectedId] = useState<string | null>("t-1");
  const [heldId, setHeldId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHeldId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const { counts } = plan;
  const broken = plan.rules.filter((r) => r.status === "broken");
  const held = heldId ? GUEST_BY_ID.get(heldId) : undefined;
  const heldSeated = heldId ? plan.locations.has(heldId) : false;

  const toggleHold = (id: string) => setHeldId((cur) => (cur === id ? null : id));

  const handleSeat = (tableId: string, index: number) => {
    const occupant = plan.seats[tableId][index];
    setSelectedId(tableId);
    if (heldId) {
      if (occupant === heldId) {
        setHeldId(null);
        return;
      }
      if (plan.place(heldId, tableId, index)) setHeldId(null);
      return;
    }
    if (occupant) setHeldId(occupant);
  };

  const handleTable = (tableId: string) => {
    setSelectedId(tableId);
    if (heldId && plan.place(heldId, tableId)) setHeldId(null);
  };

  const handleDropOn = (tableId: string, index: number | undefined, guestId: string) => {
    setDragId(null);
    setSelectedId(tableId);
    plan.place(guestId, tableId, index);
    setHeldId(null);
  };

  const handleDropUnseat = (guestId: string) => {
    setDragId(null);
    if (plan.locations.has(guestId)) plan.unseat(guestId);
    setHeldId(null);
  };

  const seatedPct = Math.round((counts.seatedTotal / counts.capacity) * 100);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">Seating plan</h1>
          <p className="text-sm text-stone-600">Drag a guest onto a seat or table, or tap a guest and then tap where they go.</p>
        </div>
        <button
          type="button"
          onClick={plan.undo}
          disabled={!plan.canUndo}
          className="flex min-h-11 items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 text-sm font-medium text-stone-800 shadow-sm hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Undo2 className="size-4" aria-hidden="true" />
          Undo
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Seated" value={counts.seatedTotal} sub={`of ${counts.capacity} seats · ${seatedPct}% full`} />
        <Stat
          label="Still to seat"
          value={counts.unseatedAttending}
          sub={`attending without a seat${counts.awaitingUnseated ? ` · +${counts.awaitingUnseated} unconfirmed` : ""}`}
          tone={counts.unseatedAttending ? "text-amber-700" : "text-emerald-700"}
        />
        <Stat label="Free seats" value={counts.free} sub={`across ${TABLES.length} tables`} />
        <Stat
          label="Rules broken"
          value={broken.length}
          sub={`${plan.rules.length} rules from the couple`}
          tone={broken.length ? "text-red-700" : "text-emerald-700"}
        />
      </div>

      {broken.length > 0 && (
        <section aria-labelledby="broken-title" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <h2 id="broken-title" className="flex items-center gap-2 text-sm font-semibold text-red-900">
            <TriangleAlert className="size-4" aria-hidden="true" />
            {broken.length === 1 ? "1 rule needs attention" : `${broken.length} rules need attention`}
          </h2>
          <ul className="mt-1.5 space-y-1 text-sm text-red-900">
            {broken.map((r) => (
              <li key={r.index} className="flex flex-wrap items-center gap-x-2">
                <span>
                  <span className="font-semibold">{r.title}.</span> {r.message}
                </span>
                {r.tableIds[0] && (
                  <button
                    type="button"
                    onClick={() => setSelectedId(r.tableIds[0])}
                    className="min-h-9 rounded-md px-2 text-sm font-medium underline underline-offset-2 hover:bg-red-100"
                  >
                    Show table
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {held && (
        <div
          role="status"
          className="sticky top-2 z-30 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-sky-700 px-4 py-2.5 text-sm text-white shadow-lg"
        >
          <Hand className="size-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            Placing <strong>{held.name}</strong>. Tap an empty seat or a table
            {heldSeated ? "; tap a taken seat to swap" : ""}. Press Esc to cancel.
          </span>
          {heldSeated && (
            <button
              type="button"
              onClick={() => {
                plan.unseat(held.id);
                setHeldId(null);
              }}
              className="flex min-h-9 items-center gap-1.5 rounded-lg bg-white/15 px-3 font-medium hover:bg-white/25"
            >
              <UserMinus className="size-4" aria-hidden="true" />
              Unseat
            </button>
          )}
          <button
            type="button"
            onClick={() => setHeldId(null)}
            className="flex min-h-9 items-center gap-1.5 rounded-lg bg-white/15 px-3 font-medium hover:bg-white/25"
          >
            <X className="size-4" aria-hidden="true" />
            Cancel
          </button>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <section aria-label="Room plan" className="min-w-0 space-y-3">
          <RoomPlan
            selectedId={selectedId}
            heldId={heldId}
            dragId={dragId}
            onTable={handleTable}
            onSeat={handleSeat}
            onDragStart={setDragId}
            onDragEnd={() => setDragId(null)}
            onDropOn={handleDropOn}
          />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone-600">
            <span className="flex items-center gap-2" aria-label="Scale: the bar is 5 metres">
              <span className="block h-1.5 w-16 rounded-full bg-stone-700" aria-hidden="true" />5 m · room 24 × 14 m
            </span>
            <ul className="flex flex-wrap gap-x-3 gap-y-1" aria-label="Seat colours by party">
              {PARTIES.map((p) => (
                <li key={p} className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: PARTY_COLORS[p] }} aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-full border-2 border-white bg-amber-400 ring-1 ring-stone-300" aria-hidden="true" />
              Dietary need
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-full border border-dashed border-stone-500" aria-hidden="true" />
              Empty seat
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-full ring-2 ring-red-500" aria-hidden="true" />
              Breaks a rule
            </span>
          </div>
        </section>

        <div className="grid min-w-0 content-start gap-4 md:grid-cols-2 xl:grid-cols-1">
          {selectedId ? (
            <TablePanel
              tableId={selectedId}
              heldId={heldId}
              onHold={toggleHold}
              onClose={() => setSelectedId(null)}
              onDragStart={setDragId}
              onDragEnd={() => setDragId(null)}
            />
          ) : (
            <section className="rounded-xl border border-dashed border-stone-300 bg-white/60 px-4 py-6 text-sm text-stone-600">
              <h2 className="font-semibold text-stone-900">No table selected</h2>
              <p className="mt-1">Select a table on the plan to see who sits there and what they eat.</p>
            </section>
          )}
          <UnseatedPanel
            heldId={heldId}
            dragId={dragId}
            onHold={toggleHold}
            onDragStart={setDragId}
            onDragEnd={() => setDragId(null)}
            onDropUnseat={handleDropUnseat}
          />
          <div className="md:col-span-2 xl:col-span-1">
            <RulesPanel onShowTable={setSelectedId} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

```tsx components/GuestList.tsx
"use client";

import { useMemo, useState } from "react";
import { Printer, Search } from "lucide-react";

import { DIETS, DIET_NOTES, GUESTS, PARTIES, RSVP_LABEL, type Rsvp } from "@/lib/data";
import { TABLE_BY_ID } from "@/lib/plan";
import { DietBadge, PartyDot, RsvpBadge, SeatSelect } from "./GuestBits";
import { usePlan } from "./PlanProvider";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const field =
  "min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 shadow-sm";

function Filter({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={field}>
        {children}
      </select>
    </label>
  );
}

export default function GuestList() {
  const plan = usePlan();
  const [q, setQ] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState("all");
  const [diet, setDiet] = useState("all");
  const [seat, setSeat] = useState("all");

  const tableName = (id: string) => TABLE_BY_ID.get(id)?.name ?? id;

  const filtered = useMemo(() => {
    const needle = norm(q.trim());
    return GUESTS.filter((g) => {
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === "none" && g.diet) return false;
      if (diet === "any" && !g.diet) return false;
      if (diet !== "all" && diet !== "none" && diet !== "any" && g.diet !== diet) return false;
      const loc = plan.locations.get(g.id);
      if (seat === "seated" && !loc) return false;
      if (seat === "unseated" && loc) return false;
      if (needle) {
        const hay = norm([g.name, g.party, g.diet ?? "", loc ? tableName(loc.tableId) : "not seated"].join(" "));
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, party, rsvp, diet, seat, plan.locations]);

  const filtersActive = q !== "" || party !== "all" || rsvp !== "all" || diet !== "all" || seat !== "all";
  const reset = () => {
    setQ("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
    setSeat("all");
  };

  const rsvpCount = (r: Rsvp) => GUESTS.filter((g) => g.rsvp === r).length;

  const meals = useMemo(() => {
    const names = ["Standard menu", ...DIETS];
    return names.map((meal) => {
      const dietKey = meal === "Standard menu" ? null : meal;
      const match = GUESTS.filter((g) => g.diet === dietKey);
      const confirmed = match.filter((g) => g.rsvp === "yes");
      const possible = match.filter((g) => g.rsvp === "maybe" || g.rsvp === "pending");
      const tables = new Map<string, number>();
      for (const g of confirmed) {
        const loc = plan.locations.get(g.id);
        const label = loc ? tableName(loc.tableId) : "Not seated";
        tables.set(label, (tables.get(label) ?? 0) + 1);
      }
      return { meal, confirmed: confirmed.length, possible: possible.length, tables: Array.from(tables.entries()) };
    });
  }, [plan.locations]);

  const totalConfirmed = meals.reduce((a, m) => a + m.confirmed, 0);
  const totalPossible = meals.reduce((a, m) => a + m.possible, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">Guest list</h1>
          <p className="text-sm text-stone-600">{GUESTS.length} invited. Change a guest's table here or on the plan; both stay in step.</p>
        </div>
        <ul className="flex flex-wrap gap-2 text-xs" aria-label="Replies">
          {(["yes", "maybe", "pending", "no"] as Rsvp[]).map((r) => (
            <li key={r} className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2.5 py-1">
              <RsvpBadge rsvp={r} />
              <span className="font-semibold tabular-nums text-stone-900">{rsvpCount(r)}</span>
            </li>
          ))}
          <li className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2.5 py-1">
            <span className="text-stone-600">Seated</span>
            <span className="font-semibold tabular-nums text-stone-900">{plan.counts.seatedTotal}</span>
          </li>
        </ul>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <section aria-labelledby="guests-title" className="min-w-0 rounded-xl border border-stone-200 bg-white shadow-sm print:hidden">
          <h2 id="guests-title" className="sr-only">
            Guests
          </h2>
          <div className="space-y-3 border-b border-stone-200 p-4">
            <label className="relative block">
              <span className="sr-only">Search guests</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, party, diet or table"
                className={`${field} pl-9`}
              />
            </label>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Filter label="Party" value={party} onChange={setParty}>
                <option value="all">All parties</option>
                {PARTIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Filter>
              <Filter label="Reply" value={rsvp} onChange={setRsvp}>
                <option value="all">Any reply</option>
                {(Object.keys(RSVP_LABEL) as Rsvp[]).map((r) => (
                  <option key={r} value={r}>
                    {RSVP_LABEL[r]}
                  </option>
                ))}
              </Filter>
              <Filter label="Diet" value={diet} onChange={setDiet}>
                <option value="all">Any diet</option>
                <option value="any">Has a dietary need</option>
                <option value="none">No dietary need</option>
                {DIETS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Filter>
              <Filter label="Seat" value={seat} onChange={setSeat}>
                <option value="all">Seated or not</option>
                <option value="seated">Seated</option>
                <option value="unseated">Not seated</option>
              </Filter>
            </div>
            <div className="flex items-center justify-between gap-2 text-sm text-stone-600">
              <p role="status" aria-live="polite">
                Showing <strong className="tabular-nums text-stone-900">{filtered.length}</strong> of {GUESTS.length} guests
              </p>
              {filtersActive && (
                <button type="button" onClick={reset} className="min-h-10 rounded-lg px-3 font-medium text-sky-800 hover:bg-sky-50">
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-stone-600">No guests match these filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Guest list with party, reply, diet and table</caption>
                <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-500">
                  <tr>
                    <th scope="col" className="px-4 py-2.5">
                      Guest
                    </th>
                    <th scope="col" className="hidden px-3 py-2.5 md:table-cell">
                      Party
                    </th>
                    <th scope="col" className="px-3 py-2.5">
                      Reply
                    </th>
                    <th scope="col" className="hidden px-3 py-2.5 md:table-cell">
                      Diet
                    </th>
                    <th scope="col" className="px-3 py-2.5 pr-4">
                      Table
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filtered.map((g) => (
                    <tr key={g.id} className="align-middle hover:bg-stone-50">
                      <th scope="row" className="px-4 py-2 font-medium text-stone-900">
                        <span className="flex items-center gap-2">
                          <PartyDot party={g.party} />
                          {g.name}
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-normal text-stone-500 md:hidden">
                          {g.party}
                          {g.diet && <DietBadge diet={g.diet} />}
                        </span>
                      </th>
                      <td className="hidden px-3 py-2 text-stone-700 md:table-cell">{g.party}</td>
                      <td className="px-3 py-2">
                        <RsvpBadge rsvp={g.rsvp} />
                      </td>
                      <td className="hidden px-3 py-2 md:table-cell">
                        {g.diet ? <DietBadge diet={g.diet} /> : <span className="text-stone-400">None</span>}
                      </td>
                      <td className="px-3 py-2 pr-4">
                        <SeatSelect guestId={g.id} className="w-36" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section aria-labelledby="meals-title" className="min-w-0 self-start rounded-xl border border-stone-200 bg-white shadow-sm">
          <div className="flex items-start justify-between gap-2 border-b border-stone-200 px-4 py-3">
            <div>
              <h2 id="meals-title" className="text-base font-semibold text-stone-900">
                Meals for the caterer
              </h2>
              <p className="text-sm text-stone-600">
                <strong className="tabular-nums text-stone-900">{totalConfirmed}</strong> confirmed
                {totalPossible > 0 && <span> · up to {totalConfirmed + totalPossible} if every maybe says yes</span>}
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex min-h-10 items-center gap-1.5 rounded-lg border border-stone-300 px-3 text-sm font-medium text-stone-800 hover:bg-stone-50 print:hidden"
            >
              <Printer className="size-4" aria-hidden="true" />
              Print
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Meal counts, with the tables each confirmed meal goes to</caption>
              <thead className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                <tr>
                  <th scope="col" className="px-4 py-2">
                    Meal
                  </th>
                  <th scope="col" className="px-2 py-2 text-right">
                    Yes
                  </th>
                  <th scope="col" className="px-2 py-2 text-right">
                    Maybe
                  </th>
                  <th scope="col" className="px-4 py-2">
                    Where
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {meals.map((m) => (
                  <tr key={m.meal} className="align-top">
                    <th scope="row" className="px-4 py-2 font-medium text-stone-900">
                      {m.meal}
                      {DIET_NOTES[m.meal] && <span className="block text-xs font-normal text-stone-500">{DIET_NOTES[m.meal]}</span>}
                    </th>
                    <td className="px-2 py-2 text-right text-base font-semibold tabular-nums text-stone-900">{m.confirmed}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-stone-500">{m.possible}</td>
                    <td className="px-4 py-2 text-xs text-stone-600">
                      {m.tables.length === 0
                        ? "–"
                        : m.tables.map(([name, n]) => `${name} ×${n}`).join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-stone-300 font-semibold text-stone-900">
                  <th scope="row" className="px-4 py-2.5">
                    Total
                  </th>
                  <td className="px-2 py-2.5 text-right tabular-nums">{totalConfirmed}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums text-stone-500">{totalPossible}</td>
                  <td className="px-4 py-2.5 text-xs font-normal text-stone-500">{rsvpCount("no")} declined, not counted</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";

import PlanView from "@/components/PlanView";

export const metadata: Metadata = { title: "Seating plan" };

export default function Page() {
  return <PlanView />;
}
```

```tsx app/guests/page.tsx
import type { Metadata } from "next";

import GuestList from "@/components/GuestList";

export const metadata: Metadata = { title: "Guest list" };

export default function Page() {
  return <GuestList />;
}
```
