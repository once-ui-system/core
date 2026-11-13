"use client";

import * as React from "react";
import { DoorOpen, Music, TriangleAlert, Wine } from "lucide-react";
import { FIXTURES, PARTIES, TABLES, initials, partyDot, partyStyle, type Fixture } from "@/lib/data";
import { GUESTS_BY_ID, ROOM, SEAT_D, TABLE_GEOM, type TableGeom } from "@/lib/plan";
import { cn } from "@/lib/utils";
import { useDrag } from "@/components/drag-layer";
import { usePlan } from "@/components/plan-provider";

const px = (m: number) => `${(m / ROOM.w) * 100}%`;
const py = (m: number) => `${(m / ROOM.d) * 100}%`;
const centred = "-translate-x-1/2 -translate-y-1/2";

function FixtureView({ f }: { f: Fixture }) {
  const box: React.CSSProperties = { left: px(f.x), top: py(f.y), width: px(f.w), height: py(f.h) };
  const text: React.CSSProperties = { fontSize: "clamp(9px, 1.15cqw, 13px)" };

  if (f.kind === "door") {
    return (
      <>
        <div
          role="img"
          aria-label={f.label}
          className="absolute rounded-sm bg-emerald-600"
          style={box}
        />
        <span
          aria-hidden="true"
          className="absolute flex items-center gap-1 font-medium text-emerald-800"
          style={{
            left: `calc(${px(f.x + f.w)} + 4px)`,
            top: py(f.y),
            height: py(f.h),
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontSize: "clamp(8px, 1cqw, 12px)",
          }}
        >
          {f.label}
        </span>
      </>
    );
  }

  if (f.kind === "dancefloor") {
    return (
      <div
        role="img"
        aria-label={f.label}
        className="absolute grid place-items-center rounded-md border border-stone-300/80"
        style={{
          ...box,
          backgroundImage:
            "repeating-conic-gradient(oklch(0.93 0.025 85) 0% 25%, oklch(0.965 0.015 85) 0% 50%)",
          backgroundSize: `${(2 / f.w) * 100}% ${(2 / f.h) * 100}%`,
        }}
      >
        <span
          className="rounded-full bg-background/80 px-2.5 py-0.5 font-medium tracking-wide text-stone-600 uppercase"
          style={{ ...text, fontSize: "clamp(8px, 0.95cqw, 12px)" }}
        >
          {f.label}
        </span>
      </div>
    );
  }

  const stage = f.kind === "stage";
  const Icon = stage ? Music : Wine;
  return (
    <div
      role="img"
      aria-label={f.label}
      className={cn(
        "absolute flex flex-col items-center justify-center gap-0.5 rounded-md font-medium shadow-sm",
        stage ? "bg-stone-800 text-stone-50" : "bg-amber-900 text-amber-50",
      )}
      style={{ ...box, ...text }}
    >
      <Icon className="size-[1.4em]" aria-hidden="true" />
      {f.label}
    </div>
  );
}

function TableView({ tableId }: { tableId: string }) {
  const table = TABLES.find((t) => t.id === tableId);
  const geom: TableGeom | undefined = TABLE_GEOM[tableId];
  const {
    seating,
    perTable,
    tableFlags,
    guestFlags,
    selectedTableId,
    pickedId,
    seat,
    pick,
    selectTable,
    setPanel,
  } = usePlan();
  const drag = useDrag();
  if (!table || !geom) return null;

  const list = seating[tableId] ?? [];
  const count = perTable[tableId] ?? 0;
  const flag = tableFlags[tableId];
  const selected = selectedTableId === tableId;
  const overTable =
    drag.over &&
    (drag.over.kind === "table" || drag.over.kind === "seat") &&
    drag.over.tableId === tableId;

  const openTable = () => {
    if (pickedId) {
      seat(pickedId, tableId);
      return;
    }
    selectTable(tableId);
    setPanel("table");
  };

  const onSeat = (index: number, occupant: string | null) => {
    if (pickedId) {
      if (occupant === pickedId) pick(null);
      else seat(pickedId, tableId, index);
      return;
    }
    if (occupant) pick(occupant);
    selectTable(tableId);
    setPanel("table");
  };

  const bodyStyle: React.CSSProperties = geom.round
    ? { left: px(geom.centre.x), top: py(geom.centre.y), width: px(geom.w), aspectRatio: "1" }
    : { left: px(geom.centre.x), top: py(geom.centre.y), width: px(geom.w), height: py(geom.h) };

  return (
    <>
      <button
        type="button"
        data-drop="table"
        data-table={tableId}
        onClick={openTable}
        aria-pressed={selected}
        aria-label={`${table.name}, ${count} of ${table.seats} seats filled${
          flag === "broken" ? ", a rule is broken here" : flag === "open" ? ", a rule is waiting on this table" : ""
        }`}
        className={cn(
          "absolute flex flex-col items-center justify-center border-2 bg-card text-center leading-tight shadow-sm outline-none transition-[box-shadow,border-color]",
          geom.round ? "rounded-full" : "rounded-lg",
          "focus-visible:ring-[3px] focus-visible:ring-ring/60",
          flag === "broken"
            ? "border-red-500"
            : flag === "open"
              ? "border-amber-500"
              : selected
                ? "border-primary"
                : "border-stone-300",
          selected && "ring-4 ring-primary/25",
          overTable && "ring-4 ring-primary/50",
          pickedId && "cursor-copy",
        )}
        style={{ ...bodyStyle, transform: "translate(-50%, -50%)", fontSize: "clamp(9px, 1.15cqw, 13px)" }}
      >
        <span className="font-semibold">{table.name}</span>
        <span className="text-muted-foreground tabular-nums">
          {count}/{table.seats}
        </span>
        {flag ? (
          <span
            aria-hidden="true"
            className={cn(
              "absolute -top-2 -right-2 grid size-5 place-items-center rounded-full text-white shadow",
              flag === "broken" ? "bg-red-600" : "bg-amber-500",
            )}
          >
            <TriangleAlert className="size-3" />
          </span>
        ) : null}
      </button>

      {geom.seats.map((pt, index) => {
        const guestId = list[index] ?? null;
        const guest = guestId ? GUESTS_BY_ID[guestId] : undefined;
        const isOver =
          drag.over?.kind === "seat" && drag.over.tableId === tableId && drag.over.index === index;
        const label = guest
          ? `${guest.name}, ${table.name} seat ${index + 1}${guest.diet ? `, ${guest.diet}` : ""}${
              guestFlags.has(guest.id) ? ", breaks a rule" : ""
            }`
          : `${table.name} seat ${index + 1}, empty`;
        return (
          <button
            key={index}
            type="button"
            data-drop="seat"
            data-table={tableId}
            data-seat={index}
            aria-label={label}
            aria-pressed={guest ? pickedId === guest.id : undefined}
            title={guest ? guest.name : `${table.name}, seat ${index + 1} is empty`}
            onClick={() => onSeat(index, guestId)}
            onPointerDown={guest ? (e) => drag.onPointerDown(e, guest.id) : undefined}
            draggable={false}
            className={cn(
              "absolute z-10 grid select-none place-items-center rounded-full border-2 font-semibold leading-none outline-none transition-[box-shadow,transform,opacity]",
              centred,
              "focus-visible:z-30 focus-visible:ring-[3px] focus-visible:ring-ring",
              guest
                ? "cursor-grab touch-none shadow-sm active:cursor-grabbing"
                : "border-dashed border-stone-300 bg-background/80 text-muted-foreground hover:border-primary",
              guest && guestFlags.has(guest.id) && "ring-2 ring-red-500",
              guest && pickedId === guest.id && "z-20 scale-110 ring-4 ring-primary/60",
              guest && drag.dragId === guest.id && "opacity-35",
              !guest && pickedId && "border-primary bg-accent",
              isOver && "z-20 scale-110 ring-4 ring-primary",
            )}
            style={{
              left: px(pt.x),
              top: py(pt.y),
              width: px(SEAT_D),
              aspectRatio: "1",
              fontSize: "clamp(8px, 1.05cqw, 12px)",
              ...(guest ? partyStyle(guest.party) : undefined),
            }}
          >
            {guest ? initials(guest.name) : null}
            {guest?.diet ? (
              <span
                aria-hidden="true"
                className="absolute -top-0.5 -right-0.5 size-[32%] min-w-1.5 rounded-full bg-amber-500 ring-1 ring-white"
              />
            ) : null}
          </button>
        );
      })}
    </>
  );
}

export function FloorPlan() {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-xs">
      <div className="min-w-[720px] p-3 sm:p-4">
        <div
          role="group"
          aria-label={`Room plan, ${ROOM.w} by ${ROOM.d} metres, drawn to scale`}
          className="relative w-full overflow-hidden rounded-lg border-[3px] border-stone-400"
          style={{
            aspectRatio: `${ROOM.w} / ${ROOM.d}`,
            containerType: "inline-size",
            backgroundColor: "oklch(0.978 0.01 85)",
            backgroundImage:
              "linear-gradient(to right, oklch(0.91 0.01 85) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.91 0.01 85) 1px, transparent 1px)",
            backgroundSize: `${100 / ROOM.w}% ${100 / ROOM.d}%`,
          }}
        >
          {FIXTURES.map((f) => (
            <FixtureView key={f.id} f={f} />
          ))}
          {TABLES.map((t) => (
            <TableView key={t.id} tableId={t.id} />
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {ROOM.w} m by {ROOM.d} m, one grid square is 1 m. Dashed seats are empty; an amber dot marks a
          dietary need; a red ring marks a guest in a broken rule.
        </p>
      </div>
    </div>
  );
}

export function PartyLegend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground" aria-label="Party colours">
      {PARTIES.map((p) => (
        <li key={p} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="size-2.5 rounded-full"
            style={{ backgroundColor: partyDot(p) }}
          />
          {p}
        </li>
      ))}
    </ul>
  );
}

export function TableChips() {
  const { perTable, tableFlags, selectedTableId, selectTable, setPanel, pickedId, seat } = usePlan();
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Seats filled per table">
      {TABLES.map((t) => {
        const n = perTable[t.id] ?? 0;
        const full = n >= t.seats;
        const flag = tableFlags[t.id];
        return (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => {
                if (pickedId) {
                  seat(pickedId, t.id);
                  return;
                }
                selectTable(t.id);
                setPanel("table");
              }}
              aria-pressed={selectedTableId === t.id}
              className={cn(
                "flex h-9 items-center gap-2 rounded-lg border bg-card px-3 text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50",
                selectedTableId === t.id && "border-primary bg-accent",
              )}
            >
              <span className="font-medium">{t.name}</span>
              <span className={cn("tabular-nums", full ? "text-emerald-700" : "text-muted-foreground")}>
                {n}/{t.seats}
              </span>
              {flag ? (
                <TriangleAlert
                  className={cn("size-3.5", flag === "broken" ? "text-red-600" : "text-amber-500")}
                  aria-label={flag === "broken" ? "Rule broken" : "Rule waiting"}
                />
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export { DoorOpen };
