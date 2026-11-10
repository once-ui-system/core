```ts lib/data.ts
export type Rsvp = "yes" | "maybe" | "pending" | "no";
export type FixtureKind = "stage" | "dancefloor" | "bar" | "door";
export type TableShape = "long" | "round";

export type Fixture = {
  id: string;
  kind: FixtureKind;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type SeatTable = {
  id: string;
  name: string;
  shape: TableShape;
  seats: number;
  x: number;
  y: number;
  rotation?: number;
};

export type Guest = {
  id: string;
  name: string;
  party: string;
  rsvp: Rsvp;
  diet: string | null;
  table: string | null;
};

export type Rule = {
  kind: "together" | "apart" | "near";
  guests: string[];
  note: string;
  // Only for "near": the fixture to be close to (within `within` metres, measured from
  // the table centre) and the fixture to stay farther from.
  target?: { fixture: string; within: number; awayFrom?: string };
};

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

export const PLANNER = { name: "Hannah Brook" };

export const FIXTURES: Fixture[] = [
  { id: "f-1", kind: "stage", label: "Band", x: 10, y: 0.5, w: 4, h: 2 },
  { id: "f-2", kind: "dancefloor", label: "Dance floor", x: 8.5, y: 3, w: 7, h: 4 },
  { id: "f-3", kind: "bar", label: "Bar", x: 21, y: 10, w: 2.5, h: 3.5 },
  { id: "f-4", kind: "door", label: "Garden doors", x: 0, y: 6, w: 0.5, h: 2.5 },
];

export const TABLES: SeatTable[] = [
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
  { kind: "apart", guests: ["g-12", "g-34"], note: "Ask the couple: old family dispute" },
  {
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
    target: { fixture: "f-4", within: 4, awayFrom: "f-1" },
  },
];

export const GUEST_BY_ID: Record<string, Guest> = Object.fromEntries(
  GUESTS.map((guest) => [guest.id, guest]),
);
export const TABLE_BY_ID: Record<string, SeatTable> = Object.fromEntries(
  TABLES.map((table) => [table.id, table]),
);
export const FIXTURE_BY_ID: Record<string, Fixture> = Object.fromEntries(
  FIXTURES.map((fixture) => [fixture.id, fixture]),
);

export const PARTIES: string[] = Array.from(new Set(GUESTS.map((guest) => guest.party)));
export const DIETS: string[] = Array.from(
  new Set(GUESTS.map((guest) => guest.diet).filter((d): d is string => d !== null)),
).sort();

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "No reply yet",
  no: "Declined",
};
```

```ts lib/theme.ts
export type PartyTone = "brand" | "accent" | "info" | "success" | "warning" | "neutral";

export const PARTY_TONE: Record<string, PartyTone> = {
  Couple: "brand",
  "Bride's family": "accent",
  "Groom's family": "info",
  "University friends": "success",
  "Work friends": "warning",
  "Groom's football club": "neutral",
  "Plus-ones": "neutral",
};

export function toneOf(party: string): PartyTone {
  return PARTY_TONE[party] ?? "neutral";
}

export function seatBg(tone: PartyTone) {
  return (
    {
      brand: "brand-alpha-medium",
      accent: "accent-alpha-medium",
      info: "info-alpha-medium",
      success: "success-alpha-medium",
      warning: "warning-alpha-medium",
      neutral: "neutral-alpha-medium",
    } as const
  )[tone];
}

export function dotBg(tone: PartyTone) {
  return (
    {
      brand: "brand-medium",
      accent: "accent-medium",
      info: "info-medium",
      success: "success-medium",
      warning: "warning-medium",
      neutral: "neutral-medium",
    } as const
  )[tone];
}

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function dietTone(diet: string): "warning" | "info" {
  return /allergy/i.test(diet) ? "warning" : "info";
}
```

```ts lib/geometry.ts
import { EVENT, type SeatTable } from "./data";

export const ROOM_W = EVENT.room_m.width;
export const ROOM_D = EVENT.room_m.depth;

export const ROUND_D = 1.6;
export const SEAT_D = 0.85;
export const RING_R = 1.25;
export const LONG_W = 7;
export const LONG_H = 1;
export const SEAT_OFFSET = 0.5;

export type Pt = { x: number; y: number };

/** Centre and size of the table top, in metres. For a long table x/y is its top-left corner. */
export function tableBody(t: SeatTable): { cx: number; cy: number; w: number; h: number } {
  if (t.shape === "round") return { cx: t.x, cy: t.y, w: ROUND_D, h: ROUND_D };
  return { cx: t.x + LONG_W / 2, cy: t.y + LONG_H / 2, w: LONG_W, h: LONG_H };
}

/** Seat centres in metres, numbered clockwise from the top. */
export function seatPoints(t: SeatTable): Pt[] {
  const pts: Pt[] = [];
  if (t.shape === "round") {
    for (let i = 0; i < t.seats; i++) {
      const a = (-90 + (i * 360) / t.seats) * (Math.PI / 180);
      pts.push({ x: t.x + RING_R * Math.cos(a), y: t.y + RING_R * Math.sin(a) });
    }
    return pts;
  }
  const top = Math.ceil(t.seats / 2);
  const bottom = t.seats - top;
  for (let i = 0; i < top; i++) {
    pts.push({ x: t.x + ((i + 0.5) * LONG_W) / top, y: t.y - SEAT_OFFSET });
  }
  for (let j = 0; j < bottom; j++) {
    pts.push({
      x: t.x + LONG_W - ((j + 0.5) * LONG_W) / bottom,
      y: t.y + LONG_H + SEAT_OFFSET,
    });
  }
  return pts;
}

export function pctX(m: number): string {
  return `${(m / ROOM_W) * 100}%`;
}

export function pctY(m: number): string {
  return `${(m / ROOM_D) * 100}%`;
}

export function dist(a: Pt, b: Pt): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
```

```ts lib/seating.ts
import {
  FIXTURE_BY_ID,
  GUEST_BY_ID,
  GUESTS,
  RULES,
  TABLE_BY_ID,
  TABLES,
  type Rule,
} from "./data";
import { dist, tableBody } from "./geometry";

export type Seating = Record<string, (string | null)[]>;
export type Location = { tableId: string; seat: number };
export type RuleStatus = "kept" | "broken" | "open";

export type RuleResult = {
  index: number;
  rule: Rule;
  status: RuleStatus;
  title: string;
  detail: string;
  tableIds: string[];
  guestIds: string[];
};

export function initialSeating(): Seating {
  const seating: Seating = {};
  for (const t of TABLES) seating[t.id] = Array.from({ length: t.seats }, () => null);
  for (const guest of GUESTS) {
    if (!guest.table) continue;
    const slots = seating[guest.table];
    const free = slots.indexOf(null);
    if (free >= 0) slots[free] = guest.id;
  }
  return seating;
}

export function locate(seating: Seating): Record<string, Location> {
  const out: Record<string, Location> = {};
  for (const tableId of Object.keys(seating)) {
    seating[tableId].forEach((guestId, seat) => {
      if (guestId) out[guestId] = { tableId, seat };
    });
  }
  return out;
}

export function tableCount(seating: Seating, tableId: string): number {
  return seating[tableId].filter(Boolean).length;
}

const nm = (id: string) => GUEST_BY_ID[id].name;
const tn = (id: string) => TABLE_BY_ID[id].name;

function ruleTitle(rule: Rule): string {
  const names = rule.guests.map(nm);
  if (rule.kind === "together") return `Keep together: ${names.join(" and ")}`;
  if (rule.kind === "apart") return `Keep apart: ${names.join(" and ")}`;
  const fixture = rule.target ? FIXTURE_BY_ID[rule.target.fixture].label : "the fixture";
  return `Seat near ${fixture}: ${names.join(", ")}`;
}

export function evaluateRules(seating: Seating, loc?: Record<string, Location>): RuleResult[] {
  const locations = loc ?? locate(seating);
  return RULES.map((rule, index): RuleResult => {
    const base = {
      index,
      rule,
      title: ruleTitle(rule),
      guestIds: rule.guests,
    };
    const [a, b] = rule.guests;
    const la = locations[a];
    const lb = b ? locations[b] : undefined;

    if (rule.kind === "together") {
      if (la && lb) {
        if (la.tableId === lb.tableId) {
          return {
            ...base,
            status: "kept",
            detail: `Both at ${tn(la.tableId)}.`,
            tableIds: [la.tableId],
          };
        }
        return {
          ...base,
          status: "broken",
          detail: `${nm(a)} is at ${tn(la.tableId)}, ${nm(b)} at ${tn(lb.tableId)}.`,
          tableIds: [la.tableId, lb.tableId],
        };
      }
      if (la || lb) {
        const seated = la ?? lb;
        const missing = la ? b : a;
        return {
          ...base,
          status: "open",
          detail: `${nm(missing)} still needs a seat, at ${tn(seated!.tableId)} to keep them together.`,
          tableIds: [seated!.tableId],
        };
      }
      return { ...base, status: "open", detail: "Neither is seated yet.", tableIds: [] };
    }

    if (rule.kind === "apart") {
      if (la && lb) {
        if (la.tableId === lb.tableId) {
          return {
            ...base,
            status: "broken",
            detail: `Both are at ${tn(la.tableId)}.`,
            tableIds: [la.tableId],
          };
        }
        return {
          ...base,
          status: "kept",
          detail: `${tn(la.tableId)} and ${tn(lb.tableId)}.`,
          tableIds: [la.tableId, lb.tableId],
        };
      }
      if (la || lb) {
        const seated = (la ?? lb)!;
        const missing = la ? b : a;
        return {
          ...base,
          status: "open",
          detail: `${nm(missing)} is not seated yet: keep them away from ${tn(seated.tableId)}.`,
          tableIds: [seated.tableId],
        };
      }
      return { ...base, status: "open", detail: "Neither is seated yet.", tableIds: [] };
    }

    // near
    const target = rule.target;
    if (!la || !target) {
      return { ...base, status: "open", detail: `${nm(a)} is not seated yet.`, tableIds: [] };
    }
    const table = TABLE_BY_ID[la.tableId];
    const body = tableBody(table);
    const centre = { x: body.cx, y: body.cy };
    const fx = FIXTURE_BY_ID[target.fixture];
    const fxCentre = { x: fx.x + fx.w / 2, y: fx.y + fx.h / 2 };
    const d = dist(centre, fxCentre);
    let farther = true;
    let awayLabel = "";
    if (target.awayFrom) {
      const away = FIXTURE_BY_ID[target.awayFrom];
      awayLabel = away.label;
      farther = dist(centre, { x: away.x + away.w / 2, y: away.y + away.h / 2 }) > d;
    }
    if (d <= target.within && farther) {
      return {
        ...base,
        status: "kept",
        detail: `${table.name} is ${d.toFixed(1)} m from ${fx.label}.`,
        tableIds: [table.id],
      };
    }
    return {
      ...base,
      status: "broken",
      detail: farther
        ? `${table.name} is ${d.toFixed(1)} m from ${fx.label}; within ${target.within} m is needed.`
        : `${table.name} is closer to the ${awayLabel} than to ${fx.label}.`,
      tableIds: [table.id],
    };
  });
}
```

```ts lib/useMinWidth.ts
"use client";

import { useCallback, useSyncExternalStore } from "react";

export function useMinWidth(px: number): boolean {
  const subscribe = useCallback(
    (cb: () => void) => {
      const mq = window.matchMedia(`(min-width: ${px}px)`);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    [px],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(`(min-width: ${px}px)`).matches,
    () => false,
  );
}
```

```tsx components/PlanProvider.tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { GUEST_BY_ID, TABLE_BY_ID } from "@/lib/data";
import {
  evaluateRules,
  initialSeating,
  locate,
  type Location,
  type RuleResult,
  type Seating,
} from "@/lib/seating";

type PlanContextValue = {
  seating: Seating;
  locations: Record<string, Location>;
  results: RuleResult[];
  heldId: string | null;
  selectedTable: string | null;
  dragId: string | null;
  notice: string;
  hold: (id: string | null) => void;
  selectTable: (id: string | null) => void;
  setDragId: (id: string | null) => void;
  place: (guestId: string, tableId: string, seat?: number) => void;
  unseat: (guestId: string) => void;
  reset: () => void;
};

const PlanContext = createContext<PlanContextValue | null>(null);

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [seating, setSeating] = useState<Seating>(initialSeating);
  const [heldId, setHeldId] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>("t-1");
  const [dragId, setDragId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const locations = useMemo(() => locate(seating), [seating]);
  const results = useMemo(() => evaluateRules(seating, locations), [seating, locations]);

  const place = useCallback(
    (guestId: string, tableId: string, seat?: number) => {
      const guest = GUEST_BY_ID[guestId];
      const table = TABLE_BY_ID[tableId];
      if (!guest || !table) return;
      if (guest.rsvp === "no") {
        setNotice(`${guest.name} has declined, so they cannot be seated.`);
        setHeldId(null);
        return;
      }
      const from = locations[guestId];
      const slots = seating[tableId];
      let idx: number;
      if (seat === undefined) {
        if (from && from.tableId === tableId) {
          setNotice(`${guest.name} is already at ${table.name}.`);
          setHeldId(null);
          setSelectedTable(tableId);
          return;
        }
        idx = slots.indexOf(null);
        if (idx < 0) {
          setNotice(
            `${table.name} is full (${table.seats} of ${table.seats}). Choose another table, or tap a seat to swap.`,
          );
          return;
        }
      } else {
        idx = seat;
      }
      const occupant = slots[idx];
      if (occupant === guestId) {
        setHeldId(null);
        return;
      }
      const next: Seating = {};
      for (const key of Object.keys(seating)) next[key] = [...seating[key]];
      if (from) next[from.tableId][from.seat] = null;
      next[tableId][idx] = guestId;
      let msg = from
        ? `${guest.name} moved from ${TABLE_BY_ID[from.tableId].name} to ${table.name}, seat ${idx + 1}.`
        : `${guest.name} seated at ${table.name}, seat ${idx + 1}.`;
      if (occupant) {
        const other = GUEST_BY_ID[occupant].name;
        if (from) {
          next[from.tableId][from.seat] = occupant;
          msg = `${guest.name} and ${other} swapped seats.`;
        } else {
          msg = `${guest.name} takes ${other}'s seat at ${table.name}; ${other} is unseated.`;
        }
      }
      setSeating(next);
      setNotice(msg);
      setHeldId(null);
      setSelectedTable(tableId);
    },
    [seating, locations],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const from = locations[guestId];
      if (!from) return;
      const next: Seating = {};
      for (const key of Object.keys(seating)) next[key] = [...seating[key]];
      next[from.tableId][from.seat] = null;
      setSeating(next);
      setHeldId(null);
      setNotice(`${GUEST_BY_ID[guestId].name} unseated from ${TABLE_BY_ID[from.tableId].name}.`);
    },
    [seating, locations],
  );

  const reset = useCallback(() => {
    setSeating(initialSeating());
    setHeldId(null);
    setNotice("Plan reset to the starting arrangement.");
  }, []);

  const hold = useCallback((id: string | null) => {
    setHeldId(id);
    if (id) setNotice(`${GUEST_BY_ID[id].name} picked up: tap a seat or table to place them.`);
    else setNotice("");
  }, []);

  const value = useMemo<PlanContextValue>(
    () => ({
      seating,
      locations,
      results,
      heldId,
      selectedTable,
      dragId,
      notice,
      hold,
      selectTable: setSelectedTable,
      setDragId,
      place,
      unseat,
      reset,
    }),
    [seating, locations, results, heldId, selectedTable, dragId, notice, hold, place, unseat, reset],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
```

```tsx components/Shell.tsx
"use client";

import { usePathname } from "next/navigation";
import {
  Avatar,
  Column,
  Heading,
  Icon,
  Row,
  Text,
  ToggleButton,
  VisuallyHidden,
} from "@once-ui-system/core";
import { APP, EVENT, PLANNER } from "@/lib/data";

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <Column fillWidth flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row
        as="header"
        fillWidth
        paddingX="16"
        paddingY="8"
        gap="16"
        vertical="center"
        borderBottom
        background="page"
        position="sticky"
        top="0"
        zIndex={2}
      >
        <Row gap="12" vertical="center">
          <Row center width={32} height={32} radius="m" background="brand-alpha-weak">
            <Icon name="people" size="s" onBackground="brand-strong" />
          </Row>
          <Column gap="0">
            <Text textVariant="heading-strong-s">{APP.name}</Text>
          </Column>
        </Row>
        <Column s={{ hide: true }} m={{ hide: true }} gap="0" paddingLeft="16">
          <Text textVariant="label-strong-s">{EVENT.name}</Text>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            {formatDate(EVENT.date)} · {EVENT.venue}
          </Text>
        </Column>
        <Row flex={1} horizontal="end" gap="4" as="nav" aria-label="Main">
          <ToggleButton label="Plan" prefixIcon="grid" href="/" selected={pathname === "/"} />
          <ToggleButton
            label="Guests"
            prefixIcon="people"
            href="/guests"
            selected={pathname === "/guests"}
          />
        </Row>
        <Row gap="8" vertical="center" s={{ hide: true }}>
          <Avatar value="HB" size="s" />
          <Text textVariant="label-default-s">{PLANNER.name}</Text>
        </Row>
      </Row>
      <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24">
        <Column fillWidth maxWidth="90rem" gap="16">
          {children}
        </Column>
      </Column>
      <Row hide>
        <Heading as="h2">{APP.tagline}</Heading>
      </Row>
    </Column>
  );
}
```

```tsx components/Panel.tsx
"use client";

import { Column, Heading, Row, Text } from "@once-ui-system/core";

export function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Column as="section" background="surface" border radius="l" padding="16" gap="12" fillWidth>
      <Row vertical="center" gap="8" horizontal="between" wrap>
        <Column gap="2">
          <Heading as="h2" textVariant="heading-strong-s">
            {title}
          </Heading>
          {subtitle ? (
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {subtitle}
            </Text>
          ) : null}
        </Column>
        {action}
      </Row>
      {children}
    </Column>
  );
}
```

```tsx components/RoomPlan.tsx
"use client";

import { useState } from "react";
import { Column, Icon, Row, Text } from "@once-ui-system/core";
import { FIXTURES, GUEST_BY_ID, PARTIES, TABLES, type SeatTable } from "@/lib/data";
import {
  pctX,
  pctY,
  ROOM_D,
  ROOM_W,
  SEAT_D,
  seatPoints,
  tableBody,
} from "@/lib/geometry";
import { tableCount } from "@/lib/seating";
import { dotBg, initials, seatBg, toneOf } from "@/lib/theme";
import { usePlan } from "./PlanProvider";

const FIXTURE_BG = {
  stage: "accent-alpha-medium",
  dancefloor: "neutral-alpha-weak",
  bar: "warning-alpha-medium",
  door: "success-alpha-medium",
} as const;

const CSS = `
.sw-hit{cursor:pointer;padding:0;font:inherit;color:inherit}
.sw-hit:focus-visible{outline:2px solid Highlight;outline-offset:2px}
.sw-hit[draggable="true"]{cursor:grab}
`;

export function RoomPlan() {
  const {
    seating,
    results,
    heldId,
    selectedTable,
    dragId,
    selectTable,
    hold,
    place,
    setDragId,
  } = usePlan();
  const [over, setOver] = useState<string | null>(null);

  const brokenTables = new Set<string>();
  const flaggedGuests = new Set<string>();
  for (const r of results) {
    if (r.status !== "broken") continue;
    r.tableIds.forEach((id) => brokenTables.add(id));
    r.guestIds.forEach((id) => flaggedGuests.add(id));
  }
  const active = heldId !== null || dragId !== null;

  const onSeat = (table: SeatTable, index: number) => {
    const occupant = seating[table.id][index];
    if (heldId) {
      if (occupant === heldId) hold(null);
      else place(heldId, table.id, index);
      return;
    }
    selectTable(table.id);
    if (occupant) hold(occupant);
  };

  const onTable = (table: SeatTable) => {
    if (heldId) place(heldId, table.id);
    else selectTable(table.id);
  };

  const dropProps = (key: string, onDrop: () => void) => ({
    onDragOver: (e: React.DragEvent) => {
      if (!dragId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (over !== key) setOver(key);
    },
    onDragLeave: () => {
      if (over === key) setOver(null);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setOver(null);
      if (dragId) onDrop();
      setDragId(null);
    },
  });

  return (
    <Column background="surface" border radius="l" fillWidth overflow="hidden">
      <style>{CSS}</style>
      <Row padding="12" gap="16" wrap vertical="center" borderBottom>
        <Text textVariant="label-strong-s">The Orangery, to scale</Text>
        <Row gap="12" wrap flex={1}>
          {PARTIES.map((party) => (
            <Row key={party} gap="4" vertical="center">
              <Row width={10} height={10} radius="full" background={dotBg(toneOf(party))} />
              <Text textVariant="body-default-xs" onBackground="neutral-weak">
                {party}
              </Text>
            </Row>
          ))}
        </Row>
      </Row>
      <div
        role="region"
        aria-label="Room plan. It scrolls sideways on narrow screens."
        tabIndex={0}
        style={{ overflowX: "auto", padding: 12 }}
      >
        <div
          style={{
            position: "relative",
            minWidth: 820,
            aspectRatio: `${ROOM_W} / ${ROOM_D}`,
          }}
        >
          <Row
            position="absolute"
            top="0"
            left="0"
            fill
            pointerEvents="none"
            radius="m"
            border
            background="neutral-alpha-weak"
          />

          {FIXTURES.map((f) => (
            <Row
              key={f.id}
              position="absolute"
              center
              radius={f.kind === "dancefloor" ? "s" : "xs"}
              background={FIXTURE_BG[f.kind]}
              border={f.kind === "dancefloor"}
              borderStyle="dashed"
              pointerEvents="none"
              style={{ left: pctX(f.x), top: pctY(f.y), width: pctX(f.w), height: pctY(f.h) }}
            >
              <Text
                textVariant="label-default-xs"
                onBackground="neutral-medium"
                style={f.kind === "door" ? { writingMode: "vertical-rl" } : undefined}
              >
                {f.label}
              </Text>
            </Row>
          ))}

          {TABLES.map((table) => {
            const body = tableBody(table);
            const count = tableCount(seating, table.id);
            const broken = brokenTables.has(table.id);
            const selected = selectedTable === table.id;
            const full = count >= table.seats;
            const key = `table:${table.id}`;
            const isOver = over === key;
            const label = `${table.name}, ${count} of ${table.seats} seats filled${
              broken ? ", a seating rule is broken" : ""
            }${selected ? ", selected" : ""}`;
            return (
              <Row
                key={table.id}
                as="button"
                type="button"
                className="sw-hit"
                aria-label={label}
                aria-pressed={selected}
                title={label}
                onClick={() => onTable(table)}
                {...dropProps(key, () => place(dragId as string, table.id))}
                center
                position="absolute"
                radius={table.shape === "round" ? "full" : "m"}
                background={
                  isOver
                    ? "brand-alpha-medium"
                    : selected
                      ? "brand-alpha-weak"
                      : active && !full
                        ? "brand-alpha-weak"
                        : "surface"
                }
                border={broken ? "danger-strong" : selected ? "brand-strong" : true}
                borderWidth={broken || selected ? 2 : 1}
                style={{
                  left: pctX(body.cx - body.w / 2),
                  top: pctY(body.cy - body.h / 2),
                  width: pctX(body.w),
                  height: pctY(body.h),
                }}
              >
                {table.shape === "round" ? (
                  <Column center gap="0">
                    <Text textVariant="label-strong-xs">{table.name}</Text>
                    <Row gap="2" vertical="center">
                      {broken ? <Icon name="warning" size="xs" onBackground="danger-strong" /> : null}
                      <Text textVariant="label-default-xs" onBackground="neutral-weak">
                        {count}/{table.seats}
                      </Text>
                    </Row>
                  </Column>
                ) : (
                  <Row gap="8" vertical="center">
                    <Text textVariant="label-strong-xs">{table.name}</Text>
                    {broken ? <Icon name="warning" size="xs" onBackground="danger-strong" /> : null}
                    <Text textVariant="label-default-xs" onBackground="neutral-weak">
                      {count}/{table.seats}
                    </Text>
                  </Row>
                )}
              </Row>
            );
          })}

          {TABLES.map((table) =>
            seatPoints(table).map((pt, index) => {
              const guestId = seating[table.id][index];
              const guest = guestId ? GUEST_BY_ID[guestId] : null;
              const key = `seat:${table.id}:${index}`;
              const isOver = over === key;
              const held = guestId !== null && guestId === heldId;
              const flagged = guestId !== null && flaggedGuests.has(guestId);
              const label = `${table.name}, seat ${index + 1}: ${
                guest
                  ? `${guest.name}${guest.diet ? `, ${guest.diet}` : ""}${flagged ? ", rule broken" : ""}`
                  : "empty"
              }`;
              return (
                <Row
                  key={key}
                  as="button"
                  type="button"
                  className="sw-hit"
                  aria-label={label}
                  title={label}
                  draggable={guest !== null}
                  onClick={() => onSeat(table, index)}
                  onDragStart={(e: React.DragEvent) => {
                    if (!guestId) return;
                    e.dataTransfer.setData("text/plain", guestId);
                    e.dataTransfer.effectAllowed = "move";
                    setDragId(guestId);
                  }}
                  onDragEnd={() => {
                    setDragId(null);
                    setOver(null);
                  }}
                  {...dropProps(key, () => place(dragId as string, table.id, index))}
                  center
                  position="absolute"
                  radius="full"
                  background={
                    isOver
                      ? "brand-alpha-strong"
                      : guest
                        ? seatBg(toneOf(guest.party))
                        : active
                          ? "brand-alpha-weak"
                          : "transparent"
                  }
                  border={flagged ? "danger-strong" : held ? "brand-strong" : true}
                  borderWidth={flagged || held ? 2 : 1}
                  borderStyle={guest ? "solid" : "dashed"}
                  style={{
                    left: pctX(pt.x),
                    top: pctY(pt.y),
                    width: pctX(SEAT_D),
                    height: pctY(SEAT_D),
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {guest ? (
                    <Text textVariant="label-strong-xs">{initials(guest.name)}</Text>
                  ) : null}
                </Row>
              );
            }),
          )}
        </div>
      </div>
      <Row paddingX="12" paddingBottom="12" gap="8" vertical="center">
        <Icon name="info" size="xs" onBackground="neutral-weak" />
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          Room {ROOM_W} × {ROOM_D} m. Drag a guest to a seat or table, or tap a guest and then tap
          where they go. Dashed circles are empty seats.
        </Text>
      </Row>
    </Column>
  );
}
```

```tsx components/UnseatedPanel.tsx
"use client";

import { useState } from "react";
import { Column, Row, Tag, Text } from "@once-ui-system/core";
import { GUESTS, type Guest } from "@/lib/data";
import { dietTone, dotBg, toneOf } from "@/lib/theme";
import { Panel } from "./Panel";
import { usePlan } from "./PlanProvider";

function GuestChip({ guest }: { guest: Guest }) {
  const { heldId, hold, setDragId } = usePlan();
  const held = heldId === guest.id;
  return (
    <Row
      as="button"
      type="button"
      className="sw-hit"
      aria-pressed={held}
      draggable
      onClick={() => hold(held ? null : guest.id)}
      onDragStart={(e: React.DragEvent) => {
        e.dataTransfer.setData("text/plain", guest.id);
        e.dataTransfer.effectAllowed = "move";
        setDragId(guest.id);
      }}
      onDragEnd={() => setDragId(null)}
      fillWidth
      gap="12"
      vertical="center"
      padding="8"
      radius="m"
      background={held ? "brand-alpha-weak" : "transparent"}
      border={held ? "brand-strong" : "transparent"}
      borderWidth={held ? 2 : 1}
      style={{ textAlign: "left", minHeight: 44 }}
    >
      <Row width={10} height={10} radius="full" background={dotBg(toneOf(guest.party))} />
      <Column flex={1} gap="0">
        <Text textVariant="label-strong-s">{guest.name}</Text>
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          {guest.party}
          {guest.rsvp !== "yes" ? ` · ${guest.rsvp === "maybe" ? "maybe" : "no reply yet"}` : ""}
        </Text>
      </Column>
      {guest.diet ? <Tag size="s" tone={dietTone(guest.diet)} label={guest.diet} /> : null}
    </Row>
  );
}

export function UnseatedPanel() {
  const { locations, dragId, unseat, setDragId } = usePlan();
  const [over, setOver] = useState(false);
  const attending = GUESTS.filter((g) => g.rsvp === "yes" && !locations[g.id]);
  const unconfirmed = GUESTS.filter(
    (g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !locations[g.id],
  );

  return (
    <div
      onDragOver={(e) => {
        if (!dragId || !locations[dragId]) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (dragId && locations[dragId]) unseat(dragId);
        setDragId(null);
      }}
    >
      <Panel
        title={`Needs a seat (${attending.length})`}
        subtitle={
          over
            ? "Drop here to unseat"
            : "Attending guests without a seat. Tap one, then a seat or table, or drag."
        }
      >
        {attending.length === 0 ? (
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            Everyone attending has a seat.
          </Text>
        ) : (
          <Column as="ul" gap="2">
            {attending.map((g) => (
              <Row as="li" key={g.id} fillWidth>
                <GuestChip guest={g} />
              </Row>
            ))}
          </Column>
        )}
        {unconfirmed.length > 0 ? (
          <Column gap="4" paddingTop="8" borderTop>
            <Text textVariant="label-default-xs" onBackground="neutral-weak">
              Not confirmed yet ({unconfirmed.length})
            </Text>
            <Column as="ul" gap="2">
              {unconfirmed.map((g) => (
                <Row as="li" key={g.id} fillWidth>
                  <GuestChip guest={g} />
                </Row>
              ))}
            </Column>
          </Column>
        ) : null}
      </Panel>
    </div>
  );
}
```

```tsx components/TablePanel.tsx
"use client";

import { Column, Icon, IconButton, Row, Tag, Text } from "@once-ui-system/core";
import { GUEST_BY_ID, TABLE_BY_ID } from "@/lib/data";
import { dietTone, dotBg, toneOf } from "@/lib/theme";
import { Panel } from "./Panel";
import { usePlan } from "./PlanProvider";

export function TablePanel() {
  const { selectedTable, seating, results, heldId, place, unseat, hold } = usePlan();
  if (!selectedTable) {
    return (
      <Panel title="Table details">
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Select a table on the plan to see who is sitting there and what they eat.
        </Text>
      </Panel>
    );
  }
  const table = TABLE_BY_ID[selectedTable];
  const slots = seating[selectedTable];
  const guests = slots.filter((id): id is string => id !== null).map((id) => GUEST_BY_ID[id]);
  const diets = new Map<string, number>();
  for (const g of guests) if (g.diet) diets.set(g.diet, (diets.get(g.diet) ?? 0) + 1);
  const flags = results.filter((r) => r.status === "broken" && r.tableIds.includes(table.id));

  return (
    <Panel
      title={table.name}
      subtitle={`${guests.length} of ${table.seats} seats filled · ${table.seats - guests.length} free`}
    >
      {flags.map((r) => (
        <Row
          key={r.index}
          gap="8"
          padding="8"
          radius="m"
          background="danger-alpha-weak"
          vertical="start"
          role="alert"
        >
          <Icon name="warning" size="s" onBackground="danger-strong" />
          <Column gap="0" flex={1}>
            <Text textVariant="label-strong-xs">{r.title}</Text>
            <Text textVariant="body-default-xs">{r.detail}</Text>
          </Column>
        </Row>
      ))}
      <Row gap="4" wrap vertical="center">
        <Text textVariant="label-default-xs" onBackground="neutral-weak">
          Dietary needs:
        </Text>
        {diets.size === 0 ? (
          <Text textVariant="body-default-xs">none at this table</Text>
        ) : (
          Array.from(diets.entries()).map(([diet, n]) => (
            <Tag key={diet} size="s" tone={dietTone(diet)} label={`${diet} × ${n}`} />
          ))
        )}
      </Row>
      <Column as="ol" gap="2">
        {slots.map((id, i) => {
          const guest = id ? GUEST_BY_ID[id] : null;
          const label = `Seat ${i + 1}`;
          return (
            <Row as="li" key={i} gap="4" vertical="center" fillWidth>
              <Row
                as="button"
                type="button"
                className="sw-hit"
                fillWidth
                flex={1}
                gap="12"
                vertical="center"
                padding="8"
                radius="m"
                background={guest && heldId === guest.id ? "brand-alpha-weak" : "transparent"}
                border="transparent"
                aria-label={
                  guest
                    ? `${label}: ${guest.name}. ${heldId === guest.id ? "Put down" : heldId ? "Swap with the guest in hand" : "Pick up to move"}`
                    : `${label}: empty${heldId ? ". Seat the guest in hand here" : ""}`
                }
                onClick={() => {
                  if (heldId) {
                    if (guest && guest.id === heldId) hold(null);
                    else place(heldId, table.id, i);
                  } else if (guest) hold(guest.id);
                }}
                style={{ textAlign: "left", minHeight: 44 }}
              >
                <Text
                  textVariant="label-default-xs"
                  onBackground="neutral-weak"
                  style={{ width: 16, textAlign: "right" }}
                >
                  {i + 1}
                </Text>
                {guest ? (
                  <>
                    <Row width={10} height={10} radius="full" background={dotBg(toneOf(guest.party))} />
                    <Column flex={1} gap="0">
                      <Text textVariant="label-strong-s">{guest.name}</Text>
                      <Text textVariant="body-default-xs" onBackground="neutral-weak">
                        {guest.party}
                      </Text>
                    </Column>
                    {guest.diet ? (
                      <Tag size="s" tone={dietTone(guest.diet)} label={guest.diet} />
                    ) : null}
                  </>
                ) : (
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    Empty seat
                  </Text>
                )}
              </Row>
              {guest ? (
                <IconButton
                  icon="personRemove"
                  variant="tertiary"
                  size="s"
                  tooltip="Unseat"
                  aria-label={`Unseat ${guest.name}`}
                  onClick={() => unseat(guest.id)}
                />
              ) : null}
            </Row>
          );
        })}
      </Column>
    </Panel>
  );
}
```

```tsx components/RulesPanel.tsx
"use client";

import { Column, Icon, Row, Tag, Text } from "@once-ui-system/core";
import { Panel } from "./Panel";
import { usePlan } from "./PlanProvider";

export function RulesPanel() {
  const { results, selectTable } = usePlan();
  const broken = results.filter((r) => r.status === "broken").length;
  const open = results.filter((r) => r.status === "open").length;
  const kept = results.filter((r) => r.status === "kept").length;

  return (
    <Panel
      title="The couple's rules"
      subtitle="Checked every time a guest moves"
      action={
        <Row gap="4" wrap>
          <Tag size="s" tone={broken ? "danger" : "neutral"} label={`${broken} broken`} />
          <Tag size="s" tone="neutral" label={`${open} waiting`} />
          <Tag size="s" tone="success" label={`${kept} kept`} />
        </Row>
      }
    >
      <Column as="ul" gap="8">
        {results.map((r) => {
          const icon = r.status === "broken" ? "warning" : r.status === "kept" ? "check" : "time";
          const state = r.status === "broken" ? "Broken" : r.status === "kept" ? "Kept" : "Waiting";
          return (
            <Row as="li" key={r.index} fillWidth>
              <Row
                as="button"
                type="button"
                className="sw-hit"
                fillWidth
                gap="12"
                padding="12"
                radius="m"
                vertical="start"
                background={r.status === "broken" ? "danger-alpha-weak" : "neutral-alpha-weak"}
                border="transparent"
                disabled={r.tableIds.length === 0}
                aria-label={`${state}: ${r.title}. ${r.detail}${
                  r.tableIds.length ? " Show table." : ""
                }`}
                onClick={() => {
                  if (r.tableIds.length) selectTable(r.tableIds[0]);
                }}
                style={{ textAlign: "left" }}
              >
                <Icon
                  name={icon}
                  size="s"
                  onBackground={
                    r.status === "broken"
                      ? "danger-strong"
                      : r.status === "kept"
                        ? "success-strong"
                        : "neutral-weak"
                  }
                />
                <Column flex={1} gap="2">
                  <Text textVariant="label-strong-s">{r.title}</Text>
                  <Text textVariant="body-default-xs">{r.detail}</Text>
                  <Text textVariant="body-default-xs" onBackground="neutral-weak">
                    {r.rule.note}
                  </Text>
                </Column>
              </Row>
            </Row>
          );
        })}
      </Column>
    </Panel>
  );
}
```

```tsx components/PlanView.tsx
"use client";

import { Button, Column, Heading, Icon, Row, Text } from "@once-ui-system/core";
import { GUESTS, TABLES } from "@/lib/data";
import { useMinWidth } from "@/lib/useMinWidth";
import { usePlan } from "./PlanProvider";
import { RoomPlan } from "./RoomPlan";
import { RulesPanel } from "./RulesPanel";
import { TablePanel } from "./TablePanel";
import { UnseatedPanel } from "./UnseatedPanel";

function Stat({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: boolean }) {
  return (
    <Column
      background="surface"
      border={tone ? "danger-strong" : true}
      radius="l"
      padding="16"
      gap="4"
      flex={1}
      minWidth="10rem"
    >
      <Text textVariant="label-default-xs" onBackground="neutral-weak">
        {label}
      </Text>
      <Text textVariant="display-strong-xs">{value}</Text>
      <Text textVariant="body-default-xs" onBackground="neutral-weak">
        {sub}
      </Text>
    </Column>
  );
}

export function PlanView() {
  const wide = useMinWidth(1240);
  const { locations, results, notice, heldId, hold, reset } = usePlan();

  const attending = GUESTS.filter((g) => g.rsvp === "yes");
  const seatedTotal = Object.keys(locations).length;
  const seatedAttending = attending.filter((g) => locations[g.id]).length;
  const unseatedAttending = attending.length - seatedAttending;
  const unseatedOther = GUESTS.filter(
    (g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !locations[g.id],
  ).length;
  const totalSeats = TABLES.reduce((n, t) => n + t.seats, 0);
  const broken = results.filter((r) => r.status === "broken").length;
  const open = results.filter((r) => r.status === "open").length;

  return (
    <>
      <Row horizontal="between" vertical="end" gap="16" wrap>
        <Column gap="4">
          <Heading as="h1" textVariant="display-strong-xs">
            Seating plan
          </Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            Seat, move and unseat guests. Counts and rules update as you go.
          </Text>
        </Column>
        <Button variant="secondary" size="s" prefixIcon="refresh" onClick={reset}>
          Reset plan
        </Button>
      </Row>

      <Row gap="12" wrap>
        <Stat
          label="Seated"
          value={String(seatedTotal)}
          sub={`${seatedAttending} of ${attending.length} attending guests`}
        />
        <Stat
          label="Still to seat"
          value={String(unseatedAttending)}
          sub={`${unseatedOther} unconfirmed also without a seat`}
        />
        <Stat
          label="Open seats"
          value={String(totalSeats - seatedTotal)}
          sub={`of ${totalSeats} across ${TABLES.length} tables`}
        />
        <Stat
          label="Rules"
          value={broken === 0 ? "All clear" : `${broken} broken`}
          sub={`${open} waiting on a seat · ${results.length} in total`}
          tone={broken > 0}
        />
      </Row>

      <Row
        gap="8"
        vertical="center"
        padding="8"
        radius="m"
        background={heldId ? "brand-alpha-weak" : "transparent"}
        minHeight="40"
        role="status"
        aria-live="polite"
      >
        {notice ? (
          <>
            <Icon name={heldId ? "arrowUpRight" : "info"} size="s" onBackground="brand-strong" />
            <Text textVariant="label-default-s" flex={1}>
              {notice}
            </Text>
          </>
        ) : null}
        {heldId ? (
          <Button size="s" variant="tertiary" onClick={() => hold(null)}>
            Cancel
          </Button>
        ) : null}
      </Row>

      {wide ? (
        <Row gap="16" vertical="start">
          <Column flex={1} gap="16">
            <RoomPlan />
          </Column>
          <Column gap="16" width="24rem" style={{ flex: "0 0 24rem" }}>
            <TablePanel />
            <UnseatedPanel />
            <RulesPanel />
          </Column>
        </Row>
      ) : (
        <Column gap="16" fillWidth>
          <UnseatedPanel />
          <RoomPlan />
          <TablePanel />
          <RulesPanel />
        </Column>
      )}
    </>
  );
}
```

```tsx components/GuestsView.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Column,
  Heading,
  Input,
  Row,
  SegmentedControl,
  Select,
  Tag,
  Text,
  VisuallyHidden,
} from "@once-ui-system/core";
import {
  DIETS,
  GUESTS,
  PARTIES,
  RSVP_LABEL,
  TABLE_BY_ID,
  type Guest,
  type Rsvp,
} from "@/lib/data";
import { dietTone, dotBg, toneOf } from "@/lib/theme";
import { Panel } from "./Panel";
import { usePlan } from "./PlanProvider";

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  whiteSpace: "nowrap",
  borderBottom: "1px solid color-mix(in srgb, currentColor 16%, transparent)",
};
const td: React.CSSProperties = {
  padding: "10px 12px",
  verticalAlign: "top",
  borderBottom: "1px solid color-mix(in srgb, currentColor 8%, transparent)",
};

const RSVP_TONE: Record<Rsvp, "success" | "warning" | "neutral"> = {
  yes: "success",
  maybe: "warning",
  pending: "neutral",
  no: "neutral",
};

const STANDARD = "Standard menu";

export function GuestsView() {
  const { locations } = usePlan();
  const [q, setQ] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState("all");
  const [diet, setDiet] = useState("all");
  const [mealScope, setMealScope] = useState("yes");

  const tableName = (g: Guest): string | null => {
    const loc = locations[g.id];
    return loc ? TABLE_BY_ID[loc.tableId].name : null;
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return GUESTS.filter((g) => {
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === "none" && g.diet !== null) return false;
      if (diet !== "all" && diet !== "none" && g.diet !== diet) return false;
      if (!needle) return true;
      const loc = locations[g.id];
      const hay = [g.name, g.party, g.diet ?? "", loc ? TABLE_BY_ID[loc.tableId].name : "unseated"]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [q, party, rsvp, diet, locations]);

  const meals = useMemo(() => {
    const inScope = GUESTS.filter((g) => (mealScope === "yes" ? g.rsvp === "yes" : g.rsvp !== "no"));
    const map = new Map<string, Guest[]>();
    for (const g of inScope) {
      const key = g.diet ?? STANDARD;
      map.set(key, [...(map.get(key) ?? []), g]);
    }
    const rows = Array.from(map.entries()).sort((a, b) => {
      if (a[0] === STANDARD) return -1;
      if (b[0] === STANDARD) return 1;
      return b[1].length - a[1].length || a[0].localeCompare(b[0]);
    });
    return { rows, total: inScope.length };
  }, [mealScope]);

  const filtersActive = q !== "" || party !== "all" || rsvp !== "all" || diet !== "all";
  const clear = () => {
    setQ("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
  };

  return (
    <>
      <Row horizontal="between" vertical="end" gap="16" wrap>
        <Column gap="4">
          <Heading as="h1" textVariant="display-strong-xs">
            Guest list
          </Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            {GUESTS.length} guests invited. Tables follow the seating plan.
          </Text>
        </Column>
        <Button
          variant="secondary"
          size="s"
          prefixIcon="document"
          onClick={() => window.print()}
        >
          Print for caterer
        </Button>
      </Row>

      <Panel
        title="Meals for the caterer"
        subtitle="One count per menu, including dietary needs"
        action={
          <Row maxWidth="24rem">
            <SegmentedControl
              compact
              value={mealScope}
              onValueChange={setMealScope}
              buttons={[
                { value: "yes", label: "Attending" },
                { value: "all", label: "Plus maybe and no reply" },
              ]}
            />
          </Row>
        }
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
            <VisuallyHidden as="caption">Meal counts</VisuallyHidden>
            <thead>
              <tr>
                <th scope="col" style={th}>
                  <Text textVariant="label-default-xs" onBackground="neutral-weak">
                    Meal
                  </Text>
                </th>
                <th scope="col" style={{ ...th, textAlign: "right" }}>
                  <Text textVariant="label-default-xs" onBackground="neutral-weak">
                    Meals
                  </Text>
                </th>
                <th scope="col" style={th}>
                  <Text textVariant="label-default-xs" onBackground="neutral-weak">
                    Who, and where they sit
                  </Text>
                </th>
              </tr>
            </thead>
            <tbody>
              {meals.rows.map(([meal, list]) => (
                <tr key={meal}>
                  <th scope="row" style={{ ...td, textAlign: "left", whiteSpace: "nowrap" }}>
                    <Text textVariant="label-strong-s">{meal}</Text>
                  </th>
                  <td style={{ ...td, textAlign: "right" }}>
                    <Text textVariant="label-strong-s">{list.length}</Text>
                  </td>
                  <td style={td}>
                    <Text textVariant="body-default-xs" onBackground="neutral-weak">
                      {meal === STANDARD
                        ? "Everyone without a dietary need"
                        : list.map((g) => `${g.name} (${tableName(g) ?? "no table yet"})`).join(", ")}
                    </Text>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" style={{ ...td, textAlign: "left" }}>
                  <Text textVariant="label-strong-s">Total</Text>
                </th>
                <td style={{ ...td, textAlign: "right" }}>
                  <Text textVariant="label-strong-s">{meals.total}</Text>
                </td>
                <td style={td} />
              </tr>
            </tfoot>
          </table>
        </div>
      </Panel>

      <Panel title="Everyone invited">
        <Row gap="12" wrap vertical="end">
          <Row flex={1} minWidth="14rem">
            <Input
              id="guest-search"
              label="Search guests"
              placeholder="Search by name, party, diet or table"
              size="xs"
              value={q}
              onValueChange={setQ}
              prefix={undefined}
            />
          </Row>
          <Row minWidth="11rem" flex={1}>
            <Select
              id="filter-party"
              label="Party"
              size="xs"
              value={party}
              onValueChange={(v) => setParty(String(v))}
              options={[
                { value: "all", label: "All parties" },
                ...PARTIES.map((p) => ({ value: p, label: p })),
              ]}
            />
          </Row>
          <Row minWidth="10rem" flex={1}>
            <Select
              id="filter-rsvp"
              label="RSVP"
              size="xs"
              value={rsvp}
              onValueChange={(v) => setRsvp(String(v))}
              options={[
                { value: "all", label: "Any RSVP" },
                ...(Object.keys(RSVP_LABEL) as Rsvp[]).map((r) => ({
                  value: r,
                  label: RSVP_LABEL[r],
                })),
              ]}
            />
          </Row>
          <Row minWidth="11rem" flex={1}>
            <Select
              id="filter-diet"
              label="Diet"
              size="xs"
              value={diet}
              onValueChange={(v) => setDiet(String(v))}
              options={[
                { value: "all", label: "Any diet" },
                { value: "none", label: "No dietary need" },
                ...DIETS.map((d) => ({ value: d, label: d })),
              ]}
            />
          </Row>
        </Row>
        <Row gap="8" vertical="center" horizontal="between" wrap role="status" aria-live="polite">
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            Showing {filtered.length} of {GUESTS.length} guests
          </Text>
          {filtersActive ? (
            <Button size="s" variant="tertiary" prefixIcon="close" onClick={clear}>
              Clear filters
            </Button>
          ) : null}
        </Row>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
            <VisuallyHidden as="caption">Guest list</VisuallyHidden>
            <thead>
              <tr>
                {["Guest", "Party", "RSVP", "Diet", "Table"].map((h) => (
                  <th key={h} scope="col" style={th}>
                    <Text textVariant="label-default-xs" onBackground="neutral-weak">
                      {h}
                    </Text>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => {
                const t = tableName(g);
                return (
                  <tr key={g.id}>
                    <th scope="row" style={{ ...td, textAlign: "left" }}>
                      <Text textVariant="label-strong-s">{g.name}</Text>
                    </th>
                    <td style={td}>
                      <Row gap="8" vertical="center">
                        <Row width={10} height={10} radius="full" background={dotBg(toneOf(g.party))} />
                        <Text textVariant="body-default-s">{g.party}</Text>
                      </Row>
                    </td>
                    <td style={td}>
                      <Tag size="s" tone={RSVP_TONE[g.rsvp]} label={RSVP_LABEL[g.rsvp]} />
                    </td>
                    <td style={td}>
                      {g.diet ? (
                        <Tag size="s" tone={dietTone(g.diet)} label={g.diet} />
                      ) : (
                        <Text textVariant="body-default-xs" onBackground="neutral-weak">
                          None
                        </Text>
                      )}
                    </td>
                    <td style={td}>
                      {t ? (
                        <Text textVariant="label-default-s">{t}</Text>
                      ) : (
                        <Text textVariant="body-default-xs" onBackground="neutral-weak">
                          {g.rsvp === "no" ? "Not coming" : "Not seated"}
                        </Text>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? (
          <Column center padding="24" gap="8">
            <Text textVariant="label-strong-s">No guests match</Text>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              Try a different search or clear the filters.
            </Text>
          </Column>
        ) : null}
      </Panel>
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
import { PlanProvider } from "@/components/PlanProvider";
import { Shell } from "@/components/Shell";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Seatwise",
  description: "A seating planner for wedding and event planners",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="html" lang="en" suppressHydrationWarning>
      <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
        <Providers>
          <PlanProvider>
            <Shell>{children}</Shell>
          </PlanProvider>
        </Providers>
      </Column>
    </Flex>
  );
}
```
