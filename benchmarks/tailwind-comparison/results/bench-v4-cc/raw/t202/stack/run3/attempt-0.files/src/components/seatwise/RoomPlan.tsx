"use client";

import type { KeyboardEvent } from "react";
import { PARTY_COLORS, event, fixtures, guests, tables, type TableDef } from "@/lib/data";
import { SEAT_R, guestById, initials, layoutFor } from "@/lib/plan";
import { usePlanner } from "./PlannerProvider";
import s from "./seatwise.module.css";

const PAD = 0.7;

function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

export function RoomPlan() {
  const { occ, rules, selectedTable, picked, drag, place, pick, selectTable, beginDrag, wasDragged } =
    usePlanner();
  const W = event.room_m.width;
  const D = event.room_m.depth;
  const brokenTables = new Set(rules.filter((r) => r.status === "broken").flatMap((r) => r.tables));

  const activate = (fn: () => void) => ({
    onClick: () => {
      if (wasDragged()) return;
      fn();
    },
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fn();
      }
    },
  });

  const onTable = (t: TableDef) => {
    if (picked) place(picked, t.id);
    else selectTable(t.id);
  };

  const onSeat = (t: TableDef, i: number) => {
    const occId = occ[t.id]?.[i] ?? null;
    if (picked) {
      if (picked === occId) pick(null);
      else place(picked, t.id, i);
      return;
    }
    selectTable(t.id);
  };

  return (
    <div className={s.planScroll}>
      <svg
        className={s.plan}
        viewBox={`${-PAD} ${-PAD} ${W + PAD * 2} ${D + PAD * 2}`}
        role="group"
        aria-label={`Room plan of ${event.venue}, ${W} by ${D} metres, drawn to scale`}
      >
        <defs>
          <pattern id="sw-floor" width="0.5" height="0.5" patternUnits="userSpaceOnUse">
            <rect width="0.5" height="0.5" fill="#f1e7d2" />
            <rect width="0.25" height="0.25" fill="#e6d8b9" />
            <rect x="0.25" y="0.25" width="0.25" height="0.25" fill="#e6d8b9" />
          </pattern>
        </defs>
        <rect x={0} y={0} width={W} height={D} className={s.floor} />

        {fixtures.map((f) => {
          if (f.kind === "door") {
            return (
              <g key={f.id}>
                <rect x={f.x - 0.1} y={f.y} width={f.w + 0.2} height={f.h} className={s.doorGap} />
                <path
                  d={`M ${f.x + f.w} ${f.y} A ${f.h} ${f.h} 0 0 1 ${f.x + f.w + f.h * 0.6} ${f.y + f.h * 0.8}`}
                  className={s.doorSwing}
                />
                <text
                  transform={`translate(1.0 ${f.y + f.h / 2}) rotate(-90)`}
                  textAnchor="middle"
                  className={s.fixtureLabel}
                >
                  {f.label}
                </text>
              </g>
            );
          }
          const cls =
            f.kind === "stage" ? s.stage : f.kind === "bar" ? s.bar : s.dance;
          return (
            <g key={f.id}>
              <rect x={f.x} y={f.y} width={f.w} height={f.h} rx={0.12} className={cls} />
              <text
                x={f.x + f.w / 2}
                y={f.y + f.h / 2 + 0.12}
                textAnchor="middle"
                className={f.kind === "dancefloor" ? s.fixtureLabelDark : s.fixtureLabelLight}
              >
                {f.label}
              </text>
            </g>
          );
        })}
        <rect x={0} y={0} width={W} height={D} className={s.wall} />

        {tables.map((t) => {
          const lay = layoutFor(t);
          const row = occ[t.id] ?? [];
          const filled = row.filter(Boolean).length;
          const selected = selectedTable === t.id;
          const broken = brokenTables.has(t.id);
          const over = drag?.over === `table:${t.id}`;
          const isRound = lay.body.shape === "round";
          const haloR = lay.ring + 0.55;
          const longW = lay.body.shape === "long" ? lay.body.w : 0;
          return (
            <g key={t.id} transform={`translate(${t.x} ${t.y}) rotate(${t.rotation ?? 0})`}>
              <g
                data-drop={`table:${t.id}`}
                role="button"
                tabIndex={0}
                aria-pressed={selected}
                aria-label={`${t.name}, ${filled} of ${t.seats} seats filled${broken ? ", a rule is broken here" : ""}. ${picked ? "Seat the picked guest here" : "Show guests"}`}
                className={cx(s.table, selected && s.tableSelected, broken && s.tableBroken, over && s.tableOver)}
                {...activate(() => onTable(t))}
              >
                {isRound ? (
                  <circle r={haloR} className={s.tableHalo} />
                ) : (
                  <rect
                    x={-longW / 2 - 0.3}
                    y={-1.5}
                    width={longW + 0.6}
                    height={2.3}
                    rx={0.3}
                    className={s.tableHalo}
                  />
                )}
                {lay.body.shape === "round" ? (
                  <circle r={lay.body.r} className={s.tableBody} />
                ) : (
                  <rect
                    x={-lay.body.w / 2}
                    y={-lay.body.h / 2}
                    width={lay.body.w}
                    height={lay.body.h}
                    rx={0.12}
                    className={s.tableBody}
                  />
                )}
                {isRound ? (
                  <>
                    <text y={-0.04} textAnchor="middle" className={s.tableName}>
                      {t.name}
                    </text>
                    <text y={0.27} textAnchor="middle" className={s.tableCount}>
                      {filled}/{t.seats}
                    </text>
                  </>
                ) : (
                  <text y={0.1} textAnchor="middle" className={s.tableName}>
                    {t.name} &middot; {filled}/{t.seats}
                  </text>
                )}
                {broken ? (
                  <g
                    transform={
                      lay.body.shape === "round"
                        ? `translate(${lay.body.r * 0.72} ${-lay.body.r * 0.72})`
                        : `translate(${lay.body.w / 2 - 0.3} 0)`
                    }
                  >
                    <circle r={0.19} className={s.warnBadge} />
                    <text y={0.08} textAnchor="middle" className={s.warnMark}>
                      !
                    </text>
                  </g>
                ) : null}
              </g>

              {lay.seats.map((p, i) => {
                const gid = row[i] ?? null;
                const g = gid ? guestById.get(gid) : undefined;
                const key = `seat:${t.id}:${i}`;
                const isPicked = !!gid && picked === gid;
                const isOver = drag?.over === key;
                const label = g
                  ? `${t.name}, seat ${i + 1}: ${g.name}${g.diet ? `, ${g.diet}` : ""}`
                  : `${t.name}, seat ${i + 1}: empty`;
                return (
                  <g
                    key={key}
                    data-drop={key}
                    transform={`translate(${p.x} ${p.y})`}
                    role="button"
                    tabIndex={0}
                    aria-label={label}
                    className={cx(
                      s.seat,
                      g ? s.seatFilled : s.seatEmpty,
                      !g && picked && s.seatHint,
                      isOver && s.seatOver,
                      isPicked && s.seatPicked,
                    )}
                    onPointerDown={g ? (e) => beginDrag(e, g.id) : undefined}
                    {...activate(() => onSeat(t, i))}
                  >
                    <title>{g ? `${g.name} (${g.party})${g.diet ? `, ${g.diet}` : ""}` : `${t.name}, empty seat ${i + 1}`}</title>
                    <circle r={SEAT_R} className={s.seatCircle} fill={g ? (PARTY_COLORS[g.party] ?? "#5c6670") : undefined} />
                    {g ? (
                      <text y={0.1} textAnchor="middle" className={s.seatText}>
                        {initials(g.name)}
                      </text>
                    ) : (
                      <text y={0.09} textAnchor="middle" className={s.seatPlus}>
                        +
                      </text>
                    )}
                    {g?.diet ? <circle cx={0.26} cy={-0.26} r={0.1} className={s.dietDot} /> : null}
                  </g>
                );
              })}
            </g>
          );
        })}

        <g aria-hidden="true">
          <line x1={W - 2} x2={W} y1={D + 0.4} y2={D + 0.4} className={s.scaleLine} />
          <text x={W - 1} y={D + 0.34} textAnchor="middle" className={s.scaleText} dy="-0.08">
            2 m
          </text>
        </g>
      </svg>
    </div>
  );
}

export function PartyLegend() {
  const parties = Array.from(new Set(guests.map((g) => g.party)));
  return (
    <ul className={s.legend} aria-label="Party colours">
      {parties.map((p) => (
        <li key={p}>
          <span className={s.swatch} style={{ background: PARTY_COLORS[p] ?? "#5c6670" }} />
          {p}
        </li>
      ))}
      <li>
        <span className={s.legendDiet} /> Dietary need
      </li>
      <li>
        <span className={s.legendEmpty} /> Empty seat
      </li>
    </ul>
  );
}
