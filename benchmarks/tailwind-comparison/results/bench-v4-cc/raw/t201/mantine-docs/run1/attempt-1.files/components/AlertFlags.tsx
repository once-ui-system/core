import { Box, Group, VisuallyHidden } from "@mantine/core";
import { IconAlertTriangleFilled } from "@tabler/icons-react";

const iconSize = { xs: 12, sm: 14, md: 18 } as const;

/** Medical alerts as solid red flags. Used everywhere a patient appears. */
export function AlertFlags({
  alerts,
  size = "xs",
}: {
  alerts: string[];
  size?: "xs" | "sm" | "md";
}) {
  if (alerts.length === 0) return null;
  return (
    <Group gap={4} role="list" aria-label="Medical alerts">
      {alerts.map((alert) => (
        <Box
          key={alert}
          role="listitem"
          bg="red.9"
          c="white"
          fz={size}
          fw={700}
          px={size === "md" ? 12 : 8}
          py={size === "md" ? 6 : 2}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            borderRadius: 6,
            lineHeight: 1.3,
          }}
        >
          <IconAlertTriangleFilled size={iconSize[size]} aria-hidden style={{ flexShrink: 0 }} />
          <VisuallyHidden>Medical alert: </VisuallyHidden>
          {alert}
        </Box>
      ))}
    </Group>
  );
}
