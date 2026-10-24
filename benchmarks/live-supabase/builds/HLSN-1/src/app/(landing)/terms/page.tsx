import type { Metadata } from "next";
import { Column, Heading, Text } from "@once-ui-system/core";
import { baseURL, landing, schema } from "@/resources";

const seo = landing.terms;

export const metadata: Metadata = {
  metadataBase: new URL(baseURL),
  title: seo.title,
  description: seo.description,
  alternates: { canonical: seo.path },
  robots: seo.robots,
};

export default function TermsPage() {
  return (
    <Column as="section" fillWidth maxWidth="s" gap="24">
      <Heading as="h1" variant="display-strong-s">
        Terms of Use
      </Heading>
      <Text variant="body-default-m" onBackground="neutral-weak">
        By using {schema.name} you agree to use it lawfully and to keep your sign-in details to yourself. You
        are responsible for the notes your organization stores and for the people you invite. The service is
        provided as it is, without a guarantee of uptime, and either side may end the agreement by closing
        the account. Questions go to {schema.email}.
      </Text>
    </Column>
  );
}
