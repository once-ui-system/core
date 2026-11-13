"use client";

import { useEffect, useState } from "react";
import { Hand, TriangleAlert, Undo2, UserMinus, X } from "lucide-react";

import { PARTIES, PARTY_COLORS, TABLES } from "@/lib/data";
import { GUEST_BY_ID } from "@/lib/plan";
import { usePlan } from "./PlanProvider";
import { RoomPlan } from "./RoomPlan";
import { RulesPanel, TablePanel, UnseatedPanel } from "./PlanPanels";

function Stat({ label, value, sub, tone = "text-stone-900" }: { label: string; value: string | number; sub: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</p>
      <p className={`mt-0.5 text-3xl font-semibold tabular-nums ${tone}`}>{value}</p>
      <p className="text-xs text-stone-500">{sub}</p>
    </div>
  );
}

export default function PlanView() {
  const plan = usePlan();
  const [selectedId, setSelectedId] = useState<string | null>("t-1");
  const [heldId, setHeldId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHeldId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const { counts } = plan;
  const broken = plan.rules.filter((r) => r.status === "broken");
  const held = heldId ? GUEST_BY_ID.get(heldId) : undefined;
  const heldSeated = heldId ? plan.locations.has(heldId) : false;

  const toggleHold = (id: string) => setHeldId((cur) => (cur === id ? null : id));

  const handleSeat = (tableId: string, index: number) => {
    const occupant = plan.seats[tableId][index];
    setSelectedId(tableId);
    if (heldId) {
      if (occupant === heldId) {
        setHeldId(null);
        return;
      }
      if (plan.place(heldId, tableId, index)) setHeldId(null);
      return;
    }
    if (occupant) setHeldId(occupant);
  };

  const handleTable = (tableId: string) => {
    setSelectedId(tableId);
    if (heldId && plan.place(heldId, tableId)) setHeldId(null);
  };

  const handleDropOn = (tableId: string, index: number | undefined, guestId: string) => {
    setDragId(null);
    setSelectedId(tableId);
    plan.place(guestId, tableId, index);
    setHeldId(null);
  };

  const handleDropUnseat = (guestId: string) => {
    setDragId(null);
    if (plan.locations.has(guestId)) plan.unseat(guestId);
    setHeldId(null);
  };

  const seatedPct = Math.round((counts.seatedTotal / counts.capacity) * 100);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">Seating plan</h1>
          <p className="text-sm text-stone-600">Drag a guest onto a seat or table, or tap a guest and then tap where they go.</p>
        </div>
        <button
          type="button"
          onClick={plan.undo}
          disabled={!plan.canUndo}
          className="flex min-h-11 items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 text-sm font-medium text-stone-800 shadow-sm hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Undo2 className="size-4" aria-hidden="true" />
          Undo
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Seated" value={counts.seatedTotal} sub={`of ${counts.capacity} seats · ${seatedPct}% full`} />
        <Stat
          label="Still to seat"
          value={counts.unseatedAttending}
          sub={`attending without a seat${counts.awaitingUnseated ? ` · +${counts.awaitingUnseated} unconfirmed` : ""}`}
          tone={counts.unseatedAttending ? "text-amber-700" : "text-emerald-700"}
        />
        <Stat label="Free seats" value={counts.free} sub={`across ${TABLES.length} tables`} />
        <Stat
          label="Rules broken"
          value={broken.length}
          sub={`${plan.rules.length} rules from the couple`}
          tone={broken.length ? "text-red-700" : "text-emerald-700"}
        />
      </div>

      {broken.length > 0 && (
        <section aria-labelledby="broken-title" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <h2 id="broken-title" className="flex items-center gap-2 text-sm font-semibold text-red-900">
            <TriangleAlert className="size-4" aria-hidden="true" />
            {broken.length === 1 ? "1 rule needs attention" : `${broken.length} rules need attention`}
          </h2>
          <ul className="mt-1.5 space-y-1 text-sm text-red-900">
            {broken.map((r) => (
              <li key={r.index} className="flex flex-wrap items-center gap-x-2">
                <span>
                  <span className="font-semibold">{r.title}.</span> {r.message}
                </span>
                {r.tableIds[0] && (
                  <button
                    type="button"
                    onClick={() => setSelectedId(r.tableIds[0])}
                    className="min-h-9 rounded-md px-2 text-sm font-medium underline underline-offset-2 hover:bg-red-100"
                  >
                    Show table
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {held && (
        <div
          role="status"
          className="sticky top-2 z-30 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-sky-700 px-4 py-2.5 text-sm text-white shadow-lg"
        >
          <Hand className="size-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            Placing <strong>{held.name}</strong>. Tap an empty seat or a table
            {heldSeated ? "; tap a taken seat to swap" : ""}. Press Esc to cancel.
          </span>
          {heldSeated && (
            <button
              type="button"
              onClick={() => {
                plan.unseat(held.id);
                setHeldId(null);
              }}
              className="flex min-h-9 items-center gap-1.5 rounded-lg bg-white/15 px-3 font-medium hover:bg-white/25"
            >
              <UserMinus className="size-4" aria-hidden="true" />
              Unseat
            </button>
          )}
          <button
            type="button"
            onClick={() => setHeldId(null)}
            className="flex min-h-9 items-center gap-1.5 rounded-lg bg-white/15 px-3 font-medium hover:bg-white/25"
          >
            <X className="size-4" aria-hidden="true" />
            Cancel
          </button>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <section aria-label="Room plan" className="min-w-0 space-y-3">
          <RoomPlan
            selectedId={selectedId}
            heldId={heldId}
            dragId={dragId}
            onTable={handleTable}
            onSeat={handleSeat}
            onDragStart={setDragId}
            onDragEnd={() => setDragId(null)}
            onDropOn={handleDropOn}
          />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone-600">
            <span className="flex items-center gap-2" aria-label="Scale: the bar is 5 metres">
              <span className="block h-1.5 w-16 rounded-full bg-stone-700" aria-hidden="true" />5 m · room 24 × 14 m
            </span>
            <ul className="flex flex-wrap gap-x-3 gap-y-1" aria-label="Seat colours by party">
              {PARTIES.map((p) => (
                <li key={p} className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: PARTY_COLORS[p] }} aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-full border-2 border-white bg-amber-400 ring-1 ring-stone-300" aria-hidden="true" />
              Dietary need
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-full border border-dashed border-stone-500" aria-hidden="true" />
              Empty seat
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-full ring-2 ring-red-500" aria-hidden="true" />
              Breaks a rule
            </span>
          </div>
        </section>

        <div className="grid min-w-0 content-start gap-4 md:grid-cols-2 xl:grid-cols-1">
          {selectedId ? (
            <TablePanel
              tableId={selectedId}
              heldId={heldId}
              onHold={toggleHold}
              onClose={() => setSelectedId(null)}
              onDragStart={setDragId}
              onDragEnd={() => setDragId(null)}
            />
          ) : (
            <section className="rounded-xl border border-dashed border-stone-300 bg-white/60 px-4 py-6 text-sm text-stone-600">
              <h2 className="font-semibold text-stone-900">No table selected</h2>
              <p className="mt-1">Select a table on the plan to see who sits there and what they eat.</p>
            </section>
          )}
          <UnseatedPanel
            heldId={heldId}
            dragId={dragId}
            onHold={toggleHold}
            onDragStart={setDragId}
            onDragEnd={() => setDragId(null)}
            onDropUnseat={handleDropUnseat}
          />
          <div className="md:col-span-2 xl:col-span-1">
            <RulesPanel onShowTable={setSelectedId} />
          </div>
        </div>
      </div>
    </div>
  );
}
