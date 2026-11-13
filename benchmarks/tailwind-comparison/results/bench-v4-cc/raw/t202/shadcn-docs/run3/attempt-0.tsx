```css app/globals.css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

:root {
  --radius: 0.625rem;
  --background: oklch(0.982 0.006 85);
  --foreground: oklch(0.2 0.02 160);
  --card: oklch(0.999 0.003 85);
  --card-foreground: oklch(0.2 0.02 160);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.2 0.02 160);
  --primary: oklch(0.34 0.055 165);
  --primary-foreground: oklch(0.985 0.01 90);
  --secondary: oklch(0.954 0.01 85);
  --secondary-foreground: oklch(0.25 0.03 165);
  --muted: oklch(0.954 0.01 85);
  --muted-foreground: oklch(0.48 0.02 100);
  --accent: oklch(0.945 0.018 150);
  --accent-foreground: oklch(0.25 0.045 165);
  --destructive: oklch(0.55 0.22 27);
  --border: oklch(0.905 0.01 85);
  --input: oklch(0.89 0.012 85);
  --ring: oklch(0.55 0.08 165);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  html {
    -webkit-tap-highlight-color: transparent;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { PlanProvider } from "@/components/plan-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Seatwise: seating planner",
  description: "Seating plans for wedding and event planners.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <PlanProvider>
          <AppShell>{children}</AppShell>
        </PlanProvider>
        <Toaster />
      </body>
    </html>
  );
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

export type TableShape = "long" | "round";

export type Table = {
  id: string;
  name: string;
  shape: TableShape;
  seats: number;
  x: number;
  y: number;
  rotation?: number;
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

export type RuleKind = "together" | "apart" | "near";

export type Rule = {
  kind: RuleKind;
  guests: string[];
  note: string;
};

export const APP_NAME = "Seatwise";

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

export const TABLES: Table[] = [
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

// Rules reference guests by id, exactly as supplied. (The "apart" note names
// Sean and Ryan Doyle while its ids are g-29 and g-30; the ids are kept as given.)
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

export const TABLE_BY_ID: Record<string, Table> = Object.fromEntries(
  TABLES.map((t) => [t.id, t]),
);

export const GUEST_BY_ID: Record<string, Guest> = Object.fromEntries(
  GUESTS.map((x) => [x.id, x]),
);
```

```ts lib/format.ts
import type { CSSProperties } from "react";
import { EVENT, type Rsvp } from "@/lib/data";

const PARTY_HUES: Record<string, number> = {
  Couple: 15,
  "Bride's family": 335,
  "Groom's family": 255,
  "University friends": 160,
  "Work friends": 90,
  "Groom's football club": 205,
  "Plus-ones": 295,
};

export const PARTY_NAMES = Object.keys(PARTY_HUES);

function hue(party: string) {
  return PARTY_HUES[party] ?? 270;
}

export function partyStyle(party: string): CSSProperties {
  const h = hue(party);
  return {
    backgroundColor: `oklch(0.92 0.055 ${h})`,
    color: `oklch(0.3 0.09 ${h})`,
    borderColor: `oklch(0.72 0.1 ${h})`,
  };
}

export function partyDot(party: string): string {
  return `oklch(0.66 0.14 ${hue(party)})`;
}

export function initials(name: string): string {
  const words = name.split(" ").filter(Boolean);
  const first = words[0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1] ?? "") : "";
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

export function firstName(name: string): string {
  const words = name.split(" ");
  if (words[0] === "Avó" && words[1]) return `${words[0]} ${words[1]}`;
  return words[0] ?? name;
}

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Awaiting reply",
  no: "Declined",
};

export function formatEventDate(): string {
  return new Date(`${EVENT.date}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatMetres(m: number): string {
  return `${m.toFixed(1)} m`;
}
```

```ts lib/geometry.ts
import { TABLES, type Table } from "@/lib/data";

export type SeatPoint = { dx: number; dy: number };

export type TableGeometry = {
  round: boolean;
  bodyW: number;
  bodyH: number;
  haloW: number;
  haloH: number;
  seatD: number;
  seats: SeatPoint[];
};

export function tableGeometry(t: Table): TableGeometry {
  if (t.shape === "round") {
    const bodyD = 1.4 + 0.05 * t.seats;
    const seatD = 0.9;
    const ring = bodyD / 2 + 0.1 + seatD / 2;
    const seats: SeatPoint[] = [];
    for (let i = 0; i < t.seats; i++) {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
      seats.push({ dx: Math.cos(angle) * ring, dy: Math.sin(angle) * ring });
    }
    const halo = 2 * (ring + seatD / 2 + 0.12);
    return { round: true, bodyW: bodyD, bodyH: bodyD, haloW: halo, haloH: halo, seatD, seats };
  }

  const seatD = 0.8;
  const pitch = 0.95;
  const perSide = Math.ceil(t.seats / 2);
  const bodyW = perSide * pitch + 0.1;
  const bodyH = 1;
  const offset = bodyH / 2 + 0.05 + seatD / 2;
  const rot = ((t.rotation ?? 0) * Math.PI) / 180;
  const seats: SeatPoint[] = [];
  for (let i = 0; i < t.seats; i++) {
    const top = i < perSide;
    const count = top ? perSide : t.seats - perSide;
    const index = top ? i : i - perSide;
    const dx = (index - (count - 1) / 2) * pitch;
    const dy = top ? -offset : offset;
    seats.push({
      dx: dx * Math.cos(rot) - dy * Math.sin(rot),
      dy: dx * Math.sin(rot) + dy * Math.cos(rot),
    });
  }
  return {
    round: false,
    bodyW,
    bodyH,
    haloW: (perSide - 1) * pitch + seatD + 0.5,
    haloH: 2 * (offset + seatD / 2 + 0.12),
    seatD,
    seats,
  };
}

export const GEOMETRY: Record<string, TableGeometry> = Object.fromEntries(
  TABLES.map((t) => [t.id, tableGeometry(t)]),
);
```

```ts lib/rules.ts
import { FIXTURES, GUEST_BY_ID, RULES, TABLE_BY_ID, type Rule } from "@/lib/data";
import { firstName, formatMetres } from "@/lib/format";

export type Placement = { table: string; seat: number };
export type Placements = Record<string, Placement | null>;
export type RuleStatus = "ok" | "broken" | "waiting";

export type RuleResult = {
  id: string;
  rule: Rule;
  status: RuleStatus;
  title: string;
  detail: string;
  tableIds: string[];
  guestIds: string[];
};

const MAX_DOOR_DISTANCE = 4.5;
const MIN_STAGE_DISTANCE = 6;

function centre(kind: "door" | "stage") {
  const f = FIXTURES.find((x) => x.kind === kind);
  if (!f) return { x: 0, y: 0 };
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

function distanceToFixture(tableId: string, kind: "door" | "stage"): number {
  const t = TABLE_BY_ID[tableId];
  const c = centre(kind);
  if (!t) return Number.POSITIVE_INFINITY;
  return Math.hypot(t.x - c.x, t.y - c.y);
}

function tableName(id: string): string {
  return TABLE_BY_ID[id]?.name ?? id;
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export function evaluateRules(placements: Placements): RuleResult[] {
  return RULES.map((rule, index): RuleResult => {
    const id = `rule-${index}`;
    const guests = rule.guests.map((gid) => GUEST_BY_ID[gid]).filter((x) => x !== undefined);
    const names = guests.map((x) => x.name);
    const placed = guests.flatMap((x) => {
      const p = placements[x.id] ?? null;
      return p ? [{ guest: x, table: p.table }] : [];
    });
    const unplaced = guests.filter((x) => !placements[x.id]);
    const tableIds = Array.from(new Set(placed.map((p) => p.table)));
    const guestIds = placed.map((p) => p.guest.id);

    if (rule.kind === "together") {
      const title = `${joinNames(names)} together`;
      if (placed.length === 0) {
        return { id, rule, status: "waiting", title, detail: "Nobody in this group is seated yet.", tableIds, guestIds };
      }
      if (unplaced.length > 0) {
        const who = joinNames(unplaced.map((x) => firstName(x.name)));
        const first = placed[0];
        const where = first ? ` with ${firstName(first.guest.name)} at ${tableName(first.table)}` : "";
        return { id, rule, status: "waiting", title, detail: `${who} still needs a seat${where}.`, tableIds, guestIds };
      }
      if (tableIds.length === 1 && tableIds[0]) {
        return { id, rule, status: "ok", title, detail: `Together at ${tableName(tableIds[0])}.`, tableIds, guestIds };
      }
      return {
        id,
        rule,
        status: "broken",
        title,
        detail: `Split across ${joinNames(tableIds.map(tableName))}.`,
        tableIds,
        guestIds,
      };
    }

    if (rule.kind === "apart") {
      const title = `${joinNames(names)} apart`;
      const counts: Record<string, number> = {};
      for (const p of placed) counts[p.table] = (counts[p.table] ?? 0) + 1;
      const shared = Object.keys(counts).find((tid) => (counts[tid] ?? 0) > 1);
      if (shared) {
        const sharing = placed.filter((p) => p.table === shared).map((p) => p.guest.id);
        return {
          id,
          rule,
          status: "broken",
          title,
          detail: `Both are at ${tableName(shared)}.`,
          tableIds: [shared],
          guestIds: sharing,
        };
      }
      const detail =
        placed.length === 0
          ? "Neither is seated yet."
          : unplaced.length > 0
            ? `${joinNames(unplaced.map((x) => firstName(x.name)))} is not seated yet.`
            : `At ${joinNames(tableIds.map(tableName))}.`;
      return { id, rule, status: "ok", title, detail, tableIds, guestIds };
    }

    const subject = guests[0];
    const title = `${subject ? subject.name : "Guest"} near the garden doors`;
    const where = placed[0];
    if (!subject || !where) {
      return { id, rule, status: "waiting", title, detail: "Not seated yet.", tableIds, guestIds };
    }
    const door = distanceToFixture(where.table, "door");
    const stage = distanceToFixture(where.table, "stage");
    const closeEnough = door <= MAX_DOOR_DISTANCE;
    const farEnough = stage >= MIN_STAGE_DISTANCE;
    if (closeEnough && farEnough) {
      return {
        id,
        rule,
        status: "ok",
        title,
        detail: `${tableName(where.table)} is ${formatMetres(door)} from the doors and ${formatMetres(stage)} from the band.`,
        tableIds,
        guestIds,
      };
    }
    const problems: string[] = [];
    if (!closeEnough) {
      problems.push(`${tableName(where.table)} is ${formatMetres(door)} from the garden doors (aim for ${formatMetres(MAX_DOOR_DISTANCE)} or less)`);
    }
    if (!farEnough) {
      problems.push(`only ${formatMetres(stage)} from the band`);
    }
    return { id, rule, status: "broken", title, detail: `${problems.join(", ")}.`, tableIds, guestIds };
  });
}
```

```tsx components/plan-provider.tsx
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
```

```tsx components/app-shell.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EVENT, PLANNER } from "@/lib/data";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Seating plan" },
  { href: "/guests", label: "Guest list" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-3 px-4 sm:gap-6 sm:px-6">
          <Link href="/" className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
            <span aria-hidden className="grid size-8 grid-cols-2 gap-[3px] rounded-lg bg-primary p-[7px]">
              <span className="rounded-full bg-primary-foreground" />
              <span className="rounded-full bg-primary-foreground/50" />
              <span className="rounded-full bg-primary-foreground/50" />
              <span className="rounded-full bg-primary-foreground" />
            </span>
            <span className="text-base font-semibold tracking-tight">Seatwise</span>
          </Link>
          <nav aria-label="Main" className="flex items-center gap-1">
            {NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right leading-tight md:block">
              <p className="text-sm font-medium">{EVENT.name}</p>
              <p className="text-xs text-muted-foreground">{EVENT.venue}</p>
            </div>
            <span
              className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-semibold"
              title={PLANNER.name}
              role="img"
              aria-label={`Signed in as ${PLANNER.name}`}
            >
              HB
            </span>
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-5 sm:px-6">
        {children}
      </main>
    </div>
  );
}
```

```tsx components/rsvp-badge.tsx
import { Badge } from "@/components/ui/badge";
import type { Rsvp } from "@/lib/data";
import { RSVP_LABEL } from "@/lib/format";
import { cn } from "@/lib/utils";

const STYLE: Record<Rsvp, string> = {
  yes: "border-emerald-300 bg-emerald-50 text-emerald-900",
  maybe: "border-amber-300 bg-amber-50 text-amber-900",
  pending: "border-border bg-secondary text-muted-foreground",
  no: "border-red-300 bg-red-50 text-red-900",
};

export function RsvpBadge({ rsvp, className }: { rsvp: Rsvp; className?: string }) {
  return (
    <Badge variant="outline" className={cn(STYLE[rsvp], className)}>
      {RSVP_LABEL[rsvp]}
    </Badge>
  );
}

export function DietBadge({ diet, className }: { diet: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn("border-amber-300 bg-amber-50 text-amber-900", className)}>
      {diet}
    </Badge>
  );
}
```

```tsx components/guest-row.tsx
"use client";

import { XIcon } from "lucide-react";
import { DietBadge } from "@/components/rsvp-badge";
import { usePlan } from "@/components/plan-provider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TABLES, type Guest } from "@/lib/data";
import { initials, partyStyle } from "@/lib/format";
import { cn } from "@/lib/utils";

export function GuestAvatar({ guest, className }: { guest: Guest; className?: string }) {
  return (
    <span
      aria-hidden
      style={partyStyle(guest.party)}
      className={cn("grid size-8 shrink-0 place-items-center rounded-full border text-[11px] font-semibold", className)}
    >
      {initials(guest.name)}
    </span>
  );
}

export function GuestRow({ guest }: { guest: Guest }) {
  const plan = usePlan();
  const current = plan.placements[guest.id] ?? null;
  const held = plan.heldGuestId === guest.id;
  const flagged = plan.flaggedGuestIds.has(guest.id);
  const declined = guest.rsvp === "no";

  return (
    <div
      draggable={!declined}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", guest.id);
        e.dataTransfer.effectAllowed = "move";
        plan.setDragId(guest.id);
      }}
      onDragEnd={() => plan.setDragId(null)}
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-card p-2 transition-shadow",
        !declined && "cursor-grab active:cursor-grabbing",
        held && "ring-2 ring-primary",
        flagged && "border-destructive/50 bg-destructive/5",
      )}
    >
      <button
        type="button"
        disabled={declined}
        aria-pressed={held}
        aria-label={held ? `Stop placing ${guest.name}` : `Pick up ${guest.name}, then tap a seat`}
        onClick={() => plan.holdGuest(held ? null : guest.id)}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-md text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed"
      >
        <GuestAvatar guest={guest} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{guest.name}</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="truncate">{guest.party}</span>
            {guest.diet && <DietBadge diet={guest.diet} className="px-1.5 py-0 text-[10px]" />}
          </span>
        </span>
      </button>
      <Select
        value={current?.table ?? ""}
        onValueChange={(tableId) => {
          if (plan.place(guest.id, tableId)) plan.selectTable(tableId);
        }}
        disabled={declined}
      >
        <SelectTrigger size="sm" className="w-[8.5rem] text-xs" aria-label={`Table for ${guest.name}`}>
          <SelectValue placeholder="Seat at…" />
        </SelectTrigger>
        <SelectContent>
          {TABLES.map((t) => {
            const filled = (plan.seatsByTable[t.id] ?? []).filter(Boolean).length;
            const full = filled >= t.seats && current?.table !== t.id;
            return (
              <SelectItem key={t.id} value={t.id} disabled={full}>
                {t.name}
                <span className="ml-1 text-muted-foreground">
                  {filled}/{t.seats}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {current && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Unseat ${guest.name}`}
          onClick={() => plan.unseat(guest.id)}
        >
          <XIcon />
        </Button>
      )}
    </div>
  );
}
```

```tsx components/room-plan.tsx
"use client";

import * as React from "react";
import { usePlan } from "@/components/plan-provider";
import { FIXTURES, GUEST_BY_ID, ROOM, TABLES, type Fixture } from "@/lib/data";
import { initials, partyDot, partyStyle } from "@/lib/format";
import { GEOMETRY } from "@/lib/geometry";
import { cn } from "@/lib/utils";

const pctX = (v: number) => `${(v / ROOM.width) * 100}%`;
const pctY = (v: number) => `${(v / ROOM.depth) * 100}%`;

function FixtureView({ fixture }: { fixture: Fixture }) {
  const base: React.CSSProperties = {
    left: pctX(fixture.x),
    top: pctY(fixture.y),
    width: pctX(fixture.w),
    height: pctY(fixture.h),
  };
  const labelSize = { fontSize: "clamp(9px, 1.35cqw, 14px)" };

  if (fixture.kind === "door") {
    return (
      <div
        role="img"
        aria-label={`${fixture.label}, left wall`}
        style={base}
        className="absolute z-[1] flex items-center justify-center rounded-sm bg-emerald-700 text-white"
      >
        <span
          style={{ writingMode: "vertical-rl", fontSize: "clamp(8px, 1.1cqw, 12px)" }}
          className="rotate-180 font-medium tracking-wide whitespace-nowrap"
        >
          {fixture.label}
        </span>
      </div>
    );
  }
  if (fixture.kind === "dancefloor") {
    return (
      <div
        role="img"
        aria-label={fixture.label}
        style={{
          ...base,
          backgroundImage: "repeating-conic-gradient(oklch(0.7 0.1 80 / 0.16) 0% 25%, transparent 0% 50%)",
          backgroundSize: `${(2 / fixture.w) * 100}% ${(2 / fixture.h) * 100}%`,
        }}
        className="absolute flex items-center justify-center rounded-md border border-amber-400/50 bg-amber-100/60"
      >
        <span style={labelSize} className="rounded bg-card/80 px-2 py-0.5 font-medium text-amber-900">
          {fixture.label}
        </span>
      </div>
    );
  }
  if (fixture.kind === "stage") {
    return (
      <div
        role="img"
        aria-label={fixture.label}
        style={base}
        className="absolute flex items-center justify-center rounded-md bg-foreground/85 text-background shadow-sm"
      >
        <span style={labelSize} className="font-medium tracking-wide">
          {fixture.label}
        </span>
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={fixture.label}
      style={base}
      className="absolute flex items-center justify-center rounded-md bg-stone-700 text-stone-50 shadow-sm"
    >
      <span style={labelSize} className="font-medium tracking-wide">
        {fixture.label}
      </span>
    </div>
  );
}

export function RoomPlan() {
  const plan = usePlan();
  const [over, setOver] = React.useState<string | null>(null);
  const holding = plan.heldGuestId !== null || plan.dragId !== null;

  function dropGuest(event: React.DragEvent, tableId: string, seat?: number) {
    event.preventDefault();
    const id = plan.dragId ?? event.dataTransfer.getData("text/plain");
    plan.setDragId(null);
    setOver(null);
    if (!id) return;
    if (plan.place(id, tableId, seat)) plan.selectTable(tableId);
  }

  function dragOver(event: React.DragEvent, key: string) {
    if (!plan.dragId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setOver(key);
  }

  function seatClick(tableId: string, index: number, occupantId: string | null) {
    const held = plan.heldGuestId;
    if (held) {
      if (occupantId === held) {
        plan.holdGuest(null);
        return;
      }
      if (plan.place(held, tableId, index)) {
        plan.selectTable(tableId);
        plan.holdGuest(null);
      }
      return;
    }
    if (occupantId) {
      plan.holdGuest(occupantId);
      plan.inspectTable(tableId);
      return;
    }
    plan.inspectTable(tableId);
  }

  function tableClick(tableId: string) {
    const held = plan.heldGuestId;
    if (held) {
      if (plan.place(held, tableId)) {
        plan.selectTable(tableId);
        plan.holdGuest(null);
      }
      return;
    }
    plan.inspectTable(tableId);
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card p-2 shadow-xs sm:p-3">
      <div className="min-w-[880px]" style={{ containerType: "inline-size" }}>
        <div
          role="group"
          aria-label={`Room plan, ${ROOM.width} by ${ROOM.depth} metres`}
          onClick={(e) => {
            if (e.target === e.currentTarget) plan.selectTable(null);
          }}
          className="relative w-full overflow-hidden rounded-lg border-2 border-foreground/25"
          style={{
            aspectRatio: `${ROOM.width} / ${ROOM.depth}`,
            backgroundColor: "oklch(0.972 0.01 85)",
            backgroundImage:
              "linear-gradient(to right, oklch(0.5 0.02 85 / 0.08) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.5 0.02 85 / 0.08) 1px, transparent 1px)",
            backgroundSize: `${100 / ROOM.width}% ${100 / ROOM.depth}%`,
          }}
        >
          {FIXTURES.map((f) => (
            <FixtureView key={f.id} fixture={f} />
          ))}

          {TABLES.map((table) => {
            const geo = GEOMETRY[table.id];
            if (!geo) return null;
            const seats = plan.seatsByTable[table.id] ?? [];
            const filled = seats.filter(Boolean).length;
            const broken = plan.brokenByTable[table.id] ?? [];
            const selected = plan.selectedTableId === table.id;
            const bodyKey = `body:${table.id}`;
            const summary = `${table.name}, ${filled} of ${table.seats} seats filled${
              broken.length ? `, ${broken.length} broken ${broken.length === 1 ? "rule" : "rules"}` : ""
            }`;

            return (
              <React.Fragment key={table.id}>
                {(selected || broken.length > 0) && (
                  <div
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute border",
                      geo.round ? "rounded-full" : "rounded-2xl",
                      broken.length > 0
                        ? "border-dashed border-destructive/70 bg-destructive/5"
                        : "border-primary/50 bg-primary/5",
                    )}
                    style={{
                      left: pctX(table.x - geo.haloW / 2),
                      top: pctY(table.y - geo.haloH / 2),
                      width: pctX(geo.haloW),
                      height: pctY(geo.haloH),
                    }}
                  />
                )}

                <button
                  type="button"
                  aria-label={summary}
                  aria-pressed={selected}
                  onClick={() => tableClick(table.id)}
                  onDragOver={(e) => dragOver(e, bodyKey)}
                  onDragLeave={() => setOver((cur) => (cur === bodyKey ? null : cur))}
                  onDrop={(e) => dropGuest(e, table.id)}
                  style={{
                    left: pctX(table.x - geo.bodyW / 2),
                    top: pctY(table.y - geo.bodyH / 2),
                    width: pctX(geo.bodyW),
                    height: pctY(geo.bodyH),
                  }}
                  className={cn(
                    "absolute z-[2] flex flex-col items-center justify-center border-2 bg-card text-center shadow-sm outline-none transition-shadow focus-visible:ring-[3px] focus-visible:ring-ring/60",
                    geo.round ? "rounded-full" : "rounded-xl",
                    selected ? "border-primary ring-2 ring-primary/40" : "border-foreground/25 hover:border-foreground/50",
                    broken.length > 0 && "border-destructive",
                    over === bodyKey && "border-primary ring-4 ring-primary/30",
                    holding && plan.heldGuestId && "hover:border-primary",
                  )}
                >
                  <span
                    style={{ fontSize: "clamp(9px, 1.3cqw, 14px)" }}
                    className="leading-tight font-semibold"
                  >
                    {table.name}
                  </span>
                  <span
                    style={{ fontSize: "clamp(9px, 1.1cqw, 12px)" }}
                    className={cn(
                      "tabular-nums leading-tight text-muted-foreground",
                      filled === table.seats && "font-medium text-emerald-700",
                    )}
                  >
                    {filled}/{table.seats}
                  </span>
                  {broken.length > 0 && (
                    <span
                      aria-hidden
                      className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-destructive text-[10px] leading-none font-bold text-white"
                    >
                      !
                    </span>
                  )}
                </button>

                {geo.seats.map((point, index) => {
                  const occupantId = seats[index] ?? null;
                  const guest = occupantId ? GUEST_BY_ID[occupantId] : undefined;
                  const key = `${table.id}:${index}`;
                  const flagged = occupantId ? plan.flaggedGuestIds.has(occupantId) : false;
                  const held = occupantId !== null && plan.heldGuestId === occupantId;
                  const label = guest
                    ? `${table.name}, seat ${index + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}${flagged ? ", breaks a rule" : ""}${held ? ", picked up" : ""}`
                    : `${table.name}, seat ${index + 1}: empty`;
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-label={label}
                      title={guest ? `${guest.name}${guest.diet ? ` (${guest.diet})` : ""}` : `Empty seat ${index + 1}`}
                      draggable={Boolean(guest)}
                      onDragStart={(e) => {
                        if (!guest) return;
                        e.dataTransfer.setData("text/plain", guest.id);
                        e.dataTransfer.effectAllowed = "move";
                        plan.setDragId(guest.id);
                      }}
                      onDragEnd={() => {
                        plan.setDragId(null);
                        setOver(null);
                      }}
                      onDragOver={(e) => dragOver(e, key)}
                      onDragLeave={() => setOver((cur) => (cur === key ? null : cur))}
                      onDrop={(e) => dropGuest(e, table.id, index)}
                      onClick={() => seatClick(table.id, index, occupantId)}
                      style={{
                        left: pctX(table.x + point.dx - geo.seatD / 2),
                        top: pctY(table.y + point.dy - geo.seatD / 2),
                        width: pctX(geo.seatD),
                        height: pctY(geo.seatD),
                        fontSize: "clamp(8px, 1.25cqw, 13px)",
                        ...(guest ? partyStyle(guest.party) : {}),
                      }}
                      className={cn(
                        "absolute z-[3] grid place-items-center rounded-full border-2 leading-none outline-none transition-transform focus-visible:ring-[3px] focus-visible:ring-ring/70",
                        guest
                          ? "cursor-grab font-semibold shadow-sm active:cursor-grabbing"
                          : "border-dashed border-foreground/30 bg-background/70 text-foreground/40",
                        !guest && holding && "border-primary/70 bg-primary/10",
                        flagged && "ring-2 ring-destructive ring-offset-1",
                        held && "z-[4] scale-110 ring-2 ring-primary ring-offset-2",
                        over === key && "z-[4] scale-110 ring-4 ring-primary/40",
                      )}
                    >
                      {guest ? initials(guest.name) : <span aria-hidden>+</span>}
                      {guest?.diet && (
                        <span
                          aria-hidden
                          className="absolute -top-[3px] -right-[3px] size-[30%] rounded-full border border-background bg-amber-500"
                        />
                      )}
                    </button>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function PlanLegend() {
  const seen = new Set<string>();
  const parties: string[] = [];
  for (const guest of Object.values(GUEST_BY_ID)) {
    if (!seen.has(guest.party)) {
      seen.add(guest.party);
      parties.push(guest.party);
    }
  }
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground" aria-label="Legend">
      {parties.map((party) => (
        <li key={party} className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: partyDot(party) }} />
          {party}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span aria-hidden className="size-2.5 rounded-full bg-amber-500" />
        Dietary need
      </li>
      <li className="flex items-center gap-1.5">
        <span aria-hidden className="size-2.5 rounded-full border-2 border-destructive" />
        Rule broken
      </li>
      <li>Grid squares are 1 m</li>
    </ul>
  );
}
```

```tsx components/plan-sidebar.tsx
"use client";

import * as React from "react";
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import { GuestRow } from "@/components/guest-row";
import { usePlan, type Panel } from "@/components/plan-provider";
import { DietBadge } from "@/components/rsvp-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GUEST_BY_ID, GUESTS, TABLE_BY_ID, TABLES } from "@/lib/data";
import { firstName } from "@/lib/format";
import { cn } from "@/lib/utils";

function ToSeatPanel() {
  const plan = usePlan();
  const [dropActive, setDropActive] = React.useState(false);
  const toSeat = GUESTS.filter((x) => x.rsvp === "yes" && !plan.placements[x.id]);
  const awaiting = GUESTS.filter((x) => (x.rsvp === "maybe" || x.rsvp === "pending") && !plan.placements[x.id]);
  const declined = GUESTS.filter((x) => x.rsvp === "no");
  const dragged = plan.dragId ? GUEST_BY_ID[plan.dragId] : undefined;
  const canDropHere = Boolean(dragged && plan.placements[dragged.id]);

  return (
    <div
      onDragOver={(e) => {
        if (!canDropHere) return;
        e.preventDefault();
        setDropActive(true);
      }}
      onDragLeave={() => setDropActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDropActive(false);
        if (plan.dragId) plan.unseat(plan.dragId);
        plan.setDragId(null);
      }}
      className={cn(
        "space-y-4 rounded-lg p-1 transition-colors",
        canDropHere && "outline-2 outline-dashed outline-primary/40",
        dropActive && "bg-primary/5",
      )}
    >
      {canDropHere && (
        <p className="rounded-md bg-primary/10 px-3 py-2 text-center text-xs font-medium text-primary">
          Drop here to unseat {dragged ? firstName(dragged.name) : "guest"}
        </p>
      )}
      <section aria-labelledby="to-seat-heading">
        <h3 id="to-seat-heading" className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Attending, no seat ({toSeat.length})
        </h3>
        {toSeat.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            Everyone attending has a seat.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {toSeat.map((x) => (
              <li key={x.id}>
                <GuestRow guest={x} />
              </li>
            ))}
          </ul>
        )}
      </section>
      {awaiting.length > 0 && (
        <section aria-labelledby="awaiting-heading">
          <h3 id="awaiting-heading" className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Not confirmed yet ({awaiting.length})
          </h3>
          <ul className="space-y-1.5">
            {awaiting.map((x) => (
              <li key={x.id}>
                <GuestRow guest={x} />
              </li>
            ))}
          </ul>
        </section>
      )}
      {declined.length > 0 && (
        <p className="px-1 text-xs text-muted-foreground">
          Declined, not seated: {declined.map((x) => x.name).join(", ")}.
        </p>
      )}
    </div>
  );
}

function TablePanel() {
  const plan = usePlan();
  const table = plan.selectedTableId ? TABLE_BY_ID[plan.selectedTableId] : undefined;

  const picker = (
    <Select value={plan.selectedTableId ?? ""} onValueChange={(v) => plan.selectTable(v)}>
      <SelectTrigger className="w-full" aria-label="Choose a table">
        <SelectValue placeholder="Choose a table" />
      </SelectTrigger>
      <SelectContent>
        {TABLES.map((t) => {
          const filled = (plan.seatsByTable[t.id] ?? []).filter(Boolean).length;
          return (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
              <span className="ml-1 text-muted-foreground">
                {filled}/{t.seats}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );

  if (!table) {
    return (
      <div className="space-y-3">
        {picker}
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Tap a table on the plan to see who is sitting there and what they eat.
        </p>
      </div>
    );
  }

  const seats = plan.seatsByTable[table.id] ?? [];
  const seated = seats.filter((x): x is string => x !== null).map((gid) => GUEST_BY_ID[gid]).filter((x) => x !== undefined);
  const diets: Record<string, number> = {};
  for (const x of seated) if (x.diet) diets[x.diet] = (diets[x.diet] ?? 0) + 1;
  const dietEntries = Object.entries(diets);
  const broken = plan.brokenByTable[table.id] ?? [];

  return (
    <div className="space-y-3">
      {picker}
      <div>
        <h3 className="text-lg font-semibold tracking-tight">{table.name}</h3>
        <p className="text-sm text-muted-foreground">
          {seated.length} of {table.seats} seats filled
          {seated.length < table.seats && `, ${table.seats - seated.length} free`}
        </p>
      </div>

      {broken.length > 0 && (
        <ul className="space-y-1.5" aria-label="Broken rules at this table">
          {broken.map((r) => (
            <li
              key={r.id}
              className="flex gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-2.5 text-sm"
            >
              <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
              <span>
                <span className="font-medium">{r.title}.</span> {r.detail}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-lg border bg-secondary/50 p-3">
        <h4 className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Dietary needs</h4>
        {dietEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No dietary needs at this table.</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {dietEntries.map(([diet, n]) => (
              <li key={diet}>
                <DietBadge diet={`${n} × ${diet}`} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <ol className="space-y-1.5" aria-label={`Seats at ${table.name}`}>
        {seats.map((gid, index) => {
          const guest = gid ? GUEST_BY_ID[gid] : undefined;
          return (
            <li key={index} className="flex items-start gap-2">
              <span className="mt-3 w-5 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{index + 1}</span>
              <div className="min-w-0 flex-1">
                {guest ? (
                  <GuestRow guest={guest} />
                ) : (
                  <button
                    type="button"
                    disabled={!plan.heldGuestId}
                    onClick={() => {
                      if (plan.heldGuestId && plan.place(plan.heldGuestId, table.id, index)) plan.holdGuest(null);
                    }}
                    className={cn(
                      "flex h-[3.25rem] w-full items-center rounded-lg border border-dashed px-3 text-left text-sm text-muted-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                      plan.heldGuestId && "border-primary/60 bg-primary/5 text-primary",
                    )}
                  >
                    {plan.heldGuestId ? "Place here" : "Empty seat"}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function RulesPanel() {
  const plan = usePlan();
  return (
    <ul className="space-y-2">
      {plan.results.map((r) => {
        const first = r.tableIds[0];
        return (
          <li
            key={r.id}
            className={cn(
              "rounded-lg border p-3",
              r.status === "broken" && "border-destructive/40 bg-destructive/5",
            )}
          >
            <div className="flex items-start gap-2">
              {r.status === "broken" ? (
                <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
              ) : r.status === "ok" ? (
                <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
              ) : (
                <span aria-hidden className="mt-1.5 ml-1 size-2 shrink-0 rounded-full bg-amber-500" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug font-medium">{r.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{r.rule.note}</p>
                <p className="mt-1.5 text-xs">{r.detail}</p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  r.status === "broken" && "border-destructive/50 bg-destructive/10 text-destructive",
                  r.status === "ok" && "border-emerald-300 bg-emerald-50 text-emerald-900",
                  r.status === "waiting" && "border-amber-300 bg-amber-50 text-amber-900",
                )}
              >
                {r.status === "broken" ? "Broken" : r.status === "ok" ? "Kept" : "Waiting"}
              </Badge>
            </div>
            {first && (
              <Button type="button" variant="outline" size="xs" className="mt-2" onClick={() => plan.inspectTable(first)}>
                Show {TABLE_BY_ID[first]?.name ?? "table"}
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function PlanSidebar() {
  const plan = usePlan();
  return (
    <Tabs
      value={plan.panel}
      onValueChange={(v) => plan.setPanel(v as Panel)}
      className="rounded-xl border bg-card p-3 shadow-xs lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto"
    >
      <TabsList className="w-full">
        <TabsTrigger value="unseated">
          To seat
          <span className="rounded-full bg-primary px-1.5 text-[11px] leading-5 text-primary-foreground tabular-nums">
            {plan.counts.toSeat}
          </span>
        </TabsTrigger>
        <TabsTrigger value="table">Table</TabsTrigger>
        <TabsTrigger value="rules">
          Rules
          {plan.brokenResults.length > 0 && (
            <span className="rounded-full bg-destructive px-1.5 text-[11px] leading-5 text-white tabular-nums">
              {plan.brokenResults.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="unseated" className="pt-1">
        <ToSeatPanel />
      </TabsContent>
      <TabsContent value="table" className="pt-1">
        <TablePanel />
      </TabsContent>
      <TabsContent value="rules" className="pt-1">
        <RulesPanel />
      </TabsContent>
    </Tabs>
  );
}
```

```tsx app/page.tsx
"use client";

import { GuestAvatar } from "@/components/guest-row";
import { usePlan } from "@/components/plan-provider";
import { PlanSidebar } from "@/components/plan-sidebar";
import { PlanLegend, RoomPlan } from "@/components/room-plan";
import { Button } from "@/components/ui/button";
import { EVENT, GUEST_BY_ID, ROOM } from "@/lib/data";
import { formatEventDate } from "@/lib/format";
import { cn } from "@/lib/utils";

function Stat({
  label,
  value,
  caption,
  tone,
}: {
  label: string;
  value: number;
  caption?: string;
  tone?: "alert" | "good";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card px-4 py-3 shadow-xs",
        tone === "alert" && "border-destructive/40 bg-destructive/5",
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          "text-2xl font-semibold tracking-tight tabular-nums",
          tone === "alert" && "text-destructive",
          tone === "good" && "text-emerald-700",
        )}
      >
        {value}
      </p>
      {caption && <p className="truncate text-xs text-muted-foreground">{caption}</p>}
    </div>
  );
}

export default function PlanPage() {
  const plan = usePlan();
  const { counts } = plan;
  const held = plan.heldGuestId ? GUEST_BY_ID[plan.heldGuestId] : undefined;
  const progress = counts.attending ? Math.round((counts.seated / counts.attending) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Seating plan</h1>
          <p className="text-sm text-muted-foreground">
            {EVENT.name} · {formatEventDate()} · {EVENT.venue} · {ROOM.width} × {ROOM.depth} m room
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={plan.undo} disabled={!plan.canUndo}>
          Undo last change
        </Button>
      </div>

      <section aria-label="Seating summary" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Attending" value={counts.attending} caption={`${counts.awaiting} awaiting reply, ${counts.declined} declined`} />
        <Stat
          label="Seated"
          value={counts.seated}
          tone={counts.toSeat === 0 ? "good" : undefined}
          caption={
            counts.awaitingSeated > 0
              ? `${progress}% of attending, plus ${counts.awaitingSeated} unconfirmed`
              : `${progress}% of attending`
          }
        />
        <Stat label="Unseated" value={counts.toSeat} caption="Attending, no seat yet" />
        <Stat
          label="Rules broken"
          value={plan.brokenResults.length}
          tone={plan.brokenResults.length > 0 ? "alert" : "good"}
          caption={`of ${plan.results.length} couple's rules`}
        />
      </section>

      <div aria-live="polite">
        {plan.brokenResults.length > 0 && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-3">
            <h2 className="mb-1.5 text-sm font-semibold text-destructive">
              {plan.brokenResults.length === 1 ? "1 rule needs attention" : `${plan.brokenResults.length} rules need attention`}
            </h2>
            <ul className="space-y-1">
              {plan.brokenResults.map((r) => {
                const first = r.tableIds[0];
                return (
                  <li key={r.id} className="flex flex-wrap items-baseline gap-x-2 text-sm">
                    <span className="font-medium">{r.title}:</span>
                    <span className="text-muted-foreground">{r.detail}</span>
                    {first && (
                      <button
                        type="button"
                        onClick={() => plan.inspectTable(first)}
                        className="rounded text-xs font-medium text-destructive underline underline-offset-2 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        Show on plan
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {held && (
          <div
            role="status"
            className="mt-3 flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-sm"
          >
            <GuestAvatar guest={held} />
            <span className="min-w-0 flex-1">
              Placing <strong>{held.name}</strong>. Tap an empty seat or a table, or tap an occupied seat to swap.
            </span>
            <Button type="button" size="sm" variant="outline" onClick={() => plan.holdGuest(null)}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-3">
          <RoomPlan />
          <PlanLegend />
          <p className="text-xs text-muted-foreground">
            Drag a guest onto a seat, or tap a guest and then a seat. Drop a seated guest onto the To seat list to unseat them.
          </p>
        </div>
        <PlanSidebar />
      </div>
    </div>
  );
}
```

```tsx app/guests/page.tsx
"use client";

import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
import { GuestAvatar } from "@/components/guest-row";
import { usePlan } from "@/components/plan-provider";
import { DietBadge, RsvpBadge } from "@/components/rsvp-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EVENT, GUESTS, TABLE_BY_ID, type Rsvp } from "@/lib/data";
import { formatEventDate, RSVP_LABEL } from "@/lib/format";
import { cn } from "@/lib/utils";

const STANDARD = "Standard menu";
const PARTIES = Array.from(new Set(GUESTS.map((x) => x.party)));
const DIETS = Array.from(new Set(GUESTS.flatMap((x) => (x.diet ? [x.diet] : [])))).sort((a, b) => a.localeCompare(b));
const RSVPS: Rsvp[] = ["yes", "maybe", "pending", "no"];

function FilterSelect({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  );
}

export default function GuestsPage() {
  const plan = usePlan();
  const [query, setQuery] = React.useState("");
  const [party, setParty] = React.useState("all");
  const [rsvp, setRsvp] = React.useState("all");
  const [diet, setDiet] = React.useState("all");
  const [seating, setSeating] = React.useState("all");

  const filtersActive = query !== "" || party !== "all" || rsvp !== "all" || diet !== "all" || seating !== "all";

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return GUESTS.filter((guest) => {
      const placement = plan.placements[guest.id] ?? null;
      const tableName = placement ? (TABLE_BY_ID[placement.table]?.name ?? "") : "";
      if (party !== "all" && guest.party !== party) return false;
      if (rsvp !== "all" && guest.rsvp !== rsvp) return false;
      if (diet === "none" && guest.diet) return false;
      if (diet !== "all" && diet !== "none" && guest.diet !== diet) return false;
      if (seating === "seated" && !placement) return false;
      if (seating === "unseated" && placement) return false;
      if (q) {
        const haystack = `${guest.name} ${guest.party} ${guest.diet ?? ""} ${tableName}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [plan.placements, query, party, rsvp, diet, seating]);

  const meals = React.useMemo(() => {
    const names = [STANDARD, ...DIETS];
    return names.map((meal) => {
      const match = (x: (typeof GUESTS)[number]) => (meal === STANDARD ? !x.diet : x.diet === meal);
      return {
        meal,
        confirmed: GUESTS.filter((x) => x.rsvp === "yes" && match(x)).length,
        open: GUESTS.filter((x) => (x.rsvp === "maybe" || x.rsvp === "pending") && match(x)).length,
      };
    });
  }, []);

  const confirmedTotal = meals.reduce((sum, m) => sum + m.confirmed, 0);
  const openTotal = meals.reduce((sum, m) => sum + m.open, 0);
  const declined = GUESTS.filter((x) => x.rsvp === "no").length;

  function clearFilters() {
    setQuery("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
    setSeating("all");
  }

  async function copyMeals() {
    const text = [
      `${EVENT.name}, ${formatEventDate()}`,
      `${EVENT.venue}`,
      "",
      ...meals.filter((m) => m.confirmed > 0).map((m) => `${m.meal}: ${m.confirmed}`),
      `Total confirmed: ${confirmedTotal}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Meal counts copied", { description: "Paste them into your message to the caterer." });
    } catch {
      toast.error("Couldn't copy", { description: "Select the counts and copy them by hand." });
    }
  }

  function filterByMeal(meal: string) {
    setRsvp("yes");
    setDiet(meal === STANDARD ? "none" : meal);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Guest list</h1>
        <p className="text-sm text-muted-foreground">
          {GUESTS.length} invited · {plan.counts.attending} attending · {plan.counts.awaiting} awaiting a reply · {declined} declined
        </p>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-label="Caterer meal counts" className="order-first rounded-xl border bg-card p-4 shadow-xs xl:sticky xl:top-[4.5rem] xl:order-last">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Meals for the caterer</h2>
              <p className="text-xs text-muted-foreground">Guests who have said yes. Tap a meal to list who has it.</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={copyMeals}>
              Copy
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meal</TableHead>
                <TableHead className="text-right">Confirmed</TableHead>
                <TableHead className="text-right">Not yet</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meals.map((m) => (
                <TableRow key={m.meal}>
                  <TableCell className="p-0">
                    <button
                      type="button"
                      onClick={() => filterByMeal(m.meal)}
                      className="w-full rounded-md px-2 py-2 text-left outline-none hover:bg-secondary focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      {m.meal}
                    </button>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{m.confirmed}</TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">{m.open}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="font-semibold">Total</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">{confirmedTotal}</TableCell>
                <TableCell className="text-right text-muted-foreground tabular-nums">{openTotal}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
          <p className="mt-3 text-xs text-muted-foreground">
            &ldquo;Not yet&rdquo; counts guests who are maybe or haven&apos;t replied. They are not in the confirmed total.
          </p>
        </section>

        <section aria-label="Guests" className="min-w-0 rounded-xl border bg-card shadow-xs">
          <div className="grid gap-3 border-b p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
            <div className="min-w-0 space-y-1.5 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="guest-search" className="text-xs text-muted-foreground">
                Search
              </Label>
              <Input
                id="guest-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name, party, diet or table"
              />
            </div>
            <FilterSelect id="filter-party" label="Party" value={party} onChange={setParty}>
              <SelectItem value="all">All parties</SelectItem>
              {PARTIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </FilterSelect>
            <FilterSelect id="filter-rsvp" label="RSVP" value={rsvp} onChange={setRsvp}>
              <SelectItem value="all">Any reply</SelectItem>
              {RSVPS.map((r) => (
                <SelectItem key={r} value={r}>
                  {RSVP_LABEL[r]}
                </SelectItem>
              ))}
            </FilterSelect>
            <FilterSelect id="filter-diet" label="Diet" value={diet} onChange={setDiet}>
              <SelectItem value="all">Any diet</SelectItem>
              <SelectItem value="none">No dietary need</SelectItem>
              {DIETS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </FilterSelect>
            <FilterSelect id="filter-seating" label="Seating" value={seating} onChange={setSeating}>
              <SelectItem value="all">Seated or not</SelectItem>
              <SelectItem value="seated">Seated</SelectItem>
              <SelectItem value="unseated">Unseated</SelectItem>
            </FilterSelect>
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-2 text-sm text-muted-foreground">
            <p aria-live="polite">
              Showing {rows.length} of {GUESTS.length} guests
            </p>
            {filtersActive && (
              <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>

          {rows.length === 0 ? (
            <div className="px-4 pb-8 pt-4 text-center">
              <p className="font-medium">No guests match</p>
              <p className="mt-1 text-sm text-muted-foreground">Try a different search or clear the filters.</p>
              <Button type="button" variant="outline" size="sm" className="mt-3" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Guest</TableHead>
                  <TableHead className="hidden md:table-cell">Party</TableHead>
                  <TableHead>RSVP</TableHead>
                  <TableHead className="hidden sm:table-cell">Diet</TableHead>
                  <TableHead className="pr-4">Table</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((guest) => {
                  const placement = plan.placements[guest.id] ?? null;
                  const table = placement ? TABLE_BY_ID[placement.table] : undefined;
                  return (
                    <TableRow key={guest.id}>
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-2.5">
                          <GuestAvatar guest={guest} />
                          <div className="min-w-0">
                            <p className="truncate font-medium">{guest.name}</p>
                            <p className="truncate text-xs text-muted-foreground md:hidden">{guest.party}</p>
                            {guest.diet && <DietBadge diet={guest.diet} className="mt-0.5 sm:hidden" />}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">{guest.party}</TableCell>
                      <TableCell>
                        <RsvpBadge rsvp={guest.rsvp} />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {guest.diet ? <DietBadge diet={guest.diet} /> : <span className="text-muted-foreground">None</span>}
                      </TableCell>
                      <TableCell className="pr-4">
                        {table ? (
                          <Link
                            href="/"
                            onClick={() => plan.inspectTable(table.id)}
                            className="rounded font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                          >
                            {table.name}
                          </Link>
                        ) : (
                          <span className={cn(guest.rsvp === "no" ? "text-muted-foreground" : "font-medium text-amber-700")}>
                            {guest.rsvp === "no" ? "Not coming" : "Unseated"}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </section>
      </div>
    </div>
  );
}
```
