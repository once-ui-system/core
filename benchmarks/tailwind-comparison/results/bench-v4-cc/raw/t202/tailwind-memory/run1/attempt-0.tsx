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

export type Table = {
  id: string;
  name: string;
  shape: "round" | "long";
  seats: number;
  x: number;
  y: number;
  rotation?: number;
};

export type Fixture = {
  id: string;
  kind: "stage" | "dancefloor" | "bar" | "door";
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Rule = {
  kind: "together" | "apart" | "near";
  guests: string[];
  note: string;
};

export const appName = "Seatwise";
export const appTagline = "A seating planner for wedding and event planners";

export const event = {
  name: "Ines & Mateo's wedding dinner",
  date: "2027-06-19",
  venue: "The Orangery, Hollin Hall",
  room: { width: 24, depth: 14 },
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

const g = (
  id: string,
  name: string,
  party: string,
  rsvp: Rsvp,
  diet: string | null,
  table: string | null,
): Guest => ({ id, name, party, rsvp, diet, table });

export const guests: Guest[] = [
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

export const rules: Rule[] = [
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
  },
];

export const guestById = new Map(guests.map((x) => [x.id, x] as const));
export const tableById = new Map(tables.map((x) => [x.id, x] as const));

export const parties: string[] = Array.from(new Set(guests.map((x) => x.party)));
export const diets: string[] = Array.from(
  new Set(guests.flatMap((x) => (x.diet ? [x.diet] : []))),
).sort((a, b) => a.localeCompare(b));

export const partyColor: Record<string, string> = {
  Couple: "#be123c",
  "Bride's family": "#0f766e",
  "Groom's family": "#4338ca",
  "University friends": "#b45309",
  "Work friends": "#0369a1",
  "Groom's football club": "#4d7c0f",
  "Plus-ones": "#6d28d9",
};

export const rsvpLabel: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Awaiting reply",
  no: "Declined",
};

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0].charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${WEEKDAYS[wd]} ${d} ${MONTHS[m - 1]} ${y}`;
}
```

```ts lib/geometry.ts
import type { Fixture, Table } from "./data";

export type Point = { x: number; y: number };

export const SEAT_R = 0.4;
const SPACING = 1.1;
const DEPTH = 0.9;

export function roundRadius(t: Table): number {
  return t.seats > 6 ? 0.95 : 0.8;
}

export function longSize(t: Table) {
  const perSide = Math.ceil(t.seats / 2);
  return { perSide, w: perSide * SPACING + 0.4, d: DEPTH };
}

/** Seat centres in room metres, seat 0 first. */
export function seatPoints(t: Table): Point[] {
  const pts: Point[] = [];
  if (t.shape === "round") {
    const ring = roundRadius(t) + 0.55;
    for (let i = 0; i < t.seats; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
      pts.push({ x: t.x + ring * Math.cos(a), y: t.y + ring * Math.sin(a) });
    }
    return pts;
  }
  const rot = ((t.rotation ?? 0) * Math.PI) / 180;
  const { perSide } = longSize(t);
  const bottom = t.seats - perSide;
  for (let i = 0; i < t.seats; i++) {
    const row = i < perSide ? 0 : 1;
    const count = row === 0 ? perSide : bottom;
    const col = row === 0 ? i : i - perSide;
    const lx = (col - (count - 1) / 2) * SPACING;
    const ly = (row === 0 ? -1 : 1) * (DEPTH / 2 + 0.45);
    pts.push({
      x: t.x + lx * Math.cos(rot) - ly * Math.sin(rot),
      y: t.y + lx * Math.sin(rot) + ly * Math.cos(rot),
    });
  }
  return pts;
}

/** Distance in metres from a point to the nearest edge of a fixture. */
export function distanceToFixture(px: number, py: number, f: Fixture): number {
  const dx = Math.max(f.x - px, 0, px - (f.x + f.w));
  const dy = Math.max(f.y - py, 0, py - (f.y + f.h));
  return Math.hypot(dx, dy);
}
```

```ts lib/rules.ts
import { fixtures, guestById, rules, tableById, type Rule } from "./data";
import { distanceToFixture } from "./geometry";

export type SeatMap = Record<string, { table: string; seat: number } | null>;
export type RuleStatus = "ok" | "broken" | "pending";

export type RuleResult = {
  index: number;
  rule: Rule;
  status: RuleStatus;
  title: string;
  detail: string;
  /** Tables to flag when the rule is broken. */
  tables: string[];
  guests: string[];
};

export const NEAR_DOOR_MAX_M = 4;
export const BAND_MIN_M = 6;

const nameOf = (id: string) => guestById.get(id)?.name ?? id;
const tableName = (id: string) => tableById.get(id)?.name ?? id;
const unique = <T,>(xs: T[]) => Array.from(new Set(xs));

export function evaluateRules(seats: SeatMap): RuleResult[] {
  return rules.map((rule, index): RuleResult => {
    const names = rule.guests.map(nameOf);
    const where = rule.guests.map((id) => seats[id] ?? null);
    const base = { index, rule, guests: rule.guests };

    if (rule.kind === "together") {
      const title = `Keep together: ${names.join(" and ")}`;
      if (where.some((w) => !w)) {
        const missing = rule.guests.filter((_, i) => !where[i]).map(nameOf);
        return {
          ...base,
          title,
          status: "pending",
          detail: `Waiting for ${missing.join(" and ")} to be seated.`,
          tables: [],
        };
      }
      const tbls = unique(where.map((w) => w!.table));
      if (tbls.length === 1) {
        return { ...base, title, status: "ok", detail: `Both at ${tableName(tbls[0])}.`, tables: [] };
      }
      return {
        ...base,
        title,
        status: "broken",
        detail: rule.guests
          .map((id, i) => `${nameOf(id)} is at ${tableName(where[i]!.table)}`)
          .join(", ") + ".",
        tables: tbls,
      };
    }

    if (rule.kind === "apart") {
      const title = `Keep apart: ${names.join(" and ")}`;
      if (where.some((w) => !w)) {
        const missing = rule.guests.filter((_, i) => !where[i]).map(nameOf);
        return {
          ...base,
          title,
          status: "pending",
          detail: `Checked once ${missing.join(" and ")} ${missing.length > 1 ? "are" : "is"} seated.`,
          tables: [],
        };
      }
      const tbls = unique(where.map((w) => w!.table));
      if (tbls.length === 1) {
        return {
          ...base,
          title,
          status: "broken",
          detail: `Both are at ${tableName(tbls[0])}.`,
          tables: tbls,
        };
      }
      return {
        ...base,
        title,
        status: "ok",
        detail: `${tableName(tbls[0])} and ${tableName(tbls[1])}.`,
        tables: [],
      };
    }

    // near
    const title = `Seat near the garden doors: ${names[0]}`;
    const w = where[0];
    if (!w) {
      return { ...base, title, status: "pending", detail: `Waiting for ${names[0]} to be seated.`, tables: [] };
    }
    const t = tableById.get(w.table);
    if (!t) return { ...base, title, status: "pending", detail: "Table not found.", tables: [] };
    const doors = fixtures.filter((f) => f.kind === "door");
    const stages = fixtures.filter((f) => f.kind === "stage");
    const toDoor = Math.min(...doors.map((f) => distanceToFixture(t.x, t.y, f)));
    const toBand = Math.min(...stages.map((f) => distanceToFixture(t.x, t.y, f)));
    const problems: string[] = [];
    if (toDoor > NEAR_DOOR_MAX_M) {
      problems.push(`${t.name} is ${toDoor.toFixed(1)} m from the garden doors (up to ${NEAR_DOOR_MAX_M} m)`);
    }
    if (toBand < BAND_MIN_M) {
      problems.push(`${t.name} is only ${toBand.toFixed(1)} m from the band (at least ${BAND_MIN_M} m)`);
    }
    if (problems.length > 0) {
      return { ...base, title, status: "broken", detail: problems.join("; ") + ".", tables: [t.id] };
    }
    return {
      ...base,
      title,
      status: "ok",
      detail: `${t.name}: ${toDoor.toFixed(1)} m from the doors, ${toBand.toFixed(1)} m from the band.`,
      tables: [],
    };
  });
}
```

```tsx lib/plan.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { guestById, guests, partyColor, tableById, tables } from "./data";
import { evaluateRules, type RuleResult, type SeatMap } from "./rules";

export type DropTarget =
  | { kind: "seat"; table: string; seat: number }
  | { kind: "table"; table: string }
  | { kind: "unseat" };

type DragState = { guestId: string; x: number; y: number; over: DropTarget | null };

type State = {
  seats: SeatMap;
  selectedTable: string | null;
  holding: string | null;
  notice: string;
};

type Action =
  | { type: "place"; guestId: string; table: string; seat?: number }
  | { type: "unseat"; guestId: string }
  | { type: "hold"; guestId: string | null }
  | { type: "select"; table: string | null };

export const seatKey = (table: string, seat: number) => `${table}:${seat}`;

function occupantsOf(seats: SeatMap): Map<string, string> {
  const m = new Map<string, string>();
  for (const [id, s] of Object.entries(seats)) if (s) m.set(seatKey(s.table, s.seat), id);
  return m;
}

function initState(_: null): State {
  const seats: SeatMap = {};
  const next: Record<string, number> = {};
  for (const gst of guests) {
    if (gst.table && tableById.has(gst.table)) {
      const n = next[gst.table] ?? 0;
      seats[gst.id] = { table: gst.table, seat: n };
      next[gst.table] = n + 1;
    } else {
      seats[gst.id] = null;
    }
  }
  return { seats, selectedTable: null, holding: null, notice: "" };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hold": {
      const gst = action.guestId ? guestById.get(action.guestId) : undefined;
      if (gst && gst.rsvp === "no") {
        return { ...state, holding: null, notice: `${gst.name} has declined, so can't be seated.` };
      }
      return { ...state, holding: action.guestId, notice: "" };
    }
    case "select":
      return { ...state, selectedTable: action.table };
    case "unseat": {
      const gst = guestById.get(action.guestId);
      if (!gst || !state.seats[action.guestId]) return { ...state, holding: null };
      return {
        ...state,
        seats: { ...state.seats, [action.guestId]: null },
        holding: state.holding === action.guestId ? null : state.holding,
        notice: `${gst.name} is no longer seated.`,
      };
    }
    case "place": {
      const gst = guestById.get(action.guestId);
      const tbl = tableById.get(action.table);
      if (!gst || !tbl) return state;
      if (gst.rsvp === "no") {
        return { ...state, holding: null, notice: `${gst.name} has declined, so can't be seated.` };
      }
      const occ = occupantsOf(state.seats);
      const firstFree = () => {
        for (let i = 0; i < tbl.seats; i++) if (!occ.has(seatKey(tbl.id, i))) return i;
        return -1;
      };
      const current = state.seats[gst.id];
      let target = action.seat;
      if (target === undefined) {
        if (current && current.table === tbl.id) {
          return { ...state, holding: null, selectedTable: tbl.id, notice: `${gst.name} is already at ${tbl.name}.` };
        }
        target = firstFree();
        if (target < 0) {
          return { ...state, notice: `${tbl.name} is full. Pick another table or unseat someone first.` };
        }
      }
      const occupantId = occ.get(seatKey(tbl.id, target));
      if (occupantId === gst.id) return { ...state, holding: null, selectedTable: tbl.id, notice: "" };
      const seats = { ...state.seats };
      let notice = `${gst.name} seated at ${tbl.name}, seat ${target + 1}.`;
      if (occupantId) {
        const other = guestById.get(occupantId)?.name ?? "Guest";
        if (current) {
          seats[occupantId] = current;
          notice = `${gst.name} and ${other} swapped seats.`;
        } else {
          const alt = firstFree();
          if (alt >= 0) {
            target = alt;
            notice = `${gst.name} seated at ${tbl.name}, seat ${alt + 1} (that seat was taken).`;
          } else {
            seats[occupantId] = null;
            notice = `${gst.name} took ${other}'s seat at ${tbl.name}; ${other} is now unseated.`;
          }
        }
      }
      seats[gst.id] = { table: tbl.id, seat: target };
      return { ...state, seats, holding: null, selectedTable: tbl.id, notice };
    }
    default:
      return state;
  }
}

function targetAt(x: number, y: number): DropTarget | null {
  const el = document.elementFromPoint(x, y)?.closest("[data-drop]");
  if (!el) return null;
  const kind = el.getAttribute("data-drop");
  const table = el.getAttribute("data-table");
  const seat = el.getAttribute("data-seat");
  if (kind === "unseat") return { kind: "unseat" };
  if (kind === "seat" && table && seat !== null) return { kind: "seat", table, seat: Number(seat) };
  if (kind === "table" && table) return { kind: "table", table };
  return null;
}

export type Counts = {
  confirmed: number;
  seated: number;
  toSeat: number;
  awaiting: number;
  declined: number;
  capacity: number;
};

type PlanContextValue = {
  seats: SeatMap;
  occupants: Map<string, string>;
  filled: Record<string, number>;
  selectedTable: string | null;
  holding: string | null;
  notice: string;
  results: RuleResult[];
  brokenTables: Set<string>;
  brokenGuests: Set<string>;
  counts: Counts;
  place: (guestId: string, table: string, seat?: number) => void;
  unseat: (guestId: string) => void;
  hold: (guestId: string | null) => void;
  select: (table: string | null) => void;
  drag: DragState | null;
  startDrag: (e: ReactPointerEvent, guestId: string) => void;
  consumeClick: () => boolean;
};

const PlanContext = createContext<PlanContextValue | null>(null);

export function usePlan(): PlanContextValue {
  const v = useContext(PlanContext);
  if (!v) throw new Error("usePlan must be used inside PlanProvider");
  return v;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, initState);
  const [drag, setDrag] = useState<DragState | null>(null);
  const suppress = useRef(false);

  const place = useCallback(
    (guestId: string, table: string, seat?: number) => dispatch({ type: "place", guestId, table, seat }),
    [],
  );
  const unseat = useCallback((guestId: string) => dispatch({ type: "unseat", guestId }), []);
  const hold = useCallback((guestId: string | null) => dispatch({ type: "hold", guestId }), []);
  const select = useCallback((table: string | null) => dispatch({ type: "select", table }), []);
  const consumeClick = useCallback(() => suppress.current, []);

  const startDrag = useCallback((e: ReactPointerEvent, guestId: string) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const sx = e.clientX;
    const sy = e.clientY;
    const id = e.pointerId;
    let active = false;

    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
    };
    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== id) return;
      if (!active) {
        if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return;
        active = true;
      }
      setDrag({ guestId, x: ev.clientX, y: ev.clientY, over: targetAt(ev.clientX, ev.clientY) });
    };
    const finish = (ev: PointerEvent, dropIt: boolean) => {
      if (ev.pointerId !== id) return;
      cleanup();
      if (!active) return;
      suppress.current = true;
      window.setTimeout(() => {
        suppress.current = false;
      }, 80);
      setDrag(null);
      if (!dropIt) return;
      const t = targetAt(ev.clientX, ev.clientY);
      if (!t) return;
      if (t.kind === "unseat") dispatch({ type: "unseat", guestId });
      else if (t.kind === "seat") dispatch({ type: "place", guestId, table: t.table, seat: t.seat });
      else dispatch({ type: "place", guestId, table: t.table });
    };
    const up = (ev: PointerEvent) => finish(ev, true);
    const cancel = (ev: PointerEvent) => finish(ev, false);

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch({ type: "hold", guestId: null });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!drag) return;
    document.body.classList.add("select-none", "cursor-grabbing");
    return () => document.body.classList.remove("select-none", "cursor-grabbing");
  }, [drag === null]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo<PlanContextValue>(() => {
    const occupants = occupantsOf(state.seats);
    const filled: Record<string, number> = {};
    for (const t of tables) filled[t.id] = 0;
    for (const s of Object.values(state.seats)) if (s) filled[s.table] = (filled[s.table] ?? 0) + 1;
    const results = evaluateRules(state.seats);
    const brokenTables = new Set<string>();
    const brokenGuests = new Set<string>();
    for (const r of results) {
      if (r.status !== "broken") continue;
      r.tables.forEach((t) => brokenTables.add(t));
      r.guests.forEach((gid) => brokenGuests.add(gid));
    }
    const counts: Counts = {
      confirmed: guests.filter((x) => x.rsvp === "yes").length,
      seated: Object.values(state.seats).filter(Boolean).length,
      toSeat: guests.filter((x) => x.rsvp === "yes" && !state.seats[x.id]).length,
      awaiting: guests.filter((x) => x.rsvp === "maybe" || x.rsvp === "pending").length,
      declined: guests.filter((x) => x.rsvp === "no").length,
      capacity: tables.reduce((n, t) => n + t.seats, 0),
    };
    return {
      seats: state.seats,
      occupants,
      filled,
      selectedTable: state.selectedTable,
      holding: state.holding,
      notice: state.notice,
      results,
      brokenTables,
      brokenGuests,
      counts,
      place,
      unseat,
      hold,
      select,
      drag,
      startDrag,
      consumeClick,
    };
  }, [state, drag, place, unseat, hold, select, startDrag, consumeClick]);

  const dragged = drag ? guestById.get(drag.guestId) : undefined;

  return (
    <PlanContext.Provider value={value}>
      {children}
      {drag && dragged ? (
        <div
          aria-hidden
          className="pointer-events-none fixed z-50 flex items-center gap-2 rounded-full bg-white py-1.5 pr-3 pl-1.5 text-sm font-medium text-stone-900 shadow-lg ring-1 ring-stone-300"
          style={{ left: drag.x + 12, top: drag.y + 12 }}
        >
          <span
            className="size-5 rounded-full"
            style={{ backgroundColor: partyColor[dragged.party] ?? "#57534e" }}
          />
          {dragged.name}
        </div>
      ) : null}
    </PlanContext.Provider>
  );
}
```

```tsx components/ui.tsx
import type { ReactNode } from "react";
import { partyColor, rsvpLabel, type Rsvp } from "@/lib/data";

export function Card({
  title,
  action,
  children,
  className = "",
  ...rest
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={`rounded-2xl border border-stone-200 bg-white shadow-sm ${className}`}
      {...rest}
    >
      {title ? (
        <header className="flex items-center justify-between gap-3 border-b border-stone-100 px-4 py-3">
          <h2 className="text-sm font-semibold tracking-tight text-stone-900">{title}</h2>
          {action}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function PartyDot({ party }: { party: string }) {
  return (
    <span
      aria-hidden
      className="inline-block size-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: partyColor[party] ?? "#57534e" }}
    />
  );
}

export function DietBadge({ diet }: { diet: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
      {diet}
    </span>
  );
}

const rsvpStyles: Record<Rsvp, string> = {
  yes: "bg-emerald-100 text-emerald-900",
  maybe: "bg-amber-100 text-amber-900",
  pending: "bg-stone-100 text-stone-700",
  no: "bg-rose-100 text-rose-900",
};

export function RsvpBadge({ rsvp }: { rsvp: Rsvp }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${rsvpStyles[rsvp]}`}>
      {rsvpLabel[rsvp]}
    </span>
  );
}
```

```tsx components/AppHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Armchair, LayoutGrid, Users } from "lucide-react";
import { appName, event, formatDate, initials, planner } from "@/lib/data";

const nav = [
  { href: "/", label: "Plan", icon: LayoutGrid },
  { href: "/guests", label: "Guests", icon: Users },
];

export default function AppHeader() {
  const pathname = usePathname();
  return (
    <header className="border-b border-stone-200 bg-white print:hidden">
      <div className="mx-auto flex w-full max-w-[1500px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg">
          <span className="grid size-9 place-items-center rounded-xl bg-teal-700 text-white">
            <Armchair className="size-5" aria-hidden />
          </span>
          <span className="text-lg font-semibold tracking-tight text-stone-900">{appName}</span>
        </Link>

        <nav aria-label="Main" className="order-last flex w-full gap-1 sm:order-none sm:w-auto">
          {nav.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium sm:flex-none ${
                  active ? "bg-teal-50 text-teal-800" : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <Icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden text-right text-sm lg:block">
          <p className="font-medium text-stone-900">{event.name}</p>
          <p className="text-stone-500">
            {formatDate(event.date)} · {event.venue}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-full bg-stone-800 text-xs font-semibold text-white"
          >
            {initials(planner.name)}
          </span>
          <span className="hidden text-sm font-medium text-stone-700 sm:inline">{planner.name}</span>
        </div>
      </div>
    </header>
  );
}
```

```tsx components/FloorPlan.tsx
"use client";

import { useState, type KeyboardEvent } from "react";
import { event, fixtures, guestById, initials, parties, partyColor, tables, type Table } from "@/lib/data";
import { longSize, roundRadius, seatPoints, SEAT_R } from "@/lib/geometry";
import { seatKey, usePlan } from "@/lib/plan";

type Hover = { x: number; y: number; text: string };

function activate(handler: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handler();
    }
  };
}

export default function FloorPlan() {
  const plan = usePlan();
  const [hover, setHover] = useState<Hover | null>(null);
  const W = event.room.width;
  const D = event.room.depth;
  const placing = plan.holding !== null || plan.drag !== null;
  const over = plan.drag?.over ?? null;

  const onTable = (t: Table) => {
    if (plan.consumeClick()) return;
    if (plan.holding) plan.place(plan.holding, t.id);
    else plan.select(plan.selectedTable === t.id ? null : t.id);
  };

  const onSeat = (t: Table, i: number, guestId: string | undefined) => {
    if (plan.consumeClick()) return;
    if (plan.holding) {
      plan.place(plan.holding, t.id, i);
      return;
    }
    plan.select(t.id);
    if (guestId) plan.hold(guestId);
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`-1.4 -1 ${W + 2.8} ${D + 2}`}
          className="block h-auto w-full min-w-[760px] select-none"
          role="group"
          aria-label={`Room plan, ${W} by ${D} metres, drawn to scale`}
        >
          <defs>
            <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
              <path d="M1 0H0V1" fill="none" stroke="#e7e5e4" strokeWidth="0.03" />
            </pattern>
          </defs>

          <rect
            x={0}
            y={0}
            width={W}
            height={D}
            fill="#fafaf9"
            stroke="#a8a29e"
            strokeWidth={0.12}
            onClick={() => {
              if (!plan.consumeClick()) plan.select(null);
            }}
          />
          <rect x={0} y={0} width={W} height={D} fill="url(#grid)" pointerEvents="none" />

          <text x={W / 2} y={-0.4} textAnchor="middle" fontSize={0.42} fill="#78716c">
            {W} m
          </text>
          <text
            transform={`translate(${W + 0.75} ${D / 2}) rotate(90)`}
            textAnchor="middle"
            fontSize={0.42}
            fill="#78716c"
          >
            {D} m
          </text>
          <g aria-hidden>
            <path d={`M0 ${D + 0.55}H2M0 ${D + 0.4}V${D + 0.7}M2 ${D + 0.4}V${D + 0.7}`} stroke="#78716c" strokeWidth={0.06} fill="none" />
            <text x={2.3} y={D + 0.68} fontSize={0.4} fill="#78716c">
              2 m
            </text>
          </g>

          {fixtures.map((f) => {
            const cx = f.x + f.w / 2;
            const cy = f.y + f.h / 2;
            if (f.kind === "door") {
              return (
                <g key={f.id}>
                  <rect x={f.x} y={f.y} width={f.w} height={f.h} fill="#38bdf8" stroke="#0369a1" strokeWidth={0.05}>
                    <title>{f.label}</title>
                  </rect>
                  <text
                    transform={`translate(-0.5 ${cy}) rotate(-90)`}
                    textAnchor="middle"
                    fontSize={0.42}
                    fill="#0369a1"
                    fontWeight={600}
                  >
                    {f.label}
                  </text>
                </g>
              );
            }
            const style =
              f.kind === "stage"
                ? { fill: "#334155", stroke: "#1e293b", text: "#ffffff" }
                : f.kind === "bar"
                  ? { fill: "#78716c", stroke: "#57534e", text: "#ffffff" }
                  : { fill: "#fef3c7", stroke: "#f59e0b", text: "#92400e" };
            return (
              <g key={f.id}>
                <rect
                  x={f.x}
                  y={f.y}
                  width={f.w}
                  height={f.h}
                  rx={0.15}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={0.06}
                  strokeDasharray={f.kind === "dancefloor" ? "0.25 0.15" : undefined}
                />
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={0.5}
                  fontWeight={600}
                  fill={style.text}
                >
                  {f.label}
                </text>
              </g>
            );
          })}

          {tables.map((t) => {
            const filled = plan.filled[t.id] ?? 0;
            const broken = plan.brokenTables.has(t.id);
            const selected = plan.selectedTable === t.id;
            const tableOver = over?.kind === "table" && over.table === t.id;
            const stroke = broken ? "#e11d48" : selected ? "#0f766e" : "#a8a29e";
            const sw = broken || selected ? 0.12 : 0.06;
            const fill = tableOver ? "#ccfbf1" : selected ? "#f0fdfa" : "#ffffff";
            const label = `${t.name}, ${filled} of ${t.seats} seats filled${broken ? ", a seating rule is broken here" : ""}`;
            const long = t.shape === "long" ? longSize(t) : null;
            const r = roundRadius(t);
            const badge = long ? { x: t.x + long.w / 2, y: t.y - long.d / 2 } : { x: t.x + r * 0.75, y: t.y - r * 0.75 };

            return (
              <g key={t.id}>
                <g
                  role="button"
                  tabIndex={0}
                  aria-label={label}
                  aria-pressed={selected}
                  data-drop="table"
                  data-table={t.id}
                  className="cursor-pointer outline-none"
                  onClick={() => onTable(t)}
                  onKeyDown={activate(() => onTable(t))}
                >
                  {long ? (
                    <>
                      <rect
                        x={t.x - long.w / 2}
                        y={t.y - long.d / 2}
                        width={long.w}
                        height={long.d}
                        rx={0.2}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={sw}
                        transform={`rotate(${t.rotation ?? 0} ${t.x} ${t.y})`}
                      />
                      <rect
                        className="ring"
                        x={t.x - long.w / 2 - 0.12}
                        y={t.y - long.d / 2 - 0.12}
                        width={long.w + 0.24}
                        height={long.d + 0.24}
                        rx={0.3}
                        fill="none"
                        stroke="transparent"
                        transform={`rotate(${t.rotation ?? 0} ${t.x} ${t.y})`}
                      />
                    </>
                  ) : (
                    <>
                      <circle cx={t.x} cy={t.y} r={r} fill={fill} stroke={stroke} strokeWidth={sw} />
                      <circle className="ring" cx={t.x} cy={t.y} r={r + 0.12} fill="none" stroke="transparent" />
                    </>
                  )}
                  <text
                    x={t.x}
                    y={t.y - 0.08}
                    textAnchor="middle"
                    fontSize={0.4}
                    fontWeight={600}
                    fill="#1c1917"
                    pointerEvents="none"
                  >
                    {t.name}
                  </text>
                  <text x={t.x} y={t.y + 0.38} textAnchor="middle" fontSize={0.34} fill="#57534e" pointerEvents="none">
                    {filled}/{t.seats} seated
                  </text>
                </g>
                {broken ? (
                  <g aria-hidden pointerEvents="none">
                    <circle cx={badge.x} cy={badge.y} r={0.28} fill="#e11d48" stroke="#ffffff" strokeWidth={0.05} />
                    <text x={badge.x} y={badge.y} textAnchor="middle" dominantBaseline="central" fontSize={0.38} fontWeight={700} fill="#ffffff">
                      !
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}

          {tables.map((t) =>
            seatPoints(t).map((p, i) => {
              const gid = plan.occupants.get(seatKey(t.id, i));
              const guest = gid ? guestById.get(gid) : undefined;
              const isOver = over?.kind === "seat" && over.table === t.id && over.seat === i;
              const held = gid !== undefined && plan.holding === gid;
              const dragging = gid !== undefined && plan.drag?.guestId === gid;
              const flagged = gid !== undefined && plan.brokenGuests.has(gid);
              const label = guest
                ? `${t.name}, seat ${i + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}${flagged ? ", involved in a broken rule" : ""}. ${plan.holding ? "Swap with held guest" : "Pick up to move"}`
                : `${t.name}, seat ${i + 1}: empty${plan.holding ? ". Seat held guest here" : ""}`;
              return (
                <g
                  key={`${t.id}-${i}`}
                  role="button"
                  tabIndex={0}
                  aria-label={label}
                  aria-pressed={guest ? held : undefined}
                  data-drop="seat"
                  data-table={t.id}
                  data-seat={i}
                  className="cursor-pointer outline-none"
                  style={{ touchAction: guest ? "none" : undefined, opacity: dragging ? 0.4 : 1 }}
                  onClick={() => onSeat(t, i, gid)}
                  onKeyDown={activate(() => onSeat(t, i, gid))}
                  onPointerDown={gid ? (e) => plan.startDrag(e, gid) : undefined}
                  onPointerEnter={() => guest && setHover({ x: p.x, y: p.y - 0.65, text: guest.name })}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => guest && setHover({ x: p.x, y: p.y - 0.65, text: guest.name })}
                  onBlur={() => setHover(null)}
                >
                  <circle className="ring" cx={p.x} cy={p.y} r={SEAT_R + 0.14} fill="none" stroke="transparent" />
                  {guest ? (
                    <>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={SEAT_R}
                        fill={partyColor[guest.party] ?? "#57534e"}
                        stroke={flagged ? "#e11d48" : held ? "#0f766e" : "#ffffff"}
                        strokeWidth={flagged || held ? 0.12 : 0.05}
                        strokeDasharray={held ? "0.15 0.1" : undefined}
                      />
                      <text
                        x={p.x}
                        y={p.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={0.3}
                        fontWeight={700}
                        fill="#ffffff"
                        pointerEvents="none"
                      >
                        {initials(guest.name)}
                      </text>
                      {guest.diet ? (
                        <circle cx={p.x + 0.3} cy={p.y - 0.3} r={0.11} fill="#f59e0b" stroke="#ffffff" strokeWidth={0.04} pointerEvents="none" />
                      ) : null}
                    </>
                  ) : (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={SEAT_R}
                      fill={isOver ? "#99f6e4" : placing ? "#f0fdfa" : "#ffffff"}
                      stroke={placing ? "#14b8a6" : "#a8a29e"}
                      strokeWidth={placing ? 0.08 : 0.05}
                      strokeDasharray="0.12 0.1"
                    />
                  )}
                </g>
              );
            }),
          )}

          {hover && !plan.drag ? (
            <g pointerEvents="none" aria-hidden>
              <rect
                x={Math.min(Math.max(hover.x - (hover.text.length * 0.115 + 0.35), -1.2), W + 1.2 - (hover.text.length * 0.23 + 0.7))}
                y={hover.y - 0.32}
                width={hover.text.length * 0.23 + 0.7}
                height={0.64}
                rx={0.32}
                fill="#1c1917"
              />
              <text
                x={Math.min(Math.max(hover.x - (hover.text.length * 0.115 + 0.35), -1.2), W + 1.2 - (hover.text.length * 0.23 + 0.7)) + (hover.text.length * 0.23 + 0.7) / 2}
                y={hover.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={0.34}
                fill="#ffffff"
              >
                {hover.text}
              </text>
            </g>
          ) : null}
        </svg>
      </div>

      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-stone-100 px-4 py-3 text-xs text-stone-600" aria-label="Legend">
        {parties.map((p) => (
          <li key={p} className="flex items-center gap-1.5">
            <span aria-hidden className="inline-block size-3 rounded-full" style={{ backgroundColor: partyColor[p] }} />
            {p}
          </li>
        ))}
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block size-2.5 rounded-full bg-amber-500" />
          Dietary need
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block size-3 rounded-full border border-dashed border-stone-400" />
          Empty seat
        </li>
      </ul>
    </div>
  );
}
```

```tsx components/RulesPanel.tsx
"use client";

import { CircleCheck, Hourglass, TriangleAlert } from "lucide-react";
import { tableById } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { Card } from "./ui";

export default function RulesPanel() {
  const plan = usePlan();
  const broken = plan.results.filter((r) => r.status === "broken").length;
  const waiting = plan.results.filter((r) => r.status === "pending").length;
  const kept = plan.results.filter((r) => r.status === "ok").length;

  return (
    <Card
      title="The couple's rules"
      action={
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            broken > 0 ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {broken > 0 ? `${broken} broken` : "None broken"}
        </span>
      }
    >
      <p className="px-4 pt-3 text-sm text-stone-600" role="status">
        {broken} broken, {waiting} waiting on seating, {kept} kept.
      </p>
      <ul className="divide-y divide-stone-100 p-1.5">
        {plan.results.map((r) => {
          const Icon = r.status === "broken" ? TriangleAlert : r.status === "ok" ? CircleCheck : Hourglass;
          const color =
            r.status === "broken" ? "text-rose-600" : r.status === "ok" ? "text-emerald-600" : "text-amber-600";
          const statusText = r.status === "broken" ? "Broken" : r.status === "ok" ? "Kept" : "Waiting";
          const first = r.tables[0];
          const body = (
            <>
              <Icon className={`mt-0.5 size-4 shrink-0 ${color}`} aria-hidden />
              <span className="min-w-0 text-left">
                <span className="block text-sm font-medium text-stone-900">
                  <span className="sr-only">{statusText}. </span>
                  {r.title}
                </span>
                <span className="block text-xs text-stone-600">{r.detail}</span>
                <span className="block text-xs text-stone-400 italic">{r.rule.note}</span>
                {r.status === "broken" && r.tables.length > 0 ? (
                  <span className="mt-1 block text-xs font-medium text-rose-700">
                    Flagged: {r.tables.map((t) => tableById.get(t)?.name ?? t).join(", ")}
                  </span>
                ) : null}
              </span>
            </>
          );
          return (
            <li key={r.index} className={r.status === "broken" ? "rounded-xl bg-rose-50/60" : undefined}>
              {first ? (
                <button
                  type="button"
                  onClick={() => plan.select(first)}
                  className="flex min-h-11 w-full items-start gap-2.5 rounded-xl px-2.5 py-2.5 hover:bg-stone-50"
                >
                  {body}
                </button>
              ) : (
                <div className="flex items-start gap-2.5 px-2.5 py-2.5">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
```

```tsx components/TablePanel.tsx
"use client";

import { MoveRight, UserMinus } from "lucide-react";
import { guestById, tableById, tables } from "@/lib/data";
import { seatKey, usePlan } from "@/lib/plan";
import { Card, DietBadge, PartyDot } from "./ui";

export default function TablePanel() {
  const plan = usePlan();
  const table = plan.selectedTable ? tableById.get(plan.selectedTable) : undefined;

  const rows = table
    ? Array.from({ length: table.seats }, (_, i) => {
        const gid = plan.occupants.get(seatKey(table.id, i));
        return { seat: i, guest: gid ? guestById.get(gid) : undefined };
      })
    : [];
  const seated = rows.flatMap((r) => (r.guest ? [r.guest] : []));
  const dietCounts = new Map<string, number>();
  for (const gst of seated) if (gst.diet) dietCounts.set(gst.diet, (dietCounts.get(gst.diet) ?? 0) + 1);
  const brokenHere = table
    ? plan.results.filter((r) => r.status === "broken" && r.tables.includes(table.id))
    : [];

  return (
    <Card title={table ? table.name : "Tables"}>
      <div className="flex flex-wrap gap-1.5 p-3" role="group" aria-label="Choose a table">
        {tables.map((t) => {
          const active = t.id === plan.selectedTable;
          const bad = plan.brokenTables.has(t.id);
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={active}
              onClick={() => plan.select(active ? null : t.id)}
              className={`min-h-11 rounded-lg border px-3 text-xs font-medium ${
                active
                  ? "border-teal-700 bg-teal-700 text-white"
                  : bad
                    ? "border-rose-300 bg-rose-50 text-rose-800"
                    : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
              }`}
            >
              {t.name} <span className="opacity-70">{plan.filled[t.id]}/{t.seats}</span>
            </button>
          );
        })}
      </div>

      {!table ? (
        <p className="border-t border-stone-100 px-4 py-4 text-sm text-stone-500">
          Select a table on the plan to see who is sitting there and what they eat.
        </p>
      ) : (
        <div className="border-t border-stone-100">
          <div className="px-4 pt-3 text-sm text-stone-600">
            <p>
              <strong className="text-stone-900">{seated.length}</strong> of {table.seats} seats filled
              {seated.length < table.seats ? `, ${table.seats - seated.length} empty` : ", table is full"}.
            </p>
            <p className="mt-1">
              {dietCounts.size === 0
                ? "No dietary needs at this table."
                : `Dietary needs: ${Array.from(dietCounts, ([d, n]) => `${n} ${d}`).join(", ")}.`}
            </p>
          </div>

          {brokenHere.length > 0 ? (
            <ul className="mx-4 mt-3 space-y-1 rounded-xl bg-rose-50 p-3 text-xs text-rose-900">
              {brokenHere.map((r) => (
                <li key={r.index}>
                  <strong>{r.title}.</strong> {r.detail}
                </li>
              ))}
            </ul>
          ) : null}

          <ol className="mt-2 divide-y divide-stone-100 px-1.5 pb-1.5">
            {rows.map(({ seat, guest }) => (
              <li key={seat} className="flex items-center gap-2 px-2.5 py-2">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-stone-100 text-xs font-medium text-stone-600">
                  {seat + 1}
                </span>
                {guest ? (
                  <>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 text-sm font-medium text-stone-900">
                        <PartyDot party={guest.party} />
                        <span className="truncate">{guest.name}</span>
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-stone-500">
                        {guest.party}
                        {guest.diet ? <DietBadge diet={guest.diet} /> : null}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => plan.hold(plan.holding === guest.id ? null : guest.id)}
                      aria-pressed={plan.holding === guest.id}
                      aria-label={`Move ${guest.name}`}
                      className={`grid size-11 place-items-center rounded-lg border ${
                        plan.holding === guest.id
                          ? "border-teal-700 bg-teal-50 text-teal-800"
                          : "border-stone-200 text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      <MoveRight className="size-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => plan.unseat(guest.id)}
                      aria-label={`Unseat ${guest.name}`}
                      className="grid size-11 place-items-center rounded-lg border border-stone-200 text-stone-600 hover:bg-rose-50 hover:text-rose-700"
                    >
                      <UserMinus className="size-4" aria-hidden />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={!plan.holding}
                    onClick={() => plan.holding && plan.place(plan.holding, table.id, seat)}
                    className="min-h-11 flex-1 rounded-lg border border-dashed border-stone-300 px-3 text-left text-xs text-stone-500 enabled:border-teal-500 enabled:bg-teal-50 enabled:text-teal-800"
                  >
                    Empty seat{plan.holding ? ": seat held guest here" : ""}
                  </button>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </Card>
  );
}
```

```tsx components/UnseatedPanel.tsx
"use client";

import { GripVertical } from "lucide-react";
import type { PointerEvent } from "react";
import { guests, tables, type Guest } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { Card, DietBadge, PartyDot, RsvpBadge } from "./ui";

function GuestRow({ guest }: { guest: Guest }) {
  const plan = usePlan();
  const held = plan.holding === guest.id;
  const dragging = plan.drag?.guestId === guest.id;

  const onPointerDown = (e: PointerEvent<HTMLLIElement>) => {
    const el = e.target as Element;
    if (el.closest("button,select,option")) return;
    if (e.pointerType === "touch" && !el.closest("[data-handle]")) return;
    plan.startDrag(e, guest.id);
  };

  return (
    <li
      onPointerDown={onPointerDown}
      className={`flex items-center gap-2 rounded-xl px-1.5 py-2 ${
        held ? "bg-teal-50 ring-1 ring-teal-600" : "hover:bg-stone-50"
      } ${dragging ? "opacity-40" : ""}`}
    >
      <span
        data-handle
        aria-hidden
        className="grid size-9 shrink-0 cursor-grab place-items-center text-stone-400"
        style={{ touchAction: "none" }}
      >
        <GripVertical className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-sm font-medium text-stone-900">
          <PartyDot party={guest.party} />
          <span className="truncate">{guest.name}</span>
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-stone-500">
          {guest.party}
          {guest.diet ? <DietBadge diet={guest.diet} /> : null}
          {guest.rsvp !== "yes" ? <RsvpBadge rsvp={guest.rsvp} /> : null}
        </span>
      </span>
      <select
        aria-label={`Seat ${guest.name} at a table`}
        value=""
        onChange={(e) => e.target.value && plan.place(guest.id, e.target.value)}
        className="min-h-11 w-24 rounded-lg border border-stone-200 bg-white px-1.5 text-xs text-stone-700"
      >
        <option value="">Seat at…</option>
        {tables.map((t) => {
          const free = t.seats - (plan.filled[t.id] ?? 0);
          return (
            <option key={t.id} value={t.id} disabled={free === 0}>
              {t.name} ({free} free)
            </option>
          );
        })}
      </select>
      <button
        type="button"
        aria-pressed={held}
        onClick={() => plan.hold(held ? null : guest.id)}
        className={`min-h-11 rounded-lg border px-3 text-xs font-medium ${
          held ? "border-teal-700 bg-teal-700 text-white" : "border-stone-200 text-stone-700 hover:bg-stone-100"
        }`}
      >
        {held ? "Placing" : "Place"}
      </button>
    </li>
  );
}

export default function UnseatedPanel() {
  const plan = usePlan();
  const toSeat = guests.filter((x) => x.rsvp === "yes" && !plan.seats[x.id]);
  const unconfirmed = guests.filter((x) => (x.rsvp === "maybe" || x.rsvp === "pending") && !plan.seats[x.id]);
  const overZone = plan.drag?.over?.kind === "unseat";

  return (
    <Card
      title={`Attending, not seated (${toSeat.length})`}
      data-drop="unseat"
      className={overZone ? "ring-2 ring-teal-500" : plan.drag ? "ring-1 ring-teal-300" : ""}
    >
      {toSeat.length === 0 ? (
        <p className="px-4 py-4 text-sm text-emerald-700">Everyone who is attending has a seat.</p>
      ) : (
        <ul className="p-1.5">
          {toSeat.map((gst) => (
            <GuestRow key={gst.id} guest={gst} />
          ))}
        </ul>
      )}
      {plan.drag ? (
        <p className="border-t border-stone-100 px-4 py-2 text-xs text-teal-800">Drop here to unseat.</p>
      ) : null}
      {unconfirmed.length > 0 ? (
        <details className="border-t border-stone-100">
          <summary className="flex min-h-11 cursor-pointer items-center px-4 text-sm font-medium text-stone-700">
            Not confirmed yet ({unconfirmed.length})
          </summary>
          <ul className="p-1.5 pt-0">
            {unconfirmed.map((gst) => (
              <GuestRow key={gst.id} guest={gst} />
            ))}
          </ul>
        </details>
      ) : null}
    </Card>
  );
}
```

```tsx app/page.tsx
"use client";

import { Hand, X } from "lucide-react";
import FloorPlan from "@/components/FloorPlan";
import RulesPanel from "@/components/RulesPanel";
import TablePanel from "@/components/TablePanel";
import UnseatedPanel from "@/components/UnseatedPanel";
import { Card } from "@/components/ui";
import { event, formatDate, guestById } from "@/lib/data";
import { usePlan } from "@/lib/plan";

function Stat({ label, value, hint, tone }: { label: string; value: number; hint: string; tone?: "warn" | "good" }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">{label}</p>
      <p
        className={`mt-1 text-3xl font-semibold tabular-nums ${
          tone === "warn" ? "text-amber-700" : tone === "good" ? "text-emerald-700" : "text-stone-900"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-stone-500">{hint}</p>
    </div>
  );
}

export default function PlanPage() {
  const plan = usePlan();
  const { counts } = plan;
  const holding = plan.holding ? guestById.get(plan.holding) : undefined;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">{event.name}</h1>
        <p className="text-sm text-stone-600">
          {formatDate(event.date)} · {event.venue} · {event.room.width} × {event.room.depth} m room
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Attending" value={counts.confirmed} hint="confirmed yes" />
        <Stat label="Seated" value={counts.seated} hint={`of ${counts.capacity} seats`} />
        <Stat
          label="To seat"
          value={counts.toSeat}
          hint="attending, no seat"
          tone={counts.toSeat > 0 ? "warn" : "good"}
        />
        <Stat label="Awaiting" value={counts.awaiting} hint="maybe or no reply" />
        <Stat label="Declined" value={counts.declined} hint="not coming" />
      </div>

      <div className="min-h-6" role="status" aria-live="polite">
        {holding ? (
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-teal-700 px-4 py-2.5 text-sm text-white">
            <Hand className="size-4" aria-hidden />
            <span className="flex-1">
              Moving <strong>{holding.name}</strong>: tap a seat or table, or press Escape to cancel.
            </span>
            {plan.seats[holding.id] ? (
              <button
                type="button"
                onClick={() => plan.unseat(holding.id)}
                className="min-h-11 rounded-lg bg-white/15 px-3 font-medium hover:bg-white/25"
              >
                Unseat
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => plan.hold(null)}
              className="flex min-h-11 items-center gap-1 rounded-lg bg-white/15 px-3 font-medium hover:bg-white/25"
            >
              <X className="size-4" aria-hidden /> Cancel
            </button>
          </div>
        ) : plan.notice ? (
          <p className="text-sm text-stone-700">{plan.notice}</p>
        ) : (
          <p className="text-sm text-stone-500">
            Drag a guest to a seat, or tap a guest and then a seat. Tap a table to see its guests.
          </p>
        )}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card title="Room plan" className="overflow-hidden">
          <FloorPlan />
        </Card>
        <div className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-1">
          <RulesPanel />
          <TablePanel />
          <div className="md:col-span-2 xl:col-span-1">
            <UnseatedPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
```

```tsx app/guests/page.tsx
"use client";

import Link from "next/link";
import { Printer, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, DietBadge, PartyDot, RsvpBadge } from "@/components/ui";
import { diets, event, formatDate, guests, parties, tableById, tables, type Rsvp } from "@/lib/data";
import { usePlan } from "@/lib/plan";

const selectClass =
  "min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-800";

export default function GuestsPage() {
  const plan = usePlan();
  const [query, setQuery] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState<"all" | Rsvp>("all");
  const [diet, setDiet] = useState("all");
  const [table, setTable] = useState("all");
  const [includeUnconfirmed, setIncludeUnconfirmed] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests.filter((gst) => {
      if (q && !gst.name.toLowerCase().includes(q)) return false;
      if (party !== "all" && gst.party !== party) return false;
      if (rsvp !== "all" && gst.rsvp !== rsvp) return false;
      if (diet === "none" ? gst.diet !== null : diet !== "all" && gst.diet !== diet) return false;
      const seat = plan.seats[gst.id];
      if (table === "unseated" ? seat !== null : table !== "all" && seat?.table !== table) return false;
      return true;
    });
  }, [query, party, rsvp, diet, table, plan.seats]);

  const meals = useMemo(() => {
    const m = new Map<string, number>();
    for (const gst of guests) {
      const counts = gst.rsvp === "yes" || (includeUnconfirmed && (gst.rsvp === "maybe" || gst.rsvp === "pending"));
      if (!counts) continue;
      const key = gst.diet ?? "Standard menu";
      m.set(key, (m.get(key) ?? 0) + 1);
    }
    const rows = Array.from(m, ([name, count]) => ({ name, count }));
    rows.sort((a, b) =>
      a.name === "Standard menu" ? -1 : b.name === "Standard menu" ? 1 : b.count - a.count || a.name.localeCompare(b.name),
    );
    const total = rows.reduce((n, r) => n + r.count, 0);
    const special = rows.filter((r) => r.name !== "Standard menu").reduce((n, r) => n + r.count, 0);
    return { rows, total, special };
  }, [includeUnconfirmed]);

  const reset = () => {
    setQuery("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
    setTable("all");
  };
  const filtering = query !== "" || party !== "all" || rsvp !== "all" || diet !== "all" || table !== "all";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">Guest list</h1>
          <p className="text-sm text-stone-600">
            {event.name} · {formatDate(event.date)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex min-h-11 items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 text-sm font-medium text-stone-800 hover:bg-stone-50 print:hidden"
        >
          <Printer className="size-4" aria-hidden /> Print for the caterer
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <Card className="p-4 print:hidden">
            <form role="search" onSubmit={(e) => e.preventDefault()} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <div className="relative sm:col-span-2 xl:col-span-5">
                <label htmlFor="q" className="sr-only">
                  Search guests by name
                </label>
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-400" aria-hidden />
                <input
                  id="q"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name"
                  className="min-h-11 w-full rounded-lg border border-stone-300 bg-white pr-3 pl-9 text-sm text-stone-900 placeholder:text-stone-400"
                />
              </div>
              <label className="text-xs font-medium text-stone-600">
                Party
                <select className={`${selectClass} mt-1`} value={party} onChange={(e) => setParty(e.target.value)}>
                  <option value="all">All parties</option>
                  {parties.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-medium text-stone-600">
                RSVP
                <select
                  className={`${selectClass} mt-1`}
                  value={rsvp}
                  onChange={(e) => setRsvp(e.target.value as "all" | Rsvp)}
                >
                  <option value="all">Any reply</option>
                  <option value="yes">Attending</option>
                  <option value="maybe">Maybe</option>
                  <option value="pending">Awaiting reply</option>
                  <option value="no">Declined</option>
                </select>
              </label>
              <label className="text-xs font-medium text-stone-600">
                Diet
                <select className={`${selectClass} mt-1`} value={diet} onChange={(e) => setDiet(e.target.value)}>
                  <option value="all">Any diet</option>
                  <option value="none">No dietary needs</option>
                  {diets.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-medium text-stone-600">
                Table
                <select className={`${selectClass} mt-1`} value={table} onChange={(e) => setTable(e.target.value)}>
                  <option value="all">Any table</option>
                  <option value="unseated">Not seated</option>
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={reset}
                  disabled={!filtering}
                  className="min-h-11 w-full rounded-lg border border-stone-300 px-3 text-sm font-medium text-stone-700 enabled:hover:bg-stone-50 disabled:opacity-40"
                >
                  Clear filters
                </button>
              </div>
            </form>
          </Card>

          <Card>
            <p className="border-b border-stone-100 px-4 py-3 text-sm text-stone-600" role="status" aria-live="polite">
              Showing <strong className="text-stone-900">{filtered.length}</strong> of {guests.length} guests
            </p>
            {filtered.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-stone-500">No guests match these filters.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Guests with party, reply, dietary need and table</caption>
                  <thead className="bg-stone-50 text-xs font-semibold tracking-wide text-stone-500 uppercase">
                    <tr>
                      <th scope="col" className="px-4 py-2.5">Guest</th>
                      <th scope="col" className="hidden px-3 py-2.5 md:table-cell">Party</th>
                      <th scope="col" className="px-3 py-2.5">RSVP</th>
                      <th scope="col" className="px-3 py-2.5">Diet</th>
                      <th scope="col" className="px-4 py-2.5">Table</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filtered.map((gst) => {
                      const seat = plan.seats[gst.id];
                      const tbl = seat ? tableById.get(seat.table) : undefined;
                      return (
                        <tr key={gst.id} className="align-top">
                          <th scope="row" className="px-4 py-3 font-medium text-stone-900">
                            {gst.name}
                            <span className="mt-0.5 flex items-center gap-1.5 text-xs font-normal text-stone-500 md:hidden">
                              <PartyDot party={gst.party} />
                              {gst.party}
                            </span>
                          </th>
                          <td className="hidden px-3 py-3 text-stone-600 md:table-cell">
                            <span className="flex items-center gap-2">
                              <PartyDot party={gst.party} />
                              {gst.party}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <RsvpBadge rsvp={gst.rsvp} />
                          </td>
                          <td className="px-3 py-3">
                            {gst.diet ? <DietBadge diet={gst.diet} /> : <span className="text-stone-400">None</span>}
                          </td>
                          <td className="px-4 py-3">
                            {tbl && seat ? (
                              <Link
                                href="/"
                                onClick={() => plan.select(tbl.id)}
                                className="font-medium text-teal-800 underline-offset-2 hover:underline"
                              >
                                {tbl.name}
                                <span className="font-normal text-stone-500"> · seat {seat.seat + 1}</span>
                              </Link>
                            ) : gst.rsvp === "no" ? (
                              <span className="text-stone-400">Not coming</span>
                            ) : (
                              <span className="font-medium text-amber-700">Not seated</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <aside aria-label="Meal counts" className="lg:sticky lg:top-4 lg:self-start">
          <Card title="Meals for the caterer">
            <div className="px-4 pt-3">
              <p className="text-4xl font-semibold tabular-nums text-stone-900">{meals.total}</p>
              <p className="text-sm text-stone-600">
                {includeUnconfirmed ? "meals if every maybe and pending guest comes" : "meals for confirmed guests"},{" "}
                {meals.special} with a dietary need
              </p>
            </div>
            <ul className="space-y-2.5 px-4 py-4">
              {meals.rows.map((r) => (
                <li key={r.name}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="text-stone-800">{r.name}</span>
                    <span className="font-semibold tabular-nums text-stone-900">{r.count}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-stone-100" aria-hidden>
                    <div
                      className={`h-full rounded-full ${r.name === "Standard menu" ? "bg-stone-400" : "bg-amber-500"}`}
                      style={{ width: `${(r.count / meals.total) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <label className="flex min-h-11 items-center gap-3 border-t border-stone-100 px-4 py-3 text-sm text-stone-700 print:hidden">
              <input
                type="checkbox"
                checked={includeUnconfirmed}
                onChange={(e) => setIncludeUnconfirmed(e.target.checked)}
                className="size-4 accent-teal-700"
              />
              Include maybe and awaiting-reply guests
            </label>
          </Card>
        </aside>
      </div>
    </div>
  );
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import AppHeader from "@/components/AppHeader";
import { PlanProvider } from "@/lib/plan";

export const metadata: Metadata = {
  title: "Seatwise",
  description: "A seating planner for wedding and event planners",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 font-sans text-stone-900 antialiased">
        <PlanProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
          >
            Skip to content
          </a>
          <AppHeader />
          <main id="main" className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6">
            {children}
          </main>
        </PlanProvider>
      </body>
    </html>
  );
}
```

```css app/globals.css
@import "tailwindcss";

@layer base {
  :focus-visible {
    outline: 2px solid #0f766e;
    outline-offset: 2px;
  }

  svg g[role="button"]:focus-visible {
    outline: none;
  }

  svg g[role="button"]:focus-visible .ring {
    stroke: #0f766e;
    stroke-width: 0.14;
  }

  summary {
    list-style-position: inside;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
