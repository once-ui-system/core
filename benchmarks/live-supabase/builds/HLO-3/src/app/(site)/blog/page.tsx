import { Button, Column, Heading, SmartLink, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { getPosts } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Blog", "News and notes from the Acme Notes team.", "/blog");

export default async function BlogIndex() {
  const posts = await getPosts();
  return (
    <Column gap="24" as="section">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-m">
          Blog
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          News and notes from the team.
        </Text>
      </Column>
      <Column gap="16">
        {posts.map((post) => (
          <Column key={post.slug} background="surface" border radius="l" padding="24" gap="8">
            <Text variant="label-default-s" onBackground="neutral-weak">
              <time dateTime={post.date}>{post.date}</time>
            </Text>
            <Heading as="h2" variant="heading-strong-m">
              <SmartLink href={`/blog/${post.slug}`}>{post.title}</SmartLink>
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              {post.summary}
            </Text>
            <Button href={`/blog/${post.slug}`} variant="link" label="Read the post" size="s" />
          </Column>
        ))}
      </Column>
    </Column>
  );
}
