"use client";

import { Column, Grid, Heading, Row, Text, VisuallyHidden } from "@once-ui-system/core";
import { FloorPlan } from "./FloorPlan";
import { usePlan } from "./PlanProvider";
import { RulesPanel } from "./RulesPanel";
import { TablePanel } from "./TablePanel";
import { TableStrip } from "./TableStrip";
import { UnseatedPanel } from "./UnseatedPanel";

function Stat({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "danger" }) {
  return (
    <Column background="surface" border={tone === "danger" ? "danger-alpha-medium" : true} radius="l" padding="16" gap="4">
      <Text textVariant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text textVariant="display-strong-xs" onBackground={tone === "danger" ? "danger-strong" : "neutral-strong"}>
        {value}
      </Text>
      <Text textVariant="body-default-xs" onBackground="neutral-weak">
        {sub}
      </Text>
    </Column>
  );
}

export function PlanView() {
  const { stats, rules, announcement } = usePlan();
  const broken = rules.filter((r) => r.status === "broken").length;

  return (
    <Column fillWidth maxWidth="96rem" paddingX="16" paddingY="16" gap="16">
      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>
      <Row vertical="end" gap="16" wrap>
        <Column gap="4" flex={1}>
          <Heading as="h1" textVariant="display-strong-xs">
            Seating plan
          </Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            Seat guests by dragging them onto a table, or tap a guest and then a table or seat.
          </Text>
        </Column>
      </Row>

      <Grid columns="4" s={{ columns: "2" }} gap="12" fillWidth>
        <Stat label="Seated" value={String(stats.seated)} sub={`of ${stats.attending} attending guests`} />
        <Stat label="Still to seat" value={String(stats.unseated.length)} sub="attending, no seat yet" />
        <Stat label="Free seats" value={String(stats.free)} sub={`of ${stats.capacity} across 7 tables`} />
        <Stat
          label="Rules broken"
          value={String(broken)}
          sub={broken === 0 ? "all the couple's rules hold" : "see the rules list"}
          tone={broken > 0 ? "danger" : undefined}
        />
      </Grid>

      <Row fillWidth gap="16" vertical="start" m={{ direction: "column" }}>
        <Column flex={1} minWidth={0} gap="12" m={{ width: "100%" }}>
          <FloorPlan />
          <TableStrip />
        </Column>
        <Column width="24rem" gap="16" m={{ width: "100%", maxWidth: "100%" }}>
          <RulesPanel />
          <UnseatedPanel />
          <TablePanel />
        </Column>
      </Row>
    </Column>
  );
}
