```tsx src/app/guests/page.tsx
import type { Metadata } from "next";
import { AppFrame } from "@/components/seatwise/AppFrame";
import { GuestsView } from "@/components/seatwise/GuestsView";

export const metadata: Metadata = {
  title: "Guest list · Seatwise",
  description: "Search and filter the guest list, see each guest's table and the meal counts for the caterer.",
};

export default function Page() {
  return (
    <AppFrame>
      <GuestsView />
    </AppFrame>
  );
}
```

```tsx src/app/page.tsx
import type { Metadata } from "next";
import { AppFrame } from "@/components/seatwise/AppFrame";
import { PlanView } from "@/components/seatwise/PlanView";

export const metadata: Metadata = {
  title: "Seating plan · Seatwise",
  description: "Build the seating plan for Ines & Mateo's wedding dinner, table by table.",
};

export default function Page() {
  return (
    <AppFrame>
      <PlanView />
    </AppFrame>
  );
}
```

```tsx src/components/Providers.tsx
"use client";

import { type BorderStyle, DataThemeProvider, IconProvider, type NeutralColor, type ScalingSize, type Schemes, type SolidStyle, type SolidType, type SurfaceStyle, type Theme, ThemeProvider, ToastProvider, type TransitionStyle } from "@once-ui-system/core";
import type { ChartMode, ChartVariant } from "@once-ui-system/core/data";
// The Next adapters: links go through next/link and images through next/image.
import { LayoutProvider } from "@once-ui-system/core/next";
import { style, dataStyle } from "../resources/once-ui.config";
import { iconLibrary } from "../resources/icons";
import { SeatingProvider } from "../lib/seating";
import { UserProvider } from "./UserProvider";
import { OrgProvider } from "./OrgProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <ThemeProvider
        theme={style.theme as Theme}
        brand={style.brand as Schemes}
        accent={style.accent as Schemes}
        neutral={style.neutral as NeutralColor}
        solid={style.solid as SolidType}
        solidStyle={style.solidStyle as SolidStyle}
        border={style.border as BorderStyle}
        surface={style.surface as SurfaceStyle}
        transition={style.transition as TransitionStyle}
        scaling={style.scaling as ScalingSize}
      >
        <DataThemeProvider
          variant={dataStyle.variant as ChartVariant}
          mode={dataStyle.mode as ChartMode}
          height={dataStyle.height}
          axis={{
            stroke: dataStyle.axis.stroke
          }}
          tick={{
            fill: dataStyle.tick.fill,
            fontSize: dataStyle.tick.fontSize,
            line: dataStyle.tick.line
          }}
          >
          <ToastProvider>
            <IconProvider icons={iconLibrary}>
              <UserProvider>
                <OrgProvider>
                  <SeatingProvider>{children}</SeatingProvider>
                </OrgProvider>
              </UserProvider>
            </IconProvider>
          </ToastProvider>
        </DataThemeProvider>
      </ThemeProvider>
    </LayoutProvider>
  );
}
```

```tsx src/components/seatwise/AppFrame.tsx
"use client";

import { Avatar, Button, Column, Icon, Row, Text, VisuallyHidden } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { app, event, planner } from "@/lib/data";
import { useSeating } from "@/lib/seating";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const { notice } = useSeating();
  const onGuests = pathname.startsWith("/guests");

  return (
    <Column fillWidth horizontal="center" paddingX="16" paddingY="16" gap="16">
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Column fillWidth maxWidth="90rem" gap="16">
        <Row
          as="header"
          fillWidth
          horizontal="between"
          vertical="center"
          gap="16"
          paddingX="16"
          paddingY="12"
          background="surface"
          border
          radius="l"
          wrap
        >
          <Row gap="12" vertical="center">
            <Row center width="40" height="40" radius="m" solid="brand-strong">
              <Icon name="people" onSolid="brand-strong" />
            </Row>
            <Column>
              <Text variant="heading-strong-m">{app}</Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                {event.venue}
              </Text>
            </Column>
          </Row>

          <Row as="nav" aria-label="Main" gap="4">
            <Button
              href="/"
              size="s"
              prefixIcon="grid"
              variant={onGuests ? "tertiary" : "secondary"}
              aria-current={onGuests ? undefined : "page"}
            >
              Plan
            </Button>
            <Button
              href="/guests"
              size="s"
              prefixIcon="people"
              variant={onGuests ? "secondary" : "tertiary"}
              aria-current={onGuests ? "page" : undefined}
            >
              Guests
            </Button>
          </Row>

          <Row gap="8" vertical="center" s={{ hide: true }}>
            <Avatar size="s" value="HB" />
            <Column>
              <Text variant="label-default-s">{planner.name}</Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                Planner
              </Text>
            </Column>
          </Row>
        </Row>

        <Column as="main" id="main" fillWidth gap="16">
          {children}
        </Column>
        <VisuallyHidden as="div" aria-live="polite" role="status">
          {notice}
        </VisuallyHidden>
      </Column>
    </Column>
  );
}
```

```tsx src/components/seatwise/GuestsView.tsx
"use client";

import { Button, Column, Grid, Heading, Input, Row, Select, Switch, Table, Tag, Text } from "@once-ui-system/core";
import { useMemo, useState } from "react";
import { STANDARD_MEAL, event, guests as seed, rsvpLabel, rsvpScheme, type Rsvp } from "@/lib/data";
import { tableName, useSeating } from "@/lib/seating";
import { partyOrder } from "./party";

const ALL = "all";
const NO_DIET = "none";

const diets = Array.from(new Set(seed.map((g) => g.diet).filter((d): d is string => !!d))).sort();

export function GuestsView() {
  const { guests } = useSeating();
  const [query, setQuery] = useState("");
  const [party, setParty] = useState(ALL);
  const [rsvp, setRsvp] = useState(ALL);
  const [diet, setDiet] = useState(ALL);
  const [includeTentative, setIncludeTentative] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests.filter((guest) => {
      if (q && !guest.name.toLowerCase().includes(q)) return false;
      if (party !== ALL && guest.party !== party) return false;
      if (rsvp !== ALL && guest.rsvp !== rsvp) return false;
      if (diet === NO_DIET && guest.diet) return false;
      if (diet !== ALL && diet !== NO_DIET && guest.diet !== diet) return false;
      return true;
    });
  }, [guests, query, party, rsvp, diet]);

  const meals = useMemo(() => {
    const counted = guests.filter(
      (guest) => guest.rsvp === "yes" || (includeTentative && (guest.rsvp === "maybe" || guest.rsvp === "pending")),
    );
    const map = new Map<string, number>();
    for (const guest of counted) {
      const meal = guest.diet ?? STANDARD_MEAL;
      map.set(meal, (map.get(meal) ?? 0) + 1);
    }
    const rows = Array.from(map.entries()).sort((a, b) => {
      if (a[0] === STANDARD_MEAL) return -1;
      if (b[0] === STANDARD_MEAL) return 1;
      return b[1] - a[1] || a[0].localeCompare(b[0]);
    });
    return { rows, total: counted.length };
  }, [guests, includeTentative]);

  const filtersActive = query !== "" || party !== ALL || rsvp !== ALL || diet !== ALL;
  const clear = () => {
    setQuery("");
    setParty(ALL);
    setRsvp(ALL);
    setDiet(ALL);
  };

  return (
    <>
      <Column gap="4">
        <Heading as="h1" variant="display-strong-xs">
          Guest list
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {event.name} · {guests.length} invited
        </Text>
      </Column>

      <div className="sw-main">
        <Column gap="16" style={{ minWidth: 0 }}>
          <Column background="surface" border radius="l" padding="16" gap="12">
            <Grid columns="4" l={{ columns: "2" }} s={{ columns: "1" }} gap="12" fillWidth>
              <Input
                id="guest-search"
                label="Search guests"
                size="s"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Select
                id="filter-party"
                label="Party"
                size="s"
                value={party}
                onSelect={(v) => setParty(String(v))}
                options={[{ value: ALL, label: "All parties" }, ...partyOrder.map((p) => ({ value: p, label: p }))]}
              />
              <Select
                id="filter-rsvp"
                label="RSVP"
                size="s"
                value={rsvp}
                onSelect={(v) => setRsvp(String(v))}
                options={[
                  { value: ALL, label: "Any RSVP" },
                  ...(Object.keys(rsvpLabel) as Rsvp[]).map((r) => ({ value: r, label: rsvpLabel[r] })),
                ]}
              />
              <Select
                id="filter-diet"
                label="Diet"
                size="s"
                value={diet}
                onSelect={(v) => setDiet(String(v))}
                options={[
                  { value: ALL, label: "Any diet" },
                  { value: NO_DIET, label: "No dietary need" },
                  ...diets.map((d) => ({ value: d, label: d })),
                ]}
              />
            </Grid>
            <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
              <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
                Showing {filtered.length} of {guests.length} guests
              </Text>
              {filtersActive && (
                <Button size="s" variant="tertiary" prefixIcon="close" onClick={clear}>
                  Clear filters
                </Button>
              )}
            </Row>
          </Column>

          <Table
            data={{
              headers: [
                { content: "Guest", key: "name", sortable: true },
                { content: "Party", key: "party", sortable: true, hide: { xs: true } },
                { content: "RSVP", key: "rsvp", sortable: true },
                { content: "Diet", key: "diet", sortable: true, hide: { xs: true } },
                { content: "Table", key: "table", sortable: true },
              ],
              rows: filtered.map((guest) => [
                guest.name,
                guest.party,
                <Tag key="rsvp" size="s" scheme={rsvpScheme[guest.rsvp]}>
                  {rsvpLabel[guest.rsvp]}
                </Tag>,
                guest.diet ? (
                  <Tag key="diet" size="s" scheme="warning">
                    {guest.diet}
                  </Tag>
                ) : (
                  "None"
                ),
                guest.table ? (
                  tableName(guest.table)
                ) : (
                  <Tag key="table" size="s" scheme="neutral">
                    Unseated
                  </Tag>
                ),
              ]),
            }}
            emptyState={
              <Column center gap="12" padding="32">
                <Text variant="body-default-s" onBackground="neutral-weak">
                  No guests match these filters.
                </Text>
                <Button size="s" variant="secondary" onClick={clear}>
                  Show everyone
                </Button>
              </Column>
            }
          />
        </Column>

        <Column background="surface" border radius="l" padding="16" gap="16" as="section" aria-labelledby="meals-title">
          <Column gap="4">
            <Heading as="h2" variant="heading-strong-m" id="meals-title">
              Meals for the caterer
            </Heading>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              One meal per guest who is attending, split by dietary need.
            </Text>
          </Column>
          <Switch
            label="Include maybe and awaiting reply"
            checked={includeTentative}
            onToggle={setIncludeTentative}
          />
          <Column as="ul" gap="4" margin="0" padding="0" style={{ listStyle: "none" }}>
            {meals.rows.map(([meal, count]) => (
              <Row
                as="li"
                key={meal}
                horizontal="between"
                vertical="center"
                paddingX="12"
                paddingY="8"
                radius="m"
                background={meal === STANDARD_MEAL ? "transparent" : "warning-alpha-weak"}
                border
              >
                <Text variant="body-default-s">{meal}</Text>
                <Text variant="label-strong-m">{count}</Text>
              </Row>
            ))}
            <Row as="li" horizontal="between" vertical="center" paddingX="12" paddingY="8">
              <Text variant="label-strong-s">Total meals</Text>
              <Text variant="label-strong-m">{meals.total}</Text>
            </Row>
          </Column>
        </Column>
      </div>
    </>
  );
}
```

```tsx src/components/seatwise/Panels.tsx
"use client";

import { Button, Column, Grid, Heading, Row, Select, Tag, Text } from "@once-ui-system/core";
import { useState } from "react";
import { initials, rsvpLabel, rsvpScheme, tables } from "@/lib/data";
import { type PlacedGuest, tableName, useSeating } from "@/lib/seating";
import { partyIndex } from "./party";

/* ---------------------------------------------------------------- stats */

export function StatTiles() {
  const { counts } = useSeating();
  const tiles = [
    { label: "Attending", value: counts.attending, note: "RSVP yes", tone: undefined },
    { label: "Seated", value: counts.seated, note: `of ${counts.capacity} seats`, tone: undefined },
    {
      label: "Unseated",
      value: counts.unseated,
      note: counts.unseated === 0 ? "Everyone has a seat" : "attending, need a seat",
      tone: counts.unseated > 0 ? ("warning-medium" as const) : ("success-medium" as const),
    },
    {
      label: "Rules broken",
      value: counts.broken,
      note: counts.broken === 0 ? "All rules kept" : "see the summary",
      tone: counts.broken > 0 ? ("danger-medium" as const) : ("success-medium" as const),
    },
  ];
  return (
    <Grid columns="4" s={{ columns: "2" }} gap="12" fillWidth>
      {tiles.map((tile) => (
        <Column key={tile.label} background="surface" border radius="l" padding="16" gap="4">
          <Text variant="label-default-s" onBackground="neutral-weak">
            {tile.label}
          </Text>
          <Heading as="p" variant="display-strong-xs" onBackground={tile.tone ?? "neutral-strong"}>
            {tile.value}
          </Heading>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            {tile.note}
          </Text>
        </Column>
      ))}
    </Grid>
  );
}

/* ----------------------------------------------------------- unseated pool */

function GuestChip({ guest }: { guest: PlacedGuest }) {
  const { heldGuestId, holdGuest } = useSeating();
  const held = heldGuestId === guest.id;
  return (
    <button
      type="button"
      className="sw-chip"
      data-held={held}
      data-diet={!!guest.diet}
      aria-pressed={held}
      draggable
      title={`${guest.name}, ${guest.party}${guest.diet ? `, ${guest.diet}` : ""}`}
      onClick={() => holdGuest(held ? null : guest.id)}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", guest.id);
        e.dataTransfer.effectAllowed = "move";
      }}
    >
      <span className="sw-dot" data-party={partyIndex(guest.party)} aria-hidden="true">
        {initials(guest.name)}
      </span>
      {guest.name}
    </button>
  );
}

export function UnseatedPool() {
  const { guests, unseatGuest } = useSeating();
  const [over, setOver] = useState(false);
  const waiting = guests.filter((guest) => guest.rsvp === "yes" && !guest.table);
  const tentative = guests.filter(
    (guest) => (guest.rsvp === "maybe" || guest.rsvp === "pending") && !guest.table,
  );

  return (
    <Column background="surface" border radius="l" padding="16" gap="12" fillWidth>
      <Row fillWidth horizontal="between" vertical="center" gap="8" wrap>
        <Row gap="8" vertical="center">
          <Heading as="h2" variant="heading-strong-m">
            Unseated guests
          </Heading>
          <Tag size="s" scheme={waiting.length ? "warning" : "success"}>
            {waiting.length}
          </Tag>
        </Row>
        <Text variant="body-default-xs" onBackground="neutral-weak">
          Attending, no seat yet. Drag a seat here to unseat.
        </Text>
      </Row>

      <Row
        className="sw-pool"
        data-target={over}
        gap="8"
        wrap
        padding="4"
        radius="m"
        minHeight={3}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const id = e.dataTransfer.getData("text/plain");
          if (id) unseatGuest(id);
        }}
      >
        {waiting.length === 0 ? (
          <Text variant="body-default-s" onBackground="neutral-weak" paddingY="8">
            Every attending guest has a seat.
          </Text>
        ) : (
          waiting.map((guest) => <GuestChip key={guest.id} guest={guest} />)
        )}
      </Row>

      {tentative.length > 0 && (
        <Column gap="8">
          <Text variant="label-default-xs" onBackground="neutral-weak">
            Not confirmed yet (maybe or awaiting reply)
          </Text>
          <Row gap="8" wrap>
            {tentative.map((guest) => (
              <GuestChip key={guest.id} guest={guest} />
            ))}
          </Row>
        </Column>
      )}
    </Column>
  );
}

/* -------------------------------------------------------------- rules */

const kindLabel = { together: "Keep together", apart: "Keep apart", near: "Seat near doors" } as const;

export function RulesPanel() {
  const { ruleStatuses, guests, counts } = useSeating();
  const nameOf = (id: string) => guests.find((guest) => guest.id === id)?.name ?? id;

  return (
    <Column background="surface" border radius="l" padding="16" gap="12" fillWidth>
      <Row fillWidth horizontal="between" vertical="center" gap="8">
        <Heading as="h2" variant="heading-strong-m">
          The couple&apos;s rules
        </Heading>
        <Tag size="s" scheme={counts.broken ? "danger" : "success"} prefixIcon={counts.broken ? "warning" : "check"}>
          {counts.broken ? `${counts.broken} broken` : "All kept"}
        </Tag>
      </Row>
      <Column as="ul" gap="8" margin="0" padding="0" style={{ listStyle: "none" }}>
        {ruleStatuses.map((status) => (
          <Column
            as="li"
            key={status.index}
            gap="4"
            padding="12"
            radius="m"
            border={status.status === "broken" ? "danger-alpha-medium" : true}
            background={status.status === "broken" ? "danger-alpha-weak" : "transparent"}
          >
            <Row gap="8" vertical="center" wrap>
              <Tag
                size="s"
                scheme={status.status === "broken" ? "danger" : status.status === "ok" ? "success" : "neutral"}
              >
                {status.status === "broken" ? "Broken" : status.status === "ok" ? "Kept" : "Open"}
              </Tag>
              <Text variant="label-default-s">{kindLabel[status.rule.kind]}</Text>
            </Row>
            <Text variant="body-strong-s">{status.rule.guests.map(nameOf).join(" and ")}</Text>
            <Text variant="body-default-s" onBackground={status.status === "broken" ? "danger-strong" : "neutral-medium"}>
              {status.message}
            </Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {status.rule.note}
            </Text>
          </Column>
        ))}
      </Column>
    </Column>
  );
}

/* ---------------------------------------------------------- selection */

export function SelectionPanel() {
  const { guests, heldGuestId, selectedTableId, occupancy, seatGuest, unseatGuest, holdGuest, selectTable } =
    useSeating();
  const held = guests.find((guest) => guest.id === heldGuestId) ?? null;
  const table = tables.find((item) => item.id === selectedTableId) ?? null;
  const slots = table ? occupancy[table.id] : [];
  const people = slots.filter((slot): slot is PlacedGuest => !!slot);
  const diets = people.reduce<Record<string, number>>((acc, person) => {
    if (person.diet) acc[person.diet] = (acc[person.diet] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Column background="surface" border radius="l" padding="16" gap="16" fillWidth>
      {held && (
        <Column gap="12" padding="12" radius="m" background="brand-alpha-weak" border="brand-alpha-medium">
          <Column gap="4">
            <Text variant="label-default-xs" onBackground="brand-medium">
              Picked up
            </Text>
            <Heading as="h2" variant="heading-strong-m">
              {held.name}
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-medium">
              {held.party} · {held.table ? `${tableName(held.table)}, seat ${(held.seat ?? 0) + 1}` : "Not seated"}
            </Text>
          </Column>
          <Row gap="8" wrap>
            <Tag size="s" scheme={rsvpScheme[held.rsvp]}>
              {rsvpLabel[held.rsvp]}
            </Tag>
            {held.diet && (
              <Tag size="s" scheme="warning">
                {held.diet}
              </Tag>
            )}
          </Row>
          <Select
            id="move-guest"
            label="Move to table"
            value={held.table ?? ""}
            options={tables.map((item) => {
              const free = occupancy[item.id].filter((slot) => !slot).length;
              return { value: item.id, label: `${item.name} (${free} free)` };
            })}
            onSelect={(value) => {
              if (typeof value === "string" && value) seatGuest(held.id, value);
            }}
          />
          <Row gap="8" wrap>
            {held.table && (
              <Button size="s" variant="secondary" prefixIcon="personRemove" onClick={() => unseatGuest(held.id)}>
                Unseat
              </Button>
            )}
            <Button size="s" variant="tertiary" onClick={() => holdGuest(null)}>
              Done
            </Button>
          </Row>
        </Column>
      )}

      {table ? (
        <Column gap="12">
          <Row fillWidth horizontal="between" vertical="center" gap="8">
            <Column gap="4">
              <Heading as="h2" variant="heading-strong-m">
                {table.name}
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {people.length} of {table.seats} seats taken, {table.seats - people.length} free
              </Text>
            </Column>
            <Button size="s" variant="tertiary" onClick={() => selectTable(null)}>
              Clear
            </Button>
          </Row>

          {people.length === 0 ? (
            <Text variant="body-default-s" onBackground="neutral-weak">
              Nobody is seated here yet. Pick up a guest, then tap this table.
            </Text>
          ) : (
            <Column as="ul" gap="4" margin="0" padding="0" style={{ listStyle: "none" }}>
              {slots.map((slot, i) => (
                <li key={`${table.id}-${i}`}>
                  {slot ? (
                    <button
                      type="button"
                      className="sw-rowbtn"
                      data-selected={heldGuestId === slot.id}
                      onClick={() => holdGuest(heldGuestId === slot.id ? null : slot.id)}
                      aria-label={`Seat ${i + 1}: ${slot.name}${slot.diet ? `, ${slot.diet}` : ", no dietary need"}`}
                    >
                      <span>
                        <Text variant="label-default-xs" onBackground="neutral-weak">
                          {i + 1}
                        </Text>
                        &nbsp;&nbsp;{slot.name}
                      </span>
                      {slot.diet ? (
                        <Tag size="s" scheme="warning">
                          {slot.diet}
                        </Tag>
                      ) : (
                        <Text variant="body-default-xs" onBackground="neutral-weak">
                          No dietary need
                        </Text>
                      )}
                    </button>
                  ) : (
                    <Row padding="8" paddingX="12" radius="m" borderStyle="dashed" border>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {i + 1}&nbsp;&nbsp;Empty seat
                      </Text>
                    </Row>
                  )}
                </li>
              ))}
            </Column>
          )}

          <Column gap="4">
            <Text variant="label-default-xs" onBackground="neutral-weak">
              Dietary needs at this table
            </Text>
            {Object.keys(diets).length === 0 ? (
              <Text variant="body-default-s">None</Text>
            ) : (
              <Row gap="8" wrap>
                {Object.entries(diets).map(([diet, n]) => (
                  <Tag key={diet} size="s" scheme="warning">
                    {n} × {diet}
                  </Tag>
                ))}
              </Row>
            )}
          </Column>
        </Column>
      ) : (
        !held && (
          <Column gap="4">
            <Heading as="h2" variant="heading-strong-m">
              Table details
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Select a table to see who sits there and what they eat.
            </Text>
          </Column>
        )
      )}
    </Column>
  );
}

/* ------------------------------------------------------- tables list */

export function TablesPanel() {
  const { occupancy, selectedTableId, selectTable, brokenTableIds } = useSeating();
  return (
    <Column background="surface" border radius="l" padding="16" gap="12" fillWidth>
      <Heading as="h2" variant="heading-strong-m">
        Tables
      </Heading>
      <Column as="ul" gap="4" margin="0" padding="0" style={{ listStyle: "none" }}>
        {tables.map((table) => {
          const taken = occupancy[table.id].filter(Boolean).length;
          return (
            <li key={table.id}>
              <button
                type="button"
                className="sw-rowbtn"
                data-selected={selectedTableId === table.id}
                aria-pressed={selectedTableId === table.id}
                onClick={() => selectTable(selectedTableId === table.id ? null : table.id)}
              >
                <span>{table.name}</span>
                <Row gap="8" vertical="center">
                  {brokenTableIds.has(table.id) && (
                    <Tag size="s" scheme="danger">
                      Rule
                    </Tag>
                  )}
                  <Text variant="label-default-s" onBackground={taken >= table.seats ? "success-medium" : "neutral-medium"}>
                    {taken}/{table.seats}
                  </Text>
                </Row>
              </button>
            </li>
          );
        })}
      </Column>
    </Column>
  );
}
```

```tsx src/components/seatwise/PlanView.tsx
"use client";

import { Column, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { event } from "@/lib/data";
import { RoomPlan } from "./RoomPlan";
import { RulesPanel, SelectionPanel, StatTiles, TablesPanel, UnseatedPool } from "./Panels";
import { useEffect } from "react";
import { useSeating } from "@/lib/seating";

export function PlanView() {
  const { holdGuest } = useSeating();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") holdGuest(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [holdGuest]);

  return (
    <>
      <Row fillWidth horizontal="between" vertical="end" gap="16" wrap>
        <Column gap="4">
          <Heading as="h1" variant="display-strong-xs">
            {event.name}
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            {event.dateLabel} · {event.venue}
          </Text>
        </Column>
        <Tag size="m" prefixIcon="calendar">
          Seating plan
        </Tag>
      </Row>

      <StatTiles />

      <div className="sw-main">
        <Column gap="16" style={{ minWidth: 0 }}>
          <UnseatedPool />
          <RoomPlan />
        </Column>
        <Column gap="16" style={{ minWidth: 0 }}>
          <RulesPanel />
          <SelectionPanel />
          <TablesPanel />
        </Column>
      </div>
    </>
  );
}
```

```tsx src/components/seatwise/RoomPlan.tsx
"use client";

import { Column, Heading, Row, Text } from "@once-ui-system/core";
import { useEffect, useRef, useState } from "react";
import { event, fixtures, initials, tables, type SeatTable } from "@/lib/data";
import { useSeating } from "@/lib/seating";
import { partyIndex, partyOrder } from "./party";

const SEAT = 28;
const MIN_SCALE = 34;
const MAX_SCALE = 56;

type Target = { table: string; seat: number | null } | null;

export function RoomPlan() {
  const {
    occupancy,
    heldGuestId,
    selectedTableId,
    brokenTableIds,
    brokenGuestIds,
    seatGuest,
    holdGuest,
    selectTable,
    guests,
  } = useSeating();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [target, setTarget] = useState<Target>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    const measure = () => setWidth(node.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, width / event.room.width));
  const roomW = event.room.width * scale;
  const roomH = event.room.depth * scale;
  const held = guests.find((guest) => guest.id === heldGuestId) ?? null;

  const clickSeat = (table: SeatTable, index: number) => {
    const occupant = occupancy[table.id][index];
    if (heldGuestId) {
      if (occupant?.id === heldGuestId) holdGuest(null);
      else seatGuest(heldGuestId, table.id, index);
      return;
    }
    selectTable(table.id);
    if (occupant) holdGuest(occupant.id);
  };

  const clickTable = (table: SeatTable) => {
    if (heldGuestId) {
      seatGuest(heldGuestId, table.id);
      return;
    }
    selectTable(selectedTableId === table.id ? null : table.id);
  };

  const onDrop = (e: React.DragEvent, tableId: string, seat?: number) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    setTarget(null);
    if (id) seatGuest(id, tableId, seat);
  };

  const renderTable = (table: SeatTable) => {
    const slots = occupancy[table.id];
    const taken = slots.filter(Boolean).length;
    const long = table.shape === "long";
    const broken = brokenTableIds.has(table.id);
    const selected = selectedTableId === table.id;
    const full = taken >= table.seats;

    const radius = Math.max(0.8 * scale, 28);
    const ring = radius + SEAT / 2 + 5;
    const length = 4.4 * scale;
    const depth = Math.max(scale, 36);

    const bodyBox = long
      ? { left: -length / 2, top: -depth / 2, width: length, height: depth }
      : { left: -radius, top: -radius, width: radius * 2, height: radius * 2 };

    const seatPos = (i: number) => {
      if (long) {
        const perSide = table.seats / 2;
        const col = i % perSide;
        const x = -length / 2 + ((col + 0.5) * length) / perSide;
        const y = (i < perSide ? -1 : 1) * (depth / 2 + SEAT / 2 + 5);
        return { x, y };
      }
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / table.seats;
      return { x: Math.cos(angle) * ring, y: Math.sin(angle) * ring };
    };

    const label = `${table.name} ${taken}/${table.seats}: ${taken} of ${table.seats} seats taken${full ? ", full" : ""}${
      broken ? ", breaks a rule" : ""
    }`;

    return (
      <div
        key={table.id}
        className="sw-table"
        style={{ left: table.x * scale, top: table.y * scale }}
      >
        <button
          type="button"
          className="sw-table-body"
          data-shape={table.shape}
          data-selected={selected}
          data-broken={broken}
          data-target={target?.table === table.id && target.seat === null}
          style={bodyBox}
          aria-label={label}
          aria-pressed={selected}
          onClick={() => clickTable(table)}
          onDragOver={(e) => {
            e.preventDefault();
            setTarget({ table: table.id, seat: null });
          }}
          onDragLeave={() => setTarget(null)}
          onDrop={(e) => onDrop(e, table.id)}
        >
          <strong>{table.name}</strong>{" "}
          <span>
            {taken}/{table.seats}
          </span>
        </button>
        {broken && (
          <span
            className="sw-flag"
            aria-hidden="true"
            style={{
              left: long ? length / 2 - 12 : radius * 0.7,
              top: long ? -depth / 2 - 6 : -radius * 0.95,
            }}
          >
            !
          </span>
        )}
        {slots.map((occupant, i) => {
          const pos = seatPos(i);
          const seatLabel = occupant
            ? `${initials(occupant.name)}: ${occupant.name}, ${table.name} seat ${i + 1}${occupant.diet ? `, ${occupant.diet}` : ""}${
                brokenGuestIds.has(occupant.id) ? ", involved in a broken rule" : ""
              }`
            : `Empty seat ${i + 1} at ${table.name}`;
          return (
            <button
              key={`${table.id}-${i}`}
              type="button"
              className="sw-seat"
              data-empty={!occupant}
              data-party={occupant ? partyIndex(occupant.party) : undefined}
              data-diet={!!occupant?.diet}
              data-held={!!occupant && occupant.id === heldGuestId}
              data-broken={!!occupant && brokenGuestIds.has(occupant.id)}
              data-target={target?.table === table.id && target.seat === i}
              style={{ left: pos.x - SEAT / 2, top: pos.y - SEAT / 2 }}
              aria-label={seatLabel}
              aria-pressed={occupant ? occupant.id === heldGuestId : undefined}
              title={occupant ? `${occupant.name}${occupant.diet ? ` (${occupant.diet})` : ""}` : `Seat ${i + 1}`}
              draggable={!!occupant}
              onDragStart={(e) => {
                if (!occupant) return;
                e.dataTransfer.setData("text/plain", occupant.id);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setTarget({ table: table.id, seat: i });
              }}
              onDragLeave={() => setTarget(null)}
              onDrop={(e) => {
                e.stopPropagation();
                onDrop(e, table.id, i);
              }}
              onClick={() => clickSeat(table, i)}
            >
              <span aria-hidden="true">{occupant ? initials(occupant.name) : i + 1}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <Column background="surface" border radius="l" padding="16" gap="12" fillWidth>
      <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
        <Column gap="4">
          <Heading as="h2" variant="heading-strong-m">
            Room plan
          </Heading>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            {event.room.width} m by {event.room.depth} m, drawn to scale. Drag guests, or tap a guest and then a seat.
          </Text>
        </Column>
        <Row gap="12" wrap vertical="center" aria-label="Party colours">
          {partyOrder.map((party, i) => (
            <Row key={party} gap="4" vertical="center">
              <span className="sw-legend-dot" data-party={i} aria-hidden="true" />
              <Text variant="label-default-xs" onBackground="neutral-medium">
                {party}
              </Text>
            </Row>
          ))}
          <Row gap="4" vertical="center">
            <span className="sw-legend-dot" style={{ background: "var(--warning-solid-strong)" }} aria-hidden="true" />
            <Text variant="label-default-xs" onBackground="neutral-medium">
              Dietary need
            </Text>
          </Row>
        </Row>
      </Row>

      {held && (
        <Text variant="label-default-s" onBackground="brand-medium" aria-live="polite">
          Seating {held.name}: tap an empty seat or a table.
        </Text>
      )}

      <div className="sw-scroll" ref={scrollRef} tabIndex={-1}>
        <div
          className="sw-room"
          style={{ width: roomW, height: roomH, ["--m" as string]: `${scale}px` }}
          role="group"
          aria-label={`Room plan of ${event.venue}`}
        >
          {fixtures.map((fx) => (
            <div
              key={fx.id}
              className="sw-fx"
              data-kind={fx.kind}
              style={{ left: fx.x * scale, top: fx.y * scale, width: fx.w * scale, height: fx.h * scale }}
            >
              {fx.label}
            </div>
          ))}
          {tables.map(renderTable)}
        </div>
      </div>
    </Column>
  );
}
```

```ts src/components/seatwise/party.ts
export const partyOrder = [
  "Couple",
  "Bride's family",
  "Groom's family",
  "University friends",
  "Work friends",
  "Groom's football club",
  "Plus-ones",
] as const;

export function partyIndex(party: string): number {
  const index = partyOrder.indexOf(party as (typeof partyOrder)[number]);
  return index === -1 ? 6 : index;
}
```

```ts src/lib/data.ts
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

export type SeatTable = {
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

export const app = "Seatwise";

export const event = {
  name: "Ines & Mateo's wedding dinner",
  date: "2027-06-19",
  dateLabel: "Saturday 19 June 2027",
  venue: "The Orangery, Hollin Hall",
  room: { width: 24, depth: 14 },
};

export const planner = { name: "Hannah Brook" };

export const fixtures: Fixture[] = [
  { id: "f-1", kind: "stage", label: "Band", x: 10, y: 0.5, w: 4, h: 2 },
  { id: "f-2", kind: "dancefloor", label: "Dance floor", x: 8.5, y: 3, w: 7, h: 4 },
  { id: "f-3", kind: "bar", label: "Bar", x: 21, y: 10, w: 2.5, h: 3.5 },
  { id: "f-4", kind: "door", label: "Garden doors", x: 0, y: 6, w: 0.5, h: 2.5 },
];

export const tables: SeatTable[] = [
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
  { kind: "apart", guests: ["g-29", "g-30"], note: "Brothers Sean and Ryan Doyle are not speaking" },
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

export const rsvpScheme: Record<Rsvp, "success" | "warning" | "neutral" | "danger"> = {
  yes: "success",
  maybe: "warning",
  pending: "neutral",
  no: "danger",
};

export const STANDARD_MEAL = "Standard menu";

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
```

```tsx src/lib/seating.tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  type Guest,
  type Rule,
  type SeatTable,
  fixtures,
  guests as seedGuests,
  rules,
  tables,
} from "@/lib/data";

export type PlacedGuest = Guest & { seat: number | null };

export type RuleStatus = {
  index: number;
  rule: Rule;
  status: "ok" | "broken" | "open";
  message: string;
  tableIds: string[];
  guestIds: string[];
};

export type Occupancy = Record<string, (PlacedGuest | null)[]>;

function seedPlacement(): PlacedGuest[] {
  const next: Record<string, number> = {};
  return seedGuests.map((guest) => {
    if (!guest.table) return { ...guest, seat: null };
    const seat = next[guest.table] ?? 0;
    next[guest.table] = seat + 1;
    return { ...guest, seat };
  });
}

const tableById = (id: string): SeatTable | undefined => tables.find((table) => table.id === id);

const centre = (id: string) => {
  const fixture = fixtures.find((item) => item.id === id);
  if (!fixture) return { x: 0, y: 0 };
  return { x: fixture.x + fixture.w / 2, y: fixture.y + fixture.h / 2 };
};

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** A table counts as near the garden doors within this many metres. */
export const NEAR_DOORS_M = 4;
/** ...and far enough from the band to talk. */
export const AWAY_FROM_BAND_M = 6;

function firstName(name: string) {
  return name.replace(/^Avó /, "Avó ").split(" ")[0] === "Avó"
    ? name.split(" ").slice(0, 2).join(" ")
    : name.split(" ")[0];
}

export function evaluateRules(list: PlacedGuest[]): RuleStatus[] {
  const byId = new Map(list.map((guest) => [guest.id, guest]));
  const doors = centre("f-4");
  const band = centre("f-1");

  return rules.map((rule, index): RuleStatus => {
    const people = rule.guests.map((id) => byId.get(id)).filter((g): g is PlacedGuest => !!g);
    const seated = people.filter((person) => person.table);
    const tableIds = Array.from(new Set(seated.map((person) => person.table as string)));
    const guestIds = people.map((person) => person.id);
    const nameOf = (id: string | null) => (id ? (tableById(id)?.name ?? id) : "");
    const base = { index, rule, guestIds };

    if (rule.kind === "together") {
      const [a, b] = people;
      if (!a || !b) return { ...base, status: "open", message: "Guest missing", tableIds };
      if (a.table && b.table) {
        return a.table === b.table
          ? { ...base, status: "ok", message: `Together at ${nameOf(a.table)}`, tableIds }
          : {
              ...base,
              status: "broken",
              message: `${firstName(a.name)} is at ${nameOf(a.table)}, ${firstName(b.name)} at ${nameOf(b.table)}`,
              tableIds,
            };
      }
      const missing = [a, b].filter((person) => !person.table).map((p) => firstName(p.name));
      return {
        ...base,
        status: "open",
        message: `Waiting to seat ${missing.join(" and ")}`,
        tableIds,
      };
    }

    if (rule.kind === "apart") {
      const [a, b] = people;
      if (a?.table && b?.table && a.table === b.table) {
        return {
          ...base,
          status: "broken",
          message: `${firstName(a.name)} and ${firstName(b.name)} both sit at ${nameOf(a.table)}`,
          tableIds,
        };
      }
      return { ...base, status: "ok", message: "Kept apart", tableIds };
    }

    const person = people[0];
    if (!person?.table) {
      return { ...base, status: "open", message: `${person ? firstName(person.name) : "Guest"} needs a seat`, tableIds };
    }
    const table = tableById(person.table);
    if (!table) return { ...base, status: "open", message: "Table not found", tableIds };
    const toDoors = distance(table, doors);
    const toBand = distance(table, band);
    if (toDoors <= NEAR_DOORS_M && toBand >= AWAY_FROM_BAND_M) {
      return {
        ...base,
        status: "ok",
        message: `${table.name} is ${toDoors.toFixed(1)} m from the garden doors`,
        tableIds,
      };
    }
    return {
      ...base,
      status: "broken",
      message:
        toDoors > NEAR_DOORS_M
          ? `${table.name} is ${toDoors.toFixed(1)} m from the garden doors`
          : `${table.name} is too close to the band`,
      tableIds,
    };
  });
}

type Result = { ok: boolean; message: string };

type SeatingContextValue = {
  guests: PlacedGuest[];
  occupancy: Occupancy;
  ruleStatuses: RuleStatus[];
  brokenTableIds: Set<string>;
  brokenGuestIds: Set<string>;
  heldGuestId: string | null;
  selectedTableId: string | null;
  notice: string;
  seatGuest: (guestId: string, tableId: string, seat?: number) => Result;
  unseatGuest: (guestId: string) => void;
  holdGuest: (guestId: string | null) => void;
  selectTable: (tableId: string | null) => void;
  counts: {
    attending: number;
    seated: number;
    unseated: number;
    capacity: number;
    broken: number;
  };
};

const SeatingContext = createContext<SeatingContextValue | null>(null);

export function SeatingProvider({ children }: { children: React.ReactNode }) {
  const [guests, setGuests] = useState<PlacedGuest[]>(seedPlacement);
  const [heldGuestId, setHeld] = useState<string | null>(null);
  const [selectedTableId, setSelectedTable] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const occupancy = useMemo<Occupancy>(() => {
    const map: Occupancy = {};
    for (const table of tables) map[table.id] = Array.from({ length: table.seats }, () => null);
    for (const guest of guests) {
      if (guest.table && guest.seat !== null && map[guest.table]) map[guest.table][guest.seat] = guest;
    }
    return map;
  }, [guests]);

  const ruleStatuses = useMemo(() => evaluateRules(guests), [guests]);

  const { brokenTableIds, brokenGuestIds } = useMemo(() => {
    const t = new Set<string>();
    const g = new Set<string>();
    for (const status of ruleStatuses) {
      if (status.status !== "broken") continue;
      status.tableIds.forEach((id) => t.add(id));
      status.guestIds.forEach((id) => g.add(id));
    }
    return { brokenTableIds: t, brokenGuestIds: g };
  }, [ruleStatuses]);

  const seatGuest = useCallback(
    (guestId: string, tableId: string, seat?: number): Result => {
      const guest = guests.find((item) => item.id === guestId);
      const table = tableById(tableId);
      if (!guest || !table) return { ok: false, message: "Could not find that seat." };
      const slots = occupancy[tableId];
      let target = seat;
      if (target === undefined) {
        if (guest.table === tableId) {
          setNotice(`${guest.name} is already at ${table.name}.`);
          return { ok: true, message: "Already there" };
        }
        target = slots.findIndex((slot) => slot === null);
        if (target === -1) {
          const message = `${table.name} is full. Free a seat or pick another table.`;
          setNotice(message);
          return { ok: false, message };
        }
      }
      const occupant = slots[target];
      if (occupant?.id === guestId) return { ok: true, message: "Already there" };
      const from = { table: guest.table, seat: guest.seat };
      setGuests((current) =>
        current.map((item) => {
          if (item.id === guestId) return { ...item, table: tableId, seat: target as number };
          if (occupant && item.id === occupant.id) return { ...item, table: from.table, seat: from.seat };
          return item;
        }),
      );
      const message = occupant
        ? `Swapped ${guest.name} and ${occupant.name}.`
        : `${guest.name} seated at ${table.name}, seat ${target + 1}.`;
      setNotice(message);
      setHeld(null);
      setSelectedTable(tableId);
      return { ok: true, message };
    },
    [guests, occupancy],
  );

  const unseatGuest = useCallback(
    (guestId: string) => {
      const guest = guests.find((item) => item.id === guestId);
      if (!guest) return;
      setGuests((current) =>
        current.map((item) => (item.id === guestId ? { ...item, table: null, seat: null } : item)),
      );
      setNotice(`${guest.name} is now unseated.`);
      setHeld(null);
    },
    [guests],
  );

  const holdGuest = useCallback((guestId: string | null) => {
    setHeld(guestId);
    if (guestId) setNotice("Guest picked up. Tap an empty seat or a table to seat them.");
  }, []);

  const selectTable = useCallback((tableId: string | null) => setSelectedTable(tableId), []);

  const counts = useMemo(() => {
    const attending = guests.filter((guest) => guest.rsvp === "yes");
    return {
      attending: attending.length,
      seated: guests.filter((guest) => guest.table).length,
      unseated: attending.filter((guest) => !guest.table).length,
      capacity: tables.reduce((sum, table) => sum + table.seats, 0),
      broken: ruleStatuses.filter((status) => status.status === "broken").length,
    };
  }, [guests, ruleStatuses]);

  const value: SeatingContextValue = {
    guests,
    occupancy,
    ruleStatuses,
    brokenTableIds,
    brokenGuestIds,
    heldGuestId,
    selectedTableId,
    notice,
    seatGuest,
    unseatGuest,
    holdGuest,
    selectTable,
    counts,
  };

  return <SeatingContext.Provider value={value}>{children}</SeatingContext.Provider>;
}

export function useSeating(): SeatingContextValue {
  const context = useContext(SeatingContext);
  if (!context) throw new Error("useSeating must be used inside SeatingProvider");
  return context;
}

export function tableName(id: string | null): string {
  return id ? (tableById(id)?.name ?? id) : "Unseated";
}
```

```css src/resources/custom.css
:root { --default-border: var(--neutral-alpha-weak); }
/* Seatwise room plan */
.sw-scroll { overflow-x: auto; overflow-y: hidden; border-radius: 16px; }
.sw-room {
  position: relative; user-select: none; border: 1px solid var(--neutral-alpha-medium); border-radius: 16px;
  background-color: var(--surface-background);
  background-image: linear-gradient(var(--neutral-alpha-weak) 1px, transparent 1px), linear-gradient(90deg, var(--neutral-alpha-weak) 1px, transparent 1px);
  background-size: var(--m) var(--m);
}
.sw-fx {
  position: absolute; display: flex; align-items: center; justify-content: center; box-sizing: border-box;
  font-size: 11px; font-weight: 600; text-align: center; border-radius: 8px; pointer-events: none;
  color: var(--neutral-on-background-medium);
}
.sw-fx[data-kind="stage"] { background: var(--neutral-alpha-medium); border: 1px solid var(--neutral-alpha-strong); }
.sw-fx[data-kind="dancefloor"] { background: var(--brand-alpha-weak); border: 1px dashed var(--brand-alpha-strong); color: var(--brand-on-background-medium); }
.sw-fx[data-kind="bar"] { background: var(--accent-alpha-weak); border: 1px solid var(--accent-alpha-medium); }
.sw-fx[data-kind="door"] {
  background: var(--success-alpha-medium); border: 1px solid var(--success-alpha-strong); border-radius: 4px;
  writing-mode: vertical-rl; transform: rotate(180deg); font-size: 10px;
}
.sw-table { position: absolute; }
.sw-table-body {
  position: absolute; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 1px; padding: 0; font: inherit; font-size: 11px; line-height: 1.2; cursor: pointer;
  color: var(--neutral-on-background-strong); background: var(--neutral-alpha-weak); border: 2px solid var(--neutral-alpha-strong);
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
}
.sw-table-body[data-shape="round"] { border-radius: 50%; }
.sw-table-body[data-shape="long"] { border-radius: 10px; flex-direction: row; gap: 8px; }
.sw-table-body strong { font-weight: 600; }
.sw-table-body span { color: var(--neutral-on-background-weak); font-variant-numeric: tabular-nums; }
.sw-table-body:hover, .sw-table-body[data-target="true"] { background: var(--brand-alpha-weak); }
.sw-table-body[data-selected="true"] { border-color: var(--brand-solid-strong); box-shadow: 0 0 0 3px var(--brand-alpha-medium); }
.sw-table-body[data-broken="true"] { border-color: var(--danger-solid-strong); }
.sw-table-body[data-broken="true"][data-selected="true"] { box-shadow: 0 0 0 3px var(--danger-alpha-medium); }
.sw-flag {
  position: absolute; display: grid; place-items: center; width: 18px; height: 18px; border-radius: 50%;
  font-size: 11px; font-weight: 700; line-height: 1; color: var(--page-background); background: var(--danger-solid-strong); pointer-events: none;
}
[data-party="0"] { --pc: var(--brand-alpha-strong); }
[data-party="1"] { --pc: var(--accent-alpha-strong); }
[data-party="2"] { --pc: var(--info-alpha-strong); }
[data-party="3"] { --pc: var(--success-alpha-strong); }
[data-party="4"] { --pc: var(--warning-alpha-strong); }
[data-party="5"] { --pc: var(--danger-alpha-medium); }
[data-party="6"] { --pc: var(--neutral-alpha-strong); }
.sw-seat {
  position: absolute; box-sizing: border-box; display: grid; place-items: center; width: 28px; height: 28px; padding: 0;
  border-radius: 50%; font: inherit; font-size: 10px; font-weight: 700; cursor: pointer;
  color: var(--neutral-on-background-strong); background: var(--pc, var(--neutral-alpha-medium)); border: 1.5px solid var(--neutral-alpha-strong);
  transition: transform 0.12s, box-shadow 0.12s, background 0.12s;
}
.sw-seat:hover { transform: scale(1.12); }
.sw-seat[data-empty="true"] { background: transparent; border-style: dashed; color: var(--neutral-on-background-weak); font-weight: 500; }
.sw-seat[data-empty="true"]:hover, .sw-seat[data-target="true"] { background: var(--brand-alpha-weak); border-color: var(--brand-solid-strong); }
.sw-seat[data-held="true"] { box-shadow: 0 0 0 3px var(--brand-solid-strong); transform: scale(1.12); }
.sw-seat[data-broken="true"] { border-color: var(--danger-solid-strong); border-width: 2px; }
.sw-seat[data-diet="true"]::after {
  content: ""; position: absolute; top: -3px; right: -3px; width: 9px; height: 9px; border-radius: 50%;
  background: var(--warning-solid-strong); border: 1.5px solid var(--surface-background);
}
.sw-seat:focus-visible, .sw-table-body:focus-visible, .sw-chip:focus-visible, .sw-rowbtn:focus-visible {
  outline: 2px solid var(--brand-solid-strong); outline-offset: 2px;
}
.sw-chip {
  display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px 6px 6px; min-height: 40px; font: inherit; font-size: 13px;
  font-weight: 500; color: var(--neutral-on-background-strong); background: var(--neutral-alpha-weak);
  border: 1px solid var(--neutral-alpha-medium); border-radius: 999px; cursor: grab;
}
.sw-chip:hover { background: var(--neutral-alpha-medium); }
.sw-chip[data-held="true"] { background: var(--brand-alpha-weak); border-color: var(--brand-solid-strong); box-shadow: 0 0 0 2px var(--brand-alpha-medium); }
.sw-chip[data-diet="true"]::after { content: ""; width: 8px; height: 8px; border-radius: 50%; background: var(--warning-solid-strong); }
.sw-dot {
  display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; font-size: 10px; font-weight: 700;
  background: var(--pc, var(--neutral-alpha-medium));
}
.sw-pool[data-target="true"] { outline: 2px dashed var(--brand-solid-strong); outline-offset: -2px; }
.sw-legend-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: var(--pc, var(--neutral-alpha-strong)); }
.sw-rowbtn {
  display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; padding: 8px 10px; font: inherit; font-size: 13px;
  color: var(--neutral-on-background-strong); text-align: left; background: transparent; border: 1px solid var(--neutral-alpha-weak);
  border-radius: 10px; cursor: pointer;
}
.sw-rowbtn:hover { background: var(--neutral-alpha-weak); }
.sw-rowbtn[data-selected="true"] { border-color: var(--brand-solid-strong); background: var(--brand-alpha-weak); }
.sw-main { display: grid; grid-template-columns: minmax(0, 1fr) 22rem; gap: 16px; align-items: start; width: 100%; }
@media (max-width: 1100px) { .sw-main { grid-template-columns: minmax(0, 1fr); } }
@media (prefers-reduced-motion: reduce) { .sw-seat, .sw-table-body, .sw-chip { transition: none; } }
```

