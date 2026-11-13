"use client";

import { useState } from "react";
import { Column, Heading, Icon, Row, Tag, Text } from "@once-ui-system/core";
import { GUEST_BY_ID } from "@/lib/data";
import { GuestChip } from "./GuestChip";
import { usePlan } from "./PlanProvider";

export function UnseatedPanel() {
  const { stats, picked, pick, unseat, dragId, setDragId, tableOf } = usePlan();
  const [over, setOver] = useState(false);
  const canUnseat = dragId !== null && tableOf[dragId] !== null && tableOf[dragId] !== undefined;

  return (
    <div
      onDragOver={(e) => {
        if (!canUnseat) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData("text/plain");
        setDragId(null);
        if (id && GUEST_BY_ID[id]) unseat(id);
      }}
      style={{ width: "100%" }}>
      <Column
        background="surface"
        border={over || canUnseat ? "brand-alpha-strong" : true}
        borderStyle={over || canUnseat ? "dashed" : "solid"}
        radius="l"
        padding="16"
        gap="12"
        fillWidth>
        <Row gap="8" vertical="center">
          <Heading as="h2" textVariant="heading-strong-m" flex={1}>
            To seat
          </Heading>
          <Tag tone={stats.unseated.length === 0 ? "success" : "brand"} size="s" label={`${stats.unseated.length} attending`} />
        </Row>
        {canUnseat ? (
          <Text textVariant="body-default-s" onBackground="brand-strong">
            Drop here to unseat.
          </Text>
        ) : null}
        {stats.unseated.length === 0 ? (
          <Row gap="8" vertical="center" padding="12" radius="m" background="success-alpha-weak">
            <Icon name="check" size="s" onBackground="success-strong" />
            <Text textVariant="body-default-s">Everyone attending has a seat.</Text>
          </Row>
        ) : (
          <Column gap="4" fillWidth>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              Drag a guest onto a table, or tap a guest and then a table or seat.
            </Text>
            {stats.unseated.map((g) => (
              <GuestChip
                key={g.id}
                guest={g}
                active={picked === g.id}
                onClick={() => pick(picked === g.id ? null : g.id)}
              />
            ))}
          </Column>
        )}
        {stats.unconfirmed.length > 0 ? (
          <Column gap="4" fillWidth paddingTop="8">
            <Text textVariant="label-strong-s" onBackground="neutral-weak">
              Not confirmed yet ({stats.unconfirmed.length})
            </Text>
            {stats.unconfirmed.map((g) => (
              <GuestChip
                key={g.id}
                guest={g}
                active={picked === g.id}
                hint={`RSVP ${g.rsvp}`}
                onClick={() => pick(picked === g.id ? null : g.id)}
                trailing={
                  <Row vertical="center" paddingX="4" fit>
                    <Tag tone={g.rsvp === "maybe" ? "warning" : "neutral"} size="s" label={g.rsvp === "maybe" ? "Maybe" : "Pending"} />
                  </Row>
                }
              />
            ))}
          </Column>
        ) : null}
      </Column>
    </div>
  );
}
