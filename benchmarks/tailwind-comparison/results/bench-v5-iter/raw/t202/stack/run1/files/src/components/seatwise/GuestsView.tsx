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
