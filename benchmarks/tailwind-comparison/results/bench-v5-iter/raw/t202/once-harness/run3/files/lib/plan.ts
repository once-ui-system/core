import { FIXTURES, GUESTS, RULES, TABLES, type Guest, type Rule, type TableDef } from "./data";

export const SEAT_D = 0.85;
export const NEAR_DOOR_MAX_M = 4;
export const AWAY_BAND_MIN_M = 8;

export type Seat = { table: string; seat: number };
export type Assignment = Record<string, Seat | null>;

const HEAD_ORDER = [3, 4, 2, 5, 1, 6, 0, 7];

export function initialAssignment(): Assignment {
  const next: Record<string, number> = {};
  const out: Assignment = {};
  for (const guest of GUESTS) {
    if (!guest.table) {
      out[guest.id] = null;
      continue;
    }
    const i = next[guest.table] ?? 0;
    next[guest.table] = i + 1;
    const seat = guest.table === "t-head" ? (HEAD_ORDER[i] ?? i) : i;
    out[guest.id] = { table: guest.table, seat };
  }
  return out;
}

export type TableGeo = {
  cx: number;
  cy: number;
  left: number;
  top: number;
  w: number;
  h: number;
  seats: { x: number; y: number }[];
};

export function tableGeo(t: TableDef): TableGeo {
  if (t.shape === "long") {
    const w = t.seats;
    const h = 1.1;
    return {
      cx: t.x + w / 2,
      cy: t.y + h / 2,
      left: t.x,
      top: t.y,
      w,
      h,
      seats: Array.from({ length: t.seats }, (_, i) => ({ x: t.x + 0.5 + i, y: t.y - 0.55 })),
    };
  }
  const r = t.seats > 6 ? 1 : 0.85;
  const ring = r + 0.45;
  return {
    cx: t.x,
    cy: t.y,
    left: t.x - r,
    top: t.y - r,
    w: r * 2,
    h: r * 2,
    seats: Array.from({ length: t.seats }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
      return { x: t.x + ring * Math.cos(a), y: t.y + ring * Math.sin(a) };
    }),
  };
}

export function buildSeatMap(assign: Assignment): Record<string, (string | null)[]> {
  const map: Record<string, (string | null)[]> = {};
  for (const t of TABLES) map[t.id] = Array.from({ length: t.seats }, () => null);
  for (const [guestId, seat] of Object.entries(assign)) {
    if (seat && map[seat.table]) map[seat.table][seat.seat] = guestId;
  }
  return map;
}

export type RuleState = "ok" | "pending" | "broken";

export type RuleResult = {
  index: number;
  kind: Rule["kind"];
  title: string;
  state: RuleState;
  message: string;
  note: string;
  tables: string[];
  guests: string[];
};

const GUEST_BY_ID: Record<string, Guest> = Object.fromEntries(GUESTS.map((x) => [x.id, x]));
const TABLE_BY_ID: Record<string, TableDef> = Object.fromEntries(TABLES.map((x) => [x.id, x]));

function distance(t: TableDef, kind: "door" | "stage"): number {
  const f = FIXTURES.find((x) => x.kind === kind);
  if (!f) return 0;
  const geo = tableGeo(t);
  return Math.hypot(geo.cx - (f.x + f.w / 2), geo.cy - (f.y + f.h / 2));
}

const m1 = (n: number) => `${n.toFixed(1)} m`;

export function evaluateRules(assign: Assignment): RuleResult[] {
  return RULES.map((rule, index) => {
    const names = rule.guests.map((id) => GUEST_BY_ID[id]?.name ?? id);
    const seats = rule.guests.map((id) => assign[id] ?? null);
    const base = { index, kind: rule.kind, note: rule.note, guests: rule.guests };
    const tableName = (s: Seat | null) => (s ? (TABLE_BY_ID[s.table]?.name ?? s.table) : "");
    const placed = seats.filter((s): s is Seat => s !== null);

    if (rule.kind === "together") {
      const title = "Keep together";
      if (placed.length < seats.length) {
        const missing = names.filter((_, i) => !seats[i]);
        return {
          ...base,
          title,
          state: "pending" as RuleState,
          message: `Waiting for a seat: ${missing.join(", ")}`,
          tables: placed.map((s) => s.table),
        };
      }
      const same = placed.every((s) => s.table === placed[0].table);
      return {
        ...base,
        title,
        state: (same ? "ok" : "broken") as RuleState,
        message: same
          ? `${names.join(" and ")} share ${tableName(placed[0])}`
          : names.map((n, i) => `${n} is at ${tableName(seats[i])}`).join("; "),
        tables: Array.from(new Set(placed.map((s) => s.table))),
      };
    }

    if (rule.kind === "apart") {
      const title = "Keep apart";
      const tables = Array.from(new Set(placed.map((s) => s.table)));
      const clash = placed.length === seats.length && tables.length < placed.length;
      if (clash) {
        return {
          ...base,
          title,
          state: "broken" as RuleState,
          message: `${names.join(" and ")} are both at ${tableName(placed[0])}`,
          tables,
        };
      }
      return {
        ...base,
        title,
        state: "ok" as RuleState,
        message:
          placed.length === seats.length
            ? `${names[0]} at ${tableName(seats[0])}, ${names[1]} at ${tableName(seats[1])}`
            : `${names.filter((_, i) => seats[i]).join(", ") || "Neither guest"} seated, no clash`,
        tables,
      };
    }

    const title = "Seat near the garden doors";
    const seat = seats[0];
    if (!seat) {
      return {
        ...base,
        title,
        state: "pending" as RuleState,
        message: `Waiting for a seat: ${names[0]}`,
        tables: [],
      };
    }
    const table = TABLE_BY_ID[seat.table];
    const door = distance(table, "door");
    const band = distance(table, "stage");
    const problems: string[] = [];
    if (door > NEAR_DOOR_MAX_M) {
      problems.push(`${m1(door)} from the garden doors (needs ${NEAR_DOOR_MAX_M} m or less)`);
    }
    if (band < AWAY_BAND_MIN_M) {
      problems.push(`only ${m1(band)} from the band (needs ${AWAY_BAND_MIN_M} m or more)`);
    }
    return {
      ...base,
      title,
      state: (problems.length ? "broken" : "ok") as RuleState,
      message: problems.length
        ? `${table.name} is ${problems.join(" and ")}`
        : `${table.name} is ${m1(door)} from the garden doors and ${m1(band)} from the band`,
      tables: [seat.table],
    };
  });
}

export function dietSummary(ids: (string | null)[]): { diet: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const id of ids) {
    const diet = id ? GUEST_BY_ID[id]?.diet : null;
    if (diet) counts.set(diet, (counts.get(diet) ?? 0) + 1);
  }
  return Array.from(counts, ([diet, count]) => ({ diet, count }));
}
