"use client"

import { useMemo, useState } from "react"
import { Badge, Box, Button, Field, Flex, Grid, Heading, Input, SimpleGrid, Table, Text } from "@chakra-ui/react"
import { LuCopy, LuSearch } from "react-icons/lu"
import { InputGroup } from "@/components/ui/input-group"
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select"
import { toaster } from "@/components/ui/toaster"
import { guests, type Rsvp } from "@/lib/data"
import {
  catererSummary,
  dietNames,
  mealRows,
  parties,
  partyColor,
  rsvpLabel,
  rsvpPalette,
  tableById,
} from "@/lib/seating"
import { useSeating } from "./seating-provider"

const RSVP_ORDER: Rsvp[] = ["yes", "maybe", "pending", "no"]

function FilterSelect(props: {
  label: string
  value: string
  onChange: (v: string) => void
  items: { value: string; label: string }[]
}) {
  return (
    <Field.Root>
      <Field.Label fontSize="xs" color="fg.muted">
        {props.label}
      </Field.Label>
      <NativeSelectRoot size="md">
        <NativeSelectField value={props.value} onChange={(e) => props.onChange(e.target.value)} items={props.items} />
      </NativeSelectRoot>
    </Field.Root>
  )
}

export function GuestsView() {
  const { tableOf, seatedCount } = useSeating()
  const [q, setQ] = useState("")
  const [party, setParty] = useState("all")
  const [rsvp, setRsvp] = useState("all")
  const [diet, setDiet] = useState("all")
  const [seating, setSeating] = useState("all")

  const meals = useMemo(() => mealRows(), [])
  const confirmed = meals.reduce((n, m) => n + m.confirmed, 0)
  const awaiting = meals.reduce((n, m) => n + m.awaiting, 0)

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return guests.filter((g) => {
      const tid = tableOf[g.id]
      const tableName = tid ? tableById[tid].name : ""
      if (
        needle &&
        !`${g.name} ${g.party} ${g.diet ?? ""} ${tableName}`.toLowerCase().includes(needle)
      ) {
        return false
      }
      if (party !== "all" && g.party !== party) return false
      if (rsvp !== "all" && g.rsvp !== rsvp) return false
      if (diet === "none" && g.diet !== null) return false
      if (diet !== "all" && diet !== "none" && g.diet !== diet) return false
      if (seating === "seated" && !tid) return false
      if (seating === "unseated" && tid) return false
      return true
    })
  }, [q, party, rsvp, diet, seating, tableOf])

  const filtersActive = q !== "" || party !== "all" || rsvp !== "all" || diet !== "all" || seating !== "all"
  const clear = () => {
    setQ("")
    setParty("all")
    setRsvp("all")
    setDiet("all")
    setSeating("all")
  }

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(catererSummary(meals))
      toaster.create({ title: "Caterer summary copied", description: "Paste it into an email or message.", type: "success" })
    } catch {
      toaster.create({ title: "Could not copy", description: "Select the meal counts and copy them by hand.", type: "error" })
    }
  }

  return (
    <Grid templateColumns={{ base: "minmax(0, 1fr)", xl: "minmax(0, 1fr) 380px" }} gap="4" alignItems="start">
      <Box as="section" aria-labelledby="guests-title" minW="0" order={{ base: 2, xl: 1 }}>
        <Flex justify="space-between" align="baseline" gap="2" wrap="wrap" mb="3">
          <Heading as="h1" size="xl" id="guests-title">
            Guest list
          </Heading>
          <Text color="fg.muted" fontSize="sm">
            {guests.length} invited · {seatedCount} seated
          </Text>
        </Flex>

        <Box bg="bg.panel" borderWidth="1px" rounded="xl" p="4" mb="3">
          <InputGroup startElement={<LuSearch />} w="100%">
            <Input
              type="search"
              placeholder="Search by name, party, diet or table"
              aria-label="Search guests"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </InputGroup>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="3" mt="3">
            <FilterSelect
              label="Party"
              value={party}
              onChange={setParty}
              items={[{ value: "all", label: "All parties" }, ...parties.map((p) => ({ value: p, label: p }))]}
            />
            <FilterSelect
              label="RSVP"
              value={rsvp}
              onChange={setRsvp}
              items={[{ value: "all", label: "Any RSVP" }, ...RSVP_ORDER.map((r) => ({ value: r, label: rsvpLabel[r] }))]}
            />
            <FilterSelect
              label="Diet"
              value={diet}
              onChange={setDiet}
              items={[
                { value: "all", label: "Any diet" },
                { value: "none", label: "No dietary need" },
                ...dietNames.map((d) => ({ value: d, label: d })),
              ]}
            />
            <FilterSelect
              label="Seating"
              value={seating}
              onChange={setSeating}
              items={[
                { value: "all", label: "Seated or not" },
                { value: "seated", label: "Seated" },
                { value: "unseated", label: "Not seated" },
              ]}
            />
          </SimpleGrid>
          <Flex justify="space-between" align="center" mt="3" gap="2">
            <Text role="status" aria-live="polite" fontSize="sm" color="fg.muted">
              Showing {filtered.length} of {guests.length} guests
            </Text>
            {filtersActive && (
              <Button size="xs" variant="ghost" onClick={clear}>
                Clear filters
              </Button>
            )}
          </Flex>
        </Box>

        <Box bg="bg.panel" borderWidth="1px" rounded="xl" overflowX="auto">
          <Table.Root size="md" minW="640px" interactive>
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
                const tid = tableOf[g.id]
                return (
                  <Table.Row key={g.id}>
                    <Table.Cell fontWeight="600">
                      <Flex align="center" gap="2">
                        <Box aria-hidden boxSize="2.5" rounded="full" bg={`${partyColor(g.party)}.solid`} flexShrink={0} />
                        {g.name}
                      </Flex>
                    </Table.Cell>
                    <Table.Cell color="fg.muted">{g.party}</Table.Cell>
                    <Table.Cell>
                      <Badge colorPalette={rsvpPalette[g.rsvp]} variant="subtle">
                        {rsvpLabel[g.rsvp]}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      {g.diet ? (
                        <Badge colorPalette="orange" variant="subtle">
                          {g.diet}
                        </Badge>
                      ) : (
                        <Text as="span" color="fg.subtle">
                          None
                        </Text>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {tid ? (
                        <Badge colorPalette="teal" variant="outline">
                          {tableById[tid].name}
                        </Badge>
                      ) : g.rsvp === "no" ? (
                        <Text as="span" color="fg.subtle">
                          Not attending
                        </Text>
                      ) : (
                        <Text as="span" color="orange.fg" fontWeight="500">
                          Not seated yet
                        </Text>
                      )}
                    </Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table.Root>
          {filtered.length === 0 && (
            <Box p="8" textAlign="center">
              <Text fontWeight="600">No guests match these filters.</Text>
              <Button mt="3" size="sm" variant="outline" onClick={clear}>
                Clear filters
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      <Box
        as="aside"
        aria-labelledby="meals-title"
        bg="bg.panel"
        borderWidth="1px"
        rounded="xl"
        p="4"
        order={{ base: 1, xl: 2 }}
        position={{ xl: "sticky" }}
        top={{ xl: "84px" }}
      >
        <Flex justify="space-between" align="start" gap="2" mb="1">
          <Heading as="h2" size="md" id="meals-title">
            Meals for the caterer
          </Heading>
          <Button size="xs" variant="outline" onClick={copySummary}>
            <LuCopy /> Copy
          </Button>
        </Flex>
        <Text fontSize="sm" color="fg.muted" mb="3">
          {confirmed} confirmed, {awaiting} still to reply. Select a meal to filter the list.
        </Text>
        <SimpleGrid columns={{ base: 2, sm: 3, xl: 2 }} gap="2">
          {meals.map((m) => {
            const active = diet === (m.diet ?? "none")
            return (
              <Box
                as="button"
                key={m.key}
                textAlign="start"
                borderWidth="1px"
                rounded="lg"
                p="3"
                minH="20"
                bg={active ? "teal.subtle" : "bg"}
                borderColor={active ? "teal.solid" : "border"}
                _hover={{ bg: active ? "teal.subtle" : "bg.muted" }}
                aria-pressed={active}
                onClick={() => setDiet(active ? "all" : (m.diet ?? "none"))}
                aria-label={`${m.label}: ${m.confirmed} confirmed${m.awaiting ? `, ${m.awaiting} awaiting reply` : ""}. Filter the list`}
              >
                <Text fontSize="xs" color="fg.muted" fontWeight="500">
                  {m.label}
                </Text>
                <Text fontSize="2xl" fontWeight="700" lineHeight="1.2">
                  {m.confirmed}
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  {m.awaiting ? `+ ${m.awaiting} awaiting reply` : "all confirmed"}
                </Text>
              </Box>
            )
          })}
        </SimpleGrid>
        <Flex mt="3" pt="3" borderTopWidth="1px" justify="space-between" fontSize="sm" fontWeight="600">
          <Text>Total confirmed</Text>
          <Text>{confirmed}</Text>
        </Flex>
      </Box>
    </Grid>
  )
}
