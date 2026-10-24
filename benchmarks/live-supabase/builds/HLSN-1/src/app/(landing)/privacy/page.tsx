import type { Metadata } from "next";
import { Column, Heading, Text } from "@once-ui-system/core";
import { baseURL, landing, schema } from "@/resources";

const seo = landing.privacy;

export const metadata: Metadata = {
  metadataBase: new URL(baseURL),
  title: seo.title,
  description: seo.description,
  alternates: { canonical: seo.path },
  robots: seo.robots,
};

export default function PrivacyPage() {
  return (
    <Column as="section" fillWidth maxWidth="s" gap="24">
      <Heading as="h1" variant="display-strong-s">
        Privacy Policy
      </Heading>
      <Text variant="body-default-m" onBackground="neutral-weak">
        {schema.name} keeps the email address you sign up with, the organizations you create or join, and
        the notes your team writes. We use them only to run the service: to sign you in, show your
        organizations and members, and bill an organization that upgrades. We do not sell personal
        information. Questions about your data go to {schema.email}.
      </Text>
    </Column>
  );
}
