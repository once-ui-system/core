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
