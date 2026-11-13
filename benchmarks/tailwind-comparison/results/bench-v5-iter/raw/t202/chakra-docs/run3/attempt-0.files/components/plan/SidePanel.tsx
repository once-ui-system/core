"use client"

import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Progress,
  Stack,
  Tabs,
  Text,
  chakra,
} from "@chakra-ui/react"
import { MdCheckCircle } from "react-icons/md"
import { EmptyState } from "@/components/ui/empty-state"
import { tables } from "@/lib/data"
import { filledCount, guestById } from "@/lib/plan"
import { usePlan, type PanelTab } from "@/lib/store"
import { GuestRow } from "./GuestRow"
import { RuleCard, RulesList } from "./RulesList"

function SectionTitle({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <Flex align="center" gap="2" pt="1">
      <Heading as="h3" size="sm" fontWeight="semibold">
        {children}
      </Heading>
      {count !== undefined ? (
        <Badge variant="subtle" size="sm">
          {count}
        </Badge>
      ) : null}
    </Flex>
  )
}

function UnseatedTab() {
  const plan = usePlan()
  const { unseated, awaiting } = plan.counts
  return (
    <Stack gap="3">
      <Text fontSize="sm" color="fg.muted">
        Drag a guest onto a table, or tap a guest and then a table or seat. The menu on each guest seats
        them at any table with room.
      </Text>
      <SectionTitle count={unseated.length}>Attending, no seat yet</SectionTitle>
      {unseated.length === 0 ? (
        <EmptyState
          size="sm"
          icon={<MdCheckCircle />}
          title="Everyone attending has a seat"
          description="Drag a guest off a table to unseat them."
        />
      ) : (
        <Stack gap="2" as="ul" listStyleType="none" m="0" p="0">
          {unseated.map((g) => (
            <chakra.li key={g.id}>
              <GuestRow guest={g} />
            </chakra.li>
          ))}
        </Stack>
      )}
      {awaiting.length > 0 ? (
        <>
          <SectionTitle count={awaiting.length}>Awaiting reply</SectionTitle>
          <Text fontSize="xs" color="fg.muted">
            Not confirmed yet. You can hold a seat for them.
          </Text>
          <Stack gap="2" as="ul" listStyleType="none" m="0" p="0">
            {awaiting.map((g) => (
              <chakra.li key={g.id}>
                <GuestRow guest={g} />
              </chakra.li>
            ))}
          </Stack>
        </>
      ) : null}
    </Stack>
  )
}

function TablesOverview() {
  const plan = usePlan()
  return (
    <Stack gap="2">
      <Text fontSize="sm" color="fg.muted">
        Select a table on the plan, or here, to see who sits there and what they eat.
      </Text>
      <Stack gap="2" as="ul" listStyleType="none" m="0" p="0">
        {tables.map((t) => {
          const filled = filledCount(plan.seats[t.id])
          const flagged = plan.flaggedTables[t.id] ?? 0
          return (
            <chakra.li key={t.id}>
              <chakra.button
                type="button"
                w="100%"
                textAlign="start"
                p="3"
                borderWidth="1px"
                borderColor={flagged > 0 ? "red.emphasized" : "border"}
                borderRadius="lg"
                bg="bg.panel"
                _hover={{ bg: "bg.muted" }}
                _focusVisible={{ outline: "2px solid", outlineColor: "brand.focusRing" }}
                onClick={() => plan.selectTable(t.id)}
                aria-label={`${t.name}, ${filled} of ${t.seats} seats filled${flagged > 0 ? ", rule broken" : ""}`}
              >
                <Flex justify="space-between" align="center" mb="2" aria-hidden="true">
                  <Text as="span" fontWeight="semibold" fontSize="sm">
                    {t.name}
                  </Text>
                  <HStack as="span" gap="2">
                    {flagged > 0 ? (
                      <Badge colorPalette="red" size="xs" variant="solid">
                        Rule broken
                      </Badge>
                    ) : null}
                    <Text as="span" fontSize="sm" color="fg.muted">
                      {filled} / {t.seats}
                    </Text>
                  </HStack>
                </Flex>
                <Progress.Root
                  value={(filled / t.seats) * 100}
                  size="xs"
                  colorPalette={filled === t.seats ? "green" : "brand"}
                  aria-hidden="true"
                >
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
              </chakra.button>
            </chakra.li>
          )
        })}
      </Stack>
    </Stack>
  )
}

function TableDetail({ tableId }: { tableId: string }) {
  const plan = usePlan()
  const table = tables.find((t) => t.id === tableId)
  if (!table) return null
  const row = plan.seats[tableId] ?? []
  const filled = filledCount(row)
  const seated = row.map((gid) => (gid ? guestById[gid] : undefined))
  const dietCounts = new Map<string, number>()
  for (const g of seated) if (g?.diet) dietCounts.set(g.diet, (dietCounts.get(g.diet) ?? 0) + 1)
  const broken = plan.brokenRules.filter((r) => r.flagTables.includes(tableId))

  return (
    <Stack gap="3">
      <Flex justify="space-between" align="flex-start" gap="2">
        <Box>
          <Heading as="h3" fontFamily="heading" size="xl" fontWeight="semibold">
            {table.name}
          </Heading>
          <Text fontSize="sm" color="fg.muted">
            {filled} of {table.seats} seats filled
            {table.seats - filled > 0 ? ` · ${table.seats - filled} free` : " · full"}
          </Text>
        </Box>
        <Button size="xs" variant="ghost" onClick={() => plan.selectTable(null)}>
          All tables
        </Button>
      </Flex>

      <Progress.Root
        value={(filled / table.seats) * 100}
        size="sm"
        colorPalette={filled === table.seats ? "green" : "brand"}
        aria-label={`${table.name} is ${filled} of ${table.seats} seats filled`}
      >
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>

      {broken.map((r) => (
        <RuleCard key={r.rule.id} result={r} compact />
      ))}

      <Box borderWidth="1px" borderColor="border" borderRadius="lg" p="3" bg="bg.subtle">
        <Text fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="0.06em" mb="1.5">
          Dietary needs at this table
        </Text>
        {dietCounts.size === 0 ? (
          <Text fontSize="sm" color="fg.muted">
            None recorded.
          </Text>
        ) : (
          <HStack gap="1.5" wrap="wrap">
            {Array.from(dietCounts.entries()).map(([diet, n]) => (
              <Badge key={diet} colorPalette="yellow" variant="subtle">
                {diet}
                {n > 1 ? ` × ${n}` : ""}
              </Badge>
            ))}
          </HStack>
        )}
      </Box>

      <Stack gap="2" as="ul" listStyleType="none" m="0" p="0">
        {row.map((gid, i) => {
          const g = gid ? guestById[gid] : undefined
          return (
            <chakra.li key={i}>
              {g ? (
                <GuestRow guest={g} seatLabel={`Seat ${i + 1}`} />
              ) : (
                <chakra.button
                  type="button"
                  w="100%"
                  textAlign="start"
                  px="3"
                  py="2.5"
                  borderWidth="1px"
                  borderStyle="dashed"
                  borderColor={plan.armedGuestId ? "brand.solid" : "border.emphasized"}
                  borderRadius="lg"
                  color="fg.muted"
                  fontSize="sm"
                  bg={plan.armedGuestId ? "brand.subtle" : "transparent"}
                  cursor={plan.armedGuestId ? "pointer" : "default"}
                  aria-disabled={!plan.armedGuestId}
                  aria-label={`${table.name}, seat ${i + 1}: empty${plan.armedGuestId ? ". Press to seat the picked-up guest here." : ""}`}
                  _focusVisible={{ outline: "2px solid", outlineColor: "brand.focusRing" }}
                  onClick={() => {
                    if (plan.armedGuestId) plan.place(plan.armedGuestId, tableId, i)
                  }}
                >
                  <span aria-hidden="true">
                    Seat {i + 1} · empty
                    {plan.armedGuestId ? " · tap to seat here" : ""}
                  </span>
                </chakra.button>
              )}
            </chakra.li>
          )
        })}
      </Stack>
    </Stack>
  )
}

export function SidePanel() {
  const plan = usePlan()
  const dragSeated = plan.dragGuestId !== null && plan.positions[plan.dragGuestId] !== undefined

  return (
    <Box
      bg="bg.panel"
      borderWidth="1px"
      borderColor={dragSeated ? "brand.solid" : "border"}
      borderStyle={dragSeated ? "dashed" : "solid"}
      borderRadius="xl"
      shadow="xs"
      position={{ base: "static", lg: "sticky" }}
      top="72px"
      alignSelf="start"
      maxH={{ base: "none", lg: "calc(100dvh - 88px)" }}
      overflowY={{ base: "visible", lg: "auto" }}
      onDragOver={(e: React.DragEvent) => {
        if (dragSeated) {
          e.preventDefault()
          e.dataTransfer.dropEffect = "move"
        }
      }}
      onDrop={(e: React.DragEvent) => {
        e.preventDefault()
        const gid = plan.dragGuestId ?? e.dataTransfer.getData("text/plain")
        plan.setDragGuest(null)
        if (gid && plan.positions[gid]) plan.unseat(gid)
      }}
    >
      <Tabs.Root
        value={plan.tab}
        onValueChange={(e) => plan.setTab(e.value as PanelTab)}
        variant="line"
        size="sm"
        fitted
      >
        <Tabs.List position="sticky" top="0" bg="bg.panel" zIndex="1" borderTopRadius="xl">
          <Tabs.Trigger value="unseated">
            Unseated
            <Badge size="xs" colorPalette={plan.counts.unseated.length ? "brand" : "gray"}>
              {plan.counts.unseated.length}
            </Badge>
          </Tabs.Trigger>
          <Tabs.Trigger value="table">Table</Tabs.Trigger>
          <Tabs.Trigger value="rules">
            Rules
            <Badge size="xs" colorPalette={plan.brokenRules.length ? "red" : "gray"} variant={plan.brokenRules.length ? "solid" : "subtle"}>
              {plan.brokenRules.length}
            </Badge>
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="unseated" p="3">
          {dragSeated ? (
            <Text fontSize="sm" fontWeight="medium" color="brand.fg" mb="3">
              Drop here to unseat this guest.
            </Text>
          ) : null}
          <UnseatedTab />
        </Tabs.Content>
        <Tabs.Content value="table" p="3">
          {plan.selectedTableId ? <TableDetail tableId={plan.selectedTableId} /> : <TablesOverview />}
        </Tabs.Content>
        <Tabs.Content value="rules" p="3">
          <RulesList />
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  )
}
