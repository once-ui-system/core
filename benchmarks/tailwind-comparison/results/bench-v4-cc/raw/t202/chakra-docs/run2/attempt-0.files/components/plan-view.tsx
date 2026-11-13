"use client";

import { useState } from "react";
import { Badge, Box, Button, Flex, Grid, Heading, HStack, SimpleGrid, Text } from "@chakra-ui/react";
import { LuCircleCheck, LuRotateCcw, LuTriangleAlert, LuUndo2 } from "react-icons/lu";
import { FloorPlan } from "@/components/floor-plan";
import { Panel, PanelHeader } from "@/components/panel";
import { usePlan } from "@/components/plan-provider";
import { RulesCard, SelectionCard, ToPlaceCard } from "@/components/plan-sidebar";
import { TableList } from "@/components/table-list";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { event, parties, partyPalette, tables } from "@/lib/data";

function Stat({ label, value, sub, tone }: { label: string; value: string | number; sub: string; tone?: "red" | "orange" | "green" }) {
  return (
    <Panel px="4" py="3">
      <Text fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="wider">
        {label}
      </Text>
      <Text fontSize="3xl" fontWeight="bold" lineHeight="1.1" color={tone ? `${tone}.fg` : "fg"} fontVariantNumeric="tabular-nums">
        {value}
      </Text>
      <Text fontSize="xs" color="fg.muted">
        {sub}
      </Text>
    </Panel>
  );
}

function StatusLine() {
  const { notice } = usePlan();
  const warn = notice?.tone === "warn";
  return (
    <Flex
      role="status"
      aria-live="polite"
      align="center"
      gap="2"
      px="4"
      py="2.5"
      rounded="lg"
      minH="10"
      fontSize="sm"
      bg={warn ? "orange.subtle" : "bg.panel"}
      color={warn ? "orange.fg" : "fg.muted"}
      borderWidth="1px"
      borderColor={warn ? "orange.muted" : "border.muted"}
    >
      {notice ? (
        <>
          <Box aria-hidden flexShrink={0}>
            {warn ? <LuTriangleAlert /> : <LuCircleCheck />}
          </Box>
          <Text>{notice.text}</Text>
        </>
      ) : (
        <Text>Tap a guest, then a table or seat. Or drag guests onto tables, and back to the list to unseat.</Text>
      )}
    </Flex>
  );
}

function Legend() {
  return (
    <Flex wrap="wrap" gap={{ base: "2", md: "3" }} px="4" py="2.5" borderTopWidth="1px" borderColor="border.muted" fontSize="xs" color="fg.muted">
      {parties.map((p) => (
        <HStack key={p} gap="1.5">
          <Box boxSize="2.5" rounded="full" bg={`${partyPalette[p]}.solid`} aria-hidden />
          <Text as="span">{p}</Text>
        </HStack>
      ))}
      <HStack gap="1.5">
        <Box boxSize="2.5" rounded="full" bg="yellow.solid" aria-hidden />
        <Text as="span">Dietary need</Text>
      </HStack>
      <HStack gap="1.5">
        <Box boxSize="2.5" rounded="full" borderWidth="2px" borderColor="red.solid" aria-hidden />
        <Text as="span">Rule broken</Text>
      </HStack>
      <HStack gap="1.5">
        <Box boxSize="2.5" rounded="full" borderWidth="1.5px" borderStyle="dashed" borderColor="border.emphasized" aria-hidden />
        <Text as="span">Empty seat</Text>
      </HStack>
    </Flex>
  );
}

export function PlanView() {
  const { seating, seatedCount, attendingCount, toPlace, results, undo, reset, canUndo } = usePlan();
  const [view, setView] = useState<"plan" | "tables">("plan");
  const totalSeats = tables.reduce((n, t) => n + t.seats, 0);
  const brokenCount = results.filter((r) => r.status === "broken").length;
  const attendingSeated = attendingCount - toPlace.length;

  return (
    <Box maxW="1600px" mx="auto" px={{ base: "4", md: "6" }} py={{ base: "4", md: "6" }}>
      <Flex justify="space-between" align={{ base: "flex-start", sm: "center" }} direction={{ base: "column", sm: "row" }} gap="3" mb="4">
        <Box>
          <Heading as="h1" size={{ base: "xl", md: "2xl" }} letterSpacing="tight">
            Seating plan
          </Heading>
          <Text color="fg.muted" fontSize="sm">
            {event.name} at {event.venue}
          </Text>
        </Box>
        <HStack gap="2">
          <Button size="sm" variant="outline" onClick={undo} disabled={!canUndo}>
            <LuUndo2 /> Undo
          </Button>
          <Button size="sm" variant="ghost" onClick={reset}>
            <LuRotateCcw /> Reset
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 2, md: 4 }} gap="3" mb="3">
        <Stat label="Seated" value={seatedCount} sub={`${attendingSeated} of ${attendingCount} attending guests`} />
        <Stat label="Without a seat" value={toPlace.length} sub="attending, still to place" tone={toPlace.length ? "orange" : "green"} />
        <Stat label="Free seats" value={totalSeats - Object.keys(seating).length} sub={`of ${totalSeats} across ${tables.length} tables`} />
        <Stat label="Rules broken" value={brokenCount} sub={`of ${results.length} rules from the couple`} tone={brokenCount ? "red" : "green"} />
      </SimpleGrid>

      <Box mb="4">
        <StatusLine />
      </Box>

      <Grid
        gap="4"
        templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 390px" }}
        templateRows={{ lg: "auto auto auto 1fr" }}
        templateAreas={{
          base: `"sel" "place" "plan" "rules"`,
          lg: `"plan sel" "plan place" "plan rules" "plan ."`,
        }}
      >
        <Box gridArea="sel" alignSelf="start">
          <SelectionCard />
        </Box>
        <Box gridArea="place" alignSelf="start">
          <ToPlaceCard />
        </Box>
        <Panel as="section" aria-labelledby="plan-h" gridArea="plan" alignSelf="start" overflow="hidden">
          <PanelHeader title="Room" id="plan-h">
            <HStack gap="3">
              <Text fontSize="xs" color="fg.muted" display={{ base: "none", sm: "block" }}>
                {event.room_m.width} x {event.room_m.depth} m, to scale
              </Text>
              <Box display={{ base: "block", lg: "none" }}>
                <SegmentedControl
                  size="sm"
                  value={view}
                  onValueChange={(d) => setView(d.value === "tables" ? "tables" : "plan")}
                  items={[
                    { value: "plan", label: "Floor plan" },
                    { value: "tables", label: "Table list" },
                  ]}
                />
              </Box>
            </HStack>
          </PanelHeader>
          <Box display={{ base: view === "plan" ? "block" : "none", lg: "block" }} p="2">
            <FloorPlan />
            <Text fontSize="xs" color="fg.muted" px="2" pb="1" display={{ base: "block", lg: "none" }}>
              Scroll sideways to see the whole room, or switch to the table list.
            </Text>
          </Box>
          <Box display={{ base: view === "tables" ? "block" : "none", lg: "none" }}>
            <TableList />
          </Box>
          <Legend />
        </Panel>
        <Box gridArea="rules" alignSelf="start">
          <RulesCard />
        </Box>
      </Grid>
    </Box>
  );
}
