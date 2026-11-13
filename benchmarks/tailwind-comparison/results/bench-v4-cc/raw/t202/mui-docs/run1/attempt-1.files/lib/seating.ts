import {
  FIXTURES,
  GUESTS,
  RULES,
  TABLES,
  fixtureById,
  firstName,
  guestById,
  tableById,
  type Fixture,
  type Rule,
  type TableDef,
} from "./data";

/** For each table, one entry per seat: a guest id or null. */
export type SeatMap = Record<string, (string | null)[]>;

export const SEAT_D = 0.7;

export function initialSeats(): SeatMap {
  const seats: SeatMap = {};
  for (const t of TABLES) seats[t.id] = Array.from({ length: t.seats }, () => null);
  for (const g of GUESTS) {
    if (!g.table) continue;
    const row = seats[g.table];
    const free = row.indexOf(null);
    if (free >= 0) row[free] = g.id;
  }
  return seats;
}

export function locate(seats: SeatMap): Record<string, { table: string; seat: number }> {
  const out: Record<string, { table: string; seat: number }> = {};
  for (const [table, row] of Object.entries(seats)) {
    row.forEach((gid, seat) => {
      if (gid) out[gid] = { table, seat };
    });
  }
  return out;
}

export const RULE_GUEST_IDS: Set<string> = new Set(RULES.flatMap((r) => r.guests));

/* ---------- geometry (metres, room coordinates) ---------- */

export interface SeatPos {
  index: number;
  x: number;
  y: number;
}

export interface TableGeo {
  w: number;
  h: number;
  round: boolean;
  seats: SeatPos[];
}

export function tableGeometry(t: TableDef): TableGeo {
  const rot = ((t.rotation ?? 0) * Math.PI) / 180;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  const at = (dx: number, dy: number) => ({ x: t.x + dx * cos - dy * sin, y: t.y + dx * sin + dy * cos });

  if (t.shape === "round") {
    const d = t.seats > 6 ? 1.7 : 1.5;
    const ring = d / 2 + 0.1 + SEAT_D / 2;
    const seats: SeatPos[] = Array.from({ length: t.seats }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
      return { index: i, ...at(Math.cos(a) * ring, Math.sin(a) * ring) };
    });
    return { w: d, h: d, round: true, seats };
  }

  const top = Math.ceil(t.seats / 2);
  const bottom = t.seats - top;
  const spacing = 1.05;
  const depth = 0.9;
  const offset = depth / 2 + 0.1 + SEAT_D / 2 - 0.1;
  const seats: SeatPos[] = [];
  for (let k = 0; k < top; k++) {
    seats.push({ index: k, ...at((k - (top - 1) / 2) * spacing, -offset) });
  }
  for (let k = 0; k < bottom; k++) {
    seats.push({ index: top + k, ...at((k - (bottom - 1) / 2) * spacing, offset) });
  }
  return { w: top * spacing + 0.2, h: depth, round: false, seats };
}

function centre(f: Fixture): { x: number; y: number } {
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

export function distanceToFixture(t: TableDef, f: Fixture): number {
  const c = centre(f);
  return Math.hypot(t.x - c.x, t.y - c.y);
}

/* ---------- moving guests ---------- */

export type Severity = "success" | "info" | "warning" | "error";

export interface PlaceResult {
  seats: SeatMap;
  changed: boolean;
  message: string;
  severity: Severity;
}

function cloneSeats(seats: SeatMap): SeatMap {
  const next: SeatMap = {};
  for (const k of Object.keys(seats)) next[k] = seats[k].slice();
  return next;
}

function findGuest(seats: SeatMap, guestId: string): { table: string; seat: number } | null {
  for (const [table, row] of Object.entries(seats)) {
    const i = row.indexOf(guestId);
    if (i >= 0) return { table, seat: i };
  }
  return null;
}

export function placeGuest(seats: SeatMap, guestId: string, tableId: string, seatIndex?: number): PlaceResult {
  const guest = guestById[guestId];
  const table = tableById[tableId];
  const fail = (message: string, severity: Severity): PlaceResult => ({ seats, changed: false, message, severity });
  if (!guest || !table) return fail("That guest or table does not exist.", "error");
  if (guest.rsvp === "no") {
    return fail(`${guest.name} has declined, so there is no seat to give.`, "warning");
  }

  const from = findGuest(seats, guestId);
  const next = cloneSeats(seats);
  const row = next[tableId];
  const verb = from ? "moved to" : "seated at";

  if (seatIndex === undefined) {
    if (from && from.table === tableId) return fail(`${guest.name} is already at ${table.name}.`, "info");
    const free = row.indexOf(null);
    if (free < 0) {
      return fail(`${table.name} is full (${row.length} of ${row.length}). Choose a seat to swap, or another table.`, "warning");
    }
    if (from) next[from.table][from.seat] = null;
    row[free] = guestId;
    return {
      seats: next,
      changed: true,
      message: `${guest.name} ${verb} ${table.name}, seat ${free + 1}.`,
      severity: "success",
    };
  }

  const occupant = row[seatIndex];
  if (occupant === guestId) return fail(`${guest.name} is already in that seat.`, "info");

  if (!occupant) {
    if (from) next[from.table][from.seat] = null;
    row[seatIndex] = guestId;
    return {
      seats: next,
      changed: true,
      message: `${guest.name} ${verb} ${table.name}, seat ${seatIndex + 1}.`,
      severity: "success",
    };
  }

  const other = guestById[occupant];
  if (from) {
    next[from.table][from.seat] = occupant;
    row[seatIndex] = guestId;
    return {
      seats: next,
      changed: true,
      message: `Swapped ${guest.name} and ${other.name}.`,
      severity: "success",
    };
  }

  const free = row.indexOf(null);
  if (free >= 0) {
    row[free] = guestId;
    return {
      seats: next,
      changed: true,
      message: `${guest.name} seated at ${table.name}, seat ${free + 1} (seat ${seatIndex + 1} was taken).`,
      severity: "success",
    };
  }
  row[seatIndex] = guestId;
  return {
    seats: next,
    changed: true,
    message: `${guest.name} took ${other.name}'s seat at ${table.name}. ${other.name} is now unseated.`,
    severity: "warning",
  };
}

export function unseatGuest(seats: SeatMap, guestId: string): PlaceResult {
  const guest = guestById[guestId];
  const from = findGuest(seats, guestId);
  if (!guest || !from) return { seats, changed: false, message: "That guest has no seat to leave.", severity: "info" };
  const next = cloneSeats(seats);
  next[from.table][from.seat] = null;
  return {
    seats: next,
    changed: true,
    message: `${guest.name} unseated from ${tableById[from.table].name}.`,
    severity: "success",
  };
}

/* ---------- the couple's rules ---------- */

export type RuleStatus = "ok" | "broken" | "open";

export interface RuleResult {
  rule: Rule;
  status: RuleStatus;
  /** tables to flag on the plan */
  tables: string[];
  /** guests to flag on their seats */
  guestIds: string[];
  message: string;
}

export const RULE_LABEL: Record<Rule["kind"], string> = {
  together: "Keep together",
  apart: "Keep apart",
  near: "Seat near",
};

export function ruleTitle(rule: Rule): string {
  const names = rule.guests.map((id) => guestById[id].name);
  if (rule.kind === "near") {
    const f = rule.nearFixture ? fixtureById[rule.nearFixture] : undefined;
    return `${names[0]} near the ${f ? f.label.toLowerCase() : "venue feature"}`;
  }
  return names.join(" and ");
}

function unique(list: string[]): string[] {
  return list.filter((v, i) => list.indexOf(v) === i);
}

function names(ids: string[]): string {
  return ids.map((id) => guestById[id].name).join(" and ");
}

export function evaluateRules(seats: SeatMap): RuleResult[] {
  const at = locate(seats);
  const tn = (id: string) => tableById[id].name;

  return RULES.map((rule): RuleResult => {
    const placed = rule.guests.filter((id) => at[id]);
    const unplaced = rule.guests.filter((id) => !at[id]);

    if (rule.kind === "together") {
      const tables = unique(placed.map((id) => at[id].table));
      if (tables.length > 1) {
        return {
          rule,
          status: "broken",
          tables,
          guestIds: placed,
          message: `${placed.map((id) => `${guestById[id].name} is at ${tn(at[id].table)}`).join(", ")}. They should share a table.`,
        };
      }
      if (placed.length === 0) {
        return { rule, status: "open", tables: [], guestIds: [], message: `${names(rule.guests)} are not seated yet.` };
      }
      if (unplaced.length > 0) {
        return {
          rule,
          status: "open",
          tables,
          guestIds: [],
          message: `${names(placed)} at ${tn(tables[0])}. Seat ${names(unplaced)} there too.`,
        };
      }
      return { rule, status: "ok", tables, guestIds: [], message: `Together at ${tn(tables[0])}.` };
    }

    if (rule.kind === "apart") {
      const byTable: Record<string, string[]> = {};
      for (const id of placed) {
        const t = at[id].table;
        byTable[t] = [...(byTable[t] ?? []), id];
      }
      const shared = Object.entries(byTable).find(([, ids]) => ids.length > 1);
      if (shared) {
        return {
          rule,
          status: "broken",
          tables: [shared[0]],
          guestIds: shared[1],
          message: `${names(shared[1])} are both at ${tn(shared[0])}. Move one of them.`,
        };
      }
      return {
        rule,
        status: "ok",
        tables: [],
        guestIds: [],
        message:
          unplaced.length > 0
            ? `Holds for now: ${names(unplaced)} ${unplaced.length > 1 ? "are" : "is"} not seated yet.`
            : "At different tables.",
      };
    }

    // near
    const id = rule.guests[0];
    const guest = guestById[id];
    const near = rule.nearFixture ? fixtureById[rule.nearFixture] : undefined;
    const away = rule.awayFrom ? fixtureById[rule.awayFrom] : undefined;
    const maxD = rule.maxDistance ?? 4;
    const minAway = rule.minAwayDistance ?? 6;
    const qualifies = (t: TableDef) =>
      (!near || distanceToFixture(t, near) <= maxD) && (!away || distanceToFixture(t, away) >= minAway);
    const best = near
      ? TABLES.filter((t) => qualifies(t) && seats[t.id].includes(null))
          .sort((a, b) => distanceToFixture(a, near) - distanceToFixture(b, near))[0]
      : undefined;
    const hint = best ? ` ${tn(best.id)} has a free seat and suits.` : "";

    if (!at[id]) {
      return {
        rule,
        status: "open",
        tables: [],
        guestIds: [],
        message: `${guest.name} is not seated yet.${hint}`,
      };
    }
    const table = tableById[at[id].table];
    const dNear = near ? distanceToFixture(table, near) : 0;
    const dAway = away ? distanceToFixture(table, away) : Infinity;
    const problems: string[] = [];
    if (near && dNear > maxD) {
      problems.push(`${table.name} is ${dNear.toFixed(1)} m from the ${near.label.toLowerCase()}; aim for ${maxD} m or less`);
    }
    if (away && dAway < minAway) {
      problems.push(`${table.name} is only ${dAway.toFixed(1)} m from the ${away.label.toLowerCase()}; keep ${minAway} m or more away`);
    }
    if (problems.length > 0) {
      return {
        rule,
        status: "broken",
        tables: [table.id],
        guestIds: [id],
        message: `${problems.join(". ")}.${hint}`,
      };
    }
    return {
      rule,
      status: "ok",
      tables: [table.id],
      guestIds: [],
      message: `${table.name} is ${near ? dNear.toFixed(1) : "?"} m from the ${near ? near.label.toLowerCase() : "feature"}${
        away ? ` and ${dAway.toFixed(1)} m from the ${away.label.toLowerCase()}` : ""
      }.`,
    };
  });
}

export { FIXTURES, firstName };
