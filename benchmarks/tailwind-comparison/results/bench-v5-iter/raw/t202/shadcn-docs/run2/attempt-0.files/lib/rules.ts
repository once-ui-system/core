import { fixtures, tables, type Guest, type Rule } from "@/lib/data";
import { tableFrame } from "@/lib/geometry";

export type RuleStatus = "ok" | "broken" | "waiting";

export interface RuleResult {
  rule: Rule;
  status: RuleStatus;
  /** One short sentence about the current state of the rule. */
  detail: string;
  /** Tables the rule is currently broken on. */
  tables: string[];
}

/** A "seat near" rule counts as met within this many metres of the fixture. */
export const NEAR_M = 4.5;
/** ...and "away from" as at least this far from the other fixture. */
export const AWAY_M = 6;

const tableCentres = new Map(tables.map((t) => [t.id, tableFrame(t).centre]));
const tableNames = new Map(tables.map((t) => [t.id, t.name]));

function fixtureCentre(id: string) {
  const f = fixtures.find((x) => x.id === id);
  return f ? { x: f.x + f.w / 2, y: f.y + f.h / 2, label: f.label } : null;
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

const first = (n: string) => n.split(" ")[0] ?? n;

export function evaluateRules(rules: Rule[], guests: Guest[]): RuleResult[] {
  const byId = new Map(guests.map((g) => [g.id, g]));
  return rules.map((rule): RuleResult => {
    const people = rule.guests.map((id) => byId.get(id)).filter((g): g is Guest => Boolean(g));
    const unseated = people.filter((g) => !g.table);

    if (rule.kind === "near") {
      const g = people[0];
      if (!g || !g.table) {
        return { rule, status: "waiting", detail: `${g ? first(g.name) : "Guest"} is not seated yet.`, tables: [] };
      }
      const centre = tableCentres.get(g.table);
      const near = rule.nearFixture ? fixtureCentre(rule.nearFixture) : null;
      const away = rule.awayFrom ? fixtureCentre(rule.awayFrom) : null;
      if (!centre) return { rule, status: "waiting", detail: "Table not found.", tables: [] };
      const tName = tableNames.get(g.table) ?? g.table;
      const dNear = near ? dist(centre, near) : 0;
      const dAway = away ? dist(centre, away) : Infinity;
      const problems: string[] = [];
      if (near && dNear > NEAR_M) problems.push(`${dNear.toFixed(1)} m from the ${near.label.toLowerCase()}`);
      if (away && dAway < AWAY_M) problems.push(`only ${dAway.toFixed(1)} m from the ${away.label.toLowerCase()}`);
      if (problems.length) {
        return {
          rule,
          status: "broken",
          detail: `${tName} is ${problems.join(" and ")}.`,
          tables: [g.table],
        };
      }
      return {
        rule,
        status: "ok",
        detail: `${tName} is ${dNear.toFixed(1)} m from the ${near?.label.toLowerCase() ?? "doors"}.`,
        tables: [],
      };
    }

    if (unseated.length > 0 || people.length < 2) {
      const who = unseated.map((g) => first(g.name)).join(" and ");
      return {
        rule,
        status: "waiting",
        detail: who ? `Waiting for ${who} to be seated.` : "Waiting.",
        tables: [],
      };
    }

    const [a, b] = people as [Guest, Guest];
    const same = a.table === b.table;
    const names = `${first(a.name)} and ${first(b.name)}`;
    if (rule.kind === "together") {
      if (same) return { rule, status: "ok", detail: `${names} are both at ${tableNames.get(a.table!)}.`, tables: [] };
      return {
        rule,
        status: "broken",
        detail: `${first(a.name)} is at ${tableNames.get(a.table!)}, ${first(b.name)} at ${tableNames.get(b.table!)}.`,
        tables: [a.table!, b.table!],
      };
    }
    // apart
    if (same) {
      return {
        rule,
        status: "broken",
        detail: `${names} are both at ${tableNames.get(a.table!)}.`,
        tables: [a.table!],
      };
    }
    return {
      rule,
      status: "ok",
      detail: `${first(a.name)} at ${tableNames.get(a.table!)}, ${first(b.name)} at ${tableNames.get(b.table!)}.`,
      tables: [],
    };
  });
}

export const ruleKindLabel: Record<Rule["kind"], string> = {
  together: "Keep together",
  apart: "Keep apart",
  near: "Seat near",
};
