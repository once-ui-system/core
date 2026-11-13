"use client"

import { CircleCheckIcon, ClockIcon, TriangleAlertIcon } from "lucide-react"

import { usePlan } from "@/components/seatwise/plan-provider"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { guestById, ruleKindLabel, type RuleResult } from "@/lib/plan"
import { cn } from "@/lib/utils"

const STATUS = {
  ok: { icon: CircleCheckIcon, label: "Kept", className: "text-ok" },
  broken: { icon: TriangleAlertIcon, label: "Broken", className: "text-destructive" },
  open: { icon: ClockIcon, label: "Waiting", className: "text-muted-foreground" },
} as const

export function RulesPanel({ onFocusTable }: { onFocusTable: (tableId: string) => void }) {
  const { results, placements } = usePlan()
  const broken = results.filter((r) => r.status === "broken")
  const kept = results.filter((r) => r.status === "ok").length
  const open = results.filter((r) => r.status === "open").length

  const focus = (r: RuleResult) => {
    const target = r.tables[0] ?? r.rule.guests.map((id) => placements[id]?.table).find(Boolean)
    if (target) onFocusTable(target)
  }

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="font-serif text-lg">The couple&apos;s rules</CardTitle>
        <CardDescription aria-live="polite">
          {broken.length ? (
            <span className="font-medium text-destructive">
              {broken.length} of {results.length} broken
            </span>
          ) : (
            <span className="font-medium text-ok">No rule broken</span>
          )}
          {` · ${kept} kept · ${open} waiting on a seat`}
        </CardDescription>
        <CardAction>
          <Badge variant={broken.length ? "destructive" : "secondary"}>
            {broken.length ? `${broken.length} to fix` : "All clear"}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="px-4">
        <ul className="grid gap-2 md:grid-cols-2">
          {results.map((r) => {
            const s = STATUS[r.status]
            const Icon = s.icon
            const canFocus = r.tables.length > 0 || r.rule.guests.some((id) => placements[id])
            return (
              <li key={r.index}>
                <button
                  type="button"
                  disabled={!canFocus}
                  onClick={() => focus(r)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border bg-card p-3 text-left outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 enabled:hover:bg-secondary/60 disabled:cursor-default",
                    r.status === "broken" && "border-destructive/50 bg-destructive/5",
                  )}
                >
                  <Icon className={cn("mt-0.5 size-4 shrink-0", s.className)} aria-hidden />
                  <span className="min-w-0 flex-1 text-sm">
                    <span className="flex flex-wrap items-center gap-x-2">
                      <span className="font-medium">{ruleKindLabel(r.rule.kind)}</span>
                      <span className={cn("text-xs font-medium", s.className)}>{s.label}</span>
                    </span>
                    <span className="block text-muted-foreground">{r.rule.guests.map((id) => guestById[id]?.name).join(" & ")}</span>
                    <span className="mt-1 block">{r.message}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{r.rule.note}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
