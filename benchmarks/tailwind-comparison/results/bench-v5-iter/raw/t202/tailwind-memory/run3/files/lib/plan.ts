import { FIXTURES, GUESTS, RULES, TABLES, type Guest, type Rule, type Table } from "./data";

/** For every table, one slot per seat holding a guest id or null. */
export type Seats = Record<string, (string | null)[]>;

export interface Placement {
  tableId: string;
  seat: number;
}

export const guestById: Record<string, Guest> = Object.fromEntries(GUESTS.map((g) => [g.id, g]));
export const tableById: Record<string, Table> = Object.fromEntries(TABLES.map((t) => [t.id, t]));

export function initialSeats(): Seats {
  const seats: Seats = {};
  for (const t of TABLES) seats[t.id] = Array.from({ length: t.seats }, () => null as string | null);
  for (const g of GUESTS) {
    if (!g.table) continue;
    const row = seats[g.table];
    const free = row ? row.indexOf(null) : -1;
    if (row && free >= 0) row[free] = g.id;
  }
  return seats;
}

export function cloneSeats(seats: Seats): Seats {
  const next: Seats = {};
  for (const key of Object.keys(seats)) next[key] = [...seats[key]];
  return next;
}

export function placementsOf(seats: Seats): Record<string, Placement> {
  const map: Record<string, Placement> = {};
  for (const tableId of Object.keys(seats)) {
    seats[tableId].forEach((gid, seat) => {
      if (gid) map[gid] = { tableId, seat };
    });
  }
  return map;
}

/* ------------------------------ geometry (metres) ------------------------------ */

export const SEAT_D = 0.82;
export const RING_R = 1.5;
export const ROUND_D = 1.7;
export const LONG_H = 1;

export interface SeatPos {
  x: number;
  y: number;
  /** direction pointing away from the table, radians */
  angle: number;
}

/** Round tables: x, y is the centre. Long tables: x, y is the top-left corner, seats on the room side. */
export function tableSize(t: Table): { w: number; h: number } {
  return t.shape === "round" ? { w: ROUND_D, h: ROUND_D } : { w: t.seats, h: LONG_H };
}

export function tableCenter(t: Table): { x: number; y: number } {
  return t.shape === "round" ? { x: t.x, y: t.y } : { x: t.x + t.seats / 2, y: t.y + LONG_H / 2 };
}

export function seatPositions(t: Table): SeatPos[] {
  if (t.shape === "round") {
    return Array.from({ length: t.seats }, (_, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / t.seats;
      return { x: t.x + Math.cos(angle) * RING_R, y: t.y + Math.sin(angle) * RING_R, angle };
    });
  }
  return Array.from({ length: t.seats }, (_, i) => ({
    x: t.x + i + 0.5,
    y: t.y - SEAT_D / 2 - 0.1,
    angle: -Math.PI / 2,
  }));
}

/* ---------------------------------- people ---------------------------------- */

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function firstName(name: string): string {
  const parts = name.split(/\s+/);
  // "Avó Rosa Carvalho" is known by "Avó Rosa"
  return parts[0] === "Avó" && parts[1] ? `${parts[0]} ${parts[1]}` : parts[0];
}

const PARTY_COLORS: Record<string, string> = {
  Couple: "oklch(0.44 0.15 15)",
  "Bride's family": "oklch(0.47 0.14 340)",
  "Groom's family": "oklch(0.46 0.12 255)",
  "University friends": "oklch(0.46 0.1 160)",
  "Work friends": "oklch(0.45 0.1 70)",
  "Groom's football club": "oklch(0.46 0.15 300)",
  "Plus-ones": "oklch(0.42 0.03 250)",
};

export function partyColor(party: string): string {
  return PARTY_COLORS[party] ?? "oklch(0.42 0.03 250)";
}

/* ----------------------------------- rules ----------------------------------- */

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

/** Seat-near rule for one guest: within this distance of the garden doors... */
export const NEAR_DOOR_M = 4;
/** ...and at least this far from the band. */
export const FAR_BAND_M = 8;
/** Seat-near rule between guests: table centres no further apart than this. */
export const NEAR_GUESTS_M = 6;

const door = FIXTURES.find((f) => f.kind === "door");
const stage = FIXTURES.find((f) => f.kind === "stage");

function fixtureCenter(f: { x: number; y: number; w: number; h: number } | undefined) {
  return f ? { x: f.x + f.w / 2, y: f.y + f.h / 2 } : null;
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

const m1 = (n: number) => `${n.toFixed(1)} m`;

export function evaluateRules(seats: Seats): RuleResult[] {
  const where = placementsOf(seats);
  const doorC = fixtureCenter(door);
  const stageC = fixtureCenter(stage);

  return RULES.map((rule, index): RuleResult => {
    const guests = rule.guests.map((id) => guestById[id]).filter((g): g is Guest => Boolean(g));
    const names = guests.map((g) => g.name);
    const placed = guests.map((g) => ({ g, p: where[g.id] }));
    const unseated = placed.filter((x) => !x.p).map((x) => x.g.name);
    const tableIds = Array.from(new Set(placed.flatMap((x) => (x.p ? [x.p.tableId] : []))));
    const tName = (id: string) => tableById[id]?.name ?? id;
    const base = { id: `rule-${index}`, rule, tableIds, guestIds: guests.map((g) => g.id) };

    if (rule.kind === "together") {
      const title = `${names.join(" & ")} together`;
      if (unseated.length > 0) {
        return { ...base, title, status: "open", detail: `${unseated.join(" and ")} not seated yet.`, tableIds };
      }
      if (tableIds.length > 1) {
        const where2 = placed.map((x) => `${x.g.name} at ${tName(x.p!.tableId)}`).join(", ");
        return { ...base, title, status: "broken", detail: `Split up: ${where2}.` };
      }
      return { ...base, title, status: "ok", detail: `Together at ${tName(tableIds[0])}.` };
    }

    if (rule.kind === "apart") {
      const title = `${names.join(" & ")} apart`;
      const seatedAll = placed.filter((x) => x.p);
      const clash = tableIds.find((tid) => seatedAll.filter((x) => x.p!.tableId === tid).length > 1);
      if (clash) {
        return { ...base, title, status: "broken", detail: `Both at ${tName(clash)}.`, tableIds: [clash] };
      }
      const detail =
        unseated.length > 0
          ? "No clash so far."
          : `At ${tableIds.map(tName).join(" and ")}.`;
      return { ...base, title, status: "ok", detail };
    }

    // near
    if (guests.length === 1) {
      const g = guests[0];
      const title = `${g.name} near the garden doors`;
      const p = where[g.id];
      if (!p) return { ...base, title, status: "open", detail: "Not seated yet." };
      const t = tableById[p.tableId];
      const c = tableCenter(t);
      const toDoor = doorC ? dist(c, doorC) : 0;
      const toBand = stageC ? dist(c, stageC) : Infinity;
      if (toDoor > NEAR_DOOR_M) {
        return {
          ...base,
          title,
          status: "broken",
          detail: `${t.name} is ${m1(toDoor)} from the garden doors (keep within ${NEAR_DOOR_M} m).`,
        };
      }
      if (toBand < FAR_BAND_M) {
        return {
          ...base,
          title,
          status: "broken",
          detail: `${t.name} is only ${m1(toBand)} from the band (keep ${FAR_BAND_M} m away).`,
        };
      }
      return { ...base, title, status: "ok", detail: `${t.name}: ${m1(toDoor)} from the doors, ${m1(toBand)} from the band.` };
    }

    const title = `${names.join(" & ")} near each other`;
    if (unseated.length > 0) return { ...base, title, status: "open", detail: `${unseated.join(" and ")} not seated yet.` };
    const centres = tableIds.map((id) => tableCenter(tableById[id]));
    let far = 0;
    for (const a of centres) for (const b of centres) far = Math.max(far, dist(a, b));
    return far > NEAR_GUESTS_M
      ? { ...base, title, status: "broken", detail: `Tables are ${m1(far)} apart.` }
      : { ...base, title, status: "ok", detail: "Close enough." };
  });
}

export function brokenByTable(results: RuleResult[]): Record<string, RuleResult[]> {
  const map: Record<string, RuleResult[]> = {};
  for (const r of results) {
    if (r.status !== "broken") continue;
    for (const tid of r.tableIds) (map[tid] ??= []).push(r);
  }
  return map;
}

export function brokenGuestSet(results: RuleResult[]): Set<string> {
  const set = new Set<string>();
  for (const r of results) if (r.status === "broken") for (const id of r.guestIds) set.add(id);
  return set;
}

/* ---------------------------------- meals ------------------------------------ */

export const STANDARD_MEAL = "Standard menu";

export function mealOf(g: Guest): string {
  return g.diet ?? STANDARD_MEAL;
}
