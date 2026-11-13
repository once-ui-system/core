"use client"

import * as React from "react"
import { GUEST_BY_ID, GUESTS, TABLE_BY_ID, TABLES } from "@/lib/data"
import {
  type Assignment,
  type RuleResult,
  brokenGuestIds,
  brokenTablesFor,
  evaluateRules,
  initialAssignment,
  seatMap,
} from "@/lib/plan"

export interface Notice {
  text: string
  tone: "info" | "success" | "warn"
}

export type PanelId = "seat" | "table" | "rules"

export interface PlanCounts {
  seated: number
  toSeat: number
  unconfirmedUnseated: number
  freeSeats: number
  totalSeats: number
  attending: number
  perTable: Record<string, number>
}

interface PlanContextValue {
  assign: Assignment
  seats: Record<string, (string | null)[]>
  rules: RuleResult[]
  brokenByTable: Record<string, RuleResult[]>
  brokenGuests: Set<string>
  brokenCount: number
  counts: PlanCounts
  selectedTable: string | null
  heldGuest: string | null
  draggingGuest: string | null
  notice: Notice | null
  panel: PanelId
  setPanel: (p: PanelId) => void
  selectTable: (id: string | null) => void
  hold: (id: string | null) => void
  setDragging: (id: string | null) => void
  place: (guestId: string, tableId: string, seat?: number) => void
  unseat: (guestId: string) => void
  clearNotice: () => void
}

const PlanContext = React.createContext<PlanContextValue | null>(null)

export function usePlan(): PlanContextValue {
  const ctx = React.useContext(PlanContext)
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider")
  return ctx
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [assign, setAssign] = React.useState<Assignment>(initialAssignment)
  const [selectedTable, setSelectedTable] = React.useState<string | null>(null)
  const [heldGuest, setHeldGuest] = React.useState<string | null>(null)
  const [draggingGuest, setDraggingGuest] = React.useState<string | null>(null)
  const [notice, setNotice] = React.useState<Notice | null>(null)
  const [panel, setPanel] = React.useState<PanelId>("seat")

  const seats = React.useMemo(() => seatMap(assign), [assign])
  const rules = React.useMemo(() => evaluateRules(assign), [assign])
  const brokenByTable = React.useMemo(() => brokenTablesFor(rules), [rules])
  const brokenGuests = React.useMemo(() => brokenGuestIds(rules), [rules])
  const brokenCount = React.useMemo(() => rules.filter((r) => r.status === "broken").length, [rules])

  const counts = React.useMemo<PlanCounts>(() => {
    const perTable: Record<string, number> = {}
    for (const t of TABLES) perTable[t.id] = 0
    let seated = 0
    let toSeat = 0
    let unconfirmedUnseated = 0
    for (const g of GUESTS) {
      const ref = assign[g.id]
      if (ref) {
        seated += 1
        perTable[ref.table] = (perTable[ref.table] ?? 0) + 1
      } else if (g.rsvp === "yes") toSeat += 1
      else if (g.rsvp === "maybe" || g.rsvp === "pending") unconfirmedUnseated += 1
    }
    const totalSeats = TABLES.reduce((n, t) => n + t.seats, 0)
    return {
      seated,
      toSeat,
      unconfirmedUnseated,
      freeSeats: totalSeats - seated,
      totalSeats,
      attending: GUESTS.filter((g) => g.rsvp === "yes").length,
      perTable,
    }
  }, [assign])

  const selectTable = React.useCallback((id: string | null) => setSelectedTable(id), [])
  const hold = React.useCallback((id: string | null) => {
    setHeldGuest(id)
    setNotice(null)
  }, [])
  const clearNotice = React.useCallback(() => setNotice(null), [])

  const commit = React.useCallback(
    (next: Assignment, message: string) => {
      const before = evaluateRules(assign)
      const after = evaluateRules(next)
      const newlyBroken = after.filter((r, i) => r.status === "broken" && before[i]?.status !== "broken")
      const fixed = after.filter((r, i) => r.status !== "broken" && before[i]?.status === "broken")
      let text = message
      let tone: Notice["tone"] = "success"
      if (newlyBroken.length) {
        text += `. Breaks a rule: ${newlyBroken.map((r) => r.title).join("; ")}`
        tone = "warn"
      } else if (fixed.length) {
        text += `. Rule resolved: ${fixed.map((r) => r.title).join("; ")}`
      }
      setAssign(next)
      setNotice({ text, tone })
    },
    [assign],
  )

  const place = React.useCallback(
    (guestId: string, tableId: string, seat?: number) => {
      const guest = GUEST_BY_ID[guestId]
      const table = TABLE_BY_ID[tableId]
      const row = seats[tableId]
      if (!guest || !table || !row) return
      let idx = seat
      if (idx === undefined) {
        const existing = assign[guestId]
        if (existing && existing.table === tableId) {
          setHeldGuest(null)
          return
        }
        idx = row.findIndex((x) => x === null)
        if (idx < 0) {
          setNotice({ text: `${table.name} is full. Pick another table or free a seat`, tone: "warn" })
          return
        }
      }
      const occupant = row[idx] ?? null
      if (occupant === guestId) {
        setHeldGuest(null)
        return
      }
      const prev = assign[guestId] ?? null
      const next: Assignment = { ...assign, [guestId]: { table: tableId, seat: idx } }
      let message: string
      if (occupant) {
        const other = GUEST_BY_ID[occupant]?.name ?? occupant
        next[occupant] = prev ? { ...prev } : null
        message = prev
          ? `${guest.name} and ${other} swapped seats`
          : `${guest.name} took seat ${idx + 1} at ${table.name}; ${other} is unseated`
      } else if (prev) {
        message = `${guest.name} moved from ${TABLE_BY_ID[prev.table]?.name} to ${table.name}, seat ${idx + 1}`
      } else {
        message = `${guest.name} seated at ${table.name}, seat ${idx + 1}`
      }
      commit(next, message)
      setHeldGuest(null)
      setSelectedTable(tableId)
    },
    [assign, seats, commit],
  )

  const unseat = React.useCallback(
    (guestId: string) => {
      const guest = GUEST_BY_ID[guestId]
      const prev = assign[guestId]
      if (!guest || !prev) return
      commit({ ...assign, [guestId]: null }, `${guest.name} unseated from ${TABLE_BY_ID[prev.table]?.name}`)
      setHeldGuest(null)
    },
    [assign, commit],
  )

  const value = React.useMemo<PlanContextValue>(
    () => ({
      assign,
      seats,
      rules,
      brokenByTable,
      brokenGuests,
      brokenCount,
      counts,
      selectedTable,
      heldGuest,
      draggingGuest,
      notice,
      panel,
      setPanel,
      selectTable,
      hold,
      setDragging: setDraggingGuest,
      place,
      unseat,
      clearNotice,
    }),
    [
      assign,
      seats,
      rules,
      brokenByTable,
      brokenGuests,
      brokenCount,
      counts,
      selectedTable,
      heldGuest,
      draggingGuest,
      notice,
      panel,
      selectTable,
      hold,
      place,
      unseat,
      clearNotice,
    ],
  )

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>
}
