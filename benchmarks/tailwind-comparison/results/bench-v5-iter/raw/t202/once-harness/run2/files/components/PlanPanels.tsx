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
