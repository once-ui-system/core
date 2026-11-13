"use client";

import { ActionIcon, Badge, Box, Button, Card, Group, Progress, Stack, Text, Title, Tooltip, UnstyledButton } from "@mantine/core";
import { IconAlertTriangle, IconUserMinus } from "@tabler/icons-react";
import { STANDARD_MEAL, TABLES, initials } from "@/lib/data";
import { usePlan, usePlanStats } from "@/lib/plan";
import { tableById } from "@/lib/rules";
import { partyStyle } from "@/lib/style";

function Overview() {
  const { selectTable } = usePlan();
  const { perTable } = usePlanStats();
  return (
    <Stack gap="xs">
      <Text size="sm" c="gray.7">
        Select a table on the plan to see who sits there and what they eat.
      </Text>
      <Box component="ul" m={0} p={0} style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
        {TABLES.map((t) => {
          const n = perTable[t.id] ?? 0;
          return (
            <li key={t.id}>
              <UnstyledButton
                onClick={() => selectTable(t.id)}
                w="100%"
                py={6}
                px="xs"
                style={{ borderRadius: 8, minHeight: 44 }}
              >
                <Group justify="space-between" mb={4} wrap="nowrap">
                  <Text size="sm" fw={600}>
                    {t.name}
                  </Text>
                  <Text size="sm" c="gray.7">
                    {n} / {t.seats}
                  </Text>
                </Group>
                <Progress value={(n / t.seats) * 100} size="sm" color={n === t.seats ? "green" : "brand"} aria-hidden />
              </UnstyledButton>
            </li>
          );
        })}
      </Box>
    </Stack>
  );
}

export function TablePanel() {
  const { selectedTable, selectTable, selectedGuest, occupants, unseat, place, selectGuest, rules } = usePlan();
  const table = selectedTable ? tableById.get(selectedTable) : undefined;

  if (!table) {
    return (
      <Card aria-label="Tables">
        <Title order={3} size="h4" mb="xs">
          Tables
        </Title>
        <Overview />
      </Card>
    );
  }

  const people = occupants(table.id);
  const taken = people.filter((p) => p !== null).length;
  const needs = new Map<string, number>();
  for (const p of people) {
    if (p?.diet) needs.set(p.diet, (needs.get(p.diet) ?? 0) + 1);
  }
  const tableRules = rules.filter((r) => r.tableIds.includes(table.id) && r.status !== "ok");

  return (
    <Card aria-label={`${table.name} details`}>
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb="xs">
        <Box>
          <Title order={3} size="h4">
            {table.name}
          </Title>
          <Text size="sm" c="gray.7">
            {taken} of {table.seats} seats taken · {table.seats - taken} free
          </Text>
        </Box>
        <Button variant="subtle" color="gray.7" size="compact-sm" onClick={() => selectTable(null)}>
          All tables
        </Button>
      </Group>
      <Progress value={(taken / table.seats) * 100} size="sm" mb="sm" aria-hidden />

      {tableRules.map((r) => (
        <Group key={r.index} gap={8} wrap="nowrap" align="flex-start" mb={6}>
          <Box c={r.status === "broken" ? "red.8" : "gray.7"} pt={2}>
            <IconAlertTriangle size={16} aria-hidden />
          </Box>
          <Text size="sm" c={r.status === "broken" ? "red.8" : "gray.8"}>
            <b>{r.status === "broken" ? "Broken: " : "Open: "}</b>
            {r.title}. {r.detail}
          </Text>
        </Group>
      ))}

      <Text size="xs" fw={700} c="gray.7" tt="uppercase" mt="xs" mb={4}>
        Guests and dietary needs
      </Text>
      <Box component="ol" m={0} p={0} style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
        {people.map((g, i) => {
          if (!g) {
            const canPlace = Boolean(selectedGuest);
            return (
              <li key={`empty-${i}`}>
                <Group justify="space-between" wrap="nowrap" mih={40} px={8} style={{ border: "1px dashed var(--mantine-color-gray-4)", borderRadius: 8 }}>
                  <Text size="sm" c="gray.7">
                    Seat {i + 1}: empty
                  </Text>
                  {canPlace ? (
                    <Button size="compact-sm" variant="light" onClick={() => selectedGuest && place(selectedGuest, table.id, i)}>
                      Seat here
                    </Button>
                  ) : null}
                </Group>
              </li>
            );
          }
          const p = partyStyle(g.party);
          return (
            <li key={g.id}>
              <Group justify="space-between" wrap="nowrap" mih={44} px={8} gap="xs" style={{ border: "1px solid var(--mantine-color-gray-3)", borderRadius: 8 }}>
                <UnstyledButton
                  onClick={() => selectGuest(selectedGuest === g.id ? null : g.id)}
                  aria-pressed={selectedGuest === g.id}
                  style={{ flex: 1, minWidth: 0, minHeight: 40 }}
                >
                  <Group gap={8} wrap="nowrap">
                    <Box
                      aria-hidden
                      w={26}
                      h={26}
                      style={{ flex: "none", borderRadius: "50%", background: p.bg, color: p.fg, border: `1.5px solid ${p.edge}`, display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700 }}
                    >
                      {initials(g.name)}
                    </Box>
                    <Box style={{ minWidth: 0 }}>
                      <Text size="sm" fw={600} lh={1.2} truncate>
                        {g.name}
                      </Text>
                      <Text size="xs" c="gray.7" lh={1.2}>
                        Seat {i + 1} · {g.party}
                      </Text>
                    </Box>
                  </Group>
                </UnstyledButton>
                {g.diet ? (
                  <Badge size="sm" variant="light" color="orange" c="gray.9">
                    {g.diet}
                  </Badge>
                ) : (
                  <Text size="xs" c="gray.7" style={{ flex: "none" }}>
                    {STANDARD_MEAL}
                  </Text>
                )}
                <Tooltip label={`Unseat ${g.name}`}>
                  <ActionIcon variant="subtle" color="gray.7" size="lg" onClick={() => unseat(g.id)} aria-label={`Unseat ${g.name}`}>
                    <IconUserMinus size={18} aria-hidden />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </li>
          );
        })}
      </Box>

      <Text size="xs" fw={700} c="gray.7" tt="uppercase" mt="sm" mb={4}>
        Dietary summary
      </Text>
      {needs.size === 0 ? (
        <Text size="sm" c="gray.7">
          No dietary needs at this table.
        </Text>
      ) : (
        <Group gap={6}>
          {[...needs.entries()].map(([diet, n]) => (
            <Badge key={diet} variant="light" color="orange" c="gray.9" size="md">
              {n} × {diet}
            </Badge>
          ))}
        </Group>
      )}
    </Card>
  );
}
