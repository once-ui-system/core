"use client";

import { Column, Icon, Row, Text } from "@once-ui-system/core";
import { useState } from "react";
import { event, fixtures, tables, type Fixture, type SeatTable } from "@/lib/data";
import {
  guestById,
  initials,
  LONG_TABLE_DEPTH,
  LONG_TABLE_LENGTH,
  ROUND_TABLE_DIAMETER,
  SEAT_DIAMETER,
  seatPoints,
  tableCenter,
} from "@/lib/plan";
import { usePlan } from "./PlanProvider";

const W = event.room_m.width;
const D = event.room_m.depth;
const pctX = (m: number) => `${(m / W) * 100}%`;
const pctY = (m: number) => `${(m / D) * 100}%`;

const fixtureStyle: Record<
  Fixture["kind"],
  { background: "accent-alpha-medium" | "brand-alpha-weak" | "neutral-alpha-medium" | "warning-alpha-medium"; dashed: boolean }
> = {
  stage: { background: "accent-alpha-medium", dashed: false },
  dancefloor: { background: "brand-alpha-weak", dashed: true },
  bar: { background: "neutral-alpha-medium", dashed: false },
  door: { background: "warning-alpha-medium", dashed: false },
};

function FixtureBlock({ f }: { f: Fixture }) {
  const s = fixtureStyle[f.kind];
  const vertical = f.kind === "door";
  return (
    <Row
      center
      position="absolute"
      radius={f.kind === "dancefloor" ? "l" : "s"}
      background={s.background}
      border={f.kind === "door" ? "warning-strong" : "neutral-alpha-medium"}
      borderStyle={s.dashed ? "dashed" : "solid"}
      aria-label={f.label}
      style={{
        left: pctX(f.x),
        top: pctY(f.y),
        width: pctX(f.w),
        height: pctY(f.h),
        containerType: "size",
      }}
    >
      <Text
        textVariant="label-strong-xs"
        onBackground="neutral-strong"
        align="center"
        style={{
          fontSize: "clamp(8px, 1.2cqw, 13px)",
          writingMode: vertical ? "vertical-rl" : undefined,
          whiteSpace: "nowrap",
        }}
      >
        {f.label}
      </Text>
    </Row>
  );
}

function SeatButton({
  table,
  index,
  x,
  y,
}: {
  table: SeatTable;
  index: number;
  x: number;
  y: number;
}) {
  const plan = usePlan();
  const [over, setOver] = useState(false);
  const guestId = plan.seats[table.id][index];
  const guest = guestId ? guestById.get(guestId) : undefined;
  const picked = guestId !== null && plan.selectedGuestId === guestId;
  const broken = guestId !== null && plan.brokenGuests.has(guestId);
  const tentative = guest ? guest.rsvp !== "yes" : false;
  const placing = plan.selectedGuestId !== null || plan.draggingId !== null;

  const label = guest
    ? `${initials(guest.name)} ${guest.name} at ${table.name}, seat ${index + 1}${guest.diet ? `, ${guest.diet}` : ""}${broken ? ", breaks a rule" : ""}. ${
        plan.selectedGuestId ? "Swap into this seat." : "Select this guest."
      }`
    : `${index + 1} empty seat at ${table.name}.${plan.selectedGuestId ? " Seat the selected guest here." : ""}`;

  return (
    <Row
      as="button"
      type="button"
      center
      position="absolute"
      radius="full"
      cursor="interactive"
      background={over ? "brand-alpha-strong" : guest ? (picked ? "brand-medium" : "brand-alpha-medium") : placing ? "brand-alpha-weak" : "transparent"}
      border={broken ? "danger-strong" : picked ? "brand-strong" : guest ? "brand-alpha-strong" : "neutral-alpha-strong"}
      borderStyle={guest && !tentative ? "solid" : "dashed"}
      borderWidth={picked || broken || over ? 2 : 1}
      draggable={guest !== undefined}
      aria-label={label}
      aria-pressed={guest ? picked : undefined}
      title={guest ? `${guest.name}${guest.diet ? ` (${guest.diet})` : ""}` : `${table.name}, seat ${index + 1} (empty)`}
      onClick={() => plan.activateSeat(table.id, index)}
      onDragStart={(e) => {
        if (!guestId) return;
        e.dataTransfer.setData("text/plain", guestId);
        e.dataTransfer.effectAllowed = "move";
        plan.setDragging(guestId);
      }}
      onDragEnd={() => plan.setDragging(null)}
      onDragOver={(e) => {
        if (plan.draggingId) {
          e.preventDefault();
          setOver(true);
        }
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setOver(false);
        const id = plan.draggingId ?? e.dataTransfer.getData("text/plain");
        plan.setDragging(null);
        if (id) plan.seatGuest(id, table.id, index);
      }}
      style={{
        left: pctX(x),
        top: pctY(y),
        width: pctX(SEAT_DIAMETER),
        aspectRatio: "1",
        transform: "translate(-50%, -50%)",
        padding: 0,
        fontSize: "clamp(8px, 1.15cqw, 13px)",
      }}
    >
      {guest ? (
        <Text textVariant="label-strong-xs" aria-hidden="true" style={{ fontSize: "inherit", lineHeight: 1 }}>
          {initials(guest.name)}
        </Text>
      ) : (
        <Text textVariant="label-default-xs" onBackground="neutral-weak" aria-hidden="true" style={{ fontSize: "inherit", lineHeight: 1 }}>
          {index + 1}
        </Text>
      )}
      {guest?.diet ? (
        <Row
          position="absolute"
          radius="full"
          background="warning-strong"
          aria-hidden="true"
          style={{ top: "-1px", right: "-1px", width: "28%", aspectRatio: "1" }}
        />
      ) : null}
    </Row>
  );
}

function TableBody({ table }: { table: SeatTable }) {
  const plan = usePlan();
  const [over, setOver] = useState(false);
  const { filled, capacity } = plan.occupancy(table.id);
  const selected = plan.selectedTableId === table.id;
  const broken = plan.brokenTables.has(table.id);
  const c = tableCenter(table);
  const long = table.shape === "long";
  const width = long ? LONG_TABLE_LENGTH : ROUND_TABLE_DIAMETER;
  const height = long ? LONG_TABLE_DEPTH : ROUND_TABLE_DIAMETER;

  return (
    <Column
      as="button"
      type="button"
      center
      position="absolute"
      radius={long ? "m" : "full"}
      cursor="interactive"
      background={over ? "brand-alpha-medium" : "surface"}
      border={broken ? "danger-strong" : selected ? "brand-strong" : "neutral-alpha-strong"}
      borderWidth={broken || selected || over ? 2 : 1}
      shadow={selected ? "m" : "xs"}
      aria-label={`${table.name} ${filled}/${capacity} seats filled${broken ? ", a rule is broken here" : ""}. ${
        plan.selectedGuestId ? "Seat the selected guest at this table." : "Show guests."
      }`}
      aria-pressed={selected}
      onClick={() => plan.activateTable(table.id)}
      onDragOver={(e) => {
        if (plan.draggingId) {
          e.preventDefault();
          setOver(true);
        }
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = plan.draggingId ?? e.dataTransfer.getData("text/plain");
        plan.setDragging(null);
        if (id) plan.seatGuest(id, table.id);
      }}
      style={{
        left: pctX(c.x),
        top: pctY(c.y),
        width: pctX(width),
        height: long ? pctY(height) : undefined,
        aspectRatio: long ? undefined : "1",
        transform: `translate(-50%, -50%) rotate(${table.rotation ?? 0}deg)`,
        padding: 0,
        fontSize: "clamp(8px, 1.25cqw, 14px)",
      }}
    >
      <Row gap="4" vertical="center" horizontal="center" wrap={false} aria-hidden="true" style={{ flexDirection: long ? "row" : "column", gap: long ? "0.6em" : "0.1em" }}>
        <Text textVariant="label-strong-s" style={{ fontSize: "inherit", lineHeight: 1.1 }}>
          {table.name}
        </Text>
        <Text textVariant="label-default-xs" onBackground="neutral-weak" style={{ fontSize: "0.9em", lineHeight: 1.1 }}>
          {filled}/{capacity}
        </Text>
      </Row>
      {broken ? (
        <Row
          center
          position="absolute"
          radius="full"
          background="danger-strong"
          aria-hidden="true"
          style={{ top: long ? "-35%" : "2%", right: long ? "-1%" : "2%", width: "1.7em", height: "1.7em" }}
        >
          <Icon name="warning" size="xs" onSolid="danger-strong" decorative />
        </Row>
      ) : null}
    </Column>
  );
}

export function RoomPlan() {
  return (
    <Column
      fillWidth
      radius="l"
      border
      background="surface"
      overflowX="auto"
      scrollbar="minimal"
      aria-label="Room plan"
      role="region"
      tabIndex={0}
    >
      <Column fillWidth minWidth="780px" padding="12" gap="8">
        <Row fillWidth horizontal="between" vertical="center" gap="8" wrap>
          <Text textVariant="label-strong-s">
            {event.venue}
          </Text>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            Drawn to scale: {W} × {D} m, grid lines every metre
          </Text>
        </Row>
        <Column
          fillWidth
          radius="m"
          border
          background="page"
          position="relative"
          style={{
            aspectRatio: `${W} / ${D}`,
            containerType: "inline-size",
            backgroundImage:
              "linear-gradient(var(--neutral-alpha-weak) 1px, transparent 1px), linear-gradient(90deg, var(--neutral-alpha-weak) 1px, transparent 1px)",
            backgroundSize: `${100 / W}% ${100 / D}%`,
          }}
        >
          {fixtures.map((f) => (
            <FixtureBlock key={f.id} f={f} />
          ))}
          {tables.map((t) => (
            <TableBody key={t.id} table={t} />
          ))}
          {tables.map((t) =>
            seatPoints(t).map((p, i) => <SeatButton key={`${t.id}-${i}`} table={t} index={i} x={p.x} y={p.y} />),
          )}
        </Column>
        <Row gap="16" wrap vertical="center">
          <Legend swatch="filled">Seated</Legend>
          <Legend swatch="empty">Empty seat</Legend>
          <Legend swatch="tentative">Maybe or awaiting reply</Legend>
          <Legend swatch="diet">Dietary need</Legend>
          <Legend swatch="broken">Rule broken</Legend>
        </Row>
      </Column>
    </Column>
  );
}

function Legend({ swatch, children }: { swatch: "filled" | "empty" | "tentative" | "diet" | "broken"; children: string }) {
  return (
    <Row gap="8" vertical="center">
      <Row
        width="16"
        height="16"
        radius="full"
        background={swatch === "filled" ? "brand-alpha-medium" : swatch === "diet" ? "warning-strong" : "transparent"}
        border={swatch === "broken" ? "danger-strong" : swatch === "diet" ? "warning-strong" : swatch === "filled" ? "brand-alpha-strong" : "neutral-alpha-strong"}
        borderStyle={swatch === "empty" || swatch === "tentative" ? "dashed" : "solid"}
        borderWidth={swatch === "broken" ? 2 : 1}
        aria-hidden="true"
      />
      <Text textVariant="body-default-xs" onBackground="neutral-weak">
        {children}
      </Text>
    </Row>
  );
}
