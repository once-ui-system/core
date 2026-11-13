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

/** For every table, one entry per seat: a guest id or null (empty seat). */
export type SeatMap = Record<string, (string | null)[]>

export const guestById: Record<string, Guest> = Object.fromEntries(
  guests.map((g): [string, Guest] => [g.id, g]),
)
export const tableById: Record<string, TableDef> = Object.fromEntries(
  tables.map((t): [string, TableDef] => [t.id, t]),
)
export const fixtureById: Record<string, Fixture> = Object.fromEntries(
  fixtures.map((f): [string, Fixture] => [f.id, f]),
)

export const ROOM_W = event.room_m.width
export const ROOM_D = event.room_m.depth
export const SEAT_D = 0.9
export const RING_R = 1.5
export const DISC_R = 0.95

export const capacity = tables.reduce((n, t) => n + t.seats, 0)

export function initialSeats(): SeatMap {
  const seats: SeatMap = {}
  for (const t of tables) seats[t.id] = Array.from({ length: t.seats }, () => null)
  for (const g of guests) {
    if (!g.table) continue
    const row = seats[g.table]
    const free = row.indexOf(null)
    if (free >= 0) row[free] = g.id
  }
  return seats
}

export function tableOfMap(seats: SeatMap): Record<string, string> {
  const out: Record<string, string> = {}
  for (const tid of Object.keys(seats)) {
    for (const gid of seats[tid]) if (gid) out[gid] = tid
  }
  return out
}

function copySeats(seats: SeatMap): SeatMap {
  const next: SeatMap = {}
  for (const k of Object.keys(seats)) next[k] = seats[k].slice()
  return next
}

export type PlaceResult =
  | {
      ok: true
      seats: SeatMap
      tableId: string
      seat: number
      displaced: string | null
      swappedWith: string | null
    }
  | { ok: false; reason: string }

/** Seat (or move) a guest. Without a seat index the first empty seat is used. */
export function placeGuest(
  seats: SeatMap,
  guestId: string,
  tableId: string,
  seatIndex?: number,
): PlaceResult {
  const row = seats[tableId]
  const table = tableById[tableId]
  const guest = guestById[guestId]
  if (!row || !table || !guest) return { ok: false, reason: "That seat does not exist." }
  if (guest.rsvp === "no") return { ok: false, reason: `${guest.name} has declined the invitation.` }

  let from: { t: string; i: number } | null = null
  for (const tid of Object.keys(seats)) {
    const i = seats[tid].indexOf(guestId)
    if (i >= 0) from = { t: tid, i }
  }

  let target = seatIndex
  if (target === undefined) {
    if (from && from.t === tableId) {
      return { ok: false, reason: `${guest.name} already sits at ${table.name}.` }
    }
    target = row.indexOf(null)
    if (target < 0) {
      return { ok: false, reason: `${table.name} is full: all ${row.length} seats are taken.` }
    }
  }
  if (from && from.t === tableId && from.i === target) {
    return { ok: false, reason: `${guest.name} already sits there.` }
  }

  const next = copySeats(seats)
  const occupant = next[tableId][target]
  if (from) next[from.t][from.i] = null
  next[tableId][target] = guestId
  let displaced: string | null = null
  let swappedWith: string | null = null
  if (occupant) {
    if (from) {
      next[from.t][from.i] = occupant
      swappedWith = occupant
    } else {
      displaced = occupant
    }
  }
  return { ok: true, seats: next, tableId, seat: target, displaced, swappedWith }
}

export function unseatGuest(seats: SeatMap, guestId: string): SeatMap {
  const next = copySeats(seats)
  for (const tid of Object.keys(next)) {
    next[tid] = next[tid].map((g) => (g === guestId ? null : g))
  }
  return next
}

/* ------------------------------ geometry ------------------------------ */

export interface SeatPos {
  cx: number
  cy: number
}
export interface TableGeo {
  id: string
  cx: number
  cy: number
  shape: "round" | "long"
  body: { x: number; y: number; w: number; h: number }
  seats: SeatPos[]
}

export function tableGeo(t: TableDef): TableGeo {
  if (t.shape === "round") {
    const seats = Array.from({ length: t.seats }, (_, i) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / t.seats
      return { cx: t.x + RING_R * Math.cos(a), cy: t.y + RING_R * Math.sin(a) }
    })
    return {
      id: t.id,
      cx: t.x,
      cy: t.y,
      shape: "round",
      body: { x: t.x - DISC_R, y: t.y - DISC_R, w: DISC_R * 2, h: DISC_R * 2 },
      seats,
    }
  }
  // Long table: x, y is the top left corner, seats on both long sides.
  const top = Math.ceil(t.seats / 2)
  const bottom = t.seats - top
  const w = top * 2
  const h = 1.2
  const seats: SeatPos[] = []
  for (let i = 0; i < top; i++) seats.push({ cx: t.x + ((i + 0.5) * w) / top, cy: t.y - 0.55 })
  for (let i = 0; i < bottom; i++) {
    seats.push({ cx: t.x + ((i + 0.5) * w) / bottom, cy: t.y + h + 0.55 })
  }
  return {
    id: t.id,
    cx: t.x + w / 2,
    cy: t.y + h / 2,
    shape: "long",
    body: { x: t.x, y: t.y, w, h },
    seats,
  }
}

export const geos: TableGeo[] = tables.map(tableGeo)
export const geoById: Record<string, TableGeo> = Object.fromEntries(
  geos.map((g): [string, TableGeo] => [g.id, g]),
)

function distanceToFixture(geo: TableGeo, f: Fixture): number {
  const dx = Math.max(f.x - geo.cx, 0, geo.cx - (f.x + f.w))
  const dy = Math.max(f.y - geo.cy, 0, geo.cy - (f.y + f.h))
  return Math.hypot(dx, dy)
}

/* ------------------------------ rules ------------------------------ */

export type RuleStatus = "kept" | "broken" | "waiting"
export interface RuleResult {
  id: string
  kind: Rule["kind"]
  note: string
  guestIds: string[]
  status: RuleStatus
  message: string
  tableIds: string[]
}

/** "Near": within `within` m of the target fixture and at least `awayFrom` m from the one to avoid. */
const NEAR = { target: "f-4", avoid: "f-1", within: 3.5, awayFrom: 5 }

export function evaluateRules(tableOf: Record<string, string>): RuleResult[] {
  return rules.map((rule, index): RuleResult => {
    const base = {
      id: `rule-${index}`,
      kind: rule.kind,
      note: rule.note,
      guestIds: rule.guests,
    }
    const names = rule.guests.map((id) => guestById[id].name)
    const tIds = rule.guests.map((id) => tableOf[id] ?? null)
    const unseated = rule.guests.filter((id) => !tableOf[id]).map((id) => guestById[id].name)
    const tName = (id: string) => tableById[id].name

    if (rule.kind === "near") {
      const name = names[0]
      const tid = tIds[0]
      if (!tid) {
        return { ...base, status: "waiting", message: `${name} has no seat yet.`, tableIds: [] }
      }
      const geo = geoById[tid]
      const door = distanceToFixture(geo, fixtureById[NEAR.target])
      const band = distanceToFixture(geo, fixtureById[NEAR.avoid])
      const problems: string[] = []
      if (door > NEAR.within) {
        problems.push(`${tName(tid)} is ${door.toFixed(1)} m from the ${fixtureById[NEAR.target].label.toLowerCase()} (wanted within ${NEAR.within} m)`)
      }
      if (band < NEAR.awayFrom) {
        problems.push(`${tName(tid)} is only ${band.toFixed(1)} m from the band (wanted ${NEAR.awayFrom} m or more)`)
      }
      if (problems.length > 0) {
        return { ...base, status: "broken", message: `${problems.join("; ")}.`, tableIds: [tid] }
      }
      return {
        ...base,
        status: "kept",
        message: `${name} is at ${tName(tid)}, ${door.toFixed(1)} m from the garden doors and ${band.toFixed(1)} m from the band.`,
        tableIds: [tid],
      }
    }

    if (unseated.length > 0) {
      return {
        ...base,
        status: "waiting",
        message:
          rule.kind === "together"
            ? `Waiting for ${unseated.join(" and ")} to be seated.`
            : `Not tested yet: ${unseated.join(" and ")} has no seat.`,
        tableIds: [],
      }
    }
    const [a, b] = tIds as [string, string]
    if (rule.kind === "together") {
      if (a === b) {
        return { ...base, status: "kept", message: `${names.join(" and ")} share ${tName(a)}.`, tableIds: [a] }
      }
      return {
        ...base,
        status: "broken",
        message: `${names[0]} is at ${tName(a)} but ${names[1]} is at ${tName(b)}. They should sit together.`,
        tableIds: [a, b],
      }
    }
    if (a === b) {
      return {
        ...base,
        status: "broken",
        message: `${names.join(" and ")} are both at ${tName(a)}. They should sit apart.`,
        tableIds: [a],
      }
    }
    return {
      ...base,
      status: "kept",
      message: `${names[0]} (${tName(a)}) and ${names[1]} (${tName(b)}) sit apart.`,
      tableIds: [a, b],
    }
  })
}

/* ------------------------------ meals ------------------------------ */

export interface MealRow {
  key: string
  label: string
  diet: string | null
  confirmed: number
  awaiting: number
}

export const STANDARD_MEAL = "Standard menu"

export const dietNames: string[] = Array.from(
  new Set(guests.map((g) => g.diet).filter((d): d is string => d !== null)),
).sort((a, b) => a.localeCompare(b))

export function mealRows(): MealRow[] {
  const rows: MealRow[] = [null, ...dietNames].map((diet) => ({
    key: diet ?? "none",
    label: diet ?? STANDARD_MEAL,
    diet,
    confirmed: 0,
    awaiting: 0,
  }))
  for (const g of guests) {
    const row = rows.find((r) => r.diet === g.diet)
    if (!row) continue
    if (g.rsvp === "yes") row.confirmed += 1
    else if (g.rsvp === "maybe" || g.rsvp === "pending") row.awaiting += 1
  }
  return rows
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
    timeZone: "UTC",
  }).format(new Date(`${iso}T12:00:00Z`))
}

export function catererSummary(rows: MealRow[]): string {
  const confirmed = rows.reduce((n, r) => n + r.confirmed, 0)
  const awaiting = rows.reduce((n, r) => n + r.awaiting, 0)
  return [
    `${event.name}, ${formatDate(event.date)}`,
    event.venue,
    "",
    "Meals (confirmed guests, plus those still to reply):",
    ...rows.map((r) => `${r.label}: ${r.confirmed}${r.awaiting ? ` (+${r.awaiting} awaiting reply)` : ""}`),
    "",
    `Confirmed in total: ${confirmed}. Awaiting reply: ${awaiting}.`,
  ].join("\n")
}

/* ------------------------------ labels ------------------------------ */

export const rsvpLabel: Record<Guest["rsvp"], string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Awaiting reply",
  no: "Declined",
}
export const rsvpPalette: Record<Guest["rsvp"], string> = {
  yes: "green",
  maybe: "yellow",
  pending: "gray",
  no: "red",
}

const PARTY_COLORS: Record<string, string> = {
  Couple: "pink",
  "Bride's family": "purple",
  "Groom's family": "blue",
  "University friends": "teal",
  "Work friends": "orange",
  "Groom's football club": "green",
  "Plus-ones": "cyan",
}
export function partyColor(party: string): string {
  return PARTY_COLORS[party] ?? "gray"
}
export const parties: string[] = Array.from(new Set(guests.map((g) => g.party)))

export function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}
