"use client";

import {
  Alert,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Grid,
  Box,
} from "@mantine/core";
import { IconAlertTriangle, IconCheck, IconHandFinger, IconX } from "@tabler/icons-react";
import { event, formatEventDate, parties, tables } from "@/lib/data";
import { guestById, seatedCount } from "@/lib/plan";
import { PartyDot } from "./GuestBits";
import { usePlan } from "./PlanProvider";
import { RoomPlan } from "./RoomPlan";
import { SidePanel } from "./SidePanel";

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub: string;
  color?: string;
}) {
  return (
    <Paper withBorder p="md">
      <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: 0.4 }}>
        {label}
      </Text>
      <Text fz={32} fw={700} lh={1.1} mt={4} c={color}>
        {value}
      </Text>
      <Text size="sm" c="dimmed" mt={2}>
        {sub}
      </Text>
    </Paper>
  );
}

function RuleSummary() {
  const { rules, selectTable } = usePlan();
  const broken = rules.filter((r) => r.status === "broken");
  const waiting = rules.filter((r) => r.status === "waiting").length;
  const ok = rules.filter((r) => r.status === "ok").length;

  if (broken.length === 0) {
    return (
      <Alert color="teal.9" variant="light" icon={<IconCheck size={18} />} title="No seating rules broken">
        {ok} followed{waiting > 0 ? `, ${waiting} waiting for guests to be seated` : ""}.
      </Alert>
    );
  }
  return (
    <Alert
      color="red.9"
      variant="light"
      icon={<IconAlertTriangle size={18} />}
      title={`${broken.length} seating ${broken.length === 1 ? "rule is" : "rules are"} broken`}
    >
      <Stack gap={6}>
        {broken.map((r) => (
          <Group key={r.index} gap="xs" justify="space-between" wrap="nowrap" align="flex-start">
            <Text size="sm">
              <Text span fw={700}>
                {r.label}:{" "}
              </Text>
              {r.text}
            </Text>
            {r.tables[0] ? (
              <Button size="compact-xs" variant="white" color="red.9" onClick={() => selectTable(r.tables[0] ?? null, true)}>
                Show
              </Button>
            ) : null}
          </Group>
        ))}
        <Text size="xs" c="dimmed">
          {ok} followed{waiting > 0 ? `, ${waiting} waiting for guests to be seated` : ""}.
        </Text>
      </Stack>
    </Alert>
  );
}

function PickedBanner() {
  const { picked, pick } = usePlan();
  const guest = picked ? guestById[picked] : undefined;
  if (!guest) return null;
  return (
    <Paper
      role="status"
      p="sm"
      shadow="md"
      style={{
        position: "sticky",
        top: 72,
        zIndex: 20,
        background: "var(--mantine-color-brand-filled)",
        color: "var(--mantine-color-white)",
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap="xs" wrap="nowrap">
          <IconHandFinger size={20} />
          <Text size="sm" fw={600} c="inherit">
            Placing {guest.name}: tap a table or an empty seat.
          </Text>
        </Group>
        <Button size="compact-sm" variant="white" color="brand" leftSection={<IconX size={14} />} onClick={() => pick(null)}>
          Cancel
        </Button>
      </Group>
    </Paper>
  );
}

function TableChips() {
  const { seating, brokenTables, selectedTable, picked, place, pick, selectTable } = usePlan();
  return (
    <Group gap="xs" role="group" aria-label="Seats filled per table">
      {tables.map((t) => {
        const n = seatedCount(seating, t.id);
        const broken = brokenTables.has(t.id);
        const selected = selectedTable === t.id;
        return (
          <Button
            key={t.id}
            size="compact-md"
            variant={selected ? "filled" : "light"}
            color={broken ? "red" : n >= t.seats ? "teal" : "brand"}
            rightSection={
              <Text span fw={700} size="xs">
                {n}/{t.seats}
              </Text>
            }
            aria-pressed={selected}
            onClick={() => {
              if (picked) {
                if (place(picked, t.id)) pick(null);
                selectTable(t.id);
              } else selectTable(t.id, true);
            }}
          >
            {t.name}
          </Button>
        );
      })}
    </Group>
  );
}

function Legend() {
  return (
    <Group gap="md" style={{ rowGap: 6 }} aria-label="Legend" role="group">
      {parties.map((p) => (
        <Group key={p} gap={6} wrap="nowrap">
          <PartyDot party={p} />
          <Text size="xs" c="dimmed">
            {p}
          </Text>
        </Group>
      ))}
      <Group gap={6} wrap="nowrap">
        <Box w={10} h={10} style={{ borderRadius: "50%", background: "var(--mantine-color-grape-6)" }} />
        <Text size="xs" c="dimmed">
          Dietary need
        </Text>
      </Group>
      <Group gap={6} wrap="nowrap">
        <Box w={10} h={10} style={{ borderRadius: "50%", background: "var(--mantine-color-red-6)" }} />
        <Text size="xs" c="dimmed">
          Allergy
        </Text>
      </Group>
      <Group gap={6} wrap="nowrap">
        <Box w={12} h={12} style={{ borderRadius: "50%", border: "2px dashed var(--mantine-color-red-6)" }} />
        <Text size="xs" c="dimmed">
          Rule broken
        </Text>
      </Group>
    </Group>
  );
}

export function PlanView() {
  const { stats, rules } = usePlan();
  const broken = rules.filter((r) => r.status === "broken").length;

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-end" gap="xs">
        <div>
          <Title order={1} size="h2">Seating plan</Title>
          <Text c="dimmed" size="sm">
            {event.name} · {formatEventDate()} · {event.venue}
          </Text>
        </div>
        <Text size="sm" c="dimmed">
          Room {event.room_m.width} × {event.room_m.depth} m, drawn to scale
        </Text>
      </Group>

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="sm">
        <StatCard
          label="Seated"
          value={stats.seated}
          sub={`${stats.freeSeats} of ${stats.totalSeats} seats free`}
        />
        <StatCard
          label="Still to seat"
          value={stats.toSeat}
          sub={
            stats.undecidedUnseated > 0
              ? `attending, plus ${stats.undecidedUnseated} not confirmed`
              : "attending guests"
          }
          color={stats.toSeat > 0 ? "brand" : "teal"}
        />
        <StatCard
          label="Attending"
          value={stats.attending}
          sub={`of ${stats.invited} invited`}
        />
        <StatCard
          label="Rules broken"
          value={broken}
          sub={`of ${rules.length} seating rules`}
          color={broken > 0 ? "red" : "teal"}
        />
      </SimpleGrid>

      <RuleSummary />
      <PickedBanner />

      <Grid gap="md" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="sm">
            <RoomPlan />
            <TableChips />
            <Legend />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }} style={{ position: "sticky", top: 76 }}>
          <SidePanel />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
