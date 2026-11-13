"use client";

import { CircleCheck, Clock, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePlan } from "@/components/plan-provider";
import type { RuleResult } from "@/lib/rules";

function RuleItem({ r }: { r: RuleResult }) {
  const plan = usePlan();
  const broken = r.status === "broken";
  const Icon = broken ? TriangleAlert : r.status === "ok" ? CircleCheck : Clock;
  const body = (
    <>
      <Icon
        aria-hidden="true"
        className={cn(
          "mt-0.5 size-4 shrink-0",
          broken ? "text-destructive" : r.status === "ok" ? "text-emerald-600" : "text-muted-foreground",
        )}
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium">
          <span className="sr-only">{broken ? "Broken: " : r.status === "ok" ? "Kept: " : "Waiting: "}</span>
          {r.title}
        </span>
        <span className={cn("block text-xs", broken ? "text-destructive" : "text-muted-foreground")}>{r.detail}</span>
        <span className="block text-xs text-muted-foreground">{r.rule.note}</span>
      </span>
    </>
  );
  const cls = cn(
    "flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left",
    broken && "bg-destructive/5 outline-none hover:bg-destructive/10 focus-visible:ring-[3px] focus-visible:ring-ring/50",
  );
  return (
    <li>
      {broken ? (
        <button type="button" className={cls} onClick={() => plan.selectTable(r.tables[0] ?? null)}>
          {body}
        </button>
      ) : (
        <div className={cls}>{body}</div>
      )}
    </li>
  );
}

export function RulesSummary() {
  const plan = usePlan();
  const n = plan.brokenRules.length;
  const sorted = [...plan.rules].sort((a, b) => {
    const order = { broken: 0, pending: 1, ok: 2 } as const;
    return order[a.status] - order[b.status];
  });
  return (
    <section aria-labelledby="rules-h" className="rounded-xl border bg-card">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <h2 id="rules-h" className="text-sm font-semibold">
          The couple&apos;s rules
        </h2>
        <Badge variant={n ? "destructive" : "outline"} className="tabular-nums" aria-live="polite">
          {n ? `${n} broken` : "All kept"}
        </Badge>
      </div>
      <ul className="flex flex-col gap-0.5 p-2">
        {sorted.map((r) => (
          <RuleItem key={r.index} r={r} />
        ))}
      </ul>
    </section>
  );
}
