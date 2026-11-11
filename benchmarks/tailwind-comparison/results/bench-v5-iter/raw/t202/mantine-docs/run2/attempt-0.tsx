```tsx app/guests/page.tsx
import type { Metadata } from "next";
import { GuestsView } from "@/components/GuestsView";

export const metadata: Metadata = { title: "Guest list · Seatwise" };

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
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { PlanProvider } from "@/components/PlanProvider";
import { Shell } from "@/components/Shell";
import { AppMantine } from "@/components/AppMantine";

export const metadata: Metadata = {
  title: "Seatwise: seating plan for Ines & Mateo",
  description: "A seating planner for wedding and event planners.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <AppMantine>
          <ModalsProvider>
            <Notifications />
            <PlanProvider>
              <Shell>{children}</Shell>
            </PlanProvider>
          </ModalsProvider>
        </AppMantine>
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
import { createTheme, type MantineColorsTuple } from "@mantine/core";

// Seatwise brand: a deep, calm indigo that reads well next to the party colours.
const brand: MantineColorsTuple = [
  "#f1f1fb",
  "#e2e1f4",
  "#c4c2e8",
  "#a4a0dc",
  "#8982d1",
  "#776fca",
  "#6c63c7",
  "#5b53b0",
  "#504a9e",
  "#443f8c",
];

// System font stack, identical in every arm (no network font fetch at build).
export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: { light: 7, dark: 5 },
  colors: { brand },
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  headings: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    fontWeight: "650",
  },
  defaultRadius: "md",
  cursorType: "pointer",
  components: {
    Button: { defaultProps: { fw: 600 } },
    Badge: { defaultProps: { fw: 600 } },
    Paper: { defaultProps: { radius: "md" } },
  },
});
```

```tsx components/AppMantine.tsx
"use client";

import type { ReactNode } from "react";
import { MantineProvider, type CSSVariablesResolver } from "@mantine/core";
import { theme } from "@/app/theme";

// Mantine's default dimmed grey is too pale on the page background; darken it for AA contrast.
const resolver: CSSVariablesResolver = () => ({
  variables: {},
  light: { "--mantine-color-dimmed": "var(--mantine-color-gray-7)" },
  dark: { "--mantine-color-dimmed": "var(--mantine-color-dark-1)" },
});

export function AppMantine({ children }: { children: ReactNode }) {
  return (
    <MantineProvider theme={theme} cssVariablesResolver={resolver}>
      {children}
    </MantineProvider>
  );
}
```

```tsx components/GuestBits.tsx
import { Badge, ColorSwatch, Group, Text } from "@mantine/core";
import { IconAlertTriangle, IconLeaf, IconToolsKitchen2 } from "@tabler/icons-react";
import { PARTY_COLOR, RSVP_COLOR, RSVP_LABEL, type Rsvp } from "@/lib/data";

export function ink(color: string) {
  return { color: `light-dark(var(--mantine-color-${color}-9), var(--mantine-color-${color}-1))` };
}

export function partyColor(party: string): string {
  return PARTY_COLOR[party] ?? "gray";
}

export function PartyDot({ party, size = 10 }: { party: string; size?: number }) {
  return <ColorSwatch color={`var(--mantine-color-${partyColor(party)}-filled)`} size={size} withShadow={false} />;
}

export function PartyBadge({ party }: { party: string }) {
  return (
    <Badge variant="light" color={partyColor(party)} size="sm" tt="none" fw={600} style={ink(partyColor(party))}>
      {party}
    </Badge>
  );
}

export function RsvpBadge({ rsvp }: { rsvp: Rsvp }) {
  return (
    <Badge variant={rsvp === "yes" ? "light" : "outline"} color={RSVP_COLOR[rsvp]} size="sm" tt="none" style={ink(rsvp === "pending" ? "gray" : RSVP_COLOR[rsvp])}>
      {RSVP_LABEL[rsvp]}
    </Badge>
  );
}

const ALLERGY = /allerg/i;

export function DietBadge({ diet }: { diet: string | null }) {
  if (!diet) return null;
  const allergy = ALLERGY.test(diet);
  return (
    <Badge
      variant={allergy ? "filled" : "light"}
      color={allergy ? "red" : "grape"}
      size="sm"
      tt="none"
      style={allergy ? undefined : ink("grape")}
      leftSection={allergy ? <IconAlertTriangle size={12} /> : <IconLeaf size={12} />}
    >
      {diet}
    </Badge>
  );
}

export function MealLabel({ meal, standard }: { meal: string; standard: boolean }) {
  return (
    <Group gap={6} wrap="nowrap">
      {standard ? <IconToolsKitchen2 size={15} /> : ALLERGY.test(meal) ? <IconAlertTriangle size={15} color="var(--mantine-color-red-6)" /> : <IconLeaf size={15} />}
      <Text size="sm" fw={standard ? 500 : 600}>
        {meal}
      </Text>
    </Group>
  );
}
```

```tsx components/GuestsView.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Grid,
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
import { useClipboard } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconCopy, IconSearch, IconFilterOff } from "@tabler/icons-react";
import {
  RSVP_LABEL,
  STANDARD_MEAL,
  diets,
  event,
  formatEventDate,
  guests,
  parties,
  type Rsvp,
} from "@/lib/data";
import { mealCounts, tableById } from "@/lib/plan";
import { DietBadge, MealLabel, PartyBadge, RsvpBadge } from "./GuestBits";
import { usePlan } from "./PlanProvider";

const NO_DIET = "__none";

const RSVP_OPTIONS = (Object.keys(RSVP_LABEL) as Rsvp[]).map((value) => ({
  value,
  label: RSVP_LABEL[value],
}));

const DIET_OPTIONS = [
  { value: NO_DIET, label: "No dietary needs" },
  ...diets.map((d) => ({ value: d, label: d })),
];

function SummaryCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <Paper withBorder p="sm">
      <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: 0.4 }}>
        {label}
      </Text>
      <Text fz={26} fw={700} lh={1.15}>
        {value}
      </Text>
      {sub ? (
        <Text size="xs" c="dimmed">
          {sub}
        </Text>
      ) : null}
    </Paper>
  );
}

function CatererMeals() {
  const clipboard = useClipboard({ timeout: 2000 });
  const rows = useMemo(() => mealCounts(STANDARD_MEAL), []);
  const confirmed = rows.reduce((n, r) => n + r.confirmed, 0);
  const undecided = rows.reduce((n, r) => n + r.undecided, 0);

  const copy = () => {
    const lines = [
      `${event.name}, ${formatEventDate()}`,
      `${event.venue}`,
      "",
      `Meals for confirmed guests (${confirmed}):`,
      ...rows.filter((r) => r.confirmed > 0).map((r) => `- ${r.meal}: ${r.confirmed}`),
      "",
      `Not confirmed yet (maybe or awaiting reply): ${undecided}`,
      ...rows.filter((r) => r.undecided > 0).map((r) => `- ${r.meal}: ${r.undecided}`),
    ];
    clipboard.copy(lines.join("\n"));
    notifications.show({
      color: "teal",
      icon: <IconCheck size={16} />,
      message: "Meal counts copied for the caterer.",
    });
  };

  return (
    <Paper withBorder p="md">
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb="xs">
        <div>
          <Title order={2} size="h4">Meals for the caterer</Title>
          <Text size="sm" c="dimmed">
            By RSVP, whatever the filters show. Declined guests are left out.
          </Text>
        </div>
      </Group>
      <Table verticalSpacing="xs" aria-label="Meal counts for the caterer">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Meal</Table.Th>
            <Table.Th ta="right">Confirmed</Table.Th>
            <Table.Th ta="right">Not confirmed</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((r) => (
            <Table.Tr key={r.meal}>
              <Table.Td>
                <MealLabel meal={r.meal} standard={r.meal === STANDARD_MEAL} />
              </Table.Td>
              <Table.Td ta="right" fw={700}>
                {r.confirmed}
              </Table.Td>
              <Table.Td ta="right" c={r.undecided > 0 ? undefined : "dimmed"}>
                {r.undecided}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
        <Table.Tfoot>
          <Table.Tr>
            <Table.Th>Total meals</Table.Th>
            <Table.Th ta="right">{confirmed}</Table.Th>
            <Table.Th ta="right">{undecided}</Table.Th>
          </Table.Tr>
        </Table.Tfoot>
      </Table>
      <Button
        mt="sm"
        fullWidth
        variant={clipboard.copied ? "light" : "default"}
        color={clipboard.copied ? "teal" : undefined}
        leftSection={clipboard.copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
        onClick={copy}
      >
        {clipboard.copied ? "Copied" : "Copy counts for the caterer"}
      </Button>
    </Paper>
  );
}

export function GuestsView() {
  const { seating, stats } = usePlan();
  const [search, setSearch] = useState("");
  const [party, setParty] = useState<string | null>(null);
  const [rsvp, setRsvp] = useState<string | null>(null);
  const [diet, setDiet] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return guests.filter((g) => {
      if (q && !g.name.toLowerCase().includes(q)) return false;
      if (party && g.party !== party) return false;
      if (rsvp && g.rsvp !== rsvp) return false;
      if (diet === NO_DIET && g.diet) return false;
      if (diet && diet !== NO_DIET && g.diet !== diet) return false;
      return true;
    });
  }, [search, party, rsvp, diet]);

  const filtering = Boolean(search || party || rsvp || diet);
  const count = (r: Rsvp) => guests.filter((g) => g.rsvp === r).length;
  const reset = () => {
    setSearch("");
    setParty(null);
    setRsvp(null);
    setDiet(null);
  };

  return (
    <Stack gap="md">
      <div>
        <Title order={1} size="h2">Guest list</Title>
        <Text c="dimmed" size="sm">
          {event.name} · {formatEventDate()} · {event.venue}
        </Text>
      </div>

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
        <SummaryCard label="Invited" value={guests.length} />
        <SummaryCard label="Attending" value={count("yes")} sub={`${stats.toSeat} still to seat`} />
        <SummaryCard label="Maybe or no reply" value={count("maybe") + count("pending")} sub={`${count("maybe")} maybe, ${count("pending")} pending`} />
        <SummaryCard label="Declined" value={count("no")} />
      </SimpleGrid>

      <Grid gap="md" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }} order={{ base: 2, lg: 1 }}>
          <Paper withBorder p="md">
            <Stack gap="sm">
              <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="sm">
                <TextInput
                  label="Search"
                  placeholder="Guest name"
                  leftSection={<IconSearch size={16} />}
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                />
                <Select
                  label="Party"
                  placeholder="All parties"
                  data={parties}
                  value={party}
                  onChange={setParty}
                  clearable
                />
                <Select
                  label="RSVP"
                  placeholder="Any reply"
                  data={RSVP_OPTIONS}
                  value={rsvp}
                  onChange={setRsvp}
                  clearable
                />
                <Select
                  label="Diet"
                  placeholder="Any diet"
                  data={DIET_OPTIONS}
                  value={diet}
                  onChange={setDiet}
                  clearable
                />
              </SimpleGrid>
              <Group justify="space-between" gap="xs">
                <Text size="sm" c="dimmed" role="status" aria-live="polite">
                  Showing {filtered.length} of {guests.length} guests
                </Text>
                {filtering ? (
                  <Button size="compact-sm" variant="subtle" leftSection={<IconFilterOff size={14} />} onClick={reset}>
                    Clear filters
                  </Button>
                ) : null}
              </Group>
              <Table.ScrollContainer minWidth={640}>
                <Table verticalSpacing="xs" highlightOnHover stickyHeader aria-label="Guests">
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
                    {filtered.length === 0 ? (
                      <Table.Tr>
                        <Table.Td colSpan={5}>
                          <Text ta="center" c="dimmed" py="md">
                            No guests match these filters.
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ) : (
                      filtered.map((g) => {
                        const p = seating[g.id];
                        const t = p ? tableById[p.table] : undefined;
                        return (
                          <Table.Tr key={g.id}>
                            <Table.Td fw={600}>{g.name}</Table.Td>
                            <Table.Td>
                              <PartyBadge party={g.party} />
                            </Table.Td>
                            <Table.Td>
                              <RsvpBadge rsvp={g.rsvp} />
                            </Table.Td>
                            <Table.Td>
                              {g.diet ? <DietBadge diet={g.diet} /> : <Text size="sm" c="dimmed">None</Text>}
                            </Table.Td>
                            <Table.Td>
                              {t && p ? (
                                <Badge
                                  component={Link}
                                  href="/"
                                  variant="light"
                                  color="brand"
                                  size="md"
                                  tt="none"
                                  style={{ cursor: "pointer" }}
                                >
                                  {t.name} · seat {p.seat + 1}
                                </Badge>
                              ) : g.rsvp === "no" ? (
                                <Text size="sm" c="dimmed">
                                  Not needed
                                </Text>
                              ) : (
                                <Badge variant="outline" color="orange" size="md" tt="none">
                                  Not seated
                                </Badge>
                              )}
                            </Table.Td>
                          </Table.Tr>
                        );
                      })
                    )}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Stack>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }} order={{ base: 1, lg: 2 }}>
          <CatererMeals />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
```

```tsx components/PlanProvider.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { VisuallyHidden } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  computeStats,
  evaluateRules,
  guestById,
  initialSeating,
  placeGuest,
  tableById,
  unseatGuest,
  type RuleResult,
  type Seating,
  type Stats,
} from "@/lib/plan";

type PlanContextValue = {
  seating: Seating;
  stats: Stats;
  rules: RuleResult[];
  brokenTables: Set<string>;
  /** guest being placed with taps */
  picked: string | null;
  /** guest being dragged */
  dragId: string | null;
  selectedTable: string | null;
  place: (guestId: string, tableId: string, seat?: number) => boolean;
  unseat: (guestId: string) => void;
  pick: (guestId: string | null) => void;
  setDragId: (guestId: string | null) => void;
  /** reveal: ask the side panel to show the table's details */
  selectTable: (tableId: string | null, reveal?: boolean) => void;
  revealTick: number;
};

const PlanContext = createContext<PlanContextValue | null>(null);

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [seating, setSeating] = useState<Seating>(initialSeating);
  const [picked, setPicked] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [revealTick, setRevealTick] = useState(0);

  const rules = useMemo(() => evaluateRules(seating), [seating]);
  const stats = useMemo(() => computeStats(seating), [seating]);
  const brokenTables = useMemo(
    () => new Set(rules.filter((r) => r.status === "broken").flatMap((r) => r.tables)),
    [rules],
  );

  const place = useCallback(
    (guestId: string, tableId: string, seat?: number): boolean => {
      const res = placeGuest(seating, guestId, tableId, seat);
      if (res.error) {
        notifications.show({
          color: "red",
          title: "Cannot seat guest",
          message: res.error,
        });
        setAnnouncement(res.error);
        return false;
      }
      if (res.noop) {
        if (res.note) setAnnouncement(res.note);
        return true;
      }
      setSeating(res.seating);
      if (res.note) setAnnouncement(res.note);
      return true;
    },
    [seating],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const guest = guestById[guestId];
      if (!guest || !seating[guestId]) return;
      const from = seating[guestId];
      setSeating(unseatGuest(seating, guestId));
      setAnnouncement(
        `${guest.name} is unseated${from ? ` from ${tableById[from.table]?.name ?? "a table"}` : ""}.`,
      );
    },
    [seating],
  );

  const pick = useCallback((guestId: string | null) => {
    setPicked(guestId);
    if (guestId) {
      const g = guestById[guestId];
      if (g) setAnnouncement(`${g.name} picked. Choose a table or an empty seat.`);
    }
  }, []);

  const selectTable = useCallback((tableId: string | null, reveal = false) => {
    setSelectedTable(tableId);
    if (reveal) setRevealTick((n) => n + 1);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPicked(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo<PlanContextValue>(
    () => ({
      seating,
      stats,
      rules,
      brokenTables,
      picked,
      dragId,
      selectedTable,
      place,
      unseat,
      pick,
      setDragId,
      selectTable,
      revealTick,
    }),
    [seating, stats, rules, brokenTables, picked, dragId, selectedTable, place, unseat, pick, selectTable, revealTick],
  );

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
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Grid,
  Box,
} from "@mantine/core";
import { IconAlertTriangle, IconCheck, IconHandFinger, IconX } from "@tabler/icons-react";
import { event, formatEventDate, parties, tables } from "@/lib/data";
import { guestById, seatedCount } from "@/lib/plan";
import { PartyDot } from "./GuestBits";
import { usePlan } from "./PlanProvider";
import { RoomPlan } from "./RoomPlan";
import { SidePanel } from "./SidePanel";

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub: string;
  color?: string;
}) {
  return (
    <Paper withBorder p="md">
      <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: 0.4 }}>
        {label}
      </Text>
      <Text fz={32} fw={700} lh={1.1} mt={4} c={color}>
        {value}
      </Text>
      <Text size="sm" c="dimmed" mt={2}>
        {sub}
      </Text>
    </Paper>
  );
}

function RuleSummary() {
  const { rules, selectTable } = usePlan();
  const broken = rules.filter((r) => r.status === "broken");
  const waiting = rules.filter((r) => r.status === "waiting").length;
  const ok = rules.filter((r) => r.status === "ok").length;

  if (broken.length === 0) {
    return (
      <Alert color="teal.9" variant="light" icon={<IconCheck size={18} />} title="No seating rules broken">
        {ok} followed{waiting > 0 ? `, ${waiting} waiting for guests to be seated` : ""}.
      </Alert>
    );
  }
  return (
    <Alert
      color="red.9"
      variant="light"
      icon={<IconAlertTriangle size={18} />}
      title={`${broken.length} seating ${broken.length === 1 ? "rule is" : "rules are"} broken`}
    >
      <Stack gap={6}>
        {broken.map((r) => (
          <Group key={r.index} gap="xs" justify="space-between" wrap="nowrap" align="flex-start">
            <Text size="sm">
              <Text span fw={700}>
                {r.label}:{" "}
              </Text>
              {r.text}
            </Text>
            {r.tables[0] ? (
              <Button size="compact-xs" variant="white" color="red.9" onClick={() => selectTable(r.tables[0] ?? null, true)}>
                Show
              </Button>
            ) : null}
          </Group>
        ))}
        <Text size="xs" c="dimmed">
          {ok} followed{waiting > 0 ? `, ${waiting} waiting for guests to be seated` : ""}.
        </Text>
      </Stack>
    </Alert>
  );
}

function PickedBanner() {
  const { picked, pick } = usePlan();
  const guest = picked ? guestById[picked] : undefined;
  if (!guest) return null;
  return (
    <Paper
      role="status"
      p="sm"
      shadow="md"
      style={{
        position: "sticky",
        top: 72,
        zIndex: 20,
        background: "var(--mantine-color-brand-filled)",
        color: "var(--mantine-color-white)",
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap="xs" wrap="nowrap">
          <IconHandFinger size={20} />
          <Text size="sm" fw={600} c="inherit">
            Placing {guest.name}: tap a table or an empty seat.
          </Text>
        </Group>
        <Button size="compact-sm" variant="white" color="brand" leftSection={<IconX size={14} />} onClick={() => pick(null)}>
          Cancel
        </Button>
      </Group>
    </Paper>
  );
}

function TableChips() {
  const { seating, brokenTables, selectedTable, picked, place, pick, selectTable } = usePlan();
  return (
    <Group gap="xs" role="group" aria-label="Seats filled per table">
      {tables.map((t) => {
        const n = seatedCount(seating, t.id);
        const broken = brokenTables.has(t.id);
        const selected = selectedTable === t.id;
        return (
          <Button
            key={t.id}
            size="compact-md"
            variant={selected ? "filled" : "light"}
            color={broken ? "red" : n >= t.seats ? "teal" : "brand"}
            rightSection={
              <Text span fw={700} size="xs">
                {n}/{t.seats}
              </Text>
            }
            aria-pressed={selected}
            onClick={() => {
              if (picked) {
                if (place(picked, t.id)) pick(null);
                selectTable(t.id);
              } else selectTable(t.id, true);
            }}
          >
            {t.name}
          </Button>
        );
      })}
    </Group>
  );
}

function Legend() {
  return (
    <Group gap="md" style={{ rowGap: 6 }} aria-label="Legend" role="group">
      {parties.map((p) => (
        <Group key={p} gap={6} wrap="nowrap">
          <PartyDot party={p} />
          <Text size="xs" c="dimmed">
            {p}
          </Text>
        </Group>
      ))}
      <Group gap={6} wrap="nowrap">
        <Box w={10} h={10} style={{ borderRadius: "50%", background: "var(--mantine-color-grape-6)" }} />
        <Text size="xs" c="dimmed">
          Dietary need
        </Text>
      </Group>
      <Group gap={6} wrap="nowrap">
        <Box w={10} h={10} style={{ borderRadius: "50%", background: "var(--mantine-color-red-6)" }} />
        <Text size="xs" c="dimmed">
          Allergy
        </Text>
      </Group>
      <Group gap={6} wrap="nowrap">
        <Box w={12} h={12} style={{ borderRadius: "50%", border: "2px dashed var(--mantine-color-red-6)" }} />
        <Text size="xs" c="dimmed">
          Rule broken
        </Text>
      </Group>
    </Group>
  );
}

export function PlanView() {
  const { stats, rules } = usePlan();
  const broken = rules.filter((r) => r.status === "broken").length;

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-end" gap="xs">
        <div>
          <Title order={1} size="h2">Seating plan</Title>
          <Text c="dimmed" size="sm">
            {event.name} · {formatEventDate()} · {event.venue}
          </Text>
        </div>
        <Text size="sm" c="dimmed">
          Room {event.room_m.width} × {event.room_m.depth} m, drawn to scale
        </Text>
      </Group>

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="sm">
        <StatCard
          label="Seated"
          value={stats.seated}
          sub={`${stats.freeSeats} of ${stats.totalSeats} seats free`}
        />
        <StatCard
          label="Still to seat"
          value={stats.toSeat}
          sub={
            stats.undecidedUnseated > 0
              ? `attending, plus ${stats.undecidedUnseated} not confirmed`
              : "attending guests"
          }
          color={stats.toSeat > 0 ? "brand" : "teal"}
        />
        <StatCard
          label="Attending"
          value={stats.attending}
          sub={`of ${stats.invited} invited`}
        />
        <StatCard
          label="Rules broken"
          value={broken}
          sub={`of ${rules.length} seating rules`}
          color={broken > 0 ? "red" : "teal"}
        />
      </SimpleGrid>

      <RuleSummary />
      <PickedBanner />

      <Grid gap="md" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="sm">
            <RoomPlan />
            <TableChips />
            <Legend />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }} style={{ position: "sticky", top: 76 }}>
          <SidePanel />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
```

```tsx components/RoomPlan.tsx
"use client";

import { useState, type CSSProperties, type DragEvent, type KeyboardEvent } from "react";
import { Box, Paper, ThemeIcon, VisuallyHidden } from "@mantine/core";
import { IconAlertTriangle, IconPlus } from "@tabler/icons-react";
import { event, fixtures, tables, type Fixture, type TableDef } from "@/lib/data";
import {
  SEAT_D,
  guestById,
  initials,
  occupants,
  tableGeometry,
  type TableGeometry,
} from "@/lib/plan";
import { partyColor } from "./GuestBits";
import { usePlan } from "./PlanProvider";

const W = event.room_m.width;
const D = event.room_m.depth;

const FONT_SEAT = "max(9px, 1.3cqw)";
const FONT_LABEL = "max(9px, 1.25cqw)";

type RectM = { x: number; y: number; w: number; h: number };

/** A rectangle in room metres as percentages of the room. */
function inRoom(r: RectM): CSSProperties {
  return {
    left: `${(r.x / W) * 100}%`,
    top: `${(r.y / D) * 100}%`,
    width: `${(r.w / W) * 100}%`,
    height: `${(r.h / D) * 100}%`,
  };
}

/** A rectangle in room metres as percentages of a table's own box. */
function inBox(box: RectM, r: RectM): CSSProperties {
  return {
    left: `${((r.x - box.x) / box.w) * 100}%`,
    top: `${((r.y - box.y) / box.h) * 100}%`,
    width: `${(r.w / box.w) * 100}%`,
    height: `${(r.h / box.h) * 100}%`,
  };
}

function fixtureStyle(f: Fixture): CSSProperties {
  switch (f.kind) {
    case "stage":
      return {
        background: "var(--mantine-color-dark-6)",
        color: "var(--mantine-color-white)",
        borderRadius: 6,
      };
    case "dancefloor":
      return {
        background: `repeating-conic-gradient(var(--mantine-color-brand-1) 0% 25%, var(--mantine-color-brand-0) 0% 50%) 0 0 / calc(200% / ${f.w}) calc(200% / ${f.h})`,
        border: "1.5px dashed var(--mantine-color-brand-4)",
        color: "var(--mantine-color-brand-9)",
        borderRadius: 6,
      };
    case "bar":
      return {
        background: "var(--mantine-color-orange-9)",
        color: "var(--mantine-color-white)",
        borderRadius: 6,
      };
    default:
      return { background: "var(--mantine-color-teal-6)", borderRadius: 2 };
  }
}

function Fixtures() {
  return (
    <>
      {fixtures.map((f) => (
        <Box
          key={f.id}
          style={{
            position: "absolute",
            ...inRoom(f),
            ...fixtureStyle(f),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: FONT_LABEL,
            fontWeight: 700,
            letterSpacing: 0.2,
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {f.kind !== "door" ? f.label : null}
        </Box>
      ))}
      {fixtures
        .filter((f) => f.kind === "door")
        .map((f) => (
          <Box
            key={`${f.id}-label`}
            aria-hidden
            style={{
              position: "absolute",
              ...inRoom({ x: f.x + f.w + 0.1, y: f.y, w: 0.6, h: f.h }),
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              fontSize: "max(8px, 1.05cqw)",
              fontWeight: 700,
              color: "var(--mantine-color-teal-9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            {f.label}
          </Box>
        ))}
    </>
  );
}

type SeatProps = {
  table: TableDef;
  geo: TableGeometry;
  index: number;
  guestId: string | null;
  over: boolean;
  flagged: boolean;
  onOver: (key: string | null) => void;
};

function Seat({ table, geo, index, guestId, over, flagged, onOver }: SeatProps) {
  const { picked, dragId, place, pick, setDragId, selectTable } = usePlan();
  const guest = guestId ? guestById[guestId] : undefined;
  const pos = geo.seats[index];
  if (!pos) return null;
  const key = `${table.id}:${index}`;
  const color = guest ? partyColor(guest.party) : "gray";
  const isPicked = Boolean(guestId) && picked === guestId;
  const holding = Boolean(picked) || Boolean(dragId);
  const allergy = guest?.diet ? /allerg/i.test(guest.diet) : false;

  const activate = () => {
    if (picked) {
      if (guestId === picked) {
        pick(null);
        return;
      }
      if (place(picked, table.id, index)) pick(null);
      selectTable(table.id);
      return;
    }
    if (guestId) pick(guestId);
    selectTable(table.id, true);
  };

  const label = guest
    ? `${table.name}, seat ${index + 1}: ${guest.name}, ${guest.party}${guest.diet ? `, ${guest.diet}` : ""}. ${isPicked ? "Picked up. Choose another seat to move them." : "Activate to pick up and move."}`
    : `${table.name}, seat ${index + 1}: empty${picked ? `. Place ${guestById[picked]?.name ?? "guest"} here.` : ""}`;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      activate();
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || dragId;
    onOver(null);
    setDragId(null);
    if (id && guestById[id]) {
      place(id, table.id, index);
      selectTable(table.id);
    }
  };

  const base: CSSProperties = {
    position: "absolute",
    left: `${((pos.x - geo.box.x) / geo.box.w) * 100}%`,
    top: `${((pos.y - geo.box.y) / geo.box.h) * 100}%`,
    width: `${(SEAT_D / geo.box.w) * 100}%`,
    aspectRatio: "1",
    transform: "translate(-50%, -50%)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: FONT_SEAT,
    fontWeight: 700,
    pointerEvents: "auto",
    cursor: guest ? "grab" : "pointer",
    userSelect: "none",
    touchAction: "manipulation",
    transition: "box-shadow 120ms, background 120ms",
  };

  const style: CSSProperties = guest
    ? {
        ...base,
        background: `var(--mantine-color-${color}-light)`,
        border: `2px solid var(--mantine-color-${color}-filled)`,
        color: `light-dark(var(--mantine-color-${color}-9), var(--mantine-color-${color}-1))`,
        boxShadow: isPicked
          ? "0 0 0 3px var(--mantine-color-brand-filled), 0 4px 10px rgba(0,0,0,.25)"
          : flagged
            ? "0 0 0 2px var(--mantine-color-red-6)"
            : "0 1px 2px rgba(0,0,0,.12)",
        opacity: dragId === guestId ? 0.45 : 1,
      }
    : {
        ...base,
        background: over || holding ? "var(--mantine-color-brand-light)" : "var(--mantine-color-body)",
        border: `2px dashed ${over || holding ? "var(--mantine-color-brand-filled)" : "light-dark(var(--mantine-color-gray-5), var(--mantine-color-dark-3))"}`,
        color: "var(--mantine-color-brand-filled)",
        boxShadow: over ? "0 0 0 3px var(--mantine-color-brand-filled)" : "none",
      };

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-pressed={guest ? isPicked : undefined}
      data-seat={key}
      draggable={Boolean(guest)}
      style={style}
      onClick={activate}
      onKeyDown={onKeyDown}
      onDragStart={(e: DragEvent<HTMLDivElement>) => {
        if (!guestId) return;
        e.dataTransfer.setData("text/plain", guestId);
        e.dataTransfer.effectAllowed = "move";
        setDragId(guestId);
      }}
      onDragEnd={() => {
        setDragId(null);
        onOver(null);
      }}
      onDragOver={(e: DragEvent<HTMLDivElement>) => {
        if (!dragId) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        onOver(key);
      }}
      onDragLeave={() => onOver(null)}
      onDrop={onDrop}
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      <span aria-hidden>{guest ? initials(guest.name) : holding ? <IconPlus size="45%" stroke={2.5} /> : null}</span>
      {guest?.diet ? (
        <Box
          aria-hidden
          style={{
            position: "absolute",
            right: "-8%",
            bottom: "-8%",
            width: "36%",
            aspectRatio: "1",
            borderRadius: "50%",
            background: allergy ? "var(--mantine-color-red-6)" : "var(--mantine-color-grape-6)",
            border: "1.5px solid var(--mantine-color-body)",
          }}
        />
      ) : null}
    </Box>
  );
}

function TableView({
  table,
  over,
  onOver,
  flaggedGuests,
}: {
  table: TableDef;
  over: string | null;
  onOver: (key: string | null) => void;
  flaggedGuests: Set<string>;
}) {
  const { seating, brokenTables, selectedTable, picked, dragId, place, pick, selectTable, setDragId } =
    usePlan();
  const geo = tableGeometry(table);
  const occ = occupants(seating, table.id);
  const filled = occ.filter(Boolean).length;
  const broken = brokenTables.has(table.id);
  const selected = selectedTable === table.id;
  const discKey = `${table.id}:table`;
  const discOver = over === discKey;
  const full = filled >= table.seats;

  const activate = () => {
    if (picked) {
      if (place(picked, table.id)) pick(null);
      selectTable(table.id);
      return;
    }
    selectTable(table.id, true);
  };

  const label = `${table.name}, ${filled} of ${table.seats} seats filled${broken ? ", a seating rule is broken" : ""}. ${picked ? `Place ${guestById[picked]?.name ?? "guest"} here.` : "Show guests."}`;

  return (
    <Box
      style={{
        position: "absolute",
        ...inRoom(geo.box),
        pointerEvents: "none",
      }}
    >
      <Box
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: geo.round ? "50%" : 18,
          border: broken
            ? "2px dashed var(--mantine-color-red-6)"
            : selected
              ? "2px solid var(--mantine-color-brand-filled)"
              : "2px solid transparent",
          background: broken
            ? "light-dark(var(--mantine-color-red-0), rgba(250,82,82,.1))"
            : selected
              ? "var(--mantine-color-brand-light)"
              : "transparent",
        }}
      />
      <Box
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        data-table={table.id}
        onClick={activate}
        onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            activate();
          }
        }}
        onDragOver={(e: DragEvent<HTMLDivElement>) => {
          if (!dragId) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          onOver(discKey);
        }}
        onDragLeave={() => onOver(null)}
        onDrop={(e: DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          const id = e.dataTransfer.getData("text/plain") || dragId;
          onOver(null);
          setDragId(null);
          if (id && guestById[id]) {
            place(id, table.id);
            selectTable(table.id);
          }
        }}
        style={{
          position: "absolute",
          ...inBox(geo.box, geo.disc),
          pointerEvents: "auto",
          cursor: "pointer",
          borderRadius: geo.round ? "50%" : 8,
          background: discOver
            ? "var(--mantine-color-brand-light)"
            : "light-dark(var(--mantine-color-white), var(--mantine-color-dark-6))",
          border: `2px solid ${
            broken
              ? "var(--mantine-color-red-6)"
              : selected || discOver
                ? "var(--mantine-color-brand-filled)"
                : "light-dark(var(--mantine-color-gray-4), var(--mantine-color-dark-3))"
          }`,
          boxShadow: "0 1px 3px rgba(0,0,0,.12)",
          display: "flex",
          flexDirection: geo.round ? "column" : "row",
          alignItems: "center",
          justifyContent: "center",
          gap: geo.round ? 0 : "0.8em",
          fontSize: FONT_LABEL,
          fontWeight: 700,
          lineHeight: 1.15,
          textAlign: "center",
          userSelect: "none",
          touchAction: "manipulation",
        }}
      >
        <VisuallyHidden>{label}</VisuallyHidden>
        <span aria-hidden>{table.name}</span>
        <span
          aria-hidden
          style={{
            fontWeight: 600,
            color: full
              ? "var(--mantine-color-teal-7)"
              : "light-dark(var(--mantine-color-gray-7), var(--mantine-color-gray-4))",
          }}
        >
          {filled}/{table.seats}
        </span>
      </Box>
      {geo.seats.map((_, i) => {
        const gid = occ[i] ?? null;
        return (
          <Seat
            key={i}
            table={table}
            geo={geo}
            index={i}
            guestId={gid}
            over={over === `${table.id}:${i}`}
            flagged={gid ? flaggedGuests.has(gid) : false}
            onOver={onOver}
          />
        );
      })}
      {broken ? (
        <ThemeIcon
          aria-hidden
          color="red"
          variant="filled"
          radius="xl"
          size={22}
          style={{ position: "absolute", top: geo.round ? "6%" : -6, right: geo.round ? "6%" : -6 }}
        >
          <IconAlertTriangle size={13} />
        </ThemeIcon>
      ) : null}
    </Box>
  );
}

export function RoomPlan() {
  const { rules } = usePlan();
  const [over, setOver] = useState<string | null>(null);
  const flaggedGuests = new Set(
    rules.filter((r) => r.status === "broken").flatMap((r) => r.rule.guests),
  );

  return (
    <Paper withBorder p={0} style={{ overflow: "hidden" }}>
      <Box style={{ overflowX: "auto" }}>
        <Box
          role="group"
          aria-label={`Room plan, ${W} by ${D} metres, drawn to scale`}
          style={{
            position: "relative",
            minWidth: 620,
            aspectRatio: `${W} / ${D}`,
            containerType: "inline-size",
            background: "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))",
            backgroundImage:
              "linear-gradient(to right, light-dark(rgba(0,0,0,.055), rgba(255,255,255,.06)) 1px, transparent 1px), linear-gradient(to bottom, light-dark(rgba(0,0,0,.055), rgba(255,255,255,.06)) 1px, transparent 1px)",
            backgroundSize: `calc(100% / ${W}) calc(100% / ${D})`,
          }}
        >
          <Fixtures />
          {tables.map((t) => (
            <TableView
              key={t.id}
              table={t}
              over={over}
              onOver={setOver}
              flaggedGuests={flaggedGuests}
            />
          ))}
        </Box>
      </Box>
    </Paper>
  );
}
```

```tsx components/Shell.tsx
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppShell,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Group,
  Progress,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { IconArmchair, IconLayoutGrid, IconUsers } from "@tabler/icons-react";
import { app, planner } from "@/lib/data";
import { initials } from "@/lib/plan";
import { usePlan } from "./PlanProvider";

const NAV = [
  { href: "/", label: "Plan", icon: IconLayoutGrid },
  { href: "/guests", label: "Guests", icon: IconUsers },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { stats } = usePlan();
  const pct = stats.attending > 0 ? Math.min(100, (stats.seated / stats.attending) * 100) : 0;

  return (
    <AppShell header={{ height: 64 }} padding={{ base: "sm", sm: "md" }}>
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="md" wrap="nowrap">
            <UnstyledButton component={Link} href="/" aria-label={`${app.name}, back to the plan`}>
              <Group gap="xs" wrap="nowrap">
                <ThemeIcon size={36} radius="md" variant="gradient" gradient={{ from: "brand.6", to: "grape.6", deg: 135 }}>
                  <IconArmchair size={22} />
                </ThemeIcon>
                <Text fw={800} fz={20} style={{ letterSpacing: -0.3 }}>
                  {app.name}
                </Text>
              </Group>
            </UnstyledButton>
            <Divider orientation="vertical" visibleFrom="xs" />
            <Box component="nav" aria-label="Main" style={{ display: "flex", gap: 4 }}>
              {NAV.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Button
                    key={item.href}
                    component={Link}
                    href={item.href}
                    variant={active ? "light" : "subtle"}
                    color={active ? "brand" : "gray"}
                    size="sm"
                    leftSection={<item.icon size={16} />}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>
          </Group>
          <Group gap="lg" wrap="nowrap">
            <Box visibleFrom="md" w={190}>
              <Group justify="space-between" mb={4}>
                <Text size="xs" fw={600}>
                  {stats.seated} seated
                </Text>
                <Text size="xs" c="dimmed">
                  {stats.toSeat} to seat
                </Text>
              </Group>
              <Progress value={pct} size="sm" aria-label={`${stats.seated} guests seated, ${stats.toSeat} attending guests still to seat`} />
            </Box>
            <Group gap="xs" wrap="nowrap">
              <Avatar color="brand" radius="xl" size={34} aria-hidden>
                {initials(planner.name)}
              </Avatar>
              <Box visibleFrom="sm">
                <Text size="sm" fw={600} lh={1.2}>
                  {planner.name}
                </Text>
                <Text size="xs" c="dimmed" lh={1.2}>
                  Wedding planner
                </Text>
              </Box>
            </Group>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Main
        id="main"
        style={{ background: "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))" }}
      >
        <Container size={1680} p={0}>
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
```

```tsx components/SidePanel.tsx
"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Group,
  Menu,
  Paper,
  Progress,
  ScrollArea,
  Select,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconArmchair,
  IconArrowsExchange,
  IconCheck,
  IconClock,
  IconHandClick,
  IconUserMinus,
  IconX,
} from "@tabler/icons-react";
import { guests, tables } from "@/lib/data";
import {
  conflictsIfPlaced,
  guestById,
  initials,
  occupants,
  tableById,
} from "@/lib/plan";
import { DietBadge, PartyBadge, partyColor } from "./GuestBits";
import { usePlan } from "./PlanProvider";

// ------------------------------------------------------------ move / seat menu

function SeatMenuItems({ guestId, excludeTable }: { guestId: string; excludeTable?: string }) {
  const { seating, place } = usePlan();
  const options = tables.filter((t) => t.id !== excludeTable);
  return (
    <>
      <Menu.Label>{excludeTable ? "Move to" : "Seat at"}</Menu.Label>
      {options.map((t) => {
        const free = occupants(seating, t.id).filter((o) => !o).length;
        const clash = free > 0 ? conflictsIfPlaced(seating, guestId, t.id) : [];
        return (
          <Menu.Item
            key={t.id}
            disabled={free === 0}
            onClick={() => place(guestId, t.id)}
            color={clash.length > 0 ? "red" : undefined}
            rightSection={
              <Text size="xs" c={free === 0 ? "dimmed" : clash.length > 0 ? "red" : "dimmed"}>
                {free === 0 ? "Full" : clash.length > 0 ? `Breaks: ${clash[0]?.label.toLowerCase()}` : `${free} free`}
              </Text>
            }
          >
            {t.name}
          </Menu.Item>
        );
      })}
    </>
  );
}

function SeatMenu({ guestId, excludeTable }: { guestId: string; excludeTable?: string }) {
  const guest = guestById[guestId];
  return (
    <Menu position="bottom-end" withinPortal shadow="md" width={250}>
      <Menu.Target>
        <Button
          size="compact-sm"
          variant="light"
          leftSection={excludeTable ? <IconArrowsExchange size={14} /> : <IconArmchair size={14} />}
          aria-label={`${excludeTable ? "Move" : "Seat"} ${guest?.name ?? "guest"}`}
        >
          {excludeTable ? "Move" : "Seat"}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <SeatMenuItems guestId={guestId} excludeTable={excludeTable} />
      </Menu.Dropdown>
    </Menu>
  );
}

// -------------------------------------------------------------------- rows

function GuestRow({ guestId, seat, tableId }: { guestId: string; seat?: number; tableId?: string }) {
  const { picked, dragId, pick, unseat, setDragId } = usePlan();
  const guest = guestById[guestId];
  if (!guest) return null;
  const isPicked = picked === guestId;
  const color = partyColor(guest.party);
  return (
    <Paper
      withBorder
      p="xs"
      draggable
      onDragStart={(e: DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("text/plain", guestId);
        e.dataTransfer.effectAllowed = "move";
        setDragId(guestId);
      }}
      onDragEnd={() => setDragId(null)}
      style={{
        cursor: "grab",
        opacity: dragId === guestId ? 0.5 : 1,
        borderColor: isPicked ? "var(--mantine-color-brand-filled)" : undefined,
        boxShadow: isPicked ? "0 0 0 2px var(--mantine-color-brand-filled)" : undefined,
        background: isPicked ? "var(--mantine-color-brand-light)" : undefined,
      }}
    >
      <Group wrap="nowrap" gap="xs" justify="space-between">
        <UnstyledButton
          onClick={() => pick(isPicked ? null : guestId)}
          aria-pressed={isPicked}
          style={{ flex: 1, minWidth: 0, touchAction: "manipulation" }}
        >
          <Group gap="sm" wrap="nowrap">
            <Avatar color={color} radius="xl" size={34}>
              {seat !== undefined ? seat + 1 : initials(guest.name)}
            </Avatar>
            <Box style={{ minWidth: 0 }}>
              <Text size="sm" fw={600} truncate>
                {guest.name}
              </Text>
              <Group gap={6} wrap="wrap">
                <Text size="xs" c="dimmed">
                  {guest.party}
                  {guest.rsvp === "maybe" ? " · maybe" : guest.rsvp === "pending" ? " · awaiting reply" : ""}
                </Text>
                <DietBadge diet={guest.diet} />
              </Group>
            </Box>
          </Group>
        </UnstyledButton>
        <Group gap={6} wrap="nowrap">
          <SeatMenu guestId={guestId} excludeTable={tableId} />
          {tableId ? (
            <Tooltip label="Unseat">
              <ActionIcon
                variant="subtle"
                color="gray"
                aria-label={`Unseat ${guest.name}`}
                onClick={() => unseat(guestId)}
              >
                <IconUserMinus size={16} />
              </ActionIcon>
            </Tooltip>
          ) : null}
        </Group>
      </Group>
    </Paper>
  );
}

// ---------------------------------------------------------------- to seat

function ToSeat() {
  const { seating, dragId, unseat } = usePlan();
  const [dropOver, setDropOver] = useState(false);
  const yes = guests.filter((g) => g.rsvp === "yes" && !seating[g.id]);
  const undecided = guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !seating[g.id]);
  const dragSeated = dragId ? Boolean(seating[dragId]) : false;

  return (
    <Stack
      gap="xs"
      p="xs"
      onDragOver={(e: DragEvent<HTMLDivElement>) => {
        if (!dragSeated) return;
        e.preventDefault();
        setDropOver(true);
      }}
      onDragLeave={() => setDropOver(false)}
      onDrop={(e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDropOver(false);
        const id = e.dataTransfer.getData("text/plain");
        if (id) unseat(id);
      }}
      style={{
        borderRadius: 8,
        outline: dropOver ? "2px dashed var(--mantine-color-brand-filled)" : undefined,
        background: dropOver ? "var(--mantine-color-brand-light)" : undefined,
      }}
    >
      <Text size="xs" c="dimmed">
        Tap a guest, then a table or an empty seat. Or drag them onto the plan.
        {dragSeated ? " Drop here to unseat." : ""}
      </Text>
      {yes.length === 0 ? (
        <Alert color="teal" icon={<IconCheck size={16} />} title="Everyone attending has a seat" />
      ) : (
        yes.map((g) => <GuestRow key={g.id} guestId={g.id} />)
      )}
      {undecided.length > 0 ? (
        <>
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" mt="sm">
            Not confirmed yet ({undecided.length})
          </Text>
          {undecided.map((g) => (
            <GuestRow key={g.id} guestId={g.id} />
          ))}
        </>
      ) : null}
    </Stack>
  );
}

// ------------------------------------------------------------- table panel

function TableDetails() {
  const { seating, selectedTable, rules, selectTable, place } = usePlan();
  const table = selectedTable ? tableById[selectedTable] : undefined;

  if (!table) {
    return (
      <Stack align="center" gap="xs" p="xl" ta="center">
        <ThemeIcon variant="light" size={44} radius="xl">
          <IconHandClick size={24} />
        </ThemeIcon>
        <Text fw={600}>No table selected</Text>
        <Text size="sm" c="dimmed">
          Select a table on the plan to see who sits there and what they eat.
        </Text>
      </Stack>
    );
  }

  const occ = occupants(seating, table.id);
  const seated = occ.flatMap((id, seat) => (id ? [{ id, seat }] : []));
  const emptySeats = occ.length - seated.length;
  const dietCounts = new Map<string, number>();
  for (const { id } of seated) {
    const d = guestById[id]?.diet;
    if (d) dietCounts.set(d, (dietCounts.get(d) ?? 0) + 1);
  }
  const broken = rules.filter((r) => r.status === "broken" && r.tables.includes(table.id));
  const candidates = guests
    .filter((g) => g.rsvp !== "no" && !seating[g.id])
    .map((g) => ({ value: g.id, label: `${g.name}${g.rsvp === "yes" ? "" : " (not confirmed)"}` }));

  return (
    <Stack gap="sm" p="xs">
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <div>
          <Title order={2} size="h4">{table.name}</Title>
          <Text size="sm" c="dimmed">
            {seated.length} of {table.seats} seats filled
            {emptySeats > 0 ? ` · ${emptySeats} free` : " · full"}
          </Text>
        </div>
        <ActionIcon variant="subtle" color="gray" aria-label="Clear selection" onClick={() => selectTable(null)}>
          <IconX size={16} />
        </ActionIcon>
      </Group>
      <Progress
        value={(seated.length / table.seats) * 100}
        color={emptySeats === 0 ? "teal" : "brand"}
        size="sm"
        aria-label={`${seated.length} of ${table.seats} seats filled`}
      />

      {broken.map((r) => (
        <Alert key={r.index} color="red" variant="light" icon={<IconAlertTriangle size={16} />} title={r.label} p="xs">
          <Text size="sm">{r.text}</Text>
        </Alert>
      ))}

      <div>
        <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb={6}>
          Dietary needs
        </Text>
        {dietCounts.size === 0 ? (
          <Text size="sm" c="dimmed">
            None recorded for this table.
          </Text>
        ) : (
          <Group gap={6}>
            {Array.from(dietCounts.entries()).map(([diet, n]) => (
              <Badge key={diet} size="md" variant="light" color={/allerg/i.test(diet) ? "red" : "grape"} tt="none">
                {diet} × {n}
              </Badge>
            ))}
          </Group>
        )}
      </div>

      <Text size="xs" fw={700} tt="uppercase" c="dimmed">
        Guests
      </Text>
      {seated.length === 0 ? (
        <Text size="sm" c="dimmed">
          Nobody is seated here yet.
        </Text>
      ) : (
        seated.map(({ id, seat }) => <GuestRow key={id} guestId={id} seat={seat} tableId={table.id} />)
      )}
      {emptySeats > 0 ? (
        <Select
          label={`Seat someone here (${emptySeats} free)`}
          placeholder="Search guests without a seat"
          data={candidates}
          searchable
          clearable
          nothingFoundMessage="Everyone has a seat"
          value={null}
          onChange={(v) => {
            if (v) place(v, table.id);
          }}
        />
      ) : null}
    </Stack>
  );
}

// ------------------------------------------------------------------- rules

function RulesList() {
  const { rules, selectTable } = usePlan();
  return (
    <Stack gap="xs" p="xs">
      {rules.map((r) => {
        const color = r.status === "broken" ? "red" : r.status === "ok" ? "teal" : "gray";
        const Icon = r.status === "broken" ? IconAlertTriangle : r.status === "ok" ? IconCheck : IconClock;
        const first = r.tables[0];
        return (
          <Paper key={r.index} withBorder p="sm" style={{ borderColor: r.status === "broken" ? "var(--mantine-color-red-4)" : undefined }}>
            <Group wrap="nowrap" align="flex-start" gap="sm">
              <ThemeIcon color={color} variant="light" radius="xl" size={30}>
                <Icon size={16} />
              </ThemeIcon>
              <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                <Group gap={6} justify="space-between">
                  <Badge variant="outline" color="gray" size="sm" tt="none">
                    {r.label}
                  </Badge>
                  <Text size="xs" fw={700} c={color}>
                    {r.status === "broken" ? "Broken" : r.status === "ok" ? "Followed" : "Waiting"}
                  </Text>
                </Group>
                <Text size="sm">{r.text}</Text>
                <Text size="xs" c="dimmed">
                  {r.rule.note}
                </Text>
                {first ? (
                  <Group gap={6}>
                    {r.tables.map((tid) => (
                      <Button key={tid} size="compact-xs" variant="light" color="red" onClick={() => selectTable(tid, true)}>
                        Show {tableById[tid]?.name}
                      </Button>
                    ))}
                  </Group>
                ) : null}
              </Stack>
            </Group>
          </Paper>
        );
      })}
    </Stack>
  );
}

// ---------------------------------------------------------------- the panel

export function SidePanel() {
  const { stats, rules, selectedTable, revealTick } = usePlan();
  const [tab, setTab] = useState<string | null>("seat");
  const ref = useRef<HTMLDivElement>(null);
  const brokenCount = rules.filter((r) => r.status === "broken").length;
  const unseated = stats.toSeat + stats.undecidedUnseated;
  const table = selectedTable ? tableById[selectedTable] : undefined;

  useEffect(() => {
    if (revealTick === 0) return;
    setTab("table");
    const el = ref.current;
    if (el && window.innerWidth < 1024) {
      const top = el.getBoundingClientRect().top;
      if (top > window.innerHeight - 160) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [revealTick]);

  return (
    <Paper
      ref={ref}
      withBorder
      p={0}
      role="region"
      style={{ scrollMarginTop: 76 }}
      aria-label="Guests, table details and rules"
    >
      <Tabs value={tab} onChange={setTab} keepMounted={false}>
        <Tabs.List grow>
          <Tabs.Tab
            value="seat"
            rightSection={
              <Badge size="sm" circle variant={unseated > 0 ? "filled" : "light"} color={unseated > 0 ? "brand" : "teal"}>
                {unseated}
              </Badge>
            }
          >
            To seat
          </Tabs.Tab>
          <Tabs.Tab value="table">{table ? table.name : "Table"}</Tabs.Tab>
          <Tabs.Tab
            value="rules"
            rightSection={
              brokenCount > 0 ? (
                <Badge size="sm" circle color="red">
                  {brokenCount}
                </Badge>
              ) : null
            }
          >
            Rules
          </Tabs.Tab>
        </Tabs.List>
        <ScrollArea.Autosize mah={{ base: 720, lg: "calc(100dvh - 230px)" }} type="auto" offsetScrollbars>
          <Tabs.Panel value="seat" pt="xs">
            <ToSeat />
          </Tabs.Panel>
          <Tabs.Panel value="table" pt="xs">
            <TableDetails />
          </Tabs.Panel>
          <Tabs.Panel value="rules" pt="xs">
            <RulesList />
          </Tabs.Panel>
        </ScrollArea.Autosize>
      </Tabs>
    </Paper>
  );
}
```

```ts lib/data.ts
export type Rsvp = "yes" | "maybe" | "pending" | "no";

export type Guest = {
  id: string;
  name: string;
  party: string;
  rsvp: Rsvp;
  diet: string | null;
  table: string | null;
};

export type FixtureKind = "stage" | "dancefloor" | "bar" | "door";

export type Fixture = {
  id: string;
  kind: FixtureKind;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type TableDef = {
  id: string;
  name: string;
  shape: "round" | "long";
  seats: number;
  x: number;
  y: number;
  rotation?: number;
};

export type RuleKind = "together" | "apart" | "near";

export type Rule = {
  kind: RuleKind;
  guests: string[];
  note: string;
  /** near rules: the fixture to sit close to, and the one to stay away from */
  near?: string;
  away?: string;
};

export const app = {
  name: "Seatwise",
  tagline: "Seating plans for wedding and event planners",
};

export const event = {
  name: "Ines & Mateo's wedding dinner",
  date: "2027-06-19",
  venue: "The Orangery, Hollin Hall",
  room_m: { width: 24, depth: 14 },
};

export const planner = { name: "Hannah Brook" };

export const fixtures: Fixture[] = [
  { id: "f-1", kind: "stage", label: "Band", x: 10, y: 0.5, w: 4, h: 2 },
  { id: "f-2", kind: "dancefloor", label: "Dance floor", x: 8.5, y: 3, w: 7, h: 4 },
  { id: "f-3", kind: "bar", label: "Bar", x: 21, y: 10, w: 2.5, h: 3.5 },
  { id: "f-4", kind: "door", label: "Garden doors", x: 0, y: 6, w: 0.5, h: 2.5 },
];

export const tables: TableDef[] = [
  { id: "t-head", name: "Top table", shape: "long", seats: 8, x: 8, y: 8.2, rotation: 0 },
  { id: "t-1", name: "Table 1", shape: "round", seats: 8, x: 3, y: 2.5 },
  { id: "t-2", name: "Table 2", shape: "round", seats: 8, x: 3, y: 7 },
  { id: "t-3", name: "Table 3", shape: "round", seats: 8, x: 3, y: 11.5 },
  { id: "t-4", name: "Table 4", shape: "round", seats: 8, x: 19, y: 2.5 },
  { id: "t-5", name: "Table 5", shape: "round", seats: 8, x: 19, y: 7 },
  { id: "t-6", name: "Table 6", shape: "round", seats: 6, x: 12, y: 12 },
];

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
];

export const rules: Rule[] = [
  { kind: "together", guests: ["g-21", "g-22"], note: "Couple" },
  { kind: "together", guests: ["g-32", "g-33"], note: "Siblings, under 10" },
  {
    kind: "apart",
    guests: ["g-29", "g-30"],
    note: "Brothers Sean and Ryan Doyle are not speaking",
  },
  { kind: "apart", guests: ["g-12", "g-34"], note: "Ask the couple: old family dispute" },
  {
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
    near: "f-4",
    away: "f-1",
  },
];

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Awaiting reply",
  no: "Declined",
};

export const RSVP_COLOR: Record<Rsvp, string> = {
  yes: "teal",
  maybe: "yellow",
  pending: "gray",
  no: "red",
};

export const PARTY_COLOR: Record<string, string> = {
  Couple: "pink",
  "Bride's family": "violet",
  "Groom's family": "blue",
  "University friends": "teal",
  "Work friends": "yellow",
  "Groom's football club": "cyan",
  "Plus-ones": "gray",
};

export const parties: string[] = Array.from(new Set(guests.map((g) => g.party)));
export const diets: string[] = Array.from(
  new Set(guests.flatMap((g) => (g.diet ? [g.diet] : []))),
).sort();

export const STANDARD_MEAL = "Standard menu";

export function formatEventDate(): string {
  return new Date(`${event.date}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
```

```ts lib/plan.ts
import {
  fixtures,
  guests,
  rules,
  tables,
  type Fixture,
  type Guest,
  type Rule,
  type TableDef,
} from "./data";

/** Where each guest sits: a table and a seat index, or null when unseated. */
export type Placement = { table: string; seat: number };
export type Seating = Record<string, Placement | null>;

export const SEAT_D = 0.85; // seat diameter, metres
export const NEAR_MAX_M = 4.5; // "near" a fixture: table centre within this distance
export const AWAY_MIN_M = 6; // "away" from a fixture: at least this far

export const guestById: Record<string, Guest> = Object.fromEntries(guests.map((g) => [g.id, g]));
export const tableById: Record<string, TableDef> = Object.fromEntries(tables.map((t) => [t.id, t]));
export const fixtureById: Record<string, Fixture> = Object.fromEntries(
  fixtures.map((f) => [f.id, f]),
);

export function firstName(guest: Guest): string {
  return guest.name.split(" ")[0] ?? guest.name;
}

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function initialSeating(): Seating {
  const seating: Seating = {};
  const used: Record<string, number> = {};
  // The couple sit in the middle of the top table.
  const headOrder = [3, 4, 2, 5, 1, 6, 0, 7];
  for (const g of guests) {
    if (!g.table) {
      seating[g.id] = null;
      continue;
    }
    const n = used[g.table] ?? 0;
    used[g.table] = n + 1;
    const seat = g.table === "t-head" ? (headOrder[n] ?? n) : n;
    seating[g.id] = { table: g.table, seat };
  }
  return seating;
}

/** Guest ids by seat index for one table (null = empty seat). */
export function occupants(seating: Seating, tableId: string): (string | null)[] {
  const table = tableById[tableId];
  const seats: (string | null)[] = Array.from({ length: table ? table.seats : 0 }, () => null);
  for (const [guestId, p] of Object.entries(seating)) {
    if (p && p.table === tableId) seats[p.seat] = guestId;
  }
  return seats;
}

export function seatedCount(seating: Seating, tableId: string): number {
  return occupants(seating, tableId).filter(Boolean).length;
}

// ---------------------------------------------------------------- geometry

type Box = { x: number; y: number; w: number; h: number };

export type TableGeometry = {
  box: Box; // everything the table needs, seats included
  disc: Box; // the table top
  round: boolean;
  seats: { x: number; y: number }[];
  centre: { x: number; y: number };
};

export function tableGeometry(t: TableDef): TableGeometry {
  if (t.shape === "round") {
    const top = 0.75;
    const ring = 1.3;
    const seats = Array.from({ length: t.seats }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
      return { x: t.x + ring * Math.cos(a), y: t.y + ring * Math.sin(a) };
    });
    const ext = ring + SEAT_D / 2 + 0.15;
    return {
      box: { x: t.x - ext, y: t.y - ext, w: ext * 2, h: ext * 2 },
      disc: { x: t.x - top, y: t.y - top, w: top * 2, h: top * 2 },
      round: true,
      seats,
      centre: { x: t.x, y: t.y },
    };
  }
  // Long table: x, y is its top-left corner, one metre per seat, seats on the room side.
  const w = t.seats;
  const h = 1;
  const seats = Array.from({ length: t.seats }, (_, i) => ({
    x: t.x + 0.5 + i,
    y: t.y + h + 0.1 + SEAT_D / 2,
  }));
  return {
    box: { x: t.x - 0.15, y: t.y - 0.15, w: w + 0.3, h: h + 0.1 + SEAT_D + 0.3 },
    disc: { x: t.x, y: t.y, w, h },
    round: false,
    seats,
    centre: { x: t.x + w / 2, y: t.y + h / 2 },
  };
}

export function fixtureCentre(f: Fixture): { x: number; y: number } {
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

export function distanceToFixture(tableId: string, fixtureId: string): number {
  const t = tableById[tableId];
  const f = fixtureById[fixtureId];
  if (!t || !f) return Number.POSITIVE_INFINITY;
  const a = tableGeometry(t).centre;
  const b = fixtureCentre(f);
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// ------------------------------------------------------------------- rules

export type RuleStatus = "ok" | "broken" | "waiting";

export type RuleResult = {
  index: number;
  rule: Rule;
  label: string;
  status: RuleStatus;
  /** tables to flag when the rule is broken */
  tables: string[];
  text: string;
};

export const RULE_LABEL: Record<Rule["kind"], string> = {
  together: "Keep together",
  apart: "Keep apart",
  near: "Seat near",
};

function tableName(id: string): string {
  return tableById[id]?.name ?? id;
}

function m(n: number): string {
  return `${n.toFixed(1)} m`;
}

export function evaluateRules(seating: Seating): RuleResult[] {
  return rules.map((rule, index): RuleResult => {
    const label = RULE_LABEL[rule.kind];
    const people = rule.guests.map((id) => guestById[id]).filter((g): g is Guest => Boolean(g));
    const where = people.map((g) => seating[g.id] ?? null);
    const unseated = people.filter((_, i) => !where[i]);
    const seatedTables = Array.from(
      new Set(where.flatMap((p) => (p ? [p.table] : []))),
    );
    const names = people.map((g) => g.name);

    if (unseated.length > 0) {
      return {
        index,
        rule,
        label,
        status: "waiting",
        tables: [],
        text: `Waiting for ${unseated.map((g) => g.name).join(" and ")} to be seated.`,
      };
    }

    if (rule.kind === "together") {
      const same = seatedTables.length === 1;
      return {
        index,
        rule,
        label,
        status: same ? "ok" : "broken",
        tables: same ? [] : seatedTables,
        text: same
          ? `${names.join(" and ")} are both at ${tableName(seatedTables[0] ?? "")}.`
          : `${names[0]} (${tableName(where[0]?.table ?? "")}) and ${names[1]} (${tableName(where[1]?.table ?? "")}) should sit together.`,
      };
    }

    if (rule.kind === "apart") {
      const same = seatedTables.length === 1;
      return {
        index,
        rule,
        label,
        status: same ? "broken" : "ok",
        tables: same ? seatedTables : [],
        text: same
          ? `${names.join(" and ")} are both at ${tableName(seatedTables[0] ?? "")}.`
          : `${names[0]} (${tableName(where[0]?.table ?? "")}) and ${names[1]} (${tableName(where[1]?.table ?? "")}) are at different tables.`,
      };
    }

    // near
    const tableId = where[0]?.table ?? "";
    const nearF = rule.near ? fixtureById[rule.near] : undefined;
    const awayF = rule.away ? fixtureById[rule.away] : undefined;
    const dNear = nearF ? distanceToFixture(tableId, nearF.id) : 0;
    const dAway = awayF ? distanceToFixture(tableId, awayF.id) : Number.POSITIVE_INFINITY;
    const problems: string[] = [];
    if (nearF && dNear > NEAR_MAX_M) {
      problems.push(`${m(dNear)} from the ${nearF.label.toLowerCase()} (within ${m(NEAR_MAX_M)} is near)`);
    }
    if (awayF && dAway < AWAY_MIN_M) {
      problems.push(`only ${m(dAway)} from the ${awayF.label.toLowerCase()}`);
    }
    const ok = problems.length === 0;
    return {
      index,
      rule,
      label,
      status: ok ? "ok" : "broken",
      tables: ok ? [] : [tableId],
      text: ok
        ? `${names[0]} is at ${tableName(tableId)}, ${m(dNear)} from the ${nearF?.label.toLowerCase() ?? "fixture"}.`
        : `${names[0]} is at ${tableName(tableId)}, ${problems.join(" and ")}.`,
    };
  });
}

// ----------------------------------------------------------------- seating

export type PlaceResult = { seating: Seating; error?: string; noop?: boolean; note?: string };

export function placeGuest(
  seating: Seating,
  guestId: string,
  tableId: string,
  seat?: number,
): PlaceResult {
  const guest = guestById[guestId];
  const table = tableById[tableId];
  if (!guest || !table) return { seating, error: "That guest or table does not exist." };
  if (guest.rsvp === "no") {
    return { seating, error: `${guest.name} has declined, so there is no seat to give.` };
  }
  const current = seating[guestId] ?? null;
  const occ = occupants(seating, tableId);
  let target = seat;
  if (target === undefined) {
    if (current && current.table === tableId) {
      return { seating, noop: true, note: `${guest.name} is already at ${table.name}.` };
    }
    target = occ.indexOf(null);
    if (target < 0) return { seating, error: `${table.name} is full.` };
  }
  const other = occ[target] ?? null;
  if (other === guestId) return { seating, noop: true };
  const next: Seating = { ...seating };
  if (other) {
    if (!current) {
      const o = guestById[other];
      return {
        seating,
        error: `Seat ${target + 1} at ${table.name} is taken by ${o ? o.name : "another guest"}. Choose an empty seat.`,
      };
    }
    next[other] = current;
  }
  next[guestId] = { table: tableId, seat: target };
  const o = other ? guestById[other] : undefined;
  return {
    seating: next,
    note: o
      ? `${guest.name} and ${o.name} swapped seats.`
      : `${guest.name} is now at ${table.name}, seat ${target + 1}.`,
  };
}

export function unseatGuest(seating: Seating, guestId: string): Seating {
  return { ...seating, [guestId]: null };
}

/** Rules that would newly break if this guest took the first free seat at the table. */
export function conflictsIfPlaced(
  seating: Seating,
  guestId: string,
  tableId: string,
): RuleResult[] {
  const before = new Set(
    evaluateRules(seating)
      .filter((r) => r.status === "broken")
      .map((r) => r.index),
  );
  const res = placeGuest(seating, guestId, tableId);
  if (res.error || res.noop) return [];
  return evaluateRules(res.seating).filter(
    (r) => r.status === "broken" && !before.has(r.index) && r.rule.guests.includes(guestId),
  );
}

// ------------------------------------------------------------------- stats

export type Stats = {
  invited: number;
  attending: number;
  seated: number;
  /** attending (yes) guests without a seat */
  toSeat: number;
  /** maybe / awaiting reply guests without a seat */
  undecidedUnseated: number;
  totalSeats: number;
  freeSeats: number;
};

export function computeStats(seating: Seating): Stats {
  const seated = guests.filter((g) => seating[g.id]).length;
  const attending = guests.filter((g) => g.rsvp === "yes").length;
  const toSeat = guests.filter((g) => g.rsvp === "yes" && !seating[g.id]).length;
  const undecidedUnseated = guests.filter(
    (g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !seating[g.id],
  ).length;
  const totalSeats = tables.reduce((n, t) => n + t.seats, 0);
  return {
    invited: guests.length,
    attending,
    seated,
    toSeat,
    undecidedUnseated,
    totalSeats,
    freeSeats: totalSeats - seated,
  };
}

// ------------------------------------------------------------------- meals

export type MealRow = { meal: string; confirmed: number; undecided: number };

export function mealCounts(standard: string): MealRow[] {
  const map = new Map<string, MealRow>();
  for (const g of guests) {
    if (g.rsvp === "no") continue;
    const meal = g.diet ?? standard;
    const row = map.get(meal) ?? { meal, confirmed: 0, undecided: 0 };
    if (g.rsvp === "yes") row.confirmed += 1;
    else row.undecided += 1;
    map.set(meal, row);
  }
  const rows = Array.from(map.values());
  rows.sort((a, b) => {
    if (a.meal === standard) return -1;
    if (b.meal === standard) return 1;
    return a.meal.localeCompare(b.meal);
  });
  return rows;
}
```

