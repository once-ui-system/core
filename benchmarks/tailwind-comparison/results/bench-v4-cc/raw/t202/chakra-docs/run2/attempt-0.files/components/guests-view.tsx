"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  chakra,
  Flex,
  Grid,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import { LuCheck, LuCopy, LuSearch, LuX } from "react-icons/lu";
import { Panel, PanelHeader } from "@/components/panel";
import { usePlan } from "@/components/plan-provider";
import { InputGroup } from "@/components/ui/input-group";
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select";
import { event, guests, parties, partyPalette, rsvpLabel, rsvpPalette, type Guest, type Rsvp } from "@/lib/data";
import { dietList, mealKey, tableById, formatDate } from "@/lib/plan";

type SortKey = "name" | "party" | "rsvp" | "table";

const RSVP_ORDER: Rsvp[] = ["yes", "maybe", "pending", "no"];

function Labeled({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <Stack gap="1" minW="0">
      <chakra.label htmlFor={id} fontSize="xs" fontWeight="semibold" color="fg.muted">
        {label}
      </chakra.label>
      {children}
    </Stack>
  );
}

function RsvpBadge({ rsvp }: { rsvp: Rsvp }) {
  return (
    <Badge colorPalette={rsvpPalette[rsvp]} variant="subtle">
      {rsvpLabel[rsvp]}
    </Badge>
  );
}

export function GuestsView() {
  const { seating } = usePlan();
  const [q, setQ] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState("all");
  const [diet, setDiet] = useState("all");
  const [seat, setSeat] = useState("all");
  const [sort, setSort] = useState<SortKey>("name");
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");

  const tableLabel = (g: Guest) => {
    const s = seating[g.id];
    return s ? `${tableById.get(s.table)?.name ?? s.table}` : null;
  };

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = guests.filter((g) => {
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === "none" && g.diet) return false;
      if (diet !== "all" && diet !== "none" && g.diet !== diet) return false;
      const s = seating[g.id];
      if (seat === "seated" && !s) return false;
      if (seat === "unseated" && s) return false;
      if (needle) {
        const hay = `${g.name} ${g.party} ${g.diet ?? ""} ${s ? (tableById.get(s.table)?.name ?? "") : "not seated"}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    const cmp: Record<SortKey, (a: Guest, b: Guest) => number> = {
      name: (a, b) => a.name.localeCompare(b.name),
      party: (a, b) => parties.indexOf(a.party) - parties.indexOf(b.party) || a.name.localeCompare(b.name),
      rsvp: (a, b) => RSVP_ORDER.indexOf(a.rsvp) - RSVP_ORDER.indexOf(b.rsvp) || a.name.localeCompare(b.name),
      table: (a, b) => {
        const ta = seating[a.id];
        const tb = seating[b.id];
        const na = ta ? (tableById.get(ta.table)?.name ?? "") : "~";
        const nb = tb ? (tableById.get(tb.table)?.name ?? "") : "~";
        return na.localeCompare(nb) || a.name.localeCompare(b.name);
      },
    };
    return [...list].sort(cmp[sort]);
  }, [q, party, rsvp, diet, seat, sort, seating]);

  const filtered = q !== "" || party !== "all" || rsvp !== "all" || diet !== "all" || seat !== "all";
  const clear = () => {
    setQ("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
    setSeat("all");
  };

  const rsvpCounts = RSVP_ORDER.map((r) => ({ r, n: guests.filter((g) => g.rsvp === r).length }));

  // Meal counts for the caterer
  const meals = useMemo(() => {
    const keys = ["Standard menu", ...dietList];
    return keys.map((k) => {
      const confirmed = guests.filter((g) => g.rsvp === "yes" && mealKey(g) === k);
      const possible = guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && mealKey(g) === k);
      const where = new Map<string, number>();
      for (const g of confirmed) {
        const s = seating[g.id];
        const name = s ? (tableById.get(s.table)?.name ?? s.table) : "Not seated";
        where.set(name, (where.get(name) ?? 0) + 1);
      }
      return { key: k, confirmed: confirmed.length, possible: possible.length, where: Array.from(where.entries()) };
    });
  }, [seating]);
  const totalConfirmed = meals.reduce((n, m) => n + m.confirmed, 0);
  const totalPossible = meals.reduce((n, m) => n + m.possible, 0);

  const copySummary = async () => {
    const lines = [
      `${event.name} - ${formatDate(event.date)}, ${event.venue}`,
      `Meal counts for the caterer (confirmed guests)`,
      ...meals.map((m) => `${m.key}: ${m.confirmed}${m.possible ? ` (+${m.possible} not yet confirmed)` : ""}`),
      `Total confirmed: ${totalConfirmed}${totalPossible ? ` (+${totalPossible} not yet confirmed)` : ""}`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied("done");
    } catch {
      setCopied("failed");
    }
    window.setTimeout(() => setCopied("idle"), 2500);
  };

  return (
    <Box maxW="1600px" mx="auto" px={{ base: "4", md: "6" }} py={{ base: "4", md: "6" }}>
      <Box mb="4">
        <Heading as="h1" size={{ base: "xl", md: "2xl" }} letterSpacing="tight">
          Guest list
        </Heading>
        <Text color="fg.muted" fontSize="sm">
          {guests.length} invited to {event.name}
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 2, md: 4 }} gap="3" mb="4">
        {rsvpCounts.map(({ r, n }) => {
          const on = rsvp === r;
          return (
            <chakra.button
              key={r}
              type="button"
              textAlign="start"
              aria-pressed={on}
              onClick={() => setRsvp(on ? "all" : r)}
              bg="bg.panel"
              borderWidth={on ? "2px" : "1px"}
              borderColor={on ? "fg" : "border.muted"}
              rounded="xl"
              px="4"
              py="3"
              shadow="xs"
              _hover={{ borderColor: "border.emphasized" }}
              _focusVisible={{ outline: "2px solid", outlineColor: "teal.solid", outlineOffset: "2px" }}
            >
              <Text fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="wider">
                {rsvpLabel[r]}
              </Text>
              <Text fontSize="3xl" fontWeight="bold" lineHeight="1.1" color={`${rsvpPalette[r]}.fg`} fontVariantNumeric="tabular-nums">
                {n}
              </Text>
            </chakra.button>
          );
        })}
      </SimpleGrid>

      <Grid gap="4" templateColumns={{ base: "minmax(0, 1fr)", xl: "minmax(0, 1fr) 420px" }} alignItems="start">
        <Panel as="section" aria-labelledby="list-h" overflow="hidden">
          <PanelHeader title="Guests" id="list-h">
            <Text fontSize="sm" color="fg.muted" aria-live="polite">
              Showing {rows.length} of {guests.length}
            </Text>
          </PanelHeader>
          <Stack gap="3" p="4" borderBottomWidth="1px" borderColor="border.muted" role="search" aria-label="Filter guests">
            <InputGroup startElement={<LuSearch aria-hidden />}>
              <Input
                type="search"
                aria-label="Search guests by name, party, diet or table"
                placeholder="Search name, party, diet or table"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </InputGroup>
            <SimpleGrid columns={{ base: 2, md: 3, xl: 5 }} gap="3">
              <Labeled id="f-party" label="Party">
                <NativeSelectRoot size="sm">
                  <NativeSelectField id="f-party" value={party} onChange={(e) => setParty(e.target.value)} items={[{ value: "all", label: "All parties" }, ...parties]} />
                </NativeSelectRoot>
              </Labeled>
              <Labeled id="f-rsvp" label="RSVP">
                <NativeSelectRoot size="sm">
                  <NativeSelectField
                    id="f-rsvp"
                    value={rsvp}
                    onChange={(e) => setRsvp(e.target.value)}
                    items={[{ value: "all", label: "Any reply" }, ...RSVP_ORDER.map((r) => ({ value: r, label: rsvpLabel[r] }))]}
                  />
                </NativeSelectRoot>
              </Labeled>
              <Labeled id="f-diet" label="Diet">
                <NativeSelectRoot size="sm">
                  <NativeSelectField
                    id="f-diet"
                    value={diet}
                    onChange={(e) => setDiet(e.target.value)}
                    items={[{ value: "all", label: "Any diet" }, { value: "none", label: "No dietary need" }, ...dietList]}
                  />
                </NativeSelectRoot>
              </Labeled>
              <Labeled id="f-seat" label="Seating">
                <NativeSelectRoot size="sm">
                  <NativeSelectField
                    id="f-seat"
                    value={seat}
                    onChange={(e) => setSeat(e.target.value)}
                    items={[
                      { value: "all", label: "Seated or not" },
                      { value: "seated", label: "Seated" },
                      { value: "unseated", label: "Not seated" },
                    ]}
                  />
                </NativeSelectRoot>
              </Labeled>
              <Labeled id="f-sort" label="Sort by">
                <NativeSelectRoot size="sm">
                  <NativeSelectField
                    id="f-sort"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    items={[
                      { value: "name", label: "Name" },
                      { value: "party", label: "Party" },
                      { value: "rsvp", label: "RSVP" },
                      { value: "table", label: "Table" },
                    ]}
                  />
                </NativeSelectRoot>
              </Labeled>
            </SimpleGrid>
            {filtered ? (
              <Box>
                <Button size="xs" variant="subtle" onClick={clear}>
                  <LuX /> Clear filters
                </Button>
              </Box>
            ) : null}
          </Stack>

          {rows.length === 0 ? (
            <Stack align="center" gap="1" py="12" px="4" textAlign="center">
              <Text fontWeight="semibold">No guests match</Text>
              <Text fontSize="sm" color="fg.muted">
                Try a different search or clear the filters.
              </Text>
            </Stack>
          ) : (
            <>
              <Box display={{ base: "none", md: "block" }}>
                <Table.ScrollArea>
                  <Table.Root size="md" variant="line" interactive>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader pl="4">Guest</Table.ColumnHeader>
                        <Table.ColumnHeader>Party</Table.ColumnHeader>
                        <Table.ColumnHeader>RSVP</Table.ColumnHeader>
                        <Table.ColumnHeader>Diet</Table.ColumnHeader>
                        <Table.ColumnHeader pr="4">Table</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {rows.map((g) => {
                        const s = seating[g.id];
                        const pal = partyPalette[g.party] ?? "gray";
                        return (
                          <Table.Row key={g.id}>
                            <Table.Cell pl="4" fontWeight="medium">
                              {g.name}
                            </Table.Cell>
                            <Table.Cell>
                              <HStack gap="2">
                                <Box boxSize="2.5" rounded="full" bg={`${pal}.solid`} aria-hidden />
                                <Text as="span">{g.party}</Text>
                              </HStack>
                            </Table.Cell>
                            <Table.Cell>
                              <RsvpBadge rsvp={g.rsvp} />
                            </Table.Cell>
                            <Table.Cell>
                              {g.diet ? (
                                <Badge colorPalette="yellow" variant="subtle">
                                  {g.diet}
                                </Badge>
                              ) : (
                                <Text as="span" color="fg.subtle">
                                  None
                                </Text>
                              )}
                            </Table.Cell>
                            <Table.Cell pr="4">
                              {s ? (
                                <Text as="span">
                                  {tableById.get(s.table)?.name}{" "}
                                  <Text as="span" color="fg.muted">
                                    seat {s.seat + 1}
                                  </Text>
                                </Text>
                              ) : g.rsvp === "no" ? (
                                <Text as="span" color="fg.subtle">
                                  Not needed
                                </Text>
                              ) : (
                                <Badge colorPalette="orange" variant="subtle">
                                  Not seated
                                </Badge>
                              )}
                            </Table.Cell>
                          </Table.Row>
                        );
                      })}
                    </Table.Body>
                  </Table.Root>
                </Table.ScrollArea>
              </Box>

              <Stack as="ul" listStyleType="none" gap="0" display={{ base: "flex", md: "none" }} m="0" p="0">
                {rows.map((g) => {
                  const s = seating[g.id];
                  const pal = partyPalette[g.party] ?? "gray";
                  return (
                    <chakra.li key={g.id} px="4" py="3" borderTopWidth="1px" borderColor="border.muted">
                      <Flex justify="space-between" align="flex-start" gap="3">
                        <Box minW="0">
                          <Text fontWeight="semibold">{g.name}</Text>
                          <HStack gap="2" color="fg.muted" fontSize="sm">
                            <Box boxSize="2.5" rounded="full" bg={`${pal}.solid`} aria-hidden />
                            <Text as="span">{g.party}</Text>
                          </HStack>
                        </Box>
                        <Text as="span" fontSize="sm" fontWeight="medium" textAlign="end" flexShrink={0}>
                          {s ? `${tableById.get(s.table)?.name}, seat ${s.seat + 1}` : g.rsvp === "no" ? "Not needed" : "Not seated"}
                        </Text>
                      </Flex>
                      <HStack gap="1.5" mt="2" wrap="wrap">
                        <RsvpBadge rsvp={g.rsvp} />
                        {g.diet ? (
                          <Badge colorPalette="yellow" variant="subtle">
                            {g.diet}
                          </Badge>
                        ) : null}
                      </HStack>
                    </chakra.li>
                  );
                })}
              </Stack>
            </>
          )}
        </Panel>

        <Panel as="section" aria-labelledby="meals-h" overflow="hidden">
          <PanelHeader title="Meals for the caterer" id="meals-h">
            <Button size="xs" variant="outline" onClick={copySummary}>
              {copied === "done" ? <LuCheck /> : <LuCopy />}
              {copied === "done" ? "Copied" : copied === "failed" ? "Copy failed" : "Copy counts"}
            </Button>
          </PanelHeader>
          <Text fontSize="xs" color="fg.muted" px="4" pt="3">
            Confirmed guests only. Guests who have not replied or said maybe are counted separately.
          </Text>
          <Table.ScrollArea>
            <Table.Root size="sm" variant="line">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader pl="4">Meal</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">Confirmed</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end" pr="4">
                    Maybe
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {meals.map((m) => (
                  <Table.Row key={m.key}>
                    <Table.Cell pl="4" verticalAlign="top">
                      <Text fontWeight="medium">{m.key}</Text>
                      <Text fontSize="xs" color="fg.muted">
                        {m.where.length ? m.where.map(([name, n]) => `${name} ${n}`).join(", ") : "No one yet"}
                      </Text>
                    </Table.Cell>
                    <Table.Cell textAlign="end" fontWeight="bold" fontVariantNumeric="tabular-nums" verticalAlign="top">
                      {m.confirmed}
                    </Table.Cell>
                    <Table.Cell textAlign="end" pr="4" color="fg.muted" fontVariantNumeric="tabular-nums" verticalAlign="top">
                      {m.possible || "-"}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
              <Table.Footer>
                <Table.Row>
                  <Table.Cell pl="4" fontWeight="bold">
                    Total
                  </Table.Cell>
                  <Table.Cell textAlign="end" fontWeight="bold" fontVariantNumeric="tabular-nums">
                    {totalConfirmed}
                  </Table.Cell>
                  <Table.Cell textAlign="end" pr="4" color="fg.muted" fontVariantNumeric="tabular-nums">
                    {totalPossible || "-"}
                  </Table.Cell>
                </Table.Row>
              </Table.Footer>
            </Table.Root>
          </Table.ScrollArea>
          <Text fontSize="xs" color="fg.muted" px="4" py="3" role="status" aria-live="polite">
            {copied === "done" ? "Counts copied to the clipboard." : copied === "failed" ? "The clipboard was not available." : `${guests.filter((g) => g.rsvp === "no").length} declined are not counted.`}
          </Text>
        </Panel>
      </Grid>
    </Box>
  );
}
