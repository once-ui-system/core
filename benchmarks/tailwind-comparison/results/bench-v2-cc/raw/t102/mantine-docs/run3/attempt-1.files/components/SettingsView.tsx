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
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { user } from "@/lib/data";
import { PageHeader } from "./PageHeader";

export function SettingsView() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  const form = useForm({
    initialValues: {
      name: user.name,
      email: user.email,
      weekly: true,
      mentions: true,
      releases: false,
    },
    validate: {
      name: (v) => (v.trim().length < 2 ? "Enter your name" : null),
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : "Enter a valid email address"),
    },
  });

  const save = form.onSubmit((values) => {
    form.resetDirty(values);
    notifications.show({ title: "Settings saved", message: "Your changes are live.", color: "teal" });
  });

  return (
    <form onSubmit={save} noValidate>
      <PageHeader title="Settings" description="Tune your profile, notifications and how Lumen looks for you." />

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" mb="lg">
        <Card component="section" aria-labelledby="profile-heading">
          <Text id="profile-heading" ff="heading" fw={700} fz="xl" mb="lg">
            Profile
          </Text>
          <Stack gap="md">
            <TextInput label="Full name" autoComplete="name" {...form.getInputProps("name")} />
            <TextInput label="Email" type="email" autoComplete="email" {...form.getInputProps("email")} />
            <TextInput label="Role" value={user.role} readOnly description="Only another owner can change this." />
          </Stack>
        </Card>

        <Stack gap="lg">
          <Card component="section" aria-labelledby="notify-heading">
            <Text id="notify-heading" ff="heading" fw={700} fz="xl" mb="lg">
              Notifications
            </Text>
            <Stack gap="lg">
              <Switch
                size="md"
                label="Weekly summary"
                description="A Monday email with what moved across your projects."
                {...form.getInputProps("weekly", { type: "checkbox" })}
              />
              <Switch
                size="md"
                label="Mentions"
                description="Tell me when a teammate mentions me on an issue."
                {...form.getInputProps("mentions", { type: "checkbox" })}
              />
              <Switch
                size="md"
                label="Product news"
                description="Occasional notes about new Lumen features."
                {...form.getInputProps("releases", { type: "checkbox" })}
              />
            </Stack>
          </Card>

          <Card component="section" aria-labelledby="appearance-heading">
            <Text id="appearance-heading" ff="heading" fw={700} fz="xl" mb="lg">
              Appearance
            </Text>
            <SegmentedControl
              fullWidth
              size="md"
              aria-label="Color scheme"
              value={colorScheme}
              onChange={(v) => setColorScheme(v as "light" | "dark" | "auto")}
              data={[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
                { value: "auto", label: "Match system" },
              ]}
            />
          </Card>
        </Stack>
      </SimpleGrid>

      <Group justify="flex-end">
        <Button variant="default" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button type="submit">Save changes</Button>
      </Group>
    </form>
  );
}
