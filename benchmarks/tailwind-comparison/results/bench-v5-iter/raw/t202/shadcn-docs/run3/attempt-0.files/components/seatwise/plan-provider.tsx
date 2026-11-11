"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  GUEST_BY_ID,
  TABLE_BY_ID,
  computeCounts,
  evaluateRules,
  initialPlacement,
  seatsByTable,
  type Counts,
  type Placement,
  type RuleResult,
} from "@/lib/seating"

interface PlanApi {
  placement: Placement
  seats: Record<string, (string | null)[]>
  counts: Counts
  rules: RuleResult[]
  brokenTables: Set<string>
  selectedTable: string | null
  selectTable: (id: string | null) => void
  armed: string | null
  setArmed: (id: string | null) => void
  dragging: string | null
  setDragging: (id: string | null) => void
  place: (guestId: string, tableId: string, seat?: number) => boolean
  unseat: (guestId: string) => void
}

const PlanContext = React.createContext<PlanApi | null>(null)

export function usePlan(): PlanApi {
  const ctx = React.useContext(PlanContext)
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider")
  return ctx
}

function firstName(name: string) {
  return name.split(" ")[0]
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [placement, setPlacement] = React.useState<Placement>(initialPlacement)
  const [selectedTable, setSelectedTable] = React.useState<string | null>(null)
  const [armed, setArmed] = React.useState<string | null>(null)
  const [dragging, setDragging] = React.useState<string | null>(null)

  const seats = React.useMemo(() => seatsByTable(placement), [placement])
  const counts = React.useMemo(() => computeCounts(placement), [placement])
  const rules = React.useMemo(() => evaluateRules(placement), [placement])
  const brokenTables = React.useMemo(() => {
    const s = new Set<string>()
    for (const r of rules) if (r.status === "broken") r.tableIds.forEach((t) => s.add(t))
    return s
  }, [rules])

  const commit = React.useCallback(
    (next: Placement, message: string) => {
      const before = new Set(rules.filter((r) => r.status === "broken").map((r) => r.id))
      setPlacement(next)
      toast.success(message)
      const newlyBroken = evaluateRules(next).filter((r) => r.status === "broken" && !before.has(r.id))
      for (const r of newlyBroken) toast.warning(`Rule broken: ${r.title}`, { description: r.detail })
    },
    [rules]
  )

  const place = React.useCallback(
    (guestId: string, tableId: string, seat?: number): boolean => {
      const guest = GUEST_BY_ID[guestId]
      const table = TABLE_BY_ID[tableId]
      if (!guest || !table) return false
      if (guest.rsvp === "no") {
        toast.error(`${guest.name} has declined and cannot be seated.`)
        return false
      }
      const row = seats[tableId]
      const current = placement[guestId]
      let target = seat
      if (target === undefined) {
        if (current?.table === tableId) {
          toast.message(`${firstName(guest.name)} is already at ${table.name}.`)
          return false
        }
        target = row.indexOf(null)
        if (target < 0) {
          toast.error(`${table.name} is full.`, { description: "Drop on a taken seat to swap, or pick another table." })
          return false
        }
      }
      const occupant = row[target]
      if (occupant === guestId) return false
      if (occupant) {
        if (!current) {
          toast.error(`That seat is taken by ${GUEST_BY_ID[occupant].name}.`, {
            description: "Pick an empty seat, or unseat them first.",
          })
          return false
        }
        const next: Placement = {
          ...placement,
          [guestId]: { table: tableId, seat: target },
          [occupant]: current,
        }
        commit(next, `Swapped ${firstName(guest.name)} and ${firstName(GUEST_BY_ID[occupant].name)}.`)
        return true
      }
      const next: Placement = { ...placement, [guestId]: { table: tableId, seat: target } }
      commit(
        next,
        current
          ? `Moved ${firstName(guest.name)} to ${table.name}.`
          : `Seated ${firstName(guest.name)} at ${table.name}.`
      )
      return true
    },
    [placement, seats, commit]
  )

  const unseat = React.useCallback(
    (guestId: string) => {
      const guest = GUEST_BY_ID[guestId]
      if (!guest || !placement[guestId]) return
      commit({ ...placement, [guestId]: null }, `${guest.name} is unseated.`)
    },
    [placement, commit]
  )

  const value = React.useMemo<PlanApi>(
    () => ({
      placement,
      seats,
      counts,
      rules,
      brokenTables,
      selectedTable,
      selectTable: setSelectedTable,
      armed,
      setArmed,
      dragging,
      setDragging,
      place,
      unseat,
    }),
    [placement, seats, counts, rules, brokenTables, selectedTable, armed, dragging, place, unseat]
  )

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>
}
