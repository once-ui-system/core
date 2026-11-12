import {
  FIXTURE_BY_ID,
  GUEST_BY_ID,
  GUESTS,
  RULES,
  TABLE_BY_ID,
  TABLES,
  type Rule,
} from "./data";
import { dist, tableBody } from "./geometry";

export type Seating = Record<string, (string | null)[]>;
export type Location = { tableId: string; seat: number };
export type RuleStatus = "kept" | "broken" | "open";

export type RuleResult = {
  index: number;
  rule: Rule;
  status: RuleStatus;
  title: string;
  detail: string;
  tableIds: string[];
  guestIds: string[];
};

export function initialSeating(): Seating {
  const seating: Seating = {};
  for (const t of TABLES) seating[t.id] = Array.from({ length: t.seats }, () => null);
  for (const guest of GUESTS) {
    if (!guest.table) continue;
    const slots = seating[guest.table];
    const free = slots.indexOf(null);
    if (free >= 0) slots[free] = guest.id;
  }
  return seating;
}

export function locate(seating: Seating): Record<string, Location> {
  const out: Record<string, Location> = {};
  for (const tableId of Object.keys(seating)) {
    seating[tableId].forEach((guestId, seat) => {
      if (guestId) out[guestId] = { tableId, seat };
    });
  }
  return out;
}

export function tableCount(seating: Seating, tableId: string): number {
  return seating[tableId].filter(Boolean).length;
}

const nm = (id: string) => GUEST_BY_ID[id].name;
const tn = (id: string) => TABLE_BY_ID[id].name;

function ruleTitle(rule: Rule): string {
  const names = rule.guests.map(nm);
  if (rule.kind === "together") return `Keep together: ${names.join(" and ")}`;
  if (rule.kind === "apart") return `Keep apart: ${names.join(" and ")}`;
  const fixture = rule.target ? FIXTURE_BY_ID[rule.target.fixture].label : "the fixture";
  return `Seat near ${fixture}: ${names.join(", ")}`;
}

export function evaluateRules(seating: Seating, loc?: Record<string, Location>): RuleResult[] {
  const locations = loc ?? locate(seating);
  return RULES.map((rule, index): RuleResult => {
    const base = {
      index,
      rule,
      title: ruleTitle(rule),
      guestIds: rule.guests,
    };
    const [a, b] = rule.guests;
    const la = locations[a];
    const lb = b ? locations[b] : undefined;

    if (rule.kind === "together") {
      if (la && lb) {
        if (la.tableId === lb.tableId) {
          return {
            ...base,
            status: "kept",
            detail: `Both at ${tn(la.tableId)}.`,
            tableIds: [la.tableId],
          };
        }
        return {
          ...base,
          status: "broken",
          detail: `${nm(a)} is at ${tn(la.tableId)}, ${nm(b)} at ${tn(lb.tableId)}.`,
          tableIds: [la.tableId, lb.tableId],
        };
      }
      if (la || lb) {
        const seated = la ?? lb;
        const missing = la ? b : a;
        return {
          ...base,
          status: "open",
          detail: `${nm(missing)} still needs a seat, at ${tn(seated!.tableId)} to keep them together.`,
          tableIds: [seated!.tableId],
        };
      }
      return { ...base, status: "open", detail: "Neither is seated yet.", tableIds: [] };
    }

    if (rule.kind === "apart") {
      if (la && lb) {
        if (la.tableId === lb.tableId) {
          return {
            ...base,
            status: "broken",
            detail: `Both are at ${tn(la.tableId)}.`,
            tableIds: [la.tableId],
          };
        }
        return {
          ...base,
          status: "kept",
          detail: `${tn(la.tableId)} and ${tn(lb.tableId)}.`,
          tableIds: [la.tableId, lb.tableId],
        };
      }
      if (la || lb) {
        const seated = (la ?? lb)!;
        const missing = la ? b : a;
        return {
          ...base,
          status: "open",
          detail: `${nm(missing)} is not seated yet: keep them away from ${tn(seated.tableId)}.`,
          tableIds: [seated.tableId],
        };
      }
      return { ...base, status: "open", detail: "Neither is seated yet.", tableIds: [] };
    }

    // near
    const target = rule.target;
    if (!la || !target) {
      return { ...base, status: "open", detail: `${nm(a)} is not seated yet.`, tableIds: [] };
    }
    const table = TABLE_BY_ID[la.tableId];
    const body = tableBody(table);
    const centre = { x: body.cx, y: body.cy };
    const fx = FIXTURE_BY_ID[target.fixture];
    const fxCentre = { x: fx.x + fx.w / 2, y: fx.y + fx.h / 2 };
    const d = dist(centre, fxCentre);
    let farther = true;
    let awayLabel = "";
    if (target.awayFrom) {
      const away = FIXTURE_BY_ID[target.awayFrom];
      awayLabel = away.label;
      farther = dist(centre, { x: away.x + away.w / 2, y: away.y + away.h / 2 }) > d;
    }
    if (d <= target.within && farther) {
      return {
        ...base,
        status: "kept",
        detail: `${table.name} is ${d.toFixed(1)} m from ${fx.label}.`,
        tableIds: [table.id],
      };
    }
    return {
      ...base,
      status: "broken",
      detail: farther
        ? `${table.name} is ${d.toFixed(1)} m from ${fx.label}; within ${target.within} m is needed.`
        : `${table.name} is closer to the ${awayLabel} than to ${fx.label}.`,
      tableIds: [table.id],
    };
  });
}
