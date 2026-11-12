"use client"

import { Box, Flex, HStack, Text, VisuallyHidden } from "@chakra-ui/react"
import * as React from "react"
import { LuTriangleAlert } from "react-icons/lu"
import { usePlan } from "@/components/PlanProvider"
import {
  EVENT,
  FIXTURES,
  GUEST_BY_ID,
  PARTIES,
  PARTY_PALETTE,
  TABLES,
  initials,
  type Fixture,
  type TableDef,
} from "@/lib/data"

const W = EVENT.room.width
const D = EVENT.room.depth
const pctX = (m: number) => `${(m / W) * 100}%`
const pctY = (m: number) => `${(m / D) * 100}%`

const SEAT_D = 0.95
const ROUND_BOX = 3.7
const ROUND_R = 1.35
const ROUND_TABLE = 1.9
const LONG_W = 5
const LONG_H = 2.6

function seatPosition(table: TableDef, i: number): { left: string; top: string; size: string } {
  if (table.shape === "round") {
    const a = (i / table.seats) * Math.PI * 2 - Math.PI / 2
    return {
      left: `${50 + ((Math.cos(a) * ROUND_R) / ROUND_BOX) * 100}%`,
      top: `${50 + ((Math.sin(a) * ROUND_R) / ROUND_BOX) * 100}%`,
      size: `${(SEAT_D / ROUND_BOX) * 100}%`,
    }
  }
  const perSide = table.seats / 2
  const row = i < perSide ? 0 : 1
  const col = i % perSide
  const pitch = 1.15
  const cx = LONG_W / 2 + (col - (perSide - 1) / 2) * pitch
  const cy = LONG_H / 2 + (row === 0 ? -0.9 : 0.9)
  return {
    left: `${(cx / LONG_W) * 100}%`,
    top: `${(cy / LONG_H) * 100}%`,
    size: `${(0.8 / LONG_W) * 100}%`,
  }
}

function FixtureView({ f }: { f: Fixture }) {
  const common = {
    position: "absolute" as const,
    left: pctX(f.x),
    top: pctY(f.y),
    width: pctX(f.w),
    height: pctY(f.h),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "xs",
    fontWeight: "medium",
    textAlign: "center" as const,
    lineHeight: "1.2",
  }
  if (f.kind === "stage") {
    return (
      <Box {...common} bg="gray.solid" color="gray.contrast" roundedBottom="md" role="img" aria-label={f.label}>
        {f.label}
      </Box>
    )
  }
  if (f.kind === "dancefloor") {
    return (
      <Box
        {...common}
        borderWidth="1px"
        borderStyle="dashed"
        borderColor="orange.muted"
        color="orange.fg"
        rounded="md"
        css={{
          backgroundColor: "var(--chakra-colors-orange-subtle)",
          backgroundImage:
            "conic-gradient(var(--chakra-colors-orange-muted) 25%, transparent 0 50%, var(--chakra-colors-orange-muted) 0 75%, transparent 0)",
          backgroundSize: "28px 28px",
        }}
        role="img"
        aria-label={f.label}
      >
        <Text as="span" bg="orange.subtle" px="2" py="0.5" rounded="sm">
          {f.label}
        </Text>
      </Box>
    )
  }
  if (f.kind === "bar") {
    return (
      <Box {...common} bg="blue.subtle" color="blue.fg" borderWidth="1px" borderColor="blue.muted" rounded="md" role="img" aria-label={f.label}>
        {f.label}
      </Box>
    )
  }
  return (
    <Box
      {...common}
      bg="green.subtle"
      borderLeftWidth="4px"
      borderColor="green.solid"
      color="green.fg"
      overflow="visible"
      role="img"
      aria-label={f.label}
    >
      <Text as="span" fontSize="10px" whiteSpace="nowrap" css={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
        {f.label}
      </Text>
    </Box>
  )
}

export function RoomPlan() {
  const plan = usePlan()
  const [over, setOver] = React.useState<string | null>(null)
  const { heldGuest, hold, selectedTable, selectTable, place, setDragging, draggingGuest } = plan

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hold(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [hold])

  const activate = (e: React.KeyboardEvent, fn: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      fn()
    }
  }

  const readDrag = (e: React.DragEvent): string | null => e.dataTransfer.getData("text/plain") || draggingGuest

  const onSeatClick = (table: TableDef, seat: number) => {
    const occupant = plan.seats[table.id]?.[seat] ?? null
    if (heldGuest) {
      if (occupant === heldGuest) hold(null)
      else place(heldGuest, table.id, seat)
      return
    }
    selectTable(table.id)
    plan.setPanel("table")
    if (occupant) hold(occupant)
  }

  const onTableClick = (table: TableDef) => {
    if (heldGuest) {
      place(heldGuest, table.id)
      return
    }
    selectTable(selectedTable === table.id ? null : table.id)
    plan.setPanel("table")
  }

  return (
    <Box>
      <Box overflowX="auto" rounded="xl" borderWidth="1px" borderColor="border" bg="bg.panel" p={{ base: "2", md: "3" }}>
        <Box
          position="relative"
          minW="620px"
          w="full"
          aspectRatio={W / D}
          rounded="lg"
          bg="bg.muted"
          borderWidth="2px"
          borderColor="border.emphasized"
          role="group"
          aria-label={`Floor plan of ${EVENT.venue}, ${W} by ${D} metres`}
          css={{
            backgroundImage:
              "linear-gradient(to right, var(--chakra-colors-border-muted) 1px, transparent 1px), linear-gradient(to bottom, var(--chakra-colors-border-muted) 1px, transparent 1px)",
            backgroundSize: `${100 / W}% ${100 / D}%`,
          }}
        >
          {FIXTURES.map((f) => (
            <FixtureView key={f.id} f={f} />
          ))}

          {TABLES.map((table) => {
            const row = plan.seats[table.id] ?? []
            const count = plan.counts.perTable[table.id] ?? 0
            const broken = plan.brokenByTable[table.id]
            const isSelected = selectedTable === table.id
            const round = table.shape === "round"
            const tableOver = over === table.id
            const label = `${table.name} ${count}/${table.seats}, ${count} of ${table.seats} seats filled${broken ? ", a seating rule is broken here" : ""}`
            return (
              <Box
                key={table.id}
                position="absolute"
                left={pctX(table.x)}
                top={pctY(table.y)}
                width={pctX(round ? ROUND_BOX : LONG_W)}
                aspectRatio={round ? 1 : LONG_W / LONG_H}
                transform={`translate(-50%, -50%)${table.rotation ? ` rotate(${table.rotation}deg)` : ""}`}
                rounded={round ? "full" : "xl"}
                bg={isSelected ? "orange.subtle" : "transparent"}
                outlineWidth={isSelected || broken ? "2px" : "0"}
                outlineStyle="solid"
                outlineColor={broken ? "red.solid" : "orange.solid"}
                outlineOffset="1px"
                transition="background 0.15s"
              >
                {/* table top */}
                <Flex
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onClick={() => onTableClick(table)}
                  onKeyDown={(e) => activate(e, () => onTableClick(table))}
                  onDragOver={(e) => {
                    if (draggingGuest) {
                      e.preventDefault()
                      setOver(table.id)
                    }
                  }}
                  onDragLeave={() => setOver((o) => (o === table.id ? null : o))}
                  onDrop={(e) => {
                    e.preventDefault()
                    const id = readDrag(e)
                    setOver(null)
                    setDragging(null)
                    if (id) place(id, table.id)
                  }}
                  position="absolute"
                  left="50%"
                  top="50%"
                  width={round ? `${(ROUND_TABLE / ROUND_BOX) * 100}%` : "88%"}
                  height={round ? undefined : "34%"}
                  aspectRatio={round ? 1 : undefined}
                  transform="translate(-50%, -50%)"
                  rounded={round ? "full" : "lg"}
                  bg="bg.panel"
                  borderWidth="2px"
                  borderColor={tableOver ? "orange.solid" : "border.emphasized"}
                  boxShadow="sm"
                  direction="column"
                  align="center"
                  justify="center"
                  cursor="pointer"
                  lineHeight="1.15"
                  _hover={{ borderColor: "orange.solid" }}
                  _focusVisible={{ outline: "3px solid", outlineColor: "orange.focusRing", outlineOffset: "2px" }}
                >
                  <Text fontSize="11px" fontWeight="semibold" textAlign="center">
                    {table.name}
                  </Text>
                  <Text fontSize="10px" color={count >= table.seats ? "green.fg" : "fg.muted"} fontVariantNumeric="tabular-nums">
                    {count}/{table.seats}
                  </Text>
                  <VisuallyHidden>{label}</VisuallyHidden>
                </Flex>
                {broken && (
                  <Flex
                    position="absolute"
                    right="-4px"
                    top="-4px"
                    boxSize="20px"
                    rounded="full"
                    bg="red.solid"
                    color="red.contrast"
                    align="center"
                    justify="center"
                    pointerEvents="none"
                    zIndex="1"
                  >
                    <LuTriangleAlert size={12} aria-hidden="true" />
                  </Flex>
                )}

                {/* seats */}
                {row.map((gid, i) => {
                  const pos = seatPosition(table, i)
                  const guest = gid ? GUEST_BY_ID[gid] : null
                  const key = `${table.id}:${i}`
                  const isHeld = !!gid && gid === heldGuest
                  const isBroken = !!gid && plan.brokenGuests.has(gid) && !!broken
                  const isOver = over === key
                  const palette = guest ? (PARTY_PALETTE[guest.party] ?? "gray") : "gray"
                  const seatLabel = guest
                    ? `${table.name}, seat ${i + 1}: ${guest.name}, ${guest.party}${guest.diet ? `, ${guest.diet}` : ""}${isBroken ? ", seating rule broken" : ""}${isHeld ? ", picked up" : ""}`
                    : `${table.name}, seat ${i + 1}: empty${heldGuest ? `, place ${GUEST_BY_ID[heldGuest]?.name} here` : ""}`
                  return (
                    <Flex
                      key={key}
                      role="button"
                      tabIndex={0}
                      aria-label={seatLabel}
                      title={guest ? `${guest.name}${guest.diet ? ` (${guest.diet})` : ""}` : `Seat ${i + 1}: empty`}
                      data-initials={guest ? initials(guest.name) : ""}
                      css={{ "&::before": { content: "attr(data-initials)" } }}
                      draggable={!!guest}
                      colorPalette={palette}
                      onClick={() => onSeatClick(table, i)}
                      onKeyDown={(e) => activate(e, () => onSeatClick(table, i))}
                      onDragStart={(e: React.DragEvent) => {
                        if (!gid) return
                        e.dataTransfer.setData("text/plain", gid)
                        e.dataTransfer.effectAllowed = "move"
                        setDragging(gid)
                      }}
                      onDragEnd={() => {
                        setDragging(null)
                        setOver(null)
                      }}
                      onDragOver={(e: React.DragEvent) => {
                        if (draggingGuest) {
                          e.preventDefault()
                          e.stopPropagation()
                          setOver(key)
                        }
                      }}
                      onDragLeave={() => setOver((o) => (o === key ? null : o))}
                      onDrop={(e: React.DragEvent) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const id = readDrag(e)
                        setOver(null)
                        setDragging(null)
                        if (id) place(id, table.id, i)
                      }}
                      position="absolute"
                      left={pos.left}
                      top={pos.top}
                      width={pos.size}
                      aspectRatio={1}
                      transform="translate(-50%, -50%)"
                      rounded="full"
                      align="center"
                      justify="center"
                      fontSize="10px"
                      fontWeight="semibold"
                      cursor={guest ? "grab" : "pointer"}
                      userSelect="none"
                      bg={guest ? "colorPalette.700" : isOver ? "orange.subtle" : "bg.panel"}
                      color={guest ? "white" : "fg.subtle"}
                      borderWidth={guest ? "2px" : "1.5px"}
                      borderStyle={guest ? "solid" : "dashed"}
                      borderColor={isOver ? "orange.solid" : isBroken ? "red.solid" : guest ? "bg.panel" : heldGuest ? "orange.solid" : "border.emphasized"}
                      outlineWidth={isHeld || isBroken ? "2px" : "0"}
                      outlineStyle="solid"
                      outlineColor={isHeld ? "orange.solid" : "red.solid"}
                      outlineOffset="1px"
                      boxShadow={isHeld ? "lg" : undefined}
                      zIndex={isHeld ? 2 : 0}
                      _hover={{ borderColor: "orange.solid" }}
                      _focusVisible={{ outline: "3px solid", outlineColor: "orange.focusRing", outlineOffset: "2px" }}
                    >
                      {guest?.diet && (
                        <Box
                          position="absolute"
                          right="-2px"
                          top="-2px"
                          boxSize="9px"
                          rounded="full"
                          bg="bg.panel"
                          borderWidth="2px"
                          borderColor="fg"
                          pointerEvents="none"
                          aria-hidden="true"
                        />
                      )}
                    </Flex>
                  )
                })}
              </Box>
            )
          })}
        </Box>
      </Box>

      <Flex mt="3" wrap="wrap" columnGap="4" rowGap="2" align="center" fontSize="xs" color="fg.muted" aria-label="Legend" role="group">
        {PARTIES.map((p) => (
          <HStack key={p} gap="1.5">
            <Box boxSize="10px" rounded="full" colorPalette={PARTY_PALETTE[p]} bg="colorPalette.solid" />
            <Text as="span">{p}</Text>
          </HStack>
        ))}
        <HStack gap="1.5">
          <Box boxSize="10px" rounded="full" bg="bg.panel" borderWidth="2px" borderColor="fg" />
          <Text as="span">Dietary need</Text>
        </HStack>
        <HStack gap="1.5">
          <Box boxSize="10px" rounded="full" borderWidth="1.5px" borderStyle="dashed" borderColor="border.emphasized" />
          <Text as="span">Empty seat</Text>
        </HStack>
        <Text as="span" ms={{ md: "auto" }}>
          Grid squares are 1 m · room {W} × {D} m
        </Text>
      </Flex>
    </Box>
  )
}
