"use client";

import { Alert, Badge, Group, List, Text } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

/** Compact red alert flags, shown anywhere a patient appears. */
export function PatientAlerts({ alerts, size = "md" }: { alerts: string[]; size?: "sm" | "md" | "lg" }) {
  if (alerts.length === 0) return null;
  return (
    <Group gap={6} role="group" aria-label="Medical alerts">
      {alerts.map((alert) => (
        <Badge
          key={alert}
          color="red"
          variant="filled"
          size={size}
          tt="none"
          leftSection={<IconAlertTriangle size={14} aria-hidden="true" />}
          style={{ height: "auto", paddingBlock: 3 }}
          styles={{ label: { whiteSpace: "normal", fontWeight: 700 } }}
        >
          <span className="sr-only" style={srOnly}>
            Medical alert:{" "}
          </span>
          {alert}
        </Badge>
      ))}
    </Group>
  );
}

const srOnly: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
};

/** Large banner for the top of a record. */
export function PatientAlertBanner({ name, alerts }: { name: string; alerts: string[] }) {
  if (alerts.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        No medical alerts on file for {name}.
      </Text>
    );
  }
  return (
    <Alert
      color="red"
      variant="filled"
      radius="md"
      icon={<IconAlertTriangle size={26} aria-hidden="true" />}
      title={`Medical alerts for ${name}`}
      role="region"
      aria-label={`Medical alerts for ${name}`}
      styles={{ title: { fontSize: "var(--mantine-font-size-lg)", fontWeight: 800 } }}
    >
      <List size="md" spacing={2} styles={{ item: { color: "white", fontWeight: 600 } }}>
        {alerts.map((a) => (
          <List.Item key={a}>{a}</List.Item>
        ))}
      </List>
    </Alert>
  );
}
