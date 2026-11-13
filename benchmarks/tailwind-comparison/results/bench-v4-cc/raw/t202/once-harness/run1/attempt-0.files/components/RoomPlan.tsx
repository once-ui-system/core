"use client";

import { useState } from "react";
import { Column, Icon, Row, Text } from "@once-ui-system/core";
import { FIXTURES, GUEST_BY_ID, PARTIES, TABLES, type SeatTable } from "@/lib/data";
import {
  pctX,
  pctY,
  ROOM_D,
  ROOM_W,
  SEAT_D,
  seatPoints,
  tableBody,
} from "@/lib/geometry";
import { tableCount } from "@/lib/seating";
import { dotBg, initials, seatBg, toneOf } from "@/lib/theme";
import { usePlan } from "./PlanProvider";

const FIXTURE_BG = {
  stage: "accent-alpha-medium",
  dancefloor: "neutral-alpha-weak",
  bar: "warning-alpha-medium",
  door: "success-alpha-medium",
} as const;

const CSS = `
.sw-hit{cursor:pointer;padding:0;font:inherit;color:inherit}
.sw-hit:focus-visible{outline:2px solid Highlight;outline-offset:2px}
.sw-hit[draggable="true"]{cursor:grab}
`;

export function RoomPlan() {
  const {
    seating,
    results,
    heldId,
    selectedTable,
    dragId,
    selectTable,
    hold,
    place,
    setDragId,
  } = usePlan();
  const [over, setOver] = useState<string | null>(null);

  const brokenTables = new Set<string>();
  const flaggedGuests = new Set<string>();
  for (const r of results) {
    if (r.status !== "broken") continue;
    r.tableIds.forEach((id) => brokenTables.add(id));
    r.guestIds.forEach((id) => flaggedGuests.add(id));
  }
  const active = heldId !== null || dragId !== null;

  const onSeat = (table: SeatTable, index: number) => {
    const occupant = seating[table.id][index];
    if (heldId) {
      if (occupant === heldId) hold(null);
      else place(heldId, table.id, index);
      return;
    }
    selectTable(table.id);
    if (occupant) hold(occupant);
  };

  const onTable = (table: SeatTable) => {
    if (heldId) place(heldId, table.id);
    else selectTable(table.id);
  };

  const dropProps = (key: string, onDrop: () => void) => ({
    onDragOver: (e: React.DragEvent) => {
      if (!dragId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (over !== key) setOver(key);
    },
    onDragLeave: () => {
      if (over === key) setOver(null);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setOver(null);
      if (dragId) onDrop();
      setDragId(null);
    },
  });

  return (
    <Column background="surface" border radius="l" fillWidth overflow="hidden">
      <style>{CSS}</style>
      <Row padding="12" gap="16" wrap vertical="center" borderBottom>
        <Text textVariant="label-strong-s">The Orangery, to scale</Text>
        <Row gap="12" wrap flex={1}>
          {PARTIES.map((party) => (
            <Row key={party} gap="4" vertical="center">
              <Row width={10} height={10} radius="full" background={dotBg(toneOf(party))} />
              <Text textVariant="body-default-xs" onBackground="neutral-weak">
                {party}
              </Text>
            </Row>
          ))}
        </Row>
      </Row>
      <div
        role="region"
        aria-label="Room plan. It scrolls sideways on narrow screens."
        tabIndex={0}
        style={{ overflowX: "auto", padding: 12 }}
      >
        <div
          style={{
            position: "relative",
            minWidth: 820,
            aspectRatio: `${ROOM_W} / ${ROOM_D}`,
          }}
        >
          <Row
            position="absolute"
            top="0"
            left="0"
            fill
            pointerEvents="none"
            radius="m"
            border
            background="neutral-alpha-weak"
          />

          {FIXTURES.map((f) => (
            <Row
              key={f.id}
              position="absolute"
              center
              radius={f.kind === "dancefloor" ? "s" : "xs"}
              background={FIXTURE_BG[f.kind]}
              border={f.kind === "dancefloor"}
              borderStyle="dashed"
              pointerEvents="none"
              style={{ left: pctX(f.x), top: pctY(f.y), width: pctX(f.w), height: pctY(f.h) }}
            >
              <Text
                textVariant="label-default-xs"
                onBackground="neutral-medium"
                style={f.kind === "door" ? { writingMode: "vertical-rl" } : undefined}
              >
                {f.label}
              </Text>
            </Row>
          ))}

          {TABLES.map((table) => {
            const body = tableBody(table);
            const count = tableCount(seating, table.id);
            const broken = brokenTables.has(table.id);
            const selected = selectedTable === table.id;
            const full = count >= table.seats;
            const key = `table:${table.id}`;
            const isOver = over === key;
            const label = `${table.name}, ${count} of ${table.seats} seats filled${
              broken ? ", a seating rule is broken" : ""
            }${selected ? ", selected" : ""}`;
            return (
              <Row
                key={table.id}
                as="button"
                type="button"
                className="sw-hit"
                aria-label={label}
                aria-pressed={selected}
                title={label}
                onClick={() => onTable(table)}
                {...dropProps(key, () => place(dragId as string, table.id))}
                center
                position="absolute"
                radius={table.shape === "round" ? "full" : "m"}
                background={
                  isOver
                    ? "brand-alpha-medium"
                    : selected
                      ? "brand-alpha-weak"
                      : active && !full
                        ? "brand-alpha-weak"
                        : "surface"
                }
                border={broken ? "danger-strong" : selected ? "brand-strong" : true}
                borderWidth={broken || selected ? 2 : 1}
                style={{
                  left: pctX(body.cx - body.w / 2),
                  top: pctY(body.cy - body.h / 2),
                  width: pctX(body.w),
                  height: pctY(body.h),
                }}
              >
                {table.shape === "round" ? (
                  <Column center gap="0">
                    <Text textVariant="label-strong-xs">{table.name}</Text>
                    <Row gap="2" vertical="center">
                      {broken ? <Icon name="warning" size="xs" onBackground="danger-strong" /> : null}
                      <Text textVariant="label-default-xs" onBackground="neutral-weak">
                        {count}/{table.seats}
                      </Text>
                    </Row>
                  </Column>
                ) : (
                  <Row gap="8" vertical="center">
                    <Text textVariant="label-strong-xs">{table.name}</Text>
                    {broken ? <Icon name="warning" size="xs" onBackground="danger-strong" /> : null}
                    <Text textVariant="label-default-xs" onBackground="neutral-weak">
                      {count}/{table.seats}
                    </Text>
                  </Row>
                )}
              </Row>
            );
          })}

          {TABLES.map((table) =>
            seatPoints(table).map((pt, index) => {
              const guestId = seating[table.id][index];
              const guest = guestId ? GUEST_BY_ID[guestId] : null;
              const key = `seat:${table.id}:${index}`;
              const isOver = over === key;
              const held = guestId !== null && guestId === heldId;
              const flagged = guestId !== null && flaggedGuests.has(guestId);
              const label = `${table.name}, seat ${index + 1}: ${
                guest
                  ? `${guest.name}${guest.diet ? `, ${guest.diet}` : ""}${flagged ? ", rule broken" : ""}`
                  : "empty"
              }`;
              return (
                <Row
                  key={key}
                  as="button"
                  type="button"
                  className="sw-hit"
                  aria-label={label}
                  title={label}
                  draggable={guest !== null}
                  onClick={() => onSeat(table, index)}
                  onDragStart={(e: React.DragEvent) => {
                    if (!guestId) return;
                    e.dataTransfer.setData("text/plain", guestId);
                    e.dataTransfer.effectAllowed = "move";
                    setDragId(guestId);
                  }}
                  onDragEnd={() => {
                    setDragId(null);
                    setOver(null);
                  }}
                  {...dropProps(key, () => place(dragId as string, table.id, index))}
                  center
                  position="absolute"
                  radius="full"
                  background={
                    isOver
                      ? "brand-alpha-strong"
                      : guest
                        ? seatBg(toneOf(guest.party))
                        : active
                          ? "brand-alpha-weak"
                          : "transparent"
                  }
                  border={flagged ? "danger-strong" : held ? "brand-strong" : true}
                  borderWidth={flagged || held ? 2 : 1}
                  borderStyle={guest ? "solid" : "dashed"}
                  style={{
                    left: pctX(pt.x),
                    top: pctY(pt.y),
                    width: pctX(SEAT_D),
                    height: pctY(SEAT_D),
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {guest ? (
                    <Text textVariant="label-strong-xs">{initials(guest.name)}</Text>
                  ) : null}
                </Row>
              );
            }),
          )}
        </div>
      </div>
      <Row paddingX="12" paddingBottom="12" gap="8" vertical="center">
        <Icon name="info" size="xs" onBackground="neutral-weak" />
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          Room {ROOM_W} × {ROOM_D} m. Drag a guest to a seat or table, or tap a guest and then tap
          where they go. Dashed circles are empty seats.
        </Text>
      </Row>
    </Column>
  );
}
