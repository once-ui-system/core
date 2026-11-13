```ts lib/data.ts
export type Rsvp = "yes" | "maybe" | "no" | "pending";
export type FixtureKind = "stage" | "dancefloor" | "bar" | "door";
export type TableShape = "round" | "long";
export type RuleKind = "together" | "apart" | "near";

export interface Fixture {
  id: string;
  kind: FixtureKind;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PlanTable {
  id: string;
  name: string;
  shape: TableShape;
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
  kind: RuleKind;
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

export const tables: PlanTable[] = [
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
  // The note names Sean and Ryan Doyle (g-30 and g-31); the source listed g-29 (Kai Brennan),
  // which does not match the note, so the rule follows the people the note describes.
  { kind: "apart", guests: ["g-30", "g-31"], note: "Brothers Sean and Ryan Doyle are not speaking" },
  { kind: "apart", guests: ["g-12", "g-34"], note: "Ask the couple: old family dispute" },
  {
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
  },
];
```

```ts lib/plan.ts
import { event, fixtures, guests, rules, tables, type Guest, type PlanTable, type Rule } from "./data";

export const ROOM = event.room_m;
export const SEAT_D = 0.85;

export const guestById: Record<string, Guest> = Object.fromEntries(guests.map((g) => [g.id, g]));
export const tableById: Record<string, PlanTable> = Object.fromEntries(tables.map((t) => [t.id, t]));
export const fixtureById = Object.fromEntries(fixtures.map((f) => [f.id, f]));

/** Seat rows: for each table, one slot per seat holding a guest id or null. */
export type Seating = Record<string, (string | null)[]>;

export function initialSeating(): Seating {
  const s: Seating = {};
  for (const t of tables) s[t.id] = Array.from({ length: t.seats }, () => null);
  for (const g of guests) {
    if (!g.table) continue;
    const row = s[g.table];
    const i = row.indexOf(null);
    if (i >= 0) row[i] = g.id;
  }
  return s;
}

export function tableMap(seating: Seating): Map<string, string> {
  const m = new Map<string, string>();
  for (const [tid, row] of Object.entries(seating)) {
    for (const id of row) if (id) m.set(id, tid);
  }
  return m;
}

/* ---------- geometry (metres) ---------- */

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TableGeometry {
  shape: PlanTable["shape"];
  body: Box;
  zone: Box;
  seats: { x: number; y: number }[];
  center: { x: number; y: number };
}

export function tableGeometry(t: PlanTable): TableGeometry {
  if (t.shape === "long") {
    const w = t.seats;
    const h = 1.2;
    return {
      shape: "long",
      body: { x: t.x, y: t.y, w, h },
      zone: { x: t.x - 0.3, y: t.y - 1.1, w: w + 0.6, h: h + 1.3 },
      seats: Array.from({ length: t.seats }, (_, i) => ({ x: t.x + 0.5 + i, y: t.y - 0.5 })),
      center: { x: t.x + w / 2, y: t.y + h / 2 },
    };
  }
  const ring = t.seats > 6 ? 1.45 : 1.3;
  const r = 0.95;
  const zr = ring + 0.5;
  return {
    shape: "round",
    body: { x: t.x - r, y: t.y - r, w: 2 * r, h: 2 * r },
    zone: { x: t.x - zr, y: t.y - zr, w: 2 * zr, h: 2 * zr },
    seats: Array.from({ length: t.seats }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
      return { x: t.x + Math.cos(a) * ring, y: t.y + Math.sin(a) * ring };
    }),
    center: { x: t.x, y: t.y },
  };
}

/* ---------- rules ---------- */

export type RuleStatus = "ok" | "broken" | "open";

export interface RuleResult {
  index: number;
  kind: Rule["kind"];
  status: RuleStatus;
  title: string;
  detail: string;
  note: string;
  tableIds: string[];
  guestIds: string[];
}

interface NearSpec {
  toward: string;
  towardLabel: string;
  within: number;
  awayFrom?: string;
  awayLabel?: string;
  atLeast?: number;
}

/** What "near" means for the guests that have a near rule. Distances are in metres, table centre to fixture centre. */
const NEAR: Record<string, NearSpec> = {
  "g-09": { toward: "f-4", towardLabel: "garden doors", within: 4.5, awayFrom: "f-1", awayLabel: "band", atLeast: 8 },
};

function dist(ax: number, ay: number, b: { x: number; y: number; w: number; h: number }) {
  return Math.hypot(ax - (b.x + b.w / 2), ay - (b.y + b.h / 2));
}

const names = (ids: string[]) => ids.map((id) => guestById[id]?.name ?? id).join(" and ");

export function evaluateRules(tableOf: Map<string, string>): RuleResult[] {
  return rules.map((rule, index): RuleResult => {
    const base = { index, kind: rule.kind, note: rule.note, guestIds: rule.guests };
    const places = rule.guests.map((id) => tableOf.get(id) ?? null);
    const tn = (id: string | null) => (id ? tableById[id].name : "no table");

    if (rule.kind === "together") {
      const title = `Keep together: ${names(rule.guests)}`;
      const seated = places.filter((p): p is string => p !== null);
      if (seated.length < rule.guests.length) {
        const missing = rule.guests.filter((_, i) => places[i] === null).map((id) => guestById[id].name);
        return { ...base, title, status: "open", tableIds: Array.from(new Set(seated)), detail: `Waiting for a seat: ${missing.join(" and ")}.` };
      }
      if (new Set(seated).size === 1) {
        return { ...base, title, status: "ok", tableIds: [seated[0]], detail: `Together at ${tn(seated[0])}.` };
      }
      return {
        ...base,
        title,
        status: "broken",
        tableIds: Array.from(new Set(seated)),
        detail: rule.guests.map((id, i) => `${guestById[id].name} is at ${tn(places[i])}`).join("; ") + ".",
      };
    }

    if (rule.kind === "apart") {
      const title = `Keep apart: ${names(rule.guests)}`;
      const seated = places.filter((p): p is string => p !== null);
      if (seated.length === rule.guests.length && new Set(seated).size < seated.length) {
        return { ...base, title, status: "broken", tableIds: [seated[0]], detail: `Both are at ${tn(seated[0])}.` };
      }
      if (seated.length < rule.guests.length) {
        return { ...base, title, status: "ok", tableIds: Array.from(new Set(seated)), detail: "Not at the same table so far." };
      }
      return { ...base, title, status: "ok", tableIds: Array.from(new Set(seated)), detail: `At ${seated.map(tn).join(" and ")}.` };
    }

    // near
    const gid = rule.guests[0];
    const spec = NEAR[gid];
    const title = `Seat near the ${spec ? spec.towardLabel : "spot noted"}: ${names(rule.guests)}`;
    const tid = places[0];
    if (!tid || !spec) {
      return { ...base, title, status: "open", tableIds: [], detail: `${guestById[gid].name} still needs a seat.` };
    }
    const geo = tableGeometry(tableById[tid]);
    const near = dist(geo.center.x, geo.center.y, fixtureById[spec.toward]);
    const far = spec.awayFrom ? dist(geo.center.x, geo.center.y, fixtureById[spec.awayFrom]) : Infinity;
    const problems: string[] = [];
    if (near > spec.within) problems.push(`${near.toFixed(1)} m from the ${spec.towardLabel} (needs ${spec.within} m or less)`);
    if (spec.atLeast && far < spec.atLeast) problems.push(`only ${far.toFixed(1)} m from the ${spec.awayLabel} (needs ${spec.atLeast} m or more)`);
    if (problems.length) {
      return { ...base, title, status: "broken", tableIds: [tid], detail: `${tn(tid)} is ${problems.join(" and ")}.` };
    }
    return {
      ...base,
      title,
      status: "ok",
      tableIds: [tid],
      detail: `${tn(tid)} is ${near.toFixed(1)} m from the ${spec.towardLabel}${spec.awayLabel ? ` and ${far.toFixed(1)} m from the ${spec.awayLabel}` : ""}.`,
    };
  });
}
```

```ts lib/ui.ts
import type { CSSProperties } from "react";
import type { Rsvp } from "./data";

const HUES: Record<string, number> = {
  Couple: 340,
  "Bride's family": 20,
  "Groom's family": 215,
  "University friends": 150,
  "Work friends": 265,
  "Groom's football club": 45,
  "Plus-ones": 190,
};

export function partyHue(party: string): number {
  return HUES[party] ?? 0;
}

export function partyStyle(party: string): CSSProperties {
  const h = partyHue(party);
  return {
    backgroundColor: `hsl(${h} 62% 91%)`,
    borderColor: `hsl(${h} 42% 50%)`,
    color: `hsl(${h} 58% 20%)`,
  };
}

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const RSVP: Record<Rsvp, { label: string; cls: string }> = {
  yes: { label: "Attending", cls: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
  maybe: { label: "Maybe", cls: "bg-amber-50 text-amber-800 ring-amber-200" },
  pending: { label: "Awaiting reply", cls: "bg-stone-100 text-stone-700 ring-stone-300" },
  no: { label: "Declined", cls: "bg-rose-50 text-rose-800 ring-rose-200" },
};

export const PARTY_ORDER = [
  "Couple",
  "Bride's family",
  "Groom's family",
  "University friends",
  "Work friends",
  "Groom's football club",
  "Plus-ones",
];
```

```tsx lib/plan-context.tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { guests, type Guest } from "./data";
import { evaluateRules, guestById, initialSeating, tableById, tableMap, type RuleResult, type Seating } from "./plan";

export interface Notice {
  id: number;
  text: string;
  tone: "ok" | "warn";
}

interface PlanStats {
  seated: number;
  confirmed: number;
  confirmedSeated: number;
  toSeat: Guest[];
  unconfirmed: Guest[];
  brokenCount: number;
  openCount: number;
  okCount: number;
}

interface PlanContextValue {
  seating: Seating;
  tableOf: Map<string, string>;
  results: RuleResult[];
  stats: PlanStats;
  notice: Notice | null;
  assign: (guestId: string, tableId: string, index?: number) => boolean;
  unseat: (guestId: string) => void;
  reset: () => void;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [seating, setSeating] = useState<Seating>(initialSeating);
  const [notice, setNotice] = useState<Notice | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const say = useCallback((text: string, tone: Notice["tone"] = "ok") => {
    setNotice({ id: Date.now(), text, tone });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(null), 4500);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const tableOf = useMemo(() => tableMap(seating), [seating]);
  const results = useMemo(() => evaluateRules(tableOf), [tableOf]);

  const stats = useMemo<PlanStats>(() => {
    const confirmedGuests = guests.filter((g) => g.rsvp === "yes");
    return {
      seated: tableOf.size,
      confirmed: confirmedGuests.length,
      confirmedSeated: confirmedGuests.filter((g) => tableOf.has(g.id)).length,
      toSeat: confirmedGuests.filter((g) => !tableOf.has(g.id)),
      unconfirmed: guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !tableOf.has(g.id)),
      brokenCount: results.filter((r) => r.status === "broken").length,
      openCount: results.filter((r) => r.status === "open").length,
      okCount: results.filter((r) => r.status === "ok").length,
    };
  }, [tableOf, results]);

  const assign = useCallback(
    (guestId: string, tableId: string, index?: number): boolean => {
      const g = guestById[guestId];
      const t = tableById[tableId];
      if (!g || !t) return false;
      if (g.rsvp === "no") {
        say(`${g.name} has declined, so they cannot be seated.`, "warn");
        return false;
      }
      const next: Seating = Object.fromEntries(Object.entries(seating).map(([k, v]) => [k, [...v]]));
      const fromTable = tableOf.get(guestId) ?? null;
      const fromIndex = fromTable ? next[fromTable].indexOf(guestId) : -1;
      const row = next[tableId];
      let target = index ?? -1;

      if (target < 0 || target >= row.length) {
        if (fromTable === tableId) {
          say(`${g.name} is already at ${t.name}.`);
          return true;
        }
        target = row.indexOf(null);
        if (target < 0) {
          say(`${t.name} is full. Unseat someone or choose another table.`, "warn");
          return false;
        }
      }

      const occupantId = row[target];
      if (occupantId === guestId) return true;

      if (occupantId) {
        const occupant = guestById[occupantId];
        if (fromTable) {
          next[fromTable][fromIndex] = occupantId;
          row[target] = guestId;
          say(`${g.name} and ${occupant.name} swapped seats.`);
        } else {
          const free = row.indexOf(null);
          if (free < 0) {
            say(`${t.name} is full. Drag a seated guest onto a seat to swap, or unseat someone first.`, "warn");
            return false;
          }
          row[free] = guestId;
          say(`${g.name} seated at ${t.name}.`);
        }
      } else {
        if (fromTable) next[fromTable][fromIndex] = null;
        row[target] = guestId;
        say(
          fromTable && fromTable !== tableId
            ? `${g.name} moved from ${tableById[fromTable].name} to ${t.name}.`
            : `${g.name} seated at ${t.name}.`,
        );
      }
      setSeating(next);
      return true;
    },
    [seating, tableOf, say],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const from = tableOf.get(guestId);
      if (!from) return;
      setSeating((prev) => ({ ...prev, [from]: prev[from].map((id) => (id === guestId ? null : id)) }));
      say(`${guestById[guestId].name} unseated from ${tableById[from].name}.`);
    },
    [tableOf, say],
  );

  const reset = useCallback(() => {
    setSeating(initialSeating());
    say("Plan reset to the starting arrangement.");
  }, [say]);

  const value = useMemo<PlanContextValue>(
    () => ({ seating, tableOf, results, stats, notice, assign, unseat, reset }),
    [seating, tableOf, results, stats, notice, assign, unseat, reset],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
```

```tsx components/AppShell.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Armchair, LayoutGrid, Users } from "lucide-react";
import { event, planner } from "@/lib/data";

const NAV = [
  { href: "/", label: "Seating plan", icon: LayoutGrid },
  { href: "/guests", label: "Guest list", icon: Users },
];

const dateLabel = new Date(`${event.date}T12:00:00Z`).toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line bg-card/90 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 rounded-lg">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-800 text-brand-50 shadow-sm">
              <Armchair className="h-5 w-5" aria-hidden />
            </span>
            <span className="font-display text-xl font-semibold tracking-tight">Seatwise</span>
          </Link>

          <div className="order-3 w-full min-w-0 sm:order-none sm:w-auto sm:flex-1">
            <p className="truncate text-sm font-medium">{event.name}</p>
            <p className="truncate text-xs text-muted">
              {dateLabel} · {event.venue}
            </p>
          </div>

          <nav aria-label="Main" className="flex items-center gap-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${
                    active ? "bg-brand-800 text-white" : "text-ink/75 hover:bg-brand-50"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto hidden items-center gap-2 sm:ml-0 md:flex">
            <span
              aria-hidden
              className="grid h-9 w-9 place-items-center rounded-full bg-accent-100 text-sm font-semibold text-accent-800"
            >
              HB
            </span>
            <span className="text-sm">
              <span className="block font-medium leading-tight">{planner.name}</span>
              <span className="block text-xs leading-tight text-muted">Wedding planner</span>
            </span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6">{children}</main>
    </div>
  );
}
```

```tsx components/plan/types.ts
import type { PointerEvent as ReactPointerEvent } from "react";

export type DropTarget =
  | { kind: "seat"; tableId: string; index: number }
  | { kind: "table"; tableId: string }
  | { kind: "tray" };

export interface DragState {
  guestId: string;
  x: number;
  y: number;
}

export type BeginDrag = (e: ReactPointerEvent, guestId: string) => void;
```

```tsx components/plan/Room.tsx
"use client";

import { TriangleAlert } from "lucide-react";
import { fixtures, guests, tables } from "@/lib/data";
import { guestById, ROOM, SEAT_D, tableGeometry, type Box, type Seating } from "@/lib/plan";
import { initials, partyHue, partyStyle, PARTY_ORDER } from "@/lib/ui";
import type { BeginDrag, DropTarget } from "./types";

const W = ROOM.width;
const H = ROOM.depth;
const left = (x: number) => `${(x / W) * 100}%`;
const top = (y: number) => `${(y / H) * 100}%`;
const wd = (w: number) => `${(w / W) * 100}%`;
const ht = (h: number) => `${(h / H) * 100}%`;
const cq = (m: number) => `${(m / W) * 100}cqw`;
const box = (b: Box) => ({ left: left(b.x), top: top(b.y), width: wd(b.w), height: ht(b.h) });

interface RoomProps {
  seating: Seating;
  selected: string | null;
  armed: string | null;
  hover: DropTarget | null;
  flaggedTables: Set<string>;
  flaggedGuests: Set<string>;
  beginDrag: BeginDrag;
  onSeat: (tableId: string, index: number) => void;
  onTable: (tableId: string) => void;
  onBackground: () => void;
}

const FIXTURE_CLASS: Record<string, string> = {
  stage: "rounded-md bg-stone-800 text-stone-100 shadow",
  dancefloor: "rounded border border-amber-300/80 text-amber-900/70",
  bar: "rounded-md bg-amber-900 text-amber-50 shadow",
  door: "rounded-sm bg-emerald-700 text-emerald-50",
};

export function Room({
  seating,
  selected,
  armed,
  hover,
  flaggedTables,
  flaggedGuests,
  beginDrag,
  onSeat,
  onTable,
  onBackground,
}: RoomProps) {
  const usedParties = PARTY_ORDER.filter((p) => guests.some((g) => g.party === p));

  return (
    <section aria-label="Room plan" className="rounded-2xl border border-line bg-card p-2 shadow-sm sm:p-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1 pb-2 text-xs text-muted">
        <span>
          Drawn to scale, {W} m by {H} m. Drag a guest onto a seat, or tap a guest and then a seat or table.
        </span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Dietary need
          </span>
          <span className="flex items-center gap-1">
            <span aria-hidden className="h-2.5 w-2.5 rounded-full border-2 border-rose-600" /> Rule broken
          </span>
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl">
        <div className="min-w-[760px]">
          <div
            className="@container relative w-full overflow-hidden rounded-xl border-2 border-stone-400/70 bg-[#f4eddf]"
            style={{
              aspectRatio: `${W} / ${H}`,
              backgroundImage:
                "linear-gradient(rgba(90,70,30,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(90,70,30,.07) 1px, transparent 1px)",
              backgroundSize: `${100 / W}% ${100 / H}%`,
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) onBackground();
            }}
          >
            {/* fixtures */}
            {fixtures.map((f) => {
              const vertical = f.kind === "door";
              return (
                <div
                  key={f.id}
                  role="img"
                  aria-label={f.label}
                  className={`pointer-events-none absolute flex items-center justify-center overflow-hidden text-center font-semibold uppercase tracking-wider ${FIXTURE_CLASS[f.kind]}`}
                  style={{
                    ...box(f),
                    fontSize: cq(0.4),
                    writingMode: vertical ? "vertical-rl" : undefined,
                    backgroundImage:
                      f.kind === "dancefloor"
                        ? "repeating-conic-gradient(#f1e4c8 0 25%, #e9d8b4 0 50%)"
                        : undefined,
                    backgroundSize: f.kind === "dancefloor" ? `${200 / f.w}% ${200 / f.h}%` : undefined,
                  }}
                >
                  {f.label}
                </div>
              );
            })}

            {/* scale bar */}
            <div
              aria-hidden
              className="pointer-events-none absolute"
              style={{ left: left(15.5), top: top(13.15), width: wd(5) }}
            >
              <div className="h-1.5 border-x-2 border-b-2 border-stone-500/70" />
              <div className="text-center text-stone-500" style={{ fontSize: cq(0.36) }}>
                5 m
              </div>
            </div>

            {/* tables */}
            {tables.map((t) => {
              const geo = tableGeometry(t);
              const row = seating[t.id];
              const filled = row.filter(Boolean).length;
              const isSel = selected === t.id;
              const flagged = flaggedTables.has(t.id);
              const dropHere = hover !== null && hover.kind !== "tray" && hover.tableId === t.id;
              const round = geo.shape === "round";
              const disc = {
                left: `${((geo.body.x - geo.zone.x) / geo.zone.w) * 100}%`,
                top: `${((geo.body.y - geo.zone.y) / geo.zone.h) * 100}%`,
                width: `${(geo.body.w / geo.zone.w) * 100}%`,
                height: `${(geo.body.h / geo.zone.h) * 100}%`,
              };
              return (
                <div key={t.id}>
                  <button
                    type="button"
                    data-table
                    data-table-id={t.id}
                    aria-pressed={isSel}
                    aria-label={`${t.name}, ${filled} of ${t.seats} seats filled${flagged ? ", breaks a rule" : ""}`}
                    onClick={() => onTable(t.id)}
                    className={`absolute transition-colors ${round ? "rounded-full" : "rounded-2xl"} ${
                      dropHere ? "bg-amber-300/30" : armed ? "bg-brand-500/10" : isSel ? "bg-brand-500/[0.07]" : ""
                    }`}
                    style={box(geo.zone)}
                  >
                    <span
                      className={`absolute flex flex-col items-center justify-center border-2 bg-white shadow-md ${
                        round ? "rounded-full" : "rounded-lg"
                      } ${flagged ? "border-rose-500" : "border-brand-700/60"} ${
                        isSel ? "ring-4 ring-brand-500/50" : ""
                      } ${dropHere ? "ring-4 ring-amber-400" : ""}`}
                      style={disc}
                    >
                      <span className="font-display font-semibold leading-tight" style={{ fontSize: cq(0.42) }}>
                        {t.name}
                      </span>
                      <span
                        className={`tabular-nums leading-tight ${filled === t.seats ? "font-semibold text-brand-700" : "text-muted"}`}
                        style={{ fontSize: cq(0.34) }}
                      >
                        {filled}/{t.seats}
                      </span>
                    </span>
                  </button>

                  {flagged && (
                    <span
                      role="img"
                      aria-label={`${t.name} breaks a rule`}
                      className="pointer-events-none absolute grid place-items-center rounded-full bg-rose-600 text-white shadow"
                      style={{
                        left: left(geo.zone.x + geo.zone.w - 1.15),
                        top: top(geo.zone.y + 0.1),
                        width: cq(0.8),
                        height: cq(0.8),
                      }}
                    >
                      <TriangleAlert className="h-[60%] w-[60%]" aria-hidden />
                    </span>
                  )}

                  {geo.seats.map((p, i) => {
                    const gid = row[i];
                    const g = gid ? guestById[gid] : null;
                    const isArmed = gid !== null && gid === armed;
                    const bad = gid !== null && flaggedGuests.has(gid);
                    const hov = hover !== null && hover.kind === "seat" && hover.tableId === t.id && hover.index === i;
                    const label = g
                      ? `${t.name}, seat ${i + 1}: ${g.name}, ${g.party}, ${g.diet ?? "no dietary needs"}${bad ? ", breaks a rule" : ""}`
                      : `${t.name}, seat ${i + 1}: empty`;
                    return (
                      <button
                        key={i}
                        type="button"
                        data-seat
                        data-table-id={t.id}
                        data-seat-index={i}
                        aria-label={label}
                        aria-pressed={g ? isArmed : undefined}
                        onPointerDown={g ? (e) => beginDrag(e, g.id) : undefined}
                        onClick={() => onSeat(t.id, i)}
                        className={`absolute grid select-none place-items-center rounded-full border-2 transition-shadow ${
                          g ? "cursor-grab shadow-sm" : "border-dashed border-stone-400 bg-white/70 text-stone-400"
                        } ${bad ? "ring-[3px] ring-rose-600" : ""} ${isArmed ? "ring-4 ring-brand-600" : ""} ${
                          hov ? "ring-4 ring-amber-400" : ""
                        } ${!g && armed ? "border-brand-600 bg-brand-50" : ""}`}
                        style={{
                          left: left(p.x - SEAT_D / 2),
                          top: top(p.y - SEAT_D / 2),
                          width: wd(SEAT_D),
                          height: ht(SEAT_D),
                          touchAction: "none",
                          ...(g ? partyStyle(g.party) : {}),
                        }}
                      >
                        <span className="font-semibold leading-none" style={{ fontSize: cq(g ? 0.3 : 0.26) }}>
                          {g ? initials(g.name) : i + 1}
                        </span>
                        {g?.diet && (
                          <span
                            aria-hidden
                            className="absolute -bottom-0.5 -right-0.5 rounded-full bg-amber-500 ring-2 ring-white"
                            style={{ width: "34%", height: "34%" }}
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
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 px-1 pt-3 text-xs text-muted" aria-label="Party colours">
        {usedParties.map((p) => (
          <li key={p} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="h-3 w-3 rounded-full border"
              style={{ backgroundColor: `hsl(${partyHue(p)} 62% 91%)`, borderColor: `hsl(${partyHue(p)} 42% 50%)` }}
            />
            {p}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

```tsx components/plan/Panels.tsx
"use client";

import { CircleCheck, Clock, GripVertical, Link2, MapPin, TriangleAlert, Unlink, UserMinus } from "lucide-react";
import { tables, type Guest } from "@/lib/data";
import { guestById, tableById, type RuleResult, type Seating } from "@/lib/plan";
import { initials, partyStyle, RSVP } from "@/lib/ui";
import type { BeginDrag } from "./types";

const card = "rounded-2xl border border-line bg-card p-4 shadow-sm";

/* ---------- guests waiting for a seat ---------- */

function Chip({
  g,
  armed,
  onPick,
  beginDrag,
}: {
  g: Guest;
  armed: boolean;
  onPick: (id: string) => void;
  beginDrag: BeginDrag;
}) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={armed}
        onPointerDown={(e) => beginDrag(e, g.id)}
        onClick={() => onPick(g.id)}
        style={{ touchAction: "pan-y" }}
        className={`flex min-h-12 w-full select-none items-center gap-2.5 rounded-xl border bg-white px-2.5 py-1.5 text-left transition-colors hover:border-brand-500 ${
          armed ? "border-brand-600 ring-2 ring-brand-600" : "border-line"
        }`}
      >
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-xs font-semibold"
          style={partyStyle(g.party)}
          aria-hidden
        >
          {initials(g.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{g.name}</span>
          <span className="block truncate text-xs text-muted">
            {g.party}
            {g.diet ? ` · ${g.diet}` : ""}
            {g.rsvp !== "yes" ? ` · ${RSVP[g.rsvp].label}` : ""}
          </span>
        </span>
        <GripVertical className="h-4 w-4 shrink-0 text-stone-400" aria-hidden />
      </button>
    </li>
  );
}

export function Tray({
  toSeat,
  unconfirmed,
  armed,
  dropActive,
  beginDrag,
  onPick,
}: {
  toSeat: Guest[];
  unconfirmed: Guest[];
  armed: string | null;
  dropActive: boolean;
  beginDrag: BeginDrag;
  onPick: (id: string) => void;
}) {
  return (
    <section
      data-tray
      aria-labelledby="tray-h"
      className={`${card} transition-shadow ${dropActive ? "ring-4 ring-amber-400" : ""}`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="tray-h" className="font-display text-lg font-semibold">
          Still to seat
        </h2>
        <span className="rounded-full bg-accent-100 px-2.5 py-0.5 text-sm font-semibold tabular-nums text-accent-800">
          {toSeat.length}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-muted">Attending guests without a seat. Drop a seated guest here to unseat them.</p>

      {toSeat.length === 0 ? (
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
          <CircleCheck className="h-4 w-4 shrink-0" aria-hidden /> Every attending guest has a seat.
        </p>
      ) : (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:max-h-[22rem] xl:grid-cols-1 xl:overflow-y-auto xl:pr-1">
          {toSeat.map((g) => (
            <Chip key={g.id} g={g} armed={armed === g.id} onPick={onPick} beginDrag={beginDrag} />
          ))}
        </ul>
      )}

      {unconfirmed.length > 0 && (
        <details className="mt-4 group">
          <summary className="flex min-h-9 cursor-pointer items-center justify-between text-sm font-medium text-ink/80">
            <span>Not confirmed yet</span>
            <span className="text-xs tabular-nums text-muted">{unconfirmed.length}</span>
          </summary>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            {unconfirmed.map((g) => (
              <Chip key={g.id} g={g} armed={armed === g.id} onPick={onPick} beginDrag={beginDrag} />
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

/* ---------- tables overview ---------- */

export function TableList({
  seating,
  selected,
  flaggedTables,
  onSelect,
}: {
  seating: Seating;
  selected: string | null;
  flaggedTables: Set<string>;
  onSelect: (id: string) => void;
}) {
  return (
    <section aria-labelledby="tables-h" className={card}>
      <h2 id="tables-h" className="font-display text-lg font-semibold">
        Tables
      </h2>
      <ul className="mt-3 grid grid-cols-2 gap-2">
        {tables.map((t) => {
          const filled = seating[t.id].filter(Boolean).length;
          const flagged = flaggedTables.has(t.id);
          return (
            <li key={t.id}>
              <button
                type="button"
                aria-pressed={selected === t.id}
                onClick={() => onSelect(t.id)}
                className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors hover:border-brand-500 ${
                  selected === t.id ? "border-brand-600 bg-brand-50" : "border-line bg-white"
                }`}
              >
                <span className="flex items-center gap-1.5 font-medium">
                  {flagged && <TriangleAlert className="h-3.5 w-3.5 text-rose-600" aria-label="Breaks a rule" />}
                  {t.name}
                </span>
                <span className={`tabular-nums ${filled === t.seats ? "font-semibold text-brand-700" : "text-muted"}`}>
                  {filled}/{t.seats}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ---------- selected table ---------- */

export function TableDetail({
  tableId,
  seating,
  results,
  armed,
  beginDrag,
  onPick,
  onUnseat,
}: {
  tableId: string | null;
  seating: Seating;
  results: RuleResult[];
  armed: string | null;
  beginDrag: BeginDrag;
  onPick: (id: string) => void;
  onUnseat: (id: string) => void;
}) {
  if (!tableId) {
    return (
      <section aria-labelledby="detail-h" className={card}>
        <h2 id="detail-h" className="font-display text-lg font-semibold">
          Table details
        </h2>
        <p className="mt-2 text-sm text-muted">Select a table on the plan to see who is sitting there and what they eat.</p>
      </section>
    );
  }
  const t = tableById[tableId];
  const row = seating[tableId];
  const seated = row.filter((id): id is string => id !== null).map((id) => guestById[id]);
  const diets = new Map<string, number>();
  for (const g of seated) if (g.diet) diets.set(g.diet, (diets.get(g.diet) ?? 0) + 1);
  const issues = results.filter((r) => r.status === "broken" && r.tableIds.includes(tableId));

  return (
    <section aria-labelledby="detail-h" className={card}>
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="detail-h" className="font-display text-lg font-semibold">
          {t.name}
        </h2>
        <span className="text-sm tabular-nums text-muted">
          {seated.length} of {t.seats} seats
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-200" aria-hidden>
        <div className="h-full rounded-full bg-brand-600" style={{ width: `${(seated.length / t.seats) * 100}%` }} />
      </div>

      {issues.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {issues.map((r) => (
            <li key={r.index} className="flex gap-2 rounded-lg bg-rose-50 px-2.5 py-2 text-xs text-rose-900">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>
                <span className="font-semibold">{r.title}.</span> {r.detail}
              </span>
            </li>
          ))}
        </ul>
      )}

      <ol className="mt-3 divide-y divide-line">
        {row.map((id, i) => {
          const g = id ? guestById[id] : null;
          return (
            <li key={i} className="flex min-h-11 items-center gap-2 py-1.5">
              <span className="w-5 shrink-0 text-xs tabular-nums text-muted">{i + 1}</span>
              {g ? (
                <>
                  <button
                    type="button"
                    aria-pressed={armed === g.id}
                    onPointerDown={(e) => beginDrag(e, g.id)}
                    onClick={() => onPick(g.id)}
                    style={{ touchAction: "pan-y" }}
                    className={`min-w-0 flex-1 select-none rounded-lg px-1.5 py-1 text-left ${
                      armed === g.id ? "bg-brand-50 ring-2 ring-brand-600" : "hover:bg-stone-100"
                    }`}
                  >
                    <span className="block truncate text-sm font-medium">{g.name}</span>
                    <span className="block truncate text-xs text-muted">{g.party}</span>
                  </button>
                  {g.diet && (
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                      {g.diet}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onUnseat(g.id)}
                    aria-label={`Unseat ${g.name}`}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-rose-50 hover:text-rose-700"
                  >
                    <UserMinus className="h-4 w-4" aria-hidden />
                  </button>
                </>
              ) : (
                <span className="flex-1 px-1.5 text-sm italic text-stone-400">Empty seat</span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-3 rounded-xl bg-stone-100 px-3 py-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Dietary needs at this table</h3>
        {diets.size === 0 ? (
          <p className="mt-1 text-sm">None noted.</p>
        ) : (
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {Array.from(diets.entries()).map(([d, n]) => (
              <li key={d} className="rounded-full bg-amber-100 px-2.5 py-0.5 text-sm text-amber-900">
                {d} <span className="font-semibold tabular-nums">× {n}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/* ---------- couple's rules ---------- */

const KIND_ICON = { together: Link2, apart: Unlink, near: MapPin } as const;

export function RulesCard({
  results,
  broken,
  open,
  ok,
  onSelectTable,
}: {
  results: RuleResult[];
  broken: number;
  open: number;
  ok: number;
  onSelectTable: (id: string) => void;
}) {
  const order = { broken: 0, open: 1, ok: 2 } as const;
  const sorted = [...results].sort((a, b) => order[a.status] - order[b.status] || a.index - b.index);
  return (
    <section aria-labelledby="rules-h" className={card}>
      <h2 id="rules-h" className="font-display text-lg font-semibold">
        The couple&apos;s rules
      </h2>
      <p className={`mt-1 text-sm ${broken ? "font-medium text-rose-700" : "text-muted"}`} role="status">
        {broken === 0 ? "No rule is broken." : `${broken} ${broken === 1 ? "rule is" : "rules are"} broken.`}{" "}
        <span className="font-normal text-muted">
          {open > 0 ? `${open} waiting for a seat. ` : ""}
          {ok} kept.
        </span>
      </p>
      <ul className="mt-3 space-y-2">
        {sorted.map((r) => {
          const Icon = KIND_ICON[r.kind];
          const tone =
            r.status === "broken"
              ? "border-rose-200 bg-rose-50"
              : r.status === "open"
                ? "border-amber-200 bg-amber-50"
                : "border-line bg-white";
          const StatusIcon = r.status === "broken" ? TriangleAlert : r.status === "open" ? Clock : CircleCheck;
          const statusCls =
            r.status === "broken" ? "text-rose-700" : r.status === "open" ? "text-amber-700" : "text-emerald-700";
          const statusText = r.status === "broken" ? "Broken" : r.status === "open" ? "Waiting" : "Kept";
          return (
            <li key={r.index} className={`rounded-xl border p-3 ${tone}`}>
              <div className="flex items-start gap-2">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink/60" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug">{r.title}</p>
                  <p className="mt-0.5 text-xs text-ink/75">{r.note}</p>
                  <p className="mt-1 text-xs">{r.detail}</p>
                  {r.tableIds.length > 0 && (
                    <p className="mt-1.5 flex flex-wrap gap-1.5">
                      {r.tableIds.map((id) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => onSelectTable(id)}
                          className="rounded-full border border-ink/15 bg-white px-2.5 py-1 text-xs font-medium hover:border-brand-500"
                        >
                          Show {tableById[id].name}
                        </button>
                      ))}
                    </p>
                  )}
                </div>
                <span className={`flex shrink-0 items-center gap-1 text-xs font-semibold ${statusCls}`}>
                  <StatusIcon className="h-3.5 w-3.5" aria-hidden />
                  {statusText}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
```

```tsx components/plan/PlanView.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { CircleCheck, RotateCcw, TriangleAlert, UserMinus, X } from "lucide-react";
import { usePlan } from "@/lib/plan-context";
import { guestById, tableById } from "@/lib/plan";
import { initials, partyStyle } from "@/lib/ui";
import { Room } from "./Room";
import { RulesCard, TableDetail, TableList, Tray } from "./Panels";
import type { DragState, DropTarget } from "./types";

function targetAt(x: number, y: number): DropTarget | null {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;
  const seat = el.closest<HTMLElement>("[data-seat]");
  if (seat) {
    return { kind: "seat", tableId: seat.dataset.tableId ?? "", index: Number(seat.dataset.seatIndex) };
  }
  const table = el.closest<HTMLElement>("[data-table]");
  if (table) return { kind: "table", tableId: table.dataset.tableId ?? "" };
  if (el.closest("[data-tray]")) return { kind: "tray" };
  return null;
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "bad" | "good" }) {
  return (
    <div className="rounded-2xl border border-line bg-card px-4 py-3 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p
        className={`font-display text-2xl font-semibold tabular-nums ${
          tone === "bad" ? "text-rose-700" : tone === "good" ? "text-brand-700" : ""
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  );
}

export function PlanView() {
  const { seating, tableOf, results, stats, notice, assign, unseat, reset } = usePlan();
  const [selected, setSelected] = useState<string | null>(null);
  const [armed, setArmed] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [hover, setHover] = useState<DropTarget | null>(null);
  const suppressClick = useRef(false);

  const dropRef = useRef<(guestId: string, target: DropTarget | null) => void>(() => {});
  dropRef.current = (guestId, target) => {
    if (!target) return;
    if (target.kind === "tray") {
      if (tableOf.has(guestId)) unseat(guestId);
      setArmed(null);
      return;
    }
    const ok =
      target.kind === "seat" ? assign(guestId, target.tableId, target.index) : assign(guestId, target.tableId);
    if (ok) {
      setSelected(target.tableId);
      setArmed(null);
    }
  };

  const beginDrag = useCallback((e: ReactPointerEvent, guestId: string) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const id = e.pointerId;
    const sx = e.clientX;
    const sy = e.clientY;
    let started = false;
    let last: DropTarget | null = null;

    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== id) return;
      if (!started) {
        if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 8) return;
        started = true;
      }
      last = targetAt(ev.clientX, ev.clientY);
      setDrag({ guestId, x: ev.clientX, y: ev.clientY });
      setHover(last);
    };
    const finish = (ev: PointerEvent, drop: boolean) => {
      if (ev.pointerId !== id) return;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      if (!started) return;
      suppressClick.current = true;
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 80);
      if (drop) dropRef.current(guestId, targetAt(ev.clientX, ev.clientY) ?? last);
      setDrag(null);
      setHover(null);
    };
    const up = (ev: PointerEvent) => finish(ev, true);
    const cancel = (ev: PointerEvent) => finish(ev, false);

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setArmed(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pickGuest = useCallback(
    (guestId: string) => {
      if (suppressClick.current) return;
      setArmed((cur) => (cur === guestId ? null : guestId));
      const t = tableOf.get(guestId);
      if (t) setSelected(t);
    },
    [tableOf],
  );

  const onSeat = useCallback(
    (tableId: string, index: number) => {
      if (suppressClick.current) return;
      const occupant = seating[tableId][index];
      if (armed && armed !== occupant) {
        if (assign(armed, tableId, index)) {
          setArmed(null);
          setSelected(tableId);
        }
        return;
      }
      setSelected(tableId);
      if (occupant) setArmed((cur) => (cur === occupant ? null : occupant));
    },
    [armed, assign, seating],
  );

  const onTable = useCallback(
    (tableId: string) => {
      if (suppressClick.current) return;
      if (armed) {
        if (assign(armed, tableId)) setArmed(null);
      }
      setSelected(tableId);
    },
    [armed, assign],
  );

  const flaggedTables = useMemo(() => {
    const s = new Set<string>();
    for (const r of results) if (r.status === "broken") r.tableIds.forEach((t) => s.add(t));
    return s;
  }, [results]);
  const flaggedGuests = useMemo(() => {
    const s = new Set<string>();
    for (const r of results) if (r.status === "broken") r.guestIds.forEach((g) => s.add(g));
    return s;
  }, [results]);

  const armedGuest = armed ? guestById[armed] : null;
  const armedTable = armed ? tableOf.get(armed) : undefined;
  const dragGuest = drag ? guestById[drag.guestId] : null;
  const progress = stats.confirmed ? Math.round((stats.confirmedSeated / stats.confirmed) * 100) : 0;

  return (
    <div className={drag ? "cursor-grabbing" : undefined}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Seating plan</h1>
          <p className="text-sm text-muted">
            {stats.confirmedSeated} of {stats.confirmed} attending guests have a seat ({progress}%).
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            reset();
            setSelected(null);
            setArmed(null);
          }}
          className="flex min-h-11 items-center gap-2 rounded-xl border border-line bg-card px-3.5 text-sm font-medium hover:border-brand-500"
        >
          <RotateCcw className="h-4 w-4" aria-hidden /> Reset plan
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Seated" value={String(stats.seated)} sub={`${stats.confirmedSeated} of ${stats.confirmed} attending`} tone="good" />
        <Stat label="Unseated" value={String(stats.toSeat.length)} sub="attending, no seat yet" />
        <Stat label="Not confirmed" value={String(stats.unconfirmed.length)} sub="maybe or awaiting reply" />
        <Stat
          label="Rules"
          value={stats.brokenCount === 0 ? "All kept" : `${stats.brokenCount} broken`}
          sub={stats.openCount ? `${stats.openCount} waiting for a seat` : `${stats.okCount} kept`}
          tone={stats.brokenCount ? "bad" : "good"}
        />
      </div>

      {armedGuest && (
        <div
          role="status"
          className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-brand-600/40 bg-brand-50 px-4 py-3 text-sm"
        >
          <span
            className="grid h-8 w-8 place-items-center rounded-full border-2 text-xs font-semibold"
            style={partyStyle(armedGuest.party)}
            aria-hidden
          >
            {initials(armedGuest.name)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="font-semibold">{armedGuest.name}</span> is selected
            {armedGuest.diet ? ` (${armedGuest.diet})` : ""}. Tap a seat or table to {armedTable ? "move" : "seat"} them.
          </span>
          {armedTable && (
            <button
              type="button"
              onClick={() => {
                unseat(armedGuest.id);
                setArmed(null);
              }}
              className="flex min-h-10 items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 font-medium text-rose-800"
            >
              <UserMinus className="h-4 w-4" aria-hidden /> Unseat
            </button>
          )}
          <button
            type="button"
            onClick={() => setArmed(null)}
            className="flex min-h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3 font-medium"
          >
            <X className="h-4 w-4" aria-hidden /> Cancel
          </button>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="xl:col-start-2 xl:row-start-1">
          <Tray
            toSeat={stats.toSeat}
            unconfirmed={stats.unconfirmed}
            armed={armed}
            dropActive={hover?.kind === "tray"}
            beginDrag={beginDrag}
            onPick={pickGuest}
          />
        </div>

        <div className="min-w-0 xl:col-start-1 xl:row-span-2 xl:row-start-1">
          <Room
            seating={seating}
            selected={selected}
            armed={armed}
            hover={hover}
            flaggedTables={flaggedTables}
            flaggedGuests={flaggedGuests}
            beginDrag={beginDrag}
            onSeat={onSeat}
            onTable={onTable}
            onBackground={() => {
              setSelected(null);
              setArmed(null);
            }}
          />
        </div>

        <div className="grid content-start gap-4 md:grid-cols-2 xl:col-start-2 xl:row-start-2 xl:grid-cols-1">
          <TableDetail
            tableId={selected}
            seating={seating}
            results={results}
            armed={armed}
            beginDrag={beginDrag}
            onPick={pickGuest}
            onUnseat={unseat}
          />
          <div className="grid content-start gap-4">
            <RulesCard
              results={results}
              broken={stats.brokenCount}
              open={stats.openCount}
              ok={stats.okCount}
              onSelectTable={setSelected}
            />
            <TableList seating={seating} selected={selected} flaggedTables={flaggedTables} onSelect={setSelected} />
          </div>
        </div>
      </div>

      {drag && dragGuest && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-50 flex items-center gap-2 rounded-full border bg-white py-1 pl-1 pr-3 text-sm font-medium shadow-xl"
          style={{ left: drag.x + 14, top: drag.y + 14, borderColor: partyStyle(dragGuest.party).borderColor }}
        >
          <span
            className="grid h-7 w-7 place-items-center rounded-full border-2 text-xs font-semibold"
            style={partyStyle(dragGuest.party)}
          >
            {initials(dragGuest.name)}
          </span>
          {dragGuest.name}
        </div>
      )}

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
        {notice && (
          <p
            key={notice.id}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-lg ${
              notice.tone === "warn" ? "bg-rose-700" : "bg-brand-900"
            }`}
          >
            {notice.tone === "warn" ? (
              <TriangleAlert className="h-4 w-4" aria-hidden />
            ) : (
              <CircleCheck className="h-4 w-4" aria-hidden />
            )}
            {notice.text}
          </p>
        )}
      </div>
    </div>
  );
}

export { tableById };
```

```tsx components/guests/GuestsView.tsx
"use client";

import { useMemo, useState } from "react";
import { Printer, Search, X } from "lucide-react";
import { guests, type Rsvp } from "@/lib/data";
import { tableById } from "@/lib/plan";
import { usePlan } from "@/lib/plan-context";
import { initials, partyStyle, PARTY_ORDER, RSVP } from "@/lib/ui";

const field =
  "min-h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-offset-2 focus-visible:border-brand-600";

const diets = Array.from(new Set(guests.map((g) => g.diet).filter((d): d is string => d !== null))).sort();

const meals = ["Standard", ...diets].map((name) => {
  const key = name === "Standard" ? null : name;
  return {
    name,
    filter: key === null ? "none" : key,
    confirmed: guests.filter((g) => g.diet === key && g.rsvp === "yes").length,
    awaiting: guests.filter((g) => g.diet === key && (g.rsvp === "maybe" || g.rsvp === "pending")).length,
  };
});

export function GuestsView() {
  const { tableOf } = usePlan();
  const [q, setQ] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState<"all" | Rsvp>("all");
  const [diet, setDiet] = useState("all");

  const tableName = (id: string) => {
    const t = tableOf.get(id);
    return t ? tableById[t].name : null;
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return guests.filter((g) => {
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === "none" && g.diet !== null) return false;
      if (diet !== "all" && diet !== "none" && g.diet !== diet) return false;
      if (!needle) return true;
      const t = tableOf.get(g.id);
      const hay = `${g.name} ${g.party} ${g.diet ?? ""} ${t ? tableById[t].name : "unseated"}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [q, party, rsvp, diet, tableOf]);

  const filtersOn = q !== "" || party !== "all" || rsvp !== "all" || diet !== "all";
  const totalConfirmed = meals.reduce((n, m) => n + m.confirmed, 0);
  const totalAwaiting = meals.reduce((n, m) => n + m.awaiting, 0);
  const declined = guests.filter((g) => g.rsvp === "no").length;

  const rsvpBadge = (r: Rsvp) => (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${RSVP[r].cls}`}>
      {RSVP[r].label}
    </span>
  );

  const seatCell = (id: string, r: Rsvp) => {
    const name = tableName(id);
    if (name) return <span className="font-medium">{name}</span>;
    if (r === "no") return <span className="text-muted">Not coming</span>;
    return <span className="text-amber-800">Unseated</span>;
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Guest list</h1>
          <p className="text-sm text-muted">
            {guests.length} invited · {totalConfirmed} attending · {totalAwaiting} not confirmed · {declined} declined
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex min-h-11 items-center gap-2 rounded-xl border border-line bg-card px-3.5 text-sm font-medium hover:border-brand-500 print:hidden"
        >
          <Printer className="h-4 w-4" aria-hidden /> Print for the caterer
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-label="Guests" className="min-w-0">
          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="mb-3 grid gap-3 rounded-2xl border border-line bg-card p-3 shadow-sm sm:grid-cols-2 xl:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))] print:hidden"
          >
            <div className="relative sm:col-span-2 xl:col-span-1">
              <label htmlFor="q" className="sr-only">
                Search guests
              </label>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
              <input
                id="q"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, party, diet or table"
                className={`${field} pl-9`}
              />
            </div>
            <div>
              <label htmlFor="party" className="sr-only">
                Party
              </label>
              <select id="party" value={party} onChange={(e) => setParty(e.target.value)} className={field}>
                <option value="all">All parties</option>
                {PARTY_ORDER.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="rsvp" className="sr-only">
                RSVP
              </label>
              <select id="rsvp" value={rsvp} onChange={(e) => setRsvp(e.target.value as "all" | Rsvp)} className={field}>
                <option value="all">Any RSVP</option>
                <option value="yes">Attending</option>
                <option value="maybe">Maybe</option>
                <option value="pending">Awaiting reply</option>
                <option value="no">Declined</option>
              </select>
            </div>
            <div>
              <label htmlFor="diet" className="sr-only">
                Diet
              </label>
              <select id="diet" value={diet} onChange={(e) => setDiet(e.target.value)} className={field}>
                <option value="all">Any diet</option>
                <option value="none">No dietary needs</option>
                {diets.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </form>

          <div className="mb-2 flex items-center justify-between px-1 text-sm" role="status">
            <span className="text-muted">
              Showing {filtered.length} of {guests.length} guests
            </span>
            {filtersOn && (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setParty("all");
                  setRsvp("all");
                  setDiet("all");
                }}
                className="flex min-h-9 items-center gap-1 rounded-lg px-2 font-medium text-brand-700 hover:bg-brand-50 print:hidden"
              >
                <X className="h-3.5 w-3.5" aria-hidden /> Clear filters
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line bg-card px-4 py-10 text-center text-sm text-muted">
              No guest matches these filters.
            </p>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-2xl border border-line bg-card shadow-sm md:block">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Guest list with party, RSVP, diet and table</caption>
                  <thead className="bg-stone-100 text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th scope="col" className="px-4 py-2.5 font-medium">Guest</th>
                      <th scope="col" className="px-4 py-2.5 font-medium">Party</th>
                      <th scope="col" className="px-4 py-2.5 font-medium">RSVP</th>
                      <th scope="col" className="px-4 py-2.5 font-medium">Diet</th>
                      <th scope="col" className="px-4 py-2.5 font-medium">Table</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filtered.map((g) => (
                      <tr key={g.id} className="hover:bg-brand-50/50">
                        <th scope="row" className="px-4 py-2.5 font-medium">
                          <span className="flex items-center gap-2.5">
                            <span
                              aria-hidden
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-xs font-semibold"
                              style={partyStyle(g.party)}
                            >
                              {initials(g.name)}
                            </span>
                            {g.name}
                          </span>
                        </th>
                        <td className="px-4 py-2.5 text-ink/80">{g.party}</td>
                        <td className="px-4 py-2.5">{rsvpBadge(g.rsvp)}</td>
                        <td className="px-4 py-2.5">
                          {g.diet ? (
                            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900">{g.diet}</span>
                          ) : (
                            <span className="text-muted">None</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">{seatCell(g.id, g.rsvp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="grid gap-2 md:hidden">
                {filtered.map((g) => (
                  <li key={g.id} className="rounded-2xl border border-line bg-card p-3 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 text-xs font-semibold"
                        style={partyStyle(g.party)}
                      >
                        {initials(g.name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium leading-snug">{g.name}</p>
                        <p className="text-xs text-muted">{g.party}</p>
                      </div>
                      {rsvpBadge(g.rsvp)}
                    </div>
                    <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <dt className="text-xs text-muted">Diet</dt>
                        <dd>{g.diet ?? "None"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">Table</dt>
                        <dd>{seatCell(g.id, g.rsvp)}</dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <aside aria-labelledby="meals-h" className="h-fit rounded-2xl border border-line bg-card p-4 shadow-sm lg:sticky lg:top-24">
          <h2 id="meals-h" className="font-display text-lg font-semibold">
            Meals for the caterer
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            Count per meal. Confirmed means attending; awaiting means maybe or no reply yet. Declined guests are left out.
          </p>
          <table className="mt-3 w-full text-sm">
            <caption className="sr-only">Meal counts by dietary need</caption>
            <thead className="text-xs text-muted">
              <tr>
                <th scope="col" className="pb-1.5 text-left font-medium">Meal</th>
                <th scope="col" className="pb-1.5 text-right font-medium">Confirmed</th>
                <th scope="col" className="pb-1.5 text-right font-medium">Awaiting</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {meals.map((m) => {
                const active = diet === m.filter;
                return (
                  <tr key={m.name} className={active ? "bg-brand-50" : undefined}>
                    <th scope="row" className="py-0 text-left font-normal">
                      <button
                        type="button"
                        aria-pressed={active}
                        onClick={() => setDiet(active ? "all" : m.filter)}
                        className="min-h-10 w-full rounded-lg px-1.5 text-left hover:bg-brand-50 print:min-h-0"
                      >
                        {m.name}
                      </button>
                    </th>
                    <td className="py-2 text-right font-semibold tabular-nums">{m.confirmed}</td>
                    <td className="py-2 text-right tabular-nums text-muted">{m.awaiting}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t-2 border-ink/20">
              <tr>
                <th scope="row" className="py-2 text-left font-semibold">Total</th>
                <td className="py-2 text-right font-semibold tabular-nums">{totalConfirmed}</td>
                <td className="py-2 text-right font-semibold tabular-nums text-muted">{totalAwaiting}</td>
              </tr>
            </tfoot>
          </table>
          <p className="mt-3 text-xs text-muted print:hidden">Select a meal to filter the guest list.</p>
        </aside>
      </div>
    </div>
  );
}
```

```tsx app/guests/page.tsx
import type { Metadata } from "next";
import { GuestsView } from "@/components/guests/GuestsView";

export const metadata: Metadata = { title: "Guest list · Seatwise" };

export default function GuestsPage() {
  return <GuestsView />;
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { PlanView } from "@/components/plan/PlanView";

export const metadata: Metadata = { title: "Seating plan · Seatwise" };

export default function Page() {
  return <PlanView />;
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/AppShell";
import { PlanProvider } from "@/lib/plan-context";

export const metadata: Metadata = {
  title: "Seatwise",
  description: "A seating planner for wedding and event planners.",
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
  --font-sans: ui-sans-serif, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-display: "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;

  --color-paper: #f7f4ee;
  --color-card: #fffdf9;
  --color-line: #e5decf;
  --color-ink: #1d2823;
  --color-muted: #666b63;

  --color-brand-50: #eef5f1;
  --color-brand-100: #d7e8df;
  --color-brand-200: #b0d1c1;
  --color-brand-300: #85b8a2;
  --color-brand-500: #3f8068;
  --color-brand-600: #2f6a55;
  --color-brand-700: #265644;
  --color-brand-800: #1f4538;
  --color-brand-900: #17332a;

  --color-accent-100: #f6ead2;
  --color-accent-800: #6f4c14;
}

:focus-visible {
  outline: 2px solid var(--color-brand-600);
  outline-offset: 2px;
}

button,
summary {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
}

@media print {
  body {
    background: #fff;
  }
}
```
