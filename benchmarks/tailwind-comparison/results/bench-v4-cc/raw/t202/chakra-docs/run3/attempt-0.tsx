```ts lib/data.ts
export type Rsvp = "yes" | "maybe" | "pending" | "no"

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
  kind: "stage" | "dancefloor" | "bar" | "door"
  label: string
  x: number
  y: number
  w: number
  h: number
}

export interface Table {
  id: string
  name: string
  shape: "long" | "round"
  seats: number
  x: number
  y: number
  rotation?: number
}

export interface Rule {
  kind: "together" | "apart" | "near"
  guests: string[]
  note: string
  /** near rules: the fixture the guest must be close to, and the fixture to stay away from */
  nearFixture?: string
  awayFrom?: string
  maxNear?: number
  minAway?: number
  /** shown under the rule when the source data needed interpreting */
  dataNote?: string
}

export const APP_NAME = "Seatwise"

export const EVENT = {
  name: "Ines & Mateo's wedding dinner",
  date: "2027-06-19",
  venue: "The Orangery, Hollin Hall",
  room_m: { width: 24, depth: 14 },
}

export const ROOM = { width: EVENT.room_m.width, depth: EVENT.room_m.depth }

export const PLANNER = { name: "Hannah Brook" }

export const FIXTURES: Fixture[] = [
  { id: "f-1", kind: "stage", label: "Band", x: 10, y: 0.5, w: 4, h: 2 },
  { id: "f-2", kind: "dancefloor", label: "Dance floor", x: 8.5, y: 3, w: 7, h: 4 },
  { id: "f-3", kind: "bar", label: "Bar", x: 21, y: 10, w: 2.5, h: 3.5 },
  { id: "f-4", kind: "door", label: "Garden doors", x: 0, y: 6, w: 0.5, h: 2.5 },
]

export const TABLES: Table[] = [
  { id: "t-head", name: "Top table", shape: "long", seats: 8, x: 8, y: 8.2, rotation: 0 },
  { id: "t-1", name: "Table 1", shape: "round", seats: 8, x: 3, y: 2.5 },
  { id: "t-2", name: "Table 2", shape: "round", seats: 8, x: 3, y: 7 },
  { id: "t-3", name: "Table 3", shape: "round", seats: 8, x: 3, y: 11.5 },
  { id: "t-4", name: "Table 4", shape: "round", seats: 8, x: 19, y: 2.5 },
  { id: "t-5", name: "Table 5", shape: "round", seats: 8, x: 19, y: 7 },
  { id: "t-6", name: "Table 6", shape: "round", seats: 6, x: 12, y: 12 },
]

export const GUESTS: Guest[] = [
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

export const RULES: Rule[] = [
  { kind: "together", guests: ["g-21", "g-22"], note: "Couple" },
  { kind: "together", guests: ["g-32", "g-33"], note: "Siblings, under 10" },
  {
    kind: "apart",
    // The supplied rule listed g-29 (Kai Brennan) and g-30, but its note names the
    // brothers Sean and Ryan Doyle, who are g-30 and g-31. The check follows the note.
    guests: ["g-30", "g-31"],
    note: "Brothers Sean and Ryan Doyle are not speaking",
    dataNote:
      "The source list named Kai Brennan (g-29) here; the note names Ryan Doyle (g-31), so the check uses Sean and Ryan Doyle.",
  },
  { kind: "apart", guests: ["g-12", "g-34"], note: "Ask the couple: old family dispute" },
  {
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
    nearFixture: "f-4",
    awayFrom: "f-1",
    maxNear: 4,
    minAway: 6,
  },
]
```

```ts lib/seating.ts
import { useSyncExternalStore } from "react"
import {
  FIXTURES,
  GUESTS,
  RULES,
  TABLES,
  type Fixture,
  type Guest,
  type Rule,
  type Table,
} from "./data"

export interface SeatRef {
  table: string
  seat: number
}
export type Placements = Record<string, SeatRef | null>

export const guestById = new Map<string, Guest>(GUESTS.map((g) => [g.id, g]))
export const tableById = new Map<string, Table>(TABLES.map((t) => [t.id, t]))
export const fixtureById = new Map<string, Fixture>(FIXTURES.map((f) => [f.id, f]))

export const STANDARD_MEAL = "Standard menu"
export const mealOf = (g: Guest) => g.diet ?? STANDARD_MEAL
export const tableName = (id: string) => tableById.get(id)?.name ?? id

/* ------------------------------ geometry ------------------------------ */

export interface TableGeometry {
  /** the clickable area (covers the table and its seats), in metres */
  zone: { x: number; y: number; w: number; h: number }
  /** the table top, in metres */
  disc: { x: number; y: number; w: number; h: number }
  cx: number
  cy: number
  round: boolean
  seatSize: number
  seats: { x: number; y: number }[]
}

export function tableGeometry(t: Table): TableGeometry {
  const seatSize = 0.95
  if (t.shape === "long") {
    const w = t.seats
    const h = 1.2
    const seats = Array.from({ length: t.seats }, (_, i) => ({ x: t.x + 0.5 + i, y: t.y - 0.5 }))
    return {
      zone: { x: t.x - 0.1, y: t.y - 1.1, w: w + 0.2, h: h + 1.2 },
      disc: { x: t.x, y: t.y, w, h },
      cx: t.x + w / 2,
      cy: t.y + h / 2,
      round: false,
      seatSize,
      seats,
    }
  }
  const tr = t.seats <= 6 ? 0.85 : 1
  const ring = tr + 0.6
  const zr = ring + 0.62
  const seats = Array.from({ length: t.seats }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats
    return { x: t.x + ring * Math.cos(a), y: t.y + ring * Math.sin(a) }
  })
  return {
    zone: { x: t.x - zr, y: t.y - zr, w: zr * 2, h: zr * 2 },
    disc: { x: t.x - tr, y: t.y - tr, w: tr * 2, h: tr * 2 },
    cx: t.x,
    cy: t.y,
    round: true,
    seatSize,
    seats,
  }
}

/* ------------------------------ the store ------------------------------ */

function initialPlacements(): Placements {
  const counts: Record<string, number> = {}
  const out: Placements = {}
  for (const g of GUESTS) {
    if (g.table) {
      const n = counts[g.table] ?? 0
      counts[g.table] = n + 1
      out[g.id] = { table: g.table, seat: n }
    } else {
      out[g.id] = null
    }
  }
  return out
}

const INITIAL: Placements = initialPlacements()
let state: Placements = INITIAL
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}
function subscribe(l: () => void) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}
const getSnapshot = () => state
const getServerSnapshot = () => INITIAL

/** Seating for the session. Shared by every page, so changes follow you between routes. */
export function usePlacements(): Placements {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function occupants(p: Placements, table: Table): (string | null)[] {
  const out = new Array<string | null>(table.seats).fill(null)
  for (const id of Object.keys(p)) {
    const s = p[id]
    if (s && s.table === table.id) out[s.seat] = id
  }
  return out
}

export type PlaceResult = { ok: true } | { ok: false; reason: string }

export function placeGuest(guestId: string, tableId: string, seat?: number): PlaceResult {
  const guest = guestById.get(guestId)
  const table = tableById.get(tableId)
  if (!guest || !table) return { ok: false, reason: "That guest or table is not in this plan." }
  if (guest.rsvp === "no") {
    return { ok: false, reason: `${guest.name} has declined, so no seat is needed.` }
  }
  const full = { ok: false as const, reason: `${table.name} is full: all ${table.seats} seats are taken.` }
  const occ = occupants(state, table)
  const current = state[guestId]
  let target = seat !== undefined && seat >= 0 && seat < table.seats ? seat : -1
  if (target === -1) {
    if (current && current.table === tableId) return { ok: true }
    target = occ.indexOf(null)
    if (target === -1) return full
  }
  const occupant = occ[target]
  if (occupant === guestId) return { ok: true }
  const next: Placements = { ...state }
  if (occupant) {
    if (current) {
      next[occupant] = { table: current.table, seat: current.seat }
    } else {
      target = occ.indexOf(null)
      if (target === -1) return full
    }
  }
  next[guestId] = { table: tableId, seat: target }
  state = next
  emit()
  return { ok: true }
}

export function unseatGuest(guestId: string) {
  if (!state[guestId]) return
  state = { ...state, [guestId]: null }
  emit()
}

/* ------------------------------ derived data ------------------------------ */

export interface TableOption {
  value: string
  label: string
  disabled: boolean
}

export function tableOptions(p: Placements, guestId?: string): TableOption[] {
  return TABLES.map((t) => {
    const free = occupants(p, t).filter((x) => x === null).length
    const here = guestId ? p[guestId]?.table === t.id : false
    return {
      value: t.id,
      label: `${t.name} · ${free} free`,
      disabled: free === 0 && !here,
    }
  })
}

export interface Stats {
  seated: number
  toPlace: Guest[]
  awaiting: Guest[]
  declined: number
  attending: number
  totalSeats: number
  freeSeats: number
}

export function computeStats(p: Placements): Stats {
  const toPlace: Guest[] = []
  const awaiting: Guest[] = []
  let seated = 0
  let declined = 0
  let attending = 0
  for (const g of GUESTS) {
    if (g.rsvp === "yes") attending++
    if (g.rsvp === "no") declined++
    if (p[g.id]) {
      seated++
      continue
    }
    if (g.rsvp === "yes") toPlace.push(g)
    else if (g.rsvp !== "no") awaiting.push(g)
  }
  const totalSeats = TABLES.reduce((n, t) => n + t.seats, 0)
  return { seated, toPlace, awaiting, declined, attending, totalSeats, freeSeats: totalSeats - seated }
}

/* ------------------------------ the couple's rules ------------------------------ */

export type RuleStatus = "broken" | "ok" | "open"

export interface RuleResult {
  index: number
  rule: Rule
  status: RuleStatus
  headline: string
  detail: string
  tables: string[]
  guestIds: string[]
}

export const RULE_KIND_LABEL: Record<Rule["kind"], string> = {
  together: "Keep together",
  apart: "Keep apart",
  near: "Seat near",
}

const nameOf = (id: string) => guestById.get(id)?.name ?? id
const listNames = (ids: string[]) => {
  const n = ids.map(nameOf)
  if (n.length <= 2) return n.join(" and ")
  return `${n.slice(0, -1).join(", ")} and ${n[n.length - 1]}`
}
const centreOfFixture = (f: Fixture) => ({ x: f.x + f.w / 2, y: f.y + f.h / 2 })
const metres = (n: number) => `${n.toFixed(1)} m`

export function evaluateRules(p: Placements): RuleResult[] {
  return RULES.map((rule, index) => {
    const base = { index, rule, guestIds: rule.guests }
    const seats = rule.guests.map((id) => p[id] ?? null)
    const unseated = rule.guests.filter((id) => !p[id])

    if (rule.kind === "together") {
      if (unseated.length > 0) {
        return {
          ...base,
          status: "open" as const,
          headline: `${listNames(rule.guests)} to sit together`,
          detail:
            unseated.length === rule.guests.length
              ? "Neither is seated yet."
              : `${listNames(unseated)} still needs a seat.`,
          tables: seats.flatMap((s) => (s ? [s.table] : [])),
        }
      }
      const tables = Array.from(new Set(seats.flatMap((s) => (s ? [s.table] : []))))
      if (tables.length > 1) {
        return {
          ...base,
          status: "broken" as const,
          headline: `${listNames(rule.guests)} are split up`,
          detail: `They are at ${tables.map(tableName).join(" and ")}.`,
          tables,
        }
      }
      return {
        ...base,
        status: "ok" as const,
        headline: `${listNames(rule.guests)} sit together`,
        detail: `Both at ${tableName(tables[0])}.`,
        tables,
      }
    }

    if (rule.kind === "apart") {
      const counts = new Map<string, number>()
      for (const s of seats) if (s) counts.set(s.table, (counts.get(s.table) ?? 0) + 1)
      const shared = Array.from(counts.entries()).filter(([, n]) => n > 1).map(([t]) => t)
      if (shared.length > 0) {
        return {
          ...base,
          status: "broken" as const,
          headline: `${listNames(rule.guests)} share ${tableName(shared[0])}`,
          detail: "They should be at different tables.",
          tables: shared,
        }
      }
      if (unseated.length > 0) {
        return {
          ...base,
          status: "open" as const,
          headline: `${listNames(rule.guests)} to sit apart`,
          detail: `${listNames(unseated)} ${unseated.length > 1 ? "are" : "is"} not seated yet.`,
          tables: seats.flatMap((s) => (s ? [s.table] : [])),
        }
      }
      return {
        ...base,
        status: "ok" as const,
        headline: `${listNames(rule.guests)} sit apart`,
        detail: `At ${seats.map((s) => (s ? tableName(s.table) : "")).join(" and ")}.`,
        tables: seats.flatMap((s) => (s ? [s.table] : [])),
      }
    }

    // near
    const guestId = rule.guests[0]
    const seat = p[guestId]
    const near = rule.nearFixture ? fixtureById.get(rule.nearFixture) : undefined
    const away = rule.awayFrom ? fixtureById.get(rule.awayFrom) : undefined
    const maxNear = rule.maxNear ?? 4
    const minAway = rule.minAway ?? 6
    if (!seat || !near) {
      return {
        ...base,
        status: "open" as const,
        headline: `${nameOf(guestId)} to sit near the ${near?.label.toLowerCase() ?? "fixture"}`,
        detail: "Not seated yet.",
        tables: [],
      }
    }
    const table = tableById.get(seat.table)
    if (!table) return { ...base, status: "open" as const, headline: "", detail: "", tables: [] }
    const g = tableGeometry(table)
    const dNear = Math.hypot(g.cx - centreOfFixture(near).x, g.cy - centreOfFixture(near).y)
    const dAway = away ? Math.hypot(g.cx - centreOfFixture(away).x, g.cy - centreOfFixture(away).y) : Infinity
    if (dNear > maxNear) {
      return {
        ...base,
        status: "broken" as const,
        headline: `${nameOf(guestId)} is ${metres(dNear)} from the ${near.label.toLowerCase()}`,
        detail: `${table.name} is too far. Aim for within ${maxNear} m.`,
        tables: [table.id],
      }
    }
    if (away && dAway < minAway) {
      return {
        ...base,
        status: "broken" as const,
        headline: `${nameOf(guestId)} is ${metres(dAway)} from the ${away.label.toLowerCase()}`,
        detail: `${table.name} is too close. Keep at least ${minAway} m away.`,
        tables: [table.id],
      }
    }
    return {
      ...base,
      status: "ok" as const,
      headline: `${nameOf(guestId)} is ${metres(dNear)} from the ${near.label.toLowerCase()}`,
      detail: away ? `${table.name} is ${metres(dAway)} from the ${away.label.toLowerCase()}.` : table.name,
      tables: [table.id],
    }
  })
}

export function brokenByTable(results: RuleResult[]): Record<string, RuleResult[]> {
  const out: Record<string, RuleResult[]> = {}
  for (const r of results) {
    if (r.status !== "broken") continue
    for (const t of r.tables) (out[t] ??= []).push(r)
  }
  return out
}

export function brokenGuestIds(results: RuleResult[]): Set<string> {
  const out = new Set<string>()
  for (const r of results) if (r.status === "broken") r.guestIds.forEach((id) => out.add(id))
  return out
}
```

```tsx components/GuestBits.tsx
"use client"

import { Badge, Box } from "@chakra-ui/react"
import type { Rsvp } from "@/lib/data"

export type Palette =
  | "gray"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "teal"
  | "blue"
  | "cyan"
  | "purple"
  | "pink"

export const PARTY_PALETTE: Record<string, Palette> = {
  Couple: "pink",
  "Bride's family": "purple",
  "Groom's family": "blue",
  "University friends": "orange",
  "Work friends": "cyan",
  "Groom's football club": "green",
  "Plus-ones": "gray",
}
export const partyPalette = (party: string): Palette => PARTY_PALETTE[party] ?? "gray"

const DIET_PALETTE: Record<string, Palette> = {
  Vegetarian: "green",
  Vegan: "green",
  "Gluten free": "yellow",
  "Soft food": "purple",
  "Nut allergy": "red",
  Halal: "blue",
  Pescatarian: "cyan",
  "Children's menu": "pink",
}
export const dietPalette = (diet: string): Palette => DIET_PALETTE[diet] ?? "gray"

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Awaiting reply",
  no: "Declined",
}
const RSVP_PALETTE: Record<Rsvp, Palette> = {
  yes: "green",
  maybe: "orange",
  pending: "gray",
  no: "red",
}

export function RsvpBadge({ rsvp }: { rsvp: Rsvp }) {
  return (
    <Badge colorPalette={RSVP_PALETTE[rsvp]} variant="subtle" size="sm">
      {RSVP_LABEL[rsvp]}
    </Badge>
  )
}

export function DietBadge({ diet }: { diet: string | null }) {
  if (!diet) return null
  return (
    <Badge colorPalette={dietPalette(diet)} variant="subtle" size="sm">
      {diet}
    </Badge>
  )
}

export function PartyDot({ party }: { party: string }) {
  return (
    <Box
      aria-hidden
      display="inline-block"
      w="2.5"
      h="2.5"
      borderRadius="full"
      flexShrink={0}
      colorPalette={partyPalette(party)}
      bg="colorPalette.solid"
    />
  )
}

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
```

```tsx components/AppShell.tsx
"use client"

import { Box, Flex, Heading, HStack, Text, chakra } from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import { LuCalendar, LuLayoutGrid, LuMapPin, LuUsers } from "react-icons/lu"
import { ColorModeButton } from "@/components/ui/color-mode"
import { APP_NAME, EVENT, PLANNER } from "@/lib/data"
import { initials } from "@/components/GuestBits"

const NavLink = chakra(NextLink)

const NAV = [
  { href: "/", label: "Plan", icon: LuLayoutGrid },
  { href: "/guests", label: "Guests", icon: LuUsers },
]

const dateLabel = new Date(`${EVENT.date}T12:00:00Z`).toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <Box minH="100dvh" bg="bg" colorPalette="teal">
      <Box
        as="header"
        position="sticky"
        top="0"
        zIndex="sticky"
        bg="bg.panel"
        borderBottomWidth="1px"
      >
        <Flex maxW="1680px" mx="auto" px={{ base: "3", md: "6" }} h="14" align="center" gap={{ base: "2", md: "6" }}>
          <HStack gap="2">
            <Flex
              aria-hidden
              w="8"
              h="8"
              borderRadius="lg"
              bg="colorPalette.solid"
              color="colorPalette.contrast"
              align="center"
              justify="center"
              fontWeight="bold"
            >
              S
            </Flex>
            <Text fontWeight="semibold" fontSize="lg" letterSpacing="-0.01em">
              {APP_NAME}
            </Text>
          </HStack>
          <Box as="nav" aria-label="Main">
            <HStack gap="1">
              {NAV.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
                return (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    display="inline-flex"
                    alignItems="center"
                    gap="2"
                    px="3"
                    h="9"
                    borderRadius="md"
                    fontSize="sm"
                    fontWeight="medium"
                    color={active ? "colorPalette.fg" : "fg.muted"}
                    bg={active ? "colorPalette.subtle" : "transparent"}
                    _hover={{ bg: active ? "colorPalette.subtle" : "bg.muted", textDecoration: "none" }}
                    _focusVisible={{ outline: "2px solid", outlineColor: "colorPalette.focusRing" }}
                  >
                    <item.icon aria-hidden />
                    {item.label}
                  </NavLink>
                )
              })}
            </HStack>
          </Box>
          <Box flex="1" />
          <ColorModeButton />
          <HStack gap="2" title={`Planner: ${PLANNER.name}`}>
            <Flex
              aria-hidden
              w="8"
              h="8"
              borderRadius="full"
              bg="bg.emphasized"
              align="center"
              justify="center"
              fontSize="xs"
              fontWeight="semibold"
            >
              {initials(PLANNER.name)}
            </Flex>
            <Text display={{ base: "none", md: "block" }} fontSize="sm" color="fg.muted">
              {PLANNER.name}
            </Text>
          </HStack>
        </Flex>
      </Box>

      <Box as="main" maxW="1680px" mx="auto" px={{ base: "3", md: "6" }} py={{ base: "4", md: "6" }}>
        <Box mb="4">
          <Heading as="h1" size={{ base: "xl", md: "2xl" }} letterSpacing="-0.02em">
            {title}
          </Heading>
          <Flex mt="1" gap={{ base: "1", md: "4" }} direction={{ base: "column", md: "row" }} color="fg.muted" fontSize="sm">
            <Text fontWeight="medium" color="fg">
              {EVENT.name}
            </Text>
            <HStack gap="1">
              <LuCalendar aria-hidden />
              <Text>{dateLabel}</Text>
            </HStack>
            <HStack gap="1">
              <LuMapPin aria-hidden />
              <Text>{EVENT.venue}</Text>
            </HStack>
          </Flex>
        </Box>
        {children}
      </Box>
    </Box>
  )
}
```

```tsx components/RoomPlan.tsx
"use client"

import { Box, Text } from "@chakra-ui/react"
import * as React from "react"
import { LuTriangleAlert } from "react-icons/lu"
import { FIXTURES, GUESTS, ROOM, TABLES, type Fixture } from "@/lib/data"
import {
  occupants,
  tableGeometry,
  type Placements,
  type RuleResult,
  brokenByTable,
  brokenGuestIds,
  guestById,
} from "@/lib/seating"
import { initials, partyPalette, type Palette } from "@/components/GuestBits"

const px = (x: number) => `${(x / ROOM.width) * 100}%`
const py = (y: number) => `${(y / ROOM.depth) * 100}%`

const FIXTURE_STYLE: Record<Fixture["kind"], { palette: Palette; radius: string }> = {
  stage: { palette: "purple", radius: "md" },
  dancefloor: { palette: "teal", radius: "md" },
  bar: { palette: "orange", radius: "md" },
  door: { palette: "blue", radius: "xs" },
}

interface Props {
  placements: Placements
  rules: RuleResult[]
  selectedTable: string | null
  pickedId: string | null
  dragId: string | null
  onDragGuest: (id: string | null) => void
  onDropGuest: (guestId: string, tableId: string, seat?: number) => void
  onTapSeat: (tableId: string, seat: number, occupant: string | null) => void
  onTapTable: (tableId: string) => void
}

type Hover = { table: string; seat: number | null } | null

export function RoomPlan(props: Props) {
  const { placements, rules, selectedTable, pickedId, dragId, onDragGuest, onDropGuest, onTapSeat, onTapTable } = props
  const [hover, setHover] = React.useState<Hover>(null)
  const broken = React.useMemo(() => brokenByTable(rules), [rules])
  const brokenGuests = React.useMemo(() => brokenGuestIds(rules), [rules])

  const handleDrop = (e: React.DragEvent, tableId: string, seat?: number) => {
    e.preventDefault()
    e.stopPropagation()
    const id = e.dataTransfer.getData("text/plain") || dragId
    setHover(null)
    if (id && guestById.has(id)) onDropGuest(id, tableId, seat)
  }
  const allowDrop = (e: React.DragEvent, h: Hover) => {
    if (!dragId) return
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setHover(h)
  }

  return (
    <Box
      role="group"
      aria-label={`Room plan, ${ROOM.width} by ${ROOM.depth} metres`}
      overflowX="auto"
      borderRadius="lg"
    >
      <Box minW="880px">
        <Box
          position="relative"
          aspectRatio={`${ROOM.width} / ${ROOM.depth}`}
          bg="bg.muted"
          borderWidth="3px"
          borderColor="border.emphasized"
          borderRadius="lg"
          overflow="hidden"
          css={{ containerType: "inline-size" }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHover(null)
          }}
        >
          {FIXTURES.map((f) => {
            const s = FIXTURE_STYLE[f.kind]
            const vertical = f.kind === "door"
            return (
              <Box
                key={f.id}
                role="img"
                aria-label={f.label}
                title={f.label}
                position="absolute"
                left={px(f.x)}
                top={py(f.y)}
                w={px(f.w)}
                h={py(f.h)}
                colorPalette={s.palette}
                bg={f.kind === "dancefloor" ? "colorPalette.subtle" : "colorPalette.muted"}
                color="colorPalette.fg"
                borderWidth={f.kind === "door" ? "0" : "1.5px"}
                borderStyle={f.kind === "dancefloor" ? "dashed" : "solid"}
                borderColor="colorPalette.solid"
                borderRadius={s.radius}
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="clamp(9px, 1.25cqw, 15px)"
                fontWeight="semibold"
                letterSpacing="0.02em"
                textTransform={vertical ? "none" : "uppercase"}
                userSelect="none"
              >
                <Text
                  as="span"
                  style={vertical ? { writingMode: "vertical-rl", transform: "rotate(180deg)", whiteSpace: "nowrap" } : undefined}
                >
                  {f.label}
                </Text>
              </Box>
            )
          })}

          {TABLES.map((t) => {
            const g = tableGeometry(t)
            const occ = occupants(placements, t)
            const filled = occ.filter(Boolean).length
            const bad = broken[t.id] ?? []
            const selected = selectedTable === t.id
            const over = hover?.table === t.id && hover.seat === null && !!dragId
            const zoneLabel = `${t.name}, ${filled} of ${t.seats} seats filled${
              bad.length ? `, ${bad.length} rule${bad.length > 1 ? "s" : ""} broken` : ""
            }`
            return (
              <React.Fragment key={t.id}>
                <Box
                  role="button"
                  tabIndex={0}
                  aria-label={zoneLabel}
                  aria-pressed={selected}
                  onClick={() => onTapTable(t.id)}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      onTapTable(t.id)
                    }
                  }}
                  onDragOver={(e: React.DragEvent) => allowDrop(e, { table: t.id, seat: null })}
                  onDrop={(e: React.DragEvent) => handleDrop(e, t.id)}
                  position="absolute"
                  left={px(g.zone.x)}
                  top={py(g.zone.y)}
                  w={px(g.zone.w)}
                  h={py(g.zone.h)}
                  borderRadius={g.round ? "full" : "2xl"}
                  borderWidth="2px"
                  borderStyle={bad.length || over ? "dashed" : "solid"}
                  borderColor={bad.length ? "red.solid" : over || selected ? "teal.solid" : "transparent"}
                  bg={over ? "teal.muted" : selected ? "teal.subtle" : "transparent"}
                  cursor="pointer"
                  transition="background 0.15s"
                  _hover={{ bg: selected ? "teal.subtle" : "bg.emphasized" }}
                  _focusVisible={{ outline: "3px solid", outlineColor: "teal.focusRing", outlineOffset: "2px" }}
                >
                  <Box
                    position="absolute"
                    left={`${((g.disc.x - g.zone.x) / g.zone.w) * 100}%`}
                    top={`${((g.disc.y - g.zone.y) / g.zone.h) * 100}%`}
                    w={`${(g.disc.w / g.zone.w) * 100}%`}
                    h={`${(g.disc.h / g.zone.h) * 100}%`}
                    bg="bg.panel"
                    borderWidth="1.5px"
                    borderColor="border.emphasized"
                    borderRadius={g.round ? "full" : "md"}
                    display="flex"
                    flexDirection={g.round ? "column" : "row"}
                    alignItems="center"
                    justifyContent="center"
                    gap={g.round ? "0" : "2"}
                    pointerEvents="none"
                    lineHeight="1.15"
                    fontSize="clamp(9px, 1.2cqw, 15px)"
                    textAlign="center"
                  >
                    <Text as="span" fontWeight="semibold">
                      {t.name}
                    </Text>
                    <Text
                      as="span"
                      color={filled === t.seats ? "green.fg" : "fg.muted"}
                      fontWeight="medium"
                    >
                      {filled}/{t.seats}
                    </Text>
                  </Box>
                  {bad.length > 0 && (
                    <Box
                      position="absolute"
                      top={g.round ? "7%" : "-4%"}
                      right={g.round ? "7%" : "-1%"}
                      zIndex={2}
                      w="clamp(18px, 2.2cqw, 28px)"
                      aspectRatio="1"
                      borderRadius="full"
                      bg="red.solid"
                      color="red.contrast"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      title={bad.map((b) => b.headline).join(". ")}
                      pointerEvents="none"
                    >
                      <LuTriangleAlert aria-hidden />
                    </Box>
                  )}
                </Box>

                {g.seats.map((pos, i) => {
                  const gid = occ[i]
                  const guest = gid ? guestById.get(gid) ?? null : null
                  const picked = !!guest && pickedId === guest.id
                  const bad2 = !!guest && brokenGuests.has(guest.id)
                  const seatOver = hover?.table === t.id && hover.seat === i && !!dragId
                  const label = guest
                    ? `${t.name}, seat ${i + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}${
                        bad2 ? ", involved in a broken rule" : ""
                      }`
                    : `${t.name}, seat ${i + 1}: empty`
                  const tap = () => onTapSeat(t.id, i, guest ? guest.id : null)
                  return (
                    <Box
                      key={`${t.id}-${i}`}
                      role="button"
                      tabIndex={0}
                      aria-label={label}
                      aria-pressed={guest ? picked : undefined}
                      title={guest ? `${guest.name} (${guest.party})${guest.diet ? ` · ${guest.diet}` : ""}` : `Empty seat ${i + 1}`}
                      draggable={!!guest}
                      onDragStart={(e: React.DragEvent) => {
                        if (!guest) return
                        e.dataTransfer.setData("text/plain", guest.id)
                        e.dataTransfer.effectAllowed = "move"
                        onDragGuest(guest.id)
                      }}
                      onDragEnd={() => {
                        onDragGuest(null)
                        setHover(null)
                      }}
                      onDragOver={(e: React.DragEvent) => allowDrop(e, { table: t.id, seat: i })}
                      onDrop={(e: React.DragEvent) => handleDrop(e, t.id, i)}
                      onClick={tap}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          tap()
                        }
                      }}
                      position="absolute"
                      left={px(pos.x - g.seatSize / 2)}
                      top={py(pos.y - g.seatSize / 2)}
                      w={px(g.seatSize)}
                      aspectRatio="1"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="clamp(9px, 1.25cqw, 15px)"
                      fontWeight="semibold"
                      userSelect="none"
                      cursor={guest ? "grab" : "pointer"}
                      colorPalette={guest ? partyPalette(guest.party) : "gray"}
                      bg={seatOver ? "teal.muted" : guest ? "colorPalette.subtle" : "bg.panel"}
                      color={guest ? "colorPalette.fg" : "fg.subtle"}
                      borderWidth={bad2 ? "3px" : guest ? "2px" : "1.5px"}
                      borderStyle={guest ? "solid" : "dashed"}
                      borderColor={bad2 ? "red.solid" : seatOver ? "teal.solid" : guest ? "colorPalette.solid" : "border.emphasized"}
                      outline={picked ? "3px solid" : undefined}
                      outlineColor={picked ? "teal.solid" : undefined}
                      outlineOffset="2px"
                      transition="transform 0.12s"
                      _hover={{ transform: "scale(1.08)" }}
                      _focusVisible={{ outline: "3px solid", outlineColor: "teal.focusRing", outlineOffset: "2px" }}
                    >
                      {guest ? initials(guest.name) : <span aria-hidden>+</span>}
                      {guest?.diet && (
                        <Box
                          aria-hidden
                          position="absolute"
                          top="-6%"
                          right="-6%"
                          w="30%"
                          aspectRatio="1"
                          borderRadius="full"
                          bg="orange.solid"
                          borderWidth="1.5px"
                          borderColor="bg.panel"
                        />
                      )}
                    </Box>
                  )
                })}
              </React.Fragment>
            )
          })}
        </Box>
        <Box mt="2" display="flex" alignItems="center" gap="3" color="fg.muted" fontSize="xs">
          <Box w={`${(5 / ROOM.width) * 100}%`} borderBottomWidth="2px" borderLeftWidth="2px" borderRightWidth="2px" h="6px" borderColor="fg.muted" aria-hidden />
          <Text>5 m</Text>
          <Text ml="auto">
            Room {ROOM.width} × {ROOM.depth} m, drawn to scale · {GUESTS.length} guests invited
          </Text>
        </Box>
      </Box>
    </Box>
  )
}
```

```tsx components/PlanPanels.tsx
"use client"

import { Badge, Box, Flex, HStack, IconButton, Stack, Text, chakra } from "@chakra-ui/react"
import * as React from "react"
import { LuCircleCheck, LuClock, LuGripVertical, LuTriangleAlert, LuUserMinus } from "react-icons/lu"
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select"
import { DietBadge, PartyDot, RsvpBadge, dietPalette } from "@/components/GuestBits"
import { TABLES, type Guest, type Table } from "@/lib/data"
import {
  RULE_KIND_LABEL,
  guestById,
  occupants,
  tableOptions,
  type Placements,
  type RuleResult,
} from "@/lib/seating"

const Btn = chakra("button")

interface PlaceHandlers {
  pickedId: string | null
  onPick: (id: string) => void
  onDragGuest: (id: string | null) => void
  onPlace: (guestId: string, tableId: string, seat?: number) => void
  onUnseat: (guestId: string) => void
}

function startDrag(e: React.DragEvent, id: string, onDragGuest: (id: string | null) => void) {
  e.dataTransfer.setData("text/plain", id)
  e.dataTransfer.effectAllowed = "move"
  onDragGuest(id)
}

/* ---------------------------------- To place ---------------------------------- */

function PlaceRow({
  guest,
  placements,
  handlers,
}: {
  guest: Guest
  placements: Placements
  handlers: PlaceHandlers
}) {
  const picked = handlers.pickedId === guest.id
  return (
    <Flex
      draggable
      onDragStart={(e: React.DragEvent) => startDrag(e, guest.id, handlers.onDragGuest)}
      onDragEnd={() => handlers.onDragGuest(null)}
      align="center"
      gap="2"
      p="2"
      borderWidth="1px"
      borderRadius="lg"
      bg={picked ? "teal.subtle" : "bg.panel"}
      borderColor={picked ? "teal.solid" : "border"}
    >
      <Btn
        type="button"
        onClick={() => handlers.onPick(guest.id)}
        aria-pressed={picked}
        flex="1"
        minW="0"
        textAlign="left"
        display="flex"
        alignItems="center"
        gap="2"
        cursor="grab"
        borderRadius="md"
        _focusVisible={{ outline: "2px solid", outlineColor: "teal.focusRing" }}
      >
        <Box as="span" color="fg.subtle" aria-hidden>
          <LuGripVertical />
        </Box>
        <Box minW="0">
          <Text fontWeight="medium" fontSize="sm" truncate>
            {guest.name}
          </Text>
          <HStack gap="1.5" wrap="wrap" mt="0.5">
            <PartyDot party={guest.party} />
            <Text fontSize="xs" color="fg.muted">
              {guest.party}
            </Text>
            {guest.rsvp !== "yes" && <RsvpBadge rsvp={guest.rsvp} />}
            <DietBadge diet={guest.diet} />
          </HStack>
        </Box>
      </Btn>
      <NativeSelectRoot size="xs" w="118px" flexShrink={0}>
        <NativeSelectField
          aria-label={`Seat ${guest.name} at`}
          placeholder="Seat at…"
          value=""
          items={tableOptions(placements, guest.id)}
          onChange={(e) => {
            const v = e.currentTarget.value
            if (v) handlers.onPlace(guest.id, v)
          }}
        />
      </NativeSelectRoot>
    </Flex>
  )
}

export function ToPlaceList({
  toPlace,
  awaiting,
  placements,
  handlers,
  dragId,
}: {
  toPlace: Guest[]
  awaiting: Guest[]
  placements: Placements
  handlers: PlaceHandlers
  dragId: string | null
}) {
  const [over, setOver] = React.useState(false)
  const dragged = dragId ? placements[dragId] : null
  return (
    <Stack
      gap="3"
      onDragOver={(e: React.DragEvent) => {
        if (dragId && dragged) {
          e.preventDefault()
          setOver(true)
        }
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e: React.DragEvent) => {
        e.preventDefault()
        setOver(false)
        const id = e.dataTransfer.getData("text/plain") || dragId
        if (id && guestById.has(id)) handlers.onUnseat(id)
      }}
      borderRadius="lg"
      outline={over ? "2px dashed" : undefined}
      outlineColor="teal.solid"
      outlineOffset="2px"
    >
      <Text fontSize="xs" color="fg.muted">
        Drag a guest onto a seat or table, or tap a guest and then a seat. Drag a seated guest here to unseat them.
      </Text>
      <Box>
        <Text fontSize="sm" fontWeight="semibold" mb="2">
          Attending, no seat yet ({toPlace.length})
        </Text>
        {toPlace.length === 0 ? (
          <Flex align="center" gap="2" p="3" borderRadius="lg" bg="green.subtle" color="green.fg" fontSize="sm">
            <LuCircleCheck aria-hidden /> Everyone attending has a seat.
          </Flex>
        ) : (
          <Stack gap="2" as="ul" listStyleType="none" m="0" p="0">
            {toPlace.map((g) => (
              <li key={g.id}>
                <PlaceRow guest={g} placements={placements} handlers={handlers} />
              </li>
            ))}
          </Stack>
        )}
      </Box>
      {awaiting.length > 0 && (
        <Box>
          <Text fontSize="sm" fontWeight="semibold" mb="1">
            Not confirmed ({awaiting.length})
          </Text>
          <Text fontSize="xs" color="fg.muted" mb="2">
            Maybe or no reply yet. Seat them now if you want to hold a place.
          </Text>
          <Stack gap="2" as="ul" listStyleType="none" m="0" p="0">
            {awaiting.map((g) => (
              <li key={g.id}>
                <PlaceRow guest={g} placements={placements} handlers={handlers} />
              </li>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  )
}

/** Compact version for narrow screens, shown above the plan so guests can be dragged onto it. */
export function ToPlaceStrip({
  toPlace,
  awaiting,
  handlers,
  dragId,
  placements,
}: {
  toPlace: Guest[]
  awaiting: Guest[]
  handlers: PlaceHandlers
  dragId: string | null
  placements: Placements
}) {
  const all = [...toPlace, ...awaiting]
  const [over, setOver] = React.useState(false)
  const dragged = dragId ? placements[dragId] : null
  return (
    <Box
      mb="3"
      p="2"
      bg="bg.panel"
      borderWidth="1px"
      borderRadius="xl"
      borderColor={over ? "teal.solid" : "border"}
      onDragOver={(e: React.DragEvent) => {
        if (dragId && dragged) {
          e.preventDefault()
          setOver(true)
        }
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e: React.DragEvent) => {
        e.preventDefault()
        setOver(false)
        const id = e.dataTransfer.getData("text/plain") || dragId
        if (id && guestById.has(id)) handlers.onUnseat(id)
      }}
    >
      <Text fontSize="xs" fontWeight="semibold" color="fg.muted" mb="1.5">
        To place ({toPlace.length}){awaiting.length ? ` + ${awaiting.length} not confirmed` : ""}. Drag onto the plan, or tap a name and then a seat.
      </Text>
      {all.length === 0 ? (
        <Text fontSize="sm" color="green.fg">
          Everyone has a seat.
        </Text>
      ) : (
        <Flex gap="2" overflowX="auto" pb="1" as="ul" listStyleType="none" m="0" p="0">
          {all.map((g) => {
            const picked = handlers.pickedId === g.id
            return (
              <li key={g.id}>
                <Btn
                  type="button"
                  draggable
                  onDragStart={(e: React.DragEvent) => startDrag(e, g.id, handlers.onDragGuest)}
                  onDragEnd={() => handlers.onDragGuest(null)}
                  onClick={() => handlers.onPick(g.id)}
                  aria-pressed={picked}
                  display="inline-flex"
                  alignItems="center"
                  gap="1.5"
                  whiteSpace="nowrap"
                  px="3"
                  h="10"
                  borderRadius="full"
                  borderWidth="1px"
                  fontSize="sm"
                  bg={picked ? "teal.subtle" : "bg.muted"}
                  borderColor={picked ? "teal.solid" : "border"}
                  opacity={g.rsvp === "yes" ? 1 : 0.75}
                  _focusVisible={{ outline: "2px solid", outlineColor: "teal.focusRing" }}
                >
                  <PartyDot party={g.party} />
                  {g.name}
                  {g.diet && <Box aria-label={g.diet} w="2" h="2" borderRadius="full" bg="orange.solid" />}
                </Btn>
              </li>
            )
          })}
        </Flex>
      )}
    </Box>
  )
}

/* ---------------------------------- Tables ---------------------------------- */

export function TableList({
  placements,
  selectedTable,
  broken,
  onSelect,
}: {
  placements: Placements
  selectedTable: string | null
  broken: Record<string, RuleResult[]>
  onSelect: (id: string) => void
}) {
  return (
    <Stack gap="2" as="ul" listStyleType="none" m="0" p="0">
      {TABLES.map((t) => {
        const filled = occupants(placements, t).filter(Boolean).length
        const bad = broken[t.id]?.length ?? 0
        return (
          <li key={t.id}>
            <Btn
              type="button"
              onClick={() => onSelect(t.id)}
              aria-pressed={selectedTable === t.id}
              w="100%"
              display="flex"
              alignItems="center"
              gap="3"
              p="3"
              borderWidth="1px"
              borderRadius="lg"
              textAlign="left"
              bg={selectedTable === t.id ? "teal.subtle" : "bg.panel"}
              borderColor={bad ? "red.solid" : "border"}
              _focusVisible={{ outline: "2px solid", outlineColor: "teal.focusRing" }}
            >
              <Text fontWeight="medium" flex="1">
                {t.name}
              </Text>
              {bad > 0 && (
                <Badge colorPalette="red" variant="solid" size="sm">
                  {bad} broken
                </Badge>
              )}
              <Text fontSize="sm" color={filled === t.seats ? "green.fg" : "fg.muted"}>
                {filled}/{t.seats} seats
              </Text>
            </Btn>
          </li>
        )
      })}
    </Stack>
  )
}

export function TableDetail({
  table,
  placements,
  bad,
  handlers,
  onBack,
}: {
  table: Table
  placements: Placements
  bad: RuleResult[]
  handlers: PlaceHandlers
  onBack: () => void
}) {
  const occ = occupants(placements, table)
  const guests = occ.flatMap((id) => (id ? [guestById.get(id)!] : []))
  const dietCounts = new Map<string, number>()
  for (const g of guests) if (g.diet) dietCounts.set(g.diet, (dietCounts.get(g.diet) ?? 0) + 1)
  const free = table.seats - guests.length

  return (
    <Stack gap="3">
      <Flex align="center" justify="space-between" gap="2">
        <Box>
          <Text fontWeight="semibold" fontSize="lg">
            {table.name}
          </Text>
          <Text fontSize="sm" color="fg.muted">
            {guests.length} of {table.seats} seats filled · {free} free
          </Text>
        </Box>
        <Btn
          type="button"
          onClick={onBack}
          fontSize="sm"
          color="teal.fg"
          textDecoration="underline"
          _focusVisible={{ outline: "2px solid", outlineColor: "teal.focusRing" }}
        >
          All tables
        </Btn>
      </Flex>

      {bad.map((r) => (
        <Flex key={r.index} gap="2" p="2.5" borderRadius="lg" bg="red.subtle" color="red.fg" fontSize="sm">
          <Box mt="0.5">
            <LuTriangleAlert aria-hidden />
          </Box>
          <Box>
            <Text fontWeight="medium">{r.headline}</Text>
            <Text fontSize="xs">{r.rule.note}</Text>
          </Box>
        </Flex>
      ))}

      <Box>
        <Text fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="0.04em" mb="1.5">
          Dietary needs at this table
        </Text>
        {dietCounts.size === 0 ? (
          <Text fontSize="sm" color="fg.muted">
            None given.
          </Text>
        ) : (
          <HStack gap="1.5" wrap="wrap">
            {Array.from(dietCounts.entries()).map(([d, n]) => (
              <Badge key={d} colorPalette={dietPalette(d)} variant="subtle">
                {d} × {n}
              </Badge>
            ))}
          </HStack>
        )}
      </Box>

      <Stack gap="2" as="ul" listStyleType="none" m="0" p="0">
        {occ.map((id, i) => {
          const g = id ? guestById.get(id) : undefined
          if (!g) {
            return (
              <li key={`e-${i}`}>
                <Flex align="center" gap="2" p="2" borderWidth="1px" borderStyle="dashed" borderRadius="lg" color="fg.muted" fontSize="sm">
                  <Text w="6" fontWeight="medium">
                    {i + 1}
                  </Text>
                  Empty seat
                </Flex>
              </li>
            )
          }
          const picked = handlers.pickedId === g.id
          const opts = tableOptions(placements, g.id).filter((o) => o.value !== table.id)
          return (
            <li key={g.id}>
              <Flex
                align="center"
                gap="2"
                p="2"
                borderWidth="1px"
                borderRadius="lg"
                bg={picked ? "teal.subtle" : "bg.panel"}
                borderColor={picked ? "teal.solid" : "border"}
                draggable
                onDragStart={(e: React.DragEvent) => startDrag(e, g.id, handlers.onDragGuest)}
                onDragEnd={() => handlers.onDragGuest(null)}
              >
                <Text w="6" fontSize="sm" fontWeight="medium" color="fg.muted" textAlign="center">
                  {i + 1}
                </Text>
                <Btn
                  type="button"
                  onClick={() => handlers.onPick(g.id)}
                  aria-pressed={picked}
                  flex="1"
                  minW="0"
                  textAlign="left"
                  borderRadius="md"
                  _focusVisible={{ outline: "2px solid", outlineColor: "teal.focusRing" }}
                >
                  <Text fontWeight="medium" fontSize="sm" truncate>
                    {g.name}
                  </Text>
                  <HStack gap="1.5" wrap="wrap" mt="0.5">
                    <PartyDot party={g.party} />
                    <Text fontSize="xs" color="fg.muted">
                      {g.party}
                    </Text>
                    {g.diet ? (
                      <DietBadge diet={g.diet} />
                    ) : (
                      <Text fontSize="xs" color="fg.subtle">
                        No dietary needs
                      </Text>
                    )}
                  </HStack>
                </Btn>
                <NativeSelectRoot size="xs" w="104px" flexShrink={0}>
                  <NativeSelectField
                    aria-label={`Move ${g.name} to another table`}
                    placeholder="Move to…"
                    value=""
                    items={opts}
                    onChange={(e) => {
                      const v = e.currentTarget.value
                      if (v) handlers.onPlace(g.id, v)
                    }}
                  />
                </NativeSelectRoot>
                <IconButton
                  size="xs"
                  variant="ghost"
                  aria-label={`Unseat ${g.name}`}
                  onClick={() => handlers.onUnseat(g.id)}
                >
                  <LuUserMinus />
                </IconButton>
              </Flex>
            </li>
          )
        })}
      </Stack>
    </Stack>
  )
}

/* ---------------------------------- Rules ---------------------------------- */

const STATUS_ORDER = { broken: 0, open: 1, ok: 2 } as const

export function RulesList({
  rules,
  onShow,
}: {
  rules: RuleResult[]
  onShow: (tableId: string) => void
}) {
  const sorted = [...rules].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])
  return (
    <Stack gap="2" as="ul" listStyleType="none" m="0" p="0">
      {sorted.map((r) => {
        const palette = r.status === "broken" ? "red" : r.status === "ok" ? "green" : "gray"
        return (
          <li key={r.index}>
            <Box
              colorPalette={palette}
              p="3"
              borderRadius="lg"
              borderWidth="1px"
              borderColor={r.status === "broken" ? "red.solid" : "border"}
              bg={r.status === "broken" ? "red.subtle" : "bg.panel"}
            >
              <Flex align="center" gap="2" mb="1">
                <Box color="colorPalette.fg" aria-hidden>
                  {r.status === "broken" ? <LuTriangleAlert /> : r.status === "ok" ? <LuCircleCheck /> : <LuClock />}
                </Box>
                <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="0.04em" color="colorPalette.fg">
                  {RULE_KIND_LABEL[r.rule.kind]} ·{" "}
                  {r.status === "broken" ? "Broken" : r.status === "ok" ? "Kept" : "Waiting"}
                </Text>
              </Flex>
              <Text fontSize="sm" fontWeight="medium">
                {r.headline}
              </Text>
              <Text fontSize="xs" color="fg.muted">
                {r.detail}
              </Text>
              <Text fontSize="xs" color="fg.muted" mt="1">
                Couple's note: {r.rule.note}
              </Text>
              {r.rule.dataNote && (
                <Text fontSize="xs" color="fg.muted" mt="1" fontStyle="italic">
                  {r.rule.dataNote}
                </Text>
              )}
              {r.tables.length > 0 && (
                <HStack gap="2" mt="2" wrap="wrap">
                  {r.tables.map((t) => (
                    <Btn
                      key={t}
                      type="button"
                      onClick={() => onShow(t)}
                      fontSize="xs"
                      px="2"
                      h="6"
                      borderRadius="md"
                      borderWidth="1px"
                      bg="bg.panel"
                      _hover={{ bg: "bg.muted" }}
                      _focusVisible={{ outline: "2px solid", outlineColor: "teal.focusRing" }}
                    >
                      Show {TABLES.find((x) => x.id === t)?.name}
                    </Btn>
                  ))}
                </HStack>
              )}
            </Box>
          </li>
        )
      })}
    </Stack>
  )
}
```

```tsx components/PlanView.tsx
"use client"

import { Badge, Box, Button, Flex, Grid, HStack, Tabs, Text, VisuallyHidden, chakra } from "@chakra-ui/react"
import * as React from "react"
import { LuCircleCheck, LuTriangleAlert } from "react-icons/lu"
import { toaster } from "@/components/ui/toaster"
import { RoomPlan } from "@/components/RoomPlan"
import { RulesList, TableDetail, TableList, ToPlaceList, ToPlaceStrip } from "@/components/PlanPanels"
import { PARTY_PALETTE } from "@/components/GuestBits"
import { TABLES } from "@/lib/data"
import {
  brokenByTable,
  computeStats,
  evaluateRules,
  guestById,
  placeGuest,
  tableById,
  tableName,
  unseatGuest,
  usePlacements,
} from "@/lib/seating"

const Btn = chakra("button")

function StatCard({ label, value, hint, tone }: { label: string; value: string | number; hint?: string; tone?: "red" | "green" }) {
  return (
    <Box bg="bg.panel" borderWidth="1px" borderRadius="xl" px="4" py="3" borderColor={tone === "red" ? "red.solid" : "border"}>
      <Text fontSize="xs" color="fg.muted" fontWeight="medium" textTransform="uppercase" letterSpacing="0.04em">
        {label}
      </Text>
      <Text fontSize="3xl" fontWeight="semibold" lineHeight="1.1" color={tone === "red" ? "red.fg" : tone === "green" ? "green.fg" : "fg"}>
        {value}
      </Text>
      {hint && (
        <Text fontSize="xs" color="fg.muted">
          {hint}
        </Text>
      )}
    </Box>
  )
}

export function PlanView() {
  const placements = usePlacements()
  const [selectedTable, setSelectedTable] = React.useState<string | null>(null)
  const [pickedId, setPickedId] = React.useState<string | null>(null)
  const [dragId, setDragId] = React.useState<string | null>(null)
  const [tab, setTab] = React.useState("place")
  const [status, setStatus] = React.useState("")

  const rules = React.useMemo(() => evaluateRules(placements), [placements])
  const stats = React.useMemo(() => computeStats(placements), [placements])
  const broken = React.useMemo(() => brokenByTable(rules), [rules])
  const brokenRules = rules.filter((r) => r.status === "broken")
  const keptRules = rules.filter((r) => r.status === "ok").length
  const waitingRules = rules.filter((r) => r.status === "open").length

  const place = React.useCallback((guestId: string, tableId: string, seat?: number) => {
    const guest = guestById.get(guestId)
    if (!guest) return
    const res = placeGuest(guestId, tableId, seat)
    setDragId(null)
    if (!res.ok) {
      toaster.create({ title: "Could not seat guest", description: res.reason, type: "error" })
      return
    }
    setPickedId(null)
    setSelectedTable(tableId)
    setStatus(`${guest.name} is at ${tableName(tableId)}.`)
  }, [])

  const unseat = React.useCallback((guestId: string) => {
    const guest = guestById.get(guestId)
    unseatGuest(guestId)
    setDragId(null)
    setPickedId(null)
    if (guest) setStatus(`${guest.name} is unseated.`)
  }, [])

  const pick = React.useCallback((id: string) => {
    setPickedId((cur) => (cur === id ? null : id))
  }, [])

  const showTable = React.useCallback((id: string) => {
    setSelectedTable(id)
    setTab("table")
  }, [])

  const onTapSeat = (tableId: string, seat: number, occupant: string | null) => {
    if (pickedId) {
      if (occupant === pickedId) setPickedId(null)
      else place(pickedId, tableId, seat)
      return
    }
    showTable(tableId)
    if (occupant) setPickedId(occupant)
  }
  const onTapTable = (tableId: string) => {
    if (pickedId) place(pickedId, tableId)
    else showTable(tableId)
  }

  const picked = pickedId ? guestById.get(pickedId) : undefined
  const pickedSeat = pickedId ? placements[pickedId] : null
  const handlers = { pickedId, onPick: pick, onDragGuest: setDragId, onPlace: place, onUnseat: unseat }
  const selected = selectedTable ? tableById.get(selectedTable) : undefined

  return (
    <Box colorPalette="teal">
      <VisuallyHidden role="status" aria-live="polite">
        {status}
      </VisuallyHidden>

      <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap="3" mb="3">
        <StatCard label="Seated" value={stats.seated} hint={`of ${stats.attending} attending`} />
        <StatCard label="To place" value={stats.toPlace.length} hint="attending, no seat yet" tone={stats.toPlace.length === 0 ? "green" : undefined} />
        <StatCard label="Not confirmed" value={stats.awaiting.length} hint={`maybe or no reply · ${stats.declined} declined`} />
        <StatCard label="Free seats" value={stats.freeSeats} hint={`of ${stats.totalSeats} in ${TABLES.length} tables`} />
      </Grid>

      <Box
        mb="3"
        borderRadius="xl"
        borderWidth="1px"
        px="4"
        py="3"
        bg={brokenRules.length ? "red.subtle" : "green.subtle"}
        borderColor={brokenRules.length ? "red.solid" : "green.muted"}
        color={brokenRules.length ? "red.fg" : "green.fg"}
        aria-label="Couple's rules summary"
        role="region"
      >
        <Flex align="center" gap="2" fontWeight="semibold" fontSize="sm">
          {brokenRules.length ? <LuTriangleAlert aria-hidden /> : <LuCircleCheck aria-hidden />}
          <Text>
            {brokenRules.length
              ? `${brokenRules.length} of the couple's rules ${brokenRules.length === 1 ? "is" : "are"} broken`
              : "No rules broken"}
          </Text>
          <Text fontWeight="normal" color="fg.muted">
            · {keptRules} kept · {waitingRules} waiting for guests to be placed
          </Text>
        </Flex>
        {brokenRules.length > 0 && (
          <Box as="ul" listStyleType="none" m="0" mt="1.5" p="0" fontSize="sm" color="fg">
            {brokenRules.map((r) => (
              <li key={r.index}>
                <Btn
                  type="button"
                  textAlign="left"
                  py="1"
                  onClick={() => r.tables[0] && showTable(r.tables[0])}
                  _hover={{ textDecoration: "underline" }}
                  _focusVisible={{ outline: "2px solid", outlineColor: "teal.focusRing" }}
                >
                  {r.headline}. <Text as="span" color="fg.muted">{r.detail}</Text>
                </Btn>
              </li>
            ))}
          </Box>
        )}
      </Box>

      {picked && (
        <Flex
          position="sticky"
          top="14"
          zIndex="docked"
          mb="3"
          p="3"
          gap="3"
          align="center"
          wrap="wrap"
          bg="teal.solid"
          color="teal.contrast"
          borderRadius="xl"
          boxShadow="md"
        >
          <Text fontSize="sm" fontWeight="medium" flex="1" minW="220px">
            {pickedSeat
              ? `Moving ${picked.name} from ${tableName(pickedSeat.table)}, seat ${pickedSeat.seat + 1}.`
              : `Seating ${picked.name}.`}{" "}
            Tap a seat or a table in the plan.
          </Text>
          {pickedSeat && (
            <Button size="sm" variant="surface" onClick={() => unseat(picked.id)}>
              Unseat
            </Button>
          )}
          <Button size="sm" variant="outline" color="teal.contrast" _hover={{ bg: "whiteAlpha.200" }} onClick={() => setPickedId(null)}>
            Cancel
          </Button>
        </Flex>
      )}

      <Grid templateColumns={{ base: "minmax(0, 1fr)", xl: "minmax(0, 1fr) 390px" }} gap="4" alignItems="start">
        <Box minW="0">
          <Box display={{ base: "block", xl: "none" }}>
            <ToPlaceStrip toPlace={stats.toPlace} awaiting={stats.awaiting} handlers={handlers} dragId={dragId} placements={placements} />
          </Box>
          <Box bg="bg.panel" borderWidth="1px" borderRadius="xl" p={{ base: "2", md: "3" }}>
            <RoomPlan
              placements={placements}
              rules={rules}
              selectedTable={selectedTable}
              pickedId={pickedId}
              dragId={dragId}
              onDragGuest={setDragId}
              onDropGuest={place}
              onTapSeat={onTapSeat}
              onTapTable={onTapTable}
            />
            <Text display={{ base: "block", xl: "none" }} mt="2" fontSize="xs" color="fg.muted">
              The plan scrolls sideways on narrow screens. You can also seat guests from the lists below it.
            </Text>
          </Box>
          <Flex mt="3" gap="x" wrap="wrap" columnGap="4" rowGap="1.5" fontSize="xs" color="fg.muted" as="ul" listStyleType="none" m="0" p="0" pt="3">
            {Object.entries(PARTY_PALETTE).map(([party, palette]) => (
              <HStack as="li" key={party} gap="1.5">
                <Box aria-hidden w="2.5" h="2.5" borderRadius="full" colorPalette={palette} bg="colorPalette.solid" />
                {party}
              </HStack>
            ))}
            <HStack as="li" gap="1.5">
              <Box aria-hidden w="2.5" h="2.5" borderRadius="full" bg="orange.solid" />
              Dietary need
            </HStack>
            <HStack as="li" gap="1.5">
              <Box aria-hidden w="2.5" h="2.5" borderRadius="full" borderWidth="1.5px" borderStyle="dashed" borderColor="border.emphasized" />
              Empty seat
            </HStack>
            <HStack as="li" gap="1.5">
              <Box aria-hidden w="2.5" h="2.5" borderRadius="full" borderWidth="2px" borderColor="red.solid" />
              Rule broken
            </HStack>
          </Flex>
        </Box>

        <Box
          bg="bg.panel"
          borderWidth="1px"
          borderRadius="xl"
          p="3"
          position={{ xl: "sticky" }}
          top={{ xl: "20" }}
          maxH={{ xl: "calc(100dvh - 7rem)" }}
          overflowY={{ xl: "auto" }}
        >
          <Tabs.Root value={tab} onValueChange={(e) => setTab(e.value)} variant="line" fitted size="sm">
            <Tabs.List>
              <Tabs.Trigger value="place">
                To place
                <Badge colorPalette={stats.toPlace.length ? "orange" : "green"} variant="subtle">
                  {stats.toPlace.length}
                </Badge>
              </Tabs.Trigger>
              <Tabs.Trigger value="table">Table</Tabs.Trigger>
              <Tabs.Trigger value="rules">
                Rules
                <Badge colorPalette={brokenRules.length ? "red" : "green"} variant="subtle">
                  {brokenRules.length}
                </Badge>
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="place" pt="3">
              <ToPlaceList toPlace={stats.toPlace} awaiting={stats.awaiting} placements={placements} handlers={handlers} dragId={dragId} />
            </Tabs.Content>
            <Tabs.Content value="table" pt="3">
              {selected ? (
                <TableDetail
                  table={selected}
                  placements={placements}
                  bad={broken[selected.id] ?? []}
                  handlers={handlers}
                  onBack={() => setSelectedTable(null)}
                />
              ) : (
                <Box>
                  <Text fontSize="sm" color="fg.muted" mb="3">
                    Select a table in the plan, or here, to see who sits there and what they eat.
                  </Text>
                  <TableList placements={placements} selectedTable={selectedTable} broken={broken} onSelect={showTable} />
                </Box>
              )}
            </Tabs.Content>
            <Tabs.Content value="rules" pt="3">
              <RulesList rules={rules} onShow={showTable} />
            </Tabs.Content>
          </Tabs.Root>
        </Box>
      </Grid>
    </Box>
  )
}
```

```tsx components/GuestsView.tsx
"use client"

import { Badge, Box, Button, Flex, Grid, HStack, Input, Stack, Table, Text } from "@chakra-ui/react"
import * as React from "react"
import { LuSearch, LuUtensils } from "react-icons/lu"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select"
import { toaster } from "@/components/ui/toaster"
import { DietBadge, PartyDot, RSVP_LABEL, RsvpBadge } from "@/components/GuestBits"
import { GUESTS, TABLES, type Rsvp } from "@/lib/data"
import {
  STANDARD_MEAL,
  mealOf,
  occupants,
  placeGuest,
  tableById,
  tableName,
  unseatGuest,
  usePlacements,
} from "@/lib/seating"

const PARTIES = Array.from(new Set(GUESTS.map((g) => g.party)))
const DIETS = Array.from(new Set(GUESTS.flatMap((g) => (g.diet ? [g.diet] : [])))).sort()
const RSVP_ORDER: Rsvp[] = ["yes", "maybe", "pending", "no"]
const COLUMNS = { md: "minmax(0,2fr) minmax(0,1.5fr) 130px minmax(0,1.3fr) 190px" }

export function GuestsView() {
  const placements = usePlacements()
  const [q, setQ] = React.useState("")
  const [party, setParty] = React.useState("")
  const [rsvp, setRsvp] = React.useState("")
  const [diet, setDiet] = React.useState("")
  const [seating, setSeating] = React.useState("")

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase()
    return GUESTS.filter((g) => {
      if (needle && !g.name.toLowerCase().includes(needle)) return false
      if (party && g.party !== party) return false
      if (rsvp && g.rsvp !== rsvp) return false
      if (diet === "__none") {
        if (g.diet) return false
      } else if (diet && g.diet !== diet) return false
      if (seating === "seated" && !placements[g.id]) return false
      if (seating === "unseated" && placements[g.id]) return false
      return true
    }).sort((a, b) => a.name.localeCompare(b.name))
  }, [q, party, rsvp, diet, seating, placements])

  const filtersOn = !!(q || party || rsvp || diet || seating)
  const reset = () => {
    setQ("")
    setParty("")
    setRsvp("")
    setDiet("")
    setSeating("")
  }

  const meals = React.useMemo(() => {
    const map = new Map<string, { confirmed: number; possible: number }>()
    for (const g of GUESTS) {
      if (g.rsvp === "no") continue
      const m = mealOf(g)
      const row = map.get(m) ?? { confirmed: 0, possible: 0 }
      if (g.rsvp === "yes") row.confirmed++
      else row.possible++
      map.set(m, row)
    }
    const rows = Array.from(map.entries()).sort(([a], [b]) => {
      if (a === STANDARD_MEAL) return -1
      if (b === STANDARD_MEAL) return 1
      return a.localeCompare(b)
    })
    const totals = rows.reduce((t, [, r]) => ({ confirmed: t.confirmed + r.confirmed, possible: t.possible + r.possible }), {
      confirmed: 0,
      possible: 0,
    })
    return { rows, totals }
  }, [])

  const freeAt = (tableId: string) => {
    const t = tableById.get(tableId)
    return t ? occupants(placements, t).filter((x) => x === null).length : 0
  }

  const setTable = (guestId: string, value: string) => {
    if (!value) {
      unseatGuest(guestId)
      return
    }
    const res = placeGuest(guestId, value)
    if (!res.ok) toaster.create({ title: "Could not seat guest", description: res.reason, type: "error" })
  }

  return (
    <Grid templateColumns={{ base: "minmax(0,1fr)", lg: "minmax(0,1fr) 340px" }} gap="4" alignItems="start" colorPalette="teal">
      <Box minW="0">
        <Box bg="bg.panel" borderWidth="1px" borderRadius="xl" p="3" mb="3">
          <Grid templateColumns={{ base: "1fr 1fr", md: "2fr repeat(4, 1fr)" }} gap="3" alignItems="end">
            <Box gridColumn={{ base: "1 / -1", md: "auto" }}>
              <Field label="Search">
                <InputGroup startElement={<LuSearch />} w="100%">
                  <Input placeholder="Guest name" value={q} onChange={(e) => setQ(e.currentTarget.value)} />
                </InputGroup>
              </Field>
            </Box>
            <Field label="Party">
              <NativeSelectRoot>
                <NativeSelectField value={party} onChange={(e) => setParty(e.currentTarget.value)}>
                  <option value="">All parties</option>
                  {PARTIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </NativeSelectField>
              </NativeSelectRoot>
            </Field>
            <Field label="RSVP">
              <NativeSelectRoot>
                <NativeSelectField value={rsvp} onChange={(e) => setRsvp(e.currentTarget.value)}>
                  <option value="">Any RSVP</option>
                  {RSVP_ORDER.map((r) => (
                    <option key={r} value={r}>
                      {RSVP_LABEL[r]}
                    </option>
                  ))}
                </NativeSelectField>
              </NativeSelectRoot>
            </Field>
            <Field label="Diet">
              <NativeSelectRoot>
                <NativeSelectField value={diet} onChange={(e) => setDiet(e.currentTarget.value)}>
                  <option value="">Any diet</option>
                  <option value="__none">No dietary needs</option>
                  {DIETS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </NativeSelectField>
              </NativeSelectRoot>
            </Field>
            <Field label="Seating">
              <NativeSelectRoot>
                <NativeSelectField value={seating} onChange={(e) => setSeating(e.currentTarget.value)}>
                  <option value="">Seated or not</option>
                  <option value="seated">Seated</option>
                  <option value="unseated">Not seated</option>
                </NativeSelectField>
              </NativeSelectRoot>
            </Field>
          </Grid>
          <Flex mt="3" align="center" justify="space-between" gap="3">
            <Text fontSize="sm" color="fg.muted" role="status" aria-live="polite">
              Showing {filtered.length} of {GUESTS.length} guests
            </Text>
            {filtersOn && (
              <Button size="xs" variant="ghost" onClick={reset}>
                Clear filters
              </Button>
            )}
          </Flex>
        </Box>

        <Box bg="bg.panel" borderWidth="1px" borderRadius="xl" overflow="hidden">
          <Grid
            display={{ base: "none", md: "grid" }}
            templateColumns={COLUMNS.md}
            gap="3"
            px="4"
            py="2.5"
            bg="bg.muted"
            borderBottomWidth="1px"
            fontSize="xs"
            fontWeight="semibold"
            color="fg.muted"
            textTransform="uppercase"
            letterSpacing="0.04em"
          >
            <Text>Guest</Text>
            <Text>Party</Text>
            <Text>RSVP</Text>
            <Text>Meal</Text>
            <Text>Table</Text>
          </Grid>
          {filtered.length === 0 ? (
            <Stack align="center" gap="2" py="10" px="4" textAlign="center">
              <Text fontWeight="medium">No guests match these filters</Text>
              <Text fontSize="sm" color="fg.muted">
                Try a different name, or clear the filters.
              </Text>
              <Button size="sm" variant="outline" onClick={reset}>
                Clear filters
              </Button>
            </Stack>
          ) : (
            <Box as="ul" listStyleType="none" m="0" p="0">
              {filtered.map((g) => {
                const seat = placements[g.id]
                return (
                  <Grid
                    as="li"
                    key={g.id}
                    templateColumns={{ base: "1fr", ...COLUMNS }}
                    gap={{ base: "1.5", md: "3" }}
                    alignItems="center"
                    px="4"
                    py="3"
                    borderBottomWidth="1px"
                    borderColor="border.muted"
                    _last={{ borderBottomWidth: "0" }}
                  >
                    <Flex align="center" justify="space-between" gap="2">
                      <Text fontWeight="medium">{g.name}</Text>
                      <Box display={{ base: "block", md: "none" }}>
                        <RsvpBadge rsvp={g.rsvp} />
                      </Box>
                    </Flex>
                    <HStack gap="1.5" color="fg.muted" fontSize="sm">
                      <PartyDot party={g.party} />
                      <Text>{g.party}</Text>
                    </HStack>
                    <Box display={{ base: "none", md: "block" }}>
                      <RsvpBadge rsvp={g.rsvp} />
                    </Box>
                    <Box>
                      {g.diet ? (
                        <DietBadge diet={g.diet} />
                      ) : (
                        <Text fontSize="sm" color="fg.muted">
                          {STANDARD_MEAL}
                        </Text>
                      )}
                    </Box>
                    <Box>
                      {g.rsvp === "no" ? (
                        <Text fontSize="sm" color="fg.muted">
                          Not coming
                        </Text>
                      ) : (
                        <>
                          <NativeSelectRoot size="sm">
                            <NativeSelectField
                              aria-label={`Table for ${g.name}`}
                              value={seat?.table ?? ""}
                              onChange={(e) => setTable(g.id, e.currentTarget.value)}
                            >
                              <option value="">Not seated</option>
                              {TABLES.map((t) => (
                                <option key={t.id} value={t.id} disabled={freeAt(t.id) === 0 && seat?.table !== t.id}>
                                  {t.name} · {freeAt(t.id)} free
                                </option>
                              ))}
                            </NativeSelectField>
                          </NativeSelectRoot>
                          {seat && (
                            <Text fontSize="xs" color="fg.muted" mt="0.5">
                              {tableName(seat.table)}, seat {seat.seat + 1}
                            </Text>
                          )}
                        </>
                      )}
                    </Box>
                  </Grid>
                )
              })}
            </Box>
          )}
        </Box>
      </Box>

      <Box bg="bg.panel" borderWidth="1px" borderRadius="xl" p="4" order={{ base: -1, lg: 0 }} position={{ lg: "sticky" }} top={{ lg: "20" }}>
        <HStack gap="2" mb="1">
          <LuUtensils aria-hidden />
          <Text fontWeight="semibold">Meals for the caterer</Text>
        </HStack>
        <Text fontSize="xs" color="fg.muted" mb="3">
          Everyone who has not declined. Counts do not change with the filters.
        </Text>
        <Table.ScrollArea>
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Meal</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">Attending</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">Not confirmed</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {meals.rows.map(([meal, r]) => (
                <Table.Row key={meal}>
                  <Table.Cell>{meal}</Table.Cell>
                  <Table.Cell textAlign="end" fontWeight="semibold">
                    {r.confirmed}
                  </Table.Cell>
                  <Table.Cell textAlign="end" color="fg.muted">
                    {r.possible}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.Cell fontWeight="semibold">Total</Table.Cell>
                <Table.Cell textAlign="end" fontWeight="semibold">
                  {meals.totals.confirmed}
                </Table.Cell>
                <Table.Cell textAlign="end" color="fg.muted" fontWeight="semibold">
                  {meals.totals.possible}
                </Table.Cell>
              </Table.Row>
            </Table.Footer>
          </Table.Root>
        </Table.ScrollArea>
        <Flex mt="3" gap="2" wrap="wrap">
          <Badge variant="subtle" colorPalette="green">
            {GUESTS.filter((g) => g.rsvp === "no").length} declined, not counted
          </Badge>
        </Flex>
      </Box>
    </Grid>
  )
}
```

```tsx app/page.tsx
import type { Metadata } from "next"
import { AppShell } from "@/components/AppShell"
import { PlanView } from "@/components/PlanView"

export const metadata: Metadata = { title: "Seating plan · Seatwise" }

export default function Page() {
  return (
    <AppShell title="Seating plan">
      <PlanView />
    </AppShell>
  )
}
```

```tsx app/guests/page.tsx
import type { Metadata } from "next"
import { AppShell } from "@/components/AppShell"
import { GuestsView } from "@/components/GuestsView"

export const metadata: Metadata = { title: "Guest list · Seatwise" }

export default function Page() {
  return (
    <AppShell title="Guest list">
      <GuestsView />
    </AppShell>
  )
}
```
