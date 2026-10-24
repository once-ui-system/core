import { Column, Heading, Meta, Text } from "@once-ui-system/core";
import { baseURL, landing, schema } from "@/resources";

export async function generateMetadata() {
  return Meta.generate({
    title: landing.terms.title,
    description: landing.terms.description,
    baseURL: baseURL,
    path: landing.terms.path,
    canonical: landing.terms.canonical,
    robots: landing.terms.robots,
    alternates: landing.terms.alternates,
  });
}

export default function Terms() {
  return (
    <Column fillWidth maxWidth="s" gap="24" paddingY="48">
      <Heading as="h1" variant="display-strong-s">
        Terms
      </Heading>
      <Text variant="body-default-m" onBackground="neutral-medium">
        By using {schema.name} you agree to use it for lawful purposes, to keep your sign-in details to yourself, and
        to keep the content your organization stores accurate. The service is provided as it is, and you can end your
        use at any time. Questions about these terms go to {schema.email}.
      </Text>
    </Column>
  );
}
