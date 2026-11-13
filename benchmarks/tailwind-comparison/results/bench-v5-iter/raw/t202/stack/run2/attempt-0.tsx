```tsx src/app/guests/page.tsx
import { GuestsView } from "@/components/GuestsView";

export default function Page() {
  return <GuestsView />;
}
```

```tsx src/app/layout.tsx
import '@once-ui-system/core/css/styles.css';
import '@once-ui-system/core/css/tokens.css';
import '@/resources/custom.css'
import '@/resources/seatwise.css'

import classNames from "classnames";

import { baseURL, fonts, style, dataStyle } from "@/resources";
import { Meta, Column, Flex, ThemeInit } from "@once-ui-system/core";
import { LocaleProvider, Providers } from '@/components';
import { SeatProvider } from '@/components/SeatProvider';
import { Shell } from '@/components/Shell';
import { getLocale } from '@/lib/i18n/server';

const title = "Seatwise: seating plan for Ines & Mateo's wedding dinner";
const description =
  "Build the seating plan, check the couple's rules and hand the guest list and meal counts to the venue and the caterer.";

export async function generateMetadata() {
  return Meta.generate({
    title,
    description,
    baseURL: baseURL,
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
          <SeatProvider>
            <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
              <Column fillWidth horizontal="center" flex={1}>
                <Shell>{children}</Shell>
              </Column>
            </Column>
          </SeatProvider>
        </Providers>
      </LocaleProvider>
    </Flex>
  );
}
```

```tsx src/app/page.tsx
import { PlanView } from "@/components/PlanView";

export default function Page() {
  return <PlanView />;
}
```

```tsx src/components/GuestsView.tsx
"use client";

import { useMemo, useState } from "react";
import { Avatar, Button, Column, Heading, Input, Row, Select, Tag, Text } from "@once-ui-system/core";
import { guests, rsvpLabels, type Rsvp } from "@/lib/data";
import { MEAL_STANDARD, initials, mealFor, tableById } from "@/lib/seating";
import { useSeating } from "./SeatProvider";

const ALL = "all";

const parties = Array.from(new Set(guests.map((g) => g.party)));
const diets = Array.from(new Set(guests.map((g) => g.diet).filter((d): d is string => d !== null))).sort();
const NONE = "__none";

const rsvpScheme: Record<Rsvp, "success" | "warning" | "neutral" | "danger"> = {
  yes: "success",
  maybe: "warning",
  pending: "neutral",
  no: "danger",
};

export function GuestsView() {
  const { assignment, counts } = useSeating();
  const [query, setQuery] = useState("");
  const [party, setParty] = useState(ALL);
  const [rsvp, setRsvp] = useState(ALL);
  const [diet, setDiet] = useState(ALL);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests.filter((g) => {
      if (q && !g.name.toLowerCase().includes(q)) return false;
      if (party !== ALL && g.party !== party) return false;
      if (rsvp !== ALL && g.rsvp !== rsvp) return false;
      if (diet === NONE && g.diet !== null) return false;
      if (diet !== ALL && diet !== NONE && g.diet !== diet) return false;
      return true;
    });
  }, [query, party, rsvp, diet]);

  const meals = useMemo(() => {
    const map = new Map<string, { confirmed: number; open: number; seated: number }>();
    for (const g of guests) {
      if (g.rsvp === "no") continue;
      const m = mealFor(g);
      const cur = map.get(m) ?? { confirmed: 0, open: 0, seated: 0 };
      if (g.rsvp === "yes") {
        cur.confirmed += 1;
        if (assignment[g.id]) cur.seated += 1;
      } else cur.open += 1;
      map.set(m, cur);
    }
    const list = Array.from(map.entries()).map(([meal, v]) => ({ meal, ...v }));
    list.sort((a, b) => {
      if (a.meal === MEAL_STANDARD) return -1;
      if (b.meal === MEAL_STANDARD) return 1;
      return b.confirmed - a.confirmed || a.meal.localeCompare(b.meal);
    });
    return list;
  }, [assignment]);

  const totals = meals.reduce(
    (s, m) => ({ confirmed: s.confirmed + m.confirmed, open: s.open + m.open }),
    { confirmed: 0, open: 0 },
  );

  const filtered = query !== "" || party !== ALL || rsvp !== ALL || diet !== ALL;

  return (
    <Column fillWidth maxWidth={80} gap="24">
      <Row fillWidth horizontal="between" vertical="end" gap="16" wrap>
        <Column gap="4">
          <Heading as="h1" variant="display-strong-xs">
            Guest list
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            {guests.length} invited · {counts.attending} attending · {counts.seated} seated · {counts.unseated} still to seat
          </Text>
        </Column>
        <Button size="s" variant="secondary" prefixIcon="document" onClick={() => window.print()}>
          Print for the caterer
        </Button>
      </Row>

      <Column as="section" aria-labelledby="meals-h" background="surface" border radius="l" padding="20" gap="16" fillWidth>
        <Column gap="4">
          <Heading as="h2" id="meals-h" variant="heading-strong-l">
            Meals for the caterer
          </Heading>
          <Text variant="body-default-s" onBackground="neutral-weak">
            Confirmed guests per meal. Guests who may still come (maybe or no reply) are counted separately. Declined guests are left out.
          </Text>
        </Column>
        <div className="sw-meal-grid">
          {meals.map((m) => (
            <Column key={m.meal} border radius="m" padding="16" gap="4" background="page">
              <Text variant="label-default-s" onBackground="neutral-weak">
                {m.meal}
              </Text>
              <Row gap="8" vertical="end">
                <Text variant="display-strong-xs">{m.confirmed}</Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  confirmed
                </Text>
              </Row>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                {m.open > 0 ? `+ ${m.open} not confirmed` : "No open replies"}
              </Text>
            </Column>
          ))}
          <Column border radius="m" padding="16" gap="4" background="brand-alpha-weak">
            <Text variant="label-default-s" onBackground="brand-strong">
              All meals
            </Text>
            <Row gap="8" vertical="end">
              <Text variant="display-strong-xs">{totals.confirmed}</Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                confirmed
              </Text>
            </Row>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              + {totals.open} not confirmed
            </Text>
          </Column>
        </div>
      </Column>

      <Column as="section" aria-labelledby="list-h" background="surface" border radius="l" padding="20" gap="16" fillWidth>
        <Heading as="h2" id="list-h" variant="heading-strong-l">
          All guests
        </Heading>
        <Row gap="12" wrap fillWidth vertical="end">
          <div className="sw-select-wrap" style={{ flexBasis: 240 }}>
            <Input
              id="guest-search"
              label="Search guests"
              placeholder="Search by name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="sw-select-wrap">
            <Select
              id="filter-party"
              label="Party"
              value={party}
              onSelect={(v) => setParty(String(v))}
              options={[{ label: "All parties", value: ALL }, ...parties.map((p) => ({ label: p, value: p }))]}
            />
          </div>
          <div className="sw-select-wrap">
            <Select
              id="filter-rsvp"
              label="RSVP"
              value={rsvp}
              onSelect={(v) => setRsvp(String(v))}
              options={[
                { label: "Any RSVP", value: ALL },
                ...(Object.keys(rsvpLabels) as Rsvp[]).map((k) => ({ label: rsvpLabels[k], value: k })),
              ]}
            />
          </div>
          <div className="sw-select-wrap">
            <Select
              id="filter-diet"
              label="Diet"
              value={diet}
              onSelect={(v) => setDiet(String(v))}
              options={[
                { label: "Any diet", value: ALL },
                { label: "No dietary need", value: NONE },
                ...diets.map((d) => ({ label: d, value: d })),
              ]}
            />
          </div>
          {filtered ? (
            <Button
              size="s"
              variant="tertiary"
              onClick={() => {
                setQuery("");
                setParty(ALL);
                setRsvp(ALL);
                setDiet(ALL);
              }}
            >
              Clear filters
            </Button>
          ) : null}
        </Row>

        <Text variant="body-default-s" onBackground="neutral-weak" role="status" aria-live="polite">
          Showing {rows.length} of {guests.length} guests
        </Text>

        {rows.length === 0 ? (
          <Column padding="32" horizontal="center" gap="8">
            <Text variant="heading-strong-s">No guests match</Text>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Try a different name or clear a filter.
            </Text>
          </Column>
        ) : (
          <div className="sw-table-wrap">
            <table className="sw-data">
              <caption style={{ position: "absolute", left: -9999 }}>Guests with RSVP, diet and table</caption>
              <thead>
                <tr>
                  <th scope="col">Guest</th>
                  <th scope="col">Party</th>
                  <th scope="col">RSVP</th>
                  <th scope="col">Diet</th>
                  <th scope="col">Table</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((g) => {
                  const p = assignment[g.id];
                  const table = p ? tableById.get(p.table) : null;
                  return (
                    <tr key={g.id}>
                      <td>
                        <Row gap="12" vertical="center">
                          <Avatar size="s" value={initials(g.name)} />
                          <Text variant="label-strong-s">{g.name}</Text>
                        </Row>
                      </td>
                      <td>{g.party}</td>
                      <td>
                        <Tag size="s" scheme={rsvpScheme[g.rsvp]} label={rsvpLabels[g.rsvp]} />
                      </td>
                      <td>{g.diet ? <Tag size="s" scheme="accent" label={g.diet} /> : <Text onBackground="neutral-weak">None</Text>}</td>
                      <td>
                        {table && p ? (
                          <Text variant="label-default-s">
                            {table.name}, seat {p.seat + 1}
                          </Text>
                        ) : g.rsvp === "no" ? (
                          <Text onBackground="neutral-weak">Not coming</Text>
                        ) : g.rsvp === "yes" ? (
                          <Tag size="s" scheme="warning" label="Not seated" />
                        ) : (
                          <Text onBackground="neutral-weak">Not seated</Text>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Column>
    </Column>
  );
}
```

```tsx src/components/PlanView.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Column,
  Heading,
  IconButton,
  Row,
  Tag,
  Text,
} from "@once-ui-system/core";
import { event, guests, tables } from "@/lib/data";
import { guestById, initials, tableById } from "@/lib/seating";
import { RoomPlan } from "./RoomPlan";
import { useSeating } from "./SeatProvider";

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "danger" | "success";
}) {
  return (
    <Column background="surface" border radius="l" padding="16" gap="4" fillWidth>
      <Text variant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text
        variant="display-strong-xs"
        onBackground={tone === "danger" ? "danger-strong" : tone === "success" ? "success-strong" : "neutral-strong"}
      >
        {value}
      </Text>
      {hint ? (
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {hint}
        </Text>
      ) : null}
    </Column>
  );
}

function Panel({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Column as="section" aria-label={title} background="surface" border radius="l" padding="16" gap="12" fillWidth>
      <Row horizontal="between" vertical="center" gap="8">
        <Heading as="h2" variant="heading-strong-m">
          {title}
        </Heading>
        {aside}
      </Row>
      {children}
    </Column>
  );
}

export function PlanView() {
  const { assignment, seats, counts, ruleResults, place, unseat, reset } = useSeating();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [armed, setArmed] = useState<string | null>(null);
  const [dragGuest, setDragGuest] = useState<string | null>(null);
  const [dropKey, setDropKey] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setArmed(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const unseated = useMemo(
    () => guests.filter((g) => g.rsvp === "yes" && !assignment[g.id]),
    [assignment],
  );
  const unconfirmed = guests.filter((g) => g.rsvp === "maybe" || g.rsvp === "pending").length;
  const broken = ruleResults.filter((r) => r.status === "broken");
  const pending = ruleResults.filter((r) => r.status === "pending");

  const armedGuest = armed ? guestById.get(armed) : null;

  function doPlace(guestId: string, tableId: string, seat?: number) {
    const res = place(guestId, tableId, seat);
    setStatus(res.message);
    if (res.ok) {
      setSelectedTable(tableId);
      setArmed(null);
    }
  }

  function doUnseat(guestId: string) {
    const res = unseat(guestId);
    setStatus(res.message);
    if (res.ok) setArmed(null);
  }

  function onTableClick(tableId: string) {
    if (armed) doPlace(armed, tableId);
    else setSelectedTable((cur) => (cur === tableId ? null : tableId));
  }

  function onSeatClick(tableId: string, seat: number, occupant: string | null) {
    if (armed) {
      if (occupant === armed) {
        setArmed(null);
        setStatus("Selection cleared.");
        return;
      }
      doPlace(armed, tableId, seat);
      return;
    }
    setSelectedTable(tableId);
    if (occupant) {
      setArmed(occupant);
      setStatus(`${guestById.get(occupant)?.name} selected. Tap a seat or table to move them.`);
    }
  }

  function onDrop(tableId: string, seat: number | undefined) {
    const id = dragGuest;
    setDropKey(null);
    setDragGuest(null);
    if (id) doPlace(id, tableId, seat);
  }

  function toggleArm(id: string) {
    setArmed((cur) => {
      const next = cur === id ? null : id;
      setStatus(next ? `${guestById.get(id)?.name} selected. Tap a seat or table to place them.` : "Selection cleared.");
      return next;
    });
  }

  const sel = selectedTable ? tableById.get(selectedTable) : null;
  const selSeats = selectedTable ? seats[selectedTable] : [];

  return (
    <Column fillWidth maxWidth={100} gap="20" className="sw-layout-wrap">
      <Row fillWidth horizontal="between" vertical="end" gap="16" wrap>
        <Column gap="4">
          <Heading as="h1" variant="display-strong-xs">
            Seating plan
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            {event.venue} · {event.room_m.width} × {event.room_m.depth} m room, drawn to scale
          </Text>
        </Column>
        <Button size="s" variant="tertiary" prefixIcon="refresh" onClick={() => { reset(); setArmed(null); setStatus("Plan reset to the saved seating."); }}>
          Reset plan
        </Button>
      </Row>

      <div className="sw-stats">
        <Stat label="Attending" value={String(counts.attending)} hint={`${unconfirmed} not confirmed yet`} />
        <Stat label="Seated" value={`${counts.seated}`} hint={`${counts.capacity} seats in the room`} tone="success" />
        <Stat
          label="Unseated"
          value={String(counts.unseated)}
          hint={counts.unseated === 0 ? "Everyone has a seat" : "Attending, still to place"}
        />
        <Stat
          label="Rules broken"
          value={String(broken.length)}
          hint={`${ruleResults.length} rules, ${pending.length} waiting on a seat`}
          tone={broken.length ? "danger" : "success"}
        />
      </div>

      <div role="status" aria-live="polite" className="sw-status">
        <Row
          fillWidth
          paddingX="16"
          paddingY="8"
          radius="m"
          gap="12"
          vertical="center"
          horizontal="between"
          background={armedGuest ? "accent-alpha-weak" : "neutral-alpha-weak"}
          wrap
        >
          <Text variant="body-default-s">
            {armedGuest
              ? `Placing ${armedGuest.name}: tap an empty seat to sit them there, or a table for the first free seat. Esc cancels.`
              : status || "Drag a guest onto a seat, or tap a guest, then tap where they should sit."}
          </Text>
          {armedGuest ? (
            <Row gap="8">
              {assignment[armedGuest.id] ? (
                <Button size="s" variant="secondary" prefixIcon="personRemove" onClick={() => doUnseat(armedGuest.id)}>
                  Unseat
                </Button>
              ) : null}
              <Button size="s" variant="tertiary" onClick={() => setArmed(null)}>
                Cancel
              </Button>
            </Row>
          ) : null}
        </Row>
      </div>

      <div className="sw-layout">
        <Column gap="12" fillWidth minWidth={0}>
          <RoomPlan
            selectedTable={selectedTable}
            armedGuest={armed}
            dragGuest={dragGuest}
            dropKey={dropKey}
            onTableClick={onTableClick}
            onSeatClick={onSeatClick}
            onDropTarget={setDropKey}
            onDrop={onDrop}
            onDragStart={(id) => {
              setDragGuest(id);
              setArmed(null);
            }}
            onDragEnd={() => {
              setDragGuest(null);
              setDropKey(null);
            }}
          />
          <Row gap="16" wrap vertical="center">
            <Text variant="body-default-xs" onBackground="neutral-weak">
              Scroll sideways on a small screen. Orange dot: dietary need. Red: a rule is broken.
            </Text>
          </Row>
        </Column>

        <div className="sw-aside">
          <Panel
            title="Unseated guests"
            aside={<Tag size="s" scheme={unseated.length ? "accent" : "success"} label={String(unseated.length)} />}
          >
            <div
              className={`sw-guest-list${dragGuest && assignment[dragGuest] ? " sw-guest-list--drop" : ""}`}
              onDragOver={(e) => {
                if (dragGuest && assignment[dragGuest]) e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                const id = dragGuest;
                setDragGuest(null);
                setDropKey(null);
                if (id) doUnseat(id);
              }}
            >
              {unseated.length === 0 ? (
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Everyone attending has a seat. Drag a seated guest here to unseat them.
                </Text>
              ) : (
                unseated.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    draggable
                    aria-pressed={armed === g.id}
                    className={`sw-guest${armed === g.id ? " sw-guest--armed" : ""}`}
                    onClick={() => toggleArm(g.id)}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", g.id);
                      e.dataTransfer.effectAllowed = "move";
                      setDragGuest(g.id);
                      setArmed(null);
                    }}
                    onDragEnd={() => {
                      setDragGuest(null);
                      setDropKey(null);
                    }}
                  >
                    <Avatar size="s" value={initials(g.name)} />
                    <Column gap="2" flex={1} minWidth={0}>
                      <Text variant="label-strong-s" truncate>
                        {g.name}
                      </Text>
                      <Text variant="body-default-xs" onBackground="neutral-weak" truncate>
                        {g.party}
                      </Text>
                    </Column>
                    {g.diet ? <Tag size="s" scheme="accent" label={g.diet} /> : null}
                  </button>
                ))
              )}
            </div>
          </Panel>

          <Panel
            title="Rules"
            aside={
              <Tag
                size="s"
                scheme={broken.length ? "danger" : "success"}
                label={broken.length ? `${broken.length} broken` : "All clear"}
              />
            }
          >
            <Column gap="8">
              {ruleResults.map((r) => (
                <Row
                  key={r.index}
                  gap="12"
                  padding="12"
                  radius="m"
                  border
                  background={r.status === "broken" ? "danger-alpha-weak" : "transparent"}
                  vertical="start"
                >
                  <Column gap="4" flex={1} minWidth={0}>
                    <Row gap="8" vertical="center" wrap>
                      <Tag
                        size="s"
                        scheme={r.status === "broken" ? "danger" : r.status === "ok" ? "success" : "neutral"}
                        label={r.status === "broken" ? "Broken" : r.status === "ok" ? "Kept" : "Open"}
                      />
                      <Text variant="label-strong-s">{r.title}</Text>
                    </Row>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {r.detail}
                    </Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {r.rule.note}
                    </Text>
                  </Column>
                  {r.tables.length && r.status === "broken" ? (
                    <Button size="s" variant="tertiary" onClick={() => setSelectedTable(r.tables[0])}>
                      Show
                    </Button>
                  ) : null}
                </Row>
              ))}
            </Column>
          </Panel>

          <Panel
            title={sel ? sel.name : "Tables"}
            aside={
              sel ? (
                <IconButton
                  icon="close"
                  variant="tertiary"
                  size="s"
                  ariaLabel="Close table details"
                  onClick={() => setSelectedTable(null)}
                />
              ) : undefined
            }
          >
            {sel ? (
              <Column gap="8">
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {counts.perTable[sel.id]} of {sel.seats} seats taken
                  {sel.seats - counts.perTable[sel.id] > 0 ? `, ${sel.seats - counts.perTable[sel.id]} free` : ", full"}
                </Text>
                <Column as="ol" gap="4" margin="0" padding="0" style={{ listStyle: "none" }}>
                  {selSeats.map((gid, i) => {
                    const g = gid ? guestById.get(gid) : null;
                    return (
                      <Row
                        as="li"
                        key={`${sel.id}-${i}`}
                        gap="8"
                        vertical="center"
                        paddingY="4"
                        borderBottom
                      >
                        <Text variant="label-default-xs" onBackground="neutral-weak" style={{ width: 20 }}>
                          {i + 1}
                        </Text>
                        {g ? (
                          <>
                            <Column gap="2" flex={1} minWidth={0}>
                              <Text variant="label-strong-s" truncate>
                                {g.name}
                              </Text>
                              <Text variant="body-default-xs" onBackground="neutral-weak" truncate>
                                {g.party}
                              </Text>
                            </Column>
                            <Tag
                              size="s"
                              scheme={g.diet ? "accent" : "neutral"}
                              label={g.diet ?? "No dietary need"}
                            />
                            <IconButton
                              icon="personRemove"
                              variant="tertiary"
                              size="s"
                              ariaLabel={`Unseat ${g.name}`}
                              tooltip="Unseat"
                              onClick={() => doUnseat(g.id)}
                            />
                          </>
                        ) : armedGuest ? (
                          <Button
                            size="s"
                            variant="secondary"
                            fillWidth
                            onClick={() => doPlace(armedGuest.id, sel.id, i)}
                          >
                            Seat {armedGuest.name.split(" ")[0]} here
                          </Button>
                        ) : (
                          <Text variant="body-default-s" onBackground="neutral-weak">
                            Empty seat
                          </Text>
                        )}
                      </Row>
                    );
                  })}
                </Column>
                <DietSummary tableId={sel.id} />
              </Column>
            ) : (
              <Column gap="8">
                {tables.map((t) => {
                  const n = counts.perTable[t.id];
                  const bad = ruleResults.some((r) => r.status === "broken" && r.tables.includes(t.id));
                  return (
                    <button key={t.id} type="button" className="sw-row-btn" onClick={() => onTableClick(t.id)}>
                      <Column gap="4" flex={1} minWidth={0}>
                        <Text variant="label-strong-s">{t.name}</Text>
                        <div className="sw-bar" aria-hidden="true">
                          <span style={{ width: `${(n / t.seats) * 100}%` }} />
                        </div>
                      </Column>
                      {bad ? <Tag size="s" scheme="danger" label="Rule" /> : null}
                      <Text variant="label-default-s" onBackground="neutral-weak">
                        {n}/{t.seats}
                      </Text>
                    </button>
                  );
                })}
              </Column>
            )}
          </Panel>
        </div>
      </div>
    </Column>
  );
}

function DietSummary({ tableId }: { tableId: string }) {
  const { seats } = useSeating();
  const diets = new Map<string, number>();
  for (const gid of seats[tableId]) {
    const g = gid ? guestById.get(gid) : null;
    if (g?.diet) diets.set(g.diet, (diets.get(g.diet) ?? 0) + 1);
  }
  return (
    <Column gap="4" paddingTop="8">
      <Text variant="label-default-s" onBackground="neutral-weak">
        Dietary needs at this table
      </Text>
      {diets.size === 0 ? (
        <Text variant="body-default-s">None: standard menu for everyone.</Text>
      ) : (
        <Row gap="8" wrap>
          {Array.from(diets).map(([d, n]) => (
            <Tag key={d} size="m" scheme="accent" label={`${n} × ${d}`} />
          ))}
        </Row>
      )}
    </Column>
  );
}
```

```tsx src/components/RoomPlan.tsx
"use client";

import { event, fixtures, tables } from "@/lib/data";
import {
  LONG_DEPTH,
  LONG_LEN,
  ROUND_R,
  guestById,
  initials,
  seatPositions,
} from "@/lib/seating";
import { useSeating } from "./SeatProvider";

const W = event.room_m.width;
const D = event.room_m.depth;
const pctX = (m: number) => `${(m / W) * 100}%`;
const pctY = (m: number) => `${(m / D) * 100}%`;

interface RoomPlanProps {
  selectedTable: string | null;
  armedGuest: string | null;
  dragGuest: string | null;
  dropKey: string | null;
  onTableClick: (tableId: string) => void;
  onSeatClick: (tableId: string, seat: number, occupant: string | null) => void;
  onDropTarget: (key: string | null) => void;
  onDrop: (tableId: string, seat: number | undefined) => void;
  onDragStart: (guestId: string) => void;
  onDragEnd: () => void;
}

export function RoomPlan({
  selectedTable,
  armedGuest,
  dragGuest,
  dropKey,
  onTableClick,
  onSeatClick,
  onDropTarget,
  onDrop,
  onDragStart,
  onDragEnd,
}: RoomPlanProps) {
  const { seats, counts, ruleResults } = useSeating();

  const brokenTables = new Set<string>();
  const brokenGuests = new Set<string>();
  for (const r of ruleResults) {
    if (r.status !== "broken") continue;
    r.tables.forEach((t) => brokenTables.add(t));
    r.rule.guests.forEach((g) => brokenGuests.add(g));
  }

  const holding = armedGuest ?? dragGuest;

  return (
    <div className="sw-room-scroll" role="group" aria-label={`Floor plan of ${event.venue}, ${W} by ${D} metres`}>
      <div className="sw-room">
        {fixtures.map((f) => (
          <div
            key={f.id}
            className={`sw-fixture sw-fixture--${f.kind}`}
            style={{
              left: pctX(f.x),
              top: pctY(f.y),
              width: pctX(f.w),
              height: pctY(f.h),
            }}
          >
            {f.kind === "door" ? null : f.label}
          </div>
        ))}
        {fixtures
          .filter((f) => f.kind === "door")
          .map((f) => (
            <div
              key={`${f.id}-label`}
              className="sw-door-label"
              style={{
                left: pctX(f.x + f.w + 0.12),
                top: pctY(f.y),
                height: pctY(f.h),
              }}
            >
              {f.label}
            </div>
          ))}

        {tables.map((t) => {
          const round = t.shape === "round";
          const flagged = brokenTables.has(t.id);
          const count = counts.perTable[t.id];
          const key = t.id;
          const style = round
            ? {
                left: pctX(t.x - ROUND_R),
                top: pctY(t.y - ROUND_R),
                width: pctX(ROUND_R * 2),
                height: pctY(ROUND_R * 2),
              }
            : {
                left: pctX(t.x),
                top: pctY(t.y),
                width: pctX(LONG_LEN),
                height: pctY(LONG_DEPTH),
                transform: `rotate(${t.rotation ?? 0}deg)`,
              };
          return (
            <button
              key={t.id}
              type="button"
              className={[
                "sw-table",
                round ? "sw-table--round" : "sw-table--long",
                selectedTable === t.id ? "sw-table--selected" : "",
                flagged ? "sw-table--broken" : "",
                dropKey === key ? "sw-table--drop" : "",
              ].join(" ")}
              style={style}
              aria-pressed={selectedTable === t.id}
              aria-label={`${t.name}, ${count} of ${t.seats} seats taken${
                flagged ? ", a rule is broken here" : ""
              }`}
              onClick={() => onTableClick(t.id)}
              onDragOver={(e) => {
                if (!dragGuest) return;
                e.preventDefault();
                onDropTarget(key);
              }}
              onDragLeave={() => onDropTarget(null)}
              onDrop={(e) => {
                e.preventDefault();
                onDrop(t.id, undefined);
              }}
            >
              <span className="sw-table-name" data-text={t.name} />
              <span className="sw-table-count" data-text={`${count}/${t.seats}`} />
            </button>
          );
        })}

        {tables.map((t) => {
          const pos = seatPositions(t);
          return pos.map((p, i) => {
            const occupant = seats[t.id][i];
            const guest = occupant ? guestById.get(occupant) : null;
            const key = `${t.id}:${i}`;
            const armed = occupant !== null && occupant === armedGuest;
            const bad = occupant !== null && brokenGuests.has(occupant);
            const label = guest
              ? `${t.name}, seat ${i + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}${
                  bad ? ", involved in a broken rule" : ""
                }`
              : `${t.name}, seat ${i + 1}, empty`;
            return (
              <button
                key={key}
                type="button"
                className={[
                  "sw-seat",
                  guest ? "sw-seat--filled" : "sw-seat--empty",
                  bad ? "sw-seat--bad" : "",
                  armed ? "sw-seat--armed" : "",
                  dropKey === key ? "sw-seat--drop" : "",
                  !guest && holding ? "sw-seat--target" : "",
                ].join(" ")}
                data-text={guest ? initials(guest.name) : String(i + 1)}
                style={{ left: pctX(p.x), top: pctY(p.y) }}
                aria-label={label}
                title={guest ? guest.name : `${t.name}, seat ${i + 1} (empty)`}
                draggable={guest ? true : undefined}
                onClick={() => onSeatClick(t.id, i, occupant)}
                onDragStart={(e) => {
                  if (!occupant) return;
                  e.dataTransfer.setData("text/plain", occupant);
                  e.dataTransfer.effectAllowed = "move";
                  onDragStart(occupant);
                }}
                onDragEnd={onDragEnd}
                onDragOver={(e) => {
                  if (!dragGuest) return;
                  e.preventDefault();
                  e.stopPropagation();
                  onDropTarget(key);
                }}
                onDragLeave={() => onDropTarget(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDrop(t.id, i);
                }}
              >
                {guest?.diet ? <span className="sw-diet-dot" aria-hidden="true" /> : null}
              </button>
            );
          });
        })}
      </div>
    </div>
  );
}
```

```tsx src/components/SeatProvider.tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  countsFor,
  evaluateRules,
  initialAssignment,
  placeGuest,
  seatMap,
  unseatGuest,
  type Assignment,
  type Counts,
  type RuleResult,
} from "@/lib/seating";

interface SeatContextValue {
  assignment: Assignment;
  seats: Record<string, (string | null)[]>;
  counts: Counts;
  ruleResults: RuleResult[];
  place: (guestId: string, tableId: string, seat?: number) => { ok: boolean; message: string };
  unseat: (guestId: string) => { ok: boolean; message: string };
  reset: () => void;
}

const SeatContext = createContext<SeatContextValue | null>(null);

export function SeatProvider({ children }: { children: React.ReactNode }) {
  const [assignment, setAssignment] = useState<Assignment>(initialAssignment);

  const place = useCallback(
    (guestId: string, tableId: string, seat?: number) => {
      const res = placeGuest(assignment, guestId, tableId, seat);
      if (res.ok) setAssignment(res.next);
      return { ok: res.ok, message: res.message };
    },
    [assignment],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const res = unseatGuest(assignment, guestId);
      if (res.ok) setAssignment(res.next);
      return { ok: res.ok, message: res.message };
    },
    [assignment],
  );

  const reset = useCallback(() => setAssignment(initialAssignment()), []);

  const value = useMemo<SeatContextValue>(
    () => ({
      assignment,
      seats: seatMap(assignment),
      counts: countsFor(assignment),
      ruleResults: evaluateRules(assignment),
      place,
      unseat,
      reset,
    }),
    [assignment, place, unseat, reset],
  );

  return <SeatContext.Provider value={value}>{children}</SeatContext.Provider>;
}

export function useSeating(): SeatContextValue {
  const ctx = useContext(SeatContext);
  if (!ctx) throw new Error("useSeating must be used inside SeatProvider");
  return ctx;
}
```

```tsx src/components/Shell.tsx
"use client";

import { usePathname } from "next/navigation";
import { Avatar, Button, Column, Row, Text, VisuallyHidden } from "@once-ui-system/core";
import { event, planner } from "@/lib/data";

const SEATWISE_ROUTES = ["/", "/guests"];

function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (!SEATWISE_ROUTES.includes(pathname)) return <>{children}</>;

  return (
    <Column fillWidth>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row
        as="header"
        fillWidth
        background="surface"
        borderBottom
        paddingX="24"
        paddingY="12"
        gap="16"
        vertical="center"
        wrap
        className="sw-header"
      >
        <Row gap="12" vertical="center">
          <Row
            width="32"
            height="32"
            radius="m"
            solid="brand-strong"
            center
            aria-hidden="true"
            onSolid="brand-strong"
          >
            <Text variant="label-strong-m">S</Text>
          </Row>
          <Column gap="2">
            <Text variant="heading-strong-m">Seatwise</Text>
          </Column>
        </Row>

        <Column gap="2" flex={1} minWidth={12} s={{ hide: true }}>
          <Text variant="label-strong-m" truncate>
            {event.name}
          </Text>
          <Text variant="body-default-s" onBackground="neutral-weak" truncate>
            {formatDate(event.date)} · {event.venue}
          </Text>
        </Column>

        <Row as="nav" aria-label="Main" gap="4" vertical="center">
          <Button
            href="/"
            size="s"
            variant={pathname === "/" ? "secondary" : "tertiary"}
            prefixIcon="grid"
            aria-current={pathname === "/" ? "page" : undefined}
          >
            Plan
          </Button>
          <Button
            href="/guests"
            size="s"
            variant={pathname === "/guests" ? "secondary" : "tertiary"}
            prefixIcon="people"
            aria-current={pathname === "/guests" ? "page" : undefined}
          >
            Guests
          </Button>
        </Row>

        <Row gap="8" vertical="center" s={{ hide: true }}>
          <Avatar size="s" value="HB" />
          <Text variant="label-default-s">{planner.name}</Text>
        </Row>
      </Row>
      <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24">
        {children}
      </Column>
    </Column>
  );
}
```

```ts src/lib/data.ts
export type Rsvp = "yes" | "maybe" | "pending" | "no";

export interface Fixture {
  id: string;
  kind: "stage" | "dancefloor" | "bar" | "door";
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SeatTable {
  id: string;
  name: string;
  shape: "long" | "round";
  seats: number;
  x: number;
  y: number;
  rotation?: number;
}

export interface Guest {
  id: string;
  name: string;
  party: string;
  rsvp: Rsvp;
  diet: string | null;
  table: string | null;
}

export type RuleKind = "together" | "apart" | "near";

export interface Rule {
  kind: RuleKind;
  guests: string[];
  note: string;
}

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

export const tables: SeatTable[] = [
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

export const guests: Guest[] = [
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

export const rules: Rule[] = [
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
];

export const rsvpLabels: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "No reply yet",
  no: "Declined",
};
```

```ts src/lib/seating.ts
import {
  fixtures,
  guests,
  rules,
  tables,
  type Guest,
  type Rule,
  type SeatTable,
} from "./data";

export interface Placement {
  table: string;
  seat: number;
}

export type Assignment = Record<string, Placement | null>;

export const guestById = new Map<string, Guest>(guests.map((x) => [x.id, x]));
export const tableById = new Map<string, SeatTable>(tables.map((x) => [x.id, x]));

export function initialAssignment(): Assignment {
  const next: Assignment = {};
  const used: Record<string, number> = {};
  for (const guest of guests) {
    if (guest.table && tableById.has(guest.table)) {
      const seat = used[guest.table] ?? 0;
      used[guest.table] = seat + 1;
      next[guest.id] = { table: guest.table, seat };
    } else {
      next[guest.id] = null;
    }
  }
  return next;
}

/** For each table, the guest id in each seat (null = empty). */
export function seatMap(a: Assignment): Record<string, (string | null)[]> {
  const map: Record<string, (string | null)[]> = {};
  for (const t of tables) map[t.id] = Array.from({ length: t.seats }, () => null);
  for (const [id, p] of Object.entries(a)) {
    if (p && map[p.table]) map[p.table][p.seat] = id;
  }
  return map;
}

export interface PlaceResult {
  next: Assignment;
  ok: boolean;
  message: string;
}

export function placeGuest(
  a: Assignment,
  guestId: string,
  tableId: string,
  seat?: number,
): PlaceResult {
  const guest = guestById.get(guestId);
  const table = tableById.get(tableId);
  if (!guest || !table) return { next: a, ok: false, message: "Nothing to place." };
  if (guest.rsvp === "no") {
    return { next: a, ok: false, message: `${guest.name} has declined and cannot be seated.` };
  }
  const map = seatMap(a);
  const seats = map[tableId];
  const from = a[guestId] ?? null;
  let target = seat;
  if (target === undefined) {
    if (from && from.table === tableId) {
      return { next: a, ok: true, message: `${guest.name} is already at ${table.name}.` };
    }
    target = seats.findIndex((s) => s === null);
    if (target < 0) {
      return { next: a, ok: false, message: `${table.name} is full (${table.seats} of ${table.seats}).` };
    }
  }
  const occupant = seats[target];
  if (occupant === guestId) {
    return { next: a, ok: true, message: `${guest.name} stays in seat ${target + 1}.` };
  }
  const next: Assignment = { ...a };
  next[guestId] = { table: tableId, seat: target };
  if (occupant) {
    const other = guestById.get(occupant);
    next[occupant] = from;
    const where = from ? `${tableById.get(from.table)?.name}` : "the unseated list";
    return {
      next,
      ok: true,
      message: `${guest.name} now at ${table.name}, seat ${target + 1}. ${other?.name ?? "Guest"} moved to ${where}.`,
    };
  }
  return {
    next,
    ok: true,
    message: `${guest.name} seated at ${table.name}, seat ${target + 1}.`,
  };
}

export function unseatGuest(a: Assignment, guestId: string): PlaceResult {
  const guest = guestById.get(guestId);
  if (!guest || !a[guestId]) return { next: a, ok: false, message: "Already unseated." };
  return { next: { ...a, [guestId]: null }, ok: true, message: `${guest.name} unseated.` };
}

/* ---------- geometry ---------- */

export const SEAT_R = 0.38;
export const ROUND_R = 0.95;
export const LONG_DEPTH = 1.1;
export const LONG_LEN = 8;

export function tableCentre(t: SeatTable): { x: number; y: number } {
  if (t.shape === "long") return { x: t.x + LONG_LEN / 2, y: t.y + LONG_DEPTH / 2 };
  return { x: t.x, y: t.y };
}

export function seatPositions(t: SeatTable): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  if (t.shape === "round") {
    const ring = ROUND_R + 0.52;
    for (let i = 0; i < t.seats; i++) {
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
      out.push({ x: t.x + ring * Math.cos(ang), y: t.y + ring * Math.sin(ang) });
    }
    return out;
  }
  const c = tableCentre(t);
  const rot = ((t.rotation ?? 0) * Math.PI) / 180;
  for (let i = 0; i < t.seats; i++) {
    const lx = -LONG_LEN / 2 + ((i + 0.5) * LONG_LEN) / t.seats;
    const ly = -LONG_DEPTH / 2 - 0.5;
    out.push({
      x: c.x + lx * Math.cos(rot) - ly * Math.sin(rot),
      y: c.y + lx * Math.sin(rot) + ly * Math.cos(rot),
    });
  }
  return out;
}

function fixtureCentre(kind: string): { x: number; y: number } {
  const f = fixtures.find((x) => x.kind === kind);
  if (!f) return { x: 0, y: 0 };
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export const NEAR_DOOR_M = 4.5;
export const AWAY_BAND_M = 6;

export function distanceToDoors(tableId: string): number {
  const t = tableById.get(tableId);
  return t ? dist(tableCentre(t), fixtureCentre("door")) : 0;
}

export function distanceToBand(tableId: string): number {
  const t = tableById.get(tableId);
  return t ? dist(tableCentre(t), fixtureCentre("stage")) : 0;
}

/* ---------- rules ---------- */

export type RuleStatus = "ok" | "broken" | "pending";

export interface RuleResult {
  index: number;
  rule: Rule;
  status: RuleStatus;
  tables: string[];
  title: string;
  detail: string;
}

const first = (id: string) => (guestById.get(id)?.name ?? id).split(" ")[0];

export function evaluateRules(a: Assignment): RuleResult[] {
  return rules.map((rule, index): RuleResult => {
    const names = rule.guests.map((id) => guestById.get(id)?.name ?? id);
    const places = rule.guests.map((id) => a[id] ?? null);
    const seatedTables = Array.from(
      new Set(places.filter((p): p is Placement => p !== null).map((p) => p.table)),
    );
    const tname = (id: string) => tableById.get(id)?.name ?? id;

    if (rule.kind === "together") {
      const title = `Keep ${names.join(" and ")} together`;
      if (places.some((p) => p === null)) {
        const missing = rule.guests.filter((_, i) => places[i] === null).map(first);
        return {
          index,
          rule,
          status: "pending",
          tables: seatedTables,
          title,
          detail: `Waiting to seat ${missing.join(" and ")}.`,
        };
      }
      if (seatedTables.length === 1) {
        return { index, rule, status: "ok", tables: seatedTables, title, detail: `Together at ${tname(seatedTables[0])}.` };
      }
      return {
        index,
        rule,
        status: "broken",
        tables: seatedTables,
        title,
        detail: `Split across ${seatedTables.map(tname).join(" and ")}.`,
      };
    }

    if (rule.kind === "apart") {
      const title = `Keep ${names.join(" and ")} apart`;
      if (places.every((p) => p !== null) && seatedTables.length === 1) {
        return {
          index,
          rule,
          status: "broken",
          tables: seatedTables,
          title,
          detail: `Both at ${tname(seatedTables[0])}.`,
        };
      }
      return {
        index,
        rule,
        status: "ok",
        tables: seatedTables,
        title,
        detail: seatedTables.length === 0 ? "Neither is seated yet." : "At different tables or not yet seated.",
      };
    }

    // near: the guest sits close to the garden doors and away from the band
    const title = `Seat ${names[0]} near the garden doors`;
    const p = places[0];
    if (!p) {
      return { index, rule, status: "pending", tables: [], title, detail: "Not seated yet." };
    }
    const d = distanceToDoors(p.table);
    const b = distanceToBand(p.table);
    const ok = d <= NEAR_DOOR_M && b >= AWAY_BAND_M;
    return {
      index,
      rule,
      status: ok ? "ok" : "broken",
      tables: [p.table],
      title,
      detail: ok
        ? `${tname(p.table)} is ${d.toFixed(1)} m from the doors and ${b.toFixed(1)} m from the band.`
        : d > NEAR_DOOR_M
          ? `${tname(p.table)} is ${d.toFixed(1)} m from the doors (limit ${NEAR_DOOR_M} m).`
          : `${tname(p.table)} is only ${b.toFixed(1)} m from the band (needs ${AWAY_BAND_M} m).`,
    };
  });
}

/* ---------- counts ---------- */

export interface Counts {
  attending: number;
  seated: number;
  unseated: number;
  capacity: number;
  perTable: Record<string, number>;
}

export function countsFor(a: Assignment): Counts {
  const attending = guests.filter((x) => x.rsvp === "yes");
  const perTable: Record<string, number> = {};
  for (const t of tables) perTable[t.id] = 0;
  let seated = 0;
  for (const x of guests) {
    const p = a[x.id];
    if (p) {
      perTable[p.table] += 1;
      if (x.rsvp === "yes") seated += 1;
    }
  }
  return {
    attending: attending.length,
    seated,
    unseated: attending.filter((x) => !a[x.id]).length,
    capacity: tables.reduce((s, t) => s + t.seats, 0),
    perTable,
  };
}

export function initials(name: string): string {
  const parts = name.replace(/[^\p{L}\s]/gu, "").split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const MEAL_STANDARD = "Standard menu";

export function mealFor(g: Guest): string {
  return g.diet ?? MEAL_STANDARD;
}
```

```css src/resources/seatwise.css
.sw-header { position: sticky; top: 0; z-index: 5; }
.sw-layout { display: grid; gap: 24px; width: 100%; grid-template-columns: minmax(0, 1fr); }
.sw-aside { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); align-content: start; }
@media (min-width: 1280px) {
  .sw-layout { grid-template-columns: minmax(0, 1fr) 380px; align-items: start; }
  .sw-aside { grid-template-columns: minmax(0, 1fr); }
}
.sw-stats { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); width: 100%; }

.sw-room-scroll { overflow-x: auto; border-radius: var(--radius-l); }
.sw-room {
  --m: calc(100cqw / 24);
  position: relative; container-type: inline-size; width: 100%; min-width: 720px; aspect-ratio: 24 / 14; overflow: hidden;
  background-color: var(--neutral-background-weak);
  background-image: linear-gradient(var(--neutral-alpha-weak) 1px, transparent 1px), linear-gradient(90deg, var(--neutral-alpha-weak) 1px, transparent 1px);
  background-size: 4.1667% 7.1429%;
  border: 2px solid var(--neutral-alpha-medium); border-radius: var(--radius-l);
}
.sw-fixture {
  position: absolute; display: flex; align-items: center; justify-content: center; text-align: center;
  font-size: clamp(10px, calc(var(--m) * 0.32), 15px); font-weight: 600; color: var(--neutral-on-background-medium);
  border-radius: calc(var(--m) * 0.2); pointer-events: none; user-select: none;
}
.sw-fixture--stage { background: var(--neutral-alpha-medium); border: 1.5px solid var(--neutral-alpha-strong); }
.sw-fixture--dancefloor {
  background-image: repeating-conic-gradient(var(--brand-alpha-weak) 0% 25%, transparent 0% 50%);
  background-size: var(--m) var(--m); border: 1.5px dashed var(--brand-alpha-strong); color: var(--brand-on-background-strong);
}
.sw-fixture--bar { background: var(--accent-alpha-medium); border: 1.5px solid var(--accent-alpha-strong); }
.sw-fixture--door { background: var(--info-alpha-medium); border: 1.5px solid var(--info-alpha-strong); border-radius: 0; }
.sw-door-label {
  position: absolute; display: flex; align-items: center; justify-content: center; writing-mode: vertical-rl; transform: rotate(180deg);
  font-size: clamp(9px, calc(var(--m) * 0.28), 13px); font-weight: 600; color: var(--info-on-background-strong); pointer-events: none; white-space: nowrap;
}

.sw-table {
  position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0;
  font: inherit; line-height: 1.15; color: var(--neutral-on-background-strong); cursor: pointer;
  background: var(--surface-background); border: 2px solid var(--neutral-alpha-strong);
  transition: box-shadow 0.15s, border-color 0.15s, background 0.15s;
}
.sw-table--round { border-radius: 50%; }
.sw-table--long { border-radius: calc(var(--m) * 0.25); }
.sw-table:hover, .sw-table--selected { border-color: var(--brand-solid-strong); }
.sw-table--selected { box-shadow: 0 0 0 calc(var(--m) * 0.1) var(--brand-alpha-medium); }
.sw-table--broken { border-color: var(--danger-solid-strong); box-shadow: 0 0 0 calc(var(--m) * 0.1) var(--danger-alpha-medium); }
.sw-table--drop { background: var(--brand-alpha-weak); border: 2px dashed var(--brand-solid-strong); }
.sw-table-name { font-size: clamp(10px, calc(var(--m) * 0.34), 16px); font-weight: 700; }
.sw-table-count { font-size: clamp(9px, calc(var(--m) * 0.28), 13px); color: var(--neutral-on-background-medium); }

.sw-seat {
  position: absolute; display: flex; align-items: center; justify-content: center; padding: 0;
  width: calc(var(--m) * 0.76); height: calc(var(--m) * 0.76); min-width: 24px; min-height: 24px;
  transform: translate(-50%, -50%); border-radius: 50%; touch-action: manipulation; cursor: pointer;
  font: inherit; font-size: clamp(9px, calc(var(--m) * 0.27), 13px); font-weight: 700; color: var(--neutral-on-background-strong);
  background: var(--neutral-background-strong); border: 1.5px solid var(--neutral-alpha-strong);
  transition: transform 0.12s, box-shadow 0.12s, background 0.12s;
}
.sw-seat:hover { transform: translate(-50%, -50%) scale(1.12); }
.sw-seat--empty { background: transparent; border-style: dashed; color: var(--neutral-on-background-weak); font-weight: 500; }
.sw-seat--filled { background: var(--brand-background-strong); border-color: var(--brand-solid-strong); cursor: grab; }
.sw-seat--bad { background: var(--danger-background-strong); border-color: var(--danger-solid-strong); }
.sw-seat--armed { background: var(--accent-background-strong); border-color: var(--accent-solid-strong); box-shadow: 0 0 0 3px var(--accent-solid-strong); }
.sw-seat--target { background: var(--brand-alpha-weak); border-style: solid; border-color: var(--brand-solid-strong); }
.sw-seat--drop { background: var(--brand-alpha-medium); border-style: solid; box-shadow: 0 0 0 3px var(--brand-solid-strong); }
.sw-seat::before, .sw-table-name::before, .sw-table-count::before { content: attr(data-text); }
.sw-diet-dot { position: absolute; right: -3px; bottom: -3px; width: 9px; height: 9px; border-radius: 50%; background: var(--accent-solid-strong); border: 1.5px solid var(--surface-background); }
.sw-seat:focus-visible, .sw-table:focus-visible, .sw-guest:focus-visible, .sw-row-btn:focus-visible { outline: 3px solid var(--brand-solid-strong); outline-offset: 2px; }

.sw-guest, .sw-row-btn {
  display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 12px; min-height: 48px;
  font: inherit; text-align: left; color: inherit; border: 1px solid var(--neutral-alpha-weak); border-radius: var(--radius-m); touch-action: manipulation;
}
.sw-guest { background: var(--surface-background); cursor: grab; }
.sw-row-btn { background: transparent; cursor: pointer; }
.sw-guest:hover, .sw-row-btn:hover { border-color: var(--neutral-alpha-strong); }
.sw-guest--armed { border-color: var(--accent-solid-strong); box-shadow: 0 0 0 2px var(--accent-solid-strong); background: var(--accent-background-weak); }
.sw-guest-list { display: flex; flex-direction: column; gap: 8px; max-height: 420px; overflow-y: auto; padding: 2px; }
.sw-guest-list--drop { outline: 2px dashed var(--brand-solid-strong); outline-offset: 2px; border-radius: var(--radius-m); }
.sw-bar { height: 6px; width: 100%; border-radius: 3px; background: var(--neutral-alpha-weak); overflow: hidden; }
.sw-bar > span { display: block; height: 100%; background: var(--brand-solid-strong); }

.sw-table-wrap { width: 100%; overflow-x: auto; }
.sw-data { width: 100%; border-collapse: collapse; font-size: 0.9rem; min-width: 640px; }
.sw-data th { text-align: left; font-weight: 600; font-size: 0.78rem; text-transform: uppercase; color: var(--neutral-on-background-weak); padding: 10px 12px; border-bottom: 1px solid var(--neutral-alpha-medium); white-space: nowrap; }
.sw-data td { padding: 10px 12px; border-bottom: 1px solid var(--neutral-alpha-weak); vertical-align: middle; color: var(--neutral-on-background-strong); }
.sw-data tr:hover td { background: var(--neutral-alpha-weak); }
.sw-meal-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); width: 100%; }
.sw-select-wrap { min-width: 170px; flex: 1 1 170px; }
@media (prefers-reduced-motion: reduce) { .sw-seat, .sw-table { transition: none; } }
```

