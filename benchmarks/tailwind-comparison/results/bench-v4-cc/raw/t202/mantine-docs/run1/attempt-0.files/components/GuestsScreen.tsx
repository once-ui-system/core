"use client";

import { Badge, Button, Group, Paper, Select, Stack, Table, Text, TextInput, Title } from "@mantine/core";
import { IconPrinter, IconSearch } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  DIETS,
  GUESTS,
  PARTIES,
  RSVP_COLOR,
  RSVP_LABEL,
  STANDARD_MEAL,
  TABLES,
  TABLE_BY_ID,
  dietColor,
  mealCounts,
  mealLabel,
  partyColor,
  type Rsvp,
} from "@/lib/data";
import { usePlan } from "@/lib/plan";
import css from "./seatwise.module.css";

const plain = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function GuestsScreen() {
  const router = useRouter();
  const { index, seats, selectTable } = usePlan();
  const [query, setQuery] = useState("");
  const [party, setParty] = useState<string | null>(null);
  const [rsvp, setRsvp] = useState<string | null>(null);
  const [diet, setDiet] = useState<string | null>(null);
  const [seating, setSeating] = useState<string | null>(null);

  const meals = useMemo(() => mealCounts(), []);
  const totals = meals.reduce((a, r) => ({ confirmed: a.confirmed + r.confirmed, awaiting: a.awaiting + r.awaiting }), { confirmed: 0, awaiting: 0 });

  const filtered = GUESTS.filter((g) => {
    const q = plain(query.trim());
    const tableName = index[g.id] ? TABLE_BY_ID[index[g.id].table].name : "unseated";
    if (q && !plain(`${g.name} ${g.party} ${g.diet ?? ""} ${tableName}`).includes(q)) return false;
    if (party && g.party !== party) return false;
    if (rsvp && g.rsvp !== rsvp) return false;
    if (diet === "none" ? g.diet !== null : diet ? g.diet !== diet : false) return false;
    if (seating === "seated" && !index[g.id]) return false;
    if (seating === "unseated" && index[g.id]) return false;
    return true;
  });

  const filtersActive = Boolean(query || party || rsvp || diet || seating);
  const reset = () => {
    setQuery("");
    setParty(null);
    setRsvp(null);
    setDiet(null);
    setSeating(null);
  };

  const byTable = [...TABLES.map((t) => ({ id: t.id, name: t.name })), { id: "none", name: "No seat yet" }].map((entry) => {
    const ids =
      entry.id === "none"
        ? GUESTS.filter((g) => g.rsvp !== "no" && !index[g.id]).map((g) => g.id)
        : seats[entry.id].filter((x): x is string => x !== null);
    const tally = new Map<string, number>();
    for (const id of ids) {
      const g = GUESTS.find((x) => x.id === id);
      if (g) tally.set(mealLabel(g), (tally.get(mealLabel(g)) ?? 0) + 1);
    }
    return { ...entry, count: ids.length, tally: Array.from(tally.entries()) };
  });

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-end" gap="sm">
        <div>
          <Title order={1} size="h2">
            Guest list
          </Title>
          <Text size="sm" c="dimmed">
            {GUESTS.length} invited · {totals.confirmed} attending · {totals.awaiting} not confirmed
          </Text>
        </div>
        <Button className={css.noPrint} variant="default" leftSection={<IconPrinter size={18} />} onClick={() => window.print()}>
          Print for the caterer
        </Button>
      </Group>

      <div className={css.guestsLayout}>
        <section className={css.meals} aria-label="Meal counts for the caterer">
          <Paper className={css.card} p="md">
            <Title order={2} size="h4">
              Meals for the caterer
            </Title>
            <Text size="xs" c="dimmed" mb="sm">
              Declined guests are not counted. Select a row to filter the list.
            </Text>
            <Table verticalSpacing={6} horizontalSpacing="xs" aria-label="Meal counts">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th scope="col">Meal</Table.Th>
                  <Table.Th scope="col" ta="right">
                    Attending
                  </Table.Th>
                  <Table.Th scope="col" ta="right">
                    Not confirmed
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {meals.map((m) => (
                  <Table.Tr key={m.meal}>
                    <Table.Td>
                      <Button
                        variant="subtle"
                        color={m.meal === STANDARD_MEAL ? "gray" : dietColor(m.meal)}
                        size="compact-sm"
                        className={css.noPrint}
                        onClick={() => setDiet(m.meal === STANDARD_MEAL ? "none" : m.meal)}
                        aria-label={`Filter the list to ${m.meal}`}
                      >
                        {m.meal}
                      </Button>
                      <span style={{ display: "none" }} className="print-only">
                        {m.meal}
                      </span>
                    </Table.Td>
                    <Table.Td ta="right" fw={700} style={{ fontVariantNumeric: "tabular-nums" }}>
                      {m.confirmed}
                    </Table.Td>
                    <Table.Td ta="right" c="dimmed" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {m.awaiting}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
              <Table.Tfoot>
                <Table.Tr>
                  <Table.Th scope="row">Total</Table.Th>
                  <Table.Th ta="right">{totals.confirmed}</Table.Th>
                  <Table.Th ta="right">{totals.awaiting}</Table.Th>
                </Table.Tr>
              </Table.Tfoot>
            </Table>

            <Title order={3} size="h5" mt="lg" mb={6}>
              By table
            </Title>
            <Stack gap={8}>
              {byTable.map((t) => (
                <div key={t.id}>
                  <Group justify="space-between" gap="xs">
                    <Text size="sm" fw={600}>
                      {t.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {t.count} {t.count === 1 ? "guest" : "guests"}
                    </Text>
                  </Group>
                  <Text size="xs" c="dimmed">
                    {t.tally.length ? t.tally.map(([meal, n]) => `${n} × ${meal}`).join(", ") : "Nobody yet"}
                  </Text>
                </div>
              ))}
            </Stack>
          </Paper>
        </section>

        <section className={css.list} aria-label="Guests">
          <Paper className={css.card} p="md">
            <div className={css.noPrint}>
              <TextInput
                label="Search"
                placeholder="Name, party, diet or table"
                leftSection={<IconSearch size={16} />}
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
                mb="sm"
              />
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
                <Select label="Party" placeholder="All parties" data={PARTIES} value={party} onChange={setParty} clearable />
                <Select
                  label="RSVP"
                  placeholder="Any reply"
                  data={(["yes", "maybe", "pending", "no"] as Rsvp[]).map((r) => ({ value: r, label: RSVP_LABEL[r] }))}
                  value={rsvp}
                  onChange={setRsvp}
                  clearable
                />
                <Select
                  label="Diet"
                  placeholder="Any meal"
                  data={[{ value: "none", label: STANDARD_MEAL }, ...DIETS.map((d) => ({ value: d, label: d }))]}
                  value={diet}
                  onChange={setDiet}
                  clearable
                />
                <Select
                  label="Seating"
                  placeholder="Seated or not"
                  data={[
                    { value: "seated", label: "Seated" },
                    { value: "unseated", label: "Unseated" },
                  ]}
                  value={seating}
                  onChange={setSeating}
                  clearable
                />
              </div>
              <Group justify="space-between" mt="sm" mb="xs">
                <Text size="sm" c="dimmed" role="status">
                  Showing {filtered.length} of {GUESTS.length} guests
                </Text>
                {filtersActive && (
                  <Button size="compact-sm" variant="subtle" onClick={reset}>
                    Clear filters
                  </Button>
                )}
              </Group>
            </div>

            <Table.ScrollContainer minWidth={640}>
              <Table verticalSpacing="xs" highlightOnHover stickyHeader aria-label="Guest list">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th scope="col">Guest</Table.Th>
                    <Table.Th scope="col">Party</Table.Th>
                    <Table.Th scope="col">RSVP</Table.Th>
                    <Table.Th scope="col">Diet</Table.Th>
                    <Table.Th scope="col">Table</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filtered.map((g) => {
                    const place = index[g.id];
                    return (
                      <Table.Tr key={g.id}>
                        <Table.Td fw={600}>{g.name}</Table.Td>
                        <Table.Td>
                          <Badge variant="light" color={partyColor(g.party)} radius="sm" tt="none">
                            {g.party}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="light" color={RSVP_COLOR[g.rsvp]}>
                            {RSVP_LABEL[g.rsvp]}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          {g.diet ? (
                            <Badge variant="light" color={dietColor(g.diet)}>
                              {g.diet}
                            </Badge>
                          ) : (
                            <Text size="sm" c="dimmed">
                              None
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          {place ? (
                            <Button
                              size="compact-sm"
                              variant="subtle"
                              color="moss"
                              onClick={() => {
                                selectTable(place.table);
                                router.push("/");
                              }}
                              aria-label={`${TABLE_BY_ID[place.table].name}, seat ${place.seat + 1}. Show on the plan`}
                            >
                              {TABLE_BY_ID[place.table].name} · seat {place.seat + 1}
                            </Button>
                          ) : g.rsvp === "no" ? (
                            <Text size="sm" c="dimmed">
                              Not attending
                            </Text>
                          ) : (
                            <Text size="sm" c="orange.8" fw={600}>
                              Unseated
                            </Text>
                          )}
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={5}>
                        <Text ta="center" c="dimmed" py="lg">
                          No guests match these filters.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Paper>
        </section>
      </div>
    </Stack>
  );
}
