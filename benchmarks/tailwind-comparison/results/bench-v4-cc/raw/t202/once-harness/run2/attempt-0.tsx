```ts lib/data.ts
export type Rsvp = "yes" | "no" | "maybe" | "pending";

export type Guest = {
  id: string;
  name: string;
  party: string;
  rsvp: Rsvp;
  diet: string | null;
  table: string | null;
};

export type FixtureKind = "stage" | "dancefloor" | "bar" | "door";

export type Fixture = {
  id: string;
  kind: FixtureKind;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type TableDef = {
  id: string;
  name: string;
  shape: "long" | "round";
  seats: number;
  x: number;
  y: number;
  rotation?: number;
};

export type Rule = {
  kind: "together" | "apart" | "near";
  guests: string[];
  note: string;
  /** For a single-guest "near" rule: the fixture to be close to. */
  nearFixture?: string;
  /** For a single-guest "near" rule: the fixture to keep away from. */
  awayFrom?: string;
};

export const APP_NAME = "Seatwise";

export const EVENT = {
  name: "Ines & Mateo's wedding dinner",
  date: "2027-06-19",
  venue: "The Orangery, Hollin Hall",
  room_m: { width: 24, depth: 14 },
};

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
  { kind: "together", guests: ["g-21", "g-22"], note: "Couple" },
  { kind: "together", guests: ["g-32", "g-33"], note: "Siblings, under 10" },
  { kind: "apart", guests: ["g-29", "g-30"], note: "Brothers Sean and Ryan Doyle are not speaking" },
  { kind: "apart", guests: ["g-12", "g-34"], note: "Ask the couple: old family dispute" },
  {
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
    nearFixture: "f-4",
    awayFrom: "f-1",
  },
];

export const GUEST_BY_ID: Record<string, Guest> = Object.fromEntries(GUESTS.map((g) => [g.id, g]));
export const TABLE_BY_ID: Record<string, TableDef> = Object.fromEntries(TABLES.map((t) => [t.id, t]));
export const FIXTURE_BY_ID: Record<string, Fixture> = Object.fromEntries(FIXTURES.map((f) => [f.id, f]));

export const PARTIES: string[] = Array.from(new Set(GUESTS.map((g) => g.party)));
export const DIETS: string[] = Array.from(
  new Set(GUESTS.map((g) => g.diet).filter((d): d is string => d !== null)),
).sort();
```

```ts lib/plan.ts
import {
  EVENT,
  FIXTURE_BY_ID,
  GUEST_BY_ID,
  RULES,
  TABLES,
  TABLE_BY_ID,
  GUESTS,
  type Fixture,
  type Guest,
  type Rsvp,
  type Rule,
  type TableDef,
} from "./data";

export type Seating = Record<string, (string | null)[]>;
export type ToneName = "neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success";

export const SEAT_R = 0.34;
export const NEAR_MAX_M = 4;
export const AWAY_MIN_M = 6;

export function initialSeating(): Seating {
  const seating: Seating = {};
  for (const t of TABLES) seating[t.id] = Array.from({ length: t.seats }, () => null);
  for (const g of GUESTS) {
    if (!g.table) continue;
    const slots = seating[g.table];
    const free = slots.indexOf(null);
    if (free >= 0) slots[free] = g.id;
  }
  return seating;
}

export function cloneSeating(s: Seating): Seating {
  const next: Seating = {};
  for (const id of Object.keys(s)) next[id] = s[id].slice();
  return next;
}

export function tableOfMap(seating: Seating): Record<string, string | null> {
  const map: Record<string, string | null> = {};
  for (const g of GUESTS) map[g.id] = null;
  for (const tableId of Object.keys(seating)) {
    for (const guestId of seating[tableId]) if (guestId) map[guestId] = tableId;
  }
  return map;
}

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "No reply yet",
  no: "Declined",
};

export const RSVP_TONE: Record<Rsvp, ToneName> = {
  yes: "success",
  maybe: "warning",
  pending: "neutral",
  no: "danger",
};

export function mealOf(g: Guest): string {
  return g.diet ?? "Standard";
}

export function formatEventDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

/* ---------- geometry ---------- */

export type TableLayout = {
  body: { kind: "round"; r: number } | { kind: "long"; w: number; h: number };
  seats: { x: number; y: number }[];
  /** Radius (round) or half extents used for the drop/click hit area. */
  hit: { x: number; y: number; w: number; h: number };
};

export function seatLayout(t: TableDef): TableLayout {
  const n = t.seats;
  if (t.shape === "long") {
    const w = n * 0.72;
    const h = 0.9;
    const seats = Array.from({ length: n }, (_, i) => ({
      x: -w / 2 + ((i + 0.5) * w) / n,
      y: h / 2 + 0.46,
    }));
    return {
      body: { kind: "long", w, h },
      seats,
      hit: { x: -w / 2 - 0.3, y: -h / 2 - 0.3, w: w + 0.6, h: h + 0.46 + SEAT_R * 2 + 0.5 },
    };
  }
  const r = n > 6 ? 0.9 : 0.78;
  const ring = r + 0.46;
  const seats = Array.from({ length: n }, (_, i) => {
    const a = ((-90 + (i * 360) / n) * Math.PI) / 180;
    return { x: Math.cos(a) * ring, y: Math.sin(a) * ring };
  });
  const reach = ring + SEAT_R + 0.12;
  return { body: { kind: "round", r }, seats, hit: { x: -reach, y: -reach, w: reach * 2, h: reach * 2 } };
}

function centre(f: Fixture): { x: number; y: number } {
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/* ---------- rules ---------- */

export type RuleStatus = "kept" | "broken" | "waiting";

export type RuleResult = {
  id: string;
  rule: Rule;
  status: RuleStatus;
  title: string;
  detail: string;
  tableIds: string[];
};

export const RULE_KIND_LABEL: Record<Rule["kind"], string> = {
  together: "Keep together",
  apart: "Keep apart",
  near: "Seat near",
};

function unique(list: string[]): string[] {
  return Array.from(new Set(list));
}

function tableName(id: string): string {
  return TABLE_BY_ID[id].name;
}

export function evaluateRules(tableOf: Record<string, string | null>): RuleResult[] {
  return RULES.map((rule, index): RuleResult => {
    const id = `rule-${index}`;
    const names = rule.guests.map((g) => GUEST_BY_ID[g].name);
    const title = `${RULE_KIND_LABEL[rule.kind]}: ${names.join(" and ")}`;
    const seatedAt = unique(rule.guests.map((g) => tableOf[g]).filter((t): t is string => t !== null));
    const unplaced = rule.guests.filter((g) => !tableOf[g]).map((g) => GUEST_BY_ID[g].name);

    if (rule.kind === "together") {
      if (seatedAt.length > 1) {
        return { id, rule, status: "broken", title, detail: `Split across ${seatedAt.map(tableName).join(" and ")}.`, tableIds: seatedAt };
      }
      if (unplaced.length > 0) {
        return { id, rule, status: "waiting", title, detail: `Waiting: ${unplaced.join(" and ")} not seated yet.`, tableIds: seatedAt };
      }
      return { id, rule, status: "kept", title, detail: `Together at ${tableName(seatedAt[0])}.`, tableIds: seatedAt };
    }

    if (rule.kind === "apart") {
      if (unplaced.length === 0 && seatedAt.length === 1) {
        return { id, rule, status: "broken", title, detail: `Both are at ${tableName(seatedAt[0])}.`, tableIds: seatedAt };
      }
      if (unplaced.length > 0) {
        return { id, rule, status: "waiting", title, detail: `Not tested yet: ${unplaced.join(" and ")} not seated.`, tableIds: seatedAt };
      }
      return { id, rule, status: "kept", title, detail: `${seatedAt.map(tableName).join(" and ")}: kept apart.`, tableIds: seatedAt };
    }

    // near
    if (rule.nearFixture) {
      const target = FIXTURE_BY_ID[rule.nearFixture];
      const away = rule.awayFrom ? FIXTURE_BY_ID[rule.awayFrom] : undefined;
      const tid = tableOf[rule.guests[0]];
      if (!tid) {
        return { id, rule, status: "waiting", title, detail: `Waiting: ${names[0]} is not seated yet.`, tableIds: [] };
      }
      const t = TABLE_BY_ID[tid];
      const dTarget = dist(t, centre(target));
      const dAway = away ? dist(t, centre(away)) : Infinity;
      const label = target.label.toLowerCase();
      const farLabel = away ? away.label.toLowerCase() : "";
      if (dTarget > NEAR_MAX_M) {
        return {
          id,
          rule,
          status: "broken",
          title,
          detail: `${t.name} is ${dTarget.toFixed(1)} m from the ${label}; it needs to be within ${NEAR_MAX_M} m.`,
          tableIds: [tid],
        };
      }
      if (dAway < AWAY_MIN_M) {
        return {
          id,
          rule,
          status: "broken",
          title,
          detail: `${t.name} is only ${dAway.toFixed(1)} m from the ${farLabel}; keep it ${AWAY_MIN_M} m or more away.`,
          tableIds: [tid],
        };
      }
      return {
        id,
        rule,
        status: "kept",
        title,
        detail: `${t.name} is ${dTarget.toFixed(1)} m from the ${label}${away ? ` and ${dAway.toFixed(1)} m from the ${farLabel}` : ""}.`,
        tableIds: [tid],
      };
    }

    if (unplaced.length > 0) {
      return { id, rule, status: "waiting", title, detail: `Waiting: ${unplaced.join(" and ")} not seated yet.`, tableIds: seatedAt };
    }
    const tables = rule.guests.map((g) => TABLE_BY_ID[tableOf[g] as string]);
    const far = tables.some((t) => dist(t, tables[0]) > 6);
    return far
      ? { id, rule, status: "broken", title, detail: "These tables are more than 6 m apart.", tableIds: seatedAt }
      : { id, rule, status: "kept", title, detail: "Close together.", tableIds: seatedAt };
  });
}

export function roomSize() {
  return EVENT.room_m;
}
```

```tsx components/PlanProvider.tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useToast } from "@once-ui-system/core";
import { GUESTS, GUEST_BY_ID, TABLES, TABLE_BY_ID, type Guest } from "@/lib/data";
import {
  cloneSeating,
  evaluateRules,
  initialSeating,
  tableOfMap,
  type RuleResult,
  type Seating,
} from "@/lib/plan";

type Stats = {
  attending: number;
  seated: number;
  seatedAttending: number;
  unseated: Guest[];
  unconfirmed: Guest[];
  capacity: number;
  free: number;
  perTable: Record<string, number>;
};

type PlanContextValue = {
  seating: Seating;
  tableOf: Record<string, string | null>;
  stats: Stats;
  rules: RuleResult[];
  brokenTableIds: Set<string>;
  selectedTable: string | null;
  selectTable: (id: string | null) => void;
  picked: string | null;
  pick: (id: string | null) => void;
  dragId: string | null;
  setDragId: (id: string | null) => void;
  seat: (guestId: string, tableId: string, seatIndex?: number) => void;
  placePicked: (tableId: string, seatIndex?: number) => void;
  unseat: (guestId: string) => void;
  undo: () => void;
  canUndo: boolean;
  announcement: string;
};

const PlanContext = createContext<PlanContextValue | null>(null);

export function usePlan(): PlanContextValue {
  const value = useContext(PlanContext);
  if (!value) throw new Error("usePlan must be used inside PlanProvider");
  return value;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const { addToast } = useToast();
  const [seating, setSeating] = useState<Seating>(initialSeating);
  const [history, setHistory] = useState<Seating[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const tableOf = useMemo(() => tableOfMap(seating), [seating]);
  const rules = useMemo(() => evaluateRules(tableOf), [tableOf]);

  const brokenTableIds = useMemo(() => {
    const ids = new Set<string>();
    for (const r of rules) {
      if (r.status === "broken") r.tableIds.forEach((t) => ids.add(t));
    }
    return ids;
  }, [rules]);

  const stats = useMemo<Stats>(() => {
    const attendingGuests = GUESTS.filter((g) => g.rsvp === "yes");
    const perTable: Record<string, number> = {};
    for (const t of TABLES) perTable[t.id] = seating[t.id].filter(Boolean).length;
    const seated = Object.values(perTable).reduce((a, b) => a + b, 0);
    const capacity = TABLES.reduce((a, t) => a + t.seats, 0);
    return {
      attending: attendingGuests.length,
      seated,
      seatedAttending: attendingGuests.filter((g) => tableOf[g.id]).length,
      unseated: attendingGuests.filter((g) => !tableOf[g.id]),
      unconfirmed: GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !tableOf[g.id]),
      capacity,
      free: capacity - seated,
      perTable,
    };
  }, [seating, tableOf]);

  const commit = useCallback(
    (next: Seating, message: string) => {
      setHistory((h) => [...h.slice(-49), seating]);
      setSeating(next);
      setAnnouncement(message);
    },
    [seating],
  );

  const warn = useCallback(
    (message: string) => {
      setAnnouncement(message);
      addToast({ tone: "danger", message });
    },
    [addToast],
  );

  const seat = useCallback(
    (guestId: string, tableId: string, seatIndex?: number) => {
      const guest = GUEST_BY_ID[guestId];
      const table = TABLE_BY_ID[tableId];
      if (!guest || !table) return;
      if (guest.rsvp === "no") {
        warn(`${guest.name} has declined and cannot be seated.`);
        return;
      }
      const current = tableOf[guestId];
      if (seatIndex === undefined && current === tableId) return;
      const target = seatIndex ?? seating[tableId].indexOf(null);
      if (target < 0) {
        warn(`${table.name} is full. Pick another table or an exact seat to swap.`);
        return;
      }
      if (seating[tableId][target] === guestId) return;
      const next = cloneSeating(seating);
      const occupantId = next[tableId][target];
      let oldIndex = -1;
      if (current) {
        oldIndex = next[current].indexOf(guestId);
        next[current][oldIndex] = null;
      }
      next[tableId][target] = guestId;
      if (occupantId && current) next[current][oldIndex] = occupantId;
      let message = `${guest.name} seated at ${table.name}, seat ${target + 1}.`;
      if (occupantId) {
        const occupant = GUEST_BY_ID[occupantId];
        message += current
          ? ` ${occupant.name} moved to ${TABLE_BY_ID[current].name}.`
          : ` ${occupant.name} is now unseated.`;
      }
      commit(next, message);
    },
    [commit, seating, tableOf, warn],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const current = tableOf[guestId];
      if (!current) return;
      const next = cloneSeating(seating);
      next[current] = next[current].map((s) => (s === guestId ? null : s));
      commit(next, `${GUEST_BY_ID[guestId].name} unseated from ${TABLE_BY_ID[current].name}.`);
    },
    [commit, seating, tableOf],
  );

  const placePicked = useCallback(
    (tableId: string, seatIndex?: number) => {
      if (!picked) return;
      seat(picked, tableId, seatIndex);
      setPicked(null);
      setSelectedTable(tableId);
    },
    [picked, seat],
  );

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      setSeating(h[h.length - 1]);
      setAnnouncement("Last change undone.");
      return h.slice(0, -1);
    });
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
      tableOf,
      stats,
      rules,
      brokenTableIds,
      selectedTable,
      selectTable: setSelectedTable,
      picked,
      pick: setPicked,
      dragId,
      setDragId,
      seat,
      placePicked,
      unseat,
      undo,
      canUndo: history.length > 0,
      announcement,
    }),
    [seating, tableOf, stats, rules, brokenTableIds, selectedTable, picked, dragId, seat, placePicked, unseat, undo, history.length, announcement],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
```

```tsx components/AppFrame.tsx
"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Avatar, Column, Icon, Row, Text, ToggleButton, VisuallyHidden } from "@once-ui-system/core";
import { APP_NAME, EVENT, PLANNER } from "@/lib/data";
import { formatEventDate, initials } from "@/lib/plan";

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <Column fillWidth flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row
        as="header"
        fillWidth
        height="56"
        paddingX="16"
        gap="16"
        vertical="center"
        background="surface"
        borderBottom
        position="sticky"
        top="0"
        zIndex={2}>
        <Row gap="8" vertical="center" fit>
          <Row width={32} height={32} radius="m" background="brand-alpha-medium" center fit>
            <Icon name="people" size="s" onBackground="brand-strong" />
          </Row>
          <Text textVariant="heading-strong-s">{APP_NAME}</Text>
        </Row>
        <Row s={{ hide: true }} fit>
          <Column gap="2" fit>
            <Text textVariant="label-strong-s">{EVENT.name}</Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {formatEventDate(EVENT.date)} · {EVENT.venue}
            </Text>
          </Column>
        </Row>
        <Row as="nav" aria-label="Main" gap="4" marginLeft="auto" vertical="center" fit>
          <ToggleButton href="/" label="Plan" prefixIcon="grid" selected={pathname === "/"} />
          <ToggleButton href="/guests" label="Guests" prefixIcon="people" selected={pathname.startsWith("/guests")} />
        </Row>
        <Row gap="8" vertical="center" fit s={{ hide: true }}>
          <Avatar size="s" value={initials(PLANNER.name)} />
          <Text textVariant="label-default-s">{PLANNER.name}</Text>
        </Row>
      </Row>
      <Column as="main" id="main" fillWidth horizontal="center" flex={1}>
        {children}
      </Column>
    </Column>
  );
}
```

```tsx components/GuestChip.tsx
"use client";

import type { ReactNode } from "react";
import { Avatar, Column, Icon, Row, Tag, Text } from "@once-ui-system/core";
import type { Guest } from "@/lib/data";
import { initials } from "@/lib/plan";
import { usePlan } from "./PlanProvider";

export function GuestChip({
  guest,
  active,
  onClick,
  hint,
  trailing,
}: {
  guest: Guest;
  active: boolean;
  onClick: () => void;
  hint?: string;
  trailing?: ReactNode;
}) {
  const { setDragId } = usePlan();
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", guest.id);
        e.dataTransfer.effectAllowed = "move";
        setDragId(guest.id);
      }}
      onDragEnd={() => setDragId(null)}
      style={{ width: "100%", display: "flex", gap: 4, alignItems: "stretch" }}>
      <Row
        as="button"
        type="button"
        flex={1}
        aria-pressed={active}
        aria-label={`${guest.name}${guest.diet ? `, ${guest.diet}` : ""}. ${hint ?? "Pick up to place"}`}
        onClick={onClick}
        gap="12"
        padding="8"
        radius="m"
        vertical="center"
        cursor="interactive"
        background={active ? "brand-alpha-weak" : "neutral-alpha-weak"}
        border={active ? "brand-alpha-strong" : "transparent"}>
        <Icon name="grip" size="xs" onBackground="neutral-weak" />
        <Avatar size="s" value={initials(guest.name)} />
        <Column flex={1} gap="2" horizontal="start">
          <Text textVariant="label-strong-s">{guest.name}</Text>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            {guest.party}
          </Text>
        </Column>
        {guest.diet ? <Tag tone="accent" size="s" label={guest.diet} /> : null}
      </Row>
      {trailing}
    </div>
  );
}
```

```tsx components/FloorPlan.tsx
"use client";

import type { CSSProperties, DragEvent, KeyboardEvent, MouseEvent } from "react";
import { Button, Column, Heading, Icon, Row, Text } from "@once-ui-system/core";
import { EVENT, FIXTURES, GUEST_BY_ID, TABLES, type TableDef } from "@/lib/data";
import { SEAT_R, initials, seatLayout } from "@/lib/plan";
import { usePlan } from "./PlanProvider";

const { width: ROOM_W, depth: ROOM_D } = EVENT.room_m;

const INK: CSSProperties = {
  fill: "var(--neutral-on-background-strong)",
  pointerEvents: "none",
  userSelect: "none",
};
const INK_WEAK: CSSProperties = {
  fill: "var(--neutral-on-background-weak)",
  pointerEvents: "none",
  userSelect: "none",
};

function Fixtures() {
  return (
    <g>
      {FIXTURES.map((f) => {
        const cx = f.x + f.w / 2;
        const cy = f.y + f.h / 2;
        if (f.kind === "door") {
          return (
            <g key={f.id} role="img" aria-label={f.label}>
              <rect
                x={f.x}
                y={f.y}
                width={f.w}
                height={f.h}
                rx={0.1}
                style={{ fill: "var(--success-solid-strong)", opacity: 0.85 }}
              />
              <text
                transform={`translate(-0.24 ${cy}) rotate(-90)`}
                textAnchor="middle"
                style={{ ...INK_WEAK, fontSize: 0.34, fontWeight: 600 }}>
                {f.label}
              </text>
            </g>
          );
        }
        const look: CSSProperties =
          f.kind === "stage"
            ? { fill: "var(--neutral-alpha-medium)", stroke: "var(--neutral-alpha-strong)" }
            : f.kind === "dancefloor"
              ? { fill: "var(--brand-alpha-weak)", stroke: "var(--brand-alpha-medium)", strokeDasharray: "0.2 0.12" }
              : { fill: "var(--accent-alpha-weak)", stroke: "var(--accent-alpha-medium)" };
        return (
          <g key={f.id} role="img" aria-label={f.label}>
            <rect
              x={f.x}
              y={f.y}
              width={f.w}
              height={f.h}
              rx={f.kind === "dancefloor" ? 0.2 : 0.12}
              style={{ ...look, strokeWidth: 0.06 }}
            />
            <text
              x={cx}
              y={cy + 0.12}
              textAnchor="middle"
              style={{ ...INK, fontSize: 0.4, fontWeight: 600 }}>
              {f.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function TableNode({ table }: { table: TableDef }) {
  const {
    seating,
    selectedTable,
    selectTable,
    picked,
    pick,
    dragId,
    setDragId,
    seat,
    placePicked,
    brokenTableIds,
  } = usePlan();
  const layout = seatLayout(table);
  const slots = seating[table.id];
  const filled = slots.filter(Boolean).length;
  const selected = selectedTable === table.id;
  const broken = brokenTableIds.has(table.id);
  const full = filled === table.seats;
  const droppable = (picked !== null || dragId !== null) && !full;
  const rotation = table.rotation ?? 0;

  const activate = () => {
    if (picked) placePicked(table.id);
    else selectTable(table.id);
  };

  const onDragOver = (e: DragEvent<SVGElement>) => {
    if (dragId === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const dropAt = (e: DragEvent<SVGElement>, index?: number) => {
    e.preventDefault();
    e.stopPropagation();
    const id = e.dataTransfer.getData("text/plain");
    setDragId(null);
    if (id && GUEST_BY_ID[id]) {
      seat(id, table.id, index);
      selectTable(table.id);
    }
  };

  const bodyStroke = broken
    ? "var(--danger-solid-strong)"
    : selected
      ? "var(--brand-solid-strong)"
      : "var(--neutral-alpha-strong)";

  const label = `${table.name}, ${filled} of ${table.seats} seats filled${broken ? ", a seating rule is broken" : ""}${
    picked ? `. Place ${GUEST_BY_ID[picked].name} here` : ""
  }`;

  const body = layout.body;

  return (
    <g transform={`translate(${table.x} ${table.y}) rotate(${rotation})`}>
      <g
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-pressed={selected}
        style={{ cursor: "pointer" }}
        onClick={activate}
        onKeyDown={(e: KeyboardEvent<SVGGElement>) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            activate();
          }
        }}
        onDragOver={onDragOver}
        onDrop={(e) => dropAt(e)}>
        <rect
          x={layout.hit.x}
          y={layout.hit.y}
          width={layout.hit.w}
          height={layout.hit.h}
          rx={0.5}
          style={{
            fill: "transparent",
            stroke: droppable ? "var(--brand-solid-strong)" : "none",
            strokeWidth: 0.05,
            strokeDasharray: "0.15 0.12",
          }}
        />
        {body.kind === "round" ? (
          <circle
            r={body.r}
            style={{
              fill: selected ? "var(--brand-alpha-weak)" : "var(--neutral-alpha-weak)",
              stroke: bodyStroke,
              strokeWidth: broken || selected ? 0.12 : 0.06,
            }}
          />
        ) : (
          <rect
            x={-body.w / 2}
            y={-body.h / 2}
            width={body.w}
            height={body.h}
            rx={0.2}
            style={{
              fill: selected ? "var(--brand-alpha-weak)" : "var(--neutral-alpha-weak)",
              stroke: bodyStroke,
              strokeWidth: broken || selected ? 0.12 : 0.06,
            }}
          />
        )}
        <g transform={`rotate(${-rotation})`}>
          <text
            textAnchor="middle"
            y={body.kind === "round" ? -0.04 : -0.06}
            style={{ ...INK, fontSize: 0.34, fontWeight: 700 }}>
            {table.name}
          </text>
          <text
            textAnchor="middle"
            y={body.kind === "round" ? 0.36 : 0.3}
            style={{ ...INK_WEAK, fontSize: 0.3, fontWeight: 600 }}>
            {filled}/{table.seats}
          </text>
          {broken ? (
            <g transform={`translate(${body.kind === "round" ? -body.r * 0.58 : -body.w / 2 + 0.34} ${body.kind === "round" ? -body.r * 0.58 : 0})`}>
              <circle r={0.2} style={{ fill: "var(--danger-solid-strong)" }} />
              <text textAnchor="middle" y={0.1} style={{ fill: "white", fontSize: 0.28, fontWeight: 800, pointerEvents: "none" }}>
                !
              </text>
            </g>
          ) : null}
        </g>
      </g>
      {layout.seats.map((p, i) => {
        const guestId = slots[i];
        const guest = guestId ? GUEST_BY_ID[guestId] : null;
        const isPicked = guestId !== null && guestId === picked;
        const onSeatClick = (e: MouseEvent<SVGGElement>) => {
          e.stopPropagation();
          selectTable(table.id);
          if (picked) {
            if (guestId === picked) {
              pick(null);
              return;
            }
            placePicked(table.id, i);
          } else if (guestId) {
            pick(guestId);
          }
        };
        const dragProps = guest ? { draggable: true } : {};
        return (
          <g
            key={i}
            {...dragProps}
            role="button"
            tabIndex={-1}
            aria-label={guest ? `${table.name} seat ${i + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}` : `${table.name} seat ${i + 1}: empty`}
            transform={`translate(${p.x} ${p.y})`}
            style={{ cursor: "pointer" }}
            onClick={onSeatClick}
            onDragStart={(e: DragEvent<SVGGElement>) => {
              if (!guest) return;
              e.dataTransfer.setData("text/plain", guest.id);
              e.dataTransfer.effectAllowed = "move";
              setDragId(guest.id);
            }}
            onDragEnd={() => setDragId(null)}
            onDragOver={onDragOver}
            onDrop={(e) => dropAt(e, i)}>
            <title>{guest ? `${guest.name}${guest.diet ? ` (${guest.diet})` : ""}` : `Empty seat ${i + 1}`}</title>
            <circle
              r={SEAT_R}
              style={
                guest
                  ? {
                      fill: "var(--brand-alpha-medium)",
                      stroke: isPicked ? "var(--brand-solid-strong)" : "var(--brand-alpha-strong)",
                      strokeWidth: isPicked ? 0.14 : 0.05,
                    }
                  : {
                      fill: "transparent",
                      stroke: droppable ? "var(--brand-solid-strong)" : "var(--neutral-alpha-strong)",
                      strokeWidth: 0.05,
                      strokeDasharray: "0.12 0.1",
                    }
              }
            />
            {guest ? (
              <g transform={`rotate(${-rotation})`}>
                <text
                  textAnchor="middle"
                  y={0.11}
                  style={{ ...INK, fontSize: 0.32, fontWeight: 700 }}>
                  {initials(guest.name)}
                </text>
                {guest.diet ? (
                  <circle cx={0.26} cy={-0.26} r={0.1} style={{ fill: "var(--warning-solid-strong)", pointerEvents: "none" }} />
                ) : null}
              </g>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

export function FloorPlan() {
  const { picked, pick, undo, canUndo } = usePlan();
  const pickedGuest = picked ? GUEST_BY_ID[picked] : null;

  return (
    <Column background="surface" border radius="l" fillWidth overflow="hidden">
      <Row paddingX="16" paddingY="12" gap="12" vertical="center" wrap borderBottom>
        <Column gap="2" flex={1}>
          <Heading as="h2" textVariant="heading-strong-m">
            Room plan
          </Heading>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            {EVENT.venue}, {ROOM_W} × {ROOM_D} m, drawn to scale
          </Text>
        </Column>
        <Row gap="12" vertical="center" wrap>
          <Row gap="4" vertical="center" fit>
            <Icon name="check" size="xs" onBackground="brand-medium" />
            <Text textVariant="body-default-xs" onBackground="neutral-weak">Seated</Text>
          </Row>
          <Row gap="4" vertical="center" fit>
            <Icon name="warning" size="xs" onBackground="warning-strong" />
            <Text textVariant="body-default-xs" onBackground="neutral-weak">Dietary need</Text>
          </Row>
          <Row gap="4" vertical="center" fit>
            <Icon name="danger" size="xs" onBackground="danger-strong" />
            <Text textVariant="body-default-xs" onBackground="neutral-weak">Rule broken</Text>
          </Row>
          <Button variant="secondary" size="s" prefixIcon="return" onClick={undo} disabled={!canUndo}>
            Undo
          </Button>
        </Row>
      </Row>
      {pickedGuest ? (
        <Row
          paddingX="16"
          paddingY="8"
          gap="12"
          vertical="center"
          wrap
          background="brand-alpha-weak"
          borderBottom>
          <Icon name="enter" size="s" onBackground="brand-strong" />
          <Text textVariant="label-default-s" flex={1}>
            Placing {pickedGuest.name}. Tap a table or an empty seat (Esc cancels).
          </Text>
          <Button variant="tertiary" size="s" onClick={() => pick(null)}>
            Cancel
          </Button>
        </Row>
      ) : null}
      <Row overflowX="auto" fillWidth padding="8">
        <svg
          viewBox={`-0.7 -0.5 ${ROOM_W + 1.4} ${ROOM_D + 1.4}`}
          role="group"
          aria-label={`Floor plan of ${EVENT.venue}, ${ROOM_W} by ${ROOM_D} metres`}
          style={{ width: "100%", minWidth: 760, flexShrink: 0, height: "auto", display: "block" }}>
          <rect
            x={0}
            y={0}
            width={ROOM_W}
            height={ROOM_D}
            rx={0.3}
            style={{ fill: "var(--surface-background, transparent)", stroke: "var(--neutral-alpha-strong)", strokeWidth: 0.1 }}
          />
          <Fixtures />
          {TABLES.map((t) => (
            <TableNode key={t.id} table={t} />
          ))}
          <g aria-hidden="true">
            <line x1={0} y1={14.62} x2={5} y2={14.62} style={{ stroke: "var(--neutral-on-background-weak)", strokeWidth: 0.07 }} />
            <line x1={0} y1={14.45} x2={0} y2={14.79} style={{ stroke: "var(--neutral-on-background-weak)", strokeWidth: 0.07 }} />
            <line x1={5} y1={14.45} x2={5} y2={14.79} style={{ stroke: "var(--neutral-on-background-weak)", strokeWidth: 0.07 }} />
            <text x={5.3} y={14.74} style={{ ...INK_WEAK, fontSize: 0.34 }}>
              5 m
            </text>
          </g>
        </svg>
      </Row>
    </Column>
  );
}
```

```tsx components/TableStrip.tsx
"use client";

import { Row, ToggleButton } from "@once-ui-system/core";
import { TABLES } from "@/lib/data";
import { usePlan } from "./PlanProvider";

export function TableStrip() {
  const { stats, selectedTable, selectTable, brokenTableIds, picked, placePicked } = usePlan();
  return (
    <Row as="ul" gap="8" wrap fillWidth aria-label="Seats filled per table">
      {TABLES.map((t) => {
        const n = stats.perTable[t.id];
        const broken = brokenTableIds.has(t.id);
        return (
          <li key={t.id} style={{ listStyle: "none" }}>
            <ToggleButton
              label={`${t.name} ${n}/${t.seats}`}
              size="s"
              variant="outline"
              prefixIcon={broken ? "danger" : undefined}
              tone={broken ? "danger" : "neutral"}
              selected={selectedTable === t.id}
              aria-label={`${t.name}, ${n} of ${t.seats} seats filled${broken ? ", rule broken" : ""}${picked ? ", place the picked guest here" : ""}`}
              onClick={() => (picked ? placePicked(t.id) : selectTable(t.id))}
            />
          </li>
        );
      })}
    </Row>
  );
}
```

```tsx components/UnseatedPanel.tsx
"use client";

import { useState } from "react";
import { Column, Heading, Icon, Row, Tag, Text } from "@once-ui-system/core";
import { GUEST_BY_ID } from "@/lib/data";
import { GuestChip } from "./GuestChip";
import { usePlan } from "./PlanProvider";

export function UnseatedPanel() {
  const { stats, picked, pick, unseat, dragId, setDragId, tableOf } = usePlan();
  const [over, setOver] = useState(false);
  const canUnseat = dragId !== null && tableOf[dragId] !== null && tableOf[dragId] !== undefined;

  return (
    <div
      onDragOver={(e) => {
        if (!canUnseat) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData("text/plain");
        setDragId(null);
        if (id && GUEST_BY_ID[id]) unseat(id);
      }}
      style={{ width: "100%" }}>
      <Column
        background="surface"
        border={over || canUnseat ? "brand-alpha-strong" : true}
        borderStyle={over || canUnseat ? "dashed" : "solid"}
        radius="l"
        padding="16"
        gap="12"
        fillWidth>
        <Row gap="8" vertical="center">
          <Heading as="h2" textVariant="heading-strong-m" flex={1}>
            To seat
          </Heading>
          <Tag tone={stats.unseated.length === 0 ? "success" : "brand"} size="s" label={`${stats.unseated.length} attending`} />
        </Row>
        {canUnseat ? (
          <Text textVariant="body-default-s" onBackground="brand-strong">
            Drop here to unseat.
          </Text>
        ) : null}
        {stats.unseated.length === 0 ? (
          <Row gap="8" vertical="center" padding="12" radius="m" background="success-alpha-weak">
            <Icon name="check" size="s" onBackground="success-strong" />
            <Text textVariant="body-default-s">Everyone attending has a seat.</Text>
          </Row>
        ) : (
          <Column gap="4" fillWidth>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              Drag a guest onto a table, or tap a guest and then a table or seat.
            </Text>
            {stats.unseated.map((g) => (
              <GuestChip
                key={g.id}
                guest={g}
                active={picked === g.id}
                onClick={() => pick(picked === g.id ? null : g.id)}
              />
            ))}
          </Column>
        )}
        {stats.unconfirmed.length > 0 ? (
          <Column gap="4" fillWidth paddingTop="8">
            <Text textVariant="label-strong-s" onBackground="neutral-weak">
              Not confirmed yet ({stats.unconfirmed.length})
            </Text>
            {stats.unconfirmed.map((g) => (
              <GuestChip
                key={g.id}
                guest={g}
                active={picked === g.id}
                hint={`RSVP ${g.rsvp}`}
                onClick={() => pick(picked === g.id ? null : g.id)}
                trailing={
                  <Row vertical="center" paddingX="4" fit>
                    <Tag tone={g.rsvp === "maybe" ? "warning" : "neutral"} size="s" label={g.rsvp === "maybe" ? "Maybe" : "Pending"} />
                  </Row>
                }
              />
            ))}
          </Column>
        ) : null}
      </Column>
    </div>
  );
}
```

```tsx components/TablePanel.tsx
"use client";

import { Column, Heading, Icon, IconButton, Row, Tag, Text } from "@once-ui-system/core";
import { GUEST_BY_ID, TABLE_BY_ID } from "@/lib/data";
import { GuestChip } from "./GuestChip";
import { usePlan } from "./PlanProvider";

export function TablePanel() {
  const { selectedTable, selectTable, seating, picked, pick, unseat, placePicked, rules } = usePlan();

  if (!selectedTable) {
    return (
      <Column background="surface" border radius="l" padding="16" gap="8" fillWidth>
        <Heading as="h2" textVariant="heading-strong-m">
          Table details
        </Heading>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Select a table on the plan to see who sits there and what they need to eat.
        </Text>
      </Column>
    );
  }

  const table = TABLE_BY_ID[selectedTable];
  const slots = seating[selectedTable];
  const guests = slots.filter((s): s is string => s !== null).map((id) => GUEST_BY_ID[id]);
  const diets = new Map<string, number>();
  for (const g of guests) if (g.diet) diets.set(g.diet, (diets.get(g.diet) ?? 0) + 1);
  const related = rules.filter((r) => r.tableIds.includes(selectedTable) && r.status !== "kept");

  return (
    <Column background="surface" border radius="l" padding="16" gap="12" fillWidth aria-live="polite">
      <Row gap="8" vertical="center">
        <Column flex={1} gap="2">
          <Heading as="h2" textVariant="heading-strong-m">
            {table.name}
          </Heading>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            {guests.length} of {table.seats} seats filled · {table.seats - guests.length} free
          </Text>
        </Column>
        <IconButton icon="close" variant="tertiary" size="s" tooltip="Close" aria-label="Close table details" onClick={() => selectTable(null)} />
      </Row>

      {related.map((r) => (
        <Row key={r.id} gap="8" padding="8" radius="m" background={r.status === "broken" ? "danger-alpha-weak" : "neutral-alpha-weak"} vertical="start">
          <Icon name={r.status === "broken" ? "danger" : "time"} size="s" onBackground={r.status === "broken" ? "danger-strong" : "neutral-weak"} />
          <Text textVariant="body-default-s">{r.title}. {r.detail}</Text>
        </Row>
      ))}

      <Column gap="4">
        <Text textVariant="label-strong-s" onBackground="neutral-weak">
          Dietary needs
        </Text>
        {diets.size === 0 ? (
          <Text textVariant="body-default-s">No dietary needs at this table.</Text>
        ) : (
          <Row gap="4" wrap>
            {Array.from(diets.entries()).map(([diet, n]) => (
              <Tag key={diet} tone="accent" size="s" label={`${n} × ${diet}`} />
            ))}
          </Row>
        )}
      </Column>

      <Column as="ol" gap="4" fillWidth>
        {slots.map((id, i) => {
          const g = id ? GUEST_BY_ID[id] : null;
          return (
            <li key={i} style={{ listStyle: "none" }}>
              {g ? (
                <GuestChip
                  guest={g}
                  active={picked === g.id}
                  hint={`Seat ${i + 1}. Tap to move`}
                  onClick={() => pick(picked === g.id ? null : g.id)}
                  trailing={
                    <IconButton
                      icon="personRemove"
                      variant="tertiary"
                      size="s"
                      tooltip="Unseat"
                      aria-label={`Unseat ${g.name}`}
                      onClick={() => unseat(g.id)}
                    />
                  }
                />
              ) : (
                <Row
                  as="button"
                  type="button"
                  fillWidth
                  gap="12"
                  padding="8"
                  radius="m"
                  vertical="center"
                  borderStyle="dashed"
                  border="neutral-alpha-medium"
                  cursor="interactive"
                  aria-label={`${table.name} seat ${i + 1}: empty${picked ? `. Place ${GUEST_BY_ID[picked].name} here` : ""}`}
                  onClick={() => {
                    if (picked) placePicked(table.id, i);
                  }}>
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    Seat {i + 1} · empty
                  </Text>
                </Row>
              )}
            </li>
          );
        })}
      </Column>
    </Column>
  );
}
```

```tsx components/RulesPanel.tsx
"use client";

import { Column, Heading, Icon, Row, Tag, Text } from "@once-ui-system/core";
import { usePlan } from "./PlanProvider";

export function RulesPanel() {
  const { rules, selectTable } = usePlan();
  const broken = rules.filter((r) => r.status === "broken").length;
  const kept = rules.filter((r) => r.status === "kept").length;
  const waiting = rules.filter((r) => r.status === "waiting").length;

  return (
    <Column background="surface" border={broken > 0 ? "danger-alpha-medium" : true} radius="l" padding="16" gap="12" fillWidth>
      <Row gap="8" vertical="center" wrap>
        <Heading as="h2" textVariant="heading-strong-m" flex={1}>
          Couple&apos;s rules
        </Heading>
        <Tag tone={broken > 0 ? "danger" : "success"} size="s" label={broken > 0 ? `${broken} broken` : "None broken"} />
      </Row>
      <Text textVariant="body-default-xs" onBackground="neutral-weak">
        {kept} kept · {waiting} waiting for guests to be seated · {broken} broken
      </Text>
      <Column as="ul" gap="8" fillWidth>
        {rules.map((r) => (
          <li key={r.id} style={{ listStyle: "none" }}>
            <Row
              as="button"
              type="button"
              fillWidth
              gap="12"
              padding="8"
              radius="m"
              vertical="start"
              horizontal="start"
              cursor="interactive"
              background={r.status === "broken" ? "danger-alpha-weak" : "transparent"}
              aria-label={`${r.title}. ${r.status === "broken" ? "Broken" : r.status === "kept" ? "Kept" : "Waiting"}. ${r.detail}`}
              onClick={() => {
                if (r.tableIds.length > 0) selectTable(r.tableIds[0]);
              }}>
              <Icon
                name={r.status === "broken" ? "danger" : r.status === "kept" ? "check" : "time"}
                size="s"
                onBackground={r.status === "broken" ? "danger-strong" : r.status === "kept" ? "success-strong" : "neutral-weak"}
              />
              <Column gap="2" flex={1} horizontal="start">
                <Text textVariant="label-strong-s">{r.title}</Text>
                <Text textVariant="body-default-xs" onBackground="neutral-weak">
                  {r.detail}
                </Text>
                <Text textVariant="body-default-xs" onBackground="neutral-medium">
                  {r.rule.note}
                </Text>
              </Column>
            </Row>
          </li>
        ))}
      </Column>
    </Column>
  );
}
```

```tsx components/PlanView.tsx
"use client";

import { Column, Grid, Heading, Row, Text, VisuallyHidden } from "@once-ui-system/core";
import { FloorPlan } from "./FloorPlan";
import { usePlan } from "./PlanProvider";
import { RulesPanel } from "./RulesPanel";
import { TablePanel } from "./TablePanel";
import { TableStrip } from "./TableStrip";
import { UnseatedPanel } from "./UnseatedPanel";

function Stat({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "danger" }) {
  return (
    <Column background="surface" border={tone === "danger" ? "danger-alpha-medium" : true} radius="l" padding="16" gap="4">
      <Text textVariant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text textVariant="display-strong-xs" onBackground={tone === "danger" ? "danger-strong" : "neutral-strong"}>
        {value}
      </Text>
      <Text textVariant="body-default-xs" onBackground="neutral-weak">
        {sub}
      </Text>
    </Column>
  );
}

export function PlanView() {
  const { stats, rules, announcement } = usePlan();
  const broken = rules.filter((r) => r.status === "broken").length;

  return (
    <Column fillWidth maxWidth="96rem" paddingX="16" paddingY="16" gap="16">
      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>
      <Row vertical="end" gap="16" wrap>
        <Column gap="4" flex={1}>
          <Heading as="h1" textVariant="display-strong-xs">
            Seating plan
          </Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            Seat guests by dragging them onto a table, or tap a guest and then a table or seat.
          </Text>
        </Column>
      </Row>

      <Grid columns="4" s={{ columns: "2" }} gap="12" fillWidth>
        <Stat label="Seated" value={String(stats.seated)} sub={`of ${stats.attending} attending guests`} />
        <Stat label="Still to seat" value={String(stats.unseated.length)} sub="attending, no seat yet" />
        <Stat label="Free seats" value={String(stats.free)} sub={`of ${stats.capacity} across 7 tables`} />
        <Stat
          label="Rules broken"
          value={String(broken)}
          sub={broken === 0 ? "all the couple's rules hold" : "see the rules list"}
          tone={broken > 0 ? "danger" : undefined}
        />
      </Grid>

      <Row fillWidth gap="16" vertical="start" m={{ direction: "column" }}>
        <Column flex={1} minWidth={0} gap="12" m={{ width: "100%" }}>
          <FloorPlan />
          <TableStrip />
        </Column>
        <Column width="24rem" gap="16" m={{ width: "100%", maxWidth: "100%" }}>
          <RulesPanel />
          <UnseatedPanel />
          <TablePanel />
        </Column>
      </Row>
    </Column>
  );
}
```

```tsx components/GuestsView.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  Input,
  Row,
  Select,
  Tag,
  Text,
} from "@once-ui-system/core";
import { DIETS, GUESTS, PARTIES, TABLE_BY_ID, type Guest, type Rsvp } from "@/lib/data";
import { RSVP_LABEL, RSVP_TONE, initials, mealOf } from "@/lib/plan";
import { usePlan } from "./PlanProvider";

type SortKey = "name" | "party" | "rsvp" | "table";

const RSVP_ORDER: Record<Rsvp, number> = { yes: 0, maybe: 1, pending: 2, no: 3 };

function one(v: string | string[]): string {
  return Array.isArray(v) ? (v[0] ?? "all") : v;
}

const cellStyle = { padding: "10px 12px", textAlign: "left" as const, verticalAlign: "middle" as const };
const rowLine = { borderTop: "1px solid var(--neutral-alpha-weak)" };

export function GuestsView() {
  const { tableOf } = usePlan();
  const [query, setQuery] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState("all");
  const [diet, setDiet] = useState("all");
  const [seating, setSeating] = useState("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "name", dir: 1 });

  const tableLabel = (g: Guest): string => {
    const t = tableOf[g.id];
    return t ? TABLE_BY_ID[t].name : g.rsvp === "no" ? "Declined" : "Not seated";
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = GUESTS.filter((g) => {
      if (q && !`${g.name} ${g.party} ${g.diet ?? ""}`.toLowerCase().includes(q)) return false;
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === "none" && g.diet !== null) return false;
      if (diet !== "all" && diet !== "none" && g.diet !== diet) return false;
      if (seating === "seated" && !tableOf[g.id]) return false;
      if (seating === "unseated" && (tableOf[g.id] || g.rsvp === "no")) return false;
      return true;
    });
    const value = (g: Guest): string | number => {
      if (sort.key === "name") return g.name;
      if (sort.key === "party") return g.party;
      if (sort.key === "rsvp") return RSVP_ORDER[g.rsvp];
      return tableLabel(g);
    };
    return list.sort((a, b) => {
      const va = value(a);
      const vb = value(b);
      const c = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
      return c * sort.dir || a.name.localeCompare(b.name);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, party, rsvp, diet, seating, sort, tableOf]);

  const meals = useMemo(() => {
    const map = new Map<string, { confirmed: number; seated: number; open: number }>();
    for (const g of GUESTS) {
      if (g.rsvp === "no") continue;
      const key = mealOf(g);
      const row = map.get(key) ?? { confirmed: 0, seated: 0, open: 0 };
      if (g.rsvp === "yes") {
        row.confirmed += 1;
        if (tableOf[g.id]) row.seated += 1;
      } else {
        row.open += 1;
      }
      map.set(key, row);
    }
    const keys = Array.from(map.keys()).sort((a, b) =>
      a === "Standard" ? -1 : b === "Standard" ? 1 : a.localeCompare(b),
    );
    return keys.map((k) => ({ meal: k, ...(map.get(k) as { confirmed: number; seated: number; open: number }) }));
  }, [tableOf]);

  const totals = meals.reduce(
    (a, m) => ({ confirmed: a.confirmed + m.confirmed, seated: a.seated + m.seated, open: a.open + m.open }),
    { confirmed: 0, seated: 0, open: 0 },
  );
  const special = totals.confirmed - (meals.find((m) => m.meal === "Standard")?.confirmed ?? 0);

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }));

  const header = (key: SortKey, label: string) => (
    <th
      scope="col"
      style={cellStyle}
      aria-sort={sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
      <Row
        as="button"
        type="button"
        gap="4"
        vertical="center"
        cursor="interactive"
        onClick={() => toggleSort(key)}
        aria-label={`Sort by ${label}`}>
        <Text textVariant="label-strong-s" onBackground="neutral-weak">
          {label}
        </Text>
        {sort.key === key ? <Icon name={sort.dir === 1 ? "arrowDown" : "arrowUp"} size="xs" /> : null}
      </Row>
    </th>
  );

  return (
    <Column fillWidth maxWidth="96rem" paddingX="16" paddingY="16" gap="16">
      <Row gap="16" vertical="end" wrap>
        <Column gap="4" flex={1}>
          <Heading as="h1" textVariant="display-strong-xs">
            Guest list
          </Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            {GUESTS.length} invited · {totals.confirmed} attending · {GUESTS.filter((g) => g.rsvp === "no").length} declined ·{" "}
            {totals.open} awaiting an answer
          </Text>
        </Column>
        <Button variant="secondary" prefixIcon="document" onClick={() => window.print()}>
          Print for the caterer
        </Button>
      </Row>

      <Row fillWidth gap="16" vertical="start" m={{ direction: "column" }}>
        <Column flex={1} minWidth={0} gap="12" m={{ width: "100%" }}>
          <Column background="surface" border radius="l" padding="16" gap="12" fillWidth>
            <Grid columns="5" m={{ columns: "3" }} s={{ columns: "1" }} gap="12" fillWidth>
              <Input
                id="guest-search"
                label="Search guests"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                prefix={<Icon name="search" size="s" />}
              />
              <Select
                id="filter-party"
                label="Party"
                value={party}
                onValueChange={(v) => setParty(one(v))}
                options={[{ value: "all", label: "All parties" }, ...PARTIES.map((p) => ({ value: p, label: p }))]}
              />
              <Select
                id="filter-rsvp"
                label="RSVP"
                value={rsvp}
                onValueChange={(v) => setRsvp(one(v))}
                options={[
                  { value: "all", label: "Any RSVP" },
                  ...(["yes", "maybe", "pending", "no"] as Rsvp[]).map((r) => ({ value: r, label: RSVP_LABEL[r] })),
                ]}
              />
              <Select
                id="filter-diet"
                label="Diet"
                value={diet}
                onValueChange={(v) => setDiet(one(v))}
                options={[
                  { value: "all", label: "Any diet" },
                  { value: "none", label: "No dietary need" },
                  ...DIETS.map((d) => ({ value: d, label: d })),
                ]}
              />
              <Select
                id="filter-seating"
                label="Seating"
                value={seating}
                onValueChange={(v) => setSeating(one(v))}
                options={[
                  { value: "all", label: "Seated or not" },
                  { value: "seated", label: "Seated" },
                  { value: "unseated", label: "Needs a seat" },
                ]}
              />
            </Grid>
            <Row gap="8" vertical="center">
              <Text textVariant="body-default-s" onBackground="neutral-weak" role="status" aria-live="polite">
                Showing {rows.length} of {GUESTS.length} guests
              </Text>
              {query || party !== "all" || rsvp !== "all" || diet !== "all" || seating !== "all" ? (
                <Button
                  variant="tertiary"
                  size="s"
                  onClick={() => {
                    setQuery("");
                    setParty("all");
                    setRsvp("all");
                    setDiet("all");
                    setSeating("all");
                  }}>
                  Clear filters
                </Button>
              ) : null}
            </Row>
          </Column>

          <Column background="surface" border radius="l" fillWidth overflowX="auto">
            <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse" }}>
              <caption style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                Guests with party, RSVP, dietary need and table
              </caption>
              <thead>
                <tr>
                  {header("name", "Guest")}
                  {header("party", "Party")}
                  {header("rsvp", "RSVP")}
                  <th scope="col" style={cellStyle}>
                    <Text textVariant="label-strong-s" onBackground="neutral-weak">
                      Meal
                    </Text>
                  </th>
                  {header("table", "Table")}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr style={rowLine}>
                    <td colSpan={5} style={{ ...cellStyle, padding: 24 }}>
                      <Text textVariant="body-default-s" onBackground="neutral-weak">
                        No guest matches these filters.
                      </Text>
                    </td>
                  </tr>
                ) : (
                  rows.map((g) => {
                    const t = tableOf[g.id];
                    return (
                      <tr key={g.id} style={rowLine}>
                        <td style={cellStyle}>
                          <Row gap="12" vertical="center">
                            <Avatar size="s" value={initials(g.name)} />
                            <Text textVariant="label-strong-s">{g.name}</Text>
                          </Row>
                        </td>
                        <td style={cellStyle}>
                          <Text textVariant="body-default-s">{g.party}</Text>
                        </td>
                        <td style={cellStyle}>
                          <Tag tone={RSVP_TONE[g.rsvp]} size="s" label={RSVP_LABEL[g.rsvp]} />
                        </td>
                        <td style={cellStyle}>
                          {g.diet ? (
                            <Tag tone="accent" size="s" label={g.diet} />
                          ) : (
                            <Text textVariant="body-default-s" onBackground="neutral-weak">
                              Standard
                            </Text>
                          )}
                        </td>
                        <td style={cellStyle}>
                          {t ? (
                            <Text textVariant="label-strong-s">{TABLE_BY_ID[t].name}</Text>
                          ) : (
                            <Text textVariant="body-default-s" onBackground={g.rsvp === "yes" ? "warning-strong" : "neutral-weak"}>
                              {tableLabel(g)}
                            </Text>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </Column>
        </Column>

        <Column width="26rem" m={{ width: "100%", maxWidth: "100%" }} background="surface" border radius="l" padding="16" gap="12">
          <Column gap="2">
            <Heading as="h2" textVariant="heading-strong-m">
              Meals for the caterer
            </Heading>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              Confirmed guests only. Guests who have not answered are counted separately.
            </Text>
          </Column>
          <Row gap="12" wrap>
            <Tag tone="brand" size="m" label={`${totals.confirmed} meals`} />
            <Tag tone="accent" size="m" label={`${special} special`} />
          </Row>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <caption style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                Meal counts
              </caption>
              <thead>
                <tr>
                  {["Meal", "Confirmed", "Seated", "Not confirmed"].map((h, i) => (
                    <th key={h} scope="col" style={{ ...cellStyle, padding: "6px 8px", textAlign: i === 0 ? "left" : "right" }}>
                      <Text textVariant="label-default-xs" onBackground="neutral-weak">
                        {h}
                      </Text>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {meals.map((m) => (
                  <tr key={m.meal} style={rowLine}>
                    <th scope="row" style={{ ...cellStyle, padding: "8px" }}>
                      <Text textVariant="label-default-s">{m.meal}</Text>
                    </th>
                    {[m.confirmed, m.seated, m.open].map((n, i) => (
                      <td key={i} style={{ ...cellStyle, padding: "8px", textAlign: "right" }}>
                        <Text textVariant={i === 0 ? "label-strong-s" : "body-default-s"} onBackground={n === 0 ? "neutral-weak" : "neutral-strong"}>
                          {n}
                        </Text>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "2px solid var(--neutral-alpha-medium)" }}>
                  <th scope="row" style={{ ...cellStyle, padding: "8px" }}>
                    <Text textVariant="label-strong-s">Total</Text>
                  </th>
                  {[totals.confirmed, totals.seated, totals.open].map((n, i) => (
                    <td key={i} style={{ ...cellStyle, padding: "8px", textAlign: "right" }}>
                      <Text textVariant="label-strong-s">{n}</Text>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </Column>
      </Row>
    </Column>
  );
}
```

```tsx app/page.tsx
import { PlanView } from "@/components/PlanView";

export default function Page() {
  return <PlanView />;
}
```

```tsx app/guests/page.tsx
import type { Metadata } from "next";
import { GuestsView } from "@/components/GuestsView";

export const metadata: Metadata = { title: "Guests · Seatwise" };

export default function GuestsPage() {
  return <GuestsView />;
}
```

```tsx app/layout.tsx
import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "./fonts.css";

import type { Metadata } from "next";
import { Column, Flex } from "@once-ui-system/core";
import { AppFrame } from "@/components/AppFrame";
import { PlanProvider } from "@/components/PlanProvider";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Seatwise · Ines & Mateo's wedding dinner",
  description: "Seating planner for wedding and event planners.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="html" lang="en" suppressHydrationWarning>
      <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
        <Providers>
          <PlanProvider>
            <AppFrame>{children}</AppFrame>
          </PlanProvider>
        </Providers>
      </Column>
    </Flex>
  );
}
```
