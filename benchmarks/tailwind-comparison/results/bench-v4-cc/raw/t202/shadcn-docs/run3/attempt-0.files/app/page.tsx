"use client";

import { GuestAvatar } from "@/components/guest-row";
import { usePlan } from "@/components/plan-provider";
import { PlanSidebar } from "@/components/plan-sidebar";
import { PlanLegend, RoomPlan } from "@/components/room-plan";
import { Button } from "@/components/ui/button";
import { EVENT, GUEST_BY_ID, ROOM } from "@/lib/data";
import { formatEventDate } from "@/lib/format";
import { cn } from "@/lib/utils";

function Stat({
  label,
  value,
  caption,
  tone,
}: {
  label: string;
  value: number;
  caption?: string;
  tone?: "alert" | "good";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card px-4 py-3 shadow-xs",
        tone === "alert" && "border-destructive/40 bg-destructive/5",
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          "text-2xl font-semibold tracking-tight tabular-nums",
          tone === "alert" && "text-destructive",
          tone === "good" && "text-emerald-700",
        )}
      >
        {value}
      </p>
      {caption && <p className="truncate text-xs text-muted-foreground">{caption}</p>}
    </div>
  );
}

export default function PlanPage() {
  const plan = usePlan();
  const { counts } = plan;
  const held = plan.heldGuestId ? GUEST_BY_ID[plan.heldGuestId] : undefined;
  const progress = counts.attending ? Math.round((counts.seated / counts.attending) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Seating plan</h1>
          <p className="text-sm text-muted-foreground">
            {EVENT.name} · {formatEventDate()} · {EVENT.venue} · {ROOM.width} × {ROOM.depth} m room
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={plan.undo} disabled={!plan.canUndo}>
          Undo last change
        </Button>
      </div>

      <section aria-label="Seating summary" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Attending" value={counts.attending} caption={`${counts.awaiting} awaiting reply, ${counts.declined} declined`} />
        <Stat
          label="Seated"
          value={counts.seated}
          tone={counts.toSeat === 0 ? "good" : undefined}
          caption={
            counts.awaitingSeated > 0
              ? `${progress}% of attending, plus ${counts.awaitingSeated} unconfirmed`
              : `${progress}% of attending`
          }
        />
        <Stat label="Unseated" value={counts.toSeat} caption="Attending, no seat yet" />
        <Stat
          label="Rules broken"
          value={plan.brokenResults.length}
          tone={plan.brokenResults.length > 0 ? "alert" : "good"}
          caption={`of ${plan.results.length} couple's rules`}
        />
      </section>

      <div aria-live="polite">
        {plan.brokenResults.length > 0 && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-3">
            <h2 className="mb-1.5 text-sm font-semibold text-destructive">
              {plan.brokenResults.length === 1 ? "1 rule needs attention" : `${plan.brokenResults.length} rules need attention`}
            </h2>
            <ul className="space-y-1">
              {plan.brokenResults.map((r) => {
                const first = r.tableIds[0];
                return (
                  <li key={r.id} className="flex flex-wrap items-baseline gap-x-2 text-sm">
                    <span className="font-medium">{r.title}:</span>
                    <span className="text-muted-foreground">{r.detail}</span>
                    {first && (
                      <button
                        type="button"
                        onClick={() => plan.inspectTable(first)}
                        className="rounded text-xs font-medium text-destructive underline underline-offset-2 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        Show on plan
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {held && (
          <div
            role="status"
            className="mt-3 flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-sm"
          >
            <GuestAvatar guest={held} />
            <span className="min-w-0 flex-1">
              Placing <strong>{held.name}</strong>. Tap an empty seat or a table, or tap an occupied seat to swap.
            </span>
            <Button type="button" size="sm" variant="outline" onClick={() => plan.holdGuest(null)}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-3">
          <RoomPlan />
          <PlanLegend />
          <p className="text-xs text-muted-foreground">
            Drag a guest onto a seat, or tap a guest and then a seat. Drop a seated guest onto the To seat list to unseat them.
          </p>
        </div>
        <PlanSidebar />
      </div>
    </div>
  );
}
