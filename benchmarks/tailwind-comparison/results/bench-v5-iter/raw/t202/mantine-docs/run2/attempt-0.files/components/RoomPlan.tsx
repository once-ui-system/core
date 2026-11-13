"use client";

import { useState, type CSSProperties, type DragEvent, type KeyboardEvent } from "react";
import { Box, Paper, ThemeIcon, VisuallyHidden } from "@mantine/core";
import { IconAlertTriangle, IconPlus } from "@tabler/icons-react";
import { event, fixtures, tables, type Fixture, type TableDef } from "@/lib/data";
import {
  SEAT_D,
  guestById,
  initials,
  occupants,
  tableGeometry,
  type TableGeometry,
} from "@/lib/plan";
import { partyColor } from "./GuestBits";
import { usePlan } from "./PlanProvider";

const W = event.room_m.width;
const D = event.room_m.depth;

const FONT_SEAT = "max(9px, 1.3cqw)";
const FONT_LABEL = "max(9px, 1.25cqw)";

type RectM = { x: number; y: number; w: number; h: number };

/** A rectangle in room metres as percentages of the room. */
function inRoom(r: RectM): CSSProperties {
  return {
    left: `${(r.x / W) * 100}%`,
    top: `${(r.y / D) * 100}%`,
    width: `${(r.w / W) * 100}%`,
    height: `${(r.h / D) * 100}%`,
  };
}

/** A rectangle in room metres as percentages of a table's own box. */
function inBox(box: RectM, r: RectM): CSSProperties {
  return {
    left: `${((r.x - box.x) / box.w) * 100}%`,
    top: `${((r.y - box.y) / box.h) * 100}%`,
    width: `${(r.w / box.w) * 100}%`,
    height: `${(r.h / box.h) * 100}%`,
  };
}

function fixtureStyle(f: Fixture): CSSProperties {
  switch (f.kind) {
    case "stage":
      return {
        background: "var(--mantine-color-dark-6)",
        color: "var(--mantine-color-white)",
        borderRadius: 6,
      };
    case "dancefloor":
      return {
        background: `repeating-conic-gradient(var(--mantine-color-brand-1) 0% 25%, var(--mantine-color-brand-0) 0% 50%) 0 0 / calc(200% / ${f.w}) calc(200% / ${f.h})`,
        border: "1.5px dashed var(--mantine-color-brand-4)",
        color: "var(--mantine-color-brand-9)",
        borderRadius: 6,
      };
    case "bar":
      return {
        background: "var(--mantine-color-orange-9)",
        color: "var(--mantine-color-white)",
        borderRadius: 6,
      };
    default:
      return { background: "var(--mantine-color-teal-6)", borderRadius: 2 };
  }
}

function Fixtures() {
  return (
    <>
      {fixtures.map((f) => (
        <Box
          key={f.id}
          style={{
            position: "absolute",
            ...inRoom(f),
            ...fixtureStyle(f),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: FONT_LABEL,
            fontWeight: 700,
            letterSpacing: 0.2,
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {f.kind !== "door" ? f.label : null}
        </Box>
      ))}
      {fixtures
        .filter((f) => f.kind === "door")
        .map((f) => (
          <Box
            key={`${f.id}-label`}
            aria-hidden
            style={{
              position: "absolute",
              ...inRoom({ x: f.x + f.w + 0.1, y: f.y, w: 0.6, h: f.h }),
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              fontSize: "max(8px, 1.05cqw)",
              fontWeight: 700,
              color: "var(--mantine-color-teal-9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            {f.label}
          </Box>
        ))}
    </>
  );
}

type SeatProps = {
  table: TableDef;
  geo: TableGeometry;
  index: number;
  guestId: string | null;
  over: boolean;
  flagged: boolean;
  onOver: (key: string | null) => void;
};

function Seat({ table, geo, index, guestId, over, flagged, onOver }: SeatProps) {
  const { picked, dragId, place, pick, setDragId, selectTable } = usePlan();
  const guest = guestId ? guestById[guestId] : undefined;
  const pos = geo.seats[index];
  if (!pos) return null;
  const key = `${table.id}:${index}`;
  const color = guest ? partyColor(guest.party) : "gray";
  const isPicked = Boolean(guestId) && picked === guestId;
  const holding = Boolean(picked) || Boolean(dragId);
  const allergy = guest?.diet ? /allerg/i.test(guest.diet) : false;

  const activate = () => {
    if (picked) {
      if (guestId === picked) {
        pick(null);
        return;
      }
      if (place(picked, table.id, index)) pick(null);
      selectTable(table.id);
      return;
    }
    if (guestId) pick(guestId);
    selectTable(table.id, true);
  };

  const label = guest
    ? `${table.name}, seat ${index + 1}: ${guest.name}, ${guest.party}${guest.diet ? `, ${guest.diet}` : ""}. ${isPicked ? "Picked up. Choose another seat to move them." : "Activate to pick up and move."}`
    : `${table.name}, seat ${index + 1}: empty${picked ? `. Place ${guestById[picked]?.name ?? "guest"} here.` : ""}`;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      activate();
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || dragId;
    onOver(null);
    setDragId(null);
    if (id && guestById[id]) {
      place(id, table.id, index);
      selectTable(table.id);
    }
  };

  const base: CSSProperties = {
    position: "absolute",
    left: `${((pos.x - geo.box.x) / geo.box.w) * 100}%`,
    top: `${((pos.y - geo.box.y) / geo.box.h) * 100}%`,
    width: `${(SEAT_D / geo.box.w) * 100}%`,
    aspectRatio: "1",
    transform: "translate(-50%, -50%)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: FONT_SEAT,
    fontWeight: 700,
    pointerEvents: "auto",
    cursor: guest ? "grab" : "pointer",
    userSelect: "none",
    touchAction: "manipulation",
    transition: "box-shadow 120ms, background 120ms",
  };

  const style: CSSProperties = guest
    ? {
        ...base,
        background: `var(--mantine-color-${color}-light)`,
        border: `2px solid var(--mantine-color-${color}-filled)`,
        color: `light-dark(var(--mantine-color-${color}-9), var(--mantine-color-${color}-1))`,
        boxShadow: isPicked
          ? "0 0 0 3px var(--mantine-color-brand-filled), 0 4px 10px rgba(0,0,0,.25)"
          : flagged
            ? "0 0 0 2px var(--mantine-color-red-6)"
            : "0 1px 2px rgba(0,0,0,.12)",
        opacity: dragId === guestId ? 0.45 : 1,
      }
    : {
        ...base,
        background: over || holding ? "var(--mantine-color-brand-light)" : "var(--mantine-color-body)",
        border: `2px dashed ${over || holding ? "var(--mantine-color-brand-filled)" : "light-dark(var(--mantine-color-gray-5), var(--mantine-color-dark-3))"}`,
        color: "var(--mantine-color-brand-filled)",
        boxShadow: over ? "0 0 0 3px var(--mantine-color-brand-filled)" : "none",
      };

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-pressed={guest ? isPicked : undefined}
      data-seat={key}
      draggable={Boolean(guest)}
      style={style}
      onClick={activate}
      onKeyDown={onKeyDown}
      onDragStart={(e: DragEvent<HTMLDivElement>) => {
        if (!guestId) return;
        e.dataTransfer.setData("text/plain", guestId);
        e.dataTransfer.effectAllowed = "move";
        setDragId(guestId);
      }}
      onDragEnd={() => {
        setDragId(null);
        onOver(null);
      }}
      onDragOver={(e: DragEvent<HTMLDivElement>) => {
        if (!dragId) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        onOver(key);
      }}
      onDragLeave={() => onOver(null)}
      onDrop={onDrop}
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      <span aria-hidden>{guest ? initials(guest.name) : holding ? <IconPlus size="45%" stroke={2.5} /> : null}</span>
      {guest?.diet ? (
        <Box
          aria-hidden
          style={{
            position: "absolute",
            right: "-8%",
            bottom: "-8%",
            width: "36%",
            aspectRatio: "1",
            borderRadius: "50%",
            background: allergy ? "var(--mantine-color-red-6)" : "var(--mantine-color-grape-6)",
            border: "1.5px solid var(--mantine-color-body)",
          }}
        />
      ) : null}
    </Box>
  );
}

function TableView({
  table,
  over,
  onOver,
  flaggedGuests,
}: {
  table: TableDef;
  over: string | null;
  onOver: (key: string | null) => void;
  flaggedGuests: Set<string>;
}) {
  const { seating, brokenTables, selectedTable, picked, dragId, place, pick, selectTable, setDragId } =
    usePlan();
  const geo = tableGeometry(table);
  const occ = occupants(seating, table.id);
  const filled = occ.filter(Boolean).length;
  const broken = brokenTables.has(table.id);
  const selected = selectedTable === table.id;
  const discKey = `${table.id}:table`;
  const discOver = over === discKey;
  const full = filled >= table.seats;

  const activate = () => {
    if (picked) {
      if (place(picked, table.id)) pick(null);
      selectTable(table.id);
      return;
    }
    selectTable(table.id, true);
  };

  const label = `${table.name}, ${filled} of ${table.seats} seats filled${broken ? ", a seating rule is broken" : ""}. ${picked ? `Place ${guestById[picked]?.name ?? "guest"} here.` : "Show guests."}`;

  return (
    <Box
      style={{
        position: "absolute",
        ...inRoom(geo.box),
        pointerEvents: "none",
      }}
    >
      <Box
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: geo.round ? "50%" : 18,
          border: broken
            ? "2px dashed var(--mantine-color-red-6)"
            : selected
              ? "2px solid var(--mantine-color-brand-filled)"
              : "2px solid transparent",
          background: broken
            ? "light-dark(var(--mantine-color-red-0), rgba(250,82,82,.1))"
            : selected
              ? "var(--mantine-color-brand-light)"
              : "transparent",
        }}
      />
      <Box
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        data-table={table.id}
        onClick={activate}
        onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            activate();
          }
        }}
        onDragOver={(e: DragEvent<HTMLDivElement>) => {
          if (!dragId) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          onOver(discKey);
        }}
        onDragLeave={() => onOver(null)}
        onDrop={(e: DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          const id = e.dataTransfer.getData("text/plain") || dragId;
          onOver(null);
          setDragId(null);
          if (id && guestById[id]) {
            place(id, table.id);
            selectTable(table.id);
          }
        }}
        style={{
          position: "absolute",
          ...inBox(geo.box, geo.disc),
          pointerEvents: "auto",
          cursor: "pointer",
          borderRadius: geo.round ? "50%" : 8,
          background: discOver
            ? "var(--mantine-color-brand-light)"
            : "light-dark(var(--mantine-color-white), var(--mantine-color-dark-6))",
          border: `2px solid ${
            broken
              ? "var(--mantine-color-red-6)"
              : selected || discOver
                ? "var(--mantine-color-brand-filled)"
                : "light-dark(var(--mantine-color-gray-4), var(--mantine-color-dark-3))"
          }`,
          boxShadow: "0 1px 3px rgba(0,0,0,.12)",
          display: "flex",
          flexDirection: geo.round ? "column" : "row",
          alignItems: "center",
          justifyContent: "center",
          gap: geo.round ? 0 : "0.8em",
          fontSize: FONT_LABEL,
          fontWeight: 700,
          lineHeight: 1.15,
          textAlign: "center",
          userSelect: "none",
          touchAction: "manipulation",
        }}
      >
        <VisuallyHidden>{label}</VisuallyHidden>
        <span aria-hidden>{table.name}</span>
        <span
          aria-hidden
          style={{
            fontWeight: 600,
            color: full
              ? "var(--mantine-color-teal-7)"
              : "light-dark(var(--mantine-color-gray-7), var(--mantine-color-gray-4))",
          }}
        >
          {filled}/{table.seats}
        </span>
      </Box>
      {geo.seats.map((_, i) => {
        const gid = occ[i] ?? null;
        return (
          <Seat
            key={i}
            table={table}
            geo={geo}
            index={i}
            guestId={gid}
            over={over === `${table.id}:${i}`}
            flagged={gid ? flaggedGuests.has(gid) : false}
            onOver={onOver}
          />
        );
      })}
      {broken ? (
        <ThemeIcon
          aria-hidden
          color="red"
          variant="filled"
          radius="xl"
          size={22}
          style={{ position: "absolute", top: geo.round ? "6%" : -6, right: geo.round ? "6%" : -6 }}
        >
          <IconAlertTriangle size={13} />
        </ThemeIcon>
      ) : null}
    </Box>
  );
}

export function RoomPlan() {
  const { rules } = usePlan();
  const [over, setOver] = useState<string | null>(null);
  const flaggedGuests = new Set(
    rules.filter((r) => r.status === "broken").flatMap((r) => r.rule.guests),
  );

  return (
    <Paper withBorder p={0} style={{ overflow: "hidden" }}>
      <Box style={{ overflowX: "auto" }}>
        <Box
          role="group"
          aria-label={`Room plan, ${W} by ${D} metres, drawn to scale`}
          style={{
            position: "relative",
            minWidth: 620,
            aspectRatio: `${W} / ${D}`,
            containerType: "inline-size",
            background: "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))",
            backgroundImage:
              "linear-gradient(to right, light-dark(rgba(0,0,0,.055), rgba(255,255,255,.06)) 1px, transparent 1px), linear-gradient(to bottom, light-dark(rgba(0,0,0,.055), rgba(255,255,255,.06)) 1px, transparent 1px)",
            backgroundSize: `calc(100% / ${W}) calc(100% / ${D})`,
          }}
        >
          <Fixtures />
          {tables.map((t) => (
            <TableView
              key={t.id}
              table={t}
              over={over}
              onOver={setOver}
              flaggedGuests={flaggedGuests}
            />
          ))}
        </Box>
      </Box>
    </Paper>
  );
}
