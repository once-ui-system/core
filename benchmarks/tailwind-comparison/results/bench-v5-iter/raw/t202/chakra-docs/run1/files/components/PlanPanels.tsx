"use client"

import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
} from "@chakra-ui/react"
import * as React from "react"
import {
  LuArmchair,
  LuCircleCheck,
  LuClock,
  LuGrip,
  LuTriangleAlert,
  LuUserMinus,
  LuX,
} from "react-icons/lu"
import { usePlan } from "@/components/PlanProvider"
import {
  GUEST_BY_ID,
  GUESTS,
  PARTY_PALETTE,
  TABLE_BY_ID,
  TABLES,
  type Guest,
} from "@/lib/data"
import type { RuleResult } from "@/lib/plan"

const KIND_LABEL = { together: "Keep together", apart: "Keep apart", near: "Seat near" } as const

/* ------------------------------------------------------------------ stats */

function Stat({ label, value, hint, tone }: { label: string; value: React.ReactNode; hint?: string; tone?: "red" | "green" }) {
  return (
    <Box bg="bg.panel" borderWidth="1px" borderColor="border" rounded="xl" px="4" py="3" minW="0">
      <Text fontSize="xs" color="fg.muted" fontWeight="medium" textTransform="uppercase" letterSpacing="0.04em">
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight="semibold" lineHeight="1.2" color={tone ? `${tone}.fg` : "fg"} fontVariantNumeric="tabular-nums">
        {value}
      </Text>
      {hint && (
        <Text fontSize="xs" color="fg.muted" truncate>
          {hint}
        </Text>
      )}
    </Box>
  )
}

export function StatsStrip() {
  const { counts, brokenCount, rules } = usePlan()
  const waiting = rules.filter((r) => r.status === "pending").length
  return (
    <SimpleGrid columns={{ base: 2, md: 4 }} gap="3" aria-label="Seating counts" role="group">
      <Stat label="Seated" value={counts.seated} hint={`of ${counts.totalSeats} seats`} />
      <Stat
        label="To seat"
        value={counts.toSeat}
        hint={counts.unconfirmedUnseated ? `+ ${counts.unconfirmedUnseated} unconfirmed` : "attending, no seat"}
        tone={counts.toSeat === 0 ? "green" : undefined}
      />
      <Stat label="Free seats" value={counts.freeSeats} hint={`${counts.attending} guests attending`} />
      <Stat
        label="Couple's rules"
        value={brokenCount === 0 ? "All clear" : `${brokenCount} broken`}
        hint={waiting ? `${waiting} waiting for seats` : `${rules.length} checked`}
        tone={brokenCount === 0 ? "green" : "red"}
      />
    </SimpleGrid>
  )
}

/* ---------------------------------------------------------------- summary */

export function StatusBar() {
  const { heldGuest, assign, hold, unseat, notice, clearNotice, rules, selectTable, setPanel } = usePlan()
  const held = heldGuest ? GUEST_BY_ID[heldGuest] : null
  const broken = rules.filter((r) => r.status === "broken")
  const goTo = (r: RuleResult) => {
    const t = r.tableIds[0]
    if (t) {
      selectTable(t)
      setPanel("table")
    }
  }
  return (
    <Stack gap="2">
      <Box role="status" aria-live="polite">
        {held ? (
          <Flex
            bg="orange.subtle"
            color="orange.fg"
            borderWidth="1px"
            borderColor="orange.muted"
            rounded="lg"
            px="4"
            py="2.5"
            gap="3"
            align="center"
            wrap="wrap"
          >
            <LuGrip aria-hidden="true" />
            <Text flex="1" minW="200px" fontSize="sm">
              <b>{held.name}</b> is picked up. Tap an empty seat or a table to {assign[held.id] ? "move them" : "seat them"}, or drag them.
            </Text>
            {assign[held.id] && (
              <Button size="xs" variant="outline" colorPalette="orange" onClick={() => unseat(held.id)}>
                <LuUserMinus /> Unseat
              </Button>
            )}
            <Button size="xs" variant="solid" colorPalette="orange" onClick={() => hold(null)}>
              Cancel
            </Button>
          </Flex>
        ) : notice ? (
          <Flex
            bg={notice.tone === "warn" ? "red.subtle" : "bg.panel"}
            color={notice.tone === "warn" ? "red.fg" : "fg"}
            borderWidth="1px"
            borderColor={notice.tone === "warn" ? "red.muted" : "border"}
            rounded="lg"
            px="4"
            py="2.5"
            gap="3"
            align="center"
          >
            {notice.tone === "warn" ? <LuTriangleAlert aria-hidden="true" /> : <LuCircleCheck aria-hidden="true" />}
            <Text flex="1" fontSize="sm">
              {notice.text}
            </Text>
            <Button size="xs" variant="ghost" aria-label="Dismiss message" onClick={clearNotice}>
              <LuX />
            </Button>
          </Flex>
        ) : null}
      </Box>
      {broken.length > 0 && (
        <Box bg="red.subtle" borderWidth="1px" borderColor="red.muted" rounded="lg" px="4" py="3" role="group" aria-label="Broken rules">
          <HStack color="red.fg" gap="2" mb="1">
            <LuTriangleAlert aria-hidden="true" />
            <Text fontSize="sm" fontWeight="semibold">
              {broken.length} {broken.length === 1 ? "rule is" : "rules are"} broken
            </Text>
          </HStack>
          <Stack as="ul" gap="1" listStyleType="none" m="0" p="0">
            {broken.map((r) => (
              <Box as="li" key={r.index} fontSize="sm">
                <Button
                  variant="plain"
                  size="sm"
                  h="auto"
                  minH="8"
                  p="0"
                  textAlign="start"
                  whiteSpace="normal"
                  fontWeight="normal"
                  color="fg"
                  justifyContent="flex-start"
                  onClick={() => goTo(r)}
                  aria-label={`${r.title}: ${r.detail}. Show table`}
                >
                  <Text as="span">
                    <b>{r.title}</b> · {r.detail}
                  </Text>
                </Button>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  )
}

/* ------------------------------------------------------------------ chips */

function DietBadge({ diet }: { diet: string }) {
  return (
    <Badge size="sm" variant="subtle" colorPalette="orange" flexShrink={0}>
      {diet}
    </Badge>
  )
}

function GuestChip({ guest }: { guest: Guest }) {
  const { heldGuest, hold, setDragging, brokenGuests } = usePlan()
  const isHeld = heldGuest === guest.id
  const palette = PARTY_PALETTE[guest.party] ?? "gray"
  const flagged = brokenGuests.has(guest.id)
  const toggle = () => hold(isHeld ? null : guest.id)
  return (
    <Flex
      role="button"
      tabIndex={0}
      aria-pressed={isHeld}
      draggable
      onDragStart={(e: React.DragEvent) => {
        e.dataTransfer.setData("text/plain", guest.id)
        e.dataTransfer.effectAllowed = "move"
        setDragging(guest.id)
      }}
      onDragEnd={() => setDragging(null)}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          toggle()
        }
      }}
      align="center"
      gap="3"
      px="3"
      minH="12"
      py="1.5"
      rounded="lg"
      borderWidth="1px"
      borderColor={isHeld ? "orange.solid" : flagged ? "red.muted" : "border"}
      bg={isHeld ? "orange.subtle" : "bg.panel"}
      cursor="grab"
      userSelect="none"
      _hover={{ borderColor: "orange.solid" }}
      _focusVisible={{ outline: "3px solid", outlineColor: "orange.focusRing", outlineOffset: "2px" }}
    >
      <Box boxSize="10px" rounded="full" colorPalette={palette} bg="colorPalette.700" flexShrink={0} />
      <Box flex="1" minW="0">
        <Text fontSize="sm" fontWeight="medium" truncate>
          {guest.name}
        </Text>
        <Text fontSize="xs" color="fg.muted" truncate>
          {guest.party}
        </Text>
      </Box>
      {guest.diet && <DietBadge diet={guest.diet} />}
    </Flex>
  )
}

/* ------------------------------------------------------------------ panes */

function ToSeatPane() {
  const { assign, unseat, draggingGuest, setDragging } = usePlan()
  const [over, setOver] = React.useState(false)
  const toSeat = GUESTS.filter((g) => g.rsvp === "yes" && !assign[g.id])
  const unconfirmed = GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !assign[g.id])
  const canDropHere = !!draggingGuest && !!assign[draggingGuest]
  return (
    <Stack
      gap="5"
      onDragOver={(e) => {
        if (canDropHere) {
          e.preventDefault()
          setOver(true)
        }
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        const id = e.dataTransfer.getData("text/plain") || draggingGuest
        setDragging(null)
        if (id) unseat(id)
      }}
      outlineWidth={over ? "2px" : "0"}
      outlineStyle="dashed"
      outlineColor="orange.solid"
      outlineOffset="4px"
      rounded="lg"
    >
      <Stack gap="2">
        <Text fontSize="sm" color="fg.muted">
          Attending guests without a seat. Pick one up and tap a seat, or drag them onto the plan.
          {canDropHere ? " Drop here to unseat." : ""}
        </Text>
        {toSeat.length === 0 ? (
          <Flex align="center" gap="2" bg="green.subtle" color="green.fg" rounded="lg" px="3" py="3" fontSize="sm">
            <LuCircleCheck aria-hidden="true" /> Everyone attending has a seat.
          </Flex>
        ) : (
          <Stack as="ul" gap="2" listStyleType="none" m="0" p="0" aria-label="Attending guests without a seat">
            {toSeat.map((g) => (
              <li key={g.id}>
                <GuestChip guest={g} />
              </li>
            ))}
          </Stack>
        )}
      </Stack>
      {unconfirmed.length > 0 && (
        <Stack gap="2">
          <Heading as="h2" size="sm">
            Not confirmed yet
          </Heading>
          <Text fontSize="xs" color="fg.muted">
            Maybe or no reply. You can pencil them in.
          </Text>
          <Stack as="ul" gap="2" listStyleType="none" m="0" p="0" aria-label="Unconfirmed guests without a seat">
            {unconfirmed.map((g) => (
              <li key={g.id}>
                <GuestChip guest={g} />
              </li>
            ))}
          </Stack>
        </Stack>
      )}
    </Stack>
  )
}

function TablePane() {
  const { selectedTable, seats, counts, brokenByTable, heldGuest, hold, place, unseat } = usePlan()
  const table = selectedTable ? TABLE_BY_ID[selectedTable] : null
  if (!table) {
    return (
      <Flex direction="column" align="center" textAlign="center" gap="2" py="8" color="fg.muted">
        <LuArmchair size={28} aria-hidden="true" />
        <Text fontSize="sm" maxW="260px">
          Select a table on the plan to see who sits there and what they eat.
        </Text>
        <Stack gap="1.5" mt="2" w="full">
          {TABLES.map((t) => (
            <TableLink key={t.id} id={t.id} />
          ))}
        </Stack>
      </Flex>
    )
  }
  const row = seats[table.id] ?? []
  const broken = brokenByTable[table.id] ?? []
  const diets: Record<string, number> = {}
  for (const gid of row) {
    const d = gid ? GUEST_BY_ID[gid]?.diet : null
    if (d) diets[d] = (diets[d] ?? 0) + 1
  }
  return (
    <Stack gap="4">
      <Flex align="baseline" justify="space-between" gap="2">
        <Heading as="h2" size="md">
          {table.name}
        </Heading>
        <Text fontSize="sm" color="fg.muted" fontVariantNumeric="tabular-nums">
          {counts.perTable[table.id]} of {table.seats} seats
        </Text>
      </Flex>
      {broken.map((r) => (
        <Flex key={r.index} gap="2" bg="red.subtle" color="red.fg" rounded="md" px="3" py="2" fontSize="sm" align="flex-start">
          <Box mt="0.5">
            <LuTriangleAlert aria-hidden="true" />
          </Box>
          <Text>
            <b>{KIND_LABEL[r.rule.kind]}:</b> {r.detail}
          </Text>
        </Flex>
      ))}
      <Box>
        <Text fontSize="xs" fontWeight="medium" color="fg.muted" textTransform="uppercase" letterSpacing="0.04em" mb="1.5">
          Dietary needs at this table
        </Text>
        {Object.keys(diets).length === 0 ? (
          <Text fontSize="sm" color="fg.muted">
            None noted.
          </Text>
        ) : (
          <Flex gap="1.5" wrap="wrap">
            {Object.entries(diets).map(([d, n]) => (
              <Badge key={d} colorPalette="orange" variant="subtle" size="md">
                {n} × {d}
              </Badge>
            ))}
          </Flex>
        )}
      </Box>
      <Stack as="ol" gap="1.5" listStyleType="none" m="0" p="0" aria-label={`Seats at ${table.name}`}>
        {row.map((gid, i) => {
          const guest = gid ? GUEST_BY_ID[gid] : null
          const isHeld = !!gid && gid === heldGuest
          return (
            <Flex
              as="li"
              key={i}
              align="center"
              gap="3"
              minH="12"
              px="3"
              py="1.5"
              rounded="lg"
              borderWidth="1px"
              borderStyle={guest ? "solid" : "dashed"}
              borderColor={isHeld ? "orange.solid" : "border"}
              bg={isHeld ? "orange.subtle" : guest ? "bg.panel" : "transparent"}
            >
              <Text fontSize="xs" color="fg.muted" w="4" textAlign="end" fontVariantNumeric="tabular-nums">
                {i + 1}
              </Text>
              {guest ? (
                <>
                  <Box boxSize="10px" rounded="full" colorPalette={PARTY_PALETTE[guest.party] ?? "gray"} bg="colorPalette.solid" flexShrink={0} />
                  <Box flex="1" minW="0">
                    <Text fontSize="sm" fontWeight="medium" truncate>
                      {guest.name}
                    </Text>
                    <Text fontSize="xs" color="fg.muted" truncate>
                      {guest.party}
                    </Text>
                  </Box>
                  {guest.diet && <DietBadge diet={guest.diet} />}
                  <Button
                    size="xs"
                    variant={isHeld ? "solid" : "outline"}
                    colorPalette={isHeld ? "orange" : "gray"}
                    onClick={() => hold(isHeld ? null : guest.id)}
                    aria-label={`${isHeld ? "Put down" : "Move"} ${guest.name}`}
                    aria-pressed={isHeld}
                  >
                    {isHeld ? "Cancel" : "Move"}
                  </Button>
                  <Button size="xs" variant="ghost" onClick={() => unseat(guest.id)} aria-label={`Unseat ${guest.name}`}>
                    <LuUserMinus />
                  </Button>
                </>
              ) : (
                <>
                  <Text flex="1" fontSize="sm" color="fg.muted">
                    Empty seat
                  </Text>
                  {heldGuest && (
                    <Button size="xs" colorPalette="orange" onClick={() => place(heldGuest, table.id, i)} aria-label={`Place ${GUEST_BY_ID[heldGuest]?.name} in seat ${i + 1}`}>
                      Place here
                    </Button>
                  )}
                </>
              )}
            </Flex>
          )
        })}
      </Stack>
    </Stack>
  )
}

function TableLink({ id }: { id: string }) {
  const { counts, selectTable, brokenByTable } = usePlan()
  const t = TABLE_BY_ID[id]
  if (!t) return null
  return (
    <Button
      variant="outline"
      size="sm"
      justifyContent="space-between"
      onClick={() => selectTable(id)}
      aria-label={`${t.name}, ${counts.perTable[id]} of ${t.seats} seats${brokenByTable[id] ? ", rule broken" : ""}`}
    >
      <Text as="span">{t.name}</Text>
      <HStack gap="2">
        {brokenByTable[id] && <LuTriangleAlert color="var(--chakra-colors-red-solid)" aria-hidden="true" />}
        <Text as="span" color="fg.muted" fontVariantNumeric="tabular-nums">
          {counts.perTable[id]}/{t.seats}
        </Text>
      </HStack>
    </Button>
  )
}

function RulesPane() {
  const { rules, selectTable, setPanel } = usePlan()
  const order = { broken: 0, pending: 1, ok: 2 } as const
  const sorted = [...rules].sort((a, b) => order[a.status] - order[b.status])
  return (
    <Stack as="ul" gap="2" listStyleType="none" m="0" p="0" aria-label="Couple's rules">
      {sorted.map((r) => {
        const color = r.status === "broken" ? "red" : r.status === "ok" ? "green" : "gray"
        const Icon = r.status === "broken" ? LuTriangleAlert : r.status === "ok" ? LuCircleCheck : LuClock
        const word = r.status === "broken" ? "Broken" : r.status === "ok" ? "Kept" : "Waiting"
        const t = r.tableIds[0]
        return (
          <li key={r.index}>
            <Box
              borderWidth="1px"
              borderColor={r.status === "broken" ? "red.muted" : "border"}
              bg={r.status === "broken" ? "red.subtle" : "bg.panel"}
              rounded="lg"
              px="3"
              py="2.5"
            >
              <Flex gap="2" align="center" mb="1" wrap="wrap">
                <Badge colorPalette={color} variant="subtle" size="sm">
                  <Icon aria-hidden="true" /> {word}
                </Badge>
                <Text fontSize="xs" color="fg.muted">
                  {KIND_LABEL[r.rule.kind]}
                </Text>
              </Flex>
              <Text fontSize="sm" fontWeight="medium">
                {r.title}
              </Text>
              <Text fontSize="sm" color="fg.muted">
                {r.detail}
              </Text>
              <Text fontSize="xs" color="fg.subtle" mt="0.5">
                Note: {r.rule.note}
              </Text>
              {t && (
                <Button
                  mt="1.5"
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    selectTable(t)
                    setPanel("table")
                  }}
                >
                  Show {r.tableIds.length > 1 ? "tables" : (TABLE_BY_ID[t]?.name ?? "table")}
                </Button>
              )}
            </Box>
          </li>
        )
      })}
    </Stack>
  )
}

export function SidePanel() {
  const { panel, setPanel, counts, brokenCount, selectedTable } = usePlan()
  return (
    <Box bg="bg.panel" borderWidth="1px" borderColor="border" rounded="xl" p={{ base: "3", md: "4" }} minW="0">
      <Tabs.Root value={panel} onValueChange={(e) => setPanel(e.value as typeof panel)} variant="line" size="sm" fitted>
        <Tabs.List mb="4">
          <Tabs.Trigger value="seat">
            To seat
            <Badge size="sm" variant="subtle" colorPalette={counts.toSeat ? "orange" : "green"}>
              {counts.toSeat}
            </Badge>
          </Tabs.Trigger>
          <Tabs.Trigger value="table">
            {selectedTable ? (TABLE_BY_ID[selectedTable]?.name ?? "Table") : "Table"}
          </Tabs.Trigger>
          <Tabs.Trigger value="rules">
            Rules
            <Badge size="sm" variant="subtle" colorPalette={brokenCount ? "red" : "green"}>
              {brokenCount ? brokenCount : "ok"}
            </Badge>
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="seat" p="0">
          <ToSeatPane />
        </Tabs.Content>
        <Tabs.Content value="table" p="0">
          <TablePane />
        </Tabs.Content>
        <Tabs.Content value="rules" p="0">
          <RulesPane />
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  )
}
