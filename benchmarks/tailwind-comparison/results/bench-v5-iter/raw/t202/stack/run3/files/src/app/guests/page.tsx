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
