"use client"

import { Badge, Box, Flex, HStack, IconButton, Stack, Text, chakra } from "@chakra-ui/react"
import * as React from "react"
import { LuCircleCheck, LuClock, LuGripVertical, LuTriangleAlert, LuUserMinus } from "react-icons/lu"
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select"
import { DietBadge, PartyDot, RsvpBadge, dietPalette } from "@/components/GuestBits"
import { TABLES, type Guest, type Table } from "@/lib/data"
import {
  RULE_KIND_LABEL,
  guestById,
  occupants,
  tableOptions,
  type Placements,
  type RuleResult,
} from "@/lib/seating"

const Btn = chakra("button")

interface PlaceHandlers {
  pickedId: string | null
  onPick: (id: string) => void
  onDragGuest: (id: string | null) => void
  onPlace: (guestId: string, tableId: string, seat?: number) => void
  onUnseat: (guestId: string) => void
}

function startDrag(e: React.DragEvent, id: string, onDragGuest: (id: string | null) => void) {
  e.dataTransfer.setData("text/plain", id)
  e.dataTransfer.effectAllowed = "move"
  onDragGuest(id)
}

/* ---------------------------------- To place ---------------------------------- */

function PlaceRow({
  guest,
  placements,
  handlers,
}: {
  guest: Guest
  placements: Placements
  handlers: PlaceHandlers
}) {
  const picked = handlers.pickedId === guest.id
  return (
    <Flex
      draggable
      onDragStart={(e: React.DragEvent) => startDrag(e, guest.id, handlers.onDragGuest)}
      onDragEnd={() => handlers.onDragGuest(null)}
      align="center"
      gap="2"
      p="2"
      borderWidth="1px"
      borderRadius="lg"
      bg={picked ? "teal.subtle" : "bg.panel"}
      borderColor={picked ? "teal.solid" : "border"}
    >
      <Btn
        type="button"
        onClick={() => handlers.onPick(guest.id)}
        aria-pressed={picked}
        flex="1"
        minW="0"
        textAlign="left"
        display="flex"
        alignItems="center"
        gap="2"
        cursor="grab"
        borderRadius="md"
        _focusVisible={{ outline: "2px solid", outlineColor: "teal.focusRing" }}
      >
        <Box as="span" color="fg.subtle" aria-hidden>
          <LuGripVertical />
        </Box>
        <Box minW="0">
          <Text fontWeight="medium" fontSize="sm" truncate>
            {guest.name}
          </Text>
          <HStack gap="1.5" wrap="wrap" mt="0.5">
            <PartyDot party={guest.party} />
            <Text fontSize="xs" color="fg.muted">
              {guest.party}
            </Text>
            {guest.rsvp !== "yes" && <RsvpBadge rsvp={guest.rsvp} />}
            <DietBadge diet={guest.diet} />
          </HStack>
        </Box>
      </Btn>
      <NativeSelectRoot size="xs" w="118px" flexShrink={0}>
        <NativeSelectField
          aria-label={`Seat ${guest.name} at`}
          placeholder="Seat at…"
          value=""
          items={tableOptions(placements, guest.id)}
          onChange={(e) => {
            const v = e.currentTarget.value
            if (v) handlers.onPlace(guest.id, v)
          }}
        />
      </NativeSelectRoot>
    </Flex>
  )
}

export function ToPlaceList({
  toPlace,
  awaiting,
  placements,
  handlers,
  dragId,
}: {
  toPlace: Guest[]
  awaiting: Guest[]
  placements: Placements
  handlers: PlaceHandlers
  dragId: string | null
}) {
  const [over, setOver] = React.useState(false)
  const dragged = dragId ? placements[dragId] : null
  return (
    <Stack
      gap="3"
      onDragOver={(e: React.DragEvent) => {
        if (dragId && dragged) {
          e.preventDefault()
          setOver(true)
        }
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e: React.DragEvent) => {
        e.preventDefault()
        setOver(false)
        const id = e.dataTransfer.getData("text/plain") || dragId
        if (id && guestById.has(id)) handlers.onUnseat(id)
      }}
      borderRadius="lg"
      outline={over ? "2px dashed" : undefined}
      outlineColor="teal.solid"
      outlineOffset="2px"
    >
      <Text fontSize="xs" color="fg.muted">
        Drag a guest onto a seat or table, or tap a guest and then a seat. Drag a seated guest here to unseat them.
      </Text>
      <Box>
        <Text fontSize="sm" fontWeight="semibold" mb="2">
          Attending, no seat yet ({toPlace.length})
        </Text>
        {toPlace.length === 0 ? (
          <Flex align="center" gap="2" p="3" borderRadius="lg" bg="green.subtle" color="green.fg" fontSize="sm">
            <LuCircleCheck aria-hidden /> Everyone attending has a seat.
          </Flex>
        ) : (
          <Stack gap="2" as="ul" listStyleType="none" m="0" p="0">
            {toPlace.map((g) => (
              <li key={g.id}>
                <PlaceRow guest={g} placements={placements} handlers={handlers} />
              </li>
            ))}
          </Stack>
        )}
      </Box>
      {awaiting.length > 0 && (
        <Box>
          <Text fontSize="sm" fontWeight="semibold" mb="1">
            Not confirmed ({awaiting.length})
          </Text>
          <Text fontSize="xs" color="fg.muted" mb="2">
            Maybe or no reply yet. Seat them now if you want to hold a place.
          </Text>
          <Stack gap="2" as="ul" listStyleType="none" m="0" p="0">
            {awaiting.map((g) => (
              <li key={g.id}>
                <PlaceRow guest={g} placements={placements} handlers={handlers} />
              </li>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  )
}

/** Compact version for narrow screens, shown above the plan so guests can be dragged onto it. */
export function ToPlaceStrip({
  toPlace,
  awaiting,
  handlers,
  dragId,
  placements,
}: {
  toPlace: Guest[]
  awaiting: Guest[]
  handlers: PlaceHandlers
  dragId: string | null
  placements: Placements
}) {
  const all = [...toPlace, ...awaiting]
  const [over, setOver] = React.useState(false)
  const dragged = dragId ? placements[dragId] : null
  return (
    <Box
      mb="3"
      p="2"
      bg="bg.panel"
      borderWidth="1px"
      borderRadius="xl"
      borderColor={over ? "teal.solid" : "border"}
      onDragOver={(e: React.DragEvent) => {
        if (dragId && dragged) {
          e.preventDefault()
          setOver(true)
        }
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e: React.DragEvent) => {
        e.preventDefault()
        setOver(false)
        const id = e.dataTransfer.getData("text/plain") || dragId
        if (id && guestById.has(id)) handlers.onUnseat(id)
      }}
    >
      <Text fontSize="xs" fontWeight="semibold" color="fg.muted" mb="1.5">
        To place ({toPlace.length}){awaiting.length ? ` + ${awaiting.length} not confirmed` : ""}. Drag onto the plan, or tap a name and then a seat.
      </Text>
      {all.length === 0 ? (
        <Text fontSize="sm" color="green.fg">
          Everyone has a seat.
        </Text>
      ) : (
        <Flex gap="2" overflowX="auto" pb="1" as="ul" listStyleType="none" m="0" p="0">
          {all.map((g) => {
            const picked = handlers.pickedId === g.id
            return (
              <li key={g.id}>
                <Btn
                  type="button"
                  draggable
                  onDragStart={(e: React.DragEvent) => startDrag(e, g.id, handlers.onDragGuest)}
                  onDragEnd={() => handlers.onDragGuest(null)}
                  onClick={() => handlers.onPick(g.id)}
                  aria-pressed={picked}
                  display="inline-flex"
                  alignItems="center"
                  gap="1.5"
                  whiteSpace="nowrap"
                  px="3"
                  h="10"
                  borderRadius="full"
                  borderWidth="1px"
                  fontSize="sm"
                  bg={picked ? "teal.subtle" : "bg.muted"}
                  borderColor={picked ? "teal.solid" : "border"}
                  opacity={g.rsvp === "yes" ? 1 : 0.75}
                  _focusVisible={{ outline: "2px solid", outlineColor: "teal.focusRing" }}
                >
                  <PartyDot party={g.party} />
                  {g.name}
                  {g.diet && <Box aria-label={g.diet} w="2" h="2" borderRadius="full" bg="orange.solid" />}
                </Btn>
              </li>
            )
          })}
        </Flex>
      )}
    </Box>
  )
}

/* ---------------------------------- Tables ---------------------------------- */

export function TableList({
  placements,
  selectedTable,
  broken,
  onSelect,
}: {
  placements: Placements
  selectedTable: string | null
  broken: Record<string, RuleResult[]>
  onSelect: (id: string) => void
}) {
  return (
    <Stack gap="2" as="ul" listStyleType="none" m="0" p="0">
      {TABLES.map((t) => {
        const filled = occupants(placements, t).filter(Boolean).length
        const bad = broken[t.id]?.length ?? 0
        return (
          <li key={t.id}>
            <Btn
              type="button"
              onClick={() => onSelect(t.id)}
              aria-pressed={selectedTable === t.id}
              w="100%"
              display="flex"
              alignItems="center"
              gap="3"
              p="3"
              borderWidth="1px"
              borderRadius="lg"
              textAlign="left"
              bg={selectedTable === t.id ? "teal.subtle" : "bg.panel"}
              borderColor={bad ? "red.solid" : "border"}
              _focusVisible={{ outline: "2px solid", outlineColor: "teal.focusRing" }}
            >
              <Text fontWeight="medium" flex="1">
                {t.name}
              </Text>
              {bad > 0 && (
                <Badge colorPalette="red" variant="solid" size="sm">
                  {bad} broken
                </Badge>
              )}
              <Text fontSize="sm" color={filled === t.seats ? "green.fg" : "fg.muted"}>
                {filled}/{t.seats} seats
              </Text>
            </Btn>
          </li>
        )
      })}
    </Stack>
  )
}

export function TableDetail({
  table,
  placements,
  bad,
  handlers,
  onBack,
}: {
  table: Table
  placements: Placements
  bad: RuleResult[]
  handlers: PlaceHandlers
  onBack: () => void
}) {
  const occ = occupants(placements, table)
  const guests = occ.flatMap((id) => (id ? [guestById.get(id)!] : []))
  const dietCounts = new Map<string, number>()
  for (const g of guests) if (g.diet) dietCounts.set(g.diet, (dietCounts.get(g.diet) ?? 0) + 1)
  const free = table.seats - guests.length

  return (
    <Stack gap="3">
      <Flex align="center" justify="space-between" gap="2">
        <Box>
          <Text fontWeight="semibold" fontSize="lg">
            {table.name}
          </Text>
          <Text fontSize="sm" color="fg.muted">
            {guests.length} of {table.seats} seats filled · {free} free
          </Text>
        </Box>
        <Btn
          type="button"
          onClick={onBack}
          fontSize="sm"
          color="teal.fg"
          textDecoration="underline"
          _focusVisible={{ outline: "2px solid", outlineColor: "teal.focusRing" }}
        >
          All tables
        </Btn>
      </Flex>

      {bad.map((r) => (
        <Flex key={r.index} gap="2" p="2.5" borderRadius="lg" bg="red.subtle" color="red.fg" fontSize="sm">
          <Box mt="0.5">
            <LuTriangleAlert aria-hidden />
          </Box>
          <Box>
            <Text fontWeight="medium">{r.headline}</Text>
            <Text fontSize="xs">{r.rule.note}</Text>
          </Box>
        </Flex>
      ))}

      <Box>
        <Text fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="0.04em" mb="1.5">
          Dietary needs at this table
        </Text>
        {dietCounts.size === 0 ? (
          <Text fontSize="sm" color="fg.muted">
            None given.
          </Text>
        ) : (
          <HStack gap="1.5" wrap="wrap">
            {Array.from(dietCounts.entries()).map(([d, n]) => (
              <Badge key={d} colorPalette={dietPalette(d)} variant="subtle">
                {d} × {n}
              </Badge>
            ))}
          </HStack>
        )}
      </Box>

      <Stack gap="2" as="ul" listStyleType="none" m="0" p="0">
        {occ.map((id, i) => {
          const g = id ? guestById.get(id) : undefined
          if (!g) {
            return (
              <li key={`e-${i}`}>
                <Flex align="center" gap="2" p="2" borderWidth="1px" borderStyle="dashed" borderRadius="lg" color="fg.muted" fontSize="sm">
                  <Text w="6" fontWeight="medium">
                    {i + 1}
                  </Text>
                  Empty seat
                </Flex>
              </li>
            )
          }
          const picked = handlers.pickedId === g.id
          const opts = tableOptions(placements, g.id).filter((o) => o.value !== table.id)
          return (
            <li key={g.id}>
              <Flex
                align="center"
                gap="2"
                p="2"
                borderWidth="1px"
                borderRadius="lg"
                bg={picked ? "teal.subtle" : "bg.panel"}
                borderColor={picked ? "teal.solid" : "border"}
                draggable
                onDragStart={(e: React.DragEvent) => startDrag(e, g.id, handlers.onDragGuest)}
                onDragEnd={() => handlers.onDragGuest(null)}
              >
                <Text w="6" fontSize="sm" fontWeight="medium" color="fg.muted" textAlign="center">
                  {i + 1}
                </Text>
                <Btn
                  type="button"
                  onClick={() => handlers.onPick(g.id)}
                  aria-pressed={picked}
                  flex="1"
                  minW="0"
                  textAlign="left"
                  borderRadius="md"
                  _focusVisible={{ outline: "2px solid", outlineColor: "teal.focusRing" }}
                >
                  <Text fontWeight="medium" fontSize="sm" truncate>
                    {g.name}
                  </Text>
                  <HStack gap="1.5" wrap="wrap" mt="0.5">
                    <PartyDot party={g.party} />
                    <Text fontSize="xs" color="fg.muted">
                      {g.party}
                    </Text>
                    {g.diet ? (
                      <DietBadge diet={g.diet} />
                    ) : (
                      <Text fontSize="xs" color="fg.subtle">
                        No dietary needs
                      </Text>
                    )}
                  </HStack>
                </Btn>
                <NativeSelectRoot size="xs" w="104px" flexShrink={0}>
                  <NativeSelectField
                    aria-label={`Move ${g.name} to another table`}
                    placeholder="Move to…"
                    value=""
                    items={opts}
                    onChange={(e) => {
                      const v = e.currentTarget.value
                      if (v) handlers.onPlace(g.id, v)
                    }}
                  />
                </NativeSelectRoot>
                <IconButton
                  size="xs"
                  variant="ghost"
                  aria-label={`Unseat ${g.name}`}
                  onClick={() => handlers.onUnseat(g.id)}
                >
                  <LuUserMinus />
                </IconButton>
              </Flex>
            </li>
          )
        })}
      </Stack>
    </Stack>
  )
}

/* ---------------------------------- Rules ---------------------------------- */

const STATUS_ORDER = { broken: 0, open: 1, ok: 2 } as const

export function RulesList({
  rules,
  onShow,
}: {
  rules: RuleResult[]
  onShow: (tableId: string) => void
}) {
  const sorted = [...rules].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])
  return (
    <Stack gap="2" as="ul" listStyleType="none" m="0" p="0">
      {sorted.map((r) => {
        const palette = r.status === "broken" ? "red" : r.status === "ok" ? "green" : "gray"
        return (
          <li key={r.index}>
            <Box
              colorPalette={palette}
              p="3"
              borderRadius="lg"
              borderWidth="1px"
              borderColor={r.status === "broken" ? "red.solid" : "border"}
              bg={r.status === "broken" ? "red.subtle" : "bg.panel"}
            >
              <Flex align="center" gap="2" mb="1">
                <Box color="colorPalette.fg" aria-hidden>
                  {r.status === "broken" ? <LuTriangleAlert /> : r.status === "ok" ? <LuCircleCheck /> : <LuClock />}
                </Box>
                <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="0.04em" color="colorPalette.fg">
                  {RULE_KIND_LABEL[r.rule.kind]} ·{" "}
                  {r.status === "broken" ? "Broken" : r.status === "ok" ? "Kept" : "Waiting"}
                </Text>
              </Flex>
              <Text fontSize="sm" fontWeight="medium">
                {r.headline}
              </Text>
              <Text fontSize="xs" color="fg.muted">
                {r.detail}
              </Text>
              <Text fontSize="xs" color="fg.muted" mt="1">
                Couple's note: {r.rule.note}
              </Text>
              {r.rule.dataNote && (
                <Text fontSize="xs" color="fg.muted" mt="1" fontStyle="italic">
                  {r.rule.dataNote}
                </Text>
              )}
              {r.tables.length > 0 && (
                <HStack gap="2" mt="2" wrap="wrap">
                  {r.tables.map((t) => (
                    <Btn
                      key={t}
                      type="button"
                      onClick={() => onShow(t)}
                      fontSize="xs"
                      px="2"
                      h="6"
                      borderRadius="md"
                      borderWidth="1px"
                      bg="bg.panel"
                      _hover={{ bg: "bg.muted" }}
                      _focusVisible={{ outline: "2px solid", outlineColor: "teal.focusRing" }}
                    >
                      Show {TABLES.find((x) => x.id === t)?.name}
                    </Btn>
                  ))}
                </HStack>
              )}
            </Box>
          </li>
        )
      })}
    </Stack>
  )
}
