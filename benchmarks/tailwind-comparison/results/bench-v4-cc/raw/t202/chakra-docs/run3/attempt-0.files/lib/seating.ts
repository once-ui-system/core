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
