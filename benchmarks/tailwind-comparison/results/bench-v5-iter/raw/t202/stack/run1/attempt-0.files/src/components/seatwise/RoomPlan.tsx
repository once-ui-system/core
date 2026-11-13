"use client";

import { Column, Heading, Row, Text } from "@once-ui-system/core";
import { useEffect, useRef, useState } from "react";
import { event, fixtures, initials, tables, type SeatTable } from "@/lib/data";
import { useSeating } from "@/lib/seating";
import { partyIndex, partyOrder } from "./party";

const SEAT = 28;
const MIN_SCALE = 34;
const MAX_SCALE = 56;

type Target = { table: string; seat: number | null } | null;

export function RoomPlan() {
  const {
    occupancy,
    heldGuestId,
    selectedTableId,
    brokenTableIds,
    brokenGuestIds,
    seatGuest,
    holdGuest,
    selectTable,
    guests,
  } = useSeating();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [target, setTarget] = useState<Target>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    const measure = () => setWidth(node.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, width / event.room.width));
  const roomW = event.room.width * scale;
  const roomH = event.room.depth * scale;
  const held = guests.find((guest) => guest.id === heldGuestId) ?? null;

  const clickSeat = (table: SeatTable, index: number) => {
    const occupant = occupancy[table.id][index];
    if (heldGuestId) {
      if (occupant?.id === heldGuestId) holdGuest(null);
      else seatGuest(heldGuestId, table.id, index);
      return;
    }
    selectTable(table.id);
    if (occupant) holdGuest(occupant.id);
  };

  const clickTable = (table: SeatTable) => {
    if (heldGuestId) {
      seatGuest(heldGuestId, table.id);
      return;
    }
    selectTable(selectedTableId === table.id ? null : table.id);
  };

  const onDrop = (e: React.DragEvent, tableId: string, seat?: number) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    setTarget(null);
    if (id) seatGuest(id, tableId, seat);
  };

  const renderTable = (table: SeatTable) => {
    const slots = occupancy[table.id];
    const taken = slots.filter(Boolean).length;
    const long = table.shape === "long";
    const broken = brokenTableIds.has(table.id);
    const selected = selectedTableId === table.id;
    const full = taken >= table.seats;

    const radius = Math.max(0.8 * scale, 28);
    const ring = radius + SEAT / 2 + 5;
    const length = 4.4 * scale;
    const depth = Math.max(scale, 36);

    const bodyBox = long
      ? { left: -length / 2, top: -depth / 2, width: length, height: depth }
      : { left: -radius, top: -radius, width: radius * 2, height: radius * 2 };

    const seatPos = (i: number) => {
      if (long) {
        const perSide = table.seats / 2;
        const col = i % perSide;
        const x = -length / 2 + ((col + 0.5) * length) / perSide;
        const y = (i < perSide ? -1 : 1) * (depth / 2 + SEAT / 2 + 5);
        return { x, y };
      }
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / table.seats;
      return { x: Math.cos(angle) * ring, y: Math.sin(angle) * ring };
    };

    const label = `${table.name} ${taken}/${table.seats}: ${taken} of ${table.seats} seats taken${full ? ", full" : ""}${
      broken ? ", breaks a rule" : ""
    }`;

    return (
      <div
        key={table.id}
        className="sw-table"
        style={{ left: table.x * scale, top: table.y * scale }}
      >
        <button
          type="button"
          className="sw-table-body"
          data-shape={table.shape}
          data-selected={selected}
          data-broken={broken}
          data-target={target?.table === table.id && target.seat === null}
          style={bodyBox}
          aria-label={label}
          aria-pressed={selected}
          onClick={() => clickTable(table)}
          onDragOver={(e) => {
            e.preventDefault();
            setTarget({ table: table.id, seat: null });
          }}
          onDragLeave={() => setTarget(null)}
          onDrop={(e) => onDrop(e, table.id)}
        >
          <strong>{table.name}</strong>{" "}
          <span>
            {taken}/{table.seats}
          </span>
        </button>
        {broken && (
          <span
            className="sw-flag"
            aria-hidden="true"
            style={{
              left: long ? length / 2 - 12 : radius * 0.7,
              top: long ? -depth / 2 - 6 : -radius * 0.95,
            }}
          >
            !
          </span>
        )}
        {slots.map((occupant, i) => {
          const pos = seatPos(i);
          const seatLabel = occupant
            ? `${initials(occupant.name)}: ${occupant.name}, ${table.name} seat ${i + 1}${occupant.diet ? `, ${occupant.diet}` : ""}${
                brokenGuestIds.has(occupant.id) ? ", involved in a broken rule" : ""
              }`
            : `Empty seat ${i + 1} at ${table.name}`;
          return (
            <button
              key={`${table.id}-${i}`}
              type="button"
              className="sw-seat"
              data-empty={!occupant}
              data-party={occupant ? partyIndex(occupant.party) : undefined}
              data-diet={!!occupant?.diet}
              data-held={!!occupant && occupant.id === heldGuestId}
              data-broken={!!occupant && brokenGuestIds.has(occupant.id)}
              data-target={target?.table === table.id && target.seat === i}
              style={{ left: pos.x - SEAT / 2, top: pos.y - SEAT / 2 }}
              aria-label={seatLabel}
              aria-pressed={occupant ? occupant.id === heldGuestId : undefined}
              title={occupant ? `${occupant.name}${occupant.diet ? ` (${occupant.diet})` : ""}` : `Seat ${i + 1}`}
              draggable={!!occupant}
              onDragStart={(e) => {
                if (!occupant) return;
                e.dataTransfer.setData("text/plain", occupant.id);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setTarget({ table: table.id, seat: i });
              }}
              onDragLeave={() => setTarget(null)}
              onDrop={(e) => {
                e.stopPropagation();
                onDrop(e, table.id, i);
              }}
              onClick={() => clickSeat(table, i)}
            >
              <span aria-hidden="true">{occupant ? initials(occupant.name) : i + 1}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <Column background="surface" border radius="l" padding="16" gap="12" fillWidth>
      <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
        <Column gap="4">
          <Heading as="h2" variant="heading-strong-m">
            Room plan
          </Heading>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            {event.room.width} m by {event.room.depth} m, drawn to scale. Drag guests, or tap a guest and then a seat.
          </Text>
        </Column>
        <Row gap="12" wrap vertical="center" aria-label="Party colours">
          {partyOrder.map((party, i) => (
            <Row key={party} gap="4" vertical="center">
              <span className="sw-legend-dot" data-party={i} aria-hidden="true" />
              <Text variant="label-default-xs" onBackground="neutral-medium">
                {party}
              </Text>
            </Row>
          ))}
          <Row gap="4" vertical="center">
            <span className="sw-legend-dot" style={{ background: "var(--warning-solid-strong)" }} aria-hidden="true" />
            <Text variant="label-default-xs" onBackground="neutral-medium">
              Dietary need
            </Text>
          </Row>
        </Row>
      </Row>

      {held && (
        <Text variant="label-default-s" onBackground="brand-medium" aria-live="polite">
          Seating {held.name}: tap an empty seat or a table.
        </Text>
      )}

      <div className="sw-scroll" ref={scrollRef} tabIndex={-1}>
        <div
          className="sw-room"
          style={{ width: roomW, height: roomH, ["--m" as string]: `${scale}px` }}
          role="group"
          aria-label={`Room plan of ${event.venue}`}
        >
          {fixtures.map((fx) => (
            <div
              key={fx.id}
              className="sw-fx"
              data-kind={fx.kind}
              style={{ left: fx.x * scale, top: fx.y * scale, width: fx.w * scale, height: fx.h * scale }}
            >
              {fx.label}
            </div>
          ))}
          {tables.map(renderTable)}
        </div>
      </div>
    </Column>
  );
}
