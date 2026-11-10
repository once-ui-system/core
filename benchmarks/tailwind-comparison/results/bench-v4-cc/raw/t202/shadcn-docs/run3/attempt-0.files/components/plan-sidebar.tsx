"use client";

import * as React from "react";
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import { GuestRow } from "@/components/guest-row";
import { usePlan, type Panel } from "@/components/plan-provider";
import { DietBadge } from "@/components/rsvp-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GUEST_BY_ID, GUESTS, TABLE_BY_ID, TABLES } from "@/lib/data";
import { firstName } from "@/lib/format";
import { cn } from "@/lib/utils";

function ToSeatPanel() {
  const plan = usePlan();
  const [dropActive, setDropActive] = React.useState(false);
  const toSeat = GUESTS.filter((x) => x.rsvp === "yes" && !plan.placements[x.id]);
  const awaiting = GUESTS.filter((x) => (x.rsvp === "maybe" || x.rsvp === "pending") && !plan.placements[x.id]);
  const declined = GUESTS.filter((x) => x.rsvp === "no");
  const dragged = plan.dragId ? GUEST_BY_ID[plan.dragId] : undefined;
  const canDropHere = Boolean(dragged && plan.placements[dragged.id]);

  return (
    <div
      onDragOver={(e) => {
        if (!canDropHere) return;
        e.preventDefault();
        setDropActive(true);
      }}
      onDragLeave={() => setDropActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDropActive(false);
        if (plan.dragId) plan.unseat(plan.dragId);
        plan.setDragId(null);
      }}
      className={cn(
        "space-y-4 rounded-lg p-1 transition-colors",
        canDropHere && "outline-2 outline-dashed outline-primary/40",
        dropActive && "bg-primary/5",
      )}
    >
      {canDropHere && (
        <p className="rounded-md bg-primary/10 px-3 py-2 text-center text-xs font-medium text-primary">
          Drop here to unseat {dragged ? firstName(dragged.name) : "guest"}
        </p>
      )}
      <section aria-labelledby="to-seat-heading">
        <h3 id="to-seat-heading" className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Attending, no seat ({toSeat.length})
        </h3>
        {toSeat.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            Everyone attending has a seat.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {toSeat.map((x) => (
              <li key={x.id}>
                <GuestRow guest={x} />
              </li>
            ))}
          </ul>
        )}
      </section>
      {awaiting.length > 0 && (
        <section aria-labelledby="awaiting-heading">
          <h3 id="awaiting-heading" className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Not confirmed yet ({awaiting.length})
          </h3>
          <ul className="space-y-1.5">
            {awaiting.map((x) => (
              <li key={x.id}>
                <GuestRow guest={x} />
              </li>
            ))}
          </ul>
        </section>
      )}
      {declined.length > 0 && (
        <p className="px-1 text-xs text-muted-foreground">
          Declined, not seated: {declined.map((x) => x.name).join(", ")}.
        </p>
      )}
    </div>
  );
}

function TablePanel() {
  const plan = usePlan();
  const table = plan.selectedTableId ? TABLE_BY_ID[plan.selectedTableId] : undefined;

  const picker = (
    <Select value={plan.selectedTableId ?? ""} onValueChange={(v) => plan.selectTable(v)}>
      <SelectTrigger className="w-full" aria-label="Choose a table">
        <SelectValue placeholder="Choose a table" />
      </SelectTrigger>
      <SelectContent>
        {TABLES.map((t) => {
          const filled = (plan.seatsByTable[t.id] ?? []).filter(Boolean).length;
          return (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
              <span className="ml-1 text-muted-foreground">
                {filled}/{t.seats}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );

  if (!table) {
    return (
      <div className="space-y-3">
        {picker}
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Tap a table on the plan to see who is sitting there and what they eat.
        </p>
      </div>
    );
  }

  const seats = plan.seatsByTable[table.id] ?? [];
  const seated = seats.filter((x): x is string => x !== null).map((gid) => GUEST_BY_ID[gid]).filter((x) => x !== undefined);
  const diets: Record<string, number> = {};
  for (const x of seated) if (x.diet) diets[x.diet] = (diets[x.diet] ?? 0) + 1;
  const dietEntries = Object.entries(diets);
  const broken = plan.brokenByTable[table.id] ?? [];

  return (
    <div className="space-y-3">
      {picker}
      <div>
        <h3 className="text-lg font-semibold tracking-tight">{table.name}</h3>
        <p className="text-sm text-muted-foreground">
          {seated.length} of {table.seats} seats filled
          {seated.length < table.seats && `, ${table.seats - seated.length} free`}
        </p>
      </div>

      {broken.length > 0 && (
        <ul className="space-y-1.5" aria-label="Broken rules at this table">
          {broken.map((r) => (
            <li
              key={r.id}
              className="flex gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-2.5 text-sm"
            >
              <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
              <span>
                <span className="font-medium">{r.title}.</span> {r.detail}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-lg border bg-secondary/50 p-3">
        <h4 className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Dietary needs</h4>
        {dietEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No dietary needs at this table.</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {dietEntries.map(([diet, n]) => (
              <li key={diet}>
                <DietBadge diet={`${n} × ${diet}`} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <ol className="space-y-1.5" aria-label={`Seats at ${table.name}`}>
        {seats.map((gid, index) => {
          const guest = gid ? GUEST_BY_ID[gid] : undefined;
          return (
            <li key={index} className="flex items-start gap-2">
              <span className="mt-3 w-5 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{index + 1}</span>
              <div className="min-w-0 flex-1">
                {guest ? (
                  <GuestRow guest={guest} />
                ) : (
                  <button
                    type="button"
                    disabled={!plan.heldGuestId}
                    onClick={() => {
                      if (plan.heldGuestId && plan.place(plan.heldGuestId, table.id, index)) plan.holdGuest(null);
                    }}
                    className={cn(
                      "flex h-[3.25rem] w-full items-center rounded-lg border border-dashed px-3 text-left text-sm text-muted-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                      plan.heldGuestId && "border-primary/60 bg-primary/5 text-primary",
                    )}
                  >
                    {plan.heldGuestId ? "Place here" : "Empty seat"}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function RulesPanel() {
  const plan = usePlan();
  return (
    <ul className="space-y-2">
      {plan.results.map((r) => {
        const first = r.tableIds[0];
        return (
          <li
            key={r.id}
            className={cn(
              "rounded-lg border p-3",
              r.status === "broken" && "border-destructive/40 bg-destructive/5",
            )}
          >
            <div className="flex items-start gap-2">
              {r.status === "broken" ? (
                <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
              ) : r.status === "ok" ? (
                <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
              ) : (
                <span aria-hidden className="mt-1.5 ml-1 size-2 shrink-0 rounded-full bg-amber-500" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug font-medium">{r.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{r.rule.note}</p>
                <p className="mt-1.5 text-xs">{r.detail}</p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  r.status === "broken" && "border-destructive/50 bg-destructive/10 text-destructive",
                  r.status === "ok" && "border-emerald-300 bg-emerald-50 text-emerald-900",
                  r.status === "waiting" && "border-amber-300 bg-amber-50 text-amber-900",
                )}
              >
                {r.status === "broken" ? "Broken" : r.status === "ok" ? "Kept" : "Waiting"}
              </Badge>
            </div>
            {first && (
              <Button type="button" variant="outline" size="xs" className="mt-2" onClick={() => plan.inspectTable(first)}>
                Show {TABLE_BY_ID[first]?.name ?? "table"}
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function PlanSidebar() {
  const plan = usePlan();
  return (
    <Tabs
      value={plan.panel}
      onValueChange={(v) => plan.setPanel(v as Panel)}
      className="rounded-xl border bg-card p-3 shadow-xs lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto"
    >
      <TabsList className="w-full">
        <TabsTrigger value="unseated">
          To seat
          <span className="rounded-full bg-primary px-1.5 text-[11px] leading-5 text-primary-foreground tabular-nums">
            {plan.counts.toSeat}
          </span>
        </TabsTrigger>
        <TabsTrigger value="table">Table</TabsTrigger>
        <TabsTrigger value="rules">
          Rules
          {plan.brokenResults.length > 0 && (
            <span className="rounded-full bg-destructive px-1.5 text-[11px] leading-5 text-white tabular-nums">
              {plan.brokenResults.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="unseated" className="pt-1">
        <ToSeatPanel />
      </TabsContent>
      <TabsContent value="table" className="pt-1">
        <TablePanel />
      </TabsContent>
      <TabsContent value="rules" className="pt-1">
        <RulesPanel />
      </TabsContent>
    </Tabs>
  );
}
