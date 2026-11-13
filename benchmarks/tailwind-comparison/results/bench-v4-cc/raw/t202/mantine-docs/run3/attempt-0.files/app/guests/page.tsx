"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Container,
  Grid,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { DietBadge, PartyDot, RsvpBadge } from "@/components/ui";
import { usePlan } from "@/components/PlanProvider";
import { EVENT, GUESTS, TABLES, type Rsvp } from "@/lib/data";
import { mealCounts, tableById } from "@/lib/plan";

const NO_DIET = "__none";
const UNSEATED = "__unseated";

const PARTIES = Array.from(new Set(GUESTS.map((x) => x.party)));
const DIETS = Array.from(new Set(GUESTS.map((x) => x.diet).filter((d): d is string => !!d))).sort();
const RSVP_OPTIONS: { value: Rsvp; label: string }[] = [
  { value: "yes", label: "Attending" },
  { value: "maybe", label: "Maybe" },
  { value: "pending", label: "Awaiting reply" },
  { value: "no", label: "Declined" },
];

export default function GuestsPage() {
  const { seats } = usePlan();
  const [query, setQuery] = useState("");
  const [party, setParty] = useState<string | null>(null);
  const [rsvp, setRsvp] = useState<string | null>(null);
  const [diet, setDiet] = useState<string | null>(null);
  const [table, setTable] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GUESTS.filter((x) => {
      if (q && !x.name.toLowerCase().includes(q)) return false;
      if (party && x.party !== party) return false;
      if (rsvp && x.rsvp !== rsvp) return false;
      if (diet === NO_DIET && x.diet) return false;
      if (diet && diet !== NO_DIET && x.diet !== diet) return false;
      const ref = seats[x.id];
      if (table === UNSEATED && ref) return false;
      if (table && table !== UNSEATED && ref?.tableId !== table) return false;
      return true;
    });
  }, [query, party, rsvp, diet, table, seats]);

  const meals = useMemo(() => mealCounts(seats), [seats]);
  const totalConfirmed = meals.reduce((s, r) => s + r.confirmed, 0);
  const totalUnconfirmed = meals.reduce((s, r) => s + r.unconfirmed, 0);
  const totalSeated = meals.reduce((s, r) => s + r.seated, 0);
  const specialConfirmed = meals.filter((r) => r.special).reduce((s, r) => s + r.confirmed, 0);

  const filtersOn = !!(query || party || rsvp || diet || table);
  const reset = () => {
    setQuery("");
    setParty(null);
    setRsvp(null);
    setDiet(null);
    setTable(null);
  };

  return (
    <Container size={1400} px="md" py="lg">
      <Stack gap="md">
        <div>
          <Title order={1} size="h2">
            Guest list
          </Title>
          <Text c="gray.8">
            {EVENT.name} · {GUESTS.length} invited, {totalConfirmed} attending
          </Text>
        </div>

        <Grid gap="md">
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Paper withBorder radius="lg" p="md">
              <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing="sm">
                <TextInput
                  label="Search"
                  placeholder="Guest name"
                  leftSection={<IconSearch size={16} />}
                  value={query}
                  onChange={(e) => setQuery(e.currentTarget.value)}
                />
                <Select
                  label="Party"
                  placeholder="All parties"
                  data={PARTIES}
                  value={party}
                  onChange={setParty}
                  clearable
                />
                <Select
                  label="RSVP"
                  placeholder="Any reply"
                  data={RSVP_OPTIONS}
                  value={rsvp}
                  onChange={setRsvp}
                  clearable
                />
                <Select
                  label="Diet"
                  placeholder="Any diet"
                  data={[{ value: NO_DIET, label: "No dietary need" }, ...DIETS.map((d) => ({ value: d, label: d }))]}
                  value={diet}
                  onChange={setDiet}
                  clearable
                />
                <Select
                  label="Table"
                  placeholder="Any table"
                  data={[
                    { value: UNSEATED, label: "Unseated" },
                    ...TABLES.map((t) => ({ value: t.id, label: t.name })),
                  ]}
                  value={table}
                  onChange={setTable}
                  clearable
                />
              </SimpleGrid>
              <Group justify="space-between" mt="sm">
                <Text size="sm" c="gray.8" role="status" aria-live="polite">
                  Showing {filtered.length} of {GUESTS.length} guests
                </Text>
                {filtersOn && (
                  <Button size="compact-sm" variant="subtle" onClick={reset}>
                    Clear filters
                  </Button>
                )}
              </Group>

              <Table.ScrollContainer minWidth={620} mt="xs">
                <Table verticalSpacing="xs" highlightOnHover>
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
                    {filtered.length === 0 && (
                      <Table.Tr>
                        <Table.Td colSpan={5}>
                          <Text ta="center" c="gray.8" py="md">
                            No guests match these filters.
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    )}
                    {filtered.map((x) => {
                      const ref = seats[x.id];
                      return (
                        <Table.Tr key={x.id}>
                          <Table.Td>
                            <Text size="sm" fw={600}>
                              {x.name}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Group gap={6} wrap="nowrap">
                              <PartyDot party={x.party} />
                              <Text size="sm">{x.party}</Text>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <RsvpBadge rsvp={x.rsvp} />
                          </Table.Td>
                          <Table.Td>
                            {x.diet ? <DietBadge diet={x.diet} /> : <Text size="sm" c="gray.7">None</Text>}
                          </Table.Td>
                          <Table.Td>
                            {ref ? (
                              <Badge variant="light" color="fig" style={{ textTransform: "none" }}>
                                {tableById[ref.tableId]?.name} · seat {ref.seat + 1}
                              </Badge>
                            ) : (
                              <Text size="sm" c={x.rsvp === "no" ? "gray.7" : "orange.9"}>
                                {x.rsvp === "no" ? "Not coming" : "Unseated"}
                              </Text>
                            )}
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Paper withBorder radius="lg" p="md" style={{ position: "sticky", top: 76 }}>
              <Title order={2} size="h5">
                Meals for the caterer
              </Title>
              <Text size="sm" c="gray.8" mt={4}>
                {totalConfirmed} confirmed meals, {specialConfirmed} with a dietary need.
              </Text>
              <Table mt="sm" verticalSpacing={6} fz="sm" aria-label="Meal counts">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Meal</Table.Th>
                    <Table.Th ta="right">Confirmed</Table.Th>
                    <Table.Th ta="right">Not yet</Table.Th>
                    <Table.Th ta="right">Seated</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {meals.map((r) => (
                    <Table.Tr key={r.meal}>
                      <Table.Td>{r.meal}</Table.Td>
                      <Table.Td ta="right" fw={700}>
                        {r.confirmed}
                      </Table.Td>
                      <Table.Td ta="right">{r.unconfirmed || "–"}</Table.Td>
                      <Table.Td ta="right">{r.seated}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
                <Table.Tfoot>
                  <Table.Tr>
                    <Table.Th>Total</Table.Th>
                    <Table.Th ta="right">{totalConfirmed}</Table.Th>
                    <Table.Th ta="right">{totalUnconfirmed}</Table.Th>
                    <Table.Th ta="right">{totalSeated}</Table.Th>
                  </Table.Tr>
                </Table.Tfoot>
              </Table>
              <Text size="xs" c="gray.7" mt="sm">
                Confirmed counts guests who replied yes. Not yet counts maybe and awaiting reply. Declined guests are
                left out. Seated follows the plan.
              </Text>
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
