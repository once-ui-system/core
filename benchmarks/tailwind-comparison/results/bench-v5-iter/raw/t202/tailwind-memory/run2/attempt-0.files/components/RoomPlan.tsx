"use client";

import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { event, fixtures, guestById, parties, partyColor, tables, type Fixture, type Table } from "@/lib/data";
import { filled, initials, longTableLength, tableDiameter } from "@/lib/plan";
import { usePlan } from "./PlanProvider";

const W = event.room_m.width;
const D = event.room_m.depth;
const SEAT = 0.8;

const pctX = (m: number) => `${(m / W) * 100}%`;
const pctY = (m: number) => `${(m / D) * 100}%`;

function seatPositions(t: Table): { x: number; y: number }[] {
  const rad = ((t.rotation ?? 0) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const at = (dx: number, dy: number) => ({ x: t.x + dx * cos - dy * sin, y: t.y + dx * sin + dy * cos });
  if (t.shape === "long") {
    const half = t.seats / 2;
    return Array.from({ length: t.seats }, (_, i) => {
      const side = i < half ? -1 : 1;
      const col = i % half;
      return at((col - (half - 1) / 2) * 1.1, side * 1.1);
    });
  }
  const r = tableDiameter(t) / 2 + 0.7;
  return Array.from({ length: t.seats }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
    return at(Math.cos(a) * r, Math.sin(a) * r);
  });
}

function FixtureShape({ f }: { f: Fixture }) {
  const base: React.CSSProperties = { left: pctX(f.x), top: pctY(f.y), width: pctX(f.w), height: pctY(f.h) };
  if (f.kind === "door") {
    return (
      <div role="img" aria-label={f.label} className="absolute" style={base}>
        <div className="size-full rounded-sm bg-brand-600" />
        <span
          className="absolute left-full top-1/2 ml-1 -translate-y-1/2 text-[10px] font-semibold tracking-wide text-brand-800 uppercase"
          style={{ writingMode: "vertical-rl", transform: "translateY(-50%) rotate(180deg)" }}
        >
          {f.label}
        </span>
      </div>
    );
  }
  const style: Record<Exclude<Fixture["kind"], "door">, string> = {
    stage: "bg-stone-800 text-white",
    dancefloor:
      "bg-[repeating-conic-gradient(#efe6d3_0%_25%,#f8f2e5_0%_50%)] bg-[length:28px_28px] text-stone-700 ring-1 ring-stone-300",
    bar: "bg-amber-800 text-amber-50",
  };
  return (
    <div
      role="img"
      aria-label={f.label}
      className={`absolute grid place-items-center rounded-md text-[11px] font-semibold tracking-wide uppercase ${style[f.kind]}`}
      style={base}
    >
      {f.label}
    </div>
  );
}

export default function RoomPlan() {
  const {
    seatMap, brokenTables, brokenGuests, selectedGuestId, selectedTableId, dragId, setDragId,
    clickSeat, clickTable, seatGuest,
  } = usePlan();
  const [over, setOver] = useState<string | null>(null);

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDragId(id);
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-stone-100 p-2 sm:p-3">
      <div
        className="relative aspect-[24/14] min-w-[680px] overflow-hidden rounded-lg border-2 border-stone-400 bg-[#fbf9f4]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(60,50,30,.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(60,50,30,.06) 1px, transparent 1px)",
          backgroundSize: `${100 / W}% ${100 / D}%`,
        }}
      >
        {fixtures.map((f) => (
          <FixtureShape key={f.id} f={f} />
        ))}

        {tables.map((t) => {
          const isLong = t.shape === "long";
          const w = isLong ? longTableLength(t) : tableDiameter(t);
          const h = isLong ? 1.1 : tableDiameter(t);
          const selected = selectedTableId === t.id;
          const broken = brokenTables.has(t.id);
          const count = filled(seatMap, t.id);
          const full = count === t.seats;
          const key = `table:${t.id}`;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => clickTable(t.id)}
              onDragOver={(e) => {
                if (dragId) {
                  e.preventDefault();
                  setOver(key);
                }
              }}
              onDragLeave={() => setOver((o) => (o === key ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                setOver(null);
                const id = e.dataTransfer.getData("text/plain") || dragId;
                if (id) seatGuest(id, t.id);
                setDragId(null);
              }}
              aria-pressed={selected}
              className={`absolute flex flex-col items-center justify-center border-2 text-center shadow-sm transition-shadow focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600 ${
                isLong ? "rounded-md" : "rounded-full"
              } ${
                broken ? "border-red-500 bg-red-50" : selected ? "border-brand-600 bg-brand-50" : "border-stone-300 bg-white"
              } ${selected ? "shadow-md ring-4 ring-brand-500/25" : ""} ${over === key ? "ring-4 ring-brand-500/50" : ""}`}
              style={{
                left: pctX(t.x),
                top: pctY(t.y),
                width: pctX(w),
                height: pctY(h),
                transform: `translate(-50%, -50%) rotate(${t.rotation ?? 0}deg)`,
              }}
            >
              <span className="text-[11px] font-semibold leading-tight text-stone-800">{t.name}</span>
              <span className={`text-[10px] leading-tight tabular-nums ${full ? "font-semibold text-brand-700" : "text-stone-600"}`}>
                {count}/{t.seats}
              </span>
              <span className="sr-only">
                seats filled{broken ? ", a rule is broken here" : ""}
              </span>
            </button>
          );
        })}

        {tables.map((t) => {
          if (!brokenTables.has(t.id)) return null;
          const dx = t.shape === "long" ? longTableLength(t) / 2 : (tableDiameter(t) / 2) * 0.72;
          const dy = t.shape === "long" ? -0.55 : -(tableDiameter(t) / 2) * 0.72;
          return (
            <span
              key={`flag-${t.id}`}
              aria-hidden="true"
              className="pointer-events-none absolute z-20 grid size-5 place-items-center rounded-full bg-red-600 text-white shadow ring-2 ring-white"
              style={{ left: pctX(t.x + dx), top: pctY(t.y + dy), transform: "translate(-50%, -50%)" }}
            >
              <TriangleAlert className="size-3" />
            </span>
          );
        })}

        {tables.flatMap((t) => {
          const pos = seatPositions(t);
          return pos.map((p, i) => {
            const gid = seatMap[t.id]?.[i] ?? null;
            const g = gid ? guestById[gid] : null;
            const key = `${t.id}:${i}`;
            const isSel = !!gid && gid === selectedGuestId;
            const isBroken = !!gid && brokenGuests.has(gid);
            const label = g
              ? `${t.name}, seat ${i + 1}: ${g.name}${g.diet ? `, ${g.diet}` : ""}${isBroken ? ", rule broken" : ""}`
              : `${t.name}, seat ${i + 1}: empty${selectedGuestId ? ", place selected guest here" : ""}`;
            return (
              <button
                key={key}
                type="button"
                draggable={!!g}
                onDragStart={g ? (e) => onDragStart(e, g.id) : undefined}
                onDragEnd={() => {
                  setDragId(null);
                  setOver(null);
                }}
                onDragOver={(e) => {
                  if (dragId) {
                    e.preventDefault();
                    setOver(key);
                  }
                }}
                onDragLeave={() => setOver((o) => (o === key ? null : o))}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOver(null);
                  const id = e.dataTransfer.getData("text/plain") || dragId;
                  if (id) seatGuest(id, t.id, i);
                  setDragId(null);
                }}
                onClick={() => clickSeat(t.id, i)}
                aria-label={label}
                data-i={g ? initials(g.name) : undefined}
                title={g ? `${g.name}${g.diet ? ` (${g.diet})` : ""}` : `${t.name}, seat ${i + 1} (empty)`}
                className={`absolute z-10 grid place-items-center rounded-full text-[9px] font-bold leading-none transition-transform after:content-[attr(data-i)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
                  g
                    ? "cursor-grab text-white shadow-sm"
                    : "border-2 border-dashed border-stone-400 bg-white/90 text-stone-400 hover:border-brand-600"
                } ${isBroken ? "ring-2 ring-red-600 ring-offset-1" : ""} ${isSel ? "scale-125 ring-2 ring-stone-900 ring-offset-2" : ""} ${
                  over === key ? "scale-125 ring-2 ring-brand-500 ring-offset-2" : ""
                }`}
                style={{
                  left: pctX(p.x),
                  top: pctY(p.y),
                  width: pctX(SEAT),
                  height: pctY(SEAT),
                  translate: "-50% -50%",
                  background: g ? partyColor(g.party) : undefined,
                }}
              >
                {g?.diet && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border border-white bg-amber-400"
                  />
                )}
              </button>
            );
          });
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 px-1 text-xs text-stone-700">
        {parties.map((p) => (
          <span key={p} className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="size-3 rounded-full" style={{ background: partyColor(p) }} />
            {p}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3 rounded-full border-2 border-dashed border-stone-400 bg-white" />
          Empty seat
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-full border border-white bg-amber-400 ring-1 ring-stone-300" />
          Dietary need
        </span>
        <span className="ml-auto inline-flex items-center gap-2">
          <span aria-hidden="true" className="h-1.5 w-16 border-x-2 border-b-2 border-stone-600" />
          5 m
        </span>
      </div>
    </div>
  );
}
