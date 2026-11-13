"use client";

import { useMemo, type KeyboardEvent } from "react";
import { Box, Group, ScrollArea, Text } from "@mantine/core";
import { EVENT, FIXTURES, PARTIES, TABLES, initials, type Guest, type TableDef } from "@/lib/data";
import { useDrag } from "@/lib/drag";
import { usePlan } from "@/lib/plan";
import { partyStyle } from "@/lib/style";
import classes from "./room.module.css";

const SEAT_R = 0.42;

type SeatPos = { x: number; y: number };

function seatPositions(t: TableDef): { pts: SeatPos[]; bodyR: number; ringR: number } {
  if (t.shape === "long") {
    const pts = Array.from({ length: t.seats }, (_, i) => ({ x: t.x + 0.5 + i, y: t.y - 0.62 }));
    return { pts, bodyR: 0, ringR: 0 };
  }
  const bodyR = t.seats <= 6 ? 0.85 : 0.95;
  const ringR = bodyR + 0.58;
  const pts = Array.from({ length: t.seats }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
    return { x: t.x + ringR * Math.cos(a), y: t.y + ringR * Math.sin(a) };
  });
  return { pts, bodyR, ringR };
}

function onKey(fn: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  };
}

export function Room() {
  const { selectedGuest, selectedTable, selectGuest, selectTable, place, occupants, rules } = usePlan();
  const { begin, justDragged, over, dragging } = useDrag();
  const { width, depth } = EVENT.room_m;

  const brokenTables = useMemo(() => new Set(rules.filter((r) => r.status === "broken").flatMap((r) => r.tableIds)), [rules]);
  const brokenGuests = useMemo(
    () => new Set(rules.filter((r) => r.status === "broken").flatMap((r) => r.guestIds)),
    [rules],
  );

  const tapTable = (t: TableDef) => {
    if (justDragged()) return;
    if (selectedGuest) {
      place(selectedGuest, t.id);
      return;
    }
    selectTable(selectedTable === t.id ? null : t.id);
  };

  const tapSeat = (t: TableDef, i: number, who: Guest | null) => {
    if (justDragged()) return;
    if (selectedGuest) {
      place(selectedGuest, t.id, i);
      return;
    }
    selectTable(t.id);
    if (who) selectGuest(who.id);
  };

  return (
    <Box>
      <ScrollArea type="auto" scrollbars="x" offsetScrollbars>
        <svg
          viewBox={`-0.5 -0.5 ${width + 1} ${depth + 1.3}`}
          role="group"
          aria-label={`Room plan, ${width} by ${depth} metres, drawn to scale`}
          style={{ display: "block", width: "100%", minWidth: 680, height: "auto", fontFamily: "inherit" }}
        >
          <defs>
            <pattern id="grid-1m" width="1" height="1" patternUnits="userSpaceOnUse">
              <path d="M 1 0 L 0 0 0 1" fill="none" stroke="var(--mantine-color-gray-5)" strokeOpacity="0.3" strokeWidth="0.03" />
            </pattern>
            <pattern id="dance-checks" width="1" height="1" patternUnits="userSpaceOnUse">
              <rect width="1" height="1" fill="var(--mantine-color-orange-0)" />
              <rect width="0.5" height="0.5" fill="var(--mantine-color-orange-1)" />
              <rect x="0.5" y="0.5" width="0.5" height="0.5" fill="var(--mantine-color-orange-1)" />
            </pattern>
          </defs>

          <rect
            x={0}
            y={0}
            width={width}
            height={depth}
            rx={0.2}
            fill="var(--mantine-color-white)"
            stroke="var(--mantine-color-gray-7)"
            strokeWidth={0.14}
            onClick={() => {
              selectGuest(null);
              selectTable(null);
            }}
          />
          <rect x={0} y={0} width={width} height={depth} rx={0.2} fill="url(#grid-1m)" pointerEvents="none" />

          {FIXTURES.map((f) => {
            const cx = f.x + f.w / 2;
            const cy = f.y + f.h / 2;
            if (f.kind === "dancefloor") {
              return (
                <g key={f.id} pointerEvents="none">
                  <rect x={f.x} y={f.y} width={f.w} height={f.h} rx={0.15} fill="url(#dance-checks)" stroke="var(--mantine-color-orange-4)" strokeWidth={0.06} />
                  <text x={cx} y={cy + 0.18} textAnchor="middle" fontSize={0.55} fontWeight={700} fill="var(--mantine-color-gray-9)">
                    {f.label}
                  </text>
                </g>
              );
            }
            if (f.kind === "stage") {
              return (
                <g key={f.id} pointerEvents="none">
                  <rect x={f.x} y={f.y} width={f.w} height={f.h} rx={0.15} fill="var(--mantine-color-gray-9)" />
                  <text x={cx} y={cy + 0.2} textAnchor="middle" fontSize={0.55} fontWeight={700} fill="var(--mantine-color-white)">
                    {f.label}
                  </text>
                </g>
              );
            }
            if (f.kind === "bar") {
              return (
                <g key={f.id} pointerEvents="none">
                  <rect x={f.x} y={f.y} width={f.w} height={f.h} rx={0.15} fill="var(--mantine-color-gray-7)" />
                  <rect x={f.x + 0.2} y={f.y + 0.2} width={f.w - 0.4} height={f.h - 0.4} rx={0.1} fill="none" stroke="var(--mantine-color-gray-3)" strokeWidth={0.05} strokeOpacity={0.6} />
                  <text x={cx} y={cy + 0.2} textAnchor="middle" fontSize={0.55} fontWeight={700} fill="var(--mantine-color-white)">
                    {f.label}
                  </text>
                </g>
              );
            }
            return (
              <g key={f.id} pointerEvents="none">
                <rect x={f.x} y={f.y} width={f.w} height={f.h} fill="var(--mantine-color-brand-2)" stroke="var(--mantine-color-brand-9)" strokeWidth={0.05} />
                <text
                  transform={`rotate(-90 ${f.x + 0.25} ${cy})`}
                  x={f.x + 0.25}
                  y={cy + 0.1}
                  textAnchor="middle"
                  fontSize={0.3}
                  fontWeight={700}
                  fill="var(--mantine-color-brand-9)"
                >
                  {f.label}
                </text>
              </g>
            );
          })}

          {TABLES.map((t) => {
            const { pts, bodyR, ringR } = seatPositions(t);
            const people = occupants(t.id);
            const taken = people.filter(Boolean).length;
            const selected = selectedTable === t.id;
            const broken = brokenTables.has(t.id);
            const tableOver = over?.kind === "table" && over.table === t.id;
            const cx = t.shape === "long" ? t.x + t.seats / 2 : t.x;
            const cy = t.shape === "long" ? t.y + 0.5 : t.y;
            const label = `${t.name}, ${taken}/${t.seats} seats taken${broken ? ", a rule is broken here" : ""}`;
            const haloR = ringR + SEAT_R + 0.15;
            return (
              <g key={t.id} className={classes.tableGroup}>
                {/* halo: selection, drop target and broken-rule marks */}
                {t.shape === "long" ? (
                  <rect
                    x={t.x - 0.35}
                    y={t.y - 1.45}
                    width={t.seats + 0.7}
                    height={2.95}
                    rx={0.4}
                    fill={selected || tableOver ? "var(--mantine-color-brand-0)" : "transparent"}
                    stroke={broken ? "var(--mantine-color-red-7)" : selected || tableOver ? "var(--mantine-color-brand-7)" : "none"}
                    strokeWidth={0.09}
                    strokeDasharray={broken ? "0.3 0.2" : undefined}
                    data-drop-table={t.id}
                  />
                ) : (
                  <circle
                    cx={t.x}
                    cy={t.y}
                    r={haloR}
                    fill={selected || tableOver ? "var(--mantine-color-brand-0)" : "transparent"}
                    stroke={broken ? "var(--mantine-color-red-7)" : selected || tableOver ? "var(--mantine-color-brand-7)" : "none"}
                    strokeWidth={0.09}
                    strokeDasharray={broken ? "0.3 0.2" : undefined}
                    data-drop-table={t.id}
                  />
                )}

                <g
                  className={classes.focusable}
                  role="button"
                  tabIndex={0}
                  aria-label={`${label}. ${selectedGuest ? "Place the selected guest here" : "Show guests"}`}
                  aria-pressed={selected}
                  onClick={() => tapTable(t)}
                  onKeyDown={onKey(() => tapTable(t))}
                  data-drop-table={t.id}
                >
                  {t.shape === "long" ? (
                    <rect
                      className={classes.tableBody}
                      x={t.x}
                      y={t.y}
                      width={t.seats}
                      height={1}
                      rx={0.2}
                      fill="var(--mantine-color-white)"
                      stroke="var(--mantine-color-gray-7)"
                      strokeWidth={0.07}
                      data-drop-table={t.id}
                    />
                  ) : (
                    <circle className={classes.tableBody} cx={t.x} cy={t.y} r={bodyR} fill="var(--mantine-color-white)" stroke="var(--mantine-color-gray-7)" strokeWidth={0.07} data-drop-table={t.id} />
                  )}
                </g>
                <g aria-hidden="true" className={classes.focusable} onClick={() => tapTable(t)} data-drop-table={t.id}>
                  {t.shape === "long" ? (
                    <text x={cx} y={cy + 0.15} textAnchor="middle" fontSize={0.42} fontWeight={700} fill="var(--mantine-color-gray-9)">
                      {t.name} {taken}/{t.seats}
                    </text>
                  ) : (
                    <>
                      <text x={cx} y={cy - 0.04} textAnchor="middle" fontSize={0.4} fontWeight={700} fill="var(--mantine-color-gray-9)">
                        {t.name}
                      </text>
                      <text x={cx} y={cy + 0.42} textAnchor="middle" fontSize={0.36} fill="var(--mantine-color-gray-8)">
                        {taken}/{t.seats}
                      </text>
                    </>
                  )}
                </g>

                {pts.map((p, i) => {
                  const who = people[i] ?? null;
                  const style = who ? partyStyle(who.party) : null;
                  const seatOver = over?.kind === "seat" && over.table === t.id && over.seat === i;
                  const guestBroken = who ? brokenGuests.has(who.id) : false;
                  const ready = Boolean(selectedGuest) && !who;
                  const seatLabel = who
                    ? `${who.name} (${initials(who.name)}), ${t.name} seat ${i + 1}${who.diet ? `, ${who.diet}` : ""}${guestBroken ? ", involved in a broken rule" : ""}`
                    : `${t.name}, seat ${i + 1}: empty`;
                  const act = () => tapSeat(t, i, who);
                  return (
                    <g key={i}>
                    <g
                      className={`${classes.seat} ${classes.focusable} ${who ? classes.grab : ""}`}
                      role="button"
                      tabIndex={0}
                      aria-label={seatLabel}
                      onClick={act}
                      onKeyDown={onKey(act)}
                      onPointerDown={who ? (e) => begin(e, who.id) : undefined}
                      data-drop-table={t.id}
                      data-drop-seat={i}
                      opacity={who && dragging === who.id ? 0.35 : 1}
                    >
                      <circle cx={p.x} cy={p.y} r={SEAT_R + 0.12} fill="transparent" data-drop-table={t.id} data-drop-seat={i} />
                      <circle
                        className={`${classes.seatCircle} ${ready && !seatOver ? classes.pulse : ""}`}
                        data-empty={who ? "false" : "true"}
                        cx={p.x}
                        cy={p.y}
                        r={SEAT_R}
                        fill={who ? style?.bg : "var(--mantine-color-white)"}
                        stroke={guestBroken ? "var(--mantine-color-red-7)" : seatOver ? "var(--mantine-color-brand-8)" : who ? style?.edge : ready ? "var(--mantine-color-brand-7)" : "var(--mantine-color-gray-5)"}
                        strokeWidth={guestBroken || seatOver ? 0.14 : 0.07}
                        strokeDasharray={who ? undefined : "0.14 0.1"}
                        data-drop-table={t.id}
                        data-drop-seat={i}
                      />
                    </g>
                    <g
                      aria-hidden="true"
                      className={`${classes.focusable} ${who ? classes.grab : ""}`}
                      onClick={act}
                      onPointerDown={who ? (e) => begin(e, who.id) : undefined}
                      data-drop-table={t.id}
                      data-drop-seat={i}
                      opacity={who && dragging === who.id ? 0.35 : 1}
                    >
                      {who ? (
                        <text x={p.x} y={p.y + 0.14} textAnchor="middle" fontSize={0.36} fontWeight={700} fill={style?.fg} pointerEvents="none">
                          {initials(who.name)}
                        </text>
                      ) : (
                        <text x={p.x} y={p.y + 0.13} textAnchor="middle" fontSize={0.34} fill="var(--mantine-color-gray-7)" pointerEvents="none">
                          {i + 1}
                        </text>
                      )}
                      {who?.diet ? <circle cx={p.x + 0.34} cy={p.y - 0.34} r={0.14} fill="var(--mantine-color-orange-7)" stroke="var(--mantine-color-white)" strokeWidth={0.05} pointerEvents="none" /> : null}
                    </g>
                    </g>
                  );
                })}

                {broken ? (
                  <g pointerEvents="none" transform={`translate(${t.shape === "long" ? t.x + t.seats + 0.1 : t.x + haloR * 0.72} ${t.shape === "long" ? t.y - 1.35 : t.y - haloR * 0.72})`}>
                    <circle r={0.38} fill="var(--mantine-color-red-7)" stroke="var(--mantine-color-white)" strokeWidth={0.06} />
                    <text y={0.17} textAnchor="middle" fontSize={0.52} fontWeight={800} fill="var(--mantine-color-white)">
                      !
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}

          <g pointerEvents="none" fill="var(--mantine-color-gray-7)" fontSize={0.36}>
            <path d={`M 0 ${depth + 0.45} H 2 M 0 ${depth + 0.35} V ${depth + 0.55} M 2 ${depth + 0.35} V ${depth + 0.55}`} stroke="var(--mantine-color-gray-7)" strokeWidth={0.05} fill="none" />
            <text x={2.2} y={depth + 0.58}>
              2 m
            </text>
            <text x={width} y={depth + 0.58} textAnchor="end">
              {width} m × {depth} m · {EVENT.venue}
            </text>
          </g>
        </svg>
      </ScrollArea>

      <Group gap="md" mt="xs" wrap="wrap" aria-label="Legend" role="group">
        {PARTIES.map((p) => {
          const s = partyStyle(p);
          return (
            <Group key={p} gap={6} wrap="nowrap">
              <Box w={14} h={14} style={{ borderRadius: "50%", background: s.bg, border: `1.5px solid ${s.edge}` }} aria-hidden />
              <Text size="xs" c="gray.8">
                {p}
              </Text>
            </Group>
          );
        })}
        <Group gap={6} wrap="nowrap">
          <Box w={10} h={10} style={{ borderRadius: "50%", background: "var(--mantine-color-orange-7)" }} aria-hidden />
          <Text size="xs" c="gray.8">
            Dietary need
          </Text>
        </Group>
        <Group gap={6} wrap="nowrap">
          <Box w={14} h={14} style={{ borderRadius: "50%", border: "2px solid var(--mantine-color-red-7)" }} aria-hidden />
          <Text size="xs" c="gray.8">
            Rule broken
          </Text>
        </Group>
      </Group>
    </Box>
  );
}
