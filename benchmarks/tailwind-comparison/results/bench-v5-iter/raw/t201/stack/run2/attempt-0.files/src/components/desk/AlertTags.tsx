import { Row, Tag } from "@once-ui-system/core";

/** Medical alerts: always danger-coloured with a warning icon, wherever a patient appears. */
export function AlertTags({ alerts, size = "m" }: { alerts: string[]; size?: "s" | "m" | "l" }) {
  if (alerts.length === 0) return null;
  return (
    <Row gap="4" wrap role="list" aria-label="Medical alerts">
      {alerts.map((a) => (
        <Tag key={a} scheme="danger" size={size} prefixIcon="warning" role="listitem">
          <strong>{a}</strong>
        </Tag>
      ))}
    </Row>
  );
}
