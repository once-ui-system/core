```ts lib/data.ts
export type Rsvp = "yes" | "maybe" | "pending" | "no";

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

export interface Guest {
  id: string;
  name: string;
  party: string;
  rsvp: Rsvp;
  diet: string | null;
  table: string | null;
}

export type RuleKind = "together" | "apart" | "near";

export interface Rule {
  id: string;
  kind: RuleKind;
  guests: string[];
  note: string;
  /** Shown under the rule when its note and its guests disagree. */
  caution?: string;
}

export const APP = {
  name: "Seatwise",
  tagline: "A seating planner for wedding and event planners",
};

export const EVENT = {
  name: "Ines & Mateo's wedding dinner",
  date: "2027-06-19",
  venue: "The Orangery, Hollin Hall",
  room_m: { width: 24, depth: 14 },
};

export const ROOM = EVENT.room_m;

export const PLANNER = { name: "Hannah Brook" };

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
  {
    id: "r-3",
    kind: "apart",
    guests: ["g-29", "g-30"],
    note: "Brothers Sean and Ryan Doyle are not speaking",
    caution:
      "The note names Sean and Ryan Doyle, but this rule is set on Kai Brennan and Sean Doyle. Worth confirming with the couple.",
  },
  {
    id: "r-4",
    kind: "apart",
    guests: ["g-12", "g-34"],
    note: "Ask the couple: old family dispute",
  },
  {
    id: "r-5",
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
  },
];

export const RULE_KIND_LABEL: Record<RuleKind, string> = {
  together: "Keep together",
  apart: "Keep apart",
  near: "Seat near",
};

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Awaiting reply",
  no: "Declined",
};

export const RSVP_COLOR: Record<Rsvp, string> = {
  yes: "green",
  maybe: "yellow",
  pending: "gray",
  no: "red",
};

const PARTY_COLOR: Record<string, string> = {
  Couple: "pink",
  "Bride's family": "grape",
  "Groom's family": "blue",
  "University friends": "teal",
  "Work friends": "orange",
  "Groom's football club": "lime",
  "Plus-ones": "gray",
};

export const PARTIES: string[] = Object.keys(PARTY_COLOR);

export function partyColor(party: string): string {
  return PARTY_COLOR[party] ?? "gray";
}

const DIET_COLOR: Record<string, string> = {
  Vegetarian: "green",
  Vegan: "lime",
  "Gluten free": "yellow",
  "Soft food": "cyan",
  "Nut allergy": "red",
  Halal: "indigo",
  Pescatarian: "blue",
  "Children's menu": "pink",
};

export function dietColor(diet: string): string {
  return DIET_COLOR[diet] ?? "gray";
}

export const DIETS: string[] = Object.keys(DIET_COLOR);

export const STANDARD_MEAL = "Standard menu";

export function mealLabel(g: Guest): string {
  return g.diet ?? STANDARD_MEAL;
}

export const GUEST_BY_ID: Record<string, Guest> = Object.fromEntries(GUESTS.map((g) => [g.id, g]));
export const TABLE_BY_ID: Record<string, TableDef> = Object.fromEntries(TABLES.map((t) => [t.id, t]));

export function shortName(name: string): string {
  const parts = name.split(" ");
  if (parts[0] === "Avó" && parts[1]) return parts[1];
  return parts[0];
}

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0] === "Avó" && parts[1] ? parts[1] : parts[0];
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  return ((first?.[0] ?? "") + (last?.[0] ?? "")).toUpperCase();
}

export function formatEventDate(): string {
  return new Date(EVENT.date + "T00:00:00Z").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export interface MealRow {
  meal: string;
  confirmed: number;
  awaiting: number;
}

/** Meals for everyone who has not declined: confirmed (yes) and still open (maybe, pending). */
export function mealCounts(): MealRow[] {
  const map = new Map<string, MealRow>();
  for (const g of GUESTS) {
    if (g.rsvp === "no") continue;
    const meal = mealLabel(g);
    const row = map.get(meal) ?? { meal, confirmed: 0, awaiting: 0 };
    if (g.rsvp === "yes") row.confirmed += 1;
    else row.awaiting += 1;
    map.set(meal, row);
  }
  return Array.from(map.values()).sort((a, b) => {
    if (a.meal === STANDARD_MEAL) return -1;
    if (b.meal === STANDARD_MEAL) return 1;
    return b.confirmed + b.awaiting - (a.confirmed + a.awaiting) || a.meal.localeCompare(b.meal);
  });
}
```

```ts lib/seating.ts
import {
  FIXTURES,
  GUESTS,
  GUEST_BY_ID,
  RULES,
  RULE_KIND_LABEL,
  TABLES,
  TABLE_BY_ID,
  type Fixture,
  type Rule,
  type TableDef,
} from "./data";

/** For each table, the guest id in every seat (null = empty). */
export type Seats = Record<string, (string | null)[]>;
export type SeatIndex = Record<string, { table: string; seat: number }>;

export function initialSeats(): Seats {
  const seats: Seats = {};
  for (const t of TABLES) seats[t.id] = Array.from({ length: t.seats }, () => null);
  for (const g of GUESTS) {
    if (!g.table) continue;
    const row = seats[g.table];
    const free = row.indexOf(null);
    if (free >= 0) row[free] = g.id;
  }
  return seats;
}

export function buildIndex(seats: Seats): SeatIndex {
  const index: SeatIndex = {};
  for (const tableId of Object.keys(seats)) {
    seats[tableId].forEach((guestId, seat) => {
      if (guestId) index[guestId] = { table: tableId, seat };
    });
  }
  return index;
}

export function freeSeats(seats: Seats, tableId: string): number {
  return seats[tableId].filter((s) => s === null).length;
}

export type PlaceResult =
  | { ok: true; seats: Seats; seat: number; swapped?: string; changed: boolean; moved: boolean }
  | { ok: false; reason: string };

function cloneSeats(seats: Seats): Seats {
  const next: Seats = {};
  for (const k of Object.keys(seats)) next[k] = seats[k].slice();
  return next;
}

/** Seat a guest (new or already seated). A wanted seat that is taken swaps two seated guests. */
export function placeGuest(seats: Seats, guestId: string, tableId: string, want?: number): PlaceResult {
  const table = TABLE_BY_ID[tableId];
  const index = buildIndex(seats);
  const from = index[guestId];
  if (from && from.table === tableId && (want === undefined || want === from.seat)) {
    return { ok: true, seats, seat: from.seat, changed: false, moved: true };
  }
  const next = cloneSeats(seats);
  if (from) next[from.table][from.seat] = null;
  const row = next[tableId];
  let seat = -1;
  if (want !== undefined && want >= 0 && want < row.length) {
    const occupant = row[want];
    if (occupant === null) {
      seat = want;
    } else if (from) {
      row[want] = guestId;
      next[from.table][from.seat] = occupant;
      return { ok: true, seats: next, seat: want, swapped: occupant, changed: true, moved: true };
    }
  }
  if (seat < 0) seat = row.indexOf(null);
  if (seat < 0) return { ok: false, reason: `${table.name} is full. Pick another table or free a seat first.` };
  row[seat] = guestId;
  return { ok: true, seats: next, seat, changed: true, moved: Boolean(from) };
}

export function removeGuest(seats: Seats, guestId: string): Seats {
  const from = buildIndex(seats)[guestId];
  if (!from) return seats;
  const next = cloneSeats(seats);
  next[from.table][from.seat] = null;
  return next;
}

/* ---------- Rules ---------- */

export type RuleLevel = "ok" | "broken" | "open";

export interface RuleResult {
  rule: Rule;
  kindLabel: string;
  level: RuleLevel;
  headline: string;
  detail: string;
  /** Tables the rule touches right now. */
  tables: string[];
  guestIds: string[];
}

/** A guest meant to sit near the garden doors must be within this distance of them. */
export const NEAR_MAX_M = 4.5;
/** ...and at least this far from the band. */
export const AWAY_MIN_M = 8;

const DOOR = FIXTURES.find((f) => f.kind === "door") as Fixture;
const STAGE = FIXTURES.find((f) => f.kind === "stage") as Fixture;

export function distanceTo(t: TableDef, f: Fixture): number {
  return Math.hypot(t.x - (f.x + f.w / 2), t.y - (f.y + f.h / 2));
}

const m = (n: number) => `${n.toFixed(1)} m`;

function nearestGoodTable(): TableDef | undefined {
  return TABLES.filter((t) => distanceTo(t, STAGE) >= AWAY_MIN_M).sort(
    (a, b) => distanceTo(a, DOOR) - distanceTo(b, DOOR),
  )[0];
}

export function evaluateRules(seats: Seats, index: SeatIndex): RuleResult[] {
  return RULES.map((rule): RuleResult => {
    const names = rule.guests.map((id) => GUEST_BY_ID[id].name);
    const places = rule.guests.map((id) => index[id]);
    const base = { rule, kindLabel: RULE_KIND_LABEL[rule.kind], guestIds: rule.guests };
    const tn = (id: string) => TABLE_BY_ID[id].name;
    const seatedTables = Array.from(new Set(places.filter(Boolean).map((p) => p.table)));

    if (rule.kind === "together") {
      const [a, b] = places;
      if (a && b) {
        if (a.table === b.table) {
          return { ...base, level: "ok", headline: `${names[0]} and ${names[1]} sit together at ${tn(a.table)}`, detail: "Rule kept.", tables: seatedTables };
        }
        return {
          ...base,
          level: "broken",
          headline: `${names[0]} and ${names[1]} are at different tables`,
          detail: `${names[0]} is at ${tn(a.table)} and ${names[1]} at ${tn(b.table)}. Seat them at one table.`,
          tables: seatedTables,
        };
      }
      if (a || b) {
        const seated = a ?? b;
        const waiting = a ? names[1] : names[0];
        const sitting = a ? names[0] : names[1];
        const free = freeSeats(seats, seated.table);
        return {
          ...base,
          level: "open",
          headline: `${waiting} still needs a seat next to ${sitting}`,
          detail: `${sitting} is at ${tn(seated.table)}, which has ${free} free ${free === 1 ? "seat" : "seats"}.`,
          tables: seatedTables,
        };
      }
      return { ...base, level: "open", headline: `${names[0]} and ${names[1]} are not seated yet`, detail: "Seat them at the same table.", tables: [] };
    }

    if (rule.kind === "apart") {
      const [a, b] = places;
      if (a && b && a.table === b.table) {
        return {
          ...base,
          level: "broken",
          headline: `${names[0]} and ${names[1]} are both at ${tn(a.table)}`,
          detail: "Move one of them to another table.",
          tables: [a.table],
        };
      }
      return {
        ...base,
        level: "ok",
        headline: `${names[0]} and ${names[1]} are kept apart`,
        detail: a && b ? `${tn(a.table)} and ${tn(b.table)}.` : "Not both seated yet, so nothing to clash.",
        tables: seatedTables,
      };
    }

    // near: the garden doors, away from the band
    const best = nearestGoodTable();
    const [p] = places;
    if (!p) {
      return {
        ...base,
        level: "open",
        headline: `${names[0]} is not seated yet`,
        detail: best ? `${best.name} is the best fit: ${m(distanceTo(best, DOOR))} from the garden doors, ${m(distanceTo(best, STAGE))} from the band.` : "",
        tables: [],
      };
    }
    const t = TABLE_BY_ID[p.table];
    const dDoor = distanceTo(t, DOOR);
    const dStage = distanceTo(t, STAGE);
    if (dDoor <= NEAR_MAX_M && dStage >= AWAY_MIN_M) {
      return {
        ...base,
        level: "ok",
        headline: `${names[0]} is near the garden doors`,
        detail: `${t.name} is ${m(dDoor)} from the doors and ${m(dStage)} from the band.`,
        tables: [t.id],
      };
    }
    const problems: string[] = [];
    if (dDoor > NEAR_MAX_M) problems.push(`${m(dDoor)} from the garden doors (aim for ${m(NEAR_MAX_M)} or less)`);
    if (dStage < AWAY_MIN_M) problems.push(`only ${m(dStage)} from the band`);
    return {
      ...base,
      level: "broken",
      headline: `${names[0]} is not near the garden doors`,
      detail: `${t.name} is ${problems.join(" and ")}.${best ? ` ${best.name} is the closest fit.` : ""}`,
      tables: [t.id],
    };
  });
}
```

```tsx lib/plan.tsx
"use client";

import { notifications } from "@mantine/notifications";
import { VisuallyHidden } from "@mantine/core";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { GUESTS, GUEST_BY_ID, TABLES, TABLE_BY_ID, type Guest } from "./data";
import {
  buildIndex,
  evaluateRules,
  initialSeats,
  placeGuest,
  removeGuest,
  type RuleResult,
  type SeatIndex,
  type Seats,
} from "./seating";

export interface PlanStats {
  seated: number;
  capacity: number;
  empty: number;
  attending: number;
  unseatedAttending: number;
  broken: number;
  rules: number;
  open: number;
}

interface PlanContextValue {
  seats: Seats;
  index: SeatIndex;
  results: RuleResult[];
  tableFlags: Record<string, RuleResult[]>;
  flaggedGuests: Set<string>;
  stats: PlanStats;
  unseatedAttending: Guest[];
  unseatedTentative: Guest[];
  selectedTable: string | null;
  selectTable: (id: string | null) => void;
  held: string | null;
  hold: (guestId: string | null) => void;
  dragging: string | null;
  setDragging: (guestId: string | null) => void;
  seatGuest: (guestId: string, tableId: string, seat?: number) => boolean;
  unseat: (guestId: string) => void;
  undo: () => void;
  canUndo: boolean;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [seats, setSeats] = useState<Seats>(initialSeats);
  const [history, setHistory] = useState<Seats[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [held, setHeld] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const index = useMemo(() => buildIndex(seats), [seats]);
  const results = useMemo(() => evaluateRules(seats, index), [seats, index]);

  const { tableFlags, flaggedGuests } = useMemo(() => {
    const flags: Record<string, RuleResult[]> = {};
    const guests = new Set<string>();
    for (const r of results) {
      if (r.level !== "broken") continue;
      for (const t of r.tables) (flags[t] ??= []).push(r);
      for (const g of r.guestIds) if (index[g]) guests.add(g);
    }
    return { tableFlags: flags, flaggedGuests: guests };
  }, [results, index]);

  const unseatedAttending = useMemo(() => GUESTS.filter((g) => g.rsvp === "yes" && !index[g.id]), [index]);
  const unseatedTentative = useMemo(
    () => GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !index[g.id]),
    [index],
  );

  const stats = useMemo<PlanStats>(() => {
    const seated = Object.keys(index).length;
    const capacity = TABLES.reduce((n, t) => n + t.seats, 0);
    return {
      seated,
      capacity,
      empty: capacity - seated,
      attending: GUESTS.filter((g) => g.rsvp === "yes").length,
      unseatedAttending: unseatedAttending.length,
      broken: results.filter((r) => r.level === "broken").length,
      rules: results.length,
      open: results.filter((r) => r.level === "open").length,
    };
  }, [index, results, unseatedAttending]);

  const say = useCallback((message: string, color: string = "moss") => {
    setAnnouncement(message);
    notifications.show({ message, color, autoClose: 2600, withCloseButton: false });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHeld(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const seatGuest = useCallback(
    (guestId: string, tableId: string, seat?: number): boolean => {
      const guest = GUEST_BY_ID[guestId];
      const table = TABLE_BY_ID[tableId];
      if (!guest || !table) return false;
      if (guest.rsvp === "no") {
        say(`${guest.name} has declined, so they cannot be seated.`, "red");
        return false;
      }
      const res = placeGuest(seats, guestId, tableId, seat);
      if (!res.ok) {
        say(res.reason, "red");
        return false;
      }
      setHeld(null);
      if (!res.changed) return true;
      setHistory((h) => [...h.slice(-29), seats]);
      setSeats(res.seats);
      const text = res.swapped
        ? `${guest.name} and ${GUEST_BY_ID[res.swapped].name} swapped seats at ${table.name}.`
        : `${guest.name} ${res.moved ? "moved to" : "seated at"} ${table.name}, seat ${res.seat + 1}.`;
      const before = results.filter((r) => r.level === "broken").length;
      const after = evaluateRules(res.seats, buildIndex(res.seats)).filter((r) => r.level === "broken");
      if (after.length > before) say(`${text} This breaks a rule: ${after[after.length - 1].headline}.`, "orange");
      else say(text);
      return true;
    },
    [seats, results, say],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const guest = GUEST_BY_ID[guestId];
      if (!index[guestId]) return;
      setHistory((h) => [...h.slice(-29), seats]);
      setSeats(removeGuest(seats, guestId));
      setHeld((h) => (h === guestId ? null : h));
      say(`${guest.name} is unseated.`, "gray");
    },
    [seats, index, say],
  );

  const undo = useCallback(() => {
    const prev = history[history.length - 1];
    if (!prev) return;
    setSeats(prev);
    setHistory((h) => h.slice(0, -1));
    setHeld(null);
    say("Last change undone.", "gray");
  }, [history, say]);

  const value = useMemo<PlanContextValue>(
    () => ({
      seats,
      index,
      results,
      tableFlags,
      flaggedGuests,
      stats,
      unseatedAttending,
      unseatedTentative,
      selectedTable,
      selectTable: setSelectedTable,
      held,
      hold: setHeld,
      dragging,
      setDragging,
      seatGuest,
      unseat,
      undo,
      canUndo: history.length > 0,
    }),
    [seats, index, results, tableFlags, flaggedGuests, stats, unseatedAttending, unseatedTentative, selectedTable, held, dragging, seatGuest, unseat, undo, history.length],
  );

  return (
    <PlanContext.Provider value={value}>
      {children}
      <VisuallyHidden aria-live="polite" role="status">
        {announcement}
      </VisuallyHidden>
    </PlanContext.Provider>
  );
}
```

```css components/seatwise.module.css
.frame {
  min-height: 100dvh;
  background: #f4f3ee;
  color: var(--mantine-color-text);
}

.skip {
  position: absolute;
  left: -999px;
  top: 8px;
  z-index: 1000;
  background: #fff;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
}
.skip:focus {
  left: 8px;
}

.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--mantine-color-gray-3);
}

.headerInner {
  max-width: 1720px;
  margin: 0 auto;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: inherit;
  font-weight: 700;
  font-size: 1.15rem;
  letter-spacing: -0.01em;
}

.brandMark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--mantine-color-moss-7);
  color: #fff;
  display: grid;
  place-items: center;
}

.main {
  max-width: 1720px;
  margin: 0 auto;
  padding: 20px 16px 56px;
}

.layout {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr);
}

.aside {
  display: grid;
  gap: 16px;
  align-content: start;
  min-width: 0;
}

@media (min-width: 48em) {
  .aside {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }
}

@media (min-width: 90em) {
  .layout {
    grid-template-columns: minmax(0, 1fr) 400px;
    align-items: start;
  }
  .aside {
    grid-template-columns: minmax(0, 1fr);
    position: sticky;
    top: 74px;
    max-height: calc(100dvh - 90px);
    overflow-y: auto;
    padding-right: 2px;
  }
}

.card {
  background: #fff;
  border: 1px solid var(--mantine-color-gray-3);
  border-radius: 14px;
  padding: 14px;
}

/* ---------- Room ---------- */

.roomScroll {
  overflow-x: auto;
  border-radius: 16px;
  border: 1px solid var(--mantine-color-gray-3);
  background: #fff;
  padding: 12px;
}

.room {
  position: relative;
  min-width: 960px;
  width: 100%;
  aspect-ratio: 24 / 14;
  container-type: inline-size;
  border-radius: 6px;
  background-color: #fbfaf6;
  background-image:
    linear-gradient(to right, rgba(60, 50, 30, 0.07) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(60, 50, 30, 0.07) 1px, transparent 1px);
  background-size: calc(100% / 24) calc(100% / 14);
  box-shadow: inset 0 0 0 3px #3b3a36;
}

.fixture {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: max(9px, 1.05cqw);
  font-weight: 600;
  user-select: none;
}

.stage {
  background: #3d4451;
  color: #fff;
  border-radius: 6px 6px 2px 2px;
}

.dance {
  background: repeating-conic-gradient(#efe6d2 0% 25%, #f8f1e1 0% 50%) 0 0 / 2.5cqw 2.5cqw;
  border: 1px dashed #c9b88f;
  color: #6f5d33;
  border-radius: 4px;
  letter-spacing: 0.03em;
}

.bar {
  background: #7a5236;
  color: #fff;
  border-radius: 6px;
}

.door {
  background: #2f8f6b;
  color: #fff;
  writing-mode: vertical-rl;
  letter-spacing: 0.06em;
  font-size: max(8px, 0.85cqw);
  border-radius: 0 4px 4px 0;
}

.group {
  position: absolute;
  border-radius: 50%;
  transition: background 0.15s ease, box-shadow 0.15s ease;
}

.groupLong {
  border-radius: 28px;
}

.groupOver {
  background: rgba(47, 138, 104, 0.12);
  box-shadow: inset 0 0 0 2px var(--mantine-color-moss-6);
}

.disc {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.15em;
  padding: 0;
  background: #fff;
  border: 2px solid #cfcab9;
  border-radius: 50%;
  color: #2b2a27;
  font: inherit;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.discLong {
  border-radius: 12px;
}

.disc:hover {
  border-color: var(--mantine-color-moss-5);
}

.discSelected {
  border-color: var(--mantine-color-moss-7);
  box-shadow: 0 0 0 4px rgba(47, 138, 104, 0.28);
}

.discFlag {
  border-color: #e03131;
  box-shadow: 0 0 0 4px rgba(224, 49, 49, 0.22);
}

.tName {
  font-size: max(10px, 1.2cqw);
  font-weight: 700;
  line-height: 1.1;
}

.tCount {
  font-size: max(9px, 1cqw);
  color: #6b675c;
  font-variant-numeric: tabular-nums;
}

.flagBadge {
  position: absolute;
  top: -0.5em;
  right: -0.5em;
  width: 1.9em;
  height: 1.9em;
  border-radius: 50%;
  background: #e03131;
  color: #fff;
  display: grid;
  place-items: center;
  font-size: max(9px, 1cqw);
  font-weight: 800;
  border: 2px solid #fff;
}

.seat {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.35em;
  border: 1.5px solid var(--seat-bd, #b8b3a2);
  background: var(--seat-bg, #fff);
  color: var(--seat-fg, #333);
  border-radius: 999px;
  font: inherit;
  font-size: max(9px, 1.02cqw);
  font-weight: 600;
  white-space: nowrap;
  cursor: grab;
  z-index: 1;
}

.seat:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 3;
}

.seat:focus-visible,
.disc:focus-visible {
  outline: 3px solid #1c7ed6;
  outline-offset: 2px;
  z-index: 4;
}

.seatName {
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.seatEmpty {
  background: rgba(255, 255, 255, 0.55);
  border: 1.5px dashed #b8b3a2;
  color: #8d8877;
  cursor: pointer;
  font-weight: 500;
}

.seatTarget {
  border-color: var(--mantine-color-moss-6);
  color: var(--mantine-color-moss-8);
  background: rgba(47, 138, 104, 0.12);
  animation: seatPulse 1.4s ease-in-out infinite;
}

.seatOver {
  background: rgba(47, 138, 104, 0.35);
  border-style: solid;
}

.seatHeld {
  box-shadow: 0 0 0 3px var(--mantine-color-moss-6);
}

.seatFlag {
  box-shadow: 0 0 0 2.5px #e03131;
}

.dietDot {
  position: absolute;
  top: -0.25em;
  right: -0.1em;
  width: 0.75em;
  height: 0.75em;
  border-radius: 50%;
  background: #f08c00;
  border: 1.5px solid #fff;
}

@keyframes seatPulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(47, 138, 104, 0.35);
  }
  50% {
    box-shadow: 0 0 0 5px rgba(47, 138, 104, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .seatTarget {
    animation: none;
  }
}

/* ---------- Guest rows ---------- */

.guestRow {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 4px 4px 6px;
  border-radius: 12px;
  border: 1px solid var(--mantine-color-gray-2);
  background: #fff;
}

.guestRow[data-held="true"] {
  border-color: var(--mantine-color-moss-6);
  background: var(--mantine-color-moss-0);
  box-shadow: 0 0 0 2px var(--mantine-color-moss-3);
}

.guestRow[draggable="true"] {
  cursor: grab;
}

.guestMain {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 4px;
  border-radius: 10px;
  text-align: left;
}

.guestMain:hover {
  background: var(--mantine-color-gray-0);
}

.tableRow {
  display: block;
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--mantine-color-gray-3);
  background: #fff;
}

.tableRow:hover {
  background: var(--mantine-color-gray-0);
}

.tableRow[data-selected="true"] {
  border-color: var(--mantine-color-moss-6);
  background: var(--mantine-color-moss-0);
}

/* ---------- Guests page ---------- */

.guestsLayout {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    "meals"
    "list";
}

.meals {
  grid-area: meals;
  min-width: 0;
}

.list {
  grid-area: list;
  min-width: 0;
}

@media (min-width: 75em) {
  .guestsLayout {
    grid-template-columns: minmax(0, 1fr) 380px;
    grid-template-areas: "list meals";
    align-items: start;
  }
  .meals {
    position: sticky;
    top: 74px;
  }
}

@media print {
  .noPrint {
    display: none !important;
  }
  .frame {
    background: #fff;
  }
  .guestsLayout {
    grid-template-columns: 1fr;
    grid-template-areas:
      "meals"
      "list";
  }
  .meals {
    position: static;
  }
}
```

```tsx components/AppFrame.tsx
"use client";

import { Avatar, Button, Group, Text } from "@mantine/core";
import { IconLayoutGrid, IconListDetails, IconUsersGroup } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { APP, EVENT, PLANNER, initials } from "@/lib/data";
import css from "./seatwise.module.css";

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const links = [
    { href: "/", label: "Plan", icon: <IconLayoutGrid size={18} /> },
    { href: "/guests", label: "Guests", icon: <IconListDetails size={18} /> },
  ];

  return (
    <div className={css.frame}>
      <a className={css.skip} href="#main">
        Skip to content
      </a>
      <header className={`${css.header} ${css.noPrint}`}>
        <div className={css.headerInner}>
          <Link href="/" className={css.brand} aria-label={`${APP.name}, seating plan`}>
            <span className={css.brandMark} aria-hidden="true">
              <IconUsersGroup size={20} />
            </span>
            {APP.name}
          </Link>
          <nav aria-label="Main">
            <Group gap={6}>
              {links.map((l) => {
                const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
                return (
                  <Button
                    key={l.href}
                    component={Link}
                    href={l.href}
                    variant={active ? "light" : "subtle"}
                    color={active ? "moss" : "gray"}
                    leftSection={l.icon}
                    aria-current={active ? "page" : undefined}
                  >
                    {l.label}
                  </Button>
                );
              })}
            </Group>
          </nav>
          <Group gap="sm" ml="auto" wrap="nowrap">
            <div style={{ textAlign: "right" }}>
              <Text size="sm" fw={600} lh={1.2} visibleFrom="md">
                {EVENT.name}
              </Text>
              <Text size="xs" c="dimmed" lh={1.2} visibleFrom="md">
                {EVENT.venue}
              </Text>
            </div>
            <Avatar color="moss" radius="xl" size={36} title={PLANNER.name} aria-label={`Signed in as ${PLANNER.name}`}>
              {initials(PLANNER.name)}
            </Avatar>
          </Group>
        </div>
      </header>
      <main id="main" className={css.main}>
        {children}
      </main>
    </div>
  );
}
```

```tsx components/GuestRow.tsx
"use client";

import { ActionIcon, Avatar, Badge, Group, Menu, Text, UnstyledButton } from "@mantine/core";
import { IconDots, IconUserMinus } from "@tabler/icons-react";
import { RSVP_LABEL, TABLES, TABLE_BY_ID, dietColor, initials, partyColor, type Guest } from "@/lib/data";
import { freeSeats } from "@/lib/seating";
import { usePlan } from "@/lib/plan";
import css from "./seatwise.module.css";

export function GuestRow({ guest, seatLabel }: { guest: Guest; seatLabel?: string }) {
  const { index, seats, held, hold, setDragging, seatGuest, unseat, flaggedGuests } = usePlan();
  const place = index[guest.id];
  const isHeld = held === guest.id;
  const flagged = flaggedGuests.has(guest.id);

  return (
    <div
      className={css.guestRow}
      data-held={isHeld ? "true" : undefined}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", guest.id);
        e.dataTransfer.effectAllowed = "move";
        setDragging(guest.id);
      }}
      onDragEnd={() => setDragging(null)}
    >
      <UnstyledButton
        className={css.guestMain}
        onClick={() => hold(isHeld ? null : guest.id)}
        aria-pressed={isHeld}
        aria-label={`${guest.name}${isHeld ? ", picked up. Tap a seat to place" : place ? ". Pick up to move" : ". Pick up to seat"}`}
      >
        <Avatar color={partyColor(guest.party)} variant="light" radius="xl" size={34}>
          {initials(guest.name)}
        </Avatar>
        <div style={{ minWidth: 0, flex: 1 }}>
          <Group gap={6} wrap="nowrap">
            <Text size="sm" fw={600} truncate>
              {guest.name}
            </Text>
            {flagged && (
              <Badge size="xs" color="red" variant="light">
                Rule
              </Badge>
            )}
          </Group>
          <Group gap={6} wrap="wrap">
            <Text size="xs" c="dimmed">
              {seatLabel ? `${seatLabel} · ` : ""}
              {guest.party}
            </Text>
            {guest.rsvp !== "yes" && (
              <Badge size="xs" color="gray" variant="outline">
                {RSVP_LABEL[guest.rsvp]}
              </Badge>
            )}
            {guest.diet && (
              <Badge size="xs" color={dietColor(guest.diet)} variant="light">
                {guest.diet}
              </Badge>
            )}
          </Group>
        </div>
      </UnstyledButton>
      <Menu position="bottom-end" shadow="md" width={240}>
        <Menu.Target>
          <ActionIcon variant="subtle" color="gray" size="lg" aria-label={`Seat, move or unseat ${guest.name}`}>
            <IconDots size={18} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>{place ? "Move to" : "Seat at"}</Menu.Label>
          {TABLES.map((t) => {
            const free = freeSeats(seats, t.id);
            const here = place?.table === t.id;
            return (
              <Menu.Item
                key={t.id}
                disabled={here || free === 0}
                rightSection={
                  <Text size="xs" c="dimmed">
                    {here ? "here" : free === 0 ? "full" : `${free} free`}
                  </Text>
                }
                onClick={() => seatGuest(guest.id, t.id)}
              >
                {TABLE_BY_ID[t.id].name}
              </Menu.Item>
            );
          })}
          {place && (
            <>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<IconUserMinus size={16} />} onClick={() => unseat(guest.id)}>
                Unseat
              </Menu.Item>
            </>
          )}
        </Menu.Dropdown>
      </Menu>
    </div>
  );
}
```

```tsx components/RoomPlan.tsx
"use client";

import { Badge, Group, Text, Tooltip } from "@mantine/core";
import { useEffect, useState, type CSSProperties, type DragEvent } from "react";
import { FIXTURES, GUEST_BY_ID, ROOM, TABLES, partyColor, shortName, type Fixture, type TableDef } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import css from "./seatwise.module.css";

const SEAT_W = 1.0;
const SEAT_H = 0.68;

interface Geometry {
  gw: number;
  gh: number;
  discW: number;
  discH: number;
  seats: { x: number; y: number }[];
}

function geometry(t: TableDef): Geometry {
  if (t.shape === "long") {
    const perSide = Math.ceil(t.seats / 2);
    const gap = 1.15;
    const seats: { x: number; y: number }[] = [];
    for (let i = 0; i < t.seats; i++) {
      const top = i < perSide;
      const col = top ? i : i - perSide;
      const n = top ? perSide : t.seats - perSide;
      seats.push({ x: (col - (n - 1) / 2) * gap, y: top ? -0.95 : 0.95 });
    }
    return { gw: perSide * gap + 0.9, gh: 2.8, discW: (perSide - 1) * gap + SEAT_W + 0.2, discH: 0.9, seats };
  }
  const ring = t.seats <= 6 ? 1.45 : 1.65;
  const radius = t.seats <= 6 ? 0.85 : 1.0;
  const size = 2 * (ring + SEAT_W / 2) + 0.1;
  const seats = Array.from({ length: t.seats }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
    return { x: ring * Math.cos(a), y: ring * Math.sin(a) };
  });
  return { gw: size, gh: size, discW: radius * 2, discH: radius * 2, seats };
}

const pct = (v: number, total: number) => `${(v / total) * 100}%`;

const fixtureClass: Record<Fixture["kind"], string> = {
  stage: css.stage,
  dancefloor: css.dance,
  bar: css.bar,
  door: css.door,
};

function seatVars(party: string): CSSProperties {
  const c = partyColor(party);
  const shade = c === "gray" ? 2 : 1;
  return {
    "--seat-bg": `var(--mantine-color-${c}-${shade})`,
    "--seat-bd": `var(--mantine-color-${c}-5)`,
    "--seat-fg": `var(--mantine-color-${c}-9)`,
  } as CSSProperties;
}

export function RoomPlan() {
  const { seats, selectedTable, selectTable, held, hold, dragging, setDragging, seatGuest, tableFlags, flaggedGuests } =
    usePlan();
  const [over, setOver] = useState<string | null>(null);
  const placing = held ?? dragging;

  useEffect(() => {
    if (!dragging) setOver(null);
  }, [dragging]);

  const drop = (e: DragEvent, tableId: string, seat?: number) => {
    e.preventDefault();
    e.stopPropagation();
    const id = e.dataTransfer.getData("text/plain") || dragging;
    setOver(null);
    setDragging(null);
    if (id && GUEST_BY_ID[id]) {
      seatGuest(id, tableId, seat);
      selectTable(tableId);
    }
  };

  const onSeatClick = (t: TableDef, i: number) => {
    const occupant = seats[t.id][i];
    selectTable(t.id);
    if (held) {
      if (occupant === held) hold(null);
      else seatGuest(held, t.id, i);
      return;
    }
    if (occupant) hold(occupant);
  };

  const onTableClick = (t: TableDef) => {
    selectTable(t.id);
    if (held) seatGuest(held, t.id);
  };

  return (
    <div>
      <div
        className={css.roomScroll}
        role="region"
        aria-label={`Room plan, ${ROOM.width} by ${ROOM.depth} metres, drawn to scale. Scrolls sideways on narrow screens.`}
        tabIndex={0}
      >
        <div className={css.room}>
          {FIXTURES.map((f) => (
            <div
              key={f.id}
              className={`${css.fixture} ${fixtureClass[f.kind]}`}
              role="img"
              aria-label={f.label}
              style={{
                left: pct(f.x, ROOM.width),
                top: pct(f.y, ROOM.depth),
                width: pct(f.w, ROOM.width),
                height: pct(f.h, ROOM.depth),
              }}
            >
              {f.label}
            </div>
          ))}

          {TABLES.map((t) => {
            const g = geometry(t);
            const row = seats[t.id];
            const taken = row.filter(Boolean).length;
            const flags = tableFlags[t.id] ?? [];
            const isOver = over !== null && over.split(":")[0] === t.id;
            const selected = selectedTable === t.id;
            return (
              <div
                key={t.id}
                className={`${css.group} ${t.shape === "long" ? css.groupLong : ""} ${isOver ? css.groupOver : ""}`}
                style={{
                  left: pct(t.x, ROOM.width),
                  top: pct(t.y, ROOM.depth),
                  width: pct(g.gw, ROOM.width),
                  aspectRatio: `${g.gw} / ${g.gh}`,
                  transform: `translate(-50%, -50%)${t.rotation ? ` rotate(${t.rotation}deg)` : ""}`,
                }}
                onDragOver={(e) => {
                  if (!dragging) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setOver(t.id);
                }}
                onDrop={(e) => drop(e, t.id)}
              >
                <button
                  type="button"
                  className={`${css.disc} ${t.shape === "long" ? css.discLong : ""} ${selected ? css.discSelected : ""} ${flags.length ? css.discFlag : ""}`}
                  style={{ width: pct(g.discW, g.gw), height: pct(g.discH, g.gh) }}
                  onClick={() => onTableClick(t)}
                  aria-pressed={selected}
                  aria-label={`${t.name}, ${taken} of ${t.seats} seats taken${flags.length ? `, ${flags.length} broken ${flags.length === 1 ? "rule" : "rules"}` : ""}`}
                >
                  <span className={css.tName}>{t.name}</span>
                  <span className={css.tCount}>
                    {taken}/{t.seats}
                  </span>
                  {flags.length > 0 && (
                    <span className={css.flagBadge} aria-hidden="true">
                      !
                    </span>
                  )}
                </button>

                {g.seats.map((p, i) => {
                  const gid = row[i];
                  const guest = gid ? GUEST_BY_ID[gid] : null;
                  const key = `${t.id}:${i}`;
                  const flagged = gid ? flaggedGuests.has(gid) : false;
                  const classes = [
                    css.seat,
                    guest ? "" : css.seatEmpty,
                    !guest && placing ? css.seatTarget : "",
                    over === key ? css.seatOver : "",
                    gid && held === gid ? css.seatHeld : "",
                    flagged ? css.seatFlag : "",
                  ].join(" ");
                  const style: CSSProperties = {
                    left: pct(g.gw / 2 + p.x, g.gw),
                    top: pct(g.gh / 2 + p.y, g.gh),
                    width: pct(SEAT_W, g.gw),
                    height: pct(SEAT_H, g.gh),
                    ...(guest ? seatVars(guest.party) : {}),
                  };
                  const button = (
                    <button
                      type="button"
                      className={classes}
                      style={style}
                      draggable={Boolean(guest)}
                      onClick={() => onSeatClick(t, i)}
                      onDragStart={(e) => {
                        if (!gid) return;
                        e.dataTransfer.setData("text/plain", gid);
                        e.dataTransfer.effectAllowed = "move";
                        setDragging(gid);
                      }}
                      onDragEnd={() => setDragging(null)}
                      onDragOver={(e) => {
                        if (!dragging) return;
                        e.preventDefault();
                        e.stopPropagation();
                        e.dataTransfer.dropEffect = "move";
                        setOver(key);
                      }}
                      onDrop={(e) => drop(e, t.id, i)}
                      aria-label={
                        guest
                          ? `${t.name}, seat ${i + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}${flagged ? ", breaks a rule" : ""}`
                          : `${t.name}, seat ${i + 1}, empty${held ? `. Place ${GUEST_BY_ID[held].name} here` : ""}`
                      }
                    >
                      {guest ? (
                        <>
                          <span className={css.seatName}>{shortName(guest.name)}</span>
                          {guest.diet && <span className={css.dietDot} aria-hidden="true" />}
                        </>
                      ) : (
                        <span aria-hidden="true">{i + 1}</span>
                      )}
                    </button>
                  );
                  return guest ? (
                    <Tooltip
                      key={key}
                      label={`${guest.name} · ${guest.party}${guest.diet ? ` · ${guest.diet}` : ""}`}
                      openDelay={250}
                      withArrow
                    >
                      {button}
                    </Tooltip>
                  ) : (
                    <span key={key}>{button}</span>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <Group gap="md" mt="sm" align="center">
        <Text size="xs" c="dimmed">
          Room {ROOM.width} m by {ROOM.depth} m, to scale (grid squares are 1 m).
        </Text>
        <Group gap={6}>
          {["Couple", "Bride's family", "Groom's family", "University friends", "Work friends", "Groom's football club", "Plus-ones"].map((p) => (
            <Badge key={p} size="sm" variant="light" color={partyColor(p)} radius="sm" tt="none" fw={600}>
              {p}
            </Badge>
          ))}
        </Group>
        <Group gap={6}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f08c00", display: "inline-block" }} aria-hidden="true" />
          <Text size="xs" c="dimmed">
            Dietary need
          </Text>
          <span style={{ width: 14, height: 10, borderRadius: 6, boxShadow: "0 0 0 2px #e03131", display: "inline-block", marginLeft: 8 }} aria-hidden="true" />
          <Text size="xs" c="dimmed">
            Breaks a rule
          </Text>
        </Group>
      </Group>
    </div>
  );
}
```

```tsx components/PlanSidebar.tsx
"use client";

import { Alert, Badge, Button, Group, Progress, Stack, Tabs, Text, ThemeIcon } from "@mantine/core";
import { IconAlertTriangle, IconCheck, IconCircleDashed, IconCircleCheck } from "@tabler/icons-react";
import { useState } from "react";
import { GUEST_BY_ID, TABLES, TABLE_BY_ID, dietColor, STANDARD_MEAL } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import type { RuleLevel } from "@/lib/seating";
import { GuestRow } from "./GuestRow";
import css from "./seatwise.module.css";

const LEVEL_ORDER: Record<RuleLevel, number> = { broken: 0, open: 1, ok: 2 };

export function PlanSidebar() {
  const { unseatedAttending, unseatedTentative, results, stats, seats, tableFlags, selectedTable, selectTable } = usePlan();
  const [tab, setTab] = useState<string | null>("unseated");
  const sorted = [...results].sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);

  return (
    <section className={css.card} aria-label="Guests, rules and tables">
      <Tabs value={tab} onChange={setTab} keepMounted={false}>
        <Tabs.List grow>
          <Tabs.Tab value="unseated" rightSection={<Badge size="sm" circle color={stats.unseatedAttending ? "orange" : "green"}>{stats.unseatedAttending}</Badge>}>
            Unseated
          </Tabs.Tab>
          <Tabs.Tab value="rules" rightSection={<Badge size="sm" circle color={stats.broken ? "red" : "green"}>{stats.broken}</Badge>}>
            Rules
          </Tabs.Tab>
          <Tabs.Tab value="tables">Tables</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="unseated" pt="md">
          <Stack gap="xs">
            <Text size="xs" c="dimmed">
              Attending guests without a seat. Drag one onto a seat or table, or tap a guest and then a seat.
            </Text>
            {unseatedAttending.length === 0 && (
              <Alert color="green" variant="light" icon={<IconCircleCheck size={18} />}>
                Everyone who is attending has a seat.
              </Alert>
            )}
            {unseatedAttending.map((g) => (
              <GuestRow key={g.id} guest={g} />
            ))}
            {unseatedTentative.length > 0 && (
              <>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" mt="sm">
                  Not confirmed yet ({unseatedTentative.length})
                </Text>
                {unseatedTentative.map((g) => (
                  <GuestRow key={g.id} guest={g} />
                ))}
              </>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="rules" pt="md">
          <Stack gap="xs">
            {sorted.map((r) => {
              const color = r.level === "broken" ? "red" : r.level === "ok" ? "green" : "gray";
              return (
                <button
                  key={r.rule.id}
                  type="button"
                  className={css.tableRow}
                  onClick={() => r.tables[0] && selectTable(r.tables[0])}
                  aria-label={`${r.kindLabel}: ${r.headline}. ${r.detail}`}
                >
                  <Group gap="sm" align="flex-start" wrap="nowrap">
                    <ThemeIcon color={color} variant="light" radius="xl" size={28}>
                      {r.level === "broken" ? <IconAlertTriangle size={16} /> : r.level === "ok" ? <IconCheck size={16} /> : <IconCircleDashed size={16} />}
                    </ThemeIcon>
                    <div style={{ minWidth: 0 }}>
                      <Group gap={6}>
                        <Badge size="xs" variant="outline" color="gray">
                          {r.kindLabel}
                        </Badge>
                        <Text size="xs" c={color === "gray" ? "dimmed" : color} fw={700}>
                          {r.level === "broken" ? "Broken" : r.level === "ok" ? "Kept" : "Waiting for seats"}
                        </Text>
                      </Group>
                      <Text size="sm" fw={600} mt={2}>
                        {r.headline}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {r.detail}
                      </Text>
                      <Text size="xs" fs="italic" c="dimmed" mt={2}>
                        Note: {r.rule.note}
                      </Text>
                      {r.rule.caution && (
                        <Text size="xs" c="orange.8" mt={2}>
                          {r.rule.caution}
                        </Text>
                      )}
                    </div>
                  </Group>
                </button>
              );
            })}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="tables" pt="md">
          <Stack gap="xs">
            {TABLES.map((t) => {
              const taken = seats[t.id].filter(Boolean).length;
              const flags = tableFlags[t.id] ?? [];
              const dietary = seats[t.id].filter((id) => id && GUEST_BY_ID[id].diet).length;
              return (
                <button
                  key={t.id}
                  type="button"
                  className={css.tableRow}
                  data-selected={selectedTable === t.id ? "true" : undefined}
                  onClick={() => selectTable(t.id)}
                  aria-pressed={selectedTable === t.id}
                >
                  <Group justify="space-between" wrap="nowrap" mb={6}>
                    <Text size="sm" fw={600}>
                      {TABLE_BY_ID[t.id].name}
                    </Text>
                    <Group gap={6} wrap="nowrap">
                      {dietary > 0 && (
                        <Badge size="xs" color="orange" variant="light">
                          {dietary} dietary
                        </Badge>
                      )}
                      {flags.length > 0 && (
                        <Badge size="xs" color="red" variant="filled" leftSection={<IconAlertTriangle size={10} />}>
                          Rule
                        </Badge>
                      )}
                      <Text size="sm" fw={600} style={{ fontVariantNumeric: "tabular-nums" }}>
                        {taken}/{t.seats}
                      </Text>
                    </Group>
                  </Group>
                  <Progress value={(taken / t.seats) * 100} size="sm" color={taken === t.seats ? "moss" : "moss.4"} aria-label={`${taken} of ${t.seats} seats taken`} />
                </button>
              );
            })}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </section>
  );
}

export function SelectedTable() {
  const { selectedTable, seats, tableFlags, held, seatGuest } = usePlan();
  const t = selectedTable ? TABLE_BY_ID[selectedTable] : null;

  if (!t) {
    return (
      <section className={css.card} aria-label="Selected table">
        <Text fw={600}>No table selected</Text>
        <Text size="sm" c="dimmed" mt={4}>
          Tap a table or a seat in the room, or pick one under Tables, to see who sits there and what they eat.
        </Text>
      </section>
    );
  }

  const row = seats[t.id];
  const taken = row.filter(Boolean).length;
  const flags = tableFlags[t.id] ?? [];
  const emptySeats = row.map((id, i) => (id ? null : i + 1)).filter((n): n is number => n !== null);
  const needs = new Map<string, number>();
  let standard = 0;
  for (const id of row) {
    if (!id) continue;
    const d = GUEST_BY_ID[id].diet;
    if (d) needs.set(d, (needs.get(d) ?? 0) + 1);
    else standard += 1;
  }

  return (
    <section className={css.card} aria-label={`${t.name} details`}>
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <div>
          <Text fw={700} size="lg" lh={1.2}>
            {t.name}
          </Text>
          <Text size="xs" c="dimmed">
            {t.shape === "long" ? "Long table" : "Round table"}, {taken} of {t.seats} seats taken
          </Text>
        </div>
        <Badge color={taken === t.seats ? "moss" : "gray"} variant="light">
          {t.seats - taken} free
        </Badge>
      </Group>
      <Progress mt="sm" value={(taken / t.seats) * 100} size="sm" color="moss" aria-label={`${taken} of ${t.seats} seats taken`} />

      {flags.map((r) => (
        <Alert key={r.rule.id} mt="sm" color="red" variant="light" icon={<IconAlertTriangle size={16} />} p="xs">
          <Text size="sm" fw={600}>
            {r.headline}
          </Text>
          <Text size="xs">{r.detail}</Text>
        </Alert>
      ))}

      <Text size="xs" fw={700} c="dimmed" tt="uppercase" mt="md" mb={6}>
        Dietary needs
      </Text>
      {taken === 0 ? (
        <Text size="sm" c="dimmed">
          Nobody is seated here yet.
        </Text>
      ) : (
        <Group gap={6}>
          {Array.from(needs.entries()).map(([d, n]) => (
            <Badge key={d} color={dietColor(d)} variant="light">
              {n} {d}
            </Badge>
          ))}
          {standard > 0 && (
            <Badge color="gray" variant="outline">
              {standard} {STANDARD_MEAL.toLowerCase()}
            </Badge>
          )}
        </Group>
      )}

      <Text size="xs" fw={700} c="dimmed" tt="uppercase" mt="md" mb={6}>
        Guests
      </Text>
      <Stack gap="xs">
        {row.map((id, i) => (id ? <GuestRow key={id} guest={GUEST_BY_ID[id]} seatLabel={`Seat ${i + 1}`} /> : null))}
      </Stack>

      {emptySeats.length > 0 && (
        <Text size="sm" c="dimmed" mt="sm">
          Empty {emptySeats.length === 1 ? "seat" : "seats"}: {emptySeats.join(", ")}
        </Text>
      )}
      {held && emptySeats.length > 0 && (
        <Button mt="sm" fullWidth onClick={() => seatGuest(held, t.id)}>
          Seat {GUEST_BY_ID[held].name} here
        </Button>
      )}
    </section>
  );
}
```

```tsx components/PlanScreen.tsx
"use client";

import { Alert, Button, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconAlertTriangle, IconArrowBackUp, IconCircleCheck, IconHandStop, IconX } from "@tabler/icons-react";
import { EVENT, GUEST_BY_ID, TABLE_BY_ID, formatEventDate } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { PlanSidebar, SelectedTable } from "./PlanSidebar";
import { RoomPlan } from "./RoomPlan";
import css from "./seatwise.module.css";

function Stat({ label, value, hint, color }: { label: string; value: string | number; hint: string; color?: string }) {
  return (
    <div className={css.card} style={{ padding: "12px 16px" }}>
      <Text size="xs" fw={700} c="dimmed" tt="uppercase">
        {label}
      </Text>
      <Text fz={30} fw={700} lh={1.1} c={color} style={{ fontVariantNumeric: "tabular-nums" }}>
        {value}
      </Text>
      <Text size="xs" c="dimmed">
        {hint}
      </Text>
    </div>
  );
}

export function PlanScreen() {
  const { stats, results, selectTable, held, hold, undo, canUndo } = usePlan();
  const broken = results.filter((r) => r.level === "broken");

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-end" gap="sm">
        <div>
          <Title order={1} size="h2">
            Seating plan
          </Title>
          <Text size="sm" c="dimmed">
            {EVENT.name} · {formatEventDate()} · {EVENT.venue}
          </Text>
        </div>
        <Button variant="default" leftSection={<IconArrowBackUp size={18} />} onClick={undo} disabled={!canUndo}>
          Undo
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="sm">
        <Stat label="Seated" value={stats.seated} hint={`of ${stats.capacity} seats`} />
        <Stat label="Unseated" value={stats.unseatedAttending} hint={`attending, of ${stats.attending}`} color={stats.unseatedAttending ? "orange.8" : "moss.8"} />
        <Stat label="Empty seats" value={stats.empty} hint="across 7 tables" />
        <Stat
          label="Rules"
          value={stats.broken === 0 ? "All kept" : `${stats.broken} broken`}
          hint={`${stats.rules} rules, ${stats.open} waiting for seats`}
          color={stats.broken ? "red.7" : "moss.8"}
        />
      </SimpleGrid>

      {broken.length > 0 ? (
        <Alert color="red" variant="light" icon={<IconAlertTriangle size={20} />} title={`${broken.length} seating ${broken.length === 1 ? "rule is" : "rules are"} broken`}>
          <Stack gap={4}>
            {broken.map((r) => (
              <Group key={r.rule.id} gap="xs" wrap="nowrap" justify="space-between">
                <Text size="sm">{r.headline}</Text>
                {r.tables[0] && (
                  <Button size="compact-sm" variant="subtle" color="red" onClick={() => selectTable(r.tables[0])}>
                    Show {TABLE_BY_ID[r.tables[0]].name}
                  </Button>
                )}
              </Group>
            ))}
          </Stack>
        </Alert>
      ) : (
        <Alert color="green" variant="light" icon={<IconCircleCheck size={20} />} title="Every rule is kept">
          {stats.open > 0 ? `${stats.open} still waiting for guests to be seated.` : "The couple's rules are all satisfied."}
        </Alert>
      )}

      <div className={css.layout}>
        <Stack gap="sm" style={{ minWidth: 0 }}>
          {held ? (
            <Alert color="moss" variant="light" icon={<IconHandStop size={18} />} p="xs" role="status">
              <Group justify="space-between" wrap="nowrap">
                <Text size="sm">
                  <b>{GUEST_BY_ID[held].name}</b> is picked up. Tap an empty seat or a table to place them, or another guest to swap.
                </Text>
                <Button size="compact-sm" variant="default" leftSection={<IconX size={14} />} onClick={() => hold(null)}>
                  Cancel
                </Button>
              </Group>
            </Alert>
          ) : (
            <Text size="sm" c="dimmed">
              Drag guests onto seats, or tap a guest and then a seat. Tap a table to see who sits there.
            </Text>
          )}
          <RoomPlan />
        </Stack>
        <aside className={css.aside} aria-label="Side panel">
          <PlanSidebar />
          <SelectedTable />
        </aside>
      </div>
    </Stack>
  );
}
```

```tsx components/GuestsScreen.tsx
"use client";

import { Badge, Button, Group, Paper, Select, Stack, Table, Text, TextInput, Title } from "@mantine/core";
import { IconPrinter, IconSearch } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  DIETS,
  GUESTS,
  PARTIES,
  RSVP_COLOR,
  RSVP_LABEL,
  STANDARD_MEAL,
  TABLES,
  TABLE_BY_ID,
  dietColor,
  mealCounts,
  mealLabel,
  partyColor,
  type Rsvp,
} from "@/lib/data";
import { usePlan } from "@/lib/plan";
import css from "./seatwise.module.css";

const plain = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function GuestsScreen() {
  const router = useRouter();
  const { index, seats, selectTable } = usePlan();
  const [query, setQuery] = useState("");
  const [party, setParty] = useState<string | null>(null);
  const [rsvp, setRsvp] = useState<string | null>(null);
  const [diet, setDiet] = useState<string | null>(null);
  const [seating, setSeating] = useState<string | null>(null);

  const meals = useMemo(() => mealCounts(), []);
  const totals = meals.reduce((a, r) => ({ confirmed: a.confirmed + r.confirmed, awaiting: a.awaiting + r.awaiting }), { confirmed: 0, awaiting: 0 });

  const filtered = GUESTS.filter((g) => {
    const q = plain(query.trim());
    const tableName = index[g.id] ? TABLE_BY_ID[index[g.id].table].name : "unseated";
    if (q && !plain(`${g.name} ${g.party} ${g.diet ?? ""} ${tableName}`).includes(q)) return false;
    if (party && g.party !== party) return false;
    if (rsvp && g.rsvp !== rsvp) return false;
    if (diet === "none" ? g.diet !== null : diet ? g.diet !== diet : false) return false;
    if (seating === "seated" && !index[g.id]) return false;
    if (seating === "unseated" && index[g.id]) return false;
    return true;
  });

  const filtersActive = Boolean(query || party || rsvp || diet || seating);
  const reset = () => {
    setQuery("");
    setParty(null);
    setRsvp(null);
    setDiet(null);
    setSeating(null);
  };

  const byTable = [...TABLES.map((t) => ({ id: t.id, name: t.name })), { id: "none", name: "No seat yet" }].map((entry) => {
    const ids =
      entry.id === "none"
        ? GUESTS.filter((g) => g.rsvp !== "no" && !index[g.id]).map((g) => g.id)
        : seats[entry.id].filter((x): x is string => x !== null);
    const tally = new Map<string, number>();
    for (const id of ids) {
      const g = GUESTS.find((x) => x.id === id);
      if (g) tally.set(mealLabel(g), (tally.get(mealLabel(g)) ?? 0) + 1);
    }
    return { ...entry, count: ids.length, tally: Array.from(tally.entries()) };
  });

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-end" gap="sm">
        <div>
          <Title order={1} size="h2">
            Guest list
          </Title>
          <Text size="sm" c="dimmed">
            {GUESTS.length} invited · {totals.confirmed} attending · {totals.awaiting} not confirmed
          </Text>
        </div>
        <Button className={css.noPrint} variant="default" leftSection={<IconPrinter size={18} />} onClick={() => window.print()}>
          Print for the caterer
        </Button>
      </Group>

      <div className={css.guestsLayout}>
        <section className={css.meals} aria-label="Meal counts for the caterer">
          <Paper className={css.card} p="md">
            <Title order={2} size="h4">
              Meals for the caterer
            </Title>
            <Text size="xs" c="dimmed" mb="sm">
              Declined guests are not counted. Select a row to filter the list.
            </Text>
            <Table verticalSpacing={6} horizontalSpacing="xs" aria-label="Meal counts">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th scope="col">Meal</Table.Th>
                  <Table.Th scope="col" ta="right">
                    Attending
                  </Table.Th>
                  <Table.Th scope="col" ta="right">
                    Not confirmed
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {meals.map((m) => (
                  <Table.Tr key={m.meal}>
                    <Table.Td>
                      <Button
                        variant="subtle"
                        color={m.meal === STANDARD_MEAL ? "gray" : dietColor(m.meal)}
                        size="compact-sm"
                        className={css.noPrint}
                        onClick={() => setDiet(m.meal === STANDARD_MEAL ? "none" : m.meal)}
                        aria-label={`Filter the list to ${m.meal}`}
                      >
                        {m.meal}
                      </Button>
                      <span style={{ display: "none" }} className="print-only">
                        {m.meal}
                      </span>
                    </Table.Td>
                    <Table.Td ta="right" fw={700} style={{ fontVariantNumeric: "tabular-nums" }}>
                      {m.confirmed}
                    </Table.Td>
                    <Table.Td ta="right" c="dimmed" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {m.awaiting}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
              <Table.Tfoot>
                <Table.Tr>
                  <Table.Th scope="row">Total</Table.Th>
                  <Table.Th ta="right">{totals.confirmed}</Table.Th>
                  <Table.Th ta="right">{totals.awaiting}</Table.Th>
                </Table.Tr>
              </Table.Tfoot>
            </Table>

            <Title order={3} size="h5" mt="lg" mb={6}>
              By table
            </Title>
            <Stack gap={8}>
              {byTable.map((t) => (
                <div key={t.id}>
                  <Group justify="space-between" gap="xs">
                    <Text size="sm" fw={600}>
                      {t.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {t.count} {t.count === 1 ? "guest" : "guests"}
                    </Text>
                  </Group>
                  <Text size="xs" c="dimmed">
                    {t.tally.length ? t.tally.map(([meal, n]) => `${n} × ${meal}`).join(", ") : "Nobody yet"}
                  </Text>
                </div>
              ))}
            </Stack>
          </Paper>
        </section>

        <section className={css.list} aria-label="Guests">
          <Paper className={css.card} p="md">
            <div className={css.noPrint}>
              <TextInput
                label="Search"
                placeholder="Name, party, diet or table"
                leftSection={<IconSearch size={16} />}
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
                mb="sm"
              />
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
                <Select label="Party" placeholder="All parties" data={PARTIES} value={party} onChange={setParty} clearable />
                <Select
                  label="RSVP"
                  placeholder="Any reply"
                  data={(["yes", "maybe", "pending", "no"] as Rsvp[]).map((r) => ({ value: r, label: RSVP_LABEL[r] }))}
                  value={rsvp}
                  onChange={setRsvp}
                  clearable
                />
                <Select
                  label="Diet"
                  placeholder="Any meal"
                  data={[{ value: "none", label: STANDARD_MEAL }, ...DIETS.map((d) => ({ value: d, label: d }))]}
                  value={diet}
                  onChange={setDiet}
                  clearable
                />
                <Select
                  label="Seating"
                  placeholder="Seated or not"
                  data={[
                    { value: "seated", label: "Seated" },
                    { value: "unseated", label: "Unseated" },
                  ]}
                  value={seating}
                  onChange={setSeating}
                  clearable
                />
              </div>
              <Group justify="space-between" mt="sm" mb="xs">
                <Text size="sm" c="dimmed" role="status">
                  Showing {filtered.length} of {GUESTS.length} guests
                </Text>
                {filtersActive && (
                  <Button size="compact-sm" variant="subtle" onClick={reset}>
                    Clear filters
                  </Button>
                )}
              </Group>
            </div>

            <Table.ScrollContainer minWidth={640}>
              <Table verticalSpacing="xs" highlightOnHover stickyHeader aria-label="Guest list">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th scope="col">Guest</Table.Th>
                    <Table.Th scope="col">Party</Table.Th>
                    <Table.Th scope="col">RSVP</Table.Th>
                    <Table.Th scope="col">Diet</Table.Th>
                    <Table.Th scope="col">Table</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filtered.map((g) => {
                    const place = index[g.id];
                    return (
                      <Table.Tr key={g.id}>
                        <Table.Td fw={600}>{g.name}</Table.Td>
                        <Table.Td>
                          <Badge variant="light" color={partyColor(g.party)} radius="sm" tt="none">
                            {g.party}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="light" color={RSVP_COLOR[g.rsvp]}>
                            {RSVP_LABEL[g.rsvp]}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          {g.diet ? (
                            <Badge variant="light" color={dietColor(g.diet)}>
                              {g.diet}
                            </Badge>
                          ) : (
                            <Text size="sm" c="dimmed">
                              None
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          {place ? (
                            <Button
                              size="compact-sm"
                              variant="subtle"
                              color="moss"
                              onClick={() => {
                                selectTable(place.table);
                                router.push("/");
                              }}
                              aria-label={`${TABLE_BY_ID[place.table].name}, seat ${place.seat + 1}. Show on the plan`}
                            >
                              {TABLE_BY_ID[place.table].name} · seat {place.seat + 1}
                            </Button>
                          ) : g.rsvp === "no" ? (
                            <Text size="sm" c="dimmed">
                              Not attending
                            </Text>
                          ) : (
                            <Text size="sm" c="orange.8" fw={600}>
                              Unseated
                            </Text>
                          )}
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={5}>
                        <Text ta="center" c="dimmed" py="lg">
                          No guests match these filters.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Paper>
        </section>
      </div>
    </Stack>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { PlanScreen } from "@/components/PlanScreen";

export const metadata: Metadata = { title: "Seating plan · Seatwise" };

export default function Page() {
  return <PlanScreen />;
}
```

```tsx app/guests/page.tsx
import type { Metadata } from "next";
import { GuestsScreen } from "@/components/GuestsScreen";

export const metadata: Metadata = { title: "Guest list · Seatwise" };

export default function Page() {
  return <GuestsScreen />;
}
```

```tsx app/layout.tsx
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/spotlight/styles.css";

import type { Metadata } from "next";
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { AppFrame } from "@/components/AppFrame";
import { PlanProvider } from "@/lib/plan";
import { theme } from "./theme";

export const metadata: Metadata = {
  title: "Seatwise",
  description: "A seating planner for wedding and event planners",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="light" forceColorScheme="light" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light" forceColorScheme="light">
          <ModalsProvider>
            <Notifications />
            <PlanProvider>
              <AppFrame>{children}</AppFrame>
            </PlanProvider>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
```

```ts app/theme.ts
import { createTheme, type MantineColorsTuple } from "@mantine/core";

const moss: MantineColorsTuple = [
  "#eef7f3",
  "#d9ece4",
  "#b3d9c9",
  "#8ac4ac",
  "#66b293",
  "#4ea583",
  "#3f9f7a",
  "#308a68",
  "#257a5a",
  "#136849",
];

// System font stack, identical in every arm (no network font fetch at build).
export const theme = createTheme({
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  headings: { fontFamily: "ui-sans-serif, system-ui, sans-serif", fontWeight: "650" },
  colors: { moss },
  primaryColor: "moss",
  primaryShade: { light: 7, dark: 6 },
  defaultRadius: "md",
});
```
