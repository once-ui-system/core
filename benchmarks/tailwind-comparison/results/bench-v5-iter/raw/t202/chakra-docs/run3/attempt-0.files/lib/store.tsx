"use client"

import * as React from "react"
import { toaster } from "@/components/ui/toaster"
import {
  evaluateRules,
  initialSeats,
  locateAll,
  planCounts,
  placeGuest,
  unseatGuest,
  type PlanCounts,
  type Position,
  type RuleResult,
  type Seats,
} from "./plan"

export type PanelTab = "unseated" | "table" | "rules"

interface PlanContextValue {
  seats: Seats
  positions: Record<string, Position>
  counts: PlanCounts
  ruleResults: RuleResult[]
  brokenRules: RuleResult[]
  /** table ids -> number of broken rules that involve it */
  flaggedTables: Record<string, number>
  /** guest ids that are part of a broken rule */
  flaggedGuests: Set<string>
  selectedTableId: string | null
  armedGuestId: string | null
  focusGuestId: string | null
  dragGuestId: string | null
  tab: PanelTab
  setTab: (tab: PanelTab) => void
  selectTable: (id: string | null, guestId?: string | null) => void
  armGuest: (id: string | null) => void
  setDragGuest: (id: string | null) => void
  place: (guestId: string, tableId: string, seat?: number) => boolean
  unseat: (guestId: string) => void
}

const PlanContext = React.createContext<PlanContextValue | null>(null)

export function usePlan(): PlanContextValue {
  const ctx = React.useContext(PlanContext)
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider")
  return ctx
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [seats, setSeats] = React.useState<Seats>(() => initialSeats())
  const [selectedTableId, setSelectedTableId] = React.useState<string | null>(null)
  const [armedGuestId, setArmedGuestId] = React.useState<string | null>(null)
  const [focusGuestId, setFocusGuestId] = React.useState<string | null>(null)
  const [dragGuestId, setDragGuestId] = React.useState<string | null>(null)
  const [tab, setTab] = React.useState<PanelTab>("unseated")

  const positions = React.useMemo(() => locateAll(seats), [seats])
  const counts = React.useMemo(() => planCounts(seats), [seats])
  const ruleResults = React.useMemo(() => evaluateRules(seats), [seats])
  const brokenRules = React.useMemo(
    () => ruleResults.filter((r) => r.status === "broken"),
    [ruleResults],
  )
  const flaggedTables = React.useMemo(() => {
    const out: Record<string, number> = {}
    for (const r of brokenRules) {
      for (const t of new Set(r.flagTables)) out[t] = (out[t] ?? 0) + 1
    }
    return out
  }, [brokenRules])
  const flaggedGuests = React.useMemo(() => {
    const out = new Set<string>()
    for (const r of brokenRules) for (const g of r.flagGuests) out.add(g)
    return out
  }, [brokenRules])

  const commit = React.useCallback((next: Seats, message: string, previous: Seats) => {
    setSeats(next)
    toaster.create({
      description: message,
      type: "success",
      duration: 5000,
      closable: true,
      action: {
        label: "Undo",
        onClick: () => setSeats(previous),
      },
    })
  }, [])

  const place = React.useCallback(
    (guestId: string, tableId: string, seat?: number) => {
      const res = placeGuest(seats, guestId, tableId, seat)
      if (!res.ok) {
        toaster.create({
          title: "Cannot seat here",
          description: res.message,
          type: "error",
          duration: 5000,
          closable: true,
        })
        return false
      }
      if (res.changed) commit(res.seats, res.message, seats)
      setSelectedTableId(tableId)
      setFocusGuestId(guestId)
      setArmedGuestId(null)
      return true
    },
    [seats, commit],
  )

  const unseat = React.useCallback(
    (guestId: string) => {
      const res = unseatGuest(seats, guestId)
      if (res.changed) commit(res.seats, res.message, seats)
      setArmedGuestId(null)
    },
    [seats, commit],
  )

  const selectTable = React.useCallback((id: string | null, guestId?: string | null) => {
    setSelectedTableId(id)
    setFocusGuestId(guestId ?? null)
    if (id) setTab("table")
  }, [])

  const armGuest = React.useCallback((id: string | null) => {
    setArmedGuestId(id)
    setFocusGuestId(id)
  }, [])

  const value = React.useMemo<PlanContextValue>(
    () => ({
      seats,
      positions,
      counts,
      ruleResults,
      brokenRules,
      flaggedTables,
      flaggedGuests,
      selectedTableId,
      armedGuestId,
      focusGuestId,
      dragGuestId,
      tab,
      setTab,
      selectTable,
      armGuest,
      setDragGuest: setDragGuestId,
      place,
      unseat,
    }),
    [
      seats,
      positions,
      counts,
      ruleResults,
      brokenRules,
      flaggedTables,
      flaggedGuests,
      selectedTableId,
      armedGuestId,
      focusGuestId,
      dragGuestId,
      tab,
      selectTable,
      armGuest,
      place,
      unseat,
    ],
  )

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>
}
