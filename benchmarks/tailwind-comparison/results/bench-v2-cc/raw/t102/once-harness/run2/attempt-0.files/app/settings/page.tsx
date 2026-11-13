import type { Metadata } from "next";
import { Column, Heading, Text } from "@once-ui-system/core";
import { SettingsForm } from "../../components/SettingsForm";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <Column fillWidth gap="32">
      <Column gap="8">
        <Heading as="h1" textVariant="display-strong-xs">
          Settings
        </Heading>
        <Text textVariant="body-default-l" onBackground="neutral-weak">
          Manage your profile and how Lumen keeps you in the loop.
        </Text>
      </Column>
      <SettingsForm />
    </Column>
  );
}
