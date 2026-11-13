"use client";

import type { KeyboardEvent } from "react";
import Box from "@mui/material/Box";
import {
  FALLBACK_PARTY_COLOR,
  event,
  firstName,
  fixtures,
  guestById,
  initials,
  partyColors,
  tables,
  type PlanTable,
} from "@/lib/data";
import { LONG_H, LONG_W, SEAT_R, roundBodyRadius, seatSpots, tableReach } from "@/lib/geometry";
import { usePlan } from "@/lib/plan";
import type { DropTarget, StartDrag } from "./useGuestDrag";

interface FloorPlanProps {
  selectedTableId: string | null;
  focusGuestId: string | null;
  armedGuestId: string | null;
  showNames: boolean;
  dragGuestId: string | null;
  dropTarget: DropTarget;
  startDrag: StartDrag;
  onTableClick: (tableId: string) => void;
  onSeatClick: (tableId: string, seat: number) => void;
}

const W = event.room_m.width;
const D = event.room_m.depth;
const PAD_X = 1.5;
const PAD_Y = 1.0;

// Every colour below is a CSS variable the theme generates (see app/theme.ts), so the plan follows
// the light and dark schemes.
const plan = (k: string) => `var(--mui-palette-plan-${k})`;
const C = {
  floor: plan("floor"),
  wall: plan("wall"),
  grid: plan("grid"),
  tableFill: plan("tableFill"),
  tableStroke: plan("tableStroke"),
  stage: plan("stage"),
  stageText: plan("stageText"),
  dance: plan("dance"),
  danceLine: plan("danceLine"),
  bar: plan("bar"),
  door: plan("door"),
  seatEmpty: plan("seatEmpty"),
  text: plan("text"),
  muted: plan("muted"),
  diet: plan("diet"),
  accent: "var(--mui-palette-primary-main)",
  danger: "var(--mui-palette-error-main)",
  warn: "var(--mui-palette-warning-main)",
  white: "var(--mui-palette-common-white)",
};

export default function FloorPlan(props: FloorPlanProps) {
  return (
    <Box sx={{ overflowX: "auto", overscrollBehaviorX: "contain", borderRadius: 2 }}>
      <svg
        viewBox={`${-PAD_X} ${-PAD_Y} ${W + PAD_X * 2} ${D + PAD_Y * 2}`}
        style={{ display: "block", width: "100%", minWidth: 700, height: "auto" }}
        role="group"
        aria-label={`Floor plan of ${event.venue}, ${W} by ${D} metres, drawn to scale`}
        fontFamily="inherit"
      >
        <defs>
          <pattern id="sw-grid" width="1" height="1" patternUnits="userSpaceOnUse">
            <path d="M 1 0 L 0 0 0 1" fill="none" stroke={C.grid} strokeWidth="0.03" />
          </pattern>
          <pattern id="sw-dance" width="1" height="1" patternUnits="userSpaceOnUse">
            <rect width="0.5" height="0.5" fill={C.danceLine} opacity="0.55" />
            <rect x="0.5" y="0.5" width="0.5" height="0.5" fill={C.danceLine} opacity="0.55" />
          </pattern>
        </defs>

        {/* Room */}
        <rect x={0} y={0} width={W} height={D} fill={C.floor} />
        <rect x={0} y={0} width={W} height={D} fill="url(#sw-grid)" />
        <rect x={0} y={0} width={W} height={D} fill="none" stroke={C.wall} strokeWidth={0.16} />

        {/* Dimensions and scale */}
        <text x={W / 2} y={-0.4} textAnchor="middle" fontSize={0.38} fill={C.muted}>
          {W} m
        </text>
        <text
          x={W + 0.55}
          y={D / 2}
          textAnchor="middle"
          fontSize={0.38}
          fill={C.muted}
          transform={`rotate(90 ${W + 0.55} ${D / 2})`}
        >
          {D} m
        </text>
        <g aria-hidden="true">
          <line x1={0} y1={D + 0.55} x2={5} y2={D + 0.55} stroke={C.muted} strokeWidth={0.07} />
          <line x1={0} y1={D + 0.4} x2={0} y2={D + 0.7} stroke={C.muted} strokeWidth={0.07} />
          <line x1={5} y1={D + 0.4} x2={5} y2={D + 0.7} stroke={C.muted} strokeWidth={0.07} />
          <text x={5.3} y={D + 0.55} fontSize={0.36} dominantBaseline="central" fill={C.muted}>
            5 m
          </text>
        </g>

        {/* Fixtures */}
        {fixtures.map((f) => {
          const cx = f.x + f.w / 2;
          const cy = f.y + f.h / 2;
          if (f.kind === "door") {
            return (
              <g key={f.id}>
                <rect x={f.x - 0.08} y={f.y} width={f.w + 0.16} height={f.h} rx={0.08} fill={C.door} />
                <text
                  x={-0.6}
                  y={cy}
                  textAnchor="middle"
                  fontSize={0.4}
                  fontWeight={600}
                  fill={C.text}
                  transform={`rotate(-90 -0.6 ${cy})`}
                >
                  {f.label}
                </text>
              </g>
            );
          }
          const dance = f.kind === "dancefloor";
          const fill = f.kind === "stage" ? C.stage : f.kind === "bar" ? C.bar : C.dance;
          return (
            <g key={f.id}>
              <rect
                x={f.x}
                y={f.y}
                width={f.w}
                height={f.h}
                rx={dance ? 0.1 : 0.2}
                fill={fill}
                stroke={dance ? C.danceLine : "none"}
                strokeWidth={0.05}
              />
              {dance && <rect x={f.x} y={f.y} width={f.w} height={f.h} rx={0.1} fill="url(#sw-dance)" />}
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={dance ? 0.55 : 0.46}
                fontWeight={700}
                letterSpacing={dance ? 0.08 : 0}
                fill={f.kind === "stage" ? C.stageText : C.text}
                stroke={dance ? C.dance : "none"}
                strokeWidth={dance ? 0.18 : 0}
                style={dance ? { paintOrder: "stroke" } : undefined}
              >
                {f.label}
              </text>
            </g>
          );
        })}

        {/* Tables */}
        {tables.map((t) => (
          <TableShape key={t.id} table={t} {...props} />
        ))}
      </svg>
    </Box>
  );
}

function TableShape({
  table: t,
  selectedTableId,
  focusGuestId,
  armedGuestId,
  showNames,
  dragGuestId,
  dropTarget,
  startDrag,
  onTableClick,
  onSeatClick,
}: FloorPlanProps & { table: PlanTable }) {
  const { seats, brokenByTable } = usePlan();
  const row = seats[t.id] ?? [];
  const taken = row.filter(Boolean).length;
  const spots = seatSpots(t);
  const reach = tableReach(t);
  const selected = selectedTableId === t.id;
  const broken = brokenByTable[t.id] ?? [];
  const isDropTarget = dropTarget !== null && dropTarget.type !== "unseat" && dropTarget.tableId === t.id;
  const full = taken >= t.seats;
  const dragging = dragGuestId !== null;
  const draggedHere = dragGuestId !== null && row.includes(dragGuestId);
  const dropBlocked = isDropTarget && full && !draggedHere;

  const label =
    `${t.name}, ${taken} of ${t.seats} seats taken` +
    (broken.length ? `, ${broken.length} seating ${broken.length === 1 ? "rule" : "rules"} broken` : "");

  const onKey = (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onTableClick(t.id);
    }
  };

  const bodyFill = isDropTarget
    ? `color-mix(in srgb, ${dropBlocked ? C.danger : C.accent} 24%, ${C.tableFill})`
    : selected
      ? `color-mix(in srgb, ${C.accent} 12%, ${C.tableFill})`
      : C.tableFill;

  return (
    <g
      transform={`translate(${t.x} ${t.y}) rotate(${t.rotation ?? 0})`}
      data-drop-table={t.id}
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={selected}
      onClick={() => onTableClick(t.id)}
      onKeyDown={onKey}
      style={{ cursor: armedGuestId || dragging ? "copy" : "pointer" }}
    >
      {/* Generous hit area so drops and taps near the table count */}
      <circle r={reach + 0.25} fill="transparent" />

      {/* Rings: selection (solid), drop target (dashed) and broken rule (dashed, red) */}
      {selected && <circle r={reach + 0.2} fill="none" stroke={C.accent} strokeWidth={0.1} opacity={0.9} />}
      {isDropTarget && !selected && (
        <circle
          r={reach + 0.2}
          fill="none"
          stroke={dropBlocked ? C.danger : C.accent}
          strokeWidth={0.1}
          strokeDasharray="0.3 0.2"
        />
      )}
      {broken.length > 0 && (
        <g>
          <circle r={reach + 0.5} fill="none" stroke={C.danger} strokeWidth={0.1} strokeDasharray="0.35 0.22" />
          <g transform={`translate(${reach * 0.72} ${-reach * 0.72})`}>
            <circle r={0.34} fill={C.danger} stroke={C.floor} strokeWidth={0.07} />
            <text aria-hidden="true" textAnchor="middle" dominantBaseline="central" fontSize={0.46} fontWeight={800} fill={C.white}>
              !
            </text>
          </g>
        </g>
      )}

      {/* Table body */}
      {t.shape === "round" ? (
        <circle r={roundBodyRadius(t)} fill={bodyFill} stroke={C.tableStroke} strokeWidth={0.08} />
      ) : (
        <rect
          x={-LONG_W / 2}
          y={-LONG_H / 2}
          width={LONG_W}
          height={LONG_H}
          rx={0.25}
          fill={bodyFill}
          stroke={C.tableStroke}
          strokeWidth={0.08}
        />
      )}
      <text aria-hidden="true" textAnchor="middle" y={-0.14} dominantBaseline="central" fontSize={0.3} fontWeight={700} fill={C.text}>
        {t.name}
      </text>
      <text
        aria-hidden="true"
        textAnchor="middle"
        y={0.2}
        dominantBaseline="central"
        fontSize={0.28}
        fontWeight={600}
        fill={full ? C.muted : C.warn}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {taken}/{t.seats}
      </text>

      {/* Seats */}
      {spots.map((s, i) => {
        const guestId = row[i] ?? null;
        const guest = guestId ? guestById[guestId] : null;
        const color = guest ? (partyColors[guest.party] ?? FALLBACK_PARTY_COLOR) : null;
        const isFocus = guestId !== null && guestId === focusGuestId;
        const isArmed = guestId !== null && guestId === armedGuestId;
        const isGhost = guestId !== null && guestId === dragGuestId;
        const seatHover =
          dropTarget !== null && dropTarget.type === "seat" && dropTarget.tableId === t.id && dropTarget.seat === i;
        const lx = s.x + s.dx * (SEAT_R + 0.1);
        const ly = s.y + s.dy * (SEAT_R + 0.1) + s.dy * 0.17;
        const anchor = s.dx > 0.4 ? "start" : s.dx < -0.4 ? "end" : "middle";
        return (
          <g
            key={i}
            data-seat-table={t.id}
            data-seat-index={i}
            aria-hidden="true"
            style={{ touchAction: "none", cursor: guest ? "grab" : "inherit" }}
            onPointerDown={guestId ? (e) => startDrag(e, guestId) : undefined}
            onClick={(e) => {
              e.stopPropagation();
              onSeatClick(t.id, i);
            }}
          >
            <title>
              {guest
                ? `${guest.name}, ${guest.party}${guest.diet ? `, ${guest.diet}` : ""}`
                : `${t.name}, seat ${i + 1} is empty`}
            </title>
            <circle cx={s.x} cy={s.y} r={SEAT_R + 0.08} fill="transparent" />
            {guest && color ? (
              <>
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={SEAT_R}
                  fill={color}
                  opacity={isGhost ? 0.35 : 1}
                  stroke={isFocus || isArmed ? C.text : C.floor}
                  strokeWidth={isFocus || isArmed ? 0.12 : 0.05}
                />
                <text
                  x={s.x}
                  y={s.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={0.3}
                  fontWeight={700}
                  fill={C.white}
                  pointerEvents="none"
                  opacity={isGhost ? 0.5 : 1}
                >
                  {initials(guest.name)}
                </text>
                {guest.diet && (
                  <circle
                    cx={s.x + SEAT_R * 0.72}
                    cy={s.y - SEAT_R * 0.72}
                    r={0.15}
                    fill={C.diet}
                    stroke={C.floor}
                    strokeWidth={0.05}
                    pointerEvents="none"
                  />
                )}
                {showNames && (
                  <text
                    aria-hidden="true"
                    x={lx}
                    y={ly}
                    textAnchor={anchor}
                    dominantBaseline="central"
                    fontSize={0.34}
                    fontWeight={isFocus ? 800 : 600}
                    fill={C.text}
                    stroke={C.floor}
                    strokeWidth={0.12}
                    strokeLinejoin="round"
                    pointerEvents="none"
                    style={{ paintOrder: "stroke" }}
                  >
                    {firstName(guest.name)}
                  </text>
                )}
              </>
            ) : (
              <circle
                cx={s.x}
                cy={s.y}
                r={SEAT_R - 0.04}
                fill={seatHover ? `color-mix(in srgb, ${C.accent} 35%, transparent)` : "none"}
                stroke={seatHover ? C.accent : C.seatEmpty}
                strokeWidth={seatHover ? 0.12 : 0.07}
                strokeDasharray={seatHover ? undefined : "0.16 0.12"}
              />
            )}
          </g>
        );
      })}
    </g>
  );
}
