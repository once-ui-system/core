```tsx app/guests/page.tsx
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
```

```tsx app/layout.tsx
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { PlanProvider } from "@/components/PlanProvider";
import { EmotionRegistry } from "@/components/ui/emotion-registry";
import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Seatwise: seating plan for Ines & Mateo",
  description: "Seating planner for wedding and event planners.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <EmotionRegistry>
          <Provider>
            <PlanProvider>
              <AppShell>{children}</AppShell>
            </PlanProvider>
            <Toaster />
          </Provider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
```

```tsx app/page.tsx
"use client"

import { Box, Flex, Grid, Heading, Stack, Text } from "@chakra-ui/react"
import { RoomPlan } from "@/components/RoomPlan"
import { SidePanel, StatsStrip, StatusBar } from "@/components/PlanPanels"
import { EVENT, formatDate } from "@/lib/data"

export default function PlanPage() {
  return (
    <Box maxW="1800px" mx="auto" px={{ base: "3", md: "6" }} py={{ base: "4", md: "6" }}>
      <Stack gap="4">
        <Flex align="flex-end" justify="space-between" gap="3" wrap="wrap">
          <Box>
            <Heading as="h1" size={{ base: "xl", md: "2xl" }} letterSpacing="-0.02em">
              Seating plan
            </Heading>
            <Text color="fg.muted" fontSize="sm">
              {EVENT.name} · {formatDate(EVENT.date)} · {EVENT.venue}
            </Text>
          </Box>
        </Flex>
        <StatsStrip />
        <StatusBar />
        <Grid templateColumns={{ base: "minmax(0, 1fr)", xl: "minmax(0, 1fr) 420px" }} gap="4" alignItems="start">
          <RoomPlan />
          <Box position={{ xl: "sticky" }} top={{ xl: "72px" }} maxH={{ xl: "calc(100dvh - 88px)" }} overflowY={{ xl: "auto" }}>
            <SidePanel />
          </Box>
        </Grid>
      </Stack>
    </Box>
  )
}
```

```tsx components/AppShell.tsx
"use client"

import { Avatar, Box, Flex, HStack, Link as ChakraLink, Text } from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { LuLayoutGrid, LuUsers } from "react-icons/lu"
import { ColorModeButton } from "@/components/ui/color-mode"
import { APP_NAME, EVENT, PLANNER, formatDate } from "@/lib/data"

function BrandMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <rect width="28" height="28" rx="8" fill="#c2410c" />
      <circle cx="14" cy="14" r="4.2" fill="#fff" />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2
        return <circle key={i} cx={14 + Math.cos(a) * 8.2} cy={14 + Math.sin(a) * 8.2} r="1.9" fill="#fed7aa" />
      })}
    </svg>
  )
}

const NAV = [
  { href: "/", label: "Plan", icon: LuLayoutGrid },
  { href: "/guests", label: "Guests", icon: LuUsers },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <Flex direction="column" minH="100dvh" bg="bg.subtle">
      <ChakraLink
        href="#main"
        position="absolute"
        left="3"
        top="-60px"
        zIndex="popover"
        bg="bg"
        px="3"
        py="2"
        rounded="md"
        _focus={{ top: "3" }}
      >
        Skip to content
      </ChakraLink>
      <Box
        as="header"
        position="sticky"
        top="0"
        zIndex="sticky"
        bg="bg.panel"
        borderBottomWidth="1px"
        borderColor="border"
      >
        <Flex align="center" gap={{ base: "3", md: "6" }} px={{ base: "3", md: "6" }} h="14" maxW="1800px" mx="auto">
          <HStack gap="2.5" flexShrink={0}>
            <BrandMark />
            <Text fontWeight="semibold" fontSize="md" letterSpacing="-0.01em" hideBelow="sm">
              {APP_NAME}
            </Text>
          </HStack>
          <Box as="nav" aria-label="Main">
            <HStack gap="1">
              {NAV.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
                return (
                  <ChakraLink
                    key={item.href}
                    asChild
                    px="3"
                    py="1.5"
                    rounded="md"
                    fontSize="sm"
                    fontWeight="medium"
                    minH="9"
                    display="inline-flex"
                    alignItems="center"
                    gap="2"
                    bg={active ? "bg.muted" : "transparent"}
                    color={active ? "fg" : "fg.muted"}
                    _hover={{ bg: "bg.muted", textDecoration: "none", color: "fg" }}
                  >
                    <NextLink href={item.href} aria-current={active ? "page" : undefined}>
                      <item.icon aria-hidden="true" />
                      {item.label}
                    </NextLink>
                  </ChakraLink>
                )
              })}
            </HStack>
          </Box>
          <Box flex="1" minW="0" hideBelow="md" textAlign="center">
            <Text fontSize="sm" fontWeight="medium" truncate>
              {EVENT.name}
            </Text>
            <Text fontSize="xs" color="fg.muted" truncate>
              {formatDate(EVENT.date)} · {EVENT.venue}
            </Text>
          </Box>
          <Box flex="1" hideFrom="md" />
          <HStack gap="2" flexShrink={0}>
            <ColorModeButton />
            <HStack gap="2" hideBelow="sm">
              <Avatar.Root size="sm" colorPalette="orange">
                <Avatar.Fallback name={PLANNER.name} />
              </Avatar.Root>
              <Text fontSize="sm" hideBelow="lg">
                {PLANNER.name}
              </Text>
            </HStack>
          </HStack>
        </Flex>
      </Box>
      <Box as="main" id="main" flex="1" minW="0">
        {children}
      </Box>
    </Flex>
  )
}
```

```tsx components/PlanPanels.tsx
"use client"

import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
} from "@chakra-ui/react"
import * as React from "react"
import {
  LuArmchair,
  LuCircleCheck,
  LuClock,
  LuGrip,
  LuTriangleAlert,
  LuUserMinus,
  LuX,
} from "react-icons/lu"
import { usePlan } from "@/components/PlanProvider"
import {
  GUEST_BY_ID,
  GUESTS,
  PARTY_PALETTE,
  TABLE_BY_ID,
  TABLES,
  type Guest,
} from "@/lib/data"
import type { RuleResult } from "@/lib/plan"

const KIND_LABEL = { together: "Keep together", apart: "Keep apart", near: "Seat near" } as const

/* ------------------------------------------------------------------ stats */

function Stat({ label, value, hint, tone }: { label: string; value: React.ReactNode; hint?: string; tone?: "red" | "green" }) {
  return (
    <Box bg="bg.panel" borderWidth="1px" borderColor="border" rounded="xl" px="4" py="3" minW="0">
      <Text fontSize="xs" color="fg.muted" fontWeight="medium" textTransform="uppercase" letterSpacing="0.04em">
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight="semibold" lineHeight="1.2" color={tone ? `${tone}.fg` : "fg"} fontVariantNumeric="tabular-nums">
        {value}
      </Text>
      {hint && (
        <Text fontSize="xs" color="fg.muted" truncate>
          {hint}
        </Text>
      )}
    </Box>
  )
}

export function StatsStrip() {
  const { counts, brokenCount, rules } = usePlan()
  const waiting = rules.filter((r) => r.status === "pending").length
  return (
    <SimpleGrid columns={{ base: 2, md: 4 }} gap="3" aria-label="Seating counts" role="group">
      <Stat label="Seated" value={counts.seated} hint={`of ${counts.totalSeats} seats`} />
      <Stat
        label="To seat"
        value={counts.toSeat}
        hint={counts.unconfirmedUnseated ? `+ ${counts.unconfirmedUnseated} unconfirmed` : "attending, no seat"}
        tone={counts.toSeat === 0 ? "green" : undefined}
      />
      <Stat label="Free seats" value={counts.freeSeats} hint={`${counts.attending} guests attending`} />
      <Stat
        label="Couple's rules"
        value={brokenCount === 0 ? "All clear" : `${brokenCount} broken`}
        hint={waiting ? `${waiting} waiting for seats` : `${rules.length} checked`}
        tone={brokenCount === 0 ? "green" : "red"}
      />
    </SimpleGrid>
  )
}

/* ---------------------------------------------------------------- summary */

export function StatusBar() {
  const { heldGuest, assign, hold, unseat, notice, clearNotice, rules, selectTable, setPanel } = usePlan()
  const held = heldGuest ? GUEST_BY_ID[heldGuest] : null
  const broken = rules.filter((r) => r.status === "broken")
  const goTo = (r: RuleResult) => {
    const t = r.tableIds[0]
    if (t) {
      selectTable(t)
      setPanel("table")
    }
  }
  return (
    <Stack gap="2">
      <Box role="status" aria-live="polite">
        {held ? (
          <Flex
            bg="orange.subtle"
            color="orange.fg"
            borderWidth="1px"
            borderColor="orange.muted"
            rounded="lg"
            px="4"
            py="2.5"
            gap="3"
            align="center"
            wrap="wrap"
          >
            <LuGrip aria-hidden="true" />
            <Text flex="1" minW="200px" fontSize="sm">
              <b>{held.name}</b> is picked up. Tap an empty seat or a table to {assign[held.id] ? "move them" : "seat them"}, or drag them.
            </Text>
            {assign[held.id] && (
              <Button size="xs" variant="outline" colorPalette="orange" onClick={() => unseat(held.id)}>
                <LuUserMinus /> Unseat
              </Button>
            )}
            <Button size="xs" variant="solid" colorPalette="orange" onClick={() => hold(null)}>
              Cancel
            </Button>
          </Flex>
        ) : notice ? (
          <Flex
            bg={notice.tone === "warn" ? "red.subtle" : "bg.panel"}
            color={notice.tone === "warn" ? "red.fg" : "fg"}
            borderWidth="1px"
            borderColor={notice.tone === "warn" ? "red.muted" : "border"}
            rounded="lg"
            px="4"
            py="2.5"
            gap="3"
            align="center"
          >
            {notice.tone === "warn" ? <LuTriangleAlert aria-hidden="true" /> : <LuCircleCheck aria-hidden="true" />}
            <Text flex="1" fontSize="sm">
              {notice.text}
            </Text>
            <Button size="xs" variant="ghost" aria-label="Dismiss message" onClick={clearNotice}>
              <LuX />
            </Button>
          </Flex>
        ) : null}
      </Box>
      {broken.length > 0 && (
        <Box bg="red.subtle" borderWidth="1px" borderColor="red.muted" rounded="lg" px="4" py="3" role="group" aria-label="Broken rules">
          <HStack color="red.fg" gap="2" mb="1">
            <LuTriangleAlert aria-hidden="true" />
            <Text fontSize="sm" fontWeight="semibold">
              {broken.length} {broken.length === 1 ? "rule is" : "rules are"} broken
            </Text>
          </HStack>
          <Stack as="ul" gap="1" listStyleType="none" m="0" p="0">
            {broken.map((r) => (
              <Box as="li" key={r.index} fontSize="sm">
                <Button
                  variant="plain"
                  size="sm"
                  h="auto"
                  minH="8"
                  p="0"
                  textAlign="start"
                  whiteSpace="normal"
                  fontWeight="normal"
                  color="fg"
                  justifyContent="flex-start"
                  onClick={() => goTo(r)}
                  aria-label={`${r.title}: ${r.detail}. Show table`}
                >
                  <Text as="span">
                    <b>{r.title}</b> · {r.detail}
                  </Text>
                </Button>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  )
}

/* ------------------------------------------------------------------ chips */

function DietBadge({ diet }: { diet: string }) {
  return (
    <Badge size="sm" variant="subtle" colorPalette="orange" flexShrink={0}>
      {diet}
    </Badge>
  )
}

function GuestChip({ guest }: { guest: Guest }) {
  const { heldGuest, hold, setDragging, brokenGuests } = usePlan()
  const isHeld = heldGuest === guest.id
  const palette = PARTY_PALETTE[guest.party] ?? "gray"
  const flagged = brokenGuests.has(guest.id)
  const toggle = () => hold(isHeld ? null : guest.id)
  return (
    <Flex
      role="button"
      tabIndex={0}
      aria-pressed={isHeld}
      draggable
      onDragStart={(e: React.DragEvent) => {
        e.dataTransfer.setData("text/plain", guest.id)
        e.dataTransfer.effectAllowed = "move"
        setDragging(guest.id)
      }}
      onDragEnd={() => setDragging(null)}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          toggle()
        }
      }}
      align="center"
      gap="3"
      px="3"
      minH="12"
      py="1.5"
      rounded="lg"
      borderWidth="1px"
      borderColor={isHeld ? "orange.solid" : flagged ? "red.muted" : "border"}
      bg={isHeld ? "orange.subtle" : "bg.panel"}
      cursor="grab"
      userSelect="none"
      _hover={{ borderColor: "orange.solid" }}
      _focusVisible={{ outline: "3px solid", outlineColor: "orange.focusRing", outlineOffset: "2px" }}
    >
      <Box boxSize="10px" rounded="full" colorPalette={palette} bg="colorPalette.700" flexShrink={0} />
      <Box flex="1" minW="0">
        <Text fontSize="sm" fontWeight="medium" truncate>
          {guest.name}
        </Text>
        <Text fontSize="xs" color="fg.muted" truncate>
          {guest.party}
        </Text>
      </Box>
      {guest.diet && <DietBadge diet={guest.diet} />}
    </Flex>
  )
}

/* ------------------------------------------------------------------ panes */

function ToSeatPane() {
  const { assign, unseat, draggingGuest, setDragging } = usePlan()
  const [over, setOver] = React.useState(false)
  const toSeat = GUESTS.filter((g) => g.rsvp === "yes" && !assign[g.id])
  const unconfirmed = GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !assign[g.id])
  const canDropHere = !!draggingGuest && !!assign[draggingGuest]
  return (
    <Stack
      gap="5"
      onDragOver={(e) => {
        if (canDropHere) {
          e.preventDefault()
          setOver(true)
        }
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        const id = e.dataTransfer.getData("text/plain") || draggingGuest
        setDragging(null)
        if (id) unseat(id)
      }}
      outlineWidth={over ? "2px" : "0"}
      outlineStyle="dashed"
      outlineColor="orange.solid"
      outlineOffset="4px"
      rounded="lg"
    >
      <Stack gap="2">
        <Text fontSize="sm" color="fg.muted">
          Attending guests without a seat. Pick one up and tap a seat, or drag them onto the plan.
          {canDropHere ? " Drop here to unseat." : ""}
        </Text>
        {toSeat.length === 0 ? (
          <Flex align="center" gap="2" bg="green.subtle" color="green.fg" rounded="lg" px="3" py="3" fontSize="sm">
            <LuCircleCheck aria-hidden="true" /> Everyone attending has a seat.
          </Flex>
        ) : (
          <Stack as="ul" gap="2" listStyleType="none" m="0" p="0" aria-label="Attending guests without a seat">
            {toSeat.map((g) => (
              <li key={g.id}>
                <GuestChip guest={g} />
              </li>
            ))}
          </Stack>
        )}
      </Stack>
      {unconfirmed.length > 0 && (
        <Stack gap="2">
          <Heading as="h2" size="sm">
            Not confirmed yet
          </Heading>
          <Text fontSize="xs" color="fg.muted">
            Maybe or no reply. You can pencil them in.
          </Text>
          <Stack as="ul" gap="2" listStyleType="none" m="0" p="0" aria-label="Unconfirmed guests without a seat">
            {unconfirmed.map((g) => (
              <li key={g.id}>
                <GuestChip guest={g} />
              </li>
            ))}
          </Stack>
        </Stack>
      )}
    </Stack>
  )
}

function TablePane() {
  const { selectedTable, seats, counts, brokenByTable, heldGuest, hold, place, unseat } = usePlan()
  const table = selectedTable ? TABLE_BY_ID[selectedTable] : null
  if (!table) {
    return (
      <Flex direction="column" align="center" textAlign="center" gap="2" py="8" color="fg.muted">
        <LuArmchair size={28} aria-hidden="true" />
        <Text fontSize="sm" maxW="260px">
          Select a table on the plan to see who sits there and what they eat.
        </Text>
        <Stack gap="1.5" mt="2" w="full">
          {TABLES.map((t) => (
            <TableLink key={t.id} id={t.id} />
          ))}
        </Stack>
      </Flex>
    )
  }
  const row = seats[table.id] ?? []
  const broken = brokenByTable[table.id] ?? []
  const diets: Record<string, number> = {}
  for (const gid of row) {
    const d = gid ? GUEST_BY_ID[gid]?.diet : null
    if (d) diets[d] = (diets[d] ?? 0) + 1
  }
  return (
    <Stack gap="4">
      <Flex align="baseline" justify="space-between" gap="2">
        <Heading as="h2" size="md">
          {table.name}
        </Heading>
        <Text fontSize="sm" color="fg.muted" fontVariantNumeric="tabular-nums">
          {counts.perTable[table.id]} of {table.seats} seats
        </Text>
      </Flex>
      {broken.map((r) => (
        <Flex key={r.index} gap="2" bg="red.subtle" color="red.fg" rounded="md" px="3" py="2" fontSize="sm" align="flex-start">
          <Box mt="0.5">
            <LuTriangleAlert aria-hidden="true" />
          </Box>
          <Text>
            <b>{KIND_LABEL[r.rule.kind]}:</b> {r.detail}
          </Text>
        </Flex>
      ))}
      <Box>
        <Text fontSize="xs" fontWeight="medium" color="fg.muted" textTransform="uppercase" letterSpacing="0.04em" mb="1.5">
          Dietary needs at this table
        </Text>
        {Object.keys(diets).length === 0 ? (
          <Text fontSize="sm" color="fg.muted">
            None noted.
          </Text>
        ) : (
          <Flex gap="1.5" wrap="wrap">
            {Object.entries(diets).map(([d, n]) => (
              <Badge key={d} colorPalette="orange" variant="subtle" size="md">
                {n} × {d}
              </Badge>
            ))}
          </Flex>
        )}
      </Box>
      <Stack as="ol" gap="1.5" listStyleType="none" m="0" p="0" aria-label={`Seats at ${table.name}`}>
        {row.map((gid, i) => {
          const guest = gid ? GUEST_BY_ID[gid] : null
          const isHeld = !!gid && gid === heldGuest
          return (
            <Flex
              as="li"
              key={i}
              align="center"
              gap="3"
              minH="12"
              px="3"
              py="1.5"
              rounded="lg"
              borderWidth="1px"
              borderStyle={guest ? "solid" : "dashed"}
              borderColor={isHeld ? "orange.solid" : "border"}
              bg={isHeld ? "orange.subtle" : guest ? "bg.panel" : "transparent"}
            >
              <Text fontSize="xs" color="fg.muted" w="4" textAlign="end" fontVariantNumeric="tabular-nums">
                {i + 1}
              </Text>
              {guest ? (
                <>
                  <Box boxSize="10px" rounded="full" colorPalette={PARTY_PALETTE[guest.party] ?? "gray"} bg="colorPalette.solid" flexShrink={0} />
                  <Box flex="1" minW="0">
                    <Text fontSize="sm" fontWeight="medium" truncate>
                      {guest.name}
                    </Text>
                    <Text fontSize="xs" color="fg.muted" truncate>
                      {guest.party}
                    </Text>
                  </Box>
                  {guest.diet && <DietBadge diet={guest.diet} />}
                  <Button
                    size="xs"
                    variant={isHeld ? "solid" : "outline"}
                    colorPalette={isHeld ? "orange" : "gray"}
                    onClick={() => hold(isHeld ? null : guest.id)}
                    aria-label={`${isHeld ? "Put down" : "Move"} ${guest.name}`}
                    aria-pressed={isHeld}
                  >
                    {isHeld ? "Cancel" : "Move"}
                  </Button>
                  <Button size="xs" variant="ghost" onClick={() => unseat(guest.id)} aria-label={`Unseat ${guest.name}`}>
                    <LuUserMinus />
                  </Button>
                </>
              ) : (
                <>
                  <Text flex="1" fontSize="sm" color="fg.muted">
                    Empty seat
                  </Text>
                  {heldGuest && (
                    <Button size="xs" colorPalette="orange" onClick={() => place(heldGuest, table.id, i)} aria-label={`Place ${GUEST_BY_ID[heldGuest]?.name} in seat ${i + 1}`}>
                      Place here
                    </Button>
                  )}
                </>
              )}
            </Flex>
          )
        })}
      </Stack>
    </Stack>
  )
}

function TableLink({ id }: { id: string }) {
  const { counts, selectTable, brokenByTable } = usePlan()
  const t = TABLE_BY_ID[id]
  if (!t) return null
  return (
    <Button
      variant="outline"
      size="sm"
      justifyContent="space-between"
      onClick={() => selectTable(id)}
      aria-label={`${t.name}, ${counts.perTable[id]} of ${t.seats} seats${brokenByTable[id] ? ", rule broken" : ""}`}
    >
      <Text as="span">{t.name}</Text>
      <HStack gap="2">
        {brokenByTable[id] && <LuTriangleAlert color="var(--chakra-colors-red-solid)" aria-hidden="true" />}
        <Text as="span" color="fg.muted" fontVariantNumeric="tabular-nums">
          {counts.perTable[id]}/{t.seats}
        </Text>
      </HStack>
    </Button>
  )
}

function RulesPane() {
  const { rules, selectTable, setPanel } = usePlan()
  const order = { broken: 0, pending: 1, ok: 2 } as const
  const sorted = [...rules].sort((a, b) => order[a.status] - order[b.status])
  return (
    <Stack as="ul" gap="2" listStyleType="none" m="0" p="0" aria-label="Couple's rules">
      {sorted.map((r) => {
        const color = r.status === "broken" ? "red" : r.status === "ok" ? "green" : "gray"
        const Icon = r.status === "broken" ? LuTriangleAlert : r.status === "ok" ? LuCircleCheck : LuClock
        const word = r.status === "broken" ? "Broken" : r.status === "ok" ? "Kept" : "Waiting"
        const t = r.tableIds[0]
        return (
          <li key={r.index}>
            <Box
              borderWidth="1px"
              borderColor={r.status === "broken" ? "red.muted" : "border"}
              bg={r.status === "broken" ? "red.subtle" : "bg.panel"}
              rounded="lg"
              px="3"
              py="2.5"
            >
              <Flex gap="2" align="center" mb="1" wrap="wrap">
                <Badge colorPalette={color} variant="subtle" size="sm">
                  <Icon aria-hidden="true" /> {word}
                </Badge>
                <Text fontSize="xs" color="fg.muted">
                  {KIND_LABEL[r.rule.kind]}
                </Text>
              </Flex>
              <Text fontSize="sm" fontWeight="medium">
                {r.title}
              </Text>
              <Text fontSize="sm" color="fg.muted">
                {r.detail}
              </Text>
              <Text fontSize="xs" color="fg.subtle" mt="0.5">
                Note: {r.rule.note}
              </Text>
              {t && (
                <Button
                  mt="1.5"
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    selectTable(t)
                    setPanel("table")
                  }}
                >
                  Show {r.tableIds.length > 1 ? "tables" : (TABLE_BY_ID[t]?.name ?? "table")}
                </Button>
              )}
            </Box>
          </li>
        )
      })}
    </Stack>
  )
}

export function SidePanel() {
  const { panel, setPanel, counts, brokenCount, selectedTable } = usePlan()
  return (
    <Box bg="bg.panel" borderWidth="1px" borderColor="border" rounded="xl" p={{ base: "3", md: "4" }} minW="0">
      <Tabs.Root value={panel} onValueChange={(e) => setPanel(e.value as typeof panel)} variant="line" size="sm" fitted>
        <Tabs.List mb="4">
          <Tabs.Trigger value="seat">
            To seat
            <Badge size="sm" variant="subtle" colorPalette={counts.toSeat ? "orange" : "green"}>
              {counts.toSeat}
            </Badge>
          </Tabs.Trigger>
          <Tabs.Trigger value="table">
            {selectedTable ? (TABLE_BY_ID[selectedTable]?.name ?? "Table") : "Table"}
          </Tabs.Trigger>
          <Tabs.Trigger value="rules">
            Rules
            <Badge size="sm" variant="subtle" colorPalette={brokenCount ? "red" : "green"}>
              {brokenCount ? brokenCount : "ok"}
            </Badge>
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="seat" p="0">
          <ToSeatPane />
        </Tabs.Content>
        <Tabs.Content value="table" p="0">
          <TablePane />
        </Tabs.Content>
        <Tabs.Content value="rules" p="0">
          <RulesPane />
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  )
}
```

```tsx components/PlanProvider.tsx
"use client"

import * as React from "react"
import { GUEST_BY_ID, GUESTS, TABLE_BY_ID, TABLES } from "@/lib/data"
import {
  type Assignment,
  type RuleResult,
  brokenGuestIds,
  brokenTablesFor,
  evaluateRules,
  initialAssignment,
  seatMap,
} from "@/lib/plan"

export interface Notice {
  text: string
  tone: "info" | "success" | "warn"
}

export type PanelId = "seat" | "table" | "rules"

export interface PlanCounts {
  seated: number
  toSeat: number
  unconfirmedUnseated: number
  freeSeats: number
  totalSeats: number
  attending: number
  perTable: Record<string, number>
}

interface PlanContextValue {
  assign: Assignment
  seats: Record<string, (string | null)[]>
  rules: RuleResult[]
  brokenByTable: Record<string, RuleResult[]>
  brokenGuests: Set<string>
  brokenCount: number
  counts: PlanCounts
  selectedTable: string | null
  heldGuest: string | null
  draggingGuest: string | null
  notice: Notice | null
  panel: PanelId
  setPanel: (p: PanelId) => void
  selectTable: (id: string | null) => void
  hold: (id: string | null) => void
  setDragging: (id: string | null) => void
  place: (guestId: string, tableId: string, seat?: number) => void
  unseat: (guestId: string) => void
  clearNotice: () => void
}

const PlanContext = React.createContext<PlanContextValue | null>(null)

export function usePlan(): PlanContextValue {
  const ctx = React.useContext(PlanContext)
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider")
  return ctx
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [assign, setAssign] = React.useState<Assignment>(initialAssignment)
  const [selectedTable, setSelectedTable] = React.useState<string | null>(null)
  const [heldGuest, setHeldGuest] = React.useState<string | null>(null)
  const [draggingGuest, setDraggingGuest] = React.useState<string | null>(null)
  const [notice, setNotice] = React.useState<Notice | null>(null)
  const [panel, setPanel] = React.useState<PanelId>("seat")

  const seats = React.useMemo(() => seatMap(assign), [assign])
  const rules = React.useMemo(() => evaluateRules(assign), [assign])
  const brokenByTable = React.useMemo(() => brokenTablesFor(rules), [rules])
  const brokenGuests = React.useMemo(() => brokenGuestIds(rules), [rules])
  const brokenCount = React.useMemo(() => rules.filter((r) => r.status === "broken").length, [rules])

  const counts = React.useMemo<PlanCounts>(() => {
    const perTable: Record<string, number> = {}
    for (const t of TABLES) perTable[t.id] = 0
    let seated = 0
    let toSeat = 0
    let unconfirmedUnseated = 0
    for (const g of GUESTS) {
      const ref = assign[g.id]
      if (ref) {
        seated += 1
        perTable[ref.table] = (perTable[ref.table] ?? 0) + 1
      } else if (g.rsvp === "yes") toSeat += 1
      else if (g.rsvp === "maybe" || g.rsvp === "pending") unconfirmedUnseated += 1
    }
    const totalSeats = TABLES.reduce((n, t) => n + t.seats, 0)
    return {
      seated,
      toSeat,
      unconfirmedUnseated,
      freeSeats: totalSeats - seated,
      totalSeats,
      attending: GUESTS.filter((g) => g.rsvp === "yes").length,
      perTable,
    }
  }, [assign])

  const selectTable = React.useCallback((id: string | null) => setSelectedTable(id), [])
  const hold = React.useCallback((id: string | null) => {
    setHeldGuest(id)
    setNotice(null)
  }, [])
  const clearNotice = React.useCallback(() => setNotice(null), [])

  const commit = React.useCallback(
    (next: Assignment, message: string) => {
      const before = evaluateRules(assign)
      const after = evaluateRules(next)
      const newlyBroken = after.filter((r, i) => r.status === "broken" && before[i]?.status !== "broken")
      const fixed = after.filter((r, i) => r.status !== "broken" && before[i]?.status === "broken")
      let text = message
      let tone: Notice["tone"] = "success"
      if (newlyBroken.length) {
        text += `. Breaks a rule: ${newlyBroken.map((r) => r.title).join("; ")}`
        tone = "warn"
      } else if (fixed.length) {
        text += `. Rule resolved: ${fixed.map((r) => r.title).join("; ")}`
      }
      setAssign(next)
      setNotice({ text, tone })
    },
    [assign],
  )

  const place = React.useCallback(
    (guestId: string, tableId: string, seat?: number) => {
      const guest = GUEST_BY_ID[guestId]
      const table = TABLE_BY_ID[tableId]
      const row = seats[tableId]
      if (!guest || !table || !row) return
      let idx = seat
      if (idx === undefined) {
        const existing = assign[guestId]
        if (existing && existing.table === tableId) {
          setHeldGuest(null)
          return
        }
        idx = row.findIndex((x) => x === null)
        if (idx < 0) {
          setNotice({ text: `${table.name} is full. Pick another table or free a seat`, tone: "warn" })
          return
        }
      }
      const occupant = row[idx] ?? null
      if (occupant === guestId) {
        setHeldGuest(null)
        return
      }
      const prev = assign[guestId] ?? null
      const next: Assignment = { ...assign, [guestId]: { table: tableId, seat: idx } }
      let message: string
      if (occupant) {
        const other = GUEST_BY_ID[occupant]?.name ?? occupant
        next[occupant] = prev ? { ...prev } : null
        message = prev
          ? `${guest.name} and ${other} swapped seats`
          : `${guest.name} took seat ${idx + 1} at ${table.name}; ${other} is unseated`
      } else if (prev) {
        message = `${guest.name} moved from ${TABLE_BY_ID[prev.table]?.name} to ${table.name}, seat ${idx + 1}`
      } else {
        message = `${guest.name} seated at ${table.name}, seat ${idx + 1}`
      }
      commit(next, message)
      setHeldGuest(null)
      setSelectedTable(tableId)
    },
    [assign, seats, commit],
  )

  const unseat = React.useCallback(
    (guestId: string) => {
      const guest = GUEST_BY_ID[guestId]
      const prev = assign[guestId]
      if (!guest || !prev) return
      commit({ ...assign, [guestId]: null }, `${guest.name} unseated from ${TABLE_BY_ID[prev.table]?.name}`)
      setHeldGuest(null)
    },
    [assign, commit],
  )

  const value = React.useMemo<PlanContextValue>(
    () => ({
      assign,
      seats,
      rules,
      brokenByTable,
      brokenGuests,
      brokenCount,
      counts,
      selectedTable,
      heldGuest,
      draggingGuest,
      notice,
      panel,
      setPanel,
      selectTable,
      hold,
      setDragging: setDraggingGuest,
      place,
      unseat,
      clearNotice,
    }),
    [
      assign,
      seats,
      rules,
      brokenByTable,
      brokenGuests,
      brokenCount,
      counts,
      selectedTable,
      heldGuest,
      draggingGuest,
      notice,
      panel,
      selectTable,
      hold,
      place,
      unseat,
      clearNotice,
    ],
  )

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>
}
```

```tsx components/RoomPlan.tsx
"use client"

import { Box, Flex, HStack, Text, VisuallyHidden } from "@chakra-ui/react"
import * as React from "react"
import { LuTriangleAlert } from "react-icons/lu"
import { usePlan } from "@/components/PlanProvider"
import {
  EVENT,
  FIXTURES,
  GUEST_BY_ID,
  PARTIES,
  PARTY_PALETTE,
  TABLES,
  initials,
  type Fixture,
  type TableDef,
} from "@/lib/data"

const W = EVENT.room.width
const D = EVENT.room.depth
const pctX = (m: number) => `${(m / W) * 100}%`
const pctY = (m: number) => `${(m / D) * 100}%`

const SEAT_D = 0.95
const ROUND_BOX = 3.7
const ROUND_R = 1.35
const ROUND_TABLE = 1.9
const LONG_W = 5
const LONG_H = 2.6

function seatPosition(table: TableDef, i: number): { left: string; top: string; size: string } {
  if (table.shape === "round") {
    const a = (i / table.seats) * Math.PI * 2 - Math.PI / 2
    return {
      left: `${50 + ((Math.cos(a) * ROUND_R) / ROUND_BOX) * 100}%`,
      top: `${50 + ((Math.sin(a) * ROUND_R) / ROUND_BOX) * 100}%`,
      size: `${(SEAT_D / ROUND_BOX) * 100}%`,
    }
  }
  const perSide = table.seats / 2
  const row = i < perSide ? 0 : 1
  const col = i % perSide
  const pitch = 1.15
  const cx = LONG_W / 2 + (col - (perSide - 1) / 2) * pitch
  const cy = LONG_H / 2 + (row === 0 ? -0.9 : 0.9)
  return {
    left: `${(cx / LONG_W) * 100}%`,
    top: `${(cy / LONG_H) * 100}%`,
    size: `${(0.8 / LONG_W) * 100}%`,
  }
}

function FixtureView({ f }: { f: Fixture }) {
  const common = {
    position: "absolute" as const,
    left: pctX(f.x),
    top: pctY(f.y),
    width: pctX(f.w),
    height: pctY(f.h),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "xs",
    fontWeight: "medium",
    textAlign: "center" as const,
    lineHeight: "1.2",
  }
  if (f.kind === "stage") {
    return (
      <Box {...common} bg="gray.solid" color="gray.contrast" roundedBottom="md" role="img" aria-label={f.label}>
        {f.label}
      </Box>
    )
  }
  if (f.kind === "dancefloor") {
    return (
      <Box
        {...common}
        borderWidth="1px"
        borderStyle="dashed"
        borderColor="orange.muted"
        color="orange.fg"
        rounded="md"
        css={{
          backgroundColor: "var(--chakra-colors-orange-subtle)",
          backgroundImage:
            "conic-gradient(var(--chakra-colors-orange-muted) 25%, transparent 0 50%, var(--chakra-colors-orange-muted) 0 75%, transparent 0)",
          backgroundSize: "28px 28px",
        }}
        role="img"
        aria-label={f.label}
      >
        <Text as="span" bg="orange.subtle" px="2" py="0.5" rounded="sm">
          {f.label}
        </Text>
      </Box>
    )
  }
  if (f.kind === "bar") {
    return (
      <Box {...common} bg="blue.subtle" color="blue.fg" borderWidth="1px" borderColor="blue.muted" rounded="md" role="img" aria-label={f.label}>
        {f.label}
      </Box>
    )
  }
  return (
    <Box
      {...common}
      bg="green.subtle"
      borderLeftWidth="4px"
      borderColor="green.solid"
      color="green.fg"
      overflow="visible"
      role="img"
      aria-label={f.label}
    >
      <Text as="span" fontSize="10px" whiteSpace="nowrap" css={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
        {f.label}
      </Text>
    </Box>
  )
}

export function RoomPlan() {
  const plan = usePlan()
  const [over, setOver] = React.useState<string | null>(null)
  const { heldGuest, hold, selectedTable, selectTable, place, setDragging, draggingGuest } = plan

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hold(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [hold])

  const activate = (e: React.KeyboardEvent, fn: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      fn()
    }
  }

  const readDrag = (e: React.DragEvent): string | null => e.dataTransfer.getData("text/plain") || draggingGuest

  const onSeatClick = (table: TableDef, seat: number) => {
    const occupant = plan.seats[table.id]?.[seat] ?? null
    if (heldGuest) {
      if (occupant === heldGuest) hold(null)
      else place(heldGuest, table.id, seat)
      return
    }
    selectTable(table.id)
    plan.setPanel("table")
    if (occupant) hold(occupant)
  }

  const onTableClick = (table: TableDef) => {
    if (heldGuest) {
      place(heldGuest, table.id)
      return
    }
    selectTable(selectedTable === table.id ? null : table.id)
    plan.setPanel("table")
  }

  return (
    <Box>
      <Box overflowX="auto" rounded="xl" borderWidth="1px" borderColor="border" bg="bg.panel" p={{ base: "2", md: "3" }}>
        <Box
          position="relative"
          minW="620px"
          w="full"
          aspectRatio={W / D}
          rounded="lg"
          bg="bg.muted"
          borderWidth="2px"
          borderColor="border.emphasized"
          role="group"
          aria-label={`Floor plan of ${EVENT.venue}, ${W} by ${D} metres`}
          css={{
            backgroundImage:
              "linear-gradient(to right, var(--chakra-colors-border-muted) 1px, transparent 1px), linear-gradient(to bottom, var(--chakra-colors-border-muted) 1px, transparent 1px)",
            backgroundSize: `${100 / W}% ${100 / D}%`,
          }}
        >
          {FIXTURES.map((f) => (
            <FixtureView key={f.id} f={f} />
          ))}

          {TABLES.map((table) => {
            const row = plan.seats[table.id] ?? []
            const count = plan.counts.perTable[table.id] ?? 0
            const broken = plan.brokenByTable[table.id]
            const isSelected = selectedTable === table.id
            const round = table.shape === "round"
            const tableOver = over === table.id
            const label = `${table.name} ${count}/${table.seats}, ${count} of ${table.seats} seats filled${broken ? ", a seating rule is broken here" : ""}`
            return (
              <Box
                key={table.id}
                position="absolute"
                left={pctX(table.x)}
                top={pctY(table.y)}
                width={pctX(round ? ROUND_BOX : LONG_W)}
                aspectRatio={round ? 1 : LONG_W / LONG_H}
                transform={`translate(-50%, -50%)${table.rotation ? ` rotate(${table.rotation}deg)` : ""}`}
                rounded={round ? "full" : "xl"}
                bg={isSelected ? "orange.subtle" : "transparent"}
                outlineWidth={isSelected || broken ? "2px" : "0"}
                outlineStyle="solid"
                outlineColor={broken ? "red.solid" : "orange.solid"}
                outlineOffset="1px"
                transition="background 0.15s"
              >
                {/* table top */}
                <Flex
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onClick={() => onTableClick(table)}
                  onKeyDown={(e) => activate(e, () => onTableClick(table))}
                  onDragOver={(e) => {
                    if (draggingGuest) {
                      e.preventDefault()
                      setOver(table.id)
                    }
                  }}
                  onDragLeave={() => setOver((o) => (o === table.id ? null : o))}
                  onDrop={(e) => {
                    e.preventDefault()
                    const id = readDrag(e)
                    setOver(null)
                    setDragging(null)
                    if (id) place(id, table.id)
                  }}
                  position="absolute"
                  left="50%"
                  top="50%"
                  width={round ? `${(ROUND_TABLE / ROUND_BOX) * 100}%` : "88%"}
                  height={round ? undefined : "34%"}
                  aspectRatio={round ? 1 : undefined}
                  transform="translate(-50%, -50%)"
                  rounded={round ? "full" : "lg"}
                  bg="bg.panel"
                  borderWidth="2px"
                  borderColor={tableOver ? "orange.solid" : "border.emphasized"}
                  boxShadow="sm"
                  direction="column"
                  align="center"
                  justify="center"
                  cursor="pointer"
                  lineHeight="1.15"
                  _hover={{ borderColor: "orange.solid" }}
                  _focusVisible={{ outline: "3px solid", outlineColor: "orange.focusRing", outlineOffset: "2px" }}
                >
                  <Text fontSize="11px" fontWeight="semibold" textAlign="center">
                    {table.name}
                  </Text>
                  <Text fontSize="10px" color={count >= table.seats ? "green.fg" : "fg.muted"} fontVariantNumeric="tabular-nums">
                    {count}/{table.seats}
                  </Text>
                  <VisuallyHidden>{label}</VisuallyHidden>
                </Flex>
                {broken && (
                  <Flex
                    position="absolute"
                    right="-4px"
                    top="-4px"
                    boxSize="20px"
                    rounded="full"
                    bg="red.solid"
                    color="red.contrast"
                    align="center"
                    justify="center"
                    pointerEvents="none"
                    zIndex="1"
                  >
                    <LuTriangleAlert size={12} aria-hidden="true" />
                  </Flex>
                )}

                {/* seats */}
                {row.map((gid, i) => {
                  const pos = seatPosition(table, i)
                  const guest = gid ? GUEST_BY_ID[gid] : null
                  const key = `${table.id}:${i}`
                  const isHeld = !!gid && gid === heldGuest
                  const isBroken = !!gid && plan.brokenGuests.has(gid) && !!broken
                  const isOver = over === key
                  const palette = guest ? (PARTY_PALETTE[guest.party] ?? "gray") : "gray"
                  const seatLabel = guest
                    ? `${table.name}, seat ${i + 1}: ${guest.name}, ${guest.party}${guest.diet ? `, ${guest.diet}` : ""}${isBroken ? ", seating rule broken" : ""}${isHeld ? ", picked up" : ""}`
                    : `${table.name}, seat ${i + 1}: empty${heldGuest ? `, place ${GUEST_BY_ID[heldGuest]?.name} here` : ""}`
                  return (
                    <Flex
                      key={key}
                      role="button"
                      tabIndex={0}
                      aria-label={seatLabel}
                      title={guest ? `${guest.name}${guest.diet ? ` (${guest.diet})` : ""}` : `Seat ${i + 1}: empty`}
                      data-initials={guest ? initials(guest.name) : ""}
                      css={{ "&::before": { content: "attr(data-initials)" } }}
                      draggable={!!guest}
                      colorPalette={palette}
                      onClick={() => onSeatClick(table, i)}
                      onKeyDown={(e) => activate(e, () => onSeatClick(table, i))}
                      onDragStart={(e: React.DragEvent) => {
                        if (!gid) return
                        e.dataTransfer.setData("text/plain", gid)
                        e.dataTransfer.effectAllowed = "move"
                        setDragging(gid)
                      }}
                      onDragEnd={() => {
                        setDragging(null)
                        setOver(null)
                      }}
                      onDragOver={(e: React.DragEvent) => {
                        if (draggingGuest) {
                          e.preventDefault()
                          e.stopPropagation()
                          setOver(key)
                        }
                      }}
                      onDragLeave={() => setOver((o) => (o === key ? null : o))}
                      onDrop={(e: React.DragEvent) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const id = readDrag(e)
                        setOver(null)
                        setDragging(null)
                        if (id) place(id, table.id, i)
                      }}
                      position="absolute"
                      left={pos.left}
                      top={pos.top}
                      width={pos.size}
                      aspectRatio={1}
                      transform="translate(-50%, -50%)"
                      rounded="full"
                      align="center"
                      justify="center"
                      fontSize="10px"
                      fontWeight="semibold"
                      cursor={guest ? "grab" : "pointer"}
                      userSelect="none"
                      bg={guest ? "colorPalette.700" : isOver ? "orange.subtle" : "bg.panel"}
                      color={guest ? "white" : "fg.subtle"}
                      borderWidth={guest ? "2px" : "1.5px"}
                      borderStyle={guest ? "solid" : "dashed"}
                      borderColor={isOver ? "orange.solid" : isBroken ? "red.solid" : guest ? "bg.panel" : heldGuest ? "orange.solid" : "border.emphasized"}
                      outlineWidth={isHeld || isBroken ? "2px" : "0"}
                      outlineStyle="solid"
                      outlineColor={isHeld ? "orange.solid" : "red.solid"}
                      outlineOffset="1px"
                      boxShadow={isHeld ? "lg" : undefined}
                      zIndex={isHeld ? 2 : 0}
                      _hover={{ borderColor: "orange.solid" }}
                      _focusVisible={{ outline: "3px solid", outlineColor: "orange.focusRing", outlineOffset: "2px" }}
                    >
                      {guest?.diet && (
                        <Box
                          position="absolute"
                          right="-2px"
                          top="-2px"
                          boxSize="9px"
                          rounded="full"
                          bg="bg.panel"
                          borderWidth="2px"
                          borderColor="fg"
                          pointerEvents="none"
                          aria-hidden="true"
                        />
                      )}
                    </Flex>
                  )
                })}
              </Box>
            )
          })}
        </Box>
      </Box>

      <Flex mt="3" wrap="wrap" columnGap="4" rowGap="2" align="center" fontSize="xs" color="fg.muted" aria-label="Legend" role="group">
        {PARTIES.map((p) => (
          <HStack key={p} gap="1.5">
            <Box boxSize="10px" rounded="full" colorPalette={PARTY_PALETTE[p]} bg="colorPalette.solid" />
            <Text as="span">{p}</Text>
          </HStack>
        ))}
        <HStack gap="1.5">
          <Box boxSize="10px" rounded="full" bg="bg.panel" borderWidth="2px" borderColor="fg" />
          <Text as="span">Dietary need</Text>
        </HStack>
        <HStack gap="1.5">
          <Box boxSize="10px" rounded="full" borderWidth="1.5px" borderStyle="dashed" borderColor="border.emphasized" />
          <Text as="span">Empty seat</Text>
        </HStack>
        <Text as="span" ms={{ md: "auto" }}>
          Grid squares are 1 m · room {W} × {D} m
        </Text>
      </Flex>
    </Box>
  )
}
```

```ts lib/data.ts
export type Rsvp = "yes" | "no" | "maybe" | "pending"

export interface Guest {
  id: string
  name: string
  party: string
  rsvp: Rsvp
  diet: string | null
  table: string | null
}

export type FixtureKind = "stage" | "dancefloor" | "bar" | "door"

export interface Fixture {
  id: string
  kind: FixtureKind
  label: string
  x: number
  y: number
  w: number
  h: number
}

export interface TableDef {
  id: string
  name: string
  shape: "round" | "long"
  seats: number
  x: number
  y: number
  rotation?: number
}

export interface Rule {
  kind: "together" | "apart" | "near"
  guests: string[]
  note: string
  /** near rules: fixture to be close to, and one to stay away from */
  nearFixture?: string
  awayFixture?: string
}

export const APP_NAME = "Seatwise"

export const EVENT = {
  name: "Ines & Mateo's wedding dinner",
  date: "2027-06-19",
  venue: "The Orangery, Hollin Hall",
  room: { width: 24, depth: 14 },
}

export const PLANNER = { name: "Hannah Brook" }

export const FIXTURES: Fixture[] = [
  { id: "f-1", kind: "stage", label: "Band", x: 10, y: 0.5, w: 4, h: 2 },
  { id: "f-2", kind: "dancefloor", label: "Dance floor", x: 8.5, y: 3, w: 7, h: 4 },
  { id: "f-3", kind: "bar", label: "Bar", x: 21, y: 10, w: 2.5, h: 3.5 },
  { id: "f-4", kind: "door", label: "Garden doors", x: 0, y: 6, w: 0.5, h: 2.5 },
]

export const TABLES: TableDef[] = [
  { id: "t-head", name: "Top table", shape: "long", seats: 8, x: 8, y: 8.2, rotation: 0 },
  { id: "t-1", name: "Table 1", shape: "round", seats: 8, x: 3, y: 2.5 },
  { id: "t-2", name: "Table 2", shape: "round", seats: 8, x: 3, y: 7 },
  { id: "t-3", name: "Table 3", shape: "round", seats: 8, x: 3, y: 11.5 },
  { id: "t-4", name: "Table 4", shape: "round", seats: 8, x: 19, y: 2.5 },
  { id: "t-5", name: "Table 5", shape: "round", seats: 8, x: 19, y: 7 },
  { id: "t-6", name: "Table 6", shape: "round", seats: 6, x: 12, y: 12 },
]

export const GUESTS: Guest[] = [
  { id: "g-01", name: "Ines Carvalho", party: "Couple", rsvp: "yes", diet: null, table: "t-head" },
  { id: "g-02", name: "Mateo Alvarez", party: "Couple", rsvp: "yes", diet: "Vegetarian", table: "t-head" },
  { id: "g-03", name: "Rui Carvalho", party: "Bride's family", rsvp: "yes", diet: null, table: "t-head" },
  { id: "g-04", name: "Marta Carvalho", party: "Bride's family", rsvp: "yes", diet: "Gluten free", table: "t-head" },
  { id: "g-05", name: "Javier Alvarez", party: "Groom's family", rsvp: "yes", diet: null, table: "t-head" },
  { id: "g-06", name: "Lucia Alvarez", party: "Groom's family", rsvp: "yes", diet: null, table: "t-head" },
  { id: "g-07", name: "Sofia Carvalho", party: "Bride's family", rsvp: "yes", diet: null, table: "t-1" },
  { id: "g-08", name: "Tiago Carvalho", party: "Bride's family", rsvp: "yes", diet: null, table: "t-1" },
  { id: "g-09", name: "Avó Rosa Carvalho", party: "Bride's family", rsvp: "yes", diet: "Soft food", table: "t-1" },
  { id: "g-10", name: "Pedro Nunes", party: "Bride's family", rsvp: "yes", diet: null, table: "t-1" },
  { id: "g-11", name: "Ana Nunes", party: "Bride's family", rsvp: "yes", diet: "Vegan", table: "t-1" },
  { id: "g-12", name: "Carmen Alvarez", party: "Groom's family", rsvp: "yes", diet: null, table: "t-4" },
  { id: "g-13", name: "Diego Alvarez", party: "Groom's family", rsvp: "yes", diet: null, table: "t-4" },
  { id: "g-14", name: "Elena Ruiz", party: "Groom's family", rsvp: "yes", diet: "Nut allergy", table: "t-4" },
  { id: "g-15", name: "Pablo Ruiz", party: "Groom's family", rsvp: "yes", diet: null, table: "t-4" },
  { id: "g-16", name: "Isabel Ruiz", party: "Groom's family", rsvp: "maybe", diet: null, table: null },
  { id: "g-17", name: "Chloe Martin", party: "University friends", rsvp: "yes", diet: null, table: "t-2" },
  { id: "g-18", name: "Ben Okafor", party: "University friends", rsvp: "yes", diet: null, table: "t-2" },
  { id: "g-19", name: "Leila Haddad", party: "University friends", rsvp: "yes", diet: "Halal", table: "t-2" },
  { id: "g-20", name: "Omar Haddad", party: "University friends", rsvp: "yes", diet: "Halal", table: "t-2" },
  { id: "g-21", name: "Freya Lund", party: "University friends", rsvp: "yes", diet: "Vegetarian", table: null },
  { id: "g-22", name: "Jonas Lund", party: "University friends", rsvp: "yes", diet: null, table: null },
  { id: "g-23", name: "Grace Lee", party: "Work friends", rsvp: "yes", diet: null, table: "t-5" },
  { id: "g-24", name: "Marcus Webb", party: "Work friends", rsvp: "yes", diet: null, table: "t-5" },
  { id: "g-25", name: "Nadia Petrova", party: "Work friends", rsvp: "yes", diet: "Pescatarian", table: "t-5" },
  { id: "g-26", name: "Tom Fisher", party: "Work friends", rsvp: "no", diet: null, table: null },
  { id: "g-27", name: "Hana Sato", party: "Work friends", rsvp: "yes", diet: null, table: null },
  { id: "g-28", name: "Luis Ortega", party: "Groom's football club", rsvp: "yes", diet: null, table: "t-3" },
  { id: "g-29", name: "Kai Brennan", party: "Groom's football club", rsvp: "yes", diet: null, table: "t-3" },
  { id: "g-30", name: "Sean Doyle", party: "Groom's football club", rsvp: "yes", diet: null, table: "t-3" },
  { id: "g-31", name: "Ryan Doyle", party: "Groom's football club", rsvp: "yes", diet: null, table: null },
  { id: "g-32", name: "Hugo Carvalho", party: "Bride's family", rsvp: "yes", diet: "Children's menu", table: "t-1" },
  { id: "g-33", name: "Mia Carvalho", party: "Bride's family", rsvp: "yes", diet: "Children's menu", table: null },
  { id: "g-34", name: "Paula Mendes", party: "Bride's family", rsvp: "pending", diet: null, table: null },
  { id: "g-35", name: "Victor Mendes", party: "Bride's family", rsvp: "pending", diet: null, table: null },
  { id: "g-36", name: "Zoe Bennett", party: "Plus-ones", rsvp: "yes", diet: null, table: "t-2" },
  { id: "g-37", name: "Arjun Mehta", party: "Plus-ones", rsvp: "yes", diet: "Vegetarian", table: "t-5" },
  { id: "g-38", name: "Laura Svensson", party: "Plus-ones", rsvp: "yes", diet: null, table: null },
]

export const RULES: Rule[] = [
  { kind: "together", guests: ["g-21", "g-22"], note: "Couple" },
  { kind: "together", guests: ["g-32", "g-33"], note: "Siblings, under 10" },
  { kind: "apart", guests: ["g-29", "g-30"], note: "Brothers Sean and Ryan Doyle are not speaking" },
  { kind: "apart", guests: ["g-12", "g-34"], note: "Ask the couple: old family dispute" },
  {
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
    nearFixture: "f-4",
    awayFixture: "f-1",
  },
]

export const PARTIES = [
  "Couple",
  "Bride's family",
  "Groom's family",
  "University friends",
  "Work friends",
  "Groom's football club",
  "Plus-ones",
]

export const PARTY_PALETTE: Record<string, string> = {
  Couple: "pink",
  "Bride's family": "purple",
  "Groom's family": "blue",
  "University friends": "teal",
  "Work friends": "cyan",
  "Groom's football club": "green",
  "Plus-ones": "yellow",
}

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "No reply",
  no: "Declined",
}

export const RSVP_PALETTE: Record<Rsvp, string> = {
  yes: "green",
  maybe: "orange",
  pending: "gray",
  no: "red",
}

export const STANDARD_MEAL = "Standard menu"

export const GUEST_BY_ID: Record<string, Guest> = Object.fromEntries(
  GUESTS.map((g) => [g.id, g]),
)
export const TABLE_BY_ID: Record<string, TableDef> = Object.fromEntries(
  TABLES.map((t) => [t.id, t]),
)
export const FIXTURE_BY_ID: Record<string, Fixture> = Object.fromEntries(
  FIXTURES.map((f) => [f.id, f]),
)

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts[parts.length === 3 && parts[0] === "Avó" ? 1 : parts.length - 1]?.[0] ?? "") : ""
  return (first + last).toUpperCase()
}

export function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`)
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
}
```

```ts lib/plan.ts
import {
  FIXTURE_BY_ID,
  GUEST_BY_ID,
  GUESTS,
  RULES,
  TABLE_BY_ID,
  TABLES,
  type Rule,
} from "./data"

export interface SeatRef {
  table: string
  seat: number
}

/** guest id -> seat, or null when unseated */
export type Assignment = Record<string, SeatRef | null>

export function initialAssignment(): Assignment {
  const next: Assignment = {}
  const used: Record<string, number> = {}
  for (const g of GUESTS) {
    if (g.table) {
      const n = used[g.table] ?? 0
      used[g.table] = n + 1
      next[g.id] = { table: g.table, seat: n }
    } else {
      next[g.id] = null
    }
  }
  return next
}

/** table id -> array indexed by seat holding a guest id or null */
export function seatMap(a: Assignment): Record<string, (string | null)[]> {
  const map: Record<string, (string | null)[]> = {}
  for (const t of TABLES) map[t.id] = Array.from({ length: t.seats }, () => null)
  for (const [gid, ref] of Object.entries(a)) {
    if (ref) {
      const row = map[ref.table]
      if (row) row[ref.seat] = gid
    }
  }
  return map
}

export function tableCentre(tableId: string): { x: number; y: number } {
  const t = TABLE_BY_ID[tableId]
  return { x: t?.x ?? 0, y: t?.y ?? 0 }
}

export function fixtureCentre(fixtureId: string): { x: number; y: number } {
  const f = FIXTURE_BY_ID[fixtureId]
  return f ? { x: f.x + f.w / 2, y: f.y + f.h / 2 } : { x: 0, y: 0 }
}

export function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export const NEAR_MAX_M = 4.5
export const AWAY_MIN_M = 6

export type RuleStatus = "ok" | "broken" | "pending"

export interface RuleResult {
  index: number
  rule: Rule
  status: RuleStatus
  title: string
  detail: string
  tableIds: string[]
  guestIds: string[]
}

const first = (id: string) => (GUEST_BY_ID[id]?.name ?? id).split(" ")[0] ?? id
const full = (id: string) => GUEST_BY_ID[id]?.name ?? id
const tname = (id: string) => TABLE_BY_ID[id]?.name ?? id
const m = (n: number) => `${n.toFixed(1)} m`

export function evaluateRules(a: Assignment): RuleResult[] {
  return RULES.map((rule, index): RuleResult => {
    const seats = rule.guests.map((id) => a[id] ?? null)
    const seatedIds = rule.guests.filter((id) => a[id])
    const tableIds = Array.from(new Set(seats.filter(Boolean).map((s) => (s as SeatRef).table)))
    const base = { index, rule, tableIds, guestIds: rule.guests }

    if (rule.kind === "together") {
      const [g1, g2] = rule.guests as [string, string]
      if (seats[0] && seats[1]) {
        if (seats[0].table === seats[1].table) {
          return { ...base, status: "ok", title: `${full(g1)} and ${full(g2)}`, detail: `Together at ${tname(seats[0].table)}` }
        }
        return {
          ...base,
          status: "broken",
          title: `${full(g1)} and ${full(g2)}`,
          detail: `Split: ${first(g1)} at ${tname(seats[0].table)}, ${first(g2)} at ${tname(seats[1].table)}`,
        }
      }
      if (seats[0] || seats[1]) {
        const placed = seats[0] ? g1 : g2
        const waiting = seats[0] ? g2 : g1
        const at = (seats[0] ?? seats[1]) as SeatRef
        return {
          ...base,
          status: "pending",
          title: `${full(g1)} and ${full(g2)}`,
          detail: `${first(placed)} is at ${tname(at.table)}; seat ${first(waiting)} there too`,
        }
      }
      return { ...base, status: "pending", title: `${full(g1)} and ${full(g2)}`, detail: "Neither is seated yet" }
    }

    if (rule.kind === "apart") {
      const [g1, g2] = rule.guests as [string, string]
      if (seats[0] && seats[1] && seats[0].table === seats[1].table) {
        return {
          ...base,
          status: "broken",
          title: `${full(g1)} and ${full(g2)}`,
          detail: `Both at ${tname(seats[0].table)}; move one of them`,
        }
      }
      if (seats[0] && seats[1]) {
        return { ...base, status: "ok", title: `${full(g1)} and ${full(g2)}`, detail: `Apart: ${tname(seats[0].table)} and ${tname(seats[1].table)}` }
      }
      return {
        ...base,
        status: "ok",
        title: `${full(g1)} and ${full(g2)}`,
        detail: seatedIds.length ? "Apart so far; the other is not seated" : "Apart so far; neither is seated",
      }
    }

    // near
    const gid = rule.guests[0] as string
    const seat = a[gid]
    const target = rule.nearFixture ?? "f-4"
    const away = rule.awayFixture ?? "f-1"
    const targetLabel = (FIXTURE_BY_ID[target]?.label ?? "the doors").toLowerCase()
    const awayLabel = (FIXTURE_BY_ID[away]?.label ?? "the band").toLowerCase()
    if (!seat) {
      return { ...base, status: "pending", title: `${full(gid)} near the ${targetLabel}`, detail: "Not seated yet" }
    }
    const c = tableCentre(seat.table)
    const dNear = distance(c, fixtureCentre(target))
    const dAway = distance(c, fixtureCentre(away))
    if (dNear <= NEAR_MAX_M && dAway >= AWAY_MIN_M) {
      return {
        ...base,
        status: "ok",
        title: `${full(gid)} near the ${targetLabel}`,
        detail: `${tname(seat.table)} is ${m(dNear)} from the ${targetLabel}, ${m(dAway)} from the ${awayLabel}`,
      }
    }
    const better = TABLES.filter((t) => {
      const tc = { x: t.x, y: t.y }
      return distance(tc, fixtureCentre(target)) <= NEAR_MAX_M && distance(tc, fixtureCentre(away)) >= AWAY_MIN_M
    }).map((t) => t.name)
    const why =
      dNear > NEAR_MAX_M
        ? `${tname(seat.table)} is ${m(dNear)} from the ${targetLabel}`
        : `${tname(seat.table)} is only ${m(dAway)} from the ${awayLabel}`
    return {
      ...base,
      status: "broken",
      title: `${full(gid)} near the ${targetLabel}`,
      detail: better.length ? `${why}. Try ${better.join(" or ")}` : why,
    }
  })
}

export function brokenTablesFor(results: RuleResult[]): Record<string, RuleResult[]> {
  const out: Record<string, RuleResult[]> = {}
  for (const r of results) {
    if (r.status !== "broken") continue
    for (const t of r.tableIds) (out[t] ??= []).push(r)
  }
  return out
}

export function brokenGuestIds(results: RuleResult[]): Set<string> {
  const s = new Set<string>()
  for (const r of results) {
    if (r.status !== "broken") continue
    if (r.rule.kind === "near") r.guestIds.forEach((g) => s.add(g))
    else {
      // only the seated guests share the problem
      r.guestIds.forEach((g) => s.add(g))
    }
  }
  return s
}
```

