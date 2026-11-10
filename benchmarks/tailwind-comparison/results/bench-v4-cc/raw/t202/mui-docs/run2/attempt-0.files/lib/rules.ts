import { fixtureById, guestById, rules, tableById, type Fixture, type Rule, type Table } from "@/lib/data";

export type SeatRef = { tableId: string; seat: number };
export type Assignment = Record<string, SeatRef | null>;
export type RuleStatus = "ok" | "broken" | "pending";
export type RuleResult = {
  id: string;
  rule: Rule;
  label: string;
  subject: string;
  note: string;
  detail: string;
  status: RuleStatus;
  tableIds: string[];
  guestIds: string[];
};

export const RULE_LABEL: Record<Rule["kind"], string> = {
  together: "Keep together",
  apart: "Keep apart",
  near: "Seat near",
};

/** Guest ids by seat index for one table (null = empty seat). */
export function seatsFor(assign: Assignment, tableId: string, count: number): (string | null)[] {
  const out = new Array<string | null>(count).fill(null);
  for (const [gid, ref] of Object.entries(assign)) {
    if (ref && ref.tableId === tableId && ref.seat < count) out[ref.seat] = gid;
  }
  return out;
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function distance(table: Table, fixture: Fixture): number {
  const fx = fixture.x + fixture.w / 2;
  const fy = fixture.y + fixture.h / 2;
  return Math.hypot(table.x - fx, table.y - fy);
}

export function evaluateRules(assign: Assignment): RuleResult[] {
  return rules.map((rule, index): RuleResult => {
    const people = rule.guests.map((gid) => guestById[gid]);
    const subject = joinNames(people.map((p) => p.name));
    const where = rule.guests.map((gid) => assign[gid]?.tableId ?? null);
    const seatedTables = Array.from(new Set(where.filter((t): t is string => t !== null)));
    const base = {
      id: `rule-${index}`,
      rule,
      label: RULE_LABEL[rule.kind],
      subject,
      note: rule.note,
    };

    if (rule.kind === "together") {
      if (seatedTables.length > 1) {
        return {
          ...base,
          status: "broken",
          detail: people
            .map((p, i) => (where[i] ? `${p.name} is at ${tableById[where[i] as string].name}` : `${p.name} is not seated`))
            .join("; ") + ".",
          tableIds: seatedTables,
          guestIds: rule.guests.filter((gid) => assign[gid]),
        };
      }
      if (where.includes(null)) {
        return {
          ...base,
          status: "pending",
          detail: "Not all of them are seated yet.",
          tableIds: seatedTables,
          guestIds: [],
        };
      }
      return {
        ...base,
        status: "ok",
        detail: `Together at ${tableById[seatedTables[0]].name}.`,
        tableIds: seatedTables,
        guestIds: [],
      };
    }

    if (rule.kind === "apart") {
      const counts: Record<string, string[]> = {};
      rule.guests.forEach((gid, i) => {
        const t = where[i];
        if (t) (counts[t] ??= []).push(gid);
      });
      const clash = Object.entries(counts).filter(([, ids]) => ids.length > 1);
      if (clash.length > 0) {
        return {
          ...base,
          status: "broken",
          detail: `Both are at ${tableById[clash[0][0]].name}.`,
          tableIds: clash.map(([t]) => t),
          guestIds: clash.flatMap(([, ids]) => ids),
        };
      }
      return {
        ...base,
        status: "ok",
        detail: seatedTables.length < rule.guests.length ? "Not at the same table so far." : "At different tables.",
        tableIds: [],
        guestIds: [],
      };
    }

    // near
    const gid = rule.guests[0];
    const ref = assign[gid];
    if (!ref) {
      return { ...base, status: "pending", detail: "Not seated yet.", tableIds: [], guestIds: [] };
    }
    const table = tableById[ref.tableId];
    const toward = rule.toward ? fixtureById[rule.toward] : undefined;
    const away = rule.awayFrom ? fixtureById[rule.awayFrom] : undefined;
    const issues: string[] = [];
    const facts: string[] = [];
    if (toward) {
      const d = distance(table, toward);
      facts.push(`${d.toFixed(1)} m from the ${toward.label.toLowerCase()}`);
      if (rule.maxDistance !== undefined && d > rule.maxDistance) {
        issues.push(`too far from the ${toward.label.toLowerCase()} (${d.toFixed(1)} m, aim for ${rule.maxDistance} m or less)`);
      }
    }
    if (away) {
      const d = distance(table, away);
      facts.push(`${d.toFixed(1)} m from the ${away.label.toLowerCase()}`);
      if (rule.minAway !== undefined && d < rule.minAway) {
        issues.push(`too close to the ${away.label.toLowerCase()} (${d.toFixed(1)} m, aim for ${rule.minAway} m or more)`);
      }
    }
    if (issues.length > 0) {
      return {
        ...base,
        status: "broken",
        detail: `${table.name} is ${issues.join(" and ")}.`,
        tableIds: [table.id],
        guestIds: [gid],
      };
    }
    return {
      ...base,
      status: "ok",
      detail: `${table.name} is ${facts.join(" and ")}.`,
      tableIds: [table.id],
      guestIds: [],
    };
  });
}
