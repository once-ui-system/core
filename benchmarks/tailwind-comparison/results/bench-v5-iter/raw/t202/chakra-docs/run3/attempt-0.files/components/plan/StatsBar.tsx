"use client"

import { Box, Progress, SimpleGrid, Stack, Text } from "@chakra-ui/react"
import { tables } from "@/lib/data"
import { usePlan } from "@/lib/store"

function StatCard({
  label,
  value,
  caption,
  tone,
  children,
}: {
  label: string
  value: React.ReactNode
  caption: React.ReactNode
  tone?: "default" | "alert" | "ok"
  children?: React.ReactNode
}) {
  const accent =
    tone === "alert" ? "red.fg" : tone === "ok" ? "green.fg" : "fg"
  return (
    <Stack
      gap="1"
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      borderRadius="xl"
      px="4"
      py="3"
      shadow="xs"
    >
      <Text fontSize="xs" fontWeight="medium" color="fg.muted" textTransform="uppercase" letterSpacing="0.06em">
        {label}
      </Text>
      <Text fontSize="3xl" fontWeight="semibold" lineHeight="1.1" color={accent} fontFamily="heading">
        {value}
      </Text>
      <Text fontSize="sm" color="fg.muted">
        {caption}
      </Text>
      {children}
    </Stack>
  )
}

export function StatsBar() {
  const { counts, ruleResults, brokenRules } = usePlan()
  const waiting = ruleResults.filter((r) => r.status === "open").length
  const kept = ruleResults.filter((r) => r.status === "kept").length
  const pct = counts.attending === 0 ? 0 : Math.round((counts.attendingSeated / counts.attending) * 100)

  return (
    <SimpleGrid columns={{ base: 2, lg: 4 }} gap={{ base: "2", md: "3" }} aria-label="Seating counts" role="group">
      <StatCard
        label="Seated"
        value={counts.seated}
        caption={`${counts.attendingSeated} of ${counts.attending} attending guests`}
      >
        <Progress.Root value={pct} size="xs" colorPalette="brand" aria-label={`${pct} percent of attending guests seated`}>
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
      </StatCard>
      <StatCard
        label="Unseated"
        value={counts.unseated.length}
        tone={counts.unseated.length === 0 ? "ok" : "default"}
        caption={
          counts.awaiting.length > 0
            ? `attending, plus ${counts.awaiting.length} awaiting reply`
            : "attending guests without a seat"
        }
      />
      <StatCard
        label="Free seats"
        value={counts.freeSeats}
        caption={`of ${counts.totalSeats} seats at ${tables.length} tables`}
      />
      <StatCard
        label="Couple's rules"
        value={brokenRules.length === 0 ? "All clear" : `${brokenRules.length} broken`}
        tone={brokenRules.length > 0 ? "alert" : "ok"}
        caption={
          <Box as="span">
            {kept} kept · {waiting} waiting on seats
          </Box>
        }
      />
    </SimpleGrid>
  )
}
