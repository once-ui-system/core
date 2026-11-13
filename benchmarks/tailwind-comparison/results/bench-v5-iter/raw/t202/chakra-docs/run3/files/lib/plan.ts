import {
  event,
  fixtures,
  guests,
  rules,
  tables,
  type Fixture,
  type Guest,
  type Rule,
  type TableDef,
} from "./data"

/* ------------------------------------------------------------------ lookups */

export const guestById: Record<string, Guest> = Object.fromEntries(
  guests.map((g) => [g.id, g]),
)
export const tableById: Record<string, TableDef> = Object.fromEntries(
  tables.map((t) => [t.id, t]),
)

export const PARTIES: string[] = Array.from(new Set(guests.map((g) => g.party)))

const PARTY_PALETTE: Record<string, string> = {
  Couple: "pink",
  "Bride's family": "purple",
  "Groom's family": "orange",
  "University friends": "blue",
  "Work friends": "teal",
  "Groom's football club": "green",
  "Plus-ones": "cyan",
}

export function partyPalette(party: string): string {
  return PARTY_PALETTE[party] ?? "gray"
}

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : ""
  return (first + last).toUpperCase()
}

export function firstName(name: string): string {
  return name.split(/\s+/)[0] ?? name
}

export const RSVP_LABEL: Record<Guest["rsvp"], string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Awaiting reply",
  no: "Declined",
}

export const RSVP_PALETTE: Record<Guest["rsvp"], string> = {
  yes: "green",
  maybe: "orange",
  pending: "gray",
  no: "red",
}

export function formatEventDate(): string {
  return new Date(`${event.date}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
}

/* -------------------------------------------------------------- seating state */

/** table id -> one entry per seat, holding a guest id or null */
export type Seats = Record<string, (string | null)[]>

export interface Position {
  tableId: string
  seat: number
}

/** Seat order at the top table: the couple in the middle, an empty seat at each end. */
const HEAD_TABLE_ORDER = ["g-04", "g-03", "g-01", "g-02", "g-05", "g-06"]

export function initialSeats(): Seats {
  const seats: Seats = {}
  for (const t of tables) seats[t.id] = Array.from({ length: t.seats }, () => null)
  for (const t of tables) {
    const row = seats[t.id]
    if (!row) continue
    if (t.id === "t-head") {
      HEAD_TABLE_ORDER.forEach((gid, i) => {
        row[i + 1] = gid
      })
      continue
    }
    let i = 0
    for (const g of guests) {
      if (g.table === t.id && i < row.length) row[i++] = g.id
    }
  }
  return seats
}

export function locateAll(seats: Seats): Record<string, Position> {
  const out: Record<string, Position> = {}
  for (const [tableId, row] of Object.entries(seats)) {
    row.forEach((gid, seat) => {
      if (gid) out[gid] = { tableId, seat }
    })
  }
  return out
}

export function filledCount(row: (string | null)[] | undefined): number {
  return row ? row.filter(Boolean).length : 0
}

export interface PlaceResult {
  seats: Seats
  ok: boolean
  changed: boolean
  message: string
}

function cloneSeats(seats: Seats): Seats {
  const next: Seats = {}
  for (const [k, v] of Object.entries(seats)) next[k] = v.slice()
  return next
}

/**
 * Seat, move or swap a guest. Without a seat index the guest takes the first free seat.
 * Dropping onto an occupied seat swaps the two guests (or, for an unseated guest at a full
 * table, sends the occupant back to the unseated list).
 */
export function placeGuest(
  seats: Seats,
  guestId: string,
  tableId: string,
  seatIndex?: number,
): PlaceResult {
  const guest = guestById[guestId]
  const table = tableById[tableId]
  if (!guest || !table) {
    return { seats, ok: false, changed: false, message: "That seat does not exist." }
  }
  if (guest.rsvp === "no") {
    return {
      seats,
      ok: false,
      changed: false,
      message: `${guest.name} has declined, so they cannot be seated.`,
    }
  }
  const here = locateAll(seats)[guestId]
  const target = seats[tableId]
  if (!target) {
    return { seats, ok: false, changed: false, message: "That table does not exist." }
  }
  const next = cloneSeats(seats)
  const nextTarget = next[tableId]
  if (!nextTarget) return { seats, ok: false, changed: false, message: "That table does not exist." }

  let idx = seatIndex
  if (idx === undefined) {
    if (here && here.tableId === tableId) {
      return {
        seats,
        ok: true,
        changed: false,
        message: `${guest.name} is already at ${table.name}.`,
      }
    }
    idx = nextTarget.findIndex((s) => s === null)
    if (idx === -1) {
      return {
        seats,
        ok: false,
        changed: false,
        message: `${table.name} is full. Drop onto a seat to swap with someone there.`,
      }
    }
  }

  const occupant = nextTarget[idx] ?? null
  if (occupant === guestId) {
    return { seats, ok: true, changed: false, message: `${guest.name} is already in that seat.` }
  }

  if (occupant) {
    const other = guestById[occupant]
    if (here) {
      // swap two seated guests
      const hereRow = next[here.tableId]
      if (hereRow) hereRow[here.seat] = occupant
      nextTarget[idx] = guestId
      return {
        seats: next,
        ok: true,
        changed: true,
        message: `${guest.name} and ${other?.name ?? "another guest"} swapped seats.`,
      }
    }
    // unseated guest dropped on an occupied seat
    const free = nextTarget.findIndex((s) => s === null)
    if (free !== -1) {
      nextTarget[free] = guestId
      return {
        seats: next,
        ok: true,
        changed: true,
        message: `${guest.name} seated at ${table.name}.`,
      }
    }
    nextTarget[idx] = guestId
    return {
      seats: next,
      ok: true,
      changed: true,
      message: `${guest.name} took ${other?.name ?? "the seat"}'s place at ${table.name}. ${other?.name ?? "They"} moved to the unseated list.`,
    }
  }

  if (here) {
    const hereRow = next[here.tableId]
    if (hereRow) hereRow[here.seat] = null
  }
  nextTarget[idx] = guestId
  const verb = here ? (here.tableId === tableId ? "moved within" : "moved to") : "seated at"
  return {
    seats: next,
    ok: true,
    changed: true,
    message: `${guest.name} ${verb} ${table.name}.`,
  }
}

export function unseatGuest(seats: Seats, guestId: string): PlaceResult {
  const here = locateAll(seats)[guestId]
  const guest = guestById[guestId]
  if (!here || !guest) return { seats, ok: true, changed: false, message: "" }
  const next = cloneSeats(seats)
  const row = next[here.tableId]
  if (row) row[here.seat] = null
  return {
    seats: next,
    ok: true,
    changed: true,
    message: `${guest.name} unseated from ${tableById[here.tableId]?.name ?? "a table"}.`,
  }
}

/* ------------------------------------------------------------------- counts */

export interface PlanCounts {
  seated: number
  attending: number
  attendingSeated: number
  unseated: Guest[]
  awaiting: Guest[]
  totalSeats: number
  freeSeats: number
}

export function planCounts(seats: Seats): PlanCounts {
  const pos = locateAll(seats)
  const attending = guests.filter((g) => g.rsvp === "yes")
  const unseated = attending.filter((g) => !pos[g.id])
  const awaiting = guests.filter(
    (g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !pos[g.id],
  )
  const seated = Object.keys(pos).length
  const totalSeats = tables.reduce((n, t) => n + t.seats, 0)
  return {
    seated,
    attending: attending.length,
    attendingSeated: attending.length - unseated.length,
    unseated,
    awaiting,
    totalSeats,
    freeSeats: totalSeats - seated,
  }
}

/* ------------------------------------------------------------------ geometry */

export const ROOM = event.room_m

export interface TableGeometry {
  /** table group box, in metres, room coordinates */
  left: number
  top: number
  w: number
  h: number
  /** the cloth / table body inside the group, in metres, group coordinates */
  body: { x: number; y: number; w: number; h: number }
  seatSize: number
  /** seat centres, in metres, group coordinates */
  seatCentres: { x: number; y: number }[]
}

const SEAT_SIZE = 0.78
const ROUND_HALO = 1.9
const ROUND_CLOTH = 1.0
const ROUND_RING = 1.5

export function tableGeometry(t: TableDef): TableGeometry {
  if (t.shape === "long") {
    const gw = t.seats * 0.84 + 0.6
    const gh = 1.95
    const bodyH = 0.95
    const body = { x: 0.3, y: 0.05, w: gw - 0.6, h: bodyH }
    const seatCentres = Array.from({ length: t.seats }, (_, i) => ({
      x: gw / 2 + (i - (t.seats - 1) / 2) * 0.84,
      y: body.y + bodyH + 0.5,
    }))
    return {
      left: t.x - gw / 2,
      top: t.y - (body.y + bodyH / 2),
      w: gw,
      h: gh,
      body,
      seatSize: SEAT_SIZE,
      seatCentres,
    }
  }
  const gw = ROUND_HALO * 2
  const seatCentres = Array.from({ length: t.seats }, (_, i) => {
    const a = ((-90 + (i * 360) / t.seats) * Math.PI) / 180
    return { x: ROUND_HALO + Math.cos(a) * ROUND_RING, y: ROUND_HALO + Math.sin(a) * ROUND_RING }
  })
  return {
    left: t.x - ROUND_HALO,
    top: t.y - ROUND_HALO,
    w: gw,
    h: gw,
    body: { x: ROUND_HALO - ROUND_CLOTH, y: ROUND_HALO - ROUND_CLOTH, w: ROUND_CLOTH * 2, h: ROUND_CLOTH * 2 },
    seatSize: SEAT_SIZE,
    seatCentres,
  }
}

export function fixtureOfKind(kind: Fixture["kind"]): Fixture | undefined {
  return fixtures.find((f) => f.kind === kind)
}

function centre(f: Fixture): { x: number; y: number } {
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 }
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export const NEAR_MAX_M = 4
export const AWAY_MIN_M = 6

function distanceToFixture(t: TableDef, kind: Fixture["kind"]): number | null {
  const f = fixtureOfKind(kind)
  return f ? dist(t, centre(f)) : null
}

/* -------------------------------------------------------------------- rules */

export type RuleStatus = "kept" | "broken" | "open"

export interface RuleResult {
  rule: Rule
  status: RuleStatus
  title: string
  detail: string
  /** tables that get the flag when the rule is broken */
  flagTables: string[]
  /** guests that get the flag when the rule is broken */
  flagGuests: string[]
  /** tables the rule currently touches (for jumping to them) */
  tables: string[]
}

const RULE_LABEL: Record<Rule["kind"], string> = {
  together: "Keep together",
  apart: "Keep apart",
  near: "Seat near",
}

function names(ids: string[]): string {
  return ids.map((id) => guestById[id]?.name ?? id).join(" and ")
}

function tableName(id: string): string {
  return tableById[id]?.name ?? id
}

function metres(n: number): string {
  return `${n.toFixed(1)} m`
}

export function evaluateRules(seats: Seats): RuleResult[] {
  const pos = locateAll(seats)
  return rules.map((rule): RuleResult => {
    const placed = rule.guests.map((id) => pos[id])
    const seatedTables = placed.filter((p): p is Position => !!p).map((p) => p.tableId)
    const touched = Array.from(new Set(seatedTables))

    if (rule.kind === "near") {
      const id = rule.guests[0] ?? ""
      const p = pos[id]
      const guest = guestById[id]
      const title = `${RULE_LABEL.near} the ${fixtureOfKind(rule.near ?? "door")?.label.toLowerCase() ?? "door"}: ${guest?.name ?? id}`
      if (!p) {
        return {
          rule,
          status: "open",
          title,
          detail: `${guest?.name ?? "This guest"} is not seated yet.`,
          flagTables: [],
          flagGuests: [],
          tables: [],
        }
      }
      const t = tableById[p.tableId]
      const dNear = t && rule.near ? distanceToFixture(t, rule.near) : null
      const dAway = t && rule.away ? distanceToFixture(t, rule.away) : null
      const tooFar = dNear !== null && dNear > NEAR_MAX_M
      const tooClose = dAway !== null && dAway < AWAY_MIN_M
      if (tooFar || tooClose) {
        const options = tables
          .filter((c) => {
            if (c.id === p.tableId) return false
            if (filledCount(seats[c.id]) >= c.seats) return false
            const n = rule.near ? distanceToFixture(c, rule.near) : 0
            const a = rule.away ? distanceToFixture(c, rule.away) : AWAY_MIN_M
            return (n ?? 0) <= NEAR_MAX_M && (a ?? AWAY_MIN_M) >= AWAY_MIN_M
          })
          .sort(
            (x, y) =>
              (rule.near ? (distanceToFixture(x, rule.near) ?? 0) : 0) -
              (rule.near ? (distanceToFixture(y, rule.near) ?? 0) : 0),
          )
        const why = tooFar
          ? `${t?.name} is about ${metres(dNear ?? 0)} from the ${fixtureOfKind(rule.near ?? "door")?.label.toLowerCase()}, over the ${NEAR_MAX_M} m limit`
          : `${t?.name} is only ${metres(dAway ?? 0)} from the ${fixtureOfKind(rule.away ?? "stage")?.label.toLowerCase()}`
        const first = options[0]
        return {
          rule,
          status: "broken",
          title,
          detail: `${why}.${first ? ` ${first.name} has room and is closer.` : ""}`,
          flagTables: [p.tableId],
          flagGuests: [id],
          tables: [p.tableId],
        }
      }
      return {
        rule,
        status: "kept",
        title,
        detail: `${t?.name} is about ${metres(dNear ?? 0)} from the ${fixtureOfKind(rule.near ?? "door")?.label.toLowerCase()} and ${metres(dAway ?? 0)} from the ${fixtureOfKind(rule.away ?? "stage")?.label.toLowerCase()}.`,
        flagTables: [],
        flagGuests: [],
        tables: [p.tableId],
      }
    }

    const title = `${RULE_LABEL[rule.kind]}: ${names(rule.guests)}`
    const [a, b] = rule.guests
    const pa = a ? pos[a] : undefined
    const pb = b ? pos[b] : undefined
    if (!pa || !pb) {
      const missing = rule.guests.filter((id) => !pos[id])
      const detail =
        missing.length === rule.guests.length
          ? "Neither guest is seated yet."
          : `${names(missing)} is not seated yet${touched[0] ? `; the other is at ${tableName(touched[0])}` : ""}.`
      return { rule, status: "open", title, detail, flagTables: [], flagGuests: [], tables: touched }
    }
    const same = pa.tableId === pb.tableId
    if (rule.kind === "together") {
      return same
        ? {
            rule,
            status: "kept",
            title,
            detail: `Both at ${tableName(pa.tableId)}.`,
            flagTables: [],
            flagGuests: [],
            tables: [pa.tableId],
          }
        : {
            rule,
            status: "broken",
            title,
            detail: `${guestById[a ?? ""]?.name} is at ${tableName(pa.tableId)}, ${guestById[b ?? ""]?.name} at ${tableName(pb.tableId)}.`,
            flagTables: [pa.tableId, pb.tableId],
            flagGuests: [a ?? "", b ?? ""],
            tables: [pa.tableId, pb.tableId],
          }
    }
    // apart
    return same
      ? {
          rule,
          status: "broken",
          title,
          detail: `Both at ${tableName(pa.tableId)}.`,
          flagTables: [pa.tableId],
          flagGuests: [a ?? "", b ?? ""],
          tables: [pa.tableId],
        }
      : {
          rule,
          status: "kept",
          title,
          detail: `${tableName(pa.tableId)} and ${tableName(pb.tableId)}.`,
          flagTables: [],
          flagGuests: [],
          tables: [pa.tableId, pb.tableId],
        }
  })
}

/* --------------------------------------------------------------- meal counts */

export const STANDARD_MEAL = "Standard menu"

export interface MealRow {
  meal: string
  confirmed: number
  awaiting: number
}

export function mealCounts(): { rows: MealRow[]; confirmed: number; awaiting: number; declined: number } {
  const map = new Map<string, MealRow>()
  let declined = 0
  for (const g of guests) {
    if (g.rsvp === "no") {
      declined++
      continue
    }
    const meal = g.diet ?? STANDARD_MEAL
    const row = map.get(meal) ?? { meal, confirmed: 0, awaiting: 0 }
    if (g.rsvp === "yes") row.confirmed++
    else row.awaiting++
    map.set(meal, row)
  }
  const rows = Array.from(map.values()).sort((a, b) => {
    if (a.meal === STANDARD_MEAL) return -1
    if (b.meal === STANDARD_MEAL) return 1
    return b.confirmed + b.awaiting - (a.confirmed + a.awaiting) || a.meal.localeCompare(b.meal)
  })
  return {
    rows,
    confirmed: rows.reduce((n, r) => n + r.confirmed, 0),
    awaiting: rows.reduce((n, r) => n + r.awaiting, 0),
    declined,
  }
}

export const DIETS: string[] = Array.from(
  new Set(guests.map((g) => g.diet).filter((d): d is string => !!d)),
).sort((a, b) => a.localeCompare(b))
