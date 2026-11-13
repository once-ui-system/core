import type { Metadata } from "next";
import { Stack, Text, Title } from "@mantine/core";
import { SettingsForm } from "@/components/SettingsForm";

export const metadata: Metadata = { title: "Settings · Lumen" };

export default function SettingsPage() {
  return (
    <Stack gap="lg">
      <div>
        <Title order={1} size="h2">
          Settings
        </Title>
        <Text c="dimmed" mt={4}>
          Manage your profile and how Lumen keeps you informed.
        </Text>
      </div>
      <SettingsForm />
    </Stack>
  );
}
