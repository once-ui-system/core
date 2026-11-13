"use client";

import { Column, Icon, Row, Tag, Text } from "@once-ui-system/core";
import { Panel } from "./Panel";
import { usePlan } from "./PlanProvider";

export function RulesPanel() {
  const { results, selectTable } = usePlan();
  const broken = results.filter((r) => r.status === "broken").length;
  const open = results.filter((r) => r.status === "open").length;
  const kept = results.filter((r) => r.status === "kept").length;

  return (
    <Panel
      title="The couple's rules"
      subtitle="Checked every time a guest moves"
      action={
        <Row gap="4" wrap>
          <Tag size="s" tone={broken ? "danger" : "neutral"} label={`${broken} broken`} />
          <Tag size="s" tone="neutral" label={`${open} waiting`} />
          <Tag size="s" tone="success" label={`${kept} kept`} />
        </Row>
      }
    >
      <Column as="ul" gap="8">
        {results.map((r) => {
          const icon = r.status === "broken" ? "warning" : r.status === "kept" ? "check" : "time";
          const state = r.status === "broken" ? "Broken" : r.status === "kept" ? "Kept" : "Waiting";
          return (
            <Row as="li" key={r.index} fillWidth>
              <Row
                as="button"
                type="button"
                className="sw-hit"
                fillWidth
                gap="12"
                padding="12"
                radius="m"
                vertical="start"
                background={r.status === "broken" ? "danger-alpha-weak" : "neutral-alpha-weak"}
                border="transparent"
                disabled={r.tableIds.length === 0}
                aria-label={`${state}: ${r.title}. ${r.detail}${
                  r.tableIds.length ? " Show table." : ""
                }`}
                onClick={() => {
                  if (r.tableIds.length) selectTable(r.tableIds[0]);
                }}
                style={{ textAlign: "left" }}
              >
                <Icon
                  name={icon}
                  size="s"
                  onBackground={
                    r.status === "broken"
                      ? "danger-strong"
                      : r.status === "kept"
                        ? "success-strong"
                        : "neutral-weak"
                  }
                />
                <Column flex={1} gap="2">
                  <Text textVariant="label-strong-s">{r.title}</Text>
                  <Text textVariant="body-default-xs">{r.detail}</Text>
                  <Text textVariant="body-default-xs" onBackground="neutral-weak">
                    {r.rule.note}
                  </Text>
                </Column>
              </Row>
            </Row>
          );
        })}
      </Column>
    </Panel>
  );
}
