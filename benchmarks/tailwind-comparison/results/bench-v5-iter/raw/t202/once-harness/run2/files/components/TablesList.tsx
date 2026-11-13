"use client";

import { Column, Grid, Icon, Row, Tag, Text } from "@once-ui-system/core";
import { tables, type SeatTable } from "@/lib/data";
import { guestById } from "@/lib/plan";
import { usePlan } from "./PlanProvider";

function SeatRow({ table, index }: { table: SeatTable; index: number }) {
  const plan = usePlan();
  const guestId = plan.seats[table.id][index];
  const guest = guestId ? guestById.get(guestId) : undefined;
  const picked = guestId !== null && plan.selectedGuestId === guestId;
  const broken = guestId !== null && plan.brokenGuests.has(guestId);
  return (
    <Row
      as="button"
      type="button"
      fillWidth
      gap="12"
      vertical="center"
      paddingX="12"
      paddingY="8"
      radius="m"
      cursor="interactive"
      background={picked ? "brand-alpha-medium" : "transparent"}
      border={broken ? "danger-strong" : picked ? "brand-strong" : "transparent"}
      borderStyle={guest ? "solid" : "dashed"}
      draggable={guest !== undefined}
      aria-pressed={guest ? picked : undefined}
      aria-label={guest ? `${table.name}, seat ${index + 1}: ${guest.name}` : `${table.name}, seat ${index + 1}: empty`}
      onClick={() => plan.activateSeat(table.id, index)}
      onDragStart={(e) => {
        if (!guestId) return;
        e.dataTransfer.setData("text/plain", guestId);
        plan.setDragging(guestId);
      }}
      onDragEnd={() => plan.setDragging(null)}
      onDragOver={(e) => {
        if (plan.draggingId) e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = plan.draggingId ?? e.dataTransfer.getData("text/plain");
        plan.setDragging(null);
        if (id) plan.seatGuest(id, table.id, index);
      }}
    >
      <Text textVariant="label-default-xs" onBackground="neutral-weak" style={{ width: "1.5rem" }}>
        {index + 1}
      </Text>
      {guest ? (
        <Row fillWidth horizontal="between" vertical="center" gap="8" wrap>
          <Text textVariant="label-strong-s">{guest.name}</Text>
          {guest.diet ? (
            <Tag size="s" tone="warning" label={guest.diet} />
          ) : null}
        </Row>
      ) : (
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          {plan.selectedGuestId ? "Empty seat: tap to seat the selected guest" : "Empty seat"}
        </Text>
      )}
    </Row>
  );
}

function TableCard({ table }: { table: SeatTable }) {
  const plan = usePlan();
  const { filled, capacity } = plan.occupancy(table.id);
  const broken = plan.brokenTables.has(table.id);
  const selected = plan.selectedTableId === table.id;
  return (
    <Column
      background="surface"
      border={broken ? "danger-strong" : selected ? "brand-strong" : true}
      radius="l"
      padding="8"
      gap="4"
      onDragOver={(e) => {
        if (plan.draggingId) e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        const id = plan.draggingId ?? e.dataTransfer.getData("text/plain");
        plan.setDragging(null);
        if (id) plan.seatGuest(id, table.id);
      }}
    >
      <Row
        as="button"
        type="button"
        fillWidth
        horizontal="between"
        vertical="center"
        paddingX="12"
        paddingY="8"
        cursor="interactive"
        aria-label={`${table.name}, ${filled} of ${capacity} seats filled`}
        onClick={() => plan.activateTable(table.id)}
      >
        <Row gap="8" vertical="center">
          <Text textVariant="heading-strong-s">{table.name}</Text>
          {broken ? <Icon name="warning" size="s" onBackground="danger-strong" decorative={false} tooltip="A rule is broken here" /> : null}
        </Row>
        <Tag size="s" tone={filled === capacity ? "success" : "neutral"} label={`${filled} of ${capacity} seated`} />
      </Row>
      {Array.from({ length: capacity }, (_, i) => (
        <SeatRow key={i} table={table} index={i} />
      ))}
    </Column>
  );
}

export function TablesList() {
  return (
    <Grid fillWidth columns="2" gap="16" s={{ columns: "1" }}>
      {tables.map((t) => (
        <TableCard key={t.id} table={t} />
      ))}
    </Grid>
  );
}
