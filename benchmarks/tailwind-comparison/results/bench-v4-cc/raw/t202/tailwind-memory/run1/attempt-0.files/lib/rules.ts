import { fixtures, guestById, rules, tableById, type Rule } from "./data";
import { distanceToFixture } from "./geometry";

export type SeatMap = Record<string, { table: string; seat: number } | null>;
export type RuleStatus = "ok" | "broken" | "pending";

export type RuleResult = {
  index: number;
  rule: Rule;
  status: RuleStatus;
  title: string;
  detail: string;
  /** Tables to flag when the rule is broken. */
  tables: string[];
  guests: string[];
};

export const NEAR_DOOR_MAX_M = 4;
export const BAND_MIN_M = 6;

const nameOf = (id: string) => guestById.get(id)?.name ?? id;
const tableName = (id: string) => tableById.get(id)?.name ?? id;
const unique = <T,>(xs: T[]) => Array.from(new Set(xs));

export function evaluateRules(seats: SeatMap): RuleResult[] {
  return rules.map((rule, index): RuleResult => {
    const names = rule.guests.map(nameOf);
    const where = rule.guests.map((id) => seats[id] ?? null);
    const base = { index, rule, guests: rule.guests };

    if (rule.kind === "together") {
      const title = `Keep together: ${names.join(" and ")}`;
      if (where.some((w) => !w)) {
        const missing = rule.guests.filter((_, i) => !where[i]).map(nameOf);
        return {
          ...base,
          title,
          status: "pending",
          detail: `Waiting for ${missing.join(" and ")} to be seated.`,
          tables: [],
        };
      }
      const tbls = unique(where.map((w) => w!.table));
      if (tbls.length === 1) {
        return { ...base, title, status: "ok", detail: `Both at ${tableName(tbls[0])}.`, tables: [] };
      }
      return {
        ...base,
        title,
        status: "broken",
        detail: rule.guests
          .map((id, i) => `${nameOf(id)} is at ${tableName(where[i]!.table)}`)
          .join(", ") + ".",
        tables: tbls,
      };
    }

    if (rule.kind === "apart") {
      const title = `Keep apart: ${names.join(" and ")}`;
      if (where.some((w) => !w)) {
        const missing = rule.guests.filter((_, i) => !where[i]).map(nameOf);
        return {
          ...base,
          title,
          status: "pending",
          detail: `Checked once ${missing.join(" and ")} ${missing.length > 1 ? "are" : "is"} seated.`,
          tables: [],
        };
      }
      const tbls = unique(where.map((w) => w!.table));
      if (tbls.length === 1) {
        return {
          ...base,
          title,
          status: "broken",
          detail: `Both are at ${tableName(tbls[0])}.`,
          tables: tbls,
        };
      }
      return {
        ...base,
        title,
        status: "ok",
        detail: `${tableName(tbls[0])} and ${tableName(tbls[1])}.`,
        tables: [],
      };
    }

    // near
    const title = `Seat near the garden doors: ${names[0]}`;
    const w = where[0];
    if (!w) {
      return { ...base, title, status: "pending", detail: `Waiting for ${names[0]} to be seated.`, tables: [] };
    }
    const t = tableById.get(w.table);
    if (!t) return { ...base, title, status: "pending", detail: "Table not found.", tables: [] };
    const doors = fixtures.filter((f) => f.kind === "door");
    const stages = fixtures.filter((f) => f.kind === "stage");
    const toDoor = Math.min(...doors.map((f) => distanceToFixture(t.x, t.y, f)));
    const toBand = Math.min(...stages.map((f) => distanceToFixture(t.x, t.y, f)));
    const problems: string[] = [];
    if (toDoor > NEAR_DOOR_MAX_M) {
      problems.push(`${t.name} is ${toDoor.toFixed(1)} m from the garden doors (up to ${NEAR_DOOR_MAX_M} m)`);
    }
    if (toBand < BAND_MIN_M) {
      problems.push(`${t.name} is only ${toBand.toFixed(1)} m from the band (at least ${BAND_MIN_M} m)`);
    }
    if (problems.length > 0) {
      return { ...base, title, status: "broken", detail: problems.join("; ") + ".", tables: [t.id] };
    }
    return {
      ...base,
      title,
      status: "ok",
      detail: `${t.name}: ${toDoor.toFixed(1)} m from the doors, ${toBand.toFixed(1)} m from the band.`,
      tables: [],
    };
  });
}
