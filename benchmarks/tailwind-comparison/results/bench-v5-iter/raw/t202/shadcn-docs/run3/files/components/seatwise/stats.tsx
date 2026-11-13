"use client"

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { usePlan } from "./plan-provider"

function Tile({
  label,
  value,
  sub,
  tone,
  children,
}: {
  label: string
  value: React.ReactNode
  sub: React.ReactNode
  tone?: "alert"
  children?: React.ReactNode
}) {
  return (
    <div className={cn("rounded-xl border bg-card px-4 py-2.5 shadow-xs", tone === "alert" && "border-destructive/40 bg-destructive/5")}>
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className={cn("text-xl font-semibold tracking-tight tabular-nums", tone === "alert" && "text-destructive")}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{sub}</p>
      {children}
    </div>
  )
}

export function Stats() {
  const { counts, rules } = usePlan()
  const broken = rules.filter((r) => r.status === "broken").length
  const seatedAttending = counts.attending - counts.unseated.length
  const pct = counts.attending ? Math.round((seatedAttending / counts.attending) * 100) : 0

  return (
    <section aria-label="Seating counts" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Tile
        label="Seated"
        value={counts.seated}
        sub={`${seatedAttending} of ${counts.attending} attending guests`}
      >
        <Progress value={pct} aria-label="Attending guests seated" className="mt-2 h-1.5" />
      </Tile>
      <Tile
        label="Unseated"
        value={counts.unseated.length}
        sub={`attending, plus ${counts.unconfirmed.length} not confirmed`}
      />
      <Tile label="Free seats" value={counts.free} sub={`of ${counts.capacity} across 7 tables`} />
      <Tile
        label="Rules broken"
        value={broken}
        sub={`of ${rules.length} rules from the couple`}
        tone={broken ? "alert" : undefined}
      />
    </section>
  )
}
