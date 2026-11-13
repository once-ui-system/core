"use client"

import * as React from "react"
import { FloorPlan } from "@/components/seatwise/floor-plan"
import { RuleSummary } from "@/components/seatwise/rules-view"
import { SidePanel, type SideTab } from "@/components/seatwise/side-panel"
import { Stats } from "@/components/seatwise/stats"
import { EVENT } from "@/lib/data"
import { formatDate } from "@/lib/seating"

export default function PlanPage() {
  const [tab, setTab] = React.useState<SideTab>("seat")

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 sm:py-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Seating plan</h1>
        <p className="text-sm text-muted-foreground">
          {EVENT.name} · {formatDate(EVENT.date)} · {EVENT.venue}
        </p>
      </div>

      <Stats />

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_410px]">
        <div className="flex min-w-0 flex-col gap-4">
          <RuleSummary onOpenRules={() => setTab("rules")} />
          <FloorPlan />
        </div>
        <aside className="min-w-0 lg:sticky lg:top-[72px] lg:max-h-[calc(100dvh-88px)] lg:self-start lg:overflow-y-auto">
          <SidePanel tab={tab} onTabChange={setTab} />
        </aside>
      </div>
    </div>
  )
}
