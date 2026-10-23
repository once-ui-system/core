import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms for Acme Notes.",
};

export default function Page() {
  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="64">
      <Column maxWidth="s" fillWidth gap="24">
        <Heading as="h1" variant="display-strong-s">Terms</Heading>
        <Text variant="body-default-l">By using Acme Notes you agree to use it lawfully and to keep your account secure. Your team owns its notes. We provide the service as is and may update these terms; continued use means you accept the changes.</Text>
      </Column>
    </Column>
  );
}
