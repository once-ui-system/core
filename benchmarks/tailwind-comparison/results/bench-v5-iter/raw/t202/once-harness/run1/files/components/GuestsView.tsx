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
