import {
  fixtures,
  guests,
  rules,
  tables,
  type Fixture,
  type Guest,
  type Rsvp,
  type Rule,
  type SeatTable,
} from "./data";

export const guestById = new Map<string, Guest>(guests.map((g) => [g.id, g]));
export const tableById = new Map<string, SeatTable>(tables.map((t) => [t.id, t]));
export const fixtureById = new Map<string, Fixture>(fixtures.map((f) => [f.id, f]));

/** Length of a long table in metres: one seat per metre on one side. */
export const LONG_TABLE_LENGTH = 8;
export const LONG_TABLE_DEPTH = 1.1;
export const ROUND_TABLE_DIAMETER = 1.9;
export const SEAT_DIAMETER = 0.85;

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function firstName(name: string): string {
  return name.split(" ")[0];
}

export function tableCenter(t: SeatTable): { x: number; y: number } {
  if (t.shape === "long") return { x: t.x + LONG_TABLE_LENGTH / 2, y: t.y + LONG_TABLE_DEPTH / 2 };
  return { x: t.x, y: t.y };
}

export function fixtureCenter(f: Fixture): { x: number; y: number } {
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export type SeatPoint = { x: number; y: number };

/** Seat centres in room metres, in seat order. */
export function seatPoints(t: SeatTable): SeatPoint[] {
  const c = tableCenter(t);
  const rot = ((t.rotation ?? 0) * Math.PI) / 180;
  const local: SeatPoint[] = [];
  if (t.shape === "long") {
    const pitch = LONG_TABLE_LENGTH / t.seats;
    for (let i = 0; i < t.seats; i += 1) {
      local.push({
        x: -LONG_TABLE_LENGTH / 2 + pitch * (i + 0.5),
        y: -(LONG_TABLE_DEPTH / 2 + SEAT_DIAMETER / 2 + 0.08),
      });
    }
  } else {
    const r = ROUND_TABLE_DIAMETER / 2 + SEAT_DIAMETER / 2 + 0.1;
    for (let i = 0; i < t.seats; i += 1) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
      local.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
    }
  }
  return local.map((p) => ({
    x: c.x + p.x * Math.cos(rot) - p.y * Math.sin(rot),
    y: c.y + p.x * Math.sin(rot) + p.y * Math.cos(rot),
  }));
}

export type RuleStatus = "met" | "broken" | "open";

export type RuleResult = {
  index: number;
  rule: Rule;
  status: RuleStatus;
  label: string;
  message: string;
  tables: string[];
  guests: string[];
};

const kindLabel: Record<Rule["kind"], string> = {
  together: "Keep together",
  apart: "Keep apart",
  near: "Seat near",
};

function nameOf(id: string): string {
  return guestById.get(id)?.name ?? id;
}

function tableName(id: string): string {
  return tableById.get(id)?.name ?? id;
}

export function evaluateRules(tableOf: (guestId: string) => string | null): RuleResult[] {
  return rules.map((rule, index) => {
    const base = { index, rule, label: kindLabel[rule.kind] };
    if (rule.kind === "together") {
      const [a, b] = rule.guests;
      const ta = tableOf(a);
      const tb = tableOf(b);
      if (ta && tb) {
        if (ta === tb) {
          return { ...base, status: "met" as const, message: `${nameOf(a)} and ${nameOf(b)} are together at ${tableName(ta)}.`, tables: [ta], guests: [a, b] };
        }
        return {
          ...base,
          status: "broken" as const,
          message: `${nameOf(a)} is at ${tableName(ta)} but ${nameOf(b)} is at ${tableName(tb)}.`,
          tables: [ta, tb],
          guests: [a, b],
        };
      }
      if (ta || tb) {
        const seated = ta ? a : b;
        const waiting = ta ? b : a;
        const at = (ta ?? tb) as string;
        return {
          ...base,
          status: "open" as const,
          message: `${nameOf(seated)} is at ${tableName(at)}; ${nameOf(waiting)} still needs a seat.`,
          tables: [at],
          guests: [a, b],
        };
      }
      return { ...base, status: "open" as const, message: `${nameOf(a)} and ${nameOf(b)} are not seated yet.`, tables: [], guests: [a, b] };
    }
    if (rule.kind === "apart") {
      const [a, b] = rule.guests;
      const ta = tableOf(a);
      const tb = tableOf(b);
      if (ta && tb && ta === tb) {
        return {
          ...base,
          status: "broken" as const,
          message: `${nameOf(a)} and ${nameOf(b)} are both at ${tableName(ta)}.`,
          tables: [ta],
          guests: [a, b],
        };
      }
      return {
        ...base,
        status: "met" as const,
        message: `${nameOf(a)} and ${nameOf(b)} are not at the same table.`,
        tables: [],
        guests: [a, b],
      };
    }
    // near
    const [g] = rule.guests;
    const tid = tableOf(g);
    const spec = rule.near;
    if (!tid) {
      return { ...base, status: "open" as const, message: `${nameOf(g)} is not seated yet.`, tables: [], guests: [g] };
    }
    const table = tableById.get(tid);
    const target = spec ? fixtureById.get(spec.fixture) : undefined;
    if (!table || !spec || !target) {
      return { ...base, status: "met" as const, message: `${nameOf(g)} is at ${tableName(tid)}.`, tables: [tid], guests: [g] };
    }
    const c = tableCenter(table);
    const d = distance(c, fixtureCenter(target));
    const dTxt = d.toFixed(1);
    if (d > spec.within) {
      return {
        ...base,
        status: "broken" as const,
        message: `${tableName(tid)} is ${dTxt} m from the ${target.label.toLowerCase()}; ${nameOf(g)} needs a table within ${spec.within} m.`,
        tables: [tid],
        guests: [g],
      };
    }
    const away = spec.awayFrom ? fixtureById.get(spec.awayFrom.fixture) : undefined;
    if (spec.awayFrom && away) {
      const da = distance(c, fixtureCenter(away));
      if (da < spec.awayFrom.atLeast) {
        return {
          ...base,
          status: "broken" as const,
          message: `${tableName(tid)} is only ${da.toFixed(1)} m from the ${away.label.toLowerCase()}; ${nameOf(g)} needs ${spec.awayFrom.atLeast} m or more.`,
          tables: [tid],
          guests: [g],
        };
      }
    }
    return {
      ...base,
      status: "met" as const,
      message: `${tableName(tid)} is ${dTxt} m from the ${target.label.toLowerCase()}, away from the band.`,
      tables: [tid],
      guests: [g],
    };
  });
}

export const rsvpLabel: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Awaiting reply",
  no: "Declined",
};

export const rsvpTone: Record<Rsvp, "success" | "warning" | "info" | "neutral"> = {
  yes: "success",
  maybe: "warning",
  pending: "info",
  no: "neutral",
};

export const STANDARD_MEAL = "Standard menu";

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${d} ${names[m - 1]} ${y}`;
}
