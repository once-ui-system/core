"use client"

import { Box, Text } from "@chakra-ui/react"
import * as React from "react"
import { toaster } from "@/components/ui/toaster"
import {
  GUESTS,
  GUESTS_BY_ID,
  TABLES,
  TABLES_BY_ID,
  canSeat,
  partyColor,
} from "@/lib/data"
import { evaluateRules, type RuleResult } from "@/lib/rules"

export type Seats = Record<string, (string | null)[]>
export type PanelTab = "unseated" | "table" | "rules"

function initialSeats(): Seats {
  const seats: Seats = {}
  for (const t of TABLES) seats[t.id] = Array.from({ length: t.seats }, () => null)
  for (const g of GUESTS) {
    if (!g.table) continue
    const row = seats[g.table]
    const free = row.indexOf(null)
    if (free !== -1) row[free] = g.id
  }
  return seats
}

export interface PlanContextValue {
  seats: Seats
  tableOf: Record<string, string | null>
  seatedCount: number
  attendingCount: number
  seatedAttending: number
  unseatedAttending: string[]
  unseatedOther: string[]
  capacity: number
  rules: RuleResult[]
  brokenRules: RuleResult[]
  brokenTables: Set<string>
  selectedTable: string | null
  selectTable: (id: string | null) => void
  tab: PanelTab
  setTab: (t: PanelTab) => void
  picked: string | null
  pick: (id: string | null) => void
  place: (guestId: string, tableId: string, seat?: number) => void
  unseat: (guestId: string) => void
  dragGuest: string | null
  dropKey: string | null
  startDrag: (guestId: string, e: React.PointerEvent) => void
  wasDragged: () => boolean
}

const PlanContext = React.createContext<PlanContextValue | null>(null)

export function usePlan(): PlanContextValue {
  const ctx = React.useContext(PlanContext)
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider")
  return ctx
}

function dropTarget(x: number, y: number): { key: string; el: Element } | null {
  const el = document.elementFromPoint(x, y)
  const hit = el?.closest("[data-drop]")
  if (!hit) return null
  const kind = hit.getAttribute("data-drop")
  const table = hit.getAttribute("data-table") ?? ""
  const seat = hit.getAttribute("data-seat") ?? ""
  return { key: `${kind}|${table}|${seat}`, el: hit }
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [seats, setSeats] = React.useState<Seats>(initialSeats)
  const seatsRef = React.useRef(seats)
  seatsRef.current = seats

  const [selectedTable, setSelectedTable] = React.useState<string | null>(null)
  const [tab, setTab] = React.useState<PanelTab>("unseated")
  const [picked, setPicked] = React.useState<string | null>(null)
  const [announcement, setAnnouncement] = React.useState("")
  const [dragGuest, setDragGuest] = React.useState<string | null>(null)
  const [dropKey, setDropKey] = React.useState<string | null>(null)

  const ghostRef = React.useRef<HTMLDivElement | null>(null)
  const ghostPos = React.useRef({ x: 0, y: 0 })
  const draggedRecently = React.useRef(false)

  const tableOf = React.useMemo(() => {
    const m: Record<string, string | null> = {}
    for (const g of GUESTS) m[g.id] = null
    for (const [tid, row] of Object.entries(seats)) {
      for (const gid of row) if (gid) m[gid] = tid
    }
    return m
  }, [seats])

  const derived = React.useMemo(() => {
    let seatedCount = 0
    let attendingCount = 0
    let seatedAttending = 0
    const unseatedAttending: string[] = []
    const unseatedOther: string[] = []
    for (const g of GUESTS) {
      const seated = tableOf[g.id] !== null
      if (seated) seatedCount++
      if (g.rsvp === "yes") {
        attendingCount++
        if (seated) seatedAttending++
        else unseatedAttending.push(g.id)
      } else if (canSeat(g) && !seated) {
        unseatedOther.push(g.id)
      }
    }
    const capacity = TABLES.reduce((n, t) => n + t.seats, 0)
    return { seatedCount, attendingCount, seatedAttending, unseatedAttending, unseatedOther, capacity }
  }, [tableOf])

  const rules = React.useMemo(() => evaluateRules(tableOf), [tableOf])
  const brokenRules = React.useMemo(() => rules.filter((r) => r.status === "broken"), [rules])
  const brokenTables = React.useMemo(() => {
    const s = new Set<string>()
    for (const r of brokenRules) for (const t of r.tables) s.add(t)
    return s
  }, [brokenRules])

  const announce = React.useCallback((msg: string) => setAnnouncement(msg), [])

  const place = React.useCallback(
    (guestId: string, tableId: string, seatIdx?: number) => {
      const guest = GUESTS_BY_ID[guestId]
      const table = TABLES_BY_ID[tableId]
      if (!guest || !table) return
      if (!canSeat(guest)) {
        toaster.create({ title: `${guest.name} has declined`, description: "Declined guests are not seated.", type: "warning" })
        return
      }
      const cur = seatsRef.current
      const next: Seats = {}
      for (const k of Object.keys(cur)) next[k] = cur[k].slice()

      let srcTable: string | null = null
      let srcSeat = -1
      for (const k of Object.keys(next)) {
        const i = next[k].indexOf(guestId)
        if (i !== -1) {
          srcTable = k
          srcSeat = i
        }
      }

      const row = next[tableId]
      let target = seatIdx ?? row.indexOf(null)
      if (target === -1) {
        if (srcTable === tableId) return
        toaster.create({ title: `${table.name} is full`, description: `All ${table.seats} seats are taken. Move someone first.`, type: "warning" })
        announce(`${table.name} is full`)
        return
      }
      if (srcTable === tableId && srcSeat === target) return

      const occupant = row[target]
      let swappedWith: string | null = null
      if (occupant) {
        if (srcTable !== null) {
          next[srcTable][srcSeat] = occupant
          swappedWith = occupant
        } else {
          const free = row.indexOf(null)
          if (free === -1) {
            toaster.create({ title: `${table.name} is full`, description: `Drop on a seat you want to swap, or free one up first.`, type: "warning" })
            announce(`${table.name} is full`)
            return
          }
          target = free
        }
      } else if (srcTable !== null) {
        next[srcTable][srcSeat] = null
      }
      row[target] = guestId
      setSeats(next)
      setSelectedTable(tableId)
      setPicked(null)
      announce(
        swappedWith
          ? `${guest.name} seated at ${table.name}, seat ${target + 1}. ${GUESTS_BY_ID[swappedWith].name} moved to ${srcTable ? TABLES_BY_ID[srcTable].name : ""}.`
          : `${guest.name} seated at ${table.name}, seat ${target + 1}.`,
      )
    },
    [announce],
  )

  const unseat = React.useCallback(
    (guestId: string) => {
      const cur = seatsRef.current
      let found = false
      const next: Seats = {}
      for (const k of Object.keys(cur)) {
        next[k] = cur[k].map((x) => {
          if (x === guestId) {
            found = true
            return null
          }
          return x
        })
      }
      if (!found) return
      setSeats(next)
      setPicked(null)
      announce(`${GUESTS_BY_ID[guestId]?.name ?? "Guest"} unseated.`)
    },
    [announce],
  )

  const selectTable = React.useCallback((id: string | null) => {
    setSelectedTable(id)
    if (id) setTab("table")
  }, [])

  const pick = React.useCallback(
    (id: string | null) => {
      setPicked(id)
      if (id) announce(`${GUESTS_BY_ID[id]?.name ?? "Guest"} picked up. Choose a seat or a table.`)
    },
    [announce],
  )

  React.useEffect(() => {
    if (!picked) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPicked(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [picked])

  const startDrag = React.useCallback(
    (guestId: string, e: React.PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return
      const pid = e.pointerId
      const touch = e.pointerType === "touch"
      const sx = e.clientX
      const sy = e.clientY
      let lx = sx
      let ly = sy
      let active = false
      let timer: number | undefined

      const begin = () => {
        active = true
        ghostPos.current = { x: lx, y: ly }
        setDragGuest(guestId)
        document.body.style.userSelect = "none"
      }

      const moveGhost = () => {
        ghostPos.current = { x: lx, y: ly }
        if (ghostRef.current) {
          ghostRef.current.style.transform = `translate(${lx + 14}px, ${ly + 14}px)`
        }
      }

      const cleanup = () => {
        window.clearTimeout(timer)
        window.removeEventListener("pointermove", move)
        window.removeEventListener("pointerup", up)
        window.removeEventListener("pointercancel", cancel)
        window.removeEventListener("touchmove", block)
        document.body.style.userSelect = ""
        setDragGuest(null)
        setDropKey(null)
      }

      function move(ev: PointerEvent) {
        if (ev.pointerId !== pid) return
        lx = ev.clientX
        ly = ev.clientY
        if (!active) {
          if (Math.hypot(lx - sx, ly - sy) < 8) return
          if (touch) {
            // the finger is scrolling, not dragging
            cleanup()
            return
          }
          begin()
        }
        moveGhost()
        const t = dropTarget(lx, ly)
        setDropKey((prev) => (prev === (t?.key ?? null) ? prev : (t?.key ?? null)))
      }

      function up(ev: PointerEvent) {
        if (ev.pointerId !== pid) return
        const was = active
        const t = was ? dropTarget(ev.clientX, ev.clientY) : null
        cleanup()
        if (!was) return
        draggedRecently.current = true
        window.setTimeout(() => {
          draggedRecently.current = false
        }, 60)
        if (!t) return
        const [kind, table, seat] = t.key.split("|")
        if (kind === "seat") place(guestId, table, Number(seat))
        else if (kind === "table") place(guestId, table)
        else if (kind === "unseat") unseat(guestId)
      }

      function cancel(ev: PointerEvent) {
        if (ev.pointerId !== pid) return
        cleanup()
      }

      function block(ev: TouchEvent) {
        if (active && ev.cancelable) ev.preventDefault()
      }

      window.addEventListener("pointermove", move)
      window.addEventListener("pointerup", up)
      window.addEventListener("pointercancel", cancel)
      window.addEventListener("touchmove", block, { passive: false })
      if (touch) {
        timer = window.setTimeout(() => {
          begin()
          moveGhost()
        }, 320)
      }
    },
    [place, unseat],
  )

  const wasDragged = React.useCallback(() => draggedRecently.current, [])

  const value = React.useMemo<PlanContextValue>(
    () => ({
      seats,
      tableOf,
      ...derived,
      rules,
      brokenRules,
      brokenTables,
      selectedTable,
      selectTable,
      tab,
      setTab,
      picked,
      pick,
      place,
      unseat,
      dragGuest,
      dropKey,
      startDrag,
      wasDragged,
    }),
    [
      seats,
      tableOf,
      derived,
      rules,
      brokenRules,
      brokenTables,
      selectedTable,
      selectTable,
      tab,
      picked,
      pick,
      place,
      unseat,
      dragGuest,
      dropKey,
      startDrag,
      wasDragged,
    ],
  )

  const ghostGuest = dragGuest ? GUESTS_BY_ID[dragGuest] : null

  return (
    <PlanContext.Provider value={value}>
      {children}
      <Box
        position="absolute"
        w="1px"
        h="1px"
        overflow="hidden"
        style={{ clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}
        role="status"
        aria-live="polite"
      >
        {announcement}
      </Box>
      {ghostGuest && (
        <Box
          ref={ghostRef}
          position="fixed"
          top="0"
          left="0"
          zIndex="toast"
          pointerEvents="none"
          style={{
            transform: `translate(${ghostPos.current.x + 14}px, ${ghostPos.current.y + 14}px)`,
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            gap="2"
            px="3"
            py="1.5"
            rounded="full"
            bg={`${partyColor(ghostGuest.party)}.700`}
            color="white"
            shadow="lg"
            borderWidth="2px"
            borderColor="white"
          >
            <Text fontSize="sm" fontWeight="semibold" whiteSpace="nowrap">
              {ghostGuest.name}
            </Text>
          </Box>
        </Box>
      )}
    </PlanContext.Provider>
  )
}
