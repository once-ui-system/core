"use client"

import { useState } from "react"
import type { DragEvent, KeyboardEvent } from "react"
import { Box, Flex, Text } from "@chakra-ui/react"
import { fixtures, tables, type FixtureKind } from "@/lib/data"
import {
  geos,
  guestById,
  initials,
  partyColor,
  ROOM_D,
  ROOM_W,
  SEAT_D,
  type SeatMap,
} from "@/lib/seating"

const pctX = (m: number) => `${(m / ROOM_W) * 100}%`
const pctY = (m: number) => `${(m / ROOM_D) * 100}%`

function activateOnKey(e: KeyboardEvent<HTMLElement>, fn: () => void) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault()
    fn()
  }
}

const FIXTURE_STYLE: Record<FixtureKind, { bg: string; color: string; borderColor: string; borderStyle: string }> = {
  stage: { bg: "gray.solid", color: "gray.contrast", borderColor: "gray.solid", borderStyle: "solid" },
  dancefloor: { bg: "teal.subtle", color: "teal.fg", borderColor: "teal.muted", borderStyle: "dashed" },
  bar: { bg: "orange.muted", color: "orange.fg", borderColor: "orange.solid", borderStyle: "solid" },
  door: { bg: "blue.solid", color: "blue.contrast", borderColor: "blue.solid", borderStyle: "solid" },
}

export interface RoomPlanProps {
  seats: SeatMap
  selectedTableId: string | null
  heldId: string | null
  dragId: string | null
  brokenTables: Set<string>
  brokenGuests: Set<string>
  onSeatClick: (tableId: string, index: number) => void
  onTableClick: (tableId: string) => void
  onDropSeat: (tableId: string, index: number) => void
  onDropTable: (tableId: string) => void
  onDragStartGuest: (guestId: string) => void
  onDragEndGuest: () => void
}

export function RoomPlan(props: RoomPlanProps) {
  const {
    seats,
    selectedTableId,
    heldId,
    dragId,
    brokenTables,
    brokenGuests,
    onSeatClick,
    onTableClick,
    onDropSeat,
    onDropTable,
    onDragStartGuest,
    onDragEndGuest,
  } = props
  const [over, setOver] = useState<string | null>(null)
  const targeting = Boolean(heldId || dragId)

  const dragProps = (key: string, onDrop: () => void) => ({
    onDragOver: (e: DragEvent<HTMLElement>) => {
      if (!dragId) return
      e.preventDefault()
      e.dataTransfer.dropEffect = "move"
      if (over !== key) setOver(key)
    },
    onDragLeave: () => setOver((cur) => (cur === key ? null : cur)),
    onDrop: (e: DragEvent<HTMLElement>) => {
      e.preventDefault()
      setOver(null)
      onDrop()
    },
  })

  return (
    <Box overflowX="auto" borderWidth="1px" rounded="xl" bg="bg.panel" p="2" tabIndex={-1}>
      <Box
        role="group"
        aria-label={`Room plan, ${ROOM_W} by ${ROOM_D} metres, drawn to scale`}
        position="relative"
        minW="960px"
        w="100%"
        rounded="lg"
        bg="bg.muted"
        overflow="hidden"
        css={{
          aspectRatio: `${ROOM_W} / ${ROOM_D}`,
          containerType: "inline-size",
          backgroundImage:
            "linear-gradient(to right, var(--chakra-colors-border-muted, rgba(128,128,128,.25)) 1px, transparent 1px), linear-gradient(to bottom, var(--chakra-colors-border-muted, rgba(128,128,128,.25)) 1px, transparent 1px)",
          backgroundSize: `calc(100% / ${ROOM_W}) calc(100% / ${ROOM_D})`,
        }}
      >
        {fixtures.map((f) => {
          const s = FIXTURE_STYLE[f.kind]
          const vertical = f.kind === "door"
          return (
            <Flex
              key={f.id}
              role="img"
              aria-label={`${f.label}, ${f.w} by ${f.h} metres`}
              position="absolute"
              style={{ left: pctX(f.x), top: pctY(f.y), width: pctX(f.w), height: pctY(f.h) }}
              bg={s.bg}
              color={s.color}
              borderWidth="2px"
              borderStyle={s.borderStyle}
              borderColor={s.borderColor}
              rounded={f.kind === "door" ? "sm" : "md"}
              align="center"
              justify="center"
              fontWeight="600"
              letterSpacing="0.02em"
              overflow="hidden"
              css={{
                fontSize: vertical ? "0.95cqw" : "1.1cqw",
                ...(vertical ? { writingMode: "vertical-rl", transform: "rotate(180deg)" } : {}),
              }}
            >
              {f.label}
            </Flex>
          )
        })}

        {tables.map((t, ti) => {
          const geo = geos[ti]
          const row = seats[t.id]
          const filled = row.filter(Boolean).length
          const broken = brokenTables.has(t.id)
          const selected = selectedTableId === t.id
          const tableOver = over === t.id
          const label = `${t.name}, ${filled} of ${t.seats} seats filled${broken ? ", a seating rule is broken" : ""}`
          return (
            <Box key={t.id}>
              <Flex
                role="button"
                tabIndex={0}
                aria-label={label}
                aria-pressed={selected}
                onClick={() => onTableClick(t.id)}
                onKeyDown={(e) => activateOnKey(e, () => onTableClick(t.id))}
                {...dragProps(t.id, () => onDropTable(t.id))}
                position="absolute"
                direction="column"
                align="center"
                justify="center"
                cursor="pointer"
                bg={tableOver ? "teal.subtle" : "bg.panel"}
                borderWidth="2px"
                borderColor={broken ? "red.solid" : selected || tableOver ? "teal.solid" : "border.emphasized"}
                rounded={geo.shape === "round" ? "full" : "md"}
                outlineWidth={selected ? "3px" : "0"}
                outlineStyle="solid"
                outlineColor="teal.solid"
                outlineOffset="3px"
                _focusVisible={{ outlineWidth: "3px", outlineColor: "teal.focusRing", outlineStyle: "solid" }}
                shadow="sm"
                style={{
                  left: pctX(geo.body.x),
                  top: pctY(geo.body.y),
                  width: pctX(geo.body.w),
                  ...(geo.shape === "round" ? { aspectRatio: "1" } : { height: pctY(geo.body.h) }),
                }}
                zIndex="1"
                lineHeight="1.15"
              >
                <Text fontWeight="700" css={{ fontSize: "1.05cqw" }}>
                  {t.name}
                </Text>
                <Text color={filled === t.seats ? "green.fg" : "fg.muted"} css={{ fontSize: "0.95cqw" }}>
                  {filled}/{t.seats}
                </Text>
                {broken && (
                  <Flex
                    aria-hidden
                    position="absolute"
                    top="-8%"
                    right="-8%"
                    rounded="full"
                    bg="red.solid"
                    color="red.contrast"
                    fontWeight="800"
                    align="center"
                    justify="center"
                    borderWidth="2px"
                    borderColor="bg.panel"
                    css={{ width: "2.2cqw", height: "2.2cqw", fontSize: "1.3cqw" }}
                  >
                    !
                  </Flex>
                )}
              </Flex>

              {geo.seats.map((pos, si) => {
                const gid = row[si]
                const g = gid ? guestById[gid] : null
                const color = g ? partyColor(g.party) : "gray"
                const key = `${t.id}:${si}`
                const isOver = over === key
                const held = gid !== null && gid === heldId
                const flagged = gid !== null && brokenGuests.has(gid)
                const seatLabel = g
                  ? `${t.name}, seat ${si + 1}: ${g.name}${g.diet ? `, ${g.diet}` : ""}${flagged ? ", involved in a broken rule" : ""}`
                  : `${t.name}, seat ${si + 1}: empty`
                return (
                  <Flex
                    key={key}
                    role="button"
                    tabIndex={0}
                    aria-label={seatLabel}
                    aria-pressed={held}
                    title={g ? `${g.name}${g.diet ? ` · ${g.diet}` : ""}` : `${t.name}, seat ${si + 1} (empty)`}
                    draggable={Boolean(g)}
                    onDragStart={(e: DragEvent<HTMLDivElement>) => {
                      if (!gid) return
                      e.dataTransfer.setData("text/plain", gid)
                      e.dataTransfer.effectAllowed = "move"
                      onDragStartGuest(gid)
                    }}
                    onDragEnd={() => {
                      setOver(null)
                      onDragEndGuest()
                    }}
                    onClick={() => onSeatClick(t.id, si)}
                    onKeyDown={(e) => activateOnKey(e, () => onSeatClick(t.id, si))}
                    {...dragProps(key, () => onDropSeat(t.id, si))}
                    position="absolute"
                    align="center"
                    justify="center"
                    rounded="full"
                    cursor={g ? "grab" : "pointer"}
                    fontWeight="700"
                    userSelect="none"
                    zIndex="2"
                    bg={g ? `${color}.solid` : isOver || (targeting && !g) ? "teal.subtle" : "bg.panel"}
                    color={g ? `${color}.contrast` : "fg.subtle"}
                    borderWidth="2px"
                    borderStyle={g ? "solid" : "dashed"}
                    borderColor={
                      flagged
                        ? "red.solid"
                        : isOver
                          ? "teal.solid"
                          : g
                            ? `${color}.solid`
                            : targeting
                              ? "teal.solid"
                              : "border.emphasized"
                    }
                    outlineWidth={held ? "3px" : flagged ? "2px" : "0"}
                    outlineStyle="solid"
                    outlineColor={held ? "fg" : "red.solid"}
                    outlineOffset="2px"
                    _focusVisible={{ outlineWidth: "3px", outlineColor: "teal.focusRing", outlineStyle: "solid" }}
                    style={{
                      left: pctX(pos.cx - SEAT_D / 2),
                      top: pctY(pos.cy - SEAT_D / 2),
                      width: pctX(SEAT_D),
                      aspectRatio: "1",
                    }}
                    css={{ fontSize: "1.15cqw" }}
                  >
                    {g ? initials(g.name) : <Box as="span" css={{ fontSize: "0.9cqw", fontWeight: 500 }}>{si + 1}</Box>}
                    {g?.diet && (
                      <Box
                        as="span"
                        aria-hidden
                        position="absolute"
                        rounded="full"
                        bg="orange.solid"
                        borderWidth="2px"
                        borderColor="bg.panel"
                        style={{ top: "-12%", right: "-12%", width: "36%", aspectRatio: "1" }}
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
  )
}
