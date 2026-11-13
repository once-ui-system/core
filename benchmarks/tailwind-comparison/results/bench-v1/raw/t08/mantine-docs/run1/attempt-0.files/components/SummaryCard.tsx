import { Badge, Card, Divider, Group, List, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { OnboardingData, teamSizes, themeOptions } from "@/lib/data";

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <Group justify="space-between" wrap="nowrap" align="flex-start" gap="md">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      {value ? (
        <Text size="sm" fw={500} ta="right" style={{ wordBreak: "break-word" }}>
          {value}
        </Text>
      ) : (
        <Text size="sm" c="dimmed" fs="italic" ta="right">
          Not set yet
        </Text>
      )}
    </Group>
  );
}

export function SummaryCard({ data, step }: { data: OnboardingData; step: number }) {
  const invites = data.invites.map((e) => e.trim()).filter(Boolean);
  const size = teamSizes.find((t) => t.value === data.teamSize)?.label ?? null;
  const theme = themeOptions.find((t) => t.value === data.theme)?.label ?? null;

  return (
    <Card withBorder radius="md" padding="lg" component="aside" aria-labelledby="summary-title">
      <Group justify="space-between" mb="md">
        <Title order={2} size="h4" id="summary-title">
          Your setup
        </Title>
        <Badge variant="light" size="sm">
          Step {step + 1} of 4
        </Badge>
      </Group>

      <Stack gap="sm">
        <Text size="xs" fw={700} tt="uppercase" c="dimmed">
          Account
        </Text>
        <Row label="Name" value={data.name.trim() || null} />
        <Row label="Email" value={data.email.trim() || null} />

        <Divider my="xs" />
        <Text size="xs" fw={700} tt="uppercase" c="dimmed">
          Workspace
        </Text>
        <Row label="Name" value={data.workspace.trim() || null} />
        <Row label="Team size" value={size} />

        <Divider my="xs" />
        <Text size="xs" fw={700} tt="uppercase" c="dimmed">
          Invites
        </Text>
        {invites.length > 0 ? (
          <List
            size="sm"
            spacing={4}
            icon={
              <ThemeIcon size={16} radius="xl" variant="light">
                <IconCheck size={11} aria-hidden="true" />
              </ThemeIcon>
            }
          >
            {invites.map((e, i) => (
              <List.Item key={`${e}-${i}`} style={{ wordBreak: "break-word" }}>
                {e}
              </List.Item>
            ))}
          </List>
        ) : (
          <Text size="sm" c="dimmed" fs="italic">
            {step >= 3 ? "No teammates invited" : "Not set yet"}
          </Text>
        )}

        <Divider my="xs" />
        <Text size="xs" fw={700} tt="uppercase" c="dimmed">
          Preferences
        </Text>
        <Row label="Theme" value={theme} />
        <Row label="Weekly digest" value={data.digest ? "On" : "Off"} />
      </Stack>
    </Card>
  );
}
