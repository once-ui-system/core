import { fixtures, guestById, rules, tableById, type Rule } from "./data";

/** tableId -> seat list (index = seat, value = guest id or null). */
export type SeatMap = Record<string, (string | null)[]>;

export type RuleStatus = "ok" | "broken" | "open";

export interface RuleResult {
  index: number;
  rule: Rule;
  title: string;
  status: RuleStatus;
  message: string;
  /** Tables to flag when the rule is broken. */
  tableIds: string[];
}

/** A table counts as "near" the garden doors within this distance (m), and "away" from the band beyond it. */
export const NEAR_LIMIT_M = 4.5;
export const AWAY_LIMIT_M = 6;

export function tableOf(seats: SeatMap, guestId: string): string | null {
  for (const [tableId, row] of Object.entries(seats)) {
    if (row.includes(guestId)) return tableId;
  }
  return null;
}

function fixtureCentre(kind: "door" | "stage"): { x: number; y: number } {
  const f = fixtures.find((fx) => fx.kind === kind);
  if (!f) return { x: 0, y: 0 };
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

export function distanceTo(tableId: string, kind: "door" | "stage"): number {
  const t = tableById[tableId];
  if (!t) return 0;
  const c = fixtureCentre(kind);
  return Math.hypot(t.x - c.x, t.y - c.y);
}

const TITLES: Record<Rule["kind"], string> = {
  together: "Keep together",
  apart: "Keep apart",
  near: "Seat near the garden doors",
};

function nameOf(id: string): string {
  return guestById[id]?.name ?? id;
}

function tableName(id: string): string {
  return tableById[id]?.name ?? id;
}

function evaluate(rule: Rule, index: number, seats: SeatMap): RuleResult {
  const base = { index, rule, title: TITLES[rule.kind] };

  if (rule.kind === "near") {
    const id = rule.guests[0] ?? "";
    const t = tableOf(seats, id);
    if (!t) {
      return { ...base, status: "open", message: `${nameOf(id)} is not seated yet.`, tableIds: [] };
    }
    const door = distanceTo(t, "door");
    const band = distanceTo(t, "stage");
    if (door <= NEAR_LIMIT_M && band >= AWAY_LIMIT_M) {
      return {
        ...base,
        status: "ok",
        message: `${nameOf(id)} is at ${tableName(t)}, ${door.toFixed(1)} m from the garden doors and ${band.toFixed(1)} m from the band.`,
        tableIds: [t],
      };
    }
    const why =
      door > NEAR_LIMIT_M
        ? `${door.toFixed(1)} m from the garden doors (aim for ${NEAR_LIMIT_M} m or less)`
        : `only ${band.toFixed(1)} m from the band (aim for ${AWAY_LIMIT_M} m or more)`;
    return {
      ...base,
      status: "broken",
      message: `${nameOf(id)} is at ${tableName(t)}, ${why}.`,
      tableIds: [t],
    };
  }

  const [a = "", b = ""] = rule.guests;
  const ta = tableOf(seats, a);
  const tb = tableOf(seats, b);

  if (rule.kind === "together") {
    if (ta && tb) {
      if (ta === tb) {
        return { ...base, status: "ok", message: `${nameOf(a)} and ${nameOf(b)} are both at ${tableName(ta)}.`, tableIds: [ta] };
      }
      return {
        ...base,
        status: "broken",
        message: `${nameOf(a)} is at ${tableName(ta)} but ${nameOf(b)} is at ${tableName(tb)}.`,
        tableIds: [ta, tb],
      };
    }
    const missing = !ta && !tb ? `${nameOf(a)} and ${nameOf(b)} are not seated yet.` : `${nameOf(ta ? b : a)} is not seated yet.`;
    return { ...base, status: "open", message: missing, tableIds: [] };
  }

  // apart
  if (ta && tb) {
    if (ta === tb) {
      return {
        ...base,
        status: "broken",
        message: `${nameOf(a)} and ${nameOf(b)} are both at ${tableName(ta)}.`,
        tableIds: [ta],
      };
    }
    return {
      ...base,
      status: "ok",
      message: `${nameOf(a)} (${tableName(ta)}) and ${nameOf(b)} (${tableName(tb)}) are apart.`,
      tableIds: [],
    };
  }
  const waiting = !ta && !tb ? `${nameOf(a)} and ${nameOf(b)} are not seated yet.` : `${nameOf(ta ? b : a)} is not seated yet.`;
  return { ...base, status: "open", message: waiting, tableIds: [] };
}

export function evaluateRules(seats: SeatMap): RuleResult[] {
  return rules.map((r, i) => evaluate(r, i, seats));
}
