"use client";

import * as React from "react";
import {
  CircleCheck,
  GripVertical,
  Info,
  MousePointerClick,
  TriangleAlert,
  UserMinus,
} from "lucide-react";
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
import { TABLES, partyDot, type Guest } from "@/lib/data";
import { GUESTS_BY_ID, TABLES_BY_ID } from "@/lib/plan";
import { cn } from "@/lib/utils";
import { useDrag } from "@/components/drag-layer";
import { usePlan, type Panel } from "@/components/plan-provider";

function DietBadge({ diet }: { diet: string }) {
  return (
    <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-900">
      {diet}
    </Badge>
  );
}

function TablePicker({
  guestId,
  placeholder,
  excludeTableId,
}: {
  guestId: string;
  placeholder: string;
  excludeTableId?: string;
}) {
  const { seat, perTable } = usePlan();
  const guest = GUESTS_BY_ID[guestId];
  return (
    <div onPointerDown={(e) => e.stopPropagation()}>
      <Select value="" onValueChange={(tid) => seat(guestId, tid)}>
        <SelectTrigger size="sm" className="w-[8.5rem]" aria-label={`${placeholder}: ${guest?.name ?? ""}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {TABLES.filter((t) => t.id !== excludeTableId).map((t) => {
            const free = t.seats - (perTable[t.id] ?? 0);
            return (
              <SelectItem key={t.id} value={t.id} disabled={free <= 0}>
                {t.name} · {free <= 0 ? "full" : `${free} free`}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

function UnplacedRow({ guest }: { guest: Guest }) {
  const { pickedId, pick, guestFlags } = usePlan();
  const drag = useDrag();
  const picked = pickedId === guest.id;
  return (
    <li
      onPointerDown={(e) => drag.onPointerDown(e, guest.id)}
      className={cn(
        "flex select-none items-center gap-1 rounded-lg border bg-card py-1.5 pr-2 pl-1 touch-pan-y",
        picked && "border-primary bg-accent ring-2 ring-primary/30",
        drag.dragId === guest.id && "opacity-40",
        guestFlags.has(guest.id) && "border-red-400",
      )}
    >
      <span
        aria-hidden="true"
        className="grid h-8 w-6 shrink-0 cursor-grab touch-none place-items-center text-muted-foreground"
      >
        <GripVertical className="size-4" />
      </span>
      <button
        type="button"
        onClick={() => pick(picked ? null : guest.id)}
        aria-pressed={picked}
        className="min-w-0 flex-1 rounded-md px-1 py-0.5 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <span className="block truncate text-sm font-medium">{guest.name}</span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span
              aria-hidden="true"
              className="size-2 rounded-full"
              style={{ backgroundColor: partyDot(guest.party) }}
            />
            {guest.party}
          </span>
          {guest.diet ? <span className="text-amber-800">{guest.diet}</span> : null}
          {guest.rsvp !== "yes" ? (
            <span className="italic">{guest.rsvp === "maybe" ? "maybe" : "no reply yet"}</span>
          ) : null}
        </span>
      </button>
      <TablePicker guestId={guest.id} placeholder="Seat at…" />
    </li>
  );
}

function PlaceTab() {
  const { toPlace, awaiting, seatedCount } = usePlan();
  const drag = useDrag();
  const dropActive = drag.over?.kind === "unseat";
  return (
    <div
      data-drop="unseat"
      className={cn(
        "space-y-4 rounded-xl border border-dashed border-transparent p-1 transition-colors",
        drag.dragId && "border-primary/40 bg-accent/40",
        dropActive && "border-primary bg-accent",
      )}
    >
      <section aria-labelledby="to-place-heading" className="space-y-2">
        <h3 id="to-place-heading" className="text-sm font-semibold">
          Attending, no seat yet <span className="font-normal text-muted-foreground">({toPlace.length})</span>
        </h3>
        {toPlace.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg border bg-card p-3 text-sm text-muted-foreground">
            <CircleCheck className="size-4 text-emerald-600" aria-hidden="true" />
            Everyone attending has a seat.
          </div>
        ) : (
          <ul className="space-y-1.5">
            {toPlace.map((guest) => (
              <UnplacedRow key={guest.id} guest={guest} />
            ))}
          </ul>
        )}
      </section>

      {awaiting.length > 0 ? (
        <section aria-labelledby="awaiting-heading" className="space-y-2">
          <h3 id="awaiting-heading" className="text-sm font-semibold">
            Not confirmed <span className="font-normal text-muted-foreground">({awaiting.length})</span>
          </h3>
          <ul className="space-y-1.5">
            {awaiting.map((guest) => (
              <UnplacedRow key={guest.id} guest={guest} />
            ))}
          </ul>
        </section>
      ) : null}

      <p className="flex gap-2 rounded-lg bg-muted/70 p-2.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <span>
          Drag a guest onto a seat or table, or tap a guest and then a seat. Drop a seated guest here to
          unseat them. {seatedCount} guests are seated so far.
        </span>
      </p>
    </div>
  );
}

function TableTab() {
  const { selectedTableId, seating, results, perTable, pick, pickedId, unseat } = usePlan();
  if (!selectedTableId) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        <MousePointerClick className="size-6" aria-hidden="true" />
        <p>Select a table on the plan to see who sits there and what they can eat.</p>
      </div>
    );
  }
  const table = TABLES_BY_ID[selectedTableId];
  if (!table) return null;
  const list = seating[selectedTableId] ?? [];
  const count = perTable[selectedTableId] ?? 0;
  const diets = new Map<string, number>();
  for (const id of list) {
    const d = id ? GUESTS_BY_ID[id]?.diet : null;
    if (d) diets.set(d, (diets.get(d) ?? 0) + 1);
  }
  const related = results.filter((r) => r.status !== "ok" && r.tableIds.includes(selectedTableId));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">{table.name}</h3>
        <p className="text-sm text-muted-foreground">
          {count} of {table.seats} seats filled · {table.seats - count} free
        </p>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label={`${table.name} seats filled`}
          aria-valuemin={0}
          aria-valuemax={table.seats}
          aria-valuenow={count}
        >
          <div className="h-full rounded-full bg-primary" style={{ width: `${(count / table.seats) * 100}%` }} />
        </div>
      </div>

      <section aria-labelledby="diet-heading" className="space-y-1.5">
        <h4 id="diet-heading" className="text-sm font-semibold">
          Dietary needs at this table
        </h4>
        {diets.size === 0 ? (
          <p className="text-sm text-muted-foreground">None listed.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {Array.from(diets.entries()).map(([d, n]) => (
              <DietBadge key={d} diet={`${n}× ${d}`} />
            ))}
          </div>
        )}
      </section>

      {related.length > 0 ? (
        <ul className="space-y-1.5">
          {related.map((r) => (
            <li
              key={r.index}
              className={cn(
                "flex gap-2 rounded-lg border p-2.5 text-sm",
                r.status === "broken"
                  ? "border-red-300 bg-red-50 text-red-950"
                  : "border-amber-300 bg-amber-50 text-amber-950",
              )}
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                <span className="font-medium">{r.headline}.</span> {r.detail}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <section aria-labelledby="seats-heading" className="space-y-1.5">
        <h4 id="seats-heading" className="text-sm font-semibold">
          Seats
        </h4>
        <ol className="space-y-1.5">
          {list.map((id, i) => {
            const guest = id ? GUESTS_BY_ID[id] : undefined;
            if (!guest) {
              return (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground"
                >
                  <span className="w-4 text-right text-xs tabular-nums">{i + 1}</span>
                  Open seat
                </li>
              );
            }
            return (
              <li
                key={i}
                className={cn(
                  "flex items-center gap-2 rounded-lg border bg-card py-1.5 pr-1.5 pl-3",
                  pickedId === guest.id && "border-primary bg-accent",
                )}
              >
                <span className="w-4 text-right text-xs tabular-nums text-muted-foreground">{i + 1}</span>
                <button
                  type="button"
                  onClick={() => pick(pickedId === guest.id ? null : guest.id)}
                  aria-pressed={pickedId === guest.id}
                  className="min-w-0 flex-1 rounded-md px-1 py-0.5 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <span className="block truncate text-sm font-medium">{guest.name}</span>
                  <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span
                        aria-hidden="true"
                        className="size-2 rounded-full"
                        style={{ backgroundColor: partyDot(guest.party) }}
                      />
                      {guest.party}
                    </span>
                    {guest.diet ? <span className="font-medium text-amber-800">{guest.diet}</span> : null}
                  </span>
                </button>
                <TablePicker guestId={guest.id} placeholder="Move to…" excludeTableId={selectedTableId} />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => unseat(guest.id)}
                  aria-label={`Unseat ${guest.name}`}
                >
                  <UserMinus />
                </Button>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

export function RulesList() {
  const { results, selectTable, setPanel } = usePlan();
  const order = { broken: 0, open: 1, ok: 2 } as const;
  const sorted = [...results].sort((a, b) => order[a.status] - order[b.status]);
  return (
    <ul className="space-y-2">
      {sorted.map((r) => (
        <li
          key={r.index}
          className={cn(
            "rounded-lg border p-3 text-sm",
            r.status === "broken" && "border-red-300 bg-red-50",
            r.status === "open" && "border-amber-300 bg-amber-50",
            r.status === "ok" && "bg-card",
          )}
        >
          <div className="flex items-start gap-2">
            {r.status === "ok" ? (
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
            ) : (
              <TriangleAlert
                className={cn("mt-0.5 size-4 shrink-0", r.status === "broken" ? "text-red-600" : "text-amber-600")}
                aria-hidden="true"
              />
            )}
            <div className="min-w-0 space-y-1">
              <p className="font-medium">
                {r.headline}
                <span className="sr-only">
                  {r.status === "broken" ? " (broken)" : r.status === "open" ? " (waiting)" : " (met)"}
                </span>
              </p>
              <p className="text-muted-foreground">{r.detail}</p>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium uppercase">
                  {r.rule.kind === "together" ? "Keep together" : r.rule.kind === "apart" ? "Keep apart" : "Seat near"}
                </span>{" "}
                · {r.rule.note}
              </p>
              {r.tableIds.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {r.tableIds.map((tid) => (
                    <Button
                      key={tid}
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => {
                        selectTable(tid);
                        setPanel("table");
                      }}
                    >
                      {TABLES_BY_ID[tid]?.name}
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function PlanPanel() {
  const { panel, setPanel, toPlace, results } = usePlan();
  const broken = results.filter((r) => r.status === "broken").length;
  return (
    <Tabs value={panel} onValueChange={(v) => setPanel(v as Panel)} className="gap-3">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="place">
          To place
          <Badge variant="secondary" className="px-1.5 tabular-nums">
            {toPlace.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="table">Table</TabsTrigger>
        <TabsTrigger value="rules">
          Rules
          {broken > 0 ? (
            <Badge variant="destructive" className="px-1.5 tabular-nums">
              {broken}
            </Badge>
          ) : null}
        </TabsTrigger>
      </TabsList>
      <div className="min-[1180px]:max-h-[calc(100svh-14rem)] min-[1180px]:overflow-y-auto min-[1180px]:pr-1">
        <TabsContent value="place">
          <PlaceTab />
        </TabsContent>
        <TabsContent value="table">
          <TableTab />
        </TabsContent>
        <TabsContent value="rules">
          <RulesList />
        </TabsContent>
      </div>
    </Tabs>
  );
}
