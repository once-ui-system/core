"use client"

import {
  Badge,
  Box,
  Button,
  Field,
  Flex,
  Grid,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react"
import * as React from "react"
import { LuSearch, LuX } from "react-icons/lu"
import { usePlan } from "@/components/PlanProvider"
import { InputGroup } from "@/components/ui/input-group"
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select"
import {
  EVENT,
  GUESTS,
  PARTIES,
  PARTY_PALETTE,
  RSVP_LABEL,
  RSVP_PALETTE,
  STANDARD_MEAL,
  TABLE_BY_ID,
  formatDate,
  type Guest,
  type Rsvp,
} from "@/lib/data"

const NO_DIET = "__none"
const RSVPS: Rsvp[] = ["yes", "maybe", "pending", "no"]
const DIETS = Array.from(new Set(GUESTS.map((g) => g.diet).filter((d): d is string => !!d))).sort()

interface MealRow {
  meal: string
  attending: number
  unconfirmed: number
}

function mealCounts(): MealRow[] {
  const map = new Map<string, MealRow>()
  for (const g of GUESTS) {
    if (g.rsvp === "no") continue
    const meal = g.diet ?? STANDARD_MEAL
    const row = map.get(meal) ?? { meal, attending: 0, unconfirmed: 0 }
    if (g.rsvp === "yes") row.attending += 1
    else row.unconfirmed += 1
    map.set(meal, row)
  }
  return Array.from(map.values()).sort((a, b) => {
    if (a.meal === STANDARD_MEAL) return -1
    if (b.meal === STANDARD_MEAL) return 1
    return b.attending - a.attending || a.meal.localeCompare(b.meal)
  })
}

function RsvpBadge({ rsvp }: { rsvp: Rsvp }) {
  return (
    <Badge colorPalette={RSVP_PALETTE[rsvp]} variant="subtle" size="sm">
      {RSVP_LABEL[rsvp]}
    </Badge>
  )
}

function PartyDot({ party }: { party: string }) {
  return <Box boxSize="10px" rounded="full" colorPalette={PARTY_PALETTE[party] ?? "gray"} bg="colorPalette.solid" flexShrink={0} />
}

export default function GuestsPage() {
  const { assign } = usePlan()
  const [query, setQuery] = React.useState("")
  const [party, setParty] = React.useState("")
  const [rsvp, setRsvp] = React.useState("")
  const [diet, setDiet] = React.useState("")

  const tableOf = (g: Guest): string | null => {
    const ref = assign[g.id]
    return ref ? (TABLE_BY_ID[ref.table]?.name ?? null) : null
  }

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return GUESTS.filter((g) => {
      if (q && !g.name.toLowerCase().includes(q)) return false
      if (party && g.party !== party) return false
      if (rsvp && g.rsvp !== rsvp) return false
      if (diet === NO_DIET && g.diet) return false
      if (diet && diet !== NO_DIET && g.diet !== diet) return false
      return true
    })
  }, [query, party, rsvp, diet])

  const meals = React.useMemo(mealCounts, [])
  const totalAttending = meals.reduce((n, m) => n + m.attending, 0)
  const totalUnconfirmed = meals.reduce((n, m) => n + m.unconfirmed, 0)
  const filtersOn = !!(query || party || rsvp || diet)
  const clear = () => {
    setQuery("")
    setParty("")
    setRsvp("")
    setDiet("")
  }

  return (
    <Box maxW="1800px" mx="auto" px={{ base: "3", md: "6" }} py={{ base: "4", md: "6" }}>
      <Stack gap="4">
        <Box>
          <Heading as="h1" size={{ base: "xl", md: "2xl" }} letterSpacing="-0.02em">
            Guest list
          </Heading>
          <Text color="fg.muted" fontSize="sm">
            {EVENT.name} · {formatDate(EVENT.date)} · {GUESTS.length} invited
          </Text>
        </Box>

        <Grid templateColumns={{ base: "minmax(0, 1fr)", xl: "minmax(0, 1fr) 380px" }} gap="4" alignItems="start">
          <Stack gap="4" minW="0">
            <Box bg="bg.panel" borderWidth="1px" borderColor="border" rounded="xl" p={{ base: "3", md: "4" }}>
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="3" role="search" aria-label="Filter guests">
                <Field.Root>
                  <Field.Label>Search</Field.Label>
                  <InputGroup w="full" startElement={<LuSearch />}>
                    <Input
                      type="search"
                      placeholder="Name"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </InputGroup>
                </Field.Root>
                <Field.Root>
                  <Field.Label>Party</Field.Label>
                  <NativeSelectRoot>
                    <NativeSelectField
                      value={party}
                      onChange={(e) => setParty(e.target.value)}
                      items={[{ value: "", label: "All parties" }, ...PARTIES.map((p) => ({ value: p, label: p }))]}
                    />
                  </NativeSelectRoot>
                </Field.Root>
                <Field.Root>
                  <Field.Label>RSVP</Field.Label>
                  <NativeSelectRoot>
                    <NativeSelectField
                      value={rsvp}
                      onChange={(e) => setRsvp(e.target.value)}
                      items={[{ value: "", label: "Any RSVP" }, ...RSVPS.map((r) => ({ value: r, label: RSVP_LABEL[r] }))]}
                    />
                  </NativeSelectRoot>
                </Field.Root>
                <Field.Root>
                  <Field.Label>Diet</Field.Label>
                  <NativeSelectRoot>
                    <NativeSelectField
                      value={diet}
                      onChange={(e) => setDiet(e.target.value)}
                      items={[
                        { value: "", label: "Any diet" },
                        { value: NO_DIET, label: "No requirements" },
                        ...DIETS.map((d) => ({ value: d, label: d })),
                      ]}
                    />
                  </NativeSelectRoot>
                </Field.Root>
              </SimpleGrid>
              <Flex mt="3" align="center" justify="space-between" gap="3" wrap="wrap">
                <Text fontSize="sm" color="fg.muted" role="status" aria-live="polite">
                  Showing {filtered.length} of {GUESTS.length} guests
                </Text>
                {filtersOn && (
                  <Button size="xs" variant="ghost" onClick={clear}>
                    <LuX /> Clear filters
                  </Button>
                )}
              </Flex>
            </Box>

            {/* wide screens: table */}
            <Box hideBelow="md" bg="bg.panel" borderWidth="1px" borderColor="border" rounded="xl" overflow="hidden">
              <Table.ScrollArea>
                <Table.Root size="md" interactive>
                  <Table.Header>
                    <Table.Row bg="bg.muted">
                      <Table.ColumnHeader>Guest</Table.ColumnHeader>
                      <Table.ColumnHeader>Party</Table.ColumnHeader>
                      <Table.ColumnHeader>RSVP</Table.ColumnHeader>
                      <Table.ColumnHeader>Diet</Table.ColumnHeader>
                      <Table.ColumnHeader>Table</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {filtered.map((g) => {
                      const t = tableOf(g)
                      return (
                        <Table.Row key={g.id}>
                          <Table.Cell fontWeight="medium">{g.name}</Table.Cell>
                          <Table.Cell>
                            <HStack gap="2">
                              <PartyDot party={g.party} />
                              <Text as="span">{g.party}</Text>
                            </HStack>
                          </Table.Cell>
                          <Table.Cell>
                            <RsvpBadge rsvp={g.rsvp} />
                          </Table.Cell>
                          <Table.Cell>
                            {g.diet ? (
                              <Badge colorPalette="orange" variant="subtle" size="sm">
                                {g.diet}
                              </Badge>
                            ) : (
                              <Text as="span" color="fg.subtle">
                                None
                              </Text>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            {t ? (
                              <Text as="span" fontWeight="medium">
                                {t}
                              </Text>
                            ) : (
                              <Text as="span" color={g.rsvp === "yes" ? "red.fg" : "fg.subtle"}>
                                {g.rsvp === "no" ? "Not coming" : "Not seated"}
                              </Text>
                            )}
                          </Table.Cell>
                        </Table.Row>
                      )
                    })}
                  </Table.Body>
                </Table.Root>
              </Table.ScrollArea>
              {filtered.length === 0 && <EmptyResults onClear={clear} />}
            </Box>

            {/* phones: cards */}
            <Box hideFrom="md">
              {filtered.length === 0 ? (
                <Box bg="bg.panel" borderWidth="1px" borderColor="border" rounded="xl">
                  <EmptyResults onClear={clear} />
                </Box>
              ) : (
                <Stack as="ul" gap="2" listStyleType="none" m="0" p="0" aria-label="Guests">
                  {filtered.map((g) => {
                    const t = tableOf(g)
                    return (
                      <Box as="li" key={g.id} bg="bg.panel" borderWidth="1px" borderColor="border" rounded="lg" px="3" py="2.5">
                        <Flex justify="space-between" gap="2" align="flex-start">
                          <Box minW="0">
                            <Text fontWeight="medium">{g.name}</Text>
                            <HStack gap="2" color="fg.muted" fontSize="sm">
                              <PartyDot party={g.party} />
                              <Text as="span">{g.party}</Text>
                            </HStack>
                          </Box>
                          <RsvpBadge rsvp={g.rsvp} />
                        </Flex>
                        <Flex mt="2" gap="2" align="center" wrap="wrap" fontSize="sm">
                          <Text as="span" fontWeight="medium" color={t ? "fg" : g.rsvp === "yes" ? "red.fg" : "fg.subtle"}>
                            {t ?? (g.rsvp === "no" ? "Not coming" : "Not seated")}
                          </Text>
                          {g.diet && (
                            <Badge colorPalette="orange" variant="subtle" size="sm">
                              {g.diet}
                            </Badge>
                          )}
                        </Flex>
                      </Box>
                    )
                  })}
                </Stack>
              )}
            </Box>
          </Stack>

          <Box
            bg="bg.panel"
            borderWidth="1px"
            borderColor="border"
            rounded="xl"
            p={{ base: "3", md: "4" }}
            position={{ xl: "sticky" }}
            top={{ xl: "72px" }}
          >
            <Heading as="h2" size="md">
              Meals for the caterer
            </Heading>
            <Text fontSize="sm" color="fg.muted" mt="1" mb="3">
              Counts cover the whole list, whatever the filters. Declined guests are left out.
            </Text>
            <Table.Root size="sm" aria-label="Meal counts">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Meal</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">Attending</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">Unconfirmed</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {meals.map((m) => (
                  <Table.Row key={m.meal}>
                    <Table.Cell fontWeight={m.meal === STANDARD_MEAL ? "medium" : "normal"}>{m.meal}</Table.Cell>
                    <Table.Cell textAlign="end" fontVariantNumeric="tabular-nums" fontWeight="semibold">
                      {m.attending}
                    </Table.Cell>
                    <Table.Cell textAlign="end" fontVariantNumeric="tabular-nums" color="fg.muted">
                      {m.unconfirmed}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
              <Table.Footer>
                <Table.Row>
                  <Table.Cell fontWeight="semibold">Total</Table.Cell>
                  <Table.Cell textAlign="end" fontWeight="semibold" fontVariantNumeric="tabular-nums">
                    {totalAttending}
                  </Table.Cell>
                  <Table.Cell textAlign="end" color="fg.muted" fontVariantNumeric="tabular-nums">
                    {totalUnconfirmed}
                  </Table.Cell>
                </Table.Row>
              </Table.Footer>
            </Table.Root>
          </Box>
        </Grid>
      </Stack>
    </Box>
  )
}

function EmptyResults({ onClear }: { onClear: () => void }) {
  return (
    <Stack align="center" gap="2" py="8" px="4" textAlign="center">
      <Text fontWeight="medium">No guests match these filters</Text>
      <Text fontSize="sm" color="fg.muted">
        Try a different name or clear a filter.
      </Text>
      <Button size="sm" variant="outline" onClick={onClear}>
        Clear filters
      </Button>
    </Stack>
  )
}
