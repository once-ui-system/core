"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  buildSeatMap,
  evaluateRules,
  initialPlacements,
  placeGuest,
  totals as computeTotals,
  unseatGuest,
  type MoveResult,
  type Placements,
  type RuleResult,
  type Totals,
} from "@/lib/plan"
import type { Guest } from "@/lib/data"

interface State {
  placements: Placements
  history: Placements[]
}

interface PlanContextValue {
  placements: Placements
  seatMap: Record<string, (Guest | null)[]>
  results: RuleResult[]
  totals: Totals
  canUndo: boolean
  place: (guestId: string, tableId: string, seat?: number) => boolean
  unseat: (guestId: string) => void
  undo: () => void
  reset: () => void
}

const PlanContext = React.createContext<PlanContextValue | null>(null)

export function usePlan(): PlanContextValue {
  const ctx = React.useContext(PlanContext)
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider")
  return ctx
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<State>(() => ({ placements: initialPlacements(), history: [] }))

  const undo = React.useCallback(() => {
    setState((s) => {
      if (!s.history.length) return s
      return { placements: s.history[s.history.length - 1], history: s.history.slice(0, -1) }
    })
  }, [])

  const commit = React.useCallback(
    (res: MoveResult) => {
      if (!res.ok) {
        if (res.message) toast.error(res.message)
        return false
      }
      setState((s) => ({ placements: res.placements, history: [...s.history.slice(-29), s.placements] }))
      toast.success(res.message, { action: { label: "Undo", onClick: undo } })
      return true
    },
    [undo],
  )

  const place = React.useCallback(
    (guestId: string, tableId: string, seat?: number) => commit(placeGuest(state.placements, guestId, tableId, seat)),
    [commit, state.placements],
  )

  const unseat = React.useCallback(
    (guestId: string) => {
      commit(unseatGuest(state.placements, guestId))
    },
    [commit, state.placements],
  )

  const reset = React.useCallback(() => {
    setState((s) => ({ placements: initialPlacements(), history: [...s.history.slice(-29), s.placements] }))
    toast.success("Plan reset to the starting arrangement", { action: { label: "Undo", onClick: undo } })
  }, [undo])

  const value = React.useMemo<PlanContextValue>(
    () => ({
      placements: state.placements,
      seatMap: buildSeatMap(state.placements),
      results: evaluateRules(state.placements),
      totals: computeTotals(state.placements),
      canUndo: state.history.length > 0,
      place,
      unseat,
      undo,
      reset,
    }),
    [state, place, unseat, undo, reset],
  )

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>
}
