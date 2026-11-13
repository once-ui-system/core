"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { event, firstName, fixtures, partyColors, tables, type Fixture, type TableDef } from "@/lib/data";
import { SEAT_D, m, tableFrame } from "@/lib/geometry";
import { usePlan, type PlacedGuest } from "@/lib/plan-store";

const FONT_S = "max(8px, calc(var(--m) * 0.235))";
const FONT_M = "max(10px, calc(var(--m) * 0.36))";

function FixtureBlock({ f }: { f: Fixture }) {
  const base: React.CSSProperties = { left: m(f.x), top: m(f.y), width: m(f.w), height: m(f.h) };
  if (f.kind === "stage") {
    return (
      <div
        role="img"
        aria-label={`${f.label}, stage`}
        className="absolute grid place-items-center rounded-md bg-foreground/90 text-background shadow-sm"
        style={base}
      >
        <span className="font-display font-semibold tracking-wide" style={{ fontSize: FONT_M }}>
          {f.label}
        </span>
      </div>
    );
  }
  if (f.kind === "dancefloor") {
    return (
      <div
        role="img"
        aria-label={f.label}
        className="absolute grid place-items-center rounded-sm border border-primary/25 bg-dance"
        style={{
          ...base,
          backgroundImage:
            "conic-gradient(var(--dance-alt) 25%, transparent 0 50%, var(--dance-alt) 0 75%, transparent 0)",
          backgroundSize: `${m(1)} ${m(1)}`,
        }}
      >
        <span
          className="rounded-sm bg-card/80 px-1.5 font-display font-medium italic text-muted-foreground"
          style={{ fontSize: FONT_M }}
        >
          {f.label}
        </span>
      </div>
    );
  }
  if (f.kind === "bar") {
    return (
      <div
        role="img"
        aria-label={f.label}
        className="absolute grid place-items-center rounded-md border-2 border-bar-edge bg-bar text-bar-ink"
        style={base}
      >
        <span className="font-display font-semibold" style={{ fontSize: FONT_M }}>
          {f.label}
        </span>
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={f.label}
      className="absolute grid place-items-center rounded-r-sm bg-door text-door-ink"
      style={base}
    >
      <span
        className="font-semibold tracking-wide whitespace-nowrap"
        style={{ fontSize: FONT_S, writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        {f.label}
      </span>
    </div>
  );
}

interface SeatProps {
  table: TableDef;
  index: number;
  pos: { x: number; y: number };
  guest: PlacedGuest | null;
  flagged: boolean;
  over: string | null;
  setOver: (v: string | null) => void;
}

function Seat({ table, index, pos, guest, flagged, over, setOver }: SeatProps) {
  const { armed, arm, dragging, setDragging, place, selectTable, byId } = usePlan();
  const key = `${table.id}:${index}`;
  const holding = armed ?? dragging;
  const holder = holding ? byId.get(holding) : undefined;
  const colors = guest ? partyColors(guest.party) : null;
  const isArmed = guest !== null && armed === guest.id;
  const droppable = Boolean(holding) && !(guest && guest.id === holding);
  const canTake = droppable && (guest === null || Boolean(holder?.table));

  const label = guest
    ? `${guest.name}, seat ${index + 1} at ${table.name}${guest.diet ? `, ${guest.diet}` : ""}${
        flagged ? ", involved in a broken rule" : ""
      }`
    : `Empty seat ${index + 1} at ${table.name}`;

  const onClick = () => {
    if (armed && !(guest && guest.id === armed)) {
      place(armed, table.id, index);
      return;
    }
    selectTable(table.id);
    if (guest) arm(isArmed ? null : guest.id);
  };

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={guest ? isArmed : undefined}
      draggable={guest !== null}
      onClick={onClick}
      onDragStart={(e) => {
        if (!guest) return;
        e.dataTransfer.setData("text/plain", guest.id);
        e.dataTransfer.effectAllowed = "move";
        setDragging(guest.id);
        arm(null);
        selectTable(table.id);
      }}
      onDragEnd={() => {
        setDragging(null);
        setOver(null);
      }}
      onDragOver={(e) => {
        if (!dragging) return;
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "move";
        if (over !== key) setOver(key);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = dragging ?? e.dataTransfer.getData("text/plain");
        setOver(null);
        if (id) place(id, table.id, index);
      }}
      className={cn(
        "absolute grid -translate-x-1/2 -translate-y-1/2 touch-manipulation place-items-center rounded-full border text-center leading-none outline-none transition-[box-shadow,transform,background-color] focus-visible:ring-[3px] focus-visible:ring-ring",
        guest
          ? "cursor-grab font-medium shadow-sm active:cursor-grabbing"
          : "border-dashed border-foreground/30 bg-card/70 text-muted-foreground",
        isArmed && "ring-[3px] ring-primary",
        flagged && "ring-2 ring-destructive",
        canTake && "hover:scale-110 hover:ring-[3px] hover:ring-primary/60",
        droppable && !guest && "border-primary/60 bg-accent/60",
        over === key && canTake && "scale-110 ring-[3px] ring-primary",
      )}
      style={{
        left: m(pos.x),
        top: m(pos.y),
        width: m(SEAT_D),
        height: m(SEAT_D),
        fontSize: FONT_S,
        ...(colors ? { backgroundColor: colors.tint, borderColor: colors.edge, color: colors.ink } : {}),
      }}
    >
      {guest ? (
        <>
          <span className="max-w-full truncate px-[3%]">{firstName(guest.name)}</span>
          {guest.diet && (
            <span
              aria-hidden
              className="absolute -top-px -right-px size-[28%] rounded-full border border-card bg-diet"
            />
          )}
        </>
      ) : (
        <span aria-hidden className="opacity-70">
          {index + 1}
        </span>
      )}
    </button>
  );
}

function TableBlock({ table, over, setOver }: { table: TableDef; over: string | null; setOver: (v: string | null) => void }) {
  const { occupancy, selectedTable, selectTable, armed, dragging, place, brokenTables, ruleResults } = usePlan();
  const frame = React.useMemo(() => tableFrame(table), [table]);
  const occ = occupancy[table.id] ?? [];
  const filled = occ.filter(Boolean).length;
  const selected = selectedTable === table.id;
  const broken = brokenTables.has(table.id);
  const full = filled >= table.seats;
  const holding = armed ?? dragging;

  const flaggedGuests = React.useMemo(() => {
    const s = new Set<string>();
    for (const r of ruleResults) {
      if (r.status !== "broken" || !r.tables.includes(table.id)) continue;
      r.rule.guests.forEach((id) => s.add(id));
    }
    return s;
  }, [ruleResults, table.id]);

  const s = frame.surface;

  return (
    <div
      className="absolute"
      style={{ left: m(frame.left), top: m(frame.top), width: m(frame.width), height: m(frame.height) }}
      onDragOver={(e) => {
        if (!dragging) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (over !== table.id) setOver(table.id);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null) && over?.startsWith(table.id)) setOver(null);
      }}
      onDrop={(e) => {
        e.preventDefault();
        const id = dragging ?? e.dataTransfer.getData("text/plain");
        setOver(null);
        if (id) place(id, table.id);
      }}
    >
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => {
          if (armed) place(armed, table.id);
          else selectTable(selected ? null : table.id);
        }}
        className={cn(
          "absolute flex touch-manipulation flex-col items-center justify-center border-2 text-center leading-tight shadow-sm outline-none transition-[box-shadow,background-color,border-color] focus-visible:ring-[3px] focus-visible:ring-ring",
          s.round ? "rounded-full" : "rounded-md flex-row gap-[0.6em]",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-foreground/25 bg-card text-foreground hover:border-foreground/50",
          broken && !selected && "border-destructive",
          holding && !full && "ring-[3px] ring-primary/40",
          (over === table.id) && "ring-[3px] ring-primary",
        )}
        style={{ left: m(s.x), top: m(s.y), width: m(s.w), height: m(s.h), fontSize: FONT_M }}
      >
        <span className="font-display font-semibold">{table.name}</span>
        <span
          className={cn("tabular-nums", selected ? "text-primary-foreground/85" : "text-muted-foreground")}
          style={{ fontSize: FONT_S }}
        >
          {filled}/{table.seats}
        </span>
        <span className="sr-only"> seats filled{broken ? ", a couple's rule is broken here" : ""}</span>
      </button>

      {broken && (
        <span
          role="img"
          aria-label="Broken rule on this table"
          className="absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-destructive text-white shadow"
          style={{
            left: m(s.round ? s.x + s.w * 0.86 : s.x + s.w - 0.2),
            top: m(s.round ? s.y + s.h * 0.14 : s.y),
            width: m(0.62),
            height: m(0.62),
          }}
        >
          <AlertTriangle className="size-[62%]" aria-hidden />
        </span>
      )}

      {frame.seats.map((pos, i) => (
        <Seat
          key={i}
          table={table}
          index={i}
          pos={pos}
          guest={occ[i] ?? null}
          flagged={Boolean(occ[i] && flaggedGuests.has(occ[i]!.id))}
          over={over}
          setOver={setOver}
        />
      ))}
    </div>
  );
}

export function Room() {
  const [over, setOver] = React.useState<string | null>(null);
  const { selectTable } = usePlan();
  const { width, depth } = event.room_m;

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-xs" tabIndex={-1}>
      <div className="@container min-w-[860px] p-2 sm:p-3">
        <div
          className="relative overflow-hidden rounded-lg border-[3px] border-foreground/35 bg-floor"
          role="group"
          aria-label={`Room plan, ${width} by ${depth} metres, drawn to scale`}
          style={
            {
              "--m": `calc((100cqw - 6px) / ${width})`,
              aspectRatio: `${width} / ${depth}`,
              backgroundImage:
                "linear-gradient(to right, var(--gridline) 1px, transparent 1px), linear-gradient(to bottom, var(--gridline) 1px, transparent 1px)",
              backgroundSize: "var(--m) var(--m)",
            } as React.CSSProperties
          }
          onClick={(e) => {
            if (e.target === e.currentTarget) selectTable(null);
          }}
        >
          {fixtures.map((f) => (
            <FixtureBlock key={f.id} f={f} />
          ))}
          {tables.map((t) => (
            <TableBlock key={t.id} table={t} over={over} setOver={setOver} />
          ))}
          <div
            aria-hidden
            className="pointer-events-none absolute flex flex-col gap-0.5 text-muted-foreground"
            style={{ left: m(5.6), top: m(13), width: m(4), fontSize: FONT_S }}
          >
            <div className="h-1.5 border-x-2 border-b-2 border-muted-foreground/70" />
            <span className="text-center">4 m</span>
          </div>
        </div>
      </div>
    </div>
  );
}
