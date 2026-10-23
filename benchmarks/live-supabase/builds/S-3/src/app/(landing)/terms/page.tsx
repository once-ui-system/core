import { baseURL, landing } from "@/resources";
import { Column, Heading, Meta, Schema, Text } from "@once-ui-system/core";

const page = landing.terms;

export async function generateMetadata() {
  return Meta.generate({
    title: page.title,
    description: page.description,
    baseURL: baseURL,
    path: page.path,
    canonical: page.canonical,
    image: page.image,
    robots: page.robots,
    alternates: page.alternates,
  });
}

export default function Page() {
  return (
    <Column maxWidth="s" gap="l" paddingX="l" s={{ paddingX: "16" }}>
      <Schema as="webPage" baseURL={baseURL} title={page.title} description={page.description} path={page.path} />
      <Heading as="h1" variant="display-strong-xs">
        Terms
      </Heading>
      <Text variant="body-default-m" onBackground="neutral-medium">
        By using Acme Notes you agree to use it lawfully and to keep your credentials safe. Your notes belong to you and your organization. The service is provided as is, and plans and prices may change with notice.
      </Text>
    </Column>
  );
}
