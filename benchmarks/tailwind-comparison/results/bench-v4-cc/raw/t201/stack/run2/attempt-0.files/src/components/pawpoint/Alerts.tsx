import { Column, Icon, Row, Tag, Text } from "@once-ui-system/core";

/** Compact alert chips, for rows, lists and search results. Icon plus text, never colour alone. */
export function AlertTags({ alerts }: { alerts: string[] }) {
  if (alerts.length === 0) return null;
  return (
    <Row gap="4" wrap role="group" aria-label="Medical alerts">
      {alerts.map((alert) => (
        <Tag key={alert} scheme="danger" size="m" prefixIcon="warning">
          <span style={{ fontWeight: 700 }}>{alert}</span>
        </Tag>
      ))}
    </Row>
  );
}

/** Full-width banner for the places where an alert must not be missed. */
export function AlertBanner({ alerts, name }: { alerts: string[]; name?: string }) {
  if (alerts.length === 0) return null;
  return (
    <Column
      role="group"
      aria-label={name ? `Medical alerts for ${name}` : "Medical alerts"}
      background="danger-alpha-weak"
      border="danger-strong"
      borderWidth={2}
      radius="l"
      padding="16"
      gap="8"
      fillWidth
    >
      <Row gap="8" vertical="center">
        <Icon name="warning" onBackground="danger-strong" size="m" />
        <Text variant="label-strong-s" onBackground="danger-strong" style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {alerts.length === 1 ? "Medical alert" : "Medical alerts"}
        </Text>
      </Row>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {alerts.map((alert) => (
          <li key={alert}>
            <Text variant="heading-strong-m" onBackground="danger-strong">
              {alert}
            </Text>
          </li>
        ))}
      </ul>
    </Column>
  );
}
