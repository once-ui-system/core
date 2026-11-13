"use client";

import { Column, Grid, Heading, Row, Text } from "@once-ui-system/core";
import { RoomPlan } from "@/components/RoomPlan";
import { RulesPanel, StatsRow, StatusLine, TablePanel, TablesList, ToSeatPanel } from "@/components/Panels";
import { dateLabel, event } from "@/lib/data";

export default function Page() {
  return (
    <>
      <Column gap="4">
        <Heading as="h1" variant="display-strong-xs">
          Seating plan
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {event.name} · {dateLabel} · {event.venue}
        </Text>
      </Column>
      <StatsRow />
      <Row gap="24" vertical="start" m={{ direction: "column" }}>
        <Column flex={1} minWidth={0} gap="8" m={{ fillWidth: true }}>
          <RoomPlan />
          <StatusLine />
          <ToSeatPanel />
        </Column>
        <Grid columns="1" gap="16" width={22.5} m={{ columns: "2", fillWidth: true }} s={{ columns: "1" }} style={{ flex: "none" }}>
          <TablePanel />
          <RulesPanel />
          <TablesList />
        </Grid>
      </Row>
    </>
  );
}
