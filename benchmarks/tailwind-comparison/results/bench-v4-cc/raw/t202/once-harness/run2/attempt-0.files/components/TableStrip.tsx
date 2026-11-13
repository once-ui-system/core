"use client";

import { Row, ToggleButton } from "@once-ui-system/core";
import { TABLES } from "@/lib/data";
import { usePlan } from "./PlanProvider";

export function TableStrip() {
  const { stats, selectedTable, selectTable, brokenTableIds, picked, placePicked } = usePlan();
  return (
    <Row as="ul" gap="8" wrap fillWidth aria-label="Seats filled per table">
      {TABLES.map((t) => {
        const n = stats.perTable[t.id];
        const broken = brokenTableIds.has(t.id);
        return (
          <li key={t.id} style={{ listStyle: "none" }}>
            <ToggleButton
              label={`${t.name} ${n}/${t.seats}`}
              size="s"
              variant="outline"
              prefixIcon={broken ? "danger" : undefined}
              tone={broken ? "danger" : "neutral"}
              selected={selectedTable === t.id}
              aria-label={`${t.name}, ${n} of ${t.seats} seats filled${broken ? ", rule broken" : ""}${picked ? ", place the picked guest here" : ""}`}
              onClick={() => (picked ? placePicked(t.id) : selectTable(t.id))}
            />
          </li>
        );
      })}
    </Row>
  );
}
