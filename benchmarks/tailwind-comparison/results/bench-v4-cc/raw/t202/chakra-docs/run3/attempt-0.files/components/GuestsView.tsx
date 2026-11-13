"use client"

import { Badge, Box, Button, Flex, Grid, HStack, Input, Stack, Table, Text } from "@chakra-ui/react"
import * as React from "react"
import { LuSearch, LuUtensils } from "react-icons/lu"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select"
import { toaster } from "@/components/ui/toaster"
import { DietBadge, PartyDot, RSVP_LABEL, RsvpBadge } from "@/components/GuestBits"
import { GUESTS, TABLES, type Rsvp } from "@/lib/data"
import {
  STANDARD_MEAL,
  mealOf,
  occupants,
  placeGuest,
  tableById,
  tableName,
  unseatGuest,
  usePlacements,
} from "@/lib/seating"

const PARTIES = Array.from(new Set(GUESTS.map((g) => g.party)))
const DIETS = Array.from(new Set(GUESTS.flatMap((g) => (g.diet ? [g.diet] : [])))).sort()
const RSVP_ORDER: Rsvp[] = ["yes", "maybe", "pending", "no"]
const COLUMNS = { md: "minmax(0,2fr) minmax(0,1.5fr) 130px minmax(0,1.3fr) 190px" }

export function GuestsView() {
  const placements = usePlacements()
  const [q, setQ] = React.useState("")
  const [party, setParty] = React.useState("")
  const [rsvp, setRsvp] = React.useState("")
  const [diet, setDiet] = React.useState("")
  const [seating, setSeating] = React.useState("")

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase()
    return GUESTS.filter((g) => {
      if (needle && !g.name.toLowerCase().includes(needle)) return false
      if (party && g.party !== party) return false
      if (rsvp && g.rsvp !== rsvp) return false
      if (diet === "__none") {
        if (g.diet) return false
      } else if (diet && g.diet !== diet) return false
      if (seating === "seated" && !placements[g.id]) return false
      if (seating === "unseated" && placements[g.id]) return false
      return true
    }).sort((a, b) => a.name.localeCompare(b.name))
  }, [q, party, rsvp, diet, seating, placements])

  const filtersOn = !!(q || party || rsvp || diet || seating)
  const reset = () => {
    setQ("")
    setParty("")
    setRsvp("")
    setDiet("")
    setSeating("")
  }

  const meals = React.useMemo(() => {
    const map = new Map<string, { confirmed: number; possible: number }>()
    for (const g of GUESTS) {
      if (g.rsvp === "no") continue
      const m = mealOf(g)
      const row = map.get(m) ?? { confirmed: 0, possible: 0 }
      if (g.rsvp === "yes") row.confirmed++
      else row.possible++
      map.set(m, row)
    }
    const rows = Array.from(map.entries()).sort(([a], [b]) => {
      if (a === STANDARD_MEAL) return -1
      if (b === STANDARD_MEAL) return 1
      return a.localeCompare(b)
    })
    const totals = rows.reduce((t, [, r]) => ({ confirmed: t.confirmed + r.confirmed, possible: t.possible + r.possible }), {
      confirmed: 0,
      possible: 0,
    })
    return { rows, totals }
  }, [])

  const freeAt = (tableId: string) => {
    const t = tableById.get(tableId)
    return t ? occupants(placements, t).filter((x) => x === null).length : 0
  }

  const setTable = (guestId: string, value: string) => {
    if (!value) {
      unseatGuest(guestId)
      return
    }
    const res = placeGuest(guestId, value)
    if (!res.ok) toaster.create({ title: "Could not seat guest", description: res.reason, type: "error" })
  }

  return (
    <Grid templateColumns={{ base: "minmax(0,1fr)", lg: "minmax(0,1fr) 340px" }} gap="4" alignItems="start" colorPalette="teal">
      <Box minW="0">
        <Box bg="bg.panel" borderWidth="1px" borderRadius="xl" p="3" mb="3">
          <Grid templateColumns={{ base: "1fr 1fr", md: "2fr repeat(4, 1fr)" }} gap="3" alignItems="end">
            <Box gridColumn={{ base: "1 / -1", md: "auto" }}>
              <Field label="Search">
                <InputGroup startElement={<LuSearch />} w="100%">
                  <Input placeholder="Guest name" value={q} onChange={(e) => setQ(e.currentTarget.value)} />
                </InputGroup>
              </Field>
            </Box>
            <Field label="Party">
              <NativeSelectRoot>
                <NativeSelectField value={party} onChange={(e) => setParty(e.currentTarget.value)}>
                  <option value="">All parties</option>
                  {PARTIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </NativeSelectField>
              </NativeSelectRoot>
            </Field>
            <Field label="RSVP">
              <NativeSelectRoot>
                <NativeSelectField value={rsvp} onChange={(e) => setRsvp(e.currentTarget.value)}>
                  <option value="">Any RSVP</option>
                  {RSVP_ORDER.map((r) => (
                    <option key={r} value={r}>
                      {RSVP_LABEL[r]}
                    </option>
                  ))}
                </NativeSelectField>
              </NativeSelectRoot>
            </Field>
            <Field label="Diet">
              <NativeSelectRoot>
                <NativeSelectField value={diet} onChange={(e) => setDiet(e.currentTarget.value)}>
                  <option value="">Any diet</option>
                  <option value="__none">No dietary needs</option>
                  {DIETS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </NativeSelectField>
              </NativeSelectRoot>
            </Field>
            <Field label="Seating">
              <NativeSelectRoot>
                <NativeSelectField value={seating} onChange={(e) => setSeating(e.currentTarget.value)}>
                  <option value="">Seated or not</option>
                  <option value="seated">Seated</option>
                  <option value="unseated">Not seated</option>
                </NativeSelectField>
              </NativeSelectRoot>
            </Field>
          </Grid>
          <Flex mt="3" align="center" justify="space-between" gap="3">
            <Text fontSize="sm" color="fg.muted" role="status" aria-live="polite">
              Showing {filtered.length} of {GUESTS.length} guests
            </Text>
            {filtersOn && (
              <Button size="xs" variant="ghost" onClick={reset}>
                Clear filters
              </Button>
            )}
          </Flex>
        </Box>

        <Box bg="bg.panel" borderWidth="1px" borderRadius="xl" overflow="hidden">
          <Grid
            display={{ base: "none", md: "grid" }}
            templateColumns={COLUMNS.md}
            gap="3"
            px="4"
            py="2.5"
            bg="bg.muted"
            borderBottomWidth="1px"
            fontSize="xs"
            fontWeight="semibold"
            color="fg.muted"
            textTransform="uppercase"
            letterSpacing="0.04em"
          >
            <Text>Guest</Text>
            <Text>Party</Text>
            <Text>RSVP</Text>
            <Text>Meal</Text>
            <Text>Table</Text>
          </Grid>
          {filtered.length === 0 ? (
            <Stack align="center" gap="2" py="10" px="4" textAlign="center">
              <Text fontWeight="medium">No guests match these filters</Text>
              <Text fontSize="sm" color="fg.muted">
                Try a different name, or clear the filters.
              </Text>
              <Button size="sm" variant="outline" onClick={reset}>
                Clear filters
              </Button>
            </Stack>
          ) : (
            <Box as="ul" listStyleType="none" m="0" p="0">
              {filtered.map((g) => {
                const seat = placements[g.id]
                return (
                  <Grid
                    as="li"
                    key={g.id}
                    templateColumns={{ base: "1fr", ...COLUMNS }}
                    gap={{ base: "1.5", md: "3" }}
                    alignItems="center"
                    px="4"
                    py="3"
                    borderBottomWidth="1px"
                    borderColor="border.muted"
                    _last={{ borderBottomWidth: "0" }}
                  >
                    <Flex align="center" justify="space-between" gap="2">
                      <Text fontWeight="medium">{g.name}</Text>
                      <Box display={{ base: "block", md: "none" }}>
                        <RsvpBadge rsvp={g.rsvp} />
                      </Box>
                    </Flex>
                    <HStack gap="1.5" color="fg.muted" fontSize="sm">
                      <PartyDot party={g.party} />
                      <Text>{g.party}</Text>
                    </HStack>
                    <Box display={{ base: "none", md: "block" }}>
                      <RsvpBadge rsvp={g.rsvp} />
                    </Box>
                    <Box>
                      {g.diet ? (
                        <DietBadge diet={g.diet} />
                      ) : (
                        <Text fontSize="sm" color="fg.muted">
                          {STANDARD_MEAL}
                        </Text>
                      )}
                    </Box>
                    <Box>
                      {g.rsvp === "no" ? (
                        <Text fontSize="sm" color="fg.muted">
                          Not coming
                        </Text>
                      ) : (
                        <>
                          <NativeSelectRoot size="sm">
                            <NativeSelectField
                              aria-label={`Table for ${g.name}`}
                              value={seat?.table ?? ""}
                              onChange={(e) => setTable(g.id, e.currentTarget.value)}
                            >
                              <option value="">Not seated</option>
                              {TABLES.map((t) => (
                                <option key={t.id} value={t.id} disabled={freeAt(t.id) === 0 && seat?.table !== t.id}>
                                  {t.name} · {freeAt(t.id)} free
                                </option>
                              ))}
                            </NativeSelectField>
                          </NativeSelectRoot>
                          {seat && (
                            <Text fontSize="xs" color="fg.muted" mt="0.5">
                              {tableName(seat.table)}, seat {seat.seat + 1}
                            </Text>
                          )}
                        </>
                      )}
                    </Box>
                  </Grid>
                )
              })}
            </Box>
          )}
        </Box>
      </Box>

      <Box bg="bg.panel" borderWidth="1px" borderRadius="xl" p="4" order={{ base: -1, lg: 0 }} position={{ lg: "sticky" }} top={{ lg: "20" }}>
        <HStack gap="2" mb="1">
          <LuUtensils aria-hidden />
          <Text fontWeight="semibold">Meals for the caterer</Text>
        </HStack>
        <Text fontSize="xs" color="fg.muted" mb="3">
          Everyone who has not declined. Counts do not change with the filters.
        </Text>
        <Table.ScrollArea>
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Meal</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">Attending</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">Not confirmed</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {meals.rows.map(([meal, r]) => (
                <Table.Row key={meal}>
                  <Table.Cell>{meal}</Table.Cell>
                  <Table.Cell textAlign="end" fontWeight="semibold">
                    {r.confirmed}
                  </Table.Cell>
                  <Table.Cell textAlign="end" color="fg.muted">
                    {r.possible}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.Cell fontWeight="semibold">Total</Table.Cell>
                <Table.Cell textAlign="end" fontWeight="semibold">
                  {meals.totals.confirmed}
                </Table.Cell>
                <Table.Cell textAlign="end" color="fg.muted" fontWeight="semibold">
                  {meals.totals.possible}
                </Table.Cell>
              </Table.Row>
            </Table.Footer>
          </Table.Root>
        </Table.ScrollArea>
        <Flex mt="3" gap="2" wrap="wrap">
          <Badge variant="subtle" colorPalette="green">
            {GUESTS.filter((g) => g.rsvp === "no").length} declined, not counted
          </Badge>
        </Flex>
      </Box>
    </Grid>
  )
}
