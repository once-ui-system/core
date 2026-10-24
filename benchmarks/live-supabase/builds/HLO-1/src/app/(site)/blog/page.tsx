import { Card, Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { getAllPosts } from "../../../lib/blog";
import { pageMetadata } from "../../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description: "News and notes from the Acme Notes team.",
  path: "/blog",
});

export default function BlogIndex() {
  const posts = getAllPosts();
  return (
    <Column horizontal="center" fillWidth paddingX="16" paddingY="64">
      <Column maxWidth="s" gap="24">
        <Heading as="h1" variant="display-strong-s">
          Blog
        </Heading>
        {posts.map((post) => (
          <Card key={post.slug} href={`/blog/${post.slug}`} direction="column" gap="8" padding="24" radius="l">
            <Text variant="label-default-s" onBackground="neutral-weak">
              {post.date}
            </Text>
            <Heading as="h2" variant="heading-strong-m">
              {post.title}
            </Heading>
            <Text as="p" variant="body-default-m" onBackground="neutral-medium">
              {post.summary}
            </Text>
          </Card>
        ))}
      </Column>
    </Column>
  );
}
