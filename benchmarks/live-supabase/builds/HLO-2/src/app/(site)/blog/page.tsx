import { Card, Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import { brand, seo } from "@/resources/once-ui.config";

export const metadata: Metadata = {
  title: "Blog",
  description: `Product news and notes from the ${brand.name} team.`,
  openGraph: {
    title: `Blog · ${brand.name}`,
    description: `Product news and notes from the ${brand.name} team.`,
    url: `${seo.url}/blog`,
    siteName: seo.siteName,
    locale: seo.locale,
    type: "website",
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();
  return (
    <Column maxWidth="m" paddingX="24" paddingY="64" gap="32">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-m">
          Blog
        </Heading>
        <Text onBackground="neutral-medium">Product news and notes from the {brand.name} team.</Text>
      </Column>
      <Column gap="16">
        {posts.map((post) => (
          <Card key={post.slug} href={`/blog/${post.slug}`} fillWidth radius="l">
            <Column padding="24" gap="8" fillWidth>
              <Text variant="label-default-s" onBackground="neutral-weak">
                {formatDate(post.date)}
              </Text>
              <Heading as="h2" variant="heading-strong-l">
                {post.title}
              </Heading>
              <Text as="p" onBackground="neutral-medium">
                {post.summary}
              </Text>
            </Column>
          </Card>
        ))}
      </Column>
    </Column>
  );
}
