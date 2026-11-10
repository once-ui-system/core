"use client";

import { useState } from "react";
import { Column, Row, Tag, Text } from "@once-ui-system/core";
import { GUESTS, type Guest } from "@/lib/data";
import { dietTone, dotBg, toneOf } from "@/lib/theme";
import { Panel } from "./Panel";
import { usePlan } from "./PlanProvider";

function GuestChip({ guest }: { guest: Guest }) {
  const { heldId, hold, setDragId } = usePlan();
  const held = heldId === guest.id;
  return (
    <Row
      as="button"
      type="button"
      className="sw-hit"
      aria-pressed={held}
      draggable
      onClick={() => hold(held ? null : guest.id)}
      onDragStart={(e: React.DragEvent) => {
        e.dataTransfer.setData("text/plain", guest.id);
        e.dataTransfer.effectAllowed = "move";
        setDragId(guest.id);
      }}
      onDragEnd={() => setDragId(null)}
      fillWidth
      gap="12"
      vertical="center"
      padding="8"
      radius="m"
      background={held ? "brand-alpha-weak" : "transparent"}
      border={held ? "brand-strong" : "transparent"}
      borderWidth={held ? 2 : 1}
      style={{ textAlign: "left", minHeight: 44 }}
    >
      <Row width={10} height={10} radius="full" background={dotBg(toneOf(guest.party))} />
      <Column flex={1} gap="0">
        <Text textVariant="label-strong-s">{guest.name}</Text>
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          {guest.party}
          {guest.rsvp !== "yes" ? ` · ${guest.rsvp === "maybe" ? "maybe" : "no reply yet"}` : ""}
        </Text>
      </Column>
      {guest.diet ? <Tag size="s" tone={dietTone(guest.diet)} label={guest.diet} /> : null}
    </Row>
  );
}

export function UnseatedPanel() {
  const { locations, dragId, unseat, setDragId } = usePlan();
  const [over, setOver] = useState(false);
  const attending = GUESTS.filter((g) => g.rsvp === "yes" && !locations[g.id]);
  const unconfirmed = GUESTS.filter(
    (g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !locations[g.id],
  );

  return (
    <div
      onDragOver={(e) => {
        if (!dragId || !locations[dragId]) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (dragId && locations[dragId]) unseat(dragId);
        setDragId(null);
      }}
    >
      <Panel
        title={`Needs a seat (${attending.length})`}
        subtitle={
          over
            ? "Drop here to unseat"
            : "Attending guests without a seat. Tap one, then a seat or table, or drag."
        }
      >
        {attending.length === 0 ? (
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            Everyone attending has a seat.
          </Text>
        ) : (
          <Column as="ul" gap="2">
            {attending.map((g) => (
              <Row as="li" key={g.id} fillWidth>
                <GuestChip guest={g} />
              </Row>
            ))}
          </Column>
        )}
        {unconfirmed.length > 0 ? (
          <Column gap="4" paddingTop="8" borderTop>
            <Text textVariant="label-default-xs" onBackground="neutral-weak">
              Not confirmed yet ({unconfirmed.length})
            </Text>
            <Column as="ul" gap="2">
              {unconfirmed.map((g) => (
                <Row as="li" key={g.id} fillWidth>
                  <GuestChip guest={g} />
                </Row>
              ))}
            </Column>
          </Column>
        ) : null}
      </Panel>
    </div>
  );
}
