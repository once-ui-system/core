"use client";

import { Button, Column, Grid, Heading, Row, Select, Tag, Text } from "@once-ui-system/core";
import { useState } from "react";
import { initials, rsvpLabel, rsvpScheme, tables } from "@/lib/data";
import { type PlacedGuest, tableName, useSeating } from "@/lib/seating";
import { partyIndex } from "./party";

/* ---------------------------------------------------------------- stats */

export function StatTiles() {
  const { counts } = useSeating();
  const tiles = [
    { label: "Attending", value: counts.attending, note: "RSVP yes", tone: undefined },
    { label: "Seated", value: counts.seated, note: `of ${counts.capacity} seats`, tone: undefined },
    {
      label: "Unseated",
      value: counts.unseated,
      note: counts.unseated === 0 ? "Everyone has a seat" : "attending, need a seat",
      tone: counts.unseated > 0 ? ("warning-medium" as const) : ("success-medium" as const),
    },
    {
      label: "Rules broken",
      value: counts.broken,
      note: counts.broken === 0 ? "All rules kept" : "see the summary",
      tone: counts.broken > 0 ? ("danger-medium" as const) : ("success-medium" as const),
    },
  ];
  return (
    <Grid columns="4" s={{ columns: "2" }} gap="12" fillWidth>
      {tiles.map((tile) => (
        <Column key={tile.label} background="surface" border radius="l" padding="16" gap="4">
          <Text variant="label-default-s" onBackground="neutral-weak">
            {tile.label}
          </Text>
          <Heading as="p" variant="display-strong-xs" onBackground={tile.tone ?? "neutral-strong"}>
            {tile.value}
          </Heading>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            {tile.note}
          </Text>
        </Column>
      ))}
    </Grid>
  );
}

/* ----------------------------------------------------------- unseated pool */

function GuestChip({ guest }: { guest: PlacedGuest }) {
  const { heldGuestId, holdGuest } = useSeating();
  const held = heldGuestId === guest.id;
  return (
    <button
      type="button"
      className="sw-chip"
      data-held={held}
      data-diet={!!guest.diet}
      aria-pressed={held}
      draggable
      title={`${guest.name}, ${guest.party}${guest.diet ? `, ${guest.diet}` : ""}`}
      onClick={() => holdGuest(held ? null : guest.id)}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", guest.id);
        e.dataTransfer.effectAllowed = "move";
      }}
    >
      <span className="sw-dot" data-party={partyIndex(guest.party)} aria-hidden="true">
        {initials(guest.name)}
      </span>
      {guest.name}
    </button>
  );
}

export function UnseatedPool() {
  const { guests, unseatGuest } = useSeating();
  const [over, setOver] = useState(false);
  const waiting = guests.filter((guest) => guest.rsvp === "yes" && !guest.table);
  const tentative = guests.filter(
    (guest) => (guest.rsvp === "maybe" || guest.rsvp === "pending") && !guest.table,
  );

  return (
    <Column background="surface" border radius="l" padding="16" gap="12" fillWidth>
      <Row fillWidth horizontal="between" vertical="center" gap="8" wrap>
        <Row gap="8" vertical="center">
          <Heading as="h2" variant="heading-strong-m">
            Unseated guests
          </Heading>
          <Tag size="s" scheme={waiting.length ? "warning" : "success"}>
            {waiting.length}
          </Tag>
        </Row>
        <Text variant="body-default-xs" onBackground="neutral-weak">
          Attending, no seat yet. Drag a seat here to unseat.
        </Text>
      </Row>

      <Row
        className="sw-pool"
        data-target={over}
        gap="8"
        wrap
        padding="4"
        radius="m"
        minHeight={3}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const id = e.dataTransfer.getData("text/plain");
          if (id) unseatGuest(id);
        }}
      >
        {waiting.length === 0 ? (
          <Text variant="body-default-s" onBackground="neutral-weak" paddingY="8">
            Every attending guest has a seat.
          </Text>
        ) : (
          waiting.map((guest) => <GuestChip key={guest.id} guest={guest} />)
        )}
      </Row>

      {tentative.length > 0 && (
        <Column gap="8">
          <Text variant="label-default-xs" onBackground="neutral-weak">
            Not confirmed yet (maybe or awaiting reply)
          </Text>
          <Row gap="8" wrap>
            {tentative.map((guest) => (
              <GuestChip key={guest.id} guest={guest} />
            ))}
          </Row>
        </Column>
      )}
    </Column>
  );
}

/* -------------------------------------------------------------- rules */

const kindLabel = { together: "Keep together", apart: "Keep apart", near: "Seat near doors" } as const;

export function RulesPanel() {
  const { ruleStatuses, guests, counts } = useSeating();
  const nameOf = (id: string) => guests.find((guest) => guest.id === id)?.name ?? id;

  return (
    <Column background="surface" border radius="l" padding="16" gap="12" fillWidth>
      <Row fillWidth horizontal="between" vertical="center" gap="8">
        <Heading as="h2" variant="heading-strong-m">
          The couple&apos;s rules
        </Heading>
        <Tag size="s" scheme={counts.broken ? "danger" : "success"} prefixIcon={counts.broken ? "warning" : "check"}>
          {counts.broken ? `${counts.broken} broken` : "All kept"}
        </Tag>
      </Row>
      <Column as="ul" gap="8" margin="0" padding="0" style={{ listStyle: "none" }}>
        {ruleStatuses.map((status) => (
          <Column
            as="li"
            key={status.index}
            gap="4"
            padding="12"
            radius="m"
            border={status.status === "broken" ? "danger-alpha-medium" : true}
            background={status.status === "broken" ? "danger-alpha-weak" : "transparent"}
          >
            <Row gap="8" vertical="center" wrap>
              <Tag
                size="s"
                scheme={status.status === "broken" ? "danger" : status.status === "ok" ? "success" : "neutral"}
              >
                {status.status === "broken" ? "Broken" : status.status === "ok" ? "Kept" : "Open"}
              </Tag>
              <Text variant="label-default-s">{kindLabel[status.rule.kind]}</Text>
            </Row>
            <Text variant="body-strong-s">{status.rule.guests.map(nameOf).join(" and ")}</Text>
            <Text variant="body-default-s" onBackground={status.status === "broken" ? "danger-strong" : "neutral-medium"}>
              {status.message}
            </Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {status.rule.note}
            </Text>
          </Column>
        ))}
      </Column>
    </Column>
  );
}

/* ---------------------------------------------------------- selection */

export function SelectionPanel() {
  const { guests, heldGuestId, selectedTableId, occupancy, seatGuest, unseatGuest, holdGuest, selectTable } =
    useSeating();
  const held = guests.find((guest) => guest.id === heldGuestId) ?? null;
  const table = tables.find((item) => item.id === selectedTableId) ?? null;
  const slots = table ? occupancy[table.id] : [];
  const people = slots.filter((slot): slot is PlacedGuest => !!slot);
  const diets = people.reduce<Record<string, number>>((acc, person) => {
    if (person.diet) acc[person.diet] = (acc[person.diet] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Column background="surface" border radius="l" padding="16" gap="16" fillWidth>
      {held && (
        <Column gap="12" padding="12" radius="m" background="brand-alpha-weak" border="brand-alpha-medium">
          <Column gap="4">
            <Text variant="label-default-xs" onBackground="brand-medium">
              Picked up
            </Text>
            <Heading as="h2" variant="heading-strong-m">
              {held.name}
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-medium">
              {held.party} · {held.table ? `${tableName(held.table)}, seat ${(held.seat ?? 0) + 1}` : "Not seated"}
            </Text>
          </Column>
          <Row gap="8" wrap>
            <Tag size="s" scheme={rsvpScheme[held.rsvp]}>
              {rsvpLabel[held.rsvp]}
            </Tag>
            {held.diet && (
              <Tag size="s" scheme="warning">
                {held.diet}
              </Tag>
            )}
          </Row>
          <Select
            id="move-guest"
            label="Move to table"
            value={held.table ?? ""}
            options={tables.map((item) => {
              const free = occupancy[item.id].filter((slot) => !slot).length;
              return { value: item.id, label: `${item.name} (${free} free)` };
            })}
            onSelect={(value) => {
              if (typeof value === "string" && value) seatGuest(held.id, value);
            }}
          />
          <Row gap="8" wrap>
            {held.table && (
              <Button size="s" variant="secondary" prefixIcon="personRemove" onClick={() => unseatGuest(held.id)}>
                Unseat
              </Button>
            )}
            <Button size="s" variant="tertiary" onClick={() => holdGuest(null)}>
              Done
            </Button>
          </Row>
        </Column>
      )}

      {table ? (
        <Column gap="12">
          <Row fillWidth horizontal="between" vertical="center" gap="8">
            <Column gap="4">
              <Heading as="h2" variant="heading-strong-m">
                {table.name}
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {people.length} of {table.seats} seats taken, {table.seats - people.length} free
              </Text>
            </Column>
            <Button size="s" variant="tertiary" onClick={() => selectTable(null)}>
              Clear
            </Button>
          </Row>

          {people.length === 0 ? (
            <Text variant="body-default-s" onBackground="neutral-weak">
              Nobody is seated here yet. Pick up a guest, then tap this table.
            </Text>
          ) : (
            <Column as="ul" gap="4" margin="0" padding="0" style={{ listStyle: "none" }}>
              {slots.map((slot, i) => (
                <li key={`${table.id}-${i}`}>
                  {slot ? (
                    <button
                      type="button"
                      className="sw-rowbtn"
                      data-selected={heldGuestId === slot.id}
                      onClick={() => holdGuest(heldGuestId === slot.id ? null : slot.id)}
                      aria-label={`Seat ${i + 1}: ${slot.name}${slot.diet ? `, ${slot.diet}` : ", no dietary need"}`}
                    >
                      <span>
                        <Text variant="label-default-xs" onBackground="neutral-weak">
                          {i + 1}
                        </Text>
                        &nbsp;&nbsp;{slot.name}
                      </span>
                      {slot.diet ? (
                        <Tag size="s" scheme="warning">
                          {slot.diet}
                        </Tag>
                      ) : (
                        <Text variant="body-default-xs" onBackground="neutral-weak">
                          No dietary need
                        </Text>
                      )}
                    </button>
                  ) : (
                    <Row padding="8" paddingX="12" radius="m" borderStyle="dashed" border>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {i + 1}&nbsp;&nbsp;Empty seat
                      </Text>
                    </Row>
                  )}
                </li>
              ))}
            </Column>
          )}

          <Column gap="4">
            <Text variant="label-default-xs" onBackground="neutral-weak">
              Dietary needs at this table
            </Text>
            {Object.keys(diets).length === 0 ? (
              <Text variant="body-default-s">None</Text>
            ) : (
              <Row gap="8" wrap>
                {Object.entries(diets).map(([diet, n]) => (
                  <Tag key={diet} size="s" scheme="warning">
                    {n} × {diet}
                  </Tag>
                ))}
              </Row>
            )}
          </Column>
        </Column>
      ) : (
        !held && (
          <Column gap="4">
            <Heading as="h2" variant="heading-strong-m">
              Table details
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Select a table to see who sits there and what they eat.
            </Text>
          </Column>
        )
      )}
    </Column>
  );
}

/* ------------------------------------------------------- tables list */

export function TablesPanel() {
  const { occupancy, selectedTableId, selectTable, brokenTableIds } = useSeating();
  return (
    <Column background="surface" border radius="l" padding="16" gap="12" fillWidth>
      <Heading as="h2" variant="heading-strong-m">
        Tables
      </Heading>
      <Column as="ul" gap="4" margin="0" padding="0" style={{ listStyle: "none" }}>
        {tables.map((table) => {
          const taken = occupancy[table.id].filter(Boolean).length;
          return (
            <li key={table.id}>
              <button
                type="button"
                className="sw-rowbtn"
                data-selected={selectedTableId === table.id}
                aria-pressed={selectedTableId === table.id}
                onClick={() => selectTable(selectedTableId === table.id ? null : table.id)}
              >
                <span>{table.name}</span>
                <Row gap="8" vertical="center">
                  {brokenTableIds.has(table.id) && (
                    <Tag size="s" scheme="danger">
                      Rule
                    </Tag>
                  )}
                  <Text variant="label-default-s" onBackground={taken >= table.seats ? "success-medium" : "neutral-medium"}>
                    {taken}/{table.seats}
                  </Text>
                </Row>
              </button>
            </li>
          );
        })}
      </Column>
    </Column>
  );
}
