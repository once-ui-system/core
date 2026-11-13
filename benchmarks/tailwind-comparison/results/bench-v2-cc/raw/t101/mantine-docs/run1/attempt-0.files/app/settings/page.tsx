"use client";

import { useState, type FormEvent } from "react";
import {
  Button,
  Card,
  Group,
  SegmentedControl,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { user } from "@/lib/data";

export default function SettingsPage() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [mentions, setMentions] = useState(true);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    notifications.show({ title: "Settings saved", message: "Your changes have been applied." });
  }

  return (
    <Stack gap="md" maw={640}>
      <div>
        <Title order={1}>Settings</Title>
        <Text c="dimmed" fz="sm">
          Manage your profile and preferences.
        </Text>
      </div>

      <form onSubmit={onSubmit} aria-label="Settings">
        <Stack gap="md">
          <Card>
            <Title order={3} mb="xs">
              Profile
            </Title>
            <Stack gap="xs">
              <TextInput label="Name" value={name} onChange={(e) => setName(e.currentTarget.value)} required />
              <TextInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                required
              />
              <TextInput label="Role" value={user.role} readOnly description="Only another owner can change this." />
            </Stack>
          </Card>

          <Card>
            <Title order={3} mb="xs">
              Notifications
            </Title>
            <Stack gap="xs">
              <Switch
                label="Weekly digest"
                description="A summary of issues opened and closed."
                checked={digest}
                onChange={(e) => setDigest(e.currentTarget.checked)}
              />
              <Switch
                label="Mentions"
                description="Email me when someone mentions me."
                checked={mentions}
                onChange={(e) => setMentions(e.currentTarget.checked)}
              />
            </Stack>
          </Card>

          <Card>
            <Title order={3} mb="xs">
              Appearance
            </Title>
            <SegmentedControl
              aria-label="Colour scheme"
              data={[
                { label: "Light", value: "light" },
                { label: "Dark", value: "dark" },
                { label: "Auto", value: "auto" },
              ]}
              value={colorScheme}
              onChange={(value) => setColorScheme(value as "light" | "dark" | "auto")}
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
