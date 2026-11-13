"use client"

import * as React from "react"

import { event, fixtures, tables, type Fixture, type Guest, type TableDef } from "@/lib/data"
import {
  LONG_H,
  LONG_W,
  SEAT_R,
  initials,
  partyColor,
  seatPositions,
  tableRadius,
} from "@/lib/plan"

export interface FloorPlanProps {
  seatMap: Record<string, (Guest | null)[]>
  selectedTable: string | null
  heldGuest: string | null
  dragging: string | null
  brokenTables: Set<string>
  brokenGuests: Set<string>
  onTableClick: (tableId: string) => void
  onSeatClick: (tableId: string, seat: number) => void
  onDropGuest: (guestId: string, tableId: string, seat?: number) => void
}

interface Over {
  table: string
  seat?: number
}

const TEXT = "var(--foreground)"
const MUTED = "var(--muted-foreground)"

export function FloorPlan(props: FloorPlanProps) {
  const { seatMap, selectedTable, heldGuest, dragging, brokenTables, brokenGuests } = props
  const [over, setOver] = React.useState<Over | null>(null)
  const activeOver = dragging ? over : null
  const placing = heldGuest !== null || dragging !== null
  const { width, depth } = event.room_m

  return (
    <svg
      viewBox={`-0.5 -0.5 ${width + 1} ${depth + 1}`}
      className="block h-auto w-full select-none"
      role="group"
      aria-label={`Floor plan of ${event.venue}, ${width} by ${depth} metres, drawn to scale`}
    >
      <defs>
        <pattern id="dance-checker" width="1" height="1" patternUnits="userSpaceOnUse">
          <rect width="1" height="1" fill="oklch(0.93 0.05 88)" />
          <rect width="0.5" height="0.5" fill="oklch(0.89 0.07 85)" />
          <rect x="0.5" y="0.5" width="0.5" height="0.5" fill="oklch(0.89 0.07 85)" />
        </pattern>
        <pattern id="floor-boards" width="1" height="1" patternUnits="userSpaceOnUse">
          <path d="M0 0.5H1" stroke="var(--room-line)" strokeOpacity="0.12" strokeWidth="0.02" />
        </pattern>
      </defs>

      {/* room */}
      <rect x={0} y={0} width={width} height={depth} rx={0.2} fill="var(--room)" />
      <rect x={0} y={0} width={width} height={depth} rx={0.2} fill="url(#floor-boards)" />
      <rect x={0} y={0} width={width} height={depth} rx={0.2} fill="none" stroke="var(--room-line)" strokeWidth={0.12} />

      {/* scale */}
      <g aria-hidden transform={`translate(${width - 5.2} ${depth + 0.2})`}>
        <path d="M0 0H2M0 -0.12V0.12M2 -0.12V0.12" stroke={MUTED} strokeWidth={0.04} fill="none" />
        <text x={2.2} y={0.12} fontSize={0.3} fill={MUTED}>
          2 m
        </text>
      </g>

      {fixtures.map((f) => (
        <FixtureShape key={f.id} f={f} />
      ))}

      {tables.map((t) => (
        <TableShape
          key={t.id}
          t={t}
          seats={seatMap[t.id]}
          selected={selectedTable === t.id}
          broken={brokenTables.has(t.id)}
          heldGuest={heldGuest}
          placing={placing}
          brokenGuests={brokenGuests}
          over={activeOver?.table === t.id ? activeOver : null}
          setOver={setOver}
          onTableClick={props.onTableClick}
          onSeatClick={props.onSeatClick}
          onDropGuest={props.onDropGuest}
        />
      ))}
    </svg>
  )
}

function FixtureShape({ f }: { f: Fixture }) {
  const cx = f.x + f.w / 2
  const cy = f.y + f.h / 2
  if (f.kind === "door") {
    return (
      <g aria-label={f.label} role="img">
        <rect x={f.x - 0.02} y={f.y} width={f.w + 0.04} height={f.h} fill="var(--card)" stroke="var(--room-line)" strokeWidth={0.05} />
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            d={`M${f.x - 0.02} ${f.y + (i + 0.5) * (f.h / 5)}H${f.x + f.w + 0.02}`}
            stroke="var(--ok)"
            strokeWidth={0.06}
          />
        ))}
        <text
          x={f.x + f.w + 0.42}
          y={cy}
          fontSize={0.34}
          fill={MUTED}
          textAnchor="middle"
          transform={`rotate(-90 ${f.x + f.w + 0.42} ${cy})`}
        >
          {f.label}
        </text>
      </g>
    )
  }
  if (f.kind === "stage") {
    return (
      <g role="img" aria-label={f.label}>
        <rect x={f.x} y={f.y} width={f.w} height={f.h} rx={0.15} fill="var(--primary)" />
        <rect x={f.x + 0.15} y={f.y + 0.15} width={f.w - 0.3} height={f.h - 0.3} rx={0.1} fill="none" stroke="var(--primary-foreground)" strokeOpacity={0.35} strokeWidth={0.04} />
        <text x={cx} y={cy + 0.17} fontSize={0.5} textAnchor="middle" fill="var(--primary-foreground)" fontFamily="var(--font-serif)">
          {f.label}
        </text>
      </g>
    )
  }
  if (f.kind === "dancefloor") {
    return (
      <g role="img" aria-label={f.label}>
        <rect x={f.x} y={f.y} width={f.w} height={f.h} rx={0.1} fill="url(#dance-checker)" stroke="var(--gold)" strokeWidth={0.06} />
        <text x={cx} y={cy + 0.17} fontSize={0.5} textAnchor="middle" fill="oklch(0.4 0.06 80)" fontFamily="var(--font-serif)" fontStyle="italic">
          {f.label}
        </text>
      </g>
    )
  }
  return (
    <g role="img" aria-label={f.label}>
      <rect x={f.x} y={f.y} width={f.w} height={f.h} rx={0.2} fill="var(--accent)" stroke="var(--gold)" strokeWidth={0.06} />
      <text x={cx} y={cy + 0.17} fontSize={0.5} textAnchor="middle" fill="var(--accent-foreground)" fontFamily="var(--font-serif)">
        {f.label}
      </text>
    </g>
  )
}

interface TableShapeProps {
  t: TableDef
  seats: (Guest | null)[]
  selected: boolean
  broken: boolean
  heldGuest: string | null
  placing: boolean
  brokenGuests: Set<string>
  over: Over | null
  setOver: (o: Over | null) => void
  onTableClick: (tableId: string) => void
  onSeatClick: (tableId: string, seat: number) => void
  onDropGuest: (guestId: string, tableId: string, seat?: number) => void
}

function TableShape(p: TableShapeProps) {
  const { t, seats, selected, broken, heldGuest, placing, brokenGuests, over } = p
  const filled = seats.filter(Boolean).length
  const full = filled === t.seats
  const positions = seatPositions(t)
  const r = tableRadius(t)
  const status = [
    `${filled} of ${t.seats} seats filled`,
    broken ? "breaks a rule" : null,
    selected ? "selected" : null,
  ]
    .filter(Boolean)
    .join(", ")

  const dropHandlers = (seat?: number) => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      e.dataTransfer.dropEffect = "move"
      if (over?.table !== t.id || over.seat !== seat) p.setOver({ table: t.id, seat })
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      p.setOver(null)
      const id = e.dataTransfer.getData("text/plain")
      if (id) p.onDropGuest(id, t.id, seat)
    },
  })

  const bodyOver = over !== null && over.seat === undefined
  const outline = broken ? "var(--warn)" : selected ? "var(--primary)" : "var(--room-line)"
  const cx = t.x
  const cy = t.y

  return (
    <g
      onDragOver={dropHandlers().onDragOver}
      onDrop={dropHandlers().onDrop}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) p.setOver(null)
      }}
    >
      {/* halo for selection and drop target */}
      {(selected || bodyOver) &&
        (t.shape === "round" ? (
          <circle cx={cx} cy={cy} r={r + SEAT_R * 2 + 0.55} fill={bodyOver ? "var(--primary)" : "var(--gold)"} fillOpacity={bodyOver ? 0.16 : 0.18} />
        ) : (
          <rect
            x={cx - LONG_W / 2 - 0.4}
            y={cy - LONG_H / 2 - 0.4}
            width={LONG_W + 0.8}
            height={LONG_H + SEAT_R * 2 + 1}
            rx={0.5}
            fill={bodyOver ? "var(--primary)" : "var(--gold)"}
            fillOpacity={bodyOver ? 0.16 : 0.18}
          />
        ))}

      {/* table body */}
      <g
        role="button"
        tabIndex={0}
        aria-label={`${t.name}, ${status}`}
        aria-pressed={selected}
        onClick={() => p.onTableClick(t.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            p.onTableClick(t.id)
          }
        }}
        className="outline-none [&:focus-visible_.table-body]:stroke-[var(--ring)] [&:focus-visible_.table-body]:[stroke-width:0.18px]"
      >
        {t.shape === "round" ? (
          <circle
            className="table-body"
            cx={cx}
            cy={cy}
            r={r}
            fill="var(--card)"
            stroke={outline}
            strokeWidth={broken || selected ? 0.14 : 0.07}
          />
        ) : (
          <rect
            className="table-body"
            x={cx - LONG_W / 2}
            y={cy - LONG_H / 2}
            width={LONG_W}
            height={LONG_H}
            rx={0.2}
            fill="var(--card)"
            stroke={outline}
            strokeWidth={broken || selected ? 0.14 : 0.07}
          />
        )}
      </g>
      <g aria-hidden pointerEvents="none">
        {t.shape === "round" ? (
          <>
            <text x={cx} y={cy - 0.02} fontSize={0.34} fontWeight={600} textAnchor="middle" fill={TEXT}>
              {t.name}
            </text>
            <text x={cx} y={cy + 0.36} fontSize={0.3} textAnchor="middle" fill={full ? "var(--ok)" : MUTED} fontWeight={full ? 600 : 400}>
              {filled}/{t.seats}
            </text>
          </>
        ) : (
          <text x={cx} y={cy + 0.12} fontSize={0.34} fontWeight={600} textAnchor="middle" fill={TEXT}>
            {t.name} · {filled}/{t.seats}
          </text>
        )}
      </g>

      {/* seats */}
      {positions.map((pos, i) => {
        const g = seats[i]
        const isHeld = g !== null && g.id === heldGuest
        const isBroken = g !== null && brokenGuests.has(g.id)
        const seatOver = over?.seat === i
        const label = g
          ? `${t.name}, seat ${i + 1}: ${g.name}${g.diet ? `, ${g.diet}` : ""}${isBroken ? ", breaks a rule" : ""}`
          : `${t.name}, seat ${i + 1}: empty`
        return (
          <React.Fragment key={i}>
          <g
            role="button"
            tabIndex={-1}
            aria-label={label}
            aria-pressed={isHeld}
            onClick={() => p.onSeatClick(t.id, i)}
            {...dropHandlers(i)}
          >
            <title>{g ? `${g.name}${g.diet ? ` · ${g.diet}` : ""}` : `Seat ${i + 1} · empty`}</title>
            <circle
              cx={pos.x}
              cy={pos.y}
              r={SEAT_R}
              fill={g ? partyColor(g.party) : placing ? "var(--card)" : "var(--room)"}
              stroke={
                seatOver
                  ? "var(--primary)"
                  : isHeld
                    ? "var(--gold)"
                    : isBroken
                      ? "var(--warn)"
                      : g
                        ? partyColor(g.party, 0.6, 0.1)
                        : placing
                          ? "var(--primary)"
                          : "var(--room-line)"
              }
              strokeWidth={seatOver || isHeld || isBroken ? 0.12 : 0.05}
              strokeDasharray={g ? undefined : "0.12 0.1"}
            />
            {g?.diet && (
              <circle cx={pos.x + SEAT_R * 0.75} cy={pos.y - SEAT_R * 0.75} r={0.1} fill="var(--primary)" stroke="var(--card)" strokeWidth={0.03} />
            )}
          </g>
          <g aria-hidden pointerEvents="none">
            {g ? (
              <text x={pos.x} y={pos.y + 0.11} fontSize={0.3} fontWeight={700} textAnchor="middle" fill="oklch(0.25 0.03 165)">
                {initials(g.name)}
              </text>
            ) : placing ? (
              <text x={pos.x} y={pos.y + 0.12} fontSize={0.4} textAnchor="middle" fill="var(--primary)">
                +
              </text>
            ) : null}
          </g>
          </React.Fragment>
        )
      })}

      {/* rule flag */}
      {broken && (
        <g aria-hidden>
          <circle cx={t.shape === "round" ? cx + r * 0.72 : cx + LONG_W / 2 - 0.1} cy={t.shape === "round" ? cy - r * 0.72 : cy - LONG_H / 2} r={0.26} fill="var(--warn)" stroke="var(--card)" strokeWidth={0.05} />
          <text x={t.shape === "round" ? cx + r * 0.72 : cx + LONG_W / 2 - 0.1} y={(t.shape === "round" ? cy - r * 0.72 : cy - LONG_H / 2) + 0.12} fontSize={0.36} fontWeight={800} textAnchor="middle" fill="white">
            !
          </text>
        </g>
      )}
    </g>
  )
}
