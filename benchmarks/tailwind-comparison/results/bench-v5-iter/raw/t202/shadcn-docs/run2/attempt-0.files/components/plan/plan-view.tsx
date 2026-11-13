"use client";

import * as React from "react";
import { Hand, UserMinus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { event, parties } from "@/lib/data";
import { usePlan } from "@/lib/plan-store";
import { PartyDot } from "./guest-chip";
import { Room } from "./room";
import { RulesPanel } from "./rules-panel";
import { StatsBar } from "./stats-bar";
import { TablePanel } from "./table-panel";
import { UnseatedStrip } from "./unseated-strip";

function ArmedBanner() {
  const { armed, arm, byId, unseat } = usePlan();
  const guest = armed ? byId.get(armed) : undefined;

  React.useEffect(() => {
    if (!armed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") arm(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [armed, arm]);

  return (
    <div role="status" aria-live="polite">
      {guest && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border-2 border-primary bg-accent px-3.5 py-2.5 text-sm text-accent-foreground">
          <Hand className="size-4 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1 basis-56">
            <strong className="font-semibold">{guest.name}</strong>{" "}
            {guest.table ? "is picked up to move." : "is picked up."} Tap a seat or a table to place them.
          </span>
          <div className="flex gap-2">
            {guest.table && (
              <Button size="sm" variant="outline" onClick={() => unseat(guest.id)}>
                <UserMinus /> Unseat
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => arm(null)}>
              <X /> Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function PlanView() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{event.name}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground lg:hidden">
          {event.venue} · 19 June 2027
        </p>
      </div>

      <StatsBar />

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="xl:col-start-2 xl:row-start-1">
          <UnseatedStrip />
        </div>
        <section aria-label="Room plan" className="min-w-0 space-y-3 xl:col-start-1 xl:row-span-3 xl:row-start-1">
          <ArmedBanner />
          <Room />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {event.room_m.width} × {event.room_m.depth} m, drawn to scale
            </span>
            {parties.map((p) => (
              <span key={p} className="inline-flex items-center gap-1.5">
                <PartyDot party={p} /> {p}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="inline-block size-2.5 rounded-full bg-diet" />
              Dietary need
            </span>
          </div>
        </section>

        <div className="xl:col-start-2 xl:row-start-2">
          <TablePanel />
        </div>
        <div className="xl:col-start-2 xl:row-start-3">
          <RulesPanel />
        </div>
      </div>
    </div>
  );
}
