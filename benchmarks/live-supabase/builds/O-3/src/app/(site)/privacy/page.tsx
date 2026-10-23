import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "We collect only what we need to run Acme Notes: your email address, the notes your team writes, and basic usage data to keep the service working. We never sell your data, and you can ask us to delete your account and notes at any time.",
};

export default function Page() {
  return (
    <Column maxWidth="s" fillWidth gap="24" paddingY="64">
      <Heading variant="display-strong-s" as="h1">
        Privacy
      </Heading>
      <Text onBackground="neutral-weak">
        We collect only what we need to run Acme Notes: your email address, the notes your team writes, and basic usage data to keep the service working. We never sell your data, and you can ask us to delete your account and notes at any time.
      </Text>
    </Column>
  );
}
