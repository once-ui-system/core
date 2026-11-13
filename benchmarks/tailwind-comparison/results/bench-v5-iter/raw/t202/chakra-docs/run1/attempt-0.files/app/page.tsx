"use client"

import { Box, Flex, Grid, Heading, Stack, Text } from "@chakra-ui/react"
import { RoomPlan } from "@/components/RoomPlan"
import { SidePanel, StatsStrip, StatusBar } from "@/components/PlanPanels"
import { EVENT, formatDate } from "@/lib/data"

export default function PlanPage() {
  return (
    <Box maxW="1800px" mx="auto" px={{ base: "3", md: "6" }} py={{ base: "4", md: "6" }}>
      <Stack gap="4">
        <Flex align="flex-end" justify="space-between" gap="3" wrap="wrap">
          <Box>
            <Heading as="h1" size={{ base: "xl", md: "2xl" }} letterSpacing="-0.02em">
              Seating plan
            </Heading>
            <Text color="fg.muted" fontSize="sm">
              {EVENT.name} · {formatDate(EVENT.date)} · {EVENT.venue}
            </Text>
          </Box>
        </Flex>
        <StatsStrip />
        <StatusBar />
        <Grid templateColumns={{ base: "minmax(0, 1fr)", xl: "minmax(0, 1fr) 420px" }} gap="4" alignItems="start">
          <RoomPlan />
          <Box position={{ xl: "sticky" }} top={{ xl: "72px" }} maxH={{ xl: "calc(100dvh - 88px)" }} overflowY={{ xl: "auto" }}>
            <SidePanel />
          </Box>
        </Grid>
      </Stack>
    </Box>
  )
}
