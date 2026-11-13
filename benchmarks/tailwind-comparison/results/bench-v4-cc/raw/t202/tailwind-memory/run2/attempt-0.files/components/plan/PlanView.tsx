"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { CircleCheck, RotateCcw, TriangleAlert, UserMinus, X } from "lucide-react";
import { usePlan } from "@/lib/plan-context";
import { guestById, tableById } from "@/lib/plan";
import { initials, partyStyle } from "@/lib/ui";
import { Room } from "./Room";
import { RulesCard, TableDetail, TableList, Tray } from "./Panels";
import type { DragState, DropTarget } from "./types";

function targetAt(x: number, y: number): DropTarget | null {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;
  const seat = el.closest<HTMLElement>("[data-seat]");
  if (seat) {
    return { kind: "seat", tableId: seat.dataset.tableId ?? "", index: Number(seat.dataset.seatIndex) };
  }
  const table = el.closest<HTMLElement>("[data-table]");
  if (table) return { kind: "table", tableId: table.dataset.tableId ?? "" };
  if (el.closest("[data-tray]")) return { kind: "tray" };
  return null;
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "bad" | "good" }) {
  return (
    <div className="rounded-2xl border border-line bg-card px-4 py-3 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p
        className={`font-display text-2xl font-semibold tabular-nums ${
          tone === "bad" ? "text-rose-700" : tone === "good" ? "text-brand-700" : ""
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  );
}

export function PlanView() {
  const { seating, tableOf, results, stats, notice, assign, unseat, reset } = usePlan();
  const [selected, setSelected] = useState<string | null>(null);
  const [armed, setArmed] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [hover, setHover] = useState<DropTarget | null>(null);
  const suppressClick = useRef(false);

  const dropRef = useRef<(guestId: string, target: DropTarget | null) => void>(() => {});
  dropRef.current = (guestId, target) => {
    if (!target) return;
    if (target.kind === "tray") {
      if (tableOf.has(guestId)) unseat(guestId);
      setArmed(null);
      return;
    }
    const ok =
      target.kind === "seat" ? assign(guestId, target.tableId, target.index) : assign(guestId, target.tableId);
    if (ok) {
      setSelected(target.tableId);
      setArmed(null);
    }
  };

  const beginDrag = useCallback((e: ReactPointerEvent, guestId: string) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const id = e.pointerId;
    const sx = e.clientX;
    const sy = e.clientY;
    let started = false;
    let last: DropTarget | null = null;

    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== id) return;
      if (!started) {
        if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 8) return;
        started = true;
      }
      last = targetAt(ev.clientX, ev.clientY);
      setDrag({ guestId, x: ev.clientX, y: ev.clientY });
      setHover(last);
    };
    const finish = (ev: PointerEvent, drop: boolean) => {
      if (ev.pointerId !== id) return;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      if (!started) return;
      suppressClick.current = true;
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 80);
      if (drop) dropRef.current(guestId, targetAt(ev.clientX, ev.clientY) ?? last);
      setDrag(null);
      setHover(null);
    };
    const up = (ev: PointerEvent) => finish(ev, true);
    const cancel = (ev: PointerEvent) => finish(ev, false);

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setArmed(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pickGuest = useCallback(
    (guestId: string) => {
      if (suppressClick.current) return;
      setArmed((cur) => (cur === guestId ? null : guestId));
      const t = tableOf.get(guestId);
      if (t) setSelected(t);
    },
    [tableOf],
  );

  const onSeat = useCallback(
    (tableId: string, index: number) => {
      if (suppressClick.current) return;
      const occupant = seating[tableId][index];
      if (armed && armed !== occupant) {
        if (assign(armed, tableId, index)) {
          setArmed(null);
          setSelected(tableId);
        }
        return;
      }
      setSelected(tableId);
      if (occupant) setArmed((cur) => (cur === occupant ? null : occupant));
    },
    [armed, assign, seating],
  );

  const onTable = useCallback(
    (tableId: string) => {
      if (suppressClick.current) return;
      if (armed) {
        if (assign(armed, tableId)) setArmed(null);
      }
      setSelected(tableId);
    },
    [armed, assign],
  );

  const flaggedTables = useMemo(() => {
    const s = new Set<string>();
    for (const r of results) if (r.status === "broken") r.tableIds.forEach((t) => s.add(t));
    return s;
  }, [results]);
  const flaggedGuests = useMemo(() => {
    const s = new Set<string>();
    for (const r of results) if (r.status === "broken") r.guestIds.forEach((g) => s.add(g));
    return s;
  }, [results]);

  const armedGuest = armed ? guestById[armed] : null;
  const armedTable = armed ? tableOf.get(armed) : undefined;
  const dragGuest = drag ? guestById[drag.guestId] : null;
  const progress = stats.confirmed ? Math.round((stats.confirmedSeated / stats.confirmed) * 100) : 0;

  return (
    <div className={drag ? "cursor-grabbing" : undefined}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Seating plan</h1>
          <p className="text-sm text-muted">
            {stats.confirmedSeated} of {stats.confirmed} attending guests have a seat ({progress}%).
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            reset();
            setSelected(null);
            setArmed(null);
          }}
          className="flex min-h-11 items-center gap-2 rounded-xl border border-line bg-card px-3.5 text-sm font-medium hover:border-brand-500"
        >
          <RotateCcw className="h-4 w-4" aria-hidden /> Reset plan
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Seated" value={String(stats.seated)} sub={`${stats.confirmedSeated} of ${stats.confirmed} attending`} tone="good" />
        <Stat label="Unseated" value={String(stats.toSeat.length)} sub="attending, no seat yet" />
        <Stat label="Not confirmed" value={String(stats.unconfirmed.length)} sub="maybe or awaiting reply" />
        <Stat
          label="Rules"
          value={stats.brokenCount === 0 ? "All kept" : `${stats.brokenCount} broken`}
          sub={stats.openCount ? `${stats.openCount} waiting for a seat` : `${stats.okCount} kept`}
          tone={stats.brokenCount ? "bad" : "good"}
        />
      </div>

      {armedGuest && (
        <div
          role="status"
          className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-brand-600/40 bg-brand-50 px-4 py-3 text-sm"
        >
          <span
            className="grid h-8 w-8 place-items-center rounded-full border-2 text-xs font-semibold"
            style={partyStyle(armedGuest.party)}
            aria-hidden
          >
            {initials(armedGuest.name)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="font-semibold">{armedGuest.name}</span> is selected
            {armedGuest.diet ? ` (${armedGuest.diet})` : ""}. Tap a seat or table to {armedTable ? "move" : "seat"} them.
          </span>
          {armedTable && (
            <button
              type="button"
              onClick={() => {
                unseat(armedGuest.id);
                setArmed(null);
              }}
              className="flex min-h-10 items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 font-medium text-rose-800"
            >
              <UserMinus className="h-4 w-4" aria-hidden /> Unseat
            </button>
          )}
          <button
            type="button"
            onClick={() => setArmed(null)}
            className="flex min-h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3 font-medium"
          >
            <X className="h-4 w-4" aria-hidden /> Cancel
          </button>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="xl:col-start-2 xl:row-start-1">
          <Tray
            toSeat={stats.toSeat}
            unconfirmed={stats.unconfirmed}
            armed={armed}
            dropActive={hover?.kind === "tray"}
            beginDrag={beginDrag}
            onPick={pickGuest}
          />
        </div>

        <div className="min-w-0 xl:col-start-1 xl:row-span-2 xl:row-start-1">
          <Room
            seating={seating}
            selected={selected}
            armed={armed}
            hover={hover}
            flaggedTables={flaggedTables}
            flaggedGuests={flaggedGuests}
            beginDrag={beginDrag}
            onSeat={onSeat}
            onTable={onTable}
            onBackground={() => {
              setSelected(null);
              setArmed(null);
            }}
          />
        </div>

        <div className="grid content-start gap-4 md:grid-cols-2 xl:col-start-2 xl:row-start-2 xl:grid-cols-1">
          <TableDetail
            tableId={selected}
            seating={seating}
            results={results}
            armed={armed}
            beginDrag={beginDrag}
            onPick={pickGuest}
            onUnseat={unseat}
          />
          <div className="grid content-start gap-4">
            <RulesCard
              results={results}
              broken={stats.brokenCount}
              open={stats.openCount}
              ok={stats.okCount}
              onSelectTable={setSelected}
            />
            <TableList seating={seating} selected={selected} flaggedTables={flaggedTables} onSelect={setSelected} />
          </div>
        </div>
      </div>

      {drag && dragGuest && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-50 flex items-center gap-2 rounded-full border bg-white py-1 pl-1 pr-3 text-sm font-medium shadow-xl"
          style={{ left: drag.x + 14, top: drag.y + 14, borderColor: partyStyle(dragGuest.party).borderColor }}
        >
          <span
            className="grid h-7 w-7 place-items-center rounded-full border-2 text-xs font-semibold"
            style={partyStyle(dragGuest.party)}
          >
            {initials(dragGuest.name)}
          </span>
          {dragGuest.name}
        </div>
      )}

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
        {notice && (
          <p
            key={notice.id}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-lg ${
              notice.tone === "warn" ? "bg-rose-700" : "bg-brand-900"
            }`}
          >
            {notice.tone === "warn" ? (
              <TriangleAlert className="h-4 w-4" aria-hidden />
            ) : (
              <CircleCheck className="h-4 w-4" aria-hidden />
            )}
            {notice.text}
          </p>
        )}
      </div>
    </div>
  );
}

export { tableById };
