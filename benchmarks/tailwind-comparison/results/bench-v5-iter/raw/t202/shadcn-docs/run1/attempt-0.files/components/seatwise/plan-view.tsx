"use client"

import * as React from "react"
import { HandIcon, RotateCcwIcon, Undo2Icon, XIcon } from "lucide-react"

import { FloorPlan } from "@/components/seatwise/floor-plan"
import { PlanSidebar, type SidebarTab } from "@/components/seatwise/plan-sidebar"
import { usePlan } from "@/components/seatwise/plan-provider"
import { RulesPanel } from "@/components/seatwise/rules-panel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { event } from "@/lib/data"
import { PARTIES, guestById, partyColor } from "@/lib/plan"
import { cn } from "@/lib/utils"

export function PlanView() {
  const { placements, seatMap, results, totals, place, canUndo, undo, reset } = usePlan()
  const [selected, setSelected] = React.useState<string | null>(null)
  const [held, setHeld] = React.useState<string | null>(null)
  const [dragging, setDragging] = React.useState<string | null>(null)
  const [tab, setTab] = React.useState<SidebarTab>("seat")

  React.useEffect(() => {
    const clear = () => setDragging(null)
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHeld(null)
    }
    window.addEventListener("dragend", clear)
    window.addEventListener("drop", clear)
    window.addEventListener("keydown", esc)
    return () => {
      window.removeEventListener("dragend", clear)
      window.removeEventListener("drop", clear)
      window.removeEventListener("keydown", esc)
    }
  }, [])

  const { brokenTables, brokenGuests } = React.useMemo(() => {
    const bt = new Set<string>()
    const bg = new Set<string>()
    for (const r of results) {
      if (r.status !== "broken") continue
      r.tables.forEach((t) => bt.add(t))
      r.guests.forEach((g) => bg.add(g))
    }
    return { brokenTables: bt, brokenGuests: bg }
  }, [results])

  const select = (id: string | null) => {
    setSelected(id)
    if (id) setTab("table")
  }

  const toggleHold = (id: string) => setHeld((h) => (h === id ? null : id))

  const handleTable = (tableId: string) => {
    if (held) {
      if (placements[held]?.table === tableId) {
        setHeld(null)
        select(tableId)
        return
      }
      if (place(held, tableId)) {
        setHeld(null)
        setSelected(tableId)
      }
      return
    }
    select(tableId)
  }

  const handleSeat = (tableId: string, seat: number) => {
    const occupant = seatMap[tableId][seat]
    if (held) {
      if (occupant?.id === held) {
        setHeld(null)
        return
      }
      if (place(held, tableId, seat)) {
        setHeld(null)
        setSelected(tableId)
      }
      return
    }
    if (occupant) setHeld(occupant.id)
    select(tableId)
  }

  const handleDrop = (guestId: string, tableId: string, seat?: number) => {
    setDragging(null)
    setHeld(null)
    if (place(guestId, tableId, seat)) setSelected(tableId)
  }

  const heldGuest = held ? guestById[held] : null
  const stats = [
    { label: "Seated", value: totals.seated, hint: `of ${totals.seats} seats` },
    { label: "Unseated", value: totals.unseated, hint: totals.awaiting ? `attending, +${totals.awaiting} unconfirmed` : "attending", warn: totals.unseated > 0 },
    { label: "Free seats", value: totals.freeSeats, hint: `${totals.attending} attending` },
    {
      label: "Rules broken",
      value: results.filter((r) => r.status === "broken").length,
      hint: `of ${results.length} rules`,
      alert: results.some((r) => r.status === "broken"),
    },
  ]

  return (
    <div className="mx-auto max-w-[1500px] space-y-4 px-3 py-4 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h1 className="font-serif text-2xl tracking-tight sm:text-3xl">Seating plan</h1>
          <p className="text-sm text-muted-foreground">
            {event.name} · {event.venue}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4" aria-label="Seating counts">
        {stats.map((s) => (
          <div
            key={s.label}
            className={cn(
              "rounded-xl border bg-card px-4 py-3",
              s.alert && "border-destructive/40 bg-destructive/5",
            )}
          >
            <dt className="text-xs font-medium text-muted-foreground">{s.label}</dt>
            <dd className="flex items-baseline gap-2">
              <span className={cn("font-serif text-3xl leading-none tabular-nums", s.alert && "text-destructive")}>{s.value}</span>
              <span className="truncate text-xs text-muted-foreground">{s.hint}</span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="gap-0 overflow-hidden py-0 lg:col-start-1">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
            <CardTitle className="text-sm font-semibold">
              Room plan <span className="font-normal text-muted-foreground">· {event.room_m.width} × {event.room_m.depth} m</span>
            </CardTitle>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" onClick={undo} disabled={!canUndo}>
                <Undo2Icon /> Undo
              </Button>
              <Button variant="ghost" size="sm" onClick={reset}>
                <RotateCcwIcon /> Reset
              </Button>
            </div>
          </CardHeader>

          <div
            role="status"
            className={cn(
              "flex min-h-11 items-center gap-2 border-b px-4 py-2 text-sm",
              heldGuest ? "bg-accent text-accent-foreground" : "text-muted-foreground",
            )}
          >
            {heldGuest ? (
              <>
                <HandIcon className="size-4 shrink-0" aria-hidden />
                <span className="min-w-0 flex-1">
                  Placing <strong className="font-semibold">{heldGuest.name}</strong>. Tap a table or an empty seat.
                </span>
                <Button size="xs" variant="outline" onClick={() => setHeld(null)}>
                  <XIcon /> Cancel
                </Button>
              </>
            ) : (
              <span>Drag a guest onto a table, or tap a guest and then a table. Tap a table to see who sits there.</span>
            )}
          </div>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[700px] p-3 sm:p-4">
                <FloorPlan
                  seatMap={seatMap}
                  selectedTable={selected}
                  heldGuest={held}
                  dragging={dragging}
                  brokenTables={brokenTables}
                  brokenGuests={brokenGuests}
                  onTableClick={handleTable}
                  onSeatClick={handleSeat}
                  onDropGuest={handleDrop}
                />
              </div>
            </div>
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5 border-t px-4 py-3 text-xs text-muted-foreground" aria-label="Guest groups">
              {PARTIES.map((p) => (
                <li key={p} className="flex items-center gap-1.5">
                  <span aria-hidden className="size-3 rounded-full border" style={{ background: partyColor(p), borderColor: partyColor(p, 0.6, 0.1) }} />
                  {p}
                </li>
              ))}
              <li className="flex items-center gap-1.5">
                <span aria-hidden className="size-3 rounded-full border border-dashed border-muted-foreground" />
                Empty seat
              </li>
              <li className="flex items-center gap-1.5">
                <span aria-hidden className="size-2 rounded-full bg-primary" />
                Dietary need
              </li>
            </ul>
          </CardContent>
        </Card>

        <aside aria-label="Guests and tables" className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <Card className="gap-0 py-0 lg:sticky lg:top-[4.5rem]">
            <CardContent className="p-3">
              <PlanSidebar
                tab={tab}
                onTabChange={setTab}
                selectedTable={selected}
                onSelectTable={select}
                heldGuest={held}
                onHold={toggleHold}
                dragging={dragging}
                onDragStart={setDragging}
                onDragEnd={() => setDragging(null)}
                brokenGuests={brokenGuests}
                brokenTables={brokenTables}
              />
            </CardContent>
          </Card>
        </aside>

        <div className="lg:col-start-1">
          <RulesPanel onFocusTable={select} />
        </div>
      </div>
    </div>
  )
}
