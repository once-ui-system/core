"use client";

import { Column, Icon, Row, Text } from "@once-ui-system/core";

/** One medical alert, drawn so it cannot be mistaken for ordinary metadata. */
export function AlertChip({ text, size = "s" }: { text: string; size?: "s" | "m" }) {
  return (
    <Row
      background="danger-alpha-weak"
      border="danger-alpha-medium"
      radius="s"
      paddingX="8"
      paddingY="4"
      gap="4"
      vertical="center"
      fit
      onBackground="danger-strong">
      <Icon name="warning" size="xs" onBackground="danger-strong" />
      <Text textVariant={size === "m" ? "label-strong-m" : "label-strong-s"} onBackground="danger-strong">
        {text}
      </Text>
    </Row>
  );
}

export function AlertChips({ alerts, size = "s" }: { alerts: string[]; size?: "s" | "m" }) {
  if (alerts.length === 0) return null;
  return (
    <Row gap="4" wrap role="list" aria-label="Medical alerts">
      {alerts.map((a) => (
        <div key={a} role="listitem">
          <AlertChip text={a} size={size} />
        </div>
      ))}
    </Row>
  );
}

/** Full-width banner used at the top of a record and in the booking dialog. */
export function AlertBanner({ name, alerts }: { name: string; alerts: string[] }) {
  if (alerts.length === 0) return null;
  return (
    <Row
      role="alert"
      background="danger-alpha-weak"
      border="danger-alpha-strong"
      borderWidth={2}
      radius="l"
      padding="16"
      gap="16"
      vertical="start">
      <Icon name="warning" size="l" onBackground="danger-strong" />
      <Column gap="8" flex={1}>
        <Text textVariant="label-strong-s" onBackground="danger-strong">
          {`MEDICAL ALERT${alerts.length > 1 ? "S" : ""} FOR ${name.toUpperCase()}`}
        </Text>
        <Column gap="4" as="ul">
          {alerts.map((a) => (
            <Text as="li" key={a} textVariant="heading-strong-m" onBackground="danger-strong">
              {a}
            </Text>
          ))}
        </Column>
      </Column>
    </Row>
  );
}
