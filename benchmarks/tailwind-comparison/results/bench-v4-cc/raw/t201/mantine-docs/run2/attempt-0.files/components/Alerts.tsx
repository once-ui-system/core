"use client";

import { Badge, Group, Paper, Stack, Text, VisuallyHidden } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

/** Compact, high-contrast medical alert chips used wherever a patient appears. */
export function AlertBadges({ alerts, size = "md" }: { alerts: string[]; size?: "sm" | "md" | "lg" }) {
  if (alerts.length === 0) return null;
  return (
    <Group gap={6} role="list" aria-label="Medical alerts">
      {alerts.map((alert) => (
        <Badge
          key={alert}
          role="listitem"
          color="red.8"
          variant="filled"
          size={size}
          tt="none"
          fw={700}
          leftSection={<IconAlertTriangle size={14} aria-hidden="true" />}
        >
          <VisuallyHidden>Medical alert: </VisuallyHidden>
          {alert}
        </Badge>
      ))}
    </Group>
  );
}

/** Full-width banner for the top of a record. */
export function AlertBanner({ name, alerts }: { name: string; alerts: string[] }) {
  if (alerts.length === 0) return null;
  return (
    <Paper
      component="section"
      aria-label={`Medical alerts for ${name}`}
      p="md"
      radius="md"
      bg="red.8"
      c="white"
      style={{ border: "3px solid var(--mantine-color-red-9)" }}
    >
      <Group gap="sm" align="flex-start" wrap="nowrap">
        <IconAlertTriangle size={32} aria-hidden="true" style={{ flexShrink: 0 }} />
        <Stack gap={4}>
          <Text fw={800} tt="uppercase" fz="sm" lts="0.08em" c="white">
            Medical alerts
          </Text>
          <Stack gap={2} component="ul" m={0} p={0} style={{ listStyle: "none" }}>
            {alerts.map((a) => (
              <Text key={a} component="li" fz={{ base: "lg", sm: "xl" }} fw={700} c="white" lh={1.3}>
                {a}
              </Text>
            ))}
          </Stack>
        </Stack>
      </Group>
    </Paper>
  );
}
