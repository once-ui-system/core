import { Column, Icon, Row, Tag, Text } from "@once-ui-system/core";

/** Inline alert tags: used wherever a patient appears in a list. */
export function AlertTags({ alerts, compact }: { alerts: string[]; compact?: boolean }) {
  if (alerts.length === 0) return null;
  return (
    <Row gap="4" wrap role="list" aria-label="Medical alerts">
      {alerts.map((alert) => (
        <Tag
          key={alert}
          role="listitem"
          scheme="danger"
          size={compact ? "s" : "m"}
          prefixIcon="warning"
          label={alert}
        />
      ))}
    </Row>
  );
}

/** The loud version for the top of a record. */
export function AlertBanner({ name, alerts }: { name: string; alerts: string[] }) {
  if (alerts.length === 0) return null;
  return (
    <Row
      role="alert"
      background="danger-alpha-medium"
      border="danger-alpha-strong"
      borderWidth={2}
      radius="l"
      padding="16"
      gap="16"
      vertical="center"
      wrap
    >
      <Icon name="warning" size="l" onBackground="danger-strong" />
      <Column gap="4" flex={1} minWidth={14}>
        <Text variant="label-strong-s" onBackground="danger-strong">
          Medical alerts for {name}
        </Text>
        <Row gap="24" wrap>
          {alerts.map((alert) => (
            <Text key={alert} variant="heading-strong-m" onBackground="danger-strong">
              {alert}
            </Text>
          ))}
        </Row>
      </Column>
    </Row>
  );
}
