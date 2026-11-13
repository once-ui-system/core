"use client"

import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Stack,
  Table,
  Text,
  chakra,
} from "@chakra-ui/react"
import NextLink from "next/link"
import * as React from "react"
import { LuSearch, LuX } from "react-icons/lu"
import { PageHeader } from "@/components/PageHeader"
import { Avatar } from "@/components/ui/avatar"
import { EmptyState } from "@/components/ui/empty-state"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select"
import { guests, tables, type Guest, type Rsvp } from "@/lib/data"
import {
  DIETS,
  mealCounts,
  PARTIES,
  partyPalette,
  RSVP_LABEL,
  RSVP_PALETTE,
  STANDARD_MEAL,
  tableById,
} from "@/lib/plan"
import { usePlan } from "@/lib/store"

const NO_DIET = "none"

function SummaryCard({ label, value, caption }: { label: string; value: number; caption: string }) {
  return (
    <Stack gap="0.5" bg="bg.panel" borderWidth="1px" borderColor="border" borderRadius="xl" px="4" py="3" shadow="xs">
      <Text fontSize="xs" fontWeight="medium" color="fg.muted" textTransform="uppercase" letterSpacing="0.06em">
        {label}
      </Text>
      <Text fontSize="3xl" fontWeight="semibold" lineHeight="1.1" fontFamily="heading">
        {value}
      </Text>
      <Text fontSize="sm" color="fg.muted">
        {caption}
      </Text>
    </Stack>
  )
}

function TableCell({ guest }: { guest: Guest }) {
  const plan = usePlan()
  const pos = plan.positions[guest.id]
  if (guest.rsvp === "no") {
    return (
      <Text as="span" fontSize="sm" color="fg.subtle">
        Declined
      </Text>
    )
  }
  if (!pos) {
    return (
      <Badge colorPalette="orange" variant="subtle">
        Not seated
      </Badge>
    )
  }
  const t = tableById[pos.tableId]
  return (
    <chakra.span fontSize="sm">
      <NextLink
        href="/"
        onClick={() => plan.selectTable(pos.tableId, guest.id)}
        aria-label={`${t?.name}, seat ${pos.seat + 1}. Show on the plan`}
        style={{ textDecoration: "underline", textUnderlineOffset: "3px" }}
      >
        {t?.name}
      </NextLink>
      <chakra.span color="fg.muted"> · seat {pos.seat + 1}</chakra.span>
    </chakra.span>
  )
}

export function GuestsView() {
  const [query, setQuery] = React.useState("")
  const [party, setParty] = React.useState("all")
  const [rsvp, setRsvp] = React.useState("all")
  const [diet, setDiet] = React.useState("all")
  const plan = usePlan()
  const meals = React.useMemo(() => mealCounts(), [])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return guests.filter((g) => {
      if (q && !g.name.toLowerCase().includes(q)) return false
      if (party !== "all" && g.party !== party) return false
      if (rsvp !== "all" && g.rsvp !== rsvp) return false
      if (diet === NO_DIET && g.diet !== null) return false
      if (diet !== "all" && diet !== NO_DIET && g.diet !== diet) return false
      return true
    })
  }, [query, party, rsvp, diet])

  const filtersActive = query !== "" || party !== "all" || rsvp !== "all" || diet !== "all"
  const clear = () => {
    setQuery("")
    setParty("all")
    setRsvp("all")
    setDiet("all")
  }

  const total = guests.length
  const yes = guests.filter((g) => g.rsvp === "yes").length
  const undecided = guests.filter((g) => g.rsvp === "maybe" || g.rsvp === "pending").length
  const declined = guests.filter((g) => g.rsvp === "no").length

  const rsvpOptions: { value: string; label: string }[] = [
    { value: "all", label: "Any reply" },
    ...(["yes", "maybe", "pending", "no"] as Rsvp[]).map((r) => ({ value: r, label: RSVP_LABEL[r] })),
  ]

  return (
    <Stack gap="4">
      <PageHeader eyebrow="Guest list" title="Guests" printLabel="Print list" />

      <SimpleGrid columns={{ base: 2, md: 4 }} gap={{ base: "2", md: "3" }}>
        <SummaryCard label="Invited" value={total} caption="on the list" />
        <SummaryCard label="Attending" value={yes} caption="replied yes" />
        <SummaryCard label="Undecided" value={undecided} caption="maybe or no reply yet" />
        <SummaryCard label="Declined" value={declined} caption="not coming" />
      </SimpleGrid>

      <Grid templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 360px" }} gap="4" alignItems="start">
        <Stack
          gap="4"
          bg="bg.panel"
          borderWidth="1px"
          borderColor="border"
          borderRadius="xl"
          shadow="xs"
          p={{ base: "3", md: "4" }}
          minW="0"
          order={{ base: 2, lg: 1 }}
        >
          <Box _print={{ display: "none" }}>
            <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="3" alignItems="end">
              <Field label="Search">
                <InputGroup startElement={<LuSearch />} w="100%">
                  <Input
                    type="search"
                    placeholder="Guest name"
                    value={query}
                    onChange={(e) => setQuery(e.currentTarget.value)}
                  />
                </InputGroup>
              </Field>
              <Field label="Party">
                <NativeSelectRoot>
                  <NativeSelectField
                    value={party}
                    onChange={(e) => setParty(e.currentTarget.value)}
                    items={[{ value: "all", label: "All parties" }, ...PARTIES.map((p) => ({ value: p, label: p }))]}
                  />
                </NativeSelectRoot>
              </Field>
              <Field label="RSVP">
                <NativeSelectRoot>
                  <NativeSelectField
                    value={rsvp}
                    onChange={(e) => setRsvp(e.currentTarget.value)}
                    items={rsvpOptions}
                  />
                </NativeSelectRoot>
              </Field>
              <Field label="Diet">
                <NativeSelectRoot>
                  <NativeSelectField
                    value={diet}
                    onChange={(e) => setDiet(e.currentTarget.value)}
                    items={[
                      { value: "all", label: "Any diet" },
                      { value: NO_DIET, label: "No dietary need" },
                      ...DIETS.map((d) => ({ value: d, label: d })),
                    ]}
                  />
                </NativeSelectRoot>
              </Field>
            </SimpleGrid>
          </Box>

          <Flex justify="space-between" align="center" gap="2" wrap="wrap">
            <Text fontSize="sm" color="fg.muted" role="status" aria-live="polite">
              Showing <chakra.strong color="fg">{filtered.length}</chakra.strong> of {total} guests
            </Text>
            {filtersActive ? (
              <Button size="xs" variant="ghost" onClick={clear} _print={{ display: "none" }}>
                <LuX />
                Clear filters
              </Button>
            ) : null}
          </Flex>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<LuSearch />}
              title="No guests match"
              description="Try a different name, or clear the filters."
            >
              <Button size="sm" variant="outline" onClick={clear}>
                Clear filters
              </Button>
            </EmptyState>
          ) : (
            <Table.ScrollArea borderWidth="1px" borderRadius="lg">
              <Table.Root size="md" variant="line" interactive>
                <Table.Header>
                  <Table.Row bg="bg.subtle">
                    <Table.ColumnHeader>Guest</Table.ColumnHeader>
                    <Table.ColumnHeader display={{ base: "none", md: "table-cell" }}>Party</Table.ColumnHeader>
                    <Table.ColumnHeader>RSVP</Table.ColumnHeader>
                    <Table.ColumnHeader display={{ base: "none", md: "table-cell" }}>Diet</Table.ColumnHeader>
                    <Table.ColumnHeader>Table</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filtered.map((g) => (
                    <Table.Row key={g.id}>
                      <Table.Cell>
                        <HStack gap="3" align="center">
                          <Avatar name={g.name} size="sm" colorPalette={partyPalette(g.party)} />
                          <Stack gap="0.5" minW="0">
                            <Text fontWeight="medium" fontSize="sm">
                              {g.name}
                            </Text>
                            <Text fontSize="xs" color="fg.muted" display={{ base: "block", md: "none" }}>
                              {g.party}
                            </Text>
                            {g.diet ? (
                              <Box display={{ base: "block", md: "none" }}>
                                <Badge colorPalette="yellow" variant="subtle" size="sm">
                                  {g.diet}
                                </Badge>
                              </Box>
                            ) : null}
                          </Stack>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell display={{ base: "none", md: "table-cell" }}>
                        <HStack gap="2">
                          <Box boxSize="2.5" borderRadius="full" bg={`${partyPalette(g.party)}.solid`} aria-hidden="true" />
                          <Text fontSize="sm">{g.party}</Text>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge colorPalette={RSVP_PALETTE[g.rsvp]} variant="subtle">
                          {RSVP_LABEL[g.rsvp]}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell display={{ base: "none", md: "table-cell" }}>
                        {g.diet ? (
                          <Badge colorPalette="yellow" variant="subtle">
                            {g.diet}
                          </Badge>
                        ) : (
                          <Text fontSize="sm" color="fg.subtle">
                            None
                          </Text>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <TableCell guest={g} />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Table.ScrollArea>
          )}
        </Stack>

        <Stack
          gap="3"
          bg="bg.panel"
          borderWidth="1px"
          borderColor="border"
          borderRadius="xl"
          shadow="xs"
          p={{ base: "3", md: "4" }}
          position={{ base: "static", lg: "sticky" }}
          top="72px"
          order={{ base: 1, lg: 2 }}
        >
          <Box>
            <Heading as="h2" fontFamily="heading" size="lg" fontWeight="semibold">
              Meals for the caterer
            </Heading>
            <Text fontSize="sm" color="fg.muted">
              {meals.confirmed} confirmed, {meals.awaiting} still to confirm. {meals.declined} declined and not counted.
            </Text>
          </Box>
          <Table.ScrollArea borderWidth="1px" borderRadius="lg">
            <Table.Root size="sm" variant="line">
              <Table.Header>
                <Table.Row bg="bg.subtle">
                  <Table.ColumnHeader>Meal</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">Confirmed</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">To confirm</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {meals.rows.map((r) => {
                  const value = r.meal === STANDARD_MEAL ? NO_DIET : r.meal
                  const active = diet === value
                  return (
                    <Table.Row key={r.meal}>
                      <Table.Cell>
                        <chakra.button
                          type="button"
                          textAlign="start"
                          fontSize="sm"
                          fontWeight={active ? "semibold" : "normal"}
                          color={active ? "brand.fg" : "fg"}
                          textDecoration={active ? "underline" : "none"}
                          textUnderlineOffset="3px"
                          _hover={{ textDecoration: "underline" }}
                          _focusVisible={{ outline: "2px solid", outlineColor: "brand.focusRing", outlineOffset: "2px" }}
                          aria-pressed={active}
                          aria-label={`${active ? "Stop filtering by" : "Filter the guest list by"} ${r.meal}`}
                          onClick={() => setDiet(active ? "all" : value)}
                        >
                          {r.meal}
                        </chakra.button>
                      </Table.Cell>
                      <Table.Cell textAlign="end" fontWeight="semibold">
                        {r.confirmed}
                      </Table.Cell>
                      <Table.Cell textAlign="end" color="fg.muted">
                        {r.awaiting}
                      </Table.Cell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
              <Table.Footer>
                <Table.Row bg="bg.subtle">
                  <Table.Cell fontWeight="semibold">Total meals</Table.Cell>
                  <Table.Cell textAlign="end" fontWeight="semibold">
                    {meals.confirmed}
                  </Table.Cell>
                  <Table.Cell textAlign="end" color="fg.muted" fontWeight="semibold">
                    {meals.awaiting}
                  </Table.Cell>
                </Table.Row>
              </Table.Footer>
            </Table.Root>
          </Table.ScrollArea>
          <Text fontSize="xs" color="fg.muted">
            Confirmed counts guests who replied yes. "To confirm" is guests who said maybe or have not replied.
            Select a meal to filter the list. {plan.counts.seated} of {total} guests are seated across {tables.length} tables.
          </Text>
        </Stack>
      </Grid>
    </Stack>
  )
}
