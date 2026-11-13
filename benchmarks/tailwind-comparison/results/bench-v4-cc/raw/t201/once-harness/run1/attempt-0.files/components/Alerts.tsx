import { Column, Icon, Row, Tag, Text } from "@once-ui-system/core";

/** Compact alert chips, used wherever a patient appears in a list. */
export function AlertTags({ alerts }: { alerts: string[] }) {
  if (alerts.length === 0) return null;
  return (
    <Row gap="4" wrap role="group" aria-label="Medical alerts">
      {alerts.map((a) => (
        <Tag key={a} tone="danger" prefixIcon="danger" size="s" label={`Alert: ${a}`} />
      ))}
    </Row>
  );
}

/** Large, high-contrast alert block, used on a patient record and in the booking form. */
export function AlertBanner({ alerts, patientName }: { alerts: string[]; patientName: string }) {
  if (alerts.length === 0) return null;
  return (
    <Row
      as="section"
      role="region"
      aria-label={`Medical alerts for ${patientName}`}
      fillWidth
      background="danger-alpha-weak"
      border="danger-alpha-strong"
      borderWidth={2}
      radius="l"
      padding="16"
      gap="16"
      vertical="center"
    >
      <Row fit>
        <Icon name="danger" size="xl" onBackground="danger-strong" decorative />
      </Row>
      <Column gap="4">
        <Text textVariant="label-strong-s" onBackground="danger-strong">
          MEDICAL ALERTS
        </Text>
        {alerts.map((a) => (
          <Text key={a} textVariant="heading-strong-m" onBackground="danger-strong">
            {a}
          </Text>
        ))}
      </Column>
    </Row>
  );
}
