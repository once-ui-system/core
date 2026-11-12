"use client";

import type { CSSProperties } from "react";
import { AlertTriangle } from "lucide-react";
import { EVENT, FIXTURES, GUESTS, PARTIES, TABLES, initials, type Fixture, type Table } from "@/lib/data";
import { SEAT_R, filledCount, seatOffsets, tableSize, type RuleResult, type Seats } from "@/lib/plan";
import { partyStyle, PARTY_STYLE } from "@/lib/ui";

export interface PlanCtl {
  armed: string | null;
  selected: string | null;
  dragId: string | null;
  hover: string | null;
  onSeatClick: (tableId: string, seat: number) => void;
  onTableClick: (tableId: string) => void;
  onGuestPointerDown: (e: React.PointerEvent, guestId: string) => void;
}

const m = (v: number) => `calc(var(--m) * ${v})`;

function FixtureView({ f }: { f: Fixture }) {
  const base: CSSProperties = { left: m(f.x), top: m(f.y), width: m(f.w), height: m(f.h) };
  const fs: CSSProperties = { fontSize: "max(10px, calc(var(--m) * 0.42))" };
  if (f.kind === "door") {
    return (
      <>
        <div
          className="absolute rounded-sm bg-emerald-700"
          style={base}
          role="img"
          aria-label={f.label}
        />
        <span
          aria-hidden
          className="absolute grid place-items-center overflow-hidden font-semibold uppercase tracking-wider text-white [writing-mode:vertical-rl]"
          style={{ left: m(f.x), top: m(f.y), width: m(f.w), height: m(f.h), fontSize: "8px" }}
        >
          Doors
        </span>
      </>
    );
  }
  const styles: Record<string, string> = {
    stage: "bg-stone-800 text-white rounded-md",
    dancefloor: "bg-amber-100/80 border border-dashed border-amber-500 text-amber-900 rounded-md",
    bar: "bg-teal-800 text-white rounded-md",
  };
  return (
    <div
      className={`absolute grid place-items-center text-center font-semibold ${styles[f.kind] ?? ""}`}
      style={{ ...base, ...fs }}
      role="img"
      aria-label={f.label}
    >
      <span className={f.kind === "bar" ? "[writing-mode:vertical-rl]" : ""}>{f.label}</span>
    </div>
  );
}

interface TableViewProps {
  table: Table;
  seats: Seats;
  issues: RuleResult[];
  badGuests: Set<string>;
  ctl: PlanCtl;
}

function TableView({ table, seats, issues, badGuests, ctl }: TableViewProps) {
  const row = seats[table.id] ?? [];
  const filled = filledCount(seats, table.id);
  const size = tableSize(table);
  const offsets = seatOffsets(table);
  const selected = ctl.selected === table.id;
  const hasIssue = issues.length > 0;
  const dropHover = ctl.hover === `table:${table.id}`;
  const round = table.shape === "round";
  const pad = round ? 1.95 : 0;

  return (
    <>
      <div
        data-drop={`table:${table.id}`}
        aria-hidden
        className={`absolute transition-colors ${round ? "rounded-full" : "rounded-2xl"} ${
          dropHover ? "bg-teal-600/20" : selected ? "bg-teal-600/10" : ""
        }`}
        style={
          round
            ? { left: m(table.x - pad), top: m(table.y - pad), width: m(pad * 2), height: m(pad * 2) }
            : {
                left: m(table.x - size.w / 2 - 0.2),
                top: m(table.y - 1.55),
                width: m(size.w + 0.4),
                height: m(3.1),
              }
        }
      />
      <button
        type="button"
        data-drop={`table:${table.id}`}
        onClick={() => ctl.onTableClick(table.id)}
        aria-pressed={selected}
        className={`absolute flex flex-col items-center justify-center gap-px border-2 text-center leading-tight shadow-sm transition-colors ${
          round ? "rounded-full" : "rounded-xl"
        } ${
          hasIssue
            ? "border-red-600 bg-red-50 text-red-900"
            : selected
              ? "border-teal-700 bg-teal-50 text-teal-950"
              : "border-stone-300 bg-white text-stone-800 hover:border-stone-400"
        }`}
        style={{
          left: m(table.x - size.w / 2),
          top: m(table.y - size.h / 2),
          width: m(size.w),
          height: m(size.h),
          fontSize: "max(10px, calc(var(--m) * 0.36))",
        }}
      >
        <span className="font-semibold">{table.name}</span>
        <span className={`tabular-nums ${filled === table.seats ? "font-semibold" : "text-stone-600"}`}>
          {filled}/{table.seats}
          <span className="sr-only"> seats filled</span>
        </span>
        {hasIssue ? (
          <span className="inline-flex items-center gap-0.5 font-bold text-red-700">
            <AlertTriangle className="size-[1.1em]" aria-hidden />
            {issues.length}
            <span className="sr-only"> rule broken</span>
          </span>
        ) : null}
      </button>

      {offsets.map((o, i) => {
        const id = row[i] ?? null;
        const guest = id ? GUESTS.find((g) => g.id === id) : undefined;
        const key = `seat:${table.id}:${i}`;
        const over = ctl.hover === key;
        const armed = id !== null && ctl.armed === id;
        const bad = id !== null && badGuests.has(id);
        const dragging = id !== null && ctl.dragId === id;
        const label = guest
          ? `${table.name}, seat ${i + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}${bad ? ", rule broken" : ""}`
          : `${table.name}, seat ${i + 1}: empty`;
        return (
          <button
            key={key}
            type="button"
            data-drop={key}
            onClick={() => ctl.onSeatClick(table.id, i)}
            onPointerDown={guest ? (e) => ctl.onGuestPointerDown(e, guest.id) : undefined}
            className={`absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-bold transition-transform select-none ${
              guest
                ? `${partyStyle(guest.party).seat} touch-none shadow-sm cursor-grab`
                : "border-[1.5px] border-dashed border-stone-400 bg-white/70 text-stone-400"
            } ${over ? "scale-125 ring-4 ring-teal-500" : ""} ${armed ? "ring-4 ring-teal-500 ring-offset-2" : ""} ${
              bad && !armed ? "ring-[3px] ring-red-600 ring-offset-1" : ""
            } ${dragging ? "opacity-40" : ""}`}
            style={{
              left: m(table.x + o.dx),
              top: m(table.y + o.dy),
              width: m(SEAT_R * 2),
              height: m(SEAT_R * 2),
              fontSize: "max(9px, calc(var(--m) * 0.29))",
            }}
          >
            <span className="sr-only">{label}</span>
            {guest ? (
              <span aria-hidden>{initials(guest.name)}</span>
            ) : (
              <span aria-hidden className="text-[1.3em] leading-none">+</span>
            )}
            {guest?.diet ? (
              <span
                aria-hidden
                className="absolute -right-0.5 -top-0.5 size-[0.75em] rounded-full border border-white bg-yellow-400"
              />
            ) : null}
          </button>
        );
      })}
    </>
  );
}

export function Floor({
  seats,
  rules,
  ctl,
}: {
  seats: Seats;
  rules: RuleResult[];
  ctl: PlanCtl;
}) {
  const broken = rules.filter((r) => r.status === "broken");
  const bad = new Set<string>();
  const byTable: Record<string, RuleResult[]> = {};
  for (const r of broken) {
    r.guests.forEach((g) => bad.add(g));
    r.tables.forEach((t) => (byTable[t] = [...(byTable[t] ?? []), r]));
  }
  const { width, depth } = EVENT.room_m;

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-stone-300 bg-[#fcfbf8]">
        <div
          className="@container relative min-w-[680px]"
          style={{ aspectRatio: `${width} / ${depth}` }}
        >
          <div
            className="floor-grid absolute inset-0"
            style={{ "--m": `calc(100cqw / ${width})` } as CSSProperties}
            data-drop-area
          >
            {FIXTURES.map((f) => (
              <FixtureView key={f.id} f={f} />
            ))}
            {TABLES.map((t) => (
              <TableView
                key={t.id}
                table={t}
                seats={seats}
                issues={byTable[t.id] ?? []}
                badGuests={bad}
                ctl={ctl}
              />
            ))}
            <div
              className="absolute flex flex-col items-center text-stone-500"
              style={{ left: m(21.2), top: m(0.5), width: m(2), fontSize: "max(9px, calc(var(--m) * 0.32))" }}
              aria-hidden
            >
              <div className="h-1.5 w-full border-x border-b border-stone-500" />
              <span>2 m</span>
            </div>
          </div>
        </div>
      </div>

      <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-700" aria-label="Legend">
        {PARTIES.map((p) => (
          <li key={p} className="inline-flex items-center gap-1.5">
            <span className={`size-3 rounded-full ${PARTY_STYLE[p]?.dot ?? "bg-slate-700"}`} aria-hidden />
            {p}
          </li>
        ))}
        <li className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-yellow-400 ring-1 ring-stone-300" aria-hidden />
          Dietary need
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full border border-dashed border-stone-500" aria-hidden />
          Empty seat
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full ring-2 ring-red-600" aria-hidden />
          Rule broken
        </li>
      </ul>
    </div>
  );
}
