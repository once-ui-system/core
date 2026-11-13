```tsx src/app/guests/page.tsx
"use client";

import { Button, Column, Grid, Heading, Input, Row, Select, Tag, Text } from "@once-ui-system/core";
import { useMemo, useState } from "react";
import { guests, rsvpLabel, type Rsvp } from "@/lib/data";
import { tableById, usePlan } from "@/lib/plan";

const parties = [...new Set(guests.map((g) => g.party))];
const diets = [...new Set(guests.map((g) => g.diet).filter((d): d is string => !!d))].sort();
const STANDARD = "Standard menu";

const rsvpTone: Record<Rsvp, "success" | "warning" | "neutral" | "danger"> = {
  yes: "success",
  maybe: "warning",
  pending: "neutral",
  no: "danger",
};

export default function GuestsPage() {
  const { seatOf } = usePlan();
  const [q, setQ] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState("all");
  const [diet, setDiet] = useState("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return guests.filter((g) => {
      if (needle && !g.name.toLowerCase().includes(needle)) return false;
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === "none" && g.diet) return false;
      if (diet !== "all" && diet !== "none" && g.diet !== diet) return false;
      return true;
    });
  }, [q, party, rsvp, diet]);

  const meals = useMemo(() => {
    const names = [STANDARD, ...diets];
    return names.map((meal) => {
      const of = guests.filter((g) => (g.diet ?? STANDARD) === meal);
      return {
        meal,
        confirmed: of.filter((g) => g.rsvp === "yes").length,
        awaiting: of.filter((g) => g.rsvp === "maybe" || g.rsvp === "pending").length,
      };
    });
  }, []);
  const confirmedTotal = meals.reduce((n, m) => n + m.confirmed, 0);
  const awaitingTotal = meals.reduce((n, m) => n + m.awaiting, 0);
  const filtersOn = q !== "" || party !== "all" || rsvp !== "all" || diet !== "all";

  const reset = () => {
    setQ("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
  };

  return (
    <>
      <Column gap="4">
        <Heading as="h1" variant="display-strong-xs">
          Guest list
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {guests.length} invited · {confirmedTotal} attending · {awaitingTotal} not confirmed · {guests.filter((g) => g.rsvp === "no").length} declined
        </Text>
      </Column>

      <Column as="section" aria-labelledby="meals-h" background="surface" border radius="l" padding="16" gap="16">
        <Row horizontal="between" vertical="center" wrap gap="8">
          <Heading as="h2" id="meals-h" variant="heading-strong-m">
            Meals for the caterer
          </Heading>
          <Text variant="label-default-s" onBackground="neutral-weak">
            {confirmedTotal} confirmed, plus {awaitingTotal} if everyone replies yes
          </Text>
        </Row>
        <Grid columns="6" l={{ columns: "4" }} m={{ columns: "3" }} s={{ columns: "2" }} gap="12">
          {meals.map((m) => (
            <Column key={m.meal} gap="4" padding="12" radius="m" border background="page">
              <Text variant="label-default-s" onBackground="neutral-weak">
                {m.meal}
              </Text>
              <Text variant="display-strong-xs">{m.confirmed}</Text>
              <Text variant="label-default-xs" onBackground="neutral-weak">
                {m.awaiting > 0 ? `+ ${m.awaiting} not confirmed` : "all confirmed"}
              </Text>
            </Column>
          ))}
          <Column gap="4" padding="12" radius="m" solid="brand-strong" onSolid="brand-strong">
            <Text variant="label-default-s">Total attending</Text>
            <Text variant="display-strong-xs">{confirmedTotal}</Text>
            <Text variant="label-default-xs">{awaitingTotal} not confirmed</Text>
          </Column>
        </Grid>
      </Column>

      <Column as="section" aria-labelledby="list-h" gap="16">
        <Heading as="h2" id="list-h" variant="heading-strong-m">
          All guests
        </Heading>
        <Grid columns="4" l={{ columns: "2" }} s={{ columns: "1" }} gap="12">
          <Input
            id="guest-search"
            label="Search guests"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            size="s"
          />
          <Select
            id="party-filter"
            label="Party"
            value={party}
            size="s"
            onSelect={(v) => setParty(String(v))}
            options={[{ label: "All parties", value: "all" }, ...parties.map((p) => ({ label: p, value: p }))]}
          />
          <Select
            id="rsvp-filter"
            label="RSVP"
            value={rsvp}
            size="s"
            onSelect={(v) => setRsvp(String(v))}
            options={[
              { label: "Any RSVP", value: "all" },
              ...(Object.keys(rsvpLabel) as Rsvp[]).map((r) => ({ label: rsvpLabel[r], value: r })),
            ]}
          />
          <Select
            id="diet-filter"
            label="Diet"
            value={diet}
            size="s"
            onSelect={(v) => setDiet(String(v))}
            options={[
              { label: "Any diet", value: "all" },
              { label: "No dietary need", value: "none" },
              ...diets.map((d) => ({ label: d, value: d })),
            ]}
          />
        </Grid>
        <Row horizontal="between" vertical="center" gap="8" wrap>
          <Text variant="label-default-s" onBackground="neutral-weak" role="status" aria-live="polite">
            Showing {filtered.length} of {guests.length} guests
          </Text>
          {filtersOn && <Button size="s" variant="tertiary" prefixIcon="close" label="Clear filters" onClick={reset} />}
        </Row>

        {filtered.length === 0 ? (
          <Column background="surface" border radius="l" padding="32" center gap="8">
            <Text variant="heading-strong-s">No guests match</Text>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Try a different name or clear a filter.
            </Text>
          </Column>
        ) : (
          <Column as="ul" background="surface" border radius="l" margin="0" padding="0" overflow="hidden" style={{ listStyle: "none" }}>
            {filtered.map((g, i) => {
              const spot = seatOf[g.id];
              const tName = spot ? tableById.get(spot.table)?.name : null;
              return (
                <Row
                  as="li"
                  key={g.id}
                  paddingX="16"
                  paddingY="12"
                  gap="16"
                  vertical="center"
                  horizontal="between"
                  wrap
                  borderTop={i > 0}
                >
                  <Column gap="2" flex={1} minWidth={0} style={{ minWidth: 180 }}>
                    <Text variant="label-strong-m">{g.name}</Text>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {g.party}
                    </Text>
                  </Column>
                  <Row gap="8" vertical="center" wrap style={{ minWidth: 0 }}>
                    <Tag size="m" scheme={rsvpTone[g.rsvp]} label={rsvpLabel[g.rsvp]} />
                    {g.diet ? <Tag size="m" scheme="accent" label={g.diet} /> : <Text variant="label-default-s" onBackground="neutral-weak">No dietary need</Text>}
                    {tName ? (
                      <Tag size="m" scheme="brand" prefixIcon="store" label={`${tName}, seat ${spot!.seat + 1}`} />
                    ) : (
                      <Text variant="label-default-s" onBackground="neutral-weak">
                        {g.rsvp === "no" ? "Not coming" : "No table yet"}
                      </Text>
                    )}
                  </Row>
                </Row>
              );
            })}
          </Column>
        )}
      </Column>
    </>
  );
}
```

```tsx src/app/layout.tsx
import '@once-ui-system/core/css/styles.css';
import '@once-ui-system/core/css/tokens.css';
import '@/resources/custom.css'

import classNames from "classnames";

import { baseURL, landing, fonts, style, dataStyle } from "@/resources";
import { Meta, Schema,  Column, Flex, ThemeInit } from "@once-ui-system/core";
import { LocaleProvider, Providers } from '@/components';
import { AppFrame } from '@/components/AppFrame';
import { PlanProvider } from '@/lib/plan';
import { getLocale } from '@/lib/i18n/server';

const title = "Seatwise: seating plan for Ines & Mateo's wedding dinner";
const description = "Build the seating plan for the wedding dinner at The Orangery, check the couple's rules and hand the guest list to the venue and caterer.";

export async function generateMetadata() {
  return Meta.generate({
    title,
    description,
    baseURL: baseURL,
    image: landing.home.image,
  });
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <Flex
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      as="html"
      lang={locale}
      fillWidth
      className={classNames(
        fonts.heading.variable,
        fonts.body.variable,
        fonts.label.variable,
        fonts.code.variable,
      )}
    >
      <head>
        {/* A sync <script> is only allowed inside the document head; React 19.2
            refuses one rendered as a bare child of <html>. */}
        <Schema
          as="webPage"
          baseURL={baseURL}
          title={title}
          description={description}
          path="/"
        />
        <ThemeInit
          config={{
            theme: 'system',
            brand: style.brand,
            accent: style.accent,
            neutral: style.neutral,
            solid: style.solid,
            'solid-style': style.solidStyle,
            border: style.border,
            surface: style.surface,
            transition: style.transition,
            scaling: style.scaling,
            'viz-style': dataStyle.variant,
          }}
        />
      </head>
      <LocaleProvider locale={locale}>
        <Providers>
          <PlanProvider>
            <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
              <AppFrame>{children}</AppFrame>
            </Column>
          </PlanProvider>
        </Providers>
      </LocaleProvider>
    </Flex>
  );
}
```

```tsx src/app/page.tsx
"use client";

import { Column, Grid, Heading, Row, Text } from "@once-ui-system/core";
import { RoomPlan } from "@/components/RoomPlan";
import { RulesPanel, StatsRow, StatusLine, TablePanel, TablesList, ToSeatPanel } from "@/components/Panels";
import { dateLabel, event } from "@/lib/data";

export default function Page() {
  return (
    <>
      <Column gap="4">
        <Heading as="h1" variant="display-strong-xs">
          Seating plan
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {event.name} · {dateLabel} · {event.venue}
        </Text>
      </Column>
      <StatsRow />
      <Row gap="24" vertical="start" m={{ direction: "column" }}>
        <Column flex={1} minWidth={0} gap="8" m={{ fillWidth: true }}>
          <RoomPlan />
          <StatusLine />
          <ToSeatPanel />
        </Column>
        <Grid columns="1" gap="16" width={22.5} m={{ columns: "2", fillWidth: true }} s={{ columns: "1" }} style={{ flex: "none" }}>
          <TablePanel />
          <RulesPanel />
          <TablesList />
        </Grid>
      </Row>
    </>
  );
}
```

```tsx src/components/AppFrame.tsx
"use client";

import { Avatar, Button, Column, Icon, Row, Text, VisuallyHidden } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { app, dateLabel, event, planner } from "@/lib/data";

const nav = [
  { href: "/", label: "Seating plan", icon: "grid" as const },
  { href: "/guests", label: "Guest list", icon: "people" as const },
];

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <Column fillWidth flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row
        as="header"
        fillWidth
        background="surface"
        borderBottom
        paddingX="16"
        paddingY="12"
        gap="16"
        vertical="center"
        horizontal="between"
        wrap
        position="sticky"
        top="0"
        zIndex={5}
      >
        <Row gap="12" vertical="center">
          <Row width="32" height="32" radius="m" solid="brand-strong" center onSolid="brand-strong" aria-hidden="true">
            <Icon name="heart" size="s" onSolid="brand-strong" />
          </Row>
          <Column gap="2">
            <Text variant="heading-strong-m">{app}</Text>
            <Text variant="label-default-xs" onBackground="neutral-weak" s={{ hide: true }}>
              {event.name}
            </Text>
          </Column>
        </Row>
        <Row as="nav" aria-label="Main" gap="4" vertical="center">
          {nav.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Button
                key={item.href}
                href={item.href}
                variant={active ? "secondary" : "tertiary"}
                size="s"
                prefixIcon={item.icon}
                label={item.label}
                aria-current={active ? "page" : undefined}
              />
            );
          })}
        </Row>
        <Row gap="12" vertical="center" m={{ hide: true }}>
          <Column horizontal="end" gap="2">
            <Text variant="label-default-s">{dateLabel}</Text>
            <Text variant="label-default-xs" onBackground="neutral-weak">
              {event.venue}
            </Text>
          </Column>
          <Avatar value={planner.name.split(" ").map((p) => p[0]).join("")} size="s" />
        </Row>
      </Row>
      <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24" flex={1}>
        <Column fillWidth maxWidth={90} gap="24">
          {children}
        </Column>
      </Column>
    </Column>
  );
}
```

```tsx src/components/Panels.tsx
"use client";

import { Column, Grid, Heading, IconButton, Icon, Row, Tag, Text } from "@once-ui-system/core";
import { useState } from "react";
import { guests as allGuests, tables, type Guest } from "@/lib/data";
import { guestById, initials, tableById, usePlan } from "@/lib/plan";

function Panel({
  title,
  aside,
  children,
  id,
}: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <Column as="section" aria-labelledby={id} background="surface" border radius="l" padding="16" gap="12" fillWidth>
      <Row horizontal="between" vertical="center" gap="8">
        <Heading as="h2" id={id} variant="heading-strong-m">
          {title}
        </Heading>
        {aside}
      </Row>
      {children}
    </Column>
  );
}

export function StatsRow() {
  const { seatedCount, toSeat, results, attendingCount } = usePlan();
  const capacity = tables.reduce((n, t) => n + t.seats, 0);
  const broken = results.filter((r) => r.status === "broken").length;
  const stats = [
    { label: "Seated", value: String(seatedCount), note: `of ${attendingCount} attending` },
    { label: "Still to seat", value: String(toSeat.length), note: toSeat.length === 0 ? "everyone attending has a seat" : "attending, no seat yet" },
    { label: "Free seats", value: String(capacity - seatedCount), note: `of ${capacity} at ${tables.length} tables` },
    { label: "Rules broken", value: String(broken), note: broken === 0 ? "all clear" : `of ${results.length} rules`, bad: broken > 0 },
  ];
  return (
    <Grid columns="4" s={{ columns: "2" }} gap="12" fillWidth>
      {stats.map((s) => (
        <Column key={s.label} background="surface" border radius="l" padding="16" gap="4">
          <Text variant="label-default-s" onBackground="neutral-weak">
            {s.label}
          </Text>
          <Text variant="display-strong-xs" onBackground={s.bad ? "danger-strong" : "neutral-strong"} aria-live="polite">
            {s.value}
          </Text>
          <Text variant="label-default-xs" onBackground="neutral-weak">
            {s.note}
          </Text>
        </Column>
      ))}
    </Grid>
  );
}

export function StatusLine() {
  const { message } = usePlan();
  return (
    <Text role="status" aria-live="polite" variant="label-default-s" onBackground="neutral-weak">
      {message}
    </Text>
  );
}

export function RulesPanel() {
  const { results, selectTable } = usePlan();
  const broken = results.filter((r) => r.status === "broken");
  return (
    <Panel
      id="rules-h"
      title="Couple's rules"
      aside={
        <Tag scheme={broken.length ? "danger" : "success"} size="m" label={broken.length ? `${broken.length} broken` : "All kept"} />
      }
    >
      <Column as="ul" gap="8" margin="0" padding="0" style={{ listStyle: "none" }}>
        {results.map((r, i) => {
          const names = r.rule.guests.map((id) => guestById.get(id)?.name ?? id).join(" + ");
          const kind = r.rule.kind === "together" ? "Keep together" : r.rule.kind === "apart" ? "Keep apart" : "Seat near";
          const tone = r.status === "broken" ? "danger" : r.status === "ok" ? "success" : "neutral";
          return (
            <Column
              as="li"
              key={i}
              gap="4"
              padding="12"
              radius="m"
              border={r.status === "broken" ? "danger-alpha-strong" : true}
              background={r.status === "broken" ? "danger-alpha-weak" : "transparent"}
            >
              <Row gap="8" vertical="center" wrap>
                <Icon
                  name={r.status === "broken" ? "warning" : r.status === "ok" ? "check" : "time"}
                  size="s"
                  onBackground={`${tone}-strong` as const}
                />
                <Text variant="label-strong-s">{kind}</Text>
                <Tag
                  size="s"
                  scheme={tone}
                  label={r.status === "broken" ? "Broken" : r.status === "ok" ? "Kept" : "To place"}
                />
              </Row>
              <Text variant="body-default-s">{names}</Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                {r.rule.note}
              </Text>
              <Text variant="body-default-xs" onBackground={r.status === "broken" ? "danger-strong" : "neutral-medium"}>
                {r.detail}
              </Text>
              {r.status === "broken" && r.tables.length > 0 && (
                <Row gap="8" wrap>
                  {r.tables.map((id) => (
                    <Tag
                      key={id}
                      as="button"
                      size="s"
                      scheme="danger"
                      label={`Show ${tableById.get(id)?.name}`}
                      onClick={() => selectTable(id)}
                      style={{ cursor: "pointer" }}
                    />
                  ))}
                </Row>
              )}
            </Column>
          );
        })}
      </Column>
    </Panel>
  );
}

function dietCounts(gs: Guest[]): [string, number][] {
  const map = new Map<string, number>();
  for (const g of gs) if (g.diet) map.set(g.diet, (map.get(g.diet) ?? 0) + 1);
  return [...map.entries()];
}

export function TablePanel() {
  const { selectedTable, guestsAt, unseat, pick, picked, results } = usePlan();
  const t = selectedTable ? tableById.get(selectedTable) : null;
  if (!t) {
    return (
      <Panel id="table-h" title="Selected table">
        <Text variant="body-default-s" onBackground="neutral-weak">
          Select a table on the plan to see its guests and their dietary needs.
        </Text>
      </Panel>
    );
  }
  const here = guestsAt(t.id);
  const diets = dietCounts(here);
  const flags = results.filter((r) => r.status === "broken" && r.tables.includes(t.id));
  return (
    <Panel
      id="table-h"
      title={t.name}
      aside={<Tag size="m" scheme={here.length >= t.seats ? "success" : "neutral"} label={`${here.length} of ${t.seats} seats`} />}
    >
      {flags.map((r, i) => (
        <Row key={i} gap="8" vertical="start" padding="8" radius="m" background="danger-alpha-weak">
          <Icon name="warning" size="s" onBackground="danger-strong" />
          <Text variant="body-default-xs" onBackground="danger-strong">
            {r.detail}
          </Text>
        </Row>
      ))}
      {here.length === 0 ? (
        <Text variant="body-default-s" onBackground="neutral-weak">
          Nobody is seated here yet.
        </Text>
      ) : (
        <Column as="ul" gap="4" margin="0" padding="0" style={{ listStyle: "none" }}>
          {here.map((g) => (
            <Row
              as="li"
              key={g.id}
              gap="8"
              vertical="center"
              paddingY="4"
              paddingX="8"
              radius="m"
              background={picked === g.id ? "brand-alpha-weak" : "transparent"}
            >
              <Column flex={1} gap="2" minWidth={0}>
                <Text variant="label-strong-s">{g.name}</Text>
                <Row gap="8" wrap vertical="center">
                  <Text variant="body-default-xs" onBackground="neutral-weak">
                    {g.party}
                  </Text>
                  {g.diet && <Tag size="s" scheme="accent" label={g.diet} />}
                </Row>
              </Column>
              <IconButton
                icon="arrowRight"
                variant="tertiary"
                size="s"
                tooltip="Move"
                ariaLabel={`Pick up ${g.name} to move them`}
                onClick={() => pick(g.id)}
              />
              <IconButton
                icon="personRemove"
                variant="tertiary"
                size="s"
                tooltip="Unseat"
                ariaLabel={`Unseat ${g.name}`}
                onClick={() => unseat(g.id)}
              />
            </Row>
          ))}
        </Column>
      )}
      <Column gap="4" paddingTop="8" borderTop>
        <Text variant="label-default-s" onBackground="neutral-weak">
          Dietary needs at this table
        </Text>
        {diets.length === 0 ? (
          <Text variant="body-default-s">None noted</Text>
        ) : (
          <Row gap="8" wrap>
            {diets.map(([d, n]) => (
              <Tag key={d} size="m" scheme="accent" label={`${n} ${d}`} />
            ))}
          </Row>
        )}
      </Column>
    </Panel>
  );
}

function GuestChip({ g }: { g: Guest }) {
  const { picked, pick } = usePlan();
  const active = picked === g.id;
  return (
    <button
      type="button"
      draggable
      aria-pressed={active}
      onClick={() => pick(active ? null : g.id)}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", g.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        textAlign: "left",
        cursor: "grab",
        font: "inherit",
        padding: "8px 10px",
        minHeight: 48,
        borderRadius: 10,
        color: "var(--neutral-on-background-strong)",
        background: active ? "var(--brand-alpha-weak)" : "var(--surface-background)",
        border: active ? "2px solid var(--brand-solid-strong)" : "1px solid var(--neutral-alpha-medium)",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 28,
          height: 28,
          flex: "none",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 600,
          background: "var(--neutral-background-strong)",
        }}
      >
        {initials(g.name)}
      </span>
      <span style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{g.name}</span>
        <span style={{ fontSize: 12, color: "var(--neutral-on-background-weak)" }}>
          {g.party}
          {g.diet ? ` · ${g.diet}` : ""}
        </span>
      </span>
    </button>
  );
}

export function ToSeatPanel() {
  const { toSeat, undecided, unseat, picked, seatOf } = usePlan();
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData("text/plain");
        if (id && seatOf[id]) unseat(id);
      }}
      style={{ borderRadius: 16, outline: over ? "2px dashed var(--brand-solid-strong)" : "none", outlineOffset: 2 }}
    >
      <Panel
        id="toseat-h"
        title="Attending, no seat"
        aside={<Tag size="m" scheme={toSeat.length ? "accent" : "success"} label={String(toSeat.length)} />}
      >
        {toSeat.length === 0 ? (
          <Text variant="body-default-s" onBackground="neutral-weak">
            Everyone who is attending has a seat.
          </Text>
        ) : (
          <Grid as="ul" columns="3" m={{ columns: "2" }} s={{ columns: "1" }} gap="8" margin="0" padding="0" style={{ listStyle: "none" }}>
            {toSeat.map((g) => (
              <li key={g.id}>
                <GuestChip g={g} />
              </li>
            ))}
          </Grid>
        )}
        {undecided.length > 0 && (
          <Column gap="8" paddingTop="8" borderTop>
            <Text variant="label-default-s" onBackground="neutral-weak">
              Not confirmed yet (maybe or no reply)
            </Text>
            <Grid as="ul" columns="3" m={{ columns: "2" }} s={{ columns: "1" }} gap="8" margin="0" padding="0" style={{ listStyle: "none" }}>
              {undecided.map((g) => (
                <li key={g.id}>
                  <GuestChip g={g} />
                </li>
              ))}
            </Grid>
          </Column>
        )}
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {picked ? "Now tap a seat or a table on the plan." : "Drop a seated guest here to unseat them."}
        </Text>
      </Panel>
    </div>
  );
}

export function TablesList() {
  const { guestsAt, selectedTable, selectTable, picked, place } = usePlan();
  return (
    <Panel id="tables-h" title="Seats per table">
      <Column as="ul" gap="4" margin="0" padding="0" style={{ listStyle: "none" }}>
        {tables.map((t) => {
          const n = guestsAt(t.id).length;
          const pct = Math.round((n / t.seats) * 100);
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => (picked ? place(picked, t.id) : selectTable(t.id))}
                aria-pressed={selectedTable === t.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "88px 1fr 40px",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  minHeight: 40,
                  padding: "4px 8px",
                  font: "inherit",
                  fontSize: 14,
                  cursor: "pointer",
                  borderRadius: 8,
                  color: "var(--neutral-on-background-strong)",
                  background: selectedTable === t.id ? "var(--brand-alpha-weak)" : "transparent",
                  border: "none",
                  textAlign: "left",
                }}
              >
                <span>{t.name}</span>
                <span aria-hidden="true" style={{ height: 6, borderRadius: 3, background: "var(--neutral-alpha-weak)", overflow: "hidden" }}>
                  <span style={{ display: "block", height: "100%", width: `${pct}%`, background: n >= t.seats ? "var(--success-solid-strong)" : "var(--brand-solid-strong)" }} />
                </span>
                <span style={{ textAlign: "right", color: "var(--neutral-on-background-weak)" }}>
                  {n}/{t.seats}
                </span>
              </button>
            </li>
          );
        })}
      </Column>
    </Panel>
  );
}

export const guestCount = allGuests.length;
```

```tsx src/components/RoomPlan.tsx
"use client";

import { Button, Column, Row, Text, VisuallyHidden } from "@once-ui-system/core";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { event, fixtures, tables, type Table } from "@/lib/data";
import {
  LONG_DEPTH,
  LONG_LENGTH,
  ROUND_RING,
  SEAT_SIZE,
  guestById,
  initials,
  seatPoint,
  tableCentre,
  usePlan,
} from "@/lib/plan";

const m = (n: number) => `calc(var(--m) * ${n})`;

type Zone = { left: number; top: number; w: number; h: number };

function zoneOf(t: Table): Zone {
  if (t.shape === "long") return { left: t.x, top: t.y - 1.05, w: LONG_LENGTH, h: LONG_DEPTH + 1.05 };
  const r = ROUND_RING + SEAT_SIZE / 2 + 0.05;
  return { left: t.x - r, top: t.y - r, w: r * 2, h: r * 2 };
}

const fixtureStyle: Record<string, CSSProperties> = {
  stage: { background: "var(--neutral-background-strong)", border: "1px solid var(--neutral-alpha-medium)" },
  dancefloor: {
    background: "var(--brand-alpha-weak)",
    border: "1px dashed var(--brand-alpha-strong)",
  },
  bar: { background: "var(--neutral-background-strong)", border: "1px solid var(--neutral-alpha-medium)" },
  door: { background: "var(--accent-solid-strong)", borderRadius: 2 },
};

export function RoomPlan() {
  const { seatOf, picked, selectedTable, results, occupant, guestsAt, pick, selectTable, place, unseat } = usePlan();
  const [over, setOver] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") pick(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pick]);

  const brokenTables = useMemo(() => {
    const s = new Set<string>();
    for (const r of results) if (r.status === "broken") for (const t of r.tables) s.add(t);
    return s;
  }, [results]);

  const brokenGuests = useMemo(() => {
    const s = new Set<string>();
    for (const r of results) if (r.status === "broken") for (const g of r.rule.guests) if (seatOf[g]) s.add(g);
    return s;
  }, [results, seatOf]);

  const pickedGuest = picked ? guestById.get(picked) : null;
  const dragId = (e: React.DragEvent) => e.dataTransfer.getData("text/plain");

  const onTableClick = (t: Table) => {
    if (picked) place(picked, t.id);
    else selectTable(t.id);
  };

  return (
    <Column gap="12" fillWidth minWidth={0}>
      <Row gap="12" vertical="center" horizontal="between" wrap minHeight="40">
        {pickedGuest ? (
          <>
            <Text variant="label-default-m" onBackground="brand-strong">
              Placing {pickedGuest.name}: tap a seat or a table
            </Text>
            <Row gap="8">
              {seatOf[pickedGuest.id] && (
                <Button size="s" variant="secondary" prefixIcon="personRemove" label="Unseat" onClick={() => unseat(pickedGuest.id)} />
              )}
              <Button size="s" variant="tertiary" label="Cancel" onClick={() => pick(null)} />
            </Row>
          </>
        ) : (
          <Text variant="label-default-m" onBackground="neutral-weak">
            Drag a guest onto a seat or table, or tap a guest and then a seat. Tap a table to see who sits there.
          </Text>
        )}
      </Row>

      <Row
        background="surface"
        border
        radius="l"
        padding="12"
        fillWidth
        overflowX="auto"
        scrollbar="minimal"
      >
        <div style={{ containerType: "inline-size", width: "100%", minWidth: 660 }}>
          <div
            role="group"
            aria-label={`Floor plan of the room, ${event.room_m.width} by ${event.room_m.depth} metres`}
            style={
              {
                "--m": "calc(100cqw / 24)",
                position: "relative",
                width: "100%",
                aspectRatio: `${event.room_m.width} / ${event.room_m.depth}`,
                background: "var(--page-background)",
                border: "2px solid var(--neutral-alpha-strong)",
                borderRadius: 6,
                overflow: "hidden",
                backgroundImage:
                  "linear-gradient(var(--neutral-alpha-weak) 1px, transparent 1px), linear-gradient(90deg, var(--neutral-alpha-weak) 1px, transparent 1px)",
                backgroundSize: `${100 / 24}% ${100 / 14}%`,
              } as CSSProperties
            }
          >
            {fixtures.map((f) => (
              <div
                key={f.id}
                role="img"
                aria-label={f.label}
                style={{
                  position: "absolute",
                  left: m(f.x),
                  top: m(f.y),
                  width: m(f.w),
                  height: m(f.h),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  ...fixtureStyle[f.kind],
                }}
              >
                {f.kind !== "door" && (
                  <span
                    style={{
                      fontSize: "max(10px, calc(var(--m) * 0.42))",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: "var(--neutral-on-background-medium)",
                    }}
                  >
                    {f.label}
                  </span>
                )}
              </div>
            ))}
            {fixtures
              .filter((f) => f.kind === "door")
              .map((f) => (
                <span
                  key={`${f.id}-label`}
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: m(f.x + f.w + 0.1),
                    top: m(f.y),
                    height: m(f.h),
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                    fontSize: "max(9px, calc(var(--m) * 0.36))",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "var(--neutral-on-background-medium)",
                    textAlign: "center",
                  }}
                >
                  {f.label}
                </span>
              ))}

            {tables.map((t) => {
              const z = zoneOf(t);
              const c = tableCentre(t);
              const guestsHere = guestsAt(t.id);
              const flagged = brokenTables.has(t.id);
              const selected = selectedTable === t.id;
              const isOver = over === t.id;
              const full = guestsHere.length >= t.seats;
              const bodyStyle: CSSProperties =
                t.shape === "long"
                  ? { left: m(0), top: m(1.05), width: m(LONG_LENGTH), height: m(LONG_DEPTH), borderRadius: `calc(var(--m) * 0.25)` }
                  : { left: m(c.x - 1.0 - z.left), top: m(c.y - 1.0 - z.top), width: m(2), height: m(2), borderRadius: "50%" };
              return (
                <div
                  key={t.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setOver(t.id);
                  }}
                  onDragLeave={() => setOver((o) => (o === t.id ? null : o))}
                  onDrop={(e) => {
                    e.preventDefault();
                    setOver(null);
                    const id = dragId(e);
                    if (id) place(id, t.id);
                  }}
                  style={{
                    position: "absolute",
                    left: m(z.left),
                    top: m(z.top),
                    width: m(z.w),
                    height: m(z.h),
                    borderRadius: t.shape === "round" ? "50%" : 8,
                    background: isOver ? "var(--brand-alpha-weak)" : "transparent",
                    outline: isOver ? "2px dashed var(--brand-solid-strong)" : "none",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onTableClick(t)}
                    aria-pressed={selected}
                                        style={{
                      position: "absolute",
                      ...bodyStyle,
                      display: "flex",
                      flexDirection: t.shape === "long" ? "row" : "column",
                      gap: t.shape === "long" ? 8 : 0,
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      font: "inherit",
                      padding: 0,
                      background: "var(--surface-background)",
                      color: "var(--neutral-on-background-strong)",
                      border: flagged
                        ? "2px solid var(--danger-solid-strong)"
                        : selected
                          ? "2px solid var(--brand-solid-strong)"
                          : "1px solid var(--neutral-alpha-strong)",
                      boxShadow: selected ? "0 0 0 3px var(--brand-alpha-medium)" : "none",
                    }}
                  >
                    <span style={{ fontSize: "max(10px, calc(var(--m) * 0.42))", fontWeight: 600, lineHeight: 1.1 }}>{t.name}</span>
                    <span
                      style={{
                        fontSize: "max(10px, calc(var(--m) * 0.38))",
                        color: full ? "var(--success-on-background-strong)" : "var(--neutral-on-background-weak)",
                      }}
                    >
                      {guestsHere.length}/{t.seats}
                    </span>
                    <VisuallyHidden>{` seats filled${flagged ? ", a rule is broken" : ""}${full ? ", full" : ""}`}</VisuallyHidden>
                  </button>
                  {flagged && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        right: 0,
                        top: t.shape === "long" ? m(0.9) : 0,
                        width: m(0.8),
                        height: m(0.8),
                        borderRadius: "50%",
                        background: "var(--danger-solid-strong)",
                        color: "var(--danger-on-solid-strong)",
                        fontSize: "max(10px, calc(var(--m) * 0.5))",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      !
                    </span>
                  )}
                  {Array.from({ length: t.seats }, (_, i) => {
                    const p = seatPoint(t, i);
                    const who = occupant(t.id, i);
                    const isPicked = who && picked === who.id;
                    const bad = who && brokenGuests.has(who.id);
                    const label = who
                      ? `Seat ${i + 1}, ${t.name}: ${who.name}${who.diet ? `, ${who.diet}` : ""}`
                      : `Seat ${i + 1}, ${t.name}: empty`;
                    return (
                      <button
                        key={i}
                        type="button"
                        draggable={!!who}
                        title={who ? `${who.name}${who.diet ? ` (${who.diet})` : ""}` : `Empty seat ${i + 1}`}
                        onDragStart={(e) => {
                          if (!who) return;
                          e.dataTransfer.setData("text/plain", who.id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOver(t.id);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOver(null);
                          const id = dragId(e);
                          if (id) place(id, t.id, i);
                        }}
                        onClick={() => {
                          if (picked) {
                            if (!who || who.id !== picked) place(picked, t.id, i);
                            else pick(null);
                          } else if (who) {
                            pick(who.id);
                            selectTable(t.id);
                          } else {
                            selectTable(t.id);
                          }
                        }}
                        style={{
                          position: "absolute",
                          left: m(p.x - z.left - SEAT_SIZE / 2),
                          top: m(p.y - z.top - SEAT_SIZE / 2),
                          width: m(SEAT_SIZE),
                          height: m(SEAT_SIZE),
                          borderRadius: "50%",
                          padding: 0,
                          font: "inherit",
                          fontSize: "max(9px, calc(var(--m) * 0.3))",
                          fontWeight: 600,
                          cursor: who ? "grab" : "pointer",
                          background: who ? "var(--brand-background-strong)" : "transparent",
                          color: "var(--neutral-on-background-strong)",
                          border: bad
                            ? "2px solid var(--danger-solid-strong)"
                            : isPicked
                              ? "2px solid var(--accent-solid-strong)"
                              : who
                                ? "1px solid var(--brand-alpha-strong)"
                                : "1.5px dashed var(--neutral-alpha-strong)",
                          boxShadow: isPicked ? "0 0 0 3px var(--accent-alpha-medium)" : "none",
                        }}
                      >
                        {who ? initials(who.name) : ""}
                        <VisuallyHidden>{` ${label}`}</VisuallyHidden>
                        {who?.diet && (
                          <span
                            aria-hidden="true"
                            style={{
                              position: "absolute",
                              right: -2,
                              top: -2,
                              width: "28%",
                              height: "28%",
                              minWidth: 7,
                              minHeight: 7,
                              borderRadius: "50%",
                              background: "var(--accent-solid-strong)",
                              border: "1px solid var(--surface-background)",
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </Row>
      <Row gap="16" wrap vertical="center">
        <Legend swatch={{ background: "var(--brand-background-strong)", border: "1px solid var(--brand-alpha-strong)" }} label="Seated guest" />
        <Legend swatch={{ border: "1.5px dashed var(--neutral-alpha-strong)" }} label="Empty seat" />
        <Legend swatch={{ background: "var(--accent-solid-strong)", width: 8, height: 8 }} label="Dietary need" />
        <Legend swatch={{ border: "2px solid var(--danger-solid-strong)" }} label="Broken rule" />
      </Row>
    </Column>
  );
}

function Legend({ swatch, label }: { swatch: CSSProperties; label: string }) {
  return (
    <Row gap="8" vertical="center">
      <span aria-hidden="true" style={{ display: "inline-block", width: 14, height: 14, borderRadius: "50%", ...swatch }} />
      <Text variant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
    </Row>
  );
}
```

```ts src/lib/data.ts
export type Rsvp = "yes" | "no" | "maybe" | "pending";
export type RuleKind = "together" | "apart" | "near";

export type Fixture = {
  id: string;
  kind: "stage" | "dancefloor" | "bar" | "door";
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Table = {
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
  kind: RuleKind;
  guests: string[];
  note: string;
};

export const app = "Seatwise";

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

export const tables: Table[] = [
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
  { kind: "near", guests: ["g-09"], note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band" },
];

export const rsvpLabel: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "No reply",
  no: "Declined",
};

export const dateLabel = new Date(`${event.date}T12:00:00`).toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
```

```tsx src/lib/plan.tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { fixtures, guests as allGuests, rules, tables, type Guest, type Rule, type Table } from "./data";

export type Spot = { table: string; seat: number };
export type SeatOf = Record<string, Spot | null>;

export const LONG_LENGTH = 8;
export const LONG_DEPTH = 1.2;
export const ROUND_RING = 1.45;
export const SEAT_SIZE = 0.85;
export const NEAR_DOOR_MAX_M = 5;
export const FAR_BAND_MIN_M = 6;

export const guestById = new Map<string, Guest>(allGuests.map((g) => [g.id, g]));
export const tableById = new Map<string, Table>(tables.map((t) => [t.id, t]));

export function tableCentre(t: Table): { x: number; y: number } {
  return t.shape === "long" ? { x: t.x + LONG_LENGTH / 2, y: t.y + LONG_DEPTH / 2 } : { x: t.x, y: t.y };
}

export function seatPoint(t: Table, i: number): { x: number; y: number } {
  if (t.shape === "long") {
    return { x: t.x + (i + 0.5) * (LONG_LENGTH / t.seats), y: t.y - 0.6 };
  }
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
  return { x: t.x + Math.cos(a) * ROUND_RING, y: t.y + Math.sin(a) * ROUND_RING };
}

export function initials(name: string): string {
  const parts = name.replace(/^Avó\s+/, "").split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

function initialSeating(): SeatOf {
  const next: SeatOf = {};
  const used: Record<string, number> = {};
  for (const g of allGuests) {
    if (g.table) {
      const n = used[g.table] ?? 0;
      used[g.table] = n + 1;
      next[g.id] = { table: g.table, seat: n };
    } else {
      next[g.id] = null;
    }
  }
  return next;
}

export type RuleStatus = "ok" | "broken" | "open";
export type RuleResult = {
  rule: Rule;
  status: RuleStatus;
  detail: string;
  tables: string[];
};

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function evaluateRules(seatOf: SeatOf): RuleResult[] {
  const door = fixtures.find((f) => f.kind === "door");
  const band = fixtures.find((f) => f.kind === "stage");
  return rules.map((rule) => {
    const gs = rule.guests.map((id) => guestById.get(id)!);
    const spots = rule.guests.map((id) => seatOf[id] ?? null);
    const seated = spots.filter((s): s is Spot => s !== null);
    const involved = [...new Set(seated.map((s) => s.table))];
    const names = gs.map((g) => g.name).join(" and ");
    const nameOf = (i: number) => gs[i]?.name ?? "";

    if (rule.kind === "together") {
      if (seated.length < spots.length) {
        const missing = gs.filter((_, i) => !spots[i]).map((g) => g.name).join(", ");
        return { rule, status: "open" as const, detail: `${missing} still to seat`, tables: involved };
      }
      if (involved.length > 1) {
        return {
          rule,
          status: "broken" as const,
          detail: `${names} are at different tables`,
          tables: involved,
        };
      }
      return { rule, status: "ok" as const, detail: `${names} share ${tableById.get(involved[0])?.name}`, tables: involved };
    }

    if (rule.kind === "apart") {
      if (seated.length === 2 && involved.length === 1) {
        return {
          rule,
          status: "broken" as const,
          detail: `${nameOf(0)} and ${nameOf(1)} are both at ${tableById.get(involved[0])?.name}`,
          tables: involved,
        };
      }
      return {
        rule,
        status: "ok" as const,
        detail: seated.length < 2 ? `${names}: kept apart (one is not seated yet)` : `${names}: kept apart`,
        tables: involved,
      };
    }

    // near: seat close to the garden doors and away from the band
    const spot = spots[0];
    if (!spot || !door || !band) {
      return { rule, status: "open" as const, detail: `${nameOf(0)} is not seated yet`, tables: [] };
    }
    const t = tableById.get(spot.table)!;
    const c = tableCentre(t);
    const dDoor = dist(c, { x: door.x + door.w / 2, y: door.y + door.h / 2 });
    const dBand = dist(c, { x: band.x + band.w / 2, y: band.y + band.h / 2 });
    const doorOk = dDoor <= NEAR_DOOR_MAX_M;
    const bandOk = dBand >= FAR_BAND_MIN_M;
    if (doorOk && bandOk) {
      return {
        rule,
        status: "ok" as const,
        detail: `${t.name} is ${dDoor.toFixed(1)} m from the garden doors and ${dBand.toFixed(1)} m from the band`,
        tables: [t.id],
      };
    }
    const why = !doorOk
      ? `${t.name} is ${dDoor.toFixed(1)} m from the garden doors (aim for ${NEAR_DOOR_MAX_M} m or less)`
      : `${t.name} is only ${dBand.toFixed(1)} m from the band`;
    return { rule, status: "broken" as const, detail: why, tables: [t.id] };
  });
}

type PlanState = {
  seatOf: SeatOf;
  picked: string | null;
  selectedTable: string | null;
  message: string;
  results: RuleResult[];
  occupant: (tableId: string, seat: number) => Guest | null;
  guestsAt: (tableId: string) => Guest[];
  seatedCount: number;
  toSeat: Guest[];
  undecided: Guest[];
  attendingCount: number;
  pick: (id: string | null) => void;
  selectTable: (id: string | null) => void;
  place: (guestId: string, tableId: string, seat?: number) => void;
  unseat: (guestId: string) => void;
};

const PlanContext = createContext<PlanState | null>(null);

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [seatOf, setSeatOf] = useState<SeatOf>(initialSeating);
  const [picked, setPicked] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>("t-3");
  const [message, setMessage] = useState("");

  const results = useMemo(() => evaluateRules(seatOf), [seatOf]);

  const occupant = useCallback(
    (tableId: string, seat: number) => {
      for (const g of allGuests) {
        const s = seatOf[g.id];
        if (s && s.table === tableId && s.seat === seat) return g;
      }
      return null;
    },
    [seatOf],
  );

  const guestsAt = useCallback(
    (tableId: string) =>
      allGuests
        .filter((g) => seatOf[g.id]?.table === tableId)
        .sort((a, b) => (seatOf[a.id]?.seat ?? 0) - (seatOf[b.id]?.seat ?? 0)),
    [seatOf],
  );

  const place = useCallback(
    (guestId: string, tableId: string, seat?: number) => {
      const guest = guestById.get(guestId);
      const table = tableById.get(tableId);
      if (!guest || !table || guest.rsvp === "no") return;
      const current = seatOf[guestId] ?? null;
      const taken = new Map<number, string>();
      for (const g of allGuests) {
        const s = seatOf[g.id];
        if (s && s.table === tableId) taken.set(s.seat, g.id);
      }
      let target = seat;
      if (target === undefined) {
        if (current?.table === tableId) {
          setMessage(`${guest.name} is already at ${table.name}.`);
          return;
        }
        for (let i = 0; i < table.seats; i++) {
          if (!taken.has(i)) {
            target = i;
            break;
          }
        }
        if (target === undefined) {
          setMessage(`${table.name} is full. Unseat someone or pick another table.`);
          return;
        }
      }
      const occupantId = taken.get(target);
      if (occupantId === guestId) return;
      const next: SeatOf = { ...seatOf, [guestId]: { table: tableId, seat: target } };
      let msg = `${guest.name} seated at ${table.name}.`;
      if (occupantId) {
        const other = guestById.get(occupantId)!;
        if (current) {
          next[occupantId] = current;
          const from = tableById.get(current.table)?.name;
          msg = `${guest.name} and ${other.name} swapped seats (${table.name} and ${from}).`;
        } else {
          next[occupantId] = null;
          msg = `${guest.name} took ${other.name}'s seat at ${table.name}; ${other.name} is unseated.`;
        }
      } else if (current) {
        msg = `${guest.name} moved from ${tableById.get(current.table)?.name} to ${table.name}.`;
      }
      setSeatOf(next);
      setPicked(null);
      setSelectedTable(tableId);
      setMessage(msg);
    },
    [seatOf],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const g = guestById.get(guestId);
      if (!g || !seatOf[guestId]) return;
      setSeatOf({ ...seatOf, [guestId]: null });
      setPicked(null);
      setMessage(`${g.name} unseated.`);
    },
    [seatOf],
  );

  const value = useMemo<PlanState>(() => {
    const seatedCount = allGuests.filter((g) => seatOf[g.id]).length;
    const toSeat = allGuests.filter((g) => g.rsvp === "yes" && !seatOf[g.id]);
    const undecided = allGuests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !seatOf[g.id]);
    return {
      seatOf,
      picked,
      selectedTable,
      message,
      results,
      occupant,
      guestsAt,
      seatedCount,
      toSeat,
      undecided,
      attendingCount: allGuests.filter((g) => g.rsvp === "yes").length,
      pick: setPicked,
      selectTable: setSelectedTable,
      place,
      unseat,
    };
  }, [seatOf, picked, selectedTable, message, results, occupant, guestsAt, place, unseat]);

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanState {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan needs PlanProvider");
  return ctx;
}
```

