import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { getPosts } from "../../../lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "News and updates from the Acme Notes team.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  const posts = getPosts();
  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="64">
      <Column maxWidth="m" fillWidth gap="32">
        <Heading as="h1" variant="display-strong-s">
          Blog
        </Heading>
        {posts.map((p) => (
          <Column key={p.slug} as="article" gap="8" background="surface" border radius="l" padding="24">
            <Text variant="label-default-s" onBackground="neutral-weak">
              <time dateTime={p.date}>{p.date}</time>
            </Text>
            <Heading as="h2" variant="heading-strong-l">
              <a href={`/blog/${p.slug}`}>{p.title}</a>
            </Heading>
            <Text onBackground="neutral-weak">{p.summary}</Text>
          </Column>
        ))}
      </Column>
    </Column>
  );
}
