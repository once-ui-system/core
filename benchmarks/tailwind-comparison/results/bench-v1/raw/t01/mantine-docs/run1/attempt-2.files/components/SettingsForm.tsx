"use client";

import {
  Button,
  Card,
  Divider,
  Group,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { user } from "@/lib/data";

interface SettingsValues {
  name: string;
  email: string;
  digest: string;
  issueAlerts: boolean;
  weeklyReport: boolean;
  productUpdates: boolean;
}

export function SettingsForm() {
  const form = useForm<SettingsValues>({
    mode: "controlled",
    initialValues: {
      name: user.name,
      email: user.email,
      digest: "weekly",
      issueAlerts: true,
      weeklyReport: true,
      productUpdates: false,
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? "Enter your full name" : null),
      email: (value) =>
        /^\S+@\S+\.\S+$/.test(value) ? null : "Enter a valid email address",
    },
  });

  const handleSubmit = form.onSubmit(() => {
    notifications.show({
      title: "Settings saved",
      message: "Your preferences have been updated.",
      color: "teal",
    });
  });

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack gap="lg" maw={640}>
        <Card withBorder padding="lg" radius="md">
          <Title order={2} size="h4">
            Profile
          </Title>
          <Text size="sm" c="dimmed" mb="md">
            Your role in this workspace is {user.role}.
          </Text>
          <Stack gap="md">
            <TextInput
              label="Full name"
              autoComplete="name"
              {...form.getInputProps("name")}
            />
            <TextInput
              label="Email"
              type="email"
              autoComplete="email"
              {...form.getInputProps("email")}
            />
          </Stack>
        </Card>

        <Card withBorder padding="lg" radius="md">
          <Title order={2} size="h4">
            Notifications
          </Title>
          <Text size="sm" c="dimmed" mb="md">
            Choose what lands in your inbox.
          </Text>
          <Stack gap="md">
            <Select
              label="Email digest"
              allowDeselect={false}
              data={[
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
                { value: "never", label: "Never" },
              ]}
              {...form.getInputProps("digest")}
            />
            <Divider />
            <Switch
              label="Issue alerts"
              description="Get notified when an issue is assigned to you."
              {...form.getInputProps("issueAlerts", { type: "checkbox" })}
            />
            <Switch
              label="Weekly analytics report"
              description="A summary of traffic and conversion for each project."
              {...form.getInputProps("weeklyReport", { type: "checkbox" })}
            />
            <Switch
              label="Product updates"
              description="News about new Lumen features."
              {...form.getInputProps("productUpdates", { type: "checkbox" })}
            />
          </Stack>
        </Card>

        <Group justify="flex-end">
          <Button type="button" variant="default" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit">Save changes</Button>
        </Group>
      </Stack>
    </form>
  );
}
