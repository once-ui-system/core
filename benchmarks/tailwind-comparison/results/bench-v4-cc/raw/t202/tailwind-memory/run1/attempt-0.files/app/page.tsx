"use client";

import { Hand, X } from "lucide-react";
import FloorPlan from "@/components/FloorPlan";
import RulesPanel from "@/components/RulesPanel";
import TablePanel from "@/components/TablePanel";
import UnseatedPanel from "@/components/UnseatedPanel";
import { Card } from "@/components/ui";
import { event, formatDate, guestById } from "@/lib/data";
import { usePlan } from "@/lib/plan";

function Stat({ label, value, hint, tone }: { label: string; value: number; hint: string; tone?: "warn" | "good" }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">{label}</p>
      <p
        className={`mt-1 text-3xl font-semibold tabular-nums ${
          tone === "warn" ? "text-amber-700" : tone === "good" ? "text-emerald-700" : "text-stone-900"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-stone-500">{hint}</p>
    </div>
  );
}

export default function PlanPage() {
  const plan = usePlan();
  const { counts } = plan;
  const holding = plan.holding ? guestById.get(plan.holding) : undefined;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">{event.name}</h1>
        <p className="text-sm text-stone-600">
          {formatDate(event.date)} · {event.venue} · {event.room.width} × {event.room.depth} m room
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Attending" value={counts.confirmed} hint="confirmed yes" />
        <Stat label="Seated" value={counts.seated} hint={`of ${counts.capacity} seats`} />
        <Stat
          label="To seat"
          value={counts.toSeat}
          hint="attending, no seat"
          tone={counts.toSeat > 0 ? "warn" : "good"}
        />
        <Stat label="Awaiting" value={counts.awaiting} hint="maybe or no reply" />
        <Stat label="Declined" value={counts.declined} hint="not coming" />
      </div>

      <div className="min-h-6" role="status" aria-live="polite">
        {holding ? (
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-teal-700 px-4 py-2.5 text-sm text-white">
            <Hand className="size-4" aria-hidden />
            <span className="flex-1">
              Moving <strong>{holding.name}</strong>: tap a seat or table, or press Escape to cancel.
            </span>
            {plan.seats[holding.id] ? (
              <button
                type="button"
                onClick={() => plan.unseat(holding.id)}
                className="min-h-11 rounded-lg bg-white/15 px-3 font-medium hover:bg-white/25"
              >
                Unseat
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => plan.hold(null)}
              className="flex min-h-11 items-center gap-1 rounded-lg bg-white/15 px-3 font-medium hover:bg-white/25"
            >
              <X className="size-4" aria-hidden /> Cancel
            </button>
          </div>
        ) : plan.notice ? (
          <p className="text-sm text-stone-700">{plan.notice}</p>
        ) : (
          <p className="text-sm text-stone-500">
            Drag a guest to a seat, or tap a guest and then a seat. Tap a table to see its guests.
          </p>
        )}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card title="Room plan" className="overflow-hidden">
          <FloorPlan />
        </Card>
        <div className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-1">
          <RulesPanel />
          <TablePanel />
          <div className="md:col-span-2 xl:col-span-1">
            <UnseatedPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
