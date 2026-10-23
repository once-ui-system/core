import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "By using Acme Notes you agree to use it lawfully and to keep your sign-in details safe. Your team owns its notes. We provide the service as is, and we may update these terms with notice as the product changes.",
};

export default function Page() {
  return (
    <Column maxWidth="s" fillWidth gap="24" paddingY="64">
      <Heading variant="display-strong-s" as="h1">
        Terms
      </Heading>
      <Text onBackground="neutral-weak">
        By using Acme Notes you agree to use it lawfully and to keep your sign-in details safe. Your team owns its notes. We provide the service as is, and we may update these terms with notice as the product changes.
      </Text>
    </Column>
  );
}
