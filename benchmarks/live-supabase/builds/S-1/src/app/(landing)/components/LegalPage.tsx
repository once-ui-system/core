import { baseURL, landing } from "@/resources";
import { Column, Heading, Meta, Schema, Text } from "@once-ui-system/core";

type Page = "privacy" | "terms";

export function legalMetadata(page: Page) {
  const seo = landing[page];
  return Meta.generate({
    title: seo.title,
    description: seo.description,
    baseURL,
    path: seo.path,
    canonical: seo.canonical,
    image: seo.image,
    robots: seo.robots,
    alternates: seo.alternates,
  });
}

export function LegalPage({ page, heading, text }: { page: Page; heading: string; text: string }) {
  const seo = landing[page];
  return (
    <Column maxWidth="s" gap="l" paddingX="l" s={{ paddingX: "16" }}>
      <Schema as="webPage" baseURL={baseURL} title={seo.title} description={seo.description} path={seo.path} />
      <Heading as="h1" variant="display-strong-xs">
        {heading}
      </Heading>
      <Text variant="body-default-l" onBackground="neutral-medium">
        {text}
      </Text>
    </Column>
  );
}
