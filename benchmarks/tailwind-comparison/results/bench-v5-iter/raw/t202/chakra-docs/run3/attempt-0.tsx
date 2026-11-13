```tsx app/guests/page.tsx
import type { Metadata } from "next";
import { GuestsView } from "@/components/guests/GuestsView";

export const metadata: Metadata = {
  title: "Guests · Seatwise",
};

export default function Page() {
  return <GuestsView />;
}
```

```tsx app/layout.tsx
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { EmotionRegistry } from "@/components/ui/emotion-registry";
import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";
import { PlanProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Seatwise",
  description: "Seating planner for wedding and event planners",
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
import { PlanBoard } from "@/components/plan/PlanBoard";

export default function Page() {
  return <PlanBoard />;
}
```

```tsx components/AppShell.tsx
"use client"

import { Box, Flex, HStack, Link as ChakraLink, Text, chakra } from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { Avatar } from "@/components/ui/avatar"
import { ColorModeButton } from "@/components/ui/color-mode"
import { app, planner } from "@/lib/data"
import { usePlan } from "@/lib/store"

const NAV = [
  { href: "/", label: "Plan" },
  { href: "/guests", label: "Guests" },
]

function LogoMark() {
  // A round table with eight seats.
  return (
    <chakra.svg
      viewBox="0 0 32 32"
      boxSize="9"
      aria-hidden="true"
      color="brand.contrast"
      bg="brand.solid"
      borderRadius="lg"
      p="1.5"
    >
      <circle cx="16" cy="16" r="6" fill="currentColor" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4
        return (
          <circle
            key={i}
            cx={16 + Math.cos(a) * 11.5}
            cy={16 + Math.sin(a) * 11.5}
            r="2.4"
            fill="currentColor"
          />
        )
      })}
    </chakra.svg>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { brokenRules } = usePlan()

  return (
    <Box minH="100dvh" bg="bg.subtle" color="fg">
      <chakra.a
        href="#main"
        position="absolute"
        left="3"
        top="-100px"
        zIndex="popover"
        bg="bg.panel"
        px="3"
        py="2"
        borderRadius="md"
        borderWidth="1px"
        _focus={{ top: "3" }}
      >
        Skip to content
      </chakra.a>
      <chakra.header
        position="sticky"
        top="0"
        zIndex="sticky"
        bg="bg.panel"
        borderBottomWidth="1px"
        borderColor="border"
        _print={{ display: "none" }}
      >
        <Flex
          maxW="1680px"
          mx="auto"
          px={{ base: "3", md: "5" }}
          h="14"
          align="center"
          justify="space-between"
          gap="3"
        >
          <HStack gap="3">
            <NextLink href="/" aria-label="Seatwise, plan">
              <HStack gap="2.5">
                <LogoMark />
                <Text
                  fontFamily="heading"
                  fontWeight="semibold"
                  fontSize="xl"
                  letterSpacing="-0.01em"
                >
                  {app.name}
                </Text>
              </HStack>
            </NextLink>
          </HStack>

          <chakra.nav aria-label="Main" flex="1" ms={{ base: "1", md: "6" }}>
            <HStack gap="1">
              {NAV.map((item) => {
                const active =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
                return (
                  <ChakraLink
                    key={item.href}
                    asChild
                    px="3"
                    py="1.5"
                    borderRadius="md"
                    fontWeight="medium"
                    fontSize="sm"
                    color={active ? "brand.fg" : "fg.muted"}
                    bg={active ? "brand.subtle" : "transparent"}
                    textDecoration="none"
                    _hover={{ bg: "bg.muted", textDecoration: "none" }}
                    _focusVisible={{ outlineColor: "brand.focusRing" }}
                  >
                    <NextLink href={item.href} aria-current={active ? "page" : undefined}>
                      {item.label}
                      {item.href === "/" && brokenRules.length > 0 ? (
                        <chakra.span
                          ms="2"
                          px="1.5"
                          borderRadius="full"
                          bg="red.solid"
                          color="red.contrast"
                          fontSize="xs"
                          fontWeight="semibold"
                          aria-label={`${brokenRules.length} broken rules`}
                        >
                          {brokenRules.length}
                        </chakra.span>
                      ) : null}
                    </NextLink>
                  </ChakraLink>
                )
              })}
            </HStack>
          </chakra.nav>

          <HStack gap="2">
            <Text fontSize="sm" color="fg.muted" display={{ base: "none", md: "block" }}>
              {planner.name}
            </Text>
            <Avatar name={planner.name} size="sm" colorPalette="brand" />
            <ColorModeButton />
          </HStack>
        </Flex>
      </chakra.header>
      <Box
        as="main"
        id="main"
        maxW="1680px"
        mx="auto"
        px={{ base: "3", md: "5" }}
        py={{ base: "4", md: "5" }}
      >
        {children}
      </Box>
    </Box>
  )
}
```

```tsx components/PageHeader.tsx
"use client"

import { Button, Flex, Heading, HStack, Stack, Text } from "@chakra-ui/react"
import { MdPrint } from "react-icons/md"
import { event, planner } from "@/lib/data"
import { formatEventDate } from "@/lib/plan"

export function PageHeader({
  eyebrow,
  title,
  printLabel,
}: {
  eyebrow: string
  title: string
  printLabel: string
}) {
  return (
    <Flex
      justify="space-between"
      align={{ base: "flex-start", md: "flex-end" }}
      direction={{ base: "column", md: "row" }}
      gap="3"
    >
      <Stack gap="1">
        <Text
          fontSize="xs"
          fontWeight="semibold"
          letterSpacing="0.08em"
          textTransform="uppercase"
          color="brand.fg"
        >
          {eyebrow}
        </Text>
        <Heading as="h1" fontFamily="heading" fontWeight="semibold" size="3xl" letterSpacing="-0.01em">
          {title}
        </Heading>
        <Text color="fg.muted" fontSize="sm">
          {formatEventDate()} · {event.venue} · Planned by {planner.name}
        </Text>
      </Stack>
      <HStack _print={{ display: "none" }}>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <MdPrint />
          {printLabel}
        </Button>
      </HStack>
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
```

```tsx components/plan/GuestRow.tsx
"use client"

import { Badge, Box, Flex, HStack, IconButton, Span, Stack, Text, chakra } from "@chakra-ui/react"
import { MdDragIndicator, MdMoreVert } from "react-icons/md"
import { Avatar } from "@/components/ui/avatar"
import {
  MenuContent,
  MenuItem,
  MenuItemGroup,
  MenuRoot,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu"
import { tables, type Guest } from "@/lib/data"
import { filledCount, partyPalette, RSVP_LABEL, RSVP_PALETTE } from "@/lib/plan"
import { usePlan } from "@/lib/store"

export function DietTag({ diet }: { diet: string }) {
  return (
    <Badge colorPalette="yellow" variant="subtle" size="sm" whiteSpace="nowrap">
      {diet}
    </Badge>
  )
}

function MoveMenu({ guest, currentTableId }: { guest: Guest; currentTableId: string | null }) {
  const plan = usePlan()
  const seated = currentTableId !== null
  return (
    <MenuRoot
      positioning={{ placement: "bottom-end" }}
      onSelect={(d) => {
        if (d.value === "__unseat") plan.unseat(guest.id)
        else plan.place(guest.id, d.value)
      }}
    >
      <MenuTrigger asChild>
        <IconButton
          size="sm"
          variant="ghost"
          aria-label={`${seated ? "Move or unseat" : "Seat"} ${guest.name}`}
          _focusVisible={{ outlineColor: "brand.focusRing" }}
        >
          <MdMoreVert />
        </IconButton>
      </MenuTrigger>
      <MenuContent minW="13rem">
        <MenuItemGroup title={seated ? "Move to" : "Seat at"}>
          {tables.map((t) => {
            const free = t.seats - filledCount(plan.seats[t.id])
            const here = t.id === currentTableId
            return (
              <MenuItem key={t.id} value={t.id} disabled={here || free === 0}>
                {t.name}
                <Span ms="auto" color="fg.muted" fontSize="xs">
                  {here ? "current" : free === 0 ? "full" : `${free} free`}
                </Span>
              </MenuItem>
            )
          })}
        </MenuItemGroup>
        {seated ? (
          <>
            <MenuSeparator />
            <MenuItem value="__unseat" color="fg.error" _hover={{ bg: "bg.error" }}>
              Unseat
            </MenuItem>
          </>
        ) : null}
      </MenuContent>
    </MenuRoot>
  )
}

export function GuestRow({
  guest,
  seatLabel,
  showParty = true,
}: {
  guest: Guest
  seatLabel?: string
  showParty?: boolean
}) {
  const plan = usePlan()
  const pos = plan.positions[guest.id]
  const armed = plan.armedGuestId === guest.id
  const focused = plan.focusGuestId === guest.id
  const flagged = plan.flaggedGuests.has(guest.id)
  const palette = partyPalette(guest.party)
  const sub = [showParty ? guest.party : null, seatLabel ?? null].filter(Boolean).join(" · ")

  return (
    <Flex
      align="center"
      gap="1"
      borderWidth="1px"
      borderColor={armed ? "brand.solid" : flagged ? "red.emphasized" : focused ? "brand.emphasized" : "border"}
      bg={armed ? "brand.subtle" : focused ? "brand.subtle" : "bg.panel"}
      borderRadius="lg"
      ps="1"
      pe="1"
      transition="background 120ms, border-color 120ms"
    >
      <Box color="fg.subtle" display={{ base: "none", md: "block" }} aria-hidden="true" ps="1">
        <MdDragIndicator />
      </Box>
      <Box aria-hidden="true" ps="1" pe="1">
        <Avatar name={guest.name} size="sm" colorPalette={palette} />
      </Box>
      <chakra.button
        type="button"
        flex="1"
        minW="0"
        display="flex"
        alignItems="center"
        gap="2.5"
        textAlign="start"
        py="2"
        borderRadius="md"
        cursor="grab"
        draggable
        aria-pressed={armed}
        _focusVisible={{ outline: "2px solid", outlineColor: "brand.focusRing", outlineOffset: "1px" }}
        onClick={() => plan.armGuest(armed ? null : guest.id)}
        onDragStart={(e: React.DragEvent) => {
          e.dataTransfer.setData("text/plain", guest.id)
          e.dataTransfer.effectAllowed = "move"
          plan.setDragGuest(guest.id)
        }}
        onDragEnd={() => plan.setDragGuest(null)}
      >
        <Stack as="span" gap="0.5" minW="0" flex="1">
          <Text as="span" display="block" fontWeight="medium" fontSize="sm" truncate>
            {guest.name}
          </Text>
          <HStack as="span" gap="1.5" wrap="wrap">
            {sub ? (
              <Text as="span" fontSize="xs" color="fg.muted" truncate>
                {sub}
              </Text>
            ) : null}
            {guest.rsvp !== "yes" ? (
              <Badge size="xs" colorPalette={RSVP_PALETTE[guest.rsvp]} variant="subtle">
                {RSVP_LABEL[guest.rsvp]}
              </Badge>
            ) : null}
            {guest.diet ? <DietTag diet={guest.diet} /> : null}
            {flagged ? (
              <Badge size="xs" colorPalette="red" variant="solid">
                Rule broken
              </Badge>
            ) : null}
          </HStack>
        </Stack>
      </chakra.button>
      <MoveMenu guest={guest} currentTableId={pos?.tableId ?? null} />
    </Flex>
  )
}
```

```tsx components/plan/PlanBoard.tsx
"use client"

import { Box, Button, Flex, Grid, Heading, HStack, Stack, Text } from "@chakra-ui/react"
import * as React from "react"
import { Alert } from "@/components/ui/alert"
import { PageHeader } from "@/components/PageHeader"
import { event } from "@/lib/data"
import { guestById, PARTIES, partyPalette, ROOM } from "@/lib/plan"
import { usePlan } from "@/lib/store"
import { RoomMap } from "./RoomMap"
import { SidePanel } from "./SidePanel"
import { StatsBar } from "./StatsBar"

function RulesBanner() {
  const plan = usePlan()
  const { brokenRules, ruleResults } = plan
  const waiting = ruleResults.filter((r) => r.status === "open").length

  if (brokenRules.length === 0) {
    return (
      <Alert
        status="success"
        variant="subtle"
        title={
          waiting > 0
            ? `No rules broken. ${waiting} ${waiting === 1 ? "rule is" : "rules are"} waiting for guests to be seated.`
            : "All of the couple's rules are kept."
        }
      />
    )
  }
  return (
    <Alert
      status="error"
      variant="subtle"
      title={`${brokenRules.length} of the couple's ${brokenRules.length === 1 ? "rule is" : "rules are"} broken`}
    >
      <Stack gap="1.5" as="ul" listStyleType="none" m="0" p="0">
        {brokenRules.map((r) => (
          <Flex as="li" key={r.rule.id} gap="2" align="baseline" wrap="wrap">
            <Text as="span" fontWeight="medium">
              {r.title}.
            </Text>
            <Text as="span">{r.detail}</Text>
            {r.tables[0] ? (
              <Button size="2xs" variant="outline" colorPalette="red" onClick={() => plan.selectTable(r.tables[0] ?? null)}>
                Show
              </Button>
            ) : null}
          </Flex>
        ))}
      </Stack>
    </Alert>
  )
}

function PickupBar() {
  const plan = usePlan()
  const guest = plan.armedGuestId ? guestById[plan.armedGuestId] : undefined
  if (!guest) return null
  const seated = plan.positions[guest.id]
  return (
    <Flex
      role="status"
      align="center"
      justify="space-between"
      gap="3"
      bg="brand.solid"
      color="brand.contrast"
      px="4"
      py="2.5"
      borderRadius="lg"
      position="sticky"
      top="64px"
      zIndex="docked"
      shadow="md"
    >
      <Text fontSize="sm" fontWeight="medium">
        {seated ? "Moving" : "Placing"} {guest.name}: tap a table or an empty seat on the plan, or a seat to swap.
      </Text>
      <HStack>
        <Button size="xs" variant="surface" colorPalette="gray" onClick={() => plan.armGuest(null)}>
          Cancel
        </Button>
      </HStack>
    </Flex>
  )
}

function Legend() {
  return (
    <HStack gap="3" wrap="wrap" fontSize="xs" color="fg.muted" aria-label="Legend" role="group">
      {PARTIES.map((p) => (
        <HStack key={p} gap="1.5">
          <Box boxSize="3" borderRadius="full" bg={`${partyPalette(p)}.solid`} aria-hidden="true" />
          <Text as="span">{p}</Text>
        </HStack>
      ))}
      <HStack gap="1.5">
        <Box boxSize="3" borderRadius="full" bg="yellow.400" aria-hidden="true" />
        <Text as="span">Dietary need</Text>
      </HStack>
      <HStack gap="1.5">
        <Box boxSize="3" borderRadius="full" borderWidth="1.5px" borderStyle="dashed" borderColor="border.emphasized" aria-hidden="true" />
        <Text as="span">Empty seat</Text>
      </HStack>
      <HStack gap="1.5">
        <Box boxSize="3" borderRadius="full" outline="2px solid" outlineColor="red.solid" aria-hidden="true" />
        <Text as="span">Broken rule</Text>
      </HStack>
    </HStack>
  )
}

export function PlanBoard() {
  const plan = usePlan()
  const { armedGuestId, armGuest } = plan

  React.useEffect(() => {
    if (!armedGuestId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") armGuest(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [armedGuestId, armGuest])

  return (
    <Stack gap="4">
      <PageHeader eyebrow="Seating plan" title={event.name} printLabel="Print plan" />
      <StatsBar />
      <RulesBanner />
      <PickupBar />
      <Grid
        templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 380px" }}
        gap="4"
        alignItems="start"
      >
        <Stack
          gap="3"
          bg="bg.panel"
          borderWidth="1px"
          borderColor="border"
          borderRadius="xl"
          shadow="xs"
          p={{ base: "3", md: "4" }}
          minW="0"
        >
          <Flex justify="space-between" align={{ base: "flex-start", md: "center" }} direction={{ base: "column", md: "row" }} gap="2">
            <Box>
              <Heading as="h2" fontFamily="heading" size="lg" fontWeight="semibold">
                The room
              </Heading>
              <Text fontSize="sm" color="fg.muted">
                {event.venue}, {ROOM.width} m × {ROOM.depth} m, drawn to scale
              </Text>
            </Box>
          </Flex>
          <Legend />
          <RoomMap />
        </Stack>
        <SidePanel />
      </Grid>
    </Stack>
  )
}
```

```tsx components/plan/RoomMap.tsx
"use client"

import { Box, Text, chakra } from "@chakra-ui/react"
import * as React from "react"
import { fixtures, tables, type Fixture } from "@/lib/data"
import { ROOM } from "@/lib/plan"
import { TableView } from "./TableView"

const px = (m: number) => `${(m / ROOM.width) * 100}%`
const py = (m: number) => `${(m / ROOM.depth) * 100}%`

const FIXTURE_STYLE: Record<
  Fixture["kind"],
  { bg: string; color: string; borderColor: string; borderStyle?: string }
> = {
  stage: { bg: "bg.inverted", color: "fg.inverted", borderColor: "bg.inverted" },
  dancefloor: { bg: "brand.muted", color: "brand.fg", borderColor: "brand.emphasized", borderStyle: "dashed" },
  bar: { bg: "orange.muted", color: "orange.fg", borderColor: "orange.emphasized" },
  door: { bg: "green.solid", color: "green.fg", borderColor: "green.solid" },
}

function gridPath(): string {
  let d = ""
  for (let i = 1; i < ROOM.width; i++) d += `M${i} 0V${ROOM.depth}`
  for (let j = 1; j < ROOM.depth; j++) d += `M0 ${j}H${ROOM.width}`
  return d
}

function FixtureView({ f }: { f: Fixture }) {
  const s = FIXTURE_STYLE[f.kind]
  if (f.kind === "door") {
    return (
      <>
        <Box
          position="absolute"
          left={px(f.x)}
          top={py(f.y)}
          w={px(f.w)}
          h={py(f.h)}
          bg={s.bg}
          borderRadius="sm"
          zIndex="1"
          title={f.label}
        />
        <Text
          position="absolute"
          left={px(f.x + f.w + 0.08)}
          top={py(f.y)}
          h={py(f.h)}
          fontSize="max(9px, 1cqw)"
          fontWeight="semibold"
          color={s.color}
          css={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          whiteSpace="nowrap"
          zIndex="1"
        >
          {f.label}
        </Text>
      </>
    )
  }
  return (
    <Box
      position="absolute"
      left={px(f.x)}
      top={py(f.y)}
      w={px(f.w)}
      h={py(f.h)}
      bg={s.bg}
      color={s.color}
      borderWidth="1.5px"
      borderColor={s.borderColor}
      borderStyle={s.borderStyle ?? "solid"}
      borderRadius={f.kind === "dancefloor" ? "lg" : "md"}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      lineHeight="1.2"
      zIndex="0"
    >
      <Text as="span" fontWeight="semibold" fontSize="max(10px, 1.3cqw)" fontFamily={f.kind === "dancefloor" ? "heading" : undefined}>
        {f.label}
      </Text>
      <Text as="span" fontSize="max(9px, 0.95cqw)" opacity={0.8}>
        {f.w} × {f.h} m
      </Text>
    </Box>
  )
}

export function RoomMap() {
  const [overTableId, setOverTableId] = React.useState<string | null>(null)

  return (
    <Box
      overflowX="auto"
      borderRadius="lg"
      tabIndex={0}
      role="region"
      aria-label="Room plan, scrollable"
      _focusVisible={{ outline: "2px solid", outlineColor: "brand.focusRing" }}
    >
      <Box
        position="relative"
        minW="780px"
        w="100%"
        bg="bg.subtle"
        borderRadius="md"
        css={{ containerType: "inline-size", aspectRatio: `${ROOM.width} / ${ROOM.depth}` }}
        role="group"
        aria-label={`Room, ${ROOM.width} by ${ROOM.depth} metres, drawn to scale`}
      >
        <chakra.svg
          position="absolute"
          inset="0"
          w="100%"
          h="100%"
          color="border.muted"
          viewBox={`0 0 ${ROOM.width} ${ROOM.depth}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={gridPath()} stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" fill="none" />
        </chakra.svg>
        <Box
          position="absolute"
          inset="0"
          borderWidth="3px"
          borderColor="border.emphasized"
          borderRadius="md"
          pointerEvents="none"
          zIndex="0"
        />

        {fixtures.map((f) => (
          <FixtureView key={f.id} f={f} />
        ))}

        <Box
          position="absolute"
          left={px(5.5)}
          top={py(12.7)}
          w={px(4.2)}
          color="fg.muted"
          fontSize="max(9px, 0.95cqw)"
          lineHeight="1.2"
          pointerEvents="none"
          aria-hidden="true"
        >
          <Box h="6px" borderWidth="0 2px 2px 2px" borderStyle="solid" borderColor="fg.muted" />
          <Text mt="0.5" textAlign="center" as="span" display="block">
            4 m · room {ROOM.width} × {ROOM.depth} m
          </Text>
        </Box>

        {tables.map((t) => (
          <TableView key={t.id} table={t} overTableId={overTableId} setOverTableId={setOverTableId} />
        ))}
      </Box>
    </Box>
  )
}
```

```tsx components/plan/RulesList.tsx
"use client"

import { Badge, Box, Button, Flex, Stack, Text } from "@chakra-ui/react"
import { MdCheckCircle, MdSchedule, MdWarning } from "react-icons/md"
import { tableById, type RuleResult } from "@/lib/plan"
import { usePlan } from "@/lib/store"

const STATUS = {
  broken: { label: "Broken", palette: "red", Icon: MdWarning },
  kept: { label: "Kept", palette: "green", Icon: MdCheckCircle },
  open: { label: "Waiting", palette: "gray", Icon: MdSchedule },
} as const

export function RuleCard({ result, compact = false }: { result: RuleResult; compact?: boolean }) {
  const plan = usePlan()
  const s = STATUS[result.status]
  const first = result.tables[0]
  return (
    <Flex
      gap="3"
      p="3"
      borderWidth="1px"
      borderColor={result.status === "broken" ? "red.emphasized" : "border"}
      borderStartWidth="4px"
      borderStartColor={`${s.palette}.solid`}
      bg={result.status === "broken" ? "red.subtle" : "bg.panel"}
      borderRadius="lg"
      align="flex-start"
    >
      <Box color={`${s.palette}.fg`} mt="0.5" fontSize="lg" aria-hidden="true">
        <s.Icon />
      </Box>
      <Stack gap="1" flex="1" minW="0">
        <Flex gap="2" align="center" wrap="wrap">
          <Text fontWeight="semibold" fontSize="sm">
            {result.title}
          </Text>
          <Badge colorPalette={s.palette} variant={result.status === "broken" ? "solid" : "subtle"} size="xs">
            {s.label}
          </Badge>
        </Flex>
        <Text fontSize="sm" color={result.status === "broken" ? "fg" : "fg.muted"}>
          {result.detail}
        </Text>
        {!compact ? (
          <Text fontSize="xs" color="fg.muted" fontStyle="italic">
            Couple's note: {result.rule.note}
          </Text>
        ) : null}
        {first && !compact ? (
          <Box pt="1">
            <Button
              size="xs"
              variant="outline"
              onClick={() => plan.selectTable(first)}
              aria-label={`Show ${tableById[first]?.name ?? "table"} on the plan`}
            >
              Show {tableById[first]?.name}
            </Button>
          </Box>
        ) : null}
      </Stack>
    </Flex>
  )
}

export function RulesList() {
  const { ruleResults } = usePlan()
  const order = { broken: 0, open: 1, kept: 2 } as const
  const sorted = [...ruleResults].sort((a, b) => order[a.status] - order[b.status])
  return (
    <Stack gap="2">
      <Text fontSize="sm" color="fg.muted">
        Checked every time a guest is seated, moved or unseated. A rule waits until the guests it names
        have seats.
      </Text>
      {sorted.map((r) => (
        <RuleCard key={r.rule.id} result={r} />
      ))}
    </Stack>
  )
}
```

```tsx components/plan/SidePanel.tsx
"use client"

import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Progress,
  Stack,
  Tabs,
  Text,
  chakra,
} from "@chakra-ui/react"
import { MdCheckCircle } from "react-icons/md"
import { EmptyState } from "@/components/ui/empty-state"
import { tables } from "@/lib/data"
import { filledCount, guestById } from "@/lib/plan"
import { usePlan, type PanelTab } from "@/lib/store"
import { GuestRow } from "./GuestRow"
import { RuleCard, RulesList } from "./RulesList"

function SectionTitle({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <Flex align="center" gap="2" pt="1">
      <Heading as="h3" size="sm" fontWeight="semibold">
        {children}
      </Heading>
      {count !== undefined ? (
        <Badge variant="subtle" size="sm">
          {count}
        </Badge>
      ) : null}
    </Flex>
  )
}

function UnseatedTab() {
  const plan = usePlan()
  const { unseated, awaiting } = plan.counts
  return (
    <Stack gap="3">
      <Text fontSize="sm" color="fg.muted">
        Drag a guest onto a table, or tap a guest and then a table or seat. The menu on each guest seats
        them at any table with room.
      </Text>
      <SectionTitle count={unseated.length}>Attending, no seat yet</SectionTitle>
      {unseated.length === 0 ? (
        <EmptyState
          size="sm"
          icon={<MdCheckCircle />}
          title="Everyone attending has a seat"
          description="Drag a guest off a table to unseat them."
        />
      ) : (
        <Stack gap="2" as="ul" listStyleType="none" m="0" p="0">
          {unseated.map((g) => (
            <chakra.li key={g.id}>
              <GuestRow guest={g} />
            </chakra.li>
          ))}
        </Stack>
      )}
      {awaiting.length > 0 ? (
        <>
          <SectionTitle count={awaiting.length}>Awaiting reply</SectionTitle>
          <Text fontSize="xs" color="fg.muted">
            Not confirmed yet. You can hold a seat for them.
          </Text>
          <Stack gap="2" as="ul" listStyleType="none" m="0" p="0">
            {awaiting.map((g) => (
              <chakra.li key={g.id}>
                <GuestRow guest={g} />
              </chakra.li>
            ))}
          </Stack>
        </>
      ) : null}
    </Stack>
  )
}

function TablesOverview() {
  const plan = usePlan()
  return (
    <Stack gap="2">
      <Text fontSize="sm" color="fg.muted">
        Select a table on the plan, or here, to see who sits there and what they eat.
      </Text>
      <Stack gap="2" as="ul" listStyleType="none" m="0" p="0">
        {tables.map((t) => {
          const filled = filledCount(plan.seats[t.id])
          const flagged = plan.flaggedTables[t.id] ?? 0
          return (
            <chakra.li key={t.id}>
              <chakra.button
                type="button"
                w="100%"
                textAlign="start"
                p="3"
                borderWidth="1px"
                borderColor={flagged > 0 ? "red.emphasized" : "border"}
                borderRadius="lg"
                bg="bg.panel"
                _hover={{ bg: "bg.muted" }}
                _focusVisible={{ outline: "2px solid", outlineColor: "brand.focusRing" }}
                onClick={() => plan.selectTable(t.id)}
                aria-label={`${t.name}, ${filled} of ${t.seats} seats filled${flagged > 0 ? ", rule broken" : ""}`}
              >
                <Flex justify="space-between" align="center" mb="2" aria-hidden="true">
                  <Text as="span" fontWeight="semibold" fontSize="sm">
                    {t.name}
                  </Text>
                  <HStack as="span" gap="2">
                    {flagged > 0 ? (
                      <Badge colorPalette="red" size="xs" variant="solid">
                        Rule broken
                      </Badge>
                    ) : null}
                    <Text as="span" fontSize="sm" color="fg.muted">
                      {filled} / {t.seats}
                    </Text>
                  </HStack>
                </Flex>
                <Progress.Root
                  value={(filled / t.seats) * 100}
                  size="xs"
                  colorPalette={filled === t.seats ? "green" : "brand"}
                  aria-hidden="true"
                >
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
              </chakra.button>
            </chakra.li>
          )
        })}
      </Stack>
    </Stack>
  )
}

function TableDetail({ tableId }: { tableId: string }) {
  const plan = usePlan()
  const table = tables.find((t) => t.id === tableId)
  if (!table) return null
  const row = plan.seats[tableId] ?? []
  const filled = filledCount(row)
  const seated = row.map((gid) => (gid ? guestById[gid] : undefined))
  const dietCounts = new Map<string, number>()
  for (const g of seated) if (g?.diet) dietCounts.set(g.diet, (dietCounts.get(g.diet) ?? 0) + 1)
  const broken = plan.brokenRules.filter((r) => r.flagTables.includes(tableId))

  return (
    <Stack gap="3">
      <Flex justify="space-between" align="flex-start" gap="2">
        <Box>
          <Heading as="h3" fontFamily="heading" size="xl" fontWeight="semibold">
            {table.name}
          </Heading>
          <Text fontSize="sm" color="fg.muted">
            {filled} of {table.seats} seats filled
            {table.seats - filled > 0 ? ` · ${table.seats - filled} free` : " · full"}
          </Text>
        </Box>
        <Button size="xs" variant="ghost" onClick={() => plan.selectTable(null)}>
          All tables
        </Button>
      </Flex>

      <Progress.Root
        value={(filled / table.seats) * 100}
        size="sm"
        colorPalette={filled === table.seats ? "green" : "brand"}
        aria-label={`${table.name} is ${filled} of ${table.seats} seats filled`}
      >
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>

      {broken.map((r) => (
        <RuleCard key={r.rule.id} result={r} compact />
      ))}

      <Box borderWidth="1px" borderColor="border" borderRadius="lg" p="3" bg="bg.subtle">
        <Text fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="0.06em" mb="1.5">
          Dietary needs at this table
        </Text>
        {dietCounts.size === 0 ? (
          <Text fontSize="sm" color="fg.muted">
            None recorded.
          </Text>
        ) : (
          <HStack gap="1.5" wrap="wrap">
            {Array.from(dietCounts.entries()).map(([diet, n]) => (
              <Badge key={diet} colorPalette="yellow" variant="subtle">
                {diet}
                {n > 1 ? ` × ${n}` : ""}
              </Badge>
            ))}
          </HStack>
        )}
      </Box>

      <Stack gap="2" as="ul" listStyleType="none" m="0" p="0">
        {row.map((gid, i) => {
          const g = gid ? guestById[gid] : undefined
          return (
            <chakra.li key={i}>
              {g ? (
                <GuestRow guest={g} seatLabel={`Seat ${i + 1}`} />
              ) : (
                <chakra.button
                  type="button"
                  w="100%"
                  textAlign="start"
                  px="3"
                  py="2.5"
                  borderWidth="1px"
                  borderStyle="dashed"
                  borderColor={plan.armedGuestId ? "brand.solid" : "border.emphasized"}
                  borderRadius="lg"
                  color="fg.muted"
                  fontSize="sm"
                  bg={plan.armedGuestId ? "brand.subtle" : "transparent"}
                  cursor={plan.armedGuestId ? "pointer" : "default"}
                  aria-disabled={!plan.armedGuestId}
                  aria-label={`${table.name}, seat ${i + 1}: empty${plan.armedGuestId ? ". Press to seat the picked-up guest here." : ""}`}
                  _focusVisible={{ outline: "2px solid", outlineColor: "brand.focusRing" }}
                  onClick={() => {
                    if (plan.armedGuestId) plan.place(plan.armedGuestId, tableId, i)
                  }}
                >
                  <span aria-hidden="true">
                    Seat {i + 1} · empty
                    {plan.armedGuestId ? " · tap to seat here" : ""}
                  </span>
                </chakra.button>
              )}
            </chakra.li>
          )
        })}
      </Stack>
    </Stack>
  )
}

export function SidePanel() {
  const plan = usePlan()
  const dragSeated = plan.dragGuestId !== null && plan.positions[plan.dragGuestId] !== undefined

  return (
    <Box
      bg="bg.panel"
      borderWidth="1px"
      borderColor={dragSeated ? "brand.solid" : "border"}
      borderStyle={dragSeated ? "dashed" : "solid"}
      borderRadius="xl"
      shadow="xs"
      position={{ base: "static", lg: "sticky" }}
      top="72px"
      alignSelf="start"
      maxH={{ base: "none", lg: "calc(100dvh - 88px)" }}
      overflowY={{ base: "visible", lg: "auto" }}
      onDragOver={(e: React.DragEvent) => {
        if (dragSeated) {
          e.preventDefault()
          e.dataTransfer.dropEffect = "move"
        }
      }}
      onDrop={(e: React.DragEvent) => {
        e.preventDefault()
        const gid = plan.dragGuestId ?? e.dataTransfer.getData("text/plain")
        plan.setDragGuest(null)
        if (gid && plan.positions[gid]) plan.unseat(gid)
      }}
    >
      <Tabs.Root
        value={plan.tab}
        onValueChange={(e) => plan.setTab(e.value as PanelTab)}
        variant="line"
        size="sm"
        fitted
      >
        <Tabs.List position="sticky" top="0" bg="bg.panel" zIndex="1" borderTopRadius="xl">
          <Tabs.Trigger value="unseated">
            Unseated
            <Badge size="xs" colorPalette={plan.counts.unseated.length ? "brand" : "gray"}>
              {plan.counts.unseated.length}
            </Badge>
          </Tabs.Trigger>
          <Tabs.Trigger value="table">Table</Tabs.Trigger>
          <Tabs.Trigger value="rules">
            Rules
            <Badge size="xs" colorPalette={plan.brokenRules.length ? "red" : "gray"} variant={plan.brokenRules.length ? "solid" : "subtle"}>
              {plan.brokenRules.length}
            </Badge>
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="unseated" p="3">
          {dragSeated ? (
            <Text fontSize="sm" fontWeight="medium" color="brand.fg" mb="3">
              Drop here to unseat this guest.
            </Text>
          ) : null}
          <UnseatedTab />
        </Tabs.Content>
        <Tabs.Content value="table" p="3">
          {plan.selectedTableId ? <TableDetail tableId={plan.selectedTableId} /> : <TablesOverview />}
        </Tabs.Content>
        <Tabs.Content value="rules" p="3">
          <RulesList />
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  )
}
```

```tsx components/plan/StatsBar.tsx
"use client"

import { Box, Progress, SimpleGrid, Stack, Text } from "@chakra-ui/react"
import { tables } from "@/lib/data"
import { usePlan } from "@/lib/store"

function StatCard({
  label,
  value,
  caption,
  tone,
  children,
}: {
  label: string
  value: React.ReactNode
  caption: React.ReactNode
  tone?: "default" | "alert" | "ok"
  children?: React.ReactNode
}) {
  const accent =
    tone === "alert" ? "red.fg" : tone === "ok" ? "green.fg" : "fg"
  return (
    <Stack
      gap="1"
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      borderRadius="xl"
      px="4"
      py="3"
      shadow="xs"
    >
      <Text fontSize="xs" fontWeight="medium" color="fg.muted" textTransform="uppercase" letterSpacing="0.06em">
        {label}
      </Text>
      <Text fontSize="3xl" fontWeight="semibold" lineHeight="1.1" color={accent} fontFamily="heading">
        {value}
      </Text>
      <Text fontSize="sm" color="fg.muted">
        {caption}
      </Text>
      {children}
    </Stack>
  )
}

export function StatsBar() {
  const { counts, ruleResults, brokenRules } = usePlan()
  const waiting = ruleResults.filter((r) => r.status === "open").length
  const kept = ruleResults.filter((r) => r.status === "kept").length
  const pct = counts.attending === 0 ? 0 : Math.round((counts.attendingSeated / counts.attending) * 100)

  return (
    <SimpleGrid columns={{ base: 2, lg: 4 }} gap={{ base: "2", md: "3" }} aria-label="Seating counts" role="group">
      <StatCard
        label="Seated"
        value={counts.seated}
        caption={`${counts.attendingSeated} of ${counts.attending} attending guests`}
      >
        <Progress.Root value={pct} size="xs" colorPalette="brand" aria-label={`${pct} percent of attending guests seated`}>
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
      </StatCard>
      <StatCard
        label="Unseated"
        value={counts.unseated.length}
        tone={counts.unseated.length === 0 ? "ok" : "default"}
        caption={
          counts.awaiting.length > 0
            ? `attending, plus ${counts.awaiting.length} awaiting reply`
            : "attending guests without a seat"
        }
      />
      <StatCard
        label="Free seats"
        value={counts.freeSeats}
        caption={`of ${counts.totalSeats} seats at ${tables.length} tables`}
      />
      <StatCard
        label="Couple's rules"
        value={brokenRules.length === 0 ? "All clear" : `${brokenRules.length} broken`}
        tone={brokenRules.length > 0 ? "alert" : "ok"}
        caption={
          <Box as="span">
            {kept} kept · {waiting} waiting on seats
          </Box>
        }
      />
    </SimpleGrid>
  )
}
```

```tsx components/plan/TableView.tsx
"use client"

import { Box, Stack, Text, chakra } from "@chakra-ui/react"
import * as React from "react"
import { MdWarning } from "react-icons/md"
import { Tooltip } from "@/components/ui/tooltip"
import type { TableDef } from "@/lib/data"
import {
  filledCount,
  guestById,
  initials,
  partyPalette,
  tableGeometry,
} from "@/lib/plan"
import { usePlan } from "@/lib/store"

const pct = (m: number, total: number) => `${(m / total) * 100}%`

export function TableView({
  table,
  overTableId,
  setOverTableId,
}: {
  table: TableDef
  overTableId: string | null
  setOverTableId: (id: string | null) => void
}) {
  const plan = usePlan()
  const g = tableGeometry(table)
  const row = plan.seats[table.id] ?? []
  const filled = filledCount(row)
  const full = filled >= table.seats
  const selected = plan.selectedTableId === table.id
  const flagged = plan.flaggedTables[table.id] ?? 0
  const dragging = plan.dragGuestId !== null
  const armed = plan.armedGuestId !== null
  const over = overTableId === table.id
  const hasRoom = !full
  const hint = (dragging || armed) && hasRoom
  const round = table.shape === "round"

  const status = [
    `${filled} of ${table.seats} seats filled`,
    flagged > 0 ? `${flagged} broken ${flagged === 1 ? "rule" : "rules"}` : null,
  ]
    .filter(Boolean)
    .join(", ")

  const onDragOver = (e: React.DragEvent) => {
    if (!plan.dragGuestId) return
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (overTableId !== table.id) setOverTableId(table.id)
  }
  const onDrop = (e: React.DragEvent, seat?: number) => {
    e.preventDefault()
    const gid = plan.dragGuestId ?? e.dataTransfer.getData("text/plain")
    plan.setDragGuest(null)
    setOverTableId(null)
    if (gid) plan.place(gid, table.id, seat)
  }

  const borderColor = flagged > 0 ? "red.solid" : selected ? "brand.solid" : over ? "brand.solid" : hint ? "brand.emphasized" : "border.emphasized"

  return (
    <Box
      position="absolute"
      left={pct(g.left, 24)}
      top={pct(g.top, 14)}
      w={pct(g.w, 24)}
      h={pct(g.h, 14)}
      pointerEvents="none"
      data-table={table.id}
    >
      <chakra.button
        type="button"
        position="absolute"
        inset="0"
        pointerEvents="auto"
        cursor="pointer"
        aria-label={`${table.name} ${filled} / ${table.seats}, ${status}${armed ? ". Press to seat the picked-up guest here." : ""}`}
        aria-pressed={selected}
        borderRadius={round ? "full" : "2xl"}
        borderWidth="2px"
        borderStyle={over || (hint && !selected) ? "dashed" : "solid"}
        borderColor={borderColor}
        bg={over ? "brand.muted" : selected ? "brand.subtle" : "bg.panel/70"}
        outline={selected && flagged > 0 ? "2px solid" : undefined}
        outlineColor="brand.solid"
        outlineOffset="2px"
        transition="background 120ms, border-color 120ms"
        _hover={{ bg: selected ? "brand.subtle" : "bg.panel", borderColor: flagged > 0 ? "red.solid" : "brand.emphasized" }}
        _focusVisible={{ outline: "3px solid", outlineColor: "brand.focusRing", outlineOffset: "2px" }}
        onClick={() => {
          if (plan.armedGuestId) plan.place(plan.armedGuestId, table.id)
          else plan.selectTable(table.id)
        }}
        onDragOver={onDragOver}
        onDragLeave={() => {
          if (overTableId === table.id) setOverTableId(null)
        }}
        onDrop={(e: React.DragEvent) => onDrop(e)}
      />
      <Box
          position="absolute"
          left={pct(g.body.x, g.w)}
          top={pct(g.body.y, g.h)}
          w={pct(g.body.w, g.w)}
          h={pct(g.body.h, g.h)}
          bg="bg.panel"
          borderWidth="1px"
          borderColor="border.emphasized"
          borderRadius={round ? "full" : "lg"}
          shadow="xs"
          display="flex"
          alignItems="center"
          justifyContent="center"
          pointerEvents="auto"
          cursor="pointer"
          aria-hidden="true"
          onClick={() => {
            if (plan.armedGuestId) plan.place(plan.armedGuestId, table.id)
            else plan.selectTable(table.id)
          }}
          onDragOver={onDragOver}
          onDrop={(e: React.DragEvent) => onDrop(e)}
        >
          <Stack as="span" gap="0" align="center" lineHeight="1.15" textAlign="center">
            <Text as="span" display="block" fontWeight="semibold" fontSize="max(10px, 1.2cqw)" color="fg" whiteSpace="nowrap">
              {table.name}
            </Text>
            <Text
              as="span"
              display="block"
              fontSize="max(9px, 1.05cqw)"
              color={full ? "green.fg" : "fg.muted"}
              fontWeight="medium"
              whiteSpace="nowrap"
            >
              {filled} / {table.seats}
            </Text>
          </Stack>
      </Box>

      {flagged > 0 ? (
        <Box
          position="absolute"
          top="0"
          right="0"
          boxSize="max(16px, 1.9cqw)"
          borderRadius="full"
          bg="red.solid"
          color="red.contrast"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="max(10px, 1.2cqw)"
          pointerEvents="none"
          zIndex="2"
          aria-hidden="true"
        >
          <MdWarning />
        </Box>
      ) : null}

      {g.seatCentres.map((c, i) => {
        const gid = row[i] ?? null
        const guest = gid ? guestById[gid] : undefined
        const palette = guest ? partyPalette(guest.party) : "gray"
        const isFlagged = gid ? plan.flaggedGuests.has(gid) : false
        const isArmed = gid !== null && plan.armedGuestId === gid
        const isFocus = gid !== null && plan.focusGuestId === gid
        const label = guest
          ? `${table.name}, seat ${i + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}${isFlagged ? ", involved in a broken rule" : ""}`
          : `${table.name}, seat ${i + 1}: empty${armed ? ". Press to seat the picked-up guest here." : ""}`
        const seatButton = (
          <chakra.button
            type="button"
            colorPalette={palette}
            position="absolute"
            left={pct(c.x - g.seatSize / 2, g.w)}
            top={pct(c.y - g.seatSize / 2, g.h)}
            w={pct(g.seatSize, g.w)}
            h={pct(g.seatSize, g.h)}
            borderRadius="full"
            pointerEvents="auto"
            zIndex="1"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="max(9px, 1.05cqw)"
            fontWeight="semibold"
            lineHeight="1"
            cursor={guest ? "grab" : "pointer"}
            borderWidth="2px"
            borderStyle={guest ? "solid" : "dashed"}
            borderColor={guest ? "colorPalette.solid" : armed || dragging ? "brand.solid" : "border.emphasized"}
            bg={guest ? "colorPalette.muted" : armed || dragging ? "brand.subtle" : "bg.panel"}
            color={guest ? "colorPalette.fg" : "fg.subtle"}
            outline={isFlagged || isArmed || isFocus ? "2.5px solid" : undefined}
            outlineColor={isFlagged ? "red.solid" : "brand.solid"}
            outlineOffset="1px"
            transform={isArmed ? "scale(1.12)" : undefined}
            transition="transform 120ms, background 120ms"
            _hover={{ transform: "scale(1.1)" }}
            _focusVisible={{ outline: "3px solid", outlineColor: "brand.focusRing", outlineOffset: "2px" }}
            aria-label={label}
            draggable={!!guest}
            onClick={() => {
              if (plan.armedGuestId) {
                if (plan.armedGuestId === gid) plan.armGuest(null)
                else plan.place(plan.armedGuestId, table.id, i)
              } else plan.selectTable(table.id, gid)
            }}
            onDragStart={(e: React.DragEvent) => {
              if (!gid) return
              e.dataTransfer.setData("text/plain", gid)
              e.dataTransfer.effectAllowed = "move"
              plan.setDragGuest(gid)
            }}
            onDragEnd={() => {
              plan.setDragGuest(null)
              setOverTableId(null)
            }}
            onDragOver={onDragOver}
            onDragLeave={() => {
              if (overTableId === table.id) setOverTableId(null)
            }}
            onDrop={(e: React.DragEvent) => onDrop(e, i)}
            data-initials={guest ? initials(guest.name) : undefined}
            _before={guest ? { content: "attr(data-initials)" } : undefined}
          >
            {guest?.diet ? (
              <Box
                as="span"
                position="absolute"
                top="-6%"
                right="-6%"
                boxSize="34%"
                borderRadius="full"
                bg="yellow.400"
                borderWidth="1.5px"
                borderColor="bg.panel"
                aria-hidden="true"
              />
            ) : null}
          </chakra.button>
        )
        return guest ? (
          <Tooltip
            key={i}
            openDelay={250}
            positioning={{ placement: "top" }}
            content={`${guest.name} · ${guest.party}${guest.diet ? ` · ${guest.diet}` : ""}`}
          >
            {seatButton}
          </Tooltip>
        ) : (
          <React.Fragment key={i}>{seatButton}</React.Fragment>
        )
      })}
    </Box>
  )
}
```

```tsx components/ui/provider.tsx
"use client"

import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"

// Seatwise brand: a deep rose-plum used for selection, focus and primary actions.
const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#fbf3f7" },
          100: { value: "#f5e3ec" },
          200: { value: "#ebc7d9" },
          300: { value: "#dd9fbc" },
          400: { value: "#cb6f96" },
          500: { value: "#b24a78" },
          600: { value: "#96395f" },
          700: { value: "#7a2f4e" },
          800: { value: "#5f263f" },
          900: { value: "#471d31" },
          950: { value: "#2b111d" },
        },
      },
      fonts: {
        heading: {
          value:
            "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'Times New Roman', serif",
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: { _light: "{colors.brand.700}", _dark: "{colors.brand.500}" } },
          contrast: { value: "white" },
          fg: { value: { _light: "{colors.brand.700}", _dark: "{colors.brand.300}" } },
          muted: { value: { _light: "{colors.brand.100}", _dark: "{colors.brand.900}" } },
          subtle: { value: { _light: "{colors.brand.50}", _dark: "{colors.brand.950}" } },
          emphasized: { value: { _light: "{colors.brand.200}", _dark: "{colors.brand.800}" } },
          focusRing: { value: { _light: "{colors.brand.600}", _dark: "{colors.brand.400}" } },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider defaultTheme="light" {...props} />
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

export interface TableDef {
  id: string
  name: string
  shape: "round" | "long"
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

export interface Rule {
  id: string
  kind: RuleKind
  guests: string[]
  note: string
  /** near rules: the fixture kind the guest should be close to */
  near?: FixtureKind
  /** near rules: the fixture kind the guest should be away from */
  away?: FixtureKind
}

export const app = {
  name: "Seatwise",
  tagline: "Seating planner for wedding and event planners",
}

export const event = {
  name: "Ines & Mateo's wedding dinner",
  date: "2027-06-19",
  venue: "The Orangery, Hollin Hall",
  room_m: { width: 24, depth: 14 },
}

export const planner = { name: "Hannah Brook" }

export const fixtures: Fixture[] = [
  { id: "f-1", kind: "stage", label: "Band", x: 10, y: 0.5, w: 4, h: 2 },
  { id: "f-2", kind: "dancefloor", label: "Dance floor", x: 8.5, y: 3, w: 7, h: 4 },
  { id: "f-3", kind: "bar", label: "Bar", x: 21, y: 10, w: 2.5, h: 3.5 },
  { id: "f-4", kind: "door", label: "Garden doors", x: 0, y: 6, w: 0.5, h: 2.5 },
]

export const tables: TableDef[] = [
  { id: "t-head", name: "Top table", shape: "long", seats: 8, x: 8, y: 8.2, rotation: 0 },
  { id: "t-1", name: "Table 1", shape: "round", seats: 8, x: 3, y: 2.5 },
  { id: "t-2", name: "Table 2", shape: "round", seats: 8, x: 3, y: 7 },
  { id: "t-3", name: "Table 3", shape: "round", seats: 8, x: 3, y: 11.5 },
  { id: "t-4", name: "Table 4", shape: "round", seats: 8, x: 19, y: 2.5 },
  { id: "t-5", name: "Table 5", shape: "round", seats: 8, x: 19, y: 7 },
  { id: "t-6", name: "Table 6", shape: "round", seats: 6, x: 12, y: 12 },
]

export const guests: Guest[] = [
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

export const rules: Rule[] = [
  { id: "r-1", kind: "together", guests: ["g-21", "g-22"], note: "Couple" },
  { id: "r-2", kind: "together", guests: ["g-32", "g-33"], note: "Siblings, under 10" },
  {
    id: "r-3",
    kind: "apart",
    guests: ["g-29", "g-30"],
    note: "Brothers Sean and Ryan Doyle are not speaking",
  },
  {
    id: "r-4",
    kind: "apart",
    guests: ["g-12", "g-34"],
    note: "Ask the couple: old family dispute",
  },
  {
    id: "r-5",
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
    near: "door",
    away: "stage",
  },
]
```

```ts lib/plan.ts
import {
  event,
  fixtures,
  guests,
  rules,
  tables,
  type Fixture,
  type Guest,
  type Rule,
  type TableDef,
} from "./data"

/* ------------------------------------------------------------------ lookups */

export const guestById: Record<string, Guest> = Object.fromEntries(
  guests.map((g) => [g.id, g]),
)
export const tableById: Record<string, TableDef> = Object.fromEntries(
  tables.map((t) => [t.id, t]),
)

export const PARTIES: string[] = Array.from(new Set(guests.map((g) => g.party)))

const PARTY_PALETTE: Record<string, string> = {
  Couple: "pink",
  "Bride's family": "purple",
  "Groom's family": "orange",
  "University friends": "blue",
  "Work friends": "teal",
  "Groom's football club": "green",
  "Plus-ones": "cyan",
}

export function partyPalette(party: string): string {
  return PARTY_PALETTE[party] ?? "gray"
}

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : ""
  return (first + last).toUpperCase()
}

export function firstName(name: string): string {
  return name.split(/\s+/)[0] ?? name
}

export const RSVP_LABEL: Record<Guest["rsvp"], string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Awaiting reply",
  no: "Declined",
}

export const RSVP_PALETTE: Record<Guest["rsvp"], string> = {
  yes: "green",
  maybe: "orange",
  pending: "gray",
  no: "red",
}

export function formatEventDate(): string {
  return new Date(`${event.date}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
}

/* -------------------------------------------------------------- seating state */

/** table id -> one entry per seat, holding a guest id or null */
export type Seats = Record<string, (string | null)[]>

export interface Position {
  tableId: string
  seat: number
}

/** Seat order at the top table: the couple in the middle, an empty seat at each end. */
const HEAD_TABLE_ORDER = ["g-04", "g-03", "g-01", "g-02", "g-05", "g-06"]

export function initialSeats(): Seats {
  const seats: Seats = {}
  for (const t of tables) seats[t.id] = Array.from({ length: t.seats }, () => null)
  for (const t of tables) {
    const row = seats[t.id]
    if (!row) continue
    if (t.id === "t-head") {
      HEAD_TABLE_ORDER.forEach((gid, i) => {
        row[i + 1] = gid
      })
      continue
    }
    let i = 0
    for (const g of guests) {
      if (g.table === t.id && i < row.length) row[i++] = g.id
    }
  }
  return seats
}

export function locateAll(seats: Seats): Record<string, Position> {
  const out: Record<string, Position> = {}
  for (const [tableId, row] of Object.entries(seats)) {
    row.forEach((gid, seat) => {
      if (gid) out[gid] = { tableId, seat }
    })
  }
  return out
}

export function filledCount(row: (string | null)[] | undefined): number {
  return row ? row.filter(Boolean).length : 0
}

export interface PlaceResult {
  seats: Seats
  ok: boolean
  changed: boolean
  message: string
}

function cloneSeats(seats: Seats): Seats {
  const next: Seats = {}
  for (const [k, v] of Object.entries(seats)) next[k] = v.slice()
  return next
}

/**
 * Seat, move or swap a guest. Without a seat index the guest takes the first free seat.
 * Dropping onto an occupied seat swaps the two guests (or, for an unseated guest at a full
 * table, sends the occupant back to the unseated list).
 */
export function placeGuest(
  seats: Seats,
  guestId: string,
  tableId: string,
  seatIndex?: number,
): PlaceResult {
  const guest = guestById[guestId]
  const table = tableById[tableId]
  if (!guest || !table) {
    return { seats, ok: false, changed: false, message: "That seat does not exist." }
  }
  if (guest.rsvp === "no") {
    return {
      seats,
      ok: false,
      changed: false,
      message: `${guest.name} has declined, so they cannot be seated.`,
    }
  }
  const here = locateAll(seats)[guestId]
  const target = seats[tableId]
  if (!target) {
    return { seats, ok: false, changed: false, message: "That table does not exist." }
  }
  const next = cloneSeats(seats)
  const nextTarget = next[tableId]
  if (!nextTarget) return { seats, ok: false, changed: false, message: "That table does not exist." }

  let idx = seatIndex
  if (idx === undefined) {
    if (here && here.tableId === tableId) {
      return {
        seats,
        ok: true,
        changed: false,
        message: `${guest.name} is already at ${table.name}.`,
      }
    }
    idx = nextTarget.findIndex((s) => s === null)
    if (idx === -1) {
      return {
        seats,
        ok: false,
        changed: false,
        message: `${table.name} is full. Drop onto a seat to swap with someone there.`,
      }
    }
  }

  const occupant = nextTarget[idx] ?? null
  if (occupant === guestId) {
    return { seats, ok: true, changed: false, message: `${guest.name} is already in that seat.` }
  }

  if (occupant) {
    const other = guestById[occupant]
    if (here) {
      // swap two seated guests
      const hereRow = next[here.tableId]
      if (hereRow) hereRow[here.seat] = occupant
      nextTarget[idx] = guestId
      return {
        seats: next,
        ok: true,
        changed: true,
        message: `${guest.name} and ${other?.name ?? "another guest"} swapped seats.`,
      }
    }
    // unseated guest dropped on an occupied seat
    const free = nextTarget.findIndex((s) => s === null)
    if (free !== -1) {
      nextTarget[free] = guestId
      return {
        seats: next,
        ok: true,
        changed: true,
        message: `${guest.name} seated at ${table.name}.`,
      }
    }
    nextTarget[idx] = guestId
    return {
      seats: next,
      ok: true,
      changed: true,
      message: `${guest.name} took ${other?.name ?? "the seat"}'s place at ${table.name}. ${other?.name ?? "They"} moved to the unseated list.`,
    }
  }

  if (here) {
    const hereRow = next[here.tableId]
    if (hereRow) hereRow[here.seat] = null
  }
  nextTarget[idx] = guestId
  const verb = here ? (here.tableId === tableId ? "moved within" : "moved to") : "seated at"
  return {
    seats: next,
    ok: true,
    changed: true,
    message: `${guest.name} ${verb} ${table.name}.`,
  }
}

export function unseatGuest(seats: Seats, guestId: string): PlaceResult {
  const here = locateAll(seats)[guestId]
  const guest = guestById[guestId]
  if (!here || !guest) return { seats, ok: true, changed: false, message: "" }
  const next = cloneSeats(seats)
  const row = next[here.tableId]
  if (row) row[here.seat] = null
  return {
    seats: next,
    ok: true,
    changed: true,
    message: `${guest.name} unseated from ${tableById[here.tableId]?.name ?? "a table"}.`,
  }
}

/* ------------------------------------------------------------------- counts */

export interface PlanCounts {
  seated: number
  attending: number
  attendingSeated: number
  unseated: Guest[]
  awaiting: Guest[]
  totalSeats: number
  freeSeats: number
}

export function planCounts(seats: Seats): PlanCounts {
  const pos = locateAll(seats)
  const attending = guests.filter((g) => g.rsvp === "yes")
  const unseated = attending.filter((g) => !pos[g.id])
  const awaiting = guests.filter(
    (g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !pos[g.id],
  )
  const seated = Object.keys(pos).length
  const totalSeats = tables.reduce((n, t) => n + t.seats, 0)
  return {
    seated,
    attending: attending.length,
    attendingSeated: attending.length - unseated.length,
    unseated,
    awaiting,
    totalSeats,
    freeSeats: totalSeats - seated,
  }
}

/* ------------------------------------------------------------------ geometry */

export const ROOM = event.room_m

export interface TableGeometry {
  /** table group box, in metres, room coordinates */
  left: number
  top: number
  w: number
  h: number
  /** the cloth / table body inside the group, in metres, group coordinates */
  body: { x: number; y: number; w: number; h: number }
  seatSize: number
  /** seat centres, in metres, group coordinates */
  seatCentres: { x: number; y: number }[]
}

const SEAT_SIZE = 0.78
const ROUND_HALO = 1.9
const ROUND_CLOTH = 1.0
const ROUND_RING = 1.5

export function tableGeometry(t: TableDef): TableGeometry {
  if (t.shape === "long") {
    const gw = t.seats * 0.84 + 0.6
    const gh = 1.95
    const bodyH = 0.95
    const body = { x: 0.3, y: 0.05, w: gw - 0.6, h: bodyH }
    const seatCentres = Array.from({ length: t.seats }, (_, i) => ({
      x: gw / 2 + (i - (t.seats - 1) / 2) * 0.84,
      y: body.y + bodyH + 0.5,
    }))
    return {
      left: t.x - gw / 2,
      top: t.y - (body.y + bodyH / 2),
      w: gw,
      h: gh,
      body,
      seatSize: SEAT_SIZE,
      seatCentres,
    }
  }
  const gw = ROUND_HALO * 2
  const seatCentres = Array.from({ length: t.seats }, (_, i) => {
    const a = ((-90 + (i * 360) / t.seats) * Math.PI) / 180
    return { x: ROUND_HALO + Math.cos(a) * ROUND_RING, y: ROUND_HALO + Math.sin(a) * ROUND_RING }
  })
  return {
    left: t.x - ROUND_HALO,
    top: t.y - ROUND_HALO,
    w: gw,
    h: gw,
    body: { x: ROUND_HALO - ROUND_CLOTH, y: ROUND_HALO - ROUND_CLOTH, w: ROUND_CLOTH * 2, h: ROUND_CLOTH * 2 },
    seatSize: SEAT_SIZE,
    seatCentres,
  }
}

export function fixtureOfKind(kind: Fixture["kind"]): Fixture | undefined {
  return fixtures.find((f) => f.kind === kind)
}

function centre(f: Fixture): { x: number; y: number } {
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 }
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export const NEAR_MAX_M = 4
export const AWAY_MIN_M = 6

function distanceToFixture(t: TableDef, kind: Fixture["kind"]): number | null {
  const f = fixtureOfKind(kind)
  return f ? dist(t, centre(f)) : null
}

/* -------------------------------------------------------------------- rules */

export type RuleStatus = "kept" | "broken" | "open"

export interface RuleResult {
  rule: Rule
  status: RuleStatus
  title: string
  detail: string
  /** tables that get the flag when the rule is broken */
  flagTables: string[]
  /** guests that get the flag when the rule is broken */
  flagGuests: string[]
  /** tables the rule currently touches (for jumping to them) */
  tables: string[]
}

const RULE_LABEL: Record<Rule["kind"], string> = {
  together: "Keep together",
  apart: "Keep apart",
  near: "Seat near",
}

function names(ids: string[]): string {
  return ids.map((id) => guestById[id]?.name ?? id).join(" and ")
}

function tableName(id: string): string {
  return tableById[id]?.name ?? id
}

function metres(n: number): string {
  return `${n.toFixed(1)} m`
}

export function evaluateRules(seats: Seats): RuleResult[] {
  const pos = locateAll(seats)
  return rules.map((rule): RuleResult => {
    const placed = rule.guests.map((id) => pos[id])
    const seatedTables = placed.filter((p): p is Position => !!p).map((p) => p.tableId)
    const touched = Array.from(new Set(seatedTables))

    if (rule.kind === "near") {
      const id = rule.guests[0] ?? ""
      const p = pos[id]
      const guest = guestById[id]
      const title = `${RULE_LABEL.near} the ${fixtureOfKind(rule.near ?? "door")?.label.toLowerCase() ?? "door"}: ${guest?.name ?? id}`
      if (!p) {
        return {
          rule,
          status: "open",
          title,
          detail: `${guest?.name ?? "This guest"} is not seated yet.`,
          flagTables: [],
          flagGuests: [],
          tables: [],
        }
      }
      const t = tableById[p.tableId]
      const dNear = t && rule.near ? distanceToFixture(t, rule.near) : null
      const dAway = t && rule.away ? distanceToFixture(t, rule.away) : null
      const tooFar = dNear !== null && dNear > NEAR_MAX_M
      const tooClose = dAway !== null && dAway < AWAY_MIN_M
      if (tooFar || tooClose) {
        const options = tables
          .filter((c) => {
            if (c.id === p.tableId) return false
            if (filledCount(seats[c.id]) >= c.seats) return false
            const n = rule.near ? distanceToFixture(c, rule.near) : 0
            const a = rule.away ? distanceToFixture(c, rule.away) : AWAY_MIN_M
            return (n ?? 0) <= NEAR_MAX_M && (a ?? AWAY_MIN_M) >= AWAY_MIN_M
          })
          .sort(
            (x, y) =>
              (rule.near ? (distanceToFixture(x, rule.near) ?? 0) : 0) -
              (rule.near ? (distanceToFixture(y, rule.near) ?? 0) : 0),
          )
        const why = tooFar
          ? `${t?.name} is about ${metres(dNear ?? 0)} from the ${fixtureOfKind(rule.near ?? "door")?.label.toLowerCase()}, over the ${NEAR_MAX_M} m limit`
          : `${t?.name} is only ${metres(dAway ?? 0)} from the ${fixtureOfKind(rule.away ?? "stage")?.label.toLowerCase()}`
        const first = options[0]
        return {
          rule,
          status: "broken",
          title,
          detail: `${why}.${first ? ` ${first.name} has room and is closer.` : ""}`,
          flagTables: [p.tableId],
          flagGuests: [id],
          tables: [p.tableId],
        }
      }
      return {
        rule,
        status: "kept",
        title,
        detail: `${t?.name} is about ${metres(dNear ?? 0)} from the ${fixtureOfKind(rule.near ?? "door")?.label.toLowerCase()} and ${metres(dAway ?? 0)} from the ${fixtureOfKind(rule.away ?? "stage")?.label.toLowerCase()}.`,
        flagTables: [],
        flagGuests: [],
        tables: [p.tableId],
      }
    }

    const title = `${RULE_LABEL[rule.kind]}: ${names(rule.guests)}`
    const [a, b] = rule.guests
    const pa = a ? pos[a] : undefined
    const pb = b ? pos[b] : undefined
    if (!pa || !pb) {
      const missing = rule.guests.filter((id) => !pos[id])
      const detail =
        missing.length === rule.guests.length
          ? "Neither guest is seated yet."
          : `${names(missing)} is not seated yet${touched[0] ? `; the other is at ${tableName(touched[0])}` : ""}.`
      return { rule, status: "open", title, detail, flagTables: [], flagGuests: [], tables: touched }
    }
    const same = pa.tableId === pb.tableId
    if (rule.kind === "together") {
      return same
        ? {
            rule,
            status: "kept",
            title,
            detail: `Both at ${tableName(pa.tableId)}.`,
            flagTables: [],
            flagGuests: [],
            tables: [pa.tableId],
          }
        : {
            rule,
            status: "broken",
            title,
            detail: `${guestById[a ?? ""]?.name} is at ${tableName(pa.tableId)}, ${guestById[b ?? ""]?.name} at ${tableName(pb.tableId)}.`,
            flagTables: [pa.tableId, pb.tableId],
            flagGuests: [a ?? "", b ?? ""],
            tables: [pa.tableId, pb.tableId],
          }
    }
    // apart
    return same
      ? {
          rule,
          status: "broken",
          title,
          detail: `Both at ${tableName(pa.tableId)}.`,
          flagTables: [pa.tableId],
          flagGuests: [a ?? "", b ?? ""],
          tables: [pa.tableId],
        }
      : {
          rule,
          status: "kept",
          title,
          detail: `${tableName(pa.tableId)} and ${tableName(pb.tableId)}.`,
          flagTables: [],
          flagGuests: [],
          tables: [pa.tableId, pb.tableId],
        }
  })
}

/* --------------------------------------------------------------- meal counts */

export const STANDARD_MEAL = "Standard menu"

export interface MealRow {
  meal: string
  confirmed: number
  awaiting: number
}

export function mealCounts(): { rows: MealRow[]; confirmed: number; awaiting: number; declined: number } {
  const map = new Map<string, MealRow>()
  let declined = 0
  for (const g of guests) {
    if (g.rsvp === "no") {
      declined++
      continue
    }
    const meal = g.diet ?? STANDARD_MEAL
    const row = map.get(meal) ?? { meal, confirmed: 0, awaiting: 0 }
    if (g.rsvp === "yes") row.confirmed++
    else row.awaiting++
    map.set(meal, row)
  }
  const rows = Array.from(map.values()).sort((a, b) => {
    if (a.meal === STANDARD_MEAL) return -1
    if (b.meal === STANDARD_MEAL) return 1
    return b.confirmed + b.awaiting - (a.confirmed + a.awaiting) || a.meal.localeCompare(b.meal)
  })
  return {
    rows,
    confirmed: rows.reduce((n, r) => n + r.confirmed, 0),
    awaiting: rows.reduce((n, r) => n + r.awaiting, 0),
    declined,
  }
}

export const DIETS: string[] = Array.from(
  new Set(guests.map((g) => g.diet).filter((d): d is string => !!d)),
).sort((a, b) => a.localeCompare(b))
```

```tsx lib/store.tsx
"use client"

import * as React from "react"
import { toaster } from "@/components/ui/toaster"
import {
  evaluateRules,
  initialSeats,
  locateAll,
  planCounts,
  placeGuest,
  unseatGuest,
  type PlanCounts,
  type Position,
  type RuleResult,
  type Seats,
} from "./plan"

export type PanelTab = "unseated" | "table" | "rules"

interface PlanContextValue {
  seats: Seats
  positions: Record<string, Position>
  counts: PlanCounts
  ruleResults: RuleResult[]
  brokenRules: RuleResult[]
  /** table ids -> number of broken rules that involve it */
  flaggedTables: Record<string, number>
  /** guest ids that are part of a broken rule */
  flaggedGuests: Set<string>
  selectedTableId: string | null
  armedGuestId: string | null
  focusGuestId: string | null
  dragGuestId: string | null
  tab: PanelTab
  setTab: (tab: PanelTab) => void
  selectTable: (id: string | null, guestId?: string | null) => void
  armGuest: (id: string | null) => void
  setDragGuest: (id: string | null) => void
  place: (guestId: string, tableId: string, seat?: number) => boolean
  unseat: (guestId: string) => void
}

const PlanContext = React.createContext<PlanContextValue | null>(null)

export function usePlan(): PlanContextValue {
  const ctx = React.useContext(PlanContext)
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider")
  return ctx
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [seats, setSeats] = React.useState<Seats>(() => initialSeats())
  const [selectedTableId, setSelectedTableId] = React.useState<string | null>(null)
  const [armedGuestId, setArmedGuestId] = React.useState<string | null>(null)
  const [focusGuestId, setFocusGuestId] = React.useState<string | null>(null)
  const [dragGuestId, setDragGuestId] = React.useState<string | null>(null)
  const [tab, setTab] = React.useState<PanelTab>("unseated")

  const positions = React.useMemo(() => locateAll(seats), [seats])
  const counts = React.useMemo(() => planCounts(seats), [seats])
  const ruleResults = React.useMemo(() => evaluateRules(seats), [seats])
  const brokenRules = React.useMemo(
    () => ruleResults.filter((r) => r.status === "broken"),
    [ruleResults],
  )
  const flaggedTables = React.useMemo(() => {
    const out: Record<string, number> = {}
    for (const r of brokenRules) {
      for (const t of new Set(r.flagTables)) out[t] = (out[t] ?? 0) + 1
    }
    return out
  }, [brokenRules])
  const flaggedGuests = React.useMemo(() => {
    const out = new Set<string>()
    for (const r of brokenRules) for (const g of r.flagGuests) out.add(g)
    return out
  }, [brokenRules])

  const commit = React.useCallback((next: Seats, message: string, previous: Seats) => {
    setSeats(next)
    toaster.create({
      description: message,
      type: "success",
      duration: 5000,
      closable: true,
      action: {
        label: "Undo",
        onClick: () => setSeats(previous),
      },
    })
  }, [])

  const place = React.useCallback(
    (guestId: string, tableId: string, seat?: number) => {
      const res = placeGuest(seats, guestId, tableId, seat)
      if (!res.ok) {
        toaster.create({
          title: "Cannot seat here",
          description: res.message,
          type: "error",
          duration: 5000,
          closable: true,
        })
        return false
      }
      if (res.changed) commit(res.seats, res.message, seats)
      setSelectedTableId(tableId)
      setFocusGuestId(guestId)
      setArmedGuestId(null)
      return true
    },
    [seats, commit],
  )

  const unseat = React.useCallback(
    (guestId: string) => {
      const res = unseatGuest(seats, guestId)
      if (res.changed) commit(res.seats, res.message, seats)
      setArmedGuestId(null)
    },
    [seats, commit],
  )

  const selectTable = React.useCallback((id: string | null, guestId?: string | null) => {
    setSelectedTableId(id)
    setFocusGuestId(guestId ?? null)
    if (id) setTab("table")
  }, [])

  const armGuest = React.useCallback((id: string | null) => {
    setArmedGuestId(id)
    setFocusGuestId(id)
  }, [])

  const value = React.useMemo<PlanContextValue>(
    () => ({
      seats,
      positions,
      counts,
      ruleResults,
      brokenRules,
      flaggedTables,
      flaggedGuests,
      selectedTableId,
      armedGuestId,
      focusGuestId,
      dragGuestId,
      tab,
      setTab,
      selectTable,
      armGuest,
      setDragGuest: setDragGuestId,
      place,
      unseat,
    }),
    [
      seats,
      positions,
      counts,
      ruleResults,
      brokenRules,
      flaggedTables,
      flaggedGuests,
      selectedTableId,
      armedGuestId,
      focusGuestId,
      dragGuestId,
      tab,
      selectTable,
      armGuest,
      place,
      unseat,
    ],
  )

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>
}
```

