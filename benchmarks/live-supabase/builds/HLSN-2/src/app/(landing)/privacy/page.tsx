import { Column, Heading, Meta, Text } from "@once-ui-system/core";
import { baseURL, landing, schema } from "@/resources";

export async function generateMetadata() {
  return Meta.generate({
    title: landing.privacy.title,
    description: landing.privacy.description,
    baseURL: baseURL,
    path: landing.privacy.path,
    canonical: landing.privacy.canonical,
    robots: landing.privacy.robots,
    alternates: landing.privacy.alternates,
  });
}

export default function Privacy() {
  return (
    <Column fillWidth maxWidth="s" gap="24" paddingY="48">
      <Heading as="h1" variant="display-strong-s">
        Privacy Policy
      </Heading>
      <Text variant="body-default-m" onBackground="neutral-medium">
        {schema.name} keeps the account details you give us (your email address and password, held by our
        authentication provider) and the notes, organizations and memberships you create. We use them only to run
        the service, never to sell them. Questions about your data go to {schema.email}.
      </Text>
    </Column>
  );
}
