```tsx app/layout.tsx
import "./globals.css";

import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/app-shell";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: { default: "Seatwise", template: "%s · Seatwise" },
  description: "Seatwise, a seating planner for wedding and event planners.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AppShell>{children}</AppShell>
        <Toaster />
      </body>
    </html>
  );
}
```

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
  --background: oklch(0.982 0.005 85);
  --foreground: oklch(0.22 0.015 170);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.22 0.015 170);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.22 0.015 170);
  --primary: oklch(0.36 0.06 172);
  --primary-foreground: oklch(0.985 0.005 85);
  --secondary: oklch(0.955 0.008 85);
  --secondary-foreground: oklch(0.3 0.04 172);
  --muted: oklch(0.955 0.008 85);
  --muted-foreground: oklch(0.5 0.015 170);
  --accent: oklch(0.945 0.025 172);
  --accent-foreground: oklch(0.3 0.05 172);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.905 0.01 85);
  --input: oklch(0.89 0.01 85);
  --ring: oklch(0.55 0.08 172);
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
  body {
    @apply bg-background text-foreground;
  }
}

/* While a guest is being dragged: one cursor everywhere, no text selection. */
body.is-dragging,
body.is-dragging * {
  cursor: grabbing !important;
  user-select: none !important;
}
```

```tsx app/page.tsx
import { PlanView } from "@/components/plan-view";

export default function Page() {
  return <PlanView />;
}
```

```tsx app/guests/page.tsx
import type { Metadata } from "next";
import { GuestsView } from "@/components/guests-view";

export const metadata: Metadata = { title: "Guests" };

export default function GuestsPage() {
  return <GuestsView />;
}
```

```ts lib/data.ts
import type { CSSProperties } from "react";

export type Rsvp = "yes" | "maybe" | "pending" | "no";

export interface Guest {
  id: string;
  name: string;
  party: string;
  rsvp: Rsvp;
  diet: string | null;
  /** Where the guest starts out; the live seating is held in the plan provider. */
  table: string | null;
}

export interface TableDef {
  id: string;
  name: string;
  shape: "round" | "long";
  seats: number;
  x: number;
  y: number;
  rotation?: number;
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

export interface Rule {
  kind: "together" | "apart" | "near";
  guests: string[];
  note: string;
}

export const APP_NAME = "Seatwise";

export const EVENT = {
  name: "Ines & Mateo's wedding dinner",
  date: "2027-06-19",
  venue: "The Orangery, Hollin Hall",
  room_m: { width: 24, depth: 14 },
};

export const PLANNER = { name: "Hannah Brook" };

export function formatEventDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

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
  // The brief's note names the brothers Sean and Ryan Doyle (g-30 and g-31), but its
  // guest ids read g-29 (Kai Brennan) and g-30. The rule follows the note's intent.
  {
    kind: "apart",
    guests: ["g-30", "g-31"],
    note: "Brothers Sean and Ryan Doyle are not speaking",
  },
  { kind: "apart", guests: ["g-12", "g-34"], note: "Ask the couple: old family dispute" },
  {
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
  },
];

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Awaiting reply",
  no: "Declined",
};

export const PARTIES: string[] = [
  "Couple",
  "Bride's family",
  "Groom's family",
  "University friends",
  "Work friends",
  "Groom's football club",
  "Plus-ones",
];

const PARTY_HUE: Record<string, number> = {
  Couple: 355,
  "Bride's family": 75,
  "Groom's family": 255,
  "University friends": 205,
  "Work friends": 305,
  "Groom's football club": 140,
  "Plus-ones": 260,
};

function chroma(party: string): number {
  return party === "Plus-ones" ? 0.015 : 0.1;
}

/** Seat colours for a party (fill, outline, text). */
export function partyStyle(party: string): CSSProperties {
  const h = PARTY_HUE[party] ?? 260;
  const c = chroma(party);
  return {
    backgroundColor: `oklch(0.92 ${c} ${h})`,
    borderColor: `oklch(0.6 ${c * 1.3} ${h})`,
    color: `oklch(0.28 ${c} ${h})`,
  };
}

export function partyDot(party: string): string {
  const h = PARTY_HUE[party] ?? 260;
  return `oklch(0.62 ${chroma(party) * 1.4} ${h})`;
}

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1] ?? "") : "";
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

export function firstName(name: string): string {
  return name.split(" ")[0] ?? name;
}

export const STANDARD_MENU = "Standard menu";
```

```ts lib/plan.ts
import { FIXTURES, GUESTS, RULES, TABLES, type Guest, type TableDef } from "@/lib/data";
import type { Rule } from "@/lib/data";

export const ROOM = { w: 24, d: 14 };
export const SEAT_D = 0.84;

const LONG_SPACING = 1.9;
const LONG_DEPTH = 1.0;

/** A table counts as "near the garden doors" within this distance, and "away from the band" beyond the second. */
export const NEAR_DOOR_MAX_M = 4.5;
export const AWAY_FROM_BAND_MIN_M = 6;

export interface Pt {
  x: number;
  y: number;
}

export interface TableGeom {
  centre: Pt;
  w: number;
  h: number;
  round: boolean;
  seats: Pt[];
}

export function tableGeom(t: TableDef): TableGeom {
  if (t.shape === "long") {
    const perSide = Math.ceil(t.seats / 2);
    const seats: Pt[] = [];
    for (let i = 0; i < t.seats; i++) {
      const top = i < perSide;
      const col = top ? i : i - perSide;
      seats.push({
        x: t.x + LONG_SPACING * (col + 0.5),
        y: top ? t.y - 0.45 : t.y + LONG_DEPTH + 0.45,
      });
    }
    const w = perSide * LONG_SPACING;
    return {
      centre: { x: t.x + w / 2, y: t.y + LONG_DEPTH / 2 },
      w,
      h: LONG_DEPTH,
      round: false,
      seats,
    };
  }
  const d = t.seats > 6 ? 1.8 : 1.5;
  const r = t.seats > 6 ? 1.4 : 1.2;
  const seats: Pt[] = [];
  for (let i = 0; i < t.seats; i++) {
    const a = ((-90 + (i * 360) / t.seats) * Math.PI) / 180;
    seats.push({ x: t.x + r * Math.cos(a), y: t.y + r * Math.sin(a) });
  }
  return { centre: { x: t.x, y: t.y }, w: d, h: d, round: true, seats };
}

export const TABLES_BY_ID: Record<string, TableDef> = {};
export const TABLE_GEOM: Record<string, TableGeom> = {};
for (const t of TABLES) {
  TABLES_BY_ID[t.id] = t;
  TABLE_GEOM[t.id] = tableGeom(t);
}

export const GUESTS_BY_ID: Record<string, Guest> = {};
for (const gst of GUESTS) GUESTS_BY_ID[gst.id] = gst;

export const TOTAL_SEATS = TABLES.reduce((n, t) => n + t.seats, 0);

function fixtureCentre(kind: string): Pt {
  const f = FIXTURES.find((x) => x.kind === kind);
  return f ? { x: f.x + f.w / 2, y: f.y + f.h / 2 } : { x: 0, y: 0 };
}
const DOOR = fixtureCentre("door");
const BAND = fixtureCentre("stage");

function dist(a: Pt, b: Pt): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function distanceToDoors(tableId: string): number {
  const geom = TABLE_GEOM[tableId];
  return geom ? dist(geom.centre, DOOR) : Infinity;
}

export function isNearDoorsAwayFromBand(tableId: string): boolean {
  const geom = TABLE_GEOM[tableId];
  if (!geom) return false;
  return (
    dist(geom.centre, DOOR) <= NEAR_DOOR_MAX_M && dist(geom.centre, BAND) >= AWAY_FROM_BAND_MIN_M
  );
}

/** table id -> seat list (guest id or null). */
export type Seating = Record<string, (string | null)[]>;

export function initialSeating(): Seating {
  const seating: Seating = {};
  for (const t of TABLES) seating[t.id] = new Array<string | null>(t.seats).fill(null);
  for (const gst of GUESTS) {
    if (!gst.table) continue;
    const list = seating[gst.table];
    if (!list) continue;
    const free = list.indexOf(null);
    if (free >= 0) list[free] = gst.id;
  }
  return seating;
}

export type RuleStatus = "ok" | "broken" | "open";

export interface RuleResult {
  index: number;
  rule: Rule;
  status: RuleStatus;
  headline: string;
  detail: string;
  tableIds: string[];
  guestIds: string[];
}

function nameOf(id: string): string {
  return GUESTS_BY_ID[id]?.name ?? id;
}
function tableName(id: string): string {
  return TABLES_BY_ID[id]?.name ?? id;
}

export function evaluateRules(tableOf: Record<string, string | undefined>): RuleResult[] {
  return RULES.map((rule, index): RuleResult => {
    const ids = rule.guests;
    const base = { index, rule, guestIds: ids };

    if (rule.kind === "near") {
      const id = ids[0] ?? "";
      const t = tableOf[id];
      if (!t) {
        return {
          ...base,
          status: "open",
          headline: `${nameOf(id)} still needs a seat`,
          detail: "Seat her near the garden doors, away from the band.",
          tableIds: [],
        };
      }
      const d = distanceToDoors(t);
      if (isNearDoorsAwayFromBand(t)) {
        return {
          ...base,
          status: "ok",
          headline: `${nameOf(id)} is near the garden doors`,
          detail: `${tableName(t)} is ${d.toFixed(1)} m from the doors and clear of the band.`,
          tableIds: [t],
        };
      }
      const good = TABLES.filter((x) => isNearDoorsAwayFromBand(x.id))
        .map((x) => x.name)
        .join(", ");
      return {
        ...base,
        status: "broken",
        headline: `${nameOf(id)} is not near the garden doors`,
        detail: `${tableName(t)} is ${d.toFixed(1)} m from the doors.${good ? ` Try ${good}.` : ""}`,
        tableIds: [t],
      };
    }

    const a = ids[0] ?? "";
    const b = ids[1] ?? "";
    const ta = tableOf[a];
    const tb = tableOf[b];

    if (rule.kind === "together") {
      if (ta && tb) {
        if (ta === tb) {
          return {
            ...base,
            status: "ok",
            headline: `${nameOf(a)} and ${nameOf(b)} are together`,
            detail: `Both at ${tableName(ta)}.`,
            tableIds: [ta],
          };
        }
        return {
          ...base,
          status: "broken",
          headline: `${nameOf(a)} and ${nameOf(b)} are split up`,
          detail: `${nameOf(a)} is at ${tableName(ta)}, ${nameOf(b)} at ${tableName(tb)}.`,
          tableIds: [ta, tb],
        };
      }
      if (ta || tb) {
        const seated = (ta ? a : b) as string;
        const waiting = ta ? b : a;
        const at = (ta ?? tb) as string;
        return {
          ...base,
          status: "open",
          headline: `${nameOf(waiting)} still needs a seat`,
          detail: `${nameOf(seated)} is at ${tableName(at)}; seat ${nameOf(waiting)} there too.`,
          tableIds: [at],
        };
      }
      return {
        ...base,
        status: "open",
        headline: `${nameOf(a)} and ${nameOf(b)} are not seated yet`,
        detail: "Seat them at the same table.",
        tableIds: [],
      };
    }

    // apart
    if (ta && tb && ta === tb) {
      return {
        ...base,
        status: "broken",
        headline: `${nameOf(a)} and ${nameOf(b)} share a table`,
        detail: `Both at ${tableName(ta)}. Move one of them.`,
        tableIds: [ta],
      };
    }
    const where = ta && tb ? `At ${tableName(ta)} and ${tableName(tb)}.` : "At least one of them is not seated yet.";
    return {
      ...base,
      status: "ok",
      headline: `${nameOf(a)} and ${nameOf(b)} are apart`,
      detail: where,
      tableIds: [],
    };
  });
}
```

```tsx components/plan-provider.tsx
"use client";

import * as React from "react";
import { toast } from "sonner";
import { GUESTS, TABLES, firstName, type Guest } from "@/lib/data";
import {
  GUESTS_BY_ID,
  TABLES_BY_ID,
  TOTAL_SEATS,
  evaluateRules,
  initialSeating,
  type RuleResult,
  type RuleStatus,
  type Seating,
} from "@/lib/plan";

export type Panel = "place" | "table" | "rules";

interface PlanContextValue {
  seating: Seating;
  tableOf: Record<string, string | undefined>;
  perTable: Record<string, number>;
  seatedCount: number;
  attendingCount: number;
  toPlace: Guest[];
  awaiting: Guest[];
  totalSeats: number;
  results: RuleResult[];
  tableFlags: Record<string, RuleStatus | undefined>;
  guestFlags: Set<string>;
  selectedTableId: string | null;
  pickedId: string | null;
  panel: Panel;
  setPanel: (p: Panel) => void;
  selectTable: (id: string | null) => void;
  pick: (id: string | null) => void;
  seat: (guestId: string, tableId: string, seatIndex?: number) => void;
  unseat: (guestId: string) => void;
}

const PlanContext = React.createContext<PlanContextValue | null>(null);

export function usePlan(): PlanContextValue {
  const ctx = React.useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

function cloneSeating(s: Seating): Seating {
  const next: Seating = {};
  for (const key of Object.keys(s)) next[key] = [...(s[key] ?? [])];
  return next;
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [seating, setSeating] = React.useState<Seating>(initialSeating);
  const [selectedTableId, setSelectedTableId] = React.useState<string | null>(null);
  const [pickedId, setPickedId] = React.useState<string | null>(null);
  const [panel, setPanel] = React.useState<Panel>("place");

  const tableOf = React.useMemo(() => {
    const map: Record<string, string | undefined> = {};
    for (const tid of Object.keys(seating)) {
      for (const gid of seating[tid] ?? []) if (gid) map[gid] = tid;
    }
    return map;
  }, [seating]);

  const perTable = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const tid of Object.keys(seating)) {
      map[tid] = (seating[tid] ?? []).filter(Boolean).length;
    }
    return map;
  }, [seating]);

  const results = React.useMemo(() => evaluateRules(tableOf), [tableOf]);

  const { tableFlags, guestFlags } = React.useMemo(() => {
    const tf: Record<string, RuleStatus | undefined> = {};
    const gf = new Set<string>();
    for (const r of results) {
      if (r.status === "ok") continue;
      for (const tid of r.tableIds) {
        if (r.status === "broken" || !tf[tid]) tf[tid] = r.status;
      }
      if (r.status === "broken") r.guestIds.forEach((id) => gf.add(id));
    }
    return { tableFlags: tf, guestFlags: gf };
  }, [results]);

  const seatedCount = Object.keys(tableOf).length;
  const attendingCount = GUESTS.filter((x) => x.rsvp === "yes").length;
  const toPlace = React.useMemo(
    () => GUESTS.filter((x) => x.rsvp === "yes" && !tableOf[x.id]),
    [tableOf],
  );
  const awaiting = React.useMemo(
    () => GUESTS.filter((x) => (x.rsvp === "maybe" || x.rsvp === "pending") && !tableOf[x.id]),
    [tableOf],
  );

  const commit = React.useCallback(
    (next: Seating, message: string, description?: string) => {
      const previous = seating;
      setSeating(next);
      toast.success(message, {
        description,
        action: { label: "Undo", onClick: () => setSeating(previous) },
      });
    },
    [seating],
  );

  const seat = React.useCallback(
    (guestId: string, tableId: string, seatIndex?: number) => {
      const guest = GUESTS_BY_ID[guestId];
      const table = TABLES_BY_ID[tableId];
      if (!guest || !table) return;
      if (guest.rsvp === "no") {
        toast.error(`${guest.name} has declined`, { description: "Declined guests do not get a seat." });
        return;
      }
      const next = cloneSeating(seating);
      let fromTable: string | undefined;
      let fromIndex = -1;
      for (const tid of Object.keys(next)) {
        const i = (next[tid] ?? []).indexOf(guestId);
        if (i >= 0) {
          fromTable = tid;
          fromIndex = i;
        }
      }
      const dest = next[tableId];
      if (!dest) return;
      let index = seatIndex;
      if (index === undefined) {
        if (fromTable === tableId) {
          setPickedId(null);
          return;
        }
        index = dest.indexOf(null);
        if (index < 0) {
          toast.error(`${table.name} is full`, {
            description: "Choose another table, or unseat someone first.",
          });
          return;
        }
      }
      const occupant = dest[index] ?? null;
      if (occupant === guestId) {
        setPickedId(null);
        return;
      }
      if (fromTable) (next[fromTable] as (string | null)[])[fromIndex] = null;
      dest[index] = guestId;
      let description: string | undefined;
      if (occupant) {
        const o = GUESTS_BY_ID[occupant];
        if (fromTable) {
          (next[fromTable] as (string | null)[])[fromIndex] = occupant;
          description = `${o ? firstName(o.name) : "Guest"} moved to ${TABLES_BY_ID[fromTable]?.name ?? "the other seat"}.`;
        } else {
          description = `${o ? firstName(o.name) : "Guest"} is now unseated.`;
        }
      }
      const verb = fromTable ? "moved to" : "seated at";
      commit(next, `${firstName(guest.name)} ${verb} ${table.name}`, description);
      setPickedId(null);
      setSelectedTableId(tableId);
    },
    [seating, commit],
  );

  const unseat = React.useCallback(
    (guestId: string) => {
      const guest = GUESTS_BY_ID[guestId];
      const next = cloneSeating(seating);
      let found = false;
      for (const tid of Object.keys(next)) {
        const list = next[tid] ?? [];
        const i = list.indexOf(guestId);
        if (i >= 0) {
          list[i] = null;
          found = true;
        }
      }
      setPickedId(null);
      if (!found || !guest) return;
      commit(next, `${firstName(guest.name)} unseated`, "Back in the list of guests to place.");
    },
    [seating, commit],
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPickedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = React.useMemo<PlanContextValue>(
    () => ({
      seating,
      tableOf,
      perTable,
      seatedCount,
      attendingCount,
      toPlace,
      awaiting,
      totalSeats: TOTAL_SEATS,
      results,
      tableFlags,
      guestFlags,
      selectedTableId,
      pickedId,
      panel,
      setPanel,
      selectTable: setSelectedTableId,
      pick: setPickedId,
      seat,
      unseat,
    }),
    [
      seating,
      tableOf,
      perTable,
      seatedCount,
      attendingCount,
      toPlace,
      awaiting,
      results,
      tableFlags,
      guestFlags,
      selectedTableId,
      pickedId,
      panel,
      seat,
      unseat,
    ],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export const ALL_TABLES = TABLES;
```

```tsx components/drag-layer.tsx
"use client";

import * as React from "react";
import { GripVertical } from "lucide-react";
import { partyStyle } from "@/lib/data";
import { GUESTS_BY_ID } from "@/lib/plan";
import { usePlan } from "@/components/plan-provider";

export type DropTarget =
  | { kind: "seat"; tableId: string; index: number }
  | { kind: "table"; tableId: string }
  | { kind: "unseat" };

interface DragContextValue {
  dragId: string | null;
  over: DropTarget | null;
  onPointerDown: (e: React.PointerEvent, guestId: string) => void;
}

const DragContext = React.createContext<DragContextValue>({
  dragId: null,
  over: null,
  onPointerDown: () => {},
});

export function useDrag(): DragContextValue {
  return React.useContext(DragContext);
}

function readTarget(x: number, y: number): DropTarget | null {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;
  const hit = el.closest<HTMLElement>("[data-drop]");
  if (!hit) return null;
  const kind = hit.dataset.drop;
  if (kind === "seat") {
    return {
      kind: "seat",
      tableId: hit.dataset.table ?? "",
      index: Number(hit.dataset.seat ?? 0),
    };
  }
  if (kind === "table") return { kind: "table", tableId: hit.dataset.table ?? "" };
  if (kind === "unseat") return { kind: "unseat" };
  return null;
}

/** Pointer-based drag and drop: works with mouse, pen and touch. */
export function DragProvider({ children }: { children: React.ReactNode }) {
  const { seat, unseat } = usePlan();
  const [ghost, setGhost] = React.useState<{ id: string; x: number; y: number } | null>(null);
  const [over, setOver] = React.useState<DropTarget | null>(null);

  const actions = React.useRef({ seat, unseat });
  React.useEffect(() => {
    actions.current = { seat, unseat };
  }, [seat, unseat]);

  const onPointerDown = React.useCallback((e: React.PointerEvent, guestId: string) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const startX = e.clientX;
    const startY = e.clientY;
    let active = false;

    const move = (ev: PointerEvent) => {
      if (!active) {
        if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < 6) return;
        active = true;
        document.body.classList.add("is-dragging");
      }
      setGhost({ id: guestId, x: ev.clientX, y: ev.clientY });
      setOver(readTarget(ev.clientX, ev.clientY));
    };

    const finish = (ev: PointerEvent, drop: boolean) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      if (!active) return;
      document.body.classList.remove("is-dragging");
      const target = drop ? readTarget(ev.clientX, ev.clientY) : null;
      setGhost(null);
      setOver(null);
      // The browser fires a click after the pointer is released; swallow it.
      const swallow = (c: Event) => {
        c.stopPropagation();
        c.preventDefault();
      };
      window.addEventListener("click", swallow, { capture: true, once: true });
      window.setTimeout(() => window.removeEventListener("click", swallow, true), 80);
      if (!target) return;
      if (target.kind === "seat") actions.current.seat(guestId, target.tableId, target.index);
      else if (target.kind === "table") actions.current.seat(guestId, target.tableId);
      else actions.current.unseat(guestId);
    };
    const up = (ev: PointerEvent) => finish(ev, true);
    const cancel = (ev: PointerEvent) => finish(ev, false);

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
  }, []);

  const value = React.useMemo<DragContextValue>(
    () => ({ dragId: ghost?.id ?? null, over, onPointerDown }),
    [ghost?.id, over, onPointerDown],
  );

  const ghostGuest = ghost ? GUESTS_BY_ID[ghost.id] : undefined;

  return (
    <DragContext.Provider value={value}>
      {children}
      {ghost && ghostGuest ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-[100] flex items-center gap-1.5 rounded-full border-2 bg-card px-3 py-1.5 text-sm font-medium shadow-lg"
          style={{
            left: ghost.x,
            top: ghost.y,
            transform: "translate(14px, -50%)",
            ...partyStyle(ghostGuest.party),
          }}
        >
          <GripVertical className="size-3.5 opacity-60" />
          {ghostGuest.name}
        </div>
      ) : null}
    </DragContext.Provider>
  );
}
```

```tsx components/app-shell.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Armchair, CalendarDays, LayoutGrid, Users } from "lucide-react";
import { EVENT, PLANNER, formatEventDate } from "@/lib/data";
import { cn } from "@/lib/utils";
import { PlanProvider } from "@/components/plan-provider";

const NAV = [
  { href: "/", label: "Plan", icon: LayoutGrid },
  { href: "/guests", label: "Guests", icon: Users },
];

function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md font-semibold tracking-tight outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Armchair className="size-4.5" aria-hidden="true" />
          </span>
          <span className="text-base">Seatwise</span>
        </Link>

        <nav aria-label="Primary" className="ml-1 flex items-center gap-1">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
            <CalendarDays className="size-4" aria-hidden="true" />
            <span className="max-w-[28ch] truncate">
              {EVENT.name} · {formatEventDate(EVENT.date).replace(/^\w+ /, "")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground"
            >
              HB
            </span>
            <span className="sr-only sm:not-sr-only sm:text-sm sm:font-medium">{PLANNER.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <PlanProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <div className="flex min-h-svh flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
      </div>
    </PlanProvider>
  );
}
```

```tsx components/floor-plan.tsx
"use client";

import * as React from "react";
import { DoorOpen, Music, TriangleAlert, Wine } from "lucide-react";
import { FIXTURES, PARTIES, TABLES, initials, partyDot, partyStyle, type Fixture } from "@/lib/data";
import { GUESTS_BY_ID, ROOM, SEAT_D, TABLE_GEOM, type TableGeom } from "@/lib/plan";
import { cn } from "@/lib/utils";
import { useDrag } from "@/components/drag-layer";
import { usePlan } from "@/components/plan-provider";

const px = (m: number) => `${(m / ROOM.w) * 100}%`;
const py = (m: number) => `${(m / ROOM.d) * 100}%`;
const centred = "-translate-x-1/2 -translate-y-1/2";

function FixtureView({ f }: { f: Fixture }) {
  const box: React.CSSProperties = { left: px(f.x), top: py(f.y), width: px(f.w), height: py(f.h) };
  const text: React.CSSProperties = { fontSize: "clamp(9px, 1.15cqw, 13px)" };

  if (f.kind === "door") {
    return (
      <>
        <div
          role="img"
          aria-label={f.label}
          className="absolute rounded-sm bg-emerald-600"
          style={box}
        />
        <span
          aria-hidden="true"
          className="absolute flex items-center gap-1 font-medium text-emerald-800"
          style={{
            left: `calc(${px(f.x + f.w)} + 4px)`,
            top: py(f.y),
            height: py(f.h),
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontSize: "clamp(8px, 1cqw, 12px)",
          }}
        >
          {f.label}
        </span>
      </>
    );
  }

  if (f.kind === "dancefloor") {
    return (
      <div
        role="img"
        aria-label={f.label}
        className="absolute grid place-items-center rounded-md border border-stone-300/80"
        style={{
          ...box,
          backgroundImage:
            "repeating-conic-gradient(oklch(0.93 0.025 85) 0% 25%, oklch(0.965 0.015 85) 0% 50%)",
          backgroundSize: `${(2 / f.w) * 100}% ${(2 / f.h) * 100}%`,
        }}
      >
        <span
          className="rounded-full bg-background/80 px-2.5 py-0.5 font-medium tracking-wide text-stone-600 uppercase"
          style={{ ...text, fontSize: "clamp(8px, 0.95cqw, 12px)" }}
        >
          {f.label}
        </span>
      </div>
    );
  }

  const stage = f.kind === "stage";
  const Icon = stage ? Music : Wine;
  return (
    <div
      role="img"
      aria-label={f.label}
      className={cn(
        "absolute flex flex-col items-center justify-center gap-0.5 rounded-md font-medium shadow-sm",
        stage ? "bg-stone-800 text-stone-50" : "bg-amber-900 text-amber-50",
      )}
      style={{ ...box, ...text }}
    >
      <Icon className="size-[1.4em]" aria-hidden="true" />
      {f.label}
    </div>
  );
}

function TableView({ tableId }: { tableId: string }) {
  const table = TABLES.find((t) => t.id === tableId);
  const geom: TableGeom | undefined = TABLE_GEOM[tableId];
  const {
    seating,
    perTable,
    tableFlags,
    guestFlags,
    selectedTableId,
    pickedId,
    seat,
    pick,
    selectTable,
    setPanel,
  } = usePlan();
  const drag = useDrag();
  if (!table || !geom) return null;

  const list = seating[tableId] ?? [];
  const count = perTable[tableId] ?? 0;
  const flag = tableFlags[tableId];
  const selected = selectedTableId === tableId;
  const overTable =
    drag.over &&
    (drag.over.kind === "table" || drag.over.kind === "seat") &&
    drag.over.tableId === tableId;

  const openTable = () => {
    if (pickedId) {
      seat(pickedId, tableId);
      return;
    }
    selectTable(tableId);
    setPanel("table");
  };

  const onSeat = (index: number, occupant: string | null) => {
    if (pickedId) {
      if (occupant === pickedId) pick(null);
      else seat(pickedId, tableId, index);
      return;
    }
    if (occupant) pick(occupant);
    selectTable(tableId);
    setPanel("table");
  };

  const bodyStyle: React.CSSProperties = geom.round
    ? { left: px(geom.centre.x), top: py(geom.centre.y), width: px(geom.w), aspectRatio: "1" }
    : { left: px(geom.centre.x), top: py(geom.centre.y), width: px(geom.w), height: py(geom.h) };

  return (
    <>
      <button
        type="button"
        data-drop="table"
        data-table={tableId}
        onClick={openTable}
        aria-pressed={selected}
        aria-label={`${table.name}, ${count} of ${table.seats} seats filled${
          flag === "broken" ? ", a rule is broken here" : flag === "open" ? ", a rule is waiting on this table" : ""
        }`}
        className={cn(
          "absolute flex flex-col items-center justify-center border-2 bg-card text-center leading-tight shadow-sm outline-none transition-[box-shadow,border-color]",
          geom.round ? "rounded-full" : "rounded-lg",
          "focus-visible:ring-[3px] focus-visible:ring-ring/60",
          flag === "broken"
            ? "border-red-500"
            : flag === "open"
              ? "border-amber-500"
              : selected
                ? "border-primary"
                : "border-stone-300",
          selected && "ring-4 ring-primary/25",
          overTable && "ring-4 ring-primary/50",
          pickedId && "cursor-copy",
        )}
        style={{ ...bodyStyle, transform: "translate(-50%, -50%)", fontSize: "clamp(9px, 1.15cqw, 13px)" }}
      >
        <span className="font-semibold">{table.name}</span>
        <span className="text-muted-foreground tabular-nums">
          {count}/{table.seats}
        </span>
        {flag ? (
          <span
            aria-hidden="true"
            className={cn(
              "absolute -top-2 -right-2 grid size-5 place-items-center rounded-full text-white shadow",
              flag === "broken" ? "bg-red-600" : "bg-amber-500",
            )}
          >
            <TriangleAlert className="size-3" />
          </span>
        ) : null}
      </button>

      {geom.seats.map((pt, index) => {
        const guestId = list[index] ?? null;
        const guest = guestId ? GUESTS_BY_ID[guestId] : undefined;
        const isOver =
          drag.over?.kind === "seat" && drag.over.tableId === tableId && drag.over.index === index;
        const label = guest
          ? `${guest.name}, ${table.name} seat ${index + 1}${guest.diet ? `, ${guest.diet}` : ""}${
              guestFlags.has(guest.id) ? ", breaks a rule" : ""
            }`
          : `${table.name} seat ${index + 1}, empty`;
        return (
          <button
            key={index}
            type="button"
            data-drop="seat"
            data-table={tableId}
            data-seat={index}
            aria-label={label}
            aria-pressed={guest ? pickedId === guest.id : undefined}
            title={guest ? guest.name : `${table.name}, seat ${index + 1} is empty`}
            onClick={() => onSeat(index, guestId)}
            onPointerDown={guest ? (e) => drag.onPointerDown(e, guest.id) : undefined}
            draggable={false}
            className={cn(
              "absolute z-10 grid select-none place-items-center rounded-full border-2 font-semibold leading-none outline-none transition-[box-shadow,transform,opacity]",
              centred,
              "focus-visible:z-30 focus-visible:ring-[3px] focus-visible:ring-ring",
              guest
                ? "cursor-grab touch-none shadow-sm active:cursor-grabbing"
                : "border-dashed border-stone-300 bg-background/80 text-muted-foreground hover:border-primary",
              guest && guestFlags.has(guest.id) && "ring-2 ring-red-500",
              guest && pickedId === guest.id && "z-20 scale-110 ring-4 ring-primary/60",
              guest && drag.dragId === guest.id && "opacity-35",
              !guest && pickedId && "border-primary bg-accent",
              isOver && "z-20 scale-110 ring-4 ring-primary",
            )}
            style={{
              left: px(pt.x),
              top: py(pt.y),
              width: px(SEAT_D),
              aspectRatio: "1",
              fontSize: "clamp(8px, 1.05cqw, 12px)",
              ...(guest ? partyStyle(guest.party) : undefined),
            }}
          >
            {guest ? initials(guest.name) : null}
            {guest?.diet ? (
              <span
                aria-hidden="true"
                className="absolute -top-0.5 -right-0.5 size-[32%] min-w-1.5 rounded-full bg-amber-500 ring-1 ring-white"
              />
            ) : null}
          </button>
        );
      })}
    </>
  );
}

export function FloorPlan() {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-xs">
      <div className="min-w-[720px] p-3 sm:p-4">
        <div
          role="group"
          aria-label={`Room plan, ${ROOM.w} by ${ROOM.d} metres, drawn to scale`}
          className="relative w-full overflow-hidden rounded-lg border-[3px] border-stone-400"
          style={{
            aspectRatio: `${ROOM.w} / ${ROOM.d}`,
            containerType: "inline-size",
            backgroundColor: "oklch(0.978 0.01 85)",
            backgroundImage:
              "linear-gradient(to right, oklch(0.91 0.01 85) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.91 0.01 85) 1px, transparent 1px)",
            backgroundSize: `${100 / ROOM.w}% ${100 / ROOM.d}%`,
          }}
        >
          {FIXTURES.map((f) => (
            <FixtureView key={f.id} f={f} />
          ))}
          {TABLES.map((t) => (
            <TableView key={t.id} tableId={t.id} />
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {ROOM.w} m by {ROOM.d} m, one grid square is 1 m. Dashed seats are empty; an amber dot marks a
          dietary need; a red ring marks a guest in a broken rule.
        </p>
      </div>
    </div>
  );
}

export function PartyLegend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground" aria-label="Party colours">
      {PARTIES.map((p) => (
        <li key={p} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="size-2.5 rounded-full"
            style={{ backgroundColor: partyDot(p) }}
          />
          {p}
        </li>
      ))}
    </ul>
  );
}

export function TableChips() {
  const { perTable, tableFlags, selectedTableId, selectTable, setPanel, pickedId, seat } = usePlan();
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Seats filled per table">
      {TABLES.map((t) => {
        const n = perTable[t.id] ?? 0;
        const full = n >= t.seats;
        const flag = tableFlags[t.id];
        return (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => {
                if (pickedId) {
                  seat(pickedId, t.id);
                  return;
                }
                selectTable(t.id);
                setPanel("table");
              }}
              aria-pressed={selectedTableId === t.id}
              className={cn(
                "flex h-9 items-center gap-2 rounded-lg border bg-card px-3 text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50",
                selectedTableId === t.id && "border-primary bg-accent",
              )}
            >
              <span className="font-medium">{t.name}</span>
              <span className={cn("tabular-nums", full ? "text-emerald-700" : "text-muted-foreground")}>
                {n}/{t.seats}
              </span>
              {flag ? (
                <TriangleAlert
                  className={cn("size-3.5", flag === "broken" ? "text-red-600" : "text-amber-500")}
                  aria-label={flag === "broken" ? "Rule broken" : "Rule waiting"}
                />
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export { DoorOpen };
```

```tsx components/plan-panel.tsx
"use client";

import * as React from "react";
import {
  CircleCheck,
  GripVertical,
  Info,
  MousePointerClick,
  TriangleAlert,
  UserMinus,
} from "lucide-react";
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
import { TABLES, partyDot, type Guest } from "@/lib/data";
import { GUESTS_BY_ID, TABLES_BY_ID } from "@/lib/plan";
import { cn } from "@/lib/utils";
import { useDrag } from "@/components/drag-layer";
import { usePlan, type Panel } from "@/components/plan-provider";

function DietBadge({ diet }: { diet: string }) {
  return (
    <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-900">
      {diet}
    </Badge>
  );
}

function TablePicker({
  guestId,
  placeholder,
  excludeTableId,
}: {
  guestId: string;
  placeholder: string;
  excludeTableId?: string;
}) {
  const { seat, perTable } = usePlan();
  const guest = GUESTS_BY_ID[guestId];
  return (
    <div onPointerDown={(e) => e.stopPropagation()}>
      <Select value="" onValueChange={(tid) => seat(guestId, tid)}>
        <SelectTrigger size="sm" className="w-[8.5rem]" aria-label={`${placeholder}: ${guest?.name ?? ""}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {TABLES.filter((t) => t.id !== excludeTableId).map((t) => {
            const free = t.seats - (perTable[t.id] ?? 0);
            return (
              <SelectItem key={t.id} value={t.id} disabled={free <= 0}>
                {t.name} · {free <= 0 ? "full" : `${free} free`}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

function UnplacedRow({ guest }: { guest: Guest }) {
  const { pickedId, pick, guestFlags } = usePlan();
  const drag = useDrag();
  const picked = pickedId === guest.id;
  return (
    <li
      onPointerDown={(e) => drag.onPointerDown(e, guest.id)}
      className={cn(
        "flex select-none items-center gap-1 rounded-lg border bg-card py-1.5 pr-2 pl-1 touch-pan-y",
        picked && "border-primary bg-accent ring-2 ring-primary/30",
        drag.dragId === guest.id && "opacity-40",
        guestFlags.has(guest.id) && "border-red-400",
      )}
    >
      <span
        aria-hidden="true"
        className="grid h-8 w-6 shrink-0 cursor-grab touch-none place-items-center text-muted-foreground"
      >
        <GripVertical className="size-4" />
      </span>
      <button
        type="button"
        onClick={() => pick(picked ? null : guest.id)}
        aria-pressed={picked}
        className="min-w-0 flex-1 rounded-md px-1 py-0.5 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <span className="block truncate text-sm font-medium">{guest.name}</span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span
              aria-hidden="true"
              className="size-2 rounded-full"
              style={{ backgroundColor: partyDot(guest.party) }}
            />
            {guest.party}
          </span>
          {guest.diet ? <span className="text-amber-800">{guest.diet}</span> : null}
          {guest.rsvp !== "yes" ? (
            <span className="italic">{guest.rsvp === "maybe" ? "maybe" : "no reply yet"}</span>
          ) : null}
        </span>
      </button>
      <TablePicker guestId={guest.id} placeholder="Seat at…" />
    </li>
  );
}

function PlaceTab() {
  const { toPlace, awaiting, seatedCount } = usePlan();
  const drag = useDrag();
  const dropActive = drag.over?.kind === "unseat";
  return (
    <div
      data-drop="unseat"
      className={cn(
        "space-y-4 rounded-xl border border-dashed border-transparent p-1 transition-colors",
        drag.dragId && "border-primary/40 bg-accent/40",
        dropActive && "border-primary bg-accent",
      )}
    >
      <section aria-labelledby="to-place-heading" className="space-y-2">
        <h3 id="to-place-heading" className="text-sm font-semibold">
          Attending, no seat yet <span className="font-normal text-muted-foreground">({toPlace.length})</span>
        </h3>
        {toPlace.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg border bg-card p-3 text-sm text-muted-foreground">
            <CircleCheck className="size-4 text-emerald-600" aria-hidden="true" />
            Everyone attending has a seat.
          </div>
        ) : (
          <ul className="space-y-1.5">
            {toPlace.map((guest) => (
              <UnplacedRow key={guest.id} guest={guest} />
            ))}
          </ul>
        )}
      </section>

      {awaiting.length > 0 ? (
        <section aria-labelledby="awaiting-heading" className="space-y-2">
          <h3 id="awaiting-heading" className="text-sm font-semibold">
            Not confirmed <span className="font-normal text-muted-foreground">({awaiting.length})</span>
          </h3>
          <ul className="space-y-1.5">
            {awaiting.map((guest) => (
              <UnplacedRow key={guest.id} guest={guest} />
            ))}
          </ul>
        </section>
      ) : null}

      <p className="flex gap-2 rounded-lg bg-muted/70 p-2.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <span>
          Drag a guest onto a seat or table, or tap a guest and then a seat. Drop a seated guest here to
          unseat them. {seatedCount} guests are seated so far.
        </span>
      </p>
    </div>
  );
}

function TableTab() {
  const { selectedTableId, seating, results, perTable, pick, pickedId, unseat } = usePlan();
  if (!selectedTableId) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        <MousePointerClick className="size-6" aria-hidden="true" />
        <p>Select a table on the plan to see who sits there and what they can eat.</p>
      </div>
    );
  }
  const table = TABLES_BY_ID[selectedTableId];
  if (!table) return null;
  const list = seating[selectedTableId] ?? [];
  const count = perTable[selectedTableId] ?? 0;
  const diets = new Map<string, number>();
  for (const id of list) {
    const d = id ? GUESTS_BY_ID[id]?.diet : null;
    if (d) diets.set(d, (diets.get(d) ?? 0) + 1);
  }
  const related = results.filter((r) => r.status !== "ok" && r.tableIds.includes(selectedTableId));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">{table.name}</h3>
        <p className="text-sm text-muted-foreground">
          {count} of {table.seats} seats filled · {table.seats - count} free
        </p>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label={`${table.name} seats filled`}
          aria-valuemin={0}
          aria-valuemax={table.seats}
          aria-valuenow={count}
        >
          <div className="h-full rounded-full bg-primary" style={{ width: `${(count / table.seats) * 100}%` }} />
        </div>
      </div>

      <section aria-labelledby="diet-heading" className="space-y-1.5">
        <h4 id="diet-heading" className="text-sm font-semibold">
          Dietary needs at this table
        </h4>
        {diets.size === 0 ? (
          <p className="text-sm text-muted-foreground">None listed.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {Array.from(diets.entries()).map(([d, n]) => (
              <DietBadge key={d} diet={`${n}× ${d}`} />
            ))}
          </div>
        )}
      </section>

      {related.length > 0 ? (
        <ul className="space-y-1.5">
          {related.map((r) => (
            <li
              key={r.index}
              className={cn(
                "flex gap-2 rounded-lg border p-2.5 text-sm",
                r.status === "broken"
                  ? "border-red-300 bg-red-50 text-red-950"
                  : "border-amber-300 bg-amber-50 text-amber-950",
              )}
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                <span className="font-medium">{r.headline}.</span> {r.detail}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <section aria-labelledby="seats-heading" className="space-y-1.5">
        <h4 id="seats-heading" className="text-sm font-semibold">
          Seats
        </h4>
        <ol className="space-y-1.5">
          {list.map((id, i) => {
            const guest = id ? GUESTS_BY_ID[id] : undefined;
            if (!guest) {
              return (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground"
                >
                  <span className="w-4 text-right text-xs tabular-nums">{i + 1}</span>
                  Open seat
                </li>
              );
            }
            return (
              <li
                key={i}
                className={cn(
                  "flex items-center gap-2 rounded-lg border bg-card py-1.5 pr-1.5 pl-3",
                  pickedId === guest.id && "border-primary bg-accent",
                )}
              >
                <span className="w-4 text-right text-xs tabular-nums text-muted-foreground">{i + 1}</span>
                <button
                  type="button"
                  onClick={() => pick(pickedId === guest.id ? null : guest.id)}
                  aria-pressed={pickedId === guest.id}
                  className="min-w-0 flex-1 rounded-md px-1 py-0.5 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <span className="block truncate text-sm font-medium">{guest.name}</span>
                  <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span
                        aria-hidden="true"
                        className="size-2 rounded-full"
                        style={{ backgroundColor: partyDot(guest.party) }}
                      />
                      {guest.party}
                    </span>
                    {guest.diet ? <span className="font-medium text-amber-800">{guest.diet}</span> : null}
                  </span>
                </button>
                <TablePicker guestId={guest.id} placeholder="Move to…" excludeTableId={selectedTableId} />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => unseat(guest.id)}
                  aria-label={`Unseat ${guest.name}`}
                >
                  <UserMinus />
                </Button>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

export function RulesList() {
  const { results, selectTable, setPanel } = usePlan();
  const order = { broken: 0, open: 1, ok: 2 } as const;
  const sorted = [...results].sort((a, b) => order[a.status] - order[b.status]);
  return (
    <ul className="space-y-2">
      {sorted.map((r) => (
        <li
          key={r.index}
          className={cn(
            "rounded-lg border p-3 text-sm",
            r.status === "broken" && "border-red-300 bg-red-50",
            r.status === "open" && "border-amber-300 bg-amber-50",
            r.status === "ok" && "bg-card",
          )}
        >
          <div className="flex items-start gap-2">
            {r.status === "ok" ? (
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
            ) : (
              <TriangleAlert
                className={cn("mt-0.5 size-4 shrink-0", r.status === "broken" ? "text-red-600" : "text-amber-600")}
                aria-hidden="true"
              />
            )}
            <div className="min-w-0 space-y-1">
              <p className="font-medium">
                {r.headline}
                <span className="sr-only">
                  {r.status === "broken" ? " (broken)" : r.status === "open" ? " (waiting)" : " (met)"}
                </span>
              </p>
              <p className="text-muted-foreground">{r.detail}</p>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium uppercase">
                  {r.rule.kind === "together" ? "Keep together" : r.rule.kind === "apart" ? "Keep apart" : "Seat near"}
                </span>{" "}
                · {r.rule.note}
              </p>
              {r.tableIds.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {r.tableIds.map((tid) => (
                    <Button
                      key={tid}
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => {
                        selectTable(tid);
                        setPanel("table");
                      }}
                    >
                      {TABLES_BY_ID[tid]?.name}
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function PlanPanel() {
  const { panel, setPanel, toPlace, results } = usePlan();
  const broken = results.filter((r) => r.status === "broken").length;
  return (
    <Tabs value={panel} onValueChange={(v) => setPanel(v as Panel)} className="gap-3">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="place">
          To place
          <Badge variant="secondary" className="px-1.5 tabular-nums">
            {toPlace.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="table">Table</TabsTrigger>
        <TabsTrigger value="rules">
          Rules
          {broken > 0 ? (
            <Badge variant="destructive" className="px-1.5 tabular-nums">
              {broken}
            </Badge>
          ) : null}
        </TabsTrigger>
      </TabsList>
      <div className="min-[1180px]:max-h-[calc(100svh-14rem)] min-[1180px]:overflow-y-auto min-[1180px]:pr-1">
        <TabsContent value="place">
          <PlaceTab />
        </TabsContent>
        <TabsContent value="table">
          <TableTab />
        </TabsContent>
        <TabsContent value="rules">
          <RulesList />
        </TabsContent>
      </div>
    </Tabs>
  );
}
```

```tsx components/plan-view.tsx
"use client";

import * as React from "react";
import { CircleCheck, Hand, MapPin, TriangleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EVENT, GUESTS, formatEventDate } from "@/lib/data";
import { GUESTS_BY_ID, TABLES_BY_ID } from "@/lib/plan";
import { cn } from "@/lib/utils";
import { DragProvider } from "@/components/drag-layer";
import { FloorPlan, PartyLegend, TableChips } from "@/components/floor-plan";
import { PlanPanel } from "@/components/plan-panel";
import { usePlan } from "@/components/plan-provider";

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  hint: string;
  tone?: "bad" | "warn" | "good";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-3 shadow-xs sm:p-4",
        tone === "bad" && "border-red-300",
        tone === "good" && "border-emerald-300",
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function StatStrip() {
  const { seatedCount, attendingCount, toPlace, awaiting, totalSeats, results } = usePlan();
  const broken = results.filter((r) => r.status === "broken").length;
  const open = results.filter((r) => r.status === "open").length;
  const declined = GUESTS.filter((g) => g.rsvp === "no").length;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-live="polite">
      <Stat label="Seated" value={seatedCount} hint={`of ${totalSeats} seats · ${totalSeats - seatedCount} free`} />
      <Stat
        label="Still to place"
        value={toPlace.length}
        hint={`${attendingCount} attending in all`}
        tone={toPlace.length === 0 ? "good" : undefined}
      />
      <Stat
        label="Rules broken"
        value={broken}
        hint={`${open} waiting · ${results.length - broken - open} met`}
        tone={broken > 0 ? "bad" : "good"}
      />
      <Stat label="Not confirmed" value={awaiting.length} hint={`unseated · ${declined} declined`} />
    </div>
  );
}

function RuleBanner() {
  const { results, setPanel } = usePlan();
  const broken = results.filter((r) => r.status === "broken");
  const open = results.filter((r) => r.status === "open");
  const review = () => {
    setPanel("rules");
    document.getElementById("side-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const good = broken.length === 0;
  return (
    <section
      aria-label="Rule check"
      className={cn(
        "flex flex-wrap items-start gap-3 rounded-xl border p-3 sm:p-4",
        good ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50",
      )}
    >
      {good ? (
        <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
      ) : (
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden="true" />
      )}
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-semibold">
          {good
            ? "None of the couple's rules is broken"
            : `${broken.length} of the couple's ${results.length} rules ${broken.length === 1 ? "is" : "are"} broken`}
          {open.length > 0 ? (
            <span className="font-normal text-muted-foreground"> · {open.length} waiting on a seat</span>
          ) : null}
        </p>
        {broken.length > 0 ? (
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {broken.map((r) => (
              <li key={r.index}>
                {r.headline}. <span className="text-muted-foreground">{r.detail}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={review}>
        Review rules
      </Button>
    </section>
  );
}

function PickBar() {
  const { pickedId, tableOf, pick, unseat } = usePlan();
  if (!pickedId) return null;
  const guest = GUESTS_BY_ID[pickedId];
  if (!guest) return null;
  const at = tableOf[pickedId];
  return (
    <div
      role="status"
      className="sticky top-16 z-30 flex flex-wrap items-center gap-3 rounded-xl border border-primary bg-primary p-3 text-primary-foreground shadow-lg"
    >
      <Hand className="size-4 shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1 text-sm">
        <span className="font-semibold">
          {at ? "Moving" : "Placing"} {guest.name}
        </span>
        {at ? ` from ${TABLES_BY_ID[at]?.name}` : ""}. Tap an open seat, or a table for its next free seat.
      </p>
      {at ? (
        <Button type="button" size="sm" variant="secondary" onClick={() => unseat(pickedId)}>
          Unseat
        </Button>
      ) : null}
      <Button type="button" size="sm" variant="secondary" onClick={() => pick(null)}>
        <X /> Cancel
      </Button>
    </div>
  );
}

export function PlanView() {
  return (
    <DragProvider>
      <main id="main" className="mx-auto w-full max-w-[1600px] space-y-4 px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Seating plan</h1>
            <p className="text-sm text-muted-foreground">
              {EVENT.name} · {formatEventDate(EVENT.date)}
            </p>
          </div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" aria-hidden="true" />
            {EVENT.venue}
          </p>
        </div>

        <StatStrip />
        <RuleBanner />
        <PickBar />

        <div className="grid gap-4 min-[1180px]:grid-cols-[minmax(0,1fr)_380px] min-[1180px]:items-start">
          <section aria-label="Room plan" className="min-w-0 space-y-3">
            <FloorPlan />
            <TableChips />
            <PartyLegend />
          </section>
          <aside id="side-panel" aria-label="Guests, table details and rules" className="min-w-0 scroll-mt-20">
            <PlanPanel />
          </aside>
        </div>
      </main>
    </DragProvider>
  );
}
```

```tsx components/guests-view.tsx
"use client";

import * as React from "react";
import { Copy, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  EVENT,
  GUESTS,
  PARTIES,
  RSVP_LABEL,
  STANDARD_MENU,
  formatEventDate,
  partyDot,
  type Guest,
  type Rsvp,
} from "@/lib/data";
import { TABLES_BY_ID } from "@/lib/plan";
import { cn } from "@/lib/utils";
import { usePlan } from "@/components/plan-provider";

const DIETS: string[] = Array.from(
  new Set(GUESTS.map((g) => g.diet).filter((d): d is string => Boolean(d))),
).sort();

const RSVP_STYLE: Record<Rsvp, string> = {
  yes: "border-emerald-300 bg-emerald-50 text-emerald-900",
  maybe: "border-amber-300 bg-amber-50 text-amber-900",
  pending: "border-stone-300 bg-stone-100 text-stone-700",
  no: "border-red-300 bg-red-50 text-red-900",
};

interface MealRow {
  meal: string;
  filter: string;
  confirmed: number;
  awaiting: number;
}

function buildMeals(): MealRow[] {
  const rows: MealRow[] = [{ meal: STANDARD_MENU, filter: "none", confirmed: 0, awaiting: 0 }];
  for (const d of DIETS) rows.push({ meal: d, filter: d, confirmed: 0, awaiting: 0 });
  for (const g of GUESTS) {
    const row = rows.find((r) => r.meal === (g.diet ?? STANDARD_MENU));
    if (!row) continue;
    if (g.rsvp === "yes") row.confirmed += 1;
    else if (g.rsvp === "maybe" || g.rsvp === "pending") row.awaiting += 1;
  }
  return rows;
}

const MEALS = buildMeals();

export function GuestsView() {
  const { tableOf } = usePlan();
  const [query, setQuery] = React.useState("");
  const [party, setParty] = React.useState("all");
  const [rsvp, setRsvp] = React.useState("all");
  const [diet, setDiet] = React.useState("all");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return GUESTS.filter((g: Guest) => {
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === "any" && !g.diet) return false;
      if (diet === "none" && g.diet) return false;
      if (diet !== "all" && diet !== "any" && diet !== "none" && g.diet !== diet) return false;
      if (q) {
        const t = tableOf[g.id];
        const hay = `${g.name} ${g.party} ${g.diet ?? ""} ${t ? (TABLES_BY_ID[t]?.name ?? "") : ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, party, rsvp, diet, tableOf]);

  const filtersOn = query !== "" || party !== "all" || rsvp !== "all" || diet !== "all";
  const clear = () => {
    setQuery("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
  };

  const counts = {
    yes: GUESTS.filter((g) => g.rsvp === "yes").length,
    maybe: GUESTS.filter((g) => g.rsvp === "maybe").length,
    pending: GUESTS.filter((g) => g.rsvp === "pending").length,
    no: GUESTS.filter((g) => g.rsvp === "no").length,
  };
  const totalConfirmed = MEALS.reduce((n, m) => n + m.confirmed, 0);
  const totalAwaiting = MEALS.reduce((n, m) => n + m.awaiting, 0);

  const copyMeals = async () => {
    const lines = [
      `Meal counts: ${EVENT.name}, ${formatEventDate(EVENT.date)}, ${EVENT.venue}`,
      `Confirmed guests: ${totalConfirmed}`,
      ...MEALS.filter((m) => m.confirmed > 0 || m.awaiting > 0).map(
        (m) => `${m.meal}: ${m.confirmed}${m.awaiting ? ` (+${m.awaiting} awaiting reply)` : ""}`,
      ),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success("Meal counts copied", { description: "Ready to paste into an email to the caterer." });
    } catch {
      toast.error("Could not copy", { description: "Your browser blocked clipboard access." });
    }
  };

  return (
    <main id="main" className="mx-auto w-full max-w-[1600px] space-y-5 px-4 py-5 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Guest list</h1>
        <p className="text-sm text-muted-foreground">
          {GUESTS.length} guests · {counts.yes} attending · {counts.maybe} maybe · {counts.pending} awaiting reply ·{" "}
          {counts.no} declined
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <section aria-label="Guests" className="min-w-0 space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_repeat(3,minmax(0,11rem))]">
            <div className="relative col-span-2 sm:col-span-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, party, diet or table"
                aria-label="Search guests"
                className="pl-9"
              />
            </div>
            <Select value={party} onValueChange={setParty}>
              <SelectTrigger aria-label="Filter by party" className="w-full">
                <SelectValue placeholder="Party" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All parties</SelectItem>
                {PARTIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={rsvp} onValueChange={setRsvp}>
              <SelectTrigger aria-label="Filter by RSVP" className="w-full">
                <SelectValue placeholder="RSVP" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any RSVP</SelectItem>
                {(Object.keys(RSVP_LABEL) as Rsvp[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {RSVP_LABEL[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={diet} onValueChange={setDiet}>
              <SelectTrigger aria-label="Filter by diet" className="w-full">
                <SelectValue placeholder="Diet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any diet</SelectItem>
                <SelectItem value="any">Has a dietary need</SelectItem>
                <SelectItem value="none">No dietary need</SelectItem>
                {DIETS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex min-h-8 items-center justify-between gap-2 text-sm text-muted-foreground">
            <p aria-live="polite">
              Showing {filtered.length} of {GUESTS.length} guests
            </p>
            {filtersOn ? (
              <Button type="button" variant="ghost" size="sm" onClick={clear}>
                <X /> Clear filters
              </Button>
            ) : null}
          </div>

          <div className="rounded-xl border bg-card shadow-xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead className="hidden md:table-cell">Party</TableHead>
                  <TableHead>RSVP</TableHead>
                  <TableHead>Diet</TableHead>
                  <TableHead>Table</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No guests match these filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((g) => {
                    const t = tableOf[g.id];
                    return (
                      <TableRow key={g.id}>
                        <TableCell className="font-medium">
                          {g.name}
                          <span className="mt-0.5 flex items-center gap-1.5 text-xs font-normal text-muted-foreground md:hidden">
                            <span
                              aria-hidden="true"
                              className="size-2 rounded-full"
                              style={{ backgroundColor: partyDot(g.party) }}
                            />
                            {g.party}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="flex items-center gap-1.5">
                            <span
                              aria-hidden="true"
                              className="size-2 rounded-full"
                              style={{ backgroundColor: partyDot(g.party) }}
                            />
                            {g.party}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={RSVP_STYLE[g.rsvp]}>
                            {RSVP_LABEL[g.rsvp]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {g.diet ? (
                            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-900">
                              {g.diet}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {t ? (
                            <span className="font-medium">{TABLES_BY_ID[t]?.name}</span>
                          ) : g.rsvp === "no" ? (
                            <span className="text-muted-foreground">Declined</span>
                          ) : (
                            <span className="text-amber-700">Not seated</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        <aside aria-labelledby="meals-heading" className="min-w-0 rounded-xl border bg-card p-4 shadow-xs lg:sticky lg:top-20">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 id="meals-heading" className="font-semibold">
                Meals for the caterer
              </h2>
              <p className="text-xs text-muted-foreground">Declined guests are not counted.</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={copyMeals}>
              <Copy /> Copy
            </Button>
          </div>

          <table className="mt-3 w-full text-sm">
            <caption className="sr-only">Meal counts by dietary need</caption>
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th scope="col" className="py-1.5 font-medium">
                  Meal
                </th>
                <th scope="col" className="py-1.5 text-right font-medium">
                  Confirmed
                </th>
                <th scope="col" className="py-1.5 text-right font-medium">
                  Awaiting
                </th>
              </tr>
            </thead>
            <tbody>
              {MEALS.map((m) => (
                <tr key={m.meal} className="border-b last:border-0">
                  <th scope="row" className="py-0 text-left font-normal">
                    <button
                      type="button"
                      onClick={() => setDiet(diet === m.filter ? "all" : m.filter)}
                      aria-pressed={diet === m.filter}
                      title={`Filter the list to ${m.meal}`}
                      className={cn(
                        "w-full rounded-md py-2 pr-2 text-left outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50",
                        diet === m.filter && "font-semibold text-primary",
                      )}
                    >
                      {m.meal}
                    </button>
                  </th>
                  <td className="py-2 text-right font-medium tabular-nums">{m.confirmed}</td>
                  <td className="py-2 text-right text-muted-foreground tabular-nums">{m.awaiting}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-semibold">
                <th scope="row" className="py-2 text-left">
                  Total
                </th>
                <td className="py-2 text-right tabular-nums">{totalConfirmed}</td>
                <td className="py-2 text-right text-muted-foreground tabular-nums">{totalAwaiting}</td>
              </tr>
            </tfoot>
          </table>
        </aside>
      </div>
    </main>
  );
}
```
