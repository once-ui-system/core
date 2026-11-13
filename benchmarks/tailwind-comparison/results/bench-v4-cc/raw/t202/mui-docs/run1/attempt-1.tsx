```ts lib/data.ts
export type Rsvp = "yes" | "maybe" | "pending" | "no";

export interface Guest {
  id: string;
  name: string;
  party: string;
  rsvp: Rsvp;
  diet: string | null;
  table: string | null;
}

export interface Fixture {
  id: string;
  kind: "stage" | "dancefloor" | "bar" | "door";
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TableDef {
  id: string;
  name: string;
  shape: "long" | "round";
  seats: number;
  x: number;
  y: number;
  rotation?: number;
}

export type RuleKind = "together" | "apart" | "near";

export interface Rule {
  id: string;
  kind: RuleKind;
  guests: string[];
  note: string;
  /** near rules: the fixture to be close to, and one to keep away from */
  nearFixture?: string;
  awayFrom?: string;
  maxDistance?: number;
  minAwayDistance?: number;
}

export const APP = "Seatwise, a seating planner for wedding and event planners";

export const EVENT = {
  name: "Ines & Mateo's wedding dinner",
  date: "2027-06-19",
  venue: "The Orangery, Hollin Hall",
  room: { width: 24, depth: 14 },
};

export const PLANNER = { name: "Hannah Brook" };

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Hand-formatted so the server and the browser always print the same text.
function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export const EVENT_DATE_LABEL = formatDate(EVENT.date);

export const FIXTURES: Fixture[] = [
  { id: "f-1", kind: "stage", label: "Band", x: 10, y: 0.5, w: 4, h: 2 },
  { id: "f-2", kind: "dancefloor", label: "Dance floor", x: 8.5, y: 3, w: 7, h: 4 },
  { id: "f-3", kind: "bar", label: "Bar", x: 21, y: 10, w: 2.5, h: 3.5 },
  { id: "f-4", kind: "door", label: "Garden doors", x: 0, y: 6, w: 0.5, h: 2.5 },
];

export const TABLES: TableDef[] = [
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

export const RULES: Rule[] = [
  { id: "r-1", kind: "together", guests: ["g-21", "g-22"], note: "Couple" },
  { id: "r-2", kind: "together", guests: ["g-32", "g-33"], note: "Siblings, under 10" },
  // The note names Sean and Ryan Doyle (g-30 and g-31), so the rule follows the names.
  {
    id: "r-3",
    kind: "apart",
    guests: ["g-30", "g-31"],
    note: "Brothers Sean and Ryan Doyle are not speaking",
  },
  { id: "r-4", kind: "apart", guests: ["g-12", "g-34"], note: "Ask the couple: old family dispute" },
  {
    id: "r-5",
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
    nearFixture: "f-4",
    awayFrom: "f-1",
    maxDistance: 4,
    minAwayDistance: 6,
  },
];

export const guestById: Record<string, Guest> = GUESTS.reduce<Record<string, Guest>>((acc, g) => {
  acc[g.id] = g;
  return acc;
}, {});

export const tableById: Record<string, TableDef> = TABLES.reduce<Record<string, TableDef>>((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {});

export const fixtureById: Record<string, Fixture> = FIXTURES.reduce<Record<string, Fixture>>((acc, f) => {
  acc[f.id] = f;
  return acc;
}, {});

export const PARTIES: string[] = GUESTS.reduce<string[]>(
  (acc, g) => (acc.includes(g.party) ? acc : [...acc, g.party]),
  [],
);

export const DIETS: string[] = GUESTS.reduce<string[]>(
  (acc, g) => (g.diet && !acc.includes(g.diet) ? [...acc, g.diet] : acc),
  [],
).sort((a, b) => a.localeCompare(b));

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Awaiting reply",
  no: "Declined",
};

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function firstName(name: string): string {
  return name.split(" ")[0];
}
```

```ts lib/ui.ts
// One hue per party, used on seats, avatars and the legend. Hue and saturation only:
// the tint mixes into the surface colour so it works in light and dark mode.
const PARTY_HSL: Record<string, [number, number]> = {
  Couple: [340, 70],
  "Bride's family": [272, 52],
  "Groom's family": [212, 68],
  "University friends": [158, 55],
  "Work friends": [38, 85],
  "Groom's football club": [96, 50],
  "Plus-ones": [220, 10],
};

export function partyColor(party: string): { solid: string; tint: string } {
  const [h, s] = PARTY_HSL[party] ?? [220, 10];
  return {
    solid: `hsl(${h} ${s}% 46%)`,
    tint: `color-mix(in srgb, hsl(${h} ${s}% 50%) 26%, var(--mui-palette-background-paper))`,
  };
}

export const STRONG_BORDER = "color-mix(in srgb, var(--mui-palette-text-primary) 30%, transparent)";
export const SOFT_BORDER = "color-mix(in srgb, var(--mui-palette-text-primary) 14%, transparent)";

export function tint(colorVar: string, percent: number): string {
  return `color-mix(in srgb, var(--mui-palette-${colorVar}) ${percent}%, transparent)`;
}
```

```ts lib/seating.ts
import {
  FIXTURES,
  GUESTS,
  RULES,
  TABLES,
  fixtureById,
  firstName,
  guestById,
  tableById,
  type Fixture,
  type Rule,
  type TableDef,
} from "./data";

/** For each table, one entry per seat: a guest id or null. */
export type SeatMap = Record<string, (string | null)[]>;

export const SEAT_D = 0.7;

export function initialSeats(): SeatMap {
  const seats: SeatMap = {};
  for (const t of TABLES) seats[t.id] = Array.from({ length: t.seats }, () => null);
  for (const g of GUESTS) {
    if (!g.table) continue;
    const row = seats[g.table];
    const free = row.indexOf(null);
    if (free >= 0) row[free] = g.id;
  }
  return seats;
}

export function locate(seats: SeatMap): Record<string, { table: string; seat: number }> {
  const out: Record<string, { table: string; seat: number }> = {};
  for (const [table, row] of Object.entries(seats)) {
    row.forEach((gid, seat) => {
      if (gid) out[gid] = { table, seat };
    });
  }
  return out;
}

export const RULE_GUEST_IDS: Set<string> = new Set(RULES.flatMap((r) => r.guests));

/* ---------- geometry (metres, room coordinates) ---------- */

export interface SeatPos {
  index: number;
  x: number;
  y: number;
}

export interface TableGeo {
  w: number;
  h: number;
  round: boolean;
  seats: SeatPos[];
}

export function tableGeometry(t: TableDef): TableGeo {
  const rot = ((t.rotation ?? 0) * Math.PI) / 180;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  const at = (dx: number, dy: number) => ({ x: t.x + dx * cos - dy * sin, y: t.y + dx * sin + dy * cos });

  if (t.shape === "round") {
    const d = t.seats > 6 ? 1.7 : 1.5;
    const ring = d / 2 + 0.1 + SEAT_D / 2;
    const seats: SeatPos[] = Array.from({ length: t.seats }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
      return { index: i, ...at(Math.cos(a) * ring, Math.sin(a) * ring) };
    });
    return { w: d, h: d, round: true, seats };
  }

  const top = Math.ceil(t.seats / 2);
  const bottom = t.seats - top;
  const spacing = 1.05;
  const depth = 0.9;
  const offset = depth / 2 + 0.1 + SEAT_D / 2 - 0.1;
  const seats: SeatPos[] = [];
  for (let k = 0; k < top; k++) {
    seats.push({ index: k, ...at((k - (top - 1) / 2) * spacing, -offset) });
  }
  for (let k = 0; k < bottom; k++) {
    seats.push({ index: top + k, ...at((k - (bottom - 1) / 2) * spacing, offset) });
  }
  return { w: top * spacing + 0.2, h: depth, round: false, seats };
}

function centre(f: Fixture): { x: number; y: number } {
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

export function distanceToFixture(t: TableDef, f: Fixture): number {
  const c = centre(f);
  return Math.hypot(t.x - c.x, t.y - c.y);
}

/* ---------- moving guests ---------- */

export type Severity = "success" | "info" | "warning" | "error";

export interface PlaceResult {
  seats: SeatMap;
  changed: boolean;
  message: string;
  severity: Severity;
}

function cloneSeats(seats: SeatMap): SeatMap {
  const next: SeatMap = {};
  for (const k of Object.keys(seats)) next[k] = seats[k].slice();
  return next;
}

function findGuest(seats: SeatMap, guestId: string): { table: string; seat: number } | null {
  for (const [table, row] of Object.entries(seats)) {
    const i = row.indexOf(guestId);
    if (i >= 0) return { table, seat: i };
  }
  return null;
}

export function placeGuest(seats: SeatMap, guestId: string, tableId: string, seatIndex?: number): PlaceResult {
  const guest = guestById[guestId];
  const table = tableById[tableId];
  const fail = (message: string, severity: Severity): PlaceResult => ({ seats, changed: false, message, severity });
  if (!guest || !table) return fail("That guest or table does not exist.", "error");
  if (guest.rsvp === "no") {
    return fail(`${guest.name} has declined, so there is no seat to give.`, "warning");
  }

  const from = findGuest(seats, guestId);
  const next = cloneSeats(seats);
  const row = next[tableId];
  const verb = from ? "moved to" : "seated at";

  if (seatIndex === undefined) {
    if (from && from.table === tableId) return fail(`${guest.name} is already at ${table.name}.`, "info");
    const free = row.indexOf(null);
    if (free < 0) {
      return fail(`${table.name} is full (${row.length} of ${row.length}). Choose a seat to swap, or another table.`, "warning");
    }
    if (from) next[from.table][from.seat] = null;
    row[free] = guestId;
    return {
      seats: next,
      changed: true,
      message: `${guest.name} ${verb} ${table.name}, seat ${free + 1}.`,
      severity: "success",
    };
  }

  const occupant = row[seatIndex];
  if (occupant === guestId) return fail(`${guest.name} is already in that seat.`, "info");

  if (!occupant) {
    if (from) next[from.table][from.seat] = null;
    row[seatIndex] = guestId;
    return {
      seats: next,
      changed: true,
      message: `${guest.name} ${verb} ${table.name}, seat ${seatIndex + 1}.`,
      severity: "success",
    };
  }

  const other = guestById[occupant];
  if (from) {
    next[from.table][from.seat] = occupant;
    row[seatIndex] = guestId;
    return {
      seats: next,
      changed: true,
      message: `Swapped ${guest.name} and ${other.name}.`,
      severity: "success",
    };
  }

  const free = row.indexOf(null);
  if (free >= 0) {
    row[free] = guestId;
    return {
      seats: next,
      changed: true,
      message: `${guest.name} seated at ${table.name}, seat ${free + 1} (seat ${seatIndex + 1} was taken).`,
      severity: "success",
    };
  }
  row[seatIndex] = guestId;
  return {
    seats: next,
    changed: true,
    message: `${guest.name} took ${other.name}'s seat at ${table.name}. ${other.name} is now unseated.`,
    severity: "warning",
  };
}

export function unseatGuest(seats: SeatMap, guestId: string): PlaceResult {
  const guest = guestById[guestId];
  const from = findGuest(seats, guestId);
  if (!guest || !from) return { seats, changed: false, message: "That guest has no seat to leave.", severity: "info" };
  const next = cloneSeats(seats);
  next[from.table][from.seat] = null;
  return {
    seats: next,
    changed: true,
    message: `${guest.name} unseated from ${tableById[from.table].name}.`,
    severity: "success",
  };
}

/* ---------- the couple's rules ---------- */

export type RuleStatus = "ok" | "broken" | "open";

export interface RuleResult {
  rule: Rule;
  status: RuleStatus;
  /** tables to flag on the plan */
  tables: string[];
  /** guests to flag on their seats */
  guestIds: string[];
  message: string;
}

export const RULE_LABEL: Record<Rule["kind"], string> = {
  together: "Keep together",
  apart: "Keep apart",
  near: "Seat near",
};

export function ruleTitle(rule: Rule): string {
  const names = rule.guests.map((id) => guestById[id].name);
  if (rule.kind === "near") {
    const f = rule.nearFixture ? fixtureById[rule.nearFixture] : undefined;
    return `${names[0]} near the ${f ? f.label.toLowerCase() : "venue feature"}`;
  }
  return names.join(" and ");
}

function unique(list: string[]): string[] {
  return list.filter((v, i) => list.indexOf(v) === i);
}

function names(ids: string[]): string {
  return ids.map((id) => guestById[id].name).join(" and ");
}

export function evaluateRules(seats: SeatMap): RuleResult[] {
  const at = locate(seats);
  const tn = (id: string) => tableById[id].name;

  return RULES.map((rule): RuleResult => {
    const placed = rule.guests.filter((id) => at[id]);
    const unplaced = rule.guests.filter((id) => !at[id]);

    if (rule.kind === "together") {
      const tables = unique(placed.map((id) => at[id].table));
      if (tables.length > 1) {
        return {
          rule,
          status: "broken",
          tables,
          guestIds: placed,
          message: `${placed.map((id) => `${guestById[id].name} is at ${tn(at[id].table)}`).join(", ")}. They should share a table.`,
        };
      }
      if (placed.length === 0) {
        return { rule, status: "open", tables: [], guestIds: [], message: `${names(rule.guests)} are not seated yet.` };
      }
      if (unplaced.length > 0) {
        return {
          rule,
          status: "open",
          tables,
          guestIds: [],
          message: `${names(placed)} at ${tn(tables[0])}. Seat ${names(unplaced)} there too.`,
        };
      }
      return { rule, status: "ok", tables, guestIds: [], message: `Together at ${tn(tables[0])}.` };
    }

    if (rule.kind === "apart") {
      const byTable: Record<string, string[]> = {};
      for (const id of placed) {
        const t = at[id].table;
        byTable[t] = [...(byTable[t] ?? []), id];
      }
      const shared = Object.entries(byTable).find(([, ids]) => ids.length > 1);
      if (shared) {
        return {
          rule,
          status: "broken",
          tables: [shared[0]],
          guestIds: shared[1],
          message: `${names(shared[1])} are both at ${tn(shared[0])}. Move one of them.`,
        };
      }
      return {
        rule,
        status: "ok",
        tables: [],
        guestIds: [],
        message:
          unplaced.length > 0
            ? `Holds for now: ${names(unplaced)} ${unplaced.length > 1 ? "are" : "is"} not seated yet.`
            : "At different tables.",
      };
    }

    // near
    const id = rule.guests[0];
    const guest = guestById[id];
    const near = rule.nearFixture ? fixtureById[rule.nearFixture] : undefined;
    const away = rule.awayFrom ? fixtureById[rule.awayFrom] : undefined;
    const maxD = rule.maxDistance ?? 4;
    const minAway = rule.minAwayDistance ?? 6;
    const qualifies = (t: TableDef) =>
      (!near || distanceToFixture(t, near) <= maxD) && (!away || distanceToFixture(t, away) >= minAway);
    const best = near
      ? TABLES.filter((t) => qualifies(t) && seats[t.id].includes(null))
          .sort((a, b) => distanceToFixture(a, near) - distanceToFixture(b, near))[0]
      : undefined;
    const hint = best ? ` ${tn(best.id)} has a free seat and suits.` : "";

    if (!at[id]) {
      return {
        rule,
        status: "open",
        tables: [],
        guestIds: [],
        message: `${guest.name} is not seated yet.${hint}`,
      };
    }
    const table = tableById[at[id].table];
    const dNear = near ? distanceToFixture(table, near) : 0;
    const dAway = away ? distanceToFixture(table, away) : Infinity;
    const problems: string[] = [];
    if (near && dNear > maxD) {
      problems.push(`${table.name} is ${dNear.toFixed(1)} m from the ${near.label.toLowerCase()}; aim for ${maxD} m or less`);
    }
    if (away && dAway < minAway) {
      problems.push(`${table.name} is only ${dAway.toFixed(1)} m from the ${away.label.toLowerCase()}; keep ${minAway} m or more away`);
    }
    if (problems.length > 0) {
      return {
        rule,
        status: "broken",
        tables: [table.id],
        guestIds: [id],
        message: `${problems.join(". ")}.${hint}`,
      };
    }
    return {
      rule,
      status: "ok",
      tables: [table.id],
      guestIds: [],
      message: `${table.name} is ${near ? dNear.toFixed(1) : "?"} m from the ${near ? near.label.toLowerCase() : "feature"}${
        away ? ` and ${dAway.toFixed(1)} m from the ${away.label.toLowerCase()}` : ""
      }.`,
    };
  });
}

export { FIXTURES, firstName };
```

```tsx components/PlanProvider.tsx
"use client";

import * as React from "react";
import { GUESTS, TABLES, type Guest } from "@/lib/data";
import {
  evaluateRules,
  initialSeats,
  locate,
  placeGuest,
  unseatGuest,
  type RuleResult,
  type SeatMap,
  type Severity,
} from "@/lib/seating";

export interface Notice {
  id: number;
  message: string;
  severity: Severity;
  undoable: boolean;
  open: boolean;
}

interface State {
  seats: SeatMap;
  prev: SeatMap | null;
  selectedTable: string | null;
  armed: string | null;
  notice: Notice | null;
  counter: number;
}

type Action =
  | { type: "place"; guestId: string; tableId: string; seatIndex?: number }
  | { type: "unseat"; guestId: string }
  | { type: "select-table"; tableId: string | null }
  | { type: "arm"; guestId: string | null }
  | { type: "undo" }
  | { type: "dismiss" }
  | { type: "notify"; message: string; severity: Severity };

function initialState(): State {
  return { seats: initialSeats(), prev: null, selectedTable: null, armed: null, notice: null, counter: 0 };
}

function withNotice(state: State, message: string, severity: Severity, undoable: boolean) {
  const id = state.counter + 1;
  return { counter: id, notice: { id, message, severity, undoable, open: true } as Notice };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "place": {
      const r = placeGuest(state.seats, action.guestId, action.tableId, action.seatIndex);
      if (!r.changed) {
        return {
          ...state,
          armed: r.severity === "info" ? null : state.armed,
          ...withNotice(state, r.message, r.severity, false),
        };
      }
      return {
        ...state,
        seats: r.seats,
        prev: state.seats,
        armed: null,
        selectedTable: action.tableId,
        ...withNotice(state, r.message, r.severity, true),
      };
    }
    case "unseat": {
      const r = unseatGuest(state.seats, action.guestId);
      if (!r.changed) return { ...state, armed: null, ...withNotice(state, r.message, r.severity, false) };
      return {
        ...state,
        seats: r.seats,
        prev: state.seats,
        armed: null,
        ...withNotice(state, r.message, r.severity, true),
      };
    }
    case "select-table":
      return { ...state, selectedTable: action.tableId };
    case "arm": {
      if (!action.guestId) return { ...state, armed: null };
      const at = locate(state.seats)[action.guestId];
      return { ...state, armed: action.guestId, selectedTable: at ? at.table : state.selectedTable };
    }
    case "undo": {
      if (!state.prev) return state;
      return { ...state, seats: state.prev, prev: null, armed: null, ...withNotice(state, "Last change undone.", "info", false) };
    }
    case "dismiss":
      return state.notice ? { ...state, notice: { ...state.notice, open: false } } : state;
    case "notify":
      return { ...state, ...withNotice(state, action.message, action.severity, false) };
    default:
      return state;
  }
}

export interface PlanCounts {
  attending: number;
  seatedAttending: number;
  seatedTotal: number;
  capacity: number;
  declined: number;
}

export interface PlanApi {
  state: State;
  guestTable: Record<string, string | null>;
  tableFill: Record<string, number>;
  /** attending (yes) guests without a seat */
  unseated: Guest[];
  /** maybe / awaiting-reply guests without a seat */
  awaiting: Guest[];
  counts: PlanCounts;
  results: RuleResult[];
  brokenByTable: Record<string, RuleResult[]>;
  brokenGuests: Set<string>;
  dragging: string | null;
  setDragging: (id: string | null) => void;
  place: (guestId: string, tableId: string, seatIndex?: number) => void;
  unseat: (guestId: string) => void;
  selectTable: (tableId: string | null) => void;
  arm: (guestId: string | null) => void;
  undo: () => void;
  dismissNotice: () => void;
  notify: (message: string, severity?: Severity) => void;
}

const PlanContext = React.createContext<PlanApi | null>(null);

export function usePlan(): PlanApi {
  const ctx = React.useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

export default function PlanProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, undefined, initialState);
  const [dragging, setDragging] = React.useState<string | null>(null);

  const derived = React.useMemo(() => {
    const at = locate(state.seats);
    const guestTable: Record<string, string | null> = {};
    for (const g of GUESTS) guestTable[g.id] = at[g.id] ? at[g.id].table : null;

    const tableFill: Record<string, number> = {};
    for (const t of TABLES) tableFill[t.id] = state.seats[t.id].filter(Boolean).length;

    const attending = GUESTS.filter((g) => g.rsvp === "yes");
    const unseated = attending.filter((g) => !guestTable[g.id]);
    const awaiting = GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !guestTable[g.id]);
    const seatedTotal = GUESTS.filter((g) => guestTable[g.id]).length;
    const counts: PlanCounts = {
      attending: attending.length,
      seatedAttending: attending.length - unseated.length,
      seatedTotal,
      capacity: TABLES.reduce((n, t) => n + t.seats, 0),
      declined: GUESTS.filter((g) => g.rsvp === "no").length,
    };

    const results = evaluateRules(state.seats);
    const brokenByTable: Record<string, RuleResult[]> = {};
    const brokenGuests = new Set<string>();
    for (const r of results) {
      if (r.status !== "broken") continue;
      for (const t of r.tables) brokenByTable[t] = [...(brokenByTable[t] ?? []), r];
      for (const g of r.guestIds) brokenGuests.add(g);
    }
    return { guestTable, tableFill, unseated, awaiting, counts, results, brokenByTable, brokenGuests };
  }, [state.seats]);

  const place = React.useCallback(
    (guestId: string, tableId: string, seatIndex?: number) => dispatch({ type: "place", guestId, tableId, seatIndex }),
    [],
  );
  const unseat = React.useCallback((guestId: string) => dispatch({ type: "unseat", guestId }), []);
  const selectTable = React.useCallback((tableId: string | null) => dispatch({ type: "select-table", tableId }), []);
  const arm = React.useCallback((guestId: string | null) => dispatch({ type: "arm", guestId }), []);
  const undo = React.useCallback(() => dispatch({ type: "undo" }), []);
  const dismissNotice = React.useCallback(() => dispatch({ type: "dismiss" }), []);
  const notify = React.useCallback(
    (message: string, severity: Severity = "info") => dispatch({ type: "notify", message, severity }),
    [],
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch({ type: "arm", guestId: null });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = React.useMemo<PlanApi>(
    () => ({
      state,
      ...derived,
      dragging,
      setDragging,
      place,
      unseat,
      selectTable,
      arm,
      undo,
      dismissNotice,
      notify,
    }),
    [state, derived, dragging, place, unseat, selectTable, arm, undo, dismissNotice, notify],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
```

```tsx components/AppShell.tsx
"use client";

import * as React from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import Alert from "@mui/material/Alert";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import CalendarMonth from "@mui/icons-material/CalendarMonth";
import DarkMode from "@mui/icons-material/DarkMode";
import EventSeat from "@mui/icons-material/EventSeat";
import Groups from "@mui/icons-material/Groups";
import LightMode from "@mui/icons-material/LightMode";
import Place from "@mui/icons-material/Place";
import TableRestaurant from "@mui/icons-material/TableRestaurant";
import { EVENT, EVENT_DATE_LABEL, PLANNER } from "@/lib/data";
import { tint } from "@/lib/ui";
import { usePlan } from "./PlanProvider";

const NAV = [
  { href: "/", label: "Seating plan", icon: <TableRestaurant fontSize="small" /> },
  { href: "/guests", label: "Guest list", icon: <Groups fontSize="small" /> },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const plan = usePlan();
  const { mode, systemMode, setMode } = useColorScheme();
  const isDark = mode === "dark" || (mode === "system" && systemMode === "dark");
  const notice = plan.state.notice;

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
      <Box
        component="a"
        href="#main"
        sx={{
          position: "absolute",
          left: 8,
          top: -60,
          zIndex: 2000,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          px: 2,
          py: 1,
          borderRadius: 1,
          "&:focus": { top: 8 },
        }}
      >
        Skip to content
      </Box>

      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ bgcolor: "background.paper", borderBottom: 1, borderColor: "divider", backgroundImage: "none" }}
      >
        <Toolbar sx={{ gap: { xs: 0.5, sm: 2 }, minHeight: { xs: 56, sm: 60 }, px: { xs: 1.5, sm: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: { xs: 0.5, sm: 2 } }}>
            <Box
              aria-hidden
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                display: "grid",
                placeItems: "center",
                bgcolor: "primary.main",
                color: "primary.contrastText",
              }}
            >
              <EventSeat fontSize="small" />
            </Box>
            <Typography variant="h6" component="span" sx={{ letterSpacing: "-0.01em", display: { xs: "none", sm: "block" } }}>
              Seatwise
            </Typography>
          </Box>

          <Box component="nav" aria-label="Main" sx={{ display: "flex", gap: 0.5, flex: 1, minWidth: 0 }}>
            {NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Button
                  key={item.href}
                  component={NextLink}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  startIcon={item.icon}
                  color={active ? "primary" : "inherit"}
                  sx={{
                    bgcolor: active ? tint("primary-main", 12) : "transparent",
                    color: active ? "primary.main" : "text.secondary",
                    px: { xs: 1.25, sm: 2 },
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          <Typography variant="body2" sx={{ color: "text.secondary", display: { xs: "none", md: "block" } }}>
            Planner: <strong>{PLANNER.name}</strong>
          </Typography>
          <IconButton
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setMode(isDark ? "light" : "dark")}
            edge="end"
          >
            <DarkMode sx={(theme) => ({ display: "block", ...theme.applyStyles("dark", { display: "none" }) })} />
            <LightMode sx={(theme) => ({ display: "none", ...theme.applyStyles("dark", { display: "block" }) })} />
          </IconButton>
        </Toolbar>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            columnGap: { xs: 1.5, md: 3 },
            rowGap: 0.5,
            px: { xs: 2, sm: 3 },
            py: 0.75,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: tint("primary-main", 5),
          }}
        >
          <Typography variant="subtitle2" component="p" sx={{ fontWeight: 700 }}>
            {EVENT.name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
            <CalendarMonth sx={{ fontSize: 16 }} />
            <Typography variant="caption">{EVENT_DATE_LABEL}</Typography>
          </Box>
          <Box sx={{ alignItems: "center", gap: 0.5, color: "text.secondary", display: { xs: "none", sm: "flex" } }}>
            <Place sx={{ fontSize: 16 }} />
            <Typography variant="caption">{EVENT.venue}</Typography>
          </Box>
        </Box>
      </AppBar>

      <Box component="main" id="main" tabIndex={-1} sx={{ flex: 1, outline: "none" }}>
        {children}
      </Box>

      <Snackbar
        key={notice ? notice.id : 0}
        open={notice ? notice.open : false}
        autoHideDuration={7000}
        onClose={(_, reason) => {
          if (reason === "clickaway") return;
          plan.dismissNotice();
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={notice ? notice.severity : "info"}
          variant="filled"
          sx={{ width: "100%", alignItems: "center" }}
          action={
            notice && notice.undoable && plan.state.prev ? (
              <Button color="inherit" size="small" onClick={plan.undo}>
                Undo
              </Button>
            ) : undefined
          }
          onClose={plan.dismissNotice}
        >
          {notice ? notice.message : ""}
        </Alert>
      </Snackbar>
    </Box>
  );
}
```

```tsx components/GuestRow.tsx
"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import WarningAmber from "@mui/icons-material/WarningAmber";
import { RSVP_LABEL, initials, type Guest } from "@/lib/data";
import { RULE_GUEST_IDS } from "@/lib/seating";
import { partyColor, tint } from "@/lib/ui";
import { usePlan } from "./PlanProvider";

interface Props {
  guest: Guest;
  /** shown before the avatar, e.g. a seat number */
  lead?: React.ReactNode;
  action?: React.ReactNode;
}

/** A guest you can tap to pick up (then tap a seat or table) or drag onto a seat or table. */
export default function GuestRow({ guest, lead, action }: Props) {
  const plan = usePlan();
  const armed = plan.state.armed === guest.id;
  const flagged = plan.brokenGuests.has(guest.id);
  const hasRule = RULE_GUEST_IDS.has(guest.id);
  const c = partyColor(guest.party);
  const toggle = () => plan.arm(armed ? null : guest.id);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Box
        role="button"
        tabIndex={0}
        draggable
        aria-pressed={armed}
        aria-label={`${guest.name}, ${guest.party}${guest.diet ? `, ${guest.diet}` : ""}${
          guest.rsvp !== "yes" ? `, ${RSVP_LABEL[guest.rsvp]}` : ""
        }${flagged ? ", breaks a seating rule" : ""}. ${armed ? "Picked up. Choose a seat or table." : "Press to pick up."}`}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", guest.id);
          e.dataTransfer.effectAllowed = "move";
          plan.setDragging(guest.id);
        }}
        onDragEnd={() => plan.setDragging(null)}
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          px: 1,
          py: 0.75,
          minHeight: 48,
          borderRadius: 1.5,
          cursor: "grab",
          border: "1.5px solid",
          borderColor: armed ? "primary.main" : "transparent",
          bgcolor: armed ? tint("primary-main", 14) : "transparent",
          "&:hover": { bgcolor: armed ? tint("primary-main", 18) : tint("text-primary", 6) },
          "&:focus-visible": { outline: "3px solid var(--mui-palette-primary-main)", outlineOffset: 1 },
        }}
      >
        {lead}
        <Box
          aria-hidden
          sx={{
            width: 32,
            height: 32,
            flexShrink: 0,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            fontSize: 12,
            fontWeight: 700,
            bgcolor: c.tint,
            border: `2px solid ${c.solid}`,
          }}
        >
          {initials(guest.name)}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
            {guest.name}
          </Typography>
          <Typography variant="caption" noWrap component="p" sx={{ color: "text.secondary" }}>
            {guest.party}
          </Typography>
        </Box>
        {guest.diet ? <Chip size="small" variant="outlined" label={guest.diet} /> : null}
        {guest.rsvp !== "yes" ? (
          <Chip size="small" color={guest.rsvp === "no" ? "error" : "warning"} variant="outlined" label={RSVP_LABEL[guest.rsvp]} />
        ) : null}
        {flagged ? (
          <WarningAmber fontSize="small" color="error" titleAccess="Breaks a seating rule" />
        ) : hasRule ? (
          <Box component="span" title="Has a seating rule" aria-hidden sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "secondary.main", flexShrink: 0 }} />
        ) : null}
      </Box>
      {action}
    </Box>
  );
}
```

```tsx components/RoomPlan.tsx
"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import LocalBar from "@mui/icons-material/LocalBar";
import MusicNote from "@mui/icons-material/MusicNote";
import WarningAmber from "@mui/icons-material/WarningAmber";
import { EVENT, FIXTURES, PARTIES, TABLES, guestById, initials, type Fixture, type TableDef } from "@/lib/data";
import { SEAT_D, tableGeometry } from "@/lib/seating";
import { STRONG_BORDER, partyColor, tint } from "@/lib/ui";
import { usePlan } from "./PlanProvider";

const W = EVENT.room.width;
const D = EVENT.room.depth;

// Everything is placed in room metres and turned into percentages of the room,
// so the plan scales with its container. Text sizes use container query units (1 m = 100cqw / W).
const px = (x: number) => `${(x / W) * 100}%`;
const py = (y: number) => `${(y / D) * 100}%`;
const pw = (w: number) => `${(w / W) * 100}%`;
const ph = (h: number) => `${(h / D) * 100}%`;
const fs = (m: number, min: number, max: number) => `clamp(${min}px, calc(${m} * 100cqw / ${W}), ${max}px)`;

const FIXTURE_BG: Record<Fixture["kind"], string> = {
  stage: tint("secondary-main", 22),
  dancefloor: tint("primary-main", 9),
  bar: tint("text-primary", 12),
  door: "var(--mui-palette-success-main)",
};
const FIXTURE_BORDER: Record<Fixture["kind"], string> = {
  stage: "1.5px solid var(--mui-palette-secondary-main)",
  dancefloor: "1.5px dashed var(--mui-palette-primary-main)",
  bar: `1.5px solid ${STRONG_BORDER}`,
  door: "none",
};

function FixtureNode({ f }: { f: Fixture }) {
  return (
    <Box
      role="img"
      aria-label={f.label}
      sx={{
        position: "absolute",
        left: px(f.x),
        top: py(f.y),
        width: pw(f.w),
        height: ph(f.h),
        boxSizing: "border-box",
        display: "flex",
        flexDirection: f.kind === "dancefloor" ? "column" : "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.5,
        overflow: "hidden",
        textAlign: "center",
        fontSize: fs(0.3, 9, 14),
        fontWeight: 600,
        lineHeight: 1.1,
        borderRadius: f.kind === "door" ? 0 : fs(0.2, 3, 8),
        bgcolor: FIXTURE_BG[f.kind],
        border: FIXTURE_BORDER[f.kind],
        color: f.kind === "door" ? "var(--mui-palette-success-contrastText)" : "text.primary",
        writingMode: f.kind === "door" ? "vertical-rl" : "horizontal-tb",
        transform: f.kind === "door" ? "rotate(180deg)" : "none",
        pointerEvents: "none",
      }}
    >
      {f.kind === "stage" ? <MusicNote fontSize="inherit" /> : null}
      {f.kind === "bar" ? <LocalBar fontSize="inherit" /> : null}
      <span>{f.label}</span>
    </Box>
  );
}

function draggedId(plan: ReturnType<typeof usePlan>, e: React.DragEvent): string | null {
  const id = plan.dragging ?? e.dataTransfer.getData("text/plain");
  return id && guestById[id] ? id : null;
}

interface NodeProps {
  table: TableDef;
  over: string | null;
  setOver: (key: string | null) => void;
}

function TableNode({ table, over, setOver }: NodeProps) {
  const plan = usePlan();
  const geo = React.useMemo(() => tableGeometry(table), [table]);
  const row = plan.state.seats[table.id];
  const filled = plan.tableFill[table.id];
  const selected = plan.state.selectedTable === table.id;
  const armedId = plan.state.armed;
  const broken = plan.brokenByTable[table.id] ?? [];
  const tableOver = over === table.id;

  const onTable = () => {
    if (armedId) plan.place(armedId, table.id);
    else plan.selectTable(selected ? null : table.id);
  };

  const label =
    `${table.name}, ${filled} of ${row.length} seats filled` +
    (broken.length ? `, ${broken.length} seating rule${broken.length > 1 ? "s" : ""} broken` : "") +
    (selected ? ", selected" : "");

  return (
    <>
      <Box
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        aria-label={label}
        onClick={onTable}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onTable();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          if (over !== table.id) setOver(table.id);
        }}
        onDragLeave={() => setOver(null)}
        onDrop={(e) => {
          e.preventDefault();
          const id = draggedId(plan, e);
          setOver(null);
          plan.setDragging(null);
          if (id) plan.place(id, table.id);
        }}
        sx={{
          position: "absolute",
          left: px(table.x),
          top: py(table.y),
          width: pw(geo.w),
          height: ph(geo.h),
          transform: `translate(-50%, -50%) rotate(${table.rotation ?? 0}deg)`,
          boxSizing: "border-box",
          borderRadius: geo.round ? "50%" : fs(0.18, 4, 9),
          bgcolor: tableOver ? tint("primary-main", 22) : "background.paper",
          border: "2.5px solid",
          borderColor: broken.length ? "error.main" : selected || tableOver ? "primary.main" : STRONG_BORDER,
          boxShadow: broken.length
            ? "0 0 0 3px color-mix(in srgb, var(--mui-palette-error-main) 28%, transparent)"
            : selected
              ? "0 0 0 4px color-mix(in srgb, var(--mui-palette-primary-main) 30%, transparent)"
              : "0 1px 2px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          lineHeight: 1.15,
          cursor: armedId ? "copy" : "pointer",
          zIndex: 1,
          "&:focus-visible": { outline: "3px solid var(--mui-palette-primary-main)", outlineOffset: 3 },
        }}
      >
        <Box component="span" sx={{ fontSize: fs(0.31, 9, 14), fontWeight: 700 }}>
          {table.name}
        </Box>
        <Box
          component="span"
          sx={{
            fontSize: fs(0.28, 9, 13),
            color: broken.length ? "error.main" : "text.secondary",
            display: "inline-flex",
            alignItems: "center",
            gap: 0.25,
            fontWeight: 600,
          }}
        >
          {broken.length ? <WarningAmber sx={{ fontSize: "1.15em" }} /> : null}
          {filled}/{row.length}
        </Box>
      </Box>

      {geo.seats.map((pos) => {
        const gid = row[pos.index];
        const guest = gid ? guestById[gid] : null;
        const c = guest ? partyColor(guest.party) : null;
        const isArmed = gid !== null && plan.state.armed === gid;
        const flagged = gid !== null && plan.brokenGuests.has(gid);
        const key = `${table.id}:${pos.index}`;
        const isOver = over === key;

        const onSeat = () => {
          if (gid) {
            if (armedId && armedId !== gid) plan.place(armedId, table.id, pos.index);
            else if (armedId === gid) plan.arm(null);
            else plan.arm(gid);
          } else if (armedId) {
            plan.place(armedId, table.id, pos.index);
          } else {
            plan.selectTable(table.id);
          }
        };

        return (
          <Box
            key={key}
            role="button"
            tabIndex={0}
            aria-pressed={guest ? isArmed : undefined}
            aria-label={
              guest
                ? `${table.name}, seat ${pos.index + 1}: ${guest.name}, ${guest.party}, ${guest.diet ?? "no dietary needs"}${
                    flagged ? ", breaks a seating rule" : ""
                  }`
                : `${table.name}, seat ${pos.index + 1}: empty`
            }
            title={guest ? `${guest.name} · ${guest.party}${guest.diet ? ` · ${guest.diet}` : ""}` : `${table.name}, seat ${pos.index + 1} (empty)`}
            draggable={guest !== null}
            onClick={onSeat}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSeat();
              }
            }}
            onDragStart={(e) => {
              if (!gid) return;
              e.dataTransfer.setData("text/plain", gid);
              e.dataTransfer.effectAllowed = "move";
              plan.setDragging(gid);
            }}
            onDragEnd={() => {
              plan.setDragging(null);
              setOver(null);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = "move";
              if (over !== key) setOver(key);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const id = draggedId(plan, e);
              setOver(null);
              plan.setDragging(null);
              if (id) plan.place(id, table.id, pos.index);
            }}
            sx={{
              position: "absolute",
              left: px(pos.x - SEAT_D / 2),
              top: py(pos.y - SEAT_D / 2),
              width: pw(SEAT_D),
              height: ph(SEAT_D),
              boxSizing: "border-box",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: fs(0.27, 8, 12),
              fontWeight: 700,
              userSelect: "none",
              cursor: guest ? "grab" : armedId ? "copy" : "pointer",
              zIndex: 2,
              bgcolor: isOver ? tint("primary-main", 35) : c ? c.tint : "transparent",
              border: c ? `2px solid ${c.solid}` : "1.5px dashed color-mix(in srgb, var(--mui-palette-text-primary) 45%, transparent)",
              color: "text.primary",
              boxShadow: isOver
                ? "0 0 0 3px var(--mui-palette-primary-main)"
                : flagged
                  ? "0 0 0 2.5px var(--mui-palette-error-main)"
                  : "none",
              outline: isArmed ? "3px solid var(--mui-palette-primary-main)" : "none",
              outlineOffset: 2,
              transform: isArmed ? "scale(1.15)" : "none",
              transition: "transform 120ms, box-shadow 120ms",
              "&:hover": { bgcolor: c ? c.tint : tint("primary-main", 16) },
              "&:focus-visible": { outline: "3px solid var(--mui-palette-primary-main)", outlineOffset: 2 },
            }}
          >
            {guest ? initials(guest.name) : <Box component="span" aria-hidden sx={{ color: "text.disabled" }}>+</Box>}
            {guest && guest.diet ? (
              <Box
                component="span"
                aria-hidden
                sx={{
                  position: "absolute",
                  right: "-8%",
                  bottom: "-8%",
                  width: "34%",
                  height: "34%",
                  borderRadius: "50%",
                  bgcolor: "warning.main",
                  border: "1.5px solid var(--mui-palette-background-paper)",
                }}
              />
            ) : null}
          </Box>
        );
      })}
    </>
  );
}

const legendItemSx = { display: "flex", alignItems: "center", gap: 0.75, listStyle: "none" } as const;

export default function RoomPlan() {
  const [over, setOver] = React.useState<string | null>(null);

  return (
    <Paper variant="outlined" component="section" aria-labelledby="plan-title" sx={{ p: { xs: 1.5, md: 2 }, overflow: "hidden" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 0.5 }}>
        <Typography id="plan-title" variant="h6" component="h2">
          Room plan
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {EVENT.venue} · {W} × {D} m · grid squares are 1 m
        </Typography>
      </Box>

      <Box
        role="region"
        aria-label="Room plan. On narrow screens it scrolls sideways."
        tabIndex={0}
        sx={{ overflowX: "auto", mt: 1.5, borderRadius: 1.5, "&:focus-visible": { outline: "3px solid var(--mui-palette-primary-main)" } }}
      >
        <Box sx={{ minWidth: 880, containerType: "inline-size" }}>
          <Box
            sx={{
              position: "relative",
              aspectRatio: `${W} / ${D}`,
              border: "3px solid",
              borderColor: "text.secondary",
              borderRadius: 1,
              bgcolor: "color-mix(in srgb, var(--mui-palette-primary-main) 4%, var(--mui-palette-background-paper))",
              backgroundImage:
                "linear-gradient(to right, color-mix(in srgb, var(--mui-palette-text-primary) 7%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--mui-palette-text-primary) 7%, transparent) 1px, transparent 1px)",
              backgroundSize: `calc(100cqw / ${W}) calc(100cqw / ${W})`,
            }}
          >
            {FIXTURES.map((f) => (
              <FixtureNode key={f.id} f={f} />
            ))}
            {TABLES.map((t) => (
              <TableNode key={t.id} table={t} over={over} setOver={setOver} />
            ))}
          </Box>
        </Box>
      </Box>

      <Box
        component="ul"
        aria-label="Legend"
        sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 1.5, alignItems: "center", m: 0, p: 0, pt: 1.5 }}
      >
        {PARTIES.map((p) => {
          const c = partyColor(p);
          return (
            <Box key={p} component="li" sx={legendItemSx}>
              <Box aria-hidden sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: c.tint, border: `2px solid ${c.solid}` }} />
              <Typography variant="caption">{p}</Typography>
            </Box>
          );
        })}
        <Box component="li" sx={legendItemSx}>
          <Box aria-hidden sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "warning.main" }} />
          <Typography variant="caption">Dietary need</Typography>
        </Box>
        <Box component="li" sx={legendItemSx}>
          <Box aria-hidden sx={{ width: 14, height: 14, borderRadius: "50%", border: "1.5px dashed", borderColor: "text.secondary" }} />
          <Typography variant="caption">Empty seat</Typography>
        </Box>
      </Box>
      <Typography variant="caption" component="p" sx={{ mt: 1, color: "text.secondary" }}>
        Drag a guest onto a seat or table, or tap a guest and then tap where they should sit.
      </Typography>
    </Paper>
  );
}

/** One chip per table: counts at a glance, and a large target for tapping or dropping a guest. */
export function TableStrip() {
  const plan = usePlan();
  const [over, setOver] = React.useState<string | null>(null);
  const armedId = plan.state.armed;

  return (
    <Box
      component="ul"
      aria-label="Tables"
      sx={{ display: "flex", flexWrap: "wrap", gap: 1, m: 0, p: 0, listStyle: "none" }}
    >
      {TABLES.map((t) => {
        const filled = plan.tableFill[t.id];
        const full = filled >= t.seats;
        const broken = (plan.brokenByTable[t.id] ?? []).length > 0;
        const selected = plan.state.selectedTable === t.id;
        return (
          <li key={t.id}>
            <Chip
              clickable
              onClick={() => {
                if (armedId) plan.place(armedId, t.id);
                else plan.selectTable(selected ? null : t.id);
              }}
              onDragOver={(e: React.DragEvent) => {
                e.preventDefault();
                setOver(t.id);
              }}
              onDragLeave={() => setOver(null)}
              onDrop={(e: React.DragEvent) => {
                e.preventDefault();
                const id = draggedId(plan, e);
                setOver(null);
                plan.setDragging(null);
                if (id) plan.place(id, t.id);
              }}
              variant={selected || over === t.id ? "filled" : "outlined"}
              color={broken ? "error" : selected || over === t.id ? "primary" : "default"}
              icon={broken ? <WarningAmber /> : undefined}
              aria-label={`${t.name}, ${filled} of ${t.seats} seats${full ? ", full" : ""}${broken ? ", rule broken" : ""}`}
              aria-pressed={selected}
              label={`${t.name} · ${filled}/${t.seats}`}
              sx={{ height: 40, borderRadius: 20, fontWeight: 600, px: 0.5 }}
            />
          </li>
        );
      })}
    </Box>
  );
}
```

```tsx components/ArmedBar.tsx
"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Close from "@mui/icons-material/Close";
import PersonOff from "@mui/icons-material/PersonOff";
import { TABLES, guestById } from "@/lib/data";
import { tint } from "@/lib/ui";
import { usePlan } from "./PlanProvider";

/** Shown while a guest is picked up: says what to do next and offers a plain select as an alternative to the plan. */
export default function ArmedBar() {
  const plan = usePlan();
  const id = plan.state.armed;
  if (!id) return null;
  const guest = guestById[id];
  const seated = plan.guestTable[id] !== null;

  return (
    <Paper
      variant="outlined"
      role="status"
      sx={{ p: 1.5, borderColor: "primary.main", bgcolor: tint("primary-main", 10) }}
    >
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5, alignItems: { sm: "center" } }}>
        <Typography variant="body2" sx={{ flex: 1 }}>
          {seated ? "Moving" : "Seating"} <strong>{guest.name}</strong>. Tap a seat or table on the plan, or press Esc to cancel.
        </Typography>
        <TextField
          select
          size="small"
          label="Or choose a table"
          value=""
          onChange={(e) => {
            if (e.target.value) plan.place(id, e.target.value);
          }}
          slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
          sx={{ minWidth: 200, bgcolor: "background.paper" }}
        >
          <option value="" disabled>
            Select…
          </option>
          {TABLES.map((t) => {
            const free = t.seats - plan.tableFill[t.id];
            const here = plan.guestTable[id] === t.id;
            return (
              <option key={t.id} value={t.id} disabled={here || free === 0}>
                {t.name} ({free} free)
              </option>
            );
          })}
        </TextField>
        {seated ? (
          <Button startIcon={<PersonOff />} variant="outlined" onClick={() => plan.unseat(id)}>
            Unseat
          </Button>
        ) : null}
        <Button startIcon={<Close />} onClick={() => plan.arm(null)}>
          Cancel
        </Button>
      </Box>
    </Paper>
  );
}
```

```tsx components/StatsBar.tsx
"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { usePlan } from "./PlanProvider";

function Tile({
  label,
  value,
  caption,
  children,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  caption: string;
  children?: React.ReactNode;
  tone?: "error" | "success";
}) {
  return (
    <Paper variant="outlined" sx={{ p: 1.75, minWidth: 0 }}>
      <Typography variant="overline" sx={{ color: "text.secondary", lineHeight: 1.4, display: "block" }}>
        {label}
      </Typography>
      <Typography variant="h5" component="p" sx={{ color: tone ? `${tone}.main` : "text.primary", lineHeight: 1.2 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {caption}
      </Typography>
      {children}
    </Paper>
  );
}

export default function StatsBar() {
  const { counts, unseated, results } = usePlan();
  const broken = results.filter((r) => r.status === "broken").length;
  const tentative = counts.seatedTotal - counts.seatedAttending;
  const pct = counts.attending ? (counts.seatedAttending / counts.attending) * 100 : 0;

  return (
    <Box
      aria-label="Seating counts"
      role="group"
      sx={{
        display: "grid",
        gap: 1.5,
        gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
      }}
    >
      <Tile label="Seated" value={`${counts.seatedAttending} of ${counts.attending}`} caption="attending guests with a seat">
        <LinearProgress
          variant="determinate"
          value={pct}
          aria-label="Share of attending guests seated"
          sx={{ mt: 1, height: 6, borderRadius: 3 }}
        />
      </Tile>
      <Tile
        label="Still to seat"
        value={unseated.length}
        caption={unseated.length === 0 ? "everyone attending is seated" : "attending guests without a seat"}
        tone={unseated.length === 0 ? "success" : undefined}
      />
      <Tile
        label="Free seats"
        value={counts.capacity - counts.seatedTotal}
        caption={`of ${counts.capacity}${tentative > 0 ? ` · ${tentative} held for unconfirmed guests` : ""}`}
      />
      <Tile
        label="Couple's rules"
        value={broken === 0 ? "All clear" : `${broken} broken`}
        caption={`${results.length} rules checked as you work`}
        tone={broken === 0 ? "success" : "error"}
      />
    </Box>
  );
}
```

```tsx components/UnseatedPanel.tsx
"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Search from "@mui/icons-material/Search";
import { guestById, type Guest } from "@/lib/data";
import { tint } from "@/lib/ui";
import GuestRow from "./GuestRow";
import { usePlan } from "./PlanProvider";

function byPartyThenName(a: Guest, b: Guest) {
  return a.party.localeCompare(b.party) || a.name.localeCompare(b.name);
}

export default function UnseatedPanel() {
  const plan = usePlan();
  const [q, setQ] = React.useState("");
  const [dropOver, setDropOver] = React.useState(false);

  const needle = q.trim().toLowerCase();
  const match = (g: Guest) =>
    !needle || g.name.toLowerCase().includes(needle) || g.party.toLowerCase().includes(needle) || (g.diet ?? "").toLowerCase().includes(needle);
  const list = plan.unseated.filter(match).sort(byPartyThenName);
  const awaiting = plan.awaiting.filter(match).sort(byPartyThenName);
  const dragSeated = plan.dragging !== null && plan.guestTable[plan.dragging] != null;

  return (
    <Paper
      variant="outlined"
      component="section"
      aria-labelledby="unseated-title"
      onDragOver={(e) => {
        if (dragSeated) {
          e.preventDefault();
          setDropOver(true);
        }
      }}
      onDragLeave={() => setDropOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDropOver(false);
        const id = plan.dragging ?? e.dataTransfer.getData("text/plain");
        plan.setDragging(null);
        if (id && guestById[id] && plan.guestTable[id]) plan.unseat(id);
      }}
      sx={{
        p: 1.5,
        borderStyle: dragSeated ? "dashed" : "solid",
        borderColor: dropOver ? "primary.main" : dragSeated ? "primary.main" : "divider",
        bgcolor: dropOver ? tint("primary-main", 10) : "background.paper",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Typography id="unseated-title" variant="subtitle1" component="h2" sx={{ fontWeight: 700 }}>
          Needs a seat
        </Typography>
        <Chip size="small" color={plan.unseated.length ? "warning" : "success"} label={plan.unseated.length} aria-label={`${plan.unseated.length} guests need a seat`} />
      </Box>

      {dragSeated ? (
        <Typography variant="body2" sx={{ py: 1, fontWeight: 600, color: "primary.main" }}>
          Drop here to unseat
        </Typography>
      ) : null}

      {plan.unseated.length > 4 ? (
        <TextField
          size="small"
          fullWidth
          placeholder="Filter by name, party or diet"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          slotProps={{
            htmlInput: { "aria-label": "Filter guests who need a seat" },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 1 }}
        />
      ) : null}

      {plan.unseated.length === 0 ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1.5, color: "success.main" }}>
          <CheckCircle fontSize="small" />
          <Typography variant="body2">Everyone attending has a seat.</Typography>
        </Box>
      ) : (
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, maxHeight: { lg: 340 }, overflowY: "auto" }}>
          {list.map((g) => (
            <li key={g.id}>
              <GuestRow guest={g} />
            </li>
          ))}
          {list.length === 0 ? (
            <Typography variant="body2" sx={{ py: 1, color: "text.secondary" }}>
              No one matches “{q}”.
            </Typography>
          ) : null}
        </Box>
      )}

      {awaiting.length > 0 ? (
        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: "divider" }}>
          <Typography variant="overline" component="h3" sx={{ lineHeight: 1.5, color: "text.secondary" }}>
            Not confirmed yet ({awaiting.length})
          </Typography>
          <Typography variant="caption" component="p" sx={{ mb: 0.5, color: "text.secondary" }}>
            You can hold a seat for them. They are not counted as attending.
          </Typography>
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
            {awaiting.map((g) => (
              <li key={g.id}>
                <GuestRow guest={g} />
              </li>
            ))}
          </Box>
        </Box>
      ) : null}
    </Paper>
  );
}
```

```tsx components/TablePanel.tsx
"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Close from "@mui/icons-material/Close";
import PersonOff from "@mui/icons-material/PersonOff";
import { guestById, tableById } from "@/lib/data";
import { ruleTitle } from "@/lib/seating";
import { tint } from "@/lib/ui";
import GuestRow from "./GuestRow";
import { usePlan } from "./PlanProvider";

export default function TablePanel() {
  const plan = usePlan();
  const id = plan.state.selectedTable;
  const table = id ? tableById[id] : null;

  if (!table) {
    return (
      <Paper variant="outlined" component="section" aria-labelledby="table-title" sx={{ p: 1.5 }}>
        <Typography id="table-title" variant="subtitle1" component="h2" sx={{ fontWeight: 700 }}>
          Table details
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
          Select a table on the plan to see who is sitting there and what they eat.
        </Typography>
      </Paper>
    );
  }

  const row = plan.state.seats[table.id];
  const guests = row.map((gid) => (gid ? guestById[gid] : null));
  const seated = guests.filter((g): g is NonNullable<typeof g> => g !== null);
  const dietCounts: Record<string, number> = {};
  for (const g of seated) if (g.diet) dietCounts[g.diet] = (dietCounts[g.diet] ?? 0) + 1;
  const dietEntries = Object.entries(dietCounts);
  const broken = plan.brokenByTable[table.id] ?? [];
  const armedId = plan.state.armed;

  return (
    <Paper variant="outlined" component="section" aria-labelledby="table-title" sx={{ p: 1.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography id="table-title" variant="subtitle1" component="h2" sx={{ fontWeight: 700 }}>
            {table.name}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {seated.length} of {row.length} seats filled · {row.length - seated.length} free
          </Typography>
        </Box>
        <IconButton aria-label="Close table details" size="small" onClick={() => plan.selectTable(null)}>
          <Close fontSize="small" />
        </IconButton>
      </Box>

      {broken.map((r) => (
        <Alert key={r.rule.id} severity="error" sx={{ mt: 1, py: 0 }}>
          <strong>{ruleTitle(r.rule)}.</strong> {r.message}
        </Alert>
      ))}

      <Box sx={{ mt: 1.25 }}>
        <Typography variant="overline" component="h3" sx={{ lineHeight: 1.5, color: "text.secondary" }}>
          Dietary needs
        </Typography>
        {dietEntries.length === 0 ? (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {seated.length === 0 ? "No one seated yet." : "No dietary needs at this table."}
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {dietEntries.map(([diet, n]) => (
              <Chip key={diet} size="small" color="warning" variant="outlined" label={`${diet} × ${n}`} />
            ))}
          </Box>
        )}
      </Box>

      <Box sx={{ mt: 1.25 }}>
        <Typography variant="overline" component="h3" sx={{ lineHeight: 1.5, color: "text.secondary" }}>
          Guests
        </Typography>
        <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0 }}>
          {guests.map((g, i) => (
            <li key={`${table.id}-${i}`}>
              {g ? (
                <GuestRow
                  guest={g}
                  lead={
                    <Typography variant="caption" sx={{ width: 14, textAlign: "right", color: "text.secondary" }} aria-hidden>
                      {i + 1}
                    </Typography>
                  }
                  action={
                    <IconButton aria-label={`Unseat ${g.name}`} size="small" onClick={() => plan.unseat(g.id)}>
                      <PersonOff fontSize="small" />
                    </IconButton>
                  }
                />
              ) : (
                <Box
                  role={armedId ? "button" : undefined}
                  tabIndex={armedId ? 0 : undefined}
                  aria-label={armedId ? `Seat ${guestById[armedId].name} in seat ${i + 1}` : undefined}
                  onClick={armedId ? () => plan.place(armedId, table.id, i) : undefined}
                  onKeyDown={
                    armedId
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            plan.place(armedId, table.id, i);
                          }
                        }
                      : undefined
                  }
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    px: 1,
                    minHeight: 40,
                    borderRadius: 1.5,
                    color: "text.secondary",
                    cursor: armedId ? "pointer" : "default",
                    "&:hover": armedId ? { bgcolor: tint("primary-main", 12) } : undefined,
                  }}
                >
                  <Typography variant="caption" sx={{ width: 14, textAlign: "right" }} aria-hidden>
                    {i + 1}
                  </Typography>
                  <Box
                    aria-hidden
                    sx={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px dashed", borderColor: "text.disabled" }}
                  />
                  <Typography variant="body2">{armedId ? "Empty seat: tap to place here" : "Empty seat"}</Typography>
                </Box>
              )}
            </li>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}
```

```tsx components/RulesPanel.tsx
"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import CheckCircle from "@mui/icons-material/CheckCircle";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import WarningAmber from "@mui/icons-material/WarningAmber";
import { RULE_LABEL, ruleTitle, type RuleResult, type RuleStatus } from "@/lib/seating";
import { tint } from "@/lib/ui";
import { usePlan } from "./PlanProvider";

const ORDER: Record<RuleStatus, number> = { broken: 0, open: 1, ok: 2 };
const STATUS_LABEL: Record<RuleStatus, string> = { broken: "Broken", open: "Waiting", ok: "Kept" };

function StatusIcon({ status }: { status: RuleStatus }) {
  if (status === "broken") return <WarningAmber color="error" fontSize="small" />;
  if (status === "ok") return <CheckCircle color="success" fontSize="small" />;
  return <InfoOutlined color="action" fontSize="small" />;
}

export default function RulesPanel() {
  const plan = usePlan();
  const sorted = [...plan.results].sort((a, b) => ORDER[a.status] - ORDER[b.status]);
  const broken = sorted.filter((r) => r.status === "broken").length;
  const ok = sorted.filter((r) => r.status === "ok").length;
  const open = sorted.length - broken - ok;

  const openRule = (r: RuleResult) => {
    const t = r.tables[0] ?? plan.guestTable[r.rule.guests.find((g) => plan.guestTable[g]) ?? ""] ?? null;
    if (t) plan.selectTable(t);
  };

  return (
    <Paper variant="outlined" component="section" aria-labelledby="rules-title" sx={{ p: 1.5 }}>
      <Typography id="rules-title" variant="subtitle1" component="h2" sx={{ fontWeight: 700 }}>
        The couple&apos;s rules
      </Typography>
      <Typography
        variant="body2"
        role="status"
        sx={{ mt: 0.5, mb: 1, color: broken ? "error.main" : "text.secondary", fontWeight: broken ? 600 : 400 }}
      >
        {broken > 0
          ? `${broken} ${broken === 1 ? "rule is" : "rules are"} broken. ${ok} kept, ${open} waiting on guests to be seated.`
          : `No rule is broken. ${ok} kept, ${open} waiting on guests to be seated.`}
      </Typography>

      <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1 }}>
        {sorted.map((r) => (
          <li key={r.rule.id}>
            <ButtonBase
              onClick={() => openRule(r)}
              disabled={r.tables.length === 0 && !r.rule.guests.some((g) => plan.guestTable[g])}
              sx={{
                width: "100%",
                display: "block",
                textAlign: "left",
                p: 1.25,
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: r.status === "broken" ? "error.main" : "divider",
                bgcolor: r.status === "broken" ? tint("error-main", 8) : "transparent",
                "&:focus-visible": { outline: "3px solid var(--mui-palette-primary-main)", outlineOffset: 1 },
              }}
            >
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <Box sx={{ pt: 0.25 }}>
                  <StatusIcon status={r.status} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                    <Chip size="small" variant="outlined" label={RULE_LABEL[r.rule.kind]} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: r.status === "broken" ? "error.main" : "text.secondary" }}>
                      {STATUS_LABEL[r.status]}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {ruleTitle(r.rule)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {r.message}
                  </Typography>
                  <Typography variant="caption" component="p" sx={{ fontStyle: "italic", mt: 0.25, color: "text.secondary" }}>
                    {r.rule.note}
                  </Typography>
                </Box>
              </Box>
            </ButtonBase>
          </li>
        ))}
      </Box>
    </Paper>
  );
}
```

```tsx app/page.tsx
import Box from "@mui/material/Box";
import ArmedBar from "@/components/ArmedBar";
import RulesPanel from "@/components/RulesPanel";
import RoomPlan, { TableStrip } from "@/components/RoomPlan";
import StatsBar from "@/components/StatsBar";
import TablePanel from "@/components/TablePanel";
import UnseatedPanel from "@/components/UnseatedPanel";

export default function Page() {
  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 }, maxWidth: 1680, mx: "auto" }}>
      <h1
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
        }}
      >
        Seating plan
      </h1>
      <StatsBar />
      <Box
        sx={{
          mt: 2,
          display: "grid",
          gap: 2,
          alignItems: "start",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 400px" },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0 }}>
          <ArmedBar />
          <RoomPlan />
          <TableStrip />
        </Box>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            alignItems: "start",
            gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))", lg: "minmax(0, 1fr)" },
            position: { lg: "sticky" },
            top: { lg: 128 },
            maxHeight: { lg: "calc(100dvh - 144px)" },
            overflowY: { lg: "auto" },
            pr: { lg: 0.5 },
          }}
        >
          <UnseatedPanel />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TablePanel />
            <RulesPanel />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
```

```tsx components/GuestsView.tsx
"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableFooter from "@mui/material/TableFooter";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Restaurant from "@mui/icons-material/Restaurant";
import Search from "@mui/icons-material/Search";
import {
  DIETS,
  EVENT,
  EVENT_DATE_LABEL,
  GUESTS,
  PARTIES,
  RSVP_LABEL,
  TABLES,
  tableById,
  type Guest,
  type Rsvp,
} from "@/lib/data";
import { partyColor, tint } from "@/lib/ui";
import { usePlan } from "./PlanProvider";

type SortKey = "name" | "party" | "rsvp" | "table";
type Seating = "all" | "seated" | "unseated";

const RSVP_ORDER: Record<Rsvp, number> = { yes: 0, maybe: 1, pending: 2, no: 3 };
const RSVP_COLOR: Record<Rsvp, "success" | "warning" | "default" | "error"> = {
  yes: "success",
  maybe: "warning",
  pending: "default",
  no: "error",
};

const STANDARD = "Standard menu";
const MEAL_ORDER = ["Vegetarian", "Vegan", "Pescatarian", "Gluten free", "Halal", "Nut allergy", "Soft food", "Children's menu"];
const MEALS: string[] = [
  STANDARD,
  ...MEAL_ORDER.filter((m) => DIETS.includes(m)),
  ...DIETS.filter((d) => !MEAL_ORDER.includes(d)),
];

const mealOf = (g: Guest) => g.diet ?? STANDARD;

// RSVPs do not change in a session, so the caterer's counts are fixed.
const MEAL_ROWS = MEALS.map((meal) => ({
  meal,
  confirmed: GUESTS.filter((g) => g.rsvp === "yes" && mealOf(g) === meal).length,
  possible: GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && mealOf(g) === meal).length,
}));
const CONFIRMED_TOTAL = MEAL_ROWS.reduce((n, r) => n + r.confirmed, 0);
const POSSIBLE_TOTAL = MEAL_ROWS.reduce((n, r) => n + r.possible, 0);
const DECLINED = GUESTS.filter((g) => g.rsvp === "no").length;
const DIET_ATTENDING = GUESTS.filter((g) => g.rsvp === "yes" && g.diet).length;

function Summary({ label, value, caption }: { label: string; value: number; caption: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.75, minWidth: 0 }}>
      <Typography variant="overline" sx={{ color: "text.secondary", lineHeight: 1.4, display: "block" }}>
        {label}
      </Typography>
      <Typography variant="h5" component="p" sx={{ lineHeight: 1.2 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {caption}
      </Typography>
    </Paper>
  );
}

export default function GuestsView() {
  const plan = usePlan();
  const [q, setQ] = React.useState("");
  const [party, setParty] = React.useState("all");
  const [rsvp, setRsvp] = React.useState<"all" | Rsvp>("all");
  const [diet, setDiet] = React.useState("all");
  const [seating, setSeating] = React.useState<Seating>("all");
  const [sort, setSort] = React.useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "name", dir: "asc" });

  const tableName = React.useCallback(
    (g: Guest) => {
      const t = plan.guestTable[g.id];
      return t ? tableById[t].name : "";
    },
    [plan.guestTable],
  );

  const rows = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = GUESTS.filter((g) => {
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === "none" && g.diet) return false;
      if (diet !== "all" && diet !== "none" && g.diet !== diet) return false;
      const seated = !!plan.guestTable[g.id];
      if (seating === "seated" && !seated) return false;
      if (seating === "unseated" && seated) return false;
      if (needle) {
        const hay = `${g.name} ${g.party} ${g.diet ?? ""} ${tableName(g)} ${RSVP_LABEL[g.rsvp]}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    const tableIndex = (g: Guest) => {
      const t = plan.guestTable[g.id];
      return t ? TABLES.findIndex((x) => x.id === t) : 999;
    };
    return list.sort((a, b) => {
      let c = 0;
      if (sort.key === "name") c = a.name.localeCompare(b.name);
      else if (sort.key === "party") c = a.party.localeCompare(b.party) || a.name.localeCompare(b.name);
      else if (sort.key === "rsvp") c = RSVP_ORDER[a.rsvp] - RSVP_ORDER[b.rsvp] || a.name.localeCompare(b.name);
      else c = tableIndex(a) - tableIndex(b) || a.name.localeCompare(b.name);
      return c * dir;
    });
  }, [q, party, rsvp, diet, seating, sort, plan.guestTable, tableName]);

  const filtersOn = q !== "" || party !== "all" || rsvp !== "all" || diet !== "all" || seating !== "all";
  const clear = () => {
    setQ("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
    setSeating("all");
  };

  const sortBy = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  const header = (key: SortKey, label: string) => (
    <TableSortLabel active={sort.key === key} direction={sort.key === key ? sort.dir : "asc"} onClick={() => sortBy(key)}>
      {label}
    </TableSortLabel>
  );
  const ariaSort = (key: SortKey): "ascending" | "descending" | "none" =>
    sort.key === key ? (sort.dir === "asc" ? "ascending" : "descending") : "none";

  // Meals by table, for the caterer's service plan (guests who are seated, by their current table).
  const byTable = React.useMemo(() => {
    return TABLES.map((t) => {
      const guests = plan.state.seats[t.id].filter((id): id is string => id !== null);
      const counts: Record<string, number> = {};
      for (const id of guests) {
        const g = GUESTS.find((x) => x.id === id);
        if (g && g.diet) counts[g.diet] = (counts[g.diet] ?? 0) + 1;
      }
      return { id: t.id, name: t.name, seated: guests.length, counts: Object.entries(counts) };
    });
  }, [plan.state.seats]);

  const copySummary = async () => {
    const lines = [
      `${EVENT.name}, ${EVENT_DATE_LABEL}, ${EVENT.venue}`,
      "Meals for the caterer (attending guests)",
      ...MEAL_ROWS.map((r) => `${r.meal}: ${r.confirmed}${r.possible ? ` (+${r.possible} if unconfirmed guests attend)` : ""}`),
      `Total: ${CONFIRMED_TOTAL}${POSSIBLE_TOTAL ? ` (+${POSSIBLE_TOTAL} unconfirmed)` : ""}`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      plan.notify("Meal counts copied to the clipboard.", "success");
    } catch {
      plan.notify("Could not copy. Select the meal counts and copy them by hand.", "warning");
    }
  };

  const selectSx = { minWidth: { xs: "100%", sm: 160 }, flex: { sm: "1 1 160px" } };
  const rowSx = {
    display: "flex",
    gap: 1,
    alignItems: "baseline",
    flexWrap: "wrap",
    py: 0.5,
    borderTop: 1,
    borderColor: tint("text-primary", 10),
  } as const;

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 }, maxWidth: 1680, mx: "auto" }}>
      <Typography variant="h5" component="h1" sx={{ mb: 0.5 }}>
        Guest list
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
        Every guest with their table, and the meals the caterer needs for {EVENT.name}.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
          mb: 2,
        }}
      >
        <Summary label="Attending" value={CONFIRMED_TOTAL} caption="confirmed yes" />
        <Summary label="Not confirmed" value={POSSIBLE_TOTAL} caption="maybe or awaiting reply" />
        <Summary label="Declined" value={DECLINED} caption="no seat needed" />
        <Summary label="Dietary needs" value={DIET_ATTENDING} caption="among attending guests" />
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          alignItems: "start",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 400px" },
        }}
      >
        <Paper variant="outlined" component="section" aria-label="Guests" sx={{ minWidth: 0, overflow: "hidden" }}>
          <Box sx={{ p: 1.5, borderBottom: 1, borderColor: "divider" }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25 }}>
              <TextField
                size="small"
                label="Search"
                placeholder="Name, party, diet or table"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                sx={{ flex: "2 1 240px", minWidth: { xs: "100%", sm: 240 } }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField select size="small" label="Party" value={party} onChange={(e) => setParty(e.target.value)} sx={selectSx} slotProps={{ select: { native: true } }}>
                <option value="all">All parties</option>
                {PARTIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="RSVP"
                value={rsvp}
                onChange={(e) => setRsvp(e.target.value as "all" | Rsvp)}
                sx={selectSx}
                slotProps={{ select: { native: true } }}
              >
                <option value="all">Any RSVP</option>
                {(Object.keys(RSVP_LABEL) as Rsvp[]).map((r) => (
                  <option key={r} value={r}>
                    {RSVP_LABEL[r]}
                  </option>
                ))}
              </TextField>
              <TextField select size="small" label="Diet" value={diet} onChange={(e) => setDiet(e.target.value)} sx={selectSx} slotProps={{ select: { native: true } }}>
                <option value="all">Any diet</option>
                <option value="none">No dietary need</option>
                {DIETS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Seating"
                value={seating}
                onChange={(e) => setSeating(e.target.value as Seating)}
                sx={selectSx}
                slotProps={{ select: { native: true } }}
              >
                <option value="all">Seated or not</option>
                <option value="seated">Seated</option>
                <option value="unseated">Not seated</option>
              </TextField>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
              <Typography variant="body2" role="status" sx={{ color: "text.secondary" }}>
                Showing {rows.length} of {GUESTS.length} guests
              </Typography>
              {filtersOn ? (
                <Button size="small" onClick={clear}>
                  Clear filters
                </Button>
              ) : null}
            </Box>
          </Box>

          <TableContainer sx={{ maxHeight: { lg: "calc(100dvh - 330px)" } }}>
            <Table size="small" stickyHeader aria-label="Guest list">
              <TableHead>
                <TableRow>
                  <TableCell aria-sort={ariaSort("name")}>{header("name", "Guest")}</TableCell>
                  <TableCell aria-sort={ariaSort("party")} sx={{ display: { xs: "none", md: "table-cell" } }}>
                    {header("party", "Party")}
                  </TableCell>
                  <TableCell aria-sort={ariaSort("rsvp")} sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    {header("rsvp", "RSVP")}
                  </TableCell>
                  <TableCell>Diet</TableCell>
                  <TableCell aria-sort={ariaSort("table")}>{header("table", "Table")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((g) => {
                  const c = partyColor(g.party);
                  const t = plan.guestTable[g.id];
                  return (
                    <TableRow key={g.id} hover>
                      <TableCell component="th" scope="row" sx={{ minWidth: 150 }}>
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                          <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: "50%", flexShrink: 0, bgcolor: c.tint, border: `2px solid ${c.solid}` }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {g.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary", display: { xs: "block", md: "none" } }}>
                              {g.party}
                              <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                                {" · "}
                                {RSVP_LABEL[g.rsvp]}
                              </Box>
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{g.party}</TableCell>
                      <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                        <Chip size="small" variant="outlined" color={RSVP_COLOR[g.rsvp]} label={RSVP_LABEL[g.rsvp]} />
                      </TableCell>
                      <TableCell>
                        {g.diet ? (
                          <Chip size="small" color="warning" variant="outlined" label={g.diet} />
                        ) : (
                          <Typography variant="body2" aria-label="No dietary need" sx={{ color: "text.disabled" }}>
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ minWidth: 150 }}>
                        {g.rsvp === "no" ? (
                          <Typography variant="body2" sx={{ color: "text.disabled" }}>
                            Not coming
                          </Typography>
                        ) : (
                          <TextField
                            select
                            size="small"
                            value={t ?? ""}
                            onChange={(e) => (e.target.value ? plan.place(g.id, e.target.value) : plan.unseat(g.id))}
                            slotProps={{ select: { native: true }, htmlInput: { "aria-label": `Table for ${g.name}` } }}
                            sx={{ minWidth: 140 }}
                          >
                            <option value="">Not seated</option>
                            {TABLES.map((tb) => {
                              const free = tb.seats - plan.tableFill[tb.id];
                              return (
                                <option key={tb.id} value={tb.id} disabled={free === 0 && tb.id !== t}>
                                  {tb.name} ({free} free)
                                </option>
                              );
                            })}
                          </TextField>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography variant="body2" sx={{ py: 3, textAlign: "center", color: "text.secondary" }}>
                        No guests match these filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            position: { lg: "sticky" },
            top: { lg: 128 },
            maxHeight: { lg: "calc(100dvh - 144px)" },
            overflowY: { lg: "auto" },
          }}
        >
          <Paper variant="outlined" component="section" aria-labelledby="meals-title" sx={{ p: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Restaurant fontSize="small" color="primary" />
                <Typography id="meals-title" variant="subtitle1" component="h2" sx={{ fontWeight: 700 }}>
                  Meals for the caterer
                </Typography>
              </Box>
              <Button size="small" startIcon={<ContentCopy fontSize="small" />} onClick={copySummary}>
                Copy
              </Button>
            </Box>
            <Typography variant="caption" component="p" sx={{ mb: 1, color: "text.secondary" }}>
              Confirmed guests, by menu. The last column adds guests who have not replied yet. Select a menu to filter the list.
            </Typography>
            <Table size="small" aria-label="Meal counts">
              <TableHead>
                <TableRow>
                  <TableCell>Menu</TableCell>
                  <TableCell align="right">Confirmed</TableCell>
                  <TableCell align="right">If all reply yes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {MEAL_ROWS.map((r) => {
                  const key = r.meal === STANDARD ? "none" : r.meal;
                  const active = diet === key;
                  return (
                    <TableRow key={r.meal} selected={active}>
                      <TableCell component="th" scope="row" sx={{ p: 0 }}>
                        <Box
                          component="button"
                          type="button"
                          onClick={() => {
                            setDiet(active ? "all" : key);
                            setRsvp(active ? "all" : "yes");
                          }}
                          aria-pressed={active}
                          sx={{
                            all: "unset",
                            boxSizing: "border-box",
                            width: "100%",
                            cursor: "pointer",
                            px: 2,
                            py: 1.25,
                            fontSize: "0.875rem",
                            fontWeight: active ? 700 : 500,
                            color: "text.primary",
                            "&:hover": { textDecoration: "underline" },
                            "&:focus-visible": { outline: "3px solid var(--mui-palette-primary-main)", outlineOffset: -3 },
                          }}
                        >
                          {r.meal}
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {r.confirmed}
                      </TableCell>
                      <TableCell align="right" sx={{ color: "text.secondary" }}>
                        {r.confirmed + r.possible}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Total meals</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {CONFIRMED_TOTAL}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {CONFIRMED_TOTAL + POSSIBLE_TOTAL}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </Paper>

          <Paper variant="outlined" component="section" aria-labelledby="bytable-title" sx={{ p: 1.5 }}>
            <Typography id="bytable-title" variant="subtitle1" component="h2" sx={{ fontWeight: 700 }}>
              Special meals by table
            </Typography>
            <Typography variant="caption" component="p" sx={{ mb: 1, color: "text.secondary" }}>
              Follows the seating plan as it stands now. Everyone else has the standard menu.
            </Typography>
            <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 0.75 }}>
              {byTable.map((t) => (
                <Box key={t.id} component="li" sx={rowSx}>
                  <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 76 }}>
                    {t.name}
                  </Typography>
                  <Typography variant="caption" sx={{ minWidth: 56, color: "text.secondary" }}>
                    {t.seated} seated
                  </Typography>
                  {t.counts.length === 0 ? (
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {t.seated === 0 ? "empty" : "standard only"}
                    </Typography>
                  ) : (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {t.counts.map(([d, n]) => (
                        <Chip key={d} size="small" color="warning" variant="outlined" label={`${d} × ${n}`} />
                      ))}
                    </Box>
                  )}
                </Box>
              ))}
              <Box component="li" sx={rowSx}>
                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 76 }}>
                  Not seated
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {plan.unseated.length} attending guests still to place
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
```

```tsx app/guests/page.tsx
import GuestsView from "@/components/GuestsView";

export default function Page() {
  return <GuestsView />;
}
```

```ts app/theme.ts
"use client";

import { createTheme } from "@mui/material/styles";

// Official Next.js App Router setup: CSS variables with light and dark schemes.
// System font stack, no network font fetch at build.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#4a43b8" },
        secondary: { main: "#9a6b1f" },
        background: { default: "#f4f3ef", paper: "#ffffff" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#a29bff" },
        secondary: { main: "#e0b565" },
        background: { default: "#101119", paper: "#181a25" },
      },
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    h5: { fontWeight: 700, letterSpacing: "-0.01em" },
    h6: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
  },
});

export default theme;
```

```tsx app/layout.tsx
import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { ThemeProvider } from "@mui/material/styles";
import AppShell from "@/components/AppShell";
import PlanProvider from "@/components/PlanProvider";
import theme from "./theme";

export const metadata: Metadata = {
  title: "Seatwise",
  description: "Seating plans for wedding and event planners.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <InitColorSchemeScript attribute="class" />
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <PlanProvider>
              <AppShell>{children}</AppShell>
            </PlanProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
```
