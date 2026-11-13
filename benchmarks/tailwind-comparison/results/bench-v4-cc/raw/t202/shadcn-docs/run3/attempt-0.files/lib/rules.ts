import { FIXTURES, GUEST_BY_ID, RULES, TABLE_BY_ID, type Rule } from "@/lib/data";
import { firstName, formatMetres } from "@/lib/format";

export type Placement = { table: string; seat: number };
export type Placements = Record<string, Placement | null>;
export type RuleStatus = "ok" | "broken" | "waiting";

export type RuleResult = {
  id: string;
  rule: Rule;
  status: RuleStatus;
  title: string;
  detail: string;
  tableIds: string[];
  guestIds: string[];
};

const MAX_DOOR_DISTANCE = 4.5;
const MIN_STAGE_DISTANCE = 6;

function centre(kind: "door" | "stage") {
  const f = FIXTURES.find((x) => x.kind === kind);
  if (!f) return { x: 0, y: 0 };
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

function distanceToFixture(tableId: string, kind: "door" | "stage"): number {
  const t = TABLE_BY_ID[tableId];
  const c = centre(kind);
  if (!t) return Number.POSITIVE_INFINITY;
  return Math.hypot(t.x - c.x, t.y - c.y);
}

function tableName(id: string): string {
  return TABLE_BY_ID[id]?.name ?? id;
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export function evaluateRules(placements: Placements): RuleResult[] {
  return RULES.map((rule, index): RuleResult => {
    const id = `rule-${index}`;
    const guests = rule.guests.map((gid) => GUEST_BY_ID[gid]).filter((x) => x !== undefined);
    const names = guests.map((x) => x.name);
    const placed = guests.flatMap((x) => {
      const p = placements[x.id] ?? null;
      return p ? [{ guest: x, table: p.table }] : [];
    });
    const unplaced = guests.filter((x) => !placements[x.id]);
    const tableIds = Array.from(new Set(placed.map((p) => p.table)));
    const guestIds = placed.map((p) => p.guest.id);

    if (rule.kind === "together") {
      const title = `${joinNames(names)} together`;
      if (placed.length === 0) {
        return { id, rule, status: "waiting", title, detail: "Nobody in this group is seated yet.", tableIds, guestIds };
      }
      if (unplaced.length > 0) {
        const who = joinNames(unplaced.map((x) => firstName(x.name)));
        const first = placed[0];
        const where = first ? ` with ${firstName(first.guest.name)} at ${tableName(first.table)}` : "";
        return { id, rule, status: "waiting", title, detail: `${who} still needs a seat${where}.`, tableIds, guestIds };
      }
      if (tableIds.length === 1 && tableIds[0]) {
        return { id, rule, status: "ok", title, detail: `Together at ${tableName(tableIds[0])}.`, tableIds, guestIds };
      }
      return {
        id,
        rule,
        status: "broken",
        title,
        detail: `Split across ${joinNames(tableIds.map(tableName))}.`,
        tableIds,
        guestIds,
      };
    }

    if (rule.kind === "apart") {
      const title = `${joinNames(names)} apart`;
      const counts: Record<string, number> = {};
      for (const p of placed) counts[p.table] = (counts[p.table] ?? 0) + 1;
      const shared = Object.keys(counts).find((tid) => (counts[tid] ?? 0) > 1);
      if (shared) {
        const sharing = placed.filter((p) => p.table === shared).map((p) => p.guest.id);
        return {
          id,
          rule,
          status: "broken",
          title,
          detail: `Both are at ${tableName(shared)}.`,
          tableIds: [shared],
          guestIds: sharing,
        };
      }
      const detail =
        placed.length === 0
          ? "Neither is seated yet."
          : unplaced.length > 0
            ? `${joinNames(unplaced.map((x) => firstName(x.name)))} is not seated yet.`
            : `At ${joinNames(tableIds.map(tableName))}.`;
      return { id, rule, status: "ok", title, detail, tableIds, guestIds };
    }

    const subject = guests[0];
    const title = `${subject ? subject.name : "Guest"} near the garden doors`;
    const where = placed[0];
    if (!subject || !where) {
      return { id, rule, status: "waiting", title, detail: "Not seated yet.", tableIds, guestIds };
    }
    const door = distanceToFixture(where.table, "door");
    const stage = distanceToFixture(where.table, "stage");
    const closeEnough = door <= MAX_DOOR_DISTANCE;
    const farEnough = stage >= MIN_STAGE_DISTANCE;
    if (closeEnough && farEnough) {
      return {
        id,
        rule,
        status: "ok",
        title,
        detail: `${tableName(where.table)} is ${formatMetres(door)} from the doors and ${formatMetres(stage)} from the band.`,
        tableIds,
        guestIds,
      };
    }
    const problems: string[] = [];
    if (!closeEnough) {
      problems.push(`${tableName(where.table)} is ${formatMetres(door)} from the garden doors (aim for ${formatMetres(MAX_DOOR_DISTANCE)} or less)`);
    }
    if (!farEnough) {
      problems.push(`only ${formatMetres(stage)} from the band`);
    }
    return { id, rule, status: "broken", title, detail: `${problems.join(", ")}.`, tableIds, guestIds };
  });
}
