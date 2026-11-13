import {
  fixtures,
  guests,
  rules,
  tables,
  type Guest,
  type Rule,
  type TableDef,
} from "./data";

export interface SeatAssignment {
  table: string;
  seat: number;
}
export type Seats = Record<string, SeatAssignment>;
export type Occupants = Record<string, (string | null)[]>;

export const SEAT_R = 0.34;

export const guestById = new Map<string, Guest>(guests.map((g) => [g.id, g]));
export const tableById = new Map<string, TableDef>(tables.map((t) => [t.id, t]));
export const TOTAL_SEATS = tables.reduce((n, t) => n + t.seats, 0);

export function initialSeats(): Seats {
  const next: Record<string, number> = {};
  const out: Seats = {};
  for (const g of guests) {
    if (!g.table) continue;
    const i = next[g.table] ?? 0;
    next[g.table] = i + 1;
    out[g.id] = { table: g.table, seat: i };
  }
  return out;
}

export function occupants(seats: Seats): Occupants {
  const o: Occupants = {};
  for (const t of tables) o[t.id] = Array.from({ length: t.seats }, () => null);
  for (const [id, a] of Object.entries(seats)) {
    const row = o[a.table];
    if (row) row[a.seat] = id;
  }
  return o;
}

export function freeSeats(occ: Occupants, tableId: string): number {
  return (occ[tableId] ?? []).filter((x) => x === null).length;
}

export interface SeatLayout {
  seats: { x: number; y: number }[];
  ring: number;
  body: { shape: "round"; r: number } | { shape: "long"; w: number; h: number };
}

export function layoutFor(t: TableDef): SeatLayout {
  if (t.shape === "long") {
    const gap = 0.85;
    const w = t.seats * gap;
    return {
      ring: 0,
      body: { shape: "long", w, h: 0.8 },
      seats: Array.from({ length: t.seats }, (_, i) => ({
        x: (i - (t.seats - 1) / 2) * gap,
        y: -0.8,
      })),
    };
  }
  const ring = Math.max(1.1, t.seats * 0.16);
  return {
    ring,
    body: { shape: "round", r: ring - 0.5 },
    seats: Array.from({ length: t.seats }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
      return { x: Math.cos(a) * ring, y: Math.sin(a) * ring };
    }),
  };
}

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export interface PlaceResult {
  seats: Seats;
  ok: boolean;
  message: string;
}

export function placeGuest(
  seats: Seats,
  guestId: string,
  tableId: string,
  seatIdx?: number,
): PlaceResult {
  const guest = guestById.get(guestId);
  const table = tableById.get(tableId);
  if (!guest || !table) return { seats, ok: false, message: "Could not place that guest." };
  const occ = occupants(seats)[tableId] ?? [];
  const prev = seats[guestId];
  let target = seatIdx ?? -1;
  if (seatIdx === undefined) {
    if (prev && prev.table === tableId) {
      return { seats, ok: false, message: `${guest.name} is already at ${table.name}.` };
    }
    target = occ.indexOf(null);
    if (target < 0) return { seats, ok: false, message: `${table.name} is full.` };
  }
  const other = occ[target] ?? null;
  if (other === guestId) return { seats, ok: false, message: `${guest.name} is already in that seat.` };
  const next: Seats = { ...seats, [guestId]: { table: tableId, seat: target } };
  let message = `${guest.name} seated at ${table.name}, seat ${target + 1}.`;
  if (other) {
    const otherGuest = guestById.get(other);
    if (prev) {
      next[other] = prev;
      const prevTable = tableById.get(prev.table);
      message = `${guest.name} and ${otherGuest?.name ?? "guest"} swapped seats (${table.name} and ${prevTable?.name ?? "table"}).`;
    } else {
      delete next[other];
      message = `${guest.name} seated at ${table.name}; ${otherGuest?.name ?? "guest"} is now unseated.`;
    }
  }
  return { seats: next, ok: true, message };
}

export function unseatGuest(seats: Seats, guestId: string): PlaceResult {
  const guest = guestById.get(guestId);
  if (!seats[guestId]) return { seats, ok: false, message: `${guest?.name ?? "Guest"} has no seat.` };
  const next = { ...seats };
  delete next[guestId];
  return { seats: next, ok: true, message: `${guest?.name ?? "Guest"} unseated.` };
}

export type RuleStatus = "ok" | "open" | "broken";

export interface RuleResult {
  id: string;
  kind: Rule["kind"];
  status: RuleStatus;
  heading: string;
  detail: string;
  note: string;
  flag?: string;
  tables: string[];
}

const NEAR_DOOR_MAX = 5;
const NEAR_BAND_MIN = 8;

function centre(f: { x: number; y: number; w: number; h: number }) {
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function evaluateRules(seats: Seats): RuleResult[] {
  const door = fixtures.find((f) => f.kind === "door");
  const band = fixtures.find((f) => f.kind === "stage");
  const tn = (id: string) => tableById.get(id)?.name ?? id;
  return rules.map((rule, i): RuleResult => {
    const names = rule.guests.map((id) => guestById.get(id)?.name ?? id);
    const base = { id: `r-${i}`, kind: rule.kind, note: rule.note, flag: rule.flag };
    const a = rule.guests[0] ? seats[rule.guests[0]] : undefined;
    const b = rule.guests[1] ? seats[rule.guests[1]] : undefined;
    if (rule.kind === "together") {
      const heading = `Keep together: ${names.join(" and ")}`;
      if (a && b) {
        return a.table === b.table
          ? { ...base, heading, status: "ok", detail: `Both at ${tn(a.table)}.`, tables: [] }
          : {
              ...base,
              heading,
              status: "broken",
              detail: `${names[0]} is at ${tn(a.table)}, ${names[1]} at ${tn(b.table)}.`,
              tables: [a.table, b.table],
            };
      }
      if (a || b) {
        const seated = a ?? b;
        const who = a ? 0 : 1;
        return {
          ...base,
          heading,
          status: "open",
          detail: `${names[who]} is at ${tn(seated?.table ?? "")}; ${names[1 - who]} still needs a seat.`,
          tables: seated ? [seated.table] : [],
        };
      }
      return { ...base, heading, status: "open", detail: "Neither is seated yet.", tables: [] };
    }
    if (rule.kind === "apart") {
      const heading = `Keep apart: ${names.join(" and ")}`;
      if (a && b && a.table === b.table) {
        return {
          ...base,
          heading,
          status: "broken",
          detail: `Both are at ${tn(a.table)}.`,
          tables: [a.table],
        };
      }
      return {
        ...base,
        heading,
        status: "ok",
        detail: a && b ? `At ${tn(a.table)} and ${tn(b.table)}.` : "Not both seated yet, nothing to clash.",
        tables: [],
      };
    }
    const heading = `Seat near the garden doors: ${names[0] ?? ""}`;
    if (!a) {
      return { ...base, heading, status: "open", detail: "Not seated yet.", tables: [] };
    }
    const t = tableById.get(a.table);
    if (!t || !door || !band) {
      return { ...base, heading, status: "ok", detail: "", tables: [] };
    }
    const dDoor = dist(t, centre(door));
    const dBand = dist(t, centre(band));
    const good = dDoor <= NEAR_DOOR_MAX && dBand >= NEAR_BAND_MIN;
    return {
      ...base,
      heading,
      status: good ? "ok" : "broken",
      detail: `${t.name} is ${dDoor.toFixed(1)} m from the garden doors and ${dBand.toFixed(1)} m from the band${
        good ? "." : `. Aim for within ${NEAR_DOOR_MAX} m of the doors and ${NEAR_BAND_MIN} m or more from the band.`
      }`,
      tables: good ? [] : [a.table],
    };
  });
}
