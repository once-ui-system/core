"use client";

import { Button, Column, Row, Text, VisuallyHidden } from "@once-ui-system/core";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { event, fixtures, tables, type Table } from "@/lib/data";
import {
  LONG_DEPTH,
  LONG_LENGTH,
  ROUND_RING,
  SEAT_SIZE,
  guestById,
  initials,
  seatPoint,
  tableCentre,
  usePlan,
} from "@/lib/plan";

const m = (n: number) => `calc(var(--m) * ${n})`;

type Zone = { left: number; top: number; w: number; h: number };

function zoneOf(t: Table): Zone {
  if (t.shape === "long") return { left: t.x, top: t.y - 1.05, w: LONG_LENGTH, h: LONG_DEPTH + 1.05 };
  const r = ROUND_RING + SEAT_SIZE / 2 + 0.05;
  return { left: t.x - r, top: t.y - r, w: r * 2, h: r * 2 };
}

const fixtureStyle: Record<string, CSSProperties> = {
  stage: { background: "var(--neutral-background-strong)", border: "1px solid var(--neutral-alpha-medium)" },
  dancefloor: {
    background: "var(--brand-alpha-weak)",
    border: "1px dashed var(--brand-alpha-strong)",
  },
  bar: { background: "var(--neutral-background-strong)", border: "1px solid var(--neutral-alpha-medium)" },
  door: { background: "var(--accent-solid-strong)", borderRadius: 2 },
};

export function RoomPlan() {
  const { seatOf, picked, selectedTable, results, occupant, guestsAt, pick, selectTable, place, unseat } = usePlan();
  const [over, setOver] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") pick(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pick]);

  const brokenTables = useMemo(() => {
    const s = new Set<string>();
    for (const r of results) if (r.status === "broken") for (const t of r.tables) s.add(t);
    return s;
  }, [results]);

  const brokenGuests = useMemo(() => {
    const s = new Set<string>();
    for (const r of results) if (r.status === "broken") for (const g of r.rule.guests) if (seatOf[g]) s.add(g);
    return s;
  }, [results, seatOf]);

  const pickedGuest = picked ? guestById.get(picked) : null;
  const dragId = (e: React.DragEvent) => e.dataTransfer.getData("text/plain");

  const onTableClick = (t: Table) => {
    if (picked) place(picked, t.id);
    else selectTable(t.id);
  };

  return (
    <Column gap="12" fillWidth minWidth={0}>
      <Row gap="12" vertical="center" horizontal="between" wrap minHeight="40">
        {pickedGuest ? (
          <>
            <Text variant="label-default-m" onBackground="brand-strong">
              Placing {pickedGuest.name}: tap a seat or a table
            </Text>
            <Row gap="8">
              {seatOf[pickedGuest.id] && (
                <Button size="s" variant="secondary" prefixIcon="personRemove" label="Unseat" onClick={() => unseat(pickedGuest.id)} />
              )}
              <Button size="s" variant="tertiary" label="Cancel" onClick={() => pick(null)} />
            </Row>
          </>
        ) : (
          <Text variant="label-default-m" onBackground="neutral-weak">
            Drag a guest onto a seat or table, or tap a guest and then a seat. Tap a table to see who sits there.
          </Text>
        )}
      </Row>

      <Row
        background="surface"
        border
        radius="l"
        padding="12"
        fillWidth
        overflowX="auto"
        scrollbar="minimal"
      >
        <div style={{ containerType: "inline-size", width: "100%", minWidth: 660 }}>
          <div
            role="group"
            aria-label={`Floor plan of the room, ${event.room_m.width} by ${event.room_m.depth} metres`}
            style={
              {
                "--m": "calc(100cqw / 24)",
                position: "relative",
                width: "100%",
                aspectRatio: `${event.room_m.width} / ${event.room_m.depth}`,
                background: "var(--page-background)",
                border: "2px solid var(--neutral-alpha-strong)",
                borderRadius: 6,
                overflow: "hidden",
                backgroundImage:
                  "linear-gradient(var(--neutral-alpha-weak) 1px, transparent 1px), linear-gradient(90deg, var(--neutral-alpha-weak) 1px, transparent 1px)",
                backgroundSize: `${100 / 24}% ${100 / 14}%`,
              } as CSSProperties
            }
          >
            {fixtures.map((f) => (
              <div
                key={f.id}
                role="img"
                aria-label={f.label}
                style={{
                  position: "absolute",
                  left: m(f.x),
                  top: m(f.y),
                  width: m(f.w),
                  height: m(f.h),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  ...fixtureStyle[f.kind],
                }}
              >
                {f.kind !== "door" && (
                  <span
                    style={{
                      fontSize: "max(10px, calc(var(--m) * 0.42))",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: "var(--neutral-on-background-medium)",
                    }}
                  >
                    {f.label}
                  </span>
                )}
              </div>
            ))}
            {fixtures
              .filter((f) => f.kind === "door")
              .map((f) => (
                <span
                  key={`${f.id}-label`}
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: m(f.x + f.w + 0.1),
                    top: m(f.y),
                    height: m(f.h),
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                    fontSize: "max(9px, calc(var(--m) * 0.36))",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "var(--neutral-on-background-medium)",
                    textAlign: "center",
                  }}
                >
                  {f.label}
                </span>
              ))}

            {tables.map((t) => {
              const z = zoneOf(t);
              const c = tableCentre(t);
              const guestsHere = guestsAt(t.id);
              const flagged = brokenTables.has(t.id);
              const selected = selectedTable === t.id;
              const isOver = over === t.id;
              const full = guestsHere.length >= t.seats;
              const bodyStyle: CSSProperties =
                t.shape === "long"
                  ? { left: m(0), top: m(1.05), width: m(LONG_LENGTH), height: m(LONG_DEPTH), borderRadius: `calc(var(--m) * 0.25)` }
                  : { left: m(c.x - 1.0 - z.left), top: m(c.y - 1.0 - z.top), width: m(2), height: m(2), borderRadius: "50%" };
              return (
                <div
                  key={t.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setOver(t.id);
                  }}
                  onDragLeave={() => setOver((o) => (o === t.id ? null : o))}
                  onDrop={(e) => {
                    e.preventDefault();
                    setOver(null);
                    const id = dragId(e);
                    if (id) place(id, t.id);
                  }}
                  style={{
                    position: "absolute",
                    left: m(z.left),
                    top: m(z.top),
                    width: m(z.w),
                    height: m(z.h),
                    borderRadius: t.shape === "round" ? "50%" : 8,
                    background: isOver ? "var(--brand-alpha-weak)" : "transparent",
                    outline: isOver ? "2px dashed var(--brand-solid-strong)" : "none",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onTableClick(t)}
                    aria-pressed={selected}
                                        style={{
                      position: "absolute",
                      ...bodyStyle,
                      display: "flex",
                      flexDirection: t.shape === "long" ? "row" : "column",
                      gap: t.shape === "long" ? 8 : 0,
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      font: "inherit",
                      padding: 0,
                      background: "var(--surface-background)",
                      color: "var(--neutral-on-background-strong)",
                      border: flagged
                        ? "2px solid var(--danger-solid-strong)"
                        : selected
                          ? "2px solid var(--brand-solid-strong)"
                          : "1px solid var(--neutral-alpha-strong)",
                      boxShadow: selected ? "0 0 0 3px var(--brand-alpha-medium)" : "none",
                    }}
                  >
                    <span style={{ fontSize: "max(10px, calc(var(--m) * 0.42))", fontWeight: 600, lineHeight: 1.1 }}>{t.name}</span>
                    <span
                      style={{
                        fontSize: "max(10px, calc(var(--m) * 0.38))",
                        color: full ? "var(--success-on-background-strong)" : "var(--neutral-on-background-weak)",
                      }}
                    >
                      {guestsHere.length}/{t.seats}
                    </span>
                    <VisuallyHidden>{` seats filled${flagged ? ", a rule is broken" : ""}${full ? ", full" : ""}`}</VisuallyHidden>
                  </button>
                  {flagged && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        right: 0,
                        top: t.shape === "long" ? m(0.9) : 0,
                        width: m(0.8),
                        height: m(0.8),
                        borderRadius: "50%",
                        background: "var(--danger-solid-strong)",
                        color: "var(--danger-on-solid-strong)",
                        fontSize: "max(10px, calc(var(--m) * 0.5))",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      !
                    </span>
                  )}
                  {Array.from({ length: t.seats }, (_, i) => {
                    const p = seatPoint(t, i);
                    const who = occupant(t.id, i);
                    const isPicked = who && picked === who.id;
                    const bad = who && brokenGuests.has(who.id);
                    const label = who
                      ? `Seat ${i + 1}, ${t.name}: ${who.name}${who.diet ? `, ${who.diet}` : ""}`
                      : `Seat ${i + 1}, ${t.name}: empty`;
                    return (
                      <button
                        key={i}
                        type="button"
                        draggable={!!who}
                        title={who ? `${who.name}${who.diet ? ` (${who.diet})` : ""}` : `Empty seat ${i + 1}`}
                        onDragStart={(e) => {
                          if (!who) return;
                          e.dataTransfer.setData("text/plain", who.id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOver(t.id);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOver(null);
                          const id = dragId(e);
                          if (id) place(id, t.id, i);
                        }}
                        onClick={() => {
                          if (picked) {
                            if (!who || who.id !== picked) place(picked, t.id, i);
                            else pick(null);
                          } else if (who) {
                            pick(who.id);
                            selectTable(t.id);
                          } else {
                            selectTable(t.id);
                          }
                        }}
                        style={{
                          position: "absolute",
                          left: m(p.x - z.left - SEAT_SIZE / 2),
                          top: m(p.y - z.top - SEAT_SIZE / 2),
                          width: m(SEAT_SIZE),
                          height: m(SEAT_SIZE),
                          borderRadius: "50%",
                          padding: 0,
                          font: "inherit",
                          fontSize: "max(9px, calc(var(--m) * 0.3))",
                          fontWeight: 600,
                          cursor: who ? "grab" : "pointer",
                          background: who ? "var(--brand-background-strong)" : "transparent",
                          color: "var(--neutral-on-background-strong)",
                          border: bad
                            ? "2px solid var(--danger-solid-strong)"
                            : isPicked
                              ? "2px solid var(--accent-solid-strong)"
                              : who
                                ? "1px solid var(--brand-alpha-strong)"
                                : "1.5px dashed var(--neutral-alpha-strong)",
                          boxShadow: isPicked ? "0 0 0 3px var(--accent-alpha-medium)" : "none",
                        }}
                      >
                        {who ? initials(who.name) : ""}
                        <VisuallyHidden>{` ${label}`}</VisuallyHidden>
                        {who?.diet && (
                          <span
                            aria-hidden="true"
                            style={{
                              position: "absolute",
                              right: -2,
                              top: -2,
                              width: "28%",
                              height: "28%",
                              minWidth: 7,
                              minHeight: 7,
                              borderRadius: "50%",
                              background: "var(--accent-solid-strong)",
                              border: "1px solid var(--surface-background)",
                            }}
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
      </Row>
      <Row gap="16" wrap vertical="center">
        <Legend swatch={{ background: "var(--brand-background-strong)", border: "1px solid var(--brand-alpha-strong)" }} label="Seated guest" />
        <Legend swatch={{ border: "1.5px dashed var(--neutral-alpha-strong)" }} label="Empty seat" />
        <Legend swatch={{ background: "var(--accent-solid-strong)", width: 8, height: 8 }} label="Dietary need" />
        <Legend swatch={{ border: "2px solid var(--danger-solid-strong)" }} label="Broken rule" />
      </Row>
    </Column>
  );
}

function Legend({ swatch, label }: { swatch: CSSProperties; label: string }) {
  return (
    <Row gap="8" vertical="center">
      <span aria-hidden="true" style={{ display: "inline-block", width: 14, height: 14, borderRadius: "50%", ...swatch }} />
      <Text variant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
    </Row>
  );
}
