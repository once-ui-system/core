```tsx app/guests/page.tsx
import { Column, Heading, Text } from "@once-ui-system/core";
import { GuestsView } from "@/components/GuestsView";
import { event } from "@/lib/data";

export default function Page() {
  return (
    <Column fillWidth horizontal="center" paddingX="16" paddingY="24">
      <Column fillWidth maxWidth="xl" gap="16">
        <Column gap="4">
          <Heading as="h1" textVariant="display-strong-xs">
            Guest list
          </Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            {event.name}. Search, filter and hand the meal counts to the caterer.
          </Text>
        </Column>
        <GuestsView />
      </Column>
    </Column>
  );
}
```

```tsx app/layout.tsx
import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "./fonts.css";

import type { Metadata } from "next";
import { Column, Flex } from "@once-ui-system/core";
import { AppShell } from "@/components/AppShell";
import { PlanProvider } from "@/lib/plan";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Seatwise",
  description: "Seating planner for Ines & Mateo's wedding dinner at The Orangery, Hollin Hall.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="html" lang="en" suppressHydrationWarning>
      <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
        <Providers>
          <PlanProvider>
            <AppShell>{children}</AppShell>
          </PlanProvider>
        </Providers>
      </Column>
    </Flex>
  );
}
```

```tsx app/page.tsx
import { Column, Heading, Row, Text } from "@once-ui-system/core";
import { PlanBoard } from "@/components/PlanBoard";
import { event } from "@/lib/data";

export default function Page() {
  return (
    <Column fillWidth horizontal="center" paddingX="16" paddingY="24">
      <Column fillWidth maxWidth="xl" gap="16">
        <Row horizontal="between" vertical="end" wrap gap="8">
          <Column gap="4">
            <Heading as="h1" textVariant="display-strong-xs">
              Seating plan
            </Heading>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {event.name}, {event.venue}
            </Text>
          </Column>
        </Row>
        <PlanBoard />
      </Column>
    </Column>
  );
}
```

```tsx components/AppShell.tsx
"use client";

import { Avatar, Button, Column, Row, Text, VisuallyHidden } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { event, formatDate, planner } from "@/lib/data";
import { usePlan } from "@/lib/plan";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { seatedCount, unseatedAttending } = usePlan();
  const onGuests = pathname.startsWith("/guests");

  return (
    <Column fillWidth flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row
        as="header"
        fillWidth
        paddingX="16"
        paddingY="12"
        gap="16"
        vertical="center"
        borderBottom
        background="surface"
        wrap
      >
        <Row gap="12" vertical="center">
          <Row
            width="32"
            height="32"
            radius="m"
            solid="brand-strong"
            onSolid="brand-strong"
            center
            aria-hidden="true"
          >
            <Text textVariant="label-strong-m">S</Text>
          </Row>
          <Column gap="2">
            <Text textVariant="label-strong-m">Seatwise</Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak" s={{ hide: true }}>
              Seating planner
            </Text>
          </Column>
        </Row>

        <Column flex={1} s={{ hide: true }}>
          <Text textVariant="label-strong-s">{event.name}</Text>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            {formatDate(event.date)} · {event.venue}
          </Text>
        </Column>

        <Row gap="4" as="nav" aria-label="Main" s={{ flex: 1 }}>
          <Button
            href="/"
            variant={onGuests ? "tertiary" : "secondary"}
            size="s"
            prefixIcon="grid"
            aria-current={onGuests ? undefined : "page"}
          >
            Plan
          </Button>
          <Button
            href="/guests"
            variant={onGuests ? "secondary" : "tertiary"}
            size="s"
            prefixIcon="people"
            aria-current={onGuests ? "page" : undefined}
          >
            Guests
          </Button>
        </Row>

        <Row gap="12" vertical="center" s={{ hide: true }}>
          <Column horizontal="end" gap="2">
            <Text textVariant="label-default-s">
              {seatedCount} seated · {unseatedAttending.length} to place
            </Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {planner.name}
            </Text>
          </Column>
          <Avatar value="HB" size="s" />
        </Row>
      </Row>
      <Column as="main" id="main" fillWidth flex={1} tabIndex={-1}>
        {children}
      </Column>
    </Column>
  );
}
```

```tsx components/GuestsView.tsx
"use client";

import { Button, Column, Grid, Heading, Input, Row, Select, Table, Tag, Text } from "@once-ui-system/core";
import { useMemo, useState } from "react";
import { STANDARD_MEAL, type Guest, type Rsvp, guests, rsvpLabel, tables } from "@/lib/data";
import { usePlan } from "@/lib/plan";

const tableName = new Map(tables.map((t) => [t.id, t.name]));
const parties = Array.from(new Set(guests.map((g) => g.party)));
const diets = Array.from(new Set(guests.map((g) => g.diet).filter((d): d is string => Boolean(d)))).sort();

const partyOptions = [{ value: "all", label: "All parties" }, ...parties.map((p) => ({ value: p, label: p }))];
const rsvpOptions = [
  { value: "all", label: "Any RSVP" },
  ...(["yes", "maybe", "pending", "no"] as Rsvp[]).map((r) => ({ value: r, label: rsvpLabel[r] })),
];
const dietOptions = [
  { value: "all", label: "Any diet" },
  { value: "none", label: "No dietary needs" },
  ...diets.map((d) => ({ value: d, label: d })),
];

const rsvpTone: Record<Rsvp, "success" | "warning" | "neutral" | "danger"> = {
  yes: "success",
  maybe: "warning",
  pending: "neutral",
  no: "danger",
};

type Row_ = Guest & { tableId: string | null };

export function GuestsView() {
  const { assign } = usePlan();
  const [query, setQuery] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState("all");
  const [diet, setDiet] = useState("all");

  const rows = useMemo<Row_[]>(
    () =>
      guests
        .map((g) => ({ ...g, tableId: assign[g.id]?.table ?? null }))
        .filter((g) => {
          if (query && !g.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
          if (party !== "all" && g.party !== party) return false;
          if (rsvp !== "all" && g.rsvp !== rsvp) return false;
          if (diet === "none" && g.diet) return false;
          if (diet !== "all" && diet !== "none" && g.diet !== diet) return false;
          return true;
        }),
    [assign, query, party, rsvp, diet],
  );

  const meals = useMemo(() => {
    const m = new Map<string, { total: number; seated: number }>();
    for (const g of guests) {
      if (g.rsvp !== "yes") continue;
      const key = g.diet ?? STANDARD_MEAL;
      const cur = m.get(key) ?? { total: 0, seated: 0 };
      cur.total += 1;
      if (assign[g.id]) cur.seated += 1;
      m.set(key, cur);
    }
    const list = Array.from(m.entries()).sort((a, b) => {
      if (a[0] === STANDARD_MEAL) return -1;
      if (b[0] === STANDARD_MEAL) return 1;
      return b[1].total - a[1].total || a[0].localeCompare(b[0]);
    });
    return list;
  }, [assign]);

  const attending = guests.filter((g) => g.rsvp === "yes").length;
  const undecided = guests.filter((g) => g.rsvp === "maybe" || g.rsvp === "pending").length;
  const filtered = query !== "" || party !== "all" || rsvp !== "all" || diet !== "all";

  const reset = () => {
    setQuery("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
  };

  return (
    <Row fillWidth gap="16" vertical="start" m={{ direction: "column" }}>
      <Column flex={1} fillWidth gap="12" minWidth="0">
        <Column background="surface" border radius="l" padding="16" gap="12">
          <Grid columns="4" gap="12" l={{ columns: 2 }} s={{ columns: 1 }} fillWidth>
            <Input
              id="guest-search"
              label="Search guests"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Select
              id="guest-party"
              label="Party"
              options={partyOptions}
              value={party}
              onValueChange={(v) => setParty(String(v))}
            />
            <Select
              id="guest-rsvp"
              label="RSVP"
              options={rsvpOptions}
              value={rsvp}
              onValueChange={(v) => setRsvp(String(v))}
            />
            <Select
              id="guest-diet"
              label="Diet"
              options={dietOptions}
              value={diet}
              onValueChange={(v) => setDiet(String(v))}
            />
          </Grid>
          <Row horizontal="between" vertical="center" gap="8" wrap>
            <Text role="status" aria-live="polite" textVariant="body-default-s" onBackground="neutral-medium">
              Showing {rows.length} of {guests.length} guests
            </Text>
            {filtered ? (
              <Button size="s" variant="tertiary" prefixIcon="close" onClick={reset}>
                Clear filters
              </Button>
            ) : null}
          </Row>
        </Column>

        <Column background="surface" border radius="l" overflow="hidden">
          <Table<Row_>
            aria-label="Guest list"
            rows={rows}
            getRowId={(r) => r.id}
            stickyHeader
            hoverable
            columns={[
              {
                key: "name",
                header: "Guest",
                sortable: true,
                sort: (a, b) => a.name.localeCompare(b.name),
                cell: (r) => <Text textVariant="label-strong-s">{r.name}</Text>,
              },
              {
                key: "party",
                header: "Party",
                sortable: true,
                sort: (a, b) => a.party.localeCompare(b.party),
                hide: { s: true },
                cell: (r) => <Text textVariant="body-default-s">{r.party}</Text>,
              },
              {
                key: "rsvp",
                header: "RSVP",
                sortable: true,
                sort: (a, b) => a.rsvp.localeCompare(b.rsvp),
                cell: (r) => <Tag size="s" tone={rsvpTone[r.rsvp]} label={rsvpLabel[r.rsvp]} />,
              },
              {
                key: "diet",
                header: "Diet",
                hide: { xs: true },
                cell: (r) =>
                  r.diet ? (
                    <Tag size="s" tone="warning" label={r.diet} />
                  ) : (
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      None
                    </Text>
                  ),
              },
              {
                key: "table",
                header: "Table",
                sortable: true,
                sort: (a, b) => (tableName.get(a.tableId ?? "") ?? "~").localeCompare(tableName.get(b.tableId ?? "") ?? "~"),
                cell: (r) =>
                  r.tableId ? (
                    <Text textVariant="body-default-s">{tableName.get(r.tableId)}</Text>
                  ) : r.rsvp === "no" ? (
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      Not coming
                    </Text>
                  ) : (
                    <Tag size="s" tone="brand" label="Unseated" />
                  ),
              },
            ]}
          />
        </Column>
      </Column>

      <Column width="24rem" gap="16" m={{ fillWidth: true, width: "auto" }}>
        <Column background="surface" border radius="l" padding="16" gap="12" as="section" aria-labelledby="meals-title">
          <Column gap="4">
            <Heading as="h2" id="meals-title" textVariant="heading-strong-m">
              Meals for the caterer
            </Heading>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              Guests who have said yes: {attending}
            </Text>
          </Column>
          <Column as="ul" margin="0" padding="0" gap="0">
            {meals.map(([meal, n]) => (
              <Row
                as="li"
                key={meal}
                horizontal="between"
                vertical="center"
                gap="12"
                paddingY="8"
                borderBottom
              >
                <Column gap="2">
                  <Text textVariant="label-strong-s">{meal}</Text>
                  <Text textVariant="body-default-xs" onBackground="neutral-weak">
                    {n.seated} seated
                  </Text>
                </Column>
                <Text textVariant="display-strong-xs">{n.total}</Text>
              </Row>
            ))}
            <Row horizontal="between" vertical="center" paddingTop="12">
              <Text textVariant="label-strong-s">Total meals</Text>
              <Text textVariant="display-strong-xs">{attending}</Text>
            </Row>
          </Column>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            {undecided} more guests are maybe or still to reply and are not counted yet.
          </Text>
        </Column>
      </Column>
    </Row>
  );
}
```

```tsx components/PlanBoard.tsx
"use client";

import { Column, Row } from "@once-ui-system/core";
import { RoomPlan } from "./RoomPlan";
import { RulesSummary, Stats, StatusLine, TablePanel, UnseatedList } from "./PlanPanels";

export function PlanBoard() {
  return (
    <Column fillWidth gap="12">
      <Stats />
      <StatusLine />
      <Row fillWidth gap="16" vertical="start" m={{ direction: "column" }}>
        <Column flex={1} fillWidth gap="16" minWidth="0">
          <RoomPlan />
        </Column>
        <Column width="28rem" gap="16" m={{ fillWidth: true, width: "auto" }}>
          <TablePanel />
          <UnseatedList />
          <RulesSummary />
        </Column>
      </Row>
    </Column>
  );
}
```

```tsx components/PlanPanels.tsx
"use client";

import { Button, Column, Heading, Icon, IconButton, Row, Tag, Text, VisuallyHidden } from "@once-ui-system/core";
import { useState } from "react";
import { GUEST_DRAG_TYPE } from "@/components/RoomPlan";
import { guests, initials, tables } from "@/lib/data";
import { usePlan } from "@/lib/plan";

const guestById = new Map(guests.map((g) => [g.id, g]));
const tableById = new Map(tables.map((t) => [t.id, t]));

function Avatarish({ name, active }: { name: string; active?: boolean }) {
  return (
    <Row
      width="32"
      height="32"
      radius="full"
      center
      background={active ? "brand-alpha-strong" : "neutral-alpha-medium"}
      border={active ? "brand-strong" : "transparent"}
      borderWidth={2}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <Text textVariant="label-strong-xs">{initials(name)}</Text>
    </Row>
  );
}

export function Stats() {
  const { seatedCount, unseatedAttending, rules } = usePlan();
  const broken = rules.filter((r) => r.status === "broken").length;
  const attending = guests.filter((g) => g.rsvp === "yes").length;
  const seatsTotal = tables.reduce((n, t) => n + t.seats, 0);
  const items: { label: string; value: string; tone?: "danger" | "success" }[] = [
    { label: "Seated", value: String(seatedCount) },
    { label: "Attending, unseated", value: String(unseatedAttending.length), tone: unseatedAttending.length ? undefined : "success" },
    { label: "Seats free", value: String(seatsTotal - seatedCount) },
    { label: "Rules broken", value: String(broken), tone: broken ? "danger" : "success" },
  ];
  return (
    <Row gap="12" wrap fillWidth>
      {items.map((s) => (
        <Column
          key={s.label}
          background="surface"
          border={s.tone === "danger" ? "danger-medium" : true}
          radius="l"
          paddingX="16"
          paddingY="12"
          gap="4"
          flex={1}
          minWidth="9rem"
        >
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            {s.label}
          </Text>
          <Text
            textVariant="display-strong-xs"
            onBackground={s.tone === "danger" ? "danger-strong" : s.tone === "success" ? "success-strong" : "neutral-strong"}
          >
            {s.value}
            <Text as="span" textVariant="body-default-s" onBackground="neutral-weak">
              {s.label === "Seated" ? ` of ${guests.filter((g) => g.rsvp !== "no").length}` : s.label === "Attending, unseated" ? ` of ${attending}` : ""}
            </Text>
          </Text>
        </Column>
      ))}
    </Row>
  );
}

export function StatusLine() {
  const { message, held, hold } = usePlan();
  return (
    <Row gap="12" vertical="center" minHeight="40" paddingX="4">
      <Text role="status" aria-live="polite" textVariant="body-default-s" onBackground="neutral-medium">
        {message || "Pick a guest from the list, or drag them onto a seat."}
      </Text>
      {held ? (
        <Button size="s" variant="tertiary" onClick={() => hold(null)}>
          Cancel
        </Button>
      ) : null}
    </Row>
  );
}

function GuestRow({ id }: { id: string }) {
  const { held, hold } = usePlan();
  const g = guestById.get(id);
  if (!g) return null;
  const active = held === id;
  return (
    <Row
      as="button"
      type="button"
      draggable
      fillWidth
      gap="12"
      padding="8"
      radius="m"
      vertical="center"
      horizontal="start"
      background={active ? "brand-alpha-weak" : "transparent"}
      border={active ? "brand-strong" : "transparent"}
      cursor="interactive"
      aria-pressed={active}
      onClick={() => hold(active ? null : id)}
      onDragStart={(e: React.DragEvent) => {
        e.dataTransfer.setData(GUEST_DRAG_TYPE, id);
        e.dataTransfer.effectAllowed = "move";
      }}
      style={{ textAlign: "left" }}
    >
      <Avatarish name={g.name} active={active} />
      <Column flex={1} gap="2">
        <Text textVariant="label-strong-s">{g.name}</Text>
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          {g.party}
        </Text>
      </Column>
      {g.diet ? (
        <Tag tone="warning" size="s" label={g.diet} />
      ) : null}
    </Row>
  );
}

export function UnseatedList() {
  const { unseatedAttending, unseatedMaybe, unseat } = usePlan();
  const [over, setOver] = useState(false);
  return (
    <Column
      background="surface"
      border={over ? "brand-strong" : true}
      borderWidth={over ? 2 : 1}
      radius="l"
      padding="16"
      gap="12"
      onDragOver={(e: React.DragEvent) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e: React.DragEvent) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData(GUEST_DRAG_TYPE);
        if (guestById.has(id)) unseat(id);
      }}
    >
      <Row horizontal="between" vertical="center" gap="8">
        <Heading as="h2" textVariant="heading-strong-m">
          To seat
        </Heading>
        <Tag size="s" tone={unseatedAttending.length ? "brand" : "success"} label={`${unseatedAttending.length} attending`} />
      </Row>
      {unseatedAttending.length === 0 ? (
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Everyone attending has a seat. Drop a guest here to unseat them.
        </Text>
      ) : (
        <Column gap="2" maxHeight="20rem" overflowY="auto" aria-label="Attending guests without a seat" role="list">
          {unseatedAttending.map((id) => (
            <div role="listitem" key={id}>
              <GuestRow id={id} />
            </div>
          ))}
        </Column>
      )}
      {unseatedMaybe.length ? (
        <Column gap="4">
          <Text textVariant="label-default-xs" onBackground="neutral-weak">
            WAITING ON A REPLY
          </Text>
          <Column gap="2" role="list">
            {unseatedMaybe.map((id) => (
              <div role="listitem" key={id}>
                <GuestRow id={id} />
              </div>
            ))}
          </Column>
        </Column>
      ) : null}
    </Column>
  );
}

export function RulesSummary() {
  const { rules, selectTable } = usePlan();
  const broken = rules.filter((r) => r.status === "broken").length;
  return (
    <Column background="surface" border radius="l" padding="16" gap="12">
      <Row horizontal="between" vertical="center" gap="8">
        <Heading as="h2" textVariant="heading-strong-m">
          The couple&apos;s rules
        </Heading>
        <Tag
          size="s"
          tone={broken ? "danger" : "success"}
          label={broken ? `${broken} broken` : "All kept"}
        />
      </Row>
      <Column as="ul" gap="8" margin="0" padding="0">
        {rules.map((r) => (
          <Row
            as="li"
            key={r.id}
            gap="12"
            padding="12"
            radius="m"
            vertical="start"
            background={r.status === "broken" ? "danger-alpha-weak" : "neutral-alpha-weak"}
            border={r.status === "broken" ? "danger-medium" : "transparent"}
          >
            <Icon
              name={r.status === "broken" ? "warning" : r.status === "ok" ? "check" : "time"}
              size="s"
              onBackground={r.status === "broken" ? "danger-strong" : r.status === "ok" ? "success-strong" : "neutral-weak"}
            />
            <Column flex={1} gap="4">
              <Text textVariant="label-strong-s">
                <VisuallyHidden>{r.status === "broken" ? "Broken: " : r.status === "ok" ? "Kept: " : "Waiting: "}</VisuallyHidden>
                {r.title}
              </Text>
              <Text textVariant="body-default-xs" onBackground="neutral-medium">
                {r.detail}
              </Text>
              <Text textVariant="body-default-xs" onBackground="neutral-weak">
                {r.note}
              </Text>
              {r.status === "broken" && r.tableIds.length ? (
                <Row gap="8" wrap>
                  {r.tableIds.map((t) => (
                    <Button key={t} size="s" variant="secondary" onClick={() => selectTable(t)}>
                      Show {tableById.get(t)?.name}
                    </Button>
                  ))}
                </Row>
              ) : null}
            </Column>
          </Row>
        ))}
      </Column>
    </Column>
  );
}

export function TablePanel() {
  const { selectedTable, occupants, countAt, brokenTables, rules, unseat, held, place, hold } = usePlan();
  const def = selectedTable ? tableById.get(selectedTable) : undefined;
  if (!def) {
    return (
      <Column background="surface" border radius="l" padding="16" gap="8">
        <Heading as="h2" textVariant="heading-strong-m">
          Table details
        </Heading>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Select a table on the plan to see who is seated and what they can eat.
        </Text>
      </Column>
    );
  }
  const slots = occupants(def.id);
  const diets = new Map<string, number>();
  for (const id of slots) {
    const d = id ? guestById.get(id)?.diet : null;
    if (d) diets.set(d, (diets.get(d) ?? 0) + 1);
  }
  const issues = rules.filter((r) => r.status === "broken" && r.tableIds.includes(def.id));
  const used = countAt(def.id);
  const heldGuest = held ? guestById.get(held) : undefined;

  return (
    <Column background="surface" border={brokenTables.has(def.id) ? "danger-medium" : true} radius="l" padding="16" gap="12">
      <Row horizontal="between" vertical="center" gap="8">
        <Heading as="h2" textVariant="heading-strong-m">
          {def.name}
        </Heading>
        <Tag size="s" tone={used === def.seats ? "warning" : "neutral"} label={`${used} of ${def.seats} seats`} />
      </Row>

      {issues.map((r) => (
        <Row key={r.id} gap="8" padding="8" radius="m" background="danger-alpha-weak" vertical="start">
          <Icon name="warning" size="s" onBackground="danger-strong" />
          <Text textVariant="body-default-s">
            {r.title}: {r.detail}
          </Text>
        </Row>
      ))}

      {heldGuest ? (
        <Button size="s" prefixIcon="plus" onClick={() => place(heldGuest.id, def.id)}>
          Seat {heldGuest.name} here
        </Button>
      ) : null}

      <Column as="ul" gap="2" margin="0" padding="0">
        {slots.map((id, i) => {
          const g = id ? guestById.get(id) : undefined;
          return (
            <Row as="li" key={`${def.id}-${i}`} gap="12" vertical="center" paddingY="4" minHeight="40">
              <Text textVariant="label-default-xs" onBackground="neutral-weak" style={{ width: "1.25rem", textAlign: "right" }}>
                {i + 1}
              </Text>
              {g ? (
                <>
                  <Avatarish name={g.name} active={held === g.id} />
                  <Column flex={1} gap="2">
                    <Text textVariant="label-strong-s">{g.name}</Text>
                    <Text textVariant="body-default-xs" onBackground="neutral-weak">
                      {g.party}
                    </Text>
                  </Column>
                  <Tag size="s" tone={g.diet ? "warning" : "neutral"} label={g.diet ?? "No dietary needs"} />
                  <IconButton
                    icon="personRemove"
                    variant="tertiary"
                    size="s"
                    tooltip="Unseat"
                    aria-label={`Unseat ${g.name}`}
                    onClick={() => unseat(g.id)}
                  />
                  <IconButton
                    icon={held === g.id ? "close" : "arrowRight"}
                    variant="tertiary"
                    size="s"
                    tooltip={held === g.id ? "Cancel move" : "Move to another seat"}
                    aria-label={held === g.id ? `Cancel moving ${g.name}` : `Move ${g.name}`}
                    onClick={() => hold(held === g.id ? null : g.id)}
                  />
                </>
              ) : (
                <Text textVariant="body-default-s" onBackground="neutral-weak">
                  Empty seat
                </Text>
              )}
            </Row>
          );
        })}
      </Column>

      <Column gap="4" borderTop paddingTop="12">
        <Text textVariant="label-default-xs" onBackground="neutral-weak">
          DIETARY NEEDS AT THIS TABLE
        </Text>
        <Text textVariant="body-default-s">
          {diets.size
            ? Array.from(diets.entries())
                .map(([d, n]) => `${n} × ${d}`)
                .join(", ")
            : "None recorded"}
        </Text>
      </Column>
    </Column>
  );
}
```

```tsx components/RoomPlan.tsx
"use client";

import { Column, Icon, Row, Text } from "@once-ui-system/core";
import { useState } from "react";
import { event, fixtures, guests, initials, tables } from "@/lib/data";
import { SEAT_SIZE, tableGeometry } from "@/lib/geometry";
import { usePlan } from "@/lib/plan";

const W = event.room_m.width;
const D = event.room_m.depth;
const guestById = new Map(guests.map((g) => [g.id, g]));

const px = (m: number) => `${(m / W) * 100}%`;
const py = (m: number) => `${(m / D) * 100}%`;

export const GUEST_DRAG_TYPE = "text/plain";

export function RoomPlan() {
  const { occupants, held, hold, selectTable, selectedTable, place, brokenTables, countAt } = usePlan();
  const [over, setOver] = useState<string | null>(null);

  const readDrop = (e: React.DragEvent): string | null => {
    const id = e.dataTransfer.getData(GUEST_DRAG_TYPE);
    return guestById.has(id) ? id : null;
  };

  return (
    <Column
      background="surface"
      border
      radius="l"
      overflowX="auto"
      padding="12"
      gap="8"
      aria-label={`Floor plan of ${event.venue}, ${W} by ${D} metres`}
      role="region"
      tabIndex={0}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          minWidth: "860px",
          aspectRatio: `${W} / ${D}`,
          containerType: "inline-size",
        }}
      >
        <Column
          position="absolute"
          top="0"
          left="0"
          fill
          background="neutral-alpha-weak"
          border
          radius="m"
          pointerEvents="none"
        />

        {fixtures.map((f) => {
          const tone =
            f.kind === "dancefloor"
              ? "brand-alpha-weak"
              : f.kind === "stage"
                ? "neutral-alpha-strong"
                : f.kind === "bar"
                  ? "accent-alpha-medium"
                  : "info-alpha-strong";
          const vertical = f.kind === "door";
          return (
            <Row
              key={f.id}
              position="absolute"
              center
              background={tone}
              radius={f.kind === "dancefloor" ? "m" : "s"}
              border={f.kind === "dancefloor"}
              borderStyle="dashed"
              pointerEvents="none"
              style={{ left: px(f.x), top: py(f.y), width: px(f.w), height: py(f.h) }}
            >
              <Text
                textVariant="label-default-s"
                onBackground="neutral-medium"
                style={{
                  fontSize: "1.25cqw",
                  writingMode: vertical ? "vertical-rl" : undefined,
                  whiteSpace: "nowrap",
                  transform: vertical ? "rotate(180deg)" : undefined,
                }}
              >
                {vertical ? "" : f.label}
              </Text>
            </Row>
          );
        })}
        {/* door label sits outside the thin strip so it stays readable */}
        <Text
          textVariant="label-default-xs"
          onBackground="info-strong"
          style={{
            position: "absolute",
            left: px(0.7),
            top: py(6.3),
            fontSize: "1.1cqw",
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            pointerEvents: "none",
          }}
        >
          Garden doors
        </Text>

        {tables.map((t) => {
          const g = tableGeometry(t);
          const slots = occupants(t.id);
          const broken = brokenTables.has(t.id);
          const selected = selectedTable === t.id;
          const used = countAt(t.id);
          const topKey = `${t.id}:top`;
          return (
            <div key={t.id}>
              <Row
                as="button"
                type="button"
                position="absolute"
                center
                background={selected ? "brand-alpha-weak" : "neutral-alpha-medium"}
                border={broken ? "danger-strong" : selected ? "brand-strong" : true}
                borderWidth={broken || selected ? 2 : 1}
                radius={t.shape === "round" ? "full" : "m"}
                cursor="interactive"
                aria-pressed={selected}
                aria-label={`${t.name} ${used}/${t.seats}, ${used} of ${t.seats} seats filled${broken ? ", a seating rule is broken here" : ""}`}
                onClick={() => (held ? place(held, t.id) : selectTable(t.id))}
                onDragOver={(e: React.DragEvent) => {
                  e.preventDefault();
                  setOver(topKey);
                }}
                onDragLeave={() => setOver(null)}
                onDrop={(e: React.DragEvent) => {
                  e.preventDefault();
                  setOver(null);
                  const id = readDrop(e);
                  if (id) place(id, t.id);
                }}
                style={{
                  left: px(g.x + g.top.x),
                  top: py(g.y + g.top.y),
                  width: px(g.top.w),
                  height: py(g.top.h),
                  flexDirection: "column",
                  outline: over === topKey ? "3px solid var(--brand-solid-strong)" : undefined,
                  padding: 0,
                }}
              >
                <Text
                  textVariant="label-strong-s"
                  style={{ fontSize: "1.3cqw", lineHeight: 1.1, textAlign: "center" }}
                >
                  {broken ? "⚠ " : ""}{t.name}
                </Text>
                <Text
                  textVariant="body-default-xs"
                  onBackground="neutral-weak"
                  style={{ fontSize: "1.1cqw", lineHeight: 1.1 }}
                >
                  {used}/{t.seats}
                </Text>
              </Row>

              {g.seats.map((s) => {
                const gid = slots[s.index];
                const guest = gid ? guestById.get(gid) : undefined;
                const key = `${t.id}:${s.index}`;
                const isHeld = gid !== null && gid === held;
                return (
                  <Row
                    key={key}
                    as="button"
                    type="button"
                    position="absolute"
                    center
                    radius="full"
                    background={guest ? "brand-alpha-strong" : "transparent"}
                    border={isHeld ? "brand-strong" : guest ? "brand-medium" : true}
                    borderStyle={guest ? "solid" : "dashed"}
                    borderWidth={isHeld ? 4 : 1}
                    cursor="interactive"
                    draggable={Boolean(guest)}
                    aria-label={
                      guest
                        ? `${initials(guest.name)}, ${t.name} seat ${s.index + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}${isHeld ? ", picked up" : ""}`
                        : `${t.name}, seat ${s.index + 1}: empty`
                    }
                    title={guest ? `${guest.name}${guest.diet ? ` (${guest.diet})` : ""}` : "Empty seat"}
                    onClick={() => {
                      if (held) {
                        if (gid === held) hold(null);
                        else place(held, t.id, s.index);
                      } else if (gid) {
                        selectTable(t.id);
                        hold(gid);
                      } else selectTable(t.id);
                    }}
                    onDragStart={(e: React.DragEvent) => {
                      if (!gid) return;
                      e.dataTransfer.setData(GUEST_DRAG_TYPE, gid);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(e: React.DragEvent) => {
                      e.preventDefault();
                      setOver(key);
                    }}
                    onDragLeave={() => setOver(null)}
                    onDrop={(e: React.DragEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOver(null);
                      const id = readDrop(e);
                      if (id) place(id, t.id, s.index);
                    }}
                    style={{
                      left: px(g.x + s.cx - SEAT_SIZE / 2),
                      top: py(g.y + s.cy - SEAT_SIZE / 2),
                      width: px(SEAT_SIZE),
                      aspectRatio: "1",
                      padding: 0,
                      outline: over === key ? "3px solid var(--brand-solid-strong)" : undefined,
                    }}
                  >
                    {guest ? (
                      <Text
                        textVariant="label-strong-xs"
                        style={{ fontSize: "1.2cqw", lineHeight: 1 }}
                      >
                        {initials(guest.name)}
                      </Text>
                    ) : null}
                    {guest?.diet ? (
                      <span
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          right: "-2px",
                          top: "-2px",
                          width: "34%",
                          aspectRatio: "1",
                          borderRadius: "50%",
                          background: "var(--warning-solid-strong)",
                          border: "1.5px solid var(--page-background)",
                        }}
                      />
                    ) : null}
                  </Row>
                );
              })}
            </div>
          );
        })}
      </div>

      <Row gap="16" paddingX="4" wrap vertical="center" textVariant="body-default-xs" onBackground="neutral-weak">
        <Row gap="8" vertical="center">
          <Row
            width="16"
            height="16"
            radius="full"
            background="brand-alpha-strong"
            border="brand-medium"
            aria-hidden="true"
          />
          Seated guest
        </Row>
        <Row gap="8" vertical="center">
          <Row width="16" height="16" radius="full" border borderStyle="dashed" aria-hidden="true" />
          Empty seat
        </Row>
        <Row gap="8" vertical="center">
          <Row width="12" height="12" radius="full" solid="warning-strong" aria-hidden="true" />
          Dietary need
        </Row>
        <Row gap="8" vertical="center">
          <Icon name="warning" size="xs" onBackground="danger-strong" />
          Rule broken
        </Row>
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          Drag a guest to a seat, or tap a guest and then a seat. The room is {W} by {D} m.
        </Text>
      </Row>
    </Column>
  );
}
```

```ts lib/data.ts
export type Rsvp = "yes" | "no" | "maybe" | "pending";

export type Guest = {
  id: string;
  name: string;
  party: string;
  rsvp: Rsvp;
  diet: string | null;
  table: string | null;
};

export type TableShape = "round" | "long";

export type TableDef = {
  id: string;
  name: string;
  shape: TableShape;
  seats: number;
  x: number;
  y: number;
  rotation?: number;
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

export type RuleKind = "together" | "apart" | "near";

export type Rule = {
  kind: RuleKind;
  guests: string[];
  note: string;
};

export const app = "Seatwise, a seating planner for wedding and event planners";

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

type G = [string, string, string, Rsvp, string | null, string | null];

const guestRows: G[] = [
  ["g-01", "Ines Carvalho", "Couple", "yes", null, "t-head"],
  ["g-02", "Mateo Alvarez", "Couple", "yes", "Vegetarian", "t-head"],
  ["g-03", "Rui Carvalho", "Bride's family", "yes", null, "t-head"],
  ["g-04", "Marta Carvalho", "Bride's family", "yes", "Gluten free", "t-head"],
  ["g-05", "Javier Alvarez", "Groom's family", "yes", null, "t-head"],
  ["g-06", "Lucia Alvarez", "Groom's family", "yes", null, "t-head"],
  ["g-07", "Sofia Carvalho", "Bride's family", "yes", null, "t-1"],
  ["g-08", "Tiago Carvalho", "Bride's family", "yes", null, "t-1"],
  ["g-09", "Avó Rosa Carvalho", "Bride's family", "yes", "Soft food", "t-1"],
  ["g-10", "Pedro Nunes", "Bride's family", "yes", null, "t-1"],
  ["g-11", "Ana Nunes", "Bride's family", "yes", "Vegan", "t-1"],
  ["g-12", "Carmen Alvarez", "Groom's family", "yes", null, "t-4"],
  ["g-13", "Diego Alvarez", "Groom's family", "yes", null, "t-4"],
  ["g-14", "Elena Ruiz", "Groom's family", "yes", "Nut allergy", "t-4"],
  ["g-15", "Pablo Ruiz", "Groom's family", "yes", null, "t-4"],
  ["g-16", "Isabel Ruiz", "Groom's family", "maybe", null, null],
  ["g-17", "Chloe Martin", "University friends", "yes", null, "t-2"],
  ["g-18", "Ben Okafor", "University friends", "yes", null, "t-2"],
  ["g-19", "Leila Haddad", "University friends", "yes", "Halal", "t-2"],
  ["g-20", "Omar Haddad", "University friends", "yes", "Halal", "t-2"],
  ["g-21", "Freya Lund", "University friends", "yes", "Vegetarian", null],
  ["g-22", "Jonas Lund", "University friends", "yes", null, null],
  ["g-23", "Grace Lee", "Work friends", "yes", null, "t-5"],
  ["g-24", "Marcus Webb", "Work friends", "yes", null, "t-5"],
  ["g-25", "Nadia Petrova", "Work friends", "yes", "Pescatarian", "t-5"],
  ["g-26", "Tom Fisher", "Work friends", "no", null, null],
  ["g-27", "Hana Sato", "Work friends", "yes", null, null],
  ["g-28", "Luis Ortega", "Groom's football club", "yes", null, "t-3"],
  ["g-29", "Kai Brennan", "Groom's football club", "yes", null, "t-3"],
  ["g-30", "Sean Doyle", "Groom's football club", "yes", null, "t-3"],
  ["g-31", "Ryan Doyle", "Groom's football club", "yes", null, null],
  ["g-32", "Hugo Carvalho", "Bride's family", "yes", "Children's menu", "t-1"],
  ["g-33", "Mia Carvalho", "Bride's family", "yes", "Children's menu", null],
  ["g-34", "Paula Mendes", "Bride's family", "pending", null, null],
  ["g-35", "Victor Mendes", "Bride's family", "pending", null, null],
  ["g-36", "Zoe Bennett", "Plus-ones", "yes", null, "t-2"],
  ["g-37", "Arjun Mehta", "Plus-ones", "yes", "Vegetarian", "t-5"],
  ["g-38", "Laura Svensson", "Plus-ones", "yes", null, null],
];

export const guests: Guest[] = guestRows.map(([id, name, party, rsvp, diet, table]) => ({
  id,
  name,
  party,
  rsvp,
  diet,
  table,
}));

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
  },
];

export const rsvpLabel: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Awaiting reply",
  no: "Declined",
};

export const STANDARD_MEAL = "Standard menu";

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
```

```ts lib/geometry.ts
import type { TableDef } from "./data";

export type SeatSpot = { index: number; cx: number; cy: number };

export type TableGeometry = {
  /** footprint box in metres (top-left and size) */
  x: number;
  y: number;
  w: number;
  h: number;
  /** the tabletop itself, relative to the footprint, in metres */
  top: { x: number; y: number; w: number; h: number };
  seats: SeatSpot[];
  /** centre of the footprint in room metres */
  centre: { x: number; y: number };
};

export const SEAT_SIZE = 0.8;

export function tableGeometry(t: TableDef): TableGeometry {
  if (t.shape === "long") {
    // (x, y) is the top-left of the footprint: seats on both long sides.
    const w = 8;
    const h = 2.6;
    const perSide = Math.ceil(t.seats / 2);
    const pitch = w / perSide;
    const seats: SeatSpot[] = [];
    for (let i = 0; i < t.seats; i += 1) {
      const row = i < perSide ? 0 : 1;
      const col = row === 0 ? i : i - perSide;
      seats.push({ index: i, cx: pitch * (col + 0.5), cy: row === 0 ? 0.4 : h - 0.4 });
    }
    return {
      x: t.x,
      y: t.y,
      w,
      h,
      top: { x: 0.2, y: 0.9, w: w - 0.4, h: 0.8 },
      seats,
      centre: { x: t.x + w / 2, y: t.y + h / 2 },
    };
  }
  // (x, y) is the centre of a round table.
  const small = t.seats <= 6;
  const tableR = small ? 0.8 : 0.9;
  const ring = small ? 1.2 : 1.35;
  const half = ring + SEAT_SIZE / 2;
  const size = half * 2;
  const seats: SeatSpot[] = [];
  for (let i = 0; i < t.seats; i += 1) {
    const a = -Math.PI / 2 + (i / t.seats) * Math.PI * 2;
    seats.push({ index: i, cx: half + Math.cos(a) * ring, cy: half + Math.sin(a) * ring });
  }
  return {
    x: t.x - half,
    y: t.y - half,
    w: size,
    h: size,
    top: { x: half - tableR, y: half - tableR, w: tableR * 2, h: tableR * 2 },
    seats,
    centre: { x: t.x, y: t.y },
  };
}

export function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
```

```tsx lib/plan.tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { guests, tables } from "./data";
import { type Assignment, type RuleResult, evaluateRules } from "./rules";

type PlanContextValue = {
  assign: Assignment;
  /** guest picked up by tapping, waiting for a seat */
  held: string | null;
  selectedTable: string | null;
  message: string;
  rules: RuleResult[];
  brokenTables: Set<string>;
  occupants: (tableId: string) => (string | null)[];
  countAt: (tableId: string) => number;
  seatedCount: number;
  unseatedAttending: string[];
  unseatedMaybe: string[];
  hold: (guestId: string | null) => void;
  selectTable: (tableId: string | null) => void;
  place: (guestId: string, tableId: string, seat?: number) => void;
  unseat: (guestId: string) => void;
};

const PlanContext = createContext<PlanContextValue | null>(null);

function initialAssignment(): Assignment {
  const next: Assignment = {};
  const used: Record<string, number> = {};
  for (const g of guests) {
    if (g.table) {
      const seat = used[g.table] ?? 0;
      used[g.table] = seat + 1;
      next[g.id] = { table: g.table, seat };
    } else {
      next[g.id] = null;
    }
  }
  return next;
}

const guestById = new Map(guests.map((g) => [g.id, g]));
const tableById = new Map(tables.map((t) => [t.id, t]));

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [assign, setAssign] = useState<Assignment>(initialAssignment);
  const [held, setHeld] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>("t-1");
  const [message, setMessage] = useState("");

  const occupants = useCallback(
    (tableId: string) => {
      const def = tableById.get(tableId);
      const slots: (string | null)[] = Array.from({ length: def?.seats ?? 0 }, () => null);
      for (const [gid, p] of Object.entries(assign)) {
        if (p && p.table === tableId) slots[p.seat] = gid;
      }
      return slots;
    },
    [assign],
  );

  const countAt = useCallback(
    (tableId: string) => Object.values(assign).filter((p) => p?.table === tableId).length,
    [assign],
  );

  const place = useCallback(
    (guestId: string, tableId: string, seat?: number) => {
      const guest = guestById.get(guestId);
      const def = tableById.get(tableId);
      if (!guest || !def) return;
      if (guest.rsvp === "no") {
        setMessage(`${guest.name} has declined, so cannot be seated.`);
        return;
      }
      const slots: (string | null)[] = Array.from({ length: def.seats }, () => null);
      for (const [gid, p] of Object.entries(assign)) {
        if (p && p.table === tableId && gid !== guestId) slots[p.seat] = gid;
      }
      const from = assign[guestId] ?? null;
      let target = seat;
      if (target === undefined || (slots[target] !== null && !from)) {
        const free = slots.findIndex((s) => s === null);
        if (free === -1) {
          setMessage(`${def.name} is full. Unseat someone or pick another table.`);
          return;
        }
        target = free;
      }
      const occupant = slots[target];
      setAssign((prev) => {
        const next: Assignment = { ...prev, [guestId]: { table: tableId, seat: target as number } };
        if (occupant) next[occupant] = from;
        return next;
      });
      setHeld(null);
      setSelectedTable(tableId);
      setMessage(
        occupant && from
          ? `Swapped ${guest.name} with ${guestById.get(occupant)?.name ?? "a guest"}.`
          : `${guest.name} seated at ${def.name}, seat ${target + 1}.`,
      );
    },
    [assign],
  );

  const unseat = useCallback(
    (guestId: string) => {
      setAssign((prev) => ({ ...prev, [guestId]: null }));
      setHeld(null);
      setMessage(`${guestById.get(guestId)?.name ?? "Guest"} unseated.`);
    },
    [],
  );

  const hold = useCallback((guestId: string | null) => {
    setHeld(guestId);
    if (guestId) {
      setMessage(`${guestById.get(guestId)?.name ?? "Guest"} picked up. Tap a seat or table to place them.`);
    } else {
      setMessage("");
    }
  }, []);

  const selectTable = useCallback((tableId: string | null) => setSelectedTable(tableId), []);

  const value = useMemo<PlanContextValue>(() => {
    const ruleResults = evaluateRules(assign);
    const broken = new Set<string>();
    for (const r of ruleResults) {
      if (r.status === "broken") for (const t of r.tableIds) broken.add(t);
    }
    const unseatedAttending = guests.filter((g) => g.rsvp === "yes" && !assign[g.id]).map((g) => g.id);
    const unseatedMaybe = guests
      .filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !assign[g.id])
      .map((g) => g.id);
    return {
      assign,
      held,
      selectedTable,
      message,
      rules: ruleResults,
      brokenTables: broken,
      occupants,
      countAt,
      seatedCount: Object.values(assign).filter(Boolean).length,
      unseatedAttending,
      unseatedMaybe,
      hold,
      selectTable,
      place,
      unseat,
    };
  }, [assign, held, selectedTable, message, occupants, countAt, hold, selectTable, place, unseat]);

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}
```

```ts lib/rules.ts
import { fixtures, guests, rules, tables } from "./data";
import { distance, tableGeometry } from "./geometry";

export type Placement = { table: string; seat: number };
export type Assignment = Record<string, Placement | null>;

export type RuleStatus = "ok" | "broken" | "open";

export type RuleResult = {
  id: string;
  kind: "together" | "apart" | "near";
  status: RuleStatus;
  /** tables that carry the flag when the rule is broken */
  tableIds: string[];
  guestIds: string[];
  title: string;
  detail: string;
  note: string;
};

const NEAR_DOOR_M = 4.5;
const AWAY_FROM_BAND_M = 7;

const guestById = new Map(guests.map((g) => [g.id, g]));
const tableById = new Map(tables.map((t) => [t.id, t]));
const door = fixtures.find((f) => f.kind === "door");
const band = fixtures.find((f) => f.kind === "stage");

function nameOf(id: string): string {
  return guestById.get(id)?.name ?? id;
}

function tableName(id: string): string {
  return tableById.get(id)?.name ?? id;
}

function centreOf(f: { x: number; y: number; w: number; h: number }) {
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

export function evaluateRules(assign: Assignment): RuleResult[] {
  return rules.map((rule, i) => {
    const id = `rule-${i}`;
    const names = rule.guests.map(nameOf);
    const at = rule.guests.map((g) => assign[g]?.table ?? null);
    const base = { id, kind: rule.kind, guestIds: rule.guests, note: rule.note };

    if (rule.kind === "together") {
      const title = `${names.join(" and ")} together`;
      if (at.some((t) => t === null)) {
        return {
          ...base,
          status: "open" as const,
          tableIds: [],
          title,
          detail: at.every((t) => t === null) ? "Neither is seated yet" : "One of them is still unseated",
        };
      }
      const same = at.every((t) => t === at[0]);
      return {
        ...base,
        status: same ? ("ok" as const) : ("broken" as const),
        tableIds: same ? [] : Array.from(new Set(at as string[])),
        title,
        detail: same
          ? `Both at ${tableName(at[0] as string)}`
          : `Split across ${Array.from(new Set(at as string[])).map(tableName).join(" and ")}`,
      };
    }

    if (rule.kind === "apart") {
      const title = `${names.join(" and ")} apart`;
      if (at.some((t) => t === null)) {
        return {
          ...base,
          status: "open" as const,
          tableIds: [],
          title,
          detail: "Not both seated, nothing to clash yet",
        };
      }
      const clash = at[0] === at[1];
      return {
        ...base,
        status: clash ? ("broken" as const) : ("ok" as const),
        tableIds: clash ? [at[0] as string] : [],
        title,
        detail: clash
          ? `Both at ${tableName(at[0] as string)}`
          : `${tableName(at[0] as string)} and ${tableName(at[1] as string)}`,
      };
    }

    // near: the guest sits close to the garden doors and away from the band
    const title = `${names[0]} near the garden doors`;
    const t = at[0];
    if (t === null || !door || !band) {
      return {
        ...base,
        status: "open" as const,
        tableIds: [],
        title,
        detail: "Not seated yet",
      };
    }
    const def = tableById.get(t);
    const c = def ? tableGeometry(def).centre : { x: 0, y: 0 };
    const dDoor = distance(c, centreOf(door));
    const dBand = distance(c, centreOf(band));
    const ok = dDoor <= NEAR_DOOR_M && dBand >= AWAY_FROM_BAND_M;
    return {
      ...base,
      status: ok ? ("ok" as const) : ("broken" as const),
      tableIds: ok ? [] : [t],
      title,
      detail: ok
        ? `${tableName(t)} is ${dDoor.toFixed(1)} m from the doors`
        : dDoor > NEAR_DOOR_M
          ? `${tableName(t)} is ${dDoor.toFixed(1)} m from the doors, over ${NEAR_DOOR_M} m`
          : `${tableName(t)} is only ${dBand.toFixed(1)} m from the band`,
    };
  });
}
```

