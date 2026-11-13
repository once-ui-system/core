import { Row, Tag } from "@once-ui-system/core";

/**
 * Medical alerts: solid red tags with a warning icon. Used everywhere a
 * patient appears so an alert is never one click away.
 */
export function AlertTags({ alerts, size = "m" }: { alerts: string[]; size?: "s" | "m" | "l" }) {
  if (alerts.length === 0) return null;
  return (
    <Row gap="4" wrap role="list" aria-label="Medical alerts">
      {alerts.map((alert) => (
        <Row key={alert} role="listitem" fit>
          <Tag scheme="danger" size={size} prefixIcon="warning" label={alert} />
        </Row>
      ))}
    </Row>
  );
}
