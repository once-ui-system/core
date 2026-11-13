import {
  FIXTURES,
  GUESTS,
  GUEST_BY_ID,
  RULES,
  RULE_KIND_LABEL,
  TABLES,
  TABLE_BY_ID,
  type Fixture,
  type Rule,
  type TableDef,
} from "./data";

/** For each table, the guest id in every seat (null = empty). */
export type Seats = Record<string, (string | null)[]>;
export type SeatIndex = Record<string, { table: string; seat: number }>;

export function initialSeats(): Seats {
  const seats: Seats = {};
  for (const t of TABLES) seats[t.id] = Array.from({ length: t.seats }, () => null);
  for (const g of GUESTS) {
    if (!g.table) continue;
    const row = seats[g.table];
    const free = row.indexOf(null);
    if (free >= 0) row[free] = g.id;
  }
  return seats;
}

export function buildIndex(seats: Seats): SeatIndex {
  const index: SeatIndex = {};
  for (const tableId of Object.keys(seats)) {
    seats[tableId].forEach((guestId, seat) => {
      if (guestId) index[guestId] = { table: tableId, seat };
    });
  }
  return index;
}

export function freeSeats(seats: Seats, tableId: string): number {
  return seats[tableId].filter((s) => s === null).length;
}

export type PlaceResult =
  | { ok: true; seats: Seats; seat: number; swapped?: string; changed: boolean; moved: boolean }
  | { ok: false; reason: string };

function cloneSeats(seats: Seats): Seats {
  const next: Seats = {};
  for (const k of Object.keys(seats)) next[k] = seats[k].slice();
  return next;
}

/** Seat a guest (new or already seated). A wanted seat that is taken swaps two seated guests. */
export function placeGuest(seats: Seats, guestId: string, tableId: string, want?: number): PlaceResult {
  const table = TABLE_BY_ID[tableId];
  const index = buildIndex(seats);
  const from = index[guestId];
  if (from && from.table === tableId && (want === undefined || want === from.seat)) {
    return { ok: true, seats, seat: from.seat, changed: false, moved: true };
  }
  const next = cloneSeats(seats);
  if (from) next[from.table][from.seat] = null;
  const row = next[tableId];
  let seat = -1;
  if (want !== undefined && want >= 0 && want < row.length) {
    const occupant = row[want];
    if (occupant === null) {
      seat = want;
    } else if (from) {
      row[want] = guestId;
      next[from.table][from.seat] = occupant;
      return { ok: true, seats: next, seat: want, swapped: occupant, changed: true, moved: true };
    }
  }
  if (seat < 0) seat = row.indexOf(null);
  if (seat < 0) return { ok: false, reason: `${table.name} is full. Pick another table or free a seat first.` };
  row[seat] = guestId;
  return { ok: true, seats: next, seat, changed: true, moved: Boolean(from) };
}

export function removeGuest(seats: Seats, guestId: string): Seats {
  const from = buildIndex(seats)[guestId];
  if (!from) return seats;
  const next = cloneSeats(seats);
  next[from.table][from.seat] = null;
  return next;
}

/* ---------- Rules ---------- */

export type RuleLevel = "ok" | "broken" | "open";

export interface RuleResult {
  rule: Rule;
  kindLabel: string;
  level: RuleLevel;
  headline: string;
  detail: string;
  /** Tables the rule touches right now. */
  tables: string[];
  guestIds: string[];
}

/** A guest meant to sit near the garden doors must be within this distance of them. */
export const NEAR_MAX_M = 4.5;
/** ...and at least this far from the band. */
export const AWAY_MIN_M = 8;

const DOOR = FIXTURES.find((f) => f.kind === "door") as Fixture;
const STAGE = FIXTURES.find((f) => f.kind === "stage") as Fixture;

export function distanceTo(t: TableDef, f: Fixture): number {
  return Math.hypot(t.x - (f.x + f.w / 2), t.y - (f.y + f.h / 2));
}

const m = (n: number) => `${n.toFixed(1)} m`;

function nearestGoodTable(): TableDef | undefined {
  return TABLES.filter((t) => distanceTo(t, STAGE) >= AWAY_MIN_M).sort(
    (a, b) => distanceTo(a, DOOR) - distanceTo(b, DOOR),
  )[0];
}

export function evaluateRules(seats: Seats, index: SeatIndex): RuleResult[] {
  return RULES.map((rule): RuleResult => {
    const names = rule.guests.map((id) => GUEST_BY_ID[id].name);
    const places = rule.guests.map((id) => index[id]);
    const base = { rule, kindLabel: RULE_KIND_LABEL[rule.kind], guestIds: rule.guests };
    const tn = (id: string) => TABLE_BY_ID[id].name;
    const seatedTables = Array.from(new Set(places.filter(Boolean).map((p) => p.table)));

    if (rule.kind === "together") {
      const [a, b] = places;
      if (a && b) {
        if (a.table === b.table) {
          return { ...base, level: "ok", headline: `${names[0]} and ${names[1]} sit together at ${tn(a.table)}`, detail: "Rule kept.", tables: seatedTables };
        }
        return {
          ...base,
          level: "broken",
          headline: `${names[0]} and ${names[1]} are at different tables`,
          detail: `${names[0]} is at ${tn(a.table)} and ${names[1]} at ${tn(b.table)}. Seat them at one table.`,
          tables: seatedTables,
        };
      }
      if (a || b) {
        const seated = a ?? b;
        const waiting = a ? names[1] : names[0];
        const sitting = a ? names[0] : names[1];
        const free = freeSeats(seats, seated.table);
        return {
          ...base,
          level: "open",
          headline: `${waiting} still needs a seat next to ${sitting}`,
          detail: `${sitting} is at ${tn(seated.table)}, which has ${free} free ${free === 1 ? "seat" : "seats"}.`,
          tables: seatedTables,
        };
      }
      return { ...base, level: "open", headline: `${names[0]} and ${names[1]} are not seated yet`, detail: "Seat them at the same table.", tables: [] };
    }

    if (rule.kind === "apart") {
      const [a, b] = places;
      if (a && b && a.table === b.table) {
        return {
          ...base,
          level: "broken",
          headline: `${names[0]} and ${names[1]} are both at ${tn(a.table)}`,
          detail: "Move one of them to another table.",
          tables: [a.table],
        };
      }
      return {
        ...base,
        level: "ok",
        headline: `${names[0]} and ${names[1]} are kept apart`,
        detail: a && b ? `${tn(a.table)} and ${tn(b.table)}.` : "Not both seated yet, so nothing to clash.",
        tables: seatedTables,
      };
    }

    // near: the garden doors, away from the band
    const best = nearestGoodTable();
    const [p] = places;
    if (!p) {
      return {
        ...base,
        level: "open",
        headline: `${names[0]} is not seated yet`,
        detail: best ? `${best.name} is the best fit: ${m(distanceTo(best, DOOR))} from the garden doors, ${m(distanceTo(best, STAGE))} from the band.` : "",
        tables: [],
      };
    }
    const t = TABLE_BY_ID[p.table];
    const dDoor = distanceTo(t, DOOR);
    const dStage = distanceTo(t, STAGE);
    if (dDoor <= NEAR_MAX_M && dStage >= AWAY_MIN_M) {
      return {
        ...base,
        level: "ok",
        headline: `${names[0]} is near the garden doors`,
        detail: `${t.name} is ${m(dDoor)} from the doors and ${m(dStage)} from the band.`,
        tables: [t.id],
      };
    }
    const problems: string[] = [];
    if (dDoor > NEAR_MAX_M) problems.push(`${m(dDoor)} from the garden doors (aim for ${m(NEAR_MAX_M)} or less)`);
    if (dStage < AWAY_MIN_M) problems.push(`only ${m(dStage)} from the band`);
    return {
      ...base,
      level: "broken",
      headline: `${names[0]} is not near the garden doors`,
      detail: `${t.name} is ${problems.join(" and ")}.${best ? ` ${best.name} is the closest fit.` : ""}`,
      tables: [t.id],
    };
  });
}
