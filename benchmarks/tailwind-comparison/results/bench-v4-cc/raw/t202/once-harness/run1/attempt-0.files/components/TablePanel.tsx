"use client";

import { Column, Icon, IconButton, Row, Tag, Text } from "@once-ui-system/core";
import { GUEST_BY_ID, TABLE_BY_ID } from "@/lib/data";
import { dietTone, dotBg, toneOf } from "@/lib/theme";
import { Panel } from "./Panel";
import { usePlan } from "./PlanProvider";

export function TablePanel() {
  const { selectedTable, seating, results, heldId, place, unseat, hold } = usePlan();
  if (!selectedTable) {
    return (
      <Panel title="Table details">
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Select a table on the plan to see who is sitting there and what they eat.
        </Text>
      </Panel>
    );
  }
  const table = TABLE_BY_ID[selectedTable];
  const slots = seating[selectedTable];
  const guests = slots.filter((id): id is string => id !== null).map((id) => GUEST_BY_ID[id]);
  const diets = new Map<string, number>();
  for (const g of guests) if (g.diet) diets.set(g.diet, (diets.get(g.diet) ?? 0) + 1);
  const flags = results.filter((r) => r.status === "broken" && r.tableIds.includes(table.id));

  return (
    <Panel
      title={table.name}
      subtitle={`${guests.length} of ${table.seats} seats filled · ${table.seats - guests.length} free`}
    >
      {flags.map((r) => (
        <Row
          key={r.index}
          gap="8"
          padding="8"
          radius="m"
          background="danger-alpha-weak"
          vertical="start"
          role="alert"
        >
          <Icon name="warning" size="s" onBackground="danger-strong" />
          <Column gap="0" flex={1}>
            <Text textVariant="label-strong-xs">{r.title}</Text>
            <Text textVariant="body-default-xs">{r.detail}</Text>
          </Column>
        </Row>
      ))}
      <Row gap="4" wrap vertical="center">
        <Text textVariant="label-default-xs" onBackground="neutral-weak">
          Dietary needs:
        </Text>
        {diets.size === 0 ? (
          <Text textVariant="body-default-xs">none at this table</Text>
        ) : (
          Array.from(diets.entries()).map(([diet, n]) => (
            <Tag key={diet} size="s" tone={dietTone(diet)} label={`${diet} × ${n}`} />
          ))
        )}
      </Row>
      <Column as="ol" gap="2">
        {slots.map((id, i) => {
          const guest = id ? GUEST_BY_ID[id] : null;
          const label = `Seat ${i + 1}`;
          return (
            <Row as="li" key={i} gap="4" vertical="center" fillWidth>
              <Row
                as="button"
                type="button"
                className="sw-hit"
                fillWidth
                flex={1}
                gap="12"
                vertical="center"
                padding="8"
                radius="m"
                background={guest && heldId === guest.id ? "brand-alpha-weak" : "transparent"}
                border="transparent"
                aria-label={
                  guest
                    ? `${label}: ${guest.name}. ${heldId === guest.id ? "Put down" : heldId ? "Swap with the guest in hand" : "Pick up to move"}`
                    : `${label}: empty${heldId ? ". Seat the guest in hand here" : ""}`
                }
                onClick={() => {
                  if (heldId) {
                    if (guest && guest.id === heldId) hold(null);
                    else place(heldId, table.id, i);
                  } else if (guest) hold(guest.id);
                }}
                style={{ textAlign: "left", minHeight: 44 }}
              >
                <Text
                  textVariant="label-default-xs"
                  onBackground="neutral-weak"
                  style={{ width: 16, textAlign: "right" }}
                >
                  {i + 1}
                </Text>
                {guest ? (
                  <>
                    <Row width={10} height={10} radius="full" background={dotBg(toneOf(guest.party))} />
                    <Column flex={1} gap="0">
                      <Text textVariant="label-strong-s">{guest.name}</Text>
                      <Text textVariant="body-default-xs" onBackground="neutral-weak">
                        {guest.party}
                      </Text>
                    </Column>
                    {guest.diet ? (
                      <Tag size="s" tone={dietTone(guest.diet)} label={guest.diet} />
                    ) : null}
                  </>
                ) : (
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    Empty seat
                  </Text>
                )}
              </Row>
              {guest ? (
                <IconButton
                  icon="personRemove"
                  variant="tertiary"
                  size="s"
                  tooltip="Unseat"
                  aria-label={`Unseat ${guest.name}`}
                  onClick={() => unseat(guest.id)}
                />
              ) : null}
            </Row>
          );
        })}
      </Column>
    </Panel>
  );
}
