```tsx src/lib/data.ts
export type Rsvp = "yes" | "no" | "maybe" | "pending";

export interface Guest {
  id: string;
  name: string;
  party: string;
  rsvp: Rsvp;
  diet: string | null;
  table: string | null;
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

export interface TableDef {
  id: string;
  name: string;
  shape: "long" | "round";
  seats: number;
  x: number;
  y: number;
  rotation?: number;
}

export interface Rule {
  kind: "together" | "apart" | "near";
  guests: string[];
  note: string;
  /** Planner-facing remark when the rule's data and its note disagree. */
  flag?: string;
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

export const tables: TableDef[] = [
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
  {
    kind: "apart",
    guests: ["g-29", "g-30"],
    note: "Brothers Sean and Ryan Doyle are not speaking",
    flag: "The note names Sean and Ryan Doyle, but the rule lists Kai Brennan and Sean Doyle. Worth confirming with the couple.",
  },
  { kind: "apart", guests: ["g-12", "g-34"], note: "Ask the couple: old family dispute" },
  {
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
  },
];

export const PARTY_COLORS: Record<string, string> = {
  Couple: "#b4452f",
  "Bride's family": "#2f6f8f",
  "Groom's family": "#6b4fa0",
  "University friends": "#2e7d5b",
  "Work friends": "#8a6a12",
  "Groom's football club": "#b0407a",
  "Plus-ones": "#5c6670",
};

export const parties = Array.from(new Set(guests.map((g) => g.party)));
export const diets = Array.from(
  new Set(guests.map((g) => g.diet).filter((d): d is string => d !== null)),
).sort();

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  no: "Declined",
  maybe: "Maybe",
  pending: "Pending",
};
```

```tsx src/lib/plan.ts
import {
  fixtures,
  guests,
  rules,
  tables,
  type Guest,
  type Rule,
  type TableDef,
} from "./data";

export interface SeatAssignment {
  table: string;
  seat: number;
}
export type Seats = Record<string, SeatAssignment>;
export type Occupants = Record<string, (string | null)[]>;

export const SEAT_R = 0.34;

export const guestById = new Map<string, Guest>(guests.map((g) => [g.id, g]));
export const tableById = new Map<string, TableDef>(tables.map((t) => [t.id, t]));
export const TOTAL_SEATS = tables.reduce((n, t) => n + t.seats, 0);

export function initialSeats(): Seats {
  const next: Record<string, number> = {};
  const out: Seats = {};
  for (const g of guests) {
    if (!g.table) continue;
    const i = next[g.table] ?? 0;
    next[g.table] = i + 1;
    out[g.id] = { table: g.table, seat: i };
  }
  return out;
}

export function occupants(seats: Seats): Occupants {
  const o: Occupants = {};
  for (const t of tables) o[t.id] = Array.from({ length: t.seats }, () => null);
  for (const [id, a] of Object.entries(seats)) {
    const row = o[a.table];
    if (row) row[a.seat] = id;
  }
  return o;
}

export function freeSeats(occ: Occupants, tableId: string): number {
  return (occ[tableId] ?? []).filter((x) => x === null).length;
}

export interface SeatLayout {
  seats: { x: number; y: number }[];
  ring: number;
  body: { shape: "round"; r: number } | { shape: "long"; w: number; h: number };
}

export function layoutFor(t: TableDef): SeatLayout {
  if (t.shape === "long") {
    const gap = 0.85;
    const w = t.seats * gap;
    return {
      ring: 0,
      body: { shape: "long", w, h: 0.8 },
      seats: Array.from({ length: t.seats }, (_, i) => ({
        x: (i - (t.seats - 1) / 2) * gap,
        y: -0.8,
      })),
    };
  }
  const ring = Math.max(1.1, t.seats * 0.16);
  return {
    ring,
    body: { shape: "round", r: ring - 0.5 },
    seats: Array.from({ length: t.seats }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
      return { x: Math.cos(a) * ring, y: Math.sin(a) * ring };
    }),
  };
}

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export interface PlaceResult {
  seats: Seats;
  ok: boolean;
  message: string;
}

export function placeGuest(
  seats: Seats,
  guestId: string,
  tableId: string,
  seatIdx?: number,
): PlaceResult {
  const guest = guestById.get(guestId);
  const table = tableById.get(tableId);
  if (!guest || !table) return { seats, ok: false, message: "Could not place that guest." };
  const occ = occupants(seats)[tableId] ?? [];
  const prev = seats[guestId];
  let target = seatIdx ?? -1;
  if (seatIdx === undefined) {
    if (prev && prev.table === tableId) {
      return { seats, ok: false, message: `${guest.name} is already at ${table.name}.` };
    }
    target = occ.indexOf(null);
    if (target < 0) return { seats, ok: false, message: `${table.name} is full.` };
  }
  const other = occ[target] ?? null;
  if (other === guestId) return { seats, ok: false, message: `${guest.name} is already in that seat.` };
  const next: Seats = { ...seats, [guestId]: { table: tableId, seat: target } };
  let message = `${guest.name} seated at ${table.name}, seat ${target + 1}.`;
  if (other) {
    const otherGuest = guestById.get(other);
    if (prev) {
      next[other] = prev;
      const prevTable = tableById.get(prev.table);
      message = `${guest.name} and ${otherGuest?.name ?? "guest"} swapped seats (${table.name} and ${prevTable?.name ?? "table"}).`;
    } else {
      delete next[other];
      message = `${guest.name} seated at ${table.name}; ${otherGuest?.name ?? "guest"} is now unseated.`;
    }
  }
  return { seats: next, ok: true, message };
}

export function unseatGuest(seats: Seats, guestId: string): PlaceResult {
  const guest = guestById.get(guestId);
  if (!seats[guestId]) return { seats, ok: false, message: `${guest?.name ?? "Guest"} has no seat.` };
  const next = { ...seats };
  delete next[guestId];
  return { seats: next, ok: true, message: `${guest?.name ?? "Guest"} unseated.` };
}

export type RuleStatus = "ok" | "open" | "broken";

export interface RuleResult {
  id: string;
  kind: Rule["kind"];
  status: RuleStatus;
  heading: string;
  detail: string;
  note: string;
  flag?: string;
  tables: string[];
}

const NEAR_DOOR_MAX = 5;
const NEAR_BAND_MIN = 8;

function centre(f: { x: number; y: number; w: number; h: number }) {
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function evaluateRules(seats: Seats): RuleResult[] {
  const door = fixtures.find((f) => f.kind === "door");
  const band = fixtures.find((f) => f.kind === "stage");
  const tn = (id: string) => tableById.get(id)?.name ?? id;
  return rules.map((rule, i): RuleResult => {
    const names = rule.guests.map((id) => guestById.get(id)?.name ?? id);
    const base = { id: `r-${i}`, kind: rule.kind, note: rule.note, flag: rule.flag };
    const a = rule.guests[0] ? seats[rule.guests[0]] : undefined;
    const b = rule.guests[1] ? seats[rule.guests[1]] : undefined;
    if (rule.kind === "together") {
      const heading = `Keep together: ${names.join(" and ")}`;
      if (a && b) {
        return a.table === b.table
          ? { ...base, heading, status: "ok", detail: `Both at ${tn(a.table)}.`, tables: [] }
          : {
              ...base,
              heading,
              status: "broken",
              detail: `${names[0]} is at ${tn(a.table)}, ${names[1]} at ${tn(b.table)}.`,
              tables: [a.table, b.table],
            };
      }
      if (a || b) {
        const seated = a ?? b;
        const who = a ? 0 : 1;
        return {
          ...base,
          heading,
          status: "open",
          detail: `${names[who]} is at ${tn(seated?.table ?? "")}; ${names[1 - who]} still needs a seat.`,
          tables: seated ? [seated.table] : [],
        };
      }
      return { ...base, heading, status: "open", detail: "Neither is seated yet.", tables: [] };
    }
    if (rule.kind === "apart") {
      const heading = `Keep apart: ${names.join(" and ")}`;
      if (a && b && a.table === b.table) {
        return {
          ...base,
          heading,
          status: "broken",
          detail: `Both are at ${tn(a.table)}.`,
          tables: [a.table],
        };
      }
      return {
        ...base,
        heading,
        status: "ok",
        detail: a && b ? `At ${tn(a.table)} and ${tn(b.table)}.` : "Not both seated yet, nothing to clash.",
        tables: [],
      };
    }
    const heading = `Seat near the garden doors: ${names[0] ?? ""}`;
    if (!a) {
      return { ...base, heading, status: "open", detail: "Not seated yet.", tables: [] };
    }
    const t = tableById.get(a.table);
    if (!t || !door || !band) {
      return { ...base, heading, status: "ok", detail: "", tables: [] };
    }
    const dDoor = dist(t, centre(door));
    const dBand = dist(t, centre(band));
    const good = dDoor <= NEAR_DOOR_MAX && dBand >= NEAR_BAND_MIN;
    return {
      ...base,
      heading,
      status: good ? "ok" : "broken",
      detail: `${t.name} is ${dDoor.toFixed(1)} m from the garden doors and ${dBand.toFixed(1)} m from the band${
        good ? "." : `. Aim for within ${NEAR_DOOR_MAX} m of the doors and ${NEAR_BAND_MIN} m or more from the band.`
      }`,
      tables: good ? [] : [a.table],
    };
  });
}
```

```tsx src/components/seatwise/PlannerProvider.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { guests, tables } from "@/lib/data";
import {
  evaluateRules,
  guestById,
  initialSeats,
  occupants,
  placeGuest,
  TOTAL_SEATS,
  unseatGuest,
  type Occupants,
  type RuleResult,
  type Seats,
} from "@/lib/plan";
import s from "./seatwise.module.css";

export interface DragState {
  guestId: string;
  x: number;
  y: number;
  over: string | null;
}

export interface Stats {
  attending: number;
  seated: number;
  seatedAttending: number;
  unseated: string[];
  awaiting: string[];
  freeSeats: number;
  totalSeats: number;
  unconfirmedSeated: number;
}

interface PlannerContextValue {
  seats: Seats;
  occ: Occupants;
  rules: RuleResult[];
  stats: Stats;
  selectedTable: string | null;
  picked: string | null;
  drag: DragState | null;
  place: (guestId: string, tableId: string, seatIdx?: number) => void;
  unseat: (guestId: string) => void;
  pick: (id: string | null) => void;
  togglePick: (id: string) => void;
  selectTable: (id: string | null) => void;
  beginDrag: (e: ReactPointerEvent<Element>, guestId: string) => void;
  wasDragged: () => boolean;
  announce: (msg: string) => void;
}

const PlannerContext = createContext<PlannerContextValue | null>(null);

export function usePlanner(): PlannerContextValue {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error("usePlanner must be used inside PlannerProvider");
  return ctx;
}

function targetAt(x: number, y: number): string | null {
  const el = document.elementFromPoint(x, y);
  const hit = el?.closest("[data-drop]");
  return hit ? hit.getAttribute("data-drop") : null;
}

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [seats, setSeats] = useState<Seats>(() => initialSeats());
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [message, setMessage] = useState("");
  const seatsRef = useRef(seats);
  const suppress = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    seatsRef.current = seats;
  }, [seats]);

  const announce = useCallback((msg: string) => {
    setMessage(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(""), 5000);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPicked(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const place = useCallback(
    (guestId: string, tableId: string, seatIdx?: number) => {
      const res = placeGuest(seatsRef.current, guestId, tableId, seatIdx);
      if (res.ok) {
        seatsRef.current = res.seats;
        setSeats(res.seats);
        setPicked(null);
        setSelectedTable(tableId);
      }
      announce(res.message);
    },
    [announce],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const res = unseatGuest(seatsRef.current, guestId);
      if (res.ok) {
        seatsRef.current = res.seats;
        setSeats(res.seats);
        setPicked(null);
      }
      announce(res.message);
    },
    [announce],
  );

  const pick = useCallback((id: string | null) => setPicked(id), []);

  const togglePick = useCallback(
    (id: string) => {
      setPicked((p) => (p === id ? null : id));
      announce(`${guestById.get(id)?.name ?? "Guest"} picked. Choose a seat or table, or press Escape to cancel.`);
    },
    [announce],
  );

  const beginDrag = useCallback(
    (e: ReactPointerEvent<Element>, guestId: string) => {
      const target = e.target as Element;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (target.closest("select, input, textarea")) return;
      if (e.pointerType !== "mouse" && !target.closest("[data-grip]")) return;
      const sx = e.clientX;
      const sy = e.clientY;
      let active = false;

      const onMove = (ev: PointerEvent) => {
        if (!active) {
          if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return;
          active = true;
          document.body.style.userSelect = "none";
        }
        setDrag({ guestId, x: ev.clientX, y: ev.clientY, over: targetAt(ev.clientX, ev.clientY) });
      };
      const cleanup = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onCancel);
        document.body.style.userSelect = "";
      };
      const onCancel = () => {
        cleanup();
        if (active) {
          setDrag(null);
          suppress.current = true;
          setTimeout(() => {
            suppress.current = false;
          }, 0);
        }
      };
      const onUp = (ev: PointerEvent) => {
        cleanup();
        if (!active) return;
        const over = targetAt(ev.clientX, ev.clientY);
        setDrag(null);
        suppress.current = true;
        setTimeout(() => {
          suppress.current = false;
        }, 0);
        if (!over) return;
        if (over === "unseat") {
          unseat(guestId);
          return;
        }
        const [kind, tableId, seatIdx] = over.split(":");
        if (kind === "seat" && tableId && seatIdx !== undefined) place(guestId, tableId, Number(seatIdx));
        else if (kind === "table" && tableId) place(guestId, tableId);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onCancel);
    },
    [place, unseat],
  );

  const wasDragged = useCallback(() => suppress.current, []);

  const selectTable = useCallback((id: string | null) => setSelectedTable(id), []);

  const occ = useMemo(() => occupants(seats), [seats]);
  const rules = useMemo(() => evaluateRules(seats), [seats]);
  const stats = useMemo<Stats>(() => {
    const attendingGuests = guests.filter((g) => g.rsvp === "yes");
    const seated = Object.keys(seats).length;
    const seatedAttending = attendingGuests.filter((g) => seats[g.id]).length;
    return {
      attending: attendingGuests.length,
      seated,
      seatedAttending,
      unseated: attendingGuests.filter((g) => !seats[g.id]).map((g) => g.id),
      awaiting: guests
        .filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !seats[g.id])
        .map((g) => g.id),
      freeSeats: TOTAL_SEATS - seated,
      totalSeats: TOTAL_SEATS,
      unconfirmedSeated: seated - seatedAttending,
    };
  }, [seats]);

  const value = useMemo<PlannerContextValue>(
    () => ({
      seats,
      occ,
      rules,
      stats,
      selectedTable,
      picked,
      drag,
      place,
      unseat,
      pick,
      togglePick,
      selectTable,
      beginDrag,
      wasDragged,
      announce,
    }),
    [seats, occ, rules, stats, selectedTable, picked, drag, place, unseat, pick, togglePick, selectTable, beginDrag, wasDragged, announce],
  );

  const dragName = drag ? guestById.get(drag.guestId)?.name : null;

  return (
    <PlannerContext.Provider value={value}>
      {children}
      <div className={s.toastWrap} role="status" aria-live="polite">
        {message ? <div className={s.toast}>{message}</div> : null}
      </div>
      {drag && dragName ? (
        <div className={s.ghost} style={{ left: drag.x, top: drag.y }} aria-hidden="true">
          {dragName}
        </div>
      ) : null}
    </PlannerContext.Provider>
  );
}

export { tables };
```

```tsx src/components/seatwise/Shell.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { event, planner } from "@/lib/data";
import { usePlanner } from "./PlannerProvider";
import s from "./seatwise.module.css";

const dateLabel = new Date(`${event.date}T00:00:00Z`).toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { stats } = usePlanner();
  const links = [
    { href: "/", label: "Plan", note: `${stats.unseated.length} to seat` },
    { href: "/guests", label: "Guests", note: `${stats.attending} attending` },
  ];
  return (
    <div className={s.app}>
      <a className={s.skip} href="#main">
        Skip to content
      </a>
      <header className={s.header}>
        <div className={s.headerInner}>
          <Link href="/" className={s.brand} aria-label="Seatwise, plan">
            <svg className={s.brandMark} viewBox="0 0 32 32" aria-hidden="true">
              <rect width="32" height="32" rx="9" fill="#1f5d4a" />
              <circle cx="16" cy="16" r="5" fill="#fff" />
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <circle
                  key={i}
                  cx={16 + Math.cos((i * Math.PI) / 3 - Math.PI / 2) * 9.5}
                  cy={16 + Math.sin((i * Math.PI) / 3 - Math.PI / 2) * 9.5}
                  r="2.2"
                  fill="#f2c879"
                />
              ))}
            </svg>
            <span>Seatwise</span>
          </Link>
          <div className={s.eventMeta}>
            <span className={s.eventName}>{event.name}</span>
            <span className={s.eventSub}>
              {dateLabel} &middot; {event.venue}
            </span>
          </div>
          <nav className={s.nav} aria-label="Main">
            {links.map((l) => {
              const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={active ? `${s.navLink} ${s.navLinkActive}` : s.navLink}
                  aria-current={active ? "page" : undefined}
                >
                  {l.label}
                  <span className={s.navNote}>{l.note}</span>
                </Link>
              );
            })}
          </nav>
          <div className={s.user}>
            <span className={s.avatar} aria-hidden="true">
              HB
            </span>
            <span className={s.userText}>
              <strong>{planner.name}</strong>
              <span>Wedding planner</span>
            </span>
          </div>
        </div>
      </header>
      <main id="main" className={s.main}>
        {children}
      </main>
    </div>
  );
}
```

```tsx src/components/seatwise/RoomPlan.tsx
"use client";

import type { KeyboardEvent } from "react";
import { PARTY_COLORS, event, fixtures, guests, tables, type TableDef } from "@/lib/data";
import { SEAT_R, guestById, initials, layoutFor } from "@/lib/plan";
import { usePlanner } from "./PlannerProvider";
import s from "./seatwise.module.css";

const PAD = 0.7;

function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

export function RoomPlan() {
  const { occ, rules, selectedTable, picked, drag, place, pick, selectTable, beginDrag, wasDragged } =
    usePlanner();
  const W = event.room_m.width;
  const D = event.room_m.depth;
  const brokenTables = new Set(rules.filter((r) => r.status === "broken").flatMap((r) => r.tables));

  const activate = (fn: () => void) => ({
    onClick: () => {
      if (wasDragged()) return;
      fn();
    },
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fn();
      }
    },
  });

  const onTable = (t: TableDef) => {
    if (picked) place(picked, t.id);
    else selectTable(t.id);
  };

  const onSeat = (t: TableDef, i: number) => {
    const occId = occ[t.id]?.[i] ?? null;
    if (picked) {
      if (picked === occId) pick(null);
      else place(picked, t.id, i);
      return;
    }
    selectTable(t.id);
  };

  return (
    <div className={s.planScroll}>
      <svg
        className={s.plan}
        viewBox={`${-PAD} ${-PAD} ${W + PAD * 2} ${D + PAD * 2}`}
        role="group"
        aria-label={`Room plan of ${event.venue}, ${W} by ${D} metres, drawn to scale`}
      >
        <defs>
          <pattern id="sw-floor" width="0.5" height="0.5" patternUnits="userSpaceOnUse">
            <rect width="0.5" height="0.5" fill="#f1e7d2" />
            <rect width="0.25" height="0.25" fill="#e6d8b9" />
            <rect x="0.25" y="0.25" width="0.25" height="0.25" fill="#e6d8b9" />
          </pattern>
        </defs>
        <rect x={0} y={0} width={W} height={D} className={s.floor} />

        {fixtures.map((f) => {
          if (f.kind === "door") {
            return (
              <g key={f.id}>
                <rect x={f.x - 0.1} y={f.y} width={f.w + 0.2} height={f.h} className={s.doorGap} />
                <path
                  d={`M ${f.x + f.w} ${f.y} A ${f.h} ${f.h} 0 0 1 ${f.x + f.w + f.h * 0.6} ${f.y + f.h * 0.8}`}
                  className={s.doorSwing}
                />
                <text
                  transform={`translate(1.0 ${f.y + f.h / 2}) rotate(-90)`}
                  textAnchor="middle"
                  className={s.fixtureLabel}
                >
                  {f.label}
                </text>
              </g>
            );
          }
          const cls =
            f.kind === "stage" ? s.stage : f.kind === "bar" ? s.bar : s.dance;
          return (
            <g key={f.id}>
              <rect x={f.x} y={f.y} width={f.w} height={f.h} rx={0.12} className={cls} />
              <text
                x={f.x + f.w / 2}
                y={f.y + f.h / 2 + 0.12}
                textAnchor="middle"
                className={f.kind === "dancefloor" ? s.fixtureLabelDark : s.fixtureLabelLight}
              >
                {f.label}
              </text>
            </g>
          );
        })}
        <rect x={0} y={0} width={W} height={D} className={s.wall} />

        {tables.map((t) => {
          const lay = layoutFor(t);
          const row = occ[t.id] ?? [];
          const filled = row.filter(Boolean).length;
          const selected = selectedTable === t.id;
          const broken = brokenTables.has(t.id);
          const over = drag?.over === `table:${t.id}`;
          const isRound = lay.body.shape === "round";
          const haloR = lay.ring + 0.55;
          const longW = lay.body.shape === "long" ? lay.body.w : 0;
          return (
            <g key={t.id} transform={`translate(${t.x} ${t.y}) rotate(${t.rotation ?? 0})`}>
              <g
                data-drop={`table:${t.id}`}
                role="button"
                tabIndex={0}
                aria-pressed={selected}
                aria-label={`${t.name}, ${filled} of ${t.seats} seats filled${broken ? ", a rule is broken here" : ""}. ${picked ? "Seat the picked guest here" : "Show guests"}`}
                className={cx(s.table, selected && s.tableSelected, broken && s.tableBroken, over && s.tableOver)}
                {...activate(() => onTable(t))}
              >
                {isRound ? (
                  <circle r={haloR} className={s.tableHalo} />
                ) : (
                  <rect
                    x={-longW / 2 - 0.3}
                    y={-1.5}
                    width={longW + 0.6}
                    height={2.3}
                    rx={0.3}
                    className={s.tableHalo}
                  />
                )}
                {lay.body.shape === "round" ? (
                  <circle r={lay.body.r} className={s.tableBody} />
                ) : (
                  <rect
                    x={-lay.body.w / 2}
                    y={-lay.body.h / 2}
                    width={lay.body.w}
                    height={lay.body.h}
                    rx={0.12}
                    className={s.tableBody}
                  />
                )}
                {isRound ? (
                  <>
                    <text y={-0.04} textAnchor="middle" className={s.tableName}>
                      {t.name}
                    </text>
                    <text y={0.27} textAnchor="middle" className={s.tableCount}>
                      {filled}/{t.seats}
                    </text>
                  </>
                ) : (
                  <text y={0.1} textAnchor="middle" className={s.tableName}>
                    {t.name} &middot; {filled}/{t.seats}
                  </text>
                )}
                {broken ? (
                  <g
                    transform={
                      lay.body.shape === "round"
                        ? `translate(${lay.body.r * 0.72} ${-lay.body.r * 0.72})`
                        : `translate(${lay.body.w / 2 - 0.3} 0)`
                    }
                  >
                    <circle r={0.19} className={s.warnBadge} />
                    <text y={0.08} textAnchor="middle" className={s.warnMark}>
                      !
                    </text>
                  </g>
                ) : null}
              </g>

              {lay.seats.map((p, i) => {
                const gid = row[i] ?? null;
                const g = gid ? guestById.get(gid) : undefined;
                const key = `seat:${t.id}:${i}`;
                const isPicked = !!gid && picked === gid;
                const isOver = drag?.over === key;
                const label = g
                  ? `${t.name}, seat ${i + 1}: ${g.name}${g.diet ? `, ${g.diet}` : ""}`
                  : `${t.name}, seat ${i + 1}: empty`;
                return (
                  <g
                    key={key}
                    data-drop={key}
                    transform={`translate(${p.x} ${p.y})`}
                    role="button"
                    tabIndex={0}
                    aria-label={label}
                    className={cx(
                      s.seat,
                      g ? s.seatFilled : s.seatEmpty,
                      !g && picked && s.seatHint,
                      isOver && s.seatOver,
                      isPicked && s.seatPicked,
                    )}
                    onPointerDown={g ? (e) => beginDrag(e, g.id) : undefined}
                    {...activate(() => onSeat(t, i))}
                  >
                    <title>{g ? `${g.name} (${g.party})${g.diet ? `, ${g.diet}` : ""}` : `${t.name}, empty seat ${i + 1}`}</title>
                    <circle r={SEAT_R} className={s.seatCircle} fill={g ? (PARTY_COLORS[g.party] ?? "#5c6670") : undefined} />
                    {g ? (
                      <text y={0.1} textAnchor="middle" className={s.seatText}>
                        {initials(g.name)}
                      </text>
                    ) : (
                      <text y={0.09} textAnchor="middle" className={s.seatPlus}>
                        +
                      </text>
                    )}
                    {g?.diet ? <circle cx={0.26} cy={-0.26} r={0.1} className={s.dietDot} /> : null}
                  </g>
                );
              })}
            </g>
          );
        })}

        <g aria-hidden="true">
          <line x1={W - 2} x2={W} y1={D + 0.4} y2={D + 0.4} className={s.scaleLine} />
          <text x={W - 1} y={D + 0.34} textAnchor="middle" className={s.scaleText} dy="-0.08">
            2 m
          </text>
        </g>
      </svg>
    </div>
  );
}

export function PartyLegend() {
  const parties = Array.from(new Set(guests.map((g) => g.party)));
  return (
    <ul className={s.legend} aria-label="Party colours">
      {parties.map((p) => (
        <li key={p}>
          <span className={s.swatch} style={{ background: PARTY_COLORS[p] ?? "#5c6670" }} />
          {p}
        </li>
      ))}
      <li>
        <span className={s.legendDiet} /> Dietary need
      </li>
      <li>
        <span className={s.legendEmpty} /> Empty seat
      </li>
    </ul>
  );
}
```

```tsx src/components/seatwise/SidePanels.tsx
"use client";

import { PARTY_COLORS, RSVP_LABEL, tables } from "@/lib/data";
import { freeSeats, guestById, tableById } from "@/lib/plan";
import { guests } from "@/lib/data";
import { usePlanner } from "./PlannerProvider";
import s from "./seatwise.module.css";

function Swatch({ party }: { party: string }) {
  return <span className={s.swatch} style={{ background: PARTY_COLORS[party] ?? "#5c6670" }} aria-hidden="true" />;
}

function TableSelect({
  guestId,
  label,
  exclude,
}: {
  guestId: string;
  label: string;
  exclude?: string;
}) {
  const { occ, place } = usePlanner();
  return (
    <select
      className={s.select}
      aria-label={label}
      value=""
      onChange={(e) => {
        if (e.target.value) place(guestId, e.target.value);
      }}
    >
      <option value="">{label}</option>
      {tables
        .filter((t) => t.id !== exclude)
        .map((t) => {
          const free = freeSeats(occ, t.id);
          return (
            <option key={t.id} value={t.id} disabled={free === 0}>
              {t.name} ({free} free)
            </option>
          );
        })}
    </select>
  );
}

function GuestRow({ id, seated }: { id: string; seated: boolean }) {
  const { picked, togglePick, beginDrag, wasDragged, unseat, seats } = usePlanner();
  const g = guestById.get(id);
  if (!g) return null;
  const isPicked = picked === id;
  const at = seats[id]?.table;
  return (
    <li
      className={isPicked ? `${s.guestRow} ${s.guestRowPicked}` : s.guestRow}
      onPointerDown={(e) => beginDrag(e, id)}
    >
      <span className={s.grip} data-grip aria-hidden="true" title="Drag to a seat or table">
        <svg viewBox="0 0 12 18" width="12" height="18">
          {[3, 9].flatMap((x) => [3, 9, 15].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.4" fill="currentColor" />))}
        </svg>
      </span>
      <button
        type="button"
        className={s.guestMain}
        aria-pressed={isPicked}
        onClick={() => {
          if (wasDragged()) return;
          togglePick(id);
        }}
      >
        <span className={s.guestName}>
          <Swatch party={g.party} />
          {g.name}
        </span>
        <span className={s.guestMeta}>
          {g.party}
          {g.rsvp !== "yes" ? ` · ${RSVP_LABEL[g.rsvp]}` : ""}
        </span>
        {g.diet ? <span className={s.dietTag}>{g.diet}</span> : null}
      </button>
      <span className={s.rowActions} data-nodrag>
        {seated ? (
          <>
            <TableSelect guestId={id} label="Move to" exclude={at} />
            <button type="button" className={s.btnSmall} onClick={() => unseat(id)}>
              Unseat
            </button>
          </>
        ) : (
          <TableSelect guestId={id} label="Seat at" />
        )}
      </span>
    </li>
  );
}

export function UnseatedPanel() {
  const { stats, picked, drag } = usePlanner();
  const over = drag?.over === "unseat";
  return (
    <section
      className={over ? `${s.card} ${s.cardOver}` : s.card}
      aria-labelledby="unseated-h"
      data-drop="unseat"
    >
      <div className={s.cardHead}>
        <h2 id="unseated-h" className={s.cardTitle}>
          Unseated
        </h2>
        <span className={s.countPill}>{stats.unseated.length}</span>
      </div>
      <p className={s.cardHint}>
        {picked
          ? "Now tap a seat or table on the plan."
          : "Attending guests without a seat. Drag one onto the plan, or tap a name and then a seat. Drop a seated guest here to unseat them."}
      </p>
      {stats.unseated.length === 0 ? (
        <p className={s.empty}>Everyone attending has a seat.</p>
      ) : (
        <ul className={s.guestList}>
          {stats.unseated.map((id) => (
            <GuestRow key={id} id={id} seated={false} />
          ))}
        </ul>
      )}
      {stats.awaiting.length > 0 ? (
        <details className={s.awaiting}>
          <summary>
            Not confirmed yet <span className={s.countPill}>{stats.awaiting.length}</span>
          </summary>
          <ul className={s.guestList}>
            {stats.awaiting.map((id) => (
              <GuestRow key={id} id={id} seated={false} />
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}

export function TablePanel() {
  const { selectedTable, occ, rules, picked, place, seats } = usePlanner();
  const t = selectedTable ? tableById.get(selectedTable) : undefined;
  if (!t) {
    return (
      <section className={s.card} aria-labelledby="table-h">
        <h2 id="table-h" className={s.cardTitle}>
          Table
        </h2>
        <p className={s.empty}>Select a table on the plan or from the list under it to see its guests and dietary needs.</p>
      </section>
    );
  }
  const row = occ[t.id] ?? [];
  const seatedIds = row.filter((x): x is string => x !== null);
  const dietary = seatedIds
    .map((id) => guestById.get(id))
    .filter((g) => g && g.diet);
  const issues = rules.filter((r) => r.status === "broken" && r.tables.includes(t.id));
  void seats;
  return (
    <section className={s.card} aria-labelledby="table-h">
      <div className={s.cardHead}>
        <h2 id="table-h" className={s.cardTitle}>
          {t.name}
        </h2>
        <span className={s.countPill}>
          {seatedIds.length}/{t.seats} seats
        </span>
      </div>
      {issues.length > 0 ? (
        <ul className={s.issueList}>
          {issues.map((r) => (
            <li key={r.id}>
              <strong>Rule broken.</strong> {r.heading}. {r.detail}
            </li>
          ))}
        </ul>
      ) : null}
      <ol className={s.seatList}>
        {row.map((gid, i) => {
          if (!gid) {
            return (
              <li key={`e-${i}`} className={s.seatRowEmpty}>
                <span className={s.seatNo}>{i + 1}</span>
                <span className={s.emptyLabel}>Empty seat</span>
                {picked ? (
                  <button type="button" className={s.btnSmall} onClick={() => place(picked, t.id, i)}>
                    Seat here
                  </button>
                ) : null}
              </li>
            );
          }
          return (
            <li key={gid} className={s.seatRowWrap}>
              <span className={s.seatNo}>{i + 1}</span>
              <ul className={s.guestListInner}>
                <GuestRow id={gid} seated />
              </ul>
            </li>
          );
        })}
      </ol>
      <h3 className={s.subTitle}>Dietary needs</h3>
      {dietary.length === 0 ? (
        <p className={s.empty}>No dietary needs recorded at this table.</p>
      ) : (
        <ul className={s.dietList}>
          {dietary.map((g) =>
            g ? (
              <li key={g.id}>
                <span className={s.dietTag}>{g.diet}</span> {g.name}
              </li>
            ) : null,
          )}
        </ul>
      )}
    </section>
  );
}

export function RulesPanel() {
  const { rules, selectTable } = usePlanner();
  const broken = rules.filter((r) => r.status === "broken").length;
  const open = rules.filter((r) => r.status === "open").length;
  const label = { ok: "Kept", open: "Waiting", broken: "Broken" } as const;
  return (
    <section className={s.card} aria-labelledby="rules-h">
      <div className={s.cardHead}>
        <h2 id="rules-h" className={s.cardTitle}>
          The couple&apos;s rules
        </h2>
        <span className={broken ? `${s.countPill} ${s.pillBad}` : `${s.countPill} ${s.pillGood}`}>
          {broken ? `${broken} broken` : "All kept"}
        </span>
      </div>
      <p className={s.cardHint}>
        {broken} broken, {open} waiting for guests to be seated, {rules.length - broken - open} kept.
      </p>
      <ul className={s.ruleList}>
        {rules.map((r) => (
          <li key={r.id} className={`${s.rule} ${r.status === "broken" ? s.ruleBroken : r.status === "open" ? s.ruleOpen : s.ruleOk}`}>
            <div className={s.ruleTop}>
              <span className={s.ruleStatus}>
                <span aria-hidden="true">{r.status === "broken" ? "✕" : r.status === "open" ? "…" : "✓"}</span> {label[r.status]}
              </span>
              <strong>{r.heading}</strong>
            </div>
            <p className={s.ruleDetail}>{r.detail}</p>
            <p className={s.ruleNote}>{r.note}</p>
            {r.flag ? <p className={s.ruleFlag}>{r.flag}</p> : null}
            {r.tables.length > 0 ? (
              <button type="button" className={s.btnSmall} onClick={() => selectTable(r.tables[0] ?? null)}>
                Show {r.tables.map((id) => tableById.get(id)?.name).join(" / ")}
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TableChips() {
  const { occ, selectedTable, selectTable, rules, drag, picked, place } = usePlanner();
  const broken = new Set(rules.filter((r) => r.status === "broken").flatMap((r) => r.tables));
  return (
    <ul className={s.chips} aria-label="Tables">
      {tables.map((t) => {
        const filled = (occ[t.id] ?? []).filter(Boolean).length;
        const sel = selectedTable === t.id;
        const over = drag?.over === `table:${t.id}`;
        return (
          <li key={t.id}>
            <button
              type="button"
              data-drop={`table:${t.id}`}
              aria-pressed={sel}
              className={[s.chip, sel ? s.chipSel : "", over ? s.chipOver : "", broken.has(t.id) ? s.chipBad : ""].join(" ")}
              onClick={() => (picked ? place(picked, t.id) : selectTable(t.id))}
            >
              {t.name}
              <span className={s.chipCount}>
                {filled}/{t.seats}
              </span>
              {broken.has(t.id) ? <span className={s.chipWarn}>Rule broken</span> : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export const _guestCount = guests.length;
```

```tsx src/components/seatwise/PlanView.tsx
"use client";

import { guestById } from "@/lib/plan";
import { PlannerProvider, usePlanner } from "./PlannerProvider";
import { PartyLegend, RoomPlan } from "./RoomPlan";
import { Shell } from "./Shell";
import { RulesPanel, TableChips, TablePanel, UnseatedPanel } from "./SidePanels";
import s from "./seatwise.module.css";

void PlannerProvider;

export function PlanView() {
  const { stats, rules, picked, pick } = usePlanner();
  const broken = rules.filter((r) => r.status === "broken");
  const pickedGuest = picked ? guestById.get(picked) : undefined;
  return (
    <Shell>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.h1}>Seating plan</h1>
          <p className={s.sub}>Drag guests onto seats, or tap a guest and then a seat. Counts and rules update as you go.</p>
        </div>
        <button type="button" className={`${s.btn} ${s.noPrint}`} onClick={() => window.print()}>
          Print for venue and caterer
        </button>
      </div>

      <ul className={s.stats} aria-label="Seating counts">
        <li className={s.stat}>
          <span className={s.statLabel}>Seated</span>
          <span className={s.statValue}>{stats.seated}</span>
          <span className={s.statNote}>
            of {stats.attending} attending
            {stats.unconfirmedSeated > 0 ? `, incl. ${stats.unconfirmedSeated} unconfirmed` : ""}
          </span>
        </li>
        <li className={s.stat}>
          <span className={s.statLabel}>Unseated</span>
          <span className={stats.unseated.length ? `${s.statValue} ${s.statAmber}` : s.statValue}>
            {stats.unseated.length}
          </span>
          <span className={s.statNote}>attending, no seat yet</span>
        </li>
        <li className={s.stat}>
          <span className={s.statLabel}>Free seats</span>
          <span className={s.statValue}>{stats.freeSeats}</span>
          <span className={s.statNote}>of {stats.totalSeats} across 7 tables</span>
        </li>
        <li className={s.stat}>
          <span className={s.statLabel}>Rules</span>
          <span className={broken.length ? `${s.statValue} ${s.statBad}` : `${s.statValue} ${s.statGood}`}>
            {broken.length ? `${broken.length} broken` : "All kept"}
          </span>
          <span className={s.statNote}>of {rules.length} from the couple</span>
        </li>
      </ul>

      {broken.length > 0 ? (
        <div className={s.alert} role="alert">
          <strong>
            {broken.length} {broken.length === 1 ? "rule is" : "rules are"} broken
          </strong>
          <ul>
            {broken.map((r) => (
              <li key={r.id}>
                {r.heading}. {r.detail}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {pickedGuest ? (
        <div className={`${s.pickBar} ${s.noPrint}`}>
          <span>
            Placing <strong>{pickedGuest.name}</strong>. Tap an empty seat, a seat to swap with, or a table.
          </span>
          <button type="button" className={s.btnSmall} onClick={() => pick(null)}>
            Cancel
          </button>
        </div>
      ) : null}

      <div className={s.layout}>
        <div className={s.planCol}>
          <section className={s.card} aria-labelledby="plan-h">
            <div className={s.cardHead}>
              <h2 id="plan-h" className={s.cardTitle}>
                Room plan
              </h2>
              <span className={s.cardHint}>24 &times; 14 m, drawn to scale</span>
            </div>
            <RoomPlan />
            <PartyLegend />
            <TableChips />
          </section>
        </div>
        <div className={s.side}>
          <TablePanel />
          <UnseatedPanel />
          <RulesPanel />
        </div>
      </div>
    </Shell>
  );
}
```

```tsx src/components/seatwise/GuestsView.tsx
"use client";

import { useMemo, useState } from "react";
import { PARTY_COLORS, RSVP_LABEL, diets, guests, parties, tables, type Rsvp } from "@/lib/data";
import { freeSeats, tableById } from "@/lib/plan";
import { usePlanner } from "./PlannerProvider";
import { Shell } from "./Shell";
import s from "./seatwise.module.css";

function norm(v: string): string {
  return v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const STANDARD = "Standard menu";

export function GuestsView() {
  const { seats, occ, place, unseat } = usePlanner();
  const [q, setQ] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState("all");
  const [diet, setDiet] = useState("all");
  const [unconfirmed, setUnconfirmed] = useState(false);

  const filtered = useMemo(() => {
    const needle = norm(q.trim());
    return guests.filter((g) => {
      if (needle && !norm(g.name).includes(needle)) return false;
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === "none" && g.diet) return false;
      if (diet !== "all" && diet !== "none" && g.diet !== diet) return false;
      return true;
    });
  }, [q, party, rsvp, diet]);

  const filtersOn = q !== "" || party !== "all" || rsvp !== "all" || diet !== "all";
  const clear = () => {
    setQ("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
  };

  const pool = guests.filter(
    (g) => g.rsvp === "yes" || (unconfirmed && (g.rsvp === "maybe" || g.rsvp === "pending")),
  );
  const meals = useMemo(() => {
    const m = new Map<string, number>();
    for (const g of pool) m.set(g.diet ?? STANDARD, (m.get(g.diet ?? STANDARD) ?? 0) + 1);
    return Array.from(m.entries()).sort((a, b) => {
      if (a[0] === STANDARD) return -1;
      if (b[0] === STANDARD) return 1;
      return b[1] - a[1] || a[0].localeCompare(b[0]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unconfirmed]);
  const maxMeal = Math.max(1, ...meals.map((m) => m[1]));

  const byTable = tables
    .map((t) => ({
      t,
      rows: pool.filter((g) => g.diet && seats[g.id]?.table === t.id),
    }))
    .filter((x) => x.rows.length > 0);
  const notSeated = pool.filter((g) => g.diet && !seats[g.id]);

  return (
    <Shell>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.h1}>Guest list</h1>
          <p className={s.sub}>
            {guests.length} invited, {guests.filter((g) => g.rsvp === "yes").length} attending. Change a guest&apos;s table here and the plan follows.
          </p>
        </div>
        <button type="button" className={`${s.btn} ${s.noPrint}`} onClick={() => window.print()}>
          Print for caterer
        </button>
      </div>

      <div className={s.guestsLayout}>
        <section className={s.card} aria-labelledby="gl-h">
          <h2 id="gl-h" className={s.srOnly}>
            Guests
          </h2>
          <div className={`${s.filters} ${s.noPrint}`} role="search">
            <label className={s.field}>
              <span>Search</span>
              <input
                type="search"
                className={s.input}
                placeholder="Search by name"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </label>
            <label className={s.field}>
              <span>Party</span>
              <select className={s.select} value={party} onChange={(e) => setParty(e.target.value)}>
                <option value="all">All parties</option>
                {parties.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className={s.field}>
              <span>RSVP</span>
              <select className={s.select} value={rsvp} onChange={(e) => setRsvp(e.target.value)}>
                <option value="all">Any reply</option>
                {(Object.keys(RSVP_LABEL) as Rsvp[]).map((r) => (
                  <option key={r} value={r}>
                    {RSVP_LABEL[r]}
                  </option>
                ))}
              </select>
            </label>
            <label className={s.field}>
              <span>Diet</span>
              <select className={s.select} value={diet} onChange={(e) => setDiet(e.target.value)}>
                <option value="all">Any diet</option>
                <option value="none">No dietary needs</option>
                {diets.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className={s.resultLine} role="status">
            Showing {filtered.length} of {guests.length} guests
            {filtersOn ? (
              <>
                {" "}
                <button type="button" className={s.linkBtn} onClick={clear}>
                  Clear filters
                </button>
              </>
            ) : null}
          </p>

          {filtered.length === 0 ? (
            <p className={s.empty}>No guests match these filters.</p>
          ) : (
            <table className={s.table2}>
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
                  const at = seats[g.id]?.table ?? "";
                  return (
                    <tr key={g.id}>
                      <th scope="row" data-label="Guest">
                        {g.name}
                      </th>
                      <td data-label="Party">
                        <span className={s.swatch} style={{ background: PARTY_COLORS[g.party] ?? "#5c6670" }} aria-hidden="true" />
                        {g.party}
                      </td>
                      <td data-label="RSVP">
                        <span className={`${s.rsvp} ${s[`rsvp_${g.rsvp}`] ?? ""}`}>{RSVP_LABEL[g.rsvp]}</span>
                      </td>
                      <td data-label="Diet">{g.diet ? <span className={s.dietTag}>{g.diet}</span> : <span className={s.muted}>None</span>}</td>
                      <td data-label="Table">
                        <select
                          className={s.select}
                          aria-label={`Table for ${g.name}`}
                          value={at}
                          disabled={g.rsvp === "no"}
                          onChange={(e) => {
                            if (e.target.value === "") unseat(g.id);
                            else place(g.id, e.target.value);
                          }}
                        >
                          <option value="">Not seated</option>
                          {tables.map((t) => {
                            const free = freeSeats(occ, t.id);
                            return (
                              <option key={t.id} value={t.id} disabled={free === 0 && t.id !== at}>
                                {t.name} ({free} free)
                              </option>
                            );
                          })}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        <aside className={s.mealCol} aria-label="Meal counts">
          <section className={s.card} aria-labelledby="meals-h">
            <div className={s.cardHead}>
              <h2 id="meals-h" className={s.cardTitle}>
                Meals for the caterer
              </h2>
              <span className={s.countPill}>{pool.length} covers</span>
            </div>
            <label className={`${s.check} ${s.noPrint}`}>
              <input type="checkbox" checked={unconfirmed} onChange={(e) => setUnconfirmed(e.target.checked)} />
              Include maybe and pending replies
            </label>
            <ul className={s.meals}>
              {meals.map(([name, n]) => (
                <li key={name}>
                  <div className={s.mealTop}>
                    <span>{name}</span>
                    <strong>{n}</strong>
                  </div>
                  <div className={s.bar} aria-hidden="true">
                    <span style={{ width: `${(n / maxMeal) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className={s.card} aria-labelledby="bytable-h">
            <h2 id="bytable-h" className={s.cardTitle}>
              Dietary needs by table
            </h2>
            {byTable.length === 0 && notSeated.length === 0 ? (
              <p className={s.empty}>No dietary needs among these guests.</p>
            ) : (
              <ul className={s.byTable}>
                {byTable.map(({ t, rows }) => (
                  <li key={t.id}>
                    <strong>{tableById.get(t.id)?.name}</strong>
                    <span>{rows.map((g) => `${g.diet}: ${g.name}`).join("; ")}</span>
                  </li>
                ))}
                {notSeated.length > 0 ? (
                  <li>
                    <strong>Not seated yet</strong>
                    <span>{notSeated.map((g) => `${g.diet}: ${g.name}`).join("; ")}</span>
                  </li>
                ) : null}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </Shell>
  );
}
```

```tsx src/app/page.tsx
import type { Metadata } from "next";
import { PlanView } from "@/components/seatwise/PlanView";

export const metadata: Metadata = {
  title: "Plan",
  description: "Seating plan for Ines & Mateo's wedding dinner at The Orangery, Hollin Hall.",
};

export default function Page() {
  return <PlanView />;
}
```

```tsx src/app/guests/page.tsx
import type { Metadata } from "next";
import { GuestsView } from "@/components/seatwise/GuestsView";

export const metadata: Metadata = {
  title: "Guests",
  description: "Guest list, RSVPs, tables and meal counts for the wedding dinner.",
};

export default function Page() {
  return <GuestsView />;
}
```

```tsx src/app/layout.tsx
import '@once-ui-system/core/css/styles.css';
import '@once-ui-system/core/css/tokens.css';
import '@/resources/custom.css'

import classNames from "classnames";
import type { Metadata } from "next";

import { fonts, style, dataStyle } from "@/resources";
import { Column, Flex, ThemeInit } from "@once-ui-system/core";
import { LocaleProvider, Providers } from '@/components';
import { PlannerProvider } from '@/components/seatwise/PlannerProvider';
import { getLocale } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: { default: "Seatwise", template: "%s · Seatwise" },
  description: "Seatwise, a seating planner for wedding and event planners.",
};

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
              <PlannerProvider>{children}</PlannerProvider>
            </Column>
          </Column>
        </Providers>
      </LocaleProvider>
    </Flex>
  );
}
```

```css src/components/seatwise/seatwise.module.css
.app {
  --bg: #f5f2ec;
  --surface: #ffffff;
  --ink: #1d2320;
  --muted: #59635c;
  --line: #e2ddd3;
  --brand: #1f5d4a;
  --brand-soft: #e3f0ea;
  --warn: #b3261e;
  --warn-soft: #fdeceb;
  --amber: #7a4e00;
  --amber-soft: #fff1d3;
  --good: #1d6b45;
  --good-soft: #e1f3e8;
  color-scheme: light;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-body), system-ui, sans-serif;
  font-size: 15px;
  line-height: 1.45;
  width: 100%;
  min-height: 100vh;
}
.app * { box-sizing: border-box; }
.skip { position: absolute; left: 8px; top: -60px; background: var(--ink); color: #fff; padding: 8px 12px; border-radius: 8px; z-index: 100; }
.skip:focus { top: 8px; }
.srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.noPrint {}

.header { background: var(--surface); border-bottom: 1px solid var(--line); position: sticky; top: 0; z-index: 20; }
.headerInner { max-width: 1440px; margin: 0 auto; padding: 10px 16px; display: flex; flex-wrap: wrap; align-items: center; gap: 10px 20px; }
.brand { display: inline-flex; align-items: center; gap: 10px; font-weight: 700; font-size: 18px; color: var(--ink); text-decoration: none; letter-spacing: -0.01em; }
.brandMark { width: 30px; height: 30px; }
.eventMeta { display: flex; flex-direction: column; min-width: 0; flex: 1 1 220px; }
.eventName { font-weight: 600; }
.eventSub { color: var(--muted); font-size: 13px; }
.nav { display: flex; gap: 4px; }
.navLink { display: flex; flex-direction: column; padding: 6px 14px; border-radius: 10px; color: var(--ink); text-decoration: none; font-weight: 600; min-height: 44px; justify-content: center; }
.navLink:hover { background: var(--bg); }
.navLinkActive { background: var(--brand-soft); color: var(--brand); }
.navNote { font-weight: 400; font-size: 12px; color: var(--muted); }
.user { display: flex; align-items: center; gap: 10px; }
.avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--brand); color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 13px; }
.userText { display: flex; flex-direction: column; font-size: 13px; line-height: 1.25; }
.userText span { color: var(--muted); }
.skip:focus-visible, .navLink:focus-visible, .brand:focus-visible { outline: 3px solid var(--brand); outline-offset: 2px; }

.main { max-width: 1440px; margin: 0 auto; padding: 20px 16px 48px; display: flex; flex-direction: column; gap: 16px; }
.pageHead { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 12px; }
.h1 { margin: 0; font-size: 26px; letter-spacing: -0.02em; font-family: var(--font-heading), system-ui, sans-serif; }
.sub { margin: 4px 0 0; color: var(--muted); max-width: 62ch; }

.btn, .btnSmall { font: inherit; border: 1px solid var(--line); background: var(--surface); color: var(--ink); border-radius: 10px; cursor: pointer; font-weight: 600; }
.btn { min-height: 44px; padding: 0 16px; }
.btnSmall { min-height: 36px; padding: 0 12px; font-size: 13px; }
.btn:hover, .btnSmall:hover { background: var(--bg); }
.btn:focus-visible, .btnSmall:focus-visible, .linkBtn:focus-visible, .chip:focus-visible, .guestMain:focus-visible, .select:focus-visible, .input:focus-visible { outline: 3px solid var(--brand); outline-offset: 2px; }
.linkBtn { background: none; border: none; padding: 0; color: var(--brand); text-decoration: underline; cursor: pointer; font: inherit; }

.stats { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.stat { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 12px 16px; display: flex; flex-direction: column; }
.statLabel { font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); font-weight: 600; }
.statValue { font-size: 28px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.2; font-variant-numeric: tabular-nums; }
.statNote { font-size: 13px; color: var(--muted); }
.statAmber { color: var(--amber); }
.statBad { color: var(--warn); }
.statGood { color: var(--good); }

.alert { background: var(--warn-soft); border: 1px solid #f1b8b4; color: #7a1712; border-radius: 12px; padding: 10px 14px; }
.alert ul { margin: 6px 0 0; padding-left: 20px; }
.pickBar { position: sticky; top: 72px; z-index: 15; background: var(--brand); color: #fff; border-radius: 12px; padding: 8px 8px 8px 16px; display: flex; gap: 12px; align-items: center; justify-content: space-between; }
.pickBar .btnSmall { color: var(--ink); }

.layout { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 16px; align-items: start; }
.planCol, .side { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.card { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 16px; min-width: 0; }
.cardOver { outline: 3px dashed var(--brand); outline-offset: -3px; background: var(--brand-soft); }
.cardHead { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.cardTitle { margin: 0; font-size: 17px; font-family: var(--font-heading), system-ui, sans-serif; letter-spacing: -0.01em; }
.cardHint { margin: 0 0 10px; color: var(--muted); font-size: 13px; }
.subTitle { font-size: 14px; margin: 16px 0 6px; }
.countPill { display: inline-block; background: var(--bg); border: 1px solid var(--line); border-radius: 999px; padding: 1px 10px; font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums; }
.pillBad { background: var(--warn-soft); color: #8c1d16; border-color: #f1b8b4; }
.pillGood { background: var(--good-soft); color: var(--good); border-color: #b5ddc5; }
.empty { color: var(--muted); margin: 8px 0; }

.planScroll { overflow-x: auto; border-radius: 12px; border: 1px solid var(--line); background: #fbf9f4; }
.plan { display: block; width: 100%; min-width: 720px; height: auto; user-select: none; }
.floor { fill: #fbf9f4; }
.wall { fill: none; stroke: #3b403d; stroke-width: 0.16; }
.stage { fill: #2b302d; }
.bar { fill: #7a5636; }
.dance { fill: url(#sw-floor); stroke: #c9b78e; stroke-width: 0.05; }
.doorGap { fill: #cfe5d8; stroke: #2e7d5b; stroke-width: 0.06; }
.doorSwing { fill: none; stroke: #2e7d5b; stroke-width: 0.05; stroke-dasharray: 0.15 0.12; }
.fixtureLabel { font-size: 0.34px; font-weight: 600; fill: #1f5d4a; pointer-events: none; font-family: var(--font-body), system-ui, sans-serif; }
.fixtureLabelDark { font-size: 0.42px; font-weight: 600; fill: #4a3f26; pointer-events: none; font-family: var(--font-body), system-ui, sans-serif; }
.fixtureLabelLight { font-size: 0.42px; font-weight: 600; fill: #fff; pointer-events: none; font-family: var(--font-body), system-ui, sans-serif; }
.scaleLine { stroke: #59635c; stroke-width: 0.08; }
.scaleText { font-size: 0.3px; fill: #59635c; font-family: var(--font-body), system-ui, sans-serif; }

.table { cursor: pointer; outline: none; }
.tableHalo { fill: transparent; stroke: none; }
.tableBody { fill: #ffffff; stroke: #8a928c; stroke-width: 0.07; }
.tableName { font-size: 0.29px; font-weight: 700; fill: #1d2320; pointer-events: none; font-family: var(--font-body), system-ui, sans-serif; }
.tableCount { font-size: 0.26px; fill: #59635c; pointer-events: none; font-variant-numeric: tabular-nums; font-family: var(--font-body), system-ui, sans-serif; }
.tableSelected .tableHalo { fill: rgba(31, 93, 74, 0.1); stroke: #1f5d4a; stroke-width: 0.07; }
.tableSelected .tableBody { stroke: #1f5d4a; stroke-width: 0.1; }
.tableBroken .tableBody { stroke: #b3261e; stroke-width: 0.13; }
.tableOver .tableHalo { fill: rgba(31, 93, 74, 0.18); stroke: #1f5d4a; stroke-dasharray: 0.2 0.12; stroke-width: 0.07; }
.table:focus-visible .tableHalo { stroke: #000; stroke-width: 0.09; }
.warnBadge { fill: #b3261e; stroke: #fff; stroke-width: 0.04; }
.warnMark { font-size: 0.28px; font-weight: 800; fill: #fff; pointer-events: none; font-family: var(--font-body), system-ui, sans-serif; }

.seat { cursor: pointer; outline: none; }
.seatCircle { stroke: #fff; stroke-width: 0.05; }
.seatFilled { cursor: grab; }
.seatEmpty .seatCircle { fill: #fbf9f4; stroke: #8a928c; stroke-width: 0.06; stroke-dasharray: 0.12 0.09; }
.seatText { font-size: 0.27px; font-weight: 700; fill: #fff; pointer-events: none; font-family: var(--font-body), system-ui, sans-serif; }
.seatPlus { font-size: 0.32px; fill: #59635c; pointer-events: none; font-family: var(--font-body), system-ui, sans-serif; }
.dietDot { fill: #f2a900; stroke: #fff; stroke-width: 0.04; pointer-events: none; }
.seatHint .seatCircle { stroke: #1f5d4a; stroke-width: 0.09; fill: #e3f0ea; }
.seatOver .seatCircle { stroke: #1f5d4a; stroke-width: 0.14; stroke-dasharray: none; fill: #c9e6da; }
.seatPicked .seatCircle { stroke: #1d2320; stroke-width: 0.14; }
.seat:hover .seatCircle { stroke: #1f5d4a; stroke-width: 0.1; }
.seat:focus-visible .seatCircle { stroke: #000; stroke-width: 0.15; }

.legend { list-style: none; margin: 10px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 13px; color: var(--muted); }
.legend li { display: inline-flex; align-items: center; gap: 6px; }
.swatch { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 6px; flex: none; }
.legend .swatch { margin-right: 0; }
.legendDiet { width: 10px; height: 10px; border-radius: 50%; background: #f2a900; display: inline-block; }
.legendEmpty { width: 12px; height: 12px; border-radius: 50%; border: 1.5px dashed #8a928c; display: inline-block; }

.chips { list-style: none; margin: 12px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.chip { font: inherit; min-height: 44px; padding: 4px 12px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-weight: 600; color: var(--ink); }
.chipSel { border-color: var(--brand); background: var(--brand-soft); }
.chipOver { outline: 3px dashed var(--brand); outline-offset: 1px; }
.chipBad { border-color: #e59a95; }
.chipCount { font-weight: 400; color: var(--muted); font-variant-numeric: tabular-nums; }
.chipWarn { font-size: 11px; background: var(--warn); color: #fff; padding: 1px 7px; border-radius: 999px; }

.guestList, .guestListInner { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.guestRow { display: grid; grid-template-columns: 22px minmax(0, 1fr); gap: 4px 6px; align-items: center; border: 1px solid var(--line); border-radius: 12px; padding: 6px 8px; background: var(--surface); cursor: grab; }
.guestRowPicked { border-color: var(--brand); background: var(--brand-soft); box-shadow: 0 0 0 2px var(--brand); }
.grip { color: #8a928c; display: grid; place-items: center; touch-action: none; height: 40px; cursor: grab; }
.guestMain { font: inherit; text-align: left; background: none; border: none; padding: 4px; cursor: pointer; display: flex; flex-wrap: wrap; gap: 2px 8px; align-items: center; color: var(--ink); min-height: 40px; border-radius: 8px; }
.guestName { font-weight: 600; display: inline-flex; align-items: center; }
.guestMeta { color: var(--muted); font-size: 12.5px; }
.rowActions { grid-column: 2; display: flex; gap: 6px; flex-wrap: wrap; cursor: default; }
.dietTag { display: inline-block; background: var(--amber-soft); color: var(--amber); border-radius: 6px; padding: 0 7px; font-size: 12px; font-weight: 600; }
.awaiting { margin-top: 12px; }
.awaiting summary { cursor: pointer; font-weight: 600; min-height: 40px; display: flex; align-items: center; gap: 8px; }
.awaiting .guestList { margin-top: 6px; }

.select, .input { font: inherit; min-height: 40px; border: 1px solid #c9c3b7; border-radius: 10px; background: #fff; padding: 0 10px; color: var(--ink); max-width: 100%; }
.input { width: 100%; }
.rowActions .select { min-height: 36px; font-size: 13px; }

.seatList { list-style: none; margin: 8px 0 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.seatRowWrap { display: grid; grid-template-columns: 22px minmax(0, 1fr); gap: 6px; align-items: start; }
.seatRowEmpty { display: grid; grid-template-columns: 22px 1fr auto; gap: 6px; align-items: center; border: 1px dashed #c9c3b7; border-radius: 12px; padding: 6px 8px; min-height: 40px; }
.seatNo { color: var(--muted); font-size: 12px; text-align: center; font-variant-numeric: tabular-nums; padding-top: 14px; }
.seatRowEmpty .seatNo { padding-top: 0; }
.emptyLabel { color: var(--muted); }
.dietList { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.issueList { margin: 0 0 8px; padding: 8px 8px 8px 24px; background: var(--warn-soft); border-radius: 10px; color: #7a1712; font-size: 13px; }

.ruleList { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.rule { border: 1px solid var(--line); border-left-width: 4px; border-radius: 12px; padding: 8px 12px; display: flex; flex-direction: column; gap: 4px; align-items: flex-start; }
.ruleBroken { border-left-color: var(--warn); background: var(--warn-soft); }
.ruleOpen { border-left-color: #b98a1d; }
.ruleOk { border-left-color: var(--good); }
.ruleTop { display: flex; flex-direction: column; gap: 2px; }
.ruleStatus { font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; }
.ruleBroken .ruleStatus { color: #8c1d16; }
.ruleOpen .ruleStatus { color: var(--amber); }
.ruleOk .ruleStatus { color: var(--good); }
.ruleDetail, .ruleNote, .ruleFlag { margin: 0; font-size: 13px; }
.ruleNote { color: var(--muted); font-style: italic; }
.ruleFlag { color: var(--amber); }

.guestsLayout { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 16px; align-items: start; }
.mealCol { display: flex; flex-direction: column; gap: 16px; }
.filters { display: grid; grid-template-columns: 2fr 1.4fr 1fr 1.4fr; gap: 10px; }
.field { display: flex; flex-direction: column; gap: 4px; font-size: 12.5px; font-weight: 600; color: var(--muted); }
.resultLine { margin: 10px 0; color: var(--muted); font-size: 13px; }
.table2 { width: 100%; border-collapse: collapse; font-size: 14px; }
.table2 th, .table2 td { text-align: left; padding: 8px 10px; border-top: 1px solid var(--line); vertical-align: middle; }
.table2 thead th { border-top: none; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); }
.table2 tbody th { font-weight: 600; }
.rsvp { display: inline-block; padding: 1px 9px; border-radius: 999px; font-size: 12px; font-weight: 700; border: 1px solid var(--line); }
.rsvp_yes { background: var(--good-soft); color: var(--good); border-color: #b5ddc5; }
.rsvp_no { background: #eee; color: #444; }
.rsvp_maybe { background: var(--amber-soft); color: var(--amber); border-color: #ecd29b; }
.rsvp_pending { background: #e8eef6; color: #2c4a74; border-color: #c4d3e6; }
.muted { color: var(--muted); }
.check { display: flex; gap: 8px; align-items: center; min-height: 40px; font-size: 14px; }
.check input { width: 18px; height: 18px; accent-color: var(--brand); }
.meals { list-style: none; margin: 8px 0 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.mealTop { display: flex; justify-content: space-between; gap: 8px; font-variant-numeric: tabular-nums; }
.bar { height: 6px; border-radius: 999px; background: var(--bg); overflow: hidden; margin-top: 3px; }
.bar > span { display: block; height: 100%; background: var(--brand); border-radius: 999px; }
.byTable { list-style: none; margin: 8px 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px; font-size: 13.5px; }
.byTable li { display: flex; flex-direction: column; }
.byTable span { color: var(--muted); }

.toastWrap { position: fixed; left: 0; right: 0; bottom: 16px; display: flex; justify-content: center; pointer-events: none; z-index: 60; padding: 0 16px; }
.toast { background: #1d2320; color: #fff; padding: 10px 16px; border-radius: 12px; box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25); max-width: 560px; }
.ghost { position: fixed; z-index: 70; transform: translate(12px, 12px); pointer-events: none; background: var(--brand); color: #fff; padding: 6px 12px; border-radius: 999px; font-size: 14px; font-weight: 600; box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3); font-family: system-ui, sans-serif; }

@media (max-width: 1100px) {
  .layout, .guestsLayout { grid-template-columns: minmax(0, 1fr); }
  .stats { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 760px) {
  .filters { grid-template-columns: 1fr 1fr; }
  .userText { display: none; }
  .table2 thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
  .table2, .table2 tbody, .table2 tr, .table2 th, .table2 td { display: block; }
  .table2 tr { border: 1px solid var(--line); border-radius: 12px; padding: 6px 10px; margin-bottom: 8px; }
  .table2 th, .table2 td { border: none; padding: 4px 0; }
  .table2 td::before { content: attr(data-label); display: inline-block; min-width: 64px; color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
}
@media (max-width: 520px) {
  .filters { grid-template-columns: 1fr; }
  .stats { gap: 8px; }
  .statValue { font-size: 24px; }
  .navNote { display: none; }
  .pickBar { top: 120px; }
}

@media print {
  .header, .noPrint, .toastWrap, .skip { display: none !important; }
  .app { background: #fff; }
  .card, .stat { break-inside: avoid; }
}
```
