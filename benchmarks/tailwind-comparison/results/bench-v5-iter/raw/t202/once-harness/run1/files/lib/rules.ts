import { fixtures, guests, rules, tables } from "./data";
import { distance, tableGeometry } from "./geometry";

export type Placement = { table: string; seat: number };
export type Assignment = Record<string, Placement | null>;

export type RuleStatus = "ok" | "broken" | "open";

export type RuleResult = {
  id: string;
  kind: "together" | "apart" | "near";
  status: RuleStatus;
  /** tables that carry the flag when the rule is broken */
  tableIds: string[];
  guestIds: string[];
  title: string;
  detail: string;
  note: string;
};

const NEAR_DOOR_M = 4.5;
const AWAY_FROM_BAND_M = 7;

const guestById = new Map(guests.map((g) => [g.id, g]));
const tableById = new Map(tables.map((t) => [t.id, t]));
const door = fixtures.find((f) => f.kind === "door");
const band = fixtures.find((f) => f.kind === "stage");

function nameOf(id: string): string {
  return guestById.get(id)?.name ?? id;
}

function tableName(id: string): string {
  return tableById.get(id)?.name ?? id;
}

function centreOf(f: { x: number; y: number; w: number; h: number }) {
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

export function evaluateRules(assign: Assignment): RuleResult[] {
  return rules.map((rule, i) => {
    const id = `rule-${i}`;
    const names = rule.guests.map(nameOf);
    const at = rule.guests.map((g) => assign[g]?.table ?? null);
    const base = { id, kind: rule.kind, guestIds: rule.guests, note: rule.note };

    if (rule.kind === "together") {
      const title = `${names.join(" and ")} together`;
      if (at.some((t) => t === null)) {
        return {
          ...base,
          status: "open" as const,
          tableIds: [],
          title,
          detail: at.every((t) => t === null) ? "Neither is seated yet" : "One of them is still unseated",
        };
      }
      const same = at.every((t) => t === at[0]);
      return {
        ...base,
        status: same ? ("ok" as const) : ("broken" as const),
        tableIds: same ? [] : Array.from(new Set(at as string[])),
        title,
        detail: same
          ? `Both at ${tableName(at[0] as string)}`
          : `Split across ${Array.from(new Set(at as string[])).map(tableName).join(" and ")}`,
      };
    }

    if (rule.kind === "apart") {
      const title = `${names.join(" and ")} apart`;
      if (at.some((t) => t === null)) {
        return {
          ...base,
          status: "open" as const,
          tableIds: [],
          title,
          detail: "Not both seated, nothing to clash yet",
        };
      }
      const clash = at[0] === at[1];
      return {
        ...base,
        status: clash ? ("broken" as const) : ("ok" as const),
        tableIds: clash ? [at[0] as string] : [],
        title,
        detail: clash
          ? `Both at ${tableName(at[0] as string)}`
          : `${tableName(at[0] as string)} and ${tableName(at[1] as string)}`,
      };
    }

    // near: the guest sits close to the garden doors and away from the band
    const title = `${names[0]} near the garden doors`;
    const t = at[0];
    if (t === null || !door || !band) {
      return {
        ...base,
        status: "open" as const,
        tableIds: [],
        title,
        detail: "Not seated yet",
      };
    }
    const def = tableById.get(t);
    const c = def ? tableGeometry(def).centre : { x: 0, y: 0 };
    const dDoor = distance(c, centreOf(door));
    const dBand = distance(c, centreOf(band));
    const ok = dDoor <= NEAR_DOOR_M && dBand >= AWAY_FROM_BAND_M;
    return {
      ...base,
      status: ok ? ("ok" as const) : ("broken" as const),
      tableIds: ok ? [] : [t],
      title,
      detail: ok
        ? `${tableName(t)} is ${dDoor.toFixed(1)} m from the doors`
        : dDoor > NEAR_DOOR_M
          ? `${tableName(t)} is ${dDoor.toFixed(1)} m from the doors, over ${NEAR_DOOR_M} m`
          : `${tableName(t)} is only ${dBand.toFixed(1)} m from the band`,
    };
  });
}
