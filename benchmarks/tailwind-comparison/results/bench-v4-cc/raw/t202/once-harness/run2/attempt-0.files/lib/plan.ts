import {
  EVENT,
  FIXTURE_BY_ID,
  GUEST_BY_ID,
  RULES,
  TABLES,
  TABLE_BY_ID,
  GUESTS,
  type Fixture,
  type Guest,
  type Rsvp,
  type Rule,
  type TableDef,
} from "./data";

export type Seating = Record<string, (string | null)[]>;
export type ToneName = "neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success";

export const SEAT_R = 0.34;
export const NEAR_MAX_M = 4;
export const AWAY_MIN_M = 6;

export function initialSeating(): Seating {
  const seating: Seating = {};
  for (const t of TABLES) seating[t.id] = Array.from({ length: t.seats }, () => null);
  for (const g of GUESTS) {
    if (!g.table) continue;
    const slots = seating[g.table];
    const free = slots.indexOf(null);
    if (free >= 0) slots[free] = g.id;
  }
  return seating;
}

export function cloneSeating(s: Seating): Seating {
  const next: Seating = {};
  for (const id of Object.keys(s)) next[id] = s[id].slice();
  return next;
}

export function tableOfMap(seating: Seating): Record<string, string | null> {
  const map: Record<string, string | null> = {};
  for (const g of GUESTS) map[g.id] = null;
  for (const tableId of Object.keys(seating)) {
    for (const guestId of seating[tableId]) if (guestId) map[guestId] = tableId;
  }
  return map;
}

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "No reply yet",
  no: "Declined",
};

export const RSVP_TONE: Record<Rsvp, ToneName> = {
  yes: "success",
  maybe: "warning",
  pending: "neutral",
  no: "danger",
};

export function mealOf(g: Guest): string {
  return g.diet ?? "Standard";
}

export function formatEventDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

/* ---------- geometry ---------- */

export type TableLayout = {
  body: { kind: "round"; r: number } | { kind: "long"; w: number; h: number };
  seats: { x: number; y: number }[];
  /** Radius (round) or half extents used for the drop/click hit area. */
  hit: { x: number; y: number; w: number; h: number };
};

export function seatLayout(t: TableDef): TableLayout {
  const n = t.seats;
  if (t.shape === "long") {
    const w = n * 0.72;
    const h = 0.9;
    const seats = Array.from({ length: n }, (_, i) => ({
      x: -w / 2 + ((i + 0.5) * w) / n,
      y: h / 2 + 0.46,
    }));
    return {
      body: { kind: "long", w, h },
      seats,
      hit: { x: -w / 2 - 0.3, y: -h / 2 - 0.3, w: w + 0.6, h: h + 0.46 + SEAT_R * 2 + 0.5 },
    };
  }
  const r = n > 6 ? 0.9 : 0.78;
  const ring = r + 0.46;
  const seats = Array.from({ length: n }, (_, i) => {
    const a = ((-90 + (i * 360) / n) * Math.PI) / 180;
    return { x: Math.cos(a) * ring, y: Math.sin(a) * ring };
  });
  const reach = ring + SEAT_R + 0.12;
  return { body: { kind: "round", r }, seats, hit: { x: -reach, y: -reach, w: reach * 2, h: reach * 2 } };
}

function centre(f: Fixture): { x: number; y: number } {
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/* ---------- rules ---------- */

export type RuleStatus = "kept" | "broken" | "waiting";

export type RuleResult = {
  id: string;
  rule: Rule;
  status: RuleStatus;
  title: string;
  detail: string;
  tableIds: string[];
};

export const RULE_KIND_LABEL: Record<Rule["kind"], string> = {
  together: "Keep together",
  apart: "Keep apart",
  near: "Seat near",
};

function unique(list: string[]): string[] {
  return Array.from(new Set(list));
}

function tableName(id: string): string {
  return TABLE_BY_ID[id].name;
}

export function evaluateRules(tableOf: Record<string, string | null>): RuleResult[] {
  return RULES.map((rule, index): RuleResult => {
    const id = `rule-${index}`;
    const names = rule.guests.map((g) => GUEST_BY_ID[g].name);
    const title = `${RULE_KIND_LABEL[rule.kind]}: ${names.join(" and ")}`;
    const seatedAt = unique(rule.guests.map((g) => tableOf[g]).filter((t): t is string => t !== null));
    const unplaced = rule.guests.filter((g) => !tableOf[g]).map((g) => GUEST_BY_ID[g].name);

    if (rule.kind === "together") {
      if (seatedAt.length > 1) {
        return { id, rule, status: "broken", title, detail: `Split across ${seatedAt.map(tableName).join(" and ")}.`, tableIds: seatedAt };
      }
      if (unplaced.length > 0) {
        return { id, rule, status: "waiting", title, detail: `Waiting: ${unplaced.join(" and ")} not seated yet.`, tableIds: seatedAt };
      }
      return { id, rule, status: "kept", title, detail: `Together at ${tableName(seatedAt[0])}.`, tableIds: seatedAt };
    }

    if (rule.kind === "apart") {
      if (unplaced.length === 0 && seatedAt.length === 1) {
        return { id, rule, status: "broken", title, detail: `Both are at ${tableName(seatedAt[0])}.`, tableIds: seatedAt };
      }
      if (unplaced.length > 0) {
        return { id, rule, status: "waiting", title, detail: `Not tested yet: ${unplaced.join(" and ")} not seated.`, tableIds: seatedAt };
      }
      return { id, rule, status: "kept", title, detail: `${seatedAt.map(tableName).join(" and ")}: kept apart.`, tableIds: seatedAt };
    }

    // near
    if (rule.nearFixture) {
      const target = FIXTURE_BY_ID[rule.nearFixture];
      const away = rule.awayFrom ? FIXTURE_BY_ID[rule.awayFrom] : undefined;
      const tid = tableOf[rule.guests[0]];
      if (!tid) {
        return { id, rule, status: "waiting", title, detail: `Waiting: ${names[0]} is not seated yet.`, tableIds: [] };
      }
      const t = TABLE_BY_ID[tid];
      const dTarget = dist(t, centre(target));
      const dAway = away ? dist(t, centre(away)) : Infinity;
      const label = target.label.toLowerCase();
      const farLabel = away ? away.label.toLowerCase() : "";
      if (dTarget > NEAR_MAX_M) {
        return {
          id,
          rule,
          status: "broken",
          title,
          detail: `${t.name} is ${dTarget.toFixed(1)} m from the ${label}; it needs to be within ${NEAR_MAX_M} m.`,
          tableIds: [tid],
        };
      }
      if (dAway < AWAY_MIN_M) {
        return {
          id,
          rule,
          status: "broken",
          title,
          detail: `${t.name} is only ${dAway.toFixed(1)} m from the ${farLabel}; keep it ${AWAY_MIN_M} m or more away.`,
          tableIds: [tid],
        };
      }
      return {
        id,
        rule,
        status: "kept",
        title,
        detail: `${t.name} is ${dTarget.toFixed(1)} m from the ${label}${away ? ` and ${dAway.toFixed(1)} m from the ${farLabel}` : ""}.`,
        tableIds: [tid],
      };
    }

    if (unplaced.length > 0) {
      return { id, rule, status: "waiting", title, detail: `Waiting: ${unplaced.join(" and ")} not seated yet.`, tableIds: seatedAt };
    }
    const tables = rule.guests.map((g) => TABLE_BY_ID[tableOf[g] as string]);
    const far = tables.some((t) => dist(t, tables[0]) > 6);
    return far
      ? { id, rule, status: "broken", title, detail: "These tables are more than 6 m apart.", tableIds: seatedAt }
      : { id, rule, status: "kept", title, detail: "Close together.", tableIds: seatedAt };
  });
}

export function roomSize() {
  return EVENT.room_m;
}
