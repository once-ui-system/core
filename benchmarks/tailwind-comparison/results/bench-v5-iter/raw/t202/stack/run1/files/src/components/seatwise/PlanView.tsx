"use client";

import { Column, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { event } from "@/lib/data";
import { RoomPlan } from "./RoomPlan";
import { RulesPanel, SelectionPanel, StatTiles, TablesPanel, UnseatedPool } from "./Panels";
import { useEffect } from "react";
import { useSeating } from "@/lib/seating";

export function PlanView() {
  const { holdGuest } = useSeating();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") holdGuest(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [holdGuest]);

  return (
    <>
      <Row fillWidth horizontal="between" vertical="end" gap="16" wrap>
        <Column gap="4">
          <Heading as="h1" variant="display-strong-xs">
            {event.name}
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            {event.dateLabel} · {event.venue}
          </Text>
        </Column>
        <Tag size="m" prefixIcon="calendar">
          Seating plan
        </Tag>
      </Row>

      <StatTiles />

      <div className="sw-main">
        <Column gap="16" style={{ minWidth: 0 }}>
          <UnseatedPool />
          <RoomPlan />
        </Column>
        <Column gap="16" style={{ minWidth: 0 }}>
          <RulesPanel />
          <SelectionPanel />
          <TablesPanel />
        </Column>
      </div>
    </>
  );
}
