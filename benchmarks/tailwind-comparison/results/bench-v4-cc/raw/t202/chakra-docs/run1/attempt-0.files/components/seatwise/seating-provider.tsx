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
