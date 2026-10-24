import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { brand } from "@/resources/once-ui.config";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${brand.name} handles account and workspace information.`,
};

export default function Privacy() {
  return (
    <Column maxWidth="s" paddingX="24" paddingY="64" gap="24">
      <Heading as="h1" variant="display-strong-m">
        Privacy
      </Heading>
      <Text as="p" variant="body-default-l" onBackground="neutral-medium">
        {brand.name} keeps the details needed to run your account: your email address, the organizations you create
        or join, and the notes your team writes. We use them to sign you in, to show notes only to the people your
        organization allows, and to send account emails such as confirmations and password resets. We use them for no
        other purpose.
      </Text>
    </Column>
  );
}
