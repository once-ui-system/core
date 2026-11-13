"use client";

import { Badge, Box, Button, Card, Collapse, Group, Paper, Stack, Text, Title, UnstyledButton, VisuallyHidden } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconAlertTriangle, IconArrowBackUp, IconCircleCheck, IconClock, IconRefresh, IconUserMinus } from "@tabler/icons-react";
import { GUESTS } from "@/lib/data";
import { useDrag } from "@/lib/drag";
import { usePlan, usePlanStats } from "@/lib/plan";
import { guestById } from "@/lib/rules";
import { GuestChip } from "./GuestChip";
import { Room } from "./Room";
import { TablePanel } from "./TablePanel";
import classes from "./room.module.css";

function Stat({ label, value, hint, tone }: { label: string; value: number; hint: string; tone?: "red" | "brand" }) {
  return (
    <Paper withBorder p="sm" bg="white" radius="lg">
      <Text size="xs" fw={700} tt="uppercase" c="gray.7" lh={1.2}>
        {label}
      </Text>
      <Text fz={28} fw={700} lh={1.15} c={tone === "red" ? "red.8" : undefined}>
        {value}
      </Text>
      <Text size="xs" c="gray.7">
        {hint}
      </Text>
    </Paper>
  );
}

function Stats() {
  const { attending, unseated, seatedCount, capacity } = usePlanStats();
  return (
    <Box className={classes.statGrid} role="group" aria-label="Seating counts">
      <Stat label="Attending" value={attending.length} hint={`of ${GUESTS.length} invited`} />
      <Stat label="Seated" value={seatedCount} hint={`${capacity - seatedCount} of ${capacity} seats free`} />
      <Stat label="Unseated" value={unseated.length} hint="attending, no seat yet" tone={unseated.length > 0 ? "red" : "brand"} />
      <Stat label="Awaiting reply" value={GUESTS.filter((g) => g.rsvp === "maybe" || g.rsvp === "pending").length} hint="maybe or no answer" />
    </Box>
  );
}

function PickBanner() {
  const { selectedGuest, selectGuest, unseat, tableOf } = usePlan();
  const g = selectedGuest ? guestById.get(selectedGuest) : undefined;
  if (!g) return null;
  const seated = tableOf(g.id) !== null;
  return (
    <Paper withBorder p="xs" mb="xs" bg="brand.0" style={{ borderColor: "var(--mantine-color-brand-4)" }}>
      <Group justify="space-between" gap="xs">
        <Text size="sm" fw={600} c="brand.9">
          {seated ? "Moving" : "Placing"} {g.name}: tap an empty seat, a table, or a seat to swap.
        </Text>
        <Group gap="xs">
          {seated ? (
            <Button size="compact-sm" variant="default" leftSection={<IconUserMinus size={14} aria-hidden />} onClick={() => unseat(g.id)}>
              Unseat
            </Button>
          ) : null}
          <Button size="compact-sm" variant="white" onClick={() => selectGuest(null)}>
            Cancel
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}

function RoomCard() {
  const { status, canUndo, undo, reset } = usePlan();
  return (
    <Card className={classes.room} aria-label="Room plan">
      <Group justify="space-between" align="flex-start" mb="xs" gap="xs">
        <Box>
          <Title order={2} size="h3">
            Room plan
          </Title>
          <Text size="sm" c="gray.7" mih={20} aria-hidden>
            {status || "Drag a guest onto a seat, or tap a guest and then a seat."}
          </Text>
        </Box>
        <Group gap="xs">
          <Button size="compact-md" variant="default" leftSection={<IconArrowBackUp size={16} aria-hidden />} disabled={!canUndo} onClick={undo}>
            Undo
          </Button>
          <Button size="compact-md" variant="default" leftSection={<IconRefresh size={16} aria-hidden />} onClick={reset}>
            Reset
          </Button>
        </Group>
      </Group>
      <PickBanner />
      <Room />
    </Card>
  );
}

function Tray() {
  const { unseated, unconfirmed } = usePlanStats();
  const { over, dragging } = useDrag();
  const [showMore, { toggle }] = useDisclosure(false);
  const seatedDrag = dragging !== null;
  const hot = over?.kind === "tray";
  return (
    <Card
      className={classes.tray}
      data-drop-tray
      aria-label="Guests without a seat"
      style={hot ? { borderColor: "var(--mantine-color-brand-7)", background: "var(--mantine-color-brand-0)" } : undefined}
    >
      <Group justify="space-between" mb="xs">
        <Group gap="xs">
          <Title order={2} size="h3">
            Needs a seat
          </Title>
          <Badge size="lg" color={unseated.length ? "red" : "green"} variant="light" c="gray.9">
            {unseated.length}
          </Badge>
        </Group>
        <Text size="sm" c="gray.7">
          {seatedDrag ? "Drop here to unseat" : "Attending guests with no seat"}
        </Text>
      </Group>
      {unseated.length === 0 ? (
        <Group gap="xs" c="green.9">
          <IconCircleCheck size={20} aria-hidden />
          <Text size="sm" fw={600}>
            Everyone attending has a seat.
          </Text>
        </Group>
      ) : (
        <Group gap="xs" role="list" aria-label="Unseated guests">
          {unseated.map((g) => (
            <Box key={g.id} role="listitem">
              <GuestChip guest={g} />
            </Box>
          ))}
        </Group>
      )}
      {unconfirmed.length > 0 ? (
        <Box mt="md">
          <UnstyledButton onClick={toggle} aria-expanded={showMore} py={4}>
            <Text size="sm" fw={600} c="gray.8">
              {showMore ? "Hide" : "Show"} {unconfirmed.length} guests who have not confirmed
            </Text>
          </UnstyledButton>
          <Collapse expanded={showMore}>
            <Group gap="xs" mt="xs" role="list" aria-label="Guests who have not confirmed">
              {unconfirmed.map((g) => (
                <Box key={g.id} role="listitem">
                  <GuestChip guest={g} />
                </Box>
              ))}
            </Group>
          </Collapse>
        </Box>
      ) : null}
    </Card>
  );
}

function Rules() {
  const { rules, selectTable } = usePlan();
  const broken = rules.filter((r) => r.status === "broken").length;
  const open = rules.filter((r) => r.status === "open").length;
  return (
    <Card className={classes.rules} aria-label="The couple's rules">
      <Group justify="space-between" mb="xs" wrap="nowrap">
        <Title order={2} size="h3">
          The couple&apos;s rules
        </Title>
        <Badge size="lg" variant="light" color={broken ? "red" : "green"} c="gray.9">
          {broken ? `${broken} broken` : "All clear"}
        </Badge>
      </Group>
      <Text size="sm" c="gray.7" mb="sm">
        {rules.length - broken - open} kept, {broken} broken, {open} waiting for seats.
      </Text>
      <Stack gap={6} role="list">
        {rules.map((r) => {
          const color = r.status === "broken" ? "red" : r.status === "ok" ? "green" : "gray";
          const Icon = r.status === "broken" ? IconAlertTriangle : r.status === "ok" ? IconCircleCheck : IconClock;
          const first = r.tableIds[0];
          return (
            <Box key={r.index} role="listitem">
              <UnstyledButton
                w="100%"
                p="xs"
                onClick={() => first && selectTable(first)}
                disabled={!first}
                style={{
                  borderRadius: 8,
                  border: `1px solid ${r.status === "broken" ? "var(--mantine-color-red-3)" : "var(--mantine-color-gray-3)"}`,
                  background: r.status === "broken" ? "var(--mantine-color-red-0)" : "white",
                }}
              >
                <Group gap={8} wrap="nowrap" align="flex-start">
                  <Box c={`${color}.8`} pt={1} style={{ flex: "none" }}>
                    <Icon size={18} aria-hidden />
                  </Box>
                  <Box>
                    <Text size="sm" fw={600} lh={1.3}>
                      <Text span size="xs" fw={700} tt="uppercase" c={`${color}.8`}>
                        {r.status === "broken" ? "Broken" : r.status === "ok" ? "Kept" : "Waiting"}
                      </Text>{" "}
                      {r.title}
                    </Text>
                    <Text size="sm" c="gray.8" lh={1.35}>
                      {r.detail}
                    </Text>
                    <Text size="xs" c="gray.7" fs="italic" lh={1.35} mt={2}>
                      {r.rule.note}
                    </Text>
                  </Box>
                </Group>
              </UnstyledButton>
            </Box>
          );
        })}
      </Stack>
    </Card>
  );
}

export function PlanView() {
  return (
    <Stack gap="md">
      <VisuallyHidden>
        <h1>Seating plan for Ines &amp; Mateo&apos;s wedding dinner</h1>
      </VisuallyHidden>
      <Stats />
      <Box className={classes.layout}>
        <RoomCard />
        <Box className={classes.side}>
          <Box className={classes.tablePanel}>
            <TablePanel />
          </Box>
          <Rules />
        </Box>
        <Tray />
      </Box>
    </Stack>
  );
}
