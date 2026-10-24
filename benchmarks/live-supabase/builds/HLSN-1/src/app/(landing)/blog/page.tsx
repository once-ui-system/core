import type { Metadata } from "next";
import { Column, Heading, SmartLink, Text } from "@once-ui-system/core";
import { getPosts } from "@/lib/blog";
import { baseURL, landing } from "@/resources";

const seo = landing.blog;

export const metadata: Metadata = {
  metadataBase: new URL(baseURL),
  title: seo.title,
  description: seo.description,
  alternates: { canonical: seo.path },
  openGraph: { title: seo.title, description: seo.description, url: seo.path, images: [seo.image] },
};

export default function BlogIndex() {
  const posts = getPosts();

  return (
    <Column as="section" fillWidth maxWidth="s" gap="32">
      <Heading as="h1" variant="display-strong-s">
        Blog
      </Heading>
      {posts.map((post) => (
        <Column key={post.slug} gap="8">
          <Text variant="label-default-s" onBackground="neutral-weak">
            {post.publishedAt}
          </Text>
          <SmartLink href={`/blog/${post.slug}`} unstyled>
            <Heading as="h2" variant="heading-strong-m">
              {post.title}
            </Heading>
          </SmartLink>
          <Text variant="body-default-m" onBackground="neutral-weak">
            {post.summary}
          </Text>
        </Column>
      ))}
    </Column>
  );
}
