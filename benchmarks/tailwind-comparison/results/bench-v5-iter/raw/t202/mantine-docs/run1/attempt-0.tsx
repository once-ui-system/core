```tsx app/guests/page.tsx
import type { Metadata } from "next";
import { GuestsView } from "@/components/GuestsView";

export const metadata: Metadata = { title: "Seatwise | Guest list" };

export default function Page() {
  return <GuestsView />;
}
```

```tsx app/layout.tsx
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/spotlight/styles.css";

import type { Metadata } from "next";
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { AppFrame } from "@/components/AppFrame";
import { PlanProvider } from "@/components/PlanProvider";
import { theme } from "./theme";

export const metadata: Metadata = {
  title: "Seatwise | Seating plan",
  description: "Seating planner for wedding and event planners.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="light" forceColorScheme="light" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light" forceColorScheme="light">
          <ModalsProvider>
            <Notifications position="bottom-center" />
            <PlanProvider>
              <AppFrame>{children}</AppFrame>
            </PlanProvider>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
```

```tsx app/page.tsx
import { PlanView } from "@/components/PlanView";

export default function Page() {
  return <PlanView />;
}
```

```ts app/theme.ts
import { DEFAULT_THEME, colorsTuple, createTheme } from "@mantine/core";

// System font stack, identical in every arm (no network font fetch at build).
export const theme = createTheme({
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  headings: { fontFamily: "ui-sans-serif, system-ui, sans-serif", fontWeight: "700" },
  // Deep orangery green: the brand and primary colour (Mantine's teal, dark shade for contrast).
  colors: { brand: DEFAULT_THEME.colors.teal, ember: colorsTuple("#b8420a") },
  primaryColor: "brand",
  primaryShade: { light: 9, dark: 9 },
  defaultRadius: "md",
  cursorType: "pointer",
  components: {
    Paper: { defaultProps: { radius: "md" } },
    Badge: { defaultProps: { radius: "sm", c: "dark.9" } },
    Tooltip: { defaultProps: { openDelay: 150, withArrow: true } },
  },
});
```

```tsx components/AppFrame.tsx
"use client";

import { AppShell, Avatar, Box, Button, Group, Text, Tooltip, UnstyledButton } from "@mantine/core";
import { IconArmchair, IconLayoutDashboard, IconUsers } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { APP_NAME, EVENT, PLANNER } from "@/lib/data";

const NAV = [
  { href: "/", label: "Plan", icon: IconLayoutDashboard },
  { href: "/guests", label: "Guests", icon: IconUsers },
];

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AppShell header={{ height: 60 }} padding={{ base: "sm", sm: "md" }} bg="gray.0">
      <AppShell.Header>
        <Group h="100%" px={{ base: "sm", sm: "md" }} justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <UnstyledButton component={Link} href="/" aria-label={`${APP_NAME}, seating plan`}>
              <Group gap={8} wrap="nowrap">
                <Box
                  bg="brand.9"
                  c="white"
                  w={32}
                  h={32}
                  style={{ borderRadius: 9, display: "grid", placeItems: "center" }}
                >
                  <IconArmchair size={20} stroke={1.8} aria-hidden />
                </Box>
                <Text fw={800} fz="lg" lh={1} c="dark.9" visibleFrom="xs">
                  {APP_NAME}
                </Text>
              </Group>
            </UnstyledButton>
            <Group gap={4} component="nav" aria-label="Main" wrap="nowrap">
              {NAV.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Button
                    key={item.href}
                    component={Link}
                    href={item.href}
                    variant={active ? "light" : "subtle"}
                    color={active ? "brand" : "gray.7"}
                    size="sm"
                    leftSection={<Icon size={17} aria-hidden />}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Group>
          </Group>
          <Group gap="md" wrap="nowrap">
            <Box visibleFrom="md" ta="right">
              <Text fz="sm" fw={600} lh={1.2}>
                {EVENT.name}
              </Text>
              <Text fz="xs" c="dimmed" lh={1.3}>
                {EVENT.venue}
              </Text>
            </Box>
            <Tooltip label={`${PLANNER.name}, planner`}>
              <Avatar color="brand" variant="filled" radius="xl" size={34}>
                {PLANNER.initials}
              </Avatar>
            </Tooltip>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Main id="main">{children}</AppShell.Main>
    </AppShell>
  );
}
```

```tsx components/GuestChip.tsx
"use client";

import { Avatar, Badge, Box, Group, Paper, Text } from "@mantine/core";
import { IconGripVertical } from "@tabler/icons-react";
import type { DragEvent, KeyboardEvent } from "react";
import { DIET_COLOR, PARTY_COLOR, initials, type Guest } from "@/lib/data";
import { cx } from "@/lib/cx";
import { usePlan } from "./PlanProvider";
import classes from "./room.module.css";

/** An unseated guest: tap to pick up, then tap a seat or table; or drag onto the plan. */
export function GuestChip({ guest }: { guest: Guest }) {
  const { armedGuestId, arm, setDragId } = usePlan();
  const armed = armedGuestId === guest.id;
  const toggle = () => arm(armed ? null : guest.id);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };
  const onDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", guest.id);
    e.dataTransfer.effectAllowed = "move";
    setDragId(guest.id);
  };

  return (
    <Paper
      withBorder
      p="xs"
      role="button"
      tabIndex={0}
      aria-pressed={armed}
      draggable
      onDragStart={onDragStart}
      onDragEnd={() => setDragId(null)}
      onClick={toggle}
      onKeyDown={onKeyDown}
      className={cx(classes.chip, armed && classes.chipArmed)}
    >
      <Group wrap="nowrap" gap="xs">
        <Avatar size={32} radius="xl" color={PARTY_COLOR[guest.party] ?? "gray"} variant="filled" fz={12} fw={700}>
          {initials(guest.name)}
        </Avatar>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text fz="sm" fw={600} truncate lh={1.25}>
            {guest.name}
          </Text>
          <Text fz="xs" c="gray.7" truncate lh={1.25}>
            {guest.party}
          </Text>
        </Box>
        {guest.diet ? (
          <Badge size="sm" variant="light" color={DIET_COLOR[guest.diet] ?? "gray"}>
            {guest.diet}
          </Badge>
        ) : null}
        <IconGripVertical size={16} color="var(--mantine-color-gray-5)" aria-hidden />
      </Group>
    </Paper>
  );
}
```

```tsx components/GuestsView.tsx
"use client";

import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  CopyButton,
  Flex,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconArmchair, IconCheck, IconCopy, IconPrinter, IconSearch } from "@tabler/icons-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  DIET_COLOR,
  EVENT,
  GUESTS,
  PARTY_COLOR,
  PARTY_ORDER,
  RSVP_COLOR,
  RSVP_LABEL,
  STANDARD_MEAL,
  TABLES,
  TABLES_BY_ID,
  formatEventDate,
  initials,
  type Guest,
  type Rsvp,
} from "@/lib/data";
import { usePlan } from "./PlanProvider";

type RsvpFilter = "all" | Rsvp;

const NO_DIET = "__none";
const ANY = "__any";
const ALL_DIETS = [...new Set(GUESTS.map((x) => x.diet).filter((d): d is string => Boolean(d)))].sort();

function mealOf(g: Guest): string {
  return g.diet ?? STANDARD_MEAL;
}

function TableCell({ guest, tableId }: { guest: Guest; tableId: string | null }) {
  const plan = usePlan();
  if (tableId) {
    return (
      <Button
        component={Link}
        href="/"
        variant="subtle"
        size="compact-sm"
        leftSection={<IconArmchair size={15} aria-hidden />}
        onClick={() => plan.selectTable(tableId)}
        aria-label={`${TABLES_BY_ID[tableId]?.name ?? "Table"}: show on the plan`}
      >
        {TABLES_BY_ID[tableId]?.name}
      </Button>
    );
  }
  if (guest.rsvp === "no") {
    return (
      <Text fz="sm" c="gray.7">
        Declined
      </Text>
    );
  }
  return (
    <Button
      component={Link}
      href="/"
      variant="light"
      color="orange"
      size="compact-sm"
      onClick={() => plan.arm(guest.id)}
      aria-label={`No seat: place ${guest.name} on the plan`}
    >
      No seat: place
    </Button>
  );
}

function MealCard() {
  const plan = usePlan();
  const rows = useMemo(() => {
    const meals = [STANDARD_MEAL, ...ALL_DIETS];
    return meals.map((meal) => {
      const mine = GUESTS.filter((x) => mealOf(x) === meal);
      return {
        meal,
        confirmed: mine.filter((x) => x.rsvp === "yes").length,
        awaiting: mine.filter((x) => x.rsvp === "maybe" || x.rsvp === "pending").length,
      };
    });
  }, []);
  const totalConfirmed = rows.reduce((n, r) => n + r.confirmed, 0);
  const totalAwaiting = rows.reduce((n, r) => n + r.awaiting, 0);
  const declined = GUESTS.filter((x) => x.rsvp === "no").length;

  const text = [
    `${EVENT.name}, ${formatEventDate(EVENT.date)}, ${EVENT.venue}`,
    "Meal counts (attending / awaiting reply)",
    ...rows.map((r) => `${r.meal}: ${r.confirmed} / ${r.awaiting}`),
    `Total: ${totalConfirmed} / ${totalAwaiting}`,
  ].join("\n");

  const byTable = TABLES.map((t) => {
    const counts = new Map<string, number>();
    for (const id of plan.seating[t.id] ?? []) {
      const diet = id ? GUESTS.find((x) => x.id === id)?.diet : null;
      if (diet) counts.set(diet, (counts.get(diet) ?? 0) + 1);
    }
    return { name: t.name, counts: [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0])) };
  });
  const unseated = new Map<string, number>();
  for (const x of GUESTS) {
    if (x.rsvp === "yes" && x.diet && !plan.locations[x.id]) unseated.set(x.diet, (unseated.get(x.diet) ?? 0) + 1);
  }
  const unseatedCounts = [...unseated.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <Stack gap="md">
      <Paper withBorder shadow="xs" p="md">
        <Group justify="space-between" align="flex-start" wrap="nowrap" mb="xs">
          <Box>
            <Title order={2} fz="lg">
              Meals for the caterer
            </Title>
            <Text fz="sm" c="gray.7">
              {totalConfirmed} confirmed, {totalAwaiting} awaiting a reply, {declined} declined.
            </Text>
          </Box>
          <CopyButton value={text}>
            {({ copied, copy }) => (
              <Button
                size="compact-sm"
                style={{ flexShrink: 0 }}
                variant={copied ? "light" : "default"}
                color={copied ? "green" : undefined}
                leftSection={copied ? <IconCheck size={15} aria-hidden /> : <IconCopy size={15} aria-hidden />}
                onClick={copy}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
          </CopyButton>
        </Group>
        <Table verticalSpacing={6} horizontalSpacing="xs" aria-label="Meal counts" withRowBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Meal</Table.Th>
              <Table.Th ta="right">Attending</Table.Th>
              <Table.Th ta="right">Awaiting</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((r) => (
              <Table.Tr key={r.meal}>
                <Table.Td>
                  <Group gap={8} wrap="nowrap">
                    <Box
                      w={10}
                      h={10}
                      style={{
                        borderRadius: "50%",
                        background: DIET_COLOR[r.meal]
                          ? `var(--mantine-color-${DIET_COLOR[r.meal]}-filled)`
                          : "var(--mantine-color-gray-5)",
                        flexShrink: 0,
                      }}
                      aria-hidden
                    />
                    <Text fz="sm">{r.meal}</Text>
                  </Group>
                </Table.Td>
                <Table.Td ta="right" fw={700}>
                  {r.confirmed}
                </Table.Td>
                <Table.Td ta="right" c="gray.7">
                  {r.awaiting}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
          <Table.Tfoot>
            <Table.Tr>
              <Table.Th>Total</Table.Th>
              <Table.Th ta="right">{totalConfirmed}</Table.Th>
              <Table.Th ta="right">{totalAwaiting}</Table.Th>
            </Table.Tr>
          </Table.Tfoot>
        </Table>
        <Text fz="xs" c="gray.7" mt="xs">
          Declined guests are not counted. Awaiting means maybe or no reply yet.
        </Text>
      </Paper>

      <Paper withBorder shadow="xs" p="md">
        <Title order={2} fz="lg" mb="xs">
          Dietary needs by table
        </Title>
        <Stack gap="xs">
          {byTable.map((t) => (
            <Group key={t.name} justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
              <Text fz="sm" fw={600} w={80} style={{ flexShrink: 0 }}>
                {t.name}
              </Text>
              <Group gap={4} justify="flex-end">
                {t.counts.length ? (
                  t.counts.map(([d, n]) => (
                    <Badge key={d} size="sm" variant="light" color={DIET_COLOR[d] ?? "gray"}>
                      {d} &times; {n}
                    </Badge>
                  ))
                ) : (
                  <Text fz="xs" c="gray.7">
                    None
                  </Text>
                )}
              </Group>
            </Group>
          ))}
          <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
            <Text fz="sm" fw={600} w={80} style={{ flexShrink: 0 }} c="orange.8">
              No seat yet
            </Text>
            <Group gap={4} justify="flex-end">
              {unseatedCounts.length ? (
                unseatedCounts.map(([d, n]) => (
                  <Badge key={d} size="sm" variant="outline" color={DIET_COLOR[d] ?? "gray"}>
                    {d} &times; {n}
                  </Badge>
                ))
              ) : (
                <Text fz="xs" c="gray.7">
                  None
                </Text>
              )}
            </Group>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}

export function GuestsView() {
  const plan = usePlan();
  const [query, setQuery] = useState("");
  const [party, setParty] = useState<string | null>(null);
  const [rsvp, setRsvp] = useState<RsvpFilter>("all");
  const [diet, setDiet] = useState<string | null>(null);
  const [seat, setSeat] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<RsvpFilter, number> = { all: GUESTS.length, yes: 0, maybe: 0, pending: 0, no: 0 };
    for (const x of GUESTS) c[x.rsvp] += 1;
    return c;
  }, []);

  const filtered = GUESTS.filter((x) => {
    const q = query.trim().toLowerCase();
    const tableName = plan.locations[x.id] ? (TABLES_BY_ID[plan.locations[x.id] as string]?.name ?? "") : "";
    if (q && !`${x.name} ${x.party} ${x.diet ?? ""} ${tableName}`.toLowerCase().includes(q)) return false;
    if (party && x.party !== party) return false;
    if (rsvp !== "all" && x.rsvp !== rsvp) return false;
    if (diet === NO_DIET && x.diet) return false;
    if (diet && diet !== NO_DIET && diet !== ANY && x.diet !== diet) return false;
    if (seat === "seated" && !plan.locations[x.id]) return false;
    if (seat === "unseated" && plan.locations[x.id]) return false;
    return true;
  });

  const filtersActive = Boolean(query || party || rsvp !== "all" || diet || seat);
  const clear = () => {
    setQuery("");
    setParty(null);
    setRsvp("all");
    setDiet(null);
    setSeat(null);
  };

  const rsvpChips: { value: RsvpFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "yes", label: RSVP_LABEL.yes },
    { value: "maybe", label: RSVP_LABEL.maybe },
    { value: "pending", label: RSVP_LABEL.pending },
    { value: "no", label: RSVP_LABEL.no },
  ];

  return (
    <Stack gap="md" maw={1700} mx="auto">
      <Group justify="space-between" align="flex-end" gap="sm">
        <Box>
          <Title order={1} fz={{ base: 24, sm: 28 }}>
            Guest list
          </Title>
          <Text fz="sm" c="gray.7" mt={4}>
            {EVENT.name} &middot; {counts.all} invited, {counts.yes} attending
          </Text>
        </Box>
        <Button
          variant="default"
          leftSection={<IconPrinter size={16} aria-hidden />}
          onClick={() => window.print()}
          visibleFrom="sm"
        >
          Print
        </Button>
      </Group>

      <Paper withBorder shadow="xs" p="sm">
        <Stack gap="sm">
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="sm">
            <TextInput
              label="Search"
              placeholder="Name, party, table or diet"
              leftSection={<IconSearch size={16} aria-hidden />}
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
            />
            <Select
              label="Party"
              placeholder="All parties"
              data={PARTY_ORDER}
              value={party}
              onChange={setParty}
              clearable
            />
            <Select
              label="Diet"
              placeholder="Any diet"
              data={[{ value: NO_DIET, label: "No dietary needs" }, ...ALL_DIETS.map((d) => ({ value: d, label: d }))]}
              value={diet}
              onChange={setDiet}
              clearable
            />
            <Select
              label="Seating"
              placeholder="Seated or not"
              data={[
                { value: "seated", label: "Seated" },
                { value: "unseated", label: "Not seated" },
              ]}
              value={seat}
              onChange={setSeat}
              clearable
            />
          </SimpleGrid>
          <Group gap="xs" align="center" role="group" aria-label="Filter by RSVP">
            <Text fz="sm" fw={500} mr={4}>
              RSVP
            </Text>
            <Chip.Group multiple={false} value={rsvp} onChange={(v) => setRsvp(v as RsvpFilter)}>
              {rsvpChips.map((c) => (
                <Chip key={c.value} value={c.value} size="sm" variant="light">
                  {c.label} ({counts[c.value]})
                </Chip>
              ))}
            </Chip.Group>
          </Group>
        </Stack>
      </Paper>

      <Flex direction={{ base: "column", lg: "row-reverse" }} gap="md" align="flex-start">
        <Box
          w={{ base: "100%", lg: 380 }}
          style={{ flexShrink: 0 }}
          pos={{ base: "static", lg: "sticky" }}
          top={{ lg: 76 }}
        >
          <MealCard />
        </Box>
        <Box style={{ flex: 1, minWidth: 0, width: "100%" }}>
          <Group justify="space-between" mb={6} px={2}>
            <Text fz="sm" c="gray.7" role="status" aria-live="polite">
              Showing {filtered.length} of {GUESTS.length} guests
            </Text>
            {filtersActive ? (
              <Button variant="subtle" size="compact-sm" onClick={clear}>
                Clear filters
              </Button>
            ) : null}
          </Group>

          {filtered.length === 0 ? (
            <Paper withBorder p="xl" ta="center">
              <Text fw={600}>No guests match these filters.</Text>
              <Text fz="sm" c="gray.7" mt={4}>
                Try a different search or clear the filters.
              </Text>
            </Paper>
          ) : (
            <>
              <Paper withBorder shadow="xs" visibleFrom="sm" style={{ overflow: "hidden" }}>
                <Table.ScrollContainer minWidth={620}>
                  <Table verticalSpacing="xs" horizontalSpacing="md" highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Guest</Table.Th>
                        <Table.Th>Party</Table.Th>
                        <Table.Th>RSVP</Table.Th>
                        <Table.Th>Diet</Table.Th>
                        <Table.Th>Table</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {filtered.map((x) => (
                        <Table.Tr key={x.id}>
                          <Table.Td>
                            <Group gap="sm" wrap="nowrap">
                              <Avatar size={30} radius="xl" variant="filled" color={PARTY_COLOR[x.party] ?? "gray"} fz={11} fw={700}>
                                {initials(x.name)}
                              </Avatar>
                              <Text fz="sm" fw={600}>
                                {x.name}
                              </Text>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Text fz="sm">{x.party}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge variant="light" color={RSVP_COLOR[x.rsvp]}>
                              {RSVP_LABEL[x.rsvp]}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            {x.diet ? (
                              <Badge variant="light" color={DIET_COLOR[x.diet] ?? "gray"}>
                                {x.diet}
                              </Badge>
                            ) : (
                              <Text fz="sm" c="gray.7">
                                None
                              </Text>
                            )}
                          </Table.Td>
                          <Table.Td>
                            <TableCell guest={x} tableId={plan.locations[x.id] ?? null} />
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              </Paper>

              <Stack gap="xs" hiddenFrom="sm" role="list" aria-label="Guests">
                {filtered.map((x) => (
                  <Paper key={x.id} withBorder p="sm" shadow="xs" role="listitem">
                    <Group gap="sm" wrap="nowrap" align="flex-start">
                      <Avatar size={36} radius="xl" variant="filled" color={PARTY_COLOR[x.party] ?? "gray"} fz={12} fw={700}>
                        {initials(x.name)}
                      </Avatar>
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text fz="sm" fw={600}>
                          {x.name}
                        </Text>
                        <Text fz="xs" c="gray.7">
                          {x.party}
                        </Text>
                        <Group gap={6} mt={6}>
                          <Badge variant="light" color={RSVP_COLOR[x.rsvp]}>
                            {RSVP_LABEL[x.rsvp]}
                          </Badge>
                          {x.diet ? (
                            <Badge variant="light" color={DIET_COLOR[x.diet] ?? "gray"}>
                              {x.diet}
                            </Badge>
                          ) : null}
                        </Group>
                      </Box>
                      <TableCell guest={x} tableId={plan.locations[x.id] ?? null} />
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </>
          )}
        </Box>
      </Flex>
    </Stack>
  );
}
```

```tsx components/PlanProvider.tsx
"use client";

import { VisuallyHidden } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { GUESTS, GUESTS_BY_ID, TABLES, TABLES_BY_ID } from "@/lib/data";
import { checkRules, type Locations, type RuleResult } from "@/lib/rules";

/** Table id to the guest id in each seat (null = empty seat). */
export type Seating = Record<string, (string | null)[]>;

function initialSeating(): Seating {
  const seating: Seating = {};
  for (const t of TABLES) seating[t.id] = Array.from({ length: t.seats }, () => null);
  for (const guest of GUESTS) {
    if (!guest.table) continue;
    const seats = seating[guest.table];
    const free = seats?.indexOf(null) ?? -1;
    if (seats && free >= 0) seats[free] = guest.id;
  }
  return seating;
}

function derive(seating: Seating) {
  const locations: Locations = {};
  const seatOf: Record<string, number> = {};
  const free: Record<string, number> = {};
  for (const guest of GUESTS) locations[guest.id] = null;
  for (const t of TABLES) {
    const seats = seating[t.id] ?? [];
    free[t.id] = seats.filter((s) => s === null).length;
    seats.forEach((guestId, index) => {
      if (guestId) {
        locations[guestId] = t.id;
        seatOf[guestId] = index;
      }
    });
  }
  return { locations, seatOf, free, rules: checkRules(locations, free) };
}

interface Placement {
  seating: Seating;
  ok: boolean;
  message: string;
}

function place(
  seating: Seating,
  locations: Locations,
  guestId: string,
  tableId: string,
  seatIndex?: number,
): Placement {
  const guest = GUESTS_BY_ID[guestId];
  const table = TABLES_BY_ID[tableId];
  const target = seating[tableId];
  if (!guest || !table || !target) return { seating, ok: false, message: "That seat does not exist." };

  const fromTable = locations[guestId] ?? null;
  const fromSeats = fromTable ? seating[fromTable] : undefined;
  const fromIndex = fromSeats ? fromSeats.indexOf(guestId) : -1;

  let index = seatIndex;
  if (index === undefined) {
    // Already at this table: nothing to do.
    if (fromTable === tableId) {
      return { seating, ok: true, message: `${guest.name} is already at ${table.name}.` };
    }
    index = target.indexOf(null);
    if (index < 0) {
      return { seating, ok: false, message: `${table.name} is full (${table.seats} of ${table.seats} seats).` };
    }
  }
  if (target[index] === guestId) {
    return { seating, ok: true, message: `${guest.name} is already in that seat.` };
  }

  const next: Seating = Object.fromEntries(Object.entries(seating).map(([k, v]) => [k, [...v]]));
  const occupant = next[tableId]?.[index] ?? null;
  if (fromTable && fromIndex >= 0) {
    // Swap with whoever sits in the target seat, or leave the old seat empty.
    const old = next[fromTable];
    if (old) old[fromIndex] = occupant;
  }
  const dest = next[tableId];
  if (dest) dest[index] = guestId;

  const seatNo = index + 1;
  let message: string;
  if (occupant && fromTable) {
    const other = GUESTS_BY_ID[occupant]?.name ?? "A guest";
    message = `${guest.name} swapped seats with ${other}: now ${table.name}, seat ${seatNo}.`;
  } else if (occupant) {
    const other = GUESTS_BY_ID[occupant]?.name ?? "A guest";
    message = `${guest.name} seated at ${table.name}, seat ${seatNo}. ${other} is unseated.`;
  } else if (fromTable && fromTable !== tableId) {
    message = `${guest.name} moved from ${TABLES_BY_ID[fromTable]?.name ?? "a table"} to ${table.name}, seat ${seatNo}.`;
  } else if (fromTable) {
    message = `${guest.name} moved to seat ${seatNo} at ${table.name}.`;
  } else {
    message = `${guest.name} seated at ${table.name}, seat ${seatNo}.`;
  }
  return { seating: next, ok: true, message };
}

interface Counts {
  seated: number;
  seatsTotal: number;
  freeSeats: number;
  toSeat: number;
  awaiting: number;
  declined: number;
  attending: number;
}

interface PlanContextValue {
  seating: Seating;
  locations: Locations;
  seatOf: Record<string, number>;
  free: Record<string, number>;
  counts: Counts;
  rules: RuleResult[];
  brokenRules: RuleResult[];
  brokenTableIds: Set<string>;
  flaggedGuestIds: Set<string>;
  selectedTableId: string | null;
  selectTable: (id: string | null) => void;
  armedGuestId: string | null;
  arm: (id: string | null) => void;
  dragId: string | null;
  setDragId: (id: string | null) => void;
  seatGuest: (guestId: string, tableId: string, seatIndex?: number) => boolean;
  unseat: (guestId: string) => void;
  reset: () => void;
  isDirty: boolean;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [seating, setSeating] = useState<Seating>(initialSeating);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [armedGuestId, setArmedGuestId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [isDirty, setDirty] = useState(false);

  const derived = useMemo(() => derive(seating), [seating]);
  const { locations, seatOf, free, rules } = derived;

  const counts = useMemo<Counts>(() => {
    const seatsTotal = TABLES.reduce((n, t) => n + t.seats, 0);
    const seated = GUESTS.filter((x) => locations[x.id]).length;
    return {
      seated,
      seatsTotal,
      freeSeats: seatsTotal - seated,
      toSeat: GUESTS.filter((x) => x.rsvp === "yes" && !locations[x.id]).length,
      awaiting: GUESTS.filter((x) => (x.rsvp === "maybe" || x.rsvp === "pending") && !locations[x.id])
        .length,
      declined: GUESTS.filter((x) => x.rsvp === "no").length,
      attending: GUESTS.filter((x) => x.rsvp === "yes").length,
    };
  }, [locations]);

  const brokenRules = useMemo(() => rules.filter((r) => r.status === "broken"), [rules]);
  const brokenTableIds = useMemo(
    () => new Set(brokenRules.flatMap((r) => r.tableIds)),
    [brokenRules],
  );
  const flaggedGuestIds = useMemo(
    () => new Set(brokenRules.flatMap((r) => r.guestIds)),
    [brokenRules],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setArmedGuestId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const commit = useCallback(
    (next: Seating, message: string) => {
      const after = derive(next);
      const before = new Set(rules.filter((r) => r.status === "broken").map((r) => r.rule.id));
      const fresh = after.rules.filter((r) => r.status === "broken" && !before.has(r.rule.id));
      const fixed = rules.filter(
        (r) => r.status === "broken" && after.rules.find((a) => a.rule.id === r.rule.id)?.status !== "broken",
      );
      setSeating(next);
      setDirty(true);
      let spoken = message;
      for (const r of fresh) {
        spoken += ` Rule broken: ${r.label.toLowerCase()}. ${r.detail}`;
        notifications.show({
          id: `rule-${r.rule.id}`,
          color: "red",
          title: `Rule broken: ${r.label.toLowerCase()}`,
          message: r.detail,
          autoClose: 6000,
        });
      }
      for (const r of fixed) {
        spoken += ` Rule fixed: ${r.label.toLowerCase()}.`;
        notifications.hide(`rule-${r.rule.id}`);
      }
      setAnnouncement(spoken);
    },
    [rules],
  );

  const seatGuest = useCallback(
    (guestId: string, tableId: string, seatIndex?: number) => {
      const result = place(seating, locations, guestId, tableId, seatIndex);
      if (!result.ok) {
        setAnnouncement(result.message);
        notifications.show({ color: "orange", title: "Can't seat there", message: result.message });
        return false;
      }
      if (result.seating === seating) {
        setAnnouncement(result.message);
      } else {
        commit(result.seating, result.message);
      }
      setArmedGuestId(null);
      setDragId(null);
      return true;
    },
    [seating, locations, commit],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const tableId = locations[guestId];
      const guest = GUESTS_BY_ID[guestId];
      if (!tableId || !guest) return;
      const next: Seating = Object.fromEntries(
        Object.entries(seating).map(([k, v]) => [k, v.map((s) => (s === guestId ? null : s))]),
      );
      commit(next, `${guest.name} unseated from ${TABLES_BY_ID[tableId]?.name ?? "a table"}.`);
      setArmedGuestId(null);
      setDragId(null);
    },
    [seating, locations, commit],
  );

  const reset = useCallback(() => {
    setSeating(initialSeating());
    setDirty(false);
    setArmedGuestId(null);
    setAnnouncement("Plan reset to the starting arrangement.");
  }, []);

  const value: PlanContextValue = {
    seating,
    locations,
    seatOf,
    free,
    counts,
    rules,
    brokenRules,
    brokenTableIds,
    flaggedGuestIds,
    selectedTableId,
    selectTable: setSelectedTableId,
    armedGuestId,
    arm: setArmedGuestId,
    dragId,
    setDragId,
    seatGuest,
    unseat,
    reset,
    isDirty,
  };

  return (
    <PlanContext.Provider value={value}>
      {children}
      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>
    </PlanContext.Provider>
  );
}
```

```tsx components/PlanView.tsx
"use client";

import {
  Alert,
  Box,
  Button,
  Flex,
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import {
  IconAlertTriangle,
  IconCalendarEvent,
  IconCheck,
  IconHandFinger,
  IconMapPin,
  IconRefresh,
  IconX,
} from "@tabler/icons-react";
import { useState, type ReactNode } from "react";
import { EVENT, GUESTS_BY_ID, formatEventDate } from "@/lib/data";
import { usePlan } from "./PlanProvider";
import { RoomPlan } from "./RoomPlan";
import { SidePanel, type PanelTab } from "./SidePanel";

function Stat({
  label,
  value,
  note,
  tone = "dark",
  children,
}: {
  label: string;
  value: ReactNode;
  note: string;
  tone?: string;
  children?: ReactNode;
}) {
  return (
    <Paper withBorder p="sm" shadow="xs">
      <Text fz="xs" fw={600} c="gray.7" tt="uppercase" style={{ letterSpacing: "0.04em" }}>
        {label}
      </Text>
      <Group gap={6} align="baseline" wrap="nowrap">
        <Text fz={28} fw={800} lh={1.15} c={tone}>
          {value}
        </Text>
        <Text fz="sm" c="gray.7">
          {note}
        </Text>
      </Group>
      {children}
    </Paper>
  );
}

export function PlanView() {
  const plan = usePlan();
  const [tab, setTab] = useState<PanelTab>(plan.selectedTableId ? "table" : "seat");
  const { counts, brokenRules } = plan;
  const armed = plan.armedGuestId ? GUESTS_BY_ID[plan.armedGuestId] : null;

  const confirmReset = () =>
    modals.openConfirmModal({
      title: "Reset the plan?",
      centered: true,
      children: (
        <Text fz="sm">
          Every guest goes back to the starting arrangement and your changes in this session are lost.
        </Text>
      ),
      labels: { confirm: "Reset plan", cancel: "Keep my plan" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        plan.reset();
        setTab("seat");
      },
    });

  return (
    <Stack gap="md" maw={1700} mx="auto">
      <Group justify="space-between" align="flex-end" gap="sm">
        <Box>
          <Title order={1} fz={{ base: 24, sm: 28 }}>
            Seating plan
          </Title>
          <Group gap="md" mt={4} c="gray.7">
            <Group gap={6} wrap="nowrap">
              <IconCalendarEvent size={16} aria-hidden />
              <Text fz="sm">{formatEventDate(EVENT.date)}</Text>
            </Group>
            <Group gap={6} wrap="nowrap">
              <IconMapPin size={16} aria-hidden />
              <Text fz="sm">
                {EVENT.venue} &middot; {EVENT.room.width} &times; {EVENT.room.depth} m
              </Text>
            </Group>
          </Group>
        </Box>
        <Button
          variant="default"
          leftSection={<IconRefresh size={16} aria-hidden />}
          onClick={confirmReset}
          disabled={!plan.isDirty}
        >
          Reset plan
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="sm">
        <Stat label="Seated" value={counts.seated} note={`of ${counts.seatsTotal} seats`}>
          <Progress
            mt={8}
            size="sm"
            value={(counts.seated / counts.seatsTotal) * 100}
            aria-label={`${counts.seated} of ${counts.seatsTotal} seats filled`}
          />
        </Stat>
        <Stat
          label="Still to seat"
          value={counts.toSeat}
          note={`of ${counts.attending} attending`}
          tone={counts.toSeat ? "orange.8" : "green.8"}
        />
        <Stat label="Awaiting reply" value={counts.awaiting} note="maybe or no reply" />
        <Stat
          label="Couple's rules"
          value={brokenRules.length}
          note="broken"
          tone={brokenRules.length ? "red.8" : "green.8"}
        />
      </SimpleGrid>

      {brokenRules.length > 0 ? (
        <Alert
          color="red"
          variant="light"
          role="region"
          aria-label="Broken rules"
          icon={<IconAlertTriangle size={20} aria-hidden />}
          title={brokenRules.length === 1 ? "1 rule is broken" : `${brokenRules.length} rules are broken`}
        >
          <Stack gap={4}>
            {brokenRules.map((r) => (
              <Group key={r.rule.id} gap="xs" justify="space-between" wrap="nowrap" align="flex-start">
                <Text fz="sm">
                  <b>{r.label}:</b> {r.detail}
                </Text>
                <Button
                  size="compact-sm"
                  variant="subtle"
                  color="red"
                  style={{ flexShrink: 0 }}
                  onClick={() => {
                    const first = r.tableIds[0];
                    if (first) plan.selectTable(first);
                    setTab("table");
                  }}
                >
                  Show
                </Button>
              </Group>
            ))}
          </Stack>
        </Alert>
      ) : (
        <Alert
          color="green"
          variant="light"
          role="region"
          aria-label="Rules"
          icon={<IconCheck size={20} aria-hidden />}
          py="xs"
        >
          None of the couple's rules is broken right now.
        </Alert>
      )}

      {armed ? (
        <Alert
          color="brand"
          variant="filled"
          role="region"
          aria-label="Placing a guest"
          icon={<IconHandFinger size={20} aria-hidden />}
          py="xs"
          style={{ position: "sticky", top: 68, zIndex: 30 }}
        >
          <Group justify="space-between" wrap="nowrap" gap="sm">
            <Text fz="sm" fw={600}>
              Placing {armed.name}: tap a seat or a table. Esc cancels.
            </Text>
            <Button
              size="compact-sm"
              variant="white"
              color="brand"
              leftSection={<IconX size={15} aria-hidden />}
              onClick={() => plan.arm(null)}
            >
              Cancel
            </Button>
          </Group>
        </Alert>
      ) : null}

      <Flex direction={{ base: "column", md: "row" }} gap="md" align="flex-start">
        <Box style={{ flex: 1, minWidth: 0, width: "100%" }}>
          <Paper withBorder p="sm" shadow="xs">
            <RoomPlan onTableChosen={() => setTab("table")} />
          </Paper>
        </Box>
        <Box
          w={{ base: "100%", md: 330, xl: 390 }}
          style={{ flexShrink: 0, overflowY: "auto" }}
          pos={{ base: "static", md: "sticky" }}
          top={{ md: 76 }}
          mah={{ md: "calc(100vh - 92px)" }}
        >
          <SidePanel tab={tab} setTab={setTab} />
        </Box>
      </Flex>
    </Stack>
  );
}
```

```tsx components/RoomPlan.tsx
"use client";

import { Box, Group, Text, Tooltip } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { IconAlertTriangle } from "@tabler/icons-react";
import { Fragment, useState, type CSSProperties, type DragEvent, type KeyboardEvent } from "react";
import {
  DIET_COLOR,
  EVENT,
  FIXTURES,
  GUESTS_BY_ID,
  PARTY_COLOR,
  PARTY_ORDER,
  TABLES,
  initials,
  type Table,
} from "@/lib/data";
import { cx } from "@/lib/cx";
import { usePlan } from "./PlanProvider";
import classes from "./room.module.css";

const MIN_ROOM_PX = 660;
const SEAT_D = 0.85; // metres
const LONG = { w: 5.6, h: 1.1 }; // metres

function tableRadius(t: Table): number {
  return t.seats <= 6 ? 0.85 : 1;
}

function rotate(p: { x: number; y: number }, deg: number): { x: number; y: number } {
  const a = (deg * Math.PI) / 180;
  return { x: p.x * Math.cos(a) - p.y * Math.sin(a), y: p.x * Math.sin(a) + p.y * Math.cos(a) };
}

/** Seat centres relative to the table centre, in metres, in seating order. */
function seatOffsets(t: Table): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  if (t.shape === "round") {
    const ring = tableRadius(t) + SEAT_D / 2 + 0.08;
    for (let i = 0; i < t.seats; i++) {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / t.seats;
      out.push({ x: Math.cos(a) * ring, y: Math.sin(a) * ring });
    }
  } else {
    const side = Math.ceil(t.seats / 2);
    const other = t.seats - side;
    const off = LONG.h / 2 + SEAT_D / 2 + 0.05;
    for (let j = 0; j < side; j++) out.push({ x: -LONG.w / 2 + (LONG.w / side) * (j + 0.5), y: -off });
    for (let j = 0; j < other; j++) out.push({ x: LONG.w / 2 - (LONG.w / other) * (j + 0.5), y: off });
  }
  return out.map((p) => rotate(p, t.rotation));
}

function flagOffset(t: Table): { x: number; y: number } {
  if (t.shape === "round") {
    const a = -Math.PI / 2 + Math.PI / t.seats;
    return { x: Math.cos(a) * tableRadius(t), y: Math.sin(a) * tableRadius(t) };
  }
  return rotate({ x: LONG.w / 2, y: -LONG.h / 2 }, t.rotation);
}

export function RoomPlan({ onTableChosen }: { onTableChosen: () => void }) {
  const plan = usePlan();
  const { ref, width } = useElementSize();
  const [over, setOver] = useState<string | null>(null);

  const roomPx = Math.max(width || 960, MIN_ROOM_PX);
  const ppm = roomPx / EVENT.room.width;
  const m = (v: number) => v * ppm;

  const armed = plan.armedGuestId;
  const active = armed ?? plan.dragId;
  const activeIsSeated = active ? Boolean(plan.locations[active]) : false;

  const seatClick = (t: Table, index: number, occupant: string | null) => {
    if (armed) {
      if (occupant === armed) {
        plan.arm(null);
        return;
      }
      const swap = occupant && plan.locations[armed];
      plan.seatGuest(armed, t.id, occupant && !swap ? undefined : index);
      plan.selectTable(t.id);
      return;
    }
    if (occupant) {
      plan.arm(occupant);
      plan.selectTable(t.id);
      return;
    }
    plan.selectTable(t.id);
    onTableChosen();
  };

  const tableClick = (t: Table) => {
    if (armed) {
      plan.seatGuest(armed, t.id);
      plan.selectTable(t.id);
      return;
    }
    plan.selectTable(t.id);
    onTableChosen();
  };

  const activate = (e: KeyboardEvent<HTMLElement>, fn: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  };

  const dropProps = (key: string, onDropGuest: (guestId: string) => void) => ({
    onDragOver: (e: DragEvent<HTMLElement>) => {
      if (!plan.dragId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (over !== key) setOver(key);
    },
    onDrop: (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const id = plan.dragId ?? e.dataTransfer.getData("text/plain");
      setOver(null);
      if (id) onDropGuest(id);
    },
  });

  const seatFont = Math.max(8.5, m(SEAT_D) * 0.36);

  return (
    <Box>
      <div ref={ref} className={classes.scroller} role="group" aria-label={`Room plan, ${EVENT.room.width} by ${EVENT.room.depth} metres`}>
        <div
          className={classes.room}
          style={{ width: roomPx, height: m(EVENT.room.depth), "--m": `${ppm}px` } as CSSProperties}
        >
          {FIXTURES.map((f) => (
            <div
              key={f.id}
              className={cx(classes.fixture, classes[f.kind])}
              style={{
                left: m(f.x),
                top: m(f.y),
                width: m(f.w),
                height: m(f.h),
                fontSize: f.kind === "door" ? 10 : Math.max(11, ppm * 0.36),
              }}
              aria-hidden
            >
              {f.kind === "dancefloor" ? <span className={classes.dancefloorLabel}>{f.label}</span> : f.label}
            </div>
          ))}

          {TABLES.map((t) => {
            const seats = plan.seating[t.id] ?? [];
            const filled = seats.filter(Boolean).length;
            const broken = plan.brokenTableIds.has(t.id);
            const selected = plan.selectedTableId === t.id;
            const canReceive = active ? plan.free[t.id] > 0 || plan.locations[active] === t.id : false;
            const offsets = seatOffsets(t);
            const bodyW = t.shape === "round" ? m(tableRadius(t) * 2) : m(LONG.w);
            const bodyH = t.shape === "round" ? m(tableRadius(t) * 2) : m(LONG.h);
            const flag = flagOffset(t);
            const flagD = Math.max(16, m(0.55));
            const tableKey = `table:${t.id}`;
            const visible = t.shape === "round" ? `${t.name} ${filled}/${t.seats}` : `${t.name} · ${filled}/${t.seats}`;
            const label = `${visible}: ${filled} of ${t.seats} seats taken${broken ? ", a rule is broken here" : ""}`;
            return (
              <Fragment key={t.id}>
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={label}
                  aria-pressed={selected}
                  className={cx(
                    classes.tableBody,
                    t.shape === "round" ? classes.round : classes.long,
                    selected && classes.selected,
                    broken && classes.broken,
                    active && canReceive && classes.armedOk,
                    active && !canReceive && classes.armedFull,
                    over === tableKey && classes.dropOver,
                  )}
                  style={{
                    left: m(t.x) - bodyW / 2,
                    top: m(t.y) - bodyH / 2,
                    width: bodyW,
                    height: bodyH,
                    fontSize: Math.min(13, Math.max(9.5, ppm * 0.32)),
                    transform: t.rotation ? `rotate(${t.rotation}deg)` : undefined,
                  }}
                  onClick={() => tableClick(t)}
                  onKeyDown={(e) => activate(e, () => tableClick(t))}
                  {...dropProps(tableKey, (id) => {
                    plan.seatGuest(id, t.id);
                    plan.selectTable(t.id);
                  })}
                >
                  {t.shape === "round" ? (
                    <>
                      <span style={{ fontWeight: 700 }}>{t.name}</span>{" "}
                      <span style={{ color: "var(--mantine-color-gray-7)", fontWeight: 600 }}>
                        {filled}/{t.seats}
                      </span>
                    </>
                  ) : (
                    <span style={{ fontWeight: 700 }}>
                      {t.name} {"·"}{" "}
                      <span style={{ color: "var(--mantine-color-gray-7)", fontWeight: 600 }}>
                        {filled}/{t.seats}
                      </span>
                    </span>
                  )}
                </div>

                {offsets.map((off, index) => {
                  const occupant = seats[index] ?? null;
                  const guest = occupant ? GUESTS_BY_ID[occupant] : null;
                  const px = m(SEAT_D);
                  const seatKey = `seat:${t.id}:${index}`;
                  const isArmed = guest !== null && guest !== undefined && armed === guest.id;
                  const flagged = guest ? plan.flaggedGuestIds.has(guest.id) : false;
                  const seatLabel = guest
                    ? `${initials(guest.name)} ${guest.name}, ${t.name}, seat ${index + 1}${guest.diet ? `, ${guest.diet}` : ""}${
                        flagged ? ", involved in a broken rule" : ""
                      }`
                    : `${t.name}, seat ${index + 1}: empty`;
                  const tip = guest
                    ? `${guest.name} · ${guest.party}${guest.diet ? ` · ${guest.diet}` : ""}`
                    : `Seat ${index + 1}, empty`;
                  return (
                    <Tooltip key={seatKey} label={tip} disabled={plan.dragId !== null} events={{ hover: true, focus: true, touch: false }}>
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label={seatLabel}
                        aria-pressed={guest ? isArmed : undefined}
                        draggable={guest !== null && guest !== undefined}
                        className={cx(
                          classes.seat,
                          !guest && classes.seatEmpty,
                          !guest && active && classes.seatTarget,
                          guest && active && activeIsSeated && !isArmed && classes.seatSwap,
                          isArmed && classes.seatArmed,
                          flagged && classes.seatFlag,
                          over === seatKey && classes.seatDrop,
                        )}
                        style={
                          {
                            left: m(t.x + off.x) - px / 2,
                            top: m(t.y + off.y) - px / 2,
                            width: px,
                            height: px,
                            fontSize: seatFont,
                            "--seat-bg": guest
                              ? `var(--mantine-color-${PARTY_COLOR[guest.party] ?? "gray"}-filled)`
                              : undefined,
                          } as CSSProperties
                        }
                        onClick={() => seatClick(t, index, occupant)}
                        onKeyDown={(e) => activate(e, () => seatClick(t, index, occupant))}
                        onDragStart={(e) => {
                          if (!guest) return;
                          e.dataTransfer.setData("text/plain", guest.id);
                          e.dataTransfer.effectAllowed = "move";
                          plan.setDragId(guest.id);
                        }}
                        onDragEnd={() => {
                          plan.setDragId(null);
                          setOver(null);
                        }}
                        {...dropProps(seatKey, (id) => {
                          if (id === occupant) return;
                          const swap = occupant && plan.locations[id];
                          plan.seatGuest(id, t.id, occupant && !swap ? undefined : index);
                          plan.selectTable(t.id);
                        })}
                      >
                        {guest ? initials(guest.name) : index + 1}
                        {guest?.diet ? (
                          <span
                            className={classes.dot}
                            aria-hidden
                            style={
                              {
                                width: px * 0.34,
                                height: px * 0.34,
                                right: -px * 0.06,
                                top: -px * 0.06,
                                "--dot-bg": `var(--mantine-color-${DIET_COLOR[guest.diet] ?? "gray"}-filled)`,
                              } as CSSProperties
                            }
                          />
                        ) : null}
                      </div>
                    </Tooltip>
                  );
                })}

                {broken ? (
                  <span
                    className={classes.flag}
                    aria-hidden
                    style={{
                      width: flagD,
                      height: flagD,
                      left: m(t.x + flag.x) - flagD / 2,
                      top: m(t.y + flag.y) - flagD / 2,
                    }}
                  >
                    <IconAlertTriangle size={flagD * 0.62} stroke={2.6} />
                  </span>
                ) : null}
              </Fragment>
            );
          })}
        </div>
      </div>

      <Group gap="lg" mt="sm" align="flex-start" justify="space-between">
        <Group gap="sm" wrap="wrap" role="list" aria-label="Party colours">
          {PARTY_ORDER.map((p) => (
            <Group key={p} gap={6} wrap="nowrap" role="listitem">
              <Box
                w={12}
                h={12}
                style={{
                  borderRadius: "50%",
                  background: `var(--mantine-color-${PARTY_COLOR[p] ?? "gray"}-filled)`,
                }}
              />
              <Text fz="xs" c="gray.8">
                {p}
              </Text>
            </Group>
          ))}
        </Group>
        <Group gap="md" wrap="wrap">
          <Group gap={6} wrap="nowrap">
            <Box
              w={12}
              h={12}
              style={{ borderRadius: "50%", border: "2px dashed var(--mantine-color-gray-5)", background: "var(--mantine-color-gray-0)" }}
            />
            <Text fz="xs" c="gray.8">
              Empty seat
            </Text>
          </Group>
          <Group gap={6} wrap="nowrap">
            <Box w={9} h={9} style={{ borderRadius: "50%", background: "var(--mantine-color-green-filled)" }} />
            <Text fz="xs" c="gray.8">
              Dot = dietary need
            </Text>
          </Group>
          <Group gap={6} wrap="nowrap">
            <Box
              w={ppm * 5}
              h={7}
              style={{
                borderLeft: "2px solid var(--mantine-color-gray-7)",
                borderRight: "2px solid var(--mantine-color-gray-7)",
                borderBottom: "2px solid var(--mantine-color-gray-7)",
              }}
              aria-hidden
            />
            <Text fz="xs" c="gray.8">
              5 m
            </Text>
          </Group>
        </Group>
      </Group>
    </Box>
  );
}
```

```tsx components/SidePanel.tsx
"use client";

import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Paper,
  Progress,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconArrowsMove,
  IconCheck,
  IconChevronLeft,
  IconClock,
  IconMapPin,
  IconUserMinus,
} from "@tabler/icons-react";
import type { DragEvent } from "react";
import {
  DIET_COLOR,
  GUESTS,
  GUESTS_BY_ID,
  PARTY_COLOR,
  PARTY_ORDER,
  TABLES,
  TABLES_BY_ID,
  initials,
  type Table,
} from "@/lib/data";
import { cx } from "@/lib/cx";
import type { RuleResult, RuleStatus } from "@/lib/rules";
import { GuestChip } from "./GuestChip";
import { usePlan } from "./PlanProvider";
import classes from "./room.module.css";

export type PanelTab = "seat" | "table" | "rules";

const STATUS_COLOR: Record<RuleStatus, string> = { ok: "green", broken: "red", pending: "gray" };
const STATUS_LABEL: Record<RuleStatus, string> = { ok: "Kept", broken: "Broken", pending: "Not placed yet" };

function StatusIcon({ status }: { status: RuleStatus }) {
  const color = `var(--mantine-color-${STATUS_COLOR[status]}-${status === "pending" ? 6 : 7})`;
  if (status === "ok") return <IconCheck size={18} color={color} aria-hidden />;
  if (status === "broken") return <IconAlertTriangle size={18} color={color} aria-hidden />;
  return <IconClock size={18} color={color} aria-hidden />;
}

function ToSeatPanel() {
  const plan = usePlan();
  const order = (party: string) => PARTY_ORDER.indexOf(party);
  const sorter = (a: { party: string; name: string }, b: { party: string; name: string }) =>
    order(a.party) - order(b.party) || a.name.localeCompare(b.name);
  const toSeat = GUESTS.filter((x) => x.rsvp === "yes" && !plan.locations[x.id]).sort(sorter);
  const awaiting = GUESTS.filter(
    (x) => (x.rsvp === "maybe" || x.rsvp === "pending") && !plan.locations[x.id],
  ).sort(sorter);

  const dragSeated = plan.dragId ? Boolean(plan.locations[plan.dragId]) : false;
  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (dragSeated) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    }
  };
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const id = plan.dragId ?? e.dataTransfer.getData("text/plain");
    if (id) plan.unseat(id);
  };

  return (
    <Stack
      gap="sm"
      p="xs"
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cx(classes.dropZone, dragSeated && classes.dropZoneActive)}
      style={{ borderRadius: "var(--mantine-radius-md)" }}
    >
      {dragSeated ? (
        <Paper p="md" withBorder style={{ borderStyle: "dashed" }} ta="center">
          <Text fz="sm" fw={600}>
            Drop here to unseat
          </Text>
        </Paper>
      ) : null}

      <Group justify="space-between" align="baseline">
        <Text fz="sm" fw={700}>
          Attending, no seat yet
        </Text>
        <Badge variant="light" color={toSeat.length ? "orange" : "green"} size="lg">
          {toSeat.length}
        </Badge>
      </Group>

      {toSeat.length === 0 ? (
        <Paper withBorder p="md" bg="green.0">
          <Group gap="xs" wrap="nowrap">
            <IconCheck size={18} color="var(--mantine-color-green-8)" aria-hidden />
            <Text fz="sm">Everyone who is attending has a seat.</Text>
          </Group>
        </Paper>
      ) : (
        <Stack gap={6} role="list" aria-label="Attending guests without a seat">
          {toSeat.map((x) => (
            <div key={x.id} role="listitem">
              <GuestChip guest={x} />
            </div>
          ))}
        </Stack>
      )}

      {awaiting.length > 0 ? (
        <>
          <Divider my={4} />
          <Group justify="space-between" align="baseline">
            <Text fz="sm" fw={700}>
              Awaiting a reply
            </Text>
            <Badge variant="light" color="gray" size="lg">
              {awaiting.length}
            </Badge>
          </Group>
          <Text fz="xs" c="gray.7">
            Not confirmed yet. You can hold a seat for them, or leave them off the plan.
          </Text>
          <Stack gap={6} role="list" aria-label="Guests who have not confirmed">
            {awaiting.map((x) => (
              <div key={x.id} role="listitem">
                <GuestChip guest={x} />
              </div>
            ))}
          </Stack>
        </>
      ) : null}

      <Text fz="xs" c="gray.7" mt={4}>
        Tap a guest, then a seat or table. On a mouse you can also drag. {plan.counts.declined} declined and
        are not listed.
      </Text>
    </Stack>
  );
}

function TableList() {
  const plan = usePlan();
  return (
    <Stack gap={4} p="xs">
      <Text fz="sm" fw={700} mb={4}>
        All tables
      </Text>
      {TABLES.map((t) => {
        const filled = (plan.seating[t.id] ?? []).filter(Boolean).length;
        const broken = plan.brokenTableIds.has(t.id);
        return (
          <button
            key={t.id}
            type="button"
            className={classes.rowButton}
            onClick={() => plan.selectTable(t.id)}
          >
            <Box p="xs">
              <Group justify="space-between" wrap="nowrap" mb={6}>
                <Group gap={6} wrap="nowrap">
                  <Text fz="sm" fw={600}>
                    {t.name}
                  </Text>
                  {broken ? (
                    <IconAlertTriangle size={15} color="var(--mantine-color-red-7)" aria-hidden />
                  ) : null}
                </Group>
                <Text fz="sm" c="gray.7">
                  {filled}/{t.seats} seats
                </Text>
              </Group>
              <Progress
                value={(filled / t.seats) * 100}
                size="sm"
                color={filled === t.seats ? "green" : "brand"}
                aria-hidden
              />
            </Box>
          </button>
        );
      })}
    </Stack>
  );
}

function dietSummary(table: Table, seats: (string | null)[]) {
  const counts = new Map<string, number>();
  for (const id of seats) {
    const diet = id ? GUESTS_BY_ID[id]?.diet : null;
    if (diet) counts.set(diet, (counts.get(diet) ?? 0) + 1);
  }
  return { table, counts: [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0])) };
}

function TableDetail({ tableId, onSeeRules }: { tableId: string; onSeeRules: () => void }) {
  const plan = usePlan();
  const table = TABLES_BY_ID[tableId];
  if (!table) return null;
  const seats = plan.seating[tableId] ?? [];
  const filled = seats.filter(Boolean).length;
  const armedGuest = plan.armedGuestId ? GUESTS_BY_ID[plan.armedGuestId] : null;
  const rules = plan.brokenRules.filter((r) => r.tableIds.includes(tableId));
  const diets = dietSummary(table, seats).counts;
  const standard = seats.filter((id) => id && !GUESTS_BY_ID[id]?.diet).length;

  return (
    <Stack gap="sm" p="xs">
      <Group justify="space-between" wrap="nowrap">
        <Button
          variant="subtle"
          size="compact-sm"
          color="gray.7"
          leftSection={<IconChevronLeft size={16} aria-hidden />}
          onClick={() => plan.selectTable(null)}
        >
          All tables
        </Button>
        <Badge variant="light" color={filled === table.seats ? "green" : "brand"} size="lg">
          {filled} of {table.seats} seats
        </Badge>
      </Group>
      <Title order={3} fz="xl">
        {table.name}
      </Title>

      {rules.map((r) => (
        <Alert
          key={r.rule.id}
          color="red"
          variant="light"
          icon={<IconAlertTriangle size={18} aria-hidden />}
          title={r.label}
          p="sm"
        >
          <Text fz="sm">{r.detail}</Text>
          {r.hint ? (
            <Text fz="xs" mt={4}>
              {r.hint}
            </Text>
          ) : null}
        </Alert>
      ))}
      {rules.length > 0 ? (
        <Button variant="subtle" size="compact-sm" onClick={onSeeRules} style={{ alignSelf: "flex-start" }}>
          See all rules
        </Button>
      ) : null}

      <Stack gap={2} role="list" aria-label={`${table.name} seats`}>
        {seats.map((id, index) => {
          const guest = id ? GUESTS_BY_ID[id] : null;
          const isArmed = guest ? plan.armedGuestId === guest.id : false;
          return (
            <Group
              key={`${tableId}-${index}`}
              role="listitem"
              wrap="nowrap"
              gap="xs"
              p={6}
              style={{
                borderRadius: "var(--mantine-radius-md)",
                background: isArmed ? "var(--mantine-color-brand-0)" : undefined,
              }}
            >
              <Text w={18} fz="xs" c="gray.7" ta="right" aria-hidden>
                {index + 1}
              </Text>
              {guest ? (
                <>
                  <Avatar size={30} radius="xl" variant="filled" color={PARTY_COLOR[guest.party] ?? "gray"} fz={11} fw={700}>
                    {initials(guest.name)}
                  </Avatar>
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text fz="sm" fw={600} truncate lh={1.25}>
                      {guest.name}
                    </Text>
                    <Group gap={6} wrap="nowrap">
                      <Text fz="xs" c="gray.7" truncate lh={1.25}>
                        {guest.party}
                      </Text>
                    </Group>
                  </Box>
                  {guest.diet ? (
                    <Badge size="sm" variant="light" color={DIET_COLOR[guest.diet] ?? "gray"}>
                      {guest.diet}
                    </Badge>
                  ) : null}
                  <ActionIcon
                    variant={isArmed ? "filled" : "subtle"}
                    color="brand"
                    size={32}
                    aria-label={`Move ${guest.name} to another seat`}
                    aria-pressed={isArmed}
                    onClick={() => plan.arm(isArmed ? null : guest.id)}
                  >
                    <IconArrowsMove size={17} aria-hidden />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size={32}
                    aria-label={`Unseat ${guest.name}`}
                    onClick={() => plan.unseat(guest.id)}
                  >
                    <IconUserMinus size={17} aria-hidden />
                  </ActionIcon>
                </>
              ) : (
                <>
                  <Box
                    w={30}
                    h={30}
                    style={{
                      borderRadius: "50%",
                      border: "2px dashed var(--mantine-color-gray-5)",
                      flexShrink: 0,
                    }}
                    aria-hidden
                  />
                  <Text fz="sm" c="gray.7" style={{ flex: 1 }}>
                    Empty seat
                  </Text>
                  {armedGuest ? (
                    <Button
                      size="compact-sm"
                      variant="light"
                      onClick={() => plan.seatGuest(armedGuest.id, tableId, index)}
                    >
                      Seat {armedGuest.name.split(" ")[0]} here
                    </Button>
                  ) : null}
                </>
              )}
            </Group>
          );
        })}
      </Stack>

      <Divider />
      <Box>
        <Text fz="sm" fw={700} mb={6}>
          Dietary needs at this table
        </Text>
        {diets.length === 0 ? (
          <Text fz="sm" c="gray.7">
            {filled === 0 ? "Nobody is seated here yet." : "None. Everyone is on the standard menu."}
          </Text>
        ) : (
          <Group gap={6}>
            {diets.map(([diet, n]) => (
              <Badge key={diet} variant="light" color={DIET_COLOR[diet] ?? "gray"} size="lg">
                {diet} &times; {n}
              </Badge>
            ))}
            {standard > 0 ? (
              <Badge variant="outline" color="gray" size="lg">
                Standard &times; {standard}
              </Badge>
            ) : null}
          </Group>
        )}
      </Box>
    </Stack>
  );
}

function RuleCard({ result, onShow }: { result: RuleResult; onShow: (r: RuleResult) => void }) {
  const color = STATUS_COLOR[result.status];
  return (
    <Paper
      withBorder
      p="sm"
      style={{
        borderLeft: `4px solid var(--mantine-color-${color}-${result.status === "pending" ? 5 : 7})`,
      }}
    >
      <Group justify="space-between" wrap="nowrap" mb={4}>
        <Group gap={8} wrap="nowrap">
          <StatusIcon status={result.status} />
          <Text fz="sm" fw={700}>
            {result.label}
          </Text>
        </Group>
        <Badge size="sm" variant="light" color={color}>
          {STATUS_LABEL[result.status]}
        </Badge>
      </Group>
      <Text fz="sm">{result.detail}</Text>
      {result.hint ? (
        <Text fz="xs" c="gray.7" mt={4}>
          {result.hint}
        </Text>
      ) : null}
      <Text fz="xs" c="gray.7" mt={6} fs="italic">
        Couple's note: {result.rule.note}
      </Text>
      {result.rule.caveat ? (
        <Text fz="xs" mt={6} c="yellow.9">
          Check: {result.rule.caveat}
        </Text>
      ) : null}
      {result.tableIds.length > 0 ? (
        <Button
          mt={8}
          size="compact-sm"
          variant="subtle"
          leftSection={<IconMapPin size={15} aria-hidden />}
          onClick={() => onShow(result)}
        >
          Show {result.status === "pending" ? "fitting " : ""}
          {result.tableIds.length > 1 ? "tables" : "table"}
        </Button>
      ) : null}
    </Paper>
  );
}

function RulesPanel({ onShow }: { onShow: (r: RuleResult) => void }) {
  const plan = usePlan();
  const broken = plan.rules.filter((r) => r.status === "broken").length;
  const ok = plan.rules.filter((r) => r.status === "ok").length;
  const pending = plan.rules.filter((r) => r.status === "pending").length;
  const sorted = [...plan.rules].sort((a, b) => {
    const rank: Record<RuleStatus, number> = { broken: 0, pending: 1, ok: 2 };
    return rank[a.status] - rank[b.status];
  });
  return (
    <Stack gap="sm" p="xs">
      <Group gap={6}>
        <Badge color={broken ? "red" : "green"} variant={broken ? "filled" : "light"} c={broken ? "white" : "dark.9"} size="lg">
          {broken} broken
        </Badge>
        <Badge color="green" variant="light" size="lg">
          {ok} kept
        </Badge>
        <Badge color="gray" variant="light" size="lg">
          {pending} not placed yet
        </Badge>
      </Group>
      <Stack gap="xs">
        {sorted.map((r) => (
          <RuleCard key={r.rule.id} result={r} onShow={onShow} />
        ))}
      </Stack>
    </Stack>
  );
}

export function SidePanel({ tab, setTab }: { tab: PanelTab; setTab: (t: PanelTab) => void }) {
  const plan = usePlan();

  const showRule = (r: RuleResult) => {
    const first = r.tableIds[0];
    if (first) plan.selectTable(first);
    setTab("table");
  };

  return (
    <Paper withBorder shadow="xs" style={{ overflow: "hidden" }}>
      <Tabs value={tab} onChange={(v) => v && setTab(v as PanelTab)} keepMounted={false}>
        <Tabs.List grow>
          <Tabs.Tab value="seat" rightSection={<Badge size="sm" circle variant="light" color={plan.counts.toSeat ? "orange" : "green"}>{plan.counts.toSeat}</Badge>}>
            To seat
          </Tabs.Tab>
          <Tabs.Tab value="table">Table</Tabs.Tab>
          <Tabs.Tab
            value="rules"
            rightSection={
              plan.brokenRules.length ? (
                <Badge size="sm" circle color="red" c="white">
                  {plan.brokenRules.length}
                </Badge>
              ) : null
            }
          >
            Rules
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="seat" p="xs">
          <ToSeatPanel />
        </Tabs.Panel>
        <Tabs.Panel value="table" p="xs">
          {plan.selectedTableId ? (
            <TableDetail tableId={plan.selectedTableId} onSeeRules={() => setTab("rules")} />
          ) : (
            <TableList />
          )}
        </Tabs.Panel>
        <Tabs.Panel value="rules" p="xs">
          <RulesPanel onShow={showRule} />
        </Tabs.Panel>
      </Tabs>
    </Paper>
  );
}
```

```css components/room.module.css
.scroller { overflow-x: auto; overflow-y: hidden; border-radius: var(--mantine-radius-md); }
.room {
  position: relative;
  box-shadow: inset 0 0 0 3px var(--mantine-color-dark-4);
  border-radius: var(--mantine-radius-md);
  background-color: var(--mantine-color-yellow-0);
  background-image:
    linear-gradient(to right, var(--mantine-color-yellow-1) 1px, transparent 1px),
    linear-gradient(to bottom, var(--mantine-color-yellow-1) 1px, transparent 1px);
  background-size: var(--m) var(--m);
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.fixture {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-weight: 700;
  pointer-events: none;
  overflow: hidden;
}
.stage { background: var(--mantine-color-dark-7); color: var(--mantine-color-white); border-radius: 6px; box-shadow: var(--mantine-shadow-sm); }
.dancefloor {
  background: repeating-conic-gradient(var(--mantine-color-yellow-2) 0 25%, var(--mantine-color-yellow-1) 0 50%) 0 0 / var(--m) var(--m);
  color: var(--mantine-color-dark-6);
  border: 2px solid var(--mantine-color-yellow-4);
  border-radius: 4px;
}
.dancefloorLabel { background: var(--mantine-color-white); padding: 2px 8px; border-radius: 4px; }
.bar { background: var(--mantine-color-yellow-9); color: var(--mantine-color-white); border-radius: 6px; box-shadow: var(--mantine-shadow-sm); }
.door {
  background: var(--mantine-color-brand-9);
  color: var(--mantine-color-white);
  border-radius: 0 3px 3px 0;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}
.tableBody {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: var(--mantine-color-white);
  border: 2px solid var(--mantine-color-gray-5);
  color: var(--mantine-color-dark-8);
  box-shadow: var(--mantine-shadow-sm);
  cursor: pointer;
  line-height: 1.15;
  touch-action: manipulation;
  transition: box-shadow 0.12s, border-color 0.12s;
}
.tableBody:hover { border-color: var(--mantine-color-gray-7); }
.tableBody:focus-visible, .seat:focus-visible, .chip:focus-visible, .rowButton:focus-visible {
  outline: 3px solid var(--mantine-color-brand-4);
  outline-offset: 2px;
}
.round { border-radius: 50%; }
.long { border-radius: 10px; }
.selected { border-color: var(--mantine-color-brand-9); box-shadow: 0 0 0 4px var(--mantine-color-brand-2); }
.broken { border-color: var(--mantine-color-red-7); }
.armedOk { border-style: dashed; border-color: var(--mantine-color-brand-7); background: var(--mantine-color-brand-0); }
.armedFull { opacity: 0.55; cursor: not-allowed; }
.dropOver { border-color: var(--mantine-color-brand-9); background: var(--mantine-color-brand-1); box-shadow: 0 0 0 5px var(--mantine-color-brand-3); }
.flag {
  position: absolute;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--mantine-color-red-7);
  color: var(--mantine-color-white);
  border: 2px solid var(--mantine-color-white);
  box-shadow: var(--mantine-shadow-sm);
  pointer-events: none;
}
.seat {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--seat-bg);
  color: var(--mantine-color-white);
  font-weight: 700;
  border: 2px solid var(--mantine-color-white);
  box-shadow: var(--mantine-shadow-sm);
  cursor: grab;
  touch-action: manipulation;
  transition: transform 0.12s, box-shadow 0.12s;
}
.seat:hover { transform: scale(1.1); }
.seatEmpty {
  background: var(--mantine-color-gray-0);
  color: var(--mantine-color-gray-7);
  border: 2px dashed var(--mantine-color-gray-5);
  box-shadow: none;
  font-weight: 500;
  cursor: pointer;
}
.seatTarget { border-color: var(--mantine-color-brand-7); background: var(--mantine-color-brand-1); color: var(--mantine-color-brand-9); cursor: copy; }
.seatSwap { cursor: copy; }
.seatArmed { box-shadow: 0 0 0 3px var(--mantine-color-white), 0 0 0 6px var(--mantine-color-brand-9); transform: scale(1.12); }
.seatFlag { box-shadow: 0 0 0 2px var(--mantine-color-white), 0 0 0 4.5px var(--mantine-color-red-7); }
.seatDrop { transform: scale(1.18); box-shadow: 0 0 0 3px var(--mantine-color-white), 0 0 0 6px var(--mantine-color-brand-9); }
.dot { position: absolute; border-radius: 50%; border: 1.5px solid var(--mantine-color-white); background: var(--dot-bg); pointer-events: none; }
.chip { cursor: grab; touch-action: manipulation; transition: box-shadow 0.12s, background-color 0.12s; }
.chip:hover { border-color: var(--mantine-color-gray-5); background: var(--mantine-color-gray-0); }
.chipArmed { border-color: var(--mantine-color-brand-9); background: var(--mantine-color-brand-0); box-shadow: 0 0 0 2px var(--mantine-color-brand-3); }
.dropZone { transition: box-shadow 0.12s, background-color 0.12s; }
.dropZoneActive { background: var(--mantine-color-brand-0); box-shadow: inset 0 0 0 2px var(--mantine-color-brand-5); }
.rowButton { display: block; width: 100%; text-align: left; background: transparent; border: 0; padding: 0; font: inherit; color: inherit; cursor: pointer; border-radius: var(--mantine-radius-md); }
.rowButton:hover { background: var(--mantine-color-gray-0); }
@media (prefers-reduced-motion: reduce) {
  .seat, .tableBody, .chip, .dropZone { transition: none; }
}
```

```ts lib/cx.ts
/** Join class names, skipping falsy parts. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
```

```ts lib/data.ts
export type Rsvp = "yes" | "no" | "maybe" | "pending";

export interface Guest {
  id: string;
  name: string;
  party: string;
  rsvp: Rsvp;
  diet: string | null;
  table: string | null;
}

export interface Table {
  id: string;
  name: string;
  shape: "round" | "long";
  seats: number;
  x: number;
  y: number;
  rotation: number;
}

export interface Fixture {
  id: string;
  kind: "stage" | "dancefloor" | "bar" | "door";
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Rule {
  id: string;
  kind: "together" | "apart" | "near";
  guests: string[];
  note: string;
  /** near rules: the fixture to sit close to, and how close (metres, table centre to fixture centre). */
  target?: string;
  maxFromTarget?: number;
  /** near rules: the fixture to sit away from, and how far. */
  awayFrom?: string;
  minFromAway?: number;
  /** Something Hannah should double-check in the source data. */
  caveat?: string;
}

export const APP_NAME = "Seatwise";

export const EVENT = {
  name: "Ines & Mateo's wedding dinner",
  date: "2027-06-19",
  venue: "The Orangery, Hollin Hall",
  room: { width: 24, depth: 14 },
};

export const PLANNER = { name: "Hannah Brook", initials: "HB" };

export const FIXTURES: Fixture[] = [
  { id: "f-1", kind: "stage", label: "Band", x: 10, y: 0.5, w: 4, h: 2 },
  { id: "f-2", kind: "dancefloor", label: "Dance floor", x: 8.5, y: 3, w: 7, h: 4 },
  { id: "f-3", kind: "bar", label: "Bar", x: 21, y: 10, w: 2.5, h: 3.5 },
  { id: "f-4", kind: "door", label: "Garden doors", x: 0, y: 6, w: 0.5, h: 2.5 },
];

export const TABLES: Table[] = [
  { id: "t-head", name: "Top table", shape: "long", seats: 8, x: 8, y: 8.2, rotation: 0 },
  { id: "t-1", name: "Table 1", shape: "round", seats: 8, x: 3, y: 2.5, rotation: 0 },
  { id: "t-2", name: "Table 2", shape: "round", seats: 8, x: 3, y: 7, rotation: 0 },
  { id: "t-3", name: "Table 3", shape: "round", seats: 8, x: 3, y: 11.5, rotation: 0 },
  { id: "t-4", name: "Table 4", shape: "round", seats: 8, x: 19, y: 2.5, rotation: 0 },
  { id: "t-5", name: "Table 5", shape: "round", seats: 8, x: 19, y: 7, rotation: 0 },
  { id: "t-6", name: "Table 6", shape: "round", seats: 6, x: 12, y: 12, rotation: 0 },
];

function g(
  id: string,
  name: string,
  party: string,
  rsvp: Rsvp,
  diet: string | null,
  table: string | null,
): Guest {
  return { id, name, party, rsvp, diet, table };
}

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
];

export const RULES: Rule[] = [
  { id: "r-1", kind: "together", guests: ["g-21", "g-22"], note: "Couple" },
  { id: "r-2", kind: "together", guests: ["g-32", "g-33"], note: "Siblings, under 10" },
  {
    id: "r-3",
    kind: "apart",
    guests: ["g-29", "g-30"],
    note: "Brothers Sean and Ryan Doyle are not speaking",
    caveat:
      "The note names Sean and Ryan Doyle, but the rule lists Kai Brennan and Sean Doyle. Worth confirming which pair is meant.",
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
    target: "f-4",
    maxFromTarget: 4.5,
    awayFrom: "f-1",
    minFromAway: 7,
  },
];

export const RULE_LABEL: Record<Rule["kind"], string> = {
  together: "Keep together",
  apart: "Keep apart",
  near: "Seat near",
};

export const PARTY_ORDER = [
  "Couple",
  "Bride's family",
  "Groom's family",
  "University friends",
  "Work friends",
  "Groom's football club",
  "Plus-ones",
];

/** Mantine colour name per party, used for seat fills and legends. */
export const PARTY_COLOR: Record<string, string> = {
  Couple: "grape",
  "Bride's family": "cyan",
  "Groom's family": "ember",
  "University friends": "indigo",
  "Work friends": "teal",
  "Groom's football club": "pink",
  "Plus-ones": "gray",
};

export const DIET_COLOR: Record<string, string> = {
  Vegetarian: "green",
  Vegan: "teal",
  "Gluten free": "yellow",
  "Nut allergy": "red",
  Halal: "violet",
  "Soft food": "orange",
  Pescatarian: "cyan",
  "Children's menu": "pink",
};

export const STANDARD_MEAL = "Standard menu";

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "No reply yet",
  no: "Declined",
};

export const RSVP_COLOR: Record<Rsvp, string> = {
  yes: "green",
  maybe: "yellow",
  pending: "gray",
  no: "red",
};

export const GUESTS_BY_ID: Record<string, Guest> = Object.fromEntries(
  GUESTS.map((x) => [x.id, x]),
);
export const TABLES_BY_ID: Record<string, Table> = Object.fromEntries(
  TABLES.map((x) => [x.id, x]),
);
export const FIXTURES_BY_ID: Record<string, Fixture> = Object.fromEntries(
  FIXTURES.map((x) => [x.id, x]),
);

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function formatEventDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeZone: "UTC",
  }).format(new Date(`${iso}T12:00:00Z`));
}
```

```ts lib/rules.ts
import {
  FIXTURES_BY_ID,
  GUESTS_BY_ID,
  RULES,
  RULE_LABEL,
  TABLES,
  TABLES_BY_ID,
  type Rule,
} from "./data";

export type RuleStatus = "ok" | "broken" | "pending";

export interface RuleResult {
  rule: Rule;
  status: RuleStatus;
  label: string;
  /** Tables to flag when the rule is broken, or to open when the row is chosen. */
  tableIds: string[];
  /** Guests whose seats are marked when the rule is broken. */
  guestIds: string[];
  /** One short sentence for the summary. */
  detail: string;
  /** Optional second sentence, e.g. which tables would fit. */
  hint?: string;
}

/** Guest id to table id (or null when unseated). */
export type Locations = Record<string, string | null>;

function nameOf(id: string): string {
  return GUESTS_BY_ID[id]?.name ?? id;
}

function tableName(id: string | null | undefined): string {
  return (id && TABLES_BY_ID[id]?.name) || "no table";
}

function distanceToFixture(tableId: string, fixtureId: string): number {
  const t = TABLES_BY_ID[tableId];
  const f = FIXTURES_BY_ID[fixtureId];
  if (!t || !f) return Number.POSITIVE_INFINITY;
  return Math.hypot(t.x - (f.x + f.w / 2), t.y - (f.y + f.h / 2));
}

function metres(n: number): string {
  return `${n.toFixed(1)} m`;
}

function lower(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function joinNames(ids: string[]): string {
  const names = ids.map(nameOf);
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function checkTogether(rule: Rule, loc: Locations): RuleResult {
  const seated = rule.guests.filter((id) => loc[id]);
  const tables = [...new Set(seated.map((id) => loc[id] as string))];
  const label = RULE_LABEL[rule.kind];
  if (tables.length > 1) {
    return {
      rule,
      status: "broken",
      label,
      tableIds: tables,
      guestIds: seated,
      detail: `${seated
        .map((id) => `${nameOf(id)} (${tableName(loc[id])})`)
        .join(" and ")} are at different tables.`,
      hint: "Move one of them so they share a table.",
    };
  }
  if (seated.length < rule.guests.length) {
    const missing = rule.guests.filter((id) => !loc[id]);
    return {
      rule,
      status: "pending",
      label,
      tableIds: tables,
      guestIds: [],
      detail: `${joinNames(missing)} ${missing.length > 1 ? "are" : "is"} not seated yet.`,
      hint: tables[0] ? `Seat them at ${tableName(tables[0])} to keep the pair together.` : undefined,
    };
  }
  return {
    rule,
    status: "ok",
    label,
    tableIds: tables,
    guestIds: [],
    detail: `${joinNames(rule.guests)} are together at ${tableName(tables[0])}.`,
  };
}

function checkApart(rule: Rule, loc: Locations): RuleResult {
  const label = RULE_LABEL[rule.kind];
  const byTable = new Map<string, string[]>();
  for (const id of rule.guests) {
    const t = loc[id];
    if (t) byTable.set(t, [...(byTable.get(t) ?? []), id]);
  }
  const shared = [...byTable.entries()].filter(([, ids]) => ids.length > 1);
  if (shared.length > 0) {
    const tableIds = shared.map(([t]) => t);
    return {
      rule,
      status: "broken",
      label,
      tableIds,
      guestIds: shared.flatMap(([, ids]) => ids),
      detail: `${joinNames(shared[0]?.[1] ?? rule.guests)} are both at ${tableName(tableIds[0])}.`,
      hint: "Move one of them to a different table.",
    };
  }
  const seatedCount = rule.guests.filter((id) => loc[id]).length;
  if (seatedCount < rule.guests.length) {
    const missing = rule.guests.filter((id) => !loc[id]);
    return {
      rule,
      status: "pending",
      label,
      tableIds: [...byTable.keys()],
      guestIds: [],
      detail: `${joinNames(missing)} ${missing.length > 1 ? "are" : "is"} not seated yet, so nothing to clash so far.`,
    };
  }
  return {
    rule,
    status: "ok",
    label,
    tableIds: [...byTable.keys()],
    guestIds: [],
    detail: `${rule.guests.map((id) => `${nameOf(id)} (${tableName(loc[id])})`).join(" and ")} are apart.`,
  };
}

function fits(rule: Rule, tableId: string): boolean {
  const nearOk =
    !rule.target ||
    rule.maxFromTarget === undefined ||
    distanceToFixture(tableId, rule.target) <= rule.maxFromTarget;
  const awayOk =
    !rule.awayFrom ||
    rule.minFromAway === undefined ||
    distanceToFixture(tableId, rule.awayFrom) >= rule.minFromAway;
  return nearOk && awayOk;
}

function checkNear(rule: Rule, loc: Locations, free: Record<string, number>): RuleResult {
  const label = RULE_LABEL[rule.kind];
  const guestId = rule.guests[0] ?? "";
  const tableId = loc[guestId] ?? null;
  const targetLabel = rule.target ? lower(FIXTURES_BY_ID[rule.target]?.label ?? "") : "";
  const awayLabel = rule.awayFrom ? lower(FIXTURES_BY_ID[rule.awayFrom]?.label ?? "") : "";
  const fitting = TABLES.filter((t) => fits(rule, t.id));
  const fitText = fitting.length
    ? `Tables that fit: ${fitting
        .map((t) => `${t.name} (${free[t.id] ?? 0} free)`)
        .join(", ")}.`
    : "No table in the room fits.";
  if (!tableId) {
    return {
      rule,
      status: "pending",
      label,
      tableIds: fitting.map((t) => t.id),
      guestIds: [],
      detail: `${nameOf(guestId)} is not seated yet.`,
      hint: fitText,
    };
  }
  const dTarget = rule.target ? distanceToFixture(tableId, rule.target) : 0;
  const dAway = rule.awayFrom ? distanceToFixture(tableId, rule.awayFrom) : Number.POSITIVE_INFINITY;
  if (fits(rule, tableId)) {
    return {
      rule,
      status: "ok",
      label,
      tableIds: [tableId],
      guestIds: [],
      detail: `${nameOf(guestId)} is at ${tableName(tableId)}, ${metres(dTarget)} from the ${targetLabel}${
        awayLabel ? ` and ${metres(dAway)} from the ${awayLabel}` : ""
      }.`,
    };
  }
  const reasons: string[] = [];
  if (rule.maxFromTarget !== undefined && dTarget > rule.maxFromTarget) {
    reasons.push(`${metres(dTarget)} from the ${targetLabel} (aim for ${metres(rule.maxFromTarget)} or less)`);
  }
  if (rule.minFromAway !== undefined && dAway < rule.minFromAway) {
    reasons.push(`only ${metres(dAway)} from the ${awayLabel} (aim for ${metres(rule.minFromAway)} or more)`);
  }
  return {
    rule,
    status: "broken",
    label,
    tableIds: [tableId],
    guestIds: [guestId],
    detail: `${nameOf(guestId)} is at ${tableName(tableId)}, ${reasons.join(" and ")}.`,
    hint: fitText,
  };
}

export function checkRules(loc: Locations, free: Record<string, number>): RuleResult[] {
  return RULES.map((rule) => {
    if (rule.kind === "together") return checkTogether(rule, loc);
    if (rule.kind === "apart") return checkApart(rule, loc);
    return checkNear(rule, loc, free);
  });
}
```

