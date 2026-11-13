"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Anchor, Badge, Box, Button, Card, Group, Select, Stack, Table, Text, TextInput, Title, UnstyledButton } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCopy, IconSearch } from "@tabler/icons-react";
import { GUESTS, PARTIES, RSVP_COLOR, RSVP_LABEL, STANDARD_MEAL, TABLES, type Rsvp } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { tableById } from "@/lib/rules";
import { partyStyle } from "@/lib/style";
import classes from "./room.module.css";

const NO_DIET = "__none";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const DIETS = [...new Set(GUESTS.flatMap((g) => (g.diet ? [g.diet] : [])))].sort((a, b) => a.localeCompare(b));

const RSVP_OPTIONS = (Object.keys(RSVP_LABEL) as Rsvp[]).map((k) => ({ value: k, label: RSVP_LABEL[k] }));

function mealsFor(): { meal: string; confirmed: number; awaiting: number }[] {
  const meals = [STANDARD_MEAL, ...DIETS];
  return meals.map((meal) => {
    const match = (d: string | null) => (meal === STANDARD_MEAL ? d === null : d === meal);
    return {
      meal,
      confirmed: GUESTS.filter((g) => g.rsvp === "yes" && match(g.diet)).length,
      awaiting: GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && match(g.diet)).length,
    };
  });
}

export function GuestsView() {
  const { tableOf, selectTable } = usePlan();
  const [query, setQuery] = useState("");
  const [party, setParty] = useState<string | null>(null);
  const [rsvp, setRsvp] = useState<string | null>(null);
  const [diet, setDiet] = useState<string | null>(null);

  const meals = useMemo(mealsFor, []);
  const totalConfirmed = meals.reduce((n, m) => n + m.confirmed, 0);
  const totalAwaiting = meals.reduce((n, m) => n + m.awaiting, 0);

  const rows = useMemo(() => {
    const q = norm(query.trim());
    return GUESTS.filter((g) => {
      if (q && !norm(g.name).includes(q)) return false;
      if (party && g.party !== party) return false;
      if (rsvp && g.rsvp !== rsvp) return false;
      if (diet === NO_DIET && g.diet !== null) return false;
      if (diet && diet !== NO_DIET && g.diet !== diet) return false;
      return true;
    });
  }, [query, party, rsvp, diet]);

  const filtered = Boolean(query || party || rsvp || diet);
  const dietOptions = [{ value: NO_DIET, label: STANDARD_MEAL }, ...DIETS.map((d) => ({ value: d, label: d }))];

  const copySummary = async () => {
    const lines = [
      "Ines & Mateo's wedding dinner: meals for the caterer",
      ...meals.filter((m) => m.confirmed > 0).map((m) => `${m.meal}: ${m.confirmed}`),
      `Total attending: ${totalConfirmed}`,
      `Still awaiting a reply: ${totalAwaiting}`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      notifications.show({ color: "green", title: "Copied", message: "Meal counts are on your clipboard." });
    } catch {
      notifications.show({ color: "red", title: "Could not copy", message: "Select the counts and copy them by hand." });
    }
  };

  return (
    <Stack gap="md">
      <Box>
        <Title order={1} size="h2">
          Guest list
        </Title>
        <Text c="gray.7" size="sm">
          {GUESTS.length} invited · {totalConfirmed} attending · {totalAwaiting} awaiting a reply
        </Text>
      </Box>

      <Box className={classes.guestsLayout}>
        <Card p={0} aria-label="Guests">
          <Box p="md" style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}>
            <Box style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))" }}>
              <TextInput
                label="Search"
                placeholder="Name"
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
                leftSection={<IconSearch size={16} aria-hidden />}
              />
              <Select label="Party" placeholder="All parties" data={PARTIES} value={party} onChange={setParty} clearable />
              <Select label="RSVP" placeholder="Any reply" data={RSVP_OPTIONS} value={rsvp} onChange={setRsvp} clearable />
              <Select label="Diet" placeholder="All diets" data={dietOptions} value={diet} onChange={setDiet} clearable />
            </Box>
            <Group justify="space-between" mt="sm" mih={32}>
              <Text size="sm" c="gray.8" role="status">
                Showing {rows.length} of {GUESTS.length} guests
              </Text>
              {filtered ? (
                <Button
                  size="compact-sm"
                  variant="subtle"
                  onClick={() => {
                    setQuery("");
                    setParty(null);
                    setRsvp(null);
                    setDiet(null);
                  }}
                >
                  Clear filters
                </Button>
              ) : null}
            </Group>
          </Box>

          <Table.ScrollContainer minWidth={620}>
            <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover stickyHeader>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Guest</Table.Th>
                  <Table.Th>Party</Table.Th>
                  <Table.Th>RSVP</Table.Th>
                  <Table.Th>Diet</Table.Th>
                  <Table.Th>Table</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.map((g) => {
                  const tid = tableOf(g.id);
                  const ps = partyStyle(g.party);
                  return (
                    <Table.Tr key={g.id}>
                      <Table.Td>
                        <Text size="sm" fw={600}>
                          {g.name}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={8} wrap="nowrap">
                          <Box w={12} h={12} aria-hidden style={{ flex: "none", borderRadius: "50%", background: ps.bg, border: `2px solid ${ps.edge}` }} />
                          <Text size="sm">{g.party}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" color={RSVP_COLOR[g.rsvp]} c="gray.9">
                          {RSVP_LABEL[g.rsvp]}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {g.diet ? (
                          <Badge variant="light" color="orange" c="gray.9">
                            {g.diet}
                          </Badge>
                        ) : (
                          <Text size="sm" c="gray.7">
                            None
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        {tid ? (
                          <Anchor component={Link} href="/" size="sm" fw={600} onClick={() => selectTable(tid)} aria-label={`${tableById.get(tid)?.name ?? tid}: show on the plan`}>
                            {tableById.get(tid)?.name ?? tid}
                          </Anchor>
                        ) : g.rsvp === "no" ? (
                          <Text size="sm" c="gray.7">
                            Not coming
                          </Text>
                        ) : (
                          <Text size="sm" fw={600} c={g.rsvp === "yes" ? "red.8" : "gray.7"}>
                            Not seated
                          </Text>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
                {rows.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Text ta="center" c="gray.7" py="lg" size="sm">
                        No guests match these filters.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : null}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Card>

        <Card aria-label="Meal counts">
          <Group justify="space-between" align="flex-start" mb="xs" wrap="nowrap">
            <Box>
              <Title order={2} size="h3">
                Meals for the caterer
              </Title>
              <Text size="sm" c="gray.7">
                Attending guests by meal. Tap a row to filter the list.
              </Text>
            </Box>
          </Group>
          <Table verticalSpacing={6} horizontalSpacing="xs" aria-label="Meal counts">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Meal</Table.Th>
                <Table.Th ta="right">Attending</Table.Th>
                <Table.Th ta="right">Awaiting</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {meals.map((m) => {
                const value = m.meal === STANDARD_MEAL ? NO_DIET : m.meal;
                return (
                  <Table.Tr key={m.meal}>
                    <Table.Td p={0}>
                      <UnstyledButton
                        onClick={() => setDiet(diet === value ? null : value)}
                        aria-pressed={diet === value}
                        w="100%"
                        px="xs"
                        py={8}
                        style={{ minHeight: 40, fontSize: "var(--mantine-font-size-sm)", fontWeight: diet === value ? 700 : 500 }}
                      >
                        {m.meal}
                      </UnstyledButton>
                    </Table.Td>
                    <Table.Td ta="right" fw={700}>
                      {m.confirmed}
                    </Table.Td>
                    <Table.Td ta="right" c="gray.7">
                      {m.awaiting}
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
            <Table.Tfoot>
              <Table.Tr>
                <Table.Th>Total</Table.Th>
                <Table.Th ta="right">{totalConfirmed}</Table.Th>
                <Table.Th ta="right">{totalAwaiting}</Table.Th>
              </Table.Tr>
            </Table.Tfoot>
          </Table>
          <Text size="xs" c="gray.7" mt="xs">
            {GUESTS.filter((g) => g.rsvp === "no").length} declined and are not counted. {TABLES.length} tables seat up to{" "}
            {TABLES.reduce((n, t) => n + t.seats, 0)}.
          </Text>
          <Button mt="sm" variant="light" leftSection={<IconCopy size={16} aria-hidden />} onClick={copySummary}>
            Copy summary for the caterer
          </Button>
        </Card>
      </Box>
    </Stack>
  );
}
