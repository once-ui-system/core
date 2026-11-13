import type { ReactNode } from "react";
import { Card, Group, Text, ThemeIcon } from "@mantine/core";

interface SummaryCardProps {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
}

export function SummaryCard({ label, value, hint, icon }: SummaryCardProps) {
  return (
    <Card>
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <div>
          <Text size="sm" c="dimmed" fw={600}>
            {label}
          </Text>
          <Text fz={36} fw={700} lh={1.2} mt={4} ff="heading">
            {value}
          </Text>
        </div>
        <ThemeIcon size={48} radius="md" variant="light" color="brand" aria-hidden>
          {icon}
        </ThemeIcon>
      </Group>
      <Text size="sm" c="dimmed" mt="sm">
        {hint}
      </Text>
    </Card>
  );
}
