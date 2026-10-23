import { baseURL, landing } from "@/resources";
import { Column, Heading, Meta, Schema, Text } from "@once-ui-system/core";

export async function generateMetadata() {
  return Meta.generate({
    title: landing.privacy.title,
    description: landing.privacy.description,
    baseURL: baseURL,
    path: landing.privacy.path,
    canonical: landing.privacy.canonical,
    image: landing.privacy.image,
    robots: landing.privacy.robots,
    alternates: landing.privacy.alternates,
  });
}

export default function Page() {
  return (
    <Column fillWidth maxWidth="s" gap="16" paddingX="l" s={{ paddingX: "16" }}>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={landing.privacy.title}
        description={landing.privacy.description}
        path={landing.privacy.path}
      />
      <Heading as="h1" variant="display-strong-s">
        Privacy
      </Heading>
      <Text variant="body-default-l" onBackground="neutral-medium">
        Acme Notes stores the notes and account details you give us only to run the service for you and your team. We do not sell your data. Members of an organization can see what that organization shares, and nobody outside it can. You can ask us to delete your account and data at any time.
      </Text>
    </Column>
  );
}
