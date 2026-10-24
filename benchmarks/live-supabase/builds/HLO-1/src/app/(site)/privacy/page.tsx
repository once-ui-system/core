import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { pageMetadata } from "../../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description: "How Acme Notes handles the account and notes data you give us.",
  path: "/privacy",
});

export default function Privacy() {
  return (
    <Column horizontal="center" paddingX="16" paddingY="64">
      <Column maxWidth="s" gap="24">
        <Heading as="h1" variant="display-strong-xs">
          Privacy
        </Heading>
        <Text as="p" variant="body-default-m" onBackground="neutral-medium">
          Acme Notes keeps the email address you use to sign in, the organizations you belong to, and the notes your team writes. We use this information only to run the service: to sign you in, to show your team its notes, and to bill organizations that choose the Team plan. We do not sell it, and we share it only with the providers that run the service for us.
        </Text>
        <Text as="p" variant="body-default-m" onBackground="neutral-medium">
          You can ask us to export or delete your account by writing to the contact address on the site.
        </Text>
      </Column>
    </Column>
  );
}
