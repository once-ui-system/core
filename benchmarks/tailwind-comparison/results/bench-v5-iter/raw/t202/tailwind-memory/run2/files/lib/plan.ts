import { fixtures, guestById, guests, rules, tableById, tables, type Table } from "./data";

export type SeatMap = Record<string, (string | null)[]>;
export type Location = { tableId: string; seat: number };

const HEAD_ORDER = [1, 2, 0, 3, 5, 6, 4, 7];

export function initialSeatMap(): SeatMap {
  const map: SeatMap = {};
  for (const t of tables) {
    const seats: (string | null)[] = Array.from({ length: t.seats }, () => null);
    const order = t.shape === "long" ? HEAD_ORDER : seats.map((_, i) => i);
    guests
      .filter((g) => g.table === t.id)
      .forEach((g, n) => {
        seats[order[n]] = g.id;
      });
    map[t.id] = seats;
  }
  return map;
}

export function locate(map: SeatMap): Record<string, Location> {
  const out: Record<string, Location> = {};
  for (const [tableId, seats] of Object.entries(map)) {
    seats.forEach((gid, seat) => {
      if (gid) out[gid] = { tableId, seat };
    });
  }
  return out;
}

function cloneMap(map: SeatMap): SeatMap {
  const next: SeatMap = {};
  for (const [k, v] of Object.entries(map)) next[k] = [...v];
  return next;
}

export interface SeatResult {
  map: SeatMap;
  ok: boolean;
  displaced?: string;
}

export function seatGuest(map: SeatMap, guestId: string, tableId: string, seat?: number): SeatResult {
  const target = map[tableId];
  if (!target) return { map, ok: false };
  const from = locate(map)[guestId];
  let idx = seat;
  if (idx === undefined) {
    if (from && from.tableId === tableId) return { map, ok: true };
    idx = target.indexOf(null);
    if (idx < 0) return { map, ok: false };
  }
  if (from && from.tableId === tableId && from.seat === idx) return { map, ok: true };
  const next = cloneMap(map);
  const occupant = next[tableId][idx];
  if (from) next[from.tableId][from.seat] = occupant;
  next[tableId][idx] = guestId;
  return { map: next, ok: true, displaced: !from && occupant ? occupant : undefined };
}

export function unseatGuest(map: SeatMap, guestId: string): SeatMap {
  const from = locate(map)[guestId];
  if (!from) return map;
  const next = cloneMap(map);
  next[from.tableId][from.seat] = null;
  return next;
}

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function tableDiameter(t: Table): number {
  return t.seats > 6 ? 1.7 : 1.4;
}

export function longTableLength(t: Table): number {
  return (t.seats / 2) * 1.1 + 0.2;
}

export function filled(map: SeatMap, tableId: string): number {
  return (map[tableId] ?? []).filter(Boolean).length;
}

// ---- rules ----

export type RuleStatus = "ok" | "broken" | "waiting";

export interface RuleResult {
  id: string;
  kind: "together" | "apart" | "near";
  label: string;
  title: string;
  note: string;
  status: RuleStatus;
  detail: string;
  guestIds: string[];
  tableIds: string[];
  warning?: string;
}

const NEAR_DOOR_M = 4;
const FAR_BAND_M = 6;

function fixtureCentre(kind: string) {
  const f = fixtures.find((x) => x.kind === kind);
  return f ? { x: f.x + f.w / 2, y: f.y + f.h / 2 } : { x: 0, y: 0 };
}

function dist(t: Table, p: { x: number; y: number }): number {
  return Math.hypot(t.x - p.x, t.y - p.y);
}

function noteWarning(ruleGuests: string[], note: string): string | undefined {
  const missing: string[] = [];
  for (const g of guests) {
    if (ruleGuests.includes(g.id)) continue;
    const first = g.name.split(" ")[0];
    if (first.length > 2 && new RegExp(`\\b${first}\\b`).test(note)) missing.push(g.name);
  }
  if (missing.length === 0) return undefined;
  return `The note mentions ${missing.join(", ")}, who is not part of this rule. Check the rule with the couple.`;
}

export function evaluateRules(map: SeatMap): RuleResult[] {
  const loc = locate(map);
  const door = fixtureCentre("door");
  const band = fixtureCentre("stage");
  const where = (id: string) => {
    const l = loc[id];
    return l ? tableById[l.tableId].name : "not seated";
  };

  return rules.map((r, i) => {
    const names = r.guests.map((id) => guestById[id].name);
    const base = {
      id: `rule-${i}`,
      kind: r.kind,
      note: r.note,
      guestIds: r.guests,
      warning: noteWarning(r.guests, r.note),
    };

    if (r.kind === "near") {
      const id = r.guests[0];
      const l = loc[id];
      const label = "Seat near the garden doors";
      if (!l) {
        return { ...base, label, title: names[0], status: "waiting" as const, tableIds: [], detail: `${names[0]} is not seated yet.` };
      }
      const t = tableById[l.tableId];
      const dd = dist(t, door);
      const db = dist(t, band);
      const ok = dd <= NEAR_DOOR_M && db >= FAR_BAND_M;
      if (ok) {
        return {
          ...base, label, title: names[0], status: "ok" as const, tableIds: [t.id],
          detail: `${names[0]} is at ${t.name}, ${dd.toFixed(1)} m from the garden doors and ${db.toFixed(1)} m from the band.`,
        };
      }
      const best = tables
        .filter((x) => dist(x, door) <= NEAR_DOOR_M && dist(x, band) >= FAR_BAND_M)
        .sort((a, b) => dist(a, door) - dist(b, door))[0];
      const tail = best ? ` ${best.name} is ${dist(best, door).toFixed(1)} m from the doors.` : "";
      return {
        ...base, label, title: names[0], status: "broken" as const, tableIds: [t.id],
        detail: `${names[0]} is at ${t.name}, ${dd.toFixed(1)} m from the garden doors${db < FAR_BAND_M ? ` and only ${db.toFixed(1)} m from the band` : ""}.${tail}`,
      };
    }

    const [a, b] = r.guests;
    const la = loc[a];
    const lb = loc[b];
    const label = r.kind === "together" ? "Keep together" : "Keep apart";
    const title = `${names[0]} & ${names[1]}`;
    const tableIds = Array.from(new Set([la?.tableId, lb?.tableId].filter((x): x is string => !!x)));

    if (!la || !lb) {
      const detail =
        !la && !lb
          ? "Neither is seated yet."
          : `${names[la ? 0 : 1]} is at ${where(la ? a : b)}; ${names[la ? 1 : 0]} is not seated yet.`;
      return { ...base, label, title, status: "waiting" as const, tableIds: [], detail };
    }
    const same = la.tableId === lb.tableId;
    if (r.kind === "together") {
      return same
        ? { ...base, label, title, status: "ok" as const, tableIds, detail: `Both at ${where(a)}.` }
        : { ...base, label, title, status: "broken" as const, tableIds, detail: `${names[0]} is at ${where(a)} and ${names[1]} at ${where(b)}.` };
    }
    return same
      ? { ...base, label, title, status: "broken" as const, tableIds, detail: `Both are at ${where(a)}.` }
      : { ...base, label, title, status: "ok" as const, tableIds, detail: `${names[0]} at ${where(a)}, ${names[1]} at ${where(b)}.` };
  });
}
