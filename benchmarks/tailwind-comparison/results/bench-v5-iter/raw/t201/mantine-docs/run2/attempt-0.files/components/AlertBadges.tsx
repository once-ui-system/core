import { Badge, Group } from "@mantine/core";
import { IconAlertTriangleFilled } from "@tabler/icons-react";

/** Medical alerts: solid red, with an icon and the full text so they never rely on colour alone. */
export function AlertBadges({ alerts, size = "sm" }: { alerts: string[]; size?: "sm" | "md" | "lg" }) {
  if (alerts.length === 0) return null;
  return (
    <Group gap={6} role="list" aria-label="Medical alerts">
      {alerts.map((a) => (
        <Badge
          key={a}
          role="listitem"
          color="red.8"
          variant="filled"
          size={size}
          radius="sm"
          tt="none"
          leftSection={<IconAlertTriangleFilled size={size === "lg" ? 16 : 12} aria-hidden />}
          styles={{ label: { whiteSpace: "normal", fontWeight: 700 } }}
          h="auto"
          py={3}
        >
          {a}
        </Badge>
      ))}
    </Group>
  );
}
