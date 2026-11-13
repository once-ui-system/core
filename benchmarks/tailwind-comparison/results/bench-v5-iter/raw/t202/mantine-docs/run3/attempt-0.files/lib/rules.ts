import { FIXTURES, GUESTS, RULES, TABLES, type Rule, type TableDef } from "./data";

export type SeatMap = Record<string, { table: string; seat: number }>;

export type RuleStatus = "broken" | "ok" | "open";

export type RuleResult = {
  index: number;
  rule: Rule;
  title: string;
  status: RuleStatus;
  detail: string;
  tableIds: string[];
  guestIds: string[];
};

export const NEAR_DOOR_M = 4.5;
export const AWAY_FROM_BAND_M = 6;

export const guestById = new Map(GUESTS.map((g) => [g.id, g]));
export const tableById = new Map(TABLES.map((t) => [t.id, t]));

export function firstName(name: string): string {
  const parts = name.split(" ");
  return parts[0] === "Avó" ? "Avó Rosa" : (parts[0] ?? name);
}

/** Length of a long table along its axis: one metre per seat, all seats on one side. */
export function longLength(t: TableDef): number {
  return t.seats;
}

export function tableCentre(t: TableDef): { x: number; y: number } {
  if (t.shape === "long") return { x: t.x + longLength(t) / 2, y: t.y + 0.5 };
  return { x: t.x, y: t.y };
}

function fixtureCentre(kind: string): { x: number; y: number } {
  const f = FIXTURES.find((fx) => fx.kind === kind);
  if (!f) return { x: 0, y: 0 };
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function distanceToDoors(tableId: string): number {
  const t = tableById.get(tableId);
  return t ? dist(tableCentre(t), fixtureCentre("door")) : Infinity;
}

export function distanceToBand(tableId: string): number {
  const t = tableById.get(tableId);
  return t ? dist(tableCentre(t), fixtureCentre("stage")) : Infinity;
}

const nameOf = (id: string) => guestById.get(id)?.name ?? id;
const tableName = (id: string) => tableById.get(id)?.name ?? id;
const m = (n: number) => `${n.toFixed(1)} m`;

export function evaluateRules(seats: SeatMap): RuleResult[] {
  return RULES.map((rule, index): RuleResult => {
    const where = rule.guests.map((id) => seats[id]?.table ?? null);
    const names = rule.guests.map(nameOf);
    const base = { index, rule, guestIds: rule.guests };

    if (rule.kind === "together") {
      const title = `Keep together: ${names.join(" and ")}`;
      const seated = where.filter((w): w is string => w !== null);
      if (seated.length === 0) {
        return { ...base, title, status: "open", detail: "Nobody is seated yet.", tableIds: [] };
      }
      if (seated.length < where.length) {
        const missing = rule.guests.filter((id) => !seats[id]).map(nameOf);
        return {
          ...base,
          title,
          status: "open",
          detail: `${missing.join(", ")} still needs a seat at ${tableName(seated[0] ?? "")}.`,
          tableIds: [...new Set(seated)],
        };
      }
      if (new Set(seated).size === 1) {
        return { ...base, title, status: "ok", detail: `Together at ${tableName(seated[0] ?? "")}.`, tableIds: [seated[0] ?? ""] };
      }
      return {
        ...base,
        title,
        status: "broken",
        detail: rule.guests.map((id, i) => `${nameOf(id)} is at ${tableName(where[i] ?? "")}`).join("; ") + ".",
        tableIds: [...new Set(seated)],
      };
    }

    if (rule.kind === "apart") {
      const title = `Keep apart: ${names.join(" and ")}`;
      const seated = where.filter((w): w is string => w !== null);
      const same = seated.length === where.length && new Set(seated).size === 1;
      if (same) {
        return { ...base, title, status: "broken", detail: `Both are at ${tableName(seated[0] ?? "")}.`, tableIds: [seated[0] ?? ""] };
      }
      if (seated.length < where.length) {
        return {
          ...base,
          title,
          status: "open",
          detail: seated.length === 0 ? "Neither is seated yet." : "Not at the same table so far; the other is not seated yet.",
          tableIds: [...new Set(seated)],
        };
      }
      return { ...base, title, status: "ok", detail: `At ${seated.map(tableName).join(" and ")}.`, tableIds: [...new Set(seated)] };
    }

    const title = `Seat near the garden doors: ${names[0] ?? ""}`;
    const tableId = where[0];
    if (!tableId) {
      return { ...base, title, status: "open", detail: "Not seated yet.", tableIds: [] };
    }
    const toDoor = distanceToDoors(tableId);
    const toBand = distanceToBand(tableId);
    if (toDoor > NEAR_DOOR_M) {
      return {
        ...base,
        title,
        status: "broken",
        detail: `${tableName(tableId)} is ${m(toDoor)} from the garden doors; aim for ${m(NEAR_DOOR_M)} or less.`,
        tableIds: [tableId],
      };
    }
    if (toBand < AWAY_FROM_BAND_M) {
      return {
        ...base,
        title,
        status: "broken",
        detail: `${tableName(tableId)} is only ${m(toBand)} from the band.`,
        tableIds: [tableId],
      };
    }
    return {
      ...base,
      title,
      status: "ok",
      detail: `${tableName(tableId)} is ${m(toDoor)} from the doors and ${m(toBand)} from the band.`,
      tableIds: [tableId],
    };
  });
}

export function initialSeats(): SeatMap {
  const next: SeatMap = {};
  const used: Record<string, number> = {};
  for (const g of GUESTS) {
    if (!g.table) continue;
    const n = used[g.table] ?? 0;
    used[g.table] = n + 1;
    next[g.id] = { table: g.table, seat: n };
  }
  return next;
}
