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

export interface Rule {
  kind: "together" | "apart" | "near";
  guests: string[];
  note: string;
  /** near rules: the fixture the guest should be close to */
  target?: string;
  /** near rules: the fixture the guest should be away from */
  avoid?: string;
}

export const APP_NAME = "Seatwise";

export const EVENT = {
  name: "Ines & Mateo's wedding dinner",
  date: "2027-06-19",
  dateLabel: "Saturday 19 June 2027",
  venue: "The Orangery, Hollin Hall",
};

export const ROOM = { width: 24, depth: 14 };

export const PLANNER = { name: "Hannah Brook", initials: "HB" };

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

function g(
  id: string,
  name: string,
  party: string,
  rsvp: Rsvp,
  diet: string | null,
  table: string | null,
): Guest {
  return { id, name, party, rsvp, diet, table };
}

export const GUESTS: Guest[] = [
  g("g-01", "Ines Carvalho", "Couple", "yes", null, "t-head"),
  g("g-02", "Mateo Alvarez", "Couple", "yes", "Vegetarian", "t-head"),
  g("g-03", "Rui Carvalho", "Bride's family", "yes", null, "t-head"),
  g("g-04", "Marta Carvalho", "Bride's family", "yes", "Gluten free", "t-head"),
  g("g-05", "Javier Alvarez", "Groom's family", "yes", null, "t-head"),
  g("g-06", "Lucia Alvarez", "Groom's family", "yes", null, "t-head"),
  g("g-07", "Sofia Carvalho", "Bride's family", "yes", null, "t-1"),
  g("g-08", "Tiago Carvalho", "Bride's family", "yes", null, "t-1"),
  g("g-09", "Avó Rosa Carvalho", "Bride's family", "yes", "Soft food", "t-1"),
  g("g-10", "Pedro Nunes", "Bride's family", "yes", null, "t-1"),
  g("g-11", "Ana Nunes", "Bride's family", "yes", "Vegan", "t-1"),
  g("g-12", "Carmen Alvarez", "Groom's family", "yes", null, "t-4"),
  g("g-13", "Diego Alvarez", "Groom's family", "yes", null, "t-4"),
  g("g-14", "Elena Ruiz", "Groom's family", "yes", "Nut allergy", "t-4"),
  g("g-15", "Pablo Ruiz", "Groom's family", "yes", null, "t-4"),
  g("g-16", "Isabel Ruiz", "Groom's family", "maybe", null, null),
  g("g-17", "Chloe Martin", "University friends", "yes", null, "t-2"),
  g("g-18", "Ben Okafor", "University friends", "yes", null, "t-2"),
  g("g-19", "Leila Haddad", "University friends", "yes", "Halal", "t-2"),
  g("g-20", "Omar Haddad", "University friends", "yes", "Halal", "t-2"),
  g("g-21", "Freya Lund", "University friends", "yes", "Vegetarian", null),
  g("g-22", "Jonas Lund", "University friends", "yes", null, null),
  g("g-23", "Grace Lee", "Work friends", "yes", null, "t-5"),
  g("g-24", "Marcus Webb", "Work friends", "yes", null, "t-5"),
  g("g-25", "Nadia Petrova", "Work friends", "yes", "Pescatarian", "t-5"),
  g("g-26", "Tom Fisher", "Work friends", "no", null, null),
  g("g-27", "Hana Sato", "Work friends", "yes", null, null),
  g("g-28", "Luis Ortega", "Groom's football club", "yes", null, "t-3"),
  g("g-29", "Kai Brennan", "Groom's football club", "yes", null, "t-3"),
  g("g-30", "Sean Doyle", "Groom's football club", "yes", null, "t-3"),
  g("g-31", "Ryan Doyle", "Groom's football club", "yes", null, null),
  g("g-32", "Hugo Carvalho", "Bride's family", "yes", "Children's menu", "t-1"),
  g("g-33", "Mia Carvalho", "Bride's family", "yes", "Children's menu", null),
  g("g-34", "Paula Mendes", "Bride's family", "pending", null, null),
  g("g-35", "Victor Mendes", "Bride's family", "pending", null, null),
  g("g-36", "Zoe Bennett", "Plus-ones", "yes", null, "t-2"),
  g("g-37", "Arjun Mehta", "Plus-ones", "yes", "Vegetarian", "t-5"),
  g("g-38", "Laura Svensson", "Plus-ones", "yes", null, null),
];

export const RULES: Rule[] = [
  { kind: "together", guests: ["g-21", "g-22"], note: "Couple" },
  { kind: "together", guests: ["g-32", "g-33"], note: "Siblings, under 10" },
  {
    kind: "apart",
    guests: ["g-29", "g-30"],
    note: "Brothers Sean and Ryan Doyle are not speaking",
  },
  {
    kind: "apart",
    guests: ["g-12", "g-34"],
    note: "Ask the couple: old family dispute",
  },
  {
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
    target: "f-4",
    avoid: "f-1",
  },
];

export const GUEST_BY_ID: Record<string, Guest> = Object.fromEntries(
  GUESTS.map((x) => [x.id, x]),
);
export const TABLE_BY_ID: Record<string, TableDef> = Object.fromEntries(
  TABLES.map((x) => [x.id, x]),
);
export const FIXTURE_BY_ID: Record<string, Fixture> = Object.fromEntries(
  FIXTURES.map((x) => [x.id, x]),
);

export const PARTIES: string[] = Array.from(new Set(GUESTS.map((x) => x.party)));
export const DIETS: string[] = Array.from(
  new Set(GUESTS.map((x) => x.diet).filter((d): d is string => d !== null)),
).sort();

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "No reply yet",
  no: "Declined",
};

export const STANDARD_MEAL = "Standard menu";

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
```

```ts lib/rules.ts
import {
  FIXTURE_BY_ID,
  GUEST_BY_ID,
  RULES,
  TABLE_BY_ID,
  type Fixture,
  type Rule,
} from "./data";

export type RuleStatus = "ok" | "broken" | "pending";

export interface RuleResult {
  index: number;
  kind: Rule["kind"];
  status: RuleStatus;
  title: string;
  message: string;
  note: string;
  /** tables the rule is about right now (where its guests sit) */
  tables: string[];
}

/** A "seat near" guest must sit within this many metres of the target fixture. */
export const NEAR_M = 4;
/** ...and at least this far from the fixture to avoid. */
export const AWAY_M = 6;

function centre(f: Fixture): { x: number; y: number } {
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

function metres(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.round(Math.hypot(a.x - b.x, a.y - b.y) * 10) / 10;
}

function names(ids: string[]): string {
  return ids.map((id) => GUEST_BY_ID[id].name).join(" and ");
}

function unique(list: string[]): string[] {
  return Array.from(new Set(list));
}

export function evaluateRules(tableOf: Record<string, string | null>): RuleResult[] {
  return RULES.map((rule, index): RuleResult => {
    const seated = rule.guests.filter((id) => tableOf[id]);
    const missing = rule.guests.filter((id) => !tableOf[id]);
    const tables = unique(seated.map((id) => tableOf[id] as string));
    const tName = (id: string) => TABLE_BY_ID[id].name;
    const base = { index, kind: rule.kind, note: rule.note, tables };

    if (rule.kind === "together") {
      const title = `Keep together: ${names(rule.guests)}`;
      if (tables.length > 1) {
        return {
          ...base,
          status: "broken",
          title,
          message: `Split across ${tables.map(tName).join(" and ")}.`,
        };
      }
      if (missing.length > 0) {
        return {
          ...base,
          status: "pending",
          title,
          message: `${names(missing)} not seated yet.`,
        };
      }
      return { ...base, status: "ok", title, message: `Together at ${tName(tables[0])}.` };
    }

    if (rule.kind === "apart") {
      const title = `Keep apart: ${names(rule.guests)}`;
      const clash = tables.length < seated.length;
      if (clash) {
        return {
          ...base,
          status: "broken",
          title,
          message: `Both at ${tName(tables[0])}.`,
        };
      }
      if (missing.length > 0) {
        return {
          ...base,
          status: "pending",
          title,
          message: `${names(missing)} not seated yet. No clash so far.`,
        };
      }
      return {
        ...base,
        status: "ok",
        title,
        message: `At ${tables.map(tName).join(" and ")}.`,
      };
    }

    // near
    const title = `Seat near ${FIXTURE_BY_ID[rule.target ?? "f-4"].label.toLowerCase()}: ${names(rule.guests)}`;
    if (missing.length > 0) {
      return {
        ...base,
        status: "pending",
        title,
        message: `${names(missing)} not seated yet.`,
      };
    }
    const target = centre(FIXTURE_BY_ID[rule.target ?? "f-4"]);
    const avoid = rule.avoid ? centre(FIXTURE_BY_ID[rule.avoid]) : null;
    const table = TABLE_BY_ID[tables[0]];
    const toTarget = metres(table, target);
    const toAvoid = avoid ? metres(table, avoid) : null;
    if (toTarget > NEAR_M) {
      return {
        ...base,
        status: "broken",
        title,
        message: `${table.name} is ${toTarget} m from the ${FIXTURE_BY_ID[rule.target ?? "f-4"].label.toLowerCase()}; aim for ${NEAR_M} m or less.`,
      };
    }
    if (toAvoid !== null && toAvoid < AWAY_M) {
      return {
        ...base,
        status: "broken",
        title,
        message: `${table.name} is only ${toAvoid} m from the ${FIXTURE_BY_ID[rule.avoid ?? "f-1"].label.toLowerCase()}.`,
      };
    }
    return {
      ...base,
      status: "ok",
      title,
      message: `${table.name} is ${toTarget} m from the ${FIXTURE_BY_ID[rule.target ?? "f-4"].label.toLowerCase()}.`,
    };
  });
}
```

```tsx lib/plan.tsx
"use client";

import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import { GUEST_BY_ID, GUESTS, TABLE_BY_ID, TABLES } from "./data";
import { evaluateRules, type RuleResult } from "./rules";

type Seating = Record<string, Array<string | null>>;

interface State {
  seating: Seating;
  selectedTable: string | null;
  armed: string | null;
  notice: string;
}

type Action =
  | { type: "place"; guest: string; table: string; seat?: number }
  | { type: "unseat"; guest: string }
  | { type: "select"; table: string | null }
  | { type: "arm"; guest: string | null };

function initialSeating(): Seating {
  const seating: Seating = {};
  for (const t of TABLES) seating[t.id] = new Array<string | null>(t.seats).fill(null);
  for (const guest of GUESTS) {
    if (!guest.table) continue;
    const row = seating[guest.table];
    const free = row.indexOf(null);
    if (free >= 0) row[free] = guest.id;
  }
  return seating;
}

function locate(seating: Seating, guestId: string): { table: string; seat: number } | null {
  for (const t of TABLES) {
    const seat = seating[t.id].indexOf(guestId);
    if (seat >= 0) return { table: t.id, seat };
  }
  return null;
}

function cloneSeating(seating: Seating): Seating {
  const next: Seating = {};
  for (const key of Object.keys(seating)) next[key] = [...seating[key]];
  return next;
}

const INITIAL_NOTICE = "Tap a guest, then a table. Or drag guests onto tables.";

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "select":
      return { ...state, selectedTable: action.table };
    case "arm":
      return { ...state, armed: action.guest };
    case "unseat": {
      const from = locate(state.seating, action.guest);
      if (!from) return { ...state, armed: null };
      const next = cloneSeating(state.seating);
      next[from.table][from.seat] = null;
      return {
        ...state,
        seating: next,
        armed: null,
        notice: `${GUEST_BY_ID[action.guest].name} is now unseated.`,
      };
    }
    case "place": {
      const guest = GUEST_BY_ID[action.guest];
      const table = TABLE_BY_ID[action.table];
      if (!guest || !table) return state;
      if (guest.rsvp === "no") {
        return {
          ...state,
          armed: null,
          notice: `${guest.name} has declined and cannot be seated.`,
        };
      }
      const from = locate(state.seating, guest.id);
      const row = state.seating[table.id];
      const target = action.seat !== undefined ? action.seat : row.indexOf(null);
      if (from && from.table === table.id && (action.seat === undefined || action.seat === from.seat)) {
        return { ...state, armed: null, selectedTable: table.id };
      }
      if (target < 0) {
        return { ...state, notice: `${table.name} is full. Pick another table or free a seat.` };
      }
      const next = cloneSeating(state.seating);
      const occupant = next[table.id][target];
      if (from) next[from.table][from.seat] = null;
      next[table.id][target] = guest.id;
      let notice = `${guest.name} seated at ${table.name}, seat ${target + 1}.`;
      if (occupant && occupant !== guest.id) {
        if (from) {
          next[from.table][from.seat] = occupant;
          notice = `${guest.name} and ${GUEST_BY_ID[occupant].name} swapped seats.`;
        } else {
          notice = `${guest.name} seated at ${table.name}. ${GUEST_BY_ID[occupant].name} is now unseated.`;
        }
      }
      return { ...state, seating: next, armed: null, selectedTable: table.id, notice };
    }
    default:
      return state;
  }
}

export interface PlanStats {
  attending: number;
  seated: number;
  unseatedAttending: number;
  awaiting: number;
  freeSeats: number;
  totalSeats: number;
  perTable: Record<string, { filled: number; cap: number }>;
  broken: number;
  pending: number;
}

interface PlanContextValue {
  seating: Seating;
  selectedTable: string | null;
  armed: string | null;
  notice: string;
  tableOf: Record<string, string | null>;
  results: RuleResult[];
  stats: PlanStats;
  place: (guest: string, table: string, seat?: number) => void;
  unseat: (guest: string) => void;
  selectTable: (table: string | null) => void;
  arm: (guest: string | null) => void;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, (): State => ({
    seating: initialSeating(),
    selectedTable: null,
    armed: null,
    notice: INITIAL_NOTICE,
  }));

  const actions = useMemo(
    () => ({
      place: (guest: string, table: string, seat?: number) =>
        dispatch({ type: "place", guest, table, seat }),
      unseat: (guest: string) => dispatch({ type: "unseat", guest }),
      selectTable: (table: string | null) => dispatch({ type: "select", table }),
      arm: (guest: string | null) => dispatch({ type: "arm", guest }),
    }),
    [],
  );

  const derived = useMemo(() => {
    const tableOf: Record<string, string | null> = {};
    for (const guest of GUESTS) tableOf[guest.id] = null;
    const perTable: PlanStats["perTable"] = {};
    let seated = 0;
    let totalSeats = 0;
    for (const t of TABLES) {
      let filled = 0;
      for (const id of state.seating[t.id]) {
        if (id) {
          tableOf[id] = t.id;
          filled += 1;
        }
      }
      perTable[t.id] = { filled, cap: t.seats };
      seated += filled;
      totalSeats += t.seats;
    }
    const results = evaluateRules(tableOf);
    const attending = GUESTS.filter((x) => x.rsvp === "yes").length;
    const unseatedAttending = GUESTS.filter((x) => x.rsvp === "yes" && !tableOf[x.id]).length;
    const awaiting = GUESTS.filter(
      (x) => (x.rsvp === "maybe" || x.rsvp === "pending") && !tableOf[x.id],
    ).length;
    const stats: PlanStats = {
      attending,
      seated,
      unseatedAttending,
      awaiting,
      freeSeats: totalSeats - seated,
      totalSeats,
      perTable,
      broken: results.filter((r) => r.status === "broken").length,
      pending: results.filter((r) => r.status === "pending").length,
    };
    return { tableOf, results, stats };
  }, [state.seating]);

  const value: PlanContextValue = {
    seating: state.seating,
    selectedTable: state.selectedTable,
    armed: state.armed,
    notice: state.notice,
    ...derived,
    ...actions,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}
```

```ts lib/useWide.ts
"use client";

import { useCallback, useSyncExternalStore } from "react";

/** True when the viewport is at least `minPx` wide. Server and first paint assume wide. */
export function useWide(minPx = 1100): boolean {
  const query = `(min-width: ${minPx}px)`;
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => true,
  );
}
```

```ts components/ui.ts
import type { CSSProperties } from "react";

export const C = {
  surface: "var(--surface-background, #fff)",
  page: "var(--page-background, #f6f6f6)",
  text: "var(--neutral-on-background-strong, currentColor)",
  textWeak: "var(--neutral-on-background-weak, currentColor)",
  line: "var(--neutral-alpha-medium, rgba(128,128,128,0.3))",
  lineWeak: "var(--neutral-alpha-weak, rgba(128,128,128,0.15))",
  lineStrong: "var(--neutral-alpha-strong, rgba(128,128,128,0.5))",
  brand: "var(--brand-solid-strong, currentColor)",
  brandBg: "var(--brand-background-strong, transparent)",
  brandOn: "var(--brand-on-background-strong, currentColor)",
  brandTint: "color-mix(in srgb, var(--brand-solid-strong, currentColor) 14%, transparent)",
  danger: "var(--danger-solid-strong, currentColor)",
  dangerTint: "color-mix(in srgb, var(--danger-solid-strong, currentColor) 12%, transparent)",
  warning: "var(--warning-solid-strong, currentColor)",
  success: "var(--success-solid-strong, currentColor)",
  accent: "var(--accent-solid-strong, currentColor)",
} as const;

export const resetButton: CSSProperties = {
  font: "inherit",
  color: "inherit",
  background: "none",
  border: "none",
  padding: 0,
  margin: 0,
  cursor: "pointer",
  textAlign: "left",
};
```

```tsx components/AppShell.tsx
"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Avatar, Button, Column, Icon, Row, Text, VisuallyHidden } from "@once-ui-system/core";
import { APP_NAME, EVENT, PLANNER } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { C } from "./ui";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { stats } = usePlan();
  const onGuests = pathname.startsWith("/guests");

  return (
    <Column fillWidth minHeight="100vh">
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row
        as="header"
        fillWidth
        background="surface"
        borderBottom
        paddingX="16"
        paddingY="12"
        gap="16"
        wrap
        vertical="center"
        horizontal="between"
      >
        <Row gap="12" vertical="center">
          <Row
            width={40}
            height={40}
            radius="m"
            center
            style={{ background: C.brand, flexShrink: 0 }}
            aria-hidden="true"
          >
            <Icon name="people" size="s" onSolid="brand-strong" />
          </Row>
          <Column gap="2">
            <Text textVariant="heading-strong-s">{APP_NAME}</Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak" s={{ hide: true }}>
              {EVENT.name} · {EVENT.dateLabel} · {EVENT.venue}
            </Text>
          </Column>
        </Row>

        <Row as="nav" aria-label="Main" gap="4" vertical="center">
          <Button
            href="/"
            size="s"
            variant={onGuests ? "ghost" : "secondary"}
            prefixIcon="grid"
            aria-current={onGuests ? undefined : "page"}
          >
            Plan
          </Button>
          <Button
            href="/guests"
            size="s"
            variant={onGuests ? "secondary" : "ghost"}
            prefixIcon="people"
            aria-current={onGuests ? "page" : undefined}
          >
            Guests
          </Button>
        </Row>

        <Row gap="12" vertical="center">
          <Column gap="2" align="end" s={{ hide: true }}>
            <Text textVariant="label-default-s">{PLANNER.name}</Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {stats.seated} seated · {stats.unseatedAttending} to place
            </Text>
          </Column>
          <Avatar value={PLANNER.initials} size="s" />
        </Row>
      </Row>

      <Column as="main" id="main" fillWidth paddingX="16" paddingY="20" horizontal="center">
        <Column fillWidth maxWidth="100rem" gap="16">
          {children}
        </Column>
      </Column>
    </Column>
  );
}
```

```tsx components/Plan.tsx
"use client";

import { useMemo, useState, type CSSProperties, type DragEvent } from "react";
import {
  FIXTURES,
  GUEST_BY_ID,
  ROOM,
  TABLES,
  initials,
  type Fixture,
  type TableDef,
} from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { C, resetButton } from "./ui";

const SEAT = 0.66;
const ROUND_BOX = 3.2;
const ROUND_TOP = 1.8;
const ROUND_RING = 1.22;
const LONG_W = 6.6;
const LONG_H = 2.8;
const LONG_TOP_W = 5.4;
const LONG_TOP_H = 1.1;

function boxOf(t: TableDef): { w: number; h: number } {
  return t.shape === "long" ? { w: LONG_W, h: LONG_H } : { w: ROUND_BOX, h: ROUND_BOX };
}

/** Seat centres in metres, relative to the table's box. */
function seatCentres(t: TableDef): Array<{ x: number; y: number }> {
  const { w, h } = boxOf(t);
  if (t.shape === "round") {
    return Array.from({ length: t.seats }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
      return { x: w / 2 + ROUND_RING * Math.cos(a), y: h / 2 + ROUND_RING * Math.sin(a) };
    });
  }
  const perSide = Math.ceil(t.seats / 2);
  const spacing = 1.3;
  const out: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < t.seats; i += 1) {
    const top = i < perSide;
    const idx = top ? i : i - perSide;
    const count = top ? perSide : t.seats - perSide;
    out.push({
      x: w / 2 + (idx - (count - 1) / 2) * spacing,
      y: top ? h / 2 - 0.97 : h / 2 + 0.97,
    });
  }
  return out;
}

const px = (m: number, of: number) => `${(m / of) * 100}%`;

function fixtureStyle(f: Fixture): CSSProperties {
  const base: CSSProperties = {
    position: "absolute",
    left: px(f.x, ROOM.width),
    top: px(f.y, ROOM.depth),
    width: px(f.w, ROOM.width),
    height: px(f.h, ROOM.depth),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 600,
    color: C.textWeak,
    boxSizing: "border-box",
    pointerEvents: "none",
  };
  switch (f.kind) {
    case "stage":
      return { ...base, background: C.lineWeak, border: `1px solid ${C.lineStrong}`, borderRadius: 6 };
    case "dancefloor":
      return { ...base, background: C.brandTint, border: `1px dashed ${C.brand}`, borderRadius: 6 };
    case "bar":
      return { ...base, background: C.lineWeak, border: `1px solid ${C.lineStrong}`, borderRadius: 6 };
    default:
      return { ...base, background: C.warning, borderRadius: 2 };
  }
}

export function Plan() {
  const { seating, selectedTable, armed, results, place, selectTable, arm, stats } = usePlan();
  const [over, setOver] = useState<string | null>(null);

  const brokenTables = useMemo(() => {
    const set = new Set<string>();
    for (const r of results) if (r.status === "broken") for (const id of r.tables) set.add(id);
    return set;
  }, [results]);

  const readDragged = (e: DragEvent): string | null => {
    const id = e.dataTransfer.getData("text/plain");
    return GUEST_BY_ID[id] ? id : null;
  };

  const onTable = (t: TableDef) => {
    if (armed) place(armed, t.id);
    else selectTable(selectedTable === t.id ? null : t.id);
  };

  const onSeat = (t: TableDef, i: number) => {
    const occupant = seating[t.id][i];
    if (armed) {
      if (armed === occupant) arm(null);
      else place(armed, t.id, i);
      return;
    }
    selectTable(t.id);
    if (occupant) arm(occupant);
  };

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.line}`,
        borderRadius: 16,
        padding: 12,
      }}
    >
      <div style={{ overflowX: "auto", paddingBottom: 4 }}>
        <div style={{ minWidth: 760 }}>
          <div
            role="group"
            aria-label={`Room plan, ${ROOM.width} by ${ROOM.depth} metres, drawn to scale`}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: `${ROOM.width} / ${ROOM.depth}`,
              background: C.page,
              backgroundImage: `linear-gradient(to right, ${C.lineWeak} 1px, transparent 1px), linear-gradient(to bottom, ${C.lineWeak} 1px, transparent 1px)`,
              backgroundSize: `${100 / ROOM.width}% ${100 / ROOM.depth}%`,
              border: `2px solid ${C.lineStrong}`,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {FIXTURES.map((f) => (
              <div key={f.id} style={fixtureStyle(f)}>
                {f.kind === "door" ? (
                  <span
                    style={{
                      position: "absolute",
                      left: "100%",
                      top: "50%",
                      transform: "translateY(-50%) rotate(180deg)",
                      writingMode: "vertical-rl",
                      marginLeft: 3,
                      fontSize: 10,
                      whiteSpace: "nowrap",
                      color: C.textWeak,
                    }}
                  >
                    {f.label}
                  </span>
                ) : (
                  f.label
                )}
              </div>
            ))}

            {TABLES.map((t) => {
              const box = boxOf(t);
              const seats = seatCentres(t);
              const info = stats.perTable[t.id];
              const isSelected = selectedTable === t.id;
              const isBroken = brokenTables.has(t.id);
              const isOver = over === t.id;
              const topW = t.shape === "long" ? LONG_TOP_W : ROUND_TOP;
              const topH = t.shape === "long" ? LONG_TOP_H : ROUND_TOP;
              const ring = isOver || isSelected ? C.brand : isBroken ? C.danger : C.lineStrong;
              return (
                <div
                  key={t.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (over !== t.id) setOver(t.id);
                  }}
                  onDragLeave={() => setOver((cur) => (cur === t.id ? null : cur))}
                  onDrop={(e) => {
                    e.preventDefault();
                    setOver(null);
                    const id = readDragged(e);
                    if (id) place(id, t.id);
                  }}
                  style={{
                    position: "absolute",
                    left: px(t.x - box.w / 2, ROOM.width),
                    top: px(t.y - box.h / 2, ROOM.depth),
                    width: px(box.w, ROOM.width),
                    aspectRatio: `${box.w} / ${box.h}`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onTable(t)}
                    aria-pressed={isSelected}
                    aria-label={`${t.name}, ${info.filled} of ${info.cap} seats filled${
                      isBroken ? ", a seating rule is broken" : ""
                    }`}
                    style={{
                      ...resetButton,
                      position: "absolute",
                      left: px((box.w - topW) / 2, box.w),
                      top: px((box.h - topH) / 2, box.h),
                      width: px(topW, box.w),
                      height: px(topH, box.h),
                      borderRadius: t.shape === "round" ? "50%" : 10,
                      background: isOver ? C.brandTint : isBroken ? C.dangerTint : C.surface,
                      border: `${isSelected || isBroken || isOver ? 3 : 2}px solid ${ring}`,
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      gap: 1,
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.1, color: C.text }}>
                      {t.name}
                    </span>
                    <span style={{ fontSize: 10, lineHeight: 1.1, color: isBroken ? C.danger : C.textWeak, fontWeight: 600 }}>
                      {info.filled}/{info.cap}
                      {isBroken ? " !" : ""}
                    </span>
                  </button>

                  {seats.map((c, i) => {
                    const gid = seating[t.id][i];
                    const guest = gid ? GUEST_BY_ID[gid] : null;
                    const isArmed = gid !== null && gid === armed;
                    return (
                      <button
                        key={i}
                        type="button"
                        draggable={guest !== null}
                        onDragStart={(e) => {
                          if (!gid) return;
                          e.dataTransfer.setData("text/plain", gid);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (over !== t.id) setOver(t.id);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOver(null);
                          const id = readDragged(e);
                          if (id) place(id, t.id, i);
                        }}
                        onClick={() => onSeat(t, i)}
                        aria-label={
                          guest
                            ? `${t.name}, seat ${i + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}`
                            : `${t.name}, seat ${i + 1}: empty`
                        }
                        title={guest ? `${guest.name}${guest.diet ? ` (${guest.diet})` : ""}` : `Empty seat ${i + 1}`}
                        style={{
                          ...resetButton,
                          position: "absolute",
                          left: px(c.x - SEAT / 2, box.w),
                          top: px(c.y - SEAT / 2, box.h),
                          width: px(SEAT, box.w),
                          aspectRatio: "1 / 1",
                          borderRadius: "50%",
                          boxSizing: "border-box",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 9,
                          fontWeight: 700,
                          background: guest ? C.brandBg : "transparent",
                          color: guest ? C.brandOn : C.textWeak,
                          border: guest
                            ? `${isArmed ? 3 : 1}px solid ${isArmed ? C.text : C.brand}`
                            : `1.5px dashed ${C.lineStrong}`,
                          cursor: "pointer",
                        }}
                      >
                        {guest ? initials(guest.name) : ""}
                        {guest && guest.diet ? (
                          <span
                            aria-hidden="true"
                            style={{
                              position: "absolute",
                              top: -2,
                              right: -2,
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: C.accent,
                              border: `1.5px solid ${C.surface}`,
                            }}
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 16,
              marginTop: 10,
              fontSize: 12,
              color: C.textWeak,
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  width: px(5, ROOM.width),
                  minWidth: 60,
                  height: 6,
                  borderLeft: `2px solid ${C.text}`,
                  borderRight: `2px solid ${C.text}`,
                  borderBottom: `2px solid ${C.text}`,
                  boxSizing: "border-box",
                }}
              />
              5 m
            </span>
            <span>
              Room {ROOM.width} × {ROOM.depth} m
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: "50%", background: C.brandBg, border: `1px solid ${C.brand}` }} />
              Seated
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: "50%", border: `1.5px dashed ${C.lineStrong}` }} />
              Empty seat
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent }} />
              Dietary need
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: "50%", border: `3px solid ${C.danger}` }} />
              Rule broken
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

```tsx components/SidePanel.tsx
"use client";

import { useState, type ChangeEvent, type DragEvent } from "react";
import { Button, Column, Heading, Icon, Input, Row, Tag, Text } from "@once-ui-system/core";
import { GUEST_BY_ID, GUESTS, STANDARD_MEAL, TABLE_BY_ID, type Guest } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import type { RuleResult } from "@/lib/rules";
import { C, resetButton } from "./ui";

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <Column background="surface" border radius="l" padding="16" gap="12">
      {children}
    </Column>
  );
}

function statusColor(status: RuleResult["status"]): string {
  if (status === "broken") return C.danger;
  if (status === "pending") return C.warning;
  return C.success;
}

export function RulesPanel() {
  const { results, selectTable } = usePlan();
  const broken = results.filter((r) => r.status === "broken").length;
  const pending = results.filter((r) => r.status === "pending").length;
  return (
    <Panel>
      <Row horizontal="between" vertical="center" gap="8" wrap>
        <Heading as="h2" textVariant="heading-strong-s">
          Couple&apos;s rules
        </Heading>
        {broken > 0 ? (
          <Tag tone="danger" size="s" prefixIcon="danger" label={`${broken} broken`} />
        ) : (
          <Tag tone="success" size="s" prefixIcon="check" label="None broken" />
        )}
      </Row>
      <Text textVariant="body-default-s" onBackground="neutral-weak" aria-live="polite">
        {broken} broken, {pending} waiting for a seat, {results.length - broken - pending} kept.
      </Text>
      <Column as="ul" gap="8" margin="0" padding="0">
        {results.map((r) => (
          <li key={r.index} style={{ listStyle: "none" }}>
            <button
              type="button"
              disabled={r.tables.length === 0}
              onClick={() => r.tables[0] && selectTable(r.tables[0])}
              style={{
                ...resetButton,
                display: "flex",
                gap: 10,
                width: "100%",
                padding: 10,
                borderRadius: 10,
                border: `1px solid ${r.status === "broken" ? C.danger : C.lineWeak}`,
                background: r.status === "broken" ? C.dangerTint : "transparent",
                cursor: r.tables.length ? "pointer" : "default",
              }}
            >
              <span style={{ color: statusColor(r.status), flexShrink: 0, marginTop: 1 }}>
                <Icon
                  name={r.status === "ok" ? "check" : r.status === "broken" ? "danger" : "time"}
                  size="s"
                />
              </span>
              <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{r.title}</span>
                <span style={{ fontSize: 12, color: statusColor(r.status), fontWeight: 600 }}>
                  {r.status === "broken" ? "Broken: " : r.status === "pending" ? "Waiting: " : "Kept: "}
                  <span style={{ fontWeight: 400, color: C.text }}>{r.message}</span>
                </span>
                <span style={{ fontSize: 12, color: C.textWeak }}>{r.note}</span>
              </span>
            </button>
          </li>
        ))}
      </Column>
    </Panel>
  );
}

export function TablePanel() {
  const { selectedTable, seating, arm, armed, unseat, results, stats } = usePlan();
  if (!selectedTable) {
    return (
      <Panel>
        <Heading as="h2" textVariant="heading-strong-s">
          Table details
        </Heading>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Select a table on the plan to see who sits there and what they eat.
        </Text>
      </Panel>
    );
  }
  const table = TABLE_BY_ID[selectedTable];
  const info = stats.perTable[table.id];
  const seats = seating[table.id];
  const guests = seats.filter((id): id is string => id !== null).map((id) => GUEST_BY_ID[id]);
  const diets = new Map<string, number>();
  for (const guest of guests) if (guest.diet) diets.set(guest.diet, (diets.get(guest.diet) ?? 0) + 1);
  const standard = guests.filter((x) => !x.diet).length;
  const ruleHits = results.filter((r) => r.tables.includes(table.id) && r.status === "broken");

  return (
    <Panel>
      <Row horizontal="between" vertical="center" gap="8" wrap>
        <Heading as="h2" textVariant="heading-strong-s">
          {table.name}
        </Heading>
        <Tag
          size="s"
          tone={info.filled === info.cap ? "success" : "neutral"}
          label={`${info.filled} of ${info.cap} seats${info.filled === info.cap ? " (full)" : ""}`}
        />
      </Row>

      {ruleHits.map((r) => (
        <Row key={r.index} gap="8" vertical="start" padding="8" radius="m" style={{ background: C.dangerTint }}>
          <Icon name="danger" size="s" onBackground="danger-strong" />
          <Text textVariant="body-default-s">
            {r.title}. {r.message}
          </Text>
        </Row>
      ))}

      <Column gap="4">
        <Text textVariant="label-default-s" onBackground="neutral-weak">
          Dietary needs at this table
        </Text>
        {diets.size === 0 ? (
          <Text textVariant="body-default-s">None. {standard} on the standard menu.</Text>
        ) : (
          <Row gap="4" wrap>
            {Array.from(diets.entries()).map(([diet, n]) => (
              <Tag key={diet} tone="accent" size="s" label={`${n} × ${diet}`} />
            ))}
            <Tag size="s" label={`${standard} × ${STANDARD_MEAL.toLowerCase()}`} />
          </Row>
        )}
      </Column>

      <Column as="ol" gap="4" margin="0" padding="0">
        {seats.map((id, i) => {
          const guest = id ? GUEST_BY_ID[id] : null;
          return (
            <li
              key={i}
              style={{
                listStyle: "none",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 0",
                borderTop: i === 0 ? "none" : `1px solid ${C.lineWeak}`,
              }}
            >
              <span style={{ width: 18, fontSize: 12, color: C.textWeak }}>{i + 1}</span>
              {guest ? (
                <>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text }}>
                      {guest.name}
                    </span>
                    <span style={{ display: "block", fontSize: 12, color: C.textWeak }}>
                      {guest.party}
                      {guest.diet ? ` · ${guest.diet}` : ""}
                    </span>
                  </span>
                  <Button
                    size="s"
                    variant={armed === guest.id ? "primary" : "secondary"}
                    onClick={() => arm(armed === guest.id ? null : guest.id)}
                    aria-label={`Pick up ${guest.name} to move`}
                  >
                    {armed === guest.id ? "Picked up" : "Move"}
                  </Button>
                  <Button
                    size="s"
                    variant="tertiary"
                    prefixIcon="personRemove"
                    onClick={() => unseat(guest.id)}
                    aria-label={`Unseat ${guest.name}`}
                  >
                    Unseat
                  </Button>
                </>
              ) : (
                <span style={{ flex: 1, fontSize: 13, color: C.textWeak, fontStyle: "italic" }}>
                  Empty seat
                </span>
              )}
            </li>
          );
        })}
      </Column>
    </Panel>
  );
}

function GuestRow({ guest }: { guest: Guest }) {
  const { armed, arm } = usePlan();
  const isArmed = armed === guest.id;
  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", guest.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={() => arm(isArmed ? null : guest.id)}
      aria-pressed={isArmed}
      style={{
        ...resetButton,
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "8px 10px",
        borderRadius: 10,
        border: `${isArmed ? 2 : 1}px solid ${isArmed ? C.brand : C.lineWeak}`,
        background: isArmed ? C.brandTint : "transparent",
        boxSizing: "border-box",
      }}
    >
      <span style={{ color: C.textWeak, display: "inline-flex" }} aria-hidden="true">
        <Icon name="grip" size="xs" />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text }}>
          {guest.name}
        </span>
        <span style={{ display: "block", fontSize: 12, color: C.textWeak }}>
          {guest.party}
          {guest.rsvp === "maybe" ? " · maybe" : guest.rsvp === "pending" ? " · no reply yet" : ""}
        </span>
      </span>
      {guest.diet ? <Tag tone="accent" size="s" label={guest.diet} /> : null}
    </button>
  );
}

export function UnseatedPanel() {
  const { tableOf, unseat, stats } = usePlan();
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const match = (x: Guest) =>
    !query || x.name.toLowerCase().includes(query) || x.party.toLowerCase().includes(query);
  const attending = GUESTS.filter((x) => x.rsvp === "yes" && !tableOf[x.id] && match(x));
  const awaiting = GUESTS.filter(
    (x) => (x.rsvp === "maybe" || x.rsvp === "pending") && !tableOf[x.id] && match(x),
  );
  const [dropping, setDropping] = useState(false);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDropping(false);
    const id = e.dataTransfer.getData("text/plain");
    if (GUEST_BY_ID[id] && tableOf[id]) unseat(id);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDropping(true);
      }}
      onDragLeave={() => setDropping(false)}
      onDrop={onDrop}
      style={{ borderRadius: 16, outline: dropping ? `2px solid ${C.brand}` : "none" }}
    >
      <Panel>
        <Row horizontal="between" vertical="center" gap="8" wrap>
          <Heading as="h2" textVariant="heading-strong-s">
            To seat
          </Heading>
          <Tag
            size="s"
            tone={stats.unseatedAttending === 0 ? "success" : "warning"}
            label={`${stats.unseatedAttending} attending unseated`}
          />
        </Row>
        <Input
          id="unseated-filter"
          label="Find a guest"
          size="s"
          value={q}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
        />
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          Tap a guest, then a table or seat. Drag a seated guest here to unseat them.
        </Text>
        {attending.length === 0 ? (
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            {query ? "No unseated guest matches." : "Everyone attending has a seat."}
          </Text>
        ) : (
          <Column as="ul" gap="8" margin="0" padding="0">
            {attending.map((x) => (
              <li key={x.id} style={{ listStyle: "none" }}>
                <GuestRow guest={x} />
              </li>
            ))}
          </Column>
        )}
        {awaiting.length > 0 ? (
          <Column gap="8">
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              Not confirmed yet ({awaiting.length})
            </Text>
            <Column as="ul" gap="8" margin="0" padding="0">
              {awaiting.map((x) => (
                <li key={x.id} style={{ listStyle: "none" }}>
                  <GuestRow guest={x} />
                </li>
              ))}
            </Column>
          </Column>
        ) : null}
      </Panel>
    </div>
  );
}
```

```tsx components/PlanView.tsx
"use client";

import { useEffect } from "react";
import { Button, Column, Heading, Icon, Row, Text } from "@once-ui-system/core";
import { EVENT, GUEST_BY_ID, TABLE_BY_ID } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { useWide } from "@/lib/useWide";
import { Plan } from "./Plan";
import { RulesPanel, TablePanel, UnseatedPanel } from "./SidePanel";
import { C } from "./ui";

function Stat({ label, value, hint, tone }: { label: string; value: string; hint: string; tone?: string }) {
  return (
    <Column
      background="surface"
      border
      radius="l"
      padding="16"
      gap="4"
      flex="1"
      minWidth="9rem"
    >
      <Text textVariant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <span style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1, color: tone ?? C.text }}>
        {value}
      </span>
      <Text textVariant="body-default-xs" onBackground="neutral-weak">
        {hint}
      </Text>
    </Column>
  );
}

export function PlanView() {
  const wide = useWide(1100);
  const { stats, notice, armed, arm, unseat, tableOf } = usePlan();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") arm(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [arm]);

  const armedGuest = armed ? GUEST_BY_ID[armed] : null;
  const armedTable = armed && tableOf[armed] ? TABLE_BY_ID[tableOf[armed] as string] : null;

  const side = (
    <Column gap="16" flex="1" minWidth="0">
      <RulesPanel />
      <TablePanel />
      <UnseatedPanel />
    </Column>
  );

  return (
    <>
      <Row horizontal="between" vertical="end" gap="16" wrap>
        <Column gap="4">
          <Heading as="h1" textVariant="display-strong-xs">
            Seating plan
          </Heading>
          <Text textVariant="body-default-m" onBackground="neutral-weak">
            {EVENT.name} · {EVENT.venue}
          </Text>
        </Column>
      </Row>

      <Row gap="12" wrap>
        <Stat label="Seated" value={String(stats.seated)} hint={`of ${stats.totalSeats} seats`} />
        <Stat
          label="Attending, unseated"
          value={String(stats.unseatedAttending)}
          hint={`${stats.attending} attending in all`}
          tone={stats.unseatedAttending > 0 ? C.warning : C.success}
        />
        <Stat
          label="Free seats"
          value={String(stats.freeSeats)}
          hint={`${stats.awaiting} guests not confirmed`}
        />
        <Stat
          label="Rules broken"
          value={String(stats.broken)}
          hint={`${stats.pending} waiting for a seat`}
          tone={stats.broken > 0 ? C.danger : C.success}
        />
      </Row>

      <Row
        gap="12"
        vertical="center"
        horizontal="between"
        wrap
        padding="12"
        radius="m"
        border
        background="surface"
      >
        <Row gap="8" vertical="center" flex="1" minWidth="0">
          <Icon name={armedGuest ? "grip" : "info"} size="s" onBackground="brand-strong" />
          <div role="status" aria-live="polite" style={{ fontSize: 14, color: C.text }}>
            {armedGuest
              ? `${armedGuest.name} is picked up${armedTable ? ` from ${armedTable.name}` : ""}. Tap a table to seat them, or a seat to swap. Esc cancels.`
              : notice}
          </div>
        </Row>
        {armedGuest ? (
          <Row gap="8">
            {armedTable ? (
              <Button size="s" variant="secondary" prefixIcon="personRemove" onClick={() => unseat(armedGuest.id)}>
                Unseat
              </Button>
            ) : null}
            <Button size="s" variant="tertiary" onClick={() => arm(null)}>
              Cancel
            </Button>
          </Row>
        ) : null}
      </Row>

      {wide ? (
        <Row gap="16" vertical="start">
          <Column flex="3" minWidth="0">
            <Plan />
          </Column>
          <Column flex="1" style={{ width: "24rem", maxWidth: "24rem", flexShrink: 0 }}>
            {side}
          </Column>
        </Row>
      ) : (
        <Column gap="16">
          <Plan />
          {side}
        </Column>
      )}
    </>
  );
}
```

```tsx components/GuestsView.tsx
"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { Button, Column, Heading, Icon, Input, Row, SegmentedControl, Select, Tag, Text } from "@once-ui-system/core";
import {
  DIETS,
  GUESTS,
  PARTIES,
  RSVP_LABEL,
  STANDARD_MEAL,
  TABLE_BY_ID,
  type Rsvp,
} from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { useWide } from "@/lib/useWide";
import { C } from "./ui";

const RSVP_TONE: Record<Rsvp, "success" | "warning" | "neutral" | "danger"> = {
  yes: "success",
  maybe: "warning",
  pending: "neutral",
  no: "danger",
};

const th: React.CSSProperties = {
  textAlign: "left",
  fontSize: 12,
  fontWeight: 600,
  color: C.textWeak,
  padding: "8px 12px",
  borderBottom: `1px solid ${C.line}`,
  whiteSpace: "nowrap",
};
const td: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: 14,
  borderBottom: `1px solid ${C.lineWeak}`,
  verticalAlign: "middle",
};

export function GuestsView() {
  const wide = useWide(1100);
  const { tableOf } = usePlan();
  const [q, setQ] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState("all");
  const [diet, setDiet] = useState("all");
  const [scope, setScope] = useState("confirmed");

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return GUESTS.filter((x) => {
      if (query && !x.name.toLowerCase().includes(query)) return false;
      if (party !== "all" && x.party !== party) return false;
      if (rsvp !== "all" && x.rsvp !== rsvp) return false;
      if (diet === "none" && x.diet) return false;
      if (diet !== "all" && diet !== "none" && x.diet !== diet) return false;
      return true;
    });
  }, [q, party, rsvp, diet]);

  const meals = useMemo(() => {
    const counted = GUESTS.filter((x) =>
      scope === "confirmed" ? x.rsvp === "yes" : x.rsvp !== "no",
    );
    const map = new Map<string, { total: number; seated: number }>();
    for (const x of counted) {
      const key = x.diet ?? STANDARD_MEAL;
      const cur = map.get(key) ?? { total: 0, seated: 0 };
      cur.total += 1;
      if (tableOf[x.id]) cur.seated += 1;
      map.set(key, cur);
    }
    const list = Array.from(map.entries()).map(([meal, v]) => ({ meal, ...v }));
    list.sort((a, b) => {
      if (a.meal === STANDARD_MEAL) return -1;
      if (b.meal === STANDARD_MEAL) return 1;
      return b.total - a.total || a.meal.localeCompare(b.meal);
    });
    return {
      list,
      total: counted.length,
      seated: counted.filter((x) => tableOf[x.id]).length,
      special: counted.filter((x) => x.diet).length,
    };
  }, [scope, tableOf]);

  const filtersActive = q !== "" || party !== "all" || rsvp !== "all" || diet !== "all";
  const clear = () => {
    setQ("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
  };

  const mealPanel = (
    <Column background="surface" border radius="l" padding="16" gap="12" flex="1" minWidth="0">
      <Row horizontal="between" vertical="center" gap="8" wrap>
        <Heading as="h2" textVariant="heading-strong-s">
          Meals for the caterer
        </Heading>
        <Button
          size="s"
          variant="secondary"
          prefixIcon="document"
          onClick={() => {
            if (typeof window !== "undefined") window.print();
          }}
        >
          Print
        </Button>
      </Row>
      <SegmentedControl
        fillWidth
        compact
        value={scope}
        onValueChange={setScope}
        buttons={[
          { value: "confirmed", label: "Confirmed" },
          { value: "expected", label: "If all reply yes" },
        ]}
      />
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <caption style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          Number of meals by menu
        </caption>
        <thead>
          <tr>
            <th scope="col" style={th}>
              Meal
            </th>
            <th scope="col" style={{ ...th, textAlign: "right" }}>
              Guests
            </th>
            <th scope="col" style={{ ...th, textAlign: "right" }}>
              Seated
            </th>
          </tr>
        </thead>
        <tbody>
          {meals.list.map((m) => (
            <tr key={m.meal}>
              <th scope="row" style={{ ...td, textAlign: "left", fontWeight: 500 }}>
                {m.meal}
              </th>
              <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>{m.total}</td>
              <td style={{ ...td, textAlign: "right", color: C.textWeak }}>{m.seated}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" style={{ ...td, textAlign: "left", borderBottom: "none" }}>
              Total meals
            </th>
            <td style={{ ...td, textAlign: "right", fontWeight: 700, borderBottom: "none" }}>
              {meals.total}
            </td>
            <td style={{ ...td, textAlign: "right", color: C.textWeak, borderBottom: "none" }}>
              {meals.seated}
            </td>
          </tr>
        </tfoot>
      </table>
      <Text textVariant="body-default-xs" onBackground="neutral-weak">
        {meals.special} of {meals.total} meals need something other than the standard menu.
      </Text>
    </Column>
  );

  const listPanel = (
    <Column gap="12" flex="3" minWidth="0">
      <Column background="surface" border radius="l" padding="16" gap="12">
        <Row gap="12" wrap vertical="end">
          <Column flex="2" minWidth="14rem">
            <Input
              id="guest-search"
              label="Search guests"
              size="s"
              value={q}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
              prefix={<Icon name="search" size="xs" />}
            />
          </Column>
          <Column flex="1" minWidth="10rem">
            <Select
              id="filter-party"
              label="Party"
              size="s"
              value={party}
              onValueChange={(v) => setParty(String(v))}
              options={[
                { value: "all", label: "All parties" },
                ...PARTIES.map((p) => ({ value: p, label: p })),
              ]}
            />
          </Column>
          <Column flex="1" minWidth="10rem">
            <Select
              id="filter-rsvp"
              label="RSVP"
              size="s"
              value={rsvp}
              onValueChange={(v) => setRsvp(String(v))}
              options={[
                { value: "all", label: "Any RSVP" },
                ...(["yes", "maybe", "pending", "no"] as Rsvp[]).map((r) => ({
                  value: r,
                  label: RSVP_LABEL[r],
                })),
              ]}
            />
          </Column>
          <Column flex="1" minWidth="10rem">
            <Select
              id="filter-diet"
              label="Diet"
              size="s"
              value={diet}
              onValueChange={(v) => setDiet(String(v))}
              options={[
                { value: "all", label: "Any diet" },
                { value: "none", label: "No dietary need" },
                ...DIETS.map((d) => ({ value: d, label: d })),
              ]}
            />
          </Column>
        </Row>
        <Row horizontal="between" vertical="center" gap="8" wrap>
          <Text textVariant="body-default-s" onBackground="neutral-weak" aria-live="polite">
            Showing {rows.length} of {GUESTS.length} guests
          </Text>
          {filtersActive ? (
            <Button size="s" variant="tertiary" prefixIcon="close" onClick={clear}>
              Clear filters
            </Button>
          ) : null}
        </Row>
      </Column>

      <Column background="surface" border radius="l" overflowX="auto">
        <table style={{ width: "100%", minWidth: 600, borderCollapse: "collapse" }}>
          <caption style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
            Guest list
          </caption>
          <thead>
            <tr>
              <th scope="col" style={th}>
                Guest
              </th>
              <th scope="col" style={th}>
                Party
              </th>
              <th scope="col" style={th}>
                RSVP
              </th>
              <th scope="col" style={th}>
                Diet
              </th>
              <th scope="col" style={th}>
                Table
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((x) => {
              const tid = tableOf[x.id];
              return (
                <tr key={x.id}>
                  <th scope="row" style={{ ...td, textAlign: "left", fontWeight: 600 }}>
                    {x.name}
                  </th>
                  <td style={{ ...td, color: C.textWeak }}>{x.party}</td>
                  <td style={td}>
                    <Tag size="s" tone={RSVP_TONE[x.rsvp]} label={RSVP_LABEL[x.rsvp]} />
                  </td>
                  <td style={td}>
                    {x.diet ? <Tag size="s" tone="accent" label={x.diet} /> : <span style={{ color: C.textWeak }}>None</span>}
                  </td>
                  <td style={td}>
                    {tid ? (
                      TABLE_BY_ID[tid].name
                    ) : x.rsvp === "no" ? (
                      <span style={{ color: C.textWeak }}>Not coming</span>
                    ) : (
                      <span style={{ color: C.warning, fontWeight: 600 }}>Unseated</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ ...td, textAlign: "center", color: C.textWeak, padding: 32 }}>
                  No guest matches these filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Column>
    </Column>
  );

  return (
    <>
      <Column gap="4">
        <Heading as="h1" textVariant="display-strong-xs">
          Guest list
        </Heading>
        <Text textVariant="body-default-m" onBackground="neutral-weak">
          Search and filter every guest, see where they sit, and send the meal counts to the caterer.
        </Text>
      </Column>
      {wide ? (
        <Row gap="16" vertical="start">
          {listPanel}
          <Column flex="1" style={{ width: "24rem", maxWidth: "24rem", flexShrink: 0 }}>
            {mealPanel}
          </Column>
        </Row>
      ) : (
        <Column gap="16">
          {mealPanel}
          {listPanel}
        </Column>
      )}
    </>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { PlanView } from "@/components/PlanView";

export const metadata: Metadata = { title: "Seating plan · Seatwise" };

export default function Page() {
  return <PlanView />;
}
```

```tsx app/guests/page.tsx
import type { Metadata } from "next";
import { GuestsView } from "@/components/GuestsView";

export const metadata: Metadata = { title: "Guest list · Seatwise" };

export default function Page() {
  return <GuestsView />;
}
```

```tsx app/layout.tsx
import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "./fonts.css";

import type { Metadata } from "next";
import { Column, Flex } from "@once-ui-system/core";
import { AppShell } from "@/components/AppShell";
import { PlanProvider } from "@/lib/plan";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Seatwise",
  description: "Seating planner for wedding and event planners",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="html" lang="en" suppressHydrationWarning>
      <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
        <Providers>
          <PlanProvider>
            <AppShell>{children}</AppShell>
          </PlanProvider>
        </Providers>
      </Column>
    </Flex>
  );
}
```
