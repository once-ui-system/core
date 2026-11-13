"use client"

import { Button, Flex, Heading, HStack, Stack, Text } from "@chakra-ui/react"
import { MdPrint } from "react-icons/md"
import { event, planner } from "@/lib/data"
import { formatEventDate } from "@/lib/plan"

export function PageHeader({
  eyebrow,
  title,
  printLabel,
}: {
  eyebrow: string
  title: string
  printLabel: string
}) {
  return (
    <Flex
      justify="space-between"
      align={{ base: "flex-start", md: "flex-end" }}
      direction={{ base: "column", md: "row" }}
      gap="3"
    >
      <Stack gap="1">
        <Text
          fontSize="xs"
          fontWeight="semibold"
          letterSpacing="0.08em"
          textTransform="uppercase"
          color="brand.fg"
        >
          {eyebrow}
        </Text>
        <Heading as="h1" fontFamily="heading" fontWeight="semibold" size="3xl" letterSpacing="-0.01em">
          {title}
        </Heading>
        <Text color="fg.muted" fontSize="sm">
          {formatEventDate()} · {event.venue} · Planned by {planner.name}
        </Text>
      </Stack>
      <HStack _print={{ display: "none" }}>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <MdPrint />
          {printLabel}
        </Button>
      </HStack>
    </Flex>
  )
}
