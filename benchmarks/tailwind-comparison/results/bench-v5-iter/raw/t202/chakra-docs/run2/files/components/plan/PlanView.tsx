"use client"

import {
  Alert,
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Tabs,
  Text,
} from "@chakra-ui/react"
import * as React from "react"
import { LuCircleCheck, LuTriangleAlert, LuX } from "react-icons/lu"
import { GUESTS_BY_ID, PARTY_COLOR, RULES, TABLES } from "@/lib/data"
import { RoomPlan, RoomPlanFrame } from "./RoomPlan"
import { RulesPanel, TablePanel, UnseatedPanel } from "./Panels"
import { usePlan, type PanelTab } from "./store"

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: React.ReactNode
  hint: string
  tone?: "warn" | "good" | "bad"
}) {
  const color = tone === "bad" ? "red.fg" : tone === "warn" ? "orange.fg" : tone === "good" ? "green.fg" : "fg"
  return (
    <Box
      p={{ base: "3", md: "4" }}
      rounded="xl"
      borderWidth="1px"
      bg="bg.panel"
      minW="0"
    >
      <Text fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="0.06em">
        {label}
      </Text>
      <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" lineHeight="1.1" color={color} mt="1">
        {value}
      </Text>
      <Text fontSize="xs" color="fg.muted" mt="1" truncate>
        {hint}
      </Text>
    </Box>
  )
}

export function PlanView() {
  const {
    seats,
    seatedCount,
    attendingCount,
    seatedAttending,
    unseatedAttending,
    capacity,
    brokenRules,
    brokenTables,
    selectedTable,
    selectTable,
    tab,
    setTab,
    picked,
    pick,
  } = usePlan()

  const free = capacity - seatedCount
  const pct = attendingCount ? Math.round((seatedAttending / attendingCount) * 100) : 0

  return (
    <Flex direction="column" gap={{ base: "3", md: "4" }}>
      <Flex align="flex-end" justify="space-between" gap="3" wrap="wrap">
        <Box>
          <Heading as="h1" size={{ base: "lg", md: "xl" }}>
            Seating plan
          </Heading>
          <Text color="fg.muted" fontSize="sm">
            Drag guests onto seats, or tap a guest, then a seat.
          </Text>
        </Box>
        <Flex align="center" gap="3" minW={{ base: "full", sm: "16rem" }}>
          <Box flex="1" role="img" aria-label={`${pct} percent of attending guests seated`}>
            <Box h="2" rounded="full" bg="bg.emphasized" overflow="hidden">
              <Box h="full" bg="brand.solid" rounded="full" style={{ width: `${pct}%`, transition: "width .25s" }} />
            </Box>
          </Box>
          <Text fontSize="sm" fontWeight="semibold" whiteSpace="nowrap">
            {pct}% seated
          </Text>
        </Flex>
      </Flex>

      <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={{ base: "2", md: "3" }}>
        <Stat label="Seated" value={seatedCount} hint={`${seatedAttending} of ${attendingCount} attending`} />
        <Stat
          label="Unseated"
          value={unseatedAttending.length}
          hint={unseatedAttending.length ? "attending, need a seat" : "everyone attending is seated"}
          tone={unseatedAttending.length ? "warn" : "good"}
        />
        <Stat label="Free seats" value={free} hint={`of ${capacity} in the room`} />
        <Stat
          label="Rules"
          value={brokenRules.length === 0 ? "All kept" : `${brokenRules.length} broken`}
          hint={`${brokenRules.length} of ${RULES.length} rules need attention`}
          tone={brokenRules.length ? "bad" : "good"}
        />
      </Grid>

      {brokenRules.length > 0 ? (
        <Alert.Root status="error" variant="subtle" rounded="xl" alignItems="flex-start">
          <Alert.Indicator>
            <LuTriangleAlert />
          </Alert.Indicator>
          <Alert.Content>
            <Alert.Title>
              {brokenRules.length === 1 ? "1 rule is broken" : `${brokenRules.length} rules are broken`}
            </Alert.Title>
            <Alert.Description>
              <Box as="ul" listStyleType="none" m="0" p="0">
                {brokenRules.map((r) => (
                  <li key={r.id}>
                    {r.title}: {r.detail}
                  </li>
                ))}
              </Box>
            </Alert.Description>
          </Alert.Content>
          <Button size="xs" variant="outline" colorPalette="red" onClick={() => setTab("rules")}>
            Review
          </Button>
        </Alert.Root>
      ) : (
        <Alert.Root status="success" variant="subtle" rounded="xl">
          <Alert.Indicator>
            <LuCircleCheck />
          </Alert.Indicator>
          <Alert.Content>
            <Alert.Title>Every rule the couple set is kept right now.</Alert.Title>
          </Alert.Content>
        </Alert.Root>
      )}

      <Grid templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 24rem" }} gap={{ base: "3", md: "4" }} alignItems="start">
        <Flex direction="column" gap="3" minW="0">
          {picked && (
            <Flex
              align="center"
              justify="space-between"
              gap="3"
              px="4"
              py="2.5"
              rounded="xl"
              bg="brand.solid"
              color="brand.contrast"
              role="status"
            >
              <Text fontSize="sm" fontWeight="semibold">
                Placing {GUESTS_BY_ID[picked].name}: tap an empty seat or a table.
              </Text>
              <Button size="xs" variant="surface" colorPalette="gray" onClick={() => pick(null)}>
                <LuX /> Cancel
              </Button>
            </Flex>
          )}

          <RoomPlanFrame>
            <RoomPlan />
          </RoomPlanFrame>

          <Flex wrap="wrap" columnGap="4" rowGap="2" aria-label="Plan key" role="group" fontSize="xs" color="fg.muted">
            {Object.keys(PARTY_COLOR).map((p) => (
              <Flex key={p} align="center" gap="1.5">
                <Box boxSize="3" rounded="full" bg={`${PARTY_COLOR[p]}.700`} aria-hidden />
                {p}
              </Flex>
            ))}
            <Flex align="center" gap="1.5">
              <Box boxSize="2.5" rounded="full" bg="orange.400" aria-hidden /> Dietary need
            </Flex>
            <Flex align="center" gap="1.5">
              <Box boxSize="3" rounded="full" borderWidth="1.5px" borderStyle="dashed" borderColor="border.emphasized" aria-hidden /> Empty seat
            </Flex>
            <Flex align="center" gap="1.5">
              <Box boxSize="3" rounded="full" bg="red.600" aria-hidden /> Broken rule
            </Flex>
          </Flex>

          <Flex as="ul" listStyleType="none" gap="2" wrap="wrap" aria-label="Tables">
            {TABLES.map((t) => {
              const n = seats[t.id].filter(Boolean).length
              const broken = brokenTables.has(t.id)
              const selected = selectedTable === t.id
              return (
                <li key={t.id}>
                  <Button
                    size="sm"
                    variant={selected ? "solid" : "outline"}
                    colorPalette={broken ? "red" : "brand"}
                    aria-pressed={selected}
                    onClick={() => selectTable(t.id)}
                  >
                    {broken && <LuTriangleAlert aria-label="Rule broken" />}
                    {t.name}
                    <Text as="span" opacity={0.8} fontWeight="normal">
                      {n}/{t.seats}
                    </Text>
                  </Button>
                </li>
              )
            })}
          </Flex>
        </Flex>

        <Box
          rounded="xl"
          borderWidth="1px"
          bg="bg.panel"
          position={{ base: "static", lg: "sticky" }}
          top="4.5rem"
          maxH={{ base: "none", lg: "calc(100vh - 6rem)" }}
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
          <Tabs.Root
            value={tab}
            onValueChange={(e) => setTab(e.value as PanelTab)}
            variant="line"
            size="sm"
            fitted
            display="flex"
            flexDirection="column"
            minH="0"
            flex="1"
          >
            <Tabs.List px="2" pt="1">
              <Tabs.Trigger value="unseated">
                To seat
                <Badge colorPalette={unseatedAttending.length ? "orange" : "green"} variant="subtle" size="sm">
                  {unseatedAttending.length}
                </Badge>
              </Tabs.Trigger>
              <Tabs.Trigger value="table">Table</Tabs.Trigger>
              <Tabs.Trigger value="rules">
                Rules
                <Badge colorPalette={brokenRules.length ? "red" : "green"} variant="subtle" size="sm">
                  {brokenRules.length}
                </Badge>
              </Tabs.Trigger>
            </Tabs.List>
            <Box overflowY="auto" p="3" flex="1" minH="0">
              <Tabs.Content value="unseated" p="0">
                <UnseatedPanel />
              </Tabs.Content>
              <Tabs.Content value="table" p="0">
                <TablePanel />
              </Tabs.Content>
              <Tabs.Content value="rules" p="0">
                <RulesPanel />
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </Box>
      </Grid>
    </Flex>
  )
}
