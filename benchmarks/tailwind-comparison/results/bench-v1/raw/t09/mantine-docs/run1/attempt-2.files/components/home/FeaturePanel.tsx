import { Badge, Group, Stack, Text } from "@mantine/core";
import classes from "./Home.module.css";

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <Group justify="space-between" mb={4}>
        <Text size="sm">{label}</Text>
        <Text size="sm" c="dimmed">
          {value}%
        </Text>
      </Group>
      <div
        className={classes.bar}
        role="img"
        aria-label={`${label}: ${value} percent`}
      >
        <div className={classes.barFill} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

/** Small static illustrations built from theme components, one per feature. */
export function FeaturePanel({ id }: { id: string }) {
  if (id === "analytics") {
    return (
      <Stack className={classes.panel} gap="md">
        <Text fw={700} ff="heading">
          Signup funnel, last 7 days
        </Text>
        <Bar label="Visited pricing" value={100} />
        <Bar label="Started signup" value={46} />
        <Bar label="Created a project" value={31} />
        <Bar label="Invited a teammate" value={18} />
        <Text size="sm" c="dimmed">
          Biggest drop: pricing to signup, down 6 points since last week.
        </Text>
      </Stack>
    );
  }

  if (id === "issues") {
    return (
      <Stack className={classes.panel} gap="sm">
        <Group justify="space-between" wrap="nowrap">
          <Text fw={700} ff="heading">
            LUM-142 Signup step 2 fails on Safari
          </Text>
          <Badge variant="light">Open</Badge>
        </Group>
        <Text size="sm" c="dimmed">
          Raised from the signup funnel. Cohort: Safari, new visitors. 214
          sessions affected this week.
        </Text>
        <Group gap="xs">
          <Badge variant="outline">bug</Badge>
          <Badge variant="outline">onboarding</Badge>
        </Group>
      </Stack>
    );
  }

  return (
    <Stack className={classes.panel} gap="sm">
      <Text fw={700} ff="heading">
        Setup checklist
      </Text>
      <Text size="sm">1. Paste the snippet into your app</Text>
      <Text size="sm">2. Name your five key events</Text>
      <Text size="sm">3. Invite the team</Text>
      <Text size="sm" c="dimmed">
        Most teams finish before lunch.
      </Text>
    </Stack>
  );
}
