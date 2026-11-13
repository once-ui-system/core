"use client";

import { useState, type KeyboardEvent } from "react";
import { event, fixtures, guestById, initials, parties, partyColor, tables, type Table } from "@/lib/data";
import { longSize, roundRadius, seatPoints, SEAT_R } from "@/lib/geometry";
import { seatKey, usePlan } from "@/lib/plan";

type Hover = { x: number; y: number; text: string };

function activate(handler: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handler();
    }
  };
}

export default function FloorPlan() {
  const plan = usePlan();
  const [hover, setHover] = useState<Hover | null>(null);
  const W = event.room.width;
  const D = event.room.depth;
  const placing = plan.holding !== null || plan.drag !== null;
  const over = plan.drag?.over ?? null;

  const onTable = (t: Table) => {
    if (plan.consumeClick()) return;
    if (plan.holding) plan.place(plan.holding, t.id);
    else plan.select(plan.selectedTable === t.id ? null : t.id);
  };

  const onSeat = (t: Table, i: number, guestId: string | undefined) => {
    if (plan.consumeClick()) return;
    if (plan.holding) {
      plan.place(plan.holding, t.id, i);
      return;
    }
    plan.select(t.id);
    if (guestId) plan.hold(guestId);
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`-1.4 -1 ${W + 2.8} ${D + 2}`}
          className="block h-auto w-full min-w-[760px] select-none"
          role="group"
          aria-label={`Room plan, ${W} by ${D} metres, drawn to scale`}
        >
          <defs>
            <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
              <path d="M1 0H0V1" fill="none" stroke="#e7e5e4" strokeWidth="0.03" />
            </pattern>
          </defs>

          <rect
            x={0}
            y={0}
            width={W}
            height={D}
            fill="#fafaf9"
            stroke="#a8a29e"
            strokeWidth={0.12}
            onClick={() => {
              if (!plan.consumeClick()) plan.select(null);
            }}
          />
          <rect x={0} y={0} width={W} height={D} fill="url(#grid)" pointerEvents="none" />

          <text x={W / 2} y={-0.4} textAnchor="middle" fontSize={0.42} fill="#78716c">
            {W} m
          </text>
          <text
            transform={`translate(${W + 0.75} ${D / 2}) rotate(90)`}
            textAnchor="middle"
            fontSize={0.42}
            fill="#78716c"
          >
            {D} m
          </text>
          <g aria-hidden>
            <path d={`M0 ${D + 0.55}H2M0 ${D + 0.4}V${D + 0.7}M2 ${D + 0.4}V${D + 0.7}`} stroke="#78716c" strokeWidth={0.06} fill="none" />
            <text x={2.3} y={D + 0.68} fontSize={0.4} fill="#78716c">
              2 m
            </text>
          </g>

          {fixtures.map((f) => {
            const cx = f.x + f.w / 2;
            const cy = f.y + f.h / 2;
            if (f.kind === "door") {
              return (
                <g key={f.id}>
                  <rect x={f.x} y={f.y} width={f.w} height={f.h} fill="#38bdf8" stroke="#0369a1" strokeWidth={0.05}>
                    <title>{f.label}</title>
                  </rect>
                  <text
                    transform={`translate(-0.5 ${cy}) rotate(-90)`}
                    textAnchor="middle"
                    fontSize={0.42}
                    fill="#0369a1"
                    fontWeight={600}
                  >
                    {f.label}
                  </text>
                </g>
              );
            }
            const style =
              f.kind === "stage"
                ? { fill: "#334155", stroke: "#1e293b", text: "#ffffff" }
                : f.kind === "bar"
                  ? { fill: "#78716c", stroke: "#57534e", text: "#ffffff" }
                  : { fill: "#fef3c7", stroke: "#f59e0b", text: "#92400e" };
            return (
              <g key={f.id}>
                <rect
                  x={f.x}
                  y={f.y}
                  width={f.w}
                  height={f.h}
                  rx={0.15}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={0.06}
                  strokeDasharray={f.kind === "dancefloor" ? "0.25 0.15" : undefined}
                />
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={0.5}
                  fontWeight={600}
                  fill={style.text}
                >
                  {f.label}
                </text>
              </g>
            );
          })}

          {tables.map((t) => {
            const filled = plan.filled[t.id] ?? 0;
            const broken = plan.brokenTables.has(t.id);
            const selected = plan.selectedTable === t.id;
            const tableOver = over?.kind === "table" && over.table === t.id;
            const stroke = broken ? "#e11d48" : selected ? "#0f766e" : "#a8a29e";
            const sw = broken || selected ? 0.12 : 0.06;
            const fill = tableOver ? "#ccfbf1" : selected ? "#f0fdfa" : "#ffffff";
            const label = `${t.name}, ${filled} of ${t.seats} seats filled${broken ? ", a seating rule is broken here" : ""}`;
            const long = t.shape === "long" ? longSize(t) : null;
            const r = roundRadius(t);
            const badge = long ? { x: t.x + long.w / 2, y: t.y - long.d / 2 } : { x: t.x + r * 0.75, y: t.y - r * 0.75 };

            return (
              <g key={t.id}>
                <g
                  role="button"
                  tabIndex={0}
                  aria-label={label}
                  aria-pressed={selected}
                  data-drop="table"
                  data-table={t.id}
                  className="cursor-pointer outline-none"
                  onClick={() => onTable(t)}
                  onKeyDown={activate(() => onTable(t))}
                >
                  {long ? (
                    <>
                      <rect
                        x={t.x - long.w / 2}
                        y={t.y - long.d / 2}
                        width={long.w}
                        height={long.d}
                        rx={0.2}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={sw}
                        transform={`rotate(${t.rotation ?? 0} ${t.x} ${t.y})`}
                      />
                      <rect
                        className="ring"
                        x={t.x - long.w / 2 - 0.12}
                        y={t.y - long.d / 2 - 0.12}
                        width={long.w + 0.24}
                        height={long.d + 0.24}
                        rx={0.3}
                        fill="none"
                        stroke="transparent"
                        transform={`rotate(${t.rotation ?? 0} ${t.x} ${t.y})`}
                      />
                    </>
                  ) : (
                    <>
                      <circle cx={t.x} cy={t.y} r={r} fill={fill} stroke={stroke} strokeWidth={sw} />
                      <circle className="ring" cx={t.x} cy={t.y} r={r + 0.12} fill="none" stroke="transparent" />
                    </>
                  )}
                  <text
                    x={t.x}
                    y={t.y - 0.08}
                    textAnchor="middle"
                    fontSize={0.4}
                    fontWeight={600}
                    fill="#1c1917"
                    pointerEvents="none"
                  >
                    {t.name}
                  </text>
                  <text x={t.x} y={t.y + 0.38} textAnchor="middle" fontSize={0.34} fill="#57534e" pointerEvents="none">
                    {filled}/{t.seats} seated
                  </text>
                </g>
                {broken ? (
                  <g aria-hidden pointerEvents="none">
                    <circle cx={badge.x} cy={badge.y} r={0.28} fill="#e11d48" stroke="#ffffff" strokeWidth={0.05} />
                    <text x={badge.x} y={badge.y} textAnchor="middle" dominantBaseline="central" fontSize={0.38} fontWeight={700} fill="#ffffff">
                      !
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}

          {tables.map((t) =>
            seatPoints(t).map((p, i) => {
              const gid = plan.occupants.get(seatKey(t.id, i));
              const guest = gid ? guestById.get(gid) : undefined;
              const isOver = over?.kind === "seat" && over.table === t.id && over.seat === i;
              const held = gid !== undefined && plan.holding === gid;
              const dragging = gid !== undefined && plan.drag?.guestId === gid;
              const flagged = gid !== undefined && plan.brokenGuests.has(gid);
              const label = guest
                ? `${t.name}, seat ${i + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}${flagged ? ", involved in a broken rule" : ""}. ${plan.holding ? "Swap with held guest" : "Pick up to move"}`
                : `${t.name}, seat ${i + 1}: empty${plan.holding ? ". Seat held guest here" : ""}`;
              return (
                <g
                  key={`${t.id}-${i}`}
                  role="button"
                  tabIndex={0}
                  aria-label={label}
                  aria-pressed={guest ? held : undefined}
                  data-drop="seat"
                  data-table={t.id}
                  data-seat={i}
                  className="cursor-pointer outline-none"
                  style={{ touchAction: guest ? "none" : undefined, opacity: dragging ? 0.4 : 1 }}
                  onClick={() => onSeat(t, i, gid)}
                  onKeyDown={activate(() => onSeat(t, i, gid))}
                  onPointerDown={gid ? (e) => plan.startDrag(e, gid) : undefined}
                  onPointerEnter={() => guest && setHover({ x: p.x, y: p.y - 0.65, text: guest.name })}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => guest && setHover({ x: p.x, y: p.y - 0.65, text: guest.name })}
                  onBlur={() => setHover(null)}
                >
                  <circle className="ring" cx={p.x} cy={p.y} r={SEAT_R + 0.14} fill="none" stroke="transparent" />
                  {guest ? (
                    <>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={SEAT_R}
                        fill={partyColor[guest.party] ?? "#57534e"}
                        stroke={flagged ? "#e11d48" : held ? "#0f766e" : "#ffffff"}
                        strokeWidth={flagged || held ? 0.12 : 0.05}
                        strokeDasharray={held ? "0.15 0.1" : undefined}
                      />
                      <text
                        x={p.x}
                        y={p.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={0.3}
                        fontWeight={700}
                        fill="#ffffff"
                        pointerEvents="none"
                      >
                        {initials(guest.name)}
                      </text>
                      {guest.diet ? (
                        <circle cx={p.x + 0.3} cy={p.y - 0.3} r={0.11} fill="#f59e0b" stroke="#ffffff" strokeWidth={0.04} pointerEvents="none" />
                      ) : null}
                    </>
                  ) : (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={SEAT_R}
                      fill={isOver ? "#99f6e4" : placing ? "#f0fdfa" : "#ffffff"}
                      stroke={placing ? "#14b8a6" : "#a8a29e"}
                      strokeWidth={placing ? 0.08 : 0.05}
                      strokeDasharray="0.12 0.1"
                    />
                  )}
                </g>
              );
            }),
          )}

          {hover && !plan.drag ? (
            <g pointerEvents="none" aria-hidden>
              <rect
                x={Math.min(Math.max(hover.x - (hover.text.length * 0.115 + 0.35), -1.2), W + 1.2 - (hover.text.length * 0.23 + 0.7))}
                y={hover.y - 0.32}
                width={hover.text.length * 0.23 + 0.7}
                height={0.64}
                rx={0.32}
                fill="#1c1917"
              />
              <text
                x={Math.min(Math.max(hover.x - (hover.text.length * 0.115 + 0.35), -1.2), W + 1.2 - (hover.text.length * 0.23 + 0.7)) + (hover.text.length * 0.23 + 0.7) / 2}
                y={hover.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={0.34}
                fill="#ffffff"
              >
                {hover.text}
              </text>
            </g>
          ) : null}
        </svg>
      </div>

      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-stone-100 px-4 py-3 text-xs text-stone-600" aria-label="Legend">
        {parties.map((p) => (
          <li key={p} className="flex items-center gap-1.5">
            <span aria-hidden className="inline-block size-3 rounded-full" style={{ backgroundColor: partyColor[p] }} />
            {p}
          </li>
        ))}
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block size-2.5 rounded-full bg-amber-500" />
          Dietary need
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block size-3 rounded-full border border-dashed border-stone-400" />
          Empty seat
        </li>
      </ul>
    </div>
  );
}
