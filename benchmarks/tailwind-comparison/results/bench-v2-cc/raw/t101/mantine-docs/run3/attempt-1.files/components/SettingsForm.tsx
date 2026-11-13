"use client";

import { Button, Card, Group, Select, SimpleGrid, Stack, Switch, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { user, workspaceName } from "@/lib/data";
import { PageHeader } from "./PageHeader";

const timezones = [
  "UTC",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "Africa/Lagos",
];

export function SettingsForm() {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      workspace: workspaceName,
      timezone: "Europe/London",
      digest: "Weekly",
      notifyAssigned: true,
      notifyMentions: true,
      notifyStatus: false,
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? "Enter your full name" : null),
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : "Enter a valid email address"),
      workspace: (value) => (value.trim().length === 0 ? "Workspace name is required" : null),
    },
  });

  return (
    <>
      <PageHeader title="Settings" description="Your profile, workspace and notification preferences." />
      <form
        onSubmit={form.onSubmit(() => {
          notifications.show({
            title: "Settings saved",
            message: "Your changes have been applied.",
          });
        })}
        noValidate
      >
        <Stack gap="md" maw={760}>
          <Card>
            <Title order={2} mb="sm">
              Profile
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              <TextInput
                label="Full name"
                autoComplete="name"
                key={form.key("name")}
                {...form.getInputProps("name")}
              />
              <TextInput
                label="Email"
                type="email"
                autoComplete="email"
                key={form.key("email")}
                {...form.getInputProps("email")}
              />
              <TextInput
                label="Role"
                description="Only another owner can change this."
                readOnly
                key={form.key("role")}
                {...form.getInputProps("role")}
              />
            </SimpleGrid>
          </Card>

          <Card>
            <Title order={2} mb="sm">
              Workspace
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              <TextInput
                label="Workspace name"
                key={form.key("workspace")}
                {...form.getInputProps("workspace")}
              />
              <Select
                label="Time zone"
                data={timezones}
                allowDeselect={false}
                key={form.key("timezone")}
                {...form.getInputProps("timezone")}
              />
              <Select
                label="Email digest"
                data={["Daily", "Weekly", "Never"]}
                allowDeselect={false}
                key={form.key("digest")}
                {...form.getInputProps("digest")}
              />
            </SimpleGrid>
          </Card>

          <Card>
            <Title order={2} mb="sm">
              Notifications
            </Title>
            <Stack gap="sm">
              <Switch
                label="Issues assigned to me"
                key={form.key("notifyAssigned")}
                {...form.getInputProps("notifyAssigned", { type: "checkbox" })}
              />
              <Switch
                label="Mentions in comments"
                key={form.key("notifyMentions")}
                {...form.getInputProps("notifyMentions", { type: "checkbox" })}
              />
              <Switch
                label="Status changes on projects I follow"
                key={form.key("notifyStatus")}
                {...form.getInputProps("notifyStatus", { type: "checkbox" })}
              />
            </Stack>
          </Card>

          <Group justify="flex-end" gap="sm">
            <Button type="button" variant="default" onClick={() => form.reset()}>
              Reset
            </Button>
            <Button type="submit">Save changes</Button>
          </Group>
        </Stack>
      </form>
    </>
  );
}
