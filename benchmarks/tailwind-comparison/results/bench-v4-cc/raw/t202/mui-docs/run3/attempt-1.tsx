```tsx app/layout.tsx
import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import PlanProvider from "@/components/PlanProvider";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Seatwise: seating planner",
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

```ts app/theme.ts
"use client";

import { createTheme } from "@mui/material/styles";

// CSS variables with light and dark schemes, system font stack (no network fonts).
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#2b5f5a" },
        secondary: { main: "#a84e2c" },
        background: { default: "#f5f2ec", paper: "#ffffff" },
        text: { primary: "#1d2625", secondary: "#55605e" },
        divider: "#ddd8cd",
      },
    },
    dark: {
      palette: {
        primary: { main: "#7cc3bb" },
        secondary: { main: "#e39a74" },
        background: { default: "#111617", paper: "#1a2123" },
        text: { primary: "#e8ecea", secondary: "#a2aeab" },
        divider: "#2c3638",
      },
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    h1: { fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontSize: "1.25rem", fontWeight: 700 },
    h3: { fontSize: "1rem", fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { defaultProps: { elevation: 0 } },
  },
});

export default theme;
```

```tsx app/page.tsx
import PlanView from "@/components/PlanView";

export default function Page() {
  return <PlanView />;
}
```

```tsx app/guests/page.tsx
import type { Metadata } from "next";
import GuestsView from "@/components/GuestsView";

export const metadata: Metadata = { title: "Guest list: Seatwise" };

export default function Page() {
  return <GuestsView />;
}
```

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

export interface Table {
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
}

export const app = "Seatwise, a seating planner for wedding and event planners";

export const event = {
  name: "Ines & Mateo's wedding dinner",
  date: "2027-06-19",
  venue: "The Orangery, Hollin Hall",
  room_m: { width: 24, depth: 14 },
};

export const planner = { name: "Hannah Brook" };

export const fixtures: Fixture[] = [
  { id: "f-1", kind: "stage", label: "Band", x: 10, y: 0.5, w: 4, h: 2 },
  { id: "f-2", kind: "dancefloor", label: "Dance floor", x: 8.5, y: 3, w: 7, h: 4 },
  { id: "f-3", kind: "bar", label: "Bar", x: 21, y: 10, w: 2.5, h: 3.5 },
  { id: "f-4", kind: "door", label: "Garden doors", x: 0, y: 6, w: 0.5, h: 2.5 },
];

export const tables: Table[] = [
  { id: "t-head", name: "Top table", shape: "long", seats: 8, x: 8, y: 8.2, rotation: 0 },
  { id: "t-1", name: "Table 1", shape: "round", seats: 8, x: 3, y: 2.5 },
  { id: "t-2", name: "Table 2", shape: "round", seats: 8, x: 3, y: 7 },
  { id: "t-3", name: "Table 3", shape: "round", seats: 8, x: 3, y: 11.5 },
  { id: "t-4", name: "Table 4", shape: "round", seats: 8, x: 19, y: 2.5 },
  { id: "t-5", name: "Table 5", shape: "round", seats: 8, x: 19, y: 7 },
  { id: "t-6", name: "Table 6", shape: "round", seats: 6, x: 12, y: 12 },
];

export const guests: Guest[] = [
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

export const rules: Rule[] = [
  { kind: "together", guests: ["g-21", "g-22"], note: "Couple" },
  { kind: "together", guests: ["g-32", "g-33"], note: "Siblings, under 10" },
  { kind: "apart", guests: ["g-29", "g-30"], note: "Brothers Sean and Ryan Doyle are not speaking" },
  { kind: "apart", guests: ["g-12", "g-34"], note: "Ask the couple: old family dispute" },
  { kind: "near", guests: ["g-09"], note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band" },
];
```

```ts lib/plan.ts
import { event, fixtures, guests, tables, type Fixture, type Guest, type Rsvp, type Table } from "./data";

export const guestById: Record<string, Guest> = Object.fromEntries(guests.map((g) => [g.id, g]));
export const tableById: Record<string, Table> = Object.fromEntries(tables.map((t) => [t.id, t]));

export const STANDARD_MEAL = "Standard menu";

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Awaiting reply",
  no: "Declined",
};

export const PARTY_COLORS: Record<string, string> = {
  Couple: "#a23b72",
  "Bride's family": "#2f6fb0",
  "Groom's family": "#b5581a",
  "University friends": "#26784a",
  "Work friends": "#6455b0",
  "Groom's football club": "#0e7c86",
  "Plus-ones": "#5f6b7a",
};

export const PARTIES: string[] = Array.from(new Set(guests.map((g) => g.party)));

export function partyColor(party: string): string {
  return PARTY_COLORS[party] ?? "#5f6b7a";
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

export function formatEventDate(): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${event.date}T12:00:00Z`));
}

/** Seat diameter in metres, as drawn. */
export const SEAT_M = 0.85;

export interface Point {
  x: number;
  y: number;
}

export interface TableGeometry {
  centre: Point;
  w: number;
  h: number;
  seats: Point[];
}

/**
 * Round tables: x,y is the centre. The long (top) table: x,y is its top-left
 * corner, the seats run along the side that faces the room.
 */
export function tableGeometry(t: Table): TableGeometry {
  if (t.shape === "long") {
    const w = t.seats * 1;
    const h = 1.2;
    const seats: Point[] = [];
    for (let i = 0; i < t.seats; i++) {
      seats.push({ x: t.x + (w / t.seats) * (i + 0.5), y: t.y - 0.5 });
    }
    return { centre: { x: t.x + w / 2, y: t.y + h / 2 }, w, h, seats };
  }
  const ring = t.seats > 6 ? 1.45 : 1.35;
  const seats: Point[] = [];
  for (let i = 0; i < t.seats; i++) {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / t.seats;
    seats.push({ x: t.x + ring * Math.cos(a), y: t.y + ring * Math.sin(a) });
  }
  return { centre: { x: t.x, y: t.y }, w: 1.8, h: 1.8, seats };
}

export function fixtureCentre(f: Fixture): Point {
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function findFixture(kind: Fixture["kind"]): Fixture | undefined {
  return fixtures.find((f) => f.kind === kind);
}
```

```ts lib/rules.ts
import { guests, rules as ruleData, type Rule } from "./data";
import { distance, findFixture, firstName, fixtureCentre, guestById, tableById, tableGeometry } from "./plan";

export type RuleStatus = "ok" | "broken" | "open";

export interface RuleResult {
  id: string;
  rule: Rule;
  status: RuleStatus;
  title: string;
  names: string;
  summary: string;
  detail: string;
  tableIds: string[];
  guestIds: string[];
  warning?: string;
}

/** A table counts as "near" the garden doors within this distance (metres). */
export const NEAR_M = 4.5;
/** ...and as "away from the band" beyond this distance. */
export const AWAY_M = 6;

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function words(text: string): string {
  return ` ${text.replace(/[^A-Za-zÀ-ÿ]+/g, " ")} `;
}

/** The note may name someone the rule's guest ids do not include. */
function noteWarning(rule: Rule): string | undefined {
  const inRule = new Set(rule.guests);
  const text = words(rule.note);
  const strangers = guests.filter((g) => !inRule.has(g.id) && text.includes(` ${firstName(g.name)} `));
  if (strangers.length === 0) return undefined;
  const names = strangers.map((g) => g.name).join(" and ");
  return `The note names ${names}, who ${strangers.length > 1 ? "are" : "is"} not in this rule. Check the guest list.`;
}

export function evaluateRules(guestTable: Record<string, string | null>): RuleResult[] {
  return ruleData.map((rule, index): RuleResult => {
    const names = rule.guests.map((id) => guestById[id]?.name ?? id);
    const nameText = names.join(" and ");
    const tabs = rule.guests.map((id) => guestTable[id] ?? null);
    const tn = (id: string | null) => (id ? (tableById[id]?.name ?? id) : "no table");
    const base = { id: `rule-${index}`, rule, names: nameText, guestIds: rule.guests, warning: noteWarning(rule) };
    const unseated = names.filter((_, i) => tabs[i] === null);

    if (rule.kind === "together") {
      const title = "Keep together";
      if (unseated.length > 0) {
        const seatedTables = unique(tabs.filter((t): t is string => t !== null));
        return {
          ...base, title, status: "open", tableIds: seatedTables,
          summary: `${title}: ${nameText}, not both seated yet`,
          detail: `${unseated.join(" and ")} ${unseated.length > 1 ? "are" : "is"} not seated yet.`,
        };
      }
      const same = tabs.every((t) => t === tabs[0]);
      const tableIds = unique(tabs.filter((t): t is string => t !== null));
      return same
        ? { ...base, title, status: "ok", tableIds, summary: `${title}: ${nameText} at ${tn(tabs[0] ?? null)}`, detail: `Both at ${tn(tabs[0] ?? null)}.` }
        : {
            ...base, title, status: "broken", tableIds,
            summary: `${title}: ${nameText} are at different tables`,
            detail: names.map((n, i) => `${n} is at ${tn(tabs[i] ?? null)}`).join(", ") + ".",
          };
    }

    if (rule.kind === "apart") {
      const title = "Keep apart";
      const seated = tabs.filter((t): t is string => t !== null);
      const clash = seated.find((t, i) => seated.indexOf(t) !== i);
      if (clash) {
        return {
          ...base, title, status: "broken", tableIds: [clash],
          summary: `${title}: ${nameText} are both at ${tn(clash)}`,
          detail: `Both are at ${tn(clash)}.`,
        };
      }
      return {
        ...base, title, status: "ok", tableIds: unique(seated),
        summary: `${title}: ${nameText}`,
        detail: seated.length < 2 ? "Not at the same table (someone is not seated yet)." : "At different tables.",
      };
    }

    const title = "Seat near the garden doors";
    const tid = tabs[0] ?? null;
    if (!tid) {
      return {
        ...base, title, status: "open", tableIds: [],
        summary: `${title}: ${nameText} is not seated yet`,
        detail: `${nameText} is not seated yet.`,
      };
    }
    const door = findFixture("door");
    const stage = findFixture("stage");
    const centre = tableGeometry(tableById[tid]).centre;
    const dDoor = door ? distance(centre, fixtureCentre(door)) : 0;
    const dStage = stage ? distance(centre, fixtureCentre(stage)) : Infinity;
    const near = dDoor <= NEAR_M;
    const away = dStage >= AWAY_M;
    if (near && away) {
      return {
        ...base, title, status: "ok", tableIds: [tid],
        summary: `${title}: ${nameText} at ${tn(tid)}`,
        detail: `${tn(tid)} is ${dDoor.toFixed(1)} m from the garden doors and ${dStage.toFixed(1)} m from the band.`,
      };
    }
    return {
      ...base, title, status: "broken", tableIds: [tid],
      summary: `${title}: ${nameText} is at ${tn(tid)}, ${dDoor.toFixed(1)} m from the doors`,
      detail: near
        ? `${tn(tid)} is only ${dStage.toFixed(1)} m from the band (wanted ${AWAY_M} m or more).`
        : `${tn(tid)} is ${dDoor.toFixed(1)} m from the garden doors (wanted ${NEAR_M} m or less).`,
    };
  });
}
```

```tsx components/PlanProvider.tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { guests, tables } from "@/lib/data";
import { guestById, tableById } from "@/lib/plan";
import { evaluateRules, type RuleResult } from "@/lib/rules";

type Seats = Record<string, (string | null)[]>;
export type PanelTab = "toSeat" | "rules" | "table";

export interface Notice {
  id: number;
  message: string;
  undo: boolean;
}

export interface PlanApi {
  seats: Seats;
  guestTable: Record<string, string | null>;
  occupied: Record<string, number>;
  seatedConfirmed: number;
  confirmed: number;
  seatedUnconfirmed: number;
  totalSeats: number;
  seatedTotal: number;
  toSeat: string[];
  awaitingToSeat: string[];
  rules: RuleResult[];
  brokenByTable: Record<string, RuleResult[]>;
  brokenGuests: Set<string>;
  picked: string | null;
  selectedTable: string | null;
  dragId: string | null;
  panelTab: PanelTab;
  canUndo: boolean;
  notice: Notice | null;
  place: (guestId: string, tableId: string, seatIdx?: number) => void;
  unseat: (guestId: string) => void;
  pick: (guestId: string | null) => void;
  selectTable: (tableId: string | null) => void;
  setDragId: (id: string | null) => void;
  setPanelTab: (tab: PanelTab) => void;
  undo: () => void;
  clearNotice: () => void;
}

const PlanContext = createContext<PlanApi | null>(null);

export function usePlan(): PlanApi {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

function buildInitialSeats(): Seats {
  const s: Seats = {};
  for (const t of tables) s[t.id] = Array.from({ length: t.seats }, () => null as string | null);
  for (const g of guests) {
    if (!g.table) continue;
    const row = s[g.table];
    const i = row.indexOf(null);
    if (i >= 0) row[i] = g.id;
  }
  return s;
}

function cloneSeats(s: Seats): Seats {
  const n: Seats = {};
  for (const k of Object.keys(s)) n[k] = s[k].slice();
  return n;
}

function locate(s: Seats, id: string): { table: string; idx: number } | null {
  for (const tid of Object.keys(s)) {
    const i = s[tid].indexOf(id);
    if (i >= 0) return { table: tid, idx: i };
  }
  return null;
}

export default function PlanProvider({ children }: { children: ReactNode }) {
  const [seats, setSeats] = useState<Seats>(buildInitialSeats);
  const [history, setHistory] = useState<Seats[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [panelTab, setPanelTab] = useState<PanelTab>("toSeat");
  const [notice, setNotice] = useState<Notice | null>(null);

  const say = useCallback((message: string, undo: boolean) => {
    setNotice((n) => ({ id: (n?.id ?? 0) + 1, message, undo }));
  }, []);

  const commit = useCallback(
    (next: Seats, message: string) => {
      setHistory((h) => [...h.slice(-29), seats]);
      setSeats(next);
      say(message, true);
    },
    [seats, say],
  );

  const place = useCallback(
    (guestId: string, tableId: string, seatIdx?: number) => {
      const g = guestById[guestId];
      const t = tableById[tableId];
      const row = seats[tableId];
      if (!g || !t || !row) return;
      if (g.rsvp === "no") {
        say(`${g.name} has declined, so cannot be seated`, false);
        return;
      }
      const cur = locate(seats, guestId);
      let i: number;
      if (seatIdx === undefined) {
        if (cur && cur.table === tableId) {
          setPicked(null);
          setSelectedTable(tableId);
          return;
        }
        i = row.indexOf(null);
        if (i < 0) {
          say(`${t.name} is full. Move someone out first, or pick a seat to swap.`, false);
          return;
        }
      } else {
        i = seatIdx;
      }
      if (cur && cur.table === tableId && cur.idx === i) {
        setPicked(null);
        return;
      }
      const occId = row[i] ?? null;
      const occ = occId ? guestById[occId] : null;
      const next = cloneSeats(seats);
      let message: string;
      if (cur) {
        next[cur.table][cur.idx] = occId;
        message = occ
          ? `${g.name} and ${occ.name} swapped seats`
          : `${g.name} moved to ${t.name}, seat ${i + 1}`;
      } else {
        message = occ
          ? `${g.name} seated at ${t.name}; ${occ.name} is now unseated`
          : `${g.name} seated at ${t.name}, seat ${i + 1}`;
      }
      next[tableId][i] = guestId;
      commit(next, message);
      setPicked(null);
      setSelectedTable(tableId);
    },
    [seats, commit, say],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const cur = locate(seats, guestId);
      if (!cur) return;
      const next = cloneSeats(seats);
      next[cur.table][cur.idx] = null;
      commit(next, `${guestById[guestId]?.name ?? "Guest"} unseated from ${tableById[cur.table]?.name ?? "table"}`);
      setPicked((p) => (p === guestId ? null : p));
    },
    [seats, commit],
  );

  const undo = useCallback(() => {
    setHistory((h) => {
      const prev = h[h.length - 1];
      if (!prev) return h;
      setSeats(prev);
      say("Last change undone", false);
      return h.slice(0, -1);
    });
  }, [say]);

  const selectTable = useCallback((tableId: string | null) => {
    setSelectedTable(tableId);
    if (tableId) setPanelTab("table");
  }, []);

  const pick = useCallback((id: string | null) => setPicked(id), []);
  const clearNotice = useCallback(() => setNotice(null), []);

  const value = useMemo<PlanApi>(() => {
    const guestTable: Record<string, string | null> = {};
    for (const g of guests) guestTable[g.id] = null;
    const occupied: Record<string, number> = {};
    for (const t of tables) {
      occupied[t.id] = 0;
      for (const id of seats[t.id]) {
        if (id) {
          guestTable[id] = t.id;
          occupied[t.id] += 1;
        }
      }
    }
    const rules = evaluateRules(guestTable);
    const brokenByTable: Record<string, RuleResult[]> = {};
    const brokenGuests = new Set<string>();
    for (const r of rules) {
      if (r.status !== "broken") continue;
      for (const tid of r.tableIds) (brokenByTable[tid] ??= []).push(r);
      for (const gid of r.guestIds) brokenGuests.add(gid);
    }
    const confirmedGuests = guests.filter((g) => g.rsvp === "yes");
    const seatedConfirmed = confirmedGuests.filter((g) => guestTable[g.id]).length;
    const seatedTotal = guests.filter((g) => guestTable[g.id]).length;
    return {
      seats,
      guestTable,
      occupied,
      seatedConfirmed,
      confirmed: confirmedGuests.length,
      seatedTotal,
      seatedUnconfirmed: seatedTotal - seatedConfirmed,
      totalSeats: tables.reduce((n, t) => n + t.seats, 0),
      toSeat: confirmedGuests.filter((g) => !guestTable[g.id]).map((g) => g.id),
      awaitingToSeat: guests
        .filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !guestTable[g.id])
        .map((g) => g.id),
      rules,
      brokenByTable,
      brokenGuests,
      picked,
      selectedTable,
      dragId,
      panelTab,
      canUndo: history.length > 0,
      notice,
      place,
      unseat,
      pick,
      selectTable,
      setDragId,
      setPanelTab,
      undo,
      clearNotice,
    };
  }, [seats, picked, selectedTable, dragId, panelTab, history, notice, place, unseat, pick, selectTable, undo, clearNotice]);

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
```

```tsx components/AppShell.tsx
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import LightModeIcon from "@mui/icons-material/LightMode";
import { event, planner } from "@/lib/data";
import { formatEventDate, initials } from "@/lib/plan";
import { usePlan } from "./PlanProvider";

const NAV = [
  { href: "/", label: "Seating plan" },
  { href: "/guests", label: "Guest list" },
];

function ModeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  if (!mode) return <Box sx={{ width: 40, height: 40 }} />;
  const resolved = mode === "system" ? systemMode : mode;
  const dark = resolved === "dark";
  return (
    <IconButton
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setMode(dark ? "light" : "dark")}
    >
      {dark ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { notice, clearNotice, undo, canUndo } = usePlan();

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <Box
        component="a"
        href="#main"
        sx={{
          position: "absolute",
          left: -9999,
          "&:focus": { left: 8, top: 8, zIndex: 2000, bgcolor: "background.paper", p: 1.5, borderRadius: 1 },
        }}
      >
        Skip to content
      </Box>
      <Box
        component="header"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          "@media print": { display: "none" },
        }}
      >
        <Container maxWidth={false} sx={{ maxWidth: 1600 }}>
          <Stack direction="row" spacing={{ xs: 1.5, md: 3 }} sx={{ py: 1.25, flexWrap: "wrap", rowGap: 1, alignItems: "center" }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText", width: 34, height: 34 }} variant="rounded">
                <EventSeatIcon fontSize="small" />
              </Avatar>
              <Typography component="span" sx={{ fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-0.02em" }}>
                Seatwise
              </Typography>
            </Stack>
            <Box sx={{ display: { xs: "none", md: "block" }, minWidth: 0, flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                {event.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap component="div">
                {formatEventDate()} · {event.venue}
              </Typography>
            </Box>
            <Box sx={{ flex: { xs: 1, md: "none" } }} />
            <Box component="nav" aria-label="Main">
              <Stack direction="row" spacing={0.5}>
                {NAV.map((n) => {
                  const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
                  return (
                    <Button
                      key={n.href}
                      component={Link}
                      href={n.href}
                      aria-current={active ? "page" : undefined}
                      variant={active ? "contained" : "text"}
                      color={active ? "primary" : "inherit"}
                      sx={{ minHeight: 40 }}
                    >
                      {n.label}
                    </Button>
                  );
                })}
              </Stack>
            </Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <ModeToggle />
              <Avatar sx={{ width: 34, height: 34, fontSize: 14, bgcolor: "secondary.main", color: "secondary.contrastText" }} aria-label={planner.name}>
                {initials(planner.name)}
              </Avatar>
            </Stack>
          </Stack>
          <Box sx={{ display: { xs: "block", md: "none" }, pb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {event.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatEventDate()} · {event.venue}
            </Typography>
          </Box>
        </Container>
      </Box>
      <Box component="main" id="main" tabIndex={-1} sx={{ flex: 1, outline: "none" }}>
        {children}
      </Box>
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={6000}
        onClose={(_, reason) => {
          if (reason !== "clickaway") clearNotice();
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="info"
          variant="filled"
          sx={{ alignItems: "center" }}
          action={
            <Stack direction="row" spacing={0.5}>
              {notice?.undo && canUndo ? (
                <Button color="inherit" size="small" onClick={undo}>
                  Undo
                </Button>
              ) : null}
              <Button color="inherit" size="small" onClick={clearNotice}>
                Dismiss
              </Button>
            </Stack>
          }
        >
          {notice?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
```

```tsx components/SeatMenuButton.tsx
"use client";

import { useState, type ReactNode } from "react";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { tables } from "@/lib/data";
import { guestById } from "@/lib/plan";
import { usePlan } from "./PlanProvider";

export default function SeatMenuButton({ guestId }: { guestId: string }) {
  const plan = usePlan();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const guest = guestById[guestId];
  if (!guest || guest.rsvp === "no") return null;
  const current = plan.guestTable[guestId] ?? null;
  const close = () => setAnchor(null);

  const items: ReactNode[] = tables.map((t) => {
    const free = t.seats - (plan.occupied[t.id] ?? 0);
    return (
      <MenuItem
        key={t.id}
        selected={t.id === current}
        disabled={free === 0 && t.id !== current}
        onClick={() => {
          plan.place(guestId, t.id);
          close();
        }}
      >
        {t.name}
        <span style={{ marginLeft: 16, opacity: 0.7, fontSize: "0.85em" }}>
          {t.id === current ? "current" : free === 0 ? "full" : `${free} free`}
        </span>
      </MenuItem>
    );
  });
  if (current) {
    items.push(<Divider key="divider" />);
    items.push(
      <MenuItem
        key="unseat"
        onClick={() => {
          plan.unseat(guestId);
          close();
        }}
      >
        Unseat
      </MenuItem>,
    );
  }

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        color="inherit"
        aria-label={`${current ? "Move" : "Seat"} ${guest.name}`}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        endIcon={<ArrowDropDownIcon />}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ minHeight: 36, whiteSpace: "nowrap", flexShrink: 0 }}
      >
        {current ? "Move" : "Seat"}
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close}>
        {items}
      </Menu>
    </>
  );
}
```

```tsx components/PlanView.tsx
"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import UndoIcon from "@mui/icons-material/Undo";
import { tables } from "@/lib/data";
import { guestById } from "@/lib/plan";
import { usePlan } from "./PlanProvider";
import RoomPlan from "./RoomPlan";
import SidePanel from "./SidePanel";

function Stat({
  label,
  value,
  sub,
  progress,
  tone,
}: {
  label: string;
  value: string | number;
  sub: string;
  progress?: number;
  tone?: "error" | "success";
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderColor: tone === "error" ? "error.main" : "divider" }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1.15, color: tone === "error" ? "error.main" : "text.primary" }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {sub}
      </Typography>
      {progress !== undefined ? (
        <LinearProgress variant="determinate" value={progress} aria-label={label} sx={{ mt: 1, height: 6, borderRadius: 3 }} />
      ) : null}
    </Paper>
  );
}

export default function PlanView() {
  const plan = usePlan();
  const broken = plan.rules.filter((r) => r.status === "broken");
  const open = plan.rules.filter((r) => r.status === "open");
  const free = plan.totalSeats - plan.seatedTotal;
  const picked = plan.picked ? guestById[plan.picked] : null;

  return (
    <Container maxWidth={false} sx={{ maxWidth: 1600, py: { xs: 2, md: 3 } }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", rowGap: 1, alignItems: "flex-end", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h1" component="h1">
              Seating plan
            </Typography>
            <Typography color="text.secondary">
              Drag a guest onto a seat, or tap a guest and then tap a seat or table.
            </Typography>
          </Box>
          <Button startIcon={<UndoIcon />} variant="outlined" color="inherit" onClick={plan.undo} disabled={!plan.canUndo}>
            Undo
          </Button>
        </Stack>

        <Box
          component="section"
          aria-label="Seating counts"
          sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" } }}
        >
          <Stat
            label="Seated"
            value={plan.seatedConfirmed}
            sub={`of ${plan.confirmed} attending${plan.seatedUnconfirmed ? ` (+${plan.seatedUnconfirmed} unconfirmed)` : ""}`}
            progress={(plan.seatedConfirmed / plan.confirmed) * 100}
          />
          <Stat label="Unseated" value={plan.toSeat.length} sub={plan.toSeat.length === 1 ? "attending guest needs a seat" : "attending guests need a seat"} />
          <Stat label="Free seats" value={free} sub={`of ${plan.totalSeats} across ${tables.length} tables`} />
          <Stat
            label="Rules"
            value={broken.length}
            tone={broken.length ? "error" : "success"}
            sub={`broken, ${open.length} waiting on a seat`}
          />
        </Box>

        <Box component="section" aria-label="Seats per table">
          <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 0.5 }}>
            {tables.map((t) => {
              const n = plan.occupied[t.id] ?? 0;
              const bad = (plan.brokenByTable[t.id]?.length ?? 0) > 0;
              return (
                <Chip
                  key={t.id}
                  clickable
                  onClick={() => plan.selectTable(t.id)}
                  label={`${t.name} ${n}/${t.seats}`}
                  color={bad ? "error" : n === t.seats ? "primary" : "default"}
                  variant={plan.selectedTable === t.id || n === t.seats || bad ? "filled" : "outlined"}
                  aria-label={`${t.name}: ${n} of ${t.seats} seats taken${bad ? ", rule broken" : ""}`}
                  sx={{ flexShrink: 0, height: 36, fontWeight: 600 }}
                />
              );
            })}
          </Stack>
        </Box>

        {broken.length > 0 ? (
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={() => plan.setPanelTab("rules")}>
                Review
              </Button>
            }
          >
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {broken.length === 1 ? "1 rule is broken" : `${broken.length} rules are broken`}
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {broken.map((r) => (
                <li key={r.id}>
                  <Typography variant="body2">{r.summary}</Typography>
                </li>
              ))}
            </Box>
          </Alert>
        ) : (
          <Alert severity="success">All of the couple&apos;s rules are met{open.length ? `, ${open.length} still waiting on a seat.` : "."}</Alert>
        )}

        {picked ? (
          <Alert
            severity="info"
            variant="outlined"
            action={
              <Stack direction="row" spacing={0.5}>
                {plan.guestTable[picked.id] ? (
                  <Button size="small" color="inherit" onClick={() => plan.unseat(picked.id)}>
                    Unseat
                  </Button>
                ) : null}
                <Button size="small" color="inherit" onClick={() => plan.pick(null)}>
                  Cancel
                </Button>
              </Stack>
            }
          >
            Placing <strong>{picked.name}</strong>. Tap an empty seat, a seat to swap with, or a table.
          </Alert>
        ) : null}

        <Box
          sx={{
            display: "grid",
            gap: 2,
            alignItems: "start",
            gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 390px" },
          }}
        >
          <RoomPlan />
          <SidePanel />
        </Box>
      </Stack>
    </Container>
  );
}
```

```tsx components/RoomPlan.tsx
"use client";

import { useState, type DragEvent, type KeyboardEvent } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { event, fixtures, tables, type Fixture, type Table } from "@/lib/data";
import { PARTIES, SEAT_M, guestById, initials, partyColor, tableGeometry } from "@/lib/plan";
import { usePlan } from "./PlanProvider";

const W = event.room_m.width;
const D = event.room_m.depth;
const px = (v: number) => `${(v / W) * 100}%`;
const py = (v: number) => `${(v / D) * 100}%`;

function activate(e: KeyboardEvent, fn: () => void) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fn();
  }
}

function FixtureView({ f }: { f: Fixture }) {
  const base = {
    position: "absolute" as const,
    left: px(f.x),
    top: py(f.y),
    width: px(f.w),
    height: py(f.h),
    display: "grid",
    placeItems: "center",
    textAlign: "center" as const,
    fontSize: "max(9px, 1.05cqw)",
    fontWeight: 600,
    lineHeight: 1.1,
    pointerEvents: "none" as const,
  };
  if (f.kind === "stage") {
    return (
      <Box sx={{ ...base, bgcolor: "secondary.main", color: "secondary.contrastText", borderRadius: 1 }}>{f.label}</Box>
    );
  }
  if (f.kind === "dancefloor") {
    return (
      <Box
        sx={{
          ...base,
          backgroundColor: "color-mix(in srgb, var(--mui-palette-primary-main) 14%, transparent)",
          border: "1.5px dashed",
          borderColor: "primary.main",
          color: "primary.main",
          borderRadius: 1,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        {f.label}
      </Box>
    );
  }
  if (f.kind === "bar") {
    return (
      <Box sx={{ ...base, bgcolor: "action.selected", border: 1, borderColor: "divider", borderRadius: 1, color: "text.primary" }}>
        {f.label}
      </Box>
    );
  }
  return (
    <Box
      sx={{
        ...base,
        borderLeft: "4px solid",
        borderColor: "secondary.main",
        bgcolor: "color-mix(in srgb, var(--mui-palette-secondary-main) 18%, transparent)",
        color: "text.primary",
        writingMode: "vertical-rl",
        fontSize: "max(8px, 0.9cqw)",
      }}
    >
      {f.label}
    </Box>
  );
}

function Seat({ table, idx, x, y }: { table: Table; idx: number; x: number; y: number }) {
  const plan = usePlan();
  const [over, setOver] = useState(false);
  const gid = plan.seats[table.id]?.[idx] ?? null;
  const guest = gid ? guestById[gid] : null;
  const isPicked = gid !== null && plan.picked === gid;
  const flagged = gid !== null && plan.brokenGuests.has(gid);

  const tap = () => {
    if (plan.picked) {
      if (plan.picked === gid) {
        plan.pick(null);
        return;
      }
      plan.place(plan.picked, table.id, idx);
      return;
    }
    plan.selectTable(table.id);
    if (gid) plan.pick(gid);
  };

  const label = guest
    ? `${table.name}, seat ${idx + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}${flagged ? ", breaks a rule" : ""}. ${plan.picked ? "Place or swap here" : "Pick up"}`
    : `${table.name}, seat ${idx + 1}: empty${plan.picked ? ". Place the picked guest here" : ""}`;

  const shadows: string[] = [];
  if (isPicked) shadows.push("0 0 0 3px var(--mui-palette-primary-main)");
  if (flagged) shadows.push("0 0 0 2px var(--mui-palette-error-main)");
  if (over) shadows.push("0 0 0 4px var(--mui-palette-primary-main)");

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={label}
      title={guest ? `${guest.name}${guest.diet ? ` (${guest.diet})` : ""}` : `${table.name}, seat ${idx + 1} (empty)`}
      draggable={Boolean(guest)}
      onClick={tap}
      onKeyDown={(e: KeyboardEvent) => activate(e, tap)}
      onDragStart={(e: DragEvent) => {
        if (!gid) return;
        e.dataTransfer.setData("text/plain", gid);
        e.dataTransfer.effectAllowed = "move";
        plan.setDragId(gid);
      }}
      onDragEnd={() => plan.setDragId(null)}
      onDragOver={(e: DragEvent) => {
        if (!plan.dragId) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (!over) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e: DragEvent) => {
        e.preventDefault();
        setOver(false);
        if (plan.dragId) plan.place(plan.dragId, table.id, idx);
        plan.setDragId(null);
      }}
      sx={{
        position: "absolute",
        left: px(x),
        top: py(y),
        width: px(SEAT_M),
        height: py(SEAT_M),
        transform: "translate(-50%, -50%)",
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        fontSize: "max(8px, 1cqw)",
        fontWeight: 700,
        lineHeight: 1,
        userSelect: "none",
        cursor: guest ? "grab" : "pointer",
        color: "#fff",
        bgcolor: guest ? partyColor(guest.party) : over ? "action.hover" : "background.paper",
        border: guest ? "2px solid" : "1.5px dashed",
        borderColor: guest ? "background.paper" : over ? "primary.main" : "text.disabled",
        boxShadow: shadows.join(", ") || "none",
        zIndex: isPicked || over ? 3 : 2,
        "&:hover": { borderColor: "primary.main" },
        "&:focus-visible": { outline: "3px solid", outlineColor: "primary.main", outlineOffset: 2 },
      }}
    >
      {guest ? initials(guest.name) : null}
      {guest?.diet ? (
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            right: "-8%",
            bottom: "-8%",
            width: "38%",
            height: "38%",
            borderRadius: "50%",
            bgcolor: "#f2a900",
            border: "1.5px solid",
            borderColor: "background.paper",
          }}
        />
      ) : null}
    </Box>
  );
}

function TableView({ table }: { table: Table }) {
  const plan = usePlan();
  const [over, setOver] = useState(false);
  const geo = tableGeometry(table);
  const count = plan.occupied[table.id] ?? 0;
  const problems = plan.brokenByTable[table.id] ?? [];
  const selected = plan.selectedTable === table.id;
  const tap = () => {
    if (plan.picked) {
      plan.place(plan.picked, table.id);
      return;
    }
    plan.selectTable(table.id);
  };

  return (
    <>
      <Box
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        aria-label={`${table.name}, ${count} of ${table.seats} seats taken${problems.length ? `, ${problems.length} broken ${problems.length === 1 ? "rule" : "rules"}` : ""}. ${plan.picked ? "Seat the picked guest here" : "Show guests"}`}
        onClick={tap}
        onKeyDown={(e: KeyboardEvent) => activate(e, tap)}
        onDragOver={(e: DragEvent) => {
          if (!plan.dragId) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          if (!over) setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e: DragEvent) => {
          e.preventDefault();
          setOver(false);
          if (plan.dragId) plan.place(plan.dragId, table.id);
          plan.setDragId(null);
        }}
        sx={{
          position: "absolute",
          left: px(geo.centre.x),
          top: py(geo.centre.y),
          width: px(geo.w),
          height: py(geo.h),
          transform: "translate(-50%, -50%)",
          borderRadius: table.shape === "round" ? "50%" : "8px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          cursor: "pointer",
          zIndex: 1,
          bgcolor: over ? "action.hover" : "background.paper",
          border: problems.length ? "3px solid" : "2px solid",
          borderColor: problems.length ? "error.main" : selected || over ? "primary.main" : "text.secondary",
          boxShadow: selected ? "0 0 0 4px color-mix(in srgb, var(--mui-palette-primary-main) 35%, transparent)" : "none",
          fontSize: "max(9px, 1.05cqw)",
          lineHeight: 1.2,
          "&:focus-visible": { outline: "3px solid", outlineColor: "primary.main", outlineOffset: 3 },
        }}
      >
        <Box component="span" sx={{ fontWeight: 800 }}>
          {table.name}
        </Box>
        <Box component="span" sx={{ color: "text.secondary", fontWeight: 600 }}>
          {count}/{table.seats} seats
        </Box>
        {problems.length ? (
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              top: "-12%",
              right: table.shape === "round" ? "-8%" : "-1%",
              width: "max(16px, 1.7cqw)",
              height: "max(16px, 1.7cqw)",
              borderRadius: "50%",
              bgcolor: "error.main",
              color: "error.contrastText",
              display: "grid",
              placeItems: "center",
            }}
          >
            <WarningAmberIcon sx={{ fontSize: "max(12px, 1.2cqw)" }} />
          </Box>
        ) : null}
      </Box>
      {geo.seats.map((p, i) => (
        <Seat key={i} table={table} idx={i} x={p.x} y={p.y} />
      ))}
    </>
  );
}

const legendItem = { alignItems: "center" } as const;

export default function RoomPlan() {
  return (
    <Box component="section" aria-labelledby="room-heading">
      <Stack direction="row" sx={{ mb: 1, flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline" }}>
        <Typography id="room-heading" variant="h2" component="h2">
          {event.venue}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Room {W} × {D} m, drawn to scale. Grid squares are 1 m.
        </Typography>
      </Stack>
      <Box
        role="region"
        aria-label={`Room plan, ${W} by ${D} metres. Scrolls sideways on narrow screens.`}
        tabIndex={0}
        sx={{ overflowX: "auto", border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "background.paper" }}
      >
        <Box
          sx={{
            position: "relative",
            minWidth: 780,
            aspectRatio: `${W} / ${D}`,
            containerType: "inline-size",
            color: "text.primary",
            backgroundImage:
              "linear-gradient(color-mix(in srgb, currentColor 7%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, currentColor 7%, transparent) 1px, transparent 1px)",
            backgroundSize: `${100 / W}% ${100 / D}%`,
          }}
        >
          {fixtures.map((f) => (
            <FixtureView key={f.id} f={f} />
          ))}
          {tables.map((t) => (
            <TableView key={t.id} table={t} />
          ))}
        </Box>
      </Box>
      <Stack
        direction="row"
        spacing={2}
        component="ul"
        aria-label="Legend"
        sx={{ mt: 1.5, flexWrap: "wrap", rowGap: 1, listStyle: "none", p: 0, mb: 0 }}
      >
        {PARTIES.map((p) => (
          <Stack component="li" key={p} direction="row" spacing={0.75} sx={legendItem}>
            <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: partyColor(p) }} />
            <Typography variant="caption">{p}</Typography>
          </Stack>
        ))}
        <Stack component="li" direction="row" spacing={0.75} sx={legendItem}>
          <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#f2a900" }} />
          <Typography variant="caption">Dietary need</Typography>
        </Stack>
        <Stack component="li" direction="row" spacing={0.75} sx={legendItem}>
          <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: "50%", border: "1.5px dashed", borderColor: "text.disabled" }} />
          <Typography variant="caption">Empty seat</Typography>
        </Stack>
        <Stack component="li" direction="row" spacing={0.75} sx={legendItem}>
          <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: "50%", boxShadow: "0 0 0 2px var(--mui-palette-error-main)" }} />
          <Typography variant="caption">Breaks a rule</Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
```

```tsx components/SidePanel.tsx
"use client";

import type { DragEvent, KeyboardEvent } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import { tables, type Guest } from "@/lib/data";
import { RSVP_LABEL, guestById, initials, partyColor, tableById } from "@/lib/plan";
import { usePlan, type PanelTab } from "./PlanProvider";
import SeatMenuButton from "./SeatMenuButton";

function PartyAvatar({ guest }: { guest: Guest }) {
  return (
    <Box
      aria-hidden
      sx={{
        width: 34,
        height: 34,
        flexShrink: 0,
        borderRadius: "50%",
        bgcolor: partyColor(guest.party),
        color: "#fff",
        display: "grid",
        placeItems: "center",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {initials(guest.name)}
    </Box>
  );
}

function DietChip({ diet }: { diet: string }) {
  return <Chip size="small" icon={<RestaurantIcon />} label={diet} color="warning" variant="outlined" />;
}

function ToSeatRow({ guest }: { guest: Guest }) {
  const plan = usePlan();
  const isPicked = plan.picked === guest.id;
  const toggle = () => plan.pick(isPicked ? null : guest.id);
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: "center",
        border: 1,
        borderColor: isPicked ? "primary.main" : "divider",
        bgcolor: isPicked ? "action.selected" : "background.paper",
        borderRadius: 2,
        pr: 1,
      }}
    >
      <Box
        role="button"
        tabIndex={0}
        draggable
        aria-pressed={isPicked}
        aria-label={`${isPicked ? "Put down" : "Pick up"} ${guest.name}, then tap a seat or table`}
        onClick={toggle}
        onKeyDown={(e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        onDragStart={(e: DragEvent) => {
          e.dataTransfer.setData("text/plain", guest.id);
          e.dataTransfer.effectAllowed = "move";
          plan.setDragId(guest.id);
        }}
        onDragEnd={() => plan.setDragId(null)}
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          p: 1,
          minHeight: 48,
          cursor: "grab",
          borderRadius: 2,
          "&:focus-visible": { outline: "3px solid", outlineColor: "primary.main" },
        }}
      >
        <PartyAvatar guest={guest} />
        <Box sx={{ minWidth: 0 }}>
          <Typography noWrap sx={{ fontWeight: 600 }}>
            {guest.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap component="div">
            {guest.party}
            {guest.diet ? ` · ${guest.diet}` : ""}
            {guest.rsvp !== "yes" ? ` · ${RSVP_LABEL[guest.rsvp]}` : ""}
          </Typography>
        </Box>
      </Box>
      <SeatMenuButton guestId={guest.id} />
    </Stack>
  );
}

function ToSeatPanel() {
  const plan = usePlan();
  const dropUnseat = (e: DragEvent) => {
    e.preventDefault();
    if (plan.dragId && plan.guestTable[plan.dragId]) plan.unseat(plan.dragId);
    plan.setDragId(null);
  };
  const canDrop = Boolean(plan.dragId && plan.guestTable[plan.dragId]);
  return (
    <Stack
      spacing={1}
      onDragOver={(e: DragEvent) => {
        if (canDrop) e.preventDefault();
      }}
      onDrop={dropUnseat}
      sx={{
        borderRadius: 2,
        outline: canDrop ? "2px dashed" : "none",
        outlineColor: "primary.main",
        outlineOffset: 4,
      }}
    >
      <Typography variant="h3" component="h3">
        Attending, no seat yet ({plan.toSeat.length})
      </Typography>
      {canDrop ? (
        <Typography variant="body2" color="primary">
          Drop here to unseat this guest.
        </Typography>
      ) : null}
      {plan.toSeat.length === 0 ? (
        <Alert severity="success">Everyone attending has a seat.</Alert>
      ) : (
        <Stack spacing={1} component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
          {plan.toSeat.map((id) => (
            <li key={id}>
              <ToSeatRow guest={guestById[id]} />
            </li>
          ))}
        </Stack>
      )}
      {plan.awaitingToSeat.length > 0 ? (
        <>
          <Typography variant="h3" component="h3" sx={{ pt: 1 }}>
            Not confirmed yet ({plan.awaitingToSeat.length})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Maybe or awaiting a reply. You can seat them provisionally.
          </Typography>
          <Stack spacing={1} component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
            {plan.awaitingToSeat.map((id) => (
              <li key={id}>
                <ToSeatRow guest={guestById[id]} />
              </li>
            ))}
          </Stack>
        </>
      ) : null}
    </Stack>
  );
}

function RulesPanel() {
  const plan = usePlan();
  return (
    <Stack spacing={1.25}>
      <Typography variant="h3" component="h3">
        The couple&apos;s rules
      </Typography>
      <Stack spacing={1} component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
        {plan.rules.map((r) => {
          const color = r.status === "broken" ? "error" : r.status === "ok" ? "success" : "warning";
          const Icon = r.status === "broken" ? ErrorOutlineIcon : r.status === "ok" ? CheckCircleIcon : HourglassEmptyIcon;
          const status = r.status === "broken" ? "Broken" : r.status === "ok" ? "Met" : "Waiting for a seat";
          return (
            <Paper component="li" key={r.id} variant="outlined" sx={{ p: 1.5, borderColor: `${color}.main` }}>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
                <Icon color={color} aria-hidden />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", alignItems: "center" }}>
                    <Typography sx={{ fontWeight: 700 }}>{r.title}</Typography>
                    <Chip size="small" color={color} label={status} />
                  </Stack>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {r.names}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {r.detail}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }} component="div">
                    {r.rule.note}
                  </Typography>
                  {r.warning ? (
                    <Typography variant="caption" color="warning.main" component="div" sx={{ fontWeight: 600, mt: 0.5 }}>
                      {r.warning}
                    </Typography>
                  ) : null}
                  {r.tableIds.length > 0 ? (
                    <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", rowGap: 1 }}>
                      {r.tableIds.map((tid) => (
                        <Button key={tid} size="small" variant="outlined" color="inherit" onClick={() => plan.selectTable(tid)}>
                          Show {tableById[tid].name}
                        </Button>
                      ))}
                    </Stack>
                  ) : null}
                </Box>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </Stack>
  );
}

function TablePanel() {
  const plan = usePlan();
  const table = plan.selectedTable ? tableById[plan.selectedTable] : null;
  if (!table) {
    return (
      <Stack spacing={1.5}>
        <Typography variant="h3" component="h3">
          Table details
        </Typography>
        <Typography color="text.secondary">
          Select a table in the room to see who sits there and what they eat.
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
          {tables.map((t) => (
            <Chip key={t.id} clickable label={t.name} onClick={() => plan.selectTable(t.id)} />
          ))}
        </Stack>
      </Stack>
    );
  }
  const row = plan.seats[table.id] ?? [];
  const count = plan.occupied[table.id] ?? 0;
  const problems = plan.brokenByTable[table.id] ?? [];
  const diets = new Map<string, number>();
  for (const id of row) {
    const d = id ? guestById[id]?.diet : null;
    if (d) diets.set(d, (diets.get(d) ?? 0) + 1);
  }
  const picked = plan.picked ? guestById[plan.picked] : null;

  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography variant="h3" component="h3">
          {table.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {count} of {table.seats} seats taken, {table.seats - count} free
        </Typography>
      </Box>
      {problems.map((r) => (
        <Alert key={r.id} severity="error" sx={{ py: 0.5 }}>
          <strong>{r.title}.</strong> {r.detail}
        </Alert>
      ))}
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Dietary needs at this table
        </Typography>
        {diets.size === 0 ? (
          <Typography variant="body2">None noted.</Typography>
        ) : (
          <Stack direction="row" spacing={0.75} sx={{ mt: 0.5, flexWrap: "wrap", rowGap: 0.75 }}>
            {Array.from(diets.entries()).map(([d, n]) => (
              <DietChip key={d} diet={`${d} × ${n}`} />
            ))}
          </Stack>
        )}
      </Box>
      {picked && plan.guestTable[picked.id] !== table.id ? (
        <Button variant="contained" onClick={() => plan.place(picked.id, table.id)} disabled={count >= table.seats}>
          Seat {picked.name} here
        </Button>
      ) : null}
      <Stack spacing={0.75} component="ol" sx={{ listStyle: "none", p: 0, m: 0 }}>
        {row.map((id, i) => {
          const g = id ? guestById[id] : null;
          return (
            <Stack
              component="li"
              key={i}
              direction="row"
              spacing={1}
              sx={{
                alignItems: "center",
                border: 1,
                borderStyle: g ? "solid" : "dashed",
                borderColor: g && plan.brokenGuests.has(g.id) ? "error.main" : "divider",
                borderRadius: 2,
                p: 1,
                minHeight: 52,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ width: 40, flexShrink: 0 }}>
                Seat {i + 1}
              </Typography>
              {g ? (
                <>
                  <PartyAvatar guest={g} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography noWrap sx={{ fontWeight: 600 }}>
                      {g.name}
                    </Typography>
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {g.party}
                      </Typography>
                      {g.diet ? <DietChip diet={g.diet} /> : null}
                    </Stack>
                  </Box>
                  <SeatMenuButton guestId={g.id} />
                  <IconButton aria-label={`Unseat ${g.name}`} size="small" onClick={() => plan.unseat(g.id)}>
                    <PersonRemoveIcon fontSize="small" />
                  </IconButton>
                </>
              ) : (
                <Typography color="text.secondary" sx={{ flex: 1 }}>
                  Empty
                </Typography>
              )}
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
}

export default function SidePanel() {
  const plan = usePlan();
  const broken = plan.rules.filter((r) => r.status === "broken").length;
  return (
    <Paper
      variant="outlined"
      component="section"
      aria-label="Guests, rules and table details"
      sx={{
        position: { lg: "sticky" },
        top: { lg: 16 },
        maxHeight: { lg: "calc(100dvh - 32px)" },
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Tabs
        value={plan.panelTab}
        onChange={(_, v: PanelTab) => plan.setPanelTab(v)}
        variant="fullWidth"
        aria-label="Side panel"
        sx={{ borderBottom: 1, borderColor: "divider", flexShrink: 0 }}
      >
        <Tab value="toSeat" label={`To seat (${plan.toSeat.length})`} id="tab-toSeat" aria-controls="panel-toSeat" />
        <Tab value="rules" label={`Rules${broken ? ` (${broken})` : ""}`} id="tab-rules" aria-controls="panel-rules" />
        <Tab value="table" label="Table" id="tab-table" aria-controls="panel-table" />
      </Tabs>
      <Box
        role="tabpanel"
        id={`panel-${plan.panelTab}`}
        aria-labelledby={`tab-${plan.panelTab}`}
        sx={{ p: 2, overflowY: "auto", flex: 1 }}
      >
        {plan.panelTab === "toSeat" ? <ToSeatPanel /> : plan.panelTab === "rules" ? <RulesPanel /> : <TablePanel />}
      </Box>
    </Paper>
  );
}
```

```tsx components/GuestsView.tsx
"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import PrintIcon from "@mui/icons-material/Print";
import SearchIcon from "@mui/icons-material/Search";
import { guests, tables, type Rsvp } from "@/lib/data";
import { PARTIES, RSVP_LABEL, STANDARD_MEAL, partyColor, tableById } from "@/lib/plan";
import { usePlan } from "./PlanProvider";
import SeatMenuButton from "./SeatMenuButton";

const DIETS = Array.from(new Set(guests.map((g) => g.diet).filter((d): d is string => d !== null))).sort();
const RSVP_COLOR: Record<Rsvp, "success" | "warning" | "default" | "error"> = {
  yes: "success",
  maybe: "warning",
  pending: "default",
  no: "error",
};
const noPrint = { "@media print": { display: "none" } } as const;

interface MealRow {
  meal: string;
  confirmed: number;
  awaiting: number;
  where: Record<string, number>;
}

export default function GuestsView() {
  const plan = usePlan();
  const [query, setQuery] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState("all");
  const [diet, setDiet] = useState("all");

  const meals = useMemo<MealRow[]>(() => {
    const map = new Map<string, MealRow>();
    for (const g of guests) {
      if (g.rsvp === "no") continue;
      const meal = g.diet ?? STANDARD_MEAL;
      let row = map.get(meal);
      if (!row) {
        row = { meal, confirmed: 0, awaiting: 0, where: {} };
        map.set(meal, row);
      }
      if (g.rsvp === "yes") row.confirmed += 1;
      else row.awaiting += 1;
      const key = plan.guestTable[g.id] ?? "none";
      row.where[key] = (row.where[key] ?? 0) + 1;
    }
    return Array.from(map.values()).sort((a, b) => {
      if (a.meal === STANDARD_MEAL) return -1;
      if (b.meal === STANDARD_MEAL) return 1;
      return b.confirmed - a.confirmed || a.meal.localeCompare(b.meal);
    });
  }, [plan.guestTable]);

  const totalConfirmed = meals.reduce((n, m) => n + m.confirmed, 0);
  const totalAwaiting = meals.reduce((n, m) => n + m.awaiting, 0);
  const declined = guests.filter((g) => g.rsvp === "no").length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests.filter((g) => {
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === "none" && g.diet !== null) return false;
      if (diet !== "all" && diet !== "none" && g.diet !== diet) return false;
      if (q) {
        const tid = plan.guestTable[g.id];
        const hay = `${g.name} ${g.party} ${g.diet ?? ""} ${tid ? tableById[tid].name : "not seated"}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, party, rsvp, diet, plan.guestTable]);

  const filtersOn = query !== "" || party !== "all" || rsvp !== "all" || diet !== "all";
  const clear = () => {
    setQuery("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
  };

  return (
    <Container maxWidth={false} sx={{ maxWidth: 1600, py: { xs: 2, md: 3 } }}>
      <Stack spacing={3}>
        <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", rowGap: 1, alignItems: "flex-end", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h1" component="h1">
              Guest list
            </Typography>
            <Typography color="text.secondary">
              {guests.length} invited · {plan.confirmed} attending · {totalAwaiting} awaiting a reply · {declined} declined
            </Typography>
          </Box>
          <Button variant="outlined" color="inherit" startIcon={<PrintIcon />} onClick={() => window.print()} sx={noPrint}>
            Print for the caterer
          </Button>
        </Stack>

        <Paper variant="outlined" component="section" aria-labelledby="meals-heading" sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Typography id="meals-heading" variant="h2" component="h2">
            Meals for the caterer
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Confirmed guests per meal. Guests who have not replied are counted separately, declined guests are left out. Table
            counts follow the seating plan.
          </Typography>
          <TableContainer>
            <Table size="small" aria-labelledby="meals-heading">
              <TableHead>
                <TableRow>
                  <TableCell>Meal</TableCell>
                  <TableCell align="right">Confirmed</TableCell>
                  <TableCell align="right">Awaiting reply</TableCell>
                  <TableCell>Where they sit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {meals.map((m) => (
                  <TableRow key={m.meal}>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                      {m.meal}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {m.confirmed}
                    </TableCell>
                    <TableCell align="right">{m.awaiting}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", rowGap: 0.5 }}>
                        {tables
                          .filter((t) => m.where[t.id])
                          .map((t) => (
                            <Chip key={t.id} size="small" variant="outlined" label={`${t.name} × ${m.where[t.id]}`} />
                          ))}
                        {m.where.none ? <Chip size="small" color="warning" variant="outlined" label={`Not seated × ${m.where.none}`} /> : null}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 800 }}>
                    Total
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>
                    {totalConfirmed}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>
                    {totalAwaiting}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Box component="section" aria-labelledby="guests-heading">
          <Typography id="guests-heading" variant="h2" component="h2" sx={{ mb: 1.5 }}>
            All guests
          </Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 1.5, ...noPrint }} role="search" aria-label="Filter guests">
            <TextField
              label="Search guests"
              placeholder="Name, party, diet or table"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              size="small"
              sx={{ flex: 1.4, minWidth: 220 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField select label="Party" value={party} onChange={(e) => setParty(e.target.value)} size="small" sx={{ flex: 1, minWidth: 170 }}>
              <MenuItem value="all">All parties</MenuItem>
              {PARTIES.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="RSVP" value={rsvp} onChange={(e) => setRsvp(e.target.value)} size="small" sx={{ flex: 1, minWidth: 150 }}>
              <MenuItem value="all">Any RSVP</MenuItem>
              {(Object.keys(RSVP_LABEL) as Rsvp[]).map((r) => (
                <MenuItem key={r} value={r}>
                  {RSVP_LABEL[r]}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Diet" value={diet} onChange={(e) => setDiet(e.target.value)} size="small" sx={{ flex: 1, minWidth: 170 }}>
              <MenuItem value="all">Any diet</MenuItem>
              <MenuItem value="none">No dietary needs</MenuItem>
              {DIETS.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </TextField>
            <Button onClick={clear} disabled={!filtersOn} color="inherit" sx={{ minHeight: 40 }}>
              Clear
            </Button>
          </Stack>
          <Typography variant="body2" color="text.secondary" role="status" sx={{ mb: 1 }}>
            Showing {filtered.length} of {guests.length} guests
          </Typography>
          <Paper variant="outlined">
            <TableContainer>
              <Table size="medium" aria-labelledby="guests-heading" sx={{ minWidth: 640 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Guest</TableCell>
                    <TableCell>Party</TableCell>
                    <TableCell>RSVP</TableCell>
                    <TableCell>Diet</TableCell>
                    <TableCell>Table</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 5, color: "text.secondary" }}>
                        No guests match these filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((g) => {
                      const tid = plan.guestTable[g.id];
                      return (
                        <TableRow key={g.id} hover>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                            {g.name}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                              <Box aria-hidden sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: partyColor(g.party), flexShrink: 0 }} />
                              <span>{g.party}</span>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip size="small" color={RSVP_COLOR[g.rsvp]} variant={g.rsvp === "pending" ? "outlined" : "filled"} label={RSVP_LABEL[g.rsvp]} />
                          </TableCell>
                          <TableCell>{g.diet ?? <Typography component="span" color="text.disabled">None</Typography>}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                              {tid ? (
                                <Chip size="small" label={tableById[tid].name} />
                              ) : (
                                <Typography component="span" color="text.secondary">
                                  {g.rsvp === "no" ? "Not coming" : "Not seated"}
                                </Typography>
                              )}
                              <Box sx={noPrint}>
                                <SeatMenuButton guestId={g.id} />
                              </Box>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Stack>
    </Container>
  );
}
```
