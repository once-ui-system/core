import {
  FIXTURES,
  GUEST_BY_ID,
  RULES,
  TABLE_BY_ID,
  fixtureCentre,
  tableCentre,
  type FixtureKind,
  type Rule,
} from "@/lib/data";

export type RuleStatus = "ok" | "broken" | "pending";

export type RuleResult = {
  index: number;
  rule: Rule;
  status: RuleStatus;
  title: string;
  detail: string;
  /** tables a broken rule should be flagged on */
  tables: string[];
  /** seated guests a broken rule should be flagged on */
  guestIds: string[];
};

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function fixtureOf(kind: FixtureKind) {
  return FIXTURES.find((f) => f.kind === kind);
}

export function evaluateRules(tableOf: Record<string, string | null>): RuleResult[] {
  return RULES.map((rule, index): RuleResult => {
    const guests = rule.guests.map((id) => GUEST_BY_ID[id]);
    const names = guests.map((g) => g.name);
    const joined = names.join(" & ");
    const unseated = guests.filter((g) => !tableOf[g.id]);
    const tableName = (id: string | null) => (id ? TABLE_BY_ID[id].name : "no table");

    if (rule.kind === "together") {
      const title = `Keep together: ${joined}`;
      if (unseated.length > 0) {
        return {
          index, rule, status: "pending", title,
          detail: `${unseated.map((g) => g.name).join(" and ")} not seated yet`,
          tables: [], guestIds: [],
        };
      }
      const ids = guests.map((g) => tableOf[g.id] as string);
      if (ids.every((t) => t === ids[0])) {
        return { index, rule, status: "ok", title, detail: `Both at ${tableName(ids[0])}`, tables: [], guestIds: [] };
      }
      return {
        index, rule, status: "broken", title,
        detail: guests.map((g) => `${g.name} (${tableName(tableOf[g.id])})`).join(" and ") + " are at different tables",
        tables: Array.from(new Set(ids)), guestIds: guests.map((g) => g.id),
      };
    }

    if (rule.kind === "apart") {
      const title = `Keep apart: ${joined}`;
      if (unseated.length > 0) {
        return {
          index, rule, status: "pending", title,
          detail: `${unseated.map((g) => g.name).join(" and ")} not seated yet`,
          tables: [], guestIds: [],
        };
      }
      const ids = guests.map((g) => tableOf[g.id] as string);
      if (ids.every((t) => t === ids[0])) {
        return {
          index, rule, status: "broken", title,
          detail: `${joined} are both at ${tableName(ids[0])}`,
          tables: [ids[0]], guestIds: guests.map((g) => g.id),
        };
      }
      return { index, rule, status: "ok", title, detail: "At different tables", tables: [], guestIds: [] };
    }

    // near
    const near = fixtureOf(rule.nearKind ?? "door");
    const away = fixtureOf(rule.awayKind ?? "stage");
    const within = rule.withinM ?? 4;
    const nearLabel = (near?.label ?? "fixture").toLowerCase();
    const awayLabel = (away?.label ?? "band").toLowerCase();
    const title = `Seat near the ${nearLabel}: ${joined}`;
    const guest = guests[0];
    const tid = tableOf[guest.id];
    if (!tid || !near) {
      return { index, rule, status: "pending", title, detail: `${guest.name} not seated yet`, tables: [], guestIds: [] };
    }
    const c = tableCentre(TABLE_BY_ID[tid]);
    const dNear = dist(c, fixtureCentre(near));
    const dAway = away ? dist(c, fixtureCentre(away)) : Infinity;
    if (dNear <= within && dNear < dAway) {
      return {
        index, rule, status: "ok", title,
        detail: `${tableName(tid)} is ${dNear.toFixed(1)} m from the ${nearLabel}`,
        tables: [], guestIds: [],
      };
    }
    const reason =
      dNear > within
        ? `${tableName(tid)} is ${dNear.toFixed(1)} m from the ${nearLabel} (needs ${within} m or less)`
        : `${tableName(tid)} is closer to the ${awayLabel} than to the ${nearLabel}`;
    return { index, rule, status: "broken", title, detail: `${guest.name}: ${reason}`, tables: [tid], guestIds: [guest.id] };
  });
}
