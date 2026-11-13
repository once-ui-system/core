import { fixtures, guestById, rules, tableById, type Rule, type TableDef } from "./data";

export type Seats = Record<string, (string | null)[]>;
export type RuleStatus = "ok" | "broken" | "open";

export interface RuleResult {
  index: number;
  rule: Rule;
  status: RuleStatus;
  title: string;
  detail: string;
  /** Tables to flag when the rule is broken. */
  tableIds: string[];
  /** Guests to flag when the rule is broken. */
  guestIds: string[];
}

export const NEAR_LIMIT_M = 4.5;

/** The long top table, in metres: x and y are its top-left corner. */
export const LONG_TABLE = { w: 4.8, h: 1.1 };

export const ruleKindLabel: Record<Rule["kind"], string> = {
  together: "Keep together",
  apart: "Keep apart",
  near: "Seat near",
};

export function tableCentre(t: TableDef): { x: number; y: number } {
  if (t.shape === "long") return { x: t.x + LONG_TABLE.w / 2, y: t.y + LONG_TABLE.h / 2 };
  return { x: t.x, y: t.y };
}

function fixtureCentre(kind: string) {
  const f = fixtures.find((x) => x.kind === kind);
  if (!f) return null;
  return { x: f.x + f.w / 2, y: f.y + f.h / 2, label: f.label };
}

export function tableOfGuest(seats: Seats): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [tid, row] of Object.entries(seats)) {
    for (const gid of row) if (gid) map[gid] = tid;
  }
  return map;
}

function notSeatedReason(gid: string): string {
  const g = guestById[gid];
  if (g.rsvp === "yes") return `${g.name} has no seat yet`;
  if (g.rsvp === "no") return `${g.name} has declined`;
  return `${g.name} has not confirmed (${g.rsvp === "maybe" ? "maybe" : "no reply"})`;
}

export function evaluateRules(seats: Seats): RuleResult[] {
  const where = tableOfGuest(seats);
  return rules.map((rule, index): RuleResult => {
    const names = rule.guests.map((id) => guestById[id].name);
    const base = { index, rule, tableIds: [] as string[], guestIds: [] as string[] };

    if (rule.kind === "near") {
      const gid = rule.guests[0];
      const tid = where[gid];
      const title = `${names[0]} near the ${fixtureCentre(rule.target ?? "door")?.label.toLowerCase() ?? "doors"}`;
      if (!tid) return { ...base, title, status: "open", detail: notSeatedReason(gid) };
      const t = tableById[tid];
      const c = tableCentre(t);
      const target = fixtureCentre(rule.target ?? "door");
      const avoid = rule.avoid ? fixtureCentre(rule.avoid) : null;
      if (!target) return { ...base, title, status: "ok", detail: `${t.name}` };
      const dTarget = Math.hypot(c.x - target.x, c.y - target.y);
      const dAvoid = avoid ? Math.hypot(c.x - avoid.x, c.y - avoid.y) : Infinity;
      const dist = `${dTarget.toFixed(1)} m`;
      if (dTarget > NEAR_LIMIT_M) {
        return {
          ...base,
          title,
          status: "broken",
          detail: `${t.name} is ${dist} from the ${target.label.toLowerCase()} (limit ${NEAR_LIMIT_M} m)`,
          tableIds: [tid],
          guestIds: [gid],
        };
      }
      if (avoid && dAvoid <= dTarget) {
        return {
          ...base,
          title,
          status: "broken",
          detail: `${t.name} is closer to the ${avoid.label.toLowerCase()} than to the ${target.label.toLowerCase()}`,
          tableIds: [tid],
          guestIds: [gid],
        };
      }
      return { ...base, title, status: "ok", detail: `${t.name} is ${dist} from the ${target.label.toLowerCase()}` };
    }

    const [a, b] = rule.guests;
    const title = `${names[0]} & ${names[1]}`;
    const ta = where[a];
    const tb = where[b];
    if (!ta || !tb) {
      const missing = !ta ? a : b;
      return { ...base, title, status: "open", detail: notSeatedReason(missing) };
    }
    if (rule.kind === "together") {
      if (ta === tb) return { ...base, title, status: "ok", detail: `Both at ${tableById[ta].name}` };
      return {
        ...base,
        title,
        status: "broken",
        detail: `${tableById[ta].name} and ${tableById[tb].name}`,
        tableIds: [ta, tb],
        guestIds: [a, b],
      };
    }
    if (ta === tb) {
      return {
        ...base,
        title,
        status: "broken",
        detail: `Both at ${tableById[ta].name}`,
        tableIds: [ta],
        guestIds: [a, b],
      };
    }
    return { ...base, title, status: "ok", detail: `${tableById[ta].name} and ${tableById[tb].name}` };
  });
}
