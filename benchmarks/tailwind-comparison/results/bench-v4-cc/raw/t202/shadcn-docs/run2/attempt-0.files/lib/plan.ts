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
