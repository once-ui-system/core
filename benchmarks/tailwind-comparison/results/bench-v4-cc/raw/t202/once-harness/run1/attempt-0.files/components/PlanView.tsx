"use client";

import { Button, Column, Heading, Icon, Row, Text } from "@once-ui-system/core";
import { GUESTS, TABLES } from "@/lib/data";
import { useMinWidth } from "@/lib/useMinWidth";
import { usePlan } from "./PlanProvider";
import { RoomPlan } from "./RoomPlan";
import { RulesPanel } from "./RulesPanel";
import { TablePanel } from "./TablePanel";
import { UnseatedPanel } from "./UnseatedPanel";

function Stat({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: boolean }) {
  return (
    <Column
      background="surface"
      border={tone ? "danger-strong" : true}
      radius="l"
      padding="16"
      gap="4"
      flex={1}
      minWidth="10rem"
    >
      <Text textVariant="label-default-xs" onBackground="neutral-weak">
        {label}
      </Text>
      <Text textVariant="display-strong-xs">{value}</Text>
      <Text textVariant="body-default-xs" onBackground="neutral-weak">
        {sub}
      </Text>
    </Column>
  );
}

export function PlanView() {
  const wide = useMinWidth(1240);
  const { locations, results, notice, heldId, hold, reset } = usePlan();

  const attending = GUESTS.filter((g) => g.rsvp === "yes");
  const seatedTotal = Object.keys(locations).length;
  const seatedAttending = attending.filter((g) => locations[g.id]).length;
  const unseatedAttending = attending.length - seatedAttending;
  const unseatedOther = GUESTS.filter(
    (g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !locations[g.id],
  ).length;
  const totalSeats = TABLES.reduce((n, t) => n + t.seats, 0);
  const broken = results.filter((r) => r.status === "broken").length;
  const open = results.filter((r) => r.status === "open").length;

  return (
    <>
      <Row horizontal="between" vertical="end" gap="16" wrap>
        <Column gap="4">
          <Heading as="h1" textVariant="display-strong-xs">
            Seating plan
          </Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            Seat, move and unseat guests. Counts and rules update as you go.
          </Text>
        </Column>
        <Button variant="secondary" size="s" prefixIcon="refresh" onClick={reset}>
          Reset plan
        </Button>
      </Row>

      <Row gap="12" wrap>
        <Stat
          label="Seated"
          value={String(seatedTotal)}
          sub={`${seatedAttending} of ${attending.length} attending guests`}
        />
        <Stat
          label="Still to seat"
          value={String(unseatedAttending)}
          sub={`${unseatedOther} unconfirmed also without a seat`}
        />
        <Stat
          label="Open seats"
          value={String(totalSeats - seatedTotal)}
          sub={`of ${totalSeats} across ${TABLES.length} tables`}
        />
        <Stat
          label="Rules"
          value={broken === 0 ? "All clear" : `${broken} broken`}
          sub={`${open} waiting on a seat · ${results.length} in total`}
          tone={broken > 0}
        />
      </Row>

      <Row
        gap="8"
        vertical="center"
        padding="8"
        radius="m"
        background={heldId ? "brand-alpha-weak" : "transparent"}
        minHeight="40"
        role="status"
        aria-live="polite"
      >
        {notice ? (
          <>
            <Icon name={heldId ? "arrowUpRight" : "info"} size="s" onBackground="brand-strong" />
            <Text textVariant="label-default-s" flex={1}>
              {notice}
            </Text>
          </>
        ) : null}
        {heldId ? (
          <Button size="s" variant="tertiary" onClick={() => hold(null)}>
            Cancel
          </Button>
        ) : null}
      </Row>

      {wide ? (
        <Row gap="16" vertical="start">
          <Column flex={1} gap="16">
            <RoomPlan />
          </Column>
          <Column gap="16" width="24rem" style={{ flex: "0 0 24rem" }}>
            <TablePanel />
            <UnseatedPanel />
            <RulesPanel />
          </Column>
        </Row>
      ) : (
        <Column gap="16" fillWidth>
          <UnseatedPanel />
          <RoomPlan />
          <TablePanel />
          <RulesPanel />
        </Column>
      )}
    </>
  );
}
