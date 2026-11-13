import {
  EVENT,
  FIXTURES,
  GUESTS,
  RULES,
  TABLES,
  type Guest,
  type RuleKind,
  type SeatTable,
} from "@/lib/data";

export type Assignments = Record<string, string | null>;

export const guestById = new Map<string, Guest>(GUESTS.map((g) => [g.id, g]));
export const tableById = new Map<string, SeatTable>(TABLES.map((t) => [t.id, t]));

export function initialAssignments(): Assignments {
  const a: Assignments = {};
  for (const g of GUESTS) a[g.id] = g.table;
  return a;
}

export function guestsAt(a: Assignments, tableId: string): Guest[] {
  return GUESTS.filter((g) => a[g.id] === tableId);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export interface Counts {
  attending: number;
  seated: number;
  unseated: number;
  provisional: number;
  capacity: number;
  byTable: Record<string, number>;
}

export function computeCounts(a: Assignments): Counts {
  const byTable: Record<string, number> = {};
  for (const t of TABLES) byTable[t.id] = 0;
  let attending = 0;
  let seated = 0;
  let provisional = 0;
  for (const g of GUESTS) {
    const tid = a[g.id];
    if (tid) byTable[tid] = (byTable[tid] ?? 0) + 1;
    if (g.rsvp === "yes") {
      attending += 1;
      if (tid) seated += 1;
    } else if (tid) {
      provisional += 1;
    }
  }
  return {
    attending,
    seated,
    unseated: attending - seated,
    provisional,
    capacity: TABLES.reduce((n, t) => n + t.seats, 0),
    byTable,
  };
}

export type RuleStatus = "ok" | "broken" | "waiting";

export interface RuleResult {
  id: string;
  kind: RuleKind;
  note: string;
  status: RuleStatus;
  title: string;
  detail: string;
  tableIds: string[];
  guestIds: string[];
}

const NEAR_TARGETS: Record<string, { near: string; nearLabel: string; away: string; awayLabel: string }> = {
  "g-09": { near: "f-4", nearLabel: "the garden doors", away: "f-1", awayLabel: "the band" },
};
const NEAR_MAX_M = 4;
const AWAY_MIN_M = 6;

function fixtureCentre(id: string): { x: number; y: number } {
  const f = FIXTURES.find((x) => x.id === id);
  if (!f) return { x: 0, y: 0 };
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

function dist(t: SeatTable, p: { x: number; y: number }): number {
  return Math.hypot(t.x - p.x, t.y - p.y);
}

const nameOf = (id: string) => guestById.get(id)?.name ?? id;

export function evaluateRules(a: Assignments): RuleResult[] {
  return RULES.map((rule, i): RuleResult => {
    const id = `r-${i + 1}`;
    const base = { id, kind: rule.kind, note: rule.note, guestIds: rule.guests };
    const names = rule.guests.map(nameOf);
    const tables = rule.guests.map((gid) => a[gid] ?? null);

    if (rule.kind === "together") {
      const title = `Keep together: ${names.join(" and ")}`;
      const seated = tables.filter((t): t is string => t !== null);
      if (seated.length < tables.length) {
        const missing = rule.guests.filter((gid) => !a[gid]).map(nameOf);
        const detail =
          seated.length === 0
            ? `Waiting: ${missing.join(" and ")} still need seats.`
            : `Waiting: ${missing.join(" and ")} still needs a seat.`;
        return { ...base, title, status: "waiting", detail, tableIds: [] };
      }
      const same = seated.every((t) => t === seated[0]);
      if (same) {
        return {
          ...base,
          title,
          status: "ok",
          detail: `Together at ${tableById.get(seated[0] ?? "")?.name ?? "a table"}.`,
          tableIds: [],
        };
      }
      const where = rule.guests
        .map((gid) => `${nameOf(gid)} (${tableById.get(a[gid] ?? "")?.name})`)
        .join(" and ");
      return {
        ...base,
        title,
        status: "broken",
        detail: `${where} are at different tables.`,
        tableIds: Array.from(new Set(seated)),
      };
    }

    if (rule.kind === "apart") {
      const title = `Keep apart: ${names.join(" and ")}`;
      const seated = tables.filter((t): t is string => t !== null);
      const clash = seated.length === tables.length && seated.every((t) => t === seated[0]);
      if (clash) {
        return {
          ...base,
          title,
          status: "broken",
          detail: `${names.join(" and ")} are both at ${tableById.get(seated[0] ?? "")?.name}.`,
          tableIds: [seated[0] ?? ""],
        };
      }
      const detail =
        seated.length < tables.length ? "Not at the same table so far." : "At different tables.";
      return { ...base, title, status: "ok", detail, tableIds: [] };
    }

    // near
    const gid = rule.guests[0] ?? "";
    const target = NEAR_TARGETS[gid];
    const label = target?.nearLabel ?? "the marked spot";
    const title = `Seat near ${label}: ${nameOf(gid)}`;
    const tid = a[gid] ?? null;
    if (!tid || !target) {
      return {
        ...base,
        title,
        status: "waiting",
        detail: `Waiting: ${nameOf(gid)} still needs a seat.`,
        tableIds: [],
      };
    }
    const table = tableById.get(tid);
    if (!table) return { ...base, title, status: "waiting", detail: "Table not found.", tableIds: [] };
    const dNear = dist(table, fixtureCentre(target.near));
    const dAway = dist(table, fixtureCentre(target.away));
    const nearOk = dNear <= NEAR_MAX_M;
    const awayOk = dAway >= AWAY_MIN_M;
    if (nearOk && awayOk) {
      return {
        ...base,
        title,
        status: "ok",
        detail: `${table.name} is ${dNear.toFixed(1)} m from ${label} and ${dAway.toFixed(1)} m from ${target.awayLabel}.`,
        tableIds: [],
      };
    }
    const problems: string[] = [];
    if (!nearOk) problems.push(`${dNear.toFixed(1)} m from ${label} (aim for ${NEAR_MAX_M} m or less)`);
    if (!awayOk) problems.push(`only ${dAway.toFixed(1)} m from ${target.awayLabel}`);
    return {
      ...base,
      title,
      status: "broken",
      detail: `${table.name} is ${problems.join(" and ")}.`,
      tableIds: [tid],
    };
  });
}

export function dietSummary(guests: Guest[]): { diet: string; count: number }[] {
  const m = new Map<string, number>();
  for (const g of guests) if (g.diet) m.set(g.diet, (m.get(g.diet) ?? 0) + 1);
  return Array.from(m, ([diet, count]) => ({ diet, count })).sort((x, y) => x.diet.localeCompare(y.diet));
}

export const ROOM = EVENT.room_m;
