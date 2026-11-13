```ts lib/data.ts
export type Rsvp = "yes" | "maybe" | "pending" | "no";
export type FixtureKind = "stage" | "dancefloor" | "bar" | "door";
export type RuleKind = "together" | "apart" | "near";

export type Fixture = {
  id: string;
  kind: FixtureKind;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type PlanTable = {
  id: string;
  name: string;
  shape: "round" | "long";
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
  kind: RuleKind;
  guests: string[];
  note: string;
  /** near rules: the fixture kind to be close to, the one to stay away from, and the reach in metres */
  nearKind?: FixtureKind;
  awayKind?: FixtureKind;
  withinM?: number;
};

export const APP = "Seatwise, a seating planner for wedding and event planners";

export const EVENT = {
  name: "Ines & Mateo's wedding dinner",
  date: "2027-06-19",
  venue: "The Orangery, Hollin Hall",
  room_m: { width: 24, depth: 14 },
};

export const PLANNER = { name: "Hannah Brook" };

export const ROOM = { width: EVENT.room_m.width, depth: EVENT.room_m.depth };

export const FIXTURES: Fixture[] = [
  { id: "f-1", kind: "stage", label: "Band", x: 10, y: 0.5, w: 4, h: 2 },
  { id: "f-2", kind: "dancefloor", label: "Dance floor", x: 8.5, y: 3, w: 7, h: 4 },
  { id: "f-3", kind: "bar", label: "Bar", x: 21, y: 10, w: 2.5, h: 3.5 },
  { id: "f-4", kind: "door", label: "Garden doors", x: 0, y: 6, w: 0.5, h: 2.5 },
];

export const TABLES: PlanTable[] = [
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
    nearKind: "door",
    awayKind: "stage",
    withinM: 4,
  },
];

/* ---------- derived constants and helpers ---------- */

export const GUEST_BY_ID: Record<string, Guest> = Object.fromEntries(GUESTS.map((g) => [g.id, g]));
export const TABLE_BY_ID: Record<string, PlanTable> = Object.fromEntries(TABLES.map((t) => [t.id, t]));
export const TOTAL_SEATS = TABLES.reduce((n, t) => n + t.seats, 0);
export const PARTIES = Array.from(new Set(GUESTS.map((g) => g.party)));
export const DIETS = Array.from(new Set(GUESTS.flatMap((g) => (g.diet ? [g.diet] : [])))).sort();
export const MEAL_STANDARD = "Standard menu";

export const SEAT_D = 0.8; // seat diameter in metres
export const LONG_W = 8; // long table length in metres
export const LONG_D = 0.9; // long table depth in metres

export function tableRadius(t: PlanTable): number {
  return t.seats >= 8 ? 0.95 : 0.85;
}

/** Round tables: x, y is the centre. Long table: x, y is the top-left corner, seats on the room-facing side. */
export function tableCentre(t: PlanTable): { x: number; y: number } {
  return t.shape === "long" ? { x: t.x + LONG_W / 2, y: t.y + LONG_D / 2 } : { x: t.x, y: t.y };
}

export function fixtureCentre(f: Fixture): { x: number; y: number } {
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

export function seatPositions(t: PlanTable): { x: number; y: number }[] {
  if (t.shape === "long") {
    return Array.from({ length: t.seats }, (_, i) => ({
      x: t.x + (i + 0.5) * (LONG_W / t.seats),
      y: t.y + LONG_D + 0.55,
    }));
  }
  const r = tableRadius(t) + 0.55;
  return Array.from({ length: t.seats }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
    return { x: t.x + r * Math.cos(a), y: t.y + r * Math.sin(a) };
  });
}

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const PARTY_HUE: Record<string, number> = {
  Couple: 20,
  "Bride's family": 350,
  "Groom's family": 265,
  "University friends": 165,
  "Work friends": 100,
  "Groom's football club": 225,
  "Plus-ones": 60,
};

export function partyStyle(party: string): { backgroundColor: string; color: string; borderColor: string } {
  const h = PARTY_HUE[party] ?? 0;
  return {
    backgroundColor: `oklch(0.9 0.07 ${h})`,
    color: `oklch(0.3 0.08 ${h})`,
    borderColor: `oklch(0.72 0.1 ${h})`,
  };
}

export function dietTone(diet: string): string {
  if (diet === "Nut allergy") return "border-red-200 bg-red-50 text-red-800";
  if (diet === "Children's menu") return "border-sky-200 bg-sky-50 text-sky-800";
  return "border-amber-200 bg-amber-50 text-amber-900";
}

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Pending",
  no: "Declined",
};

export function rsvpTone(r: Rsvp): string {
  if (r === "yes") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (r === "maybe") return "border-amber-200 bg-amber-50 text-amber-900";
  if (r === "no") return "border-red-200 bg-red-50 text-red-800";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function formatEventDate(): string {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "full", timeZone: "UTC" }).format(
    new Date(`${EVENT.date}T12:00:00Z`),
  );
}
```

```ts lib/rules.ts
import {
  FIXTURES,
  GUEST_BY_ID,
  RULES,
  TABLE_BY_ID,
  fixtureCentre,
  tableCentre,
  type FixtureKind,
  type Rule,
} from "@/lib/data";

export type RuleStatus = "ok" | "broken" | "pending";

export type RuleResult = {
  index: number;
  rule: Rule;
  status: RuleStatus;
  title: string;
  detail: string;
  /** tables a broken rule should be flagged on */
  tables: string[];
  /** seated guests a broken rule should be flagged on */
  guestIds: string[];
};

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function fixtureOf(kind: FixtureKind) {
  return FIXTURES.find((f) => f.kind === kind);
}

export function evaluateRules(tableOf: Record<string, string | null>): RuleResult[] {
  return RULES.map((rule, index): RuleResult => {
    const guests = rule.guests.map((id) => GUEST_BY_ID[id]);
    const names = guests.map((g) => g.name);
    const joined = names.join(" & ");
    const unseated = guests.filter((g) => !tableOf[g.id]);
    const tableName = (id: string | null) => (id ? TABLE_BY_ID[id].name : "no table");

    if (rule.kind === "together") {
      const title = `Keep together: ${joined}`;
      if (unseated.length > 0) {
        return {
          index, rule, status: "pending", title,
          detail: `${unseated.map((g) => g.name).join(" and ")} not seated yet`,
          tables: [], guestIds: [],
        };
      }
      const ids = guests.map((g) => tableOf[g.id] as string);
      if (ids.every((t) => t === ids[0])) {
        return { index, rule, status: "ok", title, detail: `Both at ${tableName(ids[0])}`, tables: [], guestIds: [] };
      }
      return {
        index, rule, status: "broken", title,
        detail: guests.map((g) => `${g.name} (${tableName(tableOf[g.id])})`).join(" and ") + " are at different tables",
        tables: Array.from(new Set(ids)), guestIds: guests.map((g) => g.id),
      };
    }

    if (rule.kind === "apart") {
      const title = `Keep apart: ${joined}`;
      if (unseated.length > 0) {
        return {
          index, rule, status: "pending", title,
          detail: `${unseated.map((g) => g.name).join(" and ")} not seated yet`,
          tables: [], guestIds: [],
        };
      }
      const ids = guests.map((g) => tableOf[g.id] as string);
      if (ids.every((t) => t === ids[0])) {
        return {
          index, rule, status: "broken", title,
          detail: `${joined} are both at ${tableName(ids[0])}`,
          tables: [ids[0]], guestIds: guests.map((g) => g.id),
        };
      }
      return { index, rule, status: "ok", title, detail: "At different tables", tables: [], guestIds: [] };
    }

    // near
    const near = fixtureOf(rule.nearKind ?? "door");
    const away = fixtureOf(rule.awayKind ?? "stage");
    const within = rule.withinM ?? 4;
    const nearLabel = (near?.label ?? "fixture").toLowerCase();
    const awayLabel = (away?.label ?? "band").toLowerCase();
    const title = `Seat near the ${nearLabel}: ${joined}`;
    const guest = guests[0];
    const tid = tableOf[guest.id];
    if (!tid || !near) {
      return { index, rule, status: "pending", title, detail: `${guest.name} not seated yet`, tables: [], guestIds: [] };
    }
    const c = tableCentre(TABLE_BY_ID[tid]);
    const dNear = dist(c, fixtureCentre(near));
    const dAway = away ? dist(c, fixtureCentre(away)) : Infinity;
    if (dNear <= within && dNear < dAway) {
      return {
        index, rule, status: "ok", title,
        detail: `${tableName(tid)} is ${dNear.toFixed(1)} m from the ${nearLabel}`,
        tables: [], guestIds: [],
      };
    }
    const reason =
      dNear > within
        ? `${tableName(tid)} is ${dNear.toFixed(1)} m from the ${nearLabel} (needs ${within} m or less)`
        : `${tableName(tid)} is closer to the ${awayLabel} than to the ${nearLabel}`;
    return { index, rule, status: "broken", title, detail: `${guest.name}: ${reason}`, tables: [tid], guestIds: [guest.id] };
  });
}
```

```tsx components/use-drop.ts
"use client";

import { useState, type DragEvent } from "react";

export const GUEST_MIME = "application/x-seatwise-guest";

export function startGuestDrag(e: DragEvent<HTMLElement>, guestId: string) {
  e.dataTransfer.setData(GUEST_MIME, guestId);
  e.dataTransfer.setData("text/plain", guestId);
  e.dataTransfer.effectAllowed = "move";
}

export function useGuestDrop(onDropGuest: (guestId: string) => void) {
  const [over, setOver] = useState(false);
  const has = (e: DragEvent<HTMLElement>) => Array.from(e.dataTransfer.types).includes(GUEST_MIME);
  const props = {
    onDragEnter: (e: DragEvent<HTMLElement>) => {
      if (!has(e)) return;
      e.preventDefault();
      e.stopPropagation();
      setOver(true);
    },
    onDragOver: (e: DragEvent<HTMLElement>) => {
      if (!has(e)) return;
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";
      setOver(true);
    },
    onDragLeave: (e: DragEvent<HTMLElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
    },
    onDrop: (e: DragEvent<HTMLElement>) => {
      const id = e.dataTransfer.getData(GUEST_MIME);
      setOver(false);
      if (!id) return;
      e.preventDefault();
      e.stopPropagation();
      onDropGuest(id);
    },
  };
  return { over, props };
}
```

```tsx components/plan-provider.tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { GUESTS, GUEST_BY_ID, TABLES, TABLE_BY_ID, TOTAL_SEATS, type Guest } from "@/lib/data";
import { evaluateRules, type RuleResult } from "@/lib/rules";

export type Seats = Record<string, (string | null)[]>;

function initialSeats(): Seats {
  const s: Seats = {};
  for (const t of TABLES) s[t.id] = Array.from({ length: t.seats }, () => null as string | null);
  for (const g of GUESTS) {
    if (!g.table) continue;
    const row = s[g.table];
    const i = row.indexOf(null);
    if (i >= 0) row[i] = g.id;
  }
  return s;
}

function tableOfFromSeats(seats: Seats): Record<string, string | null> {
  const out: Record<string, string | null> = {};
  for (const g of GUESTS) out[g.id] = null;
  for (const t of TABLES) for (const id of seats[t.id]) if (id) out[id] = t.id;
  return out;
}

type PlanApi = {
  seats: Seats;
  tableOf: Record<string, string | null>;
  picked: string | null;
  selectedTable: string | null;
  pick: (id: string | null) => void;
  selectTable: (id: string | null) => void;
  place: (guestId: string, tableId: string, seatIdx?: number) => void;
  unseat: (guestId: string) => void;
  activateSeat: (tableId: string, idx: number) => void;
  activateTable: (tableId: string) => void;
  filled: (tableId: string) => number;
  rules: RuleResult[];
  brokenRules: RuleResult[];
  flaggedTables: Set<string>;
  flaggedGuests: Set<string>;
  seatedCount: number;
  attendingCount: number;
  openSeats: number;
  unseatedAttending: Guest[];
  unconfirmedUnseated: Guest[];
};

const PlanContext = createContext<PlanApi | null>(null);

export function usePlan(): PlanApi {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [seats, setSeats] = useState<Seats>(initialSeats);
  const [picked, setPicked] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const tableOf = useMemo(() => tableOfFromSeats(seats), [seats]);
  const rules = useMemo(() => evaluateRules(tableOf), [tableOf]);
  const brokenRules = useMemo(() => rules.filter((r) => r.status === "broken"), [rules]);
  const flaggedTables = useMemo(() => new Set(brokenRules.flatMap((r) => r.tables)), [brokenRules]);
  const flaggedGuests = useMemo(() => new Set(brokenRules.flatMap((r) => r.guestIds)), [brokenRules]);

  const seatedCount = useMemo(() => GUESTS.filter((g) => tableOf[g.id]).length, [tableOf]);
  const attendingCount = useMemo(() => GUESTS.filter((g) => g.rsvp === "yes").length, []);
  const unseatedAttending = useMemo(() => GUESTS.filter((g) => g.rsvp === "yes" && !tableOf[g.id]), [tableOf]);
  const unconfirmedUnseated = useMemo(
    () => GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !tableOf[g.id]),
    [tableOf],
  );

  const filled = useCallback((tableId: string) => seats[tableId].filter(Boolean).length, [seats]);

  const place = useCallback(
    (guestId: string, tableId: string, seatIdx?: number) => {
      const guest = GUEST_BY_ID[guestId];
      const table = TABLE_BY_ID[tableId];
      if (!guest || !table || guest.rsvp === "no") return;
      const row = seats[tableId];
      let from: { table: string; idx: number } | null = null;
      for (const t of TABLES) {
        const i = seats[t.id].indexOf(guestId);
        if (i >= 0) {
          from = { table: t.id, idx: i };
          break;
        }
      }
      if (seatIdx === undefined && from && from.table === tableId) return;
      const target = seatIdx ?? row.indexOf(null);
      if (target < 0) {
        toast.error(`${table.name} is full`, {
          description: `All ${table.seats} seats are taken. Choose another table, or tap an occupied seat to swap.`,
        });
        return;
      }
      const occupant = row[target];
      if (occupant === guestId) return;

      const next: Seats = {};
      for (const t of TABLES) next[t.id] = [...seats[t.id]];
      if (from) next[from.table][from.idx] = occupant;
      next[tableId][target] = guestId;

      const before = new Set(rules.filter((r) => r.status === "broken").map((r) => r.index));
      const newlyBroken = evaluateRules(tableOfFromSeats(next)).filter(
        (r) => r.status === "broken" && !before.has(r.index),
      );

      let msg: string;
      if (occupant && from) msg = `${guest.name} and ${GUEST_BY_ID[occupant].name} swapped seats`;
      else if (occupant) msg = `${guest.name} seated at ${table.name}; ${GUEST_BY_ID[occupant].name} is now unseated`;
      else if (from) msg = `${guest.name} moved to ${table.name}, seat ${target + 1}`;
      else msg = `${guest.name} seated at ${table.name}, seat ${target + 1}`;

      setSeats(next);
      if (newlyBroken.length > 0) toast.warning(msg, { description: `Rule broken. ${newlyBroken[0].detail}` });
      else toast.success(msg);
    },
    [seats, rules],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const guest = GUEST_BY_ID[guestId];
      if (!guest) return;
      let found = false;
      const next: Seats = {};
      for (const t of TABLES) {
        next[t.id] = seats[t.id].map((id) => {
          if (id === guestId) {
            found = true;
            return null;
          }
          return id;
        });
      }
      if (!found) return;
      setSeats(next);
      setPicked((p) => (p === guestId ? null : p));
      toast(`${guest.name} unseated`);
    },
    [seats],
  );

  const activateSeat = useCallback(
    (tableId: string, idx: number) => {
      const occupant = seats[tableId][idx];
      if (picked) {
        if (picked === occupant) {
          setPicked(null);
          return;
        }
        place(picked, tableId, idx);
        setPicked(null);
        setSelectedTable(tableId);
        return;
      }
      setSelectedTable(tableId);
      if (occupant) setPicked(occupant);
    },
    [seats, picked, place],
  );

  const activateTable = useCallback(
    (tableId: string) => {
      if (picked) {
        place(picked, tableId);
        setPicked(null);
      }
      setSelectedTable(tableId);
    },
    [picked, place],
  );

  const value: PlanApi = {
    seats,
    tableOf,
    picked,
    selectedTable,
    pick: setPicked,
    selectTable: setSelectedTable,
    place,
    unseat,
    activateSeat,
    activateTable,
    filled,
    rules,
    brokenRules,
    flaggedTables,
    flaggedGuests,
    seatedCount,
    attendingCount,
    openSeats: TOTAL_SEATS - seatedCount,
    unseatedAttending,
    unconfirmedUnseated,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
```

```tsx components/guest-bits.tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RSVP_LABEL, dietTone, initials, partyStyle, rsvpTone, type Guest, type Rsvp } from "@/lib/data";

export function GuestAvatar({ guest, className }: { guest: Guest; className?: string }) {
  return (
    <span
      aria-hidden="true"
      style={partyStyle(guest.party)}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
        className,
      )}
    >
      {initials(guest.name)}
    </span>
  );
}

export function DietBadge({ diet, className }: { diet: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn("font-normal", dietTone(diet), className)}>
      {diet}
    </Badge>
  );
}

export function RsvpBadge({ rsvp }: { rsvp: Rsvp }) {
  return (
    <Badge variant="outline" className={cn("font-normal", rsvpTone(rsvp))}>
      {RSVP_LABEL[rsvp]}
    </Badge>
  );
}
```

```tsx components/app-shell.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Armchair, LayoutGrid, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLANNER, initials } from "@/lib/data";
import { usePlan } from "@/components/plan-provider";

const NAV = [
  { href: "/", label: "Seating plan", icon: LayoutGrid },
  { href: "/guests", label: "Guests", icon: Users },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const plan = usePlan();
  const open = plan.unseatedAttending.length;

  return (
    <div className="min-h-dvh bg-background">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/75">
        <div className="mx-auto flex max-w-[1500px] items-center gap-2 px-4 py-2 sm:gap-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Armchair className="size-4.5" aria-hidden="true" />
            </span>
            <span className="text-base font-semibold tracking-tight">Seatwise</span>
          </Link>
          <nav aria-label="Main" className="ml-1 flex items-center gap-1 sm:ml-4">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  <span className={cn(href === "/" && "hidden sm:inline")}>{label}</span>
                  <span className={cn(href === "/" && "sm:hidden", "hidden")}>{href === "/" ? "Plan" : ""}</span>
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span
              className={cn(
                "hidden rounded-full px-2.5 py-1 text-xs font-medium tabular-nums md:inline-block",
                open > 0 ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900",
              )}
            >
              {open > 0 ? `${open} guests need a seat` : "Everyone seated"}
            </span>
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground"
              >
                {initials(PLANNER.name)}
              </span>
              <span className="hidden text-sm font-medium lg:inline">{PLANNER.name}</span>
            </div>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
```

```tsx components/floor-plan.tsx
"use client";

import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FIXTURES,
  GUEST_BY_ID,
  LONG_D,
  LONG_W,
  PARTIES,
  ROOM,
  SEAT_D,
  TABLES,
  partyStyle,
  initials,
  seatPositions,
  tableCentre,
  tableRadius,
  type Fixture,
  type PlanTable,
} from "@/lib/data";
import { usePlan } from "@/components/plan-provider";
import { startGuestDrag, useGuestDrop } from "@/components/use-drop";

const px = (v: number, total: number) => `${(v / total) * 100}%`;

function FixtureBox({ f }: { f: Fixture }) {
  const base = "absolute flex items-center justify-center overflow-hidden text-center font-medium leading-tight";
  const kind: Record<Fixture["kind"], string> = {
    stage: "rounded-md bg-foreground/90 text-background",
    dancefloor: "rounded-sm border border-dashed border-primary/40 text-primary/80",
    bar: "rounded-md border border-amber-300 bg-amber-100 text-amber-900",
    door: "rounded-sm bg-emerald-600 text-white",
  };
  return (
    <div
      className={cn(base, kind[f.kind])}
      style={{
        left: px(f.x, ROOM.width),
        top: px(f.y, ROOM.depth),
        width: px(f.w, ROOM.width),
        height: px(f.h, ROOM.depth),
        fontSize: "max(8px, 1.3cqw)",
        ...(f.kind === "dancefloor"
          ? {
              backgroundImage:
                "repeating-conic-gradient(color-mix(in oklab, var(--primary) 9%, transparent) 0% 25%, transparent 0% 50%)",
              backgroundSize: `${(2 / f.w) * 100}% ${(2 / f.h) * 100}%`,
            }
          : {}),
        ...(f.kind === "door" ? { writingMode: "vertical-rl" as const } : {}),
      }}
    >
      {f.label}
    </div>
  );
}

function PlanSeat({ table, index, x, y }: { table: PlanTable; index: number; x: number; y: number }) {
  const plan = usePlan();
  const guestId = plan.seats[table.id][index];
  const guest = guestId ? GUEST_BY_ID[guestId] : null;
  const drop = useGuestDrop((id) => plan.place(id, table.id, index));
  const isPicked = !!guest && plan.picked === guest.id;
  const flagged = !!guest && plan.flaggedGuests.has(guest.id);
  const label = `${table.name}, seat ${index + 1}: ${
    guest ? `${guest.name}${guest.diet ? `, ${guest.diet}` : ""}${flagged ? ", rule broken" : ""}` : "empty"
  }`;

  return (
    <button
      type="button"
      draggable={!!guest}
      onDragStart={guest ? (e) => startGuestDrag(e, guest.id) : undefined}
      {...drop.props}
      onClick={() => plan.activateSeat(table.id, index)}
      aria-label={label}
      aria-pressed={guest ? isPicked : undefined}
      title={guest ? `${guest.name}${guest.diet ? ` · ${guest.diet}` : ""}` : `${table.name}, seat ${index + 1} (empty)`}
      className={cn(
        "absolute z-10 flex aspect-square -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border font-semibold leading-none outline-none transition-shadow",
        "before:absolute before:-inset-1 before:content-[''] focus-visible:ring-[3px] focus-visible:ring-ring",
        guest ? "cursor-grab" : "border-dashed border-muted-foreground/45 bg-background text-transparent",
        !guest && plan.picked && "border-primary bg-primary/10",
        flagged && "ring-2 ring-destructive",
        isPicked && "ring-2 ring-primary ring-offset-1",
        drop.over && "bg-primary/30 ring-2 ring-primary",
      )}
      style={{
        left: px(x, ROOM.width),
        top: px(y, ROOM.depth),
        width: px(SEAT_D, ROOM.width),
        fontSize: "max(7.5px, 1.2cqw)",
        ...(guest && !drop.over ? partyStyle(guest.party) : {}),
      }}
    >
      {guest ? initials(guest.name) : "·"}
      {guest?.diet && (
        <span
          aria-hidden="true"
          className="absolute -right-[10%] -top-[10%] size-[36%] rounded-full bg-amber-500 ring-1 ring-white"
        />
      )}
    </button>
  );
}

function PlanTableBody({ table }: { table: PlanTable }) {
  const plan = usePlan();
  const drop = useGuestDrop((id) => plan.place(id, table.id));
  const c = tableCentre(table);
  const long = table.shape === "long";
  const w = long ? LONG_W : tableRadius(table) * 2;
  const h = long ? LONG_D : w;
  const flagged = plan.flaggedTables.has(table.id);
  const selected = plan.selectedTable === table.id;
  const count = plan.filled(table.id);

  return (
    <button
      type="button"
      {...drop.props}
      onClick={() => plan.activateTable(table.id)}
      aria-pressed={selected}
      aria-label={`${table.name}, ${count} of ${table.seats} seats filled${flagged ? ", a rule is broken here" : ""}. Show guests`}
      className={cn(
        "absolute z-0 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center border-2 bg-card text-center leading-tight shadow-sm outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring",
        long ? "flex-row gap-2 rounded-md" : "flex-col rounded-full",
        flagged ? "border-destructive bg-destructive/5" : "border-border hover:border-foreground/40",
        selected && "border-primary ring-4 ring-primary/20",
        drop.over && "border-primary bg-primary/10",
      )}
      style={{
        left: px(c.x, ROOM.width),
        top: px(c.y, ROOM.depth),
        width: px(w, ROOM.width),
        height: px(h, ROOM.depth),
        fontSize: "max(8px, 1.3cqw)",
      }}
    >
      <span className="font-semibold">{table.name}</span>
      <span className="tabular-nums text-muted-foreground">
        {count}/{table.seats}
      </span>
      {flagged && (
        <span className="absolute -right-1 -top-1 flex items-center justify-center rounded-full bg-destructive p-[2px] text-white">
          <TriangleAlert style={{ width: "max(9px, 1.4cqw)", height: "max(9px, 1.4cqw)" }} aria-hidden="true" />
        </span>
      )}
    </button>
  );
}

export function FloorPlan() {
  return (
    <div
      role="region"
      aria-label="Floor plan of The Orangery, scrolls sideways on narrow screens"
      tabIndex={0}
      className="overflow-x-auto rounded-xl border bg-card outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <div className="@container min-w-[624px] p-3">
        <div
          className="relative aspect-[24/14] w-full rounded-lg border-2 border-foreground/60 bg-muted/40"
          style={{
            backgroundImage:
              "linear-gradient(to right, oklch(0 0 0 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, oklch(0 0 0 / 0.05) 1px, transparent 1px)",
            backgroundSize: `${100 / ROOM.width}% ${100 / ROOM.depth}%`,
          }}
        >
          {FIXTURES.map((f) => (
            <FixtureBox key={f.id} f={f} />
          ))}
          {TABLES.map((t) => (
            <PlanTableBody key={t.id} table={t} />
          ))}
          {TABLES.map((t) =>
            seatPositions(t).map((p, i) => <PlanSeat key={`${t.id}-${i}`} table={t} index={i} x={p.x} y={p.y} />),
          )}
        </div>
        <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {PARTIES.map((p) => (
            <li key={p} className="flex items-center gap-1.5">
              <span className="size-3 rounded-full border" style={partyStyle(p)} aria-hidden="true" />
              {p}
            </li>
          ))}
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-amber-500" aria-hidden="true" />
            Dietary need
          </li>
          <li className="ml-auto tabular-nums">
            {ROOM.width} × {ROOM.depth} m · grid squares are 1 m
          </li>
        </ul>
      </div>
    </div>
  );
}
```

```tsx components/table-list.tsx
"use client";

import { TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GUEST_BY_ID, TABLES, type PlanTable } from "@/lib/data";
import { usePlan } from "@/components/plan-provider";
import { startGuestDrag, useGuestDrop } from "@/components/use-drop";
import { DietBadge, GuestAvatar } from "@/components/guest-bits";

function SeatRow({ table, index }: { table: PlanTable; index: number }) {
  const plan = usePlan();
  const guestId = plan.seats[table.id][index];
  const guest = guestId ? GUEST_BY_ID[guestId] : null;
  const drop = useGuestDrop((id) => plan.place(id, table.id, index));
  const isPicked = !!guest && plan.picked === guest.id;
  const flagged = !!guest && plan.flaggedGuests.has(guest.id);

  return (
    <li>
      <button
        type="button"
        draggable={!!guest}
        onDragStart={guest ? (e) => startGuestDrag(e, guest.id) : undefined}
        {...drop.props}
        onClick={() => plan.activateSeat(table.id, index)}
        aria-pressed={guest ? isPicked : undefined}
        aria-label={`${table.name}, seat ${index + 1}: ${guest ? guest.name : "empty"}`}
        className={cn(
          "flex min-h-11 w-full items-center gap-2.5 rounded-lg border px-2 py-1 text-left text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          guest ? "cursor-grab bg-background hover:bg-accent" : "border-dashed text-muted-foreground hover:bg-accent/60",
          !guest && plan.picked && "border-primary/60 bg-primary/5",
          flagged && "border-destructive/50 bg-destructive/5",
          isPicked && "border-primary bg-primary/10",
          drop.over && "border-primary bg-primary/10",
        )}
      >
        <span className="w-4 shrink-0 text-center text-xs tabular-nums text-muted-foreground">{index + 1}</span>
        {guest ? (
          <>
            <GuestAvatar guest={guest} className="size-7" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{guest.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{guest.party}</span>
            </span>
            {guest.diet && <DietBadge diet={guest.diet} />}
          </>
        ) : (
          <span>Empty seat</span>
        )}
      </button>
    </li>
  );
}

function TableCard({ table }: { table: PlanTable }) {
  const plan = usePlan();
  const drop = useGuestDrop((id) => plan.place(id, table.id));
  const count = plan.filled(table.id);
  const flagged = plan.flaggedTables.has(table.id);
  const selected = plan.selectedTable === table.id;

  return (
    <section
      {...drop.props}
      aria-label={table.name}
      className={cn(
        "rounded-xl border bg-card p-2",
        flagged && "border-destructive/60",
        selected && "ring-2 ring-primary/40",
        drop.over && "border-primary ring-2 ring-primary/40",
      )}
    >
      <button
        type="button"
        onClick={() => plan.activateTable(table.id)}
        aria-pressed={selected}
        className="mb-1.5 flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-left outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <span className="font-semibold">{table.name}</span>
        <span className="text-xs text-muted-foreground">{table.shape === "long" ? "Long table" : "Round table"}</span>
        {flagged && (
          <Badge variant="destructive" className="gap-1">
            <TriangleAlert aria-hidden="true" /> Rule broken
          </Badge>
        )}
        <span className="ml-auto text-sm tabular-nums text-muted-foreground">
          {count}/{table.seats}
        </span>
      </button>
      <ul className="flex flex-col gap-1">
        {Array.from({ length: table.seats }, (_, i) => (
          <SeatRow key={i} table={table} index={i} />
        ))}
      </ul>
    </section>
  );
}

export function TableList() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {TABLES.map((t) => (
        <TableCard key={t.id} table={t} />
      ))}
    </div>
  );
}
```

```tsx components/unseated-panel.tsx
"use client";

import { CircleCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type Guest } from "@/lib/data";
import { usePlan } from "@/components/plan-provider";
import { startGuestDrag, useGuestDrop } from "@/components/use-drop";
import { DietBadge, GuestAvatar, RsvpBadge } from "@/components/guest-bits";

function UnseatedRow({ guest }: { guest: Guest }) {
  const plan = usePlan();
  const isPicked = plan.picked === guest.id;
  return (
    <li>
      <button
        type="button"
        draggable
        onDragStart={(e) => startGuestDrag(e, guest.id)}
        onClick={() => plan.pick(isPicked ? null : guest.id)}
        aria-pressed={isPicked}
        className={cn(
          "flex min-h-12 w-full cursor-grab items-center gap-2.5 rounded-lg border border-transparent px-2 py-1.5 text-left outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50",
          isPicked && "border-primary bg-primary/10",
        )}
      >
        <GuestAvatar guest={guest} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{guest.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{guest.party}</span>
        </span>
        <span className="flex flex-col items-end gap-1">
          {guest.rsvp !== "yes" && <RsvpBadge rsvp={guest.rsvp} />}
          {guest.diet && <DietBadge diet={guest.diet} />}
        </span>
      </button>
    </li>
  );
}

export function UnseatedPanel() {
  const plan = usePlan();
  const drop = useGuestDrop((id) => plan.unseat(id));
  const list = plan.unseatedAttending;
  const more = plan.unconfirmedUnseated;

  return (
    <section
      {...drop.props}
      aria-labelledby="unseated-h"
      className={cn("rounded-xl border bg-card", drop.over && "border-primary ring-2 ring-primary/30")}
    >
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <h2 id="unseated-h" className="text-sm font-semibold">
          Needs a seat
        </h2>
        <Badge variant={list.length ? "secondary" : "outline"} className="tabular-nums">
          {list.length}
        </Badge>
        <span className="ml-auto text-xs text-muted-foreground">Drag, or tap then tap a seat</span>
      </div>
      <div className="max-h-[26rem] overflow-y-auto p-2">
        {list.length === 0 ? (
          <p className="flex items-center gap-2 px-2 py-4 text-sm text-muted-foreground">
            <CircleCheck className="size-4 text-emerald-600" aria-hidden="true" />
            Every attending guest has a seat.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {list.map((g) => (
              <UnseatedRow key={g.id} guest={g} />
            ))}
          </ul>
        )}
        {more.length > 0 && (
          <>
            <h3 className="mt-3 px-2 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Not confirmed yet
            </h3>
            <ul className="flex flex-col gap-0.5">
              {more.map((g) => (
                <UnseatedRow key={g.id} guest={g} />
              ))}
            </ul>
          </>
        )}
      </div>
      <p className="border-t px-4 py-2 text-xs text-muted-foreground">Drop a seated guest here to unseat them.</p>
    </section>
  );
}
```

```tsx components/rules-summary.tsx
"use client";

import { CircleCheck, Clock, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePlan } from "@/components/plan-provider";
import type { RuleResult } from "@/lib/rules";

function RuleItem({ r }: { r: RuleResult }) {
  const plan = usePlan();
  const broken = r.status === "broken";
  const Icon = broken ? TriangleAlert : r.status === "ok" ? CircleCheck : Clock;
  const body = (
    <>
      <Icon
        aria-hidden="true"
        className={cn(
          "mt-0.5 size-4 shrink-0",
          broken ? "text-destructive" : r.status === "ok" ? "text-emerald-600" : "text-muted-foreground",
        )}
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium">
          <span className="sr-only">{broken ? "Broken: " : r.status === "ok" ? "Kept: " : "Waiting: "}</span>
          {r.title}
        </span>
        <span className={cn("block text-xs", broken ? "text-destructive" : "text-muted-foreground")}>{r.detail}</span>
        <span className="block text-xs text-muted-foreground">{r.rule.note}</span>
      </span>
    </>
  );
  const cls = cn(
    "flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left",
    broken && "bg-destructive/5 outline-none hover:bg-destructive/10 focus-visible:ring-[3px] focus-visible:ring-ring/50",
  );
  return (
    <li>
      {broken ? (
        <button type="button" className={cls} onClick={() => plan.selectTable(r.tables[0] ?? null)}>
          {body}
        </button>
      ) : (
        <div className={cls}>{body}</div>
      )}
    </li>
  );
}

export function RulesSummary() {
  const plan = usePlan();
  const n = plan.brokenRules.length;
  const sorted = [...plan.rules].sort((a, b) => {
    const order = { broken: 0, pending: 1, ok: 2 } as const;
    return order[a.status] - order[b.status];
  });
  return (
    <section aria-labelledby="rules-h" className="rounded-xl border bg-card">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <h2 id="rules-h" className="text-sm font-semibold">
          The couple&apos;s rules
        </h2>
        <Badge variant={n ? "destructive" : "outline"} className="tabular-nums" aria-live="polite">
          {n ? `${n} broken` : "All kept"}
        </Badge>
      </div>
      <ul className="flex flex-col gap-0.5 p-2">
        {sorted.map((r) => (
          <RuleItem key={r.index} r={r} />
        ))}
      </ul>
    </section>
  );
}
```

```tsx components/table-detail.tsx
"use client";

import { Table2, UserMinus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GUEST_BY_ID, TABLE_BY_ID } from "@/lib/data";
import { usePlan } from "@/components/plan-provider";
import { DietBadge, GuestAvatar } from "@/components/guest-bits";

export function TableDetail() {
  const plan = usePlan();
  const table = plan.selectedTable ? TABLE_BY_ID[plan.selectedTable] : null;

  if (!table) {
    return (
      <section aria-live="polite" className="flex items-center gap-3 rounded-xl border border-dashed bg-card/50 px-4 py-5 text-sm text-muted-foreground">
        <Table2 className="size-5 shrink-0" aria-hidden="true" />
        Select a table on the plan to see who sits there and what they can eat.
      </section>
    );
  }

  const guests = plan.seats[table.id].flatMap((id, seat) => (id ? [{ guest: GUEST_BY_ID[id], seat }] : []));
  const diets = new Map<string, number>();
  for (const { guest } of guests) if (guest.diet) diets.set(guest.diet, (diets.get(guest.diet) ?? 0) + 1);
  const issues = plan.brokenRules.filter((r) => r.tables.includes(table.id));
  const pickedGuest = plan.picked ? GUEST_BY_ID[plan.picked] : null;
  const pickedHere = pickedGuest ? plan.tableOf[pickedGuest.id] === table.id : false;

  return (
    <section aria-live="polite" aria-labelledby="detail-h" className="rounded-xl border bg-card">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b px-4 py-3">
        <h2 id="detail-h" className="text-base font-semibold">
          {table.name}
        </h2>
        <span className="text-sm tabular-nums text-muted-foreground">
          {guests.length} of {table.seats} seats filled · {table.seats - guests.length} open
        </span>
        <div className="ml-auto flex items-center gap-2">
          {pickedGuest && !pickedHere && (
            <Button size="sm" onClick={() => plan.activateTable(table.id)}>
              Seat {pickedGuest.name.split(" ")[0]} here
            </Button>
          )}
          <Button variant="ghost" size="icon-sm" aria-label="Close table details" onClick={() => plan.selectTable(null)}>
            <X />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,15rem)]">
        <div>
          {guests.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nobody is seated here yet.</p>
          ) : (
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {guests.map(({ guest, seat }) => (
                <li key={guest.id} className="flex min-h-12 items-center gap-2.5 rounded-lg border px-2 py-1.5">
                  <GuestAvatar guest={guest} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{guest.name}</span>
                    <span className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                      Seat {seat + 1}
                      {guest.diet && <DietBadge diet={guest.diet} />}
                    </span>
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Unseat ${guest.name}`}
                    title="Unseat"
                    onClick={() => plan.unseat(guest.id)}
                  >
                    <UserMinus />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <div>
            <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Dietary needs</h3>
            {diets.size === 0 ? (
              <p className="text-muted-foreground">None at this table.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {Array.from(diets).map(([d, n]) => (
                  <li key={d} className="flex items-center justify-between gap-2">
                    <DietBadge diet={d} />
                    <span className="tabular-nums">{n}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {issues.length > 0 && (
            <div>
              <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-destructive">Broken here</h3>
              <ul className="flex flex-col gap-1 text-xs text-destructive">
                {issues.map((r) => (
                  <li key={r.index}>{r.detail}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
```

```tsx app/page.tsx
"use client";

import { useEffect } from "react";
import { LayoutGrid, List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { EVENT, GUESTS, GUEST_BY_ID, ROOM, TABLES, TOTAL_SEATS, formatEventDate } from "@/lib/data";
import { usePlan } from "@/components/plan-provider";
import { FloorPlan } from "@/components/floor-plan";
import { TableList } from "@/components/table-list";
import { UnseatedPanel } from "@/components/unseated-panel";
import { RulesSummary } from "@/components/rules-summary";
import { TableDetail } from "@/components/table-detail";

function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: number | string;
  hint: string;
  tone?: "default" | "warn" | "bad" | "good";
}) {
  return (
    <div className="rounded-xl border bg-card px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-0.5 text-2xl font-semibold tabular-nums tracking-tight",
          tone === "warn" && "text-amber-700",
          tone === "bad" && "text-destructive",
          tone === "good" && "text-emerald-700",
        )}
      >
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export default function PlanPage() {
  const plan = usePlan();
  const { pick } = plan;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") pick(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pick]);

  const picked = plan.picked ? GUEST_BY_ID[plan.picked] : null;
  const pickedSeated = picked ? !!plan.tableOf[picked.id] : false;
  const broken = plan.brokenRules.length;

  return (
    <main id="main" className="mx-auto max-w-[1500px] px-4 pb-28 pt-5 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        <div>
          <p className="text-sm text-muted-foreground">
            {formatEventDate()} · {EVENT.venue}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{EVENT.name}</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Room {ROOM.width} × {ROOM.depth} m · {TABLES.length} tables · {TOTAL_SEATS} seats · {GUESTS.length} invited
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Seated" value={plan.seatedCount} hint={`of ${TOTAL_SEATS} seats · ${plan.openSeats} open`} tone="good" />
        <Stat
          label="Unseated"
          value={plan.unseatedAttending.length}
          hint={`of ${plan.attendingCount} attending`}
          tone={plan.unseatedAttending.length ? "warn" : "good"}
        />
        <Stat label="Attending" value={plan.attendingCount} hint={`${GUESTS.length} invited`} />
        <Stat
          label="Rules"
          value={broken ? `${broken} broken` : "All kept"}
          hint={`${plan.rules.length} rules from the couple`}
          tone={broken ? "bad" : "good"}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-4">
          <Tabs defaultValue="plan" className="gap-3">
            <TabsList aria-label="Plan view">
              <TabsTrigger value="plan" className="gap-1.5 px-3">
                <LayoutGrid className="size-4" aria-hidden="true" /> Floor plan
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-1.5 px-3">
                <List className="size-4" aria-hidden="true" /> Table list
              </TabsTrigger>
            </TabsList>
            <TabsContent value="plan">
              <FloorPlan />
            </TabsContent>
            <TabsContent value="list">
              <TableList />
            </TabsContent>
          </Tabs>
          <TableDetail />
        </div>

        <aside aria-label="Rules and unseated guests" className="flex min-w-0 flex-col gap-4">
          <RulesSummary />
          <UnseatedPanel />
        </aside>
      </div>

      {picked && (
        <div
          role="status"
          className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-xl items-center gap-3 rounded-xl bg-primary px-4 py-3 text-primary-foreground shadow-xl"
        >
          <p className="min-w-0 flex-1 text-sm">
            <span className="font-semibold">{pickedSeated ? "Moving" : "Placing"} {picked.name}.</span>{" "}
            <span className="opacity-85">Tap a seat or a table.</span>
          </p>
          {pickedSeated && (
            <Button size="sm" variant="secondary" onClick={() => plan.unseat(picked.id)}>
              Unseat
            </Button>
          )}
          <Button size="icon-sm" variant="ghost" aria-label="Cancel" className="hover:bg-white/15 hover:text-primary-foreground" onClick={() => plan.pick(null)}>
            <X />
          </Button>
        </div>
      )}
    </main>
  );
}
```

```tsx app/guests/page.tsx
"use client";

import { useMemo, useState } from "react";
import { Copy, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DIETS, EVENT, GUESTS, MEAL_STANDARD, PARTIES, TABLES, TABLE_BY_ID, type Guest } from "@/lib/data";
import { usePlan } from "@/components/plan-provider";
import { DietBadge, RsvpBadge } from "@/components/guest-bits";

const NONE = "__none";
const mealOf = (g: Guest) => g.diet ?? MEAL_STANDARD;

export default function GuestsPage() {
  const plan = usePlan();
  const [q, setQ] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState("all");
  const [diet, setDiet] = useState("all");
  const [seating, setSeating] = useState("all");

  const tableName = (g: Guest) => {
    const t = plan.tableOf[g.id];
    return t ? TABLE_BY_ID[t].name : null;
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return GUESTS.filter((g) => {
      const t = plan.tableOf[g.id];
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === NONE && g.diet) return false;
      if (diet !== "all" && diet !== NONE && g.diet !== diet) return false;
      if (seating === "seated" && !t) return false;
      if (seating === "unseated" && t) return false;
      if (needle) {
        const hay = `${g.name} ${g.party} ${g.diet ?? ""} ${t ? TABLE_BY_ID[t].name : "unseated"}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [q, party, rsvp, diet, seating, plan.tableOf]);

  const filtersOn = q !== "" || party !== "all" || rsvp !== "all" || diet !== "all" || seating !== "all";
  const clear = () => {
    setQ("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
    setSeating("all");
  };

  const counts = useMemo(() => {
    const meals = [MEAL_STANDARD, ...DIETS];
    return meals.map((m) => ({
      meal: m,
      yes: GUESTS.filter((g) => g.rsvp === "yes" && mealOf(g) === m).length,
      awaiting: GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && mealOf(g) === m).length,
    }));
  }, []);
  const totalYes = counts.reduce((n, c) => n + c.yes, 0);
  const totalAwaiting = counts.reduce((n, c) => n + c.awaiting, 0);

  const byTable = TABLES.map((t) => {
    const here = plan.seats[t.id].flatMap((id) => (id ? [GUESTS.find((g) => g.id === id) as Guest] : []));
    const yes = here.filter((g) => g.rsvp === "yes");
    const tally = new Map<string, number>();
    for (const g of yes) tally.set(mealOf(g), (tally.get(mealOf(g)) ?? 0) + 1);
    return { table: t, total: yes.length, unconfirmed: here.length - yes.length, tally };
  });

  const invited = GUESTS.length;
  const declined = GUESTS.filter((g) => g.rsvp === "no").length;

  const copy = async () => {
    const lines = [
      `${EVENT.name}, ${EVENT.venue}`,
      `Meal counts (attending guests): ${totalYes}`,
      ...counts.filter((c) => c.yes > 0).map((c) => `${c.meal}: ${c.yes}`),
      "",
      "By table:",
      ...byTable
        .filter((b) => b.total > 0)
        .map((b) => `${b.table.name}: ${Array.from(b.tally, ([m, n]) => `${m} ${n}`).join(", ")}`),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success("Meal counts copied for the caterer");
    } catch {
      toast.error("Could not copy. Select the counts and copy them by hand.");
    }
  };

  return (
    <main id="main" className="mx-auto max-w-[1500px] px-4 pb-10 pt-5 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        <div>
          <p className="text-sm text-muted-foreground">{EVENT.name}</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Guest list</h1>
        </div>
        <p className="text-sm tabular-nums text-muted-foreground">
          {invited} invited · {plan.attendingCount} attending · {totalAwaiting} awaiting reply · {declined} declined
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-label="Guests" className="min-w-0">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))]">
            <div className="relative sm:col-span-2 xl:col-span-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, party, table"
                aria-label="Search guests"
                className="h-10 bg-card pl-9"
              />
            </div>
            <Select value={party} onValueChange={setParty}>
              <SelectTrigger aria-label="Filter by party" className="h-10 w-full bg-card">
                <SelectValue />
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
              <SelectTrigger aria-label="Filter by RSVP" className="h-10 w-full bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any RSVP</SelectItem>
                <SelectItem value="yes">Attending</SelectItem>
                <SelectItem value="maybe">Maybe</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="no">Declined</SelectItem>
              </SelectContent>
            </Select>
            <Select value={diet} onValueChange={setDiet}>
              <SelectTrigger aria-label="Filter by diet" className="h-10 w-full bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any meal</SelectItem>
                <SelectItem value={NONE}>{MEAL_STANDARD}</SelectItem>
                {DIETS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={seating} onValueChange={setSeating}>
              <SelectTrigger aria-label="Filter by seating" className="h-10 w-full bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Seated or not</SelectItem>
                <SelectItem value="seated">Seated</SelectItem>
                <SelectItem value="unseated">Unseated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="my-2 flex min-h-8 items-center justify-between text-sm text-muted-foreground">
            <p aria-live="polite" className="tabular-nums">
              Showing {filtered.length} of {invited} guests
            </p>
            {filtersOn && (
              <Button variant="ghost" size="sm" onClick={clear}>
                <X /> Clear filters
              </Button>
            )}
          </div>

          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Guest</TableHead>
                  <TableHead className="hidden md:table-cell">Party</TableHead>
                  <TableHead>RSVP</TableHead>
                  <TableHead>Meal</TableHead>
                  <TableHead className="pr-4">Table</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((g) => {
                  const tn = tableName(g);
                  return (
                    <TableRow key={g.id}>
                      <TableCell className="py-2.5 pl-4">
                        <span className="block font-medium">{g.name}</span>
                        <span className="block text-xs text-muted-foreground md:hidden">{g.party}</span>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">{g.party}</TableCell>
                      <TableCell>
                        <RsvpBadge rsvp={g.rsvp} />
                      </TableCell>
                      <TableCell>
                        {g.diet ? <DietBadge diet={g.diet} /> : <span className="text-muted-foreground">{MEAL_STANDARD}</span>}
                      </TableCell>
                      <TableCell className="pr-4">
                        {tn ? (
                          <span className="font-medium">{tn}</span>
                        ) : g.rsvp === "no" ? (
                          <span className="text-muted-foreground">Not needed</span>
                        ) : (
                          <Badge variant="outline" className="border-amber-200 bg-amber-50 font-normal text-amber-900">
                            Unseated
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      No guests match these filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        <aside aria-label="Catering" className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
          <section aria-labelledby="meals-h" className="rounded-xl border bg-card">
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <h2 id="meals-h" className="text-sm font-semibold">
                Meals for the caterer
              </h2>
              <Button variant="outline" size="sm" className="ml-auto" onClick={copy}>
                <Copy /> Copy
              </Button>
            </div>
            <table className="w-full text-sm">
              <caption className="sr-only">Meal counts from attending guests, with guests still to reply</caption>
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th scope="col" className="px-4 py-2 font-medium">Meal</th>
                  <th scope="col" className="px-2 py-2 text-right font-medium">Attending</th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">To reply</th>
                </tr>
              </thead>
              <tbody>
                {counts.map((c) => {
                  const value = c.meal === MEAL_STANDARD ? NONE : c.meal;
                  const active = diet === value;
                  return (
                    <tr key={c.meal} className="border-t">
                      <th scope="row" className="p-0 text-left font-normal">
                        <button
                          type="button"
                          aria-pressed={active}
                          onClick={() => setDiet(active ? "all" : value)}
                          className={cn(
                            "flex min-h-10 w-full items-center px-4 text-left outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50",
                            active && "bg-primary/10 font-medium",
                          )}
                        >
                          {c.meal}
                        </button>
                      </th>
                      <td className="px-2 text-right font-semibold tabular-nums">{c.yes}</td>
                      <td className="px-4 text-right tabular-nums text-muted-foreground">{c.awaiting || "–"}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t font-semibold">
                  <th scope="row" className="px-4 py-2.5 text-left">Total</th>
                  <td className="px-2 text-right tabular-nums">{totalYes}</td>
                  <td className="px-4 text-right tabular-nums text-muted-foreground">{totalAwaiting}</td>
                </tr>
              </tfoot>
            </table>
            <p className="border-t px-4 py-2 text-xs text-muted-foreground">
              Tap a meal to filter the list. Declined guests are not counted.
            </p>
          </section>

          <section aria-labelledby="bytable-h" className="rounded-xl border bg-card">
            <div className="border-b px-4 py-3">
              <h2 id="bytable-h" className="text-sm font-semibold">
                Meals by table
              </h2>
            </div>
            <ul className="divide-y text-sm">
              {byTable.map((b) => (
                <li key={b.table.id} className="px-4 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{b.table.name}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {b.total} attending{b.unconfirmed ? ` · +${b.unconfirmed} to reply` : ""}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {b.total === 0
                      ? "No attending guests seated"
                      : Array.from(b.tally, ([m, n]) => `${m} ${n}`).join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </main>
  );
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { PlanProvider } from "@/components/plan-provider";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Seatwise: seating plan for Ines & Mateo's wedding dinner",
  description: "Seatwise, a seating planner for wedding and event planners.",
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
  --foreground: oklch(0.2 0.015 85);
  --card: oklch(0.999 0.002 85);
  --card-foreground: oklch(0.2 0.015 85);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.2 0.015 85);
  --primary: oklch(0.38 0.07 165);
  --primary-foreground: oklch(0.985 0.005 165);
  --secondary: oklch(0.945 0.012 100);
  --secondary-foreground: oklch(0.27 0.03 120);
  --muted: oklch(0.955 0.007 85);
  --muted-foreground: oklch(0.47 0.015 85);
  --accent: oklch(0.945 0.015 150);
  --accent-foreground: oklch(0.25 0.04 165);
  --destructive: oklch(0.53 0.21 27);
  --border: oklch(0.905 0.01 85);
  --input: oklch(0.88 0.01 85);
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
  body {
    @apply bg-background text-foreground;
  }
  button:not(:disabled),
  [role="button"]:not(:disabled) {
    cursor: pointer;
  }
  [draggable="true"] {
    cursor: grab;
  }
  [draggable="true"]:active {
    cursor: grabbing;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```
