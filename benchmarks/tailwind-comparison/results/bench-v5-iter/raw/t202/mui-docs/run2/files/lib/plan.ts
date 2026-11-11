import { fixtures, guests, rules, tables } from "./data";
import type { Guest, Rule, Rsvp, TableDef } from "./data";

export interface SeatRef {
  table: string;
  seat: number;
}
export type Assign = Record<string, SeatRef | null>;

export const guestById: Record<string, Guest> = Object.fromEntries(guests.map((g) => [g.id, g]));
export const tableById: Record<string, TableDef> = Object.fromEntries(tables.map((t) => [t.id, t]));

export const totalSeats = tables.reduce((n, t) => n + t.seats, 0);

/* ---------- names ---------- */

export function firstName(name: string): string {
  return name.split(" ")[0] ?? name;
}

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (a + b).toUpperCase();
}

/* ---------- parties ---------- */

export const parties: string[] = Array.from(new Set(guests.map((g) => g.party)));

// Each party takes a theme colour (CSS variables follow the light/dark scheme) and its readable text colour.
const MIXED_FG = "var(--mui-palette-primary-contrastText)";
const PARTY_TOKENS: { bg: string; fg: string }[] = [
  { bg: "var(--mui-palette-secondary-main)", fg: "var(--mui-palette-secondary-contrastText)" },
  { bg: "var(--mui-palette-primary-main)", fg: "var(--mui-palette-primary-contrastText)" },
  { bg: "var(--mui-palette-info-main)", fg: "var(--mui-palette-info-contrastText)" },
  {
    bg: "color-mix(in srgb, var(--mui-palette-info-main) 50%, var(--mui-palette-error-main))",
    fg: MIXED_FG,
  },
  { bg: "var(--mui-palette-warning-main)", fg: "var(--mui-palette-warning-contrastText)" },
  { bg: "var(--mui-palette-grey-600)", fg: "var(--mui-palette-common-white)" },
  {
    bg: "color-mix(in srgb, var(--mui-palette-primary-main) 50%, var(--mui-palette-secondary-main))",
    fg: MIXED_FG,
  },
];

function partyToken(party: string) {
  const i = parties.indexOf(party);
  return PARTY_TOKENS[(i < 0 ? 0 : i) % PARTY_TOKENS.length]!;
}

export function partyColor(party: string): string {
  return partyToken(party).bg;
}

export function partyText(party: string): string {
  return partyToken(party).fg;
}

/* ---------- RSVP and meals ---------- */

export const rsvpLabel: Record<Rsvp, string> = {
  yes: "Yes",
  maybe: "Maybe",
  pending: "Pending",
  no: "No",
};

export const STANDARD_MEAL = "Standard menu";

export const meals: string[] = [
  STANDARD_MEAL,
  ...Array.from(new Set(guests.map((g) => g.diet).filter((d): d is string => d !== null))).sort(),
];

export function mealOf(g: Guest): string {
  return g.diet ?? STANDARD_MEAL;
}

/* ---------- seating state ---------- */

export function initialAssign(): Assign {
  const next: Assign = {};
  const used: Record<string, number> = {};
  for (const g of guests) {
    if (g.table && tableById[g.table]) {
      const i = used[g.table] ?? 0;
      used[g.table] = i + 1;
      next[g.id] = { table: g.table, seat: i };
    } else {
      next[g.id] = null;
    }
  }
  return next;
}

export function seatsByTable(assign: Assign): Record<string, (string | null)[]> {
  const out: Record<string, (string | null)[]> = {};
  for (const t of tables) out[t.id] = Array.from({ length: t.seats }, () => null);
  for (const [gid, ref] of Object.entries(assign)) {
    if (ref) {
      const arr = out[ref.table];
      if (arr) arr[ref.seat] = gid;
    }
  }
  return out;
}

export function firstFreeSeat(seats: (string | null)[], ignore?: string): number {
  return seats.findIndex((s) => s === null || s === ignore);
}

/* ---------- geometry (metres) ---------- */

export const SEAT_D = 0.8;
export const RING_R = 1.35;
export const BODY_R = 0.85;
export const ROUND_R = RING_R + SEAT_D / 2;
export const LONG_DEPTH = 1;

export interface TableLayout {
  /** container box, metres */
  left: number;
  top: number;
  width: number;
  height: number;
  /** table body relative to container */
  body: { x: number; y: number; w: number; h: number };
  /** seat centres relative to container */
  seats: { x: number; y: number }[];
  /** centre in room coordinates */
  cx: number;
  cy: number;
}

export function tableLayout(t: TableDef): TableLayout {
  if (t.shape === "round") {
    const size = ROUND_R * 2;
    const seats = Array.from({ length: t.seats }, (_, i) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / t.seats;
      return { x: ROUND_R + RING_R * Math.cos(a), y: ROUND_R + RING_R * Math.sin(a) };
    });
    return {
      left: t.x - ROUND_R,
      top: t.y - ROUND_R,
      width: size,
      height: size,
      body: { x: ROUND_R - BODY_R, y: ROUND_R - BODY_R, w: BODY_R * 2, h: BODY_R * 2 },
      seats,
      cx: t.x,
      cy: t.y,
    };
  }
  const length = t.seats;
  const height = LONG_DEPTH + 0.1 + SEAT_D;
  return {
    left: t.x,
    top: t.y,
    width: length,
    height,
    body: { x: 0, y: 0, w: length, h: LONG_DEPTH },
    seats: Array.from({ length: t.seats }, (_, i) => ({ x: i + 0.5, y: LONG_DEPTH + 0.1 + SEAT_D / 2 })),
    cx: t.x + length / 2,
    cy: t.y + height / 2,
  };
}

const layouts: Record<string, TableLayout> = Object.fromEntries(tables.map((t) => [t.id, tableLayout(t)]));

export function layoutOf(tableId: string): TableLayout {
  return layouts[tableId]!;
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

const doors = fixtures.find((f) => f.kind === "door");
const stage = fixtures.find((f) => f.kind === "stage");
const doorPoint = doors ? { x: doors.x + doors.w / 2, y: doors.y + doors.h / 2 } : { x: 0, y: 7 };
const bandPoint = stage ? { x: stage.x + stage.w / 2, y: stage.y + stage.h / 2 } : { x: 12, y: 1.5 };

export const NEAR_DOOR_M = 4;
export const AWAY_BAND_M = 6;

export function distanceToDoors(tableId: string): number {
  const l = layoutOf(tableId);
  return distance({ x: l.cx, y: l.cy }, doorPoint);
}
export function distanceToBand(tableId: string): number {
  const l = layoutOf(tableId);
  return distance({ x: l.cx, y: l.cy }, bandPoint);
}

/* ---------- rules ---------- */

export type RuleStatus = "ok" | "broken" | "waiting";

export interface RuleResult {
  rule: Rule;
  status: RuleStatus;
  title: string;
  detail: string;
  tables: string[];
  guestIds: string[];
}

function tableName(id: string): string {
  return tableById[id]?.name ?? id;
}

export function evaluateRules(assign: Assign): RuleResult[] {
  return rules.map((rule): RuleResult => {
    const names = rule.guests.map((id) => guestById[id]?.name ?? id);
    const refs = rule.guests.map((id) => assign[id] ?? null);

    if (rule.kind === "near") {
      const title = `${names[0]} near the garden doors, away from the band`;
      const ref = refs[0];
      if (!ref) {
        return { rule, status: "waiting", title, detail: `${names[0]} has no seat yet.`, tables: [], guestIds: [] };
      }
      const dd = distanceToDoors(ref.table);
      const db = distanceToBand(ref.table);
      const good = dd <= NEAR_DOOR_M && db >= AWAY_BAND_M;
      const closest = [...tables].sort((a, b) => distanceToDoors(a.id) - distanceToDoors(b.id))[0];
      return good
        ? {
            rule,
            status: "ok",
            title,
            detail: `${tableName(ref.table)} is ${dd.toFixed(1)} m from the doors and ${db.toFixed(1)} m from the band.`,
            tables: [ref.table],
            guestIds: [],
          }
        : {
            rule,
            status: "broken",
            title,
            detail: `${tableName(ref.table)} is ${dd.toFixed(1)} m from the doors. ${closest ? `${closest.name} is closest (${distanceToDoors(closest.id).toFixed(1)} m).` : ""}`,
            tables: [ref.table],
            guestIds: [rule.guests[0]!],
          };
    }

    const [a, b] = refs;
    const [na, nb] = names;
    if (rule.kind === "together") {
      const title = `${na} and ${nb} together`;
      if (!a || !b) {
        const missing = [!a ? na : null, !b ? nb : null].filter(Boolean).join(" and ");
        return { rule, status: "waiting", title, detail: `${missing} still to be seated.`, tables: [], guestIds: [] };
      }
      if (a.table === b.table) {
        return { rule, status: "ok", title, detail: `Both at ${tableName(a.table)}.`, tables: [a.table], guestIds: [] };
      }
      return {
        rule,
        status: "broken",
        title,
        detail: `${na} is at ${tableName(a.table)}, ${nb} at ${tableName(b.table)}.`,
        tables: [a.table, b.table],
        guestIds: [...rule.guests],
      };
    }

    const title = `${na} and ${nb} apart`;
    if (!a || !b) {
      return { rule, status: "waiting", title, detail: "Checked once both have a seat.", tables: [], guestIds: [] };
    }
    if (a.table === b.table) {
      return {
        rule,
        status: "broken",
        title,
        detail: `Both are at ${tableName(a.table)}.`,
        tables: [a.table],
        guestIds: [...rule.guests],
      };
    }
    return {
      rule,
      status: "ok",
      title,
      detail: `${tableName(a.table)} and ${tableName(b.table)}.`,
      tables: [a.table, b.table],
      guestIds: [],
    };
  });
}

/* ---------- counts ---------- */

export interface Stats {
  attending: number;
  seatedAttending: number;
  seatedOther: number;
  seatedAll: number;
  unseated: number;
  emptySeats: number;
}

export function computeStats(assign: Assign): Stats {
  const attending = guests.filter((g) => g.rsvp === "yes");
  const seatedAttending = attending.filter((g) => assign[g.id]).length;
  const seatedAll = guests.filter((g) => assign[g.id]).length;
  return {
    attending: attending.length,
    seatedAttending,
    seatedOther: seatedAll - seatedAttending,
    seatedAll,
    unseated: attending.length - seatedAttending,
    emptySeats: totalSeats - seatedAll,
  };
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
