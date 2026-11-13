"use client";

import { Column, Icon, Row, Text } from "@once-ui-system/core";

/** Medical alerts as red chips with a warning icon. Used everywhere a patient appears. */
export function AlertChips({ alerts, size = "s" }: { alerts: string[]; size?: "s" | "m" }) {
  if (alerts.length === 0) return null;
  return (
    <Row as="ul" wrap gap="4" aria-label="Medical alerts" style={{ margin: 0, padding: 0, listStyle: "none" }}>
      {alerts.map((alert) => (
        <Row
          as="li"
          key={alert}
          vertical="center"
          gap="4"
          paddingX={size === "m" ? "12" : "8"}
          paddingY={size === "m" ? "8" : "4"}
          radius="s"
          background="danger-alpha-weak"
          border="danger-alpha-strong"
          borderWidth={2}
        >
          <Icon name="warning" size="xs" onBackground="danger-strong" />
          <Text textVariant={size === "m" ? "label-strong-m" : "label-strong-s"} onBackground="danger-strong">
            <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>
              Medical alert:{" "}
            </span>
            {alert}
          </Text>
        </Row>
      ))}
    </Row>
  );
}

/** A large banner for the record page: the alerts first, before anything else. */
export function AlertBanner({ name, alerts }: { name: string; alerts: string[] }) {
  if (alerts.length === 0) return null;
  return (
    <Column
      as="section"
      aria-label={`Medical alerts for ${name}`}
      fillWidth
      background="danger-alpha-weak"
      border="danger-alpha-strong"
      borderWidth={4}
      radius="l"
      padding="20"
      gap="12"
    >
      <Row gap="8" vertical="center">
        <Icon name="warning" size="l" onBackground="danger-strong" />
        <Text textVariant="label-strong-m" onBackground="danger-strong" style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Medical alerts for {name}
        </Text>
      </Row>
      <Column as="ul" gap="8" style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {alerts.map((alert) => (
          <Row as="li" key={alert} gap="8" vertical="center">
            <Icon name="danger" size="m" onBackground="danger-strong" />
            <Text textVariant="heading-strong-l" onBackground="danger-strong">
              {alert}
            </Text>
          </Row>
        ))}
      </Column>
    </Column>
  );
}
