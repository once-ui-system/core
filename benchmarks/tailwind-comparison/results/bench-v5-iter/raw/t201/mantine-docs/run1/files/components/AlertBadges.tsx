"use client";

import { Badge, Group, VisuallyHidden } from "@mantine/core";
import { IconAlertTriangleFilled } from "@tabler/icons-react";

/** Medical alerts, drawn the same loud way everywhere a patient appears. */
export function AlertBadges({ alerts, size = "md" }: { alerts: string[]; size?: "sm" | "md" | "lg" }) {
  if (alerts.length === 0) return null;
  return (
    <Group gap={6} role="list" aria-label="Medical alerts">
      {alerts.map((alert) => (
        <Badge
          key={alert}
          role="listitem"
          color="red.7"
          variant="filled"
          size={size}
          radius="sm"
          leftSection={<IconAlertTriangleFilled size={14} aria-hidden />}
          styles={{
            root: { height: "auto", paddingBlock: 3, maxWidth: "100%" },
            label: { textTransform: "none", whiteSpace: "normal", fontWeight: 700 },
          }}
        >
          <VisuallyHidden>Medical alert: </VisuallyHidden>
          {alert}
        </Badge>
      ))}
    </Group>
  );
}
