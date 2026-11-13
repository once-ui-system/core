"use client";

import { RoomPlan } from "./RoomPlan";
import { RulesPanel, StatsStrip, TablePanel, UnseatedPanel } from "./PlanPanels";

export function PlanScreen() {
  return (
    <>
      <StatsStrip />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
        <RoomPlan />
        <aside
          aria-label="Seating tools"
          className="space-y-4 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto lg:pb-1"
        >
          <UnseatedPanel />
          <TablePanel />
          <RulesPanel />
        </aside>
      </div>
    </>
  );
}
