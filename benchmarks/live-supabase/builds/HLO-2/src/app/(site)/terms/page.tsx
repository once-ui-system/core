import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { brand } from "@/resources/once-ui.config";

export const metadata: Metadata = {
  title: "Terms",
  description: `The terms for using ${brand.name}.`,
};

export default function Terms() {
  return (
    <Column maxWidth="s" paddingX="24" paddingY="64" gap="24">
      <Heading as="h1" variant="display-strong-m">
        Terms
      </Heading>
      <Text as="p" variant="body-default-l" onBackground="neutral-medium">
        By using {brand.name} you agree to use it lawfully and to keep your sign-in details to yourself. Owners and
        admins are responsible for the people they invite to an organization. Paid plans renew each month until they
        are cancelled. We may update these terms; the current version is always published on this page.
      </Text>
    </Column>
  );
}
