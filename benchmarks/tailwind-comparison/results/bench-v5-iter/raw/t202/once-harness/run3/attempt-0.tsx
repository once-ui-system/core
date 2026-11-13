```tsx app/guests/page.tsx
import type { Metadata } from "next";
import { GuestsView } from "@/components/GuestsView";

export const metadata: Metadata = { title: "Guest list | Seatwise" };

export default function Page() {
  return <GuestsView />;
}
```

```tsx app/layout.tsx
import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "./fonts.css";

import type { Metadata } from "next";
import { Column, Flex } from "@once-ui-system/core";
import { AppFrame } from "@/components/AppFrame";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Seatwise: seating plans for weddings and events",
  description: "Build the seating plan for Ines & Mateo's wedding dinner.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="html" lang="en" suppressHydrationWarning>
      <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
        <Providers>
          <AppFrame>{children}</AppFrame>
        </Providers>
      </Column>
    </Flex>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { PlanView } from "@/components/PlanView";

export const metadata: Metadata = { title: "Seating plan | Seatwise" };

export default function Page() {
  return <PlanView />;
}
```

```tsx components/AppFrame.tsx
"use client";

import { Avatar, Column, Heading, Row, Text, ToggleButton, VisuallyHidden } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { APP_NAME, PLANNER, initials } from "@/lib/data";
import { PlanProvider } from "@/lib/PlanContext";

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <PlanProvider>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Column fillWidth>
        <Row
          as="header"
          fillWidth
          height="56"
          paddingX="16"
          gap="16"
          vertical="center"
          borderBottom
          background="surface"
        >
          <Row gap="8" vertical="center">
            <Row
              width="32"
              height="32"
              radius="m"
              background="brand-medium"
              center
              aria-hidden="true"
            >
              <Text textVariant="label-strong-m" onBackground="brand-strong">
                S
              </Text>
            </Row>
            <Heading as="p" textVariant="heading-strong-m">
              {APP_NAME}
            </Heading>
          </Row>
          <Row as="nav" aria-label="Main" gap="4" marginLeft="8">
            <ToggleButton
              href="/"
              label="Plan"
              prefixIcon="grid"
              selected={pathname === "/"}
              aria-current={pathname === "/" ? "page" : undefined}
            />
            <ToggleButton
              href="/guests"
              label="Guests"
              prefixIcon="people"
              selected={pathname === "/guests"}
              aria-current={pathname === "/guests" ? "page" : undefined}
            />
          </Row>
          <Row flex={1} />
          <Row gap="12" vertical="center">
            <Column gap="2" horizontal="end" s={{ hide: true }}>
              <Text textVariant="label-strong-s">{PLANNER.name}</Text>
              <Text textVariant="body-default-xs" onBackground="neutral-weak">
                Event planner
              </Text>
            </Column>
            <Avatar size="s" value={initials(PLANNER.name)} />
          </Row>
        </Row>
        <Column as="main" id="main" fillWidth horizontal="center">
          {children}
        </Column>
      </Column>
    </PlanProvider>
  );
}
```

```tsx components/FloorPlan.tsx
"use client";

import { Column, Row, Text, VisuallyHidden } from "@once-ui-system/core";
import { useState, type CSSProperties } from "react";
import { EVENT, FIXTURES, GUESTS, TABLES, initials, type Fixture } from "@/lib/data";
import { SEAT_D, tableGeo } from "@/lib/plan";
import { usePlan } from "@/lib/PlanContext";

const W = EVENT.room_m.width;
const D = EVENT.room_m.depth;
const GUEST_BY_ID = Object.fromEntries(GUESTS.map((x) => [x.id, x]));

const px = (m: number) => `${(m / W) * 100}%`;
const py = (m: number) => `${(m / D) * 100}%`;
const cq = (n: number): CSSProperties => ({ fontSize: `${n}cqw` });

function fixtureLook(kind: Fixture["kind"]) {
  switch (kind) {
    case "stage":
      return { background: "accent-alpha-medium", border: "accent-alpha-strong" } as const;
    case "dancefloor":
      return { background: "brand-alpha-weak", border: "brand-alpha-medium" } as const;
    case "bar":
      return { background: "warning-alpha-weak", border: "warning-alpha-medium" } as const;
    default:
      return { background: "success-alpha-medium", border: "success-alpha-strong" } as const;
  }
}

export function FloorPlan() {
  const { seatMap, armed, setArmed, selectedTable, selectTable, place, brokenTables, brokenGuests } =
    usePlan();
  const [over, setOver] = useState<string | null>(null);

  const onSeatClick = (tableId: string, index: number) => {
    const occupant = seatMap[tableId][index];
    if (armed) {
      if (occupant === armed) {
        setArmed(null);
        return;
      }
      place(armed, tableId, index);
      return;
    }
    selectTable(tableId);
    if (occupant) setArmed(occupant);
  };

  const onTableClick = (tableId: string) => {
    selectTable(tableId);
    if (armed) place(armed, tableId);
  };

  const dropOn = (guestId: string, tableId: string, index?: number) => {
    setOver(null);
    if (guestId && GUEST_BY_ID[guestId]) place(guestId, tableId, index);
  };

  return (
    <Row fillWidth overflowX="auto" radius="l" border background="surface" padding="8">
      <Column
        fillWidth
        position="relative"
        radius="m"
        overflow="hidden"
        background="neutral-alpha-weak"
        style={{
          aspectRatio: `${W} / ${D}`,
          minWidth: "40rem",
          containerType: "inline-size",
          backgroundImage:
            "linear-gradient(to right, var(--neutral-alpha-weak) 1px, transparent 1px), linear-gradient(to bottom, var(--neutral-alpha-weak) 1px, transparent 1px)",
          backgroundSize: `${100 / W}% ${100 / D}%`,
        }}
        role="group"
        aria-label={`Floor plan of ${EVENT.venue}, ${W} by ${D} metres`}
      >
        {FIXTURES.map((f) => {
          const look = fixtureLook(f.kind);
          return (
            <Column
              key={f.id}
              position="absolute"
              center
              background={look.background}
              border={look.border}
              borderStyle={f.kind === "dancefloor" ? "dashed" : "solid"}
              radius={f.kind === "door" ? "none" : "s"}
              pointerEvents="none"
              style={{ left: px(f.x), top: py(f.y), width: px(f.w), height: py(f.h) }}
            >
              <Text
                textVariant="label-strong-s"
                onBackground="neutral-medium"
                style={{
                  ...cq(f.kind === "door" ? 1.05 : 1.4),
                  writingMode: f.kind === "door" ? "vertical-rl" : undefined,
                  letterSpacing: "0.02em",
                }}
              >
                {f.label}
              </Text>
            </Column>
          );
        })}

        {TABLES.map((t) => {
          const geo = tableGeo(t);
          const occupants = seatMap[t.id];
          const filled = occupants.filter(Boolean).length;
          const broken = brokenTables.has(t.id);
          const selected = selectedTable === t.id;
          const dropKey = `${t.id}:body`;
          return (
            <Column key={t.id} position="absolute" top="0" left="0" fill pointerEvents="none">
              <Column
                as="button"
                type="button"
                position="absolute"
                center
                gap="2"
                radius={t.shape === "round" ? "full" : "m"}
                background={broken ? "danger-alpha-weak" : "surface"}
                border={broken ? "danger-strong" : selected ? "brand-strong" : "neutral-alpha-strong"}
                borderWidth={selected || broken ? 2 : 1}
                pointerEvents="auto"
                cursor="interactive"
                aria-pressed={selected}
                onClick={() => onTableClick(t.id)}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setOver(dropKey)}
                onDragLeave={() => setOver((o) => (o === dropKey ? null : o))}
                onDrop={(e) => {
                  e.preventDefault();
                  dropOn(e.dataTransfer.getData("text/plain"), t.id);
                }}
                style={{
                  left: px(geo.left),
                  top: py(geo.top),
                  width: px(geo.w),
                  height: py(geo.h),
                  outline: over === dropKey ? "3px solid var(--brand-solid-strong)" : undefined,
                  outlineOffset: 2,
                }}
              >
                <Text textVariant="label-strong-s" style={cq(1.35)}>
                  {t.name}
                </Text>
                <VisuallyHidden>{`, ${filled} of ${t.seats} seats filled${broken ? ", a rule is broken" : ""}`}</VisuallyHidden>
                <Text
                  textVariant="label-default-s"
                  onBackground={filled === t.seats ? "success-strong" : "neutral-weak"}
                  aria-hidden="true"
                  style={cq(1.2)}
                >
                  {filled}/{t.seats}
                </Text>
              </Column>

              {geo.seats.map((s, i) => {
                const gid = occupants[i];
                const guest = gid ? GUEST_BY_ID[gid] : null;
                const isArmed = gid !== null && gid === armed;
                const flagged = gid !== null && brokenGuests.has(gid);
                const key = `${t.id}:${i}`;
                const label = guest
                  ? `Seat ${i + 1} at ${t.name}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}`
                  : `Seat ${i + 1} at ${t.name}: empty`;
                return (
                  <Row
                    as="button"
                    type="button"
                    key={key}
                    position="absolute"
                    center
                    radius="full"
                    pointerEvents="auto"
                    cursor="interactive"
                    draggable={guest !== null}
                    title={label}
                    background={
                      isArmed ? "brand-medium" : guest ? "brand-alpha-medium" : "transparent"
                    }
                    border={
                      flagged
                        ? "danger-strong"
                        : isArmed
                          ? "brand-strong"
                          : guest
                            ? "brand-alpha-strong"
                            : "neutral-alpha-strong"
                    }
                    borderStyle={guest ? "solid" : "dashed"}
                    borderWidth={flagged || isArmed ? 2 : 1}
                    onClick={() => onSeatClick(t.id, i)}
                    onDragStart={(e) => {
                      if (!gid) return;
                      e.dataTransfer.setData("text/plain", gid);
                      e.dataTransfer.effectAllowed = "move";
                      setArmed(null);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={() => setOver(key)}
                    onDragLeave={() => setOver((o) => (o === key ? null : o))}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      dropOn(e.dataTransfer.getData("text/plain"), t.id, i);
                    }}
                    style={{
                      left: px(s.x - SEAT_D / 2),
                      top: py(s.y - SEAT_D / 2),
                      width: px(SEAT_D),
                      aspectRatio: "1 / 1",
                      outline: over === key ? "3px solid var(--brand-solid-strong)" : undefined,
                      outlineOffset: 1,
                    }}
                  >
                    <VisuallyHidden>{label}</VisuallyHidden>
                    {guest ? (
                      <Text textVariant="label-strong-s" aria-hidden="true" style={cq(1.15)}>
                        {initials(guest.name)}
                      </Text>
                    ) : null}
                    {guest?.diet ? (
                      <Row
                        position="absolute"
                        radius="full"
                        background="warning-strong"
                        pointerEvents="none"
                        style={{ right: "-6%", top: "-6%", width: "34%", aspectRatio: "1 / 1" }}
                        aria-hidden="true"
                      />
                    ) : null}
                  </Row>
                );
              })}
            </Column>
          );
        })}
      </Column>
    </Row>
  );
}
```

```tsx components/GuestsView.tsx
"use client";

import {
  Button,
  Column,
  Grid,
  Heading,
  Input,
  Row,
  Select,
  Table,
  Tag,
  Text,
  useToast,
} from "@once-ui-system/core";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { GUESTS, RSVP_LABEL, TABLES, type Guest, type Rsvp } from "@/lib/data";
import { usePlan } from "@/lib/PlanContext";

const STANDARD = "Standard menu";
const RSVP_TONE: Record<Rsvp, "success" | "warning" | "info" | "danger"> = {
  yes: "success",
  maybe: "warning",
  pending: "info",
  no: "danger",
};
const TABLE_NAME: Record<string, string> = Object.fromEntries(TABLES.map((t) => [t.id, t.name]));

type GuestRow = Guest & { tableName: string | null };
type MealRow = { meal: string; confirmed: number; possible: number };

const PARTIES = Array.from(new Set(GUESTS.map((x) => x.party)));
const DIETS = Array.from(new Set(GUESTS.map((x) => x.diet).filter((d): d is string => d !== null)));

const PARTY_OPTIONS = [
  { value: "all", label: "All parties" },
  ...PARTIES.map((p) => ({ value: p, label: p })),
];
const RSVP_OPTIONS = [
  { value: "all", label: "Any RSVP" },
  ...(["yes", "maybe", "pending", "no"] as Rsvp[]).map((r) => ({ value: r, label: RSVP_LABEL[r] })),
];
const DIET_OPTIONS = [
  { value: "all", label: "Any diet" },
  { value: "none", label: "No dietary need" },
  ...DIETS.map((d) => ({ value: d, label: d })),
];

export function GuestsView() {
  const { assign } = usePlan();
  const { addToast } = useToast();
  const [query, setQuery] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState("all");
  const [diet, setDiet] = useState("all");

  const rows: GuestRow[] = useMemo(
    () =>
      GUESTS.map((x) => {
        const seat = assign[x.id];
        return { ...x, tableName: seat ? (TABLE_NAME[seat.table] ?? seat.table) : null };
      }),
    [assign],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q)) return false;
      if (party !== "all" && r.party !== party) return false;
      if (rsvp !== "all" && r.rsvp !== rsvp) return false;
      if (diet === "none" && r.diet) return false;
      if (diet !== "all" && diet !== "none" && r.diet !== diet) return false;
      return true;
    });
  }, [rows, query, party, rsvp, diet]);

  const meals: MealRow[] = useMemo(() => {
    const map = new Map<string, MealRow>();
    for (const x of GUESTS) {
      if (x.rsvp === "no") continue;
      const meal = x.diet ?? STANDARD;
      const row = map.get(meal) ?? { meal, confirmed: 0, possible: 0 };
      if (x.rsvp === "yes") row.confirmed += 1;
      else row.possible += 1;
      map.set(meal, row);
    }
    const list = Array.from(map.values());
    list.sort((a, b) => {
      if (a.meal === STANDARD) return -1;
      if (b.meal === STANDARD) return 1;
      return b.confirmed - a.confirmed || a.meal.localeCompare(b.meal);
    });
    return list;
  }, []);

  const confirmedTotal = meals.reduce((s, m) => s + m.confirmed, 0);
  const possibleTotal = meals.reduce((s, m) => s + m.possible, 0);
  const filtersOn = query !== "" || party !== "all" || rsvp !== "all" || diet !== "all";

  const clear = () => {
    setQuery("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
  };

  const copyMeals = async () => {
    const text = [
      "Meal counts for the caterer (confirmed / maybe or awaiting reply)",
      ...meals.map((m) => `${m.meal}: ${m.confirmed} / ${m.possible}`),
      `Total: ${confirmedTotal} / ${possibleTotal}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      addToast({ tone: "success", message: "Meal counts copied" });
    } catch {
      addToast({ tone: "warning", message: "Copying is not available in this browser" });
    }
  };

  return (
    <Column fillWidth maxWidth="xl" paddingX="16" paddingY="24" gap="20">
      <PageHeader title="Guest list" />

      <Row fillWidth gap="24" vertical="start" m={{ direction: "column" }}>
        <Column flex={1} fillWidth gap="16" style={{ minWidth: 0 }}>
          <Column background="surface" border radius="l" padding="16" gap="12">
            <Grid columns="4" m={{ columns: "2" }} s={{ columns: "1" }} gap="12" fillWidth>
              <Input
                id="guest-search"
                label="Search guests"
                size="xs"
                value={query}
                onValueChange={setQuery}
              />
              <Select
                id="filter-party"
                label="Party"
                size="xs"
                options={PARTY_OPTIONS}
                value={party}
                onValueChange={(v) => setParty(String(v))}
              />
              <Select
                id="filter-rsvp"
                label="RSVP"
                size="xs"
                options={RSVP_OPTIONS}
                value={rsvp}
                onValueChange={(v) => setRsvp(String(v))}
              />
              <Select
                id="filter-diet"
                label="Diet"
                size="xs"
                options={DIET_OPTIONS}
                value={diet}
                onValueChange={(v) => setDiet(String(v))}
              />
            </Grid>
            <Row gap="12" vertical="center" wrap>
              <Text role="status" aria-live="polite" textVariant="body-default-s" onBackground="neutral-weak">
                Showing {filtered.length} of {GUESTS.length} guests
              </Text>
              {filtersOn ? (
                <Button variant="tertiary" size="s" prefixIcon="close" onClick={clear}>
                  Clear filters
                </Button>
              ) : null}
            </Row>
          </Column>

          <Table<GuestRow>
            aria-label="Guest list"
            rows={filtered}
            getRowId={(r) => r.id}
            stickyHeader
            defaultSort={{ key: "name", direction: "asc" }}
            emptyState={
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                No guests match these filters.
              </Text>
            }
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
                cell: (r) => <Tag size="s" tone={RSVP_TONE[r.rsvp]} label={RSVP_LABEL[r.rsvp]} />,
              },
              {
                key: "diet",
                header: "Diet",
                sortable: true,
                sort: (a, b) => (a.diet ?? "").localeCompare(b.diet ?? ""),
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
                sort: (a, b) => (a.tableName ?? "~").localeCompare(b.tableName ?? "~"),
                cell: (r) =>
                  r.tableName ? (
                    <Text textVariant="body-default-s">{r.tableName}</Text>
                  ) : r.rsvp === "no" ? (
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      Not needed
                    </Text>
                  ) : (
                    <Tag size="s" tone="neutral" label="Not seated" />
                  ),
              },
            ]}
          />
        </Column>

        <Column gap="12" m={{ fillWidth: true }} style={{ width: "24rem", flexShrink: 0 }}>
          <Column background="surface" border radius="l" padding="16" gap="12">
            <Row vertical="center" gap="8">
              <Heading as="h2" textVariant="heading-strong-m" flex={1}>
                Meals for the caterer
              </Heading>
              <Button variant="secondary" size="s" prefixIcon="copy" onClick={copyMeals}>
                Copy
              </Button>
            </Row>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              Confirmed guests, with maybes and unanswered invitations counted separately. Declined
              guests are left out.
            </Text>
            <Table<MealRow>
              aria-label="Meal counts"
              rows={meals}
              getRowId={(r) => r.meal}
              compact
              columns={[
                {
                  key: "meal",
                  header: "Meal",
                  cell: (r) => <Text textVariant="label-strong-s">{r.meal}</Text>,
                },
                {
                  key: "confirmed",
                  header: "Confirmed",
                  align: "right",
                  cell: (r) => <Text textVariant="label-strong-s">{r.confirmed}</Text>,
                },
                {
                  key: "possible",
                  header: "Maybe",
                  align: "right",
                  cell: (r) => (
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {r.possible}
                    </Text>
                  ),
                },
              ]}
            />
            <Row
              fillWidth
              paddingX="12"
              paddingY="8"
              radius="m"
              background="brand-alpha-weak"
              vertical="center"
              gap="8"
            >
              <Text textVariant="label-strong-s" flex={1}>
                Total meals
              </Text>
              <Text textVariant="label-strong-s">{confirmedTotal} confirmed</Text>
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                + {possibleTotal} maybe
              </Text>
            </Row>
          </Column>
        </Column>
      </Row>
    </Column>
  );
}
```

```tsx components/PageHeader.tsx
import { Column, Heading, Row, Text } from "@once-ui-system/core";
import type { ReactNode } from "react";
import { EVENT, formatEventDate } from "@/lib/data";

export function PageHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <Row fillWidth gap="16" vertical="end" wrap>
      <Column flex={1} gap="4" style={{ minWidth: "16rem" }}>
        <Text textVariant="label-default-s" onBackground="brand-medium">
          {EVENT.name}
        </Text>
        <Heading as="h1" textVariant="display-strong-xs">
          {title}
        </Heading>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          {formatEventDate(EVENT.date)} at {EVENT.venue}
        </Text>
      </Column>
      {actions}
    </Row>
  );
}
```

```tsx components/PlanView.tsx
"use client";

import { Button, Column, Grid, Heading, Icon, IconButton, Row, Tag, Text } from "@once-ui-system/core";
import { FloorPlan } from "@/components/FloorPlan";
import { PageHeader } from "@/components/PageHeader";
import { GUESTS, TABLES, initials, type Guest } from "@/lib/data";
import { dietSummary, type RuleState } from "@/lib/plan";
import { usePlan } from "@/lib/PlanContext";

const GUEST_BY_ID: Record<string, Guest> = Object.fromEntries(GUESTS.map((x) => [x.id, x]));

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "danger" | "success";
}) {
  return (
    <Column background="surface" border radius="l" padding="16" gap="4">
      <Text textVariant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Heading
        as="p"
        textVariant="display-strong-xs"
        onBackground={tone ? `${tone}-strong` : undefined}
      >
        {value}
      </Heading>
      <Text textVariant="body-default-xs" onBackground="neutral-weak">
        {hint}
      </Text>
    </Column>
  );
}

function DietTag({ diet }: { diet: string }) {
  return <Tag size="s" tone="warning" label={diet} />;
}

function GuestChip({ guest }: { guest: Guest }) {
  const { armed, setArmed } = usePlan();
  const isArmed = armed === guest.id;
  return (
    <Row
      as="button"
      type="button"
      draggable
      fillWidth
      gap="12"
      padding="8"
      paddingX="12"
      vertical="center"
      radius="m"
      align="left"
      cursor="interactive"
      background={isArmed ? "brand-alpha-weak" : "surface"}
      border={isArmed ? "brand-strong" : true}
      aria-pressed={isArmed}
      onClick={() => setArmed(isArmed ? null : guest.id)}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", guest.id);
        e.dataTransfer.effectAllowed = "move";
        setArmed(null);
      }}
    >
      <Row
        width="32"
        height="32"
        radius="full"
        background="neutral-alpha-weak"
        center
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <Text textVariant="label-strong-s">{initials(guest.name)}</Text>
      </Row>
      <Column flex={1} gap="2" style={{ minWidth: 0 }}>
        <Text textVariant="label-strong-s">{guest.name}</Text>
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          {guest.party}
        </Text>
      </Column>
      {guest.diet ? <DietTag diet={guest.diet} /> : null}
    </Row>
  );
}

function UnseatedCard() {
  const { assign, counts, unseat, armed } = usePlan();
  const attending = GUESTS.filter((x) => x.rsvp === "yes" && !assign[x.id]);
  const possible = GUESTS.filter(
    (x) => (x.rsvp === "maybe" || x.rsvp === "pending") && !assign[x.id],
  );
  return (
    <Column
      background="surface"
      border
      radius="l"
      padding="16"
      gap="12"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");
        if (id && assign[id]) unseat(id);
      }}
    >
      <Row vertical="center" gap="8">
        <Heading as="h2" textVariant="heading-strong-m">
          Still to seat
        </Heading>
        <Tag size="s" tone={counts.unseated ? "warning" : "success"} label={String(counts.unseated)} />
      </Row>
      <Text textVariant="body-default-s" onBackground="neutral-weak">
        {armed
          ? "Now tap a seat or a table. Tap the guest again to cancel."
          : "Drag a guest onto a seat, or tap a guest and then a seat."}
      </Text>
      {attending.length === 0 ? (
        <Row
          fillWidth
          padding="16"
          radius="m"
          border="success-alpha-medium"
          background="success-alpha-weak"
          gap="8"
          vertical="center"
        >
          <Icon name="check" onBackground="success-strong" />
          <Text textVariant="body-default-s">Every attending guest has a seat.</Text>
        </Row>
      ) : (
        <Column as="ul" gap="8" margin="0" padding="0" aria-label="Attending guests without a seat">
          {attending.map((guest) => (
            <li key={guest.id} style={{ listStyle: "none" }}>
              <GuestChip guest={guest} />
            </li>
          ))}
        </Column>
      )}
      {possible.length > 0 ? (
        <Column gap="8">
          <Text textVariant="label-default-s" onBackground="neutral-weak">
            Not confirmed yet ({possible.length})
          </Text>
          <Column as="ul" gap="8" margin="0" padding="0" aria-label="Guests who have not confirmed">
            {possible.map((guest) => (
              <li key={guest.id} style={{ listStyle: "none" }}>
                <Row gap="8" vertical="center">
                  <Column flex={1} style={{ minWidth: 0 }}>
                    <GuestChip guest={guest} />
                  </Column>
                  <Tag size="s" tone="info" label={guest.rsvp === "maybe" ? "Maybe" : "Pending"} />
                </Row>
              </li>
            ))}
          </Column>
        </Column>
      ) : null}
      {armed && assign[armed] ? (
        <Button
          variant="secondary"
          size="s"
          prefixIcon="personRemove"
          fillWidth
          onClick={() => unseat(armed)}
        >
          Unseat {GUEST_BY_ID[armed]?.name}
        </Button>
      ) : null}
    </Column>
  );
}

function TableCard() {
  const { selectedTable, seatMap, armed, place, unseat, setArmed, brokenTables, rules } = usePlan();
  const table = TABLES.find((t) => t.id === selectedTable);
  if (!table) {
    return (
      <Column background="surface" border radius="l" padding="16" gap="8">
        <Heading as="h2" textVariant="heading-strong-m">
          Table details
        </Heading>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Select a table on the plan to see who sits there and what they eat.
        </Text>
      </Column>
    );
  }
  const seats = seatMap[table.id];
  const filled = seats.filter(Boolean).length;
  const diets = dietSummary(seats);
  const flagged = rules.filter((r) => r.state === "broken" && r.tables.includes(table.id));
  return (
    <Column background="surface" border radius="l" padding="16" gap="12">
      <Row vertical="center" gap="8" wrap>
        <Heading as="h2" textVariant="heading-strong-m">
          {table.name}
        </Heading>
        <Tag size="s" tone={filled === table.seats ? "success" : "neutral"} label={`${filled} of ${table.seats} seated`} />
        {brokenTables.has(table.id) ? (
          <Tag size="s" tone="danger" prefixIcon="warning" label="Rule broken" />
        ) : null}
      </Row>
      {flagged.map((r) => (
        <Row
          key={r.index}
          gap="8"
          padding="12"
          radius="m"
          background="danger-alpha-weak"
          border="danger-alpha-medium"
        >
          <Icon name="warning" onBackground="danger-strong" />
          <Text textVariant="body-default-s">{r.message}</Text>
        </Row>
      ))}
      <Text textVariant="body-default-s" onBackground="neutral-weak">
        {diets.length
          ? `Dietary needs: ${diets.map((d) => `${d.count} ${d.diet}`).join(", ")}`
          : "No dietary needs at this table."}
      </Text>
      <Column as="ul" gap="4" margin="0" padding="0" aria-label={`Seats at ${table.name}`}>
        {seats.map((gid, i) => {
          const guest = gid ? GUEST_BY_ID[gid] : null;
          return (
            <li key={`${table.id}-${i}`} style={{ listStyle: "none" }}>
              {guest ? (
                <Row gap="8" vertical="center" paddingY="4">
                  <Text textVariant="label-default-s" onBackground="neutral-weak" style={{ width: "1.25rem" }}>
                    {i + 1}
                  </Text>
                  <Column
                    as="button"
                    type="button"
                    flex={1}
                    gap="2"
                    align="left"
                    cursor="interactive"
                    aria-pressed={armed === guest.id}
                    onClick={() => setArmed(armed === guest.id ? null : guest.id)}
                    style={{ minWidth: 0 }}
                  >
                    <Text textVariant="label-strong-s" onBackground={armed === guest.id ? "brand-strong" : undefined}>
                      {guest.name}
                    </Text>
                    <Text textVariant="body-default-xs" onBackground="neutral-weak">
                      {guest.party}
                    </Text>
                  </Column>
                  {guest.diet ? <DietTag diet={guest.diet} /> : null}
                  <IconButton
                    icon="personRemove"
                    variant="tertiary"
                    size="s"
                    tooltip="Unseat"
                    aria-label={`Unseat ${guest.name}`}
                    onClick={() => unseat(guest.id)}
                  />
                </Row>
              ) : (
                <Row
                  as="button"
                  type="button"
                  fillWidth
                  gap="8"
                  vertical="center"
                  padding="8"
                  radius="s"
                  border
                  borderStyle="dashed"
                  cursor="interactive"
                  align="left"
                  onClick={() => armed && place(armed, table.id, i)}
                >
                  <Text textVariant="label-default-s" onBackground="neutral-weak" style={{ width: "1.25rem" }}>
                    {i + 1}
                  </Text>
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    Empty seat
                  </Text>
                </Row>
              )}
            </li>
          );
        })}
      </Column>
      {armed && seats.some((s) => s === null) && !seats.includes(armed) ? (
        <Button size="s" prefixIcon="plus" onClick={() => place(armed, table.id)}>
          Seat {GUEST_BY_ID[armed]?.name} here
        </Button>
      ) : null}
    </Column>
  );
}

const STATE_LOOK: Record<RuleState, { icon: "check" | "warning" | "time"; tone: "success" | "danger" | "warning"; label: string }> = {
  ok: { icon: "check", tone: "success", label: "Kept" },
  broken: { icon: "warning", tone: "danger", label: "Broken" },
  pending: { icon: "time", tone: "warning", label: "Waiting" },
};

function RulesCard() {
  const { rules, counts, selectTable } = usePlan();
  return (
    <Column background="surface" border radius="l" padding="16" gap="12">
      <Row vertical="center" gap="8" wrap>
        <Heading as="h2" textVariant="heading-strong-m">
          The couple&apos;s rules
        </Heading>
        <Tag
          size="s"
          tone={counts.broken ? "danger" : "success"}
          label={counts.broken ? `${counts.broken} broken` : "All kept"}
        />
        {counts.pending ? <Tag size="s" tone="warning" label={`${counts.pending} waiting`} /> : null}
      </Row>
      <Column as="ul" gap="8" margin="0" padding="0" aria-label="Seating rules">
        {rules.map((r) => {
          const look = STATE_LOOK[r.state];
          return (
            <li key={r.index} style={{ listStyle: "none" }}>
              <Row
                as="button"
                type="button"
                fillWidth
                gap="12"
                padding="12"
                radius="m"
                align="left"
                cursor="interactive"
                background={r.state === "broken" ? "danger-alpha-weak" : "transparent"}
                border={r.state === "broken" ? "danger-alpha-medium" : true}
                onClick={() => r.tables[0] && selectTable(r.tables[0])}
              >
                <Icon name={look.icon} onBackground={`${look.tone}-strong`} />
                <Column flex={1} gap="2" style={{ minWidth: 0 }}>
                  <Row gap="8" vertical="center" wrap>
                    <Text textVariant="label-strong-s">{r.title}</Text>
                    <Tag size="s" tone={look.tone} label={look.label} />
                  </Row>
                  <Text textVariant="body-default-s">{r.message}</Text>
                  <Text textVariant="body-default-xs" onBackground="neutral-weak">
                    {r.note}
                  </Text>
                </Column>
              </Row>
            </li>
          );
        })}
      </Column>
    </Column>
  );
}

export function PlanView() {
  const { counts, seatMap, selectedTable, selectTable, reset, status, brokenTables, armed, setArmed } =
    usePlan();
  return (
    <Column fillWidth maxWidth="xl" paddingX="16" paddingY="24" gap="20">
      <PageHeader
        title="Seating plan"
        actions={
          <Button variant="secondary" size="s" prefixIcon="refresh" onClick={reset}>
            Reset plan
          </Button>
        }
      />
      <Grid columns="4" s={{ columns: "2" }} gap="12" fillWidth>
        <Stat
          label="Seated"
          value={String(counts.seated)}
          hint={`of ${counts.attending} attending guests`}
        />
        <Stat
          label="Unseated"
          value={String(counts.unseated)}
          hint="attending, still to place"
          tone={counts.unseated ? undefined : "success"}
        />
        <Stat label="Free seats" value={String(counts.freeSeats)} hint={`of ${counts.totalSeats} seats`} />
        <Stat
          label="Rules"
          value={counts.broken ? `${counts.broken} broken` : "All kept"}
          hint={counts.pending ? `${counts.pending} waiting on a seat` : "checked as you work"}
          tone={counts.broken ? "danger" : "success"}
        />
      </Grid>
      <Row fillWidth gap="24" vertical="start" m={{ direction: "column" }}>
        <Column flex={1} fillWidth gap="12" style={{ minWidth: 0 }}>
          <Row gap="8" wrap role="group" aria-label="Tables">
            {TABLES.map((t) => {
              const filled = seatMap[t.id].filter(Boolean).length;
              return (
                <Tag
                  key={t.id}
                  interactive
                  size="m"
                  selected={selectedTable === t.id}
                  tone={brokenTables.has(t.id) ? "danger" : "neutral"}
                  prefixIcon={brokenTables.has(t.id) ? "warning" : undefined}
                  label={`${t.name} ${filled}/${t.seats}`}
                  onClick={() => selectTable(t.id)}
                />
              );
            })}
          </Row>
          <Row
            fillWidth
            gap="12"
            vertical="center"
            paddingX="12"
            paddingY="8"
            radius="m"
            background={armed ? "brand-alpha-weak" : "transparent"}
            border={armed ? "brand-alpha-medium" : "transparent"}
            minHeight="40"
          >
            <Icon name={armed ? "arrowRight" : "info"} onBackground="neutral-weak" size="s" />
            <Text role="status" aria-live="polite" textVariant="body-default-s" style={{ flex: 1 }}>
              {status || "Drag guests between seats, or tap a guest and then a seat. Dotted seats are empty."}
            </Text>
            {armed ? (
              <Button variant="tertiary" size="s" onClick={() => setArmed(null)}>
                Cancel
              </Button>
            ) : null}
          </Row>
          <FloorPlan />
          <Row gap="16" wrap paddingX="4">
            <Row gap="8" vertical="center">
              <Row width="12" height="12" radius="full" border borderStyle="dashed" aria-hidden="true" />
              <Text textVariant="body-default-xs" onBackground="neutral-weak">
                Empty seat
              </Text>
            </Row>
            <Row gap="8" vertical="center">
              <Row width="12" height="12" radius="full" background="warning-strong" aria-hidden="true" />
              <Text textVariant="body-default-xs" onBackground="neutral-weak">
                Dietary need
              </Text>
            </Row>
            <Row gap="8" vertical="center">
              <Row width="12" height="12" radius="full" border="danger-strong" borderWidth={2} aria-hidden="true" />
              <Text textVariant="body-default-xs" onBackground="neutral-weak">
                Guest in a broken rule
              </Text>
            </Row>
          </Row>
        </Column>
        <Column gap="16" m={{ fillWidth: true }} style={{ width: "22rem", flexShrink: 0 }}>
          <TableCard />
          <UnseatedCard />
          <RulesCard />
        </Column>
      </Row>
    </Column>
  );
}
```

```tsx lib/PlanContext.tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { GUESTS, TABLES, type Guest, type TableDef } from "./data";
import {
  buildSeatMap,
  evaluateRules,
  initialAssignment,
  type Assignment,
  type RuleResult,
} from "./plan";

const GUEST_BY_ID: Record<string, Guest> = Object.fromEntries(GUESTS.map((x) => [x.id, x]));
const TABLE_BY_ID: Record<string, TableDef> = Object.fromEntries(TABLES.map((x) => [x.id, x]));

type PlanContextValue = {
  assign: Assignment;
  seatMap: Record<string, (string | null)[]>;
  rules: RuleResult[];
  brokenTables: Set<string>;
  brokenGuests: Set<string>;
  armed: string | null;
  setArmed: (id: string | null) => void;
  selectedTable: string | null;
  selectTable: (id: string | null) => void;
  place: (guestId: string, tableId: string, seatIndex?: number) => boolean;
  unseat: (guestId: string) => void;
  reset: () => void;
  status: string;
  counts: {
    attending: number;
    seated: number;
    unseated: number;
    freeSeats: number;
    totalSeats: number;
    possibleUnseated: number;
    broken: number;
    pending: number;
  };
};

const PlanContext = createContext<PlanContextValue | null>(null);

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [assign, setAssign] = useState<Assignment>(() => initialAssignment());
  const [armed, setArmedState] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>("t-1");
  const [status, setStatus] = useState("");

  const seatMap = useMemo(() => buildSeatMap(assign), [assign]);
  const rules = useMemo(() => evaluateRules(assign), [assign]);

  const brokenTables = useMemo(() => {
    const set = new Set<string>();
    for (const r of rules) if (r.state === "broken") for (const t of r.tables) set.add(t);
    return set;
  }, [rules]);

  const brokenGuests = useMemo(() => {
    const set = new Set<string>();
    for (const r of rules) if (r.state === "broken") for (const gid of r.guests) set.add(gid);
    return set;
  }, [rules]);

  const counts = useMemo(() => {
    const attendingGuests = GUESTS.filter((x) => x.rsvp === "yes");
    const seated = Object.values(assign).filter((s) => s !== null).length;
    const unseated = attendingGuests.filter((x) => !assign[x.id]).length;
    const possibleUnseated = GUESTS.filter(
      (x) => (x.rsvp === "maybe" || x.rsvp === "pending") && !assign[x.id],
    ).length;
    const totalSeats = TABLES.reduce((sum, t) => sum + t.seats, 0);
    return {
      attending: attendingGuests.length,
      seated,
      unseated,
      freeSeats: totalSeats - seated,
      totalSeats,
      possibleUnseated,
      broken: rules.filter((r) => r.state === "broken").length,
      pending: rules.filter((r) => r.state === "pending").length,
    };
  }, [assign, rules]);

  const setArmed = useCallback((id: string | null) => {
    setArmedState(id);
    if (id) setStatus(`${GUEST_BY_ID[id]?.name ?? "Guest"} selected. Choose a seat or a table.`);
  }, []);

  const selectTable = useCallback((id: string | null) => setSelectedTable(id), []);

  const place = useCallback(
    (guestId: string, tableId: string, seatIndex?: number): boolean => {
      const guest = GUEST_BY_ID[guestId];
      const table = TABLE_BY_ID[tableId];
      if (!guest || !table) return false;
      if (guest.rsvp === "no") {
        setStatus(`${guest.name} has declined and cannot be seated.`);
        return false;
      }
      const occupants = seatMap[tableId];
      const current = assign[guestId] ?? null;
      let target = seatIndex;
      if (target === undefined) {
        if (current && current.table === tableId) {
          setStatus(`${guest.name} is already at ${table.name}.`);
          setArmedState(null);
          return true;
        }
        target = occupants.findIndex((o) => o === null);
        if (target < 0) {
          setStatus(`${table.name} is full. Pick another table or free a seat.`);
          return false;
        }
      }
      const other = occupants[target];
      if (other === guestId) {
        setArmedState(null);
        return true;
      }
      if (other && !current) {
        setStatus(
          `That seat is taken by ${GUEST_BY_ID[other]?.name ?? "another guest"}. Choose an empty seat.`,
        );
        return false;
      }
      setAssign((prev) => {
        const next = { ...prev };
        if (other && current) next[other] = { table: current.table, seat: current.seat };
        next[guestId] = { table: tableId, seat: target };
        return next;
      });
      setArmedState(null);
      setSelectedTable(tableId);
      setStatus(
        other
          ? `${guest.name} and ${GUEST_BY_ID[other]?.name ?? "guest"} swapped seats.`
          : `${guest.name} seated at ${table.name}, seat ${target + 1}.`,
      );
      return true;
    },
    [assign, seatMap],
  );

  const unseat = useCallback((guestId: string) => {
    setAssign((prev) => ({ ...prev, [guestId]: null }));
    setArmedState(null);
    setStatus(`${GUEST_BY_ID[guestId]?.name ?? "Guest"} is unseated.`);
  }, []);

  const reset = useCallback(() => {
    setAssign(initialAssignment());
    setArmedState(null);
    setStatus("Plan reset to the starting arrangement.");
  }, []);

  const value = useMemo<PlanContextValue>(
    () => ({
      assign,
      seatMap,
      rules,
      brokenTables,
      brokenGuests,
      armed,
      setArmed,
      selectedTable,
      selectTable,
      place,
      unseat,
      reset,
      status,
      counts,
    }),
    [
      assign,
      seatMap,
      rules,
      brokenTables,
      brokenGuests,
      armed,
      setArmed,
      selectedTable,
      selectTable,
      place,
      unseat,
      reset,
      status,
      counts,
    ],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
```

```ts lib/data.ts
export type Rsvp = "yes" | "maybe" | "no" | "pending";

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

export const APP_NAME = "Seatwise";

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

const g = (
  id: string,
  name: string,
  party: string,
  rsvp: Rsvp,
  diet: string | null,
  table: string | null,
): Guest => ({ id, name, party, rsvp, diet, table });

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
  { kind: "together", guests: ["g-21", "g-22"], note: "Couple" },
  { kind: "together", guests: ["g-32", "g-33"], note: "Siblings, under 10" },
  // The brief's note names Sean and Ryan Doyle (g-30, g-31); the ids follow the note.
  {
    kind: "apart",
    guests: ["g-30", "g-31"],
    note: "Brothers Sean and Ryan Doyle are not speaking",
  },
  { kind: "apart", guests: ["g-12", "g-34"], note: "Ask the couple: old family dispute" },
  {
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
  },
];

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Awaiting reply",
  no: "Declined",
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function formatEventDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}
```

```ts lib/plan.ts
import { FIXTURES, GUESTS, RULES, TABLES, type Guest, type Rule, type TableDef } from "./data";

export const SEAT_D = 0.85;
export const NEAR_DOOR_MAX_M = 4;
export const AWAY_BAND_MIN_M = 8;

export type Seat = { table: string; seat: number };
export type Assignment = Record<string, Seat | null>;

const HEAD_ORDER = [3, 4, 2, 5, 1, 6, 0, 7];

export function initialAssignment(): Assignment {
  const next: Record<string, number> = {};
  const out: Assignment = {};
  for (const guest of GUESTS) {
    if (!guest.table) {
      out[guest.id] = null;
      continue;
    }
    const i = next[guest.table] ?? 0;
    next[guest.table] = i + 1;
    const seat = guest.table === "t-head" ? (HEAD_ORDER[i] ?? i) : i;
    out[guest.id] = { table: guest.table, seat };
  }
  return out;
}

export type TableGeo = {
  cx: number;
  cy: number;
  left: number;
  top: number;
  w: number;
  h: number;
  seats: { x: number; y: number }[];
};

export function tableGeo(t: TableDef): TableGeo {
  if (t.shape === "long") {
    const w = t.seats;
    const h = 1.1;
    return {
      cx: t.x + w / 2,
      cy: t.y + h / 2,
      left: t.x,
      top: t.y,
      w,
      h,
      seats: Array.from({ length: t.seats }, (_, i) => ({ x: t.x + 0.5 + i, y: t.y - 0.55 })),
    };
  }
  const r = t.seats > 6 ? 1 : 0.85;
  const ring = r + 0.45;
  return {
    cx: t.x,
    cy: t.y,
    left: t.x - r,
    top: t.y - r,
    w: r * 2,
    h: r * 2,
    seats: Array.from({ length: t.seats }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
      return { x: t.x + ring * Math.cos(a), y: t.y + ring * Math.sin(a) };
    }),
  };
}

export function buildSeatMap(assign: Assignment): Record<string, (string | null)[]> {
  const map: Record<string, (string | null)[]> = {};
  for (const t of TABLES) map[t.id] = Array.from({ length: t.seats }, () => null);
  for (const [guestId, seat] of Object.entries(assign)) {
    if (seat && map[seat.table]) map[seat.table][seat.seat] = guestId;
  }
  return map;
}

export type RuleState = "ok" | "pending" | "broken";

export type RuleResult = {
  index: number;
  kind: Rule["kind"];
  title: string;
  state: RuleState;
  message: string;
  note: string;
  tables: string[];
  guests: string[];
};

const GUEST_BY_ID: Record<string, Guest> = Object.fromEntries(GUESTS.map((x) => [x.id, x]));
const TABLE_BY_ID: Record<string, TableDef> = Object.fromEntries(TABLES.map((x) => [x.id, x]));

function distance(t: TableDef, kind: "door" | "stage"): number {
  const f = FIXTURES.find((x) => x.kind === kind);
  if (!f) return 0;
  const geo = tableGeo(t);
  return Math.hypot(geo.cx - (f.x + f.w / 2), geo.cy - (f.y + f.h / 2));
}

const m1 = (n: number) => `${n.toFixed(1)} m`;

export function evaluateRules(assign: Assignment): RuleResult[] {
  return RULES.map((rule, index) => {
    const names = rule.guests.map((id) => GUEST_BY_ID[id]?.name ?? id);
    const seats = rule.guests.map((id) => assign[id] ?? null);
    const base = { index, kind: rule.kind, note: rule.note, guests: rule.guests };
    const tableName = (s: Seat | null) => (s ? (TABLE_BY_ID[s.table]?.name ?? s.table) : "");
    const placed = seats.filter((s): s is Seat => s !== null);

    if (rule.kind === "together") {
      const title = "Keep together";
      if (placed.length < seats.length) {
        const missing = names.filter((_, i) => !seats[i]);
        return {
          ...base,
          title,
          state: "pending" as RuleState,
          message: `Waiting for a seat: ${missing.join(", ")}`,
          tables: placed.map((s) => s.table),
        };
      }
      const same = placed.every((s) => s.table === placed[0].table);
      return {
        ...base,
        title,
        state: (same ? "ok" : "broken") as RuleState,
        message: same
          ? `${names.join(" and ")} share ${tableName(placed[0])}`
          : names.map((n, i) => `${n} is at ${tableName(seats[i])}`).join("; "),
        tables: Array.from(new Set(placed.map((s) => s.table))),
      };
    }

    if (rule.kind === "apart") {
      const title = "Keep apart";
      const tables = Array.from(new Set(placed.map((s) => s.table)));
      const clash = placed.length === seats.length && tables.length < placed.length;
      if (clash) {
        return {
          ...base,
          title,
          state: "broken" as RuleState,
          message: `${names.join(" and ")} are both at ${tableName(placed[0])}`,
          tables,
        };
      }
      return {
        ...base,
        title,
        state: "ok" as RuleState,
        message:
          placed.length === seats.length
            ? `${names[0]} at ${tableName(seats[0])}, ${names[1]} at ${tableName(seats[1])}`
            : `${names.filter((_, i) => seats[i]).join(", ") || "Neither guest"} seated, no clash`,
        tables,
      };
    }

    const title = "Seat near the garden doors";
    const seat = seats[0];
    if (!seat) {
      return {
        ...base,
        title,
        state: "pending" as RuleState,
        message: `Waiting for a seat: ${names[0]}`,
        tables: [],
      };
    }
    const table = TABLE_BY_ID[seat.table];
    const door = distance(table, "door");
    const band = distance(table, "stage");
    const problems: string[] = [];
    if (door > NEAR_DOOR_MAX_M) {
      problems.push(`${m1(door)} from the garden doors (needs ${NEAR_DOOR_MAX_M} m or less)`);
    }
    if (band < AWAY_BAND_MIN_M) {
      problems.push(`only ${m1(band)} from the band (needs ${AWAY_BAND_MIN_M} m or more)`);
    }
    return {
      ...base,
      title,
      state: (problems.length ? "broken" : "ok") as RuleState,
      message: problems.length
        ? `${table.name} is ${problems.join(" and ")}`
        : `${table.name} is ${m1(door)} from the garden doors and ${m1(band)} from the band`,
      tables: [seat.table],
    };
  });
}

export function dietSummary(ids: (string | null)[]): { diet: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const id of ids) {
    const diet = id ? GUEST_BY_ID[id]?.diet : null;
    if (diet) counts.set(diet, (counts.get(diet) ?? 0) + 1);
  }
  return Array.from(counts, ([diet, count]) => ({ diet, count }));
}
```

