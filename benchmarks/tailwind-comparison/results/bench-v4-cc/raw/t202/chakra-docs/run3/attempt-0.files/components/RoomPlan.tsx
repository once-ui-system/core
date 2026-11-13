"use client"

import { Box, Text } from "@chakra-ui/react"
import * as React from "react"
import { LuTriangleAlert } from "react-icons/lu"
import { FIXTURES, GUESTS, ROOM, TABLES, type Fixture } from "@/lib/data"
import {
  occupants,
  tableGeometry,
  type Placements,
  type RuleResult,
  brokenByTable,
  brokenGuestIds,
  guestById,
} from "@/lib/seating"
import { initials, partyPalette, type Palette } from "@/components/GuestBits"

const px = (x: number) => `${(x / ROOM.width) * 100}%`
const py = (y: number) => `${(y / ROOM.depth) * 100}%`

const FIXTURE_STYLE: Record<Fixture["kind"], { palette: Palette; radius: string }> = {
  stage: { palette: "purple", radius: "md" },
  dancefloor: { palette: "teal", radius: "md" },
  bar: { palette: "orange", radius: "md" },
  door: { palette: "blue", radius: "xs" },
}

interface Props {
  placements: Placements
  rules: RuleResult[]
  selectedTable: string | null
  pickedId: string | null
  dragId: string | null
  onDragGuest: (id: string | null) => void
  onDropGuest: (guestId: string, tableId: string, seat?: number) => void
  onTapSeat: (tableId: string, seat: number, occupant: string | null) => void
  onTapTable: (tableId: string) => void
}

type Hover = { table: string; seat: number | null } | null

export function RoomPlan(props: Props) {
  const { placements, rules, selectedTable, pickedId, dragId, onDragGuest, onDropGuest, onTapSeat, onTapTable } = props
  const [hover, setHover] = React.useState<Hover>(null)
  const broken = React.useMemo(() => brokenByTable(rules), [rules])
  const brokenGuests = React.useMemo(() => brokenGuestIds(rules), [rules])

  const handleDrop = (e: React.DragEvent, tableId: string, seat?: number) => {
    e.preventDefault()
    e.stopPropagation()
    const id = e.dataTransfer.getData("text/plain") || dragId
    setHover(null)
    if (id && guestById.has(id)) onDropGuest(id, tableId, seat)
  }
  const allowDrop = (e: React.DragEvent, h: Hover) => {
    if (!dragId) return
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setHover(h)
  }

  return (
    <Box
      role="group"
      aria-label={`Room plan, ${ROOM.width} by ${ROOM.depth} metres`}
      overflowX="auto"
      borderRadius="lg"
    >
      <Box minW="880px">
        <Box
          position="relative"
          aspectRatio={`${ROOM.width} / ${ROOM.depth}`}
          bg="bg.muted"
          borderWidth="3px"
          borderColor="border.emphasized"
          borderRadius="lg"
          overflow="hidden"
          css={{ containerType: "inline-size" }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHover(null)
          }}
        >
          {FIXTURES.map((f) => {
            const s = FIXTURE_STYLE[f.kind]
            const vertical = f.kind === "door"
            return (
              <Box
                key={f.id}
                role="img"
                aria-label={f.label}
                title={f.label}
                position="absolute"
                left={px(f.x)}
                top={py(f.y)}
                w={px(f.w)}
                h={py(f.h)}
                colorPalette={s.palette}
                bg={f.kind === "dancefloor" ? "colorPalette.subtle" : "colorPalette.muted"}
                color="colorPalette.fg"
                borderWidth={f.kind === "door" ? "0" : "1.5px"}
                borderStyle={f.kind === "dancefloor" ? "dashed" : "solid"}
                borderColor="colorPalette.solid"
                borderRadius={s.radius}
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="clamp(9px, 1.25cqw, 15px)"
                fontWeight="semibold"
                letterSpacing="0.02em"
                textTransform={vertical ? "none" : "uppercase"}
                userSelect="none"
              >
                <Text
                  as="span"
                  style={vertical ? { writingMode: "vertical-rl", transform: "rotate(180deg)", whiteSpace: "nowrap" } : undefined}
                >
                  {f.label}
                </Text>
              </Box>
            )
          })}

          {TABLES.map((t) => {
            const g = tableGeometry(t)
            const occ = occupants(placements, t)
            const filled = occ.filter(Boolean).length
            const bad = broken[t.id] ?? []
            const selected = selectedTable === t.id
            const over = hover?.table === t.id && hover.seat === null && !!dragId
            const zoneLabel = `${t.name}, ${filled} of ${t.seats} seats filled${
              bad.length ? `, ${bad.length} rule${bad.length > 1 ? "s" : ""} broken` : ""
            }`
            return (
              <React.Fragment key={t.id}>
                <Box
                  role="button"
                  tabIndex={0}
                  aria-label={zoneLabel}
                  aria-pressed={selected}
                  onClick={() => onTapTable(t.id)}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      onTapTable(t.id)
                    }
                  }}
                  onDragOver={(e: React.DragEvent) => allowDrop(e, { table: t.id, seat: null })}
                  onDrop={(e: React.DragEvent) => handleDrop(e, t.id)}
                  position="absolute"
                  left={px(g.zone.x)}
                  top={py(g.zone.y)}
                  w={px(g.zone.w)}
                  h={py(g.zone.h)}
                  borderRadius={g.round ? "full" : "2xl"}
                  borderWidth="2px"
                  borderStyle={bad.length || over ? "dashed" : "solid"}
                  borderColor={bad.length ? "red.solid" : over || selected ? "teal.solid" : "transparent"}
                  bg={over ? "teal.muted" : selected ? "teal.subtle" : "transparent"}
                  cursor="pointer"
                  transition="background 0.15s"
                  _hover={{ bg: selected ? "teal.subtle" : "bg.emphasized" }}
                  _focusVisible={{ outline: "3px solid", outlineColor: "teal.focusRing", outlineOffset: "2px" }}
                >
                  <Box
                    position="absolute"
                    left={`${((g.disc.x - g.zone.x) / g.zone.w) * 100}%`}
                    top={`${((g.disc.y - g.zone.y) / g.zone.h) * 100}%`}
                    w={`${(g.disc.w / g.zone.w) * 100}%`}
                    h={`${(g.disc.h / g.zone.h) * 100}%`}
                    bg="bg.panel"
                    borderWidth="1.5px"
                    borderColor="border.emphasized"
                    borderRadius={g.round ? "full" : "md"}
                    display="flex"
                    flexDirection={g.round ? "column" : "row"}
                    alignItems="center"
                    justifyContent="center"
                    gap={g.round ? "0" : "2"}
                    pointerEvents="none"
                    lineHeight="1.15"
                    fontSize="clamp(9px, 1.2cqw, 15px)"
                    textAlign="center"
                  >
                    <Text as="span" fontWeight="semibold">
                      {t.name}
                    </Text>
                    <Text
                      as="span"
                      color={filled === t.seats ? "green.fg" : "fg.muted"}
                      fontWeight="medium"
                    >
                      {filled}/{t.seats}
                    </Text>
                  </Box>
                  {bad.length > 0 && (
                    <Box
                      position="absolute"
                      top={g.round ? "7%" : "-4%"}
                      right={g.round ? "7%" : "-1%"}
                      zIndex={2}
                      w="clamp(18px, 2.2cqw, 28px)"
                      aspectRatio="1"
                      borderRadius="full"
                      bg="red.solid"
                      color="red.contrast"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      title={bad.map((b) => b.headline).join(". ")}
                      pointerEvents="none"
                    >
                      <LuTriangleAlert aria-hidden />
                    </Box>
                  )}
                </Box>

                {g.seats.map((pos, i) => {
                  const gid = occ[i]
                  const guest = gid ? guestById.get(gid) ?? null : null
                  const picked = !!guest && pickedId === guest.id
                  const bad2 = !!guest && brokenGuests.has(guest.id)
                  const seatOver = hover?.table === t.id && hover.seat === i && !!dragId
                  const label = guest
                    ? `${t.name}, seat ${i + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}${
                        bad2 ? ", involved in a broken rule" : ""
                      }`
                    : `${t.name}, seat ${i + 1}: empty`
                  const tap = () => onTapSeat(t.id, i, guest ? guest.id : null)
                  return (
                    <Box
                      key={`${t.id}-${i}`}
                      role="button"
                      tabIndex={0}
                      aria-label={label}
                      aria-pressed={guest ? picked : undefined}
                      title={guest ? `${guest.name} (${guest.party})${guest.diet ? ` · ${guest.diet}` : ""}` : `Empty seat ${i + 1}`}
                      draggable={!!guest}
                      onDragStart={(e: React.DragEvent) => {
                        if (!guest) return
                        e.dataTransfer.setData("text/plain", guest.id)
                        e.dataTransfer.effectAllowed = "move"
                        onDragGuest(guest.id)
                      }}
                      onDragEnd={() => {
                        onDragGuest(null)
                        setHover(null)
                      }}
                      onDragOver={(e: React.DragEvent) => allowDrop(e, { table: t.id, seat: i })}
                      onDrop={(e: React.DragEvent) => handleDrop(e, t.id, i)}
                      onClick={tap}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          tap()
                        }
                      }}
                      position="absolute"
                      left={px(pos.x - g.seatSize / 2)}
                      top={py(pos.y - g.seatSize / 2)}
                      w={px(g.seatSize)}
                      aspectRatio="1"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="clamp(9px, 1.25cqw, 15px)"
                      fontWeight="semibold"
                      userSelect="none"
                      cursor={guest ? "grab" : "pointer"}
                      colorPalette={guest ? partyPalette(guest.party) : "gray"}
                      bg={seatOver ? "teal.muted" : guest ? "colorPalette.subtle" : "bg.panel"}
                      color={guest ? "colorPalette.fg" : "fg.subtle"}
                      borderWidth={bad2 ? "3px" : guest ? "2px" : "1.5px"}
                      borderStyle={guest ? "solid" : "dashed"}
                      borderColor={bad2 ? "red.solid" : seatOver ? "teal.solid" : guest ? "colorPalette.solid" : "border.emphasized"}
                      outline={picked ? "3px solid" : undefined}
                      outlineColor={picked ? "teal.solid" : undefined}
                      outlineOffset="2px"
                      transition="transform 0.12s"
                      _hover={{ transform: "scale(1.08)" }}
                      _focusVisible={{ outline: "3px solid", outlineColor: "teal.focusRing", outlineOffset: "2px" }}
                    >
                      {guest ? initials(guest.name) : <span aria-hidden>+</span>}
                      {guest?.diet && (
                        <Box
                          aria-hidden
                          position="absolute"
                          top="-6%"
                          right="-6%"
                          w="30%"
                          aspectRatio="1"
                          borderRadius="full"
                          bg="orange.solid"
                          borderWidth="1.5px"
                          borderColor="bg.panel"
                        />
                      )}
                    </Box>
                  )
                })}
              </React.Fragment>
            )
          })}
        </Box>
        <Box mt="2" display="flex" alignItems="center" gap="3" color="fg.muted" fontSize="xs">
          <Box w={`${(5 / ROOM.width) * 100}%`} borderBottomWidth="2px" borderLeftWidth="2px" borderRightWidth="2px" h="6px" borderColor="fg.muted" aria-hidden />
          <Text>5 m</Text>
          <Text ml="auto">
            Room {ROOM.width} × {ROOM.depth} m, drawn to scale · {GUESTS.length} guests invited
          </Text>
        </Box>
      </Box>
    </Box>
  )
}
