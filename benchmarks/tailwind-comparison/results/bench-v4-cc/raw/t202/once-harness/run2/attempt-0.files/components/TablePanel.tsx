"use client";

import { Column, Heading, Icon, IconButton, Row, Tag, Text } from "@once-ui-system/core";
import { GUEST_BY_ID, TABLE_BY_ID } from "@/lib/data";
import { GuestChip } from "./GuestChip";
import { usePlan } from "./PlanProvider";

export function TablePanel() {
  const { selectedTable, selectTable, seating, picked, pick, unseat, placePicked, rules } = usePlan();

  if (!selectedTable) {
    return (
      <Column background="surface" border radius="l" padding="16" gap="8" fillWidth>
        <Heading as="h2" textVariant="heading-strong-m">
          Table details
        </Heading>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Select a table on the plan to see who sits there and what they need to eat.
        </Text>
      </Column>
    );
  }

  const table = TABLE_BY_ID[selectedTable];
  const slots = seating[selectedTable];
  const guests = slots.filter((s): s is string => s !== null).map((id) => GUEST_BY_ID[id]);
  const diets = new Map<string, number>();
  for (const g of guests) if (g.diet) diets.set(g.diet, (diets.get(g.diet) ?? 0) + 1);
  const related = rules.filter((r) => r.tableIds.includes(selectedTable) && r.status !== "kept");

  return (
    <Column background="surface" border radius="l" padding="16" gap="12" fillWidth aria-live="polite">
      <Row gap="8" vertical="center">
        <Column flex={1} gap="2">
          <Heading as="h2" textVariant="heading-strong-m">
            {table.name}
          </Heading>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            {guests.length} of {table.seats} seats filled · {table.seats - guests.length} free
          </Text>
        </Column>
        <IconButton icon="close" variant="tertiary" size="s" tooltip="Close" aria-label="Close table details" onClick={() => selectTable(null)} />
      </Row>

      {related.map((r) => (
        <Row key={r.id} gap="8" padding="8" radius="m" background={r.status === "broken" ? "danger-alpha-weak" : "neutral-alpha-weak"} vertical="start">
          <Icon name={r.status === "broken" ? "danger" : "time"} size="s" onBackground={r.status === "broken" ? "danger-strong" : "neutral-weak"} />
          <Text textVariant="body-default-s">{r.title}. {r.detail}</Text>
        </Row>
      ))}

      <Column gap="4">
        <Text textVariant="label-strong-s" onBackground="neutral-weak">
          Dietary needs
        </Text>
        {diets.size === 0 ? (
          <Text textVariant="body-default-s">No dietary needs at this table.</Text>
        ) : (
          <Row gap="4" wrap>
            {Array.from(diets.entries()).map(([diet, n]) => (
              <Tag key={diet} tone="accent" size="s" label={`${n} × ${diet}`} />
            ))}
          </Row>
        )}
      </Column>

      <Column as="ol" gap="4" fillWidth>
        {slots.map((id, i) => {
          const g = id ? GUEST_BY_ID[id] : null;
          return (
            <li key={i} style={{ listStyle: "none" }}>
              {g ? (
                <GuestChip
                  guest={g}
                  active={picked === g.id}
                  hint={`Seat ${i + 1}. Tap to move`}
                  onClick={() => pick(picked === g.id ? null : g.id)}
                  trailing={
                    <IconButton
                      icon="personRemove"
                      variant="tertiary"
                      size="s"
                      tooltip="Unseat"
                      aria-label={`Unseat ${g.name}`}
                      onClick={() => unseat(g.id)}
                    />
                  }
                />
              ) : (
                <Row
                  as="button"
                  type="button"
                  fillWidth
                  gap="12"
                  padding="8"
                  radius="m"
                  vertical="center"
                  borderStyle="dashed"
                  border="neutral-alpha-medium"
                  cursor="interactive"
                  aria-label={`${table.name} seat ${i + 1}: empty${picked ? `. Place ${GUEST_BY_ID[picked].name} here` : ""}`}
                  onClick={() => {
                    if (picked) placePicked(table.id, i);
                  }}>
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    Seat {i + 1} · empty
                  </Text>
                </Row>
              )}
            </li>
          );
        })}
      </Column>
    </Column>
  );
}
