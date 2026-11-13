import { Row, Tag } from "@once-ui-system/core";

/** Medical alerts: always red, always with a warning icon, never collapsed. */
export function AlertTags({ alerts, size = "m" }: { alerts: string[]; size?: "s" | "m" | "l" }) {
  if (alerts.length === 0) return null;
  return (
    <Row gap="4" wrap role="list" aria-label="Medical alerts">
      {alerts.map((alert) => (
        <Row key={alert} fit role="listitem">
          <Tag tone="danger" size={size} prefixIcon="warning" label={alert} />
        </Row>
      ))}
    </Row>
  );
}
