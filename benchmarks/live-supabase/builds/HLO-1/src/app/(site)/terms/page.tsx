import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { pageMetadata } from "../../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms",
  description: "The terms for using Acme Notes.",
  path: "/terms",
});

export default function Terms() {
  return (
    <Column horizontal="center" paddingX="16" paddingY="64">
      <Column maxWidth="s" gap="24">
        <Heading as="h1" variant="display-strong-xs">
          Terms
        </Heading>
        <Text as="p" variant="body-default-m" onBackground="neutral-medium">
          By using Acme Notes you agree to use it for lawful purposes, to keep your sign-in details private, and to keep the content you add to it within the rules of your organization. Owners and admins manage who belongs to an organization and what plan it is on.
        </Text>
        <Text as="p" variant="body-default-m" onBackground="neutral-medium">
          The service is provided as is. Paid plans renew monthly until cancelled, and each organization is billed for its members on the Team plan.
        </Text>
      </Column>
    </Column>
  );
}
