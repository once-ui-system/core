"use client";

import * as React from "react";
import { CircleCheck, Hand, MapPin, TriangleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EVENT, GUESTS, formatEventDate } from "@/lib/data";
import { GUESTS_BY_ID, TABLES_BY_ID } from "@/lib/plan";
import { cn } from "@/lib/utils";
import { DragProvider } from "@/components/drag-layer";
import { FloorPlan, PartyLegend, TableChips } from "@/components/floor-plan";
import { PlanPanel } from "@/components/plan-panel";
import { usePlan } from "@/components/plan-provider";

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  hint: string;
  tone?: "bad" | "warn" | "good";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-3 shadow-xs sm:p-4",
        tone === "bad" && "border-red-300",
        tone === "good" && "border-emerald-300",
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function StatStrip() {
  const { seatedCount, attendingCount, toPlace, awaiting, totalSeats, results } = usePlan();
  const broken = results.filter((r) => r.status === "broken").length;
  const open = results.filter((r) => r.status === "open").length;
  const declined = GUESTS.filter((g) => g.rsvp === "no").length;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-live="polite">
      <Stat label="Seated" value={seatedCount} hint={`of ${totalSeats} seats · ${totalSeats - seatedCount} free`} />
      <Stat
        label="Still to place"
        value={toPlace.length}
        hint={`${attendingCount} attending in all`}
        tone={toPlace.length === 0 ? "good" : undefined}
      />
      <Stat
        label="Rules broken"
        value={broken}
        hint={`${open} waiting · ${results.length - broken - open} met`}
        tone={broken > 0 ? "bad" : "good"}
      />
      <Stat label="Not confirmed" value={awaiting.length} hint={`unseated · ${declined} declined`} />
    </div>
  );
}

function RuleBanner() {
  const { results, setPanel } = usePlan();
  const broken = results.filter((r) => r.status === "broken");
  const open = results.filter((r) => r.status === "open");
  const review = () => {
    setPanel("rules");
    document.getElementById("side-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const good = broken.length === 0;
  return (
    <section
      aria-label="Rule check"
      className={cn(
        "flex flex-wrap items-start gap-3 rounded-xl border p-3 sm:p-4",
        good ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50",
      )}
    >
      {good ? (
        <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
      ) : (
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden="true" />
      )}
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-semibold">
          {good
            ? "None of the couple's rules is broken"
            : `${broken.length} of the couple's ${results.length} rules ${broken.length === 1 ? "is" : "are"} broken`}
          {open.length > 0 ? (
            <span className="font-normal text-muted-foreground"> · {open.length} waiting on a seat</span>
          ) : null}
        </p>
        {broken.length > 0 ? (
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {broken.map((r) => (
              <li key={r.index}>
                {r.headline}. <span className="text-muted-foreground">{r.detail}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={review}>
        Review rules
      </Button>
    </section>
  );
}

function PickBar() {
  const { pickedId, tableOf, pick, unseat } = usePlan();
  if (!pickedId) return null;
  const guest = GUESTS_BY_ID[pickedId];
  if (!guest) return null;
  const at = tableOf[pickedId];
  return (
    <div
      role="status"
      className="sticky top-16 z-30 flex flex-wrap items-center gap-3 rounded-xl border border-primary bg-primary p-3 text-primary-foreground shadow-lg"
    >
      <Hand className="size-4 shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1 text-sm">
        <span className="font-semibold">
          {at ? "Moving" : "Placing"} {guest.name}
        </span>
        {at ? ` from ${TABLES_BY_ID[at]?.name}` : ""}. Tap an open seat, or a table for its next free seat.
      </p>
      {at ? (
        <Button type="button" size="sm" variant="secondary" onClick={() => unseat(pickedId)}>
          Unseat
        </Button>
      ) : null}
      <Button type="button" size="sm" variant="secondary" onClick={() => pick(null)}>
        <X /> Cancel
      </Button>
    </div>
  );
}

export function PlanView() {
  return (
    <DragProvider>
      <main id="main" className="mx-auto w-full max-w-[1600px] space-y-4 px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Seating plan</h1>
            <p className="text-sm text-muted-foreground">
              {EVENT.name} · {formatEventDate(EVENT.date)}
            </p>
          </div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" aria-hidden="true" />
            {EVENT.venue}
          </p>
        </div>

        <StatStrip />
        <RuleBanner />
        <PickBar />

        <div className="grid gap-4 min-[1180px]:grid-cols-[minmax(0,1fr)_380px] min-[1180px]:items-start">
          <section aria-label="Room plan" className="min-w-0 space-y-3">
            <FloorPlan />
            <TableChips />
            <PartyLegend />
          </section>
          <aside id="side-panel" aria-label="Guests, table details and rules" className="min-w-0 scroll-mt-20">
            <PlanPanel />
          </aside>
        </div>
      </main>
    </DragProvider>
  );
}
