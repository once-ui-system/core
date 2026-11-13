```tsx app/guests/page.tsx
import type { Metadata } from "next"
import { GuestsView } from "@/components/guests/GuestsView"

export const metadata: Metadata = { title: "Guests: Seatwise" }

export default function Page() {
  return <GuestsView />
}
```

```tsx app/layout.tsx
import type { Metadata, Viewport } from "next"
import { AppShell } from "@/components/AppShell"
import { PlanProvider } from "@/components/plan/store"
import { EmotionRegistry } from "@/components/ui/emotion-registry"
import { Provider } from "@/components/ui/provider"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Seatwise: seating plan for Ines & Mateo's wedding dinner",
  description:
    "Seatwise is a seating planner for wedding and event planners: build the room, seat guests, keep the couple's rules and hand the result to the venue and caterer.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

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
  )
}
```

```tsx app/page.tsx
import { PlanView } from "@/components/plan/PlanView"

export default function Page() {
  return <PlanView />
}
```

```tsx components/AppShell.tsx
"use client"

import { Box, Flex, HStack, Text, chakra } from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import { LuArmchair, LuLayoutDashboard, LuUsers } from "react-icons/lu"
import { ColorModeButton } from "@/components/ui/color-mode"
import { APP_NAME, EVENT, PLANNER, formatEventDate, initials } from "@/lib/data"

const NAV = [
  { href: "/", label: "Plan", icon: LuLayoutDashboard },
  { href: "/guests", label: "Guests", icon: LuUsers },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <Flex direction="column" minH="100dvh">
      <chakra.a
        href="#main"
        position="absolute"
        left="3"
        top="-4rem"
        zIndex="popover"
        bg="bg.panel"
        px="3"
        py="2"
        rounded="md"
        borderWidth="1px"
        _focus={{ top: "3" }}
      >
        Skip to content
      </chakra.a>
      <Box
        as="header"
        position="sticky"
        top="0"
        zIndex="sticky"
        bg="bg.panel"
        borderBottomWidth="1px"
      >
        <Flex
          maxW="96rem"
          mx="auto"
          px={{ base: "3", md: "6" }}
          py="2"
          align="center"
          gap={{ base: "3", md: "6" }}
          minH="14"
        >
          <Flex align="center" gap="2" flexShrink={0}>
            <Flex boxSize="8" rounded="lg" bg="brand.solid" color="brand.contrast" align="center" justify="center">
              <LuArmchair aria-hidden />
            </Flex>
            <Text fontFamily="heading" fontWeight="bold" fontSize="xl" letterSpacing="-0.01em">
              {APP_NAME}
            </Text>
          </Flex>

          <Box display={{ base: "none", md: "block" }} minW="0" borderStartWidth="1px" ps="5">
            <Text fontWeight="semibold" fontSize="sm" truncate>
              {EVENT.name}
            </Text>
            <Text fontSize="xs" color="fg.muted" truncate>
              {formatEventDate(EVENT.date)} · {EVENT.venue}
            </Text>
          </Box>

          <Box flex="1" />

          <chakra.nav aria-label="Main">
            <HStack gap="1" as="ul" listStyleType="none" m="0" p="0">
              {NAV.map((n) => {
                const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href)
                const Icon = n.icon
                return (
                  <li key={n.href}>
                    <chakra.span display="contents">
                      <NextLink href={n.href} aria-current={active ? "page" : undefined} style={{ textDecoration: "none" }}>
                        <Flex
                          align="center"
                          gap="2"
                          px="3"
                          py="2"
                          rounded="lg"
                          fontSize="sm"
                          fontWeight="semibold"
                          bg={active ? "brand.muted" : "transparent"}
                          color={active ? "brand.fg" : "fg.muted"}
                          _hover={{ bg: active ? "brand.muted" : "bg.muted" }}
                        >
                          <Icon aria-hidden />
                          {n.label}
                        </Flex>
                      </NextLink>
                    </chakra.span>
                  </li>
                )
              })}
            </HStack>
          </chakra.nav>

          <Flex align="center" gap="2" flexShrink={0}>
            <ColorModeButton />
            <Flex
              align="center"
              gap="2"
              title={PLANNER.name}
              display={{ base: "none", sm: "flex" }}
            >
              <Flex
                boxSize="8"
                rounded="full"
                bg="bg.emphasized"
                align="center"
                justify="center"
                fontSize="xs"
                fontWeight="bold"
                aria-hidden
              >
                {initials(PLANNER.name)}
              </Flex>
              <Text fontSize="sm" display={{ base: "none", lg: "block" }}>
                {PLANNER.name}
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <Box display={{ base: "block", md: "none" }} px="3" pb="2">
          <Text fontWeight="semibold" fontSize="sm" truncate>
            {EVENT.name}
          </Text>
          <Text fontSize="xs" color="fg.muted" truncate>
            {formatEventDate(EVENT.date)} · {EVENT.venue}
          </Text>
        </Box>
      </Box>
      <Box as="main" id="main" flex="1" maxW="96rem" w="full" mx="auto" px={{ base: "3", md: "6" }} py={{ base: "4", md: "6" }}>
        {children}
      </Box>
    </Flex>
  )
}
```

```tsx components/guests/GuestsView.tsx
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
```

```tsx components/plan/Panels.tsx
"use client"

import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Menu,
  Portal,
  Text,
} from "@chakra-ui/react"
import * as React from "react"
import {
  LuCircleCheck,
  LuCircleDashed,
  LuPlus,
  LuTriangleAlert,
  LuX,
} from "react-icons/lu"
import { GUESTS_BY_ID, TABLES, TABLES_BY_ID } from "@/lib/data"
import type { RuleResult } from "@/lib/rules"
import { DietTag, GuestRow } from "./parts"
import { usePlan } from "./store"

function sortByParty(ids: string[]): string[] {
  return ids.slice().sort((a, b) => {
    const ga = GUESTS_BY_ID[a]
    const gb = GUESTS_BY_ID[b]
    return ga.party.localeCompare(gb.party) || ga.name.localeCompare(gb.name)
  })
}

export function UnseatedPanel() {
  const { unseatedAttending, unseatedOther } = usePlan()
  return (
    <Flex
      direction="column"
      gap="4"
      data-drop="unseat"
      minH="16rem"
      aria-label="Unseated guests"
    >
      <Text fontSize="sm" color="fg.muted">
        Drag a guest onto a seat, or tap a guest and then a seat or table. The Seat menu on
        each row works from the keyboard. Drop a seated guest here to unseat them.
      </Text>

      <Box as="section" aria-labelledby="unseated-attending">
        <Flex align="center" justify="space-between" mb="2">
          <Heading as="h2" id="unseated-attending" size="sm">
            Attending, no seat yet
          </Heading>
          <Badge colorPalette={unseatedAttending.length ? "orange" : "green"} variant="subtle">
            {unseatedAttending.length}
          </Badge>
        </Flex>
        {unseatedAttending.length === 0 ? (
          <Flex
            align="center"
            gap="2"
            p="3"
            rounded="lg"
            bg="green.subtle"
            color="green.fg"
            fontSize="sm"
          >
            <LuCircleCheck aria-hidden /> Everyone attending has a seat.
          </Flex>
        ) : (
          <Flex as="ul" listStyleType="none" direction="column" gap="1.5">
            {sortByParty(unseatedAttending).map((id) => (
              <li key={id}>
                <GuestRow guestId={id} menuLabel="Seat at" />
              </li>
            ))}
          </Flex>
        )}
      </Box>

      {unseatedOther.length > 0 && (
        <Box as="section" aria-labelledby="unseated-other">
          <Flex align="center" justify="space-between" mb="1">
            <Heading as="h2" id="unseated-other" size="sm">
              Not confirmed yet
            </Heading>
            <Badge variant="subtle">{unseatedOther.length}</Badge>
          </Flex>
          <Text fontSize="xs" color="fg.muted" mb="2">
            Maybe or no reply. They can hold a seat; they are not counted as attending.
          </Text>
          <Flex as="ul" listStyleType="none" direction="column" gap="1.5">
            {sortByParty(unseatedOther).map((id) => (
              <li key={id}>
                <GuestRow guestId={id} menuLabel="Seat at" showRsvp />
              </li>
            ))}
          </Flex>
        </Box>
      )}
    </Flex>
  )
}

function FillMenu({ tableId, seat }: { tableId: string; seat: number }) {
  const { unseatedAttending, unseatedOther, place } = usePlan()
  const all = [...sortByParty(unseatedAttending), ...sortByParty(unseatedOther)]
  return (
    <Menu.Root
      positioning={{ placement: "bottom-end" }}
      onSelect={(d) => place(d.value, tableId, seat)}
    >
      <Menu.Trigger asChild>
        <Button size="xs" variant="outline" disabled={all.length === 0}>
          <LuPlus /> Seat a guest
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content maxH="18rem" overflowY="auto" minW="14rem">
            {all.map((id) => (
              <Menu.Item key={id} value={id}>
                <Text flex="1">{GUESTS_BY_ID[id].name}</Text>
                <Text fontSize="xs" color="fg.muted">
                  {GUESTS_BY_ID[id].party}
                </Text>
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}

export function RuleItem({
  r,
  onSelect,
}: {
  r: RuleResult
  onSelect?: (tableId: string) => void
}) {
  const icon =
    r.status === "broken" ? (
      <LuTriangleAlert aria-hidden />
    ) : r.status === "ok" ? (
      <LuCircleCheck aria-hidden />
    ) : (
      <LuCircleDashed aria-hidden />
    )
  const palette = r.status === "broken" ? "red" : r.status === "ok" ? "green" : "gray"
  const word = r.status === "broken" ? "Broken" : r.status === "ok" ? "Kept" : "Open"
  return (
    <Flex
      gap="3"
      p="3"
      rounded="lg"
      borderWidth="1px"
      borderColor={r.status === "broken" ? "red.muted" : "border"}
      bg={r.status === "broken" ? "red.subtle" : "bg.panel"}
      align="flex-start"
    >
      <Box mt="0.5" color={`${palette}.fg`} fontSize="lg" flexShrink={0}>
        {icon}
      </Box>
      <Box flex="1" minW="0">
        <Flex gap="2" align="center" wrap="wrap">
          <Text fontWeight="semibold" fontSize="sm">
            {r.title}
          </Text>
          <Badge colorPalette={palette} variant="subtle" size="sm">
            {word}
          </Badge>
        </Flex>
        <Text fontSize="sm" mt="0.5">
          {r.detail}
        </Text>
        <Text fontSize="xs" color="fg.muted" mt="0.5">
          {r.rule.note}
        </Text>
        {onSelect && r.involved.length > 0 && (
          <Flex gap="1.5" mt="2" wrap="wrap">
            {r.involved.map((tid) => (
              <Button key={tid} size="2xs" variant="outline" onClick={() => onSelect(tid)}>
                Show {TABLES_BY_ID[tid].name}
              </Button>
            ))}
          </Flex>
        )}
      </Box>
    </Flex>
  )
}

export function RulesPanel() {
  const { rules, selectTable } = usePlan()
  const ordered = [...rules].sort((a, b) => {
    const rank = { broken: 0, open: 1, ok: 2 } as const
    return rank[a.status] - rank[b.status]
  })
  return (
    <Flex direction="column" gap="2">
      <Text fontSize="sm" color="fg.muted">
        The couple&apos;s rules, checked after every change. A broken rule is flagged on the
        tables involved.
      </Text>
      {ordered.map((r) => (
        <RuleItem
          key={r.id}
          r={r}
          onSelect={r.involved.length ? (tid) => selectTable(tid) : undefined}
        />
      ))}
    </Flex>
  )
}

export function TablePanel() {
  const { selectedTable, selectTable, seats, rules, picked, pick, place, tableOf } = usePlan()

  if (!selectedTable) {
    return (
      <Flex direction="column" gap="3">
        <Text fontSize="sm" color="fg.muted">
          Select a table on the plan, or here, to see who sits there and what they eat.
        </Text>
        <Flex as="ul" listStyleType="none" direction="column" gap="1.5">
          {TABLES.map((t) => {
            const n = seats[t.id].filter(Boolean).length
            return (
              <li key={t.id}>
                <Button
                  w="full"
                  justifyContent="space-between"
                  variant="outline"
                  onClick={() => selectTable(t.id)}
                >
                  {t.name}
                  <Text as="span" color="fg.muted" fontSize="sm">
                    {n}/{t.seats} seated
                  </Text>
                </Button>
              </li>
            )
          })}
        </Flex>
      </Flex>
    )
  }

  const table = TABLES_BY_ID[selectedTable]
  const row = seats[selectedTable]
  const filled = row.filter(Boolean).length
  const guests = row.filter((x): x is string => x !== null).map((id) => GUESTS_BY_ID[id])
  const dietary = guests.filter((g) => g.diet)
  const related = rules.filter(
    (r) => r.tables.includes(selectedTable) || r.involved.includes(selectedTable),
  )

  return (
    <Flex direction="column" gap="4">
      <Flex align="flex-start" justify="space-between" gap="2">
        <Box>
          <Heading as="h2" size="md">
            {table.name}
          </Heading>
          <Text fontSize="sm" color="fg.muted">
            {filled} of {table.seats} seats filled ·{" "}
            {table.seats - filled === 0 ? "full" : `${table.seats - filled} free`}
          </Text>
        </Box>
        <IconButton
          size="sm"
          variant="ghost"
          aria-label="Clear table selection"
          onClick={() => selectTable(null)}
        >
          <LuX />
        </IconButton>
      </Flex>

      {picked && (
        <Button
          colorPalette="brand"
          onClick={() => place(picked, table.id)}
          disabled={filled >= table.seats}
        >
          Seat {GUESTS_BY_ID[picked].name.split(" ")[0]} here
        </Button>
      )}

      <Box as="section" aria-labelledby="diet-heading">
        <Heading as="h3" id="diet-heading" size="xs" textTransform="uppercase" letterSpacing="0.06em" color="fg.muted" mb="2">
          Dietary needs
        </Heading>
        {dietary.length === 0 ? (
          <Text fontSize="sm" color="fg.muted">
            No dietary needs at this table.
          </Text>
        ) : (
          <Flex as="ul" listStyleType="none" direction="column" gap="1">
            {dietary.map((g) => (
              <Flex as="li" key={g.id} justify="space-between" gap="3" fontSize="sm">
                <Text>{g.name}</Text>
                <DietTag diet={g.diet as string} />
              </Flex>
            ))}
          </Flex>
        )}
      </Box>

      {related.length > 0 && (
        <Box as="section" aria-labelledby="table-rules">
          <Heading as="h3" id="table-rules" size="xs" textTransform="uppercase" letterSpacing="0.06em" color="fg.muted" mb="2">
            Rules involving this table
          </Heading>
          <Flex direction="column" gap="1.5">
            {related.map((r) => (
              <RuleItem key={r.id} r={r} />
            ))}
          </Flex>
        </Box>
      )}

      <Box as="section" aria-labelledby="seat-heading">
        <Heading as="h3" id="seat-heading" size="xs" textTransform="uppercase" letterSpacing="0.06em" color="fg.muted" mb="2">
          Seats
        </Heading>
        <Flex as="ul" listStyleType="none" direction="column" gap="1.5">
          {row.map((gid, i) => (
            <Flex
              as="li"
              key={i}
              align="center"
              gap="2"
              data-drop="seat"
              data-table={table.id}
              data-seat={i}
            >
              <Text
                w="5"
                flexShrink={0}
                textAlign="center"
                fontSize="xs"
                color="fg.muted"
                aria-hidden
              >
                {i + 1}
              </Text>
              <Box flex="1" minW="0">
                {gid ? (
                  <GuestRow guestId={gid} menuLabel="Move" />
                ) : (
                  <Flex
                    align="center"
                    justify="space-between"
                    gap="2"
                    px="3"
                    py="2"
                    rounded="lg"
                    borderWidth="1px"
                    borderStyle="dashed"
                    borderColor="border.emphasized"
                  >
                    <Text fontSize="sm" color="fg.muted">
                      Empty seat
                    </Text>
                    {picked ? (
                      <Button size="xs" colorPalette="brand" onClick={() => place(picked, table.id, i)}>
                        Place here
                      </Button>
                    ) : (
                      <FillMenu tableId={table.id} seat={i} />
                    )}
                  </Flex>
                )}
              </Box>
            </Flex>
          ))}
        </Flex>
        {picked && tableOf[picked] === table.id && (
          <Button mt="2" size="xs" variant="ghost" onClick={() => pick(null)}>
            Cancel move
          </Button>
        )}
      </Box>
    </Flex>
  )
}
```

```tsx components/plan/PlanView.tsx
"use client"

import {
  Alert,
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Tabs,
  Text,
} from "@chakra-ui/react"
import * as React from "react"
import { LuCircleCheck, LuTriangleAlert, LuX } from "react-icons/lu"
import { GUESTS_BY_ID, PARTY_COLOR, RULES, TABLES } from "@/lib/data"
import { RoomPlan, RoomPlanFrame } from "./RoomPlan"
import { RulesPanel, TablePanel, UnseatedPanel } from "./Panels"
import { usePlan, type PanelTab } from "./store"

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: React.ReactNode
  hint: string
  tone?: "warn" | "good" | "bad"
}) {
  const color = tone === "bad" ? "red.fg" : tone === "warn" ? "orange.fg" : tone === "good" ? "green.fg" : "fg"
  return (
    <Box
      p={{ base: "3", md: "4" }}
      rounded="xl"
      borderWidth="1px"
      bg="bg.panel"
      minW="0"
    >
      <Text fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="0.06em">
        {label}
      </Text>
      <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" lineHeight="1.1" color={color} mt="1">
        {value}
      </Text>
      <Text fontSize="xs" color="fg.muted" mt="1" truncate>
        {hint}
      </Text>
    </Box>
  )
}

export function PlanView() {
  const {
    seats,
    seatedCount,
    attendingCount,
    seatedAttending,
    unseatedAttending,
    capacity,
    brokenRules,
    brokenTables,
    selectedTable,
    selectTable,
    tab,
    setTab,
    picked,
    pick,
  } = usePlan()

  const free = capacity - seatedCount
  const pct = attendingCount ? Math.round((seatedAttending / attendingCount) * 100) : 0

  return (
    <Flex direction="column" gap={{ base: "3", md: "4" }}>
      <Flex align="flex-end" justify="space-between" gap="3" wrap="wrap">
        <Box>
          <Heading as="h1" size={{ base: "lg", md: "xl" }}>
            Seating plan
          </Heading>
          <Text color="fg.muted" fontSize="sm">
            Drag guests onto seats, or tap a guest, then a seat.
          </Text>
        </Box>
        <Flex align="center" gap="3" minW={{ base: "full", sm: "16rem" }}>
          <Box flex="1" role="img" aria-label={`${pct} percent of attending guests seated`}>
            <Box h="2" rounded="full" bg="bg.emphasized" overflow="hidden">
              <Box h="full" bg="brand.solid" rounded="full" style={{ width: `${pct}%`, transition: "width .25s" }} />
            </Box>
          </Box>
          <Text fontSize="sm" fontWeight="semibold" whiteSpace="nowrap">
            {pct}% seated
          </Text>
        </Flex>
      </Flex>

      <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={{ base: "2", md: "3" }}>
        <Stat label="Seated" value={seatedCount} hint={`${seatedAttending} of ${attendingCount} attending`} />
        <Stat
          label="Unseated"
          value={unseatedAttending.length}
          hint={unseatedAttending.length ? "attending, need a seat" : "everyone attending is seated"}
          tone={unseatedAttending.length ? "warn" : "good"}
        />
        <Stat label="Free seats" value={free} hint={`of ${capacity} in the room`} />
        <Stat
          label="Rules"
          value={brokenRules.length === 0 ? "All kept" : `${brokenRules.length} broken`}
          hint={`${brokenRules.length} of ${RULES.length} rules need attention`}
          tone={brokenRules.length ? "bad" : "good"}
        />
      </Grid>

      {brokenRules.length > 0 ? (
        <Alert.Root status="error" variant="subtle" rounded="xl" alignItems="flex-start">
          <Alert.Indicator>
            <LuTriangleAlert />
          </Alert.Indicator>
          <Alert.Content>
            <Alert.Title>
              {brokenRules.length === 1 ? "1 rule is broken" : `${brokenRules.length} rules are broken`}
            </Alert.Title>
            <Alert.Description>
              <Box as="ul" listStyleType="none" m="0" p="0">
                {brokenRules.map((r) => (
                  <li key={r.id}>
                    {r.title}: {r.detail}
                  </li>
                ))}
              </Box>
            </Alert.Description>
          </Alert.Content>
          <Button size="xs" variant="outline" colorPalette="red" onClick={() => setTab("rules")}>
            Review
          </Button>
        </Alert.Root>
      ) : (
        <Alert.Root status="success" variant="subtle" rounded="xl">
          <Alert.Indicator>
            <LuCircleCheck />
          </Alert.Indicator>
          <Alert.Content>
            <Alert.Title>Every rule the couple set is kept right now.</Alert.Title>
          </Alert.Content>
        </Alert.Root>
      )}

      <Grid templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 24rem" }} gap={{ base: "3", md: "4" }} alignItems="start">
        <Flex direction="column" gap="3" minW="0">
          {picked && (
            <Flex
              align="center"
              justify="space-between"
              gap="3"
              px="4"
              py="2.5"
              rounded="xl"
              bg="brand.solid"
              color="brand.contrast"
              role="status"
            >
              <Text fontSize="sm" fontWeight="semibold">
                Placing {GUESTS_BY_ID[picked].name}: tap an empty seat or a table.
              </Text>
              <Button size="xs" variant="surface" colorPalette="gray" onClick={() => pick(null)}>
                <LuX /> Cancel
              </Button>
            </Flex>
          )}

          <RoomPlanFrame>
            <RoomPlan />
          </RoomPlanFrame>

          <Flex wrap="wrap" columnGap="4" rowGap="2" aria-label="Plan key" role="group" fontSize="xs" color="fg.muted">
            {Object.keys(PARTY_COLOR).map((p) => (
              <Flex key={p} align="center" gap="1.5">
                <Box boxSize="3" rounded="full" bg={`${PARTY_COLOR[p]}.700`} aria-hidden />
                {p}
              </Flex>
            ))}
            <Flex align="center" gap="1.5">
              <Box boxSize="2.5" rounded="full" bg="orange.400" aria-hidden /> Dietary need
            </Flex>
            <Flex align="center" gap="1.5">
              <Box boxSize="3" rounded="full" borderWidth="1.5px" borderStyle="dashed" borderColor="border.emphasized" aria-hidden /> Empty seat
            </Flex>
            <Flex align="center" gap="1.5">
              <Box boxSize="3" rounded="full" bg="red.600" aria-hidden /> Broken rule
            </Flex>
          </Flex>

          <Flex as="ul" listStyleType="none" gap="2" wrap="wrap" aria-label="Tables">
            {TABLES.map((t) => {
              const n = seats[t.id].filter(Boolean).length
              const broken = brokenTables.has(t.id)
              const selected = selectedTable === t.id
              return (
                <li key={t.id}>
                  <Button
                    size="sm"
                    variant={selected ? "solid" : "outline"}
                    colorPalette={broken ? "red" : "brand"}
                    aria-pressed={selected}
                    onClick={() => selectTable(t.id)}
                  >
                    {broken && <LuTriangleAlert aria-label="Rule broken" />}
                    {t.name}
                    <Text as="span" opacity={0.8} fontWeight="normal">
                      {n}/{t.seats}
                    </Text>
                  </Button>
                </li>
              )
            })}
          </Flex>
        </Flex>

        <Box
          rounded="xl"
          borderWidth="1px"
          bg="bg.panel"
          position={{ base: "static", lg: "sticky" }}
          top="4.5rem"
          maxH={{ base: "none", lg: "calc(100vh - 6rem)" }}
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
          <Tabs.Root
            value={tab}
            onValueChange={(e) => setTab(e.value as PanelTab)}
            variant="line"
            size="sm"
            fitted
            display="flex"
            flexDirection="column"
            minH="0"
            flex="1"
          >
            <Tabs.List px="2" pt="1">
              <Tabs.Trigger value="unseated">
                To seat
                <Badge colorPalette={unseatedAttending.length ? "orange" : "green"} variant="subtle" size="sm">
                  {unseatedAttending.length}
                </Badge>
              </Tabs.Trigger>
              <Tabs.Trigger value="table">Table</Tabs.Trigger>
              <Tabs.Trigger value="rules">
                Rules
                <Badge colorPalette={brokenRules.length ? "red" : "green"} variant="subtle" size="sm">
                  {brokenRules.length}
                </Badge>
              </Tabs.Trigger>
            </Tabs.List>
            <Box overflowY="auto" p="3" flex="1" minH="0">
              <Tabs.Content value="unseated" p="0">
                <UnseatedPanel />
              </Tabs.Content>
              <Tabs.Content value="table" p="0">
                <TablePanel />
              </Tabs.Content>
              <Tabs.Content value="rules" p="0">
                <RulesPanel />
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </Box>
      </Grid>
    </Flex>
  )
}
```

```tsx components/plan/RoomPlan.tsx
"use client"

import { Box, chakra } from "@chakra-ui/react"
import * as React from "react"
import {
  EVENT,
  FIXTURES,
  GUESTS_BY_ID,
  TABLES,
  initials,
  partyColor,
  type SeatTable,
} from "@/lib/data"
import { SEAT_R, tableGeometry } from "@/lib/geometry"
import { usePlan } from "./store"

const v = (token: string) => `var(--chakra-colors-${token})`

/**
 * SVG text in metre units: browsers clamp tiny font sizes, so the text is drawn
 * at 100x and scaled back down.
 */
function Txt({
  x,
  y,
  fontSize,
  rotate = 0,
  children,
  ...rest
}: Omit<React.SVGProps<SVGTextElement>, "x" | "y" | "fontSize" | "transform"> & {
  x: number
  y: number
  fontSize: number
  rotate?: number
}) {
  return (
    <text
      transform={`translate(${x} ${y})${rotate ? ` rotate(${rotate})` : ""} scale(0.01)`}
      style={{ fontSize: fontSize * 100 }}
      {...rest}
    >
      {children}
    </text>
  )
}

const GEO =Object.fromEntries(TABLES.map((t) => [t.id, tableGeometry(t)]))

const PAD = 1.5
const VIEW = `${-PAD} ${-PAD} ${EVENT.room_m.width + PAD * 2} ${EVENT.room_m.depth + PAD * 2}`

export function RoomPlan() {
  const {
    seats,
    selectedTable,
    brokenTables,
    picked,
    selectTable,
    place,
    pick,
    startDrag,
    wasDragged,
    dragGuest,
    dropKey,
  } = usePlan()

  const placing = Boolean(picked || dragGuest)
  const holder = picked ?? dragGuest

  const handleActivate = (table: SeatTable, seatEl: Element | null) => {
    if (wasDragged()) return
    if (picked) {
      if (seatEl) {
        const idx = Number(seatEl.getAttribute("data-seat"))
        if (seats[table.id][idx] === picked) {
          pick(null)
          return
        }
        place(picked, table.id, idx)
      } else {
        place(picked, table.id)
      }
      return
    }
    selectTable(table.id)
  }

  return (
    <chakra.svg
      viewBox={VIEW}
      role="group"
      aria-label={`Floor plan of ${EVENT.venue}, ${EVENT.room_m.width} by ${EVENT.room_m.depth} metres, drawn to scale`}
      w="full"
      minW={{ base: "720px", md: "0" }}
      h="auto"
      display="block"
      style={{ fontFamily: "var(--chakra-fonts-body)" }}
    >
      <defs>
        <pattern id="dance-grid" width="2" height="2" patternUnits="userSpaceOnUse">
          <rect width="2" height="2" fill={v("brand-subtle")} />
          <rect width="1" height="1" fill={v("brand-muted")} />
          <rect x="1" y="1" width="1" height="1" fill={v("brand-muted")} />
        </pattern>
      </defs>

      {/* room */}
      <rect
        x={0}
        y={0}
        width={EVENT.room_m.width}
        height={EVENT.room_m.depth}
        rx={0.15}
        fill={v("bg-panel")}
        stroke={v("border-emphasized")}
        strokeWidth={0.12}
      />

      {/* dimensions */}
      <g stroke={v("fg-subtle")} strokeWidth={0.05} fill={v("fg-muted")}>
        <line x1={0} y1={-0.55} x2={EVENT.room_m.width} y2={-0.55} />
        <line x1={0} y1={-0.8} x2={0} y2={-0.3} />
        <line x1={EVENT.room_m.width} y1={-0.8} x2={EVENT.room_m.width} y2={-0.3} />
        <Txt
          x={EVENT.room_m.width / 2}
          y={-0.75}
          textAnchor="middle"
          fontSize={0.5}
          stroke="none"
        >
          {EVENT.room_m.width} m
        </Txt>
        <line x1={EVENT.room_m.width + 0.55} y1={0} x2={EVENT.room_m.width + 0.55} y2={EVENT.room_m.depth} />
        <line x1={EVENT.room_m.width + 0.3} y1={0} x2={EVENT.room_m.width + 0.8} y2={0} />
        <line x1={EVENT.room_m.width + 0.3} y1={EVENT.room_m.depth} x2={EVENT.room_m.width + 0.8} y2={EVENT.room_m.depth} />
        <Txt
          x={EVENT.room_m.width + 1.25}
          y={EVENT.room_m.depth / 2}
          rotate={90}
          textAnchor="middle"
          fontSize={0.5}
          stroke="none"
        >
          {EVENT.room_m.depth} m
        </Txt>
      </g>

      {/* fixtures */}
      {FIXTURES.map((f) => {
        const cx = f.x + f.w / 2
        const cy = f.y + f.h / 2
        if (f.kind === "stage") {
          return (
            <g key={f.id}>
              <rect x={f.x} y={f.y} width={f.w} height={f.h} rx={0.15} fill={v("gray-700")} />
              <Txt x={cx} y={cy + 0.18} textAnchor="middle" fontSize={0.6} fontWeight={700} fill="#fff">
                {f.label}
              </Txt>
            </g>
          )
        }
        if (f.kind === "dancefloor") {
          return (
            <g key={f.id}>
              <rect
                x={f.x}
                y={f.y}
                width={f.w}
                height={f.h}
                rx={0.1}
                fill="url(#dance-grid)"
                stroke={v("brand-emphasized")}
                strokeWidth={0.06}
              />
              <Txt x={cx} y={cy + 0.18} textAnchor="middle" fontSize={0.6} fontWeight={600} fill={v("brand-fg")}>
                {f.label}
              </Txt>
            </g>
          )
        }
        if (f.kind === "bar") {
          return (
            <g key={f.id}>
              <rect
                x={f.x}
                y={f.y}
                width={f.w}
                height={f.h}
                rx={0.15}
                fill={v("orange-muted")}
                stroke={v("orange-solid")}
                strokeWidth={0.08}
              />
              <Txt x={cx} y={cy + 0.18} textAnchor="middle" fontSize={0.6} fontWeight={700} fill={v("orange-fg")}>
                {f.label}
              </Txt>
            </g>
          )
        }
        return (
          <g key={f.id}>
            <rect x={f.x - 0.06} y={f.y} width={f.w + 0.12} height={f.h} fill={v("green-solid")} />
            <Txt
              x={-0.45}
              y={cy}
              rotate={-90}
              textAnchor="middle"
              fontSize={0.5}
              fontWeight={600}
              fill={v("green-fg")}
            >
              {f.label}
            </Txt>
          </g>
        )
      })}

      {/* tables */}
      {TABLES.map((t) => {
        const geo = GEO[t.id]
        const row = seats[t.id]
        const filled = row.filter(Boolean).length
        const selected = selectedTable === t.id
        const broken = brokenTables.has(t.id)
        const hover = dropKey !== null && dropKey.split("|")[1] === t.id
        const hasFree = filled < t.seats
        const summary = `${t.name}, ${filled} of ${t.seats} seats filled${broken ? ", a seating rule is broken here" : ""}`

        const ringStroke = broken ? v("red-500") : selected ? v("brand-solid") : hover ? v("brand-solid") : "none"
        const ringFill = hover
          ? v("brand-muted")
          : selected
            ? v("brand-subtle")
            : "transparent"

        const keyActivate = (e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleActivate(t, null)
          }
        }

        const badgeX = geo.rect ? geo.rect.x + geo.rect.w + 0.1 : geo.cx + geo.hitR * 0.92
        const badgeY = geo.rect ? geo.rect.y - 0.2 : geo.cy - geo.hitR * 0.38

        return (
          <g
            key={t.id}
            role="group"
            aria-label={t.name}
            data-table-id={t.id}
            onClick={(e) => handleActivate(t, (e.target as Element).closest("[data-seat]"))}
            style={{ cursor: placing && hasFree ? "copy" : "pointer" }}
          >
            {/* hit area and highlight */}
            {geo.rect ? (
              <rect
                data-drop="table"
                data-table={t.id}
                x={geo.rect.x - 0.35}
                y={geo.rect.y - 0.35}
                width={geo.rect.w + 0.7}
                height={geo.rect.h + 1.5}
                rx={0.5}
                fill={ringFill}
                stroke={ringStroke}
                strokeWidth={broken ? 0.12 : 0.1}
                strokeDasharray={broken ? "0.35 0.2" : undefined}
              />
            ) : (
              <circle
                data-drop="table"
                data-table={t.id}
                cx={geo.cx}
                cy={geo.cy}
                r={geo.hitR}
                fill={ringFill}
                stroke={ringStroke}
                strokeWidth={broken ? 0.12 : 0.1}
                strokeDasharray={broken ? "0.35 0.2" : undefined}
              />
            )}

            {/* table body (the keyboard target) */}
            {geo.rect ? (
              <>
                <rect
                  role="button"
                  tabIndex={0}
                  aria-label={summary}
                  aria-pressed={selected}
                  onKeyDown={keyActivate}
                  x={geo.rect.x}
                  y={geo.rect.y}
                  width={geo.rect.w}
                  height={geo.rect.h}
                  rx={0.2}
                  fill={v("bg-subtle")}
                  stroke={v("border-emphasized")}
                  strokeWidth={0.08}
                  className="plan-table-body"
                />
                <Txt
                  x={geo.cx}
                  y={geo.cy + 0.17}
                  textAnchor="middle"
                  fontSize={0.5}
                  fontWeight={700}
                  fill={v("fg")}
                  pointerEvents="none"
                >
                  {t.name} · {filled}/{t.seats}
                </Txt>
              </>
            ) : (
              <>
                <circle
                  role="button"
                  tabIndex={0}
                  aria-label={summary}
                  aria-pressed={selected}
                  onKeyDown={keyActivate}
                  cx={geo.cx}
                  cy={geo.cy}
                  r={geo.radius}
                  fill={v("bg-subtle")}
                  stroke={v("border-emphasized")}
                  strokeWidth={0.08}
                  className="plan-table-body"
                />
                <Txt
                  x={geo.cx}
                  y={geo.cy - 0.05}
                  textAnchor="middle"
                  fontSize={t.seats <= 6 ? 0.36 : 0.4}
                  fontWeight={700}
                  fill={v("fg")}
                  pointerEvents="none"
                >
                  {t.name}
                </Txt>
                <Txt
                  x={geo.cx}
                  y={geo.cy + 0.42}
                  textAnchor="middle"
                  fontSize={0.34}
                  fill={v("fg-muted")}
                  pointerEvents="none"
                >
                  {filled}/{t.seats}
                </Txt>
              </>
            )}

            {/* seats */}
            {geo.seats.map((p, i) => {
              const gid = row[i]
              const guest = gid ? GUESTS_BY_ID[gid] : null
              const isHover = dropKey === `seat|${t.id}|${i}`
              const isPicked = gid !== null && gid === picked
              const isDragged = gid !== null && gid === dragGuest
              const label = guest
                ? `${t.name}, seat ${i + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}`
                : `${t.name}, seat ${i + 1}: empty`
              const palette = guest ? partyColor(guest.party) : "gray"
              const invite = placing && !guest && holder !== null
              return (
                <g
                  key={i}
                  role="img"
                  aria-label={label}
                  data-drop="seat"
                  data-table={t.id}
                  data-seat={i}
                  onPointerDown={guest ? (e) => startDrag(guest.id, e) : undefined}
                  onContextMenu={guest ? (e) => e.preventDefault() : undefined}
                  style={{
                    cursor: guest ? "grab" : undefined,
                    opacity: isDragged ? 0.35 : 1,
                    userSelect: "none",
                  }}
                >
                  <title>{label}</title>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={SEAT_R}
                    fill={guest ? v(`${palette}-700`) : isHover ? v("brand-muted") : v("bg-panel")}
                    stroke={
                      isHover || isPicked
                        ? v("brand-solid")
                        : guest
                          ? v("bg-panel")
                          : invite
                            ? v("brand-solid")
                            : v("border-emphasized")
                    }
                    strokeWidth={isHover || isPicked ? 0.14 : 0.07}
                    strokeDasharray={guest ? undefined : "0.18 0.14"}
                  />
                  {guest ? (
                    <Txt
                      x={p.x}
                      y={p.y + 0.11}
                      textAnchor="middle"
                      fontSize={0.3}
                      fontWeight={700}
                      fill="#fff"
                      pointerEvents="none"
                    >
                      {initials(guest.name)}
                    </Txt>
                  ) : (
                    <Txt
                      x={p.x}
                      y={p.y + 0.1}
                      textAnchor="middle"
                      fontSize={0.28}
                      fill={v("fg-subtle")}
                      pointerEvents="none"
                    >
                      {i + 1}
                    </Txt>
                  )}
                  {guest?.diet && (
                    <circle
                      cx={p.x + 0.3}
                      cy={p.y - 0.3}
                      r={0.13}
                      fill={v("orange-400")}
                      stroke={v("bg-panel")}
                      strokeWidth={0.05}
                      pointerEvents="none"
                    />
                  )}
                </g>
              )
            })}

            {broken && (
              <g pointerEvents="none">
                <circle cx={badgeX} cy={badgeY} r={0.42} fill={v("red-600")} stroke={v("bg-panel")} strokeWidth={0.08} />
                <Txt x={badgeX} y={badgeY + 0.17} textAnchor="middle" fontSize={0.55} fontWeight={800} fill="#fff">
                  !
                </Txt>
              </g>
            )}
          </g>
        )
      })}

      {/* scale bar */}
      <g stroke={v("fg-muted")} strokeWidth={0.08} fill={v("fg-muted")}>
        <line x1={0} y1={EVENT.room_m.depth + 0.7} x2={2} y2={EVENT.room_m.depth + 0.7} />
        <line x1={0} y1={EVENT.room_m.depth + 0.55} x2={0} y2={EVENT.room_m.depth + 0.85} />
        <line x1={2} y1={EVENT.room_m.depth + 0.55} x2={2} y2={EVENT.room_m.depth + 0.85} />
        <Txt x={2.3} y={EVENT.room_m.depth + 0.9} fontSize={0.45} stroke="none">
          2 m
        </Txt>
      </g>
    </chakra.svg>
  )
}

export function RoomPlanFrame({ children }: { children: React.ReactNode }) {
  return (
    <Box
      overflowX="auto"
      rounded="xl"
      borderWidth="1px"
      bg="bg.muted"
      p={{ base: "2", md: "3" }}
      css={{
        "& .plan-table-body:focus-visible": {
          outline: "none",
          stroke: "var(--chakra-colors-brand-solid)",
          strokeWidth: "0.2px",
        },
      }}
    >
      {children}
    </Box>
  )
}
```

```tsx components/plan/parts.tsx
"use client"

import { Badge, Box, Button, Flex, IconButton, Menu, Portal, Text, chakra } from "@chakra-ui/react"
import * as React from "react"
import { LuChevronDown, LuEllipsis, LuGrip } from "react-icons/lu"
import {
  GUESTS_BY_ID,
  RSVP_LABEL,
  RSVP_PALETTE,
  TABLES,
  initials,
  partyColor,
} from "@/lib/data"
import { usePlan } from "./store"

export function GuestAvatar({ guestId, size = "9" }: { guestId: string; size?: string }) {
  const g = GUESTS_BY_ID[guestId]
  return (
    <Flex
      aria-hidden
      flexShrink={0}
      boxSize={size}
      rounded="full"
      align="center"
      justify="center"
      bg={`${partyColor(g.party)}.700`}
      color="white"
      fontSize="xs"
      fontWeight="bold"
      letterSpacing="0.02em"
    >
      {initials(g.name)}
    </Flex>
  )
}

export function DietTag({ diet }: { diet: string }) {
  return (
    <Badge colorPalette="orange" variant="subtle" size="sm" rounded="full">
      {diet}
    </Badge>
  )
}

export function RsvpBadge({ guestId }: { guestId: string }) {
  const g = GUESTS_BY_ID[guestId]
  return (
    <Badge colorPalette={RSVP_PALETTE[g.rsvp]} variant="subtle" size="sm">
      {RSVP_LABEL[g.rsvp]}
    </Badge>
  )
}

/** Menu with every table (and Unseat) so a guest can be placed or moved without dragging. */
export function SeatMenu({
  guestId,
  label,
  iconOnly,
}: {
  guestId: string
  label: string
  iconOnly?: boolean
}) {
  const { seats, tableOf, place, unseat } = usePlan()
  const g = GUESTS_BY_ID[guestId]
  const current = tableOf[guestId]
  return (
    <Menu.Root
      positioning={{ placement: "bottom-end" }}
      onSelect={(d) => {
        if (d.value === "__unseat") unseat(guestId)
        else place(guestId, d.value)
      }}
    >
      <Menu.Trigger asChild>
        {iconOnly ? (
          <IconButton
            variant="ghost"
            size="sm"
            aria-label={`${label}: ${g.name}`}
          >
            <LuEllipsis />
          </IconButton>
        ) : (
          <Button variant="outline" size="xs" aria-label={`${label}: ${g.name}`}>
            {label}
            <LuChevronDown />
          </Button>
        )}
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="13rem">
            <Menu.ItemGroup>
              <Menu.ItemGroupLabel>Seat {g.name.split(" ")[0]} at</Menu.ItemGroupLabel>
              {TABLES.map((t) => {
                const free = seats[t.id].filter((x) => x === null).length
                const isCurrent = current === t.id
                return (
                  <Menu.Item
                    key={t.id}
                    value={t.id}
                    disabled={isCurrent || free === 0}
                  >
                    <Text flex="1">{t.name}</Text>
                    <Text fontSize="xs" color="fg.muted">
                      {isCurrent ? "current" : free === 0 ? "full" : `${free} free`}
                    </Text>
                  </Menu.Item>
                )
              })}
            </Menu.ItemGroup>
            {current && (
              <>
                <Menu.Separator />
                <Menu.Item value="__unseat" color="fg.error">
                  Unseat
                </Menu.Item>
              </>
            )}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}

/** A guest row: the name area picks the guest up (tap) or drags them; the menu is the keyboard route. */
export function GuestRow({
  guestId,
  menuLabel,
  showRsvp,
  trailing,
}: {
  guestId: string
  menuLabel: string
  showRsvp?: boolean
  trailing?: React.ReactNode
}) {
  const { picked, pick, startDrag, wasDragged, dragGuest } = usePlan()
  const g = GUESTS_BY_ID[guestId]
  const isPicked = picked === guestId
  return (
    <Flex
      align="center"
      gap="1"
      rounded="lg"
      borderWidth="1px"
      borderColor={isPicked ? "brand.solid" : "border"}
      bg={isPicked ? "brand.subtle" : "bg.panel"}
      opacity={dragGuest === guestId ? 0.5 : 1}
      pe="1.5"
    >
      <chakra.button
        type="button"
        flex="1"
        minW="0"
        display="flex"
        alignItems="center"
        gap="3"
        px="2.5"
        py="2"
        textAlign="start"
        cursor="grab"
        rounded="lg"
        aria-pressed={isPicked}
        onPointerDown={(e: React.PointerEvent) => startDrag(guestId, e)}
        onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
        onClick={() => {
          if (wasDragged()) return
          pick(isPicked ? null : guestId)
        }}
        style={{ userSelect: "none", WebkitTouchCallout: "none" }}
        _focusVisible={{ outline: "2px solid", outlineColor: "brand.focusRing", outlineOffset: "1px" }}
      >
        <LuGrip aria-hidden style={{ opacity: 0.4, flexShrink: 0 }} />
        <GuestAvatar guestId={guestId} size="8" />
        <Box minW="0" flex="1">
          <Text fontSize="sm" fontWeight="semibold" truncate>
            {g.name}
          </Text>
          <Flex gap="1.5" align="center" wrap="wrap">
            <Text fontSize="xs" color="fg.muted" truncate>
              {g.party}
            </Text>
            {g.diet && <DietTag diet={g.diet} />}
            {showRsvp && <RsvpBadge guestId={guestId} />}
          </Flex>
        </Box>
      </chakra.button>
      {trailing}
      <SeatMenu guestId={guestId} label={menuLabel} />
    </Flex>
  )
}
```

```tsx components/plan/store.tsx
"use client"

import { Box, Text } from "@chakra-ui/react"
import * as React from "react"
import { toaster } from "@/components/ui/toaster"
import {
  GUESTS,
  GUESTS_BY_ID,
  TABLES,
  TABLES_BY_ID,
  canSeat,
  partyColor,
} from "@/lib/data"
import { evaluateRules, type RuleResult } from "@/lib/rules"

export type Seats = Record<string, (string | null)[]>
export type PanelTab = "unseated" | "table" | "rules"

function initialSeats(): Seats {
  const seats: Seats = {}
  for (const t of TABLES) seats[t.id] = Array.from({ length: t.seats }, () => null)
  for (const g of GUESTS) {
    if (!g.table) continue
    const row = seats[g.table]
    const free = row.indexOf(null)
    if (free !== -1) row[free] = g.id
  }
  return seats
}

export interface PlanContextValue {
  seats: Seats
  tableOf: Record<string, string | null>
  seatedCount: number
  attendingCount: number
  seatedAttending: number
  unseatedAttending: string[]
  unseatedOther: string[]
  capacity: number
  rules: RuleResult[]
  brokenRules: RuleResult[]
  brokenTables: Set<string>
  selectedTable: string | null
  selectTable: (id: string | null) => void
  tab: PanelTab
  setTab: (t: PanelTab) => void
  picked: string | null
  pick: (id: string | null) => void
  place: (guestId: string, tableId: string, seat?: number) => void
  unseat: (guestId: string) => void
  dragGuest: string | null
  dropKey: string | null
  startDrag: (guestId: string, e: React.PointerEvent) => void
  wasDragged: () => boolean
}

const PlanContext = React.createContext<PlanContextValue | null>(null)

export function usePlan(): PlanContextValue {
  const ctx = React.useContext(PlanContext)
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider")
  return ctx
}

function dropTarget(x: number, y: number): { key: string; el: Element } | null {
  const el = document.elementFromPoint(x, y)
  const hit = el?.closest("[data-drop]")
  if (!hit) return null
  const kind = hit.getAttribute("data-drop")
  const table = hit.getAttribute("data-table") ?? ""
  const seat = hit.getAttribute("data-seat") ?? ""
  return { key: `${kind}|${table}|${seat}`, el: hit }
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [seats, setSeats] = React.useState<Seats>(initialSeats)
  const seatsRef = React.useRef(seats)
  seatsRef.current = seats

  const [selectedTable, setSelectedTable] = React.useState<string | null>(null)
  const [tab, setTab] = React.useState<PanelTab>("unseated")
  const [picked, setPicked] = React.useState<string | null>(null)
  const [announcement, setAnnouncement] = React.useState("")
  const [dragGuest, setDragGuest] = React.useState<string | null>(null)
  const [dropKey, setDropKey] = React.useState<string | null>(null)

  const ghostRef = React.useRef<HTMLDivElement | null>(null)
  const ghostPos = React.useRef({ x: 0, y: 0 })
  const draggedRecently = React.useRef(false)

  const tableOf = React.useMemo(() => {
    const m: Record<string, string | null> = {}
    for (const g of GUESTS) m[g.id] = null
    for (const [tid, row] of Object.entries(seats)) {
      for (const gid of row) if (gid) m[gid] = tid
    }
    return m
  }, [seats])

  const derived = React.useMemo(() => {
    let seatedCount = 0
    let attendingCount = 0
    let seatedAttending = 0
    const unseatedAttending: string[] = []
    const unseatedOther: string[] = []
    for (const g of GUESTS) {
      const seated = tableOf[g.id] !== null
      if (seated) seatedCount++
      if (g.rsvp === "yes") {
        attendingCount++
        if (seated) seatedAttending++
        else unseatedAttending.push(g.id)
      } else if (canSeat(g) && !seated) {
        unseatedOther.push(g.id)
      }
    }
    const capacity = TABLES.reduce((n, t) => n + t.seats, 0)
    return { seatedCount, attendingCount, seatedAttending, unseatedAttending, unseatedOther, capacity }
  }, [tableOf])

  const rules = React.useMemo(() => evaluateRules(tableOf), [tableOf])
  const brokenRules = React.useMemo(() => rules.filter((r) => r.status === "broken"), [rules])
  const brokenTables = React.useMemo(() => {
    const s = new Set<string>()
    for (const r of brokenRules) for (const t of r.tables) s.add(t)
    return s
  }, [brokenRules])

  const announce = React.useCallback((msg: string) => setAnnouncement(msg), [])

  const place = React.useCallback(
    (guestId: string, tableId: string, seatIdx?: number) => {
      const guest = GUESTS_BY_ID[guestId]
      const table = TABLES_BY_ID[tableId]
      if (!guest || !table) return
      if (!canSeat(guest)) {
        toaster.create({ title: `${guest.name} has declined`, description: "Declined guests are not seated.", type: "warning" })
        return
      }
      const cur = seatsRef.current
      const next: Seats = {}
      for (const k of Object.keys(cur)) next[k] = cur[k].slice()

      let srcTable: string | null = null
      let srcSeat = -1
      for (const k of Object.keys(next)) {
        const i = next[k].indexOf(guestId)
        if (i !== -1) {
          srcTable = k
          srcSeat = i
        }
      }

      const row = next[tableId]
      let target = seatIdx ?? row.indexOf(null)
      if (target === -1) {
        if (srcTable === tableId) return
        toaster.create({ title: `${table.name} is full`, description: `All ${table.seats} seats are taken. Move someone first.`, type: "warning" })
        announce(`${table.name} is full`)
        return
      }
      if (srcTable === tableId && srcSeat === target) return

      const occupant = row[target]
      let swappedWith: string | null = null
      if (occupant) {
        if (srcTable !== null) {
          next[srcTable][srcSeat] = occupant
          swappedWith = occupant
        } else {
          const free = row.indexOf(null)
          if (free === -1) {
            toaster.create({ title: `${table.name} is full`, description: `Drop on a seat you want to swap, or free one up first.`, type: "warning" })
            announce(`${table.name} is full`)
            return
          }
          target = free
        }
      } else if (srcTable !== null) {
        next[srcTable][srcSeat] = null
      }
      row[target] = guestId
      setSeats(next)
      setSelectedTable(tableId)
      setPicked(null)
      announce(
        swappedWith
          ? `${guest.name} seated at ${table.name}, seat ${target + 1}. ${GUESTS_BY_ID[swappedWith].name} moved to ${srcTable ? TABLES_BY_ID[srcTable].name : ""}.`
          : `${guest.name} seated at ${table.name}, seat ${target + 1}.`,
      )
    },
    [announce],
  )

  const unseat = React.useCallback(
    (guestId: string) => {
      const cur = seatsRef.current
      let found = false
      const next: Seats = {}
      for (const k of Object.keys(cur)) {
        next[k] = cur[k].map((x) => {
          if (x === guestId) {
            found = true
            return null
          }
          return x
        })
      }
      if (!found) return
      setSeats(next)
      setPicked(null)
      announce(`${GUESTS_BY_ID[guestId]?.name ?? "Guest"} unseated.`)
    },
    [announce],
  )

  const selectTable = React.useCallback((id: string | null) => {
    setSelectedTable(id)
    if (id) setTab("table")
  }, [])

  const pick = React.useCallback(
    (id: string | null) => {
      setPicked(id)
      if (id) announce(`${GUESTS_BY_ID[id]?.name ?? "Guest"} picked up. Choose a seat or a table.`)
    },
    [announce],
  )

  React.useEffect(() => {
    if (!picked) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPicked(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [picked])

  const startDrag = React.useCallback(
    (guestId: string, e: React.PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return
      const pid = e.pointerId
      const touch = e.pointerType === "touch"
      const sx = e.clientX
      const sy = e.clientY
      let lx = sx
      let ly = sy
      let active = false
      let timer: number | undefined

      const begin = () => {
        active = true
        ghostPos.current = { x: lx, y: ly }
        setDragGuest(guestId)
        document.body.style.userSelect = "none"
      }

      const moveGhost = () => {
        ghostPos.current = { x: lx, y: ly }
        if (ghostRef.current) {
          ghostRef.current.style.transform = `translate(${lx + 14}px, ${ly + 14}px)`
        }
      }

      const cleanup = () => {
        window.clearTimeout(timer)
        window.removeEventListener("pointermove", move)
        window.removeEventListener("pointerup", up)
        window.removeEventListener("pointercancel", cancel)
        window.removeEventListener("touchmove", block)
        document.body.style.userSelect = ""
        setDragGuest(null)
        setDropKey(null)
      }

      function move(ev: PointerEvent) {
        if (ev.pointerId !== pid) return
        lx = ev.clientX
        ly = ev.clientY
        if (!active) {
          if (Math.hypot(lx - sx, ly - sy) < 8) return
          if (touch) {
            // the finger is scrolling, not dragging
            cleanup()
            return
          }
          begin()
        }
        moveGhost()
        const t = dropTarget(lx, ly)
        setDropKey((prev) => (prev === (t?.key ?? null) ? prev : (t?.key ?? null)))
      }

      function up(ev: PointerEvent) {
        if (ev.pointerId !== pid) return
        const was = active
        const t = was ? dropTarget(ev.clientX, ev.clientY) : null
        cleanup()
        if (!was) return
        draggedRecently.current = true
        window.setTimeout(() => {
          draggedRecently.current = false
        }, 60)
        if (!t) return
        const [kind, table, seat] = t.key.split("|")
        if (kind === "seat") place(guestId, table, Number(seat))
        else if (kind === "table") place(guestId, table)
        else if (kind === "unseat") unseat(guestId)
      }

      function cancel(ev: PointerEvent) {
        if (ev.pointerId !== pid) return
        cleanup()
      }

      function block(ev: TouchEvent) {
        if (active && ev.cancelable) ev.preventDefault()
      }

      window.addEventListener("pointermove", move)
      window.addEventListener("pointerup", up)
      window.addEventListener("pointercancel", cancel)
      window.addEventListener("touchmove", block, { passive: false })
      if (touch) {
        timer = window.setTimeout(() => {
          begin()
          moveGhost()
        }, 320)
      }
    },
    [place, unseat],
  )

  const wasDragged = React.useCallback(() => draggedRecently.current, [])

  const value = React.useMemo<PlanContextValue>(
    () => ({
      seats,
      tableOf,
      ...derived,
      rules,
      brokenRules,
      brokenTables,
      selectedTable,
      selectTable,
      tab,
      setTab,
      picked,
      pick,
      place,
      unseat,
      dragGuest,
      dropKey,
      startDrag,
      wasDragged,
    }),
    [
      seats,
      tableOf,
      derived,
      rules,
      brokenRules,
      brokenTables,
      selectedTable,
      selectTable,
      tab,
      picked,
      pick,
      place,
      unseat,
      dragGuest,
      dropKey,
      startDrag,
      wasDragged,
    ],
  )

  const ghostGuest = dragGuest ? GUESTS_BY_ID[dragGuest] : null

  return (
    <PlanContext.Provider value={value}>
      {children}
      <Box
        position="absolute"
        w="1px"
        h="1px"
        overflow="hidden"
        style={{ clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}
        role="status"
        aria-live="polite"
      >
        {announcement}
      </Box>
      {ghostGuest && (
        <Box
          ref={ghostRef}
          position="fixed"
          top="0"
          left="0"
          zIndex="toast"
          pointerEvents="none"
          style={{
            transform: `translate(${ghostPos.current.x + 14}px, ${ghostPos.current.y + 14}px)`,
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            gap="2"
            px="3"
            py="1.5"
            rounded="full"
            bg={`${partyColor(ghostGuest.party)}.700`}
            color="white"
            shadow="lg"
            borderWidth="2px"
            borderColor="white"
          >
            <Text fontSize="sm" fontWeight="semibold" whiteSpace="nowrap">
              {ghostGuest.name}
            </Text>
          </Box>
        </Box>
      )}
    </PlanContext.Provider>
  )
}
```

```tsx components/ui/provider.tsx
"use client"

import { ChakraProvider, createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"

const config = defineConfig({
  globalCss: {
    body: {
      bg: "bg.subtle",
      color: "fg",
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: {
          value:
            'ui-serif, "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif',
        },
        body: {
          value:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
      },
      colors: {
        brand: {
          50: { value: "#eef7f3" },
          100: { value: "#d6ebe2" },
          200: { value: "#b0d7c7" },
          300: { value: "#82bda6" },
          400: { value: "#55a085" },
          500: { value: "#3a8569" },
          600: { value: "#2e6c55" },
          700: { value: "#265745" },
          800: { value: "#1f4538" },
          900: { value: "#17342a" },
          950: { value: "#0d1f19" },
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: { _light: "{colors.brand.700}", _dark: "{colors.brand.400}" } },
          contrast: { value: { _light: "white", _dark: "{colors.brand.950}" } },
          fg: { value: { _light: "{colors.brand.700}", _dark: "{colors.brand.200}" } },
          muted: { value: { _light: "{colors.brand.100}", _dark: "{colors.brand.900}" } },
          subtle: { value: { _light: "{colors.brand.50}", _dark: "{colors.brand.950}" } },
          emphasized: { value: { _light: "{colors.brand.200}", _dark: "{colors.brand.800}" } },
          focusRing: { value: { _light: "{colors.brand.500}", _dark: "{colors.brand.400}" } },
        },
      },
    },
  },
})

const system = createSystem(defaultConfig, config)

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}
```

```ts lib/data.ts
export type Rsvp = "yes" | "maybe" | "pending" | "no"

export interface Guest {
  id: string
  name: string
  party: string
  rsvp: Rsvp
  diet: string | null
  table: string | null
}

export type TableShape = "long" | "round"

export interface SeatTable {
  id: string
  name: string
  shape: TableShape
  seats: number
  x: number
  y: number
  rotation?: number
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

export type RuleKind = "together" | "apart" | "near"

export interface SeatingRule {
  kind: RuleKind
  guests: string[]
  note: string
}

export const APP_NAME = "Seatwise"

export const EVENT = {
  name: "Ines & Mateo's wedding dinner",
  date: "2027-06-19",
  venue: "The Orangery, Hollin Hall",
  room_m: { width: 24, depth: 14 },
}

export const PLANNER = { name: "Hannah Brook" }

export const FIXTURES: Fixture[] = [
  { id: "f-1", kind: "stage", label: "Band", x: 10, y: 0.5, w: 4, h: 2 },
  { id: "f-2", kind: "dancefloor", label: "Dance floor", x: 8.5, y: 3, w: 7, h: 4 },
  { id: "f-3", kind: "bar", label: "Bar", x: 21, y: 10, w: 2.5, h: 3.5 },
  { id: "f-4", kind: "door", label: "Garden doors", x: 0, y: 6, w: 0.5, h: 2.5 },
]

export const TABLES: SeatTable[] = [
  { id: "t-head", name: "Top table", shape: "long", seats: 8, x: 8, y: 8.2, rotation: 0 },
  { id: "t-1", name: "Table 1", shape: "round", seats: 8, x: 3, y: 2.5 },
  { id: "t-2", name: "Table 2", shape: "round", seats: 8, x: 3, y: 7 },
  { id: "t-3", name: "Table 3", shape: "round", seats: 8, x: 3, y: 11.5 },
  { id: "t-4", name: "Table 4", shape: "round", seats: 8, x: 19, y: 2.5 },
  { id: "t-5", name: "Table 5", shape: "round", seats: 8, x: 19, y: 7 },
  { id: "t-6", name: "Table 6", shape: "round", seats: 6, x: 12, y: 12 },
]

const g = (
  id: string,
  name: string,
  party: string,
  rsvp: Rsvp,
  diet: string | null,
  table: string | null,
): Guest => ({ id, name, party, rsvp, diet, table })

export const GUESTS: Guest[] = [
  g("g-01", "Ines Carvalho", "Couple", "yes", null, "t-head"),
  g("g-02", "Mateo Alvarez", "Couple", "yes", "Vegetarian", "t-head"),
  g("g-03", "Rui Carvalho", "Bride's family", "yes", null, "t-head"),
  g("g-04", "Marta Carvalho", "Bride's family", "yes", "Gluten free", "t-head"),
  g("g-05", "Javier Alvarez", "Groom's family", "yes", null, "t-head"),
  g("g-06", "Lucia Alvarez", "Groom's family", "yes", null, "t-head"),
  g("g-07", "Sofia Carvalho", "Bride's family", "yes", null, "t-1"),
  g("g-08", "Tiago Carvalho", "Bride's family", "yes", null, "t-1"),
  g("g-09", "Avó Rosa Carvalho", "Bride's family", "yes", "Soft food", "t-1"),
  g("g-10", "Pedro Nunes", "Bride's family", "yes", null, "t-1"),
  g("g-11", "Ana Nunes", "Bride's family", "yes", "Vegan", "t-1"),
  g("g-12", "Carmen Alvarez", "Groom's family", "yes", null, "t-4"),
  g("g-13", "Diego Alvarez", "Groom's family", "yes", null, "t-4"),
  g("g-14", "Elena Ruiz", "Groom's family", "yes", "Nut allergy", "t-4"),
  g("g-15", "Pablo Ruiz", "Groom's family", "yes", null, "t-4"),
  g("g-16", "Isabel Ruiz", "Groom's family", "maybe", null, null),
  g("g-17", "Chloe Martin", "University friends", "yes", null, "t-2"),
  g("g-18", "Ben Okafor", "University friends", "yes", null, "t-2"),
  g("g-19", "Leila Haddad", "University friends", "yes", "Halal", "t-2"),
  g("g-20", "Omar Haddad", "University friends", "yes", "Halal", "t-2"),
  g("g-21", "Freya Lund", "University friends", "yes", "Vegetarian", null),
  g("g-22", "Jonas Lund", "University friends", "yes", null, null),
  g("g-23", "Grace Lee", "Work friends", "yes", null, "t-5"),
  g("g-24", "Marcus Webb", "Work friends", "yes", null, "t-5"),
  g("g-25", "Nadia Petrova", "Work friends", "yes", "Pescatarian", "t-5"),
  g("g-26", "Tom Fisher", "Work friends", "no", null, null),
  g("g-27", "Hana Sato", "Work friends", "yes", null, null),
  g("g-28", "Luis Ortega", "Groom's football club", "yes", null, "t-3"),
  g("g-29", "Kai Brennan", "Groom's football club", "yes", null, "t-3"),
  g("g-30", "Sean Doyle", "Groom's football club", "yes", null, "t-3"),
  g("g-31", "Ryan Doyle", "Groom's football club", "yes", null, null),
  g("g-32", "Hugo Carvalho", "Bride's family", "yes", "Children's menu", "t-1"),
  g("g-33", "Mia Carvalho", "Bride's family", "yes", "Children's menu", null),
  g("g-34", "Paula Mendes", "Bride's family", "pending", null, null),
  g("g-35", "Victor Mendes", "Bride's family", "pending", null, null),
  g("g-36", "Zoe Bennett", "Plus-ones", "yes", null, "t-2"),
  g("g-37", "Arjun Mehta", "Plus-ones", "yes", "Vegetarian", "t-5"),
  g("g-38", "Laura Svensson", "Plus-ones", "yes", null, null),
]

export const RULES: SeatingRule[] = [
  { kind: "together", guests: ["g-21", "g-22"], note: "Couple" },
  { kind: "together", guests: ["g-32", "g-33"], note: "Siblings, under 10" },
  {
    kind: "apart",
    guests: ["g-29", "g-30"],
    note: "Brothers Sean and Ryan Doyle are not speaking",
  },
  {
    kind: "apart",
    guests: ["g-12", "g-34"],
    note: "Ask the couple: old family dispute",
  },
  {
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
  },
]

export const GUESTS_BY_ID: Record<string, Guest> = Object.fromEntries(
  GUESTS.map((x) => [x.id, x]),
)
export const TABLES_BY_ID: Record<string, SeatTable> = Object.fromEntries(
  TABLES.map((x) => [x.id, x]),
)

export const PARTIES = Array.from(new Set(GUESTS.map((x) => x.party)))
export const DIETS = Array.from(
  new Set(GUESTS.map((x) => x.diet).filter((d): d is string => d !== null)),
).sort()

export const STANDARD_MEAL = "Standard menu"

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

/** Chakra palette per party, used for seat fills and dots (shade 700 keeps white initials readable). */
export const PARTY_COLOR: Record<string, string> = {
  Couple: "pink",
  "Bride's family": "purple",
  "Groom's family": "blue",
  "University friends": "cyan",
  "Work friends": "orange",
  "Groom's football club": "green",
  "Plus-ones": "gray",
}

export function partyColor(party: string): string {
  return PARTY_COLOR[party] ?? "gray"
}

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function formatEventDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T12:00:00Z`))
}

export function canSeat(g: Guest): boolean {
  return g.rsvp !== "no"
}
```

```ts lib/geometry.ts
import type { SeatTable } from "./data"

export const SEAT_R = 0.38
export const LONG_DEPTH = 1

export interface SeatPos {
  x: number
  y: number
}

export interface TableGeometry {
  /** centre of the table in metres */
  cx: number
  cy: number
  /** round tables */
  radius: number
  /** long tables: left, top, width, height */
  rect: { x: number; y: number; w: number; h: number } | null
  seats: SeatPos[]
  /** radius of the invisible hit area around table and seats */
  hitR: number
}

export function tableGeometry(t: SeatTable): TableGeometry {
  if (t.shape === "long") {
    // x, y are the top-left corner; one seat per metre, on the room side (south).
    const w = t.seats
    const h = LONG_DEPTH
    const seats: SeatPos[] = Array.from({ length: t.seats }, (_, i) => ({
      x: t.x + 0.5 + i,
      y: t.y + h + 0.5,
    }))
    return {
      cx: t.x + w / 2,
      cy: t.y + h / 2,
      radius: 0,
      rect: { x: t.x, y: t.y, w, h },
      seats,
      hitR: 0,
    }
  }
  const radius = t.seats <= 6 ? 0.8 : 0.95
  const ring = radius + 0.5
  const seats: SeatPos[] = Array.from({ length: t.seats }, (_, i) => {
    const a = (-90 + (i * 360) / t.seats) * (Math.PI / 180)
    return { x: t.x + ring * Math.cos(a), y: t.y + ring * Math.sin(a) }
  })
  return { cx: t.x, cy: t.y, radius, rect: null, seats, hitR: ring + SEAT_R + 0.1 }
}

export function distance(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by)
}
```

```ts lib/rules.ts
import {
  FIXTURES,
  GUESTS_BY_ID,
  RULES,
  TABLES,
  TABLES_BY_ID,
  type SeatingRule,
} from "./data"
import { distance, tableGeometry } from "./geometry"

export type RuleStatus = "ok" | "broken" | "open"

export interface RuleResult {
  id: string
  rule: SeatingRule
  status: RuleStatus
  title: string
  detail: string
  /** tables to flag when the rule is broken */
  tables: string[]
  /** every table the rule's guests currently sit at */
  involved: string[]
}

/** A table is "near the garden doors" within this many metres, and "away from the band" beyond the second. */
export const NEAR_DOORS_M = 4
export const AWAY_FROM_BAND_M = 6

const doors = FIXTURES.find((f) => f.kind === "door")
const stage = FIXTURES.find((f) => f.kind === "stage")

function centre(f: { x: number; y: number; w: number; h: number } | undefined) {
  return f ? { x: f.x + f.w / 2, y: f.y + f.h / 2 } : { x: 0, y: 0 }
}

const doorC = centre(doors)
const stageC = centre(stage)

export function tableAccess(tableId: string) {
  const t = TABLES_BY_ID[tableId]
  const geo = tableGeometry(t)
  const toDoors = distance(geo.cx, geo.cy, doorC.x, doorC.y)
  const toBand = distance(geo.cx, geo.cy, stageC.x, stageC.y)
  return {
    toDoors,
    toBand,
    ok: toDoors <= NEAR_DOORS_M && toBand >= AWAY_FROM_BAND_M,
  }
}

const tn = (id: string) => TABLES_BY_ID[id]?.name ?? id
const gn = (id: string) => GUESTS_BY_ID[id]?.name ?? id
const first = (name: string) => name.split(" ")[0]

export function evaluateRules(tableOf: Record<string, string | null>): RuleResult[] {
  return RULES.map((rule, i): RuleResult => {
    const id = `rule-${i}`
    const placed = rule.guests.map((gid) => tableOf[gid] ?? null)
    const involved = Array.from(new Set(placed.filter((t): t is string => t !== null)))

    if (rule.kind === "together") {
      const [a, b] = rule.guests
      const title = `${gn(a)} and ${gn(b)} together`
      const unseated = rule.guests.filter((gid) => !tableOf[gid])
      if (unseated.length === 2) {
        return { id, rule, status: "open", title, detail: "Neither is seated yet.", tables: [], involved }
      }
      if (unseated.length === 1) {
        return {
          id,
          rule,
          status: "open",
          title,
          detail: `${first(gn(unseated[0]))} still needs a seat at ${tn(involved[0])}.`,
          tables: [],
          involved,
        }
      }
      if (involved.length === 1) {
        return { id, rule, status: "ok", title, detail: `Both at ${tn(involved[0])}.`, tables: [], involved }
      }
      return {
        id,
        rule,
        status: "broken",
        title,
        detail: `Split across ${tn(placed[0] as string)} and ${tn(placed[1] as string)}.`,
        tables: involved,
        involved,
      }
    }

    if (rule.kind === "apart") {
      const [a, b] = rule.guests
      const title = `${gn(a)} apart from ${gn(b)}`
      if (placed[0] && placed[0] === placed[1]) {
        return {
          id,
          rule,
          status: "broken",
          title,
          detail: `Both at ${tn(placed[0])}.`,
          tables: [placed[0]],
          involved,
        }
      }
      const seatedBoth = placed[0] && placed[1]
      return {
        id,
        rule,
        status: "ok",
        title,
        detail: seatedBoth
          ? `${tn(placed[0] as string)} and ${tn(placed[1] as string)}.`
          : "Not at the same table.",
        tables: [],
        involved,
      }
    }

    // near
    const gid = rule.guests[0]
    const title = `${gn(gid)} near the garden doors`
    const t = placed[0]
    const good = TABLES.filter((x) => tableAccess(x.id).ok).map((x) => x.name)
    if (!t) {
      return {
        id,
        rule,
        status: "open",
        title,
        detail: good.length ? `Not seated yet. Suitable: ${good.join(", ")}.` : "Not seated yet.",
        tables: [],
        involved,
      }
    }
    const acc = tableAccess(t)
    if (acc.ok) {
      return {
        id,
        rule,
        status: "ok",
        title,
        detail: `${tn(t)} is ${acc.toDoors.toFixed(1)} m from the doors and ${acc.toBand.toFixed(1)} m from the band.`,
        tables: [],
        involved,
      }
    }
    const why =
      acc.toDoors > NEAR_DOORS_M
        ? `${tn(t)} is ${acc.toDoors.toFixed(1)} m from the doors (keep within ${NEAR_DOORS_M} m).`
        : `${tn(t)} is only ${acc.toBand.toFixed(1)} m from the band.`
    return {
      id,
      rule,
      status: "broken",
      title,
      detail: good.length ? `${why} Try ${good.join(", ")}.` : why,
      tables: [t],
      involved,
    }
  })
}
```

