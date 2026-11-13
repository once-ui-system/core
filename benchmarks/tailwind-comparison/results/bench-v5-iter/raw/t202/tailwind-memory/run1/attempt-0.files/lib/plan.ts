import {
  FIXTURES,
  GUESTS,
  RULES,
  TABLES,
  guestById,
  tableById,
  type Fixture,
  type Rule,
  type Table,
} from "./data";

/** Seat map: for every table, one slot per seat holding a guest id or null. */
export type Seats = Record<string, (string | null)[]>;

export function initialSeats(): Seats {
  const seats: Seats = {};
  for (const t of TABLES) seats[t.id] = Array.from({ length: t.seats }, () => null);
  for (const guest of GUESTS) {
    if (!guest.table) continue;
    const row = seats[guest.table];
    if (!row) continue;
    const free = row.indexOf(null);
    if (free >= 0) row[free] = guest.id;
  }
  return seats;
}

export function locate(seats: Seats, guestId: string): { table: string; seat: number } | null {
  for (const tableId of Object.keys(seats)) {
    const idx = (seats[tableId] ?? []).indexOf(guestId);
    if (idx >= 0) return { table: tableId, seat: idx };
  }
  return null;
}

export function tableOfGuest(seats: Seats): Record<string, string> {
  const map: Record<string, string> = {};
  for (const tableId of Object.keys(seats)) {
    for (const id of seats[tableId] ?? []) if (id) map[id] = tableId;
  }
  return map;
}

export function filledCount(seats: Seats, tableId: string): number {
  return (seats[tableId] ?? []).filter(Boolean).length;
}

export interface MoveResult {
  seats: Seats;
  ok: boolean;
  message: string;
}

/** Seat a guest at a table (optionally at a chosen seat), moving or swapping as needed. */
export function moveGuest(
  seats: Seats,
  guestId: string,
  tableId: string,
  seatIndex?: number,
): MoveResult {
  const guest = guestById(guestId);
  const table = tableById(tableId);
  const next: Seats = {};
  for (const k of Object.keys(seats)) next[k] = [...(seats[k] ?? [])];
  const row = next[tableId];
  if (!row) return { seats, ok: false, message: "Unknown table." };

  const from = locate(next, guestId);

  if (seatIndex !== undefined && seatIndex >= 0 && seatIndex < row.length) {
    const occupant = row[seatIndex] ?? null;
    if (occupant === guestId) {
      return { seats, ok: true, message: `${guest.name} is already in that seat.` };
    }
    if (occupant === null) {
      if (from) (next[from.table] as (string | null)[])[from.seat] = null;
      row[seatIndex] = guestId;
      return {
        seats: next,
        ok: true,
        message: from
          ? `${guest.name} moved to ${table.name}, seat ${seatIndex + 1}.`
          : `${guest.name} seated at ${table.name}, seat ${seatIndex + 1}.`,
      };
    }
    if (from) {
      (next[from.table] as (string | null)[])[from.seat] = occupant;
      row[seatIndex] = guestId;
      return {
        seats: next,
        ok: true,
        message: `${guest.name} and ${guestById(occupant).name} swapped seats.`,
      };
    }
    // Dragged from the unseated list onto an occupied seat: use another free seat.
  }

  const alreadyHere = row.indexOf(guestId);
  if (alreadyHere >= 0) {
    return { seats, ok: true, message: `${guest.name} is already at ${table.name}.` };
  }
  const free = row.indexOf(null);
  if (free < 0) {
    return { seats, ok: false, message: `${table.name} is full (${table.seats} of ${table.seats} seats).` };
  }
  if (from) (next[from.table] as (string | null)[])[from.seat] = null;
  row[free] = guestId;
  return {
    seats: next,
    ok: true,
    message: from
      ? `${guest.name} moved to ${table.name}.`
      : `${guest.name} seated at ${table.name}.`,
  };
}

export function unseatGuest(seats: Seats, guestId: string): MoveResult {
  const from = locate(seats, guestId);
  if (!from) return { seats, ok: true, message: "Already unseated." };
  const next: Seats = {};
  for (const k of Object.keys(seats)) next[k] = [...(seats[k] ?? [])];
  (next[from.table] as (string | null)[])[from.seat] = null;
  return {
    seats: next,
    ok: true,
    message: `${guestById(guestId).name} unseated from ${tableById(from.table).name}.`,
  };
}

/* ------------------------------------------------------------------ geometry */

export interface SeatPos {
  dx: number;
  dy: number;
}

export const SEAT_R = 0.4;

/** Seat offsets (metres) from the table centre, already rotated. */
export function seatOffsets(table: Table): SeatPos[] {
  const rot = ((table.rotation ?? 0) * Math.PI) / 180;
  const out: SeatPos[] = [];
  if (table.shape === "round") {
    const r = 1.0 + SEAT_R + 0.08;
    for (let i = 0; i < table.seats; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / table.seats;
      out.push({ dx: Math.cos(a) * r, dy: Math.sin(a) * r });
    }
    return out;
  }
  const perSide = Math.ceil(table.seats / 2);
  const gap = 1.12;
  for (let i = 0; i < table.seats; i++) {
    const top = i < perSide;
    const idx = top ? i : i - perSide;
    const count = top ? perSide : table.seats - perSide;
    const x = (idx - (count - 1) / 2) * gap;
    const y = (top ? -1 : 1) * (0.45 + SEAT_R + 0.06);
    out.push({
      dx: x * Math.cos(rot) - y * Math.sin(rot),
      dy: x * Math.sin(rot) + y * Math.cos(rot),
    });
  }
  return out;
}

export function tableSize(table: Table): { w: number; h: number } {
  if (table.shape === "round") return { w: 2, h: 2 };
  const perSide = Math.ceil(table.seats / 2);
  return { w: perSide * 1.12 + 0.1, h: 0.9 };
}

function centre(f: Fixture): { x: number; y: number } {
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function fixtureById(id: string): Fixture {
  const f = FIXTURES.find((x) => x.id === id);
  if (!f) throw new Error(`Unknown fixture ${id}`);
  return f;
}

/* --------------------------------------------------------------------- rules */

export type RuleStatus = "broken" | "ok" | "open";

export interface RuleResult {
  index: number;
  rule: Rule;
  kind: Rule["kind"];
  status: RuleStatus;
  title: string;
  detail: string;
  tables: string[];
  guests: string[];
}

const NEAR_MAX_M = 6.5;
const AWAY_MIN_M = 8;

export function evaluateRules(seats: Seats): RuleResult[] {
  const where = tableOfGuest(seats);
  return RULES.map((rule, index): RuleResult => {
    const names = rule.guests.map((id) => guestById(id).name);
    const seated = rule.guests.filter((id) => where[id]);
    const tables = Array.from(new Set(seated.map((id) => where[id] as string)));

    if (rule.kind === "together") {
      const title = `Keep ${names.join(" and ")} together`;
      if (seated.length === rule.guests.length) {
        if (tables.length === 1) {
          return { index, rule, kind: rule.kind, status: "ok", title, detail: `Both at ${tableById(tables[0] as string).name}.`, tables, guests: seated };
        }
        return {
          index, rule, kind: rule.kind, status: "broken", title,
          detail: `Split across ${tables.map((t) => tableById(t).name).join(" and ")}.`,
          tables, guests: seated,
        };
      }
      const missing = rule.guests.filter((id) => !where[id]).map((id) => guestById(id).name);
      return {
        index, rule, kind: rule.kind, status: "open", title,
        detail: seated.length === 0 ? "Neither is seated yet." : `${missing.join(", ")} still needs a seat.`,
        tables, guests: seated,
      };
    }

    if (rule.kind === "apart") {
      const title = `Keep ${names.join(" and ")} apart`;
      const [a, b] = rule.guests;
      const ta = a ? where[a] : undefined;
      const tb = b ? where[b] : undefined;
      if (ta && tb && ta === tb) {
        return {
          index, rule, kind: rule.kind, status: "broken", title,
          detail: `Both at ${tableById(ta).name}.`, tables: [ta], guests: seated,
        };
      }
      return {
        index, rule, kind: rule.kind, status: "ok", title,
        detail: ta && tb ? "At different tables." : "Not seated together.",
        tables, guests: seated,
      };
    }

    const to = rule.near ? fixtureById(rule.near.to) : null;
    const away = rule.near?.awayFrom ? fixtureById(rule.near.awayFrom) : null;
    const title = `Seat ${names.join(" and ")} near ${to ? to.label.toLowerCase() : "the group"}${away ? `, away from the ${away.label.toLowerCase()}` : ""}`;
    const tid = tables[0];
    if (!tid || !to) {
      return { index, rule, kind: rule.kind, status: "open", title, detail: "Not seated yet.", tables, guests: seated };
    }
    const t = tableById(tid);
    const dTo = dist(t, centre(to));
    const dAway = away ? dist(t, centre(away)) : Infinity;
    if (dTo > NEAR_MAX_M) {
      return {
        index, rule, kind: rule.kind, status: "broken", title,
        detail: `${t.name} is ${dTo.toFixed(0)} m from the ${to.label.toLowerCase()}.`, tables, guests: seated,
      };
    }
    if (away && dAway < AWAY_MIN_M) {
      return {
        index, rule, kind: rule.kind, status: "broken", title,
        detail: `${t.name} is only ${dAway.toFixed(0)} m from the ${away.label.toLowerCase()}.`, tables, guests: seated,
      };
    }
    return {
      index, rule, kind: rule.kind, status: "ok", title,
      detail: `${t.name} is ${dTo.toFixed(0)} m from the ${to.label.toLowerCase()}.`, tables, guests: seated,
    };
  });
}
