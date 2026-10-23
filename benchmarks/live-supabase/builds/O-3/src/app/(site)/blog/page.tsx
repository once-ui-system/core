import { Card, Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { formatDate, getPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "News and product updates from the Acme Notes team.",
  alternates: { canonical: "/blog" },
};

export default function Blog() {
  const posts = getPosts();
  return (
    <Column maxWidth="s" fillWidth gap="32" paddingY="64">
      <Heading variant="display-strong-s" as="h1">
        Blog
      </Heading>
      <Column gap="16">
        {posts.map((p) => (
          <Card key={p.slug} href={`/blog/${p.slug}`} fillWidth padding="24" radius="l" direction="column" gap="8">
            <Text variant="label-default-s" onBackground="neutral-weak">
              {formatDate(p.date)}
            </Text>
            <Heading variant="heading-strong-l" as="h2">
              {p.title}
            </Heading>
            <Text onBackground="neutral-weak">{p.summary}</Text>
          </Card>
        ))}
      </Column>
    </Column>
  );
}
