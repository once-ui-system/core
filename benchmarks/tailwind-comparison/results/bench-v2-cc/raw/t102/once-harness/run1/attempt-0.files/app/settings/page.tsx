import { Column, Heading, Text } from "@once-ui-system/core";
import { SettingsForm } from "@/components/SettingsForm";

export default function SettingsPage() {
  return (
    <Column gap="32" maxWidth="m">
      <Column gap="8">
        <Heading as="h1" textVariant="display-strong-xs">
          Settings
        </Heading>
        <Text onBackground="neutral-weak" textVariant="body-default-l">
          Manage your profile and how Lumen keeps you in the loop.
        </Text>
      </Column>
      <SettingsForm />
    </Column>
  );
}
