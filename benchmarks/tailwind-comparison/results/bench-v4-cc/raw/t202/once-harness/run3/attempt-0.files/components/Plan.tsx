"use client";

import { useMemo, useState, type CSSProperties, type DragEvent } from "react";
import {
  FIXTURES,
  GUEST_BY_ID,
  ROOM,
  TABLES,
  initials,
  type Fixture,
  type TableDef,
} from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { C, resetButton } from "./ui";

const SEAT = 0.66;
const ROUND_BOX = 3.2;
const ROUND_TOP = 1.8;
const ROUND_RING = 1.22;
const LONG_W = 6.6;
const LONG_H = 2.8;
const LONG_TOP_W = 5.4;
const LONG_TOP_H = 1.1;

function boxOf(t: TableDef): { w: number; h: number } {
  return t.shape === "long" ? { w: LONG_W, h: LONG_H } : { w: ROUND_BOX, h: ROUND_BOX };
}

/** Seat centres in metres, relative to the table's box. */
function seatCentres(t: TableDef): Array<{ x: number; y: number }> {
  const { w, h } = boxOf(t);
  if (t.shape === "round") {
    return Array.from({ length: t.seats }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
      return { x: w / 2 + ROUND_RING * Math.cos(a), y: h / 2 + ROUND_RING * Math.sin(a) };
    });
  }
  const perSide = Math.ceil(t.seats / 2);
  const spacing = 1.3;
  const out: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < t.seats; i += 1) {
    const top = i < perSide;
    const idx = top ? i : i - perSide;
    const count = top ? perSide : t.seats - perSide;
    out.push({
      x: w / 2 + (idx - (count - 1) / 2) * spacing,
      y: top ? h / 2 - 0.97 : h / 2 + 0.97,
    });
  }
  return out;
}

const px = (m: number, of: number) => `${(m / of) * 100}%`;

function fixtureStyle(f: Fixture): CSSProperties {
  const base: CSSProperties = {
    position: "absolute",
    left: px(f.x, ROOM.width),
    top: px(f.y, ROOM.depth),
    width: px(f.w, ROOM.width),
    height: px(f.h, ROOM.depth),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 600,
    color: C.textWeak,
    boxSizing: "border-box",
    pointerEvents: "none",
  };
  switch (f.kind) {
    case "stage":
      return { ...base, background: C.lineWeak, border: `1px solid ${C.lineStrong}`, borderRadius: 6 };
    case "dancefloor":
      return { ...base, background: C.brandTint, border: `1px dashed ${C.brand}`, borderRadius: 6 };
    case "bar":
      return { ...base, background: C.lineWeak, border: `1px solid ${C.lineStrong}`, borderRadius: 6 };
    default:
      return { ...base, background: C.warning, borderRadius: 2 };
  }
}

export function Plan() {
  const { seating, selectedTable, armed, results, tableOf, place, unseat, selectTable, arm, stats } =
    usePlan();
  const [over, setOver] = useState<string | null>(null);

  const brokenTables = useMemo(() => {
    const set = new Set<string>();
    for (const r of results) if (r.status === "broken") for (const id of r.tables) set.add(id);
    return set;
  }, [results]);

  const readDragged = (e: DragEvent): string | null => {
    const id = e.dataTransfer.getData("text/plain");
    return GUEST_BY_ID[id] ? id : null;
  };

  const onTable = (t: TableDef) => {
    if (armed) place(armed, t.id);
    else selectTable(selectedTable === t.id ? null : t.id);
  };

  const onSeat = (t: TableDef, i: number) => {
    const occupant = seating[t.id][i];
    if (armed) {
      if (armed === occupant) arm(null);
      else place(armed, t.id, i);
      return;
    }
    selectTable(t.id);
    if (occupant) arm(occupant);
  };

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.line}`,
        borderRadius: 16,
        padding: 12,
      }}
    >
      <div style={{ overflowX: "auto", paddingBottom: 4 }}>
        <div style={{ minWidth: 760 }}>
          <div
            role="group"
            aria-label={`Room plan, ${ROOM.width} by ${ROOM.depth} metres, drawn to scale`}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: `${ROOM.width} / ${ROOM.depth}`,
              background: C.page,
              backgroundImage: `linear-gradient(to right, ${C.lineWeak} 1px, transparent 1px), linear-gradient(to bottom, ${C.lineWeak} 1px, transparent 1px)`,
              backgroundSize: `${100 / ROOM.width}% ${100 / ROOM.depth}%`,
              border: `2px solid ${C.lineStrong}`,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {FIXTURES.map((f) => (
              <div key={f.id} style={fixtureStyle(f)}>
                {f.kind === "door" ? (
                  <span
                    style={{
                      position: "absolute",
                      left: "100%",
                      top: "50%",
                      transform: "translateY(-50%) rotate(180deg)",
                      writingMode: "vertical-rl",
                      marginLeft: 3,
                      fontSize: 10,
                      whiteSpace: "nowrap",
                      color: C.textWeak,
                    }}
                  >
                    {f.label}
                  </span>
                ) : (
                  f.label
                )}
              </div>
            ))}

            {TABLES.map((t) => {
              const box = boxOf(t);
              const seats = seatCentres(t);
              const info = stats.perTable[t.id];
              const isSelected = selectedTable === t.id;
              const isBroken = brokenTables.has(t.id);
              const isOver = over === t.id;
              const topW = t.shape === "long" ? LONG_TOP_W : ROUND_TOP;
              const topH = t.shape === "long" ? LONG_TOP_H : ROUND_TOP;
              const ring = isOver || isSelected ? C.brand : isBroken ? C.danger : C.lineStrong;
              return (
                <div
                  key={t.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (over !== t.id) setOver(t.id);
                  }}
                  onDragLeave={() => setOver((cur) => (cur === t.id ? null : cur))}
                  onDrop={(e) => {
                    e.preventDefault();
                    setOver(null);
                    const id = readDragged(e);
                    if (id) place(id, t.id);
                  }}
                  style={{
                    position: "absolute",
                    left: px(t.x - box.w / 2, ROOM.width),
                    top: px(t.y - box.h / 2, ROOM.depth),
                    width: px(box.w, ROOM.width),
                    aspectRatio: `${box.w} / ${box.h}`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onTable(t)}
                    aria-pressed={isSelected}
                    aria-label={`${t.name}, ${info.filled} of ${info.cap} seats filled${
                      isBroken ? ", a seating rule is broken" : ""
                    }`}
                    style={{
                      ...resetButton,
                      position: "absolute",
                      left: px((box.w - topW) / 2, box.w),
                      top: px((box.h - topH) / 2, box.h),
                      width: px(topW, box.w),
                      height: px(topH, box.h),
                      borderRadius: t.shape === "round" ? "50%" : 10,
                      background: isOver ? C.brandTint : isBroken ? C.dangerTint : C.surface,
                      border: `${isSelected || isBroken || isOver ? 3 : 2}px solid ${ring}`,
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      gap: 1,
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.1, color: C.text }}>
                      {t.name}
                    </span>
                    <span style={{ fontSize: 10, lineHeight: 1.1, color: isBroken ? C.danger : C.textWeak, fontWeight: 600 }}>
                      {info.filled}/{info.cap}
                      {isBroken ? " !" : ""}
                    </span>
                  </button>

                  {seats.map((c, i) => {
                    const gid = seating[t.id][i];
                    const guest = gid ? GUEST_BY_ID[gid] : null;
                    const isArmed = gid !== null && gid === armed;
                    return (
                      <button
                        key={i}
                        type="button"
                        draggable={guest !== null}
                        onDragStart={(e) => {
                          if (!gid) return;
                          e.dataTransfer.setData("text/plain", gid);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (over !== t.id) setOver(t.id);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOver(null);
                          const id = readDragged(e);
                          if (id) place(id, t.id, i);
                        }}
                        onClick={() => onSeat(t, i)}
                        aria-label={
                          guest
                            ? `${t.name}, seat ${i + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}`
                            : `${t.name}, seat ${i + 1}: empty`
                        }
                        title={guest ? `${guest.name}${guest.diet ? ` (${guest.diet})` : ""}` : `Empty seat ${i + 1}`}
                        style={{
                          ...resetButton,
                          position: "absolute",
                          left: px(c.x - SEAT / 2, box.w),
                          top: px(c.y - SEAT / 2, box.h),
                          width: px(SEAT, box.w),
                          aspectRatio: "1 / 1",
                          borderRadius: "50%",
                          boxSizing: "border-box",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 9,
                          fontWeight: 700,
                          background: guest ? C.brandBg : "transparent",
                          color: guest ? C.brandOn : C.textWeak,
                          border: guest
                            ? `${isArmed ? 3 : 1}px solid ${isArmed ? C.text : C.brand}`
                            : `1.5px dashed ${C.lineStrong}`,
                          cursor: "pointer",
                        }}
                      >
                        {guest ? initials(guest.name) : ""}
                        {guest && guest.diet ? (
                          <span
                            aria-hidden="true"
                            style={{
                              position: "absolute",
                              top: -2,
                              right: -2,
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: C.accent,
                              border: `1.5px solid ${C.surface}`,
                            }}
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 16,
              marginTop: 10,
              fontSize: 12,
              color: C.textWeak,
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  width: px(5, ROOM.width),
                  minWidth: 60,
                  height: 6,
                  borderLeft: `2px solid ${C.text}`,
                  borderRight: `2px solid ${C.text}`,
                  borderBottom: `2px solid ${C.text}`,
                  boxSizing: "border-box",
                }}
              />
              5 m
            </span>
            <span>
              Room {ROOM.width} × {ROOM.depth} m
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: "50%", background: C.brandBg, border: `1px solid ${C.brand}` }} />
              Seated
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: "50%", border: `1.5px dashed ${C.lineStrong}` }} />
              Empty seat
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent }} />
              Dietary need
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: "50%", border: `3px solid ${C.danger}` }} />
              Rule broken
            </span>
            {armed && tableOf[armed] ? null : null}
          </div>
        </div>
      </div>
    </div>
  );
}
