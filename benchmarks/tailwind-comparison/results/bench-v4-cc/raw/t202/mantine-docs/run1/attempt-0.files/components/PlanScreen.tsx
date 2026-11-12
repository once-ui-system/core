"use client";

import { Alert, Button, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconAlertTriangle, IconArrowBackUp, IconCircleCheck, IconHandStop, IconX } from "@tabler/icons-react";
import { EVENT, GUEST_BY_ID, TABLE_BY_ID, formatEventDate } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { PlanSidebar, SelectedTable } from "./PlanSidebar";
import { RoomPlan } from "./RoomPlan";
import css from "./seatwise.module.css";

function Stat({ label, value, hint, color }: { label: string; value: string | number; hint: string; color?: string }) {
  return (
    <div className={css.card} style={{ padding: "12px 16px" }}>
      <Text size="xs" fw={700} c="dimmed" tt="uppercase">
        {label}
      </Text>
      <Text fz={30} fw={700} lh={1.1} c={color} style={{ fontVariantNumeric: "tabular-nums" }}>
        {value}
      </Text>
      <Text size="xs" c="dimmed">
        {hint}
      </Text>
    </div>
  );
}

export function PlanScreen() {
  const { stats, results, selectTable, held, hold, undo, canUndo } = usePlan();
  const broken = results.filter((r) => r.level === "broken");

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-end" gap="sm">
        <div>
          <Title order={1} size="h2">
            Seating plan
          </Title>
          <Text size="sm" c="dimmed">
            {EVENT.name} · {formatEventDate()} · {EVENT.venue}
          </Text>
        </div>
        <Button variant="default" leftSection={<IconArrowBackUp size={18} />} onClick={undo} disabled={!canUndo}>
          Undo
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="sm">
        <Stat label="Seated" value={stats.seated} hint={`of ${stats.capacity} seats`} />
        <Stat label="Unseated" value={stats.unseatedAttending} hint={`attending, of ${stats.attending}`} color={stats.unseatedAttending ? "orange.8" : "moss.8"} />
        <Stat label="Empty seats" value={stats.empty} hint="across 7 tables" />
        <Stat
          label="Rules"
          value={stats.broken === 0 ? "All kept" : `${stats.broken} broken`}
          hint={`${stats.rules} rules, ${stats.open} waiting for seats`}
          color={stats.broken ? "red.7" : "moss.8"}
        />
      </SimpleGrid>

      {broken.length > 0 ? (
        <Alert color="red" variant="light" icon={<IconAlertTriangle size={20} />} title={`${broken.length} seating ${broken.length === 1 ? "rule is" : "rules are"} broken`}>
          <Stack gap={4}>
            {broken.map((r) => (
              <Group key={r.rule.id} gap="xs" wrap="nowrap" justify="space-between">
                <Text size="sm">{r.headline}</Text>
                {r.tables[0] && (
                  <Button size="compact-sm" variant="subtle" color="red" onClick={() => selectTable(r.tables[0])}>
                    Show {TABLE_BY_ID[r.tables[0]].name}
                  </Button>
                )}
              </Group>
            ))}
          </Stack>
        </Alert>
      ) : (
        <Alert color="green" variant="light" icon={<IconCircleCheck size={20} />} title="Every rule is kept">
          {stats.open > 0 ? `${stats.open} still waiting for guests to be seated.` : "The couple's rules are all satisfied."}
        </Alert>
      )}

      <div className={css.layout}>
        <Stack gap="sm" style={{ minWidth: 0 }}>
          {held ? (
            <Alert color="moss" variant="light" icon={<IconHandStop size={18} />} p="xs" role="status">
              <Group justify="space-between" wrap="nowrap">
                <Text size="sm">
                  <b>{GUEST_BY_ID[held].name}</b> is picked up. Tap an empty seat or a table to place them, or another guest to swap.
                </Text>
                <Button size="compact-sm" variant="default" leftSection={<IconX size={14} />} onClick={() => hold(null)}>
                  Cancel
                </Button>
              </Group>
            </Alert>
          ) : (
            <Text size="sm" c="dimmed">
              Drag guests onto seats, or tap a guest and then a seat. Tap a table to see who sits there.
            </Text>
          )}
          <RoomPlan />
        </Stack>
        <aside className={css.aside} aria-label="Side panel">
          <PlanSidebar />
          <SelectedTable />
        </aside>
      </div>
    </Stack>
  );
}
