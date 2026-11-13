"use client";

import type { CSSProperties, DragEvent } from "react";
import { FALLBACK_COLOR, FIXTURES, PARTY_COLORS, TABLES, type SeatTable } from "@/lib/data";
import { guestsAt, initials, ROOM, type Assignments } from "@/lib/plan";

interface Props {
  assignments: Assignments;
  brokenTables: Set<string>;
  selectedTable: string | null;
  armedGuest: string | null;
  overTable: string | null;
  onTableClick: (tableId: string) => void;
  onSeatClick: (tableId: string, guestId: string | null) => void;
  onDragStartGuest: (guestId: string) => void;
  onDragEnd: () => void;
  onOverTable: (tableId: string | null) => void;
  onDropGuest: (tableId: string, guestId: string) => void;
}

const pct = (v: number, total: number) => `${(v / total) * 100}%`;

interface Pos {
  left: string;
  top: string;
}

function seatPositions(table: SeatTable): { zoneW: number; zoneH: number; pos: Pos[] } {
  const n = table.seats;
  if (table.shape === "long") {
    const zoneW = 5;
    const zoneH = 3;
    const topCount = Math.ceil(n / 2);
    const bottomCount = n - topCount;
    const pos: Pos[] = [];
    const row = (count: number, y: number) => {
      for (let i = 0; i < count; i += 1) {
        const x = zoneW / 2 + (i - (count - 1) / 2) * 1.1;
        pos.push({ left: pct(x, zoneW), top: pct(y, zoneH) });
      }
    };
    row(topCount, zoneH / 2 - 0.95);
    row(bottomCount, zoneH / 2 + 0.95);
    return { zoneW, zoneH, pos };
  }
  const zone = 4;
  const ring = 1.45;
  const pos: Pos[] = [];
  for (let i = 0; i < n; i += 1) {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    pos.push({
      left: pct(zone / 2 + ring * Math.cos(ang), zone),
      top: pct(zone / 2 + ring * Math.sin(ang), zone),
    });
  }
  return { zoneW: zone, zoneH: zone, pos };
}

export function RoomPlan(props: Props) {
  const {
    assignments,
    brokenTables,
    selectedTable,
    armedGuest,
    overTable,
    onTableClick,
    onSeatClick,
    onDragStartGuest,
    onDragEnd,
    onOverTable,
    onDropGuest,
  } = props;

  const handleDragOver = (e: DragEvent<HTMLDivElement>, tableId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (overTable !== tableId) onOverTable(tableId);
  };

  return (
    <div className="sw-roomwrap" role="group" aria-label={`Room plan, ${ROOM.width} by ${ROOM.depth} metres`} tabIndex={-1}>
      <div className="sw-room">
        {FIXTURES.map((f) => (
          <div
            key={f.id}
            className={`sw-fixture sw-fx-${f.kind}`}
            style={{
              left: pct(f.x, ROOM.width),
              top: pct(f.y, ROOM.depth),
              width: pct(f.w, ROOM.width),
              height: pct(f.h, ROOM.depth),
            }}
          >
            <span>{f.label}</span>
          </div>
        ))}

        {TABLES.map((table) => {
          const { zoneW, zoneH, pos } = seatPositions(table);
          const guests = guestsAt(assignments, table.id);
          const broken = brokenTables.has(table.id);
          const selected = selectedTable === table.id;
          const full = guests.length >= table.seats;
          const zoneStyle: CSSProperties = {
            left: pct(table.x, ROOM.width),
            top: pct(table.y, ROOM.depth),
            width: pct(zoneW, ROOM.width),
            height: pct(zoneH, ROOM.depth),
            transform: `translate(-50%, -50%) rotate(${table.rotation ?? 0}deg)`,
          };
          const bodyStyle: CSSProperties =
            table.shape === "long"
              ? { left: pct((zoneW - 4.4) / 2, zoneW), top: pct((zoneH - 1) / 2, zoneH), width: pct(4.4, zoneW), height: pct(1, zoneH) }
              : { left: "25%", top: "25%", width: "50%", height: "50%" };
          const state = [
            "sw-zone",
            overTable === table.id ? "is-over" : "",
            overTable === table.id && full ? "is-full" : "",
            armedGuest ? "is-armed" : "",
          ]
            .filter(Boolean)
            .join(" ");
          const label = `${table.name}, ${guests.length} of ${table.seats} seats filled${broken ? ", a rule is broken here" : ""}`;
          return (
            <div
              key={table.id}
              className={state}
              style={zoneStyle}
              onDragOver={(e) => handleDragOver(e, table.id)}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onOverTable(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const gid = e.dataTransfer.getData("text/plain");
                onOverTable(null);
                if (gid) onDropGuest(table.id, gid);
              }}
            >
              <button
                type="button"
                className={[
                  "sw-table",
                  table.shape === "long" ? "is-long" : "is-round",
                  selected ? "is-selected" : "",
                  broken ? "is-broken" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={bodyStyle}
                aria-pressed={selected}
                aria-label={label}
                onClick={() => onTableClick(table.id)}
              >
                <span className="sw-table-name">{table.name}</span>
                <span className="sw-table-count">
                  {guests.length}/{table.seats}
                </span>
              </button>
              {broken ? (
                <span
                  className="sw-flag"
                  aria-hidden="true"
                  style={
                    table.shape === "long"
                      ? { left: pct((zoneW + 4.4) / 2, zoneW), top: pct((zoneH - 1) / 2, zoneH) }
                      : { left: "80%", top: "20%" }
                  }
                >
                  !
                </span>
              ) : null}
              {pos.map((p, i) => {
                const g = guests[i];
                const c = g ? (PARTY_COLORS[g.party] ?? FALLBACK_COLOR) : null;
                const seatStyle: CSSProperties = {
                  left: p.left,
                  top: p.top,
                  ...(c ? { background: c.bg, color: c.fg, borderColor: c.edge } : {}),
                };
                const isArmed = g !== undefined && armedGuest === g.id;
                return (
                  <button
                    key={`${table.id}-${i}`}
                    type="button"
                    className={["sw-seat", g ? "is-taken" : "is-empty", g && g.rsvp !== "yes" ? "is-provisional" : "", isArmed ? "is-armed-seat" : ""]
                      .filter(Boolean)
                      .join(" ")}
                    style={seatStyle}
                    draggable={g !== undefined}
                    title={g ? `${g.name}, ${g.party}${g.diet ? `, ${g.diet}` : ""}` : "Empty seat"}
                    aria-label={
                      g
                        ? `Seat ${i + 1} at ${table.name}: ${g.name}${g.diet ? `, ${g.diet}` : ""}`
                        : `Seat ${i + 1} at ${table.name}: empty`
                    }
                    onClick={() => onSeatClick(table.id, g ? g.id : null)}
                    onDragStart={(e) => {
                      if (!g) return;
                      e.dataTransfer.setData("text/plain", g.id);
                      e.dataTransfer.effectAllowed = "move";
                      window.setTimeout(() => onDragStartGuest(g.id), 0);
                    }}
                    onDragEnd={onDragEnd}
                  >
                    {g ? initials(g.name) : ""}
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
