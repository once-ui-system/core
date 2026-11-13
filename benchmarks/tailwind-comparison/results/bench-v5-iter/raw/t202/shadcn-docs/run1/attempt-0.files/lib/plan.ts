import {
  fixtures,
  guests,
  rules,
  tables,
  type Fixture,
  type Guest,
  type Rsvp,
  type Rule,
  type TableDef,
} from "@/lib/data"

/** guest id -> where they sit. Guests without an entry have no seat. */
export type Placements = Record<string, { table: string; seat: number }>

export const guestById: Record<string, Guest> = Object.fromEntries(guests.map((g) => [g.id, g]))
export const tableById: Record<string, TableDef> = Object.fromEntries(tables.map((t) => [t.id, t]))

/* ---------- seating state ---------- */

const HEAD_SEAT_ORDER = [3, 4, 2, 5, 1, 6, 0, 7]

export function initialPlacements(): Placements {
  const out: Placements = {}
  const used: Record<string, number> = {}
  for (const g of guests) {
    if (!g.table) continue
    const t = tableById[g.table]
    const n = used[t.id] ?? 0
    used[t.id] = n + 1
    out[g.id] = { table: t.id, seat: t.shape === "long" ? (HEAD_SEAT_ORDER[n] ?? n) : n }
  }
  return out
}

/** Seat-by-seat view of every table. */
export function buildSeatMap(placements: Placements): Record<string, (Guest | null)[]> {
  const map: Record<string, (Guest | null)[]> = {}
  for (const t of tables) map[t.id] = Array.from({ length: t.seats }, () => null)
  for (const [gid, p] of Object.entries(placements)) {
    const g = guestById[gid]
    if (g && map[p.table]) map[p.table][p.seat] = g
  }
  return map
}

export function canBeSeated(g: Guest): boolean {
  return g.rsvp !== "no"
}

export interface Totals {
  attending: number
  seated: number
  unseated: number
  awaiting: number
  declined: number
  seats: number
  freeSeats: number
}

export function totals(placements: Placements): Totals {
  const seated = Object.keys(placements).length
  const attending = guests.filter((g) => g.rsvp === "yes").length
  const seats = tables.reduce((n, t) => n + t.seats, 0)
  const seatedAttending = guests.filter((g) => g.rsvp === "yes" && placements[g.id]).length
  return {
    attending,
    seated,
    unseated: attending - seatedAttending,
    awaiting: guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !placements[g.id]).length,
    declined: guests.filter((g) => g.rsvp === "no").length,
    seats,
    freeSeats: seats - seated,
  }
}

/* ---------- labels ---------- */

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Awaiting reply",
  no: "Declined",
}

export const STANDARD_MEAL = "Standard menu"

export function mealOf(g: Guest): string {
  return g.diet ?? STANDARD_MEAL
}

export const PARTIES = Array.from(new Set(guests.map((g) => g.party)))
export const DIETS = Array.from(new Set(guests.map((g) => g.diet).filter((d): d is string => !!d))).sort()

const PARTY_HUE: Record<string, number> = {
  Couple: 85,
  "Bride's family": 15,
  "Groom's family": 250,
  "University friends": 155,
  "Work friends": 305,
  "Groom's football club": 55,
  "Plus-ones": 200,
}

export function partyColor(party: string, lightness = 0.86, chroma = 0.09): string {
  return `oklch(${lightness} ${chroma} ${PARTY_HUE[party] ?? 0})`
}

export function initials(name: string): string {
  const parts = name.replace(/^Avó\s+/, "").split(" ").filter(Boolean)
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase()
}

export function formatEventDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number)
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)))
}

/* ---------- geometry (metres) ---------- */

export interface Point {
  x: number
  y: number
}

const TABLE_R = (t: TableDef) => (t.seats <= 6 ? 0.8 : 0.95)
export const SEAT_R = 0.36
export const LONG_W = 6.4
export const LONG_H = 0.9
export const SEAT_PITCH = 0.78

export function tableRadius(t: TableDef): number {
  return TABLE_R(t)
}

/** Centre of every seat around a table, in room metres. */
export function seatPositions(t: TableDef): Point[] {
  if (t.shape === "long") {
    const first = t.x - ((t.seats - 1) * SEAT_PITCH) / 2
    return Array.from({ length: t.seats }, (_, i) => ({
      x: first + i * SEAT_PITCH,
      y: t.y + LONG_H / 2 + SEAT_R + 0.12,
    }))
  }
  const r = TABLE_R(t) + SEAT_R + 0.14
  return Array.from({ length: t.seats }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats
    return { x: t.x + r * Math.cos(a), y: t.y + r * Math.sin(a) }
  })
}

function centre(f: Fixture): Point {
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 }
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function fixtureOfKind(kind: Fixture["kind"]): Fixture | undefined {
  return fixtures.find((f) => f.kind === kind)
}

/* ---------- rules ---------- */

export type RuleStatus = "ok" | "broken" | "open"

export interface RuleResult {
  index: number
  rule: Rule
  status: RuleStatus
  /** One-line explanation of the current state. */
  message: string
  /** Tables to flag. Only filled for broken rules. */
  tables: string[]
  /** Guests whose seats to flag. Only filled for broken rules. */
  guests: string[]
}

const KIND_LABEL: Record<Rule["kind"], string> = {
  together: "Keep together",
  apart: "Keep apart",
  near: "Seat near",
}

export function ruleKindLabel(kind: Rule["kind"]): string {
  return KIND_LABEL[kind]
}

export function evaluateRules(placements: Placements): RuleResult[] {
  return rules.map((rule, index): RuleResult => {
    const names = rule.guests.map((id) => guestById[id]?.name ?? id)
    const seatedIds = rule.guests.filter((id) => placements[id])
    const missing = rule.guests.filter((id) => !placements[id]).map((id) => guestById[id]?.name ?? id)
    const tableName = (id: string) => tableById[id]?.name ?? id

    if (rule.kind === "together") {
      if (missing.length) {
        return { index, rule, status: "open", message: `Not placed yet: ${missing.join(", ")}`, tables: [], guests: [] }
      }
      const at = Array.from(new Set(rule.guests.map((id) => placements[id].table)))
      if (at.length === 1) {
        return { index, rule, status: "ok", message: `Together at ${tableName(at[0])}`, tables: [], guests: [] }
      }
      return {
        index,
        rule,
        status: "broken",
        message: `${names.join(" and ")} are split across ${at.map(tableName).join(" and ")}`,
        tables: at,
        guests: rule.guests,
      }
    }

    if (rule.kind === "apart") {
      const at = seatedIds.map((id) => placements[id].table)
      const clash = at.length === rule.guests.length && new Set(at).size < at.length
      if (clash) {
        return {
          index,
          rule,
          status: "broken",
          message: `${names.join(" and ")} are both at ${tableName(at[0])}`,
          tables: [at[0]],
          guests: rule.guests,
        }
      }
      if (missing.length) {
        return { index, rule, status: "open", message: `Not placed yet: ${missing.join(", ")}`, tables: [], guests: [] }
      }
      return { index, rule, status: "ok", message: `Apart: ${at.map(tableName).join(" and ")}`, tables: [], guests: [] }
    }

    // near
    const gid = rule.guests[0]
    const p = placements[gid]
    if (!p) {
      return { index, rule, status: "open", message: `Not placed yet: ${names[0]}`, tables: [], guests: [] }
    }
    const t = tableById[p.table]
    const target = fixtureOfKind(rule.target)
    const avoid = fixtureOfKind(rule.avoid)
    const dTarget = target ? distance(t, centre(target)) : 0
    const dAvoid = avoid ? distance(t, centre(avoid)) : Infinity
    const targetLabel = target?.label.toLowerCase() ?? "the target"
    const avoidLabel = avoid?.label.toLowerCase() ?? "the band"
    if (dTarget > rule.within) {
      return {
        index,
        rule,
        status: "broken",
        message: `${t.name} is ${dTarget.toFixed(1)} m from the ${targetLabel} (aim for ${rule.within} m or less)`,
        tables: [t.id],
        guests: [gid],
      }
    }
    if (dAvoid < rule.awayBy) {
      return {
        index,
        rule,
        status: "broken",
        message: `${t.name} is only ${dAvoid.toFixed(1)} m from the ${avoidLabel} (aim for ${rule.awayBy} m or more)`,
        tables: [t.id],
        guests: [gid],
      }
    }
    return {
      index,
      rule,
      status: "ok",
      message: `${t.name} is ${dTarget.toFixed(1)} m from the ${targetLabel} and ${dAvoid.toFixed(0)} m from the ${avoidLabel}`,
      tables: [],
      guests: [],
    }
  })
}

/* ---------- moving guests ---------- */

export interface MoveResult {
  ok: boolean
  placements: Placements
  message: string
}

/** Seat a guest at a table (first free seat, or a given seat; swaps if the seat holds someone and the guest is seated). */
export function placeGuest(placements: Placements, guestId: string, tableId: string, seat?: number): MoveResult {
  const g = guestById[guestId]
  const t = tableById[tableId]
  if (!g || !t) return { ok: false, placements, message: "Unknown guest or table" }
  if (!canBeSeated(g)) return { ok: false, placements, message: `${g.name} has declined` }

  const map = buildSeatMap(placements)
  const current = placements[guestId]

  if (seat === undefined) {
    if (current?.table === tableId) return { ok: false, placements, message: `${g.name} is already at ${t.name}` }
    const free = map[tableId].findIndex((s) => s === null)
    if (free === -1) return { ok: false, placements, message: `${t.name} is full` }
    return {
      ok: true,
      placements: { ...placements, [guestId]: { table: tableId, seat: free } },
      message: current ? `${g.name} moved to ${t.name}` : `${g.name} seated at ${t.name}`,
    }
  }

  const occupant = map[tableId][seat]
  if (occupant?.id === guestId) return { ok: false, placements, message: "" }
  if (occupant) {
    if (!current) return { ok: false, placements, message: `That seat is taken by ${occupant.name}` }
    return {
      ok: true,
      placements: { ...placements, [guestId]: { table: tableId, seat }, [occupant.id]: current },
      message: `${g.name} and ${occupant.name} swapped seats`,
    }
  }
  return {
    ok: true,
    placements: { ...placements, [guestId]: { table: tableId, seat } },
    message: current ? `${g.name} moved to ${t.name}` : `${g.name} seated at ${t.name}`,
  }
}

export function unseatGuest(placements: Placements, guestId: string): MoveResult {
  const g = guestById[guestId]
  if (!g || !placements[guestId]) return { ok: false, placements, message: "" }
  const next = { ...placements }
  delete next[guestId]
  return { ok: true, placements: next, message: `${g.name} unseated` }
}

/* ---------- meals ---------- */

export interface MealRow {
  meal: string
  confirmed: number
  awaiting: number
}

export function mealCounts(): MealRow[] {
  const rows = new Map<string, MealRow>()
  const get = (meal: string) => {
    let r = rows.get(meal)
    if (!r) {
      r = { meal, confirmed: 0, awaiting: 0 }
      rows.set(meal, r)
    }
    return r
  }
  get(STANDARD_MEAL)
  for (const d of DIETS) get(d)
  for (const g of guests) {
    if (g.rsvp === "yes") get(mealOf(g)).confirmed += 1
    else if (g.rsvp !== "no") get(mealOf(g)).awaiting += 1
  }
  return Array.from(rows.values())
}
