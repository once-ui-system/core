"use client";

import type { KeyboardEvent } from "react";
import { Box } from "@chakra-ui/react";
import { event, fixtures, partyPalette, tables, type TableDef } from "@/lib/data";
import { usePlan } from "@/components/plan-provider";
import {
  RING_R,
  SCALE,
  SEAT_R,
  TABLE_R,
  guestById,
  initials,
  seatPositions,
} from "@/lib/plan";

const PAD = 44;
const W = event.room_m.width * SCALE;
const H = event.room_m.depth * SCALE;
const m = (v: number) => v * SCALE;

const v = (name: string) => `var(--chakra-colors-${name})`;
const palette = (p: string, tone: "solid" | "contrast" | "subtle" | "muted" | "fg") => v(`${p}-${tone}`);

const FIXTURE_STYLE: Record<string, { fill: string; stroke: string; text: string }> = {
  stage: { fill: v("purple-subtle"), stroke: v("purple-solid"), text: v("purple-fg") },
  dancefloor: { fill: v("orange-subtle"), stroke: v("orange-muted"), text: v("orange-fg") },
  bar: { fill: v("teal-subtle"), stroke: v("teal-solid"), text: v("teal-fg") },
  door: { fill: v("green-solid"), stroke: v("green-solid"), text: v("green-fg") },
};

function onKey(fn: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  };
}

function TableShape({ t }: { t: TableDef }) {
  const {
    occ,
    brokenTables,
    brokenGuests,
    selectedTableId,
    selectedGuestId,
    activeGuestId,
    dropTarget,
    activateTable,
    activateSeat,
    beginPress,
    consumeClick,
  } = usePlan();

  const row = occ[t.id];
  const filled = row.filter(Boolean).length;
  const full = filled === t.seats;
  const broken = brokenTables.has(t.id);
  const selected = selectedTableId === t.id;
  const candidate = !!activeGuestId && !full;
  const hovered = dropTarget === `table:${t.id}` || (dropTarget?.startsWith(`seat:${t.id}:`) ?? false);
  const seats = seatPositions(t);
  const long = t.shape === "long";

  const cx = long ? m(t.x + t.seats / 2) : m(t.x);
  const cy = long ? m(t.y + 0.5) : m(t.y);

  const haloStroke = hovered
    ? v("teal-solid")
    : broken
      ? v("red-solid")
      : selected
        ? v("fg")
        : candidate
          ? v("teal-solid")
          : "transparent";
  const haloFill = hovered
    ? v("teal-muted")
    : broken
      ? v("red-subtle")
      : candidate
        ? v("teal-subtle")
        : selected
          ? v("bg-muted")
          : "transparent";

  const tableLabel = `${t.name}, ${filled} of ${t.seats} seats filled${broken ? ", a seating rule is broken" : ""}`;

  return (
    <g data-table={t.id}>
      {long ? (
        <rect
          x={m(t.x) - 22}
          y={m(t.y - 1.05)}
          width={m(t.seats) + 44}
          height={m(2.1) + 0}
          rx={26}
          fill={haloFill}
          stroke={haloStroke}
          strokeWidth={selected || hovered ? 3 : 2}
          strokeDasharray={candidate && !hovered && !selected && !broken ? "6 5" : undefined}
        />
      ) : (
        <circle
          cx={cx}
          cy={cy}
          r={m(RING_R + SEAT_R + 0.15)}
          fill={haloFill}
          stroke={haloStroke}
          strokeWidth={selected || hovered ? 3 : 2}
          strokeDasharray={candidate && !hovered && !selected && !broken ? "6 5" : undefined}
        />
      )}

      {/* table top */}
      <g
        className="sw-focus"
        role="button"
        tabIndex={0}
        aria-label={tableLabel}
        aria-pressed={selected}
        style={{ cursor: "pointer" }}
        onClick={() => {
          if (consumeClick()) return;
          activateTable(t.id);
        }}
        onKeyDown={onKey(() => activateTable(t.id))}
      >
        {long ? (
          <rect x={m(t.x)} y={m(t.y)} width={m(t.seats)} height={m(1)} rx={10} fill={v("bg-panel")} stroke={v("border-emphasized")} strokeWidth={2} />
        ) : (
          <circle cx={cx} cy={cy} r={m(TABLE_R)} fill={v("bg-panel")} stroke={v("border-emphasized")} strokeWidth={2} />
        )}
        <text x={cx} y={long ? cy - 3 : cy - 3} textAnchor="middle" fontSize={long ? 15 : 14} fontWeight={700} fill={v("fg")}>
          {t.name}
        </text>
        <text x={cx} y={cy + 15} textAnchor="middle" fontSize={13} fontWeight={600} fill={full ? v("green-fg") : v("fg-muted")}>
          {filled}/{t.seats}
        </text>
      </g>

      {broken ? (
        <g transform={`translate(${long ? m(t.x + t.seats) + 6 : cx + m(RING_R + 0.35)}, ${long ? m(t.y - 1.0) : cy - m(RING_R + 0.35)})`} aria-hidden>
          <circle r={11} fill={v("red-solid")} stroke={v("bg-panel")} strokeWidth={2} />
          <text y={5} textAnchor="middle" fontSize={14} fontWeight={800} fill={v("red-contrast")}>
            !
          </text>
        </g>
      ) : null}

      {seats.map((s) => {
        const gid = row[s.index];
        const guest = gid ? guestById.get(gid) : undefined;
        const key = `${t.id}:${s.index}`;
        const pal = guest ? (partyPalette[guest.party] ?? "gray") : "gray";
        const isSel = !!gid && selectedGuestId === gid;
        const isBroken = !!gid && brokenGuests.has(gid);
        const isDropHere = dropTarget === `seat:${key}`;
        const label = guest
          ? `${t.name}, seat ${s.index + 1}: ${guest.name}, ${guest.party}${guest.diet ? `, ${guest.diet}` : ""}${isBroken ? ", involved in a broken rule" : ""}`
          : `${t.name}, seat ${s.index + 1}: empty${activeGuestId ? ", place the selected guest here" : ""}`;
        return (
          <g
            key={key}
            data-seat={key}
            className="sw-focus"
            role="button"
            tabIndex={0}
            aria-label={label}
            aria-pressed={guest ? isSel : undefined}
            transform={`translate(${m(s.x)}, ${m(s.y)})`}
            style={{ cursor: guest ? "grab" : "pointer", touchAction: guest ? "none" : "auto" }}
            onPointerDown={guest && gid ? (e) => beginPress(e, gid) : undefined}
            onClick={() => {
              if (consumeClick()) return;
              activateSeat(t.id, s.index);
            }}
            onKeyDown={onKey(() => activateSeat(t.id, s.index))}
          >
            <title>{guest ? `${guest.name} (${guest.party})${guest.diet ? ` - ${guest.diet}` : ""}` : `${t.name}, seat ${s.index + 1} (empty)`}</title>
            <circle r={m(SEAT_R) + 7} fill="transparent" />
            <circle
              r={m(SEAT_R)}
              fill={guest ? palette(pal, "solid") : v("bg-panel")}
              stroke={
                isDropHere ? v("teal-solid") : isBroken ? v("red-solid") : isSel ? v("fg") : guest ? v("bg-panel") : v("border-emphasized")
              }
              strokeWidth={isDropHere || isSel ? 4 : isBroken ? 3.5 : guest ? 1.5 : 1.5}
              strokeDasharray={guest ? undefined : "3 3"}
            />
            {guest ? (
              <text y={4.5} textAnchor="middle" fontSize={12} fontWeight={700} fill={palette(pal, "contrast")} pointerEvents="none">
                {initials(guest.name)}
              </text>
            ) : null}
            {guest?.diet ? (
              <circle cx={m(SEAT_R) * 0.8} cy={-m(SEAT_R) * 0.8} r={5.5} fill={v("yellow-solid")} stroke={v("bg-panel")} strokeWidth={1.5} pointerEvents="none" />
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

export function FloorPlan() {
  const vbW = W + PAD * 2;
  const vbH = H + PAD * 2;
  return (
    <Box overflowX="auto" css={{ WebkitOverflowScrolling: "touch" }}>
      <style>{`.sw-focus{outline:none}.sw-focus:focus-visible{outline:3px solid var(--chakra-colors-teal-solid);outline-offset:2px;border-radius:6px}`}</style>
      <svg
        viewBox={`${-PAD} ${-PAD} ${vbW} ${vbH}`}
        role="group"
        aria-label={`Floor plan of ${event.venue}, ${event.room_m.width} by ${event.room_m.depth} metres, drawn to scale`}
        style={{ display: "block", width: "100%", minWidth: 760, height: "auto", userSelect: "none", WebkitUserSelect: "none" }}
      >
        {/* floor with a metre grid */}
        <defs>
          <pattern id="sw-grid" width={SCALE} height={SCALE} patternUnits="userSpaceOnUse">
            <path d={`M ${SCALE} 0 L 0 0 0 ${SCALE}`} fill="none" stroke={v("border-muted")} strokeWidth={1} />
          </pattern>
        </defs>
        <rect x={0} y={0} width={W} height={H} fill={v("bg-muted")} />
        <rect x={0} y={0} width={W} height={H} fill="url(#sw-grid)" opacity={0.55} />
        <rect x={0} y={0} width={W} height={H} fill="none" stroke={v("fg-muted")} strokeWidth={4} />

        {/* dimensions */}
        <g fill={v("fg-muted")} fontSize={13} fontWeight={600} textAnchor="middle">
          <text x={W / 2} y={-16}>{event.room_m.width} m</text>
          <text transform={`translate(-16 ${H / 2}) rotate(-90)`}>{event.room_m.depth} m</text>
        </g>

        {fixtures.map((f) => {
          const s = FIXTURE_STYLE[f.kind];
          const cx = m(f.x + f.w / 2);
          const cy = m(f.y + f.h / 2);
          const narrow = f.w < 1;
          return (
            <g key={f.id} role="img" aria-label={`${f.label}, ${f.w} by ${f.h} metres`}>
              <rect
                x={m(f.x)}
                y={m(f.y)}
                width={m(f.w)}
                height={m(f.h)}
                rx={f.kind === "door" ? 2 : 10}
                fill={s.fill}
                stroke={s.stroke}
                strokeWidth={f.kind === "door" ? 3 : 2}
                strokeDasharray={f.kind === "dancefloor" ? "8 6" : undefined}
              />
              {narrow ? (
                <text transform={`translate(${m(f.x) + m(f.w) + 16} ${cy}) rotate(-90)`} textAnchor="middle" fontSize={11} fontWeight={700} fill={s.text} letterSpacing={0.5}>
                  {f.label.toUpperCase()}
                </text>
              ) : (
                <text x={cx} y={cy + 5} textAnchor="middle" fontSize={f.kind === "bar" ? 14 : 15} fontWeight={700} fill={s.text} letterSpacing={0.4}>
                  {f.label}
                </text>
              )}
            </g>
          );
        })}

        {tables.map((t) => (
          <TableShape key={t.id} t={t} />
        ))}

        {/* scale bar */}
        <g transform={`translate(${W - m(5)} ${H + 28})`} fill={v("fg-muted")} fontSize={12} fontWeight={600}>
          <rect x={0} y={-6} width={m(5)} height={6} fill="none" stroke={v("fg-muted")} strokeWidth={1.5} />
          <rect x={0} y={-6} width={m(2.5)} height={6} fill={v("fg-muted")} />
          <text x={m(5) + 8} y={0}>5 m</text>
        </g>
      </svg>
    </Box>
  );
}
