import {
  fixtures,
  guests,
  rules,
  tables,
  type Guest,
  type Rule,
  type SeatTable,
} from "./data";

export interface Placement {
  table: string;
  seat: number;
}

export type Assignment = Record<string, Placement | null>;

export const guestById = new Map<string, Guest>(guests.map((x) => [x.id, x]));
export const tableById = new Map<string, SeatTable>(tables.map((x) => [x.id, x]));

export function initialAssignment(): Assignment {
  const next: Assignment = {};
  const used: Record<string, number> = {};
  for (const guest of guests) {
    if (guest.table && tableById.has(guest.table)) {
      const seat = used[guest.table] ?? 0;
      used[guest.table] = seat + 1;
      next[guest.id] = { table: guest.table, seat };
    } else {
      next[guest.id] = null;
    }
  }
  return next;
}

/** For each table, the guest id in each seat (null = empty). */
export function seatMap(a: Assignment): Record<string, (string | null)[]> {
  const map: Record<string, (string | null)[]> = {};
  for (const t of tables) map[t.id] = Array.from({ length: t.seats }, () => null);
  for (const [id, p] of Object.entries(a)) {
    if (p && map[p.table]) map[p.table][p.seat] = id;
  }
  return map;
}

export interface PlaceResult {
  next: Assignment;
  ok: boolean;
  message: string;
}

export function placeGuest(
  a: Assignment,
  guestId: string,
  tableId: string,
  seat?: number,
): PlaceResult {
  const guest = guestById.get(guestId);
  const table = tableById.get(tableId);
  if (!guest || !table) return { next: a, ok: false, message: "Nothing to place." };
  if (guest.rsvp === "no") {
    return { next: a, ok: false, message: `${guest.name} has declined and cannot be seated.` };
  }
  const map = seatMap(a);
  const seats = map[tableId];
  const from = a[guestId] ?? null;
  let target = seat;
  if (target === undefined) {
    if (from && from.table === tableId) {
      return { next: a, ok: true, message: `${guest.name} is already at ${table.name}.` };
    }
    target = seats.findIndex((s) => s === null);
    if (target < 0) {
      return { next: a, ok: false, message: `${table.name} is full (${table.seats} of ${table.seats}).` };
    }
  }
  const occupant = seats[target];
  if (occupant === guestId) {
    return { next: a, ok: true, message: `${guest.name} stays in seat ${target + 1}.` };
  }
  const next: Assignment = { ...a };
  next[guestId] = { table: tableId, seat: target };
  if (occupant) {
    const other = guestById.get(occupant);
    next[occupant] = from;
    const where = from ? `${tableById.get(from.table)?.name}` : "the unseated list";
    return {
      next,
      ok: true,
      message: `${guest.name} now at ${table.name}, seat ${target + 1}. ${other?.name ?? "Guest"} moved to ${where}.`,
    };
  }
  return {
    next,
    ok: true,
    message: `${guest.name} seated at ${table.name}, seat ${target + 1}.`,
  };
}

export function unseatGuest(a: Assignment, guestId: string): PlaceResult {
  const guest = guestById.get(guestId);
  if (!guest || !a[guestId]) return { next: a, ok: false, message: "Already unseated." };
  return { next: { ...a, [guestId]: null }, ok: true, message: `${guest.name} unseated.` };
}

/* ---------- geometry ---------- */

export const SEAT_R = 0.38;
export const ROUND_R = 0.95;
export const LONG_DEPTH = 1.1;
export const LONG_LEN = 8;

export function tableCentre(t: SeatTable): { x: number; y: number } {
  if (t.shape === "long") return { x: t.x + LONG_LEN / 2, y: t.y + LONG_DEPTH / 2 };
  return { x: t.x, y: t.y };
}

export function seatPositions(t: SeatTable): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  if (t.shape === "round") {
    const ring = ROUND_R + 0.52;
    for (let i = 0; i < t.seats; i++) {
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
      out.push({ x: t.x + ring * Math.cos(ang), y: t.y + ring * Math.sin(ang) });
    }
    return out;
  }
  const c = tableCentre(t);
  const rot = ((t.rotation ?? 0) * Math.PI) / 180;
  for (let i = 0; i < t.seats; i++) {
    const lx = -LONG_LEN / 2 + ((i + 0.5) * LONG_LEN) / t.seats;
    const ly = -LONG_DEPTH / 2 - 0.5;
    out.push({
      x: c.x + lx * Math.cos(rot) - ly * Math.sin(rot),
      y: c.y + lx * Math.sin(rot) + ly * Math.cos(rot),
    });
  }
  return out;
}

function fixtureCentre(kind: string): { x: number; y: number } {
  const f = fixtures.find((x) => x.kind === kind);
  if (!f) return { x: 0, y: 0 };
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export const NEAR_DOOR_M = 4.5;
export const AWAY_BAND_M = 6;

export function distanceToDoors(tableId: string): number {
  const t = tableById.get(tableId);
  return t ? dist(tableCentre(t), fixtureCentre("door")) : 0;
}

export function distanceToBand(tableId: string): number {
  const t = tableById.get(tableId);
  return t ? dist(tableCentre(t), fixtureCentre("stage")) : 0;
}

/* ---------- rules ---------- */

export type RuleStatus = "ok" | "broken" | "pending";

export interface RuleResult {
  index: number;
  rule: Rule;
  status: RuleStatus;
  tables: string[];
  title: string;
  detail: string;
}

const first = (id: string) => (guestById.get(id)?.name ?? id).split(" ")[0];

export function evaluateRules(a: Assignment): RuleResult[] {
  return rules.map((rule, index): RuleResult => {
    const names = rule.guests.map((id) => guestById.get(id)?.name ?? id);
    const places = rule.guests.map((id) => a[id] ?? null);
    const seatedTables = Array.from(
      new Set(places.filter((p): p is Placement => p !== null).map((p) => p.table)),
    );
    const tname = (id: string) => tableById.get(id)?.name ?? id;

    if (rule.kind === "together") {
      const title = `Keep ${names.join(" and ")} together`;
      if (places.some((p) => p === null)) {
        const missing = rule.guests.filter((_, i) => places[i] === null).map(first);
        return {
          index,
          rule,
          status: "pending",
          tables: seatedTables,
          title,
          detail: `Waiting to seat ${missing.join(" and ")}.`,
        };
      }
      if (seatedTables.length === 1) {
        return { index, rule, status: "ok", tables: seatedTables, title, detail: `Together at ${tname(seatedTables[0])}.` };
      }
      return {
        index,
        rule,
        status: "broken",
        tables: seatedTables,
        title,
        detail: `Split across ${seatedTables.map(tname).join(" and ")}.`,
      };
    }

    if (rule.kind === "apart") {
      const title = `Keep ${names.join(" and ")} apart`;
      if (places.every((p) => p !== null) && seatedTables.length === 1) {
        return {
          index,
          rule,
          status: "broken",
          tables: seatedTables,
          title,
          detail: `Both at ${tname(seatedTables[0])}.`,
        };
      }
      return {
        index,
        rule,
        status: "ok",
        tables: seatedTables,
        title,
        detail: seatedTables.length === 0 ? "Neither is seated yet." : "At different tables or not yet seated.",
      };
    }

    // near: the guest sits close to the garden doors and away from the band
    const title = `Seat ${names[0]} near the garden doors`;
    const p = places[0];
    if (!p) {
      return { index, rule, status: "pending", tables: [], title, detail: "Not seated yet." };
    }
    const d = distanceToDoors(p.table);
    const b = distanceToBand(p.table);
    const ok = d <= NEAR_DOOR_M && b >= AWAY_BAND_M;
    return {
      index,
      rule,
      status: ok ? "ok" : "broken",
      tables: [p.table],
      title,
      detail: ok
        ? `${tname(p.table)} is ${d.toFixed(1)} m from the doors and ${b.toFixed(1)} m from the band.`
        : d > NEAR_DOOR_M
          ? `${tname(p.table)} is ${d.toFixed(1)} m from the doors (limit ${NEAR_DOOR_M} m).`
          : `${tname(p.table)} is only ${b.toFixed(1)} m from the band (needs ${AWAY_BAND_M} m).`,
    };
  });
}

/* ---------- counts ---------- */

export interface Counts {
  attending: number;
  seated: number;
  unseated: number;
  capacity: number;
  perTable: Record<string, number>;
}

export function countsFor(a: Assignment): Counts {
  const attending = guests.filter((x) => x.rsvp === "yes");
  const perTable: Record<string, number> = {};
  for (const t of tables) perTable[t.id] = 0;
  let seated = 0;
  for (const x of guests) {
    const p = a[x.id];
    if (p) {
      perTable[p.table] += 1;
      if (x.rsvp === "yes") seated += 1;
    }
  }
  return {
    attending: attending.length,
    seated,
    unseated: attending.filter((x) => !a[x.id]).length,
    capacity: tables.reduce((s, t) => s + t.seats, 0),
    perTable,
  };
}

export function initials(name: string): string {
  const parts = name.replace(/[^\p{L}\s]/gu, "").split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const MEAL_STANDARD = "Standard menu";

export function mealFor(g: Guest): string {
  return g.diet ?? MEAL_STANDARD;
}
