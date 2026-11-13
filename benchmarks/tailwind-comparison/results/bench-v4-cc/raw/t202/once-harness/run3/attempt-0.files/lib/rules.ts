import {
  FIXTURE_BY_ID,
  GUEST_BY_ID,
  RULES,
  TABLE_BY_ID,
  type Fixture,
  type Rule,
} from "./data";

export type RuleStatus = "ok" | "broken" | "pending";

export interface RuleResult {
  index: number;
  kind: Rule["kind"];
  status: RuleStatus;
  title: string;
  message: string;
  note: string;
  /** tables the rule is about right now (where its guests sit) */
  tables: string[];
}

/** A "seat near" guest must sit within this many metres of the target fixture. */
export const NEAR_M = 4;
/** ...and at least this far from the fixture to avoid. */
export const AWAY_M = 6;

function centre(f: Fixture): { x: number; y: number } {
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

function metres(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.round(Math.hypot(a.x - b.x, a.y - b.y) * 10) / 10;
}

function names(ids: string[]): string {
  return ids.map((id) => GUEST_BY_ID[id].name).join(" and ");
}

function unique(list: string[]): string[] {
  return Array.from(new Set(list));
}

export function evaluateRules(tableOf: Record<string, string | null>): RuleResult[] {
  return RULES.map((rule, index): RuleResult => {
    const seated = rule.guests.filter((id) => tableOf[id]);
    const missing = rule.guests.filter((id) => !tableOf[id]);
    const tables = unique(seated.map((id) => tableOf[id] as string));
    const tName = (id: string) => TABLE_BY_ID[id].name;
    const base = { index, kind: rule.kind, note: rule.note, tables };

    if (rule.kind === "together") {
      const title = `Keep together: ${names(rule.guests)}`;
      if (tables.length > 1) {
        return {
          ...base,
          status: "broken",
          title,
          message: `Split across ${tables.map(tName).join(" and ")}.`,
        };
      }
      if (missing.length > 0) {
        return {
          ...base,
          status: "pending",
          title,
          message: `${names(missing)} not seated yet.`,
        };
      }
      return { ...base, status: "ok", title, message: `Together at ${tName(tables[0])}.` };
    }

    if (rule.kind === "apart") {
      const title = `Keep apart: ${names(rule.guests)}`;
      const clash = tables.length < seated.length;
      if (clash) {
        return {
          ...base,
          status: "broken",
          title,
          message: `Both at ${tName(tables[0])}.`,
        };
      }
      if (missing.length > 0) {
        return {
          ...base,
          status: "pending",
          title,
          message: `${names(missing)} not seated yet. No clash so far.`,
        };
      }
      return {
        ...base,
        status: "ok",
        title,
        message: `At ${tables.map(tName).join(" and ")}.`,
      };
    }

    // near
    const title = `Seat near ${FIXTURE_BY_ID[rule.target ?? "f-4"].label.toLowerCase()}: ${names(rule.guests)}`;
    if (missing.length > 0) {
      return {
        ...base,
        status: "pending",
        title,
        message: `${names(missing)} not seated yet.`,
      };
    }
    const target = centre(FIXTURE_BY_ID[rule.target ?? "f-4"]);
    const avoid = rule.avoid ? centre(FIXTURE_BY_ID[rule.avoid]) : null;
    const table = TABLE_BY_ID[tables[0]];
    const toTarget = metres(table, target);
    const toAvoid = avoid ? metres(table, avoid) : null;
    if (toTarget > NEAR_M) {
      return {
        ...base,
        status: "broken",
        title,
        message: `${table.name} is ${toTarget} m from the ${FIXTURE_BY_ID[rule.target ?? "f-4"].label.toLowerCase()}; aim for ${NEAR_M} m or less.`,
      };
    }
    if (toAvoid !== null && toAvoid < AWAY_M) {
      return {
        ...base,
        status: "broken",
        title,
        message: `${table.name} is only ${toAvoid} m from the ${FIXTURE_BY_ID[rule.avoid ?? "f-1"].label.toLowerCase()}.`,
      };
    }
    return {
      ...base,
      status: "ok",
      title,
      message: `${table.name} is ${toTarget} m from the ${FIXTURE_BY_ID[rule.target ?? "f-4"].label.toLowerCase()}.`,
    };
  });
}
