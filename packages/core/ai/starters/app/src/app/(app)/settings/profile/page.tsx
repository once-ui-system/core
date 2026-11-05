import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile" };

// A page inside the Settings group of src/resources/app.ts.
export default function ProfilePage() {
  return (
    <Column fillWidth gap="24">
      <Column gap="8">
        <Heading as="h1" textVariant="heading-strong-l">
          Profile
        </Heading>
        <Text textVariant="body-default-m" onBackground="neutral-weak">
          Your name and email.
        </Text>
      </Column>
    </Column>
  );
}
