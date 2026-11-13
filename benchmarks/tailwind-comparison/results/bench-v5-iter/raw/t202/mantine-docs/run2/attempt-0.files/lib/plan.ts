import {
  fixtures,
  guests,
  rules,
  tables,
  type Fixture,
  type Guest,
  type Rule,
  type TableDef,
} from "./data";

/** Where each guest sits: a table and a seat index, or null when unseated. */
export type Placement = { table: string; seat: number };
export type Seating = Record<string, Placement | null>;

export const SEAT_D = 0.85; // seat diameter, metres
export const NEAR_MAX_M = 4.5; // "near" a fixture: table centre within this distance
export const AWAY_MIN_M = 6; // "away" from a fixture: at least this far

export const guestById: Record<string, Guest> = Object.fromEntries(guests.map((g) => [g.id, g]));
export const tableById: Record<string, TableDef> = Object.fromEntries(tables.map((t) => [t.id, t]));
export const fixtureById: Record<string, Fixture> = Object.fromEntries(
  fixtures.map((f) => [f.id, f]),
);

export function firstName(guest: Guest): string {
  return guest.name.split(" ")[0] ?? guest.name;
}

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function initialSeating(): Seating {
  const seating: Seating = {};
  const used: Record<string, number> = {};
  // The couple sit in the middle of the top table.
  const headOrder = [3, 4, 2, 5, 1, 6, 0, 7];
  for (const g of guests) {
    if (!g.table) {
      seating[g.id] = null;
      continue;
    }
    const n = used[g.table] ?? 0;
    used[g.table] = n + 1;
    const seat = g.table === "t-head" ? (headOrder[n] ?? n) : n;
    seating[g.id] = { table: g.table, seat };
  }
  return seating;
}

/** Guest ids by seat index for one table (null = empty seat). */
export function occupants(seating: Seating, tableId: string): (string | null)[] {
  const table = tableById[tableId];
  const seats: (string | null)[] = Array.from({ length: table ? table.seats : 0 }, () => null);
  for (const [guestId, p] of Object.entries(seating)) {
    if (p && p.table === tableId) seats[p.seat] = guestId;
  }
  return seats;
}

export function seatedCount(seating: Seating, tableId: string): number {
  return occupants(seating, tableId).filter(Boolean).length;
}

// ---------------------------------------------------------------- geometry

type Box = { x: number; y: number; w: number; h: number };

export type TableGeometry = {
  box: Box; // everything the table needs, seats included
  disc: Box; // the table top
  round: boolean;
  seats: { x: number; y: number }[];
  centre: { x: number; y: number };
};

export function tableGeometry(t: TableDef): TableGeometry {
  if (t.shape === "round") {
    const top = 0.75;
    const ring = 1.3;
    const seats = Array.from({ length: t.seats }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
      return { x: t.x + ring * Math.cos(a), y: t.y + ring * Math.sin(a) };
    });
    const ext = ring + SEAT_D / 2 + 0.15;
    return {
      box: { x: t.x - ext, y: t.y - ext, w: ext * 2, h: ext * 2 },
      disc: { x: t.x - top, y: t.y - top, w: top * 2, h: top * 2 },
      round: true,
      seats,
      centre: { x: t.x, y: t.y },
    };
  }
  // Long table: x, y is its top-left corner, one metre per seat, seats on the room side.
  const w = t.seats;
  const h = 1;
  const seats = Array.from({ length: t.seats }, (_, i) => ({
    x: t.x + 0.5 + i,
    y: t.y + h + 0.1 + SEAT_D / 2,
  }));
  return {
    box: { x: t.x - 0.15, y: t.y - 0.15, w: w + 0.3, h: h + 0.1 + SEAT_D + 0.3 },
    disc: { x: t.x, y: t.y, w, h },
    round: false,
    seats,
    centre: { x: t.x + w / 2, y: t.y + h / 2 },
  };
}

export function fixtureCentre(f: Fixture): { x: number; y: number } {
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

export function distanceToFixture(tableId: string, fixtureId: string): number {
  const t = tableById[tableId];
  const f = fixtureById[fixtureId];
  if (!t || !f) return Number.POSITIVE_INFINITY;
  const a = tableGeometry(t).centre;
  const b = fixtureCentre(f);
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// ------------------------------------------------------------------- rules

export type RuleStatus = "ok" | "broken" | "waiting";

export type RuleResult = {
  index: number;
  rule: Rule;
  label: string;
  status: RuleStatus;
  /** tables to flag when the rule is broken */
  tables: string[];
  text: string;
};

export const RULE_LABEL: Record<Rule["kind"], string> = {
  together: "Keep together",
  apart: "Keep apart",
  near: "Seat near",
};

function tableName(id: string): string {
  return tableById[id]?.name ?? id;
}

function m(n: number): string {
  return `${n.toFixed(1)} m`;
}

export function evaluateRules(seating: Seating): RuleResult[] {
  return rules.map((rule, index): RuleResult => {
    const label = RULE_LABEL[rule.kind];
    const people = rule.guests.map((id) => guestById[id]).filter((g): g is Guest => Boolean(g));
    const where = people.map((g) => seating[g.id] ?? null);
    const unseated = people.filter((_, i) => !where[i]);
    const seatedTables = Array.from(
      new Set(where.flatMap((p) => (p ? [p.table] : []))),
    );
    const names = people.map((g) => g.name);

    if (unseated.length > 0) {
      return {
        index,
        rule,
        label,
        status: "waiting",
        tables: [],
        text: `Waiting for ${unseated.map((g) => g.name).join(" and ")} to be seated.`,
      };
    }

    if (rule.kind === "together") {
      const same = seatedTables.length === 1;
      return {
        index,
        rule,
        label,
        status: same ? "ok" : "broken",
        tables: same ? [] : seatedTables,
        text: same
          ? `${names.join(" and ")} are both at ${tableName(seatedTables[0] ?? "")}.`
          : `${names[0]} (${tableName(where[0]?.table ?? "")}) and ${names[1]} (${tableName(where[1]?.table ?? "")}) should sit together.`,
      };
    }

    if (rule.kind === "apart") {
      const same = seatedTables.length === 1;
      return {
        index,
        rule,
        label,
        status: same ? "broken" : "ok",
        tables: same ? seatedTables : [],
        text: same
          ? `${names.join(" and ")} are both at ${tableName(seatedTables[0] ?? "")}.`
          : `${names[0]} (${tableName(where[0]?.table ?? "")}) and ${names[1]} (${tableName(where[1]?.table ?? "")}) are at different tables.`,
      };
    }

    // near
    const tableId = where[0]?.table ?? "";
    const nearF = rule.near ? fixtureById[rule.near] : undefined;
    const awayF = rule.away ? fixtureById[rule.away] : undefined;
    const dNear = nearF ? distanceToFixture(tableId, nearF.id) : 0;
    const dAway = awayF ? distanceToFixture(tableId, awayF.id) : Number.POSITIVE_INFINITY;
    const problems: string[] = [];
    if (nearF && dNear > NEAR_MAX_M) {
      problems.push(`${m(dNear)} from the ${nearF.label.toLowerCase()} (within ${m(NEAR_MAX_M)} is near)`);
    }
    if (awayF && dAway < AWAY_MIN_M) {
      problems.push(`only ${m(dAway)} from the ${awayF.label.toLowerCase()}`);
    }
    const ok = problems.length === 0;
    return {
      index,
      rule,
      label,
      status: ok ? "ok" : "broken",
      tables: ok ? [] : [tableId],
      text: ok
        ? `${names[0]} is at ${tableName(tableId)}, ${m(dNear)} from the ${nearF?.label.toLowerCase() ?? "fixture"}.`
        : `${names[0]} is at ${tableName(tableId)}, ${problems.join(" and ")}.`,
    };
  });
}

// ----------------------------------------------------------------- seating

export type PlaceResult = { seating: Seating; error?: string; noop?: boolean; note?: string };

export function placeGuest(
  seating: Seating,
  guestId: string,
  tableId: string,
  seat?: number,
): PlaceResult {
  const guest = guestById[guestId];
  const table = tableById[tableId];
  if (!guest || !table) return { seating, error: "That guest or table does not exist." };
  if (guest.rsvp === "no") {
    return { seating, error: `${guest.name} has declined, so there is no seat to give.` };
  }
  const current = seating[guestId] ?? null;
  const occ = occupants(seating, tableId);
  let target = seat;
  if (target === undefined) {
    if (current && current.table === tableId) {
      return { seating, noop: true, note: `${guest.name} is already at ${table.name}.` };
    }
    target = occ.indexOf(null);
    if (target < 0) return { seating, error: `${table.name} is full.` };
  }
  const other = occ[target] ?? null;
  if (other === guestId) return { seating, noop: true };
  const next: Seating = { ...seating };
  if (other) {
    if (!current) {
      const o = guestById[other];
      return {
        seating,
        error: `Seat ${target + 1} at ${table.name} is taken by ${o ? o.name : "another guest"}. Choose an empty seat.`,
      };
    }
    next[other] = current;
  }
  next[guestId] = { table: tableId, seat: target };
  const o = other ? guestById[other] : undefined;
  return {
    seating: next,
    note: o
      ? `${guest.name} and ${o.name} swapped seats.`
      : `${guest.name} is now at ${table.name}, seat ${target + 1}.`,
  };
}

export function unseatGuest(seating: Seating, guestId: string): Seating {
  return { ...seating, [guestId]: null };
}

/** Rules that would newly break if this guest took the first free seat at the table. */
export function conflictsIfPlaced(
  seating: Seating,
  guestId: string,
  tableId: string,
): RuleResult[] {
  const before = new Set(
    evaluateRules(seating)
      .filter((r) => r.status === "broken")
      .map((r) => r.index),
  );
  const res = placeGuest(seating, guestId, tableId);
  if (res.error || res.noop) return [];
  return evaluateRules(res.seating).filter(
    (r) => r.status === "broken" && !before.has(r.index) && r.rule.guests.includes(guestId),
  );
}

// ------------------------------------------------------------------- stats

export type Stats = {
  invited: number;
  attending: number;
  seated: number;
  /** attending (yes) guests without a seat */
  toSeat: number;
  /** maybe / awaiting reply guests without a seat */
  undecidedUnseated: number;
  totalSeats: number;
  freeSeats: number;
};

export function computeStats(seating: Seating): Stats {
  const seated = guests.filter((g) => seating[g.id]).length;
  const attending = guests.filter((g) => g.rsvp === "yes").length;
  const toSeat = guests.filter((g) => g.rsvp === "yes" && !seating[g.id]).length;
  const undecidedUnseated = guests.filter(
    (g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !seating[g.id],
  ).length;
  const totalSeats = tables.reduce((n, t) => n + t.seats, 0);
  return {
    invited: guests.length,
    attending,
    seated,
    toSeat,
    undecidedUnseated,
    totalSeats,
    freeSeats: totalSeats - seated,
  };
}

// ------------------------------------------------------------------- meals

export type MealRow = { meal: string; confirmed: number; undecided: number };

export function mealCounts(standard: string): MealRow[] {
  const map = new Map<string, MealRow>();
  for (const g of guests) {
    if (g.rsvp === "no") continue;
    const meal = g.diet ?? standard;
    const row = map.get(meal) ?? { meal, confirmed: 0, undecided: 0 };
    if (g.rsvp === "yes") row.confirmed += 1;
    else row.undecided += 1;
    map.set(meal, row);
  }
  const rows = Array.from(map.values());
  rows.sort((a, b) => {
    if (a.meal === standard) return -1;
    if (b.meal === standard) return 1;
    return a.meal.localeCompare(b.meal);
  });
  return rows;
}
