"use client";

import { Column, Row } from "@once-ui-system/core";
import { RoomPlan } from "./RoomPlan";
import { RulesSummary, Stats, StatusLine, TablePanel, UnseatedList } from "./PlanPanels";

export function PlanBoard() {
  return (
    <Column fillWidth gap="12">
      <Stats />
      <StatusLine />
      <Row fillWidth gap="16" vertical="start" m={{ direction: "column" }}>
        <Column flex={1} fillWidth gap="16" minWidth="0">
          <RoomPlan />
        </Column>
        <Column width="28rem" gap="16" m={{ fillWidth: true, width: "auto" }}>
          <TablePanel />
          <UnseatedList />
          <RulesSummary />
        </Column>
      </Row>
    </Column>
  );
}
