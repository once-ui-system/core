"use client"

import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Input,
  NativeSelect,
  Table,
  Text,
  chakra,
} from "@chakra-ui/react"
import * as React from "react"
import { LuSearch, LuX } from "react-icons/lu"
import { InputGroup } from "@/components/ui/input-group"
import { GuestAvatar, DietTag, RsvpBadge } from "@/components/plan/parts"
import { usePlan } from "@/components/plan/store"
import {
  DIETS,
  GUESTS,
  PARTIES,
  RSVP_LABEL,
  STANDARD_MEAL,
  TABLES,
  TABLES_BY_ID,
  type Rsvp,
} from "@/lib/data"

const RSVPS: Rsvp[] = ["yes", "maybe", "pending", "no"]

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <Box minW="0">
      <chakra.label fontSize="xs" fontWeight="semibold" color="fg.muted" display="block">
        <Box mb="1">{label}</Box>
        <NativeSelect.Root fontWeight="normal" color="fg">
          <NativeSelect.Field value={value} onChange={(e) => onChange(e.currentTarget.value)}>
            {children}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </chakra.label>
    </Box>
  )
}

export function GuestsView() {
  const { tableOf, seats } = usePlan()
  const [query, setQuery] = React.useState("")
  const [party, setParty] = React.useState("")
  const [rsvp, setRsvp] = React.useState("")
  const [diet, setDiet] = React.useState("")

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return GUESTS.filter((g) => {
      if (q && !g.name.toLowerCase().includes(q)) return false
      if (party && g.party !== party) return false
      if (rsvp && g.rsvp !== rsvp) return false
      if (diet === "__none" && g.diet) return false
      if (diet && diet !== "__none" && g.diet !== diet) return false
      return true
    })
  }, [query, party, rsvp, diet])

  const filtersOn = Boolean(query || party || rsvp || diet)
  const clear = () => {
    setQuery("")
    setParty("")
    setRsvp("")
    setDiet("")
  }

  // Meals for the caterer: attending guests are firm, maybe and no reply are possible.
  const meals = React.useMemo(() => {
    const names = [STANDARD_MEAL, ...DIETS]
    return names.map((m) => {
      const matches = (g: (typeof GUESTS)[number]) => (m === STANDARD_MEAL ? !g.diet : g.diet === m)
      return {
        meal: m,
        confirmed: GUESTS.filter((g) => g.rsvp === "yes" && matches(g)).length,
        possible: GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && matches(g)).length,
      }
    })
  }, [])
  const totalConfirmed = meals.reduce((n, m) => n + m.confirmed, 0)
  const totalPossible = meals.reduce((n, m) => n + m.possible, 0)

  const rsvpCounts = RSVPS.map((r) => ({ r, n: GUESTS.filter((g) => g.rsvp === r).length }))

  const byTable = TABLES.map((t) => {
    const ids = seats[t.id].filter((x): x is string => x !== null)
    const gs = GUESTS.filter((g) => ids.includes(g.id))
    const counts = new Map<string, number>()
    for (const g of gs) if (g.diet) counts.set(g.diet, (counts.get(g.diet) ?? 0) + 1)
    return { table: t, total: gs.length, diets: Array.from(counts.entries()) }
  })

  return (
    <Flex direction="column" gap={{ base: "4", md: "5" }}>
      <Box>
        <Heading as="h1" size={{ base: "lg", md: "xl" }}>
          Guest list
        </Heading>
        <Text color="fg.muted" fontSize="sm">
          {GUESTS.length} invited · {rsvpCounts.map((c) => `${c.n} ${RSVP_LABEL[c.r].toLowerCase()}`).join(" · ")}
        </Text>
      </Box>

      <Grid templateColumns={{ base: "minmax(0, 1fr)", xl: "minmax(0, 1fr) 24rem" }} gap={{ base: "4", md: "5" }} alignItems="start">
        <Flex direction="column" gap="3" minW="0">
          <Box rounded="xl" borderWidth="1px" bg="bg.panel" p={{ base: "3", md: "4" }}>
            <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "2fr 1fr 1fr 1fr" }} gap="3" alignItems="end">
              <Box gridColumn={{ base: "auto", sm: "1 / -1", lg: "auto" }}>
                <chakra.label htmlFor="guest-search" fontSize="xs" fontWeight="semibold" color="fg.muted" display="block" mb="1">
                  Search by name
                </chakra.label>
                <InputGroup startElement={<LuSearch />} w="full">
                  <Input
                    id="guest-search"
                    type="search"
                    placeholder="Search guests"
                    value={query}
                    onChange={(e) => setQuery(e.currentTarget.value)}
                  />
                </InputGroup>
              </Box>
              <Select label="Party" value={party} onChange={setParty}>
                <option value="">All parties</option>
                {PARTIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
              <Select label="RSVP" value={rsvp} onChange={setRsvp}>
                <option value="">Any RSVP</option>
                {RSVPS.map((r) => (
                  <option key={r} value={r}>
                    {RSVP_LABEL[r]}
                  </option>
                ))}
              </Select>
              <Select label="Diet" value={diet} onChange={setDiet}>
                <option value="">Any diet</option>
                <option value="__none">No dietary need</option>
                {DIETS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </Grid>
            <Flex mt="3" align="center" justify="space-between" gap="2" wrap="wrap">
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

          <Box rounded="xl" borderWidth="1px" bg="bg.panel" overflow="hidden">
            <Table.ScrollArea>
              <Table.Root size="md" interactive>
                <Table.Header>
                  <Table.Row bg="bg.muted">
                    <Table.ColumnHeader>Guest</Table.ColumnHeader>
                    <Table.ColumnHeader display={{ base: "none", md: "table-cell" }}>Party</Table.ColumnHeader>
                    <Table.ColumnHeader display={{ base: "none", sm: "table-cell" }}>RSVP</Table.ColumnHeader>
                    <Table.ColumnHeader display={{ base: "none", sm: "table-cell" }}>Diet</Table.ColumnHeader>
                    <Table.ColumnHeader>Table</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filtered.map((g) => {
                    const tid = tableOf[g.id]
                    return (
                      <Table.Row key={g.id}>
                        <Table.Cell>
                          <Flex align="center" gap="3">
                            <GuestAvatar guestId={g.id} size="8" />
                            <Box minW="0">
                              <Text fontWeight="semibold" fontSize="sm">
                                {g.name}
                              </Text>
                              <Text fontSize="xs" color="fg.muted" display={{ base: "block", md: "none" }}>
                                {g.party}
                              </Text>
                              <Flex display={{ base: "flex", sm: "none" }} mt="1" gap="1" wrap="wrap">
                                <RsvpBadge guestId={g.id} />
                                {g.diet && <DietTag diet={g.diet} />}
                              </Flex>
                            </Box>
                          </Flex>
                        </Table.Cell>
                        <Table.Cell display={{ base: "none", md: "table-cell" }}>{g.party}</Table.Cell>
                        <Table.Cell display={{ base: "none", sm: "table-cell" }}>
                          <RsvpBadge guestId={g.id} />
                        </Table.Cell>
                        <Table.Cell display={{ base: "none", sm: "table-cell" }}>
                          {g.diet ? <DietTag diet={g.diet} /> : <Text color="fg.muted">None</Text>}
                        </Table.Cell>
                        <Table.Cell>
                          {tid ? (
                            <Text fontWeight="medium">{TABLES_BY_ID[tid].name}</Text>
                          ) : g.rsvp === "no" ? (
                            <Text color="fg.muted">Not needed</Text>
                          ) : (
                            <Badge colorPalette={g.rsvp === "yes" ? "orange" : "gray"} variant="subtle">
                              Unseated
                            </Badge>
                          )}
                        </Table.Cell>
                      </Table.Row>
                    )
                  })}
                  {filtered.length === 0 && (
                    <Table.Row>
                      <Table.Cell colSpan={5}>
                        <Text textAlign="center" color="fg.muted" py="6">
                          No guests match these filters.
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Root>
            </Table.ScrollArea>
          </Box>
        </Flex>

        <Flex direction="column" gap="4" minW="0">
          <Box as="section" aria-labelledby="meals-heading" rounded="xl" borderWidth="1px" bg="bg.panel" p="4">
            <Heading as="h2" id="meals-heading" size="md">
              Meals for the caterer
            </Heading>
            <Text fontSize="sm" color="fg.muted" mb="3">
              Attending guests are firm. Maybe and no reply are listed apart.
            </Text>
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Meal</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">Attending</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">Possible</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {meals.map((m) => (
                  <Table.Row key={m.meal}>
                    <Table.Cell>{m.meal}</Table.Cell>
                    <Table.Cell textAlign="end" fontWeight="semibold">
                      {m.confirmed}
                    </Table.Cell>
                    <Table.Cell textAlign="end" color="fg.muted">
                      {m.possible || "–"}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
              <Table.Footer>
                <Table.Row>
                  <Table.Cell fontWeight="bold">Total</Table.Cell>
                  <Table.Cell textAlign="end" fontWeight="bold">
                    {totalConfirmed}
                  </Table.Cell>
                  <Table.Cell textAlign="end" fontWeight="bold" color="fg.muted">
                    {totalPossible}
                  </Table.Cell>
                </Table.Row>
              </Table.Footer>
            </Table.Root>
          </Box>

          <Box as="section" aria-labelledby="bytable-heading" rounded="xl" borderWidth="1px" bg="bg.panel" p="4">
            <Heading as="h2" id="bytable-heading" size="md">
              Dietary needs by table
            </Heading>
            <Text fontSize="sm" color="fg.muted" mb="3">
              For the venue to place meals; follows the plan as you seat guests.
            </Text>
            <Flex as="ul" listStyleType="none" direction="column" gap="3">
              {byTable.map(({ table, total, diets }) => (
                <li key={table.id}>
                  <Flex justify="space-between" fontSize="sm" fontWeight="semibold">
                    <Text>{table.name}</Text>
                    <Text color="fg.muted" fontWeight="normal">
                      {total} of {table.seats} seated
                    </Text>
                  </Flex>
                  {diets.length === 0 ? (
                    <Text fontSize="xs" color="fg.muted">
                      {total === 0 ? "Empty" : "No dietary needs"}
                    </Text>
                  ) : (
                    <Flex gap="1.5" wrap="wrap" mt="1">
                      {diets.map(([d, n]) => (
                        <Badge key={d} colorPalette="orange" variant="subtle">
                          {n} × {d}
                        </Badge>
                      ))}
                    </Flex>
                  )}
                </li>
              ))}
            </Flex>
          </Box>
        </Flex>
      </Grid>
    </Flex>
  )
}
