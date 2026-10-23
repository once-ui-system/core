import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "We collect only what we need to run Acme Notes: your account email and the notes your team writes. We never sell your data, and you can ask us to delete your account and its notes at any time.",
  alternates: { canonical: "/privacy" },
};

export default function Page() {
  return (
    <Column fillWidth maxWidth="m" gap="16">
      <Heading as="h1" variant="display-strong-s">
        Privacy
      </Heading>
      <Text onBackground="neutral-weak">
        We collect only what we need to run Acme Notes: your account email and the notes your team writes. We never sell your data, and you can ask us to delete your account and its notes at any time.
      </Text>
    </Column>
  );
}
