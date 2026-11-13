"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Armchair, RotateCcw, UserCheck, UserX, Users, X } from "lucide-react";
import { EVENT, GUESTS, TABLES, guestById, initials } from "@/lib/data";
import { partyStyle } from "@/lib/ui";
import { usePlan } from "./PlanProvider";
import { Floor, type PlanCtl } from "./Floor";
import { Card, RulesPanel, TablePanel, UnseatedPanel } from "./Panels";

function dropKey(x: number, y: number): string | null {
  const el = document.elementFromPoint(x, y);
  const target = el ? el.closest("[data-drop]") : null;
  return target ? target.getAttribute("data-drop") : null;
}

function Stat({
  label,
  value,
  sub,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: React.ReactNode;
  sub: string;
  icon: React.ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  const tones = {
    neutral: "bg-stone-100 text-stone-700",
    good: "bg-emerald-100 text-emerald-800",
    warn: "bg-amber-100 text-amber-900",
    bad: "bg-red-100 text-red-800",
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm">
      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tones[tone]}`} aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-stone-600">{label}</p>
        <p className="font-display text-2xl font-semibold leading-none tabular-nums">{value}</p>
        <p className="mt-1 truncate text-xs text-stone-600">{sub}</p>
      </div>
    </div>
  );
}

export function Planner() {
  const { seats, tableOf, rules, seat, unseat, reset } = usePlan();
  const [armed, setArmed] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const justDragged = useRef(false);
  const panelRef = useRef<HTMLElement | null>(null);
  const seatsRef = useRef(seats);
  seatsRef.current = seats;
  const armedRef = useRef(armed);
  armedRef.current = armed;

  const stats = useMemo(() => {
    const attending = GUESTS.filter((g) => g.rsvp === "yes");
    const seated = Object.keys(tableOf).length;
    const unseated = attending.filter((g) => !tableOf[g.id]).length;
    const capacity = TABLES.reduce((n, t) => n + t.seats, 0);
    const broken = rules.filter((r) => r.status === "broken").length;
    return { attending: attending.length, seated, unseated, capacity, broken };
  }, [tableOf, rules]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setArmed(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (selected && window.innerWidth < 1280) {
      panelRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selected]);

  const place = useCallback(
    (guestId: string, tableId: string, seatIndex?: number) => {
      seat(guestId, tableId, seatIndex);
      setSelected(tableId);
      setArmed(null);
    },
    [seat],
  );

  const onSeatClick = useCallback(
    (tableId: string, idx: number) => {
      if (justDragged.current) return;
      const occupant = seatsRef.current[tableId]?.[idx] ?? null;
      const current = armedRef.current;
      if (current) {
        if (occupant === current) setArmed(null);
        else place(current, tableId, idx);
        return;
      }
      setSelected(tableId);
      if (occupant) setArmed(occupant);
    },
    [place],
  );

  const onTableClick = useCallback(
    (tableId: string) => {
      if (justDragged.current) return;
      const current = armedRef.current;
      if (current) place(current, tableId);
      else setSelected(tableId);
    },
    [place],
  );

  const onChipClick = useCallback((guestId: string) => {
    if (justDragged.current) return;
    setArmed((a) => (a === guestId ? null : guestId));
  }, []);

  const onGuestPointerDown = useCallback(
    (e: React.PointerEvent, guestId: string) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const start = { x: e.clientX, y: e.clientY, started: false };

      const move = (ev: PointerEvent) => {
        if (!start.started) {
          if (Math.hypot(ev.clientX - start.x, ev.clientY - start.y) < 8) return;
          start.started = true;
          setDragId(guestId);
        }
        setPos({ x: ev.clientX, y: ev.clientY });
        setHover(dropKey(ev.clientX, ev.clientY));
      };
      const end = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", end);
        setDragId(null);
        setPos(null);
        setHover(null);
      };
      function up(ev: PointerEvent) {
        end();
        if (!start.started) return;
        justDragged.current = true;
        window.setTimeout(() => {
          justDragged.current = false;
        }, 60);
        const key = dropKey(ev.clientX, ev.clientY);
        if (!key) return;
        const [kind, tableId, idx] = key.split(":");
        if (kind === "seat" && tableId) place(guestId, tableId, Number(idx));
        else if (kind === "table" && tableId) place(guestId, tableId);
        else if (kind === "pool") {
          unseat(guestId);
          setArmed(null);
        }
      }
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", end);
    },
    [place, unseat],
  );

  const ctl: PlanCtl = {
    armed,
    selected,
    dragId,
    hover,
    onSeatClick,
    onTableClick,
    onGuestPointerDown,
  };

  const armedGuest = armed ? guestById(armed) : null;
  const dragGuest = dragId ? guestById(dragId) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Seating plan</h1>
          <p className="text-sm text-stone-600">
            Drag guests onto seats, or tap a guest and then a seat. Counts and rules update as you go.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Seated"
          value={stats.seated}
          sub={`${stats.capacity - stats.seated} of ${stats.capacity} seats free`}
          icon={<UserCheck className="size-5" />}
          tone="good"
        />
        <Stat
          label="Still to seat"
          value={stats.unseated}
          sub={`of ${stats.attending} attending`}
          icon={<UserX className="size-5" />}
          tone={stats.unseated > 0 ? "warn" : "good"}
        />
        <Stat
          label="Tables"
          value={TABLES.length}
          sub={TABLES.map((t) => seats[t.id]?.filter(Boolean).length ?? 0).join(" · ") + " seated"}
          icon={<Armchair className="size-5" />}
        />
        <Stat
          label="Rules"
          value={stats.broken === 0 ? "All kept" : `${stats.broken} broken`}
          sub={`${rules.length} rules from the couple`}
          icon={stats.broken === 0 ? <CheckCircle2 className="size-5" /> : <AlertTriangle className="size-5" />}
          tone={stats.broken === 0 ? "good" : "bad"}
        />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
        <Card
          title="Room plan"
          aside={
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-stone-600 sm:inline">
                {EVENT.room_m.width} m × {EVENT.room_m.depth} m, drawn to scale
              </span>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setArmed(null);
                  setSelected(null);
                }}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-stone-700 ring-1 ring-stone-300 hover:bg-stone-50"
              >
                <RotateCcw className="size-4" aria-hidden /> Reset
              </button>
            </div>
          }
          className="min-w-0 self-start xl:col-start-1 xl:row-start-1"
        >
          <div className="space-y-3 p-3">
            {armedGuest ? (
              <div className="flex items-center justify-between gap-3 rounded-xl bg-teal-800 px-3.5 py-2.5 text-sm text-white">
                <p>
                  <span className="font-semibold">{armedGuest.name}</span> is picked up. Tap a seat or table to place
                  them.
                </p>
                <button
                  type="button"
                  onClick={() => setArmed(null)}
                  className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg bg-white/15 px-2.5 font-semibold hover:bg-white/25"
                >
                  <X className="size-4" aria-hidden /> Cancel
                </button>
              </div>
            ) : (
              <p className="flex items-center gap-2 text-sm text-stone-600">
                <Users className="size-4 shrink-0" aria-hidden />
                Tap a table to see its guests. Tap a seated guest to pick them up and move them.
              </p>
            )}
            <Floor seats={seats} rules={rules} ctl={ctl} />
          </div>
        </Card>

        <div className="grid grid-cols-[minmax(0,1fr)] content-start items-start gap-4 md:grid-cols-[repeat(2,minmax(0,1fr))] xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:grid-cols-[minmax(0,1fr)]">
          <UnseatedPanel tableOf={tableOf} ctl={ctl} onChipClick={onChipClick} />
          <div className="min-w-0">
            <TablePanel
              seats={seats}
              rules={rules}
              selected={selected}
              ctl={ctl}
              onSelect={setSelected}
              onMove={(g, t) => place(g, t)}
              onUnseat={(g) => unseat(g)}
              onClose={() => setSelected(null)}
              panelRef={panelRef}
            />
          </div>
        </div>
        <div className="min-w-0 xl:col-start-1 xl:row-start-2">
          <RulesPanel rules={rules} onPick={setSelected} />
        </div>
      </div>

      {dragGuest && pos ? (
        <div
          aria-hidden
          className="pointer-events-none fixed z-50 flex -translate-x-1/2 -translate-y-[130%] items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 text-sm font-semibold shadow-xl ring-1 ring-stone-300"
          style={{ left: pos.x, top: pos.y }}
        >
          <span className={`grid size-7 place-items-center rounded-full text-xs ${partyStyle(dragGuest.party).seat}`}>
            {initials(dragGuest.name)}
          </span>
          {dragGuest.name}
        </div>
      ) : null}
    </div>
  );
}
