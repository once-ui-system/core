import { Badge, Group, VisuallyHidden } from "@mantine/core";
import { IconAlertTriangleFilled } from "@tabler/icons-react";

type Props = {
  alerts: string[];
  size?: "sm" | "md" | "lg";
};

/** Medical alerts: solid red, icon and text, never colour alone. */
export function AlertBadges({ alerts, size = "md" }: Props) {
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
          tt="none"
          leftSection={<IconAlertTriangleFilled size={size === "lg" ? 16 : 13} aria-hidden />}
          styles={{ label: { overflow: "visible" }, root: { height: "auto", paddingBlock: 3 } }}
        >
          <VisuallyHidden>Medical alert: </VisuallyHidden>
          {alert}
        </Badge>
      ))}
    </Group>
  );
}
