import {
  FIXTURES_BY_ID,
  GUESTS_BY_ID,
  RULES,
  RULE_LABEL,
  TABLES,
  TABLES_BY_ID,
  type Rule,
} from "./data";

export type RuleStatus = "ok" | "broken" | "pending";

export interface RuleResult {
  rule: Rule;
  status: RuleStatus;
  label: string;
  /** Tables to flag when the rule is broken, or to open when the row is chosen. */
  tableIds: string[];
  /** Guests whose seats are marked when the rule is broken. */
  guestIds: string[];
  /** One short sentence for the summary. */
  detail: string;
  /** Optional second sentence, e.g. which tables would fit. */
  hint?: string;
}

/** Guest id to table id (or null when unseated). */
export type Locations = Record<string, string | null>;

function nameOf(id: string): string {
  return GUESTS_BY_ID[id]?.name ?? id;
}

function tableName(id: string | null | undefined): string {
  return (id && TABLES_BY_ID[id]?.name) || "no table";
}

function distanceToFixture(tableId: string, fixtureId: string): number {
  const t = TABLES_BY_ID[tableId];
  const f = FIXTURES_BY_ID[fixtureId];
  if (!t || !f) return Number.POSITIVE_INFINITY;
  return Math.hypot(t.x - (f.x + f.w / 2), t.y - (f.y + f.h / 2));
}

function metres(n: number): string {
  return `${n.toFixed(1)} m`;
}

function lower(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function joinNames(ids: string[]): string {
  const names = ids.map(nameOf);
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function checkTogether(rule: Rule, loc: Locations): RuleResult {
  const seated = rule.guests.filter((id) => loc[id]);
  const tables = [...new Set(seated.map((id) => loc[id] as string))];
  const label = RULE_LABEL[rule.kind];
  if (tables.length > 1) {
    return {
      rule,
      status: "broken",
      label,
      tableIds: tables,
      guestIds: seated,
      detail: `${seated
        .map((id) => `${nameOf(id)} (${tableName(loc[id])})`)
        .join(" and ")} are at different tables.`,
      hint: "Move one of them so they share a table.",
    };
  }
  if (seated.length < rule.guests.length) {
    const missing = rule.guests.filter((id) => !loc[id]);
    return {
      rule,
      status: "pending",
      label,
      tableIds: tables,
      guestIds: [],
      detail: `${joinNames(missing)} ${missing.length > 1 ? "are" : "is"} not seated yet.`,
      hint: tables[0] ? `Seat them at ${tableName(tables[0])} to keep the pair together.` : undefined,
    };
  }
  return {
    rule,
    status: "ok",
    label,
    tableIds: tables,
    guestIds: [],
    detail: `${joinNames(rule.guests)} are together at ${tableName(tables[0])}.`,
  };
}

function checkApart(rule: Rule, loc: Locations): RuleResult {
  const label = RULE_LABEL[rule.kind];
  const byTable = new Map<string, string[]>();
  for (const id of rule.guests) {
    const t = loc[id];
    if (t) byTable.set(t, [...(byTable.get(t) ?? []), id]);
  }
  const shared = [...byTable.entries()].filter(([, ids]) => ids.length > 1);
  if (shared.length > 0) {
    const tableIds = shared.map(([t]) => t);
    return {
      rule,
      status: "broken",
      label,
      tableIds,
      guestIds: shared.flatMap(([, ids]) => ids),
      detail: `${joinNames(shared[0]?.[1] ?? rule.guests)} are both at ${tableName(tableIds[0])}.`,
      hint: "Move one of them to a different table.",
    };
  }
  const seatedCount = rule.guests.filter((id) => loc[id]).length;
  if (seatedCount < rule.guests.length) {
    const missing = rule.guests.filter((id) => !loc[id]);
    return {
      rule,
      status: "pending",
      label,
      tableIds: [...byTable.keys()],
      guestIds: [],
      detail: `${joinNames(missing)} ${missing.length > 1 ? "are" : "is"} not seated yet, so nothing to clash so far.`,
    };
  }
  return {
    rule,
    status: "ok",
    label,
    tableIds: [...byTable.keys()],
    guestIds: [],
    detail: `${rule.guests.map((id) => `${nameOf(id)} (${tableName(loc[id])})`).join(" and ")} are apart.`,
  };
}

function fits(rule: Rule, tableId: string): boolean {
  const nearOk =
    !rule.target ||
    rule.maxFromTarget === undefined ||
    distanceToFixture(tableId, rule.target) <= rule.maxFromTarget;
  const awayOk =
    !rule.awayFrom ||
    rule.minFromAway === undefined ||
    distanceToFixture(tableId, rule.awayFrom) >= rule.minFromAway;
  return nearOk && awayOk;
}

function checkNear(rule: Rule, loc: Locations, free: Record<string, number>): RuleResult {
  const label = RULE_LABEL[rule.kind];
  const guestId = rule.guests[0] ?? "";
  const tableId = loc[guestId] ?? null;
  const targetLabel = rule.target ? lower(FIXTURES_BY_ID[rule.target]?.label ?? "") : "";
  const awayLabel = rule.awayFrom ? lower(FIXTURES_BY_ID[rule.awayFrom]?.label ?? "") : "";
  const fitting = TABLES.filter((t) => fits(rule, t.id));
  const fitText = fitting.length
    ? `Tables that fit: ${fitting
        .map((t) => `${t.name} (${free[t.id] ?? 0} free)`)
        .join(", ")}.`
    : "No table in the room fits.";
  if (!tableId) {
    return {
      rule,
      status: "pending",
      label,
      tableIds: fitting.map((t) => t.id),
      guestIds: [],
      detail: `${nameOf(guestId)} is not seated yet.`,
      hint: fitText,
    };
  }
  const dTarget = rule.target ? distanceToFixture(tableId, rule.target) : 0;
  const dAway = rule.awayFrom ? distanceToFixture(tableId, rule.awayFrom) : Number.POSITIVE_INFINITY;
  if (fits(rule, tableId)) {
    return {
      rule,
      status: "ok",
      label,
      tableIds: [tableId],
      guestIds: [],
      detail: `${nameOf(guestId)} is at ${tableName(tableId)}, ${metres(dTarget)} from the ${targetLabel}${
        awayLabel ? ` and ${metres(dAway)} from the ${awayLabel}` : ""
      }.`,
    };
  }
  const reasons: string[] = [];
  if (rule.maxFromTarget !== undefined && dTarget > rule.maxFromTarget) {
    reasons.push(`${metres(dTarget)} from the ${targetLabel} (aim for ${metres(rule.maxFromTarget)} or less)`);
  }
  if (rule.minFromAway !== undefined && dAway < rule.minFromAway) {
    reasons.push(`only ${metres(dAway)} from the ${awayLabel} (aim for ${metres(rule.minFromAway)} or more)`);
  }
  return {
    rule,
    status: "broken",
    label,
    tableIds: [tableId],
    guestIds: [guestId],
    detail: `${nameOf(guestId)} is at ${tableName(tableId)}, ${reasons.join(" and ")}.`,
    hint: fitText,
  };
}

export function checkRules(loc: Locations, free: Record<string, number>): RuleResult[] {
  return RULES.map((rule) => {
    if (rule.kind === "together") return checkTogether(rule, loc);
    if (rule.kind === "apart") return checkApart(rule, loc);
    return checkNear(rule, loc, free);
  });
}
