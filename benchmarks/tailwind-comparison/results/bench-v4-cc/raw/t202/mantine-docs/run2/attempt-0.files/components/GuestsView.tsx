"use client";

import { useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Grid,
  Group,
  Paper,
  Progress,
  Select,
  SegmentedControl,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { IconCheck, IconCopy, IconSearch } from "@tabler/icons-react";
import {
  DIETS,
  GUESTS,
  PARTIES,
  RSVP_COLOR,
  RSVP_LABEL,
  TABLES_BY_ID,
  initials,
  partyColor,
  type Rsvp,
} from "@/lib/data";
import { usePlan } from "@/lib/plan";

const STANDARD = "Standard menu";

export function GuestsView() {
  const { placements } = usePlan();
  const [query, setQuery] = useState("");
  const [party, setParty] = useState<string | null>(null);
  const [rsvp, setRsvp] = useState<string | null>(null);
  const [diet, setDiet] = useState<string | null>(null);
  const [seating, setSeating] = useState<string | null>(null);
  const [mealScope, setMealScope] = useState<string>("confirmed");
  const clipboard = useClipboard({ timeout: 1800 });

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GUESTS.filter((g) => {
      if (q && !g.name.toLowerCase().includes(q)) return false;
      if (party && g.party !== party) return false;
      if (rsvp && g.rsvp !== rsvp) return false;
      if (diet === "none" && g.diet !== null) return false;
      if (diet && diet !== "none" && diet !== "any" && g.diet !== diet) return false;
      if (diet === "any" && g.diet === null) return false;
      if (seating === "seated" && !placements[g.id]) return false;
      if (seating === "unseated" && placements[g.id]) return false;
      return true;
    });
  }, [query, party, rsvp, diet, seating, placements]);

  const meals = useMemo(() => {
    const counted = GUESTS.filter((g) =>
      mealScope === "confirmed" ? g.rsvp === "yes" : g.rsvp === "yes" || g.rsvp === "maybe" || g.rsvp === "pending",
    );
    const map = new Map<string, number>();
    map.set(STANDARD, 0);
    for (const d of DIETS) map.set(d, 0);
    for (const g of counted) {
      const key = g.diet ?? STANDARD;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return { total: counted.length, list: Array.from(map.entries()).filter(([, n]) => n > 0) };
  }, [mealScope]);

  const mealText = [
    `Meal counts for ${mealScope === "confirmed" ? "confirmed guests" : "confirmed and undecided guests"}`,
    ...meals.list.map(([k, n]) => `${k}: ${n}`),
    `Total: ${meals.total}`,
  ].join("\n");

  const filtersActive = Boolean(query || party || rsvp || diet || seating);

  return (
    <Container size="xl" py="md">
      <Box mb="sm">
        <Title order={1} size="h2">
          Guest list
        </Title>
        <Text size="sm" c="dimmed">
          {GUESTS.length} invited. Seating here follows the plan as you change it.
        </Text>
      </Box>

      <Grid gap="md">
        <Grid.Col span={{ base: 12, lg: 8 }} order={{ base: 2, lg: 1 }}>
          <Paper withBorder radius="md" p="sm">
            <Stack gap="sm">
              <TextInput
                aria-label="Search guests by name"
                placeholder="Search by name"
                leftSection={<IconSearch size={16} />}
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
              />
              <Group gap="xs" grow align="flex-end">
                <Select
                  aria-label="Filter by party"
                  placeholder="All parties"
                  data={PARTIES}
                  value={party}
                  onChange={setParty}
                  clearable
                  style={{ minWidth: 150 }}
                />
                <Select
                  aria-label="Filter by RSVP"
                  placeholder="Any RSVP"
                  data={(Object.keys(RSVP_LABEL) as Rsvp[]).map((k) => ({ value: k, label: RSVP_LABEL[k] }))}
                  value={rsvp}
                  onChange={setRsvp}
                  clearable
                  style={{ minWidth: 130 }}
                />
                <Select
                  aria-label="Filter by diet"
                  placeholder="Any diet"
                  data={[
                    { value: "any", label: "Any dietary need" },
                    { value: "none", label: "No dietary need" },
                    ...DIETS.map((d) => ({ value: d, label: d })),
                  ]}
                  value={diet}
                  onChange={setDiet}
                  clearable
                  style={{ minWidth: 150 }}
                />
                <Select
                  aria-label="Filter by seating"
                  placeholder="Seated or not"
                  data={[
                    { value: "seated", label: "Seated" },
                    { value: "unseated", label: "Not seated" },
                  ]}
                  value={seating}
                  onChange={setSeating}
                  clearable
                  style={{ minWidth: 130 }}
                />
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed" role="status" aria-live="polite">
                  Showing {rows.length} of {GUESTS.length} guests
                </Text>
                {filtersActive && (
                  <Button
                    size="compact-sm"
                    variant="subtle"
                    onClick={() => {
                      setQuery("");
                      setParty(null);
                      setRsvp(null);
                      setDiet(null);
                      setSeating(null);
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </Group>
            </Stack>

            <Table.ScrollContainer minWidth={620} mt="xs">
              <Table highlightOnHover verticalSpacing="xs">
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
                    const seat = placements[g.id];
                    return (
                      <Table.Tr key={g.id}>
                        <Table.Td>
                          <Group gap="xs" wrap="nowrap">
                            <Avatar size={28} radius="xl" color={partyColor(g.party)} variant="filled">
                              {initials(g.name)}
                            </Avatar>
                            <Text size="sm" fw={600}>
                              {g.name}
                            </Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{g.party}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="light" color={RSVP_COLOR[g.rsvp]}>
                            {RSVP_LABEL[g.rsvp]}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          {g.diet ? (
                            <Badge variant="light" color="yellow">
                              {g.diet}
                            </Badge>
                          ) : (
                            <Text size="sm" c="dimmed">
                              None
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          {seat ? (
                            <Text size="sm">
                              {TABLES_BY_ID[seat.table]?.name}
                              <Text span size="xs" c="dimmed">
                                {" "}
                                seat {seat.seat + 1}
                              </Text>
                            </Text>
                          ) : (
                            <Text size="sm" c={g.rsvp === "yes" ? "orange" : "dimmed"} fw={g.rsvp === "yes" ? 600 : 400}>
                              {g.rsvp === "no" ? "Not coming" : "Unseated"}
                            </Text>
                          )}
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                  {rows.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={5}>
                        <Text ta="center" c="dimmed" py="lg" size="sm">
                          No guests match these filters.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }} order={{ base: 1, lg: 2 }}>
          <Paper withBorder radius="md" p="md">
            <Group justify="space-between" mb="xs" wrap="nowrap" align="flex-start">
              <Box>
                <Title order={2} size="h4">
                  Meals for the caterer
                </Title>
                <Text size="xs" c="dimmed">
                  One meal per guest, dietary needs included. Not affected by the filters.
                </Text>
              </Box>
              <Button
                size="compact-sm"
                variant="light"
                color={clipboard.copied ? "teal" : undefined}
                leftSection={clipboard.copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                onClick={() => clipboard.copy(mealText)}
              >
                {clipboard.copied ? "Copied" : "Copy"}
              </Button>
            </Group>
            <SegmentedControl
              fullWidth
              size="xs"
              mb="sm"
              value={mealScope}
              onChange={setMealScope}
              aria-label="Which guests to count"
              data={[
                { value: "confirmed", label: "Confirmed" },
                { value: "all", label: "Incl. maybe and no reply" },
              ]}
            />
            <Stack gap="xs" component="ul" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {meals.list.map(([k, n]) => (
                <li key={k}>
                  <Group justify="space-between" mb={2} wrap="nowrap">
                    <Text size="sm" fw={k === STANDARD ? 700 : 500}>
                      {k}
                    </Text>
                    <Text size="sm" fw={700} style={{ fontVariantNumeric: "tabular-nums" }}>
                      {n}
                    </Text>
                  </Group>
                  <Progress
                    value={(n / Math.max(meals.total, 1)) * 100}
                    size="sm"
                    color={k === STANDARD ? "indigo" : "yellow"}
                    aria-label={`${k}: ${n} of ${meals.total}`}
                  />
                </li>
              ))}
            </Stack>
            <Group justify="space-between" mt="md" pt="sm" style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}>
              <Text fw={700}>Total meals</Text>
              <Text fw={800} fz="lg">
                {meals.total}
              </Text>
            </Group>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
