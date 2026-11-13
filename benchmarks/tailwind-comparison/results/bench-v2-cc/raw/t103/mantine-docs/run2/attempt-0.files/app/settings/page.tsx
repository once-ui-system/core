"use client";

import {
  Button,
  Card,
  Group,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { PageHeader } from "@/components/PageHeader";
import { user } from "@/lib/data";

export default function SettingsPage() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const form = useForm({
    initialValues: {
      name: user.name,
      email: user.email,
      digest: true,
      mentions: true,
      releases: false,
    },
    validate: {
      name: (v) => (v.trim().length < 2 ? "Enter your full name" : null),
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : "Enter a valid email address"),
    },
  });

  return (
    <Stack gap="lg">
      <PageHeader title="Settings" description="Manage your profile, notifications and appearance." />
      <form
        onSubmit={form.onSubmit(() =>
          notifications.show({
            title: "Settings saved",
            message: "Your changes have been applied.",
            color: "brand",
          }),
        )}
        noValidate
      >
        <Stack gap="md">
          <Card component="section" aria-labelledby="profile-heading">
            <Title order={2} id="profile-heading" size="h3" mb="sm">
              Profile
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput label="Full name" {...form.getInputProps("name")} />
              <TextInput label="Email" type="email" {...form.getInputProps("email")} />
              <TextInput label="Role" value={user.role} disabled readOnly />
            </SimpleGrid>
          </Card>

          <Card component="section" aria-labelledby="notify-heading">
            <Title order={2} id="notify-heading" size="h3" mb="sm">
              Notifications
            </Title>
            <Stack gap="sm">
              <Switch
                label="Weekly digest"
                description="A Monday summary of issues opened and closed."
                {...form.getInputProps("digest", { type: "checkbox" })}
              />
              <Switch
                label="Mentions"
                description="Email me when someone mentions me on an issue."
                {...form.getInputProps("mentions", { type: "checkbox" })}
              />
              <Switch
                label="Release announcements"
                description="Product updates from the Lumen team."
                {...form.getInputProps("releases", { type: "checkbox" })}
              />
            </Stack>
          </Card>

          <Card component="section" aria-labelledby="appearance-heading">
            <Title order={2} id="appearance-heading" size="h3" mb="sm">
              Appearance
            </Title>
            <Text size="sm" c="dimmed" mb="xs" id="scheme-label">
              Colour scheme
            </Text>
            <SegmentedControl
              aria-labelledby="scheme-label"
              value={colorScheme}
              onChange={(v) => setColorScheme(v as "light" | "dark" | "auto")}
              data={[
                { label: "Dark", value: "dark" },
                { label: "Light", value: "light" },
                { label: "System", value: "auto" },
              ]}
            />
          </Card>

          <Group justify="flex-end">
            <Button type="submit">Save changes</Button>
          </Group>
        </Stack>
      </form>
    </Stack>
  );
}
