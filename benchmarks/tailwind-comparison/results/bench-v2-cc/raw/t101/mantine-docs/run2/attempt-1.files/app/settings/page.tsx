"use client";

import { Button, Card, Group, Select, Stack, Switch, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { user } from "@/lib/data";

export default function Page() {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      weeklyDigest: true,
      assignmentEmails: true,
    },
    validate: {
      name: (v) => (v.trim().length < 2 ? "Enter your full name" : null),
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : "Enter a valid email address"),
    },
  });

  const handleSubmit = () => {
    notifications.show({ title: "Settings saved", message: "Your changes have been applied." });
  };

  return (
    <Stack gap="md" maw={560}>
      <div>
        <Title order={1}>Settings</Title>
        <Text size="sm" c="dimmed">
          Your profile and notification preferences.
        </Text>
      </div>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          <Card>
            <Stack gap="sm">
              <Title order={2}>Profile</Title>
              <TextInput label="Full name" key={form.key("name")} {...form.getInputProps("name")} />
              <TextInput
                label="Email"
                type="email"
                key={form.key("email")}
                {...form.getInputProps("email")}
              />
              <Select
                label="Role"
                data={["Owner", "Admin", "Member"]}
                allowDeselect={false}
                key={form.key("role")}
                {...form.getInputProps("role")}
              />
            </Stack>
          </Card>
          <Card>
            <Stack gap="sm">
              <Title order={2}>Notifications</Title>
              <Switch
                label="Weekly digest"
                description="A Monday summary of open issues per project."
                key={form.key("weeklyDigest")}
                {...form.getInputProps("weeklyDigest", { type: "checkbox" })}
              />
              <Switch
                label="Assignment emails"
                description="Email me when an issue is assigned to me."
                key={form.key("assignmentEmails")}
                {...form.getInputProps("assignmentEmails", { type: "checkbox" })}
              />
            </Stack>
          </Card>
          <Group justify="flex-end">
            <Button type="submit">Save changes</Button>
          </Group>
        </Stack>
      </form>
    </Stack>
  );
}
