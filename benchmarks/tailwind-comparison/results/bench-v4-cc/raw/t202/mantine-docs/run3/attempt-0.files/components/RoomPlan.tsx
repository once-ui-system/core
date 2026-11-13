"use client";

import { useMemo, useState, type CSSProperties, type DragEvent } from "react";
import { Box, Button, Group, Paper, Select, Text } from "@mantine/core";
import { IconAlertTriangle, IconUserMinus } from "@tabler/icons-react";
import { EVENT, FIXTURES, TABLES, type Fixture, type TableDef } from "@/lib/data";
import { SEAT, geometry, guestById, initials, partyColor, PARTY_COLORS } from "@/lib/plan";
import { usePlan } from "./PlanProvider";

const UNIT = 100 / EVENT.room_m.width;
const m = (metres: number) => `${(metres * UNIT).toFixed(4)}cqw`;

const CSS = `
.sw-seat{transition:box-shadow .12s ease, background-color .12s ease}
.sw-seat:hover{box-shadow:0 0 0 3px var(--mantine-color-fig-2)}
.sw-body{transition:box-shadow .12s ease, border-color .12s ease, background-color .12s ease}
.sw-body:hover{background:var(--mantine-color-fig-0)}
@media (prefers-reduced-motion: reduce){.sw-seat,.sw-body{transition:none}}
`;

function fixtureStyle(kind: Fixture["kind"]): CSSProperties {
  switch (kind) {
    case "stage":
      return {
        background: "var(--mantine-color-gray-8)",
        color: "var(--mantine-color-white)",
        borderRadius: m(0.25),
      };
    case "dancefloor":
      return {
        background:
          "repeating-conic-gradient(var(--mantine-color-fig-1) 0% 25%, var(--mantine-color-fig-0) 0% 50%) 0 0 / 1.4cqw 1.4cqw",
        color: "var(--mantine-color-fig-9)",
        border: "1.5px solid var(--mantine-color-fig-3)",
        borderRadius: m(0.2),
      };
    case "bar":
      return {
        background: "var(--mantine-color-yellow-2)",
        color: "var(--mantine-color-yellow-9)",
        border: "1.5px solid var(--mantine-color-yellow-6)",
        borderRadius: m(0.2),
      };
    case "door":
      return {
        background: "var(--mantine-color-teal-6)",
        color: "var(--mantine-color-white)",
        writingMode: "vertical-rl",
      };
  }
}

function TableView({ table }: { table: TableDef }) {
  const { tableSeats, flagged, selectedTableId, heldId, selectTable, hold, place } = usePlan();
  const geo = useMemo(() => geometry(table), [table]);
  const [over, setOver] = useState(false);

  const row = tableSeats[table.id] ?? [];
  const count = row.filter(Boolean).length;
  const issues = flagged[table.id] ?? [];
  const broken = issues.length > 0;
  const selected = selectedTableId === table.id;
  const held = heldId ? guestById[heldId] : null;
  const full = count === table.seats;

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.types.includes("text/plain")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setOver(true);
    }
  };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
  };
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setOver(false);
    const id = e.dataTransfer.getData("text/plain");
    if (id && guestById[id]) place(id, table.id);
  };

  const borderColor = broken
    ? "var(--mantine-color-red-6)"
    : selected
      ? "var(--mantine-color-fig-6)"
      : over
        ? "var(--mantine-color-fig-4)"
        : "var(--mantine-color-gray-5)";
  const ring = broken
    ? "0 0 0 4px var(--mantine-color-red-1)"
    : selected
      ? "0 0 0 4px var(--mantine-color-fig-2)"
      : over
        ? "0 0 0 4px var(--mantine-color-fig-1)"
        : "none";

  const description =
    `${table.name}, ${count} of ${table.seats} seats filled` +
    (broken ? `, ${issues.length} rule${issues.length > 1 ? "s" : ""} broken` : "") +
    (held ? `. Seat ${held.name} here` : "");

  return (
    <div
      role="group"
      aria-label={table.name}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        position: "absolute",
        left: m(table.x - geo.w / 2),
        top: m(table.y - geo.h / 2),
        width: m(geo.w),
        height: m(geo.h),
        transform: table.rotation ? `rotate(${table.rotation}deg)` : undefined,
      }}
    >
      <button
        type="button"
        className="sw-body mantine-focus-auto"
        aria-pressed={selected}
        aria-label={description}
        onClick={() => (heldId ? place(heldId, table.id) : selectTable(table.id))}
        style={{
          position: "absolute",
          left: m((geo.w - geo.bodyW) / 2),
          top: m((geo.h - geo.bodyH) / 2),
          width: m(geo.bodyW),
          height: m(geo.bodyH),
          borderRadius: geo.round ? "50%" : m(0.25),
          background: over ? "var(--mantine-color-fig-0)" : "var(--mantine-color-white)",
          border: `2px solid ${borderColor}`,
          boxShadow: ring,
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          color: "var(--mantine-color-gray-9)",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: `max(9px, ${m(0.36)})`, lineHeight: 1.15 }}>
          {table.name}
        </span>
        <span
          style={{
            fontSize: `max(9px, ${m(0.32)})`,
            lineHeight: 1.2,
            color: full ? "var(--mantine-color-green-9)" : "var(--mantine-color-gray-7)",
            fontWeight: full ? 700 : 500,
          }}
        >
          {count}/{table.seats}
        </span>
        {broken && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: -9,
              right: -9,
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "var(--mantine-color-red-6)",
              color: "white",
              display: "grid",
              placeItems: "center",
              border: "2px solid white",
            }}
          >
            <IconAlertTriangle size={13} />
          </span>
        )}
      </button>

      {geo.seats.map((pos, i) => {
        const guest = row[i] ?? null;
        const c = guest ? partyColor(guest.party) : "gray";
        const isHeld = guest !== null && guest.id === heldId;
        const label = guest
          ? `${table.name}, seat ${i + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}. ${
              isHeld ? "Picked up, press to put down" : heldId ? "Swap with picked up guest" : "Pick up to move"
            }`
          : `${table.name}, seat ${i + 1}: empty${held ? `. Seat ${held.name} here` : ""}`;
        return (
          <button
            key={i}
            type="button"
            className="sw-seat mantine-focus-auto"
            aria-label={label}
            title={guest ? guest.name : `Empty seat ${i + 1}`}
            draggable={guest !== null}
            onDragStart={(e) => {
              if (!guest) return;
              e.dataTransfer.setData("text/plain", guest.id);
              e.dataTransfer.effectAllowed = "move";
            }}
            onClick={() => {
              if (guest) {
                if (isHeld) hold(null);
                else if (heldId) place(heldId, table.id, i);
                else {
                  selectTable(table.id);
                  hold(guest.id);
                }
              } else if (heldId) place(heldId, table.id, i);
              else selectTable(table.id);
            }}
            style={{
              position: "absolute",
              left: m(geo.w / 2 + pos.x - SEAT / 2),
              top: m(geo.h / 2 + pos.y - SEAT / 2),
              width: m(SEAT),
              height: m(SEAT),
              borderRadius: "50%",
              padding: 0,
              cursor: guest ? "grab" : "pointer",
              display: "grid",
              placeItems: "center",
              fontSize: `max(9px, ${m(0.3)})`,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              background: guest
                ? `var(--mantine-color-${c}-1)`
                : held
                  ? "var(--mantine-color-fig-0)"
                  : "var(--mantine-color-white)",
              color: guest ? `var(--mantine-color-${c}-9)` : "var(--mantine-color-gray-7)",
              border: guest
                ? `2px solid var(--mantine-color-${c}-6)`
                : held
                  ? "2px dashed var(--mantine-color-fig-5)"
                  : "2px dashed var(--mantine-color-gray-5)",
              boxShadow: isHeld ? "0 0 0 3px var(--mantine-color-fig-6)" : undefined,
            }}
          >
            {guest ? initials(guest.name) : <span style={{ fontWeight: 500 }}>{i + 1}</span>}
            {guest?.diet && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: "-10%",
                  right: "-10%",
                  width: "34%",
                  height: "34%",
                  borderRadius: "50%",
                  background: "var(--mantine-color-orange-6)",
                  border: "1.5px solid white",
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function RoomPlan() {
  return (
    <Paper withBorder radius="lg" p="sm" shadow="xs">
      <style>{CSS}</style>
      <Box style={{ overflowX: "auto" }}>
        <Box miw={760}>
          <Box
            role="group"
            aria-label={`Room plan, ${EVENT.room_m.width} by ${EVENT.room_m.depth} metres`}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: `${EVENT.room_m.width} / ${EVENT.room_m.depth}`,
              containerType: "inline-size",
              overflow: "hidden",
              borderRadius: 12,
              background: "#fffdf9",
              border: "3px solid var(--mantine-color-gray-6)",
              backgroundImage:
                "linear-gradient(to right, rgba(0,0,0,.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,.045) 1px, transparent 1px)",
              backgroundSize: `${m(1)} ${m(1)}`,
            }}
          >
            {FIXTURES.map((f) => (
              <div
                key={f.id}
                role="img"
                aria-label={f.label}
                style={{
                  position: "absolute",
                  left: m(f.x),
                  top: m(f.y),
                  width: m(f.w),
                  height: m(f.h),
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 600,
                  fontSize: `max(9px, ${m(0.36)})`,
                  textAlign: "center",
                  ...fixtureStyle(f.kind),
                }}
              >
                <span>{f.label}</span>
              </div>
            ))}
            {TABLES.map((t) => (
              <TableView key={t.id} table={t} />
            ))}
          </Box>
        </Box>
      </Box>
      <Group gap="md" mt="sm" wrap="wrap" align="center">
        <Text size="xs" c="gray.7">
          Drawn to scale, {EVENT.room_m.width} × {EVENT.room_m.depth} m, grid squares are 1 m.
        </Text>
        <Group gap={10} wrap="wrap" aria-label="Legend">
          {Object.keys(PARTY_COLORS).map((party) => {
            const c = partyColor(party);
            return (
              <Group key={party} gap={5} wrap="nowrap">
                <Box
                  component="span"
                  aria-hidden
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: `var(--mantine-color-${c}-1)`,
                    border: `2px solid var(--mantine-color-${c}-6)`,
                  }}
                />
                <Text size="xs" c="gray.8">
                  {party}
                </Text>
              </Group>
            );
          })}
          <Group gap={5} wrap="nowrap">
            <Box
              component="span"
              aria-hidden
              style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--mantine-color-orange-6)" }}
            />
            <Text size="xs" c="gray.8">
              Dietary need
            </Text>
          </Group>
        </Group>
      </Group>
    </Paper>
  );
}

export function HeldBanner() {
  const { heldId, seats, hold, unseat, place } = usePlan();
  const { tableSeats } = usePlan();
  if (!heldId) {
    return (
      <Text size="sm" c="gray.7">
        Drag a guest onto a table, or tap a guest and then a table or an empty seat.
      </Text>
    );
  }
  const guest = guestById[heldId];
  if (!guest) return null;
  const current = seats[heldId];
  const options = TABLES.map((t) => {
    const free = t.seats - (tableSeats[t.id] ?? []).filter(Boolean).length;
    return {
      value: t.id,
      label: `${t.name} (${free} free)`,
      disabled: free === 0 || current?.tableId === t.id,
    };
  });
  return (
    <Paper
      withBorder
      radius="md"
      p="sm"
      role="status"
      style={{ borderColor: "var(--mantine-color-fig-4)", background: "var(--mantine-color-fig-0)" }}
    >
      <Group justify="space-between" gap="sm" align="flex-end">
        <div>
          <Text fw={600} size="sm">
            {current ? "Moving" : "Seating"} {guest.name}
          </Text>
          <Text size="xs" c="gray.8">
            Tap a table or an empty seat on the plan, or choose a table.
          </Text>
        </div>
        <Group gap="xs" align="flex-end">
          <Select
            aria-label={`Move ${guest.name} to table`}
            placeholder="Choose table"
            data={options}
            value={null}
            onChange={(v) => v && place(heldId, v)}
            size="xs"
            w={190}
            allowDeselect={false}
          />
          {current && (
            <Button
              size="xs"
              variant="default"
              leftSection={<IconUserMinus size={14} />}
              onClick={() => unseat(heldId)}
            >
              Unseat
            </Button>
          )}
          <Button size="xs" variant="subtle" color="gray.8" onClick={() => hold(null)}>
            Cancel
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}
