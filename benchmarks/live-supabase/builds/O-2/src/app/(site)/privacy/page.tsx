import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy for Acme Notes.",
};

export default function Page() {
  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="64">
      <Column maxWidth="s" fillWidth gap="24">
        <Heading as="h1" variant="display-strong-s">Privacy</Heading>
        <Text variant="body-default-l">We collect only what we need to run Acme Notes: your email address, the notes your team writes and basic usage data. We never sell your data, and you can ask us to delete your account and everything in it at any time.</Text>
      </Column>
    </Column>
  );
}
