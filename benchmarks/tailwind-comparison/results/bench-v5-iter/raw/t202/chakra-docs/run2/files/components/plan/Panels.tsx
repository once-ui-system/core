"use client"

import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Menu,
  Portal,
  Text,
} from "@chakra-ui/react"
import * as React from "react"
import {
  LuCircleCheck,
  LuCircleDashed,
  LuPlus,
  LuTriangleAlert,
  LuX,
} from "react-icons/lu"
import { GUESTS_BY_ID, TABLES, TABLES_BY_ID } from "@/lib/data"
import type { RuleResult } from "@/lib/rules"
import { DietTag, GuestRow } from "./parts"
import { usePlan } from "./store"

function sortByParty(ids: string[]): string[] {
  return ids.slice().sort((a, b) => {
    const ga = GUESTS_BY_ID[a]
    const gb = GUESTS_BY_ID[b]
    return ga.party.localeCompare(gb.party) || ga.name.localeCompare(gb.name)
  })
}

export function UnseatedPanel() {
  const { unseatedAttending, unseatedOther } = usePlan()
  return (
    <Flex
      direction="column"
      gap="4"
      data-drop="unseat"
      minH="16rem"
      aria-label="Unseated guests"
    >
      <Text fontSize="sm" color="fg.muted">
        Drag a guest onto a seat, or tap a guest and then a seat or table. The Seat menu on
        each row works from the keyboard. Drop a seated guest here to unseat them.
      </Text>

      <Box as="section" aria-labelledby="unseated-attending">
        <Flex align="center" justify="space-between" mb="2">
          <Heading as="h2" id="unseated-attending" size="sm">
            Attending, no seat yet
          </Heading>
          <Badge colorPalette={unseatedAttending.length ? "orange" : "green"} variant="subtle">
            {unseatedAttending.length}
          </Badge>
        </Flex>
        {unseatedAttending.length === 0 ? (
          <Flex
            align="center"
            gap="2"
            p="3"
            rounded="lg"
            bg="green.subtle"
            color="green.fg"
            fontSize="sm"
          >
            <LuCircleCheck aria-hidden /> Everyone attending has a seat.
          </Flex>
        ) : (
          <Flex as="ul" listStyleType="none" direction="column" gap="1.5">
            {sortByParty(unseatedAttending).map((id) => (
              <li key={id}>
                <GuestRow guestId={id} menuLabel="Seat at" />
              </li>
            ))}
          </Flex>
        )}
      </Box>

      {unseatedOther.length > 0 && (
        <Box as="section" aria-labelledby="unseated-other">
          <Flex align="center" justify="space-between" mb="1">
            <Heading as="h2" id="unseated-other" size="sm">
              Not confirmed yet
            </Heading>
            <Badge variant="subtle">{unseatedOther.length}</Badge>
          </Flex>
          <Text fontSize="xs" color="fg.muted" mb="2">
            Maybe or no reply. They can hold a seat; they are not counted as attending.
          </Text>
          <Flex as="ul" listStyleType="none" direction="column" gap="1.5">
            {sortByParty(unseatedOther).map((id) => (
              <li key={id}>
                <GuestRow guestId={id} menuLabel="Seat at" showRsvp />
              </li>
            ))}
          </Flex>
        </Box>
      )}
    </Flex>
  )
}

function FillMenu({ tableId, seat }: { tableId: string; seat: number }) {
  const { unseatedAttending, unseatedOther, place } = usePlan()
  const all = [...sortByParty(unseatedAttending), ...sortByParty(unseatedOther)]
  return (
    <Menu.Root
      positioning={{ placement: "bottom-end" }}
      onSelect={(d) => place(d.value, tableId, seat)}
    >
      <Menu.Trigger asChild>
        <Button size="xs" variant="outline" disabled={all.length === 0}>
          <LuPlus /> Seat a guest
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content maxH="18rem" overflowY="auto" minW="14rem">
            {all.map((id) => (
              <Menu.Item key={id} value={id}>
                <Text flex="1">{GUESTS_BY_ID[id].name}</Text>
                <Text fontSize="xs" color="fg.muted">
                  {GUESTS_BY_ID[id].party}
                </Text>
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}

export function RuleItem({
  r,
  onSelect,
}: {
  r: RuleResult
  onSelect?: (tableId: string) => void
}) {
  const icon =
    r.status === "broken" ? (
      <LuTriangleAlert aria-hidden />
    ) : r.status === "ok" ? (
      <LuCircleCheck aria-hidden />
    ) : (
      <LuCircleDashed aria-hidden />
    )
  const palette = r.status === "broken" ? "red" : r.status === "ok" ? "green" : "gray"
  const word = r.status === "broken" ? "Broken" : r.status === "ok" ? "Kept" : "Open"
  return (
    <Flex
      gap="3"
      p="3"
      rounded="lg"
      borderWidth="1px"
      borderColor={r.status === "broken" ? "red.muted" : "border"}
      bg={r.status === "broken" ? "red.subtle" : "bg.panel"}
      align="flex-start"
    >
      <Box mt="0.5" color={`${palette}.fg`} fontSize="lg" flexShrink={0}>
        {icon}
      </Box>
      <Box flex="1" minW="0">
        <Flex gap="2" align="center" wrap="wrap">
          <Text fontWeight="semibold" fontSize="sm">
            {r.title}
          </Text>
          <Badge colorPalette={palette} variant="subtle" size="sm">
            {word}
          </Badge>
        </Flex>
        <Text fontSize="sm" mt="0.5">
          {r.detail}
        </Text>
        <Text fontSize="xs" color="fg.muted" mt="0.5">
          {r.rule.note}
        </Text>
        {onSelect && r.involved.length > 0 && (
          <Flex gap="1.5" mt="2" wrap="wrap">
            {r.involved.map((tid) => (
              <Button key={tid} size="2xs" variant="outline" onClick={() => onSelect(tid)}>
                Show {TABLES_BY_ID[tid].name}
              </Button>
            ))}
          </Flex>
        )}
      </Box>
    </Flex>
  )
}

export function RulesPanel() {
  const { rules, selectTable } = usePlan()
  const ordered = [...rules].sort((a, b) => {
    const rank = { broken: 0, open: 1, ok: 2 } as const
    return rank[a.status] - rank[b.status]
  })
  return (
    <Flex direction="column" gap="2">
      <Text fontSize="sm" color="fg.muted">
        The couple&apos;s rules, checked after every change. A broken rule is flagged on the
        tables involved.
      </Text>
      {ordered.map((r) => (
        <RuleItem
          key={r.id}
          r={r}
          onSelect={r.involved.length ? (tid) => selectTable(tid) : undefined}
        />
      ))}
    </Flex>
  )
}

export function TablePanel() {
  const { selectedTable, selectTable, seats, rules, picked, pick, place, tableOf } = usePlan()

  if (!selectedTable) {
    return (
      <Flex direction="column" gap="3">
        <Text fontSize="sm" color="fg.muted">
          Select a table on the plan, or here, to see who sits there and what they eat.
        </Text>
        <Flex as="ul" listStyleType="none" direction="column" gap="1.5">
          {TABLES.map((t) => {
            const n = seats[t.id].filter(Boolean).length
            return (
              <li key={t.id}>
                <Button
                  w="full"
                  justifyContent="space-between"
                  variant="outline"
                  onClick={() => selectTable(t.id)}
                >
                  {t.name}
                  <Text as="span" color="fg.muted" fontSize="sm">
                    {n}/{t.seats} seated
                  </Text>
                </Button>
              </li>
            )
          })}
        </Flex>
      </Flex>
    )
  }

  const table = TABLES_BY_ID[selectedTable]
  const row = seats[selectedTable]
  const filled = row.filter(Boolean).length
  const guests = row.filter((x): x is string => x !== null).map((id) => GUESTS_BY_ID[id])
  const dietary = guests.filter((g) => g.diet)
  const related = rules.filter(
    (r) => r.tables.includes(selectedTable) || r.involved.includes(selectedTable),
  )

  return (
    <Flex direction="column" gap="4">
      <Flex align="flex-start" justify="space-between" gap="2">
        <Box>
          <Heading as="h2" size="md">
            {table.name}
          </Heading>
          <Text fontSize="sm" color="fg.muted">
            {filled} of {table.seats} seats filled ·{" "}
            {table.seats - filled === 0 ? "full" : `${table.seats - filled} free`}
          </Text>
        </Box>
        <IconButton
          size="sm"
          variant="ghost"
          aria-label="Clear table selection"
          onClick={() => selectTable(null)}
        >
          <LuX />
        </IconButton>
      </Flex>

      {picked && (
        <Button
          colorPalette="brand"
          onClick={() => place(picked, table.id)}
          disabled={filled >= table.seats}
        >
          Seat {GUESTS_BY_ID[picked].name.split(" ")[0]} here
        </Button>
      )}

      <Box as="section" aria-labelledby="diet-heading">
        <Heading as="h3" id="diet-heading" size="xs" textTransform="uppercase" letterSpacing="0.06em" color="fg.muted" mb="2">
          Dietary needs
        </Heading>
        {dietary.length === 0 ? (
          <Text fontSize="sm" color="fg.muted">
            No dietary needs at this table.
          </Text>
        ) : (
          <Flex as="ul" listStyleType="none" direction="column" gap="1">
            {dietary.map((g) => (
              <Flex as="li" key={g.id} justify="space-between" gap="3" fontSize="sm">
                <Text>{g.name}</Text>
                <DietTag diet={g.diet as string} />
              </Flex>
            ))}
          </Flex>
        )}
      </Box>

      {related.length > 0 && (
        <Box as="section" aria-labelledby="table-rules">
          <Heading as="h3" id="table-rules" size="xs" textTransform="uppercase" letterSpacing="0.06em" color="fg.muted" mb="2">
            Rules involving this table
          </Heading>
          <Flex direction="column" gap="1.5">
            {related.map((r) => (
              <RuleItem key={r.id} r={r} />
            ))}
          </Flex>
        </Box>
      )}

      <Box as="section" aria-labelledby="seat-heading">
        <Heading as="h3" id="seat-heading" size="xs" textTransform="uppercase" letterSpacing="0.06em" color="fg.muted" mb="2">
          Seats
        </Heading>
        <Flex as="ul" listStyleType="none" direction="column" gap="1.5">
          {row.map((gid, i) => (
            <Flex
              as="li"
              key={i}
              align="center"
              gap="2"
              data-drop="seat"
              data-table={table.id}
              data-seat={i}
            >
              <Text
                w="5"
                flexShrink={0}
                textAlign="center"
                fontSize="xs"
                color="fg.muted"
                aria-hidden
              >
                {i + 1}
              </Text>
              <Box flex="1" minW="0">
                {gid ? (
                  <GuestRow guestId={gid} menuLabel="Move" />
                ) : (
                  <Flex
                    align="center"
                    justify="space-between"
                    gap="2"
                    px="3"
                    py="2"
                    rounded="lg"
                    borderWidth="1px"
                    borderStyle="dashed"
                    borderColor="border.emphasized"
                  >
                    <Text fontSize="sm" color="fg.muted">
                      Empty seat
                    </Text>
                    {picked ? (
                      <Button size="xs" colorPalette="brand" onClick={() => place(picked, table.id, i)}>
                        Place here
                      </Button>
                    ) : (
                      <FillMenu tableId={table.id} seat={i} />
                    )}
                  </Flex>
                )}
              </Box>
            </Flex>
          ))}
        </Flex>
        {picked && tableOf[picked] === table.id && (
          <Button mt="2" size="xs" variant="ghost" onClick={() => pick(null)}>
            Cancel move
          </Button>
        )}
      </Box>
    </Flex>
  )
}
