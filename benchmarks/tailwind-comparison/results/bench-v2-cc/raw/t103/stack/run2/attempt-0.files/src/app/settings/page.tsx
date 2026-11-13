import { Column, Heading, Text } from "@once-ui-system/core";
import { SettingsForm } from "./SettingsForm";

export default function Page() {
  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="heading-strong-xl">
          Settings
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Manage your profile and notifications.
        </Text>
      </Column>
      <SettingsForm />
    </>
  );
}
