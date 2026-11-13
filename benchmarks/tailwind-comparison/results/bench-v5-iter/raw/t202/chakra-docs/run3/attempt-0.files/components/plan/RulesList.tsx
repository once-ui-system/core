"use client"

import { Badge, Box, Button, Flex, Stack, Text } from "@chakra-ui/react"
import { MdCheckCircle, MdSchedule, MdWarning } from "react-icons/md"
import { tableById, type RuleResult } from "@/lib/plan"
import { usePlan } from "@/lib/store"

const STATUS = {
  broken: { label: "Broken", palette: "red", Icon: MdWarning },
  kept: { label: "Kept", palette: "green", Icon: MdCheckCircle },
  open: { label: "Waiting", palette: "gray", Icon: MdSchedule },
} as const

export function RuleCard({ result, compact = false }: { result: RuleResult; compact?: boolean }) {
  const plan = usePlan()
  const s = STATUS[result.status]
  const first = result.tables[0]
  return (
    <Flex
      gap="3"
      p="3"
      borderWidth="1px"
      borderColor={result.status === "broken" ? "red.emphasized" : "border"}
      borderStartWidth="4px"
      borderStartColor={`${s.palette}.solid`}
      bg={result.status === "broken" ? "red.subtle" : "bg.panel"}
      borderRadius="lg"
      align="flex-start"
    >
      <Box color={`${s.palette}.fg`} mt="0.5" fontSize="lg" aria-hidden="true">
        <s.Icon />
      </Box>
      <Stack gap="1" flex="1" minW="0">
        <Flex gap="2" align="center" wrap="wrap">
          <Text fontWeight="semibold" fontSize="sm">
            {result.title}
          </Text>
          <Badge colorPalette={s.palette} variant={result.status === "broken" ? "solid" : "subtle"} size="xs">
            {s.label}
          </Badge>
        </Flex>
        <Text fontSize="sm" color={result.status === "broken" ? "fg" : "fg.muted"}>
          {result.detail}
        </Text>
        {!compact ? (
          <Text fontSize="xs" color="fg.muted" fontStyle="italic">
            Couple's note: {result.rule.note}
          </Text>
        ) : null}
        {first && !compact ? (
          <Box pt="1">
            <Button
              size="xs"
              variant="outline"
              onClick={() => plan.selectTable(first)}
              aria-label={`Show ${tableById[first]?.name ?? "table"} on the plan`}
            >
              Show {tableById[first]?.name}
            </Button>
          </Box>
        ) : null}
      </Stack>
    </Flex>
  )
}

export function RulesList() {
  const { ruleResults } = usePlan()
  const order = { broken: 0, open: 1, kept: 2 } as const
  const sorted = [...ruleResults].sort((a, b) => order[a.status] - order[b.status])
  return (
    <Stack gap="2">
      <Text fontSize="sm" color="fg.muted">
        Checked every time a guest is seated, moved or unseated. A rule waits until the guests it names
        have seats.
      </Text>
      {sorted.map((r) => (
        <RuleCard key={r.rule.id} result={r} />
      ))}
    </Stack>
  )
}
