import { Column, Heading, Text } from "@once-ui-system/core";
import { SettingsForm } from "./SettingsForm";

export default function SettingsPage() {
  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Settings
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Your profile and notification preferences.
        </Text>
      </Column>
      <SettingsForm />
    </>
  );
}
