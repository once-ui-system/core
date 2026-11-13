"use client";

import { Container, Grid, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { HeldBanner, RoomPlan } from "@/components/RoomPlan";
import { RulesPanel, TablePanel, UnseatedList } from "@/components/PlanSidebar";
import { usePlan } from "@/components/PlanProvider";
import { EVENT } from "@/lib/data";
import { eventDateLabel } from "@/lib/plan";

function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "warn" | "bad" | "good";
}) {
  const color =
    tone === "bad"
      ? "var(--mantine-color-red-8)"
      : tone === "warn"
        ? "var(--mantine-color-orange-8)"
        : tone === "good"
          ? "var(--mantine-color-green-8)"
          : "var(--mantine-color-gray-9)";
  return (
    <Paper withBorder radius="lg" p="sm" px="md">
      <Text size="xs" fw={700} tt="uppercase" c="gray.7">
        {label}
      </Text>
      <Text fz={28} fw={700} lh={1.2} style={{ color }}>
        {value}
      </Text>
      <Text size="xs" c="gray.7">
        {hint}
      </Text>
    </Paper>
  );
}

export default function PlanPage() {
  const { stats, results } = usePlan();
  const broken = results.filter((r) => r.status === "broken").length;
  const open = results.filter((r) => r.status === "open").length;

  return (
    <Container size={1400} px="md" py="lg">
      <Stack gap="md">
        <Group justify="space-between" align="flex-end" wrap="wrap">
          <div>
            <Title order={1} size="h2">
              {EVENT.name}
            </Title>
            <Text c="gray.8">
              {eventDateLabel()} · {EVENT.venue}
            </Text>
          </div>
        </Group>

        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
          <Stat label="Seated" value={String(stats.seated)} hint={`of ${stats.attending} attending`} />
          <Stat
            label="Needs a seat"
            value={String(stats.unseatedAttending)}
            hint="attending, unseated"
            tone={stats.unseatedAttending ? "warn" : "good"}
          />
          <Stat label="Free seats" value={String(stats.free)} hint={`of ${stats.capacity} in the room`} />
          <Stat
            label="Rules"
            value={broken === 0 ? "All kept" : `${broken} broken`}
            hint={open ? `${open} waiting for seats` : `${results.length} rules checked`}
            tone={broken ? "bad" : "good"}
          />
        </SimpleGrid>

        <Grid gap="md">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="sm">
              <HeldBanner />
              <RoomPlan />
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              <TablePanel />
              <UnseatedList />
              <RulesPanel />
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
