import {
  FIXTURE_BY_ID,
  GUEST_BY_ID,
  GUESTS,
  RULES,
  TABLE_BY_ID,
  TABLES,
  type Rule,
} from "./data"

export interface SeatRef {
  table: string
  seat: number
}

/** guest id -> seat, or null when unseated */
export type Assignment = Record<string, SeatRef | null>

export function initialAssignment(): Assignment {
  const next: Assignment = {}
  const used: Record<string, number> = {}
  for (const g of GUESTS) {
    if (g.table) {
      const n = used[g.table] ?? 0
      used[g.table] = n + 1
      next[g.id] = { table: g.table, seat: n }
    } else {
      next[g.id] = null
    }
  }
  return next
}

/** table id -> array indexed by seat holding a guest id or null */
export function seatMap(a: Assignment): Record<string, (string | null)[]> {
  const map: Record<string, (string | null)[]> = {}
  for (const t of TABLES) map[t.id] = Array.from({ length: t.seats }, () => null)
  for (const [gid, ref] of Object.entries(a)) {
    if (ref) {
      const row = map[ref.table]
      if (row) row[ref.seat] = gid
    }
  }
  return map
}

export function tableCentre(tableId: string): { x: number; y: number } {
  const t = TABLE_BY_ID[tableId]
  return { x: t?.x ?? 0, y: t?.y ?? 0 }
}

export function fixtureCentre(fixtureId: string): { x: number; y: number } {
  const f = FIXTURE_BY_ID[fixtureId]
  return f ? { x: f.x + f.w / 2, y: f.y + f.h / 2 } : { x: 0, y: 0 }
}

export function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export const NEAR_MAX_M = 4.5
export const AWAY_MIN_M = 6

export type RuleStatus = "ok" | "broken" | "pending"

export interface RuleResult {
  index: number
  rule: Rule
  status: RuleStatus
  title: string
  detail: string
  tableIds: string[]
  guestIds: string[]
}

const first = (id: string) => (GUEST_BY_ID[id]?.name ?? id).split(" ")[0] ?? id
const full = (id: string) => GUEST_BY_ID[id]?.name ?? id
const tname = (id: string) => TABLE_BY_ID[id]?.name ?? id
const m = (n: number) => `${n.toFixed(1)} m`

export function evaluateRules(a: Assignment): RuleResult[] {
  return RULES.map((rule, index): RuleResult => {
    const seats = rule.guests.map((id) => a[id] ?? null)
    const seatedIds = rule.guests.filter((id) => a[id])
    const tableIds = Array.from(new Set(seats.filter(Boolean).map((s) => (s as SeatRef).table)))
    const base = { index, rule, tableIds, guestIds: rule.guests }

    if (rule.kind === "together") {
      const [g1, g2] = rule.guests as [string, string]
      if (seats[0] && seats[1]) {
        if (seats[0].table === seats[1].table) {
          return { ...base, status: "ok", title: `${full(g1)} and ${full(g2)}`, detail: `Together at ${tname(seats[0].table)}` }
        }
        return {
          ...base,
          status: "broken",
          title: `${full(g1)} and ${full(g2)}`,
          detail: `Split: ${first(g1)} at ${tname(seats[0].table)}, ${first(g2)} at ${tname(seats[1].table)}`,
        }
      }
      if (seats[0] || seats[1]) {
        const placed = seats[0] ? g1 : g2
        const waiting = seats[0] ? g2 : g1
        const at = (seats[0] ?? seats[1]) as SeatRef
        return {
          ...base,
          status: "pending",
          title: `${full(g1)} and ${full(g2)}`,
          detail: `${first(placed)} is at ${tname(at.table)}; seat ${first(waiting)} there too`,
        }
      }
      return { ...base, status: "pending", title: `${full(g1)} and ${full(g2)}`, detail: "Neither is seated yet" }
    }

    if (rule.kind === "apart") {
      const [g1, g2] = rule.guests as [string, string]
      if (seats[0] && seats[1] && seats[0].table === seats[1].table) {
        return {
          ...base,
          status: "broken",
          title: `${full(g1)} and ${full(g2)}`,
          detail: `Both at ${tname(seats[0].table)}; move one of them`,
        }
      }
      if (seats[0] && seats[1]) {
        return { ...base, status: "ok", title: `${full(g1)} and ${full(g2)}`, detail: `Apart: ${tname(seats[0].table)} and ${tname(seats[1].table)}` }
      }
      return {
        ...base,
        status: "ok",
        title: `${full(g1)} and ${full(g2)}`,
        detail: seatedIds.length ? "Apart so far; the other is not seated" : "Apart so far; neither is seated",
      }
    }

    // near
    const gid = rule.guests[0] as string
    const seat = a[gid]
    const target = rule.nearFixture ?? "f-4"
    const away = rule.awayFixture ?? "f-1"
    const targetLabel = (FIXTURE_BY_ID[target]?.label ?? "the doors").toLowerCase()
    const awayLabel = (FIXTURE_BY_ID[away]?.label ?? "the band").toLowerCase()
    if (!seat) {
      return { ...base, status: "pending", title: `${full(gid)} near the ${targetLabel}`, detail: "Not seated yet" }
    }
    const c = tableCentre(seat.table)
    const dNear = distance(c, fixtureCentre(target))
    const dAway = distance(c, fixtureCentre(away))
    if (dNear <= NEAR_MAX_M && dAway >= AWAY_MIN_M) {
      return {
        ...base,
        status: "ok",
        title: `${full(gid)} near the ${targetLabel}`,
        detail: `${tname(seat.table)} is ${m(dNear)} from the ${targetLabel}, ${m(dAway)} from the ${awayLabel}`,
      }
    }
    const better = TABLES.filter((t) => {
      const tc = { x: t.x, y: t.y }
      return distance(tc, fixtureCentre(target)) <= NEAR_MAX_M && distance(tc, fixtureCentre(away)) >= AWAY_MIN_M
    }).map((t) => t.name)
    const why =
      dNear > NEAR_MAX_M
        ? `${tname(seat.table)} is ${m(dNear)} from the ${targetLabel}`
        : `${tname(seat.table)} is only ${m(dAway)} from the ${awayLabel}`
    return {
      ...base,
      status: "broken",
      title: `${full(gid)} near the ${targetLabel}`,
      detail: better.length ? `${why}. Try ${better.join(" or ")}` : why,
    }
  })
}

export function brokenTablesFor(results: RuleResult[]): Record<string, RuleResult[]> {
  const out: Record<string, RuleResult[]> = {}
  for (const r of results) {
    if (r.status !== "broken") continue
    for (const t of r.tableIds) (out[t] ??= []).push(r)
  }
  return out
}

export function brokenGuestIds(results: RuleResult[]): Set<string> {
  const s = new Set<string>()
  for (const r of results) {
    if (r.status !== "broken") continue
    if (r.rule.kind === "near") r.guestIds.forEach((g) => s.add(g))
    else {
      // only the seated guests share the problem
      r.guestIds.forEach((g) => s.add(g))
    }
  }
  return s
}
