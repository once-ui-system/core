```ts lib/data.ts
export type Rsvp = "yes" | "maybe" | "pending" | "no";

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
  shape: "round" | "long";
  seats: number;
  x: number;
  y: number;
  rotation?: number;
}

export interface Rule {
  kind: "together" | "apart" | "near";
  guests: string[];
  note: string;
  /** Something Hannah should double-check about how the rule was entered. */
  caveat?: string;
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
    caveat:
      "The note names Sean and Ryan Doyle, but the rule is set on Kai Brennan (g-29) and Sean Doyle (g-30). Worth confirming with the couple which pair they mean.",
  },
  { kind: "apart", guests: ["g-12", "g-34"], note: "Ask the couple: old family dispute" },
  {
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
  },
];

export const parties = [
  "Couple",
  "Bride's family",
  "Groom's family",
  "University friends",
  "Work friends",
  "Groom's football club",
  "Plus-ones",
];

/** Chakra colour palette used for each party. */
export const partyPalette: Record<string, string> = {
  Couple: "pink",
  "Bride's family": "orange",
  "Groom's family": "blue",
  "University friends": "green",
  "Work friends": "purple",
  "Groom's football club": "cyan",
  "Plus-ones": "gray",
};

export const rsvpLabel: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Awaiting reply",
  no: "Declined",
};

export const rsvpPalette: Record<Rsvp, string> = {
  yes: "green",
  maybe: "orange",
  pending: "gray",
  no: "red",
};
```

```ts lib/plan.ts
import {
  fixtures,
  guests,
  rules,
  tables,
  type Guest,
  type Rule,
  type TableDef,
} from "./data";

/** SVG units per metre on the floor plan. */
export const SCALE = 50;
export const SEAT_R = 0.4;
export const TABLE_R = 0.85;
export const RING_R = 1.35;

export type Seating = Record<string, { table: string; seat: number }>;

export const guestById = new Map<string, Guest>(guests.map((g) => [g.id, g]));
export const tableById = new Map<string, TableDef>(tables.map((t) => [t.id, t]));

export function initialSeating(): Seating {
  const next: Record<string, number> = {};
  const out: Seating = {};
  for (const g of guests) {
    if (!g.table) continue;
    const i = next[g.table] ?? 0;
    next[g.table] = i + 1;
    out[g.id] = { table: g.table, seat: i };
  }
  return out;
}

export interface SeatPos {
  index: number;
  x: number;
  y: number;
}

/** Seat centres in metres. Round tables ring the table; the top table seats one side, facing the room. */
export function seatPositions(t: TableDef): SeatPos[] {
  if (t.shape === "long") {
    return Array.from({ length: t.seats }, (_, i) => ({
      index: i,
      x: t.x + 0.5 + i,
      y: t.y - 0.5,
    }));
  }
  return Array.from({ length: t.seats }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
    return { index: i, x: t.x + RING_R * Math.cos(a), y: t.y + RING_R * Math.sin(a) };
  });
}

export function tableCenter(t: TableDef): { x: number; y: number } {
  return t.shape === "long" ? { x: t.x + t.seats / 2, y: t.y + 0.5 } : { x: t.x, y: t.y };
}

export function occupancy(seating: Seating): Record<string, (string | null)[]> {
  const out: Record<string, (string | null)[]> = {};
  for (const t of tables) out[t.id] = Array.from({ length: t.seats }, () => null);
  for (const [gid, s] of Object.entries(seating)) {
    const row = out[s.table];
    if (row && s.seat >= 0 && s.seat < row.length) row[s.seat] = gid;
  }
  return out;
}

export type RuleStatus = "ok" | "broken" | "open";

export interface RuleResult {
  id: string;
  rule: Rule;
  status: RuleStatus;
  title: string;
  detail: string;
  tableIds: string[];
  guestIds: string[];
}

const NEAR_DOOR_MAX_M = 4;
const FAR_BAND_MIN_M = 6;

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function fixtureCenter(kind: "door" | "stage") {
  const f = fixtures.find((x) => x.kind === kind);
  return f ? { x: f.x + f.w / 2, y: f.y + f.h / 2 } : null;
}

const nm = (id: string) => guestById.get(id)?.name ?? id;
const tn = (id: string) => tableById.get(id)?.name ?? id;
const join = (parts: string[]) =>
  parts.length <= 1 ? (parts[0] ?? "") : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;

export function evaluateRules(seating: Seating): RuleResult[] {
  const occ = occupancy(seating);
  const door = fixtureCenter("door");
  const band = fixtureCenter("stage");

  return rules.map((rule, i): RuleResult => {
    const id = `r-${i + 1}`;
    const names = rule.guests.map(nm);
    const seated = rule.guests.filter((g) => seating[g]);
    const guestIds = seated;

    if (rule.kind === "together") {
      const title = `Keep together: ${join(names)}`;
      const tablesUsed = Array.from(new Set(seated.map((g) => seating[g].table)));
      if (seated.length < rule.guests.length) {
        const missing = rule.guests.filter((g) => !seating[g]).map(nm);
        return {
          id, rule, status: "open", title,
          detail:
            seated.length === 0
              ? "Neither is seated yet."
              : `${join(missing)} still needs a seat, ideally at ${tn(tablesUsed[0])}.`,
          tableIds: [], guestIds,
        };
      }
      if (tablesUsed.length === 1) {
        return { id, rule, status: "ok", title, detail: `Together at ${tn(tablesUsed[0])}.`, tableIds: [], guestIds };
      }
      return {
        id, rule, status: "broken", title,
        detail: `Split: ${rule.guests.map((g) => `${nm(g)} at ${tn(seating[g].table)}`).join(", ")}.`,
        tableIds: tablesUsed, guestIds,
      };
    }

    if (rule.kind === "apart") {
      const title = `Keep apart: ${join(names)}`;
      if (seated.length < rule.guests.length) {
        return {
          id, rule, status: "open", title,
          detail: seated.length === 0 ? "Neither is seated yet." : `${nm(seated[0])} is at ${tn(seating[seated[0]].table)}; keep ${join(rule.guests.filter((g) => g !== seated[0]).map(nm))} away from it.`,
          tableIds: [], guestIds,
        };
      }
      const tablesUsed = Array.from(new Set(seated.map((g) => seating[g].table)));
      if (tablesUsed.length < seated.length) {
        return { id, rule, status: "broken", title, detail: `Both are at ${tn(tablesUsed[0])}.`, tableIds: tablesUsed, guestIds };
      }
      return {
        id, rule, status: "ok", title,
        detail: rule.guests.map((g) => `${nm(g)} at ${tn(seating[g].table)}`).join(", ") + ".",
        tableIds: [], guestIds,
      };
    }

    // near: close to the garden doors, away from the band
    const gid = rule.guests[0];
    const title = `Seat near the garden doors: ${nm(gid)}`;
    const free = tables
      .filter((t) => occ[t.id].some((s) => s === null) && !(seating[gid] && seating[gid].table === t.id))
      .map((t) => {
        const c = tableCenter(t);
        return { t, d: door ? dist(c, door) : 0, b: band ? dist(c, band) : 99 };
      })
      .filter((x) => x.d <= NEAR_DOOR_MAX_M && x.b >= FAR_BAND_MIN_M)
      .sort((a, b) => a.d - b.d);
    const hint = free.length ? ` ${free[0].t.name} (${free[0].d.toFixed(1)} m from the doors) has a free seat.` : "";
    const s = seating[gid];
    if (!s || !door || !band) {
      return { id, rule, status: "open", title, detail: `Not seated yet.${hint}`, tableIds: [], guestIds };
    }
    const t = tableById.get(s.table);
    if (!t) return { id, rule, status: "open", title, detail: "Not seated yet.", tableIds: [], guestIds };
    const c = tableCenter(t);
    const dd = dist(c, door);
    const db = dist(c, band);
    if (dd <= NEAR_DOOR_MAX_M && db >= FAR_BAND_MIN_M) {
      return {
        id, rule, status: "ok", title,
        detail: `${t.name} is ${dd.toFixed(1)} m from the garden doors and ${db.toFixed(1)} m from the band.`,
        tableIds: [], guestIds,
      };
    }
    const why =
      dd > NEAR_DOOR_MAX_M
        ? `${t.name} is ${dd.toFixed(1)} m from the garden doors (aim for ${NEAR_DOOR_MAX_M} m or less).`
        : `${t.name} is only ${db.toFixed(1)} m from the band (aim for ${FAR_BAND_MIN_M} m or more).`;
    return { id, rule, status: "broken", title, detail: `${why}${hint}`, tableIds: [t.id], guestIds };
  });
}

export function brokenSets(results: RuleResult[]) {
  const tablesSet = new Set<string>();
  const guestsSet = new Set<string>();
  for (const r of results) {
    if (r.status !== "broken") continue;
    r.tableIds.forEach((t) => tablesSet.add(t));
    r.guestIds.forEach((g) => guestsSet.add(g));
  }
  return { tables: tablesSet, guests: guestsSet };
}

/** Number of guests in each meal group. `null` key is the standard menu. */
export function mealKey(g: Guest) {
  return g.diet ?? "Standard menu";
}

export const dietList = Array.from(
  new Set(guests.map((g) => g.diet).filter((d): d is string => !!d)),
).sort((a, b) => a.localeCompare(b));

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T12:00:00Z`));
}

export function initials(name: string) {
  const parts = name.replace(/^Avó\s+/, "").split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}
```

```tsx components/plan-provider.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Box } from "@chakra-ui/react";
import { guests, partyPalette, type Guest } from "@/lib/data";
import {
  brokenSets,
  evaluateRules,
  guestById,
  initialSeating,
  occupancy,
  tableById,
  type RuleResult,
  type Seating,
} from "@/lib/plan";

interface DragState {
  guestId: string;
  x: number;
  y: number;
}

export interface Notice {
  id: number;
  text: string;
  tone: "ok" | "warn";
}

interface PlanContextValue {
  seating: Seating;
  occ: Record<string, (string | null)[]>;
  results: RuleResult[];
  brokenTables: Set<string>;
  brokenGuests: Set<string>;
  selectedGuestId: string | null;
  selectedTableId: string | null;
  activeGuestId: string | null;
  drag: DragState | null;
  dropTarget: string | null;
  notice: Notice | null;
  canUndo: boolean;
  seatedCount: number;
  attendingCount: number;
  toPlace: Guest[];
  undecidedUnseated: Guest[];
  selectGuest: (id: string | null) => void;
  selectTable: (id: string | null) => void;
  placeGuest: (guestId: string, tableId: string, seat?: number) => void;
  unseat: (guestId: string) => void;
  activateTable: (tableId: string) => void;
  activateSeat: (tableId: string, seat: number) => void;
  beginPress: (e: ReactPointerEvent, guestId: string) => void;
  consumeClick: () => boolean;
  undo: () => void;
  reset: () => void;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

function targetAt(x: number, y: number): string | null {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;
  const seat = el.closest("[data-seat]");
  if (seat) return `seat:${seat.getAttribute("data-seat")}`;
  const table = el.closest("[data-table]");
  if (table) return `table:${table.getAttribute("data-table")}`;
  if (el.closest("[data-unseat-zone]")) return "unseat";
  return null;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [seating, setSeating] = useState<Seating>(initialSeating);
  const [history, setHistory] = useState<Seating[]>([]);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const seatingRef = useRef(seating);
  seatingRef.current = seating;
  const historyRef = useRef(history);
  historyRef.current = history;
  const selectedGuestRef = useRef(selectedGuestId);
  selectedGuestRef.current = selectedGuestId;
  const noticeId = useRef(0);
  const lastDragEnd = useRef(0);

  const say = useCallback((text: string, tone: "ok" | "warn" = "ok") => {
    noticeId.current += 1;
    setNotice({ id: noticeId.current, text, tone });
  }, []);

  const commit = useCallback(
    (next: Seating, message: string) => {
      const prevBroken = new Set(
        evaluateRules(seatingRef.current)
          .filter((r) => r.status === "broken")
          .map((r) => r.id),
      );
      const fresh = evaluateRules(next).filter((r) => r.status === "broken" && !prevBroken.has(r.id));
      setHistory((h) => [...h.slice(-29), seatingRef.current]);
      seatingRef.current = next;
      setSeating(next);
      if (fresh.length) {
        say(`${message} Rule broken: ${fresh.map((r) => r.title).join("; ")}.`, "warn");
      } else {
        say(message, "ok");
      }
    },
    [say],
  );

  const placeGuest = useCallback(
    (guestId: string, tableId: string, seat?: number) => {
      const cur = seatingRef.current;
      const guest = guestById.get(guestId);
      const table = tableById.get(tableId);
      if (!guest || !table) return;
      if (guest.rsvp === "no") {
        say(`${guest.name} has declined, so there is no seat to give.`, "warn");
        return;
      }
      const row = occupancy(cur)[tableId];
      const from = cur[guestId];
      let target = seat;
      if (target !== undefined && row[target] && row[target] !== guestId) {
        const other = row[target] as string;
        if (from) {
          commit(
            {
              ...cur,
              [guestId]: { table: tableId, seat: target },
              [other]: { table: from.table, seat: from.seat },
            },
            `Swapped ${guest.name} and ${guestById.get(other)?.name ?? "a guest"}.`,
          );
          setSelectedGuestId(null);
          setSelectedTableId(tableId);
          return;
        }
        target = undefined;
      }
      if (target === undefined) {
        if (from && from.table === tableId) {
          say(`${guest.name} is already at ${table.name}.`);
          return;
        }
        target = row.findIndex((s) => s === null);
        if (target < 0) {
          say(`${table.name} is full. Unseat someone or choose another table.`, "warn");
          return;
        }
      }
      if (from && from.table === tableId && from.seat === target) return;
      commit(
        { ...cur, [guestId]: { table: tableId, seat: target } },
        from
          ? `Moved ${guest.name} from ${tableById.get(from.table)?.name} to ${table.name}.`
          : `Seated ${guest.name} at ${table.name}.`,
      );
      setSelectedGuestId(null);
      setSelectedTableId(tableId);
    },
    [commit, say],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const cur = seatingRef.current;
      const from = cur[guestId];
      const guest = guestById.get(guestId);
      if (!from || !guest) return;
      const next = { ...cur };
      delete next[guestId];
      commit(next, `Unseated ${guest.name} from ${tableById.get(from.table)?.name}.`);
      setSelectedGuestId(null);
    },
    [commit],
  );

  const selectGuest = useCallback((id: string | null) => {
    setSelectedGuestId(id);
    if (id) {
      const s = seatingRef.current[id];
      setSelectedTableId(s ? s.table : null);
    }
  }, []);

  const selectTable = useCallback((id: string | null) => {
    setSelectedTableId(id);
    setSelectedGuestId(null);
  }, []);

  const activateTable = useCallback(
    (tableId: string) => {
      const g = selectedGuestRef.current;
      if (g) placeGuest(g, tableId);
      else setSelectedTableId((cur) => (cur === tableId ? null : tableId));
    },
    [placeGuest],
  );

  const activateSeat = useCallback(
    (tableId: string, seat: number) => {
      const g = selectedGuestRef.current;
      const occupant = occupancy(seatingRef.current)[tableId][seat];
      if (g && occupant !== g) {
        placeGuest(g, tableId, seat);
        return;
      }
      if (occupant) {
        setSelectedGuestId((cur) => (cur === occupant ? null : occupant));
        setSelectedTableId(tableId);
      } else {
        setSelectedGuestId(null);
        setSelectedTableId(tableId);
      }
    },
    [placeGuest],
  );

  const apply = useCallback(
    (guestId: string, target: string | null) => {
      if (!target) return;
      if (target === "unseat") {
        unseat(guestId);
        return;
      }
      // "seat:t-1:3" or "table:t-1"
      const parts = target.split(":");
      if (parts[0] === "seat" && parts.length === 3) {
        placeGuest(guestId, parts[1], Number(parts[2]));
      } else if (parts[0] === "table" && parts.length === 2) {
        placeGuest(guestId, parts[1]);
      }
    },
    [placeGuest, unseat],
  );

  const beginPress = useCallback(
    (e: ReactPointerEvent, guestId: string) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const sx = e.clientX;
      const sy = e.clientY;
      let dragging = false;

      const move = (ev: PointerEvent) => {
        if (!dragging && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 6) dragging = true;
        if (dragging) {
          setDrag({ guestId, x: ev.clientX, y: ev.clientY });
          setDropTarget(targetAt(ev.clientX, ev.clientY));
        }
      };
      const stop = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", cancel);
      };
      const up = (ev: PointerEvent) => {
        stop();
        if (!dragging) return;
        lastDragEnd.current = performance.now();
        const target = targetAt(ev.clientX, ev.clientY);
        setDrag(null);
        setDropTarget(null);
        apply(guestId, target);
      };
      const cancel = () => {
        stop();
        if (dragging) lastDragEnd.current = performance.now();
        setDrag(null);
        setDropTarget(null);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", cancel);
    },
    [apply],
  );

  const consumeClick = useCallback(() => performance.now() - lastDragEnd.current < 350, []);

  const undo = useCallback(() => {
    const h = historyRef.current;
    if (!h.length) return;
    const prev = h[h.length - 1];
    seatingRef.current = prev;
    setSeating(prev);
    setHistory(h.slice(0, -1));
    say("Undid the last change.");
  }, [say]);

  const reset = useCallback(() => {
    const start = initialSeating();
    setHistory((h) => [...h.slice(-29), seatingRef.current]);
    seatingRef.current = start;
    setSeating(start);
    setSelectedGuestId(null);
    say("Plan reset to the starting arrangement.");
  }, [say]);

  const value = useMemo<PlanContextValue>(() => {
    const results = evaluateRules(seating);
    const sets = brokenSets(results);
    const attending = guests.filter((g) => g.rsvp === "yes");
    return {
      seating,
      occ: occupancy(seating),
      results,
      brokenTables: sets.tables,
      brokenGuests: sets.guests,
      selectedGuestId,
      selectedTableId,
      activeGuestId: drag?.guestId ?? selectedGuestId,
      drag,
      dropTarget,
      notice,
      canUndo: history.length > 0,
      seatedCount: Object.keys(seating).length,
      attendingCount: attending.length,
      toPlace: attending.filter((g) => !seating[g.id]),
      undecidedUnseated: guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !seating[g.id]),
      selectGuest,
      selectTable,
      placeGuest,
      unseat,
      activateTable,
      activateSeat,
      beginPress,
      consumeClick,
      undo,
      reset,
    };
  }, [
    seating, selectedGuestId, selectedTableId, drag, dropTarget, notice, history,
    selectGuest, selectTable, placeGuest, unseat, activateTable, activateSeat, beginPress, consumeClick, undo, reset,
  ]);

  const dragGuest = drag ? guestById.get(drag.guestId) : null;
  const dragPalette = dragGuest ? (partyPalette[dragGuest.party] ?? "gray") : "gray";

  return (
    <PlanContext.Provider value={value}>
      {children}
      {drag && dragGuest ? (
        <Box
          aria-hidden
          position="fixed"
          zIndex="toast"
          pointerEvents="none"
          left={`${drag.x + 14}px`}
          top={`${drag.y + 10}px`}
          px="3"
          py="1.5"
          rounded="full"
          bg={`${dragPalette}.solid`}
          color={`${dragPalette}.contrast`}
          fontSize="sm"
          fontWeight="semibold"
          shadow="lg"
          whiteSpace="nowrap"
        >
          {dragGuest.name}
        </Box>
      ) : null}
    </PlanContext.Provider>
  );
}
```

```tsx components/app-shell.tsx
"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Box, chakra, Flex, HStack, Link as ChakraLink, Text } from "@chakra-ui/react";
import { LuArmchair, LuCalendarDays, LuMapPin } from "react-icons/lu";
import { Avatar } from "@/components/ui/avatar";
import { ColorModeButton } from "@/components/ui/color-mode";
import { event, planner } from "@/lib/data";
import { formatDate } from "@/lib/plan";

const nav = [
  { href: "/", label: "Plan" },
  { href: "/guests", label: "Guests" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <Flex direction="column" minH="100dvh" bg="bg.subtle">
      <chakra.a
        href="#main"
        position="absolute"
        left="-9999px"
        _focus={{ left: "3", top: "3", zIndex: "max", bg: "bg.panel", px: "3", py: "2", rounded: "md", shadow: "md" }}
      >
        Skip to content
      </chakra.a>
      <Box
        as="header"
        position="sticky"
        top="0"
        zIndex="sticky"
        bg="bg.panel"
        borderBottomWidth="1px"
        borderColor="border.muted"
      >
        <Flex align="center" gap={{ base: "3", md: "6" }} px={{ base: "4", md: "6" }} h="14" maxW="1600px" mx="auto">
          <HStack gap="2" flexShrink={0}>
            <Flex boxSize="8" rounded="lg" bg="fg" color="bg" align="center" justify="center" aria-hidden>
              <LuArmchair size={18} />
            </Flex>
            <Text fontWeight="bold" letterSpacing="tight" fontSize="lg">
              Seatwise
            </Text>
          </HStack>

          <Box as="nav" aria-label="Main">
            <HStack gap="1">
              {nav.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <ChakraLink
                    key={item.href}
                    asChild
                    px="3"
                    py="1.5"
                    rounded="md"
                    fontSize="sm"
                    fontWeight="medium"
                    color={active ? "fg" : "fg.muted"}
                    bg={active ? "bg.muted" : "transparent"}
                    textDecoration="none"
                    _hover={{ bg: "bg.muted", color: "fg" }}
                    _focusVisible={{ outline: "2px solid", outlineColor: "teal.solid" }}
                  >
                    <NextLink href={item.href} aria-current={active ? "page" : undefined}>
                      {item.label}
                    </NextLink>
                  </ChakraLink>
                );
              })}
            </HStack>
          </Box>

          <Box flex="1" minW="0" display={{ base: "none", md: "block" }} textAlign="end">
            <Text fontSize="sm" fontWeight="semibold" truncate>
              {event.name}
            </Text>
            <HStack gap="3" justify="flex-end" color="fg.muted" fontSize="xs">
              <HStack gap="1">
                <LuCalendarDays aria-hidden />
                <Text as="span">{formatDate(event.date)}</Text>
              </HStack>
              <HStack gap="1" display={{ base: "none", xl: "flex" }}>
                <LuMapPin aria-hidden />
                <Text as="span">{event.venue}</Text>
              </HStack>
            </HStack>
          </Box>
          <Box flex="1" display={{ base: "block", md: "none" }} />

          <HStack gap="2" flexShrink={0}>
            <ColorModeButton />
            <Avatar size="sm" name={planner.name} />
          </HStack>
        </Flex>
      </Box>
      <Box as="main" flex="1" id="main">
        {children}
      </Box>
    </Flex>
  );
}
```

```tsx components/floor-plan.tsx
"use client";

import type { KeyboardEvent } from "react";
import { Box } from "@chakra-ui/react";
import { event, fixtures, partyPalette, tables, type TableDef } from "@/lib/data";
import { usePlan } from "@/components/plan-provider";
import {
  RING_R,
  SCALE,
  SEAT_R,
  TABLE_R,
  guestById,
  initials,
  seatPositions,
} from "@/lib/plan";

const PAD = 44;
const W = event.room_m.width * SCALE;
const H = event.room_m.depth * SCALE;
const m = (v: number) => v * SCALE;

const v = (name: string) => `var(--chakra-colors-${name})`;
const palette = (p: string, tone: "solid" | "contrast" | "subtle" | "muted" | "fg") => v(`${p}-${tone}`);

const FIXTURE_STYLE: Record<string, { fill: string; stroke: string; text: string }> = {
  stage: { fill: v("purple-subtle"), stroke: v("purple-solid"), text: v("purple-fg") },
  dancefloor: { fill: v("orange-subtle"), stroke: v("orange-muted"), text: v("orange-fg") },
  bar: { fill: v("teal-subtle"), stroke: v("teal-solid"), text: v("teal-fg") },
  door: { fill: v("green-solid"), stroke: v("green-solid"), text: v("green-fg") },
};

function onKey(fn: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  };
}

function TableShape({ t }: { t: TableDef }) {
  const {
    occ,
    brokenTables,
    brokenGuests,
    selectedTableId,
    selectedGuestId,
    activeGuestId,
    dropTarget,
    activateTable,
    activateSeat,
    beginPress,
    consumeClick,
  } = usePlan();

  const row = occ[t.id];
  const filled = row.filter(Boolean).length;
  const full = filled === t.seats;
  const broken = brokenTables.has(t.id);
  const selected = selectedTableId === t.id;
  const candidate = !!activeGuestId && !full;
  const hovered = dropTarget === `table:${t.id}` || (dropTarget?.startsWith(`seat:${t.id}:`) ?? false);
  const seats = seatPositions(t);
  const long = t.shape === "long";

  const cx = long ? m(t.x + t.seats / 2) : m(t.x);
  const cy = long ? m(t.y + 0.5) : m(t.y);

  const haloStroke = hovered
    ? v("teal-solid")
    : broken
      ? v("red-solid")
      : selected
        ? v("fg")
        : candidate
          ? v("teal-solid")
          : "transparent";
  const haloFill = hovered
    ? v("teal-muted")
    : broken
      ? v("red-subtle")
      : candidate
        ? v("teal-subtle")
        : selected
          ? v("bg-muted")
          : "transparent";

  const tableLabel = `${t.name}, ${filled} of ${t.seats} seats filled${broken ? ", a seating rule is broken" : ""}`;

  return (
    <g data-table={t.id}>
      {long ? (
        <rect
          x={m(t.x) - 22}
          y={m(t.y - 1.05)}
          width={m(t.seats) + 44}
          height={m(2.1) + 0}
          rx={26}
          fill={haloFill}
          stroke={haloStroke}
          strokeWidth={selected || hovered ? 3 : 2}
          strokeDasharray={candidate && !hovered && !selected && !broken ? "6 5" : undefined}
        />
      ) : (
        <circle
          cx={cx}
          cy={cy}
          r={m(RING_R + SEAT_R + 0.15)}
          fill={haloFill}
          stroke={haloStroke}
          strokeWidth={selected || hovered ? 3 : 2}
          strokeDasharray={candidate && !hovered && !selected && !broken ? "6 5" : undefined}
        />
      )}

      {/* table top */}
      <g
        className="sw-focus"
        role="button"
        tabIndex={0}
        aria-label={tableLabel}
        aria-pressed={selected}
        style={{ cursor: "pointer" }}
        onClick={() => {
          if (consumeClick()) return;
          activateTable(t.id);
        }}
        onKeyDown={onKey(() => activateTable(t.id))}
      >
        {long ? (
          <rect x={m(t.x)} y={m(t.y)} width={m(t.seats)} height={m(1)} rx={10} fill={v("bg-panel")} stroke={v("border-emphasized")} strokeWidth={2} />
        ) : (
          <circle cx={cx} cy={cy} r={m(TABLE_R)} fill={v("bg-panel")} stroke={v("border-emphasized")} strokeWidth={2} />
        )}
        <text x={cx} y={long ? cy - 3 : cy - 3} textAnchor="middle" fontSize={long ? 15 : 14} fontWeight={700} fill={v("fg")}>
          {t.name}
        </text>
        <text x={cx} y={cy + 15} textAnchor="middle" fontSize={13} fontWeight={600} fill={full ? v("green-fg") : v("fg-muted")}>
          {filled}/{t.seats}
        </text>
      </g>

      {broken ? (
        <g transform={`translate(${long ? m(t.x + t.seats) + 6 : cx + m(RING_R + 0.35)}, ${long ? m(t.y - 1.0) : cy - m(RING_R + 0.35)})`} aria-hidden>
          <circle r={11} fill={v("red-solid")} stroke={v("bg-panel")} strokeWidth={2} />
          <text y={5} textAnchor="middle" fontSize={14} fontWeight={800} fill={v("red-contrast")}>
            !
          </text>
        </g>
      ) : null}

      {seats.map((s) => {
        const gid = row[s.index];
        const guest = gid ? guestById.get(gid) : undefined;
        const key = `${t.id}:${s.index}`;
        const pal = guest ? (partyPalette[guest.party] ?? "gray") : "gray";
        const isSel = !!gid && selectedGuestId === gid;
        const isBroken = !!gid && brokenGuests.has(gid);
        const isDropHere = dropTarget === `seat:${key}`;
        const label = guest
          ? `${t.name}, seat ${s.index + 1}: ${guest.name}, ${guest.party}${guest.diet ? `, ${guest.diet}` : ""}${isBroken ? ", involved in a broken rule" : ""}`
          : `${t.name}, seat ${s.index + 1}: empty${activeGuestId ? ", place the selected guest here" : ""}`;
        return (
          <g
            key={key}
            data-seat={key}
            className="sw-focus"
            role="button"
            tabIndex={0}
            aria-label={label}
            aria-pressed={guest ? isSel : undefined}
            transform={`translate(${m(s.x)}, ${m(s.y)})`}
            style={{ cursor: guest ? "grab" : "pointer", touchAction: guest ? "none" : "auto" }}
            onPointerDown={guest && gid ? (e) => beginPress(e, gid) : undefined}
            onClick={() => {
              if (consumeClick()) return;
              activateSeat(t.id, s.index);
            }}
            onKeyDown={onKey(() => activateSeat(t.id, s.index))}
          >
            <title>{guest ? `${guest.name} (${guest.party})${guest.diet ? ` - ${guest.diet}` : ""}` : `${t.name}, seat ${s.index + 1} (empty)`}</title>
            <circle r={m(SEAT_R) + 7} fill="transparent" />
            <circle
              r={m(SEAT_R)}
              fill={guest ? palette(pal, "solid") : v("bg-panel")}
              stroke={
                isDropHere ? v("teal-solid") : isBroken ? v("red-solid") : isSel ? v("fg") : guest ? v("bg-panel") : v("border-emphasized")
              }
              strokeWidth={isDropHere || isSel ? 4 : isBroken ? 3.5 : guest ? 1.5 : 1.5}
              strokeDasharray={guest ? undefined : "3 3"}
            />
            {guest ? (
              <text y={4.5} textAnchor="middle" fontSize={12} fontWeight={700} fill={palette(pal, "contrast")} pointerEvents="none">
                {initials(guest.name)}
              </text>
            ) : null}
            {guest?.diet ? (
              <circle cx={m(SEAT_R) * 0.8} cy={-m(SEAT_R) * 0.8} r={5.5} fill={v("yellow-solid")} stroke={v("bg-panel")} strokeWidth={1.5} pointerEvents="none" />
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

export function FloorPlan() {
  const vbW = W + PAD * 2;
  const vbH = H + PAD * 2;
  return (
    <Box overflowX="auto" css={{ WebkitOverflowScrolling: "touch" }}>
      <style>{`.sw-focus{outline:none}.sw-focus:focus-visible{outline:3px solid var(--chakra-colors-teal-solid);outline-offset:2px;border-radius:6px}`}</style>
      <svg
        viewBox={`${-PAD} ${-PAD} ${vbW} ${vbH}`}
        role="group"
        aria-label={`Floor plan of ${event.venue}, ${event.room_m.width} by ${event.room_m.depth} metres, drawn to scale`}
        style={{ display: "block", width: "100%", minWidth: 760, height: "auto", userSelect: "none", WebkitUserSelect: "none" }}
      >
        {/* floor with a metre grid */}
        <defs>
          <pattern id="sw-grid" width={SCALE} height={SCALE} patternUnits="userSpaceOnUse">
            <path d={`M ${SCALE} 0 L 0 0 0 ${SCALE}`} fill="none" stroke={v("border-muted")} strokeWidth={1} />
          </pattern>
        </defs>
        <rect x={0} y={0} width={W} height={H} fill={v("bg-muted")} />
        <rect x={0} y={0} width={W} height={H} fill="url(#sw-grid)" opacity={0.55} />
        <rect x={0} y={0} width={W} height={H} fill="none" stroke={v("fg-muted")} strokeWidth={4} />

        {/* dimensions */}
        <g fill={v("fg-muted")} fontSize={13} fontWeight={600} textAnchor="middle">
          <text x={W / 2} y={-16}>{event.room_m.width} m</text>
          <text transform={`translate(-16 ${H / 2}) rotate(-90)`}>{event.room_m.depth} m</text>
        </g>

        {fixtures.map((f) => {
          const s = FIXTURE_STYLE[f.kind];
          const cx = m(f.x + f.w / 2);
          const cy = m(f.y + f.h / 2);
          const narrow = f.w < 1;
          return (
            <g key={f.id} role="img" aria-label={`${f.label}, ${f.w} by ${f.h} metres`}>
              <rect
                x={m(f.x)}
                y={m(f.y)}
                width={m(f.w)}
                height={m(f.h)}
                rx={f.kind === "door" ? 2 : 10}
                fill={s.fill}
                stroke={s.stroke}
                strokeWidth={f.kind === "door" ? 3 : 2}
                strokeDasharray={f.kind === "dancefloor" ? "8 6" : undefined}
              />
              {narrow ? (
                <text transform={`translate(${m(f.x) + m(f.w) + 16} ${cy}) rotate(-90)`} textAnchor="middle" fontSize={11} fontWeight={700} fill={s.text} letterSpacing={0.5}>
                  {f.label.toUpperCase()}
                </text>
              ) : (
                <text x={cx} y={cy + 5} textAnchor="middle" fontSize={f.kind === "bar" ? 14 : 15} fontWeight={700} fill={s.text} letterSpacing={0.4}>
                  {f.label}
                </text>
              )}
            </g>
          );
        })}

        {tables.map((t) => (
          <TableShape key={t.id} t={t} />
        ))}

        {/* scale bar */}
        <g transform={`translate(${W - m(5)} ${H + 28})`} fill={v("fg-muted")} fontSize={12} fontWeight={600}>
          <rect x={0} y={-6} width={m(5)} height={6} fill="none" stroke={v("fg-muted")} strokeWidth={1.5} />
          <rect x={0} y={-6} width={m(2.5)} height={6} fill={v("fg-muted")} />
          <text x={m(5) + 8} y={0}>5 m</text>
        </g>
      </svg>
    </Box>
  );
}
```

```tsx components/guest-chip.tsx
"use client";

import { Badge, Box, Flex, HStack, Text } from "@chakra-ui/react";
import { LuGripVertical } from "react-icons/lu";
import { usePlan } from "@/components/plan-provider";
import { partyPalette, rsvpLabel, type Guest } from "@/lib/data";

export function GuestChip({ guest, showTable }: { guest: Guest; showTable?: string }) {
  const { selectedGuestId, selectGuest, beginPress, consumeClick, brokenGuests } = usePlan();
  const selected = selectedGuestId === guest.id;
  const pal = partyPalette[guest.party] ?? "gray";
  const flagged = brokenGuests.has(guest.id);

  return (
    <Flex
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${guest.name}, ${guest.party}${guest.diet ? `, ${guest.diet}` : ""}${guest.rsvp !== "yes" ? `, ${rsvpLabel[guest.rsvp]}` : ""}. Press to select, then choose a table.`}
      align="center"
      gap="2.5"
      pl="1"
      pr="3"
      py="2"
      rounded="lg"
      borderWidth="1px"
      borderColor={selected ? "fg" : flagged ? "red.solid" : "border.muted"}
      bg={selected ? "bg.muted" : "bg.panel"}
      cursor="grab"
      userSelect="none"
      onPointerDown={(e) => beginPress(e, guest.id)}
      onClick={() => {
        if (consumeClick()) return;
        selectGuest(selected ? null : guest.id);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectGuest(selected ? null : guest.id);
        }
      }}
      _hover={{ borderColor: "border.emphasized" }}
      _focusVisible={{ outline: "2px solid", outlineColor: "teal.solid", outlineOffset: "1px" }}
    >
      <Box
        aria-hidden
        color="fg.subtle"
        px="1"
        py="2"
        style={{ touchAction: "none" }}
        display="flex"
        alignItems="center"
      >
        <LuGripVertical />
      </Box>
      <Box boxSize="2.5" rounded="full" flexShrink={0} bg={`${pal}.solid`} aria-hidden />
      <Box flex="1" minW="0">
        <Text fontSize="sm" fontWeight="semibold" truncate>
          {guest.name}
        </Text>
        <Text fontSize="xs" color="fg.muted" truncate>
          {guest.party}
          {showTable ? ` · ${showTable}` : ""}
        </Text>
      </Box>
      <HStack gap="1" flexShrink={0}>
        {guest.rsvp !== "yes" ? (
          <Badge size="xs" colorPalette={guest.rsvp === "maybe" ? "orange" : "gray"} variant="subtle">
            {rsvpLabel[guest.rsvp]}
          </Badge>
        ) : null}
        {guest.diet ? (
          <Badge size="xs" colorPalette="yellow" variant="subtle">
            {guest.diet}
          </Badge>
        ) : null}
      </HStack>
    </Flex>
  );
}
```

```tsx components/panel.tsx
import type { ReactNode } from "react";
import { Box, type BoxProps, Flex, Heading } from "@chakra-ui/react";

export function Panel(props: BoxProps) {
  return (
    <Box
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border.muted"
      rounded="xl"
      shadow="xs"
      {...props}
    />
  );
}

export function PanelHeader({
  title,
  children,
  id,
}: {
  title: ReactNode;
  children?: ReactNode;
  id?: string;
}) {
  return (
    <Flex align="center" justify="space-between" gap="3" px="4" py="3" borderBottomWidth="1px" borderColor="border.muted" wrap="wrap">
      <Heading as="h2" id={id} size="sm">
        {title}
      </Heading>
      {children}
    </Flex>
  );
}
```

```tsx components/plan-sidebar.tsx
"use client";

import { Badge, Box, Button, chakra, Flex, HStack, Stack, Text } from "@chakra-ui/react";
import { LuCircleCheck, LuTriangleAlert, LuX } from "react-icons/lu";
import { GuestChip } from "@/components/guest-chip";
import { Panel, PanelHeader } from "@/components/panel";
import { usePlan } from "@/components/plan-provider";
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select";
import { partyPalette, rsvpLabel, rsvpPalette, tables } from "@/lib/data";
import { guestById, tableById, type RuleResult } from "@/lib/plan";

const STATUS_LABEL = { ok: "Fine", broken: "Broken", open: "Waiting" } as const;
const STATUS_PALETTE = { ok: "green", broken: "red", open: "gray" } as const;

function RuleLine({ r }: { r: RuleResult }) {
  const { seating, selectTable } = usePlan();
  const jump = r.tableIds[0] ?? (r.guestIds[0] ? seating[r.guestIds[0]]?.table : undefined);
  const body = (
    <Flex gap="3" align="flex-start" textAlign="start" w="full">
      <Box mt="0.5" color={`${STATUS_PALETTE[r.status]}.fg`} flexShrink={0} aria-hidden>
        {r.status === "broken" ? <LuTriangleAlert /> : r.status === "ok" ? <LuCircleCheck /> : <Box boxSize="3.5" rounded="full" borderWidth="2px" borderStyle="dashed" borderColor="border.emphasized" />}
      </Box>
      <Box flex="1" minW="0">
        <HStack justify="space-between" align="flex-start" gap="2">
          <Text fontSize="sm" fontWeight="semibold">
            {r.title}
          </Text>
          <Badge size="xs" colorPalette={STATUS_PALETTE[r.status]} variant={r.status === "broken" ? "solid" : "subtle"} flexShrink={0}>
            {STATUS_LABEL[r.status]}
          </Badge>
        </HStack>
        <Text fontSize="xs" color="fg.muted" mt="0.5">
          {r.detail}
        </Text>
        <Text fontSize="xs" color="fg.subtle" mt="0.5">
          Couple's note: {r.rule.note}
        </Text>
        {r.rule.caveat ? (
          <Text fontSize="xs" color="orange.fg" mt="1">
            Check: {r.rule.caveat}
          </Text>
        ) : null}
      </Box>
    </Flex>
  );
  if (!jump) return <Box px="4" py="3">{body}</Box>;
  return (
    <chakra.button
      type="button"
      w="full"
      px="4"
      py="3"
      cursor="pointer"
      _hover={{ bg: "bg.muted" }}
      _focusVisible={{ outline: "2px solid", outlineColor: "teal.solid", outlineOffset: "-2px" }}
      onClick={() => selectTable(jump)}
      aria-label={`${r.title}. ${STATUS_LABEL[r.status]}. ${r.detail} Show ${tableById.get(jump)?.name}.`}
    >
      {body}
    </chakra.button>
  );
}

export function RulesCard() {
  const { results } = usePlan();
  const broken = results.filter((r) => r.status === "broken").length;
  const ok = results.filter((r) => r.status === "ok").length;
  const open = results.length - broken - ok;
  const ordered = [...results].sort((a, b) => {
    const rank = { broken: 0, open: 1, ok: 2 } as const;
    return rank[a.status] - rank[b.status];
  });
  return (
    <Panel as="section" aria-labelledby="rules-h">
      <PanelHeader title="The couple's rules" id="rules-h">
        <HStack gap="1.5" aria-live="polite">
          {broken ? (
            <Badge colorPalette="red" variant="solid">
              {broken} broken
            </Badge>
          ) : (
            <Badge colorPalette="green" variant="subtle">
              None broken
            </Badge>
          )}
          {open ? (
            <Badge colorPalette="gray" variant="subtle">
              {open} waiting
            </Badge>
          ) : null}
          <Badge colorPalette="green" variant="subtle">
            {ok} fine
          </Badge>
        </HStack>
      </PanelHeader>
      <Stack gap="0" separator={<Box borderTopWidth="1px" borderColor="border.muted" />}>
        {ordered.map((r) => (
          <RuleLine key={r.id} r={r} />
        ))}
      </Stack>
    </Panel>
  );
}

function GuestPanel({ id }: { id: string }) {
  const { seating, occ, results, unseat, placeGuest, selectGuest, selectTable } = usePlan();
  const g = guestById.get(id);
  if (!g) return null;
  const s = seating[id];
  const pal = partyPalette[g.party] ?? "gray";
  const options = tables
    .filter((t) => t.id !== s?.table && occ[t.id].some((x) => x === null))
    .map((t) => ({ value: t.id, label: `${t.name} (${occ[t.id].filter((x) => x === null).length} free)` }));
  const related = results.filter((r) => r.rule.guests.includes(id));
  return (
    <Stack gap="3" p="4">
      <Flex justify="space-between" align="flex-start" gap="3">
        <Box minW="0">
          <Text fontSize="xs" color="fg.muted" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">
            Selected guest
          </Text>
          <Text fontSize="lg" fontWeight="bold" lineHeight="short">
            {g.name}
          </Text>
        </Box>
        <Button size="xs" variant="ghost" onClick={() => selectGuest(null)} aria-label="Clear selection">
          <LuX />
        </Button>
      </Flex>
      <HStack wrap="wrap" gap="1.5">
        <Badge colorPalette={pal} variant="subtle">
          {g.party}
        </Badge>
        <Badge colorPalette={rsvpPalette[g.rsvp]} variant="subtle">
          {rsvpLabel[g.rsvp]}
        </Badge>
        {g.diet ? (
          <Badge colorPalette="yellow" variant="subtle">
            {g.diet}
          </Badge>
        ) : (
          <Badge colorPalette="gray" variant="outline">
            No dietary needs
          </Badge>
        )}
      </HStack>
      <Text fontSize="sm" color="fg.muted">
        {s
          ? `Sitting at ${tableById.get(s.table)?.name}, seat ${s.seat + 1}.`
          : "Not seated yet. Tap a table or an empty seat on the plan, or drag them there."}
      </Text>
      {g.rsvp === "no" ? (
        <Text fontSize="sm" color="red.fg">
          Declined, so this guest cannot be seated.
        </Text>
      ) : (
        <NativeSelectRoot size="sm">
          <NativeSelectField
            aria-label={s ? "Move to another table" : "Seat at a table"}
            value=""
            onChange={(e) => {
              if (e.target.value) placeGuest(id, e.target.value);
            }}
            items={[{ value: "", label: s ? "Move to another table..." : "Seat at a table..." }, ...options]}
          />
        </NativeSelectRoot>
      )}
      {related.length ? (
        <Stack gap="1">
          {related.map((r) => (
            <HStack key={r.id} gap="2" align="flex-start" fontSize="xs" color={r.status === "broken" ? "red.fg" : "fg.muted"}>
              <Box mt="0.5" aria-hidden>
                {r.status === "broken" ? <LuTriangleAlert /> : <LuCircleCheck />}
              </Box>
              <Text>
                {r.title}: {r.detail}
              </Text>
            </HStack>
          ))}
        </Stack>
      ) : null}
      <HStack gap="2">
        {s ? (
          <Button size="sm" variant="outline" colorPalette="red" onClick={() => unseat(id)}>
            Unseat
          </Button>
        ) : null}
        {s ? (
          <Button size="sm" variant="ghost" onClick={() => selectTable(s.table)}>
            Show table
          </Button>
        ) : null}
      </HStack>
    </Stack>
  );
}

function TablePanel({ id }: { id: string }) {
  const { occ, results, selectGuest, selectTable, activeGuestId, placeGuest } = usePlan();
  const t = tableById.get(id);
  if (!t) return null;
  const row = occ[id];
  const filled = row.filter(Boolean).length;
  const diets = new Map<string, number>();
  for (const gid of row) {
    const d = gid ? guestById.get(gid)?.diet : null;
    if (d) diets.set(d, (diets.get(d) ?? 0) + 1);
  }
  const broken = results.filter((r) => r.status === "broken" && r.tableIds.includes(id));
  return (
    <Stack gap="3" p="4">
      <Flex justify="space-between" align="flex-start" gap="3">
        <Box minW="0">
          <Text fontSize="xs" color="fg.muted" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">
            Selected table
          </Text>
          <Text fontSize="lg" fontWeight="bold" lineHeight="short">
            {t.name}
          </Text>
          <Text fontSize="sm" color="fg.muted">
            {filled} of {t.seats} seats filled, {t.seats - filled} free
          </Text>
        </Box>
        <Button size="xs" variant="ghost" onClick={() => selectTable(null)} aria-label="Clear selection">
          <LuX />
        </Button>
      </Flex>

      {broken.map((r) => (
        <HStack key={r.id} gap="2" align="flex-start" p="2.5" rounded="md" bg="red.subtle" color="red.fg" fontSize="xs">
          <Box mt="0.5" aria-hidden>
            <LuTriangleAlert />
          </Box>
          <Text>
            <b>{r.title}.</b> {r.detail}
          </Text>
        </HStack>
      ))}

      <Stack gap="1">
        {row.map((gid, i) => {
          const g = gid ? guestById.get(gid) : undefined;
          if (!g) {
            return (
              <chakra.button
                key={`e-${i}`}
                type="button"
                display="flex"
                alignItems="center"
                gap="2"
                px="2.5"
                py="1.5"
                rounded="md"
                borderWidth="1px"
                borderStyle="dashed"
                borderColor="border.emphasized"
                color="fg.muted"
                fontSize="sm"
                textAlign="start"
                disabled={!activeGuestId}
                cursor={activeGuestId ? "pointer" : "default"}
                _hover={activeGuestId ? { bg: "teal.subtle", borderColor: "teal.solid" } : undefined}
                onClick={() => activeGuestId && placeGuest(activeGuestId, id, i)}
              >
                <Text as="span" w="5" textAlign="end" fontVariantNumeric="tabular-nums">
                  {i + 1}
                </Text>
                {activeGuestId ? "Empty: place the selected guest here" : "Empty seat"}
              </chakra.button>
            );
          }
          const pal = partyPalette[g.party] ?? "gray";
          return (
            <chakra.button
              key={gid}
              type="button"
              display="flex"
              alignItems="center"
              gap="2"
              px="2.5"
              py="1.5"
              rounded="md"
              bg="bg.muted"
              textAlign="start"
              fontSize="sm"
              onClick={() => selectGuest(g.id)}
              _hover={{ bg: "bg.emphasized" }}
              _focusVisible={{ outline: "2px solid", outlineColor: "teal.solid" }}
            >
              <Text as="span" w="5" textAlign="end" color="fg.muted" fontVariantNumeric="tabular-nums">
                {i + 1}
              </Text>
              <Box boxSize="2.5" rounded="full" bg={`${pal}.solid`} flexShrink={0} aria-hidden />
              <Text as="span" flex="1" minW="0" fontWeight="medium" truncate>
                {g.name}
              </Text>
              {g.rsvp !== "yes" ? (
                <Badge size="xs" colorPalette="orange" variant="subtle">
                  {rsvpLabel[g.rsvp]}
                </Badge>
              ) : null}
              {g.diet ? (
                <Badge size="xs" colorPalette="yellow" variant="subtle">
                  {g.diet}
                </Badge>
              ) : null}
            </chakra.button>
          );
        })}
      </Stack>

      <Box>
        <Text fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="wider" mb="1.5">
          Dietary needs at this table
        </Text>
        {diets.size ? (
          <HStack wrap="wrap" gap="1.5">
            {Array.from(diets.entries()).map(([d, n]) => (
              <Badge key={d} colorPalette="yellow" variant="subtle">
                {n} x {d}
              </Badge>
            ))}
          </HStack>
        ) : (
          <Text fontSize="sm" color="fg.muted">
            None noted.
          </Text>
        )}
      </Box>
    </Stack>
  );
}

export function SelectionCard() {
  const { selectedGuestId, selectedTableId } = usePlan();
  return (
    <Panel as="section" aria-label="Selection">
      {selectedGuestId ? (
        <GuestPanel id={selectedGuestId} />
      ) : selectedTableId ? (
        <TablePanel id={selectedTableId} />
      ) : (
        <Stack gap="1" p="4">
          <Text fontWeight="semibold">Nothing selected</Text>
          <Text fontSize="sm" color="fg.muted">
            Select a table to see its guests and their dietary needs. Select a guest, then tap a table or an empty seat, or drag them across.
          </Text>
        </Stack>
      )}
    </Panel>
  );
}

export function ToPlaceCard() {
  const { toPlace, undecidedUnseated, dropTarget, activeGuestId, seating } = usePlan();
  const over = dropTarget === "unseat";
  const canUnseatByDrop = !!activeGuestId && !!seating[activeGuestId];
  return (
    <Panel
      as="section"
      aria-labelledby="toplace-h"
      data-unseat-zone=""
      borderColor={over ? "teal.solid" : canUnseatByDrop ? "teal.muted" : "border.muted"}
      borderStyle={canUnseatByDrop ? "dashed" : "solid"}
      bg={over ? "teal.subtle" : "bg.panel"}
    >
      <PanelHeader title="Guests to place" id="toplace-h">
        <Badge colorPalette={toPlace.length ? "orange" : "green"} variant="subtle">
          {toPlace.length ? `${toPlace.length} without a seat` : "All seated"}
        </Badge>
      </PanelHeader>
      <Stack gap="2" p="3">
        {canUnseatByDrop ? (
          <Text fontSize="xs" color="teal.fg" fontWeight="medium">
            Drop here to unseat
          </Text>
        ) : null}
        {toPlace.length === 0 ? (
          <HStack gap="2" color="green.fg" fontSize="sm" p="2">
            <LuCircleCheck aria-hidden />
            <Text>Everyone attending has a seat.</Text>
          </HStack>
        ) : (
          toPlace.map((g) => <GuestChip key={g.id} guest={g} />)
        )}
        {undecidedUnseated.length ? (
          <>
            <Text fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="wider" mt="2">
              Not confirmed yet
            </Text>
            {undecidedUnseated.map((g) => (
              <GuestChip key={g.id} guest={g} />
            ))}
          </>
        ) : null}
      </Stack>
    </Panel>
  );
}
```

```tsx components/table-list.tsx
"use client";

import { Badge, Box, chakra, Flex, HStack, SimpleGrid, Text } from "@chakra-ui/react";
import { LuTriangleAlert } from "react-icons/lu";
import { Panel } from "@/components/panel";
import { usePlan } from "@/components/plan-provider";
import { partyPalette, rsvpLabel, tables } from "@/lib/data";
import { guestById } from "@/lib/plan";

/** The same plan as a list: easier to read and tap on a phone. */
export function TableList() {
  const {
    occ,
    brokenTables,
    brokenGuests,
    selectedTableId,
    selectedGuestId,
    activeGuestId,
    dropTarget,
    activateTable,
    activateSeat,
    beginPress,
    consumeClick,
  } = usePlan();

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap="3" p="3">
      {tables.map((t) => {
        const row = occ[t.id];
        const filled = row.filter(Boolean).length;
        const broken = brokenTables.has(t.id);
        const selected = selectedTableId === t.id;
        const hovered = dropTarget === `table:${t.id}` || (dropTarget?.startsWith(`seat:${t.id}:`) ?? false);
        const candidate = !!activeGuestId && filled < t.seats;
        return (
          <Panel
            key={t.id}
            data-table={t.id}
            borderWidth={selected || hovered ? "2px" : "1px"}
            borderColor={hovered ? "teal.solid" : broken ? "red.solid" : selected ? "fg" : candidate ? "teal.muted" : "border.muted"}
            borderStyle={candidate && !selected && !hovered ? "dashed" : "solid"}
            overflow="hidden"
          >
            <chakra.button
              type="button"
              w="full"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap="2"
              px="3"
              py="2.5"
              bg={broken ? "red.subtle" : "bg.muted"}
              textAlign="start"
              onClick={() => activateTable(t.id)}
              aria-pressed={selected}
              aria-label={`${t.name}, ${filled} of ${t.seats} seats filled${broken ? ", a rule is broken" : ""}${activeGuestId ? ". Place the selected guest here" : ""}`}
              _focusVisible={{ outline: "2px solid", outlineColor: "teal.solid", outlineOffset: "-2px" }}
            >
              <Text fontWeight="bold">{t.name}</Text>
              <HStack gap="2">
                {broken ? (
                  <Badge colorPalette="red" variant="solid" gap="1">
                    <LuTriangleAlert aria-hidden /> Rule
                  </Badge>
                ) : null}
                <Badge colorPalette={filled === t.seats ? "green" : "gray"} variant="subtle">
                  {filled}/{t.seats}
                </Badge>
              </HStack>
            </chakra.button>
            <Box p="2">
              {row.map((gid, i) => {
                const g = gid ? guestById.get(gid) : undefined;
                const key = `${t.id}:${i}`;
                const pal = g ? (partyPalette[g.party] ?? "gray") : "gray";
                const flagged = !!gid && brokenGuests.has(gid);
                return (
                  <Flex
                    key={key}
                    data-seat={key}
                    role="button"
                    tabIndex={0}
                    aria-label={g ? `${t.name}, seat ${i + 1}: ${g.name}${g.diet ? `, ${g.diet}` : ""}` : `${t.name}, seat ${i + 1}: empty`}
                    aria-pressed={g ? selectedGuestId === gid : undefined}
                    align="center"
                    gap="2"
                    px="2"
                    py="1.5"
                    rounded="md"
                    fontSize="sm"
                    cursor={g ? "grab" : "pointer"}
                    userSelect="none"
                    borderWidth="1px"
                    borderColor={dropTarget === `seat:${key}` ? "teal.solid" : selectedGuestId === gid && gid ? "fg" : flagged ? "red.solid" : "transparent"}
                    style={{ touchAction: g ? "none" : "auto" }}
                    onPointerDown={g && gid ? (e) => beginPress(e, gid) : undefined}
                    onClick={() => {
                      if (consumeClick()) return;
                      activateSeat(t.id, i);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        activateSeat(t.id, i);
                      }
                    }}
                    _hover={{ bg: "bg.muted" }}
                    _focusVisible={{ outline: "2px solid", outlineColor: "teal.solid" }}
                  >
                    <Text as="span" w="5" textAlign="end" color="fg.muted" fontVariantNumeric="tabular-nums">
                      {i + 1}
                    </Text>
                    {g ? (
                      <>
                        <Box boxSize="2.5" rounded="full" bg={`${pal}.solid`} flexShrink={0} aria-hidden />
                        <Text as="span" flex="1" minW="0" fontWeight="medium" truncate>
                          {g.name}
                        </Text>
                        {g.rsvp !== "yes" ? (
                          <Badge size="xs" colorPalette="orange" variant="subtle">
                            {rsvpLabel[g.rsvp]}
                          </Badge>
                        ) : null}
                        {g.diet ? (
                          <Badge size="xs" colorPalette="yellow" variant="subtle">
                            {g.diet}
                          </Badge>
                        ) : null}
                      </>
                    ) : (
                      <Text as="span" color="fg.subtle" fontStyle="italic">
                        {activeGuestId ? "Empty: tap to place here" : "Empty seat"}
                      </Text>
                    )}
                  </Flex>
                );
              })}
            </Box>
          </Panel>
        );
      })}
    </SimpleGrid>
  );
}
```

```tsx components/plan-view.tsx
"use client";

import { useState } from "react";
import { Badge, Box, Button, Flex, Grid, Heading, HStack, SimpleGrid, Text } from "@chakra-ui/react";
import { LuCircleCheck, LuRotateCcw, LuTriangleAlert, LuUndo2 } from "react-icons/lu";
import { FloorPlan } from "@/components/floor-plan";
import { Panel, PanelHeader } from "@/components/panel";
import { usePlan } from "@/components/plan-provider";
import { RulesCard, SelectionCard, ToPlaceCard } from "@/components/plan-sidebar";
import { TableList } from "@/components/table-list";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { event, parties, partyPalette, tables } from "@/lib/data";

function Stat({ label, value, sub, tone }: { label: string; value: string | number; sub: string; tone?: "red" | "orange" | "green" }) {
  return (
    <Panel px="4" py="3">
      <Text fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="wider">
        {label}
      </Text>
      <Text fontSize="3xl" fontWeight="bold" lineHeight="1.1" color={tone ? `${tone}.fg` : "fg"} fontVariantNumeric="tabular-nums">
        {value}
      </Text>
      <Text fontSize="xs" color="fg.muted">
        {sub}
      </Text>
    </Panel>
  );
}

function StatusLine() {
  const { notice } = usePlan();
  const warn = notice?.tone === "warn";
  return (
    <Flex
      role="status"
      aria-live="polite"
      align="center"
      gap="2"
      px="4"
      py="2.5"
      rounded="lg"
      minH="10"
      fontSize="sm"
      bg={warn ? "orange.subtle" : "bg.panel"}
      color={warn ? "orange.fg" : "fg.muted"}
      borderWidth="1px"
      borderColor={warn ? "orange.muted" : "border.muted"}
    >
      {notice ? (
        <>
          <Box aria-hidden flexShrink={0}>
            {warn ? <LuTriangleAlert /> : <LuCircleCheck />}
          </Box>
          <Text>{notice.text}</Text>
        </>
      ) : (
        <Text>Tap a guest, then a table or seat. Or drag guests onto tables, and back to the list to unseat.</Text>
      )}
    </Flex>
  );
}

function Legend() {
  return (
    <Flex wrap="wrap" gap={{ base: "2", md: "3" }} px="4" py="2.5" borderTopWidth="1px" borderColor="border.muted" fontSize="xs" color="fg.muted">
      {parties.map((p) => (
        <HStack key={p} gap="1.5">
          <Box boxSize="2.5" rounded="full" bg={`${partyPalette[p]}.solid`} aria-hidden />
          <Text as="span">{p}</Text>
        </HStack>
      ))}
      <HStack gap="1.5">
        <Box boxSize="2.5" rounded="full" bg="yellow.solid" aria-hidden />
        <Text as="span">Dietary need</Text>
      </HStack>
      <HStack gap="1.5">
        <Box boxSize="2.5" rounded="full" borderWidth="2px" borderColor="red.solid" aria-hidden />
        <Text as="span">Rule broken</Text>
      </HStack>
      <HStack gap="1.5">
        <Box boxSize="2.5" rounded="full" borderWidth="1.5px" borderStyle="dashed" borderColor="border.emphasized" aria-hidden />
        <Text as="span">Empty seat</Text>
      </HStack>
    </Flex>
  );
}

export function PlanView() {
  const { seating, seatedCount, attendingCount, toPlace, results, undo, reset, canUndo } = usePlan();
  const [view, setView] = useState<"plan" | "tables">("plan");
  const totalSeats = tables.reduce((n, t) => n + t.seats, 0);
  const brokenCount = results.filter((r) => r.status === "broken").length;
  const attendingSeated = attendingCount - toPlace.length;

  return (
    <Box maxW="1600px" mx="auto" px={{ base: "4", md: "6" }} py={{ base: "4", md: "6" }}>
      <Flex justify="space-between" align={{ base: "flex-start", sm: "center" }} direction={{ base: "column", sm: "row" }} gap="3" mb="4">
        <Box>
          <Heading as="h1" size={{ base: "xl", md: "2xl" }} letterSpacing="tight">
            Seating plan
          </Heading>
          <Text color="fg.muted" fontSize="sm">
            {event.name} at {event.venue}
          </Text>
        </Box>
        <HStack gap="2">
          <Button size="sm" variant="outline" onClick={undo} disabled={!canUndo}>
            <LuUndo2 /> Undo
          </Button>
          <Button size="sm" variant="ghost" onClick={reset}>
            <LuRotateCcw /> Reset
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 2, md: 4 }} gap="3" mb="3">
        <Stat label="Seated" value={seatedCount} sub={`${attendingSeated} of ${attendingCount} attending guests`} />
        <Stat label="Without a seat" value={toPlace.length} sub="attending, still to place" tone={toPlace.length ? "orange" : "green"} />
        <Stat label="Free seats" value={totalSeats - Object.keys(seating).length} sub={`of ${totalSeats} across ${tables.length} tables`} />
        <Stat label="Rules broken" value={brokenCount} sub={`of ${results.length} rules from the couple`} tone={brokenCount ? "red" : "green"} />
      </SimpleGrid>

      <Box mb="4">
        <StatusLine />
      </Box>

      <Grid
        gap="4"
        templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 390px" }}
        templateRows={{ lg: "auto auto auto 1fr" }}
        templateAreas={{
          base: `"sel" "place" "plan" "rules"`,
          lg: `"plan sel" "plan place" "plan rules" "plan ."`,
        }}
      >
        <Box gridArea="sel" alignSelf="start">
          <SelectionCard />
        </Box>
        <Box gridArea="place" alignSelf="start">
          <ToPlaceCard />
        </Box>
        <Panel as="section" aria-labelledby="plan-h" gridArea="plan" alignSelf="start" overflow="hidden">
          <PanelHeader title="Room" id="plan-h">
            <HStack gap="3">
              <Text fontSize="xs" color="fg.muted" display={{ base: "none", sm: "block" }}>
                {event.room_m.width} x {event.room_m.depth} m, to scale
              </Text>
              <Box display={{ base: "block", lg: "none" }}>
                <SegmentedControl
                  size="sm"
                  value={view}
                  onValueChange={(d) => setView(d.value === "tables" ? "tables" : "plan")}
                  items={[
                    { value: "plan", label: "Floor plan" },
                    { value: "tables", label: "Table list" },
                  ]}
                />
              </Box>
            </HStack>
          </PanelHeader>
          <Box display={{ base: view === "plan" ? "block" : "none", lg: "block" }} p="2">
            <FloorPlan />
            <Text fontSize="xs" color="fg.muted" px="2" pb="1" display={{ base: "block", lg: "none" }}>
              Scroll sideways to see the whole room, or switch to the table list.
            </Text>
          </Box>
          <Box display={{ base: view === "tables" ? "block" : "none", lg: "none" }}>
            <TableList />
          </Box>
          <Legend />
        </Panel>
        <Box gridArea="rules" alignSelf="start">
          <RulesCard />
        </Box>
      </Grid>
    </Box>
  );
}
```

```tsx components/guests-view.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  chakra,
  Flex,
  Grid,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import { LuCheck, LuCopy, LuSearch, LuX } from "react-icons/lu";
import { Panel, PanelHeader } from "@/components/panel";
import { usePlan } from "@/components/plan-provider";
import { InputGroup } from "@/components/ui/input-group";
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select";
import { event, guests, parties, partyPalette, rsvpLabel, rsvpPalette, type Guest, type Rsvp } from "@/lib/data";
import { dietList, mealKey, tableById, formatDate } from "@/lib/plan";

type SortKey = "name" | "party" | "rsvp" | "table";

const RSVP_ORDER: Rsvp[] = ["yes", "maybe", "pending", "no"];

function Labeled({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <Stack gap="1" minW="0">
      <chakra.label htmlFor={id} fontSize="xs" fontWeight="semibold" color="fg.muted">
        {label}
      </chakra.label>
      {children}
    </Stack>
  );
}

function RsvpBadge({ rsvp }: { rsvp: Rsvp }) {
  return (
    <Badge colorPalette={rsvpPalette[rsvp]} variant="subtle">
      {rsvpLabel[rsvp]}
    </Badge>
  );
}

export function GuestsView() {
  const { seating } = usePlan();
  const [q, setQ] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState("all");
  const [diet, setDiet] = useState("all");
  const [seat, setSeat] = useState("all");
  const [sort, setSort] = useState<SortKey>("name");
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");

  const tableLabel = (g: Guest) => {
    const s = seating[g.id];
    return s ? `${tableById.get(s.table)?.name ?? s.table}` : null;
  };

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = guests.filter((g) => {
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === "none" && g.diet) return false;
      if (diet !== "all" && diet !== "none" && g.diet !== diet) return false;
      const s = seating[g.id];
      if (seat === "seated" && !s) return false;
      if (seat === "unseated" && s) return false;
      if (needle) {
        const hay = `${g.name} ${g.party} ${g.diet ?? ""} ${s ? (tableById.get(s.table)?.name ?? "") : "not seated"}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    const cmp: Record<SortKey, (a: Guest, b: Guest) => number> = {
      name: (a, b) => a.name.localeCompare(b.name),
      party: (a, b) => parties.indexOf(a.party) - parties.indexOf(b.party) || a.name.localeCompare(b.name),
      rsvp: (a, b) => RSVP_ORDER.indexOf(a.rsvp) - RSVP_ORDER.indexOf(b.rsvp) || a.name.localeCompare(b.name),
      table: (a, b) => {
        const ta = seating[a.id];
        const tb = seating[b.id];
        const na = ta ? (tableById.get(ta.table)?.name ?? "") : "~";
        const nb = tb ? (tableById.get(tb.table)?.name ?? "") : "~";
        return na.localeCompare(nb) || a.name.localeCompare(b.name);
      },
    };
    return [...list].sort(cmp[sort]);
  }, [q, party, rsvp, diet, seat, sort, seating]);

  const filtered = q !== "" || party !== "all" || rsvp !== "all" || diet !== "all" || seat !== "all";
  const clear = () => {
    setQ("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
    setSeat("all");
  };

  const rsvpCounts = RSVP_ORDER.map((r) => ({ r, n: guests.filter((g) => g.rsvp === r).length }));

  // Meal counts for the caterer
  const meals = useMemo(() => {
    const keys = ["Standard menu", ...dietList];
    return keys.map((k) => {
      const confirmed = guests.filter((g) => g.rsvp === "yes" && mealKey(g) === k);
      const possible = guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && mealKey(g) === k);
      const where = new Map<string, number>();
      for (const g of confirmed) {
        const s = seating[g.id];
        const name = s ? (tableById.get(s.table)?.name ?? s.table) : "Not seated";
        where.set(name, (where.get(name) ?? 0) + 1);
      }
      return { key: k, confirmed: confirmed.length, possible: possible.length, where: Array.from(where.entries()) };
    });
  }, [seating]);
  const totalConfirmed = meals.reduce((n, m) => n + m.confirmed, 0);
  const totalPossible = meals.reduce((n, m) => n + m.possible, 0);

  const copySummary = async () => {
    const lines = [
      `${event.name} - ${formatDate(event.date)}, ${event.venue}`,
      `Meal counts for the caterer (confirmed guests)`,
      ...meals.map((m) => `${m.key}: ${m.confirmed}${m.possible ? ` (+${m.possible} not yet confirmed)` : ""}`),
      `Total confirmed: ${totalConfirmed}${totalPossible ? ` (+${totalPossible} not yet confirmed)` : ""}`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied("done");
    } catch {
      setCopied("failed");
    }
    window.setTimeout(() => setCopied("idle"), 2500);
  };

  return (
    <Box maxW="1600px" mx="auto" px={{ base: "4", md: "6" }} py={{ base: "4", md: "6" }}>
      <Box mb="4">
        <Heading as="h1" size={{ base: "xl", md: "2xl" }} letterSpacing="tight">
          Guest list
        </Heading>
        <Text color="fg.muted" fontSize="sm">
          {guests.length} invited to {event.name}
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 2, md: 4 }} gap="3" mb="4">
        {rsvpCounts.map(({ r, n }) => {
          const on = rsvp === r;
          return (
            <chakra.button
              key={r}
              type="button"
              textAlign="start"
              aria-pressed={on}
              onClick={() => setRsvp(on ? "all" : r)}
              bg="bg.panel"
              borderWidth={on ? "2px" : "1px"}
              borderColor={on ? "fg" : "border.muted"}
              rounded="xl"
              px="4"
              py="3"
              shadow="xs"
              _hover={{ borderColor: "border.emphasized" }}
              _focusVisible={{ outline: "2px solid", outlineColor: "teal.solid", outlineOffset: "2px" }}
            >
              <Text fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="wider">
                {rsvpLabel[r]}
              </Text>
              <Text fontSize="3xl" fontWeight="bold" lineHeight="1.1" color={`${rsvpPalette[r]}.fg`} fontVariantNumeric="tabular-nums">
                {n}
              </Text>
            </chakra.button>
          );
        })}
      </SimpleGrid>

      <Grid gap="4" templateColumns={{ base: "minmax(0, 1fr)", xl: "minmax(0, 1fr) 420px" }} alignItems="start">
        <Panel as="section" aria-labelledby="list-h" overflow="hidden">
          <PanelHeader title="Guests" id="list-h">
            <Text fontSize="sm" color="fg.muted" aria-live="polite">
              Showing {rows.length} of {guests.length}
            </Text>
          </PanelHeader>
          <Stack gap="3" p="4" borderBottomWidth="1px" borderColor="border.muted" role="search" aria-label="Filter guests">
            <InputGroup startElement={<LuSearch aria-hidden />}>
              <Input
                type="search"
                aria-label="Search guests by name, party, diet or table"
                placeholder="Search name, party, diet or table"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </InputGroup>
            <SimpleGrid columns={{ base: 2, md: 3, xl: 5 }} gap="3">
              <Labeled id="f-party" label="Party">
                <NativeSelectRoot size="sm">
                  <NativeSelectField id="f-party" value={party} onChange={(e) => setParty(e.target.value)} items={[{ value: "all", label: "All parties" }, ...parties]} />
                </NativeSelectRoot>
              </Labeled>
              <Labeled id="f-rsvp" label="RSVP">
                <NativeSelectRoot size="sm">
                  <NativeSelectField
                    id="f-rsvp"
                    value={rsvp}
                    onChange={(e) => setRsvp(e.target.value)}
                    items={[{ value: "all", label: "Any reply" }, ...RSVP_ORDER.map((r) => ({ value: r, label: rsvpLabel[r] }))]}
                  />
                </NativeSelectRoot>
              </Labeled>
              <Labeled id="f-diet" label="Diet">
                <NativeSelectRoot size="sm">
                  <NativeSelectField
                    id="f-diet"
                    value={diet}
                    onChange={(e) => setDiet(e.target.value)}
                    items={[{ value: "all", label: "Any diet" }, { value: "none", label: "No dietary need" }, ...dietList]}
                  />
                </NativeSelectRoot>
              </Labeled>
              <Labeled id="f-seat" label="Seating">
                <NativeSelectRoot size="sm">
                  <NativeSelectField
                    id="f-seat"
                    value={seat}
                    onChange={(e) => setSeat(e.target.value)}
                    items={[
                      { value: "all", label: "Seated or not" },
                      { value: "seated", label: "Seated" },
                      { value: "unseated", label: "Not seated" },
                    ]}
                  />
                </NativeSelectRoot>
              </Labeled>
              <Labeled id="f-sort" label="Sort by">
                <NativeSelectRoot size="sm">
                  <NativeSelectField
                    id="f-sort"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    items={[
                      { value: "name", label: "Name" },
                      { value: "party", label: "Party" },
                      { value: "rsvp", label: "RSVP" },
                      { value: "table", label: "Table" },
                    ]}
                  />
                </NativeSelectRoot>
              </Labeled>
            </SimpleGrid>
            {filtered ? (
              <Box>
                <Button size="xs" variant="subtle" onClick={clear}>
                  <LuX /> Clear filters
                </Button>
              </Box>
            ) : null}
          </Stack>

          {rows.length === 0 ? (
            <Stack align="center" gap="1" py="12" px="4" textAlign="center">
              <Text fontWeight="semibold">No guests match</Text>
              <Text fontSize="sm" color="fg.muted">
                Try a different search or clear the filters.
              </Text>
            </Stack>
          ) : (
            <>
              <Box display={{ base: "none", md: "block" }}>
                <Table.ScrollArea>
                  <Table.Root size="md" variant="line" interactive>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader pl="4">Guest</Table.ColumnHeader>
                        <Table.ColumnHeader>Party</Table.ColumnHeader>
                        <Table.ColumnHeader>RSVP</Table.ColumnHeader>
                        <Table.ColumnHeader>Diet</Table.ColumnHeader>
                        <Table.ColumnHeader pr="4">Table</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {rows.map((g) => {
                        const s = seating[g.id];
                        const pal = partyPalette[g.party] ?? "gray";
                        return (
                          <Table.Row key={g.id}>
                            <Table.Cell pl="4" fontWeight="medium">
                              {g.name}
                            </Table.Cell>
                            <Table.Cell>
                              <HStack gap="2">
                                <Box boxSize="2.5" rounded="full" bg={`${pal}.solid`} aria-hidden />
                                <Text as="span">{g.party}</Text>
                              </HStack>
                            </Table.Cell>
                            <Table.Cell>
                              <RsvpBadge rsvp={g.rsvp} />
                            </Table.Cell>
                            <Table.Cell>
                              {g.diet ? (
                                <Badge colorPalette="yellow" variant="subtle">
                                  {g.diet}
                                </Badge>
                              ) : (
                                <Text as="span" color="fg.subtle">
                                  None
                                </Text>
                              )}
                            </Table.Cell>
                            <Table.Cell pr="4">
                              {s ? (
                                <Text as="span">
                                  {tableById.get(s.table)?.name}{" "}
                                  <Text as="span" color="fg.muted">
                                    seat {s.seat + 1}
                                  </Text>
                                </Text>
                              ) : g.rsvp === "no" ? (
                                <Text as="span" color="fg.subtle">
                                  Not needed
                                </Text>
                              ) : (
                                <Badge colorPalette="orange" variant="subtle">
                                  Not seated
                                </Badge>
                              )}
                            </Table.Cell>
                          </Table.Row>
                        );
                      })}
                    </Table.Body>
                  </Table.Root>
                </Table.ScrollArea>
              </Box>

              <Stack as="ul" listStyleType="none" gap="0" display={{ base: "flex", md: "none" }} m="0" p="0">
                {rows.map((g) => {
                  const s = seating[g.id];
                  const pal = partyPalette[g.party] ?? "gray";
                  return (
                    <chakra.li key={g.id} px="4" py="3" borderTopWidth="1px" borderColor="border.muted">
                      <Flex justify="space-between" align="flex-start" gap="3">
                        <Box minW="0">
                          <Text fontWeight="semibold">{g.name}</Text>
                          <HStack gap="2" color="fg.muted" fontSize="sm">
                            <Box boxSize="2.5" rounded="full" bg={`${pal}.solid`} aria-hidden />
                            <Text as="span">{g.party}</Text>
                          </HStack>
                        </Box>
                        <Text as="span" fontSize="sm" fontWeight="medium" textAlign="end" flexShrink={0}>
                          {s ? `${tableById.get(s.table)?.name}, seat ${s.seat + 1}` : g.rsvp === "no" ? "Not needed" : "Not seated"}
                        </Text>
                      </Flex>
                      <HStack gap="1.5" mt="2" wrap="wrap">
                        <RsvpBadge rsvp={g.rsvp} />
                        {g.diet ? (
                          <Badge colorPalette="yellow" variant="subtle">
                            {g.diet}
                          </Badge>
                        ) : null}
                      </HStack>
                    </chakra.li>
                  );
                })}
              </Stack>
            </>
          )}
        </Panel>

        <Panel as="section" aria-labelledby="meals-h" overflow="hidden">
          <PanelHeader title="Meals for the caterer" id="meals-h">
            <Button size="xs" variant="outline" onClick={copySummary}>
              {copied === "done" ? <LuCheck /> : <LuCopy />}
              {copied === "done" ? "Copied" : copied === "failed" ? "Copy failed" : "Copy counts"}
            </Button>
          </PanelHeader>
          <Text fontSize="xs" color="fg.muted" px="4" pt="3">
            Confirmed guests only. Guests who have not replied or said maybe are counted separately.
          </Text>
          <Table.ScrollArea>
            <Table.Root size="sm" variant="line">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader pl="4">Meal</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">Confirmed</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end" pr="4">
                    Maybe
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {meals.map((m) => (
                  <Table.Row key={m.key}>
                    <Table.Cell pl="4" verticalAlign="top">
                      <Text fontWeight="medium">{m.key}</Text>
                      <Text fontSize="xs" color="fg.muted">
                        {m.where.length ? m.where.map(([name, n]) => `${name} ${n}`).join(", ") : "No one yet"}
                      </Text>
                    </Table.Cell>
                    <Table.Cell textAlign="end" fontWeight="bold" fontVariantNumeric="tabular-nums" verticalAlign="top">
                      {m.confirmed}
                    </Table.Cell>
                    <Table.Cell textAlign="end" pr="4" color="fg.muted" fontVariantNumeric="tabular-nums" verticalAlign="top">
                      {m.possible || "-"}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
              <Table.Footer>
                <Table.Row>
                  <Table.Cell pl="4" fontWeight="bold">
                    Total
                  </Table.Cell>
                  <Table.Cell textAlign="end" fontWeight="bold" fontVariantNumeric="tabular-nums">
                    {totalConfirmed}
                  </Table.Cell>
                  <Table.Cell textAlign="end" pr="4" color="fg.muted" fontVariantNumeric="tabular-nums">
                    {totalPossible || "-"}
                  </Table.Cell>
                </Table.Row>
              </Table.Footer>
            </Table.Root>
          </Table.ScrollArea>
          <Text fontSize="xs" color="fg.muted" px="4" py="3" role="status" aria-live="polite">
            {copied === "done" ? "Counts copied to the clipboard." : copied === "failed" ? "The clipboard was not available." : `${guests.filter((g) => g.rsvp === "no").length} declined are not counted.`}
          </Text>
        </Panel>
      </Grid>
    </Box>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { PlanView } from "@/components/plan-view";

export const metadata: Metadata = { title: "Plan" };

export default function Page() {
  return <PlanView />;
}
```

```tsx app/guests/page.tsx
import type { Metadata } from "next";
import { GuestsView } from "@/components/guests-view";

export const metadata: Metadata = { title: "Guests" };

export default function Page() {
  return <GuestsView />;
}
```

```tsx app/layout.tsx
import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/app-shell";
import { PlanProvider } from "@/components/plan-provider";
import { EmotionRegistry } from "@/components/ui/emotion-registry";
import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: { default: "Seatwise", template: "%s | Seatwise" },
  description: "Seatwise, a seating planner for wedding and event planners.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <EmotionRegistry>
          <Provider>
            <PlanProvider>
              <AppShell>{children}</AppShell>
            </PlanProvider>
            <Toaster />
          </Provider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
```
