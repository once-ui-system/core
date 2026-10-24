import { Column, Heading, Text } from "@once-ui-system/core";
import { terms } from "@/content/legal";
import { landing } from "@/resources";
import { pageMetadata } from "@/lib/meta";

export function generateMetadata() {
  return pageMetadata({
    title: landing.terms.title,
    description: landing.terms.description,
    path: landing.terms.path,
    canonical: landing.terms.canonical,
    image: landing.terms.image,
    robots: landing.terms.robots,
    alternates: landing.terms.alternates,
  });
}

export default function TermsPage() {
  return (
    <Column as="section" fillWidth maxWidth="s" gap="16">
      <Heading as="h1" variant="display-strong-s">
        {terms.title}
      </Heading>
      <Text variant="body-default-l" onBackground="neutral-medium">
        {terms.body}
      </Text>
    </Column>
  );
}
