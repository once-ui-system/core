"use client";

import { event, fixtures, tables } from "@/lib/data";
import {
  LONG_DEPTH,
  LONG_LEN,
  ROUND_R,
  guestById,
  initials,
  seatPositions,
} from "@/lib/seating";
import { useSeating } from "./SeatProvider";

const W = event.room_m.width;
const D = event.room_m.depth;
const pctX = (m: number) => `${(m / W) * 100}%`;
const pctY = (m: number) => `${(m / D) * 100}%`;

interface RoomPlanProps {
  selectedTable: string | null;
  armedGuest: string | null;
  dragGuest: string | null;
  dropKey: string | null;
  onTableClick: (tableId: string) => void;
  onSeatClick: (tableId: string, seat: number, occupant: string | null) => void;
  onDropTarget: (key: string | null) => void;
  onDrop: (tableId: string, seat: number | undefined) => void;
  onDragStart: (guestId: string) => void;
  onDragEnd: () => void;
}

export function RoomPlan({
  selectedTable,
  armedGuest,
  dragGuest,
  dropKey,
  onTableClick,
  onSeatClick,
  onDropTarget,
  onDrop,
  onDragStart,
  onDragEnd,
}: RoomPlanProps) {
  const { seats, counts, ruleResults } = useSeating();

  const brokenTables = new Set<string>();
  const brokenGuests = new Set<string>();
  for (const r of ruleResults) {
    if (r.status !== "broken") continue;
    r.tables.forEach((t) => brokenTables.add(t));
    r.rule.guests.forEach((g) => brokenGuests.add(g));
  }

  const holding = armedGuest ?? dragGuest;

  return (
    <div className="sw-room-scroll" role="group" aria-label={`Floor plan of ${event.venue}, ${W} by ${D} metres`}>
      <div className="sw-room">
        {fixtures.map((f) => (
          <div
            key={f.id}
            className={`sw-fixture sw-fixture--${f.kind}`}
            style={{
              left: pctX(f.x),
              top: pctY(f.y),
              width: pctX(f.w),
              height: pctY(f.h),
            }}
          >
            {f.kind === "door" ? null : f.label}
          </div>
        ))}
        {fixtures
          .filter((f) => f.kind === "door")
          .map((f) => (
            <div
              key={`${f.id}-label`}
              className="sw-door-label"
              style={{
                left: pctX(f.x + f.w + 0.12),
                top: pctY(f.y),
                height: pctY(f.h),
              }}
            >
              {f.label}
            </div>
          ))}

        {tables.map((t) => {
          const round = t.shape === "round";
          const flagged = brokenTables.has(t.id);
          const count = counts.perTable[t.id];
          const key = t.id;
          const style = round
            ? {
                left: pctX(t.x - ROUND_R),
                top: pctY(t.y - ROUND_R),
                width: pctX(ROUND_R * 2),
                height: pctY(ROUND_R * 2),
              }
            : {
                left: pctX(t.x),
                top: pctY(t.y),
                width: pctX(LONG_LEN),
                height: pctY(LONG_DEPTH),
                transform: `rotate(${t.rotation ?? 0}deg)`,
              };
          return (
            <button
              key={t.id}
              type="button"
              className={[
                "sw-table",
                round ? "sw-table--round" : "sw-table--long",
                selectedTable === t.id ? "sw-table--selected" : "",
                flagged ? "sw-table--broken" : "",
                dropKey === key ? "sw-table--drop" : "",
              ].join(" ")}
              style={style}
              aria-pressed={selectedTable === t.id}
              aria-label={`${t.name}, ${count} of ${t.seats} seats taken${
                flagged ? ", a rule is broken here" : ""
              }`}
              onClick={() => onTableClick(t.id)}
              onDragOver={(e) => {
                if (!dragGuest) return;
                e.preventDefault();
                onDropTarget(key);
              }}
              onDragLeave={() => onDropTarget(null)}
              onDrop={(e) => {
                e.preventDefault();
                onDrop(t.id, undefined);
              }}
            >
              <span className="sw-table-name" data-text={t.name} />
              <span className="sw-table-count" data-text={`${count}/${t.seats}`} />
            </button>
          );
        })}

        {tables.map((t) => {
          const pos = seatPositions(t);
          return pos.map((p, i) => {
            const occupant = seats[t.id][i];
            const guest = occupant ? guestById.get(occupant) : null;
            const key = `${t.id}:${i}`;
            const armed = occupant !== null && occupant === armedGuest;
            const bad = occupant !== null && brokenGuests.has(occupant);
            const label = guest
              ? `${t.name}, seat ${i + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}${
                  bad ? ", involved in a broken rule" : ""
                }`
              : `${t.name}, seat ${i + 1}, empty`;
            return (
              <button
                key={key}
                type="button"
                className={[
                  "sw-seat",
                  guest ? "sw-seat--filled" : "sw-seat--empty",
                  bad ? "sw-seat--bad" : "",
                  armed ? "sw-seat--armed" : "",
                  dropKey === key ? "sw-seat--drop" : "",
                  !guest && holding ? "sw-seat--target" : "",
                ].join(" ")}
                data-text={guest ? initials(guest.name) : String(i + 1)}
                style={{ left: pctX(p.x), top: pctY(p.y) }}
                aria-label={label}
                title={guest ? guest.name : `${t.name}, seat ${i + 1} (empty)`}
                draggable={guest ? true : undefined}
                onClick={() => onSeatClick(t.id, i, occupant)}
                onDragStart={(e) => {
                  if (!occupant) return;
                  e.dataTransfer.setData("text/plain", occupant);
                  e.dataTransfer.effectAllowed = "move";
                  onDragStart(occupant);
                }}
                onDragEnd={onDragEnd}
                onDragOver={(e) => {
                  if (!dragGuest) return;
                  e.preventDefault();
                  e.stopPropagation();
                  onDropTarget(key);
                }}
                onDragLeave={() => onDropTarget(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDrop(t.id, i);
                }}
              >
                {guest?.diet ? <span className="sw-diet-dot" aria-hidden="true" /> : null}
              </button>
            );
          });
        })}
      </div>
    </div>
  );
}
