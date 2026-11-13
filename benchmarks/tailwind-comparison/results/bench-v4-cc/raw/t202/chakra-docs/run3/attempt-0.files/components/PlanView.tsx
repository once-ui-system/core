"use client"

import { Badge, Box, Button, Flex, Grid, HStack, Tabs, Text, VisuallyHidden, chakra } from "@chakra-ui/react"
import * as React from "react"
import { LuCircleCheck, LuTriangleAlert } from "react-icons/lu"
import { toaster } from "@/components/ui/toaster"
import { RoomPlan } from "@/components/RoomPlan"
import { RulesList, TableDetail, TableList, ToPlaceList, ToPlaceStrip } from "@/components/PlanPanels"
import { PARTY_PALETTE } from "@/components/GuestBits"
import { TABLES } from "@/lib/data"
import {
  brokenByTable,
  computeStats,
  evaluateRules,
  guestById,
  placeGuest,
  tableById,
  tableName,
  unseatGuest,
  usePlacements,
} from "@/lib/seating"

const Btn = chakra("button")

function StatCard({ label, value, hint, tone }: { label: string; value: string | number; hint?: string; tone?: "red" | "green" }) {
  return (
    <Box bg="bg.panel" borderWidth="1px" borderRadius="xl" px="4" py="3" borderColor={tone === "red" ? "red.solid" : "border"}>
      <Text fontSize="xs" color="fg.muted" fontWeight="medium" textTransform="uppercase" letterSpacing="0.04em">
        {label}
      </Text>
      <Text fontSize="3xl" fontWeight="semibold" lineHeight="1.1" color={tone === "red" ? "red.fg" : tone === "green" ? "green.fg" : "fg"}>
        {value}
      </Text>
      {hint && (
        <Text fontSize="xs" color="fg.muted">
          {hint}
        </Text>
      )}
    </Box>
  )
}

export function PlanView() {
  const placements = usePlacements()
  const [selectedTable, setSelectedTable] = React.useState<string | null>(null)
  const [pickedId, setPickedId] = React.useState<string | null>(null)
  const [dragId, setDragId] = React.useState<string | null>(null)
  const [tab, setTab] = React.useState("place")
  const [status, setStatus] = React.useState("")

  const rules = React.useMemo(() => evaluateRules(placements), [placements])
  const stats = React.useMemo(() => computeStats(placements), [placements])
  const broken = React.useMemo(() => brokenByTable(rules), [rules])
  const brokenRules = rules.filter((r) => r.status === "broken")
  const keptRules = rules.filter((r) => r.status === "ok").length
  const waitingRules = rules.filter((r) => r.status === "open").length

  const place = React.useCallback((guestId: string, tableId: string, seat?: number) => {
    const guest = guestById.get(guestId)
    if (!guest) return
    const res = placeGuest(guestId, tableId, seat)
    setDragId(null)
    if (!res.ok) {
      toaster.create({ title: "Could not seat guest", description: res.reason, type: "error" })
      return
    }
    setPickedId(null)
    setSelectedTable(tableId)
    setStatus(`${guest.name} is at ${tableName(tableId)}.`)
  }, [])

  const unseat = React.useCallback((guestId: string) => {
    const guest = guestById.get(guestId)
    unseatGuest(guestId)
    setDragId(null)
    setPickedId(null)
    if (guest) setStatus(`${guest.name} is unseated.`)
  }, [])

  const pick = React.useCallback((id: string) => {
    setPickedId((cur) => (cur === id ? null : id))
  }, [])

  const showTable = React.useCallback((id: string) => {
    setSelectedTable(id)
    setTab("table")
  }, [])

  const onTapSeat = (tableId: string, seat: number, occupant: string | null) => {
    if (pickedId) {
      if (occupant === pickedId) setPickedId(null)
      else place(pickedId, tableId, seat)
      return
    }
    showTable(tableId)
    if (occupant) setPickedId(occupant)
  }
  const onTapTable = (tableId: string) => {
    if (pickedId) place(pickedId, tableId)
    else showTable(tableId)
  }

  const picked = pickedId ? guestById.get(pickedId) : undefined
  const pickedSeat = pickedId ? placements[pickedId] : null
  const handlers = { pickedId, onPick: pick, onDragGuest: setDragId, onPlace: place, onUnseat: unseat }
  const selected = selectedTable ? tableById.get(selectedTable) : undefined

  return (
    <Box colorPalette="teal">
      <VisuallyHidden role="status" aria-live="polite">
        {status}
      </VisuallyHidden>

      <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap="3" mb="3">
        <StatCard label="Seated" value={stats.seated} hint={`of ${stats.attending} attending`} />
        <StatCard label="To place" value={stats.toPlace.length} hint="attending, no seat yet" tone={stats.toPlace.length === 0 ? "green" : undefined} />
        <StatCard label="Not confirmed" value={stats.awaiting.length} hint={`maybe or no reply · ${stats.declined} declined`} />
        <StatCard label="Free seats" value={stats.freeSeats} hint={`of ${stats.totalSeats} in ${TABLES.length} tables`} />
      </Grid>

      <Box
        mb="3"
        borderRadius="xl"
        borderWidth="1px"
        px="4"
        py="3"
        bg={brokenRules.length ? "red.subtle" : "green.subtle"}
        borderColor={brokenRules.length ? "red.solid" : "green.muted"}
        color={brokenRules.length ? "red.fg" : "green.fg"}
        aria-label="Couple's rules summary"
        role="region"
      >
        <Flex align="center" gap="2" fontWeight="semibold" fontSize="sm">
          {brokenRules.length ? <LuTriangleAlert aria-hidden /> : <LuCircleCheck aria-hidden />}
          <Text>
            {brokenRules.length
              ? `${brokenRules.length} of the couple's rules ${brokenRules.length === 1 ? "is" : "are"} broken`
              : "No rules broken"}
          </Text>
          <Text fontWeight="normal" color="fg.muted">
            · {keptRules} kept · {waitingRules} waiting for guests to be placed
          </Text>
        </Flex>
        {brokenRules.length > 0 && (
          <Box as="ul" listStyleType="none" m="0" mt="1.5" p="0" fontSize="sm" color="fg">
            {brokenRules.map((r) => (
              <li key={r.index}>
                <Btn
                  type="button"
                  textAlign="left"
                  py="1"
                  onClick={() => r.tables[0] && showTable(r.tables[0])}
                  _hover={{ textDecoration: "underline" }}
                  _focusVisible={{ outline: "2px solid", outlineColor: "teal.focusRing" }}
                >
                  {r.headline}. <Text as="span" color="fg.muted">{r.detail}</Text>
                </Btn>
              </li>
            ))}
          </Box>
        )}
      </Box>

      {picked && (
        <Flex
          position="sticky"
          top="14"
          zIndex="docked"
          mb="3"
          p="3"
          gap="3"
          align="center"
          wrap="wrap"
          bg="teal.solid"
          color="teal.contrast"
          borderRadius="xl"
          boxShadow="md"
        >
          <Text fontSize="sm" fontWeight="medium" flex="1" minW="220px">
            {pickedSeat
              ? `Moving ${picked.name} from ${tableName(pickedSeat.table)}, seat ${pickedSeat.seat + 1}.`
              : `Seating ${picked.name}.`}{" "}
            Tap a seat or a table in the plan.
          </Text>
          {pickedSeat && (
            <Button size="sm" variant="surface" onClick={() => unseat(picked.id)}>
              Unseat
            </Button>
          )}
          <Button size="sm" variant="outline" color="teal.contrast" _hover={{ bg: "whiteAlpha.200" }} onClick={() => setPickedId(null)}>
            Cancel
          </Button>
        </Flex>
      )}

      <Grid templateColumns={{ base: "minmax(0, 1fr)", xl: "minmax(0, 1fr) 390px" }} gap="4" alignItems="start">
        <Box minW="0">
          <Box display={{ base: "block", xl: "none" }}>
            <ToPlaceStrip toPlace={stats.toPlace} awaiting={stats.awaiting} handlers={handlers} dragId={dragId} placements={placements} />
          </Box>
          <Box bg="bg.panel" borderWidth="1px" borderRadius="xl" p={{ base: "2", md: "3" }}>
            <RoomPlan
              placements={placements}
              rules={rules}
              selectedTable={selectedTable}
              pickedId={pickedId}
              dragId={dragId}
              onDragGuest={setDragId}
              onDropGuest={place}
              onTapSeat={onTapSeat}
              onTapTable={onTapTable}
            />
            <Text display={{ base: "block", xl: "none" }} mt="2" fontSize="xs" color="fg.muted">
              The plan scrolls sideways on narrow screens. You can also seat guests from the lists below it.
            </Text>
          </Box>
          <Flex mt="3" gap="x" wrap="wrap" columnGap="4" rowGap="1.5" fontSize="xs" color="fg.muted" as="ul" listStyleType="none" m="0" p="0" pt="3">
            {Object.entries(PARTY_PALETTE).map(([party, palette]) => (
              <HStack as="li" key={party} gap="1.5">
                <Box aria-hidden w="2.5" h="2.5" borderRadius="full" colorPalette={palette} bg="colorPalette.solid" />
                {party}
              </HStack>
            ))}
            <HStack as="li" gap="1.5">
              <Box aria-hidden w="2.5" h="2.5" borderRadius="full" bg="orange.solid" />
              Dietary need
            </HStack>
            <HStack as="li" gap="1.5">
              <Box aria-hidden w="2.5" h="2.5" borderRadius="full" borderWidth="1.5px" borderStyle="dashed" borderColor="border.emphasized" />
              Empty seat
            </HStack>
            <HStack as="li" gap="1.5">
              <Box aria-hidden w="2.5" h="2.5" borderRadius="full" borderWidth="2px" borderColor="red.solid" />
              Rule broken
            </HStack>
          </Flex>
        </Box>

        <Box
          bg="bg.panel"
          borderWidth="1px"
          borderRadius="xl"
          p="3"
          position={{ xl: "sticky" }}
          top={{ xl: "20" }}
          maxH={{ xl: "calc(100dvh - 7rem)" }}
          overflowY={{ xl: "auto" }}
        >
          <Tabs.Root value={tab} onValueChange={(e) => setTab(e.value)} variant="line" fitted size="sm">
            <Tabs.List>
              <Tabs.Trigger value="place">
                To place
                <Badge colorPalette={stats.toPlace.length ? "orange" : "green"} variant="subtle">
                  {stats.toPlace.length}
                </Badge>
              </Tabs.Trigger>
              <Tabs.Trigger value="table">Table</Tabs.Trigger>
              <Tabs.Trigger value="rules">
                Rules
                <Badge colorPalette={brokenRules.length ? "red" : "green"} variant="subtle">
                  {brokenRules.length}
                </Badge>
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="place" pt="3">
              <ToPlaceList toPlace={stats.toPlace} awaiting={stats.awaiting} placements={placements} handlers={handlers} dragId={dragId} />
            </Tabs.Content>
            <Tabs.Content value="table" pt="3">
              {selected ? (
                <TableDetail
                  table={selected}
                  placements={placements}
                  bad={broken[selected.id] ?? []}
                  handlers={handlers}
                  onBack={() => setSelectedTable(null)}
                />
              ) : (
                <Box>
                  <Text fontSize="sm" color="fg.muted" mb="3">
                    Select a table in the plan, or here, to see who sits there and what they eat.
                  </Text>
                  <TableList placements={placements} selectedTable={selectedTable} broken={broken} onSelect={showTable} />
                </Box>
              )}
            </Tabs.Content>
            <Tabs.Content value="rules" pt="3">
              <RulesList rules={rules} onShow={showTable} />
            </Tabs.Content>
          </Tabs.Root>
        </Box>
      </Grid>
    </Box>
  )
}
