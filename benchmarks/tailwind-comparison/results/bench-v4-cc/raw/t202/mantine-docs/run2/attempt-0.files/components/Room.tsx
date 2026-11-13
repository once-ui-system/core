"use client";

import { useState, type CSSProperties, type DragEvent } from "react";
import { EVENT, FIXTURES, GUESTS_BY_ID, TABLES, initials, partyColor, partyShade, type TableDef } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import classes from "./room.module.css";

const W = EVENT.room_m.width;
const D = EVENT.room_m.depth;
const SEAT_D = 0.95;
const TABLE_R = 1.0;
const RING = 1.55;
const LONG_H = 1.0;
const LONG_PITCH = 1.2;

interface Geometry {
  w: number;
  h: number;
  surfaceW: number;
  surfaceH: number;
  seats: { cx: number; cy: number }[];
}

function geometry(t: TableDef): Geometry {
  if (t.shape === "round") {
    const size = 2 * (RING + SEAT_D / 2) + 0.1;
    const seats = Array.from({ length: t.seats }, (_, k) => {
      const a = -Math.PI / 2 + ((k + 0.5) * 2 * Math.PI) / t.seats;
      return { cx: RING * Math.cos(a), cy: RING * Math.sin(a) };
    });
    return { w: size, h: size, surfaceW: 2 * TABLE_R, surfaceH: 2 * TABLE_R, seats };
  }
  const perRow = Math.ceil(t.seats / 2);
  const tableW = perRow * LONG_PITCH;
  const rowY = LONG_H / 2 + 0.1 + SEAT_D / 2;
  const seats = Array.from({ length: t.seats }, (_, k) => {
    const top = k < perRow;
    const idx = top ? k : k - perRow;
    const count = top ? perRow : t.seats - perRow;
    return { cx: (idx - (count - 1) / 2) * LONG_PITCH, cy: top ? -rowY : rowY };
  });
  return { w: tableW + 0.6, h: 2 * rowY + SEAT_D + 0.1, surfaceW: tableW, surfaceH: LONG_H, seats };
}

const pct = (n: number) => `${n}%`;

export function Room() {
  const {
    seatMap,
    placements,
    selectedTable,
    activeGuest,
    flaggedTables,
    flaggedGuests,
    draggingId,
    place,
    setDragging,
    tapSeat,
    tapTable,
  } = usePlan();
  const [over, setOver] = useState<string | null>(null);

  const allow = (e: DragEvent) => {
    if (draggingId) e.preventDefault();
  };

  const drop = (e: DragEvent, tableId: string, seat?: number) => {
    e.preventDefault();
    e.stopPropagation();
    const id = draggingId ?? e.dataTransfer.getData("text/plain");
    setOver(null);
    setDragging(null);
    if (id) place(id, tableId, seat);
  };

  return (
    <div className={classes.scroller} role="region" aria-label="Room plan, 24 by 14 metres. Scrolls sideways on narrow screens." tabIndex={0}>
      <div className={classes.room}>
        {FIXTURES.map((f) => (
          <div
            key={f.id}
            className={classes.fixture}
            data-kind={f.kind}
            style={{ left: pct((f.x / W) * 100), top: pct((f.y / D) * 100), width: pct((f.w / W) * 100), height: pct((f.h / D) * 100) }}
          >
            {f.label}
          </div>
        ))}

        {TABLES.map((t) => {
          const g = geometry(t);
          const row = seatMap[t.id] ?? [];
          const filled = row.filter(Boolean).length;
          const flagged = flaggedTables[t.id] ?? 0;
          const selected = selectedTable === t.id;
          const tableLabel = `${t.name}, ${filled} of ${t.seats} seats filled${flagged ? `, ${flagged} broken rule${flagged > 1 ? "s" : ""}` : ""}`;
          return (
            <div
              key={t.id}
              className={classes.wrap}
              style={{
                left: pct((t.x / W) * 100),
                top: pct((t.y / D) * 100),
                width: pct((g.w / W) * 100),
                aspectRatio: `${g.w} / ${g.h}`,
              }}
              onDragOver={allow}
              onDragEnter={() => draggingId && setOver(t.id)}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(null);
              }}
              onDrop={(e) => drop(e, t.id)}
            >
              <button
                type="button"
                className={classes.surface}
                data-shape={t.shape}
                data-selected={selected}
                data-flagged={flagged > 0}
                data-over={over === t.id}
                aria-label={tableLabel}
                aria-pressed={selected}
                onClick={() => tapTable(t.id)}
                style={{
                  left: "50%",
                  top: "50%",
                  width: pct((g.surfaceW / g.w) * 100),
                  height: pct((g.surfaceH / g.h) * 100),
                  aspectRatio: t.shape === "round" ? "1" : undefined,
                }}
              >
                <span className={classes.tName}>{t.name}</span>
                <span className={classes.tCount}>
                  {filled}/{t.seats}
                </span>
                {flagged > 0 && (
                  <span className={classes.flag} aria-hidden>
                    !
                  </span>
                )}
              </button>

              {g.seats.map((pos, i) => {
                const guestId = row[i] ?? null;
                const guest = guestId ? GUESTS_BY_ID[guestId] : undefined;
                const key = `${t.id}:${i}`;
                const style: CSSProperties & Record<string, string | number | undefined> = {
                  left: pct((0.5 + pos.cx / g.w) * 100),
                  top: pct((0.5 + pos.cy / g.h) * 100),
                  width: pct((SEAT_D / g.w) * 100),
                };
                if (guest) style["--seat-color"] = `var(--mantine-color-${partyColor(guest.party)}-${partyShade(guest.party)})`;
                const label = guest
                  ? `${t.name}, seat ${i + 1}: ${guest.name}, ${guest.party}${guest.diet ? `, ${guest.diet}` : ""}${activeGuest === guest.id ? ", selected" : ""}`
                  : `${t.name}, seat ${i + 1}: empty${activeGuest ? `, place ${GUESTS_BY_ID[activeGuest]?.name ?? "guest"} here` : ""}`;
                return (
                  <button
                    key={key}
                    type="button"
                    className={classes.seat}
                    style={style}
                    data-state={guest ? "filled" : "empty"}
                    data-active={guestId !== null && activeGuest === guestId}
                    data-flag={guestId !== null && flaggedGuests.has(guestId) && (flaggedTables[t.id] ?? 0) > 0}
                    data-over={over === key}
                    aria-label={label}
                    title={guest ? `${guest.name}${guest.diet ? ` (${guest.diet})` : ""}` : `Empty seat ${i + 1}`}
                    draggable={guest !== undefined}
                    onClick={() => tapSeat(t.id, i)}
                    onDragStart={(e) => {
                      if (!guestId) return;
                      e.dataTransfer.setData("text/plain", guestId);
                      e.dataTransfer.effectAllowed = "move";
                      setDragging(guestId);
                    }}
                    onDragEnd={() => {
                      setDragging(null);
                      setOver(null);
                    }}
                    onDragOver={allow}
                    onDragEnter={(e) => {
                      if (draggingId) {
                        e.stopPropagation();
                        setOver(key);
                      }
                    }}
                    onDrop={(e) => drop(e, t.id, i)}
                  >
                    {guest ? initials(guest.name) : i + 1}
                    {guest?.diet ? <span className={classes.dot} aria-hidden /> : null}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Used by the panel to remember where each guest sits without re-deriving it. */
export function seatLabel(placements: Record<string, { table: string; seat: number } | null>, guestId: string): string | null {
  const p = placements[guestId];
  if (!p) return null;
  const t = TABLES.find((x) => x.id === p.table);
  return t ? `${t.name}, seat ${p.seat + 1}` : null;
}
