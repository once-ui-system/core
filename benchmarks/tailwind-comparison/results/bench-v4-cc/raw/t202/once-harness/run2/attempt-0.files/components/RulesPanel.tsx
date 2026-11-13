"use client";

import { Column, Heading, Icon, Row, Tag, Text } from "@once-ui-system/core";
import { usePlan } from "./PlanProvider";

export function RulesPanel() {
  const { rules, selectTable } = usePlan();
  const broken = rules.filter((r) => r.status === "broken").length;
  const kept = rules.filter((r) => r.status === "kept").length;
  const waiting = rules.filter((r) => r.status === "waiting").length;

  return (
    <Column background="surface" border={broken > 0 ? "danger-alpha-medium" : true} radius="l" padding="16" gap="12" fillWidth>
      <Row gap="8" vertical="center" wrap>
        <Heading as="h2" textVariant="heading-strong-m" flex={1}>
          Couple&apos;s rules
        </Heading>
        <Tag tone={broken > 0 ? "danger" : "success"} size="s" label={broken > 0 ? `${broken} broken` : "None broken"} />
      </Row>
      <Text textVariant="body-default-xs" onBackground="neutral-weak">
        {kept} kept · {waiting} waiting for guests to be seated · {broken} broken
      </Text>
      <Column as="ul" gap="8" fillWidth>
        {rules.map((r) => (
          <li key={r.id} style={{ listStyle: "none" }}>
            <Row
              as="button"
              type="button"
              fillWidth
              gap="12"
              padding="8"
              radius="m"
              vertical="start"
              horizontal="start"
              cursor="interactive"
              background={r.status === "broken" ? "danger-alpha-weak" : "transparent"}
              aria-label={`${r.title}. ${r.status === "broken" ? "Broken" : r.status === "kept" ? "Kept" : "Waiting"}. ${r.detail}`}
              onClick={() => {
                if (r.tableIds.length > 0) selectTable(r.tableIds[0]);
              }}>
              <Icon
                name={r.status === "broken" ? "danger" : r.status === "kept" ? "check" : "time"}
                size="s"
                onBackground={r.status === "broken" ? "danger-strong" : r.status === "kept" ? "success-strong" : "neutral-weak"}
              />
              <Column gap="2" flex={1} horizontal="start">
                <Text textVariant="label-strong-s">{r.title}</Text>
                <Text textVariant="body-default-xs" onBackground="neutral-weak">
                  {r.detail}
                </Text>
                <Text textVariant="body-default-xs" onBackground="neutral-medium">
                  {r.rule.note}
                </Text>
              </Column>
            </Row>
          </li>
        ))}
      </Column>
    </Column>
  );
}
