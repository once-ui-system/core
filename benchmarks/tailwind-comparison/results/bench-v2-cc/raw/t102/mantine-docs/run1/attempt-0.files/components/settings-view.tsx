"use client";

import { Button, Card, Group, SimpleGrid, Stack, Switch, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { PageHeader } from "@/components/page-header";
import { user } from "@/lib/data";

export function SettingsView() {
  const form = useForm({
    initialValues: {
      name: user.name,
      email: user.email,
      weeklyDigest: true,
      assignments: true,
      productNews: false,
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? "Please enter your name" : null),
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : "Please enter a valid email address"),
    },
  });

  return (
    <Stack gap="xl" maw={760}>
      <PageHeader
        title="Settings"
        description="Keep your profile up to date and choose how Lumen keeps you in the loop."
      />

      <form
        noValidate
        onSubmit={form.onSubmit(() => {
          notifications.show({
            title: "Settings saved",
            message: "Your profile and notification choices are up to date.",
            icon: <IconCheck size={18} aria-hidden />,
            color: "brand",
          });
        })}
      >
        <Stack gap="xl">
          <Card component="section" aria-labelledby="profile-heading">
            <Title order={2} id="profile-heading" mb="lg">
              Profile
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              <TextInput
                label="Full name"
                autoComplete="name"
                required
                {...form.getInputProps("name")}
              />
              <TextInput
                label="Email"
                type="email"
                autoComplete="email"
                required
                {...form.getInputProps("email")}
              />
              <TextInput
                label="Role"
                description="Only another owner can change this."
                value={user.role}
                readOnly
              />
            </SimpleGrid>
          </Card>

          <Card component="section" aria-labelledby="notify-heading">
            <Title order={2} id="notify-heading" mb="lg">
              Notifications
            </Title>
            <Stack gap="lg">
              <Switch
                label="Weekly digest"
                description="A friendly Monday summary of what your team shipped."
                {...form.getInputProps("weeklyDigest", { type: "checkbox" })}
              />
              <Switch
                label="Issue assignments"
                description="Tell me when an issue lands on my plate."
                {...form.getInputProps("assignments", { type: "checkbox" })}
              />
              <Switch
                label="Product news"
                description="Occasional notes about new Lumen features."
                {...form.getInputProps("productNews", { type: "checkbox" })}
              />
            </Stack>
          </Card>

          <Group justify="flex-end" align="center" gap="md">
            <Text fz="sm" c="dimmed">
              Changes apply to {user.email}
            </Text>
            <Button type="submit">Save changes</Button>
          </Group>
        </Stack>
      </form>
    </Stack>
  );
}
