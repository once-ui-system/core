"use client"

import { useMemo, useState } from "react"
import type { DragEvent, KeyboardEvent } from "react"
import { Badge, Box, Button, Flex, Grid, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react"
import { LuCheck, LuUndo2, LuUserMinus, LuX } from "react-icons/lu"
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select"
import { toaster } from "@/components/ui/toaster"
import { tables, type Guest } from "@/lib/data"
import {
  guestById,
  initials,
  parties,
  partyColor,
  tableById,
  type RuleResult,
  type SeatMap,
} from "@/lib/seating"
import { RoomPlan } from "./room-plan"
import { useSeating } from "./seating-provider"

function activateOnKey(e: KeyboardEvent<HTMLElement>, fn: () => void) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault()
    fn()
  }
}

const srOnly = {
  position: "absolute",
  width: "1px",
  height: "1px",
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
} as const

/* ------------------------------ small pieces ------------------------------ */

function StatTile(props: { label: string; value: number | string; sub: string; palette?: string; href?: string }) {
  const { label, value, sub, palette, href } = props
  const body = (
    <Box bg="bg.panel" borderWidth="1px" rounded="xl" p={{ base: "3", md: "4" }} h="100%">
      <Text fontSize="xs" color="fg.muted" fontWeight="500" textTransform="uppercase" letterSpacing="0.06em">
        {label}
      </Text>
      <Text fontSize="3xl" fontWeight="700" lineHeight="1.1" color={palette ? `${palette}.fg` : undefined}>
        {value}
      </Text>
      <Text fontSize="sm" color="fg.muted">
        {sub}
      </Text>
    </Box>
  )
  return href ? (
    <a href={href} style={{ display: "block" }}>
      {body}
    </a>
  ) : (
    body
  )
}

function GuestChip(props: {
  guest: Guest
  held: boolean
  onToggle: () => void
  onDragStart: () => void
  onDragEnd: () => void
}) {
  const { guest, held, onToggle, onDragStart, onDragEnd } = props
  const c = partyColor(guest.party)
  return (
    <Flex
      role="button"
      tabIndex={0}
      aria-pressed={held}
      aria-label={`${guest.name}, ${guest.party}${guest.diet ? `, ${guest.diet}` : ""}. ${held ? "Selected" : "Select to place"}`}
      draggable
      onDragStart={(e: DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("text/plain", guest.id)
        e.dataTransfer.effectAllowed = "move"
        onDragStart()
      }}
      onDragEnd={onDragEnd}
      onClick={onToggle}
      onKeyDown={(e) => activateOnKey(e, onToggle)}
      align="center"
      gap="2"
      minH="10"
      ps="1.5"
      pe="3"
      rounded="full"
      cursor="grab"
      userSelect="none"
      bg={held ? `${c}.solid` : `${c}.subtle`}
      color={held ? `${c}.contrast` : `${c}.fg`}
      borderWidth="1px"
      borderColor={held ? "fg" : `${c}.muted`}
      _hover={{ bg: held ? `${c}.solid` : `${c}.muted` }}
      _focusVisible={{ outlineWidth: "3px", outlineStyle: "solid", outlineColor: "teal.focusRing", outlineOffset: "2px" }}
    >
      <Flex
        aria-hidden
        boxSize="7"
        rounded="full"
        bg={held ? `${c}.contrast` : `${c}.solid`}
        color={held ? `${c}.solid` : `${c}.contrast`}
        align="center"
        justify="center"
        fontSize="xs"
        fontWeight="700"
      >
        {initials(guest.name)}
      </Flex>
      <Text fontSize="sm" fontWeight="600" whiteSpace="nowrap">
        {guest.name}
      </Text>
      {guest.diet && (
        <Badge size="xs" colorPalette="orange" variant="solid">
          {guest.diet}
        </Badge>
      )}
      {guest.rsvp !== "yes" && (
        <Badge size="xs" variant="outline">
          {guest.rsvp === "maybe" ? "Maybe" : "Awaiting"}
        </Badge>
      )}
    </Flex>
  )
}

/* ------------------------------ side panels ------------------------------ */

function RulesPanel(props: { rules: RuleResult[]; onShow: (tableId: string) => void }) {
  const { rules, onShow } = props
  const broken = rules.filter((r) => r.status === "broken").length
  const waiting = rules.filter((r) => r.status === "waiting").length
  const kept = rules.filter((r) => r.status === "kept").length
  const KIND = { together: "Keep together", apart: "Keep apart", near: "Seat near" } as const
  const PALETTE = { broken: "red", kept: "green", waiting: "gray" } as const
  const STATUS = { broken: "Broken", kept: "Kept", waiting: "Waiting" } as const
  return (
    <Box id="rules" bg="bg.panel" borderWidth="1px" rounded="xl" p="4" scrollMarginTop="80px">
      <Flex align="baseline" justify="space-between" gap="2" wrap="wrap" mb="1">
        <Heading as="h2" size="md">
          The couple&apos;s rules
        </Heading>
        <Text fontSize="sm" color={broken ? "red.fg" : "fg.muted"} fontWeight={broken ? "600" : "400"}>
          {broken} broken · {waiting} waiting · {kept} kept
        </Text>
      </Flex>
      <Text fontSize="sm" color="fg.muted" mb="3">
        Checked after every change. Broken rules are ringed in red on the plan.
      </Text>
      <Stack as="ul" gap="2" listStyleType="none" m="0" p="0">
        {rules.map((r) => (
          <Box
            as="li"
            key={r.id}
            borderWidth="1px"
            rounded="lg"
            p="3"
            borderColor={r.status === "broken" ? "red.muted" : "border"}
            bg={r.status === "broken" ? "red.subtle" : "bg"}
          >
            <Flex gap="2" align="center" mb="1" wrap="wrap">
              <Badge colorPalette={PALETTE[r.status]} variant={r.status === "broken" ? "solid" : "subtle"}>
                {STATUS[r.status]}
              </Badge>
              <Text fontSize="xs" fontWeight="600" color="fg.muted" textTransform="uppercase" letterSpacing="0.05em">
                {KIND[r.kind]}
              </Text>
            </Flex>
            <Text fontSize="sm" fontWeight="600">
              {r.guestIds.map((id) => guestById[id].name).join(" & ")}
            </Text>
            <Text fontSize="sm" color="fg.muted">
              {r.note}
            </Text>
            <Text fontSize="sm" mt="1">
              {r.message}
            </Text>
            {r.tableIds.length > 0 && r.status === "broken" && (
              <Flex gap="2" mt="2" wrap="wrap">
                {r.tableIds.map((tid) => (
                  <Button key={tid} size="xs" variant="outline" onClick={() => onShow(tid)}>
                    Show {tableById[tid].name}
                  </Button>
                ))}
              </Flex>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  )
}

function TablesOverview(props: { seats: SeatMap; brokenTables: Set<string>; onSelect: (id: string) => void }) {
  const { seats, brokenTables, onSelect } = props
  return (
    <Box bg="bg.panel" borderWidth="1px" rounded="xl" p="4">
      <Heading as="h2" size="md" mb="1">
        Tables
      </Heading>
      <Text fontSize="sm" color="fg.muted" mb="3">
        Select a table on the plan or here to see its guests and dietary needs.
      </Text>
      <Stack as="ul" gap="1" listStyleType="none" m="0" p="0">
        {tables.map((t) => {
          const filled = seats[t.id].filter(Boolean).length
          const pct = (filled / t.seats) * 100
          const broken = brokenTables.has(t.id)
          return (
            <Box as="li" key={t.id}>
              <Flex
                as="button"
                w="100%"
                textAlign="start"
                align="center"
                gap="3"
                px="2"
                py="2"
                minH="11"
                rounded="md"
                _hover={{ bg: "bg.muted" }}
                onClick={() => onSelect(t.id)}
                aria-label={`${t.name}, ${filled} of ${t.seats} seats${broken ? ", rule broken" : ""}. Show details`}
              >
                <Text fontSize="sm" fontWeight="600" w="20">
                  {t.name}
                </Text>
                <Box flex="1" h="2" rounded="full" bg="bg.emphasized" overflow="hidden" aria-hidden>
                  <Box h="100%" rounded="full" bg={filled === t.seats ? "green.solid" : "teal.solid"} style={{ width: `${pct}%` }} />
                </Box>
                <Text fontSize="sm" color="fg.muted" w="10" textAlign="end">
                  {filled}/{t.seats}
                </Text>
                {broken ? (
                  <Badge colorPalette="red" variant="solid">
                    Rule
                  </Badge>
                ) : (
                  <Box w="9" />
                )}
              </Flex>
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}

function TableDetail(props: {
  tableId: string
  seats: SeatMap
  rules: RuleResult[]
  heldId: string | null
  onClose: () => void
  onHold: (guestId: string) => void
  onUnseat: (guestId: string) => void
  onSeatHere: (tableId: string, index: number) => void
}) {
  const { tableId, seats, rules, heldId, onClose, onHold, onUnseat, onSeatHere } = props
  const table = tableById[tableId]
  const row = seats[tableId]
  const seated = row.filter((g): g is string => g !== null).map((id) => guestById[id])
  const diets = new Map<string, number>()
  for (const g of seated) if (g.diet) diets.set(g.diet, (diets.get(g.diet) ?? 0) + 1)
  const issues = rules.filter((r) => r.status === "broken" && r.tableIds.includes(tableId))
  const held = heldId ? guestById[heldId] : null

  return (
    <Box bg="bg.panel" borderWidth="1px" borderColor="teal.muted" rounded="xl" p="4" aria-labelledby="table-detail-title" role="region">
      <Flex justify="space-between" align="start" gap="2" mb="2">
        <Box>
          <Heading as="h2" size="md" id="table-detail-title">
            {table.name}
          </Heading>
          <Text fontSize="sm" color="fg.muted">
            {seated.length} of {table.seats} seats filled · {table.seats - seated.length} free
          </Text>
        </Box>
        <Button size="xs" variant="ghost" onClick={onClose} aria-label="Close table details">
          <LuX /> All tables
        </Button>
      </Flex>

      {issues.map((r) => (
        <Box key={r.id} bg="red.subtle" color="red.fg" rounded="md" p="2" mb="2" fontSize="sm" role="alert">
          <strong>Rule broken.</strong> {r.message}
        </Box>
      ))}

      <Text fontSize="xs" fontWeight="600" color="fg.muted" textTransform="uppercase" letterSpacing="0.05em" mb="1">
        Dietary needs at this table
      </Text>
      {diets.size === 0 ? (
        <Text fontSize="sm" mb="3">
          None recorded.
        </Text>
      ) : (
        <Flex gap="1.5" wrap="wrap" mb="3">
          {Array.from(diets.entries()).map(([d, n]) => (
            <Badge key={d} colorPalette="orange" variant="subtle" size="md">
              {n} × {d}
            </Badge>
          ))}
        </Flex>
      )}

      <Stack as="ol" gap="1" listStyleType="none" m="0" p="0">
        {row.map((gid, i) => {
          const g = gid ? guestById[gid] : null
          return (
            <Flex
              as="li"
              key={i}
              align="center"
              gap="2"
              py="1.5"
              borderTopWidth={i === 0 ? "0" : "1px"}
              minH="11"
              bg={g && g.id === heldId ? "teal.subtle" : undefined}
              rounded="md"
              px="1"
            >
              <Text fontSize="xs" color="fg.muted" w="5" textAlign="end" flexShrink={0}>
                {i + 1}
              </Text>
              {g ? (
                <>
                  <Box flex="1" minW="0">
                    <Text fontSize="sm" fontWeight="600" truncate>
                      {g.name}
                    </Text>
                    <Flex gap="1.5" align="center" wrap="wrap">
                      <Text fontSize="xs" color="fg.muted">
                        {g.party}
                      </Text>
                      {g.diet && (
                        <Badge colorPalette="orange" size="xs">
                          {g.diet}
                        </Badge>
                      )}
                      {g.rsvp !== "yes" && (
                        <Badge size="xs" variant="outline">
                          {g.rsvp === "maybe" ? "Maybe" : "Awaiting reply"}
                        </Badge>
                      )}
                    </Flex>
                  </Box>
                  <Button size="xs" variant={g.id === heldId ? "solid" : "outline"} onClick={() => onHold(g.id)} aria-pressed={g.id === heldId}>
                    Move
                  </Button>
                  <Button size="xs" variant="ghost" aria-label={`Unseat ${g.name}`} onClick={() => onUnseat(g.id)}>
                    <LuUserMinus />
                  </Button>
                </>
              ) : (
                <>
                  <Text flex="1" fontSize="sm" color="fg.subtle" fontStyle="italic">
                    Empty seat
                  </Text>
                  {held && (
                    <Button size="xs" colorPalette="teal" onClick={() => onSeatHere(tableId, i)} aria-label={`Seat ${held.name} in seat ${i + 1}`}>
                      Seat {held.name.split(" ")[0]} here
                    </Button>
                  )}
                </>
              )}
            </Flex>
          )
        })}
      </Stack>
    </Box>
  )
}

/* ------------------------------ workspace ------------------------------ */

export function PlanWorkspace() {
  const { seats, tableOf, rules, seat, unseat, undo, reset, canUndo, seatedCount, capacity, needSeat, awaitingUnseated } =
    useSeating()
  const [heldId, setHeldId] = useState<string | null>(null)
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [trayOver, setTrayOver] = useState(false)
  const [message, setMessage] = useState("Tap a guest, then a seat or table. You can also drag guests onto seats.")

  const brokenTables = useMemo(
    () => new Set(rules.filter((r) => r.status === "broken").flatMap((r) => r.tableIds)),
    [rules],
  )
  const brokenGuests = useMemo(
    () => new Set(rules.filter((r) => r.status === "broken").flatMap((r) => r.guestIds)),
    [rules],
  )
  const brokenCount = rules.filter((r) => r.status === "broken").length
  const waitingCount = rules.filter((r) => r.status === "waiting").length

  const place = (guestId: string, tableId: string, index?: number) => {
    if (index !== undefined && seats[tableId][index] === guestId) {
      setHeldId(null)
      return
    }
    const g = guestById[guestId]
    const t = tableById[tableId]
    const r = seat(guestId, tableId, index)
    if (!r.ok) {
      setMessage(r.reason)
      toaster.create({ title: `Could not seat ${g.name}`, description: r.reason, type: "error" })
      return
    }
    let text = `${g.name} seated at ${t.name}, seat ${r.seat + 1}.`
    if (r.swappedWith) text += ` ${guestById[r.swappedWith].name} took the seat they left.`
    if (r.displaced) text += ` ${guestById[r.displaced].name} now needs a seat.`
    setMessage(text)
    setSelectedTableId(tableId)
    setHeldId(null)
  }

  const remove = (guestId: string) => {
    if (!tableOf[guestId]) return
    unseat(guestId)
    setMessage(`${guestById[guestId].name} unseated and added to the list of guests to place.`)
    setHeldId((cur) => (cur === guestId ? null : cur))
  }

  const hold = (guestId: string) => {
    if (heldId === guestId) {
      setHeldId(null)
      setMessage("Selection cleared.")
      return
    }
    setHeldId(guestId)
    setMessage(`${guestById[guestId].name} selected. Tap a seat or table to place them.`)
  }

  const onSeatClick = (tableId: string, index: number) => {
    const occupant = seats[tableId][index]
    if (heldId) {
      if (occupant === heldId) {
        setHeldId(null)
        setMessage("Selection cleared.")
        return
      }
      place(heldId, tableId, index)
      return
    }
    setSelectedTableId(tableId)
    if (occupant) hold(occupant)
  }

  const onTableClick = (tableId: string) => {
    if (heldId) place(heldId, tableId)
    else setSelectedTableId((cur) => (cur === tableId ? null : tableId))
  }

  const held = heldId ? guestById[heldId] : null
  const heldTable = heldId ? tableOf[heldId] : undefined

  const tableItems = [
    { value: "", label: "Move to table…" },
    ...tables.map((t) => {
      const free = seats[t.id].filter((g) => g === null).length
      return {
        value: t.id,
        label: `${t.name} (${free} free)`,
        disabled: t.id === heldTable || free === 0,
      }
    }),
  ]

  const chipHandlers = (g: Guest) => ({
    guest: g,
    held: heldId === g.id,
    onToggle: () => hold(g.id),
    onDragStart: () => setDragId(g.id),
    onDragEnd: () => {
      setDragId(null)
      setTrayOver(false)
    },
  })

  return (
    <Stack gap="4">
      <SimpleGrid columns={{ base: 2, md: 4 }} gap={{ base: "2", md: "4" }}>
        <StatTile label="Seated" value={seatedCount} sub={`across ${tables.length} tables`} />
        <StatTile
          label="Need a seat"
          value={needSeat.length}
          sub={awaitingUnseated.length ? `+ ${awaitingUnseated.length} awaiting RSVP` : "everyone attending is seated"}
          palette={needSeat.length ? "orange" : "green"}
        />
        <StatTile label="Open seats" value={capacity - seatedCount} sub={`of ${capacity} in the room`} />
        <StatTile
          label="Rules"
          value={brokenCount ? `${brokenCount} broken` : "All kept"}
          sub={waitingCount ? `${waitingCount} not tested yet` : "every rule checked"}
          palette={brokenCount ? "red" : "green"}
          href="#rules"
        />
      </SimpleGrid>

      {/* Guests waiting for a seat */}
      <Box
        as="section"
        aria-labelledby="tray-title"
        bg={trayOver ? "teal.subtle" : "bg.panel"}
        borderWidth="1px"
        borderStyle={trayOver ? "dashed" : "solid"}
        borderColor={trayOver ? "teal.solid" : "border"}
        rounded="xl"
        p="4"
        onDragOver={(e: DragEvent<HTMLElement>) => {
          if (dragId && tableOf[dragId]) {
            e.preventDefault()
            setTrayOver(true)
          }
        }}
        onDragLeave={() => setTrayOver(false)}
        onDrop={(e: DragEvent<HTMLElement>) => {
          e.preventDefault()
          setTrayOver(false)
          if (dragId) remove(dragId)
          setDragId(null)
        }}
      >
        <Flex justify="space-between" align="baseline" gap="2" wrap="wrap" mb="2">
          <Heading as="h2" size="md" id="tray-title">
            Waiting for a seat <Text as="span" color="fg.muted" fontWeight="500">· {needSeat.length}</Text>
          </Heading>
          <Text fontSize="sm" color="fg.muted">
            Tap a guest, then a seat or table. Drop a seated guest here to unseat them.
          </Text>
        </Flex>
        {needSeat.length === 0 ? (
          <Flex align="center" gap="2" color="green.fg" fontSize="sm" fontWeight="500">
            <LuCheck /> Everyone who is attending has a seat.
          </Flex>
        ) : (
          <Flex gap="2" wrap="wrap">
            {needSeat.map((g) => (
              <GuestChip key={g.id} {...chipHandlers(g)} />
            ))}
          </Flex>
        )}
        {awaitingUnseated.length > 0 && (
          <Box mt="3">
            <Text fontSize="xs" fontWeight="600" color="fg.muted" textTransform="uppercase" letterSpacing="0.05em" mb="1.5">
              Not confirmed yet, can be held a seat · {awaitingUnseated.length}
            </Text>
            <Flex gap="2" wrap="wrap">
              {awaitingUnseated.map((g) => (
                <GuestChip key={g.id} {...chipHandlers(g)} />
              ))}
            </Flex>
          </Box>
        )}
      </Box>

      <Grid templateColumns={{ base: "minmax(0, 1fr)", xl: "minmax(0, 1fr) 390px" }} gap="4" alignItems="start">
        <Box as="section" aria-labelledby="room-title" minW="0">
          <Flex justify="space-between" align="center" gap="2" wrap="wrap" mb="2">
            <Heading as="h2" size="md" id="room-title">
              Room plan
            </Heading>
            <Flex gap="2">
              <Button size="sm" variant="outline" onClick={() => { undo(); setHeldId(null); setMessage("Last change undone.") }} disabled={!canUndo}>
                <LuUndo2 /> Undo
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  reset()
                  setHeldId(null)
                  setMessage("Plan reset to the starting arrangement.")
                }}
              >
                Reset plan
              </Button>
            </Flex>
          </Flex>

          {held ? (
            <Flex
              role="group"
              aria-label="Selected guest"
              bg="teal.subtle"
              borderWidth="1px"
              borderColor="teal.muted"
              rounded="lg"
              p="2.5"
              mb="2"
              gap="2"
              align="center"
              wrap="wrap"
            >
              <Text fontSize="sm" fontWeight="600" flex="1" minW="200px">
                {held.name}
                <Text as="span" fontWeight="400" color="fg.muted">
                  {" "}
                  {heldTable ? `at ${tableById[heldTable].name}. ` : "is not seated. "}Tap a seat or table, or:
                </Text>
              </Text>
              <Box minW="180px">
                <NativeSelectRoot size="sm">
                  <NativeSelectField
                    aria-label={`Move ${held.name} to a table`}
                    value=""
                    onChange={(e) => {
                      if (e.target.value) place(held.id, e.target.value)
                    }}
                    items={tableItems}
                  />
                </NativeSelectRoot>
              </Box>
              {heldTable && (
                <Button size="sm" variant="outline" onClick={() => remove(held.id)}>
                  <LuUserMinus /> Unseat
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => { setHeldId(null); setMessage("Selection cleared.") }}>
                Cancel
              </Button>
            </Flex>
          ) : null}

          <RoomPlan
            seats={seats}
            selectedTableId={selectedTableId}
            heldId={heldId}
            dragId={dragId}
            brokenTables={brokenTables}
            brokenGuests={brokenGuests}
            onSeatClick={onSeatClick}
            onTableClick={onTableClick}
            onDropSeat={(tableId, index) => {
              if (dragId) place(dragId, tableId, index)
              setDragId(null)
            }}
            onDropTable={(tableId) => {
              if (dragId) place(dragId, tableId)
              setDragId(null)
            }}
            onDragStartGuest={(id) => setDragId(id)}
            onDragEndGuest={() => setDragId(null)}
          />

          <Text role="status" aria-live="polite" fontSize="sm" mt="2" minH="5">
            {message}
          </Text>
          <Box css={srOnly} aria-hidden={false}>
            {seatedCount} guests seated, {needSeat.length} attending guests still need a seat, {brokenCount} rules broken.
          </Box>

          <Flex gap={{ base: "2", md: "4" }} wrap="wrap" mt="1" fontSize="xs" color="fg.muted" align="center">
            {parties.map((p) => (
              <Flex key={p} align="center" gap="1.5">
                <Box aria-hidden boxSize="2.5" rounded="full" bg={`${partyColor(p)}.solid`} />
                {p}
              </Flex>
            ))}
            <Flex align="center" gap="1.5">
              <Box aria-hidden boxSize="2.5" rounded="full" bg="orange.solid" /> Dietary need
            </Flex>
            <Flex align="center" gap="1.5">
              <Box aria-hidden boxSize="2.5" rounded="full" borderWidth="2px" borderColor="red.solid" /> Broken rule
            </Flex>
          </Flex>
          <Text fontSize="xs" color="fg.muted" mt="1">
            Drawn to scale: 24 m × 14 m, one grid square is 1 m. On a narrow screen, scroll the plan sideways.
          </Text>
        </Box>

        <Stack gap="4" minW="0">
          {selectedTableId ? (
            <TableDetail
              tableId={selectedTableId}
              seats={seats}
              rules={rules}
              heldId={heldId}
              onClose={() => setSelectedTableId(null)}
              onHold={hold}
              onUnseat={remove}
              onSeatHere={(tableId, index) => heldId && place(heldId, tableId, index)}
            />
          ) : (
            <TablesOverview seats={seats} brokenTables={brokenTables} onSelect={setSelectedTableId} />
          )}
          <RulesPanel rules={rules} onShow={setSelectedTableId} />
        </Stack>
      </Grid>
    </Stack>
  )
}
