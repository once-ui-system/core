import { baseURL, landing } from "@/resources";
import { Column, Heading, Meta, Schema, Text } from "@once-ui-system/core";

const page = landing.privacy;

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
        Privacy
      </Heading>
      <Text variant="body-default-m" onBackground="neutral-medium">
        Acme Notes stores the notes you write and the account details you give us, such as your email address, only to run the service for you and your team. We do not sell your data. You can ask us to delete your account and its notes at any time.
      </Text>
    </Column>
  );
}
