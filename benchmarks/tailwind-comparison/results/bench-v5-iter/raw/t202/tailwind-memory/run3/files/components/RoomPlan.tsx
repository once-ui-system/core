"use client";

import { useEffect, useState, type CSSProperties, type DragEvent } from "react";
import { TriangleAlert, Undo2, X, ZoomIn } from "lucide-react";
import { EVENT, FIXTURES, PARTIES, TABLES, type Fixture, type Table } from "@/lib/data";
import {
  LONG_H,
  ROUND_D,
  SEAT_D,
  firstName,
  guestById,
  initials,
  partyColor,
  seatPositions,
  tableCenter,
} from "@/lib/plan";
import { usePlan } from "./PlanProvider";

const { width: ROOM_W, depth: ROOM_D } = EVENT.room_m;
const pctX = (m: number) => `${(m / ROOM_W) * 100}%`;
const pctY = (m: number) => `${(m / ROOM_D) * 100}%`;

const ZOOMS = [
  { label: "Fit", value: 1 },
  { label: "150%", value: 1.5 },
  { label: "200%", value: 2 },
];

const FIXTURE_STYLE: Record<Fixture["kind"], string> = {
  stage: "rounded-md bg-stone-800 text-stone-100",
  dancefloor: "rounded-md border border-amber-300 bg-amber-100/70 text-amber-900",
  bar: "rounded-md bg-amber-900 text-amber-50",
  door: "rounded-sm bg-brand-700 text-white",
};

export function RoomPlan() {
  const plan = usePlan();
  const { seats, selectedGuest, selectedTable, canUndo, undo, selectGuest } = plan;
  const [zoom, setZoom] = useState(1);
  const [hover, setHover] = useState<string | null>(null);
  const held = selectedGuest ? guestById[selectedGuest] : null;

  useEffect(() => {
    if (!selectedGuest) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") selectGuest(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedGuest, selectGuest]);

  const readDrop = (e: DragEvent): string | null => {
    e.preventDefault();
    setHover(null);
    const id = e.dataTransfer.getData("text/plain");
    return guestById[id] ? id : null;
  };

  const startDrag = (e: DragEvent, guestId: string) => {
    e.dataTransfer.setData("text/plain", guestId);
    e.dataTransfer.effectAllowed = "move";
  };

  const allowDrop = (e: DragEvent, key: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (hover !== key) setHover(key);
  };

  return (
    <section aria-labelledby="plan-title" className="min-w-0">
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="mr-auto">
          <h1 id="plan-title" className="text-xl font-semibold tracking-tight text-stone-900">
            Room plan
          </h1>
          <p className="text-sm text-stone-500">
            {ROOM_W} × {ROOM_D} m, drawn to scale. Each grid square is 1 m.
          </p>
        </div>
        <div role="group" aria-label="Zoom" className="flex items-center rounded-lg bg-stone-200/70 p-1 print:hidden">
          <ZoomIn size={16} aria-hidden="true" className="mx-1.5 text-stone-500" />
          {ZOOMS.map((z) => (
            <button
              key={z.label}
              type="button"
              aria-pressed={zoom === z.value}
              onClick={() => setZoom(z.value)}
              className={`min-h-9 rounded-md px-3 text-sm font-medium ${
                zoom === z.value ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {z.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          className="flex min-h-11 items-center gap-2 rounded-lg border border-stone-300 bg-white px-3.5 text-sm font-medium text-stone-800 hover:bg-stone-50 disabled:opacity-40 print:hidden"
        >
          <Undo2 size={16} aria-hidden="true" />
          Undo
        </button>
      </div>

      {held ? (
        <div
          role="status"
          className="mb-3 flex items-center gap-3 rounded-xl border border-brand-300 bg-brand-50 px-4 py-2.5 text-sm text-brand-900"
        >
          <span className="flex-1">
            Placing <strong className="font-semibold">{held.name}</strong>. Tap an empty seat or a table, or tap a
            seated guest to swap.
          </span>
          <button
            type="button"
            onClick={() => selectGuest(null)}
            className="flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 font-medium hover:bg-brand-100"
          >
            <X size={15} aria-hidden="true" />
            Cancel
          </button>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div
          className="@container relative"
          style={{
            width: `${zoom * 100}%`,
            minWidth: 760 * zoom,
            aspectRatio: `${ROOM_W} / ${ROOM_D}`,
            backgroundColor: "oklch(0.975 0.008 85)",
            backgroundImage:
              "linear-gradient(to right, oklch(0.5 0.02 85 / 0.09) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.5 0.02 85 / 0.09) 1px, transparent 1px)",
            backgroundSize: `${100 / ROOM_W}% ${100 / ROOM_D}%`,
          }}
        >
          {FIXTURES.map((f) => (
            <FixtureBox key={f.id} fixture={f} />
          ))}

          {TABLES.map((t) => (
            <TableView
              key={t.id}
              table={t}
              hover={hover}
              onDragStart={startDrag}
              allowDrop={allowDrop}
              clearHover={() => setHover(null)}
              readDrop={readDrop}
              selected={selectedTable === t.id}
              guestIds={seats[t.id]}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-stone-600">
        <span className="flex items-center gap-1.5">
          <span className="size-4 rounded-full border border-dashed border-stone-400 bg-white" /> Empty seat
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-amber-400 ring-1 ring-stone-300" /> Dietary need
        </span>
        <span className="flex items-center gap-1.5">
          <span className="grid size-4 place-items-center rounded-full bg-red-600 text-white">
            <TriangleAlert size={10} aria-hidden="true" />
          </span>
          Broken rule
        </span>
        <span className="hidden h-4 w-px bg-stone-300 sm:block" />
        {PARTIES.map((p) => (
          <span key={p} className="flex items-center gap-1.5">
            <span className="size-3 rounded-full" style={{ backgroundColor: partyColor(p) }} />
            {p}
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs text-stone-500 sm:hidden">Swipe the plan sideways to see the whole room.</p>
    </section>
  );
}

function FixtureBox({ fixture: f }: { fixture: Fixture }) {
  const vertical = f.kind === "door";
  return (
    <div
      className={`absolute grid place-items-center overflow-hidden font-medium ${FIXTURE_STYLE[f.kind]}`}
      style={{
        left: pctX(f.x),
        top: pctY(f.y),
        width: pctX(f.w),
        height: pctY(f.h),
        fontSize: "max(9px, 1.05cqw)",
      }}
      role="img"
      aria-label={f.label}
    >
      <span
        className="whitespace-nowrap uppercase tracking-wider"
        style={vertical ? { writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: "max(8px, 0.8cqw)" } : undefined}
      >
        {f.label}
      </span>
    </div>
  );
}

interface TableViewProps {
  table: Table;
  guestIds: (string | null)[];
  selected: boolean;
  hover: string | null;
  onDragStart: (e: DragEvent, guestId: string) => void;
  allowDrop: (e: DragEvent, key: string) => void;
  clearHover: () => void;
  readDrop: (e: DragEvent) => string | null;
}

function TableView({ table, guestIds, selected, hover, onDragStart, allowDrop, clearHover, readDrop }: TableViewProps) {
  const { flagsByTable, brokenGuests, selectedGuest, perTable, place, selectGuest, selectTable } = usePlan();
  const flagCount = flagsByTable[table.id]?.length ?? 0;
  const broken = flagCount > 0;
  const count = perTable[table.id];
  const full = count >= table.seats;
  const c = tableCenter(table);
  const round = table.shape === "round";
  const w = round ? ROUND_D : table.seats;
  const h = round ? ROUND_D : LONG_H;
  const positions = seatPositions(table);
  const isHover = hover === `${table.id}:body`;

  const onTableTap = () => {
    if (selectedGuest) place(selectedGuest, table.id);
    else selectTable(selected ? null : table.id);
  };

  const label = `seats filled${
    broken ? `, ${flagCount} broken rule${flagCount > 1 ? "s" : ""}` : ""
  }`;

  return (
    <>
      <button
        type="button"
        aria-pressed={selected}
        onClick={onTableTap}
        onDragOver={(e) => allowDrop(e, `${table.id}:body`)}
        onDragLeave={clearHover}
        onDrop={(e) => {
          const id = readDrop(e);
          if (id) place(id, table.id);
        }}
        className={`absolute grid place-content-center border-2 text-center shadow-sm transition-colors ${
          round ? "rounded-full" : "rounded-lg"
        } ${
          isHover
            ? "border-brand-600 bg-brand-100"
            : selected
              ? "border-brand-600 bg-brand-50"
              : broken
                ? "border-red-500 bg-red-50"
                : "border-stone-300 bg-white hover:border-stone-400"
        }`}
        style={{
          left: pctX(c.x - w / 2),
          top: pctY(c.y - h / 2),
          width: pctX(w),
          height: pctY(h),
          fontSize: "max(9px, 1.05cqw)",
        }}
      >
        <span className="block font-semibold leading-tight text-stone-900">{table.name}</span>
        <span className="sr-only"> {label}</span>
        <span
          className={`block text-[0.85em] font-medium tabular-nums leading-tight ${
            full ? "text-brand-800" : "text-stone-600"
          }`}
        >
          {count}/{table.seats}
        </span>
        {broken ? (
          <span className="absolute -right-1.5 -top-1.5 grid size-[1.7em] place-items-center rounded-full bg-red-600 text-white ring-2 ring-white">
            <TriangleAlert style={{ width: "62%", height: "62%" }} aria-hidden="true" />
          </span>
        ) : null}
      </button>

      {positions.map((pos, i) => {
        const gid = guestIds[i];
        const guest = gid ? guestById[gid] : null;
        const key = `${table.id}:${i}`;
        const isHeld = Boolean(guest && selectedGuest === guest.id);
        const isBroken = Boolean(guest && brokenGuests.has(guest.id));
        const hovered = hover === key;
        const aria = guest
          ? `${initials(guest.name)} ${table.name}, seat ${i + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}${
              isBroken ? ", broken rule" : ""
            }`
          : `${table.name}, seat ${i + 1}: empty`;

        const onSeatTap = () => {
          if (selectedGuest) {
            if (guest && guest.id === selectedGuest) selectGuest(null);
            else place(selectedGuest, table.id, i);
          } else if (guest) {
            selectGuest(guest.id);
            selectTable(table.id);
          } else {
            selectTable(table.id);
          }
        };

        const seatStyle: CSSProperties = {
          left: pctX(pos.x),
          top: pctY(pos.y),
          width: pctX(SEAT_D),
          aspectRatio: "1",
          transform: "translate(-50%, -50%)",
          fontSize: "max(8px, 0.95cqw)",
          ...(guest ? { backgroundColor: partyColor(guest.party) } : null),
        };

        return (
          <div key={key}>
            <button
              type="button"
              aria-label={aria}
              aria-pressed={guest ? isHeld : undefined}
              title={guest ? `${guest.name}${guest.diet ? ` · ${guest.diet}` : ""}` : `${table.name}, seat ${i + 1}`}
              draggable={Boolean(guest)}
              onDragStart={guest ? (e) => onDragStart(e, guest.id) : undefined}
              onDragOver={(e) => allowDrop(e, key)}
              onDragLeave={clearHover}
              onDrop={(e) => {
                const id = readDrop(e);
                if (id) place(id, table.id, i);
              }}
              onClick={onSeatTap}
              className={`absolute grid place-items-center rounded-full font-semibold leading-none transition-transform ${
                guest
                  ? "text-white shadow"
                  : `border border-dashed bg-white/90 text-stone-400 ${
                      selectedGuest ? "border-brand-500 ring-2 ring-brand-200" : "border-stone-400"
                    } hover:border-brand-600 hover:bg-brand-50`
              } ${isBroken ? "ring-2 ring-red-600 ring-offset-1" : ""} ${
                isHeld ? "ring-[3px] ring-brand-900 ring-offset-2" : ""
              } ${hovered ? "scale-125 ring-2 ring-brand-600" : ""}`}
              style={seatStyle}
            >
              {guest ? <span aria-hidden="true">{initials(guest.name)}</span> : null}
              {guest?.diet ? (
                <span
                  aria-hidden="true"
                  className="absolute -right-[8%] -top-[8%] size-[34%] rounded-full bg-amber-400 ring-1 ring-white"
                />
              ) : null}
            </button>
            {guest ? (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute hidden whitespace-nowrap font-medium text-stone-700 @min-[1300px]:block"
                style={{
                  left: pctX(pos.x + Math.cos(pos.angle) * (SEAT_D / 2 + 0.15)),
                  top: pctY(pos.y + Math.sin(pos.angle) * (SEAT_D / 2 + 0.15)),
                  transform: `translate(${-50 + 50 * Math.cos(pos.angle)}%, ${-50 + 50 * Math.sin(pos.angle)}%)`,
                  fontSize: "max(10px, 0.85cqw)",
                }}
              >
                {firstName(guest.name)}
              </span>
            ) : null}
          </div>
        );
      })}
    </>
  );
}
