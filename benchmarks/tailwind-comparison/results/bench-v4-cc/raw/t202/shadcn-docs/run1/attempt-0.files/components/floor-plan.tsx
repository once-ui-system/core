"use client";

import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FIXTURES,
  GUEST_BY_ID,
  LONG_D,
  LONG_W,
  PARTIES,
  ROOM,
  SEAT_D,
  TABLES,
  partyStyle,
  initials,
  seatPositions,
  tableCentre,
  tableRadius,
  type Fixture,
  type PlanTable,
} from "@/lib/data";
import { usePlan } from "@/components/plan-provider";
import { startGuestDrag, useGuestDrop } from "@/components/use-drop";

const px = (v: number, total: number) => `${(v / total) * 100}%`;

function FixtureBox({ f }: { f: Fixture }) {
  const base = "absolute flex items-center justify-center overflow-hidden text-center font-medium leading-tight";
  const kind: Record<Fixture["kind"], string> = {
    stage: "rounded-md bg-foreground/90 text-background",
    dancefloor: "rounded-sm border border-dashed border-primary/40 text-primary/80",
    bar: "rounded-md border border-amber-300 bg-amber-100 text-amber-900",
    door: "rounded-sm bg-emerald-600 text-white",
  };
  return (
    <div
      className={cn(base, kind[f.kind])}
      style={{
        left: px(f.x, ROOM.width),
        top: px(f.y, ROOM.depth),
        width: px(f.w, ROOM.width),
        height: px(f.h, ROOM.depth),
        fontSize: "max(8px, 1.3cqw)",
        ...(f.kind === "dancefloor"
          ? {
              backgroundImage:
                "repeating-conic-gradient(color-mix(in oklab, var(--primary) 9%, transparent) 0% 25%, transparent 0% 50%)",
              backgroundSize: `${(2 / f.w) * 100}% ${(2 / f.h) * 100}%`,
            }
          : {}),
        ...(f.kind === "door" ? { writingMode: "vertical-rl" as const } : {}),
      }}
    >
      {f.label}
    </div>
  );
}

function PlanSeat({ table, index, x, y }: { table: PlanTable; index: number; x: number; y: number }) {
  const plan = usePlan();
  const guestId = plan.seats[table.id][index];
  const guest = guestId ? GUEST_BY_ID[guestId] : null;
  const drop = useGuestDrop((id) => plan.place(id, table.id, index));
  const isPicked = !!guest && plan.picked === guest.id;
  const flagged = !!guest && plan.flaggedGuests.has(guest.id);
  const label = `${table.name}, seat ${index + 1}: ${
    guest ? `${guest.name}${guest.diet ? `, ${guest.diet}` : ""}${flagged ? ", rule broken" : ""}` : "empty"
  }`;

  return (
    <button
      type="button"
      draggable={!!guest}
      onDragStart={guest ? (e) => startGuestDrag(e, guest.id) : undefined}
      {...drop.props}
      onClick={() => plan.activateSeat(table.id, index)}
      aria-label={label}
      aria-pressed={guest ? isPicked : undefined}
      title={guest ? `${guest.name}${guest.diet ? ` · ${guest.diet}` : ""}` : `${table.name}, seat ${index + 1} (empty)`}
      className={cn(
        "absolute z-10 flex aspect-square -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border font-semibold leading-none outline-none transition-shadow",
        "before:absolute before:-inset-1 before:content-[''] focus-visible:ring-[3px] focus-visible:ring-ring",
        guest ? "cursor-grab" : "border-dashed border-muted-foreground/45 bg-background text-transparent",
        !guest && plan.picked && "border-primary bg-primary/10",
        flagged && "ring-2 ring-destructive",
        isPicked && "ring-2 ring-primary ring-offset-1",
        drop.over && "bg-primary/30 ring-2 ring-primary",
      )}
      style={{
        left: px(x, ROOM.width),
        top: px(y, ROOM.depth),
        width: px(SEAT_D, ROOM.width),
        fontSize: "max(7.5px, 1.2cqw)",
        ...(guest && !drop.over ? partyStyle(guest.party) : {}),
      }}
    >
      {guest ? initials(guest.name) : "·"}
      {guest?.diet && (
        <span
          aria-hidden="true"
          className="absolute -right-[10%] -top-[10%] size-[36%] rounded-full bg-amber-500 ring-1 ring-white"
        />
      )}
    </button>
  );
}

function PlanTableBody({ table }: { table: PlanTable }) {
  const plan = usePlan();
  const drop = useGuestDrop((id) => plan.place(id, table.id));
  const c = tableCentre(table);
  const long = table.shape === "long";
  const w = long ? LONG_W : tableRadius(table) * 2;
  const h = long ? LONG_D : w;
  const flagged = plan.flaggedTables.has(table.id);
  const selected = plan.selectedTable === table.id;
  const count = plan.filled(table.id);

  return (
    <button
      type="button"
      {...drop.props}
      onClick={() => plan.activateTable(table.id)}
      aria-pressed={selected}
      aria-label={`${table.name}, ${count} of ${table.seats} seats filled${flagged ? ", a rule is broken here" : ""}. Show guests`}
      className={cn(
        "absolute z-0 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center border-2 bg-card text-center leading-tight shadow-sm outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring",
        long ? "flex-row gap-2 rounded-md" : "flex-col rounded-full",
        flagged ? "border-destructive bg-destructive/5" : "border-border hover:border-foreground/40",
        selected && "border-primary ring-4 ring-primary/20",
        drop.over && "border-primary bg-primary/10",
      )}
      style={{
        left: px(c.x, ROOM.width),
        top: px(c.y, ROOM.depth),
        width: px(w, ROOM.width),
        height: px(h, ROOM.depth),
        fontSize: "max(8px, 1.3cqw)",
      }}
    >
      <span className="font-semibold">{table.name}</span>
      <span className="tabular-nums text-muted-foreground">
        {count}/{table.seats}
      </span>
      {flagged && (
        <span className="absolute -right-1 -top-1 flex items-center justify-center rounded-full bg-destructive p-[2px] text-white">
          <TriangleAlert style={{ width: "max(9px, 1.4cqw)", height: "max(9px, 1.4cqw)" }} aria-hidden="true" />
        </span>
      )}
    </button>
  );
}

export function FloorPlan() {
  return (
    <div
      role="region"
      aria-label="Floor plan of The Orangery, scrolls sideways on narrow screens"
      tabIndex={0}
      className="overflow-x-auto rounded-xl border bg-card outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <div className="@container min-w-[624px] p-3">
        <div
          className="relative aspect-[24/14] w-full rounded-lg border-2 border-foreground/60 bg-muted/40"
          style={{
            backgroundImage:
              "linear-gradient(to right, oklch(0 0 0 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, oklch(0 0 0 / 0.05) 1px, transparent 1px)",
            backgroundSize: `${100 / ROOM.width}% ${100 / ROOM.depth}%`,
          }}
        >
          {FIXTURES.map((f) => (
            <FixtureBox key={f.id} f={f} />
          ))}
          {TABLES.map((t) => (
            <PlanTableBody key={t.id} table={t} />
          ))}
          {TABLES.map((t) =>
            seatPositions(t).map((p, i) => <PlanSeat key={`${t.id}-${i}`} table={t} index={i} x={p.x} y={p.y} />),
          )}
        </div>
        <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {PARTIES.map((p) => (
            <li key={p} className="flex items-center gap-1.5">
              <span className="size-3 rounded-full border" style={partyStyle(p)} aria-hidden="true" />
              {p}
            </li>
          ))}
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-amber-500" aria-hidden="true" />
            Dietary need
          </li>
          <li className="ml-auto tabular-nums">
            {ROOM.width} × {ROOM.depth} m · grid squares are 1 m
          </li>
        </ul>
      </div>
    </div>
  );
}
