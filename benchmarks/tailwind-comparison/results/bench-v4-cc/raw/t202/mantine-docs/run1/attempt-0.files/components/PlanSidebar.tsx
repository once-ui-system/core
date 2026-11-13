"use client";

import { Alert, Badge, Button, Group, Progress, Stack, Tabs, Text, ThemeIcon } from "@mantine/core";
import { IconAlertTriangle, IconCheck, IconCircleDashed, IconCircleCheck } from "@tabler/icons-react";
import { useState } from "react";
import { GUEST_BY_ID, TABLES, TABLE_BY_ID, dietColor, STANDARD_MEAL } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import type { RuleLevel } from "@/lib/seating";
import { GuestRow } from "./GuestRow";
import css from "./seatwise.module.css";

const LEVEL_ORDER: Record<RuleLevel, number> = { broken: 0, open: 1, ok: 2 };

export function PlanSidebar() {
  const { unseatedAttending, unseatedTentative, results, stats, seats, tableFlags, selectedTable, selectTable } = usePlan();
  const [tab, setTab] = useState<string | null>("unseated");
  const sorted = [...results].sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);

  return (
    <section className={css.card} aria-label="Guests, rules and tables">
      <Tabs value={tab} onChange={setTab} keepMounted={false}>
        <Tabs.List grow>
          <Tabs.Tab value="unseated" rightSection={<Badge size="sm" circle color={stats.unseatedAttending ? "orange" : "green"}>{stats.unseatedAttending}</Badge>}>
            Unseated
          </Tabs.Tab>
          <Tabs.Tab value="rules" rightSection={<Badge size="sm" circle color={stats.broken ? "red" : "green"}>{stats.broken}</Badge>}>
            Rules
          </Tabs.Tab>
          <Tabs.Tab value="tables">Tables</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="unseated" pt="md">
          <Stack gap="xs">
            <Text size="xs" c="dimmed">
              Attending guests without a seat. Drag one onto a seat or table, or tap a guest and then a seat.
            </Text>
            {unseatedAttending.length === 0 && (
              <Alert color="green" variant="light" icon={<IconCircleCheck size={18} />}>
                Everyone who is attending has a seat.
              </Alert>
            )}
            {unseatedAttending.map((g) => (
              <GuestRow key={g.id} guest={g} />
            ))}
            {unseatedTentative.length > 0 && (
              <>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" mt="sm">
                  Not confirmed yet ({unseatedTentative.length})
                </Text>
                {unseatedTentative.map((g) => (
                  <GuestRow key={g.id} guest={g} />
                ))}
              </>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="rules" pt="md">
          <Stack gap="xs">
            {sorted.map((r) => {
              const color = r.level === "broken" ? "red" : r.level === "ok" ? "green" : "gray";
              return (
                <button
                  key={r.rule.id}
                  type="button"
                  className={css.tableRow}
                  onClick={() => r.tables[0] && selectTable(r.tables[0])}
                  aria-label={`${r.kindLabel}: ${r.headline}. ${r.detail}`}
                >
                  <Group gap="sm" align="flex-start" wrap="nowrap">
                    <ThemeIcon color={color} variant="light" radius="xl" size={28}>
                      {r.level === "broken" ? <IconAlertTriangle size={16} /> : r.level === "ok" ? <IconCheck size={16} /> : <IconCircleDashed size={16} />}
                    </ThemeIcon>
                    <div style={{ minWidth: 0 }}>
                      <Group gap={6}>
                        <Badge size="xs" variant="outline" color="gray">
                          {r.kindLabel}
                        </Badge>
                        <Text size="xs" c={color === "gray" ? "dimmed" : color} fw={700}>
                          {r.level === "broken" ? "Broken" : r.level === "ok" ? "Kept" : "Waiting for seats"}
                        </Text>
                      </Group>
                      <Text size="sm" fw={600} mt={2}>
                        {r.headline}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {r.detail}
                      </Text>
                      <Text size="xs" fs="italic" c="dimmed" mt={2}>
                        Note: {r.rule.note}
                      </Text>
                      {r.rule.caution && (
                        <Text size="xs" c="orange.8" mt={2}>
                          {r.rule.caution}
                        </Text>
                      )}
                    </div>
                  </Group>
                </button>
              );
            })}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="tables" pt="md">
          <Stack gap="xs">
            {TABLES.map((t) => {
              const taken = seats[t.id].filter(Boolean).length;
              const flags = tableFlags[t.id] ?? [];
              const dietary = seats[t.id].filter((id) => id && GUEST_BY_ID[id].diet).length;
              return (
                <button
                  key={t.id}
                  type="button"
                  className={css.tableRow}
                  data-selected={selectedTable === t.id ? "true" : undefined}
                  onClick={() => selectTable(t.id)}
                  aria-pressed={selectedTable === t.id}
                >
                  <Group justify="space-between" wrap="nowrap" mb={6}>
                    <Text size="sm" fw={600}>
                      {TABLE_BY_ID[t.id].name}
                    </Text>
                    <Group gap={6} wrap="nowrap">
                      {dietary > 0 && (
                        <Badge size="xs" color="orange" variant="light">
                          {dietary} dietary
                        </Badge>
                      )}
                      {flags.length > 0 && (
                        <Badge size="xs" color="red" variant="filled" leftSection={<IconAlertTriangle size={10} />}>
                          Rule
                        </Badge>
                      )}
                      <Text size="sm" fw={600} style={{ fontVariantNumeric: "tabular-nums" }}>
                        {taken}/{t.seats}
                      </Text>
                    </Group>
                  </Group>
                  <Progress value={(taken / t.seats) * 100} size="sm" color={taken === t.seats ? "moss" : "moss.4"} aria-label={`${taken} of ${t.seats} seats taken`} />
                </button>
              );
            })}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </section>
  );
}

export function SelectedTable() {
  const { selectedTable, seats, tableFlags, held, seatGuest } = usePlan();
  const t = selectedTable ? TABLE_BY_ID[selectedTable] : null;

  if (!t) {
    return (
      <section className={css.card} aria-label="Selected table">
        <Text fw={600}>No table selected</Text>
        <Text size="sm" c="dimmed" mt={4}>
          Tap a table or a seat in the room, or pick one under Tables, to see who sits there and what they eat.
        </Text>
      </section>
    );
  }

  const row = seats[t.id];
  const taken = row.filter(Boolean).length;
  const flags = tableFlags[t.id] ?? [];
  const emptySeats = row.map((id, i) => (id ? null : i + 1)).filter((n): n is number => n !== null);
  const needs = new Map<string, number>();
  let standard = 0;
  for (const id of row) {
    if (!id) continue;
    const d = GUEST_BY_ID[id].diet;
    if (d) needs.set(d, (needs.get(d) ?? 0) + 1);
    else standard += 1;
  }

  return (
    <section className={css.card} aria-label={`${t.name} details`}>
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <div>
          <Text fw={700} size="lg" lh={1.2}>
            {t.name}
          </Text>
          <Text size="xs" c="dimmed">
            {t.shape === "long" ? "Long table" : "Round table"}, {taken} of {t.seats} seats taken
          </Text>
        </div>
        <Badge color={taken === t.seats ? "moss" : "gray"} variant="light">
          {t.seats - taken} free
        </Badge>
      </Group>
      <Progress mt="sm" value={(taken / t.seats) * 100} size="sm" color="moss" aria-label={`${taken} of ${t.seats} seats taken`} />

      {flags.map((r) => (
        <Alert key={r.rule.id} mt="sm" color="red" variant="light" icon={<IconAlertTriangle size={16} />} p="xs">
          <Text size="sm" fw={600}>
            {r.headline}
          </Text>
          <Text size="xs">{r.detail}</Text>
        </Alert>
      ))}

      <Text size="xs" fw={700} c="dimmed" tt="uppercase" mt="md" mb={6}>
        Dietary needs
      </Text>
      {taken === 0 ? (
        <Text size="sm" c="dimmed">
          Nobody is seated here yet.
        </Text>
      ) : (
        <Group gap={6}>
          {Array.from(needs.entries()).map(([d, n]) => (
            <Badge key={d} color={dietColor(d)} variant="light">
              {n} {d}
            </Badge>
          ))}
          {standard > 0 && (
            <Badge color="gray" variant="outline">
              {standard} {STANDARD_MEAL.toLowerCase()}
            </Badge>
          )}
        </Group>
      )}

      <Text size="xs" fw={700} c="dimmed" tt="uppercase" mt="md" mb={6}>
        Guests
      </Text>
      <Stack gap="xs">
        {row.map((id, i) => (id ? <GuestRow key={id} guest={GUEST_BY_ID[id]} seatLabel={`Seat ${i + 1}`} /> : null))}
      </Stack>

      {emptySeats.length > 0 && (
        <Text size="sm" c="dimmed" mt="sm">
          Empty {emptySeats.length === 1 ? "seat" : "seats"}: {emptySeats.join(", ")}
        </Text>
      )}
      {held && emptySeats.length > 0 && (
        <Button mt="sm" fullWidth onClick={() => seatGuest(held, t.id)}>
          Seat {GUEST_BY_ID[held].name} here
        </Button>
      )}
    </section>
  );
}
