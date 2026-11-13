import {
  FIXTURES_BY_ID,
  GUESTS,
  GUESTS_BY_ID,
  RULES,
  TABLES,
  TABLES_BY_ID,
  type RuleKind,
} from "@/lib/data";

export type Seat = { table: string; seat: number } | null;
export type Placements = Record<string, Seat>;
export type SeatMap = Record<string, (string | null)[]>;
export type RuleStatus = "ok" | "broken" | "pending";

export interface RuleResult {
  id: string;
  kind: RuleKind;
  status: RuleStatus;
  headline: string;
  detail: string;
  note: string;
  guestIds: string[];
  /** Tables of the seated guests the rule is about. */
  tableIds: string[];
}

export function initialPlacements(): Placements {
  const counters: Record<string, number> = {};
  const out: Placements = {};
  for (const g of GUESTS) {
    if (g.table) {
      const seat = counters[g.table] ?? 0;
      counters[g.table] = seat + 1;
      out[g.id] = { table: g.table, seat };
    } else {
      out[g.id] = null;
    }
  }
  return out;
}

export function buildSeatMap(p: Placements): SeatMap {
  const map: SeatMap = {};
  for (const t of TABLES) map[t.id] = Array.from({ length: t.seats }, () => null);
  for (const [guestId, seat] of Object.entries(p)) {
    if (seat) {
      const row = map[seat.table];
      if (row) row[seat.seat] = guestId;
    }
  }
  return map;
}

export type PlaceResult =
  | { ok: true; next: Placements; swappedWith?: string }
  | { ok: false; reason: "full" | "same" };

export function placeGuest(p: Placements, guestId: string, tableId: string, seat?: number): PlaceResult {
  const row = buildSeatMap(p)[tableId];
  if (!row) return { ok: false, reason: "same" };
  const current = p[guestId] ?? null;
  if (seat === undefined) {
    if (current?.table === tableId) return { ok: false, reason: "same" };
    const free = row.indexOf(null);
    if (free < 0) return { ok: false, reason: "full" };
    return { ok: true, next: { ...p, [guestId]: { table: tableId, seat: free } } };
  }
  const occupant = row[seat] ?? null;
  if (occupant === guestId) return { ok: false, reason: "same" };
  const next: Placements = { ...p };
  if (occupant) next[occupant] = current;
  next[guestId] = { table: tableId, seat };
  return { ok: true, next, swappedWith: occupant ?? undefined };
}

/** Where "near" and "away" are measured: the guest's table centre against a fixture centre. */
const NEAR = { fixtureId: "f-4", maxM: 5, awayFromId: "f-1", minAwayM: 6 };

function distance(tableId: string, fixtureId: string): number {
  const t = TABLES_BY_ID[tableId];
  const f = FIXTURES_BY_ID[fixtureId];
  if (!t || !f) return Number.POSITIVE_INFINITY;
  return Math.hypot(t.x - (f.x + f.w / 2), t.y - (f.y + f.h / 2));
}

function tName(id: string): string {
  return TABLES_BY_ID[id]?.name ?? id;
}

function gName(id: string): string {
  return GUESTS_BY_ID[id]?.name ?? id;
}

export function evaluateRules(p: Placements): RuleResult[] {
  return RULES.map((rule, i): RuleResult => {
    const id = `rule-${i + 1}`;
    const seats = rule.guests.map((g) => p[g] ?? null);
    const tableIds = Array.from(new Set(seats.filter((s): s is NonNullable<Seat> => s !== null).map((s) => s.table)));
    const base = { id, kind: rule.kind, note: rule.note, guestIds: rule.guests, tableIds };
    const a = rule.guests[0] ?? "";
    const b = rule.guests[1] ?? "";
    const sa = seats[0] ?? null;
    const sb = seats[1] ?? null;

    if (rule.kind === "together") {
      if (sa && sb) {
        return sa.table === sb.table
          ? { ...base, status: "ok", headline: `${gName(a)} and ${gName(b)} sit together`, detail: `Both at ${tName(sa.table)}.` }
          : {
              ...base,
              status: "broken",
              headline: `${gName(a)} and ${gName(b)} are split`,
              detail: `${gName(a)} is at ${tName(sa.table)}, ${gName(b)} at ${tName(sb.table)}.`,
            };
      }
      const missing = [!sa ? gName(a) : null, !sb ? gName(b) : null].filter(Boolean).join(" and ");
      const anchor = sa ?? sb;
      return {
        ...base,
        status: "pending",
        headline: `Seat ${gName(a)} and ${gName(b)} together`,
        detail: anchor ? `${missing} still needs a seat, ideally at ${tName(anchor.table)}.` : `${missing} still need seats.`,
      };
    }

    if (rule.kind === "apart") {
      if (sa && sb) {
        return sa.table === sb.table
          ? {
              ...base,
              status: "broken",
              headline: `${gName(a)} and ${gName(b)} share ${tName(sa.table)}`,
              detail: "They should sit at different tables.",
            }
          : {
              ...base,
              status: "ok",
              headline: `${gName(a)} and ${gName(b)} are apart`,
              detail: `${tName(sa.table)} and ${tName(sb.table)}.`,
            };
      }
      const open = [!sa ? gName(a) : null, !sb ? gName(b) : null].filter(Boolean).join(" and ");
      return {
        ...base,
        status: "pending",
        headline: `Keep ${gName(a)} and ${gName(b)} apart`,
        detail: `${open} not seated yet.`,
      };
    }

    // near
    const seat = sa;
    if (!seat) {
      return {
        ...base,
        status: "pending",
        headline: `Seat ${gName(a)} near the garden doors`,
        detail: "Not seated yet.",
      };
    }
    const toDoor = distance(seat.table, NEAR.fixtureId);
    const toBand = distance(seat.table, NEAR.awayFromId);
    const problems: string[] = [];
    if (toDoor > NEAR.maxM) problems.push(`${toDoor.toFixed(1)} m from the garden doors (aim for ${NEAR.maxM} m or less)`);
    if (toBand < NEAR.minAwayM) problems.push(`only ${toBand.toFixed(1)} m from the band (aim for ${NEAR.minAwayM} m or more)`);
    return problems.length
      ? {
          ...base,
          status: "broken",
          headline: `${gName(a)} is not near the garden doors`,
          detail: `${tName(seat.table)} is ${problems.join(" and ")}.`,
        }
      : {
          ...base,
          status: "ok",
          headline: `${gName(a)} is near the garden doors`,
          detail: `${tName(seat.table)} is ${toDoor.toFixed(1)} m from the doors and ${toBand.toFixed(1)} m from the band.`,
        };
  });
}
