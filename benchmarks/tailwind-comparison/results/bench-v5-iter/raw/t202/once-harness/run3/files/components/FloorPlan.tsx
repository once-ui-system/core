"use client";

import { Column, Row, Text, VisuallyHidden } from "@once-ui-system/core";
import { useState, type CSSProperties } from "react";
import { EVENT, FIXTURES, GUESTS, TABLES, initials, type Fixture } from "@/lib/data";
import { SEAT_D, tableGeo } from "@/lib/plan";
import { usePlan } from "@/lib/PlanContext";

const W = EVENT.room_m.width;
const D = EVENT.room_m.depth;
const GUEST_BY_ID = Object.fromEntries(GUESTS.map((x) => [x.id, x]));

const px = (m: number) => `${(m / W) * 100}%`;
const py = (m: number) => `${(m / D) * 100}%`;
const cq = (n: number): CSSProperties => ({ fontSize: `${n}cqw` });

function fixtureLook(kind: Fixture["kind"]) {
  switch (kind) {
    case "stage":
      return { background: "accent-alpha-medium", border: "accent-alpha-strong" } as const;
    case "dancefloor":
      return { background: "brand-alpha-weak", border: "brand-alpha-medium" } as const;
    case "bar":
      return { background: "warning-alpha-weak", border: "warning-alpha-medium" } as const;
    default:
      return { background: "success-alpha-medium", border: "success-alpha-strong" } as const;
  }
}

export function FloorPlan() {
  const { seatMap, armed, setArmed, selectedTable, selectTable, place, brokenTables, brokenGuests } =
    usePlan();
  const [over, setOver] = useState<string | null>(null);

  const onSeatClick = (tableId: string, index: number) => {
    const occupant = seatMap[tableId][index];
    if (armed) {
      if (occupant === armed) {
        setArmed(null);
        return;
      }
      place(armed, tableId, index);
      return;
    }
    selectTable(tableId);
    if (occupant) setArmed(occupant);
  };

  const onTableClick = (tableId: string) => {
    selectTable(tableId);
    if (armed) place(armed, tableId);
  };

  const dropOn = (guestId: string, tableId: string, index?: number) => {
    setOver(null);
    if (guestId && GUEST_BY_ID[guestId]) place(guestId, tableId, index);
  };

  return (
    <Row fillWidth overflowX="auto" radius="l" border background="surface" padding="8">
      <Column
        fillWidth
        position="relative"
        radius="m"
        overflow="hidden"
        background="neutral-alpha-weak"
        style={{
          aspectRatio: `${W} / ${D}`,
          minWidth: "40rem",
          containerType: "inline-size",
          backgroundImage:
            "linear-gradient(to right, var(--neutral-alpha-weak) 1px, transparent 1px), linear-gradient(to bottom, var(--neutral-alpha-weak) 1px, transparent 1px)",
          backgroundSize: `${100 / W}% ${100 / D}%`,
        }}
        role="group"
        aria-label={`Floor plan of ${EVENT.venue}, ${W} by ${D} metres`}
      >
        {FIXTURES.map((f) => {
          const look = fixtureLook(f.kind);
          return (
            <Column
              key={f.id}
              position="absolute"
              center
              background={look.background}
              border={look.border}
              borderStyle={f.kind === "dancefloor" ? "dashed" : "solid"}
              radius={f.kind === "door" ? "none" : "s"}
              pointerEvents="none"
              style={{ left: px(f.x), top: py(f.y), width: px(f.w), height: py(f.h) }}
            >
              <Text
                textVariant="label-strong-s"
                onBackground="neutral-medium"
                style={{
                  ...cq(f.kind === "door" ? 1.05 : 1.4),
                  writingMode: f.kind === "door" ? "vertical-rl" : undefined,
                  letterSpacing: "0.02em",
                }}
              >
                {f.label}
              </Text>
            </Column>
          );
        })}

        {TABLES.map((t) => {
          const geo = tableGeo(t);
          const occupants = seatMap[t.id];
          const filled = occupants.filter(Boolean).length;
          const broken = brokenTables.has(t.id);
          const selected = selectedTable === t.id;
          const dropKey = `${t.id}:body`;
          return (
            <Column key={t.id} position="absolute" top="0" left="0" fill pointerEvents="none">
              <Column
                as="button"
                type="button"
                position="absolute"
                center
                gap="2"
                radius={t.shape === "round" ? "full" : "m"}
                background={broken ? "danger-alpha-weak" : "surface"}
                border={broken ? "danger-strong" : selected ? "brand-strong" : "neutral-alpha-strong"}
                borderWidth={selected || broken ? 2 : 1}
                pointerEvents="auto"
                cursor="interactive"
                aria-pressed={selected}
                onClick={() => onTableClick(t.id)}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setOver(dropKey)}
                onDragLeave={() => setOver((o) => (o === dropKey ? null : o))}
                onDrop={(e) => {
                  e.preventDefault();
                  dropOn(e.dataTransfer.getData("text/plain"), t.id);
                }}
                style={{
                  left: px(geo.left),
                  top: py(geo.top),
                  width: px(geo.w),
                  height: py(geo.h),
                  outline: over === dropKey ? "3px solid var(--brand-solid-strong)" : undefined,
                  outlineOffset: 2,
                }}
              >
                <Text textVariant="label-strong-s" style={cq(1.35)}>
                  {t.name}
                </Text>
                <VisuallyHidden>{`, ${filled} of ${t.seats} seats filled${broken ? ", a rule is broken" : ""}`}</VisuallyHidden>
                <Text
                  textVariant="label-default-s"
                  onBackground={filled === t.seats ? "success-strong" : "neutral-weak"}
                  aria-hidden="true"
                  style={cq(1.2)}
                >
                  {filled}/{t.seats}
                </Text>
              </Column>

              {geo.seats.map((s, i) => {
                const gid = occupants[i];
                const guest = gid ? GUEST_BY_ID[gid] : null;
                const isArmed = gid !== null && gid === armed;
                const flagged = gid !== null && brokenGuests.has(gid);
                const key = `${t.id}:${i}`;
                const label = guest
                  ? `Seat ${i + 1} at ${t.name}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}`
                  : `Seat ${i + 1} at ${t.name}: empty`;
                return (
                  <Row
                    as="button"
                    type="button"
                    key={key}
                    position="absolute"
                    center
                    radius="full"
                    pointerEvents="auto"
                    cursor="interactive"
                    draggable={guest !== null}
                    title={label}
                    background={
                      isArmed ? "brand-medium" : guest ? "brand-alpha-medium" : "transparent"
                    }
                    border={
                      flagged
                        ? "danger-strong"
                        : isArmed
                          ? "brand-strong"
                          : guest
                            ? "brand-alpha-strong"
                            : "neutral-alpha-strong"
                    }
                    borderStyle={guest ? "solid" : "dashed"}
                    borderWidth={flagged || isArmed ? 2 : 1}
                    onClick={() => onSeatClick(t.id, i)}
                    onDragStart={(e) => {
                      if (!gid) return;
                      e.dataTransfer.setData("text/plain", gid);
                      e.dataTransfer.effectAllowed = "move";
                      setArmed(null);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={() => setOver(key)}
                    onDragLeave={() => setOver((o) => (o === key ? null : o))}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      dropOn(e.dataTransfer.getData("text/plain"), t.id, i);
                    }}
                    style={{
                      left: px(s.x - SEAT_D / 2),
                      top: py(s.y - SEAT_D / 2),
                      width: px(SEAT_D),
                      aspectRatio: "1 / 1",
                      outline: over === key ? "3px solid var(--brand-solid-strong)" : undefined,
                      outlineOffset: 1,
                    }}
                  >
                    <VisuallyHidden>{label}</VisuallyHidden>
                    {guest ? (
                      <Text textVariant="label-strong-s" aria-hidden="true" style={cq(1.15)}>
                        {initials(guest.name)}
                      </Text>
                    ) : null}
                    {guest?.diet ? (
                      <Row
                        position="absolute"
                        radius="full"
                        background="warning-strong"
                        pointerEvents="none"
                        style={{ right: "-6%", top: "-6%", width: "34%", aspectRatio: "1 / 1" }}
                        aria-hidden="true"
                      />
                    ) : null}
                  </Row>
                );
              })}
            </Column>
          );
        })}
      </Column>
    </Row>
  );
}
