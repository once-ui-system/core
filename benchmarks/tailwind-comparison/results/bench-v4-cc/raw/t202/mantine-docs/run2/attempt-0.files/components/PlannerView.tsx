"use client";

import { useEffect } from "react";
import { Alert, Box, Button, Container, Grid, Group, Paper, SimpleGrid, Text, Title } from "@mantine/core";
import { IconAlertTriangle, IconCircleCheck, IconInfoCircle } from "@tabler/icons-react";
import { EVENT, GUESTS_BY_ID, PARTIES, partyColor, partyShade } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { Room } from "./Room";
import { SidePanel } from "./SidePanel";

function Stat({ label, value, hint, color }: { label: string; value: string; hint: string; color?: string }) {
  return (
    <Paper withBorder radius="md" p="sm">
      <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: "0.04em" }}>
        {label}
      </Text>
      <Text fz={28} fw={800} lh={1.1} c={color}>
        {value}
      </Text>
      <Text size="xs" c="dimmed">
        {hint}
      </Text>
    </Paper>
  );
}

export function PlannerView() {
  const {
    seatedCount,
    totalSeats,
    attendingCount,
    unseatedAttending,
    unseatedUnconfirmed,
    brokenRules,
    rules,
    activeGuest,
    setActiveGuest,
    unseat,
    placements,
    announcement,
    selectTable,
  } = usePlan();

  useEffect(() => {
    if (!activeGuest) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveGuest(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeGuest, setActiveGuest]);

  const active = activeGuest ? GUESTS_BY_ID[activeGuest] : undefined;
  const pendingCount = rules.filter((r) => r.status === "pending").length;

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" align="flex-end" mb="sm" gap="xs">
        <Box>
          <Title order={1} size="h2">
            Seating plan
          </Title>
          <Text size="sm" c="dimmed">
            {EVENT.venue}, {EVENT.room_m.width} × {EVENT.room_m.depth} m. Tap a guest, then a seat or table, or drag.
          </Text>
        </Box>
      </Group>

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="sm" mb="sm">
        <Stat label="Seated" value={String(seatedCount)} hint={`of ${attendingCount} attending`} />
        <Stat
          label="Unseated"
          value={String(unseatedAttending.length)}
          hint={unseatedUnconfirmed.length ? `+ ${unseatedUnconfirmed.length} not confirmed` : "attending without a seat"}
          color={unseatedAttending.length ? "orange" : "teal"}
        />
        <Stat label="Free seats" value={String(totalSeats - seatedCount)} hint={`of ${totalSeats} across 7 tables`} />
        <Stat
          label="Rules"
          value={brokenRules.length ? `${brokenRules.length} broken` : "All clear"}
          hint={`${rules.length - brokenRules.length - pendingCount} met, ${pendingCount} waiting`}
          color={brokenRules.length ? "red" : "teal"}
        />
      </SimpleGrid>

      {brokenRules.length > 0 ? (
        <Alert
          mb="sm"
          color="red"
          variant="light"
          icon={<IconAlertTriangle size={18} />}
          title={`${brokenRules.length} rule${brokenRules.length > 1 ? "s" : ""} broken`}
        >
          <Box component="ul" m={0} pl="md">
            {brokenRules.map((r) => (
              <li key={r.id}>
                <Text size="sm" component="span">
                  {r.headline}.{" "}
                </Text>
                {r.tableIds[0] && (
                  <Button size="compact-xs" variant="subtle" color="red" onClick={() => selectTable(r.tableIds[0] ?? null)}>
                    Show table
                  </Button>
                )}
              </li>
            ))}
          </Box>
        </Alert>
      ) : (
        <Alert mb="sm" color="teal" variant="light" icon={<IconCircleCheck size={18} />} title="No broken rules">
          {pendingCount > 0 ? `${pendingCount} rule${pendingCount > 1 ? "s" : ""} will be checked once those guests are seated.` : "Every rule of the couple is met."}
        </Alert>
      )}

      <Grid gap="md">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          {active && (
            <Paper
              withBorder
              radius="md"
              p="xs"
              mb="sm"
              role="status"
              style={{ borderColor: "var(--mantine-primary-color-filled)", background: "var(--mantine-primary-color-light)" }}
            >
              <Group justify="space-between" gap="xs">
                <Group gap="xs">
                  <IconInfoCircle size={18} aria-hidden />
                  <Text size="sm">
                    <b>{active.name}</b> is picked up. {placements[active.id] ? "Tap another seat to move or swap, or a table for its first free seat." : "Tap a seat, or a table for its first free seat."}
                  </Text>
                </Group>
                <Group gap={6}>
                  {placements[active.id] && (
                    <Button size="compact-sm" variant="default" onClick={() => unseat(active.id)}>
                      Unseat
                    </Button>
                  )}
                  <Button size="compact-sm" variant="filled" onClick={() => setActiveGuest(null)}>
                    Cancel
                  </Button>
                </Group>
              </Group>
            </Paper>
          )}
          <Room />
          <Group gap="md" mt="xs" component="ul" aria-label="Legend" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {PARTIES.map((p) => (
              <Group key={p} gap={6} component="li">
                <Box
                  w={12}
                  h={12}
                  aria-hidden
                  style={{ borderRadius: "50%", background: `var(--mantine-color-${partyColor(p)}-${partyShade(p)})` }}
                />
                <Text size="xs" c="dimmed">
                  {p}
                </Text>
              </Group>
            ))}
            <Group gap={6} component="li">
              <Box w={12} h={12} aria-hidden style={{ borderRadius: "50%", background: "var(--mantine-color-yellow-5)" }} />
              <Text size="xs" c="dimmed">
                Dietary need
              </Text>
            </Group>
            <Group gap={6} component="li">
              <Box w={12} h={12} aria-hidden style={{ borderRadius: "50%", boxShadow: "0 0 0 2px var(--mantine-color-red-filled)" }} />
              <Text size="xs" c="dimmed">
                Broken rule
              </Text>
            </Group>
          </Group>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <SidePanel />
        </Grid.Col>
      </Grid>

      <Box
        aria-live="polite"
        role="status"
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}
      >
        {announcement}
      </Box>
    </Container>
  );
}
