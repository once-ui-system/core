"use client";

import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  CopyButton,
  Flex,
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
import { IconArmchair, IconCheck, IconCopy, IconPrinter, IconSearch } from "@tabler/icons-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  DIET_COLOR,
  EVENT,
  GUESTS,
  PARTY_COLOR,
  PARTY_ORDER,
  RSVP_COLOR,
  RSVP_LABEL,
  STANDARD_MEAL,
  TABLES,
  TABLES_BY_ID,
  formatEventDate,
  initials,
  type Guest,
  type Rsvp,
} from "@/lib/data";
import { usePlan } from "./PlanProvider";

type RsvpFilter = "all" | Rsvp;

const NO_DIET = "__none";
const ANY = "__any";
const ALL_DIETS = [...new Set(GUESTS.map((x) => x.diet).filter((d): d is string => Boolean(d)))].sort();

function mealOf(g: Guest): string {
  return g.diet ?? STANDARD_MEAL;
}

function TableCell({ guest, tableId }: { guest: Guest; tableId: string | null }) {
  const plan = usePlan();
  if (tableId) {
    return (
      <Button
        component={Link}
        href="/"
        variant="subtle"
        size="compact-sm"
        leftSection={<IconArmchair size={15} aria-hidden />}
        onClick={() => plan.selectTable(tableId)}
        aria-label={`${TABLES_BY_ID[tableId]?.name ?? "Table"}: show on the plan`}
      >
        {TABLES_BY_ID[tableId]?.name}
      </Button>
    );
  }
  if (guest.rsvp === "no") {
    return (
      <Text fz="sm" c="gray.7">
        Declined
      </Text>
    );
  }
  return (
    <Button
      component={Link}
      href="/"
      variant="light"
      color="orange"
      size="compact-sm"
      onClick={() => plan.arm(guest.id)}
      aria-label={`No seat: place ${guest.name} on the plan`}
    >
      No seat: place
    </Button>
  );
}

function MealCard() {
  const plan = usePlan();
  const rows = useMemo(() => {
    const meals = [STANDARD_MEAL, ...ALL_DIETS];
    return meals.map((meal) => {
      const mine = GUESTS.filter((x) => mealOf(x) === meal);
      return {
        meal,
        confirmed: mine.filter((x) => x.rsvp === "yes").length,
        awaiting: mine.filter((x) => x.rsvp === "maybe" || x.rsvp === "pending").length,
      };
    });
  }, []);
  const totalConfirmed = rows.reduce((n, r) => n + r.confirmed, 0);
  const totalAwaiting = rows.reduce((n, r) => n + r.awaiting, 0);
  const declined = GUESTS.filter((x) => x.rsvp === "no").length;

  const text = [
    `${EVENT.name}, ${formatEventDate(EVENT.date)}, ${EVENT.venue}`,
    "Meal counts (attending / awaiting reply)",
    ...rows.map((r) => `${r.meal}: ${r.confirmed} / ${r.awaiting}`),
    `Total: ${totalConfirmed} / ${totalAwaiting}`,
  ].join("\n");

  const byTable = TABLES.map((t) => {
    const counts = new Map<string, number>();
    for (const id of plan.seating[t.id] ?? []) {
      const diet = id ? GUESTS.find((x) => x.id === id)?.diet : null;
      if (diet) counts.set(diet, (counts.get(diet) ?? 0) + 1);
    }
    return { name: t.name, counts: [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0])) };
  });
  const unseated = new Map<string, number>();
  for (const x of GUESTS) {
    if (x.rsvp === "yes" && x.diet && !plan.locations[x.id]) unseated.set(x.diet, (unseated.get(x.diet) ?? 0) + 1);
  }
  const unseatedCounts = [...unseated.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <Stack gap="md">
      <Paper withBorder shadow="xs" p="md">
        <Group justify="space-between" align="flex-start" wrap="nowrap" mb="xs">
          <Box>
            <Title order={2} fz="lg">
              Meals for the caterer
            </Title>
            <Text fz="sm" c="gray.7">
              {totalConfirmed} confirmed, {totalAwaiting} awaiting a reply, {declined} declined.
            </Text>
          </Box>
          <CopyButton value={text}>
            {({ copied, copy }) => (
              <Button
                size="compact-sm"
                style={{ flexShrink: 0 }}
                variant={copied ? "light" : "default"}
                color={copied ? "green" : undefined}
                leftSection={copied ? <IconCheck size={15} aria-hidden /> : <IconCopy size={15} aria-hidden />}
                onClick={copy}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
          </CopyButton>
        </Group>
        <Table verticalSpacing={6} horizontalSpacing="xs" aria-label="Meal counts" withRowBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Meal</Table.Th>
              <Table.Th ta="right">Attending</Table.Th>
              <Table.Th ta="right">Awaiting</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((r) => (
              <Table.Tr key={r.meal}>
                <Table.Td>
                  <Group gap={8} wrap="nowrap">
                    <Box
                      w={10}
                      h={10}
                      style={{
                        borderRadius: "50%",
                        background: DIET_COLOR[r.meal]
                          ? `var(--mantine-color-${DIET_COLOR[r.meal]}-filled)`
                          : "var(--mantine-color-gray-5)",
                        flexShrink: 0,
                      }}
                      aria-hidden
                    />
                    <Text fz="sm">{r.meal}</Text>
                  </Group>
                </Table.Td>
                <Table.Td ta="right" fw={700}>
                  {r.confirmed}
                </Table.Td>
                <Table.Td ta="right" c="gray.7">
                  {r.awaiting}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
          <Table.Tfoot>
            <Table.Tr>
              <Table.Th>Total</Table.Th>
              <Table.Th ta="right">{totalConfirmed}</Table.Th>
              <Table.Th ta="right">{totalAwaiting}</Table.Th>
            </Table.Tr>
          </Table.Tfoot>
        </Table>
        <Text fz="xs" c="gray.7" mt="xs">
          Declined guests are not counted. Awaiting means maybe or no reply yet.
        </Text>
      </Paper>

      <Paper withBorder shadow="xs" p="md">
        <Title order={2} fz="lg" mb="xs">
          Dietary needs by table
        </Title>
        <Stack gap="xs">
          {byTable.map((t) => (
            <Group key={t.name} justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
              <Text fz="sm" fw={600} w={80} style={{ flexShrink: 0 }}>
                {t.name}
              </Text>
              <Group gap={4} justify="flex-end">
                {t.counts.length ? (
                  t.counts.map(([d, n]) => (
                    <Badge key={d} size="sm" variant="light" color={DIET_COLOR[d] ?? "gray"}>
                      {d} &times; {n}
                    </Badge>
                  ))
                ) : (
                  <Text fz="xs" c="gray.7">
                    None
                  </Text>
                )}
              </Group>
            </Group>
          ))}
          <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
            <Text fz="sm" fw={600} w={80} style={{ flexShrink: 0 }} c="orange.8">
              No seat yet
            </Text>
            <Group gap={4} justify="flex-end">
              {unseatedCounts.length ? (
                unseatedCounts.map(([d, n]) => (
                  <Badge key={d} size="sm" variant="outline" color={DIET_COLOR[d] ?? "gray"}>
                    {d} &times; {n}
                  </Badge>
                ))
              ) : (
                <Text fz="xs" c="gray.7">
                  None
                </Text>
              )}
            </Group>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}

export function GuestsView() {
  const plan = usePlan();
  const [query, setQuery] = useState("");
  const [party, setParty] = useState<string | null>(null);
  const [rsvp, setRsvp] = useState<RsvpFilter>("all");
  const [diet, setDiet] = useState<string | null>(null);
  const [seat, setSeat] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<RsvpFilter, number> = { all: GUESTS.length, yes: 0, maybe: 0, pending: 0, no: 0 };
    for (const x of GUESTS) c[x.rsvp] += 1;
    return c;
  }, []);

  const filtered = GUESTS.filter((x) => {
    const q = query.trim().toLowerCase();
    const tableName = plan.locations[x.id] ? (TABLES_BY_ID[plan.locations[x.id] as string]?.name ?? "") : "";
    if (q && !`${x.name} ${x.party} ${x.diet ?? ""} ${tableName}`.toLowerCase().includes(q)) return false;
    if (party && x.party !== party) return false;
    if (rsvp !== "all" && x.rsvp !== rsvp) return false;
    if (diet === NO_DIET && x.diet) return false;
    if (diet && diet !== NO_DIET && diet !== ANY && x.diet !== diet) return false;
    if (seat === "seated" && !plan.locations[x.id]) return false;
    if (seat === "unseated" && plan.locations[x.id]) return false;
    return true;
  });

  const filtersActive = Boolean(query || party || rsvp !== "all" || diet || seat);
  const clear = () => {
    setQuery("");
    setParty(null);
    setRsvp("all");
    setDiet(null);
    setSeat(null);
  };

  const rsvpChips: { value: RsvpFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "yes", label: RSVP_LABEL.yes },
    { value: "maybe", label: RSVP_LABEL.maybe },
    { value: "pending", label: RSVP_LABEL.pending },
    { value: "no", label: RSVP_LABEL.no },
  ];

  return (
    <Stack gap="md" maw={1700} mx="auto">
      <Group justify="space-between" align="flex-end" gap="sm">
        <Box>
          <Title order={1} fz={{ base: 24, sm: 28 }}>
            Guest list
          </Title>
          <Text fz="sm" c="gray.7" mt={4}>
            {EVENT.name} &middot; {counts.all} invited, {counts.yes} attending
          </Text>
        </Box>
        <Button
          variant="default"
          leftSection={<IconPrinter size={16} aria-hidden />}
          onClick={() => window.print()}
          visibleFrom="sm"
        >
          Print
        </Button>
      </Group>

      <Paper withBorder shadow="xs" p="sm">
        <Stack gap="sm">
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="sm">
            <TextInput
              label="Search"
              placeholder="Name, party, table or diet"
              leftSection={<IconSearch size={16} aria-hidden />}
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
            />
            <Select
              label="Party"
              placeholder="All parties"
              data={PARTY_ORDER}
              value={party}
              onChange={setParty}
              clearable
            />
            <Select
              label="Diet"
              placeholder="Any diet"
              data={[{ value: NO_DIET, label: "No dietary needs" }, ...ALL_DIETS.map((d) => ({ value: d, label: d }))]}
              value={diet}
              onChange={setDiet}
              clearable
            />
            <Select
              label="Seating"
              placeholder="Seated or not"
              data={[
                { value: "seated", label: "Seated" },
                { value: "unseated", label: "Not seated" },
              ]}
              value={seat}
              onChange={setSeat}
              clearable
            />
          </SimpleGrid>
          <Group gap="xs" align="center" role="group" aria-label="Filter by RSVP">
            <Text fz="sm" fw={500} mr={4}>
              RSVP
            </Text>
            <Chip.Group multiple={false} value={rsvp} onChange={(v) => setRsvp(v as RsvpFilter)}>
              {rsvpChips.map((c) => (
                <Chip key={c.value} value={c.value} size="sm" variant="light">
                  {c.label} ({counts[c.value]})
                </Chip>
              ))}
            </Chip.Group>
          </Group>
        </Stack>
      </Paper>

      <Flex direction={{ base: "column", lg: "row-reverse" }} gap="md" align="flex-start">
        <Box
          w={{ base: "100%", lg: 380 }}
          style={{ flexShrink: 0 }}
          pos={{ base: "static", lg: "sticky" }}
          top={{ lg: 76 }}
        >
          <MealCard />
        </Box>
        <Box style={{ flex: 1, minWidth: 0, width: "100%" }}>
          <Group justify="space-between" mb={6} px={2}>
            <Text fz="sm" c="gray.7" role="status" aria-live="polite">
              Showing {filtered.length} of {GUESTS.length} guests
            </Text>
            {filtersActive ? (
              <Button variant="subtle" size="compact-sm" onClick={clear}>
                Clear filters
              </Button>
            ) : null}
          </Group>

          {filtered.length === 0 ? (
            <Paper withBorder p="xl" ta="center">
              <Text fw={600}>No guests match these filters.</Text>
              <Text fz="sm" c="gray.7" mt={4}>
                Try a different search or clear the filters.
              </Text>
            </Paper>
          ) : (
            <>
              <Paper withBorder shadow="xs" visibleFrom="sm" style={{ overflow: "hidden" }}>
                <Table.ScrollContainer minWidth={620}>
                  <Table verticalSpacing="xs" horizontalSpacing="md" highlightOnHover>
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
                      {filtered.map((x) => (
                        <Table.Tr key={x.id}>
                          <Table.Td>
                            <Group gap="sm" wrap="nowrap">
                              <Avatar size={30} radius="xl" variant="filled" color={PARTY_COLOR[x.party] ?? "gray"} fz={11} fw={700}>
                                {initials(x.name)}
                              </Avatar>
                              <Text fz="sm" fw={600}>
                                {x.name}
                              </Text>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Text fz="sm">{x.party}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge variant="light" color={RSVP_COLOR[x.rsvp]}>
                              {RSVP_LABEL[x.rsvp]}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            {x.diet ? (
                              <Badge variant="light" color={DIET_COLOR[x.diet] ?? "gray"}>
                                {x.diet}
                              </Badge>
                            ) : (
                              <Text fz="sm" c="gray.7">
                                None
                              </Text>
                            )}
                          </Table.Td>
                          <Table.Td>
                            <TableCell guest={x} tableId={plan.locations[x.id] ?? null} />
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              </Paper>

              <Stack gap="xs" hiddenFrom="sm" role="list" aria-label="Guests">
                {filtered.map((x) => (
                  <Paper key={x.id} withBorder p="sm" shadow="xs" role="listitem">
                    <Group gap="sm" wrap="nowrap" align="flex-start">
                      <Avatar size={36} radius="xl" variant="filled" color={PARTY_COLOR[x.party] ?? "gray"} fz={12} fw={700}>
                        {initials(x.name)}
                      </Avatar>
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text fz="sm" fw={600}>
                          {x.name}
                        </Text>
                        <Text fz="xs" c="gray.7">
                          {x.party}
                        </Text>
                        <Group gap={6} mt={6}>
                          <Badge variant="light" color={RSVP_COLOR[x.rsvp]}>
                            {RSVP_LABEL[x.rsvp]}
                          </Badge>
                          {x.diet ? (
                            <Badge variant="light" color={DIET_COLOR[x.diet] ?? "gray"}>
                              {x.diet}
                            </Badge>
                          ) : null}
                        </Group>
                      </Box>
                      <TableCell guest={x} tableId={plan.locations[x.id] ?? null} />
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </>
          )}
        </Box>
      </Flex>
    </Stack>
  );
}
