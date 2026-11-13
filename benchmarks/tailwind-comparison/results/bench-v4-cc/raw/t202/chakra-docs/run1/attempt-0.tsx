```ts lib/data.ts
export type Rsvp = "yes" | "maybe" | "pending" | "no"
export type FixtureKind = "stage" | "dancefloor" | "bar" | "door"
export type RuleKind = "together" | "apart" | "near"

export interface Guest {
  id: string
  name: string
  party: string
  rsvp: Rsvp
  diet: string | null
  table: string | null
}

export interface Fixture {
  id: string
  kind: FixtureKind
  label: string
  x: number
  y: number
  w: number
  h: number
}

export interface TableDef {
  id: string
  name: string
  shape: "round" | "long"
  seats: number
  x: number
  y: number
  rotation?: number
}

export interface Rule {
  kind: RuleKind
  guests: string[]
  note: string
}

export const app = "Seatwise, a seating planner for wedding and event planners"

export const event = {
  name: "Ines & Mateo's wedding dinner",
  date: "2027-06-19",
  venue: "The Orangery, Hollin Hall",
  room_m: { width: 24, depth: 14 },
}

export const planner = { name: "Hannah Brook" }

export const fixtures: Fixture[] = [
  { id: "f-1", kind: "stage", label: "Band", x: 10, y: 0.5, w: 4, h: 2 },
  { id: "f-2", kind: "dancefloor", label: "Dance floor", x: 8.5, y: 3, w: 7, h: 4 },
  { id: "f-3", kind: "bar", label: "Bar", x: 21, y: 10, w: 2.5, h: 3.5 },
  { id: "f-4", kind: "door", label: "Garden doors", x: 0, y: 6, w: 0.5, h: 2.5 },
]

export const tables: TableDef[] = [
  { id: "t-head", name: "Top table", shape: "long", seats: 8, x: 8, y: 8.2, rotation: 0 },
  { id: "t-1", name: "Table 1", shape: "round", seats: 8, x: 3, y: 2.5 },
  { id: "t-2", name: "Table 2", shape: "round", seats: 8, x: 3, y: 7 },
  { id: "t-3", name: "Table 3", shape: "round", seats: 8, x: 3, y: 11.5 },
  { id: "t-4", name: "Table 4", shape: "round", seats: 8, x: 19, y: 2.5 },
  { id: "t-5", name: "Table 5", shape: "round", seats: 8, x: 19, y: 7 },
  { id: "t-6", name: "Table 6", shape: "round", seats: 6, x: 12, y: 12 },
]

export const guests: Guest[] = [
  { id: "g-01", name: "Ines Carvalho", party: "Couple", rsvp: "yes", diet: null, table: "t-head" },
  { id: "g-02", name: "Mateo Alvarez", party: "Couple", rsvp: "yes", diet: "Vegetarian", table: "t-head" },
  { id: "g-03", name: "Rui Carvalho", party: "Bride's family", rsvp: "yes", diet: null, table: "t-head" },
  { id: "g-04", name: "Marta Carvalho", party: "Bride's family", rsvp: "yes", diet: "Gluten free", table: "t-head" },
  { id: "g-05", name: "Javier Alvarez", party: "Groom's family", rsvp: "yes", diet: null, table: "t-head" },
  { id: "g-06", name: "Lucia Alvarez", party: "Groom's family", rsvp: "yes", diet: null, table: "t-head" },
  { id: "g-07", name: "Sofia Carvalho", party: "Bride's family", rsvp: "yes", diet: null, table: "t-1" },
  { id: "g-08", name: "Tiago Carvalho", party: "Bride's family", rsvp: "yes", diet: null, table: "t-1" },
  { id: "g-09", name: "Avó Rosa Carvalho", party: "Bride's family", rsvp: "yes", diet: "Soft food", table: "t-1" },
  { id: "g-10", name: "Pedro Nunes", party: "Bride's family", rsvp: "yes", diet: null, table: "t-1" },
  { id: "g-11", name: "Ana Nunes", party: "Bride's family", rsvp: "yes", diet: "Vegan", table: "t-1" },
  { id: "g-12", name: "Carmen Alvarez", party: "Groom's family", rsvp: "yes", diet: null, table: "t-4" },
  { id: "g-13", name: "Diego Alvarez", party: "Groom's family", rsvp: "yes", diet: null, table: "t-4" },
  { id: "g-14", name: "Elena Ruiz", party: "Groom's family", rsvp: "yes", diet: "Nut allergy", table: "t-4" },
  { id: "g-15", name: "Pablo Ruiz", party: "Groom's family", rsvp: "yes", diet: null, table: "t-4" },
  { id: "g-16", name: "Isabel Ruiz", party: "Groom's family", rsvp: "maybe", diet: null, table: null },
  { id: "g-17", name: "Chloe Martin", party: "University friends", rsvp: "yes", diet: null, table: "t-2" },
  { id: "g-18", name: "Ben Okafor", party: "University friends", rsvp: "yes", diet: null, table: "t-2" },
  { id: "g-19", name: "Leila Haddad", party: "University friends", rsvp: "yes", diet: "Halal", table: "t-2" },
  { id: "g-20", name: "Omar Haddad", party: "University friends", rsvp: "yes", diet: "Halal", table: "t-2" },
  { id: "g-21", name: "Freya Lund", party: "University friends", rsvp: "yes", diet: "Vegetarian", table: null },
  { id: "g-22", name: "Jonas Lund", party: "University friends", rsvp: "yes", diet: null, table: null },
  { id: "g-23", name: "Grace Lee", party: "Work friends", rsvp: "yes", diet: null, table: "t-5" },
  { id: "g-24", name: "Marcus Webb", party: "Work friends", rsvp: "yes", diet: null, table: "t-5" },
  { id: "g-25", name: "Nadia Petrova", party: "Work friends", rsvp: "yes", diet: "Pescatarian", table: "t-5" },
  { id: "g-26", name: "Tom Fisher", party: "Work friends", rsvp: "no", diet: null, table: null },
  { id: "g-27", name: "Hana Sato", party: "Work friends", rsvp: "yes", diet: null, table: null },
  { id: "g-28", name: "Luis Ortega", party: "Groom's football club", rsvp: "yes", diet: null, table: "t-3" },
  { id: "g-29", name: "Kai Brennan", party: "Groom's football club", rsvp: "yes", diet: null, table: "t-3" },
  { id: "g-30", name: "Sean Doyle", party: "Groom's football club", rsvp: "yes", diet: null, table: "t-3" },
  { id: "g-31", name: "Ryan Doyle", party: "Groom's football club", rsvp: "yes", diet: null, table: null },
  { id: "g-32", name: "Hugo Carvalho", party: "Bride's family", rsvp: "yes", diet: "Children's menu", table: "t-1" },
  { id: "g-33", name: "Mia Carvalho", party: "Bride's family", rsvp: "yes", diet: "Children's menu", table: null },
  { id: "g-34", name: "Paula Mendes", party: "Bride's family", rsvp: "pending", diet: null, table: null },
  { id: "g-35", name: "Victor Mendes", party: "Bride's family", rsvp: "pending", diet: null, table: null },
  { id: "g-36", name: "Zoe Bennett", party: "Plus-ones", rsvp: "yes", diet: null, table: "t-2" },
  { id: "g-37", name: "Arjun Mehta", party: "Plus-ones", rsvp: "yes", diet: "Vegetarian", table: "t-5" },
  { id: "g-38", name: "Laura Svensson", party: "Plus-ones", rsvp: "yes", diet: null, table: null },
]

// The couple's brief says "Brothers Sean and Ryan Doyle are not speaking", but the
// supplied rule lists g-29 (Kai Brennan) and g-30 (Sean). The note names the people, so
// the rule is applied to Sean (g-30) and Ryan (g-31).
export const rules: Rule[] = [
  { kind: "together", guests: ["g-21", "g-22"], note: "Couple" },
  { kind: "together", guests: ["g-32", "g-33"], note: "Siblings, under 10" },
  { kind: "apart", guests: ["g-30", "g-31"], note: "Brothers Sean and Ryan Doyle are not speaking" },
  { kind: "apart", guests: ["g-12", "g-34"], note: "Ask the couple: old family dispute" },
  {
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
  },
]
```

```ts lib/seating.ts
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
```

```tsx components/seatwise/seating-provider.tsx
"use client"

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react"
import { guests, type Guest } from "@/lib/data"
import {
  capacity,
  evaluateRules,
  initialSeats,
  placeGuest,
  tableOfMap,
  unseatGuest,
  type PlaceResult,
  type RuleResult,
  type SeatMap,
} from "@/lib/seating"

interface SeatingState {
  seats: SeatMap
  history: SeatMap[]
}

interface SeatingContextValue {
  seats: SeatMap
  tableOf: Record<string, string>
  rules: RuleResult[]
  seatedCount: number
  capacity: number
  needSeat: Guest[]
  awaitingUnseated: Guest[]
  canUndo: boolean
  seat: (guestId: string, tableId: string, seatIndex?: number) => PlaceResult
  unseat: (guestId: string) => void
  undo: () => void
  reset: () => void
}

const SeatingContext = createContext<SeatingContextValue | null>(null)

export function SeatingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SeatingState>(() => ({ seats: initialSeats(), history: [] }))
  const ref = useRef(state)

  const apply = useCallback((next: SeatingState) => {
    ref.current = next
    setState(next)
  }, [])

  const seat = useCallback(
    (guestId: string, tableId: string, seatIndex?: number): PlaceResult => {
      const cur = ref.current
      const result = placeGuest(cur.seats, guestId, tableId, seatIndex)
      if (result.ok) apply({ seats: result.seats, history: [...cur.history.slice(-49), cur.seats] })
      return result
    },
    [apply],
  )

  const unseat = useCallback(
    (guestId: string) => {
      const cur = ref.current
      apply({ seats: unseatGuest(cur.seats, guestId), history: [...cur.history.slice(-49), cur.seats] })
    },
    [apply],
  )

  const undo = useCallback(() => {
    const cur = ref.current
    const prev = cur.history[cur.history.length - 1]
    if (!prev) return
    apply({ seats: prev, history: cur.history.slice(0, -1) })
  }, [apply])

  const reset = useCallback(() => {
    const cur = ref.current
    apply({ seats: initialSeats(), history: [...cur.history.slice(-49), cur.seats] })
  }, [apply])

  const value = useMemo<SeatingContextValue>(() => {
    const tableOf = tableOfMap(state.seats)
    return {
      seats: state.seats,
      tableOf,
      rules: evaluateRules(tableOf),
      seatedCount: Object.keys(tableOf).length,
      capacity,
      needSeat: guests.filter((g) => g.rsvp === "yes" && !tableOf[g.id]),
      awaitingUnseated: guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !tableOf[g.id]),
      canUndo: state.history.length > 0,
      seat,
      unseat,
      undo,
      reset,
    }
  }, [state, seat, unseat, undo, reset])

  return <SeatingContext.Provider value={value}>{children}</SeatingContext.Provider>
}

export function useSeating(): SeatingContextValue {
  const ctx = useContext(SeatingContext)
  if (!ctx) throw new Error("useSeating must be used inside SeatingProvider")
  return ctx
}
```

```tsx components/seatwise/page-shell.tsx
"use client"

import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { Box, Button, Container, Flex, Text } from "@chakra-ui/react"
import { ColorModeButton } from "@/components/ui/color-mode"
import { event, planner } from "@/lib/data"
import { formatDate } from "@/lib/seating"

const NAV = [
  { href: "/", label: "Plan" },
  { href: "/guests", label: "Guests" },
]

function Logo() {
  return (
    <Flex align="center" gap="2.5">
      <Box
        aria-hidden
        boxSize="9"
        rounded="full"
        bg="teal.solid"
        position="relative"
        flexShrink={0}
        css={{
          "&::after": {
            content: '""',
            position: "absolute",
            inset: "9px",
            borderRadius: "9999px",
            background: "var(--chakra-colors-teal-contrast)",
          },
        }}
      />
      <Text fontWeight="700" fontSize="lg" letterSpacing="-0.02em">
        Seatwise
      </Text>
    </Flex>
  )
}

export function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <Box minH="100dvh" bg="bg.subtle">
      <Box
        as="header"
        position="sticky"
        top="0"
        zIndex="sticky"
        bg="bg/90"
        backdropFilter="blur(10px)"
        borderBottomWidth="1px"
      >
        <Container maxW="1680px" px={{ base: "4", md: "6" }}>
          <Flex align="center" gap={{ base: "3", md: "6" }} py="2.5" wrap="wrap">
            <Logo />
            <Box display={{ base: "none", lg: "block" }} lineHeight="1.25" minW="0">
              <Text fontWeight="600" fontSize="sm" truncate>
                {event.name}
              </Text>
              <Text fontSize="xs" color="fg.muted" truncate>
                {formatDate(event.date)} · {event.venue}
              </Text>
            </Box>
            <Flex as="nav" aria-label="Main" gap="1" ms="auto">
              {NAV.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
                return (
                  <Button
                    key={item.href}
                    asChild
                    size="sm"
                    variant={active ? "subtle" : "ghost"}
                    colorPalette={active ? "teal" : "gray"}
                  >
                    <NextLink href={item.href} aria-current={active ? "page" : undefined}>
                      {item.label}
                    </NextLink>
                  </Button>
                )
              })}
            </Flex>
            <Flex align="center" gap="2">
              <Flex align="center" gap="2" display={{ base: "none", md: "flex" }}>
                <Flex
                  aria-hidden
                  boxSize="8"
                  rounded="full"
                  bg="bg.emphasized"
                  align="center"
                  justify="center"
                  fontSize="xs"
                  fontWeight="600"
                >
                  HB
                </Flex>
                <Text fontSize="sm" color="fg.muted">
                  {planner.name}
                </Text>
              </Flex>
              <ColorModeButton />
            </Flex>
          </Flex>
        </Container>
      </Box>
      <Box as="main" id="main">
        <Container maxW="1680px" px={{ base: "4", md: "6" }} py={{ base: "4", md: "6" }}>
          {children}
        </Container>
      </Box>
    </Box>
  )
}
```

```tsx components/seatwise/room-plan.tsx
"use client"

import { useState } from "react"
import type { DragEvent, KeyboardEvent } from "react"
import { Box, Flex, Text } from "@chakra-ui/react"
import { fixtures, tables, type FixtureKind } from "@/lib/data"
import {
  geos,
  guestById,
  initials,
  partyColor,
  ROOM_D,
  ROOM_W,
  SEAT_D,
  type SeatMap,
} from "@/lib/seating"

const pctX = (m: number) => `${(m / ROOM_W) * 100}%`
const pctY = (m: number) => `${(m / ROOM_D) * 100}%`

function activateOnKey(e: KeyboardEvent<HTMLElement>, fn: () => void) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault()
    fn()
  }
}

const FIXTURE_STYLE: Record<FixtureKind, { bg: string; color: string; borderColor: string; borderStyle: string }> = {
  stage: { bg: "gray.solid", color: "gray.contrast", borderColor: "gray.solid", borderStyle: "solid" },
  dancefloor: { bg: "teal.subtle", color: "teal.fg", borderColor: "teal.muted", borderStyle: "dashed" },
  bar: { bg: "orange.muted", color: "orange.fg", borderColor: "orange.solid", borderStyle: "solid" },
  door: { bg: "blue.solid", color: "blue.contrast", borderColor: "blue.solid", borderStyle: "solid" },
}

export interface RoomPlanProps {
  seats: SeatMap
  selectedTableId: string | null
  heldId: string | null
  dragId: string | null
  brokenTables: Set<string>
  brokenGuests: Set<string>
  onSeatClick: (tableId: string, index: number) => void
  onTableClick: (tableId: string) => void
  onDropSeat: (tableId: string, index: number) => void
  onDropTable: (tableId: string) => void
  onDragStartGuest: (guestId: string) => void
  onDragEndGuest: () => void
}

export function RoomPlan(props: RoomPlanProps) {
  const {
    seats,
    selectedTableId,
    heldId,
    dragId,
    brokenTables,
    brokenGuests,
    onSeatClick,
    onTableClick,
    onDropSeat,
    onDropTable,
    onDragStartGuest,
    onDragEndGuest,
  } = props
  const [over, setOver] = useState<string | null>(null)
  const targeting = Boolean(heldId || dragId)

  const dragProps = (key: string, onDrop: () => void) => ({
    onDragOver: (e: DragEvent<HTMLElement>) => {
      if (!dragId) return
      e.preventDefault()
      e.dataTransfer.dropEffect = "move"
      if (over !== key) setOver(key)
    },
    onDragLeave: () => setOver((cur) => (cur === key ? null : cur)),
    onDrop: (e: DragEvent<HTMLElement>) => {
      e.preventDefault()
      setOver(null)
      onDrop()
    },
  })

  return (
    <Box overflowX="auto" borderWidth="1px" rounded="xl" bg="bg.panel" p="2" tabIndex={-1}>
      <Box
        role="group"
        aria-label={`Room plan, ${ROOM_W} by ${ROOM_D} metres, drawn to scale`}
        position="relative"
        minW="960px"
        w="100%"
        rounded="lg"
        bg="bg.muted"
        overflow="hidden"
        css={{
          aspectRatio: `${ROOM_W} / ${ROOM_D}`,
          containerType: "inline-size",
          backgroundImage:
            "linear-gradient(to right, var(--chakra-colors-border-muted, rgba(128,128,128,.25)) 1px, transparent 1px), linear-gradient(to bottom, var(--chakra-colors-border-muted, rgba(128,128,128,.25)) 1px, transparent 1px)",
          backgroundSize: `calc(100% / ${ROOM_W}) calc(100% / ${ROOM_D})`,
        }}
      >
        {fixtures.map((f) => {
          const s = FIXTURE_STYLE[f.kind]
          const vertical = f.kind === "door"
          return (
            <Flex
              key={f.id}
              role="img"
              aria-label={`${f.label}, ${f.w} by ${f.h} metres`}
              position="absolute"
              style={{ left: pctX(f.x), top: pctY(f.y), width: pctX(f.w), height: pctY(f.h) }}
              bg={s.bg}
              color={s.color}
              borderWidth="2px"
              borderStyle={s.borderStyle}
              borderColor={s.borderColor}
              rounded={f.kind === "door" ? "sm" : "md"}
              align="center"
              justify="center"
              fontWeight="600"
              letterSpacing="0.02em"
              overflow="hidden"
              css={{
                fontSize: vertical ? "0.95cqw" : "1.1cqw",
                ...(vertical ? { writingMode: "vertical-rl", transform: "rotate(180deg)" } : {}),
              }}
            >
              {f.label}
            </Flex>
          )
        })}

        {tables.map((t, ti) => {
          const geo = geos[ti]
          const row = seats[t.id]
          const filled = row.filter(Boolean).length
          const broken = brokenTables.has(t.id)
          const selected = selectedTableId === t.id
          const tableOver = over === t.id
          const label = `${t.name}, ${filled} of ${t.seats} seats filled${broken ? ", a seating rule is broken" : ""}`
          return (
            <Box key={t.id}>
              <Flex
                role="button"
                tabIndex={0}
                aria-label={label}
                aria-pressed={selected}
                onClick={() => onTableClick(t.id)}
                onKeyDown={(e) => activateOnKey(e, () => onTableClick(t.id))}
                {...dragProps(t.id, () => onDropTable(t.id))}
                position="absolute"
                direction="column"
                align="center"
                justify="center"
                cursor="pointer"
                bg={tableOver ? "teal.subtle" : "bg.panel"}
                borderWidth="2px"
                borderColor={broken ? "red.solid" : selected || tableOver ? "teal.solid" : "border.emphasized"}
                rounded={geo.shape === "round" ? "full" : "md"}
                outlineWidth={selected ? "3px" : "0"}
                outlineStyle="solid"
                outlineColor="teal.solid"
                outlineOffset="3px"
                _focusVisible={{ outlineWidth: "3px", outlineColor: "teal.focusRing", outlineStyle: "solid" }}
                shadow="sm"
                style={{
                  left: pctX(geo.body.x),
                  top: pctY(geo.body.y),
                  width: pctX(geo.body.w),
                  ...(geo.shape === "round" ? { aspectRatio: "1" } : { height: pctY(geo.body.h) }),
                }}
                zIndex="1"
                lineHeight="1.15"
              >
                <Text fontWeight="700" css={{ fontSize: "1.05cqw" }}>
                  {t.name}
                </Text>
                <Text color={filled === t.seats ? "green.fg" : "fg.muted"} css={{ fontSize: "0.95cqw" }}>
                  {filled}/{t.seats}
                </Text>
                {broken && (
                  <Flex
                    aria-hidden
                    position="absolute"
                    top="-8%"
                    right="-8%"
                    rounded="full"
                    bg="red.solid"
                    color="red.contrast"
                    fontWeight="800"
                    align="center"
                    justify="center"
                    borderWidth="2px"
                    borderColor="bg.panel"
                    css={{ width: "2.2cqw", height: "2.2cqw", fontSize: "1.3cqw" }}
                  >
                    !
                  </Flex>
                )}
              </Flex>

              {geo.seats.map((pos, si) => {
                const gid = row[si]
                const g = gid ? guestById[gid] : null
                const color = g ? partyColor(g.party) : "gray"
                const key = `${t.id}:${si}`
                const isOver = over === key
                const held = gid !== null && gid === heldId
                const flagged = gid !== null && brokenGuests.has(gid)
                const seatLabel = g
                  ? `${t.name}, seat ${si + 1}: ${g.name}${g.diet ? `, ${g.diet}` : ""}${flagged ? ", involved in a broken rule" : ""}`
                  : `${t.name}, seat ${si + 1}: empty`
                return (
                  <Flex
                    key={key}
                    role="button"
                    tabIndex={0}
                    aria-label={seatLabel}
                    aria-pressed={held}
                    title={g ? `${g.name}${g.diet ? ` · ${g.diet}` : ""}` : `${t.name}, seat ${si + 1} (empty)`}
                    draggable={Boolean(g)}
                    onDragStart={(e: DragEvent<HTMLDivElement>) => {
                      if (!gid) return
                      e.dataTransfer.setData("text/plain", gid)
                      e.dataTransfer.effectAllowed = "move"
                      onDragStartGuest(gid)
                    }}
                    onDragEnd={() => {
                      setOver(null)
                      onDragEndGuest()
                    }}
                    onClick={() => onSeatClick(t.id, si)}
                    onKeyDown={(e) => activateOnKey(e, () => onSeatClick(t.id, si))}
                    {...dragProps(key, () => onDropSeat(t.id, si))}
                    position="absolute"
                    align="center"
                    justify="center"
                    rounded="full"
                    cursor={g ? "grab" : "pointer"}
                    fontWeight="700"
                    userSelect="none"
                    zIndex="2"
                    bg={g ? `${color}.solid` : isOver || (targeting && !g) ? "teal.subtle" : "bg.panel"}
                    color={g ? `${color}.contrast` : "fg.subtle"}
                    borderWidth="2px"
                    borderStyle={g ? "solid" : "dashed"}
                    borderColor={
                      flagged
                        ? "red.solid"
                        : isOver
                          ? "teal.solid"
                          : g
                            ? `${color}.solid`
                            : targeting
                              ? "teal.solid"
                              : "border.emphasized"
                    }
                    outlineWidth={held ? "3px" : flagged ? "2px" : "0"}
                    outlineStyle="solid"
                    outlineColor={held ? "fg" : "red.solid"}
                    outlineOffset="2px"
                    _focusVisible={{ outlineWidth: "3px", outlineColor: "teal.focusRing", outlineStyle: "solid" }}
                    style={{
                      left: pctX(pos.cx - SEAT_D / 2),
                      top: pctY(pos.cy - SEAT_D / 2),
                      width: pctX(SEAT_D),
                      aspectRatio: "1",
                    }}
                    css={{ fontSize: "1.15cqw" }}
                  >
                    {g ? initials(g.name) : <Box as="span" css={{ fontSize: "0.9cqw", fontWeight: 500 }}>{si + 1}</Box>}
                    {g?.diet && (
                      <Box
                        as="span"
                        aria-hidden
                        position="absolute"
                        rounded="full"
                        bg="orange.solid"
                        borderWidth="2px"
                        borderColor="bg.panel"
                        style={{ top: "-12%", right: "-12%", width: "36%", aspectRatio: "1" }}
                      />
                    )}
                  </Flex>
                )
              })}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
```

```tsx components/seatwise/plan-workspace.tsx
"use client"

import { useMemo, useState } from "react"
import type { DragEvent, KeyboardEvent } from "react"
import { Badge, Box, Button, Flex, Grid, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react"
import { LuCheck, LuUndo2, LuUserMinus, LuX } from "react-icons/lu"
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select"
import { toaster } from "@/components/ui/toaster"
import { tables, type Guest } from "@/lib/data"
import {
  guestById,
  initials,
  parties,
  partyColor,
  tableById,
  type RuleResult,
  type SeatMap,
} from "@/lib/seating"
import { RoomPlan } from "./room-plan"
import { useSeating } from "./seating-provider"

function activateOnKey(e: KeyboardEvent<HTMLElement>, fn: () => void) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault()
    fn()
  }
}

const srOnly = {
  position: "absolute",
  width: "1px",
  height: "1px",
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
} as const

/* ------------------------------ small pieces ------------------------------ */

function StatTile(props: { label: string; value: number | string; sub: string; palette?: string; href?: string }) {
  const { label, value, sub, palette, href } = props
  const body = (
    <Box bg="bg.panel" borderWidth="1px" rounded="xl" p={{ base: "3", md: "4" }} h="100%">
      <Text fontSize="xs" color="fg.muted" fontWeight="500" textTransform="uppercase" letterSpacing="0.06em">
        {label}
      </Text>
      <Text fontSize="3xl" fontWeight="700" lineHeight="1.1" color={palette ? `${palette}.fg` : undefined}>
        {value}
      </Text>
      <Text fontSize="sm" color="fg.muted">
        {sub}
      </Text>
    </Box>
  )
  return href ? (
    <a href={href} style={{ display: "block" }}>
      {body}
    </a>
  ) : (
    body
  )
}

function GuestChip(props: {
  guest: Guest
  held: boolean
  onToggle: () => void
  onDragStart: () => void
  onDragEnd: () => void
}) {
  const { guest, held, onToggle, onDragStart, onDragEnd } = props
  const c = partyColor(guest.party)
  return (
    <Flex
      role="button"
      tabIndex={0}
      aria-pressed={held}
      aria-label={`${guest.name}, ${guest.party}${guest.diet ? `, ${guest.diet}` : ""}. ${held ? "Selected" : "Select to place"}`}
      draggable
      onDragStart={(e: DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("text/plain", guest.id)
        e.dataTransfer.effectAllowed = "move"
        onDragStart()
      }}
      onDragEnd={onDragEnd}
      onClick={onToggle}
      onKeyDown={(e) => activateOnKey(e, onToggle)}
      align="center"
      gap="2"
      minH="10"
      ps="1.5"
      pe="3"
      rounded="full"
      cursor="grab"
      userSelect="none"
      bg={held ? `${c}.solid` : `${c}.subtle`}
      color={held ? `${c}.contrast` : `${c}.fg`}
      borderWidth="1px"
      borderColor={held ? "fg" : `${c}.muted`}
      _hover={{ bg: held ? `${c}.solid` : `${c}.muted` }}
      _focusVisible={{ outlineWidth: "3px", outlineStyle: "solid", outlineColor: "teal.focusRing", outlineOffset: "2px" }}
    >
      <Flex
        aria-hidden
        boxSize="7"
        rounded="full"
        bg={held ? `${c}.contrast` : `${c}.solid`}
        color={held ? `${c}.solid` : `${c}.contrast`}
        align="center"
        justify="center"
        fontSize="xs"
        fontWeight="700"
      >
        {initials(guest.name)}
      </Flex>
      <Text fontSize="sm" fontWeight="600" whiteSpace="nowrap">
        {guest.name}
      </Text>
      {guest.diet && (
        <Badge size="xs" colorPalette="orange" variant="solid">
          {guest.diet}
        </Badge>
      )}
      {guest.rsvp !== "yes" && (
        <Badge size="xs" variant="outline">
          {guest.rsvp === "maybe" ? "Maybe" : "Awaiting"}
        </Badge>
      )}
    </Flex>
  )
}

/* ------------------------------ side panels ------------------------------ */

function RulesPanel(props: { rules: RuleResult[]; onShow: (tableId: string) => void }) {
  const { rules, onShow } = props
  const broken = rules.filter((r) => r.status === "broken").length
  const waiting = rules.filter((r) => r.status === "waiting").length
  const kept = rules.filter((r) => r.status === "kept").length
  const KIND = { together: "Keep together", apart: "Keep apart", near: "Seat near" } as const
  const PALETTE = { broken: "red", kept: "green", waiting: "gray" } as const
  const STATUS = { broken: "Broken", kept: "Kept", waiting: "Waiting" } as const
  return (
    <Box id="rules" bg="bg.panel" borderWidth="1px" rounded="xl" p="4" scrollMarginTop="80px">
      <Flex align="baseline" justify="space-between" gap="2" wrap="wrap" mb="1">
        <Heading as="h2" size="md">
          The couple&apos;s rules
        </Heading>
        <Text fontSize="sm" color={broken ? "red.fg" : "fg.muted"} fontWeight={broken ? "600" : "400"}>
          {broken} broken · {waiting} waiting · {kept} kept
        </Text>
      </Flex>
      <Text fontSize="sm" color="fg.muted" mb="3">
        Checked after every change. Broken rules are ringed in red on the plan.
      </Text>
      <Stack as="ul" gap="2" listStyleType="none" m="0" p="0">
        {rules.map((r) => (
          <Box
            as="li"
            key={r.id}
            borderWidth="1px"
            rounded="lg"
            p="3"
            borderColor={r.status === "broken" ? "red.muted" : "border"}
            bg={r.status === "broken" ? "red.subtle" : "bg"}
          >
            <Flex gap="2" align="center" mb="1" wrap="wrap">
              <Badge colorPalette={PALETTE[r.status]} variant={r.status === "broken" ? "solid" : "subtle"}>
                {STATUS[r.status]}
              </Badge>
              <Text fontSize="xs" fontWeight="600" color="fg.muted" textTransform="uppercase" letterSpacing="0.05em">
                {KIND[r.kind]}
              </Text>
            </Flex>
            <Text fontSize="sm" fontWeight="600">
              {r.guestIds.map((id) => guestById[id].name).join(" & ")}
            </Text>
            <Text fontSize="sm" color="fg.muted">
              {r.note}
            </Text>
            <Text fontSize="sm" mt="1">
              {r.message}
            </Text>
            {r.tableIds.length > 0 && r.status === "broken" && (
              <Flex gap="2" mt="2" wrap="wrap">
                {r.tableIds.map((tid) => (
                  <Button key={tid} size="xs" variant="outline" onClick={() => onShow(tid)}>
                    Show {tableById[tid].name}
                  </Button>
                ))}
              </Flex>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  )
}

function TablesOverview(props: { seats: SeatMap; brokenTables: Set<string>; onSelect: (id: string) => void }) {
  const { seats, brokenTables, onSelect } = props
  return (
    <Box bg="bg.panel" borderWidth="1px" rounded="xl" p="4">
      <Heading as="h2" size="md" mb="1">
        Tables
      </Heading>
      <Text fontSize="sm" color="fg.muted" mb="3">
        Select a table on the plan or here to see its guests and dietary needs.
      </Text>
      <Stack as="ul" gap="1" listStyleType="none" m="0" p="0">
        {tables.map((t) => {
          const filled = seats[t.id].filter(Boolean).length
          const pct = (filled / t.seats) * 100
          const broken = brokenTables.has(t.id)
          return (
            <Box as="li" key={t.id}>
              <Flex
                as="button"
                w="100%"
                textAlign="start"
                align="center"
                gap="3"
                px="2"
                py="2"
                minH="11"
                rounded="md"
                _hover={{ bg: "bg.muted" }}
                onClick={() => onSelect(t.id)}
                aria-label={`${t.name}, ${filled} of ${t.seats} seats${broken ? ", rule broken" : ""}. Show details`}
              >
                <Text fontSize="sm" fontWeight="600" w="20">
                  {t.name}
                </Text>
                <Box flex="1" h="2" rounded="full" bg="bg.emphasized" overflow="hidden" aria-hidden>
                  <Box h="100%" rounded="full" bg={filled === t.seats ? "green.solid" : "teal.solid"} style={{ width: `${pct}%` }} />
                </Box>
                <Text fontSize="sm" color="fg.muted" w="10" textAlign="end">
                  {filled}/{t.seats}
                </Text>
                {broken ? (
                  <Badge colorPalette="red" variant="solid">
                    Rule
                  </Badge>
                ) : (
                  <Box w="9" />
                )}
              </Flex>
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}

function TableDetail(props: {
  tableId: string
  seats: SeatMap
  rules: RuleResult[]
  heldId: string | null
  onClose: () => void
  onHold: (guestId: string) => void
  onUnseat: (guestId: string) => void
  onSeatHere: (tableId: string, index: number) => void
}) {
  const { tableId, seats, rules, heldId, onClose, onHold, onUnseat, onSeatHere } = props
  const table = tableById[tableId]
  const row = seats[tableId]
  const seated = row.filter((g): g is string => g !== null).map((id) => guestById[id])
  const diets = new Map<string, number>()
  for (const g of seated) if (g.diet) diets.set(g.diet, (diets.get(g.diet) ?? 0) + 1)
  const issues = rules.filter((r) => r.status === "broken" && r.tableIds.includes(tableId))
  const held = heldId ? guestById[heldId] : null

  return (
    <Box bg="bg.panel" borderWidth="1px" borderColor="teal.muted" rounded="xl" p="4" aria-labelledby="table-detail-title" role="region">
      <Flex justify="space-between" align="start" gap="2" mb="2">
        <Box>
          <Heading as="h2" size="md" id="table-detail-title">
            {table.name}
          </Heading>
          <Text fontSize="sm" color="fg.muted">
            {seated.length} of {table.seats} seats filled · {table.seats - seated.length} free
          </Text>
        </Box>
        <Button size="xs" variant="ghost" onClick={onClose} aria-label="Close table details">
          <LuX /> All tables
        </Button>
      </Flex>

      {issues.map((r) => (
        <Box key={r.id} bg="red.subtle" color="red.fg" rounded="md" p="2" mb="2" fontSize="sm" role="alert">
          <strong>Rule broken.</strong> {r.message}
        </Box>
      ))}

      <Text fontSize="xs" fontWeight="600" color="fg.muted" textTransform="uppercase" letterSpacing="0.05em" mb="1">
        Dietary needs at this table
      </Text>
      {diets.size === 0 ? (
        <Text fontSize="sm" mb="3">
          None recorded.
        </Text>
      ) : (
        <Flex gap="1.5" wrap="wrap" mb="3">
          {Array.from(diets.entries()).map(([d, n]) => (
            <Badge key={d} colorPalette="orange" variant="subtle" size="md">
              {n} × {d}
            </Badge>
          ))}
        </Flex>
      )}

      <Stack as="ol" gap="1" listStyleType="none" m="0" p="0">
        {row.map((gid, i) => {
          const g = gid ? guestById[gid] : null
          return (
            <Flex
              as="li"
              key={i}
              align="center"
              gap="2"
              py="1.5"
              borderTopWidth={i === 0 ? "0" : "1px"}
              minH="11"
              bg={g && g.id === heldId ? "teal.subtle" : undefined}
              rounded="md"
              px="1"
            >
              <Text fontSize="xs" color="fg.muted" w="5" textAlign="end" flexShrink={0}>
                {i + 1}
              </Text>
              {g ? (
                <>
                  <Box flex="1" minW="0">
                    <Text fontSize="sm" fontWeight="600" truncate>
                      {g.name}
                    </Text>
                    <Flex gap="1.5" align="center" wrap="wrap">
                      <Text fontSize="xs" color="fg.muted">
                        {g.party}
                      </Text>
                      {g.diet && (
                        <Badge colorPalette="orange" size="xs">
                          {g.diet}
                        </Badge>
                      )}
                      {g.rsvp !== "yes" && (
                        <Badge size="xs" variant="outline">
                          {g.rsvp === "maybe" ? "Maybe" : "Awaiting reply"}
                        </Badge>
                      )}
                    </Flex>
                  </Box>
                  <Button size="xs" variant={g.id === heldId ? "solid" : "outline"} onClick={() => onHold(g.id)} aria-pressed={g.id === heldId}>
                    Move
                  </Button>
                  <Button size="xs" variant="ghost" aria-label={`Unseat ${g.name}`} onClick={() => onUnseat(g.id)}>
                    <LuUserMinus />
                  </Button>
                </>
              ) : (
                <>
                  <Text flex="1" fontSize="sm" color="fg.subtle" fontStyle="italic">
                    Empty seat
                  </Text>
                  {held && (
                    <Button size="xs" colorPalette="teal" onClick={() => onSeatHere(tableId, i)} aria-label={`Seat ${held.name} in seat ${i + 1}`}>
                      Seat {held.name.split(" ")[0]} here
                    </Button>
                  )}
                </>
              )}
            </Flex>
          )
        })}
      </Stack>
    </Box>
  )
}

/* ------------------------------ workspace ------------------------------ */

export function PlanWorkspace() {
  const { seats, tableOf, rules, seat, unseat, undo, reset, canUndo, seatedCount, capacity, needSeat, awaitingUnseated } =
    useSeating()
  const [heldId, setHeldId] = useState<string | null>(null)
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [trayOver, setTrayOver] = useState(false)
  const [message, setMessage] = useState("Tap a guest, then a seat or table. You can also drag guests onto seats.")

  const brokenTables = useMemo(
    () => new Set(rules.filter((r) => r.status === "broken").flatMap((r) => r.tableIds)),
    [rules],
  )
  const brokenGuests = useMemo(
    () => new Set(rules.filter((r) => r.status === "broken").flatMap((r) => r.guestIds)),
    [rules],
  )
  const brokenCount = rules.filter((r) => r.status === "broken").length
  const waitingCount = rules.filter((r) => r.status === "waiting").length

  const place = (guestId: string, tableId: string, index?: number) => {
    if (index !== undefined && seats[tableId][index] === guestId) {
      setHeldId(null)
      return
    }
    const g = guestById[guestId]
    const t = tableById[tableId]
    const r = seat(guestId, tableId, index)
    if (!r.ok) {
      setMessage(r.reason)
      toaster.create({ title: `Could not seat ${g.name}`, description: r.reason, type: "error" })
      return
    }
    let text = `${g.name} seated at ${t.name}, seat ${r.seat + 1}.`
    if (r.swappedWith) text += ` ${guestById[r.swappedWith].name} took the seat they left.`
    if (r.displaced) text += ` ${guestById[r.displaced].name} now needs a seat.`
    setMessage(text)
    setSelectedTableId(tableId)
    setHeldId(null)
  }

  const remove = (guestId: string) => {
    if (!tableOf[guestId]) return
    unseat(guestId)
    setMessage(`${guestById[guestId].name} unseated and added to the list of guests to place.`)
    setHeldId((cur) => (cur === guestId ? null : cur))
  }

  const hold = (guestId: string) => {
    if (heldId === guestId) {
      setHeldId(null)
      setMessage("Selection cleared.")
      return
    }
    setHeldId(guestId)
    setMessage(`${guestById[guestId].name} selected. Tap a seat or table to place them.`)
  }

  const onSeatClick = (tableId: string, index: number) => {
    const occupant = seats[tableId][index]
    if (heldId) {
      if (occupant === heldId) {
        setHeldId(null)
        setMessage("Selection cleared.")
        return
      }
      place(heldId, tableId, index)
      return
    }
    setSelectedTableId(tableId)
    if (occupant) hold(occupant)
  }

  const onTableClick = (tableId: string) => {
    if (heldId) place(heldId, tableId)
    else setSelectedTableId((cur) => (cur === tableId ? null : tableId))
  }

  const held = heldId ? guestById[heldId] : null
  const heldTable = heldId ? tableOf[heldId] : undefined

  const tableItems = [
    { value: "", label: "Move to table…" },
    ...tables.map((t) => {
      const free = seats[t.id].filter((g) => g === null).length
      return {
        value: t.id,
        label: `${t.name} (${free} free)`,
        disabled: t.id === heldTable || free === 0,
      }
    }),
  ]

  const chipHandlers = (g: Guest) => ({
    guest: g,
    held: heldId === g.id,
    onToggle: () => hold(g.id),
    onDragStart: () => setDragId(g.id),
    onDragEnd: () => {
      setDragId(null)
      setTrayOver(false)
    },
  })

  return (
    <Stack gap="4">
      <SimpleGrid columns={{ base: 2, md: 4 }} gap={{ base: "2", md: "4" }}>
        <StatTile label="Seated" value={seatedCount} sub={`across ${tables.length} tables`} />
        <StatTile
          label="Need a seat"
          value={needSeat.length}
          sub={awaitingUnseated.length ? `+ ${awaitingUnseated.length} awaiting RSVP` : "everyone attending is seated"}
          palette={needSeat.length ? "orange" : "green"}
        />
        <StatTile label="Open seats" value={capacity - seatedCount} sub={`of ${capacity} in the room`} />
        <StatTile
          label="Rules"
          value={brokenCount ? `${brokenCount} broken` : "All kept"}
          sub={waitingCount ? `${waitingCount} not tested yet` : "every rule checked"}
          palette={brokenCount ? "red" : "green"}
          href="#rules"
        />
      </SimpleGrid>

      {/* Guests waiting for a seat */}
      <Box
        as="section"
        aria-labelledby="tray-title"
        bg={trayOver ? "teal.subtle" : "bg.panel"}
        borderWidth="1px"
        borderStyle={trayOver ? "dashed" : "solid"}
        borderColor={trayOver ? "teal.solid" : "border"}
        rounded="xl"
        p="4"
        onDragOver={(e: DragEvent<HTMLElement>) => {
          if (dragId && tableOf[dragId]) {
            e.preventDefault()
            setTrayOver(true)
          }
        }}
        onDragLeave={() => setTrayOver(false)}
        onDrop={(e: DragEvent<HTMLElement>) => {
          e.preventDefault()
          setTrayOver(false)
          if (dragId) remove(dragId)
          setDragId(null)
        }}
      >
        <Flex justify="space-between" align="baseline" gap="2" wrap="wrap" mb="2">
          <Heading as="h2" size="md" id="tray-title">
            Waiting for a seat <Text as="span" color="fg.muted" fontWeight="500">· {needSeat.length}</Text>
          </Heading>
          <Text fontSize="sm" color="fg.muted">
            Tap a guest, then a seat or table. Drop a seated guest here to unseat them.
          </Text>
        </Flex>
        {needSeat.length === 0 ? (
          <Flex align="center" gap="2" color="green.fg" fontSize="sm" fontWeight="500">
            <LuCheck /> Everyone who is attending has a seat.
          </Flex>
        ) : (
          <Flex gap="2" wrap="wrap">
            {needSeat.map((g) => (
              <GuestChip key={g.id} {...chipHandlers(g)} />
            ))}
          </Flex>
        )}
        {awaitingUnseated.length > 0 && (
          <Box mt="3">
            <Text fontSize="xs" fontWeight="600" color="fg.muted" textTransform="uppercase" letterSpacing="0.05em" mb="1.5">
              Not confirmed yet, can be held a seat · {awaitingUnseated.length}
            </Text>
            <Flex gap="2" wrap="wrap">
              {awaitingUnseated.map((g) => (
                <GuestChip key={g.id} {...chipHandlers(g)} />
              ))}
            </Flex>
          </Box>
        )}
      </Box>

      <Grid templateColumns={{ base: "minmax(0, 1fr)", xl: "minmax(0, 1fr) 390px" }} gap="4" alignItems="start">
        <Box as="section" aria-labelledby="room-title" minW="0">
          <Flex justify="space-between" align="center" gap="2" wrap="wrap" mb="2">
            <Heading as="h2" size="md" id="room-title">
              Room plan
            </Heading>
            <Flex gap="2">
              <Button size="sm" variant="outline" onClick={() => { undo(); setHeldId(null); setMessage("Last change undone.") }} disabled={!canUndo}>
                <LuUndo2 /> Undo
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  reset()
                  setHeldId(null)
                  setMessage("Plan reset to the starting arrangement.")
                }}
              >
                Reset plan
              </Button>
            </Flex>
          </Flex>

          {held ? (
            <Flex
              role="group"
              aria-label="Selected guest"
              bg="teal.subtle"
              borderWidth="1px"
              borderColor="teal.muted"
              rounded="lg"
              p="2.5"
              mb="2"
              gap="2"
              align="center"
              wrap="wrap"
            >
              <Text fontSize="sm" fontWeight="600" flex="1" minW="200px">
                {held.name}
                <Text as="span" fontWeight="400" color="fg.muted">
                  {" "}
                  {heldTable ? `at ${tableById[heldTable].name}. ` : "is not seated. "}Tap a seat or table, or:
                </Text>
              </Text>
              <Box minW="180px">
                <NativeSelectRoot size="sm">
                  <NativeSelectField
                    aria-label={`Move ${held.name} to a table`}
                    value=""
                    onChange={(e) => {
                      if (e.target.value) place(held.id, e.target.value)
                    }}
                    items={tableItems}
                  />
                </NativeSelectRoot>
              </Box>
              {heldTable && (
                <Button size="sm" variant="outline" onClick={() => remove(held.id)}>
                  <LuUserMinus /> Unseat
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => { setHeldId(null); setMessage("Selection cleared.") }}>
                Cancel
              </Button>
            </Flex>
          ) : null}

          <RoomPlan
            seats={seats}
            selectedTableId={selectedTableId}
            heldId={heldId}
            dragId={dragId}
            brokenTables={brokenTables}
            brokenGuests={brokenGuests}
            onSeatClick={onSeatClick}
            onTableClick={onTableClick}
            onDropSeat={(tableId, index) => {
              if (dragId) place(dragId, tableId, index)
              setDragId(null)
            }}
            onDropTable={(tableId) => {
              if (dragId) place(dragId, tableId)
              setDragId(null)
            }}
            onDragStartGuest={(id) => setDragId(id)}
            onDragEndGuest={() => setDragId(null)}
          />

          <Text role="status" aria-live="polite" fontSize="sm" mt="2" minH="5">
            {message}
          </Text>
          <Box css={srOnly} aria-hidden={false}>
            {seatedCount} guests seated, {needSeat.length} attending guests still need a seat, {brokenCount} rules broken.
          </Box>

          <Flex gap={{ base: "2", md: "4" }} wrap="wrap" mt="1" fontSize="xs" color="fg.muted" align="center">
            {parties.map((p) => (
              <Flex key={p} align="center" gap="1.5">
                <Box aria-hidden boxSize="2.5" rounded="full" bg={`${partyColor(p)}.solid`} />
                {p}
              </Flex>
            ))}
            <Flex align="center" gap="1.5">
              <Box aria-hidden boxSize="2.5" rounded="full" bg="orange.solid" /> Dietary need
            </Flex>
            <Flex align="center" gap="1.5">
              <Box aria-hidden boxSize="2.5" rounded="full" borderWidth="2px" borderColor="red.solid" /> Broken rule
            </Flex>
          </Flex>
          <Text fontSize="xs" color="fg.muted" mt="1">
            Drawn to scale: 24 m × 14 m, one grid square is 1 m. On a narrow screen, scroll the plan sideways.
          </Text>
        </Box>

        <Stack gap="4" minW="0">
          {selectedTableId ? (
            <TableDetail
              tableId={selectedTableId}
              seats={seats}
              rules={rules}
              heldId={heldId}
              onClose={() => setSelectedTableId(null)}
              onHold={hold}
              onUnseat={remove}
              onSeatHere={(tableId, index) => heldId && place(heldId, tableId, index)}
            />
          ) : (
            <TablesOverview seats={seats} brokenTables={brokenTables} onSelect={setSelectedTableId} />
          )}
          <RulesPanel rules={rules} onShow={setSelectedTableId} />
        </Stack>
      </Grid>
    </Stack>
  )
}
```

```tsx components/seatwise/guests-view.tsx
"use client"

import { useMemo, useState } from "react"
import { Badge, Box, Button, Field, Flex, Grid, Heading, Input, SimpleGrid, Table, Text } from "@chakra-ui/react"
import { LuCopy, LuSearch } from "react-icons/lu"
import { InputGroup } from "@/components/ui/input-group"
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select"
import { toaster } from "@/components/ui/toaster"
import { guests, type Rsvp } from "@/lib/data"
import {
  catererSummary,
  dietNames,
  mealRows,
  parties,
  partyColor,
  rsvpLabel,
  rsvpPalette,
  tableById,
} from "@/lib/seating"
import { useSeating } from "./seating-provider"

const RSVP_ORDER: Rsvp[] = ["yes", "maybe", "pending", "no"]

function FilterSelect(props: {
  label: string
  value: string
  onChange: (v: string) => void
  items: { value: string; label: string }[]
}) {
  return (
    <Field.Root>
      <Field.Label fontSize="xs" color="fg.muted">
        {props.label}
      </Field.Label>
      <NativeSelectRoot size="md">
        <NativeSelectField value={props.value} onChange={(e) => props.onChange(e.target.value)} items={props.items} />
      </NativeSelectRoot>
    </Field.Root>
  )
}

export function GuestsView() {
  const { tableOf, seatedCount } = useSeating()
  const [q, setQ] = useState("")
  const [party, setParty] = useState("all")
  const [rsvp, setRsvp] = useState("all")
  const [diet, setDiet] = useState("all")
  const [seating, setSeating] = useState("all")

  const meals = useMemo(() => mealRows(), [])
  const confirmed = meals.reduce((n, m) => n + m.confirmed, 0)
  const awaiting = meals.reduce((n, m) => n + m.awaiting, 0)

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return guests.filter((g) => {
      const tid = tableOf[g.id]
      const tableName = tid ? tableById[tid].name : ""
      if (
        needle &&
        !`${g.name} ${g.party} ${g.diet ?? ""} ${tableName}`.toLowerCase().includes(needle)
      ) {
        return false
      }
      if (party !== "all" && g.party !== party) return false
      if (rsvp !== "all" && g.rsvp !== rsvp) return false
      if (diet === "none" && g.diet !== null) return false
      if (diet !== "all" && diet !== "none" && g.diet !== diet) return false
      if (seating === "seated" && !tid) return false
      if (seating === "unseated" && tid) return false
      return true
    })
  }, [q, party, rsvp, diet, seating, tableOf])

  const filtersActive = q !== "" || party !== "all" || rsvp !== "all" || diet !== "all" || seating !== "all"
  const clear = () => {
    setQ("")
    setParty("all")
    setRsvp("all")
    setDiet("all")
    setSeating("all")
  }

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(catererSummary(meals))
      toaster.create({ title: "Caterer summary copied", description: "Paste it into an email or message.", type: "success" })
    } catch {
      toaster.create({ title: "Could not copy", description: "Select the meal counts and copy them by hand.", type: "error" })
    }
  }

  return (
    <Grid templateColumns={{ base: "minmax(0, 1fr)", xl: "minmax(0, 1fr) 380px" }} gap="4" alignItems="start">
      <Box as="section" aria-labelledby="guests-title" minW="0" order={{ base: 2, xl: 1 }}>
        <Flex justify="space-between" align="baseline" gap="2" wrap="wrap" mb="3">
          <Heading as="h1" size="xl" id="guests-title">
            Guest list
          </Heading>
          <Text color="fg.muted" fontSize="sm">
            {guests.length} invited · {seatedCount} seated
          </Text>
        </Flex>

        <Box bg="bg.panel" borderWidth="1px" rounded="xl" p="4" mb="3">
          <InputGroup startElement={<LuSearch />} w="100%">
            <Input
              type="search"
              placeholder="Search by name, party, diet or table"
              aria-label="Search guests"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </InputGroup>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="3" mt="3">
            <FilterSelect
              label="Party"
              value={party}
              onChange={setParty}
              items={[{ value: "all", label: "All parties" }, ...parties.map((p) => ({ value: p, label: p }))]}
            />
            <FilterSelect
              label="RSVP"
              value={rsvp}
              onChange={setRsvp}
              items={[{ value: "all", label: "Any RSVP" }, ...RSVP_ORDER.map((r) => ({ value: r, label: rsvpLabel[r] }))]}
            />
            <FilterSelect
              label="Diet"
              value={diet}
              onChange={setDiet}
              items={[
                { value: "all", label: "Any diet" },
                { value: "none", label: "No dietary need" },
                ...dietNames.map((d) => ({ value: d, label: d })),
              ]}
            />
            <FilterSelect
              label="Seating"
              value={seating}
              onChange={setSeating}
              items={[
                { value: "all", label: "Seated or not" },
                { value: "seated", label: "Seated" },
                { value: "unseated", label: "Not seated" },
              ]}
            />
          </SimpleGrid>
          <Flex justify="space-between" align="center" mt="3" gap="2">
            <Text role="status" aria-live="polite" fontSize="sm" color="fg.muted">
              Showing {filtered.length} of {guests.length} guests
            </Text>
            {filtersActive && (
              <Button size="xs" variant="ghost" onClick={clear}>
                Clear filters
              </Button>
            )}
          </Flex>
        </Box>

        <Box bg="bg.panel" borderWidth="1px" rounded="xl" overflowX="auto">
          <Table.Root size="md" minW="640px" interactive>
            <Table.Header>
              <Table.Row bg="bg.muted">
                <Table.ColumnHeader>Guest</Table.ColumnHeader>
                <Table.ColumnHeader>Party</Table.ColumnHeader>
                <Table.ColumnHeader>RSVP</Table.ColumnHeader>
                <Table.ColumnHeader>Diet</Table.ColumnHeader>
                <Table.ColumnHeader>Table</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filtered.map((g) => {
                const tid = tableOf[g.id]
                return (
                  <Table.Row key={g.id}>
                    <Table.Cell fontWeight="600">
                      <Flex align="center" gap="2">
                        <Box aria-hidden boxSize="2.5" rounded="full" bg={`${partyColor(g.party)}.solid`} flexShrink={0} />
                        {g.name}
                      </Flex>
                    </Table.Cell>
                    <Table.Cell color="fg.muted">{g.party}</Table.Cell>
                    <Table.Cell>
                      <Badge colorPalette={rsvpPalette[g.rsvp]} variant="subtle">
                        {rsvpLabel[g.rsvp]}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      {g.diet ? (
                        <Badge colorPalette="orange" variant="subtle">
                          {g.diet}
                        </Badge>
                      ) : (
                        <Text as="span" color="fg.subtle">
                          None
                        </Text>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {tid ? (
                        <Badge colorPalette="teal" variant="outline">
                          {tableById[tid].name}
                        </Badge>
                      ) : g.rsvp === "no" ? (
                        <Text as="span" color="fg.subtle">
                          Not attending
                        </Text>
                      ) : (
                        <Text as="span" color="orange.fg" fontWeight="500">
                          Not seated yet
                        </Text>
                      )}
                    </Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table.Root>
          {filtered.length === 0 && (
            <Box p="8" textAlign="center">
              <Text fontWeight="600">No guests match these filters.</Text>
              <Button mt="3" size="sm" variant="outline" onClick={clear}>
                Clear filters
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      <Box
        as="aside"
        aria-labelledby="meals-title"
        bg="bg.panel"
        borderWidth="1px"
        rounded="xl"
        p="4"
        order={{ base: 1, xl: 2 }}
        position={{ xl: "sticky" }}
        top={{ xl: "84px" }}
      >
        <Flex justify="space-between" align="start" gap="2" mb="1">
          <Heading as="h2" size="md" id="meals-title">
            Meals for the caterer
          </Heading>
          <Button size="xs" variant="outline" onClick={copySummary}>
            <LuCopy /> Copy
          </Button>
        </Flex>
        <Text fontSize="sm" color="fg.muted" mb="3">
          {confirmed} confirmed, {awaiting} still to reply. Select a meal to filter the list.
        </Text>
        <SimpleGrid columns={{ base: 2, sm: 3, xl: 2 }} gap="2">
          {meals.map((m) => {
            const active = diet === (m.diet ?? "none")
            return (
              <Box
                as="button"
                key={m.key}
                textAlign="start"
                borderWidth="1px"
                rounded="lg"
                p="3"
                minH="20"
                bg={active ? "teal.subtle" : "bg"}
                borderColor={active ? "teal.solid" : "border"}
                _hover={{ bg: active ? "teal.subtle" : "bg.muted" }}
                aria-pressed={active}
                onClick={() => setDiet(active ? "all" : (m.diet ?? "none"))}
                aria-label={`${m.label}: ${m.confirmed} confirmed${m.awaiting ? `, ${m.awaiting} awaiting reply` : ""}. Filter the list`}
              >
                <Text fontSize="xs" color="fg.muted" fontWeight="500">
                  {m.label}
                </Text>
                <Text fontSize="2xl" fontWeight="700" lineHeight="1.2">
                  {m.confirmed}
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  {m.awaiting ? `+ ${m.awaiting} awaiting reply` : "all confirmed"}
                </Text>
              </Box>
            )
          })}
        </SimpleGrid>
        <Flex mt="3" pt="3" borderTopWidth="1px" justify="space-between" fontSize="sm" fontWeight="600">
          <Text>Total confirmed</Text>
          <Text>{confirmed}</Text>
        </Flex>
      </Box>
    </Grid>
  )
}
```

```tsx app/page.tsx
import { PageShell } from "@/components/seatwise/page-shell"
import { PlanWorkspace } from "@/components/seatwise/plan-workspace"

export default function Page() {
  return (
    <PageShell>
      <PlanWorkspace />
    </PageShell>
  )
}
```

```tsx app/guests/page.tsx
import type { Metadata } from "next"
import { GuestsView } from "@/components/seatwise/guests-view"
import { PageShell } from "@/components/seatwise/page-shell"

export const metadata: Metadata = { title: "Guests · Seatwise" }

export default function GuestsPage() {
  return (
    <PageShell>
      <GuestsView />
    </PageShell>
  )
}
```

```tsx app/layout.tsx
import type { Metadata } from "next"
import { SeatingProvider } from "@/components/seatwise/seating-provider"
import { EmotionRegistry } from "@/components/ui/emotion-registry"
import { Provider } from "@/components/ui/provider"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Seatwise · Ines & Mateo's wedding dinner",
  description: "Seating plan for Ines & Mateo's wedding dinner at The Orangery, Hollin Hall.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <EmotionRegistry>
          <Provider>
            <SeatingProvider>{children}</SeatingProvider>
            <Toaster />
          </Provider>
        </EmotionRegistry>
      </body>
    </html>
  )
}
```
