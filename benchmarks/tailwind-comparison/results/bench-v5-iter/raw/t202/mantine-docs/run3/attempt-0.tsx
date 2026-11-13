```tsx app/guests/page.tsx
import type { Metadata } from "next";
import { GuestsView } from "@/components/GuestsView";

export const metadata: Metadata = { title: "Guests: Seatwise" };

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
import { Shell } from "@/components/Shell";
import { theme } from "./theme";

export const metadata: Metadata = {
  title: "Seatwise: seating plan for Ines & Mateo",
  description: "A seating planner for wedding and event planners.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <ModalsProvider>
            <Notifications position="bottom-center" />
            <Shell>{children}</Shell>
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
import { createTheme, type MantineColorsTuple } from "@mantine/core";

// Orangery green: a calm, dark sage that reads well next to the warm floor colours.
const brand: MantineColorsTuple = [
  "#eef7f1",
  "#dcede3",
  "#b8dac6",
  "#91c6a7",
  "#70b58f",
  "#5aaa7f",
  "#4aa575",
  "#3a8f62",
  "#2f7e56",
  "#1f6b46",
];

// System font stack, identical in every arm (no network font fetch at build).
export const theme = createTheme({
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  headings: { fontFamily: "ui-sans-serif, system-ui, sans-serif", fontWeight: "650" },
  colors: { brand },
  primaryColor: "brand",
  primaryShade: 8,
  defaultRadius: "md",
  cursorType: "pointer",
  components: {
    Card: { defaultProps: { withBorder: true, radius: "lg", padding: "md" } },
    Paper: { defaultProps: { radius: "md" } },
    Badge: { defaultProps: { radius: "sm" } },
  },
});
```

```tsx components/GuestChip.tsx
"use client";

import { Badge, Box, Group, Text, UnstyledButton } from "@mantine/core";
import { RSVP_LABEL, initials, type Guest } from "@/lib/data";
import { useDrag } from "@/lib/drag";
import { usePlan } from "@/lib/plan";
import { partyStyle } from "@/lib/style";

export function GuestChip({ guest }: { guest: Guest }) {
  const { selectedGuest, selectGuest } = usePlan();
  const { begin, justDragged, dragging } = useDrag();
  const selected = selectedGuest === guest.id;
  const p = partyStyle(guest.party);
  const unconfirmed = guest.rsvp !== "yes";

  return (
    <UnstyledButton
      onPointerDown={(e) => begin(e, guest.id)}
      onClick={() => {
        if (justDragged()) return;
        selectGuest(selected ? null : guest.id);
      }}
      aria-pressed={selected}
      px="xs"
      py={6}
      bg="white"
      style={{
        border: `1.5px solid ${selected ? "var(--mantine-color-brand-8)" : "var(--mantine-color-gray-3)"}`,
        boxShadow: selected ? "0 0 0 3px var(--mantine-color-brand-1)" : "var(--mantine-shadow-xs)",
        borderRadius: 999,
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        cursor: dragging === guest.id ? "grabbing" : "grab",
        opacity: dragging === guest.id ? 0.45 : 1,
        minHeight: 44,
      }}
    >
      <Group gap={8} wrap="nowrap">
        <Box
          aria-hidden
          w={30}
          h={30}
          style={{
            flex: "none",
            borderRadius: "50%",
            background: p.bg,
            color: p.fg,
            border: `1.5px solid ${p.edge}`,
            display: "grid",
            placeItems: "center",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {initials(guest.name)}
        </Box>
        <Box>
          <Text size="sm" fw={600} lh={1.2} style={{ whiteSpace: "nowrap" }}>
            {guest.name}
          </Text>
          <Text size="xs" c="gray.7" lh={1.2} style={{ whiteSpace: "nowrap" }}>
            {guest.party}
          </Text>
        </Box>
        {guest.diet ? (
          <Badge size="sm" variant="light" color="orange" c="gray.9" style={{ flex: "none" }}>
            {guest.diet}
          </Badge>
        ) : null}
        {unconfirmed ? (
          <Badge size="sm" variant="outline" color="gray.7" style={{ flex: "none" }}>
            {RSVP_LABEL[guest.rsvp]}
          </Badge>
        ) : null}
      </Group>
    </UnstyledButton>
  );
}
```

```tsx components/GuestsView.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Anchor, Badge, Box, Button, Card, Group, Select, Stack, Table, Text, TextInput, Title, UnstyledButton } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCopy, IconSearch } from "@tabler/icons-react";
import { GUESTS, PARTIES, RSVP_COLOR, RSVP_LABEL, STANDARD_MEAL, TABLES, type Rsvp } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { tableById } from "@/lib/rules";
import { partyStyle } from "@/lib/style";
import classes from "./room.module.css";

const NO_DIET = "__none";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const DIETS = [...new Set(GUESTS.flatMap((g) => (g.diet ? [g.diet] : [])))].sort((a, b) => a.localeCompare(b));

const RSVP_OPTIONS = (Object.keys(RSVP_LABEL) as Rsvp[]).map((k) => ({ value: k, label: RSVP_LABEL[k] }));

function mealsFor(): { meal: string; confirmed: number; awaiting: number }[] {
  const meals = [STANDARD_MEAL, ...DIETS];
  return meals.map((meal) => {
    const match = (d: string | null) => (meal === STANDARD_MEAL ? d === null : d === meal);
    return {
      meal,
      confirmed: GUESTS.filter((g) => g.rsvp === "yes" && match(g.diet)).length,
      awaiting: GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && match(g.diet)).length,
    };
  });
}

export function GuestsView() {
  const { tableOf, selectTable } = usePlan();
  const [query, setQuery] = useState("");
  const [party, setParty] = useState<string | null>(null);
  const [rsvp, setRsvp] = useState<string | null>(null);
  const [diet, setDiet] = useState<string | null>(null);

  const meals = useMemo(mealsFor, []);
  const totalConfirmed = meals.reduce((n, m) => n + m.confirmed, 0);
  const totalAwaiting = meals.reduce((n, m) => n + m.awaiting, 0);

  const rows = useMemo(() => {
    const q = norm(query.trim());
    return GUESTS.filter((g) => {
      if (q && !norm(g.name).includes(q)) return false;
      if (party && g.party !== party) return false;
      if (rsvp && g.rsvp !== rsvp) return false;
      if (diet === NO_DIET && g.diet !== null) return false;
      if (diet && diet !== NO_DIET && g.diet !== diet) return false;
      return true;
    });
  }, [query, party, rsvp, diet]);

  const filtered = Boolean(query || party || rsvp || diet);
  const dietOptions = [{ value: NO_DIET, label: STANDARD_MEAL }, ...DIETS.map((d) => ({ value: d, label: d }))];

  const copySummary = async () => {
    const lines = [
      "Ines & Mateo's wedding dinner: meals for the caterer",
      ...meals.filter((m) => m.confirmed > 0).map((m) => `${m.meal}: ${m.confirmed}`),
      `Total attending: ${totalConfirmed}`,
      `Still awaiting a reply: ${totalAwaiting}`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      notifications.show({ color: "green", title: "Copied", message: "Meal counts are on your clipboard." });
    } catch {
      notifications.show({ color: "red", title: "Could not copy", message: "Select the counts and copy them by hand." });
    }
  };

  return (
    <Stack gap="md">
      <Box>
        <Title order={1} size="h2">
          Guest list
        </Title>
        <Text c="gray.7" size="sm">
          {GUESTS.length} invited · {totalConfirmed} attending · {totalAwaiting} awaiting a reply
        </Text>
      </Box>

      <Box className={classes.guestsLayout}>
        <Card p={0} aria-label="Guests">
          <Box p="md" style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}>
            <Box style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))" }}>
              <TextInput
                label="Search"
                placeholder="Name"
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
                leftSection={<IconSearch size={16} aria-hidden />}
              />
              <Select label="Party" placeholder="All parties" data={PARTIES} value={party} onChange={setParty} clearable />
              <Select label="RSVP" placeholder="Any reply" data={RSVP_OPTIONS} value={rsvp} onChange={setRsvp} clearable />
              <Select label="Diet" placeholder="All diets" data={dietOptions} value={diet} onChange={setDiet} clearable />
            </Box>
            <Group justify="space-between" mt="sm" mih={32}>
              <Text size="sm" c="gray.8" role="status">
                Showing {rows.length} of {GUESTS.length} guests
              </Text>
              {filtered ? (
                <Button
                  size="compact-sm"
                  variant="subtle"
                  onClick={() => {
                    setQuery("");
                    setParty(null);
                    setRsvp(null);
                    setDiet(null);
                  }}
                >
                  Clear filters
                </Button>
              ) : null}
            </Group>
          </Box>

          <Table.ScrollContainer minWidth={620}>
            <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover stickyHeader>
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
                {rows.map((g) => {
                  const tid = tableOf(g.id);
                  const ps = partyStyle(g.party);
                  return (
                    <Table.Tr key={g.id}>
                      <Table.Td>
                        <Text size="sm" fw={600}>
                          {g.name}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={8} wrap="nowrap">
                          <Box w={12} h={12} aria-hidden style={{ flex: "none", borderRadius: "50%", background: ps.bg, border: `2px solid ${ps.edge}` }} />
                          <Text size="sm">{g.party}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" color={RSVP_COLOR[g.rsvp]} c="gray.9">
                          {RSVP_LABEL[g.rsvp]}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {g.diet ? (
                          <Badge variant="light" color="orange" c="gray.9">
                            {g.diet}
                          </Badge>
                        ) : (
                          <Text size="sm" c="gray.7">
                            None
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        {tid ? (
                          <Anchor component={Link} href="/" size="sm" fw={600} onClick={() => selectTable(tid)} aria-label={`${tableById.get(tid)?.name ?? tid}: show on the plan`}>
                            {tableById.get(tid)?.name ?? tid}
                          </Anchor>
                        ) : g.rsvp === "no" ? (
                          <Text size="sm" c="gray.7">
                            Not coming
                          </Text>
                        ) : (
                          <Text size="sm" fw={600} c={g.rsvp === "yes" ? "red.8" : "gray.7"}>
                            Not seated
                          </Text>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
                {rows.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Text ta="center" c="gray.7" py="lg" size="sm">
                        No guests match these filters.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : null}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Card>

        <Card aria-label="Meal counts">
          <Group justify="space-between" align="flex-start" mb="xs" wrap="nowrap">
            <Box>
              <Title order={2} size="h3">
                Meals for the caterer
              </Title>
              <Text size="sm" c="gray.7">
                Attending guests by meal. Tap a row to filter the list.
              </Text>
            </Box>
          </Group>
          <Table verticalSpacing={6} horizontalSpacing="xs" aria-label="Meal counts">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Meal</Table.Th>
                <Table.Th ta="right">Attending</Table.Th>
                <Table.Th ta="right">Awaiting</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {meals.map((m) => {
                const value = m.meal === STANDARD_MEAL ? NO_DIET : m.meal;
                return (
                  <Table.Tr key={m.meal}>
                    <Table.Td p={0}>
                      <UnstyledButton
                        onClick={() => setDiet(diet === value ? null : value)}
                        aria-pressed={diet === value}
                        w="100%"
                        px="xs"
                        py={8}
                        style={{ minHeight: 40, fontSize: "var(--mantine-font-size-sm)", fontWeight: diet === value ? 700 : 500 }}
                      >
                        {m.meal}
                      </UnstyledButton>
                    </Table.Td>
                    <Table.Td ta="right" fw={700}>
                      {m.confirmed}
                    </Table.Td>
                    <Table.Td ta="right" c="gray.7">
                      {m.awaiting}
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
            <Table.Tfoot>
              <Table.Tr>
                <Table.Th>Total</Table.Th>
                <Table.Th ta="right">{totalConfirmed}</Table.Th>
                <Table.Th ta="right">{totalAwaiting}</Table.Th>
              </Table.Tr>
            </Table.Tfoot>
          </Table>
          <Text size="xs" c="gray.7" mt="xs">
            {GUESTS.filter((g) => g.rsvp === "no").length} declined and are not counted. {TABLES.length} tables seat up to{" "}
            {TABLES.reduce((n, t) => n + t.seats, 0)}.
          </Text>
          <Button mt="sm" variant="light" leftSection={<IconCopy size={16} aria-hidden />} onClick={copySummary}>
            Copy summary for the caterer
          </Button>
        </Card>
      </Box>
    </Stack>
  );
}
```

```tsx components/PlanView.tsx
"use client";

import { Badge, Box, Button, Card, Collapse, Group, Paper, Stack, Text, Title, UnstyledButton, VisuallyHidden } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconAlertTriangle, IconArrowBackUp, IconCircleCheck, IconClock, IconRefresh, IconUserMinus } from "@tabler/icons-react";
import { GUESTS } from "@/lib/data";
import { useDrag } from "@/lib/drag";
import { usePlan, usePlanStats } from "@/lib/plan";
import { guestById } from "@/lib/rules";
import { GuestChip } from "./GuestChip";
import { Room } from "./Room";
import { TablePanel } from "./TablePanel";
import classes from "./room.module.css";

function Stat({ label, value, hint, tone }: { label: string; value: number; hint: string; tone?: "red" | "brand" }) {
  return (
    <Paper withBorder p="sm" bg="white" radius="lg">
      <Text size="xs" fw={700} tt="uppercase" c="gray.7" lh={1.2}>
        {label}
      </Text>
      <Text fz={28} fw={700} lh={1.15} c={tone === "red" ? "red.8" : undefined}>
        {value}
      </Text>
      <Text size="xs" c="gray.7">
        {hint}
      </Text>
    </Paper>
  );
}

function Stats() {
  const { attending, unseated, seatedCount, capacity } = usePlanStats();
  return (
    <Box className={classes.statGrid} role="group" aria-label="Seating counts">
      <Stat label="Attending" value={attending.length} hint={`of ${GUESTS.length} invited`} />
      <Stat label="Seated" value={seatedCount} hint={`${capacity - seatedCount} of ${capacity} seats free`} />
      <Stat label="Unseated" value={unseated.length} hint="attending, no seat yet" tone={unseated.length > 0 ? "red" : "brand"} />
      <Stat label="Awaiting reply" value={GUESTS.filter((g) => g.rsvp === "maybe" || g.rsvp === "pending").length} hint="maybe or no answer" />
    </Box>
  );
}

function PickBanner() {
  const { selectedGuest, selectGuest, unseat, tableOf } = usePlan();
  const g = selectedGuest ? guestById.get(selectedGuest) : undefined;
  if (!g) return null;
  const seated = tableOf(g.id) !== null;
  return (
    <Paper withBorder p="xs" mb="xs" bg="brand.0" style={{ borderColor: "var(--mantine-color-brand-4)" }}>
      <Group justify="space-between" gap="xs">
        <Text size="sm" fw={600} c="brand.9">
          {seated ? "Moving" : "Placing"} {g.name}: tap an empty seat, a table, or a seat to swap.
        </Text>
        <Group gap="xs">
          {seated ? (
            <Button size="compact-sm" variant="default" leftSection={<IconUserMinus size={14} aria-hidden />} onClick={() => unseat(g.id)}>
              Unseat
            </Button>
          ) : null}
          <Button size="compact-sm" variant="white" onClick={() => selectGuest(null)}>
            Cancel
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}

function RoomCard() {
  const { status, canUndo, undo, reset } = usePlan();
  return (
    <Card className={classes.room} aria-label="Room plan">
      <Group justify="space-between" align="flex-start" mb="xs" gap="xs">
        <Box>
          <Title order={2} size="h3">
            Room plan
          </Title>
          <Text size="sm" c="gray.7" mih={20} aria-hidden>
            {status || "Drag a guest onto a seat, or tap a guest and then a seat."}
          </Text>
        </Box>
        <Group gap="xs">
          <Button size="compact-md" variant="default" leftSection={<IconArrowBackUp size={16} aria-hidden />} disabled={!canUndo} onClick={undo}>
            Undo
          </Button>
          <Button size="compact-md" variant="default" leftSection={<IconRefresh size={16} aria-hidden />} onClick={reset}>
            Reset
          </Button>
        </Group>
      </Group>
      <PickBanner />
      <Room />
    </Card>
  );
}

function Tray() {
  const { unseated, unconfirmed } = usePlanStats();
  const { over, dragging } = useDrag();
  const [showMore, { toggle }] = useDisclosure(false);
  const seatedDrag = dragging !== null;
  const hot = over?.kind === "tray";
  return (
    <Card
      className={classes.tray}
      data-drop-tray
      aria-label="Guests without a seat"
      style={hot ? { borderColor: "var(--mantine-color-brand-7)", background: "var(--mantine-color-brand-0)" } : undefined}
    >
      <Group justify="space-between" mb="xs">
        <Group gap="xs">
          <Title order={2} size="h3">
            Needs a seat
          </Title>
          <Badge size="lg" color={unseated.length ? "red" : "green"} variant="light" c="gray.9">
            {unseated.length}
          </Badge>
        </Group>
        <Text size="sm" c="gray.7">
          {seatedDrag ? "Drop here to unseat" : "Attending guests with no seat"}
        </Text>
      </Group>
      {unseated.length === 0 ? (
        <Group gap="xs" c="green.9">
          <IconCircleCheck size={20} aria-hidden />
          <Text size="sm" fw={600}>
            Everyone attending has a seat.
          </Text>
        </Group>
      ) : (
        <Group gap="xs" role="list" aria-label="Unseated guests">
          {unseated.map((g) => (
            <Box key={g.id} role="listitem">
              <GuestChip guest={g} />
            </Box>
          ))}
        </Group>
      )}
      {unconfirmed.length > 0 ? (
        <Box mt="md">
          <UnstyledButton onClick={toggle} aria-expanded={showMore} py={4}>
            <Text size="sm" fw={600} c="gray.8">
              {showMore ? "Hide" : "Show"} {unconfirmed.length} guests who have not confirmed
            </Text>
          </UnstyledButton>
          <Collapse expanded={showMore}>
            <Group gap="xs" mt="xs" role="list" aria-label="Guests who have not confirmed">
              {unconfirmed.map((g) => (
                <Box key={g.id} role="listitem">
                  <GuestChip guest={g} />
                </Box>
              ))}
            </Group>
          </Collapse>
        </Box>
      ) : null}
    </Card>
  );
}

function Rules() {
  const { rules, selectTable } = usePlan();
  const broken = rules.filter((r) => r.status === "broken").length;
  const open = rules.filter((r) => r.status === "open").length;
  return (
    <Card className={classes.rules} aria-label="The couple's rules">
      <Group justify="space-between" mb="xs" wrap="nowrap">
        <Title order={2} size="h3">
          The couple&apos;s rules
        </Title>
        <Badge size="lg" variant="light" color={broken ? "red" : "green"} c="gray.9">
          {broken ? `${broken} broken` : "All clear"}
        </Badge>
      </Group>
      <Text size="sm" c="gray.7" mb="sm">
        {rules.length - broken - open} kept, {broken} broken, {open} waiting for seats.
      </Text>
      <Stack gap={6} role="list">
        {rules.map((r) => {
          const color = r.status === "broken" ? "red" : r.status === "ok" ? "green" : "gray";
          const Icon = r.status === "broken" ? IconAlertTriangle : r.status === "ok" ? IconCircleCheck : IconClock;
          const first = r.tableIds[0];
          return (
            <Box key={r.index} role="listitem">
              <UnstyledButton
                w="100%"
                p="xs"
                onClick={() => first && selectTable(first)}
                disabled={!first}
                style={{
                  borderRadius: 8,
                  border: `1px solid ${r.status === "broken" ? "var(--mantine-color-red-3)" : "var(--mantine-color-gray-3)"}`,
                  background: r.status === "broken" ? "var(--mantine-color-red-0)" : "white",
                }}
              >
                <Group gap={8} wrap="nowrap" align="flex-start">
                  <Box c={`${color}.8`} pt={1} style={{ flex: "none" }}>
                    <Icon size={18} aria-hidden />
                  </Box>
                  <Box>
                    <Text size="sm" fw={600} lh={1.3}>
                      <Text span size="xs" fw={700} tt="uppercase" c={`${color}.8`}>
                        {r.status === "broken" ? "Broken" : r.status === "ok" ? "Kept" : "Waiting"}
                      </Text>{" "}
                      {r.title}
                    </Text>
                    <Text size="sm" c="gray.8" lh={1.35}>
                      {r.detail}
                    </Text>
                    <Text size="xs" c="gray.7" fs="italic" lh={1.35} mt={2}>
                      {r.rule.note}
                    </Text>
                  </Box>
                </Group>
              </UnstyledButton>
            </Box>
          );
        })}
      </Stack>
    </Card>
  );
}

export function PlanView() {
  return (
    <Stack gap="md">
      <VisuallyHidden>
        <h1>Seating plan for Ines &amp; Mateo&apos;s wedding dinner</h1>
      </VisuallyHidden>
      <Stats />
      <Box className={classes.layout}>
        <RoomCard />
        <Box className={classes.side}>
          <Box className={classes.tablePanel}>
            <TablePanel />
          </Box>
          <Rules />
        </Box>
        <Tray />
      </Box>
    </Stack>
  );
}
```

```tsx components/Room.tsx
"use client";

import { useMemo, type KeyboardEvent } from "react";
import { Box, Group, ScrollArea, Text } from "@mantine/core";
import { EVENT, FIXTURES, PARTIES, TABLES, initials, type Guest, type TableDef } from "@/lib/data";
import { useDrag } from "@/lib/drag";
import { usePlan } from "@/lib/plan";
import { partyStyle } from "@/lib/style";
import classes from "./room.module.css";

const SEAT_R = 0.42;

type SeatPos = { x: number; y: number };

function seatPositions(t: TableDef): { pts: SeatPos[]; bodyR: number; ringR: number } {
  if (t.shape === "long") {
    const pts = Array.from({ length: t.seats }, (_, i) => ({ x: t.x + 0.5 + i, y: t.y - 0.62 }));
    return { pts, bodyR: 0, ringR: 0 };
  }
  const bodyR = t.seats <= 6 ? 0.85 : 0.95;
  const ringR = bodyR + 0.58;
  const pts = Array.from({ length: t.seats }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
    return { x: t.x + ringR * Math.cos(a), y: t.y + ringR * Math.sin(a) };
  });
  return { pts, bodyR, ringR };
}

function onKey(fn: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  };
}

export function Room() {
  const { selectedGuest, selectedTable, selectGuest, selectTable, place, occupants, rules } = usePlan();
  const { begin, justDragged, over, dragging } = useDrag();
  const { width, depth } = EVENT.room_m;

  const brokenTables = useMemo(() => new Set(rules.filter((r) => r.status === "broken").flatMap((r) => r.tableIds)), [rules]);
  const brokenGuests = useMemo(
    () => new Set(rules.filter((r) => r.status === "broken").flatMap((r) => r.guestIds)),
    [rules],
  );

  const tapTable = (t: TableDef) => {
    if (justDragged()) return;
    if (selectedGuest) {
      place(selectedGuest, t.id);
      return;
    }
    selectTable(selectedTable === t.id ? null : t.id);
  };

  const tapSeat = (t: TableDef, i: number, who: Guest | null) => {
    if (justDragged()) return;
    if (selectedGuest) {
      place(selectedGuest, t.id, i);
      return;
    }
    selectTable(t.id);
    if (who) selectGuest(who.id);
  };

  return (
    <Box>
      <ScrollArea type="auto" scrollbars="x" offsetScrollbars>
        <svg
          viewBox={`-0.5 -0.5 ${width + 1} ${depth + 1.3}`}
          role="group"
          aria-label={`Room plan, ${width} by ${depth} metres, drawn to scale`}
          style={{ display: "block", width: "100%", minWidth: 680, height: "auto", fontFamily: "inherit" }}
        >
          <defs>
            <pattern id="grid-1m" width="1" height="1" patternUnits="userSpaceOnUse">
              <path d="M 1 0 L 0 0 0 1" fill="none" stroke="var(--mantine-color-gray-5)" strokeOpacity="0.3" strokeWidth="0.03" />
            </pattern>
            <pattern id="dance-checks" width="1" height="1" patternUnits="userSpaceOnUse">
              <rect width="1" height="1" fill="var(--mantine-color-orange-0)" />
              <rect width="0.5" height="0.5" fill="var(--mantine-color-orange-1)" />
              <rect x="0.5" y="0.5" width="0.5" height="0.5" fill="var(--mantine-color-orange-1)" />
            </pattern>
          </defs>

          <rect
            x={0}
            y={0}
            width={width}
            height={depth}
            rx={0.2}
            fill="var(--mantine-color-white)"
            stroke="var(--mantine-color-gray-7)"
            strokeWidth={0.14}
            onClick={() => {
              selectGuest(null);
              selectTable(null);
            }}
          />
          <rect x={0} y={0} width={width} height={depth} rx={0.2} fill="url(#grid-1m)" pointerEvents="none" />

          {FIXTURES.map((f) => {
            const cx = f.x + f.w / 2;
            const cy = f.y + f.h / 2;
            if (f.kind === "dancefloor") {
              return (
                <g key={f.id} pointerEvents="none">
                  <rect x={f.x} y={f.y} width={f.w} height={f.h} rx={0.15} fill="url(#dance-checks)" stroke="var(--mantine-color-orange-4)" strokeWidth={0.06} />
                  <text x={cx} y={cy + 0.18} textAnchor="middle" fontSize={0.55} fontWeight={700} fill="var(--mantine-color-gray-9)">
                    {f.label}
                  </text>
                </g>
              );
            }
            if (f.kind === "stage") {
              return (
                <g key={f.id} pointerEvents="none">
                  <rect x={f.x} y={f.y} width={f.w} height={f.h} rx={0.15} fill="var(--mantine-color-gray-9)" />
                  <text x={cx} y={cy + 0.2} textAnchor="middle" fontSize={0.55} fontWeight={700} fill="var(--mantine-color-white)">
                    {f.label}
                  </text>
                </g>
              );
            }
            if (f.kind === "bar") {
              return (
                <g key={f.id} pointerEvents="none">
                  <rect x={f.x} y={f.y} width={f.w} height={f.h} rx={0.15} fill="var(--mantine-color-gray-7)" />
                  <rect x={f.x + 0.2} y={f.y + 0.2} width={f.w - 0.4} height={f.h - 0.4} rx={0.1} fill="none" stroke="var(--mantine-color-gray-3)" strokeWidth={0.05} strokeOpacity={0.6} />
                  <text x={cx} y={cy + 0.2} textAnchor="middle" fontSize={0.55} fontWeight={700} fill="var(--mantine-color-white)">
                    {f.label}
                  </text>
                </g>
              );
            }
            return (
              <g key={f.id} pointerEvents="none">
                <rect x={f.x} y={f.y} width={f.w} height={f.h} fill="var(--mantine-color-brand-2)" stroke="var(--mantine-color-brand-9)" strokeWidth={0.05} />
                <text
                  transform={`rotate(-90 ${f.x + 0.25} ${cy})`}
                  x={f.x + 0.25}
                  y={cy + 0.1}
                  textAnchor="middle"
                  fontSize={0.3}
                  fontWeight={700}
                  fill="var(--mantine-color-brand-9)"
                >
                  {f.label}
                </text>
              </g>
            );
          })}

          {TABLES.map((t) => {
            const { pts, bodyR, ringR } = seatPositions(t);
            const people = occupants(t.id);
            const taken = people.filter(Boolean).length;
            const selected = selectedTable === t.id;
            const broken = brokenTables.has(t.id);
            const tableOver = over?.kind === "table" && over.table === t.id;
            const cx = t.shape === "long" ? t.x + t.seats / 2 : t.x;
            const cy = t.shape === "long" ? t.y + 0.5 : t.y;
            const label = `${t.name}, ${taken}/${t.seats} seats taken${broken ? ", a rule is broken here" : ""}`;
            const haloR = ringR + SEAT_R + 0.15;
            return (
              <g key={t.id} className={classes.tableGroup}>
                {/* halo: selection, drop target and broken-rule marks */}
                {t.shape === "long" ? (
                  <rect
                    x={t.x - 0.35}
                    y={t.y - 1.45}
                    width={t.seats + 0.7}
                    height={2.95}
                    rx={0.4}
                    fill={selected || tableOver ? "var(--mantine-color-brand-0)" : "transparent"}
                    stroke={broken ? "var(--mantine-color-red-7)" : selected || tableOver ? "var(--mantine-color-brand-7)" : "none"}
                    strokeWidth={0.09}
                    strokeDasharray={broken ? "0.3 0.2" : undefined}
                    data-drop-table={t.id}
                  />
                ) : (
                  <circle
                    cx={t.x}
                    cy={t.y}
                    r={haloR}
                    fill={selected || tableOver ? "var(--mantine-color-brand-0)" : "transparent"}
                    stroke={broken ? "var(--mantine-color-red-7)" : selected || tableOver ? "var(--mantine-color-brand-7)" : "none"}
                    strokeWidth={0.09}
                    strokeDasharray={broken ? "0.3 0.2" : undefined}
                    data-drop-table={t.id}
                  />
                )}

                <g
                  className={classes.focusable}
                  role="button"
                  tabIndex={0}
                  aria-label={`${label}. ${selectedGuest ? "Place the selected guest here" : "Show guests"}`}
                  aria-pressed={selected}
                  onClick={() => tapTable(t)}
                  onKeyDown={onKey(() => tapTable(t))}
                  data-drop-table={t.id}
                >
                  {t.shape === "long" ? (
                    <rect
                      className={classes.tableBody}
                      x={t.x}
                      y={t.y}
                      width={t.seats}
                      height={1}
                      rx={0.2}
                      fill="var(--mantine-color-white)"
                      stroke="var(--mantine-color-gray-7)"
                      strokeWidth={0.07}
                      data-drop-table={t.id}
                    />
                  ) : (
                    <circle className={classes.tableBody} cx={t.x} cy={t.y} r={bodyR} fill="var(--mantine-color-white)" stroke="var(--mantine-color-gray-7)" strokeWidth={0.07} data-drop-table={t.id} />
                  )}
                </g>
                <g aria-hidden="true" className={classes.focusable} onClick={() => tapTable(t)} data-drop-table={t.id}>
                  {t.shape === "long" ? (
                    <text x={cx} y={cy + 0.15} textAnchor="middle" fontSize={0.42} fontWeight={700} fill="var(--mantine-color-gray-9)">
                      {t.name} {taken}/{t.seats}
                    </text>
                  ) : (
                    <>
                      <text x={cx} y={cy - 0.04} textAnchor="middle" fontSize={0.4} fontWeight={700} fill="var(--mantine-color-gray-9)">
                        {t.name}
                      </text>
                      <text x={cx} y={cy + 0.42} textAnchor="middle" fontSize={0.36} fill="var(--mantine-color-gray-8)">
                        {taken}/{t.seats}
                      </text>
                    </>
                  )}
                </g>

                {pts.map((p, i) => {
                  const who = people[i] ?? null;
                  const style = who ? partyStyle(who.party) : null;
                  const seatOver = over?.kind === "seat" && over.table === t.id && over.seat === i;
                  const guestBroken = who ? brokenGuests.has(who.id) : false;
                  const ready = Boolean(selectedGuest) && !who;
                  const seatLabel = who
                    ? `${who.name} (${initials(who.name)}), ${t.name} seat ${i + 1}${who.diet ? `, ${who.diet}` : ""}${guestBroken ? ", involved in a broken rule" : ""}`
                    : `${t.name}, seat ${i + 1}: empty`;
                  const act = () => tapSeat(t, i, who);
                  return (
                    <g key={i}>
                    <g
                      className={`${classes.seat} ${classes.focusable} ${who ? classes.grab : ""}`}
                      role="button"
                      tabIndex={0}
                      aria-label={seatLabel}
                      onClick={act}
                      onKeyDown={onKey(act)}
                      onPointerDown={who ? (e) => begin(e, who.id) : undefined}
                      data-drop-table={t.id}
                      data-drop-seat={i}
                      opacity={who && dragging === who.id ? 0.35 : 1}
                    >
                      <circle cx={p.x} cy={p.y} r={SEAT_R + 0.12} fill="transparent" data-drop-table={t.id} data-drop-seat={i} />
                      <circle
                        className={`${classes.seatCircle} ${ready && !seatOver ? classes.pulse : ""}`}
                        data-empty={who ? "false" : "true"}
                        cx={p.x}
                        cy={p.y}
                        r={SEAT_R}
                        fill={who ? style?.bg : "var(--mantine-color-white)"}
                        stroke={guestBroken ? "var(--mantine-color-red-7)" : seatOver ? "var(--mantine-color-brand-8)" : who ? style?.edge : ready ? "var(--mantine-color-brand-7)" : "var(--mantine-color-gray-5)"}
                        strokeWidth={guestBroken || seatOver ? 0.14 : 0.07}
                        strokeDasharray={who ? undefined : "0.14 0.1"}
                        data-drop-table={t.id}
                        data-drop-seat={i}
                      />
                    </g>
                    <g
                      aria-hidden="true"
                      className={`${classes.focusable} ${who ? classes.grab : ""}`}
                      onClick={act}
                      onPointerDown={who ? (e) => begin(e, who.id) : undefined}
                      data-drop-table={t.id}
                      data-drop-seat={i}
                      opacity={who && dragging === who.id ? 0.35 : 1}
                    >
                      {who ? (
                        <text x={p.x} y={p.y + 0.14} textAnchor="middle" fontSize={0.36} fontWeight={700} fill={style?.fg} pointerEvents="none">
                          {initials(who.name)}
                        </text>
                      ) : (
                        <text x={p.x} y={p.y + 0.13} textAnchor="middle" fontSize={0.34} fill="var(--mantine-color-gray-7)" pointerEvents="none">
                          {i + 1}
                        </text>
                      )}
                      {who?.diet ? <circle cx={p.x + 0.34} cy={p.y - 0.34} r={0.14} fill="var(--mantine-color-orange-7)" stroke="var(--mantine-color-white)" strokeWidth={0.05} pointerEvents="none" /> : null}
                    </g>
                    </g>
                  );
                })}

                {broken ? (
                  <g pointerEvents="none" transform={`translate(${t.shape === "long" ? t.x + t.seats + 0.1 : t.x + haloR * 0.72} ${t.shape === "long" ? t.y - 1.35 : t.y - haloR * 0.72})`}>
                    <circle r={0.38} fill="var(--mantine-color-red-7)" stroke="var(--mantine-color-white)" strokeWidth={0.06} />
                    <text y={0.17} textAnchor="middle" fontSize={0.52} fontWeight={800} fill="var(--mantine-color-white)">
                      !
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}

          <g pointerEvents="none" fill="var(--mantine-color-gray-7)" fontSize={0.36}>
            <path d={`M 0 ${depth + 0.45} H 2 M 0 ${depth + 0.35} V ${depth + 0.55} M 2 ${depth + 0.35} V ${depth + 0.55}`} stroke="var(--mantine-color-gray-7)" strokeWidth={0.05} fill="none" />
            <text x={2.2} y={depth + 0.58}>
              2 m
            </text>
            <text x={width} y={depth + 0.58} textAnchor="end">
              {width} m × {depth} m · {EVENT.venue}
            </text>
          </g>
        </svg>
      </ScrollArea>

      <Group gap="md" mt="xs" wrap="wrap" aria-label="Legend" role="group">
        {PARTIES.map((p) => {
          const s = partyStyle(p);
          return (
            <Group key={p} gap={6} wrap="nowrap">
              <Box w={14} h={14} style={{ borderRadius: "50%", background: s.bg, border: `1.5px solid ${s.edge}` }} aria-hidden />
              <Text size="xs" c="gray.8">
                {p}
              </Text>
            </Group>
          );
        })}
        <Group gap={6} wrap="nowrap">
          <Box w={10} h={10} style={{ borderRadius: "50%", background: "var(--mantine-color-orange-7)" }} aria-hidden />
          <Text size="xs" c="gray.8">
            Dietary need
          </Text>
        </Group>
        <Group gap={6} wrap="nowrap">
          <Box w={14} h={14} style={{ borderRadius: "50%", border: "2px solid var(--mantine-color-red-7)" }} aria-hidden />
          <Text size="xs" c="gray.8">
            Rule broken
          </Text>
        </Group>
      </Group>
    </Box>
  );
}
```

```tsx components/Shell.tsx
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Anchor, Avatar, Box, Button, Container, Group, Text, ThemeIcon, VisuallyHidden } from "@mantine/core";
import { IconArmchair, IconMap2, IconUsers } from "@tabler/icons-react";
import { APP, EVENT, PLANNER, formatEventDate, initials } from "@/lib/data";
import { DragProvider } from "@/lib/drag";
import { PlanProvider, usePlan } from "@/lib/plan";

const NAV = [
  { href: "/", label: "Plan", icon: IconMap2 },
  { href: "/guests", label: "Guests", icon: IconUsers },
];

function LiveStatus() {
  const { status } = usePlan();
  return (
    <VisuallyHidden role="status" aria-live="polite">
      {status}
    </VisuallyHidden>
  );
}

function Header() {
  const pathname = usePathname();
  return (
    <Box
      component="header"
      bg="white"
      style={{ borderBottom: "1px solid var(--mantine-color-gray-3)", position: "sticky", top: 0, zIndex: 20 }}
    >
      <Container fluid px="md" maw={1680}>
        <Group justify="space-between" wrap="wrap" gap="xs" py="xs" mih={60}>
          <Group gap="sm" wrap="nowrap">
            <Anchor component={Link} href="/" underline="never" c="inherit" aria-label={`${APP}, plan`}>
              <Group gap={8} wrap="nowrap">
                <ThemeIcon size={34} radius="md" variant="filled">
                  <IconArmchair size={20} aria-hidden />
                </ThemeIcon>
                <Text fw={700} size="lg" lh={1}>
                  {APP}
                </Text>
              </Group>
            </Anchor>
            <Box visibleFrom="md" pl="md" ml="xs" style={{ borderLeft: "1px solid var(--mantine-color-gray-3)" }}>
              <Text fw={600} size="sm" lh={1.25}>
                {EVENT.name}
              </Text>
              <Text size="xs" c="gray.7" lh={1.25}>
                {formatEventDate()} · {EVENT.venue}
              </Text>
            </Box>
          </Group>

          <Group gap="xs" wrap="nowrap">
            <Box component="nav" aria-label="Main">
              <Group gap={4} wrap="nowrap">
                {NAV.map((item) => {
                  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <Button
                      key={item.href}
                      component={Link}
                      href={item.href}
                      variant={active ? "light" : "subtle"}
                      color={active ? "brand" : "gray.7"}
                      size="sm"
                      leftSection={<item.icon size={18} aria-hidden />}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Group>
            </Box>
            <Group gap="xs" wrap="nowrap" visibleFrom="sm" pl="xs">
              <Avatar radius="xl" size={34} color="brand" aria-hidden>
                {initials(PLANNER.name)}
              </Avatar>
              <Text size="sm" fw={500}>
                {PLANNER.name}
              </Text>
            </Group>
          </Group>
        </Group>
        <Box hiddenFrom="md" pb="xs">
          <Text fw={600} size="sm" lh={1.25}>
            {EVENT.name}
          </Text>
          <Text size="xs" c="gray.7" lh={1.25}>
            {formatEventDate()} · {EVENT.venue}
          </Text>
        </Box>
      </Container>
    </Box>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <PlanProvider>
      <DragProvider>
        <Box mih="100dvh" bg="gray.0">
          <Header />
          <LiveStatus />
          <Box component="main" id="main">
            <Container fluid px="md" py="md" maw={1680}>
              {children}
            </Container>
          </Box>
        </Box>
      </DragProvider>
    </PlanProvider>
  );
}
```

```tsx components/TablePanel.tsx
"use client";

import { ActionIcon, Badge, Box, Button, Card, Group, Progress, Stack, Text, Title, Tooltip, UnstyledButton } from "@mantine/core";
import { IconAlertTriangle, IconUserMinus } from "@tabler/icons-react";
import { STANDARD_MEAL, TABLES, initials } from "@/lib/data";
import { usePlan, usePlanStats } from "@/lib/plan";
import { tableById } from "@/lib/rules";
import { partyStyle } from "@/lib/style";

function Overview() {
  const { selectTable } = usePlan();
  const { perTable } = usePlanStats();
  return (
    <Stack gap="xs">
      <Text size="sm" c="gray.7">
        Select a table on the plan to see who sits there and what they eat.
      </Text>
      <Box component="ul" m={0} p={0} style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
        {TABLES.map((t) => {
          const n = perTable[t.id] ?? 0;
          return (
            <li key={t.id}>
              <UnstyledButton
                onClick={() => selectTable(t.id)}
                w="100%"
                py={6}
                px="xs"
                style={{ borderRadius: 8, minHeight: 44 }}
              >
                <Group justify="space-between" mb={4} wrap="nowrap">
                  <Text size="sm" fw={600}>
                    {t.name}
                  </Text>
                  <Text size="sm" c="gray.7">
                    {n} / {t.seats}
                  </Text>
                </Group>
                <Progress value={(n / t.seats) * 100} size="sm" color={n === t.seats ? "green" : "brand"} aria-hidden />
              </UnstyledButton>
            </li>
          );
        })}
      </Box>
    </Stack>
  );
}

export function TablePanel() {
  const { selectedTable, selectTable, selectedGuest, occupants, unseat, place, selectGuest, rules } = usePlan();
  const table = selectedTable ? tableById.get(selectedTable) : undefined;

  if (!table) {
    return (
      <Card aria-label="Tables">
        <Title order={3} size="h4" mb="xs">
          Tables
        </Title>
        <Overview />
      </Card>
    );
  }

  const people = occupants(table.id);
  const taken = people.filter((p) => p !== null).length;
  const needs = new Map<string, number>();
  for (const p of people) {
    if (p?.diet) needs.set(p.diet, (needs.get(p.diet) ?? 0) + 1);
  }
  const tableRules = rules.filter((r) => r.tableIds.includes(table.id) && r.status !== "ok");

  return (
    <Card aria-label={`${table.name} details`}>
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb="xs">
        <Box>
          <Title order={3} size="h4">
            {table.name}
          </Title>
          <Text size="sm" c="gray.7">
            {taken} of {table.seats} seats taken · {table.seats - taken} free
          </Text>
        </Box>
        <Button variant="subtle" color="gray.7" size="compact-sm" onClick={() => selectTable(null)}>
          All tables
        </Button>
      </Group>
      <Progress value={(taken / table.seats) * 100} size="sm" mb="sm" aria-hidden />

      {tableRules.map((r) => (
        <Group key={r.index} gap={8} wrap="nowrap" align="flex-start" mb={6}>
          <Box c={r.status === "broken" ? "red.8" : "gray.7"} pt={2}>
            <IconAlertTriangle size={16} aria-hidden />
          </Box>
          <Text size="sm" c={r.status === "broken" ? "red.8" : "gray.8"}>
            <b>{r.status === "broken" ? "Broken: " : "Open: "}</b>
            {r.title}. {r.detail}
          </Text>
        </Group>
      ))}

      <Text size="xs" fw={700} c="gray.7" tt="uppercase" mt="xs" mb={4}>
        Guests and dietary needs
      </Text>
      <Box component="ol" m={0} p={0} style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
        {people.map((g, i) => {
          if (!g) {
            const canPlace = Boolean(selectedGuest);
            return (
              <li key={`empty-${i}`}>
                <Group justify="space-between" wrap="nowrap" mih={40} px={8} style={{ border: "1px dashed var(--mantine-color-gray-4)", borderRadius: 8 }}>
                  <Text size="sm" c="gray.7">
                    Seat {i + 1}: empty
                  </Text>
                  {canPlace ? (
                    <Button size="compact-sm" variant="light" onClick={() => selectedGuest && place(selectedGuest, table.id, i)}>
                      Seat here
                    </Button>
                  ) : null}
                </Group>
              </li>
            );
          }
          const p = partyStyle(g.party);
          return (
            <li key={g.id}>
              <Group justify="space-between" wrap="nowrap" mih={44} px={8} gap="xs" style={{ border: "1px solid var(--mantine-color-gray-3)", borderRadius: 8 }}>
                <UnstyledButton
                  onClick={() => selectGuest(selectedGuest === g.id ? null : g.id)}
                  aria-pressed={selectedGuest === g.id}
                  style={{ flex: 1, minWidth: 0, minHeight: 40 }}
                >
                  <Group gap={8} wrap="nowrap">
                    <Box
                      aria-hidden
                      w={26}
                      h={26}
                      style={{ flex: "none", borderRadius: "50%", background: p.bg, color: p.fg, border: `1.5px solid ${p.edge}`, display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700 }}
                    >
                      {initials(g.name)}
                    </Box>
                    <Box style={{ minWidth: 0 }}>
                      <Text size="sm" fw={600} lh={1.2} truncate>
                        {g.name}
                      </Text>
                      <Text size="xs" c="gray.7" lh={1.2}>
                        Seat {i + 1} · {g.party}
                      </Text>
                    </Box>
                  </Group>
                </UnstyledButton>
                {g.diet ? (
                  <Badge size="sm" variant="light" color="orange" c="gray.9">
                    {g.diet}
                  </Badge>
                ) : (
                  <Text size="xs" c="gray.7" style={{ flex: "none" }}>
                    {STANDARD_MEAL}
                  </Text>
                )}
                <Tooltip label={`Unseat ${g.name}`}>
                  <ActionIcon variant="subtle" color="gray.7" size="lg" onClick={() => unseat(g.id)} aria-label={`Unseat ${g.name}`}>
                    <IconUserMinus size={18} aria-hidden />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </li>
          );
        })}
      </Box>

      <Text size="xs" fw={700} c="gray.7" tt="uppercase" mt="sm" mb={4}>
        Dietary summary
      </Text>
      {needs.size === 0 ? (
        <Text size="sm" c="gray.7">
          No dietary needs at this table.
        </Text>
      ) : (
        <Group gap={6}>
          {[...needs.entries()].map(([diet, n]) => (
            <Badge key={diet} variant="light" color="orange" c="gray.9" size="md">
              {n} × {diet}
            </Badge>
          ))}
        </Group>
      )}
    </Card>
  );
}
```

```css components/room.module.css
.focusable {
  cursor: pointer;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.focusable:focus-visible {
  outline: 3px solid var(--mantine-color-blue-6);
  outline-offset: 2px;
}

.grab {
  cursor: grab;
  touch-action: pan-x pan-y;
  user-select: none;
  -webkit-user-select: none;
}

.seat:hover .seatCircle {
  stroke-width: 0.1;
  filter: brightness(0.97);
}

.seat:hover .seatCircle[data-empty='true'] {
  stroke: var(--mantine-color-brand-7);
}

.tableBody {
  transition: fill 120ms ease;
}

.tableGroup:hover .tableBody {
  fill: var(--mantine-color-gray-0);
}

.pulse {
  animation: seatPulse 1.6s ease-in-out infinite;
}

@keyframes seatPulse {
  0%,
  100% {
    stroke-opacity: 1;
  }
  50% {
    stroke-opacity: 0.35;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pulse {
    animation: none;
  }
}

.layout {
  display: grid;
  gap: var(--mantine-spacing-md);
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    'room'
    'tray'
    'table'
    'rules';
  align-items: start;
}

.side {
  display: contents;
}

.room {
  grid-area: room;
  min-width: 0;
}

.tablePanel {
  grid-area: table;
  min-width: 0;
}

.tray {
  grid-area: tray;
  min-width: 0;
}

.rules {
  grid-area: rules;
  min-width: 0;
}

@media (min-width: 75em) {
  .layout {
    grid-template-columns: minmax(0, 1fr) 24rem;
    grid-template-rows: auto 1fr;
    grid-template-areas:
      'room side'
      'tray side';
  }

  .side {
    grid-area: side;
    display: flex;
    flex-direction: column;
    gap: var(--mantine-spacing-md);
    min-width: 0;
  }
}

.statGrid {
  display: grid;
  gap: var(--mantine-spacing-sm);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (min-width: 48em) {
  .statGrid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.guestsLayout {
  display: grid;
  gap: var(--mantine-spacing-md);
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
}

@media (min-width: 64em) {
  .guestsLayout {
    grid-template-columns: minmax(0, 1fr) 21rem;
  }
}
```

```ts lib/data.ts
export type Rsvp = "yes" | "maybe" | "pending" | "no";

export type Fixture = {
  id: string;
  kind: "stage" | "dancefloor" | "bar" | "door";
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type TableDef = {
  id: string;
  name: string;
  shape: "long" | "round";
  seats: number;
  x: number;
  y: number;
  rotation?: number;
};

export type Guest = {
  id: string;
  name: string;
  party: string;
  rsvp: Rsvp;
  diet: string | null;
  table: string | null;
};

export type Rule = {
  kind: "together" | "apart" | "near";
  guests: string[];
  note: string;
};

export const APP = "Seatwise";

export const EVENT = {
  name: "Ines & Mateo's wedding dinner",
  date: "2027-06-19",
  venue: "The Orangery, Hollin Hall",
  room_m: { width: 24, depth: 14 },
};

export const PLANNER = { name: "Hannah Brook" };

export const FIXTURES: Fixture[] = [
  { id: "f-1", kind: "stage", label: "Band", x: 10, y: 0.5, w: 4, h: 2 },
  { id: "f-2", kind: "dancefloor", label: "Dance floor", x: 8.5, y: 3, w: 7, h: 4 },
  { id: "f-3", kind: "bar", label: "Bar", x: 21, y: 10, w: 2.5, h: 3.5 },
  { id: "f-4", kind: "door", label: "Garden doors", x: 0, y: 6, w: 0.5, h: 2.5 },
];

export const TABLES: TableDef[] = [
  { id: "t-head", name: "Top table", shape: "long", seats: 8, x: 8, y: 8.2, rotation: 0 },
  { id: "t-1", name: "Table 1", shape: "round", seats: 8, x: 3, y: 2.5 },
  { id: "t-2", name: "Table 2", shape: "round", seats: 8, x: 3, y: 7 },
  { id: "t-3", name: "Table 3", shape: "round", seats: 8, x: 3, y: 11.5 },
  { id: "t-4", name: "Table 4", shape: "round", seats: 8, x: 19, y: 2.5 },
  { id: "t-5", name: "Table 5", shape: "round", seats: 8, x: 19, y: 7 },
  { id: "t-6", name: "Table 6", shape: "round", seats: 6, x: 12, y: 12 },
];

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
];

// The brothers rule names Sean and Ryan Doyle in its note, but the supplied ids
// (g-29, g-30) point at Kai Brennan and Sean Doyle. The note is the couple's
// instruction, so the rule is pinned to Sean (g-30) and Ryan (g-31).
export const RULES: Rule[] = [
  { kind: "together", guests: ["g-21", "g-22"], note: "Couple" },
  { kind: "together", guests: ["g-32", "g-33"], note: "Siblings, under 10" },
  { kind: "apart", guests: ["g-30", "g-31"], note: "Brothers Sean and Ryan Doyle are not speaking" },
  { kind: "apart", guests: ["g-12", "g-34"], note: "Ask the couple: old family dispute" },
  {
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
  },
];

export const PARTY_COLORS: Record<string, string> = {
  Couple: "pink",
  "Bride's family": "grape",
  "Groom's family": "blue",
  "University friends": "teal",
  "Work friends": "orange",
  "Groom's football club": "lime",
  "Plus-ones": "gray",
};

export const PARTIES = Object.keys(PARTY_COLORS);

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "No reply",
  no: "Declined",
};

export const RSVP_COLOR: Record<Rsvp, string> = {
  yes: "green",
  maybe: "yellow",
  pending: "gray",
  no: "red",
};

export const STANDARD_MEAL = "No dietary needs";

export function formatEventDate(): string {
  return new Date(`${EVENT.date}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1] ?? "") : "";
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}
```

```tsx lib/drag.tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Avatar, Paper, Text } from "@mantine/core";
import { PARTY_COLORS, initials } from "./data";
import { usePlan } from "./plan";
import { guestById } from "./rules";

export type DropTarget = { kind: "seat"; table: string; seat: number } | { kind: "table"; table: string } | { kind: "tray" };

type Drag = {
  dragging: string | null;
  over: DropTarget | null;
  begin: (e: ReactPointerEvent, guestId: string) => void;
  /** True right after a drag ended, so the click that follows a drop can be ignored. */
  justDragged: () => boolean;
};

const DragContext = createContext<Drag | null>(null);

export function useDrag(): Drag {
  const ctx = useContext(DragContext);
  if (!ctx) throw new Error("useDrag must be used inside DragProvider");
  return ctx;
}

function findTarget(x: number, y: number): DropTarget | null {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;
  const seat = el.closest<HTMLElement>("[data-drop-seat]");
  if (seat?.dataset.dropTable !== undefined && seat.dataset.dropSeat !== undefined) {
    return { kind: "seat", table: seat.dataset.dropTable, seat: Number(seat.dataset.dropSeat) };
  }
  const table = el.closest<HTMLElement>("[data-drop-table]");
  if (table?.dataset.dropTable) return { kind: "table", table: table.dataset.dropTable };
  if (el.closest("[data-drop-tray]")) return { kind: "tray" };
  return null;
}

export function DragProvider({ children }: { children: ReactNode }) {
  const { place, unseat } = usePlan();
  const [ghost, setGhost] = useState<{ guestId: string; x: number; y: number } | null>(null);
  const [over, setOver] = useState<DropTarget | null>(null);
  const dragged = useRef(false);
  const placeRef = useRef(place);
  placeRef.current = place;
  const unseatRef = useRef(unseat);
  unseatRef.current = unseat;

  const begin = useCallback((e: ReactPointerEvent, guestId: string) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const pointerId = e.pointerId;
    const touch = e.pointerType === "touch";
    const startX = e.clientX;
    const startY = e.clientY;
    let active = false;
    let timer: number | undefined;

    const activate = (x: number, y: number) => {
      active = true;
      setGhost({ guestId, x, y });
      setOver(findTarget(x, y));
    };

    const blockScroll = (ev: TouchEvent) => {
      if (active) ev.preventDefault();
    };

    const cleanup = () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("touchmove", blockScroll);
      setGhost(null);
      setOver(null);
    };

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      const moved = Math.hypot(ev.clientX - startX, ev.clientY - startY);
      if (!active) {
        if (touch) {
          if (moved > 10) cleanup();
          return;
        }
        if (moved < 5) return;
        activate(ev.clientX, ev.clientY);
        return;
      }
      setGhost({ guestId, x: ev.clientX, y: ev.clientY });
      setOver(findTarget(ev.clientX, ev.clientY));
    };

    const onUp = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      if (active) {
        const target = findTarget(ev.clientX, ev.clientY);
        dragged.current = true;
        window.setTimeout(() => {
          dragged.current = false;
        }, 60);
        if (target?.kind === "seat") placeRef.current(guestId, target.table, target.seat);
        else if (target?.kind === "table") placeRef.current(guestId, target.table);
        else if (target?.kind === "tray") unseatRef.current(guestId);
      }
      cleanup();
    };

    const onCancel = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      cleanup();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("touchmove", blockScroll, { passive: false });
    if (touch) timer = window.setTimeout(() => activate(startX, startY), 220);
  }, []);

  const justDragged = useCallback(() => dragged.current, []);

  const value = useMemo<Drag>(
    () => ({ dragging: ghost?.guestId ?? null, over, begin, justDragged }),
    [ghost?.guestId, over, begin, justDragged],
  );

  const guest = ghost ? guestById.get(ghost.guestId) : undefined;

  return (
    <DragContext.Provider value={value}>
      {children}
      {ghost && guest ? (
        <Paper
          shadow="lg"
          radius="xl"
          withBorder
          px="sm"
          py={4}
          aria-hidden
          style={{
            position: "fixed",
            left: ghost.x + 12,
            top: ghost.y + 12,
            zIndex: 1000,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Avatar size="sm" radius="xl" color={PARTY_COLORS[guest.party] ?? "gray"}>
            {initials(guest.name)}
          </Avatar>
          <Text size="sm" fw={600}>
            {guest.name}
          </Text>
        </Paper>
      ) : null}
    </DragContext.Provider>
  );
}
```

```tsx lib/plan.tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { notifications } from "@mantine/notifications";
import { GUESTS, TABLES, type Guest } from "./data";
import { evaluateRules, guestById, initialSeats, tableById, type RuleResult, type SeatMap } from "./rules";

type Plan = {
  seats: SeatMap;
  rules: RuleResult[];
  selectedGuest: string | null;
  selectedTable: string | null;
  status: string;
  canUndo: boolean;
  selectGuest: (id: string | null) => void;
  selectTable: (id: string | null) => void;
  place: (guestId: string, tableId: string, seat?: number) => boolean;
  unseat: (guestId: string) => void;
  undo: () => void;
  reset: () => void;
  occupants: (tableId: string) => (Guest | null)[];
  tableOf: (guestId: string) => string | null;
};

const PlanContext = createContext<Plan | null>(null);

export function usePlan(): Plan {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [seats, setSeats] = useState<SeatMap>(initialSeats);
  const seatsRef = useRef(seats);
  const history = useRef<{ seats: SeatMap; status: string }[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const commit = useCallback((next: SeatMap, message: string) => {
    history.current = [...history.current.slice(-30), { seats: seatsRef.current, status }];
    seatsRef.current = next;
    setSeats(next);
    setStatus(message);
    setCanUndo(true);
  }, [status]);

  const place = useCallback(
    (guestId: string, tableId: string, seat?: number): boolean => {
      const guest = guestById.get(guestId);
      const table = tableById.get(tableId);
      if (!guest || !table) return false;
      if (guest.rsvp === "no") {
        notifications.show({ color: "red", title: "Declined", message: `${guest.name} has declined, so they are not seated.` });
        return false;
      }
      const current = seatsRef.current;
      const at = new Map<number, string>();
      for (const [gid, s] of Object.entries(current)) if (s.table === tableId) at.set(s.seat, gid);

      let target = seat;
      if (target === undefined) {
        const here = current[guestId];
        if (here && here.table === tableId) {
          setSelectedGuest(null);
          setSelectedTable(tableId);
          return true;
        }
        for (let i = 0; i < table.seats; i += 1) {
          if (!at.has(i)) {
            target = i;
            break;
          }
        }
        if (target === undefined) {
          notifications.show({
            color: "red",
            title: `${table.name} is full`,
            message: `All ${table.seats} seats are taken. Pick another table or tap a seat to swap.`,
          });
          return false;
        }
      }

      const next: SeatMap = { ...current };
      const occupant = at.get(target);
      const from = current[guestId];
      if (occupant === guestId) {
        setSelectedGuest(null);
        return true;
      }
      let message = `${guest.name} seated at ${table.name}, seat ${target + 1}.`;
      if (occupant) {
        const other = guestById.get(occupant)?.name ?? "Another guest";
        if (from) {
          next[occupant] = { table: from.table, seat: from.seat };
          message = `${guest.name} and ${other} swapped seats.`;
        } else {
          delete next[occupant];
          message = `${guest.name} seated at ${table.name}, seat ${target + 1}; ${other} is unseated.`;
        }
      } else if (from) {
        message = from.table === tableId ? `${guest.name} moved to seat ${target + 1} at ${table.name}.` : `${guest.name} moved from ${tableById.get(from.table)?.name ?? "a table"} to ${table.name}.`;
      }
      next[guestId] = { table: tableId, seat: target };
      commit(next, message);
      setSelectedGuest(null);
      setSelectedTable(tableId);
      return true;
    },
    [commit],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const current = seatsRef.current;
      const guest = guestById.get(guestId);
      if (!guest || !current[guestId]) {
        setSelectedGuest(null);
        return;
      }
      const next = { ...current };
      const was = tableById.get(current[guestId].table)?.name ?? "their table";
      delete next[guestId];
      commit(next, `${guest.name} unseated from ${was}.`);
      setSelectedGuest(null);
    },
    [commit],
  );

  const undo = useCallback(() => {
    const prev = history.current.pop();
    if (!prev) return;
    seatsRef.current = prev.seats;
    setSeats(prev.seats);
    setStatus(prev.status ? `Undone. ${prev.status}` : "Last change undone.");
    setCanUndo(history.current.length > 0);
    setSelectedGuest(null);
  }, []);

  const reset = useCallback(() => {
    const first = initialSeats();
    history.current = [];
    seatsRef.current = first;
    setSeats(first);
    setStatus("Plan reset to the starting arrangement.");
    setCanUndo(false);
    setSelectedGuest(null);
  }, []);

  const rules = useMemo(() => evaluateRules(seats), [seats]);

  const occupants = useCallback(
    (tableId: string): (Guest | null)[] => {
      const t = tableById.get(tableId);
      const out: (Guest | null)[] = Array.from({ length: t?.seats ?? 0 }, () => null);
      for (const [gid, s] of Object.entries(seats)) {
        if (s.table === tableId) {
          const g = guestById.get(gid);
          if (g && s.seat < out.length) out[s.seat] = g;
        }
      }
      return out;
    },
    [seats],
  );

  const tableOf = useCallback((guestId: string) => seats[guestId]?.table ?? null, [seats]);

  const value = useMemo<Plan>(
    () => ({
      seats,
      rules,
      selectedGuest,
      selectedTable,
      status,
      canUndo,
      selectGuest: setSelectedGuest,
      selectTable: setSelectedTable,
      place,
      unseat,
      undo,
      reset,
      occupants,
      tableOf,
    }),
    [seats, rules, selectedGuest, selectedTable, status, canUndo, place, unseat, undo, reset, occupants, tableOf],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlanStats() {
  const { seats } = usePlan();
  return useMemo(() => {
    const attending = GUESTS.filter((g) => g.rsvp === "yes");
    const unseated = attending.filter((g) => !seats[g.id]);
    const seatedCount = Object.keys(seats).length;
    const capacity = TABLES.reduce((n, t) => n + t.seats, 0);
    const perTable: Record<string, number> = {};
    for (const s of Object.values(seats)) perTable[s.table] = (perTable[s.table] ?? 0) + 1;
    const unconfirmed = GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !seats[g.id]);
    return { attending, unseated, unconfirmed, seatedCount, capacity, perTable };
  }, [seats]);
}
```

```ts lib/rules.ts
import { FIXTURES, GUESTS, RULES, TABLES, type Rule, type TableDef } from "./data";

export type SeatMap = Record<string, { table: string; seat: number }>;

export type RuleStatus = "broken" | "ok" | "open";

export type RuleResult = {
  index: number;
  rule: Rule;
  title: string;
  status: RuleStatus;
  detail: string;
  tableIds: string[];
  guestIds: string[];
};

export const NEAR_DOOR_M = 4.5;
export const AWAY_FROM_BAND_M = 6;

export const guestById = new Map(GUESTS.map((g) => [g.id, g]));
export const tableById = new Map(TABLES.map((t) => [t.id, t]));

export function firstName(name: string): string {
  const parts = name.split(" ");
  return parts[0] === "Avó" ? "Avó Rosa" : (parts[0] ?? name);
}

/** Length of a long table along its axis: one metre per seat, all seats on one side. */
export function longLength(t: TableDef): number {
  return t.seats;
}

export function tableCentre(t: TableDef): { x: number; y: number } {
  if (t.shape === "long") return { x: t.x + longLength(t) / 2, y: t.y + 0.5 };
  return { x: t.x, y: t.y };
}

function fixtureCentre(kind: string): { x: number; y: number } {
  const f = FIXTURES.find((fx) => fx.kind === kind);
  if (!f) return { x: 0, y: 0 };
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function distanceToDoors(tableId: string): number {
  const t = tableById.get(tableId);
  return t ? dist(tableCentre(t), fixtureCentre("door")) : Infinity;
}

export function distanceToBand(tableId: string): number {
  const t = tableById.get(tableId);
  return t ? dist(tableCentre(t), fixtureCentre("stage")) : Infinity;
}

const nameOf = (id: string) => guestById.get(id)?.name ?? id;
const tableName = (id: string) => tableById.get(id)?.name ?? id;
const m = (n: number) => `${n.toFixed(1)} m`;

export function evaluateRules(seats: SeatMap): RuleResult[] {
  return RULES.map((rule, index): RuleResult => {
    const where = rule.guests.map((id) => seats[id]?.table ?? null);
    const names = rule.guests.map(nameOf);
    const base = { index, rule, guestIds: rule.guests };

    if (rule.kind === "together") {
      const title = `Keep together: ${names.join(" and ")}`;
      const seated = where.filter((w): w is string => w !== null);
      if (seated.length === 0) {
        return { ...base, title, status: "open", detail: "Nobody is seated yet.", tableIds: [] };
      }
      if (seated.length < where.length) {
        const missing = rule.guests.filter((id) => !seats[id]).map(nameOf);
        return {
          ...base,
          title,
          status: "open",
          detail: `${missing.join(", ")} still needs a seat at ${tableName(seated[0] ?? "")}.`,
          tableIds: [...new Set(seated)],
        };
      }
      if (new Set(seated).size === 1) {
        return { ...base, title, status: "ok", detail: `Together at ${tableName(seated[0] ?? "")}.`, tableIds: [seated[0] ?? ""] };
      }
      return {
        ...base,
        title,
        status: "broken",
        detail: rule.guests.map((id, i) => `${nameOf(id)} is at ${tableName(where[i] ?? "")}`).join("; ") + ".",
        tableIds: [...new Set(seated)],
      };
    }

    if (rule.kind === "apart") {
      const title = `Keep apart: ${names.join(" and ")}`;
      const seated = where.filter((w): w is string => w !== null);
      const same = seated.length === where.length && new Set(seated).size === 1;
      if (same) {
        return { ...base, title, status: "broken", detail: `Both are at ${tableName(seated[0] ?? "")}.`, tableIds: [seated[0] ?? ""] };
      }
      if (seated.length < where.length) {
        return {
          ...base,
          title,
          status: "open",
          detail: seated.length === 0 ? "Neither is seated yet." : "Not at the same table so far; the other is not seated yet.",
          tableIds: [...new Set(seated)],
        };
      }
      return { ...base, title, status: "ok", detail: `At ${seated.map(tableName).join(" and ")}.`, tableIds: [...new Set(seated)] };
    }

    const title = `Seat near the garden doors: ${names[0] ?? ""}`;
    const tableId = where[0];
    if (!tableId) {
      return { ...base, title, status: "open", detail: "Not seated yet.", tableIds: [] };
    }
    const toDoor = distanceToDoors(tableId);
    const toBand = distanceToBand(tableId);
    if (toDoor > NEAR_DOOR_M) {
      return {
        ...base,
        title,
        status: "broken",
        detail: `${tableName(tableId)} is ${m(toDoor)} from the garden doors; aim for ${m(NEAR_DOOR_M)} or less.`,
        tableIds: [tableId],
      };
    }
    if (toBand < AWAY_FROM_BAND_M) {
      return {
        ...base,
        title,
        status: "broken",
        detail: `${tableName(tableId)} is only ${m(toBand)} from the band.`,
        tableIds: [tableId],
      };
    }
    return {
      ...base,
      title,
      status: "ok",
      detail: `${tableName(tableId)} is ${m(toDoor)} from the doors and ${m(toBand)} from the band.`,
      tableIds: [tableId],
    };
  });
}

export function initialSeats(): SeatMap {
  const next: SeatMap = {};
  const used: Record<string, number> = {};
  for (const g of GUESTS) {
    if (!g.table) continue;
    const n = used[g.table] ?? 0;
    used[g.table] = n + 1;
    next[g.id] = { table: g.table, seat: n };
  }
  return next;
}
```

```ts lib/style.ts
import { PARTY_COLORS } from "./data";

export type PartyStyle = { bg: string; fg: string; edge: string };

/** Light fill, dark text and a mid edge from one Mantine colour, so contrast holds for every party. */
export function partyStyle(party: string): PartyStyle {
  const c = PARTY_COLORS[party] ?? "gray";
  return {
    bg: `var(--mantine-color-${c}-1)`,
    fg: `color-mix(in srgb, var(--mantine-color-${c}-9) 55%, black)`,
    edge: `var(--mantine-color-${c}-5)`,
  };
}
```

