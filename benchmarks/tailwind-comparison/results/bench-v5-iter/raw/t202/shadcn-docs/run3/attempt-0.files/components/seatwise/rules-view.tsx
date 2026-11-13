"use client"

import { CircleCheck, CircleDashed, Info, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TABLE_BY_ID, type RuleResult, type RuleStatus } from "@/lib/seating"
import { cn } from "@/lib/utils"
import { usePlan } from "./plan-provider"

const KIND_LABEL: Record<RuleResult["kind"], string> = {
  together: "Together",
  apart: "Apart",
  near: "Near",
}

function StatusIcon({ status }: { status: RuleStatus }) {
  if (status === "broken") return <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-destructive" />
  if (status === "ok") return <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-ok" />
  return <CircleDashed aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
}

const STATUS_TEXT: Record<RuleStatus, string> = {
  broken: "Broken",
  ok: "Kept",
  open: "To do",
}

export function RulesList() {
  const { rules, selectTable } = usePlan()
  return (
    <ul className="flex flex-col gap-2">
      {rules.map((r) => (
        <li
          key={r.id}
          className={cn(
            "rounded-lg border bg-card p-3",
            r.status === "broken" && "border-destructive/40 bg-destructive/5"
          )}
        >
          <div className="flex gap-2.5">
            <StatusIcon status={r.status} />
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-medium">
                <span className="sr-only">{STATUS_TEXT[r.status]}. </span>
                {r.title}
              </p>
              <p className="mt-0.5 text-muted-foreground">{r.detail}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {KIND_LABEL[r.kind]} · {r.note}
              </p>
              {r.review ? (
                <p className="mt-1.5 flex gap-1.5 rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-900">
                  <Info aria-hidden className="mt-px size-3.5 shrink-0" />
                  {r.review}
                </p>
              ) : null}
              {r.tableIds.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {r.tableIds.map((id) => (
                    <Button key={id} size="xs" variant="outline" onClick={() => selectTable(id)}>
                      {TABLE_BY_ID[id].name}
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Short summary shown above the plan. */
export function RuleSummary({ onOpenRules }: { onOpenRules: () => void }) {
  const { rules } = usePlan()
  const broken = rules.filter((r) => r.status === "broken")
  const open = rules.filter((r) => r.status === "open").length
  const kept = rules.filter((r) => r.status === "ok").length

  return (
    <section
      aria-label="Couple's rules"
      className={cn(
        "rounded-xl border px-4 py-3",
        broken.length ? "border-destructive/40 bg-destructive/5" : "bg-card"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          {broken.length ? (
            <TriangleAlert aria-hidden className="size-4 text-destructive" />
          ) : (
            <CircleCheck aria-hidden className="size-4 text-ok" />
          )}
          {broken.length
            ? `${broken.length} ${broken.length === 1 ? "rule is" : "rules are"} broken`
            : "No rules broken"}
        </h2>
        <p className="text-xs text-muted-foreground">
          {kept} kept · {open} still to place · {rules.length} rules
        </p>
      </div>
      {broken.length ? (
        <ul className="mt-2 flex flex-col gap-1.5 text-sm">
          {broken.map((r) => (
            <li key={r.id}>
              <span className="font-medium">{r.title}.</span>{" "}
              <span className="text-muted-foreground">{r.detail}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <Button variant="link" size="xs" className="mt-1 h-auto px-0" onClick={onOpenRules}>
        See all rules
      </Button>
    </section>
  )
}
