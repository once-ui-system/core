import { Column, Heading, SmartLink, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { formatDate, getPosts } from "../../../lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "News and updates from the Acme Notes team.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  const posts = getPosts();
  return (
    <Column fillWidth maxWidth="m" gap="32">
      <Heading as="h1" variant="display-strong-s">
        Blog
      </Heading>
      {posts.map((p) => (
        <Column key={p.slug} as="article" background="surface" border radius="l" padding="24" gap="8">
          <Text variant="label-default-s" onBackground="neutral-weak">
            {formatDate(p.date)}
          </Text>
          <Heading as="h2" variant="heading-strong-l">
            <SmartLink href={`/blog/${p.slug}`}>{p.title}</SmartLink>
          </Heading>
          <Text onBackground="neutral-weak">{p.summary}</Text>
        </Column>
      ))}
    </Column>
  );
}
