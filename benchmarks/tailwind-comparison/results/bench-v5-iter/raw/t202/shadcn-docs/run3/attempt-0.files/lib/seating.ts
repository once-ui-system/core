import type { CSSProperties } from "react"
import {
  FIXTURES,
  GUESTS,
  RULES,
  TABLES,
  type Guest,
  type Rsvp,
  type TableDef,
} from "./data"

export const GUEST_BY_ID: Record<string, Guest> = Object.fromEntries(
  GUESTS.map((g) => [g.id, g])
)
export const TABLE_BY_ID: Record<string, TableDef> = Object.fromEntries(
  TABLES.map((t) => [t.id, t])
)

export const DIET_NONE = "Standard menu"

/* ---------- geometry (metres) ---------- */

export const LONG_W = 8
export const LONG_H = 1.1
export const ROUND_D = 1.8
export const SEAT_D = 0.9
export const SEAT_RING = 1.4

export function tableCenter(t: TableDef): { x: number; y: number } {
  return t.shape === "long"
    ? { x: t.x + LONG_W / 2, y: t.y + LONG_H / 2 }
    : { x: t.x, y: t.y }
}

function fixtureCenter(kind: string): { x: number; y: number } {
  const f = FIXTURES.find((fx) => fx.kind === kind)
  return f ? { x: f.x + f.w / 2, y: f.y + f.h / 2 } : { x: 0, y: 0 }
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/* ---------- placement ---------- */

export interface SeatRef {
  table: string
  seat: number
}
export type Placement = Record<string, SeatRef | null>

export function initialPlacement(): Placement {
  const next: Placement = {}
  const used: Record<string, number> = {}
  for (const g of GUESTS) {
    if (g.table) {
      const i = used[g.table] ?? 0
      used[g.table] = i + 1
      next[g.id] = { table: g.table, seat: i }
    } else {
      next[g.id] = null
    }
  }
  return next
}

/** For every table, one entry per seat: a guest id or null for an empty seat. */
export function seatsByTable(p: Placement): Record<string, (string | null)[]> {
  const out: Record<string, (string | null)[]> = {}
  for (const t of TABLES) out[t.id] = Array.from({ length: t.seats }, () => null)
  for (const [gid, ref] of Object.entries(p)) {
    if (ref) out[ref.table][ref.seat] = gid
  }
  return out
}

/* ---------- rules ---------- */

export type RuleStatus = "ok" | "broken" | "open"

export interface RuleResult {
  id: string
  kind: "together" | "apart" | "near"
  status: RuleStatus
  title: string
  note: string
  detail: string
  tableIds: string[]
  review?: string
}

const NEAR_DOORS_MAX_M = 6
const FROM_BAND_MIN_M = 7

function tableName(id: string) {
  return TABLE_BY_ID[id]?.name ?? id
}

export function evaluateRules(p: Placement): RuleResult[] {
  return RULES.map((rule, i): RuleResult => {
    const id = `rule-${i}`
    const gs = rule.guests.map((gid) => GUEST_BY_ID[gid])
    const names = gs.map((g) => g.name)
    const refs = rule.guests.map((gid) => p[gid])
    const seatedTables = refs.flatMap((r) => (r ? [r.table] : []))
    const base = { id, kind: rule.kind, note: rule.note, review: rule.review }

    if (rule.kind === "together") {
      const title = `Keep together: ${names.join(" & ")}`
      if (refs.some((r) => !r)) {
        const waiting = gs.filter((_, k) => !refs[k]).map((g) => g.name)
        return {
          ...base,
          title,
          status: "open",
          detail: `Waiting for a seat: ${waiting.join(", ")}.`,
          tableIds: seatedTables,
        }
      }
      const same = refs.every((r) => r && r.table === refs[0]?.table)
      return {
        ...base,
        title,
        status: same ? "ok" : "broken",
        detail: same
          ? `Both at ${tableName(seatedTables[0])}.`
          : refs.map((r, k) => `${gs[k].name} is at ${tableName(r!.table)}`).join("; ") + ".",
        tableIds: [...new Set(seatedTables)],
      }
    }

    if (rule.kind === "apart") {
      const title = `Keep apart: ${names.join(" & ")}`
      if (refs.some((r) => !r)) {
        const placed = gs
          .map((g, k) => (refs[k] ? `${g.name} is at ${tableName(refs[k]!.table)}` : `${g.name} has no seat yet`))
          .join("; ")
        return { ...base, title, status: "ok", detail: `${placed}. Nothing to clash yet.`, tableIds: [] }
      }
      const clash = refs[0]!.table === refs[1]!.table
      return {
        ...base,
        title,
        status: clash ? "broken" : "ok",
        detail: clash
          ? `Both are at ${tableName(refs[0]!.table)}.`
          : `${gs[0].name} at ${tableName(refs[0]!.table)}, ${gs[1].name} at ${tableName(refs[1]!.table)}.`,
        tableIds: clash ? [refs[0]!.table] : [],
      }
    }

    // near
    const title = `Near the garden doors: ${names[0]}`
    const ref = refs[0]
    if (!ref) {
      return {
        ...base,
        title,
        status: "open",
        detail: `${names[0]} needs a seat within ${NEAR_DOORS_MAX_M} m of the garden doors and at least ${FROM_BAND_MIN_M} m from the band.`,
        tableIds: [],
      }
    }
    const c = tableCenter(TABLE_BY_ID[ref.table])
    const toDoors = dist(c, fixtureCenter("door"))
    const toBand = dist(c, fixtureCenter("stage"))
    const ok = toDoors <= NEAR_DOORS_MAX_M && toBand >= FROM_BAND_MIN_M
    const metrics = `${tableName(ref.table)} is ${toDoors.toFixed(1)} m from the garden doors and ${toBand.toFixed(1)} m from the band`
    return {
      ...base,
      title,
      status: ok ? "ok" : "broken",
      detail: ok
        ? `${metrics}.`
        : `${metrics}. Aim for under ${NEAR_DOORS_MAX_M} m from the doors and ${FROM_BAND_MIN_M} m or more from the band.`,
      tableIds: [ref.table],
    }
  })
}

/* ---------- counts ---------- */

export interface Counts {
  seated: number
  attending: number
  unseated: Guest[]
  unconfirmed: Guest[]
  declined: number
  capacity: number
  free: number
  perTable: Record<string, { filled: number; seats: number }>
}

export function computeCounts(p: Placement): Counts {
  const seatMap = seatsByTable(p)
  const perTable: Counts["perTable"] = {}
  let seated = 0
  let capacity = 0
  for (const t of TABLES) {
    const filled = seatMap[t.id].filter(Boolean).length
    perTable[t.id] = { filled, seats: t.seats }
    seated += filled
    capacity += t.seats
  }
  return {
    seated,
    attending: GUESTS.filter((g) => g.rsvp === "yes").length,
    unseated: GUESTS.filter((g) => g.rsvp === "yes" && !p[g.id]),
    unconfirmed: GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !p[g.id]),
    declined: GUESTS.filter((g) => g.rsvp === "no").length,
    capacity,
    free: capacity - seated,
    perTable,
  }
}

/* ---------- display helpers ---------- */

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : ""
  return (first + last).toUpperCase()
}

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "No reply",
  no: "Declined",
}

const PARTY_HUE: Record<string, number> = {
  Couple: 25,
  "Bride's family": 345,
  "Groom's family": 255,
  "University friends": 150,
  "Work friends": 85,
  "Groom's football club": 200,
  "Plus-ones": 305,
}

export const PARTIES = Array.from(new Set(GUESTS.map((g) => g.party)))

export function partyHue(party: string): number {
  return PARTY_HUE[party] ?? 0
}

export function partyStyle(party: string): CSSProperties {
  const h = partyHue(party)
  return {
    backgroundColor: `oklch(0.93 0.055 ${h})`,
    borderColor: `oklch(0.58 0.12 ${h})`,
    color: `oklch(0.3 0.08 ${h})`,
  }
}

export function partyDotStyle(party: string): CSSProperties {
  return { backgroundColor: `oklch(0.62 0.14 ${partyHue(party)})` }
}

export const DIETS = Array.from(
  new Set(GUESTS.flatMap((g) => (g.diet ? [g.diet] : [])))
).sort((a, b) => a.localeCompare(b))

export function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`)
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d)
}
