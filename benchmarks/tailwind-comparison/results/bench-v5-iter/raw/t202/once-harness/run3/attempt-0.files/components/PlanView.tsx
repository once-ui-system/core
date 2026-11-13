"use client";

import { Button, Column, Grid, Heading, Icon, IconButton, Row, Tag, Text } from "@once-ui-system/core";
import { FloorPlan } from "@/components/FloorPlan";
import { PageHeader } from "@/components/PageHeader";
import { GUESTS, TABLES, initials, type Guest } from "@/lib/data";
import { dietSummary, type RuleState } from "@/lib/plan";
import { usePlan } from "@/lib/PlanContext";

const GUEST_BY_ID: Record<string, Guest> = Object.fromEntries(GUESTS.map((x) => [x.id, x]));

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "danger" | "success";
}) {
  return (
    <Column background="surface" border radius="l" padding="16" gap="4">
      <Text textVariant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Heading
        as="p"
        textVariant="display-strong-xs"
        onBackground={tone ? `${tone}-strong` : undefined}
      >
        {value}
      </Heading>
      <Text textVariant="body-default-xs" onBackground="neutral-weak">
        {hint}
      </Text>
    </Column>
  );
}

function DietTag({ diet }: { diet: string }) {
  return <Tag size="s" tone="warning" label={diet} />;
}

function GuestChip({ guest }: { guest: Guest }) {
  const { armed, setArmed } = usePlan();
  const isArmed = armed === guest.id;
  return (
    <Row
      as="button"
      type="button"
      draggable
      fillWidth
      gap="12"
      padding="8"
      paddingX="12"
      vertical="center"
      radius="m"
      align="left"
      cursor="interactive"
      background={isArmed ? "brand-alpha-weak" : "surface"}
      border={isArmed ? "brand-strong" : true}
      aria-pressed={isArmed}
      onClick={() => setArmed(isArmed ? null : guest.id)}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", guest.id);
        e.dataTransfer.effectAllowed = "move";
        setArmed(null);
      }}
    >
      <Row
        width="32"
        height="32"
        radius="full"
        background="neutral-alpha-weak"
        center
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <Text textVariant="label-strong-s">{initials(guest.name)}</Text>
      </Row>
      <Column flex={1} gap="2" style={{ minWidth: 0 }}>
        <Text textVariant="label-strong-s">{guest.name}</Text>
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          {guest.party}
        </Text>
      </Column>
      {guest.diet ? <DietTag diet={guest.diet} /> : null}
    </Row>
  );
}

function UnseatedCard() {
  const { assign, counts, unseat, armed } = usePlan();
  const attending = GUESTS.filter((x) => x.rsvp === "yes" && !assign[x.id]);
  const possible = GUESTS.filter(
    (x) => (x.rsvp === "maybe" || x.rsvp === "pending") && !assign[x.id],
  );
  return (
    <Column
      background="surface"
      border
      radius="l"
      padding="16"
      gap="12"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");
        if (id && assign[id]) unseat(id);
      }}
    >
      <Row vertical="center" gap="8">
        <Heading as="h2" textVariant="heading-strong-m">
          Still to seat
        </Heading>
        <Tag size="s" tone={counts.unseated ? "warning" : "success"} label={String(counts.unseated)} />
      </Row>
      <Text textVariant="body-default-s" onBackground="neutral-weak">
        {armed
          ? "Now tap a seat or a table. Tap the guest again to cancel."
          : "Drag a guest onto a seat, or tap a guest and then a seat."}
      </Text>
      {attending.length === 0 ? (
        <Row
          fillWidth
          padding="16"
          radius="m"
          border="success-alpha-medium"
          background="success-alpha-weak"
          gap="8"
          vertical="center"
        >
          <Icon name="check" onBackground="success-strong" />
          <Text textVariant="body-default-s">Every attending guest has a seat.</Text>
        </Row>
      ) : (
        <Column as="ul" gap="8" margin="0" padding="0" aria-label="Attending guests without a seat">
          {attending.map((guest) => (
            <li key={guest.id} style={{ listStyle: "none" }}>
              <GuestChip guest={guest} />
            </li>
          ))}
        </Column>
      )}
      {possible.length > 0 ? (
        <Column gap="8">
          <Text textVariant="label-default-s" onBackground="neutral-weak">
            Not confirmed yet ({possible.length})
          </Text>
          <Column as="ul" gap="8" margin="0" padding="0" aria-label="Guests who have not confirmed">
            {possible.map((guest) => (
              <li key={guest.id} style={{ listStyle: "none" }}>
                <Row gap="8" vertical="center">
                  <Column flex={1} style={{ minWidth: 0 }}>
                    <GuestChip guest={guest} />
                  </Column>
                  <Tag size="s" tone="info" label={guest.rsvp === "maybe" ? "Maybe" : "Pending"} />
                </Row>
              </li>
            ))}
          </Column>
        </Column>
      ) : null}
      {armed && assign[armed] ? (
        <Button
          variant="secondary"
          size="s"
          prefixIcon="personRemove"
          fillWidth
          onClick={() => unseat(armed)}
        >
          Unseat {GUEST_BY_ID[armed]?.name}
        </Button>
      ) : null}
    </Column>
  );
}

function TableCard() {
  const { selectedTable, seatMap, armed, place, unseat, setArmed, brokenTables, rules } = usePlan();
  const table = TABLES.find((t) => t.id === selectedTable);
  if (!table) {
    return (
      <Column background="surface" border radius="l" padding="16" gap="8">
        <Heading as="h2" textVariant="heading-strong-m">
          Table details
        </Heading>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Select a table on the plan to see who sits there and what they eat.
        </Text>
      </Column>
    );
  }
  const seats = seatMap[table.id];
  const filled = seats.filter(Boolean).length;
  const diets = dietSummary(seats);
  const flagged = rules.filter((r) => r.state === "broken" && r.tables.includes(table.id));
  return (
    <Column background="surface" border radius="l" padding="16" gap="12">
      <Row vertical="center" gap="8" wrap>
        <Heading as="h2" textVariant="heading-strong-m">
          {table.name}
        </Heading>
        <Tag size="s" tone={filled === table.seats ? "success" : "neutral"} label={`${filled} of ${table.seats} seated`} />
        {brokenTables.has(table.id) ? (
          <Tag size="s" tone="danger" prefixIcon="warning" label="Rule broken" />
        ) : null}
      </Row>
      {flagged.map((r) => (
        <Row
          key={r.index}
          gap="8"
          padding="12"
          radius="m"
          background="danger-alpha-weak"
          border="danger-alpha-medium"
        >
          <Icon name="warning" onBackground="danger-strong" />
          <Text textVariant="body-default-s">{r.message}</Text>
        </Row>
      ))}
      <Text textVariant="body-default-s" onBackground="neutral-weak">
        {diets.length
          ? `Dietary needs: ${diets.map((d) => `${d.count} ${d.diet}`).join(", ")}`
          : "No dietary needs at this table."}
      </Text>
      <Column as="ul" gap="4" margin="0" padding="0" aria-label={`Seats at ${table.name}`}>
        {seats.map((gid, i) => {
          const guest = gid ? GUEST_BY_ID[gid] : null;
          return (
            <li key={`${table.id}-${i}`} style={{ listStyle: "none" }}>
              {guest ? (
                <Row gap="8" vertical="center" paddingY="4">
                  <Text textVariant="label-default-s" onBackground="neutral-weak" style={{ width: "1.25rem" }}>
                    {i + 1}
                  </Text>
                  <Column
                    as="button"
                    type="button"
                    flex={1}
                    gap="2"
                    align="left"
                    cursor="interactive"
                    aria-pressed={armed === guest.id}
                    onClick={() => setArmed(armed === guest.id ? null : guest.id)}
                    style={{ minWidth: 0 }}
                  >
                    <Text textVariant="label-strong-s" onBackground={armed === guest.id ? "brand-strong" : undefined}>
                      {guest.name}
                    </Text>
                    <Text textVariant="body-default-xs" onBackground="neutral-weak">
                      {guest.party}
                    </Text>
                  </Column>
                  {guest.diet ? <DietTag diet={guest.diet} /> : null}
                  <IconButton
                    icon="personRemove"
                    variant="tertiary"
                    size="s"
                    tooltip="Unseat"
                    aria-label={`Unseat ${guest.name}`}
                    onClick={() => unseat(guest.id)}
                  />
                </Row>
              ) : (
                <Row
                  as="button"
                  type="button"
                  fillWidth
                  gap="8"
                  vertical="center"
                  padding="8"
                  radius="s"
                  border
                  borderStyle="dashed"
                  cursor="interactive"
                  align="left"
                  onClick={() => armed && place(armed, table.id, i)}
                >
                  <Text textVariant="label-default-s" onBackground="neutral-weak" style={{ width: "1.25rem" }}>
                    {i + 1}
                  </Text>
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    Empty seat
                  </Text>
                </Row>
              )}
            </li>
          );
        })}
      </Column>
      {armed && seats.some((s) => s === null) && !seats.includes(armed) ? (
        <Button size="s" prefixIcon="plus" onClick={() => place(armed, table.id)}>
          Seat {GUEST_BY_ID[armed]?.name} here
        </Button>
      ) : null}
    </Column>
  );
}

const STATE_LOOK: Record<RuleState, { icon: "check" | "warning" | "time"; tone: "success" | "danger" | "warning"; label: string }> = {
  ok: { icon: "check", tone: "success", label: "Kept" },
  broken: { icon: "warning", tone: "danger", label: "Broken" },
  pending: { icon: "time", tone: "warning", label: "Waiting" },
};

function RulesCard() {
  const { rules, counts, selectTable } = usePlan();
  return (
    <Column background="surface" border radius="l" padding="16" gap="12">
      <Row vertical="center" gap="8" wrap>
        <Heading as="h2" textVariant="heading-strong-m">
          The couple&apos;s rules
        </Heading>
        <Tag
          size="s"
          tone={counts.broken ? "danger" : "success"}
          label={counts.broken ? `${counts.broken} broken` : "All kept"}
        />
        {counts.pending ? <Tag size="s" tone="warning" label={`${counts.pending} waiting`} /> : null}
      </Row>
      <Column as="ul" gap="8" margin="0" padding="0" aria-label="Seating rules">
        {rules.map((r) => {
          const look = STATE_LOOK[r.state];
          return (
            <li key={r.index} style={{ listStyle: "none" }}>
              <Row
                as="button"
                type="button"
                fillWidth
                gap="12"
                padding="12"
                radius="m"
                align="left"
                cursor="interactive"
                background={r.state === "broken" ? "danger-alpha-weak" : "transparent"}
                border={r.state === "broken" ? "danger-alpha-medium" : true}
                onClick={() => r.tables[0] && selectTable(r.tables[0])}
              >
                <Icon name={look.icon} onBackground={`${look.tone}-strong`} />
                <Column flex={1} gap="2" style={{ minWidth: 0 }}>
                  <Row gap="8" vertical="center" wrap>
                    <Text textVariant="label-strong-s">{r.title}</Text>
                    <Tag size="s" tone={look.tone} label={look.label} />
                  </Row>
                  <Text textVariant="body-default-s">{r.message}</Text>
                  <Text textVariant="body-default-xs" onBackground="neutral-weak">
                    {r.note}
                  </Text>
                </Column>
              </Row>
            </li>
          );
        })}
      </Column>
    </Column>
  );
}

export function PlanView() {
  const { counts, seatMap, selectedTable, selectTable, reset, status, brokenTables, armed, setArmed } =
    usePlan();
  return (
    <Column fillWidth maxWidth="xl" paddingX="16" paddingY="24" gap="20">
      <PageHeader
        title="Seating plan"
        actions={
          <Button variant="secondary" size="s" prefixIcon="refresh" onClick={reset}>
            Reset plan
          </Button>
        }
      />
      <Grid columns="4" s={{ columns: "2" }} gap="12" fillWidth>
        <Stat
          label="Seated"
          value={String(counts.seated)}
          hint={`of ${counts.attending} attending guests`}
        />
        <Stat
          label="Unseated"
          value={String(counts.unseated)}
          hint="attending, still to place"
          tone={counts.unseated ? undefined : "success"}
        />
        <Stat label="Free seats" value={String(counts.freeSeats)} hint={`of ${counts.totalSeats} seats`} />
        <Stat
          label="Rules"
          value={counts.broken ? `${counts.broken} broken` : "All kept"}
          hint={counts.pending ? `${counts.pending} waiting on a seat` : "checked as you work"}
          tone={counts.broken ? "danger" : "success"}
        />
      </Grid>
      <Row fillWidth gap="24" vertical="start" m={{ direction: "column" }}>
        <Column flex={1} fillWidth gap="12" style={{ minWidth: 0 }}>
          <Row gap="8" wrap role="group" aria-label="Tables">
            {TABLES.map((t) => {
              const filled = seatMap[t.id].filter(Boolean).length;
              return (
                <Tag
                  key={t.id}
                  interactive
                  size="m"
                  selected={selectedTable === t.id}
                  tone={brokenTables.has(t.id) ? "danger" : "neutral"}
                  prefixIcon={brokenTables.has(t.id) ? "warning" : undefined}
                  label={`${t.name} ${filled}/${t.seats}`}
                  onClick={() => selectTable(t.id)}
                />
              );
            })}
          </Row>
          <Row
            fillWidth
            gap="12"
            vertical="center"
            paddingX="12"
            paddingY="8"
            radius="m"
            background={armed ? "brand-alpha-weak" : "transparent"}
            border={armed ? "brand-alpha-medium" : "transparent"}
            minHeight="40"
          >
            <Icon name={armed ? "arrowRight" : "info"} onBackground="neutral-weak" size="s" />
            <Text role="status" aria-live="polite" textVariant="body-default-s" style={{ flex: 1 }}>
              {status || "Drag guests between seats, or tap a guest and then a seat. Dotted seats are empty."}
            </Text>
            {armed ? (
              <Button variant="tertiary" size="s" onClick={() => setArmed(null)}>
                Cancel
              </Button>
            ) : null}
          </Row>
          <FloorPlan />
          <Row gap="16" wrap paddingX="4">
            <Row gap="8" vertical="center">
              <Row width="12" height="12" radius="full" border borderStyle="dashed" aria-hidden="true" />
              <Text textVariant="body-default-xs" onBackground="neutral-weak">
                Empty seat
              </Text>
            </Row>
            <Row gap="8" vertical="center">
              <Row width="12" height="12" radius="full" background="warning-strong" aria-hidden="true" />
              <Text textVariant="body-default-xs" onBackground="neutral-weak">
                Dietary need
              </Text>
            </Row>
            <Row gap="8" vertical="center">
              <Row width="12" height="12" radius="full" border="danger-strong" borderWidth={2} aria-hidden="true" />
              <Text textVariant="body-default-xs" onBackground="neutral-weak">
                Guest in a broken rule
              </Text>
            </Row>
          </Row>
        </Column>
        <Column gap="16" m={{ fillWidth: true }} style={{ width: "22rem", flexShrink: 0 }}>
          <TableCard />
          <UnseatedCard />
          <RulesCard />
        </Column>
      </Row>
    </Column>
  );
}
