"use client";

import { Box, Group, Text, Tooltip } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { IconAlertTriangle } from "@tabler/icons-react";
import { Fragment, useState, type CSSProperties, type DragEvent, type KeyboardEvent } from "react";
import {
  DIET_COLOR,
  EVENT,
  FIXTURES,
  GUESTS_BY_ID,
  PARTY_COLOR,
  PARTY_ORDER,
  TABLES,
  initials,
  type Table,
} from "@/lib/data";
import { cx } from "@/lib/cx";
import { usePlan } from "./PlanProvider";
import classes from "./room.module.css";

const MIN_ROOM_PX = 660;
const SEAT_D = 0.85; // metres
const LONG = { w: 5.6, h: 1.1 }; // metres

function tableRadius(t: Table): number {
  return t.seats <= 6 ? 0.85 : 1;
}

function rotate(p: { x: number; y: number }, deg: number): { x: number; y: number } {
  const a = (deg * Math.PI) / 180;
  return { x: p.x * Math.cos(a) - p.y * Math.sin(a), y: p.x * Math.sin(a) + p.y * Math.cos(a) };
}

/** Seat centres relative to the table centre, in metres, in seating order. */
function seatOffsets(t: Table): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  if (t.shape === "round") {
    const ring = tableRadius(t) + SEAT_D / 2 + 0.08;
    for (let i = 0; i < t.seats; i++) {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / t.seats;
      out.push({ x: Math.cos(a) * ring, y: Math.sin(a) * ring });
    }
  } else {
    const side = Math.ceil(t.seats / 2);
    const other = t.seats - side;
    const off = LONG.h / 2 + SEAT_D / 2 + 0.05;
    for (let j = 0; j < side; j++) out.push({ x: -LONG.w / 2 + (LONG.w / side) * (j + 0.5), y: -off });
    for (let j = 0; j < other; j++) out.push({ x: LONG.w / 2 - (LONG.w / other) * (j + 0.5), y: off });
  }
  return out.map((p) => rotate(p, t.rotation));
}

function flagOffset(t: Table): { x: number; y: number } {
  if (t.shape === "round") {
    const a = -Math.PI / 2 + Math.PI / t.seats;
    return { x: Math.cos(a) * tableRadius(t), y: Math.sin(a) * tableRadius(t) };
  }
  return rotate({ x: LONG.w / 2, y: -LONG.h / 2 }, t.rotation);
}

export function RoomPlan({ onTableChosen }: { onTableChosen: () => void }) {
  const plan = usePlan();
  const { ref, width } = useElementSize();
  const [over, setOver] = useState<string | null>(null);

  const roomPx = Math.max(width || 960, MIN_ROOM_PX);
  const ppm = roomPx / EVENT.room.width;
  const m = (v: number) => v * ppm;

  const armed = plan.armedGuestId;
  const active = armed ?? plan.dragId;
  const activeIsSeated = active ? Boolean(plan.locations[active]) : false;

  const seatClick = (t: Table, index: number, occupant: string | null) => {
    if (armed) {
      if (occupant === armed) {
        plan.arm(null);
        return;
      }
      const swap = occupant && plan.locations[armed];
      plan.seatGuest(armed, t.id, occupant && !swap ? undefined : index);
      plan.selectTable(t.id);
      return;
    }
    if (occupant) {
      plan.arm(occupant);
      plan.selectTable(t.id);
      return;
    }
    plan.selectTable(t.id);
    onTableChosen();
  };

  const tableClick = (t: Table) => {
    if (armed) {
      plan.seatGuest(armed, t.id);
      plan.selectTable(t.id);
      return;
    }
    plan.selectTable(t.id);
    onTableChosen();
  };

  const activate = (e: KeyboardEvent<HTMLElement>, fn: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  };

  const dropProps = (key: string, onDropGuest: (guestId: string) => void) => ({
    onDragOver: (e: DragEvent<HTMLElement>) => {
      if (!plan.dragId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (over !== key) setOver(key);
    },
    onDrop: (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const id = plan.dragId ?? e.dataTransfer.getData("text/plain");
      setOver(null);
      if (id) onDropGuest(id);
    },
  });

  const seatFont = Math.max(8.5, m(SEAT_D) * 0.36);

  return (
    <Box>
      <div ref={ref} className={classes.scroller} role="group" aria-label={`Room plan, ${EVENT.room.width} by ${EVENT.room.depth} metres`}>
        <div
          className={classes.room}
          style={{ width: roomPx, height: m(EVENT.room.depth), "--m": `${ppm}px` } as CSSProperties}
        >
          {FIXTURES.map((f) => (
            <div
              key={f.id}
              className={cx(classes.fixture, classes[f.kind])}
              style={{
                left: m(f.x),
                top: m(f.y),
                width: m(f.w),
                height: m(f.h),
                fontSize: f.kind === "door" ? 10 : Math.max(11, ppm * 0.36),
              }}
              aria-hidden
            >
              {f.kind === "dancefloor" ? <span className={classes.dancefloorLabel}>{f.label}</span> : f.label}
            </div>
          ))}

          {TABLES.map((t) => {
            const seats = plan.seating[t.id] ?? [];
            const filled = seats.filter(Boolean).length;
            const broken = plan.brokenTableIds.has(t.id);
            const selected = plan.selectedTableId === t.id;
            const canReceive = active ? plan.free[t.id] > 0 || plan.locations[active] === t.id : false;
            const offsets = seatOffsets(t);
            const bodyW = t.shape === "round" ? m(tableRadius(t) * 2) : m(LONG.w);
            const bodyH = t.shape === "round" ? m(tableRadius(t) * 2) : m(LONG.h);
            const flag = flagOffset(t);
            const flagD = Math.max(16, m(0.55));
            const tableKey = `table:${t.id}`;
            const visible = t.shape === "round" ? `${t.name} ${filled}/${t.seats}` : `${t.name} · ${filled}/${t.seats}`;
            const label = `${visible}: ${filled} of ${t.seats} seats taken${broken ? ", a rule is broken here" : ""}`;
            return (
              <Fragment key={t.id}>
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={label}
                  aria-pressed={selected}
                  className={cx(
                    classes.tableBody,
                    t.shape === "round" ? classes.round : classes.long,
                    selected && classes.selected,
                    broken && classes.broken,
                    active && canReceive && classes.armedOk,
                    active && !canReceive && classes.armedFull,
                    over === tableKey && classes.dropOver,
                  )}
                  style={{
                    left: m(t.x) - bodyW / 2,
                    top: m(t.y) - bodyH / 2,
                    width: bodyW,
                    height: bodyH,
                    fontSize: Math.min(13, Math.max(9.5, ppm * 0.32)),
                    transform: t.rotation ? `rotate(${t.rotation}deg)` : undefined,
                  }}
                  onClick={() => tableClick(t)}
                  onKeyDown={(e) => activate(e, () => tableClick(t))}
                  {...dropProps(tableKey, (id) => {
                    plan.seatGuest(id, t.id);
                    plan.selectTable(t.id);
                  })}
                >
                  {t.shape === "round" ? (
                    <>
                      <span style={{ fontWeight: 700 }}>{t.name}</span>{" "}
                      <span style={{ color: "var(--mantine-color-gray-7)", fontWeight: 600 }}>
                        {filled}/{t.seats}
                      </span>
                    </>
                  ) : (
                    <span style={{ fontWeight: 700 }}>
                      {t.name} {"·"}{" "}
                      <span style={{ color: "var(--mantine-color-gray-7)", fontWeight: 600 }}>
                        {filled}/{t.seats}
                      </span>
                    </span>
                  )}
                </div>

                {offsets.map((off, index) => {
                  const occupant = seats[index] ?? null;
                  const guest = occupant ? GUESTS_BY_ID[occupant] : null;
                  const px = m(SEAT_D);
                  const seatKey = `seat:${t.id}:${index}`;
                  const isArmed = guest !== null && guest !== undefined && armed === guest.id;
                  const flagged = guest ? plan.flaggedGuestIds.has(guest.id) : false;
                  const seatLabel = guest
                    ? `${initials(guest.name)} ${guest.name}, ${t.name}, seat ${index + 1}${guest.diet ? `, ${guest.diet}` : ""}${
                        flagged ? ", involved in a broken rule" : ""
                      }`
                    : `${t.name}, seat ${index + 1}: empty`;
                  const tip = guest
                    ? `${guest.name} · ${guest.party}${guest.diet ? ` · ${guest.diet}` : ""}`
                    : `Seat ${index + 1}, empty`;
                  return (
                    <Tooltip key={seatKey} label={tip} disabled={plan.dragId !== null} events={{ hover: true, focus: true, touch: false }}>
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label={seatLabel}
                        aria-pressed={guest ? isArmed : undefined}
                        draggable={guest !== null && guest !== undefined}
                        className={cx(
                          classes.seat,
                          !guest && classes.seatEmpty,
                          !guest && active && classes.seatTarget,
                          guest && active && activeIsSeated && !isArmed && classes.seatSwap,
                          isArmed && classes.seatArmed,
                          flagged && classes.seatFlag,
                          over === seatKey && classes.seatDrop,
                        )}
                        style={
                          {
                            left: m(t.x + off.x) - px / 2,
                            top: m(t.y + off.y) - px / 2,
                            width: px,
                            height: px,
                            fontSize: seatFont,
                            "--seat-bg": guest
                              ? `var(--mantine-color-${PARTY_COLOR[guest.party] ?? "gray"}-filled)`
                              : undefined,
                          } as CSSProperties
                        }
                        onClick={() => seatClick(t, index, occupant)}
                        onKeyDown={(e) => activate(e, () => seatClick(t, index, occupant))}
                        onDragStart={(e) => {
                          if (!guest) return;
                          e.dataTransfer.setData("text/plain", guest.id);
                          e.dataTransfer.effectAllowed = "move";
                          plan.setDragId(guest.id);
                        }}
                        onDragEnd={() => {
                          plan.setDragId(null);
                          setOver(null);
                        }}
                        {...dropProps(seatKey, (id) => {
                          if (id === occupant) return;
                          const swap = occupant && plan.locations[id];
                          plan.seatGuest(id, t.id, occupant && !swap ? undefined : index);
                          plan.selectTable(t.id);
                        })}
                      >
                        {guest ? initials(guest.name) : index + 1}
                        {guest?.diet ? (
                          <span
                            className={classes.dot}
                            aria-hidden
                            style={
                              {
                                width: px * 0.34,
                                height: px * 0.34,
                                right: -px * 0.06,
                                top: -px * 0.06,
                                "--dot-bg": `var(--mantine-color-${DIET_COLOR[guest.diet] ?? "gray"}-filled)`,
                              } as CSSProperties
                            }
                          />
                        ) : null}
                      </div>
                    </Tooltip>
                  );
                })}

                {broken ? (
                  <span
                    className={classes.flag}
                    aria-hidden
                    style={{
                      width: flagD,
                      height: flagD,
                      left: m(t.x + flag.x) - flagD / 2,
                      top: m(t.y + flag.y) - flagD / 2,
                    }}
                  >
                    <IconAlertTriangle size={flagD * 0.62} stroke={2.6} />
                  </span>
                ) : null}
              </Fragment>
            );
          })}
        </div>
      </div>

      <Group gap="lg" mt="sm" align="flex-start" justify="space-between">
        <Group gap="sm" wrap="wrap" role="list" aria-label="Party colours">
          {PARTY_ORDER.map((p) => (
            <Group key={p} gap={6} wrap="nowrap" role="listitem">
              <Box
                w={12}
                h={12}
                style={{
                  borderRadius: "50%",
                  background: `var(--mantine-color-${PARTY_COLOR[p] ?? "gray"}-filled)`,
                }}
              />
              <Text fz="xs" c="gray.8">
                {p}
              </Text>
            </Group>
          ))}
        </Group>
        <Group gap="md" wrap="wrap">
          <Group gap={6} wrap="nowrap">
            <Box
              w={12}
              h={12}
              style={{ borderRadius: "50%", border: "2px dashed var(--mantine-color-gray-5)", background: "var(--mantine-color-gray-0)" }}
            />
            <Text fz="xs" c="gray.8">
              Empty seat
            </Text>
          </Group>
          <Group gap={6} wrap="nowrap">
            <Box w={9} h={9} style={{ borderRadius: "50%", background: "var(--mantine-color-green-filled)" }} />
            <Text fz="xs" c="gray.8">
              Dot = dietary need
            </Text>
          </Group>
          <Group gap={6} wrap="nowrap">
            <Box
              w={ppm * 5}
              h={7}
              style={{
                borderLeft: "2px solid var(--mantine-color-gray-7)",
                borderRight: "2px solid var(--mantine-color-gray-7)",
                borderBottom: "2px solid var(--mantine-color-gray-7)",
              }}
              aria-hidden
            />
            <Text fz="xs" c="gray.8">
              5 m
            </Text>
          </Group>
        </Group>
      </Group>
    </Box>
  );
}
