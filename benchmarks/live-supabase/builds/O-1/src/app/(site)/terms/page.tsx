import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "By using Acme Notes you agree to use it lawfully and to keep your account secure. Your team owns its notes; we provide the service as it is and may update these terms with notice.",
  alternates: { canonical: "/terms" },
};

export default function Page() {
  return (
    <Column fillWidth maxWidth="m" gap="16">
      <Heading as="h1" variant="display-strong-s">
        Terms
      </Heading>
      <Text onBackground="neutral-weak">
        By using Acme Notes you agree to use it lawfully and to keep your account secure. Your team owns its notes; we provide the service as it is and may update these terms with notice.
      </Text>
    </Column>
  );
}
