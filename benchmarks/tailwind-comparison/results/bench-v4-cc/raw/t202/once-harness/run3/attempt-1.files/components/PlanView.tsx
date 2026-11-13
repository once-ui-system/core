"use client";

import { useEffect } from "react";
import { Button, Column, Heading, Icon, Row, Text } from "@once-ui-system/core";
import { EVENT, GUEST_BY_ID, TABLE_BY_ID } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { useWide } from "@/lib/useWide";
import { Plan } from "./Plan";
import { RulesPanel, TablePanel, UnseatedPanel } from "./SidePanel";
import { C } from "./ui";

function Stat({ label, value, hint, tone }: { label: string; value: string; hint: string; tone?: string }) {
  return (
    <Column
      background="surface"
      border
      radius="l"
      padding="16"
      gap="4"
      flex="1"
      minWidth="9rem"
    >
      <Text textVariant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <span style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1, color: tone ?? C.text }}>
        {value}
      </span>
      <Text textVariant="body-default-xs" onBackground="neutral-weak">
        {hint}
      </Text>
    </Column>
  );
}

export function PlanView() {
  const wide = useWide(1100);
  const { stats, notice, armed, arm, unseat, tableOf } = usePlan();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") arm(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [arm]);

  const armedGuest = armed ? GUEST_BY_ID[armed] : null;
  const armedTable = armed && tableOf[armed] ? TABLE_BY_ID[tableOf[armed] as string] : null;

  const side = (
    <Column gap="16" flex="1" minWidth="0">
      <RulesPanel />
      <TablePanel />
      <UnseatedPanel />
    </Column>
  );

  return (
    <>
      <Row horizontal="between" vertical="end" gap="16" wrap>
        <Column gap="4">
          <Heading as="h1" textVariant="display-strong-xs">
            Seating plan
          </Heading>
          <Text textVariant="body-default-m" onBackground="neutral-weak">
            {EVENT.name} · {EVENT.venue}
          </Text>
        </Column>
      </Row>

      <Row gap="12" wrap>
        <Stat label="Seated" value={String(stats.seated)} hint={`of ${stats.totalSeats} seats`} />
        <Stat
          label="Attending, unseated"
          value={String(stats.unseatedAttending)}
          hint={`${stats.attending} attending in all`}
          tone={stats.unseatedAttending > 0 ? C.warning : C.success}
        />
        <Stat
          label="Free seats"
          value={String(stats.freeSeats)}
          hint={`${stats.awaiting} guests not confirmed`}
        />
        <Stat
          label="Rules broken"
          value={String(stats.broken)}
          hint={`${stats.pending} waiting for a seat`}
          tone={stats.broken > 0 ? C.danger : C.success}
        />
      </Row>

      <Row
        gap="12"
        vertical="center"
        horizontal="between"
        wrap
        padding="12"
        radius="m"
        border
        background="surface"
      >
        <Row gap="8" vertical="center" flex="1" minWidth="0">
          <Icon name={armedGuest ? "grip" : "info"} size="s" onBackground="brand-strong" />
          <div role="status" aria-live="polite" style={{ fontSize: 14, color: C.text }}>
            {armedGuest
              ? `${armedGuest.name} is picked up${armedTable ? ` from ${armedTable.name}` : ""}. Tap a table to seat them, or a seat to swap. Esc cancels.`
              : notice}
          </div>
        </Row>
        {armedGuest ? (
          <Row gap="8">
            {armedTable ? (
              <Button size="s" variant="secondary" prefixIcon="personRemove" onClick={() => unseat(armedGuest.id)}>
                Unseat
              </Button>
            ) : null}
            <Button size="s" variant="tertiary" onClick={() => arm(null)}>
              Cancel
            </Button>
          </Row>
        ) : null}
      </Row>

      {wide ? (
        <Row gap="16" vertical="start">
          <Column flex="3" minWidth="0">
            <Plan />
          </Column>
          <Column flex="1" style={{ width: "24rem", maxWidth: "24rem", flexShrink: 0 }}>
            {side}
          </Column>
        </Row>
      ) : (
        <Column gap="16">
          <Plan />
          {side}
        </Column>
      )}
    </>
  );
}
