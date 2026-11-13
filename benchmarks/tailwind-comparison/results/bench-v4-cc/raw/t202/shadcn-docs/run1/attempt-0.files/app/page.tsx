"use client";

import { useEffect } from "react";
import { LayoutGrid, List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { EVENT, GUESTS, GUEST_BY_ID, ROOM, TABLES, TOTAL_SEATS, formatEventDate } from "@/lib/data";
import { usePlan } from "@/components/plan-provider";
import { FloorPlan } from "@/components/floor-plan";
import { TableList } from "@/components/table-list";
import { UnseatedPanel } from "@/components/unseated-panel";
import { RulesSummary } from "@/components/rules-summary";
import { TableDetail } from "@/components/table-detail";

function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: number | string;
  hint: string;
  tone?: "default" | "warn" | "bad" | "good";
}) {
  return (
    <div className="rounded-xl border bg-card px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-0.5 text-2xl font-semibold tabular-nums tracking-tight",
          tone === "warn" && "text-amber-700",
          tone === "bad" && "text-destructive",
          tone === "good" && "text-emerald-700",
        )}
      >
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export default function PlanPage() {
  const plan = usePlan();
  const { pick } = plan;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") pick(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pick]);

  const picked = plan.picked ? GUEST_BY_ID[plan.picked] : null;
  const pickedSeated = picked ? !!plan.tableOf[picked.id] : false;
  const broken = plan.brokenRules.length;

  return (
    <main id="main" className="mx-auto max-w-[1500px] px-4 pb-28 pt-5 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        <div>
          <p className="text-sm text-muted-foreground">
            {formatEventDate()} · {EVENT.venue}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{EVENT.name}</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Room {ROOM.width} × {ROOM.depth} m · {TABLES.length} tables · {TOTAL_SEATS} seats · {GUESTS.length} invited
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Seated" value={plan.seatedCount} hint={`of ${TOTAL_SEATS} seats · ${plan.openSeats} open`} tone="good" />
        <Stat
          label="Unseated"
          value={plan.unseatedAttending.length}
          hint={`of ${plan.attendingCount} attending`}
          tone={plan.unseatedAttending.length ? "warn" : "good"}
        />
        <Stat label="Attending" value={plan.attendingCount} hint={`${GUESTS.length} invited`} />
        <Stat
          label="Rules"
          value={broken ? `${broken} broken` : "All kept"}
          hint={`${plan.rules.length} rules from the couple`}
          tone={broken ? "bad" : "good"}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-4">
          <Tabs defaultValue="plan" className="gap-3">
            <TabsList aria-label="Plan view">
              <TabsTrigger value="plan" className="gap-1.5 px-3">
                <LayoutGrid className="size-4" aria-hidden="true" /> Floor plan
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-1.5 px-3">
                <List className="size-4" aria-hidden="true" /> Table list
              </TabsTrigger>
            </TabsList>
            <TabsContent value="plan">
              <FloorPlan />
            </TabsContent>
            <TabsContent value="list">
              <TableList />
            </TabsContent>
          </Tabs>
          <TableDetail />
        </div>

        <aside aria-label="Rules and unseated guests" className="flex min-w-0 flex-col gap-4">
          <RulesSummary />
          <UnseatedPanel />
        </aside>
      </div>

      {picked && (
        <div
          role="status"
          className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-xl items-center gap-3 rounded-xl bg-primary px-4 py-3 text-primary-foreground shadow-xl"
        >
          <p className="min-w-0 flex-1 text-sm">
            <span className="font-semibold">{pickedSeated ? "Moving" : "Placing"} {picked.name}.</span>{" "}
            <span className="opacity-85">Tap a seat or a table.</span>
          </p>
          {pickedSeated && (
            <Button size="sm" variant="secondary" onClick={() => plan.unseat(picked.id)}>
              Unseat
            </Button>
          )}
          <Button size="icon-sm" variant="ghost" aria-label="Cancel" className="hover:bg-white/15 hover:text-primary-foreground" onClick={() => plan.pick(null)}>
            <X />
          </Button>
        </div>
      )}
    </main>
  );
}
