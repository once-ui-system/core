import {
  EVENT,
  FIXTURES,
  GUESTS,
  RULES,
  TABLES,
  type Fixture,
  type Guest,
  type Rule,
  type TableDef,
} from "./data";

export interface SeatRef {
  tableId: string;
  seat: number;
}
export type SeatMap = Record<string, SeatRef>;

export const guestById: Record<string, Guest> = Object.fromEntries(
  GUESTS.map((guest) => [guest.id, guest]),
);
export const tableById: Record<string, TableDef> = Object.fromEntries(
  TABLES.map((table) => [table.id, table]),
);

export function initialSeats(): SeatMap {
  const next: SeatMap = {};
  const counters: Record<string, number> = {};
  for (const guest of GUESTS) {
    if (!guest.table) continue;
    const n = counters[guest.table] ?? 0;
    counters[guest.table] = n + 1;
    next[guest.id] = { tableId: guest.table, seat: n };
  }
  return next;
}

export const PARTY_COLORS: Record<string, string> = {
  Couple: "grape",
  "Bride's family": "pink",
  "Groom's family": "blue",
  "University friends": "teal",
  "Work friends": "orange",
  "Groom's football club": "green",
  "Plus-ones": "gray",
};

export function partyColor(party: string): string {
  return PARTY_COLORS[party] ?? "gray";
}

export function initials(name: string): string {
  const words = name.split(" ").filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function eventDateLabel(): string {
  const [y, m, d] = EVENT.date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/* ---------- table geometry (metres, relative to the table centre) ---------- */

export const SEAT = 0.72;

export interface SeatPos {
  x: number;
  y: number;
}
export interface Geometry {
  w: number;
  h: number;
  bodyW: number;
  bodyH: number;
  round: boolean;
  seats: SeatPos[];
}

export function geometry(table: TableDef): Geometry {
  const n = table.seats;
  if (table.shape === "round") {
    const bodyR = n >= 8 ? 0.95 : 0.8;
    const ring = bodyR + 0.5;
    const size = (ring + SEAT / 2 + 0.05) * 2;
    const seats: SeatPos[] = [];
    for (let i = 0; i < n; i += 1) {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
      seats.push({ x: ring * Math.cos(angle), y: ring * Math.sin(angle) });
    }
    return { w: size, h: size, bodyW: bodyR * 2, bodyH: bodyR * 2, round: true, seats };
  }
  const perSide = Math.ceil(n / 2);
  const pitch = 1.15;
  const bodyW = perSide * pitch + 0.2;
  const bodyH = 0.9;
  const offY = bodyH / 2 + SEAT / 2 + 0.08;
  const seats: SeatPos[] = [];
  for (let i = 0; i < n; i += 1) {
    const top = i < perSide;
    const j = top ? i : i - perSide;
    seats.push({
      x: -bodyW / 2 + 0.1 + pitch * (j + 0.5),
      y: top ? -offY : offY,
    });
  }
  return {
    w: bodyW + 0.3,
    h: 2 * (offY + SEAT / 2 + 0.05),
    bodyW,
    bodyH,
    round: false,
    seats,
  };
}

/* ---------- rules ---------- */

export type RuleStatus = "ok" | "broken" | "open";

export interface RuleResult {
  index: number;
  rule: Rule;
  label: string;
  names: string[];
  status: RuleStatus;
  tableIds: string[];
  message: string;
}

const NEAR_MAX_M = 4;
const BAND_MIN_M = 6;

function centre(f: Fixture) {
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}
function distance(t: TableDef, f: Fixture) {
  const c = centre(f);
  return Math.hypot(t.x - c.x, t.y - c.y);
}

export function evaluateRules(seats: SeatMap): RuleResult[] {
  const door = FIXTURES.find((f) => f.kind === "door");
  const band = FIXTURES.find((f) => f.kind === "stage");

  return RULES.map((rule, index): RuleResult => {
    const people = rule.guests.map((id) => guestById[id]);
    const names = people.map((p) => p.name);
    const tables = people.map((p) => {
      const ref = seats[p.id];
      return ref ? tableById[ref.tableId] : null;
    });
    const unplaced = people.filter((_, i) => !tables[i]).map((p) => p.name);

    if (rule.kind === "near") {
      const table = tables[0];
      const label = "Seat near the garden doors";
      if (!table) {
        return {
          index,
          rule,
          label,
          names,
          status: "open",
          tableIds: [],
          message: `${names[0]} still needs a seat.`,
        };
      }
      const dDoor = door ? distance(table, door) : 0;
      const dBand = band ? distance(table, band) : Infinity;
      if (dDoor > NEAR_MAX_M) {
        return {
          index,
          rule,
          label,
          names,
          status: "broken",
          tableIds: [table.id],
          message: `${table.name} is ${dDoor.toFixed(1)} m from the garden doors (aim for ${NEAR_MAX_M} m or less).`,
        };
      }
      if (dBand < BAND_MIN_M) {
        return {
          index,
          rule,
          label,
          names,
          status: "broken",
          tableIds: [table.id],
          message: `${table.name} is only ${dBand.toFixed(1)} m from the band.`,
        };
      }
      return {
        index,
        rule,
        label,
        names,
        status: "ok",
        tableIds: [],
        message: `${table.name} is ${dDoor.toFixed(1)} m from the garden doors and ${dBand.toFixed(1)} m from the band.`,
      };
    }

    if (rule.kind === "together") {
      const label = "Keep together";
      if (unplaced.length > 0) {
        return {
          index,
          rule,
          label,
          names,
          status: "open",
          tableIds: [],
          message:
            unplaced.length === people.length
              ? "Neither has a seat yet."
              : `${unplaced.join(", ")} still needs a seat.`,
        };
      }
      const ids = tables.map((t) => (t ? t.id : ""));
      const same = ids.every((id) => id === ids[0]);
      if (same) {
        return {
          index,
          rule,
          label,
          names,
          status: "ok",
          tableIds: [],
          message: `Together at ${tables[0]?.name ?? ""}.`,
        };
      }
      return {
        index,
        rule,
        label,
        names,
        status: "broken",
        tableIds: Array.from(new Set(ids)),
        message: people.map((p, i) => `${p.name} at ${tables[i]?.name ?? ""}`).join(", ") + ".",
      };
    }

    // apart
    const label = "Keep apart";
    const placedIds = tables.filter((t): t is TableDef => t !== null).map((t) => t.id);
    const clash = placedIds.find((id, i) => placedIds.indexOf(id) !== i);
    if (clash) {
      return {
        index,
        rule,
        label,
        names,
        status: "broken",
        tableIds: [clash],
        message: `Both are at ${tableById[clash].name}.`,
      };
    }
    return {
      index,
      rule,
      label,
      names,
      status: "ok",
      tableIds: [],
      message:
        unplaced.length > 0
          ? `Not at the same table (${unplaced.join(", ")} not seated yet).`
          : "At different tables.",
    };
  });
}

/* ---------- meals for the caterer ---------- */

export const STANDARD_MEAL = "Standard menu";
const DIET_ORDER = [
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Halal",
  "Gluten free",
  "Nut allergy",
  "Soft food",
  "Children's menu",
];

export interface MealRow {
  meal: string;
  special: boolean;
  confirmed: number;
  unconfirmed: number;
  seated: number;
}

export function mealCounts(seats: SeatMap): MealRow[] {
  const known = new Set([STANDARD_MEAL, ...DIET_ORDER]);
  const extra = Array.from(
    new Set(GUESTS.map((x) => x.diet).filter((d): d is string => !!d && !known.has(d))),
  );
  const keys = [STANDARD_MEAL, ...DIET_ORDER, ...extra];
  return keys
    .map((meal) => {
      const list = GUESTS.filter((x) => (x.diet ?? STANDARD_MEAL) === meal);
      return {
        meal,
        special: meal !== STANDARD_MEAL,
        confirmed: list.filter((x) => x.rsvp === "yes").length,
        unconfirmed: list.filter((x) => x.rsvp === "maybe" || x.rsvp === "pending").length,
        seated: list.filter((x) => seats[x.id]).length,
      };
    })
    .filter((row) => row.confirmed + row.unconfirmed > 0);
}
