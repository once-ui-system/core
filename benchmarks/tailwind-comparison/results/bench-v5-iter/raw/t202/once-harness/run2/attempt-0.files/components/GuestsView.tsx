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
