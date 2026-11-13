"use client";

import { useState, type DragEvent, type KeyboardEvent } from "react";
import { DIET_COLOR, EVENT, FIXTURES, PARTIES, TABLES, guestById, type PlanTable } from "@/lib/data";
import { seatPoints, tableSize, usePlan } from "@/lib/plan";
import { cssVars, initialsOf, partyColor } from "./bits";

const W = EVENT.room.width;
const D = EVENT.room.depth;

function activate(e: KeyboardEvent, fn: () => void) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fn();
  }
}

export function RoomPlan() {
  const plan = usePlan();
  const [over, setOver] = useState<string | null>(null);

  const dragStart = (e: DragEvent, guestId: string) => {
    e.dataTransfer.setData("text/plain", guestId);
    e.dataTransfer.effectAllowed = "move";
    plan.setDragId(guestId);
  };
  const dragEnd = () => {
    plan.setDragId(null);
    setOver(null);
  };
  const dragged = (e: DragEvent): string | null =>
    plan.dragId ?? (e.dataTransfer.getData("text/plain") || null);

  const onSeat = (t: PlanTable, i: number) => {
    const gid = plan.seats[t.id][i];
    plan.selectTable(t.id);
    if (plan.heldId) {
      if (plan.heldId === gid) plan.hold(null);
      else plan.place(plan.heldId, t.id, i);
    } else if (gid) {
      plan.hold(gid);
    }
  };

  const onDisc = (t: PlanTable) => {
    plan.selectTable(t.id);
    if (plan.heldId) plan.place(plan.heldId, t.id);
  };

  return (
    <section className="sw-card" aria-labelledby="plan-h">
      <div className="sw-planhead">
        <h2 id="plan-h" style={{ margin: 0 }}>
          Room plan
        </h2>
        <span className="sw-sub">
          {EVENT.venue} · {W} m × {D} m · one grid square is 1 m
        </span>
      </div>
      <div className="sw-notice" role="status" aria-live="polite">
        {plan.notice || "Drag a guest to a seat, or tap a guest and then a seat. Tap a table to see its guests."}
      </div>
      <div className="sw-scroll" tabIndex={0} role="group" aria-label="Room plan, scrolls sideways on small screens">
        <div className={`sw-room ${plan.heldId ? "is-placing" : ""}`}>
          <div className="sw-roomin">
            {FIXTURES.map((f) => (
              <div
                key={f.id}
                className={`sw-fx ${f.kind}`}
                style={{
                  left: `${(f.x / W) * 100}%`,
                  top: `${(f.y / D) * 100}%`,
                  width: `${(f.w / W) * 100}%`,
                  height: `${(f.h / D) * 100}%`,
                }}
              >
                <span>{f.label}</span>
              </div>
            ))}

            {TABLES.map((t) => {
              const size = tableSize(t);
              const pts = seatPoints(t);
              const count = plan.tableCount(t.id);
              const broken = plan.brokenTables.has(t.id);
              const cls = [
                "sw-table",
                t.shape,
                plan.selectedTableId === t.id ? "is-selected" : "",
                broken ? "is-broken" : "",
                over === t.id ? "is-over" : "",
                count === t.seats ? "is-full" : "",
              ].join(" ");
              return (
                <div
                  key={t.id}
                  className={cls}
                  style={{
                    left: `${(t.x / W) * 100}%`,
                    top: `${(t.y / D) * 100}%`,
                    width: `calc(var(--m) * ${size.w})`,
                    height: `calc(var(--m) * ${size.h})`,
                  }}
                >
                  <div
                    className="sw-disc"
                    role="button"
                    tabIndex={0}
                    aria-pressed={plan.selectedTableId === t.id}
                    aria-label={`${t.name}, ${count} of ${t.seats} seats filled${broken ? ", a rule is broken here" : ""}. Show guests.`}
                    onClick={() => onDisc(t)}
                    onKeyDown={(e) => activate(e, () => onDisc(t))}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setOver(t.id);
                    }}
                    onDragLeave={() => setOver((o) => (o === t.id ? null : o))}
                    onDrop={(e) => {
                      e.preventDefault();
                      const gid = dragged(e);
                      setOver(null);
                      plan.setDragId(null);
                      if (gid) plan.place(gid, t.id);
                    }}
                  >
                    <span>{t.name}</span>
                    <small>
                      {count}/{t.seats}
                    </small>
                  </div>
                  {broken && (
                    <span className="sw-flag" aria-hidden="true">
                      !
                    </span>
                  )}
                  {pts.map((p, i) => {
                    const gid = plan.seats[t.id][i];
                    const g = gid ? guestById.get(gid) : undefined;
                    const key = `${t.id}:${i}`;
                    const held = !!gid && plan.heldId === gid;
                    const flagged = !!gid && plan.flaggedGuests.has(gid) && broken;
                    const label = g
                      ? `${t.name}, seat ${i + 1}: ${g.name}${g.diet ? `, ${g.diet}` : ""}${flagged ? ", involved in a broken rule" : ""}. ${plan.heldId ? "Swap here" : "Select to move"}.`
                      : `${t.name}, seat ${i + 1}: empty.${plan.heldId ? " Place selected guest here." : ""}`;
                    return (
                      <div
                        key={key}
                        role="button"
                        tabIndex={0}
                        aria-label={label}
                        draggable={!!g}
                        className={[
                          "sw-seat",
                          g ? "" : "empty",
                          held ? "is-held" : "",
                          flagged ? "is-flag" : "",
                          over === key ? "is-over" : "",
                        ].join(" ")}
                        style={{
                          left: `calc(50% + var(--m) * ${p.dx.toFixed(3)})`,
                          top: `calc(50% + var(--m) * ${p.dy.toFixed(3)})`,
                          ...(g ? cssVars({ "--seat": partyColor(g.party) }) : {}),
                        }}
                        title={g ? `${g.name}${g.diet ? ` (${g.diet})` : ""}` : `Empty seat ${i + 1}`}
                        onClick={() => onSeat(t, i)}
                        onKeyDown={(e) => activate(e, () => onSeat(t, i))}
                        onDragStart={(e) => g && dragStart(e, g.id)}
                        onDragEnd={dragEnd}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOver(key);
                        }}
                        onDragLeave={() => setOver((o) => (o === key ? null : o))}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const id = dragged(e);
                          setOver(null);
                          plan.setDragId(null);
                          if (id) plan.place(id, t.id, i);
                        }}
                      >
                        {g ? initialsOf(g.name) : i + 1}
                        {g?.diet && (
                          <i className="sw-dot" style={cssVars({ "--c": DIET_COLOR[g.diet] ?? "#6d8fb3" })} aria-hidden="true" />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="sw-legend" aria-label="Legend">
        {PARTIES.map((p) => (
          <span key={p}>
            <i className="sw-sw" style={cssVars({ "--c": partyColor(p) })} />
            {p}
          </span>
        ))}
        <span>
          <i className="sw-sw" style={{ background: "transparent", border: "1.5px dashed var(--line-strong)" }} />
          Empty seat
        </span>
        <span>Small coloured dot: dietary need</span>
        <span>Red ring and !: broken rule</span>
      </div>
    </section>
  );
}
