import { baseURL, landing } from "@/resources";
import { Column, Heading, Meta, Schema, Text } from "@once-ui-system/core";

export async function generateMetadata() {
  return Meta.generate({
    title: landing.terms.title,
    description: landing.terms.description,
    baseURL: baseURL,
    path: landing.terms.path,
    canonical: landing.terms.canonical,
    image: landing.terms.image,
    robots: landing.terms.robots,
    alternates: landing.terms.alternates,
  });
}

export default function Page() {
  return (
    <Column fillWidth maxWidth="s" gap="16" paddingX="l" s={{ paddingX: "16" }}>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={landing.terms.title}
        description={landing.terms.description}
        path={landing.terms.path}
      />
      <Heading as="h1" variant="display-strong-s">
        Terms
      </Heading>
      <Text variant="body-default-l" onBackground="neutral-medium">
        By using Acme Notes you agree to use it lawfully and to keep your account secure. Organization owners are responsible for the people they invite and the notes their organization stores. The service is provided as is, and plans and prices may change with notice.
      </Text>
    </Column>
  );
}
