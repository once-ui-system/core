"use client";

import { Column, Icon, Row, Text } from "@once-ui-system/core";
import { useState } from "react";
import { event, fixtures, guests, initials, tables } from "@/lib/data";
import { SEAT_SIZE, tableGeometry } from "@/lib/geometry";
import { usePlan } from "@/lib/plan";

const W = event.room_m.width;
const D = event.room_m.depth;
const guestById = new Map(guests.map((g) => [g.id, g]));

const px = (m: number) => `${(m / W) * 100}%`;
const py = (m: number) => `${(m / D) * 100}%`;

export const GUEST_DRAG_TYPE = "text/plain";

export function RoomPlan() {
  const { occupants, held, hold, selectTable, selectedTable, place, brokenTables, countAt } = usePlan();
  const [over, setOver] = useState<string | null>(null);

  const readDrop = (e: React.DragEvent): string | null => {
    const id = e.dataTransfer.getData(GUEST_DRAG_TYPE);
    return guestById.has(id) ? id : null;
  };

  return (
    <Column
      background="surface"
      border
      radius="l"
      overflowX="auto"
      padding="12"
      gap="8"
      aria-label={`Floor plan of ${event.venue}, ${W} by ${D} metres`}
      role="region"
      tabIndex={0}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          minWidth: "860px",
          aspectRatio: `${W} / ${D}`,
          containerType: "inline-size",
        }}
      >
        <Column
          position="absolute"
          top="0"
          left="0"
          fill
          background="neutral-alpha-weak"
          border
          radius="m"
          pointerEvents="none"
        />

        {fixtures.map((f) => {
          const tone =
            f.kind === "dancefloor"
              ? "brand-alpha-weak"
              : f.kind === "stage"
                ? "neutral-alpha-strong"
                : f.kind === "bar"
                  ? "accent-alpha-medium"
                  : "info-alpha-strong";
          const vertical = f.kind === "door";
          return (
            <Row
              key={f.id}
              position="absolute"
              center
              background={tone}
              radius={f.kind === "dancefloor" ? "m" : "s"}
              border={f.kind === "dancefloor"}
              borderStyle="dashed"
              pointerEvents="none"
              style={{ left: px(f.x), top: py(f.y), width: px(f.w), height: py(f.h) }}
            >
              <Text
                textVariant="label-default-s"
                onBackground="neutral-medium"
                style={{
                  fontSize: "1.25cqw",
                  writingMode: vertical ? "vertical-rl" : undefined,
                  whiteSpace: "nowrap",
                  transform: vertical ? "rotate(180deg)" : undefined,
                }}
              >
                {vertical ? "" : f.label}
              </Text>
            </Row>
          );
        })}
        {/* door label sits outside the thin strip so it stays readable */}
        <Text
          textVariant="label-default-xs"
          onBackground="info-strong"
          style={{
            position: "absolute",
            left: px(0.7),
            top: py(6.3),
            fontSize: "1.1cqw",
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            pointerEvents: "none",
          }}
        >
          Garden doors
        </Text>

        {tables.map((t) => {
          const g = tableGeometry(t);
          const slots = occupants(t.id);
          const broken = brokenTables.has(t.id);
          const selected = selectedTable === t.id;
          const used = countAt(t.id);
          const topKey = `${t.id}:top`;
          return (
            <div key={t.id}>
              <Row
                as="button"
                type="button"
                position="absolute"
                center
                background={selected ? "brand-alpha-weak" : "neutral-alpha-medium"}
                border={broken ? "danger-strong" : selected ? "brand-strong" : true}
                borderWidth={broken || selected ? 2 : 1}
                radius={t.shape === "round" ? "full" : "m"}
                cursor="interactive"
                aria-pressed={selected}
                aria-label={`${t.name} ${used}/${t.seats}, ${used} of ${t.seats} seats filled${broken ? ", a seating rule is broken here" : ""}`}
                onClick={() => (held ? place(held, t.id) : selectTable(t.id))}
                onDragOver={(e: React.DragEvent) => {
                  e.preventDefault();
                  setOver(topKey);
                }}
                onDragLeave={() => setOver(null)}
                onDrop={(e: React.DragEvent) => {
                  e.preventDefault();
                  setOver(null);
                  const id = readDrop(e);
                  if (id) place(id, t.id);
                }}
                style={{
                  left: px(g.x + g.top.x),
                  top: py(g.y + g.top.y),
                  width: px(g.top.w),
                  height: py(g.top.h),
                  flexDirection: "column",
                  outline: over === topKey ? "3px solid var(--brand-solid-strong)" : undefined,
                  padding: 0,
                }}
              >
                <Text
                  textVariant="label-strong-s"
                  style={{ fontSize: "1.3cqw", lineHeight: 1.1, textAlign: "center" }}
                >
                  {broken ? "⚠ " : ""}{t.name}
                </Text>
                <Text
                  textVariant="body-default-xs"
                  onBackground="neutral-weak"
                  style={{ fontSize: "1.1cqw", lineHeight: 1.1 }}
                >
                  {used}/{t.seats}
                </Text>
              </Row>

              {g.seats.map((s) => {
                const gid = slots[s.index];
                const guest = gid ? guestById.get(gid) : undefined;
                const key = `${t.id}:${s.index}`;
                const isHeld = gid !== null && gid === held;
                return (
                  <Row
                    key={key}
                    as="button"
                    type="button"
                    position="absolute"
                    center
                    radius="full"
                    background={guest ? "brand-alpha-strong" : "transparent"}
                    border={isHeld ? "brand-strong" : guest ? "brand-medium" : true}
                    borderStyle={guest ? "solid" : "dashed"}
                    borderWidth={isHeld ? 4 : 1}
                    cursor="interactive"
                    draggable={Boolean(guest)}
                    aria-label={
                      guest
                        ? `${initials(guest.name)}, ${t.name} seat ${s.index + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}${isHeld ? ", picked up" : ""}`
                        : `${t.name}, seat ${s.index + 1}: empty`
                    }
                    title={guest ? `${guest.name}${guest.diet ? ` (${guest.diet})` : ""}` : "Empty seat"}
                    onClick={() => {
                      if (held) {
                        if (gid === held) hold(null);
                        else place(held, t.id, s.index);
                      } else if (gid) {
                        selectTable(t.id);
                        hold(gid);
                      } else selectTable(t.id);
                    }}
                    onDragStart={(e: React.DragEvent) => {
                      if (!gid) return;
                      e.dataTransfer.setData(GUEST_DRAG_TYPE, gid);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(e: React.DragEvent) => {
                      e.preventDefault();
                      setOver(key);
                    }}
                    onDragLeave={() => setOver(null)}
                    onDrop={(e: React.DragEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOver(null);
                      const id = readDrop(e);
                      if (id) place(id, t.id, s.index);
                    }}
                    style={{
                      left: px(g.x + s.cx - SEAT_SIZE / 2),
                      top: py(g.y + s.cy - SEAT_SIZE / 2),
                      width: px(SEAT_SIZE),
                      aspectRatio: "1",
                      padding: 0,
                      outline: over === key ? "3px solid var(--brand-solid-strong)" : undefined,
                    }}
                  >
                    {guest ? (
                      <Text
                        textVariant="label-strong-xs"
                        style={{ fontSize: "1.2cqw", lineHeight: 1 }}
                      >
                        {initials(guest.name)}
                      </Text>
                    ) : null}
                    {guest?.diet ? (
                      <span
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          right: "-2px",
                          top: "-2px",
                          width: "34%",
                          aspectRatio: "1",
                          borderRadius: "50%",
                          background: "var(--warning-solid-strong)",
                          border: "1.5px solid var(--page-background)",
                        }}
                      />
                    ) : null}
                  </Row>
                );
              })}
            </div>
          );
        })}
      </div>

      <Row gap="16" paddingX="4" wrap vertical="center" textVariant="body-default-xs" onBackground="neutral-weak">
        <Row gap="8" vertical="center">
          <Row
            width="16"
            height="16"
            radius="full"
            background="brand-alpha-strong"
            border="brand-medium"
            aria-hidden="true"
          />
          Seated guest
        </Row>
        <Row gap="8" vertical="center">
          <Row width="16" height="16" radius="full" border borderStyle="dashed" aria-hidden="true" />
          Empty seat
        </Row>
        <Row gap="8" vertical="center">
          <Row width="12" height="12" radius="full" solid="warning-strong" aria-hidden="true" />
          Dietary need
        </Row>
        <Row gap="8" vertical="center">
          <Icon name="warning" size="xs" onBackground="danger-strong" />
          Rule broken
        </Row>
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          Drag a guest to a seat, or tap a guest and then a seat. The room is {W} by {D} m.
        </Text>
      </Row>
    </Column>
  );
}
