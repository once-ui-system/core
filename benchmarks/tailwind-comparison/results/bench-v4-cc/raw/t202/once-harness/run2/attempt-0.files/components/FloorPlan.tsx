"use client";

import type { CSSProperties, DragEvent, KeyboardEvent, MouseEvent } from "react";
import { Button, Column, Heading, Icon, Row, Text } from "@once-ui-system/core";
import { EVENT, FIXTURES, GUEST_BY_ID, TABLES, type TableDef } from "@/lib/data";
import { SEAT_R, initials, seatLayout } from "@/lib/plan";
import { usePlan } from "./PlanProvider";

const { width: ROOM_W, depth: ROOM_D } = EVENT.room_m;

const INK: CSSProperties = {
  fill: "var(--neutral-on-background-strong)",
  pointerEvents: "none",
  userSelect: "none",
};
const INK_WEAK: CSSProperties = {
  fill: "var(--neutral-on-background-weak)",
  pointerEvents: "none",
  userSelect: "none",
};

function Fixtures() {
  return (
    <g>
      {FIXTURES.map((f) => {
        const cx = f.x + f.w / 2;
        const cy = f.y + f.h / 2;
        if (f.kind === "door") {
          return (
            <g key={f.id} role="img" aria-label={f.label}>
              <rect
                x={f.x}
                y={f.y}
                width={f.w}
                height={f.h}
                rx={0.1}
                style={{ fill: "var(--success-solid-strong)", opacity: 0.85 }}
              />
              <text
                transform={`translate(-0.24 ${cy}) rotate(-90)`}
                textAnchor="middle"
                style={{ ...INK_WEAK, fontSize: 0.34, fontWeight: 600 }}>
                {f.label}
              </text>
            </g>
          );
        }
        const look: CSSProperties =
          f.kind === "stage"
            ? { fill: "var(--neutral-alpha-medium)", stroke: "var(--neutral-alpha-strong)" }
            : f.kind === "dancefloor"
              ? { fill: "var(--brand-alpha-weak)", stroke: "var(--brand-alpha-medium)", strokeDasharray: "0.2 0.12" }
              : { fill: "var(--accent-alpha-weak)", stroke: "var(--accent-alpha-medium)" };
        return (
          <g key={f.id} role="img" aria-label={f.label}>
            <rect
              x={f.x}
              y={f.y}
              width={f.w}
              height={f.h}
              rx={f.kind === "dancefloor" ? 0.2 : 0.12}
              style={{ ...look, strokeWidth: 0.06 }}
            />
            <text
              x={cx}
              y={cy + 0.12}
              textAnchor="middle"
              style={{ ...INK, fontSize: 0.4, fontWeight: 600 }}>
              {f.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function TableNode({ table }: { table: TableDef }) {
  const {
    seating,
    selectedTable,
    selectTable,
    picked,
    pick,
    dragId,
    setDragId,
    seat,
    placePicked,
    brokenTableIds,
  } = usePlan();
  const layout = seatLayout(table);
  const slots = seating[table.id];
  const filled = slots.filter(Boolean).length;
  const selected = selectedTable === table.id;
  const broken = brokenTableIds.has(table.id);
  const full = filled === table.seats;
  const droppable = (picked !== null || dragId !== null) && !full;
  const rotation = table.rotation ?? 0;

  const activate = () => {
    if (picked) placePicked(table.id);
    else selectTable(table.id);
  };

  const onDragOver = (e: DragEvent<SVGElement>) => {
    if (dragId === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const dropAt = (e: DragEvent<SVGElement>, index?: number) => {
    e.preventDefault();
    e.stopPropagation();
    const id = e.dataTransfer.getData("text/plain");
    setDragId(null);
    if (id && GUEST_BY_ID[id]) {
      seat(id, table.id, index);
      selectTable(table.id);
    }
  };

  const bodyStroke = broken
    ? "var(--danger-solid-strong)"
    : selected
      ? "var(--brand-solid-strong)"
      : "var(--neutral-alpha-strong)";

  const label = `${table.name}, ${filled} of ${table.seats} seats filled${broken ? ", a seating rule is broken" : ""}${
    picked ? `. Place ${GUEST_BY_ID[picked].name} here` : ""
  }`;

  const body = layout.body;

  return (
    <g transform={`translate(${table.x} ${table.y}) rotate(${rotation})`}>
      <g
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-pressed={selected}
        style={{ cursor: "pointer" }}
        onClick={activate}
        onKeyDown={(e: KeyboardEvent<SVGGElement>) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            activate();
          }
        }}
        onDragOver={onDragOver}
        onDrop={(e) => dropAt(e)}>
        <rect
          x={layout.hit.x}
          y={layout.hit.y}
          width={layout.hit.w}
          height={layout.hit.h}
          rx={0.5}
          style={{
            fill: "transparent",
            stroke: droppable ? "var(--brand-solid-strong)" : "none",
            strokeWidth: 0.05,
            strokeDasharray: "0.15 0.12",
          }}
        />
        {body.kind === "round" ? (
          <circle
            r={body.r}
            style={{
              fill: selected ? "var(--brand-alpha-weak)" : "var(--neutral-alpha-weak)",
              stroke: bodyStroke,
              strokeWidth: broken || selected ? 0.12 : 0.06,
            }}
          />
        ) : (
          <rect
            x={-body.w / 2}
            y={-body.h / 2}
            width={body.w}
            height={body.h}
            rx={0.2}
            style={{
              fill: selected ? "var(--brand-alpha-weak)" : "var(--neutral-alpha-weak)",
              stroke: bodyStroke,
              strokeWidth: broken || selected ? 0.12 : 0.06,
            }}
          />
        )}
        <g transform={`rotate(${-rotation})`}>
          <text
            textAnchor="middle"
            y={body.kind === "round" ? -0.04 : -0.06}
            style={{ ...INK, fontSize: 0.34, fontWeight: 700 }}>
            {table.name}
          </text>
          <text
            textAnchor="middle"
            y={body.kind === "round" ? 0.36 : 0.3}
            style={{ ...INK_WEAK, fontSize: 0.3, fontWeight: 600 }}>
            {filled}/{table.seats}
          </text>
          {broken ? (
            <g transform={`translate(${body.kind === "round" ? -body.r * 0.58 : -body.w / 2 + 0.34} ${body.kind === "round" ? -body.r * 0.58 : 0})`}>
              <circle r={0.2} style={{ fill: "var(--danger-solid-strong)" }} />
              <text textAnchor="middle" y={0.1} style={{ fill: "white", fontSize: 0.28, fontWeight: 800, pointerEvents: "none" }}>
                !
              </text>
            </g>
          ) : null}
        </g>
      </g>
      {layout.seats.map((p, i) => {
        const guestId = slots[i];
        const guest = guestId ? GUEST_BY_ID[guestId] : null;
        const isPicked = guestId !== null && guestId === picked;
        const onSeatClick = (e: MouseEvent<SVGGElement>) => {
          e.stopPropagation();
          selectTable(table.id);
          if (picked) {
            if (guestId === picked) {
              pick(null);
              return;
            }
            placePicked(table.id, i);
          } else if (guestId) {
            pick(guestId);
          }
        };
        const dragProps = guest ? { draggable: true } : {};
        return (
          <g
            key={i}
            {...dragProps}
            role="button"
            tabIndex={-1}
            aria-label={guest ? `${table.name} seat ${i + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}` : `${table.name} seat ${i + 1}: empty`}
            transform={`translate(${p.x} ${p.y})`}
            style={{ cursor: "pointer" }}
            onClick={onSeatClick}
            onDragStart={(e: DragEvent<SVGGElement>) => {
              if (!guest) return;
              e.dataTransfer.setData("text/plain", guest.id);
              e.dataTransfer.effectAllowed = "move";
              setDragId(guest.id);
            }}
            onDragEnd={() => setDragId(null)}
            onDragOver={onDragOver}
            onDrop={(e) => dropAt(e, i)}>
            <title>{guest ? `${guest.name}${guest.diet ? ` (${guest.diet})` : ""}` : `Empty seat ${i + 1}`}</title>
            <circle
              r={SEAT_R}
              style={
                guest
                  ? {
                      fill: "var(--brand-alpha-medium)",
                      stroke: isPicked ? "var(--brand-solid-strong)" : "var(--brand-alpha-strong)",
                      strokeWidth: isPicked ? 0.14 : 0.05,
                    }
                  : {
                      fill: "transparent",
                      stroke: droppable ? "var(--brand-solid-strong)" : "var(--neutral-alpha-strong)",
                      strokeWidth: 0.05,
                      strokeDasharray: "0.12 0.1",
                    }
              }
            />
            {guest ? (
              <g transform={`rotate(${-rotation})`}>
                <text
                  textAnchor="middle"
                  y={0.11}
                  style={{ ...INK, fontSize: 0.32, fontWeight: 700 }}>
                  {initials(guest.name)}
                </text>
                {guest.diet ? (
                  <circle cx={0.26} cy={-0.26} r={0.1} style={{ fill: "var(--warning-solid-strong)", pointerEvents: "none" }} />
                ) : null}
              </g>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

export function FloorPlan() {
  const { picked, pick, undo, canUndo } = usePlan();
  const pickedGuest = picked ? GUEST_BY_ID[picked] : null;

  return (
    <Column background="surface" border radius="l" fillWidth overflow="hidden">
      <Row paddingX="16" paddingY="12" gap="12" vertical="center" wrap borderBottom>
        <Column gap="2" flex={1}>
          <Heading as="h2" textVariant="heading-strong-m">
            Room plan
          </Heading>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            {EVENT.venue}, {ROOM_W} × {ROOM_D} m, drawn to scale
          </Text>
        </Column>
        <Row gap="12" vertical="center" wrap>
          <Row gap="4" vertical="center" fit>
            <Icon name="check" size="xs" onBackground="brand-medium" />
            <Text textVariant="body-default-xs" onBackground="neutral-weak">Seated</Text>
          </Row>
          <Row gap="4" vertical="center" fit>
            <Icon name="warning" size="xs" onBackground="warning-strong" />
            <Text textVariant="body-default-xs" onBackground="neutral-weak">Dietary need</Text>
          </Row>
          <Row gap="4" vertical="center" fit>
            <Icon name="danger" size="xs" onBackground="danger-strong" />
            <Text textVariant="body-default-xs" onBackground="neutral-weak">Rule broken</Text>
          </Row>
          <Button variant="secondary" size="s" prefixIcon="return" onClick={undo} disabled={!canUndo}>
            Undo
          </Button>
        </Row>
      </Row>
      {pickedGuest ? (
        <Row
          paddingX="16"
          paddingY="8"
          gap="12"
          vertical="center"
          wrap
          background="brand-alpha-weak"
          borderBottom>
          <Icon name="enter" size="s" onBackground="brand-strong" />
          <Text textVariant="label-default-s" flex={1}>
            Placing {pickedGuest.name}. Tap a table or an empty seat (Esc cancels).
          </Text>
          <Button variant="tertiary" size="s" onClick={() => pick(null)}>
            Cancel
          </Button>
        </Row>
      ) : null}
      <Row overflowX="auto" fillWidth padding="8">
        <svg
          viewBox={`-0.7 -0.5 ${ROOM_W + 1.4} ${ROOM_D + 1.4}`}
          role="group"
          aria-label={`Floor plan of ${EVENT.venue}, ${ROOM_W} by ${ROOM_D} metres`}
          style={{ width: "100%", minWidth: 760, flexShrink: 0, height: "auto", display: "block" }}>
          <rect
            x={0}
            y={0}
            width={ROOM_W}
            height={ROOM_D}
            rx={0.3}
            style={{ fill: "var(--surface-background, transparent)", stroke: "var(--neutral-alpha-strong)", strokeWidth: 0.1 }}
          />
          <Fixtures />
          {TABLES.map((t) => (
            <TableNode key={t.id} table={t} />
          ))}
          <g aria-hidden="true">
            <line x1={0} y1={14.62} x2={5} y2={14.62} style={{ stroke: "var(--neutral-on-background-weak)", strokeWidth: 0.07 }} />
            <line x1={0} y1={14.45} x2={0} y2={14.79} style={{ stroke: "var(--neutral-on-background-weak)", strokeWidth: 0.07 }} />
            <line x1={5} y1={14.45} x2={5} y2={14.79} style={{ stroke: "var(--neutral-on-background-weak)", strokeWidth: 0.07 }} />
            <text x={5.3} y={14.74} style={{ ...INK_WEAK, fontSize: 0.34 }}>
              5 m
            </text>
          </g>
        </svg>
      </Row>
    </Column>
  );
}
