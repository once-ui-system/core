"use client"

import { Box, chakra } from "@chakra-ui/react"
import * as React from "react"
import {
  EVENT,
  FIXTURES,
  GUESTS_BY_ID,
  TABLES,
  initials,
  partyColor,
  type SeatTable,
} from "@/lib/data"
import { SEAT_R, tableGeometry } from "@/lib/geometry"
import { usePlan } from "./store"

const v = (token: string) => `var(--chakra-colors-${token})`

/**
 * SVG text in metre units: browsers clamp tiny font sizes, so the text is drawn
 * at 100x and scaled back down.
 */
function Txt({
  x,
  y,
  fontSize,
  rotate = 0,
  children,
  ...rest
}: Omit<React.SVGProps<SVGTextElement>, "x" | "y" | "fontSize" | "transform"> & {
  x: number
  y: number
  fontSize: number
  rotate?: number
}) {
  return (
    <text
      transform={`translate(${x} ${y})${rotate ? ` rotate(${rotate})` : ""} scale(0.01)`}
      style={{ fontSize: fontSize * 100 }}
      {...rest}
    >
      {children}
    </text>
  )
}

const GEO =Object.fromEntries(TABLES.map((t) => [t.id, tableGeometry(t)]))

const PAD = 1.5
const VIEW = `${-PAD} ${-PAD} ${EVENT.room_m.width + PAD * 2} ${EVENT.room_m.depth + PAD * 2}`

export function RoomPlan() {
  const {
    seats,
    selectedTable,
    brokenTables,
    picked,
    selectTable,
    place,
    pick,
    startDrag,
    wasDragged,
    dragGuest,
    dropKey,
  } = usePlan()

  const placing = Boolean(picked || dragGuest)
  const holder = picked ?? dragGuest

  const handleActivate = (table: SeatTable, seatEl: Element | null) => {
    if (wasDragged()) return
    if (picked) {
      if (seatEl) {
        const idx = Number(seatEl.getAttribute("data-seat"))
        if (seats[table.id][idx] === picked) {
          pick(null)
          return
        }
        place(picked, table.id, idx)
      } else {
        place(picked, table.id)
      }
      return
    }
    selectTable(table.id)
  }

  return (
    <chakra.svg
      viewBox={VIEW}
      role="group"
      aria-label={`Floor plan of ${EVENT.venue}, ${EVENT.room_m.width} by ${EVENT.room_m.depth} metres, drawn to scale`}
      w="full"
      minW={{ base: "720px", md: "0" }}
      h="auto"
      display="block"
      style={{ fontFamily: "var(--chakra-fonts-body)" }}
    >
      <defs>
        <pattern id="dance-grid" width="2" height="2" patternUnits="userSpaceOnUse">
          <rect width="2" height="2" fill={v("brand-subtle")} />
          <rect width="1" height="1" fill={v("brand-muted")} />
          <rect x="1" y="1" width="1" height="1" fill={v("brand-muted")} />
        </pattern>
      </defs>

      {/* room */}
      <rect
        x={0}
        y={0}
        width={EVENT.room_m.width}
        height={EVENT.room_m.depth}
        rx={0.15}
        fill={v("bg-panel")}
        stroke={v("border-emphasized")}
        strokeWidth={0.12}
      />

      {/* dimensions */}
      <g stroke={v("fg-subtle")} strokeWidth={0.05} fill={v("fg-muted")}>
        <line x1={0} y1={-0.55} x2={EVENT.room_m.width} y2={-0.55} />
        <line x1={0} y1={-0.8} x2={0} y2={-0.3} />
        <line x1={EVENT.room_m.width} y1={-0.8} x2={EVENT.room_m.width} y2={-0.3} />
        <Txt
          x={EVENT.room_m.width / 2}
          y={-0.75}
          textAnchor="middle"
          fontSize={0.5}
          stroke="none"
        >
          {EVENT.room_m.width} m
        </Txt>
        <line x1={EVENT.room_m.width + 0.55} y1={0} x2={EVENT.room_m.width + 0.55} y2={EVENT.room_m.depth} />
        <line x1={EVENT.room_m.width + 0.3} y1={0} x2={EVENT.room_m.width + 0.8} y2={0} />
        <line x1={EVENT.room_m.width + 0.3} y1={EVENT.room_m.depth} x2={EVENT.room_m.width + 0.8} y2={EVENT.room_m.depth} />
        <Txt
          x={EVENT.room_m.width + 1.25}
          y={EVENT.room_m.depth / 2}
          rotate={90}
          textAnchor="middle"
          fontSize={0.5}
          stroke="none"
        >
          {EVENT.room_m.depth} m
        </Txt>
      </g>

      {/* fixtures */}
      {FIXTURES.map((f) => {
        const cx = f.x + f.w / 2
        const cy = f.y + f.h / 2
        if (f.kind === "stage") {
          return (
            <g key={f.id}>
              <rect x={f.x} y={f.y} width={f.w} height={f.h} rx={0.15} fill={v("gray-700")} />
              <Txt x={cx} y={cy + 0.18} textAnchor="middle" fontSize={0.6} fontWeight={700} fill="#fff">
                {f.label}
              </Txt>
            </g>
          )
        }
        if (f.kind === "dancefloor") {
          return (
            <g key={f.id}>
              <rect
                x={f.x}
                y={f.y}
                width={f.w}
                height={f.h}
                rx={0.1}
                fill="url(#dance-grid)"
                stroke={v("brand-emphasized")}
                strokeWidth={0.06}
              />
              <Txt x={cx} y={cy + 0.18} textAnchor="middle" fontSize={0.6} fontWeight={600} fill={v("brand-fg")}>
                {f.label}
              </Txt>
            </g>
          )
        }
        if (f.kind === "bar") {
          return (
            <g key={f.id}>
              <rect
                x={f.x}
                y={f.y}
                width={f.w}
                height={f.h}
                rx={0.15}
                fill={v("orange-muted")}
                stroke={v("orange-solid")}
                strokeWidth={0.08}
              />
              <Txt x={cx} y={cy + 0.18} textAnchor="middle" fontSize={0.6} fontWeight={700} fill={v("orange-fg")}>
                {f.label}
              </Txt>
            </g>
          )
        }
        return (
          <g key={f.id}>
            <rect x={f.x - 0.06} y={f.y} width={f.w + 0.12} height={f.h} fill={v("green-solid")} />
            <Txt
              x={-0.45}
              y={cy}
              rotate={-90}
              textAnchor="middle"
              fontSize={0.5}
              fontWeight={600}
              fill={v("green-fg")}
            >
              {f.label}
            </Txt>
          </g>
        )
      })}

      {/* tables */}
      {TABLES.map((t) => {
        const geo = GEO[t.id]
        const row = seats[t.id]
        const filled = row.filter(Boolean).length
        const selected = selectedTable === t.id
        const broken = brokenTables.has(t.id)
        const hover = dropKey !== null && dropKey.split("|")[1] === t.id
        const hasFree = filled < t.seats
        const summary = `${t.name}, ${filled} of ${t.seats} seats filled${broken ? ", a seating rule is broken here" : ""}`

        const ringStroke = broken ? v("red-500") : selected ? v("brand-solid") : hover ? v("brand-solid") : "none"
        const ringFill = hover
          ? v("brand-muted")
          : selected
            ? v("brand-subtle")
            : "transparent"

        const keyActivate = (e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleActivate(t, null)
          }
        }

        const badgeX = geo.rect ? geo.rect.x + geo.rect.w + 0.1 : geo.cx + geo.hitR * 0.92
        const badgeY = geo.rect ? geo.rect.y - 0.2 : geo.cy - geo.hitR * 0.38

        return (
          <g
            key={t.id}
            role="group"
            aria-label={t.name}
            data-table-id={t.id}
            onClick={(e) => handleActivate(t, (e.target as Element).closest("[data-seat]"))}
            style={{ cursor: placing && hasFree ? "copy" : "pointer" }}
          >
            {/* hit area and highlight */}
            {geo.rect ? (
              <rect
                data-drop="table"
                data-table={t.id}
                x={geo.rect.x - 0.35}
                y={geo.rect.y - 0.35}
                width={geo.rect.w + 0.7}
                height={geo.rect.h + 1.5}
                rx={0.5}
                fill={ringFill}
                stroke={ringStroke}
                strokeWidth={broken ? 0.12 : 0.1}
                strokeDasharray={broken ? "0.35 0.2" : undefined}
              />
            ) : (
              <circle
                data-drop="table"
                data-table={t.id}
                cx={geo.cx}
                cy={geo.cy}
                r={geo.hitR}
                fill={ringFill}
                stroke={ringStroke}
                strokeWidth={broken ? 0.12 : 0.1}
                strokeDasharray={broken ? "0.35 0.2" : undefined}
              />
            )}

            {/* table body (the keyboard target) */}
            {geo.rect ? (
              <>
                <rect
                  role="button"
                  tabIndex={0}
                  aria-label={summary}
                  aria-pressed={selected}
                  onKeyDown={keyActivate}
                  x={geo.rect.x}
                  y={geo.rect.y}
                  width={geo.rect.w}
                  height={geo.rect.h}
                  rx={0.2}
                  fill={v("bg-subtle")}
                  stroke={v("border-emphasized")}
                  strokeWidth={0.08}
                  className="plan-table-body"
                />
                <Txt
                  x={geo.cx}
                  y={geo.cy + 0.17}
                  textAnchor="middle"
                  fontSize={0.5}
                  fontWeight={700}
                  fill={v("fg")}
                  pointerEvents="none"
                >
                  {t.name} · {filled}/{t.seats}
                </Txt>
              </>
            ) : (
              <>
                <circle
                  role="button"
                  tabIndex={0}
                  aria-label={summary}
                  aria-pressed={selected}
                  onKeyDown={keyActivate}
                  cx={geo.cx}
                  cy={geo.cy}
                  r={geo.radius}
                  fill={v("bg-subtle")}
                  stroke={v("border-emphasized")}
                  strokeWidth={0.08}
                  className="plan-table-body"
                />
                <Txt
                  x={geo.cx}
                  y={geo.cy - 0.05}
                  textAnchor="middle"
                  fontSize={t.seats <= 6 ? 0.36 : 0.4}
                  fontWeight={700}
                  fill={v("fg")}
                  pointerEvents="none"
                >
                  {t.name}
                </Txt>
                <Txt
                  x={geo.cx}
                  y={geo.cy + 0.42}
                  textAnchor="middle"
                  fontSize={0.34}
                  fill={v("fg-muted")}
                  pointerEvents="none"
                >
                  {filled}/{t.seats}
                </Txt>
              </>
            )}

            {/* seats */}
            {geo.seats.map((p, i) => {
              const gid = row[i]
              const guest = gid ? GUESTS_BY_ID[gid] : null
              const isHover = dropKey === `seat|${t.id}|${i}`
              const isPicked = gid !== null && gid === picked
              const isDragged = gid !== null && gid === dragGuest
              const label = guest
                ? `${t.name}, seat ${i + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}`
                : `${t.name}, seat ${i + 1}: empty`
              const palette = guest ? partyColor(guest.party) : "gray"
              const invite = placing && !guest && holder !== null
              return (
                <g
                  key={i}
                  role="img"
                  aria-label={label}
                  data-drop="seat"
                  data-table={t.id}
                  data-seat={i}
                  onPointerDown={guest ? (e) => startDrag(guest.id, e) : undefined}
                  onContextMenu={guest ? (e) => e.preventDefault() : undefined}
                  style={{
                    cursor: guest ? "grab" : undefined,
                    opacity: isDragged ? 0.35 : 1,
                    userSelect: "none",
                  }}
                >
                  <title>{label}</title>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={SEAT_R}
                    fill={guest ? v(`${palette}-700`) : isHover ? v("brand-muted") : v("bg-panel")}
                    stroke={
                      isHover || isPicked
                        ? v("brand-solid")
                        : guest
                          ? v("bg-panel")
                          : invite
                            ? v("brand-solid")
                            : v("border-emphasized")
                    }
                    strokeWidth={isHover || isPicked ? 0.14 : 0.07}
                    strokeDasharray={guest ? undefined : "0.18 0.14"}
                  />
                  {guest ? (
                    <Txt
                      x={p.x}
                      y={p.y + 0.11}
                      textAnchor="middle"
                      fontSize={0.3}
                      fontWeight={700}
                      fill="#fff"
                      pointerEvents="none"
                    >
                      {initials(guest.name)}
                    </Txt>
                  ) : (
                    <Txt
                      x={p.x}
                      y={p.y + 0.1}
                      textAnchor="middle"
                      fontSize={0.28}
                      fill={v("fg-subtle")}
                      pointerEvents="none"
                    >
                      {i + 1}
                    </Txt>
                  )}
                  {guest?.diet && (
                    <circle
                      cx={p.x + 0.3}
                      cy={p.y - 0.3}
                      r={0.13}
                      fill={v("orange-400")}
                      stroke={v("bg-panel")}
                      strokeWidth={0.05}
                      pointerEvents="none"
                    />
                  )}
                </g>
              )
            })}

            {broken && (
              <g pointerEvents="none">
                <circle cx={badgeX} cy={badgeY} r={0.42} fill={v("red-600")} stroke={v("bg-panel")} strokeWidth={0.08} />
                <Txt x={badgeX} y={badgeY + 0.17} textAnchor="middle" fontSize={0.55} fontWeight={800} fill="#fff">
                  !
                </Txt>
              </g>
            )}
          </g>
        )
      })}

      {/* scale bar */}
      <g stroke={v("fg-muted")} strokeWidth={0.08} fill={v("fg-muted")}>
        <line x1={0} y1={EVENT.room_m.depth + 0.7} x2={2} y2={EVENT.room_m.depth + 0.7} />
        <line x1={0} y1={EVENT.room_m.depth + 0.55} x2={0} y2={EVENT.room_m.depth + 0.85} />
        <line x1={2} y1={EVENT.room_m.depth + 0.55} x2={2} y2={EVENT.room_m.depth + 0.85} />
        <Txt x={2.3} y={EVENT.room_m.depth + 0.9} fontSize={0.45} stroke="none">
          2 m
        </Txt>
      </g>
    </chakra.svg>
  )
}

export function RoomPlanFrame({ children }: { children: React.ReactNode }) {
  return (
    <Box
      overflowX="auto"
      rounded="xl"
      borderWidth="1px"
      bg="bg.muted"
      p={{ base: "2", md: "3" }}
      css={{
        "& .plan-table-body:focus-visible": {
          outline: "none",
          stroke: "var(--chakra-colors-brand-solid)",
          strokeWidth: "0.2px",
        },
      }}
    >
      {children}
    </Box>
  )
}
