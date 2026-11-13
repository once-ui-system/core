```ts src/lib/data.ts
export type Rsvp = "yes" | "maybe" | "pending" | "no";
export type FixtureKind = "stage" | "dancefloor" | "bar" | "door";
export type TableShape = "long" | "round";
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

export interface SeatTable {
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

export const APP = "Seatwise";

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

// Rules are checked by guest id, exactly as given.
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

export const PARTY_COLORS: Record<string, { bg: string; fg: string; edge: string }> = {
  Couple: { bg: "#f2d58a", fg: "#4a3500", edge: "#c9a23a" },
  "Bride's family": { bg: "#f3c4c0", fg: "#5b1f1a", edge: "#d98a83" },
  "Groom's family": { bg: "#bdd5f0", fg: "#17365c", edge: "#7ea6d6" },
  "University friends": { bg: "#c5e3c6", fg: "#1d4a21", edge: "#7fb883" },
  "Work friends": { bg: "#d9c9f0", fg: "#3d2465", edge: "#a98cd6" },
  "Groom's football club": { bg: "#f6cfa3", fg: "#5a2e05", edge: "#dd9a52" },
  "Plus-ones": { bg: "#dcd8d0", fg: "#3a362f", edge: "#a9a396" },
};

export const FALLBACK_COLOR = { bg: "#e6e1d6", fg: "#3a362f", edge: "#a9a396" };

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "No reply",
  no: "Declined",
};
```

```ts src/lib/plan.ts
import {
  EVENT,
  FIXTURES,
  GUESTS,
  RULES,
  TABLES,
  type Guest,
  type RuleKind,
  type SeatTable,
} from "@/lib/data";

export type Assignments = Record<string, string | null>;

export const guestById = new Map<string, Guest>(GUESTS.map((g) => [g.id, g]));
export const tableById = new Map<string, SeatTable>(TABLES.map((t) => [t.id, t]));

export function initialAssignments(): Assignments {
  const a: Assignments = {};
  for (const g of GUESTS) a[g.id] = g.table;
  return a;
}

export function guestsAt(a: Assignments, tableId: string): Guest[] {
  return GUESTS.filter((g) => a[g.id] === tableId);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export interface Counts {
  attending: number;
  seated: number;
  unseated: number;
  provisional: number;
  capacity: number;
  byTable: Record<string, number>;
}

export function computeCounts(a: Assignments): Counts {
  const byTable: Record<string, number> = {};
  for (const t of TABLES) byTable[t.id] = 0;
  let attending = 0;
  let seated = 0;
  let provisional = 0;
  for (const g of GUESTS) {
    const tid = a[g.id];
    if (tid) byTable[tid] = (byTable[tid] ?? 0) + 1;
    if (g.rsvp === "yes") {
      attending += 1;
      if (tid) seated += 1;
    } else if (tid) {
      provisional += 1;
    }
  }
  return {
    attending,
    seated,
    unseated: attending - seated,
    provisional,
    capacity: TABLES.reduce((n, t) => n + t.seats, 0),
    byTable,
  };
}

export type RuleStatus = "ok" | "broken" | "waiting";

export interface RuleResult {
  id: string;
  kind: RuleKind;
  note: string;
  status: RuleStatus;
  title: string;
  detail: string;
  tableIds: string[];
  guestIds: string[];
}

const NEAR_TARGETS: Record<string, { near: string; nearLabel: string; away: string; awayLabel: string }> = {
  "g-09": { near: "f-4", nearLabel: "the garden doors", away: "f-1", awayLabel: "the band" },
};
const NEAR_MAX_M = 4;
const AWAY_MIN_M = 6;

function fixtureCentre(id: string): { x: number; y: number } {
  const f = FIXTURES.find((x) => x.id === id);
  if (!f) return { x: 0, y: 0 };
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

function dist(t: SeatTable, p: { x: number; y: number }): number {
  return Math.hypot(t.x - p.x, t.y - p.y);
}

const nameOf = (id: string) => guestById.get(id)?.name ?? id;

export function evaluateRules(a: Assignments): RuleResult[] {
  return RULES.map((rule, i): RuleResult => {
    const id = `r-${i + 1}`;
    const base = { id, kind: rule.kind, note: rule.note, guestIds: rule.guests };
    const names = rule.guests.map(nameOf);
    const tables = rule.guests.map((gid) => a[gid] ?? null);

    if (rule.kind === "together") {
      const title = `Keep together: ${names.join(" and ")}`;
      const seated = tables.filter((t): t is string => t !== null);
      if (seated.length < tables.length) {
        const missing = rule.guests.filter((gid) => !a[gid]).map(nameOf);
        const detail =
          seated.length === 0
            ? `Waiting: ${missing.join(" and ")} still need seats.`
            : `Waiting: ${missing.join(" and ")} still needs a seat.`;
        return { ...base, title, status: "waiting", detail, tableIds: [] };
      }
      const same = seated.every((t) => t === seated[0]);
      if (same) {
        return {
          ...base,
          title,
          status: "ok",
          detail: `Together at ${tableById.get(seated[0] ?? "")?.name ?? "a table"}.`,
          tableIds: [],
        };
      }
      const where = rule.guests
        .map((gid) => `${nameOf(gid)} (${tableById.get(a[gid] ?? "")?.name})`)
        .join(" and ");
      return {
        ...base,
        title,
        status: "broken",
        detail: `${where} are at different tables.`,
        tableIds: Array.from(new Set(seated)),
      };
    }

    if (rule.kind === "apart") {
      const title = `Keep apart: ${names.join(" and ")}`;
      const seated = tables.filter((t): t is string => t !== null);
      const clash = seated.length === tables.length && seated.every((t) => t === seated[0]);
      if (clash) {
        return {
          ...base,
          title,
          status: "broken",
          detail: `${names.join(" and ")} are both at ${tableById.get(seated[0] ?? "")?.name}.`,
          tableIds: [seated[0] ?? ""],
        };
      }
      const detail =
        seated.length < tables.length ? "Not at the same table so far." : "At different tables.";
      return { ...base, title, status: "ok", detail, tableIds: [] };
    }

    // near
    const gid = rule.guests[0] ?? "";
    const target = NEAR_TARGETS[gid];
    const label = target?.nearLabel ?? "the marked spot";
    const title = `Seat near ${label}: ${nameOf(gid)}`;
    const tid = a[gid] ?? null;
    if (!tid || !target) {
      return {
        ...base,
        title,
        status: "waiting",
        detail: `Waiting: ${nameOf(gid)} still needs a seat.`,
        tableIds: [],
      };
    }
    const table = tableById.get(tid);
    if (!table) return { ...base, title, status: "waiting", detail: "Table not found.", tableIds: [] };
    const dNear = dist(table, fixtureCentre(target.near));
    const dAway = dist(table, fixtureCentre(target.away));
    const nearOk = dNear <= NEAR_MAX_M;
    const awayOk = dAway >= AWAY_MIN_M;
    if (nearOk && awayOk) {
      return {
        ...base,
        title,
        status: "ok",
        detail: `${table.name} is ${dNear.toFixed(1)} m from ${label} and ${dAway.toFixed(1)} m from ${target.awayLabel}.`,
        tableIds: [],
      };
    }
    const problems: string[] = [];
    if (!nearOk) problems.push(`${dNear.toFixed(1)} m from ${label} (aim for ${NEAR_MAX_M} m or less)`);
    if (!awayOk) problems.push(`only ${dAway.toFixed(1)} m from ${target.awayLabel}`);
    return {
      ...base,
      title,
      status: "broken",
      detail: `${table.name} is ${problems.join(" and ")}.`,
      tableIds: [tid],
    };
  });
}

export function dietSummary(guests: Guest[]): { diet: string; count: number }[] {
  const m = new Map<string, number>();
  for (const g of guests) if (g.diet) m.set(g.diet, (m.get(g.diet) ?? 0) + 1);
  return Array.from(m, ([diet, count]) => ({ diet, count })).sort((x, y) => x.diet.localeCompare(y.diet));
}

export const ROOM = EVENT.room_m;
```

```tsx src/components/PlanProvider.tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { TABLES } from "@/lib/data";
import { guestById, initialAssignments, tableById, type Assignments } from "@/lib/plan";

export interface PlaceResult {
  ok: boolean;
  message: string;
}

interface PlanContextValue {
  assignments: Assignments;
  place: (guestId: string, tableId: string | null) => PlaceResult;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [assignments, setAssignments] = useState<Assignments>(initialAssignments);
  const latest = useRef<Assignments>(assignments);
  latest.current = assignments;

  const place = useCallback((guestId: string, tableId: string | null): PlaceResult => {
    const guest = guestById.get(guestId);
    if (!guest) return { ok: false, message: "That guest could not be found." };
    const current = latest.current;
    if (tableId === null) {
      if (current[guestId] === null) return { ok: true, message: `${guest.name} is already unseated.` };
      const next = { ...current, [guestId]: null };
      latest.current = next;
      setAssignments(next);
      return { ok: true, message: `${guest.name} unseated.` };
    }
    const table = tableById.get(tableId);
    if (!table) return { ok: false, message: "That table could not be found." };
    if (current[guestId] === tableId) {
      return { ok: true, message: `${guest.name} is already at ${table.name}.` };
    }
    const taken = Object.values(current).filter((t) => t === tableId).length;
    const cap = TABLES.find((t) => t.id === tableId)?.seats ?? 0;
    if (taken >= cap) {
      return { ok: false, message: `${table.name} is full (${taken} of ${cap} seats).` };
    }
    const next = { ...current, [guestId]: tableId };
    latest.current = next;
    setAssignments(next);
    return { ok: true, message: `${guest.name} seated at ${table.name}.` };
  }, []);

  const value = useMemo(() => ({ assignments, place }), [assignments, place]);
  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}
```

```tsx src/components/AppFrame.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { APP, EVENT, PLANNER } from "@/lib/data";
import { formatDate } from "@/lib/plan";

const NAV = [
  { href: "/", label: "Seating plan" },
  { href: "/guests", label: "Guest list" },
];

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="sw-app">
      <a className="sw-skip" href="#main">
        Skip to content
      </a>
      <header className="sw-header">
        <div className="sw-header-inner">
          <Link href="/" className="sw-brand" aria-label={`${APP} home`}>
            <span className="sw-mark" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>{APP}</span>
          </Link>
          <nav aria-label="Main" className="sw-nav">
            {NAV.map((n) => {
              const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
              return (
                <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined} className="sw-navlink">
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="sw-event">
            <strong>{EVENT.name}</strong>
            <span>
              {formatDate(EVENT.date)} · {EVENT.venue}
            </span>
          </div>
          <div className="sw-user" title={PLANNER.name}>
            <span className="sw-avatar" aria-hidden="true">
              HB
            </span>
            <span className="sw-user-name">{PLANNER.name}</span>
          </div>
        </div>
      </header>
      <main id="main" className="sw-main">
        {children}
      </main>
    </div>
  );
}
```

```tsx src/components/RoomPlan.tsx
"use client";

import type { CSSProperties, DragEvent } from "react";
import { FALLBACK_COLOR, FIXTURES, PARTY_COLORS, TABLES, type SeatTable } from "@/lib/data";
import { guestsAt, initials, ROOM, type Assignments } from "@/lib/plan";

interface Props {
  assignments: Assignments;
  brokenTables: Set<string>;
  selectedTable: string | null;
  armedGuest: string | null;
  overTable: string | null;
  onTableClick: (tableId: string) => void;
  onSeatClick: (tableId: string, guestId: string | null) => void;
  onDragStartGuest: (guestId: string) => void;
  onDragEnd: () => void;
  onOverTable: (tableId: string | null) => void;
  onDropGuest: (tableId: string, guestId: string) => void;
}

const pct = (v: number, total: number) => `${(v / total) * 100}%`;

interface Pos {
  left: string;
  top: string;
}

function seatPositions(table: SeatTable): { zoneW: number; zoneH: number; pos: Pos[] } {
  const n = table.seats;
  if (table.shape === "long") {
    const zoneW = 5;
    const zoneH = 3;
    const topCount = Math.ceil(n / 2);
    const bottomCount = n - topCount;
    const pos: Pos[] = [];
    const row = (count: number, y: number) => {
      for (let i = 0; i < count; i += 1) {
        const x = zoneW / 2 + (i - (count - 1) / 2) * 1.1;
        pos.push({ left: pct(x, zoneW), top: pct(y, zoneH) });
      }
    };
    row(topCount, zoneH / 2 - 0.95);
    row(bottomCount, zoneH / 2 + 0.95);
    return { zoneW, zoneH, pos };
  }
  const zone = 4;
  const ring = 1.45;
  const pos: Pos[] = [];
  for (let i = 0; i < n; i += 1) {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    pos.push({
      left: pct(zone / 2 + ring * Math.cos(ang), zone),
      top: pct(zone / 2 + ring * Math.sin(ang), zone),
    });
  }
  return { zoneW: zone, zoneH: zone, pos };
}

export function RoomPlan(props: Props) {
  const {
    assignments,
    brokenTables,
    selectedTable,
    armedGuest,
    overTable,
    onTableClick,
    onSeatClick,
    onDragStartGuest,
    onDragEnd,
    onOverTable,
    onDropGuest,
  } = props;

  const handleDragOver = (e: DragEvent<HTMLDivElement>, tableId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (overTable !== tableId) onOverTable(tableId);
  };

  return (
    <div className="sw-roomwrap" role="group" aria-label={`Room plan, ${ROOM.width} by ${ROOM.depth} metres`} tabIndex={-1}>
      <div className="sw-room">
        {FIXTURES.map((f) => (
          <div
            key={f.id}
            className={`sw-fixture sw-fx-${f.kind}`}
            style={{
              left: pct(f.x, ROOM.width),
              top: pct(f.y, ROOM.depth),
              width: pct(f.w, ROOM.width),
              height: pct(f.h, ROOM.depth),
            }}
          >
            <span>{f.label}</span>
          </div>
        ))}

        {TABLES.map((table) => {
          const { zoneW, zoneH, pos } = seatPositions(table);
          const guests = guestsAt(assignments, table.id);
          const broken = brokenTables.has(table.id);
          const selected = selectedTable === table.id;
          const full = guests.length >= table.seats;
          const zoneStyle: CSSProperties = {
            left: pct(table.x, ROOM.width),
            top: pct(table.y, ROOM.depth),
            width: pct(zoneW, ROOM.width),
            height: pct(zoneH, ROOM.depth),
            transform: `translate(-50%, -50%) rotate(${table.rotation ?? 0}deg)`,
          };
          const bodyStyle: CSSProperties =
            table.shape === "long"
              ? { left: pct((zoneW - 4.4) / 2, zoneW), top: pct((zoneH - 1) / 2, zoneH), width: pct(4.4, zoneW), height: pct(1, zoneH) }
              : { left: "25%", top: "25%", width: "50%", height: "50%" };
          const state = [
            "sw-zone",
            overTable === table.id ? "is-over" : "",
            overTable === table.id && full ? "is-full" : "",
            armedGuest ? "is-armed" : "",
          ]
            .filter(Boolean)
            .join(" ");
          const label = `${table.name}, ${guests.length} of ${table.seats} seats filled${broken ? ", a rule is broken here" : ""}`;
          return (
            <div
              key={table.id}
              className={state}
              style={zoneStyle}
              onDragOver={(e) => handleDragOver(e, table.id)}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onOverTable(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const gid = e.dataTransfer.getData("text/plain");
                onOverTable(null);
                if (gid) onDropGuest(table.id, gid);
              }}
            >
              <button
                type="button"
                className={[
                  "sw-table",
                  table.shape === "long" ? "is-long" : "is-round",
                  selected ? "is-selected" : "",
                  broken ? "is-broken" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={bodyStyle}
                aria-pressed={selected}
                aria-label={label}
                onClick={() => onTableClick(table.id)}
              >
                <span className="sw-table-name">{table.name}</span>
                <span className="sw-table-count">
                  {guests.length}/{table.seats}
                </span>
              </button>
              {broken ? (
                <span
                  className="sw-flag"
                  aria-hidden="true"
                  style={
                    table.shape === "long"
                      ? { left: pct((zoneW + 4.4) / 2, zoneW), top: pct((zoneH - 1) / 2, zoneH) }
                      : { left: "80%", top: "20%" }
                  }
                >
                  !
                </span>
              ) : null}
              {pos.map((p, i) => {
                const g = guests[i];
                const c = g ? (PARTY_COLORS[g.party] ?? FALLBACK_COLOR) : null;
                const seatStyle: CSSProperties = {
                  left: p.left,
                  top: p.top,
                  ...(c ? { background: c.bg, color: c.fg, borderColor: c.edge } : {}),
                };
                const isArmed = g !== undefined && armedGuest === g.id;
                return (
                  <button
                    key={`${table.id}-${i}`}
                    type="button"
                    className={["sw-seat", g ? "is-taken" : "is-empty", g && g.rsvp !== "yes" ? "is-provisional" : "", isArmed ? "is-armed-seat" : ""]
                      .filter(Boolean)
                      .join(" ")}
                    style={seatStyle}
                    draggable={g !== undefined}
                    title={g ? `${g.name}, ${g.party}${g.diet ? `, ${g.diet}` : ""}` : "Empty seat"}
                    aria-label={
                      g
                        ? `Seat ${i + 1} at ${table.name}: ${g.name}${g.diet ? `, ${g.diet}` : ""}`
                        : `Seat ${i + 1} at ${table.name}: empty`
                    }
                    onClick={() => onSeatClick(table.id, g ? g.id : null)}
                    onDragStart={(e) => {
                      if (!g) return;
                      e.dataTransfer.setData("text/plain", g.id);
                      e.dataTransfer.effectAllowed = "move";
                      window.setTimeout(() => onDragStartGuest(g.id), 0);
                    }}
                    onDragEnd={onDragEnd}
                  >
                    {g ? initials(g.name) : ""}
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

```tsx src/components/PlanView.tsx
"use client";

import { useEffect, useMemo, useState, type DragEvent } from "react";
import { AppFrame } from "@/components/AppFrame";
import { usePlan } from "@/components/PlanProvider";
import { RoomPlan } from "@/components/RoomPlan";
import { EVENT, FALLBACK_COLOR, GUESTS, PARTY_COLORS, RSVP_LABEL, TABLES, type Guest } from "@/lib/data";
import {
  computeCounts,
  dietSummary,
  evaluateRules,
  guestById,
  guestsAt,
  ROOM,
  tableById,
} from "@/lib/plan";

function PartyDot({ party }: { party: string }) {
  const c = PARTY_COLORS[party] ?? FALLBACK_COLOR;
  return <span className="sw-dot" style={{ background: c.bg, borderColor: c.edge }} aria-hidden="true" />;
}

export function PlanView() {
  const { assignments, place } = usePlan();
  const [selectedTable, setSelectedTable] = useState<string | null>("t-1");
  const [armed, setArmed] = useState<string | null>(null);
  const [overTable, setOverTable] = useState<string | null>(null);
  const [overUnseated, setOverUnseated] = useState(false);
  const [notice, setNotice] = useState("");

  const counts = useMemo(() => computeCounts(assignments), [assignments]);
  const rules = useMemo(() => evaluateRules(assignments), [assignments]);
  const broken = rules.filter((r) => r.status === "broken");
  const brokenTables = useMemo(() => new Set(broken.flatMap((r) => r.tableIds)), [broken]);
  const brokenGuests = useMemo(() => new Set(broken.flatMap((r) => r.guestIds)), [broken]);

  useEffect(() => {
    if (!armed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setArmed(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [armed]);

  const unseatedConfirmed = GUESTS.filter((g) => g.rsvp === "yes" && !assignments[g.id]);
  const unseatedAwaiting = GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !assignments[g.id]);
  const declined = GUESTS.filter((g) => g.rsvp === "no").length;

  const placeGuest = (guestId: string, tableId: string | null) => {
    const res = place(guestId, tableId);
    setNotice(res.message);
    if (res.ok) {
      setArmed(null);
      if (tableId) setSelectedTable(tableId);
    }
  };

  const onTableClick = (tableId: string) => {
    if (armed) placeGuest(armed, tableId);
    else setSelectedTable(tableId);
  };

  const onSeatClick = (tableId: string, guestId: string | null) => {
    if (armed) {
      placeGuest(armed, tableId);
      return;
    }
    setSelectedTable(tableId);
    if (guestId) {
      setArmed(guestId);
      setNotice(`${guestById.get(guestId)?.name} picked up. Tap a table to move them.`);
    }
  };

  const toggleArm = (guestId: string) => {
    if (armed === guestId) {
      setArmed(null);
      setNotice("");
    } else {
      setArmed(guestId);
      setNotice(`${guestById.get(guestId)?.name} picked up. Tap a table to seat them.`);
    }
  };

  const dragStartFor = (e: DragEvent<HTMLElement>, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const selected = selectedTable ? tableById.get(selectedTable) : undefined;
  const selectedGuests = selected ? guestsAt(assignments, selected.id) : [];
  const selectedDiets = dietSummary(selectedGuests);
  const armedGuest = armed ? guestById.get(armed) : undefined;

  const chip = (g: Guest) => {
    const isArmed = armed === g.id;
    return (
      <li key={g.id}>
        <button
          type="button"
          className={`sw-chip${isArmed ? " is-armed" : ""}${brokenGuests.has(g.id) ? " has-rule" : ""}`}
          draggable
          aria-pressed={isArmed}
          onDragStart={(e) => dragStartFor(e, g.id)}
          onClick={() => toggleArm(g.id)}
        >
          <PartyDot party={g.party} />
          <span className="sw-chip-text">
            <span className="sw-chip-name">{g.name}</span>
            <span className="sw-chip-sub">
              {g.party}
              {g.rsvp !== "yes" ? ` · ${RSVP_LABEL[g.rsvp]}` : ""}
            </span>
          </span>
          {g.diet ? <span className="sw-tag">{g.diet}</span> : null}
        </button>
      </li>
    );
  };

  return (
    <AppFrame>
      <div className="sw-page">
        <div className="sw-titlebar">
          <div>
            <h1>Seating plan</h1>
            <p className="sw-sub">
              {EVENT.venue} · room {ROOM.width} × {ROOM.depth} m · drag guests onto tables, or tap a guest and then a table.
            </p>
          </div>
        </div>

        <section className="sw-stats" aria-label="Seating totals">
          <div className="sw-stat">
            <span className="sw-stat-num">
              {counts.seated}
              <small> of {counts.attending}</small>
            </span>
            <span className="sw-stat-label">attending guests seated</span>
          </div>
          <div className={`sw-stat${counts.unseated > 0 ? " is-warn" : ""}`}>
            <span className="sw-stat-num">{counts.unseated}</span>
            <span className="sw-stat-label">attending, no seat yet</span>
          </div>
          <div className="sw-stat">
            <span className="sw-stat-num">
              {counts.seated + counts.provisional}
              <small> of {counts.capacity}</small>
            </span>
            <span className="sw-stat-label">
              seats filled{counts.provisional > 0 ? ` (${counts.provisional} awaiting reply)` : ""}
            </span>
          </div>
          <div className={`sw-stat${broken.length > 0 ? " is-bad" : " is-good"}`}>
            <span className="sw-stat-num">{broken.length}</span>
            <span className="sw-stat-label">{broken.length === 1 ? "rule broken" : "rules broken"}</span>
          </div>
        </section>

        <p role="status" aria-live="polite" className="sw-notice">
          {notice}
        </p>
        {armedGuest ? (
          <div className="sw-armed" role="group" aria-label="Guest picked up">
            <span>
              Placing <strong>{armedGuest.name}</strong>. Tap a table to seat them.
            </span>
            <button type="button" className="sw-btn" onClick={() => setArmed(null)}>
              Cancel
            </button>
          </div>
        ) : null}

        <div className="sw-plan">
          <div className="sw-plan-main">
            <RoomPlan
              assignments={assignments}
              brokenTables={brokenTables}
              selectedTable={selectedTable}
              armedGuest={armed}
              overTable={overTable}
              onTableClick={onTableClick}
              onSeatClick={onSeatClick}
              onDragStartGuest={() => undefined}
              onDragEnd={() => setOverTable(null)}
              onOverTable={setOverTable}
              onDropGuest={(tableId, guestId) => placeGuest(guestId, tableId)}
            />
            <ul className="sw-legend" aria-label="Party colours">
              {Object.keys(PARTY_COLORS).map((p) => (
                <li key={p}>
                  <PartyDot party={p} />
                  {p}
                </li>
              ))}
              <li>
                <span className="sw-dot is-empty" aria-hidden="true" />
                Empty seat
              </li>
            </ul>
          </div>

          <aside className="sw-side" aria-label="Plan details">
            <section className="sw-card" aria-labelledby="rules-h">
              <h2 id="rules-h">
                The couple&apos;s rules
                <span className={`sw-pill${broken.length ? " is-bad" : " is-good"}`}>
                  {broken.length ? `${broken.length} broken` : "all kept"}
                </span>
              </h2>
              <ul className="sw-rules">
                {rules.map((r) => (
                  <li key={r.id} className={`sw-rule is-${r.status}`}>
                    <span className="sw-rule-icon" aria-hidden="true">
                      {r.status === "ok" ? "✓" : r.status === "broken" ? "!" : "…"}
                    </span>
                    <div>
                      <p className="sw-rule-title">
                        <span className="sr-only">
                          {r.status === "ok" ? "Kept. " : r.status === "broken" ? "Broken. " : "Waiting. "}
                        </span>
                        {r.title}
                      </p>
                      <p className="sw-rule-detail">{r.detail}</p>
                      <p className="sw-rule-note">{r.note}</p>
                      {r.status === "broken" && r.tableIds[0] ? (
                        <button type="button" className="sw-link" onClick={() => setSelectedTable(r.tableIds[0] ?? null)}>
                          Show {r.tableIds.map((t) => tableById.get(t)?.name).join(", ")}
                        </button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="sw-card" aria-labelledby="table-h">
              {selected ? (
                <>
                  <h2 id="table-h">
                    {selected.name}
                    <span className="sw-pill">
                      {selectedGuests.length} of {selected.seats} seats
                    </span>
                  </h2>
                  {brokenTables.has(selected.id) ? (
                    <p className="sw-warnline">A rule is broken at this table.</p>
                  ) : null}
                  {selectedDiets.length > 0 ? (
                    <p className="sw-dietline">
                      <span>Dietary needs: </span>
                      {selectedDiets.map((d) => `${d.count} ${d.diet}`).join(", ")}
                    </p>
                  ) : (
                    <p className="sw-dietline">No dietary needs at this table.</p>
                  )}
                  <ol className="sw-seatlist">
                    {Array.from({ length: selected.seats }, (_, i) => {
                      const g = selectedGuests[i];
                      if (!g) {
                        return (
                          <li key={`e-${i}`} className="sw-seatrow is-empty">
                            <span className="sw-seatno">{i + 1}</span>
                            <span className="sw-empty-text">Empty seat</span>
                            {armed ? (
                              <button type="button" className="sw-btn is-primary" onClick={() => placeGuest(armed, selected.id)}>
                                Seat {armedGuest?.name.split(" ")[0]} here
                              </button>
                            ) : null}
                          </li>
                        );
                      }
                      return (
                        <li key={g.id} className="sw-seatrow">
                          <span className="sw-seatno">{i + 1}</span>
                          <span className="sw-seatguest">
                            <span className="sw-chip-name">
                              <PartyDot party={g.party} />
                              {g.name}
                            </span>
                            <span className="sw-chip-sub">
                              {g.party}
                              {g.rsvp !== "yes" ? ` · ${RSVP_LABEL[g.rsvp]}` : ""}
                            </span>
                            <span className="sw-tags">
                              {g.diet ? <span className="sw-tag">{g.diet}</span> : null}
                              {brokenGuests.has(g.id) ? <span className="sw-tag is-bad">Rule broken</span> : null}
                            </span>
                          </span>
                          <span className="sw-seatactions">
                            <label className="sr-only" htmlFor={`mv-${g.id}`}>
                              Move {g.name} to another table
                            </label>
                            <select
                              id={`mv-${g.id}`}
                              className="sw-select is-small"
                              value=""
                              onChange={(e) => {
                                if (e.target.value) placeGuest(g.id, e.target.value);
                              }}
                            >
                              <option value="">Move to…</option>
                              {TABLES.filter((t) => t.id !== selected.id).map((t) => {
                                const n = guestsAt(assignments, t.id).length;
                                return (
                                  <option key={t.id} value={t.id} disabled={n >= t.seats}>
                                    {t.name} ({n}/{t.seats}){n >= t.seats ? " full" : ""}
                                  </option>
                                );
                              })}
                            </select>
                            <button type="button" className="sw-btn" onClick={() => placeGuest(g.id, null)}>
                              Unseat
                              <span className="sr-only"> {g.name}</span>
                            </button>
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </>
              ) : (
                <>
                  <h2 id="table-h">Table details</h2>
                  <p className="sw-sub">Select a table to see its guests and their dietary needs.</p>
                </>
              )}
            </section>

            <section
              className={`sw-card sw-unseated${overUnseated ? " is-over" : ""}`}
              aria-labelledby="un-h"
              onDragOver={(e) => {
                e.preventDefault();
                setOverUnseated(true);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOverUnseated(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setOverUnseated(false);
                const gid = e.dataTransfer.getData("text/plain");
                if (gid && guestById.has(gid)) placeGuest(gid, null);
              }}
            >
              <h2 id="un-h">
                Needs a seat
                <span className={`sw-pill${unseatedConfirmed.length ? " is-warn" : " is-good"}`}>{unseatedConfirmed.length}</span>
              </h2>
              {unseatedConfirmed.length === 0 ? (
                <p className="sw-sub">Everyone attending has a seat.</p>
              ) : (
                <ul className="sw-chips">{unseatedConfirmed.map(chip)}</ul>
              )}
              {unseatedAwaiting.length > 0 ? (
                <>
                  <h3>Awaiting a reply ({unseatedAwaiting.length})</h3>
                  <ul className="sw-chips">{unseatedAwaiting.map(chip)}</ul>
                </>
              ) : null}
              <p className="sw-hint">
                Drop a guest here to unseat them.{declined > 0 ? ` ${declined} declined and are not listed.` : ""}
              </p>
            </section>
          </aside>
        </div>
      </div>
    </AppFrame>
  );
}
```

```tsx src/components/GuestsView.tsx
"use client";

import { useMemo, useState } from "react";
import { AppFrame } from "@/components/AppFrame";
import { usePlan } from "@/components/PlanProvider";
import { FALLBACK_COLOR, GUESTS, PARTY_COLORS, RSVP_LABEL, type Rsvp } from "@/lib/data";
import { tableById } from "@/lib/plan";

const PARTIES = Array.from(new Set(GUESTS.map((g) => g.party)));
const DIETS = Array.from(new Set(GUESTS.map((g) => g.diet).filter((d): d is string => d !== null))).sort();
const RSVPS: Rsvp[] = ["yes", "maybe", "pending", "no"];

export function GuestsView() {
  const { assignments } = usePlan();
  const [query, setQuery] = useState("");
  const [party, setParty] = useState("");
  const [rsvp, setRsvp] = useState("");
  const [diet, setDiet] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GUESTS.filter((g) => {
      if (q && !g.name.toLowerCase().includes(q)) return false;
      if (party && g.party !== party) return false;
      if (rsvp && g.rsvp !== rsvp) return false;
      if (diet === "__none") return g.diet === null;
      if (diet && g.diet !== diet) return false;
      return true;
    });
  }, [query, party, rsvp, diet]);

  const meals = useMemo(() => {
    const rows = ["Standard menu", ...DIETS].map((meal) => {
      const match = (d: string | null) => (meal === "Standard menu" ? d === null : d === meal);
      const confirmed = GUESTS.filter((g) => g.rsvp === "yes" && match(g.diet)).length;
      const awaiting = GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && match(g.diet)).length;
      return { meal, confirmed, awaiting };
    });
    return {
      rows,
      confirmed: rows.reduce((n, r) => n + r.confirmed, 0),
      awaiting: rows.reduce((n, r) => n + r.awaiting, 0),
    };
  }, []);

  const filtersOn = query !== "" || party !== "" || rsvp !== "" || diet !== "";

  return (
    <AppFrame>
      <div className="sw-page">
        <div className="sw-titlebar">
          <div>
            <h1>Guest list</h1>
            <p className="sw-sub">Search and filter the list, see where everyone sits, and hand the meal counts to the caterer.</p>
          </div>
        </div>

        <div className="sw-guests">
          <section className="sw-card sw-guests-main" aria-labelledby="gl-h">
            <h2 id="gl-h" className="sr-only">
              Guests
            </h2>
            <form className="sw-filters" role="search" aria-label="Filter guests" onSubmit={(e) => e.preventDefault()}>
              <div className="sw-field is-wide">
                <label htmlFor="q">Search by name</label>
                <input id="q" type="search" className="sw-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. Carvalho" />
              </div>
              <div className="sw-field">
                <label htmlFor="party">Party</label>
                <select id="party" className="sw-select" value={party} onChange={(e) => setParty(e.target.value)}>
                  <option value="">All parties</option>
                  {PARTIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sw-field">
                <label htmlFor="rsvp">RSVP</label>
                <select id="rsvp" className="sw-select" value={rsvp} onChange={(e) => setRsvp(e.target.value)}>
                  <option value="">Any RSVP</option>
                  {RSVPS.map((r) => (
                    <option key={r} value={r}>
                      {RSVP_LABEL[r]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sw-field">
                <label htmlFor="diet">Diet</label>
                <select id="diet" className="sw-select" value={diet} onChange={(e) => setDiet(e.target.value)}>
                  <option value="">Any diet</option>
                  <option value="__none">No dietary needs</option>
                  {DIETS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="sw-btn"
                disabled={!filtersOn}
                onClick={() => {
                  setQuery("");
                  setParty("");
                  setRsvp("");
                  setDiet("");
                }}
              >
                Clear filters
              </button>
            </form>

            <p className="sw-count" role="status" aria-live="polite">
              Showing {filtered.length} of {GUESTS.length} guests
            </p>

            {filtered.length === 0 ? (
              <p className="sw-empty">No guests match these filters.</p>
            ) : (
              <div className="sw-tablewrap">
                <table className="sw-grid">
                  <caption className="sr-only">Guest list with party, RSVP, diet and table</caption>
                  <thead>
                    <tr>
                      <th scope="col">Guest</th>
                      <th scope="col">Party</th>
                      <th scope="col">RSVP</th>
                      <th scope="col">Diet</th>
                      <th scope="col">Table</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((g) => {
                      const tid = assignments[g.id];
                      const c = PARTY_COLORS[g.party] ?? FALLBACK_COLOR;
                      return (
                        <tr key={g.id}>
                          <th scope="row">{g.name}</th>
                          <td>
                            <span className="sw-dot" style={{ background: c.bg, borderColor: c.edge }} aria-hidden="true" />
                            {g.party}
                          </td>
                          <td>
                            <span className={`sw-tag is-rsvp-${g.rsvp}`}>{RSVP_LABEL[g.rsvp]}</span>
                          </td>
                          <td>{g.diet ?? <span className="sw-muted">None</span>}</td>
                          <td>
                            {tid ? (
                              tableById.get(tid)?.name
                            ) : g.rsvp === "yes" ? (
                              <span className="sw-tag is-warn">Not seated</span>
                            ) : (
                              <span className="sw-muted">Not seated</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <aside className="sw-card sw-meals" aria-labelledby="meals-h">
            <h2 id="meals-h">Meals for the caterer</h2>
            <p className="sw-sub">Counted from RSVPs, whatever the filters say. Declined guests are left out.</p>
            <table className="sw-grid is-compact">
              <caption className="sr-only">Meal counts by dietary need</caption>
              <thead>
                <tr>
                  <th scope="col">Meal</th>
                  <th scope="col" className="num">
                    Attending
                  </th>
                  <th scope="col" className="num">
                    Awaiting
                  </th>
                </tr>
              </thead>
              <tbody>
                {meals.rows.map((r) => (
                  <tr key={r.meal}>
                    <th scope="row">{r.meal}</th>
                    <td className="num">{r.confirmed}</td>
                    <td className="num">{r.awaiting}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row">Total</th>
                  <td className="num">{meals.confirmed}</td>
                  <td className="num">{meals.awaiting}</td>
                </tr>
              </tfoot>
            </table>
            <p className="sw-hint">Awaiting means maybe or no reply yet.</p>
          </aside>
        </div>
      </div>
    </AppFrame>
  );
}
```

```tsx src/app/page.tsx
import type { Metadata } from "next";
import { PlanView } from "@/components/PlanView";

export const metadata: Metadata = {
  title: "Seating plan · Seatwise",
  description: "Build the seating plan for Ines & Mateo's wedding dinner.",
};

export default function Page() {
  return <PlanView />;
}
```

```tsx src/app/guests/page.tsx
import type { Metadata } from "next";
import { GuestsView } from "@/components/GuestsView";

export const metadata: Metadata = {
  title: "Guest list · Seatwise",
  description: "Search, filter and count the guests for Ines & Mateo's wedding dinner.",
};

export default function Page() {
  return <GuestsView />;
}
```

```tsx src/app/layout.tsx
import '@once-ui-system/core/css/styles.css';
import '@once-ui-system/core/css/tokens.css';
import '@/resources/custom.css'
import '@/resources/seatwise.css'

import classNames from "classnames";

import { baseURL, landing, fonts, style, dataStyle } from "@/resources";
import { Meta, Schema,  Column, Flex, ThemeInit } from "@once-ui-system/core";
import { LocaleProvider, Providers } from '@/components';
import { PlanProvider } from '@/components/PlanProvider';
import { getLocale } from '@/lib/i18n/server';

export async function generateMetadata() {
  return Meta.generate({
    title: landing.home.title,
    description: landing.home.description,
    baseURL: baseURL,
    // The site-wide defaults. No canonical here: each page names its own, and
    // a default would point every page that doesn't at the landing page.
    image: landing.home.image,
  });
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <Flex
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      as="html"
      lang={locale}
      fillWidth
      className={classNames(
        fonts.heading.variable,
        fonts.body.variable,
        fonts.label.variable,
        fonts.code.variable,
      )}
    >
      <head>
        {/* A sync <script> is only allowed inside the document head; React 19.2
            refuses one rendered as a bare child of <html>. */}
        <Schema
          as="webPage"
          baseURL={baseURL}
          title={landing.home.title}
          description={landing.home.description}
          path={landing.home.path}
        />
        <ThemeInit
          config={{
            theme: 'system',
            brand: style.brand,
            accent: style.accent,
            neutral: style.neutral,
            solid: style.solid,
            'solid-style': style.solidStyle,
            border: style.border,
            surface: style.surface,
            transition: style.transition,
            scaling: style.scaling,
            'viz-style': dataStyle.variant,
          }}
        />
      </head>
      <LocaleProvider locale={locale}>
        <Providers>
          <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
            <Column fillWidth horizontal="center" flex={1}>
              <PlanProvider>{children}</PlanProvider>
            </Column>
          </Column>
        </Providers>
      </LocaleProvider>
    </Flex>
  );
}
```

```css src/resources/seatwise.css
.sw-app {
  --sw-bg: #f4efe6;
  --sw-surface: #fffdf9;
  --sw-line: #e3dacb;
  --sw-line-strong: #cfc3ae;
  --sw-ink: #26221d;
  --sw-muted: #665e52;
  --sw-accent: #2c5a4d;
  --sw-accent-soft: #dcebe4;
  --sw-bad: #a93a26;
  --sw-bad-soft: #f8dfd8;
  --sw-warn-soft: #fbe9c8;
  --sw-warn: #764700;
  --sw-good: #2a6535;
  --sw-good-soft: #dcefdc;
  width: 100%;
  min-height: 100vh;
  background: var(--sw-bg);
  color: var(--sw-ink);
  color-scheme: light;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: 15px;
  line-height: 1.45;
}
.sw-app *, .sw-app *::before, .sw-app *::after { box-sizing: border-box; }
.sw-app h1, .sw-app h2, .sw-app h3 { margin: 0; font-weight: 650; }
.sw-app h1 { font-family: ui-serif, Georgia, "Times New Roman", serif; font-size: 28px; letter-spacing: -0.01em; }
.sw-app h2 { font-size: 16px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.sw-app h3 { font-size: 13px; color: var(--sw-muted); margin: 14px 0 6px; text-transform: uppercase; letter-spacing: 0.04em; }
.sw-app p { margin: 0; }
.sw-app button, .sw-app select, .sw-app input { font: inherit; color: inherit; }
.sw-app :focus-visible { outline: 3px solid #1f6feb; outline-offset: 2px; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

.sw-skip { position: absolute; left: -9999px; top: 8px; background: #fff; padding: 8px 12px; border-radius: 8px; z-index: 50; color: var(--sw-ink); }
.sw-skip:focus { left: 8px; }

/* header */
.sw-header { background: var(--sw-surface); border-bottom: 1px solid var(--sw-line); position: sticky; top: 0; z-index: 20; }
.sw-header-inner { max-width: 1480px; margin: 0 auto; padding: 10px 16px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.sw-brand { display: inline-flex; align-items: center; gap: 10px; font-family: ui-serif, Georgia, serif; font-size: 20px; font-weight: 700; color: var(--sw-ink); text-decoration: none; }
.sw-mark { width: 26px; height: 26px; border-radius: 8px; background: var(--sw-accent); position: relative; display: inline-block; }
.sw-mark i { position: absolute; width: 6px; height: 6px; border-radius: 50%; background: #fffdf9; }
.sw-mark i:nth-child(1) { left: 10px; top: 4px; }
.sw-mark i:nth-child(2) { left: 4px; top: 15px; }
.sw-mark i:nth-child(3) { left: 16px; top: 15px; }
.sw-nav { display: flex; gap: 4px; }
.sw-navlink { padding: 8px 14px; border-radius: 999px; text-decoration: none; color: var(--sw-muted); font-weight: 550; min-height: 40px; display: inline-flex; align-items: center; }
.sw-navlink:hover { background: var(--sw-bg); color: var(--sw-ink); }
.sw-navlink[aria-current="page"] { background: var(--sw-accent); color: #fff; }
.sw-event { margin-left: auto; display: flex; flex-direction: column; text-align: right; font-size: 13px; color: var(--sw-muted); }
.sw-event strong { color: var(--sw-ink); font-size: 14px; }
.sw-user { display: flex; align-items: center; gap: 8px; }
.sw-avatar { width: 34px; height: 34px; border-radius: 50%; background: #f2d58a; color: #4a3500; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; }
.sw-user-name { font-size: 14px; font-weight: 550; }
@media (max-width: 1000px) { .sw-event { display: none; } .sw-user { margin-left: auto; } }
@media (max-width: 520px) { .sw-user-name { display: none; } }

.sw-main { width: 100%; }
.sw-page { max-width: 1480px; margin: 0 auto; padding: 20px 16px 48px; }
.sw-titlebar { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; margin-bottom: 14px; }
.sw-sub { color: var(--sw-muted); font-size: 14px; margin-top: 4px; }
.sw-muted { color: var(--sw-muted); }

/* stats */
.sw-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 12px; }
@media (max-width: 760px) { .sw-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.sw-stat { background: var(--sw-surface); border: 1px solid var(--sw-line); border-radius: 14px; padding: 12px 14px; display: flex; flex-direction: column; gap: 2px; }
.sw-stat-num { font-size: 28px; font-weight: 700; font-family: ui-serif, Georgia, serif; line-height: 1.1; }
.sw-stat-num small { font-size: 14px; font-weight: 500; color: var(--sw-muted); font-family: inherit; }
.sw-stat-label { font-size: 13px; color: var(--sw-muted); }
.sw-stat.is-warn { background: var(--sw-warn-soft); border-color: #ecce93; }
.sw-stat.is-warn .sw-stat-num { color: var(--sw-warn); }
.sw-stat.is-bad { background: var(--sw-bad-soft); border-color: #e8b3a6; }
.sw-stat.is-bad .sw-stat-num { color: var(--sw-bad); }
.sw-stat.is-good .sw-stat-num { color: var(--sw-good); }

.sw-notice { min-height: 22px; font-size: 14px; color: var(--sw-accent); font-weight: 550; margin-bottom: 4px; }
.sw-armed { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #1f3d34; color: #fff; border-radius: 12px; padding: 10px 14px; margin-bottom: 12px; }
.sw-armed .sw-btn { background: transparent; color: #fff; border-color: rgba(255, 255, 255, 0.6); }

/* layout */
.sw-plan { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; align-items: start; }
@media (min-width: 1100px) { .sw-plan { grid-template-columns: minmax(0, 1fr) 380px; } .sw-side { max-height: calc(100vh - 100px); overflow-y: auto; position: sticky; top: 76px; padding-right: 2px; } }
.sw-side { display: flex; flex-direction: column; gap: 14px; }
.sw-card { background: var(--sw-surface); border: 1px solid var(--sw-line); border-radius: 16px; padding: 14px 16px; }
.sw-card h2 { margin-bottom: 8px; }
.sw-pill { font-size: 12px; font-weight: 650; padding: 2px 10px; border-radius: 999px; background: var(--sw-bg); color: var(--sw-muted); border: 1px solid var(--sw-line); }
.sw-pill.is-bad { background: var(--sw-bad-soft); color: var(--sw-bad); border-color: #e8b3a6; }
.sw-pill.is-good { background: var(--sw-good-soft); color: var(--sw-good); border-color: #b7d9b9; }
.sw-pill.is-warn { background: var(--sw-warn-soft); color: var(--sw-warn); border-color: #ecce93; }

/* room */
.sw-roomwrap { overflow-x: auto; background: var(--sw-surface); border: 1px solid var(--sw-line); border-radius: 16px; padding: 12px; }
.sw-room {
  position: relative; width: 100%; min-width: 720px; aspect-ratio: 24 / 14; container-type: inline-size;
  background: #fbf7ee; border: 4px solid #8a7b64; border-radius: 6px;
  background-image: linear-gradient(#f0e8d8 1px, transparent 1px), linear-gradient(90deg, #f0e8d8 1px, transparent 1px);
  background-size: calc(100% / 24) calc(100% / 14);
}
.sw-fixture { position: absolute; display: flex; align-items: center; justify-content: center; font-size: max(10px, 1.25cqw); font-weight: 650; text-align: center; color: #4a4033; border-radius: 6px; }
.sw-fx-stage { background: #3b3a48; color: #fff; border-radius: 6px 6px 14px 14px; }
.sw-fx-dancefloor { background: repeating-conic-gradient(#e6d9bd 0 25%, #f3ead6 0 50%) 0 0 / 3.4cqw 3.4cqw; border: 2px solid #d3c3a0; color: #5a4a2d; }
.sw-fx-bar { background: #7a5236; color: #fff; }
.sw-fx-door { background: #7fb59a; border-radius: 0 4px 4px 0; justify-content: flex-start; overflow: visible; }
.sw-fx-door span { position: absolute; left: 100%; margin-left: 4px; writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; color: #2c5a4d; }

.sw-zone { position: absolute; border-radius: 50%; }
.sw-zone.is-over { background: rgba(44, 90, 77, 0.14); outline: 3px dashed var(--sw-accent); }
.sw-zone.is-over.is-full { background: rgba(169, 58, 38, 0.12); outline-color: var(--sw-bad); }
.sw-zone.is-armed:not(.is-over) { outline: 2px dotted rgba(44, 90, 77, 0.45); }

.sw-table { position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fff; border: 2px solid #b9aa90; color: var(--sw-ink); cursor: pointer; padding: 0; line-height: 1.15; box-shadow: 0 1px 2px rgba(60, 45, 20, 0.12); }
.sw-table.is-round { border-radius: 50%; }
.sw-table.is-long { border-radius: 8px; flex-direction: row; gap: 0.8cqw; }
.sw-table:hover { border-color: var(--sw-accent); }
.sw-table.is-selected { border-color: var(--sw-accent); box-shadow: 0 0 0 3px var(--sw-accent-soft), 0 0 0 5px var(--sw-accent); }
.sw-table.is-broken { border-color: var(--sw-bad); background: #fff5f2; }
.sw-table.is-broken.is-selected { box-shadow: 0 0 0 3px var(--sw-bad-soft), 0 0 0 5px var(--sw-bad); }
.sw-table-name { font-size: max(10px, 1.3cqw); font-weight: 700; }
.sw-table-count { font-size: max(9px, 1.1cqw); color: var(--sw-muted); }
.sw-flag { position: absolute; transform: translate(-50%, -50%); width: 2.4cqw; height: 2.4cqw; min-width: 18px; min-height: 18px; border-radius: 50%; background: var(--sw-bad); color: #fff; font-weight: 800; font-size: max(11px, 1.4cqw); display: flex; align-items: center; justify-content: center; border: 2px solid #fff; pointer-events: none; }

.sw-seat { position: absolute; transform: translate(-50%, -50%); width: 3.3cqw; height: 3.3cqw; min-width: 22px; min-height: 22px; border-radius: 50%; border: 2px solid; padding: 0; font-size: max(8px, 1.05cqw); font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.sw-seat.is-empty { background: transparent; border: 2px dashed #b9aa90; color: transparent; }
.sw-seat.is-empty:hover { border-color: var(--sw-accent); background: var(--sw-accent-soft); }
.sw-seat.is-taken { cursor: grab; }
.sw-seat.is-provisional { border-style: dashed; }
.sw-seat.is-armed-seat { box-shadow: 0 0 0 3px #1f3d34; }

.sw-legend { list-style: none; margin: 10px 2px 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 13px; color: var(--sw-muted); }
.sw-legend li { display: inline-flex; align-items: center; gap: 6px; }
.sw-dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; border: 2px solid; margin-right: 6px; vertical-align: -1px; flex: none; }
.sw-legend .sw-dot { margin-right: 0; }
.sw-dot.is-empty { background: transparent; border: 2px dashed #b9aa90; }

/* rules */
.sw-rules { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.sw-rule { display: flex; gap: 10px; padding: 10px; border-radius: 12px; border: 1px solid var(--sw-line); }
.sw-rule.is-broken { background: var(--sw-bad-soft); border-color: #e8b3a6; }
.sw-rule.is-waiting { background: var(--sw-warn-soft); border-color: #ecce93; }
.sw-rule.is-ok { background: #f4faf4; border-color: #cfe5d0; }
.sw-rule-icon { flex: none; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; color: #fff; background: var(--sw-good); }
.sw-rule.is-broken .sw-rule-icon { background: var(--sw-bad); }
.sw-rule.is-waiting .sw-rule-icon { background: #a86b00; }
.sw-rule-title { font-weight: 650; font-size: 14px; }
.sw-rule-detail { font-size: 13px; margin-top: 2px; }
.sw-rule-note { font-size: 12.5px; color: var(--sw-muted); margin-top: 2px; font-style: italic; }
.sw-link { background: none; border: 0; padding: 4px 0; color: var(--sw-accent); text-decoration: underline; cursor: pointer; font-size: 13px; min-height: 32px; }

/* table detail */
.sw-warnline { background: var(--sw-bad-soft); color: var(--sw-bad); border-radius: 8px; padding: 6px 10px; font-size: 13px; font-weight: 600; margin-bottom: 8px; }
.sw-dietline { font-size: 13px; margin-bottom: 8px; }
.sw-dietline span { font-weight: 650; }
.sw-seatlist { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.sw-seatrow { display: flex; gap: 10px; align-items: flex-start; padding: 8px 0; border-top: 1px solid var(--sw-line); }
.sw-seatrow:first-child { border-top: 0; }
.sw-seatno { flex: none; width: 22px; height: 22px; border-radius: 50%; background: var(--sw-bg); font-size: 12px; font-weight: 650; display: flex; align-items: center; justify-content: center; color: var(--sw-muted); margin-top: 2px; }
.sw-seatguest { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.sw-seatactions { display: flex; flex-direction: column; gap: 6px; align-items: stretch; }
.sw-empty-text { color: var(--sw-muted); font-style: italic; flex: 1; padding-top: 2px; }
.sw-seatrow.is-empty { align-items: center; }
.sw-tags { display: flex; flex-wrap: wrap; gap: 4px; }

/* chips */
.sw-chips { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.sw-chip { width: 100%; display: flex; align-items: center; gap: 8px; text-align: left; background: #fff; border: 1px solid var(--sw-line-strong); border-radius: 12px; padding: 8px 10px; cursor: grab; min-height: 48px; }
.sw-chip:hover { border-color: var(--sw-accent); }
.sw-chip.is-armed { background: var(--sw-accent-soft); border-color: var(--sw-accent); box-shadow: 0 0 0 2px var(--sw-accent); }
.sw-chip.has-rule { border-left: 4px solid var(--sw-bad); }
.sw-chip-text { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.sw-chip-name { font-weight: 600; font-size: 14px; }
.sw-chip-sub { font-size: 12.5px; color: var(--sw-muted); }
.sw-unseated.is-over { outline: 3px dashed var(--sw-accent); background: var(--sw-accent-soft); }
.sw-hint { font-size: 12.5px; color: var(--sw-muted); margin-top: 10px; }

.sw-tag { display: inline-block; font-size: 12px; font-weight: 600; padding: 1px 8px; border-radius: 999px; background: #efe7d7; color: #4d4331; white-space: nowrap; align-self: flex-start; }
.sw-tag.is-bad { background: var(--sw-bad-soft); color: var(--sw-bad); }
.sw-tag.is-warn { background: var(--sw-warn-soft); color: var(--sw-warn); }
.sw-tag.is-rsvp-yes { background: var(--sw-good-soft); color: var(--sw-good); }
.sw-tag.is-rsvp-maybe { background: var(--sw-warn-soft); color: var(--sw-warn); }
.sw-tag.is-rsvp-pending { background: #e8e8f3; color: #3a3a6a; }
.sw-tag.is-rsvp-no { background: #ece7de; color: #5a5348; }

/* controls */
.sw-btn { background: var(--sw-surface); border: 1px solid var(--sw-line-strong); border-radius: 10px; padding: 8px 12px; font-weight: 600; cursor: pointer; min-height: 40px; font-size: 14px; }
.sw-btn:hover:not(:disabled) { border-color: var(--sw-accent); }
.sw-btn:disabled { opacity: 0.5; cursor: default; }
.sw-btn.is-primary { background: var(--sw-accent); color: #fff; border-color: var(--sw-accent); }
.sw-select, .sw-input { width: 100%; background: #fff; border: 1px solid var(--sw-line-strong); border-radius: 10px; padding: 8px 10px; min-height: 42px; }
.sw-select.is-small { min-height: 36px; padding: 4px 8px; font-size: 13px; }

/* guests page */
.sw-guests { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; align-items: start; }
@media (min-width: 1100px) { .sw-guests { grid-template-columns: minmax(0, 1fr) 360px; } .sw-meals { position: sticky; top: 76px; } }
.sw-filters { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; align-items: end; margin-bottom: 10px; }
.sw-field { display: flex; flex-direction: column; gap: 4px; }
.sw-field label { font-size: 12.5px; font-weight: 650; color: var(--sw-muted); }
.sw-field.is-wide { grid-column: span 2; }
@media (max-width: 480px) { .sw-field.is-wide { grid-column: span 1; } }
.sw-count { font-size: 13px; color: var(--sw-muted); margin: 6px 0 8px; }
.sw-empty { padding: 24px; text-align: center; color: var(--sw-muted); border: 1px dashed var(--sw-line-strong); border-radius: 12px; }
.sw-tablewrap { overflow-x: auto; }
.sw-grid { width: 100%; border-collapse: collapse; font-size: 14px; }
.sw-grid th, .sw-grid td { text-align: left; padding: 9px 10px; border-bottom: 1px solid var(--sw-line); vertical-align: middle; }
.sw-grid thead th { font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--sw-muted); background: var(--sw-bg); position: sticky; top: 0; }
.sw-grid tbody th { font-weight: 600; }
.sw-grid .num { text-align: right; font-variant-numeric: tabular-nums; }
.sw-grid tfoot th, .sw-grid tfoot td { font-weight: 700; border-top: 2px solid var(--sw-line-strong); border-bottom: 0; }
.sw-grid.is-compact th, .sw-grid.is-compact td { padding: 7px 8px; }
.sw-meals .sw-sub { margin-bottom: 10px; }

@media (prefers-reduced-motion: no-preference) {
  .sw-table, .sw-seat, .sw-chip { transition: box-shadow 0.12s, border-color 0.12s, background 0.12s; }
}
```
