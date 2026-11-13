import { Column, Icon, Row, Tag, Text } from "@once-ui-system/core";

/** Compact medical alert tags, for lists and cards. Text and icon, never colour alone. */
export function AlertTags({ alerts, size = "s" }: { alerts: string[]; size?: "s" | "m" }) {
  if (alerts.length === 0) return null;
  return (
    <Row gap="4" wrap role="group" aria-label="Medical alerts">
      {alerts.map((alert) => (
        <Tag key={alert} as="span" tone="danger" size={size} prefixIcon="warning" label={alert} />
      ))}
    </Row>
  );
}

/** Large, high-contrast block for a record header or a booking. */
export function AlertBanner({ alerts, compact = false }: { alerts: string[]; compact?: boolean }) {
  if (alerts.length === 0) return null;
  return (
    <Column
      as="section"
      aria-label="Medical alerts"
      background="danger-alpha-weak"
      border="danger-strong"
      borderWidth={2}
      radius="l"
      padding={compact ? "12" : "20"}
      gap={compact ? "8" : "12"}
      fillWidth
    >
      <Row gap="8" vertical="center" onBackground="danger-strong" textVariant="label-strong-s">
        <Icon name="warning" size="s" />
        <span style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>Medical alerts</span>
      </Row>
      <Column as="ul" gap="8">
        {alerts.map((alert) => (
          <Row as="li" key={alert} gap="8" vertical="center">
            <Icon name="warning" size={compact ? "xs" : "s"} onBackground="danger-strong" />
            <Text textVariant={compact ? "label-strong-m" : "heading-strong-m"} onBackground="danger-strong">
              {alert}
            </Text>
          </Row>
        ))}
      </Column>
    </Column>
  );
}
