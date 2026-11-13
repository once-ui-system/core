import { Column, Heading, Text } from "@once-ui-system/core";
import { SettingsClient } from "./client";

export default function Page() {
  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="heading-strong-xl">
          Settings
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Manage your profile and how Lumen contacts you.
        </Text>
      </Column>
      <SettingsClient />
    </>
  );
}
