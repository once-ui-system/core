"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
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
import { useClipboard } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconCopy, IconSearch, IconFilterOff } from "@tabler/icons-react";
import {
  RSVP_LABEL,
  STANDARD_MEAL,
  diets,
  event,
  formatEventDate,
  guests,
  parties,
  type Rsvp,
} from "@/lib/data";
import { mealCounts, tableById } from "@/lib/plan";
import { DietBadge, MealLabel, PartyBadge, RsvpBadge } from "./GuestBits";
import { usePlan } from "./PlanProvider";

const NO_DIET = "__none";

const RSVP_OPTIONS = (Object.keys(RSVP_LABEL) as Rsvp[]).map((value) => ({
  value,
  label: RSVP_LABEL[value],
}));

const DIET_OPTIONS = [
  { value: NO_DIET, label: "No dietary needs" },
  ...diets.map((d) => ({ value: d, label: d })),
];

function SummaryCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <Paper withBorder p="sm">
      <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: 0.4 }}>
        {label}
      </Text>
      <Text fz={26} fw={700} lh={1.15}>
        {value}
      </Text>
      {sub ? (
        <Text size="xs" c="dimmed">
          {sub}
        </Text>
      ) : null}
    </Paper>
  );
}

function CatererMeals() {
  const clipboard = useClipboard({ timeout: 2000 });
  const rows = useMemo(() => mealCounts(STANDARD_MEAL), []);
  const confirmed = rows.reduce((n, r) => n + r.confirmed, 0);
  const undecided = rows.reduce((n, r) => n + r.undecided, 0);

  const copy = () => {
    const lines = [
      `${event.name}, ${formatEventDate()}`,
      `${event.venue}`,
      "",
      `Meals for confirmed guests (${confirmed}):`,
      ...rows.filter((r) => r.confirmed > 0).map((r) => `- ${r.meal}: ${r.confirmed}`),
      "",
      `Not confirmed yet (maybe or awaiting reply): ${undecided}`,
      ...rows.filter((r) => r.undecided > 0).map((r) => `- ${r.meal}: ${r.undecided}`),
    ];
    clipboard.copy(lines.join("\n"));
    notifications.show({
      color: "teal",
      icon: <IconCheck size={16} />,
      message: "Meal counts copied for the caterer.",
    });
  };

  return (
    <Paper withBorder p="md">
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb="xs">
        <div>
          <Title order={2} size="h4">Meals for the caterer</Title>
          <Text size="sm" c="dimmed">
            By RSVP, whatever the filters show. Declined guests are left out.
          </Text>
        </div>
      </Group>
      <Table verticalSpacing="xs" aria-label="Meal counts for the caterer">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Meal</Table.Th>
            <Table.Th ta="right">Confirmed</Table.Th>
            <Table.Th ta="right">Not confirmed</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((r) => (
            <Table.Tr key={r.meal}>
              <Table.Td>
                <MealLabel meal={r.meal} standard={r.meal === STANDARD_MEAL} />
              </Table.Td>
              <Table.Td ta="right" fw={700}>
                {r.confirmed}
              </Table.Td>
              <Table.Td ta="right" c={r.undecided > 0 ? undefined : "dimmed"}>
                {r.undecided}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
        <Table.Tfoot>
          <Table.Tr>
            <Table.Th>Total meals</Table.Th>
            <Table.Th ta="right">{confirmed}</Table.Th>
            <Table.Th ta="right">{undecided}</Table.Th>
          </Table.Tr>
        </Table.Tfoot>
      </Table>
      <Button
        mt="sm"
        fullWidth
        variant={clipboard.copied ? "light" : "default"}
        color={clipboard.copied ? "teal" : undefined}
        leftSection={clipboard.copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
        onClick={copy}
      >
        {clipboard.copied ? "Copied" : "Copy counts for the caterer"}
      </Button>
    </Paper>
  );
}

export function GuestsView() {
  const { seating, stats } = usePlan();
  const [search, setSearch] = useState("");
  const [party, setParty] = useState<string | null>(null);
  const [rsvp, setRsvp] = useState<string | null>(null);
  const [diet, setDiet] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return guests.filter((g) => {
      if (q && !g.name.toLowerCase().includes(q)) return false;
      if (party && g.party !== party) return false;
      if (rsvp && g.rsvp !== rsvp) return false;
      if (diet === NO_DIET && g.diet) return false;
      if (diet && diet !== NO_DIET && g.diet !== diet) return false;
      return true;
    });
  }, [search, party, rsvp, diet]);

  const filtering = Boolean(search || party || rsvp || diet);
  const count = (r: Rsvp) => guests.filter((g) => g.rsvp === r).length;
  const reset = () => {
    setSearch("");
    setParty(null);
    setRsvp(null);
    setDiet(null);
  };

  return (
    <Stack gap="md">
      <div>
        <Title order={1} size="h2">Guest list</Title>
        <Text c="dimmed" size="sm">
          {event.name} · {formatEventDate()} · {event.venue}
        </Text>
      </div>

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
        <SummaryCard label="Invited" value={guests.length} />
        <SummaryCard label="Attending" value={count("yes")} sub={`${stats.toSeat} still to seat`} />
        <SummaryCard label="Maybe or no reply" value={count("maybe") + count("pending")} sub={`${count("maybe")} maybe, ${count("pending")} pending`} />
        <SummaryCard label="Declined" value={count("no")} />
      </SimpleGrid>

      <Grid gap="md" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }} order={{ base: 2, lg: 1 }}>
          <Paper withBorder p="md">
            <Stack gap="sm">
              <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="sm">
                <TextInput
                  label="Search"
                  placeholder="Guest name"
                  leftSection={<IconSearch size={16} />}
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                />
                <Select
                  label="Party"
                  placeholder="All parties"
                  data={parties}
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
                  data={DIET_OPTIONS}
                  value={diet}
                  onChange={setDiet}
                  clearable
                />
              </SimpleGrid>
              <Group justify="space-between" gap="xs">
                <Text size="sm" c="dimmed" role="status" aria-live="polite">
                  Showing {filtered.length} of {guests.length} guests
                </Text>
                {filtering ? (
                  <Button size="compact-sm" variant="subtle" leftSection={<IconFilterOff size={14} />} onClick={reset}>
                    Clear filters
                  </Button>
                ) : null}
              </Group>
              <Table.ScrollContainer minWidth={640}>
                <Table verticalSpacing="xs" highlightOnHover stickyHeader aria-label="Guests">
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
                    {filtered.length === 0 ? (
                      <Table.Tr>
                        <Table.Td colSpan={5}>
                          <Text ta="center" c="dimmed" py="md">
                            No guests match these filters.
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ) : (
                      filtered.map((g) => {
                        const p = seating[g.id];
                        const t = p ? tableById[p.table] : undefined;
                        return (
                          <Table.Tr key={g.id}>
                            <Table.Td fw={600}>{g.name}</Table.Td>
                            <Table.Td>
                              <PartyBadge party={g.party} />
                            </Table.Td>
                            <Table.Td>
                              <RsvpBadge rsvp={g.rsvp} />
                            </Table.Td>
                            <Table.Td>
                              {g.diet ? <DietBadge diet={g.diet} /> : <Text size="sm" c="dimmed">None</Text>}
                            </Table.Td>
                            <Table.Td>
                              {t && p ? (
                                <Badge
                                  component={Link}
                                  href="/"
                                  variant="light"
                                  color="brand"
                                  size="md"
                                  tt="none"
                                  style={{ cursor: "pointer" }}
                                >
                                  {t.name} · seat {p.seat + 1}
                                </Badge>
                              ) : g.rsvp === "no" ? (
                                <Text size="sm" c="dimmed">
                                  Not needed
                                </Text>
                              ) : (
                                <Badge variant="outline" color="orange" size="md" tt="none">
                                  Not seated
                                </Badge>
                              )}
                            </Table.Td>
                          </Table.Tr>
                        );
                      })
                    )}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Stack>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }} order={{ base: 1, lg: 2 }}>
          <CatererMeals />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
