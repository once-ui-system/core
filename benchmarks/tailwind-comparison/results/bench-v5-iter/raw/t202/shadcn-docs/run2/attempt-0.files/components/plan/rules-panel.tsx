"use client";

import { AlertTriangle, CheckCircle2, Hourglass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ruleKindLabel, type RuleStatus } from "@/lib/rules";
import { usePlan } from "@/lib/plan-store";
import { tables } from "@/lib/data";

const statusMeta: Record<RuleStatus, { label: string; icon: typeof CheckCircle2 }> = {
  broken: { label: "Broken", icon: AlertTriangle },
  ok: { label: "Met", icon: CheckCircle2 },
  waiting: { label: "Waiting", icon: Hourglass },
};

export function RulesPanel() {
  const { ruleResults, byId, selectTable } = usePlan();
  const broken = ruleResults.filter((r) => r.status === "broken");
  const order: RuleStatus[] = ["broken", "waiting", "ok"];
  const sorted = [...ruleResults].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="font-display text-lg">Couple's rules</CardTitle>
        <CardDescription aria-live="polite">
          {broken.length === 0
            ? "No rule is broken right now."
            : `${broken.length} broken: ${broken
                .map((r) => ruleKindLabel[r.rule.kind].toLowerCase())
                .join(", ")}.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        <ul className="space-y-2">
          {sorted.map((r) => {
            const meta = statusMeta[r.status];
            const Icon = meta.icon;
            const names = r.rule.guests.map((id) => byId.get(id)?.name ?? id);
            return (
              <li
                key={r.rule.id}
                className={cn(
                  "rounded-lg border p-3 text-sm",
                  r.status === "broken" && "border-destructive/40 bg-destructive/[0.05]",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      {ruleKindLabel[r.rule.kind]}
                    </div>
                    <div className="mt-0.5 font-medium">{names.join(" & ")}</div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0",
                      r.status === "broken" && "border-destructive/50 bg-destructive/10 text-destructive",
                      r.status === "ok" && "border-primary/30 bg-accent text-accent-foreground",
                      r.status === "waiting" && "text-muted-foreground",
                    )}
                  >
                    <Icon aria-hidden />
                    {meta.label}
                  </Badge>
                </div>
                <p className="mt-1.5 text-muted-foreground">{r.rule.note}</p>
                <p className={cn("mt-1", r.status === "broken" && "font-medium text-destructive")}>{r.detail}</p>
                {r.status === "broken" && r.tables.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {r.tables.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => selectTable(id)}
                        className="inline-flex min-h-8 items-center rounded-md border border-destructive/40 bg-card px-2.5 text-xs font-medium outline-none hover:bg-destructive/10 focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        Show {tables.find((t) => t.id === id)?.name}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
