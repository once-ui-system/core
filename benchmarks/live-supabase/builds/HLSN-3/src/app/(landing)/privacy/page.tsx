import { Column, Heading, Text } from "@once-ui-system/core";
import { privacy } from "@/content/legal";
import { landing } from "@/resources";
import { pageMetadata } from "@/lib/meta";

export function generateMetadata() {
  return pageMetadata({
    title: landing.privacy.title,
    description: landing.privacy.description,
    path: landing.privacy.path,
    canonical: landing.privacy.canonical,
    image: landing.privacy.image,
    robots: landing.privacy.robots,
    alternates: landing.privacy.alternates,
  });
}

export default function PrivacyPage() {
  return (
    <Column as="section" fillWidth maxWidth="s" gap="16">
      <Heading as="h1" variant="display-strong-s">
        {privacy.title}
      </Heading>
      <Text variant="body-default-l" onBackground="neutral-medium">
        {privacy.body}
      </Text>
    </Column>
  );
}
