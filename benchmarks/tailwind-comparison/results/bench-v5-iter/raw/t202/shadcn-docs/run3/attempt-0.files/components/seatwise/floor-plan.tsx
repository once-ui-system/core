"use client"

import * as React from "react"
import { TriangleAlert, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EVENT, FIXTURES, TABLES, type Fixture, type TableDef } from "@/lib/data"
import {
  GUEST_BY_ID,
  LONG_H,
  LONG_W,
  PARTIES,
  ROUND_D,
  SEAT_D,
  SEAT_RING,
  initials,
  partyDotStyle,
  partyStyle,
} from "@/lib/seating"
import { cn } from "@/lib/utils"
import { usePlan } from "./plan-provider"

const m = (n: number) => `calc(var(--m) * ${n})`

function onActivate(fn: () => void) {
  return (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      fn()
    }
  }
}

function FixtureShape({ f }: { f: Fixture }) {
  const base: React.CSSProperties = {
    left: m(f.x),
    top: m(f.y),
    width: m(f.w),
    height: m(f.h),
    fontSize: f.kind === "door" ? "max(8px, calc(var(--m) * 0.26))" : "max(9px, calc(var(--m) * 0.32))",
  }
  if (f.kind === "door") {
    return (
      <div
        style={{ ...base, writingMode: "vertical-rl" }}
        className="absolute grid place-items-center rounded-r-sm bg-primary font-semibold tracking-wider whitespace-nowrap text-primary-foreground uppercase"
        title={f.label}
      >
        {f.label}
      </div>
    )
  }
  const look: Record<Exclude<Fixture["kind"], "door">, string> = {
    stage: "rounded-md bg-foreground/85 text-background",
    dancefloor:
      "rounded-md border border-dashed border-primary/40 bg-accent text-accent-foreground [background-image:repeating-linear-gradient(45deg,transparent_0,transparent_9px,oklch(0.36_0.07_165/0.06)_9px,oklch(0.36_0.07_165/0.06)_18px)]",
    bar: "rounded-md bg-[oklch(0.42_0.06_55)] text-white",
  }
  return (
    <div
      style={base}
      className={cn("absolute grid place-items-center text-center font-semibold tracking-wider uppercase", look[f.kind])}
    >
      {f.label}
    </div>
  )
}

interface SeatProps {
  table: TableDef
  index: number
  cx: number
  cy: number
}

function Seat({ table, index, cx, cy }: SeatProps) {
  const { seats, armed, setArmed, dragging, setDragging, place, selectTable } = usePlan()
  const [over, setOver] = React.useState(false)
  const gid = seats[table.id][index]
  const guest = gid ? GUEST_BY_ID[gid] : null
  const isArmed = guest && armed === guest.id
  const targeting = Boolean(armed || dragging)

  function activate() {
    if (armed) {
      if (place(armed, table.id, index)) setArmed(null)
      return
    }
    selectTable(table.id)
  }

  const label = guest
    ? `${table.name}, seat ${index + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}`
    : `${table.name}, seat ${index + 1}: empty`

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label}
      data-initials={guest ? initials(guest.name) : undefined}
      title={guest ? `${guest.name}${guest.diet ? ` (${guest.diet})` : ""}` : "Empty seat"}
      draggable={Boolean(guest)}
      onDragStart={(e) => {
        if (!guest) return
        e.dataTransfer.setData("text/plain", guest.id)
        e.dataTransfer.effectAllowed = "move"
        setDragging(guest.id)
      }}
      onDragEnd={() => setDragging(null)}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        if (!over) setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setOver(false)
        const id = e.dataTransfer.getData("text/plain") || dragging
        setDragging(null)
        if (id) place(id, table.id, index)
      }}
      onClick={(e) => {
        e.stopPropagation()
        activate()
      }}
      onKeyDown={onActivate(activate)}
      style={{
        left: m(cx - SEAT_D / 2),
        top: m(cy - SEAT_D / 2),
        width: m(SEAT_D),
        height: m(SEAT_D),
        fontSize: "max(9px, calc(var(--m) * 0.34))",
        ...(guest ? partyStyle(guest.party) : undefined),
      }}
      className={cn(
        "absolute grid place-items-center rounded-full border-[1.5px] leading-none after:content-[attr(data-initials)] font-semibold outline-none transition-[transform,box-shadow] select-none focus-visible:ring-[3px] focus-visible:ring-ring",
        guest
          ? "cursor-grab shadow-xs hover:scale-110 active:cursor-grabbing"
          : "border-dashed border-muted-foreground/50 bg-background/70 hover:bg-accent",
        !guest && targeting && "border-solid border-primary bg-accent",
        over && "scale-125 ring-2 ring-primary",
        isArmed && "ring-2 ring-primary ring-offset-2 ring-offset-floor"
      )}
    >
      {guest?.diet ? (
        <span
          aria-hidden
          className="absolute -top-[8%] -right-[8%] size-[34%] rounded-full border border-white bg-amber-500"
        />
      ) : null}
    </div>
  )
}

function TableShape({ table }: { table: TableDef }) {
  const { counts, brokenTables, selectedTable, selectTable, armed, setArmed, dragging, setDragging, place } = usePlan()
  const [over, setOver] = React.useState(false)
  const filled = counts.perTable[table.id].filled
  const full = filled >= table.seats
  const broken = brokenTables.has(table.id)
  const selected = selectedTable === table.id
  const targeting = Boolean(armed || dragging)
  const long = table.shape === "long"

  const W = long ? LONG_W + 0.8 : 4
  const H = long ? LONG_H + 1.2 : 4
  const left = long ? table.x - 0.4 : table.x - 2
  const top = long ? table.y - 1 : table.y - 2

  const seatCenters = Array.from({ length: table.seats }, (_, i) => {
    if (long) {
      const step = LONG_W / table.seats
      return { x: 0.4 + step * (i + 0.5), y: 0.45 }
    }
    const a = (-90 + (360 * i) / table.seats) * (Math.PI / 180)
    return { x: W / 2 + SEAT_RING * Math.cos(a), y: H / 2 + SEAT_RING * Math.sin(a) }
  })

  function activate() {
    if (armed) {
      if (place(armed, table.id)) setArmed(null)
      return
    }
    selectTable(table.id)
  }

  const bodyStyle: React.CSSProperties = long
    ? { left: m(0.4), top: m(1), width: m(LONG_W), height: m(LONG_H) }
    : { left: m(W / 2 - ROUND_D / 2), top: m(H / 2 - ROUND_D / 2), width: m(ROUND_D), height: m(ROUND_D) }

  return (
    <div
      role="group"
      aria-label={`${table.name}, ${filled} of ${table.seats} seats taken${broken ? ", a rule is broken here" : ""}`}
      style={{
        left: m(left),
        top: m(top),
        width: m(W),
        height: m(H),
        transform: table.rotation ? `rotate(${table.rotation}deg)` : undefined,
      }}
      className="absolute"
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        if (!over) setOver(true)
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        const id = e.dataTransfer.getData("text/plain") || dragging
        setDragging(null)
        if (id) place(id, table.id)
      }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        onClick={activate}
        onKeyDown={onActivate(activate)}
        style={{ ...bodyStyle, fontSize: "max(10px, calc(var(--m) * 0.36))" }}
        className={cn(
          "absolute flex flex-col items-center justify-center border bg-card text-center leading-tight shadow-sm outline-none transition-shadow focus-visible:ring-[3px] focus-visible:ring-ring",
          long ? "rounded-md" : "rounded-full",
          selected && "ring-[3px] ring-primary",
          broken && "border-destructive bg-destructive/5 ring-2 ring-destructive/60",
          selected && broken && "ring-primary",
          targeting && !full && "border-primary border-dashed bg-accent",
          targeting && full && "opacity-60",
          over && !full && "ring-[3px] ring-primary",
          over && full && "ring-[3px] ring-destructive"
        )}
      >
        <span className="font-semibold">{table.name}</span>
        <span className={cn("tabular-nums", full ? "text-ok font-medium" : "text-muted-foreground")}>
          {filled}/{table.seats}
          <span className="sr-only"> seats taken</span>
        </span>
        {broken ? (
          <TriangleAlert
            aria-hidden
            className="absolute -top-[6%] -right-[4%] size-[22%] rounded-full bg-background p-[3%] text-destructive"
          />
        ) : null}
      </div>
      {seatCenters.map((c, i) => (
        <Seat key={i} table={table} index={i} cx={c.x} cy={c.y} />
      ))}
    </div>
  )
}

export function FloorPlan() {
  const { armed, setArmed } = usePlan()
  const armedGuest = armed ? GUEST_BY_ID[armed] : null
  const { width, depth } = EVENT.room_m

  return (
    <section aria-labelledby="plan-title" className="rounded-xl border bg-card shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 pt-3.5 pb-2 sm:px-5">
        <div>
          <h2 id="plan-title" className="text-base font-semibold tracking-tight">
            Room plan
          </h2>
          <p className="text-xs text-muted-foreground">
            {EVENT.venue} · {width} × {depth} m, drawn to scale
          </p>
        </div>
        <p className="text-xs text-muted-foreground">Drag a guest onto a seat, or tap a guest, then a seat or table.</p>
      </div>

      <div aria-live="polite" className="px-4 sm:px-5">
        {armedGuest ? (
          <div className="mb-2 flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-accent px-3 py-2 text-sm text-accent-foreground">
            <span>
              Placing <strong>{armedGuest.name}</strong>: tap an empty seat or a table.
            </span>
            <Button size="xs" variant="outline" onClick={() => setArmed(null)}>
              <X /> Cancel
            </Button>
          </div>
        ) : null}
      </div>

      <div className="overflow-x-auto px-2 pb-2 sm:px-3">
        <div className="min-w-[660px] [container-type:inline-size]">
          <div
            className="relative aspect-[24/14] overflow-hidden rounded-lg border-2 border-wall/60 bg-floor"
            style={{
              backgroundImage:
                "linear-gradient(to right, oklch(0.5 0.02 80 / 0.09) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.5 0.02 80 / 0.09) 1px, transparent 1px)",
              backgroundSize: `calc(100% / ${width}) calc(100% / ${depth})`,
            }}
          >
            <div className="absolute inset-0" style={{ ["--m" as string]: "calc(100cqw / 24)" }}>
              {FIXTURES.map((f) => (
                <FixtureShape key={f.id} f={f} />
              ))}
              {TABLES.map((t) => (
                <TableShape key={t.id} table={t} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t px-4 py-2.5 text-xs text-muted-foreground sm:px-5">
        {PARTIES.map((p) => (
          <span key={p} className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={partyDotStyle(p)} aria-hidden />
            {p}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-amber-500" aria-hidden />
          Dietary need
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full border border-dashed border-muted-foreground" aria-hidden />
          Empty seat
        </span>
      </div>
    </section>
  )
}
