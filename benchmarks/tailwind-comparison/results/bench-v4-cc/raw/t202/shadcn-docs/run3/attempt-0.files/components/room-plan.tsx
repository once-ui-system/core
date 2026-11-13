"use client";

import * as React from "react";
import { usePlan } from "@/components/plan-provider";
import { FIXTURES, GUEST_BY_ID, ROOM, TABLES, type Fixture } from "@/lib/data";
import { initials, partyDot, partyStyle } from "@/lib/format";
import { GEOMETRY } from "@/lib/geometry";
import { cn } from "@/lib/utils";

const pctX = (v: number) => `${(v / ROOM.width) * 100}%`;
const pctY = (v: number) => `${(v / ROOM.depth) * 100}%`;

function FixtureView({ fixture }: { fixture: Fixture }) {
  const base: React.CSSProperties = {
    left: pctX(fixture.x),
    top: pctY(fixture.y),
    width: pctX(fixture.w),
    height: pctY(fixture.h),
  };
  const labelSize = { fontSize: "clamp(9px, 1.35cqw, 14px)" };

  if (fixture.kind === "door") {
    return (
      <div
        role="img"
        aria-label={`${fixture.label}, left wall`}
        style={base}
        className="absolute z-[1] flex items-center justify-center rounded-sm bg-emerald-700 text-white"
      >
        <span
          style={{ writingMode: "vertical-rl", fontSize: "clamp(8px, 1.1cqw, 12px)" }}
          className="rotate-180 font-medium tracking-wide whitespace-nowrap"
        >
          {fixture.label}
        </span>
      </div>
    );
  }
  if (fixture.kind === "dancefloor") {
    return (
      <div
        role="img"
        aria-label={fixture.label}
        style={{
          ...base,
          backgroundImage: "repeating-conic-gradient(oklch(0.7 0.1 80 / 0.16) 0% 25%, transparent 0% 50%)",
          backgroundSize: `${(2 / fixture.w) * 100}% ${(2 / fixture.h) * 100}%`,
        }}
        className="absolute flex items-center justify-center rounded-md border border-amber-400/50 bg-amber-100/60"
      >
        <span style={labelSize} className="rounded bg-card/80 px-2 py-0.5 font-medium text-amber-900">
          {fixture.label}
        </span>
      </div>
    );
  }
  if (fixture.kind === "stage") {
    return (
      <div
        role="img"
        aria-label={fixture.label}
        style={base}
        className="absolute flex items-center justify-center rounded-md bg-foreground/85 text-background shadow-sm"
      >
        <span style={labelSize} className="font-medium tracking-wide">
          {fixture.label}
        </span>
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={fixture.label}
      style={base}
      className="absolute flex items-center justify-center rounded-md bg-stone-700 text-stone-50 shadow-sm"
    >
      <span style={labelSize} className="font-medium tracking-wide">
        {fixture.label}
      </span>
    </div>
  );
}

export function RoomPlan() {
  const plan = usePlan();
  const [over, setOver] = React.useState<string | null>(null);
  const holding = plan.heldGuestId !== null || plan.dragId !== null;

  function dropGuest(event: React.DragEvent, tableId: string, seat?: number) {
    event.preventDefault();
    const id = plan.dragId ?? event.dataTransfer.getData("text/plain");
    plan.setDragId(null);
    setOver(null);
    if (!id) return;
    if (plan.place(id, tableId, seat)) plan.selectTable(tableId);
  }

  function dragOver(event: React.DragEvent, key: string) {
    if (!plan.dragId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setOver(key);
  }

  function seatClick(tableId: string, index: number, occupantId: string | null) {
    const held = plan.heldGuestId;
    if (held) {
      if (occupantId === held) {
        plan.holdGuest(null);
        return;
      }
      if (plan.place(held, tableId, index)) {
        plan.selectTable(tableId);
        plan.holdGuest(null);
      }
      return;
    }
    if (occupantId) {
      plan.holdGuest(occupantId);
      plan.inspectTable(tableId);
      return;
    }
    plan.inspectTable(tableId);
  }

  function tableClick(tableId: string) {
    const held = plan.heldGuestId;
    if (held) {
      if (plan.place(held, tableId)) {
        plan.selectTable(tableId);
        plan.holdGuest(null);
      }
      return;
    }
    plan.inspectTable(tableId);
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card p-2 shadow-xs sm:p-3">
      <div className="min-w-[880px]" style={{ containerType: "inline-size" }}>
        <div
          role="group"
          aria-label={`Room plan, ${ROOM.width} by ${ROOM.depth} metres`}
          onClick={(e) => {
            if (e.target === e.currentTarget) plan.selectTable(null);
          }}
          className="relative w-full overflow-hidden rounded-lg border-2 border-foreground/25"
          style={{
            aspectRatio: `${ROOM.width} / ${ROOM.depth}`,
            backgroundColor: "oklch(0.972 0.01 85)",
            backgroundImage:
              "linear-gradient(to right, oklch(0.5 0.02 85 / 0.08) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.5 0.02 85 / 0.08) 1px, transparent 1px)",
            backgroundSize: `${100 / ROOM.width}% ${100 / ROOM.depth}%`,
          }}
        >
          {FIXTURES.map((f) => (
            <FixtureView key={f.id} fixture={f} />
          ))}

          {TABLES.map((table) => {
            const geo = GEOMETRY[table.id];
            if (!geo) return null;
            const seats = plan.seatsByTable[table.id] ?? [];
            const filled = seats.filter(Boolean).length;
            const broken = plan.brokenByTable[table.id] ?? [];
            const selected = plan.selectedTableId === table.id;
            const bodyKey = `body:${table.id}`;
            const summary = `${table.name}, ${filled} of ${table.seats} seats filled${
              broken.length ? `, ${broken.length} broken ${broken.length === 1 ? "rule" : "rules"}` : ""
            }`;

            return (
              <React.Fragment key={table.id}>
                {(selected || broken.length > 0) && (
                  <div
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute border",
                      geo.round ? "rounded-full" : "rounded-2xl",
                      broken.length > 0
                        ? "border-dashed border-destructive/70 bg-destructive/5"
                        : "border-primary/50 bg-primary/5",
                    )}
                    style={{
                      left: pctX(table.x - geo.haloW / 2),
                      top: pctY(table.y - geo.haloH / 2),
                      width: pctX(geo.haloW),
                      height: pctY(geo.haloH),
                    }}
                  />
                )}

                <button
                  type="button"
                  aria-label={summary}
                  aria-pressed={selected}
                  onClick={() => tableClick(table.id)}
                  onDragOver={(e) => dragOver(e, bodyKey)}
                  onDragLeave={() => setOver((cur) => (cur === bodyKey ? null : cur))}
                  onDrop={(e) => dropGuest(e, table.id)}
                  style={{
                    left: pctX(table.x - geo.bodyW / 2),
                    top: pctY(table.y - geo.bodyH / 2),
                    width: pctX(geo.bodyW),
                    height: pctY(geo.bodyH),
                  }}
                  className={cn(
                    "absolute z-[2] flex flex-col items-center justify-center border-2 bg-card text-center shadow-sm outline-none transition-shadow focus-visible:ring-[3px] focus-visible:ring-ring/60",
                    geo.round ? "rounded-full" : "rounded-xl",
                    selected ? "border-primary ring-2 ring-primary/40" : "border-foreground/25 hover:border-foreground/50",
                    broken.length > 0 && "border-destructive",
                    over === bodyKey && "border-primary ring-4 ring-primary/30",
                    holding && plan.heldGuestId && "hover:border-primary",
                  )}
                >
                  <span
                    style={{ fontSize: "clamp(9px, 1.3cqw, 14px)" }}
                    className="leading-tight font-semibold"
                  >
                    {table.name}
                  </span>
                  <span
                    style={{ fontSize: "clamp(9px, 1.1cqw, 12px)" }}
                    className={cn(
                      "tabular-nums leading-tight text-muted-foreground",
                      filled === table.seats && "font-medium text-emerald-700",
                    )}
                  >
                    {filled}/{table.seats}
                  </span>
                  {broken.length > 0 && (
                    <span
                      aria-hidden
                      className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-destructive text-[10px] leading-none font-bold text-white"
                    >
                      !
                    </span>
                  )}
                </button>

                {geo.seats.map((point, index) => {
                  const occupantId = seats[index] ?? null;
                  const guest = occupantId ? GUEST_BY_ID[occupantId] : undefined;
                  const key = `${table.id}:${index}`;
                  const flagged = occupantId ? plan.flaggedGuestIds.has(occupantId) : false;
                  const held = occupantId !== null && plan.heldGuestId === occupantId;
                  const label = guest
                    ? `${table.name}, seat ${index + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}${flagged ? ", breaks a rule" : ""}${held ? ", picked up" : ""}`
                    : `${table.name}, seat ${index + 1}: empty`;
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-label={label}
                      title={guest ? `${guest.name}${guest.diet ? ` (${guest.diet})` : ""}` : `Empty seat ${index + 1}`}
                      draggable={Boolean(guest)}
                      onDragStart={(e) => {
                        if (!guest) return;
                        e.dataTransfer.setData("text/plain", guest.id);
                        e.dataTransfer.effectAllowed = "move";
                        plan.setDragId(guest.id);
                      }}
                      onDragEnd={() => {
                        plan.setDragId(null);
                        setOver(null);
                      }}
                      onDragOver={(e) => dragOver(e, key)}
                      onDragLeave={() => setOver((cur) => (cur === key ? null : cur))}
                      onDrop={(e) => dropGuest(e, table.id, index)}
                      onClick={() => seatClick(table.id, index, occupantId)}
                      style={{
                        left: pctX(table.x + point.dx - geo.seatD / 2),
                        top: pctY(table.y + point.dy - geo.seatD / 2),
                        width: pctX(geo.seatD),
                        height: pctY(geo.seatD),
                        fontSize: "clamp(8px, 1.25cqw, 13px)",
                        ...(guest ? partyStyle(guest.party) : {}),
                      }}
                      className={cn(
                        "absolute z-[3] grid place-items-center rounded-full border-2 leading-none outline-none transition-transform focus-visible:ring-[3px] focus-visible:ring-ring/70",
                        guest
                          ? "cursor-grab font-semibold shadow-sm active:cursor-grabbing"
                          : "border-dashed border-foreground/30 bg-background/70 text-foreground/40",
                        !guest && holding && "border-primary/70 bg-primary/10",
                        flagged && "ring-2 ring-destructive ring-offset-1",
                        held && "z-[4] scale-110 ring-2 ring-primary ring-offset-2",
                        over === key && "z-[4] scale-110 ring-4 ring-primary/40",
                      )}
                    >
                      {guest ? initials(guest.name) : <span aria-hidden>+</span>}
                      {guest?.diet && (
                        <span
                          aria-hidden
                          className="absolute -top-[3px] -right-[3px] size-[30%] rounded-full border border-background bg-amber-500"
                        />
                      )}
                    </button>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function PlanLegend() {
  const seen = new Set<string>();
  const parties: string[] = [];
  for (const guest of Object.values(GUEST_BY_ID)) {
    if (!seen.has(guest.party)) {
      seen.add(guest.party);
      parties.push(guest.party);
    }
  }
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground" aria-label="Legend">
      {parties.map((party) => (
        <li key={party} className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: partyDot(party) }} />
          {party}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span aria-hidden className="size-2.5 rounded-full bg-amber-500" />
        Dietary need
      </li>
      <li className="flex items-center gap-1.5">
        <span aria-hidden className="size-2.5 rounded-full border-2 border-destructive" />
        Rule broken
      </li>
      <li>Grid squares are 1 m</li>
    </ul>
  );
}
