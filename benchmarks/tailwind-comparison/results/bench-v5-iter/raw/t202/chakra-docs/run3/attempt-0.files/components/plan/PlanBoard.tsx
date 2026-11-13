"use client"

import { Box, Button, Flex, Grid, Heading, HStack, Stack, Text } from "@chakra-ui/react"
import * as React from "react"
import { Alert } from "@/components/ui/alert"
import { PageHeader } from "@/components/PageHeader"
import { event } from "@/lib/data"
import { guestById, PARTIES, partyPalette, ROOM } from "@/lib/plan"
import { usePlan } from "@/lib/store"
import { RoomMap } from "./RoomMap"
import { SidePanel } from "./SidePanel"
import { StatsBar } from "./StatsBar"

function RulesBanner() {
  const plan = usePlan()
  const { brokenRules, ruleResults } = plan
  const waiting = ruleResults.filter((r) => r.status === "open").length

  if (brokenRules.length === 0) {
    return (
      <Alert
        status="success"
        variant="subtle"
        title={
          waiting > 0
            ? `No rules broken. ${waiting} ${waiting === 1 ? "rule is" : "rules are"} waiting for guests to be seated.`
            : "All of the couple's rules are kept."
        }
      />
    )
  }
  return (
    <Alert
      status="error"
      variant="subtle"
      title={`${brokenRules.length} of the couple's ${brokenRules.length === 1 ? "rule is" : "rules are"} broken`}
    >
      <Stack gap="1.5" as="ul" listStyleType="none" m="0" p="0">
        {brokenRules.map((r) => (
          <Flex as="li" key={r.rule.id} gap="2" align="baseline" wrap="wrap">
            <Text as="span" fontWeight="medium">
              {r.title}.
            </Text>
            <Text as="span">{r.detail}</Text>
            {r.tables[0] ? (
              <Button size="2xs" variant="outline" colorPalette="red" onClick={() => plan.selectTable(r.tables[0] ?? null)}>
                Show
              </Button>
            ) : null}
          </Flex>
        ))}
      </Stack>
    </Alert>
  )
}

function PickupBar() {
  const plan = usePlan()
  const guest = plan.armedGuestId ? guestById[plan.armedGuestId] : undefined
  if (!guest) return null
  const seated = plan.positions[guest.id]
  return (
    <Flex
      role="status"
      align="center"
      justify="space-between"
      gap="3"
      bg="brand.solid"
      color="brand.contrast"
      px="4"
      py="2.5"
      borderRadius="lg"
      position="sticky"
      top="64px"
      zIndex="docked"
      shadow="md"
    >
      <Text fontSize="sm" fontWeight="medium">
        {seated ? "Moving" : "Placing"} {guest.name}: tap a table or an empty seat on the plan, or a seat to swap.
      </Text>
      <HStack>
        <Button size="xs" variant="surface" colorPalette="gray" onClick={() => plan.armGuest(null)}>
          Cancel
        </Button>
      </HStack>
    </Flex>
  )
}

function Legend() {
  return (
    <HStack gap="3" wrap="wrap" fontSize="xs" color="fg.muted" aria-label="Legend" role="group">
      {PARTIES.map((p) => (
        <HStack key={p} gap="1.5">
          <Box boxSize="3" borderRadius="full" bg={`${partyPalette(p)}.solid`} aria-hidden="true" />
          <Text as="span">{p}</Text>
        </HStack>
      ))}
      <HStack gap="1.5">
        <Box boxSize="3" borderRadius="full" bg="yellow.400" aria-hidden="true" />
        <Text as="span">Dietary need</Text>
      </HStack>
      <HStack gap="1.5">
        <Box boxSize="3" borderRadius="full" borderWidth="1.5px" borderStyle="dashed" borderColor="border.emphasized" aria-hidden="true" />
        <Text as="span">Empty seat</Text>
      </HStack>
      <HStack gap="1.5">
        <Box boxSize="3" borderRadius="full" outline="2px solid" outlineColor="red.solid" aria-hidden="true" />
        <Text as="span">Broken rule</Text>
      </HStack>
    </HStack>
  )
}

export function PlanBoard() {
  const plan = usePlan()
  const { armedGuestId, armGuest } = plan

  React.useEffect(() => {
    if (!armedGuestId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") armGuest(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [armedGuestId, armGuest])

  return (
    <Stack gap="4">
      <PageHeader eyebrow="Seating plan" title={event.name} printLabel="Print plan" />
      <StatsBar />
      <RulesBanner />
      <PickupBar />
      <Grid
        templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 380px" }}
        gap="4"
        alignItems="start"
      >
        <Stack
          gap="3"
          bg="bg.panel"
          borderWidth="1px"
          borderColor="border"
          borderRadius="xl"
          shadow="xs"
          p={{ base: "3", md: "4" }}
          minW="0"
        >
          <Flex justify="space-between" align={{ base: "flex-start", md: "center" }} direction={{ base: "column", md: "row" }} gap="2">
            <Box>
              <Heading as="h2" fontFamily="heading" size="lg" fontWeight="semibold">
                The room
              </Heading>
              <Text fontSize="sm" color="fg.muted">
                {event.venue}, {ROOM.width} m × {ROOM.depth} m, drawn to scale
              </Text>
            </Box>
          </Flex>
          <Legend />
          <RoomMap />
        </Stack>
        <SidePanel />
      </Grid>
    </Stack>
  )
}
