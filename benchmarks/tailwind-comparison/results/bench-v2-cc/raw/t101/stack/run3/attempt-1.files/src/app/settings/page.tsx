import { Column, Heading, Text } from "@once-ui-system/core";
import { SettingsForm } from "@/components/SettingsForm";

export const metadata = { title: "Settings" };

export default function Page() {
  return (
    <>
      <Column gap="4">
        <Heading as="h1" variant="heading-strong-xl">
          Settings
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Your profile, workspace and notification preferences.
        </Text>
      </Column>
      <SettingsForm />
    </>
  );
}
