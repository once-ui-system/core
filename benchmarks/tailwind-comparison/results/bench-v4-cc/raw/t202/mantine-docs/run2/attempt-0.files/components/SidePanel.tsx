"use client";

import { useState } from "react";
import { ActionIcon, Alert, Badge, Box, Button, Group, Paper, Stack, Tabs, Text, Title } from "@mantine/core";
import {
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconUserMinus,
  IconX,
} from "@tabler/icons-react";
import { GUESTS_BY_ID, TABLES_BY_ID } from "@/lib/data";
import { usePlan, type PanelTab } from "@/lib/plan";
import type { RuleResult } from "@/lib/rules";
import { GuestCard, MoveMenu } from "./GuestCard";
import classes from "./room.module.css";

function ToSeat() {
  const { unseatedAttending, unseatedUnconfirmed, draggingId, unseat, placements, setDragging } = usePlan();
  const [over, setOver] = useState(false);
  const canDrop = draggingId !== null && placements[draggingId] != null;
  return (
    <Stack
      gap="md"
      className={classes.dropzone}
      data-dragging={canDrop}
      data-over={over && canDrop}
      onDragOver={(e) => {
        if (canDrop) {
          e.preventDefault();
          setOver(true);
        }
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = draggingId ?? e.dataTransfer.getData("text/plain");
        setDragging(null);
        if (id) unseat(id);
      }}
    >
      {canDrop && (
        <Text size="sm" fw={600} ta="center" c="teal" py="xs">
          Drop here to unseat
        </Text>
      )}
      <Box>
        <Group justify="space-between" mb={6}>
          <Text fw={700} size="sm">
            Attending, no seat
          </Text>
          <Badge variant="light" color={unseatedAttending.length ? "orange" : "teal"}>
            {unseatedAttending.length}
          </Badge>
        </Group>
        <Stack gap={6} component="ul" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {unseatedAttending.length === 0 && (
            <Text size="sm" c="dimmed" component="li">
              Everyone attending has a seat.
            </Text>
          )}
          {unseatedAttending.map((g) => (
            <li key={g.id}>
              <GuestCard guest={g} />
            </li>
          ))}
        </Stack>
      </Box>
      {unseatedUnconfirmed.length > 0 && (
        <Box>
          <Group justify="space-between" mb={2}>
            <Text fw={700} size="sm">
              Not confirmed yet
            </Text>
            <Badge variant="light" color="gray">
              {unseatedUnconfirmed.length}
            </Badge>
          </Group>
          <Text size="xs" c="dimmed" mb={6}>
            Maybe or no reply. They can be pencilled in, but are not counted as attending.
          </Text>
          <Stack gap={6} component="ul" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {unseatedUnconfirmed.map((g) => (
              <li key={g.id}>
                <GuestCard guest={g} />
              </li>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
}

function RuleIcon({ status }: { status: RuleResult["status"] }) {
  if (status === "broken") return <IconAlertTriangle size={18} color="var(--mantine-color-red-filled)" aria-hidden />;
  if (status === "ok") return <IconCheck size={18} color="var(--mantine-color-teal-filled)" aria-hidden />;
  return <IconClock size={18} color="var(--mantine-color-dimmed)" aria-hidden />;
}

const STATUS_TEXT: Record<RuleResult["status"], string> = {
  broken: "Broken",
  ok: "Met",
  pending: "Waiting for seats",
};

const KIND_TEXT: Record<RuleResult["kind"], string> = {
  together: "Keep together",
  apart: "Keep apart",
  near: "Seat near",
};

function Rules() {
  const { rules, selectTable } = usePlan();
  const order = { broken: 0, pending: 1, ok: 2 } as const;
  const sorted = [...rules].sort((a, b) => order[a.status] - order[b.status]);
  return (
    <Stack gap="xs" component="ul" style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {sorted.map((r) => (
        <li key={r.id}>
          <Paper
            withBorder
            radius="md"
            p="sm"
            style={{ borderColor: r.status === "broken" ? "var(--mantine-color-red-filled)" : undefined }}
          >
            <Group wrap="nowrap" align="flex-start" gap="sm">
              <Box mt={2}>
                <RuleIcon status={r.status} />
              </Box>
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Group gap={6} mb={2}>
                  <Badge size="xs" variant="outline" color="gray">
                    {KIND_TEXT[r.kind]}
                  </Badge>
                  <Text size="xs" c={r.status === "broken" ? "red" : "dimmed"} fw={600}>
                    {STATUS_TEXT[r.status]}
                  </Text>
                </Group>
                <Text size="sm" fw={600}>
                  {r.headline}
                </Text>
                <Text size="sm" c="dimmed">
                  {r.detail}
                </Text>
                <Text size="xs" c="dimmed" fs="italic" mt={4}>
                  Couple&apos;s note: {r.note}
                </Text>
                {r.tableIds.length > 0 && (
                  <Group gap={6} mt={6}>
                    {r.tableIds.map((id) => (
                      <Button key={id} size="compact-xs" variant="light" color="gray" onClick={() => selectTable(id)}>
                        Show {TABLES_BY_ID[id]?.name}
                      </Button>
                    ))}
                  </Group>
                )}
              </Box>
            </Group>
          </Paper>
        </li>
      ))}
    </Stack>
  );
}

function TableDetail() {
  const { selectedTable, seatMap, rules, activeGuest, place, unseat, selectTable } = usePlan();
  const table = selectedTable ? TABLES_BY_ID[selectedTable] : undefined;
  if (!table) {
    return (
      <Text size="sm" c="dimmed" py="md" ta="center">
        Select a table on the plan to see who sits there and what they eat.
      </Text>
    );
  }
  const row = seatMap[table.id] ?? [];
  const guests = row.map((id) => (id ? GUESTS_BY_ID[id] : undefined));
  const seated = guests.filter((g): g is NonNullable<typeof g> => g !== undefined);
  const broken = rules.filter((r) => r.status === "broken" && r.tableIds.includes(table.id));
  const diets = new Map<string, number>();
  for (const g of seated) {
    const key = g.diet ?? "No dietary need";
    diets.set(key, (diets.get(key) ?? 0) + 1);
  }
  const dietList = Array.from(diets.entries()).sort((a, b) => {
    if (a[0] === "No dietary need") return 1;
    if (b[0] === "No dietary need") return -1;
    return a[0].localeCompare(b[0]);
  });
  const active = activeGuest ? GUESTS_BY_ID[activeGuest] : undefined;
  return (
    <Stack gap="sm">
      <Group justify="space-between" wrap="nowrap">
        <Box>
          <Title order={3} size="h4">
            {table.name}
          </Title>
          <Text size="sm" c="dimmed">
            {seated.length} of {table.seats} seats filled
            {row.length - seated.length > 0 ? `, ${row.length - seated.length} free` : ", full"}
          </Text>
        </Box>
        <ActionIcon variant="subtle" color="gray" size={36} aria-label="Close table details" onClick={() => selectTable(null)}>
          <IconX size={18} />
        </ActionIcon>
      </Group>

      {broken.map((r) => (
        <Alert key={r.id} color="red" variant="light" icon={<IconAlertTriangle size={18} />} p="xs" title={r.headline}>
          <Text size="xs">{r.detail}</Text>
        </Alert>
      ))}

      <Box>
        <Text fw={700} size="sm" mb={6}>
          Dietary needs
        </Text>
        {seated.length === 0 ? (
          <Text size="sm" c="dimmed">
            Nobody seated here yet.
          </Text>
        ) : (
          <Group gap={6}>
            {dietList.map(([diet, n]) => (
              <Badge
                key={diet}
                variant={diet === "No dietary need" ? "outline" : "light"}
                color={diet === "No dietary need" ? "gray" : "yellow"}
                size="md"
              >
                {n} {diet}
              </Badge>
            ))}
          </Group>
        )}
      </Box>

      <Box>
        <Text fw={700} size="sm" mb={6}>
          Seats
        </Text>
        <Stack gap={6} component="ol" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {guests.map((g, i) => (
            <li key={`${table.id}-${i}`}>
              {g ? (
                <Paper withBorder radius="md" p="xs">
                  <Group wrap="nowrap" gap="xs">
                    <Text size="xs" c="dimmed" w={18} ta="center" aria-label={`Seat ${i + 1}`}>
                      {i + 1}
                    </Text>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text size="sm" fw={600} truncate>
                        {g.name}
                      </Text>
                      <Group gap={6}>
                        <Text size="xs" c="dimmed">
                          {g.party}
                        </Text>
                        {g.diet && (
                          <Badge size="xs" variant="light" color="yellow">
                            {g.diet}
                          </Badge>
                        )}
                      </Group>
                    </Box>
                    <ActionIcon variant="subtle" color="red" size={36} aria-label={`Unseat ${g.name}`} onClick={() => unseat(g.id)}>
                      <IconUserMinus size={18} />
                    </ActionIcon>
                    <MoveMenu guest={g} />
                  </Group>
                </Paper>
              ) : (
                <Paper radius="md" p="xs" style={{ border: "1px dashed var(--mantine-color-default-border)" }}>
                  <Group wrap="nowrap" gap="xs" justify="space-between">
                    <Group gap="xs" wrap="nowrap">
                      <Text size="xs" c="dimmed" w={18} ta="center" aria-label={`Seat ${i + 1}`}>
                        {i + 1}
                      </Text>
                      <Text size="sm" c="dimmed">
                        Empty seat
                      </Text>
                    </Group>
                    {active && (
                      <Button size="compact-sm" variant="light" onClick={() => place(active.id, table.id, i)}>
                        Seat {active.name.split(" ")[0]} here
                      </Button>
                    )}
                  </Group>
                </Paper>
              )}
            </li>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}

export function SidePanel() {
  const { tab, setTab, unseatedAttending, brokenRules } = usePlan();
  return (
    <Paper withBorder radius="md" p="sm">
      <Tabs value={tab} onChange={(v) => v && setTab(v as PanelTab)} keepMounted={false}>
        <Tabs.List grow mb="sm">
          <Tabs.Tab value="seat" rightSection={<Badge size="xs" circle variant="light" color="orange">{unseatedAttending.length}</Badge>}>
            To seat
          </Tabs.Tab>
          <Tabs.Tab
            value="rules"
            rightSection={
              <Badge size="xs" circle variant={brokenRules.length ? "filled" : "light"} color={brokenRules.length ? "red" : "teal"}>
                {brokenRules.length}
              </Badge>
            }
          >
            Rules
          </Tabs.Tab>
          <Tabs.Tab value="table">Table</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="seat">
          <ToSeat />
        </Tabs.Panel>
        <Tabs.Panel value="rules">
          <Rules />
        </Tabs.Panel>
        <Tabs.Panel value="table">
          <TableDetail />
        </Tabs.Panel>
      </Tabs>
    </Paper>
  );
}
