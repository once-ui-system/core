```tsx app/guests/page.tsx
import { GuestsView } from "@/components/GuestsView";

export const metadata = { title: "Guest list · Seatwise" };

export default function GuestsPage() {
  return <GuestsView />;
}
```

```tsx app/layout.tsx
import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "./fonts.css";

import type { Metadata } from "next";
import { Column, Flex } from "@once-ui-system/core";
import { Providers } from "./providers";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "Seatwise: seating plan",
  description: "Seatwise, a seating planner for wedding and event planners.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="html" lang="en" suppressHydrationWarning>
      <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </Column>
    </Flex>
  );
}
```

```tsx app/page.tsx
import { PlanView } from "@/components/PlanView";

export default function Page() {
  return <PlanView />;
}
```

```tsx app/providers.tsx
"use client";

// Standard Once UI provider stack (mirrors the official Next.js starter):
// theme, Next-aware links/images, chart theme, toasts, icons.
// The seating plan state sits inside it so the plan and the guest list share one session.
import { DataThemeProvider, IconProvider, ThemeProvider, ToastProvider } from "@once-ui-system/core";
import { LayoutProvider } from "@once-ui-system/core/next";
import { PlanProvider } from "@/components/PlanProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LayoutProvider>
        <DataThemeProvider>
          <ToastProvider>
            <IconProvider>
              <PlanProvider>{children}</PlanProvider>
            </IconProvider>
          </ToastProvider>
        </DataThemeProvider>
      </LayoutProvider>
    </ThemeProvider>
  );
}
```

```tsx components/GuestsView.tsx
"use client";

import { Button, Column, Dropdown, Heading, Option, Row, SegmentedControl, Table, Tag, Text, useToast } from "@once-ui-system/core";
import { useMemo, useState } from "react";
import { guests, type Guest, type Rsvp } from "@/lib/data";
import { rsvpLabel, rsvpTone, STANDARD_MEAL, tableById } from "@/lib/plan";
import { usePlan } from "./PlanProvider";

type GuestRow = {
  id: string;
  name: string;
  party: string;
  rsvp: Rsvp;
  diet: string | null;
  tableId: string | null;
  tableName: string;
};

type MealRow = {
  meal: string;
  confirmed: number;
  unconfirmed: number;
  who: string;
};

const parties = [...new Set(guests.map((g) => g.party))];
const diets = [...new Set(guests.flatMap((g) => (g.diet ? [g.diet] : [])))].sort();

function FilterMenu({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const current = options.find((o) => o.value === value);
  return (
    <Dropdown
      selectedOption={value}
      onSelect={onChange}
      trigger={
        <Button variant="secondary" size="s" suffixIcon="chevronDown">
          {label}: {current?.label ?? "All"}
        </Button>
      }
    >
      <Column padding="4" gap="2" minWidth={220}>
        {options.map((o) => (
          <Option key={o.value} value={o.value} label={o.label} selected={o.value === value} />
        ))}
      </Column>
    </Dropdown>
  );
}

export function GuestsView() {
  const plan = usePlan();
  const { addToast } = useToast();
  const [rsvp, setRsvp] = useState("all");
  const [party, setParty] = useState("all");
  const [diet, setDiet] = useState("all");

  const all: GuestRow[] = useMemo(
    () =>
      guests.map((g: Guest) => {
        const tableId = plan.tableOf(g.id);
        return {
          id: g.id,
          name: g.name,
          party: g.party,
          rsvp: g.rsvp,
          diet: g.diet,
          tableId,
          tableName: tableId ? (tableById.get(tableId)?.name ?? "") : "",
        };
      }),
    [plan],
  );

  const rows = all.filter(
    (r) =>
      (rsvp === "all" || r.rsvp === rsvp) &&
      (party === "all" || r.party === party) &&
      (diet === "all" || (diet === "none" ? r.diet === null : r.diet === diet)),
  );
  const filtering = rsvp !== "all" || party !== "all" || diet !== "all";

  const meals: MealRow[] = useMemo(() => {
    const map = new Map<string, MealRow & { names: string[] }>();
    for (const r of all) {
      if (r.rsvp === "no") continue;
      const key = r.diet ?? STANDARD_MEAL;
      const entry = map.get(key) ?? { meal: key, confirmed: 0, unconfirmed: 0, who: "", names: [] };
      if (r.rsvp === "yes") {
        entry.confirmed += 1;
        if (r.diet) entry.names.push(`${r.name} (${r.tableName || "unseated"})`);
      } else {
        entry.unconfirmed += 1;
      }
      map.set(key, entry);
    }
    return [...map.values()]
      .map((e) => ({ meal: e.meal, confirmed: e.confirmed, unconfirmed: e.unconfirmed, who: e.names.join(", ") }))
      .sort((a, b) => {
        if (a.meal === STANDARD_MEAL) return -1;
        if (b.meal === STANDARD_MEAL) return 1;
        return b.confirmed - a.confirmed || a.meal.localeCompare(b.meal);
      });
  }, [all]);

  const confirmedTotal = meals.reduce((s, m) => s + m.confirmed, 0);
  const unconfirmedTotal = meals.reduce((s, m) => s + m.unconfirmed, 0);
  const dietaryConfirmed = confirmedTotal - (meals.find((m) => m.meal === STANDARD_MEAL)?.confirmed ?? 0);

  const copyCounts = async () => {
    const text = [
      "Ines & Mateo's wedding dinner: meal counts (confirmed guests)",
      ...meals.map((m) => `${m.meal}: ${m.confirmed}${m.who ? ` (${m.who})` : ""}`),
      `Total: ${confirmedTotal}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      addToast({ tone: "success", message: "Meal counts copied for the caterer." });
    } catch {
      addToast({ tone: "danger", message: "Could not copy. Select the table and copy it by hand." });
    }
  };

  return (
    <Column as="main" id="main" fillWidth padding="16" gap="16" horizontal="center">
      <Column fillWidth maxWidth="xl" gap="16">
        <Row fillWidth horizontal="between" vertical="end" gap="16" s={{ direction: "column", horizontal: "start" }}>
          <Column gap="4">
            <Heading as="h1" textVariant="display-strong-xs">
              Guest list
            </Heading>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {guests.length} invited · {confirmedTotal} attending · {unconfirmedTotal} not confirmed · {plan.stats.declined} declined
            </Text>
          </Column>
          <Button size="s" href="/" variant="secondary" prefixIcon="grid">
            Seating plan
          </Button>
        </Row>

        <Row gap="16" vertical="start" m={{ direction: "column" }}>
          <Column flex="1" gap="12" style={{ minWidth: 0 }} m={{ fillWidth: true }}>
            <Row gap="8" vertical="center" wrap>
              <SegmentedControl
                fillWidth={false}
                value={rsvp}
                onValueChange={setRsvp}
                buttons={[
                  { value: "all", label: "All" },
                  { value: "yes", label: "Attending" },
                  { value: "maybe", label: "Maybe" },
                  { value: "pending", label: "Awaiting" },
                  { value: "no", label: "Declined" },
                ]}
              />
              <FilterMenu
                label="Party"
                value={party}
                onChange={setParty}
                options={[{ value: "all", label: "All parties" }, ...parties.map((p) => ({ value: p, label: p }))]}
              />
              <FilterMenu
                label="Diet"
                value={diet}
                onChange={setDiet}
                options={[
                  { value: "all", label: "All diets" },
                  { value: "none", label: "No dietary need" },
                  ...diets.map((d) => ({ value: d, label: d })),
                ]}
              />
              {filtering ? (
                <Button
                  size="s"
                  variant="ghost"
                  prefixIcon="close"
                  onClick={() => {
                    setRsvp("all");
                    setParty("all");
                    setDiet("all");
                  }}
                >
                  Clear filters
                </Button>
              ) : null}
              <Text textVariant="body-default-xs" onBackground="neutral-weak" aria-live="polite">
                Showing {rows.length} of {guests.length}
              </Text>
            </Row>
            <Table<GuestRow>
              searchable
              searchPlaceholder="Search name, party, diet or table"
              aria-label="Guest list"
              rows={rows}
              getRowId={(r) => r.id}
              matchSearch={(r, q) =>
                `${r.name} ${r.party} ${r.diet ?? ""} ${r.tableName} ${rsvpLabel[r.rsvp]}`.toLowerCase().includes(q.toLowerCase())
              }
              defaultSort={{ key: "name", direction: "asc" }}
              emptyState={
                <Column center gap="12" padding="32">
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    No guests match these filters.
                  </Text>
                  <Button
                    size="s"
                    variant="secondary"
                    onClick={() => {
                      setRsvp("all");
                      setParty("all");
                      setDiet("all");
                    }}
                  >
                    Show everyone
                  </Button>
                </Column>
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
                  cell: (r) => <Text textVariant="body-default-s">{r.party}</Text>,
                  hide: { xs: true },
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
                  sort: (a, b) => a.tableName.localeCompare(b.tableName),
                  cell: (r) =>
                    r.tableName ? (
                      <Text textVariant="label-default-s">{r.tableName}</Text>
                    ) : r.rsvp === "no" ? (
                      <Text textVariant="body-default-s" onBackground="neutral-weak">
                        Not coming
                      </Text>
                    ) : (
                      <Tag size="s" tone="neutral" label="Unseated" />
                    ),
                },
              ]}
            />
          </Column>

          <Column
            background="surface"
            border
            radius="l"
            padding="16"
            gap="12"
            width="26rem"
            m={{ fillWidth: true, width: "100%" }}
            role="region"
            aria-labelledby="meals-title"
          >
            <Row horizontal="between" vertical="center" gap="8">
              <Text as="h2" id="meals-title" textVariant="heading-strong-m">
                Meals for the caterer
              </Text>
              <Button size="s" variant="secondary" prefixIcon="copy" onClick={copyCounts}>
                Copy
              </Button>
            </Row>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              Confirmed guests per meal. {dietaryConfirmed} of {confirmedTotal} need something other than the standard menu.
              Guests who are maybe or awaiting a reply are counted separately.
            </Text>
            <Row horizontal="between" paddingX="12" paddingBottom="4" borderBottom>
              <Text textVariant="label-strong-xs" onBackground="neutral-weak">MEAL</Text>
              <Row gap="16">
                <Text textVariant="label-strong-xs" onBackground="neutral-weak">CONFIRMED</Text>
                <Text textVariant="label-strong-xs" onBackground="neutral-weak">NOT YET</Text>
              </Row>
            </Row>
            <Column as="ul" gap="2" aria-label="Meal counts">
              {meals.map((m) => (
                <li key={m.meal} style={{ listStyle: "none" }}>
                  <Row gap="12" paddingX="12" paddingY="8" vertical="start" borderBottom>
                    <Column flex="1" gap="2" style={{ minWidth: 0 }}>
                      <Text textVariant="label-strong-s">{m.meal}</Text>
                      {m.who ? (
                        <Text textVariant="body-default-xs" onBackground="neutral-weak">
                          {m.who}
                        </Text>
                      ) : null}
                    </Column>
                    <Row gap="24" paddingRight="8">
                      <Text textVariant="label-strong-s">{m.confirmed}</Text>
                      <Text textVariant="body-default-s" onBackground="neutral-weak">
                        {m.unconfirmed}
                      </Text>
                    </Row>
                  </Row>
                </li>
              ))}
            </Column>
            <Row horizontal="between" paddingX="12" paddingTop="4">
              <Text textVariant="label-strong-s">Total</Text>
              <Row gap="24">
                <Text textVariant="label-strong-s">{confirmedTotal}</Text>
                <Text textVariant="body-default-s" onBackground="neutral-weak">
                  {unconfirmedTotal}
                </Text>
              </Row>
            </Row>
          </Column>
        </Row>
      </Column>
    </Column>
  );
}
```

```tsx components/PlanPanels.tsx
"use client";

import { Button, Column, Dropdown, Icon, IconButton, Option, Row, Tag, Text } from "@once-ui-system/core";
import { tables, type Guest } from "@/lib/data";
import { guestById, STANDARD_MEAL, tableById } from "@/lib/plan";
import { usePlan } from "./PlanProvider";

function TablePicker({ guest, label, icon }: { guest: Guest; label?: string; icon?: boolean }) {
  const plan = usePlan();
  const current = plan.tableOf(guest.id);
  const options = tables.filter((t) => t.id !== current);
  const trigger = icon ? (
    <IconButton icon="forward" variant="ghost" size="s" tooltip={`Move ${guest.name} to another table`} aria-label={`Move ${guest.name} to another table`} />
  ) : (
    <Button variant="secondary" size="s" suffixIcon="chevronDown" aria-label={`Seat ${guest.name} at a table`}>
      {label ?? "Seat at"}
    </Button>
  );
  return (
    <Dropdown
      placement="bottom-end"
      onSelect={(id) => {
        plan.seatGuest(guest.id, id);
      }}
      trigger={trigger}
    >
      <Column padding="4" gap="2" minWidth={200}>
        {options.map((t) => {
          const { filled, capacity } = plan.occupancy(t.id);
          const full = filled >= capacity;
          return (
            <Option
              key={t.id}
              value={t.id}
              label={t.name}
              disabled={full}
              description={full ? "Full" : `${capacity - filled} free of ${capacity}`}
            />
          );
        })}
      </Column>
    </Dropdown>
  );
}

function GuestChip({ guest }: { guest: Guest }) {
  const plan = usePlan();
  const picked = plan.selectedGuestId === guest.id;
  const broken = plan.brokenGuests.has(guest.id);
  return (
    <Row
      fillWidth
      gap="8"
      vertical="center"
      paddingLeft="4"
      radius="m"
      background={picked ? "brand-alpha-medium" : "transparent"}
      border={picked ? "brand-strong" : "transparent"}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", guest.id);
        e.dataTransfer.effectAllowed = "move";
        plan.setDragging(guest.id);
      }}
      onDragEnd={() => plan.setDragging(null)}
    >
      <Row
        as="button"
        type="button"
        flex="1"
        gap="12"
        vertical="center"
        paddingX="8"
        paddingY="8"
        cursor="interactive"
        aria-pressed={picked}
        aria-label={`${picked ? "Deselect" : "Select"} ${guest.name} to place at a seat`}
        onClick={() => plan.pickGuest(guest.id)}
      >
        <Icon name="grip" size="xs" onBackground="neutral-weak" />
        <Column gap="2" horizontal="start" flex="1" style={{ minWidth: 0 }}>
          <Text textVariant="label-strong-s">{guest.name}</Text>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            {guest.party}
            {guest.rsvp !== "yes" ? ` · ${guest.rsvp === "maybe" ? "maybe" : "awaiting reply"}` : ""}
          </Text>
        </Column>
        {broken ? <Tag size="s" tone="danger" label="Rule" /> : null}
        {guest.diet ? <Tag size="s" tone="warning" label={guest.diet} /> : null}
      </Row>
      <TablePicker guest={guest} />
    </Row>
  );
}

export function ToSeatPanel() {
  const plan = usePlan();
  const { toSeat, undecided } = plan.stats;
  const dropping = plan.draggingId !== null && plan.tableOf(plan.draggingId) !== null;
  return (
    <Column
      background="surface"
      border={dropping ? "brand-strong" : true}
      borderStyle={dropping ? "dashed" : "solid"}
      radius="l"
      padding="16"
      gap="12"
      aria-labelledby="to-seat-title"
      role="region"
      onDragOver={(e) => {
        if (plan.draggingId) e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        const id = plan.draggingId ?? e.dataTransfer.getData("text/plain");
        plan.setDragging(null);
        if (id) plan.unseat(id);
      }}
    >
      <Row horizontal="between" vertical="center" gap="8">
        <Text as="h2" id="to-seat-title" textVariant="heading-strong-m">
          Still to seat
        </Text>
        <Tag size="s" tone={toSeat.length === 0 ? "success" : "brand"} label={`${toSeat.length} attending`} />
      </Row>
      <Text textVariant="body-default-xs" onBackground="neutral-weak">
        {dropping
          ? "Drop here to unseat this guest."
          : "Drag a guest onto a seat or table, tap one then tap a seat, or use Seat at."}
      </Text>
      {toSeat.length === 0 ? (
        <Row gap="8" vertical="center" padding="12" radius="m" background="success-alpha-weak">
          <Icon name="check" size="s" onBackground="success-strong" />
          <Text textVariant="label-default-s">Every attending guest has a seat.</Text>
        </Row>
      ) : (
        <Column gap="2" as="ul" aria-label="Attending guests without a seat">
          {toSeat.map((g) => (
            <li key={g.id} style={{ listStyle: "none" }}>
              <GuestChip guest={g} />
            </li>
          ))}
        </Column>
      )}
      {undecided.length > 0 ? (
        <Column gap="4" paddingTop="8" borderTop>
          <Text textVariant="label-strong-xs" onBackground="neutral-weak">
            NOT CONFIRMED ({undecided.length})
          </Text>
          <Column gap="2" as="ul" aria-label="Guests who have not confirmed">
            {undecided.map((g) => (
              <li key={g.id} style={{ listStyle: "none" }}>
                <GuestChip guest={g} />
              </li>
            ))}
          </Column>
        </Column>
      ) : null}
    </Column>
  );
}

export function SelectionPanel() {
  const plan = usePlan();
  const guest = plan.selectedGuestId ? guestById.get(plan.selectedGuestId) : undefined;
  const table = plan.selectedTableId ? tableById.get(plan.selectedTableId) : undefined;

  if (!table && !guest) {
    return (
      <Column background="surface" border radius="l" padding="16" gap="8" role="region" aria-label="Selected table">
        <Text as="h2" textVariant="heading-strong-m">
          Table details
        </Text>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Select a table to see its guests and their dietary needs.
        </Text>
      </Column>
    );
  }

  const row = table ? plan.seats[table.id] : [];
  const seated = row.flatMap((id, seat) => (id ? [{ guest: guestById.get(id) as Guest, seat }] : []));
  const needs = new Map<string, number>();
  for (const s of seated) {
    const key = s.guest.diet ?? STANDARD_MEAL;
    needs.set(key, (needs.get(key) ?? 0) + 1);
  }
  const broken = table ? plan.brokenTables.has(table.id) : false;
  const tableRules = table ? plan.rules.filter((r) => r.tables.includes(table.id) && r.status === "broken") : [];

  return (
    <Column background="surface" border={broken ? "danger-strong" : "brand-alpha-strong"} radius="l" padding="16" gap="12" role="region" aria-label="Selected table">
      {guest ? (
        <Column gap="8" padding="12" radius="m" background="brand-alpha-weak">
          <Row horizontal="between" vertical="center" gap="8">
            <Text textVariant="label-strong-s">Selected: {guest.name}</Text>
            <IconButton icon="close" variant="ghost" size="s" tooltip="Deselect" aria-label="Deselect guest" onClick={() => plan.pickGuest(null)} />
          </Row>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            {plan.tableOf(guest.id) ? `Seated at ${tableById.get(plan.tableOf(guest.id) as string)?.name}. ` : "Not seated. "}
            Tap a seat or a table in the plan to place them{plan.tableOf(guest.id) ? ", or unseat them" : ""}.
          </Text>
          <Row gap="8" wrap>
            <TablePicker guest={guest} label="Move to" />
            {plan.tableOf(guest.id) ? (
              <Button size="s" variant="secondary" prefixIcon="personRemove" onClick={() => plan.unseat(guest.id)}>
                Unseat
              </Button>
            ) : null}
          </Row>
        </Column>
      ) : null}
      {table ? (
        <>
          <Row horizontal="between" vertical="center" gap="8">
            <Text as="h2" textVariant="heading-strong-m">
              {table.name}
            </Text>
            <Row gap="8" vertical="center">
              <Tag size="s" tone="neutral" label={`${seated.length} of ${row.length} seats`} />
              <IconButton icon="close" variant="ghost" size="s" tooltip="Close" aria-label="Close table details" onClick={() => plan.selectTable(null)} />
            </Row>
          </Row>
          {tableRules.map((r) => (
            <Row key={r.index} gap="8" padding="12" radius="m" background="danger-alpha-weak" vertical="start">
              <Icon name="warning" size="s" onBackground="danger-strong" />
              <Text textVariant="body-default-s">{r.message}</Text>
            </Row>
          ))}
          <Column gap="4">
            <Text textVariant="label-strong-xs" onBackground="neutral-weak">
              MEALS AT THIS TABLE
            </Text>
            <Row gap="4" wrap>
              {seated.length === 0 ? (
                <Text textVariant="body-default-s" onBackground="neutral-weak">
                  Nobody seated yet.
                </Text>
              ) : (
                [...needs.entries()].map(([k, n]) => (
                  <Tag key={k} size="s" tone={k === STANDARD_MEAL ? "neutral" : "warning"} label={`${n} × ${k}`} />
                ))
              )}
            </Row>
          </Column>
          <Column gap="2" as="ul" aria-label={`Seats at ${table.name}`}>
            {row.map((id, seat) => {
              const g = id ? guestById.get(id) : undefined;
              return (
                <li key={seat} style={{ listStyle: "none" }}>
                  <Row gap="8" vertical="center" paddingY="4" borderBottom>
                    <Text textVariant="label-default-xs" onBackground="neutral-weak" style={{ width: "1.25rem" }}>
                      {seat + 1}
                    </Text>
                    {g ? (
                      <>
                        <Column flex="1" gap="2" style={{ minWidth: 0 }}>
                          <Text textVariant="label-strong-s">{g.name}</Text>
                          <Text textVariant="body-default-xs" onBackground="neutral-weak">
                            {g.party}
                            {g.rsvp !== "yes" ? ` · ${g.rsvp === "maybe" ? "maybe" : "awaiting reply"}` : ""}
                          </Text>
                        </Column>
                        {g.diet ? <Tag size="s" tone="warning" label={g.diet} /> : <Text textVariant="body-default-xs" onBackground="neutral-weak">Standard</Text>}
                        <TablePicker guest={g} icon />
                        <IconButton
                          icon="personRemove"
                          variant="ghost"
                          size="s"
                          tone="danger"
                          tooltip={`Unseat ${g.name}`}
                          aria-label={`Unseat ${g.name}`}
                          onClick={() => plan.unseat(g.id)}
                        />
                      </>
                    ) : (
                      <Text textVariant="body-default-s" onBackground="neutral-weak">
                        Empty seat
                      </Text>
                    )}
                  </Row>
                </li>
              );
            })}
          </Column>
        </>
      ) : null}
    </Column>
  );
}

export function RulesPanel() {
  const plan = usePlan();
  const brokenCount = plan.rules.filter((r) => r.status === "broken").length;
  const openCount = plan.rules.filter((r) => r.status === "open").length;
  return (
    <Column background="surface" border radius="l" padding="16" gap="12" role="region" aria-labelledby="rules-title">
      <Row horizontal="between" vertical="center" gap="8">
        <Text as="h2" id="rules-title" textVariant="heading-strong-m">
          The couple&apos;s rules
        </Text>
        <Tag
          size="s"
          tone={brokenCount > 0 ? "danger" : "success"}
          prefixIcon={brokenCount > 0 ? "warning" : "check"}
          label={brokenCount > 0 ? `${brokenCount} broken` : "None broken"}
        />
      </Row>
      <Text textVariant="body-default-xs" onBackground="neutral-weak" aria-live="polite">
        {brokenCount === 0 ? "Every seated guest respects the rules." : `${brokenCount} of ${plan.rules.length} rules are broken.`}
        {openCount > 0 ? ` ${openCount} waiting on a seat.` : ""}
      </Text>
      <Column gap="8" as="ul" aria-label="Seating rules">
        {plan.rules.map((r) => (
          <li key={r.index} style={{ listStyle: "none" }}>
            <Row
              as="button"
              type="button"
              fillWidth
              gap="12"
              padding="12"
              vertical="start"
              radius="m"
              cursor="interactive"
              background={r.status === "broken" ? "danger-alpha-weak" : "neutral-alpha-weak"}
              border={r.status === "broken" ? "danger-alpha-strong" : "transparent"}
              aria-label={`${r.label}, ${r.status === "broken" ? "broken" : r.status === "met" ? "met" : "waiting on a seat"}: ${r.message}`}
              onClick={() => {
                if (r.tables[0]) plan.selectTable(r.tables[0]);
              }}
            >
              <Icon
                name={r.status === "broken" ? "warning" : r.status === "met" ? "check" : "time"}
                size="s"
                onBackground={r.status === "broken" ? "danger-strong" : r.status === "met" ? "success-strong" : "neutral-weak"}
              />
              <Column gap="4" horizontal="start" flex="1">
                <Row gap="8" vertical="center" wrap>
                  <Text textVariant="label-strong-s">{r.label}</Text>
                  <Tag
                    size="s"
                    tone={r.status === "broken" ? "danger" : r.status === "met" ? "success" : "neutral"}
                    label={r.status === "broken" ? "Broken" : r.status === "met" ? "Met" : "Waiting"}
                  />
                </Row>
                <Text textVariant="body-default-s" align="left">
                  {r.message}
                </Text>
                <Text textVariant="body-default-xs" onBackground="neutral-weak" align="left">
                  {r.rule.note}
                </Text>
              </Column>
            </Row>
          </li>
        ))}
      </Column>
    </Column>
  );
}
```

```tsx components/PlanProvider.tsx
"use client";

import { useToast } from "@once-ui-system/core";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { guests, tables, type Guest } from "@/lib/data";
import { evaluateRules, guestById, tableById, type RuleResult } from "@/lib/plan";

export type Seats = Record<string, (string | null)[]>;

function initialSeats(): Seats {
  const seats: Seats = {};
  for (const t of tables) seats[t.id] = Array.from({ length: t.seats }, () => null);
  for (const g of guests) {
    if (!g.table) continue;
    const row = seats[g.table];
    const i = row.indexOf(null);
    if (i >= 0) row[i] = g.id;
  }
  return seats;
}

type Location = { table: string; seat: number };

type PlanContextValue = {
  seats: Seats;
  locate: (guestId: string) => Location | null;
  tableOf: (guestId: string) => string | null;
  selectedGuestId: string | null;
  selectedTableId: string | null;
  draggingId: string | null;
  setDragging: (id: string | null) => void;
  pickGuest: (guestId: string | null) => void;
  selectTable: (tableId: string | null) => void;
  seatGuest: (guestId: string, tableId: string, seat?: number) => boolean;
  unseat: (guestId: string) => void;
  activateSeat: (tableId: string, seat: number) => void;
  activateTable: (tableId: string) => void;
  notice: string;
  canUndo: boolean;
  undo: () => void;
  rules: RuleResult[];
  brokenTables: Set<string>;
  brokenGuests: Set<string>;
  stats: {
    seated: number;
    totalGuests: number;
    attending: number;
    attendingSeated: number;
    toSeat: Guest[];
    undecided: Guest[];
    capacity: number;
    freeSeats: number;
    declined: number;
  };
  occupancy: (tableId: string) => { filled: number; capacity: number };
};

const PlanContext = createContext<PlanContextValue | null>(null);

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const { addToast } = useToast();
  const [seats, setSeats] = useState<Seats>(initialSeats);
  const [previous, setPrevious] = useState<Seats | null>(null);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [draggingId, setDragging] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const where = useMemo(() => {
    const map = new Map<string, Location>();
    for (const [table, row] of Object.entries(seats)) {
      row.forEach((id, seat) => {
        if (id) map.set(id, { table, seat });
      });
    }
    return map;
  }, [seats]);

  const locate = useCallback((guestId: string) => where.get(guestId) ?? null, [where]);
  const tableOf = useCallback((guestId: string) => where.get(guestId)?.table ?? null, [where]);

  const commit = useCallback(
    (next: Seats, message: string) => {
      setPrevious(seats);
      setSeats(next);
      setNotice(message);
    },
    [seats],
  );

  const seatGuest = useCallback(
    (guestId: string, tableId: string, seat?: number): boolean => {
      const guest = guestById.get(guestId);
      const table = tableById.get(tableId);
      if (!guest || !table) return false;
      const from = where.get(guestId) ?? null;
      const row = seats[tableId];
      if (seat === undefined && from?.table === tableId) {
        setSelectedGuestId(null);
        setSelectedTableId(tableId);
        return true;
      }
      const target = seat ?? row.indexOf(null);
      if (target < 0) {
        const message = `${table.name} is full. Move someone out first or pick another table.`;
        setNotice(message);
        addToast({ tone: "danger", message });
        return false;
      }
      const occupant = row[target];
      if (occupant === guestId) return true;
      const next: Seats = { ...seats };
      const dest = [...row];
      next[tableId] = dest;
      let displaced: string | null = null;
      if (from) {
        const src = from.table === tableId ? dest : [...seats[from.table]];
        next[from.table] = src;
        src[from.seat] = occupant;
      } else {
        displaced = occupant;
      }
      dest[target] = guestId;
      let message = `${guest.name} is now at ${table.name}, seat ${target + 1}.`;
      if (from && occupant) {
        message = `${guest.name} and ${guestById.get(occupant)?.name ?? "a guest"} swapped seats.`;
      }
      if (displaced) {
        message += ` ${guestById.get(displaced)?.name ?? "A guest"} is now unseated.`;
      }
      commit(next, message);
      setSelectedGuestId(null);
      setSelectedTableId(tableId);
      return true;
    },
    [seats, where, commit, addToast],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const from = where.get(guestId);
      const guest = guestById.get(guestId);
      if (!from || !guest) return;
      const next: Seats = { ...seats };
      const row = [...seats[from.table]];
      row[from.seat] = null;
      next[from.table] = row;
      commit(next, `${guest.name} is unseated.`);
      setSelectedGuestId(null);
    },
    [seats, where, commit],
  );

  const pickGuest = useCallback((guestId: string | null) => {
    setSelectedGuestId((current) => (guestId === null || current === guestId ? null : guestId));
  }, []);

  const selectTable = useCallback((tableId: string | null) => {
    setSelectedTableId(tableId);
  }, []);

  const activateSeat = useCallback(
    (tableId: string, seat: number) => {
      const occupant = seats[tableId][seat];
      if (selectedGuestId) {
        if (occupant === selectedGuestId) {
          setSelectedGuestId(null);
          return;
        }
        seatGuest(selectedGuestId, tableId, seat);
        return;
      }
      setSelectedTableId(tableId);
      if (occupant) setSelectedGuestId(occupant);
    },
    [seats, selectedGuestId, seatGuest],
  );

  const activateTable = useCallback(
    (tableId: string) => {
      if (selectedGuestId) {
        seatGuest(selectedGuestId, tableId);
        return;
      }
      setSelectedTableId((current) => (current === tableId ? null : tableId));
    },
    [selectedGuestId, seatGuest],
  );

  const undo = useCallback(() => {
    if (!previous) return;
    setSeats(previous);
    setPrevious(null);
    setNotice("Last change undone.");
    setSelectedGuestId(null);
  }, [previous]);

  const rules = useMemo(() => evaluateRules(tableOf), [tableOf]);

  const { brokenTables, brokenGuests } = useMemo(() => {
    const bt = new Set<string>();
    const bg = new Set<string>();
    for (const r of rules) {
      if (r.status !== "broken") continue;
      r.tables.forEach((t) => bt.add(t));
      r.guests.forEach((g) => bg.add(g));
    }
    return { brokenTables: bt, brokenGuests: bg };
  }, [rules]);

  const stats = useMemo(() => {
    const attendingGuests = guests.filter((g) => g.rsvp === "yes");
    const toSeat = attendingGuests.filter((g) => !where.has(g.id));
    const undecided = guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !where.has(g.id));
    const capacity = tables.reduce((sum, t) => sum + t.seats, 0);
    return {
      seated: where.size,
      totalGuests: guests.length,
      attending: attendingGuests.length,
      attendingSeated: attendingGuests.length - toSeat.length,
      toSeat,
      undecided,
      capacity,
      freeSeats: capacity - where.size,
      declined: guests.filter((g) => g.rsvp === "no").length,
    };
  }, [where]);

  const occupancy = useCallback(
    (tableId: string) => {
      const row = seats[tableId] ?? [];
      return { filled: row.filter(Boolean).length, capacity: row.length };
    },
    [seats],
  );

  const value: PlanContextValue = {
    seats,
    locate,
    tableOf,
    selectedGuestId,
    selectedTableId,
    draggingId,
    setDragging,
    pickGuest,
    selectTable,
    seatGuest,
    unseat,
    activateSeat,
    activateTable,
    notice,
    canUndo: previous !== null,
    undo,
    rules,
    brokenTables,
    brokenGuests,
    stats,
    occupancy,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
```

```tsx components/PlanView.tsx
"use client";

import { Button, Column, Grid, Heading, Row, SegmentedControl, Tag, Text } from "@once-ui-system/core";
import { useState } from "react";
import { event } from "@/lib/data";
import { formatDate } from "@/lib/plan";
import { RulesPanel, SelectionPanel, ToSeatPanel } from "./PlanPanels";
import { usePlan } from "./PlanProvider";
import { RoomPlan } from "./RoomPlan";
import { TablesList } from "./TablesList";
import { guestById } from "@/lib/plan";

function Stat({ label, value, hint, tone }: { label: string; value: string; hint: string; tone?: "danger" | "success" }) {
  return (
    <Column
      background="surface"
      border={tone === "danger" ? "danger-alpha-strong" : true}
      radius="l"
      padding="16"
      gap="4"
    >
      <Text textVariant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text textVariant="display-strong-xs" onBackground={tone === "danger" ? "danger-strong" : "neutral-strong"}>
        {value}
      </Text>
      <Text textVariant="body-default-xs" onBackground="neutral-weak">
        {hint}
      </Text>
    </Column>
  );
}

export function PlanView() {
  const plan = usePlan();
  const [view, setView] = useState("room");
  const { stats } = plan;
  const brokenCount = plan.rules.filter((r) => r.status === "broken").length;
  const picked = plan.selectedGuestId ? guestById.get(plan.selectedGuestId) : undefined;

  return (
    <Column as="main" id="main" fillWidth padding="16" gap="16" horizontal="center">
      <Column fillWidth maxWidth="xl" gap="16">
        <Row fillWidth horizontal="between" vertical="end" gap="16" s={{ direction: "column", horizontal: "start" }}>
          <Column gap="4">
            <Heading as="h1" textVariant="display-strong-xs">
              {event.name}
            </Heading>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {formatDate(event.date)} · {event.venue}
            </Text>
          </Column>
          <Row gap="8" vertical="center" wrap>
            <Button size="s" variant="secondary" prefixIcon="return" disabled={!plan.canUndo} onClick={plan.undo}>
              Undo
            </Button>
            <Button size="s" href="/guests" variant="secondary" prefixIcon="people">
              Guest list
            </Button>
          </Row>
        </Row>

        <Grid fillWidth columns="4" gap="12" s={{ columns: "2" }}>
          <Stat
            label="Seated"
            value={`${stats.seated}`}
            hint={`${stats.attendingSeated} of ${stats.attending} attending guests`}
          />
          <Stat
            label="Unseated"
            value={`${stats.toSeat.length}`}
            hint={`attending, plus ${stats.undecided.length} not confirmed`}
          />
          <Stat label="Open seats" value={`${stats.freeSeats}`} hint={`of ${stats.capacity} across 7 tables`} />
          <Stat
            label="Rules"
            value={brokenCount === 0 ? "All met" : `${brokenCount} broken`}
            hint={brokenCount === 0 ? "Checked as you work" : "Flagged on the tables"}
            tone={brokenCount > 0 ? "danger" : "success"}
          />
        </Grid>

        <Row gap="16" vertical="start" m={{ direction: "column" }}>
          <Column flex="1" gap="12" style={{ minWidth: 0 }} m={{ fillWidth: true }}>
            <Row horizontal="between" vertical="center" gap="12" wrap>
              <SegmentedControl
                fillWidth={false}
                value={view}
                onValueChange={setView}
                buttons={[
                  { value: "room", label: "Room plan", prefixIcon: "grid" },
                  { value: "tables", label: "Table list", prefixIcon: "document" },
                ]}
              />
              {picked ? (
                <Row gap="8" vertical="center" padding="4" paddingLeft="12" radius="full" background="brand-alpha-weak" border="brand-alpha-strong">
                  <Text textVariant="label-strong-s">Placing {picked.name}: tap a seat or table</Text>
                  <Button size="s" variant="ghost" onClick={() => plan.pickGuest(null)}>
                    Cancel
                  </Button>
                </Row>
              ) : (
                <Tag size="s" tone="neutral" label="Drag guests between seats, or tap a guest then a seat" />
              )}
            </Row>
            {view === "room" ? <RoomPlan /> : <TablesList />}
          </Column>
          <Column gap="16" width="24rem" m={{ fillWidth: true, width: "100%" }}>
            <ToSeatPanel />
            <SelectionPanel />
            <RulesPanel />
          </Column>
        </Row>
      </Column>
    </Column>
  );
}
```

```tsx components/RoomPlan.tsx
"use client";

import { Column, Icon, Row, Text } from "@once-ui-system/core";
import { useState } from "react";
import { event, fixtures, tables, type Fixture, type SeatTable } from "@/lib/data";
import {
  guestById,
  initials,
  LONG_TABLE_DEPTH,
  LONG_TABLE_LENGTH,
  ROUND_TABLE_DIAMETER,
  SEAT_DIAMETER,
  seatPoints,
  tableCenter,
} from "@/lib/plan";
import { usePlan } from "./PlanProvider";

const W = event.room_m.width;
const D = event.room_m.depth;
const pctX = (m: number) => `${(m / W) * 100}%`;
const pctY = (m: number) => `${(m / D) * 100}%`;

const fixtureStyle: Record<
  Fixture["kind"],
  { background: "accent-alpha-medium" | "brand-alpha-weak" | "neutral-alpha-medium" | "warning-alpha-medium"; dashed: boolean }
> = {
  stage: { background: "accent-alpha-medium", dashed: false },
  dancefloor: { background: "brand-alpha-weak", dashed: true },
  bar: { background: "neutral-alpha-medium", dashed: false },
  door: { background: "warning-alpha-medium", dashed: false },
};

function FixtureBlock({ f }: { f: Fixture }) {
  const s = fixtureStyle[f.kind];
  const vertical = f.kind === "door";
  return (
    <Row
      center
      position="absolute"
      radius={f.kind === "dancefloor" ? "l" : "s"}
      background={s.background}
      border={f.kind === "door" ? "warning-strong" : "neutral-alpha-medium"}
      borderStyle={s.dashed ? "dashed" : "solid"}
      aria-label={f.label}
      style={{
        left: pctX(f.x),
        top: pctY(f.y),
        width: pctX(f.w),
        height: pctY(f.h),
        containerType: "size",
      }}
    >
      <Text
        textVariant="label-strong-xs"
        onBackground="neutral-strong"
        align="center"
        style={{
          fontSize: "clamp(8px, 1.2cqw, 13px)",
          writingMode: vertical ? "vertical-rl" : undefined,
          whiteSpace: "nowrap",
        }}
      >
        {f.label}
      </Text>
    </Row>
  );
}

function SeatButton({
  table,
  index,
  x,
  y,
}: {
  table: SeatTable;
  index: number;
  x: number;
  y: number;
}) {
  const plan = usePlan();
  const [over, setOver] = useState(false);
  const guestId = plan.seats[table.id][index];
  const guest = guestId ? guestById.get(guestId) : undefined;
  const picked = guestId !== null && plan.selectedGuestId === guestId;
  const broken = guestId !== null && plan.brokenGuests.has(guestId);
  const tentative = guest ? guest.rsvp !== "yes" : false;
  const placing = plan.selectedGuestId !== null || plan.draggingId !== null;

  const label = guest
    ? `${initials(guest.name)} ${guest.name} at ${table.name}, seat ${index + 1}${guest.diet ? `, ${guest.diet}` : ""}${broken ? ", breaks a rule" : ""}. ${
        plan.selectedGuestId ? "Swap into this seat." : "Select this guest."
      }`
    : `${index + 1} empty seat at ${table.name}.${plan.selectedGuestId ? " Seat the selected guest here." : ""}`;

  return (
    <Row
      as="button"
      type="button"
      center
      position="absolute"
      radius="full"
      cursor="interactive"
      background={over ? "brand-alpha-strong" : guest ? (picked ? "brand-medium" : "brand-alpha-medium") : placing ? "brand-alpha-weak" : "transparent"}
      border={broken ? "danger-strong" : picked ? "brand-strong" : guest ? "brand-alpha-strong" : "neutral-alpha-strong"}
      borderStyle={guest && !tentative ? "solid" : "dashed"}
      borderWidth={picked || broken || over ? 2 : 1}
      draggable={guest !== undefined}
      aria-label={label}
      aria-pressed={guest ? picked : undefined}
      title={guest ? `${guest.name}${guest.diet ? ` (${guest.diet})` : ""}` : `${table.name}, seat ${index + 1} (empty)`}
      onClick={() => plan.activateSeat(table.id, index)}
      onDragStart={(e) => {
        if (!guestId) return;
        e.dataTransfer.setData("text/plain", guestId);
        e.dataTransfer.effectAllowed = "move";
        plan.setDragging(guestId);
      }}
      onDragEnd={() => plan.setDragging(null)}
      onDragOver={(e) => {
        if (plan.draggingId) {
          e.preventDefault();
          setOver(true);
        }
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setOver(false);
        const id = plan.draggingId ?? e.dataTransfer.getData("text/plain");
        plan.setDragging(null);
        if (id) plan.seatGuest(id, table.id, index);
      }}
      style={{
        left: pctX(x),
        top: pctY(y),
        width: pctX(SEAT_DIAMETER),
        aspectRatio: "1",
        transform: "translate(-50%, -50%)",
        padding: 0,
        fontSize: "clamp(8px, 1.15cqw, 13px)",
      }}
    >
      {guest ? (
        <Text textVariant="label-strong-xs" aria-hidden="true" style={{ fontSize: "inherit", lineHeight: 1 }}>
          {initials(guest.name)}
        </Text>
      ) : (
        <Text textVariant="label-default-xs" onBackground="neutral-weak" aria-hidden="true" style={{ fontSize: "inherit", lineHeight: 1 }}>
          {index + 1}
        </Text>
      )}
      {guest?.diet ? (
        <Row
          position="absolute"
          radius="full"
          background="warning-strong"
          aria-hidden="true"
          style={{ top: "-1px", right: "-1px", width: "28%", aspectRatio: "1" }}
        />
      ) : null}
    </Row>
  );
}

function TableBody({ table }: { table: SeatTable }) {
  const plan = usePlan();
  const [over, setOver] = useState(false);
  const { filled, capacity } = plan.occupancy(table.id);
  const selected = plan.selectedTableId === table.id;
  const broken = plan.brokenTables.has(table.id);
  const c = tableCenter(table);
  const long = table.shape === "long";
  const width = long ? LONG_TABLE_LENGTH : ROUND_TABLE_DIAMETER;
  const height = long ? LONG_TABLE_DEPTH : ROUND_TABLE_DIAMETER;

  return (
    <Column
      as="button"
      type="button"
      center
      position="absolute"
      radius={long ? "m" : "full"}
      cursor="interactive"
      background={over ? "brand-alpha-medium" : "surface"}
      border={broken ? "danger-strong" : selected ? "brand-strong" : "neutral-alpha-strong"}
      borderWidth={broken || selected || over ? 2 : 1}
      shadow={selected ? "m" : "xs"}
      aria-label={`${table.name} ${filled}/${capacity} seats filled${broken ? ", a rule is broken here" : ""}. ${
        plan.selectedGuestId ? "Seat the selected guest at this table." : "Show guests."
      }`}
      aria-pressed={selected}
      onClick={() => plan.activateTable(table.id)}
      onDragOver={(e) => {
        if (plan.draggingId) {
          e.preventDefault();
          setOver(true);
        }
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = plan.draggingId ?? e.dataTransfer.getData("text/plain");
        plan.setDragging(null);
        if (id) plan.seatGuest(id, table.id);
      }}
      style={{
        left: pctX(c.x),
        top: pctY(c.y),
        width: pctX(width),
        height: long ? pctY(height) : undefined,
        aspectRatio: long ? undefined : "1",
        transform: `translate(-50%, -50%) rotate(${table.rotation ?? 0}deg)`,
        padding: 0,
        fontSize: "clamp(8px, 1.25cqw, 14px)",
      }}
    >
      <Row gap="4" vertical="center" horizontal="center" wrap={false} aria-hidden="true" style={{ flexDirection: long ? "row" : "column", gap: long ? "0.6em" : "0.1em" }}>
        <Text textVariant="label-strong-s" style={{ fontSize: "inherit", lineHeight: 1.1 }}>
          {table.name}
        </Text>
        <Text textVariant="label-default-xs" onBackground="neutral-weak" style={{ fontSize: "0.9em", lineHeight: 1.1 }}>
          {filled}/{capacity}
        </Text>
      </Row>
      {broken ? (
        <Row
          center
          position="absolute"
          radius="full"
          background="danger-strong"
          aria-hidden="true"
          style={{ top: long ? "-35%" : "2%", right: long ? "-1%" : "2%", width: "1.7em", height: "1.7em" }}
        >
          <Icon name="warning" size="xs" onSolid="danger-strong" decorative />
        </Row>
      ) : null}
    </Column>
  );
}

export function RoomPlan() {
  return (
    <Column
      fillWidth
      radius="l"
      border
      background="surface"
      overflowX="auto"
      scrollbar="minimal"
      aria-label="Room plan"
      role="region"
      tabIndex={0}
    >
      <Column fillWidth minWidth="780px" padding="12" gap="8">
        <Row fillWidth horizontal="between" vertical="center" gap="8" wrap>
          <Text textVariant="label-strong-s">
            {event.venue}
          </Text>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            Drawn to scale: {W} × {D} m, grid lines every metre
          </Text>
        </Row>
        <Column
          fillWidth
          radius="m"
          border
          background="page"
          position="relative"
          style={{
            aspectRatio: `${W} / ${D}`,
            containerType: "inline-size",
            backgroundImage:
              "linear-gradient(var(--neutral-alpha-weak) 1px, transparent 1px), linear-gradient(90deg, var(--neutral-alpha-weak) 1px, transparent 1px)",
            backgroundSize: `${100 / W}% ${100 / D}%`,
          }}
        >
          {fixtures.map((f) => (
            <FixtureBlock key={f.id} f={f} />
          ))}
          {tables.map((t) => (
            <TableBody key={t.id} table={t} />
          ))}
          {tables.map((t) =>
            seatPoints(t).map((p, i) => <SeatButton key={`${t.id}-${i}`} table={t} index={i} x={p.x} y={p.y} />),
          )}
        </Column>
        <Row gap="16" wrap vertical="center">
          <Legend swatch="filled">Seated</Legend>
          <Legend swatch="empty">Empty seat</Legend>
          <Legend swatch="tentative">Maybe or awaiting reply</Legend>
          <Legend swatch="diet">Dietary need</Legend>
          <Legend swatch="broken">Rule broken</Legend>
        </Row>
      </Column>
    </Column>
  );
}

function Legend({ swatch, children }: { swatch: "filled" | "empty" | "tentative" | "diet" | "broken"; children: string }) {
  return (
    <Row gap="8" vertical="center">
      <Row
        width="16"
        height="16"
        radius="full"
        background={swatch === "filled" ? "brand-alpha-medium" : swatch === "diet" ? "warning-strong" : "transparent"}
        border={swatch === "broken" ? "danger-strong" : swatch === "diet" ? "warning-strong" : swatch === "filled" ? "brand-alpha-strong" : "neutral-alpha-strong"}
        borderStyle={swatch === "empty" || swatch === "tentative" ? "dashed" : "solid"}
        borderWidth={swatch === "broken" ? 2 : 1}
        aria-hidden="true"
      />
      <Text textVariant="body-default-xs" onBackground="neutral-weak">
        {children}
      </Text>
    </Row>
  );
}
```

```tsx components/Shell.tsx
"use client";

import { Avatar, Button, Column, Icon, Row, Text, VisuallyHidden } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { planner } from "@/lib/data";
import { usePlan } from "./PlanProvider";

const nav = [
  { href: "/", label: "Seating plan", icon: "grid" },
  { href: "/guests", label: "Guest list", icon: "people" },
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { notice } = usePlan();

  return (
    <Column fillWidth flex="1">
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row
        as="header"
        fillWidth
        background="surface"
        borderBottom
        paddingX="16"
        paddingY="8"
        gap="16"
        vertical="center"
        horizontal="between"
      >
        <Row gap="12" vertical="center">
          <Row center width="32" height="32" radius="m" solid="brand-strong">
            <Icon name="people" size="s" onSolid="brand-strong" />
          </Row>
          <Text textVariant="heading-strong-m">Seatwise</Text>
        </Row>
        <Row as="nav" aria-label="Main" gap="4">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Button
                key={item.href}
                href={item.href}
                size="s"
                variant={active ? "secondary" : "ghost"}
                prefixIcon={item.icon}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Button>
            );
          })}
        </Row>
        <Row gap="8" vertical="center">
          <Row s={{ hide: true }}>
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {planner.name}
            </Text>
          </Row>
          <Avatar size="s" value="HB" />
        </Row>
      </Row>
      <VisuallyHidden as="div" role="status" aria-live="polite">
        {notice}
      </VisuallyHidden>
      {children}
    </Column>
  );
}
```

```tsx components/TablesList.tsx
"use client";

import { Column, Grid, Icon, Row, Tag, Text } from "@once-ui-system/core";
import { tables, type SeatTable } from "@/lib/data";
import { guestById } from "@/lib/plan";
import { usePlan } from "./PlanProvider";

function SeatRow({ table, index }: { table: SeatTable; index: number }) {
  const plan = usePlan();
  const guestId = plan.seats[table.id][index];
  const guest = guestId ? guestById.get(guestId) : undefined;
  const picked = guestId !== null && plan.selectedGuestId === guestId;
  const broken = guestId !== null && plan.brokenGuests.has(guestId);
  return (
    <Row
      as="button"
      type="button"
      fillWidth
      gap="12"
      vertical="center"
      paddingX="12"
      paddingY="8"
      radius="m"
      cursor="interactive"
      background={picked ? "brand-alpha-medium" : "transparent"}
      border={broken ? "danger-strong" : picked ? "brand-strong" : "transparent"}
      borderStyle={guest ? "solid" : "dashed"}
      draggable={guest !== undefined}
      aria-pressed={guest ? picked : undefined}
      aria-label={guest ? `${table.name}, seat ${index + 1}: ${guest.name}` : `${table.name}, seat ${index + 1}: empty`}
      onClick={() => plan.activateSeat(table.id, index)}
      onDragStart={(e) => {
        if (!guestId) return;
        e.dataTransfer.setData("text/plain", guestId);
        plan.setDragging(guestId);
      }}
      onDragEnd={() => plan.setDragging(null)}
      onDragOver={(e) => {
        if (plan.draggingId) e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = plan.draggingId ?? e.dataTransfer.getData("text/plain");
        plan.setDragging(null);
        if (id) plan.seatGuest(id, table.id, index);
      }}
    >
      <Text textVariant="label-default-xs" onBackground="neutral-weak" style={{ width: "1.5rem" }}>
        {index + 1}
      </Text>
      {guest ? (
        <Row fillWidth horizontal="between" vertical="center" gap="8" wrap>
          <Text textVariant="label-strong-s">{guest.name}</Text>
          {guest.diet ? (
            <Tag size="s" tone="warning" label={guest.diet} />
          ) : null}
        </Row>
      ) : (
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          {plan.selectedGuestId ? "Empty seat: tap to seat the selected guest" : "Empty seat"}
        </Text>
      )}
    </Row>
  );
}

function TableCard({ table }: { table: SeatTable }) {
  const plan = usePlan();
  const { filled, capacity } = plan.occupancy(table.id);
  const broken = plan.brokenTables.has(table.id);
  const selected = plan.selectedTableId === table.id;
  return (
    <Column
      background="surface"
      border={broken ? "danger-strong" : selected ? "brand-strong" : true}
      radius="l"
      padding="8"
      gap="4"
      onDragOver={(e) => {
        if (plan.draggingId) e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        const id = plan.draggingId ?? e.dataTransfer.getData("text/plain");
        plan.setDragging(null);
        if (id) plan.seatGuest(id, table.id);
      }}
    >
      <Row
        as="button"
        type="button"
        fillWidth
        horizontal="between"
        vertical="center"
        paddingX="12"
        paddingY="8"
        cursor="interactive"
        aria-label={`${table.name}, ${filled} of ${capacity} seats filled`}
        onClick={() => plan.activateTable(table.id)}
      >
        <Row gap="8" vertical="center">
          <Text textVariant="heading-strong-s">{table.name}</Text>
          {broken ? <Icon name="warning" size="s" onBackground="danger-strong" decorative={false} tooltip="A rule is broken here" /> : null}
        </Row>
        <Tag size="s" tone={filled === capacity ? "success" : "neutral"} label={`${filled} of ${capacity} seated`} />
      </Row>
      {Array.from({ length: capacity }, (_, i) => (
        <SeatRow key={i} table={table} index={i} />
      ))}
    </Column>
  );
}

export function TablesList() {
  return (
    <Grid fillWidth columns="2" gap="16" s={{ columns: "1" }}>
      {tables.map((t) => (
        <TableCard key={t.id} table={t} />
      ))}
    </Grid>
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

export type SeatTable = {
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
  /** For "near" rules: which fixture to be close to, how close, and what to stay away from. */
  near?: {
    fixture: string;
    within: number;
    awayFrom?: { fixture: string; atLeast: number };
  };
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
    near: { fixture: "f-4", within: 4.5, awayFrom: { fixture: "f-1", atLeast: 6 } },
  },
];
```

```ts lib/plan.ts
import {
  fixtures,
  guests,
  rules,
  tables,
  type Fixture,
  type Guest,
  type Rsvp,
  type Rule,
  type SeatTable,
} from "./data";

export const guestById = new Map<string, Guest>(guests.map((g) => [g.id, g]));
export const tableById = new Map<string, SeatTable>(tables.map((t) => [t.id, t]));
export const fixtureById = new Map<string, Fixture>(fixtures.map((f) => [f.id, f]));

/** Length of a long table in metres: one seat per metre on one side. */
export const LONG_TABLE_LENGTH = 8;
export const LONG_TABLE_DEPTH = 1.1;
export const ROUND_TABLE_DIAMETER = 1.9;
export const SEAT_DIAMETER = 0.85;

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function firstName(name: string): string {
  return name.split(" ")[0];
}

export function tableCenter(t: SeatTable): { x: number; y: number } {
  if (t.shape === "long") return { x: t.x + LONG_TABLE_LENGTH / 2, y: t.y + LONG_TABLE_DEPTH / 2 };
  return { x: t.x, y: t.y };
}

export function fixtureCenter(f: Fixture): { x: number; y: number } {
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export type SeatPoint = { x: number; y: number };

/** Seat centres in room metres, in seat order. */
export function seatPoints(t: SeatTable): SeatPoint[] {
  const c = tableCenter(t);
  const rot = ((t.rotation ?? 0) * Math.PI) / 180;
  const local: SeatPoint[] = [];
  if (t.shape === "long") {
    const pitch = LONG_TABLE_LENGTH / t.seats;
    for (let i = 0; i < t.seats; i += 1) {
      local.push({
        x: -LONG_TABLE_LENGTH / 2 + pitch * (i + 0.5),
        y: -(LONG_TABLE_DEPTH / 2 + SEAT_DIAMETER / 2 + 0.08),
      });
    }
  } else {
    const r = ROUND_TABLE_DIAMETER / 2 + SEAT_DIAMETER / 2 + 0.1;
    for (let i = 0; i < t.seats; i += 1) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
      local.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
    }
  }
  return local.map((p) => ({
    x: c.x + p.x * Math.cos(rot) - p.y * Math.sin(rot),
    y: c.y + p.x * Math.sin(rot) + p.y * Math.cos(rot),
  }));
}

export type RuleStatus = "met" | "broken" | "open";

export type RuleResult = {
  index: number;
  rule: Rule;
  status: RuleStatus;
  label: string;
  message: string;
  tables: string[];
  guests: string[];
};

const kindLabel: Record<Rule["kind"], string> = {
  together: "Keep together",
  apart: "Keep apart",
  near: "Seat near",
};

function nameOf(id: string): string {
  return guestById.get(id)?.name ?? id;
}

function tableName(id: string): string {
  return tableById.get(id)?.name ?? id;
}

export function evaluateRules(tableOf: (guestId: string) => string | null): RuleResult[] {
  return rules.map((rule, index) => {
    const base = { index, rule, label: kindLabel[rule.kind] };
    if (rule.kind === "together") {
      const [a, b] = rule.guests;
      const ta = tableOf(a);
      const tb = tableOf(b);
      if (ta && tb) {
        if (ta === tb) {
          return { ...base, status: "met" as const, message: `${nameOf(a)} and ${nameOf(b)} are together at ${tableName(ta)}.`, tables: [ta], guests: [a, b] };
        }
        return {
          ...base,
          status: "broken" as const,
          message: `${nameOf(a)} is at ${tableName(ta)} but ${nameOf(b)} is at ${tableName(tb)}.`,
          tables: [ta, tb],
          guests: [a, b],
        };
      }
      if (ta || tb) {
        const seated = ta ? a : b;
        const waiting = ta ? b : a;
        const at = (ta ?? tb) as string;
        return {
          ...base,
          status: "open" as const,
          message: `${nameOf(seated)} is at ${tableName(at)}; ${nameOf(waiting)} still needs a seat.`,
          tables: [at],
          guests: [a, b],
        };
      }
      return { ...base, status: "open" as const, message: `${nameOf(a)} and ${nameOf(b)} are not seated yet.`, tables: [], guests: [a, b] };
    }
    if (rule.kind === "apart") {
      const [a, b] = rule.guests;
      const ta = tableOf(a);
      const tb = tableOf(b);
      if (ta && tb && ta === tb) {
        return {
          ...base,
          status: "broken" as const,
          message: `${nameOf(a)} and ${nameOf(b)} are both at ${tableName(ta)}.`,
          tables: [ta],
          guests: [a, b],
        };
      }
      return {
        ...base,
        status: "met" as const,
        message: `${nameOf(a)} and ${nameOf(b)} are not at the same table.`,
        tables: [],
        guests: [a, b],
      };
    }
    // near
    const [g] = rule.guests;
    const tid = tableOf(g);
    const spec = rule.near;
    if (!tid) {
      return { ...base, status: "open" as const, message: `${nameOf(g)} is not seated yet.`, tables: [], guests: [g] };
    }
    const table = tableById.get(tid);
    const target = spec ? fixtureById.get(spec.fixture) : undefined;
    if (!table || !spec || !target) {
      return { ...base, status: "met" as const, message: `${nameOf(g)} is at ${tableName(tid)}.`, tables: [tid], guests: [g] };
    }
    const c = tableCenter(table);
    const d = distance(c, fixtureCenter(target));
    const dTxt = d.toFixed(1);
    if (d > spec.within) {
      return {
        ...base,
        status: "broken" as const,
        message: `${tableName(tid)} is ${dTxt} m from the ${target.label.toLowerCase()}; ${nameOf(g)} needs a table within ${spec.within} m.`,
        tables: [tid],
        guests: [g],
      };
    }
    const away = spec.awayFrom ? fixtureById.get(spec.awayFrom.fixture) : undefined;
    if (spec.awayFrom && away) {
      const da = distance(c, fixtureCenter(away));
      if (da < spec.awayFrom.atLeast) {
        return {
          ...base,
          status: "broken" as const,
          message: `${tableName(tid)} is only ${da.toFixed(1)} m from the ${away.label.toLowerCase()}; ${nameOf(g)} needs ${spec.awayFrom.atLeast} m or more.`,
          tables: [tid],
          guests: [g],
        };
      }
    }
    return {
      ...base,
      status: "met" as const,
      message: `${tableName(tid)} is ${dTxt} m from the ${target.label.toLowerCase()}, away from the band.`,
      tables: [tid],
      guests: [g],
    };
  });
}

export const rsvpLabel: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Awaiting reply",
  no: "Declined",
};

export const rsvpTone: Record<Rsvp, "success" | "warning" | "info" | "neutral"> = {
  yes: "success",
  maybe: "warning",
  pending: "info",
  no: "neutral",
};

export const STANDARD_MEAL = "Standard menu";

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${d} ${names[m - 1]} ${y}`;
}
```

