"use client";

import { AlertTriangle, CheckCircle2, Clock, Armchair, UserX } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { usePlan } from "@/lib/plan-store";

function Tile({
  label,
  value,
  sub,
  icon,
  tone = "default",
  children,
}: {
  label: string;
  value: React.ReactNode;
  sub: React.ReactNode;
  icon: React.ReactNode;
  tone?: "default" | "warn" | "ok";
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-3.5 shadow-xs sm:p-4",
        tone === "warn" && "border-destructive/40 bg-destructive/[0.04]",
      )}
    >
      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>{label}</span>
        <span aria-hidden className={cn(tone === "warn" && "text-destructive", tone === "ok" && "text-primary")}>
          {icon}
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-display text-2xl leading-none font-semibold tabular-nums">{value}</span>
      </div>
      <div className="mt-1.5 text-xs text-muted-foreground">{sub}</div>
      {children}
    </div>
  );
}

export function StatsBar() {
  const { counts, ruleResults, guests } = usePlan();
  const broken = ruleResults.filter((r) => r.status === "broken").length;
  const waiting = ruleResults.filter((r) => r.status === "waiting").length;
  const maybe = guests.filter((g) => g.rsvp === "maybe").length;
  const pending = guests.filter((g) => g.rsvp === "pending").length;
  const pct = counts.attending ? Math.min(100, Math.round(((counts.attending - counts.unseated) / counts.attending) * 100)) : 0;

  return (
    <section aria-label="Seating totals" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Tile
        label="Seated"
        value={counts.seated}
        sub={`of ${counts.attending} attending · ${counts.capacity} seats`}
        icon={<Armchair className="size-4" />}
      >
        <Progress value={pct} aria-label="Share of attending guests seated" className="mt-2.5 h-1.5" />
      </Tile>
      <Tile
        label="Unseated"
        value={counts.unseated}
        sub={counts.unseated === 0 ? "Everyone attending has a seat" : "attending, still to place"}
        icon={<UserX className="size-4" />}
        tone={counts.unseated === 0 ? "ok" : "default"}
      />
      <Tile
        label="Awaiting reply"
        value={counts.awaiting}
        sub={`${maybe} maybe · ${pending} no reply · ${counts.declined} declined`}
        icon={<Clock className="size-4" />}
      />
      <Tile
        label="Couple's rules"
        value={broken === 0 ? "All met" : `${broken} broken`}
        sub={`${ruleResults.length - broken - waiting} met · ${waiting} waiting on seating`}
        icon={broken === 0 ? <CheckCircle2 className="size-4" /> : <AlertTriangle className="size-4" />}
        tone={broken === 0 ? "ok" : "warn"}
      />
    </section>
  );
}
