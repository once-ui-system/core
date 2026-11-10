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
