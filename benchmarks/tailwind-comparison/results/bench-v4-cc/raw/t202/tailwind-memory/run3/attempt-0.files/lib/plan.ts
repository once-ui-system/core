import { FIXTURES, GUESTS, RULES, TABLES, type Fixture, type Rule, type Table } from "./data";

export type Seats = Record<string, (string | null)[]>;
export type Location = { tableId: string; index: number };

export const GUEST_BY_ID = new Map(GUESTS.map((g) => [g.id, g]));
export const TABLE_BY_ID = new Map(TABLES.map((t) => [t.id, t]));

export const SEAT_R = 0.4;
export const LONG_PITCH = 1;
export const LONG_H = 1.2;
export const NEAR_DOOR_MAX_M = 4;
export const BAND_MIN_M = 6;

const roundRadius = (seats: number) => (seats >= 8 ? 1 : 0.85);

export type Rect = { x: number; y: number; w: number; h: number };
export type Geometry = {
  box: Rect;
  body: Rect;
  seats: { x: number; y: number }[];
  center: { x: number; y: number };
};

/** All values in metres. */
export function tableGeometry(t: Table): Geometry {
  if (t.shape === "round") {
    const r = roundRadius(t.seats);
    const orbit = r + 0.5;
    const ext = orbit + SEAT_R;
    const seats = Array.from({ length: t.seats }, (_, i) => {
      const a = (i / t.seats) * Math.PI * 2 - Math.PI / 2;
      return { x: t.x + Math.cos(a) * orbit, y: t.y + Math.sin(a) * orbit };
    });
    return {
      box: { x: t.x - ext, y: t.y - ext, w: ext * 2, h: ext * 2 },
      body: { x: t.x - r, y: t.y - r, w: r * 2, h: r * 2 },
      seats,
      center: { x: t.x, y: t.y },
    };
  }
  const w = t.seats * LONG_PITCH;
  const top = t.y - 0.5 - SEAT_R;
  const seats = Array.from({ length: t.seats }, (_, i) => ({
    x: t.x + (i + 0.5) * LONG_PITCH,
    y: t.y - 0.5,
  }));
  return {
    box: { x: t.x, y: top, w, h: t.y + LONG_H - top },
    body: { x: t.x, y: t.y, w, h: LONG_H },
    seats,
    center: { x: t.x + w / 2, y: t.y + LONG_H / 2 },
  };
}

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0].charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}

export function initialSeats(): Seats {
  const seats: Seats = {};
  for (const t of TABLES) seats[t.id] = Array.from({ length: t.seats }, () => null);
  for (const g of GUESTS) {
    if (!g.table || !seats[g.table]) continue;
    const row = seats[g.table];
    const i = row.indexOf(null);
    if (i >= 0) row[i] = g.id;
  }
  return seats;
}

function cloneSeats(seats: Seats): Seats {
  const next: Seats = {};
  for (const k of Object.keys(seats)) next[k] = seats[k].slice();
  return next;
}

export function buildLocations(seats: Seats): Map<string, Location> {
  const m = new Map<string, Location>();
  for (const tableId of Object.keys(seats)) {
    seats[tableId].forEach((gid, index) => {
      if (gid) m.set(gid, { tableId, index });
    });
  }
  return m;
}

export type PlaceResult = { seats: Seats; ok: boolean; message: string };

export function applyPlace(seats: Seats, guestId: string, tableId: string, index?: number): PlaceResult {
  const g = GUEST_BY_ID.get(guestId);
  const t = TABLE_BY_ID.get(tableId);
  if (!g || !t) return { seats, ok: false, message: "That guest or table does not exist" };
  const next = cloneSeats(seats);
  const row = next[tableId];
  const from = buildLocations(next).get(guestId) ?? null;
  let target = index;
  if (target === undefined) {
    if (from && from.tableId === tableId) {
      return { seats, ok: false, message: `${g.name} is already at ${t.name}` };
    }
    target = row.indexOf(null);
    if (target < 0) return { seats, ok: false, message: `${t.name} is full` };
  }
  if (target < 0 || target >= row.length) return { seats, ok: false, message: "No such seat" };
  const occupantId = row[target];
  if (occupantId === guestId) return { seats, ok: false, message: `${g.name} already sits there` };
  if (from) next[from.tableId][from.index] = null;
  row[target] = guestId;
  let message: string;
  if (occupantId) {
    const o = GUEST_BY_ID.get(occupantId)?.name ?? "The other guest";
    if (from) {
      next[from.tableId][from.index] = occupantId;
      message = `Swapped ${g.name} and ${o}`;
    } else {
      message = `${g.name} took seat ${target + 1} at ${t.name}; ${o} is now unseated`;
    }
  } else if (from) {
    message = `Moved ${g.name} to ${t.name}, seat ${target + 1}`;
  } else {
    message = `Seated ${g.name} at ${t.name}, seat ${target + 1}`;
  }
  return { seats: next, ok: true, message };
}

export function applyUnseat(seats: Seats, guestId: string): PlaceResult {
  const g = GUEST_BY_ID.get(guestId);
  const from = buildLocations(seats).get(guestId);
  if (!g || !from) return { seats, ok: false, message: "That guest is not seated" };
  const next = cloneSeats(seats);
  next[from.tableId][from.index] = null;
  const t = TABLE_BY_ID.get(from.tableId);
  return { seats: next, ok: true, message: `Unseated ${g.name}${t ? ` from ${t.name}` : ""}` };
}

/* ---------- rules ---------- */

export type RuleStatus = "ok" | "broken" | "open";
export type RuleResult = {
  index: number;
  rule: Rule;
  status: RuleStatus;
  title: string;
  guestIds: string[];
  tableIds: string[];
  message: string;
};

const fmtM = (n: number) => `${n.toFixed(1)} m`;
const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);
const fixtureCenter = (f: Fixture) => ({ x: f.x + f.w / 2, y: f.y + f.h / 2 });
const guestName = (id: string) => GUEST_BY_ID.get(id)?.name ?? id;
const tableName = (id: string) => TABLE_BY_ID.get(id)?.name ?? id;

function nearInfo(tableId: string) {
  const t = TABLE_BY_ID.get(tableId);
  const door = FIXTURES.find((f) => f.kind === "door");
  const stage = FIXTURES.find((f) => f.kind === "stage");
  if (!t) return { door: 0, band: Infinity, ok: false };
  const c = tableGeometry(t).center;
  const dd = door ? dist(c, fixtureCenter(door)) : 0;
  const db = stage ? dist(c, fixtureCenter(stage)) : Infinity;
  return { door: dd, band: db, ok: dd <= NEAR_DOOR_MAX_M && db >= BAND_MIN_M };
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export function evaluateRules(seats: Seats): RuleResult[] {
  const loc = buildLocations(seats);
  const freeAt = (tableId: string) => (seats[tableId] ?? []).filter((x) => x === null).length;
  return RULES.map((rule, index): RuleResult => {
    const ids = rule.guests;
    const names = ids.map(guestName);
    const base = { index, rule, guestIds: ids };
    if (rule.kind === "together") {
      const unseated = ids.filter((id) => !loc.has(id));
      if (unseated.length === 0) {
        const tables = Array.from(new Set(ids.map((id) => loc.get(id)!.tableId)));
        if (tables.length === 1) {
          return { ...base, title: "Keep together", status: "ok", tableIds: tables, message: `${joinNames(names)} are both at ${tableName(tables[0])}.` };
        }
        const where = ids.map((id) => `${guestName(id)} at ${tableName(loc.get(id)!.tableId)}`);
        return { ...base, title: "Keep together", status: "broken", tableIds: tables, message: `Split up: ${joinNames(where)}.` };
      }
      if (unseated.length === ids.length) {
        return { ...base, title: "Keep together", status: "open", tableIds: [], message: "Neither is seated yet." };
      }
      const seatedId = ids.find((id) => loc.has(id))!;
      const tid = loc.get(seatedId)!.tableId;
      const free = freeAt(tid);
      return {
        ...base,
        title: "Keep together",
        status: "open",
        tableIds: [],
        message: `${guestName(seatedId)} is at ${tableName(tid)}; seat ${joinNames(unseated.map(guestName))} there too (${free === 0 ? "the table is full" : `${free} free`}).`,
      };
    }
    if (rule.kind === "apart") {
      const locs = ids.map((id) => loc.get(id));
      if (locs.some((l) => !l)) {
        return { ...base, title: "Keep apart", status: "open", tableIds: [], message: "Not both seated yet, so nothing to check." };
      }
      const tables = locs.map((l) => l!.tableId);
      if (new Set(tables).size < tables.length) {
        return { ...base, title: "Keep apart", status: "broken", tableIds: [tables[0]], message: `${joinNames(names)} are both at ${tableName(tables[0])}.` };
      }
      return { ...base, title: "Keep apart", status: "ok", tableIds: [], message: `At different tables (${joinNames(tables.map(tableName))}).` };
    }
    // near: the garden doors and away from the band
    const workable = TABLES.filter((t) => nearInfo(t.id).ok).map((t) => t.name);
    const hint = workable.length ? ` Tables that work: ${workable.join(", ")}.` : "";
    const l = loc.get(ids[0]);
    if (!l) {
      return { ...base, title: "Seat near", status: "open", tableIds: [], message: `Not seated yet.${hint}` };
    }
    const info = nearInfo(l.tableId);
    const tn = tableName(l.tableId);
    if (info.ok) {
      return {
        ...base,
        title: "Seat near",
        status: "ok",
        tableIds: [],
        message: `${tn} is ${fmtM(info.door)} from the garden doors and ${fmtM(info.band)} from the band.`,
      };
    }
    const problems: string[] = [];
    if (info.door > NEAR_DOOR_MAX_M) problems.push(`${fmtM(info.door)} from the garden doors (aim for ${NEAR_DOOR_MAX_M} m or less)`);
    if (info.band < BAND_MIN_M) problems.push(`${fmtM(info.band)} from the band (aim for ${BAND_MIN_M} m or more)`);
    return {
      ...base,
      title: "Seat near",
      status: "broken",
      tableIds: [l.tableId],
      message: `${tn} is ${problems.join(" and ")}.${hint}`,
    };
  });
}

/* ---------- counts ---------- */

export type Counts = {
  attending: number;
  seatedAttending: number;
  unseatedAttending: number;
  seatedTotal: number;
  capacity: number;
  free: number;
  awaiting: number;
  awaitingUnseated: number;
  perTable: Record<string, { filled: number; total: number }>;
};

export function computeCounts(seats: Seats): Counts {
  const loc = buildLocations(seats);
  const perTable: Counts["perTable"] = {};
  let capacity = 0;
  let seatedTotal = 0;
  for (const t of TABLES) {
    const filled = (seats[t.id] ?? []).filter(Boolean).length;
    perTable[t.id] = { filled, total: t.seats };
    capacity += t.seats;
    seatedTotal += filled;
  }
  const yes = GUESTS.filter((g) => g.rsvp === "yes");
  const awaiting = GUESTS.filter((g) => g.rsvp === "maybe" || g.rsvp === "pending");
  return {
    attending: yes.length,
    seatedAttending: yes.filter((g) => loc.has(g.id)).length,
    unseatedAttending: yes.filter((g) => !loc.has(g.id)).length,
    seatedTotal,
    capacity,
    free: capacity - seatedTotal,
    awaiting: awaiting.length,
    awaitingUnseated: awaiting.filter((g) => !loc.has(g.id)).length,
    perTable,
  };
}
