import { Row, Tag, VisuallyHidden } from "@once-ui-system/core";

/** Medical alerts, always in the danger tone with a warning icon and a spoken prefix. */
export function AlertTags({ alerts, size = "m" }: { alerts: string[]; size?: "s" | "m" | "l" }) {
  if (alerts.length === 0) return null;
  return (
    <Row gap="4" wrap role="group" aria-label="Medical alerts">
      <VisuallyHidden>Medical alert:</VisuallyHidden>
      {alerts.map((alert) => (
        <Tag key={alert} tone="danger" size={size} prefixIcon="warning" label={alert} />
      ))}
    </Row>
  );
}
