"use client";

import { Button, Column, Grid, Heading, Row, SegmentedControl, Tag, Text } from "@once-ui-system/core";
import { useState } from "react";
import { event } from "@/lib/data";
import { formatDate } from "@/lib/plan";
import { RulesPanel, SelectionPanel, ToSeatPanel } from "./PlanPanels";
import { usePlan } from "./PlanProvider";
import { RoomPlan } from "./RoomPlan";
import { TablesList } from "./TablesList";
import { guestById } from "@/lib/plan";

function Stat({ label, value, hint, tone }: { label: string; value: string; hint: string; tone?: "danger" | "success" }) {
  return (
    <Column
      background="surface"
      border={tone === "danger" ? "danger-alpha-strong" : true}
      radius="l"
      padding="16"
      gap="4"
    >
      <Text textVariant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text textVariant="display-strong-xs" onBackground={tone === "danger" ? "danger-strong" : "neutral-strong"}>
        {value}
      </Text>
      <Text textVariant="body-default-xs" onBackground="neutral-weak">
        {hint}
      </Text>
    </Column>
  );
}

export function PlanView() {
  const plan = usePlan();
  const [view, setView] = useState("room");
  const { stats } = plan;
  const brokenCount = plan.rules.filter((r) => r.status === "broken").length;
  const picked = plan.selectedGuestId ? guestById.get(plan.selectedGuestId) : undefined;

  return (
    <Column as="main" id="main" fillWidth padding="16" gap="16" horizontal="center">
      <Column fillWidth maxWidth="xl" gap="16">
        <Row fillWidth horizontal="between" vertical="end" gap="16" s={{ direction: "column", horizontal: "start" }}>
          <Column gap="4">
            <Heading as="h1" textVariant="display-strong-xs">
              {event.name}
            </Heading>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {formatDate(event.date)} · {event.venue}
            </Text>
          </Column>
          <Row gap="8" vertical="center" wrap>
            <Button size="s" variant="secondary" prefixIcon="return" disabled={!plan.canUndo} onClick={plan.undo}>
              Undo
            </Button>
            <Button size="s" href="/guests" variant="secondary" prefixIcon="people">
              Guest list
            </Button>
          </Row>
        </Row>

        <Grid fillWidth columns="4" gap="12" s={{ columns: "2" }}>
          <Stat
            label="Seated"
            value={`${stats.seated}`}
            hint={`${stats.attendingSeated} of ${stats.attending} attending guests`}
          />
          <Stat
            label="Unseated"
            value={`${stats.toSeat.length}`}
            hint={`attending, plus ${stats.undecided.length} not confirmed`}
          />
          <Stat label="Open seats" value={`${stats.freeSeats}`} hint={`of ${stats.capacity} across 7 tables`} />
          <Stat
            label="Rules"
            value={brokenCount === 0 ? "All met" : `${brokenCount} broken`}
            hint={brokenCount === 0 ? "Checked as you work" : "Flagged on the tables"}
            tone={brokenCount > 0 ? "danger" : "success"}
          />
        </Grid>

        <Row gap="16" vertical="start" m={{ direction: "column" }}>
          <Column flex="1" gap="12" style={{ minWidth: 0 }} m={{ fillWidth: true }}>
            <Row horizontal="between" vertical="center" gap="12" wrap>
              <SegmentedControl
                fillWidth={false}
                value={view}
                onValueChange={setView}
                buttons={[
                  { value: "room", label: "Room plan", prefixIcon: "grid" },
                  { value: "tables", label: "Table list", prefixIcon: "document" },
                ]}
              />
              {picked ? (
                <Row gap="8" vertical="center" padding="4" paddingLeft="12" radius="full" background="brand-alpha-weak" border="brand-alpha-strong">
                  <Text textVariant="label-strong-s">Placing {picked.name}: tap a seat or table</Text>
                  <Button size="s" variant="ghost" onClick={() => plan.pickGuest(null)}>
                    Cancel
                  </Button>
                </Row>
              ) : (
                <Tag size="s" tone="neutral" label="Drag guests between seats, or tap a guest then a seat" />
              )}
            </Row>
            {view === "room" ? <RoomPlan /> : <TablesList />}
          </Column>
          <Column gap="16" width="24rem" m={{ fillWidth: true, width: "100%" }}>
            <ToSeatPanel />
            <SelectionPanel />
            <RulesPanel />
          </Column>
        </Row>
      </Column>
    </Column>
  );
}
