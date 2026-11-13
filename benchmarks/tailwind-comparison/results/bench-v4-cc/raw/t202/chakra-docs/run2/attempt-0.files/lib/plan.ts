import {
  fixtures,
  guests,
  rules,
  tables,
  type Guest,
  type Rule,
  type TableDef,
} from "./data";

/** SVG units per metre on the floor plan. */
export const SCALE = 50;
export const SEAT_R = 0.4;
export const TABLE_R = 0.85;
export const RING_R = 1.35;

export type Seating = Record<string, { table: string; seat: number }>;

export const guestById = new Map<string, Guest>(guests.map((g) => [g.id, g]));
export const tableById = new Map<string, TableDef>(tables.map((t) => [t.id, t]));

export function initialSeating(): Seating {
  const next: Record<string, number> = {};
  const out: Seating = {};
  for (const g of guests) {
    if (!g.table) continue;
    const i = next[g.table] ?? 0;
    next[g.table] = i + 1;
    out[g.id] = { table: g.table, seat: i };
  }
  return out;
}

export interface SeatPos {
  index: number;
  x: number;
  y: number;
}

/** Seat centres in metres. Round tables ring the table; the top table seats one side, facing the room. */
export function seatPositions(t: TableDef): SeatPos[] {
  if (t.shape === "long") {
    return Array.from({ length: t.seats }, (_, i) => ({
      index: i,
      x: t.x + 0.5 + i,
      y: t.y - 0.5,
    }));
  }
  return Array.from({ length: t.seats }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
    return { index: i, x: t.x + RING_R * Math.cos(a), y: t.y + RING_R * Math.sin(a) };
  });
}

export function tableCenter(t: TableDef): { x: number; y: number } {
  return t.shape === "long" ? { x: t.x + t.seats / 2, y: t.y + 0.5 } : { x: t.x, y: t.y };
}

export function occupancy(seating: Seating): Record<string, (string | null)[]> {
  const out: Record<string, (string | null)[]> = {};
  for (const t of tables) out[t.id] = Array.from({ length: t.seats }, () => null);
  for (const [gid, s] of Object.entries(seating)) {
    const row = out[s.table];
    if (row && s.seat >= 0 && s.seat < row.length) row[s.seat] = gid;
  }
  return out;
}

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

const NEAR_DOOR_MAX_M = 4;
const FAR_BAND_MIN_M = 6;

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function fixtureCenter(kind: "door" | "stage") {
  const f = fixtures.find((x) => x.kind === kind);
  return f ? { x: f.x + f.w / 2, y: f.y + f.h / 2 } : null;
}

const nm = (id: string) => guestById.get(id)?.name ?? id;
const tn = (id: string) => tableById.get(id)?.name ?? id;
const join = (parts: string[]) =>
  parts.length <= 1 ? (parts[0] ?? "") : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;

export function evaluateRules(seating: Seating): RuleResult[] {
  const occ = occupancy(seating);
  const door = fixtureCenter("door");
  const band = fixtureCenter("stage");

  return rules.map((rule, i): RuleResult => {
    const id = `r-${i + 1}`;
    const names = rule.guests.map(nm);
    const seated = rule.guests.filter((g) => seating[g]);
    const guestIds = seated;

    if (rule.kind === "together") {
      const title = `Keep together: ${join(names)}`;
      const tablesUsed = Array.from(new Set(seated.map((g) => seating[g].table)));
      if (seated.length < rule.guests.length) {
        const missing = rule.guests.filter((g) => !seating[g]).map(nm);
        return {
          id, rule, status: "open", title,
          detail:
            seated.length === 0
              ? "Neither is seated yet."
              : `${join(missing)} still needs a seat, ideally at ${tn(tablesUsed[0])}.`,
          tableIds: [], guestIds,
        };
      }
      if (tablesUsed.length === 1) {
        return { id, rule, status: "ok", title, detail: `Together at ${tn(tablesUsed[0])}.`, tableIds: [], guestIds };
      }
      return {
        id, rule, status: "broken", title,
        detail: `Split: ${rule.guests.map((g) => `${nm(g)} at ${tn(seating[g].table)}`).join(", ")}.`,
        tableIds: tablesUsed, guestIds,
      };
    }

    if (rule.kind === "apart") {
      const title = `Keep apart: ${join(names)}`;
      if (seated.length < rule.guests.length) {
        return {
          id, rule, status: "open", title,
          detail: seated.length === 0 ? "Neither is seated yet." : `${nm(seated[0])} is at ${tn(seating[seated[0]].table)}; keep ${join(rule.guests.filter((g) => g !== seated[0]).map(nm))} away from it.`,
          tableIds: [], guestIds,
        };
      }
      const tablesUsed = Array.from(new Set(seated.map((g) => seating[g].table)));
      if (tablesUsed.length < seated.length) {
        return { id, rule, status: "broken", title, detail: `Both are at ${tn(tablesUsed[0])}.`, tableIds: tablesUsed, guestIds };
      }
      return {
        id, rule, status: "ok", title,
        detail: rule.guests.map((g) => `${nm(g)} at ${tn(seating[g].table)}`).join(", ") + ".",
        tableIds: [], guestIds,
      };
    }

    // near: close to the garden doors, away from the band
    const gid = rule.guests[0];
    const title = `Seat near the garden doors: ${nm(gid)}`;
    const free = tables
      .filter((t) => occ[t.id].some((s) => s === null) && !(seating[gid] && seating[gid].table === t.id))
      .map((t) => {
        const c = tableCenter(t);
        return { t, d: door ? dist(c, door) : 0, b: band ? dist(c, band) : 99 };
      })
      .filter((x) => x.d <= NEAR_DOOR_MAX_M && x.b >= FAR_BAND_MIN_M)
      .sort((a, b) => a.d - b.d);
    const hint = free.length ? ` ${free[0].t.name} (${free[0].d.toFixed(1)} m from the doors) has a free seat.` : "";
    const s = seating[gid];
    if (!s || !door || !band) {
      return { id, rule, status: "open", title, detail: `Not seated yet.${hint}`, tableIds: [], guestIds };
    }
    const t = tableById.get(s.table);
    if (!t) return { id, rule, status: "open", title, detail: "Not seated yet.", tableIds: [], guestIds };
    const c = tableCenter(t);
    const dd = dist(c, door);
    const db = dist(c, band);
    if (dd <= NEAR_DOOR_MAX_M && db >= FAR_BAND_MIN_M) {
      return {
        id, rule, status: "ok", title,
        detail: `${t.name} is ${dd.toFixed(1)} m from the garden doors and ${db.toFixed(1)} m from the band.`,
        tableIds: [], guestIds,
      };
    }
    const why =
      dd > NEAR_DOOR_MAX_M
        ? `${t.name} is ${dd.toFixed(1)} m from the garden doors (aim for ${NEAR_DOOR_MAX_M} m or less).`
        : `${t.name} is only ${db.toFixed(1)} m from the band (aim for ${FAR_BAND_MIN_M} m or more).`;
    return { id, rule, status: "broken", title, detail: `${why}${hint}`, tableIds: [t.id], guestIds };
  });
}

export function brokenSets(results: RuleResult[]) {
  const tablesSet = new Set<string>();
  const guestsSet = new Set<string>();
  for (const r of results) {
    if (r.status !== "broken") continue;
    r.tableIds.forEach((t) => tablesSet.add(t));
    r.guestIds.forEach((g) => guestsSet.add(g));
  }
  return { tables: tablesSet, guests: guestsSet };
}

/** Number of guests in each meal group. `null` key is the standard menu. */
export function mealKey(g: Guest) {
  return g.diet ?? "Standard menu";
}

export const dietList = Array.from(
  new Set(guests.map((g) => g.diet).filter((d): d is string => !!d)),
).sort((a, b) => a.localeCompare(b));

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T12:00:00Z`));
}

export function initials(name: string) {
  const parts = name.replace(/^Avó\s+/, "").split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}
