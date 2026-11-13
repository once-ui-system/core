import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { SettingsForm } from "../../components/SettingsForm";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <Column gap="16" maxWidth="m">
      <Column gap="4">
        <Heading as="h1" textVariant="display-strong-xs">
          Settings
        </Heading>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Your profile and notification preferences for this workspace.
        </Text>
      </Column>
      <SettingsForm />
    </Column>
  );
}
