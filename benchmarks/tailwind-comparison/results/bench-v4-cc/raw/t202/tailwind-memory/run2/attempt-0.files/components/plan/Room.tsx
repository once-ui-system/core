"use client";

import { TriangleAlert } from "lucide-react";
import { fixtures, guests, tables } from "@/lib/data";
import { guestById, ROOM, SEAT_D, tableGeometry, type Box, type Seating } from "@/lib/plan";
import { initials, partyHue, partyStyle, PARTY_ORDER } from "@/lib/ui";
import type { BeginDrag, DropTarget } from "./types";

const W = ROOM.width;
const H = ROOM.depth;
const left = (x: number) => `${(x / W) * 100}%`;
const top = (y: number) => `${(y / H) * 100}%`;
const wd = (w: number) => `${(w / W) * 100}%`;
const ht = (h: number) => `${(h / H) * 100}%`;
const cq = (m: number) => `${(m / W) * 100}cqw`;
const box = (b: Box) => ({ left: left(b.x), top: top(b.y), width: wd(b.w), height: ht(b.h) });

interface RoomProps {
  seating: Seating;
  selected: string | null;
  armed: string | null;
  hover: DropTarget | null;
  flaggedTables: Set<string>;
  flaggedGuests: Set<string>;
  beginDrag: BeginDrag;
  onSeat: (tableId: string, index: number) => void;
  onTable: (tableId: string) => void;
  onBackground: () => void;
}

const FIXTURE_CLASS: Record<string, string> = {
  stage: "rounded-md bg-stone-800 text-stone-100 shadow",
  dancefloor: "rounded border border-amber-300/80 text-amber-900/70",
  bar: "rounded-md bg-amber-900 text-amber-50 shadow",
  door: "rounded-sm bg-emerald-700 text-emerald-50",
};

export function Room({
  seating,
  selected,
  armed,
  hover,
  flaggedTables,
  flaggedGuests,
  beginDrag,
  onSeat,
  onTable,
  onBackground,
}: RoomProps) {
  const usedParties = PARTY_ORDER.filter((p) => guests.some((g) => g.party === p));

  return (
    <section aria-label="Room plan" className="rounded-2xl border border-line bg-card p-2 shadow-sm sm:p-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1 pb-2 text-xs text-muted">
        <span>
          Drawn to scale, {W} m by {H} m. Drag a guest onto a seat, or tap a guest and then a seat or table.
        </span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Dietary need
          </span>
          <span className="flex items-center gap-1">
            <span aria-hidden className="h-2.5 w-2.5 rounded-full border-2 border-rose-600" /> Rule broken
          </span>
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl">
        <div className="min-w-[760px]">
          <div
            className="@container relative w-full overflow-hidden rounded-xl border-2 border-stone-400/70 bg-[#f4eddf]"
            style={{
              aspectRatio: `${W} / ${H}`,
              backgroundImage:
                "linear-gradient(rgba(90,70,30,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(90,70,30,.07) 1px, transparent 1px)",
              backgroundSize: `${100 / W}% ${100 / H}%`,
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) onBackground();
            }}
          >
            {/* fixtures */}
            {fixtures.map((f) => {
              const vertical = f.kind === "door";
              return (
                <div
                  key={f.id}
                  role="img"
                  aria-label={f.label}
                  className={`pointer-events-none absolute flex items-center justify-center overflow-hidden text-center font-semibold uppercase tracking-wider ${FIXTURE_CLASS[f.kind]}`}
                  style={{
                    ...box(f),
                    fontSize: cq(0.4),
                    writingMode: vertical ? "vertical-rl" : undefined,
                    backgroundImage:
                      f.kind === "dancefloor"
                        ? "repeating-conic-gradient(#f1e4c8 0 25%, #e9d8b4 0 50%)"
                        : undefined,
                    backgroundSize: f.kind === "dancefloor" ? `${200 / f.w}% ${200 / f.h}%` : undefined,
                  }}
                >
                  {f.label}
                </div>
              );
            })}

            {/* scale bar */}
            <div
              aria-hidden
              className="pointer-events-none absolute"
              style={{ left: left(15.5), top: top(13.15), width: wd(5) }}
            >
              <div className="h-1.5 border-x-2 border-b-2 border-stone-500/70" />
              <div className="text-center text-stone-500" style={{ fontSize: cq(0.36) }}>
                5 m
              </div>
            </div>

            {/* tables */}
            {tables.map((t) => {
              const geo = tableGeometry(t);
              const row = seating[t.id];
              const filled = row.filter(Boolean).length;
              const isSel = selected === t.id;
              const flagged = flaggedTables.has(t.id);
              const dropHere = hover !== null && hover.kind !== "tray" && hover.tableId === t.id;
              const round = geo.shape === "round";
              const disc = {
                left: `${((geo.body.x - geo.zone.x) / geo.zone.w) * 100}%`,
                top: `${((geo.body.y - geo.zone.y) / geo.zone.h) * 100}%`,
                width: `${(geo.body.w / geo.zone.w) * 100}%`,
                height: `${(geo.body.h / geo.zone.h) * 100}%`,
              };
              return (
                <div key={t.id}>
                  <button
                    type="button"
                    data-table
                    data-table-id={t.id}
                    aria-pressed={isSel}
                    aria-label={`${t.name}, ${filled} of ${t.seats} seats filled${flagged ? ", breaks a rule" : ""}`}
                    onClick={() => onTable(t.id)}
                    className={`absolute transition-colors ${round ? "rounded-full" : "rounded-2xl"} ${
                      dropHere ? "bg-amber-300/30" : armed ? "bg-brand-500/10" : isSel ? "bg-brand-500/[0.07]" : ""
                    }`}
                    style={box(geo.zone)}
                  >
                    <span
                      className={`absolute flex flex-col items-center justify-center border-2 bg-white shadow-md ${
                        round ? "rounded-full" : "rounded-lg"
                      } ${flagged ? "border-rose-500" : "border-brand-700/60"} ${
                        isSel ? "ring-4 ring-brand-500/50" : ""
                      } ${dropHere ? "ring-4 ring-amber-400" : ""}`}
                      style={disc}
                    >
                      <span className="font-display font-semibold leading-tight" style={{ fontSize: cq(0.42) }}>
                        {t.name}
                      </span>
                      <span
                        className={`tabular-nums leading-tight ${filled === t.seats ? "font-semibold text-brand-700" : "text-muted"}`}
                        style={{ fontSize: cq(0.34) }}
                      >
                        {filled}/{t.seats}
                      </span>
                    </span>
                  </button>

                  {flagged && (
                    <span
                      role="img"
                      aria-label={`${t.name} breaks a rule`}
                      className="pointer-events-none absolute grid place-items-center rounded-full bg-rose-600 text-white shadow"
                      style={{
                        left: left(geo.zone.x + geo.zone.w - 1.15),
                        top: top(geo.zone.y + 0.1),
                        width: cq(0.8),
                        height: cq(0.8),
                      }}
                    >
                      <TriangleAlert className="h-[60%] w-[60%]" aria-hidden />
                    </span>
                  )}

                  {geo.seats.map((p, i) => {
                    const gid = row[i];
                    const g = gid ? guestById[gid] : null;
                    const isArmed = gid !== null && gid === armed;
                    const bad = gid !== null && flaggedGuests.has(gid);
                    const hov = hover !== null && hover.kind === "seat" && hover.tableId === t.id && hover.index === i;
                    const label = g
                      ? `${t.name}, seat ${i + 1}: ${g.name}, ${g.party}, ${g.diet ?? "no dietary needs"}${bad ? ", breaks a rule" : ""}`
                      : `${t.name}, seat ${i + 1}: empty`;
                    return (
                      <button
                        key={i}
                        type="button"
                        data-seat
                        data-table-id={t.id}
                        data-seat-index={i}
                        aria-label={label}
                        aria-pressed={g ? isArmed : undefined}
                        onPointerDown={g ? (e) => beginDrag(e, g.id) : undefined}
                        onClick={() => onSeat(t.id, i)}
                        className={`absolute grid select-none place-items-center rounded-full border-2 transition-shadow ${
                          g ? "cursor-grab shadow-sm" : "border-dashed border-stone-400 bg-white/70 text-stone-400"
                        } ${bad ? "ring-[3px] ring-rose-600" : ""} ${isArmed ? "ring-4 ring-brand-600" : ""} ${
                          hov ? "ring-4 ring-amber-400" : ""
                        } ${!g && armed ? "border-brand-600 bg-brand-50" : ""}`}
                        style={{
                          left: left(p.x - SEAT_D / 2),
                          top: top(p.y - SEAT_D / 2),
                          width: wd(SEAT_D),
                          height: ht(SEAT_D),
                          touchAction: "none",
                          ...(g ? partyStyle(g.party) : {}),
                        }}
                      >
                        <span className="font-semibold leading-none" style={{ fontSize: cq(g ? 0.3 : 0.26) }}>
                          {g ? initials(g.name) : i + 1}
                        </span>
                        {g?.diet && (
                          <span
                            aria-hidden
                            className="absolute -bottom-0.5 -right-0.5 rounded-full bg-amber-500 ring-2 ring-white"
                            style={{ width: "34%", height: "34%" }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 px-1 pt-3 text-xs text-muted" aria-label="Party colours">
        {usedParties.map((p) => (
          <li key={p} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="h-3 w-3 rounded-full border"
              style={{ backgroundColor: `hsl(${partyHue(p)} 62% 91%)`, borderColor: `hsl(${partyHue(p)} 42% 50%)` }}
            />
            {p}
          </li>
        ))}
      </ul>
    </section>
  );
}
