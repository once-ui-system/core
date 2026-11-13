import { Column, Heading, Text } from "@once-ui-system/core";
import { SettingsForm } from "@/components/lumen/SettingsForm";

export default function SettingsPage() {
  return (
    <Column gap="24" fillWidth maxWidth="m">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Settings
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Manage your profile and how Lumen keeps you informed.
        </Text>
      </Column>
      <SettingsForm />
    </Column>
  );
}
